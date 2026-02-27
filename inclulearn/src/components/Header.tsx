'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState<'A' | 'A+' | 'A++'>('A');
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ---- Apply data-theme to <html> ---- */
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-theme', 'high-contrast');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [highContrast]);

  /* ---- Apply data-text-size to <html> ---- */
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  /* ---- Close settings panel on outside click ---- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        settingsBtnRef.current && !settingsBtnRef.current.contains(e.target as Node)
      ) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ---- Escape key closes both panels ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (settingsOpen) { setSettingsOpen(false); settingsBtnRef.current?.focus(); }
        if (mobileOpen) setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [settingsOpen, mobileOpen]);

  /* ---- Lock body scroll when mobile menu open ---- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = ['Features', 'Why Us', 'Accessibility', 'Pricing'];
  const textSizes: Array<'A' | 'A+' | 'A++'> = ['A', 'A+', 'A++'];

  return (
    <>
      {/* ===== HEADER ===== */}
      <header
        className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">

          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="EduLearn — Home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-primary">EduLearn</span>
          </a>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="flex-1 hidden md:flex justify-center">
            <ul className="flex items-center gap-1 list-none m-0 p-0" role="list">
              {navLinks.map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Settings + CTA + Hamburger */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">

            {/* Accessibility Settings */}
            <div className="relative">
              <Button
                ref={settingsBtnRef}
                variant="outline"
                size="sm"
                className="gap-2 text-sm"
                aria-label="Accessibility settings"
                aria-expanded={settingsOpen}
                aria-controls="accessibility-panel"
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </Button>

              {/* Settings Dropdown */}
              {settingsOpen && (
                <div
                  id="accessibility-panel"
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="settings-title"
                  className="absolute top-[calc(100%+8px)] right-0 bg-card border border-border rounded-2xl shadow-2xl p-5 w-64 z-50 animate-fade-in-up"
                >
                  <h2 id="settings-title" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-5">
                    Accessibility Settings
                  </h2>

                  {/* High Contrast Toggle */}
                  <div className="flex items-center justify-between mb-5">
                    <label htmlFor="hc-toggle" className="text-sm font-semibold text-foreground cursor-pointer select-none">
                      High Contrast
                    </label>
                    <button
                      id="hc-toggle"
                      role="switch"
                      aria-checked={highContrast}
                      onClick={() => setHighContrast((v) => !v)}
                      aria-label={`High contrast ${highContrast ? 'on — click to turn off' : 'off — click to turn on'}`}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${highContrast ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${highContrast ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  {/* Text Size */}
                  <div>
                    <p id="text-size-label" className="text-sm font-semibold text-foreground mb-3">Text Size</p>
                    <div className="flex gap-2" role="group" aria-labelledby="text-size-label">
                      {textSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setTextSize(size)}
                          aria-pressed={textSize === size}
                          aria-label={`Set text size to ${size}`}
                          className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${textSize === size
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center h-9 px-4 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Sign in to your EduLearn account"
            >
              Sign In
            </Link>
            <Button asChild className="hidden md:inline-flex rounded-full">
              <Link href="/register" aria-label="Create a free EduLearn account">
                Get Started Free
              </Link>
            </Button>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M3 5h16M3 11h16M3 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE NAV DRAWER ===== */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border shadow-2xl md:hidden animate-slide-in-right flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="text-lg font-extrabold text-primary">EduLearn</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile navigation" className="flex-1 px-4 py-6">
              <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
                {navLinks.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth buttons in drawer */}
            <div className="px-4 pb-6 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-11 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Sign in to your EduLearn account"
              >
                Sign In
              </Link>
              <Button asChild className="w-full rounded-full">
                <Link href="/register" onClick={() => setMobileOpen(false)} aria-label="Create a free EduLearn account">
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
