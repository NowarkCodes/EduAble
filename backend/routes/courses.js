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
        title: 'AI Ethics & Bias Mitigation',
        category: 'Ethics',
        level: 'Foundations',
        progress: 75,
        lastAccessed: '2 days ago',
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
        title: 'Inclusive Design Systems',
        category: 'Accessibility',
        level: 'Foundations',
        progress: 100,
        completedDate: '2023-10-12',
        certificateUrl: '/certificates/wcag-fundamentals',
        thumbnail: null,
      },
      {
        id: 'data-privacy',
        title: 'Data Privacy & Ethics',
        category: 'Ethics',
        level: 'Beginner',
        progress: 100,
        completedDate: '2023-08-05',
        certificateUrl: '/certificates/data-privacy',
        thumbnail: null,
      },
      {
        id: 'advanced-css',
        title: 'Accessible Web Development',
        category: 'Programming',
        level: 'Intermediate',
        progress: 100,
        completedDate: '2023-11-20',
        certificateUrl: '/certificates/accessible-web',
        thumbnail: null,
      }
    ];

    res.json({ inProgress, completed });
  } catch (err) {
    console.error('[courses/list]', err);
    res.status(500).json({ error: 'Could not load courses.' });
  }
});

/* ────────────────────────────────────────────────────────────
   GET /api/courses/explore (protected)
   Returns dummy data for Explore Courses directory.
──────────────────────────────────────────────────────────── */
router.get('/explore', authMiddleware, async (req, res) => {
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
