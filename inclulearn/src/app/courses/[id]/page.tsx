'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import FeedbackModal from '@/components/FeedbackModal';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
    id: string;
    title: string;
    order: number;
    duration: number;
    videoUrl: string | null;
    notesMarkdown?: string;
    completed?: boolean;
    transcript?: string;
}

interface CourseData {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    instructorName: string;
    thumbnail: string | null;
    accessibilityTags: string[];
    totalLessons: number;
    totalDuration: number;
}

interface EnrollmentData {
    status: string;
    progressPercentage: number;
    enrolledAt: string;
    lastAccessedLesson?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function FileTextIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
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

function DownloadIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function SearchInputIcon({ className }: { className?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function VideoIcon() {
    return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
    );
}

function ChevronIcon({ className = '' }: { className?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-7 sm:h-8 bg-slate-200 rounded-xl w-2/3" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="aspect-video bg-slate-200 rounded-2xl" />
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 sm:h-14 bg-slate-100 rounded-xl" />)}
            </div>
        </div>
    );
}

// ─── Transcript Panel (shared between mobile accordion + desktop sidebar) ─────

function TranscriptPanel({ lesson, searchQuery = '' }: { lesson: Lesson | null, searchQuery?: string }) {
    const renderTranscript = (text: string, query: string) => {
        if (!query.trim()) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ?
                <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">{part}</mark> :
                part
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm min-h-0">
            {lesson?.transcript ? (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {renderTranscript(lesson.transcript, searchQuery)}
                </p>
            ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center text-slate-400 gap-3 py-8">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="font-medium text-sm">No transcript yet.</p>
                    <p className="text-xs max-w-[200px]">A transcript will appear here once the AI processes the audio.</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth();
    const initials = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const [course, setCourse] = useState<CourseData | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [isFetchingVideo, setIsFetchingVideo] = useState(false);

    // Mobile transcript accordion
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    // Feedback Modal State
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // Transcript Search State
    const [transcriptSearch, setTranscriptSearch] = useState('');
    const [isTranscriptSearchOpen, setIsTranscriptSearchOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    // ── Fetch course + lessons ────────────────────────────────────────────────

    const fetchCourse = useCallback(async () => {
        if (!token || !id) return;
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND}/api/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to load course');
            }
            const data = await res.json();
            setCourse(data.course);
            const fetchedLessons = data.lessons || [];
            setLessons(fetchedLessons);
            setEnrollment(data.enrollment);

            // If user has a last accessed lesson, find its index
            if (data.enrollment?.lastAccessedLesson && fetchedLessons.length > 0) {
                const lastIdx = fetchedLessons.findIndex((l: Lesson) => l.id === data.enrollment.lastAccessedLesson);
                if (lastIdx !== -1) {
                    setCurrentLessonIdx(lastIdx);
                }
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load course');
        } finally {
            setIsLoading(false);
        }
    }, [token, id]);

    useEffect(() => { fetchCourse(); }, [fetchCourse]);

    // ── Auto-enroll ───────────────────────────────────────────────────────────

    const enroll = useCallback(async () => {
        if (!token || !id || enrollment) return;
        setIsEnrolling(true);
        try {
            await fetch(`${BACKEND}/api/courses/${id}/enroll`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchCourse();
        } catch { /* non-fatal */ } finally {
            setIsEnrolling(false);
        }
    }, [token, id, enrollment, fetchCourse]);

    useEffect(() => {
        if (!isLoading && !enrollment && course) enroll();
    }, [isLoading, enrollment, course, enroll]);

    // ── Fetch signed video URL ─────────────────────────────────────────────

    useEffect(() => {
        const rawUrl = lessons[currentLessonIdx]?.videoUrl;
        if (!rawUrl || !token) { setPlaybackUrl(null); return; }

        let cloudPath: string | null = null;
        try {
            const parsed = new URL(rawUrl);
            if (parsed.searchParams.has('X-Goog-Signature')) { setPlaybackUrl(rawUrl); return; }
            const pathParts = parsed.pathname.split('/').slice(2);
            cloudPath = decodeURIComponent(pathParts.join('/'));
        } catch {
            setPlaybackUrl(rawUrl); return;
        }

        if (!cloudPath) { setPlaybackUrl(rawUrl); return; }

        setIsFetchingVideo(true);
        setPlaybackUrl(null);
        fetch(`${BACKEND}/api/ngo/video-url?path=${encodeURIComponent(cloudPath)}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setPlaybackUrl(data.url ?? rawUrl))
            .catch(() => setPlaybackUrl(rawUrl))
            .finally(() => setIsFetchingVideo(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLessonIdx, lessons, token]);

    // ── Video Metadata Handling ──────────────────────────────────────────────
    const handleLoadedMetadata = () => {
        if (!videoRef.current || !currentLesson) return;
        const realDuration = Math.round(videoRef.current.duration);

        // Update the lessons state with the real duration if it's missing or different
        if (realDuration > 0 && currentLesson.duration !== realDuration) {
            setLessons(prev => {
                const updated = [...prev];
                if (updated[currentLessonIdx]) {
                    updated[currentLessonIdx] = { ...updated[currentLessonIdx], duration: realDuration };
                }
                return updated;
            });

            // Persist to backend so it's not hardcoded anymore
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            fetch(`${baseUrl}/api/courses/lessons/${currentLesson.id}/duration`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ duration: realDuration })
            }).catch(err => console.error('Failed to persist duration:', err));
        }
    };

    // ── Reset video on lesson change ──────────────────────────────────────────

    useEffect(() => {
        if (videoRef.current) videoRef.current.load();
    }, [currentLessonIdx]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const currentLesson = lessons[currentLessonIdx] ?? null;
    const hasPrev = currentLessonIdx > 0;
    const hasNext = currentLessonIdx < lessons.length - 1;

    const handleCompleteLesson = useCallback(async () => {
        if (!token || !id || !currentLesson || currentLesson.completed) return;

        try {
            const res = await fetch(`${BACKEND}/api/courses/${id}/lessons/${currentLesson.id}/complete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                // Update local lesson state
                setLessons(prev => prev.map(l =>
                    l.id === currentLesson.id ? { ...l, completed: true } : l
                ));
                // Update enrollment progress
                if (data.enrollment) {
                    setEnrollment(data.enrollment);
                }
            }
        } catch (err) {
            console.error('Failed to complete lesson:', err);
        }
    }, [token, id, currentLesson]);

    const goToLesson = (idx: number) => {
        setCurrentLessonIdx(idx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculatedTotalDuration = Math.round(lessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-6 md:py-8">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-500 mb-4 sm:mb-6 uppercase tracking-wider flex-wrap min-w-0">
                        <Link href="/dashboard" className="hover:text-blue-600 transition-colors shrink-0">Dashboard</Link>
                        <span aria-hidden="true">›</span>
                        <Link href="/allcourses" className="hover:text-blue-600 transition-colors shrink-0 hidden sm:inline">All Courses</Link>
                        <span aria-hidden="true" className="hidden sm:inline">›</span>
                        <span className="text-slate-900 truncate">{course?.title ?? 'Loading…'}</span>
                    </nav>

                    {isLoading ? (
                        <Skeleton />
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 sm:p-8 text-center">
                            <p className="text-base sm:text-lg font-bold mb-2">Could not load course</p>
                            <p className="text-sm">{error}</p>
                            <Link href="/allcourses" className="mt-4 inline-block text-blue-600 font-bold hover:underline text-sm">← Back to All Courses</Link>
                        </div>
                    ) : course ? (
                        <>
                            {/* Header */}
                            <header className="mb-4 sm:mb-6">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                    <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider">{course.level}</span>
                                    <span className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full">{course.category}</span>
                                    {isEnrolling && <span className="text-xs text-slate-400 italic">Enrolling…</span>}
                                    {enrollment && (
                                        <span className="bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full">
                                            ✓ Enrolled · {enrollment.progressPercentage}% complete
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1">{course.title}</h1>
                                <p className="text-slate-500 font-medium text-sm">By {course.instructorName}</p>
                            </header>

                            <div className="flex flex-col xl:flex-row gap-5 sm:gap-6">

                                {/* ── Left Column ──────────────────────────────────── */}
                                <div className="flex-1 min-w-0 flex flex-col gap-5 sm:gap-6">

                                    {/* Video Player */}
                                    <div className="bg-black rounded-2xl overflow-hidden shadow-md">
                                        {isFetchingVideo ? (
                                            <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
                                                <p className="text-xs sm:text-sm font-semibold">Loading video…</p>
                                            </div>
                                        ) : playbackUrl ? (
                                            <video
                                                key={playbackUrl}
                                                ref={videoRef}
                                                controls
                                                autoPlay={false}
                                                className="w-full max-h-[56vw] sm:max-h-[480px] lg:max-h-[560px] rounded-2xl bg-black"
                                                controlsList="nodownload"
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onEnded={handleCompleteLesson}
                                                aria-label={`Video: ${currentLesson?.title}`}
                                                onError={() => { setPlaybackUrl(null); setIsFetchingVideo(false); }}
                                            >
                                                <source src={playbackUrl} type="video/mp4" />
                                                <source src={playbackUrl} type="video/webm" />
                                                <track kind="captions" label="Auto-generated captions" default />
                                                <p className="text-white p-4 text-sm">
                                                    Your browser does not support the video element.{' '}
                                                    <a href={playbackUrl} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">Open video directly</a>
                                                </p>
                                            </video>
                                        ) : currentLesson?.videoUrl ? (
                                            <div className="aspect-video flex flex-col items-center justify-center gap-3 sm:gap-4 bg-slate-900 text-slate-300 p-4">
                                                <VideoIcon />
                                                <p className="font-semibold text-sm text-center">Could not load video player.</p>
                                                <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs">
                                                    Try opening video directly ↗
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="aspect-video flex flex-col items-center justify-center gap-3 sm:gap-4 bg-slate-900 text-slate-400 p-4">
                                                <VideoIcon />
                                                <p className="font-semibold text-sm text-center">No video available for this lesson yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile transcript accordion — hidden on xl */}
                                    <div className="xl:hidden">
                                        <button
                                            onClick={() => setTranscriptOpen(prev => !prev)}
                                            aria-expanded={transcriptOpen}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${transcriptOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                Lesson Transcript
                                            </span>
                                            <ChevronIcon className={`transition-transform ${transcriptOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {transcriptOpen && (
                                            <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-72 flex flex-col">
                                                <div className="p-3 border-b border-slate-100 bg-slate-50 relative">
                                                    <SearchInputIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search transcript..."
                                                        value={transcriptSearch}
                                                        onChange={e => setTranscriptSearch(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <TranscriptPanel lesson={currentLesson} searchQuery={transcriptSearch} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson Notes / Description */}
                                    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 md:p-6 shadow-sm">
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <FileTextIcon />
                                            <span className="truncate">
                                                {currentLesson ? `Lesson ${currentLesson.order}: ${currentLesson.title}` : 'Course Overview'}
                                            </span>
                                        </h2>
                                        <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                                            <p>{course.description}</p>
                                            {currentLesson?.notesMarkdown && (
                                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                                                    <p className="font-bold text-slate-700 mb-2">Lesson Notes:</p>
                                                    <p className="whitespace-pre-line">{currentLesson.notesMarkdown}</p>
                                                </div>
                                            )}
                                        </div>
                                        {course.accessibilityTags?.length > 0 && (
                                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 sm:gap-2">
                                                {course.accessibilityTags.map(tag => (
                                                    <span key={tag} className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                                        {tag.replace(/-/g, ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </section>

                                    {/* Nav buttons */}
                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => hasPrev && goToLesson(currentLessonIdx - 1)}
                                            disabled={!hasPrev}
                                            className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl transition-colors text-xs sm:text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 shrink-0">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                            <span className="hidden xs:inline">Previous </span>Lesson
                                        </button>

                                        {hasNext ? (
                                            <button
                                                onClick={() => goToLesson(currentLessonIdx + 1)}
                                                className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-colors text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                            >
                                                Next Lesson
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 text-white font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm shadow-sm">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                    Course Complete!
                                                </span>
                                                <button
                                                    onClick={() => setIsFeedbackOpen(true)}
                                                    className="flex items-center gap-1.5 sm:gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl transition-colors text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                                >
                                                    Leave Feedback
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Lessons list */}
                                    <section>
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                                            Course Content ({lessons.length} lessons)
                                        </h2>
                                        <div className="space-y-2 sm:space-y-3">
                                            {lessons.map((lesson, idx) => {
                                                const isActive = idx === currentLessonIdx;
                                                const isDone = lesson.completed;
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => goToLesson(idx)}
                                                        className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all ${isActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                                    >
                                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                            {isDone ? (
                                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                                </div>
                                                            ) : isActive ? (
                                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{lesson.order}</div>
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">{lesson.order}</div>
                                                            )}
                                                            <span className={`font-semibold truncate text-sm ${isActive ? 'text-blue-700' : isDone ? 'text-slate-900' : 'text-slate-600'}`}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ml-2 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            {isActive ? 'Playing' : lesson.duration ? formatDuration(lesson.duration) : '--:--'}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {lessons.length === 0 && (
                                                <p className="text-slate-400 text-sm italic p-4 text-center">No lessons have been added to this course yet.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                {/* ── Right Column — desktop only (xl+) ──────────────── */}
                                <div className="hidden xl:flex xl:w-[380px] shrink-0 flex-col gap-6">

                                    {/* Transcript Card */}
                                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
                                        <header className="bg-blue-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="font-bold text-sm sm:text-base leading-snug">Lesson Transcript</h2>
                                                    <p className="text-[9px] font-bold text-blue-200 tracking-widest uppercase mt-0.5">Auto-generated • Accessibility</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 sm:gap-1.5 text-blue-200">
                                                <button className="p-1.5 sm:p-2 hover:text-white transition-colors hover:bg-blue-500 rounded-lg" aria-label="Download transcript">
                                                    <DownloadIcon />
                                                </button>
                                                <button
                                                    onClick={() => setIsTranscriptSearchOpen(prev => !prev)}
                                                    className={`p-1.5 sm:p-2 transition-colors rounded-lg flex items-center justify-center ${isTranscriptSearchOpen ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-white hover:bg-blue-500'}`}
                                                    aria-label="Search transcript"
                                                >
                                                    <SearchInputIcon />
                                                </button>
                                            </div>
                                        </header>

                                        {isTranscriptSearchOpen && (
                                            <div className="p-3 border-b border-slate-100 bg-slate-50 relative shrink-0">
                                                <SearchInputIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder="Search keywords or phrases..."
                                                    value={transcriptSearch}
                                                    onChange={e => setTranscriptSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                                />
                                            </div>
                                        )}

                                        <TranscriptPanel lesson={currentLesson} searchQuery={transcriptSearch} />
                                    </section>

                                    {/* Course Details */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
                                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                            <LightningIcon />
                                            Course Details
                                        </h3>
                                        <div className="space-y-2.5 sm:space-y-3 text-sm">
                                            {[
                                                { label: 'Total Lessons', value: course.totalLessons },
                                                { label: 'Total Duration', value: `${calculatedTotalDuration || course.totalDuration} min` },
                                                { label: 'Current Lesson', value: currentLesson?.duration ? formatDuration(currentLesson.duration) : '--:--' },
                                                { label: 'Level', value: course.level },
                                                { label: 'Category', value: course.category },
                                                { label: 'Instructor', value: course.instructorName },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex justify-between gap-2">
                                                    <span className="text-slate-500">{label}</span>
                                                    <span className="font-bold text-slate-900 text-right truncate max-w-[55%]">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {enrollment && (
                                            <div className="pt-3 sm:pt-4 border-t border-slate-100">
                                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                                    <span className="text-slate-600">Your Progress</span>
                                                    <span className="text-blue-700">{enrollment.progressPercentage}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full transition-all"
                                                        style={{ width: `${enrollment.progressPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile course details — show as separate section below lessons on mobile */}
                                </div>
                            </div>

                            {/* Course Details card for mobile/tablet (below lessons, hidden on xl) */}
                            <div className="xl:hidden mt-5 sm:mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3 sm:space-y-4">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <LightningIcon />
                                    Course Details
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                                    {[
                                        { label: 'Total Lessons', value: course.totalLessons },
                                        { label: 'Total Duration', value: `${calculatedTotalDuration || course.totalDuration} min` },
                                        { label: 'Current Lesson', value: currentLesson?.duration ? formatDuration(currentLesson.duration) : '--:--' },
                                        { label: 'Level', value: course.level },
                                        { label: 'Category', value: course.category },
                                        { label: 'Instructor', value: course.instructorName },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                                            <span className="font-bold text-slate-900 text-sm truncate">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                {enrollment && (
                                    <div className="pt-3 border-t border-slate-100">
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className="text-slate-600">Your Progress</span>
                                            <span className="text-blue-700">{enrollment.progressPercentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${enrollment.progressPercentage}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}

                </div>

                {/* Footer */}
                <footer className="mt-8 sm:mt-12 py-6 sm:py-8 border-t border-slate-200 px-4">
                    <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <span>© 2025 EduAble</span>
                            <span className="hidden sm:inline">•</span>
                            <Link href="#" className="hover:text-slate-600">Accessibility Statement</Link>
                            <span className="hidden sm:inline">•</span>
                            <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>WCAG 2.2 AAA Compliant</span>
                        </div>
                    </div>
                </footer>
            </DashboardLayout>

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onCloseAction={() => setIsFeedbackOpen(false)}
                onSubmitAction={() => setIsFeedbackOpen(false)}
            />
        </>
    );
}