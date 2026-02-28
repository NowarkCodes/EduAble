const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @route   POST api/feedback
// @desc    Submit new feedback
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const {
            category,
            sentiment,
            generalFeedback,
            wcagIssue,
            audioClarity,
            screenReaderUse,
            blindFeedback,
            captionAccuracy,
            captionSync,
            deafFeedback,
            isAnonymous
        } = req.body;

        const newFeedback = new Feedback({
            user: isAnonymous ? null : req.user.id,
            category,
            sentiment,
            generalFeedback,
            wcagIssue,
            audioClarity,
            screenReaderUse,
            blindFeedback,
            captionAccuracy,
            captionSync,
            deafFeedback,
            isAnonymous
        });

        const feedback = await newFeedback.save();
        res.json(feedback);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback
// @desc    Get all feedback (for admin/ngo dashboard)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const feedbackList = await Feedback.find().sort({ createdAt: -1 }).populate('user', ['name', 'email', 'role']);
        res.json(feedbackList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
