import { Button } from '@/components/ui/button';

export default function Hero() {
    return (
        <section
            className="hero-section relative pt-20 pb-0 overflow-hidden"
            style={{
                background: `linear-gradient(135deg, var(--hero-from) 0%, var(--hero-via) 55%, var(--hero-to) 100%)`,
            }}
            id="hero"
            aria-labelledby="hero-heading"
        >
            {/* Ambient blobs (decorative) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-2xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pb-16 lg:pb-24">

                {/* ---- Left: Text Content ---- */}
                <div className="animate-fade-in-up text-center lg:text-left">

                    <h1
                        id="hero-heading"
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 text-foreground"
                    >
                        Learning Without
                        <span className="text-primary relative whitespace-nowrap">
                            {' '}Barriers
                            <span
                                aria-hidden="true"
                                className="absolute left-0 -bottom-1 w-full h-[5px] rounded-full bg-gradient-to-r from-primary to-sky-400"
                            />
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Accessible education for every student. Adaptive tools that remove barriers
                        and make learning inclusive, empowering, and effective for all.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start mb-10">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
                            asChild
                        >
                            <a href="#get-started" id="get-started" aria-label="Start learning free — no credit card required">
                                Start Learning Free →
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto rounded-full px-8 text-base font-semibold border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                            asChild
                        >
                            <a href="#how-it-works" aria-label="Watch a demo of how EduAble works">
                                See How It Works
                            </a>
                        </Button>
                    </div>

                    {/* Trust stats */}
                    <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 flex-wrap" aria-label="Platform statistics">
                        {[
                            { num: '50K+', label: 'Students' },
                            { num: '500+', label: 'Courses' },
                            { num: '98%', label: 'Satisfaction' },
                        ].map((s, i) => (
                            <div key={s.label} className="flex items-center gap-4 sm:gap-8">
                                {i > 0 && <div aria-hidden="true" className="w-px h-10 bg-border" />}
                                <div className="flex flex-col">
                                    <span className="text-2xl font-extrabold text-primary leading-none">{s.num}</span>
                                    <span className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---- Right: Stats Card ---- */}
                <div className="relative animate-fade-in-up [animation-delay:200ms] hidden sm:block">
                    {/* Floating badge — top */}
                    <div
                        aria-hidden="true"
                        className="absolute -top-5 right-6 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-lg animate-float z-10"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Screen Reader Ready
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-2xl p-5 lg:p-6">
                        <ul className="flex flex-col gap-3 list-none" aria-label="Accessibility impact statistics">
                            {[
                                { bg: 'bg-blue-100', numColor: 'text-blue-700', iconStroke: '#1d4ed8', value: '15%', desc: 'Students with disabilities', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="#1d4ed8" strokeWidth="2" /></svg> },
                                { bg: 'bg-red-100', numColor: 'text-red-600', iconStroke: '#dc2626', value: '90%', desc: 'Platforms are inaccessible', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" /><path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" /></svg> },
                                { bg: 'bg-green-100', numColor: 'text-green-700', iconStroke: '#16a34a', value: '100%', desc: 'Students we include', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" /><polyline points="22 4 12 14.01 9 11.01" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
                            ].map((s) => (
                                <li key={s.desc} className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border">
                                    <span className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                                        {s.icon}
                                    </span>
                                    <div>
                                        <p className={`text-xl font-extrabold leading-none mb-0.5 ${s.numColor}`}>{s.value}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{s.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Floating badge — bottom */}
                    <div
                        aria-hidden="true"
                        className="absolute -bottom-4 -left-2 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm font-semibold text-primary shadow-lg animate-float [animation-delay:1.5s] z-10"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Keyboard Friendly
                    </div>
                </div>
            </div>

            {/* Wave divider that blends into the next section's bg-background */}
            <div aria-hidden="true" className="relative leading-none z-10">
                <svg
                    viewBox="0 0 1440 80"
                    fill="none"
                    preserveAspectRatio="none"
                    className="w-full h-16 sm:h-20"
                >
                    <path
                        d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,80 L0,80 Z"
                        className="fill-background"
                    />
                </svg>
            </div>
        </section>
    );
}
