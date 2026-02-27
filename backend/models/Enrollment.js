const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
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
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            enum: ['in_progress', 'completed'],
            default: 'in_progress',
            index: true,
        },
        // Last lesson the user was on
        lastAccessedLesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            default: null,
        },
        // Tracks which module (chapter) the user was on
        lastAccessedModuleLabel: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// One enrollment per user per course
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
// Used for dashboard "active enrollments" query
EnrollmentSchema.index({ userId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
