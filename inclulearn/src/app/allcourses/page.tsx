'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Dropdown from '@/components/Dropdown';

interface ExploreCourse {
    id: string;
    title: string;
    instructor: string;
    category: string;
    level: string;
    progress: number;
    started: boolean;
    tags: string[];
    image: string;
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
    );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function FlashIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    );
}

function BadgeTag({ tag }: { tag: string }) {
    if (tag.toLowerCase().includes('screen reader')) {
        return (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" /><path d="M19 13v-2" /><path d="M5 13v-2" /></svg>
                {tag}
            </span>
        );
    }
    if (tag.toLowerCase().includes('captions')) {
        return (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" /><path d="M7 15h3" /><path d="M13 15h4" /></svg>
                {tag}
            </span>
        );
    }
    if (tag.toLowerCase().includes('keyboard')) {
        return (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><path d="M6 8h.01" /><path d="M10 8h.01" /><path d="M14 8h.01" /><path d="M18 8h.01" /><path d="M8 12h8" /></svg>
                {tag}
            </span>
        );
    }
    return (
        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider border border-slate-200">
            {tag}
        </span>
    );
}

function CourseCard({ course }: { course: ExploreCourse }) {
    return (
        <article className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-500">
            {/* Image */}
            <div className="relative h-40 sm:h-44 md:h-48 w-full bg-slate-100 shrink-0">
                <Image src={course.image} alt="" fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-blue-700 flex items-center gap-1.5 shadow-sm">
                    <FlashIcon />
                    {course.level}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    {course.tags.map(t => <BadgeTag key={t} tag={t} />)}
                </div>

                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                    <Link href={`/courses/${course.id}`} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {course.title}
                    </Link>
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">Instructor: {course.instructor}</p>

                <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100">
                    {course.started ? (
                        <div className="mb-3 sm:mb-4">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                                <span className="text-slate-700">Course Progress</span>
                                <span className="text-blue-700">{course.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-xs font-bold mb-3 sm:mb-4">
                            <span className="text-slate-400">Not Started</span>
                            <span className="text-slate-400">0%</span>
                        </div>
                    )}

                    <Link
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors relative z-10 text-sm"
                    >
                        Start Course
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}



export default function ExploreCoursesPage() {
    const { user, token } = useAuth();
    const [courses, setCourses] = useState<ExploreCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [difficultyFilter, setDifficultyFilter] = useState('Difficulty');
    const [languageFilter, setLanguageFilter] = useState('Language');
    const [durationFilter, setDurationFilter] = useState('Duration');
    const [formatFilter, setFormatFilter] = useState('Format');
    const [accessibilityFilter, setAccessibilityFilter] = useState('Accessibility');

    const initials = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const fetchExplore = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/courses/explore', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses ?? []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchExplore();
        else setLoading(false);
    }, [token, fetchExplore]);

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">

                {/* ── Header ── */}
                <div className="max-w-3xl mb-6 sm:mb-8 md:mb-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3 md:mb-4">
                        Explore Courses
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                        High-quality AI training materials designed with accessibility at the core.
                        Learn Prompt Engineering, LLM Ethics, and more.
                    </p>
                </div>

                {/* ── Filters Row ── */}
                <div className="mb-6 sm:mb-8 space-y-3">
                    {/* Search + filter toggle row */}
                    <div className="flex gap-2 sm:gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search courses…"
                                className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm"
                            />
                        </div>

                        {/* Selects — visible on md+, hidden on mobile (shown in collapsed panel) */}
                        <div className="hidden md:flex gap-3">
                            <Dropdown value={categoryFilter} onChange={setCategoryFilter} options={['All Categories', 'AI Basics', 'Prompt Eng', 'Ethics']} className="w-40" />
                            <Dropdown value={difficultyFilter} onChange={setDifficultyFilter} options={['Difficulty', 'Beginner', 'Intermediate', 'Advanced']} className="w-36" />
                        </div>

                        {/* More Filters button — always visible */}
                        <button
                            onClick={() => setFiltersOpen(prev => !prev)}
                            aria-expanded={filtersOpen}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-sm border transition-colors shadow-sm shrink-0 ${filtersOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}
                        >
                            <FilterIcon className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Collapsible filter panel — selects on mobile, extra filters on md+ */}
                    {filtersOpen && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {/* Always show on mobile; hidden on md+ (already in row above) */}
                            <Dropdown value={categoryFilter} onChange={setCategoryFilter} options={['All Categories', 'AI Basics', 'Prompt Eng', 'Ethics']} className="md:hidden" />
                            <Dropdown value={difficultyFilter} onChange={setDifficultyFilter} options={['Difficulty', 'Beginner', 'Intermediate', 'Advanced']} className="md:hidden" />

                            {/* Extra filters always in panel */}
                            <Dropdown value={languageFilter} onChange={setLanguageFilter} options={['Language', 'English', 'Hindi', 'Spanish']} />
                            <Dropdown value={durationFilter} onChange={setDurationFilter} options={['Duration', 'Under 2h', '2–5h', '5h+']} />
                            <Dropdown value={formatFilter} onChange={setFormatFilter} options={['Format', 'Video', 'Text', 'Interactive']} />
                            <Dropdown value={accessibilityFilter} onChange={setAccessibilityFilter} options={['Accessibility', 'Captions', 'Screen Reader', 'Sign Language']} />
                        </div>
                    )}
                </div>

                {/* ── Course Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-14 md:mb-16">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-80 sm:h-96" />
                        ))
                        : courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    }
                </div>

                {/* ── Learning Your Way ── */}
                <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border border-slate-200">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 shrink-0">
                            <circle cx="12" cy="4" r="2" />
                            <path d="M15 22v-6h3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-6.21A3.15 3.15 0 0 0 9 11v8.86A2.14 2.14 0 0 0 11.14 22M5 16h3v6" />
                        </svg>
                        Learning Your Way
                    </h2>

                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        {[
                            {
                                title: 'Audio Descriptions',
                                desc: 'Every visual lesson comes with high-quality audio narration.',
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Dynamic Text',
                                desc: 'Full control over contrast, font sizing, and spacing.',
                                icon: <span className="font-serif font-bold text-blue-600 text-lg leading-none">T°</span>,
                            },
                            {
                                title: 'Sign Language',
                                desc: 'ASL and BSL interpretation available for key lectures.',
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Keyboard First',
                                desc: '100% functionality without a mouse or touch.',
                                icon: (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                                        <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
                                    </svg>
                                ),
                            },
                        ].map(feature => (
                            <div key={feature.title} className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 sm:gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    {feature.icon}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{feature.title}</h4>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}