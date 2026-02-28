import { useState } from 'react';
import { X, Mic, Frown, Meh, Smile, Ear, CheckCircle2, Loader2 } from 'lucide-react';
import { feedbackApi } from '@/lib/api';

interface FeedbackModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    onSubmitAction: () => void;
}

export default function FeedbackModal({ isOpen, onCloseAction, onSubmitAction }: FeedbackModalProps) {
    const [step, setStep] = useState(1);

    // Step 1 State
    const [category, setCategory] = useState('Accessibility & Inclusivity');
    const [sentiment, setSentiment] = useState<'needs_work' | 'neutral' | 'great' | null>(null);
    const [generalFeedback, setGeneralFeedback] = useState('');
    const [wcagIssue, setWcagIssue] = useState<boolean | null>(null);

    // Step 2 State
    const [audioClarity, setAudioClarity] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
    const [screenReaderUse, setScreenReaderUse] = useState<'frustrating' | 'difficult' | 'fluid' | 'intuitive'>('fluid');
    const [blindFeedback, setBlindFeedback] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Step 3 State
    const [captionAccuracy, setCaptionAccuracy] = useState('');
    const [captionSync, setCaptionSync] = useState<'perfectly' | 'minor_delay' | 'significant_delay' | null>(null);
    const [deafFeedback, setDeafFeedback] = useState('');

    // Footer State
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            await feedbackApi.submit({
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
            onSubmitAction();
            setStep(1); // Reset
            // Reset state
            setCategory('Accessibility & Inclusivity');
            setSentiment(null);
            setGeneralFeedback('');
            setWcagIssue(null);
            setAudioClarity('good');
            setScreenReaderUse('fluid');
            setBlindFeedback('');
            setCaptionAccuracy('');
            setCaptionSync(null);
            setDeafFeedback('');
            setIsAnonymous(false);
        } catch (err) {
            console.error('Failed to submit feedback', err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <div
                className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <h2 id="feedback-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {step === 1 && "Share Your Feedback"}
                        {step === 2 && "Disability-Specific Feedback"}
                        {step === 3 && "Accessibility Experience"}
                    </h2>
                    <button
                        onClick={onCloseAction}
                        className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-bold"
                        aria-label="Close feedback form"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-5 pb-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <span>Feedback Progress</span>
                        <span className="text-blue-600">Step {step} of 3</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

                    {/* ─── STEP 1 ──────────────────────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-slate-600 text-sm font-medium">
                                Your input helps us create a more inclusive learning experience for everyone.
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Category</label>
                                <select
                                    className="w-full bg-white border-2 border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 appearance-none transition-all shadow-sm"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option>Accessibility & Inclusivity</option>
                                    <option>Course Content</option>
                                    <option>Platform Bug</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-900">How was your experience today?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setSentiment('needs_work')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all shadow-sm ${sentiment === 'needs_work' ? 'border-red-500 bg-red-50 text-red-700 font-extrabold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold'
                                            }`}
                                    >
                                        <Frown size={28} className="mb-2" />
                                        <span className="text-xs">Needs Work</span>
                                    </button>
                                    <button
                                        onClick={() => setSentiment('neutral')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all shadow-sm ${sentiment === 'neutral' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-extrabold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold'
                                            }`}
                                    >
                                        <Meh size={28} className="mb-2" />
                                        <span className="text-xs">Neutral</span>
                                    </button>
                                    <button
                                        onClick={() => setSentiment('great')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all shadow-sm ${sentiment === 'great' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold'
                                            }`}
                                    >
                                        <Smile size={28} className="mb-2" />
                                        <span className="text-xs">Great</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tell Us More</label>
                                <textarea
                                    className="w-full bg-white border-2 border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 min-h-[100px] resize-y shadow-sm transition-all"
                                    placeholder="What worked well? What could be better?"
                                    value={generalFeedback}
                                    onChange={(e) => setGeneralFeedback(e.target.value)}
                                />
                            </div>

                            {/* WCAG Box */}
                            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 sm:p-5 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <Ear size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">WCAG Compliance</h4>
                                    <p className="text-xs font-medium text-slate-600 mb-4">Did you encounter any screen reader or keyboard navigation issues?</p>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${wcagIssue === true ? 'border-blue-600 bg-blue-50' : 'border-slate-300 group-hover:border-slate-500 bg-white'}`}>
                                                {wcagIssue === true && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">Yes</span>
                                            <input type="radio" className="sr-only" checked={wcagIssue === true} onChange={() => setWcagIssue(true)} />
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${wcagIssue === false ? 'border-blue-600 bg-blue-50' : 'border-slate-300 group-hover:border-slate-500 bg-white'}`}>
                                                {wcagIssue === false && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">No</span>
                                            <input type="radio" className="sr-only" checked={wcagIssue === false} onChange={() => setWcagIssue(false)} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 2 ──────────────────────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-slate-600 text-sm font-medium">
                                Your feedback helps us improve platform accessibility for Blind students. We prioritize your experience.
                            </p>

                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900 text-sm">1. Audio Clarity</h3>
                                <p className="text-xs font-medium text-slate-500">How clear were the generated descriptions and narration?</p>
                                <div className="flex bg-slate-100 rounded-xl p-1.5 overflow-hidden border border-slate-200">
                                    {['poor', 'fair', 'good', 'excellent'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setAudioClarity(opt as any)}
                                            className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${audioClarity === opt ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900 text-sm">2. Screen Reader Ease of Use</h3>
                                <p className="text-xs font-medium text-slate-500">Rate the structural logic and ARIA implementation.</p>
                                <div className="flex bg-slate-100 rounded-xl p-1.5 overflow-hidden border border-slate-200">
                                    {['frustrating', 'difficult', 'fluid', 'intuitive'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setScreenReaderUse(opt as any)}
                                            className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${screenReaderUse === opt ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-sm">3. Additional Comments</h3>
                                    <button
                                        onClick={() => setIsListening(!isListening)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${isListening ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20 shadow-md'
                                            }`}
                                    >
                                        <Mic size={14} />
                                        {isListening ? 'Stop Listening' : 'Start Voice-to-Text'}
                                    </button>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className={`w-full bg-white border-2 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 focus:outline-none min-h-[100px] resize-y transition-all shadow-sm ${isListening ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                                            }`}
                                        placeholder="Describe your experience here..."
                                        value={blindFeedback}
                                        onChange={(e) => setBlindFeedback(e.target.value)}
                                    />
                                    {isListening && (
                                        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full shadow-lg">
                                            <div className="flex gap-1 h-3 items-end">
                                                <div className="w-1 bg-blue-400 animate-[bounce_1s_infinite] h-full" />
                                                <div className="w-1 bg-blue-400 animate-[bounce_1s_infinite_0.2s] h-1/2" />
                                                <div className="w-1 bg-blue-400 animate-[bounce_1s_infinite_0.4s] h-3/4" />
                                                <div className="w-1 bg-blue-400 animate-[bounce_1s_infinite_0.6s] h-1/4" />
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-slate-100 tracking-wider">Listening</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3 ──────────────────────────────────────────────── */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <p className="text-slate-600 text-sm font-medium">
                                Help us tailor your learning environment. Current Profile: <span className="text-blue-700 font-black bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Deaf / Hard of Hearing</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Rate Caption Accuracy</label>
                                    <p className="text-xs font-medium text-slate-500 mb-2">How precise were the auto-generated captions in your last module?</p>
                                    <select
                                        className="w-full bg-white border-2 border-slate-200 text-slate-900 font-bold text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 appearance-none shadow-sm"
                                        value={captionAccuracy}
                                        onChange={(e) => setCaptionAccuracy(e.target.value)}
                                    >
                                        <option value="" disabled>Select an option</option>
                                        <option value="perfect">Perfect - No errors</option>
                                        <option value="minor">Minor spelling errors</option>
                                        <option value="major">Major errors, hard to follow</option>
                                        <option value="unusable">Unusable</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-900">Caption Synchronization</label>
                                    <p className="text-xs font-medium text-slate-500 mb-2">Did the text align with the speaker's timing?</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setCaptionSync('perfectly')}
                                            className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${captionSync === 'perfectly' ? 'border-blue-500 bg-blue-50 text-blue-700 font-extrabold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold'
                                                }`}
                                        >
                                            {captionSync === 'perfectly' && <CheckCircle2 size={16} strokeWidth={3} />}
                                            Perfectly
                                        </button>
                                        <button
                                            onClick={() => setCaptionSync('minor_delay')}
                                            className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${captionSync === 'minor_delay' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-extrabold' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold'
                                                }`}
                                        >
                                            {captionSync === 'minor_delay' && <CheckCircle2 size={16} strokeWidth={3} />}
                                            Minor Delay
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-900">Detailed Accessibility Feedback</label>
                                <textarea
                                    className="w-full bg-white border-2 border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 min-h-[120px] resize-y shadow-sm"
                                    placeholder="Tell us about specific terms or sections where captions failed..."
                                    value={deafFeedback}
                                    onChange={(e) => setDeafFeedback(e.target.value)}
                                />
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`relative w-11 h-6 rounded-full transition-colors border-2 ${isAnonymous ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-200 group-hover:bg-slate-300 group-hover:border-slate-300'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isAnonymous ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Submit Anonymously</span>
                        <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                    </label>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto shadow-sm"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                className="px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto shadow-sm"
                                onClick={onCloseAction}
                            >
                                Cancel
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-colors shadow-lg shadow-blue-600/20 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        Submitting...
                                        <Loader2 size={16} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Submit Feedback
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                {error && (
                    <div className="bg-red-50 text-red-600 text-xs font-bold p-3 text-center border-t border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
