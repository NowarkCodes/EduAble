'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
    id: string;
    title: string;
    progress?: number;
    lastAccessed?: string;
    completedDate?: string;
}

function MailIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function AccessibilityIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" />
            <path d="M12 9v4" />
            <path d="M7 9h10" />
            <path d="M9 22l3-5 3 5" />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
        </svg>
    );
}

function TrendingUpIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
}

export default function ProfilePage() {
    const { user, token } = useAuth();
    const {
        screenReader, setScreenReader,
        highContrast, setHighContrast,
        dyslexiaFont, setDyslexiaFont
    } = useAccessibility();

    const [inProgress, setInProgress] = useState<Course[]>([]);
    const [completed, setCompleted] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const fetchCourses = useCallback(async () => {
        if (!token) return;
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${baseUrl}/api/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setInProgress(json.inProgress ?? []);
                setCompleted(json.completed ?? []);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoadingCourses(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const initials = (user?.name ?? '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
    const displayName = user?.name ?? 'Guest User';
    const email = user?.email ?? 'No email associated';

    return (
        <DashboardLayout userInitials={initials} userName={displayName} userTier="Standard Account">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border border-slate-200 shadow-sm text-center sm:text-left">
                    <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden flex-shrink-0 border-4 border-white shadow-sm flex items-center justify-center relative">
                        {/* Placeholder avatar */}
                        <svg viewBox="0 0 80 80" className="w-full h-full text-blue-300">
                            <circle cx="40" cy="40" r="40" fill="currentColor" opacity="0.4" />
                            <circle cx="40" cy="30" r="14" fill="currentColor" />
                            <ellipse cx="40" cy="68" rx="24" ry="18" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{displayName}</h1>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-sm text-slate-500 font-medium mb-1">
                            <div className="flex items-center gap-2">
                                <MailIcon />
                                <span>{email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GlobeIcon />
                                <span>English (US)</span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center">
                        <EditIcon />
                        Edit Profile
                    </button>
                </div>

                {/* Middle Row: Preferences & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                    {/* Accessibility Preferences */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <AccessibilityIcon />
                            Accessibility Preferences
                        </h2>

                        <div className="flex-1 flex flex-col min-h-[0]">
                            {[
                                { label: "Screen Reader Mode", value: screenReader, onChange: setScreenReader, icon: "AD›" },
                                { label: "High Contrast", value: highContrast, onChange: setHighContrast, icon: "◑" },
                                { label: "Dyslexia Font", value: dyslexiaFont, onChange: setDyslexiaFont, icon: "A" },
                            ].map(({ label, value, onChange, icon }, i, arr) => (
                                <div key={label} className={`flex items-center py-4 ${i !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 mr-4 flex-shrink-0">
                                        {icon}
                                    </span>
                                    <span className="flex-1 text-base font-semibold text-slate-700">{label}</span>
                                    <Toggle enabled={value} onChange={onChange} />
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-sm text-slate-400 italic">
                            Settings are automatically applied to your learning dashboard and courses.
                        </p>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrophyIcon />
                            Achievements
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                                <div className="text-4xl font-black text-blue-600 mb-1">12</div>
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Courses Finished</div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                                <div className="text-4xl font-black text-blue-600 mb-1">4</div>
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Certificates</div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-4 mt-auto">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-xl font-bold">⚡</div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">★</div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-xl font-bold">📅</div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl"><LockIcon /></div>
                        </div>
                    </div>
                </div>

                {/* Learning Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUpIcon />
                            Learning Progress
                        </h2>
                        <Link href="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View All My Courses</Link>
                    </div>

                    {loadingCourses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-100 animate-pulse rounded-2xl h-48 border border-slate-200" />
                            <div className="bg-slate-100 animate-pulse rounded-2xl h-48 border border-slate-200" />
                        </div>
                    ) : inProgress.length === 0 && completed.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                            <p>You haven't started any courses yet.</p>
                            <Link href="/allcourses" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Explore Courses</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* In Progress Cards */}
                            {inProgress.slice(0, 2).map(course => (
                                <div key={`in-prog-${course.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                    <div className="bg-blue-100/50 p-6 pb-5">
                                        <span className="inline-block bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">In Progress</span>
                                        <h3 className="text-xl font-extrabold text-slate-800">{course.title}</h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-slate-600">Course Completion</span>
                                            <span className="text-lg font-black text-blue-600 leading-none">{course.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-sm text-slate-400 truncate pr-2">Last accessed: {course.lastAccessed}</span>
                                            <Link href={`/courses/${course.id}`} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors shrink-0">
                                                Continue <ArrowRightIcon />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Completed Cards */}
                            {completed.slice(0, Math.max(0, 2 - inProgress.slice(0, 2).length)).map(course => (
                                <div key={`comp-${course.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                                    <div className="bg-emerald-100/50 p-6 pb-5">
                                        <div className="absolute top-5 right-5">
                                            <CheckCircleIcon />
                                        </div>
                                        <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">Completed</span>
                                        <h3 className="text-xl font-extrabold text-emerald-900">{course.title}</h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-slate-600">Course Completion</span>
                                            <span className="text-lg font-black text-emerald-600 leading-none">100%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-sm text-slate-400 truncate pr-2">Completed on: {new Date(course.completedDate || '').toLocaleDateString()}</span>
                                            <Link href={`/courses/${course.id}`} className="text-sm font-bold text-slate-700 flex items-center gap-1.5 hover:text-slate-900 transition-colors shrink-0">
                                                Review
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}