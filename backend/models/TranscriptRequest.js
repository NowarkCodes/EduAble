const mongoose = require('mongoose');

const transcriptRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    format: {
        type: String,
        enum: ['audio', 'text', 'braille', 'large_print'],
        required: true
    },
    context: {
        type: String,
        trim: true,
        default: ''
    },
    upvotes: {
        type: Number,
        default: 1
    },
    paymentId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('TranscriptRequest', transcriptRequestSchema);
