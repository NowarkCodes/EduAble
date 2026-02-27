import styles from './Testimonials.module.css';

const testimonials = [
    {
        quote: '"EduLearn changed how I study. The screen reader support is flawless and makes me feel truly independent."',
        name: 'Alex Johnson',
        role: 'Computer Science Student',
        avatar: 'AJ',
        avatarBg: '#dbeafe',
        avatarColor: '#1d4ed8',
    },
    {
        quote: '"The automated captions and transcripts make every lecture accessible for me. I don\'t miss a single detail now."',
        name: 'Maria Garcia',
        role: 'History Major',
        avatar: 'MG',
        avatarBg: '#fce7f3',
        avatarColor: '#be185d',
    },
    {
        quote: '"The high-contrast modes and font adjustments are a lifesaver for my visual fatigue. Best learning tool ever."',
        name: 'Jordan Lee',
        role: 'Graphic Design Student',
        avatar: 'JL',
        avatarBg: '#f0fdf4',
        avatarColor: '#16a34a',
    },
];

export default function Testimonials() {
    return (
        <section
            className={`section ${styles.section}`}
            id="testimonials"
            aria-labelledby="testimonials-heading"
        >
            <div className="container">
                <header className={styles.header}>
                    <p className={styles.overline}>Student Stories</p>
                    <h2 id="testimonials-heading" className={styles.title}>
                        Students Who Found Their Voice
                    </h2>
                </header>

                <ul className={styles.grid} role="list" aria-label="Student testimonials">
                    {testimonials.map((t) => (
                        <li key={t.name}>
                            <article className={`card ${styles.card}`} aria-label={`Testimonial from ${t.name}`}>
                                <div className={styles.quoteIcon} aria-hidden="true">
                                    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                                        <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.4 3.6 7.6 6 6.4 10H12V24H0zm20 0V14.4C20 6.4 24.8 1.6 34.4 0L36 2.4C30.4 3.6 27.6 6 26.4 10H32V24H20z" fill="var(--color-primary)" opacity="0.12" />
                                    </svg>
                                </div>
                                <blockquote className={styles.quote}>
                                    <p>{t.quote}</p>
                                </blockquote>
                                <footer className={styles.author}>
                                    <div
                                        className={styles.avatar}
                                        aria-hidden="true"
                                        style={{ background: t.avatarBg, color: t.avatarColor }}
                                    >
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className={styles.authorName}>{t.name}</p>
                                        <p className={styles.authorRole}>{t.role}</p>
                                    </div>
                                </footer>
                            </article>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
