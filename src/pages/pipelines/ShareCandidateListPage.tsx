import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import candidateService from "../../services/candidateService";
import jobPostService from "../../services/jobPostService";
import {
  MapPin,
  Search,
  Filter,
  X,
  ArrowUpRight,
  User,
  Users,
  Briefcase,
  Layers,
  ChevronDown,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  ExternalLink,
  History
} from "lucide-react";

interface ShareCandidateListPageProps {
  workspaceName: string;
}

const getInitialRecruiter = (app: any): string | null => {
  const stageMoves = app.activities?.filter((a: any) => a.type === "stage_move") || [];
  if (stageMoves.length > 0) {
    const sorted = [...stageMoves].sort((a: any, b: any) => {
      const timeA = a.timestamp || a.data?.moved_at || "";
      const timeB = b.timestamp || b.data?.moved_at || "";
      return timeA.localeCompare(timeB);
    });
    const oldest = sorted[0];
    const name = oldest.data?.moved_by_name;
    if (name && name.trim()) {
      return name.trim();
    }
    const extEmail = oldest.data?.external_mover_email;
    if (extEmail && extEmail.trim()) {
      return extEmail.trim();
    }
  }
  if (app.last_moved_by_name && app.last_moved_by_name.trim()) {
    return app.last_moved_by_name.trim();
  }
  return null;
};

const formatRecruiterName = (rawStr?: string): string => {
  if (!rawStr) return "Unknown";
  let str = rawStr.trim();
  if (str.includes("@")) {
    str = str.split("@")[0];
  }
  const cleaned = str.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return rawStr;
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const cleanExp = (exp?: string): string | null => {
  if (!exp) return null;
  const s = String(exp).trim();
  if (!s || s === "-") return null;
  if (s.toLowerCase().includes("yr") || s.toLowerCase().includes("year") || s.toLowerCase().includes("exp")) {
    return s;
  }
  return `${s} yrs`;
};

const cleanCtc = (ctc?: string): string | null => {
  if (!ctc) return null;
  const s = String(ctc).trim();
  if (!s || s === "-" || s === "-LPA" || s === "0") return null;
  if (s.toLowerCase().includes("lpa") || s.toLowerCase().includes("l")) {
    return s;
  }
  return `${s} LPA`;
};

const ShareCandidateListPage: React.FC<ShareCandidateListPageProps> = ({
  workspaceName,
}) => {
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
    [searchParams]
  );
  const selectedStage = useMemo(
    () => searchParams.get("stage") || "",
    [searchParams]
  );
  const selectedInternalRecruiter = useMemo(
    () => searchParams.get("internal_recruiter") || "",
    [searchParams]
  );
  const selectedCompanyRecruiter = useMemo(
    () => searchParams.get("company_recruiter") || "",
    [searchParams]
  );
  const searchQuery = useMemo(
    () => searchParams.get("q") || "",
    [searchParams]
  );

  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [workspaceJobs, setWorkspaceJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit stage activity state
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [newMovedAt, setNewMovedAt] = useState<string>("");

  // Local search text
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const pageSize = 8;
  const largePageSize = 1000;

  // Fetch all applications once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!workspaceId) {
        setError("Missing workspace ID in URL");
        setLoading(false);
        return;
      }

      try {
        let jobsList: any[] = [];
        try {
          const jobsData = await jobPostService.getPaginatedRoles({
            workspace_id: Number(workspaceId),
            page_size: 100,
          });
          jobsList = jobsData.jobs || [];
        } catch (jobErr) {
          console.error("Failed to fetch jobs for workspace:", jobErr);
        }

        const data = await candidateService.getPublicPipelineApplications(
          Number(workspaceId),
          1,
          largePageSize
        );

        setWorkspaceJobs(jobsList);
        setAllApplications(data.results || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load pipeline candidates. Please check URL or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  // Map of jobId -> poc_email
  const jobToPocEmailMap = useMemo(() => {
    const map = new Map<number | string, string>();
    workspaceJobs.forEach((job) => {
      const email = job.poc_email?.trim();
      if (email) {
        if (job.id) {
          map.set(job.id, email);
          map.set(String(job.id), email);
        }
        if (job.job_id) {
          map.set(job.job_id, email);
          map.set(String(job.job_id), email);
        }
      }
    });
    return map;
  }, [workspaceJobs]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let filtered = allApplications;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((app) => {
        const candidate = app.candidate || {};
        const nameMatch = candidate.full_name?.toLowerCase().includes(q);
        const headlineMatch = candidate.headline?.toLowerCase().includes(q);
        const locationMatch = candidate.location?.toLowerCase().includes(q);
        const jobTitleMatch = app.job?.title?.toLowerCase().includes(q);
        return nameMatch || headlineMatch || locationMatch || jobTitleMatch;
      });
    }

    if (selectedPipeline) {
      filtered = filtered.filter((app) => app.job?.title === selectedPipeline);
    }
    if (selectedStage) {
      filtered = filtered.filter(
        (app) => (app.current_stage?.name || app.stage_slug) === selectedStage
      );
    }
    if (selectedInternalRecruiter) {
      filtered = filtered.filter((app) => {
        const initialRec = getInitialRecruiter(app);
        return initialRec === selectedInternalRecruiter;
      });
    }
    if (selectedCompanyRecruiter) {
      const selectedEmailClean = selectedCompanyRecruiter.trim().toLowerCase();
      filtered = filtered.filter((app) => {
        const jobId = app.job?.id || app.job?.job_id;
        if (jobId) {
          const pocEmail =
            jobToPocEmailMap.get(jobId) ||
            jobToPocEmailMap.get(String(jobId)) ||
            jobToPocEmailMap.get(Number(jobId));
          if (pocEmail && pocEmail.trim().toLowerCase() === selectedEmailClean) {
            return true;
          }
        }
        const initialRec = getInitialRecruiter(app);
        return initialRec && initialRec.trim().toLowerCase() === selectedEmailClean;
      });
    }
    return filtered;
  }, [
    allApplications,
    searchQuery,
    selectedPipeline,
    selectedStage,
    selectedInternalRecruiter,
    selectedCompanyRecruiter,
    jobToPocEmailMap,
  ]);

  // Paginated applications
  const applications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage, pageSize]);

  const totalCount = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Options for filter dropdowns
  const availablePipelines = useMemo(
    () =>
      [
        ...new Set(allApplications.map((a) => a.job?.title).filter(Boolean)),
      ].sort(),
    [allApplications]
  );

  const availableStages = useMemo(
    () =>
      [
        ...new Set(
          allApplications
            .map((a) => a.current_stage?.name || a.stage_slug)
            .filter(Boolean)
        ),
      ].sort(),
    [allApplications]
  );

  const availableInternalRecruiters = useMemo(() => {
    const names = new Set<string>();
    allApplications.forEach((app) => {
      const name = getInitialRecruiter(app);
      if (name && name !== "System" && name !== "External Upload") {
        const isInternal =
          !name.includes("@") ||
          name.toLowerCase().endsWith("@valuebound.com") ||
          name.toLowerCase().endsWith("@nxthyre.com");
        if (isInternal) {
          names.add(name);
        }
      }
    });
    return [...names].sort();
  }, [allApplications]);

  const availableCompanyRecruiters = useMemo(() => {
    const emails = new Set<string>();
    allApplications.forEach((app) => {
      const jobId = app.job?.id || app.job?.job_id;
      if (jobId) {
        const pocEmail =
          jobToPocEmailMap.get(jobId) ||
          jobToPocEmailMap.get(String(jobId)) ||
          jobToPocEmailMap.get(Number(jobId));
        if (pocEmail && pocEmail.trim()) {
          emails.add(pocEmail.trim().toLowerCase());
        }
      }
    });
    allApplications.forEach((app) => {
      const name = getInitialRecruiter(app);
      if (name && name.trim() && name.includes("@")) {
        const isExternal =
          !name.toLowerCase().endsWith("@valuebound.com") &&
          !name.toLowerCase().endsWith("@nxthyre.com");
        if (isExternal) {
          emails.add(name.trim().toLowerCase());
        }
      }
    });
    return [...emails].sort();
  }, [allApplications, jobToPocEmailMap]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedPipeline) count++;
    if (selectedStage) count++;
    if (selectedInternalRecruiter) count++;
    if (selectedCompanyRecruiter) count++;
    if (searchQuery) count++;
    return count;
  }, [
    selectedPipeline,
    selectedStage,
    selectedInternalRecruiter,
    selectedCompanyRecruiter,
    searchQuery,
  ]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalSearch("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", localSearch);
  };

  const handleShareClick = (candidateId: string, jobId: string) => {
    const profileUrl = `${window.location.origin}/candidate-profiles/${candidateId}?job_id=${jobId}`;
    window.open(profileUrl, "_blank");
  };

  const handleSaveActivity = async () => {
    if (!currentAppId || !editingActivity) return;
    try {
      await candidateService.updateStageTransition(
        Number(editingActivity),
        newMovedAt
      );
      setAllApplications((prev) =>
        prev.map((app) => {
          if (app.id === currentAppId) {
            return {
              ...app,
              activities: app.activities.map((act: any) => {
                if (act.id === editingActivity) {
                  return {
                    ...act,
                    data: { ...act.data, moved_at: newMovedAt },
                  };
                }
                return act;
              }),
            };
          }
          return app;
        })
      );
      setEditingActivity(null);
      setCurrentAppId(null);
      setNewMovedAt("");
    } catch (err) {
      console.error("Error updating stage transition:", err);
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const delta = 2;
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  const startIdx = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-200 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping"></div>
            <div className="w-12 h-12 rounded-full border-4 border-[#0F47F2] border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Loading Pipeline Candidates</h3>
          <p className="text-sm text-slate-500 mt-1">Fetching candidate applications and workspace data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Unable to Load Pipeline</h3>
          <p className="text-sm text-slate-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 bg-[#0F47F2] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-16 font-sans">
      {/* Top Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F47F2] to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-none">Shared Pipeline View</h1>
                {workspaceName && (
                  <span className="bg-blue-50 text-[#0F47F2] border border-blue-200/60 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {workspaceName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and track candidate progress across recruitment stages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-slate-700">
              <Users className="w-3.5 h-3.5 text-[#0F47F2]" />
              <span>{allApplications.length} Total Candidates</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Metric Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{allApplications.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0F47F2]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipelines</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{availablePipelines.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Stages</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{availableStages.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtered Count</p>
              <h3 className="text-2xl font-bold text-[#0F47F2] mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Candidate Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name, title, or location..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onBlur={() => updateParam("q", localSearch)}
                className="w-full h-10 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    updateParam("q", "");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Clear All Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-red-200/60 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            {/* Pipeline Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Pipeline
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedPipeline}
                  onChange={(e) => updateParam("pipeline", e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all cursor-pointer"
                >
                  <option value="">All Pipelines ({availablePipelines.length})</option>
                  {availablePipelines.map((pipeline) => (
                    <option key={pipeline} value={pipeline}>
                      {pipeline}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Stage
              </label>
              <div className="relative">
                <Layers className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedStage}
                  onChange={(e) => updateParam("stage", e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all cursor-pointer"
                >
                  <option value="">All Stages ({availableStages.length})</option>
                  {availableStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Internal Recruiter Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Internal Recruiter
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedInternalRecruiter}
                  onChange={(e) => updateParam("internal_recruiter", e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all cursor-pointer"
                >
                  <option value="">All Internal Recruiters</option>
                  {availableInternalRecruiters.map((name) => (
                    <option key={name} value={name}>
                      {formatRecruiterName(name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* External Recruiter Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                External Recruiter
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCompanyRecruiter}
                  onChange={(e) => updateParam("company_recruiter", e.target.value)}
                  className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] transition-all cursor-pointer"
                >
                  <option value="">All External Recruiters</option>
                  {availableCompanyRecruiters.map((email) => (
                    <option key={email} value={email}>
                      {formatRecruiterName(email)} ({email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Candidate List Container */}
        <div className="space-y-4">
          {applications.map((app) => {
            const candidate = app.candidate || {};
            const job = app.job || {};
            const currentStage = app.current_stage || {};
            const expText = cleanExp(candidate.experience_years);
            const currentCtcText = cleanCtc(candidate.current_salary_lpa);
            const expectedCtcText = cleanCtc(candidate.expected_ctc);

            const profileUrl = `/candidate-profiles/${candidate.id}?job_id=${job.id}`;
            const initials =
              candidate.avatar ||
              (candidate.full_name
                ? candidate.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "CN");

            const stageActivities = app.activities?.filter(
              (activity: any) => activity.type === "stage_move"
            ) || [];

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                {/* Main Card Content */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-5">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F47F2] to-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/15 group-hover:scale-105 transition-transform">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={profileUrl}
                          className="font-bold text-base text-slate-900 hover:text-[#0F47F2] transition-colors flex items-center gap-1 group/link"
                        >
                          <span className="truncate">{candidate.full_name || "Unnamed Candidate"}</span>
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/link:text-[#0F47F2] transition-colors shrink-0" />
                        </Link>

                        <button
                          onClick={() => handleShareClick(candidate.id, job.id)}
                          className="px-2.5 py-1 bg-blue-50 text-[#0F47F2] hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200/60"
                          title="Open Shareable Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Share Profile
                        </button>
                      </div>

                      {candidate.headline && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                          {candidate.headline}
                        </p>
                      )}

                      {/* Metadata Badges Row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-600">
                        {candidate.location && (
                          <span className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {candidate.location}
                          </span>
                        )}

                        {expText && (
                          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                            Exp: <strong className="text-slate-900 font-semibold">{expText}</strong>
                          </span>
                        )}

                        {candidate.notice_period_summary && (
                          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                            Notice: <strong className="text-slate-900 font-semibold">{candidate.notice_period_summary}</strong>
                          </span>
                        )}

                        {currentCtcText && (
                          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                            Current: <strong className="text-slate-900 font-semibold">{currentCtcText}</strong>
                          </span>
                        )}

                        {expectedCtcText && (
                          <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700">
                            Expected: <strong className="text-slate-900 font-semibold">{expectedCtcText}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pipeline Title & Current Stage Badge */}
                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap md:justify-end">
                      {job.title && (
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {job.title}
                        </span>
                      )}

                      <span className="bg-blue-50 border border-blue-200/80 text-[#0F47F2] px-3 py-1 rounded-lg text-xs font-bold capitalize flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#0F47F2] animate-pulse"></span>
                        {currentStage.name || app.stage_slug || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Footer Bar: Stage History */}
                <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stage History:</span>
                    </div>

                    {stageActivities.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {stageActivities.map((activity: any, idx: number) => {
                          const isEditing = editingActivity === activity.data.id;
                          const movedAt = new Date(activity.data.moved_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });

                          return (
                            <div
                              key={activity.data.id || idx}
                              className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg text-slate-700 shadow-2xs"
                            >
                              {isEditing ? (
                                <div className="flex items-center gap-1.5 py-0.5">
                                  <span className="font-semibold text-slate-800">
                                    {activity.data.to_stage_name}:
                                  </span>
                                  <input
                                    type="datetime-local"
                                    value={newMovedAt.slice(0, 16)}
                                    onChange={(e) => setNewMovedAt(`${e.target.value}:00Z`)}
                                    className="text-xs px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded text-slate-800"
                                  />
                                  <button
                                    onClick={handleSaveActivity}
                                    className="px-2 py-0.5 bg-[#0F47F2] text-white rounded text-[10px] font-bold hover:bg-blue-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingActivity(null);
                                      setCurrentAppId(null);
                                    }}
                                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs">
                                    Moved to <strong className="text-slate-900 font-semibold">{activity.data.to_stage_name}</strong> on <span className="text-slate-500">{movedAt}</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingActivity(activity.data.id);
                                      setCurrentAppId(app.id);
                                      setNewMovedAt(activity.data.moved_at);
                                    }}
                                    className="text-[10px] text-[#0F47F2] hover:underline font-bold ml-1"
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No recent stage updates</span>
                    )}
                  </div>

                  {app.time_added && (
                    <span className="text-[11px] text-slate-400 text-right shrink-0">
                      Added {app.time_added}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center my-6">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Candidates Match Filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, pipeline, stage, or recruiter filters to view candidate records.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="mt-4 px-4 py-2 bg-[#0F47F2] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900 font-bold">{startIdx}</strong> to{" "}
              <strong className="text-slate-900 font-bold">{endIdx}</strong> of{" "}
              <strong className="text-slate-900 font-bold">{totalCount}</strong> candidates
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getVisiblePages().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-semibold"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-[#0F47F2] text-white shadow-xs shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShareCandidateListPage;
