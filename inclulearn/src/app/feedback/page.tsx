'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { feedbackApi } from '@/lib/api';
import { MessageSquare, Frown, Meh, Smile, Ear, CheckCircle2, User as UserIcon } from 'lucide-react';

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

export default function FeedbackDashboard() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

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

    const renderSentiment = (sentiment: string | null) => {
        switch (sentiment) {
            case 'great':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md"><Smile size={14} /> Great</span>;
            case 'neutral':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-md"><Meh size={14} /> Neutral</span>;
            case 'needs_work':
                return <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md"><Frown size={14} /> Needs Work</span>;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Admin View">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <MessageSquare className="text-blue-600 h-8 w-8" />
                            User Feedback
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-2xl text-sm sm:text-base">
                            Review accessibility and course feedback submitted by learners across the platform.
                        </p>
                    </div>
                    <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 inline-flex items-center gap-2 self-start md:self-auto shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Feed
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[250px] bg-slate-100 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center font-medium">
                        {error}
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="bg-white border-2 border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-500 font-medium">
                        <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        No feedback has been submitted yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {feedbacks.map((item) => (
                            <div key={item._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

                                {/* Header */}
                                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                            {item.wcagIssue && (
                                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-200">
                                                    <Ear size={10} />
                                                    WCAG Alert
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <UserIcon size={12} />
                                            {item.isAnonymous || !item.user ? 'Anonymous User' : item.user.name}
                                            <span className="mx-1">•</span>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="shrink-0 pt-0.5">
                                        {renderSentiment(item.sentiment)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 space-y-5">
                                    {item.generalFeedback && (
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">General Note</h4>
                                            <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                "{item.generalFeedback}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Disability Specific Details */}
                                    {((item.audioClarity || item.screenReaderUse || item.blindFeedback) ||
                                        (item.captionAccuracy || item.captionSync || item.deafFeedback)) && (
                                            <div className="space-y-4 pt-2 border-t border-slate-100">

                                                {/* Blind/Low Vision Block */}
                                                {(item.audioClarity || item.screenReaderUse || item.blindFeedback) && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Ear size={12} /> Screen Reader Experience
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
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
                                                            <p className="text-[13px] text-slate-600 italic">"{item.blindFeedback}"</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Deaf/Hard of Hearing Block */}
                                                {(item.captionAccuracy || item.captionSync || item.deafFeedback) && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[11px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                                                            <CheckCircle2 size={12} /> Captioning Experience
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
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
                                                            <p className="text-[13px] text-slate-600 italic">"{item.deafFeedback}"</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
