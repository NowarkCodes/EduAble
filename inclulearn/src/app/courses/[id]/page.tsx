'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const BACKEND = 'http://localhost:5000';

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
}

// ─── Helper: format seconds ──────────────────────────────────────────────────

function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function SearchInputIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-xl w-2/3" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="aspect-video bg-slate-200 rounded-2xl" />
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-slate-100 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, token } = useAuth();
    const initials = (user?.name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const [course, setCourse] = useState<CourseData | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
    const [isFetchingVideo, setIsFetchingVideo] = useState(false);
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
            setLessons(data.lessons || []);
            setEnrollment(data.enrollment);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Could not load course');
        } finally {
            setIsLoading(false);
        }
    }, [token, id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    // ── Auto enroll on first visit ────────────────────────────────────────────

    const enroll = useCallback(async () => {
        if (!token || !id || enrollment) return;
        setIsEnrolling(true);
        try {
            await fetch(`${BACKEND}/api/courses/${id}/enroll`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchCourse(); // refresh enrollment state
        } catch {
            // non-fatal — they can still watch
        } finally {
            setIsEnrolling(false);
        }
    }, [token, id, enrollment, fetchCourse]);

    useEffect(() => {
        if (!isLoading && !enrollment && course) enroll();
    }, [isLoading, enrollment, course, enroll]);

    // ── Fetch signed playback URL whenever the current lesson changes ─────────

    useEffect(() => {
        const rawUrl = lessons[currentLessonIdx]?.videoUrl;
        if (!rawUrl || !token) {
            setPlaybackUrl(null);
            return;
        }

        // If it's already a signed GCS url (short-lived token query params), use it directly
        // Otherwise derive the cloud path from the stored public URL pattern:
        // https://storage.googleapis.com/BUCKET/uploads/videos/FILE
        let cloudPath: string | null = null;
        try {
            const parsed = new URL(rawUrl);
            // Signed URLs have X-Goog-Signature param — already valid, use as-is
            if (parsed.searchParams.has('X-Goog-Signature')) {
                setPlaybackUrl(rawUrl);
                return;
            }
            // Extract path after the host: /BUCKET/uploads/videos/FILE
            const pathParts = parsed.pathname.split('/').slice(2); // drop leading '' and BUCKET
            // Decode %20 etc. → real chars (e.g. spaces) so GCS can find the file by its actual name
            cloudPath = decodeURIComponent(pathParts.join('/'));
        } catch {
            setPlaybackUrl(rawUrl); // fallback: just try directly
            return;
        }

        if (!cloudPath) {
            setPlaybackUrl(rawUrl);
            return;
        }

        setIsFetchingVideo(true);
        setPlaybackUrl(null);
        fetch(`${BACKEND}/api/ngo/video-url?path=${encodeURIComponent(cloudPath)}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                if (data.url) setPlaybackUrl(data.url);
                else setPlaybackUrl(rawUrl); // fallback
            })
            .catch(() => setPlaybackUrl(rawUrl))
            .finally(() => setIsFetchingVideo(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLessonIdx, lessons, token]);

    // ── Reset video element on lesson change ─────────────────────────────────

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [currentLessonIdx]);

    // ── Derived helpers ───────────────────────────────────────────────────────

    const currentLesson = lessons[currentLessonIdx] ?? null;
    const hasPrev = currentLessonIdx > 0;
    const hasNext = currentLessonIdx < lessons.length - 1;

    const goToLesson = (idx: number) => {
        setCurrentLessonIdx(idx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 uppercase tracking-wider flex-wrap">
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <span>›</span>
                    <Link href="/allcourses" className="hover:text-blue-600 transition-colors">All Courses</Link>
                    <span>›</span>
                    <span className="text-slate-900">{course?.title ?? 'Loading…'}</span>
                </nav>

                {isLoading ? (
                    <Skeleton />
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center">
                        <p className="text-lg font-bold mb-2">Could not load course</p>
                        <p className="text-sm">{error}</p>
                        <Link href="/allcourses" className="mt-4 inline-block text-blue-600 font-bold hover:underline">← Back to All Courses</Link>
                    </div>
                ) : course ? (
                    <>
                        {/* Header */}
                        <header className="mb-6">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{course.level}</span>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">{course.category}</span>
                                {isEnrolling && <span className="text-xs text-slate-400 italic">Enrolling…</span>}
                                {enrollment && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">✓ Enrolled · {enrollment.progressPercentage}% complete</span>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{course.title}</h1>
                            <p className="text-slate-500 font-medium text-sm">By {course.instructorName}</p>
                        </header>

                        {/* Current lesson indicator */}
                        {currentLesson && (
                            <p className="text-slate-600 text-sm font-semibold mb-4">
                                <span className="text-blue-600">Now playing:</span> Lesson {currentLesson.order} — {currentLesson.title}
                            </p>
                        )}

                        <div className="flex flex-col xl:flex-row gap-6">

                            {/* ── Left Column (Video & Content) ─────────────────── */}
                            <div className="flex-1 min-w-0 flex flex-col gap-6">

                                {/* Video Player */}
                                <div className="bg-black rounded-2xl overflow-hidden shadow-md min-h-[240px]">
                                    {isFetchingVideo ? (
                                        <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-slate-900 text-slate-400">
                                            <div className="w-10 h-10 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
                                            <p className="text-sm font-semibold">Loading video…</p>
                                        </div>
                                    ) : playbackUrl ? (
                                        <video
                                            key={playbackUrl}
                                            ref={videoRef}
                                            controls
                                            autoPlay={false}
                                            className="w-full max-h-[560px] rounded-2xl bg-black"
                                            controlsList="nodownload"
                                            aria-label={`Video: ${currentLesson?.title}`}
                                            onError={() => {
                                                // If signed URL fails (expired?), trigger a re-fetch
                                                setPlaybackUrl(null);
                                                setIsFetchingVideo(false);
                                            }}
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
                                        /* Has a URL stored but signing failed — show direct link */
                                        <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-300">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                            </svg>
                                            <p className="font-semibold text-sm">Could not load video player.</p>
                                            <a
                                                href={currentLesson.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 underline text-xs"
                                            >
                                                Try opening video directly ↗
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-400">
                                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                            </svg>
                                            <p className="font-semibold">No video available for this lesson yet.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Course Description + Lesson Notes */}
                                <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <FileTextIcon />
                                        {currentLesson ? `Lesson ${currentLesson.order}: ${currentLesson.title}` : 'Course Overview'}
                                    </h2>
                                    <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                                        <p>{course.description}</p>
                                        {currentLesson?.notesMarkdown && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="font-bold text-slate-700 mb-2">Lesson Notes:</p>
                                                <p className="whitespace-pre-line">{currentLesson.notesMarkdown}</p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Accessibility Tags */}
                                    {course.accessibilityTags?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                                            {course.accessibilityTags.map(tag => (
                                                <span key={tag} className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                                    {tag.replace(/-/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => hasPrev && goToLesson(currentLessonIdx - 1)}
                                        disabled={!hasPrev}
                                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-xl transition-colors text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180" aria-hidden="true">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                        Previous Lesson
                                    </button>

                                    {hasNext ? (
                                        <button
                                            onClick={() => goToLesson(currentLessonIdx + 1)}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                        >
                                            Next Lesson
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <span className="flex items-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            Course Complete!
                                        </span>
                                    )}
                                </div>

                                {/* All Lessons List */}
                                <section className="mt-2">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Course Content ({lessons.length} lessons)</h2>
                                    <div className="space-y-3">
                                        {lessons.map((lesson, idx) => {
                                            const isActive = idx === currentLessonIdx;
                                            const isDone = lesson.completed;
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => goToLesson(idx)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${isActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'}`}
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        {isDone ? (
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                            </div>
                                                        ) : isActive ? (
                                                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{lesson.order}</div>
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">{lesson.order}</div>
                                                        )}
                                                        <span className={`font-semibold truncate ${isActive ? 'text-blue-700' : isDone ? 'text-slate-900' : 'text-slate-600'}`}>
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider shrink-0 ml-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
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

                            {/* ── Right Column (Transcript / Details) ────────────────── */}
                            <div className="xl:w-[380px] shrink-0 flex flex-col gap-6">

                                {/* Transcript Card */}
                                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[540px] overflow-hidden">
                                    <header className="bg-blue-600 text-white p-5 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-base leading-snug">Lesson Transcript</h2>
                                                <p className="text-[9px] font-bold text-blue-200 tracking-widest uppercase mt-0.5">Auto-generated • Accessibility</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 text-blue-200">
                                            <button className="p-2 hover:text-white transition-colors hover:bg-blue-500 rounded-lg" aria-label="Download transcript">
                                                <DownloadIcon />
                                            </button>
                                            <button className="p-2 hover:text-white transition-colors hover:bg-blue-500 rounded-lg" aria-label="Search transcript">
                                                <SearchInputIcon />
                                            </button>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
                                        {currentLesson?.transcript ? (
                                            <p className="text-slate-600 leading-relaxed">{currentLesson.transcript}</p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                <p className="font-medium text-sm">No transcript yet.</p>
                                                <p className="text-xs">A transcript will appear here once the AI processes the audio.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Course Info Summary */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <LightningIcon />
                                        Course Details
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Lessons</span>
                                            <span className="font-bold text-slate-900">{course.totalLessons}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Duration</span>
                                            <span className="font-bold text-slate-900">{course.totalDuration} min</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Level</span>
                                            <span className="font-bold text-slate-900">{course.level}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Category</span>
                                            <span className="font-bold text-slate-900">{course.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Instructor</span>
                                            <span className="font-bold text-slate-900">{course.instructorName}</span>
                                        </div>
                                    </div>
                                    {enrollment && (
                                        <div className="mt-2 pt-4 border-t border-slate-100">
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

                            </div>
                        </div>
                    </>
                ) : null}

            </div>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-slate-200 text-center px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                        <span>© 2025 EduAble</span>
                        <span className="hidden md:inline">•</span>
                        <Link href="#" className="hover:text-slate-600">Accessibility Statement</Link>
                        <span className="hidden md:inline">•</span>
                        <Link href="#" className="hover:text-slate-600">Privacy Policy</Link>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span>WCAG 2.2 AAA Compliant</span>
                    </div>
                </div>
            </footer>
        </DashboardLayout>
    );
}
