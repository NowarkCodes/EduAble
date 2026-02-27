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
const STEPS = ['Personal', 'Disabilities', 'Preferences', 'Review'];

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
            <ol className="flex items-center" role="list">
                {STEPS.map((label, i) => {
                    const done = i < current;
                    const active = i === current;
                    return (
                        <li key={label} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1.5 min-w-0">
                                <div
                                    aria-current={active ? 'step' : undefined}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200 shrink-0
                                        ${done ? 'bg-primary border-primary text-primary-foreground shadow-sm' :
                                            active ? 'border-primary bg-primary/10 text-primary shadow-sm' :
                                                'border-border bg-background text-muted-foreground'}`}
                                >
                                    {done ? (
                                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                            <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : i + 1}
                                </div>
                                <span className={`text-[10px] font-semibold truncate max-w-[56px] text-center hidden xs:block
                                    ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    aria-hidden="true"
                                    className={`flex-1 h-px mx-2 transition-colors duration-300
                                        ${i < current ? 'bg-primary' : 'bg-border'}`}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/* ── Field wrapper ────────────────────────────────── */
function Field({ label, htmlFor, required, children }: {
    label: string; htmlFor: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
                {label}{required && <span className="text-destructive ml-0.5" aria-hidden>*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    'w-full h-10 px-3.5 rounded-lg border border-border bg-background text-foreground text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors placeholder:text-muted-foreground/60';

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
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Step1Data, string>>>({});

    const validateStep1 = (): boolean => {
        const errors: Partial<Record<keyof Step1Data, string>> = {};

        if (!step1.name.trim()) {
            errors.name = 'Full name is required.';
        }

        if (step1.contactNumber.trim()) {
            // Allow optional + prefix, then 7–15 digits (spaces/dashes allowed)
            const digitsOnly = step1.contactNumber.replace(/[\s\-]/g, '');
            if (!/^\+?\d{7,15}$/.test(digitsOnly)) {
                errors.contactNumber = 'Enter a valid phone number (7–15 digits).';
            }
        }

        if (step1.age.trim()) {
            const age = Number(step1.age);
            if (!Number.isInteger(age) || age < 1 || age > 120) {
                errors.age = 'Age must be a whole number between 1 and 120.';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const toggleDisability = (key: DisabilityKey) =>
        setSelectedDisabilities(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);

    const setPref = (key: string, value: boolean | string) =>
        setPrefs(p => ({ ...p, [key]: value }));

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

    return (
        <div className="min-h-screen bg-muted/40 flex items-start justify-center py-10 px-4">
            <div className="w-full max-w-xl">

                {/* Logo + header */}
                <div className="text-center mb-6">
                    <a href="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-lg mb-5">
                        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        EduLearn
                    </a>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                        Set up your accessibility profile
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1.5">
                        Personalise your learning experience in a few steps.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-8">
                    <StepIndicator current={step} />

                    {/* ── STEP 0: Personal Info ── */}
                    {step === 0 && (
                        <section aria-labelledby="step1-heading">
                            <h2 id="step1-heading" className="text-base font-bold text-foreground mb-5">Personal Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Field label="Full Name" htmlFor="s1-name" required>
                                        <input
                                            id="s1-name"
                                            type="text"
                                            aria-required
                                            aria-describedby={fieldErrors.name ? 's1-name-err' : undefined}
                                            value={step1.name}
                                            onChange={e => {
                                                setStep1(s => ({ ...s, name: e.target.value }));
                                                setFieldErrors(fe => ({ ...fe, name: undefined }));
                                            }}
                                            placeholder="Ada Lovelace"
                                            className={`${inputCls} ${fieldErrors.name ? 'border-destructive focus:ring-destructive/40 focus:border-destructive' : ''}`}
                                        />
                                        {fieldErrors.name && (
                                            <p id="s1-name-err" role="alert" className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
                                        )}
                                    </Field>
                                </div>
                                <Field label="Contact Number" htmlFor="s1-phone">
                                    <input
                                        id="s1-phone"
                                        type="tel"
                                        aria-describedby={fieldErrors.contactNumber ? 's1-phone-err' : undefined}
                                        value={step1.contactNumber}
                                        onChange={e => {
                                            setStep1(s => ({ ...s, contactNumber: e.target.value }));
                                            setFieldErrors(fe => ({ ...fe, contactNumber: undefined }));
                                        }}
                                        placeholder="+1 234 567 8900"
                                        className={`${inputCls} ${fieldErrors.contactNumber ? 'border-destructive focus:ring-destructive/40 focus:border-destructive' : ''}`}
                                    />
                                    {fieldErrors.contactNumber && (
                                        <p id="s1-phone-err" role="alert" className="mt-1 text-xs text-destructive">{fieldErrors.contactNumber}</p>
                                    )}
                                </Field>
                                <Field label="Age (optional)" htmlFor="s1-age">
                                    <input
                                        id="s1-age"
                                        type="number"
                                        aria-describedby={fieldErrors.age ? 's1-age-err' : undefined}
                                        value={step1.age}
                                        onChange={e => {
                                            setStep1(s => ({ ...s, age: e.target.value }));
                                            setFieldErrors(fe => ({ ...fe, age: undefined }));
                                        }}
                                        placeholder="25"
                                        min={1}
                                        max={120}
                                        className={`${inputCls} ${fieldErrors.age ? 'border-destructive focus:ring-destructive/40 focus:border-destructive' : ''}`}
                                    />
                                    {fieldErrors.age && (
                                        <p id="s1-age-err" role="alert" className="mt-1 text-xs text-destructive">{fieldErrors.age}</p>
                                    )}
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="Preferred Language" htmlFor="s1-lang">
                                        <select
                                            id="s1-lang"
                                            value={step1.preferredLanguage}
                                            onChange={e => setStep1(s => ({ ...s, preferredLanguage: e.target.value }))}
                                            className={inputCls}
                                        >
                                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── STEP 1: Disability Selection ── */}
                    {step === 1 && (
                        <section aria-labelledby="step2-heading">
                            <h2 id="step2-heading" className="text-base font-bold text-foreground mb-1">Disability Selection</h2>
                            <p className="text-sm text-muted-foreground mb-5">Select all that apply.</p>
                            <fieldset>
                                <legend className="sr-only">Select your disability type(s)</legend>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {DISABILITIES.map(d => {
                                        const checked = selectedDisabilities.includes(d.key);
                                        return (
                                            <label
                                                key={d.key}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 select-none
                                                    ${checked
                                                        ? 'border-primary bg-primary/8 shadow-sm'
                                                        : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleDisability(d.key)}
                                                    className="w-4 h-4 rounded accent-primary shrink-0"
                                                    aria-label={d.label}
                                                />
                                                <span className="text-lg leading-none" aria-hidden="true">{d.emoji}</span>
                                                <span className="text-sm font-medium text-foreground">{d.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        </section>
                    )}

                    {/* ── STEP 2: Preferences ── */}
                    {step === 2 && (
                        <section aria-labelledby="step3-heading">
                            <h2 id="step3-heading" className="text-base font-bold text-foreground mb-1">Accessibility Preferences</h2>
                            <p className="text-sm text-muted-foreground mb-5">
                                {questions.length === 0
                                    ? 'No specific questions for your selections — click Next to continue.'
                                    : 'Answer based on your accessibility needs.'}
                            </p>
                            <div className="flex flex-col gap-3">
                                {questions.map(q => (
                                    <div key={q.key} className="p-4 bg-muted/30 rounded-xl border border-border">
                                        <p className="text-sm font-medium text-foreground mb-3">{q.label}</p>
                                        {q.type === 'boolean' ? (
                                            <div className="flex gap-2" role="radiogroup" aria-label={q.label}>
                                                {(['Yes', true] as const, [['Yes', true], ['No', false]] as const).map(([label, val]) => (
                                                    <label
                                                        key={String(label)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium
                                                            ${prefs[q.key] === val
                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                : 'border-border text-foreground hover:border-primary/40'}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={q.key}
                                                            checked={prefs[q.key] === val}
                                                            onChange={() => setPref(q.key, val as boolean)}
                                                            className="accent-primary"
                                                        />
                                                        {String(label)}
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <select
                                                aria-label={q.label}
                                                value={(prefs[q.key] as string) || q.options![0]}
                                                onChange={e => setPref(q.key, e.target.value)}
                                                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                            >
                                                {q.options!.map(o => (
                                                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── STEP 3: Review ── */}
                    {step === 3 && (
                        <section aria-labelledby="step4-heading">
                            <h2 id="step4-heading" className="text-base font-bold text-foreground mb-5">Review Your Profile</h2>

                            {apiError && (
                                <div role="alert" aria-live="assertive" className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                                    {apiError}
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {/* Personal */}
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Personal Details</p>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                                        {[
                                            ['Name', step1.name || '—'],
                                            ['Contact', step1.contactNumber || '—'],
                                            ['Age', step1.age || '—'],
                                            ['Language', step1.preferredLanguage],
                                        ].map(([k, v]) => (
                                            <div key={k}>
                                                <dt className="text-xs text-muted-foreground font-medium mb-0.5">{k}</dt>
                                                <dd className="text-sm text-foreground font-semibold">{v}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                {/* Disabilities */}
                                <div className="rounded-xl border border-border p-4">
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Disabilities</p>
                                    {selectedDisabilities.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">None selected</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDisabilities.map(d => {
                                                const found = DISABILITIES.find(x => x.key === d);
                                                return (
                                                    <span key={d} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20">
                                                        <span aria-hidden="true">{found?.emoji}</span>
                                                        {found?.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Preferences */}
                                {Object.keys(prefs).length > 0 && (
                                    <div className="rounded-xl border border-border p-4">
                                        <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">Preferences</p>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                                            {Object.entries(prefs).map(([k, v]) => (
                                                <div key={k}>
                                                    <dt className="text-xs text-muted-foreground font-medium mb-0.5 capitalize">
                                                        {k.replace(/([A-Z])/g, ' $1').trim()}
                                                    </dt>
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
                    <div className="flex items-center justify-between mt-7 pt-5 border-t border-border gap-3">
                        <button
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 0}
                            className="h-10 px-5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Go to previous step"
                        >
                            ← Back
                        </button>

                        <span className="text-xs text-muted-foreground font-medium shrink-0" aria-live="polite">
                            {step + 1} / {STEPS.length}
                        </span>

                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => {
                                    if (step === 0 && !validateStep1()) return;
                                    setStep(s => s + 1);
                                }}
                                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label="Go to next step"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                aria-busy={submitting}
                                className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving…
                                    </span>
                                ) : 'Complete →'}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Your data is used only to personalise your experience.
                </p>
            </div>
        </div>
    );
}