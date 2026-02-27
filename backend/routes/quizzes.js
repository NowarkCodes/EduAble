const express = require('express');
const authMiddleware = require('../middleware/auth');
const accessibilityMiddleware = require('../middleware/accessibility');
const requireRole = require('../middleware/role');
const {
    getQuizForLesson,
    submitQuiz,
    getMyAttempts,
    getBestAttempt,
    generateQuizFromLesson,
    createQuiz,
    addQuestion,
    publishQuiz
} = require('../controllers/quizController');

const router = express.Router();

/* ── STUDENT ROUTES (Requires Auth) ─────────────────────────────── */
router.use(authMiddleware);

// Get a quiz tailored to accessibility profile
router.get('/lesson/:lessonId', accessibilityMiddleware, getQuizForLesson);

// Submit quiz answers
router.post('/:quizId/submit', accessibilityMiddleware, submitQuiz);

// View attempt history
router.get('/:quizId/attempts', getMyAttempts);
router.get('/:quizId/best', getBestAttempt);


/* ── ADMIN / TEACHER ROUTES (Requires 'admin' or 'ngo' role) ────── */
const adminOnly = requireRole('admin', 'ngo');

// AI Workflow: Generate quiz from lesson transcript
router.post('/generate/:lessonId', adminOnly, generateQuizFromLesson);

// Manual Workflow: Create quiz container
router.post('/', adminOnly, createQuiz);

// Manual Workflow: Add question
router.post('/:quizId/questions', adminOnly, addQuestion);

// Manual Workflow: Publish draft
router.patch('/:quizId/publish', adminOnly, publishQuiz);

module.exports = router;
