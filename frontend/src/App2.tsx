import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, ArrowRight, Shield,Camera, Activity, Map, Radio, Crosshair,AlertTriangle } from 'lucide-react';

const Navbar = () => (
  <nav className="flex justify-between items-center px-16 py-8 bg-white/50 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center space-x-4">
      <div className="relative w-12 h-12 bg-[#2C3639] rounded-2xl flex items-center justify-center shadow-lg shadow-[#A27B5C]/20 border border-[#A27B5C]/20">
      <Radio className="w-5 h-5 text-[#A27B5C]" />
    
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
    </div>
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-[#2C3639] font-space uppercase">CRASHRADAR</h1>
        <p className="text-[10px] font-mono text-[#A27B5C] tracking-[0.2em] uppercase">AI Traffic Intelligence</p>
      </div>
    </div>
    
    <div className="hidden md:flex space-x-12 text-[11px] font-mono uppercase tracking-widest text-[#3F4E4F]">
      <a href="#" className="hover:text-[#A27B5C] transition-colors">Features</a>
      <a href="#" className="hover:text-[#A27B5C] transition-colors">Technology</a>
      <a href="#" className="hover:text-[#A27B5C] transition-colors">Live Monitoring</a>
      <a href="#" className="hover:text-[#A27B5C] transition-colors">About</a>
    </div>

    <div className="flex items-center space-x-4">
      <button className="px-6 py-2 border border-[#2C3639] text-[#2C3639] text-[10px] font-mono uppercase tracking-widest hover:bg-[#2C3639] hover:text-white transition-all rounded-lg">
        Dashboard
      </button>
      <button className="px-6 py-2 bg-[#A27B5C] text-white text-[13px] font-mono uppercase tracking-widest hover:bg-[#3F4E4F] transition-all rounded-lg shadow-lg shadow-[#A27B5C]/20">
        Get Started
      </button>
    </div>
  </nav>
);

export default function PremiumHome() {
  return (
    <div className="min-h-screen bg-white text-[#2C3639] font-sans selection:bg-[#DCD7C9]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="px-16 pt-24 pb-32 grid grid-cols-12 gap-12 items-center">
        <div className="col-span-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-7xl font-black font-space leading-[0.9] mb-8">
              ACCIDENT DETECTION <br />
              <span className="text-[#A27B5C]">BUILT FOR FASTER</span> <br />
              RESPONSE.
            </h1>
            <p className="text-lg text-[#3F4E4F] max-w-lg mb-12 leading-relaxed">
              An AI-powered monitoring system that detects collisions, tracks vehicle activity, 
              and instantly alerts response teams with precision accuracy.
            </p>
            <div className="flex space-x-6">
              <button className="px-10 py-5 bg-[#2C3639] text-white font-mono text-xs uppercase tracking-[0.2em] rounded-xl flex items-center group">
                Launch System <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="px-10 py-5 border border-[#DCD7C9] text-[#2C3639] font-mono text-xs uppercase tracking-[0.2em] rounded-xl flex items-center hover:bg-[#DCD7C9]/30 transition-all">
                <Play className="mr-3 w-4 h-4" /> Watch Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* HERO RIGHT: CINEMATIC CARD */}
        <div className="col-span-6 relative">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 bg-[#2C3639] aspect-video rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(44,54,57,0.3)] overflow-hidden border-[12px] border-[#DCD7C9]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3F4E4F_0%,#2C3639_100%)] opacity-50"></div>
            
            {/* Live Status Overlay */}
            <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
               <div className="flex items-center space-x-3 mb-1">
                 <div className="w-2 h-2 bg-[#A27B5C] rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-mono text-white tracking-[0.3em] uppercase">Live Status</span>
               </div>
               <p className="text-xl font-bold text-white font-space">Active Surveillance</p>
            </div>

            {/* Simulated Tracking */}
            <motion.div 
              animate={{ x: [20, 100, 50], y: [40, 80, 20] }} 
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute w-32 h-24 border border-white/40 bg-white/5 backdrop-blur-[2px]"
            >
               <Crosshair className="w-4 h-4 text-white/50 absolute top-[-8px] left-[-8px]" />
               <span className="absolute -top-6 left-0 text-[8px] font-mono text-white bg-[#A27B5C] px-2 py-0.5">OBJ_CONF: 0.98</span>
            </motion.div>

            {/* Radar Pulse */}
            <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 border border-white/5 rounded-full animate-ping"></div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURES */}
      <section className="px-16 py-32 bg-[#DCD7C9]/20">
        <div className="grid grid-cols-4 gap-8">
          {[
            { icon: <Activity />, title: "Real-Time Detection", desc: "AI instantly identifies impact events." },
            { icon: <Radio />, title: "Smart Monitoring", desc: "Continuous road surveillance with YOLOv8." },
            { icon: <Map />, title: "GPS Tracking", desc: "Precise accident location mapping." },
            { icon: <Shield />, title: "Emergency Dispatch", desc: "Instant alert forwarding to MJ-CET units." }
          ].map((feature, i) => (
            <div key={i} className="p-10 bg-white rounded-[2rem] border border-[#DCD7C9] hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-[#DCD7C9]/30 rounded-xl flex items-center justify-center mb-8 text-[#A27B5C] group-hover:bg-[#A27B5C] group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-space mb-4">{feature.title}</h3>
              <p className="text-sm text-[#3F4E4F] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: METRICS */}
      <section className="px-16 py-24 border-y border-[#DCD7C9]">
        <div className="flex justify-between items-center">
          {[
            { label: "Incidents Processed", val: "12,482" },
            { label: "Accuracy Rate", val: "98.2%" },
            { label: "Active Cameras", val: "248" },
            { label: "Avg Response", val: "4.2s" }
          ].map((metric, i) => (
            <div key={i} className="text-center px-12 border-r last:border-0 border-[#DCD7C9]">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A27B5C] mb-2">{metric.label}</p>
              <p className="text-4xl font-black font-space text-[#2C3639]">{metric.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="px-16 py-32">
        <div className="bg-[#A27B5C] rounded-[3rem] p-24 text-center relative overflow-hidden shadow-2xl">
           <div className="relative z-10">
             <h2 className="text-5xl font-black font-space text-white mb-8">Road safety starts with <br /> faster intelligence.</h2>
             <button className="px-12 py-5 bg-[#2C3639] text-white font-mono text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-transform shadow-2xl">
                Deploy CrashRadar Now
             </button>
           </div>
           {/* Decorative UI element */}
           <div className="absolute top-[-10%] right-[-5%] w-96 h-96 border-[40px] border-white/5 rounded-full"></div>
        </div>
      </section>
    </div>
  );
}