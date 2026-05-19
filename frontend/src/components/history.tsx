import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { Link } from "react-router-dom";


const IncidentHistory = () => {
  // Mock historical database logs
  const [logs] = useState([
    {
      id: "CR-9041",
      timestamp: "2026-05-19 00:32:11",
      location: "Intersection 4 - Lane A",
      type: "Vehicle Collision",
      severity: "Critical",
      confidence: "98.4%",
      status: "Dispatched",
      frame: "CAM_04_THUMB"
    },
    {
      id: "CR-9040",
      timestamp: "2026-05-18 21:15:44",
      location: "Expressway Flyover Km 12",
      type: "Static Obstruction",
      severity: "Moderate",
      confidence: "94.1%",
      status: "Resolved",
      frame: "CAM_12_THUMB"
    },
    {
      id: "CR-8992",
      timestamp: "2026-05-18 14:02:03",
      location: "West Boulevard Underpass",
      type: "Two-Wheeler Skidding",
      severity: "High",
      confidence: "97.2%",
      status: "Dispatched",
      frame: "CAM_09_THUMB"
    },
    {
      id: "CR-8951",
      timestamp: "2026-05-17 08:44:19",
      location: "Intersection 2 - Main St",
      type: "Anomalous Deceleration",
      severity: "Low",
      confidence: "89.5%",
      status: "False Alarm",
      frame: "CAM_02_THUMB"
    }
  ]);

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
            
            {/* TABLE CAPTIONS HEAD */}
            <thead>
              <tr className="bg-[#2C3639] text-[#DCD7C9] font-mono text-[10px] uppercase tracking-wider border-b border-[#3F4E4F]">
                <th className="py-4 px-6 font-bold">Incident ID</th>
                <th className="py-4 px-6 font-bold">Timestamp Key</th>
                <th className="py-4 px-6 font-bold">Node Location</th>
                <th className="py-4 px-6 font-bold">Classification</th>
                <th className="py-4 px-6 font-bold text-center">Severity</th>
                <th className="py-4 px-6 font-bold text-center">Inference Conf.</th>
                <th className="py-4 px-6 font-bold text-center">Dispatch Status</th>
                <th className="py-4 px-6 font-bold text-center">Telemetry payload</th>
              </tr>
            </thead>

            {/* TABLE ROWS BODY */}
            <tbody className="divide-y divide-[#DCD7C9]/60 text-xs sm:text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white transition-colors group">
                  
                  {/* LOG HASH */}
                  <td className="py-4 px-6 font-mono font-bold text-[#A27B5C]">
                    {log.id}
                  </td>
                  
                  {/* DATE & TIMECODE */}
                  <td className="py-4 px-6 font-mono text-xs text-[#3F4E4F]/80 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {log.timestamp}
                    </div>
                  </td>
                  
                  {/* CAMERA NODE LOCATION */}
                  <td className="py-4 px-6 text-[#2C3639] font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3F4E4F]/60" />
                      {log.location}
                    </div>
                  </td>
                  
                  {/* CRASH ANALYSIS CATEGORY */}
                  <td className="py-4 px-6 text-[#3F4E4F] font-semibold">
                    {log.type}
                  </td>
                  
                  {/* RISK SEVERITY BADGES */}
                  <td className="py-4 px-6 text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider
                      ${log.severity === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                      ${log.severity === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' : ''}
                      ${log.severity === 'Moderate' ? 'bg-amber-100 text-amber-700 border border-amber-200' : ''}
                      ${log.severity === 'Low' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                    `}>
                      <AlertOctagon className="w-3 h-3" />
                      {log.severity}
                    </span>
                  </td>
                  
                  {/* MODEL YOLO WEIGHT ACCURACY */}
                  <td className="py-4 px-6 text-center font-mono font-bold text-[#2C3639]/80">
                    {log.confidence}
                  </td>
                  
                  {/* DISPATCH LIFE CYCLES */}
                  <td className="py-4 px-6 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider
                      ${log.status === 'Dispatched' ? 'bg-[#A27B5C]/10 text-[#A27B5C] border border-[#A27B5C]/20 animate-pulse' : ''}
                      ${log.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200' : ''}
                      ${log.status === 'False Alarm' ? 'bg-zinc-200 text-zinc-600 border border-zinc-300' : ''}
                    `}>
                      {log.status}
                    </span>
                  </td>
                  
                  {/* ACTION MATRIX ROW CONTROLS */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 rounded-lg border border-[#DCD7C9] bg-white text-[#3F4E4F] hover:bg-[#2C3639] hover:text-white transition group-hover:shadow-sm">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg border border-[#DCD7C9] bg-white text-[#3F4E4F] hover:bg-[#2C3639] hover:text-white transition group-hover:shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
        
        {/* COMPONENT BOTTOM FOOTER METADATA PAGINATION SIMULATOR */}
        <div className="bg-[#2C3639]/5 border-t border-[#DCD7C9]/60 px-6 py-4 flex items-center justify-between text-xs font-mono text-[#3F4E4F]">
          <span>Displaying 4 active payload frames of 422 verified incidents</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-[#DCD7C9] rounded-lg disabled:opacity-50 font-bold" disabled>Prev</button>
            <button className="px-3 py-1.5 bg-white border border-[#DCD7C9] rounded-lg font-bold hover:bg-[#2C3639] hover:text-white transition">Next</button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default IncidentHistory;