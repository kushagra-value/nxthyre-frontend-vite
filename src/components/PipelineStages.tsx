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
import {
  pipelineStages,
  pipelineCandidates,
  PipelineCandidate,
} from "../data/pipelineData";
import { useAuthContext } from "../context/AuthContext";

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
    experience_summary: {
      title: string;
      date_range: string;
    };
    education_summary: {
      title: string;
      date_range: string;
    };
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
  const [activeJobId, setActiveJobId] = useState<number>(35); // Default job_id

  const tabs = [
    { id: "outbound", label: "Outbound", count: 2325 },
    { id: "active", label: "Active", count: 2034 },
    { id: "inbound", label: "Inbound", count: 2034 },
    { id: "prevetted", label: "Prevetted", count: 2034 },
  ];

  // Fetch stages when activeJobId changes
  useEffect(() => {
    fetchStages(activeJobId);
  }, [activeJobId]);

  // Fetch candidates when selectedStage or activeJobId changes
  useEffect(() => {
    if (selectedStage) {
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
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showComments]);

  // API fetch functions
  const fetchStages = async (jobId: number) => {
    try {
      const response = await fetch(
        `https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/applications/stages/?job_id=${jobId}`
      );
      if (!response.ok) throw new Error("Failed to fetch stages");
      const data: Stage[] = await response.json();
      setStages(data.sort((a, b) => a.sort_order - b.sort_order));
      setSelectedStage(data[0]?.name || "Uncontacted"); // Set initial stage
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]); // Fallback to empty array
    }
  };

  const fetchCandidates = async (jobId: number, stageSlug: string) => {
    try {
      const response = await fetch(
        `https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/applications/?job_id=${jobId}&stage_slug=${stageSlug}`
      );
      if (!response.ok) throw new Error("Failed to fetch candidates");
      const data: CandidateListItem[] = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]); // Fallback to empty array
    }
  };

  const fetchCandidateDetails = async (applicationId: number) => {
    try {
      const response = await fetch(
        `https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/applications/${applicationId}/`
      );
      if (!response.ok) throw new Error("Failed to fetch candidate details");
      const data = await response.json();
      // Map API response to PipelineCandidate structure (assuming stageData is included)
      const mappedCandidate: PipelineCandidate = mapCandidateDetails(data);
      setSelectedCandidate(mappedCandidate);
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      setSelectedCandidate(null);
    }
  };

  const moveCandidate = async (applicationId: number, stageId: number) => {
    try {
      const response = await fetch(
        `https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/applications/${applicationId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_stage: stageId }),
        }
      );
      if (!response.ok) throw new Error("Failed to move candidate");
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-")
      ); // Refresh candidates
    } catch (error) {
      console.error("Error moving candidate:", error);
    }
  };

  const archiveCandidate = async (applicationId: number) => {
    const archiveStage = stages.find((stage) => stage.slug === "archives");
    if (!archiveStage) return;
    try {
      const response = await fetch(
        `https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/applications/${applicationId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_stage: archiveStage.id,
            status: "ARCHIVED",
            archive_reason: "Candidate archived from UI",
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to archive candidate");
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-")
      ); // Refresh candidates
    } catch (error) {
      console.error("Error archiving candidate:", error);
    }
  };

  const bulkMoveCandidates = async (applicationIds: number[]) => {
    try {
      const response = await fetch(
        "https://nxthyre-server-staging-863630644667.asia-south1.run.app/api/jobs/bulk-move-stage/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application_ids: applicationIds }),
        }
      );
      if (!response.ok) throw new Error("Failed to bulk move candidates");
      fetchCandidates(
        activeJobId,
        selectedStage.toLowerCase().replace(" ", "-")
      ); // Refresh candidates
    } catch (error) {
      console.error("Error bulk moving candidates:", error);
    }
  };

  // Helper to map candidate details to PipelineCandidate type
  const mapCandidateDetails = (data: any): PipelineCandidate => {
    // Since exact response structure isn't provided, assume it includes necessary fields
    return {
      id: data.id.toString(),
      firstName: data.candidate.full_name.split(" ")[0] || "",
      lastName: data.candidate.full_name.split(" ").slice(1).join(" ") || "",
      fullName: data.candidate.full_name,
      publicIdentifier: data.candidate.id,
      headline: data.candidate.headline,
      summary: "",
      profilePicture: { displayImageUrl: "", artifacts: [] },
      location: {
        country: data.candidate.location.split(", ")[1] || "",
        city: data.candidate.location.split(", ")[0] || "",
      },
      industry: "",
      email: data.candidate.social_links?.resume || "", // Placeholder
      phone: { type: "mobile", number: "" }, // Placeholder
      positions: [
        {
          title: data.candidate.experience_summary.title,
          companyName: "",
          companyUrn: "",
          startDate: { month: 0, year: 0 },
          isCurrent: true,
          location: data.candidate.location,
          description: "",
        },
      ],
      educations: [
        {
          schoolName: data.candidate.education_summary.title.split(" - ")[0],
          degreeName:
            data.candidate.education_summary.title.split(" - ")[1] || "",
          fieldOfStudy: "",
          startDate: { year: 0 },
          endDate: { year: 0 },
          activities: "",
          description: "",
        },
      ],
      certifications: [],
      skills: data.candidate.skills_list.map((skill: string) => ({
        name: skill,
        endorsementCount: 0,
      })),
      endorsements: [],
      recommendations: { received: [], given: [] },
      visibility: { profile: "PUBLIC", email: false, phone: false },
      connections: [],
      meta: {
        fetchedAt: "",
        dataCompleteness: "partial",
        source: "",
        scopesGranted: [],
      },
      stageData: data.stage_data || {}, // Assume stage-specific data is included
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

    const stageData = selectedCandidate.stageData;

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

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
              {selectedCandidate.positions.map((pos, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <p className="font-medium">{pos.title}</p>
                  <p className="text-gray-600">
                    {pos.companyName} | {pos.location}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Education</h4>
              {selectedCandidate.educations.map((edu, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <p className="font-medium">{edu.degreeName}</p>
                  <p className="text-gray-600">{edu.schoolName}</p>
                </div>
              ))}
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

      case "Invites Sent":
        const inviteData = stageData.invitesSent;
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
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <div className="space-y-2">
                {inviteData?.notes?.map((note, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded p-2 text-sm text-gray-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
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

      case "Applied":
        const appliedData = stageData.applied;
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
                  {appliedData?.skillsMatch}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">
                  Experience Match
                </h5>
                <p className="text-lg font-bold text-green-600">
                  {appliedData?.experienceMatch}
                </p>
              </div>
            </div>

            <div className="">
              <h4 className="font-medium text-gray-900 mb-3">
                Resume Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {appliedData?.highlights
                  ?.split(", ")
                  .map((highlight, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
              </div>
            </div>

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
                {roundData?.followups?.map((followup, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{followup}</span>
                  </div>
                ))}
              </div>
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
                {salaryData?.followups?.map((followup, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{followup}</span>
                  </div>
                ))}
              </div>
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
                {offerData?.followups?.map((followup, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{followup}</span>
                  </div>
                ))}
              </div>
            </div>

            {offerData?.offerAcceptanceStatus === "Pending" && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Follow Up on Offer
              </button>
            )}
          </div>
        );

      case "Archives":
        const archiveData = stageData.archived;
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

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showCategoryActions, setShowCategoryActions] = useState<string | null>(
    null
  );
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [activeCategory, setActiveCategory] = useState("Head Of Finance");

  const categories = [
    { name: "Head Of Finance", count: 8, active: true },
    { name: "Contract Executive", count: 6 },
    { name: "Aerospace Engineer", count: 9 },
    { name: "AI/ML Engineer", count: 9 },
  ];

  const handleCreateJobRole = () => {
    setShowCreateJobRole(true);
  };

  const handleEditJobRole = (categoryName: string) => {
    setShowCreateJobRole(true);
    setShowCategoryActions(null);
  };

  const handleEditTemplate = (categoryName: string) => {
    setShowCategoryActions(null);
  };

  const handleCategoryAction = (action: string, categoryName: string) => {
    setShowCategoryActions(null);

    switch (action) {
      case "edit-job":
        handleEditJobRole(categoryName);
        break;
      case "edit-template":
        handleEditTemplate(categoryName);
        break;
      case "archive":
        alert(`Archived ${categoryName}`);
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${categoryName}?`)) {
          alert(`Deleted ${categoryName}`);
        }
        break;
    }
  };

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
        <div className="hidden md:flex items-center space-x-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                onClick={() => setActiveCategory(category.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.name
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeCategory === category.name
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {category.count}
                </span>
              </button>

              {hoveredCategory === category.name && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() =>
                        handleCategoryAction("edit-job", category.name)
                      }
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Job Role
                    </button>
                    <button
                      onClick={() =>
                        handleCategoryAction("edit-template", category.name)
                      }
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Edit Email Template
                    </button>
                    <button
                      onClick={() =>
                        handleCategoryAction("archive", category.name)
                      }
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </button>
                    <button
                      onClick={() =>
                        handleCategoryAction("delete", category.name)
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

          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center"
            >
              +12 more
              <ChevronDown className="ml-1 w-4 h-4" />
            </button>

            <CategoryDropdown
              isOpen={showCategoryDropdown}
              onClose={() => setShowCategoryDropdown(false)}
              onEditJobRole={handleEditJobRole}
              onEditTemplate={handleEditTemplate}
            />
          </div>
        </div>
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
                          if (e.target.checked) {
                            setSelectedCandidates(
                              currentCandidates.map((c) => c.id.toString())
                            );
                          } else {
                            setSelectedCandidates([]);
                          }
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
                        {selectedCandidate.fullName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedCandidate.headline}
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
                          {selectedCandidate.email}
                        </span>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {selectedCandidate.phone.number}
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
