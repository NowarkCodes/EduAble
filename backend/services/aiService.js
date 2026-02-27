/**
 * Mock AI Service for Quiz Generation
 * In production, this would make an HTTPS call to the Gemini API / OpenAI API.
 * For this hackathon/implementation, it returns a hardcoded mock that perfectly mimics
 * the expected LLM JSON output based on the transcript.
 */

async function generateQuizFromTranscript(transcriptText, topicHint = "General") {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`[AI SERVICE] Generating quiz for transcript length: ${transcriptText?.length || 0}`);

    // This is the shape the LLM is prompted to return
    return {
        title: `AI Generated Quiz: ${topicHint}`,
        passingScore: 60,
        questions: [
            {
                text: "What is the primary goal of the Web Content Accessibility Guidelines (WCAG)?",
                simplifiedText: "Why do we use WCAG rules?",
                topicTag: "WCAG Principles",
                options: [
                    { label: "A", text: "To make websites run faster on old computers." },
                    { label: "B", text: "To ensure web content is accessible to people with disabilities." },
                    { label: "C", text: "To force developers to use specific programming languages." },
                    { label: "D", text: "To organize internet search results better." }
                ],
                correctOption: "B",
                explanation: "WCAG provides a single shared standard for web content accessibility that meets the needs of individuals, organizations, and governments internationally.",
                order: 1
            },
            {
                text: "Which of the following is NOT a core principle of WCAG 2.1?",
                simplifiedText: "Which word is NOT part of the POUR rules for websites?",
                topicTag: "POUR Principles",
                options: [
                    { label: "A", text: "Perceivable" },
                    { label: "B", text: "Operable" },
                    { label: "C", text: "Profitable" },
                    { label: "D", text: "Robust" }
                ],
                correctOption: "C",
                explanation: "The four principles are Perceivable, Operable, Understandable, and Robust (POUR). Profitable is not an accessibility principle.",
                order: 2
            },
            {
                text: "Why is semantic HTML important for users relying on screen readers?",
                simplifiedText: "Why do screen readers need correct HTML tags?",
                topicTag: "Semantic HTML",
                options: [
                    { label: "A", text: "It allows the screen reader to understand the structure and meaning of the content (like headings vs. paragraphs)." },
                    { label: "B", text: "It changes the visual colors of the website automatically." },
                    { label: "C", text: "Semantic HTML is only used to improve SEO ranking, not for screen readers." },
                    { label: "D", text: "It translates the text into different languages automatically." }
                ],
                correctOption: "A",
                explanation: "Semantic HTML elements (like <nav>, <main>, <h1>) convey meaning and structure, allowing assistive technologies to navigate and present the content correctly to the user.",
                order: 3
            }
        ]
    };
}

module.exports = {
    generateQuizFromTranscript
};
