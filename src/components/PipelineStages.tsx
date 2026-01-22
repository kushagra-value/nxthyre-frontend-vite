import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Copy,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  MessageCircle,
  X,
  Send,
  Star,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Target,
  BarChart3,
  ChevronDown,
  File,
  Edit,
  Archive,
  Trash2,
  Code,
  MapPin,
  Github,
  Linkedin,
  Link,
  ArrowDownNarrowWide,
  LogOut,
  AlarmClock,
  Pencil,
  PencilLine,
  SearchCodeIcon,
} from "lucide-react";
import Header from "./Header";
import { creditService } from "../services/creditService";
import { useAuth } from "../hooks/useAuth";
import {
  pipelineStages,
  pipelineCandidates,
  PipelineCandidate,
} from "../data/pipelineData";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../services/api";
import { jobPostService } from "../services/jobPostService"; // Import jobPostService
import { showToast } from "../utils/toast";
import PipelinesSideCard from "./PipelinePage/PipelinesSideCard";
import { candidateService } from "../services/candidateService";
import TemplateSelector from "./TemplateSelector";
import toast from "react-hot-toast";

// Define interfaces for API responses
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
    gender?: string;
    is_recently_promoted?: boolean;
    is_active?: boolean;
    is_prevetted?: boolean;
    notice_period_days?: number;
    current_salary?: string;
    application_type?: string;
    total_experience?: number;
    profile_picture_url?: string;
    email?: string; // From premium_data
    phone?: string; // From premium_data
    premium_data_unlocked: boolean;
    premium_data_availability: {
      email: boolean;
      phone_number: boolean;
      resume_url: boolean;
      resume_text: boolean;
      linkedin_url: boolean;
      portfolio_url: boolean;
      dribble_username: boolean;
      behance_username: boolean;
      instagram_username: boolean;
      pinterest_username: boolean;
      twitter_username: boolean;
      github_username: boolean;
      all_emails: boolean;
      all_phone_numbers: boolean;
    };
    premium_data?: {
      email?: string;
      phone?: string;
      linkedin_url?: string | null;
      github_url?: string | null;
      twitter_url?: string | null;
      resume_url?: string;
      resume_text?: string;
      portfolio_url?: string | null;
      dribble_username?: string;
      behance_username?: string;
      instagram_username?: string;
      pinterest_username?: string;
      all_emails?: string[];
      all_phone_numbers?: string[];
    };
    // Add other nested arrays if needed (positions, educations, etc.)
    positions?: Array<{
      title: string;
      companyName: string;
      companyUrn: string;
      startDate: { month: number; year: number };
      endDate?: { month: number; year: number };
      isCurrent: boolean;
      location: string;
      description: string;
    }>;
    educations?: Array<{
      schoolName: string;
      degreeName: string;
      fieldOfStudy: string;
      startDate: { year: number };
      endDate: { year: number };
      activities: string;
      description: string;
      is_top_tier: boolean;
    }>;
    certifications?: Array<{
      name: string;
      authority: string;
      licenseNumber: string;
      startDate: { month: number; year: number };
      endDate?: { month: number; year: number };
      url: string;
    }>;
    skills?: Array<{
      name: string;
      endorsementCount: number;
    }>;
    endorsements?: Array<{
      endorser_name: string;
      endorser_title: string;
      endorser_profile_pic_url: string;
      skill_endorsed: string;
      endorser_company: string;
      message: string;
    }>;
    recommendations?: {
      received: Array<any>; // Expand as needed
      given: Array<any>;
    };
    notes?: Array<any>; // Expand as needed
    profilePicture?: {
      displayImageUrl: string;
      artifacts: Array<{
        width: number;
        height: number;
        url: string;
      }>;
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

// Define Category interface
interface Category {
  id: number;
  name: string;
  count: number;
}

interface Note {
  noteId: string;
  content: string;
  is_team_note: boolean;
  is_community_note: boolean;
  postedBy: string | null;
  posted_at: string;
  organisation: {
    orgId: string;
    orgName: string;
  };
}

interface PipelineStagesProps {
  onBack: () => void;
  onOpenLogoutModal: () => void;
  onSendInvite: () => void;
  deductCredits: () => Promise<void>;
  initialJobId?: number | null;
}

const PipelineStages: React.FC<PipelineStagesProps> = ({
  onBack,
  onOpenLogoutModal,
  onSendInvite,
  deductCredits,
  initialJobId,
}) => {
  const { user } = useAuthContext();
  const [selectedStage, setSelectedStage] = useState("Uncontacted");
  const [activeStageTab, setActiveStageTab] = useState("uncontacted");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<PipelineCandidate | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"prospect" | "stage">("prospect"); // New state for view mode
  const [showRevealDialog, setShowRevealDialog] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<{
    candidateId: string;
    onSuccess: (prem: any) => void;
  } | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);
  // New state for TemplateSelector
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  // States for API data
  const [stages, setStages] = useState<Stage[]>([]);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null); // Initially null

  // Dynamic category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<"pipeline" | "search">(
    "pipeline",
  ); // New state for toggle
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(
    null,
  );
  const [dropdownSearch, setDropdownSearch] = useState("");
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("relevance_desc");

  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const settingsPopupRef = useRef<HTMLDivElement>(null);

  const [cutoffScore, setCutoffScore] = useState("75");
  const [sendAfter, setSendAfter] = useState("24");
  const [sendVia, setSendVia] = useState("email");

  const [loadingStages, setLoadingStages] = useState(false);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);

  const handleSendInvite = async (applicationId: number) => {
    // Optionally deduct credits or handle other logic here
    // For now, just open TemplateSelector
    setShowTemplateSelector(true);
  };

  const handleBackFromTemplate = () => {
    setShowTemplateSelector(false);
  };

  const handleReveal = async (candidateId: string) => {
    try {
      const premResponse =
        await candidateService.revealPremiumData(candidateId);
      const updated = candidates.map((c) =>
        c.candidate.id === candidateId
          ? {
              ...c,
              candidate: {
                ...c.candidate,
                premium_data_unlocked: true,
                premium_data: premResponse.premium_data,
                social_links: {
                  linkedin: premResponse.premium_data.linkedin_url,
                  github: premResponse.premium_data.github_url,
                  portfolio: premResponse.premium_data.portfolio_url,
                  resume: premResponse.premium_data.resume_url,
                },
              },
            }
          : c,
      );
      setCandidates(updated);
      if (selectedCandidate?.candidate.id === candidateId) {
        fetchCandidateDetails(
          updated.find((c) => c.candidate.id === candidateId)?.id || 0,
        );
      }
      return premResponse.premium_data;
    } catch (error) {
      console.error("Error revealing premium data:", error);
      showToast.error("Failed to reveal premium data");
      throw error;
    }
  };

  const handleConfirmReveal = async () => {
    if (!pendingReveal) return;
    setRevealLoading(true);
    try {
      const prem = await handleReveal(pendingReveal.candidateId);
      await deductCredits();
      pendingReveal.onSuccess(prem);
    } catch (e) {
      // Error already handled in handleReveal
    } finally {
      setShowRevealDialog(false);
      setPendingReveal(null);
      setRevealLoading(false);
    }
  };

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const jobs = await jobPostService.getJobs();
        const mappedCategories: Category[] = jobs.map((job) => ({
          id: job.id,
          name: job.title,
          count: job.pipeline_candidate_count || 0,
        }));
        setCategories(mappedCategories);
        if (mappedCategories.length > 0) {
          const jobToSelect =
            initialJobId && mappedCategories.find((c) => c.id === initialJobId)
              ? initialJobId
              : mappedCategories[0].id;

          setActiveCategoryId(jobToSelect);
          setActiveJobId(jobToSelect);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch stages when activeJobId changes
  useEffect(() => {
    if (activeJobId !== null) {
      setLoadingStages(true);
      fetchStages(activeJobId)
        .catch((error) => {
          console.error("Error fetching stages:", error);
          setStages([]);
        })
        .finally(() => {
          setLoadingStages(false);
        });
    }
  }, [activeJobId]);

  useEffect(() => {
    if (viewMode === "prospect") {
      setSelectedStage("Uncontacted");
      setActiveStageTab("uncontacted");
    }
  }, [viewMode]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const allowedFiles = filesArray.filter((file) => {
        const fileName = file.name.toLowerCase();
        return (
          fileName.endsWith(".pdf") ||
          fileName.endsWith(".doc") ||
          fileName.endsWith(".docx")
        );
      });

      if (allowedFiles.length !== filesArray.length) {
        showToast.error("Only PDF, DOC, and DOCX files are allowed.");
      }

      setUploadFiles(allowedFiles.length > 0 ? allowedFiles : null);
    }
  };

  const handleUploadCandidates = async () => {
    if (!uploadFiles || uploadFiles.length === 0 || !activeJobId) {
      showToast.error("Please select PDF files and ensure a job is selected");
      return;
    }
    try {
      await jobPostService.uploadResumes(activeJobId, uploadFiles);
      toast.success(
        "Resumes queued for analysis. Refresh after 10 mins to check status.",
        {
          duration: 7000,
          position: "bottom-right",
          style: {
            background: "#0abc1eff",
            color: "#fff",
            fontWeight: "500",
          },
        },
      );
      setShowUploadModal(false);
      setUploadFiles(null);
      // Refresh candidates for Uncontacted stage
      fetchCandidates(activeJobId, "uncontacted");
      fetchStages(activeJobId);
    } catch (error) {
      showToast.error("Failed to upload candidates");
    }
  };

  // Handle cutoff score update
  const handleCutoffUpdate = async () => {
    if (!activeJobId) {
      showToast.error("No job selected");
      return;
    }
    const stageType =
      selectedStage === "Coding" ? "coding-contest" : "ai-interview";
    const score = parseInt(cutoffScore);
    if (isNaN(score) || score < 0 || score > 100) {
      showToast.error("Cutoff score must be between 0 and 100");
      return;
    }
    try {
      await jobPostService.updateCutoff(activeJobId, stageType, score);
      showToast.success(`${selectedStage} cutoff updated`);
    } catch (error) {
      showToast.error(`Failed to update ${selectedStage} cutoff`);
    }
  };

  // Fetch candidates when activeJobId or selectedStage changes
  useEffect(() => {
    if (activeJobId !== null && selectedStage) {
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-"),
      );
    }
  }, [activeJobId, selectedStage, sortBy]);

  useEffect(() => {
    const fetchCutoff = async () => {
      if (
        activeJobId &&
        ["AI Interview", "Coding Contest"].includes(selectedStage)
      ) {
        const stageType =
          selectedStage === "Coding Contest"
            ? "coding-contest"
            : "ai-interview";
        try {
          const data = await jobPostService.getCutOff(activeJobId, stageType);
          setCutoffScore(data.cutoff_score.toString());
        } catch (error) {
          console.error("Error fetching cutoff:", error);
          setCutoffScore("75"); // Fallback to default
        }
      }
    };
    fetchCutoff();
  }, [selectedStage, activeJobId]);

  // Body overflow handling for comments
  useEffect(() => {
    if (showComments) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showComments]);

  useEffect(() => {
    if (
      currentView === "search" &&
      searchQuery.length > 0 &&
      activeJobId !== null
    ) {
      const fetchSuggestions = async () => {
        try {
          const res = await jobPostService.searchAutosuggest(
            searchQuery,
            activeJobId,
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
  }, [searchQuery, currentView, activeJobId]);

  useEffect(() => {
    if (
      currentView === "search" &&
      searchQuery === "" &&
      activeJobId !== null &&
      selectedStage
    ) {
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-"),
      );
      setSelectedCandidate(null);
    }
  }, [searchQuery, currentView, activeJobId, selectedStage]);

  // API functions
  const fetchStages = async (jobId: number) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/stages/?job_id=${jobId}`,
      );
      const data: Stage[] = response.data;
      setStages(data.sort((a, b) => a.sort_order - b.sort_order));
      setStagesError(null);
      setSelectedStage(data[0]?.name || "Uncontacted");
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]);
      setStagesError("Failed to load pipeline stages");
    }
  };

  const fetchCandidates = async (jobId: number, stageSlug: string) => {
    let url = `/jobs/applications/?job_id=${jobId}&stage_slug=${stageSlug}${
      sortBy ? `&sort_by=${sortBy}` : ""
    }`;
    if (viewMode === "prospect" && activeStageTab === "inbox") {
      url = `/jobs/applications/replied-candidates/?job_id=${jobId}${
        sortBy ? `&sort_by=${sortBy}` : ""
      }`;
    }
    try {
      const response = await apiClient.get(url);
      const data: CandidateListItem[] = response.data;
      const mappedData = data.map((item) => ({
        ...item,
        candidate: {
          ...item.candidate,
          profilePicture: {
            displayImageUrl: item.candidate.profile_picture_url || "",
            artifacts: [],
          },
        },
      }));
      setCandidates(mappedData);
      handleCandidateSelect(mappedData[0]);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    }
  };

  const fetchCandidateDetails = async (applicationId: number) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/${applicationId}/`,
      );
      const data = response.data;
      const mappedCandidate: PipelineCandidate = mapCandidateDetails(data);
      setSelectedCandidate(mappedCandidate);
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      setSelectedCandidate(null);
    }
  };

  const moveCandidate = async (applicationId: number, stageId: number) => {
    try {
      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: stageId,
      });

      const targetStage = stages.find((stage) => stage.id === stageId);
      if (targetStage?.slug === "coding-contest") {
        const cand = candidates.find((c) => c.id === applicationId);
        if (cand && activeJobId !== null) {
          await candidateService.scheduleCodingAssessmentEmail(
            cand.candidate.id,
            activeJobId,
          );
        }
      }

      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-"),
        );
        fetchStages(activeJobId);
      }
    } catch (error) {
      console.error("Error moving candidate:", error);
    }
  };

  const archiveCandidate = async (applicationId: number) => {
    const archiveStage = stages.find((stage) => stage.slug === "archives");
    if (!archiveStage) return;
    try {
      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: archiveStage.id,
        status: "ARCHIVED",
        archive_reason: "Candidate archived from UI",
      });
      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-"),
        );
        fetchStages(activeJobId);
      }
    } catch (error) {
      console.error("Error archiving candidate:", error);
    }
  };

  const bulkMoveCandidates = async (
    applicationIds: number[],
    stageId: number,
  ) => {
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
            if (cand && activeJobId !== null) {
              await candidateService.scheduleCodingAssessmentEmail(
                cand.candidate.id,
                activeJobId,
              );
            }
          }),
        );
      }

      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-"),
        );
        fetchStages(activeJobId);
      }

      // handleConfirmReveal();
    } catch (error) {
      console.error("Error bulk moving candidates:", error);
    }
  };

  const shortlistCandidate = async (applicationId: number) => {
    try {
      // Find the "Shortlisted" stage
      const shortlistedStage = stages.find(
        (s) =>
          s.slug === "shortlisted" ||
          s.name.toLowerCase().includes("shortlist"),
      );

      if (!shortlistedStage) {
        showToast.error("Shortlisted stage not found");
        return;
      }

      // Move candidate to shortlisted stage
      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: shortlistedStage.id,
      });

      showToast.success("Candidate shortlisted successfully");

      // Refresh current view
      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-"),
        );
        fetchStages(activeJobId);
      }
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      showToast.error("Failed to shortlist candidate");
    }
  };

  const moveToAutopilot = async (applicationId: number) => {
    try {
      // Find the "Applied" stage (autopilot stage)
      const appliedStage = stages.find(
        (s) =>
          s.slug === "applied" ||
          s.name.toLowerCase().includes("applied") ||
          s.name === "Autopilot",
      );

      if (!appliedStage) {
        showToast.error("Applied / Autopilot stage not found");
        return;
      }

      // Move candidate to Applied stage
      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        current_stage: appliedStage.id,
      });

      // Optional: trigger any email/scheduling logic if needed (like in bulkMoveCandidates)
      // Example: if (appliedStage.slug === "applied") { ... schedule something ... }

      showToast.success("Candidate moved to Autopilot (Applied stage)");

      // Refresh current view
      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-"),
        );
        fetchStages(activeJobId);
      }
    } catch (error) {
      console.error("Error moving candidate to Autopilot:", error);
      showToast.error("Failed to move candidate to Autopilot");
    }
  };

  const handleSortSelect = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
  };

  const sortOptions = [
    { value: "relevance_desc", label: "Relevance" },
    { value: "experience_asc", label: "Experience(Asc)" },
    { value: "experience_desc", label: "Experience(Desc)" },
    { value: "notice_period_asc", label: "Notice Period(Asc)" },
    { value: "notice_period_desc", label: "Notice Period(Desc)" },
  ];

  const mapStageData = (
    slug: string,
    contextualDetails: any,
    aiInterviewReport?: any,
  ) => {
    switch (slug) {
      case "applied":
        return {
          appliedDate: "", // Placeholder; could be derived if application date is added to API
          resumeScore: 0, // Placeholder; no score provided in API
          skillsMatch:
            contextualDetails.match_analysis?.skill_match_percentage || "N/A",
          experienceMatch:
            contextualDetails.match_analysis?.experience_match_percentage ||
            "N/A",
          highlights:
            contextualDetails.match_analysis?.matched_skills?.join(", ") || "",
          notes: contextualDetails.candidate_notes || [],
          job_score_obj: contextualDetails.job_score_obj || {},
        };
      case "ai-interview":
      case "shortlisted":
      case "first-interview":
      case "hr-round":
      case "other-interview":
      case "offer-sent":
      case "offer-accepted":
        const report =
          aiInterviewReport || contextualDetails.ai_interview_report || {};
        return {
          interviewedDate: "", // Placeholder; no interview date provided in API
          resumeScore: Number(report.score?.resume) || 0,
          knowledgeScore: Number(report.score?.knowledge) || 0,
          technicalScore:
            typeof report.score?.technical === "number"
              ? Number(report.score?.technical)
              : 0,
          communicationScore: Number(report.score?.communication) || 0,
          integrityScore: Number(report.integrity_score) || 0,
          proctoring: {
            deviceUsage: Number(report.integrity_score?.device_usage) || 0,
            assistance: Number(report.integrity_score?.assistance) || 0,
            referenceMaterial:
              Number(report.integrity_score?.reference_materials) || 0,
            environment:
              Number(report.integrity_score?.environmental_assistance) || 0,
          },
          questions: report.QA_analysis || [],
          notes: contextualDetails.candidate_notes || [],
          feedbacks: report.feedbacks || {
            overallFeedback: "",
            communicationFeedback: "",
            resumeScoreReason: "",
            developmentAreas: [],
          },
          technicalSkills: report.technicalSkills || {
            weakSkills: [{ skill: "", rating: 0, reason: "" }],
            strongSkills: [{ skill: "", rating: 0, reason: "" }],
            skillsCoverage: "",
          },
          potentialRedFlags: report.potential_red_flags || [],
          job_score_obj: contextualDetails.job_score_obj || {},
        };
      default:
        return contextualDetails; // Fallback for other stages
    }
  };

  // Helper to map candidate details
  // Map API response to PipelineCandidate
  const mapCandidateDetails = (data: any): PipelineCandidate => {
    const candidateData = data.candidate;
    const stageProperty = data.current_stage_details.slug; // Use slug directly
    const mappedStageData = mapStageData(
      data.current_stage_details.slug,
      data.contextual_details,
      data.candidate.ai_interview_report,
    );

    const premiumData = candidateData.premium_data || {};

    return {
      id: data.id,
      candidate: {
        id: candidateData.id,
        full_name: candidateData.full_name,
        avatar: candidateData.avatar,
        headline: candidateData.headline,
        location: candidateData.location,
        linkedin_url: candidateData.linkedin_url,
        experience_years: candidateData.experience_years,
        experience_summary: candidateData.experience_summary,
        education_summary: candidateData.education_summary,
        notice_period_summary: candidateData.notice_period_summary,
        skills_list: candidateData.skills_list,
        social_links: candidateData.social_links,
        resume_url: candidateData.resume_url,
        current_salary_lpa: candidateData.current_salary_lpa,
        profile_summary: candidateData.profile_summary,
        profilePicture: {
          displayImageUrl: candidateData.profile_picture_url || "",
          artifacts: [],
        },
        gender: candidateData.gender,
        is_recently_promoted: candidateData.is_recently_promoted,
        is_background_verified: candidateData.is_background_verified,
        is_active: candidateData.is_active,
        is_prevetted: candidateData.is_prevetted,
        notice_period_days: candidateData.notice_period_days,
        current_salary: candidateData.current_salary,
        application_type: candidateData.application_type,
        total_experience: candidateData.total_experience,
        email: premiumData.email || "",
        phone: premiumData.phone || "",
        positions: candidateData.experience.map((exp: any) => ({
          title: exp.job_title,
          companyName: exp.company,
          companyUrn: "",
          startDate: exp.start_date
            ? {
                month: new Date(exp.start_date).getMonth() + 1,
                year: new Date(exp.start_date).getFullYear(),
              }
            : { month: 0, year: 0 },
          endDate: exp.end_date
            ? {
                month: new Date(exp.end_date).getMonth() + 1,
                year: new Date(exp.end_date).getFullYear(),
              }
            : undefined,
          isCurrent: exp.is_current,
          location: exp.location,
          description: exp.description,
        })),
        educations: candidateData.education.map((edu: any) => ({
          schoolName: edu.institution,
          degreeName: edu.degree,
          fieldOfStudy: edu.specialization,
          startDate: edu.start_date
            ? { year: new Date(edu.start_date).getFullYear() }
            : { year: 0 },
          endDate: edu.end_date
            ? { year: new Date(edu.end_date).getFullYear() }
            : { year: 0 },
          activities: "",
          description: "",
          is_top_tier: edu.is_top_tier || false,
        })),
        certifications: candidateData.certifications.map((cert: any) => ({
          name: cert.name,
          authority: cert.authority,
          licenseNumber: cert.licenseNumber,
          startDate: cert.issued_date
            ? {
                month: new Date(cert.issued_date).getMonth() + 1,
                year: new Date(cert.issued_date).getFullYear(),
              }
            : { month: 0, year: 0 },
          endDate: cert.valid_until
            ? {
                month: new Date(cert.valid_until).getMonth() + 1,
                year: new Date(cert.valid_until).getFullYear(),
              }
            : undefined,
          url: cert.url,
        })),
        skills: candidateData.skills_data.skills_mentioned.map(
          (skill: any) => ({
            name: skill.skill,
            endorsementCount: skill.number_of_endorsements,
          }),
        ),
        endorsements: candidateData.skills_data.endorsements.map(
          (end: any) => ({
            endorser_name: end.endorser_name,
            endorser_title: end.endorser_title,
            endorser_profile_pic_url: end.endorser_profile_pic_url,
            skill_endorsed: end.skill_endorsed,
            endorser_company: end.endorser_company,
            message: end.message,
          }),
        ),
        recommendations: {
          received: candidateData.recommendations,
          given: [],
        },
        notes: candidateData.notes,
        premium_data_unlocked: candidateData.premium_data_unlocked,
        premium_data_availability: candidateData.premium_data_availability,
        premium_data: {
          email: premiumData.email,
          phone: premiumData.phone,
          linkedin_url: premiumData.linkedin_url,
          github_url: premiumData.github_url,
          twitter_url: premiumData.twitter_url,
          resume_url: premiumData.resume_url,
          resume_text: premiumData.resume_text,
          portfolio_url: premiumData.portfolio_url,
          dribble_username: premiumData.dribble_username,
          behance_username: premiumData.behance_username,
          instagram_username: premiumData.instagram_username,
          pinterest_username: premiumData.pinterest_username,
          all_emails: premiumData.all_emails || [],
          all_phone_numbers: premiumData.all_phone_numbers || [],
        },
        stageData: {
          [stageProperty]: mappedStageData,
        },
      },
    };
  };

  const mapToComment = (
    note: any,
    index: number,
    type: "feedback" | "note",
  ) => ({
    id: `${type}-${index}`,
    text: note.comment || "",
    author: note.author || "Unknown",
    date: note.date ? new Date(note.date).toLocaleDateString() : "Unknown date",
    avatar: note.author ? note.author[0].toUpperCase() : "U",
    subject: note.subject || "", // Optional for feedback_notes
  });

  // Compute comments from selectedCandidate

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setViewMode("stage");
    setSelectedCandidate(null);
  };

  const handleCandidateSelect = (candidate: CandidateListItem) => {
    fetchCandidateDetails(candidate.id);
  };

  const handleCandidateCheckbox = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId],
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setNewComment("");
    }
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      Uncontacted: () => (
        <svg
          width="830"
          height="1388"
          viewBox="0 0 830 1388"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <rect width="830" height="1388" rx="10" fill="white" />
          <line
            x1="4.37114e-08"
            y1="137.5"
            x2="830"
            y2="137.5"
            stroke="#E2E2E2"
          />
          <path
            d="M71.4756 109.176C70.1631 109.176 69.0762 108.792 68.2148 108.024C67.3594 107.251 66.9316 106.275 66.9316 105.098H68.2676C68.2676 105.918 68.5693 106.592 69.1729 107.119C69.7764 107.641 70.5439 107.901 71.4756 107.901C72.3545 107.901 73.0811 107.688 73.6553 107.26C74.2295 106.826 74.5166 106.272 74.5166 105.599C74.5166 105.247 74.4463 104.937 74.3057 104.667C74.1709 104.397 73.9834 104.181 73.7432 104.017C73.5088 103.853 73.2334 103.703 72.917 103.568C72.6064 103.428 72.2725 103.316 71.915 103.234C71.5635 103.152 71.2002 103.059 70.8252 102.953C70.4502 102.848 70.084 102.745 69.7266 102.646C69.375 102.54 69.041 102.399 68.7246 102.224C68.4141 102.048 68.1387 101.849 67.8984 101.626C67.6641 101.403 67.4766 101.116 67.3359 100.765C67.2012 100.413 67.1338 100.015 67.1338 99.5693C67.1338 98.5967 67.5234 97.7969 68.3027 97.1699C69.0879 96.5371 70.0781 96.2207 71.2734 96.2207C72.5566 96.2207 73.5762 96.5693 74.332 97.2666C75.0879 97.958 75.4658 98.8281 75.4658 99.877H74.0859C74.0566 99.1855 73.7783 98.6201 73.251 98.1807C72.7295 97.7354 72.0586 97.5127 71.2383 97.5127C70.418 97.5127 69.75 97.7031 69.2344 98.084C68.7246 98.4648 68.4697 98.96 68.4697 99.5693C68.4697 99.9209 68.5547 100.226 68.7246 100.483C68.8945 100.741 69.1201 100.946 69.4014 101.099C69.6885 101.251 70.0166 101.386 70.3857 101.503C70.7549 101.614 71.1445 101.72 71.5547 101.819C71.9648 101.913 72.3721 102.016 72.7764 102.127C73.1865 102.238 73.5762 102.385 73.9453 102.566C74.3145 102.748 74.6396 102.965 74.9209 103.217C75.208 103.463 75.4365 103.791 75.6064 104.201C75.7764 104.605 75.8613 105.071 75.8613 105.599C75.8613 106.636 75.4453 107.491 74.6133 108.165C73.7871 108.839 72.7412 109.176 71.4756 109.176ZM86.083 104.359C86.083 104.623 86.0771 104.79 86.0654 104.86H78.7354C78.7998 105.798 79.1221 106.554 79.7021 107.128C80.2822 107.702 81.0293 107.989 81.9434 107.989C82.6465 107.989 83.25 107.831 83.7539 107.515C84.2637 107.192 84.5771 106.765 84.6943 106.231H86.0127C85.8428 107.116 85.3799 107.828 84.624 108.367C83.8682 108.906 82.9629 109.176 81.9082 109.176C80.6367 109.176 79.5732 108.736 78.7178 107.857C77.8682 106.979 77.4434 105.883 77.4434 104.57C77.4434 103.311 77.874 102.247 78.7354 101.38C79.5967 100.507 80.6484 100.07 81.8906 100.07C82.6699 100.07 83.3789 100.255 84.0176 100.624C84.6562 100.987 85.1602 101.497 85.5293 102.153C85.8984 102.81 86.083 103.545 86.083 104.359ZM78.7969 103.744H84.6768C84.6123 103.018 84.3164 102.423 83.7891 101.96C83.2676 101.491 82.6172 101.257 81.8379 101.257C81.0645 101.257 80.4023 101.482 79.8516 101.934C79.3008 102.385 78.9492 102.988 78.7969 103.744ZM89.3701 96.3965V109H88.0518V96.3965H89.3701ZM99.7412 104.359C99.7412 104.623 99.7354 104.79 99.7236 104.86H92.3936C92.458 105.798 92.7803 106.554 93.3604 107.128C93.9404 107.702 94.6875 107.989 95.6016 107.989C96.3047 107.989 96.9082 107.831 97.4121 107.515C97.9219 107.192 98.2354 106.765 98.3525 106.231H99.6709C99.501 107.116 99.0381 107.828 98.2822 108.367C97.5264 108.906 96.6211 109.176 95.5664 109.176C94.2949 109.176 93.2314 108.736 92.376 107.857C91.5264 106.979 91.1016 105.883 91.1016 104.57C91.1016 103.311 91.5322 102.247 92.3936 101.38C93.2549 100.507 94.3066 100.07 95.5488 100.07C96.3281 100.07 97.0371 100.255 97.6758 100.624C98.3145 100.987 98.8184 101.497 99.1875 102.153C99.5566 102.81 99.7412 103.545 99.7412 104.359ZM92.4551 103.744H98.335C98.2705 103.018 97.9746 102.423 97.4473 101.96C96.9258 101.491 96.2754 101.257 95.4961 101.257C94.7227 101.257 94.0605 101.482 93.5098 101.934C92.959 102.385 92.6074 102.988 92.4551 103.744ZM105.48 109.176C104.209 109.176 103.137 108.739 102.264 107.866C101.396 106.987 100.963 105.906 100.963 104.623C100.963 103.34 101.396 102.262 102.264 101.389C103.137 100.51 104.209 100.07 105.48 100.07C106.471 100.07 107.353 100.36 108.126 100.94C108.899 101.515 109.368 102.238 109.532 103.111H108.196C108.05 102.59 107.722 102.162 107.212 101.828C106.702 101.488 106.125 101.318 105.48 101.318C104.572 101.318 103.808 101.635 103.187 102.268C102.565 102.9 102.255 103.686 102.255 104.623C102.255 105.555 102.565 106.34 103.187 106.979C103.808 107.617 104.572 107.937 105.48 107.937C106.131 107.937 106.714 107.761 107.229 107.409C107.751 107.058 108.073 106.604 108.196 106.047H109.532C109.397 106.961 108.94 107.711 108.161 108.297C107.388 108.883 106.494 109.176 105.48 109.176ZM116.036 101.477H113.593V106.047C113.593 107.26 114.205 107.866 115.43 107.866C115.676 107.866 115.878 107.843 116.036 107.796V109C115.772 109.059 115.491 109.088 115.192 109.088C114.278 109.088 113.563 108.836 113.048 108.332C112.532 107.822 112.274 107.066 112.274 106.064V101.477H110.552V100.255H112.274V97.8379H113.593V100.255H116.036V101.477ZM131.03 109L129.809 105.924H123.85L122.619 109H121.187L126.223 96.3965H127.444L132.507 109H131.03ZM124.368 104.623H129.299L126.838 98.4004L124.368 104.623ZM135.319 96.3965V109H134.001V96.3965H135.319ZM139.151 96.3965V109H137.833V96.3965H139.151Z"
            fill="#818283"
          />
          <rect
            x="40.5"
            y="94.5"
            width="15"
            height="15"
            rx="2"
            fill="white"
            stroke="#818283"
          />
          <path
            d="M44 102L47 104.5L52.5 99"
            stroke="white"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="695.25"
            y="81.25"
            width="105.5"
            height="38.5"
            rx="6.75"
            fill="white"
          />
          <rect
            x="695.25"
            y="81.25"
            width="105.5"
            height="38.5"
            rx="6.75"
            stroke="#818283"
            stroke-width="0.5"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M711.477 95.0553C711.668 94.9915 711.879 95.0574 712 95.2188L713.875 97.7188C714.03 97.9259 713.988 98.2197 713.781 98.375C713.574 98.5304 713.28 98.4884 713.125 98.2813L712.094 96.9063V105.5C712.094 105.759 711.884 105.969 711.625 105.969C711.366 105.969 711.156 105.759 711.156 105.5V95.5C711.156 95.2983 711.285 95.1191 711.477 95.0553ZM703.031 98C703.031 97.7411 703.241 97.5313 703.5 97.5313H709.125C709.384 97.5313 709.594 97.7411 709.594 98C709.594 98.2589 709.384 98.4688 709.125 98.4688H703.5C703.241 98.4688 703.031 98.2589 703.031 98ZM704.281 101.125C704.281 100.866 704.491 100.656 704.75 100.656H709.125C709.384 100.656 709.594 100.866 709.594 101.125C709.594 101.384 709.384 101.594 709.125 101.594H704.75C704.491 101.594 704.281 101.384 704.281 101.125ZM705.531 104.25C705.531 103.991 705.741 103.781 706 103.781H709.125C709.384 103.781 709.594 103.991 709.594 104.25C709.594 104.509 709.384 104.719 709.125 104.719H706C705.741 104.719 705.531 104.509 705.531 104.25Z"
            fill="#818283"
          />
          <path
            d="M729.266 107H727.805L724.672 102.203H722.461V107H721.266V95.7969H725.312C726.245 95.7969 727.029 96.1016 727.664 96.7109C728.305 97.3151 728.625 98.0677 728.625 98.9688C728.625 99.8125 728.385 100.521 727.906 101.094C727.432 101.661 726.797 102.013 726 102.148L729.266 107ZM722.461 96.9531V101.047H725.281C725.896 101.047 726.404 100.852 726.805 100.461C727.206 100.07 727.406 99.5729 727.406 98.9688C727.406 98.3854 727.206 97.9036 726.805 97.5234C726.409 97.1432 725.901 96.9531 725.281 96.9531H722.461ZM737.398 102.875C737.398 103.109 737.393 103.258 737.383 103.32H730.867C730.924 104.154 731.211 104.826 731.727 105.336C732.242 105.846 732.906 106.102 733.719 106.102C734.344 106.102 734.88 105.961 735.328 105.68C735.781 105.393 736.06 105.013 736.164 104.539H737.336C737.185 105.326 736.773 105.958 736.102 106.438C735.43 106.917 734.625 107.156 733.688 107.156C732.557 107.156 731.612 106.766 730.852 105.984C730.096 105.203 729.719 104.229 729.719 103.062C729.719 101.943 730.102 100.997 730.867 100.227C731.633 99.4505 732.568 99.0625 733.672 99.0625C734.365 99.0625 734.995 99.2266 735.562 99.5547C736.13 99.8776 736.578 100.331 736.906 100.914C737.234 101.497 737.398 102.151 737.398 102.875ZM730.922 102.328H736.148C736.091 101.682 735.828 101.154 735.359 100.742C734.896 100.326 734.318 100.117 733.625 100.117C732.938 100.117 732.349 100.318 731.859 100.719C731.37 101.12 731.057 101.656 730.922 102.328ZM740.32 95.7969V107H739.148V95.7969H740.32ZM749.539 102.875C749.539 103.109 749.534 103.258 749.523 103.32H743.008C743.065 104.154 743.352 104.826 743.867 105.336C744.383 105.846 745.047 106.102 745.859 106.102C746.484 106.102 747.021 105.961 747.469 105.68C747.922 105.393 748.201 105.013 748.305 104.539H749.477C749.326 105.326 748.914 105.958 748.242 106.438C747.57 106.917 746.766 107.156 745.828 107.156C744.698 107.156 743.753 106.766 742.992 105.984C742.237 105.203 741.859 104.229 741.859 103.062C741.859 101.943 742.242 100.997 743.008 100.227C743.773 99.4505 744.708 99.0625 745.812 99.0625C746.505 99.0625 747.135 99.2266 747.703 99.5547C748.271 99.8776 748.719 100.331 749.047 100.914C749.375 101.497 749.539 102.151 749.539 102.875ZM743.062 102.328H748.289C748.232 101.682 747.969 101.154 747.5 100.742C747.036 100.326 746.458 100.117 745.766 100.117C745.078 100.117 744.49 100.318 744 100.719C743.51 101.12 743.198 101.656 743.062 102.328ZM757.859 99.2266L754.547 107H753.523L750.195 99.2266H751.461L754.031 105.531L756.578 99.2266H757.859ZM765.508 99.2266H766.68V107H765.508V105.195C765.221 105.82 764.805 106.305 764.258 106.648C763.716 106.987 763.078 107.156 762.344 107.156C761.641 107.156 760.992 106.977 760.398 106.617C759.81 106.258 759.344 105.766 759 105.141C758.656 104.516 758.484 103.833 758.484 103.094C758.484 102.354 758.656 101.674 759 101.055C759.344 100.435 759.81 99.9479 760.398 99.5938C760.992 99.2396 761.641 99.0625 762.344 99.0625C763.078 99.0625 763.719 99.2344 764.266 99.5781C764.812 99.9167 765.227 100.396 765.508 101.016V99.2266ZM762.562 106.055C763.411 106.055 764.115 105.776 764.672 105.219C765.229 104.656 765.508 103.948 765.508 103.094C765.508 102.245 765.229 101.542 764.672 100.984C764.115 100.427 763.411 100.148 762.562 100.148C761.74 100.148 761.044 100.435 760.477 101.008C759.914 101.581 759.633 102.276 759.633 103.094C759.633 103.927 759.914 104.63 760.477 105.203C761.044 105.771 761.74 106.055 762.562 106.055ZM772.742 99.0625C773.747 99.0625 774.544 99.375 775.133 100C775.727 100.62 776.023 101.461 776.023 102.523V107H774.852V102.633C774.852 101.888 774.635 101.292 774.203 100.844C773.776 100.396 773.208 100.172 772.5 100.172C771.771 100.172 771.185 100.398 770.742 100.852C770.305 101.299 770.086 101.893 770.086 102.633V107H768.914V99.2266H770.086V100.742C770.336 100.211 770.69 99.7995 771.148 99.5078C771.607 99.2109 772.138 99.0625 772.742 99.0625ZM781.812 107.156C780.682 107.156 779.729 106.768 778.953 105.992C778.182 105.211 777.797 104.25 777.797 103.109C777.797 101.969 778.182 101.01 778.953 100.234C779.729 99.4531 780.682 99.0625 781.812 99.0625C782.693 99.0625 783.477 99.3203 784.164 99.8359C784.852 100.346 785.268 100.99 785.414 101.766H784.227C784.096 101.302 783.805 100.922 783.352 100.625C782.898 100.323 782.385 100.172 781.812 100.172C781.005 100.172 780.326 100.453 779.773 101.016C779.221 101.578 778.945 102.276 778.945 103.109C778.945 103.938 779.221 104.635 779.773 105.203C780.326 105.771 781.005 106.055 781.812 106.055C782.391 106.055 782.909 105.898 783.367 105.586C783.831 105.273 784.117 104.87 784.227 104.375H785.414C785.294 105.188 784.888 105.854 784.195 106.375C783.508 106.896 782.714 107.156 781.812 107.156ZM794.258 102.875C794.258 103.109 794.253 103.258 794.242 103.32H787.727C787.784 104.154 788.07 104.826 788.586 105.336C789.102 105.846 789.766 106.102 790.578 106.102C791.203 106.102 791.74 105.961 792.188 105.68C792.641 105.393 792.919 105.013 793.023 104.539H794.195C794.044 105.326 793.633 105.958 792.961 106.438C792.289 106.917 791.484 107.156 790.547 107.156C789.417 107.156 788.471 106.766 787.711 105.984C786.956 105.203 786.578 104.229 786.578 103.062C786.578 101.943 786.961 100.997 787.727 100.227C788.492 99.4505 789.427 99.0625 790.531 99.0625C791.224 99.0625 791.854 99.2266 792.422 99.5547C792.99 99.8776 793.438 100.331 793.766 100.914C794.094 101.497 794.258 102.151 794.258 102.875ZM787.781 102.328H793.008C792.951 101.682 792.688 101.154 792.219 100.742C791.755 100.326 791.177 100.117 790.484 100.117C789.797 100.117 789.208 100.318 788.719 100.719C788.229 101.12 787.917 101.656 787.781 102.328Z"
            fill="#818283"
          />
          <rect
            x="600.25"
            y="81.25"
            width="83.0036"
            height="38.5"
            rx="6.75"
            fill="white"
          />
          <rect
            x="600.25"
            y="81.25"
            width="83.0036"
            height="38.5"
            rx="6.75"
            stroke="#818283"
            stroke-width="0.5"
          />
          <path
            d="M612.001 99.0017C613.658 99.0017 615.002 97.6582 615.002 96.0008C615.002 94.3435 613.658 93 612.001 93C610.344 93 609 94.3435 609 96.0008C609 97.6582 610.344 99.0017 612.001 99.0017Z"
            stroke="#818283"
          />
          <path
            d="M614.252 101.495C613.557 101.337 612.798 101.25 612.002 101.25C608.687 101.25 606 102.761 606 104.626C606 106.49 606 108.002 612.002 108.002C616.268 108.002 617.502 107.238 617.858 106.126"
            stroke="#818283"
          />
          <path
            d="M616.503 106.502C618.16 106.502 619.504 105.158 619.504 103.501C619.504 101.844 618.16 100.5 616.503 100.5C614.845 100.5 613.502 101.844 613.502 103.501C613.502 105.158 614.845 106.502 616.503 106.502Z"
            stroke="#818283"
          />
          <path
            d="M616.504 102.496V104.497"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M615.502 103.504H617.503"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M629.027 107.156C628.225 107.156 627.499 106.969 626.848 106.594C626.197 106.214 625.686 105.693 625.316 105.031C624.952 104.365 624.77 103.622 624.77 102.805V95.7969H625.965V102.805C625.965 103.716 626.254 104.477 626.832 105.086C627.415 105.69 628.147 105.992 629.027 105.992C629.902 105.992 630.629 105.69 631.207 105.086C631.79 104.477 632.082 103.716 632.082 102.805V95.7969H633.293V102.805C633.293 103.628 633.108 104.37 632.738 105.031C632.374 105.693 631.866 106.214 631.215 106.594C630.564 106.969 629.835 107.156 629.027 107.156ZM640.02 99.0625C640.723 99.0625 641.368 99.2422 641.957 99.6016C642.551 99.9557 643.02 100.445 643.363 101.07C643.707 101.69 643.879 102.37 643.879 103.109C643.879 103.849 643.707 104.531 643.363 105.156C643.02 105.776 642.551 106.266 641.957 106.625C641.368 106.979 640.723 107.156 640.02 107.156C639.285 107.156 638.645 106.987 638.098 106.648C637.556 106.305 637.142 105.82 636.855 105.195V109.93H635.684V99.2266H636.855V101.016C637.137 100.396 637.551 99.9167 638.098 99.5781C638.645 99.2344 639.285 99.0625 640.02 99.0625ZM639.801 106.055C640.624 106.055 641.316 105.771 641.879 105.203C642.441 104.635 642.723 103.938 642.723 103.109C642.723 102.281 642.441 101.581 641.879 101.008C641.316 100.435 640.624 100.148 639.801 100.148C638.952 100.148 638.249 100.43 637.691 100.992C637.134 101.549 636.855 102.255 636.855 103.109C636.855 103.958 637.134 104.661 637.691 105.219C638.249 105.776 638.952 106.055 639.801 106.055ZM646.777 95.7969V107H645.605V95.7969H646.777ZM649.473 100.234C650.249 99.4531 651.202 99.0625 652.332 99.0625C653.462 99.0625 654.415 99.4531 655.191 100.234C655.973 101.01 656.363 101.969 656.363 103.109C656.363 104.25 655.973 105.211 655.191 105.992C654.415 106.768 653.462 107.156 652.332 107.156C651.202 107.156 650.249 106.768 649.473 105.992C648.702 105.211 648.316 104.25 648.316 103.109C648.316 101.969 648.702 101.01 649.473 100.234ZM652.332 100.172C651.525 100.172 650.845 100.453 650.293 101.016C649.741 101.578 649.465 102.276 649.465 103.109C649.465 103.938 649.741 104.635 650.293 105.203C650.845 105.771 651.525 106.055 652.332 106.055C653.139 106.055 653.822 105.771 654.379 105.203C654.936 104.63 655.215 103.932 655.215 103.109C655.215 102.281 654.936 101.586 654.379 101.023C653.827 100.456 653.145 100.172 652.332 100.172ZM664.449 99.2266H665.621V107H664.449V105.195C664.163 105.82 663.746 106.305 663.199 106.648C662.658 106.987 662.02 107.156 661.285 107.156C660.582 107.156 659.934 106.977 659.34 106.617C658.751 106.258 658.285 105.766 657.941 105.141C657.598 104.516 657.426 103.833 657.426 103.094C657.426 102.354 657.598 101.674 657.941 101.055C658.285 100.435 658.751 99.9479 659.34 99.5938C659.934 99.2396 660.582 99.0625 661.285 99.0625C662.02 99.0625 662.66 99.2344 663.207 99.5781C663.754 99.9167 664.168 100.396 664.449 101.016V99.2266ZM661.504 106.055C662.353 106.055 663.056 105.776 663.613 105.219C664.171 104.656 664.449 103.948 664.449 103.094C664.449 102.245 664.171 101.542 663.613 100.984C663.056 100.427 662.353 100.148 661.504 100.148C660.681 100.148 659.986 100.435 659.418 101.008C658.855 101.581 658.574 102.276 658.574 103.094C658.574 103.927 658.855 104.63 659.418 105.203C659.986 105.771 660.681 106.055 661.504 106.055ZM674.418 95.7969H675.59V107H674.418V105.195C674.132 105.82 673.715 106.305 673.168 106.648C672.626 106.987 671.988 107.156 671.254 107.156C670.551 107.156 669.902 106.977 669.309 106.617C668.72 106.258 668.254 105.766 667.91 105.141C667.566 104.516 667.395 103.833 667.395 103.094C667.395 102.354 667.566 101.674 667.91 101.055C668.254 100.435 668.72 99.9479 669.309 99.5938C669.902 99.2396 670.551 99.0625 671.254 99.0625C671.988 99.0625 672.629 99.2344 673.176 99.5781C673.723 99.9167 674.137 100.396 674.418 101.016V95.7969ZM671.473 106.055C672.322 106.055 673.025 105.776 673.582 105.219C674.139 104.656 674.418 103.948 674.418 103.094C674.418 102.245 674.139 101.542 673.582 100.984C673.025 100.427 672.322 100.148 671.473 100.148C670.65 100.148 669.954 100.435 669.387 101.008C668.824 101.581 668.543 102.276 668.543 103.094C668.543 103.927 668.824 104.63 669.387 105.203C669.954 105.771 670.65 106.055 671.473 106.055Z"
            fill="#818283"
          />
          <line
            x1="8.74228e-08"
            y1="62"
            x2="830"
            y2="62.0001"
            stroke="#E2E2E2"
            stroke-width="2"
          />
          <rect x="40" y="61" width="139" height="2" fill="#0F47F2" />
          <path
            d="M49.6064 44.7695C48.6865 45.707 47.5293 46.1758 46.1348 46.1758C44.7402 46.1758 43.5801 45.707 42.6543 44.7695C41.7344 43.832 41.2744 42.6572 41.2744 41.2451V33.3965H43.0234V41.2451C43.0234 42.1768 43.3164 42.9502 43.9023 43.5654C44.4941 44.1807 45.2383 44.4883 46.1348 44.4883C47.0312 44.4883 47.7754 44.1807 48.3672 43.5654C48.959 42.9502 49.2549 42.1768 49.2549 41.2451V33.3965H50.9951V41.2451C50.9951 42.6572 50.5322 43.832 49.6064 44.7695ZM57.9033 37.0352C59.0342 37.0352 59.9277 37.3896 60.584 38.0986C61.2461 38.8076 61.5771 39.7686 61.5771 40.9814V46H59.916V41.1572C59.916 40.3896 59.6992 39.7744 59.2656 39.3115C58.832 38.8486 58.252 38.6172 57.5254 38.6172C56.7871 38.6172 56.1982 38.8486 55.7588 39.3115C55.3193 39.7744 55.0996 40.3896 55.0996 41.1572V46H53.4209V37.2197H55.0996V38.749C55.3809 38.2041 55.7617 37.7822 56.2422 37.4834C56.7285 37.1846 57.2822 37.0352 57.9033 37.0352ZM67.9668 46.1758C67.1289 46.1758 66.3613 45.9766 65.6641 45.5781C64.9727 45.1797 64.4277 44.6318 64.0293 43.9346C63.6309 43.2373 63.4316 42.4668 63.4316 41.623C63.4316 40.3281 63.8682 39.2412 64.7412 38.3623C65.6143 37.4775 66.6895 37.0352 67.9668 37.0352C68.9922 37.0352 69.8975 37.3428 70.6826 37.958C71.4736 38.5674 71.9424 39.3291 72.0889 40.2432H70.3926C70.2637 39.7744 69.9707 39.3877 69.5137 39.083C69.0566 38.7725 68.541 38.6172 67.9668 38.6172C67.1406 38.6172 66.4463 38.9043 65.8838 39.4785C65.3271 40.0527 65.0488 40.7676 65.0488 41.623C65.0488 42.4609 65.3271 43.167 65.8838 43.7412C66.4463 44.3096 67.1406 44.5938 67.9668 44.5938C68.5527 44.5938 69.0771 44.4385 69.54 44.1279C70.0029 43.8115 70.293 43.4043 70.4102 42.9062H72.0889C71.96 43.8613 71.5029 44.6465 70.7178 45.2617C69.9326 45.8711 69.0156 46.1758 67.9668 46.1758ZM77.8105 37.0352C78.6484 37.0352 79.4131 37.2373 80.1045 37.6416C80.7959 38.04 81.3408 38.5908 81.7393 39.2939C82.1436 39.9971 82.3457 40.7734 82.3457 41.623C82.3457 42.9062 81.9062 43.9873 81.0273 44.8662C80.1543 45.7393 79.082 46.1758 77.8105 46.1758C76.9727 46.1758 76.2051 45.9766 75.5078 45.5781C74.8164 45.1797 74.2715 44.6318 73.873 43.9346C73.4746 43.2373 73.2754 42.4668 73.2754 41.623C73.2754 40.3281 73.7119 39.2412 74.585 38.3623C75.458 37.4775 76.5332 37.0352 77.8105 37.0352ZM77.8105 38.6172C76.9844 38.6172 76.29 38.9043 75.7275 39.4785C75.1709 40.0527 74.8926 40.7676 74.8926 41.623C74.8926 42.4609 75.1709 43.167 75.7275 43.7412C76.29 44.3096 76.9844 44.5938 77.8105 44.5938C78.6309 44.5938 79.3223 44.3066 79.8848 43.7324C80.4473 43.1582 80.7285 42.4551 80.7285 41.623C80.7285 40.7676 80.4473 40.0527 79.8848 39.4785C79.3223 38.9043 78.6309 38.6172 77.8105 38.6172ZM88.665 37.0352C89.7959 37.0352 90.6895 37.3896 91.3457 38.0986C92.0078 38.8076 92.3389 39.7686 92.3389 40.9814V46H90.6777V41.1572C90.6777 40.3896 90.4609 39.7744 90.0273 39.3115C89.5938 38.8486 89.0137 38.6172 88.2871 38.6172C87.5488 38.6172 86.96 38.8486 86.5205 39.3115C86.0811 39.7744 85.8613 40.3896 85.8613 41.1572V46H84.1826V37.2197H85.8613V38.749C86.1426 38.2041 86.5234 37.7822 87.0039 37.4834C87.4902 37.1846 88.0439 37.0352 88.665 37.0352ZM99.0449 38.8018H96.6719V42.8535C96.6719 43.9785 97.2578 44.541 98.4297 44.541C98.6816 44.541 98.8867 44.5176 99.0449 44.4707V46C98.7754 46.0703 98.4561 46.1055 98.0869 46.1055C97.1377 46.1055 96.3877 45.833 95.8369 45.2881C95.2861 44.7373 95.0107 43.9375 95.0107 42.8887V38.8018H93.3057V37.2197H95.0107V34.8379H96.6719V37.2197H99.0449V38.8018ZM107.377 37.2197H109.038V46H107.377V44.1982C107.049 44.8369 106.601 45.3262 106.032 45.666C105.464 46.0059 104.796 46.1758 104.028 46.1758C102.845 46.1758 101.837 45.7334 101.005 44.8486C100.179 43.958 99.7656 42.877 99.7656 41.6055C99.7656 40.334 100.179 39.2559 101.005 38.3711C101.837 37.4805 102.845 37.0352 104.028 37.0352C104.796 37.0352 105.464 37.2051 106.032 37.5449C106.601 37.8848 107.049 38.374 107.377 39.0127V37.2197ZM104.371 44.5938C105.238 44.5938 105.956 44.3125 106.524 43.75C107.093 43.1875 107.377 42.4727 107.377 41.6055C107.377 40.7383 107.093 40.0234 106.524 39.4609C105.956 38.8984 105.238 38.6172 104.371 38.6172C103.539 38.6172 102.833 38.9072 102.253 39.4873C101.673 40.0674 101.383 40.7734 101.383 41.6055C101.383 42.4375 101.673 43.1436 102.253 43.7236C102.833 44.3037 103.539 44.5938 104.371 44.5938ZM115.41 46.1758C114.572 46.1758 113.805 45.9766 113.107 45.5781C112.416 45.1797 111.871 44.6318 111.473 43.9346C111.074 43.2373 110.875 42.4668 110.875 41.623C110.875 40.3281 111.312 39.2412 112.185 38.3623C113.058 37.4775 114.133 37.0352 115.41 37.0352C116.436 37.0352 117.341 37.3428 118.126 37.958C118.917 38.5674 119.386 39.3291 119.532 40.2432H117.836C117.707 39.7744 117.414 39.3877 116.957 39.083C116.5 38.7725 115.984 38.6172 115.41 38.6172C114.584 38.6172 113.89 38.9043 113.327 39.4785C112.771 40.0527 112.492 40.7676 112.492 41.623C112.492 42.4609 112.771 43.167 113.327 43.7412C113.89 44.3096 114.584 44.5938 115.41 44.5938C115.996 44.5938 116.521 44.4385 116.983 44.1279C117.446 43.8115 117.736 43.4043 117.854 42.9062H119.532C119.403 43.8613 118.946 44.6465 118.161 45.2617C117.376 45.8711 116.459 46.1758 115.41 46.1758ZM126.186 38.8018H123.812V42.8535C123.812 43.9785 124.398 44.541 125.57 44.541C125.822 44.541 126.027 44.5176 126.186 44.4707V46C125.916 46.0703 125.597 46.1055 125.228 46.1055C124.278 46.1055 123.528 45.833 122.978 45.2881C122.427 44.7373 122.151 43.9375 122.151 42.8887V38.8018H120.446V37.2197H122.151V34.8379H123.812V37.2197H126.186V38.8018ZM135.634 41.3945C135.634 41.6465 135.622 41.8662 135.599 42.0537H128.541C128.641 42.8564 128.948 43.4951 129.464 43.9697C129.985 44.4443 130.65 44.6816 131.459 44.6816C132.074 44.6816 132.604 44.5439 133.05 44.2686C133.495 43.9873 133.773 43.6152 133.885 43.1523H135.546C135.382 44.0664 134.919 44.7988 134.157 45.3496C133.396 45.9004 132.479 46.1758 131.406 46.1758C130.129 46.1758 129.06 45.7363 128.198 44.8574C127.337 43.9727 126.906 42.877 126.906 41.5703C126.906 40.7383 127.103 39.9766 127.495 39.2852C127.888 38.5879 128.427 38.04 129.112 37.6416C129.804 37.2373 130.562 37.0352 131.389 37.0352C132.578 37.0352 133.583 37.4482 134.403 38.2744C135.224 39.1006 135.634 40.1406 135.634 41.3945ZM128.594 40.6562H133.832C133.762 40.0352 133.495 39.5283 133.032 39.1357C132.575 38.7432 132.004 38.5469 131.318 38.5469C130.627 38.5469 130.038 38.7344 129.552 39.1094C129.065 39.4844 128.746 40 128.594 40.6562ZM144.379 33.3965H146.04V46H144.379V44.1982C144.051 44.8369 143.603 45.3262 143.034 45.666C142.466 46.0059 141.798 46.1758 141.03 46.1758C139.847 46.1758 138.839 45.7334 138.007 44.8486C137.181 43.958 136.768 42.877 136.768 41.6055C136.768 40.334 137.181 39.2559 138.007 38.3711C138.839 37.4805 139.847 37.0352 141.03 37.0352C141.798 37.0352 142.466 37.2051 143.034 37.5449C143.603 37.8848 144.051 38.374 144.379 39.0127V33.3965ZM141.373 44.5938C142.24 44.5938 142.958 44.3125 143.526 43.75C144.095 43.1875 144.379 42.4727 144.379 41.6055C144.379 40.7383 144.095 40.0234 143.526 39.4609C142.958 38.8984 142.24 38.6172 141.373 38.6172C140.541 38.6172 139.835 38.9072 139.255 39.4873C138.675 40.0674 138.385 40.7734 138.385 41.6055C138.385 42.4375 138.675 43.1436 139.255 43.7236C139.835 44.3037 140.541 44.5938 141.373 44.5938Z"
            fill="#0F47F2"
          />
          <rect x="153" y="25" width="26" height="26" rx="13" fill="#ECF1FF" />
          <path
            d="M158.615 44V43.0225L162.197 39.4473C162.73 38.9141 163.113 38.4652 163.346 38.1006C163.583 37.736 163.701 37.3691 163.701 37C163.701 36.526 163.53 36.1341 163.188 35.8242C162.851 35.5143 162.423 35.3594 161.903 35.3594C161.297 35.3594 160.814 35.5508 160.454 35.9336C160.099 36.3118 159.93 36.8177 159.948 37.4512H158.588C158.57 36.7812 158.702 36.1888 158.984 35.6738C159.271 35.1543 159.67 34.7555 160.181 34.4775C160.696 34.1995 161.279 34.0605 161.931 34.0605C162.842 34.0605 163.594 34.334 164.187 34.8809C164.784 35.4277 165.082 36.125 165.082 36.9727C165.082 37.515 164.918 38.055 164.59 38.5928C164.266 39.126 163.792 39.6911 163.168 40.2881L160.755 42.7012H165.185V44H158.615ZM169.238 44.1367C168.345 44.1367 167.584 43.8906 166.955 43.3984C166.326 42.9017 165.978 42.2432 165.909 41.4229H167.256C167.356 41.8467 167.584 42.1885 167.939 42.4482C168.299 42.708 168.732 42.8379 169.238 42.8379C169.799 42.8379 170.271 42.6488 170.653 42.2705C171.036 41.8877 171.228 41.4229 171.228 40.876C171.228 40.3018 171.036 39.8232 170.653 39.4404C170.271 39.0531 169.799 38.8594 169.238 38.8594C168.896 38.8594 168.575 38.9186 168.274 39.0371C167.974 39.1556 167.732 39.3174 167.55 39.5225H166.374L166.832 34.1973H171.986V35.4756H168.035L167.755 38.2715C167.937 38.1074 168.179 37.9798 168.479 37.8887C168.785 37.793 169.099 37.7451 169.423 37.7451C170.339 37.7451 171.1 38.0368 171.706 38.6201C172.312 39.2035 172.615 39.9645 172.615 40.9033C172.615 41.4958 172.465 42.0404 172.164 42.5371C171.863 43.0339 171.453 43.4258 170.934 43.7129C170.419 43.9954 169.854 44.1367 169.238 44.1367Z"
            fill="#0F47F2"
          />
          <path
            d="M221.424 32.3965H222.769V45H221.424V32.3965ZM229.765 36.0703C230.896 36.0703 231.792 36.4219 232.454 37.125C233.122 37.8223 233.456 38.7686 233.456 39.9639V45H232.138V40.0869C232.138 39.249 231.895 38.5781 231.408 38.0742C230.928 37.5703 230.289 37.3184 229.492 37.3184C228.672 37.3184 228.013 37.5732 227.515 38.083C227.022 38.5869 226.776 39.2549 226.776 40.0869V45H225.458V36.2549H226.776V37.96C227.058 37.3623 227.456 36.8994 227.972 36.5713C228.487 36.2373 229.085 36.0703 229.765 36.0703ZM243.098 36.2549L239.371 45H238.22L234.476 36.2549H235.899L238.791 43.3477L241.656 36.2549H243.098ZM245.321 32.4316C245.573 32.4316 245.796 32.5254 245.989 32.7129C246.183 32.9004 246.279 33.1201 246.279 33.3721C246.279 33.6299 246.183 33.8555 245.989 34.0488C245.796 34.2363 245.573 34.3301 245.321 34.3301C245.063 34.3301 244.844 34.2363 244.662 34.0488C244.48 33.8613 244.39 33.6357 244.39 33.3721C244.39 33.1201 244.48 32.9004 244.662 32.7129C244.844 32.5254 245.063 32.4316 245.321 32.4316ZM244.653 36.2549H245.972V45H244.653V36.2549ZM252.985 37.4766H250.542V42.0469C250.542 43.2598 251.154 43.8662 252.379 43.8662C252.625 43.8662 252.827 43.8428 252.985 43.7959V45C252.722 45.0586 252.44 45.0879 252.142 45.0879C251.228 45.0879 250.513 44.8359 249.997 44.332C249.481 43.8223 249.224 43.0664 249.224 42.0645V37.4766H247.501V36.2549H249.224V33.8379H250.542V36.2549H252.985V37.4766ZM262.354 40.3594C262.354 40.623 262.349 40.79 262.337 40.8604H255.007C255.071 41.7979 255.394 42.5537 255.974 43.1279C256.554 43.7021 257.301 43.9893 258.215 43.9893C258.918 43.9893 259.521 43.8311 260.025 43.5146C260.535 43.1924 260.849 42.7646 260.966 42.2314H262.284C262.114 43.1162 261.651 43.8281 260.896 44.3672C260.14 44.9062 259.234 45.1758 258.18 45.1758C256.908 45.1758 255.845 44.7363 254.989 43.8574C254.14 42.9785 253.715 41.8828 253.715 40.5703C253.715 39.3105 254.146 38.2471 255.007 37.3799C255.868 36.5068 256.92 36.0703 258.162 36.0703C258.941 36.0703 259.65 36.2549 260.289 36.624C260.928 36.9873 261.432 37.4971 261.801 38.1533C262.17 38.8096 262.354 39.5449 262.354 40.3594ZM255.068 39.7441H260.948C260.884 39.0176 260.588 38.4229 260.061 37.96C259.539 37.4912 258.889 37.2568 258.109 37.2568C257.336 37.2568 256.674 37.4824 256.123 37.9336C255.572 38.3848 255.221 38.9883 255.068 39.7441ZM271.478 32.3965H272.796V45H271.478V42.9697C271.155 43.6729 270.687 44.2178 270.071 44.6045C269.462 44.9854 268.744 45.1758 267.918 45.1758C267.127 45.1758 266.397 44.9736 265.729 44.5693C265.067 44.165 264.543 43.6113 264.156 42.9082C263.77 42.2051 263.576 41.4375 263.576 40.6055C263.576 39.7734 263.77 39.0088 264.156 38.3115C264.543 37.6143 265.067 37.0664 265.729 36.668C266.397 36.2695 267.127 36.0703 267.918 36.0703C268.744 36.0703 269.465 36.2637 270.08 36.6504C270.695 37.0312 271.161 37.5703 271.478 38.2676V32.3965ZM268.164 43.9365C269.119 43.9365 269.91 43.623 270.537 42.9961C271.164 42.3633 271.478 41.5664 271.478 40.6055C271.478 39.6504 271.164 38.8594 270.537 38.2324C269.91 37.6055 269.119 37.292 268.164 37.292C267.238 37.292 266.456 37.6143 265.817 38.2588C265.185 38.9033 264.868 39.6855 264.868 40.6055C264.868 41.543 265.185 42.334 265.817 42.9785C266.456 43.6172 267.238 43.9365 268.164 43.9365Z"
            fill="#4B5563"
          />
          <rect x="280" y="25" width="26" height="26" rx="13" fill="#F0F0F0" />
          <path
            d="M285.615 44V43.0225L289.197 39.4473C289.73 38.9141 290.113 38.4652 290.346 38.1006C290.583 37.736 290.701 37.3691 290.701 37C290.701 36.526 290.53 36.1341 290.188 35.8242C289.851 35.5143 289.423 35.3594 288.903 35.3594C288.297 35.3594 287.814 35.5508 287.454 35.9336C287.099 36.3118 286.93 36.8177 286.948 37.4512H285.588C285.57 36.7812 285.702 36.1888 285.984 35.6738C286.271 35.1543 286.67 34.7555 287.181 34.4775C287.696 34.1995 288.279 34.0605 288.931 34.0605C289.842 34.0605 290.594 34.334 291.187 34.8809C291.784 35.4277 292.082 36.125 292.082 36.9727C292.082 37.515 291.918 38.055 291.59 38.5928C291.266 39.126 290.792 39.6911 290.168 40.2881L287.755 42.7012H292.185V44H285.615ZM296.238 44.1367C295.345 44.1367 294.584 43.8906 293.955 43.3984C293.326 42.9017 292.978 42.2432 292.909 41.4229H294.256C294.356 41.8467 294.584 42.1885 294.939 42.4482C295.299 42.708 295.732 42.8379 296.238 42.8379C296.799 42.8379 297.271 42.6488 297.653 42.2705C298.036 41.8877 298.228 41.4229 298.228 40.876C298.228 40.3018 298.036 39.8232 297.653 39.4404C297.271 39.0531 296.799 38.8594 296.238 38.8594C295.896 38.8594 295.575 38.9186 295.274 39.0371C294.974 39.1556 294.732 39.3174 294.55 39.5225H293.374L293.832 34.1973H298.986V35.4756H295.035L294.755 38.2715C294.937 38.1074 295.179 37.9798 295.479 37.8887C295.785 37.793 296.099 37.7451 296.423 37.7451C297.339 37.7451 298.1 38.0368 298.706 38.6201C299.312 39.2035 299.615 39.9645 299.615 40.9033C299.615 41.4958 299.465 42.0404 299.164 42.5371C298.863 43.0339 298.453 43.4258 297.934 43.7129C297.419 43.9954 296.854 44.1367 296.238 44.1367Z"
            fill="#4B5563"
          />
          <g filter="url(#filter0_d_4500_3993)">
            <rect x="31" y="156" width="770" height="268" rx="6" fill="white" />
          </g>
          <path
            d="M218.867 253.156C217.701 253.156 216.734 252.815 215.969 252.133C215.208 251.445 214.828 250.578 214.828 249.531H216.016C216.016 250.26 216.284 250.859 216.82 251.328C217.357 251.792 218.039 252.023 218.867 252.023C219.648 252.023 220.294 251.833 220.805 251.453C221.315 251.068 221.57 250.576 221.57 249.977C221.57 249.664 221.508 249.388 221.383 249.148C221.263 248.909 221.096 248.716 220.883 248.57C220.674 248.424 220.43 248.292 220.148 248.172C219.872 248.047 219.576 247.948 219.258 247.875C218.945 247.802 218.622 247.719 218.289 247.625C217.956 247.531 217.63 247.44 217.312 247.352C217 247.258 216.703 247.133 216.422 246.977C216.146 246.82 215.901 246.643 215.688 246.445C215.479 246.247 215.312 245.992 215.188 245.68C215.068 245.367 215.008 245.013 215.008 244.617C215.008 243.753 215.354 243.042 216.047 242.484C216.745 241.922 217.625 241.641 218.688 241.641C219.828 241.641 220.734 241.951 221.406 242.57C222.078 243.185 222.414 243.958 222.414 244.891H221.188C221.161 244.276 220.914 243.773 220.445 243.383C219.982 242.987 219.385 242.789 218.656 242.789C217.927 242.789 217.333 242.958 216.875 243.297C216.422 243.635 216.195 244.076 216.195 244.617C216.195 244.93 216.271 245.201 216.422 245.43C216.573 245.659 216.773 245.841 217.023 245.977C217.279 246.112 217.57 246.232 217.898 246.336C218.227 246.435 218.573 246.529 218.938 246.617C219.302 246.701 219.664 246.792 220.023 246.891C220.388 246.99 220.734 247.12 221.062 247.281C221.391 247.443 221.68 247.635 221.93 247.859C222.185 248.078 222.388 248.37 222.539 248.734C222.69 249.094 222.766 249.508 222.766 249.977C222.766 250.898 222.396 251.659 221.656 252.258C220.922 252.857 219.992 253.156 218.867 253.156ZM225.328 246.234C226.104 245.453 227.057 245.062 228.188 245.062C229.318 245.062 230.271 245.453 231.047 246.234C231.828 247.01 232.219 247.969 232.219 249.109C232.219 250.25 231.828 251.211 231.047 251.992C230.271 252.768 229.318 253.156 228.188 253.156C227.057 253.156 226.104 252.768 225.328 251.992C224.557 251.211 224.172 250.25 224.172 249.109C224.172 247.969 224.557 247.01 225.328 246.234ZM228.188 246.172C227.38 246.172 226.701 246.453 226.148 247.016C225.596 247.578 225.32 248.276 225.32 249.109C225.32 249.938 225.596 250.635 226.148 251.203C226.701 251.771 227.38 252.055 228.188 252.055C228.995 252.055 229.677 251.771 230.234 251.203C230.792 250.63 231.07 249.932 231.07 249.109C231.07 248.281 230.792 247.586 230.234 247.023C229.682 246.456 229 246.172 228.188 246.172ZM239.93 245.227H241.102V253H239.93V251.492C239.68 252.018 239.326 252.427 238.867 252.719C238.414 253.01 237.883 253.156 237.273 253.156C236.273 253.156 235.477 252.844 234.883 252.219C234.289 251.594 233.992 250.755 233.992 249.703V245.227H235.164V249.578C235.164 250.333 235.378 250.935 235.805 251.383C236.232 251.831 236.802 252.055 237.516 252.055C238.25 252.055 238.836 251.831 239.273 251.383C239.711 250.935 239.93 250.333 239.93 249.578V245.227ZM246.695 245.062C246.898 245.062 247.141 245.094 247.422 245.156V246.25C247.167 246.161 246.914 246.117 246.664 246.117C246.055 246.117 245.542 246.333 245.125 246.766C244.714 247.193 244.508 247.734 244.508 248.391V253H243.336V245.227H244.508V246.469C244.737 246.031 245.042 245.688 245.422 245.438C245.802 245.188 246.227 245.062 246.695 245.062ZM251.844 253.156C250.714 253.156 249.76 252.768 248.984 251.992C248.214 251.211 247.828 250.25 247.828 249.109C247.828 247.969 248.214 247.01 248.984 246.234C249.76 245.453 250.714 245.062 251.844 245.062C252.724 245.062 253.508 245.32 254.195 245.836C254.883 246.346 255.299 246.99 255.445 247.766H254.258C254.128 247.302 253.836 246.922 253.383 246.625C252.93 246.323 252.417 246.172 251.844 246.172C251.036 246.172 250.357 246.453 249.805 247.016C249.253 247.578 248.977 248.276 248.977 249.109C248.977 249.938 249.253 250.635 249.805 251.203C250.357 251.771 251.036 252.055 251.844 252.055C252.422 252.055 252.94 251.898 253.398 251.586C253.862 251.273 254.148 250.87 254.258 250.375H255.445C255.326 251.188 254.919 251.854 254.227 252.375C253.539 252.896 252.745 253.156 251.844 253.156ZM264.289 248.875C264.289 249.109 264.284 249.258 264.273 249.32H257.758C257.815 250.154 258.102 250.826 258.617 251.336C259.133 251.846 259.797 252.102 260.609 252.102C261.234 252.102 261.771 251.961 262.219 251.68C262.672 251.393 262.951 251.013 263.055 250.539H264.227C264.076 251.326 263.664 251.958 262.992 252.438C262.32 252.917 261.516 253.156 260.578 253.156C259.448 253.156 258.503 252.766 257.742 251.984C256.987 251.203 256.609 250.229 256.609 249.062C256.609 247.943 256.992 246.997 257.758 246.227C258.523 245.451 259.458 245.062 260.562 245.062C261.255 245.062 261.885 245.227 262.453 245.555C263.021 245.878 263.469 246.331 263.797 246.914C264.125 247.497 264.289 248.151 264.289 248.875ZM257.812 248.328H263.039C262.982 247.682 262.719 247.154 262.25 246.742C261.786 246.326 261.208 246.117 260.516 246.117C259.828 246.117 259.24 246.318 258.75 246.719C258.26 247.12 257.948 247.656 257.812 248.328ZM272.398 241.797H273.57V253H272.398V251.195C272.112 251.82 271.695 252.305 271.148 252.648C270.607 252.987 269.969 253.156 269.234 253.156C268.531 253.156 267.883 252.977 267.289 252.617C266.701 252.258 266.234 251.766 265.891 251.141C265.547 250.516 265.375 249.833 265.375 249.094C265.375 248.354 265.547 247.674 265.891 247.055C266.234 246.435 266.701 245.948 267.289 245.594C267.883 245.24 268.531 245.062 269.234 245.062C269.969 245.062 270.609 245.234 271.156 245.578C271.703 245.917 272.117 246.396 272.398 247.016V241.797ZM269.453 252.055C270.302 252.055 271.005 251.776 271.562 251.219C272.12 250.656 272.398 249.948 272.398 249.094C272.398 248.245 272.12 247.542 271.562 246.984C271.005 246.427 270.302 246.148 269.453 246.148C268.63 246.148 267.935 246.435 267.367 247.008C266.805 247.581 266.523 248.276 266.523 249.094C266.523 249.927 266.805 250.63 267.367 251.203C267.935 251.771 268.63 252.055 269.453 252.055ZM283.008 245.781C284.023 245.781 284.878 246.133 285.57 246.836C286.263 247.539 286.609 248.409 286.609 249.445C286.609 250.117 286.44 250.74 286.102 251.312C285.763 251.88 285.305 252.331 284.727 252.664C284.148 252.992 283.518 253.156 282.836 253.156C282.154 253.156 281.523 252.992 280.945 252.664C280.372 252.331 279.917 251.88 279.578 251.312C279.245 250.74 279.078 250.117 279.078 249.445C279.078 249.044 279.156 248.596 279.312 248.102C279.474 247.607 279.703 247.122 280 246.648L283.023 241.797H284.406L281.633 246.148C282.065 245.904 282.523 245.781 283.008 245.781ZM282.836 252.008C283.57 252.008 284.188 251.76 284.688 251.266C285.193 250.766 285.445 250.154 285.445 249.43C285.445 248.701 285.19 248.083 284.68 247.578C284.174 247.073 283.555 246.82 282.82 246.82C282.102 246.82 281.492 247.073 280.992 247.578C280.492 248.083 280.242 248.701 280.242 249.43C280.242 250.154 280.492 250.766 280.992 251.266C281.492 251.76 282.107 252.008 282.836 252.008ZM298.602 241.797H299.773V253H298.602V251.195C298.315 251.82 297.898 252.305 297.352 252.648C296.81 252.987 296.172 253.156 295.438 253.156C294.734 253.156 294.086 252.977 293.492 252.617C292.904 252.258 292.438 251.766 292.094 251.141C291.75 250.516 291.578 249.833 291.578 249.094C291.578 248.354 291.75 247.674 292.094 247.055C292.438 246.435 292.904 245.948 293.492 245.594C294.086 245.24 294.734 245.062 295.438 245.062C296.172 245.062 296.812 245.234 297.359 245.578C297.906 245.917 298.32 246.396 298.602 247.016V241.797ZM295.656 252.055C296.505 252.055 297.208 251.776 297.766 251.219C298.323 250.656 298.602 249.948 298.602 249.094C298.602 248.245 298.323 247.542 297.766 246.984C297.208 246.427 296.505 246.148 295.656 246.148C294.833 246.148 294.138 246.435 293.57 247.008C293.008 247.581 292.727 248.276 292.727 249.094C292.727 249.927 293.008 250.63 293.57 251.203C294.138 251.771 294.833 252.055 295.656 252.055ZM308.336 245.227H309.508V253H308.336V251.195C308.049 251.82 307.633 252.305 307.086 252.648C306.544 252.987 305.906 253.156 305.172 253.156C304.469 253.156 303.82 252.977 303.227 252.617C302.638 252.258 302.172 251.766 301.828 251.141C301.484 250.516 301.312 249.833 301.312 249.094C301.312 248.354 301.484 247.674 301.828 247.055C302.172 246.435 302.638 245.948 303.227 245.594C303.82 245.24 304.469 245.062 305.172 245.062C305.906 245.062 306.547 245.234 307.094 245.578C307.641 245.917 308.055 246.396 308.336 247.016V245.227ZM305.391 252.055C306.24 252.055 306.943 251.776 307.5 251.219C308.057 250.656 308.336 249.948 308.336 249.094C308.336 248.245 308.057 247.542 307.5 246.984C306.943 246.427 306.24 246.148 305.391 246.148C304.568 246.148 303.872 246.435 303.305 247.008C302.742 247.581 302.461 248.276 302.461 249.094C302.461 249.927 302.742 250.63 303.305 251.203C303.872 251.771 304.568 252.055 305.391 252.055ZM317.266 245.227H318.516L314.016 255.945H312.766L314.109 252.859L310.898 245.227H312.164L314.703 251.492L317.266 245.227ZM322.352 253.156C321.477 253.156 320.753 252.935 320.18 252.492C319.607 252.049 319.281 251.451 319.203 250.695H320.32C320.372 251.138 320.581 251.492 320.945 251.758C321.31 252.018 321.763 252.148 322.305 252.148C322.846 252.148 323.281 252.026 323.609 251.781C323.943 251.531 324.109 251.211 324.109 250.82C324.109 250.56 324.042 250.341 323.906 250.164C323.771 249.982 323.591 249.846 323.367 249.758C323.148 249.669 322.898 249.589 322.617 249.516C322.336 249.443 322.047 249.383 321.75 249.336C321.453 249.289 321.164 249.216 320.883 249.117C320.602 249.018 320.349 248.901 320.125 248.766C319.906 248.625 319.729 248.427 319.594 248.172C319.458 247.911 319.391 247.602 319.391 247.242C319.391 246.602 319.643 246.078 320.148 245.672C320.654 245.266 321.323 245.062 322.156 245.062C322.922 245.062 323.581 245.266 324.133 245.672C324.69 246.073 325.013 246.612 325.102 247.289H323.922C323.865 246.924 323.669 246.625 323.336 246.391C323.003 246.156 322.599 246.039 322.125 246.039C321.651 246.039 321.266 246.143 320.969 246.352C320.677 246.555 320.531 246.823 320.531 247.156C320.531 247.438 320.617 247.667 320.789 247.844C320.966 248.021 321.193 248.151 321.469 248.234C321.745 248.318 322.049 248.391 322.383 248.453C322.721 248.51 323.057 248.583 323.391 248.672C323.729 248.76 324.036 248.878 324.312 249.023C324.589 249.169 324.812 249.391 324.984 249.688C325.161 249.984 325.25 250.352 325.25 250.789C325.25 251.477 324.974 252.044 324.422 252.492C323.875 252.935 323.185 253.156 322.352 253.156ZM337.477 245.227H338.648V253H337.477V251.195C337.19 251.82 336.773 252.305 336.227 252.648C335.685 252.987 335.047 253.156 334.312 253.156C333.609 253.156 332.961 252.977 332.367 252.617C331.779 252.258 331.312 251.766 330.969 251.141C330.625 250.516 330.453 249.833 330.453 249.094C330.453 248.354 330.625 247.674 330.969 247.055C331.312 246.435 331.779 245.948 332.367 245.594C332.961 245.24 333.609 245.062 334.312 245.062C335.047 245.062 335.688 245.234 336.234 245.578C336.781 245.917 337.195 246.396 337.477 247.016V245.227ZM334.531 252.055C335.38 252.055 336.083 251.776 336.641 251.219C337.198 250.656 337.477 249.948 337.477 249.094C337.477 248.245 337.198 247.542 336.641 246.984C336.083 246.427 335.38 246.148 334.531 246.148C333.708 246.148 333.013 246.435 332.445 247.008C331.883 247.581 331.602 248.276 331.602 249.094C331.602 249.927 331.883 250.63 332.445 251.203C333.013 251.771 333.708 252.055 334.531 252.055ZM347.445 245.211H348.617V252.758C348.617 253.826 348.255 254.685 347.531 255.336C346.807 255.987 345.878 256.312 344.742 256.312C344.294 256.312 343.859 256.255 343.438 256.141C343.016 256.031 342.622 255.87 342.258 255.656C341.898 255.443 341.604 255.154 341.375 254.789C341.151 254.43 341.031 254.021 341.016 253.562H342.148C342.164 254.094 342.417 254.518 342.906 254.836C343.396 255.159 343.997 255.32 344.711 255.32C345.503 255.32 346.156 255.086 346.672 254.617C347.188 254.154 347.445 253.549 347.445 252.805V251.094C347.159 251.708 346.742 252.185 346.195 252.523C345.654 252.862 345.016 253.031 344.281 253.031C343.578 253.031 342.93 252.854 342.336 252.5C341.747 252.146 341.281 251.661 340.938 251.047C340.594 250.432 340.422 249.76 340.422 249.031C340.422 248.307 340.594 247.641 340.938 247.031C341.281 246.422 341.747 245.943 342.336 245.594C342.93 245.24 343.578 245.062 344.281 245.062C345.016 245.062 345.654 245.232 346.195 245.57C346.742 245.904 347.159 246.375 347.445 246.984V245.211ZM344.5 251.945C345.349 251.945 346.052 251.672 346.609 251.125C347.167 250.573 347.445 249.875 347.445 249.031C347.445 248.198 347.167 247.508 346.609 246.961C346.052 246.409 345.349 246.133 344.5 246.133C343.677 246.133 342.982 246.414 342.414 246.977C341.852 247.534 341.57 248.219 341.57 249.031C341.57 249.849 341.852 250.539 342.414 251.102C342.982 251.664 343.677 251.945 344.5 251.945ZM351.547 246.234C352.323 245.453 353.276 245.062 354.406 245.062C355.536 245.062 356.49 245.453 357.266 246.234C358.047 247.01 358.438 247.969 358.438 249.109C358.438 250.25 358.047 251.211 357.266 251.992C356.49 252.768 355.536 253.156 354.406 253.156C353.276 253.156 352.323 252.768 351.547 251.992C350.776 251.211 350.391 250.25 350.391 249.109C350.391 247.969 350.776 247.01 351.547 246.234ZM354.406 246.172C353.599 246.172 352.919 246.453 352.367 247.016C351.815 247.578 351.539 248.276 351.539 249.109C351.539 249.938 351.815 250.635 352.367 251.203C352.919 251.771 353.599 252.055 354.406 252.055C355.214 252.055 355.896 251.771 356.453 251.203C357.01 250.63 357.289 249.932 357.289 249.109C357.289 248.281 357.01 247.586 356.453 247.023C355.901 246.456 355.219 246.172 354.406 246.172Z"
            fill="#818283"
          />
          <path
            d="M208.833 247.833C208.833 251.053 206.219 253.667 202.999 253.667C199.779 253.667 197.166 251.053 197.166 247.833C197.166 244.613 199.779 242 202.999 242C206.219 242 208.833 244.613 208.833 247.833Z"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M203 244.332V247.665"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M201 240.332H205"
            stroke="#818283"
            stroke-width="1.33"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M210.5 192C215.747 192 220 187.747 220 182.5C220 177.253 215.747 173 210.5 173C205.253 173 201 177.253 201 182.5C201 187.747 205.253 192 210.5 192Z"
            fill="#0F47F2"
          />
          <path
            d="M213.354 186.016L213.335 186.98L213.271 189.762V189.869C208.575 185.801 207.771 184.812 207.635 184.51V184.501C207.615 184.442 207.61 184.384 207.62 184.325C207.62 184.306 207.63 184.281 207.635 184.262C207.635 184.242 207.644 184.228 207.649 184.208C207.698 184.077 207.771 183.95 207.864 183.843C207.927 183.76 208 183.682 208.073 183.609C208.234 183.448 208.409 183.302 208.59 183.166C208.682 183.097 208.775 183.029 208.877 182.961C209.072 182.829 209.281 182.698 209.501 182.566C211.191 184.14 213.33 185.996 213.359 186.021L213.354 186.016Z"
            fill="url(#paint0_linear_4500_3993)"
          />
          <path
            d="M213.419 176.888L213.399 177.852L213.389 178.33L213.37 179.289L213.36 179.772L213.341 180.736C213.306 180.751 211.163 181.579 209.511 182.563C209.292 182.695 209.083 182.826 208.888 182.958C208.79 183.026 208.693 183.094 208.6 183.163C208.415 183.299 208.245 183.445 208.084 183.606C208.011 183.679 207.938 183.757 207.874 183.84C207.723 184.03 207.636 184.215 207.621 184.39L207.641 183.586V183.455V183.411L207.655 182.904L207.684 181.901L207.699 181.409L207.728 180.415C208.069 179.022 212.863 177.102 213.428 176.883L213.419 176.888Z"
            fill="white"
          />
          <path
            d="M208.994 177.949C209.773 177.949 210.402 177.315 210.402 176.541C210.402 175.766 209.769 175.133 208.994 175.133C208.219 175.133 207.586 175.766 207.586 176.541C207.586 177.315 208.219 177.949 208.994 177.949Z"
            fill="white"
          />
          <rect x="715" y="209" width="52" height="52" rx="6" fill="#DFFBE2" />
          <path
            d="M725.91 229.426C726.639 229.009 727.43 228.801 728.283 228.801C729.136 228.801 729.924 229.009 730.646 229.426C731.369 229.836 731.942 230.399 732.365 231.115C732.788 231.825 733 232.6 733 233.439C733 233.934 732.896 234.491 732.688 235.109C732.486 235.721 732.196 236.33 731.818 236.936L728.039 243H726.32L729.816 237.521C729.283 237.854 728.697 238.02 728.059 238.02C726.789 238.02 725.721 237.58 724.855 236.701C723.99 235.822 723.557 234.735 723.557 233.439C723.557 232.6 723.768 231.825 724.191 231.115C724.615 230.399 725.188 229.836 725.91 229.426ZM728.303 236.721C729.201 236.721 729.96 236.405 730.578 235.773C731.203 235.142 731.516 234.37 731.516 233.459C731.516 232.554 731.203 231.792 730.578 231.174C729.96 230.549 729.195 230.236 728.283 230.236C727.365 230.236 726.59 230.549 725.959 231.174C725.334 231.792 725.021 232.554 725.021 233.459C725.021 234.37 725.337 235.142 725.969 235.773C726.607 236.405 727.385 236.721 728.303 236.721ZM742.277 242.023C741.411 242.792 740.308 243.176 738.967 243.176C737.626 243.176 736.519 242.792 735.646 242.023C734.781 241.255 734.348 240.282 734.348 239.104C734.348 238.264 734.608 237.508 735.129 236.838C735.65 236.161 736.327 235.702 737.16 235.461C736.503 235.24 735.962 234.846 735.539 234.279C735.116 233.713 734.904 233.094 734.904 232.424C734.904 231.382 735.285 230.526 736.047 229.855C736.815 229.178 737.788 228.84 738.967 228.84C740.145 228.84 741.115 229.178 741.877 229.855C742.645 230.526 743.029 231.382 743.029 232.424C743.029 233.094 742.814 233.713 742.385 234.279C741.962 234.846 741.421 235.24 740.764 235.461C741.597 235.702 742.274 236.161 742.795 236.838C743.322 237.508 743.586 238.264 743.586 239.104C743.586 240.282 743.15 241.255 742.277 242.023ZM737.092 234.123C737.58 234.546 738.205 234.758 738.967 234.758C739.729 234.758 740.35 234.546 740.832 234.123C741.32 233.7 741.564 233.153 741.564 232.482C741.564 231.818 741.32 231.271 740.832 230.842C740.35 230.412 739.729 230.197 738.967 230.197C738.205 230.197 737.58 230.412 737.092 230.842C736.61 231.271 736.369 231.818 736.369 232.482C736.369 233.153 736.61 233.7 737.092 234.123ZM736.711 240.988C737.31 241.516 738.062 241.779 738.967 241.779C739.872 241.779 740.62 241.516 741.213 240.988C741.805 240.461 742.102 239.797 742.102 238.996C742.102 238.202 741.805 237.548 741.213 237.033C740.62 236.519 739.872 236.262 738.967 236.262C738.055 236.262 737.303 236.522 736.711 237.043C736.118 237.557 735.822 238.208 735.822 238.996C735.822 239.797 736.118 240.461 736.711 240.988ZM749.865 229.611C750.367 230.145 750.617 230.822 750.617 231.643C750.617 232.463 750.367 233.146 749.865 233.693C749.364 234.234 748.729 234.504 747.961 234.504C747.18 234.504 746.535 234.234 746.027 233.693C745.526 233.146 745.275 232.463 745.275 231.643C745.275 230.822 745.526 230.145 746.027 229.611C746.535 229.071 747.18 228.801 747.961 228.801C748.729 228.801 749.364 229.071 749.865 229.611ZM755.178 228.996H756.398L747.102 243H745.881L755.178 228.996ZM749.133 232.98C749.432 232.635 749.582 232.189 749.582 231.643C749.582 231.096 749.432 230.65 749.133 230.305C748.833 229.953 748.443 229.777 747.961 229.777C747.466 229.777 747.069 229.953 746.77 230.305C746.47 230.65 746.32 231.096 746.32 231.643C746.32 232.189 746.47 232.635 746.77 232.98C747.069 233.326 747.466 233.498 747.961 233.498C748.443 233.498 748.833 233.326 749.133 232.98ZM756.975 240.344C756.975 241.171 756.724 241.854 756.223 242.395C755.728 242.928 755.093 243.195 754.318 243.195C753.537 243.195 752.896 242.928 752.395 242.395C751.893 241.861 751.643 241.177 751.643 240.344C751.643 239.523 751.893 238.846 752.395 238.312C752.896 237.772 753.537 237.502 754.318 237.502C755.087 237.502 755.721 237.772 756.223 238.312C756.724 238.846 756.975 239.523 756.975 240.344ZM755.939 240.344C755.939 239.797 755.79 239.351 755.49 239.006C755.191 238.654 754.8 238.479 754.318 238.479C753.824 238.479 753.426 238.654 753.127 239.006C752.827 239.351 752.678 239.797 752.678 240.344C752.678 240.897 752.827 241.35 753.127 241.701C753.426 242.046 753.824 242.219 754.318 242.219C754.807 242.219 755.197 242.046 755.49 241.701C755.79 241.35 755.939 240.897 755.939 240.344Z"
            fill="#00A25E"
          />
          <path
            d="M108.062 253V241.797H111.945C112.82 241.797 113.568 242.073 114.188 242.625C114.807 243.172 115.117 243.831 115.117 244.602C115.117 245.201 114.935 245.737 114.57 246.211C114.206 246.685 113.753 246.974 113.211 247.078C113.914 247.151 114.505 247.458 114.984 248C115.469 248.542 115.711 249.18 115.711 249.914C115.711 250.773 115.391 251.503 114.75 252.102C114.115 252.701 113.341 253 112.43 253H108.062ZM109.258 246.68H111.914C112.466 246.68 112.935 246.495 113.32 246.125C113.706 245.75 113.898 245.294 113.898 244.758C113.898 244.258 113.703 243.833 113.312 243.484C112.927 243.13 112.461 242.953 111.914 242.953H109.258V246.68ZM109.258 251.852H112.367C112.971 251.852 113.474 251.651 113.875 251.25C114.276 250.849 114.477 250.354 114.477 249.766C114.477 249.182 114.273 248.69 113.867 248.289C113.466 247.888 112.971 247.688 112.383 247.688H109.258V251.852ZM123.93 245.227H125.102V253H123.93V251.195C123.643 251.82 123.227 252.305 122.68 252.648C122.138 252.987 121.5 253.156 120.766 253.156C120.062 253.156 119.414 252.977 118.82 252.617C118.232 252.258 117.766 251.766 117.422 251.141C117.078 250.516 116.906 249.833 116.906 249.094C116.906 248.354 117.078 247.674 117.422 247.055C117.766 246.435 118.232 245.948 118.82 245.594C119.414 245.24 120.062 245.062 120.766 245.062C121.5 245.062 122.141 245.234 122.688 245.578C123.234 245.917 123.648 246.396 123.93 247.016V245.227ZM120.984 252.055C121.833 252.055 122.536 251.776 123.094 251.219C123.651 250.656 123.93 249.948 123.93 249.094C123.93 248.245 123.651 247.542 123.094 246.984C122.536 246.427 121.833 246.148 120.984 246.148C120.161 246.148 119.466 246.435 118.898 247.008C118.336 247.581 118.055 248.276 118.055 249.094C118.055 249.927 118.336 250.63 118.898 251.203C119.466 251.771 120.161 252.055 120.984 252.055ZM131.164 245.062C132.169 245.062 132.966 245.375 133.555 246C134.148 246.62 134.445 247.461 134.445 248.523V253H133.273V248.633C133.273 247.888 133.057 247.292 132.625 246.844C132.198 246.396 131.63 246.172 130.922 246.172C130.193 246.172 129.607 246.398 129.164 246.852C128.727 247.299 128.508 247.893 128.508 248.633V253H127.336V245.227H128.508V246.742C128.758 246.211 129.112 245.799 129.57 245.508C130.029 245.211 130.56 245.062 131.164 245.062ZM143.242 245.211H144.414V252.758C144.414 253.826 144.052 254.685 143.328 255.336C142.604 255.987 141.674 256.312 140.539 256.312C140.091 256.312 139.656 256.255 139.234 256.141C138.812 256.031 138.419 255.87 138.055 255.656C137.695 255.443 137.401 255.154 137.172 254.789C136.948 254.43 136.828 254.021 136.812 253.562H137.945C137.961 254.094 138.214 254.518 138.703 254.836C139.193 255.159 139.794 255.32 140.508 255.32C141.299 255.32 141.953 255.086 142.469 254.617C142.984 254.154 143.242 253.549 143.242 252.805V251.094C142.956 251.708 142.539 252.185 141.992 252.523C141.451 252.862 140.812 253.031 140.078 253.031C139.375 253.031 138.727 252.854 138.133 252.5C137.544 252.146 137.078 251.661 136.734 251.047C136.391 250.432 136.219 249.76 136.219 249.031C136.219 248.307 136.391 247.641 136.734 247.031C137.078 246.422 137.544 245.943 138.133 245.594C138.727 245.24 139.375 245.062 140.078 245.062C140.812 245.062 141.451 245.232 141.992 245.57C142.539 245.904 142.956 246.375 143.242 246.984V245.211ZM140.297 251.945C141.146 251.945 141.849 251.672 142.406 251.125C142.964 250.573 143.242 249.875 143.242 249.031C143.242 248.198 142.964 247.508 142.406 246.961C141.849 246.409 141.146 246.133 140.297 246.133C139.474 246.133 138.779 246.414 138.211 246.977C137.648 247.534 137.367 248.219 137.367 249.031C137.367 249.849 137.648 250.539 138.211 251.102C138.779 251.664 139.474 251.945 140.297 251.945ZM153.211 245.227H154.383V253H153.211V251.195C152.924 251.82 152.508 252.305 151.961 252.648C151.419 252.987 150.781 253.156 150.047 253.156C149.344 253.156 148.695 252.977 148.102 252.617C147.513 252.258 147.047 251.766 146.703 251.141C146.359 250.516 146.188 249.833 146.188 249.094C146.188 248.354 146.359 247.674 146.703 247.055C147.047 246.435 147.513 245.948 148.102 245.594C148.695 245.24 149.344 245.062 150.047 245.062C150.781 245.062 151.422 245.234 151.969 245.578C152.516 245.917 152.93 246.396 153.211 247.016V245.227ZM150.266 252.055C151.115 252.055 151.818 251.776 152.375 251.219C152.932 250.656 153.211 249.948 153.211 249.094C153.211 248.245 152.932 247.542 152.375 246.984C151.818 246.427 151.115 246.148 150.266 246.148C149.443 246.148 148.747 246.435 148.18 247.008C147.617 247.581 147.336 248.276 147.336 249.094C147.336 249.927 147.617 250.63 148.18 251.203C148.747 251.771 149.443 252.055 150.266 252.055ZM157.789 241.797V253H156.617V241.797H157.789ZM160.484 246.234C161.26 245.453 162.214 245.062 163.344 245.062C164.474 245.062 165.427 245.453 166.203 246.234C166.984 247.01 167.375 247.969 167.375 249.109C167.375 250.25 166.984 251.211 166.203 251.992C165.427 252.768 164.474 253.156 163.344 253.156C162.214 253.156 161.26 252.768 160.484 251.992C159.714 251.211 159.328 250.25 159.328 249.109C159.328 247.969 159.714 247.01 160.484 246.234ZM163.344 246.172C162.536 246.172 161.857 246.453 161.305 247.016C160.753 247.578 160.477 248.276 160.477 249.109C160.477 249.938 160.753 250.635 161.305 251.203C161.857 251.771 162.536 252.055 163.344 252.055C164.151 252.055 164.833 251.771 165.391 251.203C165.948 250.63 166.227 249.932 166.227 249.109C166.227 248.281 165.948 247.586 165.391 247.023C164.839 246.456 164.156 246.172 163.344 246.172ZM172.508 245.062C172.711 245.062 172.953 245.094 173.234 245.156V246.25C172.979 246.161 172.727 246.117 172.477 246.117C171.867 246.117 171.354 246.333 170.938 246.766C170.526 247.193 170.32 247.734 170.32 248.391V253H169.148V245.227H170.32V246.469C170.549 246.031 170.854 245.688 171.234 245.438C171.615 245.188 172.039 245.062 172.508 245.062ZM181.32 248.875C181.32 249.109 181.315 249.258 181.305 249.32H174.789C174.846 250.154 175.133 250.826 175.648 251.336C176.164 251.846 176.828 252.102 177.641 252.102C178.266 252.102 178.802 251.961 179.25 251.68C179.703 251.393 179.982 251.013 180.086 250.539H181.258C181.107 251.326 180.695 251.958 180.023 252.438C179.352 252.917 178.547 253.156 177.609 253.156C176.479 253.156 175.534 252.766 174.773 251.984C174.018 251.203 173.641 250.229 173.641 249.062C173.641 247.943 174.023 246.997 174.789 246.227C175.555 245.451 176.49 245.062 177.594 245.062C178.286 245.062 178.917 245.227 179.484 245.555C180.052 245.878 180.5 246.331 180.828 246.914C181.156 247.497 181.32 248.151 181.32 248.875ZM174.844 248.328H180.07C180.013 247.682 179.75 247.154 179.281 246.742C178.818 246.326 178.24 246.117 177.547 246.117C176.859 246.117 176.271 246.318 175.781 246.719C175.292 247.12 174.979 247.656 174.844 248.328Z"
            fill="#4B5563"
          />
          <path
            d="M100.333 245.665C100.333 249.665 94.9993 253.665 94.9993 253.665C94.9993 253.665 89.666 249.665 89.666 245.665C89.666 244.251 90.2279 242.894 91.2281 241.894C92.2283 240.894 93.5849 240.332 94.9993 240.332C96.4138 240.332 97.7704 240.894 98.7706 241.894C99.7708 242.894 100.333 244.251 100.333 245.665Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M95 247.668C96.1046 247.668 97 246.773 97 245.668C97 244.563 96.1046 243.668 95 243.668C93.8954 243.668 93 244.563 93 245.668C93 246.773 93.8954 247.668 95 247.668Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M88.2656 295.797H94.5234V296.953H89.4609V300.438H93.9766V301.594H89.4609V305.852H94.5234V307H88.2656V295.797ZM102.992 307H101.602L99.375 303.945L97.1484 307H95.7734L98.6875 302.984L95.9531 299.227H97.3438L99.3906 302.039L101.422 299.227H102.797L100.078 302.984L102.992 307ZM108.797 299.062C109.5 299.062 110.146 299.242 110.734 299.602C111.328 299.956 111.797 300.445 112.141 301.07C112.484 301.69 112.656 302.37 112.656 303.109C112.656 303.849 112.484 304.531 112.141 305.156C111.797 305.776 111.328 306.266 110.734 306.625C110.146 306.979 109.5 307.156 108.797 307.156C108.062 307.156 107.422 306.987 106.875 306.648C106.333 306.305 105.919 305.82 105.633 305.195V309.93H104.461V299.227H105.633V301.016C105.914 300.396 106.328 299.917 106.875 299.578C107.422 299.234 108.062 299.062 108.797 299.062ZM108.578 306.055C109.401 306.055 110.094 305.771 110.656 305.203C111.219 304.635 111.5 303.938 111.5 303.109C111.5 302.281 111.219 301.581 110.656 301.008C110.094 300.435 109.401 300.148 108.578 300.148C107.729 300.148 107.026 300.43 106.469 300.992C105.911 301.549 105.633 302.255 105.633 303.109C105.633 303.958 105.911 304.661 106.469 305.219C107.026 305.776 107.729 306.055 108.578 306.055ZM121.398 302.875C121.398 303.109 121.393 303.258 121.383 303.32H114.867C114.924 304.154 115.211 304.826 115.727 305.336C116.242 305.846 116.906 306.102 117.719 306.102C118.344 306.102 118.88 305.961 119.328 305.68C119.781 305.393 120.06 305.013 120.164 304.539H121.336C121.185 305.326 120.773 305.958 120.102 306.438C119.43 306.917 118.625 307.156 117.688 307.156C116.557 307.156 115.612 306.766 114.852 305.984C114.096 305.203 113.719 304.229 113.719 303.062C113.719 301.943 114.102 300.997 114.867 300.227C115.633 299.451 116.568 299.062 117.672 299.062C118.365 299.062 118.995 299.227 119.562 299.555C120.13 299.878 120.578 300.331 120.906 300.914C121.234 301.497 121.398 302.151 121.398 302.875ZM114.922 302.328H120.148C120.091 301.682 119.828 301.154 119.359 300.742C118.896 300.326 118.318 300.117 117.625 300.117C116.938 300.117 116.349 300.318 115.859 300.719C115.37 301.12 115.057 301.656 114.922 302.328ZM126.555 299.062C126.758 299.062 127 299.094 127.281 299.156V300.25C127.026 300.161 126.773 300.117 126.523 300.117C125.914 300.117 125.401 300.333 124.984 300.766C124.573 301.193 124.367 301.734 124.367 302.391V307H123.195V299.227H124.367V300.469C124.596 300.031 124.901 299.688 125.281 299.438C125.661 299.188 126.086 299.062 126.555 299.062ZM129.383 295.828C129.607 295.828 129.805 295.911 129.977 296.078C130.148 296.245 130.234 296.44 130.234 296.664C130.234 296.893 130.148 297.094 129.977 297.266C129.805 297.432 129.607 297.516 129.383 297.516C129.154 297.516 128.958 297.432 128.797 297.266C128.635 297.099 128.555 296.898 128.555 296.664C128.555 296.44 128.635 296.245 128.797 296.078C128.958 295.911 129.154 295.828 129.383 295.828ZM128.789 299.227H129.961V307H128.789V299.227ZM139.414 302.875C139.414 303.109 139.409 303.258 139.398 303.32H132.883C132.94 304.154 133.227 304.826 133.742 305.336C134.258 305.846 134.922 306.102 135.734 306.102C136.359 306.102 136.896 305.961 137.344 305.68C137.797 305.393 138.076 305.013 138.18 304.539H139.352C139.201 305.326 138.789 305.958 138.117 306.438C137.445 306.917 136.641 307.156 135.703 307.156C134.573 307.156 133.628 306.766 132.867 305.984C132.112 305.203 131.734 304.229 131.734 303.062C131.734 301.943 132.117 300.997 132.883 300.227C133.648 299.451 134.583 299.062 135.688 299.062C136.38 299.062 137.01 299.227 137.578 299.555C138.146 299.878 138.594 300.331 138.922 300.914C139.25 301.497 139.414 302.151 139.414 302.875ZM132.938 302.328H138.164C138.107 301.682 137.844 301.154 137.375 300.742C136.911 300.326 136.333 300.117 135.641 300.117C134.953 300.117 134.365 300.318 133.875 300.719C133.385 301.12 133.073 301.656 132.938 302.328ZM145.039 299.062C146.044 299.062 146.841 299.375 147.43 300C148.023 300.62 148.32 301.461 148.32 302.523V307H147.148V302.633C147.148 301.888 146.932 301.292 146.5 300.844C146.073 300.396 145.505 300.172 144.797 300.172C144.068 300.172 143.482 300.398 143.039 300.852C142.602 301.299 142.383 301.893 142.383 302.633V307H141.211V299.227H142.383V300.742C142.633 300.211 142.987 299.799 143.445 299.508C143.904 299.211 144.435 299.062 145.039 299.062ZM154.109 307.156C152.979 307.156 152.026 306.768 151.25 305.992C150.479 305.211 150.094 304.25 150.094 303.109C150.094 301.969 150.479 301.01 151.25 300.234C152.026 299.453 152.979 299.062 154.109 299.062C154.99 299.062 155.773 299.32 156.461 299.836C157.148 300.346 157.565 300.99 157.711 301.766H156.523C156.393 301.302 156.102 300.922 155.648 300.625C155.195 300.323 154.682 300.172 154.109 300.172C153.302 300.172 152.622 300.453 152.07 301.016C151.518 301.578 151.242 302.276 151.242 303.109C151.242 303.938 151.518 304.635 152.07 305.203C152.622 305.771 153.302 306.055 154.109 306.055C154.688 306.055 155.206 305.898 155.664 305.586C156.128 305.273 156.414 304.87 156.523 304.375H157.711C157.591 305.188 157.185 305.854 156.492 306.375C155.805 306.896 155.01 307.156 154.109 307.156ZM166.555 302.875C166.555 303.109 166.549 303.258 166.539 303.32H160.023C160.081 304.154 160.367 304.826 160.883 305.336C161.398 305.846 162.062 306.102 162.875 306.102C163.5 306.102 164.036 305.961 164.484 305.68C164.938 305.393 165.216 305.013 165.32 304.539H166.492C166.341 305.326 165.93 305.958 165.258 306.438C164.586 306.917 163.781 307.156 162.844 307.156C161.714 307.156 160.768 306.766 160.008 305.984C159.253 305.203 158.875 304.229 158.875 303.062C158.875 301.943 159.258 300.997 160.023 300.227C160.789 299.451 161.724 299.062 162.828 299.062C163.521 299.062 164.151 299.227 164.719 299.555C165.286 299.878 165.734 300.331 166.062 300.914C166.391 301.497 166.555 302.151 166.555 302.875ZM160.078 302.328H165.305C165.247 301.682 164.984 301.154 164.516 300.742C164.052 300.326 163.474 300.117 162.781 300.117C162.094 300.117 161.505 300.318 161.016 300.719C160.526 301.12 160.214 301.656 160.078 302.328Z"
            fill="#A8A8A8"
          />
          <path
            d="M92.0625 331.156C91.0833 331.156 90.2448 330.885 89.5469 330.344C88.849 329.802 88.4557 329.089 88.3672 328.203H89.5703C89.6849 328.734 89.9688 329.167 90.4219 329.5C90.8802 329.828 91.4271 329.992 92.0625 329.992C92.7708 329.992 93.3698 329.755 93.8594 329.281C94.349 328.802 94.5938 328.219 94.5938 327.531C94.5938 326.812 94.349 326.206 93.8594 325.711C93.3698 325.216 92.7708 324.969 92.0625 324.969C91.6302 324.969 91.2266 325.039 90.8516 325.18C90.4818 325.315 90.1875 325.51 89.9688 325.766H88.9297L89.4531 319.797H95.1328V320.938H90.5312L90.1562 324.633C90.3854 324.419 90.6849 324.253 91.0547 324.133C91.4297 324.008 91.8151 323.945 92.2109 323.945C93.2422 323.945 94.1016 324.284 94.7891 324.961C95.4766 325.633 95.8203 326.495 95.8203 327.547C95.8203 328.552 95.4557 329.406 94.7266 330.109C93.9974 330.807 93.1094 331.156 92.0625 331.156ZM100.555 319.797H102.023L105.289 324.758L108.508 319.797H109.93L105.883 325.977V331H104.664V325.977L100.555 319.797ZM116.523 326.875C116.523 327.109 116.518 327.258 116.508 327.32H109.992C110.049 328.154 110.336 328.826 110.852 329.336C111.367 329.846 112.031 330.102 112.844 330.102C113.469 330.102 114.005 329.961 114.453 329.68C114.906 329.393 115.185 329.013 115.289 328.539H116.461C116.31 329.326 115.898 329.958 115.227 330.438C114.555 330.917 113.75 331.156 112.812 331.156C111.682 331.156 110.737 330.766 109.977 329.984C109.221 329.203 108.844 328.229 108.844 327.062C108.844 325.943 109.227 324.997 109.992 324.227C110.758 323.451 111.693 323.062 112.797 323.062C113.49 323.062 114.12 323.227 114.688 323.555C115.255 323.878 115.703 324.331 116.031 324.914C116.359 325.497 116.523 326.151 116.523 326.875ZM110.047 326.328H115.273C115.216 325.682 114.953 325.154 114.484 324.742C114.021 324.326 113.443 324.117 112.75 324.117C112.062 324.117 111.474 324.318 110.984 324.719C110.495 325.12 110.182 325.656 110.047 326.328ZM124.633 323.227H125.805V331H124.633V329.195C124.346 329.82 123.93 330.305 123.383 330.648C122.841 330.987 122.203 331.156 121.469 331.156C120.766 331.156 120.117 330.977 119.523 330.617C118.935 330.258 118.469 329.766 118.125 329.141C117.781 328.516 117.609 327.833 117.609 327.094C117.609 326.354 117.781 325.674 118.125 325.055C118.469 324.435 118.935 323.948 119.523 323.594C120.117 323.24 120.766 323.062 121.469 323.062C122.203 323.062 122.844 323.234 123.391 323.578C123.938 323.917 124.352 324.396 124.633 325.016V323.227ZM121.688 330.055C122.536 330.055 123.24 329.776 123.797 329.219C124.354 328.656 124.633 327.948 124.633 327.094C124.633 326.245 124.354 325.542 123.797 324.984C123.24 324.427 122.536 324.148 121.688 324.148C120.865 324.148 120.169 324.435 119.602 325.008C119.039 325.581 118.758 326.276 118.758 327.094C118.758 327.927 119.039 328.63 119.602 329.203C120.169 329.771 120.865 330.055 121.688 330.055ZM131.398 323.062C131.602 323.062 131.844 323.094 132.125 323.156V324.25C131.87 324.161 131.617 324.117 131.367 324.117C130.758 324.117 130.245 324.333 129.828 324.766C129.417 325.193 129.211 325.734 129.211 326.391V331H128.039V323.227H129.211V324.469C129.44 324.031 129.745 323.688 130.125 323.438C130.505 323.188 130.93 323.062 131.398 323.062ZM135.977 331.156C135.102 331.156 134.378 330.935 133.805 330.492C133.232 330.049 132.906 329.451 132.828 328.695H133.945C133.997 329.138 134.206 329.492 134.57 329.758C134.935 330.018 135.388 330.148 135.93 330.148C136.471 330.148 136.906 330.026 137.234 329.781C137.568 329.531 137.734 329.211 137.734 328.82C137.734 328.56 137.667 328.341 137.531 328.164C137.396 327.982 137.216 327.846 136.992 327.758C136.773 327.669 136.523 327.589 136.242 327.516C135.961 327.443 135.672 327.383 135.375 327.336C135.078 327.289 134.789 327.216 134.508 327.117C134.227 327.018 133.974 326.901 133.75 326.766C133.531 326.625 133.354 326.427 133.219 326.172C133.083 325.911 133.016 325.602 133.016 325.242C133.016 324.602 133.268 324.078 133.773 323.672C134.279 323.266 134.948 323.062 135.781 323.062C136.547 323.062 137.206 323.266 137.758 323.672C138.315 324.073 138.638 324.612 138.727 325.289H137.547C137.49 324.924 137.294 324.625 136.961 324.391C136.628 324.156 136.224 324.039 135.75 324.039C135.276 324.039 134.891 324.143 134.594 324.352C134.302 324.555 134.156 324.823 134.156 325.156C134.156 325.438 134.242 325.667 134.414 325.844C134.591 326.021 134.818 326.151 135.094 326.234C135.37 326.318 135.674 326.391 136.008 326.453C136.346 326.51 136.682 326.583 137.016 326.672C137.354 326.76 137.661 326.878 137.938 327.023C138.214 327.169 138.438 327.391 138.609 327.688C138.786 327.984 138.875 328.352 138.875 328.789C138.875 329.477 138.599 330.044 138.047 330.492C137.5 330.935 136.81 331.156 135.977 331.156Z"
            fill="#4B5563"
          />
          <path
            d="M271.547 319.797V331H270.328V321.461L267.75 323.672V322.188L270.664 319.797H271.547ZM276.859 331.156C275.88 331.156 275.042 330.885 274.344 330.344C273.646 329.802 273.253 329.089 273.164 328.203H274.367C274.482 328.734 274.766 329.167 275.219 329.5C275.677 329.828 276.224 329.992 276.859 329.992C277.568 329.992 278.167 329.755 278.656 329.281C279.146 328.802 279.391 328.219 279.391 327.531C279.391 326.812 279.146 326.206 278.656 325.711C278.167 325.216 277.568 324.969 276.859 324.969C276.427 324.969 276.023 325.039 275.648 325.18C275.279 325.315 274.984 325.51 274.766 325.766H273.727L274.25 319.797H279.93V320.938H275.328L274.953 324.633C275.182 324.419 275.482 324.253 275.852 324.133C276.227 324.008 276.612 323.945 277.008 323.945C278.039 323.945 278.898 324.284 279.586 324.961C280.273 325.633 280.617 326.495 280.617 327.547C280.617 328.552 280.253 329.406 279.523 330.109C278.794 330.807 277.906 331.156 276.859 331.156ZM289.812 319.797C290.578 319.797 291.299 319.938 291.977 320.219C292.659 320.495 293.245 320.878 293.734 321.367C294.224 321.852 294.609 322.44 294.891 323.133C295.177 323.82 295.32 324.56 295.32 325.352C295.32 326.143 295.177 326.891 294.891 327.594C294.609 328.292 294.224 328.891 293.734 329.391C293.245 329.885 292.659 330.279 291.977 330.57C291.299 330.857 290.578 331 289.812 331H286.344V319.797H289.812ZM289.875 329.852C291.073 329.852 292.07 329.424 292.867 328.57C293.669 327.711 294.07 326.638 294.07 325.352C294.07 324.076 293.672 323.023 292.875 322.195C292.083 321.367 291.083 320.953 289.875 320.953H287.539V329.852H289.875ZM303.555 323.227H304.727V331H303.555V329.195C303.268 329.82 302.852 330.305 302.305 330.648C301.763 330.987 301.125 331.156 300.391 331.156C299.688 331.156 299.039 330.977 298.445 330.617C297.857 330.258 297.391 329.766 297.047 329.141C296.703 328.516 296.531 327.833 296.531 327.094C296.531 326.354 296.703 325.674 297.047 325.055C297.391 324.435 297.857 323.948 298.445 323.594C299.039 323.24 299.688 323.062 300.391 323.062C301.125 323.062 301.766 323.234 302.312 323.578C302.859 323.917 303.273 324.396 303.555 325.016V323.227ZM300.609 330.055C301.458 330.055 302.161 329.776 302.719 329.219C303.276 328.656 303.555 327.948 303.555 327.094C303.555 326.245 303.276 325.542 302.719 324.984C302.161 324.427 301.458 324.148 300.609 324.148C299.786 324.148 299.091 324.435 298.523 325.008C297.961 325.581 297.68 326.276 297.68 327.094C297.68 327.927 297.961 328.63 298.523 329.203C299.091 329.771 299.786 330.055 300.609 330.055ZM312.484 323.227H313.734L309.234 333.945H307.984L309.328 330.859L306.117 323.227H307.383L309.922 329.492L312.484 323.227ZM317.57 331.156C316.695 331.156 315.971 330.935 315.398 330.492C314.826 330.049 314.5 329.451 314.422 328.695H315.539C315.591 329.138 315.799 329.492 316.164 329.758C316.529 330.018 316.982 330.148 317.523 330.148C318.065 330.148 318.5 330.026 318.828 329.781C319.161 329.531 319.328 329.211 319.328 328.82C319.328 328.56 319.26 328.341 319.125 328.164C318.99 327.982 318.81 327.846 318.586 327.758C318.367 327.669 318.117 327.589 317.836 327.516C317.555 327.443 317.266 327.383 316.969 327.336C316.672 327.289 316.383 327.216 316.102 327.117C315.82 327.018 315.568 326.901 315.344 326.766C315.125 326.625 314.948 326.427 314.812 326.172C314.677 325.911 314.609 325.602 314.609 325.242C314.609 324.602 314.862 324.078 315.367 323.672C315.872 323.266 316.542 323.062 317.375 323.062C318.141 323.062 318.799 323.266 319.352 323.672C319.909 324.073 320.232 324.612 320.32 325.289H319.141C319.083 324.924 318.888 324.625 318.555 324.391C318.221 324.156 317.818 324.039 317.344 324.039C316.87 324.039 316.484 324.143 316.188 324.352C315.896 324.555 315.75 324.823 315.75 325.156C315.75 325.438 315.836 325.667 316.008 325.844C316.185 326.021 316.411 326.151 316.688 326.234C316.964 326.318 317.268 326.391 317.602 326.453C317.94 326.51 318.276 326.583 318.609 326.672C318.948 326.76 319.255 326.878 319.531 327.023C319.807 327.169 320.031 327.391 320.203 327.688C320.38 327.984 320.469 328.352 320.469 328.789C320.469 329.477 320.193 330.044 319.641 330.492C319.094 330.935 318.404 331.156 317.57 331.156Z"
            fill="#4B5563"
          />
          <path
            d="M267.266 295.797H268.398L274.672 304.789V295.797H275.891V307H274.766L268.461 298.023V307H267.266V295.797ZM278.969 300.234C279.745 299.453 280.698 299.062 281.828 299.062C282.958 299.062 283.911 299.453 284.688 300.234C285.469 301.01 285.859 301.969 285.859 303.109C285.859 304.25 285.469 305.211 284.688 305.992C283.911 306.768 282.958 307.156 281.828 307.156C280.698 307.156 279.745 306.768 278.969 305.992C278.198 305.211 277.812 304.25 277.812 303.109C277.812 301.969 278.198 301.01 278.969 300.234ZM281.828 300.172C281.021 300.172 280.341 300.453 279.789 301.016C279.237 301.578 278.961 302.276 278.961 303.109C278.961 303.938 279.237 304.635 279.789 305.203C280.341 305.771 281.021 306.055 281.828 306.055C282.635 306.055 283.318 305.771 283.875 305.203C284.432 304.63 284.711 303.932 284.711 303.109C284.711 302.281 284.432 301.586 283.875 301.023C283.323 300.456 282.641 300.172 281.828 300.172ZM291.336 300.312H289.164V304.375C289.164 305.453 289.708 305.992 290.797 305.992C291.016 305.992 291.195 305.971 291.336 305.93V307C291.102 307.052 290.852 307.078 290.586 307.078C289.773 307.078 289.138 306.854 288.68 306.406C288.221 305.953 287.992 305.281 287.992 304.391V300.312H286.461V299.227H287.992V297.078H289.164V299.227H291.336V300.312ZM293.555 295.828C293.779 295.828 293.977 295.911 294.148 296.078C294.32 296.245 294.406 296.44 294.406 296.664C294.406 296.893 294.32 297.094 294.148 297.266C293.977 297.432 293.779 297.516 293.555 297.516C293.326 297.516 293.13 297.432 292.969 297.266C292.807 297.099 292.727 296.898 292.727 296.664C292.727 296.44 292.807 296.245 292.969 296.078C293.13 295.911 293.326 295.828 293.555 295.828ZM292.961 299.227H294.133V307H292.961V299.227ZM299.922 307.156C298.792 307.156 297.839 306.768 297.062 305.992C296.292 305.211 295.906 304.25 295.906 303.109C295.906 301.969 296.292 301.01 297.062 300.234C297.839 299.453 298.792 299.062 299.922 299.062C300.802 299.062 301.586 299.32 302.273 299.836C302.961 300.346 303.378 300.99 303.523 301.766H302.336C302.206 301.302 301.914 300.922 301.461 300.625C301.008 300.323 300.495 300.172 299.922 300.172C299.115 300.172 298.435 300.453 297.883 301.016C297.331 301.578 297.055 302.276 297.055 303.109C297.055 303.938 297.331 304.635 297.883 305.203C298.435 305.771 299.115 306.055 299.922 306.055C300.5 306.055 301.018 305.898 301.477 305.586C301.94 305.273 302.227 304.87 302.336 304.375H303.523C303.404 305.188 302.997 305.854 302.305 306.375C301.617 306.896 300.823 307.156 299.922 307.156ZM312.367 302.875C312.367 303.109 312.362 303.258 312.352 303.32H305.836C305.893 304.154 306.18 304.826 306.695 305.336C307.211 305.846 307.875 306.102 308.688 306.102C309.312 306.102 309.849 305.961 310.297 305.68C310.75 305.393 311.029 305.013 311.133 304.539H312.305C312.154 305.326 311.742 305.958 311.07 306.438C310.398 306.917 309.594 307.156 308.656 307.156C307.526 307.156 306.581 306.766 305.82 305.984C305.065 305.203 304.688 304.229 304.688 303.062C304.688 301.943 305.07 300.997 305.836 300.227C306.602 299.451 307.536 299.062 308.641 299.062C309.333 299.062 309.964 299.227 310.531 299.555C311.099 299.878 311.547 300.331 311.875 300.914C312.203 301.497 312.367 302.151 312.367 302.875ZM305.891 302.328H311.117C311.06 301.682 310.797 301.154 310.328 300.742C309.865 300.326 309.286 300.117 308.594 300.117C307.906 300.117 307.318 300.318 306.828 300.719C306.339 301.12 306.026 301.656 305.891 302.328ZM322.477 295.797C323.419 295.797 324.206 296.107 324.836 296.727C325.471 297.341 325.789 298.104 325.789 299.016C325.789 299.938 325.471 300.708 324.836 301.328C324.206 301.943 323.419 302.25 322.477 302.25H319.367V307H318.172V295.797H322.477ZM322.477 301.094C323.07 301.094 323.568 300.896 323.969 300.5C324.37 300.099 324.57 299.604 324.57 299.016C324.57 298.432 324.37 297.943 323.969 297.547C323.568 297.151 323.07 296.953 322.477 296.953H319.367V301.094H322.477ZM334.055 302.875C334.055 303.109 334.049 303.258 334.039 303.32H327.523C327.581 304.154 327.867 304.826 328.383 305.336C328.898 305.846 329.562 306.102 330.375 306.102C331 306.102 331.536 305.961 331.984 305.68C332.438 305.393 332.716 305.013 332.82 304.539H333.992C333.841 305.326 333.43 305.958 332.758 306.438C332.086 306.917 331.281 307.156 330.344 307.156C329.214 307.156 328.268 306.766 327.508 305.984C326.753 305.203 326.375 304.229 326.375 303.062C326.375 301.943 326.758 300.997 327.523 300.227C328.289 299.451 329.224 299.062 330.328 299.062C331.021 299.062 331.651 299.227 332.219 299.555C332.786 299.878 333.234 300.331 333.562 300.914C333.891 301.497 334.055 302.151 334.055 302.875ZM327.578 302.328H332.805C332.747 301.682 332.484 301.154 332.016 300.742C331.552 300.326 330.974 300.117 330.281 300.117C329.594 300.117 329.005 300.318 328.516 300.719C328.026 301.12 327.714 301.656 327.578 302.328ZM339.211 299.062C339.414 299.062 339.656 299.094 339.938 299.156V300.25C339.682 300.161 339.43 300.117 339.18 300.117C338.57 300.117 338.057 300.333 337.641 300.766C337.229 301.193 337.023 301.734 337.023 302.391V307H335.852V299.227H337.023V300.469C337.253 300.031 337.557 299.688 337.938 299.438C338.318 299.188 338.742 299.062 339.211 299.062ZM342.039 295.828C342.263 295.828 342.461 295.911 342.633 296.078C342.805 296.245 342.891 296.44 342.891 296.664C342.891 296.893 342.805 297.094 342.633 297.266C342.461 297.432 342.263 297.516 342.039 297.516C341.81 297.516 341.615 297.432 341.453 297.266C341.292 297.099 341.211 296.898 341.211 296.664C341.211 296.44 341.292 296.245 341.453 296.078C341.615 295.911 341.81 295.828 342.039 295.828ZM341.445 299.227H342.617V307H341.445V299.227ZM345.547 300.234C346.323 299.453 347.276 299.062 348.406 299.062C349.536 299.062 350.49 299.453 351.266 300.234C352.047 301.01 352.438 301.969 352.438 303.109C352.438 304.25 352.047 305.211 351.266 305.992C350.49 306.768 349.536 307.156 348.406 307.156C347.276 307.156 346.323 306.768 345.547 305.992C344.776 305.211 344.391 304.25 344.391 303.109C344.391 301.969 344.776 301.01 345.547 300.234ZM348.406 300.172C347.599 300.172 346.919 300.453 346.367 301.016C345.815 301.578 345.539 302.276 345.539 303.109C345.539 303.938 345.815 304.635 346.367 305.203C346.919 305.771 347.599 306.055 348.406 306.055C349.214 306.055 349.896 305.771 350.453 305.203C351.01 304.63 351.289 303.932 351.289 303.109C351.289 302.281 351.01 301.586 350.453 301.023C349.901 300.456 349.219 300.172 348.406 300.172ZM360.523 295.797H361.695V307H360.523V305.195C360.237 305.82 359.82 306.305 359.273 306.648C358.732 306.987 358.094 307.156 357.359 307.156C356.656 307.156 356.008 306.977 355.414 306.617C354.826 306.258 354.359 305.766 354.016 305.141C353.672 304.516 353.5 303.833 353.5 303.094C353.5 302.354 353.672 301.674 354.016 301.055C354.359 300.435 354.826 299.948 355.414 299.594C356.008 299.24 356.656 299.062 357.359 299.062C358.094 299.062 358.734 299.234 359.281 299.578C359.828 299.917 360.242 300.396 360.523 301.016V295.797ZM357.578 306.055C358.427 306.055 359.13 305.776 359.688 305.219C360.245 304.656 360.523 303.948 360.523 303.094C360.523 302.245 360.245 301.542 359.688 300.984C359.13 300.427 358.427 300.148 357.578 300.148C356.755 300.148 356.06 300.435 355.492 301.008C354.93 301.581 354.648 302.276 354.648 303.094C354.648 303.927 354.93 304.63 355.492 305.203C356.06 305.771 356.755 306.055 357.578 306.055Z"
            fill="#A8A8A8"
          />
          <path
            d="M666.883 324.57L670.125 320.953H664.656V319.797H671.82V320.648L668.367 324.422C669.008 324.339 669.602 324.422 670.148 324.672C670.695 324.917 671.128 325.292 671.445 325.797C671.763 326.302 671.922 326.875 671.922 327.516C671.922 328.578 671.562 329.451 670.844 330.133C670.13 330.815 669.219 331.156 668.109 331.156C667.109 331.156 666.26 330.883 665.562 330.336C664.87 329.789 664.471 329.078 664.367 328.203H665.57C665.68 328.74 665.961 329.172 666.414 329.5C666.867 329.828 667.432 329.992 668.109 329.992C668.854 329.992 669.466 329.758 669.945 329.289C670.43 328.815 670.672 328.211 670.672 327.477C670.672 327.049 670.57 326.669 670.367 326.336C670.164 326.003 669.888 325.75 669.539 325.578C669.19 325.406 668.786 325.299 668.328 325.258C667.87 325.216 667.388 325.268 666.883 325.414V324.57ZM676.641 331.156C675.661 331.156 674.823 330.885 674.125 330.344C673.427 329.802 673.034 329.089 672.945 328.203H674.148C674.263 328.734 674.547 329.167 675 329.5C675.458 329.828 676.005 329.992 676.641 329.992C677.349 329.992 677.948 329.755 678.438 329.281C678.927 328.802 679.172 328.219 679.172 327.531C679.172 326.812 678.927 326.206 678.438 325.711C677.948 325.216 677.349 324.969 676.641 324.969C676.208 324.969 675.805 325.039 675.43 325.18C675.06 325.315 674.766 325.51 674.547 325.766H673.508L674.031 319.797H679.711V320.938H675.109L674.734 324.633C674.964 324.419 675.263 324.253 675.633 324.133C676.008 324.008 676.393 323.945 676.789 323.945C677.82 323.945 678.68 324.284 679.367 324.961C680.055 325.633 680.398 326.495 680.398 327.547C680.398 328.552 680.034 329.406 679.305 330.109C678.576 330.807 677.688 331.156 676.641 331.156ZM686.125 319.797H687.32V329.852H692.984V331H686.125V319.797ZM699.148 319.797C700.091 319.797 700.878 320.107 701.508 320.727C702.143 321.341 702.461 322.104 702.461 323.016C702.461 323.938 702.143 324.708 701.508 325.328C700.878 325.943 700.091 326.25 699.148 326.25H696.039V331H694.844V319.797H699.148ZM699.148 325.094C699.742 325.094 700.24 324.896 700.641 324.5C701.042 324.099 701.242 323.604 701.242 323.016C701.242 322.432 701.042 321.943 700.641 321.547C700.24 321.151 699.742 320.953 699.148 320.953H696.039V325.094H699.148ZM710.367 331L709.281 328.266H703.984L702.891 331H701.617L706.094 319.797H707.18L711.68 331H710.367ZM704.445 327.109H708.828L706.641 321.578L704.445 327.109Z"
            fill="#4B5563"
          />
          <path
            d="M664.266 295.797H670.523V296.953H665.461V300.438H669.977V301.594H665.461V305.852H670.523V307H664.266V295.797ZM678.992 307H677.602L675.375 303.945L673.148 307H671.773L674.688 302.984L671.953 299.227H673.344L675.391 302.039L677.422 299.227H678.797L676.078 302.984L678.992 307ZM684.797 299.062C685.5 299.062 686.146 299.242 686.734 299.602C687.328 299.956 687.797 300.445 688.141 301.07C688.484 301.69 688.656 302.37 688.656 303.109C688.656 303.849 688.484 304.531 688.141 305.156C687.797 305.776 687.328 306.266 686.734 306.625C686.146 306.979 685.5 307.156 684.797 307.156C684.062 307.156 683.422 306.987 682.875 306.648C682.333 306.305 681.919 305.82 681.633 305.195V309.93H680.461V299.227H681.633V301.016C681.914 300.396 682.328 299.917 682.875 299.578C683.422 299.234 684.062 299.062 684.797 299.062ZM684.578 306.055C685.401 306.055 686.094 305.771 686.656 305.203C687.219 304.635 687.5 303.938 687.5 303.109C687.5 302.281 687.219 301.581 686.656 301.008C686.094 300.435 685.401 300.148 684.578 300.148C683.729 300.148 683.026 300.43 682.469 300.992C681.911 301.549 681.633 302.255 681.633 303.109C681.633 303.958 681.911 304.661 682.469 305.219C683.026 305.776 683.729 306.055 684.578 306.055ZM697.398 302.875C697.398 303.109 697.393 303.258 697.383 303.32H690.867C690.924 304.154 691.211 304.826 691.727 305.336C692.242 305.846 692.906 306.102 693.719 306.102C694.344 306.102 694.88 305.961 695.328 305.68C695.781 305.393 696.06 305.013 696.164 304.539H697.336C697.185 305.326 696.773 305.958 696.102 306.438C695.43 306.917 694.625 307.156 693.688 307.156C692.557 307.156 691.612 306.766 690.852 305.984C690.096 305.203 689.719 304.229 689.719 303.062C689.719 301.943 690.102 300.997 690.867 300.227C691.633 299.451 692.568 299.062 693.672 299.062C694.365 299.062 694.995 299.227 695.562 299.555C696.13 299.878 696.578 300.331 696.906 300.914C697.234 301.497 697.398 302.151 697.398 302.875ZM690.922 302.328H696.148C696.091 301.682 695.828 301.154 695.359 300.742C694.896 300.326 694.318 300.117 693.625 300.117C692.938 300.117 692.349 300.318 691.859 300.719C691.37 301.12 691.057 301.656 690.922 302.328ZM702.5 307.156C701.37 307.156 700.417 306.768 699.641 305.992C698.87 305.211 698.484 304.25 698.484 303.109C698.484 301.969 698.87 301.01 699.641 300.234C700.417 299.453 701.37 299.062 702.5 299.062C703.38 299.062 704.164 299.32 704.852 299.836C705.539 300.346 705.956 300.99 706.102 301.766H704.914C704.784 301.302 704.492 300.922 704.039 300.625C703.586 300.323 703.073 300.172 702.5 300.172C701.693 300.172 701.013 300.453 700.461 301.016C699.909 301.578 699.633 302.276 699.633 303.109C699.633 303.938 699.909 304.635 700.461 305.203C701.013 305.771 701.693 306.055 702.5 306.055C703.078 306.055 703.596 305.898 704.055 305.586C704.518 305.273 704.805 304.87 704.914 304.375H706.102C705.982 305.188 705.576 305.854 704.883 306.375C704.195 306.896 703.401 307.156 702.5 307.156ZM711.883 300.312H709.711V304.375C709.711 305.453 710.255 305.992 711.344 305.992C711.562 305.992 711.742 305.971 711.883 305.93V307C711.648 307.052 711.398 307.078 711.133 307.078C710.32 307.078 709.685 306.854 709.227 306.406C708.768 305.953 708.539 305.281 708.539 304.391V300.312H707.008V299.227H708.539V297.078H709.711V299.227H711.883V300.312ZM720.211 302.875C720.211 303.109 720.206 303.258 720.195 303.32H713.68C713.737 304.154 714.023 304.826 714.539 305.336C715.055 305.846 715.719 306.102 716.531 306.102C717.156 306.102 717.693 305.961 718.141 305.68C718.594 305.393 718.872 305.013 718.977 304.539H720.148C719.997 305.326 719.586 305.958 718.914 306.438C718.242 306.917 717.438 307.156 716.5 307.156C715.37 307.156 714.424 306.766 713.664 305.984C712.909 305.203 712.531 304.229 712.531 303.062C712.531 301.943 712.914 300.997 713.68 300.227C714.445 299.451 715.38 299.062 716.484 299.062C717.177 299.062 717.807 299.227 718.375 299.555C718.943 299.878 719.391 300.331 719.719 300.914C720.047 301.497 720.211 302.151 720.211 302.875ZM713.734 302.328H718.961C718.904 301.682 718.641 301.154 718.172 300.742C717.708 300.326 717.13 300.117 716.438 300.117C715.75 300.117 715.161 300.318 714.672 300.719C714.182 301.12 713.87 301.656 713.734 302.328ZM728.32 295.797H729.492V307H728.32V305.195C728.034 305.82 727.617 306.305 727.07 306.648C726.529 306.987 725.891 307.156 725.156 307.156C724.453 307.156 723.805 306.977 723.211 306.617C722.622 306.258 722.156 305.766 721.812 305.141C721.469 304.516 721.297 303.833 721.297 303.094C721.297 302.354 721.469 301.674 721.812 301.055C722.156 300.435 722.622 299.948 723.211 299.594C723.805 299.24 724.453 299.062 725.156 299.062C725.891 299.062 726.531 299.234 727.078 299.578C727.625 299.917 728.039 300.396 728.32 301.016V295.797ZM725.375 306.055C726.224 306.055 726.927 305.776 727.484 305.219C728.042 304.656 728.32 303.948 728.32 303.094C728.32 302.245 728.042 301.542 727.484 300.984C726.927 300.427 726.224 300.148 725.375 300.148C724.552 300.148 723.857 300.435 723.289 301.008C722.727 301.581 722.445 302.276 722.445 303.094C722.445 303.927 722.727 304.63 723.289 305.203C723.857 305.771 724.552 306.055 725.375 306.055ZM740.82 307.156C739.789 307.156 738.846 306.904 737.992 306.398C737.143 305.888 736.474 305.19 735.984 304.305C735.495 303.419 735.25 302.44 735.25 301.367C735.25 300.57 735.393 299.818 735.68 299.109C735.971 298.401 736.365 297.794 736.859 297.289C737.354 296.779 737.945 296.378 738.633 296.086C739.32 295.789 740.049 295.641 740.82 295.641C742.06 295.641 743.156 295.997 744.109 296.711C745.062 297.419 745.646 298.326 745.859 299.43H744.531C744.318 298.654 743.865 298.023 743.172 297.539C742.484 297.049 741.701 296.805 740.82 296.805C740.023 296.805 739.294 297.005 738.633 297.406C737.971 297.802 737.451 298.352 737.07 299.055C736.69 299.753 736.5 300.523 736.5 301.367C736.5 302.221 736.69 303.003 737.07 303.711C737.451 304.419 737.971 304.977 738.633 305.383C739.294 305.789 740.023 305.992 740.82 305.992C741.727 305.992 742.523 305.737 743.211 305.227C743.904 304.716 744.349 304.049 744.547 303.227H745.891C745.651 304.393 745.06 305.341 744.117 306.07C743.18 306.794 742.081 307.156 740.82 307.156ZM755.242 295.797V296.953H751.562V307H750.359V296.953H746.68V295.797H755.242ZM760.82 307.156C759.789 307.156 758.846 306.904 757.992 306.398C757.143 305.888 756.474 305.19 755.984 304.305C755.495 303.419 755.25 302.44 755.25 301.367C755.25 300.57 755.393 299.818 755.68 299.109C755.971 298.401 756.365 297.794 756.859 297.289C757.354 296.779 757.945 296.378 758.633 296.086C759.32 295.789 760.049 295.641 760.82 295.641C762.06 295.641 763.156 295.997 764.109 296.711C765.062 297.419 765.646 298.326 765.859 299.43H764.531C764.318 298.654 763.865 298.023 763.172 297.539C762.484 297.049 761.701 296.805 760.82 296.805C760.023 296.805 759.294 297.005 758.633 297.406C757.971 297.802 757.451 298.352 757.07 299.055C756.69 299.753 756.5 300.523 756.5 301.367C756.5 302.221 756.69 303.003 757.07 303.711C757.451 304.419 757.971 304.977 758.633 305.383C759.294 305.789 760.023 305.992 760.82 305.992C761.727 305.992 762.523 305.737 763.211 305.227C763.904 304.716 764.349 304.049 764.547 303.227H765.891C765.651 304.393 765.06 305.341 764.117 306.07C763.18 306.794 762.081 307.156 760.82 307.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M462.703 331V330.102L467.008 325.797C467.586 325.208 468.013 324.688 468.289 324.234C468.565 323.776 468.703 323.333 468.703 322.906C468.703 322.297 468.49 321.794 468.062 321.398C467.635 321.003 467.096 320.805 466.445 320.805C465.69 320.805 465.078 321.034 464.609 321.492C464.146 321.951 463.922 322.565 463.938 323.336H462.734C462.714 322.602 462.865 321.951 463.188 321.383C463.51 320.815 463.956 320.383 464.523 320.086C465.096 319.789 465.742 319.641 466.461 319.641C467.466 319.641 468.297 319.945 468.953 320.555C469.609 321.159 469.938 321.932 469.938 322.875C469.938 323.995 469.25 325.216 467.875 326.539L464.594 329.828H470.078V331H462.703ZM475.406 331.156C474.141 331.156 473.148 330.643 472.43 329.617C471.716 328.591 471.359 327.185 471.359 325.398C471.359 323.612 471.716 322.206 472.43 321.18C473.148 320.154 474.141 319.641 475.406 319.641C476.667 319.641 477.654 320.154 478.367 321.18C479.081 322.206 479.438 323.612 479.438 325.398C479.438 327.185 479.081 328.591 478.367 329.617C477.654 330.643 476.667 331.156 475.406 331.156ZM475.406 329.992C476.292 329.992 476.979 329.594 477.469 328.797C477.964 328 478.211 326.867 478.211 325.398C478.211 323.93 477.964 322.797 477.469 322C476.979 321.203 476.292 320.805 475.406 320.805C474.516 320.805 473.826 321.203 473.336 322C472.852 322.792 472.609 323.924 472.609 325.398C472.609 326.872 472.852 328.008 473.336 328.805C473.826 329.596 474.516 329.992 475.406 329.992ZM485.297 319.797H486.492V329.852H492.156V331H485.297V319.797ZM498.32 319.797C499.263 319.797 500.049 320.107 500.68 320.727C501.315 321.341 501.633 322.104 501.633 323.016C501.633 323.938 501.315 324.708 500.68 325.328C500.049 325.943 499.263 326.25 498.32 326.25H495.211V331H494.016V319.797H498.32ZM498.32 325.094C498.914 325.094 499.411 324.896 499.812 324.5C500.214 324.099 500.414 323.604 500.414 323.016C500.414 322.432 500.214 321.943 499.812 321.547C499.411 321.151 498.914 320.953 498.32 320.953H495.211V325.094H498.32ZM509.539 331L508.453 328.266H503.156L502.062 331H500.789L505.266 319.797H506.352L510.852 331H509.539ZM503.617 327.109H508L505.812 321.578L503.617 327.109Z"
            fill="#4B5563"
          />
          <path
            d="M467.352 307.156C466.32 307.156 465.378 306.904 464.523 306.398C463.674 305.888 463.005 305.19 462.516 304.305C462.026 303.419 461.781 302.44 461.781 301.367C461.781 300.57 461.924 299.818 462.211 299.109C462.503 298.401 462.896 297.794 463.391 297.289C463.885 296.779 464.477 296.378 465.164 296.086C465.852 295.789 466.581 295.641 467.352 295.641C468.591 295.641 469.688 295.997 470.641 296.711C471.594 297.419 472.177 298.326 472.391 299.43H471.062C470.849 298.654 470.396 298.023 469.703 297.539C469.016 297.049 468.232 296.805 467.352 296.805C466.555 296.805 465.826 297.005 465.164 297.406C464.503 297.802 463.982 298.352 463.602 299.055C463.221 299.753 463.031 300.523 463.031 301.367C463.031 302.221 463.221 303.003 463.602 303.711C463.982 304.419 464.503 304.977 465.164 305.383C465.826 305.789 466.555 305.992 467.352 305.992C468.258 305.992 469.055 305.737 469.742 305.227C470.435 304.716 470.88 304.049 471.078 303.227H472.422C472.182 304.393 471.591 305.341 470.648 306.07C469.711 306.794 468.612 307.156 467.352 307.156ZM480.102 299.227H481.273V307H480.102V305.492C479.852 306.018 479.497 306.427 479.039 306.719C478.586 307.01 478.055 307.156 477.445 307.156C476.445 307.156 475.648 306.844 475.055 306.219C474.461 305.594 474.164 304.755 474.164 303.703V299.227H475.336V303.578C475.336 304.333 475.549 304.935 475.977 305.383C476.404 305.831 476.974 306.055 477.688 306.055C478.422 306.055 479.008 305.831 479.445 305.383C479.883 304.935 480.102 304.333 480.102 303.578V299.227ZM486.867 299.062C487.07 299.062 487.312 299.094 487.594 299.156V300.25C487.339 300.161 487.086 300.117 486.836 300.117C486.227 300.117 485.714 300.333 485.297 300.766C484.885 301.193 484.68 301.734 484.68 302.391V307H483.508V299.227H484.68V300.469C484.909 300.031 485.214 299.688 485.594 299.438C485.974 299.188 486.398 299.062 486.867 299.062ZM492.461 299.062C492.664 299.062 492.906 299.094 493.188 299.156V300.25C492.932 300.161 492.68 300.117 492.43 300.117C491.82 300.117 491.307 300.333 490.891 300.766C490.479 301.193 490.273 301.734 490.273 302.391V307H489.102V299.227H490.273V300.469C490.503 300.031 490.807 299.688 491.188 299.438C491.568 299.188 491.992 299.062 492.461 299.062ZM501.273 302.875C501.273 303.109 501.268 303.258 501.258 303.32H494.742C494.799 304.154 495.086 304.826 495.602 305.336C496.117 305.846 496.781 306.102 497.594 306.102C498.219 306.102 498.755 305.961 499.203 305.68C499.656 305.393 499.935 305.013 500.039 304.539H501.211C501.06 305.326 500.648 305.958 499.977 306.438C499.305 306.917 498.5 307.156 497.562 307.156C496.432 307.156 495.487 306.766 494.727 305.984C493.971 305.203 493.594 304.229 493.594 303.062C493.594 301.943 493.977 300.997 494.742 300.227C495.508 299.451 496.443 299.062 497.547 299.062C498.24 299.062 498.87 299.227 499.438 299.555C500.005 299.878 500.453 300.331 500.781 300.914C501.109 301.497 501.273 302.151 501.273 302.875ZM494.797 302.328H500.023C499.966 301.682 499.703 301.154 499.234 300.742C498.771 300.326 498.193 300.117 497.5 300.117C496.812 300.117 496.224 300.318 495.734 300.719C495.245 301.12 494.932 301.656 494.797 302.328ZM506.898 299.062C507.904 299.062 508.701 299.375 509.289 300C509.883 300.62 510.18 301.461 510.18 302.523V307H509.008V302.633C509.008 301.888 508.792 301.292 508.359 300.844C507.932 300.396 507.365 300.172 506.656 300.172C505.927 300.172 505.341 300.398 504.898 300.852C504.461 301.299 504.242 301.893 504.242 302.633V307H503.07V299.227H504.242V300.742C504.492 300.211 504.846 299.799 505.305 299.508C505.763 299.211 506.294 299.062 506.898 299.062ZM515.977 300.312H513.805V304.375C513.805 305.453 514.349 305.992 515.438 305.992C515.656 305.992 515.836 305.971 515.977 305.93V307C515.742 307.052 515.492 307.078 515.227 307.078C514.414 307.078 513.779 306.854 513.32 306.406C512.862 305.953 512.633 305.281 512.633 304.391V300.312H511.102V299.227H512.633V297.078H513.805V299.227H515.977V300.312ZM526.695 307.156C525.664 307.156 524.721 306.904 523.867 306.398C523.018 305.888 522.349 305.19 521.859 304.305C521.37 303.419 521.125 302.44 521.125 301.367C521.125 300.57 521.268 299.818 521.555 299.109C521.846 298.401 522.24 297.794 522.734 297.289C523.229 296.779 523.82 296.378 524.508 296.086C525.195 295.789 525.924 295.641 526.695 295.641C527.935 295.641 529.031 295.997 529.984 296.711C530.938 297.419 531.521 298.326 531.734 299.43H530.406C530.193 298.654 529.74 298.023 529.047 297.539C528.359 297.049 527.576 296.805 526.695 296.805C525.898 296.805 525.169 297.005 524.508 297.406C523.846 297.802 523.326 298.352 522.945 299.055C522.565 299.753 522.375 300.523 522.375 301.367C522.375 302.221 522.565 303.003 522.945 303.711C523.326 304.419 523.846 304.977 524.508 305.383C525.169 305.789 525.898 305.992 526.695 305.992C527.602 305.992 528.398 305.737 529.086 305.227C529.779 304.716 530.224 304.049 530.422 303.227H531.766C531.526 304.393 530.935 305.341 529.992 306.07C529.055 306.794 527.956 307.156 526.695 307.156ZM541.117 295.797V296.953H537.438V307H536.234V296.953H532.555V295.797H541.117ZM546.695 307.156C545.664 307.156 544.721 306.904 543.867 306.398C543.018 305.888 542.349 305.19 541.859 304.305C541.37 303.419 541.125 302.44 541.125 301.367C541.125 300.57 541.268 299.818 541.555 299.109C541.846 298.401 542.24 297.794 542.734 297.289C543.229 296.779 543.82 296.378 544.508 296.086C545.195 295.789 545.924 295.641 546.695 295.641C547.935 295.641 549.031 295.997 549.984 296.711C550.938 297.419 551.521 298.326 551.734 299.43H550.406C550.193 298.654 549.74 298.023 549.047 297.539C548.359 297.049 547.576 296.805 546.695 296.805C545.898 296.805 545.169 297.005 544.508 297.406C543.846 297.802 543.326 298.352 542.945 299.055C542.565 299.753 542.375 300.523 542.375 301.367C542.375 302.221 542.565 303.003 542.945 303.711C543.326 304.419 543.846 304.977 544.508 305.383C545.169 305.789 545.898 305.992 546.695 305.992C547.602 305.992 548.398 305.737 549.086 305.227C549.779 304.716 550.224 304.049 550.422 303.227H551.766C551.526 304.393 550.935 305.341 549.992 306.07C549.055 306.794 547.956 307.156 546.695 307.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M31 362H801V418C801 421.314 798.314 424 795 424H37C33.6863 424 31 421.314 31 418V362Z"
            fill="white"
          />
          <rect
            x="637.5"
            y="371.5"
            width="37"
            height="37"
            rx="18.5"
            stroke="#0F47F2"
          />
          <path
            d="M656 378L659 386.143L668 390L659 393L656 402L653 393L644 390L653 386.143L656 378Z"
            fill="#0F47F2"
          />
          <rect
            x="536.25"
            y="371.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            fill="#0F47F2"
          />
          <rect
            x="536.25"
            y="371.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            stroke="#0F47F2"
            stroke-width="0.5"
          />
          <path
            d="M553.814 397.176C552.502 397.176 551.415 396.792 550.554 396.024C549.698 395.251 549.271 394.275 549.271 393.098H550.606C550.606 393.918 550.908 394.592 551.512 395.119C552.115 395.641 552.883 395.901 553.814 395.901C554.693 395.901 555.42 395.688 555.994 395.26C556.568 394.826 556.855 394.272 556.855 393.599C556.855 393.247 556.785 392.937 556.645 392.667C556.51 392.397 556.322 392.181 556.082 392.017C555.848 391.853 555.572 391.703 555.256 391.568C554.945 391.428 554.611 391.316 554.254 391.234C553.902 391.152 553.539 391.059 553.164 390.953C552.789 390.848 552.423 390.745 552.065 390.646C551.714 390.54 551.38 390.399 551.063 390.224C550.753 390.048 550.478 389.849 550.237 389.626C550.003 389.403 549.815 389.116 549.675 388.765C549.54 388.413 549.473 388.015 549.473 387.569C549.473 386.597 549.862 385.797 550.642 385.17C551.427 384.537 552.417 384.221 553.612 384.221C554.896 384.221 555.915 384.569 556.671 385.267C557.427 385.958 557.805 386.828 557.805 387.877H556.425C556.396 387.186 556.117 386.62 555.59 386.181C555.068 385.735 554.397 385.513 553.577 385.513C552.757 385.513 552.089 385.703 551.573 386.084C551.063 386.465 550.809 386.96 550.809 387.569C550.809 387.921 550.894 388.226 551.063 388.483C551.233 388.741 551.459 388.946 551.74 389.099C552.027 389.251 552.355 389.386 552.725 389.503C553.094 389.614 553.483 389.72 553.894 389.819C554.304 389.913 554.711 390.016 555.115 390.127C555.525 390.238 555.915 390.385 556.284 390.566C556.653 390.748 556.979 390.965 557.26 391.217C557.547 391.463 557.775 391.791 557.945 392.201C558.115 392.605 558.2 393.071 558.2 393.599C558.2 394.636 557.784 395.491 556.952 396.165C556.126 396.839 555.08 397.176 553.814 397.176ZM564.607 388.07C565.738 388.07 566.635 388.422 567.297 389.125C567.965 389.822 568.299 390.769 568.299 391.964V397H566.98V392.087C566.98 391.249 566.737 390.578 566.251 390.074C565.771 389.57 565.132 389.318 564.335 389.318C563.515 389.318 562.855 389.573 562.357 390.083C561.865 390.587 561.619 391.255 561.619 392.087V397H560.301V384.396H561.619V389.96C561.9 389.362 562.299 388.899 562.814 388.571C563.33 388.237 563.928 388.07 564.607 388.07ZM571.595 389.389C572.468 388.51 573.54 388.07 574.812 388.07C576.083 388.07 577.155 388.51 578.028 389.389C578.907 390.262 579.347 391.34 579.347 392.623C579.347 393.906 578.907 394.987 578.028 395.866C577.155 396.739 576.083 397.176 574.812 397.176C573.54 397.176 572.468 396.739 571.595 395.866C570.728 394.987 570.294 393.906 570.294 392.623C570.294 391.34 570.728 390.262 571.595 389.389ZM574.812 389.318C573.903 389.318 573.139 389.635 572.518 390.268C571.896 390.9 571.586 391.686 571.586 392.623C571.586 393.555 571.896 394.34 572.518 394.979C573.139 395.617 573.903 395.937 574.812 395.937C575.72 395.937 576.487 395.617 577.114 394.979C577.741 394.334 578.055 393.549 578.055 392.623C578.055 391.691 577.741 390.909 577.114 390.276C576.493 389.638 575.726 389.318 574.812 389.318ZM585.121 388.07C585.35 388.07 585.622 388.105 585.938 388.176V389.406C585.651 389.307 585.367 389.257 585.086 389.257C584.4 389.257 583.823 389.5 583.354 389.986C582.892 390.467 582.66 391.076 582.66 391.814V397H581.342V388.255H582.66V389.652C582.918 389.16 583.261 388.773 583.688 388.492C584.116 388.211 584.594 388.07 585.121 388.07ZM592.188 389.477H589.744V394.047C589.744 395.26 590.356 395.866 591.581 395.866C591.827 395.866 592.029 395.843 592.188 395.796V397C591.924 397.059 591.643 397.088 591.344 397.088C590.43 397.088 589.715 396.836 589.199 396.332C588.684 395.822 588.426 395.066 588.426 394.064V389.477H586.703V388.255H588.426V385.838H589.744V388.255H592.188V389.477ZM595.334 384.396V397H594.016V384.396H595.334ZM598.516 384.432C598.768 384.432 598.99 384.525 599.184 384.713C599.377 384.9 599.474 385.12 599.474 385.372C599.474 385.63 599.377 385.855 599.184 386.049C598.99 386.236 598.768 386.33 598.516 386.33C598.258 386.33 598.038 386.236 597.856 386.049C597.675 385.861 597.584 385.636 597.584 385.372C597.584 385.12 597.675 384.9 597.856 384.713C598.038 384.525 598.258 384.432 598.516 384.432ZM597.848 388.255H599.166V397H597.848V388.255ZM604.562 397.176C603.578 397.176 602.764 396.927 602.119 396.429C601.475 395.931 601.108 395.257 601.021 394.407H602.277C602.336 394.905 602.57 395.304 602.98 395.603C603.391 395.896 603.9 396.042 604.51 396.042C605.119 396.042 605.608 395.904 605.978 395.629C606.353 395.348 606.54 394.987 606.54 394.548C606.54 394.255 606.464 394.009 606.312 393.81C606.159 393.604 605.957 393.452 605.705 393.353C605.459 393.253 605.178 393.162 604.861 393.08C604.545 392.998 604.22 392.931 603.886 392.878C603.552 392.825 603.227 392.743 602.91 392.632C602.594 392.521 602.31 392.389 602.058 392.236C601.812 392.078 601.612 391.855 601.46 391.568C601.308 391.275 601.231 390.927 601.231 390.522C601.231 389.802 601.516 389.213 602.084 388.756C602.652 388.299 603.405 388.07 604.343 388.07C605.204 388.07 605.945 388.299 606.566 388.756C607.193 389.207 607.557 389.813 607.656 390.575H606.329C606.265 390.165 606.045 389.828 605.67 389.564C605.295 389.301 604.841 389.169 604.308 389.169C603.774 389.169 603.341 389.286 603.007 389.521C602.679 389.749 602.515 390.051 602.515 390.426C602.515 390.742 602.611 391 602.805 391.199C603.004 391.398 603.259 391.545 603.569 391.639C603.88 391.732 604.223 391.814 604.598 391.885C604.979 391.949 605.356 392.031 605.731 392.131C606.112 392.23 606.458 392.362 606.769 392.526C607.079 392.69 607.331 392.939 607.524 393.273C607.724 393.607 607.823 394.021 607.823 394.513C607.823 395.286 607.513 395.925 606.892 396.429C606.276 396.927 605.5 397.176 604.562 397.176ZM614.09 389.477H611.646V394.047C611.646 395.26 612.259 395.866 613.483 395.866C613.729 395.866 613.932 395.843 614.09 395.796V397C613.826 397.059 613.545 397.088 613.246 397.088C612.332 397.088 611.617 396.836 611.102 396.332C610.586 395.822 610.328 395.066 610.328 394.064V389.477H608.605V388.255H610.328V385.838H611.646V388.255H614.09V389.477Z"
            fill="#F5F9FB"
          />
          <circle cx="704" cy="390" r="18.5" stroke="#818283" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M697.328 381.91C697.34 381.91 697.352 381.91 697.365 381.91L710.672 381.91C711.031 381.91 711.36 381.91 711.628 381.946C711.922 381.986 712.234 382.079 712.49 382.335C712.747 382.592 712.84 382.903 712.879 383.198C712.915 383.466 712.915 383.795 712.915 384.154V384.228C712.915 384.587 712.915 384.916 712.879 385.184C712.84 385.479 712.747 385.79 712.49 386.047C712.247 386.29 711.953 386.387 711.671 386.429V390.873C711.671 392.397 711.671 393.604 711.544 394.549C711.414 395.521 711.138 396.308 710.517 396.929C709.897 397.55 709.11 397.825 708.137 397.956C707.193 398.083 705.985 398.083 704.461 398.083H703.538C702.014 398.083 700.807 398.083 699.862 397.956C698.89 397.825 698.103 397.55 697.482 396.929C696.861 396.308 696.586 395.521 696.455 394.549C696.328 393.604 696.328 392.397 696.328 390.873V386.429C696.046 386.387 695.753 386.29 695.509 386.047C695.253 385.79 695.16 385.479 695.12 385.184C695.084 384.916 695.084 384.587 695.084 384.228C695.084 384.216 695.084 384.203 695.084 384.191C695.084 384.179 695.084 384.166 695.084 384.154C695.084 383.795 695.084 383.466 695.12 383.198C695.16 382.903 695.253 382.592 695.509 382.335C695.765 382.079 696.077 381.986 696.372 381.946C696.64 381.91 696.969 381.91 697.328 381.91ZM697.572 386.472V390.826C697.572 392.407 697.573 393.531 697.688 394.383C697.8 395.217 698.011 395.698 698.362 396.049C698.713 396.4 699.193 396.611 700.028 396.723C700.88 396.837 702.004 396.839 703.585 396.839H704.414C705.996 396.839 707.119 396.837 707.972 396.723C708.806 396.611 709.287 396.4 709.638 396.049C709.989 395.698 710.199 395.217 710.311 394.383C710.426 393.531 710.427 392.407 710.427 390.826V386.472H697.572ZM696.389 383.215L696.391 383.214C696.392 383.213 696.395 383.212 696.399 383.21C696.417 383.202 696.458 383.19 696.538 383.179C696.712 383.156 696.956 383.154 697.365 383.154H710.635C711.043 383.154 711.287 383.156 711.462 383.179C711.542 383.19 711.582 383.202 711.6 383.21C711.604 383.212 711.607 383.213 711.609 383.214L711.611 383.215L711.612 383.217C711.613 383.219 711.614 383.221 711.616 383.226C711.623 383.244 711.636 383.284 711.646 383.364C711.67 383.539 711.671 383.782 711.671 384.191C711.671 384.599 711.67 384.843 711.646 385.018C711.636 385.098 711.623 385.138 711.616 385.156C711.614 385.161 711.613 385.163 711.612 385.165L711.611 385.167L711.609 385.168C711.607 385.169 711.604 385.17 711.6 385.172C711.582 385.179 711.542 385.192 711.462 385.203C711.287 385.226 711.043 385.228 710.635 385.228H697.365C696.956 385.228 696.712 385.226 696.538 385.203C696.458 385.192 696.417 385.179 696.399 385.172C696.395 385.17 696.392 385.169 696.391 385.168L696.389 385.167L696.388 385.165C696.387 385.163 696.385 385.161 696.384 385.156C696.376 385.138 696.364 385.098 696.353 385.018C696.329 384.843 696.328 384.599 696.328 384.191C696.328 383.782 696.329 383.539 696.353 383.364C696.364 383.284 696.376 383.244 696.384 383.226C696.385 383.221 696.387 383.219 696.388 383.217L696.389 383.215ZM696.389 385.167C696.388 385.167 696.389 385.167 696.389 385.167V385.167ZM702.738 388.13H705.262C705.439 388.13 705.603 388.13 705.74 388.14C705.887 388.15 706.049 388.173 706.214 388.241C706.569 388.388 706.852 388.671 706.999 389.026C707.067 389.191 707.09 389.353 707.1 389.5C707.11 389.637 707.11 389.801 707.11 389.978V390.015C707.11 390.192 707.11 390.356 707.1 390.493C707.09 390.64 707.067 390.802 706.999 390.967C706.852 391.322 706.569 391.605 706.214 391.752C706.049 391.82 705.887 391.843 705.74 391.853C705.603 391.863 705.439 391.863 705.262 391.863H702.738C702.56 391.863 702.397 391.863 702.259 391.853C702.112 391.843 701.95 391.82 701.786 391.752C701.43 391.605 701.147 391.322 701 390.967C700.932 390.802 700.909 390.64 700.899 390.493C700.89 390.356 700.89 390.192 700.89 390.015V389.978C700.89 389.801 700.89 389.637 700.899 389.5C700.909 389.353 700.932 389.191 701 389.026C701.147 388.671 701.43 388.388 701.786 388.241C701.95 388.173 702.112 388.15 702.259 388.14C702.397 388.13 702.56 388.13 702.738 388.13ZM702.259 389.391C702.21 389.412 702.171 389.451 702.15 389.5C702.149 389.506 702.144 389.53 702.14 389.585C702.134 389.675 702.134 389.795 702.134 389.996C702.134 390.198 702.134 390.318 702.14 390.408C702.144 390.463 702.149 390.487 702.15 390.493C702.171 390.542 702.21 390.581 702.259 390.602C702.265 390.603 702.289 390.608 702.344 390.612C702.434 390.618 702.554 390.618 702.756 390.618H705.244C705.445 390.618 705.566 390.618 705.655 390.612C705.711 390.608 705.734 390.603 705.74 390.602C705.789 390.581 705.828 390.542 705.849 390.493C705.85 390.487 705.856 390.463 705.859 390.408C705.865 390.318 705.866 390.198 705.866 389.996C705.866 389.795 705.865 389.675 705.859 389.585C705.856 389.53 705.85 389.506 705.849 389.5C705.828 389.451 705.789 389.412 705.74 389.391C705.734 389.39 705.711 389.385 705.655 389.381C705.566 389.375 705.445 389.374 705.244 389.374H702.756C702.554 389.374 702.434 389.375 702.344 389.381C702.289 389.385 702.265 389.39 702.259 389.391Z"
            fill="#818283"
          />
          <circle cx="752" cy="390" r="18.5" stroke="#818283" />
          <path
            d="M753.77 384.059L754.465 383.364C755.617 382.212 757.484 382.212 758.636 383.364C759.788 384.516 759.788 386.383 758.636 387.535L757.941 388.23M753.77 384.059C753.77 384.059 753.857 385.536 755.16 386.84C756.464 388.143 757.941 388.23 757.941 388.23M753.77 384.059L747.379 390.45C746.946 390.883 746.73 391.099 746.544 391.338C746.324 391.619 746.136 391.924 745.982 392.246C745.852 392.519 745.755 392.81 745.562 393.391L744.741 395.852M757.941 388.23L751.55 394.621C751.117 395.054 750.901 395.27 750.662 395.456C750.381 395.676 750.076 395.864 749.754 396.018C749.481 396.148 749.19 396.245 748.609 396.438L746.148 397.259M744.741 395.852L744.541 396.453C744.446 396.739 744.52 397.054 744.733 397.267C744.946 397.48 745.261 397.554 745.547 397.459L746.148 397.259M744.741 395.852L746.148 397.259"
            stroke="#818283"
          />
          <g clip-path="url(#clip0_4500_3993)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M136 380C143.18 380 149 385.967 149 393.329C149 399.217 145.279 404.211 140.117 405.975C139.458 406.107 139.224 405.69 139.224 405.335C139.224 404.896 139.24 403.461 139.24 401.677C139.24 400.434 138.824 399.623 138.357 399.21C141.252 398.88 144.294 397.753 144.294 392.633C144.294 391.177 143.79 389.989 142.955 389.056C143.09 388.719 143.536 387.363 142.828 385.528C142.828 385.528 141.738 385.17 139.256 386.894C138.218 386.599 137.105 386.451 136 386.445C134.895 386.451 133.784 386.599 132.746 386.894C130.262 385.17 129.17 385.528 129.17 385.528C128.464 387.363 128.91 388.719 129.044 389.056C128.213 389.989 127.705 391.177 127.705 392.633C127.705 397.74 130.74 398.884 133.628 399.221C133.256 399.554 132.919 400.141 132.802 401.002C132.061 401.343 130.179 401.933 129.019 399.895C129.019 399.895 128.331 398.615 127.026 398.521C127.026 398.521 125.759 398.504 126.938 399.331C126.938 399.331 127.789 399.741 128.381 401.281C128.381 401.281 129.144 403.66 132.76 402.854C132.767 403.968 132.779 405.018 132.779 405.335C132.779 405.688 132.539 406.1 131.891 405.977C126.724 404.215 123 399.218 123 393.329C123 385.967 128.821 380 136 380Z"
              fill="#4B5563"
            />
          </g>
          <g clip-path="url(#clip1_4500_3993)">
            <path
              d="M100 380C92.8195 380 87 385.82 87 393C87 400.18 92.8195 406 100 406C107.18 406 113 400.18 113 393C113 385.82 107.18 380 100 380ZM96.3641 398.439H93.8301V390.329H96.3641V398.439ZM95.0285 389.313H95.0082C94.0891 389.313 93.4949 388.694 93.4949 387.907C93.4949 387.104 94.1094 386.5 95.0437 386.5C95.9781 386.5 96.552 387.104 96.5723 387.907C96.5773 388.689 95.9832 389.313 95.0285 389.313ZM106.5 398.439H103.626V394.244C103.626 393.147 103.179 392.396 102.189 392.396C101.432 392.396 101.011 392.904 100.818 393.391C100.746 393.564 100.757 393.807 100.757 394.056V398.439H97.9078C97.9078 398.439 97.9434 391.004 97.9078 390.329H100.757V391.604C100.924 391.045 101.833 390.253 103.286 390.253C105.088 390.253 106.5 391.421 106.5 393.929V398.439Z"
              fill="#4B5563"
            />
          </g>
          <path
            d="M31 162C31 158.686 33.6863 156 37 156V424C33.6863 424 31 421.314 31 418V162Z"
            fill="#0F47F2"
          />
          <rect
            x="51.5"
            y="186.5"
            width="15"
            height="15"
            rx="2"
            stroke="#4B5563"
          />
          <path
            d="M95.9609 219L94.875 216.266H89.5781L88.4844 219H87.2109L91.6875 207.797H92.7734L97.2734 219H95.9609ZM90.0391 215.109H94.4219L92.2344 209.578L90.0391 215.109ZM98.75 207.797H99.9453V219H98.75V207.797ZM106.344 207.797H112.602V208.953H107.539V212.438H112.055V213.594H107.539V217.852H112.602V219H106.344V207.797ZM118.445 211.062C119.451 211.062 120.247 211.375 120.836 212C121.43 212.62 121.727 213.461 121.727 214.523V219H120.555V214.633C120.555 213.888 120.339 213.292 119.906 212.844C119.479 212.396 118.911 212.172 118.203 212.172C117.474 212.172 116.888 212.398 116.445 212.852C116.008 213.299 115.789 213.893 115.789 214.633V219H114.617V211.227H115.789V212.742C116.039 212.211 116.393 211.799 116.852 211.508C117.31 211.211 117.841 211.062 118.445 211.062ZM130.523 211.211H131.695V218.758C131.695 219.826 131.333 220.685 130.609 221.336C129.885 221.987 128.956 222.312 127.82 222.312C127.372 222.312 126.938 222.255 126.516 222.141C126.094 222.031 125.701 221.87 125.336 221.656C124.977 221.443 124.682 221.154 124.453 220.789C124.229 220.43 124.109 220.021 124.094 219.562H125.227C125.242 220.094 125.495 220.518 125.984 220.836C126.474 221.159 127.076 221.32 127.789 221.32C128.581 221.32 129.234 221.086 129.75 220.617C130.266 220.154 130.523 219.549 130.523 218.805V217.094C130.237 217.708 129.82 218.185 129.273 218.523C128.732 218.862 128.094 219.031 127.359 219.031C126.656 219.031 126.008 218.854 125.414 218.5C124.826 218.146 124.359 217.661 124.016 217.047C123.672 216.432 123.5 215.76 123.5 215.031C123.5 214.307 123.672 213.641 124.016 213.031C124.359 212.422 124.826 211.943 125.414 211.594C126.008 211.24 126.656 211.062 127.359 211.062C128.094 211.062 128.732 211.232 129.273 211.57C129.82 211.904 130.237 212.375 130.523 212.984V211.211ZM127.578 217.945C128.427 217.945 129.13 217.672 129.688 217.125C130.245 216.573 130.523 215.875 130.523 215.031C130.523 214.198 130.245 213.508 129.688 212.961C129.13 212.409 128.427 212.133 127.578 212.133C126.755 212.133 126.06 212.414 125.492 212.977C124.93 213.534 124.648 214.219 124.648 215.031C124.648 215.849 124.93 216.539 125.492 217.102C126.06 217.664 126.755 217.945 127.578 217.945ZM134.523 207.828C134.747 207.828 134.945 207.911 135.117 208.078C135.289 208.245 135.375 208.44 135.375 208.664C135.375 208.893 135.289 209.094 135.117 209.266C134.945 209.432 134.747 209.516 134.523 209.516C134.294 209.516 134.099 209.432 133.938 209.266C133.776 209.099 133.695 208.898 133.695 208.664C133.695 208.44 133.776 208.245 133.938 208.078C134.099 207.911 134.294 207.828 134.523 207.828ZM133.93 211.227H135.102V219H133.93V211.227ZM141.164 211.062C142.169 211.062 142.966 211.375 143.555 212C144.148 212.62 144.445 213.461 144.445 214.523V219H143.273V214.633C143.273 213.888 143.057 213.292 142.625 212.844C142.198 212.396 141.63 212.172 140.922 212.172C140.193 212.172 139.607 212.398 139.164 212.852C138.727 213.299 138.508 213.893 138.508 214.633V219H137.336V211.227H138.508V212.742C138.758 212.211 139.112 211.799 139.57 211.508C140.029 211.211 140.56 211.062 141.164 211.062ZM153.898 214.875C153.898 215.109 153.893 215.258 153.883 215.32H147.367C147.424 216.154 147.711 216.826 148.227 217.336C148.742 217.846 149.406 218.102 150.219 218.102C150.844 218.102 151.38 217.961 151.828 217.68C152.281 217.393 152.56 217.013 152.664 216.539H153.836C153.685 217.326 153.273 217.958 152.602 218.438C151.93 218.917 151.125 219.156 150.188 219.156C149.057 219.156 148.112 218.766 147.352 217.984C146.596 217.203 146.219 216.229 146.219 215.062C146.219 213.943 146.602 212.997 147.367 212.227C148.133 211.451 149.068 211.062 150.172 211.062C150.865 211.062 151.495 211.227 152.062 211.555C152.63 211.878 153.078 212.331 153.406 212.914C153.734 213.497 153.898 214.151 153.898 214.875ZM147.422 214.328H152.648C152.591 213.682 152.328 213.154 151.859 212.742C151.396 212.326 150.818 212.117 150.125 212.117C149.438 212.117 148.849 212.318 148.359 212.719C147.87 213.12 147.557 213.656 147.422 214.328ZM162.664 214.875C162.664 215.109 162.659 215.258 162.648 215.32H156.133C156.19 216.154 156.477 216.826 156.992 217.336C157.508 217.846 158.172 218.102 158.984 218.102C159.609 218.102 160.146 217.961 160.594 217.68C161.047 217.393 161.326 217.013 161.43 216.539H162.602C162.451 217.326 162.039 217.958 161.367 218.438C160.695 218.917 159.891 219.156 158.953 219.156C157.823 219.156 156.878 218.766 156.117 217.984C155.362 217.203 154.984 216.229 154.984 215.062C154.984 213.943 155.367 212.997 156.133 212.227C156.898 211.451 157.833 211.062 158.938 211.062C159.63 211.062 160.26 211.227 160.828 211.555C161.396 211.878 161.844 212.331 162.172 212.914C162.5 213.497 162.664 214.151 162.664 214.875ZM156.188 214.328H161.414C161.357 213.682 161.094 213.154 160.625 212.742C160.161 212.326 159.583 212.117 158.891 212.117C158.203 212.117 157.615 212.318 157.125 212.719C156.635 213.12 156.323 213.656 156.188 214.328ZM167.82 211.062C168.023 211.062 168.266 211.094 168.547 211.156V212.25C168.292 212.161 168.039 212.117 167.789 212.117C167.18 212.117 166.667 212.333 166.25 212.766C165.839 213.193 165.633 213.734 165.633 214.391V219H164.461V211.227H165.633V212.469C165.862 212.031 166.167 211.688 166.547 211.438C166.927 211.188 167.352 211.062 167.82 211.062ZM180.477 211.227H181.648V219H180.477V217.195C180.19 217.82 179.773 218.305 179.227 218.648C178.685 218.987 178.047 219.156 177.312 219.156C176.609 219.156 175.961 218.977 175.367 218.617C174.779 218.258 174.312 217.766 173.969 217.141C173.625 216.516 173.453 215.833 173.453 215.094C173.453 214.354 173.625 213.674 173.969 213.055C174.312 212.435 174.779 211.948 175.367 211.594C175.961 211.24 176.609 211.062 177.312 211.062C178.047 211.062 178.688 211.234 179.234 211.578C179.781 211.917 180.195 212.396 180.477 213.016V211.227ZM177.531 218.055C178.38 218.055 179.083 217.776 179.641 217.219C180.198 216.656 180.477 215.948 180.477 215.094C180.477 214.245 180.198 213.542 179.641 212.984C179.083 212.427 178.38 212.148 177.531 212.148C176.708 212.148 176.013 212.435 175.445 213.008C174.883 213.581 174.602 214.276 174.602 215.094C174.602 215.927 174.883 216.63 175.445 217.203C176.013 217.771 176.708 218.055 177.531 218.055ZM187.883 212.312H185.711V216.375C185.711 217.453 186.255 217.992 187.344 217.992C187.562 217.992 187.742 217.971 187.883 217.93V219C187.648 219.052 187.398 219.078 187.133 219.078C186.32 219.078 185.685 218.854 185.227 218.406C184.768 217.953 184.539 217.281 184.539 216.391V212.312H183.008V211.227H184.539V209.078H185.711V211.227H187.883V212.312ZM192.617 217.992C192.669 218.003 192.766 218.008 192.906 218.008C193.505 218.008 193.953 217.82 194.25 217.445C194.547 217.07 194.695 216.49 194.695 215.703V207.797H195.914V215.977C195.914 216.992 195.674 217.773 195.195 218.32C194.721 218.867 194.06 219.141 193.211 219.141C192.945 219.141 192.747 219.13 192.617 219.109V217.992ZM204.133 211.227H205.305V219H204.133V217.492C203.883 218.018 203.529 218.427 203.07 218.719C202.617 219.01 202.086 219.156 201.477 219.156C200.477 219.156 199.68 218.844 199.086 218.219C198.492 217.594 198.195 216.755 198.195 215.703V211.227H199.367V215.578C199.367 216.333 199.581 216.935 200.008 217.383C200.435 217.831 201.005 218.055 201.719 218.055C202.453 218.055 203.039 217.831 203.477 217.383C203.914 216.935 204.133 216.333 204.133 215.578V211.227ZM211.875 211.062C212.578 211.062 213.224 211.242 213.812 211.602C214.406 211.956 214.875 212.445 215.219 213.07C215.562 213.69 215.734 214.37 215.734 215.109C215.734 215.849 215.562 216.531 215.219 217.156C214.875 217.776 214.406 218.266 213.812 218.625C213.224 218.979 212.578 219.156 211.875 219.156C211.141 219.156 210.5 218.987 209.953 218.648C209.411 218.305 208.997 217.82 208.711 217.195V221.93H207.539V211.227H208.711V213.016C208.992 212.396 209.406 211.917 209.953 211.578C210.5 211.234 211.141 211.062 211.875 211.062ZM211.656 218.055C212.479 218.055 213.172 217.771 213.734 217.203C214.297 216.635 214.578 215.938 214.578 215.109C214.578 214.281 214.297 213.581 213.734 213.008C213.172 212.435 212.479 212.148 211.656 212.148C210.807 212.148 210.104 212.43 209.547 212.992C208.99 213.549 208.711 214.255 208.711 215.109C208.711 215.958 208.99 216.661 209.547 217.219C210.104 217.776 210.807 218.055 211.656 218.055ZM218.102 207.828C218.326 207.828 218.523 207.911 218.695 208.078C218.867 208.245 218.953 208.44 218.953 208.664C218.953 208.893 218.867 209.094 218.695 209.266C218.523 209.432 218.326 209.516 218.102 209.516C217.872 209.516 217.677 209.432 217.516 209.266C217.354 209.099 217.273 208.898 217.273 208.664C217.273 208.44 217.354 208.245 217.516 208.078C217.677 207.911 217.872 207.828 218.102 207.828ZM217.508 211.227H218.68V219H217.508V211.227ZM224.914 212.312H222.742V216.375C222.742 217.453 223.286 217.992 224.375 217.992C224.594 217.992 224.773 217.971 224.914 217.93V219C224.68 219.052 224.43 219.078 224.164 219.078C223.352 219.078 222.716 218.854 222.258 218.406C221.799 217.953 221.57 217.281 221.57 216.391V212.312H220.039V211.227H221.57V209.078H222.742V211.227H224.914V212.312ZM233.242 214.875C233.242 215.109 233.237 215.258 233.227 215.32H226.711C226.768 216.154 227.055 216.826 227.57 217.336C228.086 217.846 228.75 218.102 229.562 218.102C230.188 218.102 230.724 217.961 231.172 217.68C231.625 217.393 231.904 217.013 232.008 216.539H233.18C233.029 217.326 232.617 217.958 231.945 218.438C231.273 218.917 230.469 219.156 229.531 219.156C228.401 219.156 227.456 218.766 226.695 217.984C225.94 217.203 225.562 216.229 225.562 215.062C225.562 213.943 225.945 212.997 226.711 212.227C227.477 211.451 228.411 211.062 229.516 211.062C230.208 211.062 230.839 211.227 231.406 211.555C231.974 211.878 232.422 212.331 232.75 212.914C233.078 213.497 233.242 214.151 233.242 214.875ZM226.766 214.328H231.992C231.935 213.682 231.672 213.154 231.203 212.742C230.74 212.326 230.161 212.117 229.469 212.117C228.781 212.117 228.193 212.318 227.703 212.719C227.214 213.12 226.901 213.656 226.766 214.328ZM238.398 211.062C238.602 211.062 238.844 211.094 239.125 211.156V212.25C238.87 212.161 238.617 212.117 238.367 212.117C237.758 212.117 237.245 212.333 236.828 212.766C236.417 213.193 236.211 213.734 236.211 214.391V219H235.039V211.227H236.211V212.469C236.44 212.031 236.745 211.688 237.125 211.438C237.505 211.188 237.93 211.062 238.398 211.062ZM245.555 218.984C244.945 217.547 244.641 216.026 244.641 214.422C244.641 212.818 244.945 211.297 245.555 209.859C246.169 208.417 246.964 207.292 247.938 206.484L248.625 207.273C247.776 207.982 247.083 208.987 246.547 210.289C246.01 211.591 245.742 212.969 245.742 214.422C245.742 215.875 246.01 217.253 246.547 218.555C247.083 219.852 247.776 220.854 248.625 221.562L247.938 222.344C246.964 221.542 246.169 220.422 245.555 218.984ZM257.242 219L256.156 216.266H250.859L249.766 219H248.492L252.969 207.797H254.055L258.555 219H257.242ZM251.32 215.109H255.703L253.516 209.578L251.32 215.109ZM268.961 211.062C269.93 211.062 270.698 211.357 271.266 211.945C271.839 212.529 272.125 213.328 272.125 214.344V219H270.961V214.555C270.961 213.81 270.766 213.227 270.375 212.805C269.99 212.383 269.458 212.172 268.781 212.172C268.505 212.172 268.242 212.216 267.992 212.305C267.742 212.393 267.508 212.529 267.289 212.711C267.076 212.893 266.904 213.143 266.773 213.461C266.648 213.779 266.586 214.143 266.586 214.555V219H265.422V214.555C265.422 213.81 265.227 213.227 264.836 212.805C264.451 212.383 263.919 212.172 263.242 212.172C262.971 212.172 262.711 212.216 262.461 212.305C262.216 212.388 261.984 212.521 261.766 212.703C261.552 212.88 261.38 213.128 261.25 213.445C261.12 213.763 261.055 214.133 261.055 214.555V219H259.883V211.227H261.055V212.57C261.31 212.06 261.667 211.682 262.125 211.438C262.583 211.188 263.073 211.062 263.594 211.062C264.932 211.062 265.826 211.622 266.273 212.742C266.492 212.211 266.846 211.799 267.336 211.508C267.826 211.211 268.367 211.062 268.961 211.062ZM274.961 207.828C275.185 207.828 275.383 207.911 275.555 208.078C275.727 208.245 275.812 208.44 275.812 208.664C275.812 208.893 275.727 209.094 275.555 209.266C275.383 209.432 275.185 209.516 274.961 209.516C274.732 209.516 274.536 209.432 274.375 209.266C274.214 209.099 274.133 208.898 274.133 208.664C274.133 208.44 274.214 208.245 274.375 208.078C274.536 207.911 274.732 207.828 274.961 207.828ZM274.367 211.227H275.539V219H274.367V211.227ZM281.328 219.156C280.198 219.156 279.245 218.768 278.469 217.992C277.698 217.211 277.312 216.25 277.312 215.109C277.312 213.969 277.698 213.01 278.469 212.234C279.245 211.453 280.198 211.062 281.328 211.062C282.208 211.062 282.992 211.32 283.68 211.836C284.367 212.346 284.784 212.99 284.93 213.766H283.742C283.612 213.302 283.32 212.922 282.867 212.625C282.414 212.323 281.901 212.172 281.328 212.172C280.521 212.172 279.841 212.453 279.289 213.016C278.737 213.578 278.461 214.276 278.461 215.109C278.461 215.938 278.737 216.635 279.289 217.203C279.841 217.771 280.521 218.055 281.328 218.055C281.906 218.055 282.424 217.898 282.883 217.586C283.346 217.273 283.633 216.87 283.742 216.375H284.93C284.81 217.188 284.404 217.854 283.711 218.375C283.023 218.896 282.229 219.156 281.328 219.156ZM293.117 211.227H294.289V219H293.117V217.195C292.831 217.82 292.414 218.305 291.867 218.648C291.326 218.987 290.688 219.156 289.953 219.156C289.25 219.156 288.602 218.977 288.008 218.617C287.419 218.258 286.953 217.766 286.609 217.141C286.266 216.516 286.094 215.833 286.094 215.094C286.094 214.354 286.266 213.674 286.609 213.055C286.953 212.435 287.419 211.948 288.008 211.594C288.602 211.24 289.25 211.062 289.953 211.062C290.688 211.062 291.328 211.234 291.875 211.578C292.422 211.917 292.836 212.396 293.117 213.016V211.227ZM290.172 218.055C291.021 218.055 291.724 217.776 292.281 217.219C292.839 216.656 293.117 215.948 293.117 215.094C293.117 214.245 292.839 213.542 292.281 212.984C291.724 212.427 291.021 212.148 290.172 212.148C289.349 212.148 288.654 212.435 288.086 213.008C287.523 213.581 287.242 214.276 287.242 215.094C287.242 215.927 287.523 216.63 288.086 217.203C288.654 217.771 289.349 218.055 290.172 218.055ZM300.531 207.797H306.789V208.953H301.727V212.57H306.242V213.719H301.727V219H300.531V207.797ZM308.711 207.828C308.935 207.828 309.133 207.911 309.305 208.078C309.477 208.245 309.562 208.44 309.562 208.664C309.562 208.893 309.477 209.094 309.305 209.266C309.133 209.432 308.935 209.516 308.711 209.516C308.482 209.516 308.286 209.432 308.125 209.266C307.964 209.099 307.883 208.898 307.883 208.664C307.883 208.44 307.964 208.245 308.125 208.078C308.286 207.911 308.482 207.828 308.711 207.828ZM308.117 211.227H309.289V219H308.117V211.227ZM315.352 211.062C316.357 211.062 317.154 211.375 317.742 212C318.336 212.62 318.633 213.461 318.633 214.523V219H317.461V214.633C317.461 213.888 317.245 213.292 316.812 212.844C316.385 212.396 315.818 212.172 315.109 212.172C314.38 212.172 313.794 212.398 313.352 212.852C312.914 213.299 312.695 213.893 312.695 214.633V219H311.523V211.227H312.695V212.742C312.945 212.211 313.299 211.799 313.758 211.508C314.216 211.211 314.747 211.062 315.352 211.062ZM327.445 207.797V208.953H323.766V219H322.562V208.953H318.883V207.797H327.445ZM334.461 214.875C334.461 215.109 334.456 215.258 334.445 215.32H327.93C327.987 216.154 328.273 216.826 328.789 217.336C329.305 217.846 329.969 218.102 330.781 218.102C331.406 218.102 331.943 217.961 332.391 217.68C332.844 217.393 333.122 217.013 333.227 216.539H334.398C334.247 217.326 333.836 217.958 333.164 218.438C332.492 218.917 331.688 219.156 330.75 219.156C329.62 219.156 328.674 218.766 327.914 217.984C327.159 217.203 326.781 216.229 326.781 215.062C326.781 213.943 327.164 212.997 327.93 212.227C328.695 211.451 329.63 211.062 330.734 211.062C331.427 211.062 332.057 211.227 332.625 211.555C333.193 211.878 333.641 212.331 333.969 212.914C334.297 213.497 334.461 214.151 334.461 214.875ZM327.984 214.328H333.211C333.154 213.682 332.891 213.154 332.422 212.742C331.958 212.326 331.38 212.117 330.688 212.117C330 212.117 329.411 212.318 328.922 212.719C328.432 213.12 328.12 213.656 327.984 214.328ZM339.562 219.156C338.432 219.156 337.479 218.768 336.703 217.992C335.932 217.211 335.547 216.25 335.547 215.109C335.547 213.969 335.932 213.01 336.703 212.234C337.479 211.453 338.432 211.062 339.562 211.062C340.443 211.062 341.227 211.32 341.914 211.836C342.602 212.346 343.018 212.99 343.164 213.766H341.977C341.846 213.302 341.555 212.922 341.102 212.625C340.648 212.323 340.135 212.172 339.562 212.172C338.755 212.172 338.076 212.453 337.523 213.016C336.971 213.578 336.695 214.276 336.695 215.109C336.695 215.938 336.971 216.635 337.523 217.203C338.076 217.771 338.755 218.055 339.562 218.055C340.141 218.055 340.659 217.898 341.117 217.586C341.581 217.273 341.867 216.87 341.977 216.375H343.164C343.044 217.188 342.638 217.854 341.945 218.375C341.258 218.896 340.464 219.156 339.562 219.156ZM348.648 211.062C349.654 211.062 350.451 211.375 351.039 212C351.633 212.62 351.93 213.461 351.93 214.523V219H350.758V214.633C350.758 213.888 350.542 213.292 350.109 212.844C349.682 212.396 349.115 212.172 348.406 212.172C347.677 212.172 347.091 212.398 346.648 212.852C346.211 213.299 345.992 213.893 345.992 214.633V219H344.82V207.797H345.992V212.742C346.242 212.211 346.596 211.799 347.055 211.508C347.513 211.211 348.044 211.062 348.648 211.062ZM362.477 207.797C363.419 207.797 364.206 208.107 364.836 208.727C365.471 209.341 365.789 210.104 365.789 211.016C365.789 211.938 365.471 212.708 364.836 213.328C364.206 213.943 363.419 214.25 362.477 214.25H359.367V219H358.172V207.797H362.477ZM362.477 213.094C363.07 213.094 363.568 212.896 363.969 212.5C364.37 212.099 364.57 211.604 364.57 211.016C364.57 210.432 364.37 209.943 363.969 209.547C363.568 209.151 363.07 208.953 362.477 208.953H359.367V213.094H362.477ZM374.297 211.227L370.984 219H369.961L366.633 211.227H367.898L370.469 217.531L373.016 211.227H374.297ZM379.68 212.312H377.508V216.375C377.508 217.453 378.052 217.992 379.141 217.992C379.359 217.992 379.539 217.971 379.68 217.93V219C379.445 219.052 379.195 219.078 378.93 219.078C378.117 219.078 377.482 218.854 377.023 218.406C376.565 217.953 376.336 217.281 376.336 216.391V212.312H374.805V211.227H376.336V209.078H377.508V211.227H379.68V212.312ZM382.016 219.156C381.75 219.156 381.529 219.07 381.352 218.898C381.174 218.721 381.086 218.5 381.086 218.234C381.086 217.974 381.174 217.755 381.352 217.578C381.529 217.396 381.75 217.305 382.016 217.305C382.286 217.305 382.51 217.396 382.688 217.578C382.865 217.755 382.953 217.974 382.953 218.234C382.953 218.5 382.865 218.721 382.688 218.898C382.51 219.07 382.286 219.156 382.016 219.156ZM389.016 207.797H390.211V217.852H395.875V219H389.016V207.797ZM400.492 212.312H398.32V216.375C398.32 217.453 398.865 217.992 399.953 217.992C400.172 217.992 400.352 217.971 400.492 217.93V219C400.258 219.052 400.008 219.078 399.742 219.078C398.93 219.078 398.294 218.854 397.836 218.406C397.378 217.953 397.148 217.281 397.148 216.391V212.312H395.617V211.227H397.148V209.078H398.32V211.227H400.492V212.312ZM408.164 207.797H409.336V219H408.164V217.195C407.878 217.82 407.461 218.305 406.914 218.648C406.372 218.987 405.734 219.156 405 219.156C404.297 219.156 403.648 218.977 403.055 218.617C402.466 218.258 402 217.766 401.656 217.141C401.312 216.516 401.141 215.833 401.141 215.094C401.141 214.354 401.312 213.674 401.656 213.055C402 212.435 402.466 211.948 403.055 211.594C403.648 211.24 404.297 211.062 405 211.062C405.734 211.062 406.375 211.234 406.922 211.578C407.469 211.917 407.883 212.396 408.164 213.016V207.797ZM405.219 218.055C406.068 218.055 406.771 217.776 407.328 217.219C407.885 216.656 408.164 215.948 408.164 215.094C408.164 214.245 407.885 213.542 407.328 212.984C406.771 212.427 406.068 212.148 405.219 212.148C404.396 212.148 403.701 212.435 403.133 213.008C402.57 213.581 402.289 214.276 402.289 215.094C402.289 215.927 402.57 216.63 403.133 217.203C403.701 217.771 404.396 218.055 405.219 218.055ZM412.312 219.156C412.047 219.156 411.826 219.07 411.648 218.898C411.471 218.721 411.383 218.5 411.383 218.234C411.383 217.974 411.471 217.755 411.648 217.578C411.826 217.396 412.047 217.305 412.312 217.305C412.583 217.305 412.807 217.396 412.984 217.578C413.161 217.755 413.25 217.974 413.25 218.234C413.25 218.5 413.161 218.721 412.984 218.898C412.807 219.07 412.583 219.156 412.312 219.156ZM416.914 209.859C417.529 211.297 417.836 212.818 417.836 214.422C417.836 216.026 417.529 217.547 416.914 218.984C416.305 220.422 415.513 221.542 414.539 222.344L413.852 221.562C414.701 220.854 415.393 219.852 415.93 218.555C416.466 217.253 416.734 215.875 416.734 214.422C416.734 212.969 416.466 211.591 415.93 210.289C415.393 208.987 414.701 207.982 413.852 207.273L414.539 206.484C415.513 207.292 416.305 208.417 416.914 209.859ZM424.086 206.203H425.305V221.945H424.086V206.203ZM431.547 219V207.797H432.969L437.227 217.227L441.562 207.797H442.797V219H441.578V210.234L437.609 219H436.695L432.742 210.234V219H431.547ZM445.922 219.156C445.656 219.156 445.435 219.07 445.258 218.898C445.081 218.721 444.992 218.5 444.992 218.234C444.992 217.974 445.081 217.755 445.258 217.578C445.435 217.396 445.656 217.305 445.922 217.305C446.193 217.305 446.417 217.396 446.594 217.578C446.771 217.755 446.859 217.974 446.859 218.234C446.859 218.5 446.771 218.721 446.594 218.898C446.417 219.07 446.193 219.156 445.922 219.156ZM455.195 207.797V208.953H451.516V219H450.312V208.953H446.633V207.797H455.195ZM462.211 214.875C462.211 215.109 462.206 215.258 462.195 215.32H455.68C455.737 216.154 456.023 216.826 456.539 217.336C457.055 217.846 457.719 218.102 458.531 218.102C459.156 218.102 459.693 217.961 460.141 217.68C460.594 217.393 460.872 217.013 460.977 216.539H462.148C461.997 217.326 461.586 217.958 460.914 218.438C460.242 218.917 459.438 219.156 458.5 219.156C457.37 219.156 456.424 218.766 455.664 217.984C454.909 217.203 454.531 216.229 454.531 215.062C454.531 213.943 454.914 212.997 455.68 212.227C456.445 211.451 457.38 211.062 458.484 211.062C459.177 211.062 459.807 211.227 460.375 211.555C460.943 211.878 461.391 212.331 461.719 212.914C462.047 213.497 462.211 214.151 462.211 214.875ZM455.734 214.328H460.961C460.904 213.682 460.641 213.154 460.172 212.742C459.708 212.326 459.13 212.117 458.438 212.117C457.75 212.117 457.161 212.318 456.672 212.719C456.182 213.12 455.87 213.656 455.734 214.328ZM467.312 219.156C466.182 219.156 465.229 218.768 464.453 217.992C463.682 217.211 463.297 216.25 463.297 215.109C463.297 213.969 463.682 213.01 464.453 212.234C465.229 211.453 466.182 211.062 467.312 211.062C468.193 211.062 468.977 211.32 469.664 211.836C470.352 212.346 470.768 212.99 470.914 213.766H469.727C469.596 213.302 469.305 212.922 468.852 212.625C468.398 212.323 467.885 212.172 467.312 212.172C466.505 212.172 465.826 212.453 465.273 213.016C464.721 213.578 464.445 214.276 464.445 215.109C464.445 215.938 464.721 216.635 465.273 217.203C465.826 217.771 466.505 218.055 467.312 218.055C467.891 218.055 468.409 217.898 468.867 217.586C469.331 217.273 469.617 216.87 469.727 216.375H470.914C470.794 217.188 470.388 217.854 469.695 218.375C469.008 218.896 468.214 219.156 467.312 219.156ZM476.398 211.062C477.404 211.062 478.201 211.375 478.789 212C479.383 212.62 479.68 213.461 479.68 214.523V219H478.508V214.633C478.508 213.888 478.292 213.292 477.859 212.844C477.432 212.396 476.865 212.172 476.156 212.172C475.427 212.172 474.841 212.398 474.398 212.852C473.961 213.299 473.742 213.893 473.742 214.633V219H472.57V207.797H473.742V212.742C473.992 212.211 474.346 211.799 474.805 211.508C475.263 211.211 475.794 211.062 476.398 211.062Z"
            fill="#0F47F2"
          />
          <path
            d="M92.4756 190.176C91.1221 190.176 90.0029 189.777 89.1182 188.98C88.2334 188.178 87.791 187.161 87.791 185.931H89.8828C89.8828 186.604 90.123 187.152 90.6035 187.574C91.0898 187.99 91.7139 188.198 92.4756 188.198C93.1904 188.198 93.7734 188.034 94.2246 187.706C94.6758 187.372 94.9014 186.941 94.9014 186.414C94.9014 186.115 94.8223 185.854 94.6641 185.632C94.5059 185.409 94.292 185.23 94.0225 185.096C93.7588 184.955 93.4512 184.832 93.0996 184.727C92.7539 184.621 92.3877 184.519 92.001 184.419C91.6201 184.319 91.2363 184.214 90.8496 184.103C90.4688 183.991 90.1025 183.845 89.751 183.663C89.4053 183.481 89.0977 183.271 88.8281 183.03C88.5645 182.79 88.3535 182.479 88.1953 182.099C88.0371 181.712 87.958 181.272 87.958 180.78C87.958 179.743 88.3594 178.891 89.1621 178.223C89.9648 177.555 90.9844 177.221 92.2207 177.221C92.9238 177.221 93.5566 177.326 94.1191 177.537C94.6875 177.748 95.1475 178.038 95.499 178.407C95.8564 178.771 96.1289 179.189 96.3164 179.664C96.5039 180.133 96.5977 180.637 96.5977 181.176H94.4355C94.418 180.602 94.2012 180.133 93.7852 179.77C93.3691 179.4 92.8242 179.216 92.1504 179.216C91.5117 179.216 90.9961 179.359 90.6035 179.646C90.2168 179.928 90.0234 180.3 90.0234 180.763C90.0234 181.044 90.1025 181.287 90.2607 181.492C90.4189 181.691 90.6328 181.853 90.9023 181.976C91.1719 182.099 91.4795 182.21 91.8252 182.31C92.1768 182.409 92.543 182.506 92.9238 182.6C93.3105 182.693 93.6973 182.799 94.084 182.916C94.4707 183.027 94.8369 183.18 95.1826 183.373C95.5342 183.561 95.8447 183.783 96.1143 184.041C96.3838 184.293 96.5977 184.621 96.7559 185.025C96.9141 185.43 96.9932 185.893 96.9932 186.414C96.9932 187.129 96.7969 187.773 96.4043 188.348C96.0176 188.922 95.4785 189.37 94.7871 189.692C94.1016 190.015 93.3311 190.176 92.4756 190.176ZM103.427 181.018C104.552 181.018 105.442 181.372 106.099 182.081C106.755 182.79 107.083 183.757 107.083 184.981V190H105.07V185.228C105.07 184.536 104.874 183.982 104.481 183.566C104.095 183.15 103.582 182.942 102.943 182.942C102.281 182.942 101.751 183.15 101.353 183.566C100.96 183.982 100.764 184.536 100.764 185.228V190H98.7686V177.396H100.764V182.582C101.045 182.084 101.414 181.7 101.871 181.431C102.328 181.155 102.847 181.018 103.427 181.018ZM109.298 177.493C109.55 177.241 109.852 177.115 110.203 177.115C110.555 177.115 110.856 177.241 111.108 177.493C111.366 177.745 111.495 178.044 111.495 178.39C111.495 178.747 111.366 179.052 111.108 179.304C110.856 179.556 110.555 179.682 110.203 179.682C109.852 179.682 109.55 179.556 109.298 179.304C109.046 179.052 108.92 178.747 108.92 178.39C108.92 178.044 109.046 177.745 109.298 177.493ZM109.192 181.202H111.188V190H109.192V181.202ZM121.743 190H119.15L115.406 185.843V190H113.411V177.396H115.406V184.999L118.975 181.202H121.471L117.428 185.43L121.743 190ZM127.685 181.018C128.81 181.018 129.7 181.372 130.356 182.081C131.013 182.79 131.341 183.757 131.341 184.981V190H129.328V185.228C129.328 184.536 129.132 183.982 128.739 183.566C128.353 183.15 127.84 182.942 127.201 182.942C126.539 182.942 126.009 183.15 125.61 183.566C125.218 183.982 125.021 184.536 125.021 185.228V190H123.026V177.396H125.021V182.582C125.303 182.084 125.672 181.7 126.129 181.431C126.586 181.155 127.104 181.018 127.685 181.018ZM140.323 181.202H142.345V190H140.323V188.453C140.001 189.01 139.576 189.438 139.049 189.736C138.521 190.029 137.909 190.176 137.212 190.176C136.444 190.176 135.738 189.974 135.094 189.569C134.449 189.159 133.939 188.603 133.564 187.899C133.189 187.19 133.002 186.42 133.002 185.588C133.002 184.756 133.189 183.988 133.564 183.285C133.939 182.582 134.449 182.028 135.094 181.624C135.738 181.22 136.444 181.018 137.212 181.018C137.909 181.018 138.521 181.167 139.049 181.466C139.576 181.765 140.001 182.192 140.323 182.749V181.202ZM137.643 188.269C138.404 188.269 139.04 188.014 139.55 187.504C140.065 186.988 140.323 186.35 140.323 185.588C140.323 184.832 140.065 184.199 139.55 183.689C139.04 183.18 138.404 182.925 137.643 182.925C136.898 182.925 136.269 183.186 135.753 183.707C135.237 184.223 134.979 184.85 134.979 185.588C134.979 186.338 135.237 186.974 135.753 187.495C136.269 188.011 136.898 188.269 137.643 188.269ZM152.839 190.176C151.485 190.176 150.366 189.777 149.481 188.98C148.597 188.178 148.154 187.161 148.154 185.931H150.246C150.246 186.604 150.486 187.152 150.967 187.574C151.453 187.99 152.077 188.198 152.839 188.198C153.554 188.198 154.137 188.034 154.588 187.706C155.039 187.372 155.265 186.941 155.265 186.414C155.265 186.115 155.186 185.854 155.027 185.632C154.869 185.409 154.655 185.23 154.386 185.096C154.122 184.955 153.814 184.832 153.463 184.727C153.117 184.621 152.751 184.519 152.364 184.419C151.983 184.319 151.6 184.214 151.213 184.103C150.832 183.991 150.466 183.845 150.114 183.663C149.769 183.481 149.461 183.271 149.191 183.03C148.928 182.79 148.717 182.479 148.559 182.099C148.4 181.712 148.321 181.272 148.321 180.78C148.321 179.743 148.723 178.891 149.525 178.223C150.328 177.555 151.348 177.221 152.584 177.221C153.287 177.221 153.92 177.326 154.482 177.537C155.051 177.748 155.511 178.038 155.862 178.407C156.22 178.771 156.492 179.189 156.68 179.664C156.867 180.133 156.961 180.637 156.961 181.176H154.799C154.781 180.602 154.564 180.133 154.148 179.77C153.732 179.4 153.188 179.216 152.514 179.216C151.875 179.216 151.359 179.359 150.967 179.646C150.58 179.928 150.387 180.3 150.387 180.763C150.387 181.044 150.466 181.287 150.624 181.492C150.782 181.691 150.996 181.853 151.266 181.976C151.535 182.099 151.843 182.21 152.188 182.31C152.54 182.409 152.906 182.506 153.287 182.6C153.674 182.693 154.061 182.799 154.447 182.916C154.834 183.027 155.2 183.18 155.546 183.373C155.897 183.561 156.208 183.783 156.478 184.041C156.747 184.293 156.961 184.621 157.119 185.025C157.277 185.43 157.356 185.893 157.356 186.414C157.356 187.129 157.16 187.773 156.768 188.348C156.381 188.922 155.842 189.37 155.15 189.692C154.465 190.015 153.694 190.176 152.839 190.176ZM159.237 177.493C159.489 177.241 159.791 177.115 160.143 177.115C160.494 177.115 160.796 177.241 161.048 177.493C161.306 177.745 161.435 178.044 161.435 178.39C161.435 178.747 161.306 179.052 161.048 179.304C160.796 179.556 160.494 179.682 160.143 179.682C159.791 179.682 159.489 179.556 159.237 179.304C158.985 179.052 158.859 178.747 158.859 178.39C158.859 178.044 158.985 177.745 159.237 177.493ZM159.132 181.202H161.127V190H159.132V181.202ZM167.903 181.018C169.028 181.018 169.919 181.372 170.575 182.081C171.231 182.79 171.56 183.757 171.56 184.981V190H169.547V185.228C169.547 184.536 169.351 183.982 168.958 183.566C168.571 183.15 168.059 182.942 167.42 182.942C166.758 182.942 166.228 183.15 165.829 183.566C165.437 183.982 165.24 184.536 165.24 185.228V190H163.245V181.202H165.24V182.582C165.521 182.084 165.891 181.7 166.348 181.431C166.805 181.155 167.323 181.018 167.903 181.018ZM180.542 181.176H182.563V189.675C182.563 190.888 182.142 191.857 181.298 192.584C180.46 193.311 179.388 193.674 178.081 193.674C177.706 193.674 177.328 193.642 176.947 193.577C176.572 193.519 176.188 193.41 175.796 193.252C175.403 193.094 175.055 192.897 174.75 192.663C174.451 192.429 174.199 192.121 173.994 191.74C173.795 191.365 173.687 190.94 173.669 190.466H175.664C175.688 190.94 175.922 191.312 176.367 191.582C176.818 191.857 177.369 191.995 178.02 191.995C178.729 191.995 179.326 191.784 179.812 191.362C180.299 190.946 180.542 190.407 180.542 189.745V188.233C180.22 188.778 179.795 189.197 179.268 189.49C178.74 189.783 178.128 189.93 177.431 189.93C176.265 189.93 175.271 189.496 174.451 188.629C173.631 187.756 173.221 186.701 173.221 185.465C173.221 184.656 173.408 183.912 173.783 183.232C174.158 182.547 174.668 182.008 175.312 181.615C175.957 181.217 176.663 181.018 177.431 181.018C178.128 181.018 178.74 181.164 179.268 181.457C179.795 181.744 180.22 182.157 180.542 182.696V181.176ZM177.861 188.058C178.629 188.058 179.268 187.812 179.777 187.319C180.287 186.827 180.542 186.209 180.542 185.465C180.542 184.727 180.284 184.111 179.769 183.619C179.259 183.121 178.623 182.872 177.861 182.872C177.117 182.872 176.487 183.124 175.972 183.628C175.456 184.132 175.198 184.744 175.198 185.465C175.198 186.191 175.453 186.807 175.963 187.311C176.479 187.809 177.111 188.058 177.861 188.058ZM189.349 181.018C190.474 181.018 191.364 181.372 192.021 182.081C192.677 182.79 193.005 183.757 193.005 184.981V190H190.992V185.228C190.992 184.536 190.796 183.982 190.403 183.566C190.017 183.15 189.504 182.942 188.865 182.942C188.203 182.942 187.673 183.15 187.274 183.566C186.882 183.982 186.686 184.536 186.686 185.228V190H184.69V177.396H186.686V182.582C186.967 182.084 187.336 181.7 187.793 181.431C188.25 181.155 188.769 181.018 189.349 181.018Z"
            fill="#222222"
          />
          <path d="M87 271H767" stroke="#818283" stroke-width="0.5" />
          <circle cx="172" cy="393" r="13" fill="#4B5563" />
          <path
            d="M169.99 393.017C169.99 394.092 169.097 394.964 167.995 394.964C166.893 394.964 166 394.092 166 393.017C166 391.942 166.893 391.07 167.995 391.07C169.097 391.07 169.99 391.942 169.99 393.017Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M173.981 388.727L169.99 391.452"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M173.981 397.304L169.99 394.578"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M177.973 398.076C177.973 399.151 177.08 400.023 175.978 400.023C174.876 400.023 173.982 399.151 173.982 398.076C173.982 397.001 174.876 396.129 175.978 396.129C177.08 396.129 177.973 397.001 177.973 398.076Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M177.973 387.947C177.973 389.022 177.08 389.894 175.978 389.894C174.876 389.894 173.982 389.022 173.982 387.947C173.982 386.872 174.876 386 175.978 386C177.08 386 177.973 386.872 177.973 387.947Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <rect
            x="30.5"
            y="449.5"
            width="769"
            height="279"
            rx="5.5"
            fill="white"
            stroke="#E2E2E2"
          />
          <rect x="718" y="502" width="52" height="52" rx="6" fill="#DFFBE2" />
          <path
            d="M728.91 522.426C729.639 522.009 730.43 521.801 731.283 521.801C732.136 521.801 732.924 522.009 733.646 522.426C734.369 522.836 734.942 523.399 735.365 524.115C735.788 524.825 736 525.6 736 526.439C736 526.934 735.896 527.491 735.688 528.109C735.486 528.721 735.196 529.33 734.818 529.936L731.039 536H729.32L732.816 530.521C732.283 530.854 731.697 531.02 731.059 531.02C729.789 531.02 728.721 530.58 727.855 529.701C726.99 528.822 726.557 527.735 726.557 526.439C726.557 525.6 726.768 524.825 727.191 524.115C727.615 523.399 728.188 522.836 728.91 522.426ZM731.303 529.721C732.201 529.721 732.96 529.405 733.578 528.773C734.203 528.142 734.516 527.37 734.516 526.459C734.516 525.554 734.203 524.792 733.578 524.174C732.96 523.549 732.195 523.236 731.283 523.236C730.365 523.236 729.59 523.549 728.959 524.174C728.334 524.792 728.021 525.554 728.021 526.459C728.021 527.37 728.337 528.142 728.969 528.773C729.607 529.405 730.385 529.721 731.303 529.721ZM736.996 536V534.877L742.377 529.496C743.1 528.76 743.633 528.109 743.979 527.543C744.324 526.97 744.496 526.417 744.496 525.883C744.496 525.121 744.229 524.493 743.695 523.998C743.161 523.503 742.488 523.256 741.674 523.256C740.73 523.256 739.965 523.542 739.379 524.115C738.799 524.688 738.52 525.456 738.539 526.42H737.035C737.009 525.502 737.198 524.688 737.602 523.979C738.005 523.269 738.562 522.729 739.271 522.357C739.988 521.986 740.795 521.801 741.693 521.801C742.95 521.801 743.988 522.182 744.809 522.943C745.629 523.699 746.039 524.665 746.039 525.844C746.039 527.243 745.18 528.77 743.461 530.424L739.359 534.535H746.215V536H736.996ZM752.67 522.611C753.171 523.145 753.422 523.822 753.422 524.643C753.422 525.463 753.171 526.146 752.67 526.693C752.169 527.234 751.534 527.504 750.766 527.504C749.984 527.504 749.34 527.234 748.832 526.693C748.331 526.146 748.08 525.463 748.08 524.643C748.08 523.822 748.331 523.145 748.832 522.611C749.34 522.071 749.984 521.801 750.766 521.801C751.534 521.801 752.169 522.071 752.67 522.611ZM757.982 521.996H759.203L749.906 536H748.686L757.982 521.996ZM751.938 525.98C752.237 525.635 752.387 525.189 752.387 524.643C752.387 524.096 752.237 523.65 751.938 523.305C751.638 522.953 751.247 522.777 750.766 522.777C750.271 522.777 749.874 522.953 749.574 523.305C749.275 523.65 749.125 524.096 749.125 524.643C749.125 525.189 749.275 525.635 749.574 525.98C749.874 526.326 750.271 526.498 750.766 526.498C751.247 526.498 751.638 526.326 751.938 525.98ZM759.779 533.344C759.779 534.171 759.529 534.854 759.027 535.395C758.533 535.928 757.898 536.195 757.123 536.195C756.342 536.195 755.701 535.928 755.199 535.395C754.698 534.861 754.447 534.177 754.447 533.344C754.447 532.523 754.698 531.846 755.199 531.312C755.701 530.772 756.342 530.502 757.123 530.502C757.891 530.502 758.526 530.772 759.027 531.312C759.529 531.846 759.779 532.523 759.779 533.344ZM758.744 533.344C758.744 532.797 758.594 532.351 758.295 532.006C757.995 531.654 757.605 531.479 757.123 531.479C756.628 531.479 756.231 531.654 755.932 532.006C755.632 532.351 755.482 532.797 755.482 533.344C755.482 533.897 755.632 534.35 755.932 534.701C756.231 535.046 756.628 535.219 757.123 535.219C757.611 535.219 758.002 535.046 758.295 534.701C758.594 534.35 758.744 533.897 758.744 533.344Z"
            fill="#00A25E"
          />
          <path
            d="M107.062 546V534.797H110.945C111.82 534.797 112.568 535.073 113.188 535.625C113.807 536.172 114.117 536.831 114.117 537.602C114.117 538.201 113.935 538.737 113.57 539.211C113.206 539.685 112.753 539.974 112.211 540.078C112.914 540.151 113.505 540.458 113.984 541C114.469 541.542 114.711 542.18 114.711 542.914C114.711 543.773 114.391 544.503 113.75 545.102C113.115 545.701 112.341 546 111.43 546H107.062ZM108.258 539.68H110.914C111.466 539.68 111.935 539.495 112.32 539.125C112.706 538.75 112.898 538.294 112.898 537.758C112.898 537.258 112.703 536.833 112.312 536.484C111.927 536.13 111.461 535.953 110.914 535.953H108.258V539.68ZM108.258 544.852H111.367C111.971 544.852 112.474 544.651 112.875 544.25C113.276 543.849 113.477 543.354 113.477 542.766C113.477 542.182 113.273 541.69 112.867 541.289C112.466 540.888 111.971 540.688 111.383 540.688H108.258V544.852ZM122.93 538.227H124.102V546H122.93V544.195C122.643 544.82 122.227 545.305 121.68 545.648C121.138 545.987 120.5 546.156 119.766 546.156C119.062 546.156 118.414 545.977 117.82 545.617C117.232 545.258 116.766 544.766 116.422 544.141C116.078 543.516 115.906 542.833 115.906 542.094C115.906 541.354 116.078 540.674 116.422 540.055C116.766 539.435 117.232 538.948 117.82 538.594C118.414 538.24 119.062 538.062 119.766 538.062C120.5 538.062 121.141 538.234 121.688 538.578C122.234 538.917 122.648 539.396 122.93 540.016V538.227ZM119.984 545.055C120.833 545.055 121.536 544.776 122.094 544.219C122.651 543.656 122.93 542.948 122.93 542.094C122.93 541.245 122.651 540.542 122.094 539.984C121.536 539.427 120.833 539.148 119.984 539.148C119.161 539.148 118.466 539.435 117.898 540.008C117.336 540.581 117.055 541.276 117.055 542.094C117.055 542.927 117.336 543.63 117.898 544.203C118.466 544.771 119.161 545.055 119.984 545.055ZM130.164 538.062C131.169 538.062 131.966 538.375 132.555 539C133.148 539.62 133.445 540.461 133.445 541.523V546H132.273V541.633C132.273 540.888 132.057 540.292 131.625 539.844C131.198 539.396 130.63 539.172 129.922 539.172C129.193 539.172 128.607 539.398 128.164 539.852C127.727 540.299 127.508 540.893 127.508 541.633V546H126.336V538.227H127.508V539.742C127.758 539.211 128.112 538.799 128.57 538.508C129.029 538.211 129.56 538.062 130.164 538.062ZM142.242 538.211H143.414V545.758C143.414 546.826 143.052 547.685 142.328 548.336C141.604 548.987 140.674 549.312 139.539 549.312C139.091 549.312 138.656 549.255 138.234 549.141C137.812 549.031 137.419 548.87 137.055 548.656C136.695 548.443 136.401 548.154 136.172 547.789C135.948 547.43 135.828 547.021 135.812 546.562H136.945C136.961 547.094 137.214 547.518 137.703 547.836C138.193 548.159 138.794 548.32 139.508 548.32C140.299 548.32 140.953 548.086 141.469 547.617C141.984 547.154 142.242 546.549 142.242 545.805V544.094C141.956 544.708 141.539 545.185 140.992 545.523C140.451 545.862 139.812 546.031 139.078 546.031C138.375 546.031 137.727 545.854 137.133 545.5C136.544 545.146 136.078 544.661 135.734 544.047C135.391 543.432 135.219 542.76 135.219 542.031C135.219 541.307 135.391 540.641 135.734 540.031C136.078 539.422 136.544 538.943 137.133 538.594C137.727 538.24 138.375 538.062 139.078 538.062C139.812 538.062 140.451 538.232 140.992 538.57C141.539 538.904 141.956 539.375 142.242 539.984V538.211ZM139.297 544.945C140.146 544.945 140.849 544.672 141.406 544.125C141.964 543.573 142.242 542.875 142.242 542.031C142.242 541.198 141.964 540.508 141.406 539.961C140.849 539.409 140.146 539.133 139.297 539.133C138.474 539.133 137.779 539.414 137.211 539.977C136.648 540.534 136.367 541.219 136.367 542.031C136.367 542.849 136.648 543.539 137.211 544.102C137.779 544.664 138.474 544.945 139.297 544.945ZM152.211 538.227H153.383V546H152.211V544.195C151.924 544.82 151.508 545.305 150.961 545.648C150.419 545.987 149.781 546.156 149.047 546.156C148.344 546.156 147.695 545.977 147.102 545.617C146.513 545.258 146.047 544.766 145.703 544.141C145.359 543.516 145.188 542.833 145.188 542.094C145.188 541.354 145.359 540.674 145.703 540.055C146.047 539.435 146.513 538.948 147.102 538.594C147.695 538.24 148.344 538.062 149.047 538.062C149.781 538.062 150.422 538.234 150.969 538.578C151.516 538.917 151.93 539.396 152.211 540.016V538.227ZM149.266 545.055C150.115 545.055 150.818 544.776 151.375 544.219C151.932 543.656 152.211 542.948 152.211 542.094C152.211 541.245 151.932 540.542 151.375 539.984C150.818 539.427 150.115 539.148 149.266 539.148C148.443 539.148 147.747 539.435 147.18 540.008C146.617 540.581 146.336 541.276 146.336 542.094C146.336 542.927 146.617 543.63 147.18 544.203C147.747 544.771 148.443 545.055 149.266 545.055ZM156.789 534.797V546H155.617V534.797H156.789ZM159.484 539.234C160.26 538.453 161.214 538.062 162.344 538.062C163.474 538.062 164.427 538.453 165.203 539.234C165.984 540.01 166.375 540.969 166.375 542.109C166.375 543.25 165.984 544.211 165.203 544.992C164.427 545.768 163.474 546.156 162.344 546.156C161.214 546.156 160.26 545.768 159.484 544.992C158.714 544.211 158.328 543.25 158.328 542.109C158.328 540.969 158.714 540.01 159.484 539.234ZM162.344 539.172C161.536 539.172 160.857 539.453 160.305 540.016C159.753 540.578 159.477 541.276 159.477 542.109C159.477 542.938 159.753 543.635 160.305 544.203C160.857 544.771 161.536 545.055 162.344 545.055C163.151 545.055 163.833 544.771 164.391 544.203C164.948 543.63 165.227 542.932 165.227 542.109C165.227 541.281 164.948 540.586 164.391 540.023C163.839 539.456 163.156 539.172 162.344 539.172ZM171.508 538.062C171.711 538.062 171.953 538.094 172.234 538.156V539.25C171.979 539.161 171.727 539.117 171.477 539.117C170.867 539.117 170.354 539.333 169.938 539.766C169.526 540.193 169.32 540.734 169.32 541.391V546H168.148V538.227H169.32V539.469C169.549 539.031 169.854 538.688 170.234 538.438C170.615 538.188 171.039 538.062 171.508 538.062ZM180.32 541.875C180.32 542.109 180.315 542.258 180.305 542.32H173.789C173.846 543.154 174.133 543.826 174.648 544.336C175.164 544.846 175.828 545.102 176.641 545.102C177.266 545.102 177.802 544.961 178.25 544.68C178.703 544.393 178.982 544.013 179.086 543.539H180.258C180.107 544.326 179.695 544.958 179.023 545.438C178.352 545.917 177.547 546.156 176.609 546.156C175.479 546.156 174.534 545.766 173.773 544.984C173.018 544.203 172.641 543.229 172.641 542.062C172.641 540.943 173.023 539.997 173.789 539.227C174.555 538.451 175.49 538.062 176.594 538.062C177.286 538.062 177.917 538.227 178.484 538.555C179.052 538.878 179.5 539.331 179.828 539.914C180.156 540.497 180.32 541.151 180.32 541.875ZM173.844 541.328H179.07C179.013 540.682 178.75 540.154 178.281 539.742C177.818 539.326 177.24 539.117 176.547 539.117C175.859 539.117 175.271 539.318 174.781 539.719C174.292 540.12 173.979 540.656 173.844 541.328Z"
            fill="#4B5563"
          />
          <path
            d="M99.3327 538.665C99.3327 542.665 93.9993 546.665 93.9993 546.665C93.9993 546.665 88.666 542.665 88.666 538.665C88.666 537.251 89.2279 535.894 90.2281 534.894C91.2283 533.894 92.5849 533.332 93.9993 533.332C95.4138 533.332 96.7704 533.894 97.7706 534.894C98.7708 535.894 99.3327 537.251 99.3327 538.665Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M94 540.668C95.1046 540.668 96 539.773 96 538.668C96 537.563 95.1046 536.668 94 536.668C92.8954 536.668 92 537.563 92 538.668C92 539.773 92.8954 540.668 94 540.668Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M87.2656 588.797H93.5234V589.953H88.4609V593.438H92.9766V594.594H88.4609V598.852H93.5234V600H87.2656V588.797ZM101.992 600H100.602L98.375 596.945L96.1484 600H94.7734L97.6875 595.984L94.9531 592.227H96.3438L98.3906 595.039L100.422 592.227H101.797L99.0781 595.984L101.992 600ZM107.797 592.062C108.5 592.062 109.146 592.242 109.734 592.602C110.328 592.956 110.797 593.445 111.141 594.07C111.484 594.69 111.656 595.37 111.656 596.109C111.656 596.849 111.484 597.531 111.141 598.156C110.797 598.776 110.328 599.266 109.734 599.625C109.146 599.979 108.5 600.156 107.797 600.156C107.062 600.156 106.422 599.987 105.875 599.648C105.333 599.305 104.919 598.82 104.633 598.195V602.93H103.461V592.227H104.633V594.016C104.914 593.396 105.328 592.917 105.875 592.578C106.422 592.234 107.062 592.062 107.797 592.062ZM107.578 599.055C108.401 599.055 109.094 598.771 109.656 598.203C110.219 597.635 110.5 596.938 110.5 596.109C110.5 595.281 110.219 594.581 109.656 594.008C109.094 593.435 108.401 593.148 107.578 593.148C106.729 593.148 106.026 593.43 105.469 593.992C104.911 594.549 104.633 595.255 104.633 596.109C104.633 596.958 104.911 597.661 105.469 598.219C106.026 598.776 106.729 599.055 107.578 599.055ZM120.398 595.875C120.398 596.109 120.393 596.258 120.383 596.32H113.867C113.924 597.154 114.211 597.826 114.727 598.336C115.242 598.846 115.906 599.102 116.719 599.102C117.344 599.102 117.88 598.961 118.328 598.68C118.781 598.393 119.06 598.013 119.164 597.539H120.336C120.185 598.326 119.773 598.958 119.102 599.438C118.43 599.917 117.625 600.156 116.688 600.156C115.557 600.156 114.612 599.766 113.852 598.984C113.096 598.203 112.719 597.229 112.719 596.062C112.719 594.943 113.102 593.997 113.867 593.227C114.633 592.451 115.568 592.062 116.672 592.062C117.365 592.062 117.995 592.227 118.562 592.555C119.13 592.878 119.578 593.331 119.906 593.914C120.234 594.497 120.398 595.151 120.398 595.875ZM113.922 595.328H119.148C119.091 594.682 118.828 594.154 118.359 593.742C117.896 593.326 117.318 593.117 116.625 593.117C115.938 593.117 115.349 593.318 114.859 593.719C114.37 594.12 114.057 594.656 113.922 595.328ZM125.555 592.062C125.758 592.062 126 592.094 126.281 592.156V593.25C126.026 593.161 125.773 593.117 125.523 593.117C124.914 593.117 124.401 593.333 123.984 593.766C123.573 594.193 123.367 594.734 123.367 595.391V600H122.195V592.227H123.367V593.469C123.596 593.031 123.901 592.688 124.281 592.438C124.661 592.188 125.086 592.062 125.555 592.062ZM128.383 588.828C128.607 588.828 128.805 588.911 128.977 589.078C129.148 589.245 129.234 589.44 129.234 589.664C129.234 589.893 129.148 590.094 128.977 590.266C128.805 590.432 128.607 590.516 128.383 590.516C128.154 590.516 127.958 590.432 127.797 590.266C127.635 590.099 127.555 589.898 127.555 589.664C127.555 589.44 127.635 589.245 127.797 589.078C127.958 588.911 128.154 588.828 128.383 588.828ZM127.789 592.227H128.961V600H127.789V592.227ZM138.414 595.875C138.414 596.109 138.409 596.258 138.398 596.32H131.883C131.94 597.154 132.227 597.826 132.742 598.336C133.258 598.846 133.922 599.102 134.734 599.102C135.359 599.102 135.896 598.961 136.344 598.68C136.797 598.393 137.076 598.013 137.18 597.539H138.352C138.201 598.326 137.789 598.958 137.117 599.438C136.445 599.917 135.641 600.156 134.703 600.156C133.573 600.156 132.628 599.766 131.867 598.984C131.112 598.203 130.734 597.229 130.734 596.062C130.734 594.943 131.117 593.997 131.883 593.227C132.648 592.451 133.583 592.062 134.688 592.062C135.38 592.062 136.01 592.227 136.578 592.555C137.146 592.878 137.594 593.331 137.922 593.914C138.25 594.497 138.414 595.151 138.414 595.875ZM131.938 595.328H137.164C137.107 594.682 136.844 594.154 136.375 593.742C135.911 593.326 135.333 593.117 134.641 593.117C133.953 593.117 133.365 593.318 132.875 593.719C132.385 594.12 132.073 594.656 131.938 595.328ZM144.039 592.062C145.044 592.062 145.841 592.375 146.43 593C147.023 593.62 147.32 594.461 147.32 595.523V600H146.148V595.633C146.148 594.888 145.932 594.292 145.5 593.844C145.073 593.396 144.505 593.172 143.797 593.172C143.068 593.172 142.482 593.398 142.039 593.852C141.602 594.299 141.383 594.893 141.383 595.633V600H140.211V592.227H141.383V593.742C141.633 593.211 141.987 592.799 142.445 592.508C142.904 592.211 143.435 592.062 144.039 592.062ZM153.109 600.156C151.979 600.156 151.026 599.768 150.25 598.992C149.479 598.211 149.094 597.25 149.094 596.109C149.094 594.969 149.479 594.01 150.25 593.234C151.026 592.453 151.979 592.062 153.109 592.062C153.99 592.062 154.773 592.32 155.461 592.836C156.148 593.346 156.565 593.99 156.711 594.766H155.523C155.393 594.302 155.102 593.922 154.648 593.625C154.195 593.323 153.682 593.172 153.109 593.172C152.302 593.172 151.622 593.453 151.07 594.016C150.518 594.578 150.242 595.276 150.242 596.109C150.242 596.938 150.518 597.635 151.07 598.203C151.622 598.771 152.302 599.055 153.109 599.055C153.688 599.055 154.206 598.898 154.664 598.586C155.128 598.273 155.414 597.87 155.523 597.375H156.711C156.591 598.188 156.185 598.854 155.492 599.375C154.805 599.896 154.01 600.156 153.109 600.156ZM165.555 595.875C165.555 596.109 165.549 596.258 165.539 596.32H159.023C159.081 597.154 159.367 597.826 159.883 598.336C160.398 598.846 161.062 599.102 161.875 599.102C162.5 599.102 163.036 598.961 163.484 598.68C163.938 598.393 164.216 598.013 164.32 597.539H165.492C165.341 598.326 164.93 598.958 164.258 599.438C163.586 599.917 162.781 600.156 161.844 600.156C160.714 600.156 159.768 599.766 159.008 598.984C158.253 598.203 157.875 597.229 157.875 596.062C157.875 594.943 158.258 593.997 159.023 593.227C159.789 592.451 160.724 592.062 161.828 592.062C162.521 592.062 163.151 592.227 163.719 592.555C164.286 592.878 164.734 593.331 165.062 593.914C165.391 594.497 165.555 595.151 165.555 595.875ZM159.078 595.328H164.305C164.247 594.682 163.984 594.154 163.516 593.742C163.052 593.326 162.474 593.117 161.781 593.117C161.094 593.117 160.505 593.318 160.016 593.719C159.526 594.12 159.214 594.656 159.078 595.328Z"
            fill="#A8A8A8"
          />
          <path
            d="M91.4609 616.781C92.4766 616.781 93.3307 617.133 94.0234 617.836C94.7161 618.539 95.0625 619.409 95.0625 620.445C95.0625 621.117 94.8932 621.74 94.5547 622.312C94.2161 622.88 93.7578 623.331 93.1797 623.664C92.6016 623.992 91.9714 624.156 91.2891 624.156C90.6068 624.156 89.9766 623.992 89.3984 623.664C88.8255 623.331 88.3698 622.88 88.0312 622.312C87.6979 621.74 87.5312 621.117 87.5312 620.445C87.5312 620.044 87.6094 619.596 87.7656 619.102C87.9271 618.607 88.1562 618.122 88.4531 617.648L91.4766 612.797H92.8594L90.0859 617.148C90.5182 616.904 90.9766 616.781 91.4609 616.781ZM91.2891 623.008C92.0234 623.008 92.6406 622.76 93.1406 622.266C93.6458 621.766 93.8984 621.154 93.8984 620.43C93.8984 619.701 93.6432 619.083 93.1328 618.578C92.6276 618.073 92.0078 617.82 91.2734 617.82C90.5547 617.82 89.9453 618.073 89.4453 618.578C88.9453 619.083 88.6953 619.701 88.6953 620.43C88.6953 621.154 88.9453 621.766 89.4453 622.266C89.9453 622.76 90.5599 623.008 91.2891 623.008ZM99.6484 612.797H101.117L104.383 617.758L107.602 612.797H109.023L104.977 618.977V624H103.758V618.977L99.6484 612.797ZM115.617 619.875C115.617 620.109 115.612 620.258 115.602 620.32H109.086C109.143 621.154 109.43 621.826 109.945 622.336C110.461 622.846 111.125 623.102 111.938 623.102C112.562 623.102 113.099 622.961 113.547 622.68C114 622.393 114.279 622.013 114.383 621.539H115.555C115.404 622.326 114.992 622.958 114.32 623.438C113.648 623.917 112.844 624.156 111.906 624.156C110.776 624.156 109.831 623.766 109.07 622.984C108.315 622.203 107.938 621.229 107.938 620.062C107.938 618.943 108.32 617.997 109.086 617.227C109.852 616.451 110.786 616.062 111.891 616.062C112.583 616.062 113.214 616.227 113.781 616.555C114.349 616.878 114.797 617.331 115.125 617.914C115.453 618.497 115.617 619.151 115.617 619.875ZM109.141 619.328H114.367C114.31 618.682 114.047 618.154 113.578 617.742C113.115 617.326 112.536 617.117 111.844 617.117C111.156 617.117 110.568 617.318 110.078 617.719C109.589 618.12 109.276 618.656 109.141 619.328ZM123.727 616.227H124.898V624H123.727V622.195C123.44 622.82 123.023 623.305 122.477 623.648C121.935 623.987 121.297 624.156 120.562 624.156C119.859 624.156 119.211 623.977 118.617 623.617C118.029 623.258 117.562 622.766 117.219 622.141C116.875 621.516 116.703 620.833 116.703 620.094C116.703 619.354 116.875 618.674 117.219 618.055C117.562 617.435 118.029 616.948 118.617 616.594C119.211 616.24 119.859 616.062 120.562 616.062C121.297 616.062 121.938 616.234 122.484 616.578C123.031 616.917 123.445 617.396 123.727 618.016V616.227ZM120.781 623.055C121.63 623.055 122.333 622.776 122.891 622.219C123.448 621.656 123.727 620.948 123.727 620.094C123.727 619.245 123.448 618.542 122.891 617.984C122.333 617.427 121.63 617.148 120.781 617.148C119.958 617.148 119.263 617.435 118.695 618.008C118.133 618.581 117.852 619.276 117.852 620.094C117.852 620.927 118.133 621.63 118.695 622.203C119.263 622.771 119.958 623.055 120.781 623.055ZM130.492 616.062C130.695 616.062 130.938 616.094 131.219 616.156V617.25C130.964 617.161 130.711 617.117 130.461 617.117C129.852 617.117 129.339 617.333 128.922 617.766C128.51 618.193 128.305 618.734 128.305 619.391V624H127.133V616.227H128.305V617.469C128.534 617.031 128.839 616.688 129.219 616.438C129.599 616.188 130.023 616.062 130.492 616.062ZM135.07 624.156C134.195 624.156 133.471 623.935 132.898 623.492C132.326 623.049 132 622.451 131.922 621.695H133.039C133.091 622.138 133.299 622.492 133.664 622.758C134.029 623.018 134.482 623.148 135.023 623.148C135.565 623.148 136 623.026 136.328 622.781C136.661 622.531 136.828 622.211 136.828 621.82C136.828 621.56 136.76 621.341 136.625 621.164C136.49 620.982 136.31 620.846 136.086 620.758C135.867 620.669 135.617 620.589 135.336 620.516C135.055 620.443 134.766 620.383 134.469 620.336C134.172 620.289 133.883 620.216 133.602 620.117C133.32 620.018 133.068 619.901 132.844 619.766C132.625 619.625 132.448 619.427 132.312 619.172C132.177 618.911 132.109 618.602 132.109 618.242C132.109 617.602 132.362 617.078 132.867 616.672C133.372 616.266 134.042 616.062 134.875 616.062C135.641 616.062 136.299 616.266 136.852 616.672C137.409 617.073 137.732 617.612 137.82 618.289H136.641C136.583 617.924 136.388 617.625 136.055 617.391C135.721 617.156 135.318 617.039 134.844 617.039C134.37 617.039 133.984 617.143 133.688 617.352C133.396 617.555 133.25 617.823 133.25 618.156C133.25 618.438 133.336 618.667 133.508 618.844C133.685 619.021 133.911 619.151 134.188 619.234C134.464 619.318 134.768 619.391 135.102 619.453C135.44 619.51 135.776 619.583 136.109 619.672C136.448 619.76 136.755 619.878 137.031 620.023C137.307 620.169 137.531 620.391 137.703 620.688C137.88 620.984 137.969 621.352 137.969 621.789C137.969 622.477 137.693 623.044 137.141 623.492C136.594 623.935 135.904 624.156 135.07 624.156Z"
            fill="#4B5563"
          />
          <path
            d="M268.883 617.57L272.125 613.953H266.656V612.797H273.82V613.648L270.367 617.422C271.008 617.339 271.602 617.422 272.148 617.672C272.695 617.917 273.128 618.292 273.445 618.797C273.763 619.302 273.922 619.875 273.922 620.516C273.922 621.578 273.562 622.451 272.844 623.133C272.13 623.815 271.219 624.156 270.109 624.156C269.109 624.156 268.26 623.883 267.562 623.336C266.87 622.789 266.471 622.078 266.367 621.203H267.57C267.68 621.74 267.961 622.172 268.414 622.5C268.867 622.828 269.432 622.992 270.109 622.992C270.854 622.992 271.466 622.758 271.945 622.289C272.43 621.815 272.672 621.211 272.672 620.477C272.672 620.049 272.57 619.669 272.367 619.336C272.164 619.003 271.888 618.75 271.539 618.578C271.19 618.406 270.786 618.299 270.328 618.258C269.87 618.216 269.388 618.268 268.883 618.414V617.57ZM279.359 624.156C278.094 624.156 277.102 623.643 276.383 622.617C275.669 621.591 275.312 620.185 275.312 618.398C275.312 616.612 275.669 615.206 276.383 614.18C277.102 613.154 278.094 612.641 279.359 612.641C280.62 612.641 281.607 613.154 282.32 614.18C283.034 615.206 283.391 616.612 283.391 618.398C283.391 620.185 283.034 621.591 282.32 622.617C281.607 623.643 280.62 624.156 279.359 624.156ZM279.359 622.992C280.245 622.992 280.932 622.594 281.422 621.797C281.917 621 282.164 619.867 282.164 618.398C282.164 616.93 281.917 615.797 281.422 615C280.932 614.203 280.245 613.805 279.359 613.805C278.469 613.805 277.779 614.203 277.289 615C276.805 615.792 276.562 616.924 276.562 618.398C276.562 619.872 276.805 621.008 277.289 621.805C277.779 622.596 278.469 622.992 279.359 622.992ZM292.719 612.797C293.484 612.797 294.206 612.938 294.883 613.219C295.565 613.495 296.151 613.878 296.641 614.367C297.13 614.852 297.516 615.44 297.797 616.133C298.083 616.82 298.227 617.56 298.227 618.352C298.227 619.143 298.083 619.891 297.797 620.594C297.516 621.292 297.13 621.891 296.641 622.391C296.151 622.885 295.565 623.279 294.883 623.57C294.206 623.857 293.484 624 292.719 624H289.25V612.797H292.719ZM292.781 622.852C293.979 622.852 294.977 622.424 295.773 621.57C296.576 620.711 296.977 619.638 296.977 618.352C296.977 617.076 296.578 616.023 295.781 615.195C294.99 614.367 293.99 613.953 292.781 613.953H290.445V622.852H292.781ZM306.461 616.227H307.633V624H306.461V622.195C306.174 622.82 305.758 623.305 305.211 623.648C304.669 623.987 304.031 624.156 303.297 624.156C302.594 624.156 301.945 623.977 301.352 623.617C300.763 623.258 300.297 622.766 299.953 622.141C299.609 621.516 299.438 620.833 299.438 620.094C299.438 619.354 299.609 618.674 299.953 618.055C300.297 617.435 300.763 616.948 301.352 616.594C301.945 616.24 302.594 616.062 303.297 616.062C304.031 616.062 304.672 616.234 305.219 616.578C305.766 616.917 306.18 617.396 306.461 618.016V616.227ZM303.516 623.055C304.365 623.055 305.068 622.776 305.625 622.219C306.182 621.656 306.461 620.948 306.461 620.094C306.461 619.245 306.182 618.542 305.625 617.984C305.068 617.427 304.365 617.148 303.516 617.148C302.693 617.148 301.997 617.435 301.43 618.008C300.867 618.581 300.586 619.276 300.586 620.094C300.586 620.927 300.867 621.63 301.43 622.203C301.997 622.771 302.693 623.055 303.516 623.055ZM315.391 616.227H316.641L312.141 626.945H310.891L312.234 623.859L309.023 616.227H310.289L312.828 622.492L315.391 616.227ZM320.477 624.156C319.602 624.156 318.878 623.935 318.305 623.492C317.732 623.049 317.406 622.451 317.328 621.695H318.445C318.497 622.138 318.706 622.492 319.07 622.758C319.435 623.018 319.888 623.148 320.43 623.148C320.971 623.148 321.406 623.026 321.734 622.781C322.068 622.531 322.234 622.211 322.234 621.82C322.234 621.56 322.167 621.341 322.031 621.164C321.896 620.982 321.716 620.846 321.492 620.758C321.273 620.669 321.023 620.589 320.742 620.516C320.461 620.443 320.172 620.383 319.875 620.336C319.578 620.289 319.289 620.216 319.008 620.117C318.727 620.018 318.474 619.901 318.25 619.766C318.031 619.625 317.854 619.427 317.719 619.172C317.583 618.911 317.516 618.602 317.516 618.242C317.516 617.602 317.768 617.078 318.273 616.672C318.779 616.266 319.448 616.062 320.281 616.062C321.047 616.062 321.706 616.266 322.258 616.672C322.815 617.073 323.138 617.612 323.227 618.289H322.047C321.99 617.924 321.794 617.625 321.461 617.391C321.128 617.156 320.724 617.039 320.25 617.039C319.776 617.039 319.391 617.143 319.094 617.352C318.802 617.555 318.656 617.823 318.656 618.156C318.656 618.438 318.742 618.667 318.914 618.844C319.091 619.021 319.318 619.151 319.594 619.234C319.87 619.318 320.174 619.391 320.508 619.453C320.846 619.51 321.182 619.583 321.516 619.672C321.854 619.76 322.161 619.878 322.438 620.023C322.714 620.169 322.938 620.391 323.109 620.688C323.286 620.984 323.375 621.352 323.375 621.789C323.375 622.477 323.099 623.044 322.547 623.492C322 623.935 321.31 624.156 320.477 624.156Z"
            fill="#4B5563"
          />
          <path
            d="M266.266 588.797H267.398L273.672 597.789V588.797H274.891V600H273.766L267.461 591.023V600H266.266V588.797ZM277.969 593.234C278.745 592.453 279.698 592.062 280.828 592.062C281.958 592.062 282.911 592.453 283.688 593.234C284.469 594.01 284.859 594.969 284.859 596.109C284.859 597.25 284.469 598.211 283.688 598.992C282.911 599.768 281.958 600.156 280.828 600.156C279.698 600.156 278.745 599.768 277.969 598.992C277.198 598.211 276.812 597.25 276.812 596.109C276.812 594.969 277.198 594.01 277.969 593.234ZM280.828 593.172C280.021 593.172 279.341 593.453 278.789 594.016C278.237 594.578 277.961 595.276 277.961 596.109C277.961 596.938 278.237 597.635 278.789 598.203C279.341 598.771 280.021 599.055 280.828 599.055C281.635 599.055 282.318 598.771 282.875 598.203C283.432 597.63 283.711 596.932 283.711 596.109C283.711 595.281 283.432 594.586 282.875 594.023C282.323 593.456 281.641 593.172 280.828 593.172ZM290.336 593.312H288.164V597.375C288.164 598.453 288.708 598.992 289.797 598.992C290.016 598.992 290.195 598.971 290.336 598.93V600C290.102 600.052 289.852 600.078 289.586 600.078C288.773 600.078 288.138 599.854 287.68 599.406C287.221 598.953 286.992 598.281 286.992 597.391V593.312H285.461V592.227H286.992V590.078H288.164V592.227H290.336V593.312ZM292.555 588.828C292.779 588.828 292.977 588.911 293.148 589.078C293.32 589.245 293.406 589.44 293.406 589.664C293.406 589.893 293.32 590.094 293.148 590.266C292.977 590.432 292.779 590.516 292.555 590.516C292.326 590.516 292.13 590.432 291.969 590.266C291.807 590.099 291.727 589.898 291.727 589.664C291.727 589.44 291.807 589.245 291.969 589.078C292.13 588.911 292.326 588.828 292.555 588.828ZM291.961 592.227H293.133V600H291.961V592.227ZM298.922 600.156C297.792 600.156 296.839 599.768 296.062 598.992C295.292 598.211 294.906 597.25 294.906 596.109C294.906 594.969 295.292 594.01 296.062 593.234C296.839 592.453 297.792 592.062 298.922 592.062C299.802 592.062 300.586 592.32 301.273 592.836C301.961 593.346 302.378 593.99 302.523 594.766H301.336C301.206 594.302 300.914 593.922 300.461 593.625C300.008 593.323 299.495 593.172 298.922 593.172C298.115 593.172 297.435 593.453 296.883 594.016C296.331 594.578 296.055 595.276 296.055 596.109C296.055 596.938 296.331 597.635 296.883 598.203C297.435 598.771 298.115 599.055 298.922 599.055C299.5 599.055 300.018 598.898 300.477 598.586C300.94 598.273 301.227 597.87 301.336 597.375H302.523C302.404 598.188 301.997 598.854 301.305 599.375C300.617 599.896 299.823 600.156 298.922 600.156ZM311.367 595.875C311.367 596.109 311.362 596.258 311.352 596.32H304.836C304.893 597.154 305.18 597.826 305.695 598.336C306.211 598.846 306.875 599.102 307.688 599.102C308.312 599.102 308.849 598.961 309.297 598.68C309.75 598.393 310.029 598.013 310.133 597.539H311.305C311.154 598.326 310.742 598.958 310.07 599.438C309.398 599.917 308.594 600.156 307.656 600.156C306.526 600.156 305.581 599.766 304.82 598.984C304.065 598.203 303.688 597.229 303.688 596.062C303.688 594.943 304.07 593.997 304.836 593.227C305.602 592.451 306.536 592.062 307.641 592.062C308.333 592.062 308.964 592.227 309.531 592.555C310.099 592.878 310.547 593.331 310.875 593.914C311.203 594.497 311.367 595.151 311.367 595.875ZM304.891 595.328H310.117C310.06 594.682 309.797 594.154 309.328 593.742C308.865 593.326 308.286 593.117 307.594 593.117C306.906 593.117 306.318 593.318 305.828 593.719C305.339 594.12 305.026 594.656 304.891 595.328ZM321.477 588.797C322.419 588.797 323.206 589.107 323.836 589.727C324.471 590.341 324.789 591.104 324.789 592.016C324.789 592.938 324.471 593.708 323.836 594.328C323.206 594.943 322.419 595.25 321.477 595.25H318.367V600H317.172V588.797H321.477ZM321.477 594.094C322.07 594.094 322.568 593.896 322.969 593.5C323.37 593.099 323.57 592.604 323.57 592.016C323.57 591.432 323.37 590.943 322.969 590.547C322.568 590.151 322.07 589.953 321.477 589.953H318.367V594.094H321.477ZM333.055 595.875C333.055 596.109 333.049 596.258 333.039 596.32H326.523C326.581 597.154 326.867 597.826 327.383 598.336C327.898 598.846 328.562 599.102 329.375 599.102C330 599.102 330.536 598.961 330.984 598.68C331.438 598.393 331.716 598.013 331.82 597.539H332.992C332.841 598.326 332.43 598.958 331.758 599.438C331.086 599.917 330.281 600.156 329.344 600.156C328.214 600.156 327.268 599.766 326.508 598.984C325.753 598.203 325.375 597.229 325.375 596.062C325.375 594.943 325.758 593.997 326.523 593.227C327.289 592.451 328.224 592.062 329.328 592.062C330.021 592.062 330.651 592.227 331.219 592.555C331.786 592.878 332.234 593.331 332.562 593.914C332.891 594.497 333.055 595.151 333.055 595.875ZM326.578 595.328H331.805C331.747 594.682 331.484 594.154 331.016 593.742C330.552 593.326 329.974 593.117 329.281 593.117C328.594 593.117 328.005 593.318 327.516 593.719C327.026 594.12 326.714 594.656 326.578 595.328ZM338.211 592.062C338.414 592.062 338.656 592.094 338.938 592.156V593.25C338.682 593.161 338.43 593.117 338.18 593.117C337.57 593.117 337.057 593.333 336.641 593.766C336.229 594.193 336.023 594.734 336.023 595.391V600H334.852V592.227H336.023V593.469C336.253 593.031 336.557 592.688 336.938 592.438C337.318 592.188 337.742 592.062 338.211 592.062ZM341.039 588.828C341.263 588.828 341.461 588.911 341.633 589.078C341.805 589.245 341.891 589.44 341.891 589.664C341.891 589.893 341.805 590.094 341.633 590.266C341.461 590.432 341.263 590.516 341.039 590.516C340.81 590.516 340.615 590.432 340.453 590.266C340.292 590.099 340.211 589.898 340.211 589.664C340.211 589.44 340.292 589.245 340.453 589.078C340.615 588.911 340.81 588.828 341.039 588.828ZM340.445 592.227H341.617V600H340.445V592.227ZM344.547 593.234C345.323 592.453 346.276 592.062 347.406 592.062C348.536 592.062 349.49 592.453 350.266 593.234C351.047 594.01 351.438 594.969 351.438 596.109C351.438 597.25 351.047 598.211 350.266 598.992C349.49 599.768 348.536 600.156 347.406 600.156C346.276 600.156 345.323 599.768 344.547 598.992C343.776 598.211 343.391 597.25 343.391 596.109C343.391 594.969 343.776 594.01 344.547 593.234ZM347.406 593.172C346.599 593.172 345.919 593.453 345.367 594.016C344.815 594.578 344.539 595.276 344.539 596.109C344.539 596.938 344.815 597.635 345.367 598.203C345.919 598.771 346.599 599.055 347.406 599.055C348.214 599.055 348.896 598.771 349.453 598.203C350.01 597.63 350.289 596.932 350.289 596.109C350.289 595.281 350.01 594.586 349.453 594.023C348.901 593.456 348.219 593.172 347.406 593.172ZM359.523 588.797H360.695V600H359.523V598.195C359.237 598.82 358.82 599.305 358.273 599.648C357.732 599.987 357.094 600.156 356.359 600.156C355.656 600.156 355.008 599.977 354.414 599.617C353.826 599.258 353.359 598.766 353.016 598.141C352.672 597.516 352.5 596.833 352.5 596.094C352.5 595.354 352.672 594.674 353.016 594.055C353.359 593.435 353.826 592.948 354.414 592.594C355.008 592.24 355.656 592.062 356.359 592.062C357.094 592.062 357.734 592.234 358.281 592.578C358.828 592.917 359.242 593.396 359.523 594.016V588.797ZM356.578 599.055C357.427 599.055 358.13 598.776 358.688 598.219C359.245 597.656 359.523 596.948 359.523 596.094C359.523 595.245 359.245 594.542 358.688 593.984C358.13 593.427 357.427 593.148 356.578 593.148C355.755 593.148 355.06 593.435 354.492 594.008C353.93 594.581 353.648 595.276 353.648 596.094C353.648 596.927 353.93 597.63 354.492 598.203C355.06 598.771 355.755 599.055 356.578 599.055Z"
            fill="#A8A8A8"
          />
          <path
            d="M665.883 617.57L669.125 613.953H663.656V612.797H670.82V613.648L667.367 617.422C668.008 617.339 668.602 617.422 669.148 617.672C669.695 617.917 670.128 618.292 670.445 618.797C670.763 619.302 670.922 619.875 670.922 620.516C670.922 621.578 670.562 622.451 669.844 623.133C669.13 623.815 668.219 624.156 667.109 624.156C666.109 624.156 665.26 623.883 664.562 623.336C663.87 622.789 663.471 622.078 663.367 621.203H664.57C664.68 621.74 664.961 622.172 665.414 622.5C665.867 622.828 666.432 622.992 667.109 622.992C667.854 622.992 668.466 622.758 668.945 622.289C669.43 621.815 669.672 621.211 669.672 620.477C669.672 620.049 669.57 619.669 669.367 619.336C669.164 619.003 668.888 618.75 668.539 618.578C668.19 618.406 667.786 618.299 667.328 618.258C666.87 618.216 666.388 618.268 665.883 618.414V617.57ZM672.094 624V623.102L676.398 618.797C676.977 618.208 677.404 617.688 677.68 617.234C677.956 616.776 678.094 616.333 678.094 615.906C678.094 615.297 677.88 614.794 677.453 614.398C677.026 614.003 676.487 613.805 675.836 613.805C675.081 613.805 674.469 614.034 674 614.492C673.536 614.951 673.312 615.565 673.328 616.336H672.125C672.104 615.602 672.255 614.951 672.578 614.383C672.901 613.815 673.346 613.383 673.914 613.086C674.487 612.789 675.133 612.641 675.852 612.641C676.857 612.641 677.688 612.945 678.344 613.555C679 614.159 679.328 614.932 679.328 615.875C679.328 616.995 678.641 618.216 677.266 619.539L673.984 622.828H679.469V624H672.094ZM685.297 612.797H686.492V622.852H692.156V624H685.297V612.797ZM698.32 612.797C699.263 612.797 700.049 613.107 700.68 613.727C701.315 614.341 701.633 615.104 701.633 616.016C701.633 616.938 701.315 617.708 700.68 618.328C700.049 618.943 699.263 619.25 698.32 619.25H695.211V624H694.016V612.797H698.32ZM698.32 618.094C698.914 618.094 699.411 617.896 699.812 617.5C700.214 617.099 700.414 616.604 700.414 616.016C700.414 615.432 700.214 614.943 699.812 614.547C699.411 614.151 698.914 613.953 698.32 613.953H695.211V618.094H698.32ZM709.539 624L708.453 621.266H703.156L702.062 624H700.789L705.266 612.797H706.352L710.852 624H709.539ZM703.617 620.109H708L705.812 614.578L703.617 620.109Z"
            fill="#4B5563"
          />
          <path
            d="M663.266 588.797H669.523V589.953H664.461V593.438H668.977V594.594H664.461V598.852H669.523V600H663.266V588.797ZM677.992 600H676.602L674.375 596.945L672.148 600H670.773L673.688 595.984L670.953 592.227H672.344L674.391 595.039L676.422 592.227H677.797L675.078 595.984L677.992 600ZM683.797 592.062C684.5 592.062 685.146 592.242 685.734 592.602C686.328 592.956 686.797 593.445 687.141 594.07C687.484 594.69 687.656 595.37 687.656 596.109C687.656 596.849 687.484 597.531 687.141 598.156C686.797 598.776 686.328 599.266 685.734 599.625C685.146 599.979 684.5 600.156 683.797 600.156C683.062 600.156 682.422 599.987 681.875 599.648C681.333 599.305 680.919 598.82 680.633 598.195V602.93H679.461V592.227H680.633V594.016C680.914 593.396 681.328 592.917 681.875 592.578C682.422 592.234 683.062 592.062 683.797 592.062ZM683.578 599.055C684.401 599.055 685.094 598.771 685.656 598.203C686.219 597.635 686.5 596.938 686.5 596.109C686.5 595.281 686.219 594.581 685.656 594.008C685.094 593.435 684.401 593.148 683.578 593.148C682.729 593.148 682.026 593.43 681.469 593.992C680.911 594.549 680.633 595.255 680.633 596.109C680.633 596.958 680.911 597.661 681.469 598.219C682.026 598.776 682.729 599.055 683.578 599.055ZM696.398 595.875C696.398 596.109 696.393 596.258 696.383 596.32H689.867C689.924 597.154 690.211 597.826 690.727 598.336C691.242 598.846 691.906 599.102 692.719 599.102C693.344 599.102 693.88 598.961 694.328 598.68C694.781 598.393 695.06 598.013 695.164 597.539H696.336C696.185 598.326 695.773 598.958 695.102 599.438C694.43 599.917 693.625 600.156 692.688 600.156C691.557 600.156 690.612 599.766 689.852 598.984C689.096 598.203 688.719 597.229 688.719 596.062C688.719 594.943 689.102 593.997 689.867 593.227C690.633 592.451 691.568 592.062 692.672 592.062C693.365 592.062 693.995 592.227 694.562 592.555C695.13 592.878 695.578 593.331 695.906 593.914C696.234 594.497 696.398 595.151 696.398 595.875ZM689.922 595.328H695.148C695.091 594.682 694.828 594.154 694.359 593.742C693.896 593.326 693.318 593.117 692.625 593.117C691.938 593.117 691.349 593.318 690.859 593.719C690.37 594.12 690.057 594.656 689.922 595.328ZM701.5 600.156C700.37 600.156 699.417 599.768 698.641 598.992C697.87 598.211 697.484 597.25 697.484 596.109C697.484 594.969 697.87 594.01 698.641 593.234C699.417 592.453 700.37 592.062 701.5 592.062C702.38 592.062 703.164 592.32 703.852 592.836C704.539 593.346 704.956 593.99 705.102 594.766H703.914C703.784 594.302 703.492 593.922 703.039 593.625C702.586 593.323 702.073 593.172 701.5 593.172C700.693 593.172 700.013 593.453 699.461 594.016C698.909 594.578 698.633 595.276 698.633 596.109C698.633 596.938 698.909 597.635 699.461 598.203C700.013 598.771 700.693 599.055 701.5 599.055C702.078 599.055 702.596 598.898 703.055 598.586C703.518 598.273 703.805 597.87 703.914 597.375H705.102C704.982 598.188 704.576 598.854 703.883 599.375C703.195 599.896 702.401 600.156 701.5 600.156ZM710.883 593.312H708.711V597.375C708.711 598.453 709.255 598.992 710.344 598.992C710.562 598.992 710.742 598.971 710.883 598.93V600C710.648 600.052 710.398 600.078 710.133 600.078C709.32 600.078 708.685 599.854 708.227 599.406C707.768 598.953 707.539 598.281 707.539 597.391V593.312H706.008V592.227H707.539V590.078H708.711V592.227H710.883V593.312ZM719.211 595.875C719.211 596.109 719.206 596.258 719.195 596.32H712.68C712.737 597.154 713.023 597.826 713.539 598.336C714.055 598.846 714.719 599.102 715.531 599.102C716.156 599.102 716.693 598.961 717.141 598.68C717.594 598.393 717.872 598.013 717.977 597.539H719.148C718.997 598.326 718.586 598.958 717.914 599.438C717.242 599.917 716.438 600.156 715.5 600.156C714.37 600.156 713.424 599.766 712.664 598.984C711.909 598.203 711.531 597.229 711.531 596.062C711.531 594.943 711.914 593.997 712.68 593.227C713.445 592.451 714.38 592.062 715.484 592.062C716.177 592.062 716.807 592.227 717.375 592.555C717.943 592.878 718.391 593.331 718.719 593.914C719.047 594.497 719.211 595.151 719.211 595.875ZM712.734 595.328H717.961C717.904 594.682 717.641 594.154 717.172 593.742C716.708 593.326 716.13 593.117 715.438 593.117C714.75 593.117 714.161 593.318 713.672 593.719C713.182 594.12 712.87 594.656 712.734 595.328ZM727.32 588.797H728.492V600H727.32V598.195C727.034 598.82 726.617 599.305 726.07 599.648C725.529 599.987 724.891 600.156 724.156 600.156C723.453 600.156 722.805 599.977 722.211 599.617C721.622 599.258 721.156 598.766 720.812 598.141C720.469 597.516 720.297 596.833 720.297 596.094C720.297 595.354 720.469 594.674 720.812 594.055C721.156 593.435 721.622 592.948 722.211 592.594C722.805 592.24 723.453 592.062 724.156 592.062C724.891 592.062 725.531 592.234 726.078 592.578C726.625 592.917 727.039 593.396 727.32 594.016V588.797ZM724.375 599.055C725.224 599.055 725.927 598.776 726.484 598.219C727.042 597.656 727.32 596.948 727.32 596.094C727.32 595.245 727.042 594.542 726.484 593.984C725.927 593.427 725.224 593.148 724.375 593.148C723.552 593.148 722.857 593.435 722.289 594.008C721.727 594.581 721.445 595.276 721.445 596.094C721.445 596.927 721.727 597.63 722.289 598.203C722.857 598.771 723.552 599.055 724.375 599.055ZM739.82 600.156C738.789 600.156 737.846 599.904 736.992 599.398C736.143 598.888 735.474 598.19 734.984 597.305C734.495 596.419 734.25 595.44 734.25 594.367C734.25 593.57 734.393 592.818 734.68 592.109C734.971 591.401 735.365 590.794 735.859 590.289C736.354 589.779 736.945 589.378 737.633 589.086C738.32 588.789 739.049 588.641 739.82 588.641C741.06 588.641 742.156 588.997 743.109 589.711C744.062 590.419 744.646 591.326 744.859 592.43H743.531C743.318 591.654 742.865 591.023 742.172 590.539C741.484 590.049 740.701 589.805 739.82 589.805C739.023 589.805 738.294 590.005 737.633 590.406C736.971 590.802 736.451 591.352 736.07 592.055C735.69 592.753 735.5 593.523 735.5 594.367C735.5 595.221 735.69 596.003 736.07 596.711C736.451 597.419 736.971 597.977 737.633 598.383C738.294 598.789 739.023 598.992 739.82 598.992C740.727 598.992 741.523 598.737 742.211 598.227C742.904 597.716 743.349 597.049 743.547 596.227H744.891C744.651 597.393 744.06 598.341 743.117 599.07C742.18 599.794 741.081 600.156 739.82 600.156ZM754.242 588.797V589.953H750.562V600H749.359V589.953H745.68V588.797H754.242ZM759.82 600.156C758.789 600.156 757.846 599.904 756.992 599.398C756.143 598.888 755.474 598.19 754.984 597.305C754.495 596.419 754.25 595.44 754.25 594.367C754.25 593.57 754.393 592.818 754.68 592.109C754.971 591.401 755.365 590.794 755.859 590.289C756.354 589.779 756.945 589.378 757.633 589.086C758.32 588.789 759.049 588.641 759.82 588.641C761.06 588.641 762.156 588.997 763.109 589.711C764.062 590.419 764.646 591.326 764.859 592.43H763.531C763.318 591.654 762.865 591.023 762.172 590.539C761.484 590.049 760.701 589.805 759.82 589.805C759.023 589.805 758.294 590.005 757.633 590.406C756.971 590.802 756.451 591.352 756.07 592.055C755.69 592.753 755.5 593.523 755.5 594.367C755.5 595.221 755.69 596.003 756.07 596.711C756.451 597.419 756.971 597.977 757.633 598.383C758.294 598.789 759.023 598.992 759.82 598.992C760.727 598.992 761.523 598.737 762.211 598.227C762.904 597.716 763.349 597.049 763.547 596.227H764.891C764.651 597.393 764.06 598.341 763.117 599.07C762.18 599.794 761.081 600.156 759.82 600.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M461.703 624V623.102L466.008 618.797C466.586 618.208 467.013 617.688 467.289 617.234C467.565 616.776 467.703 616.333 467.703 615.906C467.703 615.297 467.49 614.794 467.062 614.398C466.635 614.003 466.096 613.805 465.445 613.805C464.69 613.805 464.078 614.034 463.609 614.492C463.146 614.951 462.922 615.565 462.938 616.336H461.734C461.714 615.602 461.865 614.951 462.188 614.383C462.51 613.815 462.956 613.383 463.523 613.086C464.096 612.789 464.742 612.641 465.461 612.641C466.466 612.641 467.297 612.945 467.953 613.555C468.609 614.159 468.938 614.932 468.938 615.875C468.938 616.995 468.25 618.216 466.875 619.539L463.594 622.828H469.078V624H461.703ZM473.688 624.156C472.708 624.156 471.87 623.885 471.172 623.344C470.474 622.802 470.081 622.089 469.992 621.203H471.195C471.31 621.734 471.594 622.167 472.047 622.5C472.505 622.828 473.052 622.992 473.688 622.992C474.396 622.992 474.995 622.755 475.484 622.281C475.974 621.802 476.219 621.219 476.219 620.531C476.219 619.812 475.974 619.206 475.484 618.711C474.995 618.216 474.396 617.969 473.688 617.969C473.255 617.969 472.852 618.039 472.477 618.18C472.107 618.315 471.812 618.51 471.594 618.766H470.555L471.078 612.797H476.758V613.938H472.156L471.781 617.633C472.01 617.419 472.31 617.253 472.68 617.133C473.055 617.008 473.44 616.945 473.836 616.945C474.867 616.945 475.727 617.284 476.414 617.961C477.102 618.633 477.445 619.495 477.445 620.547C477.445 621.552 477.081 622.406 476.352 623.109C475.622 623.807 474.734 624.156 473.688 624.156ZM483.172 612.797H484.367V622.852H490.031V624H483.172V612.797ZM496.195 612.797C497.138 612.797 497.924 613.107 498.555 613.727C499.19 614.341 499.508 615.104 499.508 616.016C499.508 616.938 499.19 617.708 498.555 618.328C497.924 618.943 497.138 619.25 496.195 619.25H493.086V624H491.891V612.797H496.195ZM496.195 618.094C496.789 618.094 497.286 617.896 497.688 617.5C498.089 617.099 498.289 616.604 498.289 616.016C498.289 615.432 498.089 614.943 497.688 614.547C497.286 614.151 496.789 613.953 496.195 613.953H493.086V618.094H496.195ZM507.414 624L506.328 621.266H501.031L499.938 624H498.664L503.141 612.797H504.227L508.727 624H507.414ZM501.492 620.109H505.875L503.688 614.578L501.492 620.109Z"
            fill="#4B5563"
          />
          <path
            d="M466.352 600.156C465.32 600.156 464.378 599.904 463.523 599.398C462.674 598.888 462.005 598.19 461.516 597.305C461.026 596.419 460.781 595.44 460.781 594.367C460.781 593.57 460.924 592.818 461.211 592.109C461.503 591.401 461.896 590.794 462.391 590.289C462.885 589.779 463.477 589.378 464.164 589.086C464.852 588.789 465.581 588.641 466.352 588.641C467.591 588.641 468.688 588.997 469.641 589.711C470.594 590.419 471.177 591.326 471.391 592.43H470.062C469.849 591.654 469.396 591.023 468.703 590.539C468.016 590.049 467.232 589.805 466.352 589.805C465.555 589.805 464.826 590.005 464.164 590.406C463.503 590.802 462.982 591.352 462.602 592.055C462.221 592.753 462.031 593.523 462.031 594.367C462.031 595.221 462.221 596.003 462.602 596.711C462.982 597.419 463.503 597.977 464.164 598.383C464.826 598.789 465.555 598.992 466.352 598.992C467.258 598.992 468.055 598.737 468.742 598.227C469.435 597.716 469.88 597.049 470.078 596.227H471.422C471.182 597.393 470.591 598.341 469.648 599.07C468.711 599.794 467.612 600.156 466.352 600.156ZM479.102 592.227H480.273V600H479.102V598.492C478.852 599.018 478.497 599.427 478.039 599.719C477.586 600.01 477.055 600.156 476.445 600.156C475.445 600.156 474.648 599.844 474.055 599.219C473.461 598.594 473.164 597.755 473.164 596.703V592.227H474.336V596.578C474.336 597.333 474.549 597.935 474.977 598.383C475.404 598.831 475.974 599.055 476.688 599.055C477.422 599.055 478.008 598.831 478.445 598.383C478.883 597.935 479.102 597.333 479.102 596.578V592.227ZM485.867 592.062C486.07 592.062 486.312 592.094 486.594 592.156V593.25C486.339 593.161 486.086 593.117 485.836 593.117C485.227 593.117 484.714 593.333 484.297 593.766C483.885 594.193 483.68 594.734 483.68 595.391V600H482.508V592.227H483.68V593.469C483.909 593.031 484.214 592.688 484.594 592.438C484.974 592.188 485.398 592.062 485.867 592.062ZM491.461 592.062C491.664 592.062 491.906 592.094 492.188 592.156V593.25C491.932 593.161 491.68 593.117 491.43 593.117C490.82 593.117 490.307 593.333 489.891 593.766C489.479 594.193 489.273 594.734 489.273 595.391V600H488.102V592.227H489.273V593.469C489.503 593.031 489.807 592.688 490.188 592.438C490.568 592.188 490.992 592.062 491.461 592.062ZM500.273 595.875C500.273 596.109 500.268 596.258 500.258 596.32H493.742C493.799 597.154 494.086 597.826 494.602 598.336C495.117 598.846 495.781 599.102 496.594 599.102C497.219 599.102 497.755 598.961 498.203 598.68C498.656 598.393 498.935 598.013 499.039 597.539H500.211C500.06 598.326 499.648 598.958 498.977 599.438C498.305 599.917 497.5 600.156 496.562 600.156C495.432 600.156 494.487 599.766 493.727 598.984C492.971 598.203 492.594 597.229 492.594 596.062C492.594 594.943 492.977 593.997 493.742 593.227C494.508 592.451 495.443 592.062 496.547 592.062C497.24 592.062 497.87 592.227 498.438 592.555C499.005 592.878 499.453 593.331 499.781 593.914C500.109 594.497 500.273 595.151 500.273 595.875ZM493.797 595.328H499.023C498.966 594.682 498.703 594.154 498.234 593.742C497.771 593.326 497.193 593.117 496.5 593.117C495.812 593.117 495.224 593.318 494.734 593.719C494.245 594.12 493.932 594.656 493.797 595.328ZM505.898 592.062C506.904 592.062 507.701 592.375 508.289 593C508.883 593.62 509.18 594.461 509.18 595.523V600H508.008V595.633C508.008 594.888 507.792 594.292 507.359 593.844C506.932 593.396 506.365 593.172 505.656 593.172C504.927 593.172 504.341 593.398 503.898 593.852C503.461 594.299 503.242 594.893 503.242 595.633V600H502.07V592.227H503.242V593.742C503.492 593.211 503.846 592.799 504.305 592.508C504.763 592.211 505.294 592.062 505.898 592.062ZM514.977 593.312H512.805V597.375C512.805 598.453 513.349 598.992 514.438 598.992C514.656 598.992 514.836 598.971 514.977 598.93V600C514.742 600.052 514.492 600.078 514.227 600.078C513.414 600.078 512.779 599.854 512.32 599.406C511.862 598.953 511.633 598.281 511.633 597.391V593.312H510.102V592.227H511.633V590.078H512.805V592.227H514.977V593.312ZM525.695 600.156C524.664 600.156 523.721 599.904 522.867 599.398C522.018 598.888 521.349 598.19 520.859 597.305C520.37 596.419 520.125 595.44 520.125 594.367C520.125 593.57 520.268 592.818 520.555 592.109C520.846 591.401 521.24 590.794 521.734 590.289C522.229 589.779 522.82 589.378 523.508 589.086C524.195 588.789 524.924 588.641 525.695 588.641C526.935 588.641 528.031 588.997 528.984 589.711C529.938 590.419 530.521 591.326 530.734 592.43H529.406C529.193 591.654 528.74 591.023 528.047 590.539C527.359 590.049 526.576 589.805 525.695 589.805C524.898 589.805 524.169 590.005 523.508 590.406C522.846 590.802 522.326 591.352 521.945 592.055C521.565 592.753 521.375 593.523 521.375 594.367C521.375 595.221 521.565 596.003 521.945 596.711C522.326 597.419 522.846 597.977 523.508 598.383C524.169 598.789 524.898 598.992 525.695 598.992C526.602 598.992 527.398 598.737 528.086 598.227C528.779 597.716 529.224 597.049 529.422 596.227H530.766C530.526 597.393 529.935 598.341 528.992 599.07C528.055 599.794 526.956 600.156 525.695 600.156ZM540.117 588.797V589.953H536.438V600H535.234V589.953H531.555V588.797H540.117ZM545.695 600.156C544.664 600.156 543.721 599.904 542.867 599.398C542.018 598.888 541.349 598.19 540.859 597.305C540.37 596.419 540.125 595.44 540.125 594.367C540.125 593.57 540.268 592.818 540.555 592.109C540.846 591.401 541.24 590.794 541.734 590.289C542.229 589.779 542.82 589.378 543.508 589.086C544.195 588.789 544.924 588.641 545.695 588.641C546.935 588.641 548.031 588.997 548.984 589.711C549.938 590.419 550.521 591.326 550.734 592.43H549.406C549.193 591.654 548.74 591.023 548.047 590.539C547.359 590.049 546.576 589.805 545.695 589.805C544.898 589.805 544.169 590.005 543.508 590.406C542.846 590.802 542.326 591.352 541.945 592.055C541.565 592.753 541.375 593.523 541.375 594.367C541.375 595.221 541.565 596.003 541.945 596.711C542.326 597.419 542.846 597.977 543.508 598.383C544.169 598.789 544.898 598.992 545.695 598.992C546.602 598.992 547.398 598.737 548.086 598.227C548.779 597.716 549.224 597.049 549.422 596.227H550.766C550.526 597.393 549.935 598.341 548.992 599.07C548.055 599.794 546.956 600.156 545.695 600.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M31 655H799V722C799 725.314 796.314 728 793 728H37C33.6863 728 31 725.314 31 722V655Z"
            fill="white"
          />
          <rect
            x="635.5"
            y="672.5"
            width="37"
            height="37"
            rx="18.5"
            stroke="#0F47F2"
          />
          <path
            d="M654 679L657 687.143L666 691L657 694L654 703L651 694L642 691L651 687.143L654 679Z"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="672.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="672.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            stroke="#0F47F2"
            stroke-width="0.5"
          />
          <path
            d="M551.814 698.176C550.502 698.176 549.415 697.792 548.554 697.024C547.698 696.251 547.271 695.275 547.271 694.098H548.606C548.606 694.918 548.908 695.592 549.512 696.119C550.115 696.641 550.883 696.901 551.814 696.901C552.693 696.901 553.42 696.688 553.994 696.26C554.568 695.826 554.855 695.272 554.855 694.599C554.855 694.247 554.785 693.937 554.645 693.667C554.51 693.397 554.322 693.181 554.082 693.017C553.848 692.853 553.572 692.703 553.256 692.568C552.945 692.428 552.611 692.316 552.254 692.234C551.902 692.152 551.539 692.059 551.164 691.953C550.789 691.848 550.423 691.745 550.065 691.646C549.714 691.54 549.38 691.399 549.063 691.224C548.753 691.048 548.478 690.849 548.237 690.626C548.003 690.403 547.815 690.116 547.675 689.765C547.54 689.413 547.473 689.015 547.473 688.569C547.473 687.597 547.862 686.797 548.642 686.17C549.427 685.537 550.417 685.221 551.612 685.221C552.896 685.221 553.915 685.569 554.671 686.267C555.427 686.958 555.805 687.828 555.805 688.877H554.425C554.396 688.186 554.117 687.62 553.59 687.181C553.068 686.735 552.397 686.513 551.577 686.513C550.757 686.513 550.089 686.703 549.573 687.084C549.063 687.465 548.809 687.96 548.809 688.569C548.809 688.921 548.894 689.226 549.063 689.483C549.233 689.741 549.459 689.946 549.74 690.099C550.027 690.251 550.355 690.386 550.725 690.503C551.094 690.614 551.483 690.72 551.894 690.819C552.304 690.913 552.711 691.016 553.115 691.127C553.525 691.238 553.915 691.385 554.284 691.566C554.653 691.748 554.979 691.965 555.26 692.217C555.547 692.463 555.775 692.791 555.945 693.201C556.115 693.605 556.2 694.071 556.2 694.599C556.2 695.636 555.784 696.491 554.952 697.165C554.126 697.839 553.08 698.176 551.814 698.176ZM562.607 689.07C563.738 689.07 564.635 689.422 565.297 690.125C565.965 690.822 566.299 691.769 566.299 692.964V698H564.98V693.087C564.98 692.249 564.737 691.578 564.251 691.074C563.771 690.57 563.132 690.318 562.335 690.318C561.515 690.318 560.855 690.573 560.357 691.083C559.865 691.587 559.619 692.255 559.619 693.087V698H558.301V685.396H559.619V690.96C559.9 690.362 560.299 689.899 560.814 689.571C561.33 689.237 561.928 689.07 562.607 689.07ZM569.595 690.389C570.468 689.51 571.54 689.07 572.812 689.07C574.083 689.07 575.155 689.51 576.028 690.389C576.907 691.262 577.347 692.34 577.347 693.623C577.347 694.906 576.907 695.987 576.028 696.866C575.155 697.739 574.083 698.176 572.812 698.176C571.54 698.176 570.468 697.739 569.595 696.866C568.728 695.987 568.294 694.906 568.294 693.623C568.294 692.34 568.728 691.262 569.595 690.389ZM572.812 690.318C571.903 690.318 571.139 690.635 570.518 691.268C569.896 691.9 569.586 692.686 569.586 693.623C569.586 694.555 569.896 695.34 570.518 695.979C571.139 696.617 571.903 696.937 572.812 696.937C573.72 696.937 574.487 696.617 575.114 695.979C575.741 695.334 576.055 694.549 576.055 693.623C576.055 692.691 575.741 691.909 575.114 691.276C574.493 690.638 573.726 690.318 572.812 690.318ZM583.121 689.07C583.35 689.07 583.622 689.105 583.938 689.176V690.406C583.651 690.307 583.367 690.257 583.086 690.257C582.4 690.257 581.823 690.5 581.354 690.986C580.892 691.467 580.66 692.076 580.66 692.814V698H579.342V689.255H580.66V690.652C580.918 690.16 581.261 689.773 581.688 689.492C582.116 689.211 582.594 689.07 583.121 689.07ZM590.188 690.477H587.744V695.047C587.744 696.26 588.356 696.866 589.581 696.866C589.827 696.866 590.029 696.843 590.188 696.796V698C589.924 698.059 589.643 698.088 589.344 698.088C588.43 698.088 587.715 697.836 587.199 697.332C586.684 696.822 586.426 696.066 586.426 695.064V690.477H584.703V689.255H586.426V686.838H587.744V689.255H590.188V690.477ZM593.334 685.396V698H592.016V685.396H593.334ZM596.516 685.432C596.768 685.432 596.99 685.525 597.184 685.713C597.377 685.9 597.474 686.12 597.474 686.372C597.474 686.63 597.377 686.855 597.184 687.049C596.99 687.236 596.768 687.33 596.516 687.33C596.258 687.33 596.038 687.236 595.856 687.049C595.675 686.861 595.584 686.636 595.584 686.372C595.584 686.12 595.675 685.9 595.856 685.713C596.038 685.525 596.258 685.432 596.516 685.432ZM595.848 689.255H597.166V698H595.848V689.255ZM602.562 698.176C601.578 698.176 600.764 697.927 600.119 697.429C599.475 696.931 599.108 696.257 599.021 695.407H600.277C600.336 695.905 600.57 696.304 600.98 696.603C601.391 696.896 601.9 697.042 602.51 697.042C603.119 697.042 603.608 696.904 603.978 696.629C604.353 696.348 604.54 695.987 604.54 695.548C604.54 695.255 604.464 695.009 604.312 694.81C604.159 694.604 603.957 694.452 603.705 694.353C603.459 694.253 603.178 694.162 602.861 694.08C602.545 693.998 602.22 693.931 601.886 693.878C601.552 693.825 601.227 693.743 600.91 693.632C600.594 693.521 600.31 693.389 600.058 693.236C599.812 693.078 599.612 692.855 599.46 692.568C599.308 692.275 599.231 691.927 599.231 691.522C599.231 690.802 599.516 690.213 600.084 689.756C600.652 689.299 601.405 689.07 602.343 689.07C603.204 689.07 603.945 689.299 604.566 689.756C605.193 690.207 605.557 690.813 605.656 691.575H604.329C604.265 691.165 604.045 690.828 603.67 690.564C603.295 690.301 602.841 690.169 602.308 690.169C601.774 690.169 601.341 690.286 601.007 690.521C600.679 690.749 600.515 691.051 600.515 691.426C600.515 691.742 600.611 692 600.805 692.199C601.004 692.398 601.259 692.545 601.569 692.639C601.88 692.732 602.223 692.814 602.598 692.885C602.979 692.949 603.356 693.031 603.731 693.131C604.112 693.23 604.458 693.362 604.769 693.526C605.079 693.69 605.331 693.939 605.524 694.273C605.724 694.607 605.823 695.021 605.823 695.513C605.823 696.286 605.513 696.925 604.892 697.429C604.276 697.927 603.5 698.176 602.562 698.176ZM612.09 690.477H609.646V695.047C609.646 696.26 610.259 696.866 611.483 696.866C611.729 696.866 611.932 696.843 612.09 696.796V698C611.826 698.059 611.545 698.088 611.246 698.088C610.332 698.088 609.617 697.836 609.102 697.332C608.586 696.822 608.328 696.066 608.328 695.064V690.477H606.605V689.255H608.328V686.838H609.646V689.255H612.09V690.477Z"
            fill="#F5F9FB"
          />
          <circle cx="702" cy="691" r="18.5" stroke="#818283" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M695.328 682.91C695.34 682.91 695.352 682.91 695.365 682.91L708.672 682.91C709.031 682.91 709.36 682.91 709.628 682.946C709.922 682.986 710.234 683.079 710.49 683.335C710.747 683.592 710.84 683.903 710.879 684.198C710.915 684.466 710.915 684.795 710.915 685.154V685.228C710.915 685.587 710.915 685.916 710.879 686.184C710.84 686.479 710.747 686.79 710.49 687.047C710.247 687.29 709.953 687.387 709.671 687.429V691.873C709.671 693.397 709.671 694.604 709.544 695.549C709.414 696.521 709.138 697.308 708.517 697.929C707.897 698.55 707.11 698.825 706.137 698.956C705.193 699.083 703.985 699.083 702.461 699.083H701.538C700.014 699.083 698.807 699.083 697.862 698.956C696.89 698.825 696.103 698.55 695.482 697.929C694.861 697.308 694.586 696.521 694.455 695.549C694.328 694.604 694.328 693.397 694.328 691.873V687.429C694.046 687.387 693.753 687.29 693.509 687.047C693.253 686.79 693.16 686.479 693.12 686.184C693.084 685.916 693.084 685.587 693.084 685.228C693.084 685.216 693.084 685.203 693.084 685.191C693.084 685.179 693.084 685.166 693.084 685.154C693.084 684.795 693.084 684.466 693.12 684.198C693.16 683.903 693.253 683.592 693.509 683.335C693.765 683.079 694.077 682.986 694.372 682.946C694.64 682.91 694.969 682.91 695.328 682.91ZM695.572 687.472V691.826C695.572 693.407 695.573 694.531 695.688 695.383C695.8 696.217 696.011 696.698 696.362 697.049C696.713 697.4 697.193 697.611 698.028 697.723C698.88 697.837 700.004 697.839 701.585 697.839H702.414C703.996 697.839 705.119 697.837 705.972 697.723C706.806 697.611 707.287 697.4 707.638 697.049C707.989 696.698 708.199 696.217 708.311 695.383C708.426 694.531 708.427 693.407 708.427 691.826V687.472H695.572ZM694.389 684.215L694.391 684.214C694.392 684.213 694.395 684.212 694.399 684.21C694.417 684.202 694.458 684.19 694.538 684.179C694.712 684.156 694.956 684.154 695.365 684.154H708.635C709.043 684.154 709.287 684.156 709.462 684.179C709.542 684.19 709.582 684.202 709.6 684.21C709.604 684.212 709.607 684.213 709.609 684.214L709.611 684.215L709.612 684.217C709.613 684.219 709.614 684.221 709.616 684.226C709.623 684.244 709.636 684.284 709.646 684.364C709.67 684.539 709.671 684.782 709.671 685.191C709.671 685.599 709.67 685.843 709.646 686.018C709.636 686.098 709.623 686.138 709.616 686.156C709.614 686.161 709.613 686.163 709.612 686.165L709.611 686.167L709.609 686.168C709.607 686.169 709.604 686.17 709.6 686.172C709.582 686.179 709.542 686.192 709.462 686.203C709.287 686.226 709.043 686.228 708.635 686.228H695.365C694.956 686.228 694.712 686.226 694.538 686.203C694.458 686.192 694.417 686.179 694.399 686.172C694.395 686.17 694.392 686.169 694.391 686.168L694.389 686.167L694.388 686.165C694.387 686.163 694.385 686.161 694.384 686.156C694.376 686.138 694.364 686.098 694.353 686.018C694.329 685.843 694.328 685.599 694.328 685.191C694.328 684.782 694.329 684.539 694.353 684.364C694.364 684.284 694.376 684.244 694.384 684.226C694.385 684.221 694.387 684.219 694.388 684.217L694.389 684.215ZM694.389 686.167C694.388 686.167 694.389 686.167 694.389 686.167V686.167ZM700.738 689.13H703.262C703.439 689.13 703.603 689.13 703.74 689.14C703.887 689.15 704.049 689.173 704.214 689.241C704.569 689.388 704.852 689.671 704.999 690.026C705.067 690.191 705.09 690.353 705.1 690.5C705.11 690.637 705.11 690.801 705.11 690.978V691.015C705.11 691.192 705.11 691.356 705.1 691.493C705.09 691.64 705.067 691.802 704.999 691.967C704.852 692.322 704.569 692.605 704.214 692.752C704.049 692.82 703.887 692.843 703.74 692.853C703.603 692.863 703.439 692.863 703.262 692.863H700.738C700.56 692.863 700.397 692.863 700.259 692.853C700.112 692.843 699.95 692.82 699.786 692.752C699.43 692.605 699.147 692.322 699 691.967C698.932 691.802 698.909 691.64 698.899 691.493C698.89 691.356 698.89 691.192 698.89 691.015V690.978C698.89 690.801 698.89 690.637 698.899 690.5C698.909 690.353 698.932 690.191 699 690.026C699.147 689.671 699.43 689.388 699.786 689.241C699.95 689.173 700.112 689.15 700.259 689.14C700.397 689.13 700.56 689.13 700.738 689.13ZM700.259 690.391C700.21 690.412 700.171 690.451 700.15 690.5C700.149 690.506 700.144 690.53 700.14 690.585C700.134 690.675 700.134 690.795 700.134 690.996C700.134 691.198 700.134 691.318 700.14 691.408C700.144 691.463 700.149 691.487 700.15 691.493C700.171 691.542 700.21 691.581 700.259 691.602C700.265 691.603 700.289 691.608 700.344 691.612C700.434 691.618 700.554 691.618 700.756 691.618H703.244C703.445 691.618 703.566 691.618 703.655 691.612C703.711 691.608 703.734 691.603 703.74 691.602C703.789 691.581 703.828 691.542 703.849 691.493C703.85 691.487 703.856 691.463 703.859 691.408C703.865 691.318 703.866 691.198 703.866 690.996C703.866 690.795 703.865 690.675 703.859 690.585C703.856 690.53 703.85 690.506 703.849 690.5C703.828 690.451 703.789 690.412 703.74 690.391C703.734 690.39 703.711 690.385 703.655 690.381C703.566 690.375 703.445 690.374 703.244 690.374H700.756C700.554 690.374 700.434 690.375 700.344 690.381C700.289 690.385 700.265 690.39 700.259 690.391Z"
            fill="#818283"
          />
          <circle cx="750" cy="691" r="18.5" stroke="#818283" />
          <path
            d="M751.77 685.059L752.465 684.364C753.617 683.212 755.484 683.212 756.636 684.364C757.788 685.516 757.788 687.383 756.636 688.535L755.941 689.23M751.77 685.059C751.77 685.059 751.857 686.536 753.16 687.84C754.464 689.143 755.941 689.23 755.941 689.23M751.77 685.059L745.379 691.45C744.946 691.883 744.73 692.099 744.544 692.338C744.324 692.619 744.136 692.924 743.982 693.246C743.852 693.519 743.755 693.81 743.562 694.391L742.741 696.852M755.941 689.23L749.55 695.621C749.117 696.054 748.901 696.27 748.662 696.456C748.381 696.676 748.076 696.864 747.754 697.018C747.481 697.148 747.19 697.245 746.609 697.438L744.148 698.259M742.741 696.852L742.541 697.453C742.446 697.739 742.52 698.054 742.733 698.267C742.946 698.48 743.261 698.554 743.547 698.459L744.148 698.259M742.741 696.852L744.148 698.259"
            stroke="#818283"
          />
          <g clip-path="url(#clip2_4500_3993)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M144.5 677C152.508 677 159 683.655 159 691.867C159 698.434 154.85 704.005 149.092 705.972C148.357 706.119 148.096 705.655 148.096 705.259C148.096 704.769 148.113 703.168 148.113 701.178C148.113 699.792 147.649 698.888 147.129 698.426C150.358 698.058 153.751 696.801 153.751 691.091C153.751 689.467 153.188 688.142 152.257 687.1C152.408 686.725 152.906 685.213 152.115 683.165C152.115 683.165 150.9 682.767 148.132 684.69C146.974 684.361 145.733 684.195 144.5 684.189C143.268 684.195 142.028 684.361 140.871 684.69C138.1 682.767 136.882 683.165 136.882 683.165C136.094 685.213 136.592 686.725 136.741 687.1C135.815 688.142 135.248 689.467 135.248 691.091C135.248 696.786 138.633 698.063 141.854 698.438C141.439 698.81 141.064 699.465 140.933 700.426C140.107 700.806 138.007 701.463 136.713 699.191C136.713 699.191 135.946 697.763 134.491 697.658C134.491 697.658 133.077 697.639 134.392 698.562C134.392 698.562 135.342 699.018 136.002 700.737C136.002 700.737 136.853 703.39 140.887 702.491C140.894 703.734 140.907 704.905 140.907 705.259C140.907 705.652 140.64 706.112 139.917 705.974C134.154 704.009 130 698.435 130 691.867C130 683.655 136.493 677 144.5 677Z"
              fill="#4B5563"
            />
          </g>
          <g clip-path="url(#clip3_4500_3993)">
            <path
              d="M100.5 677C92.491 677 86 683.491 86 691.5C86 699.509 92.491 706 100.5 706C108.509 706 115 699.509 115 691.5C115 683.491 108.509 677 100.5 677ZM96.4445 697.566H93.6182V688.521H96.4445V697.566ZM94.9549 687.388H94.9322C93.907 687.388 93.2443 686.697 93.2443 685.819C93.2443 684.924 93.9297 684.25 94.9719 684.25C96.0141 684.25 96.6541 684.924 96.6768 685.819C96.6824 686.691 96.0197 687.388 94.9549 687.388ZM107.75 697.566H104.544V692.888C104.544 691.664 104.046 690.826 102.941 690.826C102.097 690.826 101.627 691.392 101.412 691.936C101.333 692.129 101.344 692.401 101.344 692.678V697.566H98.1664C98.1664 697.566 98.2061 689.274 98.1664 688.521H101.344V689.942C101.531 689.319 102.545 688.436 104.165 688.436C106.175 688.436 107.75 689.738 107.75 692.537V697.566Z"
              fill="#4B5563"
            />
          </g>
          <rect
            x="50.5"
            y="479.5"
            width="15"
            height="15"
            rx="2"
            stroke="#4B5563"
          />
          <path
            d="M94.9609 512L93.875 509.266H88.5781L87.4844 512H86.2109L90.6875 500.797H91.7734L96.2734 512H94.9609ZM89.0391 508.109H93.4219L91.2344 502.578L89.0391 508.109ZM97.75 500.797H98.9453V512H97.75V500.797ZM105.344 500.797H111.602V501.953H106.539V505.438H111.055V506.594H106.539V510.852H111.602V512H105.344V500.797ZM117.445 504.062C118.451 504.062 119.247 504.375 119.836 505C120.43 505.62 120.727 506.461 120.727 507.523V512H119.555V507.633C119.555 506.888 119.339 506.292 118.906 505.844C118.479 505.396 117.911 505.172 117.203 505.172C116.474 505.172 115.888 505.398 115.445 505.852C115.008 506.299 114.789 506.893 114.789 507.633V512H113.617V504.227H114.789V505.742C115.039 505.211 115.393 504.799 115.852 504.508C116.31 504.211 116.841 504.062 117.445 504.062ZM129.523 504.211H130.695V511.758C130.695 512.826 130.333 513.685 129.609 514.336C128.885 514.987 127.956 515.312 126.82 515.312C126.372 515.312 125.938 515.255 125.516 515.141C125.094 515.031 124.701 514.87 124.336 514.656C123.977 514.443 123.682 514.154 123.453 513.789C123.229 513.43 123.109 513.021 123.094 512.562H124.227C124.242 513.094 124.495 513.518 124.984 513.836C125.474 514.159 126.076 514.32 126.789 514.32C127.581 514.32 128.234 514.086 128.75 513.617C129.266 513.154 129.523 512.549 129.523 511.805V510.094C129.237 510.708 128.82 511.185 128.273 511.523C127.732 511.862 127.094 512.031 126.359 512.031C125.656 512.031 125.008 511.854 124.414 511.5C123.826 511.146 123.359 510.661 123.016 510.047C122.672 509.432 122.5 508.76 122.5 508.031C122.5 507.307 122.672 506.641 123.016 506.031C123.359 505.422 123.826 504.943 124.414 504.594C125.008 504.24 125.656 504.062 126.359 504.062C127.094 504.062 127.732 504.232 128.273 504.57C128.82 504.904 129.237 505.375 129.523 505.984V504.211ZM126.578 510.945C127.427 510.945 128.13 510.672 128.688 510.125C129.245 509.573 129.523 508.875 129.523 508.031C129.523 507.198 129.245 506.508 128.688 505.961C128.13 505.409 127.427 505.133 126.578 505.133C125.755 505.133 125.06 505.414 124.492 505.977C123.93 506.534 123.648 507.219 123.648 508.031C123.648 508.849 123.93 509.539 124.492 510.102C125.06 510.664 125.755 510.945 126.578 510.945ZM133.523 500.828C133.747 500.828 133.945 500.911 134.117 501.078C134.289 501.245 134.375 501.44 134.375 501.664C134.375 501.893 134.289 502.094 134.117 502.266C133.945 502.432 133.747 502.516 133.523 502.516C133.294 502.516 133.099 502.432 132.938 502.266C132.776 502.099 132.695 501.898 132.695 501.664C132.695 501.44 132.776 501.245 132.938 501.078C133.099 500.911 133.294 500.828 133.523 500.828ZM132.93 504.227H134.102V512H132.93V504.227ZM140.164 504.062C141.169 504.062 141.966 504.375 142.555 505C143.148 505.62 143.445 506.461 143.445 507.523V512H142.273V507.633C142.273 506.888 142.057 506.292 141.625 505.844C141.198 505.396 140.63 505.172 139.922 505.172C139.193 505.172 138.607 505.398 138.164 505.852C137.727 506.299 137.508 506.893 137.508 507.633V512H136.336V504.227H137.508V505.742C137.758 505.211 138.112 504.799 138.57 504.508C139.029 504.211 139.56 504.062 140.164 504.062ZM152.898 507.875C152.898 508.109 152.893 508.258 152.883 508.32H146.367C146.424 509.154 146.711 509.826 147.227 510.336C147.742 510.846 148.406 511.102 149.219 511.102C149.844 511.102 150.38 510.961 150.828 510.68C151.281 510.393 151.56 510.013 151.664 509.539H152.836C152.685 510.326 152.273 510.958 151.602 511.438C150.93 511.917 150.125 512.156 149.188 512.156C148.057 512.156 147.112 511.766 146.352 510.984C145.596 510.203 145.219 509.229 145.219 508.062C145.219 506.943 145.602 505.997 146.367 505.227C147.133 504.451 148.068 504.062 149.172 504.062C149.865 504.062 150.495 504.227 151.062 504.555C151.63 504.878 152.078 505.331 152.406 505.914C152.734 506.497 152.898 507.151 152.898 507.875ZM146.422 507.328H151.648C151.591 506.682 151.328 506.154 150.859 505.742C150.396 505.326 149.818 505.117 149.125 505.117C148.438 505.117 147.849 505.318 147.359 505.719C146.87 506.12 146.557 506.656 146.422 507.328ZM161.664 507.875C161.664 508.109 161.659 508.258 161.648 508.32H155.133C155.19 509.154 155.477 509.826 155.992 510.336C156.508 510.846 157.172 511.102 157.984 511.102C158.609 511.102 159.146 510.961 159.594 510.68C160.047 510.393 160.326 510.013 160.43 509.539H161.602C161.451 510.326 161.039 510.958 160.367 511.438C159.695 511.917 158.891 512.156 157.953 512.156C156.823 512.156 155.878 511.766 155.117 510.984C154.362 510.203 153.984 509.229 153.984 508.062C153.984 506.943 154.367 505.997 155.133 505.227C155.898 504.451 156.833 504.062 157.938 504.062C158.63 504.062 159.26 504.227 159.828 504.555C160.396 504.878 160.844 505.331 161.172 505.914C161.5 506.497 161.664 507.151 161.664 507.875ZM155.188 507.328H160.414C160.357 506.682 160.094 506.154 159.625 505.742C159.161 505.326 158.583 505.117 157.891 505.117C157.203 505.117 156.615 505.318 156.125 505.719C155.635 506.12 155.323 506.656 155.188 507.328ZM166.82 504.062C167.023 504.062 167.266 504.094 167.547 504.156V505.25C167.292 505.161 167.039 505.117 166.789 505.117C166.18 505.117 165.667 505.333 165.25 505.766C164.839 506.193 164.633 506.734 164.633 507.391V512H163.461V504.227H164.633V505.469C164.862 505.031 165.167 504.688 165.547 504.438C165.927 504.188 166.352 504.062 166.82 504.062ZM179.477 504.227H180.648V512H179.477V510.195C179.19 510.82 178.773 511.305 178.227 511.648C177.685 511.987 177.047 512.156 176.312 512.156C175.609 512.156 174.961 511.977 174.367 511.617C173.779 511.258 173.312 510.766 172.969 510.141C172.625 509.516 172.453 508.833 172.453 508.094C172.453 507.354 172.625 506.674 172.969 506.055C173.312 505.435 173.779 504.948 174.367 504.594C174.961 504.24 175.609 504.062 176.312 504.062C177.047 504.062 177.688 504.234 178.234 504.578C178.781 504.917 179.195 505.396 179.477 506.016V504.227ZM176.531 511.055C177.38 511.055 178.083 510.776 178.641 510.219C179.198 509.656 179.477 508.948 179.477 508.094C179.477 507.245 179.198 506.542 178.641 505.984C178.083 505.427 177.38 505.148 176.531 505.148C175.708 505.148 175.013 505.435 174.445 506.008C173.883 506.581 173.602 507.276 173.602 508.094C173.602 508.927 173.883 509.63 174.445 510.203C175.013 510.771 175.708 511.055 176.531 511.055ZM186.883 505.312H184.711V509.375C184.711 510.453 185.255 510.992 186.344 510.992C186.562 510.992 186.742 510.971 186.883 510.93V512C186.648 512.052 186.398 512.078 186.133 512.078C185.32 512.078 184.685 511.854 184.227 511.406C183.768 510.953 183.539 510.281 183.539 509.391V505.312H182.008V504.227H183.539V502.078H184.711V504.227H186.883V505.312ZM192.516 512V500.797H196.398C197.273 500.797 198.021 501.073 198.641 501.625C199.26 502.172 199.57 502.831 199.57 503.602C199.57 504.201 199.388 504.737 199.023 505.211C198.659 505.685 198.206 505.974 197.664 506.078C198.367 506.151 198.958 506.458 199.438 507C199.922 507.542 200.164 508.18 200.164 508.914C200.164 509.773 199.844 510.503 199.203 511.102C198.568 511.701 197.794 512 196.883 512H192.516ZM193.711 505.68H196.367C196.919 505.68 197.388 505.495 197.773 505.125C198.159 504.75 198.352 504.294 198.352 503.758C198.352 503.258 198.156 502.833 197.766 502.484C197.38 502.13 196.914 501.953 196.367 501.953H193.711V505.68ZM193.711 510.852H196.82C197.424 510.852 197.927 510.651 198.328 510.25C198.729 509.849 198.93 509.354 198.93 508.766C198.93 508.182 198.727 507.69 198.32 507.289C197.919 506.888 197.424 506.688 196.836 506.688H193.711V510.852ZM205.18 504.062C205.383 504.062 205.625 504.094 205.906 504.156V505.25C205.651 505.161 205.398 505.117 205.148 505.117C204.539 505.117 204.026 505.333 203.609 505.766C203.198 506.193 202.992 506.734 202.992 507.391V512H201.82V504.227H202.992V505.469C203.221 505.031 203.526 504.688 203.906 504.438C204.286 504.188 204.711 504.062 205.18 504.062ZM213.336 504.227H214.508V512H213.336V510.195C213.049 510.82 212.633 511.305 212.086 511.648C211.544 511.987 210.906 512.156 210.172 512.156C209.469 512.156 208.82 511.977 208.227 511.617C207.638 511.258 207.172 510.766 206.828 510.141C206.484 509.516 206.312 508.833 206.312 508.094C206.312 507.354 206.484 506.674 206.828 506.055C207.172 505.435 207.638 504.948 208.227 504.594C208.82 504.24 209.469 504.062 210.172 504.062C210.906 504.062 211.547 504.234 212.094 504.578C212.641 504.917 213.055 505.396 213.336 506.016V504.227ZM210.391 511.055C211.24 511.055 211.943 510.776 212.5 510.219C213.057 509.656 213.336 508.948 213.336 508.094C213.336 507.245 213.057 506.542 212.5 505.984C211.943 505.427 211.24 505.148 210.391 505.148C209.568 505.148 208.872 505.435 208.305 506.008C207.742 506.581 207.461 507.276 207.461 508.094C207.461 508.927 207.742 509.63 208.305 510.203C208.872 510.771 209.568 511.055 210.391 511.055ZM217.336 500.828C217.56 500.828 217.758 500.911 217.93 501.078C218.102 501.245 218.188 501.44 218.188 501.664C218.188 501.893 218.102 502.094 217.93 502.266C217.758 502.432 217.56 502.516 217.336 502.516C217.107 502.516 216.911 502.432 216.75 502.266C216.589 502.099 216.508 501.898 216.508 501.664C216.508 501.44 216.589 501.245 216.75 501.078C216.911 500.911 217.107 500.828 217.336 500.828ZM216.742 504.227H217.914V512H216.742V504.227ZM223.977 504.062C224.982 504.062 225.779 504.375 226.367 505C226.961 505.62 227.258 506.461 227.258 507.523V512H226.086V507.633C226.086 506.888 225.87 506.292 225.438 505.844C225.01 505.396 224.443 505.172 223.734 505.172C223.005 505.172 222.419 505.398 221.977 505.852C221.539 506.299 221.32 506.893 221.32 507.633V512H220.148V504.227H221.32V505.742C221.57 505.211 221.924 504.799 222.383 504.508C222.841 504.211 223.372 504.062 223.977 504.062ZM230.234 512.156C229.969 512.156 229.747 512.07 229.57 511.898C229.393 511.721 229.305 511.5 229.305 511.234C229.305 510.974 229.393 510.755 229.57 510.578C229.747 510.396 229.969 510.305 230.234 510.305C230.505 510.305 230.729 510.396 230.906 510.578C231.083 510.755 231.172 510.974 231.172 511.234C231.172 511.5 231.083 511.721 230.906 511.898C230.729 512.07 230.505 512.156 230.234 512.156ZM239.633 504.227H240.805V512H239.633V510.195C239.346 510.82 238.93 511.305 238.383 511.648C237.841 511.987 237.203 512.156 236.469 512.156C235.766 512.156 235.117 511.977 234.523 511.617C233.935 511.258 233.469 510.766 233.125 510.141C232.781 509.516 232.609 508.833 232.609 508.094C232.609 507.354 232.781 506.674 233.125 506.055C233.469 505.435 233.935 504.948 234.523 504.594C235.117 504.24 235.766 504.062 236.469 504.062C237.203 504.062 237.844 504.234 238.391 504.578C238.938 504.917 239.352 505.396 239.633 506.016V504.227ZM236.688 511.055C237.536 511.055 238.24 510.776 238.797 510.219C239.354 509.656 239.633 508.948 239.633 508.094C239.633 507.245 239.354 506.542 238.797 505.984C238.24 505.427 237.536 505.148 236.688 505.148C235.865 505.148 235.169 505.435 234.602 506.008C234.039 506.581 233.758 507.276 233.758 508.094C233.758 508.927 234.039 509.63 234.602 510.203C235.169 510.771 235.865 511.055 236.688 511.055ZM243.633 500.828C243.857 500.828 244.055 500.911 244.227 501.078C244.398 501.245 244.484 501.44 244.484 501.664C244.484 501.893 244.398 502.094 244.227 502.266C244.055 502.432 243.857 502.516 243.633 502.516C243.404 502.516 243.208 502.432 243.047 502.266C242.885 502.099 242.805 501.898 242.805 501.664C242.805 501.44 242.885 501.245 243.047 501.078C243.208 500.911 243.404 500.828 243.633 500.828ZM243.039 504.227H244.211V512H243.039V504.227ZM250.305 499.203H251.523V514.945H250.305V499.203ZM257.766 512V500.797H259.188L263.445 510.227L267.781 500.797H269.016V512H267.797V503.234L263.828 512H262.914L258.961 503.234V512H257.766ZM272.141 512.156C271.875 512.156 271.654 512.07 271.477 511.898C271.299 511.721 271.211 511.5 271.211 511.234C271.211 510.974 271.299 510.755 271.477 510.578C271.654 510.396 271.875 510.305 272.141 510.305C272.411 510.305 272.635 510.396 272.812 510.578C272.99 510.755 273.078 510.974 273.078 511.234C273.078 511.5 272.99 511.721 272.812 511.898C272.635 512.07 272.411 512.156 272.141 512.156ZM281.414 500.797V501.953H277.734V512H276.531V501.953H272.852V500.797H281.414ZM288.43 507.875C288.43 508.109 288.424 508.258 288.414 508.32H281.898C281.956 509.154 282.242 509.826 282.758 510.336C283.273 510.846 283.938 511.102 284.75 511.102C285.375 511.102 285.911 510.961 286.359 510.68C286.812 510.393 287.091 510.013 287.195 509.539H288.367C288.216 510.326 287.805 510.958 287.133 511.438C286.461 511.917 285.656 512.156 284.719 512.156C283.589 512.156 282.643 511.766 281.883 510.984C281.128 510.203 280.75 509.229 280.75 508.062C280.75 506.943 281.133 505.997 281.898 505.227C282.664 504.451 283.599 504.062 284.703 504.062C285.396 504.062 286.026 504.227 286.594 504.555C287.161 504.878 287.609 505.331 287.938 505.914C288.266 506.497 288.43 507.151 288.43 507.875ZM281.953 507.328H287.18C287.122 506.682 286.859 506.154 286.391 505.742C285.927 505.326 285.349 505.117 284.656 505.117C283.969 505.117 283.38 505.318 282.891 505.719C282.401 506.12 282.089 506.656 281.953 507.328ZM293.531 512.156C292.401 512.156 291.448 511.768 290.672 510.992C289.901 510.211 289.516 509.25 289.516 508.109C289.516 506.969 289.901 506.01 290.672 505.234C291.448 504.453 292.401 504.062 293.531 504.062C294.411 504.062 295.195 504.32 295.883 504.836C296.57 505.346 296.987 505.99 297.133 506.766H295.945C295.815 506.302 295.523 505.922 295.07 505.625C294.617 505.323 294.104 505.172 293.531 505.172C292.724 505.172 292.044 505.453 291.492 506.016C290.94 506.578 290.664 507.276 290.664 508.109C290.664 508.938 290.94 509.635 291.492 510.203C292.044 510.771 292.724 511.055 293.531 511.055C294.109 511.055 294.628 510.898 295.086 510.586C295.549 510.273 295.836 509.87 295.945 509.375H297.133C297.013 510.188 296.607 510.854 295.914 511.375C295.227 511.896 294.432 512.156 293.531 512.156ZM302.617 504.062C303.622 504.062 304.419 504.375 305.008 505C305.602 505.62 305.898 506.461 305.898 507.523V512H304.727V507.633C304.727 506.888 304.51 506.292 304.078 505.844C303.651 505.396 303.083 505.172 302.375 505.172C301.646 505.172 301.06 505.398 300.617 505.852C300.18 506.299 299.961 506.893 299.961 507.633V512H298.789V500.797H299.961V505.742C300.211 505.211 300.565 504.799 301.023 504.508C301.482 504.211 302.013 504.062 302.617 504.062Z"
            fill="#0F47F2"
          />
          <path
            d="M95.6855 483L94.71 480.478H89.3838L88.3906 483H86.1582L91.1855 470.396H92.9521L97.9707 483H95.6855ZM90.1572 478.465H93.9189L92.0469 473.64L90.1572 478.465ZM103.851 474.018C104.976 474.018 105.866 474.372 106.522 475.081C107.179 475.79 107.507 476.757 107.507 477.981V483H105.494V478.228C105.494 477.536 105.298 476.982 104.905 476.566C104.519 476.15 104.006 475.942 103.367 475.942C102.705 475.942 102.175 476.15 101.776 476.566C101.384 476.982 101.188 477.536 101.188 478.228V483H99.1924V474.202H101.188V475.582C101.469 475.084 101.838 474.7 102.295 474.431C102.752 474.155 103.271 474.018 103.851 474.018ZM116.489 474.202H118.511V483H116.489V481.453C116.167 482.01 115.742 482.438 115.215 482.736C114.688 483.029 114.075 483.176 113.378 483.176C112.61 483.176 111.904 482.974 111.26 482.569C110.615 482.159 110.105 481.603 109.73 480.899C109.355 480.19 109.168 479.42 109.168 478.588C109.168 477.756 109.355 476.988 109.73 476.285C110.105 475.582 110.615 475.028 111.26 474.624C111.904 474.22 112.61 474.018 113.378 474.018C114.075 474.018 114.688 474.167 115.215 474.466C115.742 474.765 116.167 475.192 116.489 475.749V474.202ZM113.809 481.269C114.57 481.269 115.206 481.014 115.716 480.504C116.231 479.988 116.489 479.35 116.489 478.588C116.489 477.832 116.231 477.199 115.716 476.689C115.206 476.18 114.57 475.925 113.809 475.925C113.064 475.925 112.435 476.186 111.919 476.707C111.403 477.223 111.146 477.85 111.146 478.588C111.146 479.338 111.403 479.974 111.919 480.495C112.435 481.011 113.064 481.269 113.809 481.269ZM128.82 470.396C129.705 470.396 130.537 470.555 131.316 470.871C132.096 471.188 132.764 471.621 133.32 472.172C133.877 472.717 134.316 473.379 134.639 474.158C134.961 474.932 135.122 475.761 135.122 476.646C135.122 477.542 134.961 478.386 134.639 479.177C134.316 479.962 133.877 480.636 133.32 481.198C132.764 481.755 132.096 482.194 131.316 482.517C130.537 482.839 129.705 483 128.82 483H124.681V470.396H128.82ZM128.961 480.987C130.104 480.987 131.056 480.574 131.817 479.748C132.579 478.922 132.96 477.888 132.96 476.646C132.96 475.415 132.582 474.404 131.826 473.613C131.07 472.816 130.115 472.418 128.961 472.418H126.79V480.987H128.961ZM145.124 478.412C145.124 478.816 145.106 479.098 145.071 479.256H138.321C138.45 479.912 138.737 480.428 139.183 480.803C139.628 481.178 140.199 481.365 140.896 481.365C141.436 481.365 141.898 481.248 142.285 481.014C142.678 480.779 142.918 480.475 143.006 480.1H145.019C144.854 481.025 144.392 481.77 143.63 482.332C142.868 482.895 141.945 483.176 140.861 483.176C140.012 483.176 139.238 482.977 138.541 482.578C137.844 482.174 137.293 481.617 136.889 480.908C136.49 480.199 136.291 479.414 136.291 478.553C136.291 477.715 136.49 476.95 136.889 476.259C137.293 475.562 137.841 475.014 138.532 474.615C139.229 474.217 139.994 474.018 140.826 474.018C141.611 474.018 142.329 474.202 142.979 474.571C143.636 474.94 144.157 475.465 144.544 476.145C144.931 476.818 145.124 477.574 145.124 478.412ZM138.374 477.542H142.944C142.856 477.032 142.61 476.622 142.206 476.312C141.808 475.995 141.31 475.837 140.712 475.837C140.12 475.837 139.619 475.986 139.209 476.285C138.799 476.584 138.521 477.003 138.374 477.542ZM159.371 483L158.396 480.478H153.069L152.076 483H149.844L154.871 470.396H156.638L161.656 483H159.371ZM153.843 478.465H157.604L155.732 473.64L153.843 478.465ZM167.246 474.018C167.439 474.018 167.718 474.053 168.081 474.123V475.96C167.741 475.878 167.445 475.837 167.193 475.837C166.531 475.837 165.978 476.057 165.532 476.496C165.093 476.936 164.873 477.536 164.873 478.298V483H162.878V474.202H164.873V475.371C165.43 474.469 166.221 474.018 167.246 474.018ZM179.727 474.018C180.799 474.018 181.666 474.346 182.328 475.002C182.996 475.652 183.33 476.525 183.33 477.621V483H181.291V478.069C181.291 477.407 181.121 476.889 180.781 476.514C180.441 476.133 179.976 475.942 179.384 475.942C178.839 475.942 178.376 476.121 177.995 476.479C177.614 476.836 177.424 477.366 177.424 478.069V483H175.411V478.069C175.411 477.407 175.238 476.889 174.893 476.514C174.547 476.133 174.075 475.942 173.478 475.942C172.938 475.942 172.476 476.121 172.089 476.479C171.708 476.836 171.518 477.366 171.518 478.069V483H169.522V474.202H171.518V475.441C171.816 474.943 172.206 474.583 172.687 474.36C173.173 474.132 173.677 474.018 174.198 474.018C175.493 474.018 176.401 474.533 176.923 475.564C177.169 475.09 177.547 474.715 178.057 474.439C178.566 474.158 179.123 474.018 179.727 474.018ZM192.304 474.202H194.325V483H192.304V481.453C191.981 482.01 191.557 482.438 191.029 482.736C190.502 483.029 189.89 483.176 189.192 483.176C188.425 483.176 187.719 482.974 187.074 482.569C186.43 482.159 185.92 481.603 185.545 480.899C185.17 480.19 184.982 479.42 184.982 478.588C184.982 477.756 185.17 476.988 185.545 476.285C185.92 475.582 186.43 475.028 187.074 474.624C187.719 474.22 188.425 474.018 189.192 474.018C189.89 474.018 190.502 474.167 191.029 474.466C191.557 474.765 191.981 475.192 192.304 475.749V474.202ZM189.623 481.269C190.385 481.269 191.021 481.014 191.53 480.504C192.046 479.988 192.304 479.35 192.304 478.588C192.304 477.832 192.046 477.199 191.53 476.689C191.021 476.18 190.385 475.925 189.623 475.925C188.879 475.925 188.249 476.186 187.733 476.707C187.218 477.223 186.96 477.85 186.96 478.588C186.96 479.338 187.218 479.974 187.733 480.495C188.249 481.011 188.879 481.269 189.623 481.269ZM199.73 483.176C198.641 483.176 197.747 482.909 197.05 482.376C196.353 481.843 195.96 481.107 195.872 480.17H197.797C197.832 480.551 198.02 480.861 198.359 481.102C198.699 481.336 199.118 481.453 199.616 481.453C200.097 481.453 200.475 481.359 200.75 481.172C201.025 480.984 201.163 480.735 201.163 480.425C201.163 480.173 201.069 479.968 200.882 479.81C200.694 479.646 200.451 479.525 200.152 479.449C199.854 479.367 199.522 479.294 199.159 479.229C198.802 479.165 198.441 479.083 198.078 478.983C197.715 478.884 197.384 478.755 197.085 478.597C196.786 478.433 196.543 478.192 196.355 477.876C196.168 477.554 196.074 477.167 196.074 476.716C196.074 475.937 196.376 475.292 196.979 474.782C197.589 474.272 198.397 474.018 199.405 474.018C200.354 474.018 201.166 474.261 201.84 474.747C202.514 475.233 202.9 475.907 203 476.769H200.987C200.94 476.458 200.771 476.203 200.478 476.004C200.185 475.799 199.815 475.696 199.37 475.696C198.972 475.696 198.646 475.778 198.395 475.942C198.143 476.101 198.017 476.317 198.017 476.593C198.017 476.804 198.09 476.979 198.236 477.12C198.383 477.261 198.576 477.363 198.816 477.428C199.057 477.486 199.329 477.548 199.634 477.612C199.938 477.677 200.252 477.735 200.574 477.788C200.896 477.841 201.21 477.932 201.515 478.061C201.819 478.184 202.092 478.333 202.332 478.509C202.572 478.685 202.766 478.937 202.912 479.265C203.059 479.587 203.132 479.968 203.132 480.407C203.132 481.198 202.807 481.857 202.156 482.385C201.512 482.912 200.703 483.176 199.73 483.176Z"
            fill="#222222"
          />
          <rect
            x="210"
            y="467"
            width="19"
            height="19"
            rx="9.5"
            fill="url(#pattern0_4500_3993)"
          />
          <path
            d="M219.867 546.156C218.701 546.156 217.734 545.815 216.969 545.133C216.208 544.445 215.828 543.578 215.828 542.531H217.016C217.016 543.26 217.284 543.859 217.82 544.328C218.357 544.792 219.039 545.023 219.867 545.023C220.648 545.023 221.294 544.833 221.805 544.453C222.315 544.068 222.57 543.576 222.57 542.977C222.57 542.664 222.508 542.388 222.383 542.148C222.263 541.909 222.096 541.716 221.883 541.57C221.674 541.424 221.43 541.292 221.148 541.172C220.872 541.047 220.576 540.948 220.258 540.875C219.945 540.802 219.622 540.719 219.289 540.625C218.956 540.531 218.63 540.44 218.312 540.352C218 540.258 217.703 540.133 217.422 539.977C217.146 539.82 216.901 539.643 216.688 539.445C216.479 539.247 216.312 538.992 216.188 538.68C216.068 538.367 216.008 538.013 216.008 537.617C216.008 536.753 216.354 536.042 217.047 535.484C217.745 534.922 218.625 534.641 219.688 534.641C220.828 534.641 221.734 534.951 222.406 535.57C223.078 536.185 223.414 536.958 223.414 537.891H222.188C222.161 537.276 221.914 536.773 221.445 536.383C220.982 535.987 220.385 535.789 219.656 535.789C218.927 535.789 218.333 535.958 217.875 536.297C217.422 536.635 217.195 537.076 217.195 537.617C217.195 537.93 217.271 538.201 217.422 538.43C217.573 538.659 217.773 538.841 218.023 538.977C218.279 539.112 218.57 539.232 218.898 539.336C219.227 539.435 219.573 539.529 219.938 539.617C220.302 539.701 220.664 539.792 221.023 539.891C221.388 539.99 221.734 540.12 222.062 540.281C222.391 540.443 222.68 540.635 222.93 540.859C223.185 541.078 223.388 541.37 223.539 541.734C223.69 542.094 223.766 542.508 223.766 542.977C223.766 543.898 223.396 544.659 222.656 545.258C221.922 545.857 220.992 546.156 219.867 546.156ZM226.328 539.234C227.104 538.453 228.057 538.062 229.188 538.062C230.318 538.062 231.271 538.453 232.047 539.234C232.828 540.01 233.219 540.969 233.219 542.109C233.219 543.25 232.828 544.211 232.047 544.992C231.271 545.768 230.318 546.156 229.188 546.156C228.057 546.156 227.104 545.768 226.328 544.992C225.557 544.211 225.172 543.25 225.172 542.109C225.172 540.969 225.557 540.01 226.328 539.234ZM229.188 539.172C228.38 539.172 227.701 539.453 227.148 540.016C226.596 540.578 226.32 541.276 226.32 542.109C226.32 542.938 226.596 543.635 227.148 544.203C227.701 544.771 228.38 545.055 229.188 545.055C229.995 545.055 230.677 544.771 231.234 544.203C231.792 543.63 232.07 542.932 232.07 542.109C232.07 541.281 231.792 540.586 231.234 540.023C230.682 539.456 230 539.172 229.188 539.172ZM240.93 538.227H242.102V546H240.93V544.492C240.68 545.018 240.326 545.427 239.867 545.719C239.414 546.01 238.883 546.156 238.273 546.156C237.273 546.156 236.477 545.844 235.883 545.219C235.289 544.594 234.992 543.755 234.992 542.703V538.227H236.164V542.578C236.164 543.333 236.378 543.935 236.805 544.383C237.232 544.831 237.802 545.055 238.516 545.055C239.25 545.055 239.836 544.831 240.273 544.383C240.711 543.935 240.93 543.333 240.93 542.578V538.227ZM247.695 538.062C247.898 538.062 248.141 538.094 248.422 538.156V539.25C248.167 539.161 247.914 539.117 247.664 539.117C247.055 539.117 246.542 539.333 246.125 539.766C245.714 540.193 245.508 540.734 245.508 541.391V546H244.336V538.227H245.508V539.469C245.737 539.031 246.042 538.688 246.422 538.438C246.802 538.188 247.227 538.062 247.695 538.062ZM252.844 546.156C251.714 546.156 250.76 545.768 249.984 544.992C249.214 544.211 248.828 543.25 248.828 542.109C248.828 540.969 249.214 540.01 249.984 539.234C250.76 538.453 251.714 538.062 252.844 538.062C253.724 538.062 254.508 538.32 255.195 538.836C255.883 539.346 256.299 539.99 256.445 540.766H255.258C255.128 540.302 254.836 539.922 254.383 539.625C253.93 539.323 253.417 539.172 252.844 539.172C252.036 539.172 251.357 539.453 250.805 540.016C250.253 540.578 249.977 541.276 249.977 542.109C249.977 542.938 250.253 543.635 250.805 544.203C251.357 544.771 252.036 545.055 252.844 545.055C253.422 545.055 253.94 544.898 254.398 544.586C254.862 544.273 255.148 543.87 255.258 543.375H256.445C256.326 544.188 255.919 544.854 255.227 545.375C254.539 545.896 253.745 546.156 252.844 546.156ZM265.289 541.875C265.289 542.109 265.284 542.258 265.273 542.32H258.758C258.815 543.154 259.102 543.826 259.617 544.336C260.133 544.846 260.797 545.102 261.609 545.102C262.234 545.102 262.771 544.961 263.219 544.68C263.672 544.393 263.951 544.013 264.055 543.539H265.227C265.076 544.326 264.664 544.958 263.992 545.438C263.32 545.917 262.516 546.156 261.578 546.156C260.448 546.156 259.503 545.766 258.742 544.984C257.987 544.203 257.609 543.229 257.609 542.062C257.609 540.943 257.992 539.997 258.758 539.227C259.523 538.451 260.458 538.062 261.562 538.062C262.255 538.062 262.885 538.227 263.453 538.555C264.021 538.878 264.469 539.331 264.797 539.914C265.125 540.497 265.289 541.151 265.289 541.875ZM258.812 541.328H264.039C263.982 540.682 263.719 540.154 263.25 539.742C262.786 539.326 262.208 539.117 261.516 539.117C260.828 539.117 260.24 539.318 259.75 539.719C259.26 540.12 258.948 540.656 258.812 541.328ZM273.398 534.797H274.57V546H273.398V544.195C273.112 544.82 272.695 545.305 272.148 545.648C271.607 545.987 270.969 546.156 270.234 546.156C269.531 546.156 268.883 545.977 268.289 545.617C267.701 545.258 267.234 544.766 266.891 544.141C266.547 543.516 266.375 542.833 266.375 542.094C266.375 541.354 266.547 540.674 266.891 540.055C267.234 539.435 267.701 538.948 268.289 538.594C268.883 538.24 269.531 538.062 270.234 538.062C270.969 538.062 271.609 538.234 272.156 538.578C272.703 538.917 273.117 539.396 273.398 540.016V534.797ZM270.453 545.055C271.302 545.055 272.005 544.776 272.562 544.219C273.12 543.656 273.398 542.948 273.398 542.094C273.398 541.245 273.12 540.542 272.562 539.984C272.005 539.427 271.302 539.148 270.453 539.148C269.63 539.148 268.935 539.435 268.367 540.008C267.805 540.581 267.523 541.276 267.523 542.094C267.523 542.927 267.805 543.63 268.367 544.203C268.935 544.771 269.63 545.055 270.453 545.055ZM284.008 538.781C285.023 538.781 285.878 539.133 286.57 539.836C287.263 540.539 287.609 541.409 287.609 542.445C287.609 543.117 287.44 543.74 287.102 544.312C286.763 544.88 286.305 545.331 285.727 545.664C285.148 545.992 284.518 546.156 283.836 546.156C283.154 546.156 282.523 545.992 281.945 545.664C281.372 545.331 280.917 544.88 280.578 544.312C280.245 543.74 280.078 543.117 280.078 542.445C280.078 542.044 280.156 541.596 280.312 541.102C280.474 540.607 280.703 540.122 281 539.648L284.023 534.797H285.406L282.633 539.148C283.065 538.904 283.523 538.781 284.008 538.781ZM283.836 545.008C284.57 545.008 285.188 544.76 285.688 544.266C286.193 543.766 286.445 543.154 286.445 542.43C286.445 541.701 286.19 541.083 285.68 540.578C285.174 540.073 284.555 539.82 283.82 539.82C283.102 539.82 282.492 540.073 281.992 540.578C281.492 541.083 281.242 541.701 281.242 542.43C281.242 543.154 281.492 543.766 281.992 544.266C282.492 544.76 283.107 545.008 283.836 545.008ZM299.602 534.797H300.773V546H299.602V544.195C299.315 544.82 298.898 545.305 298.352 545.648C297.81 545.987 297.172 546.156 296.438 546.156C295.734 546.156 295.086 545.977 294.492 545.617C293.904 545.258 293.438 544.766 293.094 544.141C292.75 543.516 292.578 542.833 292.578 542.094C292.578 541.354 292.75 540.674 293.094 540.055C293.438 539.435 293.904 538.948 294.492 538.594C295.086 538.24 295.734 538.062 296.438 538.062C297.172 538.062 297.812 538.234 298.359 538.578C298.906 538.917 299.32 539.396 299.602 540.016V534.797ZM296.656 545.055C297.505 545.055 298.208 544.776 298.766 544.219C299.323 543.656 299.602 542.948 299.602 542.094C299.602 541.245 299.323 540.542 298.766 539.984C298.208 539.427 297.505 539.148 296.656 539.148C295.833 539.148 295.138 539.435 294.57 540.008C294.008 540.581 293.727 541.276 293.727 542.094C293.727 542.927 294.008 543.63 294.57 544.203C295.138 544.771 295.833 545.055 296.656 545.055ZM309.336 538.227H310.508V546H309.336V544.195C309.049 544.82 308.633 545.305 308.086 545.648C307.544 545.987 306.906 546.156 306.172 546.156C305.469 546.156 304.82 545.977 304.227 545.617C303.638 545.258 303.172 544.766 302.828 544.141C302.484 543.516 302.312 542.833 302.312 542.094C302.312 541.354 302.484 540.674 302.828 540.055C303.172 539.435 303.638 538.948 304.227 538.594C304.82 538.24 305.469 538.062 306.172 538.062C306.906 538.062 307.547 538.234 308.094 538.578C308.641 538.917 309.055 539.396 309.336 540.016V538.227ZM306.391 545.055C307.24 545.055 307.943 544.776 308.5 544.219C309.057 543.656 309.336 542.948 309.336 542.094C309.336 541.245 309.057 540.542 308.5 539.984C307.943 539.427 307.24 539.148 306.391 539.148C305.568 539.148 304.872 539.435 304.305 540.008C303.742 540.581 303.461 541.276 303.461 542.094C303.461 542.927 303.742 543.63 304.305 544.203C304.872 544.771 305.568 545.055 306.391 545.055ZM318.266 538.227H319.516L315.016 548.945H313.766L315.109 545.859L311.898 538.227H313.164L315.703 544.492L318.266 538.227ZM323.352 546.156C322.477 546.156 321.753 545.935 321.18 545.492C320.607 545.049 320.281 544.451 320.203 543.695H321.32C321.372 544.138 321.581 544.492 321.945 544.758C322.31 545.018 322.763 545.148 323.305 545.148C323.846 545.148 324.281 545.026 324.609 544.781C324.943 544.531 325.109 544.211 325.109 543.82C325.109 543.56 325.042 543.341 324.906 543.164C324.771 542.982 324.591 542.846 324.367 542.758C324.148 542.669 323.898 542.589 323.617 542.516C323.336 542.443 323.047 542.383 322.75 542.336C322.453 542.289 322.164 542.216 321.883 542.117C321.602 542.018 321.349 541.901 321.125 541.766C320.906 541.625 320.729 541.427 320.594 541.172C320.458 540.911 320.391 540.602 320.391 540.242C320.391 539.602 320.643 539.078 321.148 538.672C321.654 538.266 322.323 538.062 323.156 538.062C323.922 538.062 324.581 538.266 325.133 538.672C325.69 539.073 326.013 539.612 326.102 540.289H324.922C324.865 539.924 324.669 539.625 324.336 539.391C324.003 539.156 323.599 539.039 323.125 539.039C322.651 539.039 322.266 539.143 321.969 539.352C321.677 539.555 321.531 539.823 321.531 540.156C321.531 540.438 321.617 540.667 321.789 540.844C321.966 541.021 322.193 541.151 322.469 541.234C322.745 541.318 323.049 541.391 323.383 541.453C323.721 541.51 324.057 541.583 324.391 541.672C324.729 541.76 325.036 541.878 325.312 542.023C325.589 542.169 325.812 542.391 325.984 542.688C326.161 542.984 326.25 543.352 326.25 543.789C326.25 544.477 325.974 545.044 325.422 545.492C324.875 545.935 324.185 546.156 323.352 546.156ZM338.477 538.227H339.648V546H338.477V544.195C338.19 544.82 337.773 545.305 337.227 545.648C336.685 545.987 336.047 546.156 335.312 546.156C334.609 546.156 333.961 545.977 333.367 545.617C332.779 545.258 332.312 544.766 331.969 544.141C331.625 543.516 331.453 542.833 331.453 542.094C331.453 541.354 331.625 540.674 331.969 540.055C332.312 539.435 332.779 538.948 333.367 538.594C333.961 538.24 334.609 538.062 335.312 538.062C336.047 538.062 336.688 538.234 337.234 538.578C337.781 538.917 338.195 539.396 338.477 540.016V538.227ZM335.531 545.055C336.38 545.055 337.083 544.776 337.641 544.219C338.198 543.656 338.477 542.948 338.477 542.094C338.477 541.245 338.198 540.542 337.641 539.984C337.083 539.427 336.38 539.148 335.531 539.148C334.708 539.148 334.013 539.435 333.445 540.008C332.883 540.581 332.602 541.276 332.602 542.094C332.602 542.927 332.883 543.63 333.445 544.203C334.013 544.771 334.708 545.055 335.531 545.055ZM348.445 538.211H349.617V545.758C349.617 546.826 349.255 547.685 348.531 548.336C347.807 548.987 346.878 549.312 345.742 549.312C345.294 549.312 344.859 549.255 344.438 549.141C344.016 549.031 343.622 548.87 343.258 548.656C342.898 548.443 342.604 548.154 342.375 547.789C342.151 547.43 342.031 547.021 342.016 546.562H343.148C343.164 547.094 343.417 547.518 343.906 547.836C344.396 548.159 344.997 548.32 345.711 548.32C346.503 548.32 347.156 548.086 347.672 547.617C348.188 547.154 348.445 546.549 348.445 545.805V544.094C348.159 544.708 347.742 545.185 347.195 545.523C346.654 545.862 346.016 546.031 345.281 546.031C344.578 546.031 343.93 545.854 343.336 545.5C342.747 545.146 342.281 544.661 341.938 544.047C341.594 543.432 341.422 542.76 341.422 542.031C341.422 541.307 341.594 540.641 341.938 540.031C342.281 539.422 342.747 538.943 343.336 538.594C343.93 538.24 344.578 538.062 345.281 538.062C346.016 538.062 346.654 538.232 347.195 538.57C347.742 538.904 348.159 539.375 348.445 539.984V538.211ZM345.5 544.945C346.349 544.945 347.052 544.672 347.609 544.125C348.167 543.573 348.445 542.875 348.445 542.031C348.445 541.198 348.167 540.508 347.609 539.961C347.052 539.409 346.349 539.133 345.5 539.133C344.677 539.133 343.982 539.414 343.414 539.977C342.852 540.534 342.57 541.219 342.57 542.031C342.57 542.849 342.852 543.539 343.414 544.102C343.982 544.664 344.677 544.945 345.5 544.945ZM352.547 539.234C353.323 538.453 354.276 538.062 355.406 538.062C356.536 538.062 357.49 538.453 358.266 539.234C359.047 540.01 359.438 540.969 359.438 542.109C359.438 543.25 359.047 544.211 358.266 544.992C357.49 545.768 356.536 546.156 355.406 546.156C354.276 546.156 353.323 545.768 352.547 544.992C351.776 544.211 351.391 543.25 351.391 542.109C351.391 540.969 351.776 540.01 352.547 539.234ZM355.406 539.172C354.599 539.172 353.919 539.453 353.367 540.016C352.815 540.578 352.539 541.276 352.539 542.109C352.539 542.938 352.815 543.635 353.367 544.203C353.919 544.771 354.599 545.055 355.406 545.055C356.214 545.055 356.896 544.771 357.453 544.203C358.01 543.63 358.289 542.932 358.289 542.109C358.289 541.281 358.01 540.586 357.453 540.023C356.901 539.456 356.219 539.172 355.406 539.172Z"
            fill="#818283"
          />
          <path
            d="M209.833 540.833C209.833 544.053 207.219 546.667 203.999 546.667C200.779 546.667 198.166 544.053 198.166 540.833C198.166 537.613 200.779 535 203.999 535C207.219 535 209.833 537.613 209.833 540.833Z"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M204 537.332V540.665"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M202 533.332H206"
            stroke="#818283"
            stroke-width="1.33"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M86 564H766" stroke="#818283" stroke-width="0.25" />
          <circle cx="188.5" cy="691.5" r="14.5" fill="#4B5563" />
          <path
            d="M186.257 691.519C186.257 692.719 185.261 693.691 184.032 693.691C182.803 693.691 181.807 692.719 181.807 691.519C181.807 690.32 182.803 689.348 184.032 689.348C185.261 689.348 186.257 690.32 186.257 691.519Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M190.709 686.734L186.258 689.775"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M190.709 696.302L186.258 693.262"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M195.162 697.16C195.162 698.359 194.165 699.331 192.936 699.331C191.707 699.331 190.711 698.359 190.711 697.16C190.711 695.961 191.707 694.988 192.936 694.988C194.165 694.988 195.162 695.961 195.162 697.16Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M195.162 685.863C195.162 687.062 194.165 688.035 192.936 688.035C191.707 688.035 190.711 687.062 190.711 685.863C190.711 684.664 191.707 683.691 192.936 683.691C194.165 683.691 195.162 684.664 195.162 685.863Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <rect
            x="30.5"
            y="754.5"
            width="769"
            height="279"
            rx="5.5"
            fill="white"
            stroke="#E2E2E2"
          />
          <path
            d="M219.867 851.156C218.701 851.156 217.734 850.815 216.969 850.133C216.208 849.445 215.828 848.578 215.828 847.531H217.016C217.016 848.26 217.284 848.859 217.82 849.328C218.357 849.792 219.039 850.023 219.867 850.023C220.648 850.023 221.294 849.833 221.805 849.453C222.315 849.068 222.57 848.576 222.57 847.977C222.57 847.664 222.508 847.388 222.383 847.148C222.263 846.909 222.096 846.716 221.883 846.57C221.674 846.424 221.43 846.292 221.148 846.172C220.872 846.047 220.576 845.948 220.258 845.875C219.945 845.802 219.622 845.719 219.289 845.625C218.956 845.531 218.63 845.44 218.312 845.352C218 845.258 217.703 845.133 217.422 844.977C217.146 844.82 216.901 844.643 216.688 844.445C216.479 844.247 216.312 843.992 216.188 843.68C216.068 843.367 216.008 843.013 216.008 842.617C216.008 841.753 216.354 841.042 217.047 840.484C217.745 839.922 218.625 839.641 219.688 839.641C220.828 839.641 221.734 839.951 222.406 840.57C223.078 841.185 223.414 841.958 223.414 842.891H222.188C222.161 842.276 221.914 841.773 221.445 841.383C220.982 840.987 220.385 840.789 219.656 840.789C218.927 840.789 218.333 840.958 217.875 841.297C217.422 841.635 217.195 842.076 217.195 842.617C217.195 842.93 217.271 843.201 217.422 843.43C217.573 843.659 217.773 843.841 218.023 843.977C218.279 844.112 218.57 844.232 218.898 844.336C219.227 844.435 219.573 844.529 219.938 844.617C220.302 844.701 220.664 844.792 221.023 844.891C221.388 844.99 221.734 845.12 222.062 845.281C222.391 845.443 222.68 845.635 222.93 845.859C223.185 846.078 223.388 846.37 223.539 846.734C223.69 847.094 223.766 847.508 223.766 847.977C223.766 848.898 223.396 849.659 222.656 850.258C221.922 850.857 220.992 851.156 219.867 851.156ZM226.328 844.234C227.104 843.453 228.057 843.062 229.188 843.062C230.318 843.062 231.271 843.453 232.047 844.234C232.828 845.01 233.219 845.969 233.219 847.109C233.219 848.25 232.828 849.211 232.047 849.992C231.271 850.768 230.318 851.156 229.188 851.156C228.057 851.156 227.104 850.768 226.328 849.992C225.557 849.211 225.172 848.25 225.172 847.109C225.172 845.969 225.557 845.01 226.328 844.234ZM229.188 844.172C228.38 844.172 227.701 844.453 227.148 845.016C226.596 845.578 226.32 846.276 226.32 847.109C226.32 847.938 226.596 848.635 227.148 849.203C227.701 849.771 228.38 850.055 229.188 850.055C229.995 850.055 230.677 849.771 231.234 849.203C231.792 848.63 232.07 847.932 232.07 847.109C232.07 846.281 231.792 845.586 231.234 845.023C230.682 844.456 230 844.172 229.188 844.172ZM240.93 843.227H242.102V851H240.93V849.492C240.68 850.018 240.326 850.427 239.867 850.719C239.414 851.01 238.883 851.156 238.273 851.156C237.273 851.156 236.477 850.844 235.883 850.219C235.289 849.594 234.992 848.755 234.992 847.703V843.227H236.164V847.578C236.164 848.333 236.378 848.935 236.805 849.383C237.232 849.831 237.802 850.055 238.516 850.055C239.25 850.055 239.836 849.831 240.273 849.383C240.711 848.935 240.93 848.333 240.93 847.578V843.227ZM247.695 843.062C247.898 843.062 248.141 843.094 248.422 843.156V844.25C248.167 844.161 247.914 844.117 247.664 844.117C247.055 844.117 246.542 844.333 246.125 844.766C245.714 845.193 245.508 845.734 245.508 846.391V851H244.336V843.227H245.508V844.469C245.737 844.031 246.042 843.688 246.422 843.438C246.802 843.188 247.227 843.062 247.695 843.062ZM252.844 851.156C251.714 851.156 250.76 850.768 249.984 849.992C249.214 849.211 248.828 848.25 248.828 847.109C248.828 845.969 249.214 845.01 249.984 844.234C250.76 843.453 251.714 843.062 252.844 843.062C253.724 843.062 254.508 843.32 255.195 843.836C255.883 844.346 256.299 844.99 256.445 845.766H255.258C255.128 845.302 254.836 844.922 254.383 844.625C253.93 844.323 253.417 844.172 252.844 844.172C252.036 844.172 251.357 844.453 250.805 845.016C250.253 845.578 249.977 846.276 249.977 847.109C249.977 847.938 250.253 848.635 250.805 849.203C251.357 849.771 252.036 850.055 252.844 850.055C253.422 850.055 253.94 849.898 254.398 849.586C254.862 849.273 255.148 848.87 255.258 848.375H256.445C256.326 849.188 255.919 849.854 255.227 850.375C254.539 850.896 253.745 851.156 252.844 851.156ZM265.289 846.875C265.289 847.109 265.284 847.258 265.273 847.32H258.758C258.815 848.154 259.102 848.826 259.617 849.336C260.133 849.846 260.797 850.102 261.609 850.102C262.234 850.102 262.771 849.961 263.219 849.68C263.672 849.393 263.951 849.013 264.055 848.539H265.227C265.076 849.326 264.664 849.958 263.992 850.438C263.32 850.917 262.516 851.156 261.578 851.156C260.448 851.156 259.503 850.766 258.742 849.984C257.987 849.203 257.609 848.229 257.609 847.062C257.609 845.943 257.992 844.997 258.758 844.227C259.523 843.451 260.458 843.062 261.562 843.062C262.255 843.062 262.885 843.227 263.453 843.555C264.021 843.878 264.469 844.331 264.797 844.914C265.125 845.497 265.289 846.151 265.289 846.875ZM258.812 846.328H264.039C263.982 845.682 263.719 845.154 263.25 844.742C262.786 844.326 262.208 844.117 261.516 844.117C260.828 844.117 260.24 844.318 259.75 844.719C259.26 845.12 258.948 845.656 258.812 846.328ZM273.398 839.797H274.57V851H273.398V849.195C273.112 849.82 272.695 850.305 272.148 850.648C271.607 850.987 270.969 851.156 270.234 851.156C269.531 851.156 268.883 850.977 268.289 850.617C267.701 850.258 267.234 849.766 266.891 849.141C266.547 848.516 266.375 847.833 266.375 847.094C266.375 846.354 266.547 845.674 266.891 845.055C267.234 844.435 267.701 843.948 268.289 843.594C268.883 843.24 269.531 843.062 270.234 843.062C270.969 843.062 271.609 843.234 272.156 843.578C272.703 843.917 273.117 844.396 273.398 845.016V839.797ZM270.453 850.055C271.302 850.055 272.005 849.776 272.562 849.219C273.12 848.656 273.398 847.948 273.398 847.094C273.398 846.245 273.12 845.542 272.562 844.984C272.005 844.427 271.302 844.148 270.453 844.148C269.63 844.148 268.935 844.435 268.367 845.008C267.805 845.581 267.523 846.276 267.523 847.094C267.523 847.927 267.805 848.63 268.367 849.203C268.935 849.771 269.63 850.055 270.453 850.055ZM284.008 843.781C285.023 843.781 285.878 844.133 286.57 844.836C287.263 845.539 287.609 846.409 287.609 847.445C287.609 848.117 287.44 848.74 287.102 849.312C286.763 849.88 286.305 850.331 285.727 850.664C285.148 850.992 284.518 851.156 283.836 851.156C283.154 851.156 282.523 850.992 281.945 850.664C281.372 850.331 280.917 849.88 280.578 849.312C280.245 848.74 280.078 848.117 280.078 847.445C280.078 847.044 280.156 846.596 280.312 846.102C280.474 845.607 280.703 845.122 281 844.648L284.023 839.797H285.406L282.633 844.148C283.065 843.904 283.523 843.781 284.008 843.781ZM283.836 850.008C284.57 850.008 285.188 849.76 285.688 849.266C286.193 848.766 286.445 848.154 286.445 847.43C286.445 846.701 286.19 846.083 285.68 845.578C285.174 845.073 284.555 844.82 283.82 844.82C283.102 844.82 282.492 845.073 281.992 845.578C281.492 846.083 281.242 846.701 281.242 847.43C281.242 848.154 281.492 848.766 281.992 849.266C282.492 849.76 283.107 850.008 283.836 850.008ZM299.602 839.797H300.773V851H299.602V849.195C299.315 849.82 298.898 850.305 298.352 850.648C297.81 850.987 297.172 851.156 296.438 851.156C295.734 851.156 295.086 850.977 294.492 850.617C293.904 850.258 293.438 849.766 293.094 849.141C292.75 848.516 292.578 847.833 292.578 847.094C292.578 846.354 292.75 845.674 293.094 845.055C293.438 844.435 293.904 843.948 294.492 843.594C295.086 843.24 295.734 843.062 296.438 843.062C297.172 843.062 297.812 843.234 298.359 843.578C298.906 843.917 299.32 844.396 299.602 845.016V839.797ZM296.656 850.055C297.505 850.055 298.208 849.776 298.766 849.219C299.323 848.656 299.602 847.948 299.602 847.094C299.602 846.245 299.323 845.542 298.766 844.984C298.208 844.427 297.505 844.148 296.656 844.148C295.833 844.148 295.138 844.435 294.57 845.008C294.008 845.581 293.727 846.276 293.727 847.094C293.727 847.927 294.008 848.63 294.57 849.203C295.138 849.771 295.833 850.055 296.656 850.055ZM309.336 843.227H310.508V851H309.336V849.195C309.049 849.82 308.633 850.305 308.086 850.648C307.544 850.987 306.906 851.156 306.172 851.156C305.469 851.156 304.82 850.977 304.227 850.617C303.638 850.258 303.172 849.766 302.828 849.141C302.484 848.516 302.312 847.833 302.312 847.094C302.312 846.354 302.484 845.674 302.828 845.055C303.172 844.435 303.638 843.948 304.227 843.594C304.82 843.24 305.469 843.062 306.172 843.062C306.906 843.062 307.547 843.234 308.094 843.578C308.641 843.917 309.055 844.396 309.336 845.016V843.227ZM306.391 850.055C307.24 850.055 307.943 849.776 308.5 849.219C309.057 848.656 309.336 847.948 309.336 847.094C309.336 846.245 309.057 845.542 308.5 844.984C307.943 844.427 307.24 844.148 306.391 844.148C305.568 844.148 304.872 844.435 304.305 845.008C303.742 845.581 303.461 846.276 303.461 847.094C303.461 847.927 303.742 848.63 304.305 849.203C304.872 849.771 305.568 850.055 306.391 850.055ZM318.266 843.227H319.516L315.016 853.945H313.766L315.109 850.859L311.898 843.227H313.164L315.703 849.492L318.266 843.227ZM323.352 851.156C322.477 851.156 321.753 850.935 321.18 850.492C320.607 850.049 320.281 849.451 320.203 848.695H321.32C321.372 849.138 321.581 849.492 321.945 849.758C322.31 850.018 322.763 850.148 323.305 850.148C323.846 850.148 324.281 850.026 324.609 849.781C324.943 849.531 325.109 849.211 325.109 848.82C325.109 848.56 325.042 848.341 324.906 848.164C324.771 847.982 324.591 847.846 324.367 847.758C324.148 847.669 323.898 847.589 323.617 847.516C323.336 847.443 323.047 847.383 322.75 847.336C322.453 847.289 322.164 847.216 321.883 847.117C321.602 847.018 321.349 846.901 321.125 846.766C320.906 846.625 320.729 846.427 320.594 846.172C320.458 845.911 320.391 845.602 320.391 845.242C320.391 844.602 320.643 844.078 321.148 843.672C321.654 843.266 322.323 843.062 323.156 843.062C323.922 843.062 324.581 843.266 325.133 843.672C325.69 844.073 326.013 844.612 326.102 845.289H324.922C324.865 844.924 324.669 844.625 324.336 844.391C324.003 844.156 323.599 844.039 323.125 844.039C322.651 844.039 322.266 844.143 321.969 844.352C321.677 844.555 321.531 844.823 321.531 845.156C321.531 845.438 321.617 845.667 321.789 845.844C321.966 846.021 322.193 846.151 322.469 846.234C322.745 846.318 323.049 846.391 323.383 846.453C323.721 846.51 324.057 846.583 324.391 846.672C324.729 846.76 325.036 846.878 325.312 847.023C325.589 847.169 325.812 847.391 325.984 847.688C326.161 847.984 326.25 848.352 326.25 848.789C326.25 849.477 325.974 850.044 325.422 850.492C324.875 850.935 324.185 851.156 323.352 851.156ZM338.477 843.227H339.648V851H338.477V849.195C338.19 849.82 337.773 850.305 337.227 850.648C336.685 850.987 336.047 851.156 335.312 851.156C334.609 851.156 333.961 850.977 333.367 850.617C332.779 850.258 332.312 849.766 331.969 849.141C331.625 848.516 331.453 847.833 331.453 847.094C331.453 846.354 331.625 845.674 331.969 845.055C332.312 844.435 332.779 843.948 333.367 843.594C333.961 843.24 334.609 843.062 335.312 843.062C336.047 843.062 336.688 843.234 337.234 843.578C337.781 843.917 338.195 844.396 338.477 845.016V843.227ZM335.531 850.055C336.38 850.055 337.083 849.776 337.641 849.219C338.198 848.656 338.477 847.948 338.477 847.094C338.477 846.245 338.198 845.542 337.641 844.984C337.083 844.427 336.38 844.148 335.531 844.148C334.708 844.148 334.013 844.435 333.445 845.008C332.883 845.581 332.602 846.276 332.602 847.094C332.602 847.927 332.883 848.63 333.445 849.203C334.013 849.771 334.708 850.055 335.531 850.055ZM348.445 843.211H349.617V850.758C349.617 851.826 349.255 852.685 348.531 853.336C347.807 853.987 346.878 854.312 345.742 854.312C345.294 854.312 344.859 854.255 344.438 854.141C344.016 854.031 343.622 853.87 343.258 853.656C342.898 853.443 342.604 853.154 342.375 852.789C342.151 852.43 342.031 852.021 342.016 851.562H343.148C343.164 852.094 343.417 852.518 343.906 852.836C344.396 853.159 344.997 853.32 345.711 853.32C346.503 853.32 347.156 853.086 347.672 852.617C348.188 852.154 348.445 851.549 348.445 850.805V849.094C348.159 849.708 347.742 850.185 347.195 850.523C346.654 850.862 346.016 851.031 345.281 851.031C344.578 851.031 343.93 850.854 343.336 850.5C342.747 850.146 342.281 849.661 341.938 849.047C341.594 848.432 341.422 847.76 341.422 847.031C341.422 846.307 341.594 845.641 341.938 845.031C342.281 844.422 342.747 843.943 343.336 843.594C343.93 843.24 344.578 843.062 345.281 843.062C346.016 843.062 346.654 843.232 347.195 843.57C347.742 843.904 348.159 844.375 348.445 844.984V843.211ZM345.5 849.945C346.349 849.945 347.052 849.672 347.609 849.125C348.167 848.573 348.445 847.875 348.445 847.031C348.445 846.198 348.167 845.508 347.609 844.961C347.052 844.409 346.349 844.133 345.5 844.133C344.677 844.133 343.982 844.414 343.414 844.977C342.852 845.534 342.57 846.219 342.57 847.031C342.57 847.849 342.852 848.539 343.414 849.102C343.982 849.664 344.677 849.945 345.5 849.945ZM352.547 844.234C353.323 843.453 354.276 843.062 355.406 843.062C356.536 843.062 357.49 843.453 358.266 844.234C359.047 845.01 359.438 845.969 359.438 847.109C359.438 848.25 359.047 849.211 358.266 849.992C357.49 850.768 356.536 851.156 355.406 851.156C354.276 851.156 353.323 850.768 352.547 849.992C351.776 849.211 351.391 848.25 351.391 847.109C351.391 845.969 351.776 845.01 352.547 844.234ZM355.406 844.172C354.599 844.172 353.919 844.453 353.367 845.016C352.815 845.578 352.539 846.276 352.539 847.109C352.539 847.938 352.815 848.635 353.367 849.203C353.919 849.771 354.599 850.055 355.406 850.055C356.214 850.055 356.896 849.771 357.453 849.203C358.01 848.63 358.289 847.932 358.289 847.109C358.289 846.281 358.01 845.586 357.453 845.023C356.901 844.456 356.219 844.172 355.406 844.172Z"
            fill="#818283"
          />
          <path
            d="M209.833 845.833C209.833 849.053 207.219 851.667 203.999 851.667C200.779 851.667 198.166 849.053 198.166 845.833C198.166 842.613 200.779 840 203.999 840C207.219 840 209.833 842.613 209.833 845.833Z"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M204 842.332V845.665"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M202 838.332H206"
            stroke="#818283"
            stroke-width="1.33"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect x="718" y="807" width="52" height="52" rx="6" fill="#DFFBE2" />
          <path
            d="M734.633 840.023C733.767 840.792 732.663 841.176 731.322 841.176C729.981 841.176 728.874 840.792 728.002 840.023C727.136 839.255 726.703 838.282 726.703 837.104C726.703 836.264 726.964 835.508 727.484 834.838C728.005 834.161 728.682 833.702 729.516 833.461C728.858 833.24 728.318 832.846 727.895 832.279C727.471 831.713 727.26 831.094 727.26 830.424C727.26 829.382 727.641 828.526 728.402 827.855C729.171 827.178 730.144 826.84 731.322 826.84C732.501 826.84 733.471 827.178 734.232 827.855C735.001 828.526 735.385 829.382 735.385 830.424C735.385 831.094 735.17 831.713 734.74 832.279C734.317 832.846 733.777 833.24 733.119 833.461C733.952 833.702 734.63 834.161 735.15 834.838C735.678 835.508 735.941 836.264 735.941 837.104C735.941 838.282 735.505 839.255 734.633 840.023ZM729.447 832.123C729.936 832.546 730.561 832.758 731.322 832.758C732.084 832.758 732.706 832.546 733.188 832.123C733.676 831.7 733.92 831.153 733.92 830.482C733.92 829.818 733.676 829.271 733.188 828.842C732.706 828.412 732.084 828.197 731.322 828.197C730.561 828.197 729.936 828.412 729.447 828.842C728.965 829.271 728.725 829.818 728.725 830.482C728.725 831.153 728.965 831.7 729.447 832.123ZM729.066 838.988C729.665 839.516 730.417 839.779 731.322 839.779C732.227 839.779 732.976 839.516 733.568 838.988C734.161 838.461 734.457 837.797 734.457 836.996C734.457 836.202 734.161 835.548 733.568 835.033C732.976 834.519 732.227 834.262 731.322 834.262C730.411 834.262 729.659 834.522 729.066 835.043C728.474 835.557 728.178 836.208 728.178 836.996C728.178 837.797 728.474 838.461 729.066 838.988ZM745.277 840.023C744.411 840.792 743.308 841.176 741.967 841.176C740.626 841.176 739.519 840.792 738.646 840.023C737.781 839.255 737.348 838.282 737.348 837.104C737.348 836.264 737.608 835.508 738.129 834.838C738.65 834.161 739.327 833.702 740.16 833.461C739.503 833.24 738.962 832.846 738.539 832.279C738.116 831.713 737.904 831.094 737.904 830.424C737.904 829.382 738.285 828.526 739.047 827.855C739.815 827.178 740.788 826.84 741.967 826.84C743.145 826.84 744.115 827.178 744.877 827.855C745.645 828.526 746.029 829.382 746.029 830.424C746.029 831.094 745.814 831.713 745.385 832.279C744.962 832.846 744.421 833.24 743.764 833.461C744.597 833.702 745.274 834.161 745.795 834.838C746.322 835.508 746.586 836.264 746.586 837.104C746.586 838.282 746.15 839.255 745.277 840.023ZM740.092 832.123C740.58 832.546 741.205 832.758 741.967 832.758C742.729 832.758 743.35 832.546 743.832 832.123C744.32 831.7 744.564 831.153 744.564 830.482C744.564 829.818 744.32 829.271 743.832 828.842C743.35 828.412 742.729 828.197 741.967 828.197C741.205 828.197 740.58 828.412 740.092 828.842C739.61 829.271 739.369 829.818 739.369 830.482C739.369 831.153 739.61 831.7 740.092 832.123ZM739.711 838.988C740.31 839.516 741.062 839.779 741.967 839.779C742.872 839.779 743.62 839.516 744.213 838.988C744.805 838.461 745.102 837.797 745.102 836.996C745.102 836.202 744.805 835.548 744.213 835.033C743.62 834.519 742.872 834.262 741.967 834.262C741.055 834.262 740.303 834.522 739.711 835.043C739.118 835.557 738.822 836.208 738.822 836.996C738.822 837.797 739.118 838.461 739.711 838.988ZM752.865 827.611C753.367 828.145 753.617 828.822 753.617 829.643C753.617 830.463 753.367 831.146 752.865 831.693C752.364 832.234 751.729 832.504 750.961 832.504C750.18 832.504 749.535 832.234 749.027 831.693C748.526 831.146 748.275 830.463 748.275 829.643C748.275 828.822 748.526 828.145 749.027 827.611C749.535 827.071 750.18 826.801 750.961 826.801C751.729 826.801 752.364 827.071 752.865 827.611ZM758.178 826.996H759.398L750.102 841H748.881L758.178 826.996ZM752.133 830.98C752.432 830.635 752.582 830.189 752.582 829.643C752.582 829.096 752.432 828.65 752.133 828.305C751.833 827.953 751.443 827.777 750.961 827.777C750.466 827.777 750.069 827.953 749.77 828.305C749.47 828.65 749.32 829.096 749.32 829.643C749.32 830.189 749.47 830.635 749.77 830.98C750.069 831.326 750.466 831.498 750.961 831.498C751.443 831.498 751.833 831.326 752.133 830.98ZM759.975 838.344C759.975 839.171 759.724 839.854 759.223 840.395C758.728 840.928 758.093 841.195 757.318 841.195C756.537 841.195 755.896 840.928 755.395 840.395C754.893 839.861 754.643 839.177 754.643 838.344C754.643 837.523 754.893 836.846 755.395 836.312C755.896 835.772 756.537 835.502 757.318 835.502C758.087 835.502 758.721 835.772 759.223 836.312C759.724 836.846 759.975 837.523 759.975 838.344ZM758.939 838.344C758.939 837.797 758.79 837.351 758.49 837.006C758.191 836.654 757.8 836.479 757.318 836.479C756.824 836.479 756.426 836.654 756.127 837.006C755.827 837.351 755.678 837.797 755.678 838.344C755.678 838.897 755.827 839.35 756.127 839.701C756.426 840.046 756.824 840.219 757.318 840.219C757.807 840.219 758.197 840.046 758.49 839.701C758.79 839.35 758.939 838.897 758.939 838.344Z"
            fill="#00A25E"
          />
          <path
            d="M107.062 851V839.797H110.945C111.82 839.797 112.568 840.073 113.188 840.625C113.807 841.172 114.117 841.831 114.117 842.602C114.117 843.201 113.935 843.737 113.57 844.211C113.206 844.685 112.753 844.974 112.211 845.078C112.914 845.151 113.505 845.458 113.984 846C114.469 846.542 114.711 847.18 114.711 847.914C114.711 848.773 114.391 849.503 113.75 850.102C113.115 850.701 112.341 851 111.43 851H107.062ZM108.258 844.68H110.914C111.466 844.68 111.935 844.495 112.32 844.125C112.706 843.75 112.898 843.294 112.898 842.758C112.898 842.258 112.703 841.833 112.312 841.484C111.927 841.13 111.461 840.953 110.914 840.953H108.258V844.68ZM108.258 849.852H111.367C111.971 849.852 112.474 849.651 112.875 849.25C113.276 848.849 113.477 848.354 113.477 847.766C113.477 847.182 113.273 846.69 112.867 846.289C112.466 845.888 111.971 845.688 111.383 845.688H108.258V849.852ZM122.93 843.227H124.102V851H122.93V849.195C122.643 849.82 122.227 850.305 121.68 850.648C121.138 850.987 120.5 851.156 119.766 851.156C119.062 851.156 118.414 850.977 117.82 850.617C117.232 850.258 116.766 849.766 116.422 849.141C116.078 848.516 115.906 847.833 115.906 847.094C115.906 846.354 116.078 845.674 116.422 845.055C116.766 844.435 117.232 843.948 117.82 843.594C118.414 843.24 119.062 843.062 119.766 843.062C120.5 843.062 121.141 843.234 121.688 843.578C122.234 843.917 122.648 844.396 122.93 845.016V843.227ZM119.984 850.055C120.833 850.055 121.536 849.776 122.094 849.219C122.651 848.656 122.93 847.948 122.93 847.094C122.93 846.245 122.651 845.542 122.094 844.984C121.536 844.427 120.833 844.148 119.984 844.148C119.161 844.148 118.466 844.435 117.898 845.008C117.336 845.581 117.055 846.276 117.055 847.094C117.055 847.927 117.336 848.63 117.898 849.203C118.466 849.771 119.161 850.055 119.984 850.055ZM130.164 843.062C131.169 843.062 131.966 843.375 132.555 844C133.148 844.62 133.445 845.461 133.445 846.523V851H132.273V846.633C132.273 845.888 132.057 845.292 131.625 844.844C131.198 844.396 130.63 844.172 129.922 844.172C129.193 844.172 128.607 844.398 128.164 844.852C127.727 845.299 127.508 845.893 127.508 846.633V851H126.336V843.227H127.508V844.742C127.758 844.211 128.112 843.799 128.57 843.508C129.029 843.211 129.56 843.062 130.164 843.062ZM142.242 843.211H143.414V850.758C143.414 851.826 143.052 852.685 142.328 853.336C141.604 853.987 140.674 854.312 139.539 854.312C139.091 854.312 138.656 854.255 138.234 854.141C137.812 854.031 137.419 853.87 137.055 853.656C136.695 853.443 136.401 853.154 136.172 852.789C135.948 852.43 135.828 852.021 135.812 851.562H136.945C136.961 852.094 137.214 852.518 137.703 852.836C138.193 853.159 138.794 853.32 139.508 853.32C140.299 853.32 140.953 853.086 141.469 852.617C141.984 852.154 142.242 851.549 142.242 850.805V849.094C141.956 849.708 141.539 850.185 140.992 850.523C140.451 850.862 139.812 851.031 139.078 851.031C138.375 851.031 137.727 850.854 137.133 850.5C136.544 850.146 136.078 849.661 135.734 849.047C135.391 848.432 135.219 847.76 135.219 847.031C135.219 846.307 135.391 845.641 135.734 845.031C136.078 844.422 136.544 843.943 137.133 843.594C137.727 843.24 138.375 843.062 139.078 843.062C139.812 843.062 140.451 843.232 140.992 843.57C141.539 843.904 141.956 844.375 142.242 844.984V843.211ZM139.297 849.945C140.146 849.945 140.849 849.672 141.406 849.125C141.964 848.573 142.242 847.875 142.242 847.031C142.242 846.198 141.964 845.508 141.406 844.961C140.849 844.409 140.146 844.133 139.297 844.133C138.474 844.133 137.779 844.414 137.211 844.977C136.648 845.534 136.367 846.219 136.367 847.031C136.367 847.849 136.648 848.539 137.211 849.102C137.779 849.664 138.474 849.945 139.297 849.945ZM152.211 843.227H153.383V851H152.211V849.195C151.924 849.82 151.508 850.305 150.961 850.648C150.419 850.987 149.781 851.156 149.047 851.156C148.344 851.156 147.695 850.977 147.102 850.617C146.513 850.258 146.047 849.766 145.703 849.141C145.359 848.516 145.188 847.833 145.188 847.094C145.188 846.354 145.359 845.674 145.703 845.055C146.047 844.435 146.513 843.948 147.102 843.594C147.695 843.24 148.344 843.062 149.047 843.062C149.781 843.062 150.422 843.234 150.969 843.578C151.516 843.917 151.93 844.396 152.211 845.016V843.227ZM149.266 850.055C150.115 850.055 150.818 849.776 151.375 849.219C151.932 848.656 152.211 847.948 152.211 847.094C152.211 846.245 151.932 845.542 151.375 844.984C150.818 844.427 150.115 844.148 149.266 844.148C148.443 844.148 147.747 844.435 147.18 845.008C146.617 845.581 146.336 846.276 146.336 847.094C146.336 847.927 146.617 848.63 147.18 849.203C147.747 849.771 148.443 850.055 149.266 850.055ZM156.789 839.797V851H155.617V839.797H156.789ZM159.484 844.234C160.26 843.453 161.214 843.062 162.344 843.062C163.474 843.062 164.427 843.453 165.203 844.234C165.984 845.01 166.375 845.969 166.375 847.109C166.375 848.25 165.984 849.211 165.203 849.992C164.427 850.768 163.474 851.156 162.344 851.156C161.214 851.156 160.26 850.768 159.484 849.992C158.714 849.211 158.328 848.25 158.328 847.109C158.328 845.969 158.714 845.01 159.484 844.234ZM162.344 844.172C161.536 844.172 160.857 844.453 160.305 845.016C159.753 845.578 159.477 846.276 159.477 847.109C159.477 847.938 159.753 848.635 160.305 849.203C160.857 849.771 161.536 850.055 162.344 850.055C163.151 850.055 163.833 849.771 164.391 849.203C164.948 848.63 165.227 847.932 165.227 847.109C165.227 846.281 164.948 845.586 164.391 845.023C163.839 844.456 163.156 844.172 162.344 844.172ZM171.508 843.062C171.711 843.062 171.953 843.094 172.234 843.156V844.25C171.979 844.161 171.727 844.117 171.477 844.117C170.867 844.117 170.354 844.333 169.938 844.766C169.526 845.193 169.32 845.734 169.32 846.391V851H168.148V843.227H169.32V844.469C169.549 844.031 169.854 843.688 170.234 843.438C170.615 843.188 171.039 843.062 171.508 843.062ZM180.32 846.875C180.32 847.109 180.315 847.258 180.305 847.32H173.789C173.846 848.154 174.133 848.826 174.648 849.336C175.164 849.846 175.828 850.102 176.641 850.102C177.266 850.102 177.802 849.961 178.25 849.68C178.703 849.393 178.982 849.013 179.086 848.539H180.258C180.107 849.326 179.695 849.958 179.023 850.438C178.352 850.917 177.547 851.156 176.609 851.156C175.479 851.156 174.534 850.766 173.773 849.984C173.018 849.203 172.641 848.229 172.641 847.062C172.641 845.943 173.023 844.997 173.789 844.227C174.555 843.451 175.49 843.062 176.594 843.062C177.286 843.062 177.917 843.227 178.484 843.555C179.052 843.878 179.5 844.331 179.828 844.914C180.156 845.497 180.32 846.151 180.32 846.875ZM173.844 846.328H179.07C179.013 845.682 178.75 845.154 178.281 844.742C177.818 844.326 177.24 844.117 176.547 844.117C175.859 844.117 175.271 844.318 174.781 844.719C174.292 845.12 173.979 845.656 173.844 846.328Z"
            fill="#4B5563"
          />
          <path
            d="M99.3327 843.665C99.3327 847.665 93.9993 851.665 93.9993 851.665C93.9993 851.665 88.666 847.665 88.666 843.665C88.666 842.251 89.2279 840.894 90.2281 839.894C91.2283 838.894 92.5849 838.332 93.9993 838.332C95.4138 838.332 96.7704 838.894 97.7706 839.894C98.7708 840.894 99.3327 842.251 99.3327 843.665Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M94 845.668C95.1046 845.668 96 844.773 96 843.668C96 842.563 95.1046 841.668 94 841.668C92.8954 841.668 92 842.563 92 843.668C92 844.773 92.8954 845.668 94 845.668Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M87.2656 893.797H93.5234V894.953H88.4609V898.438H92.9766V899.594H88.4609V903.852H93.5234V905H87.2656V893.797ZM101.992 905H100.602L98.375 901.945L96.1484 905H94.7734L97.6875 900.984L94.9531 897.227H96.3438L98.3906 900.039L100.422 897.227H101.797L99.0781 900.984L101.992 905ZM107.797 897.062C108.5 897.062 109.146 897.242 109.734 897.602C110.328 897.956 110.797 898.445 111.141 899.07C111.484 899.69 111.656 900.37 111.656 901.109C111.656 901.849 111.484 902.531 111.141 903.156C110.797 903.776 110.328 904.266 109.734 904.625C109.146 904.979 108.5 905.156 107.797 905.156C107.062 905.156 106.422 904.987 105.875 904.648C105.333 904.305 104.919 903.82 104.633 903.195V907.93H103.461V897.227H104.633V899.016C104.914 898.396 105.328 897.917 105.875 897.578C106.422 897.234 107.062 897.062 107.797 897.062ZM107.578 904.055C108.401 904.055 109.094 903.771 109.656 903.203C110.219 902.635 110.5 901.938 110.5 901.109C110.5 900.281 110.219 899.581 109.656 899.008C109.094 898.435 108.401 898.148 107.578 898.148C106.729 898.148 106.026 898.43 105.469 898.992C104.911 899.549 104.633 900.255 104.633 901.109C104.633 901.958 104.911 902.661 105.469 903.219C106.026 903.776 106.729 904.055 107.578 904.055ZM120.398 900.875C120.398 901.109 120.393 901.258 120.383 901.32H113.867C113.924 902.154 114.211 902.826 114.727 903.336C115.242 903.846 115.906 904.102 116.719 904.102C117.344 904.102 117.88 903.961 118.328 903.68C118.781 903.393 119.06 903.013 119.164 902.539H120.336C120.185 903.326 119.773 903.958 119.102 904.438C118.43 904.917 117.625 905.156 116.688 905.156C115.557 905.156 114.612 904.766 113.852 903.984C113.096 903.203 112.719 902.229 112.719 901.062C112.719 899.943 113.102 898.997 113.867 898.227C114.633 897.451 115.568 897.062 116.672 897.062C117.365 897.062 117.995 897.227 118.562 897.555C119.13 897.878 119.578 898.331 119.906 898.914C120.234 899.497 120.398 900.151 120.398 900.875ZM113.922 900.328H119.148C119.091 899.682 118.828 899.154 118.359 898.742C117.896 898.326 117.318 898.117 116.625 898.117C115.938 898.117 115.349 898.318 114.859 898.719C114.37 899.12 114.057 899.656 113.922 900.328ZM125.555 897.062C125.758 897.062 126 897.094 126.281 897.156V898.25C126.026 898.161 125.773 898.117 125.523 898.117C124.914 898.117 124.401 898.333 123.984 898.766C123.573 899.193 123.367 899.734 123.367 900.391V905H122.195V897.227H123.367V898.469C123.596 898.031 123.901 897.688 124.281 897.438C124.661 897.188 125.086 897.062 125.555 897.062ZM128.383 893.828C128.607 893.828 128.805 893.911 128.977 894.078C129.148 894.245 129.234 894.44 129.234 894.664C129.234 894.893 129.148 895.094 128.977 895.266C128.805 895.432 128.607 895.516 128.383 895.516C128.154 895.516 127.958 895.432 127.797 895.266C127.635 895.099 127.555 894.898 127.555 894.664C127.555 894.44 127.635 894.245 127.797 894.078C127.958 893.911 128.154 893.828 128.383 893.828ZM127.789 897.227H128.961V905H127.789V897.227ZM138.414 900.875C138.414 901.109 138.409 901.258 138.398 901.32H131.883C131.94 902.154 132.227 902.826 132.742 903.336C133.258 903.846 133.922 904.102 134.734 904.102C135.359 904.102 135.896 903.961 136.344 903.68C136.797 903.393 137.076 903.013 137.18 902.539H138.352C138.201 903.326 137.789 903.958 137.117 904.438C136.445 904.917 135.641 905.156 134.703 905.156C133.573 905.156 132.628 904.766 131.867 903.984C131.112 903.203 130.734 902.229 130.734 901.062C130.734 899.943 131.117 898.997 131.883 898.227C132.648 897.451 133.583 897.062 134.688 897.062C135.38 897.062 136.01 897.227 136.578 897.555C137.146 897.878 137.594 898.331 137.922 898.914C138.25 899.497 138.414 900.151 138.414 900.875ZM131.938 900.328H137.164C137.107 899.682 136.844 899.154 136.375 898.742C135.911 898.326 135.333 898.117 134.641 898.117C133.953 898.117 133.365 898.318 132.875 898.719C132.385 899.12 132.073 899.656 131.938 900.328ZM144.039 897.062C145.044 897.062 145.841 897.375 146.43 898C147.023 898.62 147.32 899.461 147.32 900.523V905H146.148V900.633C146.148 899.888 145.932 899.292 145.5 898.844C145.073 898.396 144.505 898.172 143.797 898.172C143.068 898.172 142.482 898.398 142.039 898.852C141.602 899.299 141.383 899.893 141.383 900.633V905H140.211V897.227H141.383V898.742C141.633 898.211 141.987 897.799 142.445 897.508C142.904 897.211 143.435 897.062 144.039 897.062ZM153.109 905.156C151.979 905.156 151.026 904.768 150.25 903.992C149.479 903.211 149.094 902.25 149.094 901.109C149.094 899.969 149.479 899.01 150.25 898.234C151.026 897.453 151.979 897.062 153.109 897.062C153.99 897.062 154.773 897.32 155.461 897.836C156.148 898.346 156.565 898.99 156.711 899.766H155.523C155.393 899.302 155.102 898.922 154.648 898.625C154.195 898.323 153.682 898.172 153.109 898.172C152.302 898.172 151.622 898.453 151.07 899.016C150.518 899.578 150.242 900.276 150.242 901.109C150.242 901.938 150.518 902.635 151.07 903.203C151.622 903.771 152.302 904.055 153.109 904.055C153.688 904.055 154.206 903.898 154.664 903.586C155.128 903.273 155.414 902.87 155.523 902.375H156.711C156.591 903.188 156.185 903.854 155.492 904.375C154.805 904.896 154.01 905.156 153.109 905.156ZM165.555 900.875C165.555 901.109 165.549 901.258 165.539 901.32H159.023C159.081 902.154 159.367 902.826 159.883 903.336C160.398 903.846 161.062 904.102 161.875 904.102C162.5 904.102 163.036 903.961 163.484 903.68C163.938 903.393 164.216 903.013 164.32 902.539H165.492C165.341 903.326 164.93 903.958 164.258 904.438C163.586 904.917 162.781 905.156 161.844 905.156C160.714 905.156 159.768 904.766 159.008 903.984C158.253 903.203 157.875 902.229 157.875 901.062C157.875 899.943 158.258 898.997 159.023 898.227C159.789 897.451 160.724 897.062 161.828 897.062C162.521 897.062 163.151 897.227 163.719 897.555C164.286 897.878 164.734 898.331 165.062 898.914C165.391 899.497 165.555 900.151 165.555 900.875ZM159.078 900.328H164.305C164.247 899.682 163.984 899.154 163.516 898.742C163.052 898.326 162.474 898.117 161.781 898.117C161.094 898.117 160.505 898.318 160.016 898.719C159.526 899.12 159.214 899.656 159.078 900.328Z"
            fill="#A8A8A8"
          />
          <path
            d="M95.7188 925.383V926.484H94.2031V929H93V926.484H87.3203V925.609L91.4453 917.797H92.8047L88.8047 925.383H93V921.547H94.2031V925.383H95.7188ZM100.305 917.797H101.773L105.039 922.758L108.258 917.797H109.68L105.633 923.977V929H104.414V923.977L100.305 917.797ZM116.273 924.875C116.273 925.109 116.268 925.258 116.258 925.32H109.742C109.799 926.154 110.086 926.826 110.602 927.336C111.117 927.846 111.781 928.102 112.594 928.102C113.219 928.102 113.755 927.961 114.203 927.68C114.656 927.393 114.935 927.013 115.039 926.539H116.211C116.06 927.326 115.648 927.958 114.977 928.438C114.305 928.917 113.5 929.156 112.562 929.156C111.432 929.156 110.487 928.766 109.727 927.984C108.971 927.203 108.594 926.229 108.594 925.062C108.594 923.943 108.977 922.997 109.742 922.227C110.508 921.451 111.443 921.062 112.547 921.062C113.24 921.062 113.87 921.227 114.438 921.555C115.005 921.878 115.453 922.331 115.781 922.914C116.109 923.497 116.273 924.151 116.273 924.875ZM109.797 924.328H115.023C114.966 923.682 114.703 923.154 114.234 922.742C113.771 922.326 113.193 922.117 112.5 922.117C111.812 922.117 111.224 922.318 110.734 922.719C110.245 923.12 109.932 923.656 109.797 924.328ZM124.383 921.227H125.555V929H124.383V927.195C124.096 927.82 123.68 928.305 123.133 928.648C122.591 928.987 121.953 929.156 121.219 929.156C120.516 929.156 119.867 928.977 119.273 928.617C118.685 928.258 118.219 927.766 117.875 927.141C117.531 926.516 117.359 925.833 117.359 925.094C117.359 924.354 117.531 923.674 117.875 923.055C118.219 922.435 118.685 921.948 119.273 921.594C119.867 921.24 120.516 921.062 121.219 921.062C121.953 921.062 122.594 921.234 123.141 921.578C123.688 921.917 124.102 922.396 124.383 923.016V921.227ZM121.438 928.055C122.286 928.055 122.99 927.776 123.547 927.219C124.104 926.656 124.383 925.948 124.383 925.094C124.383 924.245 124.104 923.542 123.547 922.984C122.99 922.427 122.286 922.148 121.438 922.148C120.615 922.148 119.919 922.435 119.352 923.008C118.789 923.581 118.508 924.276 118.508 925.094C118.508 925.927 118.789 926.63 119.352 927.203C119.919 927.771 120.615 928.055 121.438 928.055ZM131.148 921.062C131.352 921.062 131.594 921.094 131.875 921.156V922.25C131.62 922.161 131.367 922.117 131.117 922.117C130.508 922.117 129.995 922.333 129.578 922.766C129.167 923.193 128.961 923.734 128.961 924.391V929H127.789V921.227H128.961V922.469C129.19 922.031 129.495 921.688 129.875 921.438C130.255 921.188 130.68 921.062 131.148 921.062ZM135.727 929.156C134.852 929.156 134.128 928.935 133.555 928.492C132.982 928.049 132.656 927.451 132.578 926.695H133.695C133.747 927.138 133.956 927.492 134.32 927.758C134.685 928.018 135.138 928.148 135.68 928.148C136.221 928.148 136.656 928.026 136.984 927.781C137.318 927.531 137.484 927.211 137.484 926.82C137.484 926.56 137.417 926.341 137.281 926.164C137.146 925.982 136.966 925.846 136.742 925.758C136.523 925.669 136.273 925.589 135.992 925.516C135.711 925.443 135.422 925.383 135.125 925.336C134.828 925.289 134.539 925.216 134.258 925.117C133.977 925.018 133.724 924.901 133.5 924.766C133.281 924.625 133.104 924.427 132.969 924.172C132.833 923.911 132.766 923.602 132.766 923.242C132.766 922.602 133.018 922.078 133.523 921.672C134.029 921.266 134.698 921.062 135.531 921.062C136.297 921.062 136.956 921.266 137.508 921.672C138.065 922.073 138.388 922.612 138.477 923.289H137.297C137.24 922.924 137.044 922.625 136.711 922.391C136.378 922.156 135.974 922.039 135.5 922.039C135.026 922.039 134.641 922.143 134.344 922.352C134.052 922.555 133.906 922.823 133.906 923.156C133.906 923.438 133.992 923.667 134.164 923.844C134.341 924.021 134.568 924.151 134.844 924.234C135.12 924.318 135.424 924.391 135.758 924.453C136.096 924.51 136.432 924.583 136.766 924.672C137.104 924.76 137.411 924.878 137.688 925.023C137.964 925.169 138.188 925.391 138.359 925.688C138.536 925.984 138.625 926.352 138.625 926.789C138.625 927.477 138.349 928.044 137.797 928.492C137.25 928.935 136.56 929.156 135.727 929.156Z"
            fill="#4B5563"
          />
          <path
            d="M270.547 917.797V929H269.328V919.461L266.75 921.672V920.188L269.664 917.797H270.547ZM275.859 929.156C274.88 929.156 274.042 928.885 273.344 928.344C272.646 927.802 272.253 927.089 272.164 926.203H273.367C273.482 926.734 273.766 927.167 274.219 927.5C274.677 927.828 275.224 927.992 275.859 927.992C276.568 927.992 277.167 927.755 277.656 927.281C278.146 926.802 278.391 926.219 278.391 925.531C278.391 924.812 278.146 924.206 277.656 923.711C277.167 923.216 276.568 922.969 275.859 922.969C275.427 922.969 275.023 923.039 274.648 923.18C274.279 923.315 273.984 923.51 273.766 923.766H272.727L273.25 917.797H278.93V918.938H274.328L273.953 922.633C274.182 922.419 274.482 922.253 274.852 922.133C275.227 922.008 275.612 921.945 276.008 921.945C277.039 921.945 277.898 922.284 278.586 922.961C279.273 923.633 279.617 924.495 279.617 925.547C279.617 926.552 279.253 927.406 278.523 928.109C277.794 928.807 276.906 929.156 275.859 929.156ZM288.812 917.797C289.578 917.797 290.299 917.938 290.977 918.219C291.659 918.495 292.245 918.878 292.734 919.367C293.224 919.852 293.609 920.44 293.891 921.133C294.177 921.82 294.32 922.56 294.32 923.352C294.32 924.143 294.177 924.891 293.891 925.594C293.609 926.292 293.224 926.891 292.734 927.391C292.245 927.885 291.659 928.279 290.977 928.57C290.299 928.857 289.578 929 288.812 929H285.344V917.797H288.812ZM288.875 927.852C290.073 927.852 291.07 927.424 291.867 926.57C292.669 925.711 293.07 924.638 293.07 923.352C293.07 922.076 292.672 921.023 291.875 920.195C291.083 919.367 290.083 918.953 288.875 918.953H286.539V927.852H288.875ZM302.555 921.227H303.727V929H302.555V927.195C302.268 927.82 301.852 928.305 301.305 928.648C300.763 928.987 300.125 929.156 299.391 929.156C298.688 929.156 298.039 928.977 297.445 928.617C296.857 928.258 296.391 927.766 296.047 927.141C295.703 926.516 295.531 925.833 295.531 925.094C295.531 924.354 295.703 923.674 296.047 923.055C296.391 922.435 296.857 921.948 297.445 921.594C298.039 921.24 298.688 921.062 299.391 921.062C300.125 921.062 300.766 921.234 301.312 921.578C301.859 921.917 302.273 922.396 302.555 923.016V921.227ZM299.609 928.055C300.458 928.055 301.161 927.776 301.719 927.219C302.276 926.656 302.555 925.948 302.555 925.094C302.555 924.245 302.276 923.542 301.719 922.984C301.161 922.427 300.458 922.148 299.609 922.148C298.786 922.148 298.091 922.435 297.523 923.008C296.961 923.581 296.68 924.276 296.68 925.094C296.68 925.927 296.961 926.63 297.523 927.203C298.091 927.771 298.786 928.055 299.609 928.055ZM311.484 921.227H312.734L308.234 931.945H306.984L308.328 928.859L305.117 921.227H306.383L308.922 927.492L311.484 921.227ZM316.57 929.156C315.695 929.156 314.971 928.935 314.398 928.492C313.826 928.049 313.5 927.451 313.422 926.695H314.539C314.591 927.138 314.799 927.492 315.164 927.758C315.529 928.018 315.982 928.148 316.523 928.148C317.065 928.148 317.5 928.026 317.828 927.781C318.161 927.531 318.328 927.211 318.328 926.82C318.328 926.56 318.26 926.341 318.125 926.164C317.99 925.982 317.81 925.846 317.586 925.758C317.367 925.669 317.117 925.589 316.836 925.516C316.555 925.443 316.266 925.383 315.969 925.336C315.672 925.289 315.383 925.216 315.102 925.117C314.82 925.018 314.568 924.901 314.344 924.766C314.125 924.625 313.948 924.427 313.812 924.172C313.677 923.911 313.609 923.602 313.609 923.242C313.609 922.602 313.862 922.078 314.367 921.672C314.872 921.266 315.542 921.062 316.375 921.062C317.141 921.062 317.799 921.266 318.352 921.672C318.909 922.073 319.232 922.612 319.32 923.289H318.141C318.083 922.924 317.888 922.625 317.555 922.391C317.221 922.156 316.818 922.039 316.344 922.039C315.87 922.039 315.484 922.143 315.188 922.352C314.896 922.555 314.75 922.823 314.75 923.156C314.75 923.438 314.836 923.667 315.008 923.844C315.185 924.021 315.411 924.151 315.688 924.234C315.964 924.318 316.268 924.391 316.602 924.453C316.94 924.51 317.276 924.583 317.609 924.672C317.948 924.76 318.255 924.878 318.531 925.023C318.807 925.169 319.031 925.391 319.203 925.688C319.38 925.984 319.469 926.352 319.469 926.789C319.469 927.477 319.193 928.044 318.641 928.492C318.094 928.935 317.404 929.156 316.57 929.156Z"
            fill="#4B5563"
          />
          <path
            d="M266.266 893.797H267.398L273.672 902.789V893.797H274.891V905H273.766L267.461 896.023V905H266.266V893.797ZM277.969 898.234C278.745 897.453 279.698 897.062 280.828 897.062C281.958 897.062 282.911 897.453 283.688 898.234C284.469 899.01 284.859 899.969 284.859 901.109C284.859 902.25 284.469 903.211 283.688 903.992C282.911 904.768 281.958 905.156 280.828 905.156C279.698 905.156 278.745 904.768 277.969 903.992C277.198 903.211 276.812 902.25 276.812 901.109C276.812 899.969 277.198 899.01 277.969 898.234ZM280.828 898.172C280.021 898.172 279.341 898.453 278.789 899.016C278.237 899.578 277.961 900.276 277.961 901.109C277.961 901.938 278.237 902.635 278.789 903.203C279.341 903.771 280.021 904.055 280.828 904.055C281.635 904.055 282.318 903.771 282.875 903.203C283.432 902.63 283.711 901.932 283.711 901.109C283.711 900.281 283.432 899.586 282.875 899.023C282.323 898.456 281.641 898.172 280.828 898.172ZM290.336 898.312H288.164V902.375C288.164 903.453 288.708 903.992 289.797 903.992C290.016 903.992 290.195 903.971 290.336 903.93V905C290.102 905.052 289.852 905.078 289.586 905.078C288.773 905.078 288.138 904.854 287.68 904.406C287.221 903.953 286.992 903.281 286.992 902.391V898.312H285.461V897.227H286.992V895.078H288.164V897.227H290.336V898.312ZM292.555 893.828C292.779 893.828 292.977 893.911 293.148 894.078C293.32 894.245 293.406 894.44 293.406 894.664C293.406 894.893 293.32 895.094 293.148 895.266C292.977 895.432 292.779 895.516 292.555 895.516C292.326 895.516 292.13 895.432 291.969 895.266C291.807 895.099 291.727 894.898 291.727 894.664C291.727 894.44 291.807 894.245 291.969 894.078C292.13 893.911 292.326 893.828 292.555 893.828ZM291.961 897.227H293.133V905H291.961V897.227ZM298.922 905.156C297.792 905.156 296.839 904.768 296.062 903.992C295.292 903.211 294.906 902.25 294.906 901.109C294.906 899.969 295.292 899.01 296.062 898.234C296.839 897.453 297.792 897.062 298.922 897.062C299.802 897.062 300.586 897.32 301.273 897.836C301.961 898.346 302.378 898.99 302.523 899.766H301.336C301.206 899.302 300.914 898.922 300.461 898.625C300.008 898.323 299.495 898.172 298.922 898.172C298.115 898.172 297.435 898.453 296.883 899.016C296.331 899.578 296.055 900.276 296.055 901.109C296.055 901.938 296.331 902.635 296.883 903.203C297.435 903.771 298.115 904.055 298.922 904.055C299.5 904.055 300.018 903.898 300.477 903.586C300.94 903.273 301.227 902.87 301.336 902.375H302.523C302.404 903.188 301.997 903.854 301.305 904.375C300.617 904.896 299.823 905.156 298.922 905.156ZM311.367 900.875C311.367 901.109 311.362 901.258 311.352 901.32H304.836C304.893 902.154 305.18 902.826 305.695 903.336C306.211 903.846 306.875 904.102 307.688 904.102C308.312 904.102 308.849 903.961 309.297 903.68C309.75 903.393 310.029 903.013 310.133 902.539H311.305C311.154 903.326 310.742 903.958 310.07 904.438C309.398 904.917 308.594 905.156 307.656 905.156C306.526 905.156 305.581 904.766 304.82 903.984C304.065 903.203 303.688 902.229 303.688 901.062C303.688 899.943 304.07 898.997 304.836 898.227C305.602 897.451 306.536 897.062 307.641 897.062C308.333 897.062 308.964 897.227 309.531 897.555C310.099 897.878 310.547 898.331 310.875 898.914C311.203 899.497 311.367 900.151 311.367 900.875ZM304.891 900.328H310.117C310.06 899.682 309.797 899.154 309.328 898.742C308.865 898.326 308.286 898.117 307.594 898.117C306.906 898.117 306.318 898.318 305.828 898.719C305.339 899.12 305.026 899.656 304.891 900.328ZM321.477 893.797C322.419 893.797 323.206 894.107 323.836 894.727C324.471 895.341 324.789 896.104 324.789 897.016C324.789 897.938 324.471 898.708 323.836 899.328C323.206 899.943 322.419 900.25 321.477 900.25H318.367V905H317.172V893.797H321.477ZM321.477 899.094C322.07 899.094 322.568 898.896 322.969 898.5C323.37 898.099 323.57 897.604 323.57 897.016C323.57 896.432 323.37 895.943 322.969 895.547C322.568 895.151 322.07 894.953 321.477 894.953H318.367V899.094H321.477ZM333.055 900.875C333.055 901.109 333.049 901.258 333.039 901.32H326.523C326.581 902.154 326.867 902.826 327.383 903.336C327.898 903.846 328.562 904.102 329.375 904.102C330 904.102 330.536 903.961 330.984 903.68C331.438 903.393 331.716 903.013 331.82 902.539H332.992C332.841 903.326 332.43 903.958 331.758 904.438C331.086 904.917 330.281 905.156 329.344 905.156C328.214 905.156 327.268 904.766 326.508 903.984C325.753 903.203 325.375 902.229 325.375 901.062C325.375 899.943 325.758 898.997 326.523 898.227C327.289 897.451 328.224 897.062 329.328 897.062C330.021 897.062 330.651 897.227 331.219 897.555C331.786 897.878 332.234 898.331 332.562 898.914C332.891 899.497 333.055 900.151 333.055 900.875ZM326.578 900.328H331.805C331.747 899.682 331.484 899.154 331.016 898.742C330.552 898.326 329.974 898.117 329.281 898.117C328.594 898.117 328.005 898.318 327.516 898.719C327.026 899.12 326.714 899.656 326.578 900.328ZM338.211 897.062C338.414 897.062 338.656 897.094 338.938 897.156V898.25C338.682 898.161 338.43 898.117 338.18 898.117C337.57 898.117 337.057 898.333 336.641 898.766C336.229 899.193 336.023 899.734 336.023 900.391V905H334.852V897.227H336.023V898.469C336.253 898.031 336.557 897.688 336.938 897.438C337.318 897.188 337.742 897.062 338.211 897.062ZM341.039 893.828C341.263 893.828 341.461 893.911 341.633 894.078C341.805 894.245 341.891 894.44 341.891 894.664C341.891 894.893 341.805 895.094 341.633 895.266C341.461 895.432 341.263 895.516 341.039 895.516C340.81 895.516 340.615 895.432 340.453 895.266C340.292 895.099 340.211 894.898 340.211 894.664C340.211 894.44 340.292 894.245 340.453 894.078C340.615 893.911 340.81 893.828 341.039 893.828ZM340.445 897.227H341.617V905H340.445V897.227ZM344.547 898.234C345.323 897.453 346.276 897.062 347.406 897.062C348.536 897.062 349.49 897.453 350.266 898.234C351.047 899.01 351.438 899.969 351.438 901.109C351.438 902.25 351.047 903.211 350.266 903.992C349.49 904.768 348.536 905.156 347.406 905.156C346.276 905.156 345.323 904.768 344.547 903.992C343.776 903.211 343.391 902.25 343.391 901.109C343.391 899.969 343.776 899.01 344.547 898.234ZM347.406 898.172C346.599 898.172 345.919 898.453 345.367 899.016C344.815 899.578 344.539 900.276 344.539 901.109C344.539 901.938 344.815 902.635 345.367 903.203C345.919 903.771 346.599 904.055 347.406 904.055C348.214 904.055 348.896 903.771 349.453 903.203C350.01 902.63 350.289 901.932 350.289 901.109C350.289 900.281 350.01 899.586 349.453 899.023C348.901 898.456 348.219 898.172 347.406 898.172ZM359.523 893.797H360.695V905H359.523V903.195C359.237 903.82 358.82 904.305 358.273 904.648C357.732 904.987 357.094 905.156 356.359 905.156C355.656 905.156 355.008 904.977 354.414 904.617C353.826 904.258 353.359 903.766 353.016 903.141C352.672 902.516 352.5 901.833 352.5 901.094C352.5 900.354 352.672 899.674 353.016 899.055C353.359 898.435 353.826 897.948 354.414 897.594C355.008 897.24 355.656 897.062 356.359 897.062C357.094 897.062 357.734 897.234 358.281 897.578C358.828 897.917 359.242 898.396 359.523 899.016V893.797ZM356.578 904.055C357.427 904.055 358.13 903.776 358.688 903.219C359.245 902.656 359.523 901.948 359.523 901.094C359.523 900.245 359.245 899.542 358.688 898.984C358.13 898.427 357.427 898.148 356.578 898.148C355.755 898.148 355.06 898.435 354.492 899.008C353.93 899.581 353.648 900.276 353.648 901.094C353.648 901.927 353.93 902.63 354.492 903.203C355.06 903.771 355.755 904.055 356.578 904.055Z"
            fill="#A8A8A8"
          />
          <path
            d="M665.883 922.57L669.125 918.953H663.656V917.797H670.82V918.648L667.367 922.422C668.008 922.339 668.602 922.422 669.148 922.672C669.695 922.917 670.128 923.292 670.445 923.797C670.763 924.302 670.922 924.875 670.922 925.516C670.922 926.578 670.562 927.451 669.844 928.133C669.13 928.815 668.219 929.156 667.109 929.156C666.109 929.156 665.26 928.883 664.562 928.336C663.87 927.789 663.471 927.078 663.367 926.203H664.57C664.68 926.74 664.961 927.172 665.414 927.5C665.867 927.828 666.432 927.992 667.109 927.992C667.854 927.992 668.466 927.758 668.945 927.289C669.43 926.815 669.672 926.211 669.672 925.477C669.672 925.049 669.57 924.669 669.367 924.336C669.164 924.003 668.888 923.75 668.539 923.578C668.19 923.406 667.786 923.299 667.328 923.258C666.87 923.216 666.388 923.268 665.883 923.414V922.57ZM675.641 929.156C674.661 929.156 673.823 928.885 673.125 928.344C672.427 927.802 672.034 927.089 671.945 926.203H673.148C673.263 926.734 673.547 927.167 674 927.5C674.458 927.828 675.005 927.992 675.641 927.992C676.349 927.992 676.948 927.755 677.438 927.281C677.927 926.802 678.172 926.219 678.172 925.531C678.172 924.812 677.927 924.206 677.438 923.711C676.948 923.216 676.349 922.969 675.641 922.969C675.208 922.969 674.805 923.039 674.43 923.18C674.06 923.315 673.766 923.51 673.547 923.766H672.508L673.031 917.797H678.711V918.938H674.109L673.734 922.633C673.964 922.419 674.263 922.253 674.633 922.133C675.008 922.008 675.393 921.945 675.789 921.945C676.82 921.945 677.68 922.284 678.367 922.961C679.055 923.633 679.398 924.495 679.398 925.547C679.398 926.552 679.034 927.406 678.305 928.109C677.576 928.807 676.688 929.156 675.641 929.156ZM685.125 917.797H686.32V927.852H691.984V929H685.125V917.797ZM698.148 917.797C699.091 917.797 699.878 918.107 700.508 918.727C701.143 919.341 701.461 920.104 701.461 921.016C701.461 921.938 701.143 922.708 700.508 923.328C699.878 923.943 699.091 924.25 698.148 924.25H695.039V929H693.844V917.797H698.148ZM698.148 923.094C698.742 923.094 699.24 922.896 699.641 922.5C700.042 922.099 700.242 921.604 700.242 921.016C700.242 920.432 700.042 919.943 699.641 919.547C699.24 919.151 698.742 918.953 698.148 918.953H695.039V923.094H698.148ZM709.367 929L708.281 926.266H702.984L701.891 929H700.617L705.094 917.797H706.18L710.68 929H709.367ZM703.445 925.109H707.828L705.641 919.578L703.445 925.109Z"
            fill="#4B5563"
          />
          <path
            d="M663.266 893.797H669.523V894.953H664.461V898.438H668.977V899.594H664.461V903.852H669.523V905H663.266V893.797ZM677.992 905H676.602L674.375 901.945L672.148 905H670.773L673.688 900.984L670.953 897.227H672.344L674.391 900.039L676.422 897.227H677.797L675.078 900.984L677.992 905ZM683.797 897.062C684.5 897.062 685.146 897.242 685.734 897.602C686.328 897.956 686.797 898.445 687.141 899.07C687.484 899.69 687.656 900.37 687.656 901.109C687.656 901.849 687.484 902.531 687.141 903.156C686.797 903.776 686.328 904.266 685.734 904.625C685.146 904.979 684.5 905.156 683.797 905.156C683.062 905.156 682.422 904.987 681.875 904.648C681.333 904.305 680.919 903.82 680.633 903.195V907.93H679.461V897.227H680.633V899.016C680.914 898.396 681.328 897.917 681.875 897.578C682.422 897.234 683.062 897.062 683.797 897.062ZM683.578 904.055C684.401 904.055 685.094 903.771 685.656 903.203C686.219 902.635 686.5 901.938 686.5 901.109C686.5 900.281 686.219 899.581 685.656 899.008C685.094 898.435 684.401 898.148 683.578 898.148C682.729 898.148 682.026 898.43 681.469 898.992C680.911 899.549 680.633 900.255 680.633 901.109C680.633 901.958 680.911 902.661 681.469 903.219C682.026 903.776 682.729 904.055 683.578 904.055ZM696.398 900.875C696.398 901.109 696.393 901.258 696.383 901.32H689.867C689.924 902.154 690.211 902.826 690.727 903.336C691.242 903.846 691.906 904.102 692.719 904.102C693.344 904.102 693.88 903.961 694.328 903.68C694.781 903.393 695.06 903.013 695.164 902.539H696.336C696.185 903.326 695.773 903.958 695.102 904.438C694.43 904.917 693.625 905.156 692.688 905.156C691.557 905.156 690.612 904.766 689.852 903.984C689.096 903.203 688.719 902.229 688.719 901.062C688.719 899.943 689.102 898.997 689.867 898.227C690.633 897.451 691.568 897.062 692.672 897.062C693.365 897.062 693.995 897.227 694.562 897.555C695.13 897.878 695.578 898.331 695.906 898.914C696.234 899.497 696.398 900.151 696.398 900.875ZM689.922 900.328H695.148C695.091 899.682 694.828 899.154 694.359 898.742C693.896 898.326 693.318 898.117 692.625 898.117C691.938 898.117 691.349 898.318 690.859 898.719C690.37 899.12 690.057 899.656 689.922 900.328ZM701.5 905.156C700.37 905.156 699.417 904.768 698.641 903.992C697.87 903.211 697.484 902.25 697.484 901.109C697.484 899.969 697.87 899.01 698.641 898.234C699.417 897.453 700.37 897.062 701.5 897.062C702.38 897.062 703.164 897.32 703.852 897.836C704.539 898.346 704.956 898.99 705.102 899.766H703.914C703.784 899.302 703.492 898.922 703.039 898.625C702.586 898.323 702.073 898.172 701.5 898.172C700.693 898.172 700.013 898.453 699.461 899.016C698.909 899.578 698.633 900.276 698.633 901.109C698.633 901.938 698.909 902.635 699.461 903.203C700.013 903.771 700.693 904.055 701.5 904.055C702.078 904.055 702.596 903.898 703.055 903.586C703.518 903.273 703.805 902.87 703.914 902.375H705.102C704.982 903.188 704.576 903.854 703.883 904.375C703.195 904.896 702.401 905.156 701.5 905.156ZM710.883 898.312H708.711V902.375C708.711 903.453 709.255 903.992 710.344 903.992C710.562 903.992 710.742 903.971 710.883 903.93V905C710.648 905.052 710.398 905.078 710.133 905.078C709.32 905.078 708.685 904.854 708.227 904.406C707.768 903.953 707.539 903.281 707.539 902.391V898.312H706.008V897.227H707.539V895.078H708.711V897.227H710.883V898.312ZM719.211 900.875C719.211 901.109 719.206 901.258 719.195 901.32H712.68C712.737 902.154 713.023 902.826 713.539 903.336C714.055 903.846 714.719 904.102 715.531 904.102C716.156 904.102 716.693 903.961 717.141 903.68C717.594 903.393 717.872 903.013 717.977 902.539H719.148C718.997 903.326 718.586 903.958 717.914 904.438C717.242 904.917 716.438 905.156 715.5 905.156C714.37 905.156 713.424 904.766 712.664 903.984C711.909 903.203 711.531 902.229 711.531 901.062C711.531 899.943 711.914 898.997 712.68 898.227C713.445 897.451 714.38 897.062 715.484 897.062C716.177 897.062 716.807 897.227 717.375 897.555C717.943 897.878 718.391 898.331 718.719 898.914C719.047 899.497 719.211 900.151 719.211 900.875ZM712.734 900.328H717.961C717.904 899.682 717.641 899.154 717.172 898.742C716.708 898.326 716.13 898.117 715.438 898.117C714.75 898.117 714.161 898.318 713.672 898.719C713.182 899.12 712.87 899.656 712.734 900.328ZM727.32 893.797H728.492V905H727.32V903.195C727.034 903.82 726.617 904.305 726.07 904.648C725.529 904.987 724.891 905.156 724.156 905.156C723.453 905.156 722.805 904.977 722.211 904.617C721.622 904.258 721.156 903.766 720.812 903.141C720.469 902.516 720.297 901.833 720.297 901.094C720.297 900.354 720.469 899.674 720.812 899.055C721.156 898.435 721.622 897.948 722.211 897.594C722.805 897.24 723.453 897.062 724.156 897.062C724.891 897.062 725.531 897.234 726.078 897.578C726.625 897.917 727.039 898.396 727.32 899.016V893.797ZM724.375 904.055C725.224 904.055 725.927 903.776 726.484 903.219C727.042 902.656 727.32 901.948 727.32 901.094C727.32 900.245 727.042 899.542 726.484 898.984C725.927 898.427 725.224 898.148 724.375 898.148C723.552 898.148 722.857 898.435 722.289 899.008C721.727 899.581 721.445 900.276 721.445 901.094C721.445 901.927 721.727 902.63 722.289 903.203C722.857 903.771 723.552 904.055 724.375 904.055ZM739.82 905.156C738.789 905.156 737.846 904.904 736.992 904.398C736.143 903.888 735.474 903.19 734.984 902.305C734.495 901.419 734.25 900.44 734.25 899.367C734.25 898.57 734.393 897.818 734.68 897.109C734.971 896.401 735.365 895.794 735.859 895.289C736.354 894.779 736.945 894.378 737.633 894.086C738.32 893.789 739.049 893.641 739.82 893.641C741.06 893.641 742.156 893.997 743.109 894.711C744.062 895.419 744.646 896.326 744.859 897.43H743.531C743.318 896.654 742.865 896.023 742.172 895.539C741.484 895.049 740.701 894.805 739.82 894.805C739.023 894.805 738.294 895.005 737.633 895.406C736.971 895.802 736.451 896.352 736.07 897.055C735.69 897.753 735.5 898.523 735.5 899.367C735.5 900.221 735.69 901.003 736.07 901.711C736.451 902.419 736.971 902.977 737.633 903.383C738.294 903.789 739.023 903.992 739.82 903.992C740.727 903.992 741.523 903.737 742.211 903.227C742.904 902.716 743.349 902.049 743.547 901.227H744.891C744.651 902.393 744.06 903.341 743.117 904.07C742.18 904.794 741.081 905.156 739.82 905.156ZM754.242 893.797V894.953H750.562V905H749.359V894.953H745.68V893.797H754.242ZM759.82 905.156C758.789 905.156 757.846 904.904 756.992 904.398C756.143 903.888 755.474 903.19 754.984 902.305C754.495 901.419 754.25 900.44 754.25 899.367C754.25 898.57 754.393 897.818 754.68 897.109C754.971 896.401 755.365 895.794 755.859 895.289C756.354 894.779 756.945 894.378 757.633 894.086C758.32 893.789 759.049 893.641 759.82 893.641C761.06 893.641 762.156 893.997 763.109 894.711C764.062 895.419 764.646 896.326 764.859 897.43H763.531C763.318 896.654 762.865 896.023 762.172 895.539C761.484 895.049 760.701 894.805 759.82 894.805C759.023 894.805 758.294 895.005 757.633 895.406C756.971 895.802 756.451 896.352 756.07 897.055C755.69 897.753 755.5 898.523 755.5 899.367C755.5 900.221 755.69 901.003 756.07 901.711C756.451 902.419 756.971 902.977 757.633 903.383C758.294 903.789 759.023 903.992 759.82 903.992C760.727 903.992 761.523 903.737 762.211 903.227C762.904 902.716 763.349 902.049 763.547 901.227H764.891C764.651 902.393 764.06 903.341 763.117 904.07C762.18 904.794 761.081 905.156 759.82 905.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M461.703 929V928.102L466.008 923.797C466.586 923.208 467.013 922.688 467.289 922.234C467.565 921.776 467.703 921.333 467.703 920.906C467.703 920.297 467.49 919.794 467.062 919.398C466.635 919.003 466.096 918.805 465.445 918.805C464.69 918.805 464.078 919.034 463.609 919.492C463.146 919.951 462.922 920.565 462.938 921.336H461.734C461.714 920.602 461.865 919.951 462.188 919.383C462.51 918.815 462.956 918.383 463.523 918.086C464.096 917.789 464.742 917.641 465.461 917.641C466.466 917.641 467.297 917.945 467.953 918.555C468.609 919.159 468.938 919.932 468.938 920.875C468.938 921.995 468.25 923.216 466.875 924.539L463.594 927.828H469.078V929H461.703ZM474.406 929.156C473.141 929.156 472.148 928.643 471.43 927.617C470.716 926.591 470.359 925.185 470.359 923.398C470.359 921.612 470.716 920.206 471.43 919.18C472.148 918.154 473.141 917.641 474.406 917.641C475.667 917.641 476.654 918.154 477.367 919.18C478.081 920.206 478.438 921.612 478.438 923.398C478.438 925.185 478.081 926.591 477.367 927.617C476.654 928.643 475.667 929.156 474.406 929.156ZM474.406 927.992C475.292 927.992 475.979 927.594 476.469 926.797C476.964 926 477.211 924.867 477.211 923.398C477.211 921.93 476.964 920.797 476.469 920C475.979 919.203 475.292 918.805 474.406 918.805C473.516 918.805 472.826 919.203 472.336 920C471.852 920.792 471.609 921.924 471.609 923.398C471.609 924.872 471.852 926.008 472.336 926.805C472.826 927.596 473.516 927.992 474.406 927.992ZM484.297 917.797H485.492V927.852H491.156V929H484.297V917.797ZM497.32 917.797C498.263 917.797 499.049 918.107 499.68 918.727C500.315 919.341 500.633 920.104 500.633 921.016C500.633 921.938 500.315 922.708 499.68 923.328C499.049 923.943 498.263 924.25 497.32 924.25H494.211V929H493.016V917.797H497.32ZM497.32 923.094C497.914 923.094 498.411 922.896 498.812 922.5C499.214 922.099 499.414 921.604 499.414 921.016C499.414 920.432 499.214 919.943 498.812 919.547C498.411 919.151 497.914 918.953 497.32 918.953H494.211V923.094H497.32ZM508.539 929L507.453 926.266H502.156L501.062 929H499.789L504.266 917.797H505.352L509.852 929H508.539ZM502.617 925.109H507L504.812 919.578L502.617 925.109Z"
            fill="#4B5563"
          />
          <path
            d="M466.352 905.156C465.32 905.156 464.378 904.904 463.523 904.398C462.674 903.888 462.005 903.19 461.516 902.305C461.026 901.419 460.781 900.44 460.781 899.367C460.781 898.57 460.924 897.818 461.211 897.109C461.503 896.401 461.896 895.794 462.391 895.289C462.885 894.779 463.477 894.378 464.164 894.086C464.852 893.789 465.581 893.641 466.352 893.641C467.591 893.641 468.688 893.997 469.641 894.711C470.594 895.419 471.177 896.326 471.391 897.43H470.062C469.849 896.654 469.396 896.023 468.703 895.539C468.016 895.049 467.232 894.805 466.352 894.805C465.555 894.805 464.826 895.005 464.164 895.406C463.503 895.802 462.982 896.352 462.602 897.055C462.221 897.753 462.031 898.523 462.031 899.367C462.031 900.221 462.221 901.003 462.602 901.711C462.982 902.419 463.503 902.977 464.164 903.383C464.826 903.789 465.555 903.992 466.352 903.992C467.258 903.992 468.055 903.737 468.742 903.227C469.435 902.716 469.88 902.049 470.078 901.227H471.422C471.182 902.393 470.591 903.341 469.648 904.07C468.711 904.794 467.612 905.156 466.352 905.156ZM479.102 897.227H480.273V905H479.102V903.492C478.852 904.018 478.497 904.427 478.039 904.719C477.586 905.01 477.055 905.156 476.445 905.156C475.445 905.156 474.648 904.844 474.055 904.219C473.461 903.594 473.164 902.755 473.164 901.703V897.227H474.336V901.578C474.336 902.333 474.549 902.935 474.977 903.383C475.404 903.831 475.974 904.055 476.688 904.055C477.422 904.055 478.008 903.831 478.445 903.383C478.883 902.935 479.102 902.333 479.102 901.578V897.227ZM485.867 897.062C486.07 897.062 486.312 897.094 486.594 897.156V898.25C486.339 898.161 486.086 898.117 485.836 898.117C485.227 898.117 484.714 898.333 484.297 898.766C483.885 899.193 483.68 899.734 483.68 900.391V905H482.508V897.227H483.68V898.469C483.909 898.031 484.214 897.688 484.594 897.438C484.974 897.188 485.398 897.062 485.867 897.062ZM491.461 897.062C491.664 897.062 491.906 897.094 492.188 897.156V898.25C491.932 898.161 491.68 898.117 491.43 898.117C490.82 898.117 490.307 898.333 489.891 898.766C489.479 899.193 489.273 899.734 489.273 900.391V905H488.102V897.227H489.273V898.469C489.503 898.031 489.807 897.688 490.188 897.438C490.568 897.188 490.992 897.062 491.461 897.062ZM500.273 900.875C500.273 901.109 500.268 901.258 500.258 901.32H493.742C493.799 902.154 494.086 902.826 494.602 903.336C495.117 903.846 495.781 904.102 496.594 904.102C497.219 904.102 497.755 903.961 498.203 903.68C498.656 903.393 498.935 903.013 499.039 902.539H500.211C500.06 903.326 499.648 903.958 498.977 904.438C498.305 904.917 497.5 905.156 496.562 905.156C495.432 905.156 494.487 904.766 493.727 903.984C492.971 903.203 492.594 902.229 492.594 901.062C492.594 899.943 492.977 898.997 493.742 898.227C494.508 897.451 495.443 897.062 496.547 897.062C497.24 897.062 497.87 897.227 498.438 897.555C499.005 897.878 499.453 898.331 499.781 898.914C500.109 899.497 500.273 900.151 500.273 900.875ZM493.797 900.328H499.023C498.966 899.682 498.703 899.154 498.234 898.742C497.771 898.326 497.193 898.117 496.5 898.117C495.812 898.117 495.224 898.318 494.734 898.719C494.245 899.12 493.932 899.656 493.797 900.328ZM505.898 897.062C506.904 897.062 507.701 897.375 508.289 898C508.883 898.62 509.18 899.461 509.18 900.523V905H508.008V900.633C508.008 899.888 507.792 899.292 507.359 898.844C506.932 898.396 506.365 898.172 505.656 898.172C504.927 898.172 504.341 898.398 503.898 898.852C503.461 899.299 503.242 899.893 503.242 900.633V905H502.07V897.227H503.242V898.742C503.492 898.211 503.846 897.799 504.305 897.508C504.763 897.211 505.294 897.062 505.898 897.062ZM514.977 898.312H512.805V902.375C512.805 903.453 513.349 903.992 514.438 903.992C514.656 903.992 514.836 903.971 514.977 903.93V905C514.742 905.052 514.492 905.078 514.227 905.078C513.414 905.078 512.779 904.854 512.32 904.406C511.862 903.953 511.633 903.281 511.633 902.391V898.312H510.102V897.227H511.633V895.078H512.805V897.227H514.977V898.312ZM525.695 905.156C524.664 905.156 523.721 904.904 522.867 904.398C522.018 903.888 521.349 903.19 520.859 902.305C520.37 901.419 520.125 900.44 520.125 899.367C520.125 898.57 520.268 897.818 520.555 897.109C520.846 896.401 521.24 895.794 521.734 895.289C522.229 894.779 522.82 894.378 523.508 894.086C524.195 893.789 524.924 893.641 525.695 893.641C526.935 893.641 528.031 893.997 528.984 894.711C529.938 895.419 530.521 896.326 530.734 897.43H529.406C529.193 896.654 528.74 896.023 528.047 895.539C527.359 895.049 526.576 894.805 525.695 894.805C524.898 894.805 524.169 895.005 523.508 895.406C522.846 895.802 522.326 896.352 521.945 897.055C521.565 897.753 521.375 898.523 521.375 899.367C521.375 900.221 521.565 901.003 521.945 901.711C522.326 902.419 522.846 902.977 523.508 903.383C524.169 903.789 524.898 903.992 525.695 903.992C526.602 903.992 527.398 903.737 528.086 903.227C528.779 902.716 529.224 902.049 529.422 901.227H530.766C530.526 902.393 529.935 903.341 528.992 904.07C528.055 904.794 526.956 905.156 525.695 905.156ZM540.117 893.797V894.953H536.438V905H535.234V894.953H531.555V893.797H540.117ZM545.695 905.156C544.664 905.156 543.721 904.904 542.867 904.398C542.018 903.888 541.349 903.19 540.859 902.305C540.37 901.419 540.125 900.44 540.125 899.367C540.125 898.57 540.268 897.818 540.555 897.109C540.846 896.401 541.24 895.794 541.734 895.289C542.229 894.779 542.82 894.378 543.508 894.086C544.195 893.789 544.924 893.641 545.695 893.641C546.935 893.641 548.031 893.997 548.984 894.711C549.938 895.419 550.521 896.326 550.734 897.43H549.406C549.193 896.654 548.74 896.023 548.047 895.539C547.359 895.049 546.576 894.805 545.695 894.805C544.898 894.805 544.169 895.005 543.508 895.406C542.846 895.802 542.326 896.352 541.945 897.055C541.565 897.753 541.375 898.523 541.375 899.367C541.375 900.221 541.565 901.003 541.945 901.711C542.326 902.419 542.846 902.977 543.508 903.383C544.169 903.789 544.898 903.992 545.695 903.992C546.602 903.992 547.398 903.737 548.086 903.227C548.779 902.716 549.224 902.049 549.422 901.227H550.766C550.526 902.393 549.935 903.341 548.992 904.07C548.055 904.794 546.956 905.156 545.695 905.156Z"
            fill="#A8A8A8"
          />
          <path
            d="M31 960H799V1027C799 1030.31 796.314 1033 793 1033H37C33.6863 1033 31 1030.31 31 1027V960Z"
            fill="white"
          />
          <rect
            x="635.5"
            y="977.5"
            width="37"
            height="37"
            rx="18.5"
            stroke="#0F47F2"
          />
          <path
            d="M654 984L657 992.143L666 996L657 999L654 1008L651 999L642 996L651 992.143L654 984Z"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="977.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="977.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            stroke="#0F47F2"
            stroke-width="0.5"
          />
          <path
            d="M551.814 1003.18C550.502 1003.18 549.415 1002.79 548.554 1002.02C547.698 1001.25 547.271 1000.28 547.271 999.098H548.606C548.606 999.918 548.908 1000.59 549.512 1001.12C550.115 1001.64 550.883 1001.9 551.814 1001.9C552.693 1001.9 553.42 1001.69 553.994 1001.26C554.568 1000.83 554.855 1000.27 554.855 999.599C554.855 999.247 554.785 998.937 554.645 998.667C554.51 998.397 554.322 998.181 554.082 998.017C553.848 997.853 553.572 997.703 553.256 997.568C552.945 997.428 552.611 997.316 552.254 997.234C551.902 997.152 551.539 997.059 551.164 996.953C550.789 996.848 550.423 996.745 550.065 996.646C549.714 996.54 549.38 996.399 549.063 996.224C548.753 996.048 548.478 995.849 548.237 995.626C548.003 995.403 547.815 995.116 547.675 994.765C547.54 994.413 547.473 994.015 547.473 993.569C547.473 992.597 547.862 991.797 548.642 991.17C549.427 990.537 550.417 990.221 551.612 990.221C552.896 990.221 553.915 990.569 554.671 991.267C555.427 991.958 555.805 992.828 555.805 993.877H554.425C554.396 993.186 554.117 992.62 553.59 992.181C553.068 991.735 552.397 991.513 551.577 991.513C550.757 991.513 550.089 991.703 549.573 992.084C549.063 992.465 548.809 992.96 548.809 993.569C548.809 993.921 548.894 994.226 549.063 994.483C549.233 994.741 549.459 994.946 549.74 995.099C550.027 995.251 550.355 995.386 550.725 995.503C551.094 995.614 551.483 995.72 551.894 995.819C552.304 995.913 552.711 996.016 553.115 996.127C553.525 996.238 553.915 996.385 554.284 996.566C554.653 996.748 554.979 996.965 555.26 997.217C555.547 997.463 555.775 997.791 555.945 998.201C556.115 998.605 556.2 999.071 556.2 999.599C556.2 1000.64 555.784 1001.49 554.952 1002.17C554.126 1002.84 553.08 1003.18 551.814 1003.18ZM562.607 994.07C563.738 994.07 564.635 994.422 565.297 995.125C565.965 995.822 566.299 996.769 566.299 997.964V1003H564.98V998.087C564.98 997.249 564.737 996.578 564.251 996.074C563.771 995.57 563.132 995.318 562.335 995.318C561.515 995.318 560.855 995.573 560.357 996.083C559.865 996.587 559.619 997.255 559.619 998.087V1003H558.301V990.396H559.619V995.96C559.9 995.362 560.299 994.899 560.814 994.571C561.33 994.237 561.928 994.07 562.607 994.07ZM569.595 995.389C570.468 994.51 571.54 994.07 572.812 994.07C574.083 994.07 575.155 994.51 576.028 995.389C576.907 996.262 577.347 997.34 577.347 998.623C577.347 999.906 576.907 1000.99 576.028 1001.87C575.155 1002.74 574.083 1003.18 572.812 1003.18C571.54 1003.18 570.468 1002.74 569.595 1001.87C568.728 1000.99 568.294 999.906 568.294 998.623C568.294 997.34 568.728 996.262 569.595 995.389ZM572.812 995.318C571.903 995.318 571.139 995.635 570.518 996.268C569.896 996.9 569.586 997.686 569.586 998.623C569.586 999.555 569.896 1000.34 570.518 1000.98C571.139 1001.62 571.903 1001.94 572.812 1001.94C573.72 1001.94 574.487 1001.62 575.114 1000.98C575.741 1000.33 576.055 999.549 576.055 998.623C576.055 997.691 575.741 996.909 575.114 996.276C574.493 995.638 573.726 995.318 572.812 995.318ZM583.121 994.07C583.35 994.07 583.622 994.105 583.938 994.176V995.406C583.651 995.307 583.367 995.257 583.086 995.257C582.4 995.257 581.823 995.5 581.354 995.986C580.892 996.467 580.66 997.076 580.66 997.814V1003H579.342V994.255H580.66V995.652C580.918 995.16 581.261 994.773 581.688 994.492C582.116 994.211 582.594 994.07 583.121 994.07ZM590.188 995.477H587.744V1000.05C587.744 1001.26 588.356 1001.87 589.581 1001.87C589.827 1001.87 590.029 1001.84 590.188 1001.8V1003C589.924 1003.06 589.643 1003.09 589.344 1003.09C588.43 1003.09 587.715 1002.84 587.199 1002.33C586.684 1001.82 586.426 1001.07 586.426 1000.06V995.477H584.703V994.255H586.426V991.838H587.744V994.255H590.188V995.477ZM593.334 990.396V1003H592.016V990.396H593.334ZM596.516 990.432C596.768 990.432 596.99 990.525 597.184 990.713C597.377 990.9 597.474 991.12 597.474 991.372C597.474 991.63 597.377 991.855 597.184 992.049C596.99 992.236 596.768 992.33 596.516 992.33C596.258 992.33 596.038 992.236 595.856 992.049C595.675 991.861 595.584 991.636 595.584 991.372C595.584 991.12 595.675 990.9 595.856 990.713C596.038 990.525 596.258 990.432 596.516 990.432ZM595.848 994.255H597.166V1003H595.848V994.255ZM602.562 1003.18C601.578 1003.18 600.764 1002.93 600.119 1002.43C599.475 1001.93 599.108 1001.26 599.021 1000.41H600.277C600.336 1000.91 600.57 1001.3 600.98 1001.6C601.391 1001.9 601.9 1002.04 602.51 1002.04C603.119 1002.04 603.608 1001.9 603.978 1001.63C604.353 1001.35 604.54 1000.99 604.54 1000.55C604.54 1000.25 604.464 1000.01 604.312 999.81C604.159 999.604 603.957 999.452 603.705 999.353C603.459 999.253 603.178 999.162 602.861 999.08C602.545 998.998 602.22 998.931 601.886 998.878C601.552 998.825 601.227 998.743 600.91 998.632C600.594 998.521 600.31 998.389 600.058 998.236C599.812 998.078 599.612 997.855 599.46 997.568C599.308 997.275 599.231 996.927 599.231 996.522C599.231 995.802 599.516 995.213 600.084 994.756C600.652 994.299 601.405 994.07 602.343 994.07C603.204 994.07 603.945 994.299 604.566 994.756C605.193 995.207 605.557 995.813 605.656 996.575H604.329C604.265 996.165 604.045 995.828 603.67 995.564C603.295 995.301 602.841 995.169 602.308 995.169C601.774 995.169 601.341 995.286 601.007 995.521C600.679 995.749 600.515 996.051 600.515 996.426C600.515 996.742 600.611 997 600.805 997.199C601.004 997.398 601.259 997.545 601.569 997.639C601.88 997.732 602.223 997.814 602.598 997.885C602.979 997.949 603.356 998.031 603.731 998.131C604.112 998.23 604.458 998.362 604.769 998.526C605.079 998.69 605.331 998.939 605.524 999.273C605.724 999.607 605.823 1000.02 605.823 1000.51C605.823 1001.29 605.513 1001.92 604.892 1002.43C604.276 1002.93 603.5 1003.18 602.562 1003.18ZM612.09 995.477H609.646V1000.05C609.646 1001.26 610.259 1001.87 611.483 1001.87C611.729 1001.87 611.932 1001.84 612.09 1001.8V1003C611.826 1003.06 611.545 1003.09 611.246 1003.09C610.332 1003.09 609.617 1002.84 609.102 1002.33C608.586 1001.82 608.328 1001.07 608.328 1000.06V995.477H606.605V994.255H608.328V991.838H609.646V994.255H612.09V995.477Z"
            fill="#F5F9FB"
          />
          <circle cx="702" cy="996" r="18.5" stroke="#818283" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M695.328 987.91C695.34 987.91 695.352 987.91 695.365 987.91L708.672 987.91C709.031 987.91 709.36 987.91 709.628 987.946C709.922 987.986 710.234 988.079 710.49 988.335C710.747 988.592 710.84 988.903 710.879 989.198C710.915 989.466 710.915 989.795 710.915 990.154V990.228C710.915 990.587 710.915 990.916 710.879 991.184C710.84 991.479 710.747 991.79 710.49 992.047C710.247 992.29 709.953 992.387 709.671 992.429V996.873C709.671 998.397 709.671 999.604 709.544 1000.55C709.414 1001.52 709.138 1002.31 708.517 1002.93C707.897 1003.55 707.11 1003.83 706.137 1003.96C705.193 1004.08 703.985 1004.08 702.461 1004.08H701.538C700.014 1004.08 698.807 1004.08 697.862 1003.96C696.89 1003.83 696.103 1003.55 695.482 1002.93C694.861 1002.31 694.586 1001.52 694.455 1000.55C694.328 999.604 694.328 998.397 694.328 996.873V992.429C694.046 992.387 693.753 992.29 693.509 992.047C693.253 991.79 693.16 991.479 693.12 991.184C693.084 990.916 693.084 990.587 693.084 990.228C693.084 990.216 693.084 990.203 693.084 990.191C693.084 990.179 693.084 990.166 693.084 990.154C693.084 989.795 693.084 989.466 693.12 989.198C693.16 988.903 693.253 988.592 693.509 988.335C693.765 988.079 694.077 987.986 694.372 987.946C694.64 987.91 694.969 987.91 695.328 987.91ZM695.572 992.472V996.826C695.572 998.407 695.573 999.531 695.688 1000.38C695.8 1001.22 696.011 1001.7 696.362 1002.05C696.713 1002.4 697.193 1002.61 698.028 1002.72C698.88 1002.84 700.004 1002.84 701.585 1002.84H702.414C703.996 1002.84 705.119 1002.84 705.972 1002.72C706.806 1002.61 707.287 1002.4 707.638 1002.05C707.989 1001.7 708.199 1001.22 708.311 1000.38C708.426 999.531 708.427 998.407 708.427 996.826V992.472H695.572ZM694.389 989.215L694.391 989.214C694.392 989.213 694.395 989.212 694.399 989.21C694.417 989.202 694.458 989.19 694.538 989.179C694.712 989.156 694.956 989.154 695.365 989.154H708.635C709.043 989.154 709.287 989.156 709.462 989.179C709.542 989.19 709.582 989.202 709.6 989.21C709.604 989.212 709.607 989.213 709.609 989.214L709.611 989.215L709.612 989.217C709.613 989.219 709.614 989.221 709.616 989.226C709.623 989.244 709.636 989.284 709.646 989.364C709.67 989.539 709.671 989.782 709.671 990.191C709.671 990.599 709.67 990.843 709.646 991.018C709.636 991.098 709.623 991.138 709.616 991.156C709.614 991.161 709.613 991.163 709.612 991.165L709.611 991.167L709.609 991.168C709.607 991.169 709.604 991.17 709.6 991.172C709.582 991.179 709.542 991.192 709.462 991.203C709.287 991.226 709.043 991.228 708.635 991.228H695.365C694.956 991.228 694.712 991.226 694.538 991.203C694.458 991.192 694.417 991.179 694.399 991.172C694.395 991.17 694.392 991.169 694.391 991.168L694.389 991.167L694.388 991.165C694.387 991.163 694.385 991.161 694.384 991.156C694.376 991.138 694.364 991.098 694.353 991.018C694.329 990.843 694.328 990.599 694.328 990.191C694.328 989.782 694.329 989.539 694.353 989.364C694.364 989.284 694.376 989.244 694.384 989.226C694.385 989.221 694.387 989.219 694.388 989.217L694.389 989.215ZM694.389 991.167C694.388 991.167 694.389 991.167 694.389 991.167V991.167ZM700.738 994.13H703.262C703.439 994.13 703.603 994.13 703.74 994.14C703.887 994.15 704.049 994.173 704.214 994.241C704.569 994.388 704.852 994.671 704.999 995.026C705.067 995.191 705.09 995.353 705.1 995.5C705.11 995.637 705.11 995.801 705.11 995.978V996.015C705.11 996.192 705.11 996.356 705.1 996.493C705.09 996.64 705.067 996.802 704.999 996.967C704.852 997.322 704.569 997.605 704.214 997.752C704.049 997.82 703.887 997.843 703.74 997.853C703.603 997.863 703.439 997.863 703.262 997.863H700.738C700.56 997.863 700.397 997.863 700.259 997.853C700.112 997.843 699.95 997.82 699.786 997.752C699.43 997.605 699.147 997.322 699 996.967C698.932 996.802 698.909 996.64 698.899 996.493C698.89 996.356 698.89 996.192 698.89 996.015V995.978C698.89 995.801 698.89 995.637 698.899 995.5C698.909 995.353 698.932 995.191 699 995.026C699.147 994.671 699.43 994.388 699.786 994.241C699.95 994.173 700.112 994.15 700.259 994.14C700.397 994.13 700.56 994.13 700.738 994.13ZM700.259 995.391C700.21 995.412 700.171 995.451 700.15 995.5C700.149 995.506 700.144 995.53 700.14 995.585C700.134 995.675 700.134 995.795 700.134 995.996C700.134 996.198 700.134 996.318 700.14 996.408C700.144 996.463 700.149 996.487 700.15 996.493C700.171 996.542 700.21 996.581 700.259 996.602C700.265 996.603 700.289 996.608 700.344 996.612C700.434 996.618 700.554 996.618 700.756 996.618H703.244C703.445 996.618 703.566 996.618 703.655 996.612C703.711 996.608 703.734 996.603 703.74 996.602C703.789 996.581 703.828 996.542 703.849 996.493C703.85 996.487 703.856 996.463 703.859 996.408C703.865 996.318 703.866 996.198 703.866 995.996C703.866 995.795 703.865 995.675 703.859 995.585C703.856 995.53 703.85 995.506 703.849 995.5C703.828 995.451 703.789 995.412 703.74 995.391C703.734 995.39 703.711 995.385 703.655 995.381C703.566 995.375 703.445 995.374 703.244 995.374H700.756C700.554 995.374 700.434 995.375 700.344 995.381C700.289 995.385 700.265 995.39 700.259 995.391Z"
            fill="#818283"
          />
          <circle cx="750" cy="996" r="18.5" stroke="#818283" />
          <path
            d="M751.77 990.059L752.465 989.364C753.617 988.212 755.484 988.212 756.636 989.364C757.788 990.516 757.788 992.383 756.636 993.535L755.941 994.23M751.77 990.059C751.77 990.059 751.857 991.536 753.16 992.84C754.464 994.143 755.941 994.23 755.941 994.23M751.77 990.059L745.379 996.45C744.946 996.883 744.73 997.099 744.544 997.338C744.324 997.619 744.136 997.924 743.982 998.246C743.852 998.519 743.755 998.81 743.562 999.391L742.741 1001.85M755.941 994.23L749.55 1000.62C749.117 1001.05 748.901 1001.27 748.662 1001.46C748.381 1001.68 748.076 1001.86 747.754 1002.02C747.481 1002.15 747.19 1002.24 746.609 1002.44L744.148 1003.26M742.741 1001.85L742.541 1002.45C742.446 1002.74 742.52 1003.05 742.733 1003.27C742.946 1003.48 743.261 1003.55 743.547 1003.46L744.148 1003.26M742.741 1001.85L744.148 1003.26"
            stroke="#818283"
          />
          <g clip-path="url(#clip4_4500_3993)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M144.5 982C152.508 982 159 988.655 159 996.867C159 1003.43 154.85 1009 149.092 1010.97C148.357 1011.12 148.096 1010.65 148.096 1010.26C148.096 1009.77 148.113 1008.17 148.113 1006.18C148.113 1004.79 147.649 1003.89 147.129 1003.43C150.358 1003.06 153.751 1001.8 153.751 996.091C153.751 994.467 153.188 993.142 152.257 992.1C152.408 991.725 152.906 990.213 152.115 988.165C152.115 988.165 150.9 987.767 148.132 989.69C146.974 989.361 145.733 989.195 144.5 989.189C143.268 989.195 142.028 989.361 140.871 989.69C138.1 987.767 136.882 988.165 136.882 988.165C136.094 990.213 136.592 991.725 136.741 992.1C135.815 993.142 135.248 994.467 135.248 996.091C135.248 1001.79 138.633 1003.06 141.854 1003.44C141.439 1003.81 141.064 1004.46 140.933 1005.43C140.107 1005.81 138.007 1006.46 136.713 1004.19C136.713 1004.19 135.946 1002.76 134.491 1002.66C134.491 1002.66 133.077 1002.64 134.392 1003.56C134.392 1003.56 135.342 1004.02 136.002 1005.74C136.002 1005.74 136.853 1008.39 140.887 1007.49C140.894 1008.73 140.907 1009.9 140.907 1010.26C140.907 1010.65 140.64 1011.11 139.917 1010.97C134.154 1009.01 130 1003.44 130 996.867C130 988.655 136.493 982 144.5 982Z"
              fill="#4B5563"
            />
          </g>
          <g clip-path="url(#clip5_4500_3993)">
            <path
              d="M100.5 982C92.491 982 86 988.491 86 996.5C86 1004.51 92.491 1011 100.5 1011C108.509 1011 115 1004.51 115 996.5C115 988.491 108.509 982 100.5 982ZM96.4445 1002.57H93.6182V993.521H96.4445V1002.57ZM94.9549 992.388H94.9322C93.907 992.388 93.2443 991.697 93.2443 990.819C93.2443 989.924 93.9297 989.25 94.9719 989.25C96.0141 989.25 96.6541 989.924 96.6768 990.819C96.6824 991.691 96.0197 992.388 94.9549 992.388ZM107.75 1002.57H104.544V997.888C104.544 996.664 104.046 995.826 102.941 995.826C102.097 995.826 101.627 996.392 101.412 996.936C101.333 997.129 101.344 997.401 101.344 997.678V1002.57H98.1664C98.1664 1002.57 98.2061 994.274 98.1664 993.521H101.344V994.942C101.531 994.319 102.545 993.436 104.165 993.436C106.175 993.436 107.75 994.738 107.75 997.537V1002.57Z"
              fill="#4B5563"
            />
          </g>
          <rect
            x="50.5"
            y="784.5"
            width="15"
            height="15"
            rx="2"
            stroke="#4B5563"
          />
          <path
            d="M94.9609 817L93.875 814.266H88.5781L87.4844 817H86.2109L90.6875 805.797H91.7734L96.2734 817H94.9609ZM89.0391 813.109H93.4219L91.2344 807.578L89.0391 813.109ZM97.75 805.797H98.9453V817H97.75V805.797ZM105.344 805.797H111.602V806.953H106.539V810.438H111.055V811.594H106.539V815.852H111.602V817H105.344V805.797ZM117.445 809.062C118.451 809.062 119.247 809.375 119.836 810C120.43 810.62 120.727 811.461 120.727 812.523V817H119.555V812.633C119.555 811.888 119.339 811.292 118.906 810.844C118.479 810.396 117.911 810.172 117.203 810.172C116.474 810.172 115.888 810.398 115.445 810.852C115.008 811.299 114.789 811.893 114.789 812.633V817H113.617V809.227H114.789V810.742C115.039 810.211 115.393 809.799 115.852 809.508C116.31 809.211 116.841 809.062 117.445 809.062ZM129.523 809.211H130.695V816.758C130.695 817.826 130.333 818.685 129.609 819.336C128.885 819.987 127.956 820.312 126.82 820.312C126.372 820.312 125.938 820.255 125.516 820.141C125.094 820.031 124.701 819.87 124.336 819.656C123.977 819.443 123.682 819.154 123.453 818.789C123.229 818.43 123.109 818.021 123.094 817.562H124.227C124.242 818.094 124.495 818.518 124.984 818.836C125.474 819.159 126.076 819.32 126.789 819.32C127.581 819.32 128.234 819.086 128.75 818.617C129.266 818.154 129.523 817.549 129.523 816.805V815.094C129.237 815.708 128.82 816.185 128.273 816.523C127.732 816.862 127.094 817.031 126.359 817.031C125.656 817.031 125.008 816.854 124.414 816.5C123.826 816.146 123.359 815.661 123.016 815.047C122.672 814.432 122.5 813.76 122.5 813.031C122.5 812.307 122.672 811.641 123.016 811.031C123.359 810.422 123.826 809.943 124.414 809.594C125.008 809.24 125.656 809.062 126.359 809.062C127.094 809.062 127.732 809.232 128.273 809.57C128.82 809.904 129.237 810.375 129.523 810.984V809.211ZM126.578 815.945C127.427 815.945 128.13 815.672 128.688 815.125C129.245 814.573 129.523 813.875 129.523 813.031C129.523 812.198 129.245 811.508 128.688 810.961C128.13 810.409 127.427 810.133 126.578 810.133C125.755 810.133 125.06 810.414 124.492 810.977C123.93 811.534 123.648 812.219 123.648 813.031C123.648 813.849 123.93 814.539 124.492 815.102C125.06 815.664 125.755 815.945 126.578 815.945ZM133.523 805.828C133.747 805.828 133.945 805.911 134.117 806.078C134.289 806.245 134.375 806.44 134.375 806.664C134.375 806.893 134.289 807.094 134.117 807.266C133.945 807.432 133.747 807.516 133.523 807.516C133.294 807.516 133.099 807.432 132.938 807.266C132.776 807.099 132.695 806.898 132.695 806.664C132.695 806.44 132.776 806.245 132.938 806.078C133.099 805.911 133.294 805.828 133.523 805.828ZM132.93 809.227H134.102V817H132.93V809.227ZM140.164 809.062C141.169 809.062 141.966 809.375 142.555 810C143.148 810.62 143.445 811.461 143.445 812.523V817H142.273V812.633C142.273 811.888 142.057 811.292 141.625 810.844C141.198 810.396 140.63 810.172 139.922 810.172C139.193 810.172 138.607 810.398 138.164 810.852C137.727 811.299 137.508 811.893 137.508 812.633V817H136.336V809.227H137.508V810.742C137.758 810.211 138.112 809.799 138.57 809.508C139.029 809.211 139.56 809.062 140.164 809.062ZM152.898 812.875C152.898 813.109 152.893 813.258 152.883 813.32H146.367C146.424 814.154 146.711 814.826 147.227 815.336C147.742 815.846 148.406 816.102 149.219 816.102C149.844 816.102 150.38 815.961 150.828 815.68C151.281 815.393 151.56 815.013 151.664 814.539H152.836C152.685 815.326 152.273 815.958 151.602 816.438C150.93 816.917 150.125 817.156 149.188 817.156C148.057 817.156 147.112 816.766 146.352 815.984C145.596 815.203 145.219 814.229 145.219 813.062C145.219 811.943 145.602 810.997 146.367 810.227C147.133 809.451 148.068 809.062 149.172 809.062C149.865 809.062 150.495 809.227 151.062 809.555C151.63 809.878 152.078 810.331 152.406 810.914C152.734 811.497 152.898 812.151 152.898 812.875ZM146.422 812.328H151.648C151.591 811.682 151.328 811.154 150.859 810.742C150.396 810.326 149.818 810.117 149.125 810.117C148.438 810.117 147.849 810.318 147.359 810.719C146.87 811.12 146.557 811.656 146.422 812.328ZM161.664 812.875C161.664 813.109 161.659 813.258 161.648 813.32H155.133C155.19 814.154 155.477 814.826 155.992 815.336C156.508 815.846 157.172 816.102 157.984 816.102C158.609 816.102 159.146 815.961 159.594 815.68C160.047 815.393 160.326 815.013 160.43 814.539H161.602C161.451 815.326 161.039 815.958 160.367 816.438C159.695 816.917 158.891 817.156 157.953 817.156C156.823 817.156 155.878 816.766 155.117 815.984C154.362 815.203 153.984 814.229 153.984 813.062C153.984 811.943 154.367 810.997 155.133 810.227C155.898 809.451 156.833 809.062 157.938 809.062C158.63 809.062 159.26 809.227 159.828 809.555C160.396 809.878 160.844 810.331 161.172 810.914C161.5 811.497 161.664 812.151 161.664 812.875ZM155.188 812.328H160.414C160.357 811.682 160.094 811.154 159.625 810.742C159.161 810.326 158.583 810.117 157.891 810.117C157.203 810.117 156.615 810.318 156.125 810.719C155.635 811.12 155.323 811.656 155.188 812.328ZM166.82 809.062C167.023 809.062 167.266 809.094 167.547 809.156V810.25C167.292 810.161 167.039 810.117 166.789 810.117C166.18 810.117 165.667 810.333 165.25 810.766C164.839 811.193 164.633 811.734 164.633 812.391V817H163.461V809.227H164.633V810.469C164.862 810.031 165.167 809.688 165.547 809.438C165.927 809.188 166.352 809.062 166.82 809.062ZM179.477 809.227H180.648V817H179.477V815.195C179.19 815.82 178.773 816.305 178.227 816.648C177.685 816.987 177.047 817.156 176.312 817.156C175.609 817.156 174.961 816.977 174.367 816.617C173.779 816.258 173.312 815.766 172.969 815.141C172.625 814.516 172.453 813.833 172.453 813.094C172.453 812.354 172.625 811.674 172.969 811.055C173.312 810.435 173.779 809.948 174.367 809.594C174.961 809.24 175.609 809.062 176.312 809.062C177.047 809.062 177.688 809.234 178.234 809.578C178.781 809.917 179.195 810.396 179.477 811.016V809.227ZM176.531 816.055C177.38 816.055 178.083 815.776 178.641 815.219C179.198 814.656 179.477 813.948 179.477 813.094C179.477 812.245 179.198 811.542 178.641 810.984C178.083 810.427 177.38 810.148 176.531 810.148C175.708 810.148 175.013 810.435 174.445 811.008C173.883 811.581 173.602 812.276 173.602 813.094C173.602 813.927 173.883 814.63 174.445 815.203C175.013 815.771 175.708 816.055 176.531 816.055ZM186.883 810.312H184.711V814.375C184.711 815.453 185.255 815.992 186.344 815.992C186.562 815.992 186.742 815.971 186.883 815.93V817C186.648 817.052 186.398 817.078 186.133 817.078C185.32 817.078 184.685 816.854 184.227 816.406C183.768 815.953 183.539 815.281 183.539 814.391V810.312H182.008V809.227H183.539V807.078H184.711V809.227H186.883V810.312ZM195.984 805.797C196.75 805.797 197.471 805.938 198.148 806.219C198.831 806.495 199.417 806.878 199.906 807.367C200.396 807.852 200.781 808.44 201.062 809.133C201.349 809.82 201.492 810.56 201.492 811.352C201.492 812.143 201.349 812.891 201.062 813.594C200.781 814.292 200.396 814.891 199.906 815.391C199.417 815.885 198.831 816.279 198.148 816.57C197.471 816.857 196.75 817 195.984 817H192.516V805.797H195.984ZM196.047 815.852C197.245 815.852 198.242 815.424 199.039 814.57C199.841 813.711 200.242 812.638 200.242 811.352C200.242 810.076 199.844 809.023 199.047 808.195C198.255 807.367 197.255 806.953 196.047 806.953H193.711V815.852H196.047ZM210.383 812.875C210.383 813.109 210.378 813.258 210.367 813.32H203.852C203.909 814.154 204.195 814.826 204.711 815.336C205.227 815.846 205.891 816.102 206.703 816.102C207.328 816.102 207.865 815.961 208.312 815.68C208.766 815.393 209.044 815.013 209.148 814.539H210.32C210.169 815.326 209.758 815.958 209.086 816.438C208.414 816.917 207.609 817.156 206.672 817.156C205.542 817.156 204.596 816.766 203.836 815.984C203.081 815.203 202.703 814.229 202.703 813.062C202.703 811.943 203.086 810.997 203.852 810.227C204.617 809.451 205.552 809.062 206.656 809.062C207.349 809.062 207.979 809.227 208.547 809.555C209.115 809.878 209.562 810.331 209.891 810.914C210.219 811.497 210.383 812.151 210.383 812.875ZM203.906 812.328H209.133C209.076 811.682 208.812 811.154 208.344 810.742C207.88 810.326 207.302 810.117 206.609 810.117C205.922 810.117 205.333 810.318 204.844 810.719C204.354 811.12 204.042 811.656 203.906 812.328ZM221.258 809.062C222.227 809.062 222.995 809.357 223.562 809.945C224.135 810.529 224.422 811.328 224.422 812.344V817H223.258V812.555C223.258 811.81 223.062 811.227 222.672 810.805C222.286 810.383 221.755 810.172 221.078 810.172C220.802 810.172 220.539 810.216 220.289 810.305C220.039 810.393 219.805 810.529 219.586 810.711C219.372 810.893 219.201 811.143 219.07 811.461C218.945 811.779 218.883 812.143 218.883 812.555V817H217.719V812.555C217.719 811.81 217.523 811.227 217.133 810.805C216.747 810.383 216.216 810.172 215.539 810.172C215.268 810.172 215.008 810.216 214.758 810.305C214.513 810.388 214.281 810.521 214.062 810.703C213.849 810.88 213.677 811.128 213.547 811.445C213.417 811.763 213.352 812.133 213.352 812.555V817H212.18V809.227H213.352V810.57C213.607 810.06 213.964 809.682 214.422 809.438C214.88 809.188 215.37 809.062 215.891 809.062C217.229 809.062 218.122 809.622 218.57 810.742C218.789 810.211 219.143 809.799 219.633 809.508C220.122 809.211 220.664 809.062 221.258 809.062ZM227.359 810.234C228.135 809.453 229.089 809.062 230.219 809.062C231.349 809.062 232.302 809.453 233.078 810.234C233.859 811.01 234.25 811.969 234.25 813.109C234.25 814.25 233.859 815.211 233.078 815.992C232.302 816.768 231.349 817.156 230.219 817.156C229.089 817.156 228.135 816.768 227.359 815.992C226.589 815.211 226.203 814.25 226.203 813.109C226.203 811.969 226.589 811.01 227.359 810.234ZM230.219 810.172C229.411 810.172 228.732 810.453 228.18 811.016C227.628 811.578 227.352 812.276 227.352 813.109C227.352 813.938 227.628 814.635 228.18 815.203C228.732 815.771 229.411 816.055 230.219 816.055C231.026 816.055 231.708 815.771 232.266 815.203C232.823 814.63 233.102 813.932 233.102 813.109C233.102 812.281 232.823 811.586 232.266 811.023C231.714 810.456 231.031 810.172 230.219 810.172ZM239.852 809.062C240.857 809.062 241.654 809.375 242.242 810C242.836 810.62 243.133 811.461 243.133 812.523V817H241.961V812.633C241.961 811.888 241.745 811.292 241.312 810.844C240.885 810.396 240.318 810.172 239.609 810.172C238.88 810.172 238.294 810.398 237.852 810.852C237.414 811.299 237.195 811.893 237.195 812.633V817H236.023V809.227H237.195V810.742C237.445 810.211 237.799 809.799 238.258 809.508C238.716 809.211 239.247 809.062 239.852 809.062ZM252.977 817.156C251.81 817.156 250.844 816.815 250.078 816.133C249.318 815.445 248.938 814.578 248.938 813.531H250.125C250.125 814.26 250.393 814.859 250.93 815.328C251.466 815.792 252.148 816.023 252.977 816.023C253.758 816.023 254.404 815.833 254.914 815.453C255.424 815.068 255.68 814.576 255.68 813.977C255.68 813.664 255.617 813.388 255.492 813.148C255.372 812.909 255.206 812.716 254.992 812.57C254.784 812.424 254.539 812.292 254.258 812.172C253.982 812.047 253.685 811.948 253.367 811.875C253.055 811.802 252.732 811.719 252.398 811.625C252.065 811.531 251.74 811.44 251.422 811.352C251.109 811.258 250.812 811.133 250.531 810.977C250.255 810.82 250.01 810.643 249.797 810.445C249.589 810.247 249.422 809.992 249.297 809.68C249.177 809.367 249.117 809.013 249.117 808.617C249.117 807.753 249.464 807.042 250.156 806.484C250.854 805.922 251.734 805.641 252.797 805.641C253.938 805.641 254.844 805.951 255.516 806.57C256.188 807.185 256.523 807.958 256.523 808.891H255.297C255.271 808.276 255.023 807.773 254.555 807.383C254.091 806.987 253.495 806.789 252.766 806.789C252.036 806.789 251.443 806.958 250.984 807.297C250.531 807.635 250.305 808.076 250.305 808.617C250.305 808.93 250.38 809.201 250.531 809.43C250.682 809.659 250.883 809.841 251.133 809.977C251.388 810.112 251.68 810.232 252.008 810.336C252.336 810.435 252.682 810.529 253.047 810.617C253.411 810.701 253.773 810.792 254.133 810.891C254.497 810.99 254.844 811.12 255.172 811.281C255.5 811.443 255.789 811.635 256.039 811.859C256.294 812.078 256.497 812.37 256.648 812.734C256.799 813.094 256.875 813.508 256.875 813.977C256.875 814.898 256.505 815.659 255.766 816.258C255.031 816.857 254.102 817.156 252.977 817.156ZM259.914 805.797V817H258.742V805.797H259.914ZM268.477 809.227H269.648V817H268.477V815.195C268.19 815.82 267.773 816.305 267.227 816.648C266.685 816.987 266.047 817.156 265.312 817.156C264.609 817.156 263.961 816.977 263.367 816.617C262.779 816.258 262.312 815.766 261.969 815.141C261.625 814.516 261.453 813.833 261.453 813.094C261.453 812.354 261.625 811.674 261.969 811.055C262.312 810.435 262.779 809.948 263.367 809.594C263.961 809.24 264.609 809.062 265.312 809.062C266.047 809.062 266.688 809.234 267.234 809.578C267.781 809.917 268.195 810.396 268.477 811.016V809.227ZM265.531 816.055C266.38 816.055 267.083 815.776 267.641 815.219C268.198 814.656 268.477 813.948 268.477 813.094C268.477 812.245 268.198 811.542 267.641 810.984C267.083 810.427 266.38 810.148 265.531 810.148C264.708 810.148 264.013 810.435 263.445 811.008C262.883 811.581 262.602 812.276 262.602 813.094C262.602 813.927 262.883 814.63 263.445 815.203C264.013 815.771 264.708 816.055 265.531 816.055ZM277.406 809.227H278.656L274.156 819.945H272.906L274.25 816.859L271.039 809.227H272.305L274.844 815.492L277.406 809.227ZM286.977 812.875C286.977 813.109 286.971 813.258 286.961 813.32H280.445C280.503 814.154 280.789 814.826 281.305 815.336C281.82 815.846 282.484 816.102 283.297 816.102C283.922 816.102 284.458 815.961 284.906 815.68C285.359 815.393 285.638 815.013 285.742 814.539H286.914C286.763 815.326 286.352 815.958 285.68 816.438C285.008 816.917 284.203 817.156 283.266 817.156C282.135 817.156 281.19 816.766 280.43 815.984C279.674 815.203 279.297 814.229 279.297 813.062C279.297 811.943 279.68 810.997 280.445 810.227C281.211 809.451 282.146 809.062 283.25 809.062C283.943 809.062 284.573 809.227 285.141 809.555C285.708 809.878 286.156 810.331 286.484 810.914C286.812 811.497 286.977 812.151 286.977 812.875ZM280.5 812.328H285.727C285.669 811.682 285.406 811.154 284.938 810.742C284.474 810.326 283.896 810.117 283.203 810.117C282.516 810.117 281.927 810.318 281.438 810.719C280.948 811.12 280.635 811.656 280.5 812.328ZM292.133 809.062C292.336 809.062 292.578 809.094 292.859 809.156V810.25C292.604 810.161 292.352 810.117 292.102 810.117C291.492 810.117 290.979 810.333 290.562 810.766C290.151 811.193 289.945 811.734 289.945 812.391V817H288.773V809.227H289.945V810.469C290.174 810.031 290.479 809.688 290.859 809.438C291.24 809.188 291.664 809.062 292.133 809.062ZM298.227 804.203H299.445V819.945H298.227V804.203ZM305.688 817V805.797H309.57C310.445 805.797 311.193 806.073 311.812 806.625C312.432 807.172 312.742 807.831 312.742 808.602C312.742 809.201 312.56 809.737 312.195 810.211C311.831 810.685 311.378 810.974 310.836 811.078C311.539 811.151 312.13 811.458 312.609 812C313.094 812.542 313.336 813.18 313.336 813.914C313.336 814.773 313.016 815.503 312.375 816.102C311.74 816.701 310.966 817 310.055 817H305.688ZM306.883 810.68H309.539C310.091 810.68 310.56 810.495 310.945 810.125C311.331 809.75 311.523 809.294 311.523 808.758C311.523 808.258 311.328 807.833 310.938 807.484C310.552 807.13 310.086 806.953 309.539 806.953H306.883V810.68ZM306.883 815.852H309.992C310.596 815.852 311.099 815.651 311.5 815.25C311.901 814.849 312.102 814.354 312.102 813.766C312.102 813.182 311.898 812.69 311.492 812.289C311.091 811.888 310.596 811.688 310.008 811.688H306.883V815.852ZM315.734 817.156C315.469 817.156 315.247 817.07 315.07 816.898C314.893 816.721 314.805 816.5 314.805 816.234C314.805 815.974 314.893 815.755 315.07 815.578C315.247 815.396 315.469 815.305 315.734 815.305C316.005 815.305 316.229 815.396 316.406 815.578C316.583 815.755 316.672 815.974 316.672 816.234C316.672 816.5 316.583 816.721 316.406 816.898C316.229 817.07 316.005 817.156 315.734 817.156ZM325.008 805.797V806.953H321.328V817H320.125V806.953H316.445V805.797H325.008ZM332.023 812.875C332.023 813.109 332.018 813.258 332.008 813.32H325.492C325.549 814.154 325.836 814.826 326.352 815.336C326.867 815.846 327.531 816.102 328.344 816.102C328.969 816.102 329.505 815.961 329.953 815.68C330.406 815.393 330.685 815.013 330.789 814.539H331.961C331.81 815.326 331.398 815.958 330.727 816.438C330.055 816.917 329.25 817.156 328.312 817.156C327.182 817.156 326.237 816.766 325.477 815.984C324.721 815.203 324.344 814.229 324.344 813.062C324.344 811.943 324.727 810.997 325.492 810.227C326.258 809.451 327.193 809.062 328.297 809.062C328.99 809.062 329.62 809.227 330.188 809.555C330.755 809.878 331.203 810.331 331.531 810.914C331.859 811.497 332.023 812.151 332.023 812.875ZM325.547 812.328H330.773C330.716 811.682 330.453 811.154 329.984 810.742C329.521 810.326 328.943 810.117 328.25 810.117C327.562 810.117 326.974 810.318 326.484 810.719C325.995 811.12 325.682 811.656 325.547 812.328ZM337.125 817.156C335.995 817.156 335.042 816.768 334.266 815.992C333.495 815.211 333.109 814.25 333.109 813.109C333.109 811.969 333.495 811.01 334.266 810.234C335.042 809.453 335.995 809.062 337.125 809.062C338.005 809.062 338.789 809.32 339.477 809.836C340.164 810.346 340.581 810.99 340.727 811.766H339.539C339.409 811.302 339.117 810.922 338.664 810.625C338.211 810.323 337.698 810.172 337.125 810.172C336.318 810.172 335.638 810.453 335.086 811.016C334.534 811.578 334.258 812.276 334.258 813.109C334.258 813.938 334.534 814.635 335.086 815.203C335.638 815.771 336.318 816.055 337.125 816.055C337.703 816.055 338.221 815.898 338.68 815.586C339.143 815.273 339.43 814.87 339.539 814.375H340.727C340.607 815.188 340.201 815.854 339.508 816.375C338.82 816.896 338.026 817.156 337.125 817.156ZM346.211 809.062C347.216 809.062 348.013 809.375 348.602 810C349.195 810.62 349.492 811.461 349.492 812.523V817H348.32V812.633C348.32 811.888 348.104 811.292 347.672 810.844C347.245 810.396 346.677 810.172 345.969 810.172C345.24 810.172 344.654 810.398 344.211 810.852C343.773 811.299 343.555 811.893 343.555 812.633V817H342.383V805.797H343.555V810.742C343.805 810.211 344.159 809.799 344.617 809.508C345.076 809.211 345.607 809.062 346.211 809.062ZM356.18 805.828C356.404 805.828 356.602 805.911 356.773 806.078C356.945 806.245 357.031 806.44 357.031 806.664C357.031 806.893 356.945 807.094 356.773 807.266C356.602 807.432 356.404 807.516 356.18 807.516C355.951 807.516 355.755 807.432 355.594 807.266C355.432 807.099 355.352 806.898 355.352 806.664C355.352 806.44 355.432 806.245 355.594 806.078C355.755 805.911 355.951 805.828 356.18 805.828ZM355.586 809.227H356.758V817H355.586V809.227ZM362.82 809.062C363.826 809.062 364.622 809.375 365.211 810C365.805 810.62 366.102 811.461 366.102 812.523V817H364.93V812.633C364.93 811.888 364.714 811.292 364.281 810.844C363.854 810.396 363.286 810.172 362.578 810.172C361.849 810.172 361.263 810.398 360.82 810.852C360.383 811.299 360.164 811.893 360.164 812.633V817H358.992V809.227H360.164V810.742C360.414 810.211 360.768 809.799 361.227 809.508C361.685 809.211 362.216 809.062 362.82 809.062ZM377.43 817.156C376.398 817.156 375.456 816.904 374.602 816.398C373.753 815.888 373.083 815.19 372.594 814.305C372.104 813.419 371.859 812.44 371.859 811.367C371.859 810.57 372.003 809.818 372.289 809.109C372.581 808.401 372.974 807.794 373.469 807.289C373.964 806.779 374.555 806.378 375.242 806.086C375.93 805.789 376.659 805.641 377.43 805.641C378.669 805.641 379.766 805.997 380.719 806.711C381.672 807.419 382.255 808.326 382.469 809.43H381.141C380.927 808.654 380.474 808.023 379.781 807.539C379.094 807.049 378.31 806.805 377.43 806.805C376.633 806.805 375.904 807.005 375.242 807.406C374.581 807.802 374.06 808.352 373.68 809.055C373.299 809.753 373.109 810.523 373.109 811.367C373.109 812.221 373.299 813.003 373.68 813.711C374.06 814.419 374.581 814.977 375.242 815.383C375.904 815.789 376.633 815.992 377.43 815.992C378.336 815.992 379.133 815.737 379.82 815.227C380.513 814.716 380.958 814.049 381.156 813.227H382.5C382.26 814.393 381.669 815.341 380.727 816.07C379.789 816.794 378.69 817.156 377.43 817.156ZM388.227 809.062C389.232 809.062 390.029 809.375 390.617 810C391.211 810.62 391.508 811.461 391.508 812.523V817H390.336V812.633C390.336 811.888 390.12 811.292 389.688 810.844C389.26 810.396 388.693 810.172 387.984 810.172C387.255 810.172 386.669 810.398 386.227 810.852C385.789 811.299 385.57 811.893 385.57 812.633V817H384.398V805.797H385.57V810.742C385.82 810.211 386.174 809.799 386.633 809.508C387.091 809.211 387.622 809.062 388.227 809.062ZM400.961 812.875C400.961 813.109 400.956 813.258 400.945 813.32H394.43C394.487 814.154 394.773 814.826 395.289 815.336C395.805 815.846 396.469 816.102 397.281 816.102C397.906 816.102 398.443 815.961 398.891 815.68C399.344 815.393 399.622 815.013 399.727 814.539H400.898C400.747 815.326 400.336 815.958 399.664 816.438C398.992 816.917 398.188 817.156 397.25 817.156C396.12 817.156 395.174 816.766 394.414 815.984C393.659 815.203 393.281 814.229 393.281 813.062C393.281 811.943 393.664 810.997 394.43 810.227C395.195 809.451 396.13 809.062 397.234 809.062C397.927 809.062 398.557 809.227 399.125 809.555C399.693 809.878 400.141 810.331 400.469 810.914C400.797 811.497 400.961 812.151 400.961 812.875ZM394.484 812.328H399.711C399.654 811.682 399.391 811.154 398.922 810.742C398.458 810.326 397.88 810.117 397.188 810.117C396.5 810.117 395.911 810.318 395.422 810.719C394.932 811.12 394.62 811.656 394.484 812.328ZM411.836 809.062C412.805 809.062 413.573 809.357 414.141 809.945C414.714 810.529 415 811.328 415 812.344V817H413.836V812.555C413.836 811.81 413.641 811.227 413.25 810.805C412.865 810.383 412.333 810.172 411.656 810.172C411.38 810.172 411.117 810.216 410.867 810.305C410.617 810.393 410.383 810.529 410.164 810.711C409.951 810.893 409.779 811.143 409.648 811.461C409.523 811.779 409.461 812.143 409.461 812.555V817H408.297V812.555C408.297 811.81 408.102 811.227 407.711 810.805C407.326 810.383 406.794 810.172 406.117 810.172C405.846 810.172 405.586 810.216 405.336 810.305C405.091 810.388 404.859 810.521 404.641 810.703C404.427 810.88 404.255 811.128 404.125 811.445C403.995 811.763 403.93 812.133 403.93 812.555V817H402.758V809.227H403.93V810.57C404.185 810.06 404.542 809.682 405 809.438C405.458 809.188 405.948 809.062 406.469 809.062C407.807 809.062 408.701 809.622 409.148 810.742C409.367 810.211 409.721 809.799 410.211 809.508C410.701 809.211 411.242 809.062 411.836 809.062ZM417.836 805.828C418.06 805.828 418.258 805.911 418.43 806.078C418.602 806.245 418.688 806.44 418.688 806.664C418.688 806.893 418.602 807.094 418.43 807.266C418.258 807.432 418.06 807.516 417.836 807.516C417.607 807.516 417.411 807.432 417.25 807.266C417.089 807.099 417.008 806.898 417.008 806.664C417.008 806.44 417.089 806.245 417.25 806.078C417.411 805.911 417.607 805.828 417.836 805.828ZM417.242 809.227H418.414V817H417.242V809.227ZM424.203 817.156C423.073 817.156 422.12 816.768 421.344 815.992C420.573 815.211 420.188 814.25 420.188 813.109C420.188 811.969 420.573 811.01 421.344 810.234C422.12 809.453 423.073 809.062 424.203 809.062C425.083 809.062 425.867 809.32 426.555 809.836C427.242 810.346 427.659 810.99 427.805 811.766H426.617C426.487 811.302 426.195 810.922 425.742 810.625C425.289 810.323 424.776 810.172 424.203 810.172C423.396 810.172 422.716 810.453 422.164 811.016C421.612 811.578 421.336 812.276 421.336 813.109C421.336 813.938 421.612 814.635 422.164 815.203C422.716 815.771 423.396 816.055 424.203 816.055C424.781 816.055 425.299 815.898 425.758 815.586C426.221 815.273 426.508 814.87 426.617 814.375H427.805C427.685 815.188 427.279 815.854 426.586 816.375C425.898 816.896 425.104 817.156 424.203 817.156ZM435.992 809.227H437.164V817H435.992V815.195C435.706 815.82 435.289 816.305 434.742 816.648C434.201 816.987 433.562 817.156 432.828 817.156C432.125 817.156 431.477 816.977 430.883 816.617C430.294 816.258 429.828 815.766 429.484 815.141C429.141 814.516 428.969 813.833 428.969 813.094C428.969 812.354 429.141 811.674 429.484 811.055C429.828 810.435 430.294 809.948 430.883 809.594C431.477 809.24 432.125 809.062 432.828 809.062C433.562 809.062 434.203 809.234 434.75 809.578C435.297 809.917 435.711 810.396 435.992 811.016V809.227ZM433.047 816.055C433.896 816.055 434.599 815.776 435.156 815.219C435.714 814.656 435.992 813.948 435.992 813.094C435.992 812.245 435.714 811.542 435.156 810.984C434.599 810.427 433.896 810.148 433.047 810.148C432.224 810.148 431.529 810.435 430.961 811.008C430.398 811.581 430.117 812.276 430.117 813.094C430.117 813.927 430.398 814.63 430.961 815.203C431.529 815.771 432.224 816.055 433.047 816.055ZM440.57 805.797V817H439.398V805.797H440.57ZM446.812 805.797H453.07V806.953H448.008V810.438H452.523V811.594H448.008V815.852H453.07V817H446.812V805.797ZM458.914 809.062C459.919 809.062 460.716 809.375 461.305 810C461.898 810.62 462.195 811.461 462.195 812.523V817H461.023V812.633C461.023 811.888 460.807 811.292 460.375 810.844C459.948 810.396 459.38 810.172 458.672 810.172C457.943 810.172 457.357 810.398 456.914 810.852C456.477 811.299 456.258 811.893 456.258 812.633V817H455.086V809.227H456.258V810.742C456.508 810.211 456.862 809.799 457.32 809.508C457.779 809.211 458.31 809.062 458.914 809.062ZM470.992 809.211H472.164V816.758C472.164 817.826 471.802 818.685 471.078 819.336C470.354 819.987 469.424 820.312 468.289 820.312C467.841 820.312 467.406 820.255 466.984 820.141C466.562 820.031 466.169 819.87 465.805 819.656C465.445 819.443 465.151 819.154 464.922 818.789C464.698 818.43 464.578 818.021 464.562 817.562H465.695C465.711 818.094 465.964 818.518 466.453 818.836C466.943 819.159 467.544 819.32 468.258 819.32C469.049 819.32 469.703 819.086 470.219 818.617C470.734 818.154 470.992 817.549 470.992 816.805V815.094C470.706 815.708 470.289 816.185 469.742 816.523C469.201 816.862 468.562 817.031 467.828 817.031C467.125 817.031 466.477 816.854 465.883 816.5C465.294 816.146 464.828 815.661 464.484 815.047C464.141 814.432 463.969 813.76 463.969 813.031C463.969 812.307 464.141 811.641 464.484 811.031C464.828 810.422 465.294 809.943 465.883 809.594C466.477 809.24 467.125 809.062 467.828 809.062C468.562 809.062 469.201 809.232 469.742 809.57C470.289 809.904 470.706 810.375 470.992 810.984V809.211ZM468.047 815.945C468.896 815.945 469.599 815.672 470.156 815.125C470.714 814.573 470.992 813.875 470.992 813.031C470.992 812.198 470.714 811.508 470.156 810.961C469.599 810.409 468.896 810.133 468.047 810.133C467.224 810.133 466.529 810.414 465.961 810.977C465.398 811.534 465.117 812.219 465.117 813.031C465.117 813.849 465.398 814.539 465.961 815.102C466.529 815.664 467.224 815.945 468.047 815.945ZM474.992 805.828C475.216 805.828 475.414 805.911 475.586 806.078C475.758 806.245 475.844 806.44 475.844 806.664C475.844 806.893 475.758 807.094 475.586 807.266C475.414 807.432 475.216 807.516 474.992 807.516C474.763 807.516 474.568 807.432 474.406 807.266C474.245 807.099 474.164 806.898 474.164 806.664C474.164 806.44 474.245 806.245 474.406 806.078C474.568 805.911 474.763 805.828 474.992 805.828ZM474.398 809.227H475.57V817H474.398V809.227ZM481.633 809.062C482.638 809.062 483.435 809.375 484.023 810C484.617 810.62 484.914 811.461 484.914 812.523V817H483.742V812.633C483.742 811.888 483.526 811.292 483.094 810.844C482.667 810.396 482.099 810.172 481.391 810.172C480.661 810.172 480.076 810.398 479.633 810.852C479.195 811.299 478.977 811.893 478.977 812.633V817H477.805V809.227H478.977V810.742C479.227 810.211 479.581 809.799 480.039 809.508C480.497 809.211 481.029 809.062 481.633 809.062ZM494.367 812.875C494.367 813.109 494.362 813.258 494.352 813.32H487.836C487.893 814.154 488.18 814.826 488.695 815.336C489.211 815.846 489.875 816.102 490.688 816.102C491.312 816.102 491.849 815.961 492.297 815.68C492.75 815.393 493.029 815.013 493.133 814.539H494.305C494.154 815.326 493.742 815.958 493.07 816.438C492.398 816.917 491.594 817.156 490.656 817.156C489.526 817.156 488.581 816.766 487.82 815.984C487.065 815.203 486.688 814.229 486.688 813.062C486.688 811.943 487.07 810.997 487.836 810.227C488.602 809.451 489.536 809.062 490.641 809.062C491.333 809.062 491.964 809.227 492.531 809.555C493.099 809.878 493.547 810.331 493.875 810.914C494.203 811.497 494.367 812.151 494.367 812.875ZM487.891 812.328H493.117C493.06 811.682 492.797 811.154 492.328 810.742C491.865 810.326 491.286 810.117 490.594 810.117C489.906 810.117 489.318 810.318 488.828 810.719C488.339 811.12 488.026 811.656 487.891 812.328ZM503.133 812.875C503.133 813.109 503.128 813.258 503.117 813.32H496.602C496.659 814.154 496.945 814.826 497.461 815.336C497.977 815.846 498.641 816.102 499.453 816.102C500.078 816.102 500.615 815.961 501.062 815.68C501.516 815.393 501.794 815.013 501.898 814.539H503.07C502.919 815.326 502.508 815.958 501.836 816.438C501.164 816.917 500.359 817.156 499.422 817.156C498.292 817.156 497.346 816.766 496.586 815.984C495.831 815.203 495.453 814.229 495.453 813.062C495.453 811.943 495.836 810.997 496.602 810.227C497.367 809.451 498.302 809.062 499.406 809.062C500.099 809.062 500.729 809.227 501.297 809.555C501.865 809.878 502.312 810.331 502.641 810.914C502.969 811.497 503.133 812.151 503.133 812.875ZM496.656 812.328H501.883C501.826 811.682 501.562 811.154 501.094 810.742C500.63 810.326 500.052 810.117 499.359 810.117C498.672 810.117 498.083 810.318 497.594 810.719C497.104 811.12 496.792 811.656 496.656 812.328ZM508.289 809.062C508.492 809.062 508.734 809.094 509.016 809.156V810.25C508.76 810.161 508.508 810.117 508.258 810.117C507.648 810.117 507.135 810.333 506.719 810.766C506.307 811.193 506.102 811.734 506.102 812.391V817H504.93V809.227H506.102V810.469C506.331 810.031 506.635 809.688 507.016 809.438C507.396 809.188 507.82 809.062 508.289 809.062ZM511.117 805.828C511.341 805.828 511.539 805.911 511.711 806.078C511.883 806.245 511.969 806.44 511.969 806.664C511.969 806.893 511.883 807.094 511.711 807.266C511.539 807.432 511.341 807.516 511.117 807.516C510.888 807.516 510.693 807.432 510.531 807.266C510.37 807.099 510.289 806.898 510.289 806.664C510.289 806.44 510.37 806.245 510.531 806.078C510.693 805.911 510.888 805.828 511.117 805.828ZM510.523 809.227H511.695V817H510.523V809.227ZM517.758 809.062C518.763 809.062 519.56 809.375 520.148 810C520.742 810.62 521.039 811.461 521.039 812.523V817H519.867V812.633C519.867 811.888 519.651 811.292 519.219 810.844C518.792 810.396 518.224 810.172 517.516 810.172C516.786 810.172 516.201 810.398 515.758 810.852C515.32 811.299 515.102 811.893 515.102 812.633V817H513.93V809.227H515.102V810.742C515.352 810.211 515.706 809.799 516.164 809.508C516.622 809.211 517.154 809.062 517.758 809.062ZM529.836 809.211H531.008V816.758C531.008 817.826 530.646 818.685 529.922 819.336C529.198 819.987 528.268 820.312 527.133 820.312C526.685 820.312 526.25 820.255 525.828 820.141C525.406 820.031 525.013 819.87 524.648 819.656C524.289 819.443 523.995 819.154 523.766 818.789C523.542 818.43 523.422 818.021 523.406 817.562H524.539C524.555 818.094 524.807 818.518 525.297 818.836C525.786 819.159 526.388 819.32 527.102 819.32C527.893 819.32 528.547 819.086 529.062 818.617C529.578 818.154 529.836 817.549 529.836 816.805V815.094C529.549 815.708 529.133 816.185 528.586 816.523C528.044 816.862 527.406 817.031 526.672 817.031C525.969 817.031 525.32 816.854 524.727 816.5C524.138 816.146 523.672 815.661 523.328 815.047C522.984 814.432 522.812 813.76 522.812 813.031C522.812 812.307 522.984 811.641 523.328 811.031C523.672 810.422 524.138 809.943 524.727 809.594C525.32 809.24 525.969 809.062 526.672 809.062C527.406 809.062 528.044 809.232 528.586 809.57C529.133 809.904 529.549 810.375 529.836 810.984V809.211ZM526.891 815.945C527.74 815.945 528.443 815.672 529 815.125C529.557 814.573 529.836 813.875 529.836 813.031C529.836 812.198 529.557 811.508 529 810.961C528.443 810.409 527.74 810.133 526.891 810.133C526.068 810.133 525.372 810.414 524.805 810.977C524.242 811.534 523.961 812.219 523.961 813.031C523.961 813.849 524.242 814.539 524.805 815.102C525.372 815.664 526.068 815.945 526.891 815.945Z"
            fill="#0F47F2"
          />
          <path
            d="M87.1514 775.396H89.2607V788H87.1514V775.396ZM96.1338 779.018C97.2588 779.018 98.1494 779.372 98.8057 780.081C99.4619 780.79 99.79 781.757 99.79 782.981V788H97.7773V783.228C97.7773 782.536 97.5811 781.982 97.1885 781.566C96.8018 781.15 96.2891 780.942 95.6504 780.942C94.9883 780.942 94.458 781.15 94.0596 781.566C93.667 781.982 93.4707 782.536 93.4707 783.228V788H91.4756V779.202H93.4707V780.582C93.752 780.084 94.1211 779.7 94.5781 779.431C95.0352 779.155 95.5537 779.018 96.1338 779.018ZM102.761 780.336C103.634 779.457 104.715 779.018 106.004 779.018C107.293 779.018 108.377 779.457 109.256 780.336C110.135 781.215 110.574 782.305 110.574 783.605C110.574 784.906 110.135 785.993 109.256 786.866C108.377 787.739 107.293 788.176 106.004 788.176C104.715 788.176 103.634 787.739 102.761 786.866C101.888 785.993 101.451 784.906 101.451 783.605C101.451 782.305 101.888 781.215 102.761 780.336ZM107.85 781.707C107.352 781.197 106.736 780.942 106.004 780.942C105.271 780.942 104.659 781.197 104.167 781.707C103.675 782.217 103.429 782.85 103.429 783.605C103.429 784.355 103.675 784.985 104.167 785.495C104.665 785.999 105.277 786.251 106.004 786.251C106.736 786.251 107.352 785.996 107.85 785.486C108.348 784.977 108.597 784.35 108.597 783.605C108.597 782.85 108.348 782.217 107.85 781.707ZM115.514 788.176C114.424 788.176 113.53 787.909 112.833 787.376C112.136 786.843 111.743 786.107 111.655 785.17H113.58C113.615 785.551 113.803 785.861 114.143 786.102C114.482 786.336 114.901 786.453 115.399 786.453C115.88 786.453 116.258 786.359 116.533 786.172C116.809 785.984 116.946 785.735 116.946 785.425C116.946 785.173 116.853 784.968 116.665 784.81C116.478 784.646 116.234 784.525 115.936 784.449C115.637 784.367 115.306 784.294 114.942 784.229C114.585 784.165 114.225 784.083 113.861 783.983C113.498 783.884 113.167 783.755 112.868 783.597C112.569 783.433 112.326 783.192 112.139 782.876C111.951 782.554 111.857 782.167 111.857 781.716C111.857 780.937 112.159 780.292 112.763 779.782C113.372 779.272 114.181 779.018 115.188 779.018C116.138 779.018 116.949 779.261 117.623 779.747C118.297 780.233 118.684 780.907 118.783 781.769H116.771C116.724 781.458 116.554 781.203 116.261 781.004C115.968 780.799 115.599 780.696 115.153 780.696C114.755 780.696 114.43 780.778 114.178 780.942C113.926 781.101 113.8 781.317 113.8 781.593C113.8 781.804 113.873 781.979 114.02 782.12C114.166 782.261 114.359 782.363 114.6 782.428C114.84 782.486 115.112 782.548 115.417 782.612C115.722 782.677 116.035 782.735 116.357 782.788C116.68 782.841 116.993 782.932 117.298 783.061C117.603 783.184 117.875 783.333 118.115 783.509C118.355 783.685 118.549 783.937 118.695 784.265C118.842 784.587 118.915 784.968 118.915 785.407C118.915 786.198 118.59 786.857 117.939 787.385C117.295 787.912 116.486 788.176 115.514 788.176ZM126.711 779.202H128.724V788H126.711V786.611C126.43 787.115 126.063 787.502 125.612 787.771C125.161 788.041 124.646 788.176 124.065 788.176C122.929 788.176 122.035 787.824 121.385 787.121C120.734 786.412 120.409 785.439 120.409 784.203V779.202H122.404V783.966C122.404 784.657 122.601 785.211 122.993 785.627C123.386 786.043 123.904 786.251 124.549 786.251C125.199 786.251 125.721 786.043 126.113 785.627C126.512 785.211 126.711 784.657 126.711 783.966V779.202ZM139.165 788H136.572L132.828 783.843V788H130.833V775.396H132.828V782.999L136.396 779.202H138.893L134.85 783.43L139.165 788ZM148.042 783.412C148.042 783.816 148.024 784.098 147.989 784.256H141.239C141.368 784.912 141.655 785.428 142.101 785.803C142.546 786.178 143.117 786.365 143.814 786.365C144.354 786.365 144.816 786.248 145.203 786.014C145.596 785.779 145.836 785.475 145.924 785.1H147.937C147.772 786.025 147.31 786.77 146.548 787.332C145.786 787.895 144.863 788.176 143.779 788.176C142.93 788.176 142.156 787.977 141.459 787.578C140.762 787.174 140.211 786.617 139.807 785.908C139.408 785.199 139.209 784.414 139.209 783.553C139.209 782.715 139.408 781.95 139.807 781.259C140.211 780.562 140.759 780.014 141.45 779.615C142.147 779.217 142.912 779.018 143.744 779.018C144.529 779.018 145.247 779.202 145.897 779.571C146.554 779.94 147.075 780.465 147.462 781.145C147.849 781.818 148.042 782.574 148.042 783.412ZM141.292 782.542H145.862C145.774 782.032 145.528 781.622 145.124 781.312C144.726 780.995 144.228 780.837 143.63 780.837C143.038 780.837 142.537 780.986 142.127 781.285C141.717 781.584 141.438 782.003 141.292 782.542ZM161.964 775.396H164.073V788H161.964V782.472H155.864V788H153.755V775.396H155.864V780.459H161.964V775.396ZM173.161 779.202H175.183V788H173.161V786.453C172.839 787.01 172.414 787.438 171.887 787.736C171.359 788.029 170.747 788.176 170.05 788.176C169.282 788.176 168.576 787.974 167.932 787.569C167.287 787.159 166.777 786.603 166.402 785.899C166.027 785.19 165.84 784.42 165.84 783.588C165.84 782.756 166.027 781.988 166.402 781.285C166.777 780.582 167.287 780.028 167.932 779.624C168.576 779.22 169.282 779.018 170.05 779.018C170.747 779.018 171.359 779.167 171.887 779.466C172.414 779.765 172.839 780.192 173.161 780.749V779.202ZM170.48 786.269C171.242 786.269 171.878 786.014 172.388 785.504C172.903 784.988 173.161 784.35 173.161 783.588C173.161 782.832 172.903 782.199 172.388 781.689C171.878 781.18 171.242 780.925 170.48 780.925C169.736 780.925 169.106 781.186 168.591 781.707C168.075 782.223 167.817 782.85 167.817 783.588C167.817 784.338 168.075 784.974 168.591 785.495C169.106 786.011 169.736 786.269 170.48 786.269ZM180.588 788.176C179.498 788.176 178.604 787.909 177.907 787.376C177.21 786.843 176.817 786.107 176.729 785.17H178.654C178.689 785.551 178.877 785.861 179.217 786.102C179.557 786.336 179.976 786.453 180.474 786.453C180.954 786.453 181.332 786.359 181.607 786.172C181.883 785.984 182.021 785.735 182.021 785.425C182.021 785.173 181.927 784.968 181.739 784.81C181.552 784.646 181.309 784.525 181.01 784.449C180.711 784.367 180.38 784.294 180.017 784.229C179.659 784.165 179.299 784.083 178.936 783.983C178.572 783.884 178.241 783.755 177.942 783.597C177.644 783.433 177.4 783.192 177.213 782.876C177.025 782.554 176.932 782.167 176.932 781.716C176.932 780.937 177.233 780.292 177.837 779.782C178.446 779.272 179.255 779.018 180.263 779.018C181.212 779.018 182.023 779.261 182.697 779.747C183.371 780.233 183.758 780.907 183.857 781.769H181.845C181.798 781.458 181.628 781.203 181.335 781.004C181.042 780.799 180.673 780.696 180.228 780.696C179.829 780.696 179.504 780.778 179.252 780.942C179 781.101 178.874 781.317 178.874 781.593C178.874 781.804 178.947 781.979 179.094 782.12C179.24 782.261 179.434 782.363 179.674 782.428C179.914 782.486 180.187 782.548 180.491 782.612C180.796 782.677 181.109 782.735 181.432 782.788C181.754 782.841 182.067 782.932 182.372 783.061C182.677 783.184 182.949 783.333 183.189 783.509C183.43 783.685 183.623 783.937 183.77 784.265C183.916 784.587 183.989 784.968 183.989 785.407C183.989 786.198 183.664 786.857 183.014 787.385C182.369 787.912 181.561 788.176 180.588 788.176ZM190.3 779.018C191.425 779.018 192.315 779.372 192.972 780.081C193.628 780.79 193.956 781.757 193.956 782.981V788H191.943V783.228C191.943 782.536 191.747 781.982 191.354 781.566C190.968 781.15 190.455 780.942 189.816 780.942C189.154 780.942 188.624 781.15 188.226 781.566C187.833 781.982 187.637 782.536 187.637 783.228V788H185.642V775.396H187.637V780.582C187.918 780.084 188.287 779.7 188.744 779.431C189.201 779.155 189.72 779.018 190.3 779.018ZM196.171 775.493C196.423 775.241 196.725 775.115 197.076 775.115C197.428 775.115 197.729 775.241 197.981 775.493C198.239 775.745 198.368 776.044 198.368 776.39C198.368 776.747 198.239 777.052 197.981 777.304C197.729 777.556 197.428 777.682 197.076 777.682C196.725 777.682 196.423 777.556 196.171 777.304C195.919 777.052 195.793 776.747 195.793 776.39C195.793 776.044 195.919 775.745 196.171 775.493ZM196.065 779.202H198.061V788H196.065V779.202ZM205.417 779.018C206.583 779.018 207.573 779.463 208.388 780.354C209.202 781.238 209.609 782.316 209.609 783.588C209.609 784.42 209.422 785.188 209.047 785.891C208.678 786.594 208.171 787.15 207.526 787.561C206.888 787.971 206.185 788.176 205.417 788.176C204.714 788.176 204.096 788.023 203.562 787.719C203.029 787.414 202.602 786.98 202.279 786.418V788H200.284V775.396H202.279V780.784C202.602 780.216 203.029 779.779 203.562 779.475C204.096 779.17 204.714 779.018 205.417 779.018ZM204.978 786.269C205.722 786.269 206.352 786.011 206.867 785.495C207.383 784.974 207.641 784.338 207.641 783.588C207.641 782.85 207.383 782.223 206.867 781.707C206.352 781.186 205.722 780.925 204.978 780.925C204.204 780.925 203.56 781.18 203.044 781.689C202.534 782.199 202.279 782.832 202.279 783.588C202.279 784.355 202.534 784.994 203.044 785.504C203.56 786.014 204.204 786.269 204.978 786.269ZM211.411 775.493C211.663 775.241 211.965 775.115 212.316 775.115C212.668 775.115 212.97 775.241 213.222 775.493C213.479 775.745 213.608 776.044 213.608 776.39C213.608 776.747 213.479 777.052 213.222 777.304C212.97 777.556 212.668 777.682 212.316 777.682C211.965 777.682 211.663 777.556 211.411 777.304C211.159 777.052 211.033 776.747 211.033 776.39C211.033 776.044 211.159 775.745 211.411 775.493ZM211.306 779.202H213.301V788H211.306V779.202ZM219.787 779.018C219.98 779.018 220.259 779.053 220.622 779.123V780.96C220.282 780.878 219.986 780.837 219.734 780.837C219.072 780.837 218.519 781.057 218.073 781.496C217.634 781.936 217.414 782.536 217.414 783.298V788H215.419V779.202H217.414V780.371C217.971 779.469 218.762 779.018 219.787 779.018ZM228.251 779.202H230.272V788H228.251V786.453C227.929 787.01 227.504 787.438 226.977 787.736C226.449 788.029 225.837 788.176 225.14 788.176C224.372 788.176 223.666 787.974 223.021 787.569C222.377 787.159 221.867 786.603 221.492 785.899C221.117 785.19 220.93 784.42 220.93 783.588C220.93 782.756 221.117 781.988 221.492 781.285C221.867 780.582 222.377 780.028 223.021 779.624C223.666 779.22 224.372 779.018 225.14 779.018C225.837 779.018 226.449 779.167 226.977 779.466C227.504 779.765 227.929 780.192 228.251 780.749V779.202ZM225.57 786.269C226.332 786.269 226.968 786.014 227.478 785.504C227.993 784.988 228.251 784.35 228.251 783.588C228.251 782.832 227.993 782.199 227.478 781.689C226.968 781.18 226.332 780.925 225.57 780.925C224.826 780.925 224.196 781.186 223.681 781.707C223.165 782.223 222.907 782.85 222.907 783.588C222.907 784.338 223.165 784.974 223.681 785.495C224.196 786.011 224.826 786.269 225.57 786.269Z"
            fill="#222222"
          />
          <path d="M86 869H766" stroke="#818283" stroke-width="0.25" />
          <circle cx="188.5" cy="996.5" r="14.5" fill="#4B5563" />
          <path
            d="M186.257 996.519C186.257 997.719 185.261 998.691 184.032 998.691C182.803 998.691 181.807 997.719 181.807 996.519C181.807 995.32 182.803 994.348 184.032 994.348C185.261 994.348 186.257 995.32 186.257 996.519Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M190.709 991.734L186.258 994.775"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M190.709 1001.3L186.258 998.262"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M195.162 1002.16C195.162 1003.36 194.165 1004.33 192.936 1004.33C191.707 1004.33 190.711 1003.36 190.711 1002.16C190.711 1000.96 191.707 999.988 192.936 999.988C194.165 999.988 195.162 1000.96 195.162 1002.16Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M195.162 990.863C195.162 992.062 194.165 993.035 192.936 993.035C191.707 993.035 190.711 992.062 190.711 990.863C190.711 989.664 191.707 988.691 192.936 988.691C194.165 988.691 195.162 989.664 195.162 990.863Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <rect
            x="30.5"
            y="1059.5"
            width="769"
            height="279"
            rx="5.5"
            fill="white"
            stroke="#E2E2E2"
          />
          <path
            d="M219.867 1156.16C218.701 1156.16 217.734 1155.82 216.969 1155.13C216.208 1154.45 215.828 1153.58 215.828 1152.53H217.016C217.016 1153.26 217.284 1153.86 217.82 1154.33C218.357 1154.79 219.039 1155.02 219.867 1155.02C220.648 1155.02 221.294 1154.83 221.805 1154.45C222.315 1154.07 222.57 1153.58 222.57 1152.98C222.57 1152.66 222.508 1152.39 222.383 1152.15C222.263 1151.91 222.096 1151.72 221.883 1151.57C221.674 1151.42 221.43 1151.29 221.148 1151.17C220.872 1151.05 220.576 1150.95 220.258 1150.88C219.945 1150.8 219.622 1150.72 219.289 1150.62C218.956 1150.53 218.63 1150.44 218.312 1150.35C218 1150.26 217.703 1150.13 217.422 1149.98C217.146 1149.82 216.901 1149.64 216.688 1149.45C216.479 1149.25 216.312 1148.99 216.188 1148.68C216.068 1148.37 216.008 1148.01 216.008 1147.62C216.008 1146.75 216.354 1146.04 217.047 1145.48C217.745 1144.92 218.625 1144.64 219.688 1144.64C220.828 1144.64 221.734 1144.95 222.406 1145.57C223.078 1146.18 223.414 1146.96 223.414 1147.89H222.188C222.161 1147.28 221.914 1146.77 221.445 1146.38C220.982 1145.99 220.385 1145.79 219.656 1145.79C218.927 1145.79 218.333 1145.96 217.875 1146.3C217.422 1146.64 217.195 1147.08 217.195 1147.62C217.195 1147.93 217.271 1148.2 217.422 1148.43C217.573 1148.66 217.773 1148.84 218.023 1148.98C218.279 1149.11 218.57 1149.23 218.898 1149.34C219.227 1149.43 219.573 1149.53 219.938 1149.62C220.302 1149.7 220.664 1149.79 221.023 1149.89C221.388 1149.99 221.734 1150.12 222.062 1150.28C222.391 1150.44 222.68 1150.64 222.93 1150.86C223.185 1151.08 223.388 1151.37 223.539 1151.73C223.69 1152.09 223.766 1152.51 223.766 1152.98C223.766 1153.9 223.396 1154.66 222.656 1155.26C221.922 1155.86 220.992 1156.16 219.867 1156.16ZM226.328 1149.23C227.104 1148.45 228.057 1148.06 229.188 1148.06C230.318 1148.06 231.271 1148.45 232.047 1149.23C232.828 1150.01 233.219 1150.97 233.219 1152.11C233.219 1153.25 232.828 1154.21 232.047 1154.99C231.271 1155.77 230.318 1156.16 229.188 1156.16C228.057 1156.16 227.104 1155.77 226.328 1154.99C225.557 1154.21 225.172 1153.25 225.172 1152.11C225.172 1150.97 225.557 1150.01 226.328 1149.23ZM229.188 1149.17C228.38 1149.17 227.701 1149.45 227.148 1150.02C226.596 1150.58 226.32 1151.28 226.32 1152.11C226.32 1152.94 226.596 1153.64 227.148 1154.2C227.701 1154.77 228.38 1155.05 229.188 1155.05C229.995 1155.05 230.677 1154.77 231.234 1154.2C231.792 1153.63 232.07 1152.93 232.07 1152.11C232.07 1151.28 231.792 1150.59 231.234 1150.02C230.682 1149.46 230 1149.17 229.188 1149.17ZM240.93 1148.23H242.102V1156H240.93V1154.49C240.68 1155.02 240.326 1155.43 239.867 1155.72C239.414 1156.01 238.883 1156.16 238.273 1156.16C237.273 1156.16 236.477 1155.84 235.883 1155.22C235.289 1154.59 234.992 1153.76 234.992 1152.7V1148.23H236.164V1152.58C236.164 1153.33 236.378 1153.93 236.805 1154.38C237.232 1154.83 237.802 1155.05 238.516 1155.05C239.25 1155.05 239.836 1154.83 240.273 1154.38C240.711 1153.93 240.93 1153.33 240.93 1152.58V1148.23ZM247.695 1148.06C247.898 1148.06 248.141 1148.09 248.422 1148.16V1149.25C248.167 1149.16 247.914 1149.12 247.664 1149.12C247.055 1149.12 246.542 1149.33 246.125 1149.77C245.714 1150.19 245.508 1150.73 245.508 1151.39V1156H244.336V1148.23H245.508V1149.47C245.737 1149.03 246.042 1148.69 246.422 1148.44C246.802 1148.19 247.227 1148.06 247.695 1148.06ZM252.844 1156.16C251.714 1156.16 250.76 1155.77 249.984 1154.99C249.214 1154.21 248.828 1153.25 248.828 1152.11C248.828 1150.97 249.214 1150.01 249.984 1149.23C250.76 1148.45 251.714 1148.06 252.844 1148.06C253.724 1148.06 254.508 1148.32 255.195 1148.84C255.883 1149.35 256.299 1149.99 256.445 1150.77H255.258C255.128 1150.3 254.836 1149.92 254.383 1149.62C253.93 1149.32 253.417 1149.17 252.844 1149.17C252.036 1149.17 251.357 1149.45 250.805 1150.02C250.253 1150.58 249.977 1151.28 249.977 1152.11C249.977 1152.94 250.253 1153.64 250.805 1154.2C251.357 1154.77 252.036 1155.05 252.844 1155.05C253.422 1155.05 253.94 1154.9 254.398 1154.59C254.862 1154.27 255.148 1153.87 255.258 1153.38H256.445C256.326 1154.19 255.919 1154.85 255.227 1155.38C254.539 1155.9 253.745 1156.16 252.844 1156.16ZM265.289 1151.88C265.289 1152.11 265.284 1152.26 265.273 1152.32H258.758C258.815 1153.15 259.102 1153.83 259.617 1154.34C260.133 1154.85 260.797 1155.1 261.609 1155.1C262.234 1155.1 262.771 1154.96 263.219 1154.68C263.672 1154.39 263.951 1154.01 264.055 1153.54H265.227C265.076 1154.33 264.664 1154.96 263.992 1155.44C263.32 1155.92 262.516 1156.16 261.578 1156.16C260.448 1156.16 259.503 1155.77 258.742 1154.98C257.987 1154.2 257.609 1153.23 257.609 1152.06C257.609 1150.94 257.992 1150 258.758 1149.23C259.523 1148.45 260.458 1148.06 261.562 1148.06C262.255 1148.06 262.885 1148.23 263.453 1148.55C264.021 1148.88 264.469 1149.33 264.797 1149.91C265.125 1150.5 265.289 1151.15 265.289 1151.88ZM258.812 1151.33H264.039C263.982 1150.68 263.719 1150.15 263.25 1149.74C262.786 1149.33 262.208 1149.12 261.516 1149.12C260.828 1149.12 260.24 1149.32 259.75 1149.72C259.26 1150.12 258.948 1150.66 258.812 1151.33ZM273.398 1144.8H274.57V1156H273.398V1154.2C273.112 1154.82 272.695 1155.3 272.148 1155.65C271.607 1155.99 270.969 1156.16 270.234 1156.16C269.531 1156.16 268.883 1155.98 268.289 1155.62C267.701 1155.26 267.234 1154.77 266.891 1154.14C266.547 1153.52 266.375 1152.83 266.375 1152.09C266.375 1151.35 266.547 1150.67 266.891 1150.05C267.234 1149.43 267.701 1148.95 268.289 1148.59C268.883 1148.24 269.531 1148.06 270.234 1148.06C270.969 1148.06 271.609 1148.23 272.156 1148.58C272.703 1148.92 273.117 1149.4 273.398 1150.02V1144.8ZM270.453 1155.05C271.302 1155.05 272.005 1154.78 272.562 1154.22C273.12 1153.66 273.398 1152.95 273.398 1152.09C273.398 1151.24 273.12 1150.54 272.562 1149.98C272.005 1149.43 271.302 1149.15 270.453 1149.15C269.63 1149.15 268.935 1149.43 268.367 1150.01C267.805 1150.58 267.523 1151.28 267.523 1152.09C267.523 1152.93 267.805 1153.63 268.367 1154.2C268.935 1154.77 269.63 1155.05 270.453 1155.05ZM284.008 1148.78C285.023 1148.78 285.878 1149.13 286.57 1149.84C287.263 1150.54 287.609 1151.41 287.609 1152.45C287.609 1153.12 287.44 1153.74 287.102 1154.31C286.763 1154.88 286.305 1155.33 285.727 1155.66C285.148 1155.99 284.518 1156.16 283.836 1156.16C283.154 1156.16 282.523 1155.99 281.945 1155.66C281.372 1155.33 280.917 1154.88 280.578 1154.31C280.245 1153.74 280.078 1153.12 280.078 1152.45C280.078 1152.04 280.156 1151.6 280.312 1151.1C280.474 1150.61 280.703 1150.12 281 1149.65L284.023 1144.8H285.406L282.633 1149.15C283.065 1148.9 283.523 1148.78 284.008 1148.78ZM283.836 1155.01C284.57 1155.01 285.188 1154.76 285.688 1154.27C286.193 1153.77 286.445 1153.15 286.445 1152.43C286.445 1151.7 286.19 1151.08 285.68 1150.58C285.174 1150.07 284.555 1149.82 283.82 1149.82C283.102 1149.82 282.492 1150.07 281.992 1150.58C281.492 1151.08 281.242 1151.7 281.242 1152.43C281.242 1153.15 281.492 1153.77 281.992 1154.27C282.492 1154.76 283.107 1155.01 283.836 1155.01ZM299.602 1144.8H300.773V1156H299.602V1154.2C299.315 1154.82 298.898 1155.3 298.352 1155.65C297.81 1155.99 297.172 1156.16 296.438 1156.16C295.734 1156.16 295.086 1155.98 294.492 1155.62C293.904 1155.26 293.438 1154.77 293.094 1154.14C292.75 1153.52 292.578 1152.83 292.578 1152.09C292.578 1151.35 292.75 1150.67 293.094 1150.05C293.438 1149.43 293.904 1148.95 294.492 1148.59C295.086 1148.24 295.734 1148.06 296.438 1148.06C297.172 1148.06 297.812 1148.23 298.359 1148.58C298.906 1148.92 299.32 1149.4 299.602 1150.02V1144.8ZM296.656 1155.05C297.505 1155.05 298.208 1154.78 298.766 1154.22C299.323 1153.66 299.602 1152.95 299.602 1152.09C299.602 1151.24 299.323 1150.54 298.766 1149.98C298.208 1149.43 297.505 1149.15 296.656 1149.15C295.833 1149.15 295.138 1149.43 294.57 1150.01C294.008 1150.58 293.727 1151.28 293.727 1152.09C293.727 1152.93 294.008 1153.63 294.57 1154.2C295.138 1154.77 295.833 1155.05 296.656 1155.05ZM309.336 1148.23H310.508V1156H309.336V1154.2C309.049 1154.82 308.633 1155.3 308.086 1155.65C307.544 1155.99 306.906 1156.16 306.172 1156.16C305.469 1156.16 304.82 1155.98 304.227 1155.62C303.638 1155.26 303.172 1154.77 302.828 1154.14C302.484 1153.52 302.312 1152.83 302.312 1152.09C302.312 1151.35 302.484 1150.67 302.828 1150.05C303.172 1149.43 303.638 1148.95 304.227 1148.59C304.82 1148.24 305.469 1148.06 306.172 1148.06C306.906 1148.06 307.547 1148.23 308.094 1148.58C308.641 1148.92 309.055 1149.4 309.336 1150.02V1148.23ZM306.391 1155.05C307.24 1155.05 307.943 1154.78 308.5 1154.22C309.057 1153.66 309.336 1152.95 309.336 1152.09C309.336 1151.24 309.057 1150.54 308.5 1149.98C307.943 1149.43 307.24 1149.15 306.391 1149.15C305.568 1149.15 304.872 1149.43 304.305 1150.01C303.742 1150.58 303.461 1151.28 303.461 1152.09C303.461 1152.93 303.742 1153.63 304.305 1154.2C304.872 1154.77 305.568 1155.05 306.391 1155.05ZM318.266 1148.23H319.516L315.016 1158.95H313.766L315.109 1155.86L311.898 1148.23H313.164L315.703 1154.49L318.266 1148.23ZM323.352 1156.16C322.477 1156.16 321.753 1155.93 321.18 1155.49C320.607 1155.05 320.281 1154.45 320.203 1153.7H321.32C321.372 1154.14 321.581 1154.49 321.945 1154.76C322.31 1155.02 322.763 1155.15 323.305 1155.15C323.846 1155.15 324.281 1155.03 324.609 1154.78C324.943 1154.53 325.109 1154.21 325.109 1153.82C325.109 1153.56 325.042 1153.34 324.906 1153.16C324.771 1152.98 324.591 1152.85 324.367 1152.76C324.148 1152.67 323.898 1152.59 323.617 1152.52C323.336 1152.44 323.047 1152.38 322.75 1152.34C322.453 1152.29 322.164 1152.22 321.883 1152.12C321.602 1152.02 321.349 1151.9 321.125 1151.77C320.906 1151.62 320.729 1151.43 320.594 1151.17C320.458 1150.91 320.391 1150.6 320.391 1150.24C320.391 1149.6 320.643 1149.08 321.148 1148.67C321.654 1148.27 322.323 1148.06 323.156 1148.06C323.922 1148.06 324.581 1148.27 325.133 1148.67C325.69 1149.07 326.013 1149.61 326.102 1150.29H324.922C324.865 1149.92 324.669 1149.62 324.336 1149.39C324.003 1149.16 323.599 1149.04 323.125 1149.04C322.651 1149.04 322.266 1149.14 321.969 1149.35C321.677 1149.55 321.531 1149.82 321.531 1150.16C321.531 1150.44 321.617 1150.67 321.789 1150.84C321.966 1151.02 322.193 1151.15 322.469 1151.23C322.745 1151.32 323.049 1151.39 323.383 1151.45C323.721 1151.51 324.057 1151.58 324.391 1151.67C324.729 1151.76 325.036 1151.88 325.312 1152.02C325.589 1152.17 325.812 1152.39 325.984 1152.69C326.161 1152.98 326.25 1153.35 326.25 1153.79C326.25 1154.48 325.974 1155.04 325.422 1155.49C324.875 1155.93 324.185 1156.16 323.352 1156.16ZM338.477 1148.23H339.648V1156H338.477V1154.2C338.19 1154.82 337.773 1155.3 337.227 1155.65C336.685 1155.99 336.047 1156.16 335.312 1156.16C334.609 1156.16 333.961 1155.98 333.367 1155.62C332.779 1155.26 332.312 1154.77 331.969 1154.14C331.625 1153.52 331.453 1152.83 331.453 1152.09C331.453 1151.35 331.625 1150.67 331.969 1150.05C332.312 1149.43 332.779 1148.95 333.367 1148.59C333.961 1148.24 334.609 1148.06 335.312 1148.06C336.047 1148.06 336.688 1148.23 337.234 1148.58C337.781 1148.92 338.195 1149.4 338.477 1150.02V1148.23ZM335.531 1155.05C336.38 1155.05 337.083 1154.78 337.641 1154.22C338.198 1153.66 338.477 1152.95 338.477 1152.09C338.477 1151.24 338.198 1150.54 337.641 1149.98C337.083 1149.43 336.38 1149.15 335.531 1149.15C334.708 1149.15 334.013 1149.43 333.445 1150.01C332.883 1150.58 332.602 1151.28 332.602 1152.09C332.602 1152.93 332.883 1153.63 333.445 1154.2C334.013 1154.77 334.708 1155.05 335.531 1155.05ZM348.445 1148.21H349.617V1155.76C349.617 1156.83 349.255 1157.68 348.531 1158.34C347.807 1158.99 346.878 1159.31 345.742 1159.31C345.294 1159.31 344.859 1159.26 344.438 1159.14C344.016 1159.03 343.622 1158.87 343.258 1158.66C342.898 1158.44 342.604 1158.15 342.375 1157.79C342.151 1157.43 342.031 1157.02 342.016 1156.56H343.148C343.164 1157.09 343.417 1157.52 343.906 1157.84C344.396 1158.16 344.997 1158.32 345.711 1158.32C346.503 1158.32 347.156 1158.09 347.672 1157.62C348.188 1157.15 348.445 1156.55 348.445 1155.8V1154.09C348.159 1154.71 347.742 1155.18 347.195 1155.52C346.654 1155.86 346.016 1156.03 345.281 1156.03C344.578 1156.03 343.93 1155.85 343.336 1155.5C342.747 1155.15 342.281 1154.66 341.938 1154.05C341.594 1153.43 341.422 1152.76 341.422 1152.03C341.422 1151.31 341.594 1150.64 341.938 1150.03C342.281 1149.42 342.747 1148.94 343.336 1148.59C343.93 1148.24 344.578 1148.06 345.281 1148.06C346.016 1148.06 346.654 1148.23 347.195 1148.57C347.742 1148.9 348.159 1149.38 348.445 1149.98V1148.21ZM345.5 1154.95C346.349 1154.95 347.052 1154.67 347.609 1154.12C348.167 1153.57 348.445 1152.88 348.445 1152.03C348.445 1151.2 348.167 1150.51 347.609 1149.96C347.052 1149.41 346.349 1149.13 345.5 1149.13C344.677 1149.13 343.982 1149.41 343.414 1149.98C342.852 1150.53 342.57 1151.22 342.57 1152.03C342.57 1152.85 342.852 1153.54 343.414 1154.1C343.982 1154.66 344.677 1154.95 345.5 1154.95ZM352.547 1149.23C353.323 1148.45 354.276 1148.06 355.406 1148.06C356.536 1148.06 357.49 1148.45 358.266 1149.23C359.047 1150.01 359.438 1150.97 359.438 1152.11C359.438 1153.25 359.047 1154.21 358.266 1154.99C357.49 1155.77 356.536 1156.16 355.406 1156.16C354.276 1156.16 353.323 1155.77 352.547 1154.99C351.776 1154.21 351.391 1153.25 351.391 1152.11C351.391 1150.97 351.776 1150.01 352.547 1149.23ZM355.406 1149.17C354.599 1149.17 353.919 1149.45 353.367 1150.02C352.815 1150.58 352.539 1151.28 352.539 1152.11C352.539 1152.94 352.815 1153.64 353.367 1154.2C353.919 1154.77 354.599 1155.05 355.406 1155.05C356.214 1155.05 356.896 1154.77 357.453 1154.2C358.01 1153.63 358.289 1152.93 358.289 1152.11C358.289 1151.28 358.01 1150.59 357.453 1150.02C356.901 1149.46 356.219 1149.17 355.406 1149.17Z"
            fill="#818283"
          />
          <path
            d="M209.833 1150.83C209.833 1154.05 207.219 1156.67 203.999 1156.67C200.779 1156.67 198.166 1154.05 198.166 1150.83C198.166 1147.61 200.779 1145 203.999 1145C207.219 1145 209.833 1147.61 209.833 1150.83Z"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M204 1147.33V1150.67"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M202 1143.33H206"
            stroke="#818283"
            stroke-width="1.33"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="718"
            y="1112"
            width="52"
            height="52"
            rx="6"
            fill="#FFB800"
            fill-opacity="0.12"
          />
          <path
            d="M734.633 1145.02C733.767 1145.79 732.663 1146.18 731.322 1146.18C729.981 1146.18 728.874 1145.79 728.002 1145.02C727.136 1144.26 726.703 1143.28 726.703 1142.1C726.703 1141.26 726.964 1140.51 727.484 1139.84C728.005 1139.16 728.682 1138.7 729.516 1138.46C728.858 1138.24 728.318 1137.85 727.895 1137.28C727.471 1136.71 727.26 1136.09 727.26 1135.42C727.26 1134.38 727.641 1133.53 728.402 1132.86C729.171 1132.18 730.144 1131.84 731.322 1131.84C732.501 1131.84 733.471 1132.18 734.232 1132.86C735.001 1133.53 735.385 1134.38 735.385 1135.42C735.385 1136.09 735.17 1136.71 734.74 1137.28C734.317 1137.85 733.777 1138.24 733.119 1138.46C733.952 1138.7 734.63 1139.16 735.15 1139.84C735.678 1140.51 735.941 1141.26 735.941 1142.1C735.941 1143.28 735.505 1144.26 734.633 1145.02ZM729.447 1137.12C729.936 1137.55 730.561 1137.76 731.322 1137.76C732.084 1137.76 732.706 1137.55 733.188 1137.12C733.676 1136.7 733.92 1136.15 733.92 1135.48C733.92 1134.82 733.676 1134.27 733.188 1133.84C732.706 1133.41 732.084 1133.2 731.322 1133.2C730.561 1133.2 729.936 1133.41 729.447 1133.84C728.965 1134.27 728.725 1134.82 728.725 1135.48C728.725 1136.15 728.965 1136.7 729.447 1137.12ZM729.066 1143.99C729.665 1144.52 730.417 1144.78 731.322 1144.78C732.227 1144.78 732.976 1144.52 733.568 1143.99C734.161 1143.46 734.457 1142.8 734.457 1142C734.457 1141.2 734.161 1140.55 733.568 1140.03C732.976 1139.52 732.227 1139.26 731.322 1139.26C730.411 1139.26 729.659 1139.52 729.066 1140.04C728.474 1140.56 728.178 1141.21 728.178 1142C728.178 1142.8 728.474 1143.46 729.066 1143.99ZM747.543 1141.48V1142.86H745.648V1146H744.145V1142.86H737.045V1141.76L742.201 1132H743.9L738.9 1141.48H744.145V1136.68H745.648V1141.48H747.543ZM753.295 1132.61C753.796 1133.15 754.047 1133.82 754.047 1134.64C754.047 1135.46 753.796 1136.15 753.295 1136.69C752.794 1137.23 752.159 1137.5 751.391 1137.5C750.609 1137.5 749.965 1137.23 749.457 1136.69C748.956 1136.15 748.705 1135.46 748.705 1134.64C748.705 1133.82 748.956 1133.15 749.457 1132.61C749.965 1132.07 750.609 1131.8 751.391 1131.8C752.159 1131.8 752.794 1132.07 753.295 1132.61ZM758.607 1132H759.828L750.531 1146H749.311L758.607 1132ZM752.562 1135.98C752.862 1135.64 753.012 1135.19 753.012 1134.64C753.012 1134.1 752.862 1133.65 752.562 1133.3C752.263 1132.95 751.872 1132.78 751.391 1132.78C750.896 1132.78 750.499 1132.95 750.199 1133.3C749.9 1133.65 749.75 1134.1 749.75 1134.64C749.75 1135.19 749.9 1135.64 750.199 1135.98C750.499 1136.33 750.896 1136.5 751.391 1136.5C751.872 1136.5 752.263 1136.33 752.562 1135.98ZM760.404 1143.34C760.404 1144.17 760.154 1144.85 759.652 1145.39C759.158 1145.93 758.523 1146.2 757.748 1146.2C756.967 1146.2 756.326 1145.93 755.824 1145.39C755.323 1144.86 755.072 1144.18 755.072 1143.34C755.072 1142.52 755.323 1141.85 755.824 1141.31C756.326 1140.77 756.967 1140.5 757.748 1140.5C758.516 1140.5 759.151 1140.77 759.652 1141.31C760.154 1141.85 760.404 1142.52 760.404 1143.34ZM759.369 1143.34C759.369 1142.8 759.219 1142.35 758.92 1142.01C758.62 1141.65 758.23 1141.48 757.748 1141.48C757.253 1141.48 756.856 1141.65 756.557 1142.01C756.257 1142.35 756.107 1142.8 756.107 1143.34C756.107 1143.9 756.257 1144.35 756.557 1144.7C756.856 1145.05 757.253 1145.22 757.748 1145.22C758.236 1145.22 758.627 1145.05 758.92 1144.7C759.219 1144.35 759.369 1143.9 759.369 1143.34Z"
            fill="#FFCC00"
          />
          <path
            d="M107.062 1156V1144.8H110.945C111.82 1144.8 112.568 1145.07 113.188 1145.62C113.807 1146.17 114.117 1146.83 114.117 1147.6C114.117 1148.2 113.935 1148.74 113.57 1149.21C113.206 1149.68 112.753 1149.97 112.211 1150.08C112.914 1150.15 113.505 1150.46 113.984 1151C114.469 1151.54 114.711 1152.18 114.711 1152.91C114.711 1153.77 114.391 1154.5 113.75 1155.1C113.115 1155.7 112.341 1156 111.43 1156H107.062ZM108.258 1149.68H110.914C111.466 1149.68 111.935 1149.49 112.32 1149.12C112.706 1148.75 112.898 1148.29 112.898 1147.76C112.898 1147.26 112.703 1146.83 112.312 1146.48C111.927 1146.13 111.461 1145.95 110.914 1145.95H108.258V1149.68ZM108.258 1154.85H111.367C111.971 1154.85 112.474 1154.65 112.875 1154.25C113.276 1153.85 113.477 1153.35 113.477 1152.77C113.477 1152.18 113.273 1151.69 112.867 1151.29C112.466 1150.89 111.971 1150.69 111.383 1150.69H108.258V1154.85ZM122.93 1148.23H124.102V1156H122.93V1154.2C122.643 1154.82 122.227 1155.3 121.68 1155.65C121.138 1155.99 120.5 1156.16 119.766 1156.16C119.062 1156.16 118.414 1155.98 117.82 1155.62C117.232 1155.26 116.766 1154.77 116.422 1154.14C116.078 1153.52 115.906 1152.83 115.906 1152.09C115.906 1151.35 116.078 1150.67 116.422 1150.05C116.766 1149.43 117.232 1148.95 117.82 1148.59C118.414 1148.24 119.062 1148.06 119.766 1148.06C120.5 1148.06 121.141 1148.23 121.688 1148.58C122.234 1148.92 122.648 1149.4 122.93 1150.02V1148.23ZM119.984 1155.05C120.833 1155.05 121.536 1154.78 122.094 1154.22C122.651 1153.66 122.93 1152.95 122.93 1152.09C122.93 1151.24 122.651 1150.54 122.094 1149.98C121.536 1149.43 120.833 1149.15 119.984 1149.15C119.161 1149.15 118.466 1149.43 117.898 1150.01C117.336 1150.58 117.055 1151.28 117.055 1152.09C117.055 1152.93 117.336 1153.63 117.898 1154.2C118.466 1154.77 119.161 1155.05 119.984 1155.05ZM130.164 1148.06C131.169 1148.06 131.966 1148.38 132.555 1149C133.148 1149.62 133.445 1150.46 133.445 1151.52V1156H132.273V1151.63C132.273 1150.89 132.057 1150.29 131.625 1149.84C131.198 1149.4 130.63 1149.17 129.922 1149.17C129.193 1149.17 128.607 1149.4 128.164 1149.85C127.727 1150.3 127.508 1150.89 127.508 1151.63V1156H126.336V1148.23H127.508V1149.74C127.758 1149.21 128.112 1148.8 128.57 1148.51C129.029 1148.21 129.56 1148.06 130.164 1148.06ZM142.242 1148.21H143.414V1155.76C143.414 1156.83 143.052 1157.68 142.328 1158.34C141.604 1158.99 140.674 1159.31 139.539 1159.31C139.091 1159.31 138.656 1159.26 138.234 1159.14C137.812 1159.03 137.419 1158.87 137.055 1158.66C136.695 1158.44 136.401 1158.15 136.172 1157.79C135.948 1157.43 135.828 1157.02 135.812 1156.56H136.945C136.961 1157.09 137.214 1157.52 137.703 1157.84C138.193 1158.16 138.794 1158.32 139.508 1158.32C140.299 1158.32 140.953 1158.09 141.469 1157.62C141.984 1157.15 142.242 1156.55 142.242 1155.8V1154.09C141.956 1154.71 141.539 1155.18 140.992 1155.52C140.451 1155.86 139.812 1156.03 139.078 1156.03C138.375 1156.03 137.727 1155.85 137.133 1155.5C136.544 1155.15 136.078 1154.66 135.734 1154.05C135.391 1153.43 135.219 1152.76 135.219 1152.03C135.219 1151.31 135.391 1150.64 135.734 1150.03C136.078 1149.42 136.544 1148.94 137.133 1148.59C137.727 1148.24 138.375 1148.06 139.078 1148.06C139.812 1148.06 140.451 1148.23 140.992 1148.57C141.539 1148.9 141.956 1149.38 142.242 1149.98V1148.21ZM139.297 1154.95C140.146 1154.95 140.849 1154.67 141.406 1154.12C141.964 1153.57 142.242 1152.88 142.242 1152.03C142.242 1151.2 141.964 1150.51 141.406 1149.96C140.849 1149.41 140.146 1149.13 139.297 1149.13C138.474 1149.13 137.779 1149.41 137.211 1149.98C136.648 1150.53 136.367 1151.22 136.367 1152.03C136.367 1152.85 136.648 1153.54 137.211 1154.1C137.779 1154.66 138.474 1154.95 139.297 1154.95ZM152.211 1148.23H153.383V1156H152.211V1154.2C151.924 1154.82 151.508 1155.3 150.961 1155.65C150.419 1155.99 149.781 1156.16 149.047 1156.16C148.344 1156.16 147.695 1155.98 147.102 1155.62C146.513 1155.26 146.047 1154.77 145.703 1154.14C145.359 1153.52 145.188 1152.83 145.188 1152.09C145.188 1151.35 145.359 1150.67 145.703 1150.05C146.047 1149.43 146.513 1148.95 147.102 1148.59C147.695 1148.24 148.344 1148.06 149.047 1148.06C149.781 1148.06 150.422 1148.23 150.969 1148.58C151.516 1148.92 151.93 1149.4 152.211 1150.02V1148.23ZM149.266 1155.05C150.115 1155.05 150.818 1154.78 151.375 1154.22C151.932 1153.66 152.211 1152.95 152.211 1152.09C152.211 1151.24 151.932 1150.54 151.375 1149.98C150.818 1149.43 150.115 1149.15 149.266 1149.15C148.443 1149.15 147.747 1149.43 147.18 1150.01C146.617 1150.58 146.336 1151.28 146.336 1152.09C146.336 1152.93 146.617 1153.63 147.18 1154.2C147.747 1154.77 148.443 1155.05 149.266 1155.05ZM156.789 1144.8V1156H155.617V1144.8H156.789ZM159.484 1149.23C160.26 1148.45 161.214 1148.06 162.344 1148.06C163.474 1148.06 164.427 1148.45 165.203 1149.23C165.984 1150.01 166.375 1150.97 166.375 1152.11C166.375 1153.25 165.984 1154.21 165.203 1154.99C164.427 1155.77 163.474 1156.16 162.344 1156.16C161.214 1156.16 160.26 1155.77 159.484 1154.99C158.714 1154.21 158.328 1153.25 158.328 1152.11C158.328 1150.97 158.714 1150.01 159.484 1149.23ZM162.344 1149.17C161.536 1149.17 160.857 1149.45 160.305 1150.02C159.753 1150.58 159.477 1151.28 159.477 1152.11C159.477 1152.94 159.753 1153.64 160.305 1154.2C160.857 1154.77 161.536 1155.05 162.344 1155.05C163.151 1155.05 163.833 1154.77 164.391 1154.2C164.948 1153.63 165.227 1152.93 165.227 1152.11C165.227 1151.28 164.948 1150.59 164.391 1150.02C163.839 1149.46 163.156 1149.17 162.344 1149.17ZM171.508 1148.06C171.711 1148.06 171.953 1148.09 172.234 1148.16V1149.25C171.979 1149.16 171.727 1149.12 171.477 1149.12C170.867 1149.12 170.354 1149.33 169.938 1149.77C169.526 1150.19 169.32 1150.73 169.32 1151.39V1156H168.148V1148.23H169.32V1149.47C169.549 1149.03 169.854 1148.69 170.234 1148.44C170.615 1148.19 171.039 1148.06 171.508 1148.06ZM180.32 1151.88C180.32 1152.11 180.315 1152.26 180.305 1152.32H173.789C173.846 1153.15 174.133 1153.83 174.648 1154.34C175.164 1154.85 175.828 1155.1 176.641 1155.1C177.266 1155.1 177.802 1154.96 178.25 1154.68C178.703 1154.39 178.982 1154.01 179.086 1153.54H180.258C180.107 1154.33 179.695 1154.96 179.023 1155.44C178.352 1155.92 177.547 1156.16 176.609 1156.16C175.479 1156.16 174.534 1155.77 173.773 1154.98C173.018 1154.2 172.641 1153.23 172.641 1152.06C172.641 1150.94 173.023 1150 173.789 1149.23C174.555 1148.45 175.49 1148.06 176.594 1148.06C177.286 1148.06 177.917 1148.23 178.484 1148.55C179.052 1148.88 179.5 1149.33 179.828 1149.91C180.156 1150.5 180.32 1151.15 180.32 1151.88ZM173.844 1151.33H179.07C179.013 1150.68 178.75 1150.15 178.281 1149.74C177.818 1149.33 177.24 1149.12 176.547 1149.12C175.859 1149.12 175.271 1149.32 174.781 1149.72C174.292 1150.12 173.979 1150.66 173.844 1151.33Z"
            fill="#4B5563"
          />
          <path
            d="M99.3327 1148.67C99.3327 1152.67 93.9993 1156.67 93.9993 1156.67C93.9993 1156.67 88.666 1152.67 88.666 1148.67C88.666 1147.25 89.2279 1145.89 90.2281 1144.89C91.2283 1143.89 92.5849 1143.33 93.9993 1143.33C95.4138 1143.33 96.7704 1143.89 97.7706 1144.89C98.7708 1145.89 99.3327 1147.25 99.3327 1148.67Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M94 1150.67C95.1046 1150.67 96 1149.77 96 1148.67C96 1147.56 95.1046 1146.67 94 1146.67C92.8954 1146.67 92 1147.56 92 1148.67C92 1149.77 92.8954 1150.67 94 1150.67Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M87.2656 1198.8H93.5234V1199.95H88.4609V1203.44H92.9766V1204.59H88.4609V1208.85H93.5234V1210H87.2656V1198.8ZM101.992 1210H100.602L98.375 1206.95L96.1484 1210H94.7734L97.6875 1205.98L94.9531 1202.23H96.3438L98.3906 1205.04L100.422 1202.23H101.797L99.0781 1205.98L101.992 1210ZM107.797 1202.06C108.5 1202.06 109.146 1202.24 109.734 1202.6C110.328 1202.96 110.797 1203.45 111.141 1204.07C111.484 1204.69 111.656 1205.37 111.656 1206.11C111.656 1206.85 111.484 1207.53 111.141 1208.16C110.797 1208.78 110.328 1209.27 109.734 1209.62C109.146 1209.98 108.5 1210.16 107.797 1210.16C107.062 1210.16 106.422 1209.99 105.875 1209.65C105.333 1209.3 104.919 1208.82 104.633 1208.2V1212.93H103.461V1202.23H104.633V1204.02C104.914 1203.4 105.328 1202.92 105.875 1202.58C106.422 1202.23 107.062 1202.06 107.797 1202.06ZM107.578 1209.05C108.401 1209.05 109.094 1208.77 109.656 1208.2C110.219 1207.64 110.5 1206.94 110.5 1206.11C110.5 1205.28 110.219 1204.58 109.656 1204.01C109.094 1203.43 108.401 1203.15 107.578 1203.15C106.729 1203.15 106.026 1203.43 105.469 1203.99C104.911 1204.55 104.633 1205.26 104.633 1206.11C104.633 1206.96 104.911 1207.66 105.469 1208.22C106.026 1208.78 106.729 1209.05 107.578 1209.05ZM120.398 1205.88C120.398 1206.11 120.393 1206.26 120.383 1206.32H113.867C113.924 1207.15 114.211 1207.83 114.727 1208.34C115.242 1208.85 115.906 1209.1 116.719 1209.1C117.344 1209.1 117.88 1208.96 118.328 1208.68C118.781 1208.39 119.06 1208.01 119.164 1207.54H120.336C120.185 1208.33 119.773 1208.96 119.102 1209.44C118.43 1209.92 117.625 1210.16 116.688 1210.16C115.557 1210.16 114.612 1209.77 113.852 1208.98C113.096 1208.2 112.719 1207.23 112.719 1206.06C112.719 1204.94 113.102 1204 113.867 1203.23C114.633 1202.45 115.568 1202.06 116.672 1202.06C117.365 1202.06 117.995 1202.23 118.562 1202.55C119.13 1202.88 119.578 1203.33 119.906 1203.91C120.234 1204.5 120.398 1205.15 120.398 1205.88ZM113.922 1205.33H119.148C119.091 1204.68 118.828 1204.15 118.359 1203.74C117.896 1203.33 117.318 1203.12 116.625 1203.12C115.938 1203.12 115.349 1203.32 114.859 1203.72C114.37 1204.12 114.057 1204.66 113.922 1205.33ZM125.555 1202.06C125.758 1202.06 126 1202.09 126.281 1202.16V1203.25C126.026 1203.16 125.773 1203.12 125.523 1203.12C124.914 1203.12 124.401 1203.33 123.984 1203.77C123.573 1204.19 123.367 1204.73 123.367 1205.39V1210H122.195V1202.23H123.367V1203.47C123.596 1203.03 123.901 1202.69 124.281 1202.44C124.661 1202.19 125.086 1202.06 125.555 1202.06ZM128.383 1198.83C128.607 1198.83 128.805 1198.91 128.977 1199.08C129.148 1199.24 129.234 1199.44 129.234 1199.66C129.234 1199.89 129.148 1200.09 128.977 1200.27C128.805 1200.43 128.607 1200.52 128.383 1200.52C128.154 1200.52 127.958 1200.43 127.797 1200.27C127.635 1200.1 127.555 1199.9 127.555 1199.66C127.555 1199.44 127.635 1199.24 127.797 1199.08C127.958 1198.91 128.154 1198.83 128.383 1198.83ZM127.789 1202.23H128.961V1210H127.789V1202.23ZM138.414 1205.88C138.414 1206.11 138.409 1206.26 138.398 1206.32H131.883C131.94 1207.15 132.227 1207.83 132.742 1208.34C133.258 1208.85 133.922 1209.1 134.734 1209.1C135.359 1209.1 135.896 1208.96 136.344 1208.68C136.797 1208.39 137.076 1208.01 137.18 1207.54H138.352C138.201 1208.33 137.789 1208.96 137.117 1209.44C136.445 1209.92 135.641 1210.16 134.703 1210.16C133.573 1210.16 132.628 1209.77 131.867 1208.98C131.112 1208.2 130.734 1207.23 130.734 1206.06C130.734 1204.94 131.117 1204 131.883 1203.23C132.648 1202.45 133.583 1202.06 134.688 1202.06C135.38 1202.06 136.01 1202.23 136.578 1202.55C137.146 1202.88 137.594 1203.33 137.922 1203.91C138.25 1204.5 138.414 1205.15 138.414 1205.88ZM131.938 1205.33H137.164C137.107 1204.68 136.844 1204.15 136.375 1203.74C135.911 1203.33 135.333 1203.12 134.641 1203.12C133.953 1203.12 133.365 1203.32 132.875 1203.72C132.385 1204.12 132.073 1204.66 131.938 1205.33ZM144.039 1202.06C145.044 1202.06 145.841 1202.38 146.43 1203C147.023 1203.62 147.32 1204.46 147.32 1205.52V1210H146.148V1205.63C146.148 1204.89 145.932 1204.29 145.5 1203.84C145.073 1203.4 144.505 1203.17 143.797 1203.17C143.068 1203.17 142.482 1203.4 142.039 1203.85C141.602 1204.3 141.383 1204.89 141.383 1205.63V1210H140.211V1202.23H141.383V1203.74C141.633 1203.21 141.987 1202.8 142.445 1202.51C142.904 1202.21 143.435 1202.06 144.039 1202.06ZM153.109 1210.16C151.979 1210.16 151.026 1209.77 150.25 1208.99C149.479 1208.21 149.094 1207.25 149.094 1206.11C149.094 1204.97 149.479 1204.01 150.25 1203.23C151.026 1202.45 151.979 1202.06 153.109 1202.06C153.99 1202.06 154.773 1202.32 155.461 1202.84C156.148 1203.35 156.565 1203.99 156.711 1204.77H155.523C155.393 1204.3 155.102 1203.92 154.648 1203.62C154.195 1203.32 153.682 1203.17 153.109 1203.17C152.302 1203.17 151.622 1203.45 151.07 1204.02C150.518 1204.58 150.242 1205.28 150.242 1206.11C150.242 1206.94 150.518 1207.64 151.07 1208.2C151.622 1208.77 152.302 1209.05 153.109 1209.05C153.688 1209.05 154.206 1208.9 154.664 1208.59C155.128 1208.27 155.414 1207.87 155.523 1207.38H156.711C156.591 1208.19 156.185 1208.85 155.492 1209.38C154.805 1209.9 154.01 1210.16 153.109 1210.16ZM165.555 1205.88C165.555 1206.11 165.549 1206.26 165.539 1206.32H159.023C159.081 1207.15 159.367 1207.83 159.883 1208.34C160.398 1208.85 161.062 1209.1 161.875 1209.1C162.5 1209.1 163.036 1208.96 163.484 1208.68C163.938 1208.39 164.216 1208.01 164.32 1207.54H165.492C165.341 1208.33 164.93 1208.96 164.258 1209.44C163.586 1209.92 162.781 1210.16 161.844 1210.16C160.714 1210.16 159.768 1209.77 159.008 1208.98C158.253 1208.2 157.875 1207.23 157.875 1206.06C157.875 1204.94 158.258 1204 159.023 1203.23C159.789 1202.45 160.724 1202.06 161.828 1202.06C162.521 1202.06 163.151 1202.23 163.719 1202.55C164.286 1202.88 164.734 1203.33 165.062 1203.91C165.391 1204.5 165.555 1205.15 165.555 1205.88ZM159.078 1205.33H164.305C164.247 1204.68 163.984 1204.15 163.516 1203.74C163.052 1203.33 162.474 1203.12 161.781 1203.12C161.094 1203.12 160.505 1203.32 160.016 1203.72C159.526 1204.12 159.214 1204.66 159.078 1205.33Z"
            fill="#A8A8A8"
          />
          <path
            d="M95.7188 1230.38V1231.48H94.2031V1234H93V1231.48H87.3203V1230.61L91.4453 1222.8H92.8047L88.8047 1230.38H93V1226.55H94.2031V1230.38H95.7188ZM100.305 1222.8H101.773L105.039 1227.76L108.258 1222.8H109.68L105.633 1228.98V1234H104.414V1228.98L100.305 1222.8ZM116.273 1229.88C116.273 1230.11 116.268 1230.26 116.258 1230.32H109.742C109.799 1231.15 110.086 1231.83 110.602 1232.34C111.117 1232.85 111.781 1233.1 112.594 1233.1C113.219 1233.1 113.755 1232.96 114.203 1232.68C114.656 1232.39 114.935 1232.01 115.039 1231.54H116.211C116.06 1232.33 115.648 1232.96 114.977 1233.44C114.305 1233.92 113.5 1234.16 112.562 1234.16C111.432 1234.16 110.487 1233.77 109.727 1232.98C108.971 1232.2 108.594 1231.23 108.594 1230.06C108.594 1228.94 108.977 1228 109.742 1227.23C110.508 1226.45 111.443 1226.06 112.547 1226.06C113.24 1226.06 113.87 1226.23 114.438 1226.55C115.005 1226.88 115.453 1227.33 115.781 1227.91C116.109 1228.5 116.273 1229.15 116.273 1229.88ZM109.797 1229.33H115.023C114.966 1228.68 114.703 1228.15 114.234 1227.74C113.771 1227.33 113.193 1227.12 112.5 1227.12C111.812 1227.12 111.224 1227.32 110.734 1227.72C110.245 1228.12 109.932 1228.66 109.797 1229.33ZM124.383 1226.23H125.555V1234H124.383V1232.2C124.096 1232.82 123.68 1233.3 123.133 1233.65C122.591 1233.99 121.953 1234.16 121.219 1234.16C120.516 1234.16 119.867 1233.98 119.273 1233.62C118.685 1233.26 118.219 1232.77 117.875 1232.14C117.531 1231.52 117.359 1230.83 117.359 1230.09C117.359 1229.35 117.531 1228.67 117.875 1228.05C118.219 1227.43 118.685 1226.95 119.273 1226.59C119.867 1226.24 120.516 1226.06 121.219 1226.06C121.953 1226.06 122.594 1226.23 123.141 1226.58C123.688 1226.92 124.102 1227.4 124.383 1228.02V1226.23ZM121.438 1233.05C122.286 1233.05 122.99 1232.78 123.547 1232.22C124.104 1231.66 124.383 1230.95 124.383 1230.09C124.383 1229.24 124.104 1228.54 123.547 1227.98C122.99 1227.43 122.286 1227.15 121.438 1227.15C120.615 1227.15 119.919 1227.43 119.352 1228.01C118.789 1228.58 118.508 1229.28 118.508 1230.09C118.508 1230.93 118.789 1231.63 119.352 1232.2C119.919 1232.77 120.615 1233.05 121.438 1233.05ZM131.148 1226.06C131.352 1226.06 131.594 1226.09 131.875 1226.16V1227.25C131.62 1227.16 131.367 1227.12 131.117 1227.12C130.508 1227.12 129.995 1227.33 129.578 1227.77C129.167 1228.19 128.961 1228.73 128.961 1229.39V1234H127.789V1226.23H128.961V1227.47C129.19 1227.03 129.495 1226.69 129.875 1226.44C130.255 1226.19 130.68 1226.06 131.148 1226.06ZM135.727 1234.16C134.852 1234.16 134.128 1233.93 133.555 1233.49C132.982 1233.05 132.656 1232.45 132.578 1231.7H133.695C133.747 1232.14 133.956 1232.49 134.32 1232.76C134.685 1233.02 135.138 1233.15 135.68 1233.15C136.221 1233.15 136.656 1233.03 136.984 1232.78C137.318 1232.53 137.484 1232.21 137.484 1231.82C137.484 1231.56 137.417 1231.34 137.281 1231.16C137.146 1230.98 136.966 1230.85 136.742 1230.76C136.523 1230.67 136.273 1230.59 135.992 1230.52C135.711 1230.44 135.422 1230.38 135.125 1230.34C134.828 1230.29 134.539 1230.22 134.258 1230.12C133.977 1230.02 133.724 1229.9 133.5 1229.77C133.281 1229.62 133.104 1229.43 132.969 1229.17C132.833 1228.91 132.766 1228.6 132.766 1228.24C132.766 1227.6 133.018 1227.08 133.523 1226.67C134.029 1226.27 134.698 1226.06 135.531 1226.06C136.297 1226.06 136.956 1226.27 137.508 1226.67C138.065 1227.07 138.388 1227.61 138.477 1228.29H137.297C137.24 1227.92 137.044 1227.62 136.711 1227.39C136.378 1227.16 135.974 1227.04 135.5 1227.04C135.026 1227.04 134.641 1227.14 134.344 1227.35C134.052 1227.55 133.906 1227.82 133.906 1228.16C133.906 1228.44 133.992 1228.67 134.164 1228.84C134.341 1229.02 134.568 1229.15 134.844 1229.23C135.12 1229.32 135.424 1229.39 135.758 1229.45C136.096 1229.51 136.432 1229.58 136.766 1229.67C137.104 1229.76 137.411 1229.88 137.688 1230.02C137.964 1230.17 138.188 1230.39 138.359 1230.69C138.536 1230.98 138.625 1231.35 138.625 1231.79C138.625 1232.48 138.349 1233.04 137.797 1233.49C137.25 1233.93 136.56 1234.16 135.727 1234.16Z"
            fill="#4B5563"
          />
          <path
            d="M270.547 1222.8V1234H269.328V1224.46L266.75 1226.67V1225.19L269.664 1222.8H270.547ZM275.859 1234.16C274.88 1234.16 274.042 1233.89 273.344 1233.34C272.646 1232.8 272.253 1232.09 272.164 1231.2H273.367C273.482 1231.73 273.766 1232.17 274.219 1232.5C274.677 1232.83 275.224 1232.99 275.859 1232.99C276.568 1232.99 277.167 1232.76 277.656 1232.28C278.146 1231.8 278.391 1231.22 278.391 1230.53C278.391 1229.81 278.146 1229.21 277.656 1228.71C277.167 1228.22 276.568 1227.97 275.859 1227.97C275.427 1227.97 275.023 1228.04 274.648 1228.18C274.279 1228.32 273.984 1228.51 273.766 1228.77H272.727L273.25 1222.8H278.93V1223.94H274.328L273.953 1227.63C274.182 1227.42 274.482 1227.25 274.852 1227.13C275.227 1227.01 275.612 1226.95 276.008 1226.95C277.039 1226.95 277.898 1227.28 278.586 1227.96C279.273 1228.63 279.617 1229.49 279.617 1230.55C279.617 1231.55 279.253 1232.41 278.523 1233.11C277.794 1233.81 276.906 1234.16 275.859 1234.16ZM288.812 1222.8C289.578 1222.8 290.299 1222.94 290.977 1223.22C291.659 1223.49 292.245 1223.88 292.734 1224.37C293.224 1224.85 293.609 1225.44 293.891 1226.13C294.177 1226.82 294.32 1227.56 294.32 1228.35C294.32 1229.14 294.177 1229.89 293.891 1230.59C293.609 1231.29 293.224 1231.89 292.734 1232.39C292.245 1232.89 291.659 1233.28 290.977 1233.57C290.299 1233.86 289.578 1234 288.812 1234H285.344V1222.8H288.812ZM288.875 1232.85C290.073 1232.85 291.07 1232.42 291.867 1231.57C292.669 1230.71 293.07 1229.64 293.07 1228.35C293.07 1227.08 292.672 1226.02 291.875 1225.2C291.083 1224.37 290.083 1223.95 288.875 1223.95H286.539V1232.85H288.875ZM302.555 1226.23H303.727V1234H302.555V1232.2C302.268 1232.82 301.852 1233.3 301.305 1233.65C300.763 1233.99 300.125 1234.16 299.391 1234.16C298.688 1234.16 298.039 1233.98 297.445 1233.62C296.857 1233.26 296.391 1232.77 296.047 1232.14C295.703 1231.52 295.531 1230.83 295.531 1230.09C295.531 1229.35 295.703 1228.67 296.047 1228.05C296.391 1227.43 296.857 1226.95 297.445 1226.59C298.039 1226.24 298.688 1226.06 299.391 1226.06C300.125 1226.06 300.766 1226.23 301.312 1226.58C301.859 1226.92 302.273 1227.4 302.555 1228.02V1226.23ZM299.609 1233.05C300.458 1233.05 301.161 1232.78 301.719 1232.22C302.276 1231.66 302.555 1230.95 302.555 1230.09C302.555 1229.24 302.276 1228.54 301.719 1227.98C301.161 1227.43 300.458 1227.15 299.609 1227.15C298.786 1227.15 298.091 1227.43 297.523 1228.01C296.961 1228.58 296.68 1229.28 296.68 1230.09C296.68 1230.93 296.961 1231.63 297.523 1232.2C298.091 1232.77 298.786 1233.05 299.609 1233.05ZM311.484 1226.23H312.734L308.234 1236.95H306.984L308.328 1233.86L305.117 1226.23H306.383L308.922 1232.49L311.484 1226.23ZM316.57 1234.16C315.695 1234.16 314.971 1233.93 314.398 1233.49C313.826 1233.05 313.5 1232.45 313.422 1231.7H314.539C314.591 1232.14 314.799 1232.49 315.164 1232.76C315.529 1233.02 315.982 1233.15 316.523 1233.15C317.065 1233.15 317.5 1233.03 317.828 1232.78C318.161 1232.53 318.328 1232.21 318.328 1231.82C318.328 1231.56 318.26 1231.34 318.125 1231.16C317.99 1230.98 317.81 1230.85 317.586 1230.76C317.367 1230.67 317.117 1230.59 316.836 1230.52C316.555 1230.44 316.266 1230.38 315.969 1230.34C315.672 1230.29 315.383 1230.22 315.102 1230.12C314.82 1230.02 314.568 1229.9 314.344 1229.77C314.125 1229.62 313.948 1229.43 313.812 1229.17C313.677 1228.91 313.609 1228.6 313.609 1228.24C313.609 1227.6 313.862 1227.08 314.367 1226.67C314.872 1226.27 315.542 1226.06 316.375 1226.06C317.141 1226.06 317.799 1226.27 318.352 1226.67C318.909 1227.07 319.232 1227.61 319.32 1228.29H318.141C318.083 1227.92 317.888 1227.62 317.555 1227.39C317.221 1227.16 316.818 1227.04 316.344 1227.04C315.87 1227.04 315.484 1227.14 315.188 1227.35C314.896 1227.55 314.75 1227.82 314.75 1228.16C314.75 1228.44 314.836 1228.67 315.008 1228.84C315.185 1229.02 315.411 1229.15 315.688 1229.23C315.964 1229.32 316.268 1229.39 316.602 1229.45C316.94 1229.51 317.276 1229.58 317.609 1229.67C317.948 1229.76 318.255 1229.88 318.531 1230.02C318.807 1230.17 319.031 1230.39 319.203 1230.69C319.38 1230.98 319.469 1231.35 319.469 1231.79C319.469 1232.48 319.193 1233.04 318.641 1233.49C318.094 1233.93 317.404 1234.16 316.57 1234.16Z"
            fill="#4B5563"
          />
          <path
            d="M266.266 1198.8H267.398L273.672 1207.79V1198.8H274.891V1210H273.766L267.461 1201.02V1210H266.266V1198.8ZM277.969 1203.23C278.745 1202.45 279.698 1202.06 280.828 1202.06C281.958 1202.06 282.911 1202.45 283.688 1203.23C284.469 1204.01 284.859 1204.97 284.859 1206.11C284.859 1207.25 284.469 1208.21 283.688 1208.99C282.911 1209.77 281.958 1210.16 280.828 1210.16C279.698 1210.16 278.745 1209.77 277.969 1208.99C277.198 1208.21 276.812 1207.25 276.812 1206.11C276.812 1204.97 277.198 1204.01 277.969 1203.23ZM280.828 1203.17C280.021 1203.17 279.341 1203.45 278.789 1204.02C278.237 1204.58 277.961 1205.28 277.961 1206.11C277.961 1206.94 278.237 1207.64 278.789 1208.2C279.341 1208.77 280.021 1209.05 280.828 1209.05C281.635 1209.05 282.318 1208.77 282.875 1208.2C283.432 1207.63 283.711 1206.93 283.711 1206.11C283.711 1205.28 283.432 1204.59 282.875 1204.02C282.323 1203.46 281.641 1203.17 280.828 1203.17ZM290.336 1203.31H288.164V1207.38C288.164 1208.45 288.708 1208.99 289.797 1208.99C290.016 1208.99 290.195 1208.97 290.336 1208.93V1210C290.102 1210.05 289.852 1210.08 289.586 1210.08C288.773 1210.08 288.138 1209.85 287.68 1209.41C287.221 1208.95 286.992 1208.28 286.992 1207.39V1203.31H285.461V1202.23H286.992V1200.08H288.164V1202.23H290.336V1203.31ZM292.555 1198.83C292.779 1198.83 292.977 1198.91 293.148 1199.08C293.32 1199.24 293.406 1199.44 293.406 1199.66C293.406 1199.89 293.32 1200.09 293.148 1200.27C292.977 1200.43 292.779 1200.52 292.555 1200.52C292.326 1200.52 292.13 1200.43 291.969 1200.27C291.807 1200.1 291.727 1199.9 291.727 1199.66C291.727 1199.44 291.807 1199.24 291.969 1199.08C292.13 1198.91 292.326 1198.83 292.555 1198.83ZM291.961 1202.23H293.133V1210H291.961V1202.23ZM298.922 1210.16C297.792 1210.16 296.839 1209.77 296.062 1208.99C295.292 1208.21 294.906 1207.25 294.906 1206.11C294.906 1204.97 295.292 1204.01 296.062 1203.23C296.839 1202.45 297.792 1202.06 298.922 1202.06C299.802 1202.06 300.586 1202.32 301.273 1202.84C301.961 1203.35 302.378 1203.99 302.523 1204.77H301.336C301.206 1204.3 300.914 1203.92 300.461 1203.62C300.008 1203.32 299.495 1203.17 298.922 1203.17C298.115 1203.17 297.435 1203.45 296.883 1204.02C296.331 1204.58 296.055 1205.28 296.055 1206.11C296.055 1206.94 296.331 1207.64 296.883 1208.2C297.435 1208.77 298.115 1209.05 298.922 1209.05C299.5 1209.05 300.018 1208.9 300.477 1208.59C300.94 1208.27 301.227 1207.87 301.336 1207.38H302.523C302.404 1208.19 301.997 1208.85 301.305 1209.38C300.617 1209.9 299.823 1210.16 298.922 1210.16ZM311.367 1205.88C311.367 1206.11 311.362 1206.26 311.352 1206.32H304.836C304.893 1207.15 305.18 1207.83 305.695 1208.34C306.211 1208.85 306.875 1209.1 307.688 1209.1C308.312 1209.1 308.849 1208.96 309.297 1208.68C309.75 1208.39 310.029 1208.01 310.133 1207.54H311.305C311.154 1208.33 310.742 1208.96 310.07 1209.44C309.398 1209.92 308.594 1210.16 307.656 1210.16C306.526 1210.16 305.581 1209.77 304.82 1208.98C304.065 1208.2 303.688 1207.23 303.688 1206.06C303.688 1204.94 304.07 1204 304.836 1203.23C305.602 1202.45 306.536 1202.06 307.641 1202.06C308.333 1202.06 308.964 1202.23 309.531 1202.55C310.099 1202.88 310.547 1203.33 310.875 1203.91C311.203 1204.5 311.367 1205.15 311.367 1205.88ZM304.891 1205.33H310.117C310.06 1204.68 309.797 1204.15 309.328 1203.74C308.865 1203.33 308.286 1203.12 307.594 1203.12C306.906 1203.12 306.318 1203.32 305.828 1203.72C305.339 1204.12 305.026 1204.66 304.891 1205.33ZM321.477 1198.8C322.419 1198.8 323.206 1199.11 323.836 1199.73C324.471 1200.34 324.789 1201.1 324.789 1202.02C324.789 1202.94 324.471 1203.71 323.836 1204.33C323.206 1204.94 322.419 1205.25 321.477 1205.25H318.367V1210H317.172V1198.8H321.477ZM321.477 1204.09C322.07 1204.09 322.568 1203.9 322.969 1203.5C323.37 1203.1 323.57 1202.6 323.57 1202.02C323.57 1201.43 323.37 1200.94 322.969 1200.55C322.568 1200.15 322.07 1199.95 321.477 1199.95H318.367V1204.09H321.477ZM333.055 1205.88C333.055 1206.11 333.049 1206.26 333.039 1206.32H326.523C326.581 1207.15 326.867 1207.83 327.383 1208.34C327.898 1208.85 328.562 1209.1 329.375 1209.1C330 1209.1 330.536 1208.96 330.984 1208.68C331.438 1208.39 331.716 1208.01 331.82 1207.54H332.992C332.841 1208.33 332.43 1208.96 331.758 1209.44C331.086 1209.92 330.281 1210.16 329.344 1210.16C328.214 1210.16 327.268 1209.77 326.508 1208.98C325.753 1208.2 325.375 1207.23 325.375 1206.06C325.375 1204.94 325.758 1204 326.523 1203.23C327.289 1202.45 328.224 1202.06 329.328 1202.06C330.021 1202.06 330.651 1202.23 331.219 1202.55C331.786 1202.88 332.234 1203.33 332.562 1203.91C332.891 1204.5 333.055 1205.15 333.055 1205.88ZM326.578 1205.33H331.805C331.747 1204.68 331.484 1204.15 331.016 1203.74C330.552 1203.33 329.974 1203.12 329.281 1203.12C328.594 1203.12 328.005 1203.32 327.516 1203.72C327.026 1204.12 326.714 1204.66 326.578 1205.33ZM338.211 1202.06C338.414 1202.06 338.656 1202.09 338.938 1202.16V1203.25C338.682 1203.16 338.43 1203.12 338.18 1203.12C337.57 1203.12 337.057 1203.33 336.641 1203.77C336.229 1204.19 336.023 1204.73 336.023 1205.39V1210H334.852V1202.23H336.023V1203.47C336.253 1203.03 336.557 1202.69 336.938 1202.44C337.318 1202.19 337.742 1202.06 338.211 1202.06ZM341.039 1198.83C341.263 1198.83 341.461 1198.91 341.633 1199.08C341.805 1199.24 341.891 1199.44 341.891 1199.66C341.891 1199.89 341.805 1200.09 341.633 1200.27C341.461 1200.43 341.263 1200.52 341.039 1200.52C340.81 1200.52 340.615 1200.43 340.453 1200.27C340.292 1200.1 340.211 1199.9 340.211 1199.66C340.211 1199.44 340.292 1199.24 340.453 1199.08C340.615 1198.91 340.81 1198.83 341.039 1198.83ZM340.445 1202.23H341.617V1210H340.445V1202.23ZM344.547 1203.23C345.323 1202.45 346.276 1202.06 347.406 1202.06C348.536 1202.06 349.49 1202.45 350.266 1203.23C351.047 1204.01 351.438 1204.97 351.438 1206.11C351.438 1207.25 351.047 1208.21 350.266 1208.99C349.49 1209.77 348.536 1210.16 347.406 1210.16C346.276 1210.16 345.323 1209.77 344.547 1208.99C343.776 1208.21 343.391 1207.25 343.391 1206.11C343.391 1204.97 343.776 1204.01 344.547 1203.23ZM347.406 1203.17C346.599 1203.17 345.919 1203.45 345.367 1204.02C344.815 1204.58 344.539 1205.28 344.539 1206.11C344.539 1206.94 344.815 1207.64 345.367 1208.2C345.919 1208.77 346.599 1209.05 347.406 1209.05C348.214 1209.05 348.896 1208.77 349.453 1208.2C350.01 1207.63 350.289 1206.93 350.289 1206.11C350.289 1205.28 350.01 1204.59 349.453 1204.02C348.901 1203.46 348.219 1203.17 347.406 1203.17ZM359.523 1198.8H360.695V1210H359.523V1208.2C359.237 1208.82 358.82 1209.3 358.273 1209.65C357.732 1209.99 357.094 1210.16 356.359 1210.16C355.656 1210.16 355.008 1209.98 354.414 1209.62C353.826 1209.26 353.359 1208.77 353.016 1208.14C352.672 1207.52 352.5 1206.83 352.5 1206.09C352.5 1205.35 352.672 1204.67 353.016 1204.05C353.359 1203.43 353.826 1202.95 354.414 1202.59C355.008 1202.24 355.656 1202.06 356.359 1202.06C357.094 1202.06 357.734 1202.23 358.281 1202.58C358.828 1202.92 359.242 1203.4 359.523 1204.02V1198.8ZM356.578 1209.05C357.427 1209.05 358.13 1208.78 358.688 1208.22C359.245 1207.66 359.523 1206.95 359.523 1206.09C359.523 1205.24 359.245 1204.54 358.688 1203.98C358.13 1203.43 357.427 1203.15 356.578 1203.15C355.755 1203.15 355.06 1203.43 354.492 1204.01C353.93 1204.58 353.648 1205.28 353.648 1206.09C353.648 1206.93 353.93 1207.63 354.492 1208.2C355.06 1208.77 355.755 1209.05 356.578 1209.05Z"
            fill="#A8A8A8"
          />
          <path
            d="M665.883 1227.57L669.125 1223.95H663.656V1222.8H670.82V1223.65L667.367 1227.42C668.008 1227.34 668.602 1227.42 669.148 1227.67C669.695 1227.92 670.128 1228.29 670.445 1228.8C670.763 1229.3 670.922 1229.88 670.922 1230.52C670.922 1231.58 670.562 1232.45 669.844 1233.13C669.13 1233.82 668.219 1234.16 667.109 1234.16C666.109 1234.16 665.26 1233.88 664.562 1233.34C663.87 1232.79 663.471 1232.08 663.367 1231.2H664.57C664.68 1231.74 664.961 1232.17 665.414 1232.5C665.867 1232.83 666.432 1232.99 667.109 1232.99C667.854 1232.99 668.466 1232.76 668.945 1232.29C669.43 1231.82 669.672 1231.21 669.672 1230.48C669.672 1230.05 669.57 1229.67 669.367 1229.34C669.164 1229 668.888 1228.75 668.539 1228.58C668.19 1228.41 667.786 1228.3 667.328 1228.26C666.87 1228.22 666.388 1228.27 665.883 1228.41V1227.57ZM675.641 1234.16C674.661 1234.16 673.823 1233.89 673.125 1233.34C672.427 1232.8 672.034 1232.09 671.945 1231.2H673.148C673.263 1231.73 673.547 1232.17 674 1232.5C674.458 1232.83 675.005 1232.99 675.641 1232.99C676.349 1232.99 676.948 1232.76 677.438 1232.28C677.927 1231.8 678.172 1231.22 678.172 1230.53C678.172 1229.81 677.927 1229.21 677.438 1228.71C676.948 1228.22 676.349 1227.97 675.641 1227.97C675.208 1227.97 674.805 1228.04 674.43 1228.18C674.06 1228.32 673.766 1228.51 673.547 1228.77H672.508L673.031 1222.8H678.711V1223.94H674.109L673.734 1227.63C673.964 1227.42 674.263 1227.25 674.633 1227.13C675.008 1227.01 675.393 1226.95 675.789 1226.95C676.82 1226.95 677.68 1227.28 678.367 1227.96C679.055 1228.63 679.398 1229.49 679.398 1230.55C679.398 1231.55 679.034 1232.41 678.305 1233.11C677.576 1233.81 676.688 1234.16 675.641 1234.16ZM685.125 1222.8H686.32V1232.85H691.984V1234H685.125V1222.8ZM698.148 1222.8C699.091 1222.8 699.878 1223.11 700.508 1223.73C701.143 1224.34 701.461 1225.1 701.461 1226.02C701.461 1226.94 701.143 1227.71 700.508 1228.33C699.878 1228.94 699.091 1229.25 698.148 1229.25H695.039V1234H693.844V1222.8H698.148ZM698.148 1228.09C698.742 1228.09 699.24 1227.9 699.641 1227.5C700.042 1227.1 700.242 1226.6 700.242 1226.02C700.242 1225.43 700.042 1224.94 699.641 1224.55C699.24 1224.15 698.742 1223.95 698.148 1223.95H695.039V1228.09H698.148ZM709.367 1234L708.281 1231.27H702.984L701.891 1234H700.617L705.094 1222.8H706.18L710.68 1234H709.367ZM703.445 1230.11H707.828L705.641 1224.58L703.445 1230.11Z"
            fill="#4B5563"
          />
          <path
            d="M663.266 1198.8H669.523V1199.95H664.461V1203.44H668.977V1204.59H664.461V1208.85H669.523V1210H663.266V1198.8ZM677.992 1210H676.602L674.375 1206.95L672.148 1210H670.773L673.688 1205.98L670.953 1202.23H672.344L674.391 1205.04L676.422 1202.23H677.797L675.078 1205.98L677.992 1210ZM683.797 1202.06C684.5 1202.06 685.146 1202.24 685.734 1202.6C686.328 1202.96 686.797 1203.45 687.141 1204.07C687.484 1204.69 687.656 1205.37 687.656 1206.11C687.656 1206.85 687.484 1207.53 687.141 1208.16C686.797 1208.78 686.328 1209.27 685.734 1209.62C685.146 1209.98 684.5 1210.16 683.797 1210.16C683.062 1210.16 682.422 1209.99 681.875 1209.65C681.333 1209.3 680.919 1208.82 680.633 1208.2V1212.93H679.461V1202.23H680.633V1204.02C680.914 1203.4 681.328 1202.92 681.875 1202.58C682.422 1202.23 683.062 1202.06 683.797 1202.06ZM683.578 1209.05C684.401 1209.05 685.094 1208.77 685.656 1208.2C686.219 1207.64 686.5 1206.94 686.5 1206.11C686.5 1205.28 686.219 1204.58 685.656 1204.01C685.094 1203.43 684.401 1203.15 683.578 1203.15C682.729 1203.15 682.026 1203.43 681.469 1203.99C680.911 1204.55 680.633 1205.26 680.633 1206.11C680.633 1206.96 680.911 1207.66 681.469 1208.22C682.026 1208.78 682.729 1209.05 683.578 1209.05ZM696.398 1205.88C696.398 1206.11 696.393 1206.26 696.383 1206.32H689.867C689.924 1207.15 690.211 1207.83 690.727 1208.34C691.242 1208.85 691.906 1209.1 692.719 1209.1C693.344 1209.1 693.88 1208.96 694.328 1208.68C694.781 1208.39 695.06 1208.01 695.164 1207.54H696.336C696.185 1208.33 695.773 1208.96 695.102 1209.44C694.43 1209.92 693.625 1210.16 692.688 1210.16C691.557 1210.16 690.612 1209.77 689.852 1208.98C689.096 1208.2 688.719 1207.23 688.719 1206.06C688.719 1204.94 689.102 1204 689.867 1203.23C690.633 1202.45 691.568 1202.06 692.672 1202.06C693.365 1202.06 693.995 1202.23 694.562 1202.55C695.13 1202.88 695.578 1203.33 695.906 1203.91C696.234 1204.5 696.398 1205.15 696.398 1205.88ZM689.922 1205.33H695.148C695.091 1204.68 694.828 1204.15 694.359 1203.74C693.896 1203.33 693.318 1203.12 692.625 1203.12C691.938 1203.12 691.349 1203.32 690.859 1203.72C690.37 1204.12 690.057 1204.66 689.922 1205.33ZM701.5 1210.16C700.37 1210.16 699.417 1209.77 698.641 1208.99C697.87 1208.21 697.484 1207.25 697.484 1206.11C697.484 1204.97 697.87 1204.01 698.641 1203.23C699.417 1202.45 700.37 1202.06 701.5 1202.06C702.38 1202.06 703.164 1202.32 703.852 1202.84C704.539 1203.35 704.956 1203.99 705.102 1204.77H703.914C703.784 1204.3 703.492 1203.92 703.039 1203.62C702.586 1203.32 702.073 1203.17 701.5 1203.17C700.693 1203.17 700.013 1203.45 699.461 1204.02C698.909 1204.58 698.633 1205.28 698.633 1206.11C698.633 1206.94 698.909 1207.64 699.461 1208.2C700.013 1208.77 700.693 1209.05 701.5 1209.05C702.078 1209.05 702.596 1208.9 703.055 1208.59C703.518 1208.27 703.805 1207.87 703.914 1207.38H705.102C704.982 1208.19 704.576 1208.85 703.883 1209.38C703.195 1209.9 702.401 1210.16 701.5 1210.16ZM710.883 1203.31H708.711V1207.38C708.711 1208.45 709.255 1208.99 710.344 1208.99C710.562 1208.99 710.742 1208.97 710.883 1208.93V1210C710.648 1210.05 710.398 1210.08 710.133 1210.08C709.32 1210.08 708.685 1209.85 708.227 1209.41C707.768 1208.95 707.539 1208.28 707.539 1207.39V1203.31H706.008V1202.23H707.539V1200.08H708.711V1202.23H710.883V1203.31ZM719.211 1205.88C719.211 1206.11 719.206 1206.26 719.195 1206.32H712.68C712.737 1207.15 713.023 1207.83 713.539 1208.34C714.055 1208.85 714.719 1209.1 715.531 1209.1C716.156 1209.1 716.693 1208.96 717.141 1208.68C717.594 1208.39 717.872 1208.01 717.977 1207.54H719.148C718.997 1208.33 718.586 1208.96 717.914 1209.44C717.242 1209.92 716.438 1210.16 715.5 1210.16C714.37 1210.16 713.424 1209.77 712.664 1208.98C711.909 1208.2 711.531 1207.23 711.531 1206.06C711.531 1204.94 711.914 1204 712.68 1203.23C713.445 1202.45 714.38 1202.06 715.484 1202.06C716.177 1202.06 716.807 1202.23 717.375 1202.55C717.943 1202.88 718.391 1203.33 718.719 1203.91C719.047 1204.5 719.211 1205.15 719.211 1205.88ZM712.734 1205.33H717.961C717.904 1204.68 717.641 1204.15 717.172 1203.74C716.708 1203.33 716.13 1203.12 715.438 1203.12C714.75 1203.12 714.161 1203.32 713.672 1203.72C713.182 1204.12 712.87 1204.66 712.734 1205.33ZM727.32 1198.8H728.492V1210H727.32V1208.2C727.034 1208.82 726.617 1209.3 726.07 1209.65C725.529 1209.99 724.891 1210.16 724.156 1210.16C723.453 1210.16 722.805 1209.98 722.211 1209.62C721.622 1209.26 721.156 1208.77 720.812 1208.14C720.469 1207.52 720.297 1206.83 720.297 1206.09C720.297 1205.35 720.469 1204.67 720.812 1204.05C721.156 1203.43 721.622 1202.95 722.211 1202.59C722.805 1202.24 723.453 1202.06 724.156 1202.06C724.891 1202.06 725.531 1202.23 726.078 1202.58C726.625 1202.92 727.039 1203.4 727.32 1204.02V1198.8ZM724.375 1209.05C725.224 1209.05 725.927 1208.78 726.484 1208.22C727.042 1207.66 727.32 1206.95 727.32 1206.09C727.32 1205.24 727.042 1204.54 726.484 1203.98C725.927 1203.43 725.224 1203.15 724.375 1203.15C723.552 1203.15 722.857 1203.43 722.289 1204.01C721.727 1204.58 721.445 1205.28 721.445 1206.09C721.445 1206.93 721.727 1207.63 722.289 1208.2C722.857 1208.77 723.552 1209.05 724.375 1209.05ZM739.82 1210.16C738.789 1210.16 737.846 1209.9 736.992 1209.4C736.143 1208.89 735.474 1208.19 734.984 1207.3C734.495 1206.42 734.25 1205.44 734.25 1204.37C734.25 1203.57 734.393 1202.82 734.68 1202.11C734.971 1201.4 735.365 1200.79 735.859 1200.29C736.354 1199.78 736.945 1199.38 737.633 1199.09C738.32 1198.79 739.049 1198.64 739.82 1198.64C741.06 1198.64 742.156 1199 743.109 1199.71C744.062 1200.42 744.646 1201.33 744.859 1202.43H743.531C743.318 1201.65 742.865 1201.02 742.172 1200.54C741.484 1200.05 740.701 1199.8 739.82 1199.8C739.023 1199.8 738.294 1200.01 737.633 1200.41C736.971 1200.8 736.451 1201.35 736.07 1202.05C735.69 1202.75 735.5 1203.52 735.5 1204.37C735.5 1205.22 735.69 1206 736.07 1206.71C736.451 1207.42 736.971 1207.98 737.633 1208.38C738.294 1208.79 739.023 1208.99 739.82 1208.99C740.727 1208.99 741.523 1208.74 742.211 1208.23C742.904 1207.72 743.349 1207.05 743.547 1206.23H744.891C744.651 1207.39 744.06 1208.34 743.117 1209.07C742.18 1209.79 741.081 1210.16 739.82 1210.16ZM754.242 1198.8V1199.95H750.562V1210H749.359V1199.95H745.68V1198.8H754.242ZM759.82 1210.16C758.789 1210.16 757.846 1209.9 756.992 1209.4C756.143 1208.89 755.474 1208.19 754.984 1207.3C754.495 1206.42 754.25 1205.44 754.25 1204.37C754.25 1203.57 754.393 1202.82 754.68 1202.11C754.971 1201.4 755.365 1200.79 755.859 1200.29C756.354 1199.78 756.945 1199.38 757.633 1199.09C758.32 1198.79 759.049 1198.64 759.82 1198.64C761.06 1198.64 762.156 1199 763.109 1199.71C764.062 1200.42 764.646 1201.33 764.859 1202.43H763.531C763.318 1201.65 762.865 1201.02 762.172 1200.54C761.484 1200.05 760.701 1199.8 759.82 1199.8C759.023 1199.8 758.294 1200.01 757.633 1200.41C756.971 1200.8 756.451 1201.35 756.07 1202.05C755.69 1202.75 755.5 1203.52 755.5 1204.37C755.5 1205.22 755.69 1206 756.07 1206.71C756.451 1207.42 756.971 1207.98 757.633 1208.38C758.294 1208.79 759.023 1208.99 759.82 1208.99C760.727 1208.99 761.523 1208.74 762.211 1208.23C762.904 1207.72 763.349 1207.05 763.547 1206.23H764.891C764.651 1207.39 764.06 1208.34 763.117 1209.07C762.18 1209.79 761.081 1210.16 759.82 1210.16Z"
            fill="#A8A8A8"
          />
          <path
            d="M461.703 1234V1233.1L466.008 1228.8C466.586 1228.21 467.013 1227.69 467.289 1227.23C467.565 1226.78 467.703 1226.33 467.703 1225.91C467.703 1225.3 467.49 1224.79 467.062 1224.4C466.635 1224 466.096 1223.8 465.445 1223.8C464.69 1223.8 464.078 1224.03 463.609 1224.49C463.146 1224.95 462.922 1225.57 462.938 1226.34H461.734C461.714 1225.6 461.865 1224.95 462.188 1224.38C462.51 1223.82 462.956 1223.38 463.523 1223.09C464.096 1222.79 464.742 1222.64 465.461 1222.64C466.466 1222.64 467.297 1222.95 467.953 1223.55C468.609 1224.16 468.938 1224.93 468.938 1225.88C468.938 1226.99 468.25 1228.22 466.875 1229.54L463.594 1232.83H469.078V1234H461.703ZM474.406 1234.16C473.141 1234.16 472.148 1233.64 471.43 1232.62C470.716 1231.59 470.359 1230.18 470.359 1228.4C470.359 1226.61 470.716 1225.21 471.43 1224.18C472.148 1223.15 473.141 1222.64 474.406 1222.64C475.667 1222.64 476.654 1223.15 477.367 1224.18C478.081 1225.21 478.438 1226.61 478.438 1228.4C478.438 1230.18 478.081 1231.59 477.367 1232.62C476.654 1233.64 475.667 1234.16 474.406 1234.16ZM474.406 1232.99C475.292 1232.99 475.979 1232.59 476.469 1231.8C476.964 1231 477.211 1229.87 477.211 1228.4C477.211 1226.93 476.964 1225.8 476.469 1225C475.979 1224.2 475.292 1223.8 474.406 1223.8C473.516 1223.8 472.826 1224.2 472.336 1225C471.852 1225.79 471.609 1226.92 471.609 1228.4C471.609 1229.87 471.852 1231.01 472.336 1231.8C472.826 1232.6 473.516 1232.99 474.406 1232.99ZM484.297 1222.8H485.492V1232.85H491.156V1234H484.297V1222.8ZM497.32 1222.8C498.263 1222.8 499.049 1223.11 499.68 1223.73C500.315 1224.34 500.633 1225.1 500.633 1226.02C500.633 1226.94 500.315 1227.71 499.68 1228.33C499.049 1228.94 498.263 1229.25 497.32 1229.25H494.211V1234H493.016V1222.8H497.32ZM497.32 1228.09C497.914 1228.09 498.411 1227.9 498.812 1227.5C499.214 1227.1 499.414 1226.6 499.414 1226.02C499.414 1225.43 499.214 1224.94 498.812 1224.55C498.411 1224.15 497.914 1223.95 497.32 1223.95H494.211V1228.09H497.32ZM508.539 1234L507.453 1231.27H502.156L501.062 1234H499.789L504.266 1222.8H505.352L509.852 1234H508.539ZM502.617 1230.11H507L504.812 1224.58L502.617 1230.11Z"
            fill="#4B5563"
          />
          <path
            d="M466.352 1210.16C465.32 1210.16 464.378 1209.9 463.523 1209.4C462.674 1208.89 462.005 1208.19 461.516 1207.3C461.026 1206.42 460.781 1205.44 460.781 1204.37C460.781 1203.57 460.924 1202.82 461.211 1202.11C461.503 1201.4 461.896 1200.79 462.391 1200.29C462.885 1199.78 463.477 1199.38 464.164 1199.09C464.852 1198.79 465.581 1198.64 466.352 1198.64C467.591 1198.64 468.688 1199 469.641 1199.71C470.594 1200.42 471.177 1201.33 471.391 1202.43H470.062C469.849 1201.65 469.396 1201.02 468.703 1200.54C468.016 1200.05 467.232 1199.8 466.352 1199.8C465.555 1199.8 464.826 1200.01 464.164 1200.41C463.503 1200.8 462.982 1201.35 462.602 1202.05C462.221 1202.75 462.031 1203.52 462.031 1204.37C462.031 1205.22 462.221 1206 462.602 1206.71C462.982 1207.42 463.503 1207.98 464.164 1208.38C464.826 1208.79 465.555 1208.99 466.352 1208.99C467.258 1208.99 468.055 1208.74 468.742 1208.23C469.435 1207.72 469.88 1207.05 470.078 1206.23H471.422C471.182 1207.39 470.591 1208.34 469.648 1209.07C468.711 1209.79 467.612 1210.16 466.352 1210.16ZM479.102 1202.23H480.273V1210H479.102V1208.49C478.852 1209.02 478.497 1209.43 478.039 1209.72C477.586 1210.01 477.055 1210.16 476.445 1210.16C475.445 1210.16 474.648 1209.84 474.055 1209.22C473.461 1208.59 473.164 1207.76 473.164 1206.7V1202.23H474.336V1206.58C474.336 1207.33 474.549 1207.93 474.977 1208.38C475.404 1208.83 475.974 1209.05 476.688 1209.05C477.422 1209.05 478.008 1208.83 478.445 1208.38C478.883 1207.93 479.102 1207.33 479.102 1206.58V1202.23ZM485.867 1202.06C486.07 1202.06 486.312 1202.09 486.594 1202.16V1203.25C486.339 1203.16 486.086 1203.12 485.836 1203.12C485.227 1203.12 484.714 1203.33 484.297 1203.77C483.885 1204.19 483.68 1204.73 483.68 1205.39V1210H482.508V1202.23H483.68V1203.47C483.909 1203.03 484.214 1202.69 484.594 1202.44C484.974 1202.19 485.398 1202.06 485.867 1202.06ZM491.461 1202.06C491.664 1202.06 491.906 1202.09 492.188 1202.16V1203.25C491.932 1203.16 491.68 1203.12 491.43 1203.12C490.82 1203.12 490.307 1203.33 489.891 1203.77C489.479 1204.19 489.273 1204.73 489.273 1205.39V1210H488.102V1202.23H489.273V1203.47C489.503 1203.03 489.807 1202.69 490.188 1202.44C490.568 1202.19 490.992 1202.06 491.461 1202.06ZM500.273 1205.88C500.273 1206.11 500.268 1206.26 500.258 1206.32H493.742C493.799 1207.15 494.086 1207.83 494.602 1208.34C495.117 1208.85 495.781 1209.1 496.594 1209.1C497.219 1209.1 497.755 1208.96 498.203 1208.68C498.656 1208.39 498.935 1208.01 499.039 1207.54H500.211C500.06 1208.33 499.648 1208.96 498.977 1209.44C498.305 1209.92 497.5 1210.16 496.562 1210.16C495.432 1210.16 494.487 1209.77 493.727 1208.98C492.971 1208.2 492.594 1207.23 492.594 1206.06C492.594 1204.94 492.977 1204 493.742 1203.23C494.508 1202.45 495.443 1202.06 496.547 1202.06C497.24 1202.06 497.87 1202.23 498.438 1202.55C499.005 1202.88 499.453 1203.33 499.781 1203.91C500.109 1204.5 500.273 1205.15 500.273 1205.88ZM493.797 1205.33H499.023C498.966 1204.68 498.703 1204.15 498.234 1203.74C497.771 1203.33 497.193 1203.12 496.5 1203.12C495.812 1203.12 495.224 1203.32 494.734 1203.72C494.245 1204.12 493.932 1204.66 493.797 1205.33ZM505.898 1202.06C506.904 1202.06 507.701 1202.38 508.289 1203C508.883 1203.62 509.18 1204.46 509.18 1205.52V1210H508.008V1205.63C508.008 1204.89 507.792 1204.29 507.359 1203.84C506.932 1203.4 506.365 1203.17 505.656 1203.17C504.927 1203.17 504.341 1203.4 503.898 1203.85C503.461 1204.3 503.242 1204.89 503.242 1205.63V1210H502.07V1202.23H503.242V1203.74C503.492 1203.21 503.846 1202.8 504.305 1202.51C504.763 1202.21 505.294 1202.06 505.898 1202.06ZM514.977 1203.31H512.805V1207.38C512.805 1208.45 513.349 1208.99 514.438 1208.99C514.656 1208.99 514.836 1208.97 514.977 1208.93V1210C514.742 1210.05 514.492 1210.08 514.227 1210.08C513.414 1210.08 512.779 1209.85 512.32 1209.41C511.862 1208.95 511.633 1208.28 511.633 1207.39V1203.31H510.102V1202.23H511.633V1200.08H512.805V1202.23H514.977V1203.31ZM525.695 1210.16C524.664 1210.16 523.721 1209.9 522.867 1209.4C522.018 1208.89 521.349 1208.19 520.859 1207.3C520.37 1206.42 520.125 1205.44 520.125 1204.37C520.125 1203.57 520.268 1202.82 520.555 1202.11C520.846 1201.4 521.24 1200.79 521.734 1200.29C522.229 1199.78 522.82 1199.38 523.508 1199.09C524.195 1198.79 524.924 1198.64 525.695 1198.64C526.935 1198.64 528.031 1199 528.984 1199.71C529.938 1200.42 530.521 1201.33 530.734 1202.43H529.406C529.193 1201.65 528.74 1201.02 528.047 1200.54C527.359 1200.05 526.576 1199.8 525.695 1199.8C524.898 1199.8 524.169 1200.01 523.508 1200.41C522.846 1200.8 522.326 1201.35 521.945 1202.05C521.565 1202.75 521.375 1203.52 521.375 1204.37C521.375 1205.22 521.565 1206 521.945 1206.71C522.326 1207.42 522.846 1207.98 523.508 1208.38C524.169 1208.79 524.898 1208.99 525.695 1208.99C526.602 1208.99 527.398 1208.74 528.086 1208.23C528.779 1207.72 529.224 1207.05 529.422 1206.23H530.766C530.526 1207.39 529.935 1208.34 528.992 1209.07C528.055 1209.79 526.956 1210.16 525.695 1210.16ZM540.117 1198.8V1199.95H536.438V1210H535.234V1199.95H531.555V1198.8H540.117ZM545.695 1210.16C544.664 1210.16 543.721 1209.9 542.867 1209.4C542.018 1208.89 541.349 1208.19 540.859 1207.3C540.37 1206.42 540.125 1205.44 540.125 1204.37C540.125 1203.57 540.268 1202.82 540.555 1202.11C540.846 1201.4 541.24 1200.79 541.734 1200.29C542.229 1199.78 542.82 1199.38 543.508 1199.09C544.195 1198.79 544.924 1198.64 545.695 1198.64C546.935 1198.64 548.031 1199 548.984 1199.71C549.938 1200.42 550.521 1201.33 550.734 1202.43H549.406C549.193 1201.65 548.74 1201.02 548.047 1200.54C547.359 1200.05 546.576 1199.8 545.695 1199.8C544.898 1199.8 544.169 1200.01 543.508 1200.41C542.846 1200.8 542.326 1201.35 541.945 1202.05C541.565 1202.75 541.375 1203.52 541.375 1204.37C541.375 1205.22 541.565 1206 541.945 1206.71C542.326 1207.42 542.846 1207.98 543.508 1208.38C544.169 1208.79 544.898 1208.99 545.695 1208.99C546.602 1208.99 547.398 1208.74 548.086 1208.23C548.779 1207.72 549.224 1207.05 549.422 1206.23H550.766C550.526 1207.39 549.935 1208.34 548.992 1209.07C548.055 1209.79 546.956 1210.16 545.695 1210.16Z"
            fill="#A8A8A8"
          />
          <path
            d="M31 1265H799V1332C799 1335.31 796.314 1338 793 1338H37C33.6863 1338 31 1335.31 31 1332V1265Z"
            fill="white"
          />
          <rect
            x="635.5"
            y="1282.5"
            width="37"
            height="37"
            rx="18.5"
            stroke="#0F47F2"
          />
          <path
            d="M654 1289L657 1297.14L666 1301L657 1304L654 1313L651 1304L642 1301L651 1297.14L654 1289Z"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="1282.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="1282.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            stroke="#0F47F2"
            stroke-width="0.5"
          />
          <path
            d="M551.814 1308.18C550.502 1308.18 549.415 1307.79 548.554 1307.02C547.698 1306.25 547.271 1305.28 547.271 1304.1H548.606C548.606 1304.92 548.908 1305.59 549.512 1306.12C550.115 1306.64 550.883 1306.9 551.814 1306.9C552.693 1306.9 553.42 1306.69 553.994 1306.26C554.568 1305.83 554.855 1305.27 554.855 1304.6C554.855 1304.25 554.785 1303.94 554.645 1303.67C554.51 1303.4 554.322 1303.18 554.082 1303.02C553.848 1302.85 553.572 1302.7 553.256 1302.57C552.945 1302.43 552.611 1302.32 552.254 1302.23C551.902 1302.15 551.539 1302.06 551.164 1301.95C550.789 1301.85 550.423 1301.75 550.065 1301.65C549.714 1301.54 549.38 1301.4 549.063 1301.22C548.753 1301.05 548.478 1300.85 548.237 1300.63C548.003 1300.4 547.815 1300.12 547.675 1299.76C547.54 1299.41 547.473 1299.01 547.473 1298.57C547.473 1297.6 547.862 1296.8 548.642 1296.17C549.427 1295.54 550.417 1295.22 551.612 1295.22C552.896 1295.22 553.915 1295.57 554.671 1296.27C555.427 1296.96 555.805 1297.83 555.805 1298.88H554.425C554.396 1298.19 554.117 1297.62 553.59 1297.18C553.068 1296.74 552.397 1296.51 551.577 1296.51C550.757 1296.51 550.089 1296.7 549.573 1297.08C549.063 1297.46 548.809 1297.96 548.809 1298.57C548.809 1298.92 548.894 1299.23 549.063 1299.48C549.233 1299.74 549.459 1299.95 549.74 1300.1C550.027 1300.25 550.355 1300.39 550.725 1300.5C551.094 1300.61 551.483 1300.72 551.894 1300.82C552.304 1300.91 552.711 1301.02 553.115 1301.13C553.525 1301.24 553.915 1301.38 554.284 1301.57C554.653 1301.75 554.979 1301.96 555.26 1302.22C555.547 1302.46 555.775 1302.79 555.945 1303.2C556.115 1303.61 556.2 1304.07 556.2 1304.6C556.2 1305.64 555.784 1306.49 554.952 1307.17C554.126 1307.84 553.08 1308.18 551.814 1308.18ZM562.607 1299.07C563.738 1299.07 564.635 1299.42 565.297 1300.12C565.965 1300.82 566.299 1301.77 566.299 1302.96V1308H564.98V1303.09C564.98 1302.25 564.737 1301.58 564.251 1301.07C563.771 1300.57 563.132 1300.32 562.335 1300.32C561.515 1300.32 560.855 1300.57 560.357 1301.08C559.865 1301.59 559.619 1302.25 559.619 1303.09V1308H558.301V1295.4H559.619V1300.96C559.9 1300.36 560.299 1299.9 560.814 1299.57C561.33 1299.24 561.928 1299.07 562.607 1299.07ZM569.595 1300.39C570.468 1299.51 571.54 1299.07 572.812 1299.07C574.083 1299.07 575.155 1299.51 576.028 1300.39C576.907 1301.26 577.347 1302.34 577.347 1303.62C577.347 1304.91 576.907 1305.99 576.028 1306.87C575.155 1307.74 574.083 1308.18 572.812 1308.18C571.54 1308.18 570.468 1307.74 569.595 1306.87C568.728 1305.99 568.294 1304.91 568.294 1303.62C568.294 1302.34 568.728 1301.26 569.595 1300.39ZM572.812 1300.32C571.903 1300.32 571.139 1300.63 570.518 1301.27C569.896 1301.9 569.586 1302.69 569.586 1303.62C569.586 1304.55 569.896 1305.34 570.518 1305.98C571.139 1306.62 571.903 1306.94 572.812 1306.94C573.72 1306.94 574.487 1306.62 575.114 1305.98C575.741 1305.33 576.055 1304.55 576.055 1303.62C576.055 1302.69 575.741 1301.91 575.114 1301.28C574.493 1300.64 573.726 1300.32 572.812 1300.32ZM583.121 1299.07C583.35 1299.07 583.622 1299.11 583.938 1299.18V1300.41C583.651 1300.31 583.367 1300.26 583.086 1300.26C582.4 1300.26 581.823 1300.5 581.354 1300.99C580.892 1301.47 580.66 1302.08 580.66 1302.81V1308H579.342V1299.25H580.66V1300.65C580.918 1300.16 581.261 1299.77 581.688 1299.49C582.116 1299.21 582.594 1299.07 583.121 1299.07ZM590.188 1300.48H587.744V1305.05C587.744 1306.26 588.356 1306.87 589.581 1306.87C589.827 1306.87 590.029 1306.84 590.188 1306.8V1308C589.924 1308.06 589.643 1308.09 589.344 1308.09C588.43 1308.09 587.715 1307.84 587.199 1307.33C586.684 1306.82 586.426 1306.07 586.426 1305.06V1300.48H584.703V1299.25H586.426V1296.84H587.744V1299.25H590.188V1300.48ZM593.334 1295.4V1308H592.016V1295.4H593.334ZM596.516 1295.43C596.768 1295.43 596.99 1295.53 597.184 1295.71C597.377 1295.9 597.474 1296.12 597.474 1296.37C597.474 1296.63 597.377 1296.86 597.184 1297.05C596.99 1297.24 596.768 1297.33 596.516 1297.33C596.258 1297.33 596.038 1297.24 595.856 1297.05C595.675 1296.86 595.584 1296.64 595.584 1296.37C595.584 1296.12 595.675 1295.9 595.856 1295.71C596.038 1295.53 596.258 1295.43 596.516 1295.43ZM595.848 1299.25H597.166V1308H595.848V1299.25ZM602.562 1308.18C601.578 1308.18 600.764 1307.93 600.119 1307.43C599.475 1306.93 599.108 1306.26 599.021 1305.41H600.277C600.336 1305.91 600.57 1306.3 600.98 1306.6C601.391 1306.9 601.9 1307.04 602.51 1307.04C603.119 1307.04 603.608 1306.9 603.978 1306.63C604.353 1306.35 604.54 1305.99 604.54 1305.55C604.54 1305.25 604.464 1305.01 604.312 1304.81C604.159 1304.6 603.957 1304.45 603.705 1304.35C603.459 1304.25 603.178 1304.16 602.861 1304.08C602.545 1304 602.22 1303.93 601.886 1303.88C601.552 1303.83 601.227 1303.74 600.91 1303.63C600.594 1303.52 600.31 1303.39 600.058 1303.24C599.812 1303.08 599.612 1302.86 599.46 1302.57C599.308 1302.28 599.231 1301.93 599.231 1301.52C599.231 1300.8 599.516 1300.21 600.084 1299.76C600.652 1299.3 601.405 1299.07 602.343 1299.07C603.204 1299.07 603.945 1299.3 604.566 1299.76C605.193 1300.21 605.557 1300.81 605.656 1301.58H604.329C604.265 1301.17 604.045 1300.83 603.67 1300.56C603.295 1300.3 602.841 1300.17 602.308 1300.17C601.774 1300.17 601.341 1300.29 601.007 1300.52C600.679 1300.75 600.515 1301.05 600.515 1301.43C600.515 1301.74 600.611 1302 600.805 1302.2C601.004 1302.4 601.259 1302.54 601.569 1302.64C601.88 1302.73 602.223 1302.81 602.598 1302.88C602.979 1302.95 603.356 1303.03 603.731 1303.13C604.112 1303.23 604.458 1303.36 604.769 1303.53C605.079 1303.69 605.331 1303.94 605.524 1304.27C605.724 1304.61 605.823 1305.02 605.823 1305.51C605.823 1306.29 605.513 1306.92 604.892 1307.43C604.276 1307.93 603.5 1308.18 602.562 1308.18ZM612.09 1300.48H609.646V1305.05C609.646 1306.26 610.259 1306.87 611.483 1306.87C611.729 1306.87 611.932 1306.84 612.09 1306.8V1308C611.826 1308.06 611.545 1308.09 611.246 1308.09C610.332 1308.09 609.617 1307.84 609.102 1307.33C608.586 1306.82 608.328 1306.07 608.328 1305.06V1300.48H606.605V1299.25H608.328V1296.84H609.646V1299.25H612.09V1300.48Z"
            fill="#F5F9FB"
          />
          <circle cx="702" cy="1301" r="18.5" stroke="#818283" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M695.328 1292.91C695.34 1292.91 695.352 1292.91 695.365 1292.91L708.672 1292.91C709.031 1292.91 709.36 1292.91 709.628 1292.95C709.922 1292.99 710.234 1293.08 710.49 1293.34C710.747 1293.59 710.84 1293.9 710.879 1294.2C710.915 1294.47 710.915 1294.79 710.915 1295.15V1295.23C710.915 1295.59 710.915 1295.92 710.879 1296.18C710.84 1296.48 710.747 1296.79 710.49 1297.05C710.247 1297.29 709.953 1297.39 709.671 1297.43V1301.87C709.671 1303.4 709.671 1304.6 709.544 1305.55C709.414 1306.52 709.138 1307.31 708.517 1307.93C707.897 1308.55 707.11 1308.83 706.137 1308.96C705.193 1309.08 703.985 1309.08 702.461 1309.08H701.538C700.014 1309.08 698.807 1309.08 697.862 1308.96C696.89 1308.83 696.103 1308.55 695.482 1307.93C694.861 1307.31 694.586 1306.52 694.455 1305.55C694.328 1304.6 694.328 1303.4 694.328 1301.87V1297.43C694.046 1297.39 693.753 1297.29 693.509 1297.05C693.253 1296.79 693.16 1296.48 693.12 1296.18C693.084 1295.92 693.084 1295.59 693.084 1295.23C693.084 1295.22 693.084 1295.2 693.084 1295.19C693.084 1295.18 693.084 1295.17 693.084 1295.15C693.084 1294.79 693.084 1294.47 693.12 1294.2C693.16 1293.9 693.253 1293.59 693.509 1293.34C693.765 1293.08 694.077 1292.99 694.372 1292.95C694.64 1292.91 694.969 1292.91 695.328 1292.91ZM695.572 1297.47V1301.83C695.572 1303.41 695.573 1304.53 695.688 1305.38C695.8 1306.22 696.011 1306.7 696.362 1307.05C696.713 1307.4 697.193 1307.61 698.028 1307.72C698.88 1307.84 700.004 1307.84 701.585 1307.84H702.414C703.996 1307.84 705.119 1307.84 705.972 1307.72C706.806 1307.61 707.287 1307.4 707.638 1307.05C707.989 1306.7 708.199 1306.22 708.311 1305.38C708.426 1304.53 708.427 1303.41 708.427 1301.83V1297.47H695.572ZM694.389 1294.21L694.391 1294.21C694.392 1294.21 694.395 1294.21 694.399 1294.21C694.417 1294.2 694.458 1294.19 694.538 1294.18C694.712 1294.16 694.956 1294.15 695.365 1294.15H708.635C709.043 1294.15 709.287 1294.16 709.462 1294.18C709.542 1294.19 709.582 1294.2 709.6 1294.21C709.604 1294.21 709.607 1294.21 709.609 1294.21L709.611 1294.21L709.612 1294.22C709.613 1294.22 709.614 1294.22 709.616 1294.23C709.623 1294.24 709.636 1294.28 709.646 1294.36C709.67 1294.54 709.671 1294.78 709.671 1295.19C709.671 1295.6 709.67 1295.84 709.646 1296.02C709.636 1296.1 709.623 1296.14 709.616 1296.16C709.614 1296.16 709.613 1296.16 709.612 1296.16L709.611 1296.17L709.609 1296.17C709.607 1296.17 709.604 1296.17 709.6 1296.17C709.582 1296.18 709.542 1296.19 709.462 1296.2C709.287 1296.23 709.043 1296.23 708.635 1296.23H695.365C694.956 1296.23 694.712 1296.23 694.538 1296.2C694.458 1296.19 694.417 1296.18 694.399 1296.17C694.395 1296.17 694.392 1296.17 694.391 1296.17L694.389 1296.17L694.388 1296.16C694.387 1296.16 694.385 1296.16 694.384 1296.16C694.376 1296.14 694.364 1296.1 694.353 1296.02C694.329 1295.84 694.328 1295.6 694.328 1295.19C694.328 1294.78 694.329 1294.54 694.353 1294.36C694.364 1294.28 694.376 1294.24 694.384 1294.23C694.385 1294.22 694.387 1294.22 694.388 1294.22L694.389 1294.21ZM694.389 1296.17C694.388 1296.17 694.389 1296.17 694.389 1296.17V1296.17ZM700.738 1299.13H703.262C703.439 1299.13 703.603 1299.13 703.74 1299.14C703.887 1299.15 704.049 1299.17 704.214 1299.24C704.569 1299.39 704.852 1299.67 704.999 1300.03C705.067 1300.19 705.09 1300.35 705.1 1300.5C705.11 1300.64 705.11 1300.8 705.11 1300.98V1301.01C705.11 1301.19 705.11 1301.36 705.1 1301.49C705.09 1301.64 705.067 1301.8 704.999 1301.97C704.852 1302.32 704.569 1302.6 704.214 1302.75C704.049 1302.82 703.887 1302.84 703.74 1302.85C703.603 1302.86 703.439 1302.86 703.262 1302.86H700.738C700.56 1302.86 700.397 1302.86 700.259 1302.85C700.112 1302.84 699.95 1302.82 699.786 1302.75C699.43 1302.6 699.147 1302.32 699 1301.97C698.932 1301.8 698.909 1301.64 698.899 1301.49C698.89 1301.36 698.89 1301.19 698.89 1301.01V1300.98C698.89 1300.8 698.89 1300.64 698.899 1300.5C698.909 1300.35 698.932 1300.19 699 1300.03C699.147 1299.67 699.43 1299.39 699.786 1299.24C699.95 1299.17 700.112 1299.15 700.259 1299.14C700.397 1299.13 700.56 1299.13 700.738 1299.13ZM700.259 1300.39C700.21 1300.41 700.171 1300.45 700.15 1300.5C700.149 1300.51 700.144 1300.53 700.14 1300.59C700.134 1300.67 700.134 1300.79 700.134 1301C700.134 1301.2 700.134 1301.32 700.14 1301.41C700.144 1301.46 700.149 1301.49 700.15 1301.49C700.171 1301.54 700.21 1301.58 700.259 1301.6C700.265 1301.6 700.289 1301.61 700.344 1301.61C700.434 1301.62 700.554 1301.62 700.756 1301.62H703.244C703.445 1301.62 703.566 1301.62 703.655 1301.61C703.711 1301.61 703.734 1301.6 703.74 1301.6C703.789 1301.58 703.828 1301.54 703.849 1301.49C703.85 1301.49 703.856 1301.46 703.859 1301.41C703.865 1301.32 703.866 1301.2 703.866 1301C703.866 1300.79 703.865 1300.67 703.859 1300.59C703.856 1300.53 703.85 1300.51 703.849 1300.5C703.828 1300.45 703.789 1300.41 703.74 1300.39C703.734 1300.39 703.711 1300.38 703.655 1300.38C703.566 1300.37 703.445 1300.37 703.244 1300.37H700.756C700.554 1300.37 700.434 1300.37 700.344 1300.38C700.289 1300.38 700.265 1300.39 700.259 1300.39Z"
            fill="#818283"
          />
          <circle cx="750" cy="1301" r="18.5" stroke="#818283" />
          <path
            d="M751.77 1295.06L752.465 1294.36C753.617 1293.21 755.484 1293.21 756.636 1294.36C757.788 1295.52 757.788 1297.38 756.636 1298.53L755.941 1299.23M751.77 1295.06C751.77 1295.06 751.857 1296.54 753.16 1297.84C754.464 1299.14 755.941 1299.23 755.941 1299.23M751.77 1295.06L745.379 1301.45C744.946 1301.88 744.73 1302.1 744.544 1302.34C744.324 1302.62 744.136 1302.92 743.982 1303.25C743.852 1303.52 743.755 1303.81 743.562 1304.39L742.741 1306.85M755.941 1299.23L749.55 1305.62C749.117 1306.05 748.901 1306.27 748.662 1306.46C748.381 1306.68 748.076 1306.86 747.754 1307.02C747.481 1307.15 747.19 1307.24 746.609 1307.44L744.148 1308.26M742.741 1306.85L742.541 1307.45C742.446 1307.74 742.52 1308.05 742.733 1308.27C742.946 1308.48 743.261 1308.55 743.547 1308.46L744.148 1308.26M742.741 1306.85L744.148 1308.26"
            stroke="#818283"
          />
          <g clip-path="url(#clip6_4500_3993)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M144.5 1287C152.508 1287 159 1293.66 159 1301.87C159 1308.43 154.85 1314 149.092 1315.97C148.357 1316.12 148.096 1315.65 148.096 1315.26C148.096 1314.77 148.113 1313.17 148.113 1311.18C148.113 1309.79 147.649 1308.89 147.129 1308.43C150.358 1308.06 153.751 1306.8 153.751 1301.09C153.751 1299.47 153.188 1298.14 152.257 1297.1C152.408 1296.72 152.906 1295.21 152.115 1293.17C152.115 1293.17 150.9 1292.77 148.132 1294.69C146.974 1294.36 145.733 1294.19 144.5 1294.19C143.268 1294.19 142.028 1294.36 140.871 1294.69C138.1 1292.77 136.882 1293.17 136.882 1293.17C136.094 1295.21 136.592 1296.72 136.741 1297.1C135.815 1298.14 135.248 1299.47 135.248 1301.09C135.248 1306.79 138.633 1308.06 141.854 1308.44C141.439 1308.81 141.064 1309.46 140.933 1310.43C140.107 1310.81 138.007 1311.46 136.713 1309.19C136.713 1309.19 135.946 1307.76 134.491 1307.66C134.491 1307.66 133.077 1307.64 134.392 1308.56C134.392 1308.56 135.342 1309.02 136.002 1310.74C136.002 1310.74 136.853 1313.39 140.887 1312.49C140.894 1313.73 140.907 1314.9 140.907 1315.26C140.907 1315.65 140.64 1316.11 139.917 1315.97C134.154 1314.01 130 1308.44 130 1301.87C130 1293.66 136.493 1287 144.5 1287Z"
              fill="#4B5563"
            />
          </g>
          <g clip-path="url(#clip7_4500_3993)">
            <path
              d="M100.5 1287C92.491 1287 86 1293.49 86 1301.5C86 1309.51 92.491 1316 100.5 1316C108.509 1316 115 1309.51 115 1301.5C115 1293.49 108.509 1287 100.5 1287ZM96.4445 1307.57H93.6182V1298.52H96.4445V1307.57ZM94.9549 1297.39H94.9322C93.907 1297.39 93.2443 1296.7 93.2443 1295.82C93.2443 1294.92 93.9297 1294.25 94.9719 1294.25C96.0141 1294.25 96.6541 1294.92 96.6768 1295.82C96.6824 1296.69 96.0197 1297.39 94.9549 1297.39ZM107.75 1307.57H104.544V1302.89C104.544 1301.66 104.046 1300.83 102.941 1300.83C102.097 1300.83 101.627 1301.39 101.412 1301.94C101.333 1302.13 101.344 1302.4 101.344 1302.68V1307.57H98.1664C98.1664 1307.57 98.2061 1299.27 98.1664 1298.52H101.344V1299.94C101.531 1299.32 102.545 1298.44 104.165 1298.44C106.175 1298.44 107.75 1299.74 107.75 1302.54V1307.57Z"
              fill="#4B5563"
            />
          </g>
          <rect
            x="50.5"
            y="1089.5"
            width="15"
            height="15"
            rx="2"
            stroke="#4B5563"
          />
          <path
            d="M90.8672 1122.16C89.7005 1122.16 88.7344 1121.82 87.9688 1121.13C87.2083 1120.45 86.8281 1119.58 86.8281 1118.53H88.0156C88.0156 1119.26 88.2839 1119.86 88.8203 1120.33C89.3568 1120.79 90.0391 1121.02 90.8672 1121.02C91.6484 1121.02 92.2943 1120.83 92.8047 1120.45C93.3151 1120.07 93.5703 1119.58 93.5703 1118.98C93.5703 1118.66 93.5078 1118.39 93.3828 1118.15C93.263 1117.91 93.0964 1117.72 92.8828 1117.57C92.6745 1117.42 92.4297 1117.29 92.1484 1117.17C91.8724 1117.05 91.5755 1116.95 91.2578 1116.88C90.9453 1116.8 90.6224 1116.72 90.2891 1116.62C89.9557 1116.53 89.6302 1116.44 89.3125 1116.35C89 1116.26 88.7031 1116.13 88.4219 1115.98C88.1458 1115.82 87.901 1115.64 87.6875 1115.45C87.4792 1115.25 87.3125 1114.99 87.1875 1114.68C87.0677 1114.37 87.0078 1114.01 87.0078 1113.62C87.0078 1112.75 87.3542 1112.04 88.0469 1111.48C88.7448 1110.92 89.625 1110.64 90.6875 1110.64C91.8281 1110.64 92.7344 1110.95 93.4062 1111.57C94.0781 1112.18 94.4141 1112.96 94.4141 1113.89H93.1875C93.1615 1113.28 92.9141 1112.77 92.4453 1112.38C91.9818 1111.99 91.3854 1111.79 90.6562 1111.79C89.9271 1111.79 89.3333 1111.96 88.875 1112.3C88.4219 1112.64 88.1953 1113.08 88.1953 1113.62C88.1953 1113.93 88.2708 1114.2 88.4219 1114.43C88.5729 1114.66 88.7734 1114.84 89.0234 1114.98C89.2786 1115.11 89.5703 1115.23 89.8984 1115.34C90.2266 1115.43 90.5729 1115.53 90.9375 1115.62C91.3021 1115.7 91.6641 1115.79 92.0234 1115.89C92.388 1115.99 92.7344 1116.12 93.0625 1116.28C93.3906 1116.44 93.6797 1116.64 93.9297 1116.86C94.1849 1117.08 94.388 1117.37 94.5391 1117.73C94.6901 1118.09 94.7656 1118.51 94.7656 1118.98C94.7656 1119.9 94.3958 1120.66 93.6562 1121.26C92.9219 1121.86 91.9922 1122.16 90.8672 1122.16ZM97.3281 1115.23C98.1042 1114.45 99.0573 1114.06 100.188 1114.06C101.318 1114.06 102.271 1114.45 103.047 1115.23C103.828 1116.01 104.219 1116.97 104.219 1118.11C104.219 1119.25 103.828 1120.21 103.047 1120.99C102.271 1121.77 101.318 1122.16 100.188 1122.16C99.0573 1122.16 98.1042 1121.77 97.3281 1120.99C96.5573 1120.21 96.1719 1119.25 96.1719 1118.11C96.1719 1116.97 96.5573 1116.01 97.3281 1115.23ZM100.188 1115.17C99.3802 1115.17 98.7005 1115.45 98.1484 1116.02C97.5964 1116.58 97.3203 1117.28 97.3203 1118.11C97.3203 1118.94 97.5964 1119.64 98.1484 1120.2C98.7005 1120.77 99.3802 1121.05 100.188 1121.05C100.995 1121.05 101.677 1120.77 102.234 1120.2C102.792 1119.63 103.07 1118.93 103.07 1118.11C103.07 1117.28 102.792 1116.59 102.234 1116.02C101.682 1115.46 101 1115.17 100.188 1115.17ZM109.609 1111.7C108.521 1111.7 107.977 1112.23 107.977 1113.3V1114.23H110.172V1115.31H107.977V1122H106.812V1115.31H105.273V1114.23H106.812V1113.28C106.812 1112.4 107.042 1111.74 107.5 1111.29C107.958 1110.84 108.591 1110.61 109.398 1110.61C109.664 1110.61 109.922 1110.64 110.172 1110.69V1111.76C110.01 1111.72 109.823 1111.7 109.609 1111.7ZM115.648 1115.31H113.477V1119.38C113.477 1120.45 114.021 1120.99 115.109 1120.99C115.328 1120.99 115.508 1120.97 115.648 1120.93V1122C115.414 1122.05 115.164 1122.08 114.898 1122.08C114.086 1122.08 113.451 1121.85 112.992 1121.41C112.534 1120.95 112.305 1120.28 112.305 1119.39V1115.31H110.773V1114.23H112.305V1112.08H113.477V1114.23H115.648V1115.31ZM119.273 1122L116.43 1114.23H117.68L119.758 1120.34L121.945 1114.23H122.906L125.117 1120.34L127.195 1114.23H128.445L125.594 1122H124.633L122.43 1115.89L120.219 1122H119.273ZM136.133 1114.23H137.305V1122H136.133V1120.2C135.846 1120.82 135.43 1121.3 134.883 1121.65C134.341 1121.99 133.703 1122.16 132.969 1122.16C132.266 1122.16 131.617 1121.98 131.023 1121.62C130.435 1121.26 129.969 1120.77 129.625 1120.14C129.281 1119.52 129.109 1118.83 129.109 1118.09C129.109 1117.35 129.281 1116.67 129.625 1116.05C129.969 1115.43 130.435 1114.95 131.023 1114.59C131.617 1114.24 132.266 1114.06 132.969 1114.06C133.703 1114.06 134.344 1114.23 134.891 1114.58C135.438 1114.92 135.852 1115.4 136.133 1116.02V1114.23ZM133.188 1121.05C134.036 1121.05 134.74 1120.78 135.297 1120.22C135.854 1119.66 136.133 1118.95 136.133 1118.09C136.133 1117.24 135.854 1116.54 135.297 1115.98C134.74 1115.43 134.036 1115.15 133.188 1115.15C132.365 1115.15 131.669 1115.43 131.102 1116.01C130.539 1116.58 130.258 1117.28 130.258 1118.09C130.258 1118.93 130.539 1119.63 131.102 1120.2C131.669 1120.77 132.365 1121.05 133.188 1121.05ZM142.898 1114.06C143.102 1114.06 143.344 1114.09 143.625 1114.16V1115.25C143.37 1115.16 143.117 1115.12 142.867 1115.12C142.258 1115.12 141.745 1115.33 141.328 1115.77C140.917 1116.19 140.711 1116.73 140.711 1117.39V1122H139.539V1114.23H140.711V1115.47C140.94 1115.03 141.245 1114.69 141.625 1114.44C142.005 1114.19 142.43 1114.06 142.898 1114.06ZM151.711 1117.88C151.711 1118.11 151.706 1118.26 151.695 1118.32H145.18C145.237 1119.15 145.523 1119.83 146.039 1120.34C146.555 1120.85 147.219 1121.1 148.031 1121.1C148.656 1121.1 149.193 1120.96 149.641 1120.68C150.094 1120.39 150.372 1120.01 150.477 1119.54H151.648C151.497 1120.33 151.086 1120.96 150.414 1121.44C149.742 1121.92 148.938 1122.16 148 1122.16C146.87 1122.16 145.924 1121.77 145.164 1120.98C144.409 1120.2 144.031 1119.23 144.031 1118.06C144.031 1116.94 144.414 1116 145.18 1115.23C145.945 1114.45 146.88 1114.06 147.984 1114.06C148.677 1114.06 149.307 1114.23 149.875 1114.55C150.443 1114.88 150.891 1115.33 151.219 1115.91C151.547 1116.5 151.711 1117.15 151.711 1117.88ZM145.234 1117.33H150.461C150.404 1116.68 150.141 1116.15 149.672 1115.74C149.208 1115.33 148.63 1115.12 147.938 1115.12C147.25 1115.12 146.661 1115.32 146.172 1115.72C145.682 1116.12 145.37 1116.66 145.234 1117.33ZM157.516 1110.8H163.773V1111.95H158.711V1115.44H163.227V1116.59H158.711V1120.85H163.773V1122H157.516V1110.8ZM169.617 1114.06C170.622 1114.06 171.419 1114.38 172.008 1115C172.602 1115.62 172.898 1116.46 172.898 1117.52V1122H171.727V1117.63C171.727 1116.89 171.51 1116.29 171.078 1115.84C170.651 1115.4 170.083 1115.17 169.375 1115.17C168.646 1115.17 168.06 1115.4 167.617 1115.85C167.18 1116.3 166.961 1116.89 166.961 1117.63V1122H165.789V1114.23H166.961V1115.74C167.211 1115.21 167.565 1114.8 168.023 1114.51C168.482 1114.21 169.013 1114.06 169.617 1114.06ZM181.695 1114.21H182.867V1121.76C182.867 1122.83 182.505 1123.68 181.781 1124.34C181.057 1124.99 180.128 1125.31 178.992 1125.31C178.544 1125.31 178.109 1125.26 177.688 1125.14C177.266 1125.03 176.872 1124.87 176.508 1124.66C176.148 1124.44 175.854 1124.15 175.625 1123.79C175.401 1123.43 175.281 1123.02 175.266 1122.56H176.398C176.414 1123.09 176.667 1123.52 177.156 1123.84C177.646 1124.16 178.247 1124.32 178.961 1124.32C179.753 1124.32 180.406 1124.09 180.922 1123.62C181.438 1123.15 181.695 1122.55 181.695 1121.8V1120.09C181.409 1120.71 180.992 1121.18 180.445 1121.52C179.904 1121.86 179.266 1122.03 178.531 1122.03C177.828 1122.03 177.18 1121.85 176.586 1121.5C175.997 1121.15 175.531 1120.66 175.188 1120.05C174.844 1119.43 174.672 1118.76 174.672 1118.03C174.672 1117.31 174.844 1116.64 175.188 1116.03C175.531 1115.42 175.997 1114.94 176.586 1114.59C177.18 1114.24 177.828 1114.06 178.531 1114.06C179.266 1114.06 179.904 1114.23 180.445 1114.57C180.992 1114.9 181.409 1115.38 181.695 1115.98V1114.21ZM178.75 1120.95C179.599 1120.95 180.302 1120.67 180.859 1120.12C181.417 1119.57 181.695 1118.88 181.695 1118.03C181.695 1117.2 181.417 1116.51 180.859 1115.96C180.302 1115.41 179.599 1115.13 178.75 1115.13C177.927 1115.13 177.232 1115.41 176.664 1115.98C176.102 1116.53 175.82 1117.22 175.82 1118.03C175.82 1118.85 176.102 1119.54 176.664 1120.1C177.232 1120.66 177.927 1120.95 178.75 1120.95ZM185.695 1110.83C185.919 1110.83 186.117 1110.91 186.289 1111.08C186.461 1111.24 186.547 1111.44 186.547 1111.66C186.547 1111.89 186.461 1112.09 186.289 1112.27C186.117 1112.43 185.919 1112.52 185.695 1112.52C185.466 1112.52 185.271 1112.43 185.109 1112.27C184.948 1112.1 184.867 1111.9 184.867 1111.66C184.867 1111.44 184.948 1111.24 185.109 1111.08C185.271 1110.91 185.466 1110.83 185.695 1110.83ZM185.102 1114.23H186.273V1122H185.102V1114.23ZM192.336 1114.06C193.341 1114.06 194.138 1114.38 194.727 1115C195.32 1115.62 195.617 1116.46 195.617 1117.52V1122H194.445V1117.63C194.445 1116.89 194.229 1116.29 193.797 1115.84C193.37 1115.4 192.802 1115.17 192.094 1115.17C191.365 1115.17 190.779 1115.4 190.336 1115.85C189.898 1116.3 189.68 1116.89 189.68 1117.63V1122H188.508V1114.23H189.68V1115.74C189.93 1115.21 190.284 1114.8 190.742 1114.51C191.201 1114.21 191.732 1114.06 192.336 1114.06ZM205.07 1117.88C205.07 1118.11 205.065 1118.26 205.055 1118.32H198.539C198.596 1119.15 198.883 1119.83 199.398 1120.34C199.914 1120.85 200.578 1121.1 201.391 1121.1C202.016 1121.1 202.552 1120.96 203 1120.68C203.453 1120.39 203.732 1120.01 203.836 1119.54H205.008C204.857 1120.33 204.445 1120.96 203.773 1121.44C203.102 1121.92 202.297 1122.16 201.359 1122.16C200.229 1122.16 199.284 1121.77 198.523 1120.98C197.768 1120.2 197.391 1119.23 197.391 1118.06C197.391 1116.94 197.773 1116 198.539 1115.23C199.305 1114.45 200.24 1114.06 201.344 1114.06C202.036 1114.06 202.667 1114.23 203.234 1114.55C203.802 1114.88 204.25 1115.33 204.578 1115.91C204.906 1116.5 205.07 1117.15 205.07 1117.88ZM198.594 1117.33H203.82C203.763 1116.68 203.5 1116.15 203.031 1115.74C202.568 1115.33 201.99 1115.12 201.297 1115.12C200.609 1115.12 200.021 1115.32 199.531 1115.72C199.042 1116.12 198.729 1116.66 198.594 1117.33ZM213.836 1117.88C213.836 1118.11 213.831 1118.26 213.82 1118.32H207.305C207.362 1119.15 207.648 1119.83 208.164 1120.34C208.68 1120.85 209.344 1121.1 210.156 1121.1C210.781 1121.1 211.318 1120.96 211.766 1120.68C212.219 1120.39 212.497 1120.01 212.602 1119.54H213.773C213.622 1120.33 213.211 1120.96 212.539 1121.44C211.867 1121.92 211.062 1122.16 210.125 1122.16C208.995 1122.16 208.049 1121.77 207.289 1120.98C206.534 1120.2 206.156 1119.23 206.156 1118.06C206.156 1116.94 206.539 1116 207.305 1115.23C208.07 1114.45 209.005 1114.06 210.109 1114.06C210.802 1114.06 211.432 1114.23 212 1114.55C212.568 1114.88 213.016 1115.33 213.344 1115.91C213.672 1116.5 213.836 1117.15 213.836 1117.88ZM207.359 1117.33H212.586C212.529 1116.68 212.266 1116.15 211.797 1115.74C211.333 1115.33 210.755 1115.12 210.062 1115.12C209.375 1115.12 208.786 1115.32 208.297 1115.72C207.807 1116.12 207.495 1116.66 207.359 1117.33ZM218.992 1114.06C219.195 1114.06 219.438 1114.09 219.719 1114.16V1115.25C219.464 1115.16 219.211 1115.12 218.961 1115.12C218.352 1115.12 217.839 1115.33 217.422 1115.77C217.01 1116.19 216.805 1116.73 216.805 1117.39V1122H215.633V1114.23H216.805V1115.47C217.034 1115.03 217.339 1114.69 217.719 1114.44C218.099 1114.19 218.523 1114.06 218.992 1114.06ZM231.648 1114.23H232.82V1122H231.648V1120.2C231.362 1120.82 230.945 1121.3 230.398 1121.65C229.857 1121.99 229.219 1122.16 228.484 1122.16C227.781 1122.16 227.133 1121.98 226.539 1121.62C225.951 1121.26 225.484 1120.77 225.141 1120.14C224.797 1119.52 224.625 1118.83 224.625 1118.09C224.625 1117.35 224.797 1116.67 225.141 1116.05C225.484 1115.43 225.951 1114.95 226.539 1114.59C227.133 1114.24 227.781 1114.06 228.484 1114.06C229.219 1114.06 229.859 1114.23 230.406 1114.58C230.953 1114.92 231.367 1115.4 231.648 1116.02V1114.23ZM228.703 1121.05C229.552 1121.05 230.255 1120.78 230.812 1120.22C231.37 1119.66 231.648 1118.95 231.648 1118.09C231.648 1117.24 231.37 1116.54 230.812 1115.98C230.255 1115.43 229.552 1115.15 228.703 1115.15C227.88 1115.15 227.185 1115.43 226.617 1116.01C226.055 1116.58 225.773 1117.28 225.773 1118.09C225.773 1118.93 226.055 1119.63 226.617 1120.2C227.185 1120.77 227.88 1121.05 228.703 1121.05ZM239.055 1115.31H236.883V1119.38C236.883 1120.45 237.427 1120.99 238.516 1120.99C238.734 1120.99 238.914 1120.97 239.055 1120.93V1122C238.82 1122.05 238.57 1122.08 238.305 1122.08C237.492 1122.08 236.857 1121.85 236.398 1121.41C235.94 1120.95 235.711 1120.28 235.711 1119.39V1115.31H234.18V1114.23H235.711V1112.08H236.883V1114.23H239.055V1115.31ZM243.789 1120.99C243.841 1121 243.938 1121.01 244.078 1121.01C244.677 1121.01 245.125 1120.82 245.422 1120.45C245.719 1120.07 245.867 1119.49 245.867 1118.7V1110.8H247.086V1118.98C247.086 1119.99 246.846 1120.77 246.367 1121.32C245.893 1121.87 245.232 1122.14 244.383 1122.14C244.117 1122.14 243.919 1122.13 243.789 1122.11V1120.99ZM255.305 1114.23H256.477V1122H255.305V1120.49C255.055 1121.02 254.701 1121.43 254.242 1121.72C253.789 1122.01 253.258 1122.16 252.648 1122.16C251.648 1122.16 250.852 1121.84 250.258 1121.22C249.664 1120.59 249.367 1119.76 249.367 1118.7V1114.23H250.539V1118.58C250.539 1119.33 250.753 1119.93 251.18 1120.38C251.607 1120.83 252.177 1121.05 252.891 1121.05C253.625 1121.05 254.211 1120.83 254.648 1120.38C255.086 1119.93 255.305 1119.33 255.305 1118.58V1114.23ZM259.289 1110.83C259.513 1110.83 259.711 1110.91 259.883 1111.08C260.055 1111.24 260.141 1111.44 260.141 1111.66C260.141 1111.89 260.055 1112.09 259.883 1112.27C259.711 1112.43 259.513 1112.52 259.289 1112.52C259.06 1112.52 258.865 1112.43 258.703 1112.27C258.542 1112.1 258.461 1111.9 258.461 1111.66C258.461 1111.44 258.542 1111.24 258.703 1111.08C258.865 1110.91 259.06 1110.83 259.289 1110.83ZM257.469 1124.14C257.479 1124.14 257.505 1124.14 257.547 1124.15C257.589 1124.15 257.625 1124.16 257.656 1124.16C258.359 1124.16 258.711 1123.62 258.711 1122.56V1114.23H259.883V1122.66C259.883 1123.5 259.703 1124.14 259.344 1124.58C258.984 1125.02 258.461 1125.23 257.773 1125.23C257.643 1125.23 257.542 1125.23 257.469 1125.22V1124.14ZM268.055 1114.23H269.227V1122H268.055V1120.49C267.805 1121.02 267.451 1121.43 266.992 1121.72C266.539 1122.01 266.008 1122.16 265.398 1122.16C264.398 1122.16 263.602 1121.84 263.008 1121.22C262.414 1120.59 262.117 1119.76 262.117 1118.7V1114.23H263.289V1118.58C263.289 1119.33 263.503 1119.93 263.93 1120.38C264.357 1120.83 264.927 1121.05 265.641 1121.05C266.375 1121.05 266.961 1120.83 267.398 1120.38C267.836 1119.93 268.055 1119.33 268.055 1118.58V1114.23ZM275.461 1115.31H273.289V1119.38C273.289 1120.45 273.833 1120.99 274.922 1120.99C275.141 1120.99 275.32 1120.97 275.461 1120.93V1122C275.227 1122.05 274.977 1122.08 274.711 1122.08C273.898 1122.08 273.263 1121.85 272.805 1121.41C272.346 1120.95 272.117 1120.28 272.117 1119.39V1115.31H270.586V1114.23H272.117V1112.08H273.289V1114.23H275.461V1115.31ZM279.648 1122.16C278.773 1122.16 278.049 1121.93 277.477 1121.49C276.904 1121.05 276.578 1120.45 276.5 1119.7H277.617C277.669 1120.14 277.878 1120.49 278.242 1120.76C278.607 1121.02 279.06 1121.15 279.602 1121.15C280.143 1121.15 280.578 1121.03 280.906 1120.78C281.24 1120.53 281.406 1120.21 281.406 1119.82C281.406 1119.56 281.339 1119.34 281.203 1119.16C281.068 1118.98 280.888 1118.85 280.664 1118.76C280.445 1118.67 280.195 1118.59 279.914 1118.52C279.633 1118.44 279.344 1118.38 279.047 1118.34C278.75 1118.29 278.461 1118.22 278.18 1118.12C277.898 1118.02 277.646 1117.9 277.422 1117.77C277.203 1117.62 277.026 1117.43 276.891 1117.17C276.755 1116.91 276.688 1116.6 276.688 1116.24C276.688 1115.6 276.94 1115.08 277.445 1114.67C277.951 1114.27 278.62 1114.06 279.453 1114.06C280.219 1114.06 280.878 1114.27 281.43 1114.67C281.987 1115.07 282.31 1115.61 282.398 1116.29H281.219C281.161 1115.92 280.966 1115.62 280.633 1115.39C280.299 1115.16 279.896 1115.04 279.422 1115.04C278.948 1115.04 278.562 1115.14 278.266 1115.35C277.974 1115.55 277.828 1115.82 277.828 1116.16C277.828 1116.44 277.914 1116.67 278.086 1116.84C278.263 1117.02 278.49 1117.15 278.766 1117.23C279.042 1117.32 279.346 1117.39 279.68 1117.45C280.018 1117.51 280.354 1117.58 280.688 1117.67C281.026 1117.76 281.333 1117.88 281.609 1118.02C281.885 1118.17 282.109 1118.39 282.281 1118.69C282.458 1118.98 282.547 1119.35 282.547 1119.79C282.547 1120.48 282.271 1121.04 281.719 1121.49C281.172 1121.93 280.482 1122.16 279.648 1122.16ZM290.133 1114.23H291.305V1122H290.133V1120.49C289.883 1121.02 289.529 1121.43 289.07 1121.72C288.617 1122.01 288.086 1122.16 287.477 1122.16C286.477 1122.16 285.68 1121.84 285.086 1121.22C284.492 1120.59 284.195 1119.76 284.195 1118.7V1114.23H285.367V1118.58C285.367 1119.33 285.581 1119.93 286.008 1120.38C286.435 1120.83 287.005 1121.05 287.719 1121.05C288.453 1121.05 289.039 1120.83 289.477 1120.38C289.914 1119.93 290.133 1119.33 290.133 1118.58V1114.23ZM305.75 1122H304.141L298.742 1116.38V1122H297.547V1110.8H298.742V1115.89L303.703 1110.8H305.273L300.023 1116.12L305.75 1122ZM312.992 1114.23H314.164V1122H312.992V1120.2C312.706 1120.82 312.289 1121.3 311.742 1121.65C311.201 1121.99 310.562 1122.16 309.828 1122.16C309.125 1122.16 308.477 1121.98 307.883 1121.62C307.294 1121.26 306.828 1120.77 306.484 1120.14C306.141 1119.52 305.969 1118.83 305.969 1118.09C305.969 1117.35 306.141 1116.67 306.484 1116.05C306.828 1115.43 307.294 1114.95 307.883 1114.59C308.477 1114.24 309.125 1114.06 309.828 1114.06C310.562 1114.06 311.203 1114.23 311.75 1114.58C312.297 1114.92 312.711 1115.4 312.992 1116.02V1114.23ZM310.047 1121.05C310.896 1121.05 311.599 1120.78 312.156 1120.22C312.714 1119.66 312.992 1118.95 312.992 1118.09C312.992 1117.24 312.714 1116.54 312.156 1115.98C311.599 1115.43 310.896 1115.15 310.047 1115.15C309.224 1115.15 308.529 1115.43 307.961 1116.01C307.398 1116.58 307.117 1117.28 307.117 1118.09C307.117 1118.93 307.398 1119.63 307.961 1120.2C308.529 1120.77 309.224 1121.05 310.047 1121.05ZM316.992 1110.83C317.216 1110.83 317.414 1110.91 317.586 1111.08C317.758 1111.24 317.844 1111.44 317.844 1111.66C317.844 1111.89 317.758 1112.09 317.586 1112.27C317.414 1112.43 317.216 1112.52 316.992 1112.52C316.763 1112.52 316.568 1112.43 316.406 1112.27C316.245 1112.1 316.164 1111.9 316.164 1111.66C316.164 1111.44 316.245 1111.24 316.406 1111.08C316.568 1110.91 316.763 1110.83 316.992 1110.83ZM316.398 1114.23H317.57V1122H316.398V1114.23ZM322.367 1122.16C321.492 1122.16 320.768 1121.93 320.195 1121.49C319.622 1121.05 319.297 1120.45 319.219 1119.7H320.336C320.388 1120.14 320.596 1120.49 320.961 1120.76C321.326 1121.02 321.779 1121.15 322.32 1121.15C322.862 1121.15 323.297 1121.03 323.625 1120.78C323.958 1120.53 324.125 1120.21 324.125 1119.82C324.125 1119.56 324.057 1119.34 323.922 1119.16C323.786 1118.98 323.607 1118.85 323.383 1118.76C323.164 1118.67 322.914 1118.59 322.633 1118.52C322.352 1118.44 322.062 1118.38 321.766 1118.34C321.469 1118.29 321.18 1118.22 320.898 1118.12C320.617 1118.02 320.365 1117.9 320.141 1117.77C319.922 1117.62 319.745 1117.43 319.609 1117.17C319.474 1116.91 319.406 1116.6 319.406 1116.24C319.406 1115.6 319.659 1115.08 320.164 1114.67C320.669 1114.27 321.339 1114.06 322.172 1114.06C322.938 1114.06 323.596 1114.27 324.148 1114.67C324.706 1115.07 325.029 1115.61 325.117 1116.29H323.938C323.88 1115.92 323.685 1115.62 323.352 1115.39C323.018 1115.16 322.615 1115.04 322.141 1115.04C321.667 1115.04 321.281 1115.14 320.984 1115.35C320.693 1115.55 320.547 1115.82 320.547 1116.16C320.547 1116.44 320.633 1116.67 320.805 1116.84C320.982 1117.02 321.208 1117.15 321.484 1117.23C321.76 1117.32 322.065 1117.39 322.398 1117.45C322.737 1117.51 323.073 1117.58 323.406 1117.67C323.745 1117.76 324.052 1117.88 324.328 1118.02C324.604 1118.17 324.828 1118.39 325 1118.69C325.177 1118.98 325.266 1119.35 325.266 1119.79C325.266 1120.48 324.99 1121.04 324.438 1121.49C323.891 1121.93 323.201 1122.16 322.367 1122.16ZM334.273 1117.88C334.273 1118.11 334.268 1118.26 334.258 1118.32H327.742C327.799 1119.15 328.086 1119.83 328.602 1120.34C329.117 1120.85 329.781 1121.1 330.594 1121.1C331.219 1121.1 331.755 1120.96 332.203 1120.68C332.656 1120.39 332.935 1120.01 333.039 1119.54H334.211C334.06 1120.33 333.648 1120.96 332.977 1121.44C332.305 1121.92 331.5 1122.16 330.562 1122.16C329.432 1122.16 328.487 1121.77 327.727 1120.98C326.971 1120.2 326.594 1119.23 326.594 1118.06C326.594 1116.94 326.977 1116 327.742 1115.23C328.508 1114.45 329.443 1114.06 330.547 1114.06C331.24 1114.06 331.87 1114.23 332.438 1114.55C333.005 1114.88 333.453 1115.33 333.781 1115.91C334.109 1116.5 334.273 1117.15 334.273 1117.88ZM327.797 1117.33H333.023C332.966 1116.68 332.703 1116.15 332.234 1115.74C331.771 1115.33 331.193 1115.12 330.5 1115.12C329.812 1115.12 329.224 1115.32 328.734 1115.72C328.245 1116.12 327.932 1116.66 327.797 1117.33ZM339.898 1114.06C340.904 1114.06 341.701 1114.38 342.289 1115C342.883 1115.62 343.18 1116.46 343.18 1117.52V1122H342.008V1117.63C342.008 1116.89 341.792 1116.29 341.359 1115.84C340.932 1115.4 340.365 1115.17 339.656 1115.17C338.927 1115.17 338.341 1115.4 337.898 1115.85C337.461 1116.3 337.242 1116.89 337.242 1117.63V1122H336.07V1114.23H337.242V1115.74C337.492 1115.21 337.846 1114.8 338.305 1114.51C338.763 1114.21 339.294 1114.06 339.898 1114.06ZM349.273 1109.2H350.492V1124.95H349.273V1109.2ZM360.203 1110.8C360.969 1110.8 361.69 1110.94 362.367 1111.22C363.049 1111.49 363.635 1111.88 364.125 1112.37C364.615 1112.85 365 1113.44 365.281 1114.13C365.568 1114.82 365.711 1115.56 365.711 1116.35C365.711 1117.14 365.568 1117.89 365.281 1118.59C365 1119.29 364.615 1119.89 364.125 1120.39C363.635 1120.89 363.049 1121.28 362.367 1121.57C361.69 1121.86 360.969 1122 360.203 1122H356.734V1110.8H360.203ZM360.266 1120.85C361.464 1120.85 362.461 1120.42 363.258 1119.57C364.06 1118.71 364.461 1117.64 364.461 1116.35C364.461 1115.08 364.062 1114.02 363.266 1113.2C362.474 1112.37 361.474 1111.95 360.266 1111.95H357.93V1120.85H360.266ZM368.211 1110.83C368.435 1110.83 368.633 1110.91 368.805 1111.08C368.977 1111.24 369.062 1111.44 369.062 1111.66C369.062 1111.89 368.977 1112.09 368.805 1112.27C368.633 1112.43 368.435 1112.52 368.211 1112.52C367.982 1112.52 367.786 1112.43 367.625 1112.27C367.464 1112.1 367.383 1111.9 367.383 1111.66C367.383 1111.44 367.464 1111.24 367.625 1111.08C367.786 1110.91 367.982 1110.83 368.211 1110.83ZM367.617 1114.23H368.789V1122H367.617V1114.23ZM375.359 1114.06C376.062 1114.06 376.708 1114.24 377.297 1114.6C377.891 1114.96 378.359 1115.45 378.703 1116.07C379.047 1116.69 379.219 1117.37 379.219 1118.11C379.219 1118.85 379.047 1119.53 378.703 1120.16C378.359 1120.78 377.891 1121.27 377.297 1121.62C376.708 1121.98 376.062 1122.16 375.359 1122.16C374.625 1122.16 373.984 1121.99 373.438 1121.65C372.896 1121.3 372.482 1120.82 372.195 1120.2V1124.93H371.023V1114.23H372.195V1116.02C372.477 1115.4 372.891 1114.92 373.438 1114.58C373.984 1114.23 374.625 1114.06 375.359 1114.06ZM375.141 1121.05C375.964 1121.05 376.656 1120.77 377.219 1120.2C377.781 1119.64 378.062 1118.94 378.062 1118.11C378.062 1117.28 377.781 1116.58 377.219 1116.01C376.656 1115.43 375.964 1115.15 375.141 1115.15C374.292 1115.15 373.589 1115.43 373.031 1115.99C372.474 1116.55 372.195 1117.26 372.195 1118.11C372.195 1118.96 372.474 1119.66 373.031 1120.22C373.589 1120.78 374.292 1121.05 375.141 1121.05ZM382.117 1110.8V1122H380.945V1110.8H382.117ZM384.812 1115.23C385.589 1114.45 386.542 1114.06 387.672 1114.06C388.802 1114.06 389.755 1114.45 390.531 1115.23C391.312 1116.01 391.703 1116.97 391.703 1118.11C391.703 1119.25 391.312 1120.21 390.531 1120.99C389.755 1121.77 388.802 1122.16 387.672 1122.16C386.542 1122.16 385.589 1121.77 384.812 1120.99C384.042 1120.21 383.656 1119.25 383.656 1118.11C383.656 1116.97 384.042 1116.01 384.812 1115.23ZM387.672 1115.17C386.865 1115.17 386.185 1115.45 385.633 1116.02C385.081 1116.58 384.805 1117.28 384.805 1118.11C384.805 1118.94 385.081 1119.64 385.633 1120.2C386.185 1120.77 386.865 1121.05 387.672 1121.05C388.479 1121.05 389.161 1120.77 389.719 1120.2C390.276 1119.63 390.555 1118.93 390.555 1118.11C390.555 1117.28 390.276 1116.59 389.719 1116.02C389.167 1115.46 388.484 1115.17 387.672 1115.17ZM402.555 1114.06C403.523 1114.06 404.292 1114.36 404.859 1114.95C405.432 1115.53 405.719 1116.33 405.719 1117.34V1122H404.555V1117.55C404.555 1116.81 404.359 1116.23 403.969 1115.8C403.583 1115.38 403.052 1115.17 402.375 1115.17C402.099 1115.17 401.836 1115.22 401.586 1115.3C401.336 1115.39 401.102 1115.53 400.883 1115.71C400.669 1115.89 400.497 1116.14 400.367 1116.46C400.242 1116.78 400.18 1117.14 400.18 1117.55V1122H399.016V1117.55C399.016 1116.81 398.82 1116.23 398.43 1115.8C398.044 1115.38 397.513 1115.17 396.836 1115.17C396.565 1115.17 396.305 1115.22 396.055 1115.3C395.81 1115.39 395.578 1115.52 395.359 1115.7C395.146 1115.88 394.974 1116.13 394.844 1116.45C394.714 1116.76 394.648 1117.13 394.648 1117.55V1122H393.477V1114.23H394.648V1115.57C394.904 1115.06 395.26 1114.68 395.719 1114.44C396.177 1114.19 396.667 1114.06 397.188 1114.06C398.526 1114.06 399.419 1114.62 399.867 1115.74C400.086 1115.21 400.44 1114.8 400.93 1114.51C401.419 1114.21 401.961 1114.06 402.555 1114.06ZM414.523 1114.23H415.695V1122H414.523V1120.2C414.237 1120.82 413.82 1121.3 413.273 1121.65C412.732 1121.99 412.094 1122.16 411.359 1122.16C410.656 1122.16 410.008 1121.98 409.414 1121.62C408.826 1121.26 408.359 1120.77 408.016 1120.14C407.672 1119.52 407.5 1118.83 407.5 1118.09C407.5 1117.35 407.672 1116.67 408.016 1116.05C408.359 1115.43 408.826 1114.95 409.414 1114.59C410.008 1114.24 410.656 1114.06 411.359 1114.06C412.094 1114.06 412.734 1114.23 413.281 1114.58C413.828 1114.92 414.242 1115.4 414.523 1116.02V1114.23ZM411.578 1121.05C412.427 1121.05 413.13 1120.78 413.688 1120.22C414.245 1119.66 414.523 1118.95 414.523 1118.09C414.523 1117.24 414.245 1116.54 413.688 1115.98C413.13 1115.43 412.427 1115.15 411.578 1115.15C410.755 1115.15 410.06 1115.43 409.492 1116.01C408.93 1116.58 408.648 1117.28 408.648 1118.09C408.648 1118.93 408.93 1119.63 409.492 1120.2C410.06 1120.77 410.755 1121.05 411.578 1121.05ZM422.383 1110.83C422.607 1110.83 422.805 1110.91 422.977 1111.08C423.148 1111.24 423.234 1111.44 423.234 1111.66C423.234 1111.89 423.148 1112.09 422.977 1112.27C422.805 1112.43 422.607 1112.52 422.383 1112.52C422.154 1112.52 421.958 1112.43 421.797 1112.27C421.635 1112.1 421.555 1111.9 421.555 1111.66C421.555 1111.44 421.635 1111.24 421.797 1111.08C421.958 1110.91 422.154 1110.83 422.383 1110.83ZM421.789 1114.23H422.961V1122H421.789V1114.23ZM429.023 1114.06C430.029 1114.06 430.826 1114.38 431.414 1115C432.008 1115.62 432.305 1116.46 432.305 1117.52V1122H431.133V1117.63C431.133 1116.89 430.917 1116.29 430.484 1115.84C430.057 1115.4 429.49 1115.17 428.781 1115.17C428.052 1115.17 427.466 1115.4 427.023 1115.85C426.586 1116.3 426.367 1116.89 426.367 1117.63V1122H425.195V1114.23H426.367V1115.74C426.617 1115.21 426.971 1114.8 427.43 1114.51C427.888 1114.21 428.419 1114.06 429.023 1114.06ZM446.242 1122L445.156 1119.27H439.859L438.766 1122H437.492L441.969 1110.8H443.055L447.555 1122H446.242ZM440.32 1118.11H444.703L442.516 1112.58L440.32 1118.11ZM449.031 1110.8H450.227V1122H449.031V1110.8ZM463.039 1114.23H464.211V1122H463.039V1120.2C462.753 1120.82 462.336 1121.3 461.789 1121.65C461.247 1121.99 460.609 1122.16 459.875 1122.16C459.172 1122.16 458.523 1121.98 457.93 1121.62C457.341 1121.26 456.875 1120.77 456.531 1120.14C456.188 1119.52 456.016 1118.83 456.016 1118.09C456.016 1117.35 456.188 1116.67 456.531 1116.05C456.875 1115.43 457.341 1114.95 457.93 1114.59C458.523 1114.24 459.172 1114.06 459.875 1114.06C460.609 1114.06 461.25 1114.23 461.797 1114.58C462.344 1114.92 462.758 1115.4 463.039 1116.02V1114.23ZM460.094 1121.05C460.943 1121.05 461.646 1120.78 462.203 1120.22C462.76 1119.66 463.039 1118.95 463.039 1118.09C463.039 1117.24 462.76 1116.54 462.203 1115.98C461.646 1115.43 460.943 1115.15 460.094 1115.15C459.271 1115.15 458.576 1115.43 458.008 1116.01C457.445 1116.58 457.164 1117.28 457.164 1118.09C457.164 1118.93 457.445 1119.63 458.008 1120.2C458.576 1120.77 459.271 1121.05 460.094 1121.05ZM470.273 1114.06C471.279 1114.06 472.076 1114.38 472.664 1115C473.258 1115.62 473.555 1116.46 473.555 1117.52V1122H472.383V1117.63C472.383 1116.89 472.167 1116.29 471.734 1115.84C471.307 1115.4 470.74 1115.17 470.031 1115.17C469.302 1115.17 468.716 1115.4 468.273 1115.85C467.836 1116.3 467.617 1116.89 467.617 1117.63V1122H466.445V1114.23H467.617V1115.74C467.867 1115.21 468.221 1114.8 468.68 1114.51C469.138 1114.21 469.669 1114.06 470.273 1114.06ZM482.352 1110.8H483.523V1122H482.352V1120.2C482.065 1120.82 481.648 1121.3 481.102 1121.65C480.56 1121.99 479.922 1122.16 479.188 1122.16C478.484 1122.16 477.836 1121.98 477.242 1121.62C476.654 1121.26 476.188 1120.77 475.844 1120.14C475.5 1119.52 475.328 1118.83 475.328 1118.09C475.328 1117.35 475.5 1116.67 475.844 1116.05C476.188 1115.43 476.654 1114.95 477.242 1114.59C477.836 1114.24 478.484 1114.06 479.188 1114.06C479.922 1114.06 480.562 1114.23 481.109 1114.58C481.656 1114.92 482.07 1115.4 482.352 1116.02V1110.8ZM479.406 1121.05C480.255 1121.05 480.958 1120.78 481.516 1120.22C482.073 1119.66 482.352 1118.95 482.352 1118.09C482.352 1117.24 482.073 1116.54 481.516 1115.98C480.958 1115.43 480.255 1115.15 479.406 1115.15C478.583 1115.15 477.888 1115.43 477.32 1116.01C476.758 1116.58 476.477 1117.28 476.477 1118.09C476.477 1118.93 476.758 1119.63 477.32 1120.2C477.888 1120.77 478.583 1121.05 479.406 1121.05ZM489.766 1122V1110.8H491.188L495.445 1120.23L499.781 1110.8H501.016V1122H499.797V1113.23L495.828 1122H494.914L490.961 1113.23V1122H489.766ZM503.547 1110.8H504.742V1120.85H510.406V1122H503.547V1110.8Z"
            fill="#0F47F2"
          />
          <path
            d="M91.4756 1093.18C90.1221 1093.18 89.0029 1092.78 88.1182 1091.98C87.2334 1091.18 86.791 1090.16 86.791 1088.93H88.8828C88.8828 1089.6 89.123 1090.15 89.6035 1090.57C90.0898 1090.99 90.7139 1091.2 91.4756 1091.2C92.1904 1091.2 92.7734 1091.03 93.2246 1090.71C93.6758 1090.37 93.9014 1089.94 93.9014 1089.41C93.9014 1089.12 93.8223 1088.85 93.6641 1088.63C93.5059 1088.41 93.292 1088.23 93.0225 1088.1C92.7588 1087.96 92.4512 1087.83 92.0996 1087.73C91.7539 1087.62 91.3877 1087.52 91.001 1087.42C90.6201 1087.32 90.2363 1087.21 89.8496 1087.1C89.4688 1086.99 89.1025 1086.84 88.751 1086.66C88.4053 1086.48 88.0977 1086.27 87.8281 1086.03C87.5645 1085.79 87.3535 1085.48 87.1953 1085.1C87.0371 1084.71 86.958 1084.27 86.958 1083.78C86.958 1082.74 87.3594 1081.89 88.1621 1081.22C88.9648 1080.55 89.9844 1080.22 91.2207 1080.22C91.9238 1080.22 92.5566 1080.33 93.1191 1080.54C93.6875 1080.75 94.1475 1081.04 94.499 1081.41C94.8564 1081.77 95.1289 1082.19 95.3164 1082.66C95.5039 1083.13 95.5977 1083.64 95.5977 1084.18H93.4355C93.418 1083.6 93.2012 1083.13 92.7852 1082.77C92.3691 1082.4 91.8242 1082.22 91.1504 1082.22C90.5117 1082.22 89.9961 1082.36 89.6035 1082.65C89.2168 1082.93 89.0234 1083.3 89.0234 1083.76C89.0234 1084.04 89.1025 1084.29 89.2607 1084.49C89.4189 1084.69 89.6328 1084.85 89.9023 1084.98C90.1719 1085.1 90.4795 1085.21 90.8252 1085.31C91.1768 1085.41 91.543 1085.51 91.9238 1085.6C92.3105 1085.69 92.6973 1085.8 93.084 1085.92C93.4707 1086.03 93.8369 1086.18 94.1826 1086.37C94.5342 1086.56 94.8447 1086.78 95.1143 1087.04C95.3838 1087.29 95.5977 1087.62 95.7559 1088.03C95.9141 1088.43 95.9932 1088.89 95.9932 1089.41C95.9932 1090.13 95.7969 1090.77 95.4043 1091.35C95.0176 1091.92 94.4785 1092.37 93.7871 1092.69C93.1016 1093.01 92.3311 1093.18 91.4756 1093.18ZM104.642 1084.2H106.663V1093H104.642V1091.45C104.319 1092.01 103.895 1092.44 103.367 1092.74C102.84 1093.03 102.228 1093.18 101.53 1093.18C100.763 1093.18 100.057 1092.97 99.4121 1092.57C98.7676 1092.16 98.2578 1091.6 97.8828 1090.9C97.5078 1090.19 97.3203 1089.42 97.3203 1088.59C97.3203 1087.76 97.5078 1086.99 97.8828 1086.29C98.2578 1085.58 98.7676 1085.03 99.4121 1084.62C100.057 1084.22 100.763 1084.02 101.53 1084.02C102.228 1084.02 102.84 1084.17 103.367 1084.47C103.895 1084.76 104.319 1085.19 104.642 1085.75V1084.2ZM101.961 1091.27C102.723 1091.27 103.358 1091.01 103.868 1090.5C104.384 1089.99 104.642 1089.35 104.642 1088.59C104.642 1087.83 104.384 1087.2 103.868 1086.69C103.358 1086.18 102.723 1085.92 101.961 1085.92C101.217 1085.92 100.587 1086.19 100.071 1086.71C99.5557 1087.22 99.2979 1087.85 99.2979 1088.59C99.2979 1089.34 99.5557 1089.97 100.071 1090.5C100.587 1091.01 101.217 1091.27 101.961 1091.27ZM113.94 1086.11H111.629V1089.65C111.629 1090.18 111.775 1090.58 112.068 1090.84C112.367 1091.09 112.774 1091.22 113.29 1091.22C113.542 1091.22 113.759 1091.19 113.94 1091.15V1093C113.63 1093.07 113.27 1093.11 112.859 1093.11C111.869 1093.11 111.081 1092.81 110.495 1092.22C109.909 1091.63 109.616 1090.78 109.616 1089.69V1086.11H107.946V1084.2H109.616V1081.84H111.629V1084.2H113.94V1086.11ZM121.648 1084.2H123.661V1093H121.648V1091.61C121.367 1092.12 121.001 1092.5 120.55 1092.77C120.099 1093.04 119.583 1093.18 119.003 1093.18C117.866 1093.18 116.973 1092.82 116.322 1092.12C115.672 1091.41 115.347 1090.44 115.347 1089.2V1084.2H117.342V1088.97C117.342 1089.66 117.538 1090.21 117.931 1090.63C118.323 1091.04 118.842 1091.25 119.486 1091.25C120.137 1091.25 120.658 1091.04 121.051 1090.63C121.449 1090.21 121.648 1089.66 121.648 1088.97V1084.2ZM130.139 1084.02C130.332 1084.02 130.61 1084.05 130.974 1084.12V1085.96C130.634 1085.88 130.338 1085.84 130.086 1085.84C129.424 1085.84 128.87 1086.06 128.425 1086.5C127.985 1086.94 127.766 1087.54 127.766 1088.3V1093H125.771V1084.2H127.766V1085.37C128.322 1084.47 129.113 1084.02 130.139 1084.02ZM132.591 1085.34C133.464 1084.46 134.545 1084.02 135.834 1084.02C137.123 1084.02 138.207 1084.46 139.086 1085.34C139.965 1086.21 140.404 1087.3 140.404 1088.61C140.404 1089.91 139.965 1090.99 139.086 1091.87C138.207 1092.74 137.123 1093.18 135.834 1093.18C134.545 1093.18 133.464 1092.74 132.591 1091.87C131.718 1090.99 131.281 1089.91 131.281 1088.61C131.281 1087.3 131.718 1086.21 132.591 1085.34ZM137.68 1086.71C137.182 1086.2 136.566 1085.94 135.834 1085.94C135.102 1085.94 134.489 1086.2 133.997 1086.71C133.505 1087.22 133.259 1087.85 133.259 1088.61C133.259 1089.36 133.505 1089.99 133.997 1090.5C134.495 1091 135.107 1091.25 135.834 1091.25C136.566 1091.25 137.182 1091 137.68 1090.49C138.178 1089.98 138.427 1089.35 138.427 1088.61C138.427 1087.85 138.178 1087.22 137.68 1086.71ZM158.079 1085.94C158.138 1086.28 158.167 1086.68 158.167 1087.13C158.167 1088.29 157.897 1089.33 157.358 1090.26C156.825 1091.18 156.093 1091.9 155.161 1092.41C154.235 1092.92 153.198 1093.18 152.05 1093.18C151.159 1093.18 150.318 1093.01 149.527 1092.67C148.742 1092.34 148.068 1091.89 147.506 1091.31C146.949 1090.74 146.507 1090.05 146.179 1089.25C145.856 1088.44 145.695 1087.59 145.695 1086.68C145.695 1085.78 145.856 1084.93 146.179 1084.13C146.507 1083.33 146.952 1082.64 147.515 1082.08C148.077 1081.5 148.751 1081.05 149.536 1080.72C150.327 1080.39 151.165 1080.22 152.05 1080.22C152.97 1080.22 153.852 1080.41 154.695 1080.79C155.545 1081.17 156.251 1081.68 156.813 1082.31C157.382 1082.95 157.742 1083.63 157.895 1084.36H155.521C155.293 1083.75 154.848 1083.24 154.186 1082.86C153.529 1082.46 152.817 1082.27 152.05 1082.27C150.866 1082.27 149.873 1082.69 149.07 1083.53C148.273 1084.38 147.875 1085.43 147.875 1086.68C147.875 1087.51 148.057 1088.27 148.42 1088.95C148.789 1089.62 149.302 1090.16 149.958 1090.55C150.62 1090.93 151.364 1091.13 152.19 1091.13C153.175 1091.13 154.016 1090.84 154.713 1090.26C155.416 1089.67 155.853 1088.91 156.022 1087.98H152.085V1085.94H158.079ZM160.821 1085.34C161.694 1084.46 162.775 1084.02 164.064 1084.02C165.354 1084.02 166.438 1084.46 167.316 1085.34C168.195 1086.21 168.635 1087.3 168.635 1088.61C168.635 1089.91 168.195 1090.99 167.316 1091.87C166.438 1092.74 165.354 1093.18 164.064 1093.18C162.775 1093.18 161.694 1092.74 160.821 1091.87C159.948 1090.99 159.512 1089.91 159.512 1088.61C159.512 1087.3 159.948 1086.21 160.821 1085.34ZM165.91 1086.71C165.412 1086.2 164.797 1085.94 164.064 1085.94C163.332 1085.94 162.72 1086.2 162.228 1086.71C161.735 1087.22 161.489 1087.85 161.489 1088.61C161.489 1089.36 161.735 1089.99 162.228 1090.5C162.726 1091 163.338 1091.25 164.064 1091.25C164.797 1091.25 165.412 1091 165.91 1090.49C166.408 1089.98 166.657 1089.35 166.657 1088.61C166.657 1087.85 166.408 1087.22 165.91 1086.71ZM170.393 1080.49C170.645 1080.24 170.946 1080.12 171.298 1080.12C171.649 1080.12 171.954 1080.24 172.212 1080.49C172.47 1080.75 172.599 1081.04 172.599 1081.39C172.599 1081.75 172.47 1082.05 172.212 1082.3C171.954 1082.56 171.649 1082.68 171.298 1082.68C170.946 1082.68 170.645 1082.56 170.393 1082.3C170.146 1082.05 170.023 1081.75 170.023 1081.39C170.023 1081.04 170.146 1080.75 170.393 1080.49ZM168.96 1094.67C168.983 1094.67 169.027 1094.67 169.092 1094.68C169.15 1094.69 169.197 1094.7 169.232 1094.7C169.953 1094.7 170.313 1094.22 170.313 1093.27V1084.2H172.309V1093.47C172.309 1094.43 172.051 1095.18 171.535 1095.71C171.025 1096.24 170.311 1096.51 169.391 1096.51C169.221 1096.51 169.077 1096.5 168.96 1096.49V1094.67ZM180.729 1084.2H182.741V1093H180.729V1091.61C180.447 1092.12 180.081 1092.5 179.63 1092.77C179.179 1093.04 178.663 1093.18 178.083 1093.18C176.946 1093.18 176.053 1092.82 175.402 1092.12C174.752 1091.41 174.427 1090.44 174.427 1089.2V1084.2H176.422V1088.97C176.422 1089.66 176.618 1090.21 177.011 1090.63C177.403 1091.04 177.922 1091.25 178.566 1091.25C179.217 1091.25 179.738 1091.04 180.131 1090.63C180.529 1090.21 180.729 1089.66 180.729 1088.97V1084.2Z"
            fill="#222222"
          />
          <g clip-path="url(#clip8_4500_3993)">
            <path
              d="M190.446 1092.47C189.994 1088.49 189.972 1085.62 190.368 1081.71L190.549 1081.67L190.426 1081.2C190.422 1081.18 190.422 1081.18 190.423 1081.17C190.438 1081.04 190.586 1080.88 190.717 1080.86C190.718 1080.86 190.721 1080.86 190.723 1080.86C190.728 1080.86 190.734 1080.86 190.741 1080.86L191.226 1080.96L191.251 1080.78C192.663 1080.57 194.09 1080.46 195.499 1080.46C196.908 1080.46 198.336 1080.57 199.748 1080.78L199.774 1080.96L200.258 1080.86C200.265 1080.86 200.271 1080.86 200.275 1080.86C200.278 1080.86 200.28 1080.86 200.283 1080.86C200.413 1080.88 200.561 1081.04 200.576 1081.17C200.576 1081.18 200.577 1081.18 200.573 1081.2L200.449 1081.67L200.631 1081.71C201.027 1085.62 201.005 1088.49 200.553 1092.47L200.449 1092.42L200.415 1092.45C198.503 1091.49 197.481 1090.71 195.868 1088.61L195.499 1088.13L195.131 1088.61C193.455 1090.79 192.481 1091.54 190.588 1092.45L190.55 1092.42L190.446 1092.47Z"
              fill="#FF8D28"
            />
            <path
              d="M195.499 1080.93C194.227 1080.93 192.94 1081.02 191.663 1081.19L191.618 1081.52L190.953 1081.38L191.123 1082.03L190.796 1082.09C190.459 1085.6 190.47 1088.28 190.84 1091.81C191.567 1091.43 192.083 1091.1 192.565 1090.71C193.242 1090.17 193.899 1089.45 194.762 1088.33L195.499 1087.36L196.236 1088.33C197.069 1089.41 197.755 1090.15 198.459 1090.71C198.981 1091.13 199.533 1091.46 200.16 1091.8C200.528 1088.28 200.54 1085.59 200.202 1082.09L199.876 1082.03L200.045 1081.38L199.383 1081.52L199.337 1081.19C198.059 1081.02 196.772 1080.93 195.499 1080.93ZM195.499 1080C197.052 1080 198.605 1080.12 200.158 1080.37C200.159 1080.38 200.163 1080.39 200.164 1080.41C200.225 1080.39 200.29 1080.39 200.36 1080.4C200.694 1080.46 201 1080.78 201.037 1081.12C201.045 1081.19 201.038 1081.26 201.022 1081.31C201.034 1081.32 201.046 1081.32 201.058 1081.32C201.499 1085.5 201.481 1088.45 201.002 1092.63C201.002 1092.63 201.003 1092.63 201.003 1092.64C201.003 1092.64 201.001 1092.64 201.001 1092.64C200.997 1092.67 200.994 1092.71 200.99 1092.74C200.983 1092.74 200.977 1092.74 200.97 1092.74C200.914 1092.87 200.794 1092.97 200.663 1093C200.604 1093.01 200.554 1092.99 200.51 1092.97C200.5 1092.98 200.488 1092.99 200.478 1093C198.405 1091.98 197.282 1091.22 195.499 1088.89C193.717 1091.22 192.675 1091.98 190.52 1093C190.51 1092.99 190.499 1092.98 190.488 1092.97C190.445 1092.99 190.395 1093.01 190.335 1093C190.204 1092.97 190.085 1092.87 190.029 1092.74C190.022 1092.74 190.015 1092.74 190.009 1092.74C190.005 1092.71 190.001 1092.67 189.998 1092.64C189.997 1092.64 189.996 1092.64 189.996 1092.64C189.995 1092.63 189.996 1092.63 189.996 1092.63C189.518 1088.45 189.499 1085.5 189.941 1081.32C189.953 1081.32 189.965 1081.32 189.977 1081.31C189.961 1081.26 189.954 1081.19 189.961 1081.12C189.999 1080.78 190.304 1080.46 190.639 1080.4C190.709 1080.39 190.774 1080.39 190.834 1080.41C190.836 1080.39 190.84 1080.38 190.841 1080.37C192.394 1080.12 193.947 1080 195.499 1080Z"
              fill="#FF8D28"
            />
          </g>
          <path d="M86 1174H766" stroke="#818283" stroke-width="0.25" />
          <circle cx="188.5" cy="1301.5" r="14.5" fill="#4B5563" />
          <path
            d="M186.257 1301.52C186.257 1302.72 185.261 1303.69 184.032 1303.69C182.803 1303.69 181.807 1302.72 181.807 1301.52C181.807 1300.32 182.803 1299.35 184.032 1299.35C185.261 1299.35 186.257 1300.32 186.257 1301.52Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M190.709 1296.73L186.258 1299.77"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M190.709 1306.3L186.258 1303.26"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M195.162 1307.16C195.162 1308.36 194.165 1309.33 192.936 1309.33C191.707 1309.33 190.711 1308.36 190.711 1307.16C190.711 1305.96 191.707 1304.99 192.936 1304.99C194.165 1304.99 195.162 1305.96 195.162 1307.16Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M195.162 1295.86C195.162 1297.06 194.165 1298.03 192.936 1298.03C191.707 1298.03 190.711 1297.06 190.711 1295.86C190.711 1294.66 191.707 1293.69 192.936 1293.69C194.165 1293.69 195.162 1294.66 195.162 1295.86Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <rect
            x="30.5"
            y="1059.5"
            width="769"
            height="279"
            rx="5.5"
            fill="white"
            stroke="#E2E2E2"
          />
          <path
            d="M219.867 1156.16C218.701 1156.16 217.734 1155.82 216.969 1155.13C216.208 1154.45 215.828 1153.58 215.828 1152.53H217.016C217.016 1153.26 217.284 1153.86 217.82 1154.33C218.357 1154.79 219.039 1155.02 219.867 1155.02C220.648 1155.02 221.294 1154.83 221.805 1154.45C222.315 1154.07 222.57 1153.58 222.57 1152.98C222.57 1152.66 222.508 1152.39 222.383 1152.15C222.263 1151.91 222.096 1151.72 221.883 1151.57C221.674 1151.42 221.43 1151.29 221.148 1151.17C220.872 1151.05 220.576 1150.95 220.258 1150.88C219.945 1150.8 219.622 1150.72 219.289 1150.62C218.956 1150.53 218.63 1150.44 218.312 1150.35C218 1150.26 217.703 1150.13 217.422 1149.98C217.146 1149.82 216.901 1149.64 216.688 1149.45C216.479 1149.25 216.312 1148.99 216.188 1148.68C216.068 1148.37 216.008 1148.01 216.008 1147.62C216.008 1146.75 216.354 1146.04 217.047 1145.48C217.745 1144.92 218.625 1144.64 219.688 1144.64C220.828 1144.64 221.734 1144.95 222.406 1145.57C223.078 1146.18 223.414 1146.96 223.414 1147.89H222.188C222.161 1147.28 221.914 1146.77 221.445 1146.38C220.982 1145.99 220.385 1145.79 219.656 1145.79C218.927 1145.79 218.333 1145.96 217.875 1146.3C217.422 1146.64 217.195 1147.08 217.195 1147.62C217.195 1147.93 217.271 1148.2 217.422 1148.43C217.573 1148.66 217.773 1148.84 218.023 1148.98C218.279 1149.11 218.57 1149.23 218.898 1149.34C219.227 1149.43 219.573 1149.53 219.938 1149.62C220.302 1149.7 220.664 1149.79 221.023 1149.89C221.388 1149.99 221.734 1150.12 222.062 1150.28C222.391 1150.44 222.68 1150.64 222.93 1150.86C223.185 1151.08 223.388 1151.37 223.539 1151.73C223.69 1152.09 223.766 1152.51 223.766 1152.98C223.766 1153.9 223.396 1154.66 222.656 1155.26C221.922 1155.86 220.992 1156.16 219.867 1156.16ZM226.328 1149.23C227.104 1148.45 228.057 1148.06 229.188 1148.06C230.318 1148.06 231.271 1148.45 232.047 1149.23C232.828 1150.01 233.219 1150.97 233.219 1152.11C233.219 1153.25 232.828 1154.21 232.047 1154.99C231.271 1155.77 230.318 1156.16 229.188 1156.16C228.057 1156.16 227.104 1155.77 226.328 1154.99C225.557 1154.21 225.172 1153.25 225.172 1152.11C225.172 1150.97 225.557 1150.01 226.328 1149.23ZM229.188 1149.17C228.38 1149.17 227.701 1149.45 227.148 1150.02C226.596 1150.58 226.32 1151.28 226.32 1152.11C226.32 1152.94 226.596 1153.64 227.148 1154.2C227.701 1154.77 228.38 1155.05 229.188 1155.05C229.995 1155.05 230.677 1154.77 231.234 1154.2C231.792 1153.63 232.07 1152.93 232.07 1152.11C232.07 1151.28 231.792 1150.59 231.234 1150.02C230.682 1149.46 230 1149.17 229.188 1149.17ZM240.93 1148.23H242.102V1156H240.93V1154.49C240.68 1155.02 240.326 1155.43 239.867 1155.72C239.414 1156.01 238.883 1156.16 238.273 1156.16C237.273 1156.16 236.477 1155.84 235.883 1155.22C235.289 1154.59 234.992 1153.76 234.992 1152.7V1148.23H236.164V1152.58C236.164 1153.33 236.378 1153.93 236.805 1154.38C237.232 1154.83 237.802 1155.05 238.516 1155.05C239.25 1155.05 239.836 1154.83 240.273 1154.38C240.711 1153.93 240.93 1153.33 240.93 1152.58V1148.23ZM247.695 1148.06C247.898 1148.06 248.141 1148.09 248.422 1148.16V1149.25C248.167 1149.16 247.914 1149.12 247.664 1149.12C247.055 1149.12 246.542 1149.33 246.125 1149.77C245.714 1150.19 245.508 1150.73 245.508 1151.39V1156H244.336V1148.23H245.508V1149.47C245.737 1149.03 246.042 1148.69 246.422 1148.44C246.802 1148.19 247.227 1148.06 247.695 1148.06ZM252.844 1156.16C251.714 1156.16 250.76 1155.77 249.984 1154.99C249.214 1154.21 248.828 1153.25 248.828 1152.11C248.828 1150.97 249.214 1150.01 249.984 1149.23C250.76 1148.45 251.714 1148.06 252.844 1148.06C253.724 1148.06 254.508 1148.32 255.195 1148.84C255.883 1149.35 256.299 1149.99 256.445 1150.77H255.258C255.128 1150.3 254.836 1149.92 254.383 1149.62C253.93 1149.32 253.417 1149.17 252.844 1149.17C252.036 1149.17 251.357 1149.45 250.805 1150.02C250.253 1150.58 249.977 1151.28 249.977 1152.11C249.977 1152.94 250.253 1153.64 250.805 1154.2C251.357 1154.77 252.036 1155.05 252.844 1155.05C253.422 1155.05 253.94 1154.9 254.398 1154.59C254.862 1154.27 255.148 1153.87 255.258 1153.38H256.445C256.326 1154.19 255.919 1154.85 255.227 1155.38C254.539 1155.9 253.745 1156.16 252.844 1156.16ZM265.289 1151.88C265.289 1152.11 265.284 1152.26 265.273 1152.32H258.758C258.815 1153.15 259.102 1153.83 259.617 1154.34C260.133 1154.85 260.797 1155.1 261.609 1155.1C262.234 1155.1 262.771 1154.96 263.219 1154.68C263.672 1154.39 263.951 1154.01 264.055 1153.54H265.227C265.076 1154.33 264.664 1154.96 263.992 1155.44C263.32 1155.92 262.516 1156.16 261.578 1156.16C260.448 1156.16 259.503 1155.77 258.742 1154.98C257.987 1154.2 257.609 1153.23 257.609 1152.06C257.609 1150.94 257.992 1150 258.758 1149.23C259.523 1148.45 260.458 1148.06 261.562 1148.06C262.255 1148.06 262.885 1148.23 263.453 1148.55C264.021 1148.88 264.469 1149.33 264.797 1149.91C265.125 1150.5 265.289 1151.15 265.289 1151.88ZM258.812 1151.33H264.039C263.982 1150.68 263.719 1150.15 263.25 1149.74C262.786 1149.33 262.208 1149.12 261.516 1149.12C260.828 1149.12 260.24 1149.32 259.75 1149.72C259.26 1150.12 258.948 1150.66 258.812 1151.33ZM273.398 1144.8H274.57V1156H273.398V1154.2C273.112 1154.82 272.695 1155.3 272.148 1155.65C271.607 1155.99 270.969 1156.16 270.234 1156.16C269.531 1156.16 268.883 1155.98 268.289 1155.62C267.701 1155.26 267.234 1154.77 266.891 1154.14C266.547 1153.52 266.375 1152.83 266.375 1152.09C266.375 1151.35 266.547 1150.67 266.891 1150.05C267.234 1149.43 267.701 1148.95 268.289 1148.59C268.883 1148.24 269.531 1148.06 270.234 1148.06C270.969 1148.06 271.609 1148.23 272.156 1148.58C272.703 1148.92 273.117 1149.4 273.398 1150.02V1144.8ZM270.453 1155.05C271.302 1155.05 272.005 1154.78 272.562 1154.22C273.12 1153.66 273.398 1152.95 273.398 1152.09C273.398 1151.24 273.12 1150.54 272.562 1149.98C272.005 1149.43 271.302 1149.15 270.453 1149.15C269.63 1149.15 268.935 1149.43 268.367 1150.01C267.805 1150.58 267.523 1151.28 267.523 1152.09C267.523 1152.93 267.805 1153.63 268.367 1154.2C268.935 1154.77 269.63 1155.05 270.453 1155.05ZM284.008 1148.78C285.023 1148.78 285.878 1149.13 286.57 1149.84C287.263 1150.54 287.609 1151.41 287.609 1152.45C287.609 1153.12 287.44 1153.74 287.102 1154.31C286.763 1154.88 286.305 1155.33 285.727 1155.66C285.148 1155.99 284.518 1156.16 283.836 1156.16C283.154 1156.16 282.523 1155.99 281.945 1155.66C281.372 1155.33 280.917 1154.88 280.578 1154.31C280.245 1153.74 280.078 1153.12 280.078 1152.45C280.078 1152.04 280.156 1151.6 280.312 1151.1C280.474 1150.61 280.703 1150.12 281 1149.65L284.023 1144.8H285.406L282.633 1149.15C283.065 1148.9 283.523 1148.78 284.008 1148.78ZM283.836 1155.01C284.57 1155.01 285.188 1154.76 285.688 1154.27C286.193 1153.77 286.445 1153.15 286.445 1152.43C286.445 1151.7 286.19 1151.08 285.68 1150.58C285.174 1150.07 284.555 1149.82 283.82 1149.82C283.102 1149.82 282.492 1150.07 281.992 1150.58C281.492 1151.08 281.242 1151.7 281.242 1152.43C281.242 1153.15 281.492 1153.77 281.992 1154.27C282.492 1154.76 283.107 1155.01 283.836 1155.01ZM299.602 1144.8H300.773V1156H299.602V1154.2C299.315 1154.82 298.898 1155.3 298.352 1155.65C297.81 1155.99 297.172 1156.16 296.438 1156.16C295.734 1156.16 295.086 1155.98 294.492 1155.62C293.904 1155.26 293.438 1154.77 293.094 1154.14C292.75 1153.52 292.578 1152.83 292.578 1152.09C292.578 1151.35 292.75 1150.67 293.094 1150.05C293.438 1149.43 293.904 1148.95 294.492 1148.59C295.086 1148.24 295.734 1148.06 296.438 1148.06C297.172 1148.06 297.812 1148.23 298.359 1148.58C298.906 1148.92 299.32 1149.4 299.602 1150.02V1144.8ZM296.656 1155.05C297.505 1155.05 298.208 1154.78 298.766 1154.22C299.323 1153.66 299.602 1152.95 299.602 1152.09C299.602 1151.24 299.323 1150.54 298.766 1149.98C298.208 1149.43 297.505 1149.15 296.656 1149.15C295.833 1149.15 295.138 1149.43 294.57 1150.01C294.008 1150.58 293.727 1151.28 293.727 1152.09C293.727 1152.93 294.008 1153.63 294.57 1154.2C295.138 1154.77 295.833 1155.05 296.656 1155.05ZM309.336 1148.23H310.508V1156H309.336V1154.2C309.049 1154.82 308.633 1155.3 308.086 1155.65C307.544 1155.99 306.906 1156.16 306.172 1156.16C305.469 1156.16 304.82 1155.98 304.227 1155.62C303.638 1155.26 303.172 1154.77 302.828 1154.14C302.484 1153.52 302.312 1152.83 302.312 1152.09C302.312 1151.35 302.484 1150.67 302.828 1150.05C303.172 1149.43 303.638 1148.95 304.227 1148.59C304.82 1148.24 305.469 1148.06 306.172 1148.06C306.906 1148.06 307.547 1148.23 308.094 1148.58C308.641 1148.92 309.055 1149.4 309.336 1150.02V1148.23ZM306.391 1155.05C307.24 1155.05 307.943 1154.78 308.5 1154.22C309.057 1153.66 309.336 1152.95 309.336 1152.09C309.336 1151.24 309.057 1150.54 308.5 1149.98C307.943 1149.43 307.24 1149.15 306.391 1149.15C305.568 1149.15 304.872 1149.43 304.305 1150.01C303.742 1150.58 303.461 1151.28 303.461 1152.09C303.461 1152.93 303.742 1153.63 304.305 1154.2C304.872 1154.77 305.568 1155.05 306.391 1155.05ZM318.266 1148.23H319.516L315.016 1158.95H313.766L315.109 1155.86L311.898 1148.23H313.164L315.703 1154.49L318.266 1148.23ZM323.352 1156.16C322.477 1156.16 321.753 1155.93 321.18 1155.49C320.607 1155.05 320.281 1154.45 320.203 1153.7H321.32C321.372 1154.14 321.581 1154.49 321.945 1154.76C322.31 1155.02 322.763 1155.15 323.305 1155.15C323.846 1155.15 324.281 1155.03 324.609 1154.78C324.943 1154.53 325.109 1154.21 325.109 1153.82C325.109 1153.56 325.042 1153.34 324.906 1153.16C324.771 1152.98 324.591 1152.85 324.367 1152.76C324.148 1152.67 323.898 1152.59 323.617 1152.52C323.336 1152.44 323.047 1152.38 322.75 1152.34C322.453 1152.29 322.164 1152.22 321.883 1152.12C321.602 1152.02 321.349 1151.9 321.125 1151.77C320.906 1151.62 320.729 1151.43 320.594 1151.17C320.458 1150.91 320.391 1150.6 320.391 1150.24C320.391 1149.6 320.643 1149.08 321.148 1148.67C321.654 1148.27 322.323 1148.06 323.156 1148.06C323.922 1148.06 324.581 1148.27 325.133 1148.67C325.69 1149.07 326.013 1149.61 326.102 1150.29H324.922C324.865 1149.92 324.669 1149.62 324.336 1149.39C324.003 1149.16 323.599 1149.04 323.125 1149.04C322.651 1149.04 322.266 1149.14 321.969 1149.35C321.677 1149.55 321.531 1149.82 321.531 1150.16C321.531 1150.44 321.617 1150.67 321.789 1150.84C321.966 1151.02 322.193 1151.15 322.469 1151.23C322.745 1151.32 323.049 1151.39 323.383 1151.45C323.721 1151.51 324.057 1151.58 324.391 1151.67C324.729 1151.76 325.036 1151.88 325.312 1152.02C325.589 1152.17 325.812 1152.39 325.984 1152.69C326.161 1152.98 326.25 1153.35 326.25 1153.79C326.25 1154.48 325.974 1155.04 325.422 1155.49C324.875 1155.93 324.185 1156.16 323.352 1156.16ZM338.477 1148.23H339.648V1156H338.477V1154.2C338.19 1154.82 337.773 1155.3 337.227 1155.65C336.685 1155.99 336.047 1156.16 335.312 1156.16C334.609 1156.16 333.961 1155.98 333.367 1155.62C332.779 1155.26 332.312 1154.77 331.969 1154.14C331.625 1153.52 331.453 1152.83 331.453 1152.09C331.453 1151.35 331.625 1150.67 331.969 1150.05C332.312 1149.43 332.779 1148.95 333.367 1148.59C333.961 1148.24 334.609 1148.06 335.312 1148.06C336.047 1148.06 336.688 1148.23 337.234 1148.58C337.781 1148.92 338.195 1149.4 338.477 1150.02V1148.23ZM335.531 1155.05C336.38 1155.05 337.083 1154.78 337.641 1154.22C338.198 1153.66 338.477 1152.95 338.477 1152.09C338.477 1151.24 338.198 1150.54 337.641 1149.98C337.083 1149.43 336.38 1149.15 335.531 1149.15C334.708 1149.15 334.013 1149.43 333.445 1150.01C332.883 1150.58 332.602 1151.28 332.602 1152.09C332.602 1152.93 332.883 1153.63 333.445 1154.2C334.013 1154.77 334.708 1155.05 335.531 1155.05ZM348.445 1148.21H349.617V1155.76C349.617 1156.83 349.255 1157.68 348.531 1158.34C347.807 1158.99 346.878 1159.31 345.742 1159.31C345.294 1159.31 344.859 1159.26 344.438 1159.14C344.016 1159.03 343.622 1158.87 343.258 1158.66C342.898 1158.44 342.604 1158.15 342.375 1157.79C342.151 1157.43 342.031 1157.02 342.016 1156.56H343.148C343.164 1157.09 343.417 1157.52 343.906 1157.84C344.396 1158.16 344.997 1158.32 345.711 1158.32C346.503 1158.32 347.156 1158.09 347.672 1157.62C348.188 1157.15 348.445 1156.55 348.445 1155.8V1154.09C348.159 1154.71 347.742 1155.18 347.195 1155.52C346.654 1155.86 346.016 1156.03 345.281 1156.03C344.578 1156.03 343.93 1155.85 343.336 1155.5C342.747 1155.15 342.281 1154.66 341.938 1154.05C341.594 1153.43 341.422 1152.76 341.422 1152.03C341.422 1151.31 341.594 1150.64 341.938 1150.03C342.281 1149.42 342.747 1148.94 343.336 1148.59C343.93 1148.24 344.578 1148.06 345.281 1148.06C346.016 1148.06 346.654 1148.23 347.195 1148.57C347.742 1148.9 348.159 1149.38 348.445 1149.98V1148.21ZM345.5 1154.95C346.349 1154.95 347.052 1154.67 347.609 1154.12C348.167 1153.57 348.445 1152.88 348.445 1152.03C348.445 1151.2 348.167 1150.51 347.609 1149.96C347.052 1149.41 346.349 1149.13 345.5 1149.13C344.677 1149.13 343.982 1149.41 343.414 1149.98C342.852 1150.53 342.57 1151.22 342.57 1152.03C342.57 1152.85 342.852 1153.54 343.414 1154.1C343.982 1154.66 344.677 1154.95 345.5 1154.95ZM352.547 1149.23C353.323 1148.45 354.276 1148.06 355.406 1148.06C356.536 1148.06 357.49 1148.45 358.266 1149.23C359.047 1150.01 359.438 1150.97 359.438 1152.11C359.438 1153.25 359.047 1154.21 358.266 1154.99C357.49 1155.77 356.536 1156.16 355.406 1156.16C354.276 1156.16 353.323 1155.77 352.547 1154.99C351.776 1154.21 351.391 1153.25 351.391 1152.11C351.391 1150.97 351.776 1150.01 352.547 1149.23ZM355.406 1149.17C354.599 1149.17 353.919 1149.45 353.367 1150.02C352.815 1150.58 352.539 1151.28 352.539 1152.11C352.539 1152.94 352.815 1153.64 353.367 1154.2C353.919 1154.77 354.599 1155.05 355.406 1155.05C356.214 1155.05 356.896 1154.77 357.453 1154.2C358.01 1153.63 358.289 1152.93 358.289 1152.11C358.289 1151.28 358.01 1150.59 357.453 1150.02C356.901 1149.46 356.219 1149.17 355.406 1149.17Z"
            fill="#818283"
          />
          <path
            d="M209.833 1150.83C209.833 1154.05 207.219 1156.67 203.999 1156.67C200.779 1156.67 198.166 1154.05 198.166 1150.83C198.166 1147.61 200.779 1145 203.999 1145C207.219 1145 209.833 1147.61 209.833 1150.83Z"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M204 1147.33V1150.67"
            stroke="#818283"
            stroke-width="1.33"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M202 1143.33H206"
            stroke="#818283"
            stroke-width="1.33"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect
            x="718"
            y="1112"
            width="52"
            height="52"
            rx="6"
            fill="#FFB800"
            fill-opacity="0.12"
          />
          <path
            d="M734.633 1145.02C733.767 1145.79 732.663 1146.18 731.322 1146.18C729.981 1146.18 728.874 1145.79 728.002 1145.02C727.136 1144.26 726.703 1143.28 726.703 1142.1C726.703 1141.26 726.964 1140.51 727.484 1139.84C728.005 1139.16 728.682 1138.7 729.516 1138.46C728.858 1138.24 728.318 1137.85 727.895 1137.28C727.471 1136.71 727.26 1136.09 727.26 1135.42C727.26 1134.38 727.641 1133.53 728.402 1132.86C729.171 1132.18 730.144 1131.84 731.322 1131.84C732.501 1131.84 733.471 1132.18 734.232 1132.86C735.001 1133.53 735.385 1134.38 735.385 1135.42C735.385 1136.09 735.17 1136.71 734.74 1137.28C734.317 1137.85 733.777 1138.24 733.119 1138.46C733.952 1138.7 734.63 1139.16 735.15 1139.84C735.678 1140.51 735.941 1141.26 735.941 1142.1C735.941 1143.28 735.505 1144.26 734.633 1145.02ZM729.447 1137.12C729.936 1137.55 730.561 1137.76 731.322 1137.76C732.084 1137.76 732.706 1137.55 733.188 1137.12C733.676 1136.7 733.92 1136.15 733.92 1135.48C733.92 1134.82 733.676 1134.27 733.188 1133.84C732.706 1133.41 732.084 1133.2 731.322 1133.2C730.561 1133.2 729.936 1133.41 729.447 1133.84C728.965 1134.27 728.725 1134.82 728.725 1135.48C728.725 1136.15 728.965 1136.7 729.447 1137.12ZM729.066 1143.99C729.665 1144.52 730.417 1144.78 731.322 1144.78C732.227 1144.78 732.976 1144.52 733.568 1143.99C734.161 1143.46 734.457 1142.8 734.457 1142C734.457 1141.2 734.161 1140.55 733.568 1140.03C732.976 1139.52 732.227 1139.26 731.322 1139.26C730.411 1139.26 729.659 1139.52 729.066 1140.04C728.474 1140.56 728.178 1141.21 728.178 1142C728.178 1142.8 728.474 1143.46 729.066 1143.99ZM747.543 1141.48V1142.86H745.648V1146H744.145V1142.86H737.045V1141.76L742.201 1132H743.9L738.9 1141.48H744.145V1136.68H745.648V1141.48H747.543ZM753.295 1132.61C753.796 1133.15 754.047 1133.82 754.047 1134.64C754.047 1135.46 753.796 1136.15 753.295 1136.69C752.794 1137.23 752.159 1137.5 751.391 1137.5C750.609 1137.5 749.965 1137.23 749.457 1136.69C748.956 1136.15 748.705 1135.46 748.705 1134.64C748.705 1133.82 748.956 1133.15 749.457 1132.61C749.965 1132.07 750.609 1131.8 751.391 1131.8C752.159 1131.8 752.794 1132.07 753.295 1132.61ZM758.607 1132H759.828L750.531 1146H749.311L758.607 1132ZM752.562 1135.98C752.862 1135.64 753.012 1135.19 753.012 1134.64C753.012 1134.1 752.862 1133.65 752.562 1133.3C752.263 1132.95 751.872 1132.78 751.391 1132.78C750.896 1132.78 750.499 1132.95 750.199 1133.3C749.9 1133.65 749.75 1134.1 749.75 1134.64C749.75 1135.19 749.9 1135.64 750.199 1135.98C750.499 1136.33 750.896 1136.5 751.391 1136.5C751.872 1136.5 752.263 1136.33 752.562 1135.98ZM760.404 1143.34C760.404 1144.17 760.154 1144.85 759.652 1145.39C759.158 1145.93 758.523 1146.2 757.748 1146.2C756.967 1146.2 756.326 1145.93 755.824 1145.39C755.323 1144.86 755.072 1144.18 755.072 1143.34C755.072 1142.52 755.323 1141.85 755.824 1141.31C756.326 1140.77 756.967 1140.5 757.748 1140.5C758.516 1140.5 759.151 1140.77 759.652 1141.31C760.154 1141.85 760.404 1142.52 760.404 1143.34ZM759.369 1143.34C759.369 1142.8 759.219 1142.35 758.92 1142.01C758.62 1141.65 758.23 1141.48 757.748 1141.48C757.253 1141.48 756.856 1141.65 756.557 1142.01C756.257 1142.35 756.107 1142.8 756.107 1143.34C756.107 1143.9 756.257 1144.35 756.557 1144.7C756.856 1145.05 757.253 1145.22 757.748 1145.22C758.236 1145.22 758.627 1145.05 758.92 1144.7C759.219 1144.35 759.369 1143.9 759.369 1143.34Z"
            fill="#FFCC00"
          />
          <path
            d="M107.062 1156V1144.8H110.945C111.82 1144.8 112.568 1145.07 113.188 1145.62C113.807 1146.17 114.117 1146.83 114.117 1147.6C114.117 1148.2 113.935 1148.74 113.57 1149.21C113.206 1149.68 112.753 1149.97 112.211 1150.08C112.914 1150.15 113.505 1150.46 113.984 1151C114.469 1151.54 114.711 1152.18 114.711 1152.91C114.711 1153.77 114.391 1154.5 113.75 1155.1C113.115 1155.7 112.341 1156 111.43 1156H107.062ZM108.258 1149.68H110.914C111.466 1149.68 111.935 1149.49 112.32 1149.12C112.706 1148.75 112.898 1148.29 112.898 1147.76C112.898 1147.26 112.703 1146.83 112.312 1146.48C111.927 1146.13 111.461 1145.95 110.914 1145.95H108.258V1149.68ZM108.258 1154.85H111.367C111.971 1154.85 112.474 1154.65 112.875 1154.25C113.276 1153.85 113.477 1153.35 113.477 1152.77C113.477 1152.18 113.273 1151.69 112.867 1151.29C112.466 1150.89 111.971 1150.69 111.383 1150.69H108.258V1154.85ZM122.93 1148.23H124.102V1156H122.93V1154.2C122.643 1154.82 122.227 1155.3 121.68 1155.65C121.138 1155.99 120.5 1156.16 119.766 1156.16C119.062 1156.16 118.414 1155.98 117.82 1155.62C117.232 1155.26 116.766 1154.77 116.422 1154.14C116.078 1153.52 115.906 1152.83 115.906 1152.09C115.906 1151.35 116.078 1150.67 116.422 1150.05C116.766 1149.43 117.232 1148.95 117.82 1148.59C118.414 1148.24 119.062 1148.06 119.766 1148.06C120.5 1148.06 121.141 1148.23 121.688 1148.58C122.234 1148.92 122.648 1149.4 122.93 1150.02V1148.23ZM119.984 1155.05C120.833 1155.05 121.536 1154.78 122.094 1154.22C122.651 1153.66 122.93 1152.95 122.93 1152.09C122.93 1151.24 122.651 1150.54 122.094 1149.98C121.536 1149.43 120.833 1149.15 119.984 1149.15C119.161 1149.15 118.466 1149.43 117.898 1150.01C117.336 1150.58 117.055 1151.28 117.055 1152.09C117.055 1152.93 117.336 1153.63 117.898 1154.2C118.466 1154.77 119.161 1155.05 119.984 1155.05ZM130.164 1148.06C131.169 1148.06 131.966 1148.38 132.555 1149C133.148 1149.62 133.445 1150.46 133.445 1151.52V1156H132.273V1151.63C132.273 1150.89 132.057 1150.29 131.625 1149.84C131.198 1149.4 130.63 1149.17 129.922 1149.17C129.193 1149.17 128.607 1149.4 128.164 1149.85C127.727 1150.3 127.508 1150.89 127.508 1151.63V1156H126.336V1148.23H127.508V1149.74C127.758 1149.21 128.112 1148.8 128.57 1148.51C129.029 1148.21 129.56 1148.06 130.164 1148.06ZM142.242 1148.21H143.414V1155.76C143.414 1156.83 143.052 1157.68 142.328 1158.34C141.604 1158.99 140.674 1159.31 139.539 1159.31C139.091 1159.31 138.656 1159.26 138.234 1159.14C137.812 1159.03 137.419 1158.87 137.055 1158.66C136.695 1158.44 136.401 1158.15 136.172 1157.79C135.948 1157.43 135.828 1157.02 135.812 1156.56H136.945C136.961 1157.09 137.214 1157.52 137.703 1157.84C138.193 1158.16 138.794 1158.32 139.508 1158.32C140.299 1158.32 140.953 1158.09 141.469 1157.62C141.984 1157.15 142.242 1156.55 142.242 1155.8V1154.09C141.956 1154.71 141.539 1155.18 140.992 1155.52C140.451 1155.86 139.812 1156.03 139.078 1156.03C138.375 1156.03 137.727 1155.85 137.133 1155.5C136.544 1155.15 136.078 1154.66 135.734 1154.05C135.391 1153.43 135.219 1152.76 135.219 1152.03C135.219 1151.31 135.391 1150.64 135.734 1150.03C136.078 1149.42 136.544 1148.94 137.133 1148.59C137.727 1148.24 138.375 1148.06 139.078 1148.06C139.812 1148.06 140.451 1148.23 140.992 1148.57C141.539 1148.9 141.956 1149.38 142.242 1149.98V1148.21ZM139.297 1154.95C140.146 1154.95 140.849 1154.67 141.406 1154.12C141.964 1153.57 142.242 1152.88 142.242 1152.03C142.242 1151.2 141.964 1150.51 141.406 1149.96C140.849 1149.41 140.146 1149.13 139.297 1149.13C138.474 1149.13 137.779 1149.41 137.211 1149.98C136.648 1150.53 136.367 1151.22 136.367 1152.03C136.367 1152.85 136.648 1153.54 137.211 1154.1C137.779 1154.66 138.474 1154.95 139.297 1154.95ZM152.211 1148.23H153.383V1156H152.211V1154.2C151.924 1154.82 151.508 1155.3 150.961 1155.65C150.419 1155.99 149.781 1156.16 149.047 1156.16C148.344 1156.16 147.695 1155.98 147.102 1155.62C146.513 1155.26 146.047 1154.77 145.703 1154.14C145.359 1153.52 145.188 1152.83 145.188 1152.09C145.188 1151.35 145.359 1150.67 145.703 1150.05C146.047 1149.43 146.513 1148.95 147.102 1148.59C147.695 1148.24 148.344 1148.06 149.047 1148.06C149.781 1148.06 150.422 1148.23 150.969 1148.58C151.516 1148.92 151.93 1149.4 152.211 1150.02V1148.23ZM149.266 1155.05C150.115 1155.05 150.818 1154.78 151.375 1154.22C151.932 1153.66 152.211 1152.95 152.211 1152.09C152.211 1151.24 151.932 1150.54 151.375 1149.98C150.818 1149.43 150.115 1149.15 149.266 1149.15C148.443 1149.15 147.747 1149.43 147.18 1150.01C146.617 1150.58 146.336 1151.28 146.336 1152.09C146.336 1152.93 146.617 1153.63 147.18 1154.2C147.747 1154.77 148.443 1155.05 149.266 1155.05ZM156.789 1144.8V1156H155.617V1144.8H156.789ZM159.484 1149.23C160.26 1148.45 161.214 1148.06 162.344 1148.06C163.474 1148.06 164.427 1148.45 165.203 1149.23C165.984 1150.01 166.375 1150.97 166.375 1152.11C166.375 1153.25 165.984 1154.21 165.203 1154.99C164.427 1155.77 163.474 1156.16 162.344 1156.16C161.214 1156.16 160.26 1155.77 159.484 1154.99C158.714 1154.21 158.328 1153.25 158.328 1152.11C158.328 1150.97 158.714 1150.01 159.484 1149.23ZM162.344 1149.17C161.536 1149.17 160.857 1149.45 160.305 1150.02C159.753 1150.58 159.477 1151.28 159.477 1152.11C159.477 1152.94 159.753 1153.64 160.305 1154.2C160.857 1154.77 161.536 1155.05 162.344 1155.05C163.151 1155.05 163.833 1154.77 164.391 1154.2C164.948 1153.63 165.227 1152.93 165.227 1152.11C165.227 1151.28 164.948 1150.59 164.391 1150.02C163.839 1149.46 163.156 1149.17 162.344 1149.17ZM171.508 1148.06C171.711 1148.06 171.953 1148.09 172.234 1148.16V1149.25C171.979 1149.16 171.727 1149.12 171.477 1149.12C170.867 1149.12 170.354 1149.33 169.938 1149.77C169.526 1150.19 169.32 1150.73 169.32 1151.39V1156H168.148V1148.23H169.32V1149.47C169.549 1149.03 169.854 1148.69 170.234 1148.44C170.615 1148.19 171.039 1148.06 171.508 1148.06ZM180.32 1151.88C180.32 1152.11 180.315 1152.26 180.305 1152.32H173.789C173.846 1153.15 174.133 1153.83 174.648 1154.34C175.164 1154.85 175.828 1155.1 176.641 1155.1C177.266 1155.1 177.802 1154.96 178.25 1154.68C178.703 1154.39 178.982 1154.01 179.086 1153.54H180.258C180.107 1154.33 179.695 1154.96 179.023 1155.44C178.352 1155.92 177.547 1156.16 176.609 1156.16C175.479 1156.16 174.534 1155.77 173.773 1154.98C173.018 1154.2 172.641 1153.23 172.641 1152.06C172.641 1150.94 173.023 1150 173.789 1149.23C174.555 1148.45 175.49 1148.06 176.594 1148.06C177.286 1148.06 177.917 1148.23 178.484 1148.55C179.052 1148.88 179.5 1149.33 179.828 1149.91C180.156 1150.5 180.32 1151.15 180.32 1151.88ZM173.844 1151.33H179.07C179.013 1150.68 178.75 1150.15 178.281 1149.74C177.818 1149.33 177.24 1149.12 176.547 1149.12C175.859 1149.12 175.271 1149.32 174.781 1149.72C174.292 1150.12 173.979 1150.66 173.844 1151.33Z"
            fill="#4B5563"
          />
          <path
            d="M99.3327 1148.67C99.3327 1152.67 93.9993 1156.67 93.9993 1156.67C93.9993 1156.67 88.666 1152.67 88.666 1148.67C88.666 1147.25 89.2279 1145.89 90.2281 1144.89C91.2283 1143.89 92.5849 1143.33 93.9993 1143.33C95.4138 1143.33 96.7704 1143.89 97.7706 1144.89C98.7708 1145.89 99.3327 1147.25 99.3327 1148.67Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M94 1150.67C95.1046 1150.67 96 1149.77 96 1148.67C96 1147.56 95.1046 1146.67 94 1146.67C92.8954 1146.67 92 1147.56 92 1148.67C92 1149.77 92.8954 1150.67 94 1150.67Z"
            stroke="#4B5563"
            stroke-width="1.33333"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M87.2656 1198.8H93.5234V1199.95H88.4609V1203.44H92.9766V1204.59H88.4609V1208.85H93.5234V1210H87.2656V1198.8ZM101.992 1210H100.602L98.375 1206.95L96.1484 1210H94.7734L97.6875 1205.98L94.9531 1202.23H96.3438L98.3906 1205.04L100.422 1202.23H101.797L99.0781 1205.98L101.992 1210ZM107.797 1202.06C108.5 1202.06 109.146 1202.24 109.734 1202.6C110.328 1202.96 110.797 1203.45 111.141 1204.07C111.484 1204.69 111.656 1205.37 111.656 1206.11C111.656 1206.85 111.484 1207.53 111.141 1208.16C110.797 1208.78 110.328 1209.27 109.734 1209.62C109.146 1209.98 108.5 1210.16 107.797 1210.16C107.062 1210.16 106.422 1209.99 105.875 1209.65C105.333 1209.3 104.919 1208.82 104.633 1208.2V1212.93H103.461V1202.23H104.633V1204.02C104.914 1203.4 105.328 1202.92 105.875 1202.58C106.422 1202.23 107.062 1202.06 107.797 1202.06ZM107.578 1209.05C108.401 1209.05 109.094 1208.77 109.656 1208.2C110.219 1207.64 110.5 1206.94 110.5 1206.11C110.5 1205.28 110.219 1204.58 109.656 1204.01C109.094 1203.43 108.401 1203.15 107.578 1203.15C106.729 1203.15 106.026 1203.43 105.469 1203.99C104.911 1204.55 104.633 1205.26 104.633 1206.11C104.633 1206.96 104.911 1207.66 105.469 1208.22C106.026 1208.78 106.729 1209.05 107.578 1209.05ZM120.398 1205.88C120.398 1206.11 120.393 1206.26 120.383 1206.32H113.867C113.924 1207.15 114.211 1207.83 114.727 1208.34C115.242 1208.85 115.906 1209.1 116.719 1209.1C117.344 1209.1 117.88 1208.96 118.328 1208.68C118.781 1208.39 119.06 1208.01 119.164 1207.54H120.336C120.185 1208.33 119.773 1208.96 119.102 1209.44C118.43 1209.92 117.625 1210.16 116.688 1210.16C115.557 1210.16 114.612 1209.77 113.852 1208.98C113.096 1208.2 112.719 1207.23 112.719 1206.06C112.719 1204.94 113.102 1204 113.867 1203.23C114.633 1202.45 115.568 1202.06 116.672 1202.06C117.365 1202.06 117.995 1202.23 118.562 1202.55C119.13 1202.88 119.578 1203.33 119.906 1203.91C120.234 1204.5 120.398 1205.15 120.398 1205.88ZM113.922 1205.33H119.148C119.091 1204.68 118.828 1204.15 118.359 1203.74C117.896 1203.33 117.318 1203.12 116.625 1203.12C115.938 1203.12 115.349 1203.32 114.859 1203.72C114.37 1204.12 114.057 1204.66 113.922 1205.33ZM125.555 1202.06C125.758 1202.06 126 1202.09 126.281 1202.16V1203.25C126.026 1203.16 125.773 1203.12 125.523 1203.12C124.914 1203.12 124.401 1203.33 123.984 1203.77C123.573 1204.19 123.367 1204.73 123.367 1205.39V1210H122.195V1202.23H123.367V1203.47C123.596 1203.03 123.901 1202.69 124.281 1202.44C124.661 1202.19 125.086 1202.06 125.555 1202.06ZM128.383 1198.83C128.607 1198.83 128.805 1198.91 128.977 1199.08C129.148 1199.24 129.234 1199.44 129.234 1199.66C129.234 1199.89 129.148 1200.09 128.977 1200.27C128.805 1200.43 128.607 1200.52 128.383 1200.52C128.154 1200.52 127.958 1200.43 127.797 1200.27C127.635 1200.1 127.555 1199.9 127.555 1199.66C127.555 1199.44 127.635 1199.24 127.797 1199.08C127.958 1198.91 128.154 1198.83 128.383 1198.83ZM127.789 1202.23H128.961V1210H127.789V1202.23ZM138.414 1205.88C138.414 1206.11 138.409 1206.26 138.398 1206.32H131.883C131.94 1207.15 132.227 1207.83 132.742 1208.34C133.258 1208.85 133.922 1209.1 134.734 1209.1C135.359 1209.1 135.896 1208.96 136.344 1208.68C136.797 1208.39 137.076 1208.01 137.18 1207.54H138.352C138.201 1208.33 137.789 1208.96 137.117 1209.44C136.445 1209.92 135.641 1210.16 134.703 1210.16C133.573 1210.16 132.628 1209.77 131.867 1208.98C131.112 1208.2 130.734 1207.23 130.734 1206.06C130.734 1204.94 131.117 1204 131.883 1203.23C132.648 1202.45 133.583 1202.06 134.688 1202.06C135.38 1202.06 136.01 1202.23 136.578 1202.55C137.146 1202.88 137.594 1203.33 137.922 1203.91C138.25 1204.5 138.414 1205.15 138.414 1205.88ZM131.938 1205.33H137.164C137.107 1204.68 136.844 1204.15 136.375 1203.74C135.911 1203.33 135.333 1203.12 134.641 1203.12C133.953 1203.12 133.365 1203.32 132.875 1203.72C132.385 1204.12 132.073 1204.66 131.938 1205.33ZM144.039 1202.06C145.044 1202.06 145.841 1202.38 146.43 1203C147.023 1203.62 147.32 1204.46 147.32 1205.52V1210H146.148V1205.63C146.148 1204.89 145.932 1204.29 145.5 1203.84C145.073 1203.4 144.505 1203.17 143.797 1203.17C143.068 1203.17 142.482 1203.4 142.039 1203.85C141.602 1204.3 141.383 1204.89 141.383 1205.63V1210H140.211V1202.23H141.383V1203.74C141.633 1203.21 141.987 1202.8 142.445 1202.51C142.904 1202.21 143.435 1202.06 144.039 1202.06ZM153.109 1210.16C151.979 1210.16 151.026 1209.77 150.25 1208.99C149.479 1208.21 149.094 1207.25 149.094 1206.11C149.094 1204.97 149.479 1204.01 150.25 1203.23C151.026 1202.45 151.979 1202.06 153.109 1202.06C153.99 1202.06 154.773 1202.32 155.461 1202.84C156.148 1203.35 156.565 1203.99 156.711 1204.77H155.523C155.393 1204.3 155.102 1203.92 154.648 1203.62C154.195 1203.32 153.682 1203.17 153.109 1203.17C152.302 1203.17 151.622 1203.45 151.07 1204.02C150.518 1204.58 150.242 1205.28 150.242 1206.11C150.242 1206.94 150.518 1207.64 151.07 1208.2C151.622 1208.77 152.302 1209.05 153.109 1209.05C153.688 1209.05 154.206 1208.9 154.664 1208.59C155.128 1208.27 155.414 1207.87 155.523 1207.38H156.711C156.591 1208.19 156.185 1208.85 155.492 1209.38C154.805 1209.9 154.01 1210.16 153.109 1210.16ZM165.555 1205.88C165.555 1206.11 165.549 1206.26 165.539 1206.32H159.023C159.081 1207.15 159.367 1207.83 159.883 1208.34C160.398 1208.85 161.062 1209.1 161.875 1209.1C162.5 1209.1 163.036 1208.96 163.484 1208.68C163.938 1208.39 164.216 1208.01 164.32 1207.54H165.492C165.341 1208.33 164.93 1208.96 164.258 1209.44C163.586 1209.92 162.781 1210.16 161.844 1210.16C160.714 1210.16 159.768 1209.77 159.008 1208.98C158.253 1208.2 157.875 1207.23 157.875 1206.06C157.875 1204.94 158.258 1204 159.023 1203.23C159.789 1202.45 160.724 1202.06 161.828 1202.06C162.521 1202.06 163.151 1202.23 163.719 1202.55C164.286 1202.88 164.734 1203.33 165.062 1203.91C165.391 1204.5 165.555 1205.15 165.555 1205.88ZM159.078 1205.33H164.305C164.247 1204.68 163.984 1204.15 163.516 1203.74C163.052 1203.33 162.474 1203.12 161.781 1203.12C161.094 1203.12 160.505 1203.32 160.016 1203.72C159.526 1204.12 159.214 1204.66 159.078 1205.33Z"
            fill="#A8A8A8"
          />
          <path
            d="M95.7188 1230.38V1231.48H94.2031V1234H93V1231.48H87.3203V1230.61L91.4453 1222.8H92.8047L88.8047 1230.38H93V1226.55H94.2031V1230.38H95.7188ZM100.305 1222.8H101.773L105.039 1227.76L108.258 1222.8H109.68L105.633 1228.98V1234H104.414V1228.98L100.305 1222.8ZM116.273 1229.88C116.273 1230.11 116.268 1230.26 116.258 1230.32H109.742C109.799 1231.15 110.086 1231.83 110.602 1232.34C111.117 1232.85 111.781 1233.1 112.594 1233.1C113.219 1233.1 113.755 1232.96 114.203 1232.68C114.656 1232.39 114.935 1232.01 115.039 1231.54H116.211C116.06 1232.33 115.648 1232.96 114.977 1233.44C114.305 1233.92 113.5 1234.16 112.562 1234.16C111.432 1234.16 110.487 1233.77 109.727 1232.98C108.971 1232.2 108.594 1231.23 108.594 1230.06C108.594 1228.94 108.977 1228 109.742 1227.23C110.508 1226.45 111.443 1226.06 112.547 1226.06C113.24 1226.06 113.87 1226.23 114.438 1226.55C115.005 1226.88 115.453 1227.33 115.781 1227.91C116.109 1228.5 116.273 1229.15 116.273 1229.88ZM109.797 1229.33H115.023C114.966 1228.68 114.703 1228.15 114.234 1227.74C113.771 1227.33 113.193 1227.12 112.5 1227.12C111.812 1227.12 111.224 1227.32 110.734 1227.72C110.245 1228.12 109.932 1228.66 109.797 1229.33ZM124.383 1226.23H125.555V1234H124.383V1232.2C124.096 1232.82 123.68 1233.3 123.133 1233.65C122.591 1233.99 121.953 1234.16 121.219 1234.16C120.516 1234.16 119.867 1233.98 119.273 1233.62C118.685 1233.26 118.219 1232.77 117.875 1232.14C117.531 1231.52 117.359 1230.83 117.359 1230.09C117.359 1229.35 117.531 1228.67 117.875 1228.05C118.219 1227.43 118.685 1226.95 119.273 1226.59C119.867 1226.24 120.516 1226.06 121.219 1226.06C121.953 1226.06 122.594 1226.23 123.141 1226.58C123.688 1226.92 124.102 1227.4 124.383 1228.02V1226.23ZM121.438 1233.05C122.286 1233.05 122.99 1232.78 123.547 1232.22C124.104 1231.66 124.383 1230.95 124.383 1230.09C124.383 1229.24 124.104 1228.54 123.547 1227.98C122.99 1227.43 122.286 1227.15 121.438 1227.15C120.615 1227.15 119.919 1227.43 119.352 1228.01C118.789 1228.58 118.508 1229.28 118.508 1230.09C118.508 1230.93 118.789 1231.63 119.352 1232.2C119.919 1232.77 120.615 1233.05 121.438 1233.05ZM131.148 1226.06C131.352 1226.06 131.594 1226.09 131.875 1226.16V1227.25C131.62 1227.16 131.367 1227.12 131.117 1227.12C130.508 1227.12 129.995 1227.33 129.578 1227.77C129.167 1228.19 128.961 1228.73 128.961 1229.39V1234H127.789V1226.23H128.961V1227.47C129.19 1227.03 129.495 1226.69 129.875 1226.44C130.255 1226.19 130.68 1226.06 131.148 1226.06ZM135.727 1234.16C134.852 1234.16 134.128 1233.93 133.555 1233.49C132.982 1233.05 132.656 1232.45 132.578 1231.7H133.695C133.747 1232.14 133.956 1232.49 134.32 1232.76C134.685 1233.02 135.138 1233.15 135.68 1233.15C136.221 1233.15 136.656 1233.03 136.984 1232.78C137.318 1232.53 137.484 1232.21 137.484 1231.82C137.484 1231.56 137.417 1231.34 137.281 1231.16C137.146 1230.98 136.966 1230.85 136.742 1230.76C136.523 1230.67 136.273 1230.59 135.992 1230.52C135.711 1230.44 135.422 1230.38 135.125 1230.34C134.828 1230.29 134.539 1230.22 134.258 1230.12C133.977 1230.02 133.724 1229.9 133.5 1229.77C133.281 1229.62 133.104 1229.43 132.969 1229.17C132.833 1228.91 132.766 1228.6 132.766 1228.24C132.766 1227.6 133.018 1227.08 133.523 1226.67C134.029 1226.27 134.698 1226.06 135.531 1226.06C136.297 1226.06 136.956 1226.27 137.508 1226.67C138.065 1227.07 138.388 1227.61 138.477 1228.29H137.297C137.24 1227.92 137.044 1227.62 136.711 1227.39C136.378 1227.16 135.974 1227.04 135.5 1227.04C135.026 1227.04 134.641 1227.14 134.344 1227.35C134.052 1227.55 133.906 1227.82 133.906 1228.16C133.906 1228.44 133.992 1228.67 134.164 1228.84C134.341 1229.02 134.568 1229.15 134.844 1229.23C135.12 1229.32 135.424 1229.39 135.758 1229.45C136.096 1229.51 136.432 1229.58 136.766 1229.67C137.104 1229.76 137.411 1229.88 137.688 1230.02C137.964 1230.17 138.188 1230.39 138.359 1230.69C138.536 1230.98 138.625 1231.35 138.625 1231.79C138.625 1232.48 138.349 1233.04 137.797 1233.49C137.25 1233.93 136.56 1234.16 135.727 1234.16Z"
            fill="#4B5563"
          />
          <path
            d="M270.547 1222.8V1234H269.328V1224.46L266.75 1226.67V1225.19L269.664 1222.8H270.547ZM275.859 1234.16C274.88 1234.16 274.042 1233.89 273.344 1233.34C272.646 1232.8 272.253 1232.09 272.164 1231.2H273.367C273.482 1231.73 273.766 1232.17 274.219 1232.5C274.677 1232.83 275.224 1232.99 275.859 1232.99C276.568 1232.99 277.167 1232.76 277.656 1232.28C278.146 1231.8 278.391 1231.22 278.391 1230.53C278.391 1229.81 278.146 1229.21 277.656 1228.71C277.167 1228.22 276.568 1227.97 275.859 1227.97C275.427 1227.97 275.023 1228.04 274.648 1228.18C274.279 1228.32 273.984 1228.51 273.766 1228.77H272.727L273.25 1222.8H278.93V1223.94H274.328L273.953 1227.63C274.182 1227.42 274.482 1227.25 274.852 1227.13C275.227 1227.01 275.612 1226.95 276.008 1226.95C277.039 1226.95 277.898 1227.28 278.586 1227.96C279.273 1228.63 279.617 1229.49 279.617 1230.55C279.617 1231.55 279.253 1232.41 278.523 1233.11C277.794 1233.81 276.906 1234.16 275.859 1234.16ZM288.812 1222.8C289.578 1222.8 290.299 1222.94 290.977 1223.22C291.659 1223.49 292.245 1223.88 292.734 1224.37C293.224 1224.85 293.609 1225.44 293.891 1226.13C294.177 1226.82 294.32 1227.56 294.32 1228.35C294.32 1229.14 294.177 1229.89 293.891 1230.59C293.609 1231.29 293.224 1231.89 292.734 1232.39C292.245 1232.89 291.659 1233.28 290.977 1233.57C290.299 1233.86 289.578 1234 288.812 1234H285.344V1222.8H288.812ZM288.875 1232.85C290.073 1232.85 291.07 1232.42 291.867 1231.57C292.669 1230.71 293.07 1229.64 293.07 1228.35C293.07 1227.08 292.672 1226.02 291.875 1225.2C291.083 1224.37 290.083 1223.95 288.875 1223.95H286.539V1232.85H288.875ZM302.555 1226.23H303.727V1234H302.555V1232.2C302.268 1232.82 301.852 1233.3 301.305 1233.65C300.763 1233.99 300.125 1234.16 299.391 1234.16C298.688 1234.16 298.039 1233.98 297.445 1233.62C296.857 1233.26 296.391 1232.77 296.047 1232.14C295.703 1231.52 295.531 1230.83 295.531 1230.09C295.531 1229.35 295.703 1228.67 296.047 1228.05C296.391 1227.43 296.857 1226.95 297.445 1226.59C298.039 1226.24 298.688 1226.06 299.391 1226.06C300.125 1226.06 300.766 1226.23 301.312 1226.58C301.859 1226.92 302.273 1227.4 302.555 1228.02V1226.23ZM299.609 1233.05C300.458 1233.05 301.161 1232.78 301.719 1232.22C302.276 1231.66 302.555 1230.95 302.555 1230.09C302.555 1229.24 302.276 1228.54 301.719 1227.98C301.161 1227.43 300.458 1227.15 299.609 1227.15C298.786 1227.15 298.091 1227.43 297.523 1228.01C296.961 1228.58 296.68 1229.28 296.68 1230.09C296.68 1230.93 296.961 1231.63 297.523 1232.2C298.091 1232.77 298.786 1233.05 299.609 1233.05ZM311.484 1226.23H312.734L308.234 1236.95H306.984L308.328 1233.86L305.117 1226.23H306.383L308.922 1232.49L311.484 1226.23ZM316.57 1234.16C315.695 1234.16 314.971 1233.93 314.398 1233.49C313.826 1233.05 313.5 1232.45 313.422 1231.7H314.539C314.591 1232.14 314.799 1232.49 315.164 1232.76C315.529 1233.02 315.982 1233.15 316.523 1233.15C317.065 1233.15 317.5 1233.03 317.828 1232.78C318.161 1232.53 318.328 1232.21 318.328 1231.82C318.328 1231.56 318.26 1231.34 318.125 1231.16C317.99 1230.98 317.81 1230.85 317.586 1230.76C317.367 1230.67 317.117 1230.59 316.836 1230.52C316.555 1230.44 316.266 1230.38 315.969 1230.34C315.672 1230.29 315.383 1230.22 315.102 1230.12C314.82 1230.02 314.568 1229.9 314.344 1229.77C314.125 1229.62 313.948 1229.43 313.812 1229.17C313.677 1228.91 313.609 1228.6 313.609 1228.24C313.609 1227.6 313.862 1227.08 314.367 1226.67C314.872 1226.27 315.542 1226.06 316.375 1226.06C317.141 1226.06 317.799 1226.27 318.352 1226.67C318.909 1227.07 319.232 1227.61 319.32 1228.29H318.141C318.083 1227.92 317.888 1227.62 317.555 1227.39C317.221 1227.16 316.818 1227.04 316.344 1227.04C315.87 1227.04 315.484 1227.14 315.188 1227.35C314.896 1227.55 314.75 1227.82 314.75 1228.16C314.75 1228.44 314.836 1228.67 315.008 1228.84C315.185 1229.02 315.411 1229.15 315.688 1229.23C315.964 1229.32 316.268 1229.39 316.602 1229.45C316.94 1229.51 317.276 1229.58 317.609 1229.67C317.948 1229.76 318.255 1229.88 318.531 1230.02C318.807 1230.17 319.031 1230.39 319.203 1230.69C319.38 1230.98 319.469 1231.35 319.469 1231.79C319.469 1232.48 319.193 1233.04 318.641 1233.49C318.094 1233.93 317.404 1234.16 316.57 1234.16Z"
            fill="#4B5563"
          />
          <path
            d="M266.266 1198.8H267.398L273.672 1207.79V1198.8H274.891V1210H273.766L267.461 1201.02V1210H266.266V1198.8ZM277.969 1203.23C278.745 1202.45 279.698 1202.06 280.828 1202.06C281.958 1202.06 282.911 1202.45 283.688 1203.23C284.469 1204.01 284.859 1204.97 284.859 1206.11C284.859 1207.25 284.469 1208.21 283.688 1208.99C282.911 1209.77 281.958 1210.16 280.828 1210.16C279.698 1210.16 278.745 1209.77 277.969 1208.99C277.198 1208.21 276.812 1207.25 276.812 1206.11C276.812 1204.97 277.198 1204.01 277.969 1203.23ZM280.828 1203.17C280.021 1203.17 279.341 1203.45 278.789 1204.02C278.237 1204.58 277.961 1205.28 277.961 1206.11C277.961 1206.94 278.237 1207.64 278.789 1208.2C279.341 1208.77 280.021 1209.05 280.828 1209.05C281.635 1209.05 282.318 1208.77 282.875 1208.2C283.432 1207.63 283.711 1206.93 283.711 1206.11C283.711 1205.28 283.432 1204.59 282.875 1204.02C282.323 1203.46 281.641 1203.17 280.828 1203.17ZM290.336 1203.31H288.164V1207.38C288.164 1208.45 288.708 1208.99 289.797 1208.99C290.016 1208.99 290.195 1208.97 290.336 1208.93V1210C290.102 1210.05 289.852 1210.08 289.586 1210.08C288.773 1210.08 288.138 1209.85 287.68 1209.41C287.221 1208.95 286.992 1208.28 286.992 1207.39V1203.31H285.461V1202.23H286.992V1200.08H288.164V1202.23H290.336V1203.31ZM292.555 1198.83C292.779 1198.83 292.977 1198.91 293.148 1199.08C293.32 1199.24 293.406 1199.44 293.406 1199.66C293.406 1199.89 293.32 1200.09 293.148 1200.27C292.977 1200.43 292.779 1200.52 292.555 1200.52C292.326 1200.52 292.13 1200.43 291.969 1200.27C291.807 1200.1 291.727 1199.9 291.727 1199.66C291.727 1199.44 291.807 1199.24 291.969 1199.08C292.13 1198.91 292.326 1198.83 292.555 1198.83ZM291.961 1202.23H293.133V1210H291.961V1202.23ZM298.922 1210.16C297.792 1210.16 296.839 1209.77 296.062 1208.99C295.292 1208.21 294.906 1207.25 294.906 1206.11C294.906 1204.97 295.292 1204.01 296.062 1203.23C296.839 1202.45 297.792 1202.06 298.922 1202.06C299.802 1202.06 300.586 1202.32 301.273 1202.84C301.961 1203.35 302.378 1203.99 302.523 1204.77H301.336C301.206 1204.3 300.914 1203.92 300.461 1203.62C300.008 1203.32 299.495 1203.17 298.922 1203.17C298.115 1203.17 297.435 1203.45 296.883 1204.02C296.331 1204.58 296.055 1205.28 296.055 1206.11C296.055 1206.94 296.331 1207.64 296.883 1208.2C297.435 1208.77 298.115 1209.05 298.922 1209.05C299.5 1209.05 300.018 1208.9 300.477 1208.59C300.94 1208.27 301.227 1207.87 301.336 1207.38H302.523C302.404 1208.19 301.997 1208.85 301.305 1209.38C300.617 1209.9 299.823 1210.16 298.922 1210.16ZM311.367 1205.88C311.367 1206.11 311.362 1206.26 311.352 1206.32H304.836C304.893 1207.15 305.18 1207.83 305.695 1208.34C306.211 1208.85 306.875 1209.1 307.688 1209.1C308.312 1209.1 308.849 1208.96 309.297 1208.68C309.75 1208.39 310.029 1208.01 310.133 1207.54H311.305C311.154 1208.33 310.742 1208.96 310.07 1209.44C309.398 1209.92 308.594 1210.16 307.656 1210.16C306.526 1210.16 305.581 1209.77 304.82 1208.98C304.065 1208.2 303.688 1207.23 303.688 1206.06C303.688 1204.94 304.07 1204 304.836 1203.23C305.602 1202.45 306.536 1202.06 307.641 1202.06C308.333 1202.06 308.964 1202.23 309.531 1202.55C310.099 1202.88 310.547 1203.33 310.875 1203.91C311.203 1204.5 311.367 1205.15 311.367 1205.88ZM304.891 1205.33H310.117C310.06 1204.68 309.797 1204.15 309.328 1203.74C308.865 1203.33 308.286 1203.12 307.594 1203.12C306.906 1203.12 306.318 1203.32 305.828 1203.72C305.339 1204.12 305.026 1204.66 304.891 1205.33ZM321.477 1198.8C322.419 1198.8 323.206 1199.11 323.836 1199.73C324.471 1200.34 324.789 1201.1 324.789 1202.02C324.789 1202.94 324.471 1203.71 323.836 1204.33C323.206 1204.94 322.419 1205.25 321.477 1205.25H318.367V1210H317.172V1198.8H321.477ZM321.477 1204.09C322.07 1204.09 322.568 1203.9 322.969 1203.5C323.37 1203.1 323.57 1202.6 323.57 1202.02C323.57 1201.43 323.37 1200.94 322.969 1200.55C322.568 1200.15 322.07 1199.95 321.477 1199.95H318.367V1204.09H321.477ZM333.055 1205.88C333.055 1206.11 333.049 1206.26 333.039 1206.32H326.523C326.581 1207.15 326.867 1207.83 327.383 1208.34C327.898 1208.85 328.562 1209.1 329.375 1209.1C330 1209.1 330.536 1208.96 330.984 1208.68C331.438 1208.39 331.716 1208.01 331.82 1207.54H332.992C332.841 1208.33 332.43 1208.96 331.758 1209.44C331.086 1209.92 330.281 1210.16 329.344 1210.16C328.214 1210.16 327.268 1209.77 326.508 1208.98C325.753 1208.2 325.375 1207.23 325.375 1206.06C325.375 1204.94 325.758 1204 326.523 1203.23C327.289 1202.45 328.224 1202.06 329.328 1202.06C330.021 1202.06 330.651 1202.23 331.219 1202.55C331.786 1202.88 332.234 1203.33 332.562 1203.91C332.891 1204.5 333.055 1205.15 333.055 1205.88ZM326.578 1205.33H331.805C331.747 1204.68 331.484 1204.15 331.016 1203.74C330.552 1203.33 329.974 1203.12 329.281 1203.12C328.594 1203.12 328.005 1203.32 327.516 1203.72C327.026 1204.12 326.714 1204.66 326.578 1205.33ZM338.211 1202.06C338.414 1202.06 338.656 1202.09 338.938 1202.16V1203.25C338.682 1203.16 338.43 1203.12 338.18 1203.12C337.57 1203.12 337.057 1203.33 336.641 1203.77C336.229 1204.19 336.023 1204.73 336.023 1205.39V1210H334.852V1202.23H336.023V1203.47C336.253 1203.03 336.557 1202.69 336.938 1202.44C337.318 1202.19 337.742 1202.06 338.211 1202.06ZM341.039 1198.83C341.263 1198.83 341.461 1198.91 341.633 1199.08C341.805 1199.24 341.891 1199.44 341.891 1199.66C341.891 1199.89 341.805 1200.09 341.633 1200.27C341.461 1200.43 341.263 1200.52 341.039 1200.52C340.81 1200.52 340.615 1200.43 340.453 1200.27C340.292 1200.1 340.211 1199.9 340.211 1199.66C340.211 1199.44 340.292 1199.24 340.453 1199.08C340.615 1198.91 340.81 1198.83 341.039 1198.83ZM340.445 1202.23H341.617V1210H340.445V1202.23ZM344.547 1203.23C345.323 1202.45 346.276 1202.06 347.406 1202.06C348.536 1202.06 349.49 1202.45 350.266 1203.23C351.047 1204.01 351.438 1204.97 351.438 1206.11C351.438 1207.25 351.047 1208.21 350.266 1208.99C349.49 1209.77 348.536 1210.16 347.406 1210.16C346.276 1210.16 345.323 1209.77 344.547 1208.99C343.776 1208.21 343.391 1207.25 343.391 1206.11C343.391 1204.97 343.776 1204.01 344.547 1203.23ZM347.406 1203.17C346.599 1203.17 345.919 1203.45 345.367 1204.02C344.815 1204.58 344.539 1205.28 344.539 1206.11C344.539 1206.94 344.815 1207.64 345.367 1208.2C345.919 1208.77 346.599 1209.05 347.406 1209.05C348.214 1209.05 348.896 1208.77 349.453 1208.2C350.01 1207.63 350.289 1206.93 350.289 1206.11C350.289 1205.28 350.01 1204.59 349.453 1204.02C348.901 1203.46 348.219 1203.17 347.406 1203.17ZM359.523 1198.8H360.695V1210H359.523V1208.2C359.237 1208.82 358.82 1209.3 358.273 1209.65C357.732 1209.99 357.094 1210.16 356.359 1210.16C355.656 1210.16 355.008 1209.98 354.414 1209.62C353.826 1209.26 353.359 1208.77 353.016 1208.14C352.672 1207.52 352.5 1206.83 352.5 1206.09C352.5 1205.35 352.672 1204.67 353.016 1204.05C353.359 1203.43 353.826 1202.95 354.414 1202.59C355.008 1202.24 355.656 1202.06 356.359 1202.06C357.094 1202.06 357.734 1202.23 358.281 1202.58C358.828 1202.92 359.242 1203.4 359.523 1204.02V1198.8ZM356.578 1209.05C357.427 1209.05 358.13 1208.78 358.688 1208.22C359.245 1207.66 359.523 1206.95 359.523 1206.09C359.523 1205.24 359.245 1204.54 358.688 1203.98C358.13 1203.43 357.427 1203.15 356.578 1203.15C355.755 1203.15 355.06 1203.43 354.492 1204.01C353.93 1204.58 353.648 1205.28 353.648 1206.09C353.648 1206.93 353.93 1207.63 354.492 1208.2C355.06 1208.77 355.755 1209.05 356.578 1209.05Z"
            fill="#A8A8A8"
          />
          <path
            d="M665.883 1227.57L669.125 1223.95H663.656V1222.8H670.82V1223.65L667.367 1227.42C668.008 1227.34 668.602 1227.42 669.148 1227.67C669.695 1227.92 670.128 1228.29 670.445 1228.8C670.763 1229.3 670.922 1229.88 670.922 1230.52C670.922 1231.58 670.562 1232.45 669.844 1233.13C669.13 1233.82 668.219 1234.16 667.109 1234.16C666.109 1234.16 665.26 1233.88 664.562 1233.34C663.87 1232.79 663.471 1232.08 663.367 1231.2H664.57C664.68 1231.74 664.961 1232.17 665.414 1232.5C665.867 1232.83 666.432 1232.99 667.109 1232.99C667.854 1232.99 668.466 1232.76 668.945 1232.29C669.43 1231.82 669.672 1231.21 669.672 1230.48C669.672 1230.05 669.57 1229.67 669.367 1229.34C669.164 1229 668.888 1228.75 668.539 1228.58C668.19 1228.41 667.786 1228.3 667.328 1228.26C666.87 1228.22 666.388 1228.27 665.883 1228.41V1227.57ZM675.641 1234.16C674.661 1234.16 673.823 1233.89 673.125 1233.34C672.427 1232.8 672.034 1232.09 671.945 1231.2H673.148C673.263 1231.73 673.547 1232.17 674 1232.5C674.458 1232.83 675.005 1232.99 675.641 1232.99C676.349 1232.99 676.948 1232.76 677.438 1232.28C677.927 1231.8 678.172 1231.22 678.172 1230.53C678.172 1229.81 677.927 1229.21 677.438 1228.71C676.948 1228.22 676.349 1227.97 675.641 1227.97C675.208 1227.97 674.805 1228.04 674.43 1228.18C674.06 1228.32 673.766 1228.51 673.547 1228.77H672.508L673.031 1222.8H678.711V1223.94H674.109L673.734 1227.63C673.964 1227.42 674.263 1227.25 674.633 1227.13C675.008 1227.01 675.393 1226.95 675.789 1226.95C676.82 1226.95 677.68 1227.28 678.367 1227.96C679.055 1228.63 679.398 1229.49 679.398 1230.55C679.398 1231.55 679.034 1232.41 678.305 1233.11C677.576 1233.81 676.688 1234.16 675.641 1234.16ZM685.125 1222.8H686.32V1232.85H691.984V1234H685.125V1222.8ZM698.148 1222.8C699.091 1222.8 699.878 1223.11 700.508 1223.73C701.143 1224.34 701.461 1225.1 701.461 1226.02C701.461 1226.94 701.143 1227.71 700.508 1228.33C699.878 1228.94 699.091 1229.25 698.148 1229.25H695.039V1234H693.844V1222.8H698.148ZM698.148 1228.09C698.742 1228.09 699.24 1227.9 699.641 1227.5C700.042 1227.1 700.242 1226.6 700.242 1226.02C700.242 1225.43 700.042 1224.94 699.641 1224.55C699.24 1224.15 698.742 1223.95 698.148 1223.95H695.039V1228.09H698.148ZM709.367 1234L708.281 1231.27H702.984L701.891 1234H700.617L705.094 1222.8H706.18L710.68 1234H709.367ZM703.445 1230.11H707.828L705.641 1224.58L703.445 1230.11Z"
            fill="#4B5563"
          />
          <path
            d="M663.266 1198.8H669.523V1199.95H664.461V1203.44H668.977V1204.59H664.461V1208.85H669.523V1210H663.266V1198.8ZM677.992 1210H676.602L674.375 1206.95L672.148 1210H670.773L673.688 1205.98L670.953 1202.23H672.344L674.391 1205.04L676.422 1202.23H677.797L675.078 1205.98L677.992 1210ZM683.797 1202.06C684.5 1202.06 685.146 1202.24 685.734 1202.6C686.328 1202.96 686.797 1203.45 687.141 1204.07C687.484 1204.69 687.656 1205.37 687.656 1206.11C687.656 1206.85 687.484 1207.53 687.141 1208.16C686.797 1208.78 686.328 1209.27 685.734 1209.62C685.146 1209.98 684.5 1210.16 683.797 1210.16C683.062 1210.16 682.422 1209.99 681.875 1209.65C681.333 1209.3 680.919 1208.82 680.633 1208.2V1212.93H679.461V1202.23H680.633V1204.02C680.914 1203.4 681.328 1202.92 681.875 1202.58C682.422 1202.23 683.062 1202.06 683.797 1202.06ZM683.578 1209.05C684.401 1209.05 685.094 1208.77 685.656 1208.2C686.219 1207.64 686.5 1206.94 686.5 1206.11C686.5 1205.28 686.219 1204.58 685.656 1204.01C685.094 1203.43 684.401 1203.15 683.578 1203.15C682.729 1203.15 682.026 1203.43 681.469 1203.99C680.911 1204.55 680.633 1205.26 680.633 1206.11C680.633 1206.96 680.911 1207.66 681.469 1208.22C682.026 1208.78 682.729 1209.05 683.578 1209.05ZM696.398 1205.88C696.398 1206.11 696.393 1206.26 696.383 1206.32H689.867C689.924 1207.15 690.211 1207.83 690.727 1208.34C691.242 1208.85 691.906 1209.1 692.719 1209.1C693.344 1209.1 693.88 1208.96 694.328 1208.68C694.781 1208.39 695.06 1208.01 695.164 1207.54H696.336C696.185 1208.33 695.773 1208.96 695.102 1209.44C694.43 1209.92 693.625 1210.16 692.688 1210.16C691.557 1210.16 690.612 1209.77 689.852 1208.98C689.096 1208.2 688.719 1207.23 688.719 1206.06C688.719 1204.94 689.102 1204 689.867 1203.23C690.633 1202.45 691.568 1202.06 692.672 1202.06C693.365 1202.06 693.995 1202.23 694.562 1202.55C695.13 1202.88 695.578 1203.33 695.906 1203.91C696.234 1204.5 696.398 1205.15 696.398 1205.88ZM689.922 1205.33H695.148C695.091 1204.68 694.828 1204.15 694.359 1203.74C693.896 1203.33 693.318 1203.12 692.625 1203.12C691.938 1203.12 691.349 1203.32 690.859 1203.72C690.37 1204.12 690.057 1204.66 689.922 1205.33ZM701.5 1210.16C700.37 1210.16 699.417 1209.77 698.641 1208.99C697.87 1208.21 697.484 1207.25 697.484 1206.11C697.484 1204.97 697.87 1204.01 698.641 1203.23C699.417 1202.45 700.37 1202.06 701.5 1202.06C702.38 1202.06 703.164 1202.32 703.852 1202.84C704.539 1203.35 704.956 1203.99 705.102 1204.77H703.914C703.784 1204.3 703.492 1203.92 703.039 1203.62C702.586 1203.32 702.073 1203.17 701.5 1203.17C700.693 1203.17 700.013 1203.45 699.461 1204.02C698.909 1204.58 698.633 1205.28 698.633 1206.11C698.633 1206.94 698.909 1207.64 699.461 1208.2C700.013 1208.77 700.693 1209.05 701.5 1209.05C702.078 1209.05 702.596 1208.9 703.055 1208.59C703.518 1208.27 703.805 1207.87 703.914 1207.38H705.102C704.982 1208.19 704.576 1208.85 703.883 1209.38C703.195 1209.9 702.401 1210.16 701.5 1210.16ZM710.883 1203.31H708.711V1207.38C708.711 1208.45 709.255 1208.99 710.344 1208.99C710.562 1208.99 710.742 1208.97 710.883 1208.93V1210C710.648 1210.05 710.398 1210.08 710.133 1210.08C709.32 1210.08 708.685 1209.85 708.227 1209.41C707.768 1208.95 707.539 1208.28 707.539 1207.39V1203.31H706.008V1202.23H707.539V1200.08H708.711V1202.23H710.883V1203.31ZM719.211 1205.88C719.211 1206.11 719.206 1206.26 719.195 1206.32H712.68C712.737 1207.15 713.023 1207.83 713.539 1208.34C714.055 1208.85 714.719 1209.1 715.531 1209.1C716.156 1209.1 716.693 1208.96 717.141 1208.68C717.594 1208.39 717.872 1208.01 717.977 1207.54H719.148C718.997 1208.33 718.586 1208.96 717.914 1209.44C717.242 1209.92 716.438 1210.16 715.5 1210.16C714.37 1210.16 713.424 1209.77 712.664 1208.98C711.909 1208.2 711.531 1207.23 711.531 1206.06C711.531 1204.94 711.914 1204 712.68 1203.23C713.445 1202.45 714.38 1202.06 715.484 1202.06C716.177 1202.06 716.807 1202.23 717.375 1202.55C717.943 1202.88 718.391 1203.33 718.719 1203.91C719.047 1204.5 719.211 1205.15 719.211 1205.88ZM712.734 1205.33H717.961C717.904 1204.68 717.641 1204.15 717.172 1203.74C716.708 1203.33 716.13 1203.12 715.438 1203.12C714.75 1203.12 714.161 1203.32 713.672 1203.72C713.182 1204.12 712.87 1204.66 712.734 1205.33ZM727.32 1198.8H728.492V1210H727.32V1208.2C727.034 1208.82 726.617 1209.3 726.07 1209.65C725.529 1209.99 724.891 1210.16 724.156 1210.16C723.453 1210.16 722.805 1209.98 722.211 1209.62C721.622 1209.26 721.156 1208.77 720.812 1208.14C720.469 1207.52 720.297 1206.83 720.297 1206.09C720.297 1205.35 720.469 1204.67 720.812 1204.05C721.156 1203.43 721.622 1202.95 722.211 1202.59C722.805 1202.24 723.453 1202.06 724.156 1202.06C724.891 1202.06 725.531 1202.23 726.078 1202.58C726.625 1202.92 727.039 1203.4 727.32 1204.02V1198.8ZM724.375 1209.05C725.224 1209.05 725.927 1208.78 726.484 1208.22C727.042 1207.66 727.32 1206.95 727.32 1206.09C727.32 1205.24 727.042 1204.54 726.484 1203.98C725.927 1203.43 725.224 1203.15 724.375 1203.15C723.552 1203.15 722.857 1203.43 722.289 1204.01C721.727 1204.58 721.445 1205.28 721.445 1206.09C721.445 1206.93 721.727 1207.63 722.289 1208.2C722.857 1208.77 723.552 1209.05 724.375 1209.05ZM739.82 1210.16C738.789 1210.16 737.846 1209.9 736.992 1209.4C736.143 1208.89 735.474 1208.19 734.984 1207.3C734.495 1206.42 734.25 1205.44 734.25 1204.37C734.25 1203.57 734.393 1202.82 734.68 1202.11C734.971 1201.4 735.365 1200.79 735.859 1200.29C736.354 1199.78 736.945 1199.38 737.633 1199.09C738.32 1198.79 739.049 1198.64 739.82 1198.64C741.06 1198.64 742.156 1199 743.109 1199.71C744.062 1200.42 744.646 1201.33 744.859 1202.43H743.531C743.318 1201.65 742.865 1201.02 742.172 1200.54C741.484 1200.05 740.701 1199.8 739.82 1199.8C739.023 1199.8 738.294 1200.01 737.633 1200.41C736.971 1200.8 736.451 1201.35 736.07 1202.05C735.69 1202.75 735.5 1203.52 735.5 1204.37C735.5 1205.22 735.69 1206 736.07 1206.71C736.451 1207.42 736.971 1207.98 737.633 1208.38C738.294 1208.79 739.023 1208.99 739.82 1208.99C740.727 1208.99 741.523 1208.74 742.211 1208.23C742.904 1207.72 743.349 1207.05 743.547 1206.23H744.891C744.651 1207.39 744.06 1208.34 743.117 1209.07C742.18 1209.79 741.081 1210.16 739.82 1210.16ZM754.242 1198.8V1199.95H750.562V1210H749.359V1199.95H745.68V1198.8H754.242ZM759.82 1210.16C758.789 1210.16 757.846 1209.9 756.992 1209.4C756.143 1208.89 755.474 1208.19 754.984 1207.3C754.495 1206.42 754.25 1205.44 754.25 1204.37C754.25 1203.57 754.393 1202.82 754.68 1202.11C754.971 1201.4 755.365 1200.79 755.859 1200.29C756.354 1199.78 756.945 1199.38 757.633 1199.09C758.32 1198.79 759.049 1198.64 759.82 1198.64C761.06 1198.64 762.156 1199 763.109 1199.71C764.062 1200.42 764.646 1201.33 764.859 1202.43H763.531C763.318 1201.65 762.865 1201.02 762.172 1200.54C761.484 1200.05 760.701 1199.8 759.82 1199.8C759.023 1199.8 758.294 1200.01 757.633 1200.41C756.971 1200.8 756.451 1201.35 756.07 1202.05C755.69 1202.75 755.5 1203.52 755.5 1204.37C755.5 1205.22 755.69 1206 756.07 1206.71C756.451 1207.42 756.971 1207.98 757.633 1208.38C758.294 1208.79 759.023 1208.99 759.82 1208.99C760.727 1208.99 761.523 1208.74 762.211 1208.23C762.904 1207.72 763.349 1207.05 763.547 1206.23H764.891C764.651 1207.39 764.06 1208.34 763.117 1209.07C762.18 1209.79 761.081 1210.16 759.82 1210.16Z"
            fill="#A8A8A8"
          />
          <path
            d="M461.703 1234V1233.1L466.008 1228.8C466.586 1228.21 467.013 1227.69 467.289 1227.23C467.565 1226.78 467.703 1226.33 467.703 1225.91C467.703 1225.3 467.49 1224.79 467.062 1224.4C466.635 1224 466.096 1223.8 465.445 1223.8C464.69 1223.8 464.078 1224.03 463.609 1224.49C463.146 1224.95 462.922 1225.57 462.938 1226.34H461.734C461.714 1225.6 461.865 1224.95 462.188 1224.38C462.51 1223.82 462.956 1223.38 463.523 1223.09C464.096 1222.79 464.742 1222.64 465.461 1222.64C466.466 1222.64 467.297 1222.95 467.953 1223.55C468.609 1224.16 468.938 1224.93 468.938 1225.88C468.938 1226.99 468.25 1228.22 466.875 1229.54L463.594 1232.83H469.078V1234H461.703ZM474.406 1234.16C473.141 1234.16 472.148 1233.64 471.43 1232.62C470.716 1231.59 470.359 1230.18 470.359 1228.4C470.359 1226.61 470.716 1225.21 471.43 1224.18C472.148 1223.15 473.141 1222.64 474.406 1222.64C475.667 1222.64 476.654 1223.15 477.367 1224.18C478.081 1225.21 478.438 1226.61 478.438 1228.4C478.438 1230.18 478.081 1231.59 477.367 1232.62C476.654 1233.64 475.667 1234.16 474.406 1234.16ZM474.406 1232.99C475.292 1232.99 475.979 1232.59 476.469 1231.8C476.964 1231 477.211 1229.87 477.211 1228.4C477.211 1226.93 476.964 1225.8 476.469 1225C475.979 1224.2 475.292 1223.8 474.406 1223.8C473.516 1223.8 472.826 1224.2 472.336 1225C471.852 1225.79 471.609 1226.92 471.609 1228.4C471.609 1229.87 471.852 1231.01 472.336 1231.8C472.826 1232.6 473.516 1232.99 474.406 1232.99ZM484.297 1222.8H485.492V1232.85H491.156V1234H484.297V1222.8ZM497.32 1222.8C498.263 1222.8 499.049 1223.11 499.68 1223.73C500.315 1224.34 500.633 1225.1 500.633 1226.02C500.633 1226.94 500.315 1227.71 499.68 1228.33C499.049 1228.94 498.263 1229.25 497.32 1229.25H494.211V1234H493.016V1222.8H497.32ZM497.32 1228.09C497.914 1228.09 498.411 1227.9 498.812 1227.5C499.214 1227.1 499.414 1226.6 499.414 1226.02C499.414 1225.43 499.214 1224.94 498.812 1224.55C498.411 1224.15 497.914 1223.95 497.32 1223.95H494.211V1228.09H497.32ZM508.539 1234L507.453 1231.27H502.156L501.062 1234H499.789L504.266 1222.8H505.352L509.852 1234H508.539ZM502.617 1230.11H507L504.812 1224.58L502.617 1230.11Z"
            fill="#4B5563"
          />
          <path
            d="M466.352 1210.16C465.32 1210.16 464.378 1209.9 463.523 1209.4C462.674 1208.89 462.005 1208.19 461.516 1207.3C461.026 1206.42 460.781 1205.44 460.781 1204.37C460.781 1203.57 460.924 1202.82 461.211 1202.11C461.503 1201.4 461.896 1200.79 462.391 1200.29C462.885 1199.78 463.477 1199.38 464.164 1199.09C464.852 1198.79 465.581 1198.64 466.352 1198.64C467.591 1198.64 468.688 1199 469.641 1199.71C470.594 1200.42 471.177 1201.33 471.391 1202.43H470.062C469.849 1201.65 469.396 1201.02 468.703 1200.54C468.016 1200.05 467.232 1199.8 466.352 1199.8C465.555 1199.8 464.826 1200.01 464.164 1200.41C463.503 1200.8 462.982 1201.35 462.602 1202.05C462.221 1202.75 462.031 1203.52 462.031 1204.37C462.031 1205.22 462.221 1206 462.602 1206.71C462.982 1207.42 463.503 1207.98 464.164 1208.38C464.826 1208.79 465.555 1208.99 466.352 1208.99C467.258 1208.99 468.055 1208.74 468.742 1208.23C469.435 1207.72 469.88 1207.05 470.078 1206.23H471.422C471.182 1207.39 470.591 1208.34 469.648 1209.07C468.711 1209.79 467.612 1210.16 466.352 1210.16ZM479.102 1202.23H480.273V1210H479.102V1208.49C478.852 1209.02 478.497 1209.43 478.039 1209.72C477.586 1210.01 477.055 1210.16 476.445 1210.16C475.445 1210.16 474.648 1209.84 474.055 1209.22C473.461 1208.59 473.164 1207.76 473.164 1206.7V1202.23H474.336V1206.58C474.336 1207.33 474.549 1207.93 474.977 1208.38C475.404 1208.83 475.974 1209.05 476.688 1209.05C477.422 1209.05 478.008 1208.83 478.445 1208.38C478.883 1207.93 479.102 1207.33 479.102 1206.58V1202.23ZM485.867 1202.06C486.07 1202.06 486.312 1202.09 486.594 1202.16V1203.25C486.339 1203.16 486.086 1203.12 485.836 1203.12C485.227 1203.12 484.714 1203.33 484.297 1203.77C483.885 1204.19 483.68 1204.73 483.68 1205.39V1210H482.508V1202.23H483.68V1203.47C483.909 1203.03 484.214 1202.69 484.594 1202.44C484.974 1202.19 485.398 1202.06 485.867 1202.06ZM491.461 1202.06C491.664 1202.06 491.906 1202.09 492.188 1202.16V1203.25C491.932 1203.16 491.68 1203.12 491.43 1203.12C490.82 1203.12 490.307 1203.33 489.891 1203.77C489.479 1204.19 489.273 1204.73 489.273 1205.39V1210H488.102V1202.23H489.273V1203.47C489.503 1203.03 489.807 1202.69 490.188 1202.44C490.568 1202.19 490.992 1202.06 491.461 1202.06ZM500.273 1205.88C500.273 1206.11 500.268 1206.26 500.258 1206.32H493.742C493.799 1207.15 494.086 1207.83 494.602 1208.34C495.117 1208.85 495.781 1209.1 496.594 1209.1C497.219 1209.1 497.755 1208.96 498.203 1208.68C498.656 1208.39 498.935 1208.01 499.039 1207.54H500.211C500.06 1208.33 499.648 1208.96 498.977 1209.44C498.305 1209.92 497.5 1210.16 496.562 1210.16C495.432 1210.16 494.487 1209.77 493.727 1208.98C492.971 1208.2 492.594 1207.23 492.594 1206.06C492.594 1204.94 492.977 1204 493.742 1203.23C494.508 1202.45 495.443 1202.06 496.547 1202.06C497.24 1202.06 497.87 1202.23 498.438 1202.55C499.005 1202.88 499.453 1203.33 499.781 1203.91C500.109 1204.5 500.273 1205.15 500.273 1205.88ZM493.797 1205.33H499.023C498.966 1204.68 498.703 1204.15 498.234 1203.74C497.771 1203.33 497.193 1203.12 496.5 1203.12C495.812 1203.12 495.224 1203.32 494.734 1203.72C494.245 1204.12 493.932 1204.66 493.797 1205.33ZM505.898 1202.06C506.904 1202.06 507.701 1202.38 508.289 1203C508.883 1203.62 509.18 1204.46 509.18 1205.52V1210H508.008V1205.63C508.008 1204.89 507.792 1204.29 507.359 1203.84C506.932 1203.4 506.365 1203.17 505.656 1203.17C504.927 1203.17 504.341 1203.4 503.898 1203.85C503.461 1204.3 503.242 1204.89 503.242 1205.63V1210H502.07V1202.23H503.242V1203.74C503.492 1203.21 503.846 1202.8 504.305 1202.51C504.763 1202.21 505.294 1202.06 505.898 1202.06ZM514.977 1203.31H512.805V1207.38C512.805 1208.45 513.349 1208.99 514.438 1208.99C514.656 1208.99 514.836 1208.97 514.977 1208.93V1210C514.742 1210.05 514.492 1210.08 514.227 1210.08C513.414 1210.08 512.779 1209.85 512.32 1209.41C511.862 1208.95 511.633 1208.28 511.633 1207.39V1203.31H510.102V1202.23H511.633V1200.08H512.805V1202.23H514.977V1203.31ZM525.695 1210.16C524.664 1210.16 523.721 1209.9 522.867 1209.4C522.018 1208.89 521.349 1208.19 520.859 1207.3C520.37 1206.42 520.125 1205.44 520.125 1204.37C520.125 1203.57 520.268 1202.82 520.555 1202.11C520.846 1201.4 521.24 1200.79 521.734 1200.29C522.229 1199.78 522.82 1199.38 523.508 1199.09C524.195 1198.79 524.924 1198.64 525.695 1198.64C526.935 1198.64 528.031 1199 528.984 1199.71C529.938 1200.42 530.521 1201.33 530.734 1202.43H529.406C529.193 1201.65 528.74 1201.02 528.047 1200.54C527.359 1200.05 526.576 1199.8 525.695 1199.8C524.898 1199.8 524.169 1200.01 523.508 1200.41C522.846 1200.8 522.326 1201.35 521.945 1202.05C521.565 1202.75 521.375 1203.52 521.375 1204.37C521.375 1205.22 521.565 1206 521.945 1206.71C522.326 1207.42 522.846 1207.98 523.508 1208.38C524.169 1208.79 524.898 1208.99 525.695 1208.99C526.602 1208.99 527.398 1208.74 528.086 1208.23C528.779 1207.72 529.224 1207.05 529.422 1206.23H530.766C530.526 1207.39 529.935 1208.34 528.992 1209.07C528.055 1209.79 526.956 1210.16 525.695 1210.16ZM540.117 1198.8V1199.95H536.438V1210H535.234V1199.95H531.555V1198.8H540.117ZM545.695 1210.16C544.664 1210.16 543.721 1209.9 542.867 1209.4C542.018 1208.89 541.349 1208.19 540.859 1207.3C540.37 1206.42 540.125 1205.44 540.125 1204.37C540.125 1203.57 540.268 1202.82 540.555 1202.11C540.846 1201.4 541.24 1200.79 541.734 1200.29C542.229 1199.78 542.82 1199.38 543.508 1199.09C544.195 1198.79 544.924 1198.64 545.695 1198.64C546.935 1198.64 548.031 1199 548.984 1199.71C549.938 1200.42 550.521 1201.33 550.734 1202.43H549.406C549.193 1201.65 548.74 1201.02 548.047 1200.54C547.359 1200.05 546.576 1199.8 545.695 1199.8C544.898 1199.8 544.169 1200.01 543.508 1200.41C542.846 1200.8 542.326 1201.35 541.945 1202.05C541.565 1202.75 541.375 1203.52 541.375 1204.37C541.375 1205.22 541.565 1206 541.945 1206.71C542.326 1207.42 542.846 1207.98 543.508 1208.38C544.169 1208.79 544.898 1208.99 545.695 1208.99C546.602 1208.99 547.398 1208.74 548.086 1208.23C548.779 1207.72 549.224 1207.05 549.422 1206.23H550.766C550.526 1207.39 549.935 1208.34 548.992 1209.07C548.055 1209.79 546.956 1210.16 545.695 1210.16Z"
            fill="#A8A8A8"
          />
          <path
            d="M31 1265H799V1332C799 1335.31 796.314 1338 793 1338H37C33.6863 1338 31 1335.31 31 1332V1265Z"
            fill="white"
          />
          <rect
            x="635.5"
            y="1282.5"
            width="37"
            height="37"
            rx="18.5"
            stroke="#0F47F2"
          />
          <path
            d="M654 1289L657 1297.14L666 1301L657 1304L654 1313L651 1304L642 1301L651 1297.14L654 1289Z"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="1282.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            fill="#0F47F2"
          />
          <rect
            x="534.25"
            y="1282.25"
            width="90.5"
            height="37.5"
            rx="6.75"
            stroke="#0F47F2"
            stroke-width="0.5"
          />
          <path
            d="M551.814 1308.18C550.502 1308.18 549.415 1307.79 548.554 1307.02C547.698 1306.25 547.271 1305.28 547.271 1304.1H548.606C548.606 1304.92 548.908 1305.59 549.512 1306.12C550.115 1306.64 550.883 1306.9 551.814 1306.9C552.693 1306.9 553.42 1306.69 553.994 1306.26C554.568 1305.83 554.855 1305.27 554.855 1304.6C554.855 1304.25 554.785 1303.94 554.645 1303.67C554.51 1303.4 554.322 1303.18 554.082 1303.02C553.848 1302.85 553.572 1302.7 553.256 1302.57C552.945 1302.43 552.611 1302.32 552.254 1302.23C551.902 1302.15 551.539 1302.06 551.164 1301.95C550.789 1301.85 550.423 1301.75 550.065 1301.65C549.714 1301.54 549.38 1301.4 549.063 1301.22C548.753 1301.05 548.478 1300.85 548.237 1300.63C548.003 1300.4 547.815 1300.12 547.675 1299.76C547.54 1299.41 547.473 1299.01 547.473 1298.57C547.473 1297.6 547.862 1296.8 548.642 1296.17C549.427 1295.54 550.417 1295.22 551.612 1295.22C552.896 1295.22 553.915 1295.57 554.671 1296.27C555.427 1296.96 555.805 1297.83 555.805 1298.88H554.425C554.396 1298.19 554.117 1297.62 553.59 1297.18C553.068 1296.74 552.397 1296.51 551.577 1296.51C550.757 1296.51 550.089 1296.7 549.573 1297.08C549.063 1297.46 548.809 1297.96 548.809 1298.57C548.809 1298.92 548.894 1299.23 549.063 1299.48C549.233 1299.74 549.459 1299.95 549.74 1300.1C550.027 1300.25 550.355 1300.39 550.725 1300.5C551.094 1300.61 551.483 1300.72 551.894 1300.82C552.304 1300.91 552.711 1301.02 553.115 1301.13C553.525 1301.24 553.915 1301.38 554.284 1301.57C554.653 1301.75 554.979 1301.96 555.26 1302.22C555.547 1302.46 555.775 1302.79 555.945 1303.2C556.115 1303.61 556.2 1304.07 556.2 1304.6C556.2 1305.64 555.784 1306.49 554.952 1307.17C554.126 1307.84 553.08 1308.18 551.814 1308.18ZM562.607 1299.07C563.738 1299.07 564.635 1299.42 565.297 1300.12C565.965 1300.82 566.299 1301.77 566.299 1302.96V1308H564.98V1303.09C564.98 1302.25 564.737 1301.58 564.251 1301.07C563.771 1300.57 563.132 1300.32 562.335 1300.32C561.515 1300.32 560.855 1300.57 560.357 1301.08C559.865 1301.59 559.619 1302.25 559.619 1303.09V1308H558.301V1295.4H559.619V1300.96C559.9 1300.36 560.299 1299.9 560.814 1299.57C561.33 1299.24 561.928 1299.07 562.607 1299.07ZM569.595 1300.39C570.468 1299.51 571.54 1299.07 572.812 1299.07C574.083 1299.07 575.155 1299.51 576.028 1300.39C576.907 1301.26 577.347 1302.34 577.347 1303.62C577.347 1304.91 576.907 1305.99 576.028 1306.87C575.155 1307.74 574.083 1308.18 572.812 1308.18C571.54 1308.18 570.468 1307.74 569.595 1306.87C568.728 1305.99 568.294 1304.91 568.294 1303.62C568.294 1302.34 568.728 1301.26 569.595 1300.39ZM572.812 1300.32C571.903 1300.32 571.139 1300.63 570.518 1301.27C569.896 1301.9 569.586 1302.69 569.586 1303.62C569.586 1304.55 569.896 1305.34 570.518 1305.98C571.139 1306.62 571.903 1306.94 572.812 1306.94C573.72 1306.94 574.487 1306.62 575.114 1305.98C575.741 1305.33 576.055 1304.55 576.055 1303.62C576.055 1302.69 575.741 1301.91 575.114 1301.28C574.493 1300.64 573.726 1300.32 572.812 1300.32ZM583.121 1299.07C583.35 1299.07 583.622 1299.11 583.938 1299.18V1300.41C583.651 1300.31 583.367 1300.26 583.086 1300.26C582.4 1300.26 581.823 1300.5 581.354 1300.99C580.892 1301.47 580.66 1302.08 580.66 1302.81V1308H579.342V1299.25H580.66V1300.65C580.918 1300.16 581.261 1299.77 581.688 1299.49C582.116 1299.21 582.594 1299.07 583.121 1299.07ZM590.188 1300.48H587.744V1305.05C587.744 1306.26 588.356 1306.87 589.581 1306.87C589.827 1306.87 590.029 1306.84 590.188 1306.8V1308C589.924 1308.06 589.643 1308.09 589.344 1308.09C588.43 1308.09 587.715 1307.84 587.199 1307.33C586.684 1306.82 586.426 1306.07 586.426 1305.06V1300.48H584.703V1299.25H586.426V1296.84H587.744V1299.25H590.188V1300.48ZM593.334 1295.4V1308H592.016V1295.4H593.334ZM596.516 1295.43C596.768 1295.43 596.99 1295.53 597.184 1295.71C597.377 1295.9 597.474 1296.12 597.474 1296.37C597.474 1296.63 597.377 1296.86 597.184 1297.05C596.99 1297.24 596.768 1297.33 596.516 1297.33C596.258 1297.33 596.038 1297.24 595.856 1297.05C595.675 1296.86 595.584 1296.64 595.584 1296.37C595.584 1296.12 595.675 1295.9 595.856 1295.71C596.038 1295.53 596.258 1295.43 596.516 1295.43ZM595.848 1299.25H597.166V1308H595.848V1299.25ZM602.562 1308.18C601.578 1308.18 600.764 1307.93 600.119 1307.43C599.475 1306.93 599.108 1306.26 599.021 1305.41H600.277C600.336 1305.91 600.57 1306.3 600.98 1306.6C601.391 1306.9 601.9 1307.04 602.51 1307.04C603.119 1307.04 603.608 1306.9 603.978 1306.63C604.353 1306.35 604.54 1305.99 604.54 1305.55C604.54 1305.25 604.464 1305.01 604.312 1304.81C604.159 1304.6 603.957 1304.45 603.705 1304.35C603.459 1304.25 603.178 1304.16 602.861 1304.08C602.545 1304 602.22 1303.93 601.886 1303.88C601.552 1303.83 601.227 1303.74 600.91 1303.63C600.594 1303.52 600.31 1303.39 600.058 1303.24C599.812 1303.08 599.612 1302.86 599.46 1302.57C599.308 1302.28 599.231 1301.93 599.231 1301.52C599.231 1300.8 599.516 1300.21 600.084 1299.76C600.652 1299.3 601.405 1299.07 602.343 1299.07C603.204 1299.07 603.945 1299.3 604.566 1299.76C605.193 1300.21 605.557 1300.81 605.656 1301.58H604.329C604.265 1301.17 604.045 1300.83 603.67 1300.56C603.295 1300.3 602.841 1300.17 602.308 1300.17C601.774 1300.17 601.341 1300.29 601.007 1300.52C600.679 1300.75 600.515 1301.05 600.515 1301.43C600.515 1301.74 600.611 1302 600.805 1302.2C601.004 1302.4 601.259 1302.54 601.569 1302.64C601.88 1302.73 602.223 1302.81 602.598 1302.88C602.979 1302.95 603.356 1303.03 603.731 1303.13C604.112 1303.23 604.458 1303.36 604.769 1303.53C605.079 1303.69 605.331 1303.94 605.524 1304.27C605.724 1304.61 605.823 1305.02 605.823 1305.51C605.823 1306.29 605.513 1306.92 604.892 1307.43C604.276 1307.93 603.5 1308.18 602.562 1308.18ZM612.09 1300.48H609.646V1305.05C609.646 1306.26 610.259 1306.87 611.483 1306.87C611.729 1306.87 611.932 1306.84 612.09 1306.8V1308C611.826 1308.06 611.545 1308.09 611.246 1308.09C610.332 1308.09 609.617 1307.84 609.102 1307.33C608.586 1306.82 608.328 1306.07 608.328 1305.06V1300.48H606.605V1299.25H608.328V1296.84H609.646V1299.25H612.09V1300.48Z"
            fill="#F5F9FB"
          />
          <circle cx="702" cy="1301" r="18.5" stroke="#818283" />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M695.328 1292.91C695.34 1292.91 695.352 1292.91 695.365 1292.91L708.672 1292.91C709.031 1292.91 709.36 1292.91 709.628 1292.95C709.922 1292.99 710.234 1293.08 710.49 1293.34C710.747 1293.59 710.84 1293.9 710.879 1294.2C710.915 1294.47 710.915 1294.79 710.915 1295.15V1295.23C710.915 1295.59 710.915 1295.92 710.879 1296.18C710.84 1296.48 710.747 1296.79 710.49 1297.05C710.247 1297.29 709.953 1297.39 709.671 1297.43V1301.87C709.671 1303.4 709.671 1304.6 709.544 1305.55C709.414 1306.52 709.138 1307.31 708.517 1307.93C707.897 1308.55 707.11 1308.83 706.137 1308.96C705.193 1309.08 703.985 1309.08 702.461 1309.08H701.538C700.014 1309.08 698.807 1309.08 697.862 1308.96C696.89 1308.83 696.103 1308.55 695.482 1307.93C694.861 1307.31 694.586 1306.52 694.455 1305.55C694.328 1304.6 694.328 1303.4 694.328 1301.87V1297.43C694.046 1297.39 693.753 1297.29 693.509 1297.05C693.253 1296.79 693.16 1296.48 693.12 1296.18C693.084 1295.92 693.084 1295.59 693.084 1295.23C693.084 1295.22 693.084 1295.2 693.084 1295.19C693.084 1295.18 693.084 1295.17 693.084 1295.15C693.084 1294.79 693.084 1294.47 693.12 1294.2C693.16 1293.9 693.253 1293.59 693.509 1293.34C693.765 1293.08 694.077 1292.99 694.372 1292.95C694.64 1292.91 694.969 1292.91 695.328 1292.91ZM695.572 1297.47V1301.83C695.572 1303.41 695.573 1304.53 695.688 1305.38C695.8 1306.22 696.011 1306.7 696.362 1307.05C696.713 1307.4 697.193 1307.61 698.028 1307.72C698.88 1307.84 700.004 1307.84 701.585 1307.84H702.414C703.996 1307.84 705.119 1307.84 705.972 1307.72C706.806 1307.61 707.287 1307.4 707.638 1307.05C707.989 1306.7 708.199 1306.22 708.311 1305.38C708.426 1304.53 708.427 1303.41 708.427 1301.83V1297.47H695.572ZM694.389 1294.21L694.391 1294.21C694.392 1294.21 694.395 1294.21 694.399 1294.21C694.417 1294.2 694.458 1294.19 694.538 1294.18C694.712 1294.16 694.956 1294.15 695.365 1294.15H708.635C709.043 1294.15 709.287 1294.16 709.462 1294.18C709.542 1294.19 709.582 1294.2 709.6 1294.21C709.604 1294.21 709.607 1294.21 709.609 1294.21L709.611 1294.21L709.612 1294.22C709.613 1294.22 709.614 1294.22 709.616 1294.23C709.623 1294.24 709.636 1294.28 709.646 1294.36C709.67 1294.54 709.671 1294.78 709.671 1295.19C709.671 1295.6 709.67 1295.84 709.646 1296.02C709.636 1296.1 709.623 1296.14 709.616 1296.16C709.614 1296.16 709.613 1296.16 709.612 1296.16L709.611 1296.17L709.609 1296.17C709.607 1296.17 709.604 1296.17 709.6 1296.17C709.582 1296.18 709.542 1296.19 709.462 1296.2C709.287 1296.23 709.043 1296.23 708.635 1296.23H695.365C694.956 1296.23 694.712 1296.23 694.538 1296.2C694.458 1296.19 694.417 1296.18 694.399 1296.17C694.395 1296.17 694.392 1296.17 694.391 1296.17L694.389 1296.17L694.388 1296.16C694.387 1296.16 694.385 1296.16 694.384 1296.16C694.376 1296.14 694.364 1296.1 694.353 1296.02C694.329 1295.84 694.328 1295.6 694.328 1295.19C694.328 1294.78 694.329 1294.54 694.353 1294.36C694.364 1294.28 694.376 1294.24 694.384 1294.23C694.385 1294.22 694.387 1294.22 694.388 1294.22L694.389 1294.21ZM694.389 1296.17C694.388 1296.17 694.389 1296.17 694.389 1296.17V1296.17ZM700.738 1299.13H703.262C703.439 1299.13 703.603 1299.13 703.74 1299.14C703.887 1299.15 704.049 1299.17 704.214 1299.24C704.569 1299.39 704.852 1299.67 704.999 1300.03C705.067 1300.19 705.09 1300.35 705.1 1300.5C705.11 1300.64 705.11 1300.8 705.11 1300.98V1301.01C705.11 1301.19 705.11 1301.36 705.1 1301.49C705.09 1301.64 705.067 1301.8 704.999 1301.97C704.852 1302.32 704.569 1302.6 704.214 1302.75C704.049 1302.82 703.887 1302.84 703.74 1302.85C703.603 1302.86 703.439 1302.86 703.262 1302.86H700.738C700.56 1302.86 700.397 1302.86 700.259 1302.85C700.112 1302.84 699.95 1302.82 699.786 1302.75C699.43 1302.6 699.147 1302.32 699 1301.97C698.932 1301.8 698.909 1301.64 698.899 1301.49C698.89 1301.36 698.89 1301.19 698.89 1301.01V1300.98C698.89 1300.8 698.89 1300.64 698.899 1300.5C698.909 1300.35 698.932 1300.19 699 1300.03C699.147 1299.67 699.43 1299.39 699.786 1299.24C699.95 1299.17 700.112 1299.15 700.259 1299.14C700.397 1299.13 700.56 1299.13 700.738 1299.13ZM700.259 1300.39C700.21 1300.41 700.171 1300.45 700.15 1300.5C700.149 1300.51 700.144 1300.53 700.14 1300.59C700.134 1300.67 700.134 1300.79 700.134 1301C700.134 1301.2 700.134 1301.32 700.14 1301.41C700.144 1301.46 700.149 1301.49 700.15 1301.49C700.171 1301.54 700.21 1301.58 700.259 1301.6C700.265 1301.6 700.289 1301.61 700.344 1301.61C700.434 1301.62 700.554 1301.62 700.756 1301.62H703.244C703.445 1301.62 703.566 1301.62 703.655 1301.61C703.711 1301.61 703.734 1301.6 703.74 1301.6C703.789 1301.58 703.828 1301.54 703.849 1301.49C703.85 1301.49 703.856 1301.46 703.859 1301.41C703.865 1301.32 703.866 1301.2 703.866 1301C703.866 1300.79 703.865 1300.67 703.859 1300.59C703.856 1300.53 703.85 1300.51 703.849 1300.5C703.828 1300.45 703.789 1300.41 703.74 1300.39C703.734 1300.39 703.711 1300.38 703.655 1300.38C703.566 1300.37 703.445 1300.37 703.244 1300.37H700.756C700.554 1300.37 700.434 1300.37 700.344 1300.38C700.289 1300.38 700.265 1300.39 700.259 1300.39Z"
            fill="#818283"
          />
          <circle cx="750" cy="1301" r="18.5" stroke="#818283" />
          <path
            d="M751.77 1295.06L752.465 1294.36C753.617 1293.21 755.484 1293.21 756.636 1294.36C757.788 1295.52 757.788 1297.38 756.636 1298.53L755.941 1299.23M751.77 1295.06C751.77 1295.06 751.857 1296.54 753.16 1297.84C754.464 1299.14 755.941 1299.23 755.941 1299.23M751.77 1295.06L745.379 1301.45C744.946 1301.88 744.73 1302.1 744.544 1302.34C744.324 1302.62 744.136 1302.92 743.982 1303.25C743.852 1303.52 743.755 1303.81 743.562 1304.39L742.741 1306.85M755.941 1299.23L749.55 1305.62C749.117 1306.05 748.901 1306.27 748.662 1306.46C748.381 1306.68 748.076 1306.86 747.754 1307.02C747.481 1307.15 747.19 1307.24 746.609 1307.44L744.148 1308.26M742.741 1306.85L742.541 1307.45C742.446 1307.74 742.52 1308.05 742.733 1308.27C742.946 1308.48 743.261 1308.55 743.547 1308.46L744.148 1308.26M742.741 1306.85L744.148 1308.26"
            stroke="#818283"
          />
          <g clip-path="url(#clip9_4500_3993)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M144.5 1287C152.508 1287 159 1293.66 159 1301.87C159 1308.43 154.85 1314 149.092 1315.97C148.357 1316.12 148.096 1315.65 148.096 1315.26C148.096 1314.77 148.113 1313.17 148.113 1311.18C148.113 1309.79 147.649 1308.89 147.129 1308.43C150.358 1308.06 153.751 1306.8 153.751 1301.09C153.751 1299.47 153.188 1298.14 152.257 1297.1C152.408 1296.72 152.906 1295.21 152.115 1293.17C152.115 1293.17 150.9 1292.77 148.132 1294.69C146.974 1294.36 145.733 1294.19 144.5 1294.19C143.268 1294.19 142.028 1294.36 140.871 1294.69C138.1 1292.77 136.882 1293.17 136.882 1293.17C136.094 1295.21 136.592 1296.72 136.741 1297.1C135.815 1298.14 135.248 1299.47 135.248 1301.09C135.248 1306.79 138.633 1308.06 141.854 1308.44C141.439 1308.81 141.064 1309.46 140.933 1310.43C140.107 1310.81 138.007 1311.46 136.713 1309.19C136.713 1309.19 135.946 1307.76 134.491 1307.66C134.491 1307.66 133.077 1307.64 134.392 1308.56C134.392 1308.56 135.342 1309.02 136.002 1310.74C136.002 1310.74 136.853 1313.39 140.887 1312.49C140.894 1313.73 140.907 1314.9 140.907 1315.26C140.907 1315.65 140.64 1316.11 139.917 1315.97C134.154 1314.01 130 1308.44 130 1301.87C130 1293.66 136.493 1287 144.5 1287Z"
              fill="#4B5563"
            />
          </g>
          <g clip-path="url(#clip10_4500_3993)">
            <path
              d="M100.5 1287C92.491 1287 86 1293.49 86 1301.5C86 1309.51 92.491 1316 100.5 1316C108.509 1316 115 1309.51 115 1301.5C115 1293.49 108.509 1287 100.5 1287ZM96.4445 1307.57H93.6182V1298.52H96.4445V1307.57ZM94.9549 1297.39H94.9322C93.907 1297.39 93.2443 1296.7 93.2443 1295.82C93.2443 1294.92 93.9297 1294.25 94.9719 1294.25C96.0141 1294.25 96.6541 1294.92 96.6768 1295.82C96.6824 1296.69 96.0197 1297.39 94.9549 1297.39ZM107.75 1307.57H104.544V1302.89C104.544 1301.66 104.046 1300.83 102.941 1300.83C102.097 1300.83 101.627 1301.39 101.412 1301.94C101.333 1302.13 101.344 1302.4 101.344 1302.68V1307.57H98.1664C98.1664 1307.57 98.2061 1299.27 98.1664 1298.52H101.344V1299.94C101.531 1299.32 102.545 1298.44 104.165 1298.44C106.175 1298.44 107.75 1299.74 107.75 1302.54V1307.57Z"
              fill="#4B5563"
            />
          </g>
          <rect
            x="50.5"
            y="1089.5"
            width="15"
            height="15"
            rx="2"
            stroke="#4B5563"
          />
          <path
            d="M90.8672 1122.16C89.7005 1122.16 88.7344 1121.82 87.9688 1121.13C87.2083 1120.45 86.8281 1119.58 86.8281 1118.53H88.0156C88.0156 1119.26 88.2839 1119.86 88.8203 1120.33C89.3568 1120.79 90.0391 1121.02 90.8672 1121.02C91.6484 1121.02 92.2943 1120.83 92.8047 1120.45C93.3151 1120.07 93.5703 1119.58 93.5703 1118.98C93.5703 1118.66 93.5078 1118.39 93.3828 1118.15C93.263 1117.91 93.0964 1117.72 92.8828 1117.57C92.6745 1117.42 92.4297 1117.29 92.1484 1117.17C91.8724 1117.05 91.5755 1116.95 91.2578 1116.88C90.9453 1116.8 90.6224 1116.72 90.2891 1116.62C89.9557 1116.53 89.6302 1116.44 89.3125 1116.35C89 1116.26 88.7031 1116.13 88.4219 1115.98C88.1458 1115.82 87.901 1115.64 87.6875 1115.45C87.4792 1115.25 87.3125 1114.99 87.1875 1114.68C87.0677 1114.37 87.0078 1114.01 87.0078 1113.62C87.0078 1112.75 87.3542 1112.04 88.0469 1111.48C88.7448 1110.92 89.625 1110.64 90.6875 1110.64C91.8281 1110.64 92.7344 1110.95 93.4062 1111.57C94.0781 1112.18 94.4141 1112.96 94.4141 1113.89H93.1875C93.1615 1113.28 92.9141 1112.77 92.4453 1112.38C91.9818 1111.99 91.3854 1111.79 90.6562 1111.79C89.9271 1111.79 89.3333 1111.96 88.875 1112.3C88.4219 1112.64 88.1953 1113.08 88.1953 1113.62C88.1953 1113.93 88.2708 1114.2 88.4219 1114.43C88.5729 1114.66 88.7734 1114.84 89.0234 1114.98C89.2786 1115.11 89.5703 1115.23 89.8984 1115.34C90.2266 1115.43 90.5729 1115.53 90.9375 1115.62C91.3021 1115.7 91.6641 1115.79 92.0234 1115.89C92.388 1115.99 92.7344 1116.12 93.0625 1116.28C93.3906 1116.44 93.6797 1116.64 93.9297 1116.86C94.1849 1117.08 94.388 1117.37 94.5391 1117.73C94.6901 1118.09 94.7656 1118.51 94.7656 1118.98C94.7656 1119.9 94.3958 1120.66 93.6562 1121.26C92.9219 1121.86 91.9922 1122.16 90.8672 1122.16ZM97.3281 1115.23C98.1042 1114.45 99.0573 1114.06 100.188 1114.06C101.318 1114.06 102.271 1114.45 103.047 1115.23C103.828 1116.01 104.219 1116.97 104.219 1118.11C104.219 1119.25 103.828 1120.21 103.047 1120.99C102.271 1121.77 101.318 1122.16 100.188 1122.16C99.0573 1122.16 98.1042 1121.77 97.3281 1120.99C96.5573 1120.21 96.1719 1119.25 96.1719 1118.11C96.1719 1116.97 96.5573 1116.01 97.3281 1115.23ZM100.188 1115.17C99.3802 1115.17 98.7005 1115.45 98.1484 1116.02C97.5964 1116.58 97.3203 1117.28 97.3203 1118.11C97.3203 1118.94 97.5964 1119.64 98.1484 1120.2C98.7005 1120.77 99.3802 1121.05 100.188 1121.05C100.995 1121.05 101.677 1120.77 102.234 1120.2C102.792 1119.63 103.07 1118.93 103.07 1118.11C103.07 1117.28 102.792 1116.59 102.234 1116.02C101.682 1115.46 101 1115.17 100.188 1115.17ZM109.609 1111.7C108.521 1111.7 107.977 1112.23 107.977 1113.3V1114.23H110.172V1115.31H107.977V1122H106.812V1115.31H105.273V1114.23H106.812V1113.28C106.812 1112.4 107.042 1111.74 107.5 1111.29C107.958 1110.84 108.591 1110.61 109.398 1110.61C109.664 1110.61 109.922 1110.64 110.172 1110.69V1111.76C110.01 1111.72 109.823 1111.7 109.609 1111.7ZM115.648 1115.31H113.477V1119.38C113.477 1120.45 114.021 1120.99 115.109 1120.99C115.328 1120.99 115.508 1120.97 115.648 1120.93V1122C115.414 1122.05 115.164 1122.08 114.898 1122.08C114.086 1122.08 113.451 1121.85 112.992 1121.41C112.534 1120.95 112.305 1120.28 112.305 1119.39V1115.31H110.773V1114.23H112.305V1112.08H113.477V1114.23H115.648V1115.31ZM119.273 1122L116.43 1114.23H117.68L119.758 1120.34L121.945 1114.23H122.906L125.117 1120.34L127.195 1114.23H128.445L125.594 1122H124.633L122.43 1115.89L120.219 1122H119.273ZM136.133 1114.23H137.305V1122H136.133V1120.2C135.846 1120.82 135.43 1121.3 134.883 1121.65C134.341 1121.99 133.703 1122.16 132.969 1122.16C132.266 1122.16 131.617 1121.98 131.023 1121.62C130.435 1121.26 129.969 1120.77 129.625 1120.14C129.281 1119.52 129.109 1118.83 129.109 1118.09C129.109 1117.35 129.281 1116.67 129.625 1116.05C129.969 1115.43 130.435 1114.95 131.023 1114.59C131.617 1114.24 132.266 1114.06 132.969 1114.06C133.703 1114.06 134.344 1114.23 134.891 1114.58C135.438 1114.92 135.852 1115.4 136.133 1116.02V1114.23ZM133.188 1121.05C134.036 1121.05 134.74 1120.78 135.297 1120.22C135.854 1119.66 136.133 1118.95 136.133 1118.09C136.133 1117.24 135.854 1116.54 135.297 1115.98C134.74 1115.43 134.036 1115.15 133.188 1115.15C132.365 1115.15 131.669 1115.43 131.102 1116.01C130.539 1116.58 130.258 1117.28 130.258 1118.09C130.258 1118.93 130.539 1119.63 131.102 1120.2C131.669 1120.77 132.365 1121.05 133.188 1121.05ZM142.898 1114.06C143.102 1114.06 143.344 1114.09 143.625 1114.16V1115.25C143.37 1115.16 143.117 1115.12 142.867 1115.12C142.258 1115.12 141.745 1115.33 141.328 1115.77C140.917 1116.19 140.711 1116.73 140.711 1117.39V1122H139.539V1114.23H140.711V1115.47C140.94 1115.03 141.245 1114.69 141.625 1114.44C142.005 1114.19 142.43 1114.06 142.898 1114.06ZM151.711 1117.88C151.711 1118.11 151.706 1118.26 151.695 1118.32H145.18C145.237 1119.15 145.523 1119.83 146.039 1120.34C146.555 1120.85 147.219 1121.1 148.031 1121.1C148.656 1121.1 149.193 1120.96 149.641 1120.68C150.094 1120.39 150.372 1120.01 150.477 1119.54H151.648C151.497 1120.33 151.086 1120.96 150.414 1121.44C149.742 1121.92 148.938 1122.16 148 1122.16C146.87 1122.16 145.924 1121.77 145.164 1120.98C144.409 1120.2 144.031 1119.23 144.031 1118.06C144.031 1116.94 144.414 1116 145.18 1115.23C145.945 1114.45 146.88 1114.06 147.984 1114.06C148.677 1114.06 149.307 1114.23 149.875 1114.55C150.443 1114.88 150.891 1115.33 151.219 1115.91C151.547 1116.5 151.711 1117.15 151.711 1117.88ZM145.234 1117.33H150.461C150.404 1116.68 150.141 1116.15 149.672 1115.74C149.208 1115.33 148.63 1115.12 147.938 1115.12C147.25 1115.12 146.661 1115.32 146.172 1115.72C145.682 1116.12 145.37 1116.66 145.234 1117.33ZM157.516 1110.8H163.773V1111.95H158.711V1115.44H163.227V1116.59H158.711V1120.85H163.773V1122H157.516V1110.8ZM169.617 1114.06C170.622 1114.06 171.419 1114.38 172.008 1115C172.602 1115.62 172.898 1116.46 172.898 1117.52V1122H171.727V1117.63C171.727 1116.89 171.51 1116.29 171.078 1115.84C170.651 1115.4 170.083 1115.17 169.375 1115.17C168.646 1115.17 168.06 1115.4 167.617 1115.85C167.18 1116.3 166.961 1116.89 166.961 1117.63V1122H165.789V1114.23H166.961V1115.74C167.211 1115.21 167.565 1114.8 168.023 1114.51C168.482 1114.21 169.013 1114.06 169.617 1114.06ZM181.695 1114.21H182.867V1121.76C182.867 1122.83 182.505 1123.68 181.781 1124.34C181.057 1124.99 180.128 1125.31 178.992 1125.31C178.544 1125.31 178.109 1125.26 177.688 1125.14C177.266 1125.03 176.872 1124.87 176.508 1124.66C176.148 1124.44 175.854 1124.15 175.625 1123.79C175.401 1123.43 175.281 1123.02 175.266 1122.56H176.398C176.414 1123.09 176.667 1123.52 177.156 1123.84C177.646 1124.16 178.247 1124.32 178.961 1124.32C179.753 1124.32 180.406 1124.09 180.922 1123.62C181.438 1123.15 181.695 1122.55 181.695 1121.8V1120.09C181.409 1120.71 180.992 1121.18 180.445 1121.52C179.904 1121.86 179.266 1122.03 178.531 1122.03C177.828 1122.03 177.18 1121.85 176.586 1121.5C175.997 1121.15 175.531 1120.66 175.188 1120.05C174.844 1119.43 174.672 1118.76 174.672 1118.03C174.672 1117.31 174.844 1116.64 175.188 1116.03C175.531 1115.42 175.997 1114.94 176.586 1114.59C177.18 1114.24 177.828 1114.06 178.531 1114.06C179.266 1114.06 179.904 1114.23 180.445 1114.57C180.992 1114.9 181.409 1115.38 181.695 1115.98V1114.21ZM178.75 1120.95C179.599 1120.95 180.302 1120.67 180.859 1120.12C181.417 1119.57 181.695 1118.88 181.695 1118.03C181.695 1117.2 181.417 1116.51 180.859 1115.96C180.302 1115.41 179.599 1115.13 178.75 1115.13C177.927 1115.13 177.232 1115.41 176.664 1115.98C176.102 1116.53 175.82 1117.22 175.82 1118.03C175.82 1118.85 176.102 1119.54 176.664 1120.1C177.232 1120.66 177.927 1120.95 178.75 1120.95ZM185.695 1110.83C185.919 1110.83 186.117 1110.91 186.289 1111.08C186.461 1111.24 186.547 1111.44 186.547 1111.66C186.547 1111.89 186.461 1112.09 186.289 1112.27C186.117 1112.43 185.919 1112.52 185.695 1112.52C185.466 1112.52 185.271 1112.43 185.109 1112.27C184.948 1112.1 184.867 1111.9 184.867 1111.66C184.867 1111.44 184.948 1111.24 185.109 1111.08C185.271 1110.91 185.466 1110.83 185.695 1110.83ZM185.102 1114.23H186.273V1122H185.102V1114.23ZM192.336 1114.06C193.341 1114.06 194.138 1114.38 194.727 1115C195.32 1115.62 195.617 1116.46 195.617 1117.52V1122H194.445V1117.63C194.445 1116.89 194.229 1116.29 193.797 1115.84C193.37 1115.4 192.802 1115.17 192.094 1115.17C191.365 1115.17 190.779 1115.4 190.336 1115.85C189.898 1116.3 189.68 1116.89 189.68 1117.63V1122H188.508V1114.23H189.68V1115.74C189.93 1115.21 190.284 1114.8 190.742 1114.51C191.201 1114.21 191.732 1114.06 192.336 1114.06ZM205.07 1117.88C205.07 1118.11 205.065 1118.26 205.055 1118.32H198.539C198.596 1119.15 198.883 1119.83 199.398 1120.34C199.914 1120.85 200.578 1121.1 201.391 1121.1C202.016 1121.1 202.552 1120.96 203 1120.68C203.453 1120.39 203.732 1120.01 203.836 1119.54H205.008C204.857 1120.33 204.445 1120.96 203.773 1121.44C203.102 1121.92 202.297 1122.16 201.359 1122.16C200.229 1122.16 199.284 1121.77 198.523 1120.98C197.768 1120.2 197.391 1119.23 197.391 1118.06C197.391 1116.94 197.773 1116 198.539 1115.23C199.305 1114.45 200.24 1114.06 201.344 1114.06C202.036 1114.06 202.667 1114.23 203.234 1114.55C203.802 1114.88 204.25 1115.33 204.578 1115.91C204.906 1116.5 205.07 1117.15 205.07 1117.88ZM198.594 1117.33H203.82C203.763 1116.68 203.5 1116.15 203.031 1115.74C202.568 1115.33 201.99 1115.12 201.297 1115.12C200.609 1115.12 200.021 1115.32 199.531 1115.72C199.042 1116.12 198.729 1116.66 198.594 1117.33ZM213.836 1117.88C213.836 1118.11 213.831 1118.26 213.82 1118.32H207.305C207.362 1119.15 207.648 1119.83 208.164 1120.34C208.68 1120.85 209.344 1121.1 210.156 1121.1C210.781 1121.1 211.318 1120.96 211.766 1120.68C212.219 1120.39 212.497 1120.01 212.602 1119.54H213.773C213.622 1120.33 213.211 1120.96 212.539 1121.44C211.867 1121.92 211.062 1122.16 210.125 1122.16C208.995 1122.16 208.049 1121.77 207.289 1120.98C206.534 1120.2 206.156 1119.23 206.156 1118.06C206.156 1116.94 206.539 1116 207.305 1115.23C208.07 1114.45 209.005 1114.06 210.109 1114.06C210.802 1114.06 211.432 1114.23 212 1114.55C212.568 1114.88 213.016 1115.33 213.344 1115.91C213.672 1116.5 213.836 1117.15 213.836 1117.88ZM207.359 1117.33H212.586C212.529 1116.68 212.266 1116.15 211.797 1115.74C211.333 1115.33 210.755 1115.12 210.062 1115.12C209.375 1115.12 208.786 1115.32 208.297 1115.72C207.807 1116.12 207.495 1116.66 207.359 1117.33ZM218.992 1114.06C219.195 1114.06 219.438 1114.09 219.719 1114.16V1115.25C219.464 1115.16 219.211 1115.12 218.961 1115.12C218.352 1115.12 217.839 1115.33 217.422 1115.77C217.01 1116.19 216.805 1116.73 216.805 1117.39V1122H215.633V1114.23H216.805V1115.47C217.034 1115.03 217.339 1114.69 217.719 1114.44C218.099 1114.19 218.523 1114.06 218.992 1114.06ZM231.648 1114.23H232.82V1122H231.648V1120.2C231.362 1120.82 230.945 1121.3 230.398 1121.65C229.857 1121.99 229.219 1122.16 228.484 1122.16C227.781 1122.16 227.133 1121.98 226.539 1121.62C225.951 1121.26 225.484 1120.77 225.141 1120.14C224.797 1119.52 224.625 1118.83 224.625 1118.09C224.625 1117.35 224.797 1116.67 225.141 1116.05C225.484 1115.43 225.951 1114.95 226.539 1114.59C227.133 1114.24 227.781 1114.06 228.484 1114.06C229.219 1114.06 229.859 1114.23 230.406 1114.58C230.953 1114.92 231.367 1115.4 231.648 1116.02V1114.23ZM228.703 1121.05C229.552 1121.05 230.255 1120.78 230.812 1120.22C231.37 1119.66 231.648 1118.95 231.648 1118.09C231.648 1117.24 231.37 1116.54 230.812 1115.98C230.255 1115.43 229.552 1115.15 228.703 1115.15C227.88 1115.15 227.185 1115.43 226.617 1116.01C226.055 1116.58 225.773 1117.28 225.773 1118.09C225.773 1118.93 226.055 1119.63 226.617 1120.2C227.185 1120.77 227.88 1121.05 228.703 1121.05ZM239.055 1115.31H236.883V1119.38C236.883 1120.45 237.427 1120.99 238.516 1120.99C238.734 1120.99 238.914 1120.97 239.055 1120.93V1122C238.82 1122.05 238.57 1122.08 238.305 1122.08C237.492 1122.08 236.857 1121.85 236.398 1121.41C235.94 1120.95 235.711 1120.28 235.711 1119.39V1115.31H234.18V1114.23H235.711V1112.08H236.883V1114.23H239.055V1115.31ZM243.789 1120.99C243.841 1121 243.938 1121.01 244.078 1121.01C244.677 1121.01 245.125 1120.82 245.422 1120.45C245.719 1120.07 245.867 1119.49 245.867 1118.7V1110.8H247.086V1118.98C247.086 1119.99 246.846 1120.77 246.367 1121.32C245.893 1121.87 245.232 1122.14 244.383 1122.14C244.117 1122.14 243.919 1122.13 243.789 1122.11V1120.99ZM255.305 1114.23H256.477V1122H255.305V1120.49C255.055 1121.02 254.701 1121.43 254.242 1121.72C253.789 1122.01 253.258 1122.16 252.648 1122.16C251.648 1122.16 250.852 1121.84 250.258 1121.22C249.664 1120.59 249.367 1119.76 249.367 1118.7V1114.23H250.539V1118.58C250.539 1119.33 250.753 1119.93 251.18 1120.38C251.607 1120.83 252.177 1121.05 252.891 1121.05C253.625 1121.05 254.211 1120.83 254.648 1120.38C255.086 1119.93 255.305 1119.33 255.305 1118.58V1114.23ZM259.289 1110.83C259.513 1110.83 259.711 1110.91 259.883 1111.08C260.055 1111.24 260.141 1111.44 260.141 1111.66C260.141 1111.89 260.055 1112.09 259.883 1112.27C259.711 1112.43 259.513 1112.52 259.289 1112.52C259.06 1112.52 258.865 1112.43 258.703 1112.27C258.542 1112.1 258.461 1111.9 258.461 1111.66C258.461 1111.44 258.542 1111.24 258.703 1111.08C258.865 1110.91 259.06 1110.83 259.289 1110.83ZM257.469 1124.14C257.479 1124.14 257.505 1124.14 257.547 1124.15C257.589 1124.15 257.625 1124.16 257.656 1124.16C258.359 1124.16 258.711 1123.62 258.711 1122.56V1114.23H259.883V1122.66C259.883 1123.5 259.703 1124.14 259.344 1124.58C258.984 1125.02 258.461 1125.23 257.773 1125.23C257.643 1125.23 257.542 1125.23 257.469 1125.22V1124.14ZM268.055 1114.23H269.227V1122H268.055V1120.49C267.805 1121.02 267.451 1121.43 266.992 1121.72C266.539 1122.01 266.008 1122.16 265.398 1122.16C264.398 1122.16 263.602 1121.84 263.008 1121.22C262.414 1120.59 262.117 1119.76 262.117 1118.7V1114.23H263.289V1118.58C263.289 1119.33 263.503 1119.93 263.93 1120.38C264.357 1120.83 264.927 1121.05 265.641 1121.05C266.375 1121.05 266.961 1120.83 267.398 1120.38C267.836 1119.93 268.055 1119.33 268.055 1118.58V1114.23ZM275.461 1115.31H273.289V1119.38C273.289 1120.45 273.833 1120.99 274.922 1120.99C275.141 1120.99 275.32 1120.97 275.461 1120.93V1122C275.227 1122.05 274.977 1122.08 274.711 1122.08C273.898 1122.08 273.263 1121.85 272.805 1121.41C272.346 1120.95 272.117 1120.28 272.117 1119.39V1115.31H270.586V1114.23H272.117V1112.08H273.289V1114.23H275.461V1115.31ZM279.648 1122.16C278.773 1122.16 278.049 1121.93 277.477 1121.49C276.904 1121.05 276.578 1120.45 276.5 1119.7H277.617C277.669 1120.14 277.878 1120.49 278.242 1120.76C278.607 1121.02 279.06 1121.15 279.602 1121.15C280.143 1121.15 280.578 1121.03 280.906 1120.78C281.24 1120.53 281.406 1120.21 281.406 1119.82C281.406 1119.56 281.339 1119.34 281.203 1119.16C281.068 1118.98 280.888 1118.85 280.664 1118.76C280.445 1118.67 280.195 1118.59 279.914 1118.52C279.633 1118.44 279.344 1118.38 279.047 1118.34C278.75 1118.29 278.461 1118.22 278.18 1118.12C277.898 1118.02 277.646 1117.9 277.422 1117.77C277.203 1117.62 277.026 1117.43 276.891 1117.17C276.755 1116.91 276.688 1116.6 276.688 1116.24C276.688 1115.6 276.94 1115.08 277.445 1114.67C277.951 1114.27 278.62 1114.06 279.453 1114.06C280.219 1114.06 280.878 1114.27 281.43 1114.67C281.987 1115.07 282.31 1115.61 282.398 1116.29H281.219C281.161 1115.92 280.966 1115.62 280.633 1115.39C280.299 1115.16 279.896 1115.04 279.422 1115.04C278.948 1115.04 278.562 1115.14 278.266 1115.35C277.974 1115.55 277.828 1115.82 277.828 1116.16C277.828 1116.44 277.914 1116.67 278.086 1116.84C278.263 1117.02 278.49 1117.15 278.766 1117.23C279.042 1117.32 279.346 1117.39 279.68 1117.45C280.018 1117.51 280.354 1117.58 280.688 1117.67C281.026 1117.76 281.333 1117.88 281.609 1118.02C281.885 1118.17 282.109 1118.39 282.281 1118.69C282.458 1118.98 282.547 1119.35 282.547 1119.79C282.547 1120.48 282.271 1121.04 281.719 1121.49C281.172 1121.93 280.482 1122.16 279.648 1122.16ZM290.133 1114.23H291.305V1122H290.133V1120.49C289.883 1121.02 289.529 1121.43 289.07 1121.72C288.617 1122.01 288.086 1122.16 287.477 1122.16C286.477 1122.16 285.68 1121.84 285.086 1121.22C284.492 1120.59 284.195 1119.76 284.195 1118.7V1114.23H285.367V1118.58C285.367 1119.33 285.581 1119.93 286.008 1120.38C286.435 1120.83 287.005 1121.05 287.719 1121.05C288.453 1121.05 289.039 1120.83 289.477 1120.38C289.914 1119.93 290.133 1119.33 290.133 1118.58V1114.23ZM305.75 1122H304.141L298.742 1116.38V1122H297.547V1110.8H298.742V1115.89L303.703 1110.8H305.273L300.023 1116.12L305.75 1122ZM312.992 1114.23H314.164V1122H312.992V1120.2C312.706 1120.82 312.289 1121.3 311.742 1121.65C311.201 1121.99 310.562 1122.16 309.828 1122.16C309.125 1122.16 308.477 1121.98 307.883 1121.62C307.294 1121.26 306.828 1120.77 306.484 1120.14C306.141 1119.52 305.969 1118.83 305.969 1118.09C305.969 1117.35 306.141 1116.67 306.484 1116.05C306.828 1115.43 307.294 1114.95 307.883 1114.59C308.477 1114.24 309.125 1114.06 309.828 1114.06C310.562 1114.06 311.203 1114.23 311.75 1114.58C312.297 1114.92 312.711 1115.4 312.992 1116.02V1114.23ZM310.047 1121.05C310.896 1121.05 311.599 1120.78 312.156 1120.22C312.714 1119.66 312.992 1118.95 312.992 1118.09C312.992 1117.24 312.714 1116.54 312.156 1115.98C311.599 1115.43 310.896 1115.15 310.047 1115.15C309.224 1115.15 308.529 1115.43 307.961 1116.01C307.398 1116.58 307.117 1117.28 307.117 1118.09C307.117 1118.93 307.398 1119.63 307.961 1120.2C308.529 1120.77 309.224 1121.05 310.047 1121.05ZM316.992 1110.83C317.216 1110.83 317.414 1110.91 317.586 1111.08C317.758 1111.24 317.844 1111.44 317.844 1111.66C317.844 1111.89 317.758 1112.09 317.586 1112.27C317.414 1112.43 317.216 1112.52 316.992 1112.52C316.763 1112.52 316.568 1112.43 316.406 1112.27C316.245 1112.1 316.164 1111.9 316.164 1111.66C316.164 1111.44 316.245 1111.24 316.406 1111.08C316.568 1110.91 316.763 1110.83 316.992 1110.83ZM316.398 1114.23H317.57V1122H316.398V1114.23ZM322.367 1122.16C321.492 1122.16 320.768 1121.93 320.195 1121.49C319.622 1121.05 319.297 1120.45 319.219 1119.7H320.336C320.388 1120.14 320.596 1120.49 320.961 1120.76C321.326 1121.02 321.779 1121.15 322.32 1121.15C322.862 1121.15 323.297 1121.03 323.625 1120.78C323.958 1120.53 324.125 1120.21 324.125 1119.82C324.125 1119.56 324.057 1119.34 323.922 1119.16C323.786 1118.98 323.607 1118.85 323.383 1118.76C323.164 1118.67 322.914 1118.59 322.633 1118.52C322.352 1118.44 322.062 1118.38 321.766 1118.34C321.469 1118.29 321.18 1118.22 320.898 1118.12C320.617 1118.02 320.365 1117.9 320.141 1117.77C319.922 1117.62 319.745 1117.43 319.609 1117.17C319.474 1116.91 319.406 1116.6 319.406 1116.24C319.406 1115.6 319.659 1115.08 320.164 1114.67C320.669 1114.27 321.339 1114.06 322.172 1114.06C322.938 1114.06 323.596 1114.27 324.148 1114.67C324.706 1115.07 325.029 1115.61 325.117 1116.29H323.938C323.88 1115.92 323.685 1115.62 323.352 1115.39C323.018 1115.16 322.615 1115.04 322.141 1115.04C321.667 1115.04 321.281 1115.14 320.984 1115.35C320.693 1115.55 320.547 1115.82 320.547 1116.16C320.547 1116.44 320.633 1116.67 320.805 1116.84C320.982 1117.02 321.208 1117.15 321.484 1117.23C321.76 1117.32 322.065 1117.39 322.398 1117.45C322.737 1117.51 323.073 1117.58 323.406 1117.67C323.745 1117.76 324.052 1117.88 324.328 1118.02C324.604 1118.17 324.828 1118.39 325 1118.69C325.177 1118.98 325.266 1119.35 325.266 1119.79C325.266 1120.48 324.99 1121.04 324.438 1121.49C323.891 1121.93 323.201 1122.16 322.367 1122.16ZM334.273 1117.88C334.273 1118.11 334.268 1118.26 334.258 1118.32H327.742C327.799 1119.15 328.086 1119.83 328.602 1120.34C329.117 1120.85 329.781 1121.1 330.594 1121.1C331.219 1121.1 331.755 1120.96 332.203 1120.68C332.656 1120.39 332.935 1120.01 333.039 1119.54H334.211C334.06 1120.33 333.648 1120.96 332.977 1121.44C332.305 1121.92 331.5 1122.16 330.562 1122.16C329.432 1122.16 328.487 1121.77 327.727 1120.98C326.971 1120.2 326.594 1119.23 326.594 1118.06C326.594 1116.94 326.977 1116 327.742 1115.23C328.508 1114.45 329.443 1114.06 330.547 1114.06C331.24 1114.06 331.87 1114.23 332.438 1114.55C333.005 1114.88 333.453 1115.33 333.781 1115.91C334.109 1116.5 334.273 1117.15 334.273 1117.88ZM327.797 1117.33H333.023C332.966 1116.68 332.703 1116.15 332.234 1115.74C331.771 1115.33 331.193 1115.12 330.5 1115.12C329.812 1115.12 329.224 1115.32 328.734 1115.72C328.245 1116.12 327.932 1116.66 327.797 1117.33ZM339.898 1114.06C340.904 1114.06 341.701 1114.38 342.289 1115C342.883 1115.62 343.18 1116.46 343.18 1117.52V1122H342.008V1117.63C342.008 1116.89 341.792 1116.29 341.359 1115.84C340.932 1115.4 340.365 1115.17 339.656 1115.17C338.927 1115.17 338.341 1115.4 337.898 1115.85C337.461 1116.3 337.242 1116.89 337.242 1117.63V1122H336.07V1114.23H337.242V1115.74C337.492 1115.21 337.846 1114.8 338.305 1114.51C338.763 1114.21 339.294 1114.06 339.898 1114.06ZM349.273 1109.2H350.492V1124.95H349.273V1109.2ZM360.203 1110.8C360.969 1110.8 361.69 1110.94 362.367 1111.22C363.049 1111.49 363.635 1111.88 364.125 1112.37C364.615 1112.85 365 1113.44 365.281 1114.13C365.568 1114.82 365.711 1115.56 365.711 1116.35C365.711 1117.14 365.568 1117.89 365.281 1118.59C365 1119.29 364.615 1119.89 364.125 1120.39C363.635 1120.89 363.049 1121.28 362.367 1121.57C361.69 1121.86 360.969 1122 360.203 1122H356.734V1110.8H360.203ZM360.266 1120.85C361.464 1120.85 362.461 1120.42 363.258 1119.57C364.06 1118.71 364.461 1117.64 364.461 1116.35C364.461 1115.08 364.062 1114.02 363.266 1113.2C362.474 1112.37 361.474 1111.95 360.266 1111.95H357.93V1120.85H360.266ZM368.211 1110.83C368.435 1110.83 368.633 1110.91 368.805 1111.08C368.977 1111.24 369.062 1111.44 369.062 1111.66C369.062 1111.89 368.977 1112.09 368.805 1112.27C368.633 1112.43 368.435 1112.52 368.211 1112.52C367.982 1112.52 367.786 1112.43 367.625 1112.27C367.464 1112.1 367.383 1111.9 367.383 1111.66C367.383 1111.44 367.464 1111.24 367.625 1111.08C367.786 1110.91 367.982 1110.83 368.211 1110.83ZM367.617 1114.23H368.789V1122H367.617V1114.23ZM375.359 1114.06C376.062 1114.06 376.708 1114.24 377.297 1114.6C377.891 1114.96 378.359 1115.45 378.703 1116.07C379.047 1116.69 379.219 1117.37 379.219 1118.11C379.219 1118.85 379.047 1119.53 378.703 1120.16C378.359 1120.78 377.891 1121.27 377.297 1121.62C376.708 1121.98 376.062 1122.16 375.359 1122.16C374.625 1122.16 373.984 1121.99 373.438 1121.65C372.896 1121.3 372.482 1120.82 372.195 1120.2V1124.93H371.023V1114.23H372.195V1116.02C372.477 1115.4 372.891 1114.92 373.438 1114.58C373.984 1114.23 374.625 1114.06 375.359 1114.06ZM375.141 1121.05C375.964 1121.05 376.656 1120.77 377.219 1120.2C377.781 1119.64 378.062 1118.94 378.062 1118.11C378.062 1117.28 377.781 1116.58 377.219 1116.01C376.656 1115.43 375.964 1115.15 375.141 1115.15C374.292 1115.15 373.589 1115.43 373.031 1115.99C372.474 1116.55 372.195 1117.26 372.195 1118.11C372.195 1118.96 372.474 1119.66 373.031 1120.22C373.589 1120.78 374.292 1121.05 375.141 1121.05ZM382.117 1110.8V1122H380.945V1110.8H382.117ZM384.812 1115.23C385.589 1114.45 386.542 1114.06 387.672 1114.06C388.802 1114.06 389.755 1114.45 390.531 1115.23C391.312 1116.01 391.703 1116.97 391.703 1118.11C391.703 1119.25 391.312 1120.21 390.531 1120.99C389.755 1121.77 388.802 1122.16 387.672 1122.16C386.542 1122.16 385.589 1121.77 384.812 1120.99C384.042 1120.21 383.656 1119.25 383.656 1118.11C383.656 1116.97 384.042 1116.01 384.812 1115.23ZM387.672 1115.17C386.865 1115.17 386.185 1115.45 385.633 1116.02C385.081 1116.58 384.805 1117.28 384.805 1118.11C384.805 1118.94 385.081 1119.64 385.633 1120.2C386.185 1120.77 386.865 1121.05 387.672 1121.05C388.479 1121.05 389.161 1120.77 389.719 1120.2C390.276 1119.63 390.555 1118.93 390.555 1118.11C390.555 1117.28 390.276 1116.59 389.719 1116.02C389.167 1115.46 388.484 1115.17 387.672 1115.17ZM402.555 1114.06C403.523 1114.06 404.292 1114.36 404.859 1114.95C405.432 1115.53 405.719 1116.33 405.719 1117.34V1122H404.555V1117.55C404.555 1116.81 404.359 1116.23 403.969 1115.8C403.583 1115.38 403.052 1115.17 402.375 1115.17C402.099 1115.17 401.836 1115.22 401.586 1115.3C401.336 1115.39 401.102 1115.53 400.883 1115.71C400.669 1115.89 400.497 1116.14 400.367 1116.46C400.242 1116.78 400.18 1117.14 400.18 1117.55V1122H399.016V1117.55C399.016 1116.81 398.82 1116.23 398.43 1115.8C398.044 1115.38 397.513 1115.17 396.836 1115.17C396.565 1115.17 396.305 1115.22 396.055 1115.3C395.81 1115.39 395.578 1115.52 395.359 1115.7C395.146 1115.88 394.974 1116.13 394.844 1116.45C394.714 1116.76 394.648 1117.13 394.648 1117.55V1122H393.477V1114.23H394.648V1115.57C394.904 1115.06 395.26 1114.68 395.719 1114.44C396.177 1114.19 396.667 1114.06 397.188 1114.06C398.526 1114.06 399.419 1114.62 399.867 1115.74C400.086 1115.21 400.44 1114.8 400.93 1114.51C401.419 1114.21 401.961 1114.06 402.555 1114.06ZM414.523 1114.23H415.695V1122H414.523V1120.2C414.237 1120.82 413.82 1121.3 413.273 1121.65C412.732 1121.99 412.094 1122.16 411.359 1122.16C410.656 1122.16 410.008 1121.98 409.414 1121.62C408.826 1121.26 408.359 1120.77 408.016 1120.14C407.672 1119.52 407.5 1118.83 407.5 1118.09C407.5 1117.35 407.672 1116.67 408.016 1116.05C408.359 1115.43 408.826 1114.95 409.414 1114.59C410.008 1114.24 410.656 1114.06 411.359 1114.06C412.094 1114.06 412.734 1114.23 413.281 1114.58C413.828 1114.92 414.242 1115.4 414.523 1116.02V1114.23ZM411.578 1121.05C412.427 1121.05 413.13 1120.78 413.688 1120.22C414.245 1119.66 414.523 1118.95 414.523 1118.09C414.523 1117.24 414.245 1116.54 413.688 1115.98C413.13 1115.43 412.427 1115.15 411.578 1115.15C410.755 1115.15 410.06 1115.43 409.492 1116.01C408.93 1116.58 408.648 1117.28 408.648 1118.09C408.648 1118.93 408.93 1119.63 409.492 1120.2C410.06 1120.77 410.755 1121.05 411.578 1121.05ZM422.383 1110.83C422.607 1110.83 422.805 1110.91 422.977 1111.08C423.148 1111.24 423.234 1111.44 423.234 1111.66C423.234 1111.89 423.148 1112.09 422.977 1112.27C422.805 1112.43 422.607 1112.52 422.383 1112.52C422.154 1112.52 421.958 1112.43 421.797 1112.27C421.635 1112.1 421.555 1111.9 421.555 1111.66C421.555 1111.44 421.635 1111.24 421.797 1111.08C421.958 1110.91 422.154 1110.83 422.383 1110.83ZM421.789 1114.23H422.961V1122H421.789V1114.23ZM429.023 1114.06C430.029 1114.06 430.826 1114.38 431.414 1115C432.008 1115.62 432.305 1116.46 432.305 1117.52V1122H431.133V1117.63C431.133 1116.89 430.917 1116.29 430.484 1115.84C430.057 1115.4 429.49 1115.17 428.781 1115.17C428.052 1115.17 427.466 1115.4 427.023 1115.85C426.586 1116.3 426.367 1116.89 426.367 1117.63V1122H425.195V1114.23H426.367V1115.74C426.617 1115.21 426.971 1114.8 427.43 1114.51C427.888 1114.21 428.419 1114.06 429.023 1114.06ZM446.242 1122L445.156 1119.27H439.859L438.766 1122H437.492L441.969 1110.8H443.055L447.555 1122H446.242ZM440.32 1118.11H444.703L442.516 1112.58L440.32 1118.11ZM449.031 1110.8H450.227V1122H449.031V1110.8ZM463.039 1114.23H464.211V1122H463.039V1120.2C462.753 1120.82 462.336 1121.3 461.789 1121.65C461.247 1121.99 460.609 1122.16 459.875 1122.16C459.172 1122.16 458.523 1121.98 457.93 1121.62C457.341 1121.26 456.875 1120.77 456.531 1120.14C456.188 1119.52 456.016 1118.83 456.016 1118.09C456.016 1117.35 456.188 1116.67 456.531 1116.05C456.875 1115.43 457.341 1114.95 457.93 1114.59C458.523 1114.24 459.172 1114.06 459.875 1114.06C460.609 1114.06 461.25 1114.23 461.797 1114.58C462.344 1114.92 462.758 1115.4 463.039 1116.02V1114.23ZM460.094 1121.05C460.943 1121.05 461.646 1120.78 462.203 1120.22C462.76 1119.66 463.039 1118.95 463.039 1118.09C463.039 1117.24 462.76 1116.54 462.203 1115.98C461.646 1115.43 460.943 1115.15 460.094 1115.15C459.271 1115.15 458.576 1115.43 458.008 1116.01C457.445 1116.58 457.164 1117.28 457.164 1118.09C457.164 1118.93 457.445 1119.63 458.008 1120.2C458.576 1120.77 459.271 1121.05 460.094 1121.05ZM470.273 1114.06C471.279 1114.06 472.076 1114.38 472.664 1115C473.258 1115.62 473.555 1116.46 473.555 1117.52V1122H472.383V1117.63C472.383 1116.89 472.167 1116.29 471.734 1115.84C471.307 1115.4 470.74 1115.17 470.031 1115.17C469.302 1115.17 468.716 1115.4 468.273 1115.85C467.836 1116.3 467.617 1116.89 467.617 1117.63V1122H466.445V1114.23H467.617V1115.74C467.867 1115.21 468.221 1114.8 468.68 1114.51C469.138 1114.21 469.669 1114.06 470.273 1114.06ZM482.352 1110.8H483.523V1122H482.352V1120.2C482.065 1120.82 481.648 1121.3 481.102 1121.65C480.56 1121.99 479.922 1122.16 479.188 1122.16C478.484 1122.16 477.836 1121.98 477.242 1121.62C476.654 1121.26 476.188 1120.77 475.844 1120.14C475.5 1119.52 475.328 1118.83 475.328 1118.09C475.328 1117.35 475.5 1116.67 475.844 1116.05C476.188 1115.43 476.654 1114.95 477.242 1114.59C477.836 1114.24 478.484 1114.06 479.188 1114.06C479.922 1114.06 480.562 1114.23 481.109 1114.58C481.656 1114.92 482.07 1115.4 482.352 1116.02V1110.8ZM479.406 1121.05C480.255 1121.05 480.958 1120.78 481.516 1120.22C482.073 1119.66 482.352 1118.95 482.352 1118.09C482.352 1117.24 482.073 1116.54 481.516 1115.98C480.958 1115.43 480.255 1115.15 479.406 1115.15C478.583 1115.15 477.888 1115.43 477.32 1116.01C476.758 1116.58 476.477 1117.28 476.477 1118.09C476.477 1118.93 476.758 1119.63 477.32 1120.2C477.888 1120.77 478.583 1121.05 479.406 1121.05ZM489.766 1122V1110.8H491.188L495.445 1120.23L499.781 1110.8H501.016V1122H499.797V1113.23L495.828 1122H494.914L490.961 1113.23V1122H489.766ZM503.547 1110.8H504.742V1120.85H510.406V1122H503.547V1110.8Z"
            fill="#0F47F2"
          />
          <path
            d="M91.4756 1093.18C90.1221 1093.18 89.0029 1092.78 88.1182 1091.98C87.2334 1091.18 86.791 1090.16 86.791 1088.93H88.8828C88.8828 1089.6 89.123 1090.15 89.6035 1090.57C90.0898 1090.99 90.7139 1091.2 91.4756 1091.2C92.1904 1091.2 92.7734 1091.03 93.2246 1090.71C93.6758 1090.37 93.9014 1089.94 93.9014 1089.41C93.9014 1089.12 93.8223 1088.85 93.6641 1088.63C93.5059 1088.41 93.292 1088.23 93.0225 1088.1C92.7588 1087.96 92.4512 1087.83 92.0996 1087.73C91.7539 1087.62 91.3877 1087.52 91.001 1087.42C90.6201 1087.32 90.2363 1087.21 89.8496 1087.1C89.4688 1086.99 89.1025 1086.84 88.751 1086.66C88.4053 1086.48 88.0977 1086.27 87.8281 1086.03C87.5645 1085.79 87.3535 1085.48 87.1953 1085.1C87.0371 1084.71 86.958 1084.27 86.958 1083.78C86.958 1082.74 87.3594 1081.89 88.1621 1081.22C88.9648 1080.55 89.9844 1080.22 91.2207 1080.22C91.9238 1080.22 92.5566 1080.33 93.1191 1080.54C93.6875 1080.75 94.1475 1081.04 94.499 1081.41C94.8564 1081.77 95.1289 1082.19 95.3164 1082.66C95.5039 1083.13 95.5977 1083.64 95.5977 1084.18H93.4355C93.418 1083.6 93.2012 1083.13 92.7852 1082.77C92.3691 1082.4 91.8242 1082.22 91.1504 1082.22C90.5117 1082.22 89.9961 1082.36 89.6035 1082.65C89.2168 1082.93 89.0234 1083.3 89.0234 1083.76C89.0234 1084.04 89.1025 1084.29 89.2607 1084.49C89.4189 1084.69 89.6328 1084.85 89.9023 1084.98C90.1719 1085.1 90.4795 1085.21 90.8252 1085.31C91.1768 1085.41 91.543 1085.51 91.9238 1085.6C92.3105 1085.69 92.6973 1085.8 93.084 1085.92C93.4707 1086.03 93.8369 1086.18 94.1826 1086.37C94.5342 1086.56 94.8447 1086.78 95.1143 1087.04C95.3838 1087.29 95.5977 1087.62 95.7559 1088.03C95.9141 1088.43 95.9932 1088.89 95.9932 1089.41C95.9932 1090.13 95.7969 1090.77 95.4043 1091.35C95.0176 1091.92 94.4785 1092.37 93.7871 1092.69C93.1016 1093.01 92.3311 1093.18 91.4756 1093.18ZM104.642 1084.2H106.663V1093H104.642V1091.45C104.319 1092.01 103.895 1092.44 103.367 1092.74C102.84 1093.03 102.228 1093.18 101.53 1093.18C100.763 1093.18 100.057 1092.97 99.4121 1092.57C98.7676 1092.16 98.2578 1091.6 97.8828 1090.9C97.5078 1090.19 97.3203 1089.42 97.3203 1088.59C97.3203 1087.76 97.5078 1086.99 97.8828 1086.29C98.2578 1085.58 98.7676 1085.03 99.4121 1084.62C100.057 1084.22 100.763 1084.02 101.53 1084.02C102.228 1084.02 102.84 1084.17 103.367 1084.47C103.895 1084.76 104.319 1085.19 104.642 1085.75V1084.2ZM101.961 1091.27C102.723 1091.27 103.358 1091.01 103.868 1090.5C104.384 1089.99 104.642 1089.35 104.642 1088.59C104.642 1087.83 104.384 1087.2 103.868 1086.69C103.358 1086.18 102.723 1085.92 101.961 1085.92C101.217 1085.92 100.587 1086.19 100.071 1086.71C99.5557 1087.22 99.2979 1087.85 99.2979 1088.59C99.2979 1089.34 99.5557 1089.97 100.071 1090.5C100.587 1091.01 101.217 1091.27 101.961 1091.27ZM113.94 1086.11H111.629V1089.65C111.629 1090.18 111.775 1090.58 112.068 1090.84C112.367 1091.09 112.774 1091.22 113.29 1091.22C113.542 1091.22 113.759 1091.19 113.94 1091.15V1093C113.63 1093.07 113.27 1093.11 112.859 1093.11C111.869 1093.11 111.081 1092.81 110.495 1092.22C109.909 1091.63 109.616 1090.78 109.616 1089.69V1086.11H107.946V1084.2H109.616V1081.84H111.629V1084.2H113.94V1086.11ZM121.648 1084.2H123.661V1093H121.648V1091.61C121.367 1092.12 121.001 1092.5 120.55 1092.77C120.099 1093.04 119.583 1093.18 119.003 1093.18C117.866 1093.18 116.973 1092.82 116.322 1092.12C115.672 1091.41 115.347 1090.44 115.347 1089.2V1084.2H117.342V1088.97C117.342 1089.66 117.538 1090.21 117.931 1090.63C118.323 1091.04 118.842 1091.25 119.486 1091.25C120.137 1091.25 120.658 1091.04 121.051 1090.63C121.449 1090.21 121.648 1089.66 121.648 1088.97V1084.2ZM130.139 1084.02C130.332 1084.02 130.61 1084.05 130.974 1084.12V1085.96C130.634 1085.88 130.338 1085.84 130.086 1085.84C129.424 1085.84 128.87 1086.06 128.425 1086.5C127.985 1086.94 127.766 1087.54 127.766 1088.3V1093H125.771V1084.2H127.766V1085.37C128.322 1084.47 129.113 1084.02 130.139 1084.02ZM132.591 1085.34C133.464 1084.46 134.545 1084.02 135.834 1084.02C137.123 1084.02 138.207 1084.46 139.086 1085.34C139.965 1086.21 140.404 1087.3 140.404 1088.61C140.404 1089.91 139.965 1090.99 139.086 1091.87C138.207 1092.74 137.123 1093.18 135.834 1093.18C134.545 1093.18 133.464 1092.74 132.591 1091.87C131.718 1090.99 131.281 1089.91 131.281 1088.61C131.281 1087.3 131.718 1086.21 132.591 1085.34ZM137.68 1086.71C137.182 1086.2 136.566 1085.94 135.834 1085.94C135.102 1085.94 134.489 1086.2 133.997 1086.71C133.505 1087.22 133.259 1087.85 133.259 1088.61C133.259 1089.36 133.505 1089.99 133.997 1090.5C134.495 1091 135.107 1091.25 135.834 1091.25C136.566 1091.25 137.182 1091 137.68 1090.49C138.178 1089.98 138.427 1089.35 138.427 1088.61C138.427 1087.85 138.178 1087.22 137.68 1086.71ZM158.079 1085.94C158.138 1086.28 158.167 1086.68 158.167 1087.13C158.167 1088.29 157.897 1089.33 157.358 1090.26C156.825 1091.18 156.093 1091.9 155.161 1092.41C154.235 1092.92 153.198 1093.18 152.05 1093.18C151.159 1093.18 150.318 1093.01 149.527 1092.67C148.742 1092.34 148.068 1091.89 147.506 1091.31C146.949 1090.74 146.507 1090.05 146.179 1089.25C145.856 1088.44 145.695 1087.59 145.695 1086.68C145.695 1085.78 145.856 1084.93 146.179 1084.13C146.507 1083.33 146.952 1082.64 147.515 1082.08C148.077 1081.5 148.751 1081.05 149.536 1080.72C150.327 1080.39 151.165 1080.22 152.05 1080.22C152.97 1080.22 153.852 1080.41 154.695 1080.79C155.545 1081.17 156.251 1081.68 156.813 1082.31C157.382 1082.95 157.742 1083.63 157.895 1084.36H155.521C155.293 1083.75 154.848 1083.24 154.186 1082.86C153.529 1082.46 152.817 1082.27 152.05 1082.27C150.866 1082.27 149.873 1082.69 149.07 1083.53C148.273 1084.38 147.875 1085.43 147.875 1086.68C147.875 1087.51 148.057 1088.27 148.42 1088.95C148.789 1089.62 149.302 1090.16 149.958 1090.55C150.62 1090.93 151.364 1091.13 152.19 1091.13C153.175 1091.13 154.016 1090.84 154.713 1090.26C155.416 1089.67 155.853 1088.91 156.022 1087.98H152.085V1085.94H158.079ZM160.821 1085.34C161.694 1084.46 162.775 1084.02 164.064 1084.02C165.354 1084.02 166.438 1084.46 167.316 1085.34C168.195 1086.21 168.635 1087.3 168.635 1088.61C168.635 1089.91 168.195 1090.99 167.316 1091.87C166.438 1092.74 165.354 1093.18 164.064 1093.18C162.775 1093.18 161.694 1092.74 160.821 1091.87C159.948 1090.99 159.512 1089.91 159.512 1088.61C159.512 1087.3 159.948 1086.21 160.821 1085.34ZM165.91 1086.71C165.412 1086.2 164.797 1085.94 164.064 1085.94C163.332 1085.94 162.72 1086.2 162.228 1086.71C161.735 1087.22 161.489 1087.85 161.489 1088.61C161.489 1089.36 161.735 1089.99 162.228 1090.5C162.726 1091 163.338 1091.25 164.064 1091.25C164.797 1091.25 165.412 1091 165.91 1090.49C166.408 1089.98 166.657 1089.35 166.657 1088.61C166.657 1087.85 166.408 1087.22 165.91 1086.71ZM170.393 1080.49C170.645 1080.24 170.946 1080.12 171.298 1080.12C171.649 1080.12 171.954 1080.24 172.212 1080.49C172.47 1080.75 172.599 1081.04 172.599 1081.39C172.599 1081.75 172.47 1082.05 172.212 1082.3C171.954 1082.56 171.649 1082.68 171.298 1082.68C170.946 1082.68 170.645 1082.56 170.393 1082.3C170.146 1082.05 170.023 1081.75 170.023 1081.39C170.023 1081.04 170.146 1080.75 170.393 1080.49ZM168.96 1094.67C168.983 1094.67 169.027 1094.67 169.092 1094.68C169.15 1094.69 169.197 1094.7 169.232 1094.7C169.953 1094.7 170.313 1094.22 170.313 1093.27V1084.2H172.309V1093.47C172.309 1094.43 172.051 1095.18 171.535 1095.71C171.025 1096.24 170.311 1096.51 169.391 1096.51C169.221 1096.51 169.077 1096.5 168.96 1096.49V1094.67ZM180.729 1084.2H182.741V1093H180.729V1091.61C180.447 1092.12 180.081 1092.5 179.63 1092.77C179.179 1093.04 178.663 1093.18 178.083 1093.18C176.946 1093.18 176.053 1092.82 175.402 1092.12C174.752 1091.41 174.427 1090.44 174.427 1089.2V1084.2H176.422V1088.97C176.422 1089.66 176.618 1090.21 177.011 1090.63C177.403 1091.04 177.922 1091.25 178.566 1091.25C179.217 1091.25 179.738 1091.04 180.131 1090.63C180.529 1090.21 180.729 1089.66 180.729 1088.97V1084.2Z"
            fill="#222222"
          />
          <g clip-path="url(#clip11_4500_3993)">
            <path
              d="M190.446 1092.47C189.994 1088.49 189.972 1085.62 190.368 1081.71L190.549 1081.67L190.426 1081.2C190.422 1081.18 190.422 1081.18 190.423 1081.17C190.438 1081.04 190.586 1080.88 190.717 1080.86C190.718 1080.86 190.721 1080.86 190.723 1080.86C190.728 1080.86 190.734 1080.86 190.741 1080.86L191.226 1080.96L191.251 1080.78C192.663 1080.57 194.09 1080.46 195.499 1080.46C196.908 1080.46 198.336 1080.57 199.748 1080.78L199.774 1080.96L200.258 1080.86C200.265 1080.86 200.271 1080.86 200.275 1080.86C200.278 1080.86 200.28 1080.86 200.283 1080.86C200.413 1080.88 200.561 1081.04 200.576 1081.17C200.576 1081.18 200.577 1081.18 200.573 1081.2L200.449 1081.67L200.631 1081.71C201.027 1085.62 201.005 1088.49 200.553 1092.47L200.449 1092.42L200.415 1092.45C198.503 1091.49 197.481 1090.71 195.868 1088.61L195.499 1088.13L195.131 1088.61C193.455 1090.79 192.481 1091.54 190.588 1092.45L190.55 1092.42L190.446 1092.47Z"
              fill="#818283"
            />
            <path
              d="M195.499 1080.93C194.227 1080.93 192.94 1081.02 191.663 1081.19L191.618 1081.52L190.953 1081.38L191.123 1082.03L190.796 1082.09C190.459 1085.6 190.47 1088.28 190.84 1091.81C191.567 1091.43 192.083 1091.1 192.565 1090.71C193.242 1090.17 193.899 1089.45 194.762 1088.33L195.499 1087.36L196.236 1088.33C197.069 1089.41 197.755 1090.15 198.459 1090.71C198.981 1091.13 199.533 1091.46 200.16 1091.8C200.528 1088.28 200.54 1085.59 200.202 1082.09L199.876 1082.03L200.045 1081.38L199.383 1081.52L199.337 1081.19C198.059 1081.02 196.772 1080.93 195.499 1080.93ZM195.499 1080C197.052 1080 198.605 1080.12 200.158 1080.37C200.159 1080.38 200.163 1080.39 200.164 1080.41C200.225 1080.39 200.29 1080.39 200.36 1080.4C200.694 1080.46 201 1080.78 201.037 1081.12C201.045 1081.19 201.038 1081.26 201.022 1081.31C201.034 1081.32 201.046 1081.32 201.058 1081.32C201.499 1085.5 201.481 1088.45 201.002 1092.63C201.002 1092.63 201.003 1092.63 201.003 1092.64C201.003 1092.64 201.001 1092.64 201.001 1092.64C200.997 1092.67 200.994 1092.71 200.99 1092.74C200.983 1092.74 200.977 1092.74 200.97 1092.74C200.914 1092.87 200.794 1092.97 200.663 1093C200.604 1093.01 200.554 1092.99 200.51 1092.97C200.5 1092.98 200.488 1092.99 200.478 1093C198.405 1091.98 197.282 1091.22 195.499 1088.89C193.717 1091.22 192.675 1091.98 190.52 1093C190.51 1092.99 190.499 1092.98 190.488 1092.97C190.445 1092.99 190.395 1093.01 190.335 1093C190.204 1092.97 190.085 1092.87 190.029 1092.74C190.022 1092.74 190.015 1092.74 190.009 1092.74C190.005 1092.71 190.001 1092.67 189.998 1092.64C189.997 1092.64 189.996 1092.64 189.996 1092.64C189.995 1092.63 189.996 1092.63 189.996 1092.63C189.518 1088.45 189.499 1085.5 189.941 1081.32C189.953 1081.32 189.965 1081.32 189.977 1081.31C189.961 1081.26 189.954 1081.19 189.961 1081.12C189.999 1080.78 190.304 1080.46 190.639 1080.4C190.709 1080.39 190.774 1080.39 190.834 1080.41C190.836 1080.39 190.84 1080.38 190.841 1080.37C192.394 1080.12 193.947 1080 195.499 1080Z"
              fill="#818283"
            />
          </g>
          <path d="M86 1174H766" stroke="#818283" stroke-width="0.25" />
          <circle cx="188.5" cy="1301.5" r="14.5" fill="#4B5563" />
          <path
            d="M186.257 1301.52C186.257 1302.72 185.261 1303.69 184.032 1303.69C182.803 1303.69 181.807 1302.72 181.807 1301.52C181.807 1300.32 182.803 1299.35 184.032 1299.35C185.261 1299.35 186.257 1300.32 186.257 1301.52Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M190.709 1296.73L186.258 1299.77"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M190.709 1306.3L186.258 1303.26"
            stroke="#F5F9FB"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M195.162 1307.16C195.162 1308.36 194.165 1309.33 192.936 1309.33C191.707 1309.33 190.711 1308.36 190.711 1307.16C190.711 1305.96 191.707 1304.99 192.936 1304.99C194.165 1304.99 195.162 1305.96 195.162 1307.16Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <path
            d="M195.162 1295.86C195.162 1297.06 194.165 1298.03 192.936 1298.03C191.707 1298.03 190.711 1297.06 190.711 1295.86C190.711 1294.66 191.707 1293.69 192.936 1293.69C194.165 1293.69 195.162 1294.66 195.162 1295.86Z"
            stroke="#F5F9FB"
            stroke-width="1.2"
          />
          <rect
            x="511.25"
            y="81.25"
            width="79.5"
            height="38.5"
            rx="6.75"
            fill="white"
          />
          <rect
            x="511.25"
            y="81.25"
            width="79.5"
            height="38.5"
            rx="6.75"
            stroke="#818283"
            stroke-width="0.5"
          />
          <path
            d="M528.05 95H518.95C518.031 95 517.571 95 517.286 95.2519C517 95.5038 517 95.9092 517 96.7201V97.1416C517 97.7759 517 98.093 517.169 98.3559C517.337 98.6188 517.646 98.7819 518.262 99.1082L520.156 100.11C520.569 100.329 520.776 100.439 520.924 100.56C521.233 100.811 521.423 101.107 521.509 101.47C521.55 101.644 521.55 101.848 521.55 102.256V103.887C521.55 104.443 521.55 104.721 521.714 104.937C521.878 105.154 522.168 105.261 522.75 105.475C523.971 105.924 524.582 106.148 525.016 105.893C525.45 105.637 525.45 105.054 525.45 103.887V102.256C525.45 101.848 525.45 101.644 525.491 101.47C525.577 101.107 525.767 100.811 526.076 100.56C526.224 100.439 526.431 100.329 526.844 100.11L528.738 99.1082C529.354 98.7819 529.663 98.6188 529.831 98.3559C530 98.093 530 97.7759 530 97.1416V96.7201C530 95.9092 530 95.5038 529.714 95.2519C529.429 95 528.969 95 528.05 95Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M538.867 107.156C537.701 107.156 536.734 106.815 535.969 106.133C535.208 105.445 534.828 104.578 534.828 103.531H536.016C536.016 104.26 536.284 104.859 536.82 105.328C537.357 105.792 538.039 106.023 538.867 106.023C539.648 106.023 540.294 105.833 540.805 105.453C541.315 105.068 541.57 104.576 541.57 103.977C541.57 103.664 541.508 103.388 541.383 103.148C541.263 102.909 541.096 102.716 540.883 102.57C540.674 102.424 540.43 102.292 540.148 102.172C539.872 102.047 539.576 101.948 539.258 101.875C538.945 101.802 538.622 101.719 538.289 101.625C537.956 101.531 537.63 101.44 537.312 101.352C537 101.258 536.703 101.133 536.422 100.977C536.146 100.82 535.901 100.643 535.688 100.445C535.479 100.247 535.312 99.9922 535.188 99.6797C535.068 99.3672 535.008 99.013 535.008 98.6172C535.008 97.7526 535.354 97.0417 536.047 96.4844C536.745 95.9219 537.625 95.6406 538.688 95.6406C539.828 95.6406 540.734 95.9505 541.406 96.5703C542.078 97.1849 542.414 97.9583 542.414 98.8906H541.188C541.161 98.276 540.914 97.7734 540.445 97.3828C539.982 96.987 539.385 96.7891 538.656 96.7891C537.927 96.7891 537.333 96.9583 536.875 97.2969C536.422 97.6354 536.195 98.0755 536.195 98.6172C536.195 98.9297 536.271 99.2005 536.422 99.4297C536.573 99.6589 536.773 99.8411 537.023 99.9766C537.279 100.112 537.57 100.232 537.898 100.336C538.227 100.435 538.573 100.529 538.938 100.617C539.302 100.701 539.664 100.792 540.023 100.891C540.388 100.99 540.734 101.12 541.062 101.281C541.391 101.443 541.68 101.635 541.93 101.859C542.185 102.078 542.388 102.37 542.539 102.734C542.69 103.094 542.766 103.508 542.766 103.977C542.766 104.898 542.396 105.659 541.656 106.258C540.922 106.857 539.992 107.156 538.867 107.156ZM545.328 100.234C546.104 99.4531 547.057 99.0625 548.188 99.0625C549.318 99.0625 550.271 99.4531 551.047 100.234C551.828 101.01 552.219 101.969 552.219 103.109C552.219 104.25 551.828 105.211 551.047 105.992C550.271 106.768 549.318 107.156 548.188 107.156C547.057 107.156 546.104 106.768 545.328 105.992C544.557 105.211 544.172 104.25 544.172 103.109C544.172 101.969 544.557 101.01 545.328 100.234ZM548.188 100.172C547.38 100.172 546.701 100.453 546.148 101.016C545.596 101.578 545.32 102.276 545.32 103.109C545.32 103.938 545.596 104.635 546.148 105.203C546.701 105.771 547.38 106.055 548.188 106.055C548.995 106.055 549.677 105.771 550.234 105.203C550.792 104.63 551.07 103.932 551.07 103.109C551.07 102.281 550.792 101.586 550.234 101.023C549.682 100.456 549 100.172 548.188 100.172ZM559.93 99.2266H561.102V107H559.93V105.492C559.68 106.018 559.326 106.427 558.867 106.719C558.414 107.01 557.883 107.156 557.273 107.156C556.273 107.156 555.477 106.844 554.883 106.219C554.289 105.594 553.992 104.755 553.992 103.703V99.2266H555.164V103.578C555.164 104.333 555.378 104.935 555.805 105.383C556.232 105.831 556.802 106.055 557.516 106.055C558.25 106.055 558.836 105.831 559.273 105.383C559.711 104.935 559.93 104.333 559.93 103.578V99.2266ZM566.695 99.0625C566.898 99.0625 567.141 99.0938 567.422 99.1562V100.25C567.167 100.161 566.914 100.117 566.664 100.117C566.055 100.117 565.542 100.333 565.125 100.766C564.714 101.193 564.508 101.734 564.508 102.391V107H563.336V99.2266H564.508V100.469C564.737 100.031 565.042 99.6875 565.422 99.4375C565.802 99.1875 566.227 99.0625 566.695 99.0625ZM571.844 107.156C570.714 107.156 569.76 106.768 568.984 105.992C568.214 105.211 567.828 104.25 567.828 103.109C567.828 101.969 568.214 101.01 568.984 100.234C569.76 99.4531 570.714 99.0625 571.844 99.0625C572.724 99.0625 573.508 99.3203 574.195 99.8359C574.883 100.346 575.299 100.99 575.445 101.766H574.258C574.128 101.302 573.836 100.922 573.383 100.625C572.93 100.323 572.417 100.172 571.844 100.172C571.036 100.172 570.357 100.453 569.805 101.016C569.253 101.578 568.977 102.276 568.977 103.109C568.977 103.938 569.253 104.635 569.805 105.203C570.357 105.771 571.036 106.055 571.844 106.055C572.422 106.055 572.94 105.898 573.398 105.586C573.862 105.273 574.148 104.87 574.258 104.375H575.445C575.326 105.188 574.919 105.854 574.227 106.375C573.539 106.896 572.745 107.156 571.844 107.156ZM584.289 102.875C584.289 103.109 584.284 103.258 584.273 103.32H577.758C577.815 104.154 578.102 104.826 578.617 105.336C579.133 105.846 579.797 106.102 580.609 106.102C581.234 106.102 581.771 105.961 582.219 105.68C582.672 105.393 582.951 105.013 583.055 104.539H584.227C584.076 105.326 583.664 105.958 582.992 106.438C582.32 106.917 581.516 107.156 580.578 107.156C579.448 107.156 578.503 106.766 577.742 105.984C576.987 105.203 576.609 104.229 576.609 103.062C576.609 101.943 576.992 100.997 577.758 100.227C578.523 99.4505 579.458 99.0625 580.562 99.0625C581.255 99.0625 581.885 99.2266 582.453 99.5547C583.021 99.8776 583.469 100.331 583.797 100.914C584.125 101.497 584.289 102.151 584.289 102.875ZM577.812 102.328H583.039C582.982 101.682 582.719 101.154 582.25 100.742C581.786 100.326 581.208 100.117 580.516 100.117C579.828 100.117 579.24 100.318 578.75 100.719C578.26 101.12 577.948 101.656 577.812 102.328Z"
            fill="#818283"
          />
          <path
            d="M236 782.342C236 777.439 240.104 773.465 245.167 773.465H256V779.114C256 784.462 251.523 788.798 246 788.798H236V782.342Z"
            fill="#0F47F2"
          />
          <path
            d="M241.679 779.151C242.304 779.151 242.799 779.314 243.163 779.696C243.528 780.077 243.71 780.597 243.71 781.256V783.956H242.592V781.388C242.592 781.016 242.483 780.718 242.265 780.495C242.05 780.271 241.765 780.159 241.41 780.159C241.042 780.159 240.748 780.271 240.526 780.495C240.308 780.718 240.199 781.016 240.199 781.388V783.956H239.091L239.091 779.151H240.199L240.199 779.965C240.355 779.697 240.561 779.491 240.814 779.346C241.068 779.197 241.356 779.151 241.679 779.151Z"
            fill="white"
          />
          <path
            d="M249.213 783.956H247.875L246.747 782.424L245.624 783.956H244.296L246.083 781.516L244.385 779.147H245.748L246.757 780.603L247.765 779.149H249.093L247.426 781.507L249.213 783.956Z"
            fill="white"
          />
          <path
            d="M252.831 780.249H251.547V782.154C251.547 782.441 251.628 782.654 251.791 782.793C251.957 782.928 252.183 782.996 252.47 782.996C252.61 782.996 252.73 782.983 252.831 782.958V783.956C252.659 783.994 252.458 784.013 252.23 784.013C251.68 784.013 251.243 783.854 250.917 783.535C250.591 783.217 250.429 782.763 250.429 782.173V780.249H249.501L249.519 779.149H250.429L250.429 777.951H251.547L251.547 779.149H252.831V780.249Z"
            fill="white"
          />
          <path
            d="M245.167 773.515H255.95V779.114C255.95 784.433 251.497 788.748 246 788.748H236.05V782.342C236.05 777.468 240.131 773.515 245.167 773.515ZM244.344 779.177L246.021 781.516L244.256 783.927L244.197 784.006H245.649L245.664 783.985L246.747 782.507L247.835 783.985L247.85 784.006H249.312L249.253 783.927L247.486 781.506L249.134 779.178L249.189 779.099H247.738L247.724 779.12L246.756 780.516L245.789 779.119L245.773 779.098H244.287L244.344 779.177ZM245.722 779.197L246.716 780.632L246.757 780.691L246.798 780.632L247.791 779.199H248.996L247.385 781.478L247.364 781.507L247.386 781.536L249.115 783.906H247.9L246.787 782.395L246.747 782.34L246.707 782.395L245.599 783.906H244.394L246.123 781.546L246.145 781.517L246.124 781.487L244.482 779.197H245.722ZM251.497 782.154C251.497 782.451 251.581 782.68 251.759 782.831H251.76C251.937 782.976 252.176 783.046 252.47 783.046C252.586 783.046 252.689 783.034 252.781 783.017V783.914C252.622 783.946 252.439 783.963 252.23 783.963C251.691 783.963 251.266 783.806 250.952 783.499C250.639 783.193 250.479 782.753 250.479 782.173V780.199H249.552L249.567 779.199H250.479V778.001H251.497V779.199H252.781V780.199H251.497V782.154ZM241.41 780.109C241.031 780.109 240.724 780.225 240.491 780.46H240.49C240.262 780.695 240.149 781.006 240.149 781.389V783.906H239.141V779.2H240.149V780.15L240.242 779.99C240.394 779.729 240.593 779.529 240.839 779.389H240.84C241.083 779.247 241.361 779.2 241.679 779.2C242.295 779.2 242.775 779.362 243.127 779.73C243.48 780.1 243.66 780.607 243.66 781.256V783.906H242.642V781.389C242.642 781.054 242.556 780.774 242.381 780.552L242.301 780.46C242.075 780.225 241.776 780.109 241.41 780.109ZM251.597 780.299H252.881V779.099H251.597V777.9H250.379V779.099H249.47L249.469 779.148L249.451 780.248L249.45 780.299H250.379V782.173C250.379 782.772 250.544 783.241 250.882 783.571C251.219 783.901 251.67 784.062 252.23 784.062C252.461 784.062 252.665 784.044 252.842 784.005L252.881 783.996V782.895L252.819 782.91C252.723 782.934 252.607 782.946 252.47 782.946C252.191 782.946 251.977 782.88 251.822 782.754C251.675 782.628 251.597 782.431 251.597 782.154V780.299ZM243.76 781.256C243.76 780.588 243.575 780.054 243.199 779.661C242.822 779.267 242.313 779.101 241.679 779.101C241.352 779.101 241.054 779.148 240.79 779.302C240.575 779.425 240.396 779.592 240.249 779.8V779.101H239.041V784.006H240.249V781.389C240.249 781.027 240.355 780.743 240.562 780.53C240.772 780.318 241.053 780.209 241.41 780.209C241.753 780.209 242.024 780.317 242.229 780.529C242.436 780.742 242.542 781.027 242.542 781.389V784.006H243.76V781.256Z"
            stroke="white"
            stroke-opacity="0.26"
            stroke-width="0.1"
          />
          <path
            d="M253.557 773.969L254.03 775.248L255.451 775.854L254.03 776.325L253.557 777.739L253.083 776.325L251.662 775.854L253.083 775.248L253.557 773.969Z"
            fill="white"
          />
          <defs>
            <filter
              id="filter0_d_4500_3993"
              x="7"
              y="134"
              width="818"
              height="316"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feMorphology
                radius="4"
                operator="dilate"
                in="SourceAlpha"
                result="effect1_dropShadow_4500_3993"
              />
              <feOffset dy="2" />
              <feGaussianBlur stdDeviation="10" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_4500_3993"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_4500_3993"
                result="shape"
              />
            </filter>
            <pattern
              id="pattern0_4500_3993"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1"
            >
              <use
                xlink:href="#image0_4500_3993"
                transform="translate(-0.0367109 -0.0213112) scale(0.00472938)"
              />
            </pattern>
            <linearGradient
              id="paint0_linear_4500_3993"
              x1="212.385"
              y1="187.477"
              x2="206.811"
              y2="181.051"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="white" />
              <stop offset="1" stop-color="#B1B1B1" />
            </linearGradient>
            <clipPath id="clip0_4500_3993">
              <rect
                width="26"
                height="26"
                fill="white"
                transform="translate(123 380)"
              />
            </clipPath>
            <clipPath id="clip1_4500_3993">
              <rect
                width="26"
                height="26"
                fill="white"
                transform="translate(87 380)"
              />
            </clipPath>
            <clipPath id="clip2_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(130 677)"
              />
            </clipPath>
            <clipPath id="clip3_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(86 677)"
              />
            </clipPath>
            <clipPath id="clip4_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(130 982)"
              />
            </clipPath>
            <clipPath id="clip5_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(86 982)"
              />
            </clipPath>
            <clipPath id="clip6_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(130 1287)"
              />
            </clipPath>
            <clipPath id="clip7_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(86 1287)"
              />
            </clipPath>
            <clipPath id="clip8_4500_3993">
              <rect
                width="13"
                height="13"
                fill="white"
                transform="translate(189 1080)"
              />
            </clipPath>
            <clipPath id="clip9_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(130 1287)"
              />
            </clipPath>
            <clipPath id="clip10_4500_3993">
              <rect
                width="29"
                height="29"
                fill="white"
                transform="translate(86 1287)"
              />
            </clipPath>
            <clipPath id="clip11_4500_3993">
              <rect
                width="13"
                height="13"
                fill="white"
                transform="translate(189 1080)"
              />
            </clipPath>
            <image
              id="image0_4500_3993"
              width="225"
              height="225"
              preserveAspectRatio="none"
              xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAIAAACx0UUtAAAQAElEQVR4AexdDYxcVRU+md3Ozv62W2hpSoVCFgkiQgk1oqCNTYg/CNKEQhNakSilxVh+XEot1HQtUqiIRbCiQglVQYxNQIyGpIpUQYFoBRpjXEMtBSmlu9v939nZ1e/1Lbvd2dmZ92bfvd99M2dz+joz775zzv3O9879nTeJ/+mfIuA2AgnRP0XAbQTycTQzKG2H5MA+FUXACAKd7YFujtwcbd0r21qkeancvlzuul5FETCCwPqrpPkK2bHVS4V52JqDoz/eLPfeLK2vSGVS6hqlpkFFETCFgIjs2S1fXybP7MTL3JLN0S03y96/eNSsnCaJ7JO5VeinikDRCIBjYNr0WfKrh2Tn9txqxtHw8W1y4F+STOUoqh8pAkYRQHO96+fy1z/lMDLG0YNvyu4nJVWbo5B+pAhYQKBmujx2n2CknmVrjKO/f0pSdVln9a0iYA8BtPvpPnl5d7bFMY7+7TlJVGSf1veKgE0EKpPy2ovZBkc42tMl6X4BkbPP63tFwCICyJJvvZ5tb4SjQxnJpLPP6XtFwD4CXR3ZNkc4mv1x0e/1QkUgagSUo1EjqvqiRkA5GjWiqi9qBJSjUSOq+qJGQDkaNaKqL2oElKNRI6r6okaAxdGo66H6ShcB5WjpxrZUaqYcLZVIlm49lKOlG9tSqZlytFQiWbr1UI6WbmxLpWauc7RUcNZ6FI+AcrR47PRKOwgoR+3grFaKR0A5Wjx2eqUdBJSjdnBWK8UjoBwtHju90g4CpcJRO2ipFQYCylEG6mozDALK0TBoaVkGAspRBupqMwwCytEwaGlZBgLKUQbqajMMAuXG0TDYaFk3EKBxdHhYMoNuCVyCEOMC6xAHYSFiAtMEjiIM/T0ye57Ma3JL5p4iM0+Q3k6Bh4DGsgCT6lqBD67BAq/S/ZbBGGeOwNF0nzTfJ833yI2bnZN198naB2R4yDZNQdDLV0vLw84BghjBq3MXeS3eOOJYfGObo0hR806TefMtVjGkKfgGuuBGCnld8cWByZz5csGnitdg+sol10h/t2kjk+q3zdFJHXHpxAcWeKnUmkeZtJx1vjVr8TNE4CjGBI7jVFMnqTp7zT26FvNPcxqSoQzTPQJHBweYFQ5iu3KaJKuCFIymDDg69+RoVBnS0tcrCd4zvgkcHegzhGSUaqst/jRAZVLq6sXlv8FBpncEjvb3Misc0PZxcyx1STFgAkeTbv/eEKYdAuJmophtjiYSgiGC+13Sxlkm0M6ts35G7s/d+XRouMzaenDUHfQn8wQT1+gmTnY2ws9hZdaJEeozooo7hLCdR30IERj/hbPH6TODuRZFKZs5uzh/ue0eh6PcPniQODU02uqPDkmd8219P3WYy+HoAHX9NwhHaxvscfT4E4J4xCzD7Z4ROIqZtkHnfwuqtt4eJ+oa7NkqztLAQJmNmQCT+1OkDdPt5dEG59t6zOEjaiwh5FFUNe38UlNNHdy0IRg+zjjOhqGp2Ci7vXmxaOu95dDqCJfs8zHE2v2Qz4m858BRRC1vEYMnOXnU/TETIG+cjYNZwSJTXaPgfjBrZsraueMHDkfdn3tCWOsbcTAuMywuaBVdmaGhoi+N4EIOR7l7vQLCVj/D+LAJndG66QHdYRbr421wRrUJHEXPJhbbSsAecAgYGZVZc42qj0Y5OIqoRaMrvBYCR+Fk2vn5UTg50/zUOu6BOucnngAFd/xA4ih1bQ2gBxFMW4JDQUoWXQb6sxaZilZl9ELkUaP68ysncTQOedTO8s90KyOz/CQoeJY7fiBwFD0bzLcVxIVewE4etTN7QAdzKg4QOAp33V9ngpMYM+FoWrDoatrE1PWX4968WOTRqpTxjRRoUhqcb+tBUKw1TJ3oRWvg5NG+nqIdtndhbb1UJg0uhyLw0G+vPsVawsAuk5YEhyme0wTLSB6xmB8FPKZXKecU/ZVlOGdLsCgImtqylsMOgaPwgjuXAQcCitGFSgTe/W8yASgM6uEqXrCEw1H394/68cAikLnwQLP7nVHgkMkYXxOGlTzC4WgsxvVAzfTQfmYcNpQMojPKe0gJosDhKAzHQrAcimxnyFVodn93M+qO/iiOROFwFOEh1jm46VNPF3MPecRgORZ5dJj6QDIEi8BRzGKAo5h1g3nHpelMmfd+wWwuvI1W+ns8zSc1mQYgAv09XYKpmAgUFauCwFHfVdDUf+H48fqNcvaFcsZ5Y3LWRyWnnH2BHCvnXChZsnCx+ILPP3u19yRrx+vuu8fd4AwfOBwFQbmPFUDNAwqG3lffJF+6dUzwNqesuEGOleVrJEuuXCW+4POLlsTgKyI+RNwvhcIHGkcxowHzKu4jgPlRrpMcjqLOmNHAUcV9BDC2K9P+KH1Gw31yOOLhAPthCLQ8Sp/RcIQBjriRx40y7Y8CkbgsNcHVMhdMvXER4ORR9G+0P8oNfHDr4CjiFbx85CU5HEU1uF81hAMqARGgzxLSOEqvecAIaTGM67kgcDiKtoNecy7uMbJO75VxOIoI0Wc04INKEATGfWkiyAVRl6FxlL4KHDWSJasvM1iue0rM7XkrWbKQKkb/Yg8tj3Z3kiBXsyERoH+xh8NRjJnoPfGQkSrf4r1d5LpzOIpK0+9O+KASBAH0yhI0mngO0oxrHvXgL9l/UVaMxlGMFqOsh+oyg4ALYeJw1OuPsnd8mYlpqWkdpj4J30eTw1HY1vV6gOC+uLBkTePooOZR9xkqksmQJ/ABEo2jOq4H+u5LrwNPOKRxlD7r5j4/XPDQ9NclgtSRw1HMt2HWLYh/WoaLgAtfl+Bw1MfdhXkN3xM9TobA0HAZ90cBysR5DbC2da88+7Ts3C47tsoj31GJHoHHt3nwPv2Yh/NLz8lrL8v+VulsR0ByiAtDW1oexRTp2wfGQDmwT4Bd81LZeos8+ZDsfkr27JZXn1eJHoGXdnnw7nrCw/kn35YftciWNbL+Klm/Qrbc7NF3zwtjlH1rfxnn0VSdPHC7PLPTo2bLSrnzOgF2lUmpaZBkypPKad7TZvRoAgEfYRxTtQIB5hB0Pd854NF3+52ybpmsXSabVstvdnixGMsljFe8PJrwfg4BEICaXR3i/0Q2xlIMENSmhwDAh/jERTiGh+XIYT5B4ZnHUfxHER8R5Am8oDigRvMggKBA8hSwdorJUWuVVEOxRoDMUTQo6X7vIbR6dBABRMcFcjM5ipmm6lpZdJksXqriHAKIS7JKECM6TWkcxT3aOFtaHpZLV8jFy1ScQwBx2fiQ1DZ4Q1suTWkczaRl0SXcuqv1AghgOHvBxYJIFShn+HQYjkbqChaZqmoi1ajKDCCQTBpQGlIljaPwk/4Qa/ig4j4CTI66j4566AICylEXoqA+5EOAydGKynye6TlFwEeAxtFEhRx80/dBj+4i0HaoNPc9BUK8Mim7nvB2LgYqrYUYCLTu9bZBYQaKYXzMJi+PJgQ0vecmaVnp7QHbtFqPbiGw4Rr53jpJpoT+R+Moap5IeJsXuzq8PWBHDuvRLQT6erzoIEx0YXLUrzyYquImAn6A6Ec+R+kQqAOOI8DkaGZQejulv0fwwnGYyso9hANBQWggw8P8qtM4mhmUpg/JxkfkC2sFL7rbvV2kLiDCjwnJA4APdiIQJ57qBQWhue2HUl1bxvue0n1yxSqZOUvO/Zis2iB3/0I+vVzqZ3hpFbfvqOCGVjGEwCjI4CVMJKtk4WJZ9wO56W4vKAjNCSfKRUulvPc9HTOvUVsvFy2RDQ/Kt34quH3XPiDNW2XN3XLdRvnyBvniOu/OvuprsuyG4mX0crzIL0jtEwU+BBf4bFQmejLq8LFVy4ILp1AM18I3AAt4gTPQ/uYOD/Y7HpUrV8m8+ePS+IzjZXho3Cf239DaelR12jQcsgVkxe0LpE5qkqYz5YwF8sHz5JzzvTt74cflI58sXkYvx4v8gtQ+UeBDcIHPRmWiJ6MOH1u1LLhwCsVwLXwDsIB33nwB2kiZgD07EkffT6s6+h/1wOSoC/PDVPBjYLwiUd55NAYhKnsX0UmlY8DJoxhCJqsD110L8hCociBMHI4C85p6HFRcR2Basozb+grdPOo6Pz3/qo6Ze/HeM/7R8mh1HaO6ajMkAjnnXkLqmGpxGkfpuxKnilx5XO/C3AuHo5gWVo6WB8kjqCWHo3DcAEehVaUEEaBxtLq2BNEsySql6sjbSmgcdaGjU5KUirxStQ2RqwynkMdRBxaCw0FVrqXp2YTDUYyZtK2PC+fpS00cjiI8Fbk2PeFzFdcQSNWQl5poHK3mPTTPNRI47g99BobG0YoKx0Oj7o0ggCX7kVek/zgcRX8ULQipymo2HAJl3B/VPSXhqEIrjTyKnEIzL8LJo6iw9kcBQiykrmznR134okwsKEJ3kr4bnZNH0XZUO7DBu0D49fRRBOiPxOdwFHVPaH8UKMRBKivLdX7Uhc2zcWAI30f6z7/Q8ihGi3z41YMACNCzCYejiQpBCxIAH36R/a2y5hJpviKErF0m61eMyIZrxJeWld7TgHEcfRrwthZ+7YJ4QP9KE4ejgCYu37n7w69DPxB+eFjSAyPS1yO+dHWIL6NPA/77c9J2CEi4LmjxMMYlesnhKPIo/e4MCPorz0tlUvI+w7bIs5h9a3snoBfMYvTHQBA4ijQDjtJ3KgQJOxr6/m6PgkEKhy0DENoPh72IUL5M10IRHgLY4U0efEvMuQrN7e+G98n6FWjrrdscZ5CQR8fZd/vNG/82y9G2g27X/6h3GN2WY3+U3sU5Cn7hAziEbFe4XLEl2uMwZkLl0CPHkSWcPBqXh5QcMtzW/3cfK+4h7KaqDTYmQfzgcLQmJg/SQR4NAmLAMlnFMFdwJA79UbQkEIx0s/y39pbAUXRu4pJH4arpSKT7TVuYqn7MwECmqmUK1xM4Cm/pQ0X4UFB6uryfK0C2K1iy6AK4B2Ix/VR0BSO5kMNR+pRbEOy6O23s98HiUxBnuGU0j3Lxn9T6QN+kp6I6gX5eLPJoBXUjJSGPooGLxQMgsJgODkVFx5x6oD8W0/jcR5UQOIpoxWLM1HHYxpxL9xHgMV7ce8ftm3E4Sv/6QRAaWGAP8ujBN4L4Qi6Toj6qhMBRtPWoMxn1AObRCoNDAQoWXwT6LdwJxfv33pXcvhmBo6h4LNZCO96Fp8alq924iakbKMu2vmrquBnXgAyHPGfUDCZfY8FR7nw2J4/G4mFPHVY2fKT7xP2lJozr0UMzervmUU7gKGo72S+o5nHU/qnudkGeM20XqbrYKVLTro3p545xCRxF1RPUOWE4UFCwEFqwTFQF3F9q4j6qhMPRGud/sAELochwUbEwjx5Yga08BVw4VXZ5FG19pfN5tKPNEjc8jjo/jY+5QkTNEiITzHDyaMr5hz31dQvYMwEuIx8cdv7body5Qg5HrYW/aE7ZWQiFe4Ci0/kp0rLjKPfLMaBFEDliq62HM6YXC2BiisKdK7SdR4eHBYNEakK/gAAAA55JREFU7n7EIAFDbkOGC1JyimVg5e3/TFGH8csxh19e/VFuwxEwnjZzW39vQKdoxbghs51HaTCHNNz+jqUxE5YJMmmxOR0bEgmveNmt12cGvWo7/s/CJvxRBNCMOj5FirZ+1Fv7Lwh5FF1S+/UMZRF3kc32F11Sxx9Ohvls3EihMIywsG2OomnrPSIgQYR1iFxVb7ek+wSuRq45p0Jw9OCbOc/Y/XBya9z5bNsc9XEg3pS+A/mP/3xVwJv8ZSI8C1tvu70bP5mKsLqhVRE4irmnF5/1Umm639uW5tQRU05//K387F5JWdxRAI6+/g+BaQgGT76Yg8XXD1u+tB3yHtWLI3K5Lwf2yf5Wad0ruFf3vCB//p3s2Cop3qNlGBxNyS8flDWfkxs/75ysW+b5lrSbNtCpaDsoMA255XLxxRw4vn7Y8uX25QL5xtWy6doRuet62bJGtt4i998q2++Ux74re3YLcUqbwFHkepCgrlHcFPgGDy0LaMpFo6ZBcgraEwiRoAgEh6MwrKIIBERAORoQKC02ioDtF8pR24irvbAIKEfDIqblbSOgHLWNuNoLi4ByNCxiWt42AspR24irvbAIKEfDIqblgyIQVTnlaFRIqh5TCChHTSGreqNCQDkaFZKqxxQCylFTyKreqBBQjkaFpOoxhYBy1BSyqjcoAoXKKUcLIaTn2QgoR9kRUPuFEFCOFkJIz7MRUI6yI6D2CyGgHC2EkJ5nI6AcZUdA7RdC4D2OFiqn5xUBFgLKURbyajcoAsrRoEhpORYCylEW8mo3KALK0aBIaTkWAspRFvJqNzcCiQmUHPkgVS2VSQnwZNDcevVTRSAqBGbMytY0wtFkSma/L/ucvlcELCOQScvpC7JtjnAUH394sfdgWLxQUQRYCKT75LwLs42PcfQTn/EeDKvNfTZC+t4WAplBmX+mnNSUbW+Mo5XT5NoN0uv8b1dm10DflwQCSI5Ioitvy1GZMY7i5BkLZMkq6W7XwRPAULGHADJof7d8ZbM0NOYwOo6jOL/4UvnqFklWSW+n9zhwsLs40asUgYIIgJrpfi8nzjlZNj4ip58FAuaQbI6iCIre8ais3iQLF8vcU6R+hooiED0C04+TeU2y6DJZe7803yMzZ4F6uSUHR/2CaPevXCU3bpYND6ooAtEjcNv3PXZduiLHIMln4OhxUo6OltAXigAXAeUoF3+1XhgB5WhhjLQEFwE2R7m1V+txQOD/AAAA//9oDg7QAAAABklEQVQDALFnvz1lAWFSAAAAAElFTkSuQmCC"
            />
          </defs>
        </svg>
      ),
      "Invites Sent": Send,
      Applied: () => (
        <svg
          width="444"
          height="72"
          viewBox="0 0 444 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="444" height="72" rx="10" fill="white" />
          <path
            d="M22.3199 35.6829C24.9938 35.6829 27.1614 33.5153 27.1614 30.8414C27.1614 28.1676 24.9938 26 22.3199 26C19.6461 26 17.4785 28.1676 17.4785 30.8414C17.4785 33.5153 19.6461 35.6829 22.3199 35.6829Z"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14 45.3678C14 41.6206 17.7279 38.5898 22.3176 38.5898C23.2471 38.5898 24.1476 38.7157 24.99 38.9481"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M32.0002 41.4903C32.0002 42.2165 31.7969 42.904 31.4386 43.485C31.2353 43.8336 30.9738 44.1434 30.6736 44.3952C29.9958 45.0052 29.105 45.3635 28.1271 45.3635C26.7134 45.3635 25.4836 44.6082 24.8155 43.485C24.4572 42.904 24.2539 42.2165 24.2539 41.4903C24.2539 40.2703 24.8155 39.1761 25.7063 38.4693C26.3745 37.9367 27.2169 37.6172 28.1271 37.6172C30.267 37.6172 32.0002 39.3504 32.0002 41.4903Z"
            stroke="#818283"
            stroke-miterlimit="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M26.6172 41.4919L27.5758 42.4505L29.6382 40.543"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M52.4756 43.1719C51.1631 43.1719 50.0762 42.7881 49.2148 42.0205C48.3594 41.2471 47.9316 40.2715 47.9316 39.0938H49.2676C49.2676 39.9141 49.5693 40.5879 50.1729 41.1152C50.7764 41.6367 51.5439 41.8975 52.4756 41.8975C53.3545 41.8975 54.0811 41.6836 54.6553 41.2559C55.2295 40.8223 55.5166 40.2686 55.5166 39.5947C55.5166 39.2432 55.4463 38.9326 55.3057 38.6631C55.1709 38.3936 54.9834 38.1768 54.7432 38.0127C54.5088 37.8486 54.2334 37.6992 53.917 37.5645C53.6064 37.4238 53.2725 37.3125 52.915 37.2305C52.5635 37.1484 52.2002 37.0547 51.8252 36.9492C51.4502 36.8438 51.084 36.7412 50.7266 36.6416C50.375 36.5361 50.041 36.3955 49.7246 36.2197C49.4141 36.0439 49.1387 35.8447 48.8984 35.6221C48.6641 35.3994 48.4766 35.1123 48.3359 34.7607C48.2012 34.4092 48.1338 34.0107 48.1338 33.5654C48.1338 32.5928 48.5234 31.793 49.3027 31.166C50.0879 30.5332 51.0781 30.2168 52.2734 30.2168C53.5566 30.2168 54.5762 30.5654 55.332 31.2627C56.0879 31.9541 56.4658 32.8242 56.4658 33.873H55.0859C55.0566 33.1816 54.7783 32.6162 54.251 32.1768C53.7295 31.7314 53.0586 31.5088 52.2383 31.5088C51.418 31.5088 50.75 31.6992 50.2344 32.0801C49.7246 32.4609 49.4697 32.9561 49.4697 33.5654C49.4697 33.917 49.5547 34.2217 49.7246 34.4795C49.8945 34.7373 50.1201 34.9424 50.4014 35.0947C50.6885 35.2471 51.0166 35.3818 51.3857 35.499C51.7549 35.6104 52.1445 35.7158 52.5547 35.8154C52.9648 35.9092 53.3721 36.0117 53.7764 36.123C54.1865 36.2344 54.5762 36.3809 54.9453 36.5625C55.3145 36.7441 55.6396 36.9609 55.9209 37.2129C56.208 37.459 56.4365 37.7871 56.6064 38.1973C56.7764 38.6016 56.8613 39.0674 56.8613 39.5947C56.8613 40.6318 56.4453 41.4873 55.6133 42.1611C54.7871 42.835 53.7412 43.1719 52.4756 43.1719ZM63.2686 34.0664C64.3994 34.0664 65.2959 34.418 65.958 35.1211C66.626 35.8184 66.96 36.7646 66.96 37.96V42.9961H65.6416V38.083C65.6416 37.2451 65.3984 36.5742 64.9121 36.0703C64.4316 35.5664 63.793 35.3145 62.9961 35.3145C62.1758 35.3145 61.5166 35.5693 61.0186 36.0791C60.5264 36.583 60.2803 37.251 60.2803 38.083V42.9961H58.9619V30.3926H60.2803V35.9561C60.5615 35.3584 60.96 34.8955 61.4756 34.5674C61.9912 34.2334 62.5889 34.0664 63.2686 34.0664ZM70.2559 35.3848C71.1289 34.5059 72.2012 34.0664 73.4727 34.0664C74.7441 34.0664 75.8164 34.5059 76.6895 35.3848C77.5684 36.2578 78.0078 37.3359 78.0078 38.6191C78.0078 39.9023 77.5684 40.9834 76.6895 41.8623C75.8164 42.7354 74.7441 43.1719 73.4727 43.1719C72.2012 43.1719 71.1289 42.7354 70.2559 41.8623C69.3887 40.9834 68.9551 39.9023 68.9551 38.6191C68.9551 37.3359 69.3887 36.2578 70.2559 35.3848ZM73.4727 35.3145C72.5645 35.3145 71.7998 35.6309 71.1787 36.2637C70.5576 36.8965 70.2471 37.6816 70.2471 38.6191C70.2471 39.5508 70.5576 40.3359 71.1787 40.9746C71.7998 41.6133 72.5645 41.9326 73.4727 41.9326C74.3809 41.9326 75.1484 41.6133 75.7754 40.9746C76.4023 40.3301 76.7158 39.5449 76.7158 38.6191C76.7158 37.6875 76.4023 36.9053 75.7754 36.2725C75.1543 35.6338 74.3867 35.3145 73.4727 35.3145ZM83.7822 34.0664C84.0107 34.0664 84.2832 34.1016 84.5996 34.1719V35.4023C84.3125 35.3027 84.0283 35.2529 83.7471 35.2529C83.0615 35.2529 82.4844 35.4961 82.0156 35.9824C81.5527 36.4629 81.3213 37.0723 81.3213 37.8105V42.9961H80.0029V34.251H81.3213V35.6484C81.5791 35.1562 81.9219 34.7695 82.3496 34.4883C82.7773 34.207 83.2549 34.0664 83.7822 34.0664ZM90.8486 35.4727H88.4053V40.043C88.4053 41.2559 89.0176 41.8623 90.2422 41.8623C90.4883 41.8623 90.6904 41.8389 90.8486 41.792V42.9961C90.585 43.0547 90.3037 43.084 90.0049 43.084C89.0908 43.084 88.376 42.832 87.8604 42.3281C87.3447 41.8184 87.0869 41.0625 87.0869 40.0605V35.4727H85.3643V34.251H87.0869V31.834H88.4053V34.251H90.8486V35.4727ZM93.9951 30.3926V42.9961H92.6768V30.3926H93.9951ZM97.1768 30.4277C97.4287 30.4277 97.6514 30.5215 97.8447 30.709C98.0381 30.8965 98.1348 31.1162 98.1348 31.3682C98.1348 31.626 98.0381 31.8516 97.8447 32.0449C97.6514 32.2324 97.4287 32.3262 97.1768 32.3262C96.9189 32.3262 96.6992 32.2324 96.5176 32.0449C96.3359 31.8574 96.2451 31.6318 96.2451 31.3682C96.2451 31.1162 96.3359 30.8965 96.5176 30.709C96.6992 30.5215 96.9189 30.4277 97.1768 30.4277ZM96.5088 34.251H97.8271V42.9961H96.5088V34.251ZM103.224 43.1719C102.239 43.1719 101.425 42.9229 100.78 42.4248C100.136 41.9268 99.7695 41.2529 99.6816 40.4033H100.938C100.997 40.9014 101.231 41.2998 101.642 41.5986C102.052 41.8916 102.562 42.0381 103.171 42.0381C103.78 42.0381 104.27 41.9004 104.639 41.625C105.014 41.3438 105.201 40.9834 105.201 40.5439C105.201 40.251 105.125 40.0049 104.973 39.8057C104.82 39.6006 104.618 39.4482 104.366 39.3486C104.12 39.249 103.839 39.1582 103.522 39.0762C103.206 38.9941 102.881 38.9268 102.547 38.874C102.213 38.8213 101.888 38.7393 101.571 38.6279C101.255 38.5166 100.971 38.3848 100.719 38.2324C100.473 38.0742 100.273 37.8516 100.121 37.5645C99.9688 37.2715 99.8926 36.9229 99.8926 36.5186C99.8926 35.7979 100.177 35.209 100.745 34.752C101.313 34.2949 102.066 34.0664 103.004 34.0664C103.865 34.0664 104.606 34.2949 105.228 34.752C105.854 35.2031 106.218 35.8096 106.317 36.5713H104.99C104.926 36.1611 104.706 35.8242 104.331 35.5605C103.956 35.2969 103.502 35.165 102.969 35.165C102.436 35.165 102.002 35.2822 101.668 35.5166C101.34 35.7451 101.176 36.0469 101.176 36.4219C101.176 36.7383 101.272 36.9961 101.466 37.1953C101.665 37.3945 101.92 37.541 102.23 37.6348C102.541 37.7285 102.884 37.8105 103.259 37.8809C103.64 37.9453 104.018 38.0273 104.393 38.127C104.773 38.2266 105.119 38.3584 105.43 38.5225C105.74 38.6865 105.992 38.9355 106.186 39.2695C106.385 39.6035 106.484 40.0166 106.484 40.5088C106.484 41.2822 106.174 41.9209 105.553 42.4248C104.938 42.9229 104.161 43.1719 103.224 43.1719ZM112.751 35.4727H110.308V40.043C110.308 41.2559 110.92 41.8623 112.145 41.8623C112.391 41.8623 112.593 41.8389 112.751 41.792V42.9961C112.487 43.0547 112.206 43.084 111.907 43.084C110.993 43.084 110.278 42.832 109.763 42.3281C109.247 41.8184 108.989 41.0625 108.989 40.0605V35.4727H107.267V34.251H108.989V31.834H110.308V34.251H112.751V35.4727ZM122.12 38.3555C122.12 38.6191 122.114 38.7861 122.103 38.8564H114.772C114.837 39.7939 115.159 40.5498 115.739 41.124C116.319 41.6982 117.066 41.9854 117.98 41.9854C118.684 41.9854 119.287 41.8271 119.791 41.5107C120.301 41.1885 120.614 40.7607 120.731 40.2275H122.05C121.88 41.1123 121.417 41.8242 120.661 42.3633C119.905 42.9023 119 43.1719 117.945 43.1719C116.674 43.1719 115.61 42.7324 114.755 41.8535C113.905 40.9746 113.48 39.8789 113.48 38.5664C113.48 37.3066 113.911 36.2432 114.772 35.376C115.634 34.5029 116.686 34.0664 117.928 34.0664C118.707 34.0664 119.416 34.251 120.055 34.6201C120.693 34.9834 121.197 35.4932 121.566 36.1494C121.936 36.8057 122.12 37.541 122.12 38.3555ZM114.834 37.7402H120.714C120.649 37.0137 120.354 36.4189 119.826 35.9561C119.305 35.4873 118.654 35.2529 117.875 35.2529C117.102 35.2529 116.439 35.4785 115.889 35.9297C115.338 36.3809 114.986 36.9844 114.834 37.7402ZM131.243 30.3926H132.562V42.9961H131.243V40.9658C130.921 41.6689 130.452 42.2139 129.837 42.6006C129.228 42.9814 128.51 43.1719 127.684 43.1719C126.893 43.1719 126.163 42.9697 125.495 42.5654C124.833 42.1611 124.309 41.6074 123.922 40.9043C123.535 40.2012 123.342 39.4336 123.342 38.6016C123.342 37.7695 123.535 37.0049 123.922 36.3076C124.309 35.6104 124.833 35.0625 125.495 34.6641C126.163 34.2656 126.893 34.0664 127.684 34.0664C128.51 34.0664 129.23 34.2598 129.846 34.6465C130.461 35.0273 130.927 35.5664 131.243 36.2637V30.3926ZM127.93 41.9326C128.885 41.9326 129.676 41.6191 130.303 40.9922C130.93 40.3594 131.243 39.5625 131.243 38.6016C131.243 37.6465 130.93 36.8555 130.303 36.2285C129.676 35.6016 128.885 35.2881 127.93 35.2881C127.004 35.2881 126.222 35.6104 125.583 36.2549C124.95 36.8994 124.634 37.6816 124.634 38.6016C124.634 39.5391 124.95 40.3301 125.583 40.9746C126.222 41.6133 127.004 41.9326 127.93 41.9326Z"
            fill="#818283"
          />
          <path
            d="M421.957 28.9091V42H420.372V30.571H420.295L417.099 32.6932V31.0824L420.372 28.9091H421.957ZM425.722 42V40.8494L430.043 36.1193C430.55 35.5653 430.968 35.0838 431.296 34.6747C431.624 34.2614 431.867 33.8736 432.025 33.5114C432.187 33.1449 432.268 32.7614 432.268 32.3608C432.268 31.9006 432.157 31.5021 431.935 31.1655C431.718 30.8288 431.42 30.5689 431.04 30.3857C430.661 30.2024 430.235 30.1108 429.762 30.1108C429.259 30.1108 428.82 30.2152 428.445 30.424C428.075 30.6286 427.787 30.9162 427.582 31.2869C427.382 31.6577 427.282 32.0923 427.282 32.5909H425.773C425.773 31.8239 425.95 31.1506 426.304 30.571C426.658 29.9915 427.139 29.5398 427.749 29.2159C428.362 28.892 429.05 28.7301 429.813 28.7301C430.58 28.7301 431.26 28.892 431.852 29.2159C432.445 29.5398 432.909 29.9766 433.246 30.5263C433.582 31.076 433.751 31.6875 433.751 32.3608C433.751 32.8423 433.663 33.3132 433.489 33.7734C433.318 34.2294 433.02 34.7386 432.594 35.3011C432.172 35.8594 431.586 36.5412 430.836 37.3466L427.896 40.4915V40.5938H433.981V42H425.722Z"
            fill="#818283"
          />
        </svg>
      ),
      "Coding Contest": () => (
        <svg
          width="17"
          height="16"
          viewBox="0 0 17 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.38889 4.16233L1 7.29052L4.38889 10.9401M12.8611 4.16233L16.25 7.29052L12.8611 10.9401M10.3194 0.773438L6.93056 14.329"
            stroke="#818283"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      "AI Interview": () => (
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.6667 9.33333C17.6667 13.9357 13.9357 17.6667 9.33333 17.6667C4.73096 17.6667 1 13.9357 1 9.33333C1 4.73096 4.73096 1 9.33333 1C13.9357 1 17.6667 4.73096 17.6667 9.33333Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M11.832 6.83594C11.832 8.21669 10.7128 9.33594 9.33203 9.33594C7.95128 9.33594 6.83203 8.21669 6.83203 6.83594C6.83203 5.45523 7.95128 4.33594 9.33203 4.33594C10.7128 4.33594 11.832 5.45523 11.832 6.83594Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M9.33203 14.3385V12.6719"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M1 17.6693L3.08333 15.5859"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M17.6654 17.6693L15.582 15.5859"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      ),
      Shortlisted: () => (
        <svg
          width="18"
          height="15"
          viewBox="0 0 18 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.603 1H7.39705C4.37448 1 2.8632 1 1.9242 1.9519C1.22129 2.66447 1.04456 3.70215 1.00013 5.46423C0.994434 5.69014 1.17697 5.87067 1.39261 5.92797C2.0806 6.11071 2.58817 6.74527 2.58817 7.5C2.58817 8.25473 2.0806 8.88929 1.39261 9.07203C1.17697 9.12931 0.994434 9.30984 1.00013 9.5358C1.04456 11.2979 1.22129 12.3355 1.9242 13.0481C2.8632 14 4.37448 14 7.39705 14H10.603C13.6255 14 15.1368 14 16.0759 13.0481C16.7787 12.3355 16.9555 11.2979 16.9999 9.5358C17.0056 9.30984 16.8231 9.12931 16.6074 9.07203C15.9195 8.88929 15.4119 8.25473 15.4119 7.5C15.4119 6.74527 15.9195 6.11071 16.6074 5.92797C16.8231 5.87067 17.0056 5.69014 16.9999 5.46423C16.9555 3.70215 16.7787 2.66447 16.0759 1.9519C15.1368 1 13.6255 1 10.603 1Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M8.31828 5.89328C8.62228 5.33943 8.77428 5.0625 9.00156 5.0625C9.22884 5.0625 9.38084 5.33943 9.68485 5.89328L9.76349 6.03661C9.84981 6.19399 9.89301 6.27264 9.96037 6.32456C10.0277 6.37647 10.1116 6.39581 10.2793 6.43433L10.432 6.46942C11.0224 6.60511 11.3176 6.67288 11.3878 6.90224C11.458 7.13161 11.2568 7.37057 10.8544 7.84856L10.7502 7.97222C10.6359 8.10799 10.5787 8.17592 10.5529 8.25993C10.5272 8.34394 10.5359 8.43454 10.5532 8.61581L10.5689 8.78074C10.6297 9.41847 10.6602 9.7373 10.4764 9.87908C10.2924 10.0208 10.0161 9.89159 9.4634 9.63314L9.32044 9.56627C9.16332 9.49282 9.08484 9.45609 9.00156 9.45609C8.91828 9.45609 8.8398 9.49282 8.68268 9.56627L8.53972 9.63314C7.987 9.89159 7.71068 10.0208 7.52676 9.87908C7.34295 9.7373 7.37337 9.41847 7.4342 8.78074L7.44996 8.61581C7.46724 8.43454 7.47588 8.34394 7.4502 8.25993C7.42444 8.17592 7.36727 8.10799 7.25291 7.97222L7.14878 7.84856C6.74634 7.37057 6.54512 7.13161 6.61534 6.90224C6.68557 6.67288 6.98073 6.60511 7.57108 6.46942L7.7238 6.43433C7.89156 6.39581 7.9754 6.37647 8.04276 6.32456C8.11012 6.27264 8.15332 6.19399 8.23964 6.03661L8.31828 5.89328Z"
            stroke="#818283"
            stroke-width="1.2"
          />
        </svg>
      ),
      "First Interview": () => (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.83333 7.66667C8.67428 7.66667 10.1667 6.17428 10.1667 4.33333C10.1667 2.49238 8.67428 1 6.83333 1C4.99238 1 3.5 2.49238 3.5 4.33333C3.5 6.17428 4.99238 7.66667 6.83333 7.66667Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M11.832 6.83594C13.2128 6.83594 14.332 5.71665 14.332 4.33594C14.332 2.95523 13.2128 1.83594 11.832 1.83594"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M6.83333 16.8385C10.055 16.8385 12.6667 15.3462 12.6667 13.5052C12.6667 11.6643 10.055 10.1719 6.83333 10.1719C3.61167 10.1719 1 11.6643 1 13.5052C1 15.3462 3.61167 16.8385 6.83333 16.8385Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M14.332 11C15.7939 11.3206 16.832 12.1324 16.832 13.0833C16.832 13.9411 15.9873 14.6857 14.7487 15.0587"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      ),
      "Other Interviews": () => (
        <svg
          width="20"
          height="18"
          viewBox="0 0 20 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.1654 7.66667C12.0063 7.66667 13.4987 6.17428 13.4987 4.33333C13.4987 2.49238 12.0063 1 10.1654 1C8.32442 1 6.83203 2.49238 6.83203 4.33333C6.83203 6.17428 8.32442 7.66667 10.1654 7.66667Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M15.168 6.83854C16.5487 6.83854 17.668 5.9058 17.668 4.75521C17.668 3.60462 16.5487 2.67188 15.168 2.67188"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M5.16797 6.83854C3.78726 6.83854 2.66797 5.9058 2.66797 4.75521C2.66797 3.60462 3.78726 2.67188 5.16797 2.67188"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M10.168 16.8385C12.9294 16.8385 15.168 15.3462 15.168 13.5052C15.168 11.6643 12.9294 10.1719 10.168 10.1719C7.40654 10.1719 5.16797 11.6643 5.16797 13.5052C5.16797 15.3462 7.40654 16.8385 10.168 16.8385Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M16.832 15.1667C18.2939 14.8461 19.332 14.0342 19.332 13.0833C19.332 12.1324 18.2939 11.3206 16.832 11"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M3.5 15.1667C2.03812 14.8461 1 14.0342 1 13.0833C1 12.1324 2.03812 11.3206 3.5 11"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      ),
      "HR Round": () => (
        <svg
          width="17"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9.80225H12.6667M6 9.80225V13.8016C6 15.3099 6 16.064 6.48816 16.5326C6.97631 17.0011 7.762 17.0011 9.33333 17.0011C10.9047 17.0011 11.6903 17.0011 12.1785 16.5326C12.6667 16.064 12.6667 15.3099 12.6667 13.8016V9.80225M6 9.80225C3.70175 9.31201 1.88931 7.61755 1.31831 5.42523L1 4.20312M12.6667 9.80225C14.0922 9.80225 15.2922 10.8264 15.4587 12.1855L16 16.6012"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M9.33333 7.399C11.1743 7.399 12.6667 5.96654 12.6667 4.1995C12.6667 2.43246 11.1743 1 9.33333 1C7.49238 1 6 2.43246 6 4.1995C6 5.96654 7.49238 7.399 9.33333 7.399Z"
            stroke="#818283"
            stroke-width="1.2"
          />
        </svg>
      ),
      "Salary Negotiation": () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
          stroke="#818283"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-handshake-icon lucide-handshake"
        >
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </svg>
      ),
      "Offer Sent": () => (
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.33333 17.6667H11.8333C15.055 17.6667 17.6667 15.055 17.6667 11.8333V9.33333C17.6667 5.40496 17.6667 3.44077 16.4462 2.22039C15.2259 1 13.2617 1 9.33333 1C5.40496 1 3.44077 1 2.22039 2.22039C1 3.44077 1 5.40496 1 9.33333C1 13.2617 1 15.2259 2.22039 16.4462C3.44077 17.6667 5.40496 17.6667 9.33333 17.6667Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M11.832 17.6693C11.832 16.1182 11.832 15.3427 12.0359 14.715C12.4481 13.4465 13.4426 12.452 14.7111 12.0399C15.3388 11.8359 16.1143 11.8359 17.6654 11.8359"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M4 5.5H15"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 9H10"
            stroke="#818283"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      "Offer Accepted": () => (
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.33333 17.6667H11.8333C15.055 17.6667 17.6667 15.055 17.6667 11.8333V9.33333C17.6667 5.40496 17.6667 3.44077 16.4462 2.22039C15.2259 1 13.2617 1 9.33333 1C5.40496 1 3.44077 1 2.22039 2.22039C1 3.44077 1 5.40496 1 9.33333C1 13.2617 1 15.2259 2.22039 16.4462C3.44077 17.6667 5.40496 17.6667 9.33333 17.6667Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M6 9L7.66666 11L11 7"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11.832 17.6693C11.832 16.1182 11.832 15.3427 12.0359 14.715C12.4481 13.4465 13.4426 12.452 14.7111 12.0399C15.3388 11.8359 16.1143 11.8359 17.6654 11.8359"
            stroke="#818283"
            stroke-width="1.2"
          />
        </svg>
      ),
      Archives: () => (
        <svg
          width="18"
          height="17"
          viewBox="0 0 18 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.60156 8.5C6.60156 8.11175 6.60156 7.91758 6.66246 7.76442C6.74365 7.56025 6.89939 7.398 7.09542 7.31342C7.24243 7.25 7.42884 7.25 7.80156 7.25H10.2016C10.5743 7.25 10.7607 7.25 10.9077 7.31342C11.1037 7.398 11.2595 7.56025 11.3407 7.76442C11.4016 7.91758 11.4016 8.11175 11.4016 8.5C11.4016 8.88825 11.4016 9.08242 11.3407 9.23558C11.2595 9.43975 11.1037 9.602 10.9077 9.68658C10.7607 9.75 10.5743 9.75 10.2016 9.75H7.80156C7.42884 9.75 7.24243 9.75 7.09542 9.68658C6.89939 9.602 6.74365 9.43975 6.66246 9.23558C6.60156 9.08242 6.60156 8.88825 6.60156 8.5Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M15.7992 4.33594V9.33594C15.7992 12.4786 15.7992 14.05 14.8619 15.0263C13.9247 16.0026 12.4162 16.0026 9.39922 16.0026H8.59922C5.58223 16.0026 4.07374 16.0026 3.13647 15.0263C2.19922 14.05 2.19922 12.4786 2.19922 9.33594V4.33594"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M1 2.66667C1 1.88099 1 1.48816 1.23431 1.24408C1.46863 1 1.84575 1 2.6 1H15.4C16.1542 1 16.5314 1 16.7657 1.24408C17 1.48816 17 1.88099 17 2.66667C17 3.45234 17 3.84517 16.7657 4.08926C16.5314 4.33333 16.1542 4.33333 15.4 4.33333H2.6C1.84575 4.33333 1.46863 4.33333 1.23431 4.08926C1 3.84517 1 3.45234 1 2.66667Z"
            stroke="#818283"
            stroke-width="1.2"
          />
        </svg>
      ),
    };
    return (
      icons[stage as keyof typeof icons] ||
      (() => <Users className="w-4 h-4 " />)
    );
  };

  const getStageDescription = (stageName: string) => {
    switch (stageName) {
      case "Uncontacted":
        return {
          color: "text-[#0F47F2]",
        };
      case "Applied":
        return { color: "text-[#0F47F2]" };
      case "Coding Contest":
        return {
          color: "text-[#CD9B05]",
        };
      case "AI Interview":
        return {
          color: "text-[#CD9B05]",
        };
      case "Shortlisted":
        return { color: "text-[#CD9B05]" };
      case "First Interview":
        return { color: "text-[#CD9B05]" };
      case "Other Interview":
        return { color: "text-[#0F47F2]" };
      case "HR Round":
        return { color: "text-[#0F47F2]" };
      case "Offer Sent":
        return { color: "text-[#0F47F2]" };
      case "Offer Accepted":
        return { color: "text-[#0F47F2]" };
      default:
        return { color: "text-[#0F47F2]" };
    }
  };

  const currentCandidates =
    candidates.length > 0
      ? candidates
      : pipelineCandidates[selectedStage] || [];

  const totalCount = currentCandidates.length;

  // tab count logic
  const tabs = [
    {
      id: "uncontacted",
      label: "Uncontacted",
      count: stages.find((s) => s.name === "Uncontacted")?.candidate_count || 0,
    },
    {
      id: "invited",
      label: "Invited",
      count:
        stages.find((s) => s.name === "Invites Sent")?.candidate_count || 0,
    },
    {
      id: "inbox",
      label: "Inbox",
      count: stages.find((s) => s.name === "Inbox")?.candidate_count || 0,
    },
  ];

  const filteredStages = stages.filter(
    (stage) =>
      stage.stage_type === "SYSTEM" &&
      !["Uncontacted", "Invites Sent", "Archives"].includes(stage.name),
  );

  const selectedCategory = categories.find((cat) => cat.id === activeJobId);

  const existingComments = [
    {
      id: 1,
      text: "Great candidate with strong technical background. Very responsive during initial screening.",
      author: "John Doe",
      date: "2 days ago",
      avatar: "J",
    },
    {
      id: 2,
      text: "Excellent communication skills. Would be a good fit for senior roles.",
      author: "Jane Smith",
      date: "1 week ago",
      avatar: "J",
    },
  ];

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    signOut,
    isOnboarded,
    loading: authLoading,
  } = useAuth();

  // Fetch credit balance
  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        const data = await creditService.getCreditBalance();
        setCredits(data.credit_balance);
      } catch (error) {
        showToast.error("Failed to fetch credit balance");
      }
    };
    if (isAuthenticated) {
      fetchCreditBalance();
    }
  }, [isAuthenticated]);

  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsPopupRef.current &&
        !settingsPopupRef.current.contains(event.target as Node)
      ) {
        setShowSettingsPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettingsPopup]);

  const handleSuggestionSelect = async (sug: { id: string; name: string }) => {
    setSearchQuery(sug.name);
    setSuggestions([]);
    if (activeJobId) {
      try {
        setCandidates([]);
        const res = await jobPostService.getSearchedCandidate(
          sug.id,
          activeJobId,
        );
        const stageName = res.current_stage.name;
        setSelectedStage(stageName);
        if (stageName === "Uncontacted") {
          setActiveStageTab("uncontacted");
          setViewMode("prospect");
        } else if (stageName === "Invites Sent") {
          setActiveStageTab("invited");
          setViewMode("prospect");
        } else if (stageName === "Inbox") {
          setActiveStageTab("inbox");
          setViewMode("prospect");
        } else {
          setViewMode("stage");
        }
        setCandidates([res]);
        await fetchCandidateDetails(res.id);
      } catch (error) {
        console.error("Error fetching searched candidate:", error);
      }
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<CandidateListItem | null>(null);

  const [editForm, setEditForm] = useState({
    experience: "--",
    tenure: "--",
    notice: "--",
    salary: "--",
  });

  useEffect(() => {
    if (showEditModal && editingCandidate) {
      setEditForm({
        experience: editingCandidate.candidate.experience_years || "--",
        tenure:
          editingCandidate.candidate.experience_summary?.duration_years?.toString() ||
          "--",
        notice: editingCandidate.candidate.notice_period_summary || "--",
        salary: editingCandidate.candidate.current_salary_lpa || "--",
      });
    }
  }, [showEditModal, editingCandidate]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-20 bg-white will-change-transform">
        <Header
          onOpenLogoutModal={handleOpenLogoutModal}
          credits={credits}
          onBack={onBack}
          showCreateRoleButton={false}
          showLinkedinSearchButton={false}
          showSearchBar={false}
        />
      </div>

      <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-2">
        <div className="flex w-full gap-3 h-full">
          <div className="lg:w-[25%] order-1 lg:order-1">
            <div className="bg-white rounded-xl shadow-xs px-3 py-6">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={onBack}
              >
                <button className="rounded-lg transition-colors">
                  <ArrowLeft className="mb-2 w-5 h-4 text-gray-600" />
                </button>
                <h3 className="text-md font-[600] text-gray-600 mb-4 mt-1">
                  Back to Dashboard
                </h3>
              </div>
              <div className="relative mb-4">
                {currentView === "pipeline" ? (
                  <div className="flex relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2 border border-blue-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between text-blue-600 bg-white"
                    >
                      <span>
                        {categories.find((cat) => cat.id === activeJobId)
                          ?.name || "Select Pipelines"}
                      </span>
                      <ChevronDown className="text-blue-600 w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentView("search")}
                      className="flex items-center justify-center bg-gray-600 h-10 w-10 rounded-lg ml-2 text-white focus:outline-none"
                      aria-label="Toggle to search candidates"
                      title="Toggle to search candidates"
                    >
                      <SearchCodeIcon />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-10 z-10 w-[90%] bg-white shadow-lg mt-1 rounded-[10px] max-h-80 overflow-y-auto border border-gray-200 py-2 px-4">
                        <div className="relative mb-3 p-2">
                          <input
                            type="text"
                            placeholder="Type a Role"
                            value={dropdownSearch}
                            onChange={(e) => setDropdownSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-[#0F47F2] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 bg-white text-[#4B5563] placeholder-[#BCBCBC]"
                          />
                          <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-[21px] h-[21px] text-[#0F47F2]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="m21 21-4.35-4.35"
                            />
                          </svg>
                        </div>
                        {categories
                          .filter((category) =>
                            category.name
                              .toLowerCase()
                              .includes(dropdownSearch.toLowerCase()),
                          )
                          .map((category) => (
                            <div
                              key={category.id}
                              className="p-2 hover:bg-gray-100 rounded-md cursor-pointer flex justify-between items-center"
                              onClick={() => {
                                setActiveJobId(category.id);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="text-[#4B5563] px-2 py-1 rounded text-sm">
                                {category.name}
                              </span>{" "}
                              {/* UPDATED: Exact gray for names */}
                              <span className="text-[#818283] bg-gray-100 px-2 py-1 rounded text-sm">
                                {" "}
                                {/* UPDATED: Exact gray for counts */}
                                {category.count}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex relative">
                    <button
                      onClick={() => setCurrentView("pipeline")}
                      className="flex items-center justify-center bg-white h-10 w-10 rounded-lg mr-2 text-gray-600 border border-gray-300 focus:outline-none"
                      aria-label="Back to select pipelines"
                    >
                      <LogOut className="w-4 h-4 rotate-180" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Candidates"
                        className="w-full px-3 py-2 border border-blue-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-600 bg-white"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute top-10 z-10 w-full bg-white shadow-lg rounded-lg max-h-60 overflow-y-auto border border-gray-200">
                          {suggestions.map((sug) => (
                            <div
                              key={sug.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSuggestionSelect(sug)}
                            >
                              {sug.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {loadingStages ? (
                  <div className="space-y-3">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg animate-pulse"
                      >
                        <div className="w-4 h-4 bg-gray-200 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-40" />
                          <div className="h-3 bg-gray-200 rounded w-60" />
                        </div>
                        <div className="h-4 w-4 bg-gray-200 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : stagesError ? (
                  <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-medium text-gray-700">
                      {stagesError}
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                      Please check your connection or try again.
                    </p>
                    <button
                      onClick={() => activeJobId && fetchStages(activeJobId)}
                      className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredStages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-700">
                      No stages found
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                      This job does not have any pipeline stages configured yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setViewMode("prospect");
                        setSelectedStage("Uncontacted");
                        setActiveStageTab("uncontacted");
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        viewMode === "prospect"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {viewMode === "prospect" && (
                        <div className="w-1 h-8 bg-blue-500 rounded-tr-xl rounded-br-xl rounded" />
                      )}

                      {(() => {
                        const ProspectIcon = getStageIcon("Uncontacted");
                        return (
                          <ProspectIcon
                            className={`w-4 h-4 ${
                              viewMode === "prospect"
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                        );
                      })()}

                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col items-start justify-center">
                          <span className="flex-1 font-medium">Prospect</span>

                          <p className={`text-xs text-blue-600`}>
                            {stages.find((s) =>
                              ["Invites Sent"].includes(s.name),
                            )?.activity_update ||
                              stages.find((s) =>
                                ["Uncontacted"].includes(s.name),
                              )?.activity_update}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-sm ${
                            viewMode === "prospect"
                              ? "text-blue-800"
                              : "text-gray-400"
                          }`}
                        >
                          {[
                            stages.find((s) => ["Uncontacted"].includes(s.name))
                              ?.candidate_count || 0,
                            stages.find((s) =>
                              ["Invites Sent"].includes(s.name),
                            )?.candidate_count || 0,
                          ].reduce((sum, count) => sum + count, 0)}
                        </span>
                      </div>
                    </button>
                    {filteredStages.map((stage) => {
                      const Icon = getStageIcon(stage.name);
                      const isSelected = selectedStage === stage.name;
                      const description = getStageDescription(stage.name);
                      return (
                        <button
                          key={stage.id}
                          onClick={() => handleStageSelect(stage.name)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1 h-8 bg-blue-500 rounded-tr-xl rounded-br-xl  rounded" />
                          )}
                          {(() => {
                            const StageIcon = getStageIcon(stage.name);
                            return (
                              <StageIcon
                                className={`w-4 h-4 ${
                                  isSelected ? "text-blue-600" : "text-gray-600"
                                }`}
                              />
                            );
                          })()}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start justify-center">
                              <span className="flex-1 font-medium">
                                {stage.name != "Applied"
                                  ? stage.name
                                  : "Autopilot"}
                              </span>
                              {stage.activity_update && (
                                <p className={`text-xs ${description.color}`}>
                                  {stage.activity_update}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-sm ${
                                isSelected ? "text-blue-800" : "text-gray-400"
                              }`}
                            >
                              {stage.candidate_count}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-[45%] order-2 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm h-fit">
              {viewMode === "prospect" && (
                <div className="border-b border-gray-200">
                  <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <div className="flex space-x-6 overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveStageTab(tab.id);
                            if (tab.id === "uncontacted")
                              setSelectedStage("Uncontacted");
                            else if (tab.id === "invited")
                              setSelectedStage("Invites Sent");
                            else if (tab.id === "inbox")
                              setSelectedStage("Inbox");
                          }}
                          className={`py-2 text-sm lg:text-base font-[400] rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 focus-visible:border-b-2 focus-visible:border-blue-600 ${
                            activeStageTab === tab.id
                              ? "text-blue-600 border-blue-500"
                              : "text-gray-600 border-transparent hover:text-gray-700"
                          }`}
                          aria-label={`Switch to ${tab.label} tab`}
                        >
                          {tab.label}
                          {tab.count > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-50 text-gray-600 rounded-full">
                              {tab.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3 lg:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        setSelectAll(e.target.checked);
                        setSelectedCandidates(
                          e.target.checked
                            ? currentCandidates.map((c) => c.id.toString())
                            : [],
                        );
                      }}
                      className="w-4 h-4 text-blue-200 border-gray-200 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 "
                      aria-label="Select all candidates"
                    />
                    <span className="ml-2 text-xs text-gray-400 lg:text-base font-[400]">
                      Select all on this page
                    </span>
                  </label>
                  <div className="flex space-x-3">
                    {selectedCandidates.length > 0 && (
                      <button
                        onClick={() =>
                          bulkMoveCandidates(
                            selectedCandidates.map((id) => parseInt(id)),
                            stages.find((s) => s.name === selectedStage)?.id ??
                              0,
                          )
                        }
                        className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        aria-label="move candidates to pipeline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="mr-1"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12h8" />
                          <path d="M12 8v8" />
                        </svg>
                        Move to Next Stage
                      </button>
                    )}

                    {viewMode === "prospect" ? (
                      <div className="relative">
                        <button
                          className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                          onClick={() => setShowUploadModal(true)}
                          aria-label="Upload Candidates"
                        >
                          <svg
                            width="15"
                            height="17"
                            viewBox="0 0 15 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.00084 7.00168C8.65816 7.00168 10.0017 5.65816 10.0017 4.00084C10.0017 2.34352 8.65816 1 7.00084 1C5.34352 1 4 2.34352 4 4.00084C4 5.65816 5.34352 7.00168 7.00084 7.00168Z"
                              stroke="#818283"
                            />
                            <path
                              d="M9.25231 9.49539C8.55731 9.33717 7.79758 9.25 7.00168 9.25C3.68704 9.25 1 10.7614 1 12.6259C1 14.4904 1 16.0019 7.00168 16.0019C11.2684 16.0019 12.5018 15.2379 12.8584 14.1264"
                              stroke="#818283"
                            />
                            <path
                              d="M11.5047 14.5017C13.1621 14.5017 14.5056 13.1582 14.5056 11.5008C14.5056 9.84352 13.1621 8.5 11.5047 8.5C9.84743 8.5 8.50391 9.84352 8.50391 11.5008C8.50391 13.1582 9.84743 14.5017 11.5047 14.5017Z"
                              stroke="#818283"
                            />
                            <path
                              d="M11.5039 10.4922V12.4927"
                              stroke="#818283"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M10.5039 11.5H12.5045"
                              stroke="#818283"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          Upload
                        </button>
                      </div>
                    ) : (
                      ["AI Interview", "Coding Contest"].includes(
                        selectedStage,
                      ) && (
                        <div className="relative">
                          <button
                            className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSettingsPopup(!showSettingsPopup);
                            }}
                            aria-label="Open settings"
                          >
                            <svg
                              width="13"
                              height="15"
                              viewBox="0 0 13 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-gray-400 text-xs lg:text-base font-[400] mr-1"
                            >
                              <path
                                d="M3.95966 2.38894C5.19943 1.64006 5.81934 1.26562 6.5 1.26562C7.18066 1.26562 7.80057 1.64006 9.04033 2.38894L9.45967 2.64223C10.6994 3.39111 11.3193 3.76555 11.6597 4.38229C12 4.99904 12 5.74792 12 7.2457V7.75222C12 9.25003 12 9.9989 11.6597 10.6156C11.3193 11.2324 10.6994 11.6068 9.45967 12.3557L9.04033 12.609C7.80057 13.3579 7.18066 13.7323 6.5 13.7323C5.81934 13.7323 5.19943 13.3579 3.95966 12.609L3.54034 12.3557C2.30057 11.6068 1.68068 11.2324 1.34034 10.6156C1 9.9989 1 9.25003 1 7.75222V7.2457C1 5.74792 1 4.99904 1.34034 4.38229C1.68068 3.76555 2.30057 3.39111 3.54034 2.64223L3.95966 2.38894Z"
                                stroke="#818283"
                              />
                              <path
                                d="M6.5013 9.37281C7.51382 9.37281 8.33464 8.53559 8.33464 7.50281C8.33464 6.47004 7.51382 5.63281 6.5013 5.63281C5.48878 5.63281 4.66797 6.47004 4.66797 7.50281C4.66797 8.53559 5.48878 9.37281 6.5013 9.37281Z"
                                stroke="#818283"
                              />
                            </svg>
                            Settings
                          </button>
                          {showSettingsPopup && (
                            <div
                              ref={settingsPopupRef}
                              className="absolute top-full right-0 mt-2 p-4 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="border-b border-gray-400">
                                <div className="pb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cutoff Score
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={cutoffScore}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /[^0-9]/g,
                                          "",
                                        );
                                        if (
                                          value === "" ||
                                          (parseInt(value) >= 0 &&
                                            parseInt(value) <= 100)
                                        ) {
                                          setCutoffScore(value);
                                        }
                                      }}
                                      maxLength={3}
                                      className="w-8 px-2 py-1 text-blue-500 bg-blue-50 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      placeholder="75"
                                      aria-label="Cutoff score (0-100)"
                                    />
                                    <span className="text-sm text-gray-500">
                                      / 100
                                    </span>
                                  </div>
                                  {cutoffScore &&
                                    (parseInt(cutoffScore) < 0 ||
                                      parseInt(cutoffScore) > 100) && (
                                      <p className="text-xs text-red-500 mt-1">
                                        Score must be between 0 and 100
                                      </p>
                                    )}
                                  <button
                                    onClick={handleCutoffUpdate}
                                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
                                  >
                                    Update Cutoff
                                  </button>
                                </div>
                              </div>
                              <div className="pt-4">
                                <div className="flex flex-col space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className=" text-sm font-medium text-gray-700">
                                      Follow Up
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Send After
                                    </label>
                                    <select
                                      value={sendAfter}
                                      onChange={(e) =>
                                        setSendAfter(e.target.value)
                                      }
                                      className="w-20 px-2 py-1 text-blue-500 border bg-blue-50 border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      aria-label="Send after hours"
                                    >
                                      <option value="1">1 hr</option>
                                      <option value="2">2 hrs</option>
                                      <option value="4">4 hrs</option>
                                      <option value="8">8 hrs</option>
                                      <option value="24">24 hrs</option>
                                    </select>

                                    <label className="text-sm font-medium text-gray-700">
                                      Via
                                    </label>
                                    <select
                                      value={sendVia}
                                      onChange={(e) =>
                                        setSendVia(e.target.value)
                                      }
                                      className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      aria-label="Send via method"
                                    >
                                      <option value="email">E-mail</option>
                                      <option value="call">Call</option>
                                      <option value="whatsapp">WhatsApp</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}

                    <div className="relative flex space-x-2">
                      <button
                        className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        aria-label="Sort candidates"
                      >
                        <ArrowDownNarrowWide className="w-4 h-4 rotate-180" />
                        <span className="text-gray-400 font-[400] ml-1 mr-1">
                          {sortOptions.find((opt) => opt.value === sortBy)
                            ?.label || "Relevance"}
                        </span>
                        <ChevronDown className="w-4 h-4 mt-1" />
                      </button>
                      {showSortDropdown && (
                        <div
                          ref={sortDropdownRef}
                          className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                        >
                          <div className="py-1">
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                onClick={() => handleSortSelect(option.value)}
                                aria-label={`Sort candidates by ${option.label}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {currentCandidates.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">
                      No candidates in this stage
                    </p>
                    <p className="text-sm mt-1">
                      Candidates will appear here when they reach this stage
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 border-b-1 border-[#E2E2E2] overflow-y-auto max-h-[calc(100vh-0px)] hide-scrollbar p-4">
                      {currentCandidates.map((candidate: any) => {
                        const fullName = candidate.candidate.full_name;
                        const avatar = candidate.candidate.avatar;
                        const location = candidate.candidate.location;
                        const isBackgroundVerified =
                          candidate.candidate.is_background_verified;
                        const experienceYears =
                          candidate.candidate.experience_years;
                        const experienceSummaryTitle =
                          candidate.candidate.experience_summary?.title;
                        const experienceSummaryDateRange =
                          candidate.candidate.experience_summary?.date_range;
                        const educationSummaryTitle =
                          candidate.candidate.education_summary?.title;
                        const noticePeriodSummary =
                          candidate.candidate.notice_period_summary;
                        const currentSalary =
                          candidate.candidate.current_salary_lpa;
                        const profilePicture =
                          candidate.candidate.profilePicture?.displayImageUrl;
                        const candidate_headline = candidate.candidate.headline;

                        return (
                          <div
                            key={candidate.id}
                            className={`relative pt-5 hover:bg-blue-50 transition-colors cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                              selectedCandidate?.id === candidate.id
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "border border-gray-200"
                            }`}
                            onClick={() => handleCandidateSelect(candidate)}
                            tabIndex={0}
                            role="button"
                            aria-label={`Select candidate ${candidate.candidate.full_name}`}
                          >
                            {candidate.candidate.premium_data_unlocked && (
                              <button
                                className="absolute top-0 left-0 z-10 "
                                title="Information revealed"
                              >
                                <svg
                                  width="21"
                                  height="18"
                                  viewBox="0 0 21 18"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className=""
                                >
                                  <path
                                    d="M0.5 17.5L0.5 4.5C0.5 2.29086 2.29086 0.5 4.5 0.5L20.5 0.5L10.5 9L0.5 17.5Z"
                                    fill="#3B82F6"
                                  />
                                </svg>
                              </button>
                            )}
                            <div className="flex px-4 items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(
                                  candidate.id.toString(),
                                )}
                                onChange={() =>
                                  handleCandidateCheckbox(
                                    candidate.id.toString(),
                                  )
                                }
                                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Select  ${fullName}`}
                              />
                              <div className="border-b border-[#E2E2E2] flex items-center space-x-3 pb-3 w-full">
                                {/* <div
                                  className={`w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-base font-[600] `}
                                >
                                  {profilePicture ? (
                                    <img
                                      src={profilePicture}
                                      alt={fullName}
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    avatar?.slice(0, 2)
                                  )}
                                </div> */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between flex-wrap gap-2 pr-4">
                                    <div className="flex items-center space-x-2 flex-wrap">
                                      <h3 className="text-xs lg:text-base font-[600] text-gray-900">
                                        {fullName}
                                      </h3>
                                      {isBackgroundVerified && (
                                        <div
                                          className="relative flex space-x-1"
                                          onMouseEnter={() =>
                                            setHoveredCandidateId(candidate.id)
                                          }
                                          onMouseLeave={() =>
                                            setHoveredCandidateId(null)
                                          }
                                        >
                                          <span className="mt-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="256"
                                              height="256"
                                              viewBox="0 0 256 256"
                                              xmlSpace="preserve"
                                            >
                                              <g
                                                transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
                                                style={{
                                                  stroke: "none",
                                                  strokeWidth: 0,
                                                  strokeDasharray: "none",
                                                  strokeLinecap: "butt",
                                                  strokeLinejoin: "miter",
                                                  strokeMiterlimit: 10,
                                                  fill: "none",
                                                  fillRule: "nonzero",
                                                  opacity: 1,
                                                }}
                                              >
                                                <polygon
                                                  points="45,6.18 57.06,0 64.41,11.38 77.94,12.06 78.62,25.59 90,32.94 83.82,45 90,57.06 78.62,64.41 77.94,77.94 64.41,78.62 57.06,90 45,83.82 32.94,90 25.59,78.62 12.06,77.94 11.38,64.41 0,57.06 6.18,45 0,32.94 11.38,25.59 12.06,12.06 25.59,11.38 32.94,0"
                                                  style={{
                                                    stroke: "none",
                                                    strokeWidth: 1,
                                                    strokeDasharray: "none",
                                                    strokeLinecap: "butt",
                                                    strokeLinejoin: "miter",
                                                    strokeMiterlimit: 10,
                                                    fill: "rgb(0,150,241)",
                                                    fillRule: "nonzero",
                                                    opacity: 1,
                                                  }}
                                                  transform="matrix(1 0 0 1 0 0)"
                                                />
                                                <polygon
                                                  points="40.16,58.47 26.24,45.08 29.7,41.48 40.15,51.52 61.22,31.08 64.7,34.67"
                                                  style={{
                                                    stroke: "none",
                                                    strokeWidth: 1,
                                                    strokeDasharray: "none",
                                                    strokeLinecap: "butt",
                                                    strokeLinejoin: "miter",
                                                    strokeMiterlimit: 10,
                                                    fill: "rgb(255,255,255)",
                                                    fillRule: "nonzero",
                                                    opacity: 1,
                                                  }}
                                                  transform="matrix(1 0 0 1 0 0)"
                                                />
                                              </g>
                                            </svg>
                                          </span>
                                          {hoveredCandidateId ===
                                            candidate.id && (
                                            <div
                                              className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-700 z-10"
                                              role="tooltip"
                                              aria-hidden={
                                                hoveredCandidateId !==
                                                candidate.id
                                              }
                                            >
                                              Verified via last employer's
                                              confirmation
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="">
                                    <div>
                                      {experienceSummaryTitle && (
                                        <div>
                                          <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                            {experienceSummaryTitle}
                                          </p>
                                          <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1">
                                            |
                                          </p>
                                        </div>
                                      )
                                        ? educationSummaryTitle && (
                                            <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                              {educationSummaryTitle}
                                            </p>
                                          )
                                        : candidate_headline && (
                                            <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[48ch] truncate">
                                              {candidate_headline}
                                            </p>
                                          )}
                                    </div>

                                    <div className="flex justify-between">
                                      <div className="flex gap-4">
                                        <div className="flex space-x-1">
                                          <p className="flex items-center gap-2 text-xs lg:text-base font-[400] text-[#4B5563]">
                                            <MapPin className=" w-4 h-4" />

                                            {location?.split(",")[0]}
                                          </p>
                                        </div>

                                        <div className="rounded-md flex space-x-1 items-center text-xs lg:text-base font-[400] text-[#4B5563]">
                                          <div className="flex items-center gap-2 text-xs lg:text-base font-[400] text-[#4B5563]">
                                            <AlarmClock className=" w-4 h-4" />
                                            {candidate.status_tags.map(
                                              (
                                                tag: {
                                                  text: string;
                                                  color: string;
                                                },
                                                idx: number,
                                              ) => (
                                                <span
                                                  key={idx}
                                                  className={`text-${tag.color}-500`}
                                                >
                                                  {tag.text}
                                                </span>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex space-x-1">
                                        <div className="inline-block bg-[#DFFBE2] text-[#00A25E] px-4 py-1.5 rounded-lg text-xl font-medium">
                                          --%
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 pl-12 flex space-x-12 gap-2 text-xs lg:text-sm font-[400px]">
                              {/* Experience */}
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <p className="text-[#A8A8A8] mr-1">
                                    Experience
                                  </p>
                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCandidate(candidate);
                                      setShowEditModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    title="Edit Experience"
                                  >
                                    <PencilLine size={10} />
                                  </button> */}
                                </div>
                                <p className="text-[#4B5563]">
                                  {experienceYears || "--"}
                                </p>
                              </div>

                              {/* Notice Period */}
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <p className="text-[#A8A8A8] mr-1">
                                    Notice Period
                                  </p>
                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCandidate(candidate);
                                      setShowEditModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    title="Edit Notice Period"
                                  >
                                    <PencilLine size={10} />
                                  </button> */}
                                </div>
                                <p className="text-[#4B5563]">
                                  {noticePeriodSummary
                                    ? noticePeriodSummary
                                        .split(" ")
                                        .map(
                                          (word: String) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1),
                                        )
                                        .join(" ")
                                    : "--"}
                                </p>
                              </div>

                              {/* Current Salary */}
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <p className="text-[#A8A8A8] mr-1">
                                    Current CTC
                                  </p>
                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCandidate(candidate);
                                      setShowEditModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    title="Edit Current Salary"
                                  >
                                    <PencilLine size={10} />
                                  </button> */}
                                </div>
                                <p className="text-[#4B5563]">
                                  {currentSalary || "--"}
                                </p>
                              </div>

                              {/* Current Company (Tenure) */}
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <p className="text-[#A8A8A8] mr-1">
                                    Expected CTC
                                  </p>
                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCandidate(candidate);
                                      setShowEditModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    title="Edit Current Company Tenure"
                                  >
                                    <PencilLine size={10} />
                                  </button> */}
                                </div>
                                <p className="text-[#4B5563]">--</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              {/* Premium data icons */}
                              <div className="p-3 pl-12 mt-5 bg-[#F5F9FB] flex items-center justify-between space-x-2 flex-wrap gap-2 rounded-lg">
                                <div className="flex items-center space-x-1">
                                  {candidate.candidate.premium_data_availability
                                    ?.pinterest_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.pinterest_username
                                        : null;
                                      return (
                                        <button
                                          className="text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .pinterest_username;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s Pinterest profile`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1059)">
                                              <path
                                                d="M15.0039 11.8779C14.6007 11.8076 14.1789 11.8169 13.7664 11.8404C12.8289 11.8919 11.8914 11.981 10.9539 11.8966C10.5086 11.8544 10.0586 11.8123 9.60856 11.8216C8.79293 11.8357 8.10856 12.1029 7.70543 12.881C7.50387 13.2654 7.45699 13.6779 7.47106 14.1044C7.50387 15.3044 8.02418 15.9888 9.16793 16.331C10.0867 16.6029 11.0289 16.6404 11.9757 16.6216C12.3273 16.6216 12.6789 16.6404 13.0304 16.6169C13.757 16.5748 14.4695 16.4669 15.1586 16.2138C15.8711 15.9513 16.2976 15.4498 16.4523 14.7232C16.5132 14.4419 16.5414 14.1466 16.5367 13.8607C16.5273 12.8904 15.8711 12.0232 15.0039 11.8779ZM10.3914 15.0513C10.0867 15.3841 9.64606 15.3888 9.33199 15.0654C9.10231 14.831 8.97106 14.4701 8.97106 14.0201C8.98043 13.7154 9.06949 13.3826 9.33199 13.1154C9.64606 12.7919 10.0867 12.7966 10.3914 13.1248C10.8507 13.6216 10.8507 14.5544 10.3914 15.0513ZM14.6523 15.0748C14.3664 15.3701 13.9539 15.3794 13.6492 15.1076C13.1242 14.6294 13.1242 13.5654 13.6492 13.0826C13.9492 12.806 14.3617 12.8154 14.6523 13.1107C14.9195 13.3826 15.0086 13.7248 15.0226 14.0904C15.0086 14.4607 14.9148 14.7982 14.6523 15.0748Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM18.15 13.05C18.0844 13.5844 17.9719 14.1328 17.7797 14.6344C17.2172 16.0734 16.0922 16.8656 14.6016 17.1047C13.7484 17.2406 12.8719 17.2453 11.925 17.3156C11.0766 17.2406 10.1438 17.2313 9.23906 17.0719C7.48594 16.7625 6.29531 15.5344 5.94844 13.7766C5.77031 12.8812 5.71875 11.9813 5.99531 11.0906C6.14062 10.6313 6.37969 10.2234 6.68906 9.85313C6.73125 9.80625 6.76875 9.73594 6.76406 9.675C6.7125 8.86875 6.80625 8.07187 7.04531 7.30312C7.24219 6.66094 7.09688 6.69844 7.80938 6.88594C8.66719 7.11094 9.41719 7.575 10.1531 8.05781C10.2375 8.11406 10.3687 8.1375 10.4719 8.11875C11.5125 7.95938 12.5484 7.95 13.5891 8.13281C13.6641 8.14688 13.7625 8.11875 13.8328 8.07656C14.4656 7.66406 15.1172 7.29375 15.8297 7.03594C16.0875 6.94219 16.3594 6.88125 16.6219 6.80156C16.7391 6.76875 16.7906 6.81094 16.8328 6.92344C17.1516 7.81406 17.2828 8.72812 17.2359 9.67031C17.2313 9.72187 17.2594 9.79219 17.2922 9.83437C18.0938 10.7625 18.2953 11.8687 18.15 13.05Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1059">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.github_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.github_url
                                        : null;
                                      return (
                                        <button
                                          className="text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .github_url;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s GitHub profile`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1059)">
                                              <path
                                                d="M15.0039 11.8779C14.6007 11.8076 14.1789 11.8169 13.7664 11.8404C12.8289 11.8919 11.8914 11.981 10.9539 11.8966C10.5086 11.8544 10.0586 11.8123 9.60856 11.8216C8.79293 11.8357 8.10856 12.1029 7.70543 12.881C7.50387 13.2654 7.45699 13.6779 7.47106 14.1044C7.50387 15.3044 8.02418 15.9888 9.16793 16.331C10.0867 16.6029 11.0289 16.6404 11.9757 16.6216C12.3273 16.6216 12.6789 16.6404 13.0304 16.6169C13.757 16.5748 14.4695 16.4669 15.1586 16.2138C15.8711 15.9513 16.2976 15.4498 16.4523 14.7232C16.5132 14.4419 16.5414 14.1466 16.5367 13.8607C16.5273 12.8904 15.8711 12.0232 15.0039 11.8779ZM10.3914 15.0513C10.0867 15.3841 9.64606 15.3888 9.33199 15.0654C9.10231 14.831 8.97106 14.4701 8.97106 14.0201C8.98043 13.7154 9.06949 13.3826 9.33199 13.1154C9.64606 12.7919 10.0867 12.7966 10.3914 13.1248C10.8507 13.6216 10.8507 14.5544 10.3914 15.0513ZM14.6523 15.0748C14.3664 15.3701 13.9539 15.3794 13.6492 15.1076C13.1242 14.6294 13.1242 13.5654 13.6492 13.0826C13.9492 12.806 14.3617 12.8154 14.6523 13.1107C14.9195 13.3826 15.0086 13.7248 15.0226 14.0904C15.0086 14.4607 14.9148 14.7982 14.6523 15.0748Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM18.15 13.05C18.0844 13.5844 17.9719 14.1328 17.7797 14.6344C17.2172 16.0734 16.0922 16.8656 14.6016 17.1047C13.7484 17.2406 12.8719 17.2453 11.925 17.3156C11.0766 17.2406 10.1438 17.2313 9.23906 17.0719C7.48594 16.7625 6.29531 15.5344 5.94844 13.7766C5.77031 12.8812 5.71875 11.9813 5.99531 11.0906C6.14062 10.6313 6.37969 10.2234 6.68906 9.85313C6.73125 9.80625 6.76875 9.73594 6.76406 9.675C6.7125 8.86875 6.80625 8.07187 7.04531 7.30312C7.24219 6.66094 7.09688 6.69844 7.80938 6.88594C8.66719 7.11094 9.41719 7.575 10.1531 8.05781C10.2375 8.11406 10.3687 8.1375 10.4719 8.11875C11.5125 7.95938 12.5484 7.95 13.5891 8.13281C13.6641 8.14688 13.7625 8.11875 13.8328 8.07656C14.4656 7.66406 15.1172 7.29375 15.8297 7.03594C16.0875 6.94219 16.3594 6.88125 16.6219 6.80156C16.7391 6.76875 16.7906 6.81094 16.8328 6.92344C17.1516 7.81406 17.2828 8.72812 17.2359 9.67031C17.2313 9.72187 17.2594 9.79219 17.2922 9.83437C18.0938 10.7625 18.2953 11.8687 18.15 13.05Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1059">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.linkedin_url &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.linkedin_url
                                        : null;
                                      return (
                                        <button
                                          className="text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .linkedin_ur;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s LinkedIn profile`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1074)">
                                              <path
                                                d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM8.64375 17.0203H6.30469V9.53437H8.64375V17.0203ZM7.41094 8.59687H7.39219C6.54375 8.59687 5.99531 8.025 5.99531 7.29844C5.99531 6.55781 6.5625 6 7.425 6C8.2875 6 8.81719 6.55781 8.83594 7.29844C8.84062 8.02031 8.29219 8.59687 7.41094 8.59687ZM18 17.0203H15.3469V13.1484C15.3469 12.1359 14.9344 11.4422 14.0203 11.4422C13.3219 11.4422 12.9328 11.9109 12.7547 12.3609C12.6891 12.5203 12.6984 12.7453 12.6984 12.975V17.0203H10.0688C10.0688 17.0203 10.1016 10.1578 10.0688 9.53437H12.6984V10.7109C12.8531 10.1953 13.6922 9.46406 15.0328 9.46406C16.6969 9.46406 18 10.5422 18 12.8578V17.0203Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1074">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.behance_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.behance_username
                                        : null;
                                      return (
                                        <button
                                          className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .behance_username;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s portfolio`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1068)">
                                              <path
                                                d="M16.1305 11.4594C15.9008 11.2625 15.6148 11.1641 15.2773 11.1641C14.9117 11.1641 14.6258 11.2672 14.4195 11.4781C14.218 11.6891 14.0914 11.9703 14.0352 12.3266H16.5055C16.4867 11.9469 16.3555 11.6609 16.1305 11.4594Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M10.0453 12.4703C9.86719 12.3906 9.62344 12.3484 9.30469 12.3438H7.47656V14.3219H9.28125C9.60469 14.3219 9.85313 14.2797 10.0312 14.1906C10.3594 14.0266 10.5187 13.7219 10.5187 13.2672C10.5187 12.8828 10.3594 12.6156 10.0453 12.4703Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM13.6688 8.54531H16.8469V9.46875H13.6688V8.54531ZM11.7516 14.5594C11.6109 14.7891 11.4375 14.9859 11.2266 15.1406C10.9922 15.3234 10.7109 15.4453 10.3875 15.5156C10.0641 15.5813 9.71719 15.6141 9.3375 15.6141H6V8.19844H9.58594C10.4906 8.2125 11.1328 8.475 11.5078 8.99063C11.7328 9.30469 11.8453 9.68437 11.8453 10.125C11.8453 10.575 11.7328 10.9406 11.5031 11.2172C11.3766 11.3719 11.1844 11.5125 10.9359 11.6391C11.3156 11.7797 11.6016 11.9953 11.7938 12.2953C11.9859 12.5953 12.0844 12.9563 12.0844 13.3828C12.0844 13.8141 11.9719 14.2078 11.7516 14.5594ZM18 13.275H14.0062C14.0297 13.8234 14.2172 14.2125 14.5781 14.4328C14.7984 14.5687 15.0609 14.6391 15.3703 14.6391C15.6937 14.6391 15.9609 14.5547 16.1672 14.3859C16.2797 14.2969 16.3781 14.1703 16.4625 14.0062H17.925C17.8875 14.3297 17.7094 14.6625 17.3953 15C16.9031 15.5344 16.2188 15.8016 15.3328 15.8016C14.6016 15.8016 13.9594 15.5766 13.4016 15.1266C12.8438 14.6766 12.5625 13.9453 12.5625 12.9328C12.5625 11.9812 12.8156 11.2547 13.3172 10.7484C13.8234 10.2422 14.475 9.98906 15.2766 9.98906C15.7547 9.98906 16.1859 10.0734 16.5656 10.2469C16.95 10.4156 17.2641 10.6875 17.5125 11.0578C17.7375 11.3812 17.8828 11.7609 17.9484 12.1922C17.9906 12.4406 18.0047 12.8016 18 13.275Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M10.068 10.9375C10.2695 10.8156 10.368 10.5953 10.368 10.2859C10.368 9.93906 10.2367 9.71406 9.96953 9.60156C9.73984 9.52656 9.44922 9.48438 9.09297 9.48438H7.48047V11.1203H9.28047C9.60391 11.125 9.86172 11.0641 10.068 10.9375Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1068">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.instagram_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.instagram_username
                                        : null;
                                      return (
                                        <button
                                          className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .instagram_username;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s portfolio`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1076)">
                                              <path
                                                d="M12.813 0.0234375C18.9023 0.0234375 23.8845 5.00561 23.8845 11.0949V12.8247C23.8845 18.9141 18.9023 23.8962 12.813 23.8962H11.0832C4.99389 23.8962 0.0117188 18.9141 0.0117188 12.8247V11.0949C0.0117188 5.00561 4.99389 0.0234375 11.0832 0.0234375H12.813ZM12.1658 6.02364L12.0117 6.02344C10.729 6.02344 9.44636 6.06583 9.44636 6.06583C7.57288 6.06583 6.05412 7.5846 6.05412 9.45807C6.05412 9.45807 6.01518 10.5595 6.01193 11.7417L6.01172 11.8962C6.01172 13.2199 6.05412 14.5888 6.05412 14.5888C6.05412 16.4623 7.57288 17.981 9.44636 17.981C9.44636 17.981 10.6456 18.0234 11.8845 18.0234C13.2082 18.0234 14.6195 17.981 14.6195 17.981C16.493 17.981 17.9693 16.5047 17.9693 14.6312C17.9693 14.6312 18.0117 13.2777 18.0117 11.9811L18.0109 11.6768C18.0052 10.5134 17.9693 9.41565 17.9693 9.41565C17.9693 7.54217 16.493 6.06583 14.6195 6.06583C14.6195 6.06583 13.3983 6.02676 12.1658 6.02364ZM12.0117 7.10341C13.0635 7.10341 14.4121 7.13819 14.4121 7.13819C15.9484 7.13819 16.8969 8.08672 16.8969 9.62298C16.8969 9.62298 16.9317 10.9486 16.9317 11.9886C16.9317 13.0519 16.8969 14.4238 16.8969 14.4238C16.8969 15.9601 15.9484 16.9086 14.4121 16.9086C14.4121 16.9086 13.2195 16.9378 12.1847 16.9427L11.9074 16.9434C10.8915 16.9434 9.65369 16.9086 9.65369 16.9086C8.11745 16.9086 7.1265 15.9176 7.1265 14.3814C7.1265 14.3814 7.09172 13.0045 7.09172 11.9191C7.09172 10.9032 7.1265 9.62298 7.1265 9.62298C7.1265 8.08672 8.11748 7.13819 9.65369 7.13819C9.65369 7.13819 10.9599 7.10341 12.0117 7.10341ZM12.0117 8.94987C10.3142 8.94987 8.93816 10.3259 8.93816 12.0234C8.93816 13.7209 10.3142 15.0969 12.0117 15.0969C13.7092 15.0969 15.0852 13.7209 15.0852 12.0234C15.0852 10.3259 13.7092 8.94987 12.0117 8.94987ZM12.0117 10.0234C13.1163 10.0234 14.0117 10.9188 14.0117 12.0234C14.0117 13.128 13.1163 14.0234 12.0117 14.0234C10.9071 14.0234 10.0117 13.128 10.0117 12.0234C10.0117 10.9188 10.9071 10.0234 12.0117 10.0234ZM15.2323 8.09695C14.8222 8.09695 14.4896 8.4311 14.4896 8.84327C14.4896 9.25545 14.8222 9.58957 15.2323 9.58957C15.6424 9.58957 15.9749 9.25545 15.9749 8.84327C15.9749 8.43107 15.6424 8.09695 15.2323 8.09695Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1076">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.twitter_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.twitter_url
                                        : null;
                                      return (
                                        <button
                                          className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId: candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .twitter_url;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s twitter`}
                                        >
                                          <svg
                                            width="26"
                                            height="26"
                                            viewBox="0 0 26 26"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z"
                                              fill="#4B5563"
                                              stroke="white"
                                              stroke-miterlimit="10"
                                            />
                                            <path
                                              d="M7.11853 7.47656L11.6695 13.5543L7.08984 18.4958H8.12062L12.1302 14.1693L15.3697 18.4958H18.8772L14.0701 12.0763L18.3328 7.47656H17.302L13.6096 11.461L10.626 7.47656H7.11853ZM8.63432 8.23485H10.2457L17.3612 17.7375H15.7498L8.63432 8.23485Z"
                                              fill="white"
                                            />
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.dribble_username &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.dribble_username
                                        : null;
                                      return (
                                        <button
                                          className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .dribble_username;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s dribble`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <g clip-path="url(#clip0_3112_1084)">
                                              <path
                                                d="M11.7141 10.3203C10.8281 8.74531 9.88125 7.46094 9.81094 7.36719C8.38125 8.04219 7.31719 9.35937 6.98438 10.9437C7.12031 10.9484 9.25781 10.9766 11.7141 10.3203Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12.3547 12.0344C12.4203 12.0109 12.4906 11.9922 12.5563 11.9734C12.4297 11.6828 12.2891 11.3875 12.1391 11.1016C9.5 11.8891 6.96875 11.8328 6.87969 11.8328C6.87969 11.8844 6.875 11.9406 6.875 11.9922C6.875 13.3094 7.37188 14.5094 8.1875 15.4188V15.4141C8.1875 15.4141 9.58906 12.9297 12.3547 12.0344Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M8.80859 16.0094C8.78516 15.9906 8.76172 15.9719 8.73828 15.9531C8.76641 15.9719 8.78984 15.9953 8.80859 16.0094Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M10.7727 7.02344C10.768 7.02344 10.7633 7.02813 10.7539 7.02813C10.768 7.02813 10.7727 7.02813 10.7727 7.02344C10.7727 7.02813 10.7727 7.02813 10.7727 7.02344Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M15.3828 8.15469C14.4781 7.35781 13.2969 6.875 11.9984 6.875C11.5813 6.875 11.1781 6.92656 10.7891 7.02031C10.8641 7.12344 11.8297 8.39844 12.7063 10.0109C14.6375 9.28437 15.3688 8.17344 15.3828 8.15469Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12.8711 12.8422C9.83359 13.9016 8.84922 16.0438 8.84922 16.0438C8.84922 16.0438 8.84453 16.0391 8.83984 16.0344C9.71172 16.7187 10.8086 17.1266 11.9992 17.1266C12.707 17.1266 13.3867 16.9812 14.0008 16.7188C13.9258 16.2687 13.6258 14.7031 12.9086 12.8281C12.8945 12.8328 12.8805 12.8375 12.8711 12.8422Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM17.8781 13.2094C17.7984 13.5937 17.6812 13.9734 17.5266 14.3344C17.3766 14.6906 17.1891 15.0328 16.9734 15.3563C16.7578 15.675 16.5141 15.9703 16.2422 16.2422C15.9703 16.5141 15.6703 16.7578 15.3563 16.9734C15.0375 17.1891 14.6906 17.3766 14.3391 17.5266C13.9781 17.6813 13.5984 17.7984 13.2094 17.8781C12.8156 17.9578 12.4078 18 12 18C11.5922 18 11.1844 17.9578 10.7906 17.8781C10.4062 17.7984 10.0266 17.6813 9.66562 17.5266C9.30937 17.3766 8.96719 17.1891 8.64844 16.9734C8.32969 16.7578 8.03438 16.5141 7.7625 16.2422C7.49063 15.9703 7.24687 15.6703 7.03125 15.3563C6.81563 15.0375 6.62812 14.6906 6.47812 14.3344C6.32344 13.9734 6.20625 13.5937 6.12656 13.2094C6.04688 12.8156 6.00469 12.4078 6.00469 12C6.00469 11.5922 6.04688 11.1844 6.12656 10.7906C6.20625 10.4063 6.32344 10.0266 6.47812 9.66094C6.62812 9.30469 6.81563 8.9625 7.03125 8.64375C7.24687 8.325 7.49063 8.02969 7.7625 7.75781C8.03438 7.48594 8.33438 7.2375 8.64844 7.02656C8.96719 6.81094 9.31406 6.62344 9.66562 6.47344C10.0266 6.31875 10.4062 6.20156 10.7906 6.12188C11.1844 6.04219 11.5922 6 12 6C12.4078 6 12.8109 6.04219 13.2094 6.12188C13.5937 6.20156 13.9734 6.31875 14.3391 6.47344C14.6953 6.62344 15.0375 6.81094 15.3563 7.02656C15.675 7.24219 15.9703 7.48594 16.2422 7.75781C16.5141 8.02969 16.7578 8.32969 16.9734 8.64375C17.1891 8.9625 17.3766 9.30469 17.5266 9.66094C17.6812 10.0219 17.7984 10.4016 17.8781 10.7906C17.9578 11.1844 18 11.5922 18 12C18 12.4078 17.9578 12.8156 17.8781 13.2094Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M13.1016 10.775C13.2187 11.0187 13.3359 11.2672 13.4438 11.5203C13.4813 11.6094 13.5187 11.6984 13.5562 11.7828C15.3187 11.5625 17.0531 11.9328 17.1234 11.9516C17.1094 10.7375 16.6781 9.62188 15.9562 8.75C15.9469 8.76406 15.1266 9.95 13.1016 10.775Z"
                                                fill="#4B5563"
                                              />
                                              <path
                                                d="M13.8672 12.5915C14.5375 14.4384 14.8141 15.9431 14.8656 16.2524C16.0141 15.4743 16.8344 14.2462 17.0641 12.8165C16.9562 12.779 15.5219 12.3243 13.8672 12.5915Z"
                                                fill="#4B5563"
                                              />
                                            </g>
                                            <defs>
                                              <clipPath id="clip0_3112_1084">
                                                <rect
                                                  width="24"
                                                  height="24"
                                                  fill="white"
                                                />
                                              </clipPath>
                                            </defs>
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.resume_url &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.resume_url
                                        : null;
                                      return (
                                        <button
                                          className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      .resume_url;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s resume`}
                                        >
                                          <svg
                                            width="26"
                                            height="26"
                                            viewBox="0 0 26 26"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z"
                                              fill="#4B5563"
                                              stroke="white"
                                              stroke-miterlimit="10"
                                            />
                                            <path
                                              fill-rule="evenodd"
                                              clip-rule="evenodd"
                                              d="M12.4333 7.53906H13.5051C14.4373 7.53905 15.1757 7.53905 15.7535 7.61663C16.3483 7.69647 16.8296 7.8647 17.2093 8.24377C17.5889 8.62284 17.7573 9.10351 17.8373 9.69737C17.915 10.2744 17.915 11.0117 17.915 11.9426V14.0259C17.915 14.9568 17.915 15.6941 17.8373 16.2711C17.7573 16.865 17.5889 17.3457 17.2093 17.7247C16.8296 18.1038 16.3483 18.272 15.7535 18.3519C15.1757 18.4294 14.4373 18.4294 13.5051 18.4294H12.4333C11.5011 18.4294 10.7627 18.4294 10.1849 18.3519C9.59014 18.272 9.10877 18.1038 8.72916 17.7247C8.34954 17.3457 8.18107 16.865 8.10112 16.2711C8.02342 15.6941 8.02343 14.9568 8.02344 14.0259V11.9426C8.02343 11.0117 8.02342 10.2744 8.10112 9.69737C8.18107 9.10351 8.34954 8.62284 8.72916 8.24377C9.10877 7.8647 9.59014 7.69647 10.1849 7.61663C10.7627 7.53905 11.5011 7.53905 12.4333 7.53906ZM10.2862 8.36965C9.77589 8.43816 9.48186 8.56665 9.26718 8.78102C9.05251 8.99539 8.92383 9.289 8.85522 9.79861C8.78513 10.3191 8.78433 11.0053 8.78433 11.9712V13.9973C8.78433 14.9631 8.78513 15.6493 8.85522 16.1699C8.92383 16.6795 9.05251 16.9731 9.26718 17.1875C9.48186 17.4018 9.77589 17.5303 10.2862 17.5988C10.8075 17.6688 11.4947 17.6696 12.4619 17.6696H13.4765C14.4437 17.6696 15.1309 17.6688 15.6522 17.5988C16.1625 17.5303 16.4566 17.4018 16.6712 17.1875C16.8859 16.9731 17.0146 16.6795 17.0832 16.1699C17.1533 15.6493 17.1541 14.9631 17.1541 13.9973V11.9712C17.1541 11.0053 17.1533 10.3191 17.0832 9.79861C17.0146 9.289 16.8859 8.99539 16.6712 8.78102C16.4566 8.56665 16.1625 8.43816 15.6522 8.36965C15.1309 8.29966 14.4437 8.29886 13.4765 8.29886H12.4619C11.4947 8.29886 10.8075 8.29966 10.2862 8.36965ZM10.5597 11.9712C10.5597 11.7614 10.7301 11.5913 10.9402 11.5913H14.9982C15.2083 11.5913 15.3787 11.7614 15.3787 11.9712C15.3787 12.181 15.2083 12.3511 14.9982 12.3511H10.9402C10.7301 12.3511 10.5597 12.181 10.5597 11.9712ZM10.5597 13.9973C10.5597 13.7875 10.7301 13.6174 10.9402 13.6174H13.4765C13.6866 13.6174 13.8569 13.7875 13.8569 13.9973C13.8569 14.2071 13.6866 14.3772 13.4765 14.3772H10.9402C10.7301 14.3772 10.5597 14.2071 10.5597 13.9973Z"
                                              fill="white"
                                            />
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                  {candidate.candidate.premium_data_availability
                                    ?.portfolio_url &&
                                    (() => {
                                      const url = candidate.candidate
                                        .premium_data_unlocked
                                        ? candidate.candidate.premium_data
                                            ?.portfolio_url
                                        : null;
                                      return (
                                        <button
                                          className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (url) {
                                              window.open(url, "_blank");
                                            } else {
                                              setPendingReveal({
                                                candidateId:
                                                  candidate.candidate.id,
                                                onSuccess: (prem) => {
                                                  const finalUrl =
                                                    prem.candidate.premium_data
                                                      ?.portfolio_url;
                                                  if (finalUrl)
                                                    window.open(
                                                      finalUrl,
                                                      "_blank",
                                                    );
                                                },
                                              });
                                              setShowRevealDialog(true);
                                            }
                                          }}
                                          aria-label={`View ${candidate.candidate.full_name}'s portfolio`}
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM7.98 15.324C7.848 15.684 7.5 15.912 7.14 15.912C7.032 15.912 6.936 15.9 6.828 15.852C5.856 15.492 5.04 14.784 4.524 13.86C3.324 11.7 4.068 8.88 6.168 7.572L8.976 5.832C10.008 5.196 11.22 5.004 12.372 5.304C13.524 5.604 14.496 6.36 15.084 7.416C16.284 9.576 15.54 12.396 13.44 13.704L13.128 13.932C12.72 14.22 12.156 14.124 11.868 13.728C11.58 13.32 11.676 12.756 12.072 12.468L12.444 12.204C13.788 11.364 14.244 9.624 13.512 8.292C13.164 7.668 12.6 7.224 11.928 7.044C11.256 6.864 10.548 6.972 9.936 7.356L7.104 9.108C5.808 9.912 5.352 11.652 6.084 12.996C6.384 13.536 6.864 13.956 7.44 14.172C7.908 14.34 8.148 14.856 7.98 15.324ZM17.904 16.38L15.096 18.12C14.388 18.564 13.596 18.78 12.792 18.78C12.432 18.78 12.06 18.732 11.7 18.636C10.548 18.336 9.576 17.58 9 16.524C7.8 14.364 8.544 11.544 10.644 10.236L10.956 10.008C11.364 9.72 11.928 9.816 12.216 10.212C12.504 10.62 12.408 11.184 12.012 11.472L11.64 11.736C10.296 12.576 9.84 14.316 10.572 15.648C10.92 16.272 11.484 16.716 12.156 16.896C12.828 17.076 13.536 16.968 14.148 16.584L16.956 14.844C18.252 14.04 18.708 12.3 17.976 10.956C17.676 10.416 17.196 9.996 16.62 9.78C16.152 9.612 15.912 9.096 16.092 8.628C16.26 8.16 16.788 7.92 17.244 8.1C18.216 8.46 19.032 9.168 19.548 10.092C20.736 12.252 20.004 15.072 17.904 16.38Z"
                                              fill="#4B5563"
                                            />
                                          </svg>
                                        </button>
                                      );
                                    })()}
                                </div>
                              </div>

                              {/* Buttons */}
                              <div className="flex items-center mr-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent opening candidate details
                                    shortlistCandidate(candidate.id);
                                  }}
                                  className="mr-2 bg-[#0F47F2] text-white font-medium px-6 py-2 rounded-lg transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
                                  disabled={selectedStage === "Shortlisted"} // optional: disable if already shortlisted
                                  title={
                                    selectedStage === "Shortlisted"
                                      ? "Already shortlisted"
                                      : "Move to Shortlisted"
                                  }
                                >
                                  {selectedStage === "Shortlisted"
                                    ? "Shortlisted"
                                    : "Shortlist"}
                                </button>

                                {/* Autopilot - Move to Applied stage */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveToAutopilot(candidate.id);
                                  }}
                                  className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                                  aria-label="Move to Autopilot (Applied stage)"
                                  title="Move to Autopilot stage"
                                  disabled={
                                    selectedStage === "Applied" ||
                                    selectedStage === "Autopilot"
                                  }
                                >
                                  {selectedStage === "Applied" ||
                                  selectedStage === "Autopilot" ? null : (
                                    <svg
                                      width="38"
                                      height="38"
                                      viewBox="0 0 38 38"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <rect
                                        x="0.5"
                                        y="0.5"
                                        width="37"
                                        height="37"
                                        rx="18.5"
                                        stroke="#0F47F2"
                                      />
                                      <path
                                        d="M19 7L22 15.1429L31 19L22 22L19 31L16 22L7 19L16 15.1429L19 7Z"
                                        fill="#0F47F2"
                                      />
                                    </svg>
                                  )}
                                </button>

                                {/* Archive */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveCandidate(candidate.id);
                                  }}
                                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                  aria-label="Archive candidate"
                                  title="Archive this candidate"
                                  disabled={selectedStage === "Archives"} // optional: disable if already archived
                                >
                                  <svg
                                    width="38"
                                    height="38"
                                    viewBox="0 0 38 38"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <circle
                                      cx="19"
                                      cy="19"
                                      r="18.5"
                                      stroke="#818283"
                                    />
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M12.3276 10.9102C12.34 10.9102 12.3523 10.9102 12.3647 10.9102L25.6717 10.9102C26.0307 10.9101 26.3598 10.9101 26.6275 10.9461C26.9223 10.9857 27.2339 11.079 27.4902 11.3353C27.7466 11.5916 27.8398 11.9032 27.8794 12.198C27.9154 12.4657 27.9154 12.7948 27.9153 13.1538V13.228C27.9154 13.587 27.9154 13.9161 27.8794 14.1838C27.8398 14.4787 27.7466 14.7903 27.4902 15.0466C27.2466 15.2902 26.9529 15.3865 26.6713 15.4295V19.8726C26.6713 21.3968 26.6713 22.604 26.5443 23.5489C26.4135 24.5213 26.1381 25.3083 25.5175 25.929C24.8968 26.5496 24.1098 26.825 23.1374 26.9558C22.1926 27.0828 20.9853 27.0828 19.4611 27.0828H18.5382C17.014 27.0828 15.8068 27.0828 14.8619 26.9558C13.8896 26.825 13.1026 26.5496 12.4819 25.929C11.8612 25.3083 11.5858 24.5213 11.455 23.5489C11.328 22.604 11.328 21.3968 11.328 19.8726V15.4295C11.0464 15.3865 10.7527 15.2902 10.5091 15.0466C10.2528 14.7903 10.1595 14.4787 10.1199 14.1838C10.0839 13.9161 10.0839 13.587 10.084 13.228C10.084 13.2157 10.084 13.2033 10.084 13.1909C10.084 13.1785 10.084 13.1661 10.084 13.1538C10.0839 12.7948 10.0839 12.4657 10.1199 12.198C10.1595 11.9032 10.2528 11.5916 10.5091 11.3353C10.7654 11.079 11.077 10.9857 11.3718 10.9461C11.6396 10.9101 11.9687 10.9101 12.3276 10.9102ZM12.5721 15.4717V19.8258C12.5721 21.4073 12.5734 22.5308 12.688 23.3831C12.8002 24.2175 13.0106 24.6983 13.3616 25.0493C13.7126 25.4002 14.1933 25.6107 15.0277 25.7228C15.88 25.8374 17.0035 25.8387 18.585 25.8387H19.4143C20.9958 25.8387 22.1193 25.8374 22.9717 25.7228C23.806 25.6107 24.2868 25.4002 24.6378 25.0493C24.9888 24.6983 25.1992 24.2175 25.3113 23.3831C25.4259 22.5308 25.4272 21.4073 25.4272 19.8258V15.4717H12.5721ZM11.3888 12.2149L11.3908 12.2138C11.3924 12.213 11.3952 12.2116 11.3993 12.2099C11.4174 12.2025 11.4575 12.1898 11.5376 12.179C11.7124 12.1555 11.9562 12.1542 12.3647 12.1542H25.6346C26.0431 12.1542 26.287 12.1555 26.4617 12.179C26.5418 12.1898 26.582 12.2025 26.6 12.2099C26.6042 12.2116 26.6069 12.213 26.6085 12.2138L26.6106 12.2149L26.6117 12.217C26.6126 12.2186 26.6139 12.2213 26.6156 12.2255C26.623 12.2436 26.6357 12.2837 26.6465 12.3638C26.67 12.5385 26.6713 12.7824 26.6713 13.1909C26.6713 13.5995 26.67 13.8433 26.6465 14.0181C26.6357 14.0982 26.623 14.1383 26.6156 14.1563C26.6139 14.1605 26.6126 14.1633 26.6117 14.1649L26.6106 14.1669L26.6085 14.168C26.6069 14.1689 26.6042 14.1702 26.6 14.1719C26.582 14.1794 26.5418 14.192 26.4617 14.2028C26.287 14.2263 26.0431 14.2276 25.6346 14.2276H12.3647C11.9562 14.2276 11.7124 14.2263 11.5376 14.2028C11.4575 14.192 11.4174 14.1794 11.3993 14.1719C11.3952 14.1702 11.3924 14.1689 11.3908 14.168L11.3888 14.1669L11.3876 14.1649C11.3868 14.1633 11.3855 14.1605 11.3837 14.1563C11.3763 14.1383 11.3636 14.0982 11.3529 14.0181C11.3294 13.8433 11.328 13.5995 11.328 13.1909C11.328 12.7824 11.3294 12.5385 11.3529 12.3638C11.3636 12.2837 11.3763 12.2436 11.3837 12.2255C11.3855 12.2213 11.3868 12.2186 11.3876 12.217L11.3888 12.2149ZM11.3888 14.1669C11.3884 14.1665 11.3886 14.1666 11.3888 14.1669V14.1669ZM17.7375 17.1304H20.2618C20.4394 17.1304 20.6027 17.1304 20.7398 17.1397C20.8872 17.1498 21.0492 17.1727 21.2138 17.2409C21.5695 17.3882 21.852 17.6707 21.9993 18.0264C22.0675 18.191 22.0904 18.353 22.1005 18.5003C22.1098 18.6374 22.1098 18.8007 22.1098 18.9784V19.0145C22.1098 19.1922 22.1098 19.3555 22.1005 19.4926C22.0904 19.64 22.0675 19.8019 21.9993 19.9666C21.852 20.3222 21.5695 20.6048 21.2138 20.7521C21.0492 20.8202 20.8872 20.8431 20.7398 20.8533C20.6027 20.8625 20.4394 20.8625 20.2618 20.8625H17.7375C17.5599 20.8625 17.3966 20.8625 17.2595 20.8533C17.1122 20.8431 16.9501 20.8202 16.7855 20.7521C16.4299 20.6048 16.1473 20.3222 16 19.9666C15.9318 19.8019 15.9089 19.64 15.8989 19.4926C15.8895 19.3555 15.8895 19.1922 15.8896 19.0145V18.9784C15.8895 18.8007 15.8895 18.6374 15.8989 18.5003C15.9089 18.353 15.9318 18.191 16 18.0264C16.1473 17.6707 16.4299 17.3882 16.7855 17.2409C16.9501 17.1727 17.1122 17.1498 17.2595 17.1397C17.3966 17.1304 17.5599 17.1304 17.7375 17.1304ZM17.2591 18.3913C17.2103 18.4123 17.1714 18.4512 17.1504 18.4999C17.1489 18.5061 17.1438 18.5296 17.14 18.585C17.1339 18.6746 17.1336 18.7948 17.1336 18.9965C17.1336 19.1982 17.1339 19.3183 17.14 19.4079C17.1438 19.4633 17.1489 19.4869 17.1504 19.493C17.1714 19.5418 17.2103 19.5807 17.2591 19.6017C17.2652 19.6032 17.2887 19.6083 17.3442 19.612C17.4337 19.6182 17.5539 19.6185 17.7556 19.6185H20.2437C20.4454 19.6185 20.5656 19.6182 20.6552 19.612C20.7106 19.6083 20.7341 19.6032 20.7403 19.6017C20.789 19.5807 20.8279 19.5418 20.8489 19.493C20.8505 19.4869 20.8555 19.4633 20.8593 19.4079C20.8654 19.3183 20.8657 19.1982 20.8657 18.9965C20.8657 18.7948 20.8654 18.6746 20.8593 18.585C20.8555 18.5296 20.8505 18.5061 20.8489 18.4999C20.8279 18.4512 20.789 18.4123 20.7403 18.3913C20.7341 18.3897 20.7106 18.3846 20.6552 18.3809C20.5656 18.3748 20.4454 18.3744 20.2437 18.3744H17.7556C17.5539 18.3744 17.4337 18.3748 17.3442 18.3809C17.2887 18.3846 17.2652 18.3897 17.2591 18.3913Z"
                                      fill="#818283"
                                    />
                                  </svg>
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCandidate(candidate);
                                    setShowEditModal(true);
                                  }}
                                  className="p-1 rounded-full"
                                  title="Edit candidate details"
                                  aria-label="Edit candidate details"
                                >
                                  <svg
                                    width="38"
                                    height="38"
                                    viewBox="0 0 38 38"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <circle
                                      cx="19"
                                      cy="19"
                                      r="18.5"
                                      stroke="#818283"
                                    />
                                    <path
                                      d="M20.7701 13.059L21.4652 12.3638C22.6169 11.2121 24.4844 11.2121 25.6361 12.3638C26.7879 13.5156 26.7879 15.383 25.6361 16.5348L24.941 17.2299M20.7701 13.059C20.7701 13.059 20.8569 14.5362 22.1603 15.8396C23.4638 17.1431 24.941 17.2299 24.941 17.2299M20.7701 13.059L14.3791 19.4499C13.9462 19.8828 13.7298 20.0992 13.5437 20.3379C13.3241 20.6194 13.1359 20.924 12.9823 21.2463C12.852 21.5195 12.7553 21.8099 12.5617 22.3906L11.7414 24.8516M24.941 17.2299L18.5501 23.6209C18.1172 24.0537 17.9008 24.2702 17.6621 24.4563C17.3806 24.6759 17.076 24.8642 16.7537 25.0178C16.4805 25.148 16.1901 25.2447 15.6094 25.4383L13.1484 26.2587M11.7414 24.8516L11.5408 25.4532C11.4456 25.7389 11.5199 26.054 11.733 26.2671C11.946 26.4801 12.2611 26.5545 12.5469 26.4592L13.1484 26.2587M11.7414 24.8516L13.1484 26.2587"
                                      stroke="#818283"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-[30%] order-3 relative">
            <PipelinesSideCard
              selectedCandidate={selectedCandidate}
              setSelectedCandidate={setSelectedCandidate}
              showComments={showComments}
              setShowComments={setShowComments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              selectedStage={selectedStage}
              stages={stages}
              moveCandidate={moveCandidate}
              archiveCandidate={archiveCandidate}
              stageData={selectedCandidate?.candidate.stageData}
              jobId={activeJobId ?? 0}
              onSendInvite={handleSendInvite}
              deductCredits={deductCredits}
            />
          </div>
        </div>
      </div>

      {showRevealDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Reveal Premium Data
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Your credits will be deducted. Confirm?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => {
                  setShowRevealDialog(false);
                  setPendingReveal(null);
                }}
                disabled={revealLoading}
                aria-label="Cancel reveal"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={handleConfirmReveal}
                disabled={revealLoading}
                aria-label="Confirm reveal"
              >
                {revealLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Revealing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateSelector && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop with blur effect */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>

          {/* TemplateSelector with 40% width */}
          <div className="relative w-[40%] h-full bg-white rounded-tl-xl rounded-bl-xl shadow-lg overflow-y-auto">
            <TemplateSelector
              candidate={selectedCandidate.candidate}
              onBack={handleBackFromTemplate}
              updateCandidateEmail={() => {}} // Pass a no-op or actual handler if needed
              jobId={activeJobId?.toString() || ""}
            />
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Upload Resumes (PDF, DOC, DOCX)
            </h2>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mb-4 w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCandidates}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Candidate Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) =>
                    setEditForm({ ...editForm, experience: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Company Tenure (years)
                </label>
                <input
                  type="number"
                  value={editForm.tenure === "--" ? "" : editForm.tenure}
                  onChange={(e) =>
                    setEditForm({ ...editForm, tenure: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notice Period
                </label>
                <input
                  type="text"
                  value={editForm.notice}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notice: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Salary (LPA)
                </label>
                <input
                  type="text"
                  value={editForm.salary}
                  onChange={(e) =>
                    setEditForm({ ...editForm, salary: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  // TODO: Add your API call here to update backend
                  console.log("Saving changes:", editForm);
                  setShowEditModal(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineStages;
