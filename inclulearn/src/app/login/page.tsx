'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const emailId = useId();
    const passwordId = useId();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
        if (!form.password) e.password = 'Password is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const data = await authApi.login({ email: form.email, password: form.password });
            // Store token in cookie for middleware + localStorage for API calls
            document.cookie = `edulearn_token=${data.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
            login(data.user, data.token);
            router.push(data.user.onboardingCompleted ? '/dashboard' : '/onboarding');
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-2 text-primary font-extrabold text-2xl">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 7h16M4 12h12M4 17h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        EduLearn
                    </a>
                    <h1 className="text-2xl font-extrabold text-foreground mt-6 mb-1">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to continue your accessible learning journey.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    {/* API Error Banner */}
                    {apiError && (
                        <div role="alert" aria-live="assertive" className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive font-medium">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
                        {/* Email */}
                        <div className="mb-5">
                            <label htmlFor={emailId} className="block text-sm font-semibold text-foreground mb-1.5">
                                Email Address <span aria-hidden="true" className="text-destructive">*</span>
                            </label>
                            <input
                                id={emailId}
                                type="email"
                                autoComplete="email"
                                aria-required="true"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? `${emailId}-error` : undefined}
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.email ? 'border-destructive' : 'border-border'}`}
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p id={`${emailId}-error`} role="alert" className="mt-1.5 text-xs text-destructive font-medium">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label htmlFor={passwordId} className="block text-sm font-semibold text-foreground mb-1.5">
                                Password <span aria-hidden="true" className="text-destructive">*</span>
                            </label>
                            <input
                                id={passwordId}
                                type="password"
                                autoComplete="current-password"
                                aria-required="true"
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.password ? 'border-destructive' : 'border-border'}`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p id={`${passwordId}-error`} role="alert" className="mt-1.5 text-xs text-destructive font-medium">
                                    {errors.password}
                                </p>
                            )}
                        </div>

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
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
