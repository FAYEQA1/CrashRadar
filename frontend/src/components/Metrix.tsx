import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000/api";

const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;

    // Speed of animation (higher = slower)
    const duration = 500;

    // Number of updates
    const steps = 60;

    const increment = value / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= value) {
        current = value;
        clearInterval(timer);
      }

      setCount(Math.floor(current));
    }, interval);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
};

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
        const response = await fetch(`${API_BASE}/incidents/stats`);
        const data = await response.json();

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
      } catch (error) {
        console.error("Failed to load metrics:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="px-6 md:px-16 py-10 md:py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[#F8F5F0] border border-[#DCD7C9] rounded-2xl overflow-hidden text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Top Accent */}
            <div className="h-1 bg-[#A27B5C]/50"></div>

            {/* Card Content */}
            <div className="p-6">

              <p className="text-[12px] font-mono uppercase tracking-[0.25em] text-[#A27B5C] mb-4">
                {metric.label}
              </p>

              <h2 className="text-5xl font-black text-[#2C3639]">
                <AnimatedNumber value={metric.value} />
              </h2>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
};

export default Metrics;