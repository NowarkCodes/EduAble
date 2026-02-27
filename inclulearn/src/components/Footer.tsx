import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer} role="contentinfo" aria-label="Site footer">
            <div className="container">
                <div className={styles.top}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <a href="/" className={styles.logo} aria-label="EduLearn - Home">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                                <rect width="28" height="28" rx="8" fill="var(--color-primary)" />
                                <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span>EduLearn</span>
                        </a>
                        <p className={styles.tagline}>
                            Accessible education for everyone. Built with WCAG 2.1 AA compliance at its core.
                        </p>
                    </div>

                    {/* Links */}
                    <nav aria-label="Platform links" className={styles.linkGroup}>
                        <h3 className={styles.linkGroupTitle}>Platform</h3>
                        <ul role="list">
                            {['Courses', 'Instructors', 'Certifications'].map((l) => (
                                <li key={l}><a href={`#${l.toLowerCase()}`} className={styles.link}>{l}</a></li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Accessibility resources" className={styles.linkGroup}>
                        <h3 className={styles.linkGroupTitle}>Accessibility</h3>
                        <ul role="list">
                            {['VPAT Report', 'Screen Readers', 'Tools'].map((l) => (
                                <li key={l}><a href="#" className={styles.link}>{l}</a></li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Company links" className={styles.linkGroup}>
                        <h3 className={styles.linkGroupTitle}>Company</h3>
                        <ul role="list">
                            {['About Us', 'Contact', 'Privacy'].map((l) => (
                                <li key={l}><a href="#" className={styles.link}>{l}</a></li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © 2024 EduLearn. All rights reserved.
                    </p>
                    <p className={styles.credit}>
                        Built with accessibility at heart — WCAG 2.1 AA Compliant
                    </p>
                </div>
            </div>
        </footer>
    );
}
