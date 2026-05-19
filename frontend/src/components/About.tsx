import React from 'react';
import {
  Shield,
  Activity,
  MapPinned,
  Radio,
  AlertTriangle,
  Car,
  Terminal,
  Cpu,
  Layers,
  Network
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Activity className="w-5 h-5 text-[#A27B5C]" />,
      title: "Real-Time Detection",
      desc: "Instant anomaly parsing, crash impact vectors calculation, and localization matrices.",
      tag: "CORE_CV"
    },
    {
      icon: <Radio className="w-5 h-5 text-[#A27B5C]" />,
      title: "Live Monitoring",
      desc: "Continuous computer vision frame processing running across distributed video feeds.",
      tag: "STREAM_PROC"
    },
    {
      icon: <MapPinned className="w-5 h-5 text-[#A27B5C]" />,
      title: "GPS Ingestion",
      desc: "Precise telemetry coordinates mapped instantly onto active dispatch feeds.",
      tag: "GEO_LOC"
    },
    {
      icon: <Shield className="w-5 h-5 text-[#A27B5C]" />,
      title: "Automated Alerts",
      desc: "Cryptographic alert payloads dispatched immediately to emergency responder arrays.",
      tag: "NET_DISP"
    },
    {
      icon: <Car className="w-5 h-5 text-[#A27B5C]" />,
      title: "Vehicle Analytics",
      desc: "Tracks multi-axle trucks, motorbikes, lane density indices, and overall throughput.",
      tag: "ANALYTICS"
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-[#A27B5C]" />,
      title: "Incident History",
      desc: "Secured historical system logging complete with frame captures and severity metadata tags.",
      tag: "LOG_DB"
    },
  ];

  return (
    <section id="about" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-32 pb-24 text-[#2C3639]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* LEFT COLUMN: HIGH-TEXT EDITORIAL DETAILS + SURVEILLANCE TELEMETRY STACK */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-36">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A27B5C]/10 border border-[#A27B5C]/20 text-[#A27B5C]">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">System Architecture</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-[#2C3639] tracking-tight">
              AUTONOMOUS <br />
              <span className="bg-gradient-to-r from-[#A27B5C] to-[#3F4E4F] bg-clip-text text-transparent">
                INCIDENT DETECTION
              </span> <br />
              FOR MODERN ROADS.
            </h2>
          </div>

          <p className="text-[#3F4E4F] text-base leading-relaxed border-l-2 border-[#A27B5C]/30 pl-4 opacity-90">
            CrashRadar functions as an always-on infrastructure layer. Using decentralized 
            computer vision, the platform processes incoming camera nodes, flags impact vectors, 
            and broadcasts live geolocation streams to compress emergency service delay windows.
          </p>

          {/* 🖥️ DATA DENSITY FILLER: ARCHITECTURAL SIMULATION BAR */}
          <div className="bg-[#2C3639] rounded-2xl p-5 border border-[#3F4E4F] text-white/90 font-mono text-[11px] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-[#A27B5C]" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Pipeline Status Logs</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            </div>
            <div className="space-y-1.5 opacity-80">
              <p className="text-white/50"><span className="text-[#A27B5C]">[SYS_OK]</span> Initializing DeepSORT tracking frame loop...</p>
              <p className="text-white/50"><span className="text-[#A27B5C]">[THREAD]</span> Frame ingestion running at 30fps baseline.</p>
              <p><span className="text-green-400">[INFERENCE]</span> Model weight matrix loaded successfully (YOLOv8x).</p>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#3F4E4F]/60">Optimization</p>
              <h4 className="text-3xl font-black text-[#2C3639] font-mono tracking-tight">98.4%</h4>
              <p className="text-xs text-[#3F4E4F] mt-1">YOLO Prediction Confidence</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#3F4E4F]/60">Operational Scope</p>
              <h4 className="text-3xl font-black text-[#A27B5C] font-mono tracking-tight">24/7/365</h4>
              <p className="text-xs text-[#3F4E4F] mt-1">Continuous Edge Pipeline</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TECHNICAL BENTO BOX CAPABILITIES (MORE ROBUST DATA ENTRIES) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                relative
                p-6
                bg-[#F8F5F0]/80
                backdrop-blur-sm
                border border-[#DCD7C9]
                rounded-2xl
                transition-all duration-300
                hover:bg-white
                hover:border-[#A27B5C]/60
                hover:shadow-[0_15px_35px_rgba(44,54,57,0.04)]
                group
                overflow-hidden
                flex flex-col justify-between
                min-h-[180px]
              "
            >
              <div>
                {/* HEAD DECORATION STRIP */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2C3639]/5 group-hover:bg-[#A27B5C]/40 transition-colors" />

                {/* FEATURE COMPONENT METRICS ICON ZONE */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#DCD7C9] flex items-center justify-center shadow-sm group-hover:bg-[#2C3639] group-hover:border-[#2C3639] transition-all duration-300">
                    <div className="group-hover:text-white group-hover:scale-110 transition-all duration-300 text-[#A27B5C]">
                      {feature.icon}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono bg-[#2C3639]/5 text-[#3F4E4F]/70 px-2 py-0.5 rounded border border-[#DCD7C9]/40">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="font-bold text-[#2C3639] tracking-tight text-base mb-2 group-hover:text-[#A27B5C] transition-colors">
                  {feature.title}
                </h3>

                {/* FEATURE TEXT BODY */}
                <p className="text-[#3F4E4F] text-xs sm:text-sm leading-relaxed opacity-85">
                  {feature.desc}
                </p>
              </div>

              {/* TELEMETRY TERMINAL ID LABELS */}
              <div className="pt-4 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Terminal className="w-3 h-3 text-[#3F4E4F] group-hover:text-[#A27B5C]" />
                <span className="text-[8px] font-mono text-[#3F4E4F] group-hover:text-[#A27B5C] tracking-widest uppercase">
                  NODE_SUB_0{index + 1} // ACTIVE
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default About;