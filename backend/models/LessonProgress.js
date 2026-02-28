const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        // Seconds of the lesson the user has watched
        watchTime: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Populated every time the user opens the lesson
        lastAccessed: {
            type: Date,
            default: Date.now,
        },

        // Phase 4 — NGO analytics: gesture + sign overlay usage
        // Number of gesture events fired during this lesson session
        gestureEventsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Whether the student used the sign language overlay during this lesson
        signOverlayUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// One progress record per user per lesson
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
// Used for streak calculation – fetch all days a user completed something
LessonProgressSchema.index({ userId: 1, completed: 1, lastAccessed: -1 });
// Used to recalculate course progress
LessonProgressSchema.index({ userId: 1, courseId: 1, completed: 1 });

module.exports = mongoose.model('LessonProgress', LessonProgressSchema);
