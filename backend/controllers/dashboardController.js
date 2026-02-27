const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const QuizAttempt = require('../models/QuizAttempt');
const Certificate = require('../models/Certificate');
const asyncHandler = require('../utils/asyncHandler');
const { calculateStreak } = require('../utils/streakCalculator');

exports.getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Run all queries concurrently
    const [enrollments, progressDates, quizStats, certCount, lessonStats] = await Promise.all([
        // Active enrollments with course details (limit 3, most recently updated first)
        Enrollment.find({ userId, status: 'in_progress' })
            .sort({ updatedAt: -1 })
            .limit(3)
            .populate('courseId', 'title category level thumbnail')
            .populate('lastAccessedLesson', 'title order')
            .lean(),

        // All dates where user completed a lesson — for streak
        LessonProgress.find({ userId, completed: true })
            .select('lastAccessed')
            .sort({ lastAccessed: -1 })
            .lean()
            .then((docs) => docs.map((d) => d.lastAccessed)),

        // Overall quiz average
        QuizAttempt.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    avg: {
                        $avg: {
                            $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100],
                        },
                    },
                },
            },
        ]),

        Certificate.countDocuments({ userId }),

        // Completed lessons count
        LessonProgress.countDocuments({ userId, completed: true }),
    ]);

    const streak = calculateStreak(progressDates);
    const quizAverage = quizStats.length > 0 ? Math.round(quizStats[0].avg) : 0;

    const activeCourses = enrollments.map((e) => ({
        id: e.courseId?._id,
        title: e.courseId?.title,
        category: e.courseId?.category,
        level: e.courseId?.level,
        thumbnail: e.courseId?.thumbnail,
        progress: e.progressPercentage,
        lastAccessedLesson: e.lastAccessedLesson?.title || null,
        lastAccessedModuleLabel: e.lastAccessedModuleLabel || null,
    }));

    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            initials: req.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
        },
        activeCourses,
        stats: {
            streak,
            quizAverage,
            certificates: certCount,
            lessonsCompleted: lessonStats,
        },
    });
});
