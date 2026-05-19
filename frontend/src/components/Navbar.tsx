import React, { useState } from 'react';
import { Moon, Sun, Radio, Menu, X } from 'lucide-react';
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className='  
        fixed top-4 left-4 right-4 md:left-5 md:right-5
        z-[9999]
        flex justify-between items-center
        px-4 sm:px-6 md:px-8 py-3
        rounded-2xl
        bg-white/70
        backdrop-blur-xl
        border border-white/40
        shadow-[0_8px_32px_rgba(44,54,57,0.06)]
        isolate
        transition-all duration-500'
      >
        {/* LOGO AREA */}
        <div className='flex items-center space-x-3 sm:space-x-4'>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-[#2C3639] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#A27B5C]/10 border border-[#A27B5C]/20">
            <Radio className="w-5 h-5 sm:w-6 h-6 text-[#A27B5C]" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter text-[#2C3639] font-space uppercase">
              CRASHRADAR
            </h1>
          </div>
        </div>

        {/* DESKTOP ROUTING LINKS */}
        <div className="hidden lg:flex space-x-1 xl:space-x-2 text-[12px] xl:text-[13px] font-mono uppercase tracking-widest text-[#3F4E4F] font-bold">
          <a href="#home" className="px-3 xl:px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]">Home</a>
          <a href="#about" className="px-3 xl:px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]">About</a>
          <Link to="/monitor" className="px-3 xl:px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]">Live Monitoring</Link>
          <Link to="/dashboard" className="px-3 xl:px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]">Dashboard</Link>
          <Link to="/history" className="px-3 xl:px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]">History</Link>
        </div>

        {/* DESKTOP-ONLY CTA BUTTON MATRICES */}
        <div className='hidden lg:flex items-center space-x-3 md:space-x-4'>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#2C3639] text-[#A27B5C] border border-[#A27B5C]/20 hover:bg-[#3F4E4F] transition-all duration-300 hover:scale-105 active:scale-95">
            <Moon className="w-4 h-4"/>
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-[#A27B5C] to-[#2C3639] text-white text-[12px] md:text-[13px] font-mono uppercase tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 rounded-xl shadow-md shadow-[#A27B5C]/10">
            Get Started
          </button>
        </div>

        {/* RESPONSIVE HAMBURGER ACTION FOR ALL PORTABLE SCREENS */}
        <div className="flex lg:hidden items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-[#DCD7C9] bg-[#F8F5F0]/60 text-[#2C3639] hover:bg-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE BREAKPOINT SLIDEOUT OVERLAY SHEET */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 z-[9998] lg:hidden p-6 rounded-2xl bg-white/95 backdrop-blur-2xl border border-[#DCD7C9] shadow-xl shadow-[#2C3639]/10 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col space-y-3 text-xs font-mono uppercase tracking-widest text-[#3F4E4F] font-bold">
            <a 
              href="#home" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl transition-all hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl transition-all hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]"
            >
              About
            </a>
            <Link 
              to="/monitor" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl transition-all hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]"
            >
              Live Monitoring
            </Link>
            <Link 
              to="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl transition-all hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]"
            >
              Dashboard
            </Link>
            <Link 
              to="/history" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl transition-all hover:bg-[#A27B5C]/10 hover:text-[#A27B5C]"
            >
              History
            </Link>

            <div className="h-px bg-[#DCD7C9]/60 my-2"></div>
            
            {/* INLINE TOGGLE & GET STARTED WITHIN THE HAMBURGER CARD */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button className="flex-1 py-3 bg-gradient-to-r from-[#A27B5C] to-[#2C3639] text-white rounded-xl text-center shadow-md font-mono text-xs uppercase tracking-widest">
                Get Started
              </button>
              <button className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#2C3639] text-[#A27B5C] border border-[#A27B5C]/20" aria-label="Toggle Theme">
                <Moon className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar;