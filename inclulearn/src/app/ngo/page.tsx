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
        <div className="min-h-screen bg-[#f4f7fe] flex text-[#2b3674] font-sans">
            {/* Left side - Decorative */}
            <div className="hidden lg:flex w-1/2 bg-[#1a56db] relative flex-col justify-center items-center overflow-hidden p-12">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white opacity-10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#05cd99] opacity-20 blur-[80px]" />
                
                <div className="relative z-10 max-w-lg text-white">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm text-sm font-bold mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-[#05cd99]"></span>
                        EduAble Backoffice
                    </div>
                    <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Inclusive</span> Education.
                    </h1>
                    <p className="text-xl text-blue-100/80 leading-relaxed mb-12">
                        Upload accessible courses, manage student progress, and utilize server-side AI for automatic WCAG compliance.
                    </p>
                    
                    {/* Visual Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="font-bold text-lg">Platform Status</h3>
                            <span className="bg-[#05cd99]/20 text-[#05cd99] px-3 py-1 rounded-full text-xs font-bold">Online</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">🧠</div>
                                <div>
                                    <div className="text-sm font-bold">AI Processing Engine</div>
                                    <div className="text-xs text-blue-100/60">Active & Ready</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">☁️</div>
                                <div>
                                    <div className="text-sm font-bold">Cloud Storage Link</div>
                                    <div className="text-xs text-blue-100/60">Connected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 relative">
                <Link href="/" className="absolute top-6 right-6 lg:top-10 lg:right-10 text-sm font-bold text-[#a3aed1] hover:text-[#1a56db] transition-colors">
                    ← Back to Learner App
                </Link>

                <div className="w-full max-w-md">
                    <div className="text-center lg:text-left mb-10">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6 lg:mx-0 mx-auto">
                            E
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-2">NGO Portal {mode === 'login' ? 'Login' : 'Registration'}</h2>
                        <p className="text-[#a3aed1]">Secure access for educators and administrators.</p>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium font-sans">
                            {apiError}
                        </div>
                    )}

                    <div className="flex p-1 bg-[#f4f7fe] rounded-xl mb-8 border border-[#e0e5f2]">
                        <button
                            onClick={() => { setMode('login'); setErrors({}); setApiError(''); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-[#1a56db] shadow-sm' : 'text-[#a3aed1] hover:text-[#2b3674]'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode('register'); setErrors({}); setApiError(''); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-white text-[#1a56db] shadow-sm' : 'text-[#a3aed1] hover:text-[#2b3674]'}`}
                        >
                            Register NGO
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {mode === 'register' && (
                            <div className="mb-5">
                                <label htmlFor={nameId} className="block text-sm font-bold mb-1.5">NGO / Organization Name</label>
                                <input
                                    id={nameId} type="text"
                                    value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    className={`w-full h-12 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56db]/50 ${errors.name ? 'border-red-400' : 'border-[#e0e5f2]'}`}
                                />
                                {errors.name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>}
                            </div>
                        )}

                        <div className="mb-5">
                            <label htmlFor={emailId} className="block text-sm font-bold mb-1.5">Work Email Address</label>
                            <input
                                id={emailId} type="email"
                                value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                className={`w-full h-12 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56db]/50 ${errors.email ? 'border-red-400' : 'border-[#e0e5f2]'}`}
                            />
                            {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div className="mb-6">
                            <label htmlFor={passwordId} className="block text-sm font-bold mb-1.5">Password</label>
                            <input
                                id={passwordId} type="password"
                                value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                className={`w-full h-12 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56db]/50 ${errors.password ? 'border-red-400' : 'border-[#e0e5f2]'}`}
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        {mode === 'register' && (
                            <div className="mb-8">
                                <label htmlFor={confirmPasswordId} className="block text-sm font-bold mb-1.5">Confirm Password</label>
                                <input
                                    id={confirmPasswordId} type="password"
                                    value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    className={`w-full h-12 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56db]/50 ${errors.confirmPassword ? 'border-red-400' : 'border-[#e0e5f2]'}`}
                                />
                                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="w-full h-14 rounded-xl bg-[#1a56db] text-white font-bold text-base hover:bg-[#1a56db]/90 focus:outline-none focus:ring-4 focus:ring-[#1a56db]/20 transition-all shadow-[0_4px_12px_rgba(26,86,219,0.2)] disabled:opacity-70 flex justify-center items-center"
                        >
                            {loading ? (
                                <span className="animate-spin w-6 h-6 border-4 border-white/30 border-t-white rounded-full"></span>
                            ) : mode === 'login' ? 'Secure Login' : 'Create NGO Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
