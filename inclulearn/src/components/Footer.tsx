const footerLinks = {
    Platform: ['Courses', 'Instructors', 'Certifications', 'Live Sessions'],
    Accessibility: ['VPAT Report', 'Screen Readers', 'Keyboard Docs', 'Tools & Plugins'],
    Company: ['About Us', 'Blog', 'Careers', 'Contact'],
};

export default function Footer() {
    return (
        <footer
            className="bg-foreground text-background/70 pt-14 pb-8"
            role="contentinfo"
            aria-label="Site footer"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 font-extrabold text-xl tracking-tight mb-4 text-background hover:opacity-80 transition-opacity"
                            aria-label="EduLearn — Home"
                        >
                            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                                </svg>
                            </div>
                            EduLearn
                        </a>
                        <p className="text-sm text-background/50 leading-relaxed max-w-[240px]">
                            Accessible education for everyone. Built with WCAG 2.1 AA compliance from the ground up.
                        </p>

                        {/* Compliance badges */}
                        <div className="flex gap-2 mt-5 flex-wrap">
                            {['WCAG 2.1 AA', 'Section 508', 'ADA'].map((b) => (
                                <span key={b} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-background/20 text-background/50 uppercase tracking-wide">
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <nav key={group} aria-label={`${group} links`}>
                            <h3 className="text-background text-xs font-bold uppercase tracking-[0.12em] mb-4">
                                {group}
                            </h3>
                            <ul className="flex flex-col gap-2.5 list-none" role="list">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-background/45 hover:text-background transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-background/35">© 2024 EduLearn. All rights reserved.</p>
                    <p className="text-xs text-background/30">Built with accessibility at heart — WCAG 2.1 AA Compliant</p>
                </div>
            </div>
        </footer>
    );
}
