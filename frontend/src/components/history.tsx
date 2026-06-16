import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  MapPin, 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Eye, 
  FileText,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const IncidentHistory = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/incidents")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch incidents:", err);
        setLoading(false);
      });
  }, []);

  // Filter by search query
  const filtered = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      String(log.id).includes(q) ||
      (log.location || "").toLowerCase().includes(q) ||
      (log.severity || "").toLowerCase().includes(q) ||
      (log.vehicle_ids || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center text-lg font-semibold">
          Loading incident history...
        </div>
      </section>
    );
  }

  return (
    <section id="history" className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-24 text-[#2C3639]">
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

      {/* SECTION HEADER ZONE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-[#DCD7C9]/60 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A27B5C]/10 border border-[#A27B5C]/20 text-[#A27B5C]">
            <History className="w-3.5 h-3.5" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">Ledger Archive</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            INCIDENT AUDIT HISTORY
          </h2>
          <p className="text-[#3F4E4F] text-sm max-w-xl opacity-90">
            Comprehensive historical index of network telemetry captures, inference logs, and emergency dispatch status logs.
          </p>
        </div>

        {/* SYSTEM ACTIONS PANEL */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#3F4E4F]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search node id or type..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-[#DCD7C9] bg-[#F8F5F0]/50 font-mono text-xs focus:outline-none focus:border-[#A27B5C] focus:bg-white transition-all w-64 text-[#2C3639]"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-[#DCD7C9] bg-white text-[#3F4E4F] hover:bg-[#F8F5F0] transition">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HISTORICAL TABLE CONTAINER */}
      <div className="bg-[#F8F5F0]/60 backdrop-blur-sm border border-[#DCD7C9] rounded-2xl overflow-hidden shadow-xl shadow-[#2C3639]/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2C3639] text-[#DCD7C9] font-mono text-[10px] uppercase tracking-wider border-b border-[#3F4E4F]">
                <th className="py-4 px-6 font-bold">Incident ID</th>
                <th className="py-4 px-6 font-bold">Timestamp Key</th>
                <th className="py-4 px-6 font-bold">Node Location</th>
                <th className="py-4 px-6 font-bold">Vehicle Type</th>
                <th className="py-4 px-6 font-bold text-center">Severity</th>
                <th className="py-4 px-6 font-bold text-center">Hospital Assigned</th>
                <th className="py-4 px-6 font-bold text-center">Status</th>
                <th className="py-4 px-6 font-bold text-center">Incident Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD7C9]/60 text-xs sm:text-sm">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#3F4E4F]/50 font-mono text-xs">
                    No incidents found.
                  </td>
                </tr>
              ) : paginated.map((log) => (
                <tr key={log.id} className="hover:bg-white transition-colors group">
                  <td className="py-4 px-6 font-mono font-bold text-[#A27B5C]">{log.id}</td>
                  <td className="py-4 px-6 font-mono text-xs text-[#3F4E4F]/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#2C3639] font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3F4E4F]/60" />
                      {log.location}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#3F4E4F] font-semibold">
                    {log.vehicle_ids || "—"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider
                      ${log.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                      ${log.severity === 'HIGH'     ? 'bg-orange-100 text-orange-700 border border-orange-200' : ''}
                      ${log.severity === 'MEDIUM'   ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''}
                      ${log.severity === 'LOW'      ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                    `}>
                      <AlertOctagon className="w-3 h-3" />
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-[#2C3639]/80">
                    {log.dispatched_hospital || "Not Assigned"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider
                      ${log.status === 'DISPATCHED'     ? 'bg-[#A27B5C]/10 text-[#A27B5C] border border-[#A27B5C]/20 animate-pulse' : ''}
                      ${log.status === 'RESOLVED'       ? 'bg-green-100 text-green-700 border border-green-200' : ''}
                      ${log.status === 'FALSE_POSITIVE' ? 'bg-zinc-200 text-zinc-600 border border-zinc-300' : ''}
                      ${log.status === 'PENDING'        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : ''}
                    `}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { if (log.snapshot_url) window.open(log.snapshot_url, "_blank"); }}
                        className="p-1.5 rounded-lg border border-[#DCD7C9] bg-white text-[#3F4E4F] hover:bg-[#2C3639] hover:text-white transition group-hover:shadow-sm"
                        title="View snapshot"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(
                          `Incident ID: ${log.id}\nLocation: ${log.location}\nSeverity: ${log.severity}\nVehicle IDs: ${log.vehicle_ids}\nHospital: ${log.dispatched_hospital || "None"}\nStatus: ${log.status}\nSpeed: ${log.speed_before_collision_ms} m/s\nDistance: ${log.collision_distance_m} m`
                        )}
                        className="p-1.5 rounded-lg border border-[#DCD7C9] bg-white text-[#3F4E4F] hover:bg-[#2C3639] hover:text-white transition group-hover:shadow-sm"
                        title="View details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="bg-[#2C3639]/5 border-t border-[#DCD7C9]/60 px-6 py-4 flex items-center justify-between text-xs font-mono text-[#3F4E4F]">
          <span>
            Showing {paginated.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} incidents
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DCD7C9] rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2C3639] hover:text-white transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-[#3F4E4F]/40">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition
                        ${safePage === p
                          ? "bg-[#2C3639] text-white border-[#2C3639]"
                          : "bg-white border-[#DCD7C9] hover:bg-[#F8F5F0]"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#DCD7C9] rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2C3639] hover:text-white transition"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IncidentHistory;