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
} from "lucide-react";
import { showToast } from "../utils/toast";
import apiClient from "../services/api";
import { useAuthContext } from "../context/AuthContext";
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
  const [isSharing, setIsSharing] = useState(false);
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
      borderColor: "border-l-4 border-l-green-400",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      count: "54",
    },
    {
      name: "First Interview",
      color: "bg-orange-50",
      borderColor: "border-l-4 border-l-orange-400",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      count: "54",
    },
    {
      name: "Other Interviews",
      color: "bg-cyan-50",
      borderColor: "border-l-4 border-l-cyan-400",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-600",
      count: "54",
    },
    {
      name: "HR Round",
      color: "bg-blue-50",
      borderColor: "border-l-4 border-l-blue-400",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      count: "54",
    },
    {
      name: "Salary Negotiation",
      color: "bg-purple-50",
      borderColor: "border-l-4 border-l-purple-400",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      count: "54",
    },
    {
      name: "Offer Sent",
      color: "bg-green-50",
      borderColor: "border-l-4 border-l-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      count: "54",
    },
    {
      name: "Archives",
      color: "bg-gray-50",
      borderColor: "border-l-4 border-l-gray-400",
      bgColor: "bg-gray-100",
      textColor: "text-gray-600",
      count: "0",
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

  // Dummy data for missing fields
  const getDummyData = (candidate: any) => ({
    ...candidate,
    profilePicture: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format`,
    score: Math.floor(Math.random() * 25) + 75, // Random score between 75-100
    experience: "5Y",
    noticePeriod: "15 NP",
    currentSalary: "20 LPA",
    socials: {
      linkedin: true,
      github: Math.random() > 0.5,
      portfolio: Math.random() > 0.7,
      resume: true,
    },
    skills: ["React.js", "Node.js", "Python", "Machine Learning", "AWS"],
    profileSummary: `${candidate.name} is a skilled digital marketing specialist with 5+ years of experience in SEO, SEM, social media strategy, and content creation. Proficient in tools like Google Analytics and AdWords, she showcased exceptional knowledge, communication skills, and a proactive approach during recent interviews.`,
  });

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
        const data = response.data.data;

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
                const [role, company] = app.candidate_headline?.split(" at ") || ["Engineer", "Tech Corp"];
                const baseCandidate = {
                  id: app.id,
                  name: app.candidate_name,
                  company: company || "Tech Corp",
                  role: role || "Software Engineer",
                  location: "Bangalore, India",
                  avatar: app.candidate_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join(""),
                  notes: "",
                  lastUpdated: new Date(app.last_updated),
                };
                return getDummyData(baseCandidate);
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

  const handleDragStart = (candidate: any, fromStage: string) => {
    setDraggedCandidate({ candidate, fromStage });
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

  const handleCandidateClick = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateProfile(true);
    setActiveProfileTab("profile");
    await fetchCandidateDetails(candidate.id);
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

  const renderCandidateCard = (candidate: any, stage: string) => (
    <div
      key={candidate.id}
      draggable
      onDragStart={() => handleDragStart(candidate, stage)}
      className="bg-white rounded-xl p-4 mb-3 cursor-move hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={candidate.profilePicture}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <button
              onClick={() => handleCandidateClick(candidate)}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block"
            >
              {candidate.name}
            </button>
            <p className="text-xs text-blue-600 font-medium">
              {candidate.role} | {candidate.company}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-blue-600">{candidate.score}%</span>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-3">
        <span>{candidate.experience}</span>
        <span className="mx-1">•</span>
        <span>{candidate.noticePeriod}</span>
        <span className="mx-1">•</span>
        <span>{candidate.currentSalary}</span>
        <span className="mx-1">•</span>
        <span>{candidate.location}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {candidate.socials.linkedin && (
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Linkedin className="w-3 h-3 text-blue-600" />
            </div>
          )}
          {candidate.socials.github && (
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Github className="w-3 h-3 text-gray-600" />
            </div>
          )}
          {candidate.socials.portfolio && (
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <Globe className="w-3 h-3 text-purple-600" />
            </div>
          )}
          {candidate.socials.resume && (
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-3 h-3 text-green-600" />
            </div>
          )}
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
              <h2 className="text-lg font-semibold text-gray-900">
                Head of Google Ads Marketing
              </h2>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          <div className="p-6">
            {/* Candidate Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={displayCandidate.profilePicture || selectedCandidate.profilePicture}
                  alt={displayCandidate.full_name || selectedCandidate.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {displayCandidate.full_name || selectedCandidate.name}
                  </h1>
                  <p className="text-blue-600 font-medium mb-2">
                    {displayCandidate.headline || `${selectedCandidate.role} | ${selectedCandidate.company}`}
                  </p>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {displayCandidate.location || selectedCandidate.location}
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

            {/* Stats Row */}
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

            {/* Move to Next Round Button */}
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
                {(details?.skills_data?.skills_mentioned?.map((s: any) => s.skill) || selectedCandidate.skills).slice(0, 10).map((skill: string, index: number) => (
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
      </div>
    );
  };

  const getStageCount = (stageName: string) =>
    stageCandidates[stageName]?.length || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">You need to be logged in to view this page.</div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading pipeline data...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-xl font-bold text-blue-600">NxtHyre</div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Explore NxtHyre
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Candidate"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-blue-600 text-white rounded">
                    <Search className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Share:</span>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Title */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Head of Google Ads Marketing
          </h1>
        </div>

        {/* Pipeline Stages */}
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-max">
              {shareableStages.map((stage) => {
                const candidates = stageCandidates[stage.name] || [];
                const stageCount = getStageCount(stage.name);
                return (
                  <div
                    key={stage.name}
                    className="w-80 flex-shrink-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.name)}
                  >
                    <div className={`${stage.color} rounded-xl p-4 h-[calc(100vh-240px)]`}>
                      {/* Stage Header */}
                      <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${stage.borderColor} bg-white`}>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {stage.name}
                        </h3>
                        <span className={`text-lg font-bold ${stage.textColor}`}>
                          {stageCount}
                        </span>
                      </div>

                      {/* Candidates List */}
                      <div className="overflow-y-auto h-full pb-4">
                        <div className="space-y-3">
                          {candidates.map((candidate: any) =>
                            renderCandidateCard(candidate, stage.name)
                          )}
                          {candidates.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
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

      {/* Access Modal */}
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

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center">
          <div className="bg-white h-[70vh] w-[50vw] shadow-xl rounded-xl">
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

      {/* Candidate Profile Modal */}
      {showCandidateProfile && renderCandidateProfile()}
    </>
  );
};

export default PipelineSharePage;