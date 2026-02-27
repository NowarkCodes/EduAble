const User = require('../models/User');
const NGOStats = require('../models/NGOStats');
const asyncHandler = require('../utils/asyncHandler');

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

/* Admin-only: update NGO stats (campaign/volunteer/donation counts) */
exports.updateStats = asyncHandler(async (req, res) => {
    const { totalDonations, activeCampaigns, totalVolunteers } = req.body;

    const updated = await NGOStats.updateStats({
        ...(totalDonations !== undefined && { totalDonations }),
        ...(activeCampaigns !== undefined && { activeCampaigns }),
        ...(totalVolunteers !== undefined && { totalVolunteers }),
    });

    res.json({ message: 'NGO stats updated.', stats: updated });
});
