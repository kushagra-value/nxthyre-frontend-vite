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
import { useAuthContext } from "../context/AuthContext"; // Import AuthContext

interface PipelineStagesProps {
  onBack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogoutModal: () => void; // Add new prop
}

const PipelineStages: React.FC<PipelineStagesProps> = ({
  onBack,
  activeTab,
  setActiveTab,
  onOpenLogoutModal, // Destructure new prop
}) => {
  const { user } = useAuthContext(); // Access user from AuthContext
  const [selectedStage, setSelectedStage] = useState("Uncontacted");
  const [selectedCandidate, setSelectedCandidate] =
    useState<PipelineCandidate | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const tabs = [
    { id: "outbound", label: "Outbound", count: 2325 },
    { id: "active", label: "Active", count: 2034 },
    { id: "inbound", label: "Inbound", count: 2034 },
    { id: "prevetted", label: "Prevetted", count: 2034 },
  ];

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

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setSelectedCandidate(null);
  };

  const handleCandidateSelect = (candidate: PipelineCandidate) => {
    setSelectedCandidate(candidate);
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

  // const getStageColor = (stage: string) => {
  //   const colors = {
  //     'Uncontacted': 'text-gray-600',
  //     'Invites Sent': 'text-blue-600',
  //     'Applied': 'text-green-600',
  //     'AI Interview': 'text-purple-600',
  //     'Shortlisted': 'text-yellow-600',
  //     'First Interview': 'text-indigo-600',
  //     'Other Interviews': 'text-pink-600',
  //     'HR Round': 'text-red-600',
  //     'Salary Negotiation': 'text-orange-600',
  //     'Offer Sent': 'text-emerald-600',
  //     'Archives': 'text-gray-500'
  //   };
  //   return colors[stage] || 'text-gray-600';
  // };

  const currentCandidates = pipelineCandidates[selectedStage] || [];

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
              <button className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Move to Next Stage
              </button>
              <button className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Archive
              </button>
            </div>
          </div>
        );

      case "Invites Sent":
        const inviteData = stageData.invitesSent;
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Invite Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Date Sent:</span>{" "}
                  {inviteData?.dateSent}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      inviteData?.responseStatus === "Interested"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {inviteData?.responseStatus}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Current Status:</span>{" "}
                  {inviteData?.currentStatus}
                </p>
              </div>
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
              <button className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Move to Next Stage
              </button>
              <button className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Archive
              </button>
            </div>
          </div>
        );

      case "Applied":
        const appliedData = stageData.applied;
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">
                Application Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Applied Date:</span>{" "}
                  {appliedData?.appliedDate}
                </p>
                <p>
                  <span className="font-medium">Resume Score:</span>
                  <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {appliedData?.resumeScore}/100
                  </span>
                </p>
              </div>
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

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
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

            <div className="flex justify-between w-full">
              <button className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Move to Next Stage
              </button>
              <button className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-900 mb-2">
                Interview Results
              </h4>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {interviewData?.interviewedDate}
              </p>
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

            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              {selectedStage === "AI Interview"
                ? "Move to Shortlisted"
                : "Schedule First Interview"}
            </button>
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
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-medium text-indigo-900 mb-2">
                Interview Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {roundData?.interviewDate}
                </p>
                <p>
                  <span className="font-medium">Interviewer:</span>{" "}
                  {roundData?.interviewerName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {roundData?.interviewerEmail}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Interview Notes
              </h4>
              <div className="space-y-2">
                {roundData?.interviewNotes?.map((note, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded p-2 text-sm text-gray-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
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

            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Move to Next Stage
            </button>
          </div>
        );

      case "Salary Negotiation":
        const salaryData = stageData.salaryNegotiation;
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-orange-900 mb-2">
                Salary Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Salary Range:</span>{" "}
                  {salaryData?.salary}
                </p>
                <p>
                  <span className="font-medium">Negotiation:</span>{" "}
                  {salaryData?.negotiation}
                </p>
              </div>
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

            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Send Offer
            </button>
          </div>
        );

      case "Offer Sent":
        const offerData = stageData.offerSent;
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-3">
              <h4 className="font-medium text-emerald-900 mb-2">
                Offer Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Sent Date:</span>{" "}
                  {offerData?.offerSentDate}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      offerData?.offerAcceptanceStatus === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {offerData?.offerAcceptanceStatus}
                  </span>
                </p>
              </div>
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
              <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Follow Up on Offer
              </button>
            )}
          </div>
        );

      case "Archives":
        const archiveData = stageData.archived;
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Archive Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Reason:</span>{" "}
                  {archiveData?.reason}
                </p>
                <p>
                  <span className="font-medium">Archived Date:</span>{" "}
                  {archiveData?.archivedDate}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <div className="space-y-2">
                {archiveData?.notes?.map((note, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded p-2 text-sm text-gray-700"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                This candidate has been archived and is no longer active in the
                pipeline.
              </p>
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

  // const handleSendInvite = () => {
  //   setShowTemplateSelector(true);
  // };

  // const handleBackFromTemplate = () => {
  //   setShowTemplateSelector(false);
  // };

  const handleCreateJobRole = () => {
    setShowCreateJobRole(true);
  };

  const handleEditJobRole = (categoryName: string) => {
    setShowCreateJobRole(true);
    setShowCategoryActions(null);
  };

  const handleEditTemplate = (categoryName: string) => {
    // setEditingTemplate(categoryName);
    // setShowEditTemplate(true);
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

  // const handlePipelinesClick = () => {
  //   setShowPipelineStages(true);
  // };

  // const handleBackFromPipelines = () => {
  //   setShowPipelineStages(false);
  // };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Sticky with will-change */}
      <div className="sticky top-0 z-20 bg-white will-change-transform">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreateRole={handleCreateJobRole}
          onOpenLogoutModal={onOpenLogoutModal} // Pass handler
        />
      </div>

      {/* Categories */}
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

              {/* Hover Actions */}
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
          {/* Left Sidebar - Pipeline Stages */}
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
                {pipelineStages.map((stage) => {
                  const Icon = getStageIcon(stage);
                  const isSelected = selectedStage === stage;
                  const candidateCount = pipelineCandidates[stage]?.length || 0;

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

          {/* Middle Section - Candidates List */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between p-3 lg:p-4 pb-0">
                  <div className="flex space-x-1 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                          activeTab === tab.id
                            ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {tab.label}
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-3 lg:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-500 border-gray-400 rounded focus:ring-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Select all
                      </span>
                    </label>
                    <button className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors">
                      Add To Pipeline
                    </button>
                    <button className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors">
                      Export Candidates
                    </button>
                  </div>
                </div>
              </div>

              {/* Candidates List */}
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
                  currentCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedCandidate?.id === candidate.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleCandidateSelect(candidate)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleCandidateCheckbox(candidate.id)}
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {candidate.firstName[0]}
                          {candidate.lastName[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">
                              {candidate.fullName}
                            </h3>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {selectedStage}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {candidate.headline}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {candidate.location.city},{" "}
                            {candidate.location.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Candidate Details */}
          <div className="lg:col-span-3 order-3 relative">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4 min-h-[81vh]">
              {selectedCandidate ? (
                <>
                  {/* Header */}
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

                  {/* Action Buttons */}
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

                  {/* Stage-specific Details */}
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

              {/* Notes Section */}
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
                        {user?.fullName?.[0] || "U"} {/* Use user's initial */}
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

// working one
