import React from "react";
import {
  Upload,
  AlertTriangle,
  Activity,
  ArrowLeft,
  MapPin,
  Eye,
  Video,
  Layers
} from "lucide-react";
import { Link } from "react-router-dom";

const LiveMonitoring = () => {
  return (
    <section
      id="live"
      className="min-h-screen bg-[#F8F5F0] px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-[#2C3639]"
    >
      {/* NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#DCD7C9] text-[#2C3639] shadow-sm hover:bg-[#2C3639] hover:text-white hover:border-[#2C3639] transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono uppercase tracking-[0.15em] text-[11px] font-bold">
            Back To Home
          </span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="pb-6 border-b border-[#DCD7C9]/60">
          <p className="text-[#A27B5C] font-mono uppercase tracking-[0.25em] text-xs font-bold">
            Live Surveillance
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-[#2C3639] via-[#A27B5C] to-[#2C3639] bg-clip-text text-transparent">
            AI Accident Monitoring
          </h1>
          <p className="text-[#3F4E4F] text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
            Upload traffic footage and monitor real-time accident detection, vehicle tracking, and emergency alert generation.
          </p>
        </div>

        {/* MONITORING CONTROLS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* VIDEO INPUT MODULE (LEFT) */}
          <div className="xl:col-span-2 bg-[#2C3639] rounded-2xl overflow-hidden shadow-lg border border-[#2C3639]">
            
            {/* TOP STREAM BAR */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#3F4E4F]/40 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-white font-mono uppercase tracking-wider text-xs font-bold">
                  Video Analysis Interface
                </span>
              </div>
              <span className="text-white/40 text-xs font-mono">
                STATUS: IDLE
              </span>
            </div>

            {/* DROP ZONE CONTAINER */}
            <div className="p-6 space-y-6">
              <label className="border-2 border-dashed border-[#A27B5C]/30 bg-white/[0.02] rounded-xl h-[340px] flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-[#A27B5C] hover:bg-white/[0.04] transition-all duration-300 group">
                <input type="file" accept="video/*" className="hidden" />
                
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6 text-[#A27B5C]" />
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  Drop video footage here
                </h3>
                <p className="text-white/60 text-xs mt-1">
                  or click to browse your local directory
                </p>
                <div className="mt-6 px-3 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  MP4, AVI, MOV, MKV • Max 500MB
                </div>
              </label>

              {/* GEOLOCATION METADATA */}
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

              {/* PIPELINE TRIGGER CTA ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#A27B5C] text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#6B5B4D] active:scale-95 transition-all shadow-sm">
                  <Eye className="w-4 h-4" /> Analyse Video
                </button>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all">
                  <Video className="w-4 h-4 text-[#A27B5C]" /> Sample Feed
                </button>
                <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs font-mono uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all">
                  <Layers className="w-4 h-4 text-[#A27B5C]" /> Live Node Stream
                </button>
              </div>

            </div>
          </div>

          {/* TELEMETRY METRICS PANEL (RIGHT) */}
          <div className="space-y-4">
            
            {/* SEVERITY ACCORDION PILLS */}
            <div className="bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-black tracking-tight text-[#2C3639] mb-4">
                Severity Breakdowns
              </h3>

              <div className="space-y-2">
                {[
                  { label: "CRITICAL", color: "text-red-600 border-l-red-500 bg-red-50/30" },
                  { label: "HIGH", color: "text-orange-600 border-l-orange-500 bg-orange-50/30" },
                  { label: "MODERATE", color: "text-yellow-700 border-l-yellow-500 bg-yellow-50/30" },
                  { label: "LOW", color: "text-green-700 border-l-green-500 bg-green-50/30" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between border border-[#DCD7C9]/60 border-l-4 rounded-xl px-4 py-2.5 ${item.color}`}
                  >
                    <span className="font-mono text-xs font-bold tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-lg font-black font-mono opacity-40">
                      00
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* REAL-TIME STAT COUNTERS */}
            <div className="bg-gradient-to-br from-[#A27B5C] via-[#6B5B4D] to-[#2C3639] rounded-2xl p-5 text-white shadow-md border border-[#A27B5C]/20">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-white/10">
                <Activity className="w-4 h-4 text-[#DCD7C9]" />
                <h3 className="text-sm font-mono uppercase tracking-wider font-bold">Live Stream Registry</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-mono text-white/50 tracking-wider">Vehicles Logged</p>
                  <h2 className="text-3xl font-black mt-1 font-mono tracking-tight opacity-40">00</h2>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-mono text-white/50 tracking-wider">Accidents Flagged</p>
                  <h2 className="text-3xl font-black mt-1 font-mono tracking-tight opacity-40">00</h2>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RECENT DETECTED INCIDENTS GRID */}
        <div className="bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <AlertTriangle className="w-5 h-5 text-[#A27B5C]" />
            <h2 className="text-lg font-black tracking-tight">
              Recent Processing Logs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border border-[#DCD7C9]/70 rounded-xl p-4 bg-[#F8F5F0]/40 flex flex-col justify-between min-h-[130px]"
              >
                <div>
                  <p className="text-[10px] text-[#A27B5C] font-mono uppercase tracking-wider font-bold">
                    Registry Slot #0{item}
                  </p>
                  <h3 className="text-sm font-bold text-[#2C3639] mt-2">
                    No Anomalies Registered
                  </h3>
                </div>
                <p className="text-[#3F4E4F] text-xs opacity-70 border-t border-[#DCD7C9]/40 pt-2.5 mt-4">
                  Awaiting node data intake streams...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* VEHICLE ANALYTICS SEGMENTATION PANEL */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-[#DCD7C9] bg-gradient-to-br from-[#2C3639] via-[#3F4E4F] to-[#2C3639]">
          
          {/* ANALYSIS TOP SECTION BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-white/10 bg-[#344044]/30 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Activity className="w-4 h-4 text-[#DCD7C9]" />
              </div>
              <div>
                <p className="text-[#A27B5C] uppercase tracking-wider text-[10px] font-mono font-bold">
                  Computer Vision Analytics
                </p>
                <h2 className="text-xl font-black text-[#F5EFE6] tracking-tight">
                  Vehicle Categorization Matrix
                </h2>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-green-400 uppercase font-mono text-[10px] tracking-wider font-bold">
                  YOLO Parser Live
                </span>
              </div>
            </div>
          </div>

          {/* CLASSIFICATION METRIC CHIP TILES */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Cars Detected", value: "0", color: "from-[#A27B5C] to-[#6B5B4D]" },
                { label: "Buses Tracked", value: "0", color: "from-[#8D6E63] to-[#5D4037]" },
                { label: "Trucks Tracked", value: "0", color: "from-[#4E342E] to-[#3E2723]" },
                { label: "Bikes Logged", value: "0", color: "from-[#6B5B4D] to-[#2C3639]" },
                { label: "Autos Logged", value: "0", color: "from-[#A27B5C] to-[#3F4E4F]" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-4"
                >
                  <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${item.color}`}></div>
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-wider text-[#D0B49F] font-mono font-bold">
                      {item.label}
                    </p>
                    <h1 className="text-xl font-black text-white font-mono mt-1 opacity-40">
                      00
                    </h1>
                  </div>
                </div>
              ))}
            </div>

            {/* PIPELINE TOTAL RECKONING CARD */}
            <div className="rounded-xl bg-gradient-to-r from-[#A27B5C] to-[#6B5B4D] p-4 border border-white/5 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/70 font-mono font-bold">
                    Pipeline Unified Class Aggregation Counter
                  </p>
                  <h1 className="text-2xl font-black text-white font-mono tracking-tight mt-0.5 opacity-50">
                    0000
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