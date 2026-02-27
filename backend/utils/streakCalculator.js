/**
 * Calculates a user's current learning streak (consecutive days of activity).
 *
 * @param {Date[]} dates - Array of `lastAccessed` dates where completed = true.
 *                         Must be sorted descending (most recent first).
 * @returns {number} - Current streak in days.
 */
function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;

    // Normalize each date to midnight UTC to compare calendar days
    const uniqueDays = [
        ...new Set(
            dates.map((d) => {
                const date = new Date(d);
                date.setUTCHours(0, 0, 0, 0);
                return date.getTime();
            })
        ),
    ].sort((a, b) => b - a); // descending

    const ONE_DAY_MS = 86_400_000;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const yesterdayMs = todayMs - ONE_DAY_MS;

    // Streak must start from today or yesterday to be considered active
    if (uniqueDays[0] < yesterdayMs) return 0;

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const diff = uniqueDays[i - 1] - uniqueDays[i];
        if (diff === ONE_DAY_MS) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

module.exports = { calculateStreak };
