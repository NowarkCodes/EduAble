'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScrollProvider
 *
 * Initialises Lenis for buttery-smooth native-feel scrolling on every page.
 * Respects `prefers-reduced-motion` — Lenis is skipped for users who
 * opt out of motion at the OS level (accessibility compliance).
 *
 * Drop this anywhere inside <body> in RootLayout (it renders nothing).
 */
export default function SmoothScrollProvider() {
    const lenisRef = useRef<Lenis | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        // Expose globally for programmatic scroll calls
        (window as Window & typeof globalThis & { lenis?: Lenis }).lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        }
        rafRef.current = requestAnimationFrame(raf);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return null;
}

