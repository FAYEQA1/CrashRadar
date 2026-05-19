import React from "react";
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  Radio,
  Camera,
  Clock3,
  Siren,
  Cpu,
  Database,
  MapPinned,
  ArrowUpRight,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Incidents",
      value: "128",
      sub: "All detections",
      glow: "hover:shadow-red-500/10 border-l-4 border-l-red-500",
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    },
    {
      title: "Critical",
      value: "09",
      sub: "Immediate response",
      glow: "hover:shadow-orange-500/10 border-l-4 border-l-orange-500",
      icon: <Siren className="w-5 h-5 text-orange-500" />,
    },
    {
      title: "High",
      value: "31",
      sub: "Priority dispatch",
      glow: "hover:shadow-yellow-500/10 border-l-4 border-l-yellow-500",
      icon: <ShieldAlert className="w-5 h-5 text-yellow-500" />,
    },
    {
      title: "Low",
      value: "88",
      sub: "Normal incidents",
      glow: "hover:shadow-green-500/10 border-l-4 border-l-green-500",
      icon: <Activity className="w-5 h-5 text-green-500" />,
    },
  ];

  const incidents = [
    {
      id: "#CR-201",
      severity: "HIGH",
      location: "CAMERA-1",
      time: "10:22 PM",
      status: "PENDING",
    },
    {
      id: "#CR-202",
      severity: "MEDIUM",
      location: "HIGHWAY-4",
      time: "09:11 PM",
      status: "RESOLVED",
    },
    {
      id: "#CR-203",
      severity: "LOW",
      location: "SIGNAL-2",
      time: "08:40 PM",
      status: "ACTIVE",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-[#2C3639]">
      
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
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#DCD7C9]/60">
          <div>
            <p className="text-[#A27B5C] font-mono uppercase tracking-[0.25em] text-xs font-bold">
              CrashRadar Analytics
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
              AI Surveillance Dashboard
            </h1>
            <p className="text-[#3F4E4F] text-sm mt-2 max-w-2xl leading-relaxed">
              Real-time AI accident monitoring, incident tracking, emergency response analytics, and live traffic intelligence.
            </p>
          </div>

          {/* SYSTEM STATUS PILLS */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white border border-[#DCD7C9] rounded-xl px-4 py-3 min-w-[140px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#3F4E4F] font-bold">AI STATUS</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              <h3 className="text-lg font-black mt-1 tracking-wide">ONLINE</h3>
            </div>

            <div className="bg-white border border-[#DCD7C9] rounded-xl px-4 py-3 min-w-[140px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#3F4E4F] font-bold">CAMERAS</span>
                <Camera className="w-3.5 h-3.5 text-[#A27B5C]" />
              </div>
              <h3 className="text-lg font-black mt-1 tracking-wide">12 ACTIVE</h3>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${item.glow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#F8F5F0] rounded-lg border border-[#DCD7C9]/40">
                  {item.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#A27B5C]/60 hover:text-[#A27B5C] transition-colors cursor-pointer" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">{item.value}</h2>
              <p className="text-[11px] uppercase tracking-wider font-mono text-[#2C3639] font-bold mt-1">
                {item.title}
              </p>
              <p className="text-xs text-[#3F4E4F] mt-1.5 opacity-80">
                {item.sub}
              </p>
            </div>
          ))}
        </div>

        {/* LOWER DATA MATRIX CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* INCIDENTS DATA TABLE */}
          <div className="lg:col-span-2 bg-white border border-[#DCD7C9] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCD7C9]/60 bg-[#F8F5F0]/30">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Live Reports</p>
                <h2 className="text-xl font-black mt-0.5">Recent Incidents</h2>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#2C3639] text-white text-xs uppercase tracking-wider font-mono font-bold hover:bg-[#3F4E4F] active:scale-95 transition-all shadow-sm">
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F5F0]/60 border-b border-[#DCD7C9]/60 text-[11px] uppercase tracking-wider font-mono text-[#3F4E4F] font-bold">
                    <th className="px-6 py-3.5">Incident</th>
                    <th className="px-6 py-3.5">Severity</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Time</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD7C9]/40 text-sm">
                  {incidents.map((incident, index) => (
                    <tr key={index} className="hover:bg-[#F8F5F0]/40 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-[#2C3639]">{incident.id}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-mono font-bold tracking-wider border ${
                          incident.severity === "HIGH"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : incident.severity === "MEDIUM"
                            ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#3F4E4F] font-medium">{incident.location}</td>
                      <td className="px-6 py-4 text-[#3F4E4F] opacity-90">{incident.time}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                          incident.status === "PENDING" ? "text-orange-600 bg-orange-50" :
                          incident.status === "RESOLVED" ? "text-slate-500 bg-slate-100" :
                          "text-blue-600 bg-blue-50"
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTION SIDE PANEL */}
          <div className="space-y-4">
            
            {/* CORE MONITOR ENGINE PILL */}
            <div className="bg-gradient-to-br from-[#2C3639] via-[#3F4E4F] to-[#2C3639] rounded-2xl p-6 text-white shadow-md border border-[#2C3639]">
              <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">AI ENGINE</p>
              <h2 className="text-xl font-black mt-1">System Infrastructure</h2>
              
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-[#A27B5C]" />
                    <p className="text-xs font-mono">YOLOv8 Core Model</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-green-400 tracking-wider">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-[#A27B5C]" />
                    <p className="text-xs font-mono">Incident Registry DB</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-green-400 tracking-wider">CONNECTED</span>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 text-[#A27B5C]" />
                    <p className="text-xs font-mono">Live Node Streams</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-green-400 tracking-wider">RUNNING</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS PORTAL */}
            <div className="bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Quick Access</p>
              <h2 className="text-xl font-black mt-1">Live Surveillance</h2>
              <p className="text-xs text-[#3F4E4F] mt-2 leading-relaxed">
                Initialize direct camera access streams and adjust pipeline detection sensory thresholds.
              </p>
              <button className="mt-4 w-full bg-[#2C3639] hover:bg-[#3F4E4F] text-white py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-bold active:scale-[0.99] transition-all shadow-sm">
                Open Stream Console
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SNAPSHOT EVIDENCE ARCHIVE */}
          <div className="lg:col-span-2 bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Evidence Logs</p>
                <h2 className="text-xl font-black mt-0.5">Accident Snapshots</h2>
              </div>
              <Clock3 className="w-4 h-4 text-[#A27B5C]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="group h-32 rounded-xl bg-gradient-to-br from-[#2C3639] to-[#3F4E4F] relative overflow-hidden border border-[#DCD7C9]/60 shadow-sm cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <div className="absolute bottom-3 left-3 right-3 transform group-hover:translate-y-0.5 transition-transform">
                    <p className="text-white text-xs font-black tracking-wide">
                      INCIDENT #{item + 200}
                    </p>
                    <p className="text-[#DCD7C9] font-mono text-[9px] uppercase tracking-wider mt-0.5">
                      NODE-CAM-{item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE DISPATCH CRITICAL CRADLE */}
          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <p className="text-[10px] uppercase tracking-widest font-mono text-red-600 font-bold">Emergency Alerts</p>
            <h2 className="text-xl font-black mt-0.5 text-red-9W00">Active Warnings</h2>

            <div className="space-y-3 mt-5">
              {[1, 2, 3].map((alert) => (
                <div
                  key={alert}
                  className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <p className="text-xs font-bold text-[#2C3639]">
                        Critical Collision Event
                      </p>
                    </div>
                    <MapPinned className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-[11px] font-mono text-[#3F4E4F] mt-1.5 opacity-80">
                    Highway Intersect • Cam {alert * 2}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;