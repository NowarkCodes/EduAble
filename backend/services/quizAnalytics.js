const QuizAttempt = require('../models/QuizAttempt');
const LessonProgress = require('../models/LessonProgress');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

/**
 * Detects weak topics based on a user's recent incorrect answers for a specific course.
 * @returns {Array<{topic: String, errorCount: Number}>}
 */
async function detectWeakTopics(userId, courseId) {
    const attempts = await QuizAttempt.find({ userId, courseId })
        .sort({ attemptedAt: -1 })
        .limit(5) // Look at 5 most recent attempts
        .populate('quizId')
        .lean();

    if (!attempts.length) return [];

    // We need the actual Question documents to see what the topicTag was and the correctOption
    // But wait, the attempt saved the questionsSnapshot!
    const weakMap = {};

    for (const attempt of attempts) {
        const snapshotDict = {};
        for (const q of attempt.questionsSnapshot) {
            snapshotDict[q.questionId.toString()] = q;
        }

        // Since we need topicTags, we have to fetch the questions
        const questionIds = attempt.answers.map(a => a.questionId);
        const questions = await require('../models/Question').find({ _id: { $in: questionIds } }).lean();

        const qMap = {};
        for (const q of questions) {
            qMap[q._id.toString()] = q;
        }

        for (const ans of attempt.answers) {
            const actualQ = qMap[ans.questionId.toString()];
            if (!actualQ) continue;

            if (ans.selectedOption !== actualQ.correctOption) {
                weakMap[actualQ.topicTag] = (weakMap[actualQ.topicTag] || 0) + 1;
            }
        }
    }

    // Sort by highest error count
    return Object.entries(weakMap)
        .map(([topic, count]) => ({ topic, errorCount: count }))
        .sort((a, b) => b.errorCount - a.errorCount);
}

/**
 * Generates rule-based AI feedback based on weak topics.
 */
function generateAIFeedback(weakTopics) {
    if (!weakTopics || weakTopics.length === 0) {
        return "Excellent work! You demonstrated a strong understanding of all concepts covered in this quiz.";
    }

    const primaryWeakness = weakTopics[0].topic;

    if (weakTopics.length === 1) {
        return `You scored well overall, but missed some questions related to **${primaryWeakness}**. We recommend reviewing that specific section before attempting the next module.`;
    }

    const secondaryWeakness = weakTopics[1].topic;
    return `Keep pushing forward! However, we noticed you struggled slightly with **${primaryWeakness}** and **${secondaryWeakness}**. Taking 10 minutes to review those topics will greatly improve your foundational knowledge.`;
}

/**
 * Calculates improvement trend from previous to current score.
 * Returns percentage point difference (negative if worse).
 */
async function getImprovementTrend(userId, quizId, currentScore) {
    const previousAttempt = await QuizAttempt.findOne({ userId, quizId })
        .sort({ attemptNumber: -1 })
        .lean();

    if (!previousAttempt) return null; // First attempt

    return currentScore - previousAttempt.score;
}

/**
 * Strict Course Completion Checker
 * Verifies all published lessons have `completed: true` in LessonProgress
 * AND all published quizzes have `passed: true` in QuizAttempt
 */
async function checkAndIssueCertificate(userId, courseId) {
    // 1. Get all published lessons & quizzes for the course
    const publishedLessons = await Lesson.find({ courseId }).lean();
    const publishedQuizzes = await Quiz.find({ courseId, isPublished: true }).lean();

    const lessonIds = publishedLessons.map(l => l._id.toString());
    const quizIds = publishedQuizzes.map(q => q._id.toString());

    // 2. Check lesson progress
    // We need exactly lessonIds.length distinct completed lessons
    const completedLessonsCount = await LessonProgress.countDocuments({
        userId,
        courseId,
        lessonId: { $in: lessonIds },
        completed: true,
    });

    if (completedLessonsCount < lessonIds.length) {
        return false; // Not all lessons completed
    }

    // 3. Check quiz attempts
    // For each quiz, the user MUST have at least one QuizAttempt where passed = true
    if (quizIds.length > 0) {
        const passedQuizzes = await QuizAttempt.distinct('quizId', {
            userId,
            courseId,
            quizId: { $in: quizIds },
            passed: true,
        });

        if (passedQuizzes.length < quizIds.length) {
            return false; // Not all quizzes passed
        }
    }

    // 4. Issue Certificate!
    try {
        const cert = await Certificate.findOneAndUpdate(
            { userId, courseId },
            {
                userId,
                courseId,
                issuedAt: new Date(),
                certificateUrl: `/certificates/eduable-${courseId}-${userId}.pdf` // Mock URL for now
            },
            { upsert: true, new: true, runValidators: true }
        );
        return true;
    } catch (err) {
        console.error('Failed to issue certificate', err);
        return false;
    }
}

module.exports = {
    detectWeakTopics,
    generateAIFeedback,
    getImprovementTrend,
    checkAndIssueCertificate
};
