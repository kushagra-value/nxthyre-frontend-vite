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
  DollarSign,
  Users,
  Share,
  Eye,
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
  MessageSquareText,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp, faWindows } from "@fortawesome/free-brands-svg-icons";
import { showToast } from "../../utils/toast";
import apiClient from "../../services/api";
import AddNewStageForm from "./AddNewStageForm";
import { useAuthContext } from "../../context/AuthContext";
import candidateService from "../../services/candidateService";
import { useParams } from "react-router-dom";
import { Calender } from "../calender/Calender";
import { EventForm } from "../calender/EventForm";
import { CalendarEvent } from "../../data/mockEvents";
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
  location?: string;
  experience?: string;
  workMode?: string;
  notice?: string;
  workspaceId?: number;
  onBack?: () => void;
  onHomepage?: () => void; // New prop for navigating back to homepage
}

const PipelineSharePage: React.FC<PipelineSharePageProps> = ({
  pipelineName,
  location,
  experience,
  workMode,
  notice,
  workspaceId,
  onBack,
  onHomepage,
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
  const [currentStage, setCurrentStage] = useState<string>("");
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
  const [selectedEventDate, setSelectedEventDate] = useState<string>("");
  const [selectedEventTime, setSelectedEventTime] = useState<string>("");
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]); // NEW
  const [stagesLoading, setStagesLoading] = useState(true);
  const [showEventPreview, setShowEventPreview] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventCandidateDetails, setEventCandidateDetails] = useState<any>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set(),
  );
  const [selectionStage, setSelectionStage] = useState<string | null>(null);
  const [archiveMenuStage, setArchiveMenuStage] = useState<string | null>(null);
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
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [expandedIndices, setExpandedIndices] = useState(new Set([0]));
  const [showMoreProfile, setShowMoreProfile] = useState(false);

  const [activeTab, setActiveTab] = useState("pipeline");

  const [profileTab, setProfileTab] = useState<
    "Score" | "Profile" | "Coding" | "Interview" | "Activity" | "Notes"
  >("Score");
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

  const [stageCandidates, setStageCandidates] = useState<
    Record<string, Candidate[]>
  >({});
  const [highlightedCandidateId, setHighlightedCandidateId] = useState<
    string | null
  >(null);
  const [archivedCandidates, setArchivedCandidates] = useState<any[]>([]);

  const [showAddStageForm, setShowAddStageForm] = useState(false);

  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0);

  const [stagesRefreshKey, setStagesRefreshKey] = useState(0);

  const [showMoreSummary, setShowMoreSummary] = useState(false);
  const [expandedExperiences, setExpandedExperiences] = useState<Set<number>>(
    new Set(),
  );
  const maxCharLength = 320;

  const toggleCandidateSelection = (candidateId: string, stageName: string) => {
    if (selectionStage && selectionStage !== stageName) {
      setSelectedCandidates(new Set([candidateId]));
      setSelectionStage(stageName);
    } else {
      const newSelection = new Set(selectedCandidates);
      if (newSelection.has(candidateId)) {
        newSelection.delete(candidateId);
      } else {
        newSelection.add(candidateId);
      }
      setSelectedCandidates(newSelection);
      if (newSelection.size === 0) {
        setSelectionStage(null);
      } else {
        setSelectionStage(stageName);
      }
    }
  };

  const goToHomepage = () => {
    onHomepage?.();
    window.location.href = "/";
  };

  // UPDATED: Add archive handler
  const handleArchiveSelected = async () => {
    if (selectedCandidates.size === 0) return;

    // Show confirmation or directly archive
    const candidateIds = Array.from(selectedCandidates);
    const archiveStageId = 5136;

    try {
      await Promise.all(
        candidateIds.map((id) =>
          apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
            current_stage: archiveStageId,
            feedback: {
              subject: "Moved to Archive",
              comment: "Bulk archived",
            },
          }),
        ),
      );

      showToast.success(`${candidateIds.length} candidates moved to archive`);
      setSelectedCandidates(new Set());
      setSelectionStage(null);
      // Trigger refresh
      setStagesRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Archive error:", error);
      showToast.error("Failed to archive candidates");
    }
  };

  const handleUnarchiveSelected = async () => {
    if (selectedCandidates.size === 0) return;

    const candidateIds = Array.from(selectedCandidates);
    const candidatesToUnarchive = archivedCandidates.filter((c) =>
      selectedCandidates.has(c.id),
    );

    if (candidatesToUnarchive.length === 0) return;

    try {
      await Promise.all(
        candidatesToUnarchive.map((candidate) => {
          const targetStage = pipelineStages.find(
            (s) => s.slug === candidate.stage_slug,
          );
          const targetStageId = targetStage
            ? targetStage.id
            : pipelineStages.find((s) => s.slug === "shortlisted")?.id;

          if (!targetStageId) return Promise.resolve();

          return apiClient.patch(
            `/jobs/applications/${candidate.id}/?view=kanban`,
            {
              current_stage: targetStageId,
              feedback: {
                subject: "Unarchived",
                comment: "Moved from Archive",
              },
            },
          );
        }),
      );

      showToast.success(
        `${candidatesToUnarchive.length} candidates unarchived`,
      );
      setSelectedCandidates(new Set());
      setSelectionStage(null);
      setStagesRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Unarchive error:", error);
      showToast.error("Failed to unarchive candidates");
    }
  };
  // UPDATED: Fully type-safe handleSearch - resolves 'id' does not exist on type 'never'
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    let found: Candidate | null = null;

    // Use Object.values to get all candidates across stages
    const allCandidates = Object.values(stageCandidates).flat() as Candidate[];

    found =
      allCandidates.find((candidate) =>
        candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || null;

    if (found) {
      // Now TypeScript knows found is Candidate (not null), so .id is safe
      setHighlightedCandidateId(found.id);

      setTimeout(() => {
        const el = document.getElementById(`candidate-${found.id}`);
        if (el) {
          el.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
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

      const eventRes = await apiClient.get(
        `/jobs/interview-events/${eventId}/`,
      );
      const eventData = eventRes.data;
      console.log("Fetched event data:", eventData);

      const candidateRes = await apiClient.get(
        `/jobs/applications/${eventData.application}/kanban-detail/`,
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
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
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
    const cleaned = phone.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0 && selectedSuggestionIndex >= 0) {
        handleSelectSuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
      setSearchQuery("");
    } else if (e.key === "Tab") {
      if (suggestions.length > 0 && selectedSuggestionIndex === -1) {
        setSelectedSuggestionIndex(0);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://app.nxthyre.com/pipelines/${pipelineId}`,
    );
    showToast.success("Pipeline link copied to clipboard");
  };

  const handleSharePipelineCandidates = () => {
    console.log("Sharing pipeline candidates for workspace ID:", workspaceId);

    if (!workspaceId) {
      console.error("Workspace ID not found");
      // optional: show toast "Something went wrong"
      return;
    }

    // This is the public page URL (adjust the path if your route is different)
    const publicPageUrl = `${window.location.origin}/public/workspaces/${workspaceId}/applications`;

    // Open in new tab → this page will call the API and render the data
    window.open(publicPageUrl, "_blank");
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
        is_team_note: notesView === "my",
        is_community_note: notesView === "community",
        postedBy: { userName: "You", email: "you@example.com" },
        posted_at: new Date().toISOString(),
        organisation: { orgName: "Your Org" },
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
            jobScoreObj =
              candidateDetails.candidate.stageData[slug]?.job_score_obj;
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
        const certifications =
          candidateDetails?.candidate?.certifications || [];
        const skills = candidateDetails?.candidate?.skills || [];
        const endorsements = candidateDetails?.candidate?.endorsements || [];
        return (
          <div className="bg-[#F5F9FB] py-4 px-2 rounded-xl space-y-6">
            {/* UPDATED: Profile Summary with View More/Less for long text */}
            {(candidateDetails?.candidate?.profile_summary ||
              candidateDetails?.candidate?.headline) && (
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
                        candidateDetails?.candidate?.profile_summary.length >
                        maxCharLength;

                      const displaySummary =
                        showMoreSummary || !isLongSummary
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

                            const displayDesc =
                              isExpanded || !isLong
                                ? desc
                                : desc.slice(0, maxCharLength) + "...";

                            return (
                              <>
                                {displayDesc}
                                {isLong && (
                                  <button
                                    onClick={() => {
                                      const newSet = new Set(
                                        expandedExperiences,
                                      );
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
            ? notes.filter(
              (note: any) => note.is_team_note && !note.is_community_note,
            )
            : notes.filter(
              (note: any) => note.is_team_note && note.is_community_note,
            );
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
      (stage: any) => stage.slug === "shortlisted",
    );

    if (shortlistedIndex === -1) return [];

    // Take all stages from Shortlisted onwards, excluding Archives
    const relevantStages = pipelineStages
      .slice(shortlistedIndex)
      .filter((stage: any) => stage.slug !== "archives");

    // Predefined colors for known stages, fallback cycle for custom ones
    const colorPalette = [
      { bgColor: "bg-[#34C759]", textColor: "text-blue-400" }, // Shortlisted
      { bgColor: "bg-[#FF8D28]", textColor: "text-yellow-400" }, // First Interview
      { bgColor: "bg-[#00C8B3]", textColor: "text-orange-400" }, // Other
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
        custom_stage_type: stage.custom_stage_type,
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
        stageIdMapTemp["Archives"] = 5136;
        setStageIdMap(stageIdMapTemp);

        // Fetch candidates for each shareable stage in parallel
        const fetchPromises = dynamicShareableStages.map(async (stage) => {
          const slug = stage.slug;
          if (!slug) return { stageName: stage.name, candidates: [] };

          const res = await apiClient.get(
            `/jobs/applications/?job_id=${jobId}&stage_slug=${slug}&sort_by=relevance_desc`,
          );

          const rawCandidates = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];

          return {
            stageName: stage.name,
            candidates: rawCandidates.map((app: any) => {
              const headline = app.candidate.headline || "";
              const [role = "", company = ""] = headline.split(" at ");
              const city = app.candidate.location || "";

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
                avatar:
                  app.candidate.avatar ||
                  (app.candidate.full_name || "")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                profile_picture_url: app.candidate.profile_picture_url || null,
                notes: "",
                job_score: app.job_score,
                expected_salary:
                  app.candidate.expected_ctc ||
                  "--",
                time_added: app.time_added || "-- days ago",
                source: app.source,
                candidate_source: app.candidate.source,
                lastUpdated: new Date(app.last_active_at || Date.now()),
                socials: {
                  github_url: app.candidate.premium_data_availability
                    ?.github_username
                    ? ""
                    : null,
                  linkedin_url: app.candidate.premium_data_availability
                    ?.linkedin_url
                    ? ""
                    : null,
                  resume_url: app.candidate.premium_data_availability
                    ?.resume_url
                    ? ""
                    : null,
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


    const fetchArchivedCandidates = async () => {
      try {
        const res = await apiClient.get(
          `/jobs/roles/${jobId}/archived-applications/`,
        );
        const results = res.data.results || [];
        const mappedArchived = results.map((app: any) => {
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
            avatar:
              app.candidate.avatar ||
              (app.candidate.full_name || "")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            profile_picture_url: app.candidate.profile_picture_url || null,
            notes: "",
            job_score: app.job_score_obj || app.job_score, // Use job_score_obj if available
            expected_salary:
              app.candidate.expected_ctc_lpa ||
              app.candidate.expected_ctc ||
              "--",
            time_added: app.time_added || "-- days ago",
            lastUpdated: new Date(app.last_active_at || Date.now()),
            stage_slug: app.stage_slug,
            socials: {
              github_url: app.candidate.premium_data_availability
                ?.github_username
                ? ""
                : null,
              linkedin_url: app.candidate.premium_data_availability
                ?.linkedin_url
                ? ""
                : null,
              resume_url: app.candidate.premium_data_availability?.resume_url
                ? ""
                : null,
            },
          };
        });
        setArchivedCandidates(mappedArchived);
      } catch (err) {
        console.error("Error fetching archived candidates:", err);
      }
    };

    // Only run if pipelineStages are already loaded
    if (pipelineStages.length > 0) {
      fetchCandidates();
      fetchArchivedCandidates();
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
          candidateDetails.candidate.id,
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
          Number(assessmentAppId),
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
          candidateDetails.candidate.id,
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

    const stageNames = dynamicShareableStages.map((s) => s.name);
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
        },
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
        `${feedbackData.candidate.name} moved to ${feedbackData.toStage}`,
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
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2438_2128)">
        <path
          d="M11.06 4.6673C11.0595 4.75504 11.0763 4.84201 11.1095 4.92324C11.1427 5.00446 11.1915 5.07834 11.2533 5.14063L18.1133 12.0006L11.2533 18.8606C11.1441 18.9882 11.087 19.1522 11.0935 19.32C11.1 19.4878 11.1696 19.6469 11.2883 19.7657C11.407 19.8844 11.5662 19.954 11.734 19.9604C11.9017 19.9669 12.0658 19.9099 12.1933 19.8006L20 12.0006L12.1933 4.19397C12.0997 4.10223 11.9812 4.04011 11.8525 4.01537C11.7238 3.99064 11.5907 4.00438 11.4697 4.05489C11.3488 4.10539 11.2454 4.19042 11.1726 4.29934C11.0997 4.40827 11.0605 4.53625 11.06 4.6673Z"
          fill="#4B5563"
        />
        <path
          d="M3.72699 4.6673C3.72649 4.75504 3.7433 4.84201 3.77648 4.92324C3.80966 5.00446 3.85854 5.07834 3.92033 5.14063L10.7803 12.0006L3.92033 18.8606C3.81111 18.9882 3.75404 19.1522 3.76052 19.32C3.767 19.4878 3.83655 19.6469 3.95528 19.7657C4.07401 19.8844 4.23317 19.954 4.40096 19.9604C4.56874 19.9669 4.73279 19.9099 4.86033 19.8006L12.667 12.0006L4.86033 4.19397C4.76674 4.10223 4.64818 4.04011 4.51949 4.01537C4.39079 3.99064 4.25766 4.00438 4.13673 4.05489C4.0158 4.10539 3.91244 4.19042 3.83956 4.29934C3.76669 4.40827 3.72753 4.53625 3.72699 4.6673Z"
          fill="#4B5563"
        />
      </g>
      <defs>
        <clipPath id="clip0_2438_2128">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="matrix(0 -1 -1 0 24 24)"
          />
        </clipPath>
      </defs>
    </svg>
  );

  const MoveCandidateIcon = () => (
    <svg
      width="17"
      height="18"
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.66536 7.33073C9.50631 7.33073 10.9987 5.83835 10.9987 3.9974C10.9987 2.15645 9.50631 0.664062 7.66536 0.664062C5.82442 0.664062 4.33203 2.15645 4.33203 3.9974C4.33203 5.83835 5.82442 7.33073 7.66536 7.33073Z"
        stroke="currentColor"
      />
      <path
        d="M12.6654 15.6667C14.5063 15.6667 15.9987 14.1743 15.9987 12.3333C15.9987 10.4924 14.5063 9 12.6654 9C10.8244 9 9.33203 10.4924 9.33203 12.3333C9.33203 14.1743 10.8244 15.6667 12.6654 15.6667Z"
        stroke="currentColor"
      />
      <path
        d="M11.5547 12.3345L12.2493 13.1678L13.7769 11.5938"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1667 10.1085C9.39467 9.93277 8.55075 9.83594 7.66667 9.83594C3.98477 9.83594 1 11.5149 1 13.5859C1 15.657 1 17.3359 7.66667 17.3359C12.4062 17.3359 13.7763 16.4874 14.1723 15.2526"
        stroke="currentColor"
      />
    </svg>
  );

  const ArchiveIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.83789 11.9968C8.83789 11.4276 8.83789 11.1429 8.92312 10.9183C9.03676 10.619 9.25473 10.3811 9.52908 10.257C9.73484 10.1641 9.99574 10.1641 10.5174 10.1641H13.8764C14.398 10.1641 14.6589 10.1641 14.8647 10.257C15.139 10.3811 15.357 10.619 15.4707 10.9183C15.5559 11.1429 15.5559 11.4276 15.5559 11.9968C15.5559 12.5661 15.5559 12.8508 15.4707 13.0753C15.357 13.3747 15.139 13.6126 14.8647 13.7366C14.6589 13.8296 14.398 13.8296 13.8764 13.8296H10.5174C9.99574 13.8296 9.73484 13.8296 9.52908 13.7366C9.25473 13.6126 9.03676 13.3747 8.92312 13.0753C8.83789 12.8508 8.83789 12.5661 8.83789 11.9968Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M21.714 5.89062V13.2217C21.714 17.8295 21.714 20.1335 20.4022 21.5649C19.0905 22.9964 16.9792 22.9964 12.7567 22.9964H11.637C7.41449 22.9964 5.30323 22.9964 3.99146 21.5649C2.67969 20.1335 2.67969 17.8295 2.67969 13.2217V5.89062"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M1 3.44368C1 2.29172 1 1.71574 1.32794 1.35786C1.65589 1 2.1837 1 3.23933 1H21.154C22.2096 1 22.7374 1 23.0654 1.35786C23.3933 1.71574 23.3933 2.29172 23.3933 3.44368C23.3933 4.59564 23.3933 5.17161 23.0654 5.52949C22.7374 5.88735 22.2096 5.88735 21.154 5.88735H3.23933C2.1837 5.88735 1.65589 5.88735 1.32794 5.52949C1 5.17161 1 4.59564 1 3.44368Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
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
        `Access granted to ${accessEmail} with ${displayAccessLevel} permissions`,
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
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.89941 7.3C5.89941 6.97387 5.89941 6.81077 5.9527 6.68211C6.02374 6.51061 6.16002 6.37432 6.33154 6.30327C6.46018 6.25 6.62328 6.25 6.94941 6.25H9.04941C9.37554 6.25 9.53864 6.25 9.6673 6.30327C9.8388 6.37432 9.97509 6.51061 10.0461 6.68211C10.0994 6.81077 10.0994 6.97387 10.0994 7.3C10.0994 7.62613 10.0994 7.78923 10.0461 7.91789C9.97509 8.08939 9.8388 8.22568 9.6673 8.29673C9.53864 8.35 9.37554 8.35 9.04941 8.35H6.94941C6.62328 8.35 6.46018 8.35 6.33154 8.29673C6.16002 8.22568 6.02374 8.08939 5.9527 7.91789C5.89941 7.78923 5.89941 7.62613 5.89941 7.3Z"
        stroke="#818283"
        strokeWidth="1.25"
      />
      <path
        d="M13.9498 3.80469V8.00469C13.9498 10.6445 13.9498 11.9645 13.1297 12.7846C12.3096 13.6047 10.9896 13.6047 8.3498 13.6047H7.6498C5.00994 13.6047 3.69001 13.6047 2.8699 12.7846C2.0498 11.9645 2.0498 10.6445 2.0498 8.00469V3.80469"
        stroke="#818283"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M1 2.4C1 1.74003 1 1.41005 1.20502 1.20502C1.41005 1 1.74003 1 2.4 1H13.6C14.26 1 14.5899 1 14.795 1.20502C15 1.41005 15 1.74003 15 2.4C15 3.05997 15 3.38995 14.795 3.59498C14.5899 3.8 14.26 3.8 13.6 3.8H2.4C1.74003 3.8 1.41005 3.8 1.20502 3.59498C1 3.38995 1 3.05997 1 2.4Z"
        stroke="#818283"
        strokeWidth="1.25"
      />
    </svg>
  );

  // UPDATED: Add state to track which candidates are being copied (for per-button spinner)
  const [copyingCandidates, setCopyingCandidates] = useState<Set<string>>(
    new Set(),
  );

  const handleCloseProfile = () => {
    setShowCandidateProfile(false);
    setCandidateDetails(null);
    setAssessmentAppId(null); // ← prevents the effect from running again
    setCodingQuestions([]);
    setTotalQuestions(0);
    setDate("");
  };

  const handleCopyProfile = async (applicationId: string) => {
    // UPDATED: Set loading state for this candidate
    setCopyingCandidates((prev) => new Set([...prev, applicationId]));

    try {
      const details = await apiClient.get(
        `/jobs/applications/${applicationId}/kanban-detail/`,
      );
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
      setCopyingCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await apiClient.get(
          `/jobs/applications/stages/?job_id=${jobId}`,
        );
        // Sort by sort_order just in case
        const sorted = res.data.sort(
          (a: any, b: any) => a.sort_order - b.sort_order,
        );
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

  const renderCandidateCard = (
    candidate: any,
    stage: string,
    isArchived: boolean = false,
  ) => {
    const isSelected = selectedCandidates?.has(candidate.id) || false;

    return (
      <div
        id={`candidate-${candidate.id}`}
        key={candidate.id}
        draggable={!isArchived}
        onDragStart={() => handleDragStart(candidate, stage)}
        className={`relative bg-white rounded-xl p-4 mb-3 cursor-move hover:shadow-lg transition-all duration-200 ${isSelected ? "border-2 border-blue-500" : "border border-gray-200"
          } ${highlightedCandidateId === candidate.id ? "ring-2 ring-blue-400" : ""} ${isArchived ? "opacity-60 grayscale" : ""}`}
      >
        <div className="absolute top-4 left-4">
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleCandidateSelection(candidate.id, stage);
            }}
            className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${isSelected
              ? "bg-blue-600 border-blue-600"
              : "border-gray-300 bg-white"
              }`}
          >
            {isSelected && (
              // SVG: White checkmark
              <span className="text-white text-xs font-bold">✓</span>
            )}
          </div>
        </div>
        {/* Main Grid Container - 12 columns */}
        <div className="pl-8">
          {/* Profile Initials */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCandidateClick(candidate, stage)}
                className="text-base font-semibold text-gray-900 hover:text-blue-600"
              >
                {candidate.name}
              </button>

              {(() => {
                const appSource = candidate.source;
                const candSource =
                  candidate.candidate?.source;
                let src =
                  candSource?.source ||
                  appSource?.source ||
                  null;

                if (src === "NAUKRI_NVITE") {
                  return (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z"
                        fill="#0F47F2"
                      />
                      <path
                        d="M12.3542 13.0156L12.3347 13.9803L12.2714 16.762V16.8692C7.57498 12.8013 6.77113 11.8123 6.63472 11.5103V11.5005C6.61523 11.442 6.61036 11.3836 6.62011 11.3251C6.62011 11.3056 6.62985 11.2813 6.63472 11.2618C6.63472 11.2423 6.64446 11.2277 6.64934 11.2082C6.69805 11.0767 6.77113 10.95 6.8637 10.8428C6.92703 10.76 7.00011 10.682 7.07318 10.609C7.23395 10.4482 7.40934 10.302 7.58959 10.1656C7.68216 10.0974 7.77472 10.0292 7.87703 9.96102C8.0719 9.82948 8.28139 9.69794 8.50062 9.56641C10.1911 11.14 12.3298 12.9962 12.3591 13.0205L12.3542 13.0156Z"
                        fill="url(#paint0_linear_4468_2998)"
                      />
                      <path
                        d="M12.4185 3.88768L12.399 4.8523L12.3893 5.32974L12.3698 6.28948L12.3601 6.77179L12.3406 7.7364C12.3065 7.75102 10.1629 8.57922 8.51135 9.56332C8.29212 9.69486 8.08263 9.8264 7.88776 9.95794C7.79032 10.0261 7.69289 10.0944 7.60032 10.1626C7.4152 10.299 7.24468 10.4451 7.08391 10.6059C7.01084 10.679 6.93776 10.7569 6.87443 10.8397C6.7234 11.0297 6.63571 11.2149 6.62109 11.3902L6.64058 10.5864V10.4549V10.411L6.6552 9.90435L6.68443 8.90076L6.69904 8.40871L6.72827 7.41486C7.0693 6.02153 11.8631 4.10204 12.4283 3.88281L12.4185 3.88768Z"
                        fill="white"
                      />
                      <path
                        d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z"
                        fill="white"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_4468_2998"
                          x1="11.3847"
                          y1="14.4772"
                          x2="5.81139"
                          y2="8.05128"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="white" />
                          <stop
                            offset="1"
                            stop-color="#B1B1B1"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  );
                } else if (src === "PUBLIC_JOB_PAGE") {
                  return (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <rect
                        width="19"
                        height="19"
                        rx="9.5"
                        fill="url(#pattern0_4500_4137)"
                      />
                      <defs>
                        <pattern
                          id="pattern0_4500_4137"
                          patternContentUnits="objectBoundingBox"
                          width="1"
                          height="1"
                        >
                          <use
                            xlinkHref="#image0_4500_4137"
                            transform="translate(-0.0367109 -0.0213112) scale(0.00472938)"
                          />
                        </pattern>
                        <image
                          id="image0_4500_4137"
                          width="225"
                          height="225"
                          preserveAspectRatio="none"
                          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAIAAACx0UUtAAAQAElEQVR4AexdDYxcVRU+md3Ozv62W2hpSoVCFgkiQgk1oqCNTYg/CNKEQhNakSilxVh+XEot1HQtUqiIRbCiQglVQYxNQIyGpIpUQYFoBRpjXEMtBSmlu9v939nZ1e/1Lbvd2dmZ92bfvd99M2dz+joz775zzv3O9879nTeJ/+mfIuA2AgnRP0XAbQTycTQzKG2H5MA+FUXACAKd7YFujtwcbd0r21qkeancvlzuul5FETCCwPqrpPkK2bHVS4V52JqDoz/eLPfeLK2vSGVS6hqlpkFFETCFgIjs2S1fXybP7MTL3JLN0S03y96/eNSsnCaJ7JO5VeinikDRCIBjYNr0WfKrh2Tn9txqxtHw8W1y4F+STOUoqh8pAkYRQHO96+fy1z/lMDLG0YNvyu4nJVWbo5B+pAhYQKBmujx2n2CknmVrjKO/f0pSdVln9a0iYA8BtPvpPnl5d7bFMY7+7TlJVGSf1veKgE0EKpPy2ovZBkc42tMl6X4BkbPP63tFwCICyJJvvZ5tb4SjQxnJpLPP6XtFwD4CXR3ZNkc4mv1x0e/1QkUgagSUo1EjqvqiRkA5GjWiqi9qBJSjUSOq+qJGQDkaNaKqL2oElKNRI6r6okaAxdGo66H6ShcB5WjpxrZUaqYcLZVIlm49lKOlG9tSqZlytFQiWbr1UI6WbmxLpWauc7RUcNZ6FI+AcrR47PRKOwgoR+3grFaKR0A5Wjx2eqUdBJSjdnBWK8UjoBwtHju90g4CpcJRO2ipFQYCylEG6mozDALK0TBoaVkGAspRBupqMwwCytEwaGlZBgLKUQbqajMMAuXG0TDYaFk3EKBxdHhYMoNuCVyCEOMC6xAHYSFiAtMEjiIM/T0ye57Ma3JL5p4iM0+Q3k6Bh4DGsgCT6lqBD67BAq/S/ZbBGGeOwNF0nzTfJ833yI2bnZN198naB2R4yDZNQdDLV0vLw84BghjBq3MXeS3eOOJYfGObo0hR806TefMtVjGkKfgGuuBGCnld8cWByZz5csGnitdg+sol10h/t2kjk+q3zdFJHXHpxAcWeKnUmkeZtJx1vjVr8TNE4CjGBI7jVFMnqTp7zT26FvNPcxqSoQzTPQJHBweYFQ5iu3KaJKuCFIymDDg69+RoVBnS0tcrCd4zvgkcHegzhGSUaqst/jRAZVLq6sXlv8FBpncEjvb3Misc0PZxcyx1STFgAkeTbv/eEKYdAuJmophtjiYSgiGC+13Sxlkm0M6ts35G7s/d+XRouMzaenDUHfQn8wQT1+gmTnY2ws9hZdaJEeozooo7hLCdR30IERj/hbPH6TODuRZFKZs5uzh/ue0eh6PcPniQODU02uqPDkmd8219P3WYy+HoAHX9NwhHaxvscfT4E4J4xCzD7Z4ROIqZtkHnfwuqtt4eJ+oa7NkqztLAQJmNmQCT+1OkDdPt5dEG59t6zOEjaiwh5FFUNe38UlNNHdy0IRg+zjjOhqGp2Ci7vXmxaOu95dDqCJfs8zHE2v2Qz4m858BRRC1vEYMnOXnU/TETIG+cjYNZwSJTXaPgfjBrZsraueMHDkfdn3tCWOsbcTAuMywuaBVdmaGhoi+N4EIOR7l7vQLCVj/D+LAJndG66QHdYRbr421wRrUJHEXPJhbbSsAecAgYGZVZc42qj0Y5OIqoRaMrvBYCR+Fk2vn5UTg50/zUOu6BOucnngAFd/xA4ih1bQ2gBxFMW4JDQUoWXQb6sxaZilZl9ELkUaP68ysncTQOedTO8s90KyOz/CQoeJY7fiBwFD0bzLcVxIVewE4etTN7QAdzKg4QOAp33V9ngpMYM+FoWrDoatrE1PWX4968WOTRqpTxjRRoUhqcb+tBUKw1TJ3oRWvg5NG+nqIdtndhbb1UJg0uhyLw0G+vPsVawsAuk5YEhyme0wTLSB6xmB8FPKZXKecU/ZVlOGdLsCgImtqylsMOgaPwgjuXAQcCitGFSgTe/W8yASgM6uEqXrCEw1H394/68cAikLnwQLP7nVHgkMkYXxOGlTzC4WgsxvVAzfTQfmYcNpQMojPKe0gJosDhKAzHQrAcimxnyFVodn93M+qO/iiOROFwFOEh1jm46VNPF3MPecRgORZ5dJj6QDIEi8BRzGKAo5h1g3nHpelMmfd+wWwuvI1W+ns8zSc1mQYgAv09XYKpmAgUFauCwFHfVdDUf+H48fqNcvaFcsZ5Y3LWRyWnnH2BHCvnXChZsnCx+ILPP3u19yRrx+vuu8fd4AwfOBwFQbmPFUDNAwqG3lffJF+6dUzwNqesuEGOleVrJEuuXCW+4POLlsTgKyI+RNwvhcIHGkcxowHzKu4jgPlRrpMcjqLOmNHAUcV9BDC2K9P+KH1Gw31yOOLhAPthCLQ8Sp/RcIQBjriRx40y7Y8CkbgsNcHVMhdMvXER4ORR9G+0P8oNfHDr4CjiFbx85CU5HEU1uF81hAMqARGgzxLSOEqvecAIaTGM67kgcDiKtoNecy7uMbJO75VxOIoI0Wc04INKEATGfWkiyAVRl6FxlL4KHDWSJasvM1iue0rM7XkrWbKQKkb/Yg8tj3Z3kiBXsyERoH+xh8NRjJnoPfGQkSrf4r1d5LpzOIpK0+9O+KASBAH0yhI0mngO0oxrHvXgL9l/UVaMxlGMFqOsh+oyg4ALYeJw1OuPsnd8mYlpqWkdpj4J30eTw1HY1vV6gOC+uLBkTePooOZR9xkqksmQJ/ABEo2jOq4H+u5LrwNPOKRxlD7r5j4/XPDQ9NclgtSRw1HMt2HWLYh/WoaLgAtfl+Bw1MfdhXkN3xM9TobA0HAZ90cBysR5DbC2da88+7Ts3C47tsoj31GJHoHHt3nwPv2Yh/NLz8lrL8v+VulsR0ByiAtDW1oexRTp2wfGQDmwT4Bd81LZeos8+ZDsfkr27JZXn1eJHoGXdnnw7nrCw/kn35YftciWNbL+Klm/Qrbc7NF3zwtjlH1rfxnn0VSdPHC7PLPTo2bLSrnzOgF2lUmpaZBkypPKad7TZvRoAgEfYRxTtQIB5hB0Pd854NF3+52ybpmsXSabVstvdnixGMsljFe8PJrwfg4BEICaXR3i/0Q2xlIMENSmhwDAh/jERTiGh+XIYT5B4ZnHUfxHER8R5Am8oDigRvMggKBA8hSwdorJUWuVVEOxRoDMUTQo6X7vIbR6dBABRMcFcjM5ipmm6lpZdJksXqriHAKIS7JKECM6TWkcxT3aOFtaHpZLV8jFy1ScQwBx2fiQ1DZ4Q1suTWkczaRl0SXcuqv1AghgOHvBxYJIFShn+HQYjkbqChaZqmoi1ajKDCCQTBpQGlIljaPwk/4Qa/ig4j4CTI66j4566AICylEXoqA+5EOAydGKynye6TlFwEeAxtFEhRx80/dBj+4i0HaoNPc9BUK8Mim7nvB2LgYqrYUYCLTu9bZBYQaKYXzMJi+PJgQ0vecmaVnp7QHbtFqPbiGw4Rr53jpJpoT+R+Moap5IeJsXuzq8PWBHDuvRLQT6erzoIEx0YXLUrzyYquImAn6A6Ec+R+kQqAOOI8DkaGZQejulv0fwwnGYyso9hANBQWggw8P8qtM4mhmUpg/JxkfkC2sFL7rbvV2kLiDCjwnJA4APdiIQJ57qBQWhue2HUl1bxvue0n1yxSqZOUvO/Zis2iB3/0I+vVzqZ3hpFbfvqOCGVjGEwCjI4CVMJKtk4WJZ9wO56W4vKAjNCSfKRUulvPc9HTOvUVsvFy2RDQ/Kt34quH3XPiDNW2XN3XLdRvnyBvniOu/OvuprsuyG4mX0crzIL0jtEwU+BBf4bFQmejLq8LFVy4ILp1AM18I3AAt4gTPQ/uYOD/Y7HpUrV8m8+ePS+IzjZXho3Cf239DaelR12jQcsgVkxe0LpE5qkqYz5YwF8sHz5JzzvTt74cflI58sXkYvx4v8gtQ+UeBDcIHPRmWiJ6MOH1u1LLhwCsVwLXwDsIB33nwB2kiZgD07EkffT6s6+h/1wOSoC/PDVPBjYLwiUd55NAYhKnsX0UmlY8DJoxhCJqsD110L8hCociBMHI4C85p6HFRcR2Basozb+grdPOo6Pz3/qo6Ze/HeM/7R8mh1HaO6ajMkAjnnXkLqmGpxGkfpuxKnilx5XO/C3AuHo5gWVo6WB8kjqCWHo3DcAEehVaUEEaBxtLq2BNEsySql6sjbSmgcdaGjU5KUirxStQ2RqwynkMdRBxaCw0FVrqXp2YTDUYyZtK2PC+fpS00cjiI8Fbk2PeFzFdcQSNWQl5poHK3mPTTPNRI47g99BobG0YoKx0Oj7o0ggCX7kVek/zgcRX8ULQipymo2HAJl3B/VPSXhqEIrjTyKnEIzL8LJo6iw9kcBQiykrmznR134okwsKEJ3kr4bnZNH0XZUO7DBu0D49fRRBOiPxOdwFHVPaH8UKMRBKivLdX7Uhc2zcWAI30f6z7/Q8ihGi3z41YMACNCzCYejiQpBCxIAH36R/a2y5hJpviKErF0m61eMyIZrxJeWld7TgHEcfRrwthZ+7YJ4QP9KE4ejgCYu37n7w69DPxB+eFjSAyPS1yO+dHWIL6NPA/77c9J2CEi4LmjxMMYlesnhKPIo/e4MCPorz0tlUvI+w7bIs5h9a3snoBfMYvTHQBA4ijQDjtJ3KgQJOxr6/m6PgkEKhy0DENoPh72IUL5M10IRHgLY4U0efEvMuQrN7e+G98n6FWjrrdscZ5CQR8fZd/vNG/82y9G2g27X/6h3GN2WY3+U3sU5Cn7hAziEbFe4XLEl2uMwZkLl0CPHkSWcPBqXh5QcMtzW/3cfK+4h7KaqDTYmQfzgcLQmJg/SQR4NAmLAMlnFMFdwJA79UbQkEIx0s/y39pbAUXRu4pJH4arpSKT7TVuYqn7MwECmqmUK1xM4Cm/pQ0X4UFB6uryfK0C2K1iy6AK4B2Ix/VR0BSO5kMNR+pRbEOy6O23s98HiUxBnuGU0j3Lxn9T6QN+kp6I6gX5eLPJoBXUjJSGPooGLxQMgsJgODkVFx5x6oD8W0/jcR5UQOIpoxWLM1HHYxpxL9xHgMV7ce8ftm3E4Sv/6QRAaWGAP8ujBN4L4Qi6Toj6qhMBRtPWoMxn1AObRCoNDAQoWXwT6LdwJxfv33pXcvhmBo6h4LNZCO96Fp8alq924iakbKMu2vmrquBnXgAyHPGfUDCZfY8FR7nw2J4/G4mFPHVY2fKT7xP2lJozr0UMzervmUU7gKGo72S+o5nHU/qnudkGeM20XqbrYKVLTro3p545xCRxF1RPUOWE4UFCwEFqwTFQF3F9q4j6qhMPRGud/sAELochwUbEwjx5Yga08BVw4VXZ5FG19pfN5tKPNEjc8jjo/jY+5QkTNEiITzHDyaMr5hz31dQvYMwEuIx8cdv7body5Qg5HrYW/aE7ZWQiFe4Ci0/kp0rLjKPfLMaBFEDliq62HM6YXC2BiisKdK7SdR4eHBYNEakK/gAAAA55JREFU7n7EIAFDbkOGC1JyimVg5e3/TFGH8csxh19e/VFuwxEwnjZzW39vQKdoxbghs51HaTCHNNz+jqUxE5YJMmmxOR0bEgmveNmt12cGvWo7/s/CJvxRBNCMOj5FirZ+1Fv7Lwh5FF1S+/UMZRF3kc32F11Sxx9Ohvls3EihMIywsG2OomnrPSIgQYR1iFxVb7ek+wSuRq45p0Jw9OCbOc/Y/XBya9z5bNsc9XEg3pS+A/mP/3xVwJv8ZSI8C1tvu70bP5mKsLqhVRE4irmnF5/1Umm639uW5tQRU05//K387F5JWdxRAI6+/g+BaQgGT76Yg8XXD1u+tB3yHtWLI3K5Lwf2yf5Wad0ruFf3vCB//p3s2Cop3qNlGBxNyS8flDWfkxs/75ysW+b5lrSbNtCpaDsoMA255XLxxRw4vn7Y8uX25QL5xtWy6doRuet62bJGtt4i998q2++Ux74re3YLcUqbwFHkepCgrlHcFPgGDy0LaMpFo6ZBcgraEwiRoAgEh6MwrKIIBERAORoQKC02ioDtF8pR24irvbAIKEfDIqblbSOgHLWNuNoLi4ByNCxiWt42AspR24irvbAIKEfDIqblgyIQVTnlaFRIqh5TCChHTSGreqNCQDkaFZKqxxQCylFTyKreqBBQjkaFpOoxhYBy1BSyqjcoAoXKKUcLIaTn2QgoR9kRUPuFEFCOFkJIz7MRUI6yI6D2CyGgHC2EkJ5nI6AcZUdA7RdC4D2OFiqn5xUBFgLKURbyajcoAsrRoEhpORYCylEW8mo3KALK0aBIaTkWAspRFvJqNzcCiQmUHPkgVS2VSQnwZNDcevVTRSAqBGbMytY0wtFkSma/L/ucvlcELCOQScvpC7JtjnAUH394sfdgWLxQUQRYCKT75LwLs42PcfQTn/EeDKvNfTZC+t4WAplBmX+mnNSUbW+Mo5XT5NoN0uv8b1dm10DflwQCSI5Ioitvy1GZMY7i5BkLZMkq6W7XwRPAULGHADJof7d8ZbM0NOYwOo6jOL/4UvnqFklWSW+n9zhwsLs40asUgYIIgJrpfi8nzjlZNj4ip58FAuaQbI6iCIre8ais3iQLF8vcU6R+hooiED0C04+TeU2y6DJZe7803yMzZ4F6uSUHR/2CaPevXCU3bpYND6ooAtEjcNv3PXZduiLHIMln4OhxUo6OltAXigAXAeUoF3+1XhgB5WhhjLQEFwE2R7m1V+txQOD/AAAA//9oDg7QAAAABklEQVQDALFnvz1lAWFSAAAAAElFTkSuQmCC"
                        />
                      </defs>
                    </svg>
                  );
                } else if (src === "External") {
                  return (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_4527_6787)">
                        <path
                          d="M1.44575 12.473C0.994198 8.48683 0.971838 5.61909 1.36811 1.70893L1.54946 1.67165L1.42577 1.19807C1.42208 1.18395 1.4224 1.17706 1.42299 1.17171C1.43772 1.04016 1.58607 0.882274 1.71679 0.860099C1.71829 0.859848 1.72084 0.859631 1.7235 0.859631C1.72819 0.859631 1.73376 0.860311 1.74056 0.861704L2.22573 0.961614L2.2512 0.778803C3.66308 0.570388 5.09042 0.464844 6.49934 0.464844C7.90846 0.464844 9.33617 0.570445 10.7483 0.778912L10.7741 0.961425L11.2582 0.8617C11.2649 0.860325 11.2706 0.859631 11.2752 0.859631C11.2779 0.859631 11.2804 0.859848 11.2833 0.860321C11.4126 0.882274 11.561 1.04014 11.5758 1.1729C11.5763 1.17715 11.5766 1.18394 11.5729 1.19807L11.4492 1.67165L11.6306 1.70893C12.0269 5.61908 12.0045 8.48676 11.5529 12.4729L11.4489 12.42L11.415 12.448C9.50322 11.4928 8.48066 10.7122 6.86783 8.60855L6.49935 8.12793L6.13088 8.60855C4.4547 10.7948 3.48076 11.5393 1.58776 12.4509L1.55029 12.4198L1.44575 12.473Z"
                          fill="#818283"
                        />
                        <path
                          d="M6.49933 0.928602C5.22749 0.928602 3.94023 1.01604 2.66333 1.18887L2.618 1.51626L1.95317 1.37912L2.12264 2.02723L1.79648 2.09429C1.45853 5.59651 1.47039 8.28218 1.8401 11.8066C2.56679 11.4339 3.08292 11.1045 3.56496 10.7142C4.24151 10.1664 4.89868 9.45203 5.76237 8.32549L6.49933 7.36427L7.23629 8.32549C8.06939 9.41212 8.75502 10.1477 9.4594 10.7104C9.9808 11.1269 10.5333 11.4646 11.1597 11.7952C11.5283 8.2763 11.5398 5.59301 11.2022 2.09429L10.876 2.02723L11.0455 1.37917L10.3828 1.51595L10.3368 1.18908C9.05945 1.01612 7.77161 0.928602 6.49933 0.928602ZM6.49932 0C8.05208 0 9.60483 0.123823 11.1576 0.371478C11.1588 0.383249 11.1628 0.394669 11.1645 0.406411C11.2249 0.393951 11.2895 0.390126 11.3596 0.401792C11.6942 0.458564 11.9995 0.7842 12.0372 1.12069C12.045 1.19117 12.0377 1.25537 12.0221 1.31485C12.034 1.31731 12.0455 1.3221 12.0575 1.32409C12.4993 5.50023 12.4809 8.45271 12.0024 12.6288C12.0022 12.6311 12.0032 12.6328 12.003 12.6351C12.0027 12.6374 12.0012 12.6396 12.0009 12.6419C11.9973 12.6737 11.9935 12.7056 11.9899 12.7374C11.9832 12.7386 11.9767 12.7413 11.9701 12.7426C11.9137 12.8675 11.7944 12.9728 11.6633 12.9961C11.6038 13.0067 11.5538 12.9938 11.5102 12.9716C11.4997 12.9803 11.4885 12.9876 11.4783 12.9965C9.40492 11.9844 8.28197 11.2156 6.49933 8.8905C4.7167 11.2156 3.6749 11.9844 1.52035 12.9965C1.51017 12.9876 1.49889 12.9803 1.4885 12.9716C1.4448 12.9938 1.39492 13.0067 1.33533 12.9961C1.20424 12.9728 1.08496 12.8675 1.02857 12.7426C1.02192 12.7413 1.0155 12.7386 1.00879 12.7374C1.0051 12.7056 1.00142 12.6737 0.99775 12.6419C0.997438 12.6396 0.995946 12.6374 0.995681 12.6351C0.995398 12.6328 0.996437 12.6311 0.996229 12.6288C0.517761 8.45271 0.499388 5.50023 0.9411 1.32409C0.953126 1.3221 0.964603 1.31731 0.976524 1.31485C0.960966 1.25537 0.953692 1.19117 0.961401 1.12069C0.99912 0.7842 1.30447 0.458564 1.63911 0.401792C1.70912 0.390126 1.77377 0.393951 1.8342 0.406411C1.83582 0.394669 1.83987 0.383249 1.84108 0.371478C3.39382 0.123823 4.94657 0 6.49932 0Z"
                          fill="#818283"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_4527_6787">
                          <rect
                            width="13"
                            height="13"
                            fill="white"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  );
                } else {
                  return (
                    <svg
                      width="20"
                      height="16"
                      viewBox="0 0 20 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 8.87714C0 3.97443 4.10406 0 9.16667 0H20V5.64909C20 10.9975 15.5228 15.3332 10 15.3332H0V8.87714Z"
                        fill="#0F47F2"
                      />
                      <path
                        d="M5.67872 5.68569C6.30372 5.68569 6.7985 5.84926 7.16309 6.2307C7.52767 6.61214 7.70996 7.13229 7.70996 7.79114V10.4912H6.5918V7.92354C6.5918 7.55156 6.48275 7.25365 6.26465 7.02983C6.04981 6.80601 5.76497 6.6941 5.41016 6.6941C5.04232 6.6941 4.74772 6.80601 4.52637 7.02983C4.30827 7.25365 4.19922 7.55156 4.19922 7.92354V10.4912H3.09082L3.09082 5.68569H4.19922L4.19922 6.50023C4.35547 6.23228 4.56055 6.0258 4.81445 5.88079C5.06836 5.73263 5.35645 5.68569 5.67872 5.68569Z"
                        fill="white"
                      />
                      <path
                        d="M13.2129 10.4912H11.875L10.7471 8.9591L9.62402 10.4912H8.2959L10.083 8.05121L8.38476 5.68239H9.74772L10.7568 7.13859L11.7648 5.68404H13.093L11.4258 8.04175L13.2129 10.4912Z"
                        fill="white"
                      />
                      <path
                        d="M16.8311 6.78395H15.5469V8.68957C15.5469 8.97644 15.6283 9.18922 15.791 9.32793C15.957 9.46348 16.1833 9.53126 16.4697 9.53126C16.6097 9.53126 16.7301 9.51865 16.8311 9.49343V10.4912C16.6585 10.529 16.4583 10.5479 16.2305 10.5479C15.6803 10.5479 15.2425 10.3887 14.917 10.0703C14.5915 9.75192 14.4287 9.29798 14.4287 8.70848V6.78395H13.501L13.5186 5.68404H14.4287L14.4287 4.48585H15.5469L15.5469 5.68404H16.8311V6.78395Z"
                        fill="white"
                      />
                      <path
                        d="M9.16699 0.0498047H19.9502V5.64941C19.95 10.9686 15.4966 15.2832 10 15.2832H0.0498047V8.87695C0.0499069 4.00345 4.13053 0.0498047 9.16699 0.0498047ZM8.34375 5.71191L10.0205 8.05078L8.25586 10.4619L8.19727 10.541H9.64941L9.66406 10.5205L10.7471 9.04199L11.835 10.5205L11.8496 10.541H13.3115L13.2529 10.4619L11.4863 8.04102L13.1338 5.71289L13.1895 5.63379H11.7383L11.7236 5.65527L10.7559 7.05078L9.78906 5.6543L9.77344 5.63281H8.28711L8.34375 5.71191ZM9.72168 5.73242L10.7158 7.16699L10.7568 7.22656L10.7979 7.16699L11.791 5.73438H12.9961L11.3848 8.0127L11.3643 8.04199L11.3857 8.07129L13.1152 10.4414H11.9004L10.7871 8.92969L10.7471 8.875L10.707 8.92969L9.59863 10.4414H8.39355L10.123 8.08105L10.1445 8.05176L10.124 8.02246L8.48242 5.73242H9.72168ZM15.4971 8.68945C15.4971 8.98568 15.5814 9.21504 15.7588 9.36621H15.7598C15.9373 9.51118 16.1756 9.58105 16.4697 9.58105C16.5859 9.58105 16.6894 9.56918 16.7812 9.55176V10.4492C16.6219 10.4807 16.4386 10.498 16.2305 10.498C15.6905 10.498 15.2664 10.3416 14.9521 10.0342C14.6389 9.72775 14.4785 9.28814 14.4785 8.70801V6.73438H13.5518L13.5674 5.73438H14.4785V4.53613H15.4971V5.73438H16.7812V6.73438H15.4971V8.68945ZM5.41016 6.64453C5.03139 6.64453 4.72354 6.7602 4.49121 6.99512H4.49023C4.26151 7.22999 4.14941 7.5416 4.14941 7.92383V10.4414H3.14062V5.73535H4.14941V6.68555L4.24219 6.52539C4.39427 6.26459 4.59311 6.06421 4.83887 5.92383H4.83984C5.08301 5.782 5.36104 5.73535 5.67871 5.73535C6.29473 5.73535 6.7746 5.89699 7.12695 6.26562C7.48042 6.63555 7.66013 7.14185 7.66016 7.79102V10.4414H6.6416V7.92383C6.6416 7.58936 6.55562 7.30906 6.38086 7.08691L6.30078 6.99512C6.07513 6.76004 5.77644 6.64453 5.41016 6.64453ZM15.5967 6.83398H16.8809V5.63379H15.5967V4.43555H14.3789V5.63379H13.4697L13.4688 5.68359L13.4512 6.7832L13.4502 6.83398H14.3789V8.70801C14.3789 9.30681 14.5441 9.77609 14.8818 10.1064C15.2186 10.4358 15.6702 10.5977 16.2305 10.5977C16.461 10.5977 16.6649 10.5788 16.8418 10.54L16.8809 10.5312V9.42969L16.8193 9.44531C16.7235 9.46927 16.6069 9.48145 16.4697 9.48145C16.1909 9.48145 15.9767 9.4152 15.8223 9.28906C15.6748 9.16279 15.5967 8.96629 15.5967 8.68945V6.83398ZM7.75977 7.79102C7.75974 7.12275 7.57471 6.58918 7.19922 6.19629C6.8224 5.80205 6.3127 5.63574 5.67871 5.63574C5.35231 5.63574 5.05441 5.68292 4.79004 5.83691C4.57488 5.9598 4.39567 6.12734 4.24902 6.33496V5.63574H3.04102V10.541H4.24902V7.92383C4.24902 7.56262 4.35466 7.2781 4.56152 7.06543C4.7719 6.85271 5.05324 6.74414 5.41016 6.74414C5.75348 6.74414 6.02449 6.85192 6.22852 7.06445C6.43582 7.2772 6.54199 7.56223 6.54199 7.92383V10.541H7.75977V7.79102Z"
                        stroke="white"
                        stroke-opacity="0.26"
                        stroke-width="0.1"
                      />
                      <path
                        d="M17.5566 0.503906L18.0302 1.78317L19.451 2.38914L18.0302 2.86045L17.5566 4.27437L17.0829 2.86045L15.6621 2.38914L17.0829 1.78317L17.5566 0.503906Z"
                        fill="white"
                      />
                    </svg>
                  );
                }
              })()}
            </div>

            {/* UPDATED: Status badge on right */}
            <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="14.9688"
                  height="14.9688"
                  rx="7.48438"
                  fill="#A8E8CD"
                />
                <path
                  d="M2.49609 9.28995C2.49609 9.28995 4.46314 6.58449 5.61458 6.21505C6.76603 5.84562 7.80041 9.83024 9.78856 9.28995C11.3424 8.86769 12.4753 5.61328 12.4753 5.61328"
                  stroke="#1CB977"
                  stroke-linecap="round"
                />
              </svg>

              <span className="text-xs font-medium">On Track</span>
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg
                width="13"
                height="15"
                viewBox="0 0 13 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="10" width="3" height="15" rx="1.5" fill="#1CB977" />
                <rect
                  x="5"
                  y="4"
                  width="3"
                  height="11"
                  rx="1.5"
                  fill="#1CB977"
                />
                <rect y="8" width="3" height="7" rx="1.5" fill="#1CB977" />
              </svg>

              <div className="group relative max-w-[160px] overflow-hidden">
                <div className={`
                      whitespace-nowrap text-sm text-gray-600
                      ${candidate.location.length > 16 ? 'animate-[slide_10s_linear_infinite]' : ''}
                    `}>
                  {candidate.location || "—"}
                  {candidate.location.length > 16 && <span className="ml-6">{candidate.location}</span>}
                </div>
              </div>
            </div>
            <div className="text-2xl font-semibold text-green-600">
              {candidate?.job_score?.candidate_match_score?.score
                ? `${candidate.job_score.candidate_match_score.score}`
                : "--%"}
            </div>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1" title="Total Experience">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.96432 2.53516H10.0365C10.6605 2.53514 11.1808 2.53512 11.5938 2.59065C12.0298 2.64927 12.4234 2.77821 12.7397 3.0945C13.056 3.4108 13.1849 3.80441 13.2436 4.24038C13.2846 4.54566 13.2953 4.90952 13.2981 5.33052C13.7484 5.34498 14.1499 5.37131 14.5067 5.41928C15.3209 5.52874 15.9799 5.75938 16.4996 6.27907C17.0193 6.79877 17.2499 7.45777 17.3594 8.27195C17.4657 9.06307 17.4657 10.0739 17.4657 11.3502V11.4285C17.4657 12.7047 17.4657 13.7156 17.3594 14.5067C17.2499 15.3209 17.0193 15.9799 16.4996 16.4996C15.9799 17.0193 15.3209 17.2499 14.5067 17.3594C13.7156 17.4657 12.7047 17.4657 11.4285 17.4657H8.57237C7.29615 17.4657 6.28529 17.4657 5.49417 17.3594C4.67999 17.2499 4.021 17.0193 3.5013 16.4996C2.9816 15.9799 2.75096 15.3209 2.6415 14.5067C2.53514 13.7156 2.53514 12.7047 2.53516 11.4285V11.3502C2.53514 10.0739 2.53514 9.06307 2.6415 8.27195C2.75096 7.45777 2.9816 6.79877 3.5013 6.27907C4.021 5.75938 4.67999 5.52874 5.49417 5.41928C5.85096 5.37131 6.25243 5.34498 6.7028 5.33052C6.70557 4.90952 6.71627 4.54566 6.75732 4.24038C6.81593 3.80441 6.94487 3.4108 7.26117 3.0945C7.57747 2.77821 7.97108 2.64927 8.40704 2.59065C8.82009 2.53512 9.34036 2.53514 9.96432 2.53516ZM7.74474 5.31417C8.00733 5.31293 8.28303 5.31293 8.57236 5.31293H11.4285C11.7179 5.31293 11.9936 5.31293 12.2561 5.31417C12.2532 4.91812 12.2435 4.61936 12.2112 4.37918C12.1681 4.05872 12.0936 3.92157 12.0031 3.83107C11.9127 3.74057 11.7755 3.66612 11.455 3.62303C11.1196 3.57793 10.6699 3.57682 10.0004 3.57682C9.33099 3.57682 8.88127 3.57793 8.54584 3.62303C8.22539 3.66612 8.08823 3.74057 7.99774 3.83107C7.90724 3.92157 7.83278 4.05872 7.7897 4.37918C7.75741 4.61936 7.74766 4.91812 7.74474 5.31417ZM5.63297 6.45166C4.9343 6.54559 4.53176 6.72175 4.23786 7.01565C3.94397 7.30954 3.76781 7.71207 3.67388 8.41075C3.57793 9.12439 3.57682 10.0652 3.57682 11.3893C3.57682 12.7135 3.57793 13.6543 3.67388 14.3679C3.76781 15.0665 3.94397 15.4691 4.23786 15.763C4.53176 16.0569 4.9343 16.2331 5.63297 16.327C6.34662 16.4229 7.28736 16.424 8.61155 16.424H11.3893C12.7135 16.424 13.6543 16.4229 14.3679 16.327C15.0665 16.2331 15.4691 16.0569 15.763 15.763C16.0569 15.4691 16.2331 15.0665 16.327 14.3679C16.4229 13.6543 16.424 12.7135 16.424 11.3893C16.424 10.0652 16.4229 9.12439 16.327 8.41075C16.2331 7.71207 16.0569 7.30954 15.763 7.01565C15.4691 6.72175 15.0665 6.54559 14.3679 6.45166C13.6543 6.35571 12.7135 6.3546 11.3893 6.3546H8.61155C7.28736 6.3546 6.34662 6.35571 5.63297 6.45166Z"
                  fill="#818283"
                />
                <path
                  d="M14.1667 9.5013C14.1667 9.96154 13.7936 10.3346 13.3333 10.3346C12.8731 10.3346 12.5 9.96154 12.5 9.5013C12.5 9.04107 12.8731 8.66797 13.3333 8.66797C13.7936 8.66797 14.1667 9.04107 14.1667 9.5013Z"
                  fill="#818283"
                />
                <path
                  d="M7.4987 9.5013C7.4987 9.96154 7.12561 10.3346 6.66536 10.3346C6.20513 10.3346 5.83203 9.96154 5.83203 9.5013C5.83203 9.04107 6.20513 8.66797 6.66536 8.66797C7.12561 8.66797 7.4987 9.04107 7.4987 9.5013Z"
                  fill="#818283"
                />
              </svg>

              <span>
                {candidate.total_experience
                  ? `${candidate.total_experience} years`
                  : "-- year"}
              </span>
            </div>
            <div className="flex items-center gap-1" title="Current Salary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0017 11.7378C10.9606 11.7378 11.7378 10.9606 11.7378 10.0017C11.7378 9.04292 10.9606 8.26562 10.0017 8.26562C9.04292 8.26562 8.26562 9.04292 8.26562 10.0017C8.26562 10.9606 9.04292 11.7378 10.0017 11.7378Z"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.5156 8.26562V11.7378"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7.91493 14.1684C7.91493 14.6892 7.7691 15.1823 7.51216 15.599C7.03299 16.4045 6.15104 16.9462 5.13715 16.9462C4.12326 16.9462 3.24131 16.4045 2.76215 15.599C2.5052 15.1823 2.35938 14.6892 2.35938 14.1684C2.35938 12.6337 3.60243 11.3906 5.13715 11.3906C6.67187 11.3906 7.91493 12.6337 7.91493 14.1684Z"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M4.05469 14.1649L4.74218 14.8524L6.22135 13.4844"
                  stroke="#818283"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.05469 12.2925V7.91753C3.05469 5.48698 4.44358 4.44531 6.52691 4.44531H13.4714C15.5547 4.44531 16.9436 5.48698 16.9436 7.91753V12.0842C16.9436 14.5148 15.5547 15.5564 13.4714 15.5564H7.56858"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span>
                {candidate.current_salary
                  ? `${candidate.current_salary}`
                  : "-- LPA"}
              </span>
            </div>
            <div className="flex items-center gap-1" title="Expected Salary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.0017 11.7378C10.9606 11.7378 11.7378 10.9606 11.7378 10.0017C11.7378 9.04292 10.9606 8.26562 10.0017 8.26562C9.04292 8.26562 8.26562 9.04292 8.26562 10.0017C8.26562 10.9606 9.04292 11.7378 10.0017 11.7378Z"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M14.5156 8.26562V11.7378"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5.13715 16.9462C6.67128 16.9462 7.91493 15.7025 7.91493 14.1684C7.91493 12.6343 6.67128 11.3906 5.13715 11.3906C3.60303 11.3906 2.35938 12.6343 2.35938 14.1684C2.35938 15.7025 3.60303 16.9462 5.13715 16.9462Z"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5.31337 13.2969V13.9427C5.31337 14.1858 5.18837 14.4149 4.97310 14.5399L4.44531 14.8594"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.05469 12.2231V7.91753C3.05469 5.48698 4.44358 4.44531 6.52691 4.44531H13.4714C15.5547 4.44531 16.9436 5.48698 16.9436 7.91753V12.0842C16.9436 14.5148 15.5547 15.5564 13.4714 15.5564H7.56858"
                  stroke="#818283"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <span>
                {candidate.expected_salary
                  ? `${candidate.expected_salary} LPA`
                  : "-- LPA"}
              </span>
            </div>
          </div>

          {/* UPDATED: Notice period and last updated */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1" title="Notice Period">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.52821 2.88281C6.81586 2.88281 7.04905 3.116 7.04905 3.40365V3.93331C7.50879 3.92447 8.01529 3.92447 8.57236 3.92448H11.4285C11.9856 3.92447 12.4921 3.92447 12.9518 3.93331V3.40365C12.9518 3.116 13.185 2.88281 13.4727 2.88281C13.7603 2.88281 13.9935 3.116 13.9935 3.40365V3.97801C14.174 3.99178 14.3449 4.00908 14.5067 4.03082C15.3208 4.14028 15.9799 4.37092 16.4996 4.89062C17.0193 5.41032 17.2499 6.06931 17.3594 6.88349C17.3943 7.14369 17.4178 7.42767 17.4336 7.73703C17.4544 7.79327 17.4657 7.85407 17.4657 7.91753C17.4657 7.96567 17.4592 8.01228 17.447 8.05653C17.4657 8.61344 17.4657 9.24587 17.4657 9.9617V11.4289C17.4657 12.7052 17.4657 13.716 17.3594 14.5071C17.2499 15.3213 17.0193 15.9803 16.4996 16.5C15.9799 17.0197 15.3208 17.2503 14.5067 17.3598C13.7156 17.4661 12.7047 17.4661 11.4285 17.4661H8.57237C7.29615 17.4661 6.28529 17.4661 5.49417 17.3598C4.67999 17.2503 4.021 17.0197 3.5013 16.5C2.9816 15.9803 2.75096 15.3213 2.6415 14.5071C2.53514 13.716 2.53514 12.7052 2.53516 11.4289V9.9617C2.53515 9.2458 2.53514 8.61344 2.55391 8.05654C2.54169 8.01229 2.53516 7.96567 2.53516 7.91753C2.53516 7.85408 2.5465 7.79326 2.56729 7.73702C2.58304 7.42766 2.60652 7.14369 2.6415 6.88349C2.75096 6.06931 2.9816 5.41032 3.5013 4.89062C4.021 4.37092 4.67999 4.14028 5.49417 4.03082C5.65592 4.00908 5.82686 3.99178 6.00738 3.97801V3.40365C6.00738 3.116 6.24057 2.88281 6.52821 2.88281ZM3.58591 8.43837C3.57705 8.89163 3.57682 9.40781 3.57682 10.0009V11.3898C3.57682 12.7139 3.57793 13.6547 3.67388 14.3684C3.76781 15.067 3.94397 15.4695 4.23786 15.7634C4.53176 16.0573 4.93429 16.2335 5.63297 16.3274C6.34662 16.4234 7.28736 16.4245 8.61154 16.4245H11.3893C12.7135 16.4245 13.6543 16.4234 14.3679 16.3274C15.0665 16.2335 15.4691 16.0573 15.763 15.7634C16.0569 15.4695 16.2331 15.067 16.327 14.3684C16.4229 13.6547 16.424 12.7139 16.424 11.3898V10.0009C16.424 9.40781 16.4238 8.89163 16.4149 8.43837H3.58591ZM16.3673 7.3967H3.63355C3.64467 7.26518 3.65797 7.14061 3.67388 7.02229C3.76781 6.32362 3.94397 5.92108 4.23786 5.62719C4.53176 5.33329 4.93429 5.15713 5.63297 5.0632C6.34662 4.96725 7.28736 4.96615 8.61154 4.96615H11.3893C12.7135 4.96615 13.6543 4.96725 14.3679 5.0632C15.0665 5.15713 15.4691 5.33329 15.763 5.62719C16.0569 5.92108 16.2331 6.32362 16.327 7.02229C16.3429 7.14061 16.3562 7.26518 16.3673 7.3967ZM13.1254 12.605C12.8378 12.605 12.6046 12.8382 12.6046 13.1259C12.6046 13.4135 12.8378 13.6467 13.1254 13.6467C13.4131 13.6467 13.6463 13.4135 13.6463 13.1259C13.6463 12.8382 13.4131 12.605 13.1254 12.605ZM11.5629 13.1259C11.5629 12.263 12.2625 11.5634 13.1254 11.5634C13.9883 11.5634 14.6879 12.263 14.6879 13.1259C14.6879 13.9888 13.9883 14.6884 13.1254 14.6884C12.2625 14.6884 11.5629 13.9888 11.5629 13.1259Z"
                  fill="#818283"
                />
              </svg>

              <span>
                {candidate.notice_period_days
                  ? `${candidate.notice_period_days}`
                  : "-- days"}
              </span>
            </div>
            <div className="flex items-center gap-1" title="Applied">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10 3.97674C6.67345 3.97674 3.97674 6.67345 3.97674 10C3.97674 13.3265 6.67345 16.0233 10 16.0233C13.3265 16.0233 16.0233 13.3265 16.0233 10C16.0233 6.67345 13.3265 3.97674 10 3.97674ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10ZM10 6.90698C10.2697 6.90698 10.4884 7.12563 10.4884 7.39535V9.79768L11.9732 11.2826C12.1639 11.4733 12.1639 11.7825 11.9732 11.9732C11.7825 12.1639 11.4733 12.1639 11.2826 11.9732L9.65469 10.3453C9.56307 10.2538 9.51163 10.1295 9.51163 10V7.39535C9.51163 7.12563 9.73029 6.90698 10 6.90698Z"
                  fill="#818283"
                />
              </svg>

              <span>
                {candidate.time_added
                  ? `${candidate.time_added}`
                  : "-- days ago"}
              </span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    );
  };

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
      isMovingForward: true,
    });
    setShowFeedbackModal(true);
  };


  const renderCandidateProfile = () => {
    if (!selectedCandidate) return null;

    const details = candidateDetails;
    const candidate = details?.candidate || selectedCandidate;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 z-[60] flex">
        <div className=" ml-auto w-2/3 bg-gray-100 shadow-xl h-full overflow-y-auto py-6">
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
                      <button
                        onClick={() =>
                          handleCopy(candidate.premium_data!.email!)
                        }
                      >
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
                        <button
                          onClick={() =>
                            handleWhatsApp(candidate.premium_data!.phone!)
                          }
                        >
                          <FontAwesomeIcon
                            icon={faWhatsapp}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleCopy(candidate.premium_data!.phone!)
                          }
                        >
                          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links (visible if available) */}
                <div className="flex space-x-3">
                  {candidate.premium_data?.linkedin_url && (
                    <a
                      href={candidate.premium_data.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-600" />
                    </a>
                  )}
                  {candidate.premium_data?.github_url && (
                    <a
                      href={candidate.premium_data.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                  {candidate.premium_data?.portfolio_url && (
                    <a
                      href={candidate.premium_data.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    </a>
                  )}
                </div>
              </div>

              {/* Tabbed Details - Exact copy of StageDetails.tsx logic */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex border-b border-gray-200">
                  {[
                    "Score",
                    "Profile",
                    "Coding",
                    "Interview",
                    "Activity",
                    "Notes",
                  ].map((tab: any) => (
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
                  {renderTabContent()}{" "}
                  {/* Paste exact renderTabContent() from StageDetails.tsx here */}
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
          <div
            className="flex items-center cursor-pointer"
            onClick={goToHomepage}
          >
            <svg
              width="124"
              height="61"
              viewBox="0 0 158 61"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask id="path-1-inside-1_2895_678" fill="white">
                <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" />
                <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" />
                <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" />
                <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" />
                <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" />
                <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" />
                <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" />
              </mask>
              <path
                d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"
                fill="#0F47F2"
              />
              <path
                d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"
                fill="white"
              />
              <path
                d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"
                fill="white"
              />
              <path
                d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"
                fill="white"
              />
              <path
                d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"
                fill="#4B5563"
              />
              <path
                d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"
                fill="#4B5563"
              />
              <path
                d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"
                fill="#4B5563"
              />
              <path
                d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"
                stroke="white"
                stroke-opacity="0.26"
                stroke-width="0.2"
                mask="url(#path-1-inside-1_2895_678)"
              />
              <path
                d="M69.7191 2L71.6001 7.08929L77.2429 9.5L71.6001 11.375L69.7191 17L67.8382 11.375L62.1953 9.5L67.8382 7.08929L69.7191 2Z"
                fill="white"
              />
              <path
                d="M105.439 22.6285C105.463 25.0588 106.437 27.8518 108.178 29.5532C109.92 31.2545 112.267 32.1967 114.705 32.1724C117.143 32.1481 119.472 31.1594 121.179 29.4238C122.885 27.6881 123.853 25.0654 123.829 22.6351L121.099 22.6351C121.117 24.3571 120.475 26.3244 119.265 27.5542C118.056 28.7841 116.406 29.4846 114.679 29.5018C112.951 29.519 111.288 28.8514 110.054 27.6459C108.82 26.4404 108.133 24.3505 108.116 22.6285L105.439 22.6285Z"
                fill="#4B5563"
              />
              <path
                d="M107.565 39.1203C108.894 40.6673 110.701 41.7267 112.701 42.1306C114.7 42.5346 116.777 42.26 118.602 41.3504C120.428 40.4409 121.898 38.9482 122.779 37.109C123.661 35.2697 123.903 33.1889 123.469 31.1961L120.807 31.7764C121.113 33.1768 120.942 34.639 120.322 35.9315C119.703 37.224 118.67 38.2729 117.387 38.912C116.104 39.5512 114.645 39.7441 113.24 39.4603C111.835 39.1764 110.565 38.432 109.631 37.3449L107.565 39.1203Z"
                fill="#0F47F2"
              />
            </svg>
          </div>
          <div>
            <button
              className="bg-blue-600 text-white px-4 py-2 font-semibold text-sm hover:bg-blue-700 rounded-lg"
              onClick={goToHomepage}
            >
              Explore Nxthyre
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-[95vw] min-h-screen space-y-4">
          <div className="relative bg-white rounded-xl shadow-lg px-8 py-6 font-['Gellix',_sans-serif]">
            <button
              onClick={handleGoToDashboard}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
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
                        const allCandidates =
                          Object.values(stageCandidates).flat();
                        const filtered = allCandidates.filter((c: Candidate) =>
                          c.name.toLowerCase().includes(query.toLowerCase()),
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
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${index === selectedSuggestionIndex
                            ? "bg-blue-50"
                            : ""
                            }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {suggestion.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {suggestion.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {suggestion.role} at {suggestion.company}
                            </div>
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
                <button
                  onClick={handleSharePipelineCandidates}
                  className="p-1 border border-gray-300 text-gray-300 text-sm font-medium rounded-full hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
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
                        const stageArchivedCandidates = archivedCandidates.filter(
                          (c) => c.stage_slug === stage.slug,
                        );
                        const rejectedCount = stageArchivedCandidates.length;
                        const totalCount = candidates.length + rejectedCount;
                        const stageCount = getStageCount(stage.name);
                        return (
                          <div
                            key={stage.id}
                            className="w-96 h-[98vh] min-h-max"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage.name)}
                          >
                            <div
                              className={`relative bg-[#F5F9FB] h-full rounded-lg p-3 space-y-3`}
                            >
                              <div className="flex relative justify-between items-center mb-2">
                                <div
                                  className={`absolute left-[-10px] w-1 h-6 ${stage.bgColor} rounded-r mr-3`}
                                ></div>
                                <h1 className="pl-3 text-xl font-medium text-gray-700">
                                  {" "}
                                  {stage.name}
                                </h1>
                                <button
                                  onClick={() =>
                                    setArchiveMenuStage(
                                      archiveMenuStage === stage.name
                                        ? null
                                        : stage.name,
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  </div>
                                </button>
                                {archiveMenuStage === stage.name && (
                                  <div className="absolute top-12 right-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 w-56">
                                    <button
                                      onClick={() => {
                                        // Handle archive selected
                                        setArchiveMenuStage(null);
                                      }}
                                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <span className="text-sm font-medium">
                                        Archive Candidates
                                      </span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                      onClick={() => {
                                        // Handle show archive list
                                        setArchiveMenuStage(null);
                                      }}
                                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <span className="text-sm font-medium">
                                        Show Archive List
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {stage.custom_stage_type
                                  ? stage.custom_stage_type
                                  : "NXTHYRE_SHORTLIST"}
                              </p>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="text-3xl font-semibold text-gray-900">
                                    {rejectedCount}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    Rejected
                                  </span>
                                </div>
                                <div>
                                  <span className="text-3xl font-semibold text-gray-900">
                                    {totalCount}
                                  </span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    Total
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{
                                    width: `${((totalCount - rejectedCount) / totalCount) * 100}%`,
                                  }}
                                ></div>
                              </div>

                              <div className="pt-8 overflow-y-auto max-h-[75vh] hide-scrollbar">
                                <div className="space-y-3">
                                  {candidates.map((candidate: any) =>
                                    renderCandidateCard(candidate, stage.name),
                                  )}
                                  {archivedCandidates
                                    .filter((c) => c.stage_slug === stage.slug)
                                    .map((c) =>
                                      renderCandidateCard(
                                        c,
                                        stage.name,
                                        true, // isArchived
                                      ),
                                    )}
                                  {candidates.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                      <User className="w-8 h-8 mx-auto mb-2" />
                                      <p className="text-sm">No candidates</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {selectedCandidates.size > 0 &&
                                selectionStage === stage.name && (
                                  <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg py-4 px-6 z-50 rounded-b-lg">
                                    <div className="max-w-7xl mx-auto">
                                      <div className="flex items-center justify-between">
                                        {Array.from(selectedCandidates).every(
                                          (id) =>
                                            archivedCandidates.some(
                                              (ac) => ac.id === id,
                                            ),
                                        ) ? (
                                          <button
                                            onClick={handleUnarchiveSelected}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                          >
                                            Unarchive Candidates
                                          </button>
                                        ) : (
                                          <button
                                            onClick={handleArchiveSelected}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                          >
                                            Move to Archive
                                          </button>
                                        )}
                                        <button
                                          onClick={() =>
                                            setSelectedCandidates(new Set())
                                          }
                                          className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Selected candidates for archive list
                                      </p>
                                    </div>
                                  </div>
                                )}
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
                              <svg
                                width="62"
                                height="62"
                                viewBox="0 0 62 62"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M32.9375 23.25C32.9375 22.18 32.07 21.3125 31 21.3125C29.93 21.3125 29.0625 22.18 29.0625 23.25V29.0625H23.25C22.18 29.0625 21.3125 29.93 21.3125 31C21.3125 32.07 22.18 32.9375 23.25 32.9375H29.0625V38.75C29.0625 39.82 29.93 40.6875 31 40.6875C32.07 40.6875 32.9375 39.82 32.9375 38.75V32.9375H38.75C39.82 32.9375 40.6875 32.07 40.6875 31C40.6875 29.93 39.82 29.0625 38.75 29.0625H32.9375V23.25Z"
                                  fill="#818283"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M31.1496 3.23047H30.853C24.8898 3.23044 20.2164 3.23042 16.5701 3.72066C12.8378 4.22244 9.89276 5.26957 7.58116 7.58116C5.26957 9.89276 4.22244 12.8378 3.72066 16.5701C3.23042 20.2164 3.23044 24.8897 3.23047 30.853V31.1496C3.23044 37.1129 3.23042 41.7862 3.72066 45.4326C4.22244 49.1647 5.26957 52.11 7.58116 54.4215C9.89276 56.7331 12.8378 57.7801 16.5701 58.2821C20.2164 58.7721 24.8897 58.7721 30.853 58.7721H31.1496C37.1129 58.7721 41.7862 58.7721 45.4326 58.2821C49.1647 57.7801 52.11 56.7331 54.4215 54.4215C56.7331 52.11 57.7801 49.1647 58.2821 45.4326C58.7721 41.7862 58.7721 37.1129 58.7721 31.1496V30.853C58.7721 24.8897 58.7721 20.2164 58.2821 16.5701C57.7801 12.8378 56.7331 9.89276 54.4215 7.58116C52.11 5.26957 49.1647 4.22244 45.4326 3.72066C41.7862 3.23042 37.1129 3.23044 31.1496 3.23047ZM10.3212 10.3212C11.7928 8.84958 13.7838 8.00511 17.0864 7.56109C20.4447 7.10958 24.8575 7.10547 31.0013 7.10547C37.145 7.10547 41.5578 7.10958 44.9162 7.56109C48.2187 8.00511 50.2097 8.84958 51.6814 10.3212C53.1531 11.7928 53.9976 13.7838 54.4414 17.0864C54.893 20.4447 54.8971 24.8575 54.8971 31.0013C54.8971 37.145 54.893 41.5578 54.4414 44.9162C53.9976 48.2187 53.1531 50.2097 51.6814 51.6814C50.2097 53.1531 48.2187 53.9976 44.9162 54.4414C41.5578 54.893 37.145 54.8971 31.0013 54.8971C24.8575 54.8971 20.4447 54.893 17.0864 54.4414C13.7838 53.9976 11.7928 53.1531 10.3212 51.6814C8.84958 50.2097 8.00511 48.2187 7.56109 44.9162C7.10958 41.5578 7.10547 37.145 7.10547 31.0013C7.10547 24.8575 7.10958 20.4447 7.56109 17.0864C8.00511 13.7838 8.84958 11.7928 10.3212 10.3212Z"
                                  fill="#818283"
                                />
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
                    pipelineStages={pipelineStages.filter((s) => {
                      const order = s.sort_order;
                      const shortlistedOrder =
                        pipelineStages.find((st) => st.slug === "shortlisted")
                          ?.sort_order || 5;
                      return (
                        s.sort_order > shortlistedOrder && s.slug !== "archives"
                      );
                    })}
                    stagesLoading={stagesLoading}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-screen -mt-20">
                  <div className="border-2 border-dashed border-gray-600 rounded-3xl p-24 text-center max-w-2xl">
                    <h2 className="text-5xl font-bold text-gray-400 mb-6">
                      Feature Coming Soon
                    </h2>
                    <p className="text-2xl text-gray-500">
                      The{" "}
                      <span className="text-[#0F47F2] font-semibold">
                        {tabs.find((t) => t.id === activeTab)?.label}
                      </span>{" "}
                      section is under active development.
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
                      <span className="ml-2 text-sm text-gray-700">
                        Can Edit
                      </span>
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
                {feedbackData.toStage === "Archives" ? (
                  <div className="flex items-center text-center mb-6 gap-4">
                    <h3 className="text-lg font-[400] text-gray-800 mb-1">
                      Are you sure want to
                      <span className="text-xl font-[400] text-[#0F47F2]">
                        Archive Candidate?
                      </span>
                    </h3>
                  </div>
                ) : (
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
                            {feedbackData.candidate.name
                              .split(/\s+/)
                              .map((word: any) => word[0].toUpperCase())
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                      </div>

                      {/* Name and Title */}
                      <div className="col-span-7">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {feedbackData.candidate.name}
                        </h4>
                        <p className="text-xs text-blue-600">
                          {feedbackData.candidate.role} |{" "}
                          {feedbackData.candidate.company}
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

                {feedbackData.toStage !== "Archives" && (
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
              <AddNewStageForm
                onClose={() => setShowAddStageForm(false)}
                onStageCreated={() => setStagesRefreshKey((prev) => prev + 1)}
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
                    title:
                      eventData.title || `${eventData.attendee} - Interview`,
                    start_at: `${eventData.date}T${eventData.startTime}:00Z`,
                    end_at: `${eventData.date}T${eventData.endTime}:00Z`,
                    location_type: "VIRTUAL",
                    virtual_conference_url:
                      "https://meet.google.com/placeholder-tbd",
                    status: "SCHEDULED",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    reminder_preferences: {
                      candidate: [24],
                      interviewers: [2],
                    },
                  };

                  await apiClient.post("/jobs/interview-events/", payload);
                  showToast.success("Interview scheduled successfully!");

                  // Trigger calendar refresh
                  setCalendarRefreshTrigger((prev) => prev + 1);
                } catch (err: any) {
                  const msg =
                    err.response?.data?.detail ||
                    "Failed to schedule interview";
                  showToast.error(msg);
                } finally {
                  setShowAddEventForm(false);
                }
              }}
              initialDate={selectedEventDate}
              initialTime={selectedEventTime}
              pipelineStages={pipelineStages.filter((s) => {
                const order = s.sort_order;
                const shortlistedOrder =
                  pipelineStages.find((st) => st.slug === "shortlisted")
                    ?.sort_order || 5;
                return s.sort_order > shortlistedOrder && s.slug !== "archives";
              })}
              stagesLoading={stagesLoading}
              candidates={Object.values(stageCandidates).flat()}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PipelineSharePage;
