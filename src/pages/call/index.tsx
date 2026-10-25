import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CallStats from "./components/CallStats";
import CallToolbar from "./components/CallToolbar";
import CandidateList from "./components/CandidateList";
import JobDetailsDialog from "./components/JobDetailsDialog";
import CallFiltersDialog, { CallFiltersState, EMPTY_CALL_FILTERS } from "./components/CallFiltersDialog";
import { callService, CandidateCallItem } from "../../services/callService";
import { callStateCache } from "./components/callStateCache";
import { MyWorkspace } from "../../services/organizationService";
import { Job, jobPostService } from "../../services/jobPostService";
import JobCandidateProfile from "../companies/components/JobCandidateProfile";
import apiClient from "../../services/api";
import { sortStages } from "../../utils/stageUtils";
import { showToast } from "../../utils/toast";
import { UploadCloud, X, Loader2 } from "lucide-react";

export const CallPage: React.FC = () => {
  const navigate = useNavigate();

  // Read preserved state if returning from Call Page or other route
  const cached = callStateCache.get();

  // Initial loading state: true only if companies not already in cache
  const [isInitialLoading, setIsInitialLoading] = useState(
    () => !(cached?.companies && cached.companies.length > 0)
  );
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Companies & Jobs
  const [companies, setCompanies] = useState<MyWorkspace[]>(() => cached?.companies || []);
  const [jobs, setJobs] = useState<Job[]>(() => cached?.jobs || []);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(() => cached?.selectedCompanyId ?? null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(() => cached?.selectedJobId ?? null);

  // Candidates & Filtering & Pagination
  const [candidates, setCandidates] = useState<CandidateCallItem[]>(() => cached?.candidates || []);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [hasFetched, setHasFetched] = useState(() => cached?.hasFetched || false);
  const [filters, setFilters] = useState<CallFiltersState>(() => cached?.filters || EMPTY_CALL_FILTERS);
  const [selectedScoreRange, setSelectedScoreRange] = useState<string | null>(() => cached?.selectedScoreRange || null);
  const [searchQuery, setSearchQuery] = useState<string>(() => cached?.searchQuery || "");

  const [currentPage, setCurrentPage] = useState(() => cached?.currentPage || 1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(() => cached?.totalCount || 0);

  // Candidate Details Profile View (JobCandidateProfile)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isLoadingCandidateProfile, setIsLoadingCandidateProfile] = useState(false);
  const [stages, setStages] = useState<any[]>(() => cached?.stages || []);

  // Dialog states
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Stages for a Job (only when needed)
  const fetchStages = useCallback(async (jId: number) => {
    try {
      const response = await apiClient.get(`/jobs/applications/stages/?job_id=${jId}`);
      const sorted = sortStages(response.data || []);
      setStages(sorted);
      callStateCache.set({ stages: sorted });
    } catch (e) {
      setStages([]);
    }
  }, []);

  // 1. Initial Page Load: ONLY fetch companies if not already cached.
  // Reuses cached companies, jobs, and candidates without triggering API calls when returning.
  useEffect(() => {
    if (companies.length > 0) {
      setIsInitialLoading(false);
      return;
    }

    let isCancelled = false;
    setIsInitialLoading(true);
    callService
      .getCompanies()
      .then((workspaces) => {
        if (!isCancelled) {
          setCompanies(workspaces);
          callStateCache.set({ companies: workspaces });
        }
      })
      .catch((err) => {
        console.error("Failed to load initial call page companies:", err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Check if a call was completed in CandidateCallPage and update candidate status without reloading
  useEffect(() => {
    try {
      const lastCallRaw = sessionStorage.getItem("nxthyre_last_call_completed");
      if (lastCallRaw) {
        const lastCall = JSON.parse(lastCallRaw);
        sessionStorage.removeItem("nxthyre_last_call_completed");

        if (lastCall?.candidateId) {
          setCandidates((prev) => {
            const updated = prev.map((item) => {
              const cId = item.candidate?.id || item.id;
              if (String(cId) === String(lastCall.candidateId)) {
                return {
                  ...item,
                  latest_manual_call_status: lastCall.callStatus || "completed",
                  latest_manual_call_at: lastCall.callTime || new Date().toISOString(),
                  latest_manual_call_note:
                    lastCall.noteText || item.latest_manual_call_note || "Call completed",
                };
              }
              return item;
            });
            callStateCache.set({ candidates: updated });
            return updated;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to check last completed call:", e);
    }
  }, []);

  // 2. Select Company: Fetch jobs for company only. Candidate calls stay disabled.
  const handleSelectCompany = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setSelectedJobId(null);
    setJobs([]);
    setCandidates([]);
    setHasFetched(false);
    setTotalCount(0);
    setCurrentPage(1);

    callStateCache.set({
      selectedCompanyId: companyId,
      selectedJobId: null,
      jobs: [],
      candidates: [],
      hasFetched: false,
      totalCount: 0,
      currentPage: 1,
    });

    setIsLoadingJobs(true);
    callService
      .getJobs(companyId)
      .then((jobList) => {
        setJobs(jobList);
        callStateCache.set({ jobs: jobList });
      })
      .catch((err) => {
        console.error("Failed to load jobs for company:", err);
        setJobs([]);
      })
      .finally(() => {
        setIsLoadingJobs(false);
      });
  };

  // 3. Select Job: Set selected job. Candidate calls stay disabled until user clicks Fetch Candidates.
  const handleSelectJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setCandidates([]);
    setHasFetched(false);
    setTotalCount(0);
    setCurrentPage(1);

    callStateCache.set({
      selectedJobId: jobId,
      candidates: [],
      hasFetched: false,
      totalCount: 0,
      currentPage: 1,
    });
  };

  // 4. Fetch candidates function with pagination
  const fetchCandidates = useCallback(
    async (
      jobIdToFetch: number,
      currentFilters: CallFiltersState,
      page: number = 1
    ) => {
      setIsLoadingCandidates(true);
      try {
        const res = await callService.getCandidates(jobIdToFetch, {
          location: currentFilters.location,
          salaryRange: currentFilters.salaryRange,
          experience: currentFilters.experience,
          designation: currentFilters.designation,
          noticePeriod: currentFilters.noticePeriod,
          attention: currentFilters.attention,
          page,
          pageSize,
        });
        setCandidates(res.candidates || []);
        setTotalCount(res.total || res.candidates?.length || 0);
        setCurrentPage(page);
        setHasFetched(true);

        callStateCache.set({
          candidates: res.candidates || [],
          totalCount: res.total || res.candidates?.length || 0,
          currentPage: page,
          hasFetched: true,
          filters: currentFilters,
        });
      } catch (err) {
        console.error("Failed to load candidates:", err);
        showToast.error("Failed to fetch candidates");
      } finally {
        setIsLoadingCandidates(false);
      }
    },
    [pageSize]
  );

  // 5. Fetch Candidates button click (On demand)
  const handleFetchCandidatesClick = () => {
    if (!selectedCompanyId) {
      showToast.error("Please select a company first");
      return;
    }
    if (!selectedJobId) {
      showToast.error("Please select a job first");
      return;
    }
    fetchCandidates(selectedJobId, filters, 1);
    fetchStages(selectedJobId);
  };

  // Handle Filter Application
  const handleApplyFilters = (newFilters: CallFiltersState) => {
    setFilters(newFilters);
    callStateCache.set({ filters: newFilters });
    if (selectedJobId && hasFetched) {
      fetchCandidates(selectedJobId, newFilters, 1);
    }
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (selectedJobId && hasFetched) {
      fetchCandidates(selectedJobId, filters, newPage);
    }
  };

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location?.length) count += filters.location.length;
    if (filters.designation?.length) count += filters.designation.length;
    if (filters.attention?.length) count += filters.attention.length;
    if (filters.scoreRange?.length) count += filters.scoreRange.length;
    if (filters.experience?.min || filters.experience?.max) count += 1;
    if (filters.salaryRange?.min || filters.salaryRange?.max) count += 1;
    if (filters.noticePeriod?.selected?.length) count += filters.noticePeriod.selected.length;
    if (filters.noticePeriod?.minDays || filters.noticePeriod?.maxDays) count += 1;
    return count;
  }, [filters]);

  // Helper to extract candidate match score
  const getCandidateScore = (item: CandidateCallItem): number | null => {
    const cand = item.candidate || {};
    const s =
      item.score ??
      item.job_score?.candidate_match_score?.score ??
      item.job_score_obj?.candidate_match_score?.score ??
      cand.score ??
      cand.candidate_match_score?.score ??
      null;
    if (s === null || s === undefined || s === "") return null;
    const clean = String(s).replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? null : Math.round(num);
  };

  // Helper to test if score is within range e.g. "80-100"
  const isScoreInRange = (score: number | null, rangeStr: string): boolean => {
    if (score === null) return false;
    const [minStr, maxStr] = rangeStr.split("-");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return score >= min && score <= max;
  };

  // Combined active score ranges from toolbar dropdown & filters dialog
  const activeScoreRanges = useMemo(() => {
    const ranges = new Set<string>();
    if (selectedScoreRange) ranges.add(selectedScoreRange);
    if (filters.scoreRange?.length) {
      filters.scoreRange.forEach((r) => ranges.add(r));
    }
    return Array.from(ranges);
  }, [selectedScoreRange, filters.scoreRange]);

  // Candidates filtered by Resume Score numerical ranges & search query
  const displayCandidates = useMemo(() => {
    let list = candidates;
    if (activeScoreRanges.length > 0) {
      list = list.filter((cand) => {
        const score = getCandidateScore(cand);
        return activeScoreRanges.some((range) => isScoreInRange(score, range));
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const cand = item.candidate || {};
        const name = (cand.full_name || "").toLowerCase();
        const company = (cand.current_company || "").toLowerCase();
        const headline = (cand.headline || "").toLowerCase();
        const location = (cand.location || "").toLowerCase();
        const notes = (item.latest_manual_call_note || item.latest_call_note || "").toLowerCase();
        return (
          name.includes(q) ||
          company.includes(q) ||
          headline.includes(q) ||
          location.includes(q) ||
          notes.includes(q)
        );
      });
    }
    return list;
  }, [candidates, activeScoreRanges, searchQuery]);

  // Candidate Actions: Call
  const handleCallCandidate = (item: CandidateCallItem) => {
    const cand = item.candidate || {};
    const effectiveJobId = selectedJobId || 0;

    const callData = {
      id: cand.id,
      name: cand.full_name || "Unknown Candidate",
      avatarInitials: cand.full_name
        ? cand.full_name.substring(0, 2).toUpperCase()
        : "NA",
      headline: cand.headline || "",
      currentCtc: cand.current_salary_lpa
        ? `${cand.current_salary_lpa} LPA`
        : cand.current_salary
          ? `${cand.current_salary} LPA`
          : "--",
      expectedCtc: cand.expected_ctc ? `${cand.expected_ctc} LPA` : "--",
      noticePeriod: cand.notice_period_days
        ? `${cand.notice_period_days} days`
        : cand.notice_period_summary || "--",
      location: cand.location || "--",
      experience: cand.total_experience
        ? `${cand.total_experience} yrs`
        : cand.experience_years
          ? `${cand.experience_years} yrs`
          : "--",
      resumeUrl: cand.premium_data?.resume_url || cand.resume_url || "",
      matchScore:
        item.score ??
        item.job_score?.candidate_match_score?.score ??
        cand.score ??
        null,
    };

    const candidateIds = candidates.map((c) => c.candidate?.id || c.id).filter(Boolean);

    sessionStorage.setItem(
      "_nxthyre_call_state",
      JSON.stringify({
        candidate: callData,
        candidateList: candidateIds,
      })
    );

    // Save full listing state to cache before navigating
    callStateCache.set({
      companies,
      jobs,
      selectedCompanyId,
      selectedJobId,
      candidates,
      totalCount,
      currentPage,
      filters,
      selectedScoreRange,
      searchQuery,
      hasFetched,
      stages,
    });

    // Navigate to expected call route: /call/:jobId/:candidateId?mode=manual
    navigate(`/call/${effectiveJobId}/${cand.id}?mode=manual`);
  };

  // Candidate Actions: Profile (Renders JobCandidateProfile as in Screenshot 1)
  const handleViewProfile = async (item: CandidateCallItem) => {
    setIsLoadingCandidateProfile(true);
    const cand = item.candidate || {};
    const candidateName = cand.full_name || "Profile";
    const wsName = companies.find((c) => c.id === selectedCompanyId)?.name;
    const jTitle = jobs.find((j) => j.id === selectedJobId)?.title;

    // Update window header for breadcrumbs
    (window as any).__selectedWorkspaceName = wsName;
    (window as any).__selectedJobName = jTitle;
    (window as any).__selectedCandidateName = candidateName;
    window.dispatchEvent(new CustomEvent("header-update"));

    try {
      let fullCandidateData: any = null;
      if (item.id && String(item.id).length < 20 && !String(item.id).includes("-")) {
        // Numeric job application ID
        const res = await apiClient.get(`/jobs/applications/${item.id}/`);
        fullCandidateData = res.data;
      } else {
        const candId = cand.id || item.id;
        const res = await apiClient.get(`/candidates/${candId}/?job_id=${selectedJobId}`);
        fullCandidateData = res.data;
      }

      if (fullCandidateData) {
        if (!fullCandidateData.candidate) {
          fullCandidateData = {
            ...item,
            ...fullCandidateData,
            candidate: fullCandidateData,
          };
        } else {
          fullCandidateData = {
            ...item,
            ...fullCandidateData,
          };
        }
      }
      setSelectedCandidate(fullCandidateData || (item.candidate ? item : { ...item, candidate: item }));
    } catch (err) {
      console.warn("Using local candidate data for profile view:", err);
      const fallback = item.candidate ? item : { ...item, candidate: item };
      setSelectedCandidate(fallback);
    } finally {
      setIsLoadingCandidateProfile(false);
    }
  };

  // Handle breadcrumb back navigation
  useEffect(() => {
    const handleBreadcrumbNavigate = (e: any) => {
      if (
        e.detail?.level === "job" ||
        e.detail?.level === "workspace" ||
        e.detail?.level === "companies"
      ) {
        delete (window as any).__selectedCandidateName;
        window.dispatchEvent(new CustomEvent("header-update"));
        setSelectedCandidate(null);
      }
    };
    window.addEventListener("breadcrumb-navigate", handleBreadcrumbNavigate);
    return () =>
      window.removeEventListener("breadcrumb-navigate", handleBreadcrumbNavigate);
  }, []);

  // Candidate Profile Next / Prev navigation
  const currentCandidateIndex = useMemo(() => {
    if (!selectedCandidate) return -1;
    const sId = selectedCandidate.candidate?.id || selectedCandidate.id;
    return candidates.findIndex((c) => (c.candidate?.id || c.id) === sId);
  }, [selectedCandidate, candidates]);

  const handleCandidatePrev = () => {
    if (currentCandidateIndex > 0) {
      handleViewProfile(candidates[currentCandidateIndex - 1]);
    }
  };

  const handleCandidateNext = () => {
    if (currentCandidateIndex < candidates.length - 1) {
      handleViewProfile(candidates[currentCandidateIndex + 1]);
    }
  };

  // Upload candidates handler
  const handleUploadSubmit = async () => {
    if (!uploadFiles || uploadFiles.length === 0 || !selectedJobId) {
      showToast.error("Please select files to upload");
      return;
    }
    setIsUploading(true);
    const toastId = showToast.loading("Uploading resumes...");
    try {
      const filesArray = Array.from(uploadFiles);
      await jobPostService.uploadResumes(selectedJobId, filesArray);
      showToast.success("Candidates uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFiles(null);
      fetchCandidates(selectedJobId, filters, 1);
    } catch (err: any) {
      console.error("Resume upload failed:", err);
      showToast.error(err.message || "Failed to upload candidates");
    } finally {
      setIsUploading(false);
      showToast.dismiss(toastId);
    }
  };

  // Initial Loading Screen (ensures page isn't shown before company & job data arrive)
  if (isInitialLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4F5F7]">
        {/* Shimmer Stats */}
        <div className="px-6 lg:px-8 pt-6 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[88px] bg-white rounded-2xl border border-gray-100 shadow-xs animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="w-20 h-3 bg-gray-200 rounded" />
                <div className="w-24 h-7 bg-gray-200 rounded mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Shimmer Toolbar (Full-width white band) */}
        <div className="w-full bg-white border-y border-[#E5E7EB] px-6 lg:px-8 py-3.5 my-1">
          <div className="flex items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-44 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div className="w-60 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div className="w-36 h-10 bg-blue-100/60 rounded-xl animate-pulse" />
              <div className="w-36 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
              <div className="w-24 h-10 bg-white rounded-xl border border-gray-100 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading Indicator & Shimmer Table */}
        <div className="px-6 lg:px-8 py-4 flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-center py-1 gap-2 text-xs text-gray-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 text-[#0F47F2] animate-spin" />
            <span>Loading workspaces, jobs, and candidates...</span>
          </div>

        </div>

        {/* Shimmer Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 flex items-center">
            <div className="w-full h-3 bg-gray-100 rounded" />
          </div>
          <div className="divide-y divide-[#F0F2F5]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 h-[76px] flex items-center justify-between animate-pulse">
                <div className="flex flex-col gap-1.5 w-48">
                  <div className="w-32 h-3.5 bg-gray-200 rounded" />
                  <div className="w-24 h-2.5 bg-gray-100 rounded" />
                </div>
                <div className="w-6 h-3 bg-gray-200 rounded" />
                <div className="w-12 h-3 bg-gray-200 rounded" />
                <div className="w-12 h-3 bg-gray-200 rounded" />
                <div className="w-10 h-3 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
                <div className="w-24 h-3 bg-gray-200 rounded" />
                <div className="w-14 h-3 bg-gray-200 rounded" />
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  <div className="w-9 h-9 rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  

  // If a candidate is selected, display the full JobCandidateProfile page
  if (selectedCandidate) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F3F5F7] overflow-hidden">
        <JobCandidateProfile
          candidate={selectedCandidate}
          jobId={selectedJobId}
          workspaceId={selectedCompanyId || undefined}
          stages={stages}
          goBack={() => {
            delete (window as any).__selectedCandidateName;
            window.dispatchEvent(new CustomEvent("header-update"));
            setSelectedCandidate(null);
          }}
          loading={isLoadingCandidateProfile}
          currentIndex={currentCandidateIndex}
          totalCandidates={candidates.length}
          candidateList={candidates}
          onNavigatePrev={currentCandidateIndex > 0 ? handleCandidatePrev : undefined}
          onNavigateNext={
            currentCandidateIndex < candidates.length - 1 ? handleCandidateNext : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4F5F7] custom-scrollbar">
      {/* ── Call Statistics Cards (padded on grey canvas) ── */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <CallStats />
      </div>

      {/* ── Company / Job Selectors & Action Buttons (Full-Width White Band) ── */}
      <div className="w-full bg-white border-y border-[#E5E7EB] px-6 lg:px-8 py-3.5 my-1">
        <CallToolbar
          companies={companies}
          jobs={jobs}
          selectedCompanyId={selectedCompanyId}
          selectedJobId={selectedJobId}
          onSelectCompany={handleSelectCompany}
          onSelectJob={handleSelectJob}
          onFetchCandidates={handleFetchCandidatesClick}
          onUploadCandidates={() => setIsUploadModalOpen(true)}
          onOpenJobDetails={() => setIsJobDetailsOpen(true)}
          onOpenFilters={() => setIsFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          isLoadingCandidates={isLoadingCandidates}
          isLoadingJobs={isLoadingJobs}
          selectedScoreRange={selectedScoreRange}
          onSelectScoreRange={(range) => {
            setSelectedScoreRange(range);
            callStateCache.set({ selectedScoreRange: range });
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            callStateCache.set({ searchQuery: q });
          }}
        />
      </div>

      {/* ── Candidate Screening Table ── */}
      <div className="px-6 lg:px-8 py-4 flex-1">
        <CandidateList
          candidates={displayCandidates}
          isLoading={isLoadingCandidates}
          hasSelectedJob={Boolean(selectedJobId)}
          hasFetched={hasFetched}
          jobId={selectedJobId}
          onCallCandidate={handleCallCandidate}
          onViewProfile={handleViewProfile}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ── Job Details Dialog (View button left of Filters) ── */}
      {isJobDetailsOpen && (
        <JobDetailsDialog
          isOpen={isJobDetailsOpen}
          onClose={() => setIsJobDetailsOpen(false)}
          jobId={selectedJobId}
          initialJob={jobs.find((j) => j.id === selectedJobId) || null}
          companyName={companies.find((c) => c.id === selectedCompanyId)?.name}
        />
      )}

      {/* ── Complete Filters Dialog (matching Screenshot 2) ── */}
      {isFiltersOpen && (
        <CallFiltersDialog
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onApply={handleApplyFilters}
          initialFilters={filters}
          jobId={selectedJobId}
        />
      )}

      {/* ── Upload Candidates Modal ── */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isUploading && setIsUploadModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Upload Candidates</h3>
              <button
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Upload PDF or DOCX candidate resumes for the selected job.
            </p>

            <div className="border-2 border-dashed border-gray-200 hover:border-[#0F47F2] rounded-xl p-6 text-center transition cursor-pointer bg-gray-50/50">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc"
                id="call-resume-upload-input"
                className="hidden"
                onChange={(e) => setUploadFiles(e.target.files)}
              />
              <label
                htmlFor="call-resume-upload-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <UploadCloud className="w-8 h-8 text-[#0F47F2] mb-2" />
                <span className="text-xs font-semibold text-gray-700">
                  {uploadFiles && uploadFiles.length > 0
                    ? `${uploadFiles.length} file(s) selected`
                    : "Click to browse or drag and drop files"}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">PDF, DOCX up to 10MB</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={isUploading || !uploadFiles || uploadFiles.length === 0}
                onClick={handleUploadSubmit}
                className="flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-[#0F47F2] hover:bg-[#0c39c2] rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload & Parse</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallPage;
