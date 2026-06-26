import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const Metrics = () => {
  const [metrics, setMetrics] = useState([
    { label: "Total Incidents Logged", value: 0 },
    { label: "Critical Incidents", value: 0 },
    { label: "High Severity", value: 0 },
    { label: "Low + Medium", value: 0 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/incidents/stats`);
        const data = await res.json();

        setMetrics([
          {
            label: "Total Incidents Logged",
            value: data.total || 0,
          },
          {
            label: "Critical Incidents",
            value: data.critical || 0,
          },
          {
            label: "High Severity",
            value: data.high || 0,
          },
          {
            label: "Low + Medium",
            value: (data.low || 0) + (data.medium || 0),
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="px-6 md:px-16 py-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="bg-[#F8F5F0] border border-[#DCD7C9] rounded-2xl overflow-hidden text-center hover:shadow-lg transition-all duration-300"
          >
            {/* Top Accent */}
            <div className="h-1 bg-[#A27B5C]/50"></div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[12px] font-mono uppercase tracking-[0.25em] text-[#A27B5C] mb-3">
                {metric.label}
              </p>

              <p className="text-4xl font-black text-[#2C3639]">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Metrics;