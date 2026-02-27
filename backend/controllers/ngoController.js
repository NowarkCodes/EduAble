const User = require('../models/User');
const NGOStats = require('../models/NGOStats');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const AccessibilityProfile = require('../models/AccessibilityProfile');
const asyncHandler = require('../utils/asyncHandler');

// -- Existing Endpoints --
exports.getStats = asyncHandler(async (req, res) => {
    const [totalUsers, onboardedUsers, ngoStats] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ onboardingCompleted: true }),
        NGOStats.findOne().lean(),
    ]);

    res.json({
        totalUsers,
        onboardedUsers,
        totalDonations: ngoStats?.totalDonations ?? 0,
        activeCampaigns: ngoStats?.activeCampaigns ?? 0,
        totalVolunteers: ngoStats?.totalVolunteers ?? 0,
        lastUpdated: ngoStats?.lastUpdated ?? null,
    });
});

exports.updateStats = asyncHandler(async (req, res) => {
    const { totalDonations, activeCampaigns, totalVolunteers } = req.body;
    const updated = await NGOStats.updateStats({
        ...(totalDonations !== undefined && { totalDonations }),
        ...(activeCampaigns !== undefined && { activeCampaigns }),
        ...(totalVolunteers !== undefined && { totalVolunteers }),
    });
    res.json({ message: 'NGO stats updated.', stats: updated });
});


// -- NEW: Advanced Analytics Endpoints for NGO Dashboard --

/**
 * GET /api/ngo/analytics/quiz-completion
 * Aggregates average pass rate grouped by disability type.
 */
exports.getQuizCompletionByDisability = asyncHandler(async (req, res) => {
    const data = await AccessibilityProfile.aggregate([
        {
            $lookup: {
                from: 'quizattempts',
                localField: 'userId',
                foreignField: 'userId',
                as: 'attempts',
            }
        },
        { $unwind: { path: '$attempts', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$disabilityType', preserveNullAndEmptyArrays: false } },
        {
            $group: {
                _id: '$disabilityType',
                totalAttempts: { $sum: 1 },
                passedAttempts: { $sum: { $cond: ['$attempts.passed', 1, 0] } }
            }
        },
        {
            $project: {
                disabilityType: '$_id',
                _id: 0,
                passRatePercentage: {
                    $round: [{ $multiply: [{ $divide: ['$passedAttempts', '$totalAttempts'] }, 100] }, 1]
                },
                totalAttempts: 1
            }
        },
        { $sort: { passRatePercentage: -1 } }
    ]);

    res.json({ data });
});

/**
 * GET /api/ngo/analytics/avg-score
 * Aggregates average score percentage grouped by disability type.
 */
exports.getAvgScoreByDisability = asyncHandler(async (req, res) => {
    const data = await AccessibilityProfile.aggregate([
        {
            $lookup: {
                from: 'quizattempts',
                localField: 'userId',
                foreignField: 'userId',
                as: 'attempts',
            }
        },
        { $unwind: { path: '$attempts', preserveNullAndEmptyArrays: false } },
        { $unwind: { path: '$disabilityType', preserveNullAndEmptyArrays: false } },
        {
            $group: {
                _id: '$disabilityType',
                avgScore: { $avg: '$attempts.score' },
                attemptCount: { $sum: 1 }
            }
        },
        {
            $project: {
                disabilityType: '$_id',
                _id: 0,
                avgScore: { $round: ['$avgScore', 1] },
                attemptCount: 1
            }
        },
        { $sort: { avgScore: -1 } }
    ]);

    res.json({ data });
});

/**
 * GET /api/ngo/analytics/a11y-usage
 * Counts the utilization of specific accessibility modes during quizzes.
 */
exports.getA11yModeUsage = asyncHandler(async (req, res) => {
    const data = await QuizAttempt.aggregate([
        { $unwind: { path: '$usedAccessibilityModes', preserveNullAndEmptyArrays: false } },
        {
            $group: {
                _id: '$usedAccessibilityModes',
                usageCount: { $sum: 1 }
            }
        },
        {
            $project: {
                mode: '$_id',
                _id: 0,
                usageCount: 1
            }
        },
        { $sort: { usageCount: -1 } }
    ]);

    res.json({ data });
});
