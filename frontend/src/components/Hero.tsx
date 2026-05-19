import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Crosshair, Shield } from 'lucide-react';

const Hero = () => {
  return (
    <section
      id="home"
      className="
        max-w-7xl mx-auto
        px-6 md:px-12 lg:px-16
        pt-32 md:pt-40
        pb-16 md:pb-32
        grid grid-cols-1 lg:grid-cols-12
        gap-12 lg:gap-8
        items-center
        min-h-[90vh]
      "
    >
      {/* LEFT COLUMN: CALL TO ACTION CONTENT */}
      <div className="lg:col-span-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* TRAFFIC INTELLIGENCE BADGE */}
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-[#A27B5C]/10 border border-[#A27B5C]/20 shadow-sm">
            <div className="w-2 h-2 bg-[#A27B5C] rounded-full animate-pulse mr-2.5"></div>
            <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.25em] text-[#A27B5C] font-bold">
              AI-Powered Traffic Intelligence
            </span>
          </div>

          {/* MAIN HERO COPY TITLES */}
          <h1
            className="
              text-3xl sm:text-4xl md:text-5xl lg:text-[54px]
              font-black
              leading-[1.1]
              tracking-tight
              mb-6
              text-[#2C3639]
            "
          >
            REAL-TIME <br />
            <span className="bg-gradient-to-r from-[#A27B5C] via-[#6B5B4D] to-[#2C3639] bg-clip-text text-transparent">
              ACCIDENT INTELLIGENCE
            </span>
            <br />
            FOR SMARTER RESPONSE.
          </h1>

          <p
            className="
              text-base md:text-lg
              text-[#3F4E4F]
              max-w-xl
              mb-10
              leading-relaxed
              opacity-90
            "
          >
            CrashRadar uses AI-powered surveillance to detect road accidents,
            monitor vehicle activity, and instantly alert emergency response
            teams with live incident tracking, analytics, and intelligent
            monitoring pipelines.
          </p>

          {/* TRIGGER BUTTON MATRIX */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="
                px-8 md:px-10
                py-4
                bg-[#2C3639]
                hover:bg-[#A27B5C]
                text-white
                font-mono
                text-[11px] md:text-xs
                uppercase
                tracking-[0.2em]
                font-bold
                rounded-xl
                flex items-center justify-center
                group
                hover:scale-105 active:scale-95
                transition-all duration-300
                shadow-xl shadow-[#2C3639]/10
              "
            >
              Launch Monitoring
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              className="
                px-8 md:px-10
                py-4
                border border-[#DCD7C9]
                bg-white/40
                backdrop-blur-sm
                text-[#2C3639]
                font-mono
                text-[11px] md:text-xs
                uppercase
                tracking-[0.2em]
                font-bold
                rounded-xl
                flex items-center justify-center
                hover:bg-[#DCD7C9]/40
                hover:border-[#3F4E4F]/30
                hover:scale-105 active:scale-95
                transition-all duration-300
              "
            >
              <Play className="mr-3 w-3.5 h-3.5 fill-[#2C3639]" />
              Live Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: SURVEILLANCE UI SIMULATION CONTAINER */}
      <div className="lg:col-span-6 relative w-full px-2 sm:px-0">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="
            relative z-10
            bg-[#2C3639]
            aspect-video
            rounded-[2rem]
            overflow-hidden
            border-[6px] md:border-[10px]
            border-[#DCD7C9]
            shadow-[0_40px_80px_-15px_rgba(44,54,57,0.25)]
          "
        >
          {/* CAMERA FEED CALIBRATION GRID LINES */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3F4E4F_0%,#2C3639_100%)] opacity-40"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* SURVEILLANCE INTERFACE CORNER BORDERS */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/20"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/20"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/20"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/20"></div>

          {/* TIMECODE LOG SYSTEM OVERLAY */}
          <div
            className="
              absolute
              top-4 left-4 md:top-6 md:left-6
              bg-[#2C3639]/80
              backdrop-blur-md
              px-4 py-3
              rounded-xl
              border border-white/10
              shadow-lg
              z-20
            "
          >
            <div className="flex items-center space-x-2 mb-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[9px] font-mono text-white/60 tracking-[0.25em] uppercase font-bold">
                Live Stream Node
              </span>
            </div>
            <p className="text-xs md:text-sm font-bold text-white font-mono tracking-wide">
              CAM_SURVEILLANCE_01
            </p>
          </div>

          {/* SIMULATED INFERENCE BOUNDING BOX */}
          <motion.div
            animate={{ 
              x: ["15%", "65%", "35%"], 
              y: ["25%", "55%", "15%"] 
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut"
            }}
            className="
              absolute
              w-24 h-20
              md:w-36 md:h-28
              border-2 border-[#A27B5C]
              bg-[#A27B5C]/5
              rounded-lg
              z-20
            "
          >
            {/* RETICLE CROSSHAIR MARKERS */}
            <Crosshair className="w-4 h-4 text-[#A27B5C] absolute -top-2.5 -left-2.5" />
            <Crosshair className="w-4 h-4 text-[#A27B5C] absolute -bottom-2.5 -right-2.5" />

            {/* FLOATING CLASS TAG */}
            <div className="absolute -top-6 left-0 flex items-center space-x-1 bg-[#A27B5C] text-white px-2 py-0.5 rounded shadow-sm">
              <Shield className="w-2.5 h-2.5" />
              <span className="text-[8px] font-mono font-bold tracking-wider">
                VEHICLE_CONF: 98.4%
              </span>
            </div>
          </motion.div>

          {/* OUTER LIGHT ARTIFACT BLUR GLOWS */}
          <div className="absolute -bottom-16 -right-16 w-48 h-48 border border-white/[0.03] rounded-full animate-ping pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-[#A27B5C]/15 blur-[60px] rounded-full pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;