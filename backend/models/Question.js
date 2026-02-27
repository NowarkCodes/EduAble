const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
            index: true,
        },
        text: {
            type: String,
            required: [true, 'Question text is required'],
            trim: true,
        },
        simplifiedText: {
            // Cognitive accessibility variant
            type: String,
            default: '',
            trim: true,
        },
        topicTag: {
            // E.g. "WCAG 2.2", "Keyboard Nav" — used for weak-area analytics
            type: String,
            default: 'General',
            trim: true,
        },
        options: [
            {
                label: {
                    type: String,
                    required: true,
                    trim: true, // "A", "B", "C", "D"
                },
                text: {
                    type: String,
                    required: true,
                    trim: true,
                },
            },
        ],
        correctOption: {
            type: String, // Matches one of the labels (e.g., "A")
            required: true,
            trim: true,
        },
        explanation: {
            // Shown after answering to help the student learn
            type: String,
            default: '',
            trim: true,
        },
        order: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

// Questions are always fetched ordered within a quiz
QuestionSchema.index({ quizId: 1, order: 1 });

module.exports = mongoose.model('Question', QuestionSchema);
