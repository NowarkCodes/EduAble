'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
    Send, Search, Edit, ChevronLeft, Plus, MessageCircle,
    CheckCheck, Clock, CheckCircle, XCircle, AlertCircle, X
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface ChatMessage {
    _id: string;
    sender: string;
    senderName: string;
    senderRole: 'student' | 'ngo' | 'admin';
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface Ticket {
    _id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    student: { _id: string; name: string; email: string };
    ngo: { _id: string; name: string; email: string } | null;
    messages: ChatMessage[];
    lastMessageAt: string;
    createdAt: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const STATUS_META: Record<Ticket['status'], { label: string; color: string; icon: React.ReactNode }> = {
    open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: <Clock size={12} /> },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle size={12} /> },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={12} /> },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-500', icon: <XCircle size={12} /> },
};

function fmtTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ── Create Ticket Modal ────────────────────────────────────────────────── */
function CreateTicketModal({
    onClose,
    onCreated,
    token,
}: {
    onClose: () => void;
    onCreated: (t: Ticket) => void;
    token: string;
}) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND}/api/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create ticket');
            onCreated(data.ticket);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-extrabold text-white">Create Support Ticket</h2>
                        <p className="text-blue-200 text-xs mt-0.5">Our NGO team will reply as soon as possible</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Subject</label>
                        <input
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. I can't access Lesson 3"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Describe your issue</label>
                        <textarea
                            required
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us what's going wrong in detail so we can help you faster..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none transition-all"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !subject.trim() || !message.trim()}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                        >
                            {loading ? 'Creating…' : 'Create Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function MessagesPage() {
    const { user, token } = useAuth();
    const initials = (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
    const [typers, setTypers] = useState<{ userId: string; name: string; role: string }[]>([]);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /* ── Load tickets ─────────────────────────────────────────────────── */
    const loadTickets = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BACKEND}/api/tickets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setTickets(data.tickets || []);
                // If a ticket is selected, refresh its messages too
                if (selectedTicket) {
                    const updated = (data.tickets || []).find((t: Ticket) => t._id === selectedTicket._id);
                    if (updated) setSelectedTicket(updated);
                }
            }
        } catch { /* non-fatal */ } finally {
            setLoadingTickets(false);
        }
    }, [token, selectedTicket]);

    useEffect(() => {
        loadTickets();
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Poll for new messages every 5 seconds when a ticket is open */
    useEffect(() => {
        if (selectedTicket) {
            const iv = setInterval(loadTickets, 5000);
            setPollingInterval(iv);

            // Poll typing status every 2s
            const typingIv = setInterval(async () => {
                if (!token || !selectedTicket) return;
                try {
                    const r = await fetch(`${BACKEND}/api/tickets/${selectedTicket._id}/typing`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const d = await r.json();
                    if (r.ok) setTypers(d.typers || []);
                } catch { /* non-fatal */ }
            }, 2000);

            return () => { clearInterval(iv); clearInterval(typingIv); setTypers([]); };
        } else {
            if (pollingInterval) clearInterval(pollingInterval);
            setPollingInterval(null);
            setTypers([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTicket?._id]);

    /* Auto-scroll */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.messages?.length, typers.length]);

    /* Emit typing signal to backend */
    const emitTyping = useCallback(async () => {
        if (!token || !selectedTicket) return;
        try {
            await fetch(`${BACKEND}/api/tickets/${selectedTicket._id}/typing`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { /* non-fatal */ }
    }, [token, selectedTicket]);

    const stopTyping = useCallback(async () => {
        if (!token || !selectedTicket) return;
        try {
            await fetch(`${BACKEND}/api/tickets/${selectedTicket._id}/typing`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { /* non-fatal */ }
    }, [token, selectedTicket]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        emitTyping();
        // Auto-stop typing signal after 2.5s of no keystroke
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(stopTyping, 2500);
    };

    /* ── Send message ─────────────────────────────────────────────────── */
    async function handleSend() {
        if (!inputText.trim() || !selectedTicket || !token) return;
        const text = inputText.trim();
        setInputText('');
        setSending(true);

        // Stop typing indicator immediately on send
        stopTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Optimistic update
        const tempMsg: ChatMessage = {
            _id: `temp-${Date.now()}`,
            sender: user?.id || '',
            senderName: user?.name || 'You',
            senderRole: user?.role as ChatMessage['senderRole'],
            message: text,
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev);

        try {
            const res = await fetch(`${BACKEND}/api/tickets/${selectedTicket._id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            if (res.ok) {
                // Replace temp with real
                setSelectedTicket(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        messages: prev.messages.map(m => m._id === tempMsg._id ? data.message : m),
                        status: data.ticket.status,
                        ngo: data.ticket.ngo,
                    };
                });
                setTickets(prev => prev.map(t => t._id === selectedTicket._id
                    ? { ...t, messages: [...t.messages.filter(m => m._id !== tempMsg._id), data.message], lastMessageAt: data.message.timestamp }
                    : t
                ));
            }
        } catch { /* non-fatal */ } finally {
            setSending(false);
        }
    }

    /* ── Helpers ──────────────────────────────────────────────────────── */
    const myId = user?.id || '';
    const filtered = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.ngo?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const unreadCount = (t: Ticket) =>
        t.messages.filter(m => m.sender !== myId && !m.isRead).length;

    return (
        <DashboardLayout userInitials={initials} userName={user?.name ?? 'User'} userTier="Standard Account">

            {showCreate && token && (
                <CreateTicketModal
                    token={token}
                    onClose={() => setShowCreate(false)}
                    onCreated={(ticket) => {
                        setTickets(prev => [ticket, ...prev]);
                        setSelectedTicket(ticket);
                        setIsChatOpen(true);
                        setShowCreate(false);
                    }}
                />
            )}

            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">

                {/* ── LEFT SIDEBAR ──────────────────────────────────────────── */}
                <aside className={[
                    'flex flex-col shrink-0 w-full sm:w-[360px] border-r border-slate-200',
                    isChatOpen ? 'hidden sm:flex' : 'flex',
                ].join(' ')}>

                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support Chat</h1>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                            >
                                <Plus size={14} /> New Ticket
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search tickets…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Ticket List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {loadingTickets ? (
                            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-sm font-medium">Loading tickets…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-16 flex flex-col items-center gap-4 px-6 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <MessageCircle size={28} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 mb-1">No tickets yet</p>
                                    <p className="text-sm text-slate-400">Create a support ticket and our NGO team will help you</p>
                                </div>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    + Create First Ticket
                                </button>
                            </div>
                        ) : (
                            filtered.map((ticket) => {
                                const isActive = selectedTicket?._id === ticket._id;
                                const unread = unreadCount(ticket);
                                const meta = STATUS_META[ticket.status];
                                const lastMsg = ticket.messages[ticket.messages.length - 1];

                                return (
                                    <button
                                        key={ticket._id}
                                        onClick={() => { setSelectedTicket(ticket); setIsChatOpen(true); }}
                                        className={[
                                            'w-full flex items-start gap-3 p-4 text-left transition-all relative',
                                            isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent',
                                        ].join(' ')}
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shrink-0 mt-0.5">
                                            {ticket.ngo ? (ticket.ngo.name?.[0]?.toUpperCase() ?? '?') : '?'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="font-bold text-sm text-slate-900 truncate">{ticket.subject}</p>
                                                <span className="text-[10px] font-semibold text-slate-400 shrink-0 mt-0.5">
                                                    {fmtTime(ticket.lastMessageAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>
                                                    {meta.icon} {meta.label}
                                                </span>
                                                {ticket.ngo && (
                                                    <span className="text-[10px] text-slate-400 font-medium truncate">
                                                        {ticket.ngo.name}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-400 truncate">
                                                {lastMsg
                                                    ? `${lastMsg.sender === myId ? 'You: ' : ''}${lastMsg.message}`
                                                    : 'No messages yet'}
                                            </p>
                                        </div>

                                        {unread > 0 && (
                                            <span className="absolute top-4 right-4 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                                {unread}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* ── RIGHT CHAT PANEL ──────────────────────────────────────── */}
                <section className={[
                    'flex-1 flex flex-col bg-slate-50 min-w-0',
                    isChatOpen ? 'flex' : 'hidden sm:flex',
                ].join(' ')}>

                    {!selectedTicket ? (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6">
                            <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center shadow-inner">
                                <MessageCircle size={40} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 mb-2">Your Support Inbox</h2>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    Select a ticket from the left to continue chatting, or create a new one to get help from our NGO team.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                <Plus size={16} /> Create Support Ticket
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsChatOpen(false)}
                                        className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm">
                                        {selectedTicket.ngo ? (selectedTicket.ngo.name?.[0]?.toUpperCase() ?? '?') : '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                                            {selectedTicket.subject}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_META[selectedTicket.status].color}`}>
                                                {STATUS_META[selectedTicket.status].icon}
                                                {STATUS_META[selectedTicket.status].label}
                                            </span>
                                            {selectedTicket.ngo && (
                                                <span className="text-[10px] text-slate-400">
                                                    Assigned to {selectedTicket.ngo.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => loadTickets()}
                                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    title="Refresh"
                                >
                                    <Edit size={18} />
                                </button>
                            </header>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 space-y-4">

                                {/* Ticket info banner */}
                                <div className="flex justify-center">
                                    <div className="bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full text-center max-w-sm">
                                        Ticket created {new Date(selectedTicket.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                                        {!selectedTicket.ngo && ' · Waiting for NGO to respond'}
                                    </div>
                                </div>

                                {selectedTicket.messages.map((msg, i) => {
                                    const isMe = msg.sender === myId;
                                    const isNgo = msg.senderRole === 'ngo' || msg.senderRole === 'admin';
                                    return (
                                        <div key={msg._id ?? i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            {/* Avatar */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 self-end mb-5 shadow-sm ${isNgo ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                                                {isMe ? initials : (isNgo ? (selectedTicket.ngo?.name?.[0]?.toUpperCase() ?? 'N') : (msg.senderName?.[0]?.toUpperCase() ?? 'U'))}
                                            </div>

                                            <div className={`flex flex-col max-w-[80%] sm:max-w-[68%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                                        {isNgo ? `${msg.senderName} · NGO Support` : msg.senderName}
                                                    </span>
                                                )}
                                                <div className={[
                                                    'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm',
                                                    isMe
                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                        : isNgo
                                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-bl-none'
                                                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-100',
                                                ].join(' ')}>
                                                    {msg.message}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">{fmtTime(msg.timestamp)}</span>
                                                    {isMe && <CheckCheck size={12} className="text-blue-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing indicator bubble */}
                                {typers.length > 0 && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xs shrink-0 self-end">
                                            {typers[0]?.name?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                                {typers[0]?.name ?? '...'} · {typers[0]?.role === 'ngo' || typers[0]?.role === 'admin' ? 'NGO Support' : 'Student'}
                                            </span>
                                            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-slate-400" style={{ animation: 'bounce 1.2s infinite 0ms' }} />
                                                <span className="w-2 h-2 rounded-full bg-slate-400" style={{ animation: 'bounce 1.2s infinite 200ms' }} />
                                                <span className="w-2 h-2 rounded-full bg-slate-400" style={{ animation: 'bounce 1.2s infinite 400ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shrink-0">
                                    <div className="flex items-center gap-3 max-w-4xl mx-auto">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={inputText}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                placeholder="Type a message…"
                                                className="w-full pl-5 pr-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputText.trim() || sending}
                                            className="p-3 sm:p-3.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {sending
                                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                : <Send size={18} />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white border-t border-slate-100 text-center text-sm text-slate-400 font-medium">
                                    This ticket is {selectedTicket.status}. Create a new ticket if you need further help.
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}