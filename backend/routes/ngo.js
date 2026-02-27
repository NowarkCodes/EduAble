const express = require('express');
const { Storage } = require('@google-cloud/storage');
const User = require('../models/User');
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

// Endpoint to list uploaded videos from Google Cloud Storage
router.get('/videos', async (req, res) => {
  try {
    const [files] = await storage.bucket(uploadBucket).getFiles({ prefix: 'uploads/videos/' });
    
    const videos = files.map(file => {
      // Create a direct URL to the public file or use Signed URLs if the bucket is fully private
      // For this hackathon, we'll assume they can be accessed directly or the user will manage access
      return {
        name: file.name.replace('uploads/videos/', ''),
        url: `https://storage.googleapis.com/${uploadBucket}/${encodeURI(file.name)}`,
        size: file.metadata.size,
        updated: file.metadata.updated,
      };
    }).filter(v => v.name !== ''); // Filter out the prefix folder itself if it exists

    res.json({ videos });
  } catch (err) {
    console.error('[ngo/videos] GCS Error:', err);
    res.status(500).json({ error: 'Failed to fetch videos from Google Cloud Storage.' });
  }
});

module.exports = router;
