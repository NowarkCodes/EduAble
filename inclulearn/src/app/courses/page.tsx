'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

/* ── Types ───────────────────────────────────────── */
interface InProgressCourse {
    id: string;
    title: string;
    category: string;
    level: string;
    progress: number;
    lastAccessed: string;
    aiSummary: string;
    thumbnail: string | null;
}
interface CompletedCourse {
    id: string;
    title: string;
    category: string;
    level: string;
    progress: number;
    completedDate: string;
    certificateUrl: string;
    thumbnail: string | null;
}

/* ── Skeleton ────────────────────────────────────── */
function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-5 animate-pulse">
            <div className="w-32 h-28 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="h-3 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-2/3 bg-slate-200 rounded-full" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-3 w-full bg-slate-200 rounded-full" />
                <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
            </div>
        </div>
    );
}

/* ── Category badge colors ───────────────────────── */
const categoryColors: Record<string, string> = {
    'Data Science': 'bg-teal-50 text-teal-700',
    'Ethics': 'bg-purple-50 text-purple-700',
    'NLP': 'bg-blue-50 text-blue-700',
    'Accessibility': 'bg-green-50 text-green-700',
    'Programming': 'bg-orange-50 text-orange-700',
    'Design': 'bg-pink-50 text-pink-700',
};

/* ── In-Progress Card ────────────────────────────── */
function InProgressCard({ course }: { course: InProgressCourse }) {
    const badgeClass = categoryColors[course.category] ?? 'bg-slate-100 text-slate-600';
    return (
        <article className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="w-full sm:w-36 h-36 sm:h-auto bg-slate-100 shrink-0 relative flex items-center justify-center border-r border-slate-100 overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="1.5" aria-hidden="true">
                                    <rect x="2" y="3" width="24" height="19" rx="2" /><path d="M8 9h12M8 14h8" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeClass}`}>{course.category}</span>
                        <span className="text-[10px] text-slate-400 font-medium">• {course.level}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mb-3">{course.title}</h3>

                    {/* AI Summary */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                        <p className="text-xs font-bold text-blue-600 flex items-center gap-1.5 mb-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 1L7.5 4.5L11 5L8.5 7.5L9.2 11L6 9.2L2.8 11L3.5 7.5L1 5L4.5 4.5L6 1Z" /></svg>
                            Summary
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">{course.aiSummary}</p>
                    </div>

                    {/* Progress */}
                    <div className="mb-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                            <span className="uppercase tracking-widest text-slate-500">Progress</span>
                            <span className="text-blue-600">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                                role="progressbar"
                                aria-valuenow={course.progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <p className="text-[11px] text-slate-400 font-medium">Last accessed {course.lastAccessed}</p>
                        <Link
                            href={`/courses/${course.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                            Continue Learning →
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ── Completed Card ──────────────────────────────── */
function CompletedCard({ course }: { course: CompletedCourse }) {
    const badgeClass = categoryColors[course.category] ?? 'bg-slate-100 text-slate-600';
    return (
        <article className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-green-500">
            <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="w-full sm:w-36 h-36 sm:h-auto bg-slate-100 shrink-0 relative flex items-center justify-center border-r border-slate-100 overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeClass}`}>{course.category}</span>
                            <span className="text-[10px] text-slate-400 font-medium">• {course.level}</span>
                        </div>
                        <Link href={`/courses/${course.id}`} className="hover:text-blue-600 transition-colors">
                            <h3 className="text-base font-bold text-slate-900 truncate">{course.title}</h3>
                        </Link>
                        <p className="text-xs text-slate-400 mt-1">
                            Completed {new Date(course.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <a
                            href={course.certificateUrl}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-green-600 text-green-700 text-xs font-bold hover:bg-green-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 shrink-0"
                        >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="2" width="11" height="9" rx="1" /><path d="M4 6.5h5M6.5 4v5" strokeLinecap="round" /></svg>
                            Certificate
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ── Page ────────────────────────────────────────── */
export default function CoursesPage() {
    const { user: authUser, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'inProgress' | 'completed'>('inProgress');
    const [inProgress, setInProgress] = useState<InProgressCourse[]>([]);
    const [completed, setCompleted] = useState<CompletedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const initials = (authUser?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const fetchCourses = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            const json = await res.json();
            setInProgress(json.inProgress ?? []);
            setCompleted(json.completed ?? []);
        } catch {
            // Keep empty arrays on failure
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchCourses();
        else setLoading(false);
    }, [token, fetchCourses]);

    const filteredInProgress = inProgress.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );
    const filteredCompleted = completed.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout userInitials={initials} userName={authUser?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1">My Courses</h1>
                    <p className="text-slate-500 text-sm">Track your AI-powered learning progress and continue where you left off.</p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5l3.5 3.5" strokeLinecap="round" />
                    </svg>
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        aria-label="Search courses"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 border-b border-slate-200">
                    {(['inProgress', 'completed'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            aria-selected={activeTab === tab}
                            className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab === 'inProgress' ? 'In Progress' : 'Completed'}
                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {tab === 'inProgress' ? filteredInProgress.length : filteredCompleted.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Course list */}
                {loading ? (
                    <div className="space-y-4">
                        <CardSkeleton /><CardSkeleton /><CardSkeleton />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'inProgress' ? (
                            filteredInProgress.length > 0
                                ? filteredInProgress.map(c => <InProgressCard key={c.id} course={c} />)
                                : <p className="text-center text-slate-400 py-12 text-sm">No courses found{search ? ` for "${search}"` : ''}.</p>
                        ) : (
                            filteredCompleted.length > 0
                                ? filteredCompleted.map(c => <CompletedCard key={c.id} course={c} />)
                                : <p className="text-center text-slate-400 py-12 text-sm">No completed courses yet.</p>
                        )}
                    </div>
                )}

                {/* Load more */}
                {!loading && activeTab === 'inProgress' && filteredInProgress.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 2v10M3 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            Load More Courses
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
