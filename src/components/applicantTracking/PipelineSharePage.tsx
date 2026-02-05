import React, { useState, useEffect, useMemo } from "react";
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
  Link,
  ChevronDown,
  File,
  ChevronLeft,
  Sparkle,
  SignalMedium,
  CheckCheck,
  Minus,
  Play,
  Volume2,
  Maximize,
  Send,
  MessageSquareText
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { showToast } from "../../utils/toast";
import apiClient from "../../services/api";
import AddNewStageForm from './AddNewStageForm';
import { useAuthContext } from "../../context/AuthContext";
import candidateService from "../../services/candidateService";
import { useParams } from "react-router-dom";
import { Calender } from '../calender/Calender';
import { EventForm } from '../calender/EventForm';
import { CalendarEvent } from '../../data/mockEvents';
import { PipelineCandidate } from "../../data/pipelineData";
import EventPreview from "../calender/EventPreview";

interface DraggedCandidate {
  candidate: any;
  fromStage: any;
}

interface Candidate {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  avatar: string;
  notes: string;
  lastUpdated: Date;
  socials: {
    github: boolean;
    linkedin: boolean;
    resume: boolean;
    twitter: boolean;
  };
}

const ProjectSkeletonCard = () => (
  <div className="bg-white rounded-[10px] shadow-lg overflow-hidden animate-pulse">
    <div className="p-4">
      <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/5 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/5 mb-4"></div>
      <div className="flex flex-wrap gap-4 mb-4 w-1/2">
        <div className="h-6 bg-gray-200 rounded-full w-6"></div>
        <div className="h-6 bg-gray-200 rounded-full w-6"></div>
        <div className="h-6 bg-gray-200 rounded-full w-6"></div>
        <div className="h-6 bg-gray-200 rounded-full w-6"></div>
      </div>
    </div>
  </div>
);


interface PipelineSharePageProps {
  pipelineName: string;
  location: string;
  experience: string;
  workMode: string;
  notice: string;
  onBack?: () => void;
}

const PipelineSharePage: React.FC<PipelineSharePageProps> = ({
  pipelineName,
  location,
  experience,
  workMode,
  notice,
  onBack,
}) => {

  const [assessmentAppId, setAssessmentAppId] = useState<string | null>(null);
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [isFetching, setIsFetching] = useState(false);
  const [draggedCandidate, setDraggedCandidate] =
    useState<DraggedCandidate | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [activityReplies, setActivityReplies] = useState<string[]>([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");
  const [isSharing, setIsSharing] = useState(false); // Added for loading state
  const [stageIdMap, setStageIdMap] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Candidate[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<string>('');
  const [selectedEventTime, setSelectedEventTime] = useState<string>('');
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]); // NEW
  const [stagesLoading, setStagesLoading] = useState(true);
  const [showEventPreview, setShowEventPreview] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventCandidateDetails, setEventCandidateDetails] = useState<any>(null);

  const [codingQuestions, setCodingQuestions] = useState<
    {
      name: string;
      question: string;
      language: string;
      difficulty: string;
      status: string;
      score: number;
    }[]
  >([]);

  const [activities, setActivities] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState(new Set([0]));
  const [showMoreProfile, setShowMoreProfile] = useState(false);

  const [activeTab, setActiveTab] = useState("pipeline");

  const [profileTab, setProfileTab] = useState<"Score" | "Profile" | "Coding" | "Interview" | "Activity" | "Notes">("Score");
  const [notesView, setNotesView] = useState<"community" | "my">("my");
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "pipeline", label: "Pipeline" },

    { id: "calendar", label: "Calendar" },

  ];

  const [date, setDate] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  const jobId = pipelineId;

  const [isExpanded, setIsExpanded] = useState(false);

  const [stageCandidates, setStageCandidates] = useState<Record<string, Candidate[]>>({});
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<string | null>(null);

  const [showAddStageForm, setShowAddStageForm] = useState(false);

  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0);

  const [stagesRefreshKey, setStagesRefreshKey] = useState(0);

  const [showMoreSummary, setShowMoreSummary] = useState(false);
  const [expandedExperiences, setExpandedExperiences] = useState<Set<number>>(new Set());
  const maxCharLength = 320;
  // UPDATED: Fully type-safe handleSearch - resolves 'id' does not exist on type 'never'
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    let found: Candidate | null = null;

    // Use Object.values to get all candidates across stages
    const allCandidates = Object.values(stageCandidates).flat() as Candidate[];

    found = allCandidates.find((candidate) =>
      candidate.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || null;

    if (found) {
      // Now TypeScript knows found is Candidate (not null), so .id is safe
      setHighlightedCandidateId(found.id);

      setTimeout(() => {
        const el = document.getElementById(`candidate-${found.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }
      }, 100);
    } else {
      showToast.error("No candidate found");
      setHighlightedCandidateId(null);
    }
  };

  const handleEventClick = async (eventId: string) => {
    console.log("Event clicked – ID:", eventId);
    try {
      setLoadingCandidateDetails(true);

      const eventRes = await apiClient.get(`/jobs/interview-events/${eventId}/`);
      const eventData = eventRes.data;
      console.log("Fetched event data:", eventData);

      const candidateRes = await apiClient.get(
        `/jobs/applications/${eventData.application}/kanban-detail/`
      );
      const candidateData = candidateRes.data;
      console.log("Fetched candidate data for event:", candidateData);

      // Set everything first
      setSelectedEvent(eventData);
      setEventCandidateDetails(candidateData);
      setCandidateDetails(candidateData);
      setShowEventPreview(true);
      console.log("EventPreview modal should now open");

      // Then open modal – now data is guaranteed to be there
    } catch (error) {
      console.error("Error fetching event details:", error);
      showToast.error("Failed to load event details");
    } finally {
      setLoadingCandidateDetails(false);
    }
  };

  const handleSelectSuggestion = (candidate: Candidate) => {
    setHighlightedCandidateId(candidate.id);
    setTimeout(() => {
      const el = document.getElementById(`candidate-${candidate.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }, 100);
    setSuggestions([]);
    setSearchQuery(candidate.name);
    setSelectedSuggestionIndex(-1);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast.success("Copied to clipboard");
  };

  const handleWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };


  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && selectedSuggestionIndex >= 0) {
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      setSearchQuery('');
    } else if (e.key === 'Tab') {
      if (suggestions.length > 0 && selectedSuggestionIndex === -1) {
        setSelectedSuggestionIndex(0);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://app.nxthyre.com/pipelines/${pipelineId}`);
    showToast.success("Pipeline link copied to clipboard");
  };

  const getDifficultyLevel = (diff: any) => {
    const num = parseInt(diff);
    if (num < 8) return "Easy";
    if (num < 10) return "Medium";
    return "Hard";
  };

  const mapStatus = (status: any) => {
    if (status === "Accepted") return "Pass";
    if (status === "Wrong Answer") return "Fail";
    return "Skip";
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-600";
      case "yellow":
        return "text-yellow-500 font-medium";
      case "red":
        return "text-red-600 font-medium";
      default:
        return "text-gray-600";
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case "green":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 15C11.5376 15 14 12.5376 14 9.5C14 6.46243 11.5376 4 8.5 4C5.46243 4 3 6.46243 3 9.5C3 12.5376 5.46243 15 8.5 15Z"
              stroke="#009951"
            />
            <path
              d="M6.57227 9.775L7.67227 10.875L10.4223 8.125"
              stroke="#009951"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );
      case "yellow":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.5 4.84615C5.92975 4.84615 3.84615 6.92975 3.84615 9.5C3.84615 12.0703 5.92975 14.1538 8.5 14.1538C11.0703 14.1538 13.1538 12.0703 13.1538 9.5C13.1538 6.92975 11.0703 4.84615 8.5 4.84615ZM3 9.5C3 6.46243 5.46243 4 8.5 4C11.5375 4 14 6.46243 14 9.5C14 12.5375 11.5375 15 8.5 15C5.46243 15 3 12.5375 3 9.5Z"
              fill="#CD9B05"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.5 7C8.77613 7 9 7.18315 9 7.40909V9.59088C9 9.81684 8.77613 10 8.5 10C8.22387 10 8 9.81684 8 9.59088V7.40909C8 7.18315 8.22387 7 8.5 7Z"
              fill="#CD9B05"
            />
            <path
              d="M9 11.5C9 11.7761 8.77613 12 8.5 12C8.22387 12 8 11.7761 8 11.5C8 11.2239 8.22387 11 8.5 11C8.77613 11 9 11.2239 9 11.5Z"
              fill="#CD9B05"
            />
          </svg>
        );
      case "red":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4090_2502)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.5 14.3125C5.84212 14.3125 3.6875 12.1572 3.6875 9.5C3.6875 6.84281 5.84212 4.6875 8.5 4.6875C11.1579 4.6875 13.3125 6.84281 13.3125 9.5C13.3125 12.1572 11.1579 14.3125 8.5 14.3125ZM8.5 4C5.46228 4 3 6.46125 3 9.5C3 12.5387 5.46228 15 8.5 15C11.5377 15 14 12.5387 14 9.5C14 6.46125 11.5377 4 8.5 4ZM10.4652 7.53376C10.3298 7.3997 10.1108 7.3997 9.97537 7.53376L8.49794 9.01186L7.04181 7.55436C6.9074 7.4203 6.68947 7.4203 6.55575 7.55436C6.42134 7.68843 6.42134 7.90844 6.55575 8.0425L8.01188 9.49656L6.54545 10.9644C6.41035 11.0984 6.41035 11.3184 6.54545 11.4559C6.68088 11.59 6.90018 11.59 7.03562 11.4559L8.50206 9.98814L9.95819 11.4456C10.0926 11.5797 10.3105 11.5797 10.4446 11.4456C10.579 11.3116 10.579 11.0916 10.4446 10.9575L8.98812 9.50344L10.4652 8.0253C10.6003 7.8878 10.6003 7.67126 10.4652 7.53376Z"
                fill="#CF272D"
              />
            </g>
            <defs>
              <clipPath id="clip0_4090_2502">
                <rect
                  width="11"
                  height="11"
                  fill="white"
                  transform="translate(3 4)"
                />
              </clipPath>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  const isValidNote = newComment.trim().length > 0;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsLoading(true);
    try {
      // Mock note addition - replace with actual API call if available
      const newNote = {
        noteId: Date.now().toString(),
        content: newComment,
        is_team_note: notesView === 'my',
        is_community_note: notesView === 'community',
        postedBy: { userName: "You", email: "you@example.com" },
        posted_at: new Date().toISOString(),
        organisation: { orgName: "Your Org" }
      };
      setNotes([newNote, ...notes]);
      setNewComment("");
      showToast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      showToast.error("Failed to add note");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {

    const transferredStageData = candidateDetails?.candidate?.stageData;
    switch (profileTab) {
      case "Score":
        const currentStageData = pipelineStages.find(
          (stage) => stage.name === currentStage,
        );
        let slug = currentStageData?.slug;
        let jobScoreObj =
          candidateDetails?.candidate?.stageData?.[slug!]?.job_score_obj;

        // Fallback: if currentStage state is out of sync or slug not found, try to find first available stage data
        if (!jobScoreObj && candidateDetails?.candidate?.stageData) {
          const keys = Object.keys(candidateDetails.candidate.stageData);
          if (keys.length > 0) {
            slug = keys[0];
            jobScoreObj = candidateDetails.candidate.stageData[slug]?.job_score_obj;
          }
        }

        let quickFitData = jobScoreObj?.quick_fit_summary || [];

        const priorityOrder = {
          CRITICAL: 0,
          IMPORTANT: 1,
          LEADERSHIP: 2,
          EXPERIENCE: 3,
        };
        quickFitData = quickFitData.sort((a: any, b: any) => {
          const orderA =
            priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
          const orderB =
            priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
          return orderA - orderB;
        });

        console.log("selectedCandidate:", selectedCandidate);

        if (!jobScoreObj) {
          return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="text-center text-gray-500 mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-base font-medium">Loading analysis...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {/* Top Badge */}
            <div className="mb-4">
              <div className="flex items-center gap-4 bg-green-100 rounded-md px-2 py-3 mr-2 mb-3">
                <span className="text-xl bg-green-600 text-white p-2 rounded-md">
                  {jobScoreObj.candidate_match_score.score}
                </span>
                <div className="flex flex-col">
                  <span className="text-black text-lg">
                    {jobScoreObj.candidate_match_score.label}
                  </span>
                </div>
              </div>
              <div className="text-gray-600 bg-gray-50 rounded-md px-2 py-3 mr-2 mb-3">
                <h2 className="font-semibold mb-1 text-md">
                  Profile Match Description
                </h2>
                <span className="text-sm">
                  {jobScoreObj.candidate_match_score.description}
                </span>
              </div>
            </div>

            {/* Quick Fit Summary */}
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-3 text-gray-600">
                Quick Fit Summary
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickFitData.map(
                  (
                    item: {
                      badge: string;
                      color: string;
                      evidence: string;
                      priority: string;
                    },
                    index: number,
                  ) => (
                    <span
                      key={index}
                      className={`bg-blue-50 ${getColorClass(
                        item.color,
                      )} px-3 py-1 rounded-full text-sm flex gap-1 items-center`}
                      title={`${item.evidence}`}
                    >
                      {item.priority === "CRITICAL" ? (
                        <Sparkle
                          className={`w-4 h-4 text-${item.color} bg-${item.color}`}
                        />
                      ) : null}
                      {item.badge}
                      {getIcon(item.color)}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mb-3 border-b border-gray-200"></div>

            {/* Gaps / Risks
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-3 text-gray-600">
                  Gaps / Risks
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {jobScoreObj.gaps_risks.map((gap: string, index: number) => (
                    <li key={index} className="bg-gray-50 p-2 rounded-md">
                      {gap}
                    </li>
                  ))}
                </ul>
              </div> */}
            {/* Gaps / Risks */}
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-3 text-gray-600">
                Gaps / Risks
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                {jobScoreObj.gaps_risks.map((gap: string, index: number) => {
                  const [category, description] = gap.split(/:\s*/, 2);
                  return (
                    <details
                      key={index}
                      open={index === 0}
                      className="bg-gray-50 rounded-md overflow-hidden"
                    >
                      <summary className="px-3 py-4 font-medium cursor-pointer hover:bg-gray-100 text-gray-600">
                        {category}
                      </summary>
                      <div className="px-3 py-4 border-t border-gray-200 text-gray-600">
                        {description}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            <div className="mb-3 border-b border-gray-200"></div>

            {/* Recommended Message */}
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-3 text-blue-600">
                Recommended Message to Client
              </h4>
              <p className="text-sm text-gray-600">
                {jobScoreObj.recommended_message}
              </p>
            </div>

            <div className="mb-3 border-b border-gray-200"></div>

            {/* Callout */}
            <div className="bg-yellow-50 border rounded-md">
              <div className="flex items-center gap-2 px-3 py-4 mb-1">
                <svg
                  className="h-5 w-5 text-yellow-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-yellow-600">Call Attention</h3>
              </div>
              <div className="px-4 pb-4">
                <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                  {jobScoreObj.call_attention.map(
                    (attention: string, index: number) => (
                      <li key={index}>{attention}</li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        );

      case "Profile":
        const positions = candidateDetails?.candidate?.positions || [];
        const educations = candidateDetails?.candidate?.educations || [];
        const certifications = candidateDetails?.candidate?.certifications || [];
        const skills = candidateDetails?.candidate?.skills || [];
        const endorsements = candidateDetails?.candidate?.endorsements || [];
        return (
          <div className="bg-[#F5F9FB] py-4 px-2 rounded-xl space-y-6">
            {/* UPDATED: Profile Summary with View More/Less for long text */}
            {(candidateDetails?.candidate?.profile_summary || candidateDetails?.candidate?.headline) && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <User className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Profile Summary
                </h3>
                <p className="text-sm pl-6 text-[#818283] leading-normal">
                  {(() => {
                    const summary =
                      candidateDetails?.candidate?.profile_summary ||
                      candidateDetails?.candidate?.headline ||
                      "No summary available";

                    const isLongSummary =
                      candidateDetails?.candidate?.profile_summary &&
                      candidateDetails?.candidate?.profile_summary.length > maxCharLength;

                    const displaySummary = showMoreSummary || !isLongSummary
                      ? summary
                      : summary.slice(0, maxCharLength) + "...";

                    return (
                      <>
                        {displaySummary}
                        {isLongSummary && (
                          <button
                            onClick={() => setShowMoreSummary(!showMoreSummary)}
                            className="ml-2 text-[#0F47F2] text-sm font-medium inline"
                          >
                            {showMoreSummary ? "View Less" : "View More"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </p>
              </div>
            )}


            {positions.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Experience
                </h3>
                {positions.length > 0 ? (
                  (showMoreProfile ? positions : positions.slice(0, 1)).map(
                    (exp: any, index: any) => (
                      <div
                        key={index}
                        className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                      >
                        <h4 className="text-sm font-medium text-[#4B5563]">
                          {exp.title}
                        </h4>
                        <p className="text-sm text-[#818283]">
                          {exp.companyName} | {exp.location}
                        </p>
                        <p className="text-sm text-[#818283]">
                          {exp.startDate && (
                            <span>
                              {exp.startDate.month}/{exp.startDate.year} -{" "}
                            </span>
                          )}
                          {exp.isCurrent ? (
                            "Present"
                          ) : exp.endDate ? (
                            <span>
                              {exp.endDate?.month}/{exp.endDate?.year}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm text-[#818283] mt-1">
                          {(() => {
                            const desc = exp.description || "";
                            const isLong = desc.length > maxCharLength;
                            const isExpanded = expandedExperiences.has(index);

                            const displayDesc = isExpanded || !isLong
                              ? desc
                              : desc.slice(0, maxCharLength) + "...";

                            return (
                              <>
                                {displayDesc}
                                {isLong && (
                                  <button
                                    onClick={() => {
                                      const newSet = new Set(expandedExperiences);
                                      if (isExpanded) {
                                        newSet.delete(index);
                                      } else {
                                        newSet.add(index);
                                      }
                                      setExpandedExperiences(newSet);
                                    }}
                                    className="ml-2 text-[#0F47F2] text-sm font-medium inline"
                                  >
                                    {isExpanded ? "View Less" : "View More"}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </p>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-sm text-[#818283] ml-4">
                    No experience details available
                  </p>
                )}
                {positions.length > 1 && !showMoreProfile && (
                  <button
                    onClick={() => setShowMoreProfile(true)}
                    className="text-[#0F47F2] text-sm flex items-center ml-4"
                  >
                    View More <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            )}
            {educations.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <GraduationCap className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Education
                </h3>
                {educations.length > 0 ? (
                  educations.map((edu: any, index: any) => (
                    <div
                      key={index}
                      className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                    >
                      <h4 className="text-sm font-medium text-[#4B5563]">
                        {edu.degreeName} in {edu.fieldOfStudy}
                        {edu.is_top_tier && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-1">
                            Top Tier
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-[#818283]">{edu.schoolName}</p>
                      {edu.startDate?.year &&
                        edu.endDate?.year &&
                        edu.startDate.year !== 0 &&
                        edu.endDate.year !== 0 ? (
                        <p className="text-sm text-[#818283]">
                          {edu.startDate.year} - {edu.endDate.year}
                        </p>
                      ) : (
                        " "
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#818283] ml-4">
                    No education details available
                  </p>
                )}
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <Award className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Certifications
                </h3>
                {certifications.length > 0 ? (
                  certifications.map((cert: any, index: any) => (
                    <div
                      key={index}
                      className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                    >
                      <h4 className="text-sm font-medium text-[#4B5563]">
                        {cert.name}
                      </h4>
                      <p className="text-sm text-[#818283]">{cert.authority}</p>
                      <p className="text-sm text-[#818283]">
                        {cert.licenseNumber}
                      </p>
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0F47F2] hover:underline"
                      >
                        {cert.url}
                      </a>
                      <p className="text-sm text-[#818283]">
                        {cert.startDate && (
                          <span>
                            {cert.startDate?.month}/{cert.startDate?.year}{" "}
                            -{" "}
                          </span>
                        )}
                        {cert.endDate && (
                          <span>
                            {cert.endDate?.month}/{cert.endDate?.year}
                          </span>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#818283] ml-4">
                    No certifications available
                  </p>
                )}
              </div>
            )}
            {skills.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 ml-4">
                  {skills.length > 0 ? (
                    skills.map((skill: any, index: any) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#ECF1FF] text-[#0F47F2] text-sm rounded-md"
                      >
                        {skill.name}{" "}
                        {skill.endorsementCount > 0
                          ? `(${skill.endorsementCount})`
                          : ""}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-[#818283]">
                      No skills available
                    </p>
                  )}
                </div>
              </div>
            )}
            {endorsements.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Endorsements
                </h3>
                <div className="space-y-2 ml-4">
                  {endorsements.map((end: any, index: any) => (
                    <div key={index} className="flex items-center space-x-2">
                      <img
                        src={end.endorser_profile_pic_url}
                        alt={end.endorser_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#4B5563]">
                          {end.endorser_name}
                        </p>
                        <p className="text-xs text-[#818283]">
                          {end.endorser_title} at {end.endorser_company}
                        </p>
                      </div>
                      <p className="text-sm text-[#818283]">
                        endorsed {end.skill_endorsed}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "Coding":
        if (codingQuestions.length === 0) {
          return (
            <div className="flex justify-center items-center bg-[#F5F9FB] rounded-xl">
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="relative inline-block">
                  {/* First SVG (outer shape) */}
                  <svg
                    width="102"
                    height="107"
                    viewBox="0 0 102 107"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                      fill="#0F47F2"
                    />
                  </svg>

                  {/* Second SVG (inner, centered) */}
                  <svg
                    width="52"
                    height="83"
                    viewBox="0 0 52 83"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <path
                      d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                      fill="#60A5FA"
                    />
                  </svg>
                </div>

                <h3 className="text-xl text-center text-gray-400 mt-4">
                  Candidate coding round will shown here once they complete it
                </h3>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-[#F5F9FB] px-4 py-3 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl text-[#4B5563]">
                <span className="font-medium">Questions</span> ({totalQuestions}
                )
              </h3>
              <p className="text-base text-[#818283]">{date}</p>
            </div>
            {codingQuestions.map((q, index) => {
              // Split question into lines
              const lines = q.question.split("\n");
              const visibleLines = isExpanded ? lines : lines.slice(0, 2);
              const hiddenLineCount = Math.max(0, lines.length - 2);

              return (
                <div
                  key={index}
                  className="border border-[#4B5563] bg-[#F5F9FB] rounded-xl overflow-hidden"
                >
                  <div className="p-2 flex items-start space-x-2">
                    <span className="text-sm text-[#4B5563] font-medium">
                      Q{index + 1}.
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-[#4B5563] flex-1 mb-1">
                        {q.name}
                      </h3>
                      <p className="text-sm text-[#818283] flex-1 whitespace-pre-line">
                        {visibleLines.join("\n")}
                        {!isExpanded && hiddenLineCount > 0 && " ..."}
                      </p>
                    </div>
                  </div>
                  <hr className="border-t border-[#818283]/50 rounded-full" />
                  <div className="p-4 flex justify-between items-center text-xs bg-white">
                    <span className="text-[#818283]">{q.language}</span>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center text-[#818283]"
                      >
                        <div className="p-1 border border-[#818283] rounded-md mr-1">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 1.00781H5.2M7 1.00781V2.80781M7 1.00781L4.9 3.10781M1 7.00781H2.8M1 7.00781V5.20781M1 7.00781L3.1 4.90781"
                              stroke="#818283"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        {isExpanded ? "Collapse" : "Expand"}{" "}
                      </button>
                      <div className="flex items-center text-[#818283]">
                        <SignalMedium className="w-4 h-4 mr-1 pl-1 pb-1 border border-[#818283] rounded-md" />
                        {q.difficulty}
                      </div>
                      <div className="flex items-center">
                        {q.status === "Pass" && (
                          <CheckCheck className="w-4 h-4 p-1 bg-[#007A5A] text-white mr-1 rounded-xl" />
                        )}
                        {q.status === "Fail" && (
                          <X className="w-4 h-4 p-1 bg-[#ED051C] text-white mr-1 rounded-xl" />
                        )}
                        {q.status === "Skip" && (
                          <Minus className="w-4 h-4 p-1 bg-[#818283] text-white mr-1 rounded-xl" />
                        )}
                        <span
                          className={`${q.status === "Pass"
                            ? "text-[#007A5A]"
                            : q.status === "Fail"
                              ? "text-[#ED051C]"
                              : "text-[#818283]"
                            } font-medium`}
                        >
                          {q.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <hr className="mx-auto w-[95%] border-t border-[#818283]/50" />
                  {!isExpanded && hiddenLineCount > 0 && (
                    <p className="px-4 py-3 text-sm text-[#BCBCBC] bg-white">
                      {hiddenLineCount} hidden lines
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      case "Interview":
        const interviewData =
          transferredStageData?.["ai-interview"] ||
          transferredStageData?.shortlisted ||
          transferredStageData?.["first-interview"] ||
          transferredStageData?.["hr-round"] ||
          transferredStageData?.["other-interview"] ||
          transferredStageData?.["offer-sent"] ||
          transferredStageData?.["offer-accepted"];
        const vettedSkills = [
          ...(interviewData?.technicalSkills?.strongSkills || []),
          ...(interviewData?.technicalSkills?.weakSkills || []),
        ];
        const questions =
          interviewData?.questions?.map((q: any, index: number) => ({
            question: `Q${index + 1}: ${q.question}`,
            answer: q.answer,
          })) || [];

        return (
          <div className="space-y-3 bg-[#F5F9FB] p-2 rounded-xl">
            {interviewData?.resumeScore ||
              interviewData?.knowledgeScore ||
              interviewData?.communicationScore ? (
              <>
                <div className="bg-white rounded-xl p-2">
                  <h4 className="text-base font-medium text-[#4B5563] mb-4">
                    Overall Score
                  </h4>
                  <div className="flex justify-between w-full">
                    <div className="w-[27%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                      <p className="text-base text-[#4B5563]">Resume</p>
                      <p className="text-2xl font-normal text-[#EAB308]">
                        {(interviewData?.resumeScore &&
                          interviewData?.resumeScore) ||
                          "N/A"}
                        %
                      </p>
                    </div>
                    <div className="w-[27%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                      <p className="text-base text-[#4B5563]">Knowledge</p>
                      <p className="text-2xl font-normal text-[#16A34A]">
                        {(interviewData?.knowledgeScore &&
                          interviewData?.knowledgeScore) ||
                          "N/A"}
                        %
                      </p>
                    </div>
                    {/* <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                    <p className="text-base text-[#4B5563]">Technical</p>
                    <p className="text-2xl font-normal text-[#16A34A]">
                      {(interviewData?.technicalScore &&
                        (interviewData.technicalScore * 10).toFixed(0)) ||
                        "N/A"}
                      %
                    </p>
                  </div> */}
                    <div className="w-[37%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                      <p className="text-base text-[#4B5563]">Communication</p>
                      <p className="text-2xl font-normal text-[#0F47F2]">
                        {(interviewData?.communicationScore &&
                          interviewData.communicationScore) ||
                          "N/A"}
                        %
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-2">
                  <h4 className="text-base font-medium text-[#4B5563] mb-2">
                    General Summary
                  </h4>
                  <p className="text-sm text-[#818283]">
                    {interviewData?.feedbacks?.overallFeedback ||
                      "No feedback provided"}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-2">
                  <h4 className="text-base font-medium text-[#4B5563] mb-4">
                    Vetted Skills
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {vettedSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="relative group bg-[#ECF1FF] rounded-md p-2 flex items-center justify-center space-x-2"
                      >
                        <span className="text-sm text-[#0F47F2]">
                          {skill.skill}
                        </span>
                        <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                        <span className="text-sm text-[#4B5563]">
                          {skill.rating}
                        </span>
                        {skill.reason && (
                          <div className="absolute z-1000 invisible group-hover:visible opacity-0 group-hover:opacity-100 group-hover:z-1000 transition-all duration-200 -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-50 text-gray-600 text-xs rounded-md py-2 px-3 w-64 text-center">
                            {skill.reason}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-600"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-xl py-2 px-3">
                  <h4 className="text-base font-medium text-yellow-600 mb-2">
                    Key Observations
                  </h4>
                  {interviewData?.potentialRedFlags?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {interviewData.potentialRedFlags.map(
                        (observation: any, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-[#4B5563] leading-relaxed"
                          >
                            {observation}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-[#4B5563] leading-relaxed">
                      No key observations provided
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="text-base font-medium text-[#4B5563] mb-4">
                    Interview Recording
                  </h4>
                  <div className="bg-[#F5F9FB] rounded-xl p-4 flex items-center space-x-4">
                    <Play className="w-4 h-4 ml-1" />
                    <div className="flex-1">
                      <div className="h-0.5 bg-[#F0F0F0] rounded-full">
                        <div className="w-1/3 h-0.5 bg-[#0F47F2] rounded-full"></div>
                      </div>
                    </div>
                    <span className="text-sm text-[#4B5563]">1.01 / 5.40</span>
                    <Volume2 className="w-5 h-5 text-[#4B5563]" />
                    <Maximize className="w-5 h-5 text-[#4B5563]" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="text-base font-medium text-[#4B5563] mb-4">
                    Question Analysis
                  </h4>
                  <div className="space-y-4">
                    {questions.map((q: any, index: number) => {
                      const isExpanded = expandedIndices.has(index);
                      return (
                        <div
                          key={index}
                          className={`border ${isExpanded ? "border-[#0F47F2]" : "border-[#818283]"
                            } bg-white rounded-md p-4`}
                        >
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-sm font-medium ${isExpanded ? "text-[#4B5563]" : "text-[#818283]"
                                }`}
                            >
                              {q.question}
                            </p>
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedIndices);
                                if (isExpanded) {
                                  newExpanded.delete(index);
                                } else {
                                  newExpanded.add(index);
                                }
                                setExpandedIndices(newExpanded);
                              }}
                            >
                              {isExpanded ? (
                                <Minus className="w-4 h-4 text-[#818283]" />
                              ) : (
                                <Plus className="w-4 h-4 text-[#818283]" />
                              )}
                            </button>
                          </div>
                          {isExpanded && (
                            <p className="text-sm text-[#4B5563] mt-2">
                              {q.answer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center bg-[#F5F9FB] rounded-xl">
                <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                  <div className="relative inline-block">
                    {/* First SVG (outer shape) */}
                    <svg
                      width="102"
                      height="107"
                      viewBox="0 0 102 107"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                        fill="#0F47F2"
                      />
                    </svg>

                    {/* Second SVG (inner, centered) */}
                    <svg
                      width="52"
                      height="83"
                      viewBox="0 0 52 83"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <path
                        d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                        fill="#60A5FA"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl text-center text-gray-400 mt-4">
                    Candidate interview round will shown here once they complete
                    it
                  </h3>
                </div>
              </div>
            )}
          </div>
        );
      case "Activity":
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
            <h3 className="text-base font-medium text-[#4B5563]">Activity</h3>
            <div className="space-y-6 border-l-2 border-gray-400">
              {activities.map((activity, index) => (
                <div key={index} className="">
                  <div
                    className="flex justify-start space-x-2 cursor-pointer"
                    onClick={() =>
                      setSelectedActivityIndex(
                        selectedActivityIndex === index ? null : index,
                      )
                    }
                  >
                    <hr className="w-[10%] border-t-2 mt-2 border-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400 leading-normal">
                        {activity.date}{" "}
                      </p>
                      <p className="text-sm text-gray-400 leading-normal font-medium">
                        {activity.description}
                      </p>
                      {activity.type === "communication_sent" &&
                        activity.note && (
                          <div>
                            <div
                              className="w-80 bg-white text-sm text-gray-800 p-2 rounded-md mt-1"
                              dangerouslySetInnerHTML={{
                                __html: activity.note,
                              }}
                            />
                            <button
                              onClick={() => { }}
                              className="text-blue-500 mt-1"
                            >
                              Reply ?
                            </button>
                          </div>
                        )}
                      {/* {activity.note && selectedActivityIndex === index && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400 whitespace-pre-line">
                              Replies: {activity.note}
                            </p>
                          </div>
                        )} */}
                    </div>
                  </div>
                  {selectedActivityIndex === index && (
                    <div className="ml-10 mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={activityReplies[index] || ""}
                          onChange={(e) => {
                            const newReplies = [...activityReplies];
                            newReplies[index] = e.target.value;
                            setActivityReplies(newReplies);
                          }}
                          placeholder="Add a reply..."
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={() => {
                            const newActivities = [...activities];
                            newActivities[index].note =
                              activityReplies[index] || "Replied via input";
                            setActivities(newActivities);
                            setActivityReplies([...activityReplies]);
                            setSelectedActivityIndex(null);
                          }}
                          className="bg-blue-500 text-white p-2 rounded-md"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "Notes":
        // Filter notes based on current view
        const displayedNotes =
          notesView === "my"
            ? notes.filter((note: any) => note.is_team_note && !note.is_community_note)
            : notes.filter((note: any) => note.is_team_note && note.is_community_note);
        return (
          <>
            <div className="flex flex-col h-full bg-[#F0F0F0] p-3 rounded-lg">
              {/* Header with Heading and Toggle */}
              <div className="flex justify-between items-center mb-3 border-b-2 border-gray-200 px-3 pt-1 pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquareText className="w-5 h-5 text-[#4B5563] mt-1" />
                  <h3 className="text-base font-medium text-[#4B5563]">
                    Notes about the Person
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#4B5563]">Community</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notesView === "community"}
                      onChange={(e) =>
                        setNotesView(e.target.checked ? "community" : "my")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-2 border-gray-200">
                {isLoadingNotes ? (
                  <p className="text-gray-500 text-center">Loading notes...</p>
                ) : displayedNotes.length > 0 ? (
                  displayedNotes.map((note: any) => (
                    <div
                      key={note.noteId}
                      className="border-b border-gray-200 pb-2"
                    >
                      <div className="flex flex-col space-y-2 px-3 py-2 mb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-3 items-center">
                            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-medium text-[#111827] text-sm">
                                {note.postedBy?.userName ||
                                  note.organisation?.orgName ||
                                  "Unknown"}
                              </h4>
                              <p className="text-sm text-[#4B5563]">
                                {note.organisation?.orgName || "Company"}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-[#818283] mt-1">
                            {new Date(note.posted_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-[#818283] leading-normal">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : notesView === "my" ? (
                  <div className="flex justify-center items-center rounded-xl">
                    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                      <div className="relative inline-block">
                        {/* First SVG (outer shape) */}
                        <svg
                          width="102"
                          height="107"
                          viewBox="0 0 102 107"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                            fill="#0F47F2"
                          />
                        </svg>

                        {/* Second SVG (inner, centered) */}
                        <svg
                          width="52"
                          height="83"
                          viewBox="0 0 52 83"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                            fill="#60A5FA"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl text-center text-gray-400 mt-4">
                        No Team notes available. You can add a new note below.
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center rounded-xl">
                    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                      <div className="relative inline-block">
                        {/* First SVG (outer shape) */}
                        <svg
                          width="102"
                          height="107"
                          viewBox="0 0 102 107"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                            fill="#0F47F2"
                          />
                        </svg>

                        {/* Second SVG (inner, centered) */}
                        <svg
                          width="52"
                          height="83"
                          viewBox="0 0 52 83"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                            fill="#60A5FA"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl text-center text-gray-400 mt-4">
                        No community notes available. You can add a new note
                        below.
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input Section */}
            <div className="mt-4 p-3 bg-white rounded-tr-lg rounded-tl-lg">
              <div className="flex space-x-3 border border-gray-200 rounded-lg p-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Type your ${notesView === "my" ? "team" : "community"
                    } comment!`}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm ${newComment && !isValidNote ? "border border-red-500" : ""
                    }`}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };


  // UPDATED: Dynamically generate shareable stages starting from "Shortlisted"
  const dynamicShareableStages = useMemo(() => {
    if (pipelineStages.length === 0) return [];

    const shortlistedIndex = pipelineStages.findIndex(
      (stage: any) => stage.slug === "shortlisted"
    );

    if (shortlistedIndex === -1) return [];

    // Take all stages from Shortlisted onwards, excluding Archives
    const relevantStages = pipelineStages
      .slice(shortlistedIndex)
      .filter((stage: any) => stage.slug !== "archives");

    // Predefined colors for known stages, fallback cycle for custom ones
    const colorPalette = [
      { bgColor: "bg-[#34C759]", textColor: "text-blue-400" },     // Shortlisted
      { bgColor: "bg-[#FF8D28]", textColor: "text-yellow-400" },   // First Interview
      { bgColor: "bg-[#00C8B3]", textColor: "text-orange-400" },   // Other
      { bgColor: "bg-[#0088FF]", textColor: "text-red-400" },
      { bgColor: "bg-[#CB30E0]", textColor: "text-purple-400" },
      { bgColor: "bg-indigo-600", textColor: "text-green-400" },
      // Fallback colors for additional custom stages
      { bgColor: "bg-pink-500", textColor: "text-pink-400" },
      { bgColor: "bg-teal-500", textColor: "text-teal-400" },
      { bgColor: "bg-cyan-500", textColor: "text-cyan-400" },
    ];

    return relevantStages.map((stage: any, index: number) => {
      const color = colorPalette[index % colorPalette.length];
      return {
        name: stage.name,
        slug: stage.slug,
        id: stage.id,
        bgColor: color.bgColor,
        textColor: color.textColor,
      };
    });
  }, [pipelineStages]);

  const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (!isAuthenticated || !jobId) return;

    const fetchCandidates = async () => {
      setIsFetching(true);
      try {
        // Build a map of stage name → slug and name → id
        const stageIdMapTemp: { [key: string]: number } = {};
        const stageSlugMap: { [key: string]: string } = {};
        pipelineStages.forEach((stage: any) => {
          stageIdMapTemp[stage.name] = stage.id;
          stageSlugMap[stage.name] = stage.slug;
        });
        setStageIdMap(stageIdMapTemp);

        // Fetch candidates for each shareable stage in parallel
        const fetchPromises = dynamicShareableStages.map(async (stage) => {
          const slug = stage.slug;
          if (!slug) return { stageName: stage.name, candidates: [] };

          const res = await apiClient.get(
            `/jobs/applications/?job_id=${jobId}&stage_slug=${slug}&sort_by=relevance_desc`
          );

          const rawCandidates = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];

          return {
            stageName: stage.name,
            candidates: rawCandidates.map((app: any) => {
              const headline = app.candidate.headline || "";
              const [role = "", company = ""] = headline.split(" at ");
              const city = app.candidate.location?.split(",")[0] || "";

              return {
                id: app.id,
                name: app.candidate.full_name || "Unknown",
                company: (company || "").trim(),
                role: (role || "").trim(),
                location: city || "",
                notice_period_days: (app.candidate.notice_period_summary || "")
                  .toString()
                  .replace(" days", ""),
                current_salary: app.candidate.current_salary_lpa || "",
                total_experience: (app.candidate.experience_years || "")
                  .toString()
                  .replace(/[^0-9+]/g, ""),
                avatar: app.candidate.avatar ||
                  (app.candidate.full_name || "")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                profile_picture_url: app.candidate.profile_picture_url || null,
                notes: "",
                lastUpdated: new Date(app.last_active_at || Date.now()),
                socials: {
                  github_url: app.candidate.premium_data_availability?.github_username ? "" : null,
                  linkedin_url: app.candidate.premium_data_availability?.linkedin_url ? "" : null,
                  resume_url: app.candidate.premium_data_availability?.resume_url ? "" : null,
                },
              };
            }),
          };
        });

        const results = await Promise.all(fetchPromises);

        const processedData: { [key: string]: any[] } = {};
        dynamicShareableStages.forEach((stage) => {
          const result = results.find((r) => r.stageName === stage.name);
          processedData[stage.name] = result?.candidates || [];
        });

        setStageCandidates(processedData);
      } catch (error: any) {
        if (error.response?.status === 403) {
          showToast.error("You don't have permission to view this pipeline.");
        } else {
          console.error("Error fetching pipeline data:", error);
          showToast.error("Failed to load pipeline data");
        }
      } finally {
        setIsFetching(false);
      }
    };

    // Only run if pipelineStages are already loaded
    if (pipelineStages.length > 0) {
      fetchCandidates();
    }
  }, [jobId, isAuthenticated, pipelineStages]);

  const handleDragStart = (candidate: any, fromStage: string) => {
    setDraggedCandidate({ candidate, fromStage });
  };

  const mapStageData = (
    slug: string,
    contextualDetails: any,
    aiInterviewReport?: any,
  ) => {
    switch (slug) {
      case "applied":
        return {
          appliedDate: "", // Placeholder
          resumeScore: 0, // Placeholder
          skillsMatch:
            contextualDetails.match_analysis?.skill_match_percentage || "N/A",
          experienceMatch:
            contextualDetails.match_analysis?.experience_match_percentage ||
            "N/A",
          highlights:
            contextualDetails.match_analysis?.matched_skills?.join(", ") || "",
          notes: contextualDetails.candidate_notes || [],
          job_score_obj: contextualDetails.job_score_obj || {},
        };
      case "ai-interview":
      case "shortlisted":
      case "first-interview":
      case "hr-round":
      case "other-interview":
      case "offer-sent":
      case "offer-accepted":
        const report =
          aiInterviewReport || contextualDetails.ai_interview_report || {};
        return {
          interviewedDate: "", // Placeholder
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
          feedbacks: report.feedbacks || {
            overallFeedback: "",
            communicationFeedback: "",
            resumeScoreReason: "",
            developmentAreas: [],
          },
          technicalSkills: report.technicalSkills || {
            weakSkills: [{ skill: "", rating: 0, reason: "" }],
            strongSkills: [{ skill: "", rating: 0, reason: "" }],
            skillsCoverage: "",
          },
          potentialRedFlags: report.potential_red_flags || [],
          job_score_obj: contextualDetails.job_score_obj || {},
        };
      default:
        return contextualDetails; // Fallback for other stages
    }
  };

  // Helper to map candidate details
  const mapCandidateDetails = (data: any): PipelineCandidate => {
    const candidateData = data.candidate;
    const stageProperty = data.current_stage_details.slug; // Use slug directly
    const mappedStageData = mapStageData(
      data.current_stage_details.slug,
      data.contextual_details,
      data.candidate.ai_interview_report,
    );

    const premiumData = candidateData.premium_data || {};

    return {
      id: data.id,
      candidate: {
        id: candidateData.id,
        full_name: candidateData.full_name,
        avatar: candidateData.avatar,
        headline: candidateData.headline,
        location: candidateData.location,
        linkedin_url: candidateData.linkedin_url,
        experience_years: candidateData.experience_years,
        experience_summary: candidateData.experience_summary,
        education_summary: candidateData.education_summary,
        notice_period_summary: candidateData.notice_period_summary,
        skills_list: candidateData.skills_list,
        social_links: candidateData.social_links,
        resume_url: candidateData.resume_url,
        current_salary_lpa: candidateData.current_salary_lpa,
        profile_summary: candidateData.profile_summary,
        source: candidateData.source,
        profilePicture: {
          displayImageUrl: candidateData.profile_picture_url || "",
          artifacts: [],
        },
        gender: candidateData.gender,
        is_recently_promoted: candidateData.is_recently_promoted,
        is_background_verified: candidateData.is_background_verified,
        is_active: candidateData.is_active,
        is_prevetted: candidateData.is_prevetted,
        notice_period_days: candidateData.notice_period_days,
        current_salary: candidateData.current_salary,
        application_type: candidateData.application_type,
        total_experience: candidateData.total_experience,
        email: premiumData.email || "",
        phone: premiumData.phone || "",
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
          is_top_tier: edu.is_top_tier || false,
        })),
        certifications: candidateData.certifications.map((cert: any) => ({
          name: cert.name,
          authority: cert.authority,
          licenseNumber: cert.licenseNumber,
          startDate: cert.issued_date
            ? {
              month: new Date(cert.issued_date).getMonth() + 1,
              year: new Date(cert.issued_date).getFullYear(),
            }
            : { month: 0, year: 0 },
          endDate: cert.valid_until
            ? {
              month: new Date(cert.valid_until).getMonth() + 1,
              year: new Date(cert.valid_until).getFullYear(),
            }
            : undefined,
          url: cert.url,
        })),
        skills: candidateData.skills_data.skills_mentioned.map(
          (skill: any) => ({
            name: skill.skill,
            endorsementCount: skill.number_of_endorsements,
          }),
        ),
        endorsements: candidateData.skills_data.endorsements.map(
          (end: any) => ({
            endorser_name: end.endorser_name,
            endorser_title: end.endorser_title,
            endorser_profile_pic_url: end.endorser_profile_pic_url,
            skill_endorsed: end.skill_endorsed,
            endorser_company: end.endorser_company,
            message: end.message,
          }),
        ),
        recommendations: {
          received: candidateData.recommendations,
          given: [],
        },
        notes: candidateData.notes,
        premium_data_unlocked: candidateData.premium_data_unlocked,
        premium_data_availability: candidateData.premium_data_availability,
        premium_data: {
          email: premiumData.email,
          phone: premiumData.phone,
          linkedin_url: premiumData.linkedin_url,
          github_url: premiumData.github_url,
          twitter_url: premiumData.twitter_url,
          resume_url: premiumData.resume_url,
          resume_text: premiumData.resume_text,
          portfolio_url: premiumData.portfolio_url,
          dribble_username: premiumData.dribble_username,
          behance_username: premiumData.behance_username,
          instagram_username: premiumData.instagram_username,
          pinterest_username: premiumData.pinterest_username,
          all_emails: premiumData.all_emails || [],
          all_phone_numbers: premiumData.all_phone_numbers || [],
        },
        stageData: {
          [stageProperty]: mappedStageData,
        },
      },
      status: data.status,
      contextual_details: data.contextual_details,
    };
  };

  const fetchCandidateDetails = async (applicationId: number) => {
    setLoadingCandidateDetails(true);
    try {
      const response = await apiClient.get(
        `/jobs/applications/${applicationId}/`,
      );
      const data = response.data;
      const mappedCandidate: PipelineCandidate = mapCandidateDetails(data);
      setCandidateDetails(mappedCandidate);
      setSelectedCandidate(mappedCandidate);
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      showToast.error("Failed to load candidate details");
    } finally {
      setLoadingCandidateDetails(false);
    }
  };

  useEffect(() => {
    if (!assessmentAppId || !candidateDetails) return;
    const fetchAssessmentResults = async () => {
      try {
        const res = await candidateService.getAssessmentResults(
          Number(jobId),
          candidateDetails.candidate.id
        );

        const questions = res.problem_results.map((pr: any) => ({
          name: pr.problem.name,
          question: pr.problem.description,
          language: pr.language || "N/A",
          difficulty: getDifficultyLevel(pr.problem.difficulty),
          status: mapStatus(pr.status),
          score: pr.score,
        }));

        setCodingQuestions(questions);
        const completedDate = new Date(res.completed_at);
        setDate(completedDate.toLocaleDateString("en-GB"));
        setTotalQuestions(res.problem_results.length);
        setAssessmentResults(res.data);
      } catch (error) {
        console.error("Error fetching assessment results:", error);
        showToast.error("Failed to load assessment results");
      }
    };

    const fetchActivity = async () => {
      try {
        const apiActivities = await candidateService.getCandidateActivity(
          candidateDetails.candidate.id,
          Number(assessmentAppId)
        );
        setActivities(apiActivities);
      } catch (error) {
        console.error("Error fetching candidate activity:", error);
      }
    };

    const fetchNotes = async () => {
      try {
        setIsLoadingNotes(true);
        const fetchedNotes = await candidateService.getCandidateNotes(
          candidateDetails.candidate.id
        );
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchAssessmentResults();
    fetchActivity();
    fetchNotes();

    // Clean-up: when the profile is closed we clear the trigger
    return () => {
      setAssessmentAppId(null);
    };
  }, [assessmentAppId, candidateDetails, jobId]);

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

    const stageNames = dynamicShareableStages.map(s => s.name);
    const fromOrder = stageNames.indexOf(fromStage);
    const toOrder = stageNames.indexOf(toStage);

    if (toOrder === -1 || fromOrder === -1) {
      showToast.error("Invalid stage");
      setDraggedCandidate(null);
      return;
    }

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
        <path d="M11.06 4.6673C11.0595 4.75504 11.0763 4.84201 11.1095 4.92324C11.1427 5.00446 11.1915 5.07834 11.2533 5.14063L18.1133 12.0006L11.2533 18.8606C11.1441 18.9882 11.087 19.1522 11.0935 19.32C11.1 19.4878 11.1696 19.6469 11.2883 19.7657C11.407 19.8844 11.5662 19.954 11.734 19.9604C11.9017 19.9669 12.0658 19.9099 12.1933 19.8006L20 12.0006L12.1933 4.19397C12.0997 4.10223 11.9812 4.04011 11.8525 4.01537C11.7238 3.99064 11.5907 4.00438 11.4697 4.05489C11.3488 4.10539 11.2454 4.19042 11.1726 4.29934C11.0997 4.40827 11.0605 4.53625 11.06 4.6673Z" fill="#4B5563" />
        <path d="M3.72699 4.6673C3.72649 4.75504 3.7433 4.84201 3.77648 4.92324C3.80966 5.00446 3.85854 5.07834 3.92033 5.14063L10.7803 12.0006L3.92033 18.8606C3.81111 18.9882 3.75404 19.1522 3.76052 19.32C3.767 19.4878 3.83655 19.6469 3.95528 19.7657C4.07401 19.8844 4.23317 19.954 4.40096 19.9604C4.56874 19.9669 4.73279 19.9099 4.86033 19.8006L12.667 12.0006L4.86033 4.19397C4.76674 4.10223 4.64818 4.04011 4.51949 4.01537C4.39079 3.99064 4.25766 4.00438 4.13673 4.05489C4.0158 4.10539 3.91244 4.19042 3.83956 4.29934C3.76669 4.40827 3.72753 4.53625 3.72699 4.6673Z" fill="#4B5563" />
      </g>
      <defs>
        <clipPath id="clip0_2438_2128">
          <rect width="24" height="24" fill="white" transform="matrix(0 -1 -1 0 24 24)" />
        </clipPath>
      </defs>
    </svg>
  );

  const MoveCandidateIcon = () => (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.66536 7.33073C9.50631 7.33073 10.9987 5.83835 10.9987 3.9974C10.9987 2.15645 9.50631 0.664062 7.66536 0.664062C5.82442 0.664062 4.33203 2.15645 4.33203 3.9974C4.33203 5.83835 5.82442 7.33073 7.66536 7.33073Z" stroke="currentColor" />
      <path d="M12.6654 15.6667C14.5063 15.6667 15.9987 14.1743 15.9987 12.3333C15.9987 10.4924 14.5063 9 12.6654 9C10.8244 9 9.33203 10.4924 9.33203 12.3333C9.33203 14.1743 10.8244 15.6667 12.6654 15.6667Z" stroke="currentColor" />
      <path d="M11.5547 12.3345L12.2493 13.1678L13.7769 11.5938" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.1667 10.1085C9.39467 9.93277 8.55075 9.83594 7.66667 9.83594C3.98477 9.83594 1 11.5149 1 13.5859C1 15.657 1 17.3359 7.66667 17.3359C12.4062 17.3359 13.7763 16.4874 14.1723 15.2526" stroke="currentColor" />
    </svg>
  );

  const ArchiveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.83789 11.9968C8.83789 11.4276 8.83789 11.1429 8.92312 10.9183C9.03676 10.619 9.25473 10.3811 9.52908 10.257C9.73484 10.1641 9.99574 10.1641 10.5174 10.1641H13.8764C14.398 10.1641 14.6589 10.1641 14.8647 10.257C15.139 10.3811 15.357 10.619 15.4707 10.9183C15.5559 11.1429 15.5559 11.4276 15.5559 11.9968C15.5559 12.5661 15.5559 12.8508 15.4707 13.0753C15.357 13.3747 15.139 13.6126 14.8647 13.7366C14.6589 13.8296 14.398 13.8296 13.8764 13.8296H10.5174C9.99574 13.8296 9.73484 13.8296 9.52908 13.7366C9.25473 13.6126 9.03676 13.3747 8.92312 13.0753C8.83789 12.8508 8.83789 12.5661 8.83789 11.9968Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M21.714 5.89062V13.2217C21.714 17.8295 21.714 20.1335 20.4022 21.5649C19.0905 22.9964 16.9792 22.9964 12.7567 22.9964H11.637C7.41449 22.9964 5.30323 22.9964 3.99146 21.5649C2.67969 20.1335 2.67969 17.8295 2.67969 13.2217V5.89062" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1 3.44368C1 2.29172 1 1.71574 1.32794 1.35786C1.65589 1 2.1837 1 3.23933 1H21.154C22.2096 1 22.7374 1 23.0654 1.35786C23.3933 1.71574 23.3933 2.29172 23.3933 3.44368C23.3933 4.59564 23.3933 5.17161 23.0654 5.52949C22.7374 5.88735 22.2096 5.88735 21.154 5.88735H3.23933C2.1837 5.88735 1.65589 5.88735 1.32794 5.52949C1 5.17161 1 4.59564 1 3.44368Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );







  const handleCandidateClick = async (candidate: any, stageName: string) => {
    setCurrentStage(stageName);
    setSelectedCandidate(candidate);
    setProfileTab("Score");
    setShowCandidateProfile(true);
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

  const CustomFileIcon = () => (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.89941 7.3C5.89941 6.97387 5.89941 6.81077 5.9527 6.68211C6.02374 6.51061 6.16002 6.37432 6.33154 6.30327C6.46018 6.25 6.62328 6.25 6.94941 6.25H9.04941C9.37554 6.25 9.53864 6.25 9.6673 6.30327C9.8388 6.37432 9.97509 6.51061 10.0461 6.68211C10.0994 6.81077 10.0994 6.97387 10.0994 7.3C10.0994 7.62613 10.0994 7.78923 10.0461 7.91789C9.97509 8.08939 9.8388 8.22568 9.6673 8.29673C9.53864 8.35 9.37554 8.35 9.04941 8.35H6.94941C6.62328 8.35 6.46018 8.35 6.33154 8.29673C6.16002 8.22568 6.02374 8.08939 5.9527 7.91789C5.89941 7.78923 5.89941 7.62613 5.89941 7.3Z" stroke="#818283" strokeWidth="1.25" />
      <path d="M13.9498 3.80469V8.00469C13.9498 10.6445 13.9498 11.9645 13.1297 12.7846C12.3096 13.6047 10.9896 13.6047 8.3498 13.6047H7.6498C5.00994 13.6047 3.69001 13.6047 2.8699 12.7846C2.0498 11.9645 2.0498 10.6445 2.0498 8.00469V3.80469" stroke="#818283" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M1 2.4C1 1.74003 1 1.41005 1.20502 1.20502C1.41005 1 1.74003 1 2.4 1H13.6C14.26 1 14.5899 1 14.795 1.20502C15 1.41005 15 1.74003 15 2.4C15 3.05997 15 3.38995 14.795 3.59498C14.5899 3.8 14.26 3.8 13.6 3.8H2.4C1.74003 3.8 1.41005 3.8 1.20502 3.59498C1 3.38995 1 3.05997 1 2.4Z" stroke="#818283" strokeWidth="1.25" />
    </svg>
  );

  // UPDATED: Add state to track which candidates are being copied (for per-button spinner)
  const [copyingCandidates, setCopyingCandidates] = useState<Set<string>>(new Set());

  const handleCloseProfile = () => {
    setShowCandidateProfile(false);
    setCandidateDetails(null);
    setAssessmentAppId(null);          // ← prevents the effect from running again
    setCodingQuestions([]);
    setTotalQuestions(0);
    setDate("");
  };

  const handleCopyProfile = async (applicationId: string) => {
    // UPDATED: Set loading state for this candidate
    setCopyingCandidates(prev => new Set([...prev, applicationId]));

    try {
      const details = await apiClient.get(`/jobs/applications/${applicationId}/kanban-detail/`);
      // UPDATED: Fix undefined - access via .data, and add null check for safety
      const candidate_detailed_id = details?.data?.candidate?.id;
      if (!candidate_detailed_id) {
        throw new Error("Candidate ID not found");
      }
      const profileUrl = `https://app.nxthyre.com/candidate-profiles/${candidate_detailed_id}`;
      await navigator.clipboard.writeText(profileUrl);
      showToast.success("Candidate profile URL copied to clipboard");
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      showToast.error("Failed to copy profile URL");
    } finally {
      // UPDATED: Clear loading state for this candidate
      setCopyingCandidates(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await apiClient.get(`/jobs/applications/stages/?job_id=${jobId}`);
        // Sort by sort_order just in case
        const sorted = res.data.sort((a: any, b: any) => a.sort_order - b.sort_order);
        setPipelineStages(sorted);
      } catch (err) {
        console.error("Failed to load pipeline stages", err);
        showToast.error("Could not load interview rounds");
      } finally {
        setStagesLoading(false);
      }
    };
    if (jobId) fetchStages();
  }, [jobId, stagesRefreshKey]);


  const renderCandidateCard = (candidate: any, stage: string) => (
    <div
      id={`candidate-${candidate.id}`}
      key={candidate.id}
      draggable
      onDragStart={() => handleDragStart(candidate, stage)}
      className={`relative bg-white rounded-2xl mb-2 cursor-move hover:shadow-lg transition-all duration-200 border ${highlightedCandidateId === candidate.id ? "border-blue-500 border-2" : ""
        } hover:border-gray-300`}
    >
      <div className="absolute top-4 right-4 w-3 h-3 border border-gray-300 rounded"></div>

      {/* Main Grid Container - 12 columns */}
      <div className="px-4 pt-4 grid grid-cols-12 items-center">

        {/* Profile Initials */}
        <div className="col-span-2">
          <div className="w-10 h-10 rounded-full bg-[#0F47F2] flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {candidate.profile_picture_url ? (
                <img
                  src={candidate.profile_picture_url}
                  alt={candidate.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (candidate.name.split(/\s+/).map((word: any) => word[0].toUpperCase()).join("").slice(0, 2))
              }
            </span>
          </div>
        </div>

        {/* Name and Title */}
        <div className="flex items-center col-span-8">

          <div className="flex items-end gap-0.5 mr-2">
            <div className={`w-0.5 h-4 bg-green-600 rounded`}></div>
            <div className={`w-0.5 h-3 bg-green-600 rounded`}></div>
            <div className={`w-0.5 h-2 bg-green-600 rounded`}></div>
          </div>

          <button
            onClick={() => handleCandidateClick(candidate, stage)}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block mb-1"
          >
            {candidate.name}
          </button>

        </div>




        {/* Experience Info - starts from column 3 */}
        <div className="col-start-3 col-span-10">
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
            <span>{candidate.total_experience}{candidate.total_experience >= 0 && (" Y • ")} {candidate.notice_period_days} {candidate.notice_period_days && (" NP • ")}{candidate.current_salary} {candidate.current_salary && (" LPA • ")} {candidate.location}</span>
          </div>
        </div>

        {/* Social Icons - starts from column 3 */}
        <div className="col-start-3 col-span-7">
          <div className="flex gap-2 mt-4">
            {candidate.socials.linkedin_url && (
              <button
                onClick={() => window.open(candidate.socials.linkedin_url, '_blank')}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <Linkedin className="w-3 h-3 text-gray-500" />
              </button>
            )}
            {candidate.socials.github_url && (
              <button
                onClick={() => window.open(candidate.socials.github_url, '_blank')}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <Github className="w-3 h-3 text-gray-500" />
              </button>
            )}
            {candidate.socials.resume_url && (
              <button
                onClick={() => window.open(candidate.socials.resume_url, '_blank')}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <File className="w-3 h-3 text-gray-500" />
              </button>
            )}
            <button
              onClick={() => handleCopyProfile(candidate.id)}
              // UPDATED: Disable during loading and add opacity for visual feedback
              disabled={copyingCandidates.has(candidate.id)}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-waiting"
            >
              {/* UPDATED: Show spinner (simple CSS) during loading, else Copy icon */}
              {copyingCandidates.has(candidate.id) ? (
                <div className="w-3 h-3 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Copy className="w-3 h-3 text-gray-500" />
              )}
            </button>
            <button
              onClick={() => {
                setFeedbackData({
                  candidate,
                  fromStage: stage,
                  toStage: "Archives",
                  isMovingForward: true
                });
                setShowFeedbackModal(true);
              }}
              className="w-6 h-6 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <CustomFileIcon />
            </button>
          </div>
        </div>


      </div>
      <div className="border-t border-gray-200 my-3"></div>
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex gap-6 text-gray-900">
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="18" fill="white" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.9976 2H10.0024C11.0464 1.99999 11.8649 1.99999 12.5188 2.06217C13.1853 2.12554 13.731 2.25693 14.2122 2.55174C14.716 2.86047 15.1396 3.28405 15.4483 3.78785C15.7431 4.26894 15.8745 4.81469 15.9378 5.48119C16 6.13507 16 6.95356 16 7.9976V8.69252C16 9.43569 16 10.0184 15.9679 10.4891C15.9352 10.968 15.8677 11.3666 15.715 11.7351C15.335 12.6526 14.6061 13.3815 13.6886 13.7615C13.1645 13.9786 12.5675 14.0268 11.7501 14.0408C11.4641 14.0458 11.283 14.0494 11.145 14.0647C11.016 14.079 10.966 14.0999 10.9367 14.117C10.9058 14.1349 10.8638 14.1676 10.7908 14.2678C10.7117 14.3763 10.6224 14.5261 10.4809 14.7653L10.1279 15.3617C9.62414 16.2127 8.37586 16.2127 7.87212 15.3617L7.51912 14.7653C7.37753 14.5261 7.28824 14.3763 7.20921 14.2678C7.13619 14.1676 7.09413 14.1349 7.06326 14.117C7.034 14.0999 6.98399 14.079 6.85499 14.0647C6.71694 14.0494 6.53584 14.0458 6.24992 14.0408C5.43253 14.0268 4.83551 13.9786 4.31135 13.7615C3.39392 13.3815 2.66502 12.6526 2.28501 11.7351C2.13234 11.3666 2.06479 10.968 2.03212 10.4891C1.99999 10.0184 2 9.43569 2 8.69252V7.9976C1.99999 6.95356 1.99999 6.13507 2.06217 5.48119C2.12554 4.81469 2.25693 4.26894 2.55174 3.78785C2.86047 3.28405 3.28405 2.86047 3.78785 2.55174C4.26894 2.25693 4.81469 2.12554 5.48119 2.06217C6.13507 1.99999 6.95356 1.99999 7.9976 2ZM5.57364 3.03452C4.97864 3.0911 4.60003 3.19959 4.2982 3.38455C3.92583 3.61275 3.61275 3.92583 3.38455 4.2982C3.19959 4.60003 3.0911 4.97864 3.03452 5.57364C2.97726 6.17591 2.97674 6.94803 2.97674 8.02326V8.67442C2.97674 9.4396 2.97701 9.98905 3.00659 10.4226C3.03588 10.8518 3.09224 11.1316 3.1874 11.3614C3.46828 12.0395 4.00703 12.5782 4.68513 12.8591C5.02089 12.9982 5.44925 13.0502 6.26674 13.0643L6.28746 13.0646C6.54663 13.0691 6.77373 13.073 6.96249 13.0939C7.16532 13.1163 7.36369 13.1617 7.55433 13.2726C7.74339 13.3826 7.87967 13.5294 7.99858 13.6925C8.10836 13.8432 8.22121 14.0339 8.3491 14.2499L8.71264 14.8642C8.83819 15.0762 9.16181 15.0762 9.28729 14.8642L9.6509 14.2499C9.77873 14.0339 9.89157 13.8432 10.0014 13.6925C10.1203 13.5294 10.2566 13.3826 10.4456 13.2726C10.6363 13.1617 10.8347 13.1163 11.0375 13.0939C11.2263 13.073 11.4533 13.0691 11.7125 13.0646L11.7333 13.0643C12.5507 13.0502 12.9791 12.9982 13.3149 12.8591C13.993 12.5782 14.5317 12.0395 14.8126 11.3614C14.9077 11.1316 14.9641 10.8518 14.9934 10.4226C15.023 9.98905 15.0233 9.4396 15.0233 8.67442V8.02326C15.0233 6.94803 15.0227 6.17591 14.9655 5.57364C14.9089 4.97864 14.8004 4.60003 14.6154 4.2982C14.3873 3.92583 14.0742 3.61275 13.7018 3.38455C13.4 3.19959 13.0214 3.0911 12.4264 3.03452C11.8241 2.97726 11.0519 2.97674 9.97674 2.97674H8.02326C6.94803 2.97674 6.17591 2.97726 5.57364 3.03452ZM5.90698 7.04651C5.90698 6.77679 6.12563 6.55814 6.39535 6.55814H11.6047C11.8744 6.55814 12.093 6.77679 12.093 7.04651C12.093 7.31623 11.8744 7.53488 11.6047 7.53488H6.39535C6.12563 7.53488 5.90698 7.31623 5.90698 7.04651ZM5.90698 9.32558C5.90698 9.05587 6.12563 8.83721 6.39535 8.83721H9.97674C10.2465 8.83721 10.4651 9.05587 10.4651 9.32558C10.4651 9.59529 10.2465 9.81395 9.97674 9.81395H6.39535C6.12563 9.81395 5.90698 9.59529 5.90698 9.32558Z" fill="#818283" />
                <circle cx="16" cy="5" r="2" fill="#0F47F2" />
              </svg>

              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-base">1</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="18" height="18" fill="white" />
              <g clip-path="url(#clip0_3861_2370)">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.29623 1.83203H9.70116C10.4564 1.83202 11.0736 1.832 11.5608 1.89751C12.0701 1.96598 12.5116 2.11417 12.8641 2.46663C13.2166 2.8191 13.3648 3.26066 13.4332 3.76996C13.4669 4.02042 13.4832 4.30522 13.4912 4.62546C14.1967 4.73927 14.7748 4.96331 15.2379 5.42632C15.7368 5.92523 15.9582 6.55787 16.0633 7.33948C16.1654 8.09897 16.1654 9.06937 16.1654 10.2946V10.3698C16.1654 11.595 16.1654 12.5654 16.0633 13.3248C15.9582 14.1064 15.7368 14.7391 15.2379 15.238C14.739 15.7369 14.1063 15.9583 13.3247 16.0634C12.5652 16.1655 11.5948 16.1655 10.3696 16.1655H7.62776C6.40258 16.1655 5.43216 16.1655 4.67268 16.0634C3.89107 15.9583 3.25844 15.7369 2.75952 15.238C2.26062 14.7391 2.0392 14.1064 1.93412 13.3248C1.83201 12.5654 1.83202 11.595 1.83203 10.3698V10.2946C1.83202 9.06937 1.83201 8.09897 1.93412 7.33948C2.0392 6.55787 2.26062 5.92523 2.75952 5.42632C3.22254 4.96331 3.80071 4.73927 4.50619 4.62546C4.51414 4.30522 4.5305 4.02042 4.56418 3.76996C4.63265 3.26066 4.78084 2.8191 5.1333 2.46663C5.48576 2.11417 5.92732 1.96598 6.43662 1.89751C6.92386 1.832 7.54102 1.83202 8.29623 1.83203ZM4.4987 5.64278C4.01137 5.74062 3.70253 5.89753 3.46663 6.13343C3.18449 6.41557 3.01538 6.802 2.9252 7.47272C2.83309 8.15783 2.83203 9.06097 2.83203 10.3322C2.83203 11.6034 2.83309 12.5065 2.9252 13.1916C3.01538 13.8623 3.18449 14.2488 3.46663 14.5309C3.74877 14.813 4.1352 14.9822 4.80593 15.0723C5.49104 15.1644 6.39415 15.1655 7.66536 15.1655H10.332C11.6032 15.1655 12.5064 15.1644 13.1915 15.0723C13.8622 14.9822 14.2486 14.813 14.5308 14.5309C14.8129 14.2488 14.982 13.8623 15.0722 13.1916C15.1643 12.5065 15.1654 11.6034 15.1654 10.3322C15.1654 9.06097 15.1643 8.15783 15.0722 7.47272C14.982 6.802 14.8129 6.41557 14.5308 6.13343C14.2949 5.89753 13.986 5.74062 13.4987 5.64278V6.41637C13.4987 6.44712 13.4987 6.47751 13.4988 6.50755C13.4993 7.03158 13.4998 7.44666 13.3256 7.8185C13.1514 8.1903 12.8323 8.4557 12.4294 8.79077C12.4063 8.80997 12.3829 8.82937 12.3593 8.8491L11.8545 9.26977C11.2636 9.76217 10.7846 10.1613 10.3619 10.4332C9.92156 10.7164 9.49276 10.8953 8.9987 10.8953C8.50463 10.8953 8.07583 10.7164 7.63548 10.4332C7.21278 10.1613 6.73384 9.76217 6.14294 9.26977L5.63811 8.8491C5.61448 8.82937 5.59112 8.80997 5.56804 8.79077C5.1651 8.4557 4.84594 8.1903 4.67178 7.8185C4.49763 7.44666 4.49807 7.03158 4.49863 6.50754C4.49866 6.47751 4.4987 6.44712 4.4987 6.41637V5.64278ZM6.56987 2.88859C6.17146 2.94216 5.9761 3.03804 5.8404 3.17374C5.70471 3.30943 5.60882 3.50479 5.55526 3.9032C5.49976 4.316 5.4987 4.86556 5.4987 5.66536V6.41637C5.4987 7.07724 5.50974 7.24994 5.57737 7.39433C5.645 7.53872 5.7706 7.65777 6.2783 8.08083L6.75805 8.48063C7.38002 8.99897 7.81183 9.35763 8.17643 9.5921C8.5293 9.8191 8.76863 9.8953 8.9987 9.8953C9.22876 9.8953 9.4681 9.8191 9.82096 9.5921C10.1856 9.35763 10.6174 8.99897 11.2394 8.48063L11.7191 8.08083C12.2268 7.65777 12.3524 7.53872 12.42 7.39433C12.4876 7.24994 12.4987 7.07724 12.4987 6.41637V5.66536C12.4987 4.86556 12.4976 4.316 12.4422 3.9032C12.3886 3.50479 12.2927 3.30943 12.157 3.17374C12.0213 3.03804 11.826 2.94216 11.4275 2.88859C11.0148 2.83309 10.4652 2.83203 9.66536 2.83203H8.33203C7.53222 2.83203 6.98266 2.83309 6.56987 2.88859ZM7.16536 4.9987C7.16536 4.72256 7.38922 4.4987 7.66536 4.4987H10.332C10.6082 4.4987 10.832 4.72256 10.832 4.9987C10.832 5.27485 10.6082 5.4987 10.332 5.4987H7.66536C7.38922 5.4987 7.16536 5.27485 7.16536 4.9987ZM7.83203 6.9987C7.83203 6.72256 8.0559 6.4987 8.33203 6.4987H9.66536C9.9415 6.4987 10.1654 6.72256 10.1654 6.9987C10.1654 7.27485 9.9415 7.4987 9.66536 7.4987H8.33203C8.0559 7.4987 7.83203 7.27485 7.83203 6.9987Z" fill="#818283" />
              </g>
              <defs>
                <clipPath id="clip0_3861_2370">
                  <rect width="16" height="16" fill="white" transform="translate(1 1)" />
                </clipPath>
              </defs>
            </svg>

            <span className="text-base">1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="18" fill="white" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.49998 3C6.16573 3 4.27343 4.93663 4.27343 7.32558V7.71857C4.27343 8.10753 4.16092 8.48785 3.9501 8.81146L3.32369 9.77308C2.59667 10.8892 3.15169 12.4062 4.41617 12.7591C4.82825 12.8742 5.24381 12.9714 5.66178 13.051L5.66282 13.0539C6.0822 14.1991 7.20309 15 8.49998 15C9.79686 15 10.9177 14.1991 11.3371 13.0539L11.3382 13.051C11.7561 12.9714 12.1718 12.8742 12.5838 12.7591C13.8483 12.4062 14.4033 10.8892 13.6763 9.77308L13.0499 8.81146C12.8391 8.48785 12.7266 8.10753 12.7266 7.71857V7.32558C12.7266 4.93663 10.8343 3 8.49998 3ZM10.3414 13.2067C9.11815 13.3563 7.88176 13.3562 6.65855 13.2066C7.04628 13.7768 7.72066 14.1628 8.49998 14.1628C9.27925 14.1628 9.95365 13.7768 10.3414 13.2067ZM5.09147 7.32558C5.09147 5.39901 6.61752 3.83721 8.49998 3.83721C10.3825 3.83721 11.9085 5.39901 11.9085 7.32558V7.71857C11.9085 8.27286 12.0688 8.8147 12.3692 9.27589L12.9956 10.2375C13.413 10.8781 13.0944 11.7488 12.3686 11.9514C9.8358 12.6584 7.16422 12.6584 4.6314 11.9514C3.90562 11.7488 3.58705 10.8781 4.00434 10.2375L4.63075 9.27589C4.93116 8.8147 5.09147 8.27286 5.09147 7.71857V7.32558Z" fill="#818283" />
              </svg>

              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-base">7</span>
          </div>
        </div>
        <div className={`text-2xl font-medium text-[#1CB977]`}>
          75%
        </div>
      </div>
    </div>
  );

  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  // UPDATED: Dynamic "Move to Next Round" using dynamicShareableStages
  const handleMoveToNext = () => {
    if (!selectedCandidate || !currentStage) return;

    const stageNames = dynamicShareableStages.map((s: any) => s.name);
    const currentIndex = stageNames.indexOf(currentStage);

    if (currentIndex === -1) {
      showToast.error("Current stage not found.");
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= stageNames.length) {
      showToast.error("No next stage available.");
      return;
    }

    const nextStageName = stageNames[nextIndex];

    setFeedbackData({
      candidate: selectedCandidate,
      fromStage: currentStage,
      toStage: nextStageName,
      isMovingForward: true
    });
    setShowFeedbackModal(true);
  };

  const handleArchive = () => {
    if (!selectedCandidate || !currentStage) return;
    setFeedbackData({
      candidate: selectedCandidate,
      fromStage: currentStage,
      toStage: "Archives",
      isMovingForward: true
    });
    setShowFeedbackModal(true);
  };

  const renderCandidateProfile = () => {
    if (!selectedCandidate) return null;

    const details = candidateDetails;
    const candidate = details?.candidate || selectedCandidate;

    return (
      <div className=" fixed inset-0 bg-black bg-opacity-30 z-[60] flex">
        <div className="zoom-80-container ml-auto w-2/3 bg-gray-100 shadow-xl h-full overflow-y-auto py-6">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => handleCloseProfile()}
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
            <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col">
              {/* Header - Mirrors PipelinesSideCard */}
              <div className="p-4 border-b border-gray-200 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {candidate.full_name}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">
                      {candidate.headline || "No headline"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {candidate.location || "No location"}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {candidate.premium_data?.email || "—"}
                      </span>
                    </div>
                    {candidate.premium_data?.email && (
                      <button onClick={() => handleCopy(candidate.premium_data!.email!)}>
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {candidate.premium_data?.phone || "—"}
                      </span>
                    </div>
                    {candidate.premium_data?.phone && (
                      <div className="flex space-x-2">
                        <button onClick={() => handleWhatsApp(candidate.premium_data!.phone!)}>
                          <FontAwesomeIcon icon={faWhatsapp} className="text-gray-400 hover:text-gray-600" />
                        </button>
                        <button onClick={() => handleCopy(candidate.premium_data!.phone!)}>
                          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links (visible if available) */}
                <div className="flex space-x-3">
                  {candidate.premium_data?.linkedin_url && (
                    <a href={candidate.premium_data.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                    </a>
                  )}
                  {candidate.premium_data?.github_url && (
                    <a href={candidate.premium_data.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  {candidate.premium_data?.portfolio_url && (
                    <a href={candidate.premium_data.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Link className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                </div>
              </div>

              {/* Tabbed Details - Exact copy of StageDetails.tsx logic */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex border-b border-gray-200">
                  {["Score", "Profile", "Coding", "Interview", "Activity", "Notes"].map((tab: any) => (
                    <button
                      key={tab}
                      onClick={() => setProfileTab(tab)}
                      className={`py-3 px-4 text-sm font-medium transition-colors ${profileTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {renderTabContent()}  {/* Paste exact renderTabContent() from StageDetails.tsx here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const getStageCount = (stageName: string) =>
    stageCandidates[stageName]?.length || 0;


  if (!isAuthenticated) {
    return <div>You need to be logged in to view this page.</div>;
  }


  return (
    <>
      <div className="zoom-80-container bg-[#FFFFFF]">
        <div className="mb-4 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between max-w-full mx-auto px-7 py-2">

          <div className="flex items-center">
            <svg width="124" height="61" viewBox="0 0 158 61" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_2895_678" fill="white">
                <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" />
                <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" />
                <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" />
                <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" />
                <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" />
                <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" />
                <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" />
              </mask>
              <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" fill="#0F47F2" />
              <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" fill="white" />
              <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" fill="white" />
              <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" fill="white" />
              <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" fill="#4B5563" />
              <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" fill="#4B5563" />
              <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" fill="#4B5563" />
              <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)" />
              <path d="M69.7191 2L71.6001 7.08929L77.2429 9.5L71.6001 11.375L69.7191 17L67.8382 11.375L62.1953 9.5L67.8382 7.08929L69.7191 2Z" fill="white" />
              <path d="M105.439 22.6285C105.463 25.0588 106.437 27.8518 108.178 29.5532C109.92 31.2545 112.267 32.1967 114.705 32.1724C117.143 32.1481 119.472 31.1594 121.179 29.4238C122.885 27.6881 123.853 25.0654 123.829 22.6351L121.099 22.6351C121.117 24.3571 120.475 26.3244 119.265 27.5542C118.056 28.7841 116.406 29.4846 114.679 29.5018C112.951 29.519 111.288 28.8514 110.054 27.6459C108.82 26.4404 108.133 24.3505 108.116 22.6285L105.439 22.6285Z" fill="#4B5563" />
              <path d="M107.565 39.1203C108.894 40.6673 110.701 41.7267 112.701 42.1306C114.7 42.5346 116.777 42.26 118.602 41.3504C120.428 40.4409 121.898 38.9482 122.779 37.109C123.661 35.2697 123.903 33.1889 123.469 31.1961L120.807 31.7764C121.113 33.1768 120.942 34.639 120.322 35.9315C119.703 37.224 118.67 38.2729 117.387 38.912C116.104 39.5512 114.645 39.7441 113.24 39.4603C111.835 39.1764 110.565 38.432 109.631 37.3449L107.565 39.1203Z" fill="#0F47F2" />
            </svg>
          </div>
          <div>
            <button className="bg-blue-600 text-white px-4 py-2 font-semibold text-sm hover:bg-blue-700 rounded-lg">Explore Nxthyre</button>
          </div>
        </div>
        <div className="mx-auto max-w-[95vw] min-h-screen space-y-4">


          <div className="relative bg-white rounded-xl shadow-lg px-8 py-6 font-['Gellix',_sans-serif]">
            <button onClick={handleGoToDashboard} className="absolute left-4 top-1/2 -translate-y-1/2">
              <ChevronLeft className="w-7 h-7 text-gray-600" />
            </button>
            <div className="flex items-center justify-between pl-8">
              <div className="flex items-center gap-12">
                <div>
                  <h1 className="text-2xl font-medium text-[#181D25] mb-2">
                    {pipelineName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-500 text-base">
                    <span>{location}</span>
                    <div className="w-px h-5 bg-gray-400" />
                    <span>{experience}</span>
                    <div className="w-px h-5 bg-gray-400" />
                    <span>{workMode}</span>
                    <div className="w-px h-5 bg-gray-400" />
                    <span>{notice}</span>
                  </div>
                </div>
              </div>



              <div className="flex items-center gap-6">
                <div className="relative hidden sm:flex items-center rounded-lg px-3 py-1 border border-blue-200 bg-blue-50 cursor-pointer w-88">
                  <input
                    type="text"
                    placeholder="Search Candidate"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      if (query.trim()) {
                        const allCandidates = Object.values(stageCandidates).flat();
                        const filtered = allCandidates.filter((c: Candidate) =>
                          c.name.toLowerCase().includes(query.toLowerCase())
                        );
                        setSuggestions(filtered.slice(0, 5));
                        setSelectedSuggestionIndex(-1);
                      } else {
                        setSuggestions([]);
                      }
                    }}
                    onKeyDown={handleInputKeyDown}
                    className="text-sm bg-blue-50 text-gray-700 placeholder-gray-400 w-full outline-none"
                  />
                  <div
                    onClick={handleSearch}
                    className="w-8 h-7 flex items-center justify-center bg-blue-500 rounded-lg ml-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.id}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {suggestion.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{suggestion.name}</div>
                            <div className="text-sm text-gray-500">{suggestion.role} at {suggestion.company}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">Share:</p>
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="p-1 border border-gray-300 text-gray-300 text-sm font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-1 border border-gray-300 text-gray-300 text-sm font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="font-['Gellix',_sans-serif]">
            <div className="relative mx-8">
              <div className="flex items-center gap-24 pt-4 border-b border-[#818283]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-4 text-xl font-semibold transition-colors duration-200 ${activeTab === tab.id
                      ? "text-[#0F47F2]"
                      : "text-[#818283] hover:text-gray-500"
                      }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#0F47F2] rounded-t-full"
                        style={{ borderRadius: "8px 8px 0 0" }}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#818283]" />
            </div>

            <div className=" px-8 py-10 min-h-screen">
              {activeTab === "pipeline" ? (
                <div className="">

                  <div className="overflow-x-auto hide-scrollbar">
                    <div className="flex space-x-4 min-w-max pb-2">
                      {dynamicShareableStages.map((stage) => {
                        const candidates = stageCandidates[stage.name] || [];
                        const stageCount = getStageCount(stage.name);
                        return (
                          <div
                            key={stage.id}
                            className="w-96 h-[98vh] min-h-max"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage.name)}
                          >
                            <div className={`bg-[#F5F9FB] h-full rounded-lg p-3 space-y-3`}>

                              <div className="flex relative items-center mb-2">
                                <div className={`absolute left-[-10px] w-1 h-6 ${stage.bgColor} rounded-r mr-3`}></div>
                                <h1 className="pl-3 text-xl font-medium text-gray-700"> {stage.name}</h1>
                                <button className="ml-auto">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  </div>
                                </button>
                              </div>


                              <div className="pt-8 overflow-y-auto max-h-[85vh] hide-scrollbar">
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
                      <div className="w-96 h-[80vh] min-h-max bg-[#F5F9FB] rounded-lg flex flex-col items-center justify-center relative">
                        <button
                          onClick={() => setShowAddStageForm(true)}
                          className="absolute inset-0 w-full h-full cursor-pointer hover:bg-black/5 transition-colors rounded-lg"
                        >

                          <div className="flex flex-col items-center gap-4 z-10">
                            <div className="w-[62px] h-[62px]">
                              <svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32.9375 23.25C32.9375 22.18 32.07 21.3125 31 21.3125C29.93 21.3125 29.0625 22.18 29.0625 23.25V29.0625H23.25C22.18 29.0625 21.3125 29.93 21.3125 31C21.3125 32.07 22.18 32.9375 23.25 32.9375H29.0625V38.75C29.0625 39.82 29.93 40.6875 31 40.6875C32.07 40.6875 32.9375 39.82 32.9375 38.75V32.9375H38.75C39.82 32.9375 40.6875 32.07 40.6875 31C40.6875 29.93 39.82 29.0625 38.75 29.0625H32.9375V23.25Z" fill="#818283" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M31.1496 3.23047H30.853C24.8898 3.23044 20.2164 3.23042 16.5701 3.72066C12.8378 4.22244 9.89276 5.26957 7.58116 7.58116C5.26957 9.89276 4.22244 12.8378 3.72066 16.5701C3.23042 20.2164 3.23044 24.8897 3.23047 30.853V31.1496C3.23044 37.1129 3.23042 41.7862 3.72066 45.4326C4.22244 49.1647 5.26957 52.11 7.58116 54.4215C9.89276 56.7331 12.8378 57.7801 16.5701 58.2821C20.2164 58.7721 24.8897 58.7721 30.853 58.7721H31.1496C37.1129 58.7721 41.7862 58.7721 45.4326 58.2821C49.1647 57.7801 52.11 56.7331 54.4215 54.4215C56.7331 52.11 57.7801 49.1647 58.2821 45.4326C58.7721 41.7862 58.7721 37.1129 58.7721 31.1496V30.853C58.7721 24.8897 58.7721 20.2164 58.2821 16.5701C57.7801 12.8378 56.7331 9.89276 54.4215 7.58116C52.11 5.26957 49.1647 4.22244 45.4326 3.72066C41.7862 3.23042 37.1129 3.23044 31.1496 3.23047ZM10.3212 10.3212C11.7928 8.84958 13.7838 8.00511 17.0864 7.56109C20.4447 7.10958 24.8575 7.10547 31.0013 7.10547C37.145 7.10547 41.5578 7.10958 44.9162 7.56109C48.2187 8.00511 50.2097 8.84958 51.6814 10.3212C53.1531 11.7928 53.9976 13.7838 54.4414 17.0864C54.893 20.4447 54.8971 24.8575 54.8971 31.0013C54.8971 37.145 54.893 41.5578 54.4414 44.9162C53.9976 48.2187 53.1531 50.2097 51.6814 51.6814C50.2097 53.1531 48.2187 53.9976 44.9162 54.4414C41.5578 54.893 37.145 54.8971 31.0013 54.8971C24.8575 54.8971 20.4447 54.893 17.0864 54.4414C13.7838 53.9976 11.7928 53.1531 10.3212 51.6814C8.84958 50.2097 8.00511 48.2187 7.56109 44.9162C7.10958 41.5578 7.10547 37.145 7.10547 31.0013C7.10547 24.8575 7.10958 20.4447 7.56109 17.0864C8.00511 13.7838 8.84958 11.7928 10.3212 10.3212Z" fill="#818283" />
                              </svg>
                            </div>

                            <h3 className="font-medium text-xl leading-6 text-[#818283]">
                              Add Custom Stage
                            </h3>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "calendar" ? (
                <div className="relative">
                  <Calender
                    key={calendarRefreshTrigger}
                    onCellClick={(date: string, time?: string) => {
                      setSelectedEventDate(date);
                      setSelectedEventTime(time || "09:00");
                      setShowAddEventForm(true);
                    }}
                    onEventClick={handleEventClick}
                    pipelineStages={pipelineStages.filter(s => {
                      const order = s.sort_order;
                      const shortlistedOrder = pipelineStages.find(st => st.slug === 'shortlisted')?.sort_order || 5;
                      return s.sort_order > shortlistedOrder && s.slug !== 'archives';
                    })}
                    stagesLoading={stagesLoading}
                  />
                </div>
              ) :
                (
                  <div className="flex items-center justify-center min-h-screen -mt-20">
                    <div className="border-2 border-dashed border-gray-600 rounded-3xl p-24 text-center max-w-2xl">
                      <h2 className="text-5xl font-bold text-gray-400 mb-6">
                        Feature Coming Soon
                      </h2>
                      <p className="text-2xl text-gray-500">
                        The <span className="text-[#0F47F2] font-semibold">
                          {tabs.find(t => t.id === activeTab)?.label}
                        </span> section is under active development.
                      </p>
                      <p className="text-lg text-gray-600 mt-6">
                        Stay tuned — exciting updates are on the way!
                      </p>
                    </div>
                  </div>
                )}
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
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isSharing ? "opacity-50 cursor-not-allowed" : ""
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-[60] flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-xl h-[70vh] shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-6">
              {(feedbackData.toStage === "Archives") ? (
                <div className="flex items-center text-center mb-6 gap-4">
                  <h3 className="text-lg font-[400] text-gray-800 mb-1">
                    Are you sure want to
                    <span className="text-xl font-[400] text-[#0F47F2]">
                      Archive Candidate?
                    </span>
                  </h3>

                </div>
              ) :
                (
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-[400] text-gray-800 mb-1">
                      Are you sure want to move this
                    </h3>
                    <p className="text-lg font-[400] text-gray-800">
                      candidate to next stage?
                    </p>
                  </div>
                )}

              <div className="mb-6">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Profile Initials */}
                    <div className="col-span-2">
                      <div className="w-10 h-10 rounded-full bg-[#0F47F2] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {feedbackData.candidate.name.split(/\s+/).map((word: any) => word[0].toUpperCase()).join("").slice(0, 2)}
                        </span>
                      </div>
                    </div>

                    {/* Name and Title */}
                    <div className="col-span-7">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {feedbackData.candidate.name}
                      </h4>
                      <p className="text-xs text-blue-600">
                        {feedbackData.candidate.role} | {feedbackData.candidate.company}
                      </p>
                    </div>

                    {/* Percentage Badge */}
                    <div className="col-span-3 text-right">
                      <span className="text-lg font-[400] text-blue-600 bg-blue-100 border border-blue-200 px-1 rounded-md">
                        75%
                      </span>
                    </div>

                    {/* Experience Info */}
                    <div className="col-start-3 col-span-10">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                        <span>5Y • 15 NP • 20 LPA • Bangalore</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Transition */}

              {(feedbackData.toStage !== "Archives") && (
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-sm text-gray-600 font-medium">
                    {feedbackData.fromStage}
                  </span>
                  <div className="flex items-center">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {feedbackData.toStage}
                  </span>
                </div>
              )}



              {/* Comment Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment*
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Type your feedback here!"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none text-sm placeholder-gray-400"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {feedbackData.toStage === "Archives" && (
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackComment.trim()}
                    className="flex-1 px-4 py-2.5 bg-[#CF272D] text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>

                {feedbackData.toStage !== "Archives" && (


                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackComment.trim()}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Move to Next Stage
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add New Stage Form - Full Screen Overlay */}
      {showAddStageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex">
          <div className="ml-auto">
            <AddNewStageForm onClose={() => setShowAddStageForm(false)}
              onStageCreated={() => setStagesRefreshKey(prev => prev + 1)}
            />
          </div>


        </div>
      )}
      {showCandidateProfile && renderCandidateProfile()}
      {showEventPreview && selectedEvent && eventCandidateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex">
          <div className="ml-auto">
            <EventPreview
              event={selectedEvent}
              candidate={eventCandidateDetails}
              onClose={() => {
                setShowEventPreview(false);
                setSelectedEvent(null);
                setEventCandidateDetails(null);
              }}
            />
          </div>
        </div>
      )}
      {showAddEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex">
          <div
            className="flex-1"
            onClick={() => setShowAddEventForm(false)}
          />
          <EventForm
            isOpen={showAddEventForm}
            onClose={() => setShowAddEventForm(false)}
            onSubmit={async (eventData) => {
              try {
                const payload = {
                  application: Number(eventData.applicationId), // We'll add this field next
                  title: eventData.title || `${eventData.attendee} - Interview`,
                  start_at: `${eventData.date}T${eventData.startTime}:00Z`,
                  end_at: `${eventData.date}T${eventData.endTime}:00Z`,
                  location_type: "VIRTUAL",
                  virtual_conference_url: "https://meet.google.com/placeholder-tbd",
                  status: "SCHEDULED",
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  reminder_preferences: {
                    candidate: [24],
                    interviewers: [2],
                  },
                };

                await apiClient.post('/jobs/interview-events/', payload);
                showToast.success("Interview scheduled successfully!");

                // Trigger calendar refresh
                setCalendarRefreshTrigger(prev => prev + 1);
              } catch (err: any) {
                const msg = err.response?.data?.detail || "Failed to schedule interview";
                showToast.error(msg);
              } finally {
                setShowAddEventForm(false);
              }
            }}
            initialDate={selectedEventDate}
            initialTime={selectedEventTime}
            pipelineStages={pipelineStages.filter(s => {
              const order = s.sort_order;
              const shortlistedOrder = pipelineStages.find(st => st.slug === 'shortlisted')?.sort_order || 5;
              return s.sort_order > shortlistedOrder && s.slug !== 'archives';
            })}
            stagesLoading={stagesLoading}
            candidates={Object.values(stageCandidates).flat()}
          />

        </div>
      )}

    </>
  );
};

export default PipelineSharePage;
