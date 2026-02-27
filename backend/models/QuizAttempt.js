const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        lessonId: {
            // (from original implementation, keep in case)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            default: null,
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
            index: true,
        },
        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                selectedOption: {
                    type: String, // "A", "B" etc
                    default: null, // null if unanswered
                },
            },
        ],
        questionsSnapshot: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                text: String,
                options: [
                    {
                        label: String,
                        text: String,
                    },
                ],
            },
        ],
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100, // percentage
        },
        passed: {
            type: Boolean,
            required: true,
            default: false,
        },
        attemptNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        improvementFromPrevious: {
            type: Number, // percentage points higher/lower than previous attempt
            default: null,
        },
        usedAccessibilityModes: {
            type: [String], // e.g. ['cognitive_disability', 'blind_low_vision']
            default: [],
        },
        aiFeedback: {
            // Generated offline based on weak topicTags
            type: String,
            default: null,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
        // Keep totalQuestions for backwards compatibility with coursesRoute aggregating
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: false }
);

// Aggregation: user quiz average across all courses
QuizAttemptSchema.index({ userId: 1, attemptedAt: -1 });
// Aggregation: performance per course/subject
QuizAttemptSchema.index({ userId: 1, courseId: 1, attemptedAt: -1 });
// Checking cooldown / max limits
QuizAttemptSchema.index({ userId: 1, quizId: 1, attemptedAt: -1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
