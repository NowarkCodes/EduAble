const SignVocabulary = require('../models/SignVocabulary');

/**
 * signsController.js
 *
 * GET /api/signs/lookup?words=hello,learn&lang=ISL
 *
 * Returns a JSON map { word → clipUrl | null }.
 * Non-fatal: missing words return null (never throws 4xx/5xx for vocab misses).
 *
 * Phase 2 — Sign Language Overlay support.
 */

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function lookupSigns(req, res, next) {
    try {
        const rawWords = req.query.words;
        const lang = (req.query.lang || 'ISL').toString().toLowerCase(); // 'isl' | 'asl'

        if (!rawWords) {
            return res.status(400).json({ error: 'words query parameter is required' });
        }

        // Parse and normalise words
        const words = rawWords
            .toString()
            .split(',')
            .map(w => w.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 50); // safety cap

        if (words.length === 0) {
            return res.json({});
        }

        // Fetch all matching documents in one query
        const docs = await SignVocabulary.find({ word: { $in: words } })
            .select('word isl asl')
            .lean();

        // Build lookup map
        const map = new Map(docs.map(d => [d.word, d]));

        // Build result: every requested word gets a key (null if not found)
        const result = {};
        for (const word of words) {
            const doc = map.get(word);
            if (!doc) {
                result[word] = null;
                continue;
            }
            // Accept 'isl' or 'asl'; fallback to the other if preferred is missing
            const preferred = lang === 'asl' ? doc.asl : doc.isl;
            const fallback = lang === 'asl' ? doc.isl : doc.asl;
            result[word] = preferred || fallback || null;
        }

        return res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { lookupSigns };
