import { useState, useEffect } from "react";
import {
  Mail,
  Download,
  Check,
  MapPin,
  Briefcase,
  Phone,
  ArrowLeft,
  Calendar,
  Linkedin,
  Github,
  Globe,
  UserCircle,
  TrendingUp,
  Palette,
  FileText,
  Play,
  Volume2,
  MoreHorizontal,
  Sparkles,
  PhoneOff,
  ChevronDown,
  MessageSquare,
  X,
  Archive,
  Share2,
  Send,
  User,
  MessageSquareText,
} from "lucide-react";
import candidateService, { Note } from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";
import apiClient from "../../../services/api";

import {
  getCandidateCallHistory,
  CallHistoryEntry,
} from "../../../services/jobPipelineDashboardService";
import { EventForm } from "../../schedules/components/EventForm";

// ─── Interfaces ────────────────────────────────────────────

interface Activity {
  type: string;
  date: string;
  time?: string;
  description: string;
  actor?: string;
  data: any;
}

interface JobCandidateProfileProps {
  candidate: any; // Raw API response from /jobs/applications/{id}/
  jobId: number | null;
  workspaceId?: number;
  stages: any[];
  goBack: () => void;
  loading?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

// ─── Component ─────────────────────────────────────────────

export default function JobCandidateProfile({
  candidate,
  jobId,
  workspaceId,
  stages,
  goBack,
  loading,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalCandidates,
}: JobCandidateProfileProps) {
  // Extract data from the raw API response
  const cand = candidate?.candidate || {};
  const contextualDetails = candidate?.contextual_details || {};
  const jobScoreObj = contextualDetails?.job_score_obj || {};
  const matchScore = jobScoreObj?.candidate_match_score || {};
  const quickFitSummary = jobScoreObj?.quick_fit_summary || [];
  const statusTags = candidate?.status_tags || [];
  const applicationId = candidate?.id;

  // NEW: Use current_stage_details from API (as requested)
  const currentStageDetails = candidate?.current_stage_details || {};
  const currentStageName =
    currentStageDetails.name || candidate.current_stage?.name || "--";
  const currentStageSlug =
    currentStageDetails.slug ||
    candidate.current_stage?.slug ||
    candidate.stage_slug;

  // Candidate data
  const fullName = cand.full_name || "--";
  const headline = cand.headline || "";
  const location = cand.location || "";
  const profileSummary = cand.profile_summary || "";
  const experience = cand.experience || [];
  const education = cand.education || [];
  const skills = cand.skills_list || [];
  const premiumData = cand.premium_data || {};
  const noticePeriod =
    cand.notice_period_summary ||
    (cand.notice_period_days ? `${cand.notice_period_days} Days` : "--");
  const totalExp =
    cand.total_experience != null
      ? `${cand.total_experience} years`
      : cand.experience_years || "--";
  const currentSalary = cand.current_salary_lpa || "--";

  // AI Interview Report
  const aiReport =
    cand.ai_interview_report || contextualDetails?.ai_interview_report || {};
  const aiScores = aiReport?.score || {};
  const aiSummary = aiReport?.feedbacks?.overallFeedback || "";

  // States
  const [activeTab, setActiveTab] = useState<
    "info" | "activity" | "call" | "notes"
  >("info");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // ── Call History State ────────────────────────────────────
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState<number | null>(null);

  // ── Feedback Modal State ──
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
    candidateNames?: string[];
  } | null>(null);
  const [showStageMenu, setShowStageMenu] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  // ── Match Description Editing State ──
  const [isEditingMatchDesc, setIsEditingMatchDesc] = useState(false);
  const [editedMatchDesc, setEditedMatchDesc] = useState("");
  const [isSavingMatchDesc, setIsSavingMatchDesc] = useState(false);

  // ── Notes State ──────────────────────────────────────────
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesView, setNotesView] = useState<"my" | "community">("my");
  const [newComment, setNewComment] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const openFeedbackModal = (action: {
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
  }) => {
    const names = [fullName];
    setPendingAction({ ...action, candidateNames: names });
    setFeedbackComment("");
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!pendingAction || !feedbackComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }

    const { type, applicationIds, targetStageId, targetStageName } =
      pendingAction;

    try {
      if (type === "archive") {
        const archiveStage = stages.find((s) => s.slug === "archives");
        if (!archiveStage) {
          showToast.error("Archives stage not found");
          return;
        }
        await Promise.all(
          applicationIds.map((id) =>
            apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: archiveStage.id,
              status: "ARCHIVED",
              archive_reason: feedbackComment.trim(),
              feedback: {
                subject: "Moved to Archive",
                comment: feedbackComment.trim(),
              },
            }),
          ),
        );
        showToast.success("Candidate archived");
      } else if (type === "move" && targetStageId) {
        await Promise.all(
          applicationIds.map((id) =>
            apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: targetStageId,
              feedback: {
                subject: `Moving to ${targetStageName || "next stage"}`,
                comment: feedbackComment.trim(),
              },
            }),
          ),
        );

        showToast.success(
          `Candidate moved to ${targetStageName || "next stage"}`,
        );
      }

      setShowFeedbackModal(false);
      setFeedbackComment("");
      setPendingAction(null);
      goBack(); // Return to pipeline view to reflect changes
    } catch (error: any) {
      console.error("Action error:", error);
      showToast.error(`Failed to ${type} candidate`);
    }
  };

  // ── Fetch Activity ───────────────────────────────────────

  useEffect(() => {
    if (!cand.id || !applicationId) return;
    setLoadingActivities(true);
    candidateService
      .getCandidateActivity(cand.id, applicationId)
      .then((data) => {
        const mapped: Activity[] = data.map((item: any) => {
          const ts = new Date(item.timestamp);
          const d = item.data || {};
          let description = "";
          let actor = "System";

          if (item.type === "stage_move") {
            actor = d.moved_by_name || d.external_mover_email || "System";
            description = `Moved from ${d.from_stage_name} to ${d.to_stage_name}`;
          } else if (item.type === "communication_sent") {
            description = `Message sent via ${d.mode || "email"}`;
            actor = cand.full_name;
          } else if (item.type === "recruiter_message_sent") {
            actor = d.sent_by_name || "Recruiter";
            description = d.body?.trim() || "Message sent";
          } else {
            description =
              d.body?.trim() || d.subject?.trim() || "Activity recorded";
          }

          if (!actor || actor === "undefined") actor = "System";

          return {
            type: item.type,
            date: ts.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: ts.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            description,
            actor,
            data: d,
          };
        });
        setActivities(mapped);
      })
      .catch((err) => {
        console.error("Error fetching activity:", err);
        setActivities([]);
      })
      .finally(() => setLoadingActivities(false));
  }, [cand.id, applicationId, cand.full_name]);

  // ── Fetch Call History ────────────────────────────────────
  useEffect(() => {
    if (!cand.id || activeTab !== "call") return;
    setLoadingCalls(true);
    const candidatePhone = "91" + premiumData.phone || "";
    getCandidateCallHistory(cand.id, candidatePhone)
      .then((data) => setCallHistory(data))
      .catch((err) => {
        console.error("Error fetching call history:", err);
        setCallHistory([]);
      })
      .finally(() => setLoadingCalls(false));
  }, [cand.id, activeTab]);

  // ── Fetch Notes ──────────────────────────────────────────
  useEffect(() => {
    if (!cand.id || activeTab !== "notes") return;
    fetchNotes();
  }, [cand.id, activeTab]);

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const fetchedNotes = await candidateService.getCandidateNotes(cand.id);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleAddNote = async () => {
    if (!newComment.trim() || !cand.id) return;
    try {
      setIsLoadingNotes(true);
      const payload =
        notesView === "my"
          ? { teamNotes: newComment }
          : { communityNotes: newComment, is_community_note: true };

      await candidateService.postCandidateNote(cand.id, payload);
      setNewComment("");
      await fetchNotes(); // Refresh list
    } catch (error) {
      console.error("Failed to add note:", error);
      showToast.error("Failed to add note");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const displayedNotes =
    notesView === "my"
      ? notes.filter((note) => note.is_team_note && !note.is_community_note)
      : notes.filter((note) => note.is_team_note && note.is_community_note);

  // ── Call tab helpers ─────────────────────────────────────

  // ── Match Description Helpers ──
  useEffect(() => {
    if (matchScore.description) {
      setEditedMatchDesc(matchScore.description);
    }
  }, [matchScore.description]);

  const handleSaveMatchDescription = async () => {
    if (!cand.id || !jobId) {
      showToast.error("Missing candidate or job information");
      return;
    }

    try {
      setIsSavingMatchDesc(true);
      const success = await candidateService.updateCandidateJobScoreDescription(
        cand.id,
        jobId,
        editedMatchDesc,
      );

      if (success) {
        showToast.success("Match reasoning updated successfully");
        matchScore.description = editedMatchDesc; // Update local ref
        setIsEditingMatchDesc(false);
      } else {
        showToast.error("Failed to update match reasoning");
      }
    } catch (error) {
      console.error("Error updating match reasoning:", error);
      showToast.error("An error occurred while updating match reasoning");
    } finally {
      setIsSavingMatchDesc(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0 secs";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} secs`;
    return `${mins}min${mins > 1 ? "s" : ""} ${secs}secs`;
  };

  const getRelativeDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YESTERDAY";
    return `${diffDays} DAYS AGO`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const parseSummaryBullets = (
    summary: string | null,
  ): { main: string[]; nextSteps: string[] } => {
    if (!summary) return { main: [], nextSteps: [] };
    const lines = summary
      .split("\n")
      .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
      .filter(Boolean);

    const nextStepsIdx = lines.findIndex(
      (l) =>
        l.toLowerCase().includes("next step") ||
        l.toLowerCase().includes("action item"),
    );

    if (nextStepsIdx >= 0) {
      return {
        main: lines.slice(0, nextStepsIdx),
        nextSteps: lines.slice(nextStepsIdx + 1),
      };
    }
    // If no explicit "next steps" header, show all as main
    return { main: lines, nextSteps: [] };
  };

  // ── Score bar color helper ───────────────────────────────

  const getScoreColor = (score: number): string => {
    if (score >= 80 || score >= 8) return "#10B981";
    if (score >= 40 || score >= 4) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreWidth = (score: number): string => {
    if (score <= 10) return `${score * 10}%`;
    return `${score}%`;
  };

  // ── Loading State ────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F47F2] mx-auto mb-4" />
          <p className="text-sm text-[#8E8E93]">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  // ── Score entries for AI breakdown ───────────────────────

  const scoreEntries = [
    { label: "Resume", score: Number(aiScores.resume) || 0 },
    { label: "Knowledge", score: Number(aiScores.knowledge) || 0 },
    {
      label: "Technical",
      score: typeof aiScores.technical === "number" ? aiScores.technical : 0,
    },
    { label: "Communication", score: Number(aiScores.communication) || 0 },
  ].filter((e) => e.score > 0);

  // ── Job title for display ────────────────────────────────

  const jobTitle = candidate?.job?.title || contextualDetails?.job_title || "";

  return (
    <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex flex-col xl:flex-row p-6 gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {/* ── Main Candidate Card ── */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={goBack}
                    className="text-[#8E8E93] hover:text-black transition-colors rounded-full p-1 hover:bg-[#F3F5F7]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-2xl font-semibold text-black">
                    {fullName}
                  </h1>
                </div>
                <div className="ml-10">
                  <p className="text-sm text-[#0F47F2] mb-4">
                    {headline || jobTitle}{" "}
                    {headline && jobTitle ? ` • ${jobTitle}` : ""}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#4B5563] mb-6 font-medium">
                    <span className="flex items-center gap-1.5 ">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 10L8 11"
                          stroke="#4B5563"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M2 7.33301L2.10192 9.24185C2.21142 11.651 2.26618 12.8556 3.03923 13.5943C3.81229 14.333 5.01811 14.333 7.42975 14.333H8.57025C10.9819 14.333 12.1877 14.333 12.9608 13.5943C13.7338 12.8556 13.7886 11.651 13.8981 9.24185L14 7.33301"
                          stroke="#4B5563"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M1.89845 6.96204C3.03131 9.11629 5.58646 10 8.00033 10C10.4142 10 12.9693 9.11629 14.1022 6.96204C14.643 5.93371 14.2335 4 12.9017 4H3.09899C1.76715 4 1.35768 5.93371 1.89845 6.96204Z"
                          stroke="#4B5563"
                        />
                        <path
                          d="M10.6663 3.99984L10.6075 3.7938C10.3141 2.7671 10.1675 2.25375 9.81828 1.96013C9.46909 1.6665 9.00528 1.6665 8.07765 1.6665H7.9217C6.99407 1.6665 6.53026 1.6665 6.18107 1.96013C5.83189 2.25375 5.68522 2.7671 5.39188 3.7938L5.33301 3.99984"
                          stroke="#4B5563"
                        />
                      </svg>{" "}
                      {totalExp}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.66797 6.76236C2.66797 3.76408 5.05578 1.3335 8.0013 1.3335C10.9468 1.3335 13.3346 3.76408 13.3346 6.76236C13.3346 9.73716 11.6324 13.2084 8.97657 14.4498C8.3575 14.7392 7.6451 14.7392 7.02604 14.4498C4.37018 13.2084 2.66797 9.73716 2.66797 6.76236Z"
                          stroke="#4B5563"
                        />
                        <path
                          d="M8 8.6665C9.10457 8.6665 10 7.77107 10 6.6665C10 5.56193 9.10457 4.6665 8 4.6665C6.89543 4.6665 6 5.56193 6 6.6665C6 7.77107 6.89543 8.6665 8 8.6665Z"
                          stroke="#4B5563"
                        />
                      </svg>{" "}
                      {location || "--"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6.6665H6.66667"
                          stroke="#4B5563"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M13.8889 7.3335H12.1539C10.9643 7.3335 10 8.2289 10 9.3335C10 10.4381 10.9643 11.3335 12.1539 11.3335H13.8889C13.9445 11.3335 13.9722 11.3335 13.9957 11.3321C14.3552 11.3102 14.6415 11.0443 14.6651 10.7104C14.6667 10.6886 14.6667 10.6628 14.6667 10.6113V8.0557C14.6667 8.00416 14.6667 7.97836 14.6651 7.95656C14.6415 7.6227 14.3552 7.35683 13.9957 7.3349C13.9722 7.3335 13.9445 7.3335 13.8889 7.3335Z"
                          stroke="#4B5563"
                        />
                        <path
                          d="M13.9773 7.33333C13.9255 6.08513 13.7584 5.31983 13.2196 4.78105C12.4386 4 11.1815 4 8.66732 4H6.66732C4.15316 4 2.89608 4 2.11503 4.78105C1.33398 5.5621 1.33398 6.8192 1.33398 9.33333C1.33398 11.8475 1.33398 13.1046 2.11503 13.8856C2.89608 14.6667 4.15316 14.6667 6.66732 14.6667H8.66732C11.1815 14.6667 12.4386 14.6667 13.2196 13.8856C13.7584 13.3469 13.9255 12.5815 13.9773 11.3333"
                          stroke="#4B5563"
                        />
                        <path
                          d="M4 4L6.49033 2.34875C7.1916 1.88375 8.14173 1.88375 8.843 2.34875L11.3333 4"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M11.9941 9.3335H12.0001"
                          stroke="#4B5563"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      {currentSalary} LPA
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6095 6.9428C12 6.55229 12 5.92375 12 4.66667C12 3.40959 12 2.78105 11.6095 2.39053M11.6095 6.9428C11.2189 7.33333 10.5904 7.33333 9.33333 7.33333H6.66667C5.40959 7.33333 4.78105 7.33333 4.39053 6.9428M11.6095 2.39053C11.2189 2 10.5904 2 9.33333 2H6.66667C5.40959 2 4.78105 2 4.39053 2.39053M4.39053 2.39053C4 2.78105 4 3.40959 4 4.66667C4 5.92375 4 6.55229 4.39053 6.9428"
                          stroke="#4B5563"
                        />
                        <path
                          d="M8.66732 4.66667C8.66732 5.03485 8.36885 5.33333 8.00065 5.33333C7.63245 5.33333 7.33398 5.03485 7.33398 4.66667C7.33398 4.29848 7.63245 4 8.00065 4C8.36885 4 8.66732 4.29848 8.66732 4.66667Z"
                          stroke="#4B5563"
                        />
                        <path
                          d="M12 4C10.8954 4 10 3.10457 10 2"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M12 5.3335C10.8954 5.3335 10 6.22893 10 7.3335"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M4 4C5.10457 4 6 3.10457 6 2"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M4 5.3335C5.10457 5.3335 6 6.22893 6 7.3335"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M3.33398 13.5924H4.8406C5.51451 13.5924 6.19567 13.6626 6.85152 13.7978C8.01172 14.0368 9.23318 14.0657 10.4053 13.876C10.9832 13.7824 11.5513 13.6394 12.0657 13.3912C12.5299 13.1671 13.0986 12.8512 13.4806 12.4974C13.8621 12.1442 14.2593 11.566 14.5413 11.114C14.7831 10.7264 14.6661 10.251 14.2837 9.96218C13.8589 9.64144 13.2285 9.64151 12.8037 9.96238L11.5989 10.8724C11.132 11.2252 10.622 11.5498 10.0144 11.6468C9.94132 11.6584 9.86478 11.669 9.78492 11.6783M9.78492 11.6783C9.76085 11.6811 9.73652 11.6838 9.71185 11.6863M9.78492 11.6783C9.88212 11.6575 9.97858 11.5975 10.0692 11.5185C10.498 11.1442 10.5251 10.5135 10.153 10.0956C10.0667 9.99864 9.96565 9.91778 9.85338 9.85078C7.98845 8.73844 5.08693 9.58564 3.33398 10.8288M9.78492 11.6783C9.76058 11.6835 9.73618 11.6863 9.71185 11.6863M9.71185 11.6863C9.36292 11.7221 8.95478 11.7314 8.50185 11.6886"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M3.33398 10.3335C3.33398 9.78121 2.88627 9.3335 2.33398 9.3335C1.7817 9.3335 1.33398 9.78121 1.33398 10.3335V13.6668C1.33398 14.2191 1.7817 14.6668 2.33398 14.6668C2.88627 14.6668 3.33398 14.2191 3.33398 13.6668V10.3335Z"
                          stroke="#4B5563"
                        />
                      </svg>
                      {cand.expected_ctc || "--"} LPA
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.6673 9.33317V7.99984C14.6673 5.48568 14.6673 4.2286 13.8863 3.44755C13.1053 2.6665 11.8481 2.6665 9.33398 2.6665H6.66732C4.15316 2.6665 2.89608 2.6665 2.11503 3.44755C1.33398 4.2286 1.33398 5.48568 1.33398 7.99984V9.33317C1.33398 11.8473 1.33398 13.1044 2.11503 13.8854C2.89608 14.6665 4.15316 14.6665 6.66732 14.6665H9.33398"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M4.66602 2.6665V1.6665"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M11.334 2.6665V1.6665"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                          stroke="#4B5563"
                        />
                        <path
                          d="M13.666 13.6665L14.666 14.6665"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                        <path
                          d="M1.66602 6H14.3327"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                      </svg>{" "}
                      {noticePeriod}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {premiumData.email && (
                      <button
                        onClick={() =>
                          window.open(`mailto:${premiumData.email}`)
                        }
                        className="flex items-center gap-2 bg-[#0F47F2] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.33398 7.99984C1.33398 5.48568 1.33398 4.2286 2.11503 3.44755C2.89608 2.6665 4.15316 2.6665 6.66732 2.6665H9.33398C11.8481 2.6665 13.1053 2.6665 13.8863 3.44755C14.6673 4.2286 14.6673 5.48568 14.6673 7.99984C14.6673 10.514 14.6673 11.7711 13.8863 12.5521C13.1053 13.3332 11.8481 13.3332 9.33398 13.3332H6.66732C4.15316 13.3332 2.89608 13.3332 2.11503 12.5521C1.33398 11.7711 1.33398 10.514 1.33398 7.99984Z"
                            stroke="white"
                          />
                          <path
                            d="M4 5.3335L5.43927 6.53288C6.66369 7.55323 7.27593 8.06343 8 8.06343C8.72407 8.06343 9.33633 7.55323 10.5607 6.53288L12 5.3335"
                            stroke="white"
                            stroke-linecap="round"
                          />
                        </svg>
                        Send Mail
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const callData = {
                          id: cand.id,
                          name: fullName,
                          avatarInitials: fullName
                            ? fullName.substring(0, 2).toUpperCase()
                            : "UN",
                          headline: headline || "--",
                          phone:
                            premiumData.phone ||
                            premiumData.all_phone_numbers?.[0] ||
                            "--",
                          experience: totalExp,
                          expectedCtc: cand.expected_ctc
                            ? `${cand.expected_ctc} LPA`
                            : "--",
                          location: location || "--",
                          noticePeriod: noticePeriod,
                          callAttention: jobScoreObj?.call_attention || [],
                          resumeUrl: premiumData.resume_url || undefined,
                        };
                        sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ candidate: callData }));
                        window.location.href = `/call/${cand.id}/${jobId || 0}?mode=manual`;
                      }}
                      className="flex items-center gap-2 bg-white border border-[#0F47F2] text-[#0F47F2] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.33398 1.3335C9.33398 1.3335 10.8007 1.46683 12.6673 3.3335C14.534 5.20016 14.6673 6.66683 14.6673 6.66683"
                          stroke="#0F47F2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M9.4707 3.69043C9.4707 3.69043 10.1307 3.879 11.1206 4.86894C12.1106 5.8589 12.2992 6.51886 12.2992 6.51886"
                          stroke="#0F47F2"
                          stroke-linecap="round"
                        />
                        <path
                          d="M6.69108 3.54395L7.12375 4.31924C7.51422 5.01889 7.35748 5.93672 6.74248 6.5517C6.74248 6.5517 5.9966 7.2977 7.34902 8.65017C8.70102 10.0022 9.44748 9.2567 9.44748 9.2567C10.0625 8.6417 10.9803 8.48497 11.68 8.87544L12.4552 9.3081C13.5117 9.8977 13.6365 11.3793 12.7079 12.308C12.1499 12.866 11.4663 13.3002 10.7106 13.3288C9.43855 13.377 7.27822 13.0551 5.11115 10.888C2.9441 8.72097 2.62216 6.56065 2.67038 5.28856C2.69903 4.5329 3.13322 3.84932 3.69122 3.29132C4.61986 2.36269 6.10146 2.48746 6.69108 3.54395Z"
                          stroke="#0F47F2"
                          stroke-linecap="round"
                        />
                      </svg>
                      Call
                    </button>
                    {cand.resume_url && (
                      <button
                        onClick={() => window.open(cand.resume_url, "_blank")}
                        className="flex items-center gap-2 bg-[#E7EDFF] text-[#0F47F2] w-10 h-10 justify-center rounded-lg text-sm font-medium hover:bg-[#D4E0FF] transition"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 10C2 11.8856 2 12.8284 2.58579 13.4142C3.17157 14 4.11438 14 6 14H10C11.8856 14 12.8284 14 13.4142 13.4142C14 12.8284 14 11.8856 14 10"
                            stroke="#0F47F2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M8.00065 2V10.6667M8.00065 10.6667L10.6673 7.75M8.00065 10.6667L5.33398 7.75"
                            stroke="#0F47F2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-start min-w-[160px]">
                <div className="flex items-center gap-2 mb-6 self-end w-full justify-end">
                  {currentIndex !== undefined &&
                    totalCandidates !== undefined && (
                      <span className="text-[10px] text-[#AEAEB2] font-bold mr-1">
                        {currentIndex + 1} / {totalCandidates}
                      </span>
                    )}
                  <button
                    onClick={onNavigatePrev}
                    disabled={!onNavigatePrev}
                    className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigatePrev ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
                  >
                    &laquo; Prev
                  </button>
                  <button
                    onClick={onNavigateNext}
                    disabled={!onNavigateNext}
                    className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigateNext ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
                  >
                    Next &raquo;
                  </button>
                </div>
                <div className="relative w-20 h-20 mb-2">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <path
                      className="text-gray-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      style={{
                        color: getScoreColor(
                          typeof matchScore.score === "string"
                            ? Number(matchScore.score.replace("%", ""))
                            : Number(matchScore.score) || 0,
                        ),
                      }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${typeof matchScore.score === "string" ? Number(matchScore.score.replace("%", "")) : Number(matchScore.score) || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold -mt-1">
                      {matchScore.score || "0%"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#8E8E93] text-center uppercase tracking-wider font-semibold">
                  Match Score
                </span>
              </div>
            </div>
          </div>

          {/* Status tags row */}
          {statusTags.length > 0 && (
            <div className="bg-[#F8FAFC] px-6 py-3 text-xs font-semibold border-t border-[#E5E7EB] flex gap-2 flex-wrap">
              {statusTags.map((tag: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor:
                      tag.color === "green"
                        ? "#DEF7EC"
                        : tag.color === "red"
                          ? "#FEE9E7"
                          : tag.color === "yellow"
                            ? "#FFF7D6"
                            : "#E7EDFF",
                    color:
                      tag.color === "green"
                        ? "#059669"
                        : tag.color === "red"
                          ? "#DC2626"
                          : tag.color === "yellow"
                            ? "#92400E"
                            : "#0F47F2",
                  }}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          )}

          {/* Archived Reason */}
          {candidate.archive_reason &&
            (candidate.status === "ARCHIVED" ||
              currentStageSlug === "archives") && (
              <div className="bg-[#FEF2F2] px-6 py-4 text-sm font-medium border-t border-[#FECACA] flex items-start gap-3 rounded-b-xl">
                <Archive className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#DC2626] mr-2">
                    Archived Reason:
                  </span>
                  <span className="text-[#991B1B] leading-relaxed">
                    {candidate.archive_reason}
                  </span>
                </div>
              </div>
            )}
        </div>

        {/* ── Current Stage Pipeline Section (FIXED) ── */}
        {/* 
                    - Main card width stays exactly the same as other cards 
                    - Pipeline becomes horizontally scrollable when there are many stages
                    - Uses current_stage_details from API as requested
                    - Each stage is fixed width (no shrinking) + clean connectors
                */}
        {cand.application_type === "inbound" ? (
          <div className="bg-white rounded-xl p-8 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#4B5563] mb-2 uppercase tracking-wider">
                Candidate Status
              </h3>
              <p className="text-sm font-medium text-[#8E8E93]">
                This candidate was found via Inbound Search and is not yet added to the pipeline.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!jobId || !cand.id) return;
                try {
                  const shortlistStage = stages?.find((s) => s.name.toLowerCase().includes("shortlist"));
                  await candidateService.saveToPipeline(jobId, cand.id, shortlistStage?.id);
                  showToast.success("Candidate shortlisted and added to pipeline");
                  goBack();
                } catch (err) {
                  showToast.error("Failed to add candidate to pipeline");
                }
              }}
              className="flex items-center gap-2 bg-[#0F47F2] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md whitespace-nowrap"
            >
              Shortlist (Add to Pipeline)
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-xs font-medium text-[#4B5563] mb-8">
              CURRENT STAGE{" "}
              <span className="text-[#0F47F2] ml-4 font-bold uppercase">
                {currentStageName}
              </span>
            </h3>

            <div className=" overflow-y-auto pb-8 scrollbar-hide">
              <div className="flex items-center min-w-max">
                {stages
                  .filter((s) => s.slug !== "archives")
                  .map((stage, i, filteredStages) => {
                    const currentStageIndex = stages.findIndex(
                      (s) => s.slug === currentStageSlug,
                    );
                    const isCompleted = i < currentStageIndex;
                    const isActive = i === currentStageIndex;

                    return (
                      <div
                        key={stage.id}
                        className="flex items-center flex-shrink-0"
                      >
                        <div className="flex flex-col items-left">
                          <div className="relative group">
                            {isCompleted ? (
                              <div className="flex items-center justify-left">
                                <div className="relative flex flex-col items-center">
                                  <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 58 58"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-10 h-10"
                                  >
                                    <path
                                      d="M23.6391 9.40147C25.0017 8.24019 25.683 7.65957 26.3954 7.31908C28.0431 6.53154 29.9586 6.53154 31.6063 7.31908C32.3187 7.65957 32.9999 8.24019 34.3627 9.40147C34.905 9.86366 35.1762 10.0948 35.4659 10.2889C36.1298 10.7339 36.8753 11.0427 37.6593 11.1975C38.0015 11.265 38.3565 11.2934 39.067 11.35C40.8517 11.4924 41.7439 11.5637 42.4885 11.8266C44.2104 12.4348 45.5649 13.7893 46.1732 15.5112C46.4361 16.2557 46.5072 17.1481 46.6498 18.9328C46.7063 19.6431 46.7346 19.9983 46.8022 20.3403C46.9569 21.1244 47.2658 21.87 47.7109 22.5339C47.905 22.8235 48.136 23.0947 48.5983 23.637C49.7595 24.9997 50.3402 25.6812 50.6808 26.3934C51.4681 28.0411 51.4681 29.9565 50.6808 31.6042C50.3402 32.3166 49.7595 32.9979 48.5983 34.3606C48.136 34.9029 47.905 35.1741 47.7109 35.4638C47.2658 36.1277 46.9569 36.8732 46.8022 37.6574C46.7346 37.9994 46.7063 38.3547 46.6498 39.0649C46.5072 40.8496 46.4361 41.7419 46.1732 42.4864C45.5649 44.2083 44.2104 45.5628 42.4885 46.1711C41.7439 46.4341 40.8517 46.5051 39.067 46.6477C38.3565 46.7042 38.0015 46.7328 37.6593 46.8002C36.8753 46.9551 36.1298 47.2637 35.4659 47.7088C35.1762 47.9029 34.905 48.1339 34.3627 48.5962C32.9999 49.7575 32.3187 50.3382 31.6063 50.6787C29.9586 51.466 28.0431 51.466 26.3954 50.6787C25.683 50.3382 25.0017 49.7575 23.6391 48.5962C23.0967 48.1339 22.8255 47.9029 22.5359 47.7088C21.872 47.2637 21.1265 46.9551 20.3424 46.8002C20.0003 46.7328 19.6452 46.7042 18.9348 46.6477C17.1501 46.5051 16.2577 46.4341 15.5133 46.1711C13.7913 45.5628 12.4369 44.2083 11.8287 42.4864C11.5657 41.7419 11.4945 40.8496 11.3521 39.0649C11.2954 38.3547 11.2671 37.9994 11.1995 37.6574C11.0447 36.8732 10.7359 36.1277 10.2909 35.4638C10.0968 35.1741 9.86571 34.9029 9.40352 34.3606C8.24224 32.9979 7.66162 32.3166 7.32111 31.6042C6.53359 29.9565 6.53359 28.0411 7.32111 26.3934C7.66162 25.6809 8.24224 24.9997 9.40352 23.637C9.86571 23.0947 10.0968 22.8235 10.2909 22.5339C10.7359 21.87 11.0447 21.1244 11.1995 20.3403C11.2671 19.9983 11.2954 19.6431 11.3521 18.9328C11.4945 17.1481 11.5657 16.2557 11.8287 15.5112C12.4369 13.7893 13.7913 12.4348 15.5133 11.8266C16.2577 11.5637 17.1501 11.4924 18.9348 11.35C19.6452 11.2934 20.0003 11.265 20.3424 11.1975C21.1265 11.0427 21.872 10.7339 22.5359 10.2889C22.8255 10.0948 23.0967 9.86366 23.6391 9.40147Z"
                                      fill="#14AE5C"
                                    />
                                    <path
                                      d="M20.541 30.2083L25.3743 35.0416L37.4577 22.9583"
                                      stroke="white"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </svg>
                                  <span
                                    className={`absolute top-10 text-[8px] font-semibold text-left max-w-[88px] text-nowrap leading-tight ${isActive ? "text-[#0F47F2]" : "text-[#8E8E93]"}`}
                                  >
                                    {stage.name}
                                  </span>
                                </div>

                                {i < filteredStages.length - 1 && (
                                  <div className="w-12 h-[2px] bg-[#E5E7EB]">
                                    {isCompleted && (
                                      <div className="h-full bg-[#009951]" />
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="relative flex flex-col items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                                              ${isActive ? "bg-[#0F47F2] text-white" : "bg-[#E5E7EB] text-[#8E8E93]"}`}
                                  >
                                    {i + 1}
                                  </div>
                                  <span
                                    className={`absolute top-10 text-[8px] font-semibold text-left max-w-[88px] text-nowrap leading-tight ${isActive ? "text-[#0F47F2]" : "text-[#8E8E93]"}`}
                                  >
                                    {stage.name}
                                  </span>
                                </div>
                                {i < filteredStages.length - 1 && (
                                  <div className="w-12 h-[2px] bg-[#E5E7EB]">
                                    {isCompleted && (
                                      <div className="h-full bg-[#009951]" />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector line */}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setShowStageMenu(!showStageMenu)}
                className="flex items-center gap-2 bg-[#0F47F2] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.66602 8H13.3327M13.3327 8L9.33268 4M13.3327 8L9.33268 12"
                    stroke="white"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Move to Stage
              </button>

              {showStageMenu && (
                <div className="absolute top-14 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-2">
                  {stages
                    .filter((s) => s.slug !== "archives")
                    .map((s) => (
                      <button
                        key={s.id}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 block"
                        onClick={() => {
                          setShowStageMenu(false);
                          openFeedbackModal({
                            type: "move",
                            applicationIds: [applicationId],
                            targetStageId: s.id,
                            targetStageName: s.name,
                          });
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                </div>
              )}

              <button
                onClick={() =>
                  openFeedbackModal({
                    type: "archive",
                    applicationIds: [applicationId],
                  })
                }
                className="flex items-center gap-2 bg-white border border-[#FEE9E7] text-[#DC2626] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#FEE9E7] transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.11328 2.66683C6.38783 1.89004 7.12868 1.3335 7.99948 1.3335C8.87028 1.3335 9.61115 1.89004 9.88568 2.66683"
                    stroke="#FF383C"
                    stroke-linecap="round"
                  />
                  <path
                    d="M13.6674 4H2.33398"
                    stroke="#FF383C"
                    stroke-linecap="round"
                  />
                  <path
                    d="M12.5545 5.6665L12.2478 10.2659C12.1298 12.0358 12.0708 12.9208 11.4942 13.4603C10.9175 13.9998 10.0306 13.9998 8.25669 13.9998H7.74116C5.96726 13.9998 5.08033 13.9998 4.50365 13.4603C3.92699 12.9208 3.86799 12.0358 3.74999 10.2659L3.44336 5.6665"
                    stroke="#FF383C"
                    stroke-linecap="round"
                  />
                  <path
                    d="M6.33398 7.3335L6.66732 10.6668"
                    stroke="#FF383C"
                    stroke-linecap="round"
                  />
                  <path
                    d="M9.66732 7.3335L9.33398 10.6668"
                    stroke="#FF383C"
                    stroke-linecap="round"
                  />
                </svg>
                Move to Archive
              </button>
              <button
                onClick={() => setIsEventFormOpen(true)}
                className="flex items-center gap-2 bg-white border border-[#0F47F2] text-[#0F47F2] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M6.66667 11.3332L6.66666 8.89798C6.66666 8.77014 6.5755 8.6665 6.46305 8.6665H6M9.08644 11.3332L9.98945 8.89928C10.0317 8.78547 9.94189 8.6665 9.81379 8.6665H8.66667" stroke="#0F47F2" stroke-linecap="round" />
                  <path d="M1.66699 8.16216C1.66699 5.25729 1.66699 3.80486 2.50174 2.90243C3.33648 2 4.67999 2 7.36699 2H8.63366C11.3207 2 12.6642 2 13.4989 2.90243C14.3337 3.80486 14.3337 5.25729 14.3337 8.16216V8.5045C14.3337 11.4094 14.3337 12.8618 13.4989 13.7642C12.6642 14.6667 11.3207 14.6667 8.63366 14.6667H7.36699C4.67999 14.6667 3.33648 14.6667 2.50174 13.7642C1.66699 12.8618 1.66699 11.4094 1.66699 8.5045V8.16216Z" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M4 5.3335H12" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                Schedule Interview
              </button>
            </div>
          </div>
        )}

        {/* Call Attention Questions */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
          <h3 className="text-xs text-teal-500 mb-6 font-semibold uppercase tracking-widest">
            Questions to Ask
          </h3>
          <div className="flex flex-col gap-4 text-sm font-medium text-slate-700">
            {jobScoreObj?.call_attention &&
              jobScoreObj.call_attention.length > 0 ? (
              <ul className="list-disc pl-5 space-y-3 marker:text-teal-500">
                {jobScoreObj.call_attention.map((question: any, index: any) => (
                  <li key={index} className="pl-1 leading-relaxed">
                    {question}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-slate-500 text-sm">
                No specific questions prepared for this candidate.
              </p>
            )}
          </div>
          {/* <div className="flex flex-col gap-4 text-sm font-medium text-slate-700">
            {candidate.callAttention && candidate.callAttention.length > 0 ? (
              <ul className="list-disc pl-5 space-y-3 marker:text-teal-500">
                {candidate.callAttention.map((question: any, index: any) => (
                  <li key={index} className="pl-1 leading-relaxed">
                    {question}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-slate-500 text-sm">
                No specific questions prepared for this candidate.
              </p>
            )}
          </div> */}
        </div>

        {/* ── Quick Fit Summary (Signals) ── */}
        {quickFitSummary.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              QUICK FIT SUMMARY
            </h3>
            <div className="flex flex-wrap gap-3">
              {quickFitSummary.map((item: any, i: number) => {
                const colorMap: Record<
                  string,
                  { bg: string; border: string; text: string }
                > = {
                  green: { bg: "#EBFFEE", border: "#DEF7EC", text: "#009951" },
                  yellow: { bg: "#FFF7D6", border: "#FDE047", text: "#92400E" },
                  red: { bg: "#FEE9E7", border: "#FECACA", text: "#DC2626" },
                };
                const c = colorMap[item.color] || colorMap.green;
                return (
                  <div
                    key={i}
                    className="text-xs font-bold bg-[#F5F9FB] px-3 py-1.5 rounded-lg flex items-center gap-1.5 "
                    style={{
                      color: c.text,
                    }}
                    title={item.evidence}
                  >
                    {item.badge}

                    {item.color === "green" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 11.5C9.03756 11.5 11.5 9.03756 11.5 6C11.5 2.96243 9.03756 0.5 6 0.5C2.96243 0.5 0.5 2.96243 0.5 6C0.5 9.03756 2.96243 11.5 6 11.5Z"
                          stroke="#009951"
                        />
                        <path
                          d="M4.07324 6.275L5.17324 7.375L7.92324 4.625"
                          stroke="#009951"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    )}
                    {item.color === "red" && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_465_8838)">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M5.5 10.3125C2.84212 10.3125 0.6875 8.15719 0.6875 5.5C0.6875 2.84281 2.84212 0.6875 5.5 0.6875C8.15788 0.6875 10.3125 2.84281 10.3125 5.5C10.3125 8.15719 8.15788 10.3125 5.5 10.3125ZM5.5 0C2.46228 0 0 2.46125 0 5.5C0 8.53875 2.46228 11 5.5 11C8.53772 11 11 8.53875 11 5.5C11 2.46125 8.53772 0 5.5 0ZM7.46521 3.53376C7.32977 3.3997 7.11081 3.3997 6.97537 3.53376L5.49794 5.01186L4.04181 3.55436C3.9074 3.4203 3.68947 3.4203 3.55575 3.55436C3.42134 3.68843 3.42134 3.90844 3.55575 4.0425L5.01188 5.49656L3.54545 6.96438C3.41035 7.09844 3.41035 7.31842 3.54545 7.45592C3.68088 7.58998 3.90018 7.58998 4.03562 7.45592L5.50206 5.98814L6.95819 7.44564C7.0926 7.5797 7.31053 7.5797 7.44459 7.44564C7.57899 7.31157 7.57899 7.09156 7.44459 6.9575L5.98812 5.50344L7.46521 4.0253C7.60031 3.8878 7.60031 3.67126 7.46521 3.53376Z"
                            fill="#CF272D"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_465_8838">
                            <rect width="11" height="11" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    )}
                    {item.color === "yellow" && (
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.5 0.846153C2.92975 0.846153 0.846153 2.92975 0.846153 5.5C0.846153 8.07026 2.92975 10.1538 5.5 10.1538C8.07026 10.1538 10.1538 8.07026 10.1538 5.5C10.1538 2.92975 8.07026 0.846153 5.5 0.846153ZM0 5.5C0 2.46243 2.46243 0 5.5 0C8.53754 0 11 2.46243 11 5.5C11 8.53754 8.53754 11 5.5 11C2.46243 11 0 8.53754 0 5.5Z"
                          fill="#CD9B05"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M5.5 3C5.77613 3 6 3.18315 6 3.40909V5.59088C6 5.81684 5.77613 6 5.5 6C5.22387 6 5 5.81684 5 5.59088V3.40909C5 3.18315 5.22387 3 5.5 3Z"
                          fill="#CD9B05"
                        />
                        <path
                          d="M6 7.49998C6 7.77614 5.77613 8 5.5 8C5.22387 8 5 7.77614 5 7.49998C5 7.22386 5.22387 7 5.5 7C5.77613 7 6 7.22386 6 7.49998Z"
                          fill="#CD9B05"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Profile Summary ── */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
            PROFILE SUMMARY
          </h3>
          <p className="text-sm leading-relaxed text-[#4B5563]">
            {profileSummary || "No summary available."}
          </p>
        </div>

        {/* ── Gaps & Risks ── */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
            GAPS / RISK
          </h3>
          <div className="flex flex-col gap-3">
            {(jobScoreObj.gaps_risks || []).length > 0 ? (
              jobScoreObj.gaps_risks.map((gap: string, i: number) => (
                <div
                  key={i}
                  className="bg-[#F3F5F7] p-4 rounded-lg text-sm text-[#4B5563]"
                >
                  {gap}
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AEAEB2]">
                No major risks identified.
              </p>
            )}
          </div>
        </div>

        {/* ── Additional AI Sections ── */}
        {matchScore.description && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider">
                MATCH REASONING
              </h3>
              {!isEditingMatchDesc && (
                <button
                  onClick={() => setIsEditingMatchDesc(true)}
                  className="text-[#0F47F2] text-xs font-bold hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {!isEditingMatchDesc ? (
              <p className="text-sm leading-relaxed text-[#4B5563]">
                {matchScore.description}
              </p>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={editedMatchDesc}
                  onChange={(e) => setEditedMatchDesc(e.target.value)}
                  rows={6}
                  className="w-full p-4 border border-[#E5E7EB] rounded-xl text-sm leading-relaxed text-[#4B5563] focus:outline-none focus:border-[#0F47F2] transition-colors resize-none"
                  placeholder="Enter match reasoning..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditedMatchDesc(matchScore.description || "");
                      setIsEditingMatchDesc(false);
                    }}
                    className="px-4 py-2 text-xs font-bold text-[#8E8E93] hover:text-[#4B5563] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMatchDescription}
                    disabled={isSavingMatchDesc}
                    className="px-6 py-2 bg-[#0F47F2] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {isSavingMatchDesc ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {aiSummary && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              AI FEEDBACK
            </h3>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              {aiSummary}
            </p>
          </div>
        )}

        {scoreEntries.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              SCORE BREAKDOWN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scoreEntries.map((entry) => (
                <div
                  key={entry.label}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#4B5563]">
                      {entry.label}
                    </span>
                    <span className="text-lg font-black text-black">
                      {entry.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: getScoreWidth(entry.score),
                        backgroundColor: getScoreColor(entry.score),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full xl:w-[360px] flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB]">
          {/* Sidebar tabs */}
          <div className="flex border-b border-[#E5E7EB]">
            {(["info", "activity", "call", "notes"] as const).map((id) => {
              const icons: Record<string, React.ReactNode> = {
                info: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.50065 9.16683C8.42113 9.16683 9.16732 8.42064 9.16732 7.50016C9.16732 6.57969 8.42113 5.8335 7.50065 5.8335C6.58018 5.8335 5.83398 6.57969 5.83398 7.50016C5.83398 8.42064 6.58018 9.16683 7.50065 9.16683Z"
                      stroke="#0F47F2"
                    />
                    <path
                      d="M10.8327 12.5002C10.8327 13.4207 10.8327 14.1668 7.49935 14.1668C4.16602 14.1668 4.16602 13.4207 4.16602 12.5002C4.16602 11.5797 5.6584 10.8335 7.49935 10.8335C9.34027 10.8335 10.8327 11.5797 10.8327 12.5002Z"
                      stroke="#0F47F2"
                    />
                    <path
                      d="M1.66602 10.0002C1.66602 6.85746 1.66602 5.28612 2.64232 4.3098C3.61864 3.3335 5.18998 3.3335 8.33268 3.3335H11.666C14.8087 3.3335 16.3801 3.3335 17.3563 4.3098C18.3327 5.28612 18.3327 6.85746 18.3327 10.0002C18.3327 13.1428 18.3327 14.7142 17.3563 15.6905C16.3801 16.6668 14.8087 16.6668 11.666 16.6668H8.33268C5.18998 16.6668 3.61864 16.6668 2.64232 15.6905C1.66602 14.7142 1.66602 13.1428 1.66602 10.0002Z"
                      stroke="#0F47F2"
                    />
                    <path
                      d="M15.8333 10H12.5"
                      stroke="#0F47F2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M15.8327 7.5H11.666"
                      stroke="#0F47F2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M15.834 12.5H13.334"
                      stroke="#0F47F2"
                      stroke-linecap="round"
                    />
                  </svg>
                ),
                activity: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.3327 8.74984V9.99984C18.3327 13.9282 18.3327 15.8924 17.1123 17.1128C15.8919 18.3332 13.9277 18.3332 9.99935 18.3332C6.07097 18.3332 4.10679 18.3332 2.88641 17.1128C1.66602 15.8924 1.66602 13.9282 1.66602 9.99984C1.66602 6.07146 1.66602 4.10728 2.88641 2.8869C4.10679 1.6665 6.07097 1.6665 9.99935 1.6665H11.2493"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                    <path
                      d="M15.834 6.6665C17.2147 6.6665 18.334 5.54722 18.334 4.1665C18.334 2.78579 17.2147 1.6665 15.834 1.6665C14.4533 1.6665 13.334 2.78579 13.334 4.1665C13.334 5.54722 14.4533 6.6665 15.834 6.6665Z"
                      stroke="#4B5563"
                    />
                    <path
                      d="M5.83398 11.6668L7.74473 9.75608C8.07017 9.43066 8.59782 9.43066 8.92323 9.75608L10.2447 11.0776C10.5702 11.403 11.0978 11.403 11.4232 11.0776L14.1673 8.3335M14.1673 8.3335V10.4168M14.1673 8.3335H12.084"
                      stroke="#4B5563"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                ),
                call: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.666 1.6665C11.666 1.6665 13.4993 1.83317 15.8327 4.1665C18.166 6.49984 18.3327 8.33317 18.3327 8.33317"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                    <path
                      d="M11.8398 4.61328C11.8398 4.61328 12.6648 4.84899 13.9023 6.08642C15.1397 7.32386 15.3754 8.14882 15.3754 8.14882"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                    <path
                      d="M8.36532 4.4303L8.90615 5.39941C9.39424 6.27398 9.19832 7.42126 8.42957 8.19C8.42957 8.19 7.49722 9.1225 9.18774 10.8131C10.8777 12.5031 11.8108 11.5712 11.8108 11.5712C12.5796 10.8025 13.7268 10.6066 14.6014 11.0947L15.5705 11.6355C16.8912 12.3725 17.0471 14.2245 15.8863 15.3853C15.1888 16.0828 14.3343 16.6256 13.3897 16.6613C11.7997 16.7217 9.09924 16.3192 6.3904 13.6104C3.68159 10.9016 3.27916 8.20118 3.33944 6.61107C3.37525 5.6665 3.91799 4.81202 4.61549 4.11452C5.77629 2.95373 7.62829 3.1097 8.36532 4.4303Z"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                  </svg>
                ),
                notes: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.9078 10.5806L16.2833 9.2051C16.7214 7.59957 16.9405 6.79679 16.7755 6.10207C16.6453 5.55353 16.3522 5.05523 15.9335 4.67019C15.4031 4.18255 14.5854 3.96745 12.95 3.53724C11.3145 3.10703 10.4968 2.89193 9.78916 3.05392C9.23037 3.18182 8.72279 3.46951 8.33059 3.88061C7.90531 4.32639 7.68353 4.97897 7.3535 6.16514C7.29808 6.36434 7.2396 6.5786 7.17659 6.80944L6.80115 8.18501C6.36293 9.79056 6.14382 10.5933 6.30883 11.288C6.43911 11.8366 6.73216 12.3349 7.15091 12.72C7.68126 13.2076 8.49898 13.4227 10.1344 13.8529C11.6085 14.2407 12.4182 14.4537 13.0819 14.3733C13.1546 14.3645 13.2254 14.3522 13.2953 14.3362C13.854 14.2083 14.3616 13.9206 14.7538 13.5095C15.2505 12.9889 15.4696 12.1861 15.9078 10.5806Z"
                      stroke="#4B5563"
                    />
                    <path
                      d="M13.5765 14.7085C13.4236 15.1761 13.1546 15.5991 12.7929 15.9373C12.2564 16.4389 11.429 16.6601 9.77449 17.1027C8.11987 17.5452 7.29257 17.7664 6.57663 17.5998C6.01133 17.4683 5.49781 17.1723 5.10101 16.7495C4.59847 16.2139 4.3768 15.3881 3.93345 13.7366L3.55365 12.3217C3.1103 10.6701 2.88863 9.84437 3.05556 9.12972C3.18737 8.56548 3.48385 8.0529 3.90751 7.65683C4.44407 7.15522 5.27136 6.93395 6.92596 6.49142C7.23899 6.40769 7.5224 6.33189 7.78106 6.26514"
                      stroke="#4B5563"
                    />
                    <path
                      d="M10.3223 9.50586L13.5766 10.3194"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                    <path
                      d="M9.50391 11.1372H11.1311"
                      stroke="#4B5563"
                      stroke-linecap="round"
                    />
                  </svg>
                ),
              };
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-4 text-sm font-medium capitalize transition-colors flex items-center justify-center gap-2 ${activeTab === id
                    ? "text-[#0F47F2] border-b-2 border-[#0F47F2] bg-[#F3F5F7]/30"
                    : "text-[#8E8E93] hover:text-[#4B5563]"
                    }`}
                >
                  {icons[id]}
                  <span className="sr-only">{id}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 flex flex-col gap-8 text-sm">
            {activeTab === "info" && (
              <>
                {/* ── Contact Info ── */}
                <div className=" overflow-y-auto max-h-[500px] hide-scrollbar">
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    CONTACT INFO
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Name</span>
                      <span className="font-bold text-black">{fullName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">
                        Location
                      </span>
                      <span className="font-medium text-black">
                        {location || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">D.O.B</span>
                      <span className="font-medium text-black">--</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-black">
                      <span className="text-[#AEAEB2] font-medium">Email</span>
                      <span
                        className="truncate ml-4 text-[#0F47F2] font-medium cursor-pointer"
                        onClick={() =>
                          premiumData.email &&
                          window.open(`mailto:${premiumData.email}`)
                        }
                      >
                        {premiumData.email || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Phone</span>
                      <span
                        className="text-[#0F47F2] font-medium cursor-pointer"
                        onClick={() =>
                          (premiumData.phone || cand.phone) &&
                          window.open(`tel:${premiumData.phone || cand.phone}`)
                        }
                      >
                        {premiumData.phone || cand.phone || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Links</span>
                      <div className="flex gap-2">
                        {(premiumData.linkedin_url || cand.linkedin_url) && (
                          <a
                            href={premiumData.linkedin_url || cand.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.75 10C18.75 5.16751 14.8325 1.25 10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75C14.8325 18.75 18.75 14.8325 18.75 10Z"
                                fill="#1275B1"
                              />
                              <path
                                d="M7.88662 6.05759C7.88662 6.64169 7.38031 7.11519 6.75581 7.11519C6.13128 7.11519 5.625 6.64169 5.625 6.05759C5.625 5.4735 6.13128 5 6.75581 5C7.38031 5 7.88662 5.4735 7.88662 6.05759Z"
                                fill="white"
                              />
                              <path
                                d="M5.7793 7.89258H7.71228V13.75H5.7793V7.89258Z"
                                fill="white"
                              />
                              <path
                                d="M10.8256 7.8924H8.89258V13.7498H10.8256C10.8256 13.7498 10.8256 11.9058 10.8256 10.7529C10.8256 10.0608 11.0619 9.36578 12.0047 9.36578C13.0702 9.36578 13.0638 10.2714 13.0588 10.973C13.0523 11.8901 13.0678 12.826 13.0678 13.7498H15.0008V10.6584C14.9845 8.68446 14.4701 7.7749 12.7779 7.7749C11.773 7.7749 11.15 8.23115 10.8256 8.6439V7.8924Z"
                                fill="white"
                              />
                            </svg>
                          </a>
                        )}
                        {premiumData.github_url && (
                          <a
                            href={premiumData.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clip-path="url(#clip0_465_8585)">
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M10 0C15.523 0 20 4.58993 20 10.2529C20 14.7819 17.138 18.624 13.167 19.981C12.66 20.082 12.48 19.7618 12.48 19.4888C12.48 19.1508 12.492 18.0468 12.492 16.6748C12.492 15.7188 12.172 15.0949 11.813 14.7769C14.04 14.5229 16.38 13.6558 16.38 9.71777C16.38 8.59777 15.992 7.68382 15.35 6.96582C15.454 6.70682 15.797 5.66395 15.252 4.25195C15.252 4.25195 14.414 3.97722 12.505 5.30322C11.706 5.07622 10.85 4.96201 10 4.95801C9.15 4.96201 8.295 5.07622 7.497 5.30322C5.586 3.97722 4.746 4.25195 4.746 4.25195C4.203 5.66395 4.546 6.70682 4.649 6.96582C4.01 7.68382 3.619 8.59777 3.619 9.71777C3.619 13.6458 5.954 14.5262 8.175 14.7852C7.889 15.0412 7.63 15.4928 7.54 16.1558C6.97 16.4178 5.522 16.8712 4.63 15.3042C4.63 15.3042 4.101 14.3191 3.097 14.2471C3.097 14.2471 2.122 14.2341 3.029 14.8701C3.029 14.8701 3.684 15.1851 4.139 16.3701C4.139 16.3701 4.726 18.2001 7.508 17.5801C7.513 18.4371 7.522 19.2448 7.522 19.4888C7.522 19.7598 7.338 20.0769 6.839 19.9819C2.865 18.6269 0 14.7829 0 10.2529C0 4.58993 4.478 0 10 0Z"
                                  fill="#FF8D28"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_465_8585">
                                  <rect width="20" height="20" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </a>
                        )}
                        {premiumData.portfolio_url && (
                          <a
                            href={premiumData.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Portfolio"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clip-path="url(#clip0_465_8596)">
                                <path
                                  d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM6.65 12.77C6.54 13.07 6.25 13.26 5.95 13.26C5.86 13.26 5.78 13.25 5.69 13.21C4.88 12.91 4.2 12.32 3.77 11.55C2.77 9.75 3.39 7.4 5.14 6.31L7.48 4.86C8.34 4.33 9.35 4.17 10.31 4.42C11.27 4.67 12.08 5.3 12.57 6.18C13.57 7.98 12.95 10.33 11.2 11.42L10.94 11.61C10.6 11.85 10.13 11.77 9.89 11.44C9.65 11.1 9.73 10.63 10.06 10.39L10.37 10.17C11.49 9.47 11.87 8.02 11.26 6.91C10.97 6.39 10.5 6.02 9.94 5.87C9.38 5.72 8.79 5.81 8.28 6.13L5.92 7.59C4.84 8.26 4.46 9.71 5.07 10.83C5.32 11.28 5.72 11.63 6.2 11.81C6.59 11.95 6.79 12.38 6.65 12.77ZM14.92 13.65L12.58 15.1C11.99 15.47 11.33 15.65 10.66 15.65C10.36 15.65 10.05 15.61 9.75 15.53C8.79 15.28 7.98 14.65 7.5 13.77C6.5 11.97 7.12 9.62 8.87 8.53L9.13 8.34C9.47 8.1 9.94 8.18 10.18 8.51C10.42 8.85 10.34 9.32 10.01 9.56L9.7 9.78C8.58 10.48 8.2 11.93 8.81 13.04C9.1 13.56 9.57 13.93 10.13 14.08C10.69 14.23 11.28 14.14 11.79 13.82L14.13 12.37C15.21 11.7 15.59 10.25 14.98 9.13C14.73 8.68 14.33 8.33 13.85 8.15C13.46 8.01 13.26 7.58 13.41 7.19C13.55 6.8 13.99 6.6 14.37 6.75C15.18 7.05 15.86 7.64 16.29 8.41C17.28 10.21 16.67 12.56 14.92 13.65Z"
                                  fill="#4B5563"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_465_8596">
                                  <rect width="20" height="20" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </a>
                        )}
                        {premiumData.twitter_url && (
                          <a
                            href={premiumData.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Twitter"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="100"
                              height="100"
                              viewBox="0 0 50 50"
                            >
                              <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            if (cand.id) {
                              const shareUrl = `/candidate-profiles/${cand.id}${jobId ? `?job_id=${jobId}` : ""}`;
                              window.open(shareUrl, "_blank");
                            } else {
                              showToast.error("Candidate ID not found");
                            }
                          }}
                          className="hover:scale-110 transition-transform"
                          title="Share Profile"
                        >
                          <Share2 className="w-4 h-4 text-[#0F47F2] cursor-pointer" />
                        </button>
                        {!premiumData.linkedin_url &&
                          !cand.linkedin_url &&
                          !premiumData.github_url &&
                          !premiumData.portfolio_url &&
                          !premiumData.twitter_url && (
                            <span className="text-[#AEAEB2] text-xs">--</span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Résumé ── */}
                {(cand.resume_url || premiumData.resume_url) && (
                  <div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                        RESUME
                      </h4>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.66602 7.3335L14.666 1.3335M14.666 1.3335H11.1035M14.666 1.3335V4.896"
                          stroke="#4B5563"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M14.6673 8.00016C14.6673 11.1428 14.6673 12.7142 13.691 13.6905C12.7147 14.6668 11.1433 14.6668 8.00065 14.6668C4.85795 14.6668 3.2866 14.6668 2.3103 13.6905C1.33398 12.7142 1.33398 11.1428 1.33398 8.00016C1.33398 4.85746 1.33398 3.28612 2.3103 2.30981C3.2866 1.3335 4.85795 1.3335 8.00065 1.3335"
                          stroke="#4B5563"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>

                    <a
                      href={cand.resume_url || premiumData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[#E5E7EB] rounded-lg p-3 bg-white flex items-center justify-between group cursor-pointer hover:border-[#0F47F2] transition"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          width="16"
                          height="16"
                          viewBox="0 0 48 48"
                        >
                          <path
                            fill="#2196f3"
                            d="M37,45H11c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h19l10,10v29C40,43.657,38.657,45,37,45z"
                          ></path>
                          <path fill="#bbdefb" d="M40 13L30 13 30 3z"></path>
                          <path fill="#1565c0" d="M30 13L40 23 40 13z"></path>
                          <path
                            fill="#e3f2fd"
                            d="M15 23H33V25H15zM15 27H33V29H15zM15 31H33V33H15zM15 35H25V37H15z"
                          ></path>
                        </svg>
                        <span className="font-bold text-xs text-black line-clamp-1 truncate w-40">
                          {fullName.replace(/\s+/g, "_")}_resume.pdf
                        </span>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 10C2 11.8856 2 12.8284 2.58579 13.4142C3.17157 14 4.11438 14 6 14H10C11.8856 14 12.8284 14 13.4142 13.4142C14 12.8284 14 11.8856 14 10"
                          stroke="#0F47F2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8.00065 2V10.6667M8.00065 10.6667L10.6673 7.75M8.00065 10.6667L5.33398 7.75"
                          stroke="#0F47F2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Experience ── */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EXPERIENCE
                  </h4>
                  <div className="flex flex-col gap-6">
                    {experience.map((exp: any, i: number) => {
                      const startYear = exp.start_date
                        ? new Date(exp.start_date).getFullYear()
                        : "";
                      const endYear = exp.is_current
                        ? "Present"
                        : exp.end_date
                          ? new Date(exp.end_date).getFullYear()
                          : "";
                      const duration =
                        exp.start_date && (exp.end_date || exp.is_current)
                          ? Math.max(
                            1,
                            Math.round(
                              ((exp.is_current
                                ? new Date()
                                : new Date(exp.end_date)
                              ).getTime() -
                                new Date(exp.start_date).getTime()) /
                              (1000 * 60 * 60 * 24 * 365),
                            ),
                          )
                          : null;

                      return (
                        <div key={i} className="mb-6 last:mb-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-black">
                              {exp.job_title}
                            </span>
                            <span className="text-[11px] text-[#AEAEB2] font-medium">
                              {startYear} — {endYear}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-[#0F47F2] font-semibold">
                              {exp.company}
                            </div>
                            {duration && (
                              <div className="text-[11px] text-[#AEAEB2] font-medium">
                                {duration} Year{duration > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Education ── */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EDUCATION
                  </h4>
                  <div className="flex flex-col gap-6">
                    {education.length > 0 ? (
                      education.map((edu: any, i: number) => (
                        <div key={i} className="mb-6 last:mb-0">
                          <div className="font-bold text-sm text-black mb-1">
                            {edu.degree ||
                              edu.degree_name ||
                              edu.field_of_study}
                          </div>
                          <div className="text-xs font-semibold text-[#0F47F2]">
                            {edu.school_name || edu.institution}{" "}
                            {edu.end_date
                              ? `| ${new Date(edu.end_date).getFullYear()}`
                              : ""}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#AEAEB2]">
                        No education details provided.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "activity" && (
              <div className=" overflow-y-auto max-h-[500px] hide-scrollbar">
                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-6 tracking-wider">
                  PIPELINE HISTORY
                </h4>
                {loadingActivities ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                        <div className="space-y-1 flex-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-[#AEAEB2] text-center py-8">
                    No activity found
                  </p>
                ) : (
                  <div className="flex flex-col gap-8 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                    {activities.map((act, i) => (
                      <div key={i} className="relative pl-6">
                        <div
                          className={`w-2 h-2 rounded-full absolute left-0 top-1.5 z-10 
                                                    ${act.type === "stage_move" ? "bg-[#009951]" : "bg-[#0F47F2]"}`}
                        />
                        <p className="font-bold text-black text-[13px] mb-1">
                          {act.description}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-[#8E8E93]">
                          <span>{act.actor}</span>
                          <span>
                            {act.date} · {act.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">
                    NOTES
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#AEAEB2] font-semibold uppercase">Community</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notesView === "community"}
                        onChange={(e) =>
                          setNotesView(e.target.checked ? "community" : "my")
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#0F47F2]"></div>
                      <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </label>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] mb-4 pr-2 hide-scrollbar">
                  {isLoadingNotes ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F47F2]"></div>
                    </div>
                  ) : displayedNotes.length > 0 ? (
                    displayedNotes.map((note) => (
                      <div
                        key={note.noteId}
                        className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB]"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#EEF1FF] rounded-full flex items-center justify-center text-[#0F47F2]">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-black">
                                {note.postedBy?.userName || note.postedBy?.email || "Unknown"}
                              </p>
                              <p className="text-[10px] text-[#AEAEB2]">
                                {note.organisation?.orgName || "Company"}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#AEAEB2]">
                            {new Date(note.posted_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563] leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#AEAEB2] text-center py-8">
                      No {notesView === "my" ? "team" : "community"} notes found.
                    </p>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    className="w-full h-24 border border-[#E5E7EB] rounded-xl p-4 pr-12 text-sm focus:outline-none focus:border-[#0F47F2] placeholder-[#AEAEB2] resize-none"
                    placeholder={`Type your ${notesView === "my" ? "team" : "community"} note...`}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newComment.trim() || isLoadingNotes}
                    className="absolute bottom-3 right-3 p-2 bg-[#0F47F2] text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "call" && (
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[500px] hide-scrollbar pr-2 -mr-2">
                {loadingCalls ? (
                  <div className="space-y-4 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                        <div className="border border-gray-100 rounded-xl p-5 space-y-3">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 bg-gray-200 rounded w-2/3" />
                              <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : callHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="w-8 h-8 text-[#AEAEB2] mx-auto mb-3" />
                    <p className="text-sm text-[#AEAEB2]">
                      No call history found
                    </p>
                  </div>
                ) : (
                  callHistory.map((call) => {
                    const isAnswered =
                      call.call_status === "answered" ||
                      call.call_status === "completed" ||
                      (call.call_mode === "manual" && (call.duration_seconds > 0 || call.recording?.transcript));
                    const isExpanded = expandedCallId === call.id;
                    const { main: summaryBullets, nextSteps } =
                      parseSummaryBullets(call.recording?.summary || null);

                    return (
                      <div key={call.id} className="flex flex-col gap-4 mt-2">
                        {/* Date Header */}
                        <div className="flex justify-between items-center text-[#8E8E93] text-xs font-bold tracking-wider">
                          <span>{getRelativeDay(call.created_at)}</span>
                          <span className="font-normal">
                            {formatDate(call.created_at)}
                          </span>
                        </div>

                        {isAnswered ? (
                          /* ── Answered Call Card ── */
                          <div className="border border-[#E5E7EB] rounded-xl p-5">
                            <div className="flex items-center gap-4 mb-5">
                              <div className="w-10 h-10 rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-[#8E8E93]" />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#4B5563]">
                                  {call.call_type === "outgoing"
                                    ? "Outgoing"
                                    : "Incoming"}{" "}
                                  Call on {formatTime(call.created_at)}
                                </p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                                  {formatDuration(call.duration_seconds)}
                                </p>
                              </div>
                            </div>

                            {/* Audio Player */}
                            {call.recording?.recording_url && (
                              <div className="bg-[#EEF1FF] rounded-lg p-3 flex items-center gap-3 mb-6">
                                <Play className="w-4 h-4 text-[#0F47F2] fill-[#0F47F2] cursor-pointer" />
                                <audio
                                  controls
                                  src={call.recording.recording_url}
                                  className="flex-1 h-8"
                                  style={{ maxWidth: "100%" }}
                                />
                              </div>
                            )}

                            {/* Call Summary */}
                            {call.recording?.summary &&
                              call.recording.status === "completed" && (
                                <div className="mb-6">
                                  <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#4B5563] mb-3">
                                    Call Summary
                                    <div className="bg-[#0F47F2] rounded-full p-[3px]">
                                      <Sparkles className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  </h4>
                                  <ul className="flex flex-col gap-3">
                                    {summaryBullets.map((bullet, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2.5"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0F47F2] mt-1.5 shrink-0" />
                                        <span className="text-[13px] text-[#8E8E93] leading-relaxed">
                                          {bullet}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Next Steps */}
                            {nextSteps.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-[13px] font-bold text-[#4B5563] mb-3">
                                  Next Steps
                                </h4>
                                <ul className="flex flex-col gap-3">
                                  {nextSteps.map((step, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-2.5"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#0F47F2] mt-1.5 shrink-0" />
                                      <span className="text-[13px] text-[#8E8E93] leading-relaxed">
                                        {step}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Transcript Toggle */}
                            {call.recording?.transcript && (
                              <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                                <button
                                  onClick={() =>
                                    setShowTranscript(
                                      showTranscript === call.id
                                        ? null
                                        : call.id,
                                    )
                                  }
                                  className="flex items-center gap-2 text-xs font-bold text-[#0F47F2] hover:underline"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {showTranscript === call.id
                                    ? "Hide Transcript"
                                    : "View Transcript"}
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${showTranscript === call.id
                                      ? "rotate-180"
                                      : ""
                                      }`}
                                  />
                                </button>
                                {showTranscript === call.id && (
                                  <div className="mt-3 bg-[#F8FAFC] rounded-lg p-4 text-[12px] text-[#4B5563] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                                    {call.recording.transcript}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Processing indicator */}
                            {call.recording &&
                              call.recording.status === "processing" && (
                                <div className="flex items-center gap-2 text-xs text-[#F59E0B] mt-4">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B]" />
                                  Processing transcript...
                                </div>
                              )}
                          </div>
                        ) : (
                          /* ── Not Answered / Failed Call Card ── */
                          <div
                            className="border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between hover:border-[#0F47F2] transition cursor-pointer"
                            onClick={() =>
                              setExpandedCallId(isExpanded ? null : call.id)
                            }
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#FEE9E7] flex items-center justify-center shrink-0">
                                <PhoneOff className="w-4 h-4 text-[#DC2626]" />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#DC2626]">
                                  {call.call_status === "not_answered"
                                    ? "Not answered"
                                    : call.call_status === "busy"
                                      ? "Busy"
                                      : "Call failed"}
                                </p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                                  {call.duration_seconds > 0
                                    ? `Rang for ${formatDuration(call.duration_seconds)}`
                                    : `${call.call_type === "outgoing" ? "Outgoing" : "Incoming"} at ${formatTime(call.created_at)}`}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-[#4B5563] transition-transform ${isExpanded ? "rotate-180" : ""
                                }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Card */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
              SKILLS
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="bg-[#F3F5F7] text-[#4B5563] text-[11px] px-2.5 py-1 rounded-md font-semibold hover:bg-gray-200 transition cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* FEEDBACK MODAL (Archive / Move) */}
        {showFeedbackModal && pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  {pendingAction.type === "archive" && "Archive Candidate"}
                  {pendingAction.type === "unarchive" && "Unarchive Candidate"}
                  {pendingAction.type === "move" &&
                    `Move to ${pendingAction.targetStageName || "Next Stage"}`}
                </h3>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setPendingAction(null);
                    setFeedbackComment("");
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm font-medium border border-blue-100">
                  You are about to {pendingAction.type}{" "}
                  {pendingAction.applicationIds.length} candidate(s):
                  <div className="mt-2 text-blue-600 font-normal text-xs bg-white/60 p-2 rounded border border-blue-100/50">
                    {pendingAction.candidateNames?.join(", ")}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback / Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm bg-gray-50/50 focus:bg-white"
                    rows={4}
                    placeholder="Please provide a reason or feedback for this action..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    This comment will be added to the candidate's history.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setPendingAction(null);
                    setFeedbackComment("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackComment.trim()}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm
                  ${!feedbackComment.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : pendingAction.type === "archive"
                        ? "bg-red-600 hover:bg-red-700 hover:shadow-md"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                  {pendingAction.type === "archive" ? (
                    <Archive className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirm{" "}
                  {pendingAction.type === "archive" ? "Archive" : "Action"}
                </button>
              </div>
            </div>
          </div>
        )}

        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          initialJobId={jobId?.toString()}
          initialCompanyId={workspaceId?.toString()}
          initialApplicationId={applicationId?.toString()}
        />
      </div>
    </div>
  );
}
