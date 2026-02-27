export default function HowItWorks() {
    const steps = [
        {
            num: "01",
            title: "Create Your Profile",
            desc: "Sign up and tell us about your learning preferences, including any accessibility needs (like screen reader support, high contrast, or dyslexia-friendly fonts).",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            num: "02",
            title: "Adaptive Learning Setup",
            desc: "Our platform instantly adapts the entire interface to your saved profile, ensuring every lesson, video, and quiz is perfectly tailored to how you learn best.",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            num: "03",
            title: "Master New Skills",
            desc: "Explore hundreds of interactive courses. Read AI-generated simplified summaries, watch captioned videos, or use our text-to-speech engine to study your way.",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        }
    ];

    return (
        <section id="how-it-works" className="py-20 lg:py-28 bg-white relative overflow-hidden" aria-labelledby="how-it-works-heading">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Seamless learning in <span className="text-blue-600">3 simple steps</span>
                    </h2>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        We designed EduAble so nothing gets in the way of your education.
                        No complex setup, just an environment that adapts to you.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting line (desktop only) */}
                    <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100" aria-hidden="true" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 relative">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 mb-8 bg-slate-50 rounded-2xl border-2 border-slate-100 flex flex-col items-center justify-center relative z-10 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors shadow-sm">
                                    <span className="text-2xl font-black text-slate-200 absolute -top-4 -right-2 transform rotate-12 group-hover:text-blue-200 transition-colors pointer-events-none select-none">
                                        {step.num}
                                    </span>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                                <p className="text-base text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <a href="/register" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 shadow-lg shadow-slate-900/20">
                        Start Your Journey Today
                    </a>
                </div>
            </div>
        </section>
    );
}
