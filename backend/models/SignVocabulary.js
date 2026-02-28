const mongoose = require('mongoose');

/**
 * SignVocabulary.js
 *
 * Stores word-level ISL and ASL sign video URLs.
 * Keys: lowercase word/phrase.
 * Values: GCS public URLs to pre-recorded MP4 sign clips.
 *
 * Phase 2 of hand gesture / sign language integration.
 */

const SignVocabularySchema = new mongoose.Schema(
    {
        // Lowercase word or short phrase (the lookup key)
        word: {
            type: String,
            required: [true, 'Word is required'],
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
        },
        // Indian Sign Language clip URL (GCS public URL or CDN)
        isl: {
            type: String,
            default: null,
        },
        // American Sign Language clip URL
        asl: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Fast lookup by word list
SignVocabularySchema.index({ word: 1 });

module.exports = mongoose.model('SignVocabulary', SignVocabularySchema);
