'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { feedbackApi } from '@/lib/api';
import {
    MessageSquare,
    Frown,
    Meh,
    Smile,
    Ear,
    CheckCircle2,
    User as UserIcon,
    SlidersHorizontal,
    X,
} from 'lucide-react';

interface FeedbackItem {
    _id: string;
    category: string;
    sentiment: 'needs_work' | 'neutral' | 'great' | null;
    generalFeedback: string;
    wcagIssue: boolean | null;
    audioClarity: string | null;
    screenReaderUse: string | null;
    blindFeedback: string;
    captionAccuracy: string | null;
    captionSync: string | null;
    deafFeedback: string;
    isAnonymous: boolean;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
}

const SENTIMENT_CONFIG = {
    great: {
        icon: <Smile size={13} />,
        label: 'Great',
        className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    neutral: {
        icon: <Meh size={13} />,
        label: 'Neutral',
        className: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    },
    needs_work: {
        icon: <Frown size={13} />,
        label: 'Needs Work',
        className: 'text-red-600 bg-red-50 border-red-100',
    },
};

function SentimentBadge({ sentiment }: { sentiment: FeedbackItem['sentiment'] }) {
    if (!sentiment || !(sentiment in SENTIMENT_CONFIG)) return null;
    const cfg = SENTIMENT_CONFIG[sentiment];
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${cfg.className}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

function StatPill({ label, count, accent }: { label: string; count: number; accent: string }) {
    return (
        <div className={`flex-1 min-w-[80px] rounded-2xl px-4 py-3 ${accent}`}>
            <p className="text-2xl font-black leading-none">{count}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</p>
        </div>
    );
}

export default function FeedbackDashboard() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sentimentFilter, setSentimentFilter] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'U';

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                // @ts-ignore
                const data = await feedbackApi.list();
                setFeedbacks(data as FeedbackItem[]);
            } catch (err) {
                console.error('Failed to fetch feedback:', err);
                setError('Could not load feedback data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const filtered =
        sentimentFilter === 'all'
            ? feedbacks
            : feedbacks.filter((f) => f.sentiment === sentimentFilter);

    const counts = {
        great: feedbacks.filter((f) => f.sentiment === 'great').length,
        neutral: feedbacks.filter((f) => f.sentiment === 'neutral').length,
        needs_work: feedbacks.filter((f) => f.sentiment === 'needs_work').length,
        wcag: feedbacks.filter((f) => f.wcagIssue).length,
    };

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Admin View">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-5 sm:py-8">

                {/* ── Page Header ─────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <MessageSquare className="text-blue-600 shrink-0" size={26} />
                            User Feedback
                        </h1>
                        <p className="text-slate-500 font-medium mt-1.5 text-sm sm:text-base max-w-xl">
                            Review accessibility and course feedback submitted by learners.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 self-start shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Feed
                    </div>
                </div>

                {/* ── Stats Row ────────────────────────────────────── */}
                {!loading && !error && feedbacks.length > 0 && (
                    <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-7 overflow-x-auto pb-1 scrollbar-none">
                        <StatPill label="Total" count={feedbacks.length} accent="bg-slate-100 text-slate-700" />
                        <StatPill label="Great" count={counts.great} accent="bg-emerald-50 text-emerald-700" />
                        <StatPill label="Neutral" count={counts.neutral} accent="bg-yellow-50 text-yellow-700" />
                        <StatPill label="Needs Work" count={counts.needs_work} accent="bg-red-50 text-red-700" />
                        {counts.wcag > 0 && (
                            <StatPill label="WCAG Alerts" count={counts.wcag} accent="bg-indigo-50 text-indigo-700" />
                        )}
                    </div>
                )}

                {/* ── Filter Bar ───────────────────────────────────── */}
                {!loading && !error && feedbacks.length > 0 && (
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                        {/* Mobile toggle */}
                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200"
                        >
                            <SlidersHorizontal size={13} />
                            Filter
                        </button>

                        {/* Pills — always visible on sm+, toggle on mobile */}
                        <div className={`flex gap-2 flex-wrap ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
                            {['all', 'great', 'neutral', 'needs_work'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setSentimentFilter(v)}
                                    className={[
                                        'px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all',
                                        sentimentFilter === v
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                                    ].join(' ')}
                                >
                                    {v === 'needs_work' ? 'Needs Work' : v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        {sentimentFilter !== 'all' && (
                            <button
                                onClick={() => setSentimentFilter('all')}
                                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>
                )}

                {/* ── States ───────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-56 bg-slate-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-5 sm:p-6 rounded-2xl text-center font-medium text-sm">
                        {error}
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 sm:p-14 text-center text-slate-500 font-medium">
                        <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        No feedback has been submitted yet.
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-medium text-sm">
                        No feedback matches this filter.
                    </div>
                ) : (
                    /* ── Cards Grid ──────────────────────────────────── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filtered.map((item) => (
                            <article
                                key={item._id}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                            >
                                {/* Card Header */}
                                <div className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                            <span className="text-[11px] font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                            {item.wcagIssue && (
                                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-200">
                                                    <Ear size={10} />
                                                    WCAG Alert
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap text-[11px] font-bold text-slate-400">
                                            <UserIcon size={11} className="shrink-0" />
                                            <span className="truncate max-w-[140px]">
                                                {item.isAnonymous || !item.user ? 'Anonymous User' : item.user.name}
                                            </span>
                                            <span>·</span>
                                            <span className="shrink-0">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 pt-0.5">
                                        <SentimentBadge sentiment={item.sentiment} />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-4 sm:px-5 py-4 flex-1 space-y-4">
                                    {item.generalFeedback && (
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                                General Note
                                            </h4>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                "{item.generalFeedback}"
                                            </p>
                                        </div>
                                    )}

                                    {((item.audioClarity || item.screenReaderUse || item.blindFeedback) ||
                                        (item.captionAccuracy || item.captionSync || item.deafFeedback)) && (
                                            <div className="space-y-3 pt-3 border-t border-slate-100">

                                                {/* Screen reader block */}
                                                {(item.audioClarity || item.screenReaderUse || item.blindFeedback) && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Ear size={11} /> Screen Reader Experience
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.audioClarity && (
                                                                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                                                                    Audio: <span className="capitalize">{item.audioClarity}</span>
                                                                </span>
                                                            )}
                                                            {item.screenReaderUse && (
                                                                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">
                                                                    Usage: <span className="capitalize">{item.screenReaderUse}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.blindFeedback && (
                                                            <p className="text-xs text-slate-500 italic mt-1">"{item.blindFeedback}"</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Captioning block */}
                                                {(item.captionAccuracy || item.captionSync || item.deafFeedback) && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                                                            <CheckCircle2 size={11} /> Captioning Experience
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.captionAccuracy && (
                                                                <span className="text-[11px] font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100">
                                                                    Accuracy: <span className="capitalize">{item.captionAccuracy}</span>
                                                                </span>
                                                            )}
                                                            {item.captionSync && (
                                                                <span className="text-[11px] font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded-md border border-teal-100">
                                                                    Sync: <span className="capitalize">{item.captionSync.replace('_', ' ')}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.deafFeedback && (
                                                            <p className="text-xs text-slate-500 italic mt-1">"{item.deafFeedback}"</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}