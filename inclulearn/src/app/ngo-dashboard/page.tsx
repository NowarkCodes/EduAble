/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Dropdown from '@/components/Dropdown';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout, { NavItemType } from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Library, Settings, BookOpen, MessageCircle, Send, ChevronLeft, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function NgoDashboard() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'course-creation' | 'video-upload' | 'video-list' | 'settings' | 'messages'>('dashboard');

  const [stats, setStats] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    totalDonations: 45231,
    activeCampaigns: 5,
  });

  const [videoSubject, setVideoSubject] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [downloadableAudio, setDownloadableAudio] = useState<{ url: string; name: string } | null>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [cloudVideos, setCloudVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<any>(null);

  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    thumbnail: '',
  });
  const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
  const [probedDuration, setProbedDuration] = useState<number | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseCreationStatus, setCourseCreationStatus] = useState('');

  /* ── Chat / Ticket state ───────────────────────────────────────────── */
  interface ChatMessage {
    _id: string;
    sender: string;
    senderName: string;
    senderRole: string;
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

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const STATUS_META: Record<string, { label: string; color: string }> = {
    open:        { label: 'Open',        color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    resolved:    { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700' },
    closed:      { label: 'Closed',      color: 'bg-slate-100 text-slate-500' },
  };
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [ngoTypers, setNgoTypers] = useState<{ userId: string; name: string; role: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const ngoTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTickets = async () => {
    if (!token) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: Ticket) => t._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch { /* non-fatal */ } finally { setLoadingTickets(false); }
  };

  useEffect(() => {
    if (activeTab === 'messages') loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab !== 'messages' || !selectedTicket) return;
    const iv = setInterval(loadTickets, 5000);
    // Poll typing every 2s
    const typingIv = setInterval(async () => {
      if (!token || !selectedTicket) return;
      try {
        const r = await fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/typing`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();
        if (r.ok) setNgoTypers(d.typers || []);
      } catch { /* non-fatal */ }
    }, 2000);
    return () => { clearInterval(iv); clearInterval(typingIv); setNgoTypers([]); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedTicket?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages?.length, ngoTypers.length]);

  const handleSendMsg = async () => {
    if (!chatInput.trim() || !selectedTicket || !token) return;
    const text = chatInput.trim();
    setChatInput('');
    setSendingMsg(true);
    // Stop typing signal on send
    if (ngoTypingTimeoutRef.current) clearTimeout(ngoTypingTimeoutRef.current);
    fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/typing`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId,
      sender: user?.id || '',
      senderName: user?.name || 'NGO',
      senderRole: 'ngo',
      message: text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, tempMsg] } : prev);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(prev => prev ? {
          ...prev,
          messages: prev.messages.map(m => m._id === tempId ? data.message : m),
          status: data.ticket.status,
          ngo: data.ticket.ngo || prev.ngo,
        } : prev);
      }
    } catch { /* non-fatal */ } finally { setSendingMsg(false); }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicket(data.ticket);
        setTickets(prev => prev.map(t => t._id === selectedTicket._id ? data.ticket : t));
      }
    } catch { /* non-fatal */ }
  };

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  const handleChatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    if (!token || !selectedTicket) return;
    fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/typing`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    if (ngoTypingTimeoutRef.current) clearTimeout(ngoTypingTimeoutRef.current);
    ngoTypingTimeoutRef.current = setTimeout(() => {
      if (!token || !selectedTicket) return;
      fetch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/typing`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }, 2500);
  };

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ngo' && user.role !== 'admin'))) {
      router.push('/ngo');
    }
  }, [user, loading, router]);

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
  }, []);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(300); // 5 min default if error
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      setAudioFile(null);
      setUploadStatus('');
      setDownloadableAudio(null);
      setConversionProgress(0);
      setIsUploadSuccess(false);

      // Probe duration early
      try {
        const dur = await getVideoDuration(file);
        setProbedDuration(dur);
      } catch (err) {
        console.error('Error probing duration:', err);
        setProbedDuration(null);
      }
    }
  };

  const processUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) { setUploadStatus('Please select a video file first.'); return; }

    setIsProcessing(true);
    setUploadStatus('Step 1: Extracting audio locally in your browser to save cloud costs...');

    try {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }: { message: string }) => console.log('[FFmpeg]', message));
      ffmpeg.on('progress', ({ progress }: { progress: number }) => setConversionProgress(Math.round(progress * 100)));

      if (!ffmpeg.loaded) {
        setUploadStatus('Loading internal conversion engine (one-time load)...');
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      setUploadStatus('Step 1: Extracting and compressing audio to MP3 locally...');
      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp3';
      await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));
      await ffmpeg.exec(['-i', inputFileName, '-q:a', '0', '-map', 'a', outputFileName]);
      const audioData = await ffmpeg.readFile(outputFileName) as Uint8Array;
      const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/mp3' });
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      const safeBaseName = videoFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
      const finalName = `${safeBaseName}.mp3`;
      const extractedAudio = new File([audioBlob], finalName, { type: 'audio/mp3' });
      setAudioFile(extractedAudio);

      const reader = new FileReader();
      reader.onload = () => setDownloadableAudio({ url: reader.result as string, name: finalName });
      reader.readAsDataURL(audioBlob);

      setUploadStatus(`Step 2: Requesting secure Google Cloud upload links for ${videoFile.name}...`);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const presignedRes = await fetch(`${baseUrl}/api/ngo/upload-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFileName: videoFile.name, audioFileName: finalName,
          videoType: videoFile.type || 'video/mp4', audioType: 'audio/mp3',
          duration: probedDuration,
          hasTranscript: !!transcriptFile,
        }),
      });
      if (!presignedRes.ok) throw new Error('Failed to generate secure Google Cloud upload URLs');
      const { videoUrl, audioUrl, transcriptUrl, cloudTranscriptName } = await presignedRes.json();

      setUploadStatus(`Step 3: Direct Cloud Uploading (Bypassing Server)... Sending files in parallel to GCS.`);
      const videoHeaders: any = { 'Content-Type': videoFile.type || 'video/mp4' };

      const uploadPromises = [
        fetch(videoUrl, { method: 'PUT', body: videoFile, headers: videoHeaders }),
        fetch(audioUrl, { method: 'PUT', body: extractedAudio, headers: { 'Content-Type': 'audio/mp3' } }),
      ];

      if (transcriptFile && transcriptUrl) {
        uploadPromises.push(fetch(transcriptUrl, { method: 'PUT', body: transcriptFile, headers: { 'Content-Type': 'text/plain' } }));
      }

      const uploadResults = await Promise.all(uploadPromises);
      if (uploadResults.some(res => !res.ok)) throw new Error('Failed to stream files to Google Cloud Storage.');

      setUploadStatus('✅ Upload Complete! AI Whisper model triggered.');
      setIsUploadSuccess(true);
    } catch (error) {
      console.error('Extraction/Upload error:', error);
      setUploadStatus('❌ Error during extraction or upload. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${baseUrl}/api/ngo/stats`)
      .then(res => res.json())
      .then(data => { if (!data.error) setStats(prev => ({ ...prev, ...data })); })
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'video-list' || activeTab === 'course-creation') {
      setIsLoadingVideos(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${baseUrl}/api/ngo/videos`)
        .then(res => res.json())
        .then(data => {
          if (data.videos) {
            const sorted = data.videos.sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
            setCloudVideos(sorted);
          }
        })
        .catch(err => console.error('Error fetching videos:', err))
        .finally(() => setIsLoadingVideos(false));
    }
  }, [activeTab]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.category || selectedVideos.length === 0) {
      setCourseCreationStatus('Please fill all required fields and select at least one video.');
      return;
    }
    setIsCreatingCourse(true);
    setCourseCreationStatus('Creating course...');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/ngo/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || document.cookie.split('EduAble_token=')[1]?.split(';')[0]}`,
        },
        body: JSON.stringify({ ...courseForm, videos: selectedVideos }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create course');
      setCourseCreationStatus('✅ Course created successfully!');
      setCourseForm({ title: '', description: '', category: '', level: 'Beginner', thumbnail: '' });
      setSelectedVideos([]);
      setTimeout(() => setCourseCreationStatus(''), 5000);
    } catch (err: any) {
      setCourseCreationStatus('❌ Error: ' + err.message);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  if (loading || !user || (user.role !== 'ngo' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#1a56db]/20 border-t-[#1a56db] rounded-full" />
      </div>
    );
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'N';
  const displayName = user?.name || 'NGO Partner';

  const ngoNavItems: NavItemType[] = [
    { label: 'Dashboard',      icon: LayoutDashboard, href: '#', isActive: activeTab === 'dashboard',       onClick: () => setActiveTab('dashboard') },
    { label: 'Create Course',  icon: BookOpen,        href: '#', isActive: activeTab === 'course-creation', onClick: () => setActiveTab('course-creation') },
    { label: 'Video Upload',   icon: Video,           href: '#', isActive: activeTab === 'video-upload',    onClick: () => setActiveTab('video-upload') },
    { label: 'Video Library',  icon: Library,         href: '#', isActive: activeTab === 'video-list',      onClick: () => setActiveTab('video-list') },
    { label: 'Student Messages', icon: MessageCircle, href: '#', isActive: activeTab === 'messages',        onClick: () => setActiveTab('messages') },
    { label: 'Settings',       icon: Settings,        href: '#', isActive: activeTab === 'settings',        onClick: () => setActiveTab('settings') },
  ];

  // Tab label for mobile header
  const activeLabel = ngoNavItems.find(n => n.isActive)?.label ?? 'Dashboard';

  return (
    <DashboardLayout
      userInitials={initials}
      userName={displayName}
      userTier="NGO Partner Account"
      navItems={ngoNavItems}
    >

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 xl:p-12 flex flex-col gap-6 sm:gap-8 overflow-y-auto">
        <header className="mb-2 sm:mb-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Welcome back, Partner!
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Manage your inclusive educational content and view learner statistics.
          </p>
        </header>

        {/* ── Dashboard Tab ─────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            <section className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6" aria-label="Key Metrics">
              {[
                { title: 'Total Users Registered', value: stats.totalUsers, note: 'Real-time from Database' },
                { title: 'Learners Onboarded', value: stats.onboardedUsers, note: 'Real-time from Database' },
                { title: 'Total Donations', value: `$${stats.totalDonations}`, note: '↑ 12.5% from last month' },
                { title: 'Active Campaigns', value: stats.activeCampaigns, note: '1 ending soon' },
              ].map(card => (
                <div
                  key={card.title}
                  className="bg-white p-5 sm:p-6 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(112,144,176,0.15)]"
                  tabIndex={0}
                >
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1a56db] to-[#0ea5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <h3 className="text-xs sm:text-sm text-[#a3aed1] font-semibold uppercase tracking-wide mb-2 leading-snug">{card.title}</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-[#2b3674] mb-2">{card.value}</p>
                  <span className="text-xs sm:text-sm font-medium text-[#05cd99]">{card.note}</span>
                </div>
              ))}
            </section>

            <section className="bg-white p-5 sm:p-6 lg:p-8 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)]" aria-labelledby="recent-activity-heading">
              <h2 id="recent-activity-heading" className="text-lg sm:text-xl font-bold text-[#2b3674] mb-4 sm:mb-6">
                Recent Activity
              </h2>
              <div className="flex flex-col gap-4 sm:gap-6">
                {[
                  { icon: '💰', title: 'New donation received', desc: 'Anonymous donor contributed $500 to the "Tech for All" campaign.', time: '2 hours ago' },
                  { icon: '👋', title: 'New learner signed up', desc: 'A new student successfully completed their accessibility onboarding profile.', time: '3 hours ago' },
                  { icon: '🎯', title: 'Campaign milestone reached', desc: '"Accessible Classrooms" reached 80% of its funding goal.', time: '1 day ago' },
                ].map((item, i, arr) => (
                  <div
                    key={item.title}
                    className={`flex items-start gap-3 sm:gap-4 transition-transform duration-200 hover:translate-x-1 ${i < arr.length - 1 ? 'pb-4 sm:pb-6 border-b border-[#e0e5f2]' : ''}`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f4f7fe] flex items-center justify-center text-xl sm:text-2xl shrink-0" aria-hidden="true">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base text-[#2b3674] font-semibold mb-0.5 sm:mb-1">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-[#a3aed1] leading-relaxed">{item.desc}</p>
                    </div>
                    <span className="text-xs sm:text-sm text-[#a3aed1] font-medium whitespace-nowrap ml-2 shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── Course Creation Tab ───────────────────────────────────── */}
        {activeTab === 'course-creation' && (
          <section className="bg-white p-5 sm:p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)]" aria-labelledby="course-creation-heading">
            <h2 id="course-creation-heading" className="text-xl sm:text-2xl font-bold text-[#2b3674] mb-2">
              Create a New Course
            </h2>
            <p className="text-[#a3aed1] text-sm sm:text-base mb-6 sm:mb-8">
              Bundle your uploaded videos into structured courses for learners.
            </p>

            <form className="flex flex-col gap-5 sm:gap-6" onSubmit={handleCreateCourse}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Left: Metadata */}
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Course Title *', id: 'course-title', type: 'input', props: { type: 'text', required: true, value: courseForm.title, onChange: (e: any) => setCourseForm({ ...courseForm, title: e.target.value }), placeholder: 'e.g. Basics of Programming' } },
                  ].map(() => null)}

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Course Title *</label>
                    <input
                      type="text" required value={courseForm.title}
                      onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. Basics of Programming"
                      className="p-3.5 sm:p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-sm sm:text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Category *</label>
                    <Dropdown
                      id="course-category"
                      value={courseForm.category}
                      onChange={(val) => setCourseForm({ ...courseForm, category: val })}
                      placeholder="Select a category..."
                      options={[
                        { label: 'Mathematics', value: 'Mathematics' },
                        { label: 'Sciences', value: 'Sciences' },
                        { label: 'Language', value: 'Language' },
                        { label: 'Life Skills', value: 'Life Skills' },
                        { label: 'Technology', value: 'Technology' },
                        { label: 'Other', value: 'Other' },
                      ]}
                      className="w-full text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Target Level</label>
                    <Dropdown
                      id="course-level"
                      value={courseForm.level}
                      onChange={(val) => setCourseForm({ ...courseForm, level: val })}
                      options={[
                        { label: 'Beginner', value: 'Beginner' },
                        { label: 'Foundations', value: 'Foundations' },
                        { label: 'Intermediate', value: 'Intermediate' },
                        { label: 'Advanced', value: 'Advanced' },
                      ]}
                      className="w-full text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Thumbnail Image URL</label>
                    <input
                      type="url" value={courseForm.thumbnail}
                      onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                      placeholder="https://..."
                      className="p-3.5 sm:p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-sm sm:text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Short Description *</label>
                    <textarea
                      required rows={4} value={courseForm.description}
                      onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="What will learners achieve in this course?"
                      className="p-3.5 sm:p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-sm sm:text-base text-[#2b3674] outline-none resize-none transition-all duration-200 focus:border-[#1a56db] w-full"
                    />
                  </div>
                </div>

                {/* Right: Video Selection */}
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-[#2b3674] text-sm">
                    Select Videos to Include ({selectedVideos.length} selected)
                  </label>
                  <div className="border border-[#e0e5f2] rounded-xl bg-[#f4f7fe] p-3 sm:p-4 h-64 sm:h-[380px] lg:h-[400px] overflow-y-auto">
                    {isLoadingVideos ? (
                      <div className="text-center text-[#a3aed1] py-10 text-sm">Loading videos from cloud...</div>
                    ) : cloudVideos.length === 0 ? (
                      <div className="text-center text-[#a3aed1] py-10 text-sm">
                        No videos found. Go to Video Upload first.
                      </div>
                    ) : (
                      <ul className="space-y-2 sm:space-y-3 m-0 p-0 list-none">
                        {cloudVideos.map((video, idx) => {
                          const isSelected = selectedVideos.find(v => v.url === video.url);
                          let displayTitle = video.name;
                          if (video.name.includes('-')) {
                            const parts = video.name.split('-');
                            parts.shift();
                            displayTitle = parts.join('-');
                          }
                          return (
                            <li
                              key={idx}
                              className={`p-2.5 sm:p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'border-[#1a56db] bg-[#1a56db]/5' : 'border-transparent bg-white hover:border-[#e0e5f2]'}`}
                              onClick={() => {
                                if (isSelected) setSelectedVideos(selectedVideos.filter(v => v.url !== video.url));
                                else setSelectedVideos([...selectedVideos, { name: displayTitle, url: video.url, cloudPath: video.cloudPath, duration: video.duration || 0, transcriptPath: video.transcriptPath || '' }]);
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input type="checkbox" checked={!!isSelected} readOnly className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db] focus:ring-[#1a56db] shrink-0" />
                                <p className="text-xs sm:text-sm font-semibold text-[#2b3674] truncate m-0">{displayTitle}</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {video.duration && video.duration > 0 ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : '--:--'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {courseCreationStatus && (
                    <div className={`p-3 rounded-xl text-xs sm:text-sm font-semibold border ${courseCreationStatus.includes('✅') ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : courseCreationStatus.includes('❌') ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]' : 'bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]'}`}>
                      {courseCreationStatus}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreatingCourse || selectedVideos.length === 0}
                    className="mt-auto w-full text-white border-0 p-3.5 sm:p-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 bg-[#1a56db] hover:shadow-[0_4px_12px_rgba(26,86,219,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCourse ? 'Creating Course...' : 'Create Course'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* ── Video Upload Tab ─────────────────────────────────────── */}
        {activeTab === 'video-upload' && (
          <section className="bg-white p-5 sm:p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)]" aria-labelledby="upload-video-heading">
            <h2 id="upload-video-heading" className="text-xl sm:text-2xl font-bold text-[#2b3674] mb-2">
              Upload New Educational Content
            </h2>
            <p className="text-[#a3aed1] text-sm sm:text-base mb-6 sm:mb-8">
              Upload lectures or tutorials. Our AI will automatically generate captions and sign language variants to ensure WCAG compliance.
            </p>

            {!isUploadSuccess ? (
              <>
                <form className="flex flex-col gap-5 sm:gap-6" onSubmit={processUpload}>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-title" className="font-semibold text-[#2b3674] text-sm">Video Title</label>
                    <input
                      type="text" id="video-title" placeholder="e.g. Introduction to Basic Mathematics" required
                      className="p-3.5 sm:p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] text-sm sm:text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db]/10 focus:bg-white w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-subject" className="font-semibold text-[#2b3674] text-sm">Subject / Category</label>
                    <Dropdown
                      id="video-subject" value={videoSubject} onChange={setVideoSubject}
                      placeholder="Select a category..."
                      options={[
                        { label: 'Mathematics', value: 'math' },
                        { label: 'Sciences', value: 'science' },
                        { label: 'Languages', value: 'language' },
                        { label: 'Life Skills', value: 'life-skills' },
                        { label: 'Other', value: 'other' },
                      ]}
                      className="w-full text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-topic" className="font-semibold text-[#2b3674] text-sm">Topic Description</label>
                    <textarea
                      id="video-topic" rows={4} required
                      placeholder="Provide a brief description of what this video covers..."
                      className="p-3.5 sm:p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] text-sm sm:text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db]/10 focus:bg-white w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Video File (MP4, WebM)</label>
                    <input type="file" accept="video/mp4,video/webm" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                    <div
                      className={`border-2 border-dashed ${videoFile ? 'border-[#05cd99] bg-[#05cd99]/5' : 'border-[#1a56db] bg-[#1a56db]/[0.03]'} rounded-2xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-all duration-200 hover:bg-[#1a56db]/[0.06] hover:-translate-y-0.5`}
                      role="button" tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Click to select a video file or drag and drop it here"
                    >
                      <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 inline-block" aria-hidden="true">{videoFile ? '🎬' : '📁'}</span>
                      <div className="text-[#2b3674] font-semibold mb-1 sm:mb-2 text-sm sm:text-base break-all">
                        {videoFile ? videoFile.name : 'Click to select a video file or drag and drop here'}
                      </div>
                      <div className="text-[#a3aed1] text-xs sm:text-sm">
                        {videoFile ? `Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP4 or WebM (Max. 500MB)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Transcript File (.txt, .srt) (Optional)</label>
                    <input type="file" accept=".txt,.srt" className="hidden" ref={transcriptInputRef} onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setTranscriptFile(e.target.files[0]);
                      }
                    }} />
                    <div
                      className={`border-2 border-dashed ${transcriptFile ? 'border-[#05cd99] bg-[#05cd99]/5' : 'border-[#1a56db] bg-[#1a56db]/[0.03]'} rounded-2xl p-4 sm:p-5 lg:p-6 text-center cursor-pointer transition-all duration-200 hover:bg-[#1a56db]/[0.06] hover:-translate-y-0.5`}
                      role="button" tabIndex={0}
                      onClick={() => transcriptInputRef.current?.click()}
                    >
                      <span className="text-2xl sm:text-3xl mb-2 inline-block" aria-hidden="true">{transcriptFile ? '📄' : '📝'}</span>
                      <div className="text-[#2b3674] font-semibold mb-1 text-xs sm:text-sm break-all">
                        {transcriptFile ? transcriptFile.name : 'Click to select a transcript file (.txt / .srt)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Accessibility Options (Auto-generated)</label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-1 text-[#2b3674] text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db]" />
                        <span>Auto-Generate Closed Captions (CC)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db]" />
                        <span>Generate Audio Description</span>
                      </label>
                    </div>
                  </div>

                  {uploadStatus && (
                    <div className={`p-3.5 sm:p-4 rounded-xl text-xs sm:text-sm font-semibold border relative overflow-hidden ${uploadStatus.includes('✅') ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : uploadStatus.includes('❌') ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]' : 'bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]'}`}>
                      {conversionProgress > 0 && conversionProgress < 100 && (
                        <div className="absolute top-0 left-0 h-full bg-[#1a56db]/10 transition-all duration-300" style={{ width: `${conversionProgress}%` }} />
                      )}
                      <div className="relative z-10">
                        {uploadStatus}{conversionProgress > 0 && conversionProgress < 100 && ` (${conversionProgress}%)`}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit" disabled={isProcessing}
                    className={`text-white border-0 p-3.5 sm:p-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 mt-2 sm:mt-4 ${isProcessing ? 'bg-[#a3aed1] cursor-not-allowed' : 'bg-[#1a56db] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(26,86,219,0.3)] active:translate-y-0'}`}
                  >
                    {isProcessing ? 'Processing in Browser...' : 'Upload and Process Video'}
                  </button>
                </form>

                {downloadableAudio && (
                  <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[20px] shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎵</div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#16a34a] mb-2">Audio Extracted Successfully!</h3>
                    <p className="text-[#2b3674] mb-4 sm:mb-6 text-xs sm:text-sm max-w-lg">
                      The audio track was extracted and compressed into a small <code className="bg-white px-1.5 py-0.5 rounded text-[#16a34a] font-bold">.mp3</code> completely inside your browser using FFmpeg WebAssembly.
                    </p>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = downloadableAudio.url;
                        a.download = downloadableAudio.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="bg-[#16a34a] text-white border-0 cursor-pointer px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
                    >
                      Download {downloadableAudio.name}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 sm:px-6 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f0fdf4] rounded-full flex items-center justify-center text-[#16a34a] text-4xl sm:text-5xl mb-4 sm:mb-6 shadow-[0_4px_24px_rgba(22,163,74,0.15)]">
                  ✓
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#2b3674] mb-3 sm:mb-4">Upload Successful!</h3>
                <p className="text-[#a3aed1] text-sm sm:text-base mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
                  Your video and locally extracted <strong className="text-[#2b3674]">.mp3</strong> audio have been securely uploaded to Google Cloud. The AI Whisper model has been triggered.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  {downloadableAudio && (
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = downloadableAudio.url;
                        a.download = downloadableAudio.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="bg-[#16a34a] text-white border-0 cursor-pointer px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-[0_4px_12px_rgba(22,163,74,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      🎵 Download Generated MP3
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsUploadSuccess(false);
                      setVideoFile(null); setAudioFile(null);
                      setTranscriptFile(null);
                      setUploadStatus(''); setDownloadableAudio(null);
                      setConversionProgress(0);
                    }}
                    className="bg-white text-[#1a56db] border-2 border-[#1a56db] cursor-pointer px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-sm transition-all duration-200 hover:bg-[#f4f7fe] hover:-translate-y-0.5"
                  >
                    + Upload Another Video
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Video Library Tab ─────────────────────────────────────── */}
        {activeTab === 'video-list' && (
          <section className="bg-white p-5 sm:p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)]" aria-labelledby="video-library-heading">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h2 id="video-library-heading" className="text-xl sm:text-2xl font-bold text-[#2b3674] mb-1 sm:mb-2">
                  Content Library
                </h2>
                <p className="text-[#a3aed1] text-sm sm:text-base">
                  Manage all videos successfully processed and uploaded.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('video-upload')}
                className="bg-[#1a56db] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm hover:bg-[#1a56db]/90 cursor-pointer border-none transition-transform hover:-translate-y-0.5 shrink-0 self-start xs:self-auto"
              >
                + New Upload
              </button>
            </div>

            {isLoadingVideos ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#1a56db]/20 border-t-[#1a56db] rounded-full animate-spin mb-3 sm:mb-4" />
                <p className="text-[#a3aed1] font-medium text-sm sm:text-base">Fetching videos from Google Cloud...</p>
              </div>
            ) : cloudVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-[#e0e5f2] rounded-2xl px-4">
                <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-50">📂</span>
                <p className="text-[#a3aed1] font-medium text-base sm:text-lg mb-1 sm:mb-2">No videos found</p>
                <p className="text-[#a3aed1] text-xs sm:text-sm mb-4 sm:mb-6 max-w-sm">Upload your first inclusive educational video to see it here.</p>
                <button
                  onClick={() => setActiveTab('video-upload')}
                  className="bg-[#f4f7fe] text-[#1a56db] border-none font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl cursor-pointer hover:bg-[#e4ebfc] transition-colors text-sm"
                >
                  Go to Uploader
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {cloudVideos.map((video, idx) => {
                  let displayTitle = video.name;
                  if (video.name.includes('-')) {
                    const parts = video.name.split('-');
                    parts.shift();
                    displayTitle = parts.join('-');
                  }
                  const sizeMB = video.size ? (parseInt(video.size) / 1024 / 1024).toFixed(2) : '0.00';
                  const uploadDate = video.updated ? new Date(video.updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';

                  return (
                    <div key={idx} className="border border-[#e0e5f2] rounded-2xl overflow-hidden hover:shadow-[0_4px_20px_rgba(112,144,176,0.12)] transition-shadow duration-300 bg-white group flex flex-col">
                      <div className="h-28 sm:h-36 bg-[#f4f7fe] flex items-center justify-center border-b border-[#e0e5f2] relative group-hover:bg-[#1a56db]/5 transition-colors">
                        <span className="text-3xl sm:text-4xl">▶️</span>
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white text-[#1a56db] text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm">
                          MP4
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <h4 className="text-[#2b3674] font-bold text-sm sm:text-lg leading-tight mb-1 sm:mb-2 truncate" title={displayTitle}>
                          {displayTitle}
                        </h4>
                        <div className="flex items-center flex-wrap text-[#a3aed1] text-xs sm:text-sm mb-3 sm:mb-4 gap-2 sm:gap-3">
                          <span>⏱️ {uploadDate}</span>
                          <span>💾 {sizeMB} MB</span>
                        </div>
                        <div className="mt-auto">
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-[#05cd99] bg-[#05cd99]/10 py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-md w-fit">
                            <span>✓</span> Captions Ready
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {/* ── Messages Tab ────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <section className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] overflow-hidden flex flex-col" style={{ minHeight: '70vh' }}>
            <div className="flex flex-1 overflow-hidden" style={{ minHeight: '70vh' }}>

              {/* Left: Ticket List */}
              <div className={`w-full sm:w-[320px] border-r border-[#e0e5f2] flex flex-col ${mobileChat ? 'hidden sm:flex' : 'flex'}`}>
                <div className="p-4 sm:p-5 border-b border-[#e0e5f2]">
                  <h2 className="text-lg font-bold text-[#2b3674] flex items-center gap-2">
                    <MessageCircle size={20} className="text-[#1a56db]" /> Student Tickets
                  </h2>
                  <p className="text-xs text-[#a3aed1] mt-0.5">Reply to student support queries</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#f4f7fe]">
                  {loadingTickets ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-[#a3aed1]">
                      <div className="w-8 h-8 border-4 border-[#e0e5f2] border-t-[#1a56db] rounded-full animate-spin" />
                      <p className="text-sm">Loading tickets…</p>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 px-6 text-center">
                      <MessageCircle size={32} className="text-[#e0e5f2]" />
                      <p className="text-sm text-[#a3aed1] font-medium">No student tickets yet</p>
                    </div>
                  ) : tickets.map((ticket) => {
                    const isActive = selectedTicket?._id === ticket._id;
                    const meta = STATUS_META[ticket.status];
                    const lastMsg = ticket.messages[ticket.messages.length - 1];
                    const unread = ticket.messages.filter((m: any) => m.senderRole === 'student' && !m.isRead).length;
                    return (
                      <button
                        key={ticket._id}
                        onClick={() => { setSelectedTicket(ticket); setMobileChat(true); }}
                        className={`w-full flex items-start gap-3 p-4 text-left transition-all border-l-4 ${
                          isActive ? 'bg-[#f4f7fe] border-l-[#1a56db]' : 'hover:bg-[#f4f7fe] border-l-transparent'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                          {ticket.student.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-sm font-bold text-[#2b3674] truncate">{ticket.subject}</p>
                            <span className="text-[10px] text-[#a3aed1] shrink-0">{fmtTime(ticket.lastMessageAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                            <span className="text-[10px] text-[#a3aed1] truncate">{ticket.student.name}</span>
                          </div>
                          {lastMsg && (
                            <p className="text-xs text-[#a3aed1] truncate">{lastMsg.message}</p>
                          )}
                        </div>
                        {unread > 0 && (
                          <span className="w-5 h-5 bg-[#1a56db] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Chat Panel */}
              <div className={`flex-1 flex flex-col min-w-0 ${mobileChat ? 'flex' : 'hidden sm:flex'}`}>

                {!selectedTicket ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#f4f7fe] flex items-center justify-center">
                      <MessageCircle size={36} className="text-[#1a56db]/40" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2b3674] mb-1">Select a ticket</p>
                      <p className="text-sm text-[#a3aed1]">Choose a student ticket from the left to start chatting</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="h-16 sm:h-[72px] bg-white border-b border-[#e0e5f2] flex items-center justify-between px-4 sm:px-6 shrink-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setMobileChat(false)} className="sm:hidden p-2 rounded-xl text-[#a3aed1] hover:bg-[#f4f7fe]">
                          <ChevronLeft size={20} />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
                          {selectedTicket.student.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-bold text-[#2b3674] text-sm">{selectedTicket.student.name}</p>
                          <p className="text-xs text-[#a3aed1] truncate max-w-[200px]">{selectedTicket.subject}</p>
                        </div>
                      </div>
                      {/* Status changer */}
                      <div className="flex items-center gap-2">
                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                          <button
                            onClick={() => handleUpdateStatus('resolved')}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] text-[#16a34a] text-xs font-bold rounded-xl border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors"
                          >
                            <CheckCircle size={13} /> Mark Resolved
                          </button>
                        )}
                        <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_META[selectedTicket.status].color}`}>
                          {selectedTicket.status === 'open' && <Clock size={11} />}
                          {selectedTicket.status === 'in_progress' && <AlertCircle size={11} />}
                          {selectedTicket.status === 'resolved' && <CheckCircle size={11} />}
                          {selectedTicket.status === 'closed' && <XCircle size={11} />}
                          {STATUS_META[selectedTicket.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-4 bg-[#f4f7fe]">
                      <div className="flex justify-center mb-2">
                        <span className="bg-white text-[#a3aed1] text-[10px] font-bold px-4 py-1.5 rounded-full border border-[#e0e5f2]">
                          Ticket opened {new Date(selectedTicket.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {selectedTicket.messages.map((msg: any, i: number) => {
                        const isMe = msg.senderRole === 'ngo' || msg.senderRole === 'admin';
                        return (
                          <div key={msg._id ?? i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 self-end mb-5 ${
                              isMe ? 'bg-gradient-to-br from-[#1a56db] to-[#0ea5e9]' : 'bg-gradient-to-br from-[#a3aed1] to-[#8592b0]'
                            }`}>
                              {isMe ? (user?.name?.[0]?.toUpperCase() ?? 'N') : (selectedTicket.student.name?.[0]?.toUpperCase() ?? '?')}
                            </div>
                            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                              {!isMe && (
                                <span className="text-[10px] font-bold text-[#a3aed1] mb-1 px-1">{msg.senderName} · Student</span>
                              )}
                              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe
                                  ? 'bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] text-white rounded-br-none'
                                  : 'bg-white text-[#2b3674] rounded-bl-none border border-[#e0e5f2]'
                              }`}>
                                {msg.message}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 px-1">
                                <span className="text-[10px] text-[#a3aed1] font-medium">{fmtTime(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing indicator bubble */}
                      {ngoTypers.length > 0 && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a3aed1] to-[#8592b0] flex items-center justify-center text-white font-bold text-xs shrink-0 self-end">
                            {ngoTypers[0]?.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-[#a3aed1] mb-1 px-1">
                              {ngoTypers[0]?.name ?? '...'} &middot; {ngoTypers[0]?.role === 'student' ? 'Student' : 'NGO'}
                            </span>
                            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-[#e0e5f2] shadow-sm flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#a3aed1]" style={{ animation: 'bounce 1.2s infinite 0ms' }} />
                              <span className="w-2 h-2 rounded-full bg-[#a3aed1]" style={{ animation: 'bounce 1.2s infinite 200ms' }} />
                              <span className="w-2 h-2 rounded-full bg-[#a3aed1]" style={{ animation: 'bounce 1.2s infinite 400ms' }} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                      <div className="p-4 bg-white border-t border-[#e0e5f2] shrink-0">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={handleChatInput}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()}
                            placeholder="Reply to student…"
                            className="flex-1 px-4 py-3 rounded-xl bg-[#f4f7fe] border border-transparent focus:bg-white focus:border-[#1a56db] outline-none text-sm font-medium transition-all"
                          />
                          <button
                            onClick={handleSendMsg}
                            disabled={!chatInput.trim() || sendingMsg}
                            className="p-3 rounded-xl bg-[#1a56db] text-white hover:bg-[#1a56db]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            {sendingMsg
                              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <Send size={18} />
                            }
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <button
                            onClick={() => handleUpdateStatus('resolved')}
                            className="sm:hidden flex items-center gap-1 text-xs font-bold text-[#16a34a] bg-[#f0fdf4] px-3 py-1.5 rounded-xl border border-[#bbf7d0]"
                          >
                            <CheckCircle size={12} /> Mark Resolved
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('closed')}
                            className="flex items-center gap-1 text-xs font-bold text-[#a3aed1] hover:text-[#dc2626] transition-colors ml-auto"
                          >
                            <XCircle size={12} /> Close Ticket
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white border-t border-[#e0e5f2] text-center text-sm text-[#a3aed1] font-medium">
                        This ticket is {selectedTicket.status}.
                        <button onClick={() => handleUpdateStatus('open')} className="ml-2 text-[#1a56db] hover:underline font-bold">Reopen</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        )}

      </main>
    </DashboardLayout>
  );
}