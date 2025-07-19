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
import { useAuthContext } from "../context/AuthContext";
import {
  getStages,
  getCandidates,
  getApplicationDetails,
  updateApplication,
  Stage,
  CandidateListItem,
  ApplicationDetails,
} from "../services/pipelineService";

interface PipelineStagesProps {
  onBack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogoutModal: () => void;
  jobId: number;
  categories: { id: number; name: string; count: number }[];
  onSelectJob: (jobId: number) => void;
}

const PipelineStages: React.FC<PipelineStagesProps> = ({
  onBack,
  activeTab,
  setActiveTab,
  onOpenLogoutModal,
  jobId,
  categories,
  onSelectJob,
}) => {
  const { user } = useAuthContext();
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetails | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const tabs = [
    { id: "outbound", label: "Outbound", count: 2325 },
    { id: "active", label: "Active", count: 2034 },
    { id: "inbound", label: "Inbound", count: 2034 },
    { id: "prevetted", label: "Prevetted", count: 2034 },
  ];

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const stagesData = await getStages(jobId);
        setStages(stagesData);
        if (stagesData.length > 0) {
          setSelectedStageId(stagesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };
    fetchStages();
  }, [jobId]);

  useEffect(() => {
    if (selectedStageId !== null) {
      const fetchCandidates = async () => {
        try {
          const candidatesData = await getCandidates(jobId, selectedStageId);
          setCandidates(candidatesData);
        } catch (error) {
          console.error("Error fetching candidates:", error);
        }
      };
      fetchCandidates();
    }
  }, [selectedStageId, jobId]);

  useEffect(() => {
    if (selectedApplicationId !== null) {
      const fetchApplicationDetails = async () => {
        try {
          const details = await getApplicationDetails(selectedApplicationId);
          setApplicationDetails(details);
        } catch (error) {
          console.error("Error fetching application details:", error);
        }
      };
      fetchApplicationDetails();
    } else {
      setApplicationDetails(null);
    }
  }, [selectedApplicationId]);

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

  const handleStageSelect = (stageId: number) => {
    setSelectedStageId(stageId);
    setSelectedApplicationId(null);
  };

  const handleCandidateSelect = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
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

  const handleMoveToNextStage = async () => {
    if (!applicationDetails) return;
    const currentStageIndex = stages.findIndex(
      (stage) => stage.id === applicationDetails.current_stage
    );
    const nextStage = stages[currentStageIndex + 1];
    if (nextStage) {
      try {
        await updateApplication(applicationDetails.id, {
          current_stage: nextStage.id,
        });
        const updatedCandidates = await getCandidates(jobId, selectedStageId!);
        setCandidates(updatedCandidates);
        setSelectedApplicationId(null);
        setApplicationDetails(null);
      } catch (error) {
        console.error("Error moving candidate:", error);
      }
    } else {
      alert("No next stage available");
    }
  };

  const handleArchive = async () => {
    if (!applicationDetails) return;
    const archiveStage = stages.find((stage) => stage.slug === "archives");
    if (archiveStage) {
      try {
        await updateApplication(applicationDetails.id, {
          current_stage: archiveStage.id,
          status: "ARCHIVED",
        });
        const updatedCandidates = await getCandidates(jobId, selectedStageId!);
        setCandidates(updatedCandidates);
        setSelectedApplicationId(null);
        setApplicationDetails(null);
      } catch (error) {
        console.error("Error archiving candidate:", error);
      }
    } else {
      alert("Archive stage not found");
    }
  };

  const getStageIcon = (stageName: string) => {
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
    return icons[stageName as keyof typeof icons] || User;
  };

  const renderStageDetails = () => {
    if (!applicationDetails) {
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

    const stage = stages.find((s) => s.id === applicationDetails.current_stage);
    const stageName = stage?.name || "";
    const contextualDetails = applicationDetails.contextual_details || {};

    switch (stageName) {
      case "Uncontacted":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {applicationDetails.candidate.email}
                  </span>
                </div>
                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Invites Sent":
        const inviteData = contextualDetails.invitesSent || {};
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Invite Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Date Sent:</span>{" "}
                  {inviteData.dateSent || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      inviteData.responseStatus === "Interested"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {inviteData.responseStatus || "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Applied":
        const appliedData = contextualDetails.application_details || {};
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">
                Application Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Applied Date:</span>{" "}
                  {appliedData.applied_date || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Resume Score:</span>
                  <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {appliedData.resume_score || "N/A"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "AI Interview":
      case "Shortlisted":
        const interviewData =
          contextualDetails.aiInterview || contextualDetails.shortlisted || {};
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-900 mb-2">
                Interview Results
              </h4>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {interviewData.interviewedDate || "N/A"}
              </p>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          contextualDetails.firstInterview ||
          contextualDetails.otherInterviews ||
          contextualDetails.hrRound ||
          {};
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-medium text-indigo-900 mb-2">
                Interview Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {roundData.interviewDate || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Salary Negotiation":
        const salaryData = contextualDetails.salaryNegotiation || {};
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-orange-900 mb-2">
                Salary Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Salary Range:</span>{" "}
                  {salaryData.salary || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Offer Sent":
        const offerData = contextualDetails.offerSent || {};
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-3">
              <h4 className="font-medium text-emerald-900 mb-2">
                Offer Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Sent Date:</span>{" "}
                  {offerData.offerSentDate || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Archives":
        const archiveData = contextualDetails.archived || {};
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Archive Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Reason:</span>{" "}
                  {archiveData.reason || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Archived Date:</span>{" "}
                  {archiveData.archivedDate || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="flex justify-between w-full">
              <button
                onClick={handleMoveToNextStage}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );
    }
  };

  const existingComments = [
    {
      id: 1,
      text: "Great candidate with strong technical background.",
      author: "John Doe",
      date: "2 days ago",
      avatar: "J",
    },
    {
      id: 2,
      text: "Excellent communication skills.",
      author: "Jane Smith",
      date: "1 week ago",
      avatar: "J",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-20 bg-white will-change-transform">
        <Header
          searchTerm=""
          setSearchTerm={() => {}}
          onCreateRole={() => {}}
          onOpenLogoutModal={onOpenLogoutModal}
        />
      </div>

      <div className="my-3 mx-6">
        <div className="hidden md:flex items-center space-x-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button
                onClick={() => onSelectJob(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  jobId === category.id
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name}
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    jobId === category.id
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {category.count}
                </span>
              </button>
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
              onEditJobRole={() => {}}
              onEditTemplate={() => {}}
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
                {stages.map((stage) => {
                  const Icon = getStageIcon(stage.name);
                  const isSelected = selectedStageId === stage.id;
                  const candidateCount = stage.candidate_count;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => handleStageSelect(stage.id)}
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
                      <span className="flex-1 font-medium">{stage.name}</span>
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

              <div className="divide-y divide-gray-200">
                {!candidates || candidates.length === 0 ? (
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
                  candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedApplicationId === candidate.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleCandidateSelect(candidate.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(
                            candidate.candidate.id
                          )}
                          onChange={() =>
                            handleCandidateCheckbox(candidate.candidate.id)
                          }
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {candidate.candidate.firstName[0]}
                          {candidate.candidate.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">
                              {candidate.candidate.firstName}{" "}
                              {candidate.candidate.lastName}
                            </h3>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {candidate.stage_slug}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {candidate.candidate.email}
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
              {applicationDetails ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {applicationDetails.candidate.firstName[0]}
                      {applicationDetails.candidate.lastName[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {applicationDetails.candidate.firstName}{" "}
                        {applicationDetails.candidate.lastName}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {applicationDetails.candidate.email}
                      </p>
                    </div>
                  </div>

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
