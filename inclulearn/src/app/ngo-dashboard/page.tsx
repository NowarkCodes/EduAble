'use client';

import { useEffect, useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout, { NavItemType } from '@/components/DashboardLayout';
import { LayoutDashboard, Video, Library, Settings, BookOpen } from 'lucide-react';

export default function NgoDashboard() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'course-creation' | 'video-upload' | 'video-list' | 'settings'>('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    onboardedUsers: 0,
    totalDonations: 45231,
    activeCampaigns: 5,
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [downloadableAudio, setDownloadableAudio] = useState<{ url: string, name: string } | null>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [cloudVideos, setCloudVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<any>(null);

  // Course Creation States
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    thumbnail: '',
  });
  const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseCreationStatus, setCourseCreationStatus] = useState('');

  // Auth Guard
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ngo' && user.role !== 'admin'))) {
      router.push('/ngo');
    }
  }, [user, loading, router]);

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
      setAudioFile(null);
      setUploadStatus('');
      setDownloadableAudio(null);
      setConversionProgress(0);
      setIsUploadSuccess(false);
    }
  };

  const processUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setUploadStatus('Please select a video file first.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('Step 1: Extracting audio locally in your browser to save cloud costs...');

    try {
      // 1. Extract Audio using FFmpeg WebAssembly (Generates tiny mp3 instead of huge wav)
      const ffmpeg = ffmpegRef.current;
      
      // Add logging so you can see what FFmpeg is doing in the console
      ffmpeg.on('log', ({ message }: { message: string }) => {
        console.log('[FFmpeg]', message);
      });
      
      ffmpeg.on('progress', ({ progress, time }: { progress: number, time: number }) => {
        setConversionProgress(Math.round(progress * 100));
      });

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
      
      // Run the FFmpeg command: extract audio, convert to mp3 at 96kbps (more than enough for Whisper AI)
      await ffmpeg.exec(['-i', inputFileName, '-q:a', '0', '-map', 'a', outputFileName]);
      
      const audioData = await ffmpeg.readFile(outputFileName) as Uint8Array;
      const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/mp3' });
      
      // Clean up memory
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      // Sanitize filename to prevent browser download attribute from breaking
      const safeBaseName = videoFile.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');
      const finalName = `${safeBaseName}.mp3`;

      const extractedAudio = new File([audioBlob], finalName, { type: 'audio/mp3' });
      
      setAudioFile(extractedAudio);
      
      // Expose the audio file for local testing via Base64 Data URI to explicitly bypass Cross-Origin Isolation blocks
      const reader = new FileReader();
      reader.onload = () => {
        setDownloadableAudio({ url: reader.result as string, name: finalName });
      };
      reader.readAsDataURL(audioBlob);
      
      // 2. Request Secure Presigned Upload Links from Node.js Backend
      setUploadStatus(`Step 2: Requesting secure Google Cloud upload links for ${videoFile.name}...`);
      
      const presignedRes = await fetch('http://localhost:5000/api/ngo/upload-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoFileName: videoFile.name,
          audioFileName: finalName,
          videoType: videoFile.type || 'video/mp4',
          audioType: 'audio/mp3',
        }),
      });

      if (!presignedRes.ok) {
        throw new Error('Failed to generate secure Google Cloud upload URLs');
      }

      const { videoUrl, audioUrl, cloudVideoName, cloudAudioName } = await presignedRes.json();
      
      // 3. Direct Dual-Stream Upload to Google Cloud Storage
      setUploadStatus(`Step 3: Direct Cloud Uploading (Bypassing Server)... Sending Video (${(videoFile.size / 1024 / 1024).toFixed(2)} MB) & Compressed Audio (${(extractedAudio.size / 1024 / 1024).toFixed(2)} MB) in parallel to GCS.`);
      
      // Upload both explicitly to their respective Google Cloud buckets at the same time
      const [videoUploadRes, audioUploadRes] = await Promise.all([
        fetch(videoUrl, {
          method: 'PUT',
          body: videoFile,
          headers: { 'Content-Type': videoFile.type || 'video/mp4' },
        }),
        fetch(audioUrl, {
          method: 'PUT',
          body: extractedAudio, // This is the compressed MP3 directly from memory!
          headers: { 'Content-Type': 'audio/mp3' },
        })
      ]);

      if (!videoUploadRes.ok || !audioUploadRes.ok) {
        throw new Error('Failed to stream files to Google Cloud Storage. Ensure bucket has CORS enabled.');
      }
      
      // 4. Success Trigger
      setUploadStatus(`✅ Upload Complete! S3/GCS Event triggered the AI Whisper model on the lightweight audio track.`);
      setIsUploadSuccess(true);
    } catch (error) {
      console.error("Extraction/Upload error:", error);
      setUploadStatus('❌ Error during extraction or upload. Check console.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/ngo/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, []);

  // Fetch Videos when Video List Tab or Course Creation is active
  useEffect(() => {
    if (activeTab === 'video-list' || activeTab === 'course-creation') {
      setIsLoadingVideos(true);
      fetch('http://localhost:5000/api/ngo/videos')
        .then(res => res.json())
        .then(data => {
          if (data.videos) {
            // Sort videos by updated date descending
            const sorted = data.videos.sort((a: any, b: any) => 
               new Date(b.updated).getTime() - new Date(a.updated).getTime()
            );
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
      const response = await fetch('http://localhost:5000/api/ngo/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || document.cookie.split('EduAble_token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({
          ...courseForm,
          videos: selectedVideos
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      setCourseCreationStatus('✅ Course created successfully!');
      setCourseForm({ title: '', description: '', category: '', level: 'Beginner', thumbnail: '' });
      setSelectedVideos([]);
      
      // Clear status after a while
      setTimeout(() => setCourseCreationStatus(''), 5000);
    } catch (err: any) {
      setCourseCreationStatus('❌ Error: ' + err.message);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Prevent flash of content while checking auth
  if (loading || !user || (user.role !== 'ngo' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#1a56db]/20 border-t-[#1a56db] rounded-full"></div>
      </div>
    );
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'N';
  const displayName = user?.name || 'NGO Partner';

  const ngoNavItems: NavItemType[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '#', isActive: activeTab === 'dashboard', onClick: () => setActiveTab('dashboard') },
    { label: 'Create Course', icon: BookOpen, href: '#', isActive: activeTab === 'course-creation', onClick: () => setActiveTab('course-creation') },
    { label: 'Video Upload', icon: Video, href: '#', isActive: activeTab === 'video-upload', onClick: () => setActiveTab('video-upload') },
    { label: 'Video Library', icon: Library, href: '#', isActive: activeTab === 'video-list', onClick: () => setActiveTab('video-list') },
    { label: 'Settings', icon: Settings, href: '#', isActive: activeTab === 'settings', onClick: () => setActiveTab('settings') },
  ];

  return (
    <DashboardLayout
        userInitials={initials}
        userName={displayName}
        userTier="NGO Partner Account"
        navItems={ngoNavItems}
    >

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 flex flex-col gap-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Welcome back, Partner!
          </h1>
          <p className="text-slate-500 text-base">
            Manage your inclusive educational content and view learner statistics.
          </p>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <section
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
              aria-label="Key Metrics"
            >
              <div
                className="bg-white p-6 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(112,144,176,0.15)]"
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1a56db] to-[#0ea5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="text-sm text-[#a3aed1] font-semibold uppercase tracking-wide mb-2">Total Users Registered</h3>
                <p className="text-3xl font-bold text-[#2b3674] m-0 mb-2">{stats.totalUsers}</p>
                <span className="text-sm font-medium text-[#05cd99] flex items-center">Real-time from Database</span>
              </div>
              <div
                className="bg-white p-6 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(112,144,176,0.15)]"
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1a56db] to-[#0ea5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="text-sm text-[#a3aed1] font-semibold uppercase tracking-wide mb-2">Learners Onboarded</h3>
                <p className="text-3xl font-bold text-[#2b3674] m-0 mb-2">{stats.onboardedUsers}</p>
                <span className="text-sm font-medium text-[#05cd99] flex items-center">Real-time from Database</span>
              </div>
              <div
                className="bg-white p-6 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(112,144,176,0.15)]"
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1a56db] to-[#0ea5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="text-sm text-[#a3aed1] font-semibold uppercase tracking-wide mb-2">Total Donations</h3>
                <p className="text-3xl font-bold text-[#2b3674] m-0 mb-2">${stats.totalDonations}</p>
                <span className="text-sm font-medium text-[#05cd99] flex items-center">↑ 12.5% from last month</span>
              </div>
              <div
                className="bg-white p-6 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(112,144,176,0.15)]"
                tabIndex={0}
              >
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#1a56db] to-[#0ea5e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <h3 className="text-sm text-[#a3aed1] font-semibold uppercase tracking-wide mb-2">Active Campaigns</h3>
                <p className="text-3xl font-bold text-[#2b3674] m-0 mb-2">{stats.activeCampaigns}</p>
                <span className="text-sm font-medium text-[#05cd99] flex items-center">1 ending soon</span>
              </div>
            </section>

            {/* Recent Activity */}
            <section
              className="bg-white p-6 lg:p-8 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)]"
              aria-labelledby="recent-activity-heading"
            >
              <h2 id="recent-activity-heading" className="text-xl font-bold text-[#2b3674] mb-6">
                Recent Activity
              </h2>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4 pb-6 border-b border-[#e0e5f2] transition-transform duration-200 hover:translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#f4f7fe] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
                    💰
                  </div>
                  <div className="flex-1">
                    <h4 className="m-0 mb-1 text-base text-[#2b3674] font-semibold">New donation received</h4>
                    <p className="m-0 text-sm text-[#a3aed1] leading-relaxed">Anonymous donor contributed $500 to the "Tech for All" campaign.</p>
                  </div>
                  <span className="text-sm text-[#a3aed1] font-medium whitespace-nowrap">2 hours ago</span>
                </div>
                <div className="flex items-start gap-4 pb-6 border-b border-[#e0e5f2] transition-transform duration-200 hover:translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#f4f7fe] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
                    👋
                  </div>
                  <div className="flex-1">
                    <h4 className="m-0 mb-1 text-base text-[#2b3674] font-semibold">New learner signed up</h4>
                    <p className="m-0 text-sm text-[#a3aed1] leading-relaxed">A new student successfully completed their accessibility onboarding profile.</p>
                  </div>
                  <span className="text-sm text-[#a3aed1] font-medium whitespace-nowrap">3 hours ago</span>
                </div>
                <div className="flex items-start gap-4 pb-0 transition-transform duration-200 hover:translate-x-1">
                  <div className="w-12 h-12 rounded-xl bg-[#f4f7fe] flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
                    🎯
                  </div>
                  <div className="flex-1">
                    <h4 className="m-0 mb-1 text-base text-[#2b3674] font-semibold">Campaign milestone reached</h4>
                    <p className="m-0 text-sm text-[#a3aed1] leading-relaxed">"Accessible Classrooms" reached 80% of its funding goal.</p>
                  </div>
                  <span className="text-sm text-[#a3aed1] font-medium whitespace-nowrap">1 day ago</span>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'course-creation' && (
          <section
            className="bg-white p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] mt-2 lg:mt-4"
            aria-labelledby="course-creation-heading"
          >
            <h2 id="course-creation-heading" className="text-2xl font-bold text-[#2b3674] mb-2">
              Create a New Course
            </h2>
            <p className="text-[#a3aed1] text-base mb-8">
              Bundle your uploaded videos into structured courses for learners.
            </p>

            <form className="flex flex-col gap-6" onSubmit={handleCreateCourse}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Metadata */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Course Title *</label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="e.g. Basics of Programming"
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db]"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Category *</label>
                    <select
                      required
                      value={courseForm.category}
                      onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db]"
                    >
                      <option value="">Select a category...</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Sciences">Sciences</option>
                      <option value="Language">Language</option>
                      <option value="Life Skills">Life Skills</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Target Level</label>
                    <select
                      value={courseForm.level}
                      onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Foundations">Foundations</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Thumbnail Image URL</label>
                    <input
                      type="url"
                      value={courseForm.thumbnail}
                      onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                      placeholder="https://..."
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Short Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={courseForm.description}
                      onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="What will learners achieve in this course?"
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] focus:bg-white text-base text-[#2b3674] outline-none resize-none transition-all duration-200 focus:border-[#1a56db]"
                    />
                  </div>
                </div>

                {/* Video Selection Grid */}
                <div className="flex flex-col gap-4">
                  <label className="font-semibold text-[#2b3674] text-sm">
                    Select Videos to Include ({selectedVideos.length} selected)
                  </label>
                  <div className="border border-[#e0e5f2] rounded-xl bg-[#f4f7fe] p-4 h-[400px] overflow-y-auto">
                    {isLoadingVideos ? (
                      <div className="text-center text-[#a3aed1] py-10">Loading videos from cloud...</div>
                    ) : cloudVideos.length === 0 ? (
                      <div className="text-center text-[#a3aed1] py-10">
                        No videos found. Go to Video Upload first.
                      </div>
                    ) : (
                      <ul className="space-y-3 m-0 p-0 list-none">
                        {cloudVideos.map((video, idx) => {
                          const isSelected = selectedVideos.find(v => v.url === video.url);
                          // Clean up name for display
                          let displayTitle = video.name;
                          if (video.name.includes('-')) {
                            const parts = video.name.split('-');
                            parts.shift();
                            displayTitle = parts.join('-');
                          }

                          return (
                            <li key={idx} className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'border-[#1a56db] bg-[#1a56db]/5' : 'border-transparent bg-white hover:border-[#e0e5f2]'}`} onClick={() => {
                              if (isSelected) {
                                setSelectedVideos(selectedVideos.filter(v => v.url !== video.url));
                              } else {
                                setSelectedVideos([...selectedVideos, { name: displayTitle, url: video.url, cloudPath: video.cloudPath, duration: 300 }]);
                              }
                            }}>
                              <input 
                                type="checkbox" 
                                checked={!!isSelected} 
                                readOnly 
                                className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db] focus:ring-[#1a56db]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#2b3674] truncate m-0">{displayTitle}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  {courseCreationStatus && (
                    <div className={`p-3 rounded-xl text-sm font-semibold border ${courseCreationStatus.includes('✅') ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : courseCreationStatus.includes('❌') ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]' : 'bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]'}`}>
                      {courseCreationStatus}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isCreatingCourse || selectedVideos.length === 0}
                    className="mt-auto w-full text-white border-0 p-4 rounded-xl font-semibold text-base transition-all duration-200 bg-[#1a56db] hover:shadow-[0_4px_12px_rgba(26,86,219,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCourse ? 'Creating Course...' : 'Create Course'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'video-upload' && (
          <section
            className="bg-white p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] mt-2 lg:mt-4"
            aria-labelledby="upload-video-heading"
          >
            <h2 id="upload-video-heading" className="text-2xl font-bold text-[#2b3674] mb-2">
              Upload New Educational Content
            </h2>
            <p className="text-[#a3aed1] text-base mb-8">
              Upload lectures or tutorials. Our AI will automatically generate captions and sign language variants to ensure WCAG compliance.
            </p>

            {!isUploadSuccess ? (
              <>
                <form className="flex flex-col gap-6" onSubmit={processUpload}>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-title" className="font-semibold text-[#2b3674] text-sm">Video Title</label>
                    <input
                      type="text"
                      id="video-title"
                      placeholder="e.g. Introduction to Basic Mathematics"
                      required
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] font-sans text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db]/10 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-subject" className="font-semibold text-[#2b3674] text-sm">Subject / Category</label>
                    <select
                      id="video-subject"
                      required
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] font-sans text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db]/10 focus:bg-white"
                    >
                      <option value="">Select a category...</option>
                      <option value="math">Mathematics</option>
                      <option value="science">Sciences</option>
                      <option value="language">Languages</option>
                      <option value="life-skills">Life Skills</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="video-topic" className="font-semibold text-[#2b3674] text-sm">Topic Description</label>
                    <textarea
                      id="video-topic"
                      rows={4}
                      placeholder="Provide a brief description of what this video covers..."
                      required
                      className="p-4 rounded-xl border border-[#e0e5f2] bg-[#f4f7fe] font-sans text-base text-[#2b3674] outline-none transition-all duration-200 focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#1a56db]/10 focus:bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Video File (MP4, WebM)</label>
                    <input 
                      type="file" 
                      accept="video/mp4,video/webm" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                    />
                    <div
                      className={`border-2 border-dashed ${videoFile ? 'border-[#05cd99] bg-[#05cd99]/3' : 'border-[#1a56db] bg-[#1a56db]/[0.03]'} rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-200 hover:bg-[#1a56db]/[0.06] hover:-translate-y-0.5`}
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Click to select a video file or drag and drop it here"
                    >
                      <span className="text-5xl mb-4 inline-block" aria-hidden="true">{videoFile ? '🎬' : '📁'}</span>
                      <div className="text-[#2b3674] font-semibold mb-2">
                        {videoFile ? videoFile.name : 'Click to select a video file or drag and drop it here'}
                      </div>
                      <div className="text-[#a3aed1] text-sm">
                        {videoFile ? `Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB` : 'MP4 or WebM (Max. 500MB)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2b3674] text-sm">Accessibility Options (Auto-generated)</label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 text-[#2b3674] text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db] focus:ring-[#1a56db]" />
                        <span>Auto-Generate Closed Captions (CC)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked disabled className="w-4 h-4 rounded border-[#e0e5f2] text-[#1a56db] focus:ring-[#1a56db]" />
                        <span>Generate Audio Description</span>
                      </label>
                    </div>
                  </div>

                  {uploadStatus && (
                    <div className={`p-4 rounded-xl text-sm font-semibold border relative overflow-hidden ${uploadStatus.includes('✅') ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : uploadStatus.includes('❌') ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]' : 'bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]'}`}>
                      {conversionProgress > 0 && conversionProgress < 100 && (
                        <div 
                          className="absolute top-0 left-0 h-full bg-[#1a56db]/10 transition-all duration-300"
                          style={{ width: `${conversionProgress}%` }}
                        />
                      )}
                      <div className="relative z-10">
                        {uploadStatus}
                        {conversionProgress > 0 && conversionProgress < 100 && ` (${conversionProgress}%)`}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`text-white border-0 p-4 rounded-xl font-semibold text-base transition-all duration-200 mt-4 ${isProcessing ? 'bg-[#a3aed1] cursor-not-allowed' : 'bg-[#1a56db] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(26,86,219,0.3)] active:translate-y-0'}`}
                  >
                    {isProcessing ? 'Processing in Browser...' : 'Upload and Process Video'}
                  </button>
                </form>

                {downloadableAudio && (
                  <div className="mt-8 p-6 bg-[#f0fdf4] border border-[#bbf7d0] rounded-[20px] shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="text-4xl mb-4">🎵</div>
                    <h3 className="text-xl font-bold text-[#16a34a] mb-2">Audio Extracted Successfully!</h3>
                    <p className="text-[#2b3674] mb-6 text-sm">
                      The audio track was successfully extracted and compressed into a small <code className="bg-white px-2 py-1 rounded text-[#16a34a] font-bold">.mp3</code> completely inside your browser using FFmpeg WebAssembly. No server compute was used!
                    </p>
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = downloadableAudio.url;
                        a.download = downloadableAudio.name; // Force filename injection
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="bg-[#16a34a] text-white border-0 cursor-pointer px-6 py-3 rounded-xl font-bold text-base no-underline transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
                    >
                      Download & Listen to compressed {downloadableAudio.name}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-[#f0fdf4] rounded-full flex items-center justify-center text-[#16a34a] text-5xl mb-6 shadow-[0_4px_24px_rgba(22,163,74,0.15)]">
                  ✓
                </div>
                <h3 className="text-3xl font-bold text-[#2b3674] mb-4">Upload Successful!</h3>
                <p className="text-[#a3aed1] text-base mb-10 max-w-lg mx-auto leading-relaxed">
                  Your video and locally extracted <strong className="text-[#2b3674]">.mp3</strong> audio have been securely uploaded to Google Cloud. The AI Whisper model has been triggered to generate captions and sync descriptions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
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
                      className="bg-[#16a34a] text-white border-0 cursor-pointer px-8 py-4 rounded-xl font-bold text-base shadow-[0_4px_12px_rgba(22,163,74,0.2)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      🎵 Download Generated MP3
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsUploadSuccess(false);
                      setVideoFile(null);
                      setAudioFile(null);
                      setUploadStatus('');
                      setDownloadableAudio(null);
                      setConversionProgress(0);
                    }}
                    className="bg-white text-[#1a56db] border-2 border-[#1a56db] cursor-pointer px-8 py-4 rounded-xl font-bold text-base shadow-sm transition-all duration-200 hover:bg-[#f4f7fe] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    + Upload Another Video
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'video-list' && (
          <section
            className="bg-white p-6 lg:p-10 rounded-[20px] shadow-[0_4px_24px_rgba(112,144,176,0.08)] mt-2 lg:mt-4"
            aria-labelledby="video-library-heading"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 id="video-library-heading" className="text-2xl font-bold text-[#2b3674] mb-2">
                  Content Library
                </h2>
                <p className="text-[#a3aed1] text-base m-0">
                  Manage all the videos successfully processed and uploaded to the cloud.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('video-upload')}
                className="bg-[#1a56db] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a56db]/90 cursor-pointer border-none transition-transform hover:-translate-y-0.5"
              >
                + New Upload
              </button>
            </div>

            {isLoadingVideos ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-[#1a56db]/20 border-t-[#1a56db] rounded-full animate-spin mb-4" />
                <p className="text-[#a3aed1] font-medium">Fetching videos from Google Cloud...</p>
              </div>
            ) : cloudVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#e0e5f2] rounded-2xl">
                <span className="text-5xl mb-4 opacity-50">📂</span>
                <p className="text-[#a3aed1] font-medium text-lg mb-2">No videos found</p>
                <p className="text-[#a3aed1] text-sm mb-6 max-w-sm">Upload your first inclusive educational video to see it appear in the library.</p>
                <button 
                  onClick={() => setActiveTab('video-upload')}
                  className="bg-[#f4f7fe] text-[#1a56db] border-none font-semibold px-6 py-3 rounded-xl cursor-pointer hover:bg-[#e4ebfc] transition-colors"
                >
                  Go to Uploader
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cloudVideos.map((video, idx) => {
                  // Format the filename for better readability
                  let displayTitle = video.name;
                  // Try to extract the original name from the timestamped prefix (e.g. 17293847-some_video.mp4)
                  if (video.name.includes('-')) {
                    const parts = video.name.split('-');
                    parts.shift(); // Remove the timestamp portion prefix
                    displayTitle = parts.join('-');
                  }
                  
                  // Format size properly (Bytes to MB)
                  const sizeMB = video.size ? (parseInt(video.size) / 1024 / 1024).toFixed(2) : '0.00';
                  
                  // Format date properly
                  const uploadDate = video.updated ? new Date(video.updated).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  }) : 'Unknown';

                  return (
                    <div key={idx} className="border border-[#e0e5f2] rounded-2xl overflow-hidden hover:shadow-[0_4px_20px_rgba(112,144,176,0.12)] transition-shadow duration-300 bg-white group flex flex-col">
                      <div className="h-36 bg-[#f4f7fe] flex items-center justify-center border-b border-[#e0e5f2] relative group-hover:bg-[#1a56db]/5 transition-colors">
                        <span className="text-4xl">▶️</span>
                        <div className="absolute top-3 right-3 bg-white text-[#1a56db] text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                          MP4
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h4 className="m-0 text-[#2b3674] font-bold text-lg leading-tight mb-2 truncate" title={displayTitle}>
                          {displayTitle}
                        </h4>
                        <div className="flex items-center text-[#a3aed1] text-sm mb-4 gap-3">
                          <span className="flex items-center gap-1">⏱️ {uploadDate}</span>
                          <span className="flex items-center gap-1">💾 {sizeMB} MB</span>
                        </div>
                        
                        <div className="mt-auto space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#05cd99] bg-[#05cd99]/10 py-1.5 px-3 rounded-md w-fit">
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
      </main>
    </DashboardLayout>
  );
}
