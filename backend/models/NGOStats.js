const mongoose = require('mongoose');

// Singleton document — always upsert on the same record ID
const NGOStatsSchema = new mongoose.Schema(
    {
        totalDonations: {
            type: Number,
            default: 0,
            min: 0,
        },
        activeCampaigns: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalVolunteers: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

/**
 * Upserts the singleton NGOStats document.
 * Call this whenever donations, campaigns, or volunteer counts change.
 */
NGOStatsSchema.statics.updateStats = async function (updates) {
    return this.findOneAndUpdate(
        {},
        { ...updates, lastUpdated: new Date() },
        { new: true, upsert: true, runValidators: true }
    );
};

module.exports = mongoose.model('NGOStats', NGOStatsSchema);
