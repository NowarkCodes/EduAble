const TranscriptRequest = require('../models/TranscriptRequest');
const asyncHandler = require('../utils/asyncHandler');

/* ── GET /api/transcript-requests ───────────────────────────────── */
// Fetch all transcript requests sorted by upvotes descending
exports.getRequests = asyncHandler(async (req, res) => {
    const requests = await TranscriptRequest.find()
        .populate('userId', 'name')
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(20) // Limit to top 20 for community board optimization
        .lean();

    // Map output to match frontend shape requirements
    const mappedRequests = requests.map(req => ({
        id: req._id.toString(),
        title: req.title,
        author: req.author,
        tag: formatEnumToString(req.format),
        upvotes: req.upvotes,
        requestedBy: req.userId?.name || 'Anonymous'
    }));

    res.json({ success: true, requests: mappedRequests });
});

// Helper for UI label mapping
function formatEnumToString(format) {
    switch (format) {
        case 'large_print': return 'Large Print';
        case 'audio': return 'Audio';
        case 'braille': return 'Braille';
        case 'text': return 'Text';
        default: return 'Text';
    }
}
