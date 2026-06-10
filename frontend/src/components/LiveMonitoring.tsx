import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  AlertTriangle,
  Activity,
  ArrowLeft,
  MapPin,
  Eye,
  Video,
  Layers,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";
const POLL_INTERVAL_MS = 2000;

const SEVERITY_COLORS = {
  CRITICAL: "text-red-600 border-l-red-500 bg-red-50/30",
  HIGH:     "text-orange-600 border-l-orange-500 bg-orange-50/30",
  MEDIUM:   "text-yellow-700 border-l-yellow-500 bg-yellow-50/30",
  MODERATE: "text-yellow-700 border-l-yellow-500 bg-yellow-50/30",
  LOW:      "text-green-700 border-l-green-500 bg-green-50/30",
};

const SEVERITY_BADGE = {
  CRITICAL: "bg-red-50 border-red-200 text-red-600",
  HIGH:     "bg-orange-50 border-orange-200 text-orange-600",
  MEDIUM:   "bg-yellow-50 border-yellow-200 text-yellow-700",
  MODERATE: "bg-yellow-50 border-yellow-200 text-yellow-700",
  LOW:      "bg-green-50 border-green-200 text-green-700",
};

// Derive vehicle counts from incidents
function deriveStats(incidents) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, MODERATE: 0, LOW: 0 };
  const totalVehicleIds = new Set();

  for (const inc of incidents) {
    const sev = inc.severity?.toUpperCase();
    if (sev in counts) counts[sev]++;
    if (inc.vehicle_ids) {
      inc.vehicle_ids.split(",").forEach((id) => totalVehicleIds.add(id.trim()));
    }
  }

  // Merge MEDIUM into MODERATE for display
  counts.MODERATE = (counts.MODERATE || 0) + (counts.MEDIUM || 0);

  return {
    accidents: incidents.length,
    vehicles:  totalVehicleIds.size,
    severity: {
      CRITICAL: counts.CRITICAL,
      HIGH:     counts.HIGH,
      MODERATE: counts.MODERATE,
      LOW:      counts.LOW,
    },
  };
}

const LiveMonitoring = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview,  setVideoPreview]  = useState(null);
  const [isAnalysing,   setIsAnalysing]   = useState(false);

  // Sample feed state
  const [isSampleRunning, setIsSampleRunning] = useState(false);
  const [sampleDone,      setSampleDone]      = useState(false);
  const [sampleError,     setSampleError]     = useState(null);
  const [incidents,       setIncidents]       = useState([]);
  const [stats,           setStats]           = useState(null);
  const pollRef        = useRef(null);
  const baselineRef    = useRef(0);

  // Camera state
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [cameraError,  setCameraError]  = useState(null);
  const cameraStreamRef = useRef(null);
  const videoElRef      = useRef(null);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      stopCamera();
      clearPoll();
    };
  }, []);

  // ── polling ────────────────────────────────────────────────────────────────

  const startPolling = () => {
    clearPoll();
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`${API_BASE}/incidents`);
        const data = await res.json();
        // Only show incidents newer than when we started
        const fresh = data.slice(0, Math.max(0, data.length - baselineRef.current));
        if (fresh.length > 0) {
          setIncidents(fresh.slice(0, 3));
          setStats(deriveStats(fresh));
        }
      } catch (_) {}
    }, POLL_INTERVAL_MS);
  };

  const clearPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // ── helpers ────────────────────────────────────────────────────────────────

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
  };

  const resetAll = () => {
    stopCamera();
    clearPoll();
    setIsCameraMode(false);
    setIsSampleRunning(false);
    setSampleDone(false);
    setSampleError(null);
    setIncidents([]);
    setStats(null);
    setCameraError(null);
  };

  // ── file upload ────────────────────────────────────────────────────────────

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resetAll();
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const clearSelection = (e) => {
    e.preventDefault();
    resetAll();
    setSelectedVideo(null);
    setVideoPreview(null);
  };

  // ── analyse uploaded video ─────────────────────────────────────────────────

  const triggerAnalysis = async () => {
    if (!selectedVideo) { alert("Please upload a video file first."); return; }
    setIsAnalysing(true);
    setTimeout(() => { setIsAnalysing(false); alert("Analysis complete (Simulation)"); }, 3000);
  };

  // ── SAMPLE FEED ────────────────────────────────────────────────────────────

  const runSampleFeed = async () => {
    resetAll();
    setSelectedVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setSampleError(null);
    setIsSampleRunning(true);

    try {
      // 1. Snapshot current count so we only surface new incidents
      try {
        const snap = await fetch(`${API_BASE}/incidents`);
        const existing = await snap.json();
        baselineRef.current = Array.isArray(existing) ? existing.length : 0;
      } catch (_) { baselineRef.current = 0; }

      // 2. Kick off detection on sample1.mp4
      const res = await fetch(`${API_BASE}/detection/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_id: "CAMERA-1" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Server error ${res.status}`);
      }

      // 3. Poll for results
      startPolling();

      // 4. Stop polling after 30s (adjust to match your video length)
      setTimeout(() => {
        clearPoll();
        setIsSampleRunning(false);
        setSampleDone(true);
      }, 30000);

    } catch (err) {
      setSampleError(`Sample feed failed: ${err.message}`);
      setIsSampleRunning(false);
    }
  };

  // ── LIVE NODE STREAM ───────────────────────────────────────────────────────

  const startLiveNodeStream = async () => {
    resetAll();
    setSelectedVideo(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      setIsCameraMode(true);
      setTimeout(() => {
        if (videoElRef.current) {
          videoElRef.current.srcObject = stream;
          videoElRef.current.play();
        }
      }, 100);
    } catch (_) {
      setCameraError("Camera access denied or unavailable. Allow camera permissions and try again.");
    }
  };

  const stopLiveNodeStream = (e) => {
    e?.preventDefault();
    stopCamera();
    setIsCameraMode(false);
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const status = isAnalysing ? "Analysing..."
    : isCameraMode    ? "Camera Live"
    : isSampleRunning ? "Processing..."
    : sampleDone      ? "Sample Complete"
    : selectedVideo   ? "Ready"
    : "Idle";

  const isLiveOrRunning = isAnalysing || isCameraMode || isSampleRunning;
  const severityCounts  = stats?.severity ?? { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <section
      id="live"
      className="min-h-screen bg-[#F8F5F0] px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-[#2C3639]"
    >
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#DCD7C9] text-[#2C3639] shadow-sm hover:bg-[#2C3639] hover:text-white hover:border-[#2C3639] transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono uppercase tracking-[0.15em] text-[11px] font-bold">Back To Home</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="pb-6 border-b border-[#DCD7C9]/60">
          <p className="text-[#A27B5C] font-mono uppercase tracking-[0.25em] text-xs font-bold">Live Surveillance</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-[#2C3639] via-[#A27B5C] to-[#2C3639] bg-clip-text text-transparent">
            AI Accident Monitoring
          </h1>
          <p className="text-[#3F4E4F] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Upload traffic footage and monitor real-time accident detection, vehicle tracking, and emergency alert generation.
          </p>
        </div>

        {/* MONITORING GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* VIDEO MODULE */}
          <div className="xl:col-span-2 bg-[#2C3639] rounded-2xl overflow-hidden shadow-lg border border-[#2C3639]">

            <div className="flex items-center justify-between px-6 py-4 bg-[#3F4E4F]/40 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveOrRunning ? "bg-green-400" : "bg-red-400"} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveOrRunning ? "bg-green-500" : "bg-red-500"}`}></span>
                </span>
                <span className="text-white font-mono uppercase tracking-wider text-xs font-bold">Video Analysis Interface</span>
              </div>
              <span className="text-white/40 text-xs font-mono uppercase">STATUS: {status}</span>
            </div>

            <div className="p-6 space-y-6">

              {/* Webcam view */}
              {isCameraMode ? (
                <div className="relative border-2 border-dashed border-green-500/40 bg-white/[0.02] rounded-xl min-h-[340px] flex flex-col items-center justify-center overflow-hidden">
                  <video ref={videoElRef} autoPlay muted playsInline className="max-h-[320px] w-full object-cover rounded-lg" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-mono text-[10px] uppercase tracking-wider font-bold">Camera Feed Active</span>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <span className="bg-black/60 text-white/60 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg">
                      Real-time detection — implementation pending
                    </span>
                  </div>
                  <button onClick={stopLiveNodeStream} className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20">
                    <X className="w-4 h-4" />
                  </button>
                </div>

              ) : (
                /* Upload / sample drop zone */
                <label className="relative border-2 border-dashed border-[#A27B5C]/30 bg-white/[0.02] rounded-xl min-h-[340px] flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-[#A27B5C] hover:bg-white/[0.04] transition-all duration-300 group overflow-hidden">
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />

                  {(isSampleRunning || sampleDone) && !videoPreview ? (
                    <div className="flex flex-col items-center gap-4 pointer-events-none">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Activity className={`w-6 h-6 ${isSampleRunning ? "text-green-400 animate-pulse" : "text-[#A27B5C]"}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {isSampleRunning ? "Running Sample Feed..." : "Sample Feed Complete"}
                      </h3>
                      <p className="text-white/60 text-xs">
                        {isSampleRunning
                          ? "Detecting vehicles and incidents on sample1.mp4…"
                          : "Results populated below from backend detection"}
                      </p>
                      {isSampleRunning && (
                        <div className="flex gap-1.5 mt-2">
                          {[0,1,2].map(i => (
                            <span key={i} className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      )}
                    </div>

                  ) : !videoPreview ? (
                    <>
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6 text-[#A27B5C]" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Drop video footage here</h3>
                      <p className="text-white/60 text-xs mt-1">or click to browse your local directory</p>
                    </>

                  ) : (
                    <div className="w-full relative">
                      <video src={videoPreview} className="max-h-[300px] mx-auto rounded-lg" controls />
                      <button onClick={clearSelection} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {selectedVideo && (
                    <p className="text-[#A27B5C] text-sm mt-3 font-mono truncate max-w-full px-4">
                      Selected: {selectedVideo.name}
                    </p>
                  )}

                  <div className="mt-6 px-3 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                    MP4, AVI, MOV, MKV • Max 500MB
                  </div>
                </label>
              )}

              {sampleError && <p className="text-red-400 font-mono text-xs text-center">{sampleError}</p>}
              {cameraError && <p className="text-red-400 font-mono text-xs text-center">{cameraError}</p>}

              {/* GEO METADATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-0.5">Latitude coordinate</label>
                    <input type="text" defaultValue="0.000000" className="bg-transparent text-white text-sm font-mono outline-none w-full" />
                  </div>
                  <MapPin className="w-4 h-4 text-[#A27B5C]/60" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-0.5">Longitude coordinate</label>
                    <input type="text" defaultValue="0.000000" className="bg-transparent text-white text-sm font-mono outline-none w-full" />
                  </div>
                  <MapPin className="w-4 h-4 text-[#A27B5C]/60" />
                </div>
              </div>

              {/* CTA BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

                <button
                  onClick={triggerAnalysis}
                  disabled={isAnalysing || !selectedVideo}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs font-mono uppercase tracking-wider active:scale-95 transition-all shadow-sm ${
                    isAnalysing || !selectedVideo
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-[#A27B5C] text-white hover:bg-[#6B5B4D]"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {isAnalysing ? "Processing..." : "Analyse Video"}
                </button>

                <button
                  onClick={runSampleFeed}
                  disabled={isSampleRunning}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs font-mono uppercase tracking-wider active:scale-95 transition-all ${
                    isSampleRunning
                      ? "bg-green-500/20 border border-green-500/40 text-green-400 cursor-not-allowed"
                      : sampleDone
                      ? "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <Video className="w-4 h-4 text-[#A27B5C]" />
                  {isSampleRunning ? "Running..." : sampleDone ? "Run Again" : "Sample Feed"}
                </button>

                <button
                  onClick={isCameraMode ? stopLiveNodeStream : startLiveNodeStream}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs font-mono uppercase tracking-wider active:scale-95 transition-all ${
                    isCameraMode
                      ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#A27B5C]" />
                  {isCameraMode ? "Stop Camera" : "Live Node Stream"}
                </button>

              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">

            <div className="bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-black tracking-tight text-[#2C3639] mb-4">Severity Breakdowns</h3>
              <div className="space-y-2">
                {["CRITICAL", "HIGH", "MODERATE", "LOW"].map((label) => (
                  <div key={label} className={`flex items-center justify-between border border-[#DCD7C9]/60 border-l-4 rounded-xl px-4 py-2.5 ${SEVERITY_COLORS[label]}`}>
                    <span className="font-mono text-xs font-bold tracking-wider">{label}</span>
                    <span className={`text-lg font-black font-mono transition-all duration-500 ${stats ? "opacity-100" : "opacity-40"}`}>
                      {String(severityCounts[label] ?? 0).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#A27B5C] via-[#6B5B4D] to-[#2C3639] rounded-2xl p-5 text-white shadow-md border border-[#A27B5C]/20">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/10">
                <Activity className="w-4 h-4 text-[#DCD7C9]" />
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold">Live Stream Registry</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-mono text-white/50 tracking-wider">Vehicles Logged</p>
                  <h2 className={`text-3xl font-black mt-1 font-mono tracking-tight transition-all duration-500 ${stats ? "opacity-100" : "opacity-40"}`}>
                    {String(stats?.vehicles ?? 0).padStart(2, "0")}
                  </h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-mono text-white/50 tracking-wider">Accidents Flagged</p>
                  <h2 className={`text-3xl font-black mt-1 font-mono tracking-tight transition-all duration-500 ${stats ? "opacity-100" : "opacity-40"}`}>
                    {String(stats?.accidents ?? 0).padStart(2, "0")}
                  </h2>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PROCESSING LOGS */}
        <div className="bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <AlertTriangle className="w-5 h-5 text-[#A27B5C]" />
            <h2 className="text-lg font-black tracking-tight">Recent Processing Logs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => {
              const inc = incidents[i];
              return (
                <div key={i} className={`border border-[#DCD7C9]/70 rounded-xl p-4 bg-[#F8F5F0]/40 flex flex-col justify-between min-h-[130px] transition-all duration-500 ${inc ? "opacity-100" : "opacity-60"}`}>
                  <div>
                    <p className="text-[10px] text-[#A27B5C] font-mono uppercase tracking-wider font-bold">
                      Registry Slot #0{i + 1}
                    </p>
                    <h3 className="text-sm font-bold text-[#2C3639] mt-2">
                      {inc
                        ? `${inc.severity} — Vehicle${inc.vehicle_ids?.includes(",") ? "s" : ""} #${inc.vehicle_ids}`
                        : "No Anomalies Registered"}
                    </h3>
                    {inc && (
                      <span className={`inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[inc.severity?.toUpperCase()] ?? SEVERITY_BADGE.LOW}`}>
                        {inc.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-[#3F4E4F] text-xs opacity-70 border-t border-[#DCD7C9]/40 pt-2.5 mt-4">
                    {inc
                      ? `${inc.location ?? "CAMERA-1"} — ${inc.timestamp}`
                      : "Awaiting node data intake streams..."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* VEHICLE ANALYTICS */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-[#DCD7C9] bg-gradient-to-br from-[#2C3639] via-[#3F4E4F] to-[#2C3639]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-white/10 bg-[#344044]/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Activity className="w-4 h-4 text-[#DCD7C9]" />
              </div>
              <div>
                <p className="text-[#A27B5C] uppercase tracking-wider text-[10px] font-mono font-bold">Computer Vision Analytics</p>
                <h2 className="text-xl font-black text-[#F5EFE6] tracking-tight">Vehicle Categorization Matrix</h2>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="text-green-400 uppercase font-mono text-[10px] tracking-wider font-bold">YOLO Parser Live</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Cars Detected",  color: "from-[#A27B5C] to-[#6B5B4D]" },
                { label: "Buses Tracked",  color: "from-[#8D6E63] to-[#5D4037]" },
                { label: "Trucks Tracked", color: "from-[#4E342E] to-[#3E2723]" },
                { label: "Bikes Logged",   color: "from-[#6B5B4D] to-[#2C3639]" },
                { label: "Autos Logged",   color: "from-[#A27B5C] to-[#3F4E4F]" },
              ].map((item, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-4">
                  <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${item.color}`}></div>
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-wider text-[#D0B49F] font-mono font-bold">{item.label}</p>
                    <h1 className="text-xl font-black text-white font-mono mt-1 opacity-40">00</h1>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gradient-to-r from-[#A27B5C] to-[#6B5B4D] p-4 border border-white/5 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/70 font-mono font-bold">
                    Pipeline Unified Class Aggregation Counter
                  </p>
                  <h1 className={`text-2xl font-black text-white font-mono tracking-tight mt-0.5 transition-all duration-500 ${stats ? "opacity-100" : "opacity-50"}`}>
                    {String(stats?.vehicles ?? 0).padStart(4, "0")}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LiveMonitoring;