'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const nameId = useId();
    const emailId = useId();
    const pwId = useId();
    const cpwId = useId();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const validate = () => {
        const e: Partial<Record<Field, string>> = {};
        if (!form.name.trim()) e.name = 'Full name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
        if (!form.password) e.password = 'Password is required.';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.';
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;
        setLoading(true);
        try {
            const data = await authApi.register(form);
            document.cookie = `EduAble_token=${data.token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
            login(data.user, data.token);
            router.push('/onboarding');
        } catch (err: unknown) {
            setApiError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fields: { id: string; label: string; key: Field; type: string; autoComplete: string; placeholder: string }[] = [
        { id: nameId, label: 'Full Name', key: 'name', type: 'text', autoComplete: 'name', placeholder: 'Ada Lovelace' },
        { id: emailId, label: 'Email Address', key: 'email', type: 'email', autoComplete: 'email', placeholder: 'ada@example.com' },
        { id: pwId, label: 'Password', key: 'password', type: 'password', autoComplete: 'new-password', placeholder: 'At least 8 characters' },
        { id: cpwId, label: 'Confirm Password', key: 'confirmPassword', type: 'password', autoComplete: 'new-password', placeholder: 'Repeat password' },
    ];

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
                        EduAble
                    </a>
                    <h1 className="text-2xl font-extrabold text-foreground mt-6 mb-1">Create your account</h1>
                    <p className="text-sm text-muted-foreground">Join 50,000+ students learning without barriers.</p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    {apiError && (
                        <div role="alert" aria-live="assertive" className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive font-medium">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
                        {fields.map((f) => (
                            <div key={f.key} className="mb-4">
                                <label htmlFor={f.id} className="block text-sm font-semibold text-foreground mb-1.5">
                                    {f.label} <span aria-hidden="true" className="text-destructive">*</span>
                                </label>
                                <input
                                    id={f.id}
                                    type={f.type}
                                    autoComplete={f.autoComplete}
                                    aria-required="true"
                                    aria-invalid={!!errors[f.key]}
                                    aria-describedby={errors[f.key] ? `${f.id}-error` : undefined}
                                    value={form[f.key]}
                                    onChange={update(f.key)}
                                    placeholder={f.placeholder}
                                    className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors[f.key] ? 'border-destructive' : 'border-border'}`}
                                />
                                {errors[f.key] && (
                                    <p id={`${f.id}-error`} role="alert" className="mt-1.5 text-xs text-destructive font-medium">
                                        {errors[f.key]}
                                    </p>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="mt-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating account…
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline focus:outline-none focus:ring-1 focus:ring-primary rounded">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
