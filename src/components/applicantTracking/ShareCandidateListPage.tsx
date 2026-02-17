import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import candidateService from "../../services/candidateService"; // adjust path

const ShareCandidateListPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current page from URL query param (defaults to 1)
  const currentPage = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(page) || page < 1 ? 1 : page;
  }, [searchParams]);

  // Filter values from URL
  const selectedPipeline = useMemo(
    () => searchParams.get("pipeline") || "",
    [searchParams],
  );
  const selectedStage = useMemo(
    () => searchParams.get("stage") || "",
    [searchParams],
  );

  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 8;
  const largePageSize = 1000; // Adjust based on expected max candidates; assumes API supports large fetches

  // Fetch all applications once (no pagination or filters)
  useEffect(() => {
    const fetchData = async () => {
      console.log(`🔍 Fetching all applications for workspace ${workspaceId}`);

      setLoading(true);
      setError(null);

      if (!workspaceId) {
        console.error("❌ No workspaceId in URL params");
        setError("Missing workspace ID in URL");
        setLoading(false);
        return;
      }

      try {
        const data = await candidateService.getPublicPipelineApplications(
          Number(workspaceId),
          1,
          largePageSize,
        );
        console.log(`✅ Fetched all: ${data.count || 0} items`);

        setAllApplications(data.results || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load pipeline. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let filtered = allApplications;
    if (selectedPipeline) {
      filtered = filtered.filter((app) => app.job?.title === selectedPipeline);
    }
    if (selectedStage) {
      filtered = filtered.filter(
        (app) => (app.current_stage?.name || app.stage_slug) === selectedStage,
      );
    }
    return filtered;
  }, [allApplications, selectedPipeline, selectedStage]);

  // Paginated applications
  const applications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const totalCount = filteredApplications.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Available options from all data
  const availablePipelines = useMemo(
    () =>
      [
        ...new Set(allApplications.map((a) => a.job?.title).filter(Boolean)),
      ].sort(),
    [allApplications],
  );

  const availableStages = useMemo(
    () =>
      [
        ...new Set(
          allApplications
            .map((a) => a.current_stage?.name || a.stage_slug)
            .filter(Boolean),
        ),
      ].sort(),
    [allApplications],
  );

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  // Update URL on page change (preserves filters)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle filter changes (resets page to 1)
  const handlePipelineChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("pipeline", value);
    } else {
      newParams.delete("pipeline");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleStageChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("stage", value);
    } else {
      newParams.delete("stage");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
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

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline
            </label>
            <select
              value={selectedPipeline}
              onChange={(e) => handlePipelineChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Pipelines</option>
              {availablePipelines.map((pipeline) => (
                <option key={pipeline} value={pipeline}>
                  {pipeline}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              {availableStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate List */}
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

                    {/* Stats Row */}
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

                    {/* Pipeline & Stage */}
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
                    {/* Time Added */}
                    <div className="text-[11px] text-gray-400 text-right">
                      {app.time_added}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
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
              {getVisiblePages().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

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
              No candidates matching the filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCandidateListPage;
