'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function NGOPortalPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const emailId = useId();
    const passwordId = useId();
    const nameId = useId();
    const confirmPasswordId = useId();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (mode === 'register' && !form.name.trim()) e.name = 'NGO Name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
        if (!form.password) e.password = 'Password is required.';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
        if (mode === 'register' && form.password !== form.confirmPassword) {
            e.confirmPassword = 'Passwords do not match.';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;

        setLoading(true);
        try {
            let data;
            if (mode === 'login') {
                data = await authApi.ngoLogin({ email: form.email, password: form.password });
            } else {
                data = await authApi.ngoRegister({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword,
                });
            }

            // Store token in cookie for middleware + localStorage for API calls
            document.cookie = `EduAble_token=${data.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
            login(data.user, data.token);
            
            // Send NGOs straight to their dashboard portal
            router.push('/ngo-dashboard');
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                {/* Logo & Back */}
                <div className="text-center mb-8 relative">
                    <Link href="/" className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        ← Back to Learner App
                    </Link>
                    <div className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl mb-6">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                            E
                        </div>
                        EduAble
                    </div>
                    <h1 className="text-2xl font-extrabold text-foreground mb-1">
                        NGO Partner Portal
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Secure access for educators and administrators.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    {/* API Error Banner */}
                    {apiError && (
                        <div role="alert" aria-live="assertive" className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive font-medium">
                            {apiError}
                        </div>
                    )}

                    {/* Toggle */}
                    <div className="flex p-1 bg-muted rounded-xl mb-6 border border-border">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setErrors({}); setApiError(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('register'); setErrors({}); setApiError(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Register NGO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate aria-label={`${mode === 'login' ? 'Sign in' : 'Register'} form`}>
                        {mode === 'register' && (
                            <div className="mb-5">
                                <label htmlFor={nameId} className="block text-sm font-semibold text-foreground mb-1.5">
                                    NGO / Organization Name <span aria-hidden="true" className="text-destructive">*</span>
                                </label>
                                <input
                                    id={nameId}
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.name ? 'border-destructive' : 'border-border'}`}
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.name}</p>}
                            </div>
                        )}

                        <div className="mb-5">
                            <label htmlFor={emailId} className="block text-sm font-semibold text-foreground mb-1.5">
                                Work Email Address <span aria-hidden="true" className="text-destructive">*</span>
                            </label>
                            <input
                                id={emailId}
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.email ? 'border-destructive' : 'border-border'}`}
                                placeholder="ngo@example.com"
                            />
                            {errors.email && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.email}</p>}
                        </div>

                        <div className={mode === 'register' ? 'mb-5' : 'mb-6'}>
                            <label htmlFor={passwordId} className="block text-sm font-semibold text-foreground mb-1.5">
                                Password <span aria-hidden="true" className="text-destructive">*</span>
                            </label>
                            <input
                                id={passwordId}
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.password ? 'border-destructive' : 'border-border'}`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.password}</p>}
                        </div>

                        {mode === 'register' && (
                            <div className="mb-6">
                                <label htmlFor={confirmPasswordId} className="block text-sm font-semibold text-foreground mb-1.5">
                                    Confirm Password <span aria-hidden="true" className="text-destructive">*</span>
                                </label>
                                <input
                                    id={confirmPasswordId}
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="mt-1.5 text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Processing…
                                </span>
                            ) : mode === 'login' ? 'Secure Login' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
