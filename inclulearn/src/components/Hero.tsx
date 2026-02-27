import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero} id="hero" aria-labelledby="hero-heading">
            <div className={`container ${styles.inner}`}>
                {/* Text content */}
                <div className={styles.content}>
                    <div className={styles.badge} aria-label="Accessibility certification">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        WCAG 2.1 AA Certified Platform
                    </div>

                    <h1 id="hero-heading" className={styles.heading}>
                        Learning Without
                        <span className={styles.headingAccent}> Barriers</span>
                    </h1>

                    <p className={styles.subheading}>
                        Accessible education for every student. Tools that adapt to your specific needs,
                        making learning easy, inclusive, and empowering for all.
                    </p>

                    <div className={styles.actions}>
                        <a
                            href="#get-started"
                            className="btn btn-primary"
                            id="get-started"
                            aria-label="Start learning free — no credit card required"
                        >
                            Start Learning Free →
                        </a>
                        <a
                            href="#how-it-works"
                            className="btn btn-secondary"
                            aria-label="Watch a demo of how EduLearn works"
                        >
                            See How It Works
                        </a>
                    </div>

                    <div className={styles.trust} aria-label="Platform statistics">
                        <div className={styles.trustItem}>
                            <span className={styles.trustNum}>50K+</span>
                            <span className={styles.trustLabel}>Students</span>
                        </div>
                        <span className={styles.divider} aria-hidden="true" />
                        <div className={styles.trustItem}>
                            <span className={styles.trustNum}>500+</span>
                            <span className={styles.trustLabel}>Courses</span>
                        </div>
                        <span className={styles.divider} aria-hidden="true" />
                        <div className={styles.trustItem}>
                            <span className={styles.trustNum}>98%</span>
                            <span className={styles.trustLabel}>Satisfaction</span>
                        </div>
                    </div>
                </div>

                {/* Right visual with stats */}
                <div className={styles.visual} aria-hidden="true">
                    <div className={styles.statsCard}>
                        <ul className={styles.statsList} aria-label="Accessibility facts">
                            <li className={styles.statItem}>
                                <span className={styles.statIcon} style={{ background: '#dbeafe' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="9" cy="7" r="4" stroke="#1d4ed8" strokeWidth="2" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <div>
                                    <p className={styles.statValue} style={{ color: '#1d4ed8' }}>15%</p>
                                    <p className={styles.statDesc}>Students with disabilities</p>
                                </div>
                            </li>
                            <li className={styles.statItem}>
                                <span className={styles.statIcon} style={{ background: '#fee2e2' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="2" />
                                        <path d="M15 9l-6 6M9 9l6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <div>
                                    <p className={styles.statValue} style={{ color: '#dc2626' }}>90%</p>
                                    <p className={styles.statDesc}>Platforms are inaccessible</p>
                                </div>
                            </li>
                            <li className={styles.statItem}>
                                <span className={styles.statIcon} style={{ background: '#dcfce7' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
                                        <polyline points="22 4 12 14.01 9 11.01" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <div>
                                    <p className={styles.statValue} style={{ color: '#16a34a' }}>100%</p>
                                    <p className={styles.statDesc}>Students we include</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Floating accessibility icons */}
                    <div className={`${styles.floatingBadge} ${styles.floatA}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12h20M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Screen Reader Ready
                    </div>
                    <div className={`${styles.floatingBadge} ${styles.floatB}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" stroke="var(--color-primary)" strokeWidth="2" />
                            <path d="M8 21h8M12 17v4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Keyboard Friendly
                    </div>
                </div>
            </div>

            {/* Wave divider */}
            <div className={styles.waveDivider} aria-hidden="true">
                <svg viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none">
                    <path d="M0,60 C360,100 1080,20 1440,60 L1440,90 L0,90 Z" fill="var(--color-surface)" />
                </svg>
            </div>
        </section>
    );
}
