import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, SlidersHorizontal, Share2, Download, Calendar, Grid3X3,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Pencil, Upload, X,
  Maximize2, Minimize2,
} from "lucide-react";
import apiClient from "../../../services/api";
import { jobPostService, Job } from "../../../services/jobPostService";
import EditJobRoleModal from "../../../components/candidatePool/EditJobRoleModal";
import toast from "react-hot-toast";
import { showToast } from "../../../utils/toast";

// ─── Interfaces ────────────────────────────────────────────────

interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  stage_type: string;
  candidate_count: number;
  activity_update: string;
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
    linkedin_url: string;
    is_background_verified: boolean;
    experience_years: string;
    experience_summary: {
      title: string;
      date_range: string;
      duration_years: number;
    };
    education_summary: { title: string; date_range: string };
    notice_period_summary: string;
    skills_list: string[];
    social_links: {
      linkedin: string;
      github: string;
      portfolio: string;
      resume: string;
    };
    resume_url: string;
    current_salary_lpa: string;
    profile_summary?: string;
    total_experience?: number;
    notice_period_days?: number;
    premium_data_unlocked: boolean;
    premium_data?: {
      email?: string;
      phone?: string;
    };
    source?: {
      source: string;
      original_platform: string;
    };
  };
  stage_slug: string;
  job: {
    id: number;
    title: string;
  };
  current_stage: {
    id: number;
    name: string;
    slug: string;
  };
  status_tags: {
    text: string;
    color: string;
  }[];
}

// ─── Props ─────────────────────────────────────────────────────

interface JobPipelineDashboardProps {
  jobId: number | null;
  workspaceId: number;
  workspaces: { id: number; name: string }[];
  onJobUpdated?: () => void;
  onSelectCandidate?: (candidate: CandidateListItem) => void;
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

  // ── Candidates
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // ── Pagination & search
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState("");

  // ── Selection
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ── Active tab
  const [activeTab, setActiveTab] = useState<"pipeline" | "naukbot" | "inbound">("pipeline");

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

  // ── Fetch Stages ─────────────────────────────────────────────

  const fetchStages = useCallback(async (jId: number) => {
    setLoadingStages(true);
    try {
      const response = await apiClient.get(`/jobs/applications/stages/?job_id=${jId}`);
      const data: Stage[] = response.data;
      const sorted = data.sort((a, b) => a.sort_order - b.sort_order);
      setStages(sorted);
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]);
    } finally {
      setLoadingStages(false);
    }
  }, []);

  useEffect(() => {
    if (jobId != null) { fetchStages(jobId); }
  }, [jobId, fetchStages]);

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
    if (jobId != null) { fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery); }
  }, [jobId, activeStageSlug, currentPage, searchQuery, fetchCandidates]);

  useEffect(() => { setCurrentPage(1); }, [activeStageSlug, searchQuery]);

  // ── Selection Logic ──────────────────────────────────────────

  const handleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); }
    else { setSelectedIds(new Set(candidates.map((c) => c.id))); }
    setSelectAll(!selectAll);
  };

  const handleToggleCandidate = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    setSelectAll(next.size === candidates.length && candidates.length > 0);
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

  // ── Derived ──────────────────────────────────────────────────

  const totalPipelineCandidates = stages.reduce((sum, s) => sum + s.candidate_count, 0);

  const getStageIndex = (slug: string): number => {
    const idx = stages.findIndex((s) => s.slug === slug);
    return idx >= 0 ? idx : 0;
  };

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
          <div className="transition-all">
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
          Stage Filter Pills
         ═══════════════════════════════════════════════════════ */}
      <div className="mx-8 mt-4 flex items-center justify-between bg-white p-4 rounded-t-2xl border border-b-0 border-[#E5E7EB]">
        <div className="flex items-center gap-2 flex-wrap">
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
            stages.filter((s) => s.slug !== "archives").map((stage) => (
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
        </div>

        <button className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#414141] transition-colors p-2 rounded-lg border border-[#D1D1D6] text-xs">
          <Grid3X3 className="w-4 h-4" /> Kanban
        </button>
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
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
            <Share2 className="w-4 h-4" /> Share Pipeline
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors">
            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Candidates Table
         ═══════════════════════════════════════════════════════ */}
      <div className="mx-8 bg-white border border-[#E5E7EB] rounded-b-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="w-10 px-6 py-4">
                <input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" checked={selectAll} onChange={handleSelectAll} />
              </th>
              {["Name", "AI Score", "Location", "Exp", "CTC", "Expected CTC", "Notice Period", "Stage", "Attention"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">{h}</th>
              ))}
              <th className="w-24 px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F5F7]">
            {loadingCandidates ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  <td className="px-6 py-5"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-5"><div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-32" /><div className="h-3 bg-gray-200 rounded w-40" /></div></td>
                  <td className="px-6 py-5"><div className="w-9 h-9 bg-gray-200 rounded-full" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-6 py-5"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                  <td className="px-6 py-5"><div className="flex gap-2 justify-end"><div className="w-8 h-8 bg-gray-200 rounded-full" /><div className="w-8 h-8 bg-gray-200 rounded-full" /></div></td>
                </tr>
              ))
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-sm text-[#AEAEB2]">
                  No candidates found{activeStageSlug ? " in this stage" : ""}
                </td>
              </tr>
            ) : (
              candidates.map((item) => {
                const cand = item.candidate;
                const stageIdx = getStageIndex(item.current_stage?.slug || item.stage_slug);
                const totalStgs = stages.length > 0 ? stages.filter(s => s.slug !== "archives").length : 5;
                const expYears = cand.total_experience != null ? `${cand.total_experience} Years` : cand.experience_years ? `${cand.experience_years} Years` : "--";
                const ctc = cand.current_salary_lpa || "--";
                const noticePeriod = cand.notice_period_summary || (cand.notice_period_days != null ? `${cand.notice_period_days} Days` : "--");
                const attentionTag = item.status_tags?.find((t) => t.text);

                return (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] cursor-pointer transition-colors" onClick={() => onSelectCandidate?.(item)}>
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" checked={selectedIds.has(item.id)} onChange={() => handleToggleCandidate(item.id)} />
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-medium text-[#4B5563]">{cand.full_name || "--"}</div>
                        <div className="text-xs text-[#727272]">{cand.headline || "--"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative w-9 h-9">
                        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3.5" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00C8B3" strokeWidth="3.5" strokeDasharray="84, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4B5563]">{cand?.job_score?.candidate_match_score.score ? `${cand.job_score.candidate_match_score.score}` : "--%"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#8E8E93]">{cand.location || "--"}</td>
                    <td className="px-6 py-5 text-sm text-[#8E8E93]">{expYears}</td>
                    <td className="px-6 py-5 text-sm text-[#8E8E93]">{ctc}</td>
                    <td className="px-6 py-5 text-sm text-[#8E8E93]">--</td>
                    <td className="px-6 py-5 text-sm text-[#8E8E93]">{noticePeriod}</td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-[#6155F5] text-sm font-medium">{item.current_stage?.name || "--"}</div>
                        <div className="flex gap-0.5 mt-1.5">
                          {Array.from({ length: totalStgs }).map((_, idx) => (
                            <div key={idx} className="h-1 w-7 rounded" style={{ backgroundColor: idx <= stageIdx ? stageBarColors[idx % stageBarColors.length] : "#E5E5EA" }} />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button className="w-8 h-8 flex items-center justify-center bg-[#E3E1FF] rounded-full hover:bg-[#D5D2FF] transition-colors">
                          <span className="text-[#6155F5]">☎</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-[#FFF2E6] rounded-full hover:bg-[#FFE8D4] transition-colors">
                          <span className="text-[#FF8D28]">✉</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
}