const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title must be 200 characters or less'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
            index: true,
        },
        thumbnail: {
            type: String,
            default: null,
        },
        instructorName: {
            type: String,
            required: [true, 'Instructor name is required'],
            trim: true,
        },
        accessibilityTags: {
            type: [String],
            enum: [
                'screen-reader-friendly',
                'caption-supported',
                'sign-language',
                'simplified-text',
                'keyboard-navigable',
                'voice-commands',
                'dyslexia-friendly',
                'audio-described',
            ],
            default: [],
            index: true,
        },
        level: {
            type: String,
            enum: ['Beginner', 'Foundations', 'Intermediate', 'Advanced'],
            required: true,
        },
        totalLessons: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalDuration: {
            // Total duration in minutes
            type: Number,
            default: 0,
            min: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true }
);

// Compound index for efficient browsing queries
CourseSchema.index({ category: 1, level: 1, isPublished: 1 });
CourseSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Course', CourseSchema);
