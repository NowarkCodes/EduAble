'use client';

import React, { useState, Fragment } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

/* ── Types ───────────────────────────────────────── */
type SettingsTab = 'accessibility' | 'visual' | 'audio' | 'shortcuts';

interface ToggleProps {
    id: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
    badge?: string;
}

/* ── Toggle Card ─────────────────────────────────── */
function ToggleCard({ id, checked, onChange, label, description, badge }: ToggleProps) {
    return (
        <div className="flex items-start justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <label htmlFor={id} className="text-sm font-bold text-slate-900 cursor-pointer">{label}</label>
                    {badge && (
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{badge}</span>
                    )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
            <button
                id={id}
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
                <span className="sr-only">{label}</span>
            </button>
        </div>
    );
}

/* ── Section heading ─────────────────────────────── */
function SectionHeading({ id, icon, title }: { id?: string; icon: React.ReactNode; title: string }) {
    return (
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900 mb-4">
            <span className="text-blue-600">{icon}</span>
            {title}
        </h2>
    );
}

/* ── Sidebar tab ─────────────────────────────────── */
const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
        id: 'accessibility',
        label: 'Accessibility',
        icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><circle cx="7" cy="2" r="1.5" /><path d="M2.5 5h9M7 5.5V12M4.5 12l2.5-3 2.5 3" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    },
    {
        id: 'visual',
        label: 'Visual',
        icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="7" cy="7" r="2.5" /><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" strokeLinecap="round" /></svg>,
    },
    {
        id: 'audio',
        label: 'Audio & Voice',
        icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="2" width="6" height="7" rx="3" /><path d="M2 9a5 5 0 0 0 10 0M7 13v1" strokeLinecap="round" /></svg>,
    },
    {
        id: 'shortcuts',
        label: 'Shortcuts',
        icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="3" width="12" height="8" rx="1.5" /><path d="M4 7h2M8 7h2M4 9.5h6" strokeLinecap="round" /></svg>,
    },
];

const shortcuts = [
    { section: 'General Navigation', items: [{ action: 'Global Search', keys: ['Alt', 'S'] }, { action: 'Toggle Sidebar', keys: ['Alt', 'B'] }] },
    { section: 'Accessibility Tools', items: [{ action: 'Read Aloud Content', keys: ['Alt', 'R'] }, { action: 'High Contrast Toggle', keys: ['Alt', 'H'] }] },
];

/* ── Page ────────────────────────────────────────── */
export default function SettingsPage() {
    const { user: authUser } = useAuth();
    const initials = (authUser?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const [activeTab, setActiveTab] = useState<SettingsTab>('accessibility');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // General
    const [language, setLanguage] = useState('English (US)');

    // Visual
    const [dyslexiaFont, setDyslexiaFont] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [textScale, setTextScale] = useState(125);

    // Audio
    const [voiceSpeed, setVoiceSpeed] = useState(1.2);
    const [screenReader, setScreenReader] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);

    function handleSave() {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 800);
    }
    function handleReset() {
        setDyslexiaFont(false); setReducedMotion(false); setHighContrast(false);
        setTextScale(125); setVoiceSpeed(1.2); setScreenReader(true); setSoundEffects(true);
        setLanguage('English (US)');
    }

    return (
        <DashboardLayout userInitials={initials} userName={authUser?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <span>Home</span>
                    <span aria-hidden="true">›</span>
                    <span className="text-slate-900 font-semibold">Settings</span>
                </nav>

                <div className="mb-7">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1">Platform Settings</h1>
                    <p className="text-slate-500 text-sm">Manage your profile, language, and universal accessibility preferences.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Left tab rail */}
                    <nav aria-label="Settings sections" className="flex sm:flex-col gap-1 sm:w-44 shrink-0 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                aria-current={activeTab === tab.id ? 'true' : undefined}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors text-left
                  ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Content area */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* General Preferences — always show */}
                        <section aria-labelledby="general-heading">
                            <SectionHeading id="general-heading"
                                icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="8" r="5" /><path d="M3.5 8h9M8 3c-1.5 2-1.5 6 0 10M8 3c1.5 2 1.5 6 0 10" /></svg>}
                                title="General Preferences"
                            />
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <label htmlFor="language-select" className="text-sm font-bold text-slate-900 block mb-1">Preferred Language</label>
                                <p className="text-xs text-slate-500 mb-3">Choose your primary language for the platform interface and AI tutoring.</p>
                                <select
                                    id="language-select"
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    {['English (US)', 'English (UK)', 'Hindi', 'Spanish', 'French', 'German', 'Arabic'].map(l => (
                                        <option key={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* Accessibility tab */}
                        {activeTab === 'accessibility' && (
                            <section aria-labelledby="a11y-heading">
                                <SectionHeading id="a11y-heading"
                                    icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="2.5" r="1.5" fill="currentColor" stroke="none" /><path d="M4 5.5h8M8 6.5V14M5.5 14l2.5-3 2.5 3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    title="Accessibility Settings"
                                />
                                <div className="space-y-3">
                                    <ToggleCard id="screen-reader" checked={screenReader} onChange={setScreenReader} label="Screen Reader Optimization" description="Enhances ARIA labels and focus management for screen reader users." badge="WCAG 2.2 AA" />
                                    <ToggleCard id="sound-effects" checked={soundEffects} onChange={setSoundEffects} label="UI Sound Effects" description="Plays subtle audio cues when interacting with buttons and completing tasks." />
                                </div>
                            </section>
                        )}

                        {/* Visual tab */}
                        {activeTab === 'visual' && (
                            <section aria-labelledby="visual-heading">
                                <SectionHeading id="visual-heading"
                                    icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="8" r="2.5" /><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" strokeLinecap="round" /></svg>}
                                    title="Visual Accessibility"
                                />
                                <div className="space-y-3">
                                    <ToggleCard id="dyslexia-font" checked={dyslexiaFont} onChange={setDyslexiaFont} label="Dyslexia Friendly Font" description="Switches the typeface to one specifically designed for easier reading." />
                                    <ToggleCard id="reduced-motion" checked={reducedMotion} onChange={setReducedMotion} label="Reduced Motion" description="Stops all non-essential transitions and animations to prevent vestibular triggers." />
                                    <div className="relative">
                                        <ToggleCard id="high-contrast" checked={highContrast} onChange={setHighContrast} label="High Contrast Mode" description="Forces a Black and Yellow color scheme for maximum contrast." badge="WCAG 2.2 AAA" />
                                    </div>

                                    {/* High contrast preview */}
                                    {highContrast && (
                                        <div className="rounded-2xl bg-black border-2 border-yellow-400 p-5">
                                            <p className="text-yellow-400 font-extrabold text-sm mb-2">High Contrast Preview</p>
                                            <p className="text-yellow-300 text-xs mb-4">Ensures a 21:1 contrast ratio with yellow text on a black background.</p>
                                            <button className="px-4 py-2 bg-yellow-400 text-black text-xs font-black rounded-lg">Sample Button</button>
                                        </div>
                                    )}

                                    {/* Text scale slider */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <label htmlFor="text-scale" className="text-sm font-bold text-slate-900">Text Size Scaling</label>
                                            <span className="text-sm font-bold text-blue-600">{textScale}%</span>
                                        </div>
                                        <input
                                            id="text-scale"
                                            type="range"
                                            min={100}
                                            max={200}
                                            step={5}
                                            value={textScale}
                                            onChange={e => setTextScale(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                            aria-label={`Text size: ${textScale}%`}
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                                            <span>100%</span><span>200% MAX</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Audio tab */}
                        {activeTab === 'audio' && (
                            <section aria-labelledby="audio-heading">
                                <SectionHeading id="audio-heading"
                                    icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="1" width="6" height="9" rx="3" /><path d="M2 9a6 6 0 0 0 12 0M8 15v-2" strokeLinecap="round" /></svg>}
                                    title="Audio & Voice Synthesis"
                                />
                                <div className="space-y-3">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <label htmlFor="voice-speed" className="text-sm font-bold text-slate-900">Voice Synthesis Speed</label>
                                            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{voiceSpeed.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            id="voice-speed"
                                            type="range"
                                            min={0.5}
                                            max={2.5}
                                            step={0.1}
                                            value={voiceSpeed}
                                            onChange={e => setVoiceSpeed(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                            aria-label={`Voice speed: ${voiceSpeed}x`}
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                                            <span>0.5x SLOW</span><span>2.5x FAST</span>
                                        </div>
                                    </div>
                                    <ToggleCard id="screen-reader-audio" checked={screenReader} onChange={setScreenReader} label="Screen Reader Audio" description="Enable audio output for all screen reader compatible elements." />
                                </div>
                            </section>
                        )}

                        {/* Shortcuts tab */}
                        {activeTab === 'shortcuts' && (
                            <section aria-labelledby="shortcuts-heading">
                                <SectionHeading id="shortcuts-heading"
                                    icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="3" width="14" height="10" rx="2" /><path d="M4 9h2M10 9h2M4 11.5h8" strokeLinecap="round" /></svg>}
                                    title="Keyboard Shortcut Map"
                                />
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm" aria-label="Keyboard shortcuts">
                                        <thead className="border-b border-slate-100">
                                            <tr>
                                                {shortcuts.map(s => (
                                                    <th key={s.section} scope="col" colSpan={2} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-100 last:border-r-0">{s.section}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: Math.max(...shortcuts.map(s => s.items.length)) }).map((_, i) => (
                                                <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                                                    {shortcuts.map(section => {
                                                        const item = section.items[i];
                                                        return item ? (
                                                            <Fragment key={section.section}>
                                                                <td className="px-5 py-3 text-slate-700 font-medium text-xs">{item.action}</td>
                                                                <td className="px-5 py-3 text-right border-r border-slate-100 last:border-r-0">
                                                                    <kbd className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                                        {item.keys.join(' + ')}
                                                                    </kbd>
                                                                </td>
                                                            </Fragment>
                                                        ) : (
                                                            <Fragment key={section.section}><td className="px-5 py-3" /><td className="px-5 py-3 border-r border-slate-100 last:border-r-0" /></Fragment>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Save / Reset */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                            <button
                                onClick={handleReset}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
