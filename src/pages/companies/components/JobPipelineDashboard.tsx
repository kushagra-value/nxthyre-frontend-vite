import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  Search, SlidersHorizontal, Share2, Download, Calendar, Grid3X3, List,
  ChevronLeft, ChevronRight, Pencil, X, Archive, Check, Plus,
  Maximize2, Minimize2, ArrowLeft, Briefcase, LocateIcon, FileSearch,
  Target, Layers, BookOpen, ListChecks, Zap, Clock, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import apiClient from "../../../services/api";
import { jobPostService, Job } from "../../../services/jobPostService";
import { organizationService, CompanyResearchData } from "../../../services/organizationService";
import { candidateService } from "../../../services/candidateService";
import EditJobRoleModal from "../../candidates/components/EditJobRoleModal";
import CompanyInfoTab from "./CompanyInfoTab";
import CallCandidateModal, { CallCandidateData } from "./CallCandidateModal";
import NaukbotTab from "./NaukbotTab";
import AddNewStageForm from "../../pipelines/AddNewStageForm";
import toast from "react-hot-toast";
import { showToast } from "../../../utils/toast";
import * as XLSX from "xlsx";

// ─── Interfaces ────────────────────────────────────────────────

export interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  stage_type?: string;
  candidate_count?: number;
  activity_update?: string;
}

interface CandidateListItem {
  id: number;
  candidate: {
    job_score: any;
    id: string;
    full_name: string;
    avatar: string;
    headline: string;
    location: string;
    linkedin_url?: string;
    is_background_verified: boolean;
    profile_picture_url?: string | null;
    experience_years: string;
    experience_summary: {
      title: string;
      date_range: string;
      duration_years: number;
    } | null;
    education_summary: { title: string; date_range: string } | null;
    notice_period_summary: string;
    skills_list: string[];
    social_links?: {
      linkedin: string;
      github: string;
      portfolio: string;
      resume: string;
    };
    resume_url?: string;
    current_salary_lpa: string | null;
    expected_ctc?: string | null;
    last_active_at?: string | null;
    application_type?: string;
    time_applied?: string | null;
    profile_summary?: string;
    total_experience?: number;
    notice_period_days?: number;
    premium_data_unlocked: boolean;
    premium_data_availability?: Record<string, boolean>;
    premium_data?: {
      email?: string;
      phone?: string;
      linkedin_url?: string | null;
      github_url?: string | null;
      twitter_url?: string | null;
      resume_url?: string | null;
      resume_text?: string;
      portfolio_url?: string | null;
      dribble_username?: string;
      behance_username?: string;
      instagram_username?: string;
      pinterest_username?: string;
      all_emails?: string[];
      all_phone_numbers?: string[];
    };
    source?: {
      source: string | null;
      original_platform: string | null;
    } | null;
  };
  stage_slug: string;
  status_tags: {
    text: string;
    color: string;
  }[];
  job: {
    id: number;
    title: string;
  };
  current_stage: {
    id: number;
    name: string;
    slug: string;
    stage_type?: string;
  };
  score?: any;
  job_score?: {
    gaps_risks?: string[];
    candidate_id?: string;
    call_attention?: string[];
    candidate_name?: string;
    quick_fit_summary?: {
      badge: string;
      color: string;
      status: string;
      evidence: string;
      priority: string;
    }[];
    recommended_message?: string;
    candidate_match_score?: {
      note: string;
      label: string;
      score: string;
      description: string;
    };
  } | null;
  job_score_obj?: any;
  source?: {
    source: string | null;
    original_platform: string | null;
    source_type?: string;
  };
  time_added?: string;
  auto_pilot?: boolean;
}

// ─── Props ─────────────────────────────────────────────────────

interface JobPipelineDashboardProps {
  jobId: number | null;
  workspaceId: number;
  workspaces: { id: number; name: string }[];
  onJobUpdated?: () => void;
  onSelectCandidate?: (candidate: CandidateListItem, allCandidates?: CandidateListItem[], index?: number) => void;
  externalStages?: Stage[];
  onRefreshStages?: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────

const formatSalary = (min: number | null, max: number | null): string => {
  if (min == null && max == null) return "--";
  const fmt = (v: number) => {
    if (v >= 100000) return `${(v / 100000).toFixed(0)}LPA`;
    return `${v}`;
  };
  if (min != null && max != null) return `${fmt(min)} - ${fmt(max)}`;
  if (min != null) return fmt(min);
  return fmt(max!);
};

const formatDate = (iso?: string): string => {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const workApproachLabel: Record<string, string> = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const stageBarColors = ["#FFCC00", "#00C8B3", "#6155F5", "#FF8D28", "#0F47F2", "#E5E5EA"];

const statusLabel = (status?: string): string => {
  if (!status) return "Draft";
  if (status === "PUBLISHED" || status === "ACTIVE") return "Active";
  if (status === "PAUSED") return "Paused";
  if (status === "CLOSED") return "Closed";
  return "Draft";
};

const statusColor = (status?: string): { bg: string; dot: string; text: string } => {
  const label = statusLabel(status);
  if (label === "Active") return { bg: "bg-[#EBFFEE]", dot: "bg-[#009951]", text: "text-[#069855]" };
  if (label === "Paused") return { bg: "bg-[#FFF7D6]", dot: "bg-[#D97706]", text: "text-[#92400E]" };
  if (label === "Closed") return { bg: "bg-[#F3F5F7]", dot: "bg-[#8E8E93]", text: "text-[#8E8E93]" };
  return { bg: "bg-[#F2F2F7]", dot: "bg-[#8E8E93]", text: "text-[#4B5563]" };
};

// ─── Component ─────────────────────────────────────────────────

export default function JobPipelineDashboard({
  jobId, workspaceId, workspaces, onJobUpdated, onSelectCandidate,
  externalStages, onRefreshStages,
}: JobPipelineDashboardProps) {


  // ── Job details
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  // ── Collapse/Expand metadata card
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);

  // ── Edit Job Role modal
  const [showEditModal, setShowEditModal] = useState(false);

  // ── Upload Candidates modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<any | null>(null);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ── Stages
  const [stages, setStages] = useState<Stage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [activeStageSlug, setActiveStageSlug] = useState<string | null>(null);
  const [showAddStageForm, setShowAddStageForm] = useState(false);
  const [archivedCandidates, setArchivedCandidates] = useState<any[]>([]);

  // ── Candidates
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // ── Candidate Edit Modal State
  const [showCandidateEditModal, setShowCandidateEditModal] = useState(false);
  const [candidateEditing, setCandidateEditing] = useState<CandidateListItem | null>(null);
  const [candidateEditForm, setCandidateEditForm] = useState({
    notice_period_days: "",
    current_ctc_lpa: "",
    expected_ctc_lpa: "",
  });

  // ── Pagination & search
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);

  // ── Selection
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectionStage, setSelectionStage] = useState<string | null>(null);
  const [selectionType, setSelectionType] = useState<"ACTIVE" | "ARCHIVED" | null>(null);

  // ── Sorting
  type CandidateSortKey = "Name" | "AI Score" | "Location" | "Exp" | "CTC" | "Expected CTC" | "Notice Period" | "Stage" | "Attention";
  const [sortConfig, setSortConfig] = useState<{ key: CandidateSortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: CandidateSortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (["AI Score", "Exp", "CTC", "Expected CTC", "Notice Period"].includes(key)) {
      direction = 'desc'; // Default desc for numeric/score values
    }

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === direction) {
        direction = direction === 'asc' ? 'desc' : 'asc';
      } else {
        setSortConfig(null);
        return;
      }
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: CandidateSortKey }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400 group-hover:text-gray-600 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />
      : <ArrowDown className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />;
  };

  const getSortedCandidates = (cands: CandidateListItem[]) => {
    if (!sortConfig) return cands;
    return [...cands].sort((a, b) => {
      const candA = a.candidate;
      const candB = b.candidate;

      let valA: any = 0;
      let valB: any = 0;

      switch (sortConfig.key) {
        case "Name":
          valA = candA.full_name?.toLowerCase() || "";
          valB = candB.full_name?.toLowerCase() || "";
          break;
        case "AI Score":
          valA = parseInt((a.job_score?.candidate_match_score?.score || "0").replace("%", ""), 10);
          valB = parseInt((b.job_score?.candidate_match_score?.score || "0").replace("%", ""), 10);
          break;
        case "Location":
          valA = candA.location?.toLowerCase() || "";
          valB = candB.location?.toLowerCase() || "";
          break;
        case "Exp":
          valA = candA.total_experience ?? (candA.experience_years ? parseInt(candA.experience_years) : 0);
          valB = candB.total_experience ?? (candB.experience_years ? parseInt(candB.experience_years) : 0);
          break;
        case "CTC":
          valA = candA.current_salary_lpa ? parseFloat(candA.current_salary_lpa) : 0;
          valB = candB.current_salary_lpa ? parseFloat(candB.current_salary_lpa) : 0;
          break;
        case "Expected CTC":
          valA = candA.expected_ctc ? parseFloat(candA.expected_ctc) : 0;
          valB = candB.expected_ctc ? parseFloat(candB.expected_ctc) : 0;
          break;
        case "Notice Period":
          valA = candA.notice_period_days ?? 999;
          valB = candB.notice_period_days ?? 999;
          break;
        case "Stage":
          valA = a.current_stage?.name?.toLowerCase() || "";
          valB = b.current_stage?.name?.toLowerCase() || "";
          break;
        case "Attention":
          valA = a.status_tags?.find(t => t.text)?.text?.toLowerCase() || "";
          valB = b.status_tags?.find(t => t.text)?.text?.toLowerCase() || "";
          break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Primary list for active candidates
  let combinedCands = candidates;

  if (activeStageSlug) {
    combinedCands = combinedCands.filter(c => (c.current_stage?.slug || c.stage_slug) === activeStageSlug);
  }
  const sortedCandidates = getSortedCandidates(combinedCands);

  // Derived list for archived candidates (separated to avoid duplication in the main active list)
  const filteredArchivedTable = archivedCandidates.filter(item => {
    // 1. Filter by associated stage (tab) if one is active
    if (activeStageSlug && (item.current_stage?.slug || item.stage_slug) !== activeStageSlug) return false;

    // 2. Filter by search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.candidate.full_name?.toLowerCase() || "";
      const headline = item.candidate.headline?.toLowerCase() || "";
      if (!name.includes(q) && !headline.includes(q)) return false;
    }
    return true;
  });

  // ── Active tab
  const [activeTab, setActiveTab] = useState<"pipeline" | "naukbot" | "inbound">("pipeline");

  // ── Kanban View State
  const [isKanbanView, setIsKanbanView] = useState(false);
  const [draggedCandidateId, setDraggedCandidateId] = useState<number | null>(null);

  const handleDragStart = (id: number) => {
    setDraggedCandidateId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStageSlug: string) => {
    e.preventDefault();
    if (!draggedCandidateId || !jobId) return;

    const toStage = stages.find(s => s.slug === toStageSlug);
    if (!toStage) return;

    // Optimistically update local state for fast UI feedback
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === draggedCandidateId) {
          return {
            ...c,
            stage_slug: toStageSlug,
            current_stage: toStage,
          };
        }
        return c;
      })
    );
    setDraggedCandidateId(null);

    try {
      if (toStageSlug === "archives") {
        await apiClient.patch(`/jobs/applications/${draggedCandidateId}/`, {
          current_stage: toStage.id,
          status: "ARCHIVED",
          archive_reason: "Candidate archived from Kanban",
        });
      } else {
        await apiClient.patch(`/jobs/applications/${draggedCandidateId}/`, {
          current_stage: toStage.id,
        });
      }
      showToast.success(`Candidate moved to ${toStage.name}`);
    } catch (error) {
      console.error("Error moving candidate:", error);
      showToast.error("Failed to move candidate");
    }
  };

  // ── Requisition Info Modal
  const [showRequisitionInfoModal, setShowRequisitionInfoModal] = useState(false);
  const [requisitionModalTab, setRequisitionModalTab] = useState<"info" | "company">("info");
  const [jobDataForModal, setJobDataForModal] = useState<Job | null>(null);
  const [competenciesData, setCompetenciesData] = useState<any>(null);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [companyResearchData, setCompanyResearchData] = useState<CompanyResearchData | null>(null);
  const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);

  // ── Export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ── Call Modal State
  const [callModalCandidate, setCallModalCandidate] = useState<CallCandidateData | null>(null);

  // ── Export helpers
  const downloadFile = (
    data: string | Blob,
    fileName: string,
    type: "csv" | "xlsx",
  ) => {
    const blob =
      typeof data === "string"
        ? new Blob([data], {
          type:
            type === "csv"
              ? "text/csv"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        : data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportCandidates = async (format: "csv" | "xlsx") => {
    if (selectedIds.size === 0) {
      showToast.error("Please select at least one candidate");
      return;
    }
    if (!jobId) {
      showToast.error("No job selected for export");
      return;
    }

    setExportLoading(true);
    try {
      const selectedCandidateUuids = candidates
        .filter((cand) => selectedIds.has(cand.id))
        .map((cand) => cand.candidate.id);

      if (selectedCandidateUuids.length === 0) {
        throw new Error("No valid candidates found for export");
      }

      const response = await candidateService.exportCandidates(selectedCandidateUuids, jobId);

      if (typeof response !== "string") {
        throw new Error("Invalid response format: Expected a CSV string");
      }

      if (!response.trim()) {
        throw new Error("No candidate data returned for export");
      }

      if (format === "csv") {
        downloadFile(response, `candidates_export_${Date.now()}.csv`, "csv");
      } else {
        const lines = response.split("\n").filter((line) => line.trim());
        const worksheetData = lines.map((line) =>
          line
            .split(",")
            .map((value) => value.replace(/^"|"$/g, "").replace(/""/g, '"')),
        );

        if (worksheetData.length < 2) {
          throw new Error("No candidate data returned for export");
        }

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadFile(blob, `candidates_export_${Date.now()}.xlsx`, "xlsx");
      }

      showToast.success(
        `Candidates exported successfully as ${format.toUpperCase()}`,
      );
      setShowExportDialog(false);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (error: any) {
      console.error("Export Error:", error);
      showToast.error(error.message || "Failed to export candidates");
    } finally {
      setExportLoading(false);
    }
  };

  // ── Upload helpers (same as PipelineStages) ──────────────────

  const startPolling = (batchId: string) => {
    setActiveBatchId(batchId);
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const batches = await jobPostService.getUploadStatus();
        const batch = batches.find((b: any) => b.batch_id === batchId);
        if (!batch) return;
        setUploadStatus(batch);
        if (batch.status === "completed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          showToast.success(
            batch.failed === 0
              ? `All ${batch.success} resumes processed successfully`
              : `${batch.success} succeeded, ${batch.failed} failed`
          );
          fetchUploadHistory();
        }
      } catch (error) {
        console.error("Polling failed", error);
      }
    }, 2500);
  };

  useEffect(() => {
    if (!showUploadModal && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [showUploadModal]);

  const fetchUploadHistory = async () => {
    try {
      const history = await jobPostService.getUploadHistory(jobId || 0);
      setUploadHistory(history);
    } catch (error) {
      console.error("Failed to fetch upload history", error);
    }
  };

  useEffect(() => {
    if (showUploadModal) {
      fetchUploadHistory();
    }
  }, [showUploadModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const allowedFiles = filesArray.filter((file) => {
        const name = file.name.toLowerCase();
        return name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
      });
      if (allowedFiles.length !== filesArray.length) {
        showToast.error("Only PDF, DOC, and DOCX files are allowed.");
      }
      setUploadFiles(allowedFiles.length > 0 ? allowedFiles : null);
    }
  };

  const handleUploadCandidates = async () => {
    if (isUploading) return;
    if (!uploadFiles || uploadFiles.length === 0 || !jobId) {
      toast.error("Please select PDF files and ensure a job is selected", {
        duration: 5000, position: "top-center",
        style: { background: "#0abc1eff", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    try {
      setIsUploading(true);
      const response = await jobPostService.uploadResumes(jobId, uploadFiles);
      const { batch_id } = response;
      setActiveBatchId(batch_id);
      setUploadStatus(null);
      startPolling(batch_id);
      toast.success("Resumes queued for analysis. Refresh after 10 mins to check status.", {
        duration: 7000, position: "top-center",
        style: { background: "#0abc1eff", color: "#fff", fontWeight: "500" },
      });
      setUploadFiles(null);
      // Refresh candidates
      if (jobId) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload candidates", {
        duration: 5000, position: "top-center",
        style: { background: "#0abc1eff", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Fetch Job Details ────────────────────────────────────────

  const refreshJobDetails = useCallback(() => {
    if (jobId == null) return;
    setLoadingJob(true);
    jobPostService
      .getJob(jobId)
      .then((data) => setJobDetails(data))
      .catch((err) => {
        console.error("Error fetching job details:", err);
        setJobDetails(null);
      })
      .finally(() => setLoadingJob(false));
  }, [jobId]);

  useEffect(() => {
    refreshJobDetails();
  }, [refreshJobDetails]);

  // ── Sync Stages from Prop
  useEffect(() => {
    if (externalStages && externalStages.length > 0) {
      setStages(externalStages);
    }
  }, [externalStages]);

  // ── Fetch Stages ─────────────────────────────────────────────

  const fetchStages = useCallback(async (jId: number) => {
    if (onRefreshStages) {
      onRefreshStages();
      return;
    }
    setLoadingStages(true);
    try {
      const response = await apiClient.get(`/jobs/applications/stages/?job_id=${jId}`);
      const data: Stage[] = response.data;
      const filtered = data.filter(s =>
        s.slug !== "archives" &&
        !s.name.toLowerCase().includes("archive")
      );
      const sorted = filtered.sort((a, b) => a.sort_order - b.sort_order);
      setStages(sorted);
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]);
    } finally {
      setLoadingStages(false);
    }
  }, [onRefreshStages]);

  useEffect(() => {
    if (jobId != null && (!externalStages || externalStages.length === 0)) {
      fetchStages(jobId);
    }
  }, [jobId, fetchStages, externalStages]);

  // ── Fetch Archived Candidates (For in-place Kanban/Table view)
  const fetchArchivedCandidates = useCallback(async (jId: number) => {
    try {
      const res = await apiClient.get(`/jobs/roles/${jId}/archived-applications/`);
      const data = res.data;
      const results = data.results || (Array.isArray(data) ? data : []);
      // add an is_archived manual flag
      const archived = results.map((c: any) => ({ ...c, is_archived: true }));
      setArchivedCandidates(archived);
    } catch (error) {
      console.error("Error fetching archived candidates:", error);
      setArchivedCandidates([]);
    }
  }, []);

  // ── Fetch Candidates ─────────────────────────────────────────

  const fetchCandidates = useCallback(async (jId: number, stageSlug: string | null, page: number, search: string) => {
    setLoadingCandidates(true);
    try {
      let url = `/jobs/applications/?job_id=${jId}`;
      if (stageSlug) url += `&stage_slug=${stageSlug}`;
      url += `&page=${page}&page_size=${pageSize}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const response = await apiClient.get(url);
      const data = response.data;

      let candidateData: CandidateListItem[] = [];
      let count = 0;
      if (Array.isArray(data)) { candidateData = data; count = data.length; }
      else if (data && Array.isArray(data.results)) { candidateData = data.results; count = data.count || data.results.length; }

      setCandidates(candidateData);
      setTotalCandidates(count);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
      setTotalCandidates(0);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    if (jobId != null && searchQuery === "") {
      fetchCandidates(jobId, activeStageSlug, currentPage, "");
      fetchArchivedCandidates(jobId);
    }
  }, [jobId, activeStageSlug, currentPage, searchQuery, fetchCandidates, fetchArchivedCandidates]);

  useEffect(() => {
    if (searchQuery.length > 0 && jobId !== null && activeTab === 'pipeline') {
      const fetchSuggestions = async () => {
        try {
          const res = await jobPostService.searchAutosuggest(searchQuery, jobId);
          setSuggestions(res);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      };
      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, jobId, activeTab]);

  const handleSuggestionSelect = async (sug: { id: string; name: string }) => {
    setSearchQuery(sug.name);
    setSuggestions([]);
    if (jobId) {
      try {
        setCandidates([]);
        const res = await jobPostService.getSearchedCandidate(sug.id, jobId);
        setActiveStageSlug(res.current_stage.slug);
        setCandidates([res as unknown as CandidateListItem]);
        setTotalCandidates(1);
      } catch (error) {
        console.error("Error fetching searched candidate:", error);
      }
    }
  };

  useEffect(() => { setCurrentPage(1); }, [activeStageSlug, searchQuery]);

  // ── Candidate Edit Handlers ──
  useEffect(() => {
    if (showCandidateEditModal && candidateEditing) {
      const cand = candidateEditing.candidate;
      
      // Robust extraction for numeric CTC/expected
      const extractNum = (val: any) => {
        if (val == null) return "";
        return val.toString().replace(/ LPA$/i, "").trim();
      };

      setCandidateEditForm({
        notice_period_days: cand.notice_period_days?.toString() || "",
        current_ctc_lpa: extractNum(cand.current_salary_lpa || (cand as any).current_salary),
        expected_ctc_lpa: extractNum(cand.expected_ctc),
      });
    }
  }, [showCandidateEditModal, candidateEditing]);

  useEffect(() => {
    if (!showCandidateEditModal) {
      setCandidateEditForm({
        notice_period_days: "",
        current_ctc_lpa: "",
        expected_ctc_lpa: "",
      });
    }
  }, [showCandidateEditModal]);

  const handleCandidateEditSave = async () => {
    if (!candidateEditing) return;

    const uuid = candidateEditing.candidate.id;
    const payload: any = {};
    let valid = true;

    if (candidateEditForm.notice_period_days !== "") {
      const days = parseInt(candidateEditForm.notice_period_days, 10);
      if (isNaN(days) || days < 0) {
        showToast.error("Notice period must be a non-negative number");
        valid = false;
      } else {
        payload.notice_period_days = days;
      }
    }

    if (candidateEditForm.current_ctc_lpa !== "") {
      const lpa = parseFloat(candidateEditForm.current_ctc_lpa);
      if (isNaN(lpa) || lpa < 0) {
        showToast.error("Current CTC must be a non-negative number");
        valid = false;
      } else {
        payload.current_salary = lpa;
      }
    }

    if (candidateEditForm.expected_ctc_lpa !== "") {
      const lpa = parseFloat(candidateEditForm.expected_ctc_lpa);
      if (isNaN(lpa) || lpa < 0) {
        showToast.error("Expected CTC must be a non-negative number");
        valid = false;
      } else {
        payload.expected_ctc = lpa;
      }
    }

    if (!valid) return;

    if (Object.keys(payload).length === 0) {
      showToast.info("No changes to save");
      setShowCandidateEditModal(false);
      return;
    }

    try {
      await apiClient.patch(`/candidates/${uuid}/editable-fields/`, payload);

      setCandidates((prev) =>
        prev.map((c) => {
          if (c.candidate.id === uuid) {
            const updatedCand = { ...c.candidate };
            if (payload.notice_period_days !== undefined) {
              updatedCand.notice_period_days = payload.notice_period_days;
              updatedCand.notice_period_summary =
                payload.notice_period_days === 0
                  ? "Immediate"
                  : `${payload.notice_period_days} days`;
            }
            if (payload.current_salary !== undefined) {
              const lpaStr =
                payload.current_salary % 1 === 0
                  ? `${payload.current_salary}`
                  : payload.current_salary.toFixed(1);
              updatedCand.current_salary_lpa = lpaStr;
            }
            if (payload.expected_ctc !== undefined) {
              const lpaStr =
                payload.expected_ctc % 1 === 0
                  ? `${payload.expected_ctc}`
                  : payload.expected_ctc.toFixed(1);
              updatedCand.expected_ctc = lpaStr;
            }
            return { ...c, candidate: updatedCand };
          }
          return c;
        }),
      );

      showToast.success("Candidate details updated successfully");
      setShowCandidateEditModal(false);
    } catch (error: any) {
      console.error("Edit save error:", error);
      showToast.error(
        error.response?.data?.detail || "Failed to update candidate details",
      );
    }
  };

  // ── Selection Logic ──────────────────────────────────────────

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectionStage(null);
      setSelectionType(null);
    }
    else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
      setSelectionType("ACTIVE");
      setSelectionStage(null); // All stages selected
    }
    setSelectAll(!selectAll);
  };

  const handleToggleCandidate = (item: any) => {
    const id = item.id;
    const isArchived = !!item.is_archived;
    const itemType = isArchived ? "ARCHIVED" : "ACTIVE";
    const itemStage = item.current_stage?.slug || item.stage_slug;

    const next = new Set(selectedIds);

    // Exclusive selection logic
    if (next.size > 0) {
      if (selectionType !== itemType) {
        showToast.error(`Cannot select ${itemType.toLowerCase()} candidate while ${selectionType?.toLowerCase()} candidates are selected`);
        return;
      }
      if (isKanbanView && selectionStage && selectionStage !== itemStage) {
        showToast.error("Selection is restricted to one stage in Kanban view");
        return;
      }
    }

    if (next.has(id)) {
      next.delete(id);
      if (next.size === 0) {
        setSelectionType(null);
        setSelectionStage(null);
      }
    } else {
      next.add(id);
      setSelectionType(itemType);
      if (isKanbanView) setSelectionStage(itemStage);
    }

    setSelectedIds(next);
    setSelectAll(next.size === candidates.length && candidates.length > 0);
  };

  // ── Actions ──────────────────────────────────────────────────

  const archiveCandidate = async (applicationId: number) => {
    const archiveStage = stages.find((stage) => stage.slug === "archives");
    if (!archiveStage) return;
    try {
      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: archiveStage.id,
        status: "ARCHIVED",
        archive_reason: "Candidate archived from UI",
      });
      if (jobId != null) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
      showToast.success("Candidate archived successfully");
    } catch (error) {
      console.error("Error archiving candidate:", error);
      showToast.error("Failed to archive candidate");
    }
  };

  const shortlistCandidate = async (applicationId: number) => {
    try {
      const shortlistedStage = stages.find(
        (s) => s.slug === "shortlisted" || s.name.toLowerCase().includes("shortlist"),
      );

      if (!shortlistedStage) {
        showToast.error("Shortlisted stage not found");
        return;
      }

      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: shortlistedStage.id,
      });

      showToast.success("Candidate shortlisted successfully");

      if (jobId != null) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      showToast.error("Failed to shortlist candidate");
    }
  };

  const bulkArchive = async (applicationIds: number[]) => {
    if (applicationIds.length === 0) return;
    try {
      const archiveStage = stages.find((s) => s.slug === "archives");
      if (!archiveStage) {
        showToast.error("Archives stage not found");
        return;
      }
      await apiClient.post("/jobs/bulk-move-stage/", {
        application_ids: applicationIds,
        current_stage: archiveStage.id,
      });
      showToast.success(`Successfully archived ${applicationIds.length} candidate(s)`);
      setSelectedIds(new Set());
      setSelectAll(false);
      if (jobId != null) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
    } catch (error) {
      console.error("Error bulk archiving:", error);
      showToast.error("Failed to archive candidates");
    }
  };

  const bulkMoveCandidates = async (applicationIds: number[], stageId: number) => {
    if (applicationIds.length === 0) return;
    try {
      await apiClient.post("/jobs/bulk-move-stage/", {
        application_ids: applicationIds,
        current_stage: stageId,
      });

      const targetStage = stages.find((stage) => stage.id === stageId);
      if (targetStage?.slug === "applied") {
        await Promise.all(
          applicationIds.map(async (appId) => {
            const cand = candidates.find((c) => c.id === appId);
            if (cand && jobId !== null) {
              await candidateService.scheduleCodingAssessmentEmail(cand.candidate.id, jobId);
            }
          })
        );
      }

      showToast.success(`Moved ${applicationIds.length} candidate(s) to ${targetStage?.name || "selected stage"}`);
      setSelectedIds(new Set());
      setSelectAll(false);
      if (jobId !== null) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
    } catch (error) {
      console.error("Error bulk moving candidates:", error);
      showToast.error("Failed to move candidates");
    }
  };

  // ── Pagination ───────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));
  const startIndex = (currentPage - 1) * pageSize;

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // ── Requisition Info Handlers ────────────────────────────────

  const handleRequisitionInfo = async (jId: number) => {
    setRequisitionModalTab("info");
    setCompanyResearchData(null);
    setLoadingCompetencies(true);
    setJobDataForModal(null);
    setCompetenciesData(null);
    try {
      const [job, comp] = await Promise.all([
        jobPostService.getJob(jId),
        jobPostService.getJobCompetencies(jId),
      ]);
      setJobDataForModal(job);
      setCompetenciesData(comp);
    } catch {
      showToast.error("Failed to fetch requisition info");
    } finally {
      setLoadingCompetencies(false);
      setShowRequisitionInfoModal(true);
    }
  };

  const handleCloseRequisitionModal = () => {
    setRequisitionModalTab("info");
    setShowRequisitionInfoModal(false);
    setJobDataForModal(null);
    setCompetenciesData(null);
    setCompanyResearchData(null);
    setLoadingCompetencies(false);
  };

  // ── Derived ──────────────────────────────────────────────────

  const totalPipelineCandidates = stages.reduce((sum, s) => sum + (s.candidate_count || 0), 0);

  // ── Render ───────────────────────────────────────────────────

  if (!jobId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F3F5F7] min-h-screen">
        <p className="text-[#8E8E93] text-sm">No job selected</p>
      </div>
    );
  }

  const sc = statusColor(jobDetails?.status);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F3F5F7] min-h-screen pb-12">
      {/* ═══════════════════════════════════════════════════════
          Title Bar — Job Title, Status, JD-ID, View JD, Edit, + Candidate
         ═══════════════════════════════════════════════════════ */}
      <div className="mx-8 mt-6 bg-white rounded-xl px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: title + status + id */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-semibold text-black">
                  {loadingJob ? (
                    <span className="inline-block h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    jobDetails?.title || "--"
                  )}
                </h1>
                {jobDetails && (
                  <div className={`flex items-center gap-1.5 ${sc.bg} ${sc.text} text-xs font-medium px-3 py-0.5 rounded-full`}>
                    <div className={`w-2 h-2 ${sc.dot} rounded-full`} />
                    {statusLabel(jobDetails.status)}
                  </div>
                )}
              </div>
              <div className="text-sm text-[#8E8E93] mt-0.5">
                JD-{jobId}
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-3">
            {/* Collapse / Expand toggle */}
            <button
              onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#D1D1D6] rounded-lg text-sm text-[#757575] hover:bg-[#F9FAFB] transition-colors"
              title={isMetadataExpanded ? "Collapse details" : "Expand details"}
            >
              {isMetadataExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* View JD */}
            <button
              onClick={() => jobId && handleRequisitionInfo(jobId)}
              className="flex items-center gap-2 px-4 py-2 border border-[#D1D1D6] rounded-lg text-sm text-[#757575] hover:bg-[#F9FAFB] transition-colors">
              View JD <span className="text-[#AEAEB2]">ⓘ</span>
            </button>

            {/* Edit */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#0F47F2] bg-[#E7EDFF] text-[#0F47F2] rounded-lg text-sm font-medium hover:bg-[#DDE6FF] transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>

            {/* + Candidate (Upload) */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F47F2] text-white rounded-lg text-sm font-medium hover:bg-[#0A3BCC] transition-colors"
            >
              + Candidate
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
          Job Metadata Card (collapsible)
         ═══════════════════════════════════════════════════════ */}
        {isMetadataExpanded && (
          <div className="mt-4 border border-[#E5E7EB] rounded-2xl p-4 transition-all">
            {loadingJob ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ) : jobDetails ? (
              <div className="grid grid-cols-6 gap-x-8 gap-y-6 text-sm">
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Year of Experience</div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.experience_min_years || "--"} - {jobDetails.experience_max_years || "--"} years
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Location</div>
                  <div className="font-medium text-[#4B5563] mt-1">{jobDetails.location?.join(", ") || "--"}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Salary - CTC</div>
                  <div className="font-medium text-[#4B5563] mt-1">{formatSalary(jobDetails.salary_min, jobDetails.salary_max)}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Work Approach</div>
                  <div className="font-medium text-[#4B5563] mt-1">{workApproachLabel[jobDetails.work_approach] || "--"}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">No of Position</div>
                  <div className="font-medium text-[#4B5563] mt-1">{jobDetails.count || "--"}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Education Qualifications</div>
                  <div className="font-medium text-[#4B5563] mt-1">{jobDetails.seniority || "--"}</div>
                </div>

                {/* Second row */}
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Open Date</div>
                  <div className="font-medium text-[#4B5563] mt-1">{formatDate(jobDetails.created_at)}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Last Active Date</div>
                  <div className="font-medium text-[#4B5563] mt-1">{formatDate(jobDetails.updated_at)}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Shortlisted</div>
                  <div className="font-medium text-[#4B5563] mt-1">{jobDetails.shortlisted_candidate_count ?? "--"}</div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">Hired</div>
                  <div className="font-medium text-[#4B5563] mt-1">--</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[#8E8E93] text-xs font-medium mb-1.5">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(jobDetails.skills && jobDetails.skills.length > 0)
                      ? jobDetails.skills.map((s) => (
                        <span key={s} className="bg-[#F2F2F7] text-[#4B5563] text-[10px] px-2.5 py-0.5 rounded-full">{s}</span>
                      ))
                      : <span className="text-[#8E8E93] text-xs">--</span>
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-[#8E8E93] py-4">Failed to load job details</div>
            )}
          </div>
        )}

      </div>



      {/* ═══════════════════════════════════════════════════════
          Pipeline / Naukbot / Inbound Tabs
         ═══════════════════════════════════════════════════════ */}
      <div className="mx-8 mt-6">
        <div className="flex items-center gap-6 border-b border-[#E5E7EB]">
          {[
            { key: "pipeline" as const, label: "Pipeline", count: totalPipelineCandidates },
            { key: "naukbot" as const, label: "Naukbot", count: jobDetails?.invites_sent ?? 0 },
            { key: "inbound" as const, label: "Inbound", count: jobDetails?.inbound_count ?? 0 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.key
                ? "text-[#0F47F2] border-b-2 border-[#0F47F2]"
                : "text-[#8E8E93] hover:text-[#4B5563]"
                }`}
            >
              {tab.label}{" "}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${activeTab === tab.key ? "bg-[#E7EDFF] text-[#0F47F2]" : "text-[#AEAEB2]"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Stage Filter Pills & Pipeline Content
         ═══════════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <>
          <div className="mx-8 mt-4 flex items-center justify-between bg-white p-4 rounded-t-2xl border border-b-0 border-[#E5E7EB]">
            <div className="flex items-center gap-2 flex-wrap">
              {!isKanbanView && (
                <>
                  <button
                    onClick={() => setActiveStageSlug(null)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeStageSlug === null
                      ? "bg-[#0F47F2] text-white"
                      : "text-[#AEAEB2] bg-white hover:bg-[#F3F5F7] border border-[#D1D1D6]"
                      }`}
                  >
                    All ({totalPipelineCandidates})
                  </button>

                  {loadingStages ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-28 h-8 bg-gray-200 rounded-full animate-pulse" />
                    ))
                  ) : (
                    stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => setActiveStageSlug(stage.slug)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeStageSlug === stage.slug
                          ? "bg-[#0F47F2] text-white"
                          : "text-[#AEAEB2] bg-white hover:bg-[#F3F5F7] border border-[#D1D1D6]"
                          }`}
                      >
                        {stage.name} ({stage.candidate_count})
                      </button>
                    ))
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isKanbanView && (
                <button onClick={() => setShowAddStageForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#E7EDFF] text-[#0F47F2] rounded-full hover:bg-[#D5E1FF] transition-colors border border-transparent mr-2">
                  <Plus className="w-3.5 h-3.5" /> Add Stage
                </button>
              )}
              <button
                onClick={() => setIsKanbanView(!isKanbanView)}
                className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#414141] transition-colors p-2 rounded-lg border border-[#D1D1D6] text-xs"
              >
                {isKanbanView ? <><List className="w-4 h-4" /> Table View</> : <><Grid3X3 className="w-4 h-4" /> Kanban</>}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
          Toolbar: Search + Actions
         ═══════════════════════════════════════════════════════ */}
          <div className="mx-8 flex flex-wrap items-center justify-between bg-white p-4 border border-b-0 border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="relative w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                <input
                  type="text"
                  placeholder="Search for Candidates"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 transition-shadow border border-[#E5E7EB]"
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-10 z-[100] w-full bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto border border-gray-200">
                    {suggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-[#4B5563]"
                        onClick={() => handleSuggestionSelect(sug)}
                      >
                        {sug.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/public/workspaces/${workspaceId}/applications`;
                  window.open(url, "_blank");
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#E7EDFF] hover:text-[#0F47F2] hover:border-[#0F47F2] transition-colors">
                <Share2 className="w-4 h-4" /> Share Pipeline
              </button>
              <button
                onClick={() => {
                  if (selectedIds.size === 0) {
                    showToast.error("Please select at least one candidate to export");
                    return;
                  }
                  setShowExportDialog(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors" title="Feature Coming Soon" disabled>
                <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
          Bulk Action Bar
         ═══════════════════════════════════════════════════════ */}
          {selectedIds.size > 0 && (
            <div className="mx-8 bg-blue-50/50 border-x border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
              <div className="text-sm font-medium text-[#0F47F2]">
                {selectedIds.size} Candidate{selectedIds.size !== 1 ? "s" : ""} Selected
              </div>
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => {
                    let nextStageId: number | undefined;
                    if (activeStageSlug) {
                      const currentIdx = stages.findIndex(s => s.slug === activeStageSlug);
                      if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
                        // Check if next stage is 'archives', if so skip or just use it. Typically archives is not a 'next' stage
                        const nextStage = stages[currentIdx + 1];
                        if (nextStage.slug !== 'archives') {
                          nextStageId = nextStage.id;
                        } else if (currentIdx + 2 < stages.length) {
                          nextStageId = stages[currentIdx + 2].id;
                        }
                      }
                    } else {
                      const firstCandId = Array.from(selectedIds)[0];
                      const firstCand = candidates.find(c => c.id === firstCandId);
                      const currentSlug = firstCand?.current_stage?.slug || firstCand?.stage_slug;
                      const currentIdx = stages.findIndex(s => s.slug === currentSlug);
                      if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
                        const nextStage = stages[currentIdx + 1];
                        if (nextStage.slug !== 'archives') {
                          nextStageId = nextStage.id;
                        } else if (currentIdx + 2 < stages.length) {
                          nextStageId = stages[currentIdx + 2].id;
                        }
                      }
                    }

                    if (nextStageId) {
                      bulkMoveCandidates(Array.from(selectedIds), nextStageId);
                    } else {
                      showToast.error("No next stage available");
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#4B5563] border border-[#D1D1D6] rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Move to Next Stage
                </button>

                <button
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#4B5563] border border-[#D1D1D6] rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>

                <button
                  onClick={() => bulkArchive(Array.from(selectedIds))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium"
                >
                  <Archive className="w-4 h-4" /> Archive Candidates
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
          Content View (Table or Kanban)
         ═══════════════════════════════════════════════════════ */}
          {isKanbanView ? (
            <div className="mx-8 bg-[#F3F5F7] border border-[#E5E7EB] rounded-b-2xl overflow-x-auto p-6 flex gap-6 h-[75vh] items-stretch">
              {stages.map((stage) => {
                const activeColumnCandidates = candidates.filter((item) => {
                  const itemStageSlug = item.current_stage?.slug || item.stage_slug;
                  return itemStageSlug === stage.slug;
                });
                const archivedColumnCandidates = archivedCandidates.filter((item) => {
                  const itemStageSlug = item.current_stage?.slug || item.stage_slug;
                  return itemStageSlug === stage.slug;
                });

                return (
                  <div
                    key={stage.id}
                    className="min-w-[320px] w-[320px] bg-white border border-[#E5E7EB] rounded-xl flex flex-col pt-3 pb-2 h-full relative"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.slug)}
                  >
                    <div className="px-5 pb-3 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
                      <h3 className="text-sm font-bold text-[#4B5563] capitalize">{stage.name}</h3>
                      <span className="text-xs bg-[#F9FAFB] border border-[#D1D1D6] text-[#8E8E93] rounded-full px-2 py-0.5 font-bold">
                        {activeColumnCandidates.length + archivedColumnCandidates.length}
                      </span>
                    </div>

                    <div className="flex-1 p-3 space-y-3 overflow-y-auto mt-1 custom-scrollbar pb-24">
                      {/* Pipeline Candidates */}
                      {activeColumnCandidates.map((item, idx) => {
                        const cand = item.candidate;
                        const aiScoreRaw = item.job_score?.candidate_match_score?.score || "--%";
                        const isDisabled = selectionType === "ARCHIVED" || (selectionStage && selectionStage !== stage.slug);

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            className={`bg-white border text-left border-[#E5E7EB] p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#0F47F2]/50 transition-all flex flex-col gap-1 relative ${isDisabled ? "opacity-60" : ""}`}
                          >
                            <div className="absolute top-3 right-3 z-10">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#0F47F2]"
                                checked={selectedIds.has(item.id)}
                                onChange={() => handleToggleCandidate(item)}
                                disabled={!!isDisabled}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex items-start justify-between gap-2 pr-6">
                              <h4
                                className="font-bold text-[14px] text-slate-800 line-clamp-1 cursor-pointer hover:underline"
                                onClick={() => onSelectCandidate?.(item, activeColumnCandidates, idx)}
                              >
                                {cand.full_name || "--"}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCandidateEditing(item);
                                  setShowCandidateEditModal(true);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                title="Edit Candidate Details"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#AEAEB2]" />
                              </button>
                            </div>
                            <div className="inline-flex">
                              <span className="text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">{aiScoreRaw}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{cand.headline || "--"}</p>

                            <div className="flex flex-wrap items-center mt-3 gap-y-2 gap-x-4 text-[11px] text-[#8E8E93] font-medium">
                              {cand.location && (
                                <span className="flex items-center gap-1.5"><LocateIcon className="w-3.5 h-3.5" /> {cand.location.split(',')[0]}</span>
                              )}
                              {(cand.total_experience || cand.experience_years) && (
                                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {cand.total_experience != null ? `${cand.total_experience} Yrs` : cand.experience_years.replace(/\s*exp$/i, "")}</span>
                              )}
                              {cand.current_salary_lpa && (
                                <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {cand.current_salary_lpa} LPA</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Archives Section */}
                      {archivedColumnCandidates.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-px bg-[#E5E7EB] flex-1"></div>
                            <span className="text-[10px] font-bold text-[#AEAEB2] uppercase tracking-wider">Archives</span>
                            <div className="h-px bg-[#E5E7EB] flex-1"></div>
                          </div>
                          <div className="space-y-3">
                            {archivedColumnCandidates.map((item, idx) => {
                              const cand = item.candidate;
                              const isDisabled = selectionType === "ACTIVE" || (selectionStage && selectionStage !== stage.slug);

                              return (
                                <div
                                  key={item.id}
                                  className={`bg-[#F9FAFB] border text-left border-[#E5E7EB] p-4 rounded-xl shadow-sm grayscale opacity-60 flex flex-col gap-1 relative ${isDisabled ? "pointer-events-none opacity-40" : ""}`}
                                >
                                  <div className="absolute top-3 right-3 z-10">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 accent-[#4B5563]"
                                      checked={selectedIds.has(item.id)}
                                      onChange={() => handleToggleCandidate(item)}
                                      disabled={!!isDisabled}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="flex items-start justify-between gap-2 pr-6">
                                    <h4
                                      className="font-bold text-[14px] text-[#8E8E93] line-clamp-1 cursor-pointer"
                                      onClick={() => onSelectCandidate?.(item, archivedColumnCandidates, idx)}
                                    >
                                      {cand.full_name || "--"}
                                    </h4>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCandidateEditing(item);
                                        setShowCandidateEditModal(true);
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                      title="Edit Candidate Details"
                                    >
                                      <Pencil className="w-3 h-3 text-[#AEAEB2]" />
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-[#AEAEB2] line-clamp-1">{cand.headline || "--"}</p>
                                  <div className="flex flex-wrap items-center mt-2 gap-y-1 gap-x-3 text-[10px] text-[#AEAEB2]">
                                    {cand.location && <span>{cand.location.split(',')[0]}</span>}
                                    {(cand.total_experience || cand.experience_years) && <span>{cand.total_experience != null ? `${cand.total_experience} Yrs` : cand.experience_years.replace(/\s*exp$/i, "")}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {activeColumnCandidates.length === 0 && archivedColumnCandidates.length === 0 && (
                        <div className="flex items-center justify-center p-6 border-2 border-dashed border-[#E5E7EB] rounded-lg h-32">
                          <span className="text-xs text-[#AEAEB2] font-medium">Drop candidates here</span>
                        </div>
                      )}
                    </div>

                    {/* Stage Action Footer */}
                    {selectedIds.size > 0 && selectionStage === stage.slug && (
                      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-3 rounded-b-xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
                        <div className="flex flex-col gap-2">
                          <div className="text-[11px] font-bold text-[#0F47F2] text-center mb-1">
                            {selectedIds.size} Selected
                          </div>
                          {selectionType === "ACTIVE" ? (
                            <>
                              <button
                                onClick={() => {
                                  const currentIdx = stages.findIndex(s => s.slug === stage.slug);
                                  if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
                                    const nextStage = stages[currentIdx + 1];
                                    bulkMoveCandidates(Array.from(selectedIds), nextStage.id);
                                  } else {
                                    showToast.error("No next stage available");
                                  }
                                }}
                                className="w-full py-2 bg-[#0F47F2] text-white text-xs font-bold rounded-lg hover:bg-[#0A3BCC] transition-colors"
                              >
                                Move to Next Round
                              </button>
                              <button
                                onClick={() => bulkArchive(Array.from(selectedIds))}
                                className="w-full py-2 bg-white text-red-600 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Archive Candidates
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  // Simplified unarchive: move back to first stage or 'shortlisted'
                                  const targetStage = stages.find(s => s.slug === "shortlisted") || stages[0];
                                  await apiClient.post("/jobs/bulk-move-stage/", {
                                    application_ids: Array.from(selectedIds),
                                    current_stage: targetStage.id,
                                  });
                                  showToast.success(`Unarchived ${selectedIds.size} candidate(s)`);
                                  setSelectedIds(new Set());
                                  setSelectionStage(null);
                                  setSelectionType(null);
                                  fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
                                  fetchArchivedCandidates(jobId);
                                } catch (error) {
                                  showToast.error("Failed to unarchive");
                                }
                              }}
                              className="w-full py-2 bg-[#E7E5FF] text-[#6155F5] text-xs font-bold rounded-lg hover:bg-[#D5D2FF] transition-colors"
                            >
                              Unarchive Candidates
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedIds(new Set());
                              setSelectionStage(null);
                              setSelectionType(null);
                            }}
                            className="w-full py-1.5 text-[#AEAEB2] text-[10px] font-medium hover:text-[#4B5563]"
                          >
                            Cancel Selection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Custom Stage Kanban Button */}
              <div className="min-w-[320px] w-[320px] bg-[#F5F9FB] rounded-xl flex flex-col items-center justify-center relative border border-[#E5E7EB] border-dashed hover:bg-black/5 transition-colors cursor-pointer" onClick={() => setShowAddStageForm(true)}>
                <div className="flex flex-col items-center gap-4 z-10 p-6 opacity-60">
                  <div className="w-[62px] h-[62px]">
                    <svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.9375 23.25C32.9375 22.18 32.07 21.3125 31 21.3125C29.93 21.3125 29.0625 22.18 29.0625 23.25V29.0625H23.25C22.18 29.0625 21.3125 29.93 21.3125 31C21.3125 32.07 22.18 32.9375 23.25 32.9375H29.0625V38.75C29.0625 39.82 29.93 40.6875 31 40.6875C32.07 40.6875 32.9375 39.82 32.9375 38.75V32.9375H38.75C39.82 32.9375 40.6875 32.07 40.6875 31C40.6875 29.93 39.82 29.0625 38.75 29.0625H32.9375V23.25Z" fill="#818283" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M31.1496 3.23047H30.853C24.8898 3.23044 20.2164 3.23042 16.5701 3.72066C12.8378 4.22244 9.89276 5.26957 7.58116 7.58116C5.26957 9.89276 4.22244 12.8378 3.72066 16.5701C3.23042 20.2164 3.23044 24.8897 3.23047 30.853V31.1496C3.23044 37.1129 3.23042 41.7862 3.72066 45.4326C4.22244 49.1647 5.26957 52.11 7.58116 54.4215C9.89276 56.7331 12.8378 57.7801 16.5701 58.2821C20.2164 58.7721 24.8897 58.7721 30.853 58.7721H31.1496C37.1129 58.7721 41.7862 58.7721 45.4326 58.2821C49.1647 57.7801 52.11 56.7331 54.4215 54.4215C56.7331 52.11 57.7801 49.1647 58.2821 45.4326C58.7721 41.7862 58.7721 37.1129 58.7721 31.1496V30.853C58.7721 24.8897 58.7721 20.2164 58.2821 16.5701C57.7801 12.8378 56.7331 9.89276 54.4215 7.58116C52.11 5.26957 49.1647 4.22244 45.4326 3.72066C41.7862 3.23042 37.1129 3.23044 31.1496 3.23047ZM10.3212 10.3212C11.7928 8.84958 13.7838 8.00511 17.0864 7.56109C20.4447 7.10958 24.8575 7.10547 31.0013 7.10547C37.145 7.10547 41.5578 7.10958 44.9162 7.56109C48.2187 8.00511 50.2097 8.84958 51.6814 10.3212C53.1531 11.7928 53.9976 13.7838 54.4414 17.0864C54.893 20.4447 54.8971 24.8575 54.8971 31.0013C54.8971 37.145 54.893 41.5578 54.4414 44.9162C53.9976 48.2187 53.1531 50.2097 51.6814 51.6814C50.2097 53.1531 48.2187 53.9976 44.9162 54.4414C41.5578 54.893 37.145 54.8971 31.0013 54.8971C24.8575 54.8971 20.4447 54.893 17.0864 54.4414C13.7838 53.9976 11.7928 53.1531 10.3212 51.6814C8.84958 50.2097 8.00511 48.2187 7.56109 44.9162C7.10958 41.5578 7.10547 37.145 7.10547 31.0013C7.10547 24.8575 7.10958 20.4447 7.56109 17.0864C8.00511 13.7838 8.84958 11.7928 10.3212 10.3212Z" fill="#818283" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-xl leading-6 text-[#818283]">Add Custom Stage</h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden mx-8 bg-white border border-[#E5E7EB] rounded-b-2xl">
              <table className="w-full text-left border-collapse">
                {/* width of columns according to the space needed so it looks good using col group make sure total sum of width is 100%*/}
                <colgroup>
                  <col style={{ width: '2%' }} /> {/* checkbox */}
                  <col style={{ width: '30%' }} /> {/* name & headline */}
                  <col style={{ width: '6%' }} />  {/* ai score */}
                  <col style={{ width: '8%' }} />  {/* location */}
                  <col style={{ width: '5%' }} />  {/* exp */}
                  <col style={{ width: '6%' }} />  {/* ctc */}
                  <col style={{ width: '7%' }} /> {/* expected ctc */}
                  <col style={{ width: '7%' }} /> {/* notice period */}
                  <col style={{ width: '9%' }} />  {/* stage */}
                  <col style={{ width: '9%' }} />  {/* attention */}
                  <col style={{ width: '11%' }} />  {/* actions */}
                </colgroup>

                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="w-10 px-4 py-4">
                      <input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    {["Name", "AI Score", "Location", "Exp", "CTC", "Expected CTC", "Notice Period", "Stage", "Attention"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort(h as CandidateSortKey)}
                      >
                        <div className="flex items-center">
                          {h} <SortIcon columnKey={h as CandidateSortKey} />
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-4 text-[13px] font-normal text-[#AEAEB2] text-right select-none whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F5F7]">
                  {loadingCandidates ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="px-4 py-5"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                        <td className="px-4 py-5"><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-32" /><div className="h-3 bg-gray-200 rounded w-40" /></div></td>
                        <td className="px-4 py-5"><div className="w-9 h-9 bg-gray-200 rounded-full" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                        <td className="px-4 py-5"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                        <td className="px-4 py-5"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                        <td className="px-4 py-5"><div className="flex gap-2 justify-end"><div className="w-8 h-8 bg-gray-200 rounded-full" /><div className="w-8 h-8 bg-gray-200 rounded-full" /><div className="w-8 h-8 bg-gray-200 rounded-full" /><div className="w-8 h-8 bg-gray-200 rounded-full" /></div></td>
                      </tr>
                    ))
                  ) : sortedCandidates.length === 0 && filteredArchivedTable.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-sm text-[#AEAEB2]">
                        No candidates found{activeStageSlug ? " in this stage" : ""}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Active Candidates */}
                      {sortedCandidates.map((item, index) => {
                        const cand = item.candidate;
                        const isDisabled = selectionType === "ARCHIVED";

                        // Experience — handle both numeric total_experience and string like "1+ years exp"
                        const expYears = cand.total_experience != null
                          ? `${cand.total_experience} Years`
                          : cand.experience_years
                            ? cand.experience_years.replace(/\s*exp$/i, "")
                            : "--";

                        // CTC
                        const ctc = cand.current_salary_lpa ? `${cand.current_salary_lpa} LPA` : "--";

                        // Expected CTC
                        const expectedCtc = cand.expected_ctc ? `${cand.expected_ctc} LPA` : "--";

                        // Notice period
                        const noticePeriod = cand.notice_period_summary || (cand.notice_period_days != null ? `${cand.notice_period_days} Days` : "--");

                        // Attention tag from status_tags
                        const attentionTag = item.status_tags?.find((t) => t.text);

                        // AI Score — read from item.job_score (top-level), not cand.job_score
                        const aiScoreRaw = item.job_score?.candidate_match_score?.score;
                        const aiScoreLabel = aiScoreRaw || "--%";
                        const aiScoreNum = aiScoreRaw ? parseInt(aiScoreRaw.replace("%", ""), 10) : 0;
                        const aiScoreColor = aiScoreNum >= 70 ? "#00C8B3" : aiScoreNum >= 40 ? "#FFCC00" : aiScoreNum > 0 ? "#FF383C" : "#E5E7EB";

                        return (
                          <tr key={item.id} className={`hover:bg-[#F9FAFB] transition-colors ${isDisabled ? "opacity-60" : ""}`}>
                            <td className="px-4 py-5">
                              <input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" checked={selectedIds.has(item.id)} onChange={() => handleToggleCandidate(item)} disabled={isDisabled} />
                            </td>
                            <td className="px-4 py-5">
                              <div
                                className="cursor-pointer group"
                                onClick={() => onSelectCandidate?.(item, candidates, index)}
                              >
                                <div className="font-medium text-[#4B5563] group-hover:underline group-hover:text-blue-600 transition">{cand.full_name || "--"}</div>
                                <div className="text-xs text-[#727272]">{cand.headline || "--"}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <div className="relative w-9 h-9">
                                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3.5" />
                                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={aiScoreColor} strokeWidth="3.5" strokeDasharray={`${aiScoreNum}, 100`} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4B5563]">{aiScoreLabel}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">{cand.location || "--"}</td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">{expYears}</td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">{ctc}</td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">{expectedCtc}</td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">{noticePeriod}</td>
                            <td className="px-4 py-5">
                              <div>
                                <div className="text-[#6155F5] text-sm font-medium">{item.current_stage?.name || "--"}</div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              {attentionTag ? (
                                <span className="inline-block text-xs font-medium px-3 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: attentionTag.color === "red" ? "#FEE9E7" : attentionTag.color === "yellow" ? "#FFF7D6" : "#FEE9E7",
                                    color: attentionTag.color === "red" ? "#FF383C" : attentionTag.color === "yellow" ? "#92400E" : "#FF383C",
                                  }}>
                                  {attentionTag.text}
                                </span>
                              ) : <span className="text-xs text-[#8E8E93]">--</span>}
                            </td>
                            <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => shortlistCandidate(item.id)}
                                  className="w-8 h-8 flex items-center justify-center bg-[#E7E5FF] rounded-full hover:bg-[#D5D2FF] transition-colors"
                                  title="Shortlist Candidate"
                                >
                                  <Check className="w-4 h-4 text-[#6155F5]" />
                                </button>
                                <button
                                  onClick={() => archiveCandidate(item.id)}
                                  className="w-8 h-8 flex items-center justify-center bg-[#FEE9E7] rounded-full hover:bg-[#FDD2D0] transition-colors"
                                  title="Archive Candidate"
                                >
                                  <Archive className="w-4 h-4 text-[#FF383C]" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCallModalCandidate({
                                      id: cand.id,
                                      name: cand.full_name || "Unknown",
                                      avatarInitials: cand.full_name ? cand.full_name.substring(0, 2).toUpperCase() : "UN",
                                      headline: cand.headline || "--",
                                      phone: cand.premium_data?.phone || cand.premium_data?.all_phone_numbers?.[0] || "+91 98765 43210", // Fallback for UI testing
                                      experience: expYears,
                                      expectedCtc: expectedCtc,
                                      location: cand.location || "--",
                                      noticePeriod: noticePeriod
                                    });
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-[#E3E1FF] rounded-full hover:bg-[#D5D2FF] transition-colors"
                                  title="Call Candidate"
                                >
                                  <span className="text-[#6155F5]">☎</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setCandidateEditing(item);
                                    setShowCandidateEditModal(true);
                                  }}
                                  className="w-8 h-8 flex items-center justify-center bg-[#F3F5F7] rounded-full hover:bg-gray-200 transition-colors"
                                  title="Edit Candidate Details"
                                >
                                  <Pencil className="w-4 h-4 text-[#4B5563]" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-[#FFF2E6] rounded-full hover:bg-[#FFE8D4] transition-colors" title="Email Candidate">
                                  <span className="text-[#FF8D28]">✉</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Archived Candidates in Table View */}
                      {filteredArchivedTable.length > 0 && (
                        <>
                          <tr className="bg-[#F9FAFB]">
                            <td colSpan={11} className="px-4 py-3 border-y border-[#E5E7EB]">
                              <div className="flex items-center gap-2">
                                <div className="h-px bg-[#D1D1D6] flex-1"></div>
                                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest px-4">Archived Candidates</span>
                                <div className="h-px bg-[#D1D1D6] flex-1"></div>
                              </div>
                            </td>
                          </tr>
                          {filteredArchivedTable.map((item) => {
                            const cand = item.candidate;
                            const isDisabled = selectionType === "ACTIVE";

                            return (
                              <tr key={item.id} className={`grayscale opacity-50 bg-gray-50/50 hover:bg-gray-100 transition-colors ${isDisabled ? "pointer-events-none opacity-30" : ""}`}>
                                <td className="px-4 py-5">
                                  <input type="checkbox" className="w-4 h-4 accent-[#4B5563]" checked={selectedIds.has(item.id)} onChange={() => handleToggleCandidate(item)} disabled={isDisabled} />
                                </td>
                                <td className="px-4 py-5">
                                  <div className="flex flex-col">
                                    <div className="font-medium text-[#8E8E93]">{cand.full_name || "--"}</div>
                                    <div className="text-xs text-[#AEAEB2]">{cand.headline || "--"}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-5">
                                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    --%
                                  </div>
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">{cand.location || "--"}</td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">{cand.total_experience != null ? `${cand.total_experience} Yrs` : (cand.experience_years ? cand.experience_years.replace(/\s*exp$/i, "") : "--")}</td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">--</td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">--</td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">--</td>
                                <td className="px-4 py-5">
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-bold">ARCHIVED</span>
                                </td>
                                <td className="px-4 py-5">
                                  <span className="text-[10px] text-[#AEAEB2]">--</span>
                                </td>
                                <td className="px-4 py-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const targetStage = stages.find(s => s.slug === "shortlisted") || stages[0];
                                          await apiClient.patch(`/jobs/applications/${item.id}/`, { current_stage: targetStage.id });
                                          showToast.success("Candidate unarchived");
                                          fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
                                          fetchArchivedCandidates(jobId);
                                        } catch { showToast.error("Failed to unarchive"); }
                                      }}
                                      className="text-[10px] font-bold text-[#0F47F2] hover:underline"
                                    >
                                      Restore
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-8 py-5 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
                <div className="text-xs text-[#6B7280]">
                  Showing {candidates.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, totalCandidates)} of {totalCandidates} candidates
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-30 hover:bg-gray-50 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-[#6B7280] text-xs">…</span>
                      ) : (
                        <button key={p} onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === p ? "bg-[#0F47F2] text-white" : "border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"}`}>
                          {p}
                        </button>
                      )
                    )}
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-30 hover:bg-gray-50 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "naukbot" && <NaukbotTab jobId={jobId} />}

      {/* ═══════════════════════════════════════════════════════
          Edit Job Role Modal
         ═══════════════════════════════════════════════════════ */}
      {showEditModal && jobId && (
        <EditJobRoleModal
          isOpen={showEditModal}
          jobId={jobId}
          workspaceId={workspaceId}
          workspaces={workspaces}
          onClose={() => setShowEditModal(false)}
          onJobUpdated={() => {
            setShowEditModal(false);
            refreshJobDetails();
            onJobUpdated?.();
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
          Upload Candidates Modal (same pattern as PipelineStages)
         ═══════════════════════════════════════════════════════ */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[40%] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload Resumes (PDF, DOC, DOCX)</h2>
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#4B5563]" />
              </button>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mb-4 w-full"
            />

            {/* Active Upload Status */}
            {uploadStatus && (() => {
              const processed = uploadStatus.success + uploadStatus.failed;
              const percent = uploadStatus.total_files > 0 ? Math.round((processed / uploadStatus.total_files) * 100) : 0;
              return (
                <div className="mt-2 mb-4 border rounded-md p-3 max-h-[240px] overflow-y-auto">
                  <details open>
                    <summary className="cursor-pointer font-medium text-lg flex justify-between">
                      <span>Active Upload</span>
                      <span className="text-gray-500">{uploadStatus.status}</span>
                    </summary>
                    <div className="mt-3 space-y-3 text-[14px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-black">Total: {uploadStatus.total_files}</div>
                        <div className="text-gray-600">Processed: {processed}</div>
                        <div className="text-green-500">Success: {uploadStatus.success}</div>
                        <div className="text-red-500">Failed: {uploadStatus.failed}</div>
                        <div className="text-yellow-500">Pending: {uploadStatus.pending}</div>
                        <div className="text-blue-500">Processing: {uploadStatus.processing}</div>
                      </div>
                      <div>
                        <div className="flex justify-between text-md mb-1">
                          <span>{processed} / {uploadStatus.total_files} completed</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded">
                          <div className="h-2 bg-blue-600 rounded" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                      {uploadStatus.failed > 0 && (
                        <div className="bg-red-50 p-2 rounded text-md text-red-600">
                          {uploadStatus.failed} file(s) failed
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              );
            })()}

            {/* Upload History */}
            {uploadHistory.length > 0 && (
              <div className="mb-4 border rounded-md p-3 max-h-[300px] overflow-y-auto">
                <details>
                  <summary className="cursor-pointer font-medium text-lg">Upload History</summary>
                  <div className="mt-3 space-y-2 text-md">
                    {uploadHistory.map((batch: any, index: number) => {
                      const processed = batch.success + batch.failed;
                      const percent = batch.total_files > 0 ? Math.round((processed / batch.total_files) * 100) : 0;
                      return (
                        <div key={index} className="border rounded-md p-3 space-y-2 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-md text-gray-700">Batch: {batch.batch_id ?? "Legacy Batch"}</span>
                            <span className="text-md text-gray-500">{new Date(batch.created_at).toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[14px]">
                            <div className="text-black">Total: {batch.total_files}</div>
                            <div className="text-gray-600">Processed: {processed}</div>
                            <div className="text-green-500">Success: {batch.success}</div>
                            <div className="text-red-500">Failed: {batch.failed}</div>
                          </div>
                          <div>
                            <div className="flex justify-between text-md mb-1">
                              <span>Status: {batch.status}</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded">
                              <div className="h-2 bg-blue-500 rounded" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCandidates}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          Requisition Info Drawer (styled like CompanyInfoDrawer)
         ═══════════════════════════════════════════════════════ */}
      {showRequisitionInfoModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end overflow-y-auto"
          onClick={handleCloseRequisitionModal}
        >
          <div
            className="bg-white shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingCompetencies ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F47F2]"></div>
                <span className="text-sm text-[#8E8E93]">Loading requisition info...</span>
              </div>
            ) : jobDataForModal ? (
              <>
                {/* ── Header ── */}
                <div className="px-[30px] py-[36px] flex flex-wrap gap-[30px] items-center justify-between" style={{ borderBottom: '0.5px solid #C7C7CC' }}>
                  <div className="flex items-center gap-[10px]">
                    <button onClick={handleCloseRequisitionModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
                    </button>
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[86px] h-[86px] rounded-full bg-[#0F47F2] text-white flex items-center justify-center shrink-0" style={{ fontSize: '36px', fontWeight: 500 }}>
                        {jobDataForModal.title?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col gap-[10px] px-[10px]">
                        <h2 style={{ fontSize: '32px', lineHeight: '40px', fontWeight: 500 }} className="text-[#4B5563]">
                          {jobDataForModal.title || '--'}
                        </h2>
                        <div className="flex flex-wrap items-start gap-[15px]">
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <Briefcase className="w-4 h-4 text-[#8E8E93]" /> {jobDataForModal.experience_min_years ?? '--'}+ years
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <LocateIcon className="w-4 h-4 text-[#8E8E93]" /> {workApproachLabel[jobDataForModal.work_approach] || jobDataForModal.work_approach || '--'}
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <FileSearch className="w-4 h-4 text-[#8E8E93]" /> {jobDataForModal.location?.join(', ') || '--'}
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <Clock className="w-4 h-4 text-[#8E8E93]" /> Immediate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tabs in header area */}
                  <div className="flex items-center gap-[10px]">
                    <div className="flex items-center gap-[10px] px-[10px] h-[37px] rounded-[5px]" style={{ background: '#E7EDFF', border: '1px solid #0F47F2' }}>
                      <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#0F47F2]">
                        JD-{jobId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div className="px-[30px] pt-[20px]" style={{ borderBottom: '0.5px solid #C7C7CC' }}>
                  <div className="flex gap-[20px]">
                    <button
                      className={`pb-[12px] text-[14px] font-medium transition-colors ${requisitionModalTab === 'info'
                        ? 'text-[#0F47F2] border-b-2 border-[#0F47F2]'
                        : 'text-[#8E8E93] hover:text-[#4B5563]'
                        }`}
                      onClick={() => setRequisitionModalTab('info')}
                    >Requisition Info</button>
                    <button
                      className={`pb-[12px] text-[14px] font-medium transition-colors ${requisitionModalTab === 'company'
                        ? 'text-[#0F47F2] border-b-2 border-[#0F47F2]'
                        : 'text-[#8E8E93] hover:text-[#4B5563]'
                        }`}
                      onClick={async () => {
                        setRequisitionModalTab('company');
                        if (jobDataForModal?.workspace_details?.id && !companyResearchData) {
                          setLoadingCompanyResearch(true);
                          try { setCompanyResearchData(await organizationService.getCompanyResearchData(jobDataForModal.workspace_details.id)); }
                          catch { } finally { setLoadingCompanyResearch(false); }
                        }
                      }}
                    >About Company</button>
                  </div>
                </div>

                {/* ── Tab Content ── */}
                {requisitionModalTab === 'info' && competenciesData && (
                  <div className="px-[30px] pt-[20px] pb-[50px]">

                    {/* ── Stats Cards ── */}
                    <div className="pl-[25px] flex flex-wrap gap-[30px] mb-[20px]">
                      {[
                        { label: 'Experience', value: `${jobDataForModal.experience_min_years ?? '--'} - ${jobDataForModal.experience_max_years ?? '--'} yrs` },
                        { label: 'Positions', value: jobDataForModal.count || '--' },
                        { label: 'Salary Range', value: formatSalary(jobDataForModal.salary_min, jobDataForModal.salary_max) },
                        { label: 'Work Approach', value: workApproachLabel[jobDataForModal.work_approach] || '--' },
                      ].map((stat, idx) => (
                        <div key={idx} className="flex flex-col gap-[8px] bg-white rounded-[10px] p-[20px]" style={{ border: '0.5px solid #D1D1D6' }}>
                          <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#4B5563]">{stat.label}</span>
                          <span style={{ fontSize: '24px', lineHeight: '29px', fontWeight: 500 }} className="text-black">{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                    {/* ── Role Overview ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <BookOpen className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Role Overview</span>
                      </h3>
                      <p style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, maxWidth: '738px' }} className="text-[#727272]">
                        {competenciesData.role_overview || '--'}
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                    {/* ── The Core Expectation ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Target className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">The Core Expectation</span>
                      </h3>
                      <div className="rounded-[10px] bg-[#EBFFEE] p-[20px]">
                        <ul className="flex flex-col gap-0">
                          {competenciesData.the_core_expectation.map((item: string, i: number) => (
                            <li key={i} style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, listStyle: 'disc', marginLeft: '16px' }} className="text-[#727272]">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                    {/* ── Key Responsibilities ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <ListChecks className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Key Responsibilities</span>
                      </h3>
                      <div className="flex flex-col gap-[10px]">
                        {competenciesData.key_responsibilities_explained.functional.map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-[10px] p-[20px] bg-[#E7EDFF] rounded-[10px]">
                            <div className="flex flex-col gap-[4px]">
                              <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-black">{item.competency}</span>
                              <span style={{ fontSize: '12px', lineHeight: '20px', fontWeight: 400 }} className="text-[#727272]">{item.context}</span>
                              {item.priority && (
                                <span className="flex items-center justify-center py-[4px] px-[10px] rounded-full bg-[#FFF7D6] text-[#F59E0B] self-start mt-[4px]" style={{ fontSize: '10px', lineHeight: '12px', fontWeight: 500 }}>
                                  Priority: {item.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Leadership responsibilities */}
                      {competenciesData.key_responsibilities_explained.leadership?.length > 0 && (
                        <>
                          <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="my-[20px]"></div>
                          <h4 className="flex items-center gap-[5px] mb-[14px]">
                            <Zap className="w-4 h-4 text-[#4B5563]" />
                            <span style={{ fontSize: '16px', lineHeight: '20px', fontWeight: 500 }} className="text-[#4B5563]">Leadership</span>
                          </h4>
                          <div className="flex flex-col gap-[10px]">
                            {competenciesData.key_responsibilities_explained.leadership.map((item: any, i: number) => (
                              <div key={i} className="flex items-start gap-[10px] p-[20px] bg-[#EBFFEE] rounded-[10px]">
                                <div className="flex flex-col gap-[4px]">
                                  <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-black">{item.responsibility}</span>
                                  <span style={{ fontSize: '12px', lineHeight: '20px', fontWeight: 400 }} className="text-[#727272]">{item.context}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                    {/* ── Technical Skills ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Layers className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Technical Skills</span>
                      </h3>
                      <div className="flex flex-col gap-[10px]">
                        {competenciesData.required_technical_skills_purpose.map((item: any, i: number) => {
                          const SKILL_COLORS = [
                            'bg-[#E7EDFF]', 'bg-[#E7E5FF]', 'bg-[#F3F5F7]',
                          ];
                          return (
                            <div key={i} className={`flex items-start gap-[10px] p-[20px] ${SKILL_COLORS[i % SKILL_COLORS.length]} rounded-[10px]`}>
                              <div className="flex flex-col gap-[4px]">
                                <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-black">{item.skill}</span>
                                <span style={{ fontSize: '12px', lineHeight: '20px', fontWeight: 400 }} className="text-[#727272]">{item.context}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Skills Pills ── */}
                    {jobDataForModal.skills && jobDataForModal.skills.length > 0 && (
                      <>
                        <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>
                        <div className="pl-[25px] mb-[50px]">
                          <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Target className="w-5 h-5 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Required Skills</span>
                          </h3>
                          <div className="flex flex-wrap gap-[10px]">
                            {jobDataForModal.skills.map((skill: string, i: number) => {
                              const PILL_COLORS = [
                                'bg-[#E7EDFF] text-[#0F47F2]',
                                'bg-[#E7E5FF] text-[#6155F5]',
                                'bg-[#EBFFEE] text-[#009951]',
                                'bg-[#FFF7D6] text-[#F59E0B]',
                                'bg-[#F3F5F7] text-[#4B5563]',
                              ];
                              return (
                                <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${PILL_COLORS[i % PILL_COLORS.length]}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── About Company Tab ── */}
                {requisitionModalTab === 'company' && (
                  <div className="px-[30px] pt-[20px] pb-[50px]">
                    {loadingCompanyResearch ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F47F2]"></div>
                        <span className="text-sm text-[#8E8E93]">Loading company info...</span>
                      </div>
                    ) : companyResearchData ? (
                      <CompanyInfoTab data={companyResearchData} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 gap-2">
                        <span className="text-sm text-[#8E8E93]">No company details available.</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-2">
                <span className="text-sm text-[#8E8E93]">Failed to load requisition data.</span>
                <button onClick={handleCloseRequisitionModal} className="text-sm text-[#0F47F2] hover:underline">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Stage Form - Full Screen Overlay */}
      {showAddStageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex">
          <div className="ml-auto min-w-[400px]">
            <AddNewStageForm
              onClose={() => setShowAddStageForm(false)}
              onStageCreated={() => {
                if (jobId != null) {
                  // Wait a short moment for backend indexes then refresh
                  setTimeout(() => window.location.reload(), 1500);
                  showToast.success("Stage created successfully!");
                  setShowAddStageForm(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Export Format Selection Modal */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Export {selectedIds.size} Candidate{selectedIds.size !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Please choose the export format for the selected candidates.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                onClick={() => setShowExportDialog(false)}
                disabled={exportLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0F47F2] text-white text-sm font-medium rounded-lg hover:bg-[#0D3ECF] disabled:opacity-50"
                onClick={() => handleExportCandidates("csv")}
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting..." : "Export as CSV"}
              </button>
              <button
                className="px-4 py-2 bg-[#0F47F2] text-white text-sm font-medium rounded-lg hover:bg-[#0D3ECF] disabled:opacity-50"
                onClick={() => handleExportCandidates("xlsx")}
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting..." : "Export as Excel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Candidate Modal */}
      <CallCandidateModal
        isOpen={!!callModalCandidate}
        onClose={() => setCallModalCandidate(null)}
        candidate={callModalCandidate}
      />

      {/* Candidate Edit Modal */}
      {/* Candidate Edit Modal */}
      {showCandidateEditModal && candidateEditing && (
        <div 
          className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/25 backdrop-blur-sm"
          onClick={() => setShowCandidateEditModal(false)}
        >
          <div 
            className="bg-white flex flex-col"
            style={{ width: 553, maxHeight: '90vh', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Header ─── */}
            <div className="w-full shrink-0" style={{ borderBottom: '0.5px solid #AEAEB2' }}>
              <div className="flex items-center justify-between" style={{ padding: '20px 24px' }}>
                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                  Edit Candidate Details
                </span>
                <button 
                  className="flex items-center justify-center bg-transparent border-none p-0 cursor-pointer hover:opacity-60"
                  onClick={() => setShowCandidateEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4B5563" strokeWidth="1" />
                    <path d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ─── Body (Scrollable if content overflows) ─── */}
            <div className="flex-1 overflow-y-auto">
              {/* Candidate Info (Inspired by NewMatchCandidateModal) */}
              <div className="w-full" style={{ borderBottom: '0.5px solid #AEAEB2', padding: '20px 24px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 30 }}>
                  <div className="flex flex-col" style={{ gap: 10 }}>
                    <h3 className="m-0 font-medium text-black" style={{ fontSize: 20, lineHeight: '24px' }}>
                      {candidateEditing.candidate.full_name || "Unknown Candidate"}
                    </h3>
                    <p className="m-0 text-xs font-normal" style={{ color: '#0F47F2', lineHeight: '14px' }}>
                      {candidateEditing.candidate.headline || "--"}
                    </p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: '#0F47F2' }}
                  >
                    {candidateEditing.candidate.full_name ? candidateEditing.candidate.full_name.substring(0, 2).toUpperCase() : "CA"}
                  </div>
                </div>

                <div className="flex items-start justify-between" style={{ gap: 67 }}>
                  <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                    <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Experience</span>
                    <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                      {candidateEditing.candidate.total_experience != null 
                        ? `${candidateEditing.candidate.total_experience} Years` 
                        : (candidateEditing.candidate.experience_years || "--")}
                    </span>
                  </div>
                  <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                    <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Location</span>
                    <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                      {candidateEditing.candidate.location || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                    {/* Placeholder for symmetry */}
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="w-full" style={{ padding: '24px' }}>
                <h4 className="m-0 font-medium text-sm uppercase text-gray-600" style={{ lineHeight: '17px', marginBottom: 20 }}>
                  Update Details
                </h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">Current CTC (LPA)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.current_ctc_lpa}
                      onChange={(e) => setCandidateEditForm({ ...candidateEditForm, current_ctc_lpa: e.target.value })}
                      placeholder="e.g. 15.5"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">Expected CTC (LPA)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.expected_ctc_lpa}
                      onChange={(e) => setCandidateEditForm({ ...candidateEditForm, expected_ctc_lpa: e.target.value })}
                      placeholder="e.g. 20"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">Notice Period (Days)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={candidateEditForm.notice_period_days}
                      onChange={(e) => setCandidateEditForm({ ...candidateEditForm, notice_period_days: e.target.value })}
                      placeholder="e.g. 30"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Footer Actions ─── */}
            <div className="flex items-center justify-end shrink-0" style={{ padding: '20px 24px', borderTop: '0.5px solid #AEAEB2', gap: 12 }}>
                <button 
                  className="flex items-center justify-center cursor-pointer bg-white text-sm font-normal transition-opacity hover:opacity-75"
                  style={{ height: 37, border: '0.5px solid #D1D1D6', borderRadius: 5, padding: '0 20px', color: '#4B5563' }}
                  onClick={() => setShowCandidateEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex items-center justify-center cursor-pointer text-sm font-normal transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
                  style={{ height: 37, background: '#0F47F2', border: 'none', borderRadius: 5, padding: '0 24px', color: 'white' }}
                  onClick={handleCandidateEditSave}
                >
                  Save Changes
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}