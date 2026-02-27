'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

/* ── SVG Icons ───────────────────────────────────── */
function GridIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
    );
}
function BookIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2 3h5a1 1 0 0 1 1 1v9a1 1 0 0 0-1-1H2V3zM14 3H9a1 1 0 0 0-1 1v9a1 1 0 0 1 1-1h5V3z" />
        </svg>
    );
}
function BarIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="9" width="3" height="6" rx="1" /><rect x="6" y="5" width="3" height="10" rx="1" />
            <rect x="11" y="1" width="3" height="14" rx="1" />
        </svg>
    );
}
function GearIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" strokeLinecap="round" />
        </svg>
    );
}
function LogoIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h10M3 15h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}
function LogoutIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h6" strokeLinecap="round" />
            <path d="M11 5l3 2.5-3 2.5M14 7.5H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function MenuIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="19" y2="6" /><line x1="3" y1="11" x2="19" y2="11" /><line x1="3" y1="16" x2="19" y2="16" />
        </svg>
    );
}
function CloseIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="4" x2="18" y2="18" /><line x1="18" y1="4" x2="4" y2="18" />
        </svg>
    );
}

const navItems = [
    { label: 'Dashboard', icon: GridIcon, href: '/dashboard' },
    { label: 'My Courses', icon: BookIcon, href: '/courses' },
    { label: 'Progress', icon: BarIcon, href: '/progress' },
    { label: 'Settings', icon: GearIcon, href: '/settings' },
];

/* ── Sidebar ─────────────────────────────────────── */
function Sidebar({ userInitials, userName, userTier }: { userInitials: string; userName: string; userTier: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    return (
        <aside className="hidden md:flex flex-col w-52 min-h-screen bg-white border-r border-slate-200 py-6 px-3 fixed left-0 top-0 z-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-3 mb-8 text-slate-900 font-extrabold text-lg tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                    <LogoIcon />
                </div>
                LearnAI
            </Link>

            {/* Nav */}
            <nav aria-label="Main navigation" className="flex flex-col gap-1 flex-1">
                {navItems.map(({ label, icon: Icon, href }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={label}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${active
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="pt-4 border-t border-slate-200 mt-4 space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white font-bold text-xs">
                        {userInitials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate">{userTier}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogoutIcon />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

/* ── Mobile top bar ──────────────────────────────── */
function MobileTopBar({ userInitials, onMenuToggle, menuOpen }: { userInitials: string; onMenuToggle: () => void; menuOpen: boolean }) {
    return (
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
            <Link href="/" className="flex items-center gap-2 text-slate-900 font-extrabold tracking-tight">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <LogoIcon />
                </div>
                <span className="text-base">LearnAI</span>
            </Link>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {userInitials}
                </div>
                <button
                    onClick={onMenuToggle}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    className="p-1 rounded-md text-slate-700 hover:bg-slate-100"
                >
                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
            </div>
        </div>
    );
}

/* ── Mobile drawer ───────────────────────────────── */
function MobileDrawer({ open, onClose, userInitials, userName, userTier }: { open: boolean; onClose: () => void; userInitials: string; userName: string; userTier: string }) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    if (!open) return null;
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} aria-hidden="true" />
            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-64 bg-white z-50 md:hidden flex flex-col py-6 px-3 shadow-2xl">
                <div className="flex items-center gap-3 px-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {userInitials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                        <p className="text-xs text-slate-500 truncate">{userTier}</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ label, icon: Icon, href }) => {
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={label}
                                href={href}
                                onClick={onClose}
                                aria-current={active ? 'page' : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
                  ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 mt-4 rounded-lg text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogoutIcon />
                    Sign Out
                </button>
            </div>
        </>
    );
}

/* ── Bottom Mobile Nav ───────────────────────────── */
function BottomNav() {
    const pathname = usePathname();
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex" aria-label="Mobile navigation">
            {navItems.map(({ label, icon: Icon, href }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                    <Link
                        key={label}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[10px] font-bold gap-1 transition-colors
              ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        <Icon size={20} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

/* ── Layout ──────────────────────────────────────── */
interface DashboardLayoutProps {
    children: React.ReactNode;
    userInitials?: string;
    userName?: string;
    userTier?: string;
}

export default function DashboardLayout({
    children,
    userInitials = 'U',
    userName = 'User',
    userTier = 'Standard Account',
}: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Desktop sidebar */}
            <Sidebar userInitials={userInitials} userName={userName} userTier={userTier} />

            {/* Mobile top bar */}
            <MobileTopBar
                userInitials={userInitials}
                onMenuToggle={() => setMobileMenuOpen(v => !v)}
                menuOpen={mobileMenuOpen}
            />

            {/* Mobile drawer */}
            <MobileDrawer
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                userInitials={userInitials}
                userName={userName}
                userTier={userTier}
            />

            {/* Bottom nav (mobile only) */}
            <BottomNav />

            {/* Main content */}
            <main className="md:ml-52 min-h-screen pb-20 md:pb-0">
                {children}
            </main>
        </div>
    );
}
