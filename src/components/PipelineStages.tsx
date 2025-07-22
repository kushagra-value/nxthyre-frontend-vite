import React, { useState, useEffect } from "react";
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
  Edit,
  Archive,
  Trash2,
} from "lucide-react";
import Header from "./Header";
import CategoryDropdown from "./CategoryDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { pipelineStages, pipelineCandidates } from "../data/pipelineData";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../services/api";
import { jobPostService } from "../services/jobPostService"; // Import jobPostService

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

  // States for API data
  const [stages, setStages] = useState<Stage[]>([]);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [activeJobId, setActiveJobId] = useState<number | null>(null); // Initially null

  // Dynamic category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCategoryActions, setShowCategoryActions] = useState<number | null>(
    null
  );
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // const tabs = [
  //   { id: "outbound", label: "Outbound", count: 2325 },
  //   { id: "active", label: "Active", count: 2034 },
  //   { id: "inbound", label: "Inbound", count: 2034 },
  //   { id: "prevetted", label: "Prevetted", count: 2034 },
  // ];

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

  const mapStageData = (slug: string, contextualDetails: any) => {
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
        return {
          interviewedDate: "", // Placeholder; no interview date provided in API
          resumeScore:
            Number(contextualDetails.ai_interview_report?.score?.resume) || 0,
          knowledgeScore:
            Number(contextualDetails.ai_interview_report?.score?.knowledge) ||
            0,
          technicalScore:
            Number(contextualDetails.ai_interview_report?.score?.technical) ||
            0,
          communicationScore:
            Number(
              contextualDetails.ai_interview_report?.score?.communication
            ) || 0,
          integrityScore:
            Number(contextualDetails.ai_interview_report?.integrity_score) || 0,
          proctoring: {
            deviceUsage:
              Number(
                contextualDetails.ai_interview_report?.proctoring?.device_usage
              ) || 0,
            assistance:
              Number(
                contextualDetails.ai_interview_report?.proctoring?.assistance
              ) || 0,
            referenceMaterial:
              Number(
                contextualDetails.ai_interview_report?.proctoring
                  ?.reference_material
              ) || 0,
            environment:
              Number(
                contextualDetails.ai_interview_report?.proctoring?.environment
              ) || 0,
          },
          questions: contextualDetails.ai_interview_report?.questions || [],
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
      data.contextual_details
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
      stageData: {
        [stageProperty]: mappedStageData,
      },
    };
  };

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
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

  const currentCandidates =
    candidates.length > 0
      ? candidates
      : pipelineCandidates[selectedStage] || [];

  const handleCreateJobRole = () => {
    setShowCreateJobRole(true);
  };

  const handleEditJobRole = (categoryId: number) => {
    setShowCreateJobRole(true);
    setShowCategoryActions(null);
  };

  const handleEditTemplate = (categoryId: number) => {
    setShowCategoryActions(null);
  };

  const handleCategoryAction = (action: string, categoryId: number) => {
    setShowCategoryActions(null);
    switch (action) {
      case "edit-job":
        handleEditJobRole(categoryId);
        break;
      case "edit-template":
        handleEditTemplate(categoryId);
        break;
      case "archive":
        alert(`Archived category with id ${categoryId}`);
        break;
      case "delete":
        if (
          confirm(
            `Are you sure you want to delete category with id ${categoryId}?`
          )
        ) {
          alert(`Deleted category with id ${categoryId}`);
        }
        break;
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setActiveCategoryId(categoryId);
    setActiveJobId(categoryId);
  };

  const renderStageDetails = () => {
    if (!selectedCandidate) {
      return (
        <div className="text-center text-gray-500 mt-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No Candidate Selected</p>
          <p className="text-sm mt-1">
            Select a candidate from the list to view their details
          </p>
        </div>
      );
    }

    const stageData =
      selectedCandidate.stageData[
        selectedStage.toLowerCase().replace(" ", "-")
      ];

    switch (selectedStage) {
      case "Uncontacted":
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "Invites Sent":
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Stage wise notes section */}
            {selectedCandidate?.stageData?.invitesSent?.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="space-y-2">
                  {stageData.candidate_notes.map((note: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "Applied":
        const appliedStageData = selectedCandidate.stageData.applied;
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">
                  Skills Match
                </h5>
                <p className="text-lg font-bold text-blue-600">
                  {appliedStageData?.skillsMatch}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">
                  Experience Match
                </h5>
                <p className="text-lg font-bold text-green-600">
                  {appliedStageData?.experienceMatch}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Resume Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {appliedStageData?.highlights
                  ?.split(", ")
                  .map((highlight: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
              </div>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div>
              <button className="mt-1 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Resend Interview Link
              </button>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "AI Interview":
      case "Shortlisted":
        const interviewData =
          selectedStage === "AI Interview"
            ? stageData.aiInterview
            : stageData.shortlisted;
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Resume Score</p>
                <p className="text-lg font-bold text-blue-600">
                  {interviewData?.resumeScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Knowledge</p>
                <p className="text-lg font-bold text-green-600">
                  {interviewData?.knowledgeScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Communication</p>
                <p className="text-lg font-bold text-yellow-600">
                  {interviewData?.communicationScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Integrity</p>
                <p className="text-lg font-bold text-purple-600">
                  {interviewData?.integrityScore}
                </p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <h5 className="font-medium text-red-900 mb-2">
                Proctoring Check
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  Device Usage: {interviewData?.proctoring?.deviceUsage}%
                </div>
                <div>Assistance: {interviewData?.proctoring?.assistance}%</div>
                <div>
                  Reference Material:{" "}
                  {interviewData?.proctoring?.referenceMaterial}%
                </div>
                <div>
                  Environment: {interviewData?.proctoring?.environment}%
                </div>
              </div>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "First Interview":
      case "Other Interviews":
      case "HR Round":
        const roundData =
          selectedStage === "First Interview"
            ? stageData.firstInterview
            : selectedStage === "Other Interviews"
            ? stageData.otherInterviews
            : stageData.hrRound;
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {roundData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "Salary Negotiation":
        const salaryData = stageData.salaryNegotiation;
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {salaryData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between w-full">
              <button
                onClick={() => {
                  const currentIndex = stages.findIndex(
                    (s) => s.name === selectedStage
                  );
                  const nextStage = stages[currentIndex + 1];
                  if (nextStage)
                    moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
                }}
                className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Offer
              </button>
              <button
                onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
                className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
      case "Offer Sent":
        const offerData = stageData.offerSent;
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {offerData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {offerData?.offerAcceptanceStatus === "Pending" && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Follow Up on Offer
              </button>
            )}
          </div>
        );
      case "Archives":
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Experience */}
            {selectedCandidate?.positions?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
                  Experience
                </h3>
                <div className="ml-2">
                  {selectedCandidate.positions.map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {exp?.title && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {exp.title}
                        </h4>
                      )}
                      {(exp?.companyName || exp?.location) && (
                        <p className="text-sm text-gray-600">
                          {exp?.companyName && exp.companyName}
                          {exp?.companyName && exp?.location && " | "}
                          {exp?.location && exp.location}
                        </p>
                      )}
                      {(exp?.startDate || exp?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {exp?.startDate
                            ? `${exp.startDate.month}/${exp.startDate.year}`
                            : ""}
                          {" - "}
                          {exp?.endDate
                            ? `${exp.endDate.month}/${exp.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                      {exp?.description && (
                        <p className="text-sm text-gray-700 mt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedCandidate?.educations?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
                  Education
                </h3>
                <div className="ml-2">
                  {selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {edu?.degreeName && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {edu.degreeName}
                        </h4>
                      )}
                      {edu?.fieldOfStudy && (
                        <p className="text-sm text-gray-600">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      {(edu?.startDate?.year || edu?.endDate?.year) && (
                        <p className="text-sm text-gray-500">
                          {edu?.startDate?.year || ""} -{" "}
                          {edu?.endDate?.year || ""}
                        </p>
                      )}
                      {edu?.schoolName && (
                        <p className="text-sm text-gray-500">
                          {edu.schoolName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedCandidate?.certifications?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-gray-800" />
                  Certifications
                </h3>
                <div className="ml-2">
                  {selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      {cert?.name && (
                        <h4 className="font-medium text-gray-900 text-sm">
                          {cert.name}
                        </h4>
                      )}
                      {cert?.authority && (
                        <p className="text-sm text-gray-600">
                          {cert.authority}
                        </p>
                      )}
                      {(cert?.startDate || cert?.endDate) && (
                        <p className="text-sm text-gray-500">
                          {cert?.startDate
                            ? `${cert.startDate.month}/${cert.startDate.year}`
                            : ""}
                          {" - "}
                          {cert?.endDate
                            ? `${cert.endDate.month}/${cert.endDate.year}`
                            : "Present"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {selectedCandidate?.skills?.length > 0 && (
              <div>
                <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
                  <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map(
                    (skill, index) =>
                      skill?.name && (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      )
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedCandidate?.recommendations?.received?.length > 0 && (
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedCandidate.recommendations.received.map(
                    (rec, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1">
                            {rec?.recommender_name && (
                              <h4 className="font-medium text-gray-900 text-sm">
                                {rec.recommender_name}
                              </h4>
                            )}
                            {rec?.recommender_title && (
                              <p className="text-xs text-gray-700">
                                {rec.recommender_title}
                              </p>
                            )}
                            {rec?.feedback && (
                              <p className="text-sm text-gray-800 mt-1">
                                "{rec.feedback}"
                              </p>
                            )}
                            {rec?.date_received && (
                              <p className="text-xs text-gray-600 mt-1">
                                {rec.date_received}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-20 bg-white will-change-transform">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreateRole={handleCreateJobRole}
          onOpenLogoutModal={onOpenLogoutModal}
        />
      </div>

      <div className="my-3 mx-6">
        {loadingCategories ? (
          <div className="text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No Job Roles Found</p>
            <p className="text-sm mt-1">
              Please create a job role to view the pipeline stages.
            </p>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategoryId === category.id
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeCategoryId === category.id
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {category.count}
                  </span>
                </button>
                {hoveredCategory === category.id && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() =>
                          handleCategoryAction("edit-job", category.id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job Role
                      </button>
                      <button
                        onClick={() =>
                          handleCategoryAction("edit-template", category.id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Edit Email Template
                      </button>
                      <button
                        onClick={() =>
                          handleCategoryAction("archive", category.id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </button>
                      <button
                        onClick={() =>
                          handleCategoryAction("delete", category.id)
                        }
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {categories.length > 4 && (
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center"
                >
                  +{categories.length - 4} more
                  <ChevronDown className="ml-1 w-4 h-4" />
                </button>
                <CategoryDropdown
                  isOpen={showCategoryDropdown}
                  onClose={() => setShowCategoryDropdown(false)}
                  onEditJobRole={handleEditJobRole}
                  onEditTemplate={handleEditTemplate}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={onBack}
              >
                <button className="rounded-lg transition-colors">
                  <ArrowLeft className="mb-2 w-5 h-4 text-gray-600" />
                </button>
                <h3 className="text-sm font-semibold text-gray-600 mb-4 mt-1">
                  Back to Dashboard
                </h3>
              </div>
              <div className="space-y-2">
                {stages.length > 0
                  ? stages.map((stage) => {
                      const Icon = getStageIcon(stage.name);
                      const isSelected = selectedStage === stage.name;
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Icon
                            className={`w-4 h-4 ${
                              isSelected ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
                          <span className="flex-1 font-medium">
                            {stage.name}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              isSelected
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {stage.candidate_count}
                          </span>
                        </button>
                      );
                    })
                  : pipelineStages.map((stage) => {
                      const Icon = getStageIcon(stage);
                      const isSelected = selectedStage === stage;
                      const candidateCount =
                        pipelineCandidates[stage]?.length || 0;
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

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-3 lg:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-3">
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
                        className="w-4 h-4 text-blue-500 border-gray-400 rounded focus:ring-blue-600"
                      />
                      <button
                        onClick={() =>
                          bulkMoveCandidates(
                            selectedCandidates.map((id) => parseInt(id))
                          )
                        }
                        className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors"
                      >
                        Move to Next Stage
                      </button>
                    </label>
                    <button className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors">
                      Export Candidates
                    </button>
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
                  currentCandidates.map((candidate: any) => (
                    <div
                      key={candidate.id}
                      className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedCandidate?.id === candidate.id.toString()
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleCandidateSelect(candidate)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(
                            candidate.id.toString()
                          )}
                          onChange={() =>
                            handleCandidateCheckbox(candidate.id.toString())
                          }
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(
                            candidate.candidate?.full_name || candidate.fullName
                          )
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">
                              {candidate.candidate?.full_name ||
                                candidate.fullName}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {candidate.candidate?.headline ||
                              candidate.headline}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {candidate.candidate?.location ||
                              `${candidate.location.city}, ${candidate.location.country}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 order-3 relative">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4 min-h-[81vh]">
              {selectedCandidate ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedCandidate.firstName[0]}
                      {selectedCandidate.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedCandidate.fullName || "N/A"}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedCandidate.headline || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedCandidate.location.city},{" "}
                        {selectedCandidate.location.country}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate">
                          {selectedCandidate.email || "N/A"}
                        </span>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedCandidate.phone?.number || "N/A"}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <FontAwesomeIcon
                          icon={faWhatsapp}
                          className="w-4 h-4 text-gray-400 hover:text-green-600 cursor-pointer"
                        />
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  {renderStageDetails()}
                </>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-base font-medium">No Candidate Selected</p>
                  <p className="text-sm mt-1">
                    Select a candidate from the list to view their details
                  </p>
                </div>
              )}
              <div
                className={`absolute top-0 left-0 w-full h-full bg-gray-50 transform transition-all duration-300 ease-in-out z-10 ${
                  showComments
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0 pointer-events-none"
                }`}
              >
                <div className="bg-white p-4 h-full flex flex-col shadow-xl rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notes
                    </h3>
                    <button
                      onClick={() => setShowComments(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {existingComments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-2xl px-4 py-2 mr-2">
                            <p className="font-medium text-sm text-gray-900">
                              {comment.author}
                            </p>
                            <p className="text-sm text-gray-800 mt-1">
                              {comment.text}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-4">
                            {comment.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {user?.fullName?.[0] || "U"}
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a note..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddComment()
                          }
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStages;
