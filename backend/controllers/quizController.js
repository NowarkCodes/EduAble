const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Lesson = require('../models/Lesson');
const asyncHandler = require('../utils/asyncHandler');
const {
    detectWeakTopics,
    generateAIFeedback,
    getImprovementTrend,
    checkAndIssueCertificate
} = require('../services/quizAnalytics');
const { generateQuizFromTranscript } = require('../services/aiService');

/* ── STUDENT ROUTES ─────────────────────────────────────────────── */

/**
 * GET /api/quizzes/lesson/:lessonId
 * Fetches a published quiz and its questions for a student, tailored to their AccessibilityProfile.
 */
exports.getQuizForLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    const quiz = await Quiz.findOne({ lessonId, isPublished: true }).lean();
    if (!quiz) {
        return res.status(404).json({ error: 'No published quiz found for this lesson.' });
    }

    // Fetch questions, explicitly removing correctOption so students can't inspect element
    const questions = await Question.find({ quizId: quiz._id })
        .select('-correctOption')
        .sort({ order: 1 })
        .lean();

    const a11y = req.a11y; // Injected by accessibilityMiddleware
    const a11yMeta = {
        narrationMode: false,
        navigationMode: 'standard',
        preventAccidentalInput: false,
        captionsEnabled: false,
        timerDisabled: false,
        questionDisplayMode: 'all', // or 'one-by-one'
    };

    const adaptedQuestions = questions.map(q => {
        const tailored = { ...q };

        if (!a11y) return tailored;
        const disabilities = a11y.disabilityType || [];
        const prefs = a11y.accessibilityPreferences || {};

        if (disabilities.includes('cognitive_disability') || disabilities.includes('multiple_disabilities')) {
            tailored.text = q.simplifiedText || q.text; // Override standard text with simplified
            a11yMeta.questionDisplayMode = 'one-by-one';
            a11yMeta.timerDisabled = true;
        }

        if (disabilities.includes('blind_low_vision') || disabilities.includes('multiple_disabilities')) {
            a11yMeta.narrationMode = true;
            tailored.preferredAudioSpeed = prefs.preferredAudioSpeed || 'normal';
        }

        if (disabilities.includes('motor_disability') || disabilities.includes('multiple_disabilities')) {
            a11yMeta.navigationMode = 'keyboard';
            a11yMeta.preventAccidentalInput = true;
        }

        if (disabilities.includes('deaf_hard_of_hearing') || disabilities.includes('multiple_disabilities')) {
            a11yMeta.captionsEnabled = true;
        }

        return tailored;
    });

    // If cognitive user is taking the quiz, override the backend time limit to unlimited
    const effectiveTimeLimit = a11yMeta.timerDisabled ? null : quiz.timeLimit;

    res.json({
        quiz: {
            id: quiz._id,
            title: quiz.title,
            passingScore: quiz.passingScore,
            timeLimit: effectiveTimeLimit,
            allowExtendedTime: quiz.allowExtendedTime,
        },
        a11yMeta,
        questions: adaptedQuestions,
    });
});

/**
 * POST /api/quizzes/:quizId/submit
 * Submits answers, grades the quiz, checks cooldowns, generates AI feedback,
 * and issues certificates if the course is fully completed.
 */
exports.submitQuiz = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body; // [{ questionId, selectedOption }]
    const userId = req.user._id;

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers must be provided as an array.' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ error: 'Quiz not found or not published.' });
    }

    // Check cooldown and max attempts
    const previousAttempts = await QuizAttempt.countDocuments({ userId, quizId });
    if (quiz.maxAttempts !== null && previousAttempts >= quiz.maxAttempts) {
        return res.status(403).json({ error: 'You have reached the maximum number of attempts for this quiz.' });
    }

    if (quiz.cooldownMinutes && previousAttempts > 0) {
        const lastAttempt = await QuizAttempt.findOne({ userId, quizId }).sort({ attemptedAt: -1 }).lean();
        const cooldownMs = quiz.cooldownMinutes * 60 * 1000;
        const timeSinceLast = Date.now() - new Date(lastAttempt.attemptedAt).getTime();

        if (timeSinceLast < cooldownMs) {
            const waitTime = Math.ceil((cooldownMs - timeSinceLast) / 60000);
            return res.status(429).json({ error: `Please wait ${waitTime} minutes before trying again.` });
        }
    }

    // Load actual questions with correctOption
    const questions = await Question.find({ quizId }).lean();
    const qMap = {};
    questions.forEach(q => (qMap[q._id.toString()] = q));

    let correctCount = 0;
    const detailedResults = []; // Sent back to user (with explanations)
    const questionsSnapshot = []; // Saved in Attempt DB

    for (const ans of answers) {
        const actualQ = qMap[ans.questionId.toString()];
        if (!actualQ) continue;

        const isCorrect = actualQ.correctOption === ans.selectedOption;
        if (isCorrect) correctCount++;

        detailedResults.push({
            questionId: actualQ._id,
            selectedOption: ans.selectedOption,
            isCorrect,
            correctOption: actualQ.correctOption,
            explanation: actualQ.explanation
        });

        questionsSnapshot.push({
            questionId: actualQ._id,
            text: actualQ.text,
            options: actualQ.options
        });
    }

    const totalQuestions = questions.length;
    if (totalQuestions === 0) return res.status(400).json({ error: 'Quiz has no questions.' });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;
    const attemptNumber = previousAttempts + 1;

    // Calculate improvement
    const improvementFromPrevious = await getImprovementTrend(userId, quizId, score);

    // Extract Accessibility Modes used
    const usedModes = req.a11y ? (req.a11y.disabilityType || []) : [];

    // Save the attempt before detecting weak topics (so this attempt is included in the analytics)
    const attemptDoc = await QuizAttempt.create({
        userId,
        quizId,
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
        answers,
        questionsSnapshot,
        score,
        totalQuestions,
        passed,
        attemptNumber,
        improvementFromPrevious,
        usedAccessibilityModes: usedModes,
    });

    // Calculate weak topics from this + recent attempts and generate feedback
    const weakTopics = await detectWeakTopics(userId, quiz.courseId);
    const aiFeedback = generateAIFeedback(weakTopics);

    // Save feedback onto attempt
    attemptDoc.aiFeedback = aiFeedback;
    await attemptDoc.save();

    // If passed, check if the entire course is complete
    let certificateIssued = false;
    if (passed) {
        certificateIssued = await checkAndIssueCertificate(userId, quiz.courseId);
    }

    res.json({
        score,
        passed,
        correctCount,
        totalQuestions,
        attemptNumber,
        improvementFromPrevious,
        weakTopics: weakTopics.slice(0, 3).map(w => w.topic),
        aiFeedback,
        certificateIssued,
        detailedResults // Send back correct answers and explanations for learning
    });
});

/**
 * GET /api/quizzes/:quizId/attempts
 */
exports.getMyAttempts = asyncHandler(async (req, res) => {
    const attempts = await QuizAttempt.find({ userId: req.user._id, quizId: req.params.quizId })
        .sort({ attemptedAt: -1 })
        .select('-questionsSnapshot') // Omit heavy snapshot unless drilling down
        .lean();

    res.json({ attempts });
});

/**
 * GET /api/quizzes/:quizId/best
 */
exports.getBestAttempt = asyncHandler(async (req, res) => {
    const [best] = await QuizAttempt.aggregate([
        { $match: { userId: req.user._id, quizId: new require('mongoose').Types.ObjectId(req.params.quizId) } },
        { $sort: { score: -1, attemptedAt: -1 } },
        { $limit: 1 }
    ]);
    res.json({ bestAttempt: best || null });
});


/* ── ADMIN / TEACHER ROUTES ─────────────────────────────────────── */

/**
 * POST /api/quizzes/generate/:lessonId
 * AI WORKFLOW: Reads lesson transcript, generates draft quiz via LLM.
 */
exports.generateQuizFromLesson = asyncHandler(async (req, res) => {
    const { lessonId } = req.params;

    // Ensure no quiz already exists for this lesson
    const existing = await Quiz.findOne({ lessonId });
    if (existing) return res.status(409).json({ error: 'Quiz already exists for this lesson.' });

    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

    // In real life, if transcript is empty but videoUrl exists in GCS, 
    // we would route to a Speech-to-Text API first. 
    const textSource = lesson.transcript || lesson.notesMarkdown || lesson.title;

    // Call the AI Service
    const aiData = await generateQuizFromTranscript(textSource, lesson.title);

    const quiz = await Quiz.create({
        lessonId,
        courseId: lesson.courseId,
        title: aiData.title,
        passingScore: aiData.passingScore,
        isGeneratedByAI: true,
        isPublished: false // Admin must review and publish manually
    });

    // Bulk insert questions
    const qDocs = aiData.questions.map(q => ({
        ...q,
        quizId: quiz._id
    }));
    const questions = await Question.insertMany(qDocs);

    res.status(201).json({
        message: 'AI Quiz Draft generated successfully. Please review and publish.',
        quiz,
        questions
    });
});

/**
 * POST /api/quizzes
 * MANUAL WORKFLOW: Creates empty quiz bucket.
 */
exports.createQuiz = asyncHandler(async (req, res) => {
    const { lessonId, courseId, title, passingScore, timeLimit, maxAttempts, cooldownMinutes } = req.body;

    const existing = await Quiz.findOne({ lessonId });
    if (existing) return res.status(409).json({ error: 'Quiz already exists for this lesson.' });

    const quiz = await Quiz.create({
        lessonId, courseId, title, passingScore, timeLimit, maxAttempts, cooldownMinutes,
        isGeneratedByAI: false,
        isPublished: false
    });

    res.status(201).json({ quiz });
});

/**
 * POST /api/quizzes/:quizId/questions
 * MANUAL WORKFLOW: Adds question to existing quiz.
 */
exports.addQuestion = asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const qData = req.body; // text, options, correctOption, explanation, simplifiedText, topicTag

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const count = await Question.countDocuments({ quizId });
    const question = await Question.create({
        ...qData,
        quizId,
        order: count + 1
    });

    res.status(201).json({ question });
});

/**
 * PATCH /api/quizzes/:quizId/publish
 * Make quiz visible to students.
 */
exports.publishQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findByIdAndUpdate(req.params.quizId, { isPublished: true }, { new: true });
    res.json({ quiz });
});
