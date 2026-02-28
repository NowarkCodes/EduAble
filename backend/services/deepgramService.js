'use strict';

const { createClient } = require('@deepgram/sdk');

/**
 * Transcribe an audio/video URL using Deepgram's pre-recorded API.
 *
 * @param {string} audioUrl - A publicly accessible (or signed) URL of the audio/video file.
 * @returns {Promise<string>} - The plain-text transcript.
 * @throws {Error} - If the API key is missing or Deepgram returns an error.
 */
async function transcribeUrl(audioUrl) {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey || apiKey === 'your_deepgram_api_key_here') {
        throw new Error('DEEPGRAM_API_KEY is not configured in .env');
    }

    const deepgram = createClient(apiKey);

    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        {
            model: 'nova-3',        // Best accuracy as of 2025
            language: 'en',
            smart_format: true,     // Adds punctuation, paragraphs, etc.
            punctuate: true,
            diarize: false,         // No speaker separation needed
        }
    );

    if (error) {
        throw new Error(`Deepgram error: ${error.message || JSON.stringify(error)}`);
    }

    // Extract plain text from the response
    const transcript =
        result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '';

    return transcript;
}

module.exports = { transcribeUrl };
