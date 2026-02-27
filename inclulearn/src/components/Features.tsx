import styles from './Features.module.css';

const features = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
        ),
        title: 'Screen Reader Ready',
        description: 'Full ARIA support for all industry-standard screen readers like JAWS and NVDA.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 8h2v6H7zm4 2h2v4h-2zm4-3h2v7h-2z" fill="currentColor" />
            </svg>
        ),
        title: 'Keyboard Navigation',
        description: 'Entire platform is usable using only a keyboard with visible, clear focus indicators.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 14l2-2 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="3" y="10" fontSize="5" fill="currentColor" fontWeight="bold">CC</text>
            </svg>
        ),
        title: 'Auto-Captions',
        description: 'AI-powered real-time captions for all video lectures and live sessions.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9h.01M15 9h.01M8 13s1 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: 'Cognitive Mode',
        description: 'A simplified interface designed to reduce distractions and improve focus for all learners.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        ),
        title: 'High Contrast',
        description: 'WCAG AAA compliant color ratios with customizable theme settings for visual comfort.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        title: 'Responsive',
        description: 'Seamless experience across mobile, tablet, and desktop assistive devices.',
    },
];

const audiences = [
    {
        color: '#eff6ff',
        borderColor: '#bfdbfe',
        iconColor: '#1d4ed8',
        icon: '👁',
        title: 'Blind & Low Vision',
        items: ['Screen reader optimized navigation', 'Braille display compatibility', 'Scalable text up to 400%'],
    },
    {
        color: '#fff7ed',
        borderColor: '#fed7aa',
        iconColor: '#ea580c',
        icon: '🔇',
        title: 'Hard of Hearing',
        items: ['Real-time captioning', 'Visual notifications for audio alerts', 'Transcripts for all multimedia'],
    },
    {
        color: '#f0fdf4',
        borderColor: '#bbf7d0',
        iconColor: '#16a34a',
        icon: '🧠',
        title: 'Cognitive Disabilities',
        items: ['Reduced motion & distraction-free mode', 'Plain language content options', 'Extended time for assessments'],
    },
    {
        color: '#fdf4ff',
        borderColor: '#e9d5ff',
        iconColor: '#9333ea',
        icon: '♿',
        title: 'Motor Disabilities',
        items: ['Switch-access compatibility', 'Voice control optimization', 'Large interactive touch targets'],
    },
];

export default function Features() {
    return (
        <>
            {/* ---- Built for Every Learner ---- */}
            <section className={`section ${styles.featuresSection}`} id="features" aria-labelledby="features-heading">
                <div className="container">
                    <header className={styles.sectionHeader}>
                        <p className={styles.overline}>Built for Every Learner</p>
                        <h2 id="features-heading" className={styles.sectionTitle}>
                            Accessible technology designed to remove barriers and empower students worldwide.
                        </h2>
                    </header>

                    <ul className={styles.featuresGrid} role="list" aria-label="Platform accessibility features">
                        {features.map((feature) => (
                            <li key={feature.title} className={`card ${styles.featureCard}`}>
                                <div className={styles.featureIcon} aria-hidden="true">
                                    {feature.icon}
                                </div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---- Designed For Everyone ---- */}
            <section className={`section ${styles.audienceSection}`} id="accessibility" aria-labelledby="audience-heading">
                <div className="container">
                    <header className={styles.sectionHeader}>
                        <p className={styles.overline}>Designed For Everyone</p>
                        <h2 id="audience-heading" className={styles.sectionTitle}>
                            Tailored support for diverse learning requirements.
                        </h2>
                    </header>

                    <ul className={styles.audienceGrid} role="list" aria-label="Supported learner types">
                        {audiences.map((a) => (
                            <li
                                key={a.title}
                                className={styles.audienceCard}
                                style={{
                                    '--card-bg': a.color,
                                    '--card-border': a.borderColor,
                                    '--card-icon': a.iconColor,
                                } as React.CSSProperties}
                            >
                                <div className={styles.audienceHeader}>
                                    <span className={styles.audienceEmoji} aria-hidden="true">{a.icon}</span>
                                    <h3 className={styles.audienceTitle}>{a.title}</h3>
                                </div>
                                <ul className={styles.audienceItems} role="list">
                                    {a.items.map((item) => (
                                        <li key={item} className={styles.audienceItem}>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                                <circle cx="7" cy="7" r="7" fill="var(--card-icon)" opacity="0.15" />
                                                <path d="M4 7l2 2 4-4" stroke="var(--card-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
