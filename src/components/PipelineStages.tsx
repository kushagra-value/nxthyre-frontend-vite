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
  const [sortBy, setSortBy] = useState("Relevance");

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
          width="20"
          height="17"
          viewBox="0 0 20 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.3 7.55469C8.29411 7.55469 9.1 6.71522 9.1 5.67969C9.1 4.64415 8.29411 3.80469 7.3 3.80469C6.30589 3.80469 5.5 4.64415 5.5 5.67969C5.5 6.71522 6.30589 7.55469 7.3 7.55469Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M10.8992 11.3203C10.8992 12.3559 10.8992 13.1953 7.29922 13.1953C3.69922 13.1953 3.69922 12.3559 3.69922 11.3203C3.69922 10.2848 5.31099 9.44531 7.29922 9.44531C9.28741 9.44531 10.8992 10.2848 10.8992 11.3203Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M1 8.5C1 4.96446 1 3.1967 2.05441 2.09835C3.10883 1 4.80588 1 8.2 1H11.8C15.1941 1 16.8912 1 17.9456 2.09835C19 3.1967 19 4.96446 19 8.5C19 12.0355 19 13.8033 17.9456 14.9016C16.8912 16 15.1941 16 11.8 16H8.2C4.80588 16 3.10883 16 2.05441 14.9016C1 13.8033 1 12.0355 1 8.5Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M16.2992 8.49219H12.6992"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M16.3008 5.69531H11.8008"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M16.3016 11.3125H13.6016"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
      ),
      "Invites Sent": Send,
      Applied: () => (
        <svg
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.9616 10.5818L16.3845 8.84325C16.8782 6.81385 17.125 5.79915 16.9391 4.92102C16.7924 4.22766 16.4622 3.59781 15.9905 3.11112C15.393 2.49474 14.4718 2.22285 12.6294 1.67907C10.787 1.13529 9.86574 0.863399 9.06859 1.06815C8.43909 1.22981 7.86727 1.59346 7.42544 2.1131C6.94633 2.67655 6.69648 3.50142 6.32469 5.00074C6.26225 5.25253 6.19637 5.52334 6.12539 5.81514L5.70243 7.55386C5.20876 9.58326 4.96192 10.5979 5.14781 11.4761C5.29458 12.1695 5.62471 12.7993 6.09647 13.286C6.69393 13.9024 7.61514 14.1743 9.45757 14.7181C11.1182 15.2082 12.0304 15.4774 12.778 15.3758C12.8599 15.3648 12.9397 15.3492 13.0184 15.329C13.6478 15.1673 14.2196 14.8037 14.6615 14.284C15.221 13.6259 15.4679 12.6113 15.9616 10.5818Z"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M12.7771 15.3829C12.6068 15.9575 12.3073 16.4773 11.9046 16.8928C11.3071 17.5092 10.3858 17.781 8.54349 18.3249C6.70104 18.8686 5.77984 19.1405 4.98262 18.9357C4.35316 18.7741 3.78135 18.4105 3.3395 17.8908C2.77992 17.2327 2.53308 16.218 2.03941 14.1886L1.61649 12.45C1.12282 10.4206 0.875986 9.40594 1.06187 8.52779C1.20864 7.83446 1.53877 7.2046 2.01053 6.71791C2.60799 6.10153 3.52919 5.82965 5.3716 5.28586C5.72017 5.18298 6.03576 5.08984 6.32377 5.00781"
            stroke="#818283"
            stroke-width="1.2"
          />
          <path
            d="M8.98828 8.21094L12.9341 9.37554"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M8.35156 10.8047L10.7191 11.5034"
            stroke="#818283"
            stroke-width="1.2"
            stroke-linecap="round"
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
                    >
                      <Users />
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

                              {/* Current Company (Tenure) */}
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <p className="text-[#A8A8A8] mr-1">
                                    Current Company
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
                                <p className="text-[#4B5563]">
                                  {candidate.candidate.experience_summary
                                    ?.duration_years
                                    ? `${candidate.candidate.experience_summary.duration_years} ${
                                        candidate.candidate.experience_summary
                                          .duration_years > 1
                                          ? "years"
                                          : "year"
                                      }`
                                    : "--"}
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
                                    Current Salary
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
                                </button>

                                {/* Archive */}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // handleSaveToPipeline(candidate.id, archiveStage.id);
                                  }}
                                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                  aria-label="Archive candidate"
                                  title="Archive candidate"
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
