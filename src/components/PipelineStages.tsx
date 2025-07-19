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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Header from "./Header";
import CategoryDropdown from "./CategoryDropdown";
import { useAuthContext } from "../context/AuthContext";
import {
  pipelineService,
  Stage,
  Application,
  ApplicationDetail,
} from "../services/pipelineService";

interface PipelineStagesProps {
  onBack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogoutModal: () => void;
  jobId: number;
}

const PipelineStages: React.FC<PipelineStagesProps> = ({
  onBack,
  activeTab,
  setActiveTab,
  onOpenLogoutModal,
  jobId,
}) => {
  const { user } = useAuthContext();
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);
  const [applicationDetails, setApplicationDetails] =
    useState<ApplicationDetail | null>(null);
  const [archiveStageId, setArchiveStageId] = useState<number | null>(null);
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

  // Fetch stages when jobId changes
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const stagesData = await pipelineService.getStages(jobId);
        const sortedStages = stagesData.sort(
          (a, b) => a.sort_order - b.sort_order
        );
        setStages(sortedStages);
        const archiveStage = sortedStages.find(
          (stage) => stage.slug === "archives"
        );
        if (archiveStage) setArchiveStageId(archiveStage.id);
        if (sortedStages.length > 0) setSelectedStageId(sortedStages[0].id);
      } catch (error) {
        console.error("Error fetching stages:", error);
      }
    };
    fetchStages();
  }, [jobId]);

  // Fetch applications when selectedStageId changes
  useEffect(() => {
    if (selectedStageId !== null) {
      const fetchApplications = async () => {
        try {
          const applicationsData =
            await pipelineService.getApplicationsForStage(
              jobId,
              selectedStageId
            );
          setApplications(applicationsData);
          if (applicationsData.length > 0) {
            setSelectedApplicationId(applicationsData[0].id);
          } else {
            setSelectedApplicationId(null);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      };
      fetchApplications();
    }
  }, [selectedStageId, jobId]);

  // Fetch application details when selectedApplicationId changes
  useEffect(() => {
    if (selectedApplicationId !== null) {
      const fetchApplicationDetails = async () => {
        try {
          const details = await pipelineService.getApplicationDetails(
            selectedApplicationId
          );
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
    return () => document.body.classList.remove("overflow-hidden");
  }, [showComments]);

  const handleStageSelect = (stageId: number) => {
    setSelectedStageId(stageId);
    setSelectedApplicationId(null);
  };

  const handleApplicationSelect = (applicationId: number) => {
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

  const getNextStageId = (currentStageId: number): number | null => {
    const currentIndex = stages.findIndex(
      (stage) => stage.id === currentStageId
    );
    return currentIndex < stages.length - 1
      ? stages[currentIndex + 1].id
      : null;
  };

  const handleMoveToNextStage = async () => {
    if (!selectedApplicationId || !applicationDetails) return;
    const nextStageId = getNextStageId(applicationDetails.current_stage);
    if (nextStageId) {
      try {
        await pipelineService.updateApplication(selectedApplicationId, {
          current_stage: nextStageId,
        });
        const updatedStages = await pipelineService.getStages(jobId);
        setStages(updatedStages.sort((a, b) => a.sort_order - b.sort_order));
        const updatedApplications =
          await pipelineService.getApplicationsForStage(jobId, selectedStageId);
        setApplications(updatedApplications);
        if (
          !updatedApplications.some((app) => app.id === selectedApplicationId)
        ) {
          setSelectedApplicationId(null);
        }
      } catch (error) {
        console.error("Error moving candidate:", error);
      }
    }
  };

  const handleArchive = async () => {
    if (!selectedApplicationId || !archiveStageId) return;
    try {
      await pipelineService.updateApplication(selectedApplicationId, {
        current_stage: archiveStageId,
        status: "ARCHIVED",
      });
      const updatedStages = await pipelineService.getStages(jobId);
      setStages(updatedStages.sort((a, b) => a.sort_order - b.sort_order));
      const updatedApplications = await pipelineService.getApplicationsForStage(
        jobId,
        selectedStageId
      );
      setApplications(updatedApplications);
      if (
        !updatedApplications.some((app) => app.id === selectedApplicationId)
      ) {
        setSelectedApplicationId(null);
      }
    } catch (error) {
      console.error("Error archiving candidate:", error);
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

    const currentStage =
      stages.find((stage) => stage.id === applicationDetails.current_stage)
        ?.name || "";
    const { candidate, contextual_details } = applicationDetails;

    switch (currentStage) {
      case "Uncontacted":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {candidate.email}
                  </span>
                </div>
                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {candidate.phone || "N/A"}
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
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send Invite
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Invites Sent":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Invite Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span> Pending
                </p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Resend Invite
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Applied":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-medium text-green-900 mb-2">
                Application Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Applied Date:</span>{" "}
                  {contextual_details.application_details.applied_date}
                </p>
                <p>
                  <span className="font-medium">Resume Score:</span>{" "}
                  {contextual_details.application_details.resume_score}
                </p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Schedule AI Interview
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "AI Interview":
      case "Shortlisted":
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-purple-900 mb-2">
                Interview Results
              </h4>
              <p className="text-sm">
                <span className="font-medium">Status:</span> Completed
              </p>
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              {currentStage === "AI Interview"
                ? "Move to Shortlisted"
                : "Schedule First Interview"}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "First Interview":
      case "Other Interviews":
      case "HR Round":
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-3">
              <h4 className="font-medium text-indigo-900 mb-2">
                Interview Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span> Scheduled
                </p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Move to Next Stage
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Salary Negotiation":
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-3">
              <h4 className="font-medium text-orange-900 mb-2">
                Salary Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span> In Progress
                </p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Send Offer
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Offer Sent":
        return (
          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-3">
              <h4 className="font-medium text-emerald-900 mb-2">
                Offer Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {applicationDetails.status}
                </p>
              </div>
            </div>
            {applicationDetails.status === "Pending" && (
              <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Follow Up on Offer
              </button>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        );

      case "Archives":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Archive Details
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Status:</span> Archived
                </p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                This candidate has been archived and is no longer active in the
                pipeline.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleMoveToNextStage}
                disabled={!getNextStageId(applicationDetails.current_stage)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Move to Next Stage
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Archive
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

  const handleCategoryAction = (action: string, categoryName: string) => {
    setShowCategoryActions(null);
    switch (action) {
      case "edit-job":
        alert(`Edit Job Role: ${categoryName}`);
        break;
      case "edit-template":
        alert(`Edit Template: ${categoryName}`);
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
          onCreateRole={() => setShowCreateJobRole(true)}
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
                      classNameiggs="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
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
                        {stage.candidate_count}
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
                {applications.length === 0 ? (
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
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedApplicationId === app.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleApplicationSelect(app.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(
                            app.candidate.id
                          )}
                          onChange={() =>
                            handleCandidateCheckbox(app.candidate.id)
                          }
                          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {app.candidate.first_name[0]}
                          {app.candidate.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900">
                              {app.candidate.first_name}{" "}
                              {app.candidate.last_name}
                            </h3>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {
                                stages.find(
                                  (stage) => stage.id === selectedStageId
                                )?.name
                              }
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Candidate
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
                      {applicationDetails.candidate.first_name[0]}
                      {applicationDetails.candidate.last_name[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {applicationDetails.candidate.first_name}{" "}
                        {applicationDetails.candidate.last_name}
                      </h2>
                      <p className="text-sm text-gray-600">Candidate</p>
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
