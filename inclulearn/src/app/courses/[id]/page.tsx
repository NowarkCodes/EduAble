'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon } from 'lucide-react';

function PlayIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function PauseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
    );
}

function VolumeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
    );
}

function CCIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
    );
}

function FullscreenIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function FileTextIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

function LightningIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

const courseItems = [
    { num: 1, title: 'Introduction to ARIA', time: '10:20', status: 'completed' },
    { num: 4, title: 'ARIA Patterns & Best Practices', time: 'Current', status: 'active' },
    { num: 5, title: 'Testing with Screen Readers', time: '18:45', status: 'locked' },
    { num: 6, title: 'Capstone: Building Accessible Forms', time: '45:00', status: 'locked' },
];

const transcriptItems = [
    { ts: '12:15', text: "Welcome back to Module 4. We've just covered the basic concepts of semantic markup.", active: false },
    { ts: '12:30', text: "When using ARIA roles, it's essential to remember the first rule of ARIA: If you can use a native HTML element instead, do it. Native elements have built-in accessibility features.", active: false },
    { ts: '12:45', text: "Now, let's look at how we can implement a 'live region'. A live region is an area where content updates without a page refresh, and it needs to be announced to screen reader users.", active: true },
    { ts: '13:02', text: 'By adding aria-live="polite", the assistive technology will wait for the user to finish their current task before announcing the change.', active: false },
    { ts: '13:20', text: 'Contrast this with "assertive", which interrupts immediately. Use assertive sparingly for critical errors or time-sensitive alerts.', active: false },
];

export default function CourseDetailPage() {
    const { user } = useAuth();
    const initials = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    // Transcript panel open/close on mobile
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 md:py-8">

                {/* Breadcrumb — truncate gracefully on mobile */}
                <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-500 mb-4 sm:mb-6 uppercase tracking-wider min-w-0 flex-wrap">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors shrink-0">Dashboard</Link>
                    <span aria-hidden="true">›</span>
                    <Link href="/courses" className="hover:text-blue-600 transition-colors shrink-0 hidden sm:inline">Web Accessibility</Link>
                    <span aria-hidden="true" className="hidden sm:inline">›</span>
                    <span className="text-slate-900 truncate">ARIA Patterns &amp; Best Practices</span>
                </nav>

                {/* Header */}
                <header className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1 sm:mb-2">Advanced CSS Accessibility</h1>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Module 4: Accessible Rich Internet Applications (ARIA)</p>
                </header>

                <div className="flex flex-col xl:flex-row gap-5 sm:gap-6">

                    {/* ── Left Column ─────────────────────────────── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6">

                        {/* Video Player */}
                        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md relative aspect-video flex flex-col border border-slate-800">

                            {/* Video content area */}
                            <div className="flex-1 bg-[#4d6a52] flex items-center justify-center relative overflow-hidden text-center p-4 sm:p-8">
                                <span className="font-serif italic text-white/30 text-4xl sm:text-5xl md:text-7xl lg:text-8xl md:leading-tight -rotate-2 select-none">
                                    Lesson<br />Content<br />framework!
                                </span>

                                {/* Play Button */}
                                <button className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-10 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50">
                                    <PlayIcon />
                                </button>
                            </div>

                            {/* AI Live Sign Overlay — smaller on mobile, repositioned */}
                            <div className="absolute bottom-14 right-2 sm:bottom-16 sm:right-4 md:bottom-20 md:right-6 w-24 sm:w-32 md:w-40 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col z-20">
                                <div className="bg-blue-600 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-300 animate-pulse shrink-0" />
                                    AI Live Sign
                                </div>
                                <div className="bg-slate-100 aspect-[4/3] relative flex items-center justify-center">
                                    <Image
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                                        alt="AI Agent signing"
                                        fill
                                        className="object-cover object-top filter grayscale opacity-90"
                                    />
                                </div>
                                <div className="bg-slate-800 text-white flex justify-between p-1 sm:p-1.5">
                                    <button className="p-0.5 sm:p-1 hover:text-blue-400 transition-colors" aria-label="Closed Captions for Signer"><CCIcon /></button>
                                    <button className="p-0.5 sm:p-1 hover:text-blue-400 transition-colors" aria-label="Signer Settings"><SettingsIcon /></button>
                                    <button className="p-0.5 sm:p-1 hover:text-blue-400 transition-colors" aria-label="Expand Signer"><FullscreenIcon /></button>
                                </div>
                            </div>

                            {/* Video Controls Bar */}
                            <div className="bg-gradient-to-t from-slate-900 to-transparent px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 md:gap-4 text-white">
                                <button className="hover:text-blue-400 transition-colors focus:outline-none shrink-0" aria-label="Play/Pause">
                                    <PlayIcon />
                                </button>
                                <button className="hover:text-blue-400 transition-colors focus:outline-none hidden sm:block shrink-0" aria-label="Volume">
                                    <VolumeIcon />
                                </button>

                                {/* Timestamp — only on sm+ */}
                                <span className="text-xs font-semibold font-mono tracking-wide hidden md:inline-block shrink-0 w-24">12:45 / 35:20</span>
                                {/* Short timestamp on very small */}
                                <span className="text-xs font-semibold font-mono tracking-wide sm:hidden shrink-0">12:45</span>

                                {/* Progress bar */}
                                <div className="flex-1 mx-1 sm:mx-2 h-1.5 bg-white/20 rounded-full overflow-visible cursor-pointer relative">
                                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full" style={{ width: '36%' }} />
                                    <div className="absolute left-[36%] top-1/2 -translate-y-1/2 -ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-sm" />
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
                                    <button className="hover:text-blue-400 transition-colors hidden sm:block" aria-label="Captions"><CCIcon /></button>
                                    <button className="hover:text-blue-400 transition-colors hidden md:block" aria-label="Settings"><SettingsIcon /></button>
                                    <button className="hover:text-blue-400 transition-colors" aria-label="Fullscreen"><FullscreenIcon /></button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile transcript toggle — only visible below xl */}
                        <div className="xl:hidden">
                            <button
                                onClick={() => setTranscriptOpen(prev => !prev)}
                                className="w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                aria-expanded={transcriptOpen}
                            >
                                <span className="flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1-19.995.324L2 12A10 10 0 0 1 12 2Z" />
                                        <path d="M12 2v20M2.5 9h19M2.5 15h19" />
                                    </svg>
                                    Real-time Transcript
                                </span>
                                <svg
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    className={`transition-transform ${transcriptOpen ? 'rotate-180' : ''}`}
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {transcriptOpen && (
                                <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <TranscriptContent />
                                </div>
                            )}
                        </div>

                        {/* Video Description */}
                        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 md:p-6 shadow-sm">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                                <FileTextIcon />
                                Video Description
                            </h2>
                            <div className="text-sm text-slate-600 leading-relaxed space-y-3 sm:space-y-4 font-medium">
                                <p>
                                    This video segment features a split-screen presentation. On the left, a text editor displays semantic HTML code for a navigation menu. The instructor highlights the use of{' '}
                                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">&lt;nav&gt;</code> and{' '}
                                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs">aria-label</code> attributes.
                                </p>
                                <p>
                                    The code shown is:{' '}
                                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs break-all">&lt;nav aria-label="Main Navigation"&gt;</code>. On the right side, a visual preview of the website update is shown as the instructor types.
                                </p>
                            </div>
                        </section>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-3">
                            <button className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl transition-colors text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 shrink-0">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                <span className="hidden xs:inline">Previous </span>Lesson
                            </button>
                            <button className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                                Next Lesson
                                <ArrowRightIcon className="w-4 h-4 shrink-0" />
                            </button>
                        </div>

                        {/* Course Content List */}
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Course Content</h2>
                            <div className="space-y-2 sm:space-y-3">
                                {courseItems.map((item) => (
                                    <div
                                        key={item.num}
                                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 transition-colors ${item.status === 'active' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            {item.status === 'completed' ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                            ) : item.status === 'active' ? (
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{item.num}</div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">{item.num}</div>
                                            )}
                                            <span className={`font-bold text-sm sm:text-base truncate ${item.status === 'active' ? 'text-blue-700' : item.status === 'completed' ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {item.num}. {item.title}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ml-2 ${item.status === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {item.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ── Right Column — hidden on mobile (toggle above), shown on xl ── */}
                    <div className="hidden xl:flex xl:w-[400px] shrink-0 flex-col gap-6">
                        {/* Real-time Transcript Card */}
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
                            <header className="bg-blue-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1-19.995.324L2 12A10 10 0 0 1 12 2Z" />
                                            <path d="M12 2v20" />
                                            <path d="M2.5 9h19" />
                                            <path d="M2.5 15h19" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm sm:text-base leading-snug">Real-time Transcript</h2>
                                        <p className="text-[9px] font-bold text-blue-200 tracking-widest uppercase mt-0.5">Auto-Syncing • Multi-Language</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 sm:gap-1.5 text-blue-200">
                                    <button className="p-1.5 sm:p-2 hover:text-white transition-colors hover:bg-blue-500 rounded-lg" aria-label="Download transcript"><DownloadIcon /></button>
                                    <button className="p-1.5 sm:p-2 hover:text-white transition-colors hover:bg-blue-500 rounded-lg" aria-label="Search transcript"><SearchIcon /></button>
                                </div>
                            </header>
                            <TranscriptContent />
                        </section>

                        {/* Quick Tips */}
                        <QuickTips />
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 sm:mt-12 py-6 sm:py-8 border-t border-slate-200 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                        <span>© 2024 Inclusive AI Learning</span>
                        <span className="hidden sm:inline">•</span>
                        <Link href="#" className="hover:text-slate-600">Accessibility Statement</Link>
                        <span className="hidden sm:inline">•</span>
                        <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full shrink-0">
                        <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>WCAG 2.2 AAA Compliant</span>
                    </div>
                </div>
            </footer>
        </DashboardLayout>
    );
}

/* ── Shared transcript content (reused in both mobile accordion and desktop sidebar) ── */
function TranscriptContent() {
    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-5 sm:space-y-6 text-sm font-medium">
            {transcriptItems.map((item) =>
                item.active ? (
                    <div
                        key={item.ts}
                        className="bg-slate-50 border-l-4 border-blue-600 -mx-4 sm:-mx-5 md:-mx-6 px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-start gap-3 sm:gap-4 shadow-inner text-slate-800 font-bold"
                    >
                        <span className="font-mono font-bold text-blue-700 shrink-0 text-xs sm:text-sm">[{item.ts}]</span>
                        <p className="leading-relaxed text-xs sm:text-sm">{item.text}</p>
                    </div>
                ) : (
                    <div key={item.ts} className="text-slate-500 flex items-start gap-3 sm:gap-4">
                        <span className="font-mono font-bold text-blue-600 shrink-0 text-xs sm:text-sm">[{item.ts}]</span>
                        <p className="leading-relaxed text-xs sm:text-sm">{item.text}</p>
                    </div>
                )
            )}
            <div className="text-slate-400 italic flex items-center gap-2 text-xs pt-3 sm:pt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                transcribing audio...
            </div>
        </div>
    );
}

/* ── Quick Tips ── */
function QuickTips() {
    return (
        <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-2xl">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                <LightningIcon /> Quick Tips
            </h3>
            <p className="text-xs text-blue-900/80 leading-relaxed font-medium">Click any timestamp in the transcript to jump to that moment in the video. The transcript follows the playback automatically.</p>
        </div>
    );
}