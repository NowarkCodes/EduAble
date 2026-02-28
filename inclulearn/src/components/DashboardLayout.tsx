'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, MessageSquare } from 'lucide-react';

/* ── Types ───────────────────────────────────────── */
export interface NavItemType {
    label: string;
    icon: any;
    href: string;
    onClick?: () => void;
    isActive?: boolean;
}

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

const defaultNavItems: NavItemType[] = [
    { label: 'Dashboard', icon: GridIcon, href: '/dashboard' },
    { label: 'My Courses', icon: BookIcon, href: '/courses' },
    { label: 'All Courses', icon: BookIcon, href: '/allcourses' },
    { label: 'Progress', icon: BarIcon, href: '/progress' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Settings', icon: GearIcon, href: '/settings' },
    { label: 'Profile', icon: UserIcon, href: '/profile' },
];

/* ── Sidebar ─────────────────────────────────────── */
function Sidebar({ userInitials, userName, userTier, items, onLogout }: { userInitials: string; userName: string; userTier: string; items: NavItemType[]; onLogout: () => void }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-52 min-h-screen bg-white mobile-drawer-bg border-r border-slate-200 py-6 px-3 fixed left-0 top-0 z-40">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-3 mb-8 text-slate-900 font-extrabold text-lg tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
                    <LogoIcon />
                </div>
                EduAble
            </Link>

            {/* Nav */}
            <nav aria-label="Main navigation" className="flex flex-col gap-1 flex-1">
                {items.map(({ label, icon: Icon, href, onClick, isActive }) => {
                    // Use active prop if provided (for SPA tabs), otherwise fallback to pathname matching
                    const active = isActive !== undefined ? isActive : ((pathname === href) || (pathname.startsWith(href + '/') && href !== '/'));

                    const commonClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-left
                                ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

                    if (onClick) {
                        return (
                            <button key={label} onClick={onClick} className={commonClasses} aria-current={active ? 'page' : undefined}>
                                <Icon size={16} />
                                {label}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={label}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={commonClasses}
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
                    onClick={onLogout}
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
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white mobile-drawer-bg border-b border-slate-200 sticky top-0 z-30">
            <Link href="/" className="flex items-center gap-2 text-slate-900 font-extrabold tracking-tight">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <LogoIcon />
                </div>
                <span className="text-base">EduAble</span>
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
function MobileDrawer({ open, onClose, userInitials, userName, userTier, items, onLogout }: { open: boolean; onClose: () => void; userInitials: string; userName: string; userTier: string; items: NavItemType[]; onLogout: () => void }) {
    const pathname = usePathname();

    if (!open) return null;
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} aria-hidden="true" />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-72 bg-white mobile-drawer-bg dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 md:hidden flex flex-col shadow-2xl overflow-y-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 mobile-drawer-bg dark:bg-slate-950">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {userInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userTier}</p>
                        </div>
                    </div>
                    {/* Close Button Inside Drawer */}
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 ml-2"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex flex-col gap-1 flex-1">
                    {items.map(({ label, icon: Icon, href, onClick, isActive }) => {
                        const active = isActive !== undefined ? isActive : ((pathname === href) || (pathname.startsWith(href + '/') && href !== '/'));

                        const commonClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-left
                  ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

                        if (onClick) {
                            return (
                                <button key={label} onClick={() => { onClick(); onClose(); }} className={commonClasses} aria-current={active ? 'page' : undefined}>
                                    <Icon size={16} />
                                    {label}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={label}
                                href={href}
                                onClick={onClose}
                                aria-current={active ? 'page' : undefined}
                                className={commonClasses}
                            >
                                <Icon size={18} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section (Logout) */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 mobile-drawer-bg dark:bg-slate-950">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                        <LogoutIcon />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}


/* ── Layout ──────────────────────────────────────── */
interface DashboardLayoutProps {
    children: React.ReactNode;
    userInitials?: string;
    userName?: string;
    userTier?: string;
    navItems?: NavItemType[];
}

export default function DashboardLayout({
    children,
    userInitials = 'U',
    userName = 'User',
    userTier = 'Standard Account',
    navItems = defaultNavItems
}: DashboardLayoutProps) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // ── Session Protection ───────────────────────────
    // If loading is finished and no user exists, kick them to login
    useEffect(() => {
        if (!loading && !user) {
            const isNgoPath = pathname.startsWith('/ngo-dashboard') || pathname === '/ngo';
            router.push(isNgoPath ? '/ngo' : '/login');
        }
    }, [user, loading, router, pathname]);

    const handleLogout = () => {
        const isNgo = user?.role === 'ngo' || user?.role === 'admin';
        logout();
        router.push(isNgo ? '/ngo' : '/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Desktop sidebar */}
            <Sidebar userInitials={userInitials} userName={userName} userTier={userTier} items={navItems} onLogout={handleLogout} />

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
                items={navItems}
                onLogout={handleLogout}
            />

            {/* Main content */}
            <main className="md:ml-52 min-h-screen">
                {children}
            </main>
        </div >
    );
}
