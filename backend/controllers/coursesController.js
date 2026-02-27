const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const QuizAttempt = require('../models/QuizAttempt');
const asyncHandler = require('../utils/asyncHandler');
const { calculateStreak } = require('../utils/streakCalculator');

/* ── GET /api/courses ───────────────────────────────────────────── */
exports.listCourses = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [inProgressEnrollments, completedEnrollments] = await Promise.all([
        Enrollment.find({ userId, status: 'in_progress' })
            .populate('courseId', 'title category level thumbnail totalLessons')
            .lean(),
        Enrollment.find({ userId, status: 'completed' })
            .populate('courseId', 'title category level thumbnail totalLessons')
            .populate('lastAccessedLesson', 'title')
            .lean(),
    ]);

    const inProgress = inProgressEnrollments.map((e) => ({
        id: e.courseId?._id,
        title: e.courseId?.title,
        category: e.courseId?.category,
        level: e.courseId?.level,
        thumbnail: e.courseId?.thumbnail,
        progress: e.progressPercentage,
        lessonsLeft: Math.max(
            0,
            (e.courseId?.totalLessons || 0) - Math.round(((e.progressPercentage || 0) / 100) * (e.courseId?.totalLessons || 0))
        ),
        lastAccessed: e.updatedAt,
    }));

    const completed = completedEnrollments.map((e) => ({
        id: e.courseId?._id,
        title: e.courseId?.title,
        category: e.courseId?.category,
        level: e.courseId?.level,
        thumbnail: e.courseId?.thumbnail,
        progress: 100,
        completedDate: e.completedAt,
    }));

    res.json({ inProgress, completed });
});

/* ── GET /api/courses/:id ───────────────────────────────────────── */
exports.getCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [course, lessons, enrollment] = await Promise.all([
        Course.findById(id).lean(),
        Lesson.find({ courseId: id }).sort({ order: 1 }).lean(),
        Enrollment.findOne({ userId: req.user._id, courseId: id }).lean(),
    ]);

    if (!course || !course.isPublished) {
        return res.status(404).json({ error: 'Course not found.' });
    }

    // Fetch which lessons this user has completed
    const completedLessonIds = new Set(
        (
            await LessonProgress.find({ userId: req.user._id, courseId: id, completed: true })
                .select('lessonId')
                .lean()
        ).map((lp) => lp.lessonId.toString())
    );

    const a11y = req.a11y; // injected by accessibilityMiddleware

    const adaptedLessons = lessons.map((lesson) => {
        const base = {
            id: lesson._id,
            title: lesson.title,
            order: lesson.order,
            duration: lesson.duration,
            videoUrl: lesson.videoUrl,
            notesMarkdown: lesson.notesMarkdown,
            completed: completedLessonIds.has(lesson._id.toString()),
        };

        if (!a11y) return base;

        const prefs = a11y.accessibilityPreferences || {};
        const disabilities = a11y.disabilityType || [];

        const isBlind = disabilities.includes('blind_low_vision');
        const isDeaf = disabilities.includes('deaf_hard_of_hearing');
        const isCognitive = disabilities.includes('cognitive_disability');
        const isMotor = disabilities.includes('motor_disability');
        const isMultiple = disabilities.includes('multiple_disabilities');

        // Accessibility overlays merged intelligently
        if (isBlind || isMultiple) {
            base.narrationMode = true;
            base.transcript = lesson.transcript;
            base.preferredAudioSpeed = prefs.preferredAudioSpeed || 'normal';
            base.voiceNavigation = prefs.voiceNavigation === true;
        }

        if (isDeaf || isMultiple) {
            base.captionsEnabled = true;
            base.captionSize = prefs.captionSize || 'medium';
            base.signLanguageSupport = prefs.signLanguageSupport === true;
            if (!base.transcript) base.transcript = lesson.transcript;
        }

        if (isCognitive || isMultiple) {
            base.simplifiedText = lesson.simplifiedText;
            base.simplifiedInterface = prefs.simplifiedInterface === true;
            base.dyslexiaMode = prefs.dyslexiaMode === true;
        }

        if (isMotor || isMultiple) {
            base.navigationMode = 'keyboard';
            base.keyboardOnlyNavigation = prefs.keyboardOnlyNavigation === true;
            base.voiceCommands = prefs.voiceCommands === true;
        }

        return base;
    });

    res.json({
        course: {
            id: course._id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            instructorName: course.instructorName,
            thumbnail: course.thumbnail,
            accessibilityTags: course.accessibilityTags,
            totalLessons: course.totalLessons,
            totalDuration: course.totalDuration,
        },
        enrollment: enrollment
            ? {
                status: enrollment.status,
                progressPercentage: enrollment.progressPercentage,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
            }
            : null,
        lessons: adaptedLessons,
    });
});

/* ── GET /api/courses/progress ──────────────────────────────────── */
exports.getProgress = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [lessonStats, quizBySubject, progressDates] = await Promise.all([
        // Total lessons completed + target (total enrolled)
        LessonProgress.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    total: { $sum: 1 },
                },
            },
        ]),

        // Per-subject quiz performance
        QuizAttempt.aggregate([
            { $match: { userId } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: '$course' },
            {
                $group: {
                    _id: '$course.category',
                    avgScore: {
                        $avg: {
                            $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100],
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { avgScore: -1 } },
        ]),

        // Streak
        LessonProgress.find({ userId, completed: true })
            .select('lastAccessed')
            .sort({ lastAccessed: -1 })
            .lean()
            .then((docs) => docs.map((d) => d.lastAccessed)),
    ]);

    const streak = calculateStreak(progressDates);
    const ls = lessonStats[0] || { completed: 0, total: 0 };

    const overallQuizAvg =
        quizBySubject.length > 0
            ? Math.round(quizBySubject.reduce((sum, s) => sum + s.avgScore, 0) / quizBySubject.length)
            : 0;

    const subjectPerformance = quizBySubject.map((s) => ({
        subject: s._id,
        score: Math.round(s.avgScore),
        quizCount: s.count,
    }));

    const topSubject = subjectPerformance[0] || null;

    res.json({
        stats: {
            lessonsCompleted: {
                value: ls.completed,
                target: ls.total,
            },
            quizAverage: {
                value: overallQuizAvg,
            },
            currentStreak: {
                value: streak,
            },
        },
        subjectPerformance,
        aiInsights: {
            topSubject: topSubject?.subject || null,
            topScore: topSubject?.score || null,
            momentum:
                streak >= 7 ? 'exceptionally strong' : streak >= 3 ? 'building momentum' : 'just getting started',
            prediction:
                streak >= 5
                    ? `At your current pace (${streak}-day streak), you're on track to hit your learning goals ahead of schedule.`
                    : 'Complete lessons daily to build your streak and unlock personalised predictions.',
        },
    });
});

/* ── POST /api/courses/:id/enroll ───────────────────────────────── */
exports.enrollCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, isPublished: true });
    if (!course) {
        return res.status(404).json({ error: 'Course not found.' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
        { userId: req.user._id, courseId: id },
        { userId: req.user._id, courseId: id },
        { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Enrolled successfully.', enrollment });
});

/* ── POST /api/courses/:courseId/lessons/:lessonId/complete ──────── */
exports.completeLesson = asyncHandler(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const { watchTime } = req.body;

    await LessonProgress.findOneAndUpdate(
        { userId: req.user._id, lessonId, courseId },
        {
            userId: req.user._id,
            lessonId,
            courseId,
            completed: true,
            watchTime: watchTime || 0,
            lastAccessed: new Date(),
        },
        { upsert: true, runValidators: true }
    );

    // Recalculate enrollment progress
    const [course, completedCount] = await Promise.all([
        Course.findById(courseId).select('totalLessons').lean(),
        LessonProgress.countDocuments({ userId: req.user._id, courseId, completed: true }),
    ]);

    if (course && course.totalLessons > 0) {
        const progressPercentage = Math.min(
            100,
            Math.round((completedCount / course.totalLessons) * 100)
        );
        const isComplete = progressPercentage === 100;

        await Enrollment.findOneAndUpdate(
            { userId: req.user._id, courseId },
            {
                progressPercentage,
                status: isComplete ? 'completed' : 'in_progress',
                lastAccessedLesson: lessonId,
                ...(isComplete && { completedAt: new Date() }),
            }
        );
    }

    res.json({ message: 'Lesson marked as complete.' });
});
