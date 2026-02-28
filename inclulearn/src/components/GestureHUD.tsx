'use client';

/**
 * GestureHUD.tsx
 *
 * Floating bottom-right overlay card that shows:
 *  - Live webcam thumbnail (mirrored)
 *  - Currently detected gesture label
 *  - Toggle button to enable/disable gesture navigation
 *
 * Accessibility:
 *  - Keyboard operable (toggle via Enter/Space)
 *  - ARIA labels on all interactive elements
 *  - focus-visible ring
 *  - min 44×44 touch targets
 *  - Does not intercept screen-reader navigation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GestureId } from './GestureEngine';

interface GestureHUDProps {
    /** Currently detected gesture from GestureEngine (null = nothing detected) */
    activeGesture: GestureId | null;
    /** Is gesture navigation currently active? */
    enabled: boolean;
    /** Called when the user presses the toggle button */
    onToggle: () => void;
    /** Stream reference to render in the thumbnail */
    stream: MediaStream | null;
}

const GESTURE_LABELS: Record<GestureId, string> = {
    play_pause: '✋ Play / Pause',
    next_lesson: '☝️ Next Lesson',
    prev_lesson: '👇 Prev Lesson',
    raise_hand: '🤙 Raise Hand',
    toggle_captions: '✌️ Toggle Captions',
};

export default function GestureHUD({ activeGesture, enabled, onToggle, stream }: GestureHUDProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // Wire stream to thumbnail video element
    useEffect(() => {
        if (!videoRef.current) return;
        if (stream && enabled) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => null);
        } else {
            videoRef.current.srcObject = null;
        }
    }, [stream, enabled]);

    const handleToggle = useCallback(() => {
        onToggle();
    }, [onToggle]);

    return (
        <div
            role="region"
            aria-label="Gesture navigation controls"
            className="fixed bottom-5 right-5 z-[9000] flex flex-col items-end gap-2"
            style={{ userSelect: 'none' }}
        >
            {/* Collapsed / Expanded card */}
            {isExpanded && (
                <div
                    className="bg-white border border-slate-200 rounded-[4px] shadow-xl overflow-hidden w-64"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2.5 flex items-center justify-between">
                        <span className="text-white font-bold text-xs tracking-wide flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M6 14l-.6-1.4A3 3 0 0 0 3 11v0a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1a2 2 0 0 0-2-2v0" />
                            </svg>
                            Gesture Nav
                        </span>
                        <button
                            onClick={() => setIsExpanded(false)}
                            aria-label="Minimize gesture navigation panel"
                            className="text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md p-0.5"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>

                    {/* Camera thumbnail */}
                    <div className="relative bg-slate-900 w-full h-44">
                        {enabled && stream ? (
                            <video
                                ref={videoRef}
                                muted
                                playsInline
                                autoPlay
                                aria-hidden="true"
                                className="w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }} // mirror
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                                    <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" />
                                    <line x1="2" y1="2" x2="22" y2="22" />
                                </svg>
                                <span className="text-xs font-medium">Camera off</span>
                            </div>
                        )}

                        {/* Gesture label badge */}
                        {activeGesture && enabled && (
                            <div
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                            >
                                {GESTURE_LABELS[activeGesture]}
                            </div>
                        )}
                    </div>

                    {/* Toggle row */}
                    <div className="px-4 py-3.5 flex items-center justify-between gap-2 border-t border-slate-100">
                        <span className="text-[12px] font-semibold text-slate-800">
                            {enabled ? 'Gestures active' : 'Gestures off'}
                        </span>
                        <button
                            onClick={handleToggle}
                            aria-pressed={enabled}
                            aria-label={enabled ? 'Disable gesture navigation' : 'Enable gesture navigation'}
                            style={{ minWidth: 44, minHeight: 44 }}
                            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${enabled ? 'bg-violet-600' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Cheat sheet */}
                    <div className="px-4 pb-4 space-y-2">
                        {(Object.entries(GESTURE_LABELS) as [GestureId, string][]).map(([id, label]) => (
                            <div key={id} className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                                <span className="w-2.5 h-2.5 rounded-full bg-violet-200 shrink-0" aria-hidden="true" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating FAB when minimised */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    aria-label="Expand gesture navigation panel"
                    style={{ minWidth: 44, minHeight: 44 }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M6 14l-.6-1.4A3 3 0 0 0 3 11v0a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1a2 2 0 0 0-2-2v0" />
                    </svg>
                </button>
            )}
        </div>
    );
}
