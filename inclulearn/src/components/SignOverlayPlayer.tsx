'use client';

/**
 * SignOverlayPlayer.tsx
 *
 * Renders a picture-in-picture <video> overlay above the main lesson video.
 * Reads signLanguageVttUrl from the lesson, parses WebVTT cues, and on each
 * timestamp match fetches + caches the corresponding ISL/ASL sign clip from
 * /api/signs/lookup, playing it in sync with the main video.
 *
 * Feature-flag: only mounted when signLanguageSupport is true.
 * Respects prefers-reduced-motion, pauses when main video pauses.
 * Fully keyboard accessible.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

type OverlayPosition = 'top-left' | 'bottom-left' | 'floating';
type SignLanguage = 'ISL' | 'ASL' | 'none';

interface VttCue {
    startSec: number;
    endSec: number;
    word: string;
}

interface SignOverlayPlayerProps {
    /** The <video> element of the lesson player */
    mainVideoRef: React.RefObject<HTMLVideoElement | null>;
    /** WebVTT URL from Lesson.signLanguageVttUrl */
    vttUrl: string;
    /** Which sign language variant to use */
    preferredLanguage: SignLanguage;
    /** Position of the overlay */
    position: OverlayPosition;
    /** Backend base URL for /api/signs/lookup */
    backendUrl: string;
    /** Auth token */
    token: string | null;
}

// ─── VTT Parser ──────────────────────────────────────────────────────────────

function parseTimeCode(tc: string): number {
    const parts = tc.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + parts[1];
}

function parseVTT(raw: string): VttCue[] {
    const cues: VttCue[] = [];
    const blocks = raw.split(/\n\n+/);
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        const timeLine = lines.find(l => l.includes('-->'));
        if (!timeLine) continue;
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim().split(/\s/)[0]);
        const word = lines[lines.indexOf(timeLine) + 1]?.trim().toLowerCase();
        if (!word) continue;
        cues.push({
            startSec: parseTimeCode(startStr),
            endSec: parseTimeCode(endStr),
            word,
        });
    }
    return cues;
}

// ─── Position styles ─────────────────────────────────────────────────────────

const POSITION_STYLES: Record<OverlayPosition, React.CSSProperties> = {
    'top-left': { position: 'fixed', top: 80, left: 16, zIndex: 8000 },
    'bottom-left': { position: 'fixed', bottom: 80, left: 16, zIndex: 8000 },
    'floating': { position: 'fixed', top: 100, left: 16, zIndex: 8000, cursor: 'move' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignOverlayPlayer({
    mainVideoRef,
    vttUrl,
    preferredLanguage,
    position,
    backendUrl,
    token,
}: SignOverlayPlayerProps) {
    const [visible, setVisible] = useState(true);
    const [size, setSize] = useState(180); // overlay width px
    const [lang, setLang] = useState<SignLanguage>(preferredLanguage);
    const [currentSignUrl, setCurrentSignUrl] = useState<string | null>(null);
    const [cues, setCues] = useState<VttCue[]>([]);
    const signVideoRef = useRef<HTMLVideoElement>(null);
    const cacheRef = useRef<Map<string, string>>(new Map()); // word+lang → url
    const rafRef = useRef<number>(0);
    const mountedRef = useRef(true);

    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Load & parse VTT ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!vttUrl) return;
        fetch(vttUrl)
            .then(r => r.text())
            .then(text => { if (mountedRef.current) setCues(parseVTT(text)); })
            .catch(() => null); // non-fatal
    }, [vttUrl]);

    // ── Lookup sign clip URL ───────────────────────────────────────────────────
    const lookupSign = useCallback(async (word: string): Promise<string | null> => {
        const key = `${word}__${lang}`;
        if (cacheRef.current.has(key)) return cacheRef.current.get(key)!;
        try {
            const res = await fetch(`${backendUrl}/api/signs/lookup?words=${encodeURIComponent(word)}&lang=${lang}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) return null;
            const data: Record<string, string | null> = await res.json();
            const url = data[word] ?? null;
            if (url) cacheRef.current.set(key, url);
            return url;
        } catch {
            return null;
        }
    }, [lang, backendUrl, token]);

    // ── Sync loop ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mainVideoRef.current || cues.length === 0 || prefersReduced) return;
        const video = mainVideoRef.current;
        let lastWord = '';

        async function tick() {
            if (!video || !mountedRef.current) return;
            const t = video.currentTime;
            const cue = cues.find(c => t >= c.startSec && t < c.endSec);
            const word = cue?.word ?? '';

            if (word && word !== lastWord) {
                lastWord = word;
                const url = await lookupSign(word);
                if (mountedRef.current) setCurrentSignUrl(url);
            } else if (!word && lastWord) {
                lastWord = '';
                setCurrentSignUrl(null);
            }

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(rafRef.current); };
    }, [cues, mainVideoRef, lookupSign, prefersReduced]);

    // ── Pause sign video when main video pauses ───────────────────────────────
    useEffect(() => {
        const video = mainVideoRef.current;
        if (!video) return;

        const onPause = () => signVideoRef.current?.pause();
        const onPlay = () => {
            if (currentSignUrl) signVideoRef.current?.play().catch(() => null);
        };

        video.addEventListener('pause', onPause);
        video.addEventListener('play', onPlay);
        return () => {
            video.removeEventListener('pause', onPause);
            video.removeEventListener('play', onPlay);
        };
    }, [mainVideoRef, currentSignUrl]);

    // ── Play sign clip when URL changes ──────────────────────────────────────
    useEffect(() => {
        if (!signVideoRef.current) return;
        if (currentSignUrl) {
            signVideoRef.current.src = currentSignUrl;
            if (mainVideoRef.current && !mainVideoRef.current.paused) {
                signVideoRef.current.play().catch(() => null);
            }
        } else {
            signVideoRef.current.src = '';
        }
    }, [currentSignUrl, mainVideoRef]);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    if (!visible) {
        return (
            <button
                onClick={() => setVisible(true)}
                aria-label="Show sign language overlay"
                style={{ ...POSITION_STYLES[position], minWidth: 44, minHeight: 44 }}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-teal-600 text-white shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 hover:bg-teal-700 transition-colors"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M6 14l-.6-1.4A3 3 0 0 0 3 11v0a3 3 0 0 0 3 3h12" />
                </svg>
            </button>
        );
    }

    return (
        <div
            role="region"
            aria-label="Sign language overlay player"
            style={{ ...POSITION_STYLES[position], width: size, transition: 'width 0.2s' }}
        >
            {/* Sign clip video */}
            <div
                className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-teal-500/40 relative"
                style={{ width: size, aspectRatio: '4/3' }}
            >
                {currentSignUrl ? (
                    <video
                        ref={signVideoRef}
                        muted={false}
                        playsInline
                        aria-label={`Sign language clip`}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
                        </svg>
                        <span className="text-[9px] font-medium text-center px-2">
                            {vttUrl ? 'Waiting for cue…' : 'No sign data'}
                        </span>
                    </div>
                )}

                {/* Corner badge */}
                <div className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {lang}
                </div>
            </div>

            {/* Controls bar */}
            <div className="mt-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow border border-slate-200 p-1.5 flex items-center gap-1.5 flex-wrap">
                {/* ISL / ASL toggle */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 text-[10px] font-bold">
                    {(['ISL', 'ASL'] as const).map(l => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            aria-pressed={lang === l}
                            aria-label={`Switch to ${l}`}
                            style={{ minHeight: 28 }}
                            className={`px-2.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset ${lang === l ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                {/* Size slider */}
                <label className="flex items-center gap-1 flex-1 min-w-[80px]">
                    <span className="sr-only">Overlay size</span>
                    <input
                        type="range"
                        min={120}
                        max={280}
                        value={size}
                        onChange={e => setSize(Number(e.target.value))}
                        aria-label="Adjust sign overlay size"
                        className="w-full accent-teal-600"
                    />
                </label>

                {/* Hide button */}
                <button
                    onClick={() => setVisible(false)}
                    aria-label="Hide sign language overlay"
                    style={{ minWidth: 28, minHeight: 28 }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-colors"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
