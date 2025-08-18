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
   PhoneIcon
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
      bgColor: "bg-blue-200",
      textColor: "text-blue-400",
    },
    {
      name: "First Interview",
      color: "bg-yellow-50",
      borderColor: "border-yellow-200",
      bgColor: "bg-yellow-200",
      textColor: "text-yellow-400",
    },
    {
      name: "Other Interviews",
      color: "bg-orange-50",
      borderColor: "border-orange-200",
      bgColor: "bg-orange-200",
      textColor: "text-orange-400",
    },
    {
      name: "HR Round",
      color: "bg-red-50",
      borderColor: "border-red-200",
      bgColor: "bg-red-200",
      textColor: "text-red-400",
    },
    {
      name: "Salary Negotiation",
      color: "bg-purple-50",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-200",
      textColor: "text-purple-400",
    },
    {
      name: "Offer Sent",
      color: "bg-green-50",
      borderColor: "border-green-200",
      bgColor: "bg-green-200",
      textColor: "text-green-400",
    },
    {
      name: "Archives",
      color: "bg-gray-50",
      borderColor: "border-gray-200",
      bgColor: "bg-gray-200",
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
        <span className="text-lg font-[400] text-blue-600 bg-white border border-gray-200 p-1 rounded-md">
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

  // const renderCandidateProfile = () => {
  //   if (!selectedCandidate) return null;

  //   const details = candidateDetails?.candidate;
  //   const displayCandidate = details || selectedCandidate;

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-30 z-[60] flex">
  //       <div className="ml-auto w-2/3 bg-white shadow-xl h-full overflow-y-auto">
  //         <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
  //           <div className="flex items-center space-x-4">
  //           <button
  //             onClick={() => setShowCandidateProfile(false)}
  //             className="p-2 hover:bg-gray-100 rounded-lg"
  //           >
  //             <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
  //           </button>
  //         </div>
  //         <button className="flex items-center space-x-2 px-4 py-2 border border-blue-200 bg-blue-100 text-gray-700 rounded-lg hover:bg-blue-200 transition-colors">
  //           <Share2 className="w-4 h-4" />
  //           <span>Share</span>
  //         </button>
  //       </div>

  //         <div className="p-6">
  //           <div className="flex items-center justify-between mb-6">
  //             <div className="flex items-center space-x-4">
  //               <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
  //                 {selectedCandidate.avatar}
  //               </div>
  //               <div>
  //                 <h2 className="text-2xl font-bold text-gray-900 mb-1">
  //                   {displayCandidate.full_name}
  //                 </h2>
  //                 <p className="text-gray-600">
  //                   {displayCandidate.headline || `${selectedCandidate.role} | ${selectedCandidate.company}`}
  //                 </p>
  //                 <p className="text-gray-600 flex items-center">
  //                   <MapPin className="w-4 h-4 mr-1" />
  //                   {displayCandidate.location}
  //                 </p>
  //               </div>
  //             </div>
  //             <div className="text-right">
  //               <div className="text-3xl font-bold text-blue-600 mb-1">
  //                 {selectedCandidate.score}%
  //               </div>
  //               <div className="flex flex-col space-y-2">
  //                 <div className="text-sm text-gray-600 flex items-center">
  //                   <Mail className="w-4 h-4 mr-2" />
  //                   {displayCandidate.candidate_email || "contact@example.com"}
  //                 </div>
  //                 <div className="text-sm text-gray-600 flex items-center">
  //                   <Phone className="w-4 h-4 mr-2" />
  //                   {displayCandidate.candidate_phone || "9375 4575 45"}
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           <div className="grid grid-cols-3 gap-4 mb-8">
  //             <div className="bg-gray-50 rounded-lg p-3 text-center">
  //               <div className="flex items-center justify-center mb-1">
  //                 <Briefcase className="w-4 h-4 mr-1 text-gray-500" />
  //                 <span className="text-sm text-gray-500">Experience</span>
  //               </div>
  //               <p className="font-semibold">{displayCandidate.total_experience || "5"} Years</p>
  //             </div>
  //             <div className="bg-gray-50 rounded-lg p-3 text-center">
  //               <div className="flex items-center justify-center mb-1">
  //                 <Calendar className="w-4 h-4 mr-1 text-gray-500" />
  //                 <span className="text-sm text-gray-500">Notice Period</span>
  //               </div>
  //               <p className="font-semibold">{displayCandidate.notice_period_days || "15"} Days</p>
  //             </div>
  //             <div className="bg-gray-50 rounded-lg p-3 text-center">
  //               <div className="flex items-center justify-center mb-1">
  //                 <Star className="w-4 h-4 mr-1 text-gray-500" />
  //                 <span className="text-sm text-gray-500">Current Salary</span>
  //               </div>
  //               <p className="font-semibold">{displayCandidate.current_salary || "20"} LPA</p>
  //             </div>
  //           </div>

  //           <div className="mb-8">
  //             <div className="flex items-center space-x-3">
  //               <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
  //                 <ChevronRight className="w-4 h-4" />
  //                 <span>Move to Next Round</span>
  //               </button>
  //               <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
  //                 <Trash2 className="w-4 h-4 text-gray-500" />
  //               </button>
  //             </div>
  //           </div>
  //           </div>

  //         {/* Profile Summary */}
  //         <div className="mb-8">
  //           <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
  //           <p className="text-gray-700 leading-relaxed">
  //             {displayCandidate.profile_summary || selectedCandidate.profileSummary}
  //           </p>
  //         </div>
          
  //         {/* Experience */}
  //         <div className="mb-8">
  //           <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
  //           <div className="space-y-4">
  //             {(details?.experience || [
  //               {
  //                 job_title: "AI Engineer - Analyst",
  //                 company: "Jupiter Fintech Pvt.Ltd",
  //                 location: "Bangalore, Karnataka",
  //                 start_date: "12/2024",
  //                 end_date: null,
  //                 description: "I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs).",
  //                 is_current: true,
  //               },
  //               {
  //                 job_title: "Digital Marketing -Gen AI Team",
  //                 company: "Google",
  //                 location: "Bangalore, Karnataka",
  //                 start_date: "11/2023",
  //                 end_date: "11/2024",
  //                 description: "Worked on digital marketing strategies and AI implementation.",
  //                 is_current: false,
  //               },
  //             ]).map((exp: any, index: number) => (
  //               <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
  //                 <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
  //                   <Building2 className="w-5 h-5 text-red-600" />
  //                 </div>
  //                 <div className="flex-1">
  //                   <h4 className="font-semibold text-gray-900">{exp.job_title}</h4>
  //                   <p className="text-blue-600 font-medium">{exp.company} | {exp.location}</p>
  //                   <p className="text-sm text-gray-500 mb-2">
  //                     {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
  //                   </p>
  //                   <p className="text-gray-700">{exp.description}</p>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
          
  //         {/* Skills */}
  //         <div className="mb-8">
  //           <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
  //           <div className="flex flex-wrap gap-2">
  //             {(details?.skills_data?.skills_mentioned?.map((s: any) => s.skill) || selectedCandidate.skills)?.map((skill: string, index: number) => (
  //               <span
  //                 key={index}
  //                 className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
  //               >
  //                 {skill}
  //               </span>
  //             ))}
  //           </div>
  //         </div>
          
  //         {/* Education */}
  //         {details?.education && details.education.length > 0 && (
  //           <div className="mb-8">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
  //             <div className="space-y-4">
  //               {details.education.map((edu: any, index: number) => (
  //                 <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
  //                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
  //                     <GraduationCap className="w-5 h-5 text-blue-600" />
  //                   </div>
  //                   <div>
  //                     <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
  //                     <p className="text-blue-600 font-medium">{edu.institution}</p>
  //                     {edu.start_date && edu.end_date && (
  //                       <p className="text-sm text-gray-500">{edu.start_date} - {edu.end_date}</p>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //       </div>
  //     </div>
  //   );
  // };


  const renderCandidateProfile = () => {
  if (!selectedCandidate) return null;

  const details = candidateDetails?.candidate;
  const displayCandidate = details || selectedCandidate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[60] flex">
      <div className="ml-auto w-2/3 bg-gray-100 shadow-xl h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setShowCandidateProfile(false)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <BackArrowIcon />
            </button>
            
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg px-3 py-2">
              <Share size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="p-8 pb-6">
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
                      <h1 className="text-2xl font-bold text-gray-900">{selectedCandidate.full_name}</h1>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">75%</span>
                    </div>
                    <p className="text-gray-600 mb-2">
                      {displayCandidate.headline || `${selectedCandidate.role} | ${selectedCandidate.company}`}
                    </p>
                    <p className="text-gray-500 text-sm">{displayCandidate.location}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="text-right text-gray-600">
                  <p className="mb-1">{displayCandidate.candidate_email || "contact@example.com"} <MailIcon className="w-4 h-4 p-1"/></p>
                  <p>{displayCandidate.candidate_phone || "9375 4575 45"} <PhoneIcon className="w-4 h-4 p-1"/></p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{displayCandidate.total_experience || "5"} Years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{displayCandidate.notice_period_days || "15"} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
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
            <div className="px-8 pb-8">
              {/* Profile Summary */}
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {displayCandidate.profile_summary || selectedCandidate.profileSummary || 
                  "Skilled professional with extensive experience in their field, demonstrating strong technical capabilities and excellent communication skills throughout the interview process."}
                </p>
              </section>

              {/* Experience */}
              <section className="mb-8">
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
              <section className="mb-8">
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
              <section className="mb-8">
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

                {/* Score Overview */}
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

                {/* Questions */}
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
              </section>

              {/* Notes */}
              <section className="mb-8">
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
              <section>
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

        {/* Assessment Modal Overlay */}
        {showAssessmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative">
              <button 
                onClick={() => setShowAssessmentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Assessment</h2>
                  <span className="text-gray-500 text-sm">02/08/2024</span>
                </div>

                {/* Modal Assessment Tabs */}
                <div className="flex mb-6 border-b border-gray-200">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => setShowAssessmentModal(false)}
                  >
                    Coding Round
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                    AI Interview
                  </button>
                </div>

                {/* Modal Score Overview */}
                <div className="grid grid-cols-2 gap-6">
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
              </div>
            </div>
          </div>
        )}
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
      <div className="mx-auto max-w-[95vw] min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleGoToDashboard}>
                <ArrowLeft className="w-10 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Pipeline for Job ID: {jobId}
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-xs text-gray-500">Share Using:</p>
              <button
                onClick={() => setShowAccessModal(true)}
                className="p-1 px-4 border border-blue-500 text-blue-500 text-sm font-medium rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700"></span>
            </div>
          </div>
        </div>
        <div className="px-2">
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max pb-4">
              {shareableStages.map((stage) => {
                const candidates = stageCandidates[stage.name] || [];
                const stageCount = getStageCount(stage.name);
                return (
                  <div
                    key={stage.name}
                    className="w-96 flex-shrink-0 h-[80vh]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.name)}
                  >
                    <div className={`${stage.color} rounded-lg p-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className={`${stage.bgColor} p-1 rounded-md`}>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {stage.name}
                            </h3>
                          </div>
                          <p
                            className={`text-sm font-semibold ${stage.textColor} p-1`}
                          >
                            {stageCount}
                          </p>
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-[70vh]">
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
