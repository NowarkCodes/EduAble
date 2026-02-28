import Link from 'next/link';
import Logo from '@/components/Logo';

const footerLinks = {
    Platform: ['Courses', 'Instructors', 'Certifications', 'Live Sessions'],
    Accessibility: ['VPAT Report', 'Screen Readers', 'Keyboard Docs', 'Tools & Plugins'],
    Company: ['About Us', 'Blog', 'Careers', 'Contact'],
};

export default function Footer() {
    return (
        <footer
            className="bg-gradient-to-t from-foreground/95 to-foreground pt-12 sm:pt-16 pb-8 sm:pb-12"
            role="contentinfo"
            aria-label="Site footer"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main content grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr_1fr] xl:grid-cols-[3fr_1fr_1fr_1fr] gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12 lg:mb-16">

                    {/* Brand & Description */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 sm:gap-4 font-black text-lg sm:text-xl lg:text-2xl tracking-tight 
                                     mb-4 sm:mb-6 text-background hover:opacity-90 transition-all duration-300 group"
                            aria-label="EduAble — Home"
                        >
                            <Logo className="w-10 h-10 lg:w-12 lg:h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                            <span className="leading-tight">EduAble</span>
                        </Link>

                        <p className="text-sm sm:text-base text-background/80 leading-relaxed max-w-md lg:max-w-none mb-6 sm:mb-8">
                            Accessible education for everyone. Built with WCAG 2.1 AA compliance from the ground up.
                        </p>

                        {/* Compliance badges */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {['WCAG 2.1 AA', 'Section 508', 'ADA'].map((b) => (
                                <span
                                    key={b}
                                    className="text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full 
                                             border-2 border-background/30 bg-background/20 backdrop-blur-sm text-background/90 
                                             uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                >
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([group, links], i) => (
                        <nav
                            key={group}
                            className="col-span-1 sm:col-span-1"
                            aria-label={`${group} links`}
                        >
                            <h3 className="text-background text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-4 sm:mb-6 pb-2 border-b border-background/20">
                                {group}
                            </h3>
                            <ul className="flex flex-col gap-2 sm:gap-3 lg:gap-4 list-none space-y-1" role="list">
                                {links.map((link) => (
                                    <li key={link}>
                                        <Link
                                            href="#"
                                            className="group inline-flex items-center gap-2 text-sm sm:text-base text-background/70 
                                                     hover:text-background hover:translate-x-1 transition-all duration-200 
                                                     py-1.5 rounded-md hover:bg-background/30 px-2"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                {link}
                                            </span>
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-background/20 pt-6 sm:pt-8 lg:pt-10 flex flex-col sm:flex-row 
                               lg:justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-background/60 font-medium order-2 sm:order-1">
                        © 2026 EduAble. All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-6 sm:gap-8 lg:gap-10 justify-center sm:justify-start order-1 sm:order-2">
                        <p className="text-xs sm:text-sm text-background/70 font-semibold bg-background/20 
                                     px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm border border-background/30 
                                     hover:bg-background/30 transition-all duration-200">
                            WCAG 2.1 AA Compliant
                        </p>
                        <div className="hidden sm:flex items-center gap-1 text-xs text-background/50">
                            <span>•</span>
                            <span>Made with ❤️ for accessibility</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
