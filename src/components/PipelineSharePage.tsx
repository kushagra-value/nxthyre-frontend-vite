import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  User,
  MapPin,
  Github,
  Linkedin,
  FileText,
  Twitter,
  X,
  Plus,
  ChevronRight,
  Building2,
  GraduationCap,
  Award,
  Star,
  Clock,
  Search,
  Share2,
  Phone,
  Calendar,
  Briefcase,
  Globe,
  Trash2,
  Copy,
  Delete,
   DollarSign, Users, Share, Eye, 
   MailIcon,
   PhoneIcon,
   Link
} from "lucide-react";
import { showToast } from "../utils/toast";
import apiClient from "../services/api"; // Adjust path as necessary
import { useAuthContext } from "../context/AuthContext"; // Adjust path as necessary
import candidateService from "../services/candidateService";


interface DraggedCandidate {
  candidate: any;
  fromStage: any;
}

interface PipelineSharePageProps {
  pipelineId: string;
  onBack?: () => void;
}

const PipelineSharePage: React.FC<PipelineSharePageProps> = ({
  pipelineId,
  onBack,
}) => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [isFetching, setIsFetching] = useState(false);
  const [draggedCandidate, setDraggedCandidate] =
    useState<DraggedCandidate | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState("profile");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");
  const [isSharing, setIsSharing] = useState(false); // Added for loading state
  const [stageCandidates, setStageCandidates] = useState({});
  const [stageIdMap, setStageIdMap] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  

  const jobId = pipelineId;

  const shareableStages = [
    {
      name: "Shortlisted",
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      bgColor: "bg-[#34C759]",
      textColor: "text-blue-400",
    },
    {
      name: "First Interview",
      color: "bg-yellow-50",
      borderColor: "border-yellow-200",
      bgColor: "bg-[#FF8D28]",
      textColor: "text-yellow-400",
    },
    {
      name: "Other Interviews",
      color: "bg-orange-50",
      borderColor: "border-orange-200",
      bgColor: "bg-[#00C8B3]",
      textColor: "text-orange-400",
    },
    {
      name: "HR Round",
      color: "bg-red-50",
      borderColor: "border-red-200",
      bgColor: "bg-[#0088FF]",
      textColor: "text-red-400",
    },
    {
      name: "Salary Negotiation",
      color: "bg-purple-50",
      borderColor: "border-purple-200",
      bgColor: "bg-[#CB30E0]",
      textColor: "text-purple-400",
    },
    {
      name: "Offer Sent",
      color: "bg-green-50",
      borderColor: "border-green-200",
      bgColor: "bg-indigo-600",
      textColor: "text-green-400",
    },
    {
      name: "Archives",
      color: "bg-gray-50",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-500",
      textColor: "text-gray-400",
    },
  ];

  const stageOrder = {
    Shortlisted: 0,
    "First Interview": 1,
    "Other Interviews": 2,
    "HR Round": 3,
    "Salary Negotiation": 4,
    "Offer Sent": 5,
    Archives: 6,
  };

  const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const response = await apiClient.get(
          `/jobs/applications/kanban-view/?job_id=${jobId}`
        );
        const data = response.data;

        const stageIdMapTemp: { [key: string]: number } = {};
        data.forEach((stage: any) => {
          stageIdMapTemp[stage.name] = stage.id;
        });
        setStageIdMap(stageIdMapTemp);

        const processedData: { [key: string]: any[] } = {};
        shareableStages.forEach((stage) => {
          const apiStage = data.find((s: any) => s.name === stage.name);
          if (apiStage) {
            processedData[stage.name] = apiStage.applications.map(
              (app: any) => {
                const [role, company] = app.candidate_headline.split(" at ");
                return {
                  id: app.id,
                  name: app.candidate_name,
                  company: company || "",
                  role: role || "",
                  location: "",
                  avatar: app.candidate_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join(""),
                  notes: "",
                  lastUpdated: new Date(app.last_updated),
                  socials: {
                    github: false,
                    linkedin: false,
                    resume: false,
                    twitter: false,
                  },
                };
              }
            );
          } else {
            processedData[stage.name] = [];
          }
        });
        setStageCandidates(processedData);
      } catch (error: any) {
        if (error.response?.status === 403) {
          showToast.error("You don't have permission to view this pipeline.");
        } else {
          console.error("Error fetching data:", error);
          showToast.error("Failed to load pipeline data");
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [jobId, isAuthenticated]);

  const handleDragStart = (candidate: any, fromStage: string) => {
    setDraggedCandidate({ candidate, fromStage });
  };

  const fetchCandidateDetails = async (candidateId: string) => {
      setLoadingCandidateDetails(true);
      try {
        const details = await candidateService.getCandidateDetails(candidateId);
        setCandidateDetails(details);
      } catch (error) {
        console.error("Error fetching candidate details:", error);
        showToast.error("Failed to load candidate details");
      } finally {
        setLoadingCandidateDetails(false);
      }
    };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toStage: string) => {
    e.preventDefault();
    if (!draggedCandidate) return;

    const { candidate, fromStage } = draggedCandidate;
    if (fromStage === toStage) {
      setDraggedCandidate(null);
      return;
    }

    const fromOrder = stageOrder[fromStage];
    const toOrder = stageOrder[toStage];

    if (toOrder < fromOrder) {
      showToast.error("Cannot move candidate to a previous stage.");
      setDraggedCandidate(null);
      return;
    }

    const isMovingForward = toOrder > fromOrder;
    setFeedbackData({ candidate, fromStage, toStage, isMovingForward });
    setShowFeedbackModal(true);
    setDraggedCandidate(null);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackData || !feedbackComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }

    const toStageId = stageIdMap[feedbackData.toStage];
    if (!toStageId) {
      showToast.error("Invalid stage");
      return;
    }

    try {
      const response = await apiClient.patch(
        `/jobs/applications/${feedbackData.candidate.id}/?view=kanban`,
        {
          current_stage: toStageId,
          feedback: {
            subject: `Moving to ${feedbackData.toStage}`,
            comment: feedbackComment.trim(),
          },
        }
      );

      setStageCandidates((prevStages: any) => {
        const newStages = { ...prevStages };
        newStages[feedbackData.fromStage] = newStages[
          feedbackData.fromStage
        ].filter((c: any) => c.id !== feedbackData.candidate.id);
        const updatedCandidate = {
          ...feedbackData.candidate,
          notes: feedbackComment.trim(),
        };
        if (!newStages[feedbackData.toStage])
          newStages[feedbackData.toStage] = [];
        newStages[feedbackData.toStage] = [
          ...newStages[feedbackData.toStage],
          updatedCandidate,
        ];
        return newStages;
      });

      showToast.success(
        `${feedbackData.candidate.name} moved to ${feedbackData.toStage}`
      );
      setShowFeedbackModal(false);
      setFeedbackData(null);
      setFeedbackComment("");
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast.error("You don't have permission to perform this action.");
      } else {
        console.error("Error moving candidate:", error);
        showToast.error("Failed to move candidate");
      }
    }
  };

  const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2438_2128)">
      <path d="M11.06 4.6673C11.0595 4.75504 11.0763 4.84201 11.1095 4.92324C11.1427 5.00446 11.1915 5.07834 11.2533 5.14063L18.1133 12.0006L11.2533 18.8606C11.1441 18.9882 11.087 19.1522 11.0935 19.32C11.1 19.4878 11.1696 19.6469 11.2883 19.7657C11.407 19.8844 11.5662 19.954 11.734 19.9604C11.9017 19.9669 12.0658 19.9099 12.1933 19.8006L20 12.0006L12.1933 4.19397C12.0997 4.10223 11.9812 4.04011 11.8525 4.01537C11.7238 3.99064 11.5907 4.00438 11.4697 4.05489C11.3488 4.10539 11.2454 4.19042 11.1726 4.29934C11.0997 4.40827 11.0605 4.53625 11.06 4.6673Z" fill="#4B5563"/>
      <path d="M3.72699 4.6673C3.72649 4.75504 3.7433 4.84201 3.77648 4.92324C3.80966 5.00446 3.85854 5.07834 3.92033 5.14063L10.7803 12.0006L3.92033 18.8606C3.81111 18.9882 3.75404 19.1522 3.76052 19.32C3.767 19.4878 3.83655 19.6469 3.95528 19.7657C4.07401 19.8844 4.23317 19.954 4.40096 19.9604C4.56874 19.9669 4.73279 19.9099 4.86033 19.8006L12.667 12.0006L4.86033 4.19397C4.76674 4.10223 4.64818 4.04011 4.51949 4.01537C4.39079 3.99064 4.25766 4.00438 4.13673 4.05489C4.0158 4.10539 3.91244 4.19042 3.83956 4.29934C3.76669 4.40827 3.72753 4.53625 3.72699 4.6673Z" fill="#4B5563"/>
    </g>
    <defs>
      <clipPath id="clip0_2438_2128">
        <rect width="24" height="24" fill="white" transform="matrix(0 -1 -1 0 24 24)"/>
      </clipPath>
    </defs>
  </svg>
);

const MoveCandidateIcon = () => (
  <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.66536 7.33073C9.50631 7.33073 10.9987 5.83835 10.9987 3.9974C10.9987 2.15645 9.50631 0.664062 7.66536 0.664062C5.82442 0.664062 4.33203 2.15645 4.33203 3.9974C4.33203 5.83835 5.82442 7.33073 7.66536 7.33073Z" stroke="currentColor"/>
    <path d="M12.6654 15.6667C14.5063 15.6667 15.9987 14.1743 15.9987 12.3333C15.9987 10.4924 14.5063 9 12.6654 9C10.8244 9 9.33203 10.4924 9.33203 12.3333C9.33203 14.1743 10.8244 15.6667 12.6654 15.6667Z" stroke="currentColor"/>
    <path d="M11.5547 12.3345L12.2493 13.1678L13.7769 11.5938" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.1667 10.1085C9.39467 9.93277 8.55075 9.83594 7.66667 9.83594C3.98477 9.83594 1 11.5149 1 13.5859C1 15.657 1 17.3359 7.66667 17.3359C12.4062 17.3359 13.7763 16.4874 14.1723 15.2526" stroke="currentColor"/>
  </svg>
);

const ArchiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.83789 11.9968C8.83789 11.4276 8.83789 11.1429 8.92312 10.9183C9.03676 10.619 9.25473 10.3811 9.52908 10.257C9.73484 10.1641 9.99574 10.1641 10.5174 10.1641H13.8764C14.398 10.1641 14.6589 10.1641 14.8647 10.257C15.139 10.3811 15.357 10.619 15.4707 10.9183C15.5559 11.1429 15.5559 11.4276 15.5559 11.9968C15.5559 12.5661 15.5559 12.8508 15.4707 13.0753C15.357 13.3747 15.139 13.6126 14.8647 13.7366C14.6589 13.8296 14.398 13.8296 13.8764 13.8296H10.5174C9.99574 13.8296 9.73484 13.8296 9.52908 13.7366C9.25473 13.6126 9.03676 13.3747 8.92312 13.0753C8.83789 12.8508 8.83789 12.5661 8.83789 11.9968Z" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M21.714 5.89062V13.2217C21.714 17.8295 21.714 20.1335 20.4022 21.5649C19.0905 22.9964 16.9792 22.9964 12.7567 22.9964H11.637C7.41449 22.9964 5.30323 22.9964 3.99146 21.5649C2.67969 20.1335 2.67969 17.8295 2.67969 13.2217V5.89062" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M1 3.44368C1 2.29172 1 1.71574 1.32794 1.35786C1.65589 1 2.1837 1 3.23933 1H21.154C22.2096 1 22.7374 1 23.0654 1.35786C23.3933 1.71574 23.3933 2.29172 23.3933 3.44368C23.3933 4.59564 23.3933 5.17161 23.0654 5.52949C22.7374 5.88735 22.2096 5.88735 21.154 5.88735H3.23933C2.1837 5.88735 1.65589 5.88735 1.32794 5.52949C1 5.17161 1 4.59564 1 3.44368Z" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);



  const handleCandidateClick = (candidate: number) => {
    setSelectedCandidate(candidate);
    setShowCandidateProfile(true);
    setActiveProfileTab("profile");
  };

  const handleAccessSubmit = async () => {
    if (!accessEmail.trim()) {
      showToast.error("Please enter an email address");
      return;
    }
    if (!accessEmail.includes("@")) {
      showToast.error("Please enter a valid email address");
      return;
    }
    setIsSharing(true);
    try {
      const accessLevelMap = {
        view: "VIEW_ONLY",
        edit: "CAN_EDIT",
      };
      const mappedAccessLevel = accessLevelMap[accessLevel] || "VIEW_ONLY";
      await apiClient.post(`/jobs/roles/${jobId}/share-pipeline/`, {
        email: accessEmail,
        access_level: mappedAccessLevel,
      });
      const displayAccessLevel =
        accessLevel === "edit" ? "Can Edit" : "View Only";
      showToast.success(
        `Access granted to ${accessEmail} with ${displayAccessLevel} permissions`
      );
      setShowAccessModal(false);
      setAccessEmail("");
      setAccessLevel("view");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to share access";
      showToast.error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const CustomFileIcon = () => (
  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.89941 7.3C5.89941 6.97387 5.89941 6.81077 5.9527 6.68211C6.02374 6.51061 6.16002 6.37432 6.33154 6.30327C6.46018 6.25 6.62328 6.25 6.94941 6.25H9.04941C9.37554 6.25 9.53864 6.25 9.6673 6.30327C9.8388 6.37432 9.97509 6.51061 10.0461 6.68211C10.0994 6.81077 10.0994 6.97387 10.0994 7.3C10.0994 7.62613 10.0994 7.78923 10.0461 7.91789C9.97509 8.08939 9.8388 8.22568 9.6673 8.29673C9.53864 8.35 9.37554 8.35 9.04941 8.35H6.94941C6.62328 8.35 6.46018 8.35 6.33154 8.29673C6.16002 8.22568 6.02374 8.08939 5.9527 7.91789C5.89941 7.78923 5.89941 7.62613 5.89941 7.3Z" stroke="#818283" strokeWidth="1.25"/>
    <path d="M13.9498 3.80469V8.00469C13.9498 10.6445 13.9498 11.9645 13.1297 12.7846C12.3096 13.6047 10.9896 13.6047 8.3498 13.6047H7.6498C5.00994 13.6047 3.69001 13.6047 2.8699 12.7846C2.0498 11.9645 2.0498 10.6445 2.0498 8.00469V3.80469" stroke="#818283" strokeWidth="1.25" strokeLinecap="round"/>
    <path d="M1 2.4C1 1.74003 1 1.41005 1.20502 1.20502C1.41005 1 1.74003 1 2.4 1H13.6C14.26 1 14.5899 1 14.795 1.20502C15 1.41005 15 1.74003 15 2.4C15 3.05997 15 3.38995 14.795 3.59498C14.5899 3.8 14.26 3.8 13.6 3.8H2.4C1.74003 3.8 1.41005 3.8 1.20502 3.59498C1 3.38995 1 3.05997 1 2.4Z" stroke="#818283" strokeWidth="1.25"/>
  </svg>
);

  const renderCandidateCard = (candidate: any, stage: string) => (
  <div
    key={candidate.id}
    draggable
    onDragStart={() => handleDragStart(candidate, stage)}
    className="bg-white rounded-2xl p-4 mb-2 cursor-move hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
  >
    {/* Main Grid Container - 12 columns */}
    <div className="grid grid-cols-12 gap-3 items-start">
      
      {/* Profile Initials */}
      <div className="col-span-2">
        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {candidate.name.split(/\s+/).map((word: any) => word[0].toUpperCase()).join("").slice(0, 2)}
          </span>
        </div>
      </div>
      
      {/* Name and Title */}
      <div className="col-span-7">
        <button
          onClick={() => handleCandidateClick(candidate)}
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block mb-1"
        >
          {candidate.name}
        </button>
        <p className="text-xs text-blue-600">
          {candidate.role} | {candidate.company}
        </p>
      </div>
      
      {/* Percentage Badge */}
      <div className="col-span-3 text-right">
        <span className="text-lg font-[400] text-blue-600 bg-blue-50 border border-gray-200 px-1 rounded-md">
          75%
        </span>
      </div>
      
      {/* Experience Info - starts from column 3 */}
      <div className="col-start-3 col-span-10">
        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
          <span>5Y • 15 NP • 20 LPA • Bangalore</span>
        </div>
      </div>
      
      {/* Social Icons - starts from column 3 */}
      <div className="col-start-3 col-span-7">
        <div className="flex gap-2 mt-2">
          <button className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors">
            <Linkedin className="w-3 h-3 text-blue-600" />
          </button>
          <button className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors">
            <Github className="w-3 h-3 text-blue-600" />
          </button>
          <button className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center hover:bg-blue-50 transition-colors">
            <Copy className="w-3 h-3 text-blue-600" />
          </button>
        </div>
      </div>
      
      {/* Custom File Icon - below percentage, right aligned */}
      <div className="mt-2 col-start-10 col-span-3 text-right">
        <button className="w-6 h-6 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors ml-auto">
          <CustomFileIcon />
        </button>
      </div>
      
    </div>
  </div>
);

  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  const renderCandidateProfile = () => {
  if (!selectedCandidate) return null;

  const details = candidateDetails?.candidate;
  const displayCandidate = details || selectedCandidate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[60] flex">
      <div className="ml-auto w-2/3 bg-gray-100 shadow-xl h-full overflow-y-auto py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setShowCandidateProfile(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <BackArrowIcon />
            </button>
            
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg px-3 py-2 bg-[#ECF1FF]">
              <Share2 size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="overflow-hidden">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl shadow-sm p-8 pb-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                {/* Profile Info */}
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                    {displayCandidate.avatar_url ? (
                      <img
                        src={displayCandidate.avatar_url}
                        alt={displayCandidate.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                        {selectedCandidate.avatar}
                      </div>
                    )}
                  </div>
                
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h1>
                      <span className="bg-blue-100 text-blue-600 text-sm px-2 py-1 rounded-md font-medium">75%</span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {displayCandidate.headline || `${selectedCandidate.role} | ${selectedCandidate.company}`}
                    </p>
                    <p className="text-gray-500 text-sm">Bangalore, India</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-right text-gray-600">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-sm">{displayCandidate.candidate_email || "Shikhasingh1220@gmail.com"}</span>
                    <MailIcon className="w-4 h-4 text-gray-400"/>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm">{displayCandidate.candidate_phone || "9375 4575 45"}</span>
                    <PhoneIcon className="w-4 h-4 text-gray-400"/>
                  </div>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="pl-12 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <g clip-path="url(#clip0_2718_9541)">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.961 0.937501H9.039C9.71288 0.937478 10.2748 0.937463 10.7209 0.997433C11.1917 1.06074 11.6168 1.19999 11.9584 1.5416C12.3 1.8832 12.4393 2.3083 12.5026 2.77914C12.5469 3.10884 12.5584 3.50182 12.5615 3.9565C13.0478 3.97211 13.4814 4.00055 13.8668 4.05236C14.746 4.17057 15.4578 4.41966 16.0191 4.98093C16.5803 5.54221 16.8294 6.25392 16.9477 7.13324C17.0625 7.98765 17.0625 9.07935 17.0625 10.4577V10.5423C17.0625 11.9207 17.0625 13.0124 16.9477 13.8668C16.8294 14.7461 16.5803 15.4578 16.0191 16.0191C15.4578 16.5803 14.746 16.8294 13.8668 16.9477C13.0124 17.0625 11.9207 17.0625 10.5423 17.0625H7.45769C6.07937 17.0625 4.98764 17.0625 4.13324 16.9477C3.25392 16.8294 2.54221 16.5803 1.98093 16.0191C1.41966 15.4578 1.17057 14.7461 1.05236 13.8668C0.937478 13.0124 0.937485 11.9207 0.9375 10.5423V10.4577C0.937485 9.07935 0.937478 7.98765 1.05236 7.13324C1.17057 6.25392 1.41966 5.54221 1.98093 4.98093C2.54221 4.41966 3.25392 4.17057 4.13324 4.05236C4.51856 4.00055 4.95216 3.97211 5.43855 3.9565C5.44155 3.50182 5.45311 3.10884 5.49743 2.77914C5.56074 2.3083 5.69999 1.8832 6.0416 1.5416C6.3832 1.19999 6.8083 1.06074 7.27914 0.997433C7.72522 0.937463 8.28713 0.937478 8.961 0.937501ZM6.56385 3.93884C6.84745 3.93749 7.1452 3.9375 7.45768 3.9375H10.5423C10.8548 3.9375 11.1526 3.93749 11.4362 3.93884C11.433 3.5111 11.4225 3.18844 11.3876 2.92904C11.3411 2.58295 11.2606 2.43483 11.1629 2.33709C11.0652 2.23935 10.9171 2.15894 10.5709 2.11241C10.2087 2.0637 9.723 2.0625 9 2.0625C8.277 2.0625 7.7913 2.0637 7.42904 2.11241C7.08295 2.15894 6.93482 2.23935 6.83709 2.33709C6.73935 2.43483 6.65894 2.58295 6.61241 2.92904C6.57753 3.18844 6.56701 3.5111 6.56385 3.93884ZM4.28314 5.16732C3.52857 5.26877 3.09383 5.45903 2.77643 5.77643C2.45902 6.09383 2.26877 6.52857 2.16732 7.28314C2.06369 8.05388 2.0625 9.0699 2.0625 10.5C2.0625 11.9301 2.06369 12.9461 2.16732 13.7169C2.26877 14.4714 2.45902 14.9062 2.77643 15.2236C3.09383 15.541 3.52857 15.7313 4.28314 15.8327C5.05388 15.9363 6.06988 15.9375 7.5 15.9375H10.5C11.9301 15.9375 12.9461 15.9363 13.7169 15.8327C14.4714 15.7313 14.9062 15.541 15.2236 15.2236C15.541 14.9062 15.7313 14.4714 15.8327 13.7169C15.9363 12.9461 15.9375 11.9301 15.9375 10.5C15.9375 9.0699 15.9363 8.05388 15.8327 7.28314C15.7313 6.52857 15.541 6.09383 15.2236 5.77643C14.9062 5.45903 14.4714 5.26877 13.7169 5.16732C12.9461 5.0637 11.9301 5.0625 10.5 5.0625H7.5C6.06988 5.0625 5.05388 5.0637 4.28314 5.16732Z" fill="#4B5563"/>
                      <path d="M12.75 6.75C12.75 7.16422 12.4142 7.5 12 7.5C11.5858 7.5 11.25 7.16422 11.25 6.75C11.25 6.33579 11.5858 6 12 6C12.4142 6 12.75 6.33579 12.75 6.75Z" fill="#4B5563"/>
                      <path d="M6.75 6.75C6.75 7.16422 6.41422 7.5 6 7.5C5.58579 7.5 5.25 7.16422 5.25 6.75C5.25 6.33579 5.58579 6 6 6C6.41422 6 6.75 6.33579 6.75 6.75Z" fill="#4B5563"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_2718_9541">
                      <rect width="18" height="18" fill="white"/>
                      </clipPath>
                      </defs>
                    </svg>

                    <span>{displayCandidate.total_experience || "5"} Years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M5.01163 2C5.30061 2 5.53488 2.23985 5.53488 2.53571V3.08051C5.99677 3.07142 6.50563 3.07142 7.06529 3.07143H9.9347C10.4944 3.07142 11.0033 3.07142 11.4651 3.08051V2.53571C11.4651 2.23985 11.6994 2 11.9884 2C12.2773 2 12.5116 2.23985 12.5116 2.53571V3.12649C12.693 3.14065 12.8647 3.15844 13.0272 3.18081C13.8452 3.2934 14.5073 3.53063 15.0294 4.06517C15.5515 4.59972 15.7832 5.27754 15.8932 6.11499C15.9283 6.38262 15.9519 6.67471 15.9677 6.99291C15.9886 7.05076 16 7.11329 16 7.17857C16 7.22809 15.9934 7.27603 15.9812 7.32154C16 7.89436 16 8.54486 16 9.28114V10.75C16 11.0459 15.7657 11.2857 15.4767 11.2857C15.1878 11.2857 14.9535 11.0459 14.9535 10.75V9.32143C14.9535 8.71143 14.9533 8.1805 14.9443 7.71429H2.05564C2.04674 8.1805 2.04651 8.71143 2.04651 9.32143V10.75C2.04651 12.112 2.04762 13.0796 2.14402 13.8137C2.23839 14.5323 2.41537 14.9464 2.71063 15.2486C3.00589 15.5509 3.4103 15.7321 4.11222 15.8287C4.82919 15.9274 5.77431 15.9286 7.10465 15.9286H9.89535C10.1843 15.9286 10.4186 16.1684 10.4186 16.4643C10.4186 16.7601 10.1843 17 9.89535 17H7.0653C5.78314 17 4.76757 17 3.97278 16.8906C3.15481 16.778 2.49275 16.5408 1.97063 16.0063C1.44852 15.4717 1.21681 14.7939 1.10684 13.9564C0.999979 13.1427 0.999986 12.103 1 10.7903V9.28114C0.999993 8.54479 0.999986 7.89436 1.01884 7.32155C1.00657 7.27604 1 7.22809 1 7.17857C1 7.1133 1.0114 7.05075 1.03228 6.9929C1.0481 6.6747 1.07169 6.38261 1.10684 6.11499C1.21681 5.27754 1.44852 4.59972 1.97063 4.06517C2.49275 3.53063 3.15481 3.2934 3.97278 3.18081C4.13528 3.15844 4.30702 3.14065 4.48837 3.12649V2.53571C4.48837 2.23985 4.72264 2 5.01163 2ZM2.1035 6.64286H14.8965C14.8853 6.50758 14.8719 6.37945 14.856 6.25775C14.7616 5.53911 14.5846 5.12508 14.2894 4.82279C13.9941 4.52049 13.5897 4.3393 12.8878 4.24269C12.1708 4.14399 11.2257 4.14286 9.89535 4.14286H7.10465C5.77431 4.14286 4.82919 4.14399 4.11222 4.24269C3.4103 4.3393 3.00589 4.52049 2.71063 4.82279C2.41537 5.12508 2.23839 5.53911 2.14402 6.25775C2.12804 6.37945 2.11467 6.50758 2.1035 6.64286ZM12.686 12C11.8191 12 11.1163 12.7196 11.1163 13.6071C11.1163 14.4947 11.8191 15.2143 12.686 15.2143C13.553 15.2143 14.2558 14.4947 14.2558 13.6071C14.2558 12.7196 13.553 12 12.686 12ZM10.0698 13.6071C10.0698 12.1278 11.2411 10.9286 12.686 10.9286C14.131 10.9286 15.3023 12.1278 15.3023 13.6071C15.3023 14.1531 15.1428 14.6609 14.8689 15.0843L15.8467 16.0855C16.0511 16.2947 16.0511 16.6339 15.8467 16.8431C15.6424 17.0523 15.3111 17.0523 15.1068 16.8431L14.1288 15.8419C13.7153 16.1224 13.2193 16.2857 12.686 16.2857C11.2411 16.2857 10.0698 15.0865 10.0698 13.6071Z" fill="#4B5563"/>
                    </svg>
                    <span>{displayCandidate.notice_period_days || "15"} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <g clip-path="url(#clip0_2718_9537)">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.961 0.937501H9.039C9.71288 0.937478 10.2748 0.937463 10.7209 0.997433C11.1917 1.06074 11.6168 1.19999 11.9584 1.5416C12.3 1.8832 12.4393 2.3083 12.5026 2.77914C12.5469 3.10884 12.5584 3.50182 12.5615 3.9565C13.0478 3.97211 13.4814 4.00055 13.8668 4.05236C14.746 4.17057 15.4578 4.41966 16.0191 4.98093C16.5803 5.54221 16.8294 6.25392 16.9477 7.13324C17.0625 7.98765 17.0625 9.07935 17.0625 10.4577V10.5423C17.0625 11.9207 17.0625 13.0124 16.9477 13.8668C16.8294 14.7461 16.5803 15.4578 16.0191 16.0191C15.4578 16.5803 14.746 16.8294 13.8668 16.9477C13.0124 17.0625 11.9207 17.0625 10.5423 17.0625H7.45769C6.07937 17.0625 4.98764 17.0625 4.13324 16.9477C3.25392 16.8294 2.54221 16.5803 1.98093 16.0191C1.41966 15.4578 1.17057 14.7461 1.05236 13.8668C0.937478 13.0124 0.937485 11.9207 0.9375 10.5423V10.4577C0.937485 9.07935 0.937478 7.98765 1.05236 7.13324C1.17057 6.25392 1.41966 5.54221 1.98093 4.98093C2.54221 4.41966 3.25392 4.17057 4.13324 4.05236C4.51856 4.00055 4.95216 3.97211 5.43855 3.9565C5.44155 3.50182 5.45311 3.10884 5.49743 2.77914C5.56074 2.3083 5.69999 1.8832 6.0416 1.5416C6.3832 1.19999 6.8083 1.06074 7.27914 0.997433C7.72522 0.937463 8.28713 0.937478 8.961 0.937501ZM6.56385 3.93884C6.84745 3.93749 7.1452 3.9375 7.45768 3.9375H10.5423C10.8548 3.9375 11.1526 3.93749 11.4362 3.93884C11.433 3.5111 11.4225 3.18844 11.3876 2.92904C11.3411 2.58295 11.2606 2.43483 11.1629 2.33709C11.0652 2.23935 10.9171 2.15894 10.5709 2.11241C10.2087 2.0637 9.723 2.0625 9 2.0625C8.277 2.0625 7.7913 2.0637 7.42904 2.11241C7.08295 2.15894 6.93482 2.23935 6.83709 2.33709C6.73935 2.43483 6.65894 2.58295 6.61241 2.92904C6.57753 3.18844 6.56701 3.5111 6.56385 3.93884ZM4.28314 5.16732C3.52857 5.26877 3.09383 5.45903 2.77643 5.77643C2.45902 6.09383 2.26877 6.52857 2.16732 7.28314C2.06369 8.05388 2.0625 9.0699 2.0625 10.5C2.0625 11.9301 2.06369 12.9461 2.16732 13.7169C2.26877 14.4714 2.45902 14.9062 2.77643 15.2236C3.09383 15.541 3.52857 15.7313 4.28314 15.8327C5.05388 15.9363 6.06988 15.9375 7.5 15.9375H10.5C11.9301 15.9375 12.9461 15.9363 13.7169 15.8327C14.4714 15.7313 14.9062 15.541 15.2236 15.2236C15.541 14.9062 15.7313 14.4714 15.8327 13.7169C15.9363 12.9461 15.9375 11.9301 15.9375 10.5C15.9375 9.0699 15.9363 8.05388 15.8327 7.28314C15.7313 6.52857 15.541 6.09383 15.2236 5.77643C14.9062 5.45903 14.4714 5.26877 13.7169 5.16732C12.9461 5.0637 11.9301 5.0625 10.5 5.0625H7.5C6.06988 5.0625 5.05388 5.0637 4.28314 5.16732ZM9 6.9375C9.31065 6.9375 9.5625 7.18934 9.5625 7.5V7.50765C10.3791 7.71338 11.0625 8.35725 11.0625 9.24998C11.0625 9.56063 10.8106 9.81248 10.5 9.81248C10.1894 9.81248 9.9375 9.56063 9.9375 9.24998C9.9375 8.96198 9.61815 8.56253 9 8.56253C8.38185 8.56253 8.0625 8.96198 8.0625 9.24998C8.0625 9.53805 8.38185 9.9375 9 9.9375C10.0387 9.9375 11.0625 10.6574 11.0625 11.75C11.0625 12.6428 10.3791 13.2866 9.5625 13.4924V13.5C9.5625 13.8107 9.31065 14.0625 9 14.0625C8.68935 14.0625 8.4375 13.8107 8.4375 13.5V13.4924C7.6209 13.2866 6.9375 12.6428 6.9375 11.75C6.9375 11.4394 7.18934 11.1875 7.5 11.1875C7.81065 11.1875 8.0625 11.4394 8.0625 11.75C8.0625 12.038 8.38185 12.4375 9 12.4375C9.61815 12.4375 9.9375 12.038 9.9375 11.75C9.9375 11.462 9.61815 11.0625 9 11.0625C7.96133 11.0625 6.9375 10.3427 6.9375 9.24998C6.9375 8.35725 7.6209 7.71338 8.4375 7.50765V7.5C8.4375 7.18934 8.68935 6.9375 9 6.9375Z" fill="#4B5563"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_2718_9537">
                      <rect width="18" height="18" fill="white"/>
                      </clipPath>
                      </defs>
                    </svg>
                    <span>{displayCandidate.current_salary || "20"} LPA</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                    <MoveCandidateIcon />
                    Move to Next Round
                  </button>
                  <button className="border border-gray-300 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <ArchiveIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="">
              {/* Profile Summary */}
              <section className="p-4 bg-white rounded-3xl shadow-sm mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {displayCandidate.profile_summary || selectedCandidate.profileSummary || 
                  "Skilled professional with extensive experience in their field, demonstrating strong technical capabilities and excellent communication skills throughout the interview process."}
                </p>
              </section>

              {/* Experience */}
              <section className="p-4 bg-white rounded-3xl shadow-sm mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Experience</h2>
                
                {(details?.experience || [
                  {
                    job_title: "AI Engineer - Analyst",
                    company: "Jupiter Fintech Pvt.Ltd",
                    location: "Bangalore, Karnataka",
                    start_date: "12/2019",
                    end_date: null,
                    description: "I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs).",
                    is_current: true,
                  },
                  {
                    job_title: "Digital Marketing, Gen AI Team",
                    company: "Google",
                    location: "Bangalore, Karnataka",
                    start_date: "11/2022",
                    end_date: "11/2024",
                    description: "Worked on digital marketing strategies and AI implementation.",
                    is_current: false,
                  },
                  {
                    job_title: "Software Engineer Gen AI",
                    company: "Hexaware Technologies",
                    location: "Chennai, Tamil Nadu",
                    start_date: "11/2020",
                    end_date: "Present",
                    description: "Developed AI solutions and software engineering projects.",
                    is_current: false,
                  }
                ]).map((exp, index) => {
                  // Generate company initial for icon
                  const companyInitial = exp.company.charAt(0).toUpperCase();
                  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500'];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <div key={index} className="flex gap-4 mb-6">
                      <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-lg">{companyInitial}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{exp.job_title}</h3>
                            <p className="text-gray-600 text-sm">{exp.company} | {exp.location}</p>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Skills */}
              <section className="p-4 bg-white rounded-3xl shadow-sm mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                
                {/* Resume Skills */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Resume Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(details?.skills_data?.skills_mentioned?.map((s) => s.skill) || 
                      selectedCandidate.skills || 
                      ['Python', 'Flask', 'Javascript', 'ReactJS', 'C#', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Git']
                    ).map((skill, index) => (
                      <span key={`resume-${index}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="text-blue-600 text-sm mt-2 hover:underline">Show more verified skills</button>
                </div>

                {/* Resume Skills (Second Row) */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Resume Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(details?.skills_data?.skills_mentioned?.map((s) => s.skill) || 
                      selectedCandidate.skills || 
                      ['Python', 'Flask', 'Javascript', 'ReactJS', 'C#', 'Data Analysis', 'Computer Vision', 'NLP', 'AWS', 'Docker', 'Kubernetes']
                    ).slice(0, 11).map((skill, index) => (
                      <span key={`resume2-${index}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="text-blue-600 text-sm mt-2 hover:underline">Show more skills</button>
                </div>
              </section>

              {/* Assessment */}
              <section className="p-4 bg-white rounded-3xl shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Assessment</h2>
                  <span className="text-gray-500 text-sm">02/08/2024</span>
                </div>

                {/* Assessment Tabs */}
                <div className="flex mb-6 border-b border-gray-200">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                    onClick={() => setShowAssessmentModal(false)}
                  >
                    Coding Round
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => setShowAssessmentModal(true)}
                  >
                    AI Interview
                  </button>
                </div>

                {showAssessmentModal ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Side - Scores */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Overall Score</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Resume</span>
                          <span className="text-sm font-medium text-gray-900">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '72%'}}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Knowledge</span>
                          <span className="text-sm font-medium text-gray-900">80%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Communication</span>
                          <span className="text-sm font-medium text-gray-900">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Verdict Skills */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Verdict Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">Money Ads • 3.5</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Flutter • 4</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">SEO • 4.5</span>
                      </div>
                      <button className="text-blue-600 text-sm mt-2 hover:underline">Show more skills</button>
                    </div>
                  </div>

                  {/* Right Side - General Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">General Summary</h3>
                    <p className="text-gray-700 text-sm mb-4">
                      {displayCandidate.full_name} demonstrates solid technical knowledge and experience in ML Engineering with significant expertise in modern frameworks.
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Potential Red Flags</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>1. Too warm room</li>
                        <li>2. Cannot noise</li>
                        <li>3. Slightly low eye contact</li>
                        <li>4. Sub-optimal background</li>
                      </ul>
                    </div>
                    
                    <button className="text-blue-600 text-sm mt-4 hover:underline">Show Interview Details</button>
                  </div>
                  </div>
                ):(
                  <div className="w-full mb-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Questions (3)</span>
                    <span className="text-gray-500 text-sm">Score: 4/5</span>
                  </div>

                  {/* Question Items */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Q{num}.</span>
                          <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="text-xs">Expand</span>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <span className="text-xs">Easy</span>
                            </button>
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Write a function to reverse a given string. For example, if the input is "hello" the output should be "olleh"
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Python</span>
                          <span>• 7 hidden tests</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  </div>
                )}

                
              </section>

              {/* Notes */}
              <section className="p-4 bg-white rounded-3xl shadow-sm mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                
                <div className="space-y-4">
                  {/* Note 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">SV</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">Name of the person</span>
                          <span className="text-gray-500 text-xs ml-2">Company</span>
                        </div>
                        <span className="text-gray-400 text-xs">Posted Date</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        The innovative AI engineer skillfully solved complex problems, collaborated effectively, and delivered precise, reusable solutions with creative insight.
                      </p>
                    </div>
                  </div>

                  {/* Note 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">SV</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">Name of the person</span>
                          <span className="text-gray-500 text-xs ml-2">Company</span>
                        </div>
                        <span className="text-gray-400 text-xs">Posted Date</span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        The innovative AI engineer skillfully solved complex problems, collaborated effectively, and delivered precise, reusable solutions with creative insight.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* References */}
              <section className="p-4 bg-white rounded-3xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">References</h2>
                
                <div className="space-y-4">
                  {/* Reference 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">SV</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">Suchondhi Verma</h3>
                          <p className="text-gray-500 text-xs">HR Manager at Suprhit</p>
                          <p className="text-gray-700 text-sm mt-2">
                            Experienced digital marketer across strategic campaigns and data-driven approach have significantly boosted our brand's online presence. Her expertise in both creative and analytical...
                          </p>
                          
                          {/* Contact Icons */}
                          <div className="flex items-center gap-2 mt-3">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Phone size={12} className="text-white" />
                            </div>
                            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                              <Mail size={12} className="text-white" />
                            </div>
                            <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                              <Linkedin size={12} className="text-white" />
                            </div>
                          </div>
                          
                          <button className="text-blue-600 text-sm mt-2 hover:underline">View Less</button>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reference 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">AA</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">Ana De Armas</h3>
                          <p className="text-gray-500 text-xs">HR Manager at Suprhit</p>
                          <p className="text-gray-700 text-sm mt-2">
                            I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs). I hold...
                          </p>
                          
                          <button className="text-blue-600 text-sm mt-2 hover:underline">View More</button>
                        </div>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✗</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


  const getStageCount = (stageName: string) =>
    stageCandidates[stageName]?.length || 0;

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>You need to be logged in to view this page.</div>;
  }

  if (isFetching) {
    return <div>Loading pipeline data...</div>;
  }

  return (
    <>
      <div className="bg-gradient-to-b from-[#F2F5FF] to-[#DAF0FF]">
        <div className="mb-4 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between max-w-full mx-auto px-7 py-2">
          {/* logo */}
          <div className="flex items-center">
                <svg
                  width="100"
                  height="22"
                  viewBox="0 0 100 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer"
                  onClick={onBack}
                >
                  <g clip-path="url(#clip0_1918_2679)">
                    <path
                      d="M0 17.4101V0H3.25043L12.5221 14.2182H12.7353L12.5488 0H14.92V17.4101H11.9626L2.45115 2.8753H2.21136L2.39786 17.4101H0Z"
                      fill="url(#paint0_linear_1918_2679)"
                    />
                    <path
                      d="M17.8619 17.4113L22.5243 10.6056L17.8086 3.77344H20.6593L23.9098 9.26024H24.2561L27.4533 3.77344H30.2774L25.6149 10.6056L30.384 17.4113H27.5333L24.2561 11.8981H23.9098L20.7127 17.4113H17.8619Z"
                      fill="url(#paint1_linear_1918_2679)"
                    />
                    <path
                      d="M37.8223 17.6755C36.5435 17.6755 35.5932 17.3326 34.9715 16.6468C34.3499 15.9609 34.0391 14.9146 34.0391 13.5076V5.77863H31.9609L31.9876 3.77383H33.2931C33.7371 3.77383 34.0568 3.69469 34.2522 3.53642C34.4654 3.37815 34.5897 3.11436 34.6252 2.74506L34.8916 0.6875H36.3836V3.77383H40.3534V5.805H36.3836V13.4549C36.3836 14.1583 36.5435 14.6683 36.8632 14.9849C37.2007 15.2838 37.6803 15.4333 38.3019 15.4333C38.6394 15.4333 38.9858 15.3893 39.341 15.3014C39.714 15.2135 40.0781 15.0376 40.4333 14.7738V17.1743C39.9182 17.3677 39.4386 17.4996 38.9946 17.57C38.5683 17.6404 38.1776 17.6755 37.8223 17.6755Z"
                      fill="url(#paint2_linear_1918_2679)"
                    />
                    <path
                      d="M55.277 17.4101V0H57.7282V17.4101H55.277ZM43.6074 17.4101V0H46.0586V17.4101H43.6074ZM44.833 9.54914V7.46523H56.2627V9.54914H44.833Z"
                      fill="black"
                    />
                    <path
                      d="M66.9526 22.0013C66.2243 22.0013 65.505 21.9133 64.7945 21.7375C64.1018 21.5792 63.4623 21.333 62.8762 20.9989C62.29 20.6647 61.8105 20.2338 61.4375 19.7063L62.6631 17.9653C63.0716 18.5632 63.6489 19.0204 64.3949 19.337C65.1409 19.6535 65.9579 19.8118 66.846 19.8118C67.8407 19.8118 68.6666 19.592 69.3238 19.1523C69.9987 18.7303 70.505 18.0708 70.8424 17.1739C71.1799 16.2594 71.3575 15.1252 71.3753 13.7711L71.6684 11.0277H71.1622C70.9668 12.3114 70.6559 13.3402 70.2296 14.1139C69.8211 14.8702 69.306 15.4153 68.6844 15.7494C68.0805 16.0836 67.3789 16.2506 66.5795 16.2506C65.5849 16.2506 64.7412 16.0045 64.0485 15.5121C63.3736 15.0021 62.8585 14.2634 62.5032 13.2962C62.148 12.3114 61.9704 11.1156 61.9704 9.70871V3.77344H64.3949V9.18112C64.3949 10.8869 64.6346 12.1444 65.1142 12.9533C65.6115 13.7447 66.3486 14.1403 67.3255 14.1403C67.8584 14.1403 68.338 14.0084 68.7643 13.7447C69.1905 13.4809 69.5547 13.0939 69.8567 12.5839C70.1764 12.074 70.425 11.4321 70.6027 10.6583C70.798 9.86695 70.9223 8.95248 70.9756 7.91492V3.77344H73.4001V13.903C73.4001 14.9757 73.3202 15.9429 73.1604 16.8046C73.0005 17.6664 72.7429 18.4137 72.3877 19.0468C72.0502 19.6975 71.624 20.2426 71.1088 20.6823C70.5937 21.122 69.9899 21.4473 69.2972 21.6583C68.6045 21.8869 67.8229 22.0013 66.9526 22.0013Z"
                      fill="black"
                    />
                    <path
                      d="M77.582 17.4105V3.77262H79.7668L79.5536 8.52079H80.0065C80.1664 7.48324 80.4151 6.58636 80.7525 5.83017C81.0901 5.07398 81.5341 4.48485 82.0847 4.06278C82.6528 3.64072 83.3544 3.42969 84.1897 3.42969C84.3667 3.42969 84.5716 3.44728 84.8019 3.48245C85.0331 3.50003 85.2995 3.56158 85.6019 3.6671L85.4683 6.1731C85.2019 6.06758 84.9356 5.99723 84.6692 5.96207C84.4028 5.90931 84.1454 5.88292 83.8962 5.88292C83.2036 5.88292 82.5995 6.10275 82.0847 6.5424C81.5874 6.98205 81.17 7.57997 80.8325 8.33615C80.495 9.07478 80.2197 9.91013 80.0065 10.8422V17.4105H77.582Z"
                      fill="black"
                    />
                    <path
                      d="M93.9048 17.7535C92.8212 17.7535 91.8622 17.5951 91.0269 17.2786C90.2097 16.9445 89.5171 16.4696 88.9491 15.8541C88.3802 15.2386 87.954 14.5089 87.6704 13.6647C87.3859 12.8206 87.2441 11.8709 87.2441 10.8158C87.2441 9.74301 87.3859 8.75823 87.6704 7.86134C87.954 6.96446 88.372 6.18189 88.922 5.51363C89.4728 4.84535 90.1482 4.33536 90.9474 3.98365C91.7466 3.61434 92.6614 3.42969 93.6917 3.42969C94.5974 3.42969 95.4228 3.57917 96.1695 3.87813C96.9155 4.17709 97.5458 4.64312 98.0605 5.27621C98.5933 5.89172 98.9933 6.6743 99.2597 7.62394C99.5261 8.55599 99.6327 9.65509 99.5794 10.9213L88.7622 11.0004V9.36494L98.1138 9.28582L97.2884 10.3937C97.3769 9.28582 97.2704 8.37135 96.9687 7.65031C96.6663 6.92929 96.231 6.38412 95.663 6.01483C95.1122 5.64552 94.4548 5.46087 93.6917 5.46087C92.8745 5.46087 92.1548 5.67189 91.5335 6.09396C90.9113 6.51602 90.4318 7.12274 90.095 7.9141C89.7753 8.70551 89.6146 9.66389 89.6146 10.7894C89.6146 12.4073 89.9794 13.6471 90.7073 14.5089C91.4359 15.3529 92.5187 15.775 93.9581 15.775C94.5081 15.775 94.9884 15.7135 95.3966 15.5904C95.8228 15.4496 96.1777 15.265 96.4622 15.0364C96.7638 14.7902 97.004 14.5089 97.1818 14.1923C97.3769 13.8758 97.5277 13.5328 97.6343 13.1635L99.7663 13.6647C99.6064 14.2978 99.3573 14.8693 99.0204 15.3793C98.6999 15.8717 98.2917 16.2938 97.7941 16.6456C97.3146 16.9972 96.7556 17.2698 96.1163 17.4633C95.4761 17.6567 94.7392 17.7535 93.9048 17.7535Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <linearGradient
                      id="paint0_linear_1918_2679"
                      x1="0"
                      y1="11"
                      x2="99.7664"
                      y2="11"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#2E62FF" />
                      <stop offset="0.317308" stop-color="#9747FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint1_linear_1918_2679"
                      x1="-9.47368e-05"
                      y1="11.0013"
                      x2="99.7663"
                      y2="11.0013"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#2E62FF" />
                      <stop offset="0.317308" stop-color="#9747FF" />
                    </linearGradient>
                    <linearGradient
                      id="paint2_linear_1918_2679"
                      x1="-0.000534999"
                      y1="11.0016"
                      x2="99.7659"
                      y2="11.0016"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#2E62FF" />
                      <stop offset="0.317308" stop-color="#9747FF" />
                    </linearGradient>
                    <clipPath id="clip0_1918_2679">
                      <rect width="100" height="22" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 font-semibold text-sm hover:bg-blue-700 rounded-lg">Explore Nxthyre</button>
          </div>
        </div>
        <div className="mx-auto max-w-[95vw] min-h-screen space-y-4">
          <div className="bg-white rounded-lg px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
      
                <h1 className="text-xl font-semibold text-gray-900">
                  Pipeline for Job ID: {jobId}
                </h1>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative hidden sm:flex items-center rounded-lg px-3 py-1 border border-blue-200 bg-blue-50 cursor-pointer w-88">
                  <input
                    type="text"
                    placeholder="Search Candidate"
                    className="text-sm bg-blue-50 text-gray-700 placeholder-gray-400 w-88"
                  />
                  <div className="w-8 h-7 flex items-center justify-center bg-blue-500 rounded-lg ml-2">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Share:</p>
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="p-1 border border-gray-300 text-gray-300 text-sm font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  className="p-1 border border-gray-300 text-gray-300 text-sm font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex space-x-4 min-w-max pb-2">
                {shareableStages.map((stage) => {
                  const candidates = stageCandidates[stage.name] || [];
                  const stageCount = getStageCount(stage.name);
                  return (
                    <div
                      key={stage.name}
                      className="w-96 h-[80vh] min-h-max"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, stage.name)}
                    >
                      <div className={`bg-white rounded-lg p-3 space-y-3`}>
                        
                          <div className="w-full flex items-center justify-between gap-4 mb-4 bg-white border border-gray-200 py-2 pr-4 rounded-md">
                            <div className="flex items-center gap-4">
                            <div className={`${stage.bgColor} w-1 h-8 rounded-tr-xl rounded-br-xl` }> 
                            </div>
                            <h3 className="font-[400] text-gray-900 text-lg">
                                {stage.name}
                            </h3>
                            </div>
                            <p
                              className={`text-lg font-[400] text-gray-500 bg-gray-100 px-1 rounded-md `}
                            >
                              {stageCount}
                            </p>
                          </div>
                        
                        <div className="overflow-y-auto max-h-[70vh] hide-scrollbar">
                          <div className="space-y-3">
                            {candidates.map((candidate: any) =>
                              renderCandidateCard(candidate, stage.name)
                            )}
                            {candidates.length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <User className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">No candidates</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
      </div>
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Share Pipeline Access
              </h3>
              <button
                onClick={() => setShowAccessModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="view"
                      checked={accessLevel === "view"}
                      onChange={(e) =>
                        setAccessLevel(e.target.value as "view" | "edit")
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      View Only
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="edit"
                      checked={accessLevel === "edit"}
                      onChange={(e) =>
                        setAccessLevel(e.target.value as "view" | "edit")
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can Edit</span>
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccessSubmit}
                  disabled={isSharing}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    isSharing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSharing ? "Sharing..." : "Share Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFeedbackModal && feedbackData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center">
          <div className="bg-white h-[70vh] w-[50vw] shadow-xl rounded-md">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {feedbackData.isMovingForward
                    ? "Move Ahead Feedback"
                    : "Move Behind Feedback"}
                </h3>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Moving{" "}
                  <span className="font-semibold">
                    {feedbackData.candidate.name}
                  </span>{" "}
                  from{" "}
                  <span className="font-semibold">
                    {feedbackData.fromStage}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">{feedbackData.toStage}</span>
                </p>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={`Moving ${feedbackData.candidate.name} to ${feedbackData.toStage} - New Stage`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 mb-4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Enter your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit and move forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCandidateProfile && renderCandidateProfile()}
    </>
  );
};

export default PipelineSharePage;
