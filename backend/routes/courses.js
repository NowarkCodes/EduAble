const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ────────────────────────────────────────────────────────────
   GET /api/courses  (protected)
   Returns all courses for the logged-in user, split by status.
──────────────────────────────────────────────────────────── */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inProgress = [
      {
        id: 'neural-networks',
        title: 'Introduction to Neural Networks',
        category: 'Data Science',
        level: 'Intermediate',
        progress: 65,
        lastAccessed: '2 hours ago',
        aiSummary:
          "You're mastering backpropagation. Next: Understand how ReLU activation functions differ from Sigmoid in deep architectures.",
        thumbnail: null,
      },
      {
        id: 'ethical-ai',
        title: 'Ethical AI & Bias Mitigation',
        category: 'Ethics',
        level: 'Foundations',
        progress: 20,
        lastAccessed: 'Yesterday',
        aiSummary:
          'Upcoming module focuses on the COMPAS recidivism case study. You\'ll learn how to audit datasets for demographic parity.',
        thumbnail: null,
      },
      {
        id: 'transformers',
        title: 'Transformer Architectures',
        category: 'NLP',
        level: 'Advanced',
        progress: 8,
        lastAccessed: '4 days ago',
        aiSummary:
          "You've just completed the Self-Attention module. Prepare for Multi-Head Attention by reviewing Vector Dot Products.",
        thumbnail: null,
      },
    ];

    const completed = [
      {
        id: 'python-basics',
        title: 'Python for Beginners',
        category: 'Programming',
        level: 'Beginner',
        progress: 100,
        completedDate: '2024-01-15',
        certificateUrl: '/certificates/python-basics',
        thumbnail: null,
      },
      {
        id: 'wcag-fundamentals',
        title: 'WCAG 2.1 Fundamentals',
        category: 'Accessibility',
        level: 'Foundations',
        progress: 100,
        completedDate: '2024-02-10',
        certificateUrl: '/certificates/wcag-fundamentals',
        thumbnail: null,
      },
    ];

    res.json({ inProgress, completed });
  } catch (err) {
    console.error('[courses/list]', err);
    res.status(500).json({ error: 'Could not load courses.' });
  }
});

/* ────────────────────────────────────────────────────────────
   GET /api/courses/progress  (protected)
   Returns learning progress & subject performance.
──────────────────────────────────────────────────────────── */
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const data = {
      stats: {
        lessonsCompleted: { value: 42, change: '+5%', target: 50 },
        quizAverage: { value: 88, change: '+2%', classAverage: 74 },
        currentStreak: { value: 15, change: '+3 Days', personalBest: 21 },
      },
      aiInsights: {
        momentum: 'exceptionally strong',
        lessonsAheadOfLastWeek: 5,
        consistencyIncrease: 12,
        topSubject: 'Mathematics',
        topScore: 94,
        peakHoursStart: '10:00 AM',
        peakHoursEnd: '11:30 AM',
        prediction:
          "Keep it up! At this pace, you'll complete the 'Advanced Algorithms' course 10 days ahead of schedule.",
      },
      subjectPerformance: [
        { subject: 'Mathematics', score: 94 },
        { subject: 'Language Studies', score: 88 },
        { subject: 'Science & Biology', score: 82 },
        { subject: 'History & Arts', score: 76 },
      ],
    };

    res.json(data);
  } catch (err) {
    console.error('[courses/progress]', err);
    res.status(500).json({ error: 'Could not load progress data.' });
  }
});

module.exports = router;
