'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { profileApi } from '@/lib/api';
import Link from 'next/link';

type Profile = {
    preferredLanguage: string;
    disabilityType: string[];
    accessibilityPreferences: Record<string, boolean | string>;
};

const DISABILITY_LABELS: Record<string, string> = {
    blind_low_vision: 'Blind / Low Vision',
    deaf_hard_of_hearing: 'Deaf / Hard of Hearing',
    cognitive_disability: 'Cognitive Disability',
    motor_disability: 'Motor Disability',
    multiple_disabilities: 'Multiple Disabilities',
};

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        profileApi
            .get(user.id)
            .then((data: unknown) => {
                const d = data as { profile: Profile };
                setProfile(d.profile);
            })
            .catch(() => setProfile(null))
            .finally(() => setLoading(false));
    }, [user, router]);

    const handleLogout = () => {
        // Clear cookie too
        document.cookie = 'edulearn_token=; path=/; max-age=0';
        logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" aria-busy="true" aria-label="Loading dashboard">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-muted-foreground text-sm font-medium">Loading your profile…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm" role="banner">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 text-primary font-extrabold text-xl" aria-label="EduLearn — Home">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        EduLearn
                    </a>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            Welcome, <strong className="text-foreground">{user?.name}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="h-9 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Sign out of EduLearn"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* Welcome banner */}
                <div className="bg-gradient-to-br from-primary to-sky-500 rounded-2xl p-6 sm:p-8 text-white mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base">
                        Your accessible learning dashboard is ready.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    {/* Accessibility Profile */}
                    <section className="bg-card border border-border rounded-2xl p-6" aria-labelledby="profile-heading">
                        <h2 id="profile-heading" className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
                            Accessibility Profile
                        </h2>

                        {profile ? (
                            <dl className="flex flex-col gap-3 text-sm">
                                <div>
                                    <dt className="text-muted-foreground font-medium mb-1">Language</dt>
                                    <dd className="text-foreground font-semibold">{profile.preferredLanguage}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground font-medium mb-1">Disabilities</dt>
                                    <dd>
                                        {profile.disabilityType.length === 0 ? (
                                            <span className="text-muted-foreground text-xs">None specified</span>
                                        ) : (
                                            <ul className="flex flex-wrap gap-2 list-none">
                                                {profile.disabilityType.map((d) => (
                                                    <li key={d} className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                                                        {DISABILITY_LABELS[d] || d}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground mb-3">No profile set up yet.</p>
                                <Link
                                    href="/onboarding"
                                    className="inline-flex h-9 px-5 items-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label="Complete your accessibility onboarding"
                                >
                                    Complete Setup →
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Quick Stats */}
                    <section className="bg-card border border-border rounded-2xl p-6" aria-labelledby="stats-heading">
                        <h2 id="stats-heading" className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
                            Your Stats
                        </h2>
                        <ul className="flex flex-col gap-3 list-none">
                            {[
                                { label: 'Courses Enrolled', value: '0', icon: '📚' },
                                { label: 'Lessons Completed', value: '0', icon: '✅' },
                                { label: 'Certificates Earned', value: '0', icon: '🏆' },
                            ].map((s) => (
                                <li key={s.label} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                                    <span className="text-xl" aria-hidden="true">{s.icon}</span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                        <p className="text-lg font-extrabold text-foreground">{s.value}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* CTA */}
                <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center">
                    <h2 className="text-lg font-bold text-foreground mb-2">Ready to start learning?</h2>
                    <p className="text-sm text-muted-foreground mb-4">Explore courses tailored to your accessibility needs.</p>
                    <Link
                        href="/#features"
                        className="inline-flex h-11 px-8 items-center rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label="Browse our accessible course catalog"
                    >
                        Browse Courses
                    </Link>
                </div>
            </main>
        </div>
    );
}
