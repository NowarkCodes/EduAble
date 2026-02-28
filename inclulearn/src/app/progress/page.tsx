'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

/* ── Types ───────────────────────────────────────── */
interface ProgressData {
    stats: {
        lessonsCompleted: { value: number; change: string; target: number };
        quizAverage: { value: number; change: string; classAverage: number };
        currentStreak: { value: number; change: string; personalBest: number };
    };
    aiInsights: {
        momentum: string;
        lessonsAheadOfLastWeek: number;
        consistencyIncrease: number;
        topSubject: string;
        topScore: number;
        peakHoursStart: string;
        peakHoursEnd: string;
        prediction: string;
    };
    subjectPerformance: { subject: string; score: number }[];
}

/* ── Skeleton ────────────────────────────────────── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

/* ── Stat Card ───────────────────────────────────── */
function StatCard({ icon, label, value, change, subtitle, accent }: {
    icon: React.ReactNode; label: string; value: string; change: string; subtitle: string; accent: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}15`, color: accent }}>
                    {icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            </div>
            <p className="text-4xl font-black text-slate-900 mb-1">
                {value}
                <span className="text-base font-bold ml-2" style={{ color: accent }}>{change}</span>
            </p>
            <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}

/* ── Subject Bar ─────────────────────────────────── */
function SubjectBar({ subject, score }: { subject: string; score: number }) {
    const barColor = score >= 90 ? '#22c55e' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444';
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{subject}</span>
                <span className="text-sm font-bold text-slate-900">{score}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${score}%`, background: barColor }}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${subject}: ${score}%`}
                />
            </div>
        </div>
    );
}

/* ── Page ────────────────────────────────────────── */
export default function ProgressPage() {
    const { user: authUser, token } = useAuth();
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    const initials = (authUser?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const fetchProgress = useCallback(async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/courses/progress`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setData(await res.json());
        } catch {
            /* fallback handled below */
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchProgress();
        else setLoading(false);
    }, [token, fetchProgress]);

    const stats = [
        {
            icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1l1.5 3.5L13 5l-2.5 2.5.5 3.5L8 9.5 5 11l.5-3.5L3 5l3.5-.5L8 1z" /></svg>,
            label: 'Lessons Completed',
            value: data ? String(data.stats.lessonsCompleted.value) : '—',
            change: data?.stats.lessonsCompleted.change ?? '',
            subtitle: data ? `Target: ${data.stats.lessonsCompleted.target} lessons this month` : '',
            accent: '#3b82f6',
        },
        {
            icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1L9.7 5.5l4.3.3-3.3 2.8 1.1 4.1L8 10.5l-3.8 2.2 1.1-4.1L2 5.8l4.3-.3L8 1z" /></svg>,
            label: 'Quiz Average',
            value: data ? `${data.stats.quizAverage.value}%` : '—',
            change: data?.stats.quizAverage.change ?? '',
            subtitle: data ? `Exceeding class average of ${data.stats.quizAverage.classAverage}%` : '',
            accent: '#f59e0b',
        },
        {
            icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 1.5C8 1.5 4 5.5 4 9a4 4 0 0 0 8 0c0-3.5-4-7.5-4-7.5z" strokeLinejoin="round" /></svg>,
            label: 'Current Streak',
            value: data ? `${data.stats.currentStreak.value} Days` : '—',
            change: data?.stats.currentStreak.change ?? '',
            subtitle: data ? `Personal best: ${data.stats.currentStreak.personalBest} days` : '',
            accent: '#22c55e',
        },
    ];

    return (
        <DashboardLayout userInitials={initials} userName={authUser?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1">Your Learning Progress</h1>
                        <p className="text-slate-500 text-sm max-w-md">A detailed, screen-reader optimized summary of your achievements and learning statistics.</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 2v10M3 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Download Report
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
                        </div>
                        <Skeleton className="h-48" />
                        <Skeleton className="h-56" />
                    </div>
                ) : (
                    <>
                        {/* Stats row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {stats.map(s => <StatCard key={s.label} {...s} />)}
                        </div>

                        {/* AI Insights */}
                        {data?.aiInsights && (
                            <section aria-labelledby="ai-insights-heading" className="rounded-2xl border border-blue-200 bg-blue-50 p-6 mb-8">
                                <h2 id="ai-insights-heading" className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-blue-600" aria-hidden="true">
                                        <path d="M9 1L11 6.5l5 .5-4 3.5 1.5 5L9 13l-4.5 2.5L6 10.5 2 7l5-.5L9 1z" />
                                    </svg>
                                    AI Learning Momentum Insights
                                </h2>
                                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                    Your learning momentum is{' '}
                                    <strong className="text-blue-700">{data.aiInsights.momentum}</strong>{' '}
                                    this week. You&apos;ve completed {data.aiInsights.lessonsAheadOfLastWeek} more lessons than last week, showing a{' '}
                                    {data.aiInsights.consistencyIncrease}% increase in consistency. Your quiz scores are highest in{' '}
                                    <strong className="text-blue-700">{data.aiInsights.topSubject}</strong>{' '}
                                    ({data.aiInsights.topScore}%), while your engagement streak indicates you&apos;re most productive between{' '}
                                    {data.aiInsights.peakHoursStart} and {data.aiInsights.peakHoursEnd}.
                                </p>
                                <blockquote className="italic text-sm text-slate-600 border-l-2 border-blue-300 pl-4">
                                    &ldquo;{data.aiInsights.prediction}&rdquo;
                                </blockquote>
                            </section>
                        )}

                        {/* Subject Performance */}
                        {data?.subjectPerformance && (
                            <section aria-labelledby="subjects-heading" className="rounded-2xl border border-slate-200 bg-white p-6 mb-8">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 id="subjects-heading" className="text-lg font-extrabold text-slate-900">Subject Performance</h2>
                                    <span className="text-xs text-slate-400 font-medium">Showing last 30 days</span>
                                </div>
                                <div className="space-y-5">
                                    {data.subjectPerformance.map(s => <SubjectBar key={s.subject} {...s} />)}
                                </div>
                                <div className="mt-5 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0" aria-hidden="true">
                                        <circle cx="7" cy="7" r="5.5" /><path d="M7 6v4M7 4.5v.5" strokeLinecap="round" />
                                    </svg>
                                    These charts represent your average score across all quizzes and assignments in each subject module.
                                </div>
                            </section>
                        )}

                        {/* No data fallback */}
                        {!data && (
                            <div className="text-center py-16 text-slate-400">
                                <p className="text-lg font-bold mb-1">No progress data yet</p>
                                <p className="text-sm">Complete some courses and quizzes to see your stats here.</p>
                            </div>
                        )}
                    </>
                )}

                {/* Footer */}
                <footer className="border-t border-slate-200 pt-5 text-xs text-slate-400 text-center">
                    <p>© 2024 EduAble Platform · Accessibility-First Learning</p>
                </footer>
            </div>
        </DashboardLayout>
    );
}
