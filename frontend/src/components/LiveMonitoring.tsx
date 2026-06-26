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
  X,
  Hospital,
  Phone,
  CheckCircle2,
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

  const [isSampleRunning, setIsSampleRunning] = useState(false);
  const [sampleDone,      setSampleDone]      = useState(false);
  const [sampleError,     setSampleError]     = useState(null);
  const [incidents,       setIncidents]       = useState([]);
  const [stats,           setStats]           = useState(null);
  const [hospitalRecs,    setHospitalRecs]    = useState([]);
  const pollRef        = useRef(null);
  const baselineRef    = useRef(0);

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

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    clearPoll();

    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/incidents`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Invalid API response:", data);
          return;
        }

        // ✅ CHANGED: slice(0,1) — only one incident for the Video Analysis card
        setIncidents(data.slice(0, 1));
        setStats(deriveStats(data));
      } catch (error) {
        console.error("Polling Error:", error);
      }
    }, POLL_INTERVAL_MS);
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
    setHospitalRecs([]);
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

  // ── fetch hospital recommendations ────────────────────────────────────────

  const fetchHospitalRecs = async (cameraId) => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/nearest/${cameraId}`);
      const data = await res.json();
      setHospitalRecs(Array.isArray(data) ? data : []);
    } catch (_) {
      setHospitalRecs([]);
    }
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
      try {
        const snap = await fetch(`${API_BASE}/incidents`);
        const existing = await snap.json();
        baselineRef.current = Array.isArray(existing) ? existing.length : 0;
      } catch (_) { baselineRef.current = 0; }

      const res = await fetch(`${API_BASE}/detection/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_id: "CAMERA-1" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Server error ${res.status}`);
      }

      startPolling();

      setTimeout(async () => {
        clearPoll();
        try {
          const res  = await fetch(`${API_BASE}/incidents`);
          const data = await res.json();
          const freshCount = Math.max(0, data.length - baselineRef.current);
          const fresh = data.slice(0, freshCount);

          if (fresh.length > 0) {
            // ✅ CHANGED: slice(0,1) — only one result
            setIncidents(data.slice(0, 1));
            setStats(deriveStats(data));
          }

          const criticalFresh = fresh.filter(
            (i) => i.severity?.toUpperCase() === "CRITICAL"
          );

          if (criticalFresh.length > 0) {
            const camId = criticalFresh[0].location || "CAMERA-1";
            await fetchHospitalRecs(camId);
          } else {
            setHospitalRecs([]);
          }
        } catch (_) {}
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

          {/* RIGHT SIDEBAR — intentionally left minimal, removed Severity & Registry cards */}
          <div className="space-y-4">
            {/* You can add future sidebar widgets here */}
          </div>

        </div>

        {/* ✅ VIDEO ANALYSIS CARD — replaces all 4 removed sections */}
        <div className="bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black mb-6">
            Video Analysis
          </h2>

          {incidents.length > 0 ? (() => {
            const incident = incidents[0];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LEFT */}
                <div className="space-y-5">

                  <div>
                    <p className="text-xs uppercase text-gray-500 font-mono">
                      Location
                    </p>
                    <p className="text-xl font-bold">
                      {incident.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-gray-500 font-mono">
                      Time
                    </p>
                    <p className="font-semibold">
                      {incident.timestamp}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-gray-500 font-mono">
                      Severity
                    </p>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg font-bold
                      ${
                        incident.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                        : incident.severity === "HIGH"
                          ? "bg-orange-100 text-orange-700"
                        : incident.severity === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  {["HIGH", "CRITICAL"].includes(incident.severity?.toUpperCase()) && (
                    <div>
                      <p className="text-xs uppercase text-gray-500 font-mono">
                        Nearest Hospital
                      </p>
                      <p className="font-semibold">
                        {incident.dispatched_hospital ?? "Assigning…"}
                      </p>
                    </div>
                  )}

                </div>

                {/* RIGHT — snapshot image */}
                {/* ✅ Uses relative path: static/snapshots/... so the URL resolves correctly */}
                <div>
                  <p className="text-xs uppercase text-gray-500 font-mono mb-2">
                    Snapshot
                  </p>
                  <img
                    src={`http://localhost:5000/${incident.snapshot}`}
                    alt="Incident snapshot"
                    className="rounded-xl border w-full h-72 object-cover"
                  />
                </div>

              </div>
            );
          })() : (
            <div className="text-center py-20 text-gray-500">
              Run a sample video to view accident details.
            </div>
          )}
        </div>

        {/* ── HOSPITAL RECOMMENDATION (only if CRITICAL this run) ─────────── */}
        {hospitalRecs.length > 0 && (
          <div className="bg-rose-600 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-2.5 mb-4">
              <Hospital className="w-5 h-5 text-white" />
              <h2 className="text-lg font-black tracking-tight text-white">
                Critical Incident — Recommended Hospitals
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hospitalRecs.map((h, idx) => (
                <div key={h.id ?? idx} className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{h.name}</p>
                    {idx === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold tracking-wider bg-white text-rose-700">
                        NEAREST
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-rose-50 opacity-90">{h.tier}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-rose-50 text-xs">
                    <Phone className="w-3 h-3" />
                    <span className="font-mono">{h.contact_number}</span>
                  </div>
                  <p className="text-[11px] font-mono text-rose-50 mt-1 opacity-80">
                    Ambulances available: {h.available_ambulances}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default LiveMonitoring;