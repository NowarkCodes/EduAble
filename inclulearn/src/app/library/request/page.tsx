'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { paymentApi, transcriptRequestApi } from '@/lib/api';
import { Headphones, FileText, Ear, SearchCode, ChevronUp, Users, ArrowRight, Lightbulb } from 'lucide-react';

/* ── MOCK DATA ───────────────────────────────────────── */
const COMMUNITY_REQUESTS = [
    { id: '1', title: 'Principles of Economics', author: 'N. Gregory Mankiw', tag: 'Braille', upvotes: 124 },
    { id: '2', title: 'The Midnight Library', author: 'Matt Haig', tag: 'Audio', upvotes: 82 },
    { id: '3', title: 'Atomic Habits', author: 'James Clear', tag: 'Large Print', upvotes: 56 },
];

export default function RequestTranscriptPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [context, setContext] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fallback typed community requests
    const [communityRequests, setCommunityRequests] = useState<any[]>(COMMUNITY_REQUESTS);

    useEffect(() => {
        // Fetch real requests
        transcriptRequestApi.list().then(res => {
            if (res.success && res.requests.length > 0) {
                setCommunityRequests(res.requests);
            }
        }).catch(err => console.error("Could not fetch requests", err));
    }, []);

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    const formats = [
        { id: 'audio', label: 'Audio', icon: Headphones },
        { id: 'text', label: 'Text', icon: FileText },
        { id: 'braille', label: 'Braille', icon: Ear },
        { id: 'large_print', label: 'Large Print', icon: SearchCode },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Create Order
            const orderRes = await paymentApi.createOrder();
            if (!orderRes.success) throw new Error("Could not create order");

            // 2. Initialize Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy_key_id',
                amount: orderRes.order.amount,
                currency: orderRes.order.currency,
                name: "EduAble",
                description: "AI Transcript Generation Request",
                order_id: orderRes.order.id,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment and Save Request
                        const verifyRes = await paymentApi.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            title,
                            author,
                            format: selectedFormat,
                            context
                        });

                        if (verifyRes.success) {
                            setIsSubmitting(false);
                            setIsSuccess(true);
                            setTitle(''); setAuthor(''); setContext(''); setSelectedFormat(null);

                            // 4. Redirect to library after short delay
                            setTimeout(() => {
                                router.push('/library');
                            }, 2000);
                        }
                    } catch (err) {
                        console.error("Payment verification failed", err);
                        setIsSubmitting(false);
                        alert("Payment verification failed! Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#2563eb" // Tailwind blue-600
                },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                    }
                }
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment failed: " + response.error.description);
                setIsSubmitting(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Error initiating payment", err);
            setIsSubmitting(false);
            alert("Could not initialize payment window.");
        }
    };

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-32">

                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-4">
                        <Link href="/library" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-blue-600">Request a Transcript</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Request a Transcript</h1>
                    <p className="text-base text-slate-600 max-w-2xl font-medium">
                        Help us expand our accessible library. Request new content or formats for books and learning materials.
                    </p>
                </div>

                {/* Two-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN: Request Form */}
                    <div className="flex-1 w-full bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Transcript Details</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title & Author Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Book/Story Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. The Great Gatsby"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Author/Source</label>
                                    <input
                                        type="text"
                                        required
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="e.g. F. Scott Fitzgerald"
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Format Selection Grid */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-3">Preferred Format</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {formats.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setSelectedFormat(id)}
                                            className={`aspect-square sm:aspect-auto sm:h-28 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all ${selectedFormat === id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-600/10 scale-[1.02]'
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                                                }`}
                                        >
                                            <Icon size={28} strokeWidth={selectedFormat === id ? 2.5 : 2} />
                                            <span className="font-bold text-sm tracking-wide">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Context Box */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Additional Context (Optional)</label>
                                <textarea
                                    rows={4}
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="Describe why you need this or any specific requirements..."
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 font-medium resize-none"
                                />
                            </div>

                            {/* Submit Area */}
                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={!title || !author || !selectedFormat || isSubmitting}
                                    className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit Request'}
                                    {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
                                </button>

                                {isSuccess && (
                                    <span className="text-emerald-600 text-sm font-bold animate-pulse flex items-center gap-1.5">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        Requested via AI!
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Stats */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-6">

                        {/* Recent Community Requests */}
                        <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-6">
                            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6 tracking-tight">
                                <Users size={20} className="text-blue-600" />
                                Recent Community Requests
                            </h3>

                            <div className="space-y-4">
                                {communityRequests.map((req) => (
                                    <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:border-blue-200 transition-colors group cursor-default">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900 truncate">{req.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium truncate mb-2">{req.author}</p>
                                            <span className="inline-flex text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                {req.tag}
                                            </span>
                                        </div>
                                        <button className="flex flex-col items-center justify-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors shrink-0">
                                            <ChevronUp className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" strokeWidth={3} />
                                            <span className="text-xs font-black text-slate-700 group-hover:text-blue-700">
                                                {req.upvotes}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Link href="/library/community" className="mt-5 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5 transition-colors">
                                View all community requests
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </Link>
                        </div>

                        {/* Priority Information Banner */}
                        <div className="bg-blue-600 rounded-[28px] p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 text-white/10">
                                <Lightbulb size={120} />
                            </div>
                            <h3 className="text-lg font-extrabold flex items-center gap-2 mb-3 relative z-10">
                                <Lightbulb size={20} fill="currentColor" />
                                Did you know?
                            </h3>
                            <p className="text-sm font-medium text-blue-100 leading-relaxed relative z-10">
                                Popular requests are prioritized by our AI transcription engine. Upvoting helps the community get accessible content faster!
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
