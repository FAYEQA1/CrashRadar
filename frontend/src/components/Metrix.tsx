import { useState } from "react";

const Metrics = () => {
  const [metrics] = useState([
    { label: "Incidents Processed", value: 0 },
    { label: "Accuracy Rate", value: 0 },
    { label: "Active Cameras", value: 0 },
    { label: "Avg Response", value: 0 }
  ]);

  return (
    <section className="px-6 md:px-16 py-10 md:py-12 ">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        {metrics.map((metric, i) => (
          <div
            key={i}
            className="bg-[#F8F5F0] border border-[#DCD7C9] rounded-2xl overflow-hidden text-center"
          >

            {/* 🔥 DARK TOP BAND */}
            <div className="h-1 bg-[#A27B5C]/50"></div>

            {/* CONTENT */}
            <div className="p-6">

              <p className="text-[12px] font-mono uppercase tracking-[0.3em] text-[#A27B5C] mb-3">
                {metric.label}
              </p>

              <p className="text-4xl font-black text-[#2C3639]">
                {metric.value}
                {metric.label === "Accuracy Rate" ? "%" : ""}
                {metric.label === "Avg Response" ? "s" : ""}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
};

export default Metrics;