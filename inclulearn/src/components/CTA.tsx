import styles from './CTA.module.css';

export default function CTA() {
    return (
        <section
            className={`section ${styles.section}`}
            id="why-us"
            aria-labelledby="cta-heading"
        >
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.text}>
                        <h2 id="cta-heading" className={styles.heading}>
                            Ready to Include Every Student?
                        </h2>
                        <p className={styles.sub}>
                            Join 50,000+ students and educators building the future of accessible education.
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <a
                            href="#get-started"
                            className="btn btn-primary"
                            aria-label="Get started free — no credit card required"
                        >
                            Get Started Free
                        </a>
                        <p className={styles.disclaimer}>No credit card required. Cancel anytime.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
