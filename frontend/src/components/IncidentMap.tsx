import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// hardcoded hospitals till backend route is ready
const FALLBACK_HOSPITALS = [
  { name: "Nizam's Institute of Medical Sciences", lat: 17.4116, lng: 78.4530, trauma_level: 1, specialties: ["trauma", "neuro"] },
  { name: "Yashoda Hospital Secunderabad", lat: 17.4399, lng: 78.4983, trauma_level: 1, specialties: ["trauma", "cardiology"] },
  { name: "Apollo Hospital Jubilee Hills", lat: 17.4156, lng: 78.4066, trauma_level: 1, specialties: ["trauma", "ortho"] },
  { name: "Care Hospital Banjara Hills", lat: 17.4126, lng: 78.4480, trauma_level: 2, specialties: ["emergency"] },
  { name: "Govt General Hospital", lat: 17.3800, lng: 78.4744, trauma_level: 2, specialties: ["general"] },
  { name: "Medicover Neopolis", lat: 17.4947, lng: 78.3996, trauma_level: 2, specialties: ["ortho"] },
  { name: "MaxCure Madhapur", lat: 17.4482, lng: 78.3888, trauma_level: 3, specialties: ["emergency"] },
  { name: "Citizens Specialty", lat: 17.4225, lng: 78.4560, trauma_level: 3, specialties: ["general"] },
];

const DEFAULT_CENTER: [number, number] = [17.3850, 78.4867];

type Incident = {
  id: number;
  severity: string;
  hospital?: string;
  hospital_dist?: number;
  vehicles?: number;
  pedestrian?: boolean;
  timestamp?: string;
  location_lat: number;
  location_lng: number;
};

type Hospital = {
  name: string;
  lat: number;
  lng: number;
  trauma_level: number;
  specialties?: string[];
};

const sevColor: Record<string, string> = {
  CRITICAL: "#ff2d2d",
  HIGH: "#ff6b00",
  MEDIUM: "#f59e0b",
  MODERATE: "#f59e0b",
  LOW: "#22c55e",
};

const hospitalIcon = L.divIcon({
  className: "",
  html: '<div style="width:14px;height:14px;background:#00d4aa;border:2px solid #0a0c10;border-radius:2px;box-shadow:0 0 0 1px rgba(0,212,170,0.4)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function IncidentMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>(FALLBACK_HOSPITALS);

  useEffect(() => {
    fetch("/api/incidents?limit=200")
      .then(r => r.ok ? r.json() : [])
      .then(setIncidents)
      .catch(() => setIncidents([]));

    fetch("/api/hospitals")
      .then(r => r.ok ? r.json() : FALLBACK_HOSPITALS)
      .then(d => setHospitals(d.length ? d : FALLBACK_HOSPITALS))
      .catch(() => setHospitals(FALLBACK_HOSPITALS));
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
      <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
        <span className="uppercase tracking-wider text-xs text-gray-400 font-semibold">Live Incident Map</span>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        minZoom={3}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        style={{ height: "420px", width: "100%", background: "#0d0f14" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />

        {hospitals.map((h, i) => (
          <Marker key={`h-${i}`} position={[h.lat, h.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-sm">
                <b>{h.name}</b><br />
                Trauma Level {h.trauma_level}<br />
                <span className="text-xs text-gray-500">{(h.specialties || []).join(" • ")}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {incidents.map(inc => {
          if (!inc.location_lat || !inc.location_lng) return null;
          const color = sevColor[inc.severity] || "#888";
          return (
            <CircleMarker
              key={inc.id}
              center={[inc.location_lat, inc.location_lng]}
              radius={9}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
            >
              <Popup>
                <div className="text-sm">
                  <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{inc.severity}</span>
                  <div className="text-xs mt-1">{(inc.timestamp || "").substring(0, 19)}</div>
                  {inc.hospital && <div className="text-xs mt-1">Hospital: <b>{inc.hospital}</b> {inc.hospital_dist && `(${inc.hospital_dist} km)`}</div>}
                  {inc.vehicles !== undefined && <div className="text-xs mt-1">Vehicles: <b>{inc.vehicles}</b>{inc.pedestrian ? " • Pedestrian" : ""}</div>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="flex flex-wrap gap-4 px-5 py-2 border-t border-gray-700 text-xs text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: "#ff2d2d" }}></span>Critical</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: "#ff6b00" }}></span>High</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: "#f59e0b" }}></span>Medium</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: "#22c55e" }}></span>Low</span>
        <span><span className="inline-block w-2 h-2 mr-1 align-middle" style={{ background: "#00d4aa", borderRadius: 2 }}></span>Hospital</span>
      </div>
    </div>
  );
}
