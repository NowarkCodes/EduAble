const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const QuizAttempt = require('../models/QuizAttempt');
const asyncHandler = require('../utils/asyncHandler');
const { calculateStreak } = require('../utils/streakCalculator');
const { transcribeUrl } = require('../services/deepgramService');
const { Storage } = require('@google-cloud/storage');

/* ── GET /api/courses ───────────────────────────────────────────── */
exports.listCourses = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [inProgressEnrollments, completedEnrollments] = await Promise.all([
        Enrollment.find({ userId, status: 'in_progress' })
            .populate('courseId', 'title category level thumbnail totalLessons description')
            .lean(),
        Enrollment.find({ userId, status: 'completed' })
            .populate('courseId', 'title category level thumbnail totalLessons')
            .populate('lastAccessedLesson', 'title')
            .lean(),
    ]);

    const inProgress = inProgressEnrollments.map((e) => {
        const total = e.courseId?.totalLessons || 0;
        const progress = e.progressPercentage || 0;
        const lessonsCompleted = Math.round((progress / 100) * total);
        const lessonsLeft = Math.max(0, total - lessonsCompleted);

        return {
            id: e.courseId?._id,
            title: e.courseId?.title,
            category: e.courseId?.category,
            level: e.courseId?.level,
            thumbnail: e.courseId?.thumbnail,
            progress: progress,
            totalDuration: e.courseId?.totalDuration || 0,
            lessonsLeft: lessonsLeft,
            lastAccessed: e.updatedAt,
            aiSummary: e.courseId?.description ? e.courseId.description.substring(0, 100) + '...' : 'Quickly mastering the core concepts of this curriculum.',
        };
    });

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
            // Always include transcript so TranscriptPanel and the Generate button work for all users
            transcript: lesson.transcript || '',
            signLanguageVttUrl: lesson.signLanguageVttUrl || '',
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

    const totalLessons = lessons.length;
    const totalDurationSeconds = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

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
            totalLessons: totalLessons || course.totalLessons,
            totalDuration: totalDurationMinutes || course.totalDuration,
        },
        enrollment: enrollment
            ? {
                status: enrollment.status,
                progressPercentage: enrollment.progressPercentage,
                enrolledAt: enrollment.enrolledAt,
                completedAt: enrollment.completedAt,
                lastAccessedLesson: enrollment.lastAccessedLesson,
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
                value: ls.completed || 2, // Dummy fallback for new users
                change: ls.completed > 0 ? '+12%' : '0%',
                target: ls.total || 10,
            },
            quizAverage: {
                value: overallQuizAvg || 20, // Dummy fallback for new users
                change: overallQuizAvg > 75 ? '+5%' : (overallQuizAvg > 0 ? '-2%' : '0%'),
                classAverage: overallQuizAvg > 0 ? 65 : 0,
            },
            currentStreak: {
                value: streak || 1, // Dummy fallback for new users
                change: streak > 0 ? '+1' : '0',
                personalBest: Math.max(streak, 5),
            },
        },
        subjectPerformance,
        aiInsights: {
            topSubject: topSubject?.subject || 'General Accessibility',
            topScore: topSubject?.score || overallQuizAvg || 0,
            momentum:
                streak >= 7 ? 'exceptionally strong' : streak >= 3 ? 'building momentum' : 'just getting started',
            lessonsAheadOfLastWeek: ls.completed > 0 ? Math.floor(ls.completed * 0.2) + 1 : 0,
            consistencyIncrease: ls.completed > 0 ? 15 : 0,
            peakHoursStart: '10:00 AM',
            peakHoursEnd: '02:00 PM',
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

    if (course) {
        const actualTotalLessons = course.totalLessons || (await Lesson.countDocuments({ courseId }));
        
        const progressPercentage = Math.min(
            100,
            Math.round((completedCount / (actualTotalLessons || 1)) * 100)
        );
        const isComplete = progressPercentage === 100;

        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { userId: req.user._id, courseId },
            {
                progressPercentage,
                status: isComplete ? 'completed' : 'in_progress',
                lastAccessedLesson: lessonId,
                ...(isComplete && { completedAt: new Date() }),
            },
            { new: true }
        );

        return res.json({ 
            message: 'Lesson marked as complete.', 
            enrollment: updatedEnrollment 
        });
    }

    res.json({ message: 'Lesson marked as complete.' });
});

/* ── PATCH /api/courses/lessons/:id/duration ────────────────────── */
exports.updateLessonDuration = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { duration } = req.body;

    if (typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ error: 'Valid duration in seconds is required.' });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Only update if duration is currently 0 or significantly different (probed vs placeholder)
    if (lesson.duration === 0 || Math.abs(lesson.duration - duration) > 2) {
        lesson.duration = Math.round(duration);
        await lesson.save();

        // Recalculate Course totalDuration and totalLessons
        const lessons = await Lesson.find({ courseId: lesson.courseId });
        const totalDurationSeconds = lessons.reduce((acc, l) => acc + (l.duration || 0), 0);
        const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

        await Course.findByIdAndUpdate(lesson.courseId, {
            totalDuration: totalDurationMinutes,
            totalLessons: lessons.length,
        });
    }

    res.json({ message: 'Lesson duration updated.', duration: lesson.duration });
});

/* ── POST /api/courses/lessons/:lessonId/transcribe ─────────────── */
exports.transcribeLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    // 1. Find the lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found.' });
    }

    // 2. Ensure this user is enrolled in the course (security check)
    const enrollment = await Enrollment.findOne({
        userId: req.user._id,
        courseId: lesson.courseId,
    });
    if (!enrollment) {
        return res.status(403).json({ error: 'You are not enrolled in this course.' });
    }

    // 3. Return cached transcript if it already exists (avoid re-billing Deepgram)
    if (lesson.transcript && lesson.transcript.trim().length > 10) {
        return res.json({
            transcript: lesson.transcript,
            cached: true,
        });
    }

    // 4. Ensure there is a video to transcribe
    if (!lesson.videoUrl) {
        return res.status(400).json({ error: 'This lesson has no video to transcribe.' });
    }

    // 5. Obtain a signed GCS URL for the video so Deepgram can access it
    let transcribeTarget = lesson.videoUrl;
    try {
        const parsed = new URL(lesson.videoUrl);
        // Only sign if it's a raw GCS URL (not already signed)
        if (!parsed.searchParams.has('X-Goog-Signature')) {
            const storage = new Storage({
                projectId: process.env.GCS_PROJECT_ID,
                credentials: {
                    client_email: process.env.GCS_CLIENT_EMAIL,
                    private_key: (process.env.GCS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                },
            });
            const pathParts = parsed.pathname.split('/').slice(2);
            const objectPath = decodeURIComponent(pathParts.join('/'));
            const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
            const file = bucket.file(objectPath);
            const [signedUrl] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 30 * 60 * 1000, // 30 minutes for Deepgram to fetch
            });
            transcribeTarget = signedUrl;
        }
    } catch (e) {
        // If URL parsing fails, pass the raw URL to Deepgram as-is
        console.warn('[transcribeLesson] Could not sign GCS URL, using raw URL:', e.message);
    }

    // 6. Call Deepgram
    const transcript = await transcribeUrl(transcribeTarget);

    // 7. Persist to MongoDB
    lesson.transcript = transcript;
    await lesson.save();

    res.json({ transcript, cached: false });
});
