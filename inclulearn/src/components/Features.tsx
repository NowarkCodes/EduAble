import { Card, CardContent } from '@/components/ui/card';

const features = [
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Screen Reader Ready',
        description: 'Full ARIA support for JAWS, NVDA, and VoiceOver.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Keyboard Navigation',
        description: 'Every feature accessible via keyboard with visible focus indicators.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 14l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
        title: 'Auto-Captions',
        description: 'AI-powered real-time captions and transcripts for all videos.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M9 9h.01M15 9h.01M8 13s1 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Cognitive Mode',
        description: 'Distraction-free interface with reduced motion options.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'High Contrast',
        description: 'WCAG AAA compliant colors with one-click theme toggle.',
    },
    {
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
        title: 'Fully Responsive',
        description: 'Perfect on mobile, tablet, and desktop with assistive compatibility.',
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
        items: ['Screen reader navigation', 'Braille display support', '400% text scaling'],
    },
    {
        gradient: 'from-orange-50 to-amber-50',
        border: 'border-orange-200/80',
        titleColor: 'text-orange-700',
        iconBg: 'bg-orange-100',
        icon: '🔇',
        title: 'Hard of Hearing',
        items: ['Real-time captions', 'Visual audio alerts', 'Full transcripts'],
    },
    {
        gradient: 'from-emerald-50 to-green-50',
        border: 'border-emerald-200/80',
        titleColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        icon: '🧠',
        title: 'Cognitive Disabilities',
        items: ['Reduced motion', 'Plain language', 'Extended time limits'],
    },
    {
        gradient: 'from-purple-50 to-violet-50',
        border: 'border-purple-200/80',
        titleColor: 'text-purple-700',
        iconBg: 'bg-purple-100',
        icon: '♿',
        title: 'Motor Disabilities',
        items: ['Switch access', 'Voice control', 'Large touch targets'],
    },
];

function SectionHeader({ overline, title, id }: { overline: string; title: string; id: string }) {
    return (
        <header className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <p className="text-primary text-xs sm:text-sm font-bold tracking-[0.15em] uppercase mb-3 px-2">{overline}</p>
            <h2 id={id} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight text-foreground px-4 sm:px-0">
                {title}
            </h2>
        </header>
    );
}

export default function Features() {
    return (
        <>
            {/* ---- Platform Features ---- */}
            <section className="py-12 sm:py-16 lg:py-24 xl:py-28 bg-background" id="features" aria-labelledby="features-heading">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        overline="Built for Every Learner"
                        title="Accessible technology that removes barriers and empowers students worldwide."
                        id="features-heading"
                    />
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 list-none px-2 sm:px-0" role="list" aria-label="Platform accessibility features">
                        {features.map((f, i) => (
                            <li key={f.title} className="w-full">
                                <Card className="group h-full border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-500 ease-out bg-card w-full mx-auto max-w-sm">
                                    <CardContent className="p-6 sm:p-8 flex flex-col gap-4 h-full">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center 
                                                      group-hover:bg-primary group-hover:text-primary-foreground 
                                                      transition-all duration-300 shrink-0 mx-auto sm:mx-0" aria-hidden="true">
                                            {f.icon}
                                        </div>
                                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 justify-center sm:justify-start">
                                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---- Designed For Everyone ---- */}
            <section className="py-12 sm:py-16 lg:py-24 xl:py-28 bg-gradient-to-b from-muted/20 to-background/50" id="accessibility" aria-labelledby="audience-heading">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader
                        overline="Designed For Everyone"
                        title="Tailored support for every type of learner."
                        id="audience-heading"
                    />
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 list-none px-2 sm:px-0" role="list" aria-label="Supported learner types">
                        {audiences.map((a, i) => (
                            <li key={a.title} className="w-full">
                                <Card className={`h-full border-2 ${a.border} bg-gradient-to-br ${a.gradient} 
                                               hover:shadow-2xl hover:shadow-[${i === 0 ? 'blue' : i === 1 ? 'orange' : i === 2 ? 'emerald' : 'purple'}-500]/20 
                                               hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 group`}>
                                    <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                            <span className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${a.iconBg} flex items-center justify-center 
                                                           text-2xl sm:text-3xl shrink-0 shadow-lg`} aria-hidden="true">
                                                {a.icon}
                                            </span>
                                            <h3 className={`text-base sm:text-lg md:text-xl font-bold ${a.titleColor} leading-tight`}>{a.title}</h3>
                                        </div>
                                        <ul className="flex flex-col gap-2 sm:gap-3 list-none flex-1" role="list">
                                            {a.items.map((item, j) => (
                                                <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 text-primary flex-shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                        <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15" />
                                                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span className="leading-relaxed">{item}</span>
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
