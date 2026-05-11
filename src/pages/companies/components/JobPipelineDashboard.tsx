import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  Search,
  SlidersHorizontal,
  Share2,
  Download,
  Calendar,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Archive,
  Check,
  Plus,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Briefcase,
  LocateIcon,
  FileSearch,
  Target,
  Layers,
  BookOpen,
  ListChecks,
  Zap,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Mail,
  Trash2,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/api";
import { jobPostService, Job } from "../../../services/jobPostService";
import {
  organizationService,
  CompanyResearchData,
} from "../../../services/organizationService";
import { candidateService } from "../../../services/candidateService";
import EditJobRoleModal from "../../candidates/components/EditJobRoleModal";
import CompanyInfoTab from "./CompanyInfoTab";

import NaukbotTab from "./NaukbotTab";
import LinkedinBotTab from "./LinkedinBotTab";
import InboundTab from "./InboundTab";
import NxthyreTab from "./NxthyreTab";
import AddNewStageForm from "../../pipelines/AddNewStageForm";
import toast from "react-hot-toast";
import { showToast } from "../../../utils/toast";
import * as XLSX from "xlsx";
import PipelineFilterPanel, { PipelineFiltersState, EMPTY_PIPELINE_FILTERS } from "./PipelineFilterPanel";
import DateRangeFilter from "./DateRangeFilter";
import PipelineKanbanColumn from "./PipelineKanbanColumn";
import CallCandidateModal, { CallCandidateData } from "./CallCandidateModal";
import { getAttentionPill, formatTimeAgo } from "../../../utils/candidateAttention";

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
    current_take_home?: number | null;
    last_working_day?: string | null;
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
    is_ascendion_duplicate?: boolean | null;
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
  latest_manual_call_status?: string | null;
  latest_manual_call_at?: string | null;
  latest_manual_call_note?: string | null;
  latest_manual_call_tags?: string[] | null;
  latest_call_status?: string | null;
  latest_call_at?: string | null;
  latest_call_note?: string | null;
  latest_call_tags?: string[] | null;
  next_follow_up?: {
    scheduled_date: string;
    scheduled_time: string;
  } | null;
}

const isAscendionWorkspaceName = (name?: string | null) =>
  (name || "").toLowerCase().includes("ascendion");

// ─── Props ─────────────────────────────────────────────────────

interface JobPipelineDashboardProps {
  jobId: number | null;
  workspaceId: number;
  workspaces: { id: number; name: string }[];
  onJobUpdated?: () => void;
  onSelectCandidate?: (
    candidate: CandidateListItem,
    allCandidates?: CandidateListItem[],
    index?: number,
  ) => void;
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
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Moved formatTimeAgo and getAttentionPill to src/utils/candidateAttention.ts


const workApproachLabel: Record<string, string> = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const stageBarColors = [
  "#FFCC00",
  "#00C8B3",
  "#6155F5",
  "#FF8D28",
  "#0F47F2",
  "#E5E5EA",
];

const statusLabel = (status?: string): string => {
  if (!status) return "Draft";
  if (status === "PUBLISHED" || status === "ACTIVE") return "Active";
  if (status === "PAUSED") return "Paused";
  if (status === "CLOSED") return "Closed";
  return "Draft";
};

const statusColor = (
  status?: string,
): { bg: string; dot: string; text: string } => {
  const label = statusLabel(status);
  if (label === "Active")
    return { bg: "bg-[#EBFFEE]", dot: "bg-[#009951]", text: "text-[#069855]" };
  if (label === "Paused")
    return { bg: "bg-[#FFF7D6]", dot: "bg-[#D97706]", text: "text-[#92400E]" };
  if (label === "Closed")
    return { bg: "bg-[#F3F5F7]", dot: "bg-[#8E8E93]", text: "text-[#8E8E93]" };
  return { bg: "bg-[#F2F2F7]", dot: "bg-[#8E8E93]", text: "text-[#4B5563]" };
};

// ─── Hidden Stages ────────────────────────────────────────────
// Stage names (case-insensitive) that should never appear in the pipeline UI
const HIDDEN_STAGE_NAMES = ["invites sent", "applied"];

const isHiddenStage = (stage: Stage) =>
  HIDDEN_STAGE_NAMES.some((name) => stage.name.toLowerCase() === name);

// ─── Component ─────────────────────────────────────────────────

export default function JobPipelineDashboard({
  jobId,
  workspaceId,
  workspaces,
  onJobUpdated,
  onSelectCandidate,
  externalStages,
  onRefreshStages,
}: JobPipelineDashboardProps) {
  const navigate = useNavigate();

  const isAscendionWorkspace = React.useMemo(() => {
    const wsName = workspaces.find((w) => w.id === workspaceId)?.name;
    return isAscendionWorkspaceName(wsName);
  }, [workspaces, workspaceId]);

  const [ascendionCheckingIds, setAscendionCheckingIds] = useState<Set<string>>(
    () => new Set(),
  );

  const ascendionNonDupStorageKey = React.useMemo(() => {
    if (!jobId) return null;
    return `_nxthyre_ascendion_nondup_${jobId}`;
  }, [jobId]);

  const [verifiedNonDuplicateIds, setVerifiedNonDuplicateIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!ascendionNonDupStorageKey) {
      setVerifiedNonDuplicateIds(new Set());
      return;
    }
    try {
      const raw = sessionStorage.getItem(ascendionNonDupStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setVerifiedNonDuplicateIds(
          new Set(parsed.filter((v) => typeof v === "string")),
        );
      } else {
        setVerifiedNonDuplicateIds(new Set());
      }
    } catch {
      setVerifiedNonDuplicateIds(new Set());
    }
  }, [ascendionNonDupStorageKey]);

  useEffect(() => {
    if (!ascendionNonDupStorageKey) return;
    sessionStorage.setItem(
      ascendionNonDupStorageKey,
      JSON.stringify(Array.from(verifiedNonDuplicateIds)),
    );
  }, [ascendionNonDupStorageKey, verifiedNonDuplicateIds]);
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
  const [activeStageSlug, setActiveStageSlug] = useState<string | null>(() => {
    if (jobId) {
      return sessionStorage.getItem(`_nxthyre_active_stage_${jobId}`);
    }
    return null;
  });

  useEffect(() => {
    if (jobId) {
      if (activeStageSlug) {
        sessionStorage.setItem(`_nxthyre_active_stage_${jobId}`, activeStageSlug);
      } else {
        sessionStorage.removeItem(`_nxthyre_active_stage_${jobId}`);
      }
    }
  }, [activeStageSlug, jobId]);
  const [showAddStageForm, setShowAddStageForm] = useState(false);
  const [archivedCandidates, setArchivedCandidates] = useState<any[]>([]);
  const [kanbanRefreshCounters, setKanbanRefreshCounters] = useState<Record<string, number>>({});

  const triggerKanbanRefresh = useCallback((slugs: string[]) => {
    setKanbanRefreshCounters(prev => {
      const next = { ...prev };
      slugs.forEach(slug => {
        next[slug] = (next[slug] || 0) + 1;
      });
      return next;
    });
  }, []);

  // ── Candidates
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [callModalCandidate, setCallModalCandidate] = useState<CallCandidateData | null>(null);


  // ── Candidate Edit Modal State
  const [showCandidateEditModal, setShowCandidateEditModal] = useState(false);
  const [candidateEditing, setCandidateEditing] =
    useState<CandidateListItem | null>(null);
  const [candidateEditForm, setCandidateEditForm] = useState({
    notice_period_days: "",
    current_ctc_lpa: "",
    expected_ctc_lpa: "",
    current_take_home: "",
    last_working_day: "",
    location: "",
    exp: "",
  });

  // ── Pagination & search
  const [currentPage, setCurrentPage] = useState(() => {
    if (jobId) {
      const saved = sessionStorage.getItem(`_nxthyre_current_page_${jobId}`);
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const pageSize = 10;
  const [searchQuery, setSearchQuery] = useState(() => {
    if (jobId) {
      return sessionStorage.getItem(`_nxthyre_search_query_${jobId}`) || "";
    }
    return "";
  });

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(`_nxthyre_current_page_${jobId}`, currentPage.toString());
    }
  }, [currentPage, jobId]);

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(`_nxthyre_search_query_${jobId}`, searchQuery);
    }
  }, [searchQuery, jobId]);

  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);

  // ── Selection
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectionStage, setSelectionStage] = useState<string | null>(null);
  const [selectionType, setSelectionType] = useState<
    "ACTIVE" | "ARCHIVED" | null
  >(null);
  const [selectedCandidatesMap, setSelectedCandidatesMap] = useState<Record<number, any>>({});

  // ── Stage Actions Modal State ──
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  const [stageToEdit, setStageToEdit] = useState<Stage | null>(null);


  // ── Feedback Modal State ──
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const draggedCandidateItemRef = useRef<any>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
    candidateNames?: string[];
  } | null>(null);

  // ── Filters & Date Range ──
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFiltersState>(EMPTY_PIPELINE_FILTERS);
  const [showPipelineFilterPanel, setShowPipelineFilterPanel] = useState(false);
  const pipelineFilterButtonRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [dateRangeFilterLabel, setDateRangeFilterLabel] = useState<string>("Date Filter");
  const [isDateRangeFilterApplied, setIsDateRangeFilterApplied] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{ from: string, to: string }>({ from: "", to: "" });

  // ── Sorting
  type CandidateSortKey =
    | "Name"
    | "AI Score"
    | "Location"
    | "Exp"
    | "CTC"
    | "Expected CTC"
    | "Notice Period"
    | "Stage"
    | "Attention";
  const [sortConfig, setSortConfig] = useState<{
    key: CandidateSortKey;
    direction: "asc" | "desc";
  } | null>({ key: "AI Score", direction: "desc" });

  const handleSort = (key: CandidateSortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (
      ["AI Score", "Exp", "CTC", "Expected CTC", "Notice Period"].includes(key)
    ) {
      direction = "desc"; // Default desc for numeric/score values
    }

    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === direction) {
        direction = direction === "asc" ? "desc" : "asc";
      } else {
        setSortConfig(null);
        return;
      }
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: CandidateSortKey }) => {
    if (sortConfig?.key !== columnKey)
      return (
        <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400 group-hover:text-gray-600 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />
    );
  };

  // Primary list for active candidates
  let combinedCands = candidates;

  if (activeStageSlug) {
    combinedCands = combinedCands.filter(
      (c) => (c.current_stage?.slug || c.stage_slug) === activeStageSlug,
    );
  }
  const sortedCandidates = combinedCands;

  // Derived list for archived candidates (separated to avoid duplication in the main active list)
  const filteredArchivedTable = archivedCandidates.filter((item) => {
    // 1. Filter by associated stage (tab) if one is active
    if (
      activeStageSlug &&
      (item.current_stage?.slug || item.stage_slug) !== activeStageSlug
    )
      return false;

    // 2. Filter by search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.candidate.full_name?.toLowerCase() || "";
      const headline = item.candidate.headline?.toLowerCase() || "";
      if (!name.includes(q) && !headline.includes(q)) return false;
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState<
    "pipeline" | "naukbot" | "inbound" | "linkedinbot" | "nxthyre"
  >(() => {
    if (jobId) {
      return (sessionStorage.getItem(`_nxthyre_active_tab_${jobId}`) as any) || "pipeline";
    }
    return "pipeline";
  });

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(`_nxthyre_active_tab_${jobId}`, activeTab);
    }
  }, [activeTab, jobId]);

  const [linkedinBotFilteredCount, setLinkedinBotFilteredCount] = useState<number | null>(null);

  const [isKanbanView, setIsKanbanView] = useState(() => {
    if (jobId) {
      return sessionStorage.getItem(`_nxthyre_is_kanban_${jobId}`) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem(`_nxthyre_is_kanban_${jobId}`, isKanbanView.toString());
    }
  }, [isKanbanView, jobId]);
  const [draggedCandidateId, setDraggedCandidateId] = useState<number | null>(
    null,
  );
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [shiftStageItem, setShiftStageItem] = useState<CandidateListItem | null>(null);
  const [shiftStageTargetId, setShiftStageTargetId] = useState<number | null>(null);

  // Kanban Stage Menu State
  const [stageMenuOpenId, setStageMenuOpenId] = useState<number | null>(null);
  const stageMenuRef = useRef<HTMLDivElement>(null);
  const [stageMenuPos, setStageMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [visibleArchives, setVisibleArchives] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
      if (stageMenuRef.current && !stageMenuRef.current.contains(event.target as Node)) {
        setStageMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const getInitials = (name: string) => {
    if (!name) return "--";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleDragStart = (e: React.DragEvent, item: any) => {
    const id = item.id;
    setDraggedCandidateId(id);
    draggedCandidateItemRef.current = item;

    // Custom drag image logic for multiple selections
    if (selectedIds.has(id) && selectedIds.size > 1) {
      const selectedArray = Array.from(selectedIds);

      const getCandidateName = (cId: number) => {
        if (cId === draggedCandidateItemRef.current?.id) return draggedCandidateItemRef.current?.candidate?.full_name || "Unknown";
        return selectedCandidatesMap[cId]?.candidate?.full_name || candidates.find(cand => cand.id === cId)?.candidate?.full_name || archivedCandidates.find((cand: any) => cand.id === cId)?.candidate?.full_name || "Unknown";
      };

      const candidatesToDrag = selectedArray.map(getCandidateName);

      const overlay = document.createElement("div");
      overlay.id = "custom-drag-image";
      overlay.style.position = "absolute";
      overlay.style.top = "-1000px";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "9999";

      let avatarsHtml = "";
      const positions = [
        "top: -8px; left: -8px;",
        "top: -8px; right: -8px;",
        "bottom: -8px; left: -8px;"
      ];

      const colors = ["#FCA5A5", "#FCD34D", "#93C5FD", "#D8B4FE", "#86EFAC"];

      candidatesToDrag.slice(0, 3).forEach((name, idx) => {
        const initials = getInitials(name);
        // Map name length roughly to color index for consistency
        const color = colors[name.length % colors.length];
        avatarsHtml += `<div style="position: absolute; ${positions[idx]} width: 44px; height: 44px; border-radius: 50%; background: ${color}; border: 3px solid white; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: 700; color: #1C1C1E; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">${initials}</div>`;
      });

      if (candidatesToDrag.length > 3) {
        avatarsHtml += `<div style="position: absolute; bottom: -8px; right: -8px; width: 44px; height: 44px; border-radius: 50%; background: #1C1C1E; color: white; border: 3px solid white; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: 700; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">+${candidatesToDrag.length - 3}</div>`;
      }

      const handIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F47F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14v4"/><path d="M11 20H8a2 2 0 0 1-2-2v-5"/><path d="M6 10a2 2 0 0 1 2-2h1"/><path d="M9 8V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v8"/><path d="M14 11V9a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v2"/><path d="M19 14v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v6a2 2 0 0 1-2 2h-1"/></svg>`;

      overlay.innerHTML = `
        <div style="position: relative; width: 100px; height: 100px; border-radius: 50%; border: 2px dashed #0F47F2; background: rgba(231, 237, 255, 0.7); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px);">
          ${handIcon}
          ${avatarsHtml}
        </div>
        <div style="margin-top: 14px; background: #0F47F2; color: white; padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 700; text-align: center; box-shadow: 0 4px 6px rgba(15,71,242,0.3); text-transform: uppercase;">
          MOVE TO NEXT STAGE
        </div>
      `;

      document.body.appendChild(overlay);
      e.dataTransfer.setDragImage(overlay, 50, 50);

      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, toStageSlug: string) => {
    e.preventDefault();
    if (!draggedCandidateId || !jobId) return;

    const toStage = stages.find((s) => s.slug === toStageSlug);
    if (!toStage) return;

    const actionType = toStageSlug === "archives" ? "archive" : "move";

    let idsToMove = [draggedCandidateId];
    if (selectedIds.has(draggedCandidateId)) {
      idsToMove = Array.from(selectedIds);
    }

    openFeedbackModal({
      type: actionType,
      applicationIds: idsToMove,
      targetStageId: toStage.id,
      targetStageName: toStage.name,
    });

    setDraggedCandidateId(null);
  };

  // ── Requisition Info Modal
  const [showRequisitionInfoModal, setShowRequisitionInfoModal] =
    useState(false);
  const [requisitionModalTab, setRequisitionModalTab] = useState<
    "info" | "company"
  >("info");
  const [jobDataForModal, setJobDataForModal] = useState<Job | null>(null);
  const [competenciesData, setCompetenciesData] = useState<any>(null);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [companyResearchData, setCompanyResearchData] =
    useState<CompanyResearchData | null>(null);
  const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);

  // ── Export
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);



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

      const response = await candidateService.exportCandidates(
        selectedCandidateUuids,
        jobId,
      );

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
              : `${batch.success} succeeded, ${batch.failed} failed`,
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
        return (
          name.endsWith(".pdf") ||
          name.endsWith(".doc") ||
          name.endsWith(".docx")
        );
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
        duration: 5000,
        position: "top-center",
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
      toast.success(
        "Resumes queued for analysis. Refresh after 10 mins to check status.",
        {
          duration: 7000,
          position: "top-center",
          style: { background: "#0abc1eff", color: "#fff", fontWeight: "500" },
        },
      );
      setUploadFiles(null);
      // Refresh candidates
      if (jobId) {
        fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery);
        fetchStages(jobId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload candidates", {
        duration: 5000,
        position: "top-center",
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

  const fetchStages = useCallback(
    async (jId: number) => {
      if (onRefreshStages) {
        onRefreshStages();
        return;
      }
      setLoadingStages(true);
      try {
        const response = await apiClient.get(
          `/jobs/applications/stages/?job_id=${jId}`,
        );
        const data: Stage[] = response.data;
        const filtered = data.filter(
          (s) =>
            s.slug !== "archives" &&
            !s.name.toLowerCase().includes("archive") &&
            !isHiddenStage(s),
        );
        const sorted = filtered.sort((a, b) => a.sort_order - b.sort_order);
        setStages(sorted);
      } catch (error) {
        console.error("Error fetching stages:", error);
        setStages([]);
      } finally {
        setLoadingStages(false);
      }
    },
    [onRefreshStages],
  );

  useEffect(() => {
    if (jobId != null && (!externalStages || externalStages.length === 0)) {
      fetchStages(jobId);
    }
  }, [jobId, fetchStages, externalStages]);

  // ── Fetch Archived Candidates (For in-place Kanban/Table view)
  const fetchArchivedCandidates = useCallback(async (jId: number) => {
    try {
      const res = await apiClient.get(
        `/jobs/roles/${jId}/archived-applications/`,
      );
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

  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});

  // ── Fetch Candidates ─────────────────────────────────────────

  const orderingMap: Record<string, string> = {
    "Name": "full_name",
    "AI Score": "ai_score",
    "Location": "location",
    "Exp": "experience",
    "CTC": "current_ctc",
    "Expected CTC": "expected_ctc",
    "Notice Period": "notice_period",
    "Stage": "stage",
  };

  const fetchCandidates = useCallback(
    async (
      jId: number,
      stageSlug: string | null,
      page: number,
      search: string,
      limit: number = pageSize
    ) => {
      setLoadingCandidates(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("job_id", jId.toString());
        if (stageSlug) queryParams.append("stage_slug", stageSlug);
        queryParams.append("page", page.toString());
        queryParams.append("page_size", limit.toString());
        if (search.trim()) queryParams.append("search", search.trim());

        if (sortConfig && orderingMap[sortConfig.key]) {
          const prefix = sortConfig.direction === "desc" ? "-" : "";
          queryParams.append("ordering", `${prefix}${orderingMap[sortConfig.key]}`);
        }

        if (pipelineFilters.location.length) {
          queryParams.append("location", pipelineFilters.location.join(","));
        }
        if (pipelineFilters.salaryRange.min) {
          queryParams.append("salary_min", pipelineFilters.salaryRange.min);
        }
        if (pipelineFilters.salaryRange.max) {
          queryParams.append("salary_max", pipelineFilters.salaryRange.max);
        }
        if (pipelineFilters.experience.min) {
          queryParams.append("experience_min", pipelineFilters.experience.min);
        }
        if (pipelineFilters.experience.max) {
          queryParams.append("experience_max", pipelineFilters.experience.max);
        }
        if (pipelineFilters.designation.length) {
          queryParams.append("designation", pipelineFilters.designation.join(","));
        }
        if (pipelineFilters.noticePeriod.selected.length) {
          queryParams.append("notice_period", pipelineFilters.noticePeriod.selected.join(","));
        }
        if (pipelineFilters.noticePeriod.minDays) {
          queryParams.append("notice_period_min_days", pipelineFilters.noticePeriod.minDays);
        }
        if (pipelineFilters.noticePeriod.maxDays) {
          queryParams.append("notice_period_max_days", pipelineFilters.noticePeriod.maxDays);
        }
        if (pipelineFilters.attention.length) {
          queryParams.append("attention", pipelineFilters.attention.join(","));
        }
        if (dateRange.from) {
          queryParams.append("last_activity_from", dateRange.from);
        }
        if (dateRange.to) {
          queryParams.append("last_activity_to", dateRange.to);
        }

        const url = `/jobs/applications/?${queryParams.toString()}`;

        const response = await apiClient.get(url, {
          signal: abortControllerRef.current.signal
        });

        const data = response.data;

        let candidateData: CandidateListItem[] = [];
        let count = 0;
        if (Array.isArray(data)) {
          candidateData = data;
          count = data.length;
        } else if (data && Array.isArray(data.results)) {
          candidateData = data.results;
          count = data.count || data.results.length;
        }

        if (data && data.stage_counts) {
          setStageCounts(data.stage_counts);
        }

        setCandidates(candidateData);
        setTotalCandidates(count);
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.message === 'canceled') {
          return;
        }
        console.error("Error fetching candidates:", error);
        setCandidates([]);
        setTotalCandidates(0);
      } finally {
        setLoadingCandidates(false);
      }
    },
    [pipelineFilters, dateRange, sortConfig, pageSize],
  );

  const runAscendionDuplicateCheck = useCallback(
    async (candidateId: string) => {
      if (!jobId) return;

      setAscendionCheckingIds((prev) => new Set(prev).add(candidateId));
      try {
        const res = await apiClient.post("/candidates/ascendion/check-duplicate/", {
          candidate_id: candidateId,
          job_id: jobId,
        });

        const isDup = res.data?.is_duplicate;
        if (isDup === true) {
          showToast.error("Duplicate in Ascendion portal");
        } else if (isDup === false) {
          showToast.success("Not a duplicate in Ascendion portal");
          setVerifiedNonDuplicateIds((prev) => {
            const next = new Set(prev);
            next.add(candidateId);
            return next;
          });
        } else {
          showToast.info("Ascendion duplicate check completed");
        }

        // Refresh pipeline + archives (duplicate candidates may be auto-archived)
        if (isKanbanView) {
          triggerKanbanRefresh(["uncontacted"]);
        } else {
          fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery, pageSize);
        }
        fetchArchivedCandidates(jobId);
      } catch (err: any) {
        showToast.error(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to check Ascendion duplicate",
        );
      } finally {
        setAscendionCheckingIds((prev) => {
          const next = new Set(prev);
          next.delete(candidateId);
          return next;
        });
      }
    },
    [
      jobId,
      fetchCandidates,
      fetchArchivedCandidates,
      triggerKanbanRefresh,
      isKanbanView,
      activeStageSlug,
      currentPage,
      searchQuery,
      pageSize,
    ],
  );

  useEffect(() => {
    if (jobId != null) {
      if (!isKanbanView) {
        const currentStage = activeStageSlug;
        fetchCandidates(jobId, currentStage, currentPage, searchQuery, pageSize);
      }
      fetchArchivedCandidates(jobId);
    }
  }, [
    jobId,
    activeStageSlug,
    currentPage,
    isKanbanView,
    searchQuery,
    fetchCandidates,
    fetchArchivedCandidates,
  ]);

  useEffect(() => {
    if (searchQuery.length > 0 && jobId !== null && activeTab === "pipeline") {
      const fetchSuggestions = async () => {
        try {
          const res = await jobPostService.searchAutosuggest(
            searchQuery,
            jobId,
          );
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStageSlug, searchQuery, pipelineFilters, dateRange, sortConfig]);

  // ── Candidate Edit Handlers ──
  useEffect(() => {
    if (showCandidateEditModal && candidateEditing) {
      const cand = candidateEditing.candidate;

      // Robust extraction for numeric CTC/expected
      const extractNum = (val: any) => {
        if (val == null) return "";
        const match = val.toString().match(/[\d.]+/);
        return match ? match[0] : "";
      };

      let noticePeriodDays = cand.notice_period_days?.toString() || "";
      if (!noticePeriodDays && cand.notice_period_summary) {
        if (cand.notice_period_summary.toLowerCase().includes("immediate")) {
          noticePeriodDays = "0";
        } else {
          const match = cand.notice_period_summary.match(/\d+/);
          if (match) noticePeriodDays = match[0];
        }
      }

      setCandidateEditForm({
        notice_period_days: noticePeriodDays,
        current_ctc_lpa: extractNum(
          cand.current_salary_lpa || (cand as any).current_salary,
        ),
        expected_ctc_lpa: extractNum(cand.expected_ctc),
        current_take_home: extractNum(cand.current_take_home),
        last_working_day: cand.last_working_day || "",
        location: cand.location || "",
        exp: extractNum(cand.total_experience ?? cand.experience_years),
      });
    }
  }, [showCandidateEditModal, candidateEditing]);

  useEffect(() => {
    if (!showCandidateEditModal) {
      setCandidateEditForm({
        notice_period_days: "",
        current_ctc_lpa: "",
        expected_ctc_lpa: "",
        current_take_home: "",
        last_working_day: "",
        location: "",
        exp: "",
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
        payload.expected_ctc = lpa.toString();
      }
    }

    if (candidateEditForm.current_take_home !== "") {
      const val = parseFloat(candidateEditForm.current_take_home);
      if (isNaN(val) || val < 0) {
        showToast.error("Current take home must be a non-negative number");
        valid = false;
      } else {
        payload.current_take_home = val;
      }
    }

    if (candidateEditForm.last_working_day !== "") {
      payload.last_working_day = candidateEditForm.last_working_day;
    }

    if (candidateEditForm.location !== "") {
      payload.location = candidateEditForm.location.trim();
    }

    if (candidateEditForm.exp !== "") {
      const val = parseFloat(candidateEditForm.exp);
      if (isNaN(val) || val < 0) {
        showToast.error("Experience must be a non-negative number");
        valid = false;
      } else {
        payload.exp = val;
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
              const lpaVal = parseFloat(payload.expected_ctc);
              const lpaStr =
                lpaVal % 1 === 0 ? `${lpaVal}` : lpaVal.toFixed(1);
              updatedCand.expected_ctc = lpaStr;
            }
            if (payload.current_take_home !== undefined) {
              updatedCand.current_take_home = payload.current_take_home;
            }
            if (payload.last_working_day !== undefined) {
              updatedCand.last_working_day = payload.last_working_day;
            }
            if (payload.location !== undefined) {
              updatedCand.location = payload.location;
            }
            if (payload.exp !== undefined) {
              updatedCand.total_experience = payload.exp;
              updatedCand.experience_years = `${payload.exp} years`;
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
    } else {
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
    const nextMap = { ...selectedCandidatesMap };

    // Exclusive selection logic
    if (next.size > 0) {
      if (selectionType !== itemType) {
        showToast.error(
          `Cannot select ${itemType.toLowerCase()} candidate while ${selectionType?.toLowerCase()} candidates are selected`,
        );
        return;
      }
      if (isKanbanView && selectionStage && selectionStage !== itemStage) {
        showToast.error("Selection is restricted to one stage in Kanban view");
        return;
      }
    }

    if (next.has(id)) {
      next.delete(id);
      delete nextMap[id];
      if (next.size === 0) {
        setSelectionType(null);
        setSelectionStage(null);
      }
    } else {
      next.add(id);
      nextMap[id] = item;
      setSelectionType(itemType);
      if (isKanbanView) setSelectionStage(itemStage);
    }

    setSelectedIds(next);
    setSelectedCandidatesMap(nextMap);
    setSelectAll(next.size === candidates.length && candidates.length > 0);
  };

  // ── Actions ──────────────────────────────────────────────────

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedCandidatesMap({});
    setSelectAll(false);
    setSelectionStage(null);
    setSelectionType(null);
  };

  const nonArchiveStages = stages
    .filter((s) => s.slug !== "archives" && !s.name.toLowerCase().includes("archive") && !isHiddenStage(s))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const getNextStageForItem = (item: CandidateListItem) => {
    const currentSlug = item.current_stage?.slug || item.stage_slug;
    const idx = nonArchiveStages.findIndex((s) => s.slug === currentSlug);
    if (idx === -1) return null;
    if (idx + 1 >= nonArchiveStages.length) return null;
    return nonArchiveStages[idx + 1];
  };

  const getPrimaryMoveLabel = (item: CandidateListItem) => {
    const currentSlug = (item.current_stage?.slug || item.stage_slug || "").toLowerCase();
    return currentSlug === "uncontacted" ? "Shortlist" : "Next Stage";
  };

  const handleCopyCandidateEmail = async (item: CandidateListItem) => {
    const email =
      item.candidate?.premium_data?.email ||
      item.candidate?.premium_data?.all_emails?.[0] ||
      "";
    if (!email) {
      showToast.error("Candidate email not available");
      return;
    }
    await navigator.clipboard.writeText(email);
    showToast.success("Email copied");
  };

  const openFeedbackModal = (action: {
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
  }) => {
    // Gather candidate names for display
    const names = action.applicationIds.map((id) => {
      if (id === draggedCandidateItemRef.current?.id) return draggedCandidateItemRef.current?.candidate?.full_name || "Unknown";
      if (selectedCandidatesMap[id]) return selectedCandidatesMap[id].candidate?.full_name || "Unknown";
      const cand = candidates.find((c) => c.id === id) || archivedCandidates.find((c: any) => c.id === id);
      return cand?.candidate?.full_name || "Unknown";
    });
    setPendingAction({ ...action, candidateNames: names });
    setFeedbackComment("");
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!pendingAction || !feedbackComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }

    const { type, applicationIds, targetStageId, targetStageName } = pendingAction;

    try {
      if (type === "archive") {
        const archiveStage = stages.find((s) => s.slug === "archives");
        if (!archiveStage) {
          showToast.error("Archives stage not found");
          return;
        }
        await Promise.all(
          applicationIds.map((id) =>
            apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: archiveStage.id,
              status: "ARCHIVED",
              archive_reason: feedbackComment.trim(),
              feedback: {
                subject: "Moved to Archive",
                comment: feedbackComment.trim(),
              },
            })
          )
        );
        showToast.success(`${applicationIds.length} candidate(s) archived`);
      } else if (type === "unarchive") {
        await Promise.all(
          applicationIds.map((id) => {
            const archivedItem = archivedCandidates.find((c: any) => c.id === id);
            const targetStage = archivedItem
              ? stages.find((s) => s.slug === archivedItem.stage_slug) ||
              stages.find((s) => s.slug === "shortlisted") ||
              stages[0]
              : stages.find((s) => s.slug === "shortlisted") || stages[0];

            if (!targetStage) return Promise.resolve();

            return apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: targetStage.id,
              status: "ACTIVE",
              feedback: {
                subject: "Unarchived",
                comment: feedbackComment.trim(),
              },
            });
          })
        );
        showToast.success(`${applicationIds.length} candidate(s) unarchived`);
      } else if (type === "move" && targetStageId) {
        await Promise.all(
          applicationIds.map((id) =>
            apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: targetStageId,
              feedback: {
                subject: `Moving to ${targetStageName || "next stage"}`,
                comment: feedbackComment.trim(),
              },
            })
          )
        );


        showToast.success(`${applicationIds.length} candidate(s) moved to ${targetStageName || "next stage"}`);
      }

      // Clear selection and refresh
      clearSelection();
      setShowFeedbackModal(false);
      setFeedbackComment("");
      setPendingAction(null);

      if (jobId != null) {
        if (!isKanbanView) {
          fetchCandidates(jobId, activeStageSlug, currentPage, searchQuery, pageSize);
        } else {
          const impactedSlugs = new Set([
            ...applicationIds.map(id => {
              if (id === draggedCandidateItemRef.current?.id) return draggedCandidateItemRef.current?.current_stage?.slug || draggedCandidateItemRef.current?.stage_slug;
              return selectedCandidatesMap[id]?.current_stage?.slug || selectedCandidatesMap[id]?.stage_slug || candidates.find(c => c.id === id)?.current_stage?.slug || candidates.find(c => c.id === id)?.stage_slug;
            }).filter(Boolean),
            targetStageId ? stages.find(s => s.id === targetStageId)?.slug : null,
            type === "archive" ? "archives" : null
          ].filter(Boolean) as string[]);
          triggerKanbanRefresh(Array.from(impactedSlugs));
        }
        fetchStages(jobId);
        fetchArchivedCandidates(jobId);
      }
    } catch (error: any) {
      console.error("Action error:", error);
      if (error.response?.status === 403) {
        showToast.error("You don't have permission to perform this action.");
      } else {
        showToast.error(`Failed to ${type} candidate(s)`);
      }
    }
  };

  // ── Pagination ───────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));
  const startIndex = (currentPage - 1) * pageSize;

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const handleDeleteStage = async () => {
    if (!jobId || !stageToDelete) return;
    try {
      await apiClient.delete(
        `/jobs/roles/${jobId}/custom-stages/${stageToDelete.id}/`
      );
      showToast.success("Stage deleted successfully");
      setStageToDelete(null);

      // Refresh pipeline
      const currentLimit = isKanbanView ? 1000 : pageSize;
      const currentStage = isKanbanView ? null : activeStageSlug;
      fetchCandidates(
        jobId,
        currentStage,
        currentPage,
        searchQuery,
        currentLimit
      );
      fetchStages(jobId);
      fetchArchivedCandidates(jobId);
    } catch (error: any) {
      console.error("Delete stage error:", error);
      showToast.error(
        error.response?.data?.detail || "Failed to delete stage"
      );
    }
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

  const totalPipelineCandidates = stages.reduce(
    (sum, s) => {
      if (s.slug === "archives") return sum;
      if (isHiddenStage(s)) return sum;
      return sum + (stageCounts[s.slug] !== undefined ? stageCounts[s.slug] : (s.candidate_count || 0));
    },
    0,
  );

  const renderCandidateCard = useCallback(
    (item: any, isArchived: boolean, list: any[], idx: number, stageSlug: string) => {
      const cand = item.candidate;
      const aiScoreRaw = item.job_score?.candidate_match_score?.score || "--%";
      const aiScoreNum = parseInt(aiScoreRaw.replace("%", ""), 10) || 0;
      const aiScoreColor = aiScoreNum >= 70 ? "#00C8B3" : aiScoreNum >= 40 ? "#FFCC00" : "#FF383C";

      const isDisabled =
        selectionType === (isArchived ? "ACTIVE" : "ARCHIVED") ||
        (selectionStage && selectionStage !== stageSlug);

      let headline = cand.headline || "--";
      let companyName = cand.experience_summary?.title || "--";

      return (
        <div
          key={item.id}
          draggable={!isArchived}
          onDragStart={(e) => !isArchived && handleDragStart(e, item)}
          className={`${isArchived ? "bg-[#F9FAFB] grayscale opacity-60" : "bg-white cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#0F47F2]/30"} border text-left border-[#E5E7EB] p-4 rounded-xl shadow-sm transition-all flex flex-col gap-3 relative ${isDisabled && !isArchived ? "opacity-60" : ""} ${isDisabled && isArchived ? "opacity-40" : ""}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="mt-1">
                <input
                  type="checkbox"
                  className={`w-5 h-5 rounded-md border-[#D1D1D6] cursor-pointer ${isArchived ? "accent-[#8E8E93]" : "accent-[#0F47F2]"}`}
                  checked={selectedIds.has(item.id)}
                  onChange={() => handleToggleCandidate(item)}
                  disabled={!!isDisabled}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4
                    className={`font-semibold text-[15px] line-clamp-1 cursor-pointer hover:underline decoration-1 underline-offset-2 ${isArchived ? "text-[#8E8E93]" : "text-[#1C1C1E]"}`}
                    onClick={() => onSelectCandidate?.(item, list, idx)}
                  >
                    {cand.full_name || "--"}
                  </h4>
                  {isAscendionWorkspace &&
                    stageSlug === "uncontacted" &&
                    (verifiedNonDuplicateIds.has(cand.id) || cand.is_ascendion_duplicate === false) && (
                      <div title="Not a duplicate in Ascendion portal">
                        <Check
                          className="w-4 h-4 text-green-600 shrink-0"
                        />
                      </div>
                    )}
                  {isArchived ? (
                    <MoreHorizontal className="w-4 h-4 text-[#AEAEB2]" />
                  ) : (
                    <div className={`relative ${menuOpenId === item.id ? "z-50" : ""}`} ref={menuOpenId === item.id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (menuOpenId === item.id) { setMenuOpenId(null); return; }
                          const rect = e.currentTarget.getBoundingClientRect();
                          const mW = 192, mH = 260, gap = 8;
                          const openUp = rect.bottom + mH + gap > window.innerHeight;
                          const preferredTop = openUp ? rect.top - mH - gap : rect.bottom + gap;
                          const top = Math.min(Math.max(8, preferredTop), Math.max(8, window.innerHeight - mH - 8));
                          let left = rect.right - mW;
                          if (left < 8) left = 8;
                          if (left + mW > window.innerWidth - 8) left = window.innerWidth - mW - 8;
                          setMenuPos({ top, left });
                          setMenuOpenId(item.id);
                        }}
                        className="p-0.5 hover:bg-gray-100 rounded-md transition-colors"
                        title="Options"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#AEAEB2]" />
                      </button>
                      {menuOpenId === item.id && (
                        <div
                          className="fixed w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[10000] py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                          style={{ top: menuPos.top, left: menuPos.left }}
                        >
                          <button onClick={(e) => { e.stopPropagation(); setCallModalCandidate({ id: cand.id, name: cand.full_name || "Unknown", avatarInitials: cand.full_name ? cand.full_name.substring(0, 2).toUpperCase() : "UN", headline: cand.headline || "--", phone: cand.premium_data?.phone || cand.premium_data?.all_phone_numbers?.[0] || "+91 98765 43210", experience: cand.total_experience != null ? `${cand.total_experience} Yrs` : (cand.experience_years?.replace(/\s*exp$/i, "") || "0"),currentCtc: cand.current_ctc || "--", expectedCtc: cand.expected_ctc || "--", location: cand.location || "--", noticePeriod: cand.notice_period_summary || "--", callAttention: item.job_score?.call_attention || [], resumeUrl: cand.premium_data?.resume_url || "" }); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Call Candidate</button>
                          <button onClick={(e) => { e.stopPropagation(); setCandidateEditing(item); setShowCandidateEditModal(true); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Edit Details</button>
                          <button onClick={async (e) => { e.stopPropagation(); await handleCopyCandidateEmail(item); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Copy Mail ID</button>
                          {isAscendionWorkspace && stageSlug === "uncontacted" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                runAscendionDuplicateCheck(cand.id);
                                setMenuOpenId(null);
                              }}
                              disabled={
                                verifiedNonDuplicateIds.has(cand.id) ||
                                ascendionCheckingIds.has(cand.id)
                              }
                              className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] disabled:hover:bg-white disabled:opacity-50 flex items-center gap-2"
                              title={
                                verifiedNonDuplicateIds.has(cand.id)
                                  ? "Already verified as not duplicate"
                                  : "Check Ascendion portal duplicate"
                              }
                            >
                              {ascendionCheckingIds.has(cand.id)
                                ? "Checking..."
                                : "Check dup"}
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); const ns = getNextStageForItem(item); if (!ns) { showToast.info("No next stage available"); return; } openFeedbackModal({ type: "move", applicationIds: [item.id], targetStageId: ns.id, targetStageName: ns.name }); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2">{getPrimaryMoveLabel(item)}</button>
                          <button onClick={(e) => { e.stopPropagation(); setShiftStageItem(item); setShiftStageTargetId(null); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2">Shift to Stage</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/candidate-profiles/${cand.id}?job_id=${jobId}`, { state: { shareOption: "full_profile", resumeUrl: cand.premium_data?.resume_url || cand.resume_url || "" } }); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Share Profile</button>
                          <button onClick={(e) => { e.stopPropagation(); openFeedbackModal({ type: "archive", applicationIds: [item.id] }); setMenuOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-2"> Move to Archive</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[13px] text-[#8E8E93] line-clamp-1 mt-0.5">{headline}</p>
                {!isArchived && (
                  <>
                    <p className="text-[13px] font-medium text-[#4B5563] line-clamp-1">{companyName}</p>
                    {(() => {
                      const attentionTag = item.status_tags?.find((t: any) => t.text);
                      const pill = getAttentionPill(item, attentionTag);
                      if (!pill) return null;
                      const bgColor = pill.color === "red" ? "#FEE9E7" : pill.color === "blue" ? "#EDE9FE" : "#D1FAE5";
                      const textColor = pill.color === "red" ? "#FF383C" : pill.color === "blue" ? "#6366F1" : "#059669";
                      return (
                        <div className="mt-1">
                          <span
                            className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full truncate max-w-full"
                            style={{ backgroundColor: bgColor, color: textColor }}
                            title={pill.text}
                          >
                            {pill.text}
                          </span>
                        </div>
                      );
                    })()}
                  </>
                )}
                {isArchived && item.archive_reason && (
                  <div className="bg-[#FEF2F2] px-2 py-1 rounded text-[10px] text-[#DC2626] font-medium mt-1 inline-flex items-center gap-1.5 w-fit max-w-[200px]">
                    <Archive className="w-3 h-3 shrink-0" />
                    <span className="truncate" title={item.archive_reason}>
                      {item.archive_reason}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isArchived ? (
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F2F2F7" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={aiScoreColor} strokeWidth="3" strokeDasharray={`${aiScoreNum}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#4B5563]">
                  {aiScoreRaw === "--%" ? "0%" : aiScoreRaw}
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                --
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-auto">
            {!isArchived && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9]">
                  {cand.total_experience != null
                    ? `${cand.total_experience} yrs`
                    : cand.experience_years
                      ? cand.experience_years.replace(/\s*exp$/i, "")
                      : "--"}
                </span>
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7C3AED]"
                  title={cand.last_working_day ? `Last Working Day: ${formatDate(cand.last_working_day)}` : ""}
                >
                  {cand.notice_period_summary || "--"}
                  {cand.last_working_day && (
                    <span className="ml-1 opacity-80 text-[10px] font-normal italic">
                      ({formatDate(cand.last_working_day)})
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#FFE4E6] text-[#E11D48]">
                  {cand.expected_ctc ? `${cand.expected_ctc} LPA` : "--"}
                </span>
              </div>
            )}
            <div className={`flex items-center gap-1.5 shrink-0 ${isArchived ? "w-full justify-end" : ""}`}>
              {isArchived && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F3F5F7] rounded-full">
                  <Clock className="w-3.5 h-3.5 text-[#AEAEB2]" />
                  <span className="text-[11px] font-bold text-[#8E8E93]">
                    {formatMovedDate(item.status_tags)}
                  </span>
                </div>
              )}
              {!isArchived && (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#AEAEB2]" />
                  <span className="text-[11px] font-bold text-[#8E8E93]">
                    {formatMovedDate(item.status_tags)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      );
    },
    [
      selectionType,
      selectionStage,
      selectedIds,
      handleToggleCandidate,
      menuOpenId,
      menuPos,
      setMenuOpenId,
      setMenuPos,
      setCallModalCandidate,
      setCandidateEditing,
      setShowCandidateEditModal,
      isAscendionWorkspace,
      verifiedNonDuplicateIds,
      ascendionCheckingIds,
      runAscendionDuplicateCheck,
      handleCopyCandidateEmail,
      getNextStageForItem,
      showToast,
      openFeedbackModal,
      getPrimaryMoveLabel,
      setShiftStageItem,
      setShiftStageTargetId,
      navigate,
      jobId,
      onSelectCandidate,
    ]
  );

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
                  <div
                    className={`flex items-center gap-1.5 ${sc.bg} ${sc.text} text-xs font-medium px-3 py-0.5 rounded-full`}
                  >
                    <div className={`w-2 h-2 ${sc.dot} rounded-full`} />
                    {statusLabel(jobDetails.status)}
                  </div>
                )}
              </div>
              <div className="text-sm text-[#8E8E93] mt-0.5 flex items-center gap-3 flex-wrap">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:text-[#4B5563] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${jobDetails?.title}, ${jobDetails?.location} (Job ID: ${jobDetails?.id})`).then(() => showToast.success("Job ID copied"));
                  }}
                >
                  <Copy className="w-3.5 h-3.5 text-[#4674E5] shrink-0" />
                  JD-{jobDetails?.job_id || jobDetails?.id}
                </div>
                {jobDetails?.posted_by && (
                  <>
                    <span className="text-[#D1D1D6]">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#8E8E93] text-xs font-medium">Created By:</span>
                      <span className="text-[#4B5563] text-xs">{jobDetails.posted_by}</span>
                    </div>
                  </>
                )}
                {jobDetails?.poc_email && (
                  <>
                    <span className="text-[#D1D1D6]">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[#8E8E93] text-xs font-medium">POC:</span>
                      <span className="text-[#4B5563] text-xs">{jobDetails.poc_email}</span>
                    </div>
                  </>
                )}
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
              {isMetadataExpanded ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.33301 14.6667L5.99967 10M5.99967 10H2.09491M5.99967 10V13.9047" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M14.6667 1.3335L10 6.00016M10 6.00016H13.9047M10 6.00016V2.0954" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9.99984L1.33333 14.6665M1.33333 14.6665H5.23809M1.33333 14.6665L1.33333 10.7618" stroke="#6B7280" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M10.0013 6L14.668 1.33333M14.668 1.33333L10.7632 1.33333M14.668 1.33333V5.23809" stroke="#6B7280" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              )}
            </button>

            {/* View JD */}
            <button
              onClick={() => jobId && handleRequisitionInfo(jobId)}
              className="flex items-center gap-2 px-4 py-2 border border-[#D1D1D6] rounded-lg text-sm text-[#757575] hover:bg-[#F9FAFB] transition-colors"
            >
              View JD <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.91068 8.92265C1.41489 8.27854 1.16699 7.95648 1.16699 7.00016C1.16699 6.04385 1.41489 5.7218 1.91068 5.07769C2.90064 3.79157 4.56089 2.3335 7.00033 2.3335C9.43977 2.3335 11.1 3.79157 12.09 5.07769C12.5857 5.7218 12.8337 6.04385 12.8337 7.00016C12.8337 7.95648 12.5857 8.27854 12.09 8.92265C11.1 10.2087 9.43977 11.6668 7.00033 11.6668C4.56089 11.6668 2.90064 10.2087 1.91068 8.92265Z" stroke="#0F47F2" />
                <path d="M8.75 7C8.75 7.96652 7.96652 8.75 7 8.75C6.03347 8.75 5.25 7.96652 5.25 7C5.25 6.03347 6.03347 5.25 7 5.25C7.96652 5.25 8.75 6.03347 8.75 7Z" stroke="#0F47F2" />
              </svg>

            </button>

            {/* Edit */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#0F47F2] bg-[#E7EDFF] text-[#0F47F2] rounded-lg text-sm font-medium hover:bg-[#DDE6FF] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.8396 2.39982L3.36624 8.19317C3.15958 8.41317 2.95958 8.84651 2.91958 9.14651L2.67291 11.3065C2.58624 12.0865 3.14624 12.6198 3.91958 12.4865L6.06624 12.1198C6.36624 12.0665 6.78626 11.8465 6.99293 11.6198L12.4663 5.82649C13.4129 4.82649 13.8396 3.68649 12.3663 2.29315C10.8996 0.913152 9.78626 1.39982 8.8396 2.39982Z" stroke="#0F47F2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7.92676 3.3667C8.21342 5.2067 9.70676 6.61337 11.5601 6.8" stroke="#0F47F2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 14.6665H14" stroke="#0F47F2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Edit
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
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Year of Experience
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.experience_min_years || "--"} -{" "}
                    {jobDetails.experience_max_years || "--"} years
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Location
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.location?.join(", ") || "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Salary - CTC
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {formatSalary(jobDetails.salary_min, jobDetails.salary_max)}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Work Approach
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {workApproachLabel[jobDetails.work_approach] || "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    No of Position
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.num_positions || "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Education Qualifications
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.seniority || "--"}
                  </div>
                </div>

                {/* Second row */}
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Open Date
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {formatDate(jobDetails.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Last Active Date
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {formatDate(jobDetails.updated_at)}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Shortlisted
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">
                    {jobDetails.shortlisted_candidate_count ?? "--"}
                  </div>
                </div>
                <div>
                  <div className="text-[#8E8E93] text-xs font-medium">
                    Hired
                  </div>
                  <div className="font-medium text-[#4B5563] mt-1">--</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[#8E8E93] text-xs font-medium mb-1.5">
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDetails.skills && jobDetails.skills.length > 0 ? (
                      <>
                        {(showAllSkills
                          ? jobDetails.skills
                          : jobDetails.skills.slice(0, 4)
                        ).map((s) => (
                          <span
                            key={s}
                            className="bg-[#F2F2F7] text-[#4B5563] text-[10px] px-2.5 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}

                        {jobDetails.skills.length > 4 && (
                          <button
                            onClick={() => setShowAllSkills(!showAllSkills)}
                            className="text-[10px] text-blue-500 ml-1"
                          >
                            {showAllSkills
                              ? "Show less"
                              : `+${jobDetails.skills.length - 4} more`}
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[#8E8E93] text-xs">--</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-[#8E8E93] py-4">
                Failed to load job details
              </div>
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
            {
              key: "pipeline" as const,
              label: "Pipeline",
              count: jobDetails?.pipeline_candidate_count ?? 0,
            },
            {
              key: "naukbot" as const,
              label: "Naukbot",
              count: jobDetails?.naukri_bot_candidates_count ?? 0,
            },
            {
              key: "inbound" as const,
              label: "Inbound",
              count: jobDetails?.inbound_candidates_count ?? 0,
            },
            {
              key: "linkedinbot" as const,
              label: "LinkedIn Bot",
              count: linkedinBotFilteredCount ?? jobDetails?.linkedin_bot_candidates_count ?? 0,
            },
            // {
            //   key: "nxthyre" as const,
            //   label: "Nxthyre",
            //   count: jobDetails?.candidates_count ?? 0,
            // },
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
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded ${activeTab === tab.key ? "bg-[#E7EDFF] text-[#0F47F2]" : "text-[#AEAEB2]"}`}
              >
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
          {isKanbanView ? (
            /* ═══════════ KANBAN VIEW TOOLBAR ═══════════ */
            <div className="mx-8 mt-4 flex items-center justify-between bg-white p-4 rounded-t-2xl border border-b-0 border-[#E5E7EB]">
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
              <div className="flex items-center gap-2">
                {/* Share Pipeline */}
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/public/workspaces/${workspaceId}/applications`;
                    window.open(url, "_blank");
                  }}
                  className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#AEAEB2] hover:bg-[#E7EDFF] hover:text-[#0F47F2] hover:border-[#0F47F2] transition-colors"
                  title="Share Pipeline"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_360_5904)">
                      <path d="M14.6663 9.3321C14.6471 11.6081 14.5207 12.8628 13.6933 13.6903C12.7167 14.6668 11.1449 14.6668 8.00141 14.6668C4.85789 14.6668 3.28614 14.6668 2.30957 13.6903C1.33301 12.7137 1.33301 11.142 1.33301 7.99843C1.33301 4.85491 1.33301 3.28315 2.30957 2.30658C3.137 1.47915 4.39172 1.3528 6.66774 1.3335" stroke="currentColor" strokeLinecap="round" />
                      <path d="M14.6667 4.66683H9.33333C8.1216 4.66683 7.39113 5.26151 7.12027 5.53369C7.0364 5.61798 6.99447 5.66014 6.99387 5.66071C6.99333 5.66128 6.95113 5.70322 6.86687 5.78711C6.59468 6.05797 6 6.78843 6 8.00016V10.0002M14.6667 4.66683L11.3333 1.3335M14.6667 4.66683L11.3333 8.00016" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                      <clipPath id="clip0_360_5904">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                {/* Export CSV */}
                <button
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      showToast.error("Please select at least one candidate to export");
                      return;
                    }
                    setShowExportDialog(true);
                  }}
                  className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#AEAEB2] hover:bg-[#F3F5F7] transition-colors"
                  title="Export CSV"
                >
                  <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.8184 4.50737C10.8234 4.50735 10.8283 4.50734 10.8333 4.50734C12.4902 4.50734 13.8333 5.85295 13.8333 7.51284C13.8333 9.05986 12.6666 10.3339 11.1667 10.5M10.8184 4.50737C10.8283 4.39737 10.8333 4.28597 10.8333 4.17339C10.8333 2.14463 9.19171 0.5 7.16667 0.5C5.24883 0.5 3.67488 1.97511 3.51362 3.85461M10.8184 4.50737C10.7502 5.26506 10.4524 5.9564 9.99522 6.51101M3.51362 3.85461C1.82265 4.01582 0.5 5.44261 0.5 7.1789C0.5 8.79449 1.64517 10.1421 3.16667 10.4515M3.51362 3.85461C3.61884 3.84458 3.72549 3.83945 3.83333 3.83945C4.58388 3.83945 5.2765 4.08796 5.83366 4.50734" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7.16667 7.1665L7.16667 12.4998M7.16667 7.1665C6.69985 7.1665 5.82769 8.49604 5.5 8.83317M7.16667 7.1665C7.63348 7.1665 8.50565 8.49604 8.83333 8.83317" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Calendar / Date */}
                <button
                  className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#AEAEB2] hover:bg-[#F3F5F7] transition-colors"
                  title={new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  disabled
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.66667 11.3337L6.66666 8.89847C6.66666 8.77063 6.5755 8.66699 6.46305 8.66699H6M9.08644 11.3337L9.98945 8.89977C10.0317 8.78596 9.94189 8.66699 9.81379 8.66699H8.66667" stroke="currentColor" strokeLinecap="round" />
                    <path d="M1.66699 8.16216C1.66699 5.25729 1.66699 3.80486 2.50174 2.90243C3.33648 2 4.67999 2 7.36699 2H8.63366C11.3207 2 12.6642 2 13.4989 2.90243C14.3337 3.80486 14.3337 5.25729 14.3337 8.16216V8.5045C14.3337 11.4094 14.3337 12.8618 13.4989 13.7642C12.6642 14.6667 11.3207 14.6667 8.63366 14.6667H7.36699C4.67999 14.6667 3.33648 14.6667 2.50174 13.7642C1.66699 12.8618 1.66699 11.4094 1.66699 8.5045V8.16216Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 5.3335H12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* Table View toggle */}
                <button
                  onClick={() => {
                    setActiveStageSlug(null);
                    setIsKanbanView(false);
                  }}
                  className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#AEAEB2] hover:text-[#414141] transition-colors"
                  title="Table View"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33398 8.3335V5.00016C3.33398 4.07969 4.08018 3.3335 5.00065 3.3335H15.0007C15.9212 3.3335 16.6673 4.07969 16.6673 5.00016V8.3335M3.33398 8.3335V12.5002M3.33398 8.3335H7.50065M16.6673 8.3335V12.5002M16.6673 8.3335H12.5007M3.33398 12.5002V15.0002C3.33398 15.9207 4.08018 16.6668 5.00065 16.6668H7.50065M3.33398 12.5002H7.50065M7.50065 8.3335V12.5002M7.50065 8.3335H12.5007M16.6673 12.5002V15.0002C16.6673 15.9207 15.9212 16.6668 15.0007 16.6668H12.5007M16.6673 12.5002H12.5007M12.5007 8.3335V12.5002M7.50065 16.6668V12.5002M7.50065 16.6668H12.5007M7.50065 12.5002H12.5007M12.5007 16.6668V12.5002M8.33398 5.8335H11.6673" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {/* + Add Stage */}
                <button
                  onClick={() => setShowAddStageForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0F47F2] text-white rounded-lg hover:bg-[#0D3ECF] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stage
                </button>
              </div>
            </div>
          ) : (
            /* ═══════════ TABLE VIEW TOOLBAR ═══════════ */
            <>
              {/* Stage pills row */}
              <div className="mx-8 mt-4 flex items-center gap-3 bg-white p-4 rounded-t-2xl border border-b-0 border-[#E5E7EB]">
                {/* Stage pills — horizontally scrollable, shrinks to give room to the action buttons */}
                <div className="flex-1 min-w-0 overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 flex-nowrap">
                    <button
                      onClick={() => setActiveStageSlug(null)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeStageSlug === null
                        ? "bg-[#0F47F2] text-white"
                        : "text-[#AEAEB2] bg-white hover:bg-[#F3F5F7] border border-[#D1D1D6]"
                        }`}
                    >
                      All ({totalPipelineCandidates})
                    </button>

                    {loadingStages
                      ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 w-28 h-8 bg-gray-200 rounded-full animate-pulse"
                        />
                      ))
                      : stages.filter(s => s.slug !== 'archives' && !isHiddenStage(s)).map((stage) => (
                        <button
                          key={stage.id}
                          onClick={() => setActiveStageSlug(stage.slug)}
                          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeStageSlug === stage.slug
                            ? "bg-[#0F47F2] text-white"
                            : "text-[#AEAEB2] bg-white hover:bg-[#F3F5F7] border border-[#D1D1D6]"
                            }`}
                        >
                          {stage.name} ({stageCounts[stage.slug] !== undefined ? stageCounts[stage.slug] : stage.candidate_count})
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">

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

                  <div className="relative">
                    <button
                      ref={pipelineFilterButtonRef}
                      title="Filters"
                      onClick={() => setShowPipelineFilterPanel(!showPipelineFilterPanel)}
                      className={`flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium transition-colors ${showPipelineFilterPanel ? "text-[#AEAEB2] border-[#0F47F2]" : "text-[#AEAEB2] hover:bg-[#F3F5F7]"}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.33301 6H10.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.33301 14H10.6663" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <PipelineFilterPanel
                      isOpen={showPipelineFilterPanel}
                      onClose={() => setShowPipelineFilterPanel(false)}
                      onApply={(filters) => setPipelineFilters(filters)}
                      initialFilters={pipelineFilters}
                      anchorRef={pipelineFilterButtonRef}
                      jobId={jobId}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/public/workspaces/${workspaceId}/applications`;
                      window.open(url, "_blank");
                    }}
                    title="Share Pipeline"
                    className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#E7EDFF] hover:text-[#0F47F2] hover:border-[#0F47F2] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_360_5904_tbl)">
                        <path d="M14.6663 9.3321C14.6471 11.6081 14.5207 12.8628 13.6933 13.6903C12.7167 14.6668 11.1449 14.6668 8.00141 14.6668C4.85789 14.6668 3.28614 14.6668 2.30957 13.6903C1.33301 12.7137 1.33301 11.142 1.33301 7.99843C1.33301 4.85491 1.33301 3.28315 2.30957 2.30658C3.137 1.47915 4.39172 1.3528 6.66774 1.3335" stroke="#374151" strokeLinecap="round" />
                        <path d="M14.6667 4.66683H9.33333C8.1216 4.66683 7.39113 5.26151 7.12027 5.53369C7.0364 5.61798 6.99447 5.66014 6.99387 5.66071C6.99333 5.66128 6.95113 5.70322 6.86687 5.78711C6.59468 6.05797 6 6.78843 6 8.00016V10.0002M14.6667 4.66683L11.3333 1.3335M14.6667 4.66683L11.3333 8.00016" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_360_5904_tbl">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedIds.size === 0) {
                        showToast.error("Please select at least one candidate to export");
                        return;
                      }
                      setShowExportDialog(true);
                    }}
                    title="Export CSV"
                    className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                  >
                    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.8184 4.50737C10.8234 4.50735 10.8283 4.50734 10.8333 4.50734C12.4902 4.50734 13.8333 5.85295 13.8333 7.51284C13.8333 9.05986 12.6666 10.3339 11.1667 10.5M10.8184 4.50737C10.8283 4.39737 10.8333 4.28597 10.8333 4.17339C10.8333 2.14463 9.19171 0.5 7.16667 0.5C5.24883 0.5 3.67488 1.97511 3.51362 3.85461M10.8184 4.50737C10.7502 5.26506 10.4524 5.9564 9.99522 6.51101M3.51362 3.85461C1.82265 4.01582 0.5 5.44261 0.5 7.1789C0.5 8.79449 1.64517 10.1421 3.16667 10.4515M3.51362 3.85461C3.61884 3.84458 3.72549 3.83945 3.83333 3.83945C4.58388 3.83945 5.2765 4.08796 5.83366 4.50734" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.16667 7.1665L7.16667 12.4998M7.16667 7.1665C6.69985 7.1665 5.82769 8.49604 5.5 8.83317M7.16667 7.1665C7.63348 7.1665 8.50565 8.49604 8.83333 8.83317" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <DateRangeFilter
                    valueLabel={dateRangeFilterLabel}
                    isFilterApplied={isDateRangeFilterApplied}
                    onApply={(payload) => {
                      setDateRangeFilterLabel(payload.label);
                      setIsDateRangeFilterApplied(true);
                      setDateRange({ from: payload.createdAfter || "", to: payload.createdBefore || "" });
                    }}
                    onClear={() => {
                      setDateRangeFilterLabel("Date Filter");
                      setIsDateRangeFilterApplied(false);
                      setDateRange({ from: "", to: "" });
                    }}
                  />

                  <button
                    onClick={() => {
                      setIsKanbanView(true);
                    }}
                    className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#414141] transition-colors px-3 py-2 rounded-lg border border-[#D1D1D6] text-xs"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_360_5915)">
                        <path d="M5.99967 14.6668H9.99967C13.333 14.6668 14.6663 13.3335 14.6663 10.0002V6.00016C14.6663 2.66683 13.333 1.3335 9.99967 1.3335H5.99967C2.66634 1.3335 1.33301 2.66683 1.33301 6.00016V10.0002C1.33301 13.3335 2.66634 14.6668 5.99967 14.6668Z" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 1.3335V14.6668" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.33301 6.3335H7.99967" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 9.66699H14.6667" stroke="#374151" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_360_5915">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowAddStageForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#E7EDFF] text-[#0F47F2] rounded-lg hover:bg-[#D5E1FF] transition-colors border border-transparent mr-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Stage
                  </button>


                </div>
              </div>



            </>
          )}

          {/* ═══════════════════════════════════════════════════════
          Bulk Action Bar
         ═══════════════════════════════════════════════════════ */}
          {selectedIds.size > 0 && (
            <div className="mx-8 bg-blue-50/50 border-x border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
              <div className="text-sm font-medium text-[#0F47F2]">
                {selectedIds.size} Candidate{selectedIds.size !== 1 ? "s" : ""}{" "}
                Selected
              </div>
              <div className="flex items-center gap-3 text-sm">
                {/* Hide Move/Archive in kanban – those are in the stage footer */}
                {!isKanbanView && (
                  <>
                    <button
                      onClick={() => {
                        let nextStageId: number | undefined;
                        let nextStageName: string | undefined;
                        if (activeStageSlug) {
                          const currentIdx = stages.findIndex(
                            (s) => s.slug === activeStageSlug,
                          );
                          if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
                            const nextStage = stages[currentIdx + 1];
                            if (nextStage.slug !== "archives") {
                              nextStageId = nextStage.id;
                              nextStageName = nextStage.name;
                            } else if (currentIdx + 2 < stages.length) {
                              nextStageId = stages[currentIdx + 2].id;
                              nextStageName = stages[currentIdx + 2].name;
                            }
                          }
                        } else {
                          const firstCandId = Array.from(selectedIds)[0];
                          const firstCand = candidates.find(
                            (c) => c.id === firstCandId,
                          );
                          const currentSlug =
                            firstCand?.current_stage?.slug || firstCand?.stage_slug;
                          const currentIdx = stages.findIndex(
                            (s) => s.slug === currentSlug,
                          );
                          if (currentIdx !== -1 && currentIdx + 1 < stages.length) {
                            const nextStage = stages[currentIdx + 1];
                            if (nextStage.slug !== "archives") {
                              nextStageId = nextStage.id;
                              nextStageName = nextStage.name;
                            } else if (currentIdx + 2 < stages.length) {
                              nextStageId = stages[currentIdx + 2].id;
                              nextStageName = stages[currentIdx + 2].name;
                            }
                          }
                        }

                        if (nextStageId) {
                          openFeedbackModal({
                            type: "move",
                            applicationIds: Array.from(selectedIds),
                            targetStageId: nextStageId,
                            targetStageName: nextStageName,
                          });
                        } else {
                          showToast.error("No next stage available");
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#4B5563] border border-[#D1D1D6] rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Move to Next Stage
                    </button>

                    <button
                      onClick={() =>
                        openFeedbackModal({
                          type: "archive",
                          applicationIds: Array.from(selectedIds),
                        })
                      }
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium"
                    >
                      <Archive className="w-4 h-4" /> Archive Candidates
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#4B5563] border border-[#D1D1D6] rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>

                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-[#4B5563] border border-[#D1D1D6] rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
          Content View (Table or Kanban)
         ═══════════════════════════════════════════════════════ */}
          {isKanbanView ? (
            <div className="mx-8 bg-[#F3F5F7] border border-[#E5E7EB] rounded-b-2xl overflow-x-auto p-6 flex gap-6 h-[75vh] items-stretch">
              {stages.filter(s => s.slug !== 'archives' && !isHiddenStage(s)).map((stage) => {
                return (
                  <div key={stage.id} className="relative h-full">
                    <PipelineKanbanColumn
                      jobId={jobId}
                      stage={stage}
                      filters={pipelineFilters}
                      dateRange={dateRange}
                      searchQuery={searchQuery}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      stageBarColor={stageBarColors[stages.filter(s => s.slug !== 'archives' && !isHiddenStage(s)).indexOf(stage) % stageBarColors.length]}
                      stageMenuOpenId={stageMenuOpenId}
                      setStageMenuOpenId={setStageMenuOpenId}
                      onEditStage={setStageToEdit}
                      onDeleteStage={setStageToDelete}
                      renderCandidateCard={renderCandidateCard}
                      visibleArchives={visibleArchives}
                      setVisibleArchives={setVisibleArchives}
                      setStageMenuPos={setStageMenuPos}
                      stageMenuPos={stageMenuPos}
                      stageCountOverride={stageCounts[stage.slug]}
                      refreshCounter={kanbanRefreshCounters[stage.slug]}
                      sortConfig={sortConfig}
                    />

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
                                  const currentIdx = stages.findIndex(
                                    (s) => s.slug === stage.slug,
                                  );
                                  if (
                                    currentIdx !== -1 &&
                                    currentIdx + 1 < stages.length
                                  ) {
                                    const nextStage = stages[currentIdx + 1];
                                    openFeedbackModal({
                                      type: "move",
                                      applicationIds: Array.from(selectedIds),
                                      targetStageId: nextStage.id,
                                      targetStageName: nextStage.name,
                                    });
                                  } else {
                                    showToast.error("No next stage available");
                                  }
                                }}
                                className="w-full py-2 bg-[#0F47F2] text-white text-xs font-bold rounded-lg hover:bg-[#0A3BCC] transition-colors"
                              >
                                Move to Next Round
                              </button>
                              <button
                                onClick={() =>
                                  openFeedbackModal({
                                    type: "archive",
                                    applicationIds: Array.from(selectedIds),
                                  })
                                }
                                className="w-full py-2 bg-white text-red-600 border border-red-100 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Archive Candidates
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                openFeedbackModal({
                                  type: "unarchive",
                                  applicationIds: Array.from(selectedIds),
                                })
                              }
                              className="w-full py-2 bg-[#E7E5FF] text-[#6155F5] text-xs font-bold rounded-lg hover:bg-[#D5D2FF] transition-colors"
                            >
                              Unarchive Candidates
                            </button>
                          )}
                          <button
                            onClick={clearSelection}
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
              <div
                className="min-w-[320px] w-[320px] bg-[#F5F9FB] rounded-xl flex flex-col items-center justify-center relative border border-[#E5E7EB] border-dashed hover:bg-black/5 transition-colors cursor-pointer"
                onClick={() => setShowAddStageForm(true)}
              >
                <div className="flex flex-col items-center gap-4 z-10 p-6 opacity-60">
                  <div className="w-[62px] h-[62px]">
                    <svg
                      width="62"
                      height="62"
                      viewBox="0 0 62 62"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M32.9375 23.25C32.9375 22.18 32.07 21.3125 31 21.3125C29.93 21.3125 29.0625 22.18 29.0625 23.25V29.0625H23.25C22.18 29.0625 21.3125 29.93 21.3125 31C21.3125 32.07 22.18 32.9375 23.25 32.9375H29.0625V38.75C29.0625 39.82 29.93 40.6875 31 40.6875C32.07 40.6875 32.9375 39.82 32.9375 38.75V32.9375H38.75C39.82 32.9375 40.6875 32.07 40.6875 31C40.6875 29.93 39.82 29.0625 38.75 29.0625H32.9375V23.25Z"
                        fill="#818283"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M31.1496 3.23047H30.853C24.8898 3.23044 20.2164 3.23042 16.5701 3.72066C12.8378 4.22244 9.89276 5.26957 7.58116 7.58116C5.26957 9.89276 4.22244 12.8378 3.72066 16.5701C3.23042 20.2164 3.23044 24.8897 3.23047 30.853V31.1496C3.23044 37.1129 3.23042 41.7862 3.72066 45.4326C4.22244 49.1647 5.26957 52.11 7.58116 54.4215C9.89276 56.7331 12.8378 57.7801 16.5701 58.2821C20.2164 58.7721 24.8897 58.7721 30.853 58.7721H31.1496C37.1129 58.7721 41.7862 58.7721 45.4326 58.2821C49.1647 57.7801 52.11 56.7331 54.4215 54.4215C56.7331 52.11 57.7801 49.1647 58.2821 45.4326C58.7721 41.7862 58.7721 37.1129 58.7721 31.1496V30.853C58.7721 24.8897 58.7721 20.2164 58.2821 16.5701C57.7801 12.8378 56.7331 9.89276 54.4215 7.58116C52.11 5.26957 49.1647 4.22244 45.4326 3.72066C41.7862 3.23042 37.1129 3.23044 31.1496 3.23047ZM10.3212 10.3212C11.7928 8.84958 13.7838 8.00511 17.0864 7.56109C20.4447 7.10958 24.8575 7.10547 31.0013 7.10547C37.145 7.10547 41.5578 7.10958 44.9162 7.56109C48.2187 8.00511 50.2097 8.84958 51.6814 10.3212C53.1531 11.7928 53.9976 13.7838 54.4414 17.0864C54.893 20.4447 54.8971 24.8575 54.8971 31.0013C54.8971 37.145 54.893 41.5578 54.4414 44.9162C53.9976 48.2187 53.1531 50.2097 51.6814 51.6814C50.2097 53.1531 48.2187 53.9976 44.9162 54.4414C41.5578 54.893 37.145 54.8971 31.0013 54.8971C24.8575 54.8971 20.4447 54.893 17.0864 54.4414C13.7838 53.9976 11.7928 53.1531 10.3212 51.6814C8.84958 50.2097 8.00511 48.2187 7.56109 44.9162C7.10958 41.5578 7.10547 37.145 7.10547 31.0013C7.10547 24.8575 7.10958 20.4447 7.56109 17.0864C8.00511 13.7838 8.84958 11.7928 10.3212 10.3212Z"
                        fill="#818283"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-xl leading-6 text-[#818283]">
                    Add Custom Stage
                  </h3>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible mx-8 bg-white border border-[#E5E7EB] rounded-b-2xl">
              <table className="w-full min-w-[1480px] table-fixed text-left border-collapse">
                {/* width of columns according to the space needed so it looks good using col group make sure total sum of width is 100%*/}
                <colgroup>
                  <col style={{ width: "2%" }} /> {/* checkbox */}
                  <col style={{ width: "25%" }} /> {/* name & headline */}
                  <col style={{ width: "7%" }} /> {/* ai score */}
                  <col style={{ width: "11%" }} /> {/* location */}
                  <col style={{ width: "5%" }} /> {/* exp */}
                  <col style={{ width: "6%" }} /> {/* ctc */}
                  <col style={{ width: "8%" }} /> {/* expected ctc */}
                  <col style={{ width: "8%" }} /> {/* notice period */}
                  <col style={{ width: "8%" }} /> {/* stage */}
                  <col style={{ width: "8%" }} /> {/* attention */}
                  <col style={{ width: "12%" }} /> {/* actions */}
                </colgroup>

                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="w-10 px-4 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#0F47F2]"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {[
                      "Name",
                      "AI Score",
                      "Location",
                      "Exp",
                      "CTC",
                      "Expected CTC",
                      "Notice Period",
                      "Stage",
                      "Attention",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[11px] font-semibold uppercase text-[#374151] tracking-wider cursor-pointer group hover:text-[#4B5563] transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort(h as CandidateSortKey)}
                      >
                        <div className="flex items-center">
                          {h} <SortIcon columnKey={h as CandidateSortKey} />
                        </div>
                      </th>
                    ))}
                    <th className="sticky right-0 z-20 bg-[#F9FAFB] shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.22)] px-4 py-3 text-[11px] font-semibold uppercase text-[#374151] tracking-wider text-right select-none whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F5F7]">
                  {loadingCandidates ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="px-4 py-5">
                          <div className="w-4 h-4 bg-gray-200 rounded" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32" />
                            <div className="h-3 bg-gray-200 rounded w-40" />
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="w-9 h-9 bg-gray-200 rounded-full" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-20" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-20" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-16" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-4 bg-gray-200 rounded w-24" />
                        </td>
                        <td className="px-4 py-5">
                          <div className="h-5 bg-gray-200 rounded-full w-16" />
                        </td>
                        <td className="sticky right-0 z-10 bg-white px-4 py-5 shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.18)]">
                          <div className="flex gap-2 justify-end">
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : sortedCandidates.length === 0 &&
                    filteredArchivedTable.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-6 py-12 text-center text-sm text-[#AEAEB2]"
                      >
                        No candidates found
                        {activeStageSlug ? " in this stage" : ""}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Active Candidates */}
                      {sortedCandidates.map((item, index) => {
                        const cand = item.candidate;
                        const callAttention =
                          item.job_score?.call_attention || [];
                        const isDisabled = selectionType === "ARCHIVED";
                        const currentSlug = (
                          item.current_stage?.slug ||
                          item.stage_slug ||
                          ""
                        ).toLowerCase();
                        const showAscendionUncontacted =
                          isAscendionWorkspace && currentSlug === "uncontacted";
                        const isVerifiedNonDuplicate =
                          verifiedNonDuplicateIds.has(cand.id) || cand.is_ascendion_duplicate === false;
                        const isAscendionDupChecking =
                          ascendionCheckingIds.has(cand.id);

                        // Experience — handle both numeric total_experience and string like "1+ years exp"
                        const expYears =
                          cand.total_experience != null
                            ? `${cand.total_experience} Years`
                            : cand.experience_years
                              ? cand.experience_years.replace(/\s*exp$/i, "")
                              : "--";

                        // CTC


                        const ctcText =
                          cand.current_salary_lpa ||
                          (cand.current_salary_lpa != null
                            ? `${cand.current_salary_lpa}`
                            : "--");

                        const ctcDisplay = (
                          <span className="flex flex-col items-start gap-1">
                            {ctcText}
                            {cand.current_take_home && (
                              <span className="text-[#8E8E93] text-[10px] font-normal italic">
                                (fixed: {cand.current_take_home})
                              </span>
                            )}
                          </span>
                        );

                        // Expected CTC
                        const expectedCtc = cand.expected_ctc
                          ? `${cand.expected_ctc} LPA`
                          : "--";

                        // Notice period string for logic/modals
                        const noticePeriodText =
                          cand.notice_period_summary ||
                          (cand.notice_period_days != null
                            ? `${cand.notice_period_days} Days`
                            : "--");

                        // Notice period display for table/UI
                        const noticePeriodDisplay = (
                          <span className="flex flex-col items-start gap-1">
                            {noticePeriodText}
                            {cand.last_working_day && (
                              <span className="text-[#8E8E93] text-[10px] font-normal italic">
                                (LWD: {formatDate(cand.last_working_day)})
                              </span>
                            )}
                          </span>
                        );

                        // Attention tag from status_tags
                        const attentionTag = item.status_tags?.find(
                          (t) => t.text,
                        );

                        // AI Score — read from item.job_score (top-level), not cand.job_score
                        const aiScoreRaw =
                          item.job_score?.candidate_match_score?.score;
                        const aiScoreLabel = aiScoreRaw || "--%";
                        const aiScoreNum = aiScoreRaw
                          ? parseInt(aiScoreRaw.replace("%", ""), 10)
                          : 0;
                        const aiScoreColor =
                          aiScoreNum >= 70
                            ? "#00C8B3"
                            : aiScoreNum >= 40
                              ? "#FFCC00"
                              : aiScoreNum > 0
                                ? "#FF383C"
                                : "#E5E7EB";

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-[#F9FAFB] transition-colors ${isDisabled ? "opacity-60" : ""}`}
                          >
                            <td className="px-4 py-5">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#0F47F2]"
                                checked={selectedIds.has(item.id)}
                                onChange={() => handleToggleCandidate(item)}
                                disabled={isDisabled}
                              />
                            </td>
                            <td className="px-4 py-5">
                              <div
                                className="cursor-pointer group"
                                onClick={() =>
                                  onSelectCandidate?.(item, candidates, index)
                                }
                              >
                                <div>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="font-medium text-[#4B5563] group-hover:underline group-hover:text-blue-600 transition truncate">
                                      {cand.full_name || "--"}
                                    </div>
                                    {showAscendionUncontacted && isVerifiedNonDuplicate && (
                                      <div title="Not a duplicate in Ascendion portal">
                                        <Check
                                          className="w-4 h-4 text-green-600 shrink-0"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#727272] truncate">
                                    {cand.headline || "--"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5">
                              <div className="relative w-9 h-9">
                                <svg
                                  className="w-9 h-9 -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3.5"
                                  />
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={aiScoreColor}
                                    strokeWidth="3.5"
                                    strokeDasharray={`${aiScoreNum}, 100`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4B5563]">
                                  {aiScoreNum}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563] whitespace-nowrap">
                              <div className="truncate" title={cand.location || "--"}>
                                {cand.location || "--"}
                              </div>
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563]">
                              <div className="whitespace-nowrap">
                                {expYears}
                              </div>
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563] whitespace-nowrap">
                              {ctcDisplay}
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563] whitespace-nowrap">
                              {expectedCtc}
                            </td>
                            <td className="px-4 py-5 text-sm text-[#4B5563] whitespace-nowrap">
                              {noticePeriodDisplay}
                            </td>
                            <td className="px-4 py-5 whitespace-nowrap">
                              <div>
                                <div className="text-[#6155F5] text-sm font-medium whitespace-nowrap truncate" title={item.current_stage?.name || "--"}>
                                  {item.current_stage?.name || "--"}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5 whitespace-nowrap">
                              <div className="whitespace-nowrap">
                                {(() => {
                                  const pill = getAttentionPill(item, attentionTag);
                                  if (!pill) return <span className="text-xs text-[#8E8E93]">--</span>;
                                  const bgColor = pill.color === "red" ? "#FEE9E7" : pill.color === "blue" ? "#EDE9FE" : "#D1FAE5";
                                  const textColor = pill.color === "red" ? "#FF383C" : pill.color === "blue" ? "#6366F1" : "#059669";
                                  return (
                                    <span
                                      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full truncate max-w-[150px]"
                                      style={{ backgroundColor: bgColor, color: textColor }}
                                      title={pill.text}
                                    >
                                      {pill.text}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td
                              className={`sticky right-0 ${menuOpenId === item.id ? "z-40" : "z-[2]"} bg-white px-4 py-5 shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.18)]`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-end items-center gap-2">
                                {showAscendionUncontacted && (
                                  <button
                                    onClick={() => runAscendionDuplicateCheck(cand.id)}
                                    disabled={isVerifiedNonDuplicate || isAscendionDupChecking}
                                    className="h-8 px-2.5 rounded-md text-[11px] font-medium border border-[#D1D1D6] text-[#4B5563] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors whitespace-nowrap"
                                    title={
                                      isVerifiedNonDuplicate
                                        ? "Already verified as not duplicate"
                                        : "Check Ascendion portal duplicate"
                                    }
                                  >
                                    {isAscendionDupChecking ? "Checking..." : "Check dup"}
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    const nextStage = getNextStageForItem(item);
                                    if (!nextStage) {
                                      showToast.info("No next stage available");
                                      return;
                                    }
                                    openFeedbackModal({
                                      type: "move",
                                      applicationIds: [item.id],
                                      targetStageId: nextStage.id,
                                      targetStageName: nextStage.name,
                                    });
                                  }}
                                  className="h-8 min-w-[88px] px-3 rounded-md text-xs font-medium text-white bg-[#0F47F2] hover:bg-[#0D3ECF] transition-colors whitespace-nowrap"
                                  title={getPrimaryMoveLabel(item)}
                                >
                                  {getPrimaryMoveLabel(item)}
                                </button>

                                <div className={`relative ${menuOpenId === item.id ? "z-50" : ""}`} ref={menuOpenId === item.id ? menuRef : null}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (menuOpenId === item.id) {
                                        setMenuOpenId(null);
                                        return;
                                      }
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const menuWidth = 192;
                                      const menuHeight = 240;
                                      const gap = 8;
                                      const openUp = rect.bottom + menuHeight + gap > window.innerHeight;
                                      const preferredTop = openUp
                                        ? rect.top - menuHeight - gap
                                        : rect.bottom + gap;
                                      const top = Math.min(
                                        Math.max(8, preferredTop),
                                        Math.max(8, window.innerHeight - menuHeight - 8)
                                      );
                                      let left = rect.right - menuWidth;
                                      if (left < 8) left = 8;
                                      if (left + menuWidth > window.innerWidth - 8) {
                                        left = window.innerWidth - menuWidth - 8;
                                      }
                                      setMenuPos({ top, left });
                                      setMenuOpenId(item.id);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-[#F3F5F7] rounded-full hover:bg-gray-200 transition-colors"
                                    title="Options"
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-[#4B5563]" />
                                  </button>

                                  {menuOpenId === item.id && (
                                    <div
                                      className="fixed w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[999999] py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                                      style={{ top: menuPos.top, left: menuPos.left }}
                                    >
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const callData = {
                                            id: cand.id,
                                            name: cand.full_name || "Unknown",
                                            avatarInitials: cand.full_name
                                              ? cand.full_name.substring(0, 2).toUpperCase()
                                              : "UN",
                                            headline: cand.headline || "--",
                                            phone:
                                              cand.premium_data?.phone ||
                                              cand.premium_data?.all_phone_numbers?.[0] ||
                                              "+91 98765 43210",
                                            experience: expYears,
                                            currentCtc: cand.current_salary_lpa
                                              ? `${cand.current_salary_lpa}`
                                              : "--",
                                            expectedCtc: cand.expected_ctc
                                              ? `${cand.expected_ctc} LPA`
                                              : "--",
                                            noticePeriod: noticePeriodText,
                                            location: cand.location || "--",
                                            resumeUrl: cand.premium_data?.resume_url || cand.resume_url || "",
                                          };
                                          const candidateIds = sortedCandidates.map(c => c.candidate.id);
                                          sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ 
                                            candidate: callData,
                                            candidateList: candidateIds
                                          }));
                                          setMenuOpenId(null);
                                          window.location.href = `/call/${cand.id}/${jobId || 0}?mode=manual`;
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Call
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCandidateEditing(item);
                                          setShowCandidateEditModal(true);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Edit Details
                                      </button>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await handleCopyCandidateEmail(item);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Copy Mail ID
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openFeedbackModal({
                                            type: "archive",
                                            applicationIds: [item.id],
                                          });
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Archive
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextStage = getNextStageForItem(item);
                                          if (!nextStage) {
                                            showToast.info("No next stage available");
                                            return;
                                          }
                                          openFeedbackModal({
                                            type: "move",
                                            applicationIds: [item.id],
                                            targetStageId: nextStage.id,
                                            targetStageName: nextStage.name,
                                          });
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        {getPrimaryMoveLabel(item)}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShiftStageItem(item);
                                          setShiftStageTargetId(null);
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Shift to Stage
                                      </button>
                                      <div className="h-px bg-[#F3F5F7] my-1" />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/candidate-profiles/${cand.id}?job_id=${jobId}`, {
                                            state: {
                                              shareOption: "full_profile",
                                              resumeUrl: cand.premium_data?.resume_url || cand.resume_url || ""
                                            }
                                          });
                                          setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                                      >
                                        Share Profile
                                      </button>

                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Archived Candidates in Table View */}
                      {filteredArchivedTable.length > 0 && (
                        <>
                          <tr className="bg-[#F9FAFB]">
                            <td
                              colSpan={11}
                              className="px-4 py-3 border-y border-[#E5E7EB]"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-px bg-[#D1D1D6] flex-1"></div>
                                <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest px-4">
                                  Archived Candidates
                                </span>
                                <div className="h-px bg-[#D1D1D6] flex-1"></div>
                              </div>
                            </td>
                          </tr>
                          {filteredArchivedTable.map((item) => {
                            const cand = item.candidate;
                            const isDisabled = selectionType === "ACTIVE";

                            return (
                              <tr
                                key={item.id}
                                className={`grayscale opacity-50 bg-gray-50/50 hover:bg-gray-100 transition-colors ${isDisabled ? "opacity-30" : ""}`}
                              >
                                <td className="px-4 py-5">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-[#4B5563]"
                                    checked={selectedIds.has(item.id)}
                                    onChange={() => handleToggleCandidate(item)}
                                    disabled={isDisabled}
                                  />
                                </td>
                                <td className="px-4 py-5 whitespace-nowrap">
                                  <div
                                    className="cursor-pointer group"
                                    onClick={() =>
                                      onSelectCandidate?.(item, filteredArchivedTable, filteredArchivedTable.indexOf(item))
                                    }
                                  >
                                    <div>
                                      <div className="font-medium text-[#8E8E93] group-hover:underline group-hover:text-blue-600 transition truncate" title={cand.full_name || "--"}>
                                        {cand.full_name || "--"}
                                      </div>
                                      <div className="text-xs text-[#AEAEB2] truncate" title={cand.headline || "--"}>
                                        {cand.headline || "--"}
                                      </div>
                                    </div>
                                    {(item as any).archive_reason && (
                                      <div className="bg-[#FEF2F2] px-2 py-1 rounded text-[10px] text-[#DC2626] font-medium mt-1.5 inline-flex items-center gap-1.5 w-fit max-w-[200px]">
                                        <Archive className="w-3 h-3 shrink-0" />
                                        <span className="truncate" title={(item as any).archive_reason}>
                                          {(item as any).archive_reason}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-5">
                                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    --%
                                  </div>
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2] whitespace-nowrap">
                                  <span className="truncate block" title={cand.location || "--"}>{cand.location || "--"}</span>
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">
                                  {cand.total_experience != null
                                    ? `${cand.total_experience} Yrs`
                                    : cand.experience_years
                                      ? cand.experience_years.replace(
                                        /\s*exp$/i,
                                        "",
                                      )
                                      : "--"}
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">
                                  --
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">
                                  --
                                </td>
                                <td className="px-4 py-5 text-sm text-[#AEAEB2]">
                                  --
                                </td>
                                <td className="px-4 py-5 whitespace-nowrap">
                                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full font-bold">
                                    ARCHIVED
                                  </span>
                                </td>
                                <td className="px-4 py-5 whitespace-nowrap">
                                  <div className="whitespace-nowrap">
                                    {(() => {
                                      const attentionTag = item.status_tags?.find((t: { text: any; }) => t.text);
                                      const pill = getAttentionPill(item, attentionTag);
                                      if (!pill) return <span className="text-[10px] text-[#AEAEB2]">--</span>;
                                      const bgColor = pill.color === "red" ? "#FEE9E7" : pill.color === "blue" ? "#EDE9FE" : "#D1FAE5";
                                      const textColor = pill.color === "red" ? "#FF383C" : pill.color === "blue" ? "#6366F1" : "#059669";
                                      return (
                                        <span
                                          className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full truncate max-w-[150px]"
                                          style={{ backgroundColor: bgColor, color: textColor }}
                                          title={pill.text}
                                        >
                                          {pill.text}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                </td>
                                <td className="sticky right-0 z-20 bg-[#F9FAFB] px-4 py-5 shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.18)]">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const targetStage =
                                            stages.find(
                                              (s) => s.slug === "shortlisted",
                                            ) || stages[0];
                                          await apiClient.patch(
                                            `/jobs/applications/${item.id}/`,
                                            { current_stage: targetStage.id },
                                          );
                                          showToast.success(
                                            "Candidate unarchived",
                                          );
                                          fetchCandidates(
                                            jobId,
                                            isKanbanView ? null : activeStageSlug,
                                            currentPage,
                                            searchQuery,
                                            isKanbanView ? 1000 : pageSize
                                          );
                                          fetchArchivedCandidates(jobId);
                                        } catch {
                                          showToast.error(
                                            "Failed to unarchive",
                                          );
                                        }
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
                  Showing {candidates.length > 0 ? startIndex + 1 : 0}–
                  {Math.min(startIndex + pageSize, totalCandidates)} of{" "}
                  {totalCandidates} candidates
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`e-${i}`}
                          className="w-8 h-8 flex items-center justify-center text-[#6B7280] text-xs"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === p ? "bg-[#0F47F2] text-white" : "border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                    >
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
      {activeTab === "linkedinbot" && <LinkedinBotTab jobId={jobId} onFilterCountChange={setLinkedinBotFilteredCount} />}
      {activeTab === "inbound" && (
        <InboundTab
          jobId={jobId}
          isAscendionWorkspace={isAscendionWorkspace}
          onSelectCandidate={onSelectCandidate}
        />
      )}
      {/* {activeTab === "nxthyre" && <NxthyreTab jobId={jobId} onSelectCandidate={onSelectCandidate} />} */}

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
              <h2 className="text-lg font-semibold">
                Upload Resumes (PDF, DOC, DOCX)
              </h2>
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
            {uploadStatus &&
              (() => {
                const processed = uploadStatus.success + uploadStatus.failed;
                const percent =
                  uploadStatus.total_files > 0
                    ? Math.round((processed / uploadStatus.total_files) * 100)
                    : 0;
                return (
                  <div className="mt-2 mb-4 border rounded-md p-3 max-h-[240px] overflow-y-auto">
                    <details open>
                      <summary className="cursor-pointer font-medium text-lg flex justify-between">
                        <span>Active Upload</span>
                        <span className="text-gray-500">
                          {uploadStatus.status}
                        </span>
                      </summary>
                      <div className="mt-3 space-y-3 text-[14px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-black">
                            Total: {uploadStatus.total_files}
                          </div>
                          <div className="text-gray-600">
                            Processed: {processed}
                          </div>
                          <div className="text-green-500">
                            Success: {uploadStatus.success}
                          </div>
                          <div className="text-red-500">
                            Failed: {uploadStatus.failed}
                          </div>
                          <div className="text-yellow-500">
                            Pending: {uploadStatus.pending}
                          </div>
                          <div className="text-blue-500">
                            Processing: {uploadStatus.processing}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-md mb-1">
                            <span>
                              {processed} / {uploadStatus.total_files} completed
                            </span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 bg-blue-600 rounded"
                              style={{ width: `${percent}%` }}
                            />
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
                  <summary className="cursor-pointer font-medium text-lg">
                    Upload History
                  </summary>
                  <div className="mt-3 space-y-2 text-md">
                    {uploadHistory.map((batch: any, index: number) => {
                      const processed = batch.success + batch.failed;
                      const percent =
                        batch.total_files > 0
                          ? Math.round((processed / batch.total_files) * 100)
                          : 0;
                      return (
                        <div
                          key={index}
                          className="border rounded-md p-3 space-y-2 bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-md text-gray-700">
                              Batch: {batch.batch_id ?? "Legacy Batch"}
                            </span>
                            <span className="text-md text-gray-500">
                              {new Date(batch.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[14px]">
                            <div className="text-black">
                              Total: {batch.total_files}
                            </div>
                            <div className="text-gray-600">
                              Processed: {processed}
                            </div>
                            <div className="text-green-500">
                              Success: {batch.success}
                            </div>
                            <div className="text-red-500">
                              Failed: {batch.failed}
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-md mb-1">
                              <span>Status: {batch.status}</span>
                              <span>{percent}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded">
                              <div
                                className="h-2 bg-blue-500 rounded"
                                style={{ width: `${percent}%` }}
                              />
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
                <span className="text-sm text-[#8E8E93]">
                  Loading requisition info...
                </span>
              </div>
            ) : jobDataForModal ? (
              <>
                {/* ── Header ── */}
                <div
                  className="px-[30px] py-[36px] flex flex-wrap gap-[30px] items-center justify-between"
                  style={{ borderBottom: "0.5px solid #C7C7CC" }}
                >
                  <div className="flex items-center gap-[10px]">
                    <button
                      onClick={handleCloseRequisitionModal}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
                    </button>
                    <div className="flex items-center gap-[10px]">
                      <div
                        className="w-[86px] h-[86px] rounded-full bg-[#0F47F2] text-white flex items-center justify-center shrink-0"
                        style={{ fontSize: "36px", fontWeight: 500 }}
                      >
                        {jobDataForModal.title?.charAt(0) || "?"}
                      </div>
                      <div className="flex flex-col gap-[10px] px-[10px]">
                        <h2
                          style={{
                            fontSize: "32px",
                            lineHeight: "40px",
                            fontWeight: 500,
                          }}
                          className="text-[#4B5563]"
                        >
                          {jobDataForModal.title || "--"}
                        </h2>
                        <div className="flex flex-wrap items-start gap-[15px]">
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <Briefcase className="w-4 h-4 text-[#8E8E93]" />{" "}
                            {jobDataForModal.experience_min_years ?? "--"}+
                            years
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <LocateIcon className="w-4 h-4 text-[#8E8E93]" />{" "}
                            {workApproachLabel[jobDataForModal.work_approach] ||
                              jobDataForModal.work_approach ||
                              "--"}
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <FileSearch className="w-4 h-4 text-[#8E8E93]" />{" "}
                            {jobDataForModal.location?.join(", ") || "--"}
                          </span>
                          <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                            <Clock className="w-4 h-4 text-[#8E8E93]" />{" "}
                            Immediate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tabs in header area */}
                  <div className="flex items-center gap-[10px]">
                    <div
                      className="flex items-center gap-[10px] px-[10px] h-[37px] rounded-[5px]"
                      style={{
                        background: "#E7EDFF",
                        border: "1px solid #0F47F2",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          lineHeight: "17px",
                          fontWeight: 500,
                        }}
                        className="text-[#0F47F2]"
                      >
                        JD-{jobId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Tab Switcher ── */}
                <div
                  className="px-[30px] pt-[20px]"
                  style={{ borderBottom: "0.5px solid #C7C7CC" }}
                >
                  <div className="flex gap-[20px]">
                    <button
                      className={`pb-[12px] text-[14px] font-medium transition-colors ${requisitionModalTab === "info"
                        ? "text-[#0F47F2] border-b-2 border-[#0F47F2]"
                        : "text-[#8E8E93] hover:text-[#4B5563]"
                        }`}
                      onClick={() => setRequisitionModalTab("info")}
                    >
                      Requisition Info
                    </button>
                    <button
                      className={`pb-[12px] text-[14px] font-medium transition-colors ${requisitionModalTab === "company"
                        ? "text-[#0F47F2] border-b-2 border-[#0F47F2]"
                        : "text-[#8E8E93] hover:text-[#4B5563]"
                        }`}
                      onClick={async () => {
                        setRequisitionModalTab("company");
                        if (
                          jobDataForModal?.workspace_details?.id &&
                          !companyResearchData
                        ) {
                          setLoadingCompanyResearch(true);
                          try {
                            setCompanyResearchData(
                              await organizationService.getCompanyResearchData(
                                jobDataForModal.workspace_details.id,
                              ),
                            );
                          } catch {
                          } finally {
                            setLoadingCompanyResearch(false);
                          }
                        }
                      }}
                    >
                      About Company
                    </button>
                  </div>
                </div>

                {/* ── Tab Content ── */}
                {requisitionModalTab === "info" && competenciesData && (
                  <div className="px-[30px] pt-[20px] pb-[50px]">
                    {/* ── Stats Cards ── */}
                    <div className="pl-[25px] flex flex-wrap gap-[30px] mb-[20px]">
                      {[
                        {
                          label: "Experience",
                          value: `${jobDataForModal.experience_min_years ?? "--"} - ${jobDataForModal.experience_max_years ?? "--"} yrs`,
                        },
                        {
                          label: "Positions",
                          value: jobDataForModal.count || "--",
                        },
                        {
                          label: "Salary Range",
                          value: formatSalary(
                            jobDataForModal.salary_min,
                            jobDataForModal.salary_max,
                          ),
                        },
                        {
                          label: "Work Approach",
                          value:
                            workApproachLabel[jobDataForModal.work_approach] ||
                            "--",
                        },
                      ].map((stat, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col gap-[8px] bg-white rounded-[10px] p-[20px]"
                          style={{ border: "0.5px solid #D1D1D6" }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              lineHeight: "14px",
                              fontWeight: 400,
                            }}
                            className="text-[#4B5563]"
                          >
                            {stat.label}
                          </span>
                          <span
                            style={{
                              fontSize: "24px",
                              lineHeight: "29px",
                              fontWeight: 500,
                            }}
                            className="text-black"
                          >
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div
                      style={{ borderBottom: "0.5px solid #C7C7CC" }}
                      className="mb-[20px]"
                    ></div>

                    {/* ── Role Overview ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <BookOpen className="w-5 h-5 text-[#4B5563]" />
                        <span
                          style={{
                            fontSize: "18px",
                            lineHeight: "22px",
                            fontWeight: 500,
                          }}
                          className="text-[#4B5563]"
                        >
                          Role Overview
                        </span>
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: "24px",
                          fontWeight: 400,
                          maxWidth: "738px",
                        }}
                        className="text-[#727272]"
                      >
                        {competenciesData.role_overview || "--"}
                      </p>
                    </div>

                    {/* Divider */}
                    <div
                      style={{ borderBottom: "0.5px solid #C7C7CC" }}
                      className="mb-[20px]"
                    ></div>

                    {/* ── The Core Expectation ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Target className="w-5 h-5 text-[#4B5563]" />
                        <span
                          style={{
                            fontSize: "18px",
                            lineHeight: "22px",
                            fontWeight: 500,
                          }}
                          className="text-[#4B5563]"
                        >
                          The Core Expectation
                        </span>
                      </h3>
                      <div className="rounded-[10px] bg-[#EBFFEE] p-[20px]">
                        <ul className="flex flex-col gap-0">
                          {competenciesData.the_core_expectation.map(
                            (item: string, i: number) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: "14px",
                                  lineHeight: "24px",
                                  fontWeight: 400,
                                  listStyle: "disc",
                                  marginLeft: "16px",
                                }}
                                className="text-[#727272]"
                              >
                                {item}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      style={{ borderBottom: "0.5px solid #C7C7CC" }}
                      className="mb-[20px]"
                    ></div>

                    {/* ── Key Responsibilities ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <ListChecks className="w-5 h-5 text-[#4B5563]" />
                        <span
                          style={{
                            fontSize: "18px",
                            lineHeight: "22px",
                            fontWeight: 500,
                          }}
                          className="text-[#4B5563]"
                        >
                          Key Responsibilities
                        </span>
                      </h3>
                      <div className="flex flex-col gap-[10px]">
                        {competenciesData.key_responsibilities_explained.functional.map(
                          (item: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-[10px] p-[20px] bg-[#E7EDFF] rounded-[10px]"
                            >
                              <div className="flex flex-col gap-[4px]">
                                <span
                                  style={{
                                    fontSize: "14px",
                                    lineHeight: "17px",
                                    fontWeight: 500,
                                  }}
                                  className="text-black"
                                >
                                  {item.competency}
                                </span>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    lineHeight: "20px",
                                    fontWeight: 400,
                                  }}
                                  className="text-[#727272]"
                                >
                                  {item.context}
                                </span>
                                {item.priority && (
                                  <span
                                    className="flex items-center justify-center py-[4px] px-[10px] rounded-full bg-[#FFF7D6] text-[#F59E0B] self-start mt-[4px]"
                                    style={{
                                      fontSize: "10px",
                                      lineHeight: "12px",
                                      fontWeight: 500,
                                    }}
                                  >
                                    Priority: {item.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      {/* Leadership responsibilities */}
                      {competenciesData.key_responsibilities_explained
                        .leadership?.length > 0 && (
                          <>
                            <div
                              style={{ borderBottom: "0.5px solid #C7C7CC" }}
                              className="my-[20px]"
                            ></div>
                            <h4 className="flex items-center gap-[5px] mb-[14px]">
                              <Zap className="w-4 h-4 text-[#4B5563]" />
                              <span
                                style={{
                                  fontSize: "16px",
                                  lineHeight: "20px",
                                  fontWeight: 500,
                                }}
                                className="text-[#4B5563]"
                              >
                                Leadership
                              </span>
                            </h4>
                            <div className="flex flex-col gap-[10px]">
                              {competenciesData.key_responsibilities_explained.leadership.map(
                                (item: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-[10px] p-[20px] bg-[#EBFFEE] rounded-[10px]"
                                  >
                                    <div className="flex flex-col gap-[4px]">
                                      <span
                                        style={{
                                          fontSize: "14px",
                                          lineHeight: "17px",
                                          fontWeight: 500,
                                        }}
                                        className="text-black"
                                      >
                                        {item.responsibility}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          lineHeight: "20px",
                                          fontWeight: 400,
                                        }}
                                        className="text-[#727272]"
                                      >
                                        {item.context}
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Divider */}
                    <div
                      style={{ borderBottom: "0.5px solid #C7C7CC" }}
                      className="mb-[20px]"
                    ></div>

                    {/* ── Technical Skills ── */}
                    <div className="pl-[25px] mb-[20px]">
                      <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Layers className="w-5 h-5 text-[#4B5563]" />
                        <span
                          style={{
                            fontSize: "18px",
                            lineHeight: "22px",
                            fontWeight: 500,
                          }}
                          className="text-[#4B5563]"
                        >
                          Technical Skills
                        </span>
                      </h3>
                      <div className="flex flex-col gap-[10px]">
                        {competenciesData.required_technical_skills_purpose.map(
                          (item: any, i: number) => {
                            const SKILL_COLORS = [
                              "bg-[#E7EDFF]",
                              "bg-[#E7E5FF]",
                              "bg-[#F3F5F7]",
                            ];
                            return (
                              <div
                                key={i}
                                className={`flex items-start gap-[10px] p-[20px] ${SKILL_COLORS[i % SKILL_COLORS.length]} rounded-[10px]`}
                              >
                                <div className="flex flex-col gap-[4px]">
                                  <span
                                    style={{
                                      fontSize: "14px",
                                      lineHeight: "17px",
                                      fontWeight: 500,
                                    }}
                                    className="text-black"
                                  >
                                    {item.skill}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      lineHeight: "20px",
                                      fontWeight: 400,
                                    }}
                                    className="text-[#727272]"
                                  >
                                    {item.context}
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* ── Skills Pills ── */}
                    {jobDataForModal.skills &&
                      jobDataForModal.skills.length > 0 && (
                        <>
                          <div
                            style={{ borderBottom: "0.5px solid #C7C7CC" }}
                            className="mb-[20px]"
                          ></div>
                          <div className="pl-[25px] mb-[50px]">
                            <h3 className="flex items-center gap-[5px] mb-[20px]">
                              <Target className="w-5 h-5 text-[#4B5563]" />
                              <span
                                style={{
                                  fontSize: "18px",
                                  lineHeight: "22px",
                                  fontWeight: 500,
                                }}
                                className="text-[#4B5563]"
                              >
                                Required Skills
                              </span>
                            </h3>
                            <div className="flex flex-wrap gap-[10px]">
                              {jobDataForModal.skills.map(
                                (skill: string, i: number) => {
                                  const PILL_COLORS = [
                                    "bg-[#E7EDFF] text-[#0F47F2]",
                                    "bg-[#E7E5FF] text-[#6155F5]",
                                    "bg-[#EBFFEE] text-[#009951]",
                                    "bg-[#FFF7D6] text-[#F59E0B]",
                                    "bg-[#F3F5F7] text-[#4B5563]",
                                  ];
                                  return (
                                    <span
                                      key={i}
                                      className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${PILL_COLORS[i % PILL_COLORS.length]}`}
                                      style={{
                                        fontSize: "12px",
                                        lineHeight: "14px",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {skill}
                                    </span>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                )}

                {/* ── About Company Tab ── */}
                {requisitionModalTab === "company" && (
                  <div className="px-[30px] pt-[20px] pb-[50px]">
                    {loadingCompanyResearch ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F47F2]"></div>
                        <span className="text-sm text-[#8E8E93]">
                          Loading company info...
                        </span>
                      </div>
                    ) : companyResearchData ? (
                      <CompanyInfoTab data={companyResearchData} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 gap-2">
                        <span className="text-sm text-[#8E8E93]">
                          No company details available.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-2">
                <span className="text-sm text-[#8E8E93]">
                  Failed to load requisition data.
                </span>
                <button
                  onClick={handleCloseRequisitionModal}
                  className="text-sm text-[#0F47F2] hover:underline"
                >
                  Close
                </button>
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
              pipelineId={jobId ?? undefined}
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

      {/* Edit Stage Details - Full Screen Overlay */}
      {stageToEdit && jobId !== null && jobId !== undefined && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[11000] flex">
          <div className="ml-auto min-w-[400px]">
            <AddNewStageForm
              pipelineId={Number(jobId)}
              stageId={stageToEdit.id}
              isEditMode
              onClose={() => setStageToEdit(null)}
              onStageCreated={() => {
                setStageToEdit(null);
                showToast.success("Stage updated successfully!");
                const currentLimit = isKanbanView ? 1000 : pageSize;
                const currentStage = isKanbanView ? null : activeStageSlug;
                fetchCandidates(
                  jobId,
                  currentStage,
                  currentPage,
                  searchQuery,
                  currentLimit
                );
                fetchStages(jobId);
                fetchArchivedCandidates(jobId);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Stage Confirmation Modal */}
      {stageToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[11001] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-semibold text-[#111827]">Delete Stage</h3>
              <p className="text-sm text-[#6B7280] mt-2">
                Are you sure you want to delete
                <span className="font-medium text-[#111827]"> {stageToDelete.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setStageToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-[#4B5563] border border-[#D1D5DB] rounded-lg hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStage}
                className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] rounded-lg hover:bg-[#B91C1C]"
              >
                Delete Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Format Selection Modal */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Export {selectedIds.size} Candidate
              {selectedIds.size !== 1 ? "s" : ""}
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


      {/* Candidate Edit Modal */}
      {/* Candidate Edit Modal */}
      {showCandidateEditModal && candidateEditing && (
        <div
          className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/25 backdrop-blur-sm"
          onClick={() => setShowCandidateEditModal(false)}
        >
          <div
            className="bg-white flex flex-col"
            style={{
              width: 553,
              maxHeight: "90vh",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Header ─── */}
            <div
              className="w-full shrink-0"
              style={{ borderBottom: "0.5px solid #AEAEB2" }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: "20px 24px" }}
              >
                <span
                  className="font-medium text-gray-600"
                  style={{ fontSize: 16, lineHeight: "19px" }}
                >
                  Edit Candidate Details
                </span>
                <button
                  className="flex items-center justify-center bg-transparent border-none p-0 cursor-pointer hover:opacity-60"
                  onClick={() => setShowCandidateEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#4B5563"
                      strokeWidth="1"
                    />
                    <path
                      d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54"
                      stroke="#4B5563"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* ─── Body (Scrollable if content overflows) ─── */}
            <div className="flex-1 overflow-y-auto">
              {/* Candidate Info (Inspired by NewMatchCandidateModal) */}
              <div
                className="w-full"
                style={{
                  borderBottom: "0.5px solid #AEAEB2",
                  padding: "20px 24px",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: 30 }}
                >
                  <div className="flex flex-col" style={{ gap: 10 }}>
                    <h3
                      className="m-0 font-medium text-black"
                      style={{ fontSize: 20, lineHeight: "24px" }}
                    >
                      {candidateEditing.candidate.full_name ||
                        "Unknown Candidate"}
                    </h3>
                    <p
                      className="m-0 text-xs font-normal"
                      style={{ color: "#0F47F2", lineHeight: "14px" }}
                    >
                      {candidateEditing.candidate.headline || "--"}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: "#0F47F2" }}
                  >
                    {candidateEditing.candidate.full_name
                      ? candidateEditing.candidate.full_name
                        .substring(0, 2)
                        .toUpperCase()
                      : "CA"}
                  </div>
                </div>

                <div
                  className="flex items-start justify-between"
                  style={{ gap: 67 }}
                >
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  >
                    <span
                      className="text-sm font-normal"
                      style={{ color: "#8E8E93", lineHeight: "17px" }}
                    >
                      Experience
                    </span>
                    <span
                      className="font-medium text-gray-600"
                      style={{ fontSize: 16, lineHeight: "19px" }}
                    >
                      {candidateEditing.candidate.total_experience != null
                        ? `${candidateEditing.candidate.total_experience} Years`
                        : candidateEditing.candidate.experience_years || "--"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  >
                    <span
                      className="text-sm font-normal"
                      style={{ color: "#8E8E93", lineHeight: "17px" }}
                    >
                      Location
                    </span>
                    <span
                      className="font-medium text-gray-600"
                      style={{ fontSize: 16, lineHeight: "19px" }}
                    >
                      {candidateEditing.candidate.location || "N/A"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  >
                    {/* Placeholder for symmetry */}
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="w-full" style={{ padding: "24px" }}>
                <h4
                  className="m-0 font-medium text-sm uppercase text-gray-600"
                  style={{ lineHeight: "17px", marginBottom: 20 }}
                >
                  Update Details
                </h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Current CTC (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.current_ctc_lpa}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          current_ctc_lpa: e.target.value,
                        })
                      }
                      placeholder="e.g. 15.5"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Expected CTC (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.expected_ctc_lpa}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          expected_ctc_lpa: e.target.value,
                        })
                      }
                      placeholder="e.g. 20"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Current Take Home (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.current_take_home}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          current_take_home: e.target.value,
                        })
                      }
                      placeholder="e.g. 12"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={candidateEditForm.notice_period_days}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          notice_period_days: e.target.value,
                        })
                      }
                      placeholder="e.g. 30"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.exp}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          exp: e.target.value,
                        })
                      }
                      placeholder="e.g. 4.5"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Last Working Day
                    </label>
                    <input
                      type="date"
                      value={candidateEditForm.last_working_day}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          last_working_day: e.target.value,
                        })
                      }
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Location
                    </label>
                    <input
                      type="text"
                      value={candidateEditForm.location}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g. Bengaluru"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Footer Actions ─── */}
            <div
              className="flex items-center justify-end shrink-0"
              style={{
                padding: "20px 24px",
                borderTop: "0.5px solid #AEAEB2",
                gap: 12,
              }}
            >
              <button
                className="flex items-center justify-center cursor-pointer bg-white text-sm font-normal transition-opacity hover:opacity-75"
                style={{
                  height: 37,
                  border: "0.5px solid #D1D1D6",
                  borderRadius: 5,
                  padding: "0 20px",
                  color: "#4B5563",
                }}
                onClick={() => setShowCandidateEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center cursor-pointer text-sm font-normal transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
                style={{
                  height: 37,
                  background: "#0F47F2",
                  border: "none",
                  borderRadius: 5,
                  padding: "0 24px",
                  color: "white",
                }}
                onClick={handleCandidateEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {shiftStageItem && (
        <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">Shift to Stage</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Select a stage for {shiftStageItem.candidate.full_name || "candidate"}.
            </p>
            <select
              value={shiftStageTargetId ?? ""}
              onChange={(e) => setShiftStageTargetId(Number(e.target.value))}
              className="w-full border border-[#D1D1D6] rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-1 focus:ring-[#0F47F2]"
            >
              <option value="" disabled>Select stage</option>
              {nonArchiveStages
                .filter((s) => s.id !== shiftStageItem.current_stage?.id)
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShiftStageItem(null);
                  setShiftStageTargetId(null);
                }}
                className="px-4 py-2 text-sm border border-[#D1D1D6] rounded-lg text-[#4B5563] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!shiftStageTargetId) {
                    showToast.error("Please select a stage");
                    return;
                  }
                  const targetStage = nonArchiveStages.find((s) => s.id === shiftStageTargetId);
                  if (!targetStage) {
                    showToast.error("Selected stage not found");
                    return;
                  }
                  openFeedbackModal({
                    type: "move",
                    applicationIds: [shiftStageItem.id],
                    targetStageId: targetStage.id,
                    targetStageName: targetStage.name,
                  });
                  setShiftStageItem(null);
                  setShiftStageTargetId(null);
                }}
                className="px-4 py-2 text-sm bg-[#0F47F2] text-white rounded-lg hover:bg-[#0D3ECF]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {pendingAction.type === "archive" && "Archive Candidates"}
                {pendingAction.type === "unarchive" && "Unarchive Candidates"}
                {pendingAction.type === "move" &&
                  `Move to ${pendingAction.targetStageName || "Next Stage"}`}
              </h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setPendingAction(null);
                  setFeedbackComment("");
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium border border-blue-100">
                You are about to {pendingAction.type}{" "}
                {pendingAction.applicationIds.length} candidate(s):
                <div className="mt-2 text-blue-600 font-normal text-xs bg-white/60 p-2 rounded border border-blue-100/50">
                  {pendingAction.candidateNames?.slice(0, 3).join(", ")}
                  {pendingAction.candidateNames &&
                    pendingAction.candidateNames.length > 3 &&
                    ` and ${pendingAction.candidateNames.length - 3} more`}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback / Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm bg-gray-50/50 focus:bg-white"
                  rows={4}
                  placeholder="Please provide a reason or feedback for this action..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  This comment will be added to the candidate's history.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setPendingAction(null);
                  setFeedbackComment("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedbackComment.trim()}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm
                  ${!feedbackComment.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : pendingAction.type === "archive"
                      ? "bg-red-600 hover:bg-red-700 hover:shadow-md"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                  }`}
              >
                {pendingAction.type === "archive" ? (
                  <Archive className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm {pendingAction.type === "archive" ? "Archive" : "Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALL CANDIDATE MODAL */}
      <CallCandidateModal
        isOpen={!!callModalCandidate}
        onClose={() => setCallModalCandidate(null)}
        candidate={callModalCandidate}
        jobId={jobId}
      />
    </div>

  );
}
