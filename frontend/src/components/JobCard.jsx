export default function JobCard({ job, onClick }) {
  const levelColors = {
    graduate: "bg-emerald-900/40 text-emerald-400 border border-emerald-800",
    junior: "bg-sky-900/40 text-sky-400 border border-sky-800",
    intermediate: "bg-violet-900/40 text-violet-400 border border-violet-800",
    senior: "bg-amber-900/40 text-amber-400 border border-amber-800",
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Undisclosed";
    const fmt = (n) => `R${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max)}`;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={() => onClick(job)}
      className="group cursor-pointer bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-amber-400 transition-colors truncate">
            {job.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-0.5">{job.company}</p>
        </div>
        {job.experience_level && (
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[job.experience_level] || "bg-zinc-800 text-zinc-400"}`}
          >
            {job.experience_level}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.location || "Gauteng"}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {job.job_type || "—"}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(job.date_posted)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-amber-400 text-sm font-medium">
          {formatSalary(job.salary_min, job.salary_max)}
        </span>
        {job.is_graduate_friendly ? (
          <span className="text-xs text-emerald-500">✓ Graduate friendly</span>
        ) : null}
      </div>
    </div>
  );
}