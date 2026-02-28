'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import Link from 'next/link';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Course {
    id: string;
    title: string;
    progress?: number;
    lastAccessed?: string;
    completedDate?: string;
}

function MailIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function EditIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function AccessibilityIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" />
            <path d="M12 9v4" />
            <path d="M7 9h10" />
            <path d="M9 22l3-5 3 5" />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
        </svg>
    );
}

function TrendingUpIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
}

/* ── Edit Profile Modal ─────────────────────────────────── */
function EditProfileModal({ open, onClose, currentName, currentBio, currentPhone, token, onSaved }: {
    open: boolean;
    onClose: () => void;
    currentName: string;
    currentBio: string;
    currentPhone: string;
    token: string | null;
    onSaved: (data: { name: string; bio: string; phone: string }) => void;
}) {
    const [name, setName] = useState(currentName);
    const [bio, setBio] = useState(currentBio);
    const [phone, setPhone] = useState(currentPhone);
    const [showPw, setShowPw] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Sync fields when modal re-opens
    useEffect(() => {
        if (open) { setName(currentName); setBio(currentBio); setPhone(currentPhone); setError(''); setSuccess(false); setShowPw(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    }, [open, currentName, currentBio, currentPhone]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [open, onClose]);

    if (!open) return null;

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('Name is required.'); return; }
        if (showPw) {
            if (!currentPw) { setError('Enter your current password.'); return; }
            if (newPw.length < 8) { setError('New password must be at least 8 characters.'); return; }
            if (newPw !== confirmPw) { setError('New passwords do not match.'); return; }
        }
        setSaving(true);
        try {
            const body: Record<string, string> = { name, bio, phone };
            if (showPw && currentPw && newPw) { body.currentPassword = currentPw; body.newPassword = newPw; }
            const res = await fetch(`${BACKEND}/api/profile/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            setSuccess(true);
            onSaved({ name: data.user.name, bio: data.bio, phone: data.phone });
            setTimeout(onClose, 1000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit profile">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

            {/* Panel */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
                    <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="ep-name" className="block text-sm font-bold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input id="ep-name" type="text" value={name} onChange={e => setName(e.target.value)} maxLength={100}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="Your full name"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="ep-bio" className="block text-sm font-bold text-slate-700 mb-1.5">Bio <span className="text-slate-400 font-normal">(optional)</span></label>
                        <textarea id="ep-bio" value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                            placeholder="Tell us a bit about yourself…"
                        />
                        <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/300</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="ep-phone" className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                        <input id="ep-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    {/* Change Password toggle */}
                    <div className="pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => setShowPw(v => !v)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors focus:outline-none"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            {showPw ? 'Cancel password change' : 'Change Password'}
                        </button>
                        {showPw && (
                            <div className="mt-4 space-y-3">
                                {[{ id: 'ep-cur-pw', label: 'Current Password', val: currentPw, set: setCurrentPw, show: showCurrent, toggle: setShowCurrent }, { id: 'ep-new-pw', label: 'New Password (min 8 chars)', val: newPw, set: setNewPw, show: showNew, toggle: setShowNew }, { id: 'ep-conf-pw', label: 'Confirm New Password', val: confirmPw, set: setConfirmPw, show: showNew, toggle: setShowNew }].map(({ id, label, val, set, show, toggle }) => (
                                    <div key={id}>
                                        <label htmlFor={id} className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                                        <div className="relative">
                                            <input id={id} type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button type="button" onClick={() => toggle(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{show ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}</svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error / Success */}
                    {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
                    {success && <p role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>Profile updated!</p>}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} aria-busy={saving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, token } = useAuth();
    const {
        screenReader, setScreenReader,
        highContrast, setHighContrast,
        dyslexiaFont, setDyslexiaFont
    } = useAccessibility();

    const [inProgress, setInProgress] = useState<Course[]>([]);
    const [completed, setCompleted] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

    // Editable profile data
    const [profileData, setProfileData] = useState({ name: '', bio: '', phone: '' });

    // Fetch extra profile fields (bio, phone) on mount
    useEffect(() => {
        if (!token || !user) return;
        fetch(`${BACKEND}/api/profile/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.profile) {
                    setProfileData({
                        name: user.name || '',
                        bio: data.profile.bio || '',
                        phone: data.profile.contactNumber || '',
                    });
                } else {
                    setProfileData({ name: user.name || '', bio: '', phone: '' });
                }
            })
            .catch(() => setProfileData({ name: user.name || '', bio: '', phone: '' }));
    }, [token, user]);

    // Keep name in sync when user loads
    useEffect(() => {
        if (user?.name) setProfileData(p => ({ ...p, name: user.name }));
    }, [user?.name]);


    const fetchCourses = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND}/api/courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                setInProgress(json.inProgress ?? []);
                setCompleted(json.completed ?? []);
            }
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        } finally {
            setLoadingCourses(false);
        }
    }, [token]);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    const displayName = profileData.name || user?.name || 'Guest User';
    const email = user?.email ?? 'No email associated';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';


    return (
        <DashboardLayout userInitials={initials} userName={displayName} userTier="Standard Account">
            {/* Edit Profile Modal */}
            <EditProfileModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                currentName={profileData.name || displayName}
                currentBio={profileData.bio}
                currentPhone={profileData.phone}
                token={token}
                onSaved={(data) => setProfileData(data)}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border border-slate-200 shadow-sm text-center sm:text-left">
                    {/* Avatar — initials circle */}
                    <div className="w-24 h-24 rounded-full bg-blue-600 flex-shrink-0 border-4 border-white shadow-md flex items-center justify-center">
                        <span className="text-white text-3xl font-black select-none">{initials}</span>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{displayName}</h1>
                        {profileData.bio && (
                            <p className="text-sm text-slate-600 mb-2 max-w-md">{profileData.bio}</p>
                        )}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <MailIcon /><span>{email}</span>
                            </div>
                            {profileData.phone && (
                                <div className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    <span>{profileData.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setEditOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 w-full sm:w-auto mt-4 sm:mt-0 justify-center"
                    >
                        <EditIcon />
                        Edit Profile
                    </button>
                </div>

                {/* Middle Row: Preferences & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                    {/* Accessibility Preferences */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <AccessibilityIcon />
                            Accessibility Preferences
                        </h2>

                        <div className="flex-1 flex flex-col min-h-[0]">
                            {[
                                { label: "Screen Reader Mode", value: screenReader, onChange: setScreenReader, icon: "AD›" },
                                { label: "High Contrast", value: highContrast, onChange: setHighContrast, icon: "◑" },
                                { label: "Dyslexia Font", value: dyslexiaFont, onChange: setDyslexiaFont, icon: "A" },
                            ].map(({ label, value, onChange, icon }, i, arr) => (
                                <div key={label} className={`flex items-center py-4 ${i !== arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 mr-4 flex-shrink-0">
                                        {icon}
                                    </span>
                                    <span className="flex-1 text-base font-semibold text-slate-700">{label}</span>
                                    <Toggle enabled={value} onChange={onChange} />
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-sm text-slate-400 italic">
                            Settings are automatically applied to your learning dashboard and courses.
                        </p>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-full">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrophyIcon />
                            Achievements
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                                <div className="text-4xl font-black text-blue-600 mb-1">12</div>
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Courses Finished</div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
                                <div className="text-4xl font-black text-blue-600 mb-1">4</div>
                                <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">Certificates</div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-4 mt-auto">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-xl font-bold">⚡</div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">★</div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-xl font-bold">📅</div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl"><LockIcon /></div>
                        </div>
                    </div>
                </div>

                {/* Learning Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUpIcon />
                            Learning Progress
                        </h2>
                        <Link href="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View All My Courses</Link>
                    </div>

                    {loadingCourses ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-100 animate-pulse rounded-2xl h-48 border border-slate-200" />
                            <div className="bg-slate-100 animate-pulse rounded-2xl h-48 border border-slate-200" />
                        </div>
                    ) : inProgress.length === 0 && completed.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
                            <p>You haven't started any courses yet.</p>
                            <Link href="/allcourses" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Explore Courses</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* In Progress Cards */}
                            {inProgress.slice(0, 2).map(course => (
                                <div key={`in-prog-${course.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                    <div className="bg-blue-100/50 p-6 pb-5">
                                        <span className="inline-block bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">In Progress</span>
                                        <h3 className="text-xl font-extrabold text-slate-800">{course.title}</h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-slate-600">Course Completion</span>
                                            <span className="text-lg font-black text-blue-600 leading-none">{course.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-sm text-slate-400 truncate pr-2">Last accessed: {course.lastAccessed}</span>
                                            <Link href={`/courses/${course.id}`} className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors shrink-0">
                                                Continue <ArrowRightIcon />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Completed Cards */}
                            {completed.slice(0, Math.max(0, 2 - inProgress.slice(0, 2).length)).map(course => (
                                <div key={`comp-${course.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                                    <div className="bg-emerald-100/50 p-6 pb-5">
                                        <div className="absolute top-5 right-5">
                                            <CheckCircleIcon />
                                        </div>
                                        <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-3">Completed</span>
                                        <h3 className="text-xl font-extrabold text-emerald-900">{course.title}</h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-slate-600">Course Completion</span>
                                            <span className="text-lg font-black text-emerald-600 leading-none">100%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-sm text-slate-400 truncate pr-2">Completed on: {new Date(course.completedDate || '').toLocaleDateString()}</span>
                                            <Link href={`/courses/${course.id}`} className="text-sm font-bold text-slate-700 flex items-center gap-1.5 hover:text-slate-900 transition-colors shrink-0">
                                                Review
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}