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
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
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
      summary: "",
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
      Uncontacted: User,
      "Invites Sent": Send,
      Applied: FileText,
      "AI Interview": Target,
      Shortlisted: Star,
      "First Interview": Users,
      "Other Interviews": Users,
      "HR Round": Users,
      "Salary Negotiation": BarChart3,
      "Offer Sent": CheckCircle,
      Archives: AlertCircle,
    };
    return icons[stage as keyof typeof icons] || User;
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
          searchQuery={""}
          setSearchQuery={() => {}}
          showCreateRoleButton={false}
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
                      <div className="absolute top-4 z-10 w-full bg-white shadow-lg mt-1 rounded-lg max-h-60 overflow-y-auto border border-gray-200">
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
                      <LogOut className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Candidates"
                        className="w-full px-3 py-2 border border-blue-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-blue-600 bg-white"
                      />
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
                  className={`w-full flex items-center space-x-3 pr-3 py-2 rounded-lg text-left transition-colors ${
                    viewMode === "prospect" ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {viewMode === "prospect" && <div className="w-1 h-8 bg-blue-500 rounded-tr-xl rounded-br-xl rounded" />}
                  <User className={`w-4 h-4 ${viewMode === "prospect" ? "text-blue-600" : "text-gray-600"}`} />
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
                          className={`w-full flex items-center space-x-3 pr-3 py-2 rounded-lg text-left transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1 h-8 bg-blue-500 rounded-tr-xl rounded-br-xl  rounded" />
                          )}
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
                          <span className="flex-1 font-medium">{stage}</span>
                          {description.text && (
                            <p className={`text-xs ${description.color}`}>
                              {description.text}
                            </p>
                          )}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              isSelected
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {candidateCount}
                          </span>
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

                    <button
                      className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      aria-label="upload selected candidates"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-400 text-xs lg:text-base font-[400] mr-1"
                      >
                        <path
                          d="M7.84594 1.5587C7.75713 1.46158 7.63163 1.40625 7.5 1.40625C7.36838 1.40625 7.24288 1.46158 7.15407 1.5587L4.65405 4.29307C4.47937 4.48414 4.49264 4.78064 4.6837 4.95533C4.87477 5.13001 5.17127 5.11674 5.34595 4.92568L7.03125 3.08237V10C7.03125 10.2589 7.24113 10.4688 7.5 10.4688C7.75888 10.4688 7.96875 10.2589 7.96875 10V3.08237L9.65407 4.92568C9.82875 5.11674 10.1253 5.13001 10.3163 4.95533C10.5074 4.78064 10.5206 4.48414 10.3459 4.29307L7.84594 1.5587Z"
                          fill="#818283"
                        />
                        <path
                          d="M2.34375 9.375C2.34375 9.11612 2.13389 8.90625 1.875 8.90625C1.61612 8.90625 1.40625 9.11612 1.40625 9.375V9.40931C1.40624 10.2641 1.40623 10.953 1.47908 11.4949C1.55471 12.0574 1.71652 12.5311 2.09272 12.9072C2.46892 13.2835 2.94259 13.4453 3.50516 13.5209C4.04701 13.5937 4.73596 13.5937 5.59071 13.5937H9.40931C10.2641 13.5937 10.953 13.5937 11.4949 13.5209C12.0574 13.4453 12.5311 13.2835 12.9073 12.9072C13.2835 12.5311 13.4453 12.0574 13.5209 11.4949C13.5937 10.953 13.5938 10.2641 13.5938 9.40931V9.375C13.5938 9.11612 13.3839 8.90625 13.125 8.90625C12.8661 8.90625 12.6562 9.11612 12.6562 9.375C12.6562 10.2721 12.6553 10.8978 12.5918 11.3699C12.5301 11.8286 12.4174 12.0714 12.2444 12.2444C12.0714 12.4174 11.8286 12.5301 11.3699 12.5918C10.8978 12.6552 10.2721 12.6562 9.375 12.6562H5.625C4.72787 12.6562 4.10217 12.6552 3.63008 12.5918C3.17147 12.5301 2.92861 12.4174 2.75563 12.2444C2.58266 12.0714 2.46988 11.8286 2.40822 11.3699C2.34474 10.8978 2.34375 10.2721 2.34375 9.375Z"
                          fill="#818283"
                        />
                      </svg>
                      Upload
                    </button>

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
                      {currentCandidates.map((candidate: any) => (
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
                              aria-label={`Select ${candidate.full_name}`}
                            />
                            <div className="border-b border-[#E2E2E2] flex items-center space-x-3 pb-5 w-full">
                              <div
                                className={`w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-base font-[600] `}
                              >
                                {(
                                  candidate.candidate?.full_name ||
                                  candidate.fullName
                                )
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2 pr-4">
                                  <div className="flex items-center space-x-2 flex-wrap">
                                    <h3 className="text-xs lg:text-base font-[400] text-gray-900">
                                      {candidate.candidate?.full_name ||
                                        candidate.fullName}
                                    </h3>
                                    {candidate.is_background_verified && (
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

                                      {candidate.candidate?.location.split(
                                        ","
                                      )[0] ||
                                        `${candidate.location.city}, ${candidate.location.country}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                    {candidate.candidate?.experience_summary
                                      ?.title ||
                                      candidate.experience_summary?.title}
                                  </p>
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1">
                                    |
                                  </p>
                                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                                    {candidate.candidate?.education_summary
                                      ?.title ||
                                      candidate.education_summary?.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="pt-5 pl-12 flex space-x-12 gap-2 text-xs lg:text-base font-[400px] ml-1">
                            {candidate.candidate?.experience_years && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Experience
                                </p>
                                <p className="text-[#4B5563]">
                                  {candidate.candidate?.experience_years}
                                </p>
                              </div>
                            )}
                            {/* need to update the current Company Data */}
                            {candidate.candidate?.experience_years && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Current Company
                                </p>
                                <p className="text-[#4B5563]">
                                  {candidate.candidate?.experience_years}
                                </p>
                              </div>
                            )}
                            {candidate.candidate?.notice_period_summary && (
                              <div className="flex flex-col">
                                <p className="text-[#A8A8A8] mr-[5px]">
                                  Notice Period
                                </p>
                                <p className="text-[#4B5563]">
                                  {candidate.candidate?.notice_period_summary}
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
                              {candidate.candidate?.social_links?.github && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      candidate.candidate?.social_links?.github,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${candidate.candidate?.full_name}'s GitHub profile`}
                                >
                                  <Github className="w-4 h-4" />
                                </button>
                              )}
                              {candidate.candidate?.social_links?.linkedin && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      candidate.candidate?.social_links
                                        ?.linkedin,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${candidate.candidate?.full_name}'s LinkedIn profile`}
                                >
                                  <Linkedin className="w-4 h-4" />
                                </button>
                              )}
                              {candidate.candidate?.social_links?.resume && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      candidate.candidate?.social_links?.resume,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${candidate.candidate?.full_name}'s resume`}
                                >
                                  <File className="w-4 h-4" />
                                </button>
                              )}
                              {candidate.candidate?.social_links?.portfolio && (
                                <button
                                  className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={() =>
                                    window.open(
                                      candidate.candidate?.social_links
                                        ?.portfolio,
                                      "_blank"
                                    )
                                  }
                                  aria-label={`View ${candidate.full_name}'s portfolio`}
                                >
                                  <Link className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="rounded-md flex space-x-1 items-center text-xs lg:text-base font-[400] text-[#4B5563]">
                              3 days ago
                            </div>
                          </div>
                        </div>
                      ))}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStages;
