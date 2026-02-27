const mongoose = require('mongoose');

const AccessibilityProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      default: null,
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    disabilityType: {
      type: [String],
      enum: [
        'blind_low_vision',
        'deaf_hard_of_hearing',
        'cognitive_disability',
        'motor_disability',
        'multiple_disabilities',
      ],
      default: [],
    },
    accessibilityPreferences: {
      // Blind / Low Vision
      screenReader: { type: Boolean, default: false },
      preferredAudioSpeed: { type: String, default: 'normal' },
      voiceNavigation: { type: Boolean, default: false },

      // Deaf / Hard of Hearing
      captionSize: { type: String, default: 'medium' },
      signLanguageSupport: { type: Boolean, default: false },

      // Motor Disability
      keyboardOnlyNavigation: { type: Boolean, default: false },
      voiceCommands: { type: Boolean, default: false },

      // Cognitive Disability
      dyslexiaMode: { type: Boolean, default: false },
      simplifiedInterface: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AccessibilityProfile', AccessibilityProfileSchema);
