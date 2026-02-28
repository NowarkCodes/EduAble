'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
    Search,
    MoreVertical,
    Video,
    Plus,
    Mic,
    Smile,
    Send,
    Edit,
    CheckCheck,
    ChevronLeft,
    Phone
} from 'lucide-react';
import Image from 'next/image';

/* ── Types ───────────────────────────────────────── */
interface Message {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
    avatar?: string;
    status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
    id: string;
    name: string;
    role: 'INSTRUCTOR' | 'PEER' | 'STUDY GROUP';
    lastMessage: string;
    time: string;
    avatar: string;
    online?: boolean;
    unread?: number;
}

/* ── Mock Data ───────────────────────────────────── */
const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        name: 'Dr. Sarah Jenkins',
        role: 'INSTRUCTOR',
        lastMessage: 'The new assignment is ready for review.',
        time: '10:45 AM',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop',
        online: true,
        unread: 2,
    },
    {
        id: '2',
        name: 'Marcus T.',
        role: 'PEER',
        lastMessage: 'Did you see the latest quiz results?',
        time: 'Yesterday',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop',
    },
    {
        id: '3',
        name: 'Design Thinking GRP',
        role: 'STUDY GROUP',
        lastMessage: 'Elena: Meeting at 3pm today?',
        time: 'Wed',
        avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&auto=format&fit=crop',
        unread: 5,
    },
];

const MOCK_MESSAGES_MAP: Record<string, Message[]> = {
    '1': [
        {
            id: 'm1-1',
            text: "Hello! I've just uploaded the resources for Module 4. Please take a look when you have a moment.",
            sender: 'other',
            time: '10:30 AM',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop',
        },
        {
            id: 'm1-2',
            text: "Thank you, Dr. Jenkins! I'll review them this afternoon. Does the assignment cover the same topics?",
            sender: 'me',
            time: '10:42 AM',
            status: 'read',
        },
        {
            id: 'm1-3',
            text: "Yes, exactly. I've also included a quick self-assessment quiz to help you prep. The new assignment is ready for you in the dashboard now.",
            sender: 'other',
            time: '10:45 AM',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop',
        },
    ],
    '2': [
        {
            id: 'm2-1',
            text: "Hey, did you finish the assignment for Module 3 yet?",
            sender: 'other',
            time: 'Yesterday',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop',
        },
        {
            id: 'm2-2',
            text: "Almost! Just stuck on the last part about high contrast modes.",
            sender: 'me',
            time: 'Yesterday',
            status: 'read',
        },
    ],
    '3': [
        {
            id: 'm3-1',
            text: "Meeting at 3pm today everyone?",
            sender: 'other',
            time: 'Wed',
            avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&auto=format&fit=crop',
        },
        {
            id: 'm3-2',
            text: "I might be 5 mins late!",
            sender: 'me',
            time: 'Wed',
            status: 'read',
        },
    ],
};

const ROLE_STYLES: Record<Conversation['role'], string> = {
    INSTRUCTOR: 'bg-blue-50 text-blue-600',
    PEER: 'bg-slate-100 text-slate-500',
    'STUDY GROUP': 'bg-orange-50 text-orange-600',
};

export default function MessagesPage() {
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState<Conversation>(MOCK_CONVERSATIONS[0]);
    const [inputText, setInputText] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Chats');
    /* On mobile, isChatOpen controls which panel is visible */
    const [isChatOpen, setIsChatOpen] = useState(false);

    // State to hold messages for the current session to simulate interactivity
    const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES_MAP);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initials = (user?.name ?? 'U')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, chatMessages]);

    function handleSelectChat(chat: Conversation) {
        setSelectedChat(chat);
        setIsChatOpen(true);
    }

    function handleSend() {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setChatMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
        }));

        setInputText('');
    }

    return (
        <DashboardLayout
            userInitials={initials}
            userName={user?.name ?? 'User'}
            userTier="Standard Account"
        >
            {/*
             * Full-height flex container.
             * On mobile  : only one panel visible at a time (list OR chat).
             * On desktop : both panels side-by-side.
             */}
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">

                {/* ─── LEFT SIDEBAR ────────────────────────────────────── */}
                <aside
                    className={[
                        /* sizing */
                        'flex flex-col shrink-0',
                        /* mobile: full-width, hide when chat open */
                        'w-full',
                        /* tablet+ : fixed width, always visible */
                        'sm:w-[340px] sm:flex sm:border-r sm:border-slate-200',
                        /* hide/show logic on mobile */
                        isChatOpen ? 'hidden sm:flex' : 'flex',
                    ].join(' ')}
                >
                    {/* Header */}
                    <div className="px-4 sm:px-6 pt-5 pb-3">
                        <div className="flex items-center justify-between mb-5">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Messages
                            </h1>
                            <button className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Edit size={18} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <Search
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 text-sm font-medium border border-transparent focus:bg-white focus:border-blue-300 outline-none transition-all"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {['All Chats', 'Computer Science', 'UI Design'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={[
                                        'px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all',
                                        activeFilter === f
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                                    ].join(' ')}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto space-y-1 px-2 sm:px-3 pb-6">
                        {MOCK_CONVERSATIONS.map((chat) => {
                            const isActive = selectedChat.id === chat.id;
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => handleSelectChat(chat)}
                                    className={[
                                        'w-full flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all text-left relative',
                                        isActive
                                            ? 'bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100'
                                            : 'hover:bg-slate-50',
                                    ].join(' ')}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-600 rounded-r-full" />
                                    )}

                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                            <Image
                                                src={chat.avatar}
                                                alt={chat.name}
                                                width={44}
                                                height={44}
                                                className="object-cover"
                                            />
                                        </div>
                                        {chat.online && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`text-sm font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {chat.name}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">
                                                {chat.time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${ROLE_STYLES[chat.role]}`}>
                                                {chat.role}
                                            </span>
                                            {chat.unread ? (
                                                <span className="ml-auto bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                                    {chat.unread}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* ─── RIGHT CHAT PANEL ────────────────────────────────── */}
                <section
                    className={[
                        'flex flex-col bg-slate-50 min-w-0',
                        /* mobile: full width, hidden unless chat open */
                        'flex-1',
                        isChatOpen ? 'flex' : 'hidden sm:flex',
                    ].join(' ')}
                >
                    {/* Chat header */}
                    <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-10">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            {/* Back button — mobile only */}
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="sm:hidden p-2 -ml-1 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                aria-label="Back to conversations"
                            >
                                <ChevronLeft size={22} />
                            </button>

                            <div className="relative shrink-0">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-blue-50 shadow-sm">
                                    <Image
                                        src={selectedChat.avatar}
                                        alt={selectedChat.name}
                                        width={44}
                                        height={44}
                                        className="object-cover"
                                    />
                                </div>
                                {selectedChat.online && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate">
                                    {selectedChat.name}
                                </h2>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                                    Online now
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                            <button className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Phone size={18} className="sm:hidden" />
                                <Video size={20} className="hidden sm:block" />
                            </button>
                            <button className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Search size={20} />
                            </button>
                            <button className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10 py-6 space-y-5">
                        <div className="flex justify-center">
                            <span className="px-4 py-1 rounded-full bg-slate-200/60 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                Today
                            </span>
                        </div>

                        {(chatMessages[selectedChat.id] || []).map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2 sm:gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}
                            >
                                {msg.sender === 'other' && (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 self-end mb-5 shadow-sm border border-slate-200">
                                        <Image
                                            src={msg.avatar!}
                                            alt=""
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div
                                    className={`flex flex-col max-w-[85%] sm:max-w-[72%] lg:max-w-[60%] ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={[
                                            'px-4 sm:px-5 py-3 sm:py-4 rounded-[20px] text-sm leading-relaxed shadow-sm',
                                            msg.sender === 'me'
                                                ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200'
                                                : 'bg-white text-slate-700 rounded-bl-none shadow-slate-200',
                                        ].join(' ')}
                                    >
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {msg.time}
                                        </span>
                                        {msg.sender === 'me' && msg.status === 'read' && (
                                            <CheckCheck size={13} className="text-blue-500" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        <div className="flex items-center gap-2 pt-2">
                            <div className="flex gap-1">
                                {[0, 0.2, 0.4].map((delay, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 italic">
                                Dr. Jenkins is typing…
                            </span>
                        </div>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="p-3 sm:p-5 bg-white border-t border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                            {/* Attachment / mic — hidden on very small screens to save space */}
                            <button className="hidden xs:flex p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0">
                                <Plus size={18} />
                            </button>
                            <button className="hidden sm:flex p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0">
                                <Mic size={18} />
                            </button>

                            {/* Text input */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message…"
                                    className="w-full pl-4 sm:pl-5 pr-11 py-3 sm:py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                                    <Smile size={20} />
                                </button>
                            </div>

                            {/* Send */}
                            <button
                                onClick={handleSend}
                                className="p-3 sm:p-3.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all shrink-0"
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        {/* WCAG badge — desktop only */}
                        <div className="hidden sm:flex justify-center mt-3">
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 2a5 5 0 0 0-5 5v2a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
                                    <path d="M19 13v-2" />
                                    <path d="M5 13v-2" />
                                </svg>
                                WCAG 2.2 Compliant Interface
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}