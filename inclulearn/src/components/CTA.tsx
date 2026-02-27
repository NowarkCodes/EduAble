import { Button } from '@/components/ui/button';

export default function CTA() {
    return (
        <section className="py-12 sm:py-20 bg-gradient-to-b from-slate-50 to-blue-50/50" id="why-us">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Content */}
                <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                        Ready to include every student?
                    </h2>

                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto">
                        Join 50,000+ students and educators creating accessible, inclusive learning experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button
                            size="lg"
                            className="min-w-[200px] px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-px transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl"
                            asChild
                        >
                            <a href="#get-started" className="group">
                                Get Started Free
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </a>
                        </Button>

                        <p className="text-sm text-gray-500 font-medium sm:text-base">
                            No credit card required • Cancel anytime
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
