'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our Accessibility state
interface AccessibilityContextType {
    // Visual
    dyslexiaFont: boolean;
    setDyslexiaFont: (value: boolean) => void;
    reducedMotion: boolean;
    setReducedMotion: (value: boolean) => void;
    highContrast: boolean;
    setHighContrast: (value: boolean) => void;
    textScale: number;
    setTextScale: (value: number) => void;

    // Theme (Blinkit Style)
    blinkitTheme: string;
    setBlinkitTheme: (value: string) => void;

    // Audio
    voiceSpeed: number;
    setVoiceSpeed: (value: number) => void;
    screenReader: boolean;
    setScreenReader: (value: boolean) => void;
    soundEffects: boolean;
    setSoundEffects: (value: boolean) => void;

    // Caption
    captionTextSize: string;
    setCaptionTextSize: (value: string) => void;
    captionTextColor: string;
    setCaptionTextColor: (value: string) => void;
    captionBgOpacity: string;
    setCaptionBgOpacity: (value: string) => void;
    captionFontFamily: string;
    setCaptionFontFamily: (value: string) => void;

    // Helper functions
    applyScreenReaderOptimized: () => void;
    applyHighContrastMode: () => void;
    applyReducedMotion: () => void;
    applyLargeText: () => void;
    resetToDefault: () => void;
}

// Create the Context with a default empty state
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Define the Provider component
export function AccessibilityProvider({ children }: { children: ReactNode }) {
    // We use state to hold the accessibility preferences. 
    // In a real app, you might sync these to localStorage or a database on mount.

    // Visual
    const [dyslexiaFont, setDyslexiaFont] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [textScale, setTextScale] = useState(100);

    // Theme (Blinkit Style)
    const [blinkitTheme, setBlinkitThemeState] = useState('');

    // Audio
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);
    const [screenReader, setScreenReader] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);

    // Caption
    const [captionTextSize, setCaptionTextSize] = useState('Medium');
    const [captionTextColor, setCaptionTextColor] = useState('White');
    const [captionBgOpacity, setCaptionBgOpacity] = useState('100%');
    const [captionFontFamily, setCaptionFontFamily] = useState('Sans Serif');

    // Sync theme to localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('EduAble_blinkitTheme');
        if (storedTheme) {
            setBlinkitThemeState(storedTheme);
        }
    }, []);

    const setBlinkitTheme = (theme: string) => {
        setBlinkitThemeState(theme);
        if (theme) {
            localStorage.setItem('EduAble_blinkitTheme', theme);
        } else {
            localStorage.removeItem('EduAble_blinkitTheme');
        }
    };

    function applyScreenReaderOptimized() {
        setScreenReader(true);
        setReducedMotion(true);
        setTextScale(125);
        setVoiceSpeed(1.5);
    }

    function applyHighContrastMode() {
        setHighContrast(true);
        setCaptionTextColor('Cyan');
        setCaptionBgOpacity('100%');
    }

    function applyReducedMotion() {
        setReducedMotion(true);
    }

    function applyLargeText() {
        setTextScale(125);
    }

    function resetToDefault() {
        setDyslexiaFont(false);
        setReducedMotion(false);
        setHighContrast(false);
        setTextScale(100);

        setVoiceSpeed(1.0);
        setScreenReader(false);
        setSoundEffects(true);

        setCaptionTextSize('Medium');
        setCaptionTextColor('White');
        setCaptionBgOpacity('100%');
        setCaptionFontFamily('Sans Serif');
        setBlinkitTheme('');
    }

    // Effect to apply dynamic styles to the <body> tag when these values change
    useEffect(() => {
        const root = document.documentElement;

        // Font Scaling
        root.style.fontSize = `${textScale}%`;

        // High Contrast Mode
        if (highContrast) {
            root.setAttribute('data-theme', 'high-contrast');
        } else {
            root.removeAttribute('data-theme');
        }

        // Reduced Motion
        if (reducedMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Dyslexia Font
        if (dyslexiaFont) {
            document.body.style.fontFamily = "'OpenDyslexic', sans-serif";
        } else {
            document.body.style.fontFamily = ''; // Revert to default
        }

        // Apply Blinkit Theme Classes
        const allThemes = [
            'theme-blinkit-high-contrast',
            'theme-blinkit-deaf',
            'theme-blinkit-cognitive',
            'theme-blinkit-motor',
            'theme-blinkit-colorblind',
            'theme-blinkit-universal'
        ];
        document.body.classList.remove(...allThemes);
        if (blinkitTheme) {
            document.body.classList.add(blinkitTheme);
        }

    }, [textScale, highContrast, reducedMotion, dyslexiaFont, blinkitTheme]);

    // Construct the context value
    const value: AccessibilityContextType = {
        dyslexiaFont, setDyslexiaFont,
        reducedMotion, setReducedMotion,
        highContrast, setHighContrast,
        textScale, setTextScale,
        blinkitTheme, setBlinkitTheme,

        voiceSpeed, setVoiceSpeed,
        screenReader, setScreenReader,
        soundEffects, setSoundEffects,

        captionTextSize, setCaptionTextSize,
        captionTextColor, setCaptionTextColor,
        captionBgOpacity, setCaptionBgOpacity,
        captionFontFamily, setCaptionFontFamily,

        applyScreenReaderOptimized,
        applyHighContrastMode,
        applyReducedMotion,
        applyLargeText,
        resetToDefault
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
}

// Custom Hook to consume the context
export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
