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

const router = express.Router();

// All course routes require authentication
router.use(authMiddleware);

// Order matters: /progress must come before /:id to avoid being caught as an ID param
router.get('/progress', getProgress);
router.get('/', listCourses);

/* ────────────────────────────────────────────────────────────
   GET /api/courses/explore (protected)
   Returns dummy data for Explore Courses directory.
──────────────────────────────────────────────────────────── */
router.get('/explore', async (req, res) => {
  try {
    const exploreCourses = [
      {
        id: 'gen-ai-a11y',
        title: 'Intro to Generative AI & Accessibility',
        instructor: 'Dr. Sarah Chen',
        category: 'AI Basics',
        level: 'Beginner',
        progress: 65,
        started: true,
        tags: ['Screen Reader Optimized', 'Captions'],
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop'
      },
      {
        id: 'adv-prompt-eng',
        title: 'Advanced Prompt Engineering',
        instructor: 'Marcus Thorne',
        category: 'Prompt Eng',
        level: 'Intermediate',
        progress: 12,
        started: true,
        tags: ['Keyboard Navigable'],
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop'
      },
      {
        id: 'ethics-llm',
        title: 'Ethics in Large Language Models',
        instructor: 'Elena Rodriguez',
        category: 'Ethics',
        level: 'Advanced',
        progress: 0,
        started: false,
        tags: ['Captions', 'Screen Reader Optimized'],
        image: 'https://images.unsplash.com/photo-1633534571434-6eaecf3d24ab?q=80&w=600&auto=format&fit=crop'
      },
      {
        id: 'a11y-web-design',
        title: 'Accessibility in Web Design',
        instructor: 'Alex Rivera',
        category: 'Design',
        level: 'Intermediate',
        progress: 0,
        started: false,
        tags: ['Screen Reader Optimized', 'Keyboard Navigable'],
        image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop'
      },
      {
        id: 'ai-learning-strategies',
        title: 'AI-Assisted Learning Strategies',
        instructor: 'Maya Thompson',
        category: 'Learning',
        level: 'Beginner',
        progress: 0,
        started: false,
        tags: ['Captions', 'Screen Reader Optimized'],
        image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=600&auto=format&fit=crop'
      }
    ];
    res.json({ courses: exploreCourses });
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
