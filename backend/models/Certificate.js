const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
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
        issuedAt: {
            type: Date,
            default: Date.now,
        },
        // URL or storage path where the generated PDF/image lives
        certificateUrl: {
            type: String,
            required: true,
        },
    },
    { timestamps: false }
);

// One certificate per user per course
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
