import { Button } from '@/components/ui/button';

export default function CTA() {
    return (
        <section className="py-16 sm:py-24 bg-muted/30" id="why-us" aria-labelledby="cta-heading">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-700 to-sky-500 px-8 py-16 sm:px-16 sm:py-20 text-center flex flex-col items-center gap-8">
                    {/* Decorative blobs */}
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-10 left-[10%] w-72 h-72 rounded-full bg-white/8 blur-3xl" />
                        <div className="absolute -bottom-10 right-[5%] w-64 h-64 rounded-full bg-sky-300/10 blur-3xl" />
                    </div>

                    {/* Decorative dots grid */}
                    <div aria-hidden="true" className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px'
                    }} />

                    <div className="relative z-10 max-w-2xl">
                        <h2 id="cta-heading" className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
                            Ready to Include<br className="hidden sm:block" /> Every Student?
                        </h2>
                        <p className="text-base sm:text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
                            Join 50,000+ students and educators building the future of accessible, inclusive education.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/92 hover:-translate-y-0.5 transition-all shadow-2xl shadow-black/20 text-base font-bold px-10 py-6 rounded-full"
                            asChild
                        >
                            <a href="#get-started" aria-label="Get started with EduLearn for free — no credit card required">
                                Get Started Free
                            </a>
                        </Button>
                        <p className="text-sm text-white/65">No credit card required · Cancel anytime</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
