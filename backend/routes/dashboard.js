const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/* ────────────────────────────────────────────────────────────
   GET /api/dashboard  (protected)
   Returns aggregated dashboard data for the logged-in user.
──────────────────────────────────────────────────────────── */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Structured mock data — replace with real DB queries when courses model exists
    const data = {
      user: {
        name: user.name,
        email: user.email,
        tier: 'Standard Account',
        initials: user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
      resumeCourse: {
        id: 'ux-design-101',
        title: 'Introduction to UX Design: Inclusive Principles',
        module: 'Module 3: Accessibility Auditing',
        progress: 75,
        currentModuleNumber: 3,
      },
      activeCourses: [
        {
          id: 'wcag-mastery',
          title: 'Advanced WCAG 2.2 Mastery',
          description:
            'Deep dive into the latest success criteria for modern web accessibility standards.',
          lessonsLeft: 12,
          estimatedHours: 4,
          locked: false,
          category: 'Accessibility',
          level: 'Advanced',
        },
        {
          id: 'voice-interface',
          title: 'Voice Interface Design',
          description:
            'Designing conversational interfaces with ethical AI principles.',
          lessonsLeft: 0,
          estimatedHours: 0,
          locked: true,
          unlocksAfter: 'UX Module 4',
          category: 'Design',
          level: 'Intermediate',
        },
        {
          id: 'cognitive-inclusion',
          title: 'Cognitive Inclusion Strategies',
          description:
            'Evidence-based approaches to design for cognitive accessibility and neurodiversity.',
          lessonsLeft: 5,
          estimatedHours: 2,
          locked: false,
          category: 'Accessibility',
          level: 'Intermediate',
        },
      ],
      stats: {
        streak: 14,
        quizAverage: 82,
        certificates: 4,
        lessonsCompleted: 42,
        totalLessons: 50,
      },
    };

    res.json(data);
  } catch (err) {
    console.error('[dashboard/get]', err);
    res.status(500).json({ error: 'Could not load dashboard data.' });
  }
});

module.exports = router;
