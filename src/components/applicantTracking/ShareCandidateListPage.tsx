import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import candidateService from "../../services/candidateService"; // adjust path

const ShareCandidateListPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8; // should match the page_size used in the API call

  useEffect(() => {
    const fetchData = async () => {
      //   console.log("🔍 Public page loaded. Workspace ID:", workspaceId); // Debug log

      setLoading(true);
      setError(null);
      //   setCurrentPage(1); // Reset to page 1 on new load

      if (!workspaceId) {
        console.error("❌ No workspaceId in URL params");
        setError("Missing workspace ID in URL");
        setLoading(false);
        return;
      }

      try {
        const data = await candidateService.getPublicPipelineApplications(
          Number(workspaceId),
          pageSize,
        );
        console.log("✅ Fetched applications:", data); // Debug
        console.log("✅ Fetched applications result :", data.length, "items"); // Debug
        setApplications(data || []); // Adjust based on actual API response structure
        setTotalCount(data.length || 0); // Set total count for pagination
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load pipeline. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of list
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading public pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-medium">{error}</p>
          <p className="text-sm mt-2">
            URL should be: /public/workspaces/YOUR_ID/applications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pipeline Candidates
          </h1>
          <p className="text-gray-500 mt-1">
            {totalCount} candidates • Shared from workspace {workspaceId}
          </p>
        </div>

        {/* Candidate List (matches screenshot list style) */}
        <div className="space-y-4">
          {applications.map((app) => {
            const candidate = app.candidate || {};
            const job = app.job || {};
            const currentStage = app.current_stage || {};
            const matchScore = app.job_score?.candidate_match_score || {};
            const expectedCtc = candidate.expected_ctc
              ? `${candidate.expected_ctc}LPA`
              : "-LPA";

            return (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Candidate Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center rounded-2xl flex-shrink-0 shadow-sm">
                        {candidate.avatar ||
                          candidate.full_name?.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Name + Headline */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-xl text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {candidate.full_name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">
                          {candidate.headline}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-2">
                          <span>📍</span>
                          {candidate.location}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row (Experience, Notice, CTCs) */}
                    <div className="grid grid-cols-4 gap-6 mt-6 text-xs">
                      <div>
                        <div className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                          Experience
                        </div>
                        <div className="font-semibold text-gray-900 mt-0.5">
                          {candidate.experience_years}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                          Notice Period
                        </div>
                        <div className="font-semibold text-gray-900 mt-0.5">
                          {candidate.notice_period_summary}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                          Current CTC
                        </div>
                        <div className="font-semibold text-gray-900 mt-0.5">
                          {candidate.current_salary_lpa}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">
                          Expected CTC
                        </div>
                        <div className="font-semibold text-gray-900 mt-0.5">
                          {expectedCtc}
                        </div>
                      </div>
                    </div>

                    {/* Pipeline & Stage (as requested) */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-8 text-xs">
                      <div>
                        <span className="text-gray-400">Pipeline:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {job.title}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Stage:</span>{" "}
                        <span className="font-medium text-gray-900 capitalize">
                          {currentStage.name || app.stage_slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Match Score + Time */}
                  <div className="flex flex-col items-end gap-4 w-48">
                    {/* Match Badge */}
                    <div
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        matchScore.label?.includes("Strong")
                          ? "bg-emerald-100 text-emerald-700"
                          : matchScore.label?.includes("Good")
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {matchScore.label} • {matchScore.score}
                    </div>

                    {/* Time Added */}
                    <div className="text-[11px] text-gray-400 text-right">
                      {app.time_added}
                    </div>

                    {/* Quick skills */}
                    {app.job_score?.quick_fit_summary?.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                        {app.job_score.quick_fit_summary
                          .slice(0, 3)
                          .map((skill: any, idx: number) => (
                            <div
                              key={idx}
                              className={`text-[10px] px-2.5 py-px rounded-full font-medium ${
                                skill.color === "green"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : skill.color === "yellow"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {skill.badge}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination (exact match to screenshot) */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">{startIdx}</span> to{" "}
              <span className="font-semibold text-gray-900">{endIdx}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              candidates
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                ←
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 text-lg">
              No candidates in this pipeline yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCandidateListPage;
