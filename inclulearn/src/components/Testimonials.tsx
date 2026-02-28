import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const testimonials = [
    {
        quote: 'EduAble changed how I study. The screen reader support is flawless and makes me feel truly independent.',
        name: 'Alex Johnson',
        role: 'Computer Science Student',
        initials: 'AJ',
        avatarBg: 'bg-blue-100 text-blue-700',
        accentColor: 'border-t-blue-400',
    },
    {
        quote: 'The automated captions and transcripts make every lecture accessible for me. I don\'t miss a single detail now.',
        name: 'Maria Garcia',
        role: 'History Major',
        initials: 'MG',
        avatarBg: 'bg-pink-100 text-pink-700',
        accentColor: 'border-t-pink-400',
    },
    {
        quote: 'The high-contrast modes and font adjustments are a lifesaver for my visual fatigue. Best learning tool ever.',
        name: 'Jordan Lee',
        role: 'Graphic Design Student',
        initials: 'JL',
        avatarBg: 'bg-emerald-100 text-emerald-700',
        accentColor: 'border-t-emerald-400',
    },
];

export default function Testimonials() {
    return (
        <section className="py-16 sm:py-24 bg-background" id="testimonials" aria-labelledby="testimonials-heading">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <header className="text-center mb-12 lg:mb-16">
                    <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase mb-3">Student Stories</p>
                    <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-md mx-auto leading-tight text-foreground">
                        Students Who Found Their Voice
                    </h2>
                </header>

                <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 list-none" role="list" aria-label="Student testimonials">
                    {testimonials.map((t, i) => (
                        <li key={t.name}>
                            <article aria-label={`Testimonial from ${t.name}`}>
                                <Card className={`h-full border-t-4 ${t.accentColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card border-border`}>
                                    <CardContent className="p-6 flex flex-col gap-5 h-full">
                                        {/* Quote mark */}
                                        <svg width="28" height="22" viewBox="0 0 32 24" fill="none" aria-hidden="true">
                                            <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.4 3.6 7.6 6 6.4 10H12V24H0zm20 0V14.4C20 6.4 24.8 1.6 34.4 0L36 2.4C30.4 3.6 27.6 6 26.4 10H32V24H20z" fill="currentColor" className="text-primary/15" />
                                        </svg>

                                        <blockquote className="flex-1 text-sm sm:text-base text-foreground leading-relaxed">
                                            <p>&ldquo;{t.quote}&rdquo;</p>
                                        </blockquote>

                                        <Separator className="bg-border" />

                                        <footer className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${t.avatarBg}`} aria-hidden="true">
                                                {t.initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground leading-none mb-1">{t.name}</p>
                                                <p className="text-xs text-muted-foreground">{t.role}</p>
                                            </div>
                                        </footer>
                                    </CardContent>
                                </Card>
                            </article>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
