'use client';

import { useEffect, useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function NgoDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'video-upload' | 'settings'>('dashboard');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<any>(null);

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
      
      // 2. Simulate requesting Presigned URLs
      setUploadStatus(`Step 2: Requesting secure upload links for ${videoFile.name} & ${extractedAudio.name}...`);
      await new Promise(r => setTimeout(r, 1500));
      
      // 3. Simulate Dual-Stream Upload
      setUploadStatus(`Step 3: Direct Cloud Uploading... Video (${(videoFile.size / 1024 / 1024).toFixed(2)} MB) & Lightweight Audio (${(extractedAudio.size / 1024 / 1024).toFixed(2)} MB) uploading in parallel.`);
      await new Promise(r => setTimeout(r, 3000));
      
      // 4. Success Trigger
      setUploadStatus(`✅ Upload Complete! S3 Event triggered the AI Whisper model on the audio track.`);
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f7fe] text-[#2b3674] font-sans">
      {/* Sidebar */}
      <aside className="w-full lg:w-[250px] bg-white p-4 lg:py-8 lg:px-6 flex flex-col border-b lg:border-b-0 lg:border-r border-[#e0e5f2] shadow-[4px_0_24px_rgba(112,144,176,0.08)] shrink-0">
        <div className="text-2xl font-extrabold text-[#1a56db] mb-4 lg:mb-10 text-center tracking-tight">
          EduAble NGO
        </div>
        <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
          <a
            href="#"
            className={`whitespace-nowrap lg:whitespace-normal p-4 rounded-xl no-underline font-semibold transition-all duration-300 flex items-center gap-3 ${
              activeTab === 'dashboard'
                ? 'bg-[#1a56db] text-white shadow-[0_4px_12px_rgba(26,86,219,0.2)]'
                : 'text-[#a3aed1] hover:bg-[#f4f7fe] hover:text-[#1a56db] hover:translate-x-1 lg:hover:translate-x-1 hover:-translate-y-1 lg:hover:-translate-y-0'
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          >
            <span aria-hidden="true">📊</span> Dashboard
          </a>
          <a
            href="#"
            className={`whitespace-nowrap lg:whitespace-normal p-4 rounded-xl no-underline font-semibold transition-all duration-300 flex items-center gap-3 ${
              activeTab === 'video-upload'
                ? 'bg-[#1a56db] text-white shadow-[0_4px_12px_rgba(26,86,219,0.2)]'
                : 'text-[#a3aed1] hover:bg-[#f4f7fe] hover:text-[#1a56db] hover:translate-x-1 lg:hover:translate-x-1 hover:-translate-y-1 lg:hover:-translate-y-0'
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab('video-upload'); }}
            aria-current={activeTab === 'video-upload' ? 'page' : undefined}
          >
            <span aria-hidden="true">📹</span> Video Upload
          </a>
          <a
            href="#"
            className={`whitespace-nowrap lg:whitespace-normal p-4 rounded-xl no-underline font-semibold transition-all duration-300 flex items-center gap-3 ${
              activeTab === 'settings'
                ? 'bg-[#1a56db] text-white shadow-[0_4px_12px_rgba(26,86,219,0.2)]'
                : 'text-[#a3aed1] hover:bg-[#f4f7fe] hover:text-[#1a56db] hover:translate-x-1 lg:hover:translate-x-1 hover:-translate-y-1 lg:hover:-translate-y-0'
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            <span aria-hidden="true">⚙️</span> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 flex flex-col gap-8 overflow-y-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
          <h1 className="text-3xl font-bold text-[#2b3674] m-0">Welcome back, Partner!</h1>
          <div className="flex items-center gap-6 w-full justify-end lg:w-auto">
            <div
              className="text-xl cursor-pointer bg-white p-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-transform duration-200 hover:scale-110 flex items-center justify-center h-12 w-12 leading-none"
              aria-label="Notifications"
              role="button"
              tabIndex={0}
            >
              🔔
            </div>
            <div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a56db] to-[#0ea5e9] text-white flex items-center justify-center font-bold text-xl shadow-[0_4px_12px_rgba(26,86,219,0.3)] cursor-pointer transition-transform duration-200 hover:scale-105 shrink-0"
              aria-label="User Profile"
              role="button"
              tabIndex={0}
            >
              N
            </div>
          </div>
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
                  className={`border-2 border-dashed ${videoFile ? 'border-[#05cd99] bg-[#05cd99]/[0.03]' : 'border-[#1a56db] bg-[#1a56db]/[0.03]'} rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-200 hover:bg-[#1a56db]/[0.06] hover:-translate-y-0.5`}
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
          </section>
        )}
      </main>
    </div>
  );
}
