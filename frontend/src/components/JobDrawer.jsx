export default function JobDrawer({ job, onClose }) {
  if (!job) return null;

  const formatSalary = (min, max) => {
    if (!min && !max) return "Undisclosed";
    const fmt = (n) => `R${(n / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)} /month`;
    if (min) return `From ${fmt(min)} /month`;
    return `Up to ${fmt(max)} /month`;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-lg leading-snug">{job.title}</h2>
            <p className="text-zinc-400 text-sm mt-0.5">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-zinc-500 hover:text-white transition-colors mt-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Location", value: job.location || "Gauteng" },
              { label: "Type", value: job.job_type || "—" },
              { label: "Level", value: job.experience_level || "—" },
              { label: "Posted", value: formatDate(job.date_posted) },
              { label: "Experience", value: job.experience_years_min ? `${job.experience_years_min}–${job.experience_years_max || "+"} years` : "—" },
              { label: "Salary", value: formatSalary(job.salary_min, job.salary_max) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-900 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-0.5">{label}</p>
                <p className="text-white text-sm font-medium capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Graduate badge */}
          {job.is_graduate_friendly ? (
            <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2.5 text-emerald-400 text-sm">
              ✓ This role is open to graduates and entry-level candidates
            </div>
          ) : null}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full border border-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-widest mb-3">About the Role</h3>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description.slice(0, 1500)}
                {job.description.length > 1500 && (
                  <span className="text-zinc-500"> ...read more on CareerJunction</span>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            Apply on {job.source}
          </a>
        </div>
      </div>
    </>
  );
}