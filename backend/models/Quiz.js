const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
    {
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
            unique: true, // One quiz per lesson
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Quiz title is required'],
            trim: true,
            maxlength: [200, 'Title must be 200 characters or less'],
        },
        passingScore: {
            type: Number,
            default: 60,
            min: 0,
            max: 100,
        },
        timeLimit: {
            // time limit in minutes (null = no limit)
            type: Number,
            default: null,
            min: 1,
        },
        allowExtendedTime: {
            type: Boolean,
            default: true,
        },
        maxAttempts: {
            // null = unlimited attempts
            type: Number,
            default: null,
            min: 1,
        },
        cooldownMinutes: {
            // wait time between attempts (null = no wait)
            type: Number,
            default: null,
            min: 0,
        },
        isGeneratedByAI: {
            // Tracks if initial draft was AI generated
            type: Boolean,
            default: false,
        },
        isPublished: {
            // Teacher toggles this to make it visible
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Indexed for quickly fetching all published quizzes for a course
QuizSchema.index({ courseId: 1, isPublished: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);
