const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional if anonymous
    },
    category: {
        type: String,
        required: true,
        enum: ['Accessibility & Inclusivity', 'Course Content', 'Platform Bug', 'Feature Request']
    },
    sentiment: {
        type: String,
        enum: ['needs_work', 'neutral', 'great'],
        default: null
    },
    generalFeedback: {
        type: String
    },
    wcagIssue: {
        type: Boolean,
        default: null
    },
    audioClarity: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: null
    },
    screenReaderUse: {
        type: String,
        enum: ['frustrating', 'difficult', 'fluid', 'intuitive'],
        default: null
    },
    blindFeedback: {
        type: String
    },
    captionAccuracy: {
        type: String,
        enum: ['perfect', 'minor', 'major', 'unusable'],
        default: null
    },
    captionSync: {
        type: String,
        enum: ['perfectly', 'minor_delay', 'significant_delay'],
        default: null
    },
    deafFeedback: {
        type: String
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
