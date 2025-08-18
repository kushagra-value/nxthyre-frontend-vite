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
        <span className="text-lg font-[400] text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded-lg">
          75%
        </span>
      </div>
      
      {/* Experience Info - starts from column 3 */}
      <div className="col-start-3 col-span-10">
        <div className="flex items-center gap-2 text-gray-500 text-xs mt-2">
          <span>5Y</span>
          <span>•</span>
          <span>15 NP</span>
          <span>•</span>
          <span>20 LPA</span>
          <span>•</span>
          <span>Bangalore</span>
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
        <div className="ml-auto w-2/3 bg-white shadow-xl h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCandidateProfile(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
            </button>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-blue-200 bg-blue-100 text-gray-700 rounded-lg hover:bg-blue-200 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {selectedCandidate.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {displayCandidate.full_name}
                  </h2>
                  <p className="text-gray-600">
                    {displayCandidate.headline || `${selectedCandidate.role} | ${selectedCandidate.company}`}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {displayCandidate.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {selectedCandidate.score}%
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {displayCandidate.candidate_email || "contact@example.com"}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {displayCandidate.candidate_phone || "9375 4575 45"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">Experience</span>
                </div>
                <p className="font-semibold">{displayCandidate.total_experience || "5"} Years</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">Notice Period</span>
                </div>
                <p className="font-semibold">{displayCandidate.notice_period_days || "15"} Days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 mr-1 text-gray-500" />
                  <span className="text-sm text-gray-500">Current Salary</span>
                </div>
                <p className="font-semibold">{displayCandidate.current_salary || "20"} LPA</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4" />
                  <span>Move to Next Round</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            </div>

          {/* Profile Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
            <p className="text-gray-700 leading-relaxed">
              {displayCandidate.profile_summary || selectedCandidate.profileSummary}
            </p>
          </div>
          
          {/* Experience */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
            <div className="space-y-4">
              {(details?.experience || [
                {
                  job_title: "AI Engineer - Analyst",
                  company: "Jupiter Fintech Pvt.Ltd",
                  location: "Bangalore, Karnataka",
                  start_date: "12/2024",
                  end_date: null,
                  description: "I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs).",
                  is_current: true,
                },
                {
                  job_title: "Digital Marketing -Gen AI Team",
                  company: "Google",
                  location: "Bangalore, Karnataka",
                  start_date: "11/2023",
                  end_date: "11/2024",
                  description: "Worked on digital marketing strategies and AI implementation.",
                  is_current: false,
                },
              ]).map((exp: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{exp.job_title}</h4>
                    <p className="text-blue-600 font-medium">{exp.company} | {exp.location}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                    </p>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(details?.skills_data?.skills_mentioned?.map((s: any) => s.skill) || selectedCandidate.skills)?.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {/* Education */}
          {details?.education && details.education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              <div className="space-y-4">
                {details.education.map((edu: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-blue-600 font-medium">{edu.institution}</p>
                      {edu.start_date && edu.end_date && (
                        <p className="text-sm text-gray-500">{edu.start_date} - {edu.end_date}</p>
                      )}
                    </div>
                  </div>
                ))}
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
      <div className="mx-auto max-w-[85vw] min-h-screen bg-white">
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
                    className="w-72 flex-shrink-0 h-[80vh]"
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
