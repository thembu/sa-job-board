import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API = "http://localhost:3000/api";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("chart"); // 'chart' or 'grid'

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/jobs/skills`);
        setSkills(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const top = skills.slice(0, 20);
  const max = top[0]?.count || 1;

  const chartData = {
    labels: top.map((s) => s.skill),
    datasets: [
      {
        label: "Job listings",
        data: top.map((s) => s.count),
        backgroundColor: top.map((s) => {
          const intensity = s.count / max;
          if (intensity > 0.75) return "#1d4ed8";
          if (intensity > 0.5) return "#3b82f6";
          if (intensity > 0.25) return "#93c5fd";
          return "#bfdbfe";
        }),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} job${ctx.raw !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "#f1f5f9" },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#e4e4e7", font: { size: 12, weight: "500" } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
                <span className="text-black font-black text-xs">SA</span>
              </div>
              <span className="font-bold text-white tracking-tight">DevJobs</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">Jobs</a>
            <a href="/skills" className="text-white text-sm font-medium border-b border-amber-400 pb-0.5">Skills</a>
            <a href="/salaries" className="text-zinc-400 hover:text-white text-sm transition-colors">Salaries</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            Skills in Demand
          </h1>
          <p className="text-zinc-400 text-sm">
            Most requested skills across all SA dev job listings
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView("chart")}
            className={`text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
              view === "chart"
                ? "bg-amber-500 border-amber-500 text-black"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Bar chart
          </button>
          <button
            onClick={() => setView("grid")}
            className={`text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
              view === "grid"
                ? "bg-amber-500 border-amber-500 text-black"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Heatmap grid
          </button>
        </div>

        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 animate-pulse h-96" />
        ) : view === "chart" ? (
          /* Bar Chart */
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div style={{ height: "520px" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          /* Heatmap Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {skills.map((s) => {
              const intensity = s.count / max;
              const bg =
                intensity > 0.75
                  ? "bg-blue-600"
                  : intensity > 0.5
                  ? "bg-blue-500"
                  : intensity > 0.25
                  ? "bg-blue-400"
                  : "bg-blue-300";
              const text =
                intensity > 0.4 ? "text-white" : "text-blue-900";

              return (
                <div
                  key={s.skill}
                  className={`${bg} rounded-xl p-4 flex flex-col justify-between`}
                >
                  <span className={`font-semibold text-sm ${text}`}>
                    {s.skill}
                  </span>
                  <span className={`text-xs mt-2 font-medium ${text} opacity-80`}>
                    {s.count} job{s.count !== 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary stats */}
        {!loading && skills.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{skills.length}</p>
              <p className="text-zinc-400 text-xs mt-0.5">Unique skills tracked</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-amber-400">{skills[0]?.skill}</p>
              <p className="text-zinc-400 text-xs mt-0.5">Most in demand</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{skills[0]?.count}</p>
              <p className="text-zinc-400 text-xs mt-0.5">Jobs for top skill</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}