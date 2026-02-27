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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            default: null,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// Aggregation: user quiz average across all courses
QuizAttemptSchema.index({ userId: 1, attemptedAt: -1 });
// Aggregation: performance per course/subject
QuizAttemptSchema.index({ userId: 1, courseId: 1, attemptedAt: -1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
