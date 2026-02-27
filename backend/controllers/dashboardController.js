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
            .populate('courseId', 'title category level thumbnail description totalLessons totalDuration')
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
    
    // Calculate total lessons across all enrolled courses
    const allEnrollments = await Enrollment.find({ userId }).populate('courseId', 'totalLessons').lean();
    const totalEnrolledLessons = allEnrollments.reduce((sum, e) => sum + (e.courseId?.totalLessons || 0), 0);

    const activeCourses = enrollments.map((e) => {
        const total = e.courseId?.totalLessons || 0;
        const totalDuration = e.courseId?.totalDuration || 0;
        const progress = e.progressPercentage || 0;
        const lessonsCompleted = Math.round((progress / 100) * total);
        const lessonsLeft = Math.max(0, total - lessonsCompleted);

        // Remaining time in hours (at least 1h if there are lessons left and total duration > 0)
        const remainingMinutes = Math.max(0, Math.round(totalDuration * (1 - progress / 100)));
        const estimatedHours = remainingMinutes > 0 ? Math.ceil(remainingMinutes / 60) : 0;

        return {
            id: e.courseId?._id,
            title: e.courseId?.title,
            description: e.courseId?.description || '',
            category: e.courseId?.category,
            level: e.courseId?.level,
            thumbnail: e.courseId?.thumbnail,
            progress: progress,
            lessonsLeft: lessonsLeft,
            totalDuration: totalDuration,
            estimatedHours: estimatedHours,
            lastAccessedLesson: e.lastAccessedLesson?.title || null,
            lastAccessedModuleLabel: e.lastAccessedModuleLabel || null,
        };
    });

    const resumeCourse = activeCourses.length > 0 ? {
        id: activeCourses[0].id,
        title: activeCourses[0].title,
        module: activeCourses[0].lastAccessedLesson || 'Get started',
        progress: activeCourses[0].progress,
        currentModuleNumber: (enrollments[0].lastAccessedLesson?.order || 0) + 1,
    } : null;

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
        resumeCourse,
        activeCourses,
        stats: {
            streak,
            quizAverage,
            certificates: certCount,
            lessonsCompleted: lessonStats,
            totalLessons: totalEnrolledLessons,
        },
    });
});
