import React, { useEffect, useState } from "react";
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
  ArrowLeft,
  Flame,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [criticalIncidents, setCriticalIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incidentsRes, statsRes, criticalRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/incidents/stats`),
        fetch(`${API_BASE}/incidents/critical`),
      ]);
      if (!incidentsRes.ok || !statsRes.ok || !criticalRes.ok)
        throw new Error("Failed to fetch from backend");

      const incidentsData = await incidentsRes.json();
      const statsData     = await statsRes.json();
      const criticalData  = await criticalRes.json();

      setIncidents(incidentsData);
      setStats(statsData);
      setCriticalIncidents(criticalData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [incidents.length]);

  const totalPages      = Math.max(1, Math.ceil(incidents.length / PAGE_SIZE));
  const pagedIncidents  = incidents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Use snapshot_url directly — Flask already builds the full URL
  const snapshotIncidents = incidents
    .filter((i) => i.snapshot_url)
    .slice(0, 6);

  const formatTime = (timestamp) => {
    if (!timestamp) return "—";
    const d = new Date(timestamp.replace(" ", "T"));
    return isNaN(d.getTime()) ? timestamp : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const statCards = [
    { title: "Total Incidents", value: stats.total,    sub: "All detections",      glow: "hover:shadow-red-500/10 border-l-4 border-l-red-500",    icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
    { title: "Critical",        value: stats.critical,  sub: "Immediate response",  glow: "hover:shadow-rose-600/10 border-l-4 border-l-rose-600",  icon: <Flame        className="w-5 h-5 text-rose-600" /> },
    { title: "High",            value: stats.high,      sub: "Priority dispatch",   glow: "hover:shadow-orange-500/10 border-l-4 border-l-orange-500", icon: <Siren     className="w-5 h-5 text-orange-500" /> },
    { title: "Medium",          value: stats.medium,    sub: "Needs review",        glow: "hover:shadow-yellow-500/10 border-l-4 border-l-yellow-500", icon: <ShieldAlert className="w-5 h-5 text-yellow-500" /> },
    { title: "Low",             value: stats.low,       sub: "Normal incidents",    glow: "hover:shadow-green-500/10 border-l-4 border-l-green-500",  icon: <Activity  className="w-5 h-5 text-green-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-[#2C3639]">
      {/* NAVIGATION */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#DCD7C9] text-[#2C3639] shadow-sm hover:bg-[#2C3639] hover:text-white hover:border-[#2C3639] transition-all duration-300 group">
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono uppercase tracking-[0.15em] text-[11px] font-bold">Back To Home</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#DCD7C9]/60">
          <div>
            <p className="text-[#A27B5C] font-mono uppercase tracking-[0.25em] text-xs font-bold">CrashRadar Analytics</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">AI Surveillance Dashboard</h1>
            <p className="text-[#3F4E4F] text-sm mt-2 max-w-2xl leading-relaxed">
              Real-time AI accident monitoring, incident tracking, emergency response analytics, and live traffic intelligence.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white border border-[#DCD7C9] rounded-xl px-4 py-3 min-w-[140px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#3F4E4F] font-bold">AI STATUS</span>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${error ? "bg-red-400" : "bg-green-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? "bg-red-500" : "bg-green-500"}`}></span>
                </span>
              </div>
              <h3 className="text-lg font-black mt-1 tracking-wide">{error ? "OFFLINE" : "ONLINE"}</h3>
            </div>
            <div className="bg-white border border-[#DCD7C9] rounded-xl px-4 py-3 min-w-[140px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#3F4E4F] font-bold">CAMERAS</span>
                <Camera className="w-3.5 h-3.5 text-[#A27B5C]" />
              </div>
              <h3 className="text-lg font-black mt-1 tracking-wide">1 ACTIVE</h3>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-mono rounded-xl px-4 py-3">
            Could not reach backend: {error}. Is Flask running on port 5000?
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((item, index) => (
            <div key={index} className={`bg-white border border-[#DCD7C9] rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${item.glow}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#F8F5F0] rounded-lg border border-[#DCD7C9]/40">{item.icon}</div>
                <ArrowUpRight className="w-4 h-4 text-[#A27B5C]/60 hover:text-[#A27B5C] transition-colors cursor-pointer" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">{loading ? "…" : item.value}</h2>
              <p className="text-[11px] uppercase tracking-wider font-mono text-[#2C3639] font-bold mt-1">{item.title}</p>
              <p className="text-xs text-[#3F4E4F] mt-1.5 opacity-80">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* CRITICAL ALERTS BANNER */}
        {!loading && criticalIncidents.length > 0 && (
          <div className="bg-rose-600 rounded-2xl p-5 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-rose-100 font-bold">Severity Override</p>
                  <h2 className="text-lg font-black text-white">{criticalIncidents.length} Critical Incident{criticalIncidents.length > 1 ? "s" : ""} Detected</h2>
                </div>
              </div>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {criticalIncidents.slice(0, 3).map((incident) => (
                <div key={incident.id} className="bg-white/10 border border-white/20 rounded-xl p-3.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white font-mono">#CR-{incident.id}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold tracking-wider bg-white text-rose-700">CRITICAL</span>
                  </div>
                  <p className="text-[11px] font-mono text-rose-50 mt-1.5 opacity-90">{incident.location} • Vehicles {incident.vehicle_ids}</p>
                  <p className="text-[11px] font-mono text-rose-50 mt-0.5 opacity-75">
                    {(incident.speed_before_collision_ms * 3.6).toFixed(1)} km/h • {formatTime(incident.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOWER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* INCIDENTS TABLE */}
          <div className="lg:col-span-2 bg-white border border-[#DCD7C9] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#DCD7C9]/60 bg-[#F8F5F0]/30">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Live Reports</p>
                <h2 className="text-xl font-black mt-0.5">Recent Incidents</h2>
              </div>
              <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-[#2C3639] text-white text-xs uppercase tracking-wider font-mono font-bold hover:bg-[#3F4E4F] active:scale-95 transition-all shadow-sm">
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
                    
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCD7C9]/40 text-sm">
                  {!loading && incidents.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-[#3F4E4F] text-sm">No incidents recorded yet.</td></tr>
                  )}
                  {pagedIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-[#F8F5F0]/40 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-[#2C3639]">#CR-{incident.id}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-mono font-bold tracking-wider border ${
                          incident.severity === "CRITICAL" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          incident.severity === "HIGH"     ? "bg-red-50 text-red-700 border-red-200" :
                          incident.severity === "MEDIUM"   ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
                                                             "bg-green-50 text-green-700 border-green-200"
                        }`}>{incident.severity}</span>
                      </td>
                      <td className="px-6 py-4 text-[#3F4E4F] font-medium">{incident.location}</td>
                      <td className="px-6 py-4 text-[#3F4E4F] opacity-90">{formatTime(incident.created_at)}</td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {incidents.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCD7C9]/60 bg-[#F8F5F0]/30">
                <p className="text-xs font-mono text-[#3F4E4F]">
                  Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, incidents.length)} of {incidents.length}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors ${page === 1 ? "border-[#DCD7C9] text-[#3F4E4F]/40 cursor-not-allowed" : "border-[#DCD7C9] text-[#2C3639] hover:bg-[#2C3639] hover:text-white"}`}>
                    Prev
                  </button>
                  <span className="px-3 py-1.5 text-xs font-mono font-bold text-[#3F4E4F]">Page {page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition-colors ${page === totalPages ? "border-[#DCD7C9] text-[#3F4E4F]/40 cursor-not-allowed" : "border-[#DCD7C9] text-[#2C3639] hover:bg-[#2C3639] hover:text-white"}`}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#2C3639] via-[#3F4E4F] to-[#2C3639] rounded-2xl p-6 text-white shadow-md border border-[#2C3639]">
              <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">AI ENGINE</p>
              <h2 className="text-xl font-black mt-1">System Infrastructure</h2>
              <div className="mt-5 space-y-2.5">
                {[
                  { icon: <Cpu className="w-4 h-4 text-[#A27B5C]" />, label: "YOLOv8 Core Model",    status: "ACTIVE",      ok: true },
                  { icon: <Database className="w-4 h-4 text-[#A27B5C]" />, label: "Incident Registry DB", status: error ? "DISCONNECTED" : "CONNECTED", ok: !error },
                  { icon: <Radio className="w-4 h-4 text-[#A27B5C]" />, label: "Live Node Streams",   status: "RUNNING",     ok: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">{row.icon}<p className="text-xs font-mono">{row.label}</p></div>
                    <span className={`text-[10px] font-mono font-bold tracking-wider ${row.ok ? "text-green-400" : "text-red-400"}`}>{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Quick Access</p>
              <h2 className="text-xl font-black mt-1">Live Surveillance</h2>
              <p className="text-xs text-[#3F4E4F] mt-2 leading-relaxed">Initialize direct camera access streams and adjust pipeline detection sensory thresholds.</p>
              <button className="mt-4 w-full bg-[#2C3639] hover:bg-[#3F4E4F] text-white py-3 rounded-xl text-xs uppercase tracking-widest font-mono font-bold active:scale-[0.99] transition-all shadow-sm">
                Open Stream Console
              </button>
            </div>
          </div>
        </div>

        {/* SNAPSHOT EVIDENCE + ACTIVE WARNINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SNAPSHOTS */}
          <div className="lg:col-span-2 bg-white border border-[#DCD7C9] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-mono text-[#A27B5C] font-bold">Evidence Logs</p>
                <h2 className="text-xl font-black mt-0.5">Accident Snapshots</h2>
              </div>
              <Clock3 className="w-4 h-4 text-[#A27B5C]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {!loading && snapshotIncidents.length === 0 && (
                <p className="col-span-full text-sm text-[#3F4E4F] text-center py-8">No snapshots available yet.</p>
              )}
              {snapshotIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => window.open(incident.snapshot_url, "_blank")}
                  className="group h-32 rounded-xl bg-gradient-to-br from-[#2C3639] to-[#3F4E4F] relative overflow-hidden border border-[#DCD7C9]/60 shadow-sm cursor-pointer"
                >
                  {/* ── Actual snapshot image ── */}
                  <img
                    src={incident.snapshot_url}
                    alt={`Incident #${incident.id}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  {/* Dark hover overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors" />
                  {/* Label */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-black tracking-wide drop-shadow">INCIDENT #{incident.id}</p>
                    <p className="text-[#DCD7C9] font-mono text-[9px] uppercase tracking-wider mt-0.5 drop-shadow">
                      {incident.location} • {incident.severity}
                    </p>
                  </div>
                  {/* Severity badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      incident.severity === "CRITICAL" ? "bg-rose-600 text-white" :
                      incident.severity === "HIGH"     ? "bg-orange-500 text-white" :
                      incident.severity === "MEDIUM"   ? "bg-yellow-400 text-black" :
                                                         "bg-green-500 text-white"
                    }`}>{incident.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE WARNINGS */}
          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <p className="text-[10px] uppercase tracking-widest font-mono text-red-600 font-bold">Emergency Alerts</p>
            <h2 className="text-xl font-black mt-0.5 text-red-700">Active Warnings</h2>
            <div className="space-y-3 mt-5">
              {!loading && incidents.filter((i) => i.status === "PENDING").length === 0 && (
                <p className="text-sm text-[#3F4E4F] text-center py-6">No active warnings.</p>
              )}
              {incidents.filter((i) => i.status === "PENDING").slice(0, 3).map((incident) => (
                <div key={incident.id} className="bg-red-50/50 border border-red-100 rounded-xl p-3.5 hover:bg-red-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <p className="text-xs font-bold text-[#2C3639]">
                        {incident.vehicle_ids?.includes(",") ? "Collision Event" : "Sudden Brake Event"}
                      </p>
                    </div>
                    <MapPinned className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-[11px] font-mono text-[#3F4E4F] mt-1.5 opacity-80">
                    {incident.location} • Vehicles {incident.vehicle_ids}
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