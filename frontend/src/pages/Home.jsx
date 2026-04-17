import { useState, useEffect } from "react";
import axios from "axios";
import JobCard from "../components/JobCard";
import JobDrawer from "../components/JobDrawer";

const API = import.meta.env.VITE_API_URL;

const LEVELS = ["graduate", "junior", "intermediate", "senior"];
const TYPES = ["Permanent", "Contract", "Temporary"];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailJob, setDetailJob] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    job_type: "",
    experience_level: "",
    is_graduate_friendly: "",
  });

  const [search, setSearch] = useState("");


const fetchJobs = async (p = 1) => {
  setLoading(true);
  try {
    const params = { page: p, limit: 20, ...filters };
    if (search) params.keyword = search;
    const res = await axios.get(`${API}/jobs`, { params });
    setJobs(res.data.data);
    setTotal(res.data.length);
  } catch (err) {
    if (err.response?.status === 404) {
      setJobs([]);
      setTotal(0);
    } else {
      console.error(err);
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchJobs(page, filters, search);
}, [page, filters]);

const handleSearch = (e) => {
  e.preventDefault();
  setPage(1);
  fetchJobs(1, filters, search);
};

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API}/jobs/${job.id}`);
      setDetailJob(res.data.data);
    } catch {
      setDetailJob(job);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClose = () => {
    setSelectedJob(null);
    setDetailJob(null);
  };

  const setFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: f[key] === val ? "" : val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ keyword: "", job_type: "", experience_level: "", is_graduate_friendly: "" });
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    filters.experience_level || filters.job_type || filters.is_graduate_friendly || search;

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
          <a href="/" className="text-amber-400 text-sm font-semibold border-b border-amber-400 pb-0.5">Jobs</a>
          <a href="/skills" className="text-zinc-400 hover:text-white text-sm transition-colors">Skills</a>
          <a href="/salaries" className="text-zinc-400 hover:text-white text-sm transition-colors">Salaries</a>
          <div className="flex items-center gap-1 text-zinc-500 text-xs ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Updated nightly
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-6 pt-12 pb-8 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          SA Dev Jobs,{" "}
          <span className="text-amber-400">all in one place.</span>
        </h1>
        <p className="text-zinc-400 text-base mt-3 mb-8">
          {total > 0 ? `${total} live listings` : "Live listings"} scraped
          nightly from CareerJunction &amp; more.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, skill or keyword..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter("experience_level", lvl)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filters.experience_level === lvl
                  ? "bg-amber-500 border-amber-500 text-black font-semibold"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {lvl}
            </button>
          ))}
          <div className="w-px bg-zinc-800 mx-1" />
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter("job_type", t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filters.job_type === t
                  ? "bg-amber-500 border-amber-500 text-black font-semibold"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setFilter("is_graduate_friendly", "true")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filters.is_graduate_friendly === "true"
                ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            Graduate friendly
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors ml-1"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Job list */}
        {loading ? (
          <div className="grid gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-28"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-xs px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-500 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={handleJobClick} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && jobs.length > 0 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-zinc-500">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={jobs.length < 20}
              className="px-4 py-2 text-sm border border-zinc-700 rounded-lg text-zinc-400 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Job detail drawer */}
      {selectedJob && (
        <JobDrawer
          job={loadingDetail ? selectedJob : detailJob}
          onClose={handleClose}
        />
      )}
    </div>
  );
}