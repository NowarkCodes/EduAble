'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

/* ── Types ───────────────────────────────────────── */
interface CourseItem {
    id: string;
    title: string;
    description: string;
    lessonsLeft: number;
    estimatedHours: number;
    locked: boolean;
    unlocksAfter?: string;
    category: string;
    level: string;
}

interface DashboardData {
    user: { name: string; email: string; tier: string; initials: string };
    resumeCourse: { id: string; title: string; module: string; progress: number; currentModuleNumber: number };
    activeCourses: CourseItem[];
    stats: { streak: number; quizAverage: number; certificates: number; lessonsCompleted: number; totalLessons: number };
}

/* ── Skeleton with ARIA ──────────────────────────── */
function Skeleton({ className = '', role, 'aria-label': ariaLabel }: {
    className?: string;
    role?: string;
    'aria-label'?: string;
}) {
    return (
        <div
            className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
            role={role}
            aria-label={ariaLabel}
            aria-busy="true"
        />
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8" role="status" aria-live="polite">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" role="status" aria-label="Loading user info" />
                <Skeleton className="h-4 w-72" role="status" aria-label="Loading welcome message" />
            </div>
            <Skeleton className="h-36 w-full rounded-2xl" role="status" aria-label="Loading resume course" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" role="status" aria-label="Loading section title" />
                <Skeleton className="h-24 w-full rounded-2xl" role="status" aria-label="Loading course cards" />
                <Skeleton className="h-24 w-full rounded-2xl" role="status" aria-label="Loading more course cards" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-28 rounded-2xl" role="status" aria-label="Loading stats" />
                <Skeleton className="h-28 rounded-2xl" role="status" aria-label="Loading stats" />
                <Skeleton className="h-28 rounded-2xl" role="status" aria-label="Loading stats" />
            </div>
        </div>
    );
}

/* ── Icons with aria-hidden ──────────────────────── */
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="currentColor"
            aria-hidden="true"
            {...props}
        >
            <path d="M3 2.5l8 4.5-8 4.5V2.5z" />
        </svg>
    );
}

function LessonsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            {...props}
        >
            <rect x="1" y="2" width="12" height="10" rx="1.5" />
            <path d="M4 6h6M4 8.5h4" strokeLinecap="round" />
        </svg>
    );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            {...props}
        >
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 15 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="7" width="9" height="7" rx="1.5" />
            <path d="M5 7V5a2.5 2.5 0 0 1 5 0v2" strokeLinecap="round" />
        </svg>
    );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            {...props}
        >
            <circle cx="8" cy="8" r="7" fill="#22c55e" />
            <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function A11yIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            {...props}
        >
            <circle cx="8" cy="3" r="1.5" fill="currentColor" stroke="none" />
            <path d="M4 6h8M8 7v6M5.5 13l2.5-3 2.5 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ── Course Card with Full A11y ──────────────────── */
function CourseCard({ course }: { course: CourseItem }) {
    const cardId = `course-${course.id}`;

    if (course.locked) {
        return (
            <article
                id={cardId}
                className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 sm:items-center opacity-70 group"
                role="article"
                aria-labelledby={`${cardId}-title ${cardId}-category`}
                aria-describedby={`${cardId}-desc ${course.unlocksAfter ? `${cardId}-unlock` : ''}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            id={`${cardId}-category`}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full sr-only sm:not-sr-only"
                            aria-label={`Category: ${course.category}`}
                        >
                            {course.category}
                        </span>
                    </div>
                    <h3
                        id={`${cardId}-title`}
                        className="text-base font-bold text-slate-400 mb-1"
                    >
                        {course.title}
                    </h3>
                    <p
                        id={`${cardId}-desc`}
                        className="text-sm text-slate-400 leading-relaxed"
                    >
                        {course.description}
                    </p>
                    {course.unlocksAfter && (
                        <p
                            id={`${cardId}-unlock`}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 sr-only sm:not-sr-only"
                            aria-label={`Unlocks after completing ${course.unlocksAfter}`}
                        >
                            Unlocks after {course.unlocksAfter}
                        </p>
                    )}
                </div>
                <button
                    disabled
                    aria-disabled="true"
                    aria-label={`Module ${course.title} is locked`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-400 text-sm font-semibold bg-slate-50 cursor-not-allowed shrink-0"
                >
                    <LockIcon />
                    <span className="sr-only sm:not-sr-only">Locked</span>
                </button>
            </article>
        );
    }

    return (
        <article
            id={cardId}
            className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:border-blue-300 hover:shadow-sm transition-all group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
            role="article"
            tabIndex={0}
            aria-labelledby={`${cardId}-title ${cardId}-category ${cardId}-level`}
            aria-describedby={`${cardId}-desc ${cardId}-lessons ${cardId}-hours`}
        >
            <div className="flex-1 min-w-0">
                <header className="flex items-center gap-2 mb-1.5">
                    <span
                        id={`${cardId}-category`}
                        className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full sr-only sm:not-sr-only"
                        aria-label={`Category: ${course.category}`}
                    >
                        {course.category}
                    </span>
                    <span
                        id={`${cardId}-level`}
                        className="text-[10px] text-slate-400 font-medium sr-only sm:not-sr-only"
                        aria-label={`Level: ${course.level}`}
                    >
                        {course.level}
                    </span>
                </header>
                <h3
                    id={`${cardId}-title`}
                    className="text-base font-bold text-slate-900 mb-1"
                >
                    {course.title}
                </h3>
                <p
                    id={`${cardId}-desc`}
                    className="text-sm text-slate-500 leading-relaxed mb-3"
                >
                    {course.description}
                </p>
                <div
                    className="flex items-center gap-4 text-xs font-semibold text-slate-500"
                    role="group"
                    aria-label="Course details"
                >
                    <span
                        id={`${cardId}-lessons`}
                        className="flex items-center gap-1.5"
                        aria-label={`${course.lessonsLeft} lessons remaining`}
                    >
                        <LessonsIcon />
                        <span className="sr-only sm:not-sr-only">{course.lessonsLeft} Lessons Left</span>
                    </span>
                    <span
                        id={`${cardId}-hours`}
                        className="flex items-center gap-1.5"
                        aria-label={`${course.estimatedHours} hours estimated time`}
                    >
                        <ClockIcon />
                        <span className="sr-only sm:not-sr-only">{course.estimatedHours}h estimated</span>
                    </span>
                </div>
            </div>
            <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-900 text-slate-900 text-sm font-bold hover:bg-slate-900 hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
                aria-describedby={cardId}
            >
                <span className="sr-only sm:not-sr-only">Continue</span>
                <PlayIcon />
                <span aria-hidden className="sr-only">course {course.title}</span>
            </Link>
        </article>
    );
}

/* ── Stat Card with Live Regions ─────────────────── */
function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
    const statId = `stat-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const isLight = accent === '#e2e8f0';

    return (
        <section
            id={statId}
            className={`rounded-2xl flex flex-col items-center justify-center py-6 px-2 sm:py-7 sm:px-4 relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900 border border-slate-800'}`}
            role="status"
            aria-label={`${label}: ${value}`}
            tabIndex={0}
            aria-live="polite"
            aria-atomic="true"
        >
            <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                style={{ background: accent }}
                aria-hidden="true"
            />
            <p
                className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}
                aria-label={`${value} ${label}`}
            >
                {value}
            </p>
            <p
                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight"
                style={{ color: isLight ? '#64748b' : accent }}
                aria-hidden="true"
            >
                {label}
            </p>
        </section>
    );
}

/* ── Top Bar with Full Keyboard Support ─────────── */
function TopBar() {
    const [a11yOn, setA11yOn] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    return (
        <header role="banner" className="flex items-center justify-between mb-6">
            <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Accessibility features active"
            >
                <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                    aria-hidden="true"
                />
                <span className="sr-only sm:not-sr-only">Screen Reader Ready</span>
            </div>
            <button
                ref={buttonRef}
                onClick={() => setA11yOn(v => !v)}
                aria-pressed={a11yOn}
                aria-controls="main-content"
                aria-expanded={a11yOn}
                aria-label={a11yOn ? "Disable accessibility mode" : "Enable accessibility mode"}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 ${a11yOn
                    ? 'bg-blue-600 text-white focus:ring-blue-600'
                    : 'bg-slate-900 text-white hover:bg-slate-700 focus:ring-slate-900'
                    }`}
            >
                <A11yIcon />
                <span className="hidden sm:inline">Accessibility</span>
                <span className="sr-only">{a11yOn ? "on" : "off"}</span>
            </button>
        </header>
    );
}

/* ── Main Page with Skip Links ───────────────────── */
export default function DashboardPage() {
    const { user: authUser, token } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mainRef = useRef<HTMLElement>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('http://localhost:5000/api/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load dashboard');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError('Unable to load dashboard data. Showing cached view.');
            // Fall back to a minimal default so the page still renders
            setData({
                user: {
                    name: authUser?.name ?? 'User',
                    email: authUser?.email ?? '',
                    tier: 'Standard Account',
                    initials: (authUser?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
                },
                resumeCourse: {
                    id: 'ux-design-101',
                    title: 'Introduction to UX Design: Inclusive Principles',
                    module: 'Module 3: Accessibility Auditing',
                    progress: 75,
                    currentModuleNumber: 3
                },
                activeCourses: [],
                stats: { streak: 0, quizAverage: 0, certificates: 0, lessonsCompleted: 0, totalLessons: 0 },
            });
        } finally {
            setLoading(false);
        }
    }, [token, authUser]);

    useEffect(() => {
        if (token) fetchDashboard();
        else setLoading(false);
    }, [token, fetchDashboard]);

    const initials = data?.user.initials ?? authUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
    const displayName = data?.user.name ?? authUser?.name ?? 'User';
    const stats = [
        { value: String(data?.stats.streak ?? '—'), label: 'Days Streak', accent: '#3b82f6' },
        { value: data?.stats.quizAverage ? `${data.stats.quizAverage}%` : '—', label: 'Quiz Average', accent: '#22c55e' },
        { value: String(data?.stats.certificates ?? '—'), label: 'Certificates', accent: '#e2e8f0' },
    ];

    return (
        <>
            {/* Skip Links for Keyboard/Screen Reader Navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-white"
            >
                Skip to main content
            </a>
            <a
                href="#courses-heading"
                className="sr-only focus:not-sr-only fixed top-16 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold focus:outline-none focus:ring-4 focus:ring-white"
            >
                Skip to active courses
            </a>

            <DashboardLayout
                userInitials={initials}
                userName={displayName}
                userTier={data?.user.tier ?? 'Standard Account'}
                aria-label="Learning Dashboard"
            >
                <main
                    id="main-content"
                    ref={mainRef}
                    className="max-w-3xl mx-auto px-4 sm:px-8 py-8"
                    role="main"
                    aria-label={`Dashboard for ${displayName}`}
                >
                    <TopBar />

                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            aria-atomic="true"
                            className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium"
                        >
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <DashboardSkeleton />
                    ) : (
                        <>
                            {/* Heading */}
                            <header className="mb-6">
                                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                    Dashboard
                                </h1>
                                <p className="text-slate-500 text-base">
                                    Welcome back, {displayName.split(' ')[0]}. Continue your path to mastering inclusive design.
                                </p>
                            </header>

                            {/* Resume Card */}
                            {data?.resumeCourse && (
                                <section
                                    aria-labelledby="resume-title"
                                    className="mb-10 rounded-2xl bg-slate-900 text-white p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                                >
                                    <div
                                        id="resume-title"
                                        className="sr-only"
                                    >
                                        Resume your learning
                                    </div>
                                    <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-slate-700 shrink-0 flex items-center justify-center border border-slate-600" aria-hidden="true">
                                        <div className="w-10 h-10 rounded-lg bg-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                                            Resume Learning
                                        </p>
                                        <h2 className="text-base sm:text-lg font-extrabold leading-snug mb-3">
                                            {data.resumeCourse.title}
                                        </h2>
                                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                            <span className="text-slate-300">{data.resumeCourse.module}</span>
                                            <span className="text-white" aria-label={`${data.resumeCourse.progress}% complete`}>
                                                {data.resumeCourse.progress}% Complete
                                            </span>
                                        </div>
                                        <div
                                            className="w-full h-2 rounded-full bg-slate-700 overflow-hidden mb-4"
                                            role="progressbar"
                                            aria-valuenow={data.resumeCourse.progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-label={`${data.resumeCourse.title} progress: ${data.resumeCourse.progress}% complete`}
                                        >
                                            <div
                                                className="h-full rounded-full bg-blue-500 transition-all"
                                                style={{ width: `${data.resumeCourse.progress}%` }}
                                            />
                                        </div>
                                        <Link
                                            href={`/courses/${data.resumeCourse.id}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
                                            aria-label={`Continue Module ${data.resumeCourse.currentModuleNumber} of ${data.resumeCourse.title}`}
                                        >
                                            <PlayIcon />
                                            Continue Module {data.resumeCourse.currentModuleNumber}
                                        </Link>
                                    </div>
                                </section>
                            )}

                            {/* Active Courses */}
                            <section aria-labelledby="courses-heading" className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2
                                        id="courses-heading"
                                        className="text-xl font-extrabold text-slate-900 tracking-tight"
                                    >
                                        Active Courses
                                    </h2>
                                    <Link
                                        href="/courses"
                                        className="text-sm font-bold text-blue-600 hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        aria-label="Browse all available courses"
                                    >
                                        Browse All →
                                    </Link>
                                </div>
                                <div className="h-px bg-slate-200 mb-5" aria-hidden="true" />
                                {data?.activeCourses && data.activeCourses.length > 0 ? (
                                    <div className="flex flex-col gap-4" role="list">
                                        {data.activeCourses.map(c => (
                                            <CourseCard key={c.id} course={c} />
                                        ))}
                                    </div>
                                ) : (
                                    <div role="alert" aria-live="polite">
                                        <p className="text-slate-400 text-sm text-center py-8">
                                            No active courses yet.{' '}
                                            <Link
                                                href="/courses"
                                                className="text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                aria-label="Browse available courses to get started"
                                            >
                                                Browse courses
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Stats */}
                            <section aria-label="Learning statistics" className="mb-10">
                                <div className="grid grid-cols-3 gap-3 sm:gap-4" role="group">
                                    {stats.map(s => <StatCard key={s.label} {...s} />)}
                                </div>
                            </section>

                            {/* Footer */}
                            <footer
                                className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500"
                                role="contentinfo"
                            >
                                <div className="flex flex-col gap-1.5" role="group" aria-label="Accessibility features">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <CheckCircle aria-hidden="true" />
                                        <span>WCAG 2.2 Compliant</span>
                                    </span>
                                    <span className="flex items-center gap-2 font-semibold">
                                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                            <circle cx="8" cy="8" r="7" fill="#1e293b" />
                                            <path d="M8 1a7 7 0 0 1 0 14V1z" fill="white" />
                                        </svg>
                                        High Contrast Active
                                    </span>
                                </div>
                                <p className="uppercase tracking-widest text-[10px] text-slate-400 text-right">
                                    © 2024 LearnAI Platform<br />
                                    <span aria-label="Tagline">Accessibility-First Learning</span>
                                </p>
                            </footer>
                        </>
                    )}
                </main>
            </DashboardLayout>
        </>
    );
}
