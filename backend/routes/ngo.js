const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onboardedUsers = await User.countDocuments({ onboardingCompleted: true });

    res.json({
      totalUsers,
      onboardedUsers,
      // The other metrics are mocked since they aren't in the DB yet
      totalDonations: 45231,
      activeCampaigns: 5,
      totalVolunteers: 128
    });
  } catch (err) {
    console.error('[ngo/stats]', err);
    res.status(500).json({ error: 'Server error fetching stats.' });
  }
});

module.exports = router;
