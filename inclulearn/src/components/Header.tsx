'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] =
    useState<'A' | 'A+' | 'A++'>('A');

  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ---------- Theme ---------- */
  useEffect(() => {
    const root = document.documentElement;

    highContrast
      ? root.setAttribute('data-theme', 'high-contrast')
      : root.removeAttribute('data-theme');

  }, [highContrast]);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-text-size',
      textSize
    );
  }, [textSize]);

  /* ---------- Outside Click ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !settingsBtnRef.current?.contains(e.target as Node)
      ) setSettingsOpen(false);
    };

    document.addEventListener('mousedown', handler);
    return () =>
      document.removeEventListener('mousedown', handler);
  }, []);

  /* ---------- Escape ---------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSettingsOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handler);
    return () =>
      document.removeEventListener('keydown', handler);
  }, []);

  /* ---------- Lock Scroll ---------- */
  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const navLinks = [
    'Features',
    'Why Us',
    'Accessibility',
    'Pricing',
  ];

  const textSizes = ['A', 'A+', 'A++'] as const;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-primary"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              ≡
            </div>

            <span className="text-lg sm:text-xl">
              EduLearn
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 justify-center">

            <ul className="flex gap-2">

              {navLinks.map(link => (
                <li key={link}>
                  <a
                    href={`#${link
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`}
                    className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                  >
                    {link}
                  </a>
                </li>
              ))}

            </ul>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 ml-auto">

            {/* ---------- Settings ---------- */}
            <div className="relative">

              <Button
                ref={settingsBtnRef}
                size="sm"
                variant="outline"
                onClick={() =>
                  setSettingsOpen(v => !v)
                }
              >
                ⚙
                <span className="hidden sm:inline ml-1">
                  Settings
                </span>
              </Button>

              {settingsOpen && (
                <div
                  ref={panelRef}
                  className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-xl shadow-xl p-4 space-y-5 animate-fade-in-up"
                >

                  {/* Contrast */}
                  <div className="flex justify-between items-center">

                    <span className="text-sm font-medium">
                      High Contrast
                    </span>

                    <button
                      role="switch"
                      aria-checked={highContrast}
                      onClick={() =>
                        setHighContrast(v => !v)
                      }
                      className={`w-11 h-6 rounded-full relative transition
                      ${highContrast
                          ? 'bg-primary'
                          : 'bg-muted'
                        }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition
                        ${highContrast
                            ? 'right-1'
                            : 'left-1'
                          }`}
                      />
                    </button>

                  </div>

                  {/* Text Size */}
                  <div>

                    <p className="text-sm font-medium mb-2">
                      Text Size
                    </p>

                    <div className="flex gap-2">

                      {textSizes.map(size => (
                        <button
                          key={size}
                          onClick={() =>
                            setTextSize(size)
                          }
                          className={`flex-1 py-1.5 rounded-md text-sm font-semibold border transition
                          ${textSize === size
                              ? 'bg-primary text-white border-primary'
                              : 'border-border hover:border-primary'
                            }`}
                        >
                          {size}
                        </button>
                      ))}

                    </div>

                  </div>

                </div>
              )}
            </div>

            {/* Desktop CTA */}
            <Link
              href="/login"
              className="hidden md:flex px-4 h-9 items-center rounded-lg border text-sm font-semibold hover:bg-muted"
            >
              Sign In
            </Link>

            <Button
              asChild
              className="hidden md:flex rounded-full"
            >
              <Link href="/register">
                Get Started
              </Link>
            </Button>

            {/* Mobile Menu */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() =>
                setMobileOpen(v => !v)
              }
            >
              ☰
            </button>

          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <aside className="fixed right-0 top-0 h-full w-72 bg-card border-l border-border z-50 shadow-xl p-6 flex flex-col animate-slide-in-right">

            <h2 className="font-bold text-primary text-lg mb-6">
              EduLearn
            </h2>

            <nav className="flex flex-col gap-2">

              {navLinks.map(link => (
                <a
                  key={link}
                  href={`#${link
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="px-4 py-3 rounded-lg hover:bg-primary/10"
                >
                  {link}
                </a>
              ))}

            </nav>

            <div className="mt-auto space-y-2">

              <Link
                href="/login"
                className="block text-center border rounded-lg py-3 font-semibold"
              >
                Sign In
              </Link>

              <Button
                asChild
                className="w-full rounded-full"
              >
                <Link href="/register">
                  Get Started
                </Link>
              </Button>

            </div>

          </aside>
        </>
      )}
    </>
  );
}