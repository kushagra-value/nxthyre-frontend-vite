import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CallStats from "./components/CallStats";
import CallToolbar from "./components/CallToolbar";
import CandidateList from "./components/CandidateList";
import CallTabs, { CallTabType } from "./components/CallTabs";
import HistoryTab from "./components/HistoryTab";
import ShortlistTab from "./components/ShortlistTab";
import JobDetailsDialog from "./components/JobDetailsDialog";
import CallFiltersDialog, { CallFiltersState, EMPTY_CALL_FILTERS } from "./components/CallFiltersDialog";
import {
  callService,
  CandidateCallItem,
  CallStatsData,
  CallHistoryItem,
} from "../../services/callService";
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

  // Active Tab: Call | History | Shortlist
  const [activeTab, setActiveTab] = useState<CallTabType>(
    () => cached?.activeTab || "call"
  );

  // Companies & Jobs
  const [companies, setCompanies] = useState<MyWorkspace[]>(() => cached?.companies || []);
  const [jobs, setJobs] = useState<Job[]>(() => cached?.jobs || []);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    () => cached?.selectedCompanyId ?? null
  );
  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    () => cached?.selectedJobId ?? null
  );

  // Tab 1: Candidates & Filtering & Pagination (Call Tab)
  const [candidates, setCandidates] = useState<CandidateCallItem[]>(
    () => cached?.candidates || []
  );
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [hasFetched, setHasFetched] = useState(() => cached?.hasFetched || false);
  const [filters, setFilters] = useState<CallFiltersState>(
    () => cached?.filters || EMPTY_CALL_FILTERS
  );
  const [selectedScoreRange, setSelectedScoreRange] = useState<string | null>(
    () => cached?.selectedScoreRange || null
  );
  const [searchQuery, setSearchQuery] = useState<string>(() => cached?.searchQuery || "");

  const [currentPage, setCurrentPage] = useState(() => cached?.currentPage || 1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(() => cached?.totalCount || 0);

  // Tab 2: Call History State
  const [historyItems, setHistoryItems] = useState<CallHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyTotalCount, setHistoryTotalCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  // Tab 3: Shortlist State
  const [shortlistCandidates, setShortlistCandidates] = useState<CandidateCallItem[]>([]);
  const [isLoadingShortlist, setIsLoadingShortlist] = useState(false);
  const [shortlistTotalCount, setShortlistTotalCount] = useState(0);
  const [shortlistPage, setShortlistPage] = useState(1);
  const [hasFetchedShortlist, setHasFetchedShortlist] = useState(false);

  // Candidate Details Profile View (JobCandidateProfile)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isLoadingCandidateProfile, setIsLoadingCandidateProfile] = useState(false);
  const [stages, setStages] = useState<any[]>(() => cached?.stages || []);
  const jobsByWorkspaceRef = useRef<Record<number, Job[]>>({});

  // Call Queue Stats
  const [callStats, setCallStats] = useState<CallStatsData | null>(
    () => cached?.callStats || null
  );
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

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

  // Fetch Call Queue Summary Stats from Backend API
  const fetchCallStats = useCallback(
    async (workspaceId?: number | null, jobId?: number | null) => {
      setIsLoadingStats(true);
      try {
        const statsData = await callService.getCallStats({
          workspace_id: jobId ? undefined : (workspaceId || undefined),
          job_id: jobId || undefined,
        });
        if (statsData) {
          setCallStats(statsData);
          callStateCache.set({ callStats: statsData });
        }
      } catch (err) {
        console.warn("Failed to fetch call queue stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    },
    []
  );

  // Fetch call stats on mount
  useEffect(() => {
    fetchCallStats(selectedCompanyId, selectedJobId);
  }, []);

  // Initial Page Load: ONLY fetch companies if not already cached
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
          fetchCallStats(selectedCompanyId, selectedJobId);

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

  // Fetch Call History
  const fetchCallHistory = useCallback(
    async (jobIdToFetch: number, page: number = 1) => {
      setIsLoadingHistory(true);
      try {
        const res = await callService.getCallHistory(jobIdToFetch, {
          page,
          pageSize,
          search: searchQuery,
        });
        setHistoryItems(res.history || []);
        setHistoryTotalCount(res.total || res.history?.length || 0);
        setHistoryPage(page);
        setHasFetchedHistory(true);
      } catch (err) {
        console.error("Failed to load call history:", err);
        showToast.error("Failed to load call history");
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [pageSize, searchQuery]
  );

  // Fetch Shortlisted Candidates
  const fetchShortlisted = useCallback(
    async (jobIdToFetch: number, page: number = 1) => {
      setIsLoadingShortlist(true);
      try {
        const res = await callService.getShortlistedCandidates(jobIdToFetch, {
          page,
          pageSize,
          search: searchQuery,
        });
        setShortlistCandidates(res.candidates || []);
        setShortlistTotalCount(res.total || res.candidates?.length || 0);
        setShortlistPage(page);
        setHasFetchedShortlist(true);
      } catch (err) {
        console.error("Failed to load shortlisted candidates:", err);
        showToast.error("Failed to load shortlisted candidates");
      } finally {
        setIsLoadingShortlist(false);
      }
    },
    [pageSize, searchQuery]
  );

  // Handle Tab Switch
  const handleTabChange = (newTab: CallTabType) => {
    setActiveTab(newTab);
    callStateCache.set({ activeTab: newTab });

    if (newTab === "history" && selectedJobId && !hasFetchedHistory) {
      fetchCallHistory(selectedJobId, 1);
    } else if (newTab === "shortlist" && selectedJobId && !hasFetchedShortlist) {
      fetchShortlisted(selectedJobId, 1);
    }
  };

  // Select Company
  const handleSelectCompany = (companyId: number) => {
    // Avoid redundant API calls if clicking already selected company with loaded jobs
    if (companyId === selectedCompanyId && jobs.length > 0) {
      return;
    }

    setSelectedCompanyId(companyId);
    setSelectedJobId(null);
    setCandidates([]);
    setHistoryItems([]);
    setShortlistCandidates([]);
    setHasFetched(false);
    setHasFetchedHistory(false);
    setHasFetchedShortlist(false);
    setTotalCount(0);
    setHistoryTotalCount(0);
    setShortlistTotalCount(0);
    setCurrentPage(1);
    setHistoryPage(1);
    setShortlistPage(1);
    fetchCallStats(companyId, null);

    // Reuse in-memory cached jobs for this workspace if already loaded previously
    if (jobsByWorkspaceRef.current[companyId]?.length) {
      const cachedJobs = jobsByWorkspaceRef.current[companyId];
      setJobs(cachedJobs);
      callStateCache.set({
        selectedCompanyId: companyId,
        selectedJobId: null,
        jobs: cachedJobs,
        candidates: [],
        hasFetched: false,
        totalCount: 0,
        currentPage: 1,
      });
      return;
    }

    setJobs([]);
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
        jobsByWorkspaceRef.current[companyId] = jobList;
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

  // Select Job
  const handleSelectJob = (jobId: number) => {
    // Avoid redundant resetting if clicking already selected job
    if (jobId === selectedJobId) {
      return;
    }
    const currentJob = jobs.find((j) => j.id === jobId);
    const jobWsId = currentJob?.workspace_details?.id || (currentJob as any)?.workspace_id;
    if (jobWsId && jobWsId !== selectedCompanyId) {
      setSelectedCompanyId(jobWsId);
      sessionStorage.setItem("nxthyre_companies_wsId", String(jobWsId));
      callStateCache.set({ selectedCompanyId: jobWsId });
    }
    setSelectedJobId(jobId);
    setCandidates([]);
    setHistoryItems([]);
    setShortlistCandidates([]);
    setHasFetched(false);
    setHasFetchedHistory(false);
    setHasFetchedShortlist(false);
    setTotalCount(0);
    setHistoryTotalCount(0);
    setShortlistTotalCount(0);
    setCurrentPage(1);
    setHistoryPage(1);
    setShortlistPage(1);
    fetchCallStats(selectedCompanyId, jobId);

    callStateCache.set({
      selectedJobId: jobId,
      candidates: [],
      hasFetched: false,
      totalCount: 0,
      currentPage: 1,
    });

    if (activeTab === "history") {
      fetchCallHistory(jobId, 1);
    } else if (activeTab === "shortlist") {
      fetchShortlisted(jobId, 1);
    }
  };

  // Fetch candidates for call queue
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

        fetchCallStats(selectedCompanyId, jobIdToFetch);

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

  // Fetch Candidates button click
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
    fetchCallHistory(selectedJobId, 1);
    fetchShortlisted(selectedJobId, 1);
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

  // Page change handler for Call tab
  const handlePageChange = (newPage: number) => {
    if (selectedJobId && hasFetched) {
      fetchCandidates(selectedJobId, filters, newPage);
    }
  };

  // Navigate to Kanban Board (Requirement 5)
  const handleOpenKanban = () => {
    if (selectedCompanyId) {
      sessionStorage.setItem("nxthyre_companies_wsId", String(selectedCompanyId));
    }
    if (selectedJobId) {
      sessionStorage.setItem("nxthyre_companies_jobId", String(selectedJobId));
    }
    sessionStorage.setItem("nxthyre_activeTab", "companies");
    window.dispatchEvent(
      new CustomEvent("tab-switch", { detail: { page: "companies" } })
    );
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

  // Score helper
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

  const isScoreInRange = (score: number | null, rangeStr: string): boolean => {
    if (score === null) return false;
    const [minStr, maxStr] = rangeStr.split("-");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return score >= min && score <= max;
  };

  const activeScoreRanges = useMemo(() => {
    const ranges = new Set<string>();
    if (selectedScoreRange) ranges.add(selectedScoreRange);
    if (filters.scoreRange?.length) {
      filters.scoreRange.forEach((r) => ranges.add(r));
    }
    return Array.from(ranges);
  }, [selectedScoreRange, filters.scoreRange]);

  // Candidates filtered by Score and search query
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

  // History items filtered by search query
  const filteredHistoryItems = useMemo(() => {
    if (!searchQuery.trim()) return historyItems;
    const q = searchQuery.toLowerCase().trim();
    return historyItems.filter((item) => {
      const cand = item.candidate || {};
      const name = (cand.full_name || "").toLowerCase();
      const comp = (cand.current_company || "").toLowerCase();
      const head = (cand.headline || "").toLowerCase();
      const status = (item.status_display || item.call_status || "").toLowerCase();
      const outcome = (item.outcome || "").toLowerCase();
      return (
        name.includes(q) ||
        comp.includes(q) ||
        head.includes(q) ||
        status.includes(q) ||
        outcome.includes(q)
      );
    });
  }, [historyItems, searchQuery]);

  // Shortlist candidates filtered by search query
  const filteredShortlistCandidates = useMemo(() => {
    if (!searchQuery.trim()) return shortlistCandidates;
    const q = searchQuery.toLowerCase().trim();
    return shortlistCandidates.filter((item) => {
      const cand = item.candidate || {};
      const name = (cand.full_name || "").toLowerCase();
      const comp = (cand.current_company || "").toLowerCase();
      const head = (cand.headline || "").toLowerCase();
      const loc = (cand.location || "").toLowerCase();
      return (
        name.includes(q) ||
        comp.includes(q) ||
        head.includes(q) ||
        loc.includes(q)
      );
    });
  }, [shortlistCandidates, searchQuery]);

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
      activeTab,
    });

    navigate(`/call/${effectiveJobId}/${cand.id}?mode=manual`);
  };

  // Candidate Actions: Profile
  const handleViewProfile = async (item: any) => {
    setIsLoadingCandidateProfile(true);
    const cand = item.candidate || item || {};
    const candidateName = cand.full_name || "Profile";
    const wsName = companies.find((c) => c.id === selectedCompanyId)?.name;
    const jTitle = jobs.find((j) => j.id === selectedJobId)?.title;

    (window as any).__selectedWorkspaceName = wsName;
    (window as any).__selectedJobName = jTitle;
    (window as any).__selectedCandidateName = candidateName;
    window.dispatchEvent(new CustomEvent("header-update"));

    try {
      let fullCandidateData: any = null;
      if (item.id && String(item.id).length < 20 && !String(item.id).includes("-")) {
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
      setSelectedCandidate(
        fullCandidateData || (item.candidate ? item : { ...item, candidate: item })
      );
    } catch (err) {
      console.warn("Using local candidate data for profile view:", err);
      const fallback = item.candidate ? item : { ...item, candidate: item };
      setSelectedCandidate(fallback);
    } finally {
      setIsLoadingCandidateProfile(false);
    }
  };

  // Breadcrumb back navigation
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
      const res = await jobPostService.uploadResumes(selectedJobId, filesArray);
      showToast.success(res?.message || "Candidates uploaded successfully! Resumes queued for processing.");
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

  // ── Call Tab Shortlist Handler ──
  const handleShortlistCandidateFromCallTab = async (item: CandidateCallItem) => {
    const appId = (item as any).application_id || item.id;
    try {
      await callService.shortlistCandidate(appId, undefined, selectedJobId || undefined);
      showToast.success("Candidate moved to shortlisted");
      fetchCallStats(selectedCompanyId, selectedJobId);
      if (selectedJobId) {
        fetchShortlisted(selectedJobId, shortlistPage);
      }
    } catch (err) {
      showToast.error("Failed to shortlist candidate");
    }
  };

  // ── History Action Handlers ──
  const handleShortlistCandidateFromHistory = async (item: CallHistoryItem) => {
    const appId = item.application_id || item.id;
    try {
      await callService.shortlistCandidate(appId, undefined, selectedJobId || undefined);
      setHistoryItems((prev) =>
        prev.map((h) =>
          h.id === item.id
            ? {
                ...h,
                status_display: "Convinced",
                outcome: "Moved to shortlisted",
              }
            : h
        )
      );
      showToast.success("Candidate moved to shortlisted");
      fetchCallStats(selectedCompanyId, selectedJobId);
      if (selectedJobId) {
        fetchShortlisted(selectedJobId, shortlistPage);
      }
    } catch (err) {
      showToast.error("Failed to shortlist candidate");
    }
  };

  const handleArchiveFromHistory = async (item: CallHistoryItem) => {
    const appId = item.application_id || item.id;
    try {
      await callService.archiveCandidate(
        appId,
        "Archived by recruiter",
        undefined,
        selectedJobId || undefined
      );
      setHistoryItems((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, is_archived: true } : h))
      );
      showToast.success("Candidate archived");
      fetchCallStats(selectedCompanyId, selectedJobId);
    } catch (err) {
      showToast.error("Failed to archive candidate");
    }
  };

  const handleRestoreFromHistory = async (item: CallHistoryItem) => {
    const appId = item.application_id || item.id;
    try {
      await callService.restoreCandidate(appId, undefined, selectedJobId || undefined);
      setHistoryItems((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, is_archived: false } : h))
      );
      showToast.success("Candidate restored successfully");
      fetchCallStats(selectedCompanyId, selectedJobId);
    } catch (err) {
      showToast.error("Failed to restore candidate");
    }
  };

  const handleDeleteFromHistory = async (item: CallHistoryItem) => {
    const appId = item.application_id || item.id;
    try {
      await callService.deleteCandidate(appId, item.candidate_id);
      setHistoryItems((prev) => prev.filter((h) => h.id !== item.id));
      showToast.success("Candidate permanently deleted");
      fetchCallStats(selectedCompanyId, selectedJobId);
    } catch (err) {
      showToast.error("Failed to delete candidate permanently");
    }
  };

  const handleUpdateOutcome = (
    item: CallHistoryItem,
    reason: string,
    note: string
  ) => {
    setHistoryItems((prev) =>
      prev.map((h) =>
        h.id === item.id
          ? {
              ...h,
              status_display: reason,
              outcome: note,
            }
          : h
      )
    );
    callStateCache.updateCandidate(item.candidate_id, {
      latest_manual_call_note: note,
      latest_manual_call_status: reason,
    });
  };

  // ── Shortlist Action Handlers ──
  const handleArchiveFromShortlist = async (candItem: CandidateCallItem) => {
    const cId = candItem.candidate?.id || candItem.id;
    try {
      await callService.archiveCandidate(
        candItem.id || cId,
        "Archived by recruiter",
        undefined,
        selectedJobId || undefined
      );
      setShortlistCandidates((prev) =>
        prev.map((c) => {
          const id = c.candidate?.id || c.id;
          return id === cId
            ? { ...c, is_archived: true, latest_call_status: "ARCHIVED" }
            : c;
        })
      );
      showToast.success("Candidate archived");
      fetchCallStats(selectedCompanyId, selectedJobId);
    } catch (err) {
      showToast.error("Failed to archive candidate");
    }
  };

  const handleRestoreFromShortlist = async (candItem: CandidateCallItem) => {
    const cId = candItem.candidate?.id || candItem.id;
    try {
      await callService.restoreCandidate(
        candItem.id || cId,
        undefined,
        selectedJobId || undefined
      );
      setShortlistCandidates((prev) =>
        prev.map((c) => {
          const id = c.candidate?.id || c.id;
          return id === cId
            ? { ...c, is_archived: false, latest_call_status: "ACTIVE" }
            : c;
        })
      );
      showToast.success("Candidate restored successfully");
      fetchCallStats(selectedCompanyId, selectedJobId);
    } catch (err) {
      showToast.error("Failed to restore candidate");
    }
  };

  // Initial Loading Screen
  if (isInitialLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4F5F7]">
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

        <div className="px-6 lg:px-8 py-4 flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-center py-1 gap-2 text-xs text-gray-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 text-[#0F47F2] animate-spin" />
            <span>Loading workspaces, jobs, and candidates...</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden mx-6 lg:mx-8">
          <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 flex items-center">
            <div className="w-full h-3 bg-gray-100 rounded" />
          </div>
          <div className="divide-y divide-[#F0F2F5]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-4 h-[76px] flex items-center justify-between animate-pulse"
              >
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

  // Display JobCandidateProfile if candidate is selected
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
      {/* ── Call Statistics Cards ── */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <CallStats stats={callStats} isLoading={isLoadingStats} />
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
          onOpenKanban={handleOpenKanban}
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

      {/* ── Candidate Tabs & Tables Container ── */}
      <div className="px-6 lg:px-8 py-4 flex-1">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Tab Strip: Call | History | Shortlist */}
          <CallTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Tab 1: Call (Existing Calling interface and functionality) */}
          {activeTab === "call" && (
            <div className="p-4 bg-[#F4F5F7]">
              <CandidateList
                candidates={displayCandidates}
                isLoading={isLoadingCandidates}
                hasSelectedJob={Boolean(selectedJobId)}
                hasFetched={hasFetched}
                jobId={selectedJobId}
                onCallCandidate={handleCallCandidate}
                onViewProfile={handleViewProfile}
                onShortlistCandidate={handleShortlistCandidateFromCallTab}
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Tab 2: History (Grouped chronologically by call date) */}
          {activeTab === "history" && (
            <HistoryTab
              historyItems={filteredHistoryItems}
              isLoading={isLoadingHistory}
              hasSelectedJob={Boolean(selectedJobId)}
              jobId={selectedJobId}
              onCallCandidate={handleCallCandidate}
              onViewProfile={handleViewProfile}
              onShortlistCandidate={handleShortlistCandidateFromHistory}
              onArchiveCandidate={handleArchiveFromHistory}
              onRestoreCandidate={handleRestoreFromHistory}
              onDeleteCandidate={handleDeleteFromHistory}
              onUpdateOutcome={handleUpdateOutcome}
              currentPage={historyPage}
              pageSize={pageSize}
              totalCount={historyTotalCount}
              onPageChange={(p) => {
                setHistoryPage(p);
                if (selectedJobId) fetchCallHistory(selectedJobId, p);
              }}
            />
          )}

          {/* Tab 3: Shortlist (Screenshot 2 view) */}
          {activeTab === "shortlist" && (
            <ShortlistTab
              candidates={filteredShortlistCandidates}
              isLoading={isLoadingShortlist}
              hasSelectedJob={Boolean(selectedJobId)}
              onCallCandidate={handleCallCandidate}
              onViewProfile={handleViewProfile}
              onArchiveCandidate={handleArchiveFromShortlist}
              onRestoreCandidate={handleRestoreFromShortlist}
              currentPage={shortlistPage}
              pageSize={pageSize}
              totalCount={shortlistTotalCount}
              onPageChange={(p) => {
                setShortlistPage(p);
                if (selectedJobId) fetchShortlisted(selectedJobId, p);
              }}
            />
          )}
        </div>
      </div>

      {/* ── Job Details Dialog ── */}
      {isJobDetailsOpen && (
        <JobDetailsDialog
          isOpen={isJobDetailsOpen}
          onClose={() => setIsJobDetailsOpen(false)}
          jobId={selectedJobId}
          initialJob={jobs.find((j) => j.id === selectedJobId) || null}
          companyName={companies.find((c) => c.id === selectedCompanyId)?.name}
        />
      )}

      {/* ── Call Filters Dialog ── */}
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
