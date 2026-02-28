'use client';

/**
 * GestureEngine.tsx
 *
 * Headless React component — renders nothing to the DOM.
 * Loads MediaPipe Hands + TensorFlow.js via CDN script injection,
 * runs a requestAnimationFrame detection loop on a hidden <video>
 * element, classifies hand shapes, and emits onGesture(gestureId)
 * with a configurable cooldown.
 *
 * Feature-flag: only mounted when gestureNavigationEnabled === true.
 * Stops camera on unmount. Respects prefers-reduced-motion.
 *
 * Supported gestures:
 *   'play_pause'    — Open palm held ≥ 1 s
 *   'next_lesson'   — Index finger up
 *   'prev_lesson'   — Peace sign (index + middle up)
 *   'raise_hand'    — Pinky + thumb extended (call-me / shaka)
 *   'toggle_captions' — Index finger down
 */

import { useEffect, useRef } from 'react';

export type GestureId =
    | 'play_pause'
    | 'next_lesson'
    | 'prev_lesson'
    | 'raise_hand'
    | 'toggle_captions';

interface GestureEngineProps {
    onGesture: (id: GestureId) => void;
    /** Minimum ms between two gesture emissions. Default 1500 */
    cooldownMs?: number;
    /** Callback when the camera stream is acquired */
    onStreamReady?: (stream: MediaStream) => void;
}

// ─── Landmark indices (MediaPipe Hands) ───────────────────────────────────────
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;

type NLM = { x: number; y: number; z: number };

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function isFingerExtended(tip: NLM, mcp: NLM): boolean {
    // tip is above (lower y value in image-space) its MCP knuckle — extended
    return tip.y < mcp.y - 0.04;
}

function dist2D(a: NLM, b: NLM): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Classifier ────────────────────────────────────────────────────────────────

function classify(lm: NLM[]): GestureId | null {
    const wrist = lm[WRIST];
    const thumbTip = lm[THUMB_TIP];
    const indexTip = lm[INDEX_TIP];
    const indexMcp = lm[INDEX_MCP];
    const middleTip = lm[MIDDLE_TIP];
    const middleMcp = lm[MIDDLE_MCP];
    const ringTip = lm[RING_TIP];
    const pinkyTip = lm[PINKY_TIP];

    const indexUp = isFingerExtended(indexTip, indexMcp);
    const middleUp = isFingerExtended(middleTip, middleMcp);
    const ringDown = !isFingerExtended(ringTip, middleMcp);
    const pinkyUp = pinkyTip.y < wrist.y - 0.15;
    const thumbOut = dist2D(thumbTip, wrist) > 0.25;

    // Open palm: all 5 fingers extended
    const allUp =
        indexUp &&
        middleUp &&
        isFingerExtended(ringTip, middleMcp) &&
        pinkyUp &&
        thumbOut;

    if (allUp) return 'play_pause'; // held check handled by caller

    // Peace sign: index + middle extended, ring + pinky down -> prev_lesson
    if (indexUp && middleUp && ringDown && !pinkyUp) return 'prev_lesson';

    // Shaka / raise_hand: thumb + pinky extended, others curled
    if (thumbOut && pinkyUp && !indexUp && !middleUp && !isFingerExtended(ringTip, middleMcp)) {
        return 'raise_hand';
    }

    // Index only up (pointing up → next, pointing down → toggle_captions)
    if (indexUp && !middleUp && !pinkyUp) {
        if (indexTip.y < indexMcp.y - 0.12) {
            return indexTip.y < wrist.y ? 'next_lesson' : 'toggle_captions';
        }
    }

    return null;
}

// ─── Script loader (CDN injection) ────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GestureEngine({ onGesture, cooldownMs = 1500, onStreamReady }: GestureEngineProps) {
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const rafRef = useRef<number>(0);
    const lastGestureRef = useRef<{ id: GestureId | null; startMs: number; firedMs: number }>({
        id: null, startMs: 0, firedMs: 0,
    });
    const handsRef = useRef<unknown>(null);
    const mountedRef = useRef(true);

    // Respect prefers-reduced-motion
    const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        if (prefersReduced) return;
        mountedRef.current = true;

        async function init() {
            try {
                // Fix for Next.js Emscripten "Module.arguments" and WebGL spam
                // MediaPipe emits scary-looking `fd_write` stack traces on startup
                // We define a synthetic Module to silence them and avoid FFmpeg collisions
                if (typeof window !== 'undefined') {
                    (window as any).Module = {
                        print: () => { },
                        printErr: () => { },
                        arguments: [] // Satisfy Emscripten's arg lookup
                    };
                }

                // Load MediaPipe Hands from CDN
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

                if (!mountedRef.current) return;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const HandsClass = (window as unknown as Record<string, any>)['Hands'];
                if (!HandsClass) return;

                const hands = new HandsClass({
                    locateFile: (file: string) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.6,
                });

                hands.onResults((results: unknown) => {
                    if (!mountedRef.current) return;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const r = results as any;
                    if (!r.multiHandLandmarks || r.multiHandLandmarks.length === 0) {
                        lastGestureRef.current.id = null;
                        return;
                    }
                    const lm: NLM[] = r.multiHandLandmarks[0];
                    const detected = classify(lm);
                    const now = Date.now();
                    const lg = lastGestureRef.current;

                    if (!detected) { lg.id = null; return; }

                    if (detected !== lg.id) {
                        // New gesture — start hold timer
                        lg.id = detected;
                        lg.startMs = now;
                        lg.firedMs = 0;
                        return;
                    }

                    // Same gesture — check hold & cooldown
                    const holdMs = now - lg.startMs;
                    const sinceLastFire = now - lg.firedMs;

                    // Open palm requires 1s hold; others are instant (frame-stable)
                    const requiredHold = detected === 'play_pause' ? 1000 : 300;

                    if (holdMs >= requiredHold && sinceLastFire >= cooldownMs) {
                        lg.firedMs = now;
                        onGesture(detected);
                    }
                });

                handsRef.current = hands;

                // Request webcam
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 320, height: 240 },
                    audio: false,
                });

                if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

                streamRef.current = stream;
                if (onStreamReady) onStreamReady(stream);

                // Create hidden video element
                const video = document.createElement('video');
                video.srcObject = stream;
                video.playsInline = true;
                video.muted = true;
                video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;';
                document.body.appendChild(video);
                videoRef.current = video;

                await video.play();

                // Hidden canvas for frame extraction
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = 240;
                const ctx = canvas.getContext('2d')!;

                let running = true;

                async function loop() {
                    if (!running || !mountedRef.current) return;
                    if (video.readyState >= 2) {
                        ctx.drawImage(video, 0, 0, 320, 240);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await (hands as any).send({ image: canvas });
                    }
                    rafRef.current = requestAnimationFrame(loop);
                }

                rafRef.current = requestAnimationFrame(loop);

                return () => { running = false; };
            } catch (err) {
                // Camera permission denied or load failed — fail silently (non-fatal)
                console.warn('[GestureEngine] Could not initialise:', err);
            }
        }

        init();

        return () => {
            mountedRef.current = false;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach(t => t.stop());
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.remove();
                videoRef.current = null;
            }
            if (handsRef.current) {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (handsRef.current as any).close();
                } catch (e) { }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Headless — renders nothing
    return null;
}
