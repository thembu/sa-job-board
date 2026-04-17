import { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Salaries() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("avg_max"); // avg_max | avg_min | skill

  useEffect(() => {
    axios
      .get(`${API}/jobs/salaries`)
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...data].sort((a, b) => {
    if (sort === "skill") return a.skill.localeCompare(b.skill);
    return b[sort] - a[sort];
  });

  const maxVal = Math.max(...data.map((d) => d.avg_max), 1);

  const fmt = (n) =>
    n ? `R${Math.round(n / 1000)}k` : "—";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
            <span className="text-black font-black text-xs">SA</span>
          </div>
          <span className="font-bold text-white tracking-tight">DevJobs</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="text-zinc-400 hover:text-white text-sm transition-colors">Jobs</a>
          <a href="/skills" className="text-zinc-400 hover:text-white text-sm transition-colors">Skills</a>
          <a href="/salaries" className="text-amber-400 text-sm font-semibold border-b border-amber-400 pb-0.5">Salaries</a>
          <div className="flex items-center gap-1 text-zinc-500 text-xs ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Updated nightly
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 pt-12 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          SA Dev <span className="text-amber-400">Salaries.</span>
        </h1>
        <p className="text-zinc-400 text-base mt-3">
          Average salary ranges by skill, pulled from live job listings.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Sort controls */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "avg_max", label: "Highest max" },
            { key: "avg_min", label: "Highest min" },
            { key: "skill", label: "A → Z" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                sort === key
                  ? "bg-amber-500 border-amber-500 text-black font-semibold"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <div className="grid gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-16"
              />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">No salary data yet</p>
            <p className="text-sm mt-1">Run the scraper to populate listings</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {sorted.map((row) => {
              const minPct = (row.avg_min / maxVal) * 100;
              const maxPct = (row.avg_max / maxVal) * 100;

              return (
                <div
                  key={row.skill}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">
                      {row.skill}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>
                        <span className="text-zinc-500">min </span>
                        <span className="text-white font-medium">{fmt(row.avg_min)}</span>
                      </span>
                      <span className="text-zinc-700">–</span>
                      <span>
                        <span className="text-zinc-500">max </span>
                        <span className="text-amber-400 font-semibold">{fmt(row.avg_max)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    {/* min bar */}
                    <div
                      className="absolute top-0 left-0 h-full bg-zinc-600 rounded-full"
                      style={{ width: `${minPct}%` }}
                    />
                    {/* max bar layered on top */}
                    <div
                      className="absolute top-0 left-0 h-full bg-amber-500 rounded-full opacity-70"
                      style={{ width: `${maxPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!loading && sorted.length > 0 && (
          <div className="flex items-center gap-5 mt-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded-full bg-zinc-600 inline-block" />
              Avg min salary
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 rounded-full bg-amber-500 opacity-70 inline-block" />
              Avg max salary
            </div>
          </div>
        )}
      </div>
    </div>
  );
}