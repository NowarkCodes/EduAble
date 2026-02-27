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

// accessibilityMiddleware is applied only where lesson data is returned
router.get('/:id', accessibilityMiddleware, getCourse);

router.post('/:id/enroll', enrollCourse);
router.post('/:courseId/lessons/:lessonId/complete', completeLesson);

module.exports = router;
