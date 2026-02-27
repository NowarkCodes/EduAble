'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { profileApi, OnboardingData } from '@/lib/api';

/* ── Types ────────────────────────────────────────── */
type Step1Data = { name: string; contactNumber: string; age: string; preferredLanguage: string };
type DisabilityKey = 'blind_low_vision' | 'deaf_hard_of_hearing' | 'cognitive_disability' | 'motor_disability' | 'multiple_disabilities';
type Prefs = Record<string, boolean | string>;

/* ── Constants ────────────────────────────────────── */
const STEPS = ['Personal Info', 'Disabilities', 'Preferences', 'Review'];

const DISABILITIES: { key: DisabilityKey; label: string; emoji: string }[] = [
    { key: 'blind_low_vision', label: 'Blind / Low Vision', emoji: '👁️' },
    { key: 'deaf_hard_of_hearing', label: 'Deaf / Hard of Hearing', emoji: '🔇' },
    { key: 'cognitive_disability', label: 'Cognitive Disability', emoji: '🧠' },
    { key: 'motor_disability', label: 'Motor Disability', emoji: '♿' },
    { key: 'multiple_disabilities', label: 'Multiple Disabilities', emoji: '🌟' },
];

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'Mandarin', 'Arabic', 'Portuguese', 'Other'];

/* ── Dynamic Questions ────────────────────────────── */
type Question = { key: string; label: string; type: 'boolean' | 'select'; options?: string[] };

function questionsFor(disabilities: DisabilityKey[]): Question[] {
    const q: Question[] = [];
    if (disabilities.includes('blind_low_vision')) {
        q.push(
            { key: 'screenReader', label: 'Do you use a screen reader?', type: 'boolean' },
            { key: 'preferredAudioSpeed', label: 'Preferred audio speed?', type: 'select', options: ['slow', 'normal', 'fast'] },
            { key: 'voiceNavigation', label: 'Enable voice navigation?', type: 'boolean' },
        );
    }
    if (disabilities.includes('deaf_hard_of_hearing')) {
        q.push(
            { key: 'captionSize', label: 'Caption size preference?', type: 'select', options: ['small', 'medium', 'large'] },
            { key: 'signLanguageSupport', label: 'Require sign language support?', type: 'boolean' },
        );
    }
    if (disabilities.includes('motor_disability')) {
        q.push(
            { key: 'keyboardOnlyNavigation', label: 'Keyboard-only navigation required?', type: 'boolean' },
            { key: 'voiceCommands', label: 'Voice commands needed?', type: 'boolean' },
        );
    }
    if (disabilities.includes('cognitive_disability')) {
        q.push(
            { key: 'dyslexiaMode', label: 'Enable dyslexia-friendly mode?', type: 'boolean' },
            { key: 'simplifiedInterface', label: 'Simplified interface required?', type: 'boolean' },
        );
    }
    return q;
}

/* ── Step Indicator ───────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
    return (
        <nav aria-label="Onboarding progress" className="mb-8">
            <ol className="flex items-center gap-0" role="list">
                {STEPS.map((label, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                        <li key={label} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    aria-current={active ? 'step' : undefined}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${done ? 'bg-primary border-primary text-primary-foreground' :
                                            active ? 'border-primary bg-primary/10 text-primary' :
                                                'border-border bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {done ? (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                            <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-[10px] font-semibold text-center hidden sm:block ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 rounded ${i < current ? 'bg-primary' : 'bg-border'}`} aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/* ── Main Component ───────────────────────────────── */
export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = useState(0);
    const [step1, setStep1] = useState<Step1Data>({ name: user?.name || '', contactNumber: '', age: '', preferredLanguage: 'English' });
    const [selectedDisabilities, setSelectedDisabilities] = useState<DisabilityKey[]>([]);
    const [prefs, setPrefs] = useState<Prefs>({});
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    /* Helpers */
    const toggleDisability = (key: DisabilityKey) =>
        setSelectedDisabilities((prev) =>
            prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
        );

    const setPref = (key: string, value: boolean | string) =>
        setPrefs((p) => ({ ...p, [key]: value }));

    /* Submit final form */
    const handleSubmit = async () => {
        if (!user) return;
        setApiError('');
        setSubmitting(true);
        try {
            const payload: OnboardingData = {
                contactNumber: step1.contactNumber,
                age: step1.age ? Number(step1.age) : null,
                preferredLanguage: step1.preferredLanguage,
                disabilityType: selectedDisabilities,
                accessibilityPreferences: prefs,
            };
            await profileApi.create(payload);
            // Update localStorage user flag
            const stored = localStorage.getItem('edulearn_user');
            if (stored) {
                const u = JSON.parse(stored);
                localStorage.setItem('edulearn_user', JSON.stringify({ ...u, onboardingCompleted: true }));
            }
            router.push('/dashboard');
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const questions = questionsFor(selectedDisabilities);

    /* ── Render ─────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-xl mb-6">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        EduLearn
                    </a>
                    <h1 className="text-2xl font-extrabold text-foreground">Set up your accessibility profile</h1>
                    <p className="text-sm text-muted-foreground mt-2">This helps us personalize your learning experience.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8">
                    <StepIndicator current={step} />

                    {/* ── STEP 0: Personal Info ── */}
                    {step === 0 && (
                        <section aria-labelledby="step1-heading">
                            <h2 id="step1-heading" className="text-lg font-extrabold text-foreground mb-6">Personal Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'name' as const, label: 'Full Name', type: 'text', required: true, placeholder: 'Ada Lovelace' },
                                    { key: 'contactNumber' as const, label: 'Contact Number', type: 'tel', required: false, placeholder: '+1 234 567 8900' },
                                    { key: 'age' as const, label: 'Age (optional)', type: 'number', required: false, placeholder: '25' },
                                ].map((f) => (
                                    <div key={f.key} className={f.key === 'name' ? 'sm:col-span-2' : ''}>
                                        <label htmlFor={`s1-${f.key}`} className="block text-sm font-semibold text-foreground mb-1.5">
                                            {f.label} {f.required && <span aria-hidden="true" className="text-destructive">*</span>}
                                        </label>
                                        <input
                                            id={`s1-${f.key}`}
                                            type={f.type}
                                            aria-required={f.required}
                                            value={step1[f.key]}
                                            onChange={(e) => setStep1((s) => ({ ...s, [f.key]: e.target.value }))}
                                            placeholder={f.placeholder}
                                            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        />
                                    </div>
                                ))}
                                <div className="sm:col-span-2">
                                    <label htmlFor="s1-lang" className="block text-sm font-semibold text-foreground mb-1.5">
                                        Preferred Language
                                    </label>
                                    <select
                                        id="s1-lang"
                                        value={step1.preferredLanguage}
                                        onChange={(e) => setStep1((s) => ({ ...s, preferredLanguage: e.target.value }))}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    >
                                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── STEP 1: Disability Selection ── */}
                    {step === 1 && (
                        <section aria-labelledby="step2-heading">
                            <h2 id="step2-heading" className="text-lg font-extrabold text-foreground mb-2">Disability Selection</h2>
                            <p className="text-sm text-muted-foreground mb-6">Select all that apply. This helps us adapt the platform to your needs.</p>
                            <fieldset>
                                <legend className="sr-only">Select your disability type(s)</legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Disability types">
                                    {DISABILITIES.map((d) => {
                                        const checked = selectedDisabilities.includes(d.key);
                                        return (
                                            <label
                                                key={d.key}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked
                                                        ? 'border-primary bg-primary/8'
                                                        : 'border-border hover:border-primary/50 bg-background'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleDisability(d.key)}
                                                    className="w-5 h-5 rounded accent-primary"
                                                    aria-label={d.label}
                                                />
                                                <span className="text-xl" aria-hidden="true">{d.emoji}</span>
                                                <span className="text-sm font-semibold text-foreground">{d.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </section>
                    )}

                    {/* ── STEP 2: Dynamic Preferences ── */}
                    {step === 2 && (
                        <section aria-labelledby="step3-heading">
                            <h2 id="step3-heading" className="text-lg font-extrabold text-foreground mb-2">Accessibility Preferences</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                {questions.length === 0
                                    ? 'No specific questions for your selections. Click Next to continue.'
                                    : 'Answer based on your accessibility needs.'}
                            </p>
                            <div className="flex flex-col gap-4">
                                {questions.map((q) => (
                                    <div key={q.key} className="p-4 bg-muted/30 rounded-xl border border-border">
                                        <p className="text-sm font-semibold text-foreground mb-3">{q.label}</p>
                                        {q.type === 'boolean' ? (
                                            <div className="flex gap-3" role="radiogroup" aria-label={q.label}>
                                                {[['Yes', true], ['No', false]].map(([label, val]) => (
                                                    <label key={String(label)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${prefs[q.key] === val ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                                                        <input
                                                            type="radio"
                                                            name={q.key}
                                                            checked={prefs[q.key] === val}
                                                            onChange={() => setPref(q.key, val as boolean)}
                                                            className="accent-primary"
                                                        />
                                                        <span className="text-sm font-medium text-foreground">{String(label)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <select
                                                aria-label={q.label}
                                                value={(prefs[q.key] as string) || q.options![0]}
                                                onChange={(e) => setPref(q.key, e.target.value)}
                                                className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            >
                                                {q.options!.map((o) => (
                                                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── STEP 3: Review & Submit ── */}
                    {step === 3 && (
                        <section aria-labelledby="step4-heading">
                            <h2 id="step4-heading" className="text-lg font-extrabold text-foreground mb-6">Review Your Profile</h2>

                            {apiError && (
                                <div role="alert" aria-live="assertive" className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                                    {apiError}
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                {/* Personal */}
                                <div className="bg-muted/30 rounded-xl border border-border p-5">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Personal Details</h3>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {[
                                            ['Name', step1.name || '—'],
                                            ['Contact', step1.contactNumber || '—'],
                                            ['Age', step1.age || '—'],
                                            ['Language', step1.preferredLanguage],
                                        ].map(([k, v]) => (
                                            <div key={k}>
                                                <dt className="text-muted-foreground font-medium">{k}</dt>
                                                <dd className="text-foreground font-semibold">{v}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                {/* Disabilities */}
                                <div className="bg-muted/30 rounded-xl border border-border p-5">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Disabilities Selected</h3>
                                    {selectedDisabilities.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">None selected</p>
                                    ) : (
                                        <ul className="flex flex-wrap gap-2 list-none">
                                            {selectedDisabilities.map((d) => {
                                                const found = DISABILITIES.find((x) => x.key === d);
                                                return (
                                                    <li key={d} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
                                                        <span aria-hidden="true">{found?.emoji}</span>
                                                        {found?.label}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* Preferences */}
                                {Object.keys(prefs).length > 0 && (
                                    <div className="bg-muted/30 rounded-xl border border-border p-5">
                                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Preferences</h3>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            {Object.entries(prefs).map(([k, v]) => (
                                                <div key={k}>
                                                    <dt className="text-muted-foreground font-medium capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                                                    <dd className="text-foreground font-semibold">{String(v)}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        <button
                            onClick={() => setStep((s) => s - 1)}
                            disabled={step === 0}
                            className="h-11 px-6 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Go to previous step"
                        >
                            ← Previous
                        </button>

                        <span className="text-xs text-muted-foreground font-medium" aria-live="polite">
                            Step {step + 1} of {STEPS.length}
                        </span>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep((s) => s + 1)}
                                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label="Go to next step"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                aria-busy={submitting}
                                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving…
                                    </span>
                                ) : 'Complete Setup →'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
