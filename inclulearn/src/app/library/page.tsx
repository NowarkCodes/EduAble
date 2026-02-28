'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, BookOpen, Volume2, FileText, Plus, Book, Crown, Telescope, Milestone } from 'lucide-react';

/* ── MOCK DATA ───────────────────────────────────────── */
const LIBRARY_ITEMS = [
    {
        id: '1',
        title: 'The Mahabharat: An Epic Tale',
        category: 'Epic',
        icon: 'book',
        tags: ['Screen Reader Optimized', 'Braille Ready'],
    },
    {
        id: '2',
        title: 'Industrial Revolution Timeline',
        category: 'History',
        icon: 'milestone',
        tags: ['Screen Reader Optimized'],
    },
    {
        id: '3',
        title: 'The Midnight Library',
        category: 'Fiction',
        icon: 'book',
        tags: ['Screen Reader Optimized', 'Braille Ready'],
    },
    {
        id: '4',
        title: 'The Odyssey: Book IX',
        category: 'Epic',
        icon: 'crown',
        tags: ['Screen Reader Optimized'],
    },
    {
        id: '5',
        title: 'Ashoka the Great: Edicts',
        category: 'History',
        icon: 'milestone',
        tags: ['Braille Ready'],
    },
    {
        id: '6',
        title: 'Foundation: The Mule',
        category: 'Fiction',
        icon: 'telescope',
        tags: ['Screen Reader Optimized'],
    }
];

const CATEGORIES = ['All Resources', 'Epic', 'History', 'Fiction', 'Science'];

export default function LibraryPage() {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All Resources');
    const [searchQuery, setSearchQuery] = useState('');

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const renderIcon = (type: string) => {
        switch (type) {
            case 'book': return <Book className="w-16 h-16 text-slate-300 mx-auto" strokeWidth={1.5} />;
            case 'milestone': return <Milestone className="w-16 h-16 text-slate-300 mx-auto" strokeWidth={1.5} />;
            case 'crown': return <Crown className="w-16 h-16 text-slate-300 mx-auto" strokeWidth={1.5} />;
            case 'telescope': return <Telescope className="w-16 h-16 text-slate-300 mx-auto" strokeWidth={1.5} />;
            default: return <BookOpen className="w-16 h-16 text-slate-300 mx-auto" strokeWidth={1.5} />;
        }
    };

    const filteredItems = LIBRARY_ITEMS.filter(item => {
        const matchesCat = activeFilter === 'All Resources' || item.category === activeFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
            <div className="relative min-h-[calc(100vh-80px)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-32">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transcript & Audio Library</h1>
                            <p className="text-sm font-medium text-slate-500 mt-2">WCAG 2.2 Compliant Learning Resources</p>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                            <button className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white">
                                <Bell size={18} />
                            </button>
                            <button className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white">
                                <FileText size={18} />
                            </button>
                        </div>
                    </header>

                    {/* Search Bar */}
                    <div className="relative mb-8 max-w-4xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for transcripts or audio stories (e.g. Mahabharat, World History)"
                            className="block w-full pl-11 pr-4 py-4 border-2 border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm font-medium transition-colors shadow-sm text-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2.5 mb-10">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === cat
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-200 flex flex-col hover:shadow-lg transition-shadow duration-300">
                                {/* Top Image Area */}
                                <div className="bg-slate-800 h-44 p-4 relative flex items-center justify-center">
                                    <span className="absolute top-4 left-4 bg-slate-900/50 backdrop-blur-md text-emerald-400 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md border border-slate-700/50">
                                        {item.category}
                                    </span>
                                    {renderIcon(item.icon)}
                                </div>

                                {/* Content Area */}
                                <div className="p-6 bg-white flex flex-col flex-1">
                                    <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-1">{item.title}</h3>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {item.tags.includes('Screen Reader Optimized') && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                <EyeIcon /> Screen Reader Optimized
                                            </span>
                                        )}
                                        {item.tags.includes('Braille Ready') && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                                                <BrailleIcon /> Braille Ready
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-auto space-y-3 pt-2">
                                        <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-colors flex items-center justify-center gap-2">
                                            <Volume2 size={16} />
                                            Listen to Audio
                                        </button>
                                        <button className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-900/20 transition-colors flex items-center justify-center gap-2">
                                            <FileText size={16} />
                                            Read Transcript
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No resources found</h3>
                                <p className="text-slate-500 text-sm">Try adjusting your filters or search query to find materials.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Request CTA */}
                <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
                    <Link
                        href="/library/request"
                        className="flex items-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-full shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 transition-all outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                        aria-label="Request a Transcript"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                        <span className="text-base font-extrabold pr-2">Request Transcript</span>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}

function EyeIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
    )
}

function BrailleIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20v.01" /><path d="M10 12v.01" /><path d="M10 4v.01" /><path d="M14 20v.01" /><path d="M14 12v.01" /><path d="M14 4v.01" /></svg>
    )
}
