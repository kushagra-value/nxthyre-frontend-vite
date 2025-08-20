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
} from "lucide-react";
import Header from "./Header";
import { creditService } from "../services/creditService";
import { useAuth } from "../hooks/useAuth";
import CategoryDropdown from "./CategoryDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { pipelineStages, pipelineCandidates } from "../data/pipelineData";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../services/api";
import { jobPostService } from "../services/jobPostService"; // Import jobPostService
import { showToast } from "../utils/toast";
import PipelinesSideCard from "./PipelinePage/PipelinesSideCard";

// Define interfaces for API responses
interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
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
    experience_summary: { title: string; date_range: string };
    education_summary: { title: string; date_range: string };
    notice_period_summary: string;
    skills_list: string[];
    social_links: {
      linkedin: string;
      github: string;
      portfolio: string;
      resume: string;
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

interface SearchedCandidateItem {
  id: number;
  candidate: {
    id: string;
    name: string;
    profile_picture_url: string | null;
    location: string;
    headline: string;
    education: string;
    experience_years: number;
    current_company_duration: string;
    notice_period_days: number;
    current_salary_lpa: number;
    linkedin_url: string;
    resume_url: string;
    github_url: string;
  };
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
  stage_slug: string;
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

interface PipelineCandidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  publicIdentifier: string;
  headline: string;
  summary: string;
  profilePicture: { displayImageUrl: string; artifacts: any[] };
  location: { country: string; city: string };
  industry: string;
  email: string;
  phone: { type: string; number: string };
  positions: Array<{
    title: string;
    companyName: string;
    companyUrn: string;
    startDate: { month: number; year: number };
    endDate?: { month: number; year: number };
    isCurrent: boolean;
    location: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degreeName: string;
    fieldOfStudy: string;
    startDate: { year: number };
    endDate: { year: number };
    activities: string;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    authority: string;
    licenseNumber: string;
    startDate: { month: number; year: number };
    endDate?: { month: number; year: number };
    url: string;
  }>;
  skills: Array<{ name: string; endorsementCount: number }>;
  endorsements: any[];
  recommendations: { received: any[]; given: any[] };
  visibility: {
    profile: "PUBLIC" | "CONNECTIONS" | "PRIVATE";
    email: boolean;
    phone: boolean;
  };
  connections: any[];
  meta: {
    fetchedAt: string;
    dataCompleteness: "full" | "partial";
    source: string;
    scopesGranted: string[];
  };
  external_notes: Note[];
  feedbackNotes: Array<{
    subject: string;
    comment: string;
    author: string;
    date: string;
  }>;
  candidateNotes: Array<{
    comment: string;
    author: string;
    date: string;
  }>;
  stageData: {
    uncontacted?: {
      notes: string[];
    };
    invitesSent?: {
      currentStatus: string;
      notes: string[];
      dateSent: string;
      responseStatus: string;
    };
    applied?: {
      appliedDate: string;
      resumeScore: number;
      skillsMatch: string;
      experienceMatch: string;
      highlights: string;
      notes: string[];
    };
    aiInterview?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    shortlisted?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    firstInterview?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    otherInterviews?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    hrRound?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    salaryNegotiation?: {
      salary: string;
      negotiation: string;
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    offerSent?: {
      offerAcceptanceStatus: string;
      offerSentDate: string;
      followups: string[];
      interviewNotes: string[];
      interviewerName: string;
      interviewerEmail: string;
    };
    archived?: {
      reason: string;
      archivedDate: string;
      notes: string[];
    };
  };
}

interface PipelineStagesProps {
  onBack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogoutModal: () => void;
}

const PipelineStages: React.FC<PipelineStagesProps> = ({
  onBack,
  activeTab,
  setActiveTab,
  onOpenLogoutModal,
}) => {
  const { user } = useAuthContext();
  const [selectedStage, setSelectedStage] = useState("Uncontacted");
  const [selectedCandidate, setSelectedCandidate] =
    useState<PipelineCandidate | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"prospect" | "stage">("prospect"); // New state for view mode

  // States for API data
  const [stages, setStages] = useState<Stage[]>([]);
  const [candidates, setCandidates] = useState<CandidateListItem[] | SearchedCandidateItem[]>([]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null); // Initially null

  // Dynamic category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<"pipeline" | "search">("pipeline"); // New state for toggle
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(
    null
  );

  const [suggestions, setSuggestions] = useState<{id: string, name: string}[]>([]);
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const jobs = await jobPostService.getJobs();
        const mappedCategories: Category[] = jobs.map((job) => ({
          id: job.id,
          name: job.title,
          count: job.total_candidates || 0,
        }));
        setCategories(mappedCategories);
        if (mappedCategories.length > 0) {
          setActiveCategoryId(mappedCategories[0].id);
          setActiveJobId(mappedCategories[0].id);
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
      fetchStages(activeJobId);
    }
  }, [activeJobId]);

  // Fetch candidates when activeJobId or selectedStage changes
  useEffect(() => {
    if (activeJobId !== null && selectedStage) {
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-")
      );
    }
  }, [activeJobId, selectedStage]);

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
      if (currentView === "search" && searchQuery.length > 0 && activeJobId !== null) {
        const fetchSuggestions = async () => {
          try {
            const res = await jobPostService.searchAutosuggest(searchQuery, activeJobId);
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

  // API functions
  const fetchStages = async (jobId: number) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/stages/?job_id=${jobId}`
      );
      const data: Stage[] = response.data;
      setStages(data.sort((a, b) => a.sort_order - b.sort_order));
      setSelectedStage(data[0]?.name || "Uncontacted");
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]);
    }
  };

  const fetchCandidates = async (jobId: number, stageSlug: string) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/?job_id=${jobId}&stage_slug=${stageSlug}`
      );
      const data: CandidateListItem[] = response.data;
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    }
  };

  const fetchCandidateDetails = async (applicationId: number) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/${applicationId}/`
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
      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-")
        );
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
          selectedStage.toLowerCase().replace(" ", "-")
        );
      }
    } catch (error) {
      console.error("Error archiving candidate:", error);
    }
  };

  const bulkMoveCandidates = async (applicationIds: number[]) => {
    try {
      await apiClient.post("/jobs/bulk-move-stage/", {
        application_ids: applicationIds,
      });
      if (activeJobId !== null) {
        fetchCandidates(
          activeJobId,
          selectedStage.toLowerCase().replace(" ", "-")
        );
      }
    } catch (error) {
      console.error("Error bulk moving candidates:", error);
    }
  };

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");

  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const settingsPopupRef = useRef<HTMLDivElement>(null);

  const [cutoffScore, setCutoffScore] = useState("75");
  const [sendAfter, setSendAfter] = useState("24");
  const [sendVia, setSendVia] = useState("email");

  const handleSortSelect = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
  };

  const sortOptions = [
    { value: "", label: "Relevance" },
    { value: "experience_asc", label: "Experience(Asc)" },
    { value: "experience_desc", label: "Experience(Desc)" },
    { value: "notice_period_asc", label: "Notice Period(Asc)" },
    { value: "notice_period_desc", label: "Notice Period(Desc)" },
  ];

  const mapStageData = (
    slug: string,
    contextualDetails: any,
    aiInterviewReport?: any
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
        };
      case "ai-interview":
      case "shortlisted":
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
      data.candidate.ai_interview_report
    );

    return {
      id: data.id.toString(),
      firstName: candidateData.full_name.split(" ")[0] || "",
      lastName: candidateData.full_name.split(" ").slice(1).join(" ") || "",
      fullName: candidateData.full_name,
      publicIdentifier: candidateData.id,
      headline: candidateData.headline,
      summary: candidateData.profile_summary,
      profilePicture: {
        displayImageUrl: candidateData.profile_picture_url || "",
        artifacts: [],
      },
      location: {
        country: candidateData.location.split(", ")[1] || "",
        city: candidateData.location.split(", ")[0] || "",
      },
      industry: "",
      email: candidateData.email || "",
      phone: { type: "number", number: "" },
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
      })),
      certifications: candidateData.certifications.map((cert: any) => ({
        name: cert.name,
        authority: cert.authority,
        licenseNumber: cert.licenseNumber,
        startDate: cert.startDate,
        endDate: cert.endDate,
        url: cert.url,
      })),
      skills: candidateData.skills_data.skills_mentioned.map((skill: any) => ({
        name: skill.skill,
        endorsementCount: skill.number_of_endorsements,
      })),
      endorsements: candidateData.skills_data.endorsements,
      recommendations: { received: candidateData.recommendations, given: [] },
      visibility: { profile: "PUBLIC", email: false, phone: false },
      connections: [],
      meta: {
        fetchedAt: "",
        dataCompleteness: "partial",
        source: "",
        scopesGranted: [],
      },
      external_notes: data.contextual_details.candidate_notes || [],
      feedbackNotes: data.contextual_details.feedback_notes || [],
      candidateNotes: data.candidate.notes || [],
      stageData: {
        [stageProperty]: mappedStageData,
      },
    };
  };

  const mapToComment = (
    note: any,
    index: number,
    type: "feedback" | "note"
  ) => ({
    id: `${type}-${index}`,
    text: note.comment || "",
    author: note.author || "Unknown",
    date: note.date ? new Date(note.date).toLocaleDateString() : "Unknown date",
    avatar: note.author ? note.author[0].toUpperCase() : "U",
    subject: note.subject || "", // Optional for feedback_notes
  });

  // Compute comments from selectedCandidate
  const feedbackComments =
    selectedCandidate?.feedbackNotes?.map((note, index) =>
      mapToComment(note, index, "feedback")
    ) || [];
  const candidateComments =
    selectedCandidate?.candidateNotes?.map((note, index) =>
      mapToComment(note, index, "note")
    ) || [];

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
        : [...prev, candidateId]
    );
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("Adding comment:", newComment, "by user:", user?.fullName);
      setNewComment("");
    }
  };

  const getStageIcon = (stage: string) => {
    const icons = {
      Uncontacted: () => (
        <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.3 7.55469C8.29411 7.55469 9.1 6.71522 9.1 5.67969C9.1 4.64415 8.29411 3.80469 7.3 3.80469C6.30589 3.80469 5.5 4.64415 5.5 5.67969C5.5 6.71522 6.30589 7.55469 7.3 7.55469Z" stroke="#818283" stroke-width="1.2"/>
          <path d="M10.8992 11.3203C10.8992 12.3559 10.8992 13.1953 7.29922 13.1953C3.69922 13.1953 3.69922 12.3559 3.69922 11.3203C3.69922 10.2848 5.31099 9.44531 7.29922 9.44531C9.28741 9.44531 10.8992 10.2848 10.8992 11.3203Z" stroke="#818283" stroke-width="1.2"/>
          <path d="M1 8.5C1 4.96446 1 3.1967 2.05441 2.09835C3.10883 1 4.80588 1 8.2 1H11.8C15.1941 1 16.8912 1 17.9456 2.09835C19 3.1967 19 4.96446 19 8.5C19 12.0355 19 13.8033 17.9456 14.9016C16.8912 16 15.1941 16 11.8 16H8.2C4.80588 16 3.10883 16 2.05441 14.9016C1 13.8033 1 12.0355 1 8.5Z" stroke="#818283" stroke-width="1.2"/>
          <path d="M16.2992 8.49219H12.6992" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M16.3008 5.69531H11.8008" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M16.3016 11.3125H13.6016" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      ),
      "Invites Sent": Send,
      Applied: () => (
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9616 10.5818L16.3845 8.84325C16.8782 6.81385 17.125 5.79915 16.9391 4.92102C16.7924 4.22766 16.4622 3.59781 15.9905 3.11112C15.393 2.49474 14.4718 2.22285 12.6294 1.67907C10.787 1.13529 9.86574 0.863399 9.06859 1.06815C8.43909 1.22981 7.86727 1.59346 7.42544 2.1131C6.94633 2.67655 6.69648 3.50142 6.32469 5.00074C6.26225 5.25253 6.19637 5.52334 6.12539 5.81514L5.70243 7.55386C5.20876 9.58326 4.96192 10.5979 5.14781 11.4761C5.29458 12.1695 5.62471 12.7993 6.09647 13.286C6.69393 13.9024 7.61514 14.1743 9.45757 14.7181C11.1182 15.2082 12.0304 15.4774 12.778 15.3758C12.8599 15.3648 12.9397 15.3492 13.0184 15.329C13.6478 15.1673 14.2196 14.8037 14.6615 14.284C15.221 13.6259 15.4679 12.6113 15.9616 10.5818Z" stroke="#818283" stroke-width="1.2"/>
<path d="M12.7771 15.3829C12.6068 15.9575 12.3073 16.4773 11.9046 16.8928C11.3071 17.5092 10.3858 17.781 8.54349 18.3249C6.70104 18.8686 5.77984 19.1405 4.98262 18.9357C4.35316 18.7741 3.78135 18.4105 3.3395 17.8908C2.77992 17.2327 2.53308 16.218 2.03941 14.1886L1.61649 12.45C1.12282 10.4206 0.875986 9.40594 1.06187 8.52779C1.20864 7.83446 1.53877 7.2046 2.01053 6.71791C2.60799 6.10153 3.52919 5.82965 5.3716 5.28586C5.72017 5.18298 6.03576 5.08984 6.32377 5.00781" stroke="#818283" stroke-width="1.2"/>
<path d="M8.98828 8.21094L12.9341 9.37554" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
<path d="M8.35156 10.8047L10.7191 11.5034" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
</svg>

      ),
      "Coding Round": () => (
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.38889 4.16233L1 7.29052L4.38889 10.9401M12.8611 4.16233L16.25 7.29052L12.8611 10.9401M10.3194 0.773438L6.93056 14.329" stroke="#818283" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      ),
      "AI Interview": () => (
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.6667 9.33333C17.6667 13.9357 13.9357 17.6667 9.33333 17.6667C4.73096 17.6667 1 13.9357 1 9.33333C1 4.73096 4.73096 1 9.33333 1C13.9357 1 17.6667 4.73096 17.6667 9.33333Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M11.832 6.83594C11.832 8.21669 10.7128 9.33594 9.33203 9.33594C7.95128 9.33594 6.83203 8.21669 6.83203 6.83594C6.83203 5.45523 7.95128 4.33594 9.33203 4.33594C10.7128 4.33594 11.832 5.45523 11.832 6.83594Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M9.33203 14.3385V12.6719" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M1 17.6693L3.08333 15.5859" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M17.6654 17.6693L15.582 15.5859" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        </svg>

      ),
      Shortlisted: () => (
        <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.603 1H7.39705C4.37448 1 2.8632 1 1.9242 1.9519C1.22129 2.66447 1.04456 3.70215 1.00013 5.46423C0.994434 5.69014 1.17697 5.87067 1.39261 5.92797C2.0806 6.11071 2.58817 6.74527 2.58817 7.5C2.58817 8.25473 2.0806 8.88929 1.39261 9.07203C1.17697 9.12931 0.994434 9.30984 1.00013 9.5358C1.04456 11.2979 1.22129 12.3355 1.9242 13.0481C2.8632 14 4.37448 14 7.39705 14H10.603C13.6255 14 15.1368 14 16.0759 13.0481C16.7787 12.3355 16.9555 11.2979 16.9999 9.5358C17.0056 9.30984 16.8231 9.12931 16.6074 9.07203C15.9195 8.88929 15.4119 8.25473 15.4119 7.5C15.4119 6.74527 15.9195 6.11071 16.6074 5.92797C16.8231 5.87067 17.0056 5.69014 16.9999 5.46423C16.9555 3.70215 16.7787 2.66447 16.0759 1.9519C15.1368 1 13.6255 1 10.603 1Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M8.31828 5.89328C8.62228 5.33943 8.77428 5.0625 9.00156 5.0625C9.22884 5.0625 9.38084 5.33943 9.68485 5.89328L9.76349 6.03661C9.84981 6.19399 9.89301 6.27264 9.96037 6.32456C10.0277 6.37647 10.1116 6.39581 10.2793 6.43433L10.432 6.46942C11.0224 6.60511 11.3176 6.67288 11.3878 6.90224C11.458 7.13161 11.2568 7.37057 10.8544 7.84856L10.7502 7.97222C10.6359 8.10799 10.5787 8.17592 10.5529 8.25993C10.5272 8.34394 10.5359 8.43454 10.5532 8.61581L10.5689 8.78074C10.6297 9.41847 10.6602 9.7373 10.4764 9.87908C10.2924 10.0208 10.0161 9.89159 9.4634 9.63314L9.32044 9.56627C9.16332 9.49282 9.08484 9.45609 9.00156 9.45609C8.91828 9.45609 8.8398 9.49282 8.68268 9.56627L8.53972 9.63314C7.987 9.89159 7.71068 10.0208 7.52676 9.87908C7.34295 9.7373 7.37337 9.41847 7.4342 8.78074L7.44996 8.61581C7.46724 8.43454 7.47588 8.34394 7.4502 8.25993C7.42444 8.17592 7.36727 8.10799 7.25291 7.97222L7.14878 7.84856C6.74634 7.37057 6.54512 7.13161 6.61534 6.90224C6.68557 6.67288 6.98073 6.60511 7.57108 6.46942L7.7238 6.43433C7.89156 6.39581 7.9754 6.37647 8.04276 6.32456C8.11012 6.27264 8.15332 6.19399 8.23964 6.03661L8.31828 5.89328Z" stroke="#818283" stroke-width="1.2"/>
        </svg>

      ),
      "First Interview": () => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.83333 7.66667C8.67428 7.66667 10.1667 6.17428 10.1667 4.33333C10.1667 2.49238 8.67428 1 6.83333 1C4.99238 1 3.5 2.49238 3.5 4.33333C3.5 6.17428 4.99238 7.66667 6.83333 7.66667Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M11.832 6.83594C13.2128 6.83594 14.332 5.71665 14.332 4.33594C14.332 2.95523 13.2128 1.83594 11.832 1.83594" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M6.83333 16.8385C10.055 16.8385 12.6667 15.3462 12.6667 13.5052C12.6667 11.6643 10.055 10.1719 6.83333 10.1719C3.61167 10.1719 1 11.6643 1 13.5052C1 15.3462 3.61167 16.8385 6.83333 16.8385Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M14.332 11C15.7939 11.3206 16.832 12.1324 16.832 13.0833C16.832 13.9411 15.9873 14.6857 14.7487 15.0587" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        </svg>

      ),
      "Other Interviews": () => (
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.1654 7.66667C12.0063 7.66667 13.4987 6.17428 13.4987 4.33333C13.4987 2.49238 12.0063 1 10.1654 1C8.32442 1 6.83203 2.49238 6.83203 4.33333C6.83203 6.17428 8.32442 7.66667 10.1654 7.66667Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M15.168 6.83854C16.5487 6.83854 17.668 5.9058 17.668 4.75521C17.668 3.60462 16.5487 2.67188 15.168 2.67188" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5.16797 6.83854C3.78726 6.83854 2.66797 5.9058 2.66797 4.75521C2.66797 3.60462 3.78726 2.67188 5.16797 2.67188" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M10.168 16.8385C12.9294 16.8385 15.168 15.3462 15.168 13.5052C15.168 11.6643 12.9294 10.1719 10.168 10.1719C7.40654 10.1719 5.16797 11.6643 5.16797 13.5052C5.16797 15.3462 7.40654 16.8385 10.168 16.8385Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M16.832 15.1667C18.2939 14.8461 19.332 14.0342 19.332 13.0833C19.332 12.1324 18.2939 11.3206 16.832 11" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M3.5 15.1667C2.03812 14.8461 1 14.0342 1 13.0833C1 12.1324 2.03812 11.3206 3.5 11" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        </svg>

      ),
      "HR Round": () => (
        <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9.80225H12.6667M6 9.80225V13.8016C6 15.3099 6 16.064 6.48816 16.5326C6.97631 17.0011 7.762 17.0011 9.33333 17.0011C10.9047 17.0011 11.6903 17.0011 12.1785 16.5326C12.6667 16.064 12.6667 15.3099 12.6667 13.8016V9.80225M6 9.80225C3.70175 9.31201 1.88931 7.61755 1.31831 5.42523L1 4.20312M12.6667 9.80225C14.0922 9.80225 15.2922 10.8264 15.4587 12.1855L16 16.6012" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M9.33333 7.399C11.1743 7.399 12.6667 5.96654 12.6667 4.1995C12.6667 2.43246 11.1743 1 9.33333 1C7.49238 1 6 2.43246 6 4.1995C6 5.96654 7.49238 7.399 9.33333 7.399Z" stroke="#818283" stroke-width="1.2"/>
        </svg>

      ),
      "Offer Sent": () => (
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.33333 17.6667H11.8333C15.055 17.6667 17.6667 15.055 17.6667 11.8333V9.33333C17.6667 5.40496 17.6667 3.44077 16.4462 2.22039C15.2259 1 13.2617 1 9.33333 1C5.40496 1 3.44077 1 2.22039 2.22039C1 3.44077 1 5.40496 1 9.33333C1 13.2617 1 15.2259 2.22039 16.4462C3.44077 17.6667 5.40496 17.6667 9.33333 17.6667Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M11.832 17.6693C11.832 16.1182 11.832 15.3427 12.0359 14.715C12.4481 13.4465 13.4426 12.452 14.7111 12.0399C15.3388 11.8359 16.1143 11.8359 17.6654 11.8359" stroke="#818283" stroke-width="1.2"/>
        <path d="M4 5.5H15" stroke="#818283" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 9H10" stroke="#818283" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      ),
      "Offer Accepted": () => (
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.33333 17.6667H11.8333C15.055 17.6667 17.6667 15.055 17.6667 11.8333V9.33333C17.6667 5.40496 17.6667 3.44077 16.4462 2.22039C15.2259 1 13.2617 1 9.33333 1C5.40496 1 3.44077 1 2.22039 2.22039C1 3.44077 1 5.40496 1 9.33333C1 13.2617 1 15.2259 2.22039 16.4462C3.44077 17.6667 5.40496 17.6667 9.33333 17.6667Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M6 9L7.66666 11L11 7" stroke="#818283" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.832 17.6693C11.832 16.1182 11.832 15.3427 12.0359 14.715C12.4481 13.4465 13.4426 12.452 14.7111 12.0399C15.3388 11.8359 16.1143 11.8359 17.6654 11.8359" stroke="#818283" stroke-width="1.2"/>
        </svg>

      ),
      Archives: () => (
        <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.60156 8.5C6.60156 8.11175 6.60156 7.91758 6.66246 7.76442C6.74365 7.56025 6.89939 7.398 7.09542 7.31342C7.24243 7.25 7.42884 7.25 7.80156 7.25H10.2016C10.5743 7.25 10.7607 7.25 10.9077 7.31342C11.1037 7.398 11.2595 7.56025 11.3407 7.76442C11.4016 7.91758 11.4016 8.11175 11.4016 8.5C11.4016 8.88825 11.4016 9.08242 11.3407 9.23558C11.2595 9.43975 11.1037 9.602 10.9077 9.68658C10.7607 9.75 10.5743 9.75 10.2016 9.75H7.80156C7.42884 9.75 7.24243 9.75 7.09542 9.68658C6.89939 9.602 6.74365 9.43975 6.66246 9.23558C6.60156 9.08242 6.60156 8.88825 6.60156 8.5Z" stroke="#818283" stroke-width="1.2"/>
        <path d="M15.7992 4.33594V9.33594C15.7992 12.4786 15.7992 14.05 14.8619 15.0263C13.9247 16.0026 12.4162 16.0026 9.39922 16.0026H8.59922C5.58223 16.0026 4.07374 16.0026 3.13647 15.0263C2.19922 14.05 2.19922 12.4786 2.19922 9.33594V4.33594" stroke="#818283" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M1 2.66667C1 1.88099 1 1.48816 1.23431 1.24408C1.46863 1 1.84575 1 2.6 1H15.4C16.1542 1 16.5314 1 16.7657 1.24408C17 1.48816 17 1.88099 17 2.66667C17 3.45234 17 3.84517 16.7657 4.08926C16.5314 4.33333 16.1542 4.33333 15.4 4.33333H2.6C1.84575 4.33333 1.46863 4.33333 1.23431 4.08926C1 3.84517 1 3.45234 1 2.66667Z" stroke="#818283" stroke-width="1.2"/>
        </svg>

      ),
    };
  return icons[stage as keyof typeof icons] || (() => <Users className="w-4 h-4 " />);
};


  const getStageDescription = (stageName: string) => {
    switch (stageName) {
      case "Uncontacted":
        return {
          text: "5 candidates sent you a message",
          color: "text-blue-600",
        };
      case "Applied":
        return { text: "5 new candidates", color: "text-blue-600" };
      case "Coding Round":
        return {
          text: "Average 15% are only passing the round",
          color: "text-orange-600",
        };
      case "AI Interview":
        return {
          text: "95% of candidates are above par score",
          color: "text-orange-600",
        };
      case "Shortlisted":
        return { text: "", color: "text-orange-600" };
      case "First Interview":
        return { text: "inactive for 2 days", color: "text-gray-500" };
      case "Other Interview":
        return { text: "8 new notes updated", color: "text-blue-600" };
      case "HR Round":
        return { text: "2 new candidates", color: "text-blue-600" };
      case "Offer Sent":
        return { text: "10 new offers", color: "text-blue-600" };
      case "Offer Accepted":
        return { text: "1 new offer accepted", color: "text-blue-600" };
      default:
        return { text: "", color: "" };
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
      count: stages.find((s) => s.name === "Uncontacted")?.candidate_count || 0 
    },
    {
      id: "invited",
      label: "Invited",
       count: stages.find((s) => s.name === "Invites Sent")?.candidate_count || 0 },
    {
      id: "inbox",
      label: "Inbox",
      count: stages.find((s) => s.name === "Applied")?.candidate_count || 0 },
  ];

  // Filter stages based on active tab
  const filteredStages = stages.filter((stage) => !["Uncontacted", "Invites Sent"].includes(stage.name));

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

  const deductCredits = async () => {
    try {
      const data = await creditService.getCreditBalance();
      setCredits(data.credit_balance);
    } catch (error) {
      showToast.error("Failed to update credit balance");
    }
  };

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

const handleSuggestionSelect = async (sug: {id: string, name: string}) => {
    setSearchQuery(sug.name);
    setSuggestions([]);
    if (activeJobId) {
      try {
        setCandidates([]);
        const res = await jobPostService.getSearchedCandidate(sug.id, activeJobId);
        const stageName = res.current_stage.name;
        setSelectedStage(stageName);
        if (stageName === "Uncontacted") {
          setActiveTab("uncontacted");
          setViewMode("prospect");
        } else if (stageName === "Invites Sent") {
          setActiveTab("invited");
          setViewMode("prospect");
        } else if (stageName === "Inbox") {
          setActiveTab("inbox");
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

  console.log(
    "Transferred stage data PipelineStages :::::::::::::::::::: ",
    selectedCandidate?.stageData
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-20 bg-white will-change-transform">
        <Header
          onOpenLogoutModal={handleOpenLogoutModal}
          credits={credits}
          onBack={onBack}
          showCreateRoleButton={false}
          showLinkedinSearchButton={false}
        />
      </div>

      <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-2">
        <div className="flex w-full gap-3 h-full">
          <div className="lg:w-[25%] order-2 lg:order-1">
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
                      <div className="absolute top-10 z-10 w-[90%] bg-white shadow-lg mt-1 rounded-lg max-h-60 overflow-y-auto border border-gray-200">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                            onClick={() => {
                              setActiveJobId(category.id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{category.name}</span>
                            <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">
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
                <button
                  onClick={() => {
                    setViewMode("prospect");
                    setSelectedStage("Uncontacted");
                    setActiveTab("uncontacted");
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    viewMode === "prospect" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >

                  {viewMode === "prospect" && <div className="w-1 h-8 bg-blue-500 rounded-tr-xl rounded-br-xl rounded" />}

                  {(() => {
                    const ProspectIcon = getStageIcon("Uncontacted");
                    return <ProspectIcon className={`w-4 h-4 ${viewMode === "prospect" ? "text-blue-600" : "text-gray-600"}`} />;
                  })()} 

                  <div className="flex items-center justify-between w-full">

                  <div className="flex flex-col items-start justify-center">
                    <span className="flex-1 font-medium">
                      Prospect
                    </span>
                    
                      <p className={`text-xs text-blue-600`}>
                        5 candidates sent you a message
                      </p>
                 
                  </div>
                  <span
                    className={`px-2 py-1 text-sm ${
                      viewMode === "prospect" ? "text-blue-800" : "text-gray-400"
                    }`}
                  >
                    {[
                      stages.find((s) => ["Uncontacted"].includes(s.name))?.candidate_count || 0,
                      stages.find((s) => ["Invites Sent"].includes(s.name))?.candidate_count || 0,
                    ].reduce((sum, count) => sum + count, 0)}
                  </span>
                  </div>
                </button>
                {filteredStages.length > 0
                  ? filteredStages.map((stage) => {
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
                            return <StageIcon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />;
                          })()}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start justify-center">
                              <span className="flex-1 font-medium">
                                {stage.name}
                              </span>
                              {description.text && (
                                <p className={`text-xs ${description.color}`}>
                                  {description.text}
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
                    })
                  : pipelineStages.filter(stage => !["Uncontacted", "Invites Sent"].includes(stage)).map((stage) => {
                      const Icon = getStageIcon(stage);
                      const isSelected = selectedStage === stage;
                      const candidateCount =
                        pipelineCandidates[stage]?.length || 0;
                      const description = getStageDescription(stage);
                      return (
                        <button
                          key={stage}
                          onClick={() => handleStageSelect(stage)}
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
                            const StageIcon = getStageIcon(stage);
                            return <StageIcon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />;
                          })()}
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-start justify-center">
                              <span className="flex-1 font-medium">
                                {stage}
                              </span>
                              {description.text && (
                                <p className={`text-xs ${description.color}`}>
                                  {description.text}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-sm ${
                                isSelected ? "text-blue-800" : "text-gray-400"
                              }`}
                            >
                              {candidateCount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
              </div>
            </div>
          </div>

          <div className="lg:w-[45%] order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm h-fit">
              {viewMode === "prospect" && (
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                  <div className="flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id === "uncontacted") setSelectedStage("Uncontacted");
                            else if (tab.id === "invited") setSelectedStage("Invites Sent");
                            else if (tab.id === "inbox") setSelectedStage("Inbox");
                          }}
                        className={`py-2 text-sm lg:text-base font-[400] rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 focus-visible:border-b-2 focus-visible:border-blue-600 ${
                          activeTab === tab.id
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
                            : []
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
                            selectedCandidates.map((id) => parseInt(id))
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

                    <div className="relative">
                      <button
                        className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSettingsPopup(!showSettingsPopup);
                        }}
                        aria-label="Open settings"
                      >
                        <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 text-xs lg:text-base font-[400] mr-1">
                          <path d="M3.95966 2.38894C5.19943 1.64006 5.81934 1.26562 6.5 1.26562C7.18066 1.26562 7.80057 1.64006 9.04033 2.38894L9.45967 2.64223C10.6994 3.39111 11.3193 3.76555 11.6597 4.38229C12 4.99904 12 5.74792 12 7.2457V7.75222C12 9.25003 12 9.9989 11.6597 10.6156C11.3193 11.2324 10.6994 11.6068 9.45967 12.3557L9.04033 12.609C7.80057 13.3579 7.18066 13.7323 6.5 13.7323C5.81934 13.7323 5.19943 13.3579 3.95966 12.609L3.54034 12.3557C2.30057 11.6068 1.68068 11.2324 1.34034 10.6156C1 9.9989 1 9.25003 1 7.75222V7.2457C1 5.74792 1 4.99904 1.34034 4.38229C1.68068 3.76555 2.30057 3.39111 3.54034 2.64223L3.95966 2.38894Z" stroke="#818283"/>
                          <path d="M6.5013 9.37281C7.51382 9.37281 8.33464 8.53559 8.33464 7.50281C8.33464 6.47004 7.51382 5.63281 6.5013 5.63281C5.48878 5.63281 4.66797 6.47004 4.66797 7.50281C4.66797 8.53559 5.48878 9.37281 6.5013 9.37281Z" stroke="#818283"/>
                        </svg>
                        Settings
                      </button>
                      {showSettingsPopup && (
                      <div
                        ref={settingsPopupRef}
                        className="absolute top-full right-0 mt-2 p-4 w-96 bg-white border border-gray-200 rounded-md shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="border-b border-gray-400">
                          <div className="pb-4" >
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cutoff Score
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={cutoffScore}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                    setCutoffScore(value);
                                  }
                                }}
                                className="w-8 px-2 py-1 text-blue-500 bg-blue-50 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="75"
                                aria-label="Cutoff score (0-100)"
                              />
                              <span className="text-sm text-gray-500">/ 100</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <span className=" text-sm font-medium text-gray-700">Follow Up</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm font-medium text-gray-700">Send After</label>
                              <select
                                value={sendAfter}
                                onChange={(e) => setSendAfter(e.target.value)}
                                className="w-20 px-2 py-1 text-blue-500 border bg-blue-50 border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                aria-label="Send after hours"
                              >
                                <option value="1">1 hr</option>
                                <option value="2">2 hrs</option>
                                <option value="4">4 hrs</option>
                                <option value="8">8 hrs</option>
                                <option value="24">24 hrs</option>
                              </select>
                              
                              <label className="text-sm font-medium text-gray-700">Via</label>
                              <select
                                value={sendVia}
                                onChange={(e) => setSendVia(e.target.value)}
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
                        const isSearched = "current_stage" in candidate;
                        const fullName = isSearched ? candidate.candidate.name : candidate.candidate.full_name;
                        const avatar = isSearched ? candidate.candidate.profile_picture_url || "" : candidate.candidate.avatar;
                        const headline = candidate.candidate.headline;
                        const location = candidate.candidate.location;
                        const linkedinUrl = candidate.candidate.linkedin_url;
                        const isBackgroundVerified = isSearched ? false : candidate.candidate.is_background_verified;
                        const experienceYears = isSearched ? candidate.candidate.experience_years.toString() : candidate.candidate.experience_years;
                        const experienceSummaryTitle = isSearched ? headline : candidate.candidate.experience_summary?.title;
                        const experienceSummaryDateRange = isSearched ? candidate.candidate.current_company_duration : candidate.candidate.experience_summary?.date_range;
                        const educationSummaryTitle = isSearched ? candidate.candidate.education : candidate.candidate.education_summary?.title;
                        const noticePeriodSummary = isSearched ? `${candidate.candidate.notice_period_days} days` : candidate.candidate.notice_period_summary;
                        const skillsList = isSearched ? [] : candidate.candidate.skills_list;
                        const socialLinks = {
                          linkedin: linkedinUrl,
                          github: isSearched ? candidate.candidate.github_url : candidate.candidate.social_links?.github,
                          portfolio: isSearched ? "" : candidate.candidate.social_links?.portfolio,
                          resume: isSearched ? candidate.candidate.resume_url : candidate.candidate.social_links?.resume,
                        };
                        const currentSalary = isSearched ? `${candidate.candidate.current_salary_lpa} LPA` : "9LPA";
                        return (
                        <div
                          key={candidate.id}
                          className={`pt-5 hover:bg-blue-50 transition-colors cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                            selectedCandidate?.id === candidate.id.toString()
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : "border border-gray-200"
                          }`}
                          onClick={() => handleCandidateSelect(candidate)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Select candidate ${candidate.full_name}`}
                        >
                          <div className="flex px-4 items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(
                                candidate.id.toString()
                              )}
                              onChange={() =>
                                handleCandidateCheckbox(candidate.id.toString())
                              }
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select  ${fullName}`}
                            />
                            <div className="border-b border-[#E2E2E2] flex items-center space-x-3 pb-5 w-full">
                              <div
                                className={`w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-base font-[600] `}
                              >
                                {fullName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2 pr-4">
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <h3 className="text-xs lg:text-base font-[400] text-gray-900">
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
                                  <div className="flex space-x-1">
                                    <p className="flex items-center gap-2 text-xs lg:text-base font-[400] text-[#4B5563] mt-1">
                                      <MapPin className=" w-4 h-4" />

                                      {location.split(
                                        ","
                                      )[0] }
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                    {experienceSummaryTitle}
                                  </p>
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1">
                                    |
                                  </p>
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                    {educationSummaryTitle}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="pt-5 pl-12 flex space-x-12 gap-2 text-xs lg:text-base font-[400px] ml-1">
                             {experienceYears && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Experience
                                </p>
                                <p className="text-[#4B5563]">
                                  {experienceYears}
                                </p>
                              </div>
                            )}
                            {/* need to update the current Company Data */}
                            {(isSearched ? experienceSummaryDateRange : candidate.candidate.experience_summary?.date_range) && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Current Company
                                </p>
                                <p className="text-[#4B5563]">
                                  {isSearched ? experienceSummaryDateRange : candidate.candidate.experience_summary?.date_range}
                                </p>
                              </div>
                            )}
                            {noticePeriodSummary && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Notice Period
                                </p>
                                <p className="text-[#4B5563]">
                                  {noticePeriodSummary}
                                </p>
                              </div>
                            )}
                            {/* need to update the code for Current Salary */}
                            {true && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Current Salary
                                </p>
                                <p className="text-[#4B5563]">9LPA</p>
                              </div>
                            )}
                          </div>
                          <div className="p-3 pl-12 mt-5 bg-[#F5F9FB] flex items-center justify-between space-x-2 flex-wrap gap-2 rounded-lg">
                            <div className="flex items-center space-x-1">
                              {socialLinks.github && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      socialLinks.github,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${fullName}'s GitHub profile`}
                                >
                                  <Github className="w-4 h-4" />
                                </button>
                              )}
                              {socialLinks.linkedin && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      socialLinks.linkedin
                                        ?.linkedin,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${fullName}'s LinkedIn profile`}
                                >
                                  <Linkedin className="w-4 h-4" />
                                </button>
                              )}
                              {socialLinks.resume && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      socialLinks.resume,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${fullName}'s resume`}
                                >
                                  <File className="w-4 h-4" />
                                </button>
                              )}
                              {socialLinks.portfolio && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      socialLinks.portfolio,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${fullName}'s portfolio`}
                                >
                                  <Link className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="rounded-md flex space-x-1 items-center text-xs lg:text-base font-[400] text-[#4B5563]">
                              
                              <div className="rounded-md flex space-x-1 items-center text-xs lg:text-base font-[400]">
                                {candidate.status_tags.map((tag: {text: string, color: string}, idx: number) => (
                                  <span key={idx} className={`text-${tag.color}-500`}>{tag.text}</span>
                                ))}
                              </div>
                            
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-[30%] order-3 relative">
            <PipelinesSideCard
              selectedCandidate={selectedCandidate}
              showComments={showComments}
              setShowComments={setShowComments}
              feedbackComments={feedbackComments}
              candidateComments={candidateComments}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              selectedStage={selectedStage}
              stages={stages}
              moveCandidate={moveCandidate}
              archiveCandidate={archiveCandidate}
              stageData={selectedCandidate?.stageData}
              jobId={activeJobId ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStages;
