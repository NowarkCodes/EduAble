const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Lesson title is required'],
            trim: true,
            maxlength: [200, 'Title must be 200 characters or less'],
        },
        videoUrl: {
            type: String,
            default: null,
        },
        // Full verbatim transcript for screen-reader / deaf users
        transcript: {
            type: String,
            default: '',
        },
        // WebVTT file URL for sign language overlay (Phase 2)
        // Each cue maps a timestamp range → word/phrase key looked up in SignVocabulary
        signLanguageVttUrl: {
            type: String,
            default: '',
        },
        // Cognitively simplified version of the lesson content
        simplifiedText: {
            type: String,
            default: '',
        },
        // Markdown notes visible after lesson completion
        notesMarkdown: {
            type: String,
            default: '',
        },
        // Duration in seconds
        duration: {
            type: Number,
            default: 0,
            min: 0,
        },
        // 1-based ordering within the course
        order: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

// Lessons are always fetched ordered within a course
LessonSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);
