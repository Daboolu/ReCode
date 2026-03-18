"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FuturePageClientProps {
  data: { date: string; count: number }[];
}

export default function FuturePageClient({ data }: FuturePageClientProps) {
  const { t, lang } = useTranslation();

  // Process data for charting
  const chartData = data.map((item, index) => {
    const d = new Date(item.date);
    // Format Month/Day (e.g. "3/18") for X Axis
    const displayDate = `${d.getMonth() + 1}/${d.getDate()}`;
    
    let label = displayDate;
    if (index === 0) {
      label = lang === "zh" ? "今天" : "Today";
    }

    return {
      name: label,
      fullDate: item.date,
      count: item.count,
    };
  });

  const totalReviews = data.reduce((sum, item) => sum + item.count, 0);
  const todayReviews = data.length > 0 ? data[0].count : 0;

  return (
    <div className="relative min-h-full w-full">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.7]"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 space-y-8 p-6 md:p-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {t("futurePage.title")}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {t("futurePage.description")}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 flex items-center justify-between border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
                {lang === "zh" ? "未来 30 天总计" : "Next 30 Days"}
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                {totalReviews}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 border border-orange-200 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            </div>
          </div>

          <Link href="/review" className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 flex items-center justify-between border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer group">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">
                {lang === "zh" ? "今日待复习" : "Due Today"}
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-[#ffa116] tracking-tight group-hover:scale-105 origin-left transition-transform">
                {todayReviews}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white border border-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
            </div>
          </Link>
        </div>

        {/* Chart Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.06)] h-[500px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(229, 231, 235, 0.5)",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(value: number) => [
                    `${value} ${t("futurePage.unit")}`,
                    t("futurePage.reviewCount").split(" ")[0] || "Count",
                  ]}
                  labelStyle={{ color: "#374151", marginBottom: "4px" }}
                />
                <Bar
                  dataKey="count"
                  fill="#ffa116"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              <p className="text-lg font-medium tracking-wide">
                {t("futurePage.noTasks")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
