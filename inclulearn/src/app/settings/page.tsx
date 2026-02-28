"use client";

import React, { useState, useEffect, Fragment } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { ChevronDown, Eye, PlayCircle } from "lucide-react";
import Dropdown from "@/components/Dropdown";

/* ── Types ───────────────────────────────────────── */
type SettingsTab = "accessibility" | "visual" | "audio" | "shortcuts";

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  badge?: string;
}

/* ── Toggle Card ─────────────────────────────────── */
function ToggleCard({
  id,
  checked,
  onChange,
  label,
  description,
  badge,
}: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <label
            htmlFor={id}
            className="text-sm font-bold text-slate-900 cursor-pointer"
          >
            {label}
          </label>
          {badge && (
            <span className="text-[9px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 mt-0.5 ${checked ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

/* ── Section heading ─────────────────────────────── */
function SectionHeading({
  id,
  icon,
  title,
}: {
  id?: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-base font-extrabold text-slate-900 mb-4"
    >
      <span className="text-blue-600">{icon}</span>
      {title}
    </h2>
  );
}

/* ── Sidebar tab ─────────────────────────────────── */
const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "accessibility",
    label: "Accessibility",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="7" cy="2" r="1.5" />
        <path
          d="M2.5 5h9M7 5.5V12M4.5 12l2.5-3 2.5 3"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "visual",
    label: "Visual",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="2.5" />
        <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Audio & Voice",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="4" y="2" width="6" height="7" rx="3" />
        <path d="M2 9a5 5 0 0 0 10 0M7 13v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "shortcuts",
    label: "Shortcuts",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="1" y="3" width="12" height="8" rx="1.5" />
        <path d="M4 7h2M8 7h2M4 9.5h6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const shortcuts = [
  {
    section: "General Navigation",
    items: [
      { action: "Global Search", keys: ["Alt", "S"] },
      { action: "Toggle Sidebar", keys: ["Alt", "B"] },
    ],
  },
  {
    section: "Accessibility Tools",
    items: [
      { action: "Read Aloud Content", keys: ["Alt", "R"] },
      { action: "High Contrast Toggle", keys: ["Alt", "H"] },
    ],
  },
];

/* ── Sign Language & Gesture Navigation Settings ──────────────────────────── */
function SignLanguageSection() {
  const { token } = useAuth();
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [signLangSupport, setSignLangSupport] = React.useState(false);
  const [gestureNav, setGestureNav] = React.useState(false);
  const [preferredLang, setPreferredLang] = React.useState('ISL');
  const [overlayPos, setOverlayPos] = React.useState('bottom-left');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Load existing prefs
  React.useEffect(() => {
    if (!token) return;
    fetch(`${BACKEND}/api/profile/accessibility`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.accessibilityPreferences) return;
        const p = data.accessibilityPreferences;
        setSignLangSupport(!!p.signLanguageSupport);
        setGestureNav(!!p.gestureNavigationEnabled);
        setPreferredLang(p.preferredSignLanguage || 'ISL');
        setOverlayPos(p.signOverlayPosition || 'bottom-left');
      })
      .catch(() => null);
  }, [token, BACKEND]);

  async function save() {
    if (!token) return;
    setSaving(true);
    try {
      await fetch(`${BACKEND}/api/profile/accessibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accessibilityPreferences: {
            signLanguageSupport: signLangSupport,
            gestureNavigationEnabled: gestureNav,
            preferredSignLanguage: preferredLang,
            signOverlayPosition: overlayPos,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* non-fatal */ } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden shadow-sm w-full" id="sign-language-settings">
      <div className="p-5 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="text-teal-600 bg-teal-50 rounded-md p-1.5 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M6 14l-.6-1.4A3 3 0 0 0 3 11v0a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1a2 2 0 0 0-2-2v0" />
            </svg>
          </div>
          <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-slate-900" id="sign-lang-heading">
            Sign Language &amp; Gesture Navigation
          </h2>
        </div>

        <div className="space-y-4">
          {/* Sign language overlay toggle */}
          <ToggleCard
            id="setting-sign-lang-support"
            checked={signLangSupport}
            onChange={setSignLangSupport}
            label="Sign Language Overlay"
            description="Shows an ISL/ASL video overlay synced to lesson audio for deaf students."
            badge="Deaf Support"
          />

          {signLangSupport && (
            <>
              {/* ISL / ASL picker */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100">
                <label htmlFor="setting-preferred-lang" className="text-sm font-bold text-slate-900 block mb-1">
                  Preferred Sign Language
                </label>
                <p className="text-xs text-slate-500 mb-3">ISL = Indian Sign Language · ASL = American Sign Language</p>
                <div className="flex gap-2" role="radiogroup" aria-labelledby="setting-preferred-lang">
                  {(['ISL', 'ASL', 'none'] as const).map(l => (
                    <label
                      key={l}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-bold transition-colors ${preferredLang === l ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-teal-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="preferred-sign-lang"
                        value={l}
                        checked={preferredLang === l}
                        onChange={() => setPreferredLang(l)}
                        className="accent-teal-600"
                      />
                      {l === 'none' ? 'None' : l}
                    </label>
                  ))}
                </div>
              </div>

              {/* Overlay position */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100">
                <label htmlFor="setting-overlay-pos" className="text-sm font-bold text-slate-900 block mb-1">
                  Overlay Position
                </label>
                <p className="text-xs text-slate-500 mb-3">Where the sign language clip appears on the lesson screen.</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Overlay position">
                  {(['bottom-left', 'top-left', 'floating'] as const).map(pos => (
                    <label
                      key={pos}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${overlayPos === pos ? 'border-teal-600 bg-teal-50 text-teal-700 font-bold' : 'border-slate-200 text-slate-600 hover:border-teal-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="overlay-position"
                        value={pos}
                        checked={overlayPos === pos}
                        onChange={() => setOverlayPos(pos)}
                        className="accent-teal-600"
                      />
                      {pos.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Gesture navigation toggle */}
          <ToggleCard
            id="setting-gesture-nav"
            checked={gestureNav}
            onChange={setGestureNav}
            label="Gesture-Based Navigation"
            description="Use hand signs via webcam to control lesson playback (play/pause, next/prev). Requires camera permission."
          />

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving}
              aria-busy={saving}
              style={{ minHeight: 44 }}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Sign Language Settings'}
            </button>
            {saved && (
              <span role="status" className="text-teal-700 text-sm font-semibold flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function SettingsPage() {
  const { user: authUser } = useAuth();
  const initials = (authUser?.name ?? "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [activeTab, setActiveTab] = useState<SettingsTab>("accessibility");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState("English (US)");

  useEffect(() => {
    // Check if googtrans cookie is set to match UI selection
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    if (match && match[1]) {
      const codeToLang: Record<string, string> = {
        en: "English (US)",
        hi: "Hindi",
        es: "Spanish",
        fr: "French",
        de: "German",
        ar: "Arabic",
      };
      if (codeToLang[match[1]]) {
        setLanguage(codeToLang[match[1]]);
      }
    }
  }, []);

  const handleLanguageChange = (selectedLang: string) => {
    setLanguage(selectedLang);

    const langMap: Record<string, string> = {
      "English (US)": "en",
      "English (UK)": "en",
      "Hindi": "hi",
      "Spanish": "es",
      "French": "fr",
      "German": "de",
      "Arabic": "ar",
    };

    const targetCode = langMap[selectedLang] || "en";

    if (targetCode === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
    } else {
      document.cookie = "googtrans=/en/" + targetCode + "; path=/;";
      document.cookie = "googtrans=/en/" + targetCode + "; domain=" + window.location.hostname + "; path=/;";
    }

    window.location.reload();
  };

  const {
    dyslexiaFont,
    setDyslexiaFont,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    blinkitTheme,
    setBlinkitTheme,
    voiceSpeed,
    setVoiceSpeed,
    screenReader,
    setScreenReader,
    soundEffects,
    setSoundEffects,
    captionTextSize,
    setCaptionTextSize,
    captionTextColor,
    setCaptionTextColor,
    captionBgOpacity,
    setCaptionBgOpacity,
    captionFontFamily,
    setCaptionFontFamily,
    applyScreenReaderOptimized,
    applyHighContrastMode,
    applyReducedMotion,
    applyLargeText,
    resetToDefault,
  } = useAccessibility();

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  function handleReset() {
    resetToDefault();
    setLanguage("English (US)");
  }

  return (
    <DashboardLayout
      userInitials={initials}
      userName={authUser?.name ?? "User"}
      userTier="Standard Account"
    >
      <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-slate-500 mb-5 sm:mb-6 font-medium"
        >
          <span>Home</span>
          <span aria-hidden="true">›</span>
          <span className="text-slate-900 font-bold">Settings</span>
        </nav>

        {/* Page title */}
        <div className="mb-6 sm:mb-8 lg:mb-10 w-full min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
            Platform Settings
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl">
            Manage your profile, language, and universal accessibility
            preferences.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-12 w-full">
          {/* ── Tab Rail ───────────────────────────────────── */}
          {/* 
                        Mobile: horizontal scrollable pill row
                        Tablet+: horizontal with wrapping
                        Desktop (lg+): vertical sidebar
                    */}
          <nav
            aria-label="Settings sections"
            className="flex flex-row lg:flex-col gap-1.5 sm:gap-2 w-full lg:w-56 xl:w-64 shrink-0 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-200 lg:pr-6 xl:pr-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 scrollbar-none"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? "true" : undefined}
                className={`flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all text-left flex-shrink-0 lg:w-full ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50 lg:bg-transparent"
                  }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* ── Content area ───────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 sm:space-y-8 lg:space-y-10 w-full">
            {/* General Preferences — always show */}
            <section aria-labelledby="general-heading">
              <SectionHeading
                id="general-heading"
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="5" />
                    <path d="M3.5 8h9M8 3c-1.5 2-1.5 6 0 10M8 3c1.5 2 1.5 6 0 10" />
                  </svg>
                }
                title="General Preferences"
              />
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                <label
                  htmlFor="language-select"
                  className="text-sm font-bold text-slate-900 block mb-1"
                >
                  Preferred Language
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Choose your primary language for the platform interface and AI
                  tutoring.
                </p>
                <Dropdown
                  id="language-select"
                  value={language}
                  onChange={handleLanguageChange}
                  options={[
                    "English (US)",
                    "English (UK)",
                    "Hindi",
                    "Spanish",
                    "French",
                    "German",
                    "Arabic",
                  ]}
                  className="w-full sm:w-48"
                />
              </div>
            </section>

            {/* ── Accessibility tab ──────────────────────── */}
            {activeTab === "accessibility" && (
              <section
                aria-labelledby="a11y-heading"
                className="space-y-6 sm:space-y-8 w-full"
              >
                <SectionHeading
                  id="a11y-heading"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <circle
                        cx="8"
                        cy="2.5"
                        r="1.5"
                        fill="currentColor"
                        stroke="none"
                      />
                      <path
                        d="M4 5.5h8M8 6.5V14M5.5 14l2.5-3 2.5 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  title="Accessibility Settings"
                />

                {/* Live Preview Banner */}
                <div className="bg-[#040d21] rounded-2xl overflow-hidden border border-[#00e5ff]/50 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10 xl:gap-12 w-full shadow-2xl">
                  {/* Left copy */}
                  <div className="flex-1 min-w-0 w-full flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                      <span className="text-[#00e5ff] text-xs sm:text-sm font-black uppercase tracking-[0.16em]">
                        LIVE PREVIEW
                      </span>
                      <span className="bg-[#00e5ff] text-[#040d21] text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-wide leading-none">
                        HQ
                      </span>
                    </div>
                    <h3 className="text-[#00e5ff] text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-black leading-[1.05] tracking-tight mb-4 sm:mb-5">
                      This is how high-contrast text looks.
                    </h3>
                    <p className="text-white text-sm sm:text-base lg:text-lg xl:text-[20px] font-medium leading-relaxed max-w-lg">
                      Secondary information appears in white for clear
                      hierarchy.
                    </p>
                  </div>

                  {/* Right card */}
                  <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-3 sm:gap-4 justify-center">
                    <div className="bg-[#06132d] shadow-xl rounded-2xl p-5 sm:p-6 border border-[#00e5ff]/20">
                      <p className="text-[#00e5ff] text-sm sm:text-base italic font-medium mb-4 leading-relaxed">
                        "Machine learning is the study of computer algorithms
                        that improve automatically through experience."
                      </p>
                      <p className="text-[#00b8cc] text-sm font-bold tracking-wide">
                        — Accessible AI Assistant
                      </p>
                    </div>
                    <button className="bg-[#00e5ff] text-[#040d21] border-2 border-[#00e5ff] font-black uppercase tracking-[0.15em] text-sm px-6 py-3.5 rounded-xl w-full hover:bg-cyan-300 transition-colors shadow-lg shadow-[#00e5ff]/20 min-h-[3rem]">
                      SAMPLE BUTTON
                    </button>
                  </div>
                </div>

                {/* Setting modules */}
                <div className="space-y-6 sm:space-y-8 w-full">
                  {/* Visual Preferences */}
                  <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden shadow-sm w-full">
                    <div className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-6 sm:mb-7">
                        <div className="text-blue-600 bg-white shadow-sm p-2 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                          <Eye className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-slate-900">
                          Visual Preferences
                        </h2>
                      </div>

                      {/* Font Scaling */}
                      <div className="mb-6 sm:mb-8">
                        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                          <label className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                            Font Scaling
                          </label>
                          <span className="bg-sky-50 text-sky-700 text-xs font-black px-3 py-1.5 rounded-full tracking-wider">
                            {textScale}%
                          </span>
                        </div>
                        <div className="relative mb-2">
                          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                          <input
                            type="range"
                            min={100}
                            max={200}
                            step={5}
                            value={textScale}
                            onChange={(e) =>
                              setTextScale(Number(e.target.value))
                            }
                            className="w-full relative z-10 appearance-none bg-transparent accent-blue-600 h-2 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-xs font-black text-slate-400 mt-2 tracking-wider">
                          <span>100%</span>
                          <span>150%</span>
                          <span>200%</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-3">
                          Increases text size throughout the platform for better
                          readability.
                        </p>
                      </div>

                      {/* Reduced Motion */}
                      <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-3 gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm sm:text-base font-bold tracking-wide text-slate-900 mb-1">
                            Reduced Motion
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 font-medium leading-tight">
                            Minimizes animations and decorative transitions.
                          </div>
                        </div>
                        <button
                          role="switch"
                          aria-checked={reducedMotion}
                          onClick={() => setReducedMotion(!reducedMotion)}
                          className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${reducedMotion ? "bg-blue-600" : "bg-slate-300"}`}
                        >
                          <span
                            className={`inline-block h-6 w-6 sm:h-7 sm:w-7 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${reducedMotion ? "translate-x-[22px] sm:translate-x-[26px]" : "translate-x-0.5 sm:translate-x-[2px]"}`}
                          />
                          <span className="sr-only">Reduced Motion</span>
                        </button>
                      </div>

                      {/* High Contrast */}
                      <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <div className="text-sm sm:text-base font-bold tracking-wide text-slate-900">
                              High Contrast Mode
                            </div>
                            <span className="text-[0.625rem] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                              WCAG 2.2 AAA
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-500 font-medium leading-tight">
                            Forces a Deep Navy &amp; Neon Cyan color scheme.
                          </div>
                        </div>
                        <button
                          role="switch"
                          aria-checked={highContrast}
                          onClick={() => setHighContrast(!highContrast)}
                          className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${highContrast ? "bg-blue-600" : "bg-slate-300"}`}
                        >
                          <span
                            className={`inline-block h-6 w-6 sm:h-7 sm:w-7 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${highContrast ? "translate-x-[22px] sm:translate-x-[26px]" : "translate-x-0.5 sm:translate-x-[2px]"}`}
                          />
                          <span className="sr-only">High Contrast Mode</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Voice Synthesis */}
                  <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div className="text-blue-600 shrink-0">
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8a4 4 0 1 1-4 4 4 4 0 0 1 4-4zm6 9a7 7 0 0 0 0-10" />
                          </svg>
                        </div>
                        <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-slate-900">
                          Voice Synthesis
                        </h2>
                      </div>

                      <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <label className="text-sm sm:text-base font-bold text-slate-900 tracking-wide">
                            Speech Rate
                          </label>
                          <span className="text-sm font-bold text-slate-600 font-mono tracking-wider bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                            {voiceSpeed.toFixed(2)}x
                          </span>
                        </div>
                        <div className="relative mb-2">
                          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                          <input
                            type="range"
                            min={0.5}
                            max={2.5}
                            step={0.1}
                            value={voiceSpeed}
                            onChange={(e) =>
                              setVoiceSpeed(Number(e.target.value))
                            }
                            className="w-full relative z-10 appearance-none bg-transparent accent-blue-600 h-2 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-medium mt-1">
                          <span>0.5x Slow</span>
                          <span>2.5x Fast</span>
                        </div>
                      </div>

                      {/* Test Voice + Select */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex items-center justify-center gap-2 sm:w-auto px-5 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm bg-white hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-600 focus:outline-none min-h-[3rem] shrink-0">
                          <PlayCircle className="w-5 h-5" strokeWidth={2.5} />
                          Test Voice
                        </button>
                        <div className="relative flex-1 min-w-0">
                          <Dropdown
                            value="AI Assistant (Female)"
                            onChange={() => { }}
                            options={[
                              "AI Assistant (Female)",
                              "AI Assistant (Male)",
                            ]}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Caption Customization */}
                  <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div className="text-white bg-blue-600 rounded-md p-1 px-1.5 flex justify-center items-center shrink-0">
                          <span className="text-xs font-black leading-none">
                            CC
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-wide text-slate-900">
                          Caption Customization
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                        {/* Text Size */}
                        <div className="min-w-0">
                          <label className="text-sm font-black text-slate-900 block mb-2 tracking-wide">
                            Text Size
                          </label>
                          <div className="relative">
                            <Dropdown
                              value={captionTextSize}
                              onChange={setCaptionTextSize}
                              options={["Small", "Medium", "Large", "X-Large"]}
                              className="w-full"
                              style={{
                                fontSize:
                                  captionTextSize === "Small"
                                    ? "0.875rem"
                                    : captionTextSize === "Medium"
                                      ? "1rem"
                                      : captionTextSize === "Large"
                                        ? "1.125rem"
                                        : "1.25rem",
                              }}
                            />
                          </div>
                        </div>

                        {/* Text Color */}
                        <div className="min-w-0">
                          <label className="text-sm font-black text-slate-900 block mb-2 tracking-wide">
                            Text Color
                          </label>
                          <div className="flex items-center gap-3 mt-1">
                            {[
                              {
                                value: "White",
                                bg: "bg-white",
                                ring: "ring-slate-400",
                                border: "border border-slate-300",
                                label: "White text",
                              },
                              {
                                value: "Yellow",
                                bg: "bg-[#EAB308]",
                                ring: "ring-yellow-400",
                                border: "",
                                label: "Yellow text",
                              },
                              {
                                value: "Green",
                                bg: "bg-[#4ADE80]",
                                ring: "ring-green-400",
                                border: "",
                                label: "Green text",
                              },
                              {
                                value: "Cyan",
                                bg: "bg-[#22D3EE]",
                                ring: "ring-cyan-400",
                                border: "",
                                label: "Cyan text",
                              },
                            ].map(({ value, bg, ring, border, label }) => (
                              <button
                                key={value}
                                onClick={() => setCaptionTextColor(value)}
                                aria-label={label}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${bg} ${border} transition-all focus:outline-none focus:ring-2 ${ring} focus:ring-offset-2 shrink-0 ${captionTextColor === value ? "ring-[3px] ring-blue-600 ring-offset-2" : ""}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Background Opacity */}
                        <div className="min-w-0">
                          <label className="text-sm font-black text-slate-900 block mb-2 tracking-wide">
                            Background Opacity
                          </label>
                          <div className="relative">
                            <Dropdown
                              value={captionBgOpacity}
                              onChange={setCaptionBgOpacity}
                              options={["50%", "75%", "100%"]}
                              className="w-full"
                              style={{
                                opacity:
                                  captionBgOpacity === "50%"
                                    ? 0.5
                                    : captionBgOpacity === "75%"
                                      ? 0.75
                                      : 1,
                              }}
                            />
                          </div>
                        </div>

                        {/* Font Family */}
                        <div className="min-w-0">
                          <label className="text-sm font-black text-slate-900 block mb-2 tracking-wide">
                            Font Family
                          </label>
                          <div className="relative">
                            <Dropdown
                              value={captionFontFamily}
                              onChange={setCaptionFontFamily}
                              options={["Sans Serif", "OpenDyslexic"]}
                              className="w-full"
                              style={{
                                fontFamily:
                                  captionFontFamily === "OpenDyslexic"
                                    ? "'OpenDyslexic', sans-serif"
                                    : "sans-serif",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ── Sign Language & Gesture Navigation ── */}
                  <SignLanguageSection />
                </div>
              </section>
            )}

            {/* ── Visual tab ─────────────────────────────── */}
            {activeTab === "visual" && (
              <section aria-labelledby="visual-heading">
                <SectionHeading
                  id="visual-heading"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <circle cx="8" cy="8" r="2.5" />
                      <path
                        d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  title="Visual Accessibility"
                />
                <div className="space-y-3">
                  <ToggleCard
                    id="dyslexia-font"
                    checked={dyslexiaFont}
                    onChange={setDyslexiaFont}
                    label="Dyslexia Friendly Font"
                    description="Switches the typeface to one specifically designed for easier reading."
                  />
                  <ToggleCard
                    id="reduced-motion-v"
                    checked={reducedMotion}
                    onChange={setReducedMotion}
                    label="Reduced Motion"
                    description="Stops all non-essential transitions and animations to prevent vestibular triggers."
                  />
                  <ToggleCard
                    id="high-contrast-v"
                    checked={highContrast}
                    onChange={setHighContrast}
                    label="High Contrast Mode"
                    description="Forces a Deep Navy & Neon Cyan color scheme for maximum contrast."
                    badge="WCAG 2.2 AAA"
                  />

                  {highContrast && (
                    <div className="rounded-2xl bg-[#040d21] border-2 border-[#00e5ff] p-4 sm:p-5">
                      <p className="text-[#00e5ff] font-extrabold text-sm mb-2">
                        High Contrast Preview
                      </p>
                      <p className="text-[#00b8cc] text-xs mb-4">
                        Ensures a high contrast ratio with bright cyan text on a
                        deep navy background.
                      </p>
                      <button className="px-4 py-2.5 bg-[#00e5ff] border-2 border-[#00e5ff] text-[#040d21] text-xs font-black rounded-lg">
                        Sample Button
                      </button>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <label
                      htmlFor="theme-select"
                      className="text-sm font-bold text-slate-900 block mb-1"
                    >
                      Global Theme Profile
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Manually apply a specialized accessibility color profile
                      across the entire platform.
                    </p>
                    <Dropdown
                      id="theme-select"
                      value={
                        blinkitTheme === "theme-blinkit-high-contrast"
                          ? "High Contrast Theme (Blind)"
                          : blinkitTheme === "theme-blinkit-deaf"
                            ? "Visual Pulse Mode (Deaf/HoH)"
                            : blinkitTheme === "theme-blinkit-cognitive"
                              ? "Calm Learning Mode (Cognitive)"
                              : blinkitTheme === "theme-blinkit-motor"
                                ? "EasyReach Mode (Motor)"
                                : blinkitTheme === "theme-blinkit-colorblind"
                                  ? "Pattern Vision Mode (Color Blind)"
                                  : "Default Theme"
                      }
                      onChange={(val) => {
                        if (val === "High Contrast Theme (Blind)")
                          setBlinkitTheme("theme-blinkit-high-contrast");
                        else if (val === "Visual Pulse Mode (Deaf/HoH)")
                          setBlinkitTheme("theme-blinkit-deaf");
                        else if (val === "Calm Learning Mode (Cognitive)")
                          setBlinkitTheme("theme-blinkit-cognitive");
                        else if (val === "EasyReach Mode (Motor)")
                          setBlinkitTheme("theme-blinkit-motor");
                        else if (val === "Pattern Vision Mode (Color Blind)")
                          setBlinkitTheme("theme-blinkit-colorblind");
                        else setBlinkitTheme("");
                      }}
                      options={[
                        "Default Theme",
                        "High Contrast Theme (Blind)",
                        "Visual Pulse Mode (Deaf/HoH)",
                        "Calm Learning Mode (Cognitive)",
                        "EasyReach Mode (Motor)",
                        "Pattern Vision Mode (Color Blind)",
                      ]}
                      className="w-full sm:w-80"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label
                        htmlFor="text-scale-v"
                        className="text-sm font-bold text-slate-900"
                      >
                        Text Size Scaling
                      </label>
                      <span className="text-sm font-bold text-blue-600">
                        {textScale}%
                      </span>
                    </div>
                    <input
                      id="text-scale-v"
                      type="range"
                      min={100}
                      max={200}
                      step={5}
                      value={textScale}
                      onChange={(e) => setTextScale(Number(e.target.value))}
                      className="w-full accent-blue-600"
                      aria-label={`Text size: ${textScale}%`}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                      <span>100%</span>
                      <span>200% MAX</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Audio tab ──────────────────────────────── */}
            {activeTab === "audio" && (
              <section aria-labelledby="audio-heading">
                <SectionHeading
                  id="audio-heading"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="5" y="1" width="6" height="9" rx="3" />
                      <path
                        d="M2 9a6 6 0 0 0 12 0M8 15v-2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  title="Audio & Voice Synthesis"
                />
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <label
                        htmlFor="voice-speed-a"
                        className="text-sm font-bold text-slate-900"
                      >
                        Voice Synthesis Speed
                      </label>
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {voiceSpeed.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      id="voice-speed-a"
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                      className="w-full accent-blue-600"
                      aria-label={`Voice speed: ${voiceSpeed}x`}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                      <span>0.5x SLOW</span>
                      <span>2.5x FAST</span>
                    </div>
                  </div>
                  <ToggleCard
                    id="screen-reader-audio"
                    checked={screenReader}
                    onChange={setScreenReader}
                    label="Screen Reader Audio"
                    description="Enable audio output for all screen reader compatible elements."
                  />
                </div>
              </section>
            )}

            {/* ── Shortcuts tab ──────────────────────────── */}
            {activeTab === "shortcuts" && (
              <section aria-labelledby="shortcuts-heading">
                <SectionHeading
                  id="shortcuts-heading"
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="1" y="3" width="14" height="10" rx="2" />
                      <path d="M4 9h2M10 9h2M4 11.5h8" strokeLinecap="round" />
                    </svg>
                  }
                  title="Keyboard Shortcut Map"
                />

                {/* Mobile: card list; Desktop: table */}
                <div className="sm:hidden space-y-4">
                  {shortcuts.map((section) => (
                    <div
                      key={section.section}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {section.section}
                        </p>
                      </div>
                      {section.items.map((item) => (
                        <div
                          key={item.action}
                          className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-b-0"
                        >
                          <span className="text-sm text-slate-700 font-medium">
                            {item.action}
                          </span>
                          <kbd className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                            {item.keys.join(" + ")}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-sm"
                      aria-label="Keyboard shortcuts"
                    >
                      <thead className="border-b border-slate-100">
                        <tr>
                          {shortcuts.map((s) => (
                            <th
                              key={s.section}
                              scope="col"
                              colSpan={2}
                              className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-r border-slate-100 last:border-r-0"
                            >
                              {s.section}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({
                          length: Math.max(
                            ...shortcuts.map((s) => s.items.length),
                          ),
                        }).map((_, i) => (
                          <tr
                            key={i}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            {shortcuts.map((section) => {
                              const item = section.items[i];
                              return item ? (
                                <Fragment key={section.section}>
                                  <td className="px-5 py-3 text-slate-700 font-medium text-xs">
                                    {item.action}
                                  </td>
                                  <td className="px-5 py-3 text-right border-r border-slate-100 last:border-r-0">
                                    <kbd className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                      {item.keys.join(" + ")}
                                    </kbd>
                                  </td>
                                </Fragment>
                              ) : (
                                <Fragment key={section.section}>
                                  <td className="px-5 py-3" />
                                  <td className="px-5 py-3 border-r border-slate-100 last:border-r-0" />
                                </Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Save / Reset */}
            <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleReset}
                className="w-full xs:w-auto px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full xs:w-auto px-5 py-3 rounded-xl text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} ${saving ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
