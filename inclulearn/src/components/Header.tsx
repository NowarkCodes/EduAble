'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'A' | 'A+' | 'A++'>('A');
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Apply theme attributes to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-theme', 'high-contrast');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        settingsBtnRef.current &&
        !settingsBtnRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
        settingsBtnRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [settingsOpen]);

  const textSizes: Array<'A' | 'A+' | 'A++'> = ['A', 'A+', 'A++'];

  return (
    <header className={styles.header} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo} aria-label="EduLearn - Home">
          <span className={styles.logoIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="8" fill="var(--color-primary)" />
              <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className={styles.logoText}>EduLearn</span>
        </a>

        {/* Nav */}
        <nav aria-label="Main navigation" className={styles.nav}>
          <ul className={styles.navList} role="list">
            {['Features', 'Why Us', 'Accessibility', 'Pricing'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className={styles.navLink}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          {/* Accessibility Settings */}
          <div className={styles.settingsWrapper}>
            <button
              ref={settingsBtnRef}
              className={`btn btn-secondary ${styles.settingsBtn}`}
              aria-label="Accessibility settings"
              aria-expanded={settingsOpen}
              aria-controls="accessibility-panel"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Settings
            </button>

            {settingsOpen && (
              <div
                id="accessibility-panel"
                ref={panelRef}
                role="dialog"
                aria-modal="false"
                aria-labelledby="settings-title"
                className={styles.panel}
              >
                <h2 id="settings-title" className={styles.panelTitle}>
                  Accessibility Settings
                </h2>

                {/* High Contrast Toggle */}
                <div className={styles.settingRow}>
                  <label htmlFor="high-contrast-toggle" className={styles.settingLabel}>
                    High Contrast
                  </label>
                  <button
                    id="high-contrast-toggle"
                    role="switch"
                    aria-checked={highContrast}
                    onClick={() => setHighContrast((v) => !v)}
                    className={`${styles.toggle} ${highContrast ? styles.toggleOn : ''}`}
                    aria-label={`High contrast mode ${highContrast ? 'on' : 'off'}`}
                  >
                    <span className={styles.toggleThumb} aria-hidden="true" />
                  </button>
                </div>

                {/* Text Size */}
                <div className={styles.settingRowColumn}>
                  <p id="text-size-label" className={styles.settingLabel}>Text Size</p>
                  <div className={styles.textSizeGroup} role="group" aria-labelledby="text-size-label">
                    {textSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setTextSize(size)}
                        className={`${styles.textSizeBtn} ${textSize === size ? styles.textSizeBtnActive : ''}`}
                        aria-pressed={textSize === size}
                        aria-label={`Text size ${size}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#get-started" className="btn btn-primary">
            Get Started Free
          </a>
        </div>

        {/* Mobile hamburger placeholder */}
        <button className={styles.mobileMenuBtn} aria-label="Open navigation menu" aria-expanded="false">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M3 5h16M3 11h16M3 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
