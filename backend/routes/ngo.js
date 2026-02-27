const express = require('express');
const { Storage } = require('@google-cloud/storage');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { getStats, updateStats } = require('../controllers/ngoController');

const router = express.Router();

// Initialize Google Cloud Storage correctly using Environment Variables
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    // Replace literal "\n" in string with actual newline characters expected by RSA keys
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
});

const uploadBucket = process.env.GCS_BUCKET_NAME;

// Public stat read (NGO dashboard widget, landing page counter, etc.)
router.get('/stats', getStats);

// Only admin/ngo users can mutate NGO stats
router.patch('/stats', authMiddleware, requireRole('admin', 'ngo'), updateStats);

// Endpoint to generate Secure Presigned URLs for direct browser-to-cloud uploads
router.post('/upload-urls', async (req, res) => {
  try {
    const { videoFileName, audioFileName, videoType, audioType } = req.body;

    if (!videoFileName || !audioFileName) {
      return res.status(400).json({ error: 'Missing filenames.' });
    }

    // Give the files unique un-guessable IDs in the bucket to prevent overwriting
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const cloudVideoName = `uploads/videos/${uniquePrefix}-${videoFileName}`;
    const cloudAudioName = `uploads/audio/${uniquePrefix}-${audioFileName}`;

    const config = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      extensionHeaders: req.body.duration ? { 'x-goog-meta-duration': String(req.body.duration) } : undefined,
    };

    // Generate secure upload URLs directly from Google
    const [videoUrl] = await storage.bucket(uploadBucket).file(cloudVideoName).getSignedUrl({
      ...config,
      contentType: videoType || 'video/mp4',
    });

    const [audioUrl] = await storage.bucket(uploadBucket).file(cloudAudioName).getSignedUrl({
      ...config,
      contentType: audioType || 'audio/mp3',
    });

    res.json({
      videoUrl,
      audioUrl,
      cloudVideoName,
      cloudAudioName
    });

  } catch (err) {
    console.error('[ngo/upload-urls] GCS Error:', err);
    res.status(500).json({ error: 'Failed to generate secure upload links. Check GCS credentials.' });
  }
});

// Shared helper: generate a signed read URL for a GCS file path
async function getSignedReadUrl(filePath) {
  const [url] = await storage.bucket(uploadBucket).file(filePath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
}

// Endpoint to list uploaded videos with signed read URLs (for NGO library + course creation)
router.get('/videos', async (req, res) => {
  try {
    const [files] = await storage.bucket(uploadBucket).getFiles({ prefix: 'uploads/videos/' });

    const videoPromises = files
      .filter(file => file.name !== 'uploads/videos/') // skip folder entry
      .map(async file => {
        const signedUrl = await getSignedReadUrl(file.name);
        return {
          name: file.name.replace('uploads/videos/', ''),
          cloudPath: file.name,
          url: signedUrl, // signed, playable URL
          size: file.metadata.size,
          updated: file.metadata.updated,
          duration: file.metadata.metadata?.duration ? parseInt(file.metadata.metadata.duration) : 0,
        };
      });

    const videos = await Promise.all(videoPromises);
    res.json({ videos });
  } catch (err) {
    console.error('[ngo/videos] GCS Error:', err);
    res.status(500).json({ error: 'Failed to fetch videos from Google Cloud Storage.' });
  }
});

// Endpoint to get a fresh signed read URL for a single video (used by the course player)
// GET /api/ngo/video-url?path=uploads/videos/xxx-filename.mp4
router.get('/video-url', authMiddleware, async (req, res) => {
  try {
    const rawPath = req.query.path;
    if (!rawPath) {
      return res.status(400).json({ error: 'Missing path query parameter.' });
    }
    // Decode any %20 etc. so GCS receives the real file name (with spaces, etc.)
    const filePath = decodeURIComponent(rawPath);

    // Validate path starts with uploads/ to prevent arbitrary access
    if (!filePath.startsWith('uploads/')) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    console.log(`[ngo/video-url] Generating signed URL for: ${filePath}`);
    const signedUrl = await getSignedReadUrl(filePath);
    res.json({ url: signedUrl });
  } catch (err) {
    console.error('[ngo/video-url] GCS Error:', err.message);
    res.status(500).json({ error: 'Failed to generate playback URL.', detail: err.message });
  }
});



// Endpoint to create a new Course from the NGO Dashboard
router.post('/courses', authMiddleware, requireRole('admin', 'ngo'), async (req, res) => {
  try {
    const { title, description, category, instructorName, thumbnail, accessibilityTags, level, videos } = req.body;

    if (!title || !description || !category || !videos || videos.length === 0) {
      return res.status(400).json({ error: 'Title, description, category, and at least one video are required.' });
    }

    // Attempt to guess total duration directly or default to 0
    let totalDuration = 0;
    videos.forEach(v => {
      // Just a placeholder duration if it's not provided by frontend (videos from GCS might not have direct duration meta easily available unless probed by ffmpeg beforehand)
      totalDuration += (v.duration || 0);
    });

    const newCourse = await Course.create({
      title,
      description,
      category,
      instructorName: instructorName || req.user.name || 'EduAble Instructor',
      thumbnail: thumbnail || null,
      accessibilityTags: accessibilityTags || ['caption-supported', 'screen-reader-friendly'],
      level: level || 'Beginner',
      totalLessons: videos.length,
      totalDuration: Math.round(totalDuration / 60), // in minutes
      isPublished: true, 
    });
    // Create a lesson for each video selected.
    // IMPORTANT: v.url may be a signed URL (expires in 1hr). Strip the
    // signature query params so we store only the permanent GCS base URL.
    // The course player calls /api/ngo/video-url to get a fresh signed READ URL.
    const toPermanentUrl = (url) => {
      try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
      } catch {
        return url;
      }
    };

    const lessonDocs = videos.map((v, index) => ({
      courseId: newCourse._id,
      title: v.name || `Lesson ${index + 1}`,
      videoUrl: v.cloudPath
        ? `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${v.cloudPath}`
        : toPermanentUrl(v.url),
      order: index + 1,
      duration: v.duration || 0,
      transcript: '',
      simplifiedText: '',
    }));

    await Lesson.insertMany(lessonDocs);


    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
    console.error('[ngo/courses] Creation Error:', err);
    res.status(500).json({ error: 'Failed to create course. ' + err.message });
  }
});

module.exports = router;
