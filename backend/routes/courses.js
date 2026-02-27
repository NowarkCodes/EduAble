const express = require('express');
const authMiddleware = require('../middleware/auth');
const accessibilityMiddleware = require('../middleware/accessibility');
const {
  listCourses,
  getCourse,
  getProgress,
  enrollCourse,
  completeLesson,
} = require('../controllers/coursesController');
const Course = require('../models/Course'); // Added for the explore route

const router = express.Router();

// All course routes require authentication
router.use(authMiddleware);

// Order matters: /progress must come before /:id to avoid being caught as an ID param
router.get('/progress', getProgress);
router.get('/', listCourses);

/* ────────────────────────────────────────────────────────────
   GET /api/courses/explore (protected)
   Returns real data for Explore Courses directory.
──────────────────────────────────────────────────────────── */
router.get('/explore', async (req, res) => {
  try {
    const exploreCourses = await Course.aggregate([
      { $match: { isPublished: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: 'courseId',
          as: 'lessons'
        }
      }
    ]);

    const courses = exploreCourses.map(c => ({
        id: c._id.toString(),
        title: c.title,
        instructor: c.instructorName || 'EduAble Instructor',
        category: c.category,
        level: c.level,
        progress: 0,
        started: false,
        tags: c.accessibilityTags || [],
        image: c.thumbnail || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
        videos: c.lessons ? c.lessons.sort((a,b)=>a.order-b.order).map(l => l.title) : []
    }));

    res.json({ courses });
  } catch (err) {
    console.error('[courses/explore]', err);
    res.status(500).json({ error: 'Could not load explore courses.' });
  }
});

// accessibilityMiddleware is applied only where lesson data is returned
router.get('/:id', accessibilityMiddleware, getCourse);

router.post('/:id/enroll', enrollCourse);
router.post('/:courseId/lessons/:lessonId/complete', completeLesson);

module.exports = router;
