import { Card, CardContent } from '@/components/ui/card';

const features = [
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Screen Reader Ready',
        description: 'Full ARIA support for all industry-standard screen readers including JAWS, NVDA, and VoiceOver.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Keyboard Navigation',
        description: 'Every feature accessible via keyboard with visible focus indicators and logical tab order.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 14l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
        title: 'Auto-Captions',
        description: 'AI-powered real-time captions and downloadable transcripts for all video content.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M9 9h.01M15 9h.01M8 13s1 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Cognitive Mode',
        description: 'Distraction-free interface with simplified layouts, reduced motion, and extended time options.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'High Contrast',
        description: 'WCAG AAA compliant color ratios with one-click theme toggle for visual comfort.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Fully Responsive',
        description: 'Perfect experience on mobile, tablet, and desktop with assistive device compatibility.',
    },
];

const audiences = [
    {
        gradient: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200/80',
        titleColor: 'text-blue-700',
        iconBg: 'bg-blue-100',
        icon: '👁️',
        title: 'Blind & Low Vision',
        items: ['Screen reader optimized navigation', 'Braille display compatibility', 'Scalable text up to 400%'],
    },
    {
        gradient: 'from-orange-50 to-amber-50',
        border: 'border-orange-200/80',
        titleColor: 'text-orange-700',
        iconBg: 'bg-orange-100',
        icon: '🔇',
        title: 'Hard of Hearing',
        items: ['Real-time captioning', 'Visual notifications for audio alerts', 'Transcripts for all multimedia content'],
    },
    {
        gradient: 'from-emerald-50 to-green-50',
        border: 'border-emerald-200/80',
        titleColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        icon: '🧠',
        title: 'Cognitive Disabilities',
        items: ['Reduced motion & distraction-free mode', 'Plain language content options', 'Extended time for assessments'],
    },
    {
        gradient: 'from-purple-50 to-violet-50',
        border: 'border-purple-200/80',
        titleColor: 'text-purple-700',
        iconBg: 'bg-purple-100',
        icon: '♿',
        title: 'Motor Disabilities',
        items: ['Switch-access compatibility', 'Voice control optimization', 'Large interactive touch targets'],
    },
];

function SectionHeader({ overline, title, id }: { overline: string; title: string; id: string }) {
    return (
        <header className="text-center mb-12 lg:mb-16">
            <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-3">{overline}</p>
            <h2 id={id} className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight text-foreground">
                {title}
            </h2>
        </header>
    );
}

export default function Features() {
    return (
        <>
            {/* ---- Platform Features ---- */}
            <section className="py-16 sm:py-24 bg-background" id="features" aria-labelledby="features-heading">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <SectionHeader
                        overline="Built for Every Learner"
                        title="Accessible technology designed to remove barriers and empower students worldwide."
                        id="features-heading"
                    />
                    <ul
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 list-none"
                        role="list"
                        aria-label="Platform accessibility features"
                    >
                        {features.map((f) => (
                            <li key={f.title}>
                                <Card className="group h-full border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
                                    <CardContent className="p-6 flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300" aria-hidden="true">
                                            {f.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-foreground mb-1.5">{f.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---- Designed For Everyone ---- */}
            <section className="py-16 sm:py-24 bg-muted/30" id="accessibility" aria-labelledby="audience-heading">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <SectionHeader
                        overline="Designed For Everyone"
                        title="Tailored support for every type of learner."
                        id="audience-heading"
                    />
                    <ul
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 list-none"
                        role="list"
                        aria-label="Supported learner types"
                    >
                        {audiences.map((a) => (
                            <li key={a.title}>
                                <Card className={`h-full border ${a.border} bg-gradient-to-br ${a.gradient} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center text-xl`} aria-hidden="true">{a.icon}</span>
                                            <h3 className={`text-base font-bold ${a.titleColor}`}>{a.title}</h3>
                                        </div>
                                        <ul className="flex flex-col gap-2 list-none" role="list">
                                            {a.items.map((item) => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-primary" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                        <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.12" />
                                                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
