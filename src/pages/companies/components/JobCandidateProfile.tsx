import { useState, useEffect, useMemo, useRef } from "react";
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
  Trash2 ,
  MessageSquare,
  X,
  Archive,
  Share2,
  Send,
  User,
  MessageSquareText,
  CheckCircle2,
  XCircle,
  FastForward,
  Copy,
  Loader2,
  Edit3
} from "lucide-react";
import candidateService, { Note } from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";
import apiClient from "../../../services/api";

import {
  getCandidateCallHistory,
  CallHistoryEntry,
  listRecordingEvents,
  RecordingEvent,
} from "../../../services/jobPipelineDashboardService";
import { EventForm } from "../../schedules/components/EventForm";
import QuickFitSummaryProgress from "./QuickFitSummaryProgress";
import CallScreeningRoleQuestions from "./CallScreeningRoleQuestions";

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
  candidateList?: any[];
}


let callStats=45






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
  candidateList,
}: JobCandidateProfileProps) {
  // Extract data from the raw API response
  const cand = candidate?.candidate || {};
  const contextualDetails = candidate?.contextual_details || {};
  const jobScoreObj = candidate?.job_score_obj || candidate?.job_score || contextualDetails?.job_score_obj || cand?.job_score_obj || cand?.job_score || {};
  const matchScore = jobScoreObj?.candidate_match_score || {};
  const quickFitSummary = jobScoreObj?.quick_fit_summary || [];

  // Extract screening score
  const rawScreeningScore =
    candidate?.screening_score ??
    cand?.screening_score ??
    candidate?.screening_round_score ??
    cand?.screening_round_score ??
    candidate?.screening_score_value ??
    cand?.screening_score_value ??
    candidate?.screening_round ??
    cand?.screening_round ??
    contextualDetails?.screening_score ??
    jobScoreObj?.screening_score ??
    cand?.job_score?.screening_score ??
    candidate?.job_score?.screening_score ??
    null;

  const screeningScoreVal = useMemo(() => {
    if (
      rawScreeningScore !== null &&
      rawScreeningScore !== undefined &&
      rawScreeningScore !== "" &&
      rawScreeningScore !== "--"
    ) {
      const parsed = Number(String(rawScreeningScore).replace("%", ""));
      if (!isNaN(parsed)) {
        return Math.round(parsed);
      }
    }
    return null;
  }, [rawScreeningScore]);

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
  const jobTitle = cand.job_title || cand.designation || cand.current_role || candidate?.job?.title || candidate?.job_details?.title || "";
  const location = cand.location || "";
  const profileSummary = cand.profile_summary || "";
  const experience = cand.experience || [];
  const education = cand.education || [];
  const skills = cand.skills_list || [];
  const premiumData = cand.premium_data || {};
  const noticePeriod =
    cand.notice_period_summary ||
    (cand.notice_period_days ? `${cand.notice_period_days} Days` : (cand.notice_period || "--"));
  const totalExp =
    cand.total_experience != null
      ? `${cand.total_experience} years`
      : cand.experience_years || "--";
  const currentSalary =
    cand.current_salary_lpa ||
    cand.current_salary ||
    (cand.current_ctc ? `${cand.current_ctc} LPA` : "--");
  const expectedSalary =
    cand.expected_ctc
      ? (cand.expected_ctc.toString().includes("LPA") ? cand.expected_ctc : `${cand.expected_ctc} LPA`)
      : cand.expected_ctc_lpa || "--";

  // AI Interview Report
  const aiReport =
    cand.ai_interview_report || contextualDetails?.ai_interview_report || {};
  const aiScores = aiReport?.score || {};
  const aiSummary = aiReport?.feedbacks?.overallFeedback || "";

  // ── Contact Editing State ──
  const [localFullName, setLocalFullName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [localDob, setLocalDob] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [editContactData, setEditContactData] = useState({
    name: "",
    email: "",
    dob: "",
    phone: "",
  });

  useEffect(() => {
    const c = candidate?.candidate || {};
    const pd = c.premium_data || {};
    setLocalFullName(c.full_name || "");
    setLocalEmail(pd.email || c.email || "");
    setLocalDob(c.dob || "");
    setLocalPhone(pd.phone || c.phone || "");
  }, [candidate]);

  // ── Candidate Details Editing State (curr_ctc, expec_ctc, notice_period) ──
  const [localCurrCtc, setLocalCurrCtc] = useState<string | number>("");
  const [localExpecCtc, setLocalExpecCtc] = useState<string | number>("");
  const [localNoticePeriod, setLocalNoticePeriod] = useState<string>("");
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsFormError, setDetailsFormError] = useState<string | null>(null);
  const [editDetailsData, setEditDetailsData] = useState({
    curr_ctc: "" as string | number,
    expec_ctc: "" as string | number,
    notice_period: "",
  });

  useEffect(() => {
    const c = candidate?.candidate || {};
    const currVal = c.curr_ctc ?? c.current_ctc ?? c.current_salary_lpa ?? c.current_salary ?? "";
    const expecVal = c.expec_ctc ?? c.expected_ctc ?? c.expected_ctc_lpa ?? "";
    const noticeVal = c.notice_period_summary || (c.notice_period_days != null ? `${c.notice_period_days} Days` : (c.notice_period || ""));
    
    setLocalCurrCtc(currVal);
    setLocalExpecCtc(expecVal);
    setLocalNoticePeriod(noticeVal);
  }, [candidate]);

  const openEditDetailsModal = () => {
    setEditDetailsData({
      curr_ctc: localCurrCtc,
      expec_ctc: localExpecCtc,
      notice_period: localNoticePeriod,
    });
    setDetailsFormError(null);
    setIsEditDetailsModalOpen(true);
  };

  const handleSaveCandidateDetails = async () => {
    const { curr_ctc, expec_ctc, notice_period } = editDetailsData;
    setDetailsFormError(null);

    // Validation
    if (curr_ctc !== "" && curr_ctc !== null && curr_ctc !== undefined) {
      const numVal = Number(curr_ctc);
      if (isNaN(numVal) && typeof curr_ctc === "number") {
        setDetailsFormError("Current CTC must be a valid number or string.");
        return;
      }
      if (!isNaN(numVal) && numVal < 0) {
        setDetailsFormError("Current CTC cannot be negative.");
        return;
      }
    }

    if (expec_ctc !== "" && expec_ctc !== null && expec_ctc !== undefined) {
      const numVal = Number(expec_ctc);
      if (isNaN(numVal) && typeof expec_ctc === "number") {
        setDetailsFormError("Expected CTC must be a valid number or string.");
        return;
      }
      if (!isNaN(numVal) && numVal < 0) {
        setDetailsFormError("Expected CTC cannot be negative.");
        return;
      }
    }

    if (!notice_period || !String(notice_period).trim()) {
      setDetailsFormError("Notice Period is required.");
      return;
    }

    setIsSavingDetails(true);
    const targetCandId = cand.id || candidate?.candidate_id || candidate?.id;
    try {
      // Connect to candidateService.updateCandidateDetails endpoint
      await candidateService.updateCandidateDetails(targetCandId, {
        curr_ctc,
        expec_ctc,
        notice_period: String(notice_period).trim(),
      });

      // Update local state automatically after API success
      setLocalCurrCtc(curr_ctc);
      setLocalExpecCtc(expec_ctc);
      setLocalNoticePeriod(String(notice_period).trim());
      showToast.success("Candidate details updated successfully!");
      setIsEditDetailsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to update candidate details:", err);
      const msg = err.message || "Failed to update candidate details.";
      setDetailsFormError(msg);
      showToast.error(msg);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const startEditingContact = () => {
    setEditContactData({
      name: localFullName,
      email: localEmail,
      dob: localDob,
      phone: localPhone,
    });
    setIsEditingContact(true);
  };

  const handleSaveContact = async () => {
    const { name, email, dob, phone } = editContactData;

    if (!name || !name.trim()) {
      showToast.error("Name is required");
      return;
    }
    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(name)) {
      showToast.error("Name can only contain letters and spaces");
      return;
    }

    if (!email || !email.trim()) {
      showToast.error("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error("Please enter a valid email address");
      return;
    }

    if (dob && dob.trim()) {
      const dobDate = new Date(dob);
      const today = new Date();
      if (isNaN(dobDate.getTime())) {
        showToast.error("Please enter a valid date of birth");
        return;
      }
      if (dobDate > today) {
        showToast.error("Date of birth cannot be in the future");
        return;
      }
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15 || isNaN(Number(cleanPhone))) {
        showToast.error("Please enter a valid phone number (7-15 digits)");
        return;
      }
    }

    setIsSavingContact(true);
    const toastId = showToast.loading("Saving contact details...");
    try {
      const targetCandId = cand.id || candidate.candidate_id || candidate.id;
      await candidateService.updateCandidateProfile(targetCandId, {
        name: name.trim(),
        email: email.trim(),
        dob: (dob && dob.trim()) ? dob : null,
        phone: phone || ''
      });

      setLocalFullName(name.trim());
      setLocalEmail(email.trim());
      setLocalDob(dob || '');
      setLocalPhone(phone || '');

      if (candidate?.candidate) {
        candidate.candidate.full_name = name.trim();
        candidate.candidate.dob = dob || '';
        if (candidate.candidate.premium_data) {
          candidate.candidate.premium_data.email = email.trim();
          candidate.candidate.premium_data.phone = phone || '';
        } else {
          candidate.candidate.email = email.trim();
          candidate.candidate.phone = phone || '';
        }
      }

      showToast.success("Contact details updated successfully!");
      setIsEditingContact(false);
    } catch (error: any) {
      showToast.error(error.message || "Failed to update contact details");
    } finally {
      setIsSavingContact(false);
      showToast.dismiss(toastId);
    }
  };

  // States
  const [activeTab, setActiveTab] = useState<
    "profile" | "call" | "notes" | "pipeline"
  >("profile");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // ── Call History State ────────────────────────────────────
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [recordingEvents, setRecordingEvents] = useState<Record<string, RecordingEvent>>({});
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState<number | null>(null);
  

  // ── Feedback Modal State ──
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedFeedbackOptions, setSelectedFeedbackOptions] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<{
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
    candidateNames?: string[];
  } | null>(null);
  const [showStageMenu, setShowStageMenu] = useState(false);
  // ── Menu Refs & Click Outside Listeners ──
  const stageMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stageMenuRef.current &&
        !stageMenuRef.current.contains(event.target as Node)
      ) {
        setShowStageMenu(false);
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [pendingEventAction, setPendingEventAction] = useState<any>(null);
  const [isSubmittingFeedback,setIsSubmittingFeedback] = useState(false);
  // ── Match Description Editing State ──
  const [isEditingMatchDesc, setIsEditingMatchDesc] = useState(false);
  const [editedMatchDesc, setEditedMatchDesc] = useState("");
  const [isSavingMatchDesc, setIsSavingMatchDesc] = useState(false);

  // ── Notes State ──────────────────────────────────────────
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesView, setNotesView] = useState<"my" | "community">("my");
  const [newComment, setNewComment] = useState("");
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // ── Questions Analysis State ──────────────────────────────
  const [questionsAnalysisData, setQuestionsAnalysisData] = useState<any>(null);
  const [isLoadingQuestionsAnalysis, setIsLoadingQuestionsAnalysis] = useState(false);

  const openFeedbackModal = (action: {
    type: "archive" | "unarchive" | "move";
    applicationIds: number[];
    targetStageId?: number;
    targetStageName?: string;
  }) => {
    if (action.type === "move" && action.targetStageId) {
      const targetStage = stages.find((s) => s.id === action.targetStageId);
      const interviewTypes = ["VIRTUAL_INTERVIEW", "FACE_TO_FACE_INTERVIEW", "EXTERNAL_PLATFORM_INTERVIEW"];
      if (targetStage && targetStage.custom_stage_type && interviewTypes.includes(targetStage.custom_stage_type)) {
        if (action.applicationIds.length > 1) {
          showToast.error("Cannot bulk move candidates to an interview stage. Please move one at a time.");
          return;
        }
        setPendingEventAction(action);
        setIsEventFormOpen(true);
        return;
      }
    }

    const names = [fullName];
    setPendingAction({ ...action, candidateNames: names });
    setFeedbackComment("");
    setSelectedFeedbackOptions([]);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!pendingAction || !feedbackComment.trim()) {
      showToast.error("Please enter a comment");
      return;
    }
    if (isSubmittingFeedback) return;

    const { type, applicationIds, targetStageId, targetStageName } =
      pendingAction;
    setIsSubmittingFeedback(true);

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
        const finalComment = selectedFeedbackOptions.length > 0
          ? `[${selectedFeedbackOptions.join(", ")}] ${feedbackComment.trim()}`
          : feedbackComment.trim();

        await Promise.all(
          applicationIds.map((id) =>
            apiClient.patch(`/jobs/applications/${id}/?view=kanban`, {
              current_stage: targetStageId,
              feedback: {
                subject: `Moving to ${targetStageName || "next stage"}`,
                comment: finalComment,
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
    } finally {
      setIsSubmittingFeedback(false);
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

  // ── Fetch Call History & Recording Events ─────────────────
  useEffect(() => {
    if (!cand.id) return;
    setLoadingCalls(true);
    const rawPhone = premiumData?.phone || (cand as any)?.phone || "";
    const candidatePhone = rawPhone ? (rawPhone.startsWith("91") ? rawPhone : `91${rawPhone.replace(/\D/g, "")}`) : undefined;

    Promise.all([
      getCandidateCallHistory(cand.id, candidatePhone),
      listRecordingEvents({
        candidateId: cand.id,
        jobId: jobId ? String(jobId) : undefined,
      }).catch((err) => {
        console.error("Error fetching recording events:", err);
        return [] as RecordingEvent[];
      }),
    ])
      .then(([data, eventsData]) => {
        setCallHistory(data);
        const eventsMap: Record<string, RecordingEvent> = {};
        if (Array.isArray(eventsData)) {
          eventsData.forEach((evt) => {
            if (evt.call_uuid) {
              eventsMap[evt.call_uuid] = evt;
            }
          });
        }
        setRecordingEvents(eventsMap);
      })
      .catch((err) => {
        console.error("Error fetching call history:", err);
        setCallHistory([]);
      })
      .finally(() => setLoadingCalls(false));
  }, [cand.id, activeTab, jobId]);

  // ── Fetch Questions Analysis ──────────────────────────────
  useEffect(() => {
    if (!cand.id || !jobId) return;
    setIsLoadingQuestionsAnalysis(true);
    candidateService
      .getCandidateQuestionsAnalysis(cand.id, jobId)
      .then((data) => setQuestionsAnalysisData(data))
      .catch((err) => {
        console.error("Error fetching questions analysis:", err);
      })
      .finally(() => setIsLoadingQuestionsAnalysis(false));
  }, [cand.id, jobId]);

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
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCallTimingDetails = (call: CallHistoryEntry) => {
    const evt = call.call_uuid ? recordingEvents[call.call_uuid] : null;

    // Start Time
    const startIso = evt?.started_at;
    const startTime = startIso ? formatTime(startIso) : "";

    // End Time
    const endIso = evt?.ended_at;
    const endTime = endIso ? formatTime(endIso) : "";

    // Duration
    let durSec = call.duration_seconds || evt?.duration_seconds;
    if (!durSec && evt?.call_duration) {
      durSec = typeof evt.call_duration === "number" ? evt.call_duration : parseInt(String(evt.call_duration), 10);
    }
    if (!durSec && startIso && endIso) {
      const s = new Date(startIso).getTime();
      const e = new Date(endIso).getTime();
      if (!isNaN(s) && !isNaN(e) && e > s) {
        durSec = Math.round((e - s) / 1000);
      }
    }

    const duration = durSec && durSec > 0 ? formatDuration(durSec) : "";

    return {
      startTime,
      endTime,
      duration,
      startIso,
      endIso,
    };
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

  const getScoreColor = (scoreVal: number): string => {
    const score = scoreVal <= 10 && scoreVal > 0 ? scoreVal * 10 : scoreVal;
    if (score >= 70) return "#10B981"; // Green (70 to 100)
    if (score >= 50) return "#F59E0B"; // Yellow (50 to 70)
    return "#EF4444"; // Red (below 50)
  };

  const getScoreWidth = (score: number): string => {
    if (score <= 10) return `${score * 10}%`;
    return `${score}%`;
  };

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

  // ── Skill Assessment Items (derived from questions analysis) ──

  const skillAssessmentItems = useMemo(() => {
    if (!questionsAnalysisData?.questions || questionsAnalysisData.questions.length === 0) {
      return [];
    }

    let totalAccuracy = 0, validAccuracy = 0;
    let totalClarity = 0, validClarity = 0;
    let totalCompleteness = 0, validCompleteness = 0;
    let totalDepth = 0, validDepth = 0;

    questionsAnalysisData.questions.forEach((q: any) => {
      const a = q.analysis;
      if (a) {
        if (typeof a.ai_accuracy_score === 'number') { totalAccuracy += a.ai_accuracy_score; validAccuracy++; }
        if (typeof a.ai_clarity_score === 'number') { totalClarity += a.ai_clarity_score; validClarity++; }
        if (typeof a.ai_completeness_score === 'number') { totalCompleteness += a.ai_completeness_score; validCompleteness++; }
        if (typeof a.ai_depth_score === 'number') { totalDepth += a.ai_depth_score; validDepth++; }
      }
    });

    const getSkillLabel = (score: number): { description: string, color: "green" | "blue" | "orange" | "red" } => {
      if (score >= 80) return { description: "Excellent", color: "green" };
      if (score >= 70) return { description: "Good", color: "blue" };
      if (score >= 60) return { description: "Average", color: "orange" };
      return { description: "Needs Improvement", color: "red" };
    };

    const items: { label: string, score: number, description: string, color: "green" | "blue" | "orange" | "red" }[] = [];
    if (validAccuracy > 0) {
      const score = Math.round(totalAccuracy / validAccuracy);
      const { description, color } = getSkillLabel(score);
      items.push({ label: "Accuracy", score, description, color });
    }
    if (validClarity > 0) {
      const score = Math.round(totalClarity / validClarity);
      const { description, color } = getSkillLabel(score);
      items.push({ label: "Clarity", score, description, color });
    }
    if (validCompleteness > 0) {
      const score = Math.round(totalCompleteness / validCompleteness);
      const { description, color } = getSkillLabel(score);
      items.push({ label: "Completeness", score, description, color });
    }
    if (validDepth > 0) {
      const score = Math.round(totalDepth / validDepth);
      const { description, color } = getSkillLabel(score);
      items.push({ label: "Depth", score, description, color });
    }

    return items;
  }, [questionsAnalysisData]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      showToast.error("Failed to copy text");
    }
  }


  const matchedSkills = useMemo(() => {
    return (quickFitSummary || []).filter(
      (item: any) => item.color === "green" || item.status === "matched"
    );
  }, [quickFitSummary]);

  const partialSkills = useMemo(() => {
    return (quickFitSummary || []).filter(
      (item: any) =>
        item.color === "yellow" ||
        item.color === "amber" ||
        item.status === "partial"
    );
  }, [quickFitSummary]);

  const missingSkills = useMemo(() => {
    return (quickFitSummary || []).filter(
      (item: any) => item.color === "red" || item.status === "missing"
    );
  }, [quickFitSummary]);

  const matchedCount = matchedSkills.length;
  const partialCount = partialSkills.length;
  const missingCount = missingSkills.length;

  // ── Dynamic Tab Counts (API-driven) ──────────────────────
  const callsCount = candidate?.calls_count ?? candidate?.call_history_count ?? callHistory.length;
  const notesCount = candidate?.notes_count ?? candidate?.notes?.length ?? displayedNotes.length;
  const pipelineCount = candidate?.pipeline_history_count ?? candidate?.stage_movements_count ?? candidate?.activities_count ?? activities.length;

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

  return (
    <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex flex-col xl:flex-row p-6 gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {/* ── Main Candidate Card ── */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <button
                    onClick={goBack}
                    aria-label="Go back"
                    className="text-[#8E8E93] hover:text-black transition-colors rounded-full p-1 hover:bg-[#F3F5F7]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-2xl font-semibold text-black">
                    {fullName}
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0F47F2] border border-blue-100">
                    Stage: {currentStageName}
                  </span>
                </div>
                <div className="ml-10">
                  <p className="text-sm text-[#0F47F2] mb-3">
                    {headline || jobTitle}{" "}
                    {headline && jobTitle ? ` • ${jobTitle}` : ""}
                  </p>

                  {/* CHANGE 2: Labeled facts row */}
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-3 mb-5 border-y border-gray-100">
                    <div>
                      <div className="text-xs text-[#8E8E93] font-medium mb-0.5">Experience</div>
                      <div className="text-sm font-bold text-black">{totalExp || "--"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8E8E93] font-medium mb-0.5">Location</div>
                      <div className="text-sm font-bold text-black">{location || "--"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8E8E93] font-medium mb-0.5">Current CTC</div>
                      <div className="text-sm font-bold text-black">
                        {localCurrCtc ? (String(localCurrCtc).includes("LPA") ? localCurrCtc : `${localCurrCtc} LPA`) : "--"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8E8E93] font-medium mb-0.5">Expected CTC</div>
                      <div className="text-sm font-bold text-black">
                        {localExpecCtc ? (String(localExpecCtc).includes("LPA") ? localExpecCtc : `${localExpecCtc} LPA`) : "--"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#8E8E93] font-medium mb-0.5">Notice period</div>
                      <div className="text-sm font-bold text-black">{localNoticePeriod || "--"}</div>
                    </div>
                  </div>

                  {/* CHANGE 1: Header card actions */}
                  <div className="flex flex-wrap items-center gap-3 relative mt-6">
                    {/* Call (filled blue primary button, 44px high, slightly wider) */}
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
                          experience: cand.total_experience != null ? cand.total_experience : "--",
                          currentCtc: cand.current_salary_lpa ? `${cand.current_salary_lpa}` : "--",
                          expectedCtc: cand.expected_ctc ? `${cand.expected_ctc} LPA` : "--",
                          noticePeriod: cand.notice_period_days != null ? `${cand.notice_period_days} Days` : "--",
                          location: cand.location || "--",
                          resumeUrl: premiumData.resume_url || cand.resume_url || "",
                          matchScore: matchScore?.score || cand.job_score?.candidate_match_score?.score || null,
                        };
                        const candidateIds = candidateList?.map(c => c?.candidate?.id || c?.id).filter(Boolean) || [];
                        sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({
                          candidate: callData,
                          candidateList: candidateIds.length > 0 ? candidateIds : [cand.id]
                        }));
                        window.location.href = `/call/${cand.id}/${jobId || 0}?mode=manual`;
                      }}
                      className="min-h-[44px] px-6 bg-[#0F47F2] text-white rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition shadow-xs text-sm"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.33398 1.3335C9.33398 1.3335 10.8007 1.46683 12.6673 3.3335C14.534 5.20016 14.6673 6.66683 14.6673 6.66683"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.4707 3.69043C9.4707 3.69043 10.1307 3.879 11.1206 4.86894C12.1106 5.8589 12.2992 6.51886 12.2992 6.51886"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6.69108 3.54395L7.12375 4.31924C7.51422 5.01889 7.35748 5.93672 6.74248 6.5517C6.74248 6.5517 5.9966 7.2977 7.34902 8.65017C8.70102 10.0022 9.44748 9.2567 9.44748 9.2567C10.0625 8.6417 10.9803 8.48497 11.68 8.87544L12.4552 9.3081C13.5117 9.8977 13.6365 11.3793 12.7079 12.308C12.1499 12.866 11.4663 13.3002 10.7106 13.3288C9.43855 13.377 7.27822 13.0551 5.11115 10.888C2.9441 8.72097 2.62216 6.56065 2.67038 5.28856C2.69903 4.5329 3.13322 3.84932 3.69122 3.29132C4.61986 2.36269 6.10146 2.48746 6.69108 3.54395Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Call
                    </button>

                    {/* Edit (outlined blue secondary button, next to Call) */}
                    <button
                      onClick={openEditDetailsModal}
                      className="min-h-[44px] px-5 border border-[#0F47F2] text-[#0F47F2] bg-white rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[#F3F5F7] transition text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>

                    {cand.resume_url && (
                      <button
                        onClick={() => window.open(cand.resume_url, "_blank")}
                        title="Download Resume"
                        aria-label="Download Resume"
                        className="min-h-[44px] w-11 h-11 border border-gray-300 text-gray-700 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
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
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.00065 2V10.6667M8.00065 10.6667L10.6673 7.75M8.00065 10.6667L5.33398 7.75"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Thin Divider */}
                    <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                    {/* Move to Stage (neutral outlined button with stage selection dropdown) */}
                    <div className="relative" ref={stageMenuRef}>
                      <button
                        onClick={() => setShowStageMenu(!showStageMenu)}
                        className="min-h-[44px] px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                      >
                        Move to Stage
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      </button>

                      {showStageMenu && (
                        <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
                          {stages
                            .filter(
                              (s) =>
                                s.slug !== "archives" &&
                                s.slug !== currentStageSlug
                            )
                            .map((stage) => (
                              <button
                                key={stage.id}
                                onClick={() => {
                                  setShowStageMenu(false);
                                  openFeedbackModal({
                                    type: "move",
                                    applicationIds: [applicationId],
                                    targetStageId: stage.id,
                                    targetStageName: stage.name,
                                  });
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0F47F2] transition font-medium"
                              >
                                {stage.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Schedule Interview (neutral outlined button) */}
                    <button
                      onClick={() => setIsEventFormOpen(true)}
                      className="min-h-[44px] px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition flex items-center gap-1.5"
                    >
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Schedule Interview
                    </button>

                    {/* "⋯" icon menu (aria-label "More actions") */}
                    <div className="relative" ref={moreMenuRef}>
                      <button
                        onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                        aria-label="More actions"
                        className="min-h-[44px] w-11 h-11 border border-gray-300 text-gray-700 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition text-lg font-bold"
                      >
                        ⋯
                      </button>
                      {isMoreMenuOpen && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                          <button
                            onClick={() => {
                              setIsMoreMenuOpen(false);
                              openFeedbackModal({
                                type: "archive",
                                applicationIds: [applicationId],
                              });
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            Move to Archive
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-start shrink-0">
                <div className="flex items-center gap-2 mb-4 self-end w-full justify-end">
                  {currentIndex !== undefined &&
                    totalCandidates !== undefined && (
                      <span className="text-xs text-[#AEAEB2] font-bold mr-1">
                        {currentIndex + 1} / {totalCandidates}
                      </span>
                    )}
                  <button
                    onClick={onNavigatePrev}
                    disabled={!onNavigatePrev}
                    className={`px-4 py-2 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigatePrev ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
                  >
                    &laquo; Prev
                  </button>
                  <button
                    onClick={onNavigateNext}
                    disabled={!onNavigateNext}
                    className={`px-4 py-2 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigateNext ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
                  >
                    Next &raquo;
                  </button>
                </div>

                <div className="flex items-start gap-6 sm:gap-8">
                  {/* Match Score Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <svg viewBox="0 0 36 36" className="w-20 h-20">
                        <path
                          className="text-gray-200"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        />
                        <path
                          transform="rotate(-90 18 18)"
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
                        <span className="text-xl font-normal -mt-1">
                          {matchScore.score || "0%"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8E8E93] text-center uppercase tracking-wider font-normal mb-1">
                      Match Score
                    </span>
                    <span className="text-xs text-gray-500 text-center font-medium mt-0.5">
                      {matchedCount} match · {partialCount} partial · {missingCount} missing
                    </span>
                  </div>

                  {/* Screening Score Circle */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <svg viewBox="0 0 36 36" className="w-20 h-20">
                        <path
                          className="text-gray-200"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        />
                        <path
                          transform="rotate(-90 18 18)"
                          style={{
                            color: getScoreColor(screeningScoreVal ?? 0),
                          }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeDasharray={`${screeningScoreVal ?? 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-normal -mt-1">
                          {screeningScoreVal !== null ? `${screeningScoreVal}%` : "--%"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#8E8E93] text-center uppercase tracking-wider font-normal mb-1">
                      Screening Score
                    </span>
                    <span className="text-xs text-gray-500 text-center font-medium mt-0.5">
                      {screeningScoreVal !== null ? "Screening Round" : "Not Screened"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status tags row */}
          {statusTags.length > 0 && (
            <div className="bg-[#F8FAFC] px-6 py-3 text-xs font-normal border-t border-[#E5E7EB] flex gap-2 flex-wrap rounded-b-xl">
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

        {/* 2. PROFILE SUMMARY & MATCH REASONING CARD (CHANGE 4) */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-sm uppercase font-bold text-black tracking-wider mb-4">
            PROFILE SUMMARY
          </h3>
          <p className="text-sm leading-relaxed text-[#4B5563] mb-6">
            {profileSummary || "No summary available."}
          </p>

          <div className="h-[1px] bg-[#E5E7EB] w-full my-6" />

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase font-bold text-black tracking-wider">
              MATCH REASONING
            </h3>
            {!isEditingMatchDesc && (
              <button
                onClick={() => setIsEditingMatchDesc(true)}
                className="text-[#0F47F2] text-xs font-bold hover:underline min-h-[44px] flex items-center"
              >
                Edit
              </button>
            )}
          </div>

          {!isEditingMatchDesc ? (
            <p className="text-sm leading-relaxed text-[#4B5563]">
              {matchScore.description || "No match reasoning available."}
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
                  className="px-4 py-2 text-xs font-bold text-[#8E8E93] hover:text-[#4B5563] transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMatchDescription}
                  disabled={isSavingMatchDesc}
                  className="px-6 py-2 bg-[#0F47F2] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm min-h-[44px]"
                >
                  {isSavingMatchDesc ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. SIDE-BY-SIDE MATCHING & NOT MATCHING CARDS (CHANGE 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matching Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm uppercase font-bold text-black tracking-wider mb-4 flex items-center justify-between">
              <span>Matching</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {matchedCount} skills
              </span>
            </h3>
            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((item: any, i: number) => (
                  <span
                    key={i}
                    title={item.evidence}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EBFFEE] text-[#009951] border border-[#DEF7EC]"
                  >
                    <span>✓</span>
                    <span>{item.badge}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No matching skills identified.</p>
            )}
          </div>

          {/* Not Matching Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase font-bold text-black tracking-wider">
                  Not matching
                </h3>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  {partialCount + missingCount} skills
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                ✕ missing · ◐ partial
              </p>
            </div>
            {partialSkills.length > 0 || missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partialSkills.map((item: any, i: number) => (
                  <span
                    key={`partial-${i}`}
                    title={item.evidence}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFF7D6] text-[#92400E] border border-[#FDE047]"
                  >
                    <span>◐</span>
                    <span>{item.badge}</span>
                  </span>
                ))}
                {missingSkills.map((item: any, i: number) => (
                  <span
                    key={`missing-${i}`}
                    title={item.evidence}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FEE9E7] text-[#DC2626] border border-[#FECACA]"
                  >
                    <span>✕</span>
                    <span>{item.badge}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No gap or missing skills identified.</p>
            )}
          </div>
        </div>

        {/* 4. CALL SCREENING QUESTIONS & ANALYSIS */}
        <CallScreeningRoleQuestions
          isLoading={isLoadingQuestionsAnalysis}
          stats={{
            convinced: questionsAnalysisData?.questions?.filter((q: any) => q.analysis?.status === "convinced").length || 0,
            notConvinced: questionsAnalysisData?.questions?.filter((q: any) => q.analysis?.status === "not_convinced").length || 0,
            skipped: questionsAnalysisData?.questions?.filter((q: any) => q.analysis?.status === "skipped").length || 0,
            totalAnswered: questionsAnalysisData?.questions?.filter((q: any) => q.analysis?.status === "convinced" || q.analysis?.status === "not_convinced").length || 0,
            totalQuestions: questionsAnalysisData?.questions?.length || 0,
          }}
          questions={questionsAnalysisData?.questions?.map((q: any, i: number) => ({
            id: i,
            question: q.question_text,
            lookFor: q.analysis?.ideal_answer_concept,
            status: q.analysis?.status,
            aiScore: q.analysis?.ai_score_percentage,
            aiAnswerSummary: q.analysis?.ai_evaluation_summary,
          })) || []}
          followUpSuggestions={[]}
        />

        {/* 5. GAPS / RISK ACCORDION (CHANGE 4) */}
        <details className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
          <summary className="flex items-center justify-between p-6 cursor-pointer select-none font-semibold text-sm text-black uppercase tracking-wider list-none min-h-[44px]">
            <div className="flex items-center gap-2">
              <span>GAPS / RISK</span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full lowercase">
                {(jobScoreObj.gaps_risks || []).length} flagged
              </span>
            </div>
            <svg
              className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex flex-col gap-3">
            {(jobScoreObj.gaps_risks || []).length > 0 ? (
              jobScoreObj.gaps_risks.map((gap: string, i: number) => (
                <div
                  key={i}
                  className="bg-[#F3F5F7] p-4 rounded-lg text-sm text-[#4B5563] leading-relaxed"
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
        </details>

        {aiSummary && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-sm uppercase font-normal text-black tracking-wider mb-6">
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

      <div className="w-full xl:w-[380px] flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB]">
          {/* Right Panel Tabs Header */}
          <div className="grid grid-cols-4 border-b border-[#E5E7EB] bg-white rounded-t-xl">
            {(
              [
                { id: "profile", label: "Profile", count: null },
                { id: "call", label: "Call", count: callsCount },
                { id: "notes", label: "Notes", count: notesCount },
                { id: "pipeline", label: "Pipeline", count: pipelineCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-medium transition-colors border-b-[3px] text-center min-h-[44px] flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? "border-[#0F47F2] text-[#0F47F2] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-[#0F47F2]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 flex flex-col gap-6 text-sm">
            {/* ── TAB 1: PROFILE ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Contact Info (Omit duplicate Name and Location from Contact Info) */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">
                      CONTACT INFO
                    </h4>
                    {!isEditingContact && (
                      <button
                        onClick={startEditingContact}
                        className="text-[10px] uppercase font-bold text-[#0F47F2] hover:underline min-h-[44px] flex items-center"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">D.O.B</span>
                      {isEditingContact ? (
                        <input
                          type="date"
                          value={editContactData.dob}
                          onChange={(e) => setEditContactData(prev => ({ ...prev, dob: e.target.value }))}
                          className="px-2 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0F47F2] focus:border-[#0F47F2] outline-none text-black font-medium text-right w-2/3 bg-white"
                        />
                      ) : (
                        <span className="font-medium text-black">{localDob || "--"}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm text-black">
                      <span className="text-[#AEAEB2] font-medium">Email</span>
                      {isEditingContact ? (
                        <input
                          type="email"
                          value={editContactData.email}
                          onChange={(e) => setEditContactData(prev => ({ ...prev, email: e.target.value }))}
                          className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0F47F2] focus:border-[#0F47F2] outline-none text-black font-medium text-right w-2/3 bg-white"
                        />
                      ) : (
                        <div className="flex items-center gap-2 ml-4">
                          <span
                            className="truncate text-[#0F47F2] font-medium cursor-pointer"
                            onClick={() =>
                              localEmail &&
                              window.open(`mailto:${localEmail}`)
                            }
                          >
                            {localEmail || "--"}
                          </span>

                          {localEmail && (
                            <Copy
                              size={16}
                              className="cursor-pointer text-[#0F47F2]"
                              onClick={() => handleCopy(localEmail)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Phone</span>
                      {isEditingContact ? (
                        <input
                          type="tel"
                          value={editContactData.phone}
                          onChange={(e) => setEditContactData(prev => ({ ...prev, phone: e.target.value }))}
                          className="px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#0F47F2] focus:border-[#0F47F2] outline-none text-black font-medium text-right w-2/3 bg-white"
                          placeholder="Phone number"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[#0F47F2] font-medium cursor-pointer"
                            onClick={() =>
                              localPhone &&
                              window.open(`tel:${localPhone}`)
                            }
                          >
                            {localPhone || "--"}
                          </span>

                          {localPhone && (
                            <Copy
                              size={16}
                              className="cursor-pointer text-[#0F47F2]"
                              onClick={() =>
                                handleCopy(localPhone)
                              }
                            />
                          )}
                        </div>
                      )}
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
                              <g clipPath="url(#clip0_465_8585)">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M10 0C15.523 0 20 4.58993 20 10.2529C20 14.7819 17.138 18.624 13.167 19.981C12.66 20.082 12.48 19.7618 12.48 19.4888C12.48 19.1508 12.492 18.0468 12.492 16.6748C12.492 15.7188 12.172 15.0949 11.813 14.7769C14.04 14.5229 16.38 13.6558 16.38 9.71777C16.38 8.59777 15.992 7.68382 15.35 6.96582C15.454 6.70682 15.797 5.66395 15.252 4.25195C15.252 4.25195 14.414 3.97722 12.505 5.30322C11.706 5.07622 10.85 4.96201 10 4.95801C9.15 4.96201 8.295 5.07622 7.497 5.30322C5.586 3.97722 4.746 4.25195 4.746 4.25195C4.203 5.66395 4.546 6.70682 4.649 6.96582C4.01 7.68382 3.619 8.59777 3.619 9.71777C3.619 13.6458 5.954 14.5262 8.175 14.7852C7.889 15.0412 7.63 15.4928 7.54 16.1558C6.97 16.4178 5.522 16.8712 4.63 15.3042C4.63 15.3042 4.101 14.3191 3.097 14.2471C3.097 14.2471 2.122 14.2341 3.029 14.8701C3.029 14.8701 3.684 15.1851 4.139 16.3701C4.139 16.3701 4.726 18.2001 7.508 17.5801C7.513 18.4371 7.522 19.2448 7.522 19.4888C7.522 19.7598 7.338 20.0769 6.839 19.9819C2.865 18.6269 0 14.7829 0 10.2529C0 4.58993 4.478 0 10 0Z"
                                  fill="#FF8D28"
                                />
                              </g>
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
                              <g clipPath="url(#clip0_465_8596)">
                                <path
                                  d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM6.65 12.77C6.54 13.07 6.25 13.26 5.95 13.26C5.86 13.26 5.78 13.25 5.69 13.21C4.88 12.91 4.2 12.32 3.77 11.55C2.77 9.75 3.39 7.4 5.14 6.31L7.48 4.86C8.34 4.33 9.35 4.17 10.31 4.42C11.27 4.67 12.08 5.3 12.57 6.18C13.57 7.98 12.95 10.33 11.2 11.42L10.94 11.61C10.6 11.85 10.13 11.77 9.89 11.44C9.65 11.1 9.73 10.63 10.06 10.39L10.37 10.17C11.49 9.47 11.87 8.02 11.26 6.91C10.97 6.39 10.5 6.02 9.94 5.87C9.38 5.72 8.79 5.81 8.28 6.13L5.92 7.59C4.84 8.26 4.46 9.71 5.07 10.83C5.32 11.28 5.72 11.63 6.2 11.81C6.59 11.95 6.79 12.38 6.65 12.77ZM14.92 13.65L12.58 15.1C11.99 15.47 11.33 15.65 10.66 15.65C10.36 15.65 10.05 15.61 9.75 15.53C8.79 15.28 7.98 14.65 7.5 13.77C6.5 11.97 7.12 9.62 8.87 8.53L9.13 8.34C9.47 8.1 9.94 8.18 10.18 8.51C10.42 8.85 10.34 9.32 10.01 9.56L9.7 9.78C8.58 10.48 8.2 11.93 8.81 13.04C9.1 13.56 9.57 13.93 10.13 14.08C10.69 14.23 11.28 14.14 11.79 13.82L14.13 12.37C15.21 11.7 15.59 10.25 14.98 9.13C14.73 8.68 14.33 8.33 13.85 8.15C13.46 8.01 13.26 7.58 13.41 7.19C13.55 6.8 13.99 6.6 14.37 6.75C15.18 7.05 15.86 7.64 16.29 8.41C17.28 10.21 16.67 12.56 14.92 13.65Z"
                                  fill="#4B5563"
                                />
                              </g>
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
                              width="20"
                              height="20"
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
                      </div>
                    </div>
                    {isEditingContact && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={handleSaveContact}
                          disabled={isSavingContact}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#0F47F2] hover:bg-[#0F47F2]/90 text-white rounded-md transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 min-h-[36px]"
                        >
                          {isSavingContact && (
                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
                          )}
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingContact(false)}
                          disabled={isSavingContact}
                          className="px-3 py-1.5 text-xs font-semibold border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* Resume Section */}
                {(cand.resume_url || premiumData.resume_url) && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                      RESUME
                    </h4>
                    <a
                      href={cand.resume_url || premiumData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[#E5E7EB] rounded-lg p-3 bg-white flex items-center justify-between group cursor-pointer hover:border-[#0F47F2] transition min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.00065 2V10.6667M8.00065 10.6667L10.6673 7.75M8.00065 10.6667L5.33398 7.75"
                          stroke="#0F47F2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* Experience Section */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EXPERIENCE
                  </h4>
                  <div className="flex flex-col gap-4">
                    {experience.length > 0 ? (
                      experience.map((exp: any, i: number) => {
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
                          <div key={i} className="mb-2 last:mb-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm text-black">
                                {exp.job_title}
                              </span>
                              <span className="text-xs text-[#AEAEB2] font-medium">
                                {startYear} — {endYear}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <div className="text-[#0F47F2] font-medium">
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
                      })
                    ) : (
                      <p className="text-xs text-[#AEAEB2]">No experience details provided.</p>
                    )}
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* Education Section */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EDUCATION
                  </h4>
                  <div className="flex flex-col gap-4">
                    {education.length > 0 ? (
                      education.map((edu: any, i: number) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <div className="font-semibold text-sm text-black mb-1">
                            {edu.degree || edu.degree_name || edu.field_of_study}
                          </div>
                          <div className="text-xs font-medium text-[#0F47F2]">
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

                {/* Skills Section */}
                {skills.length > 0 && (
                  <>
                    <div className="h-[1px] bg-[#E5E7EB] w-full" />
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                        SKILLS
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="bg-[#F3F5F7] text-[#4B5563] text-xs px-2.5 py-1 rounded-md font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── TAB 2: CALL ── */}
            {activeTab === "call" && (
              <div className="flex flex-col gap-6">
                {/* 1. CALL SUMMARY */}
                <div>
                  <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                    CALL SUMMARY
                  </h4>
                  {callHistory.some((c) => c.recording?.summary) ? (
                    <div className="space-y-3">
                      {callHistory
                        .filter((c) => c.recording?.summary)
                        .map((call) => {
                          const { main: summaryBullets } = parseSummaryBullets(
                            call.recording?.summary || null
                          );
                          return (
                            <div
                              key={call.id}
                              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs"
                            >
                              <p className="text-[11px] text-[#8E8E93] mb-2 font-medium">
                                {formatDate(call.created_at)} · {formatTime(call.created_at)}
                              </p>
                              <ul className="space-y-1.5">
                                {summaryBullets.map((bullet, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-[#4B5563] flex items-start gap-2"
                                  >
                                    <span className="text-[#0F47F2] font-bold">•</span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#E5E7EB] rounded-xl p-4 bg-white text-xs text-[#8E8E93]">
                      No call yet. The summary appears here after the first call.
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* 2. RECORDINGS */}
                <div>
                  <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                    RECORDINGS
                  </h4>
                  {callHistory.some((c) => c.recording?.recording_url || (c as any).recording_url) ? (
                    <div className="space-y-3">
                      {callHistory
                        .filter((c) => c.recording?.recording_url || (c as any).recording_url)
                        .map((call) => {
                          const recUrl = call.recording?.recording_url || (call as any).recording_url;
                          const timing = getCallTimingDetails(call);
                          return (
                            <div
                              key={call.id}
                              className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-[#4B5563]">
                                    Call Recording ({formatDate(call.created_at)})
                                  </span>
                                  {timing.startTime && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                                      <svg className="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 11 0 0118 0z" />
                                      </svg>
                                      {timing.endTime ? `${timing.startTime} – ${timing.endTime}` : timing.startTime}
                                    </span>
                                  )}
                                </div>
                                {timing.duration && (
                                  <span className="text-[11px] font-semibold text-[#0F47F2] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    Duration: {timing.duration}
                                  </span>
                                )}
                              </div>
                              <audio
                                controls
                                src={recUrl}
                                className="w-full h-8"
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#E5E7EB] rounded-xl p-4 bg-white text-xs text-[#8E8E93]">
                      No calls made
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* 3. TRANSCRIPTION */}
                <div>
                  <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">
                    TRANSCRIPTION
                  </h4>
                  {callHistory.some((c) => c.recording?.transcript || (c as any).transcript || c.recording?.transcript_time_log || c.recording?.timestamps) ? (
                    <div className="space-y-3">
                      {callHistory
                        .filter((c) => c.recording?.transcript || (c as any).transcript || c.recording?.transcript_time_log || c.recording?.timestamps)
                        .map((call) => {
                          const rec = call.recording || (call as any);
                          const timeLog = rec?.transcript_time_log || rec?.timestamps || (call as any).transcript_time_log || (call as any).timestamps;
                          const transcriptText = rec?.transcript || (call as any).transcript;
                          const timing = getCallTimingDetails(call);

                          return (
                            <div
                              key={call.id}
                              className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-[#4B5563]">
                                    Transcript ({formatDate(call.created_at)})
                                  </p>
                                  {timing.startTime && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                                      <svg className="w-3 h-3 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 11 0 0118 0z" />
                                      </svg>
                                      {timing.endTime ? `${timing.startTime} – ${timing.endTime}` : timing.startTime}
                                    </span>
                                  )}
                                </div>
                                {timing.duration && (
                                  <span className="text-[11px] font-semibold text-[#0F47F2] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                    Duration: {timing.duration}
                                  </span>
                                )}
                              </div>
                              <div className="bg-[#F8FAFC] rounded-lg p-3 text-xs text-[#4B5563] leading-relaxed max-h-48 overflow-y-auto">
                                {Array.isArray(timeLog) && timeLog.length > 0 ? (
                                  <div className="space-y-2">
                                    {timeLog.map((item: any, idx: number) => {
                                      let timeStr = item.timestamp || item.time || item.time_log || (typeof item === "string" ? null : "");
                                      if (timeStr && typeof timeStr === "string" && timeStr.includes("T")) {
                                        timeStr = formatTime(timeStr);
                                      }
                                      const textStr = typeof item === "string" ? item : item.text || item.content || item.statement || "";
                                      const speaker = item.speaker || item.role;
                                      return (
                                        <div key={idx} className="flex items-start gap-2">
                                          {timeStr && (
                                            <span className="shrink-0 px-1.5 py-0.5 rounded bg-blue-50 text-[#0F47F2] font-mono text-[10px] font-bold border border-blue-100 mt-0.5">
                                              {timeStr}
                                            </span>
                                          )}
                                          <span className="flex-1 text-xs text-[#4B5563] leading-relaxed">
                                            {speaker && <strong className="text-gray-700 font-semibold mr-1">{speaker}:</strong>}
                                            {textStr}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : typeof timeLog === "string" && timeLog.trim() ? (
                                  <div className="whitespace-pre-wrap font-sans text-xs text-[#4B5563] leading-relaxed">
                                    {timeLog}
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-wrap font-sans text-xs text-[#4B5563] leading-relaxed">
                                    {transcriptText || "No transcript available."}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#E5E7EB] rounded-xl p-4 bg-white text-xs text-[#8E8E93]">
                      No transcript yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 3: NOTES ── */}
            {activeTab === "notes" && (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">
                    CANDIDATE NOTES
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#AEAEB2] font-normal uppercase">Community</span>
                    <label className="relative inline-flex items-center cursor-pointer min-h-[36px]">
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

                <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] mb-4 pr-1 hide-scrollbar">
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
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-[#EEF1FF] rounded-full flex items-center justify-center text-[#0F47F2]">
                              <User className="w-3.5 h-3.5" />
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
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm font-medium text-gray-500">
                        No notes yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Note input form */}
                <div className="space-y-3">
                  <textarea
                    aria-label="Candidate note"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    className="w-full h-24 border border-[#E5E7EB] rounded-xl p-3.5 text-sm focus:outline-none focus:border-[#0F47F2] placeholder-[#AEAEB2] resize-none"
                    placeholder={`Write a ${notesView === "my" ? "team" : "community"} note...`}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddNote}
                      disabled={!newComment.trim() || isLoadingNotes}
                      className="px-5 py-2.5 bg-[#0F47F2] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 min-h-[44px] flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Save note
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: PIPELINE ── */}
            {activeTab === "pipeline" && (
              <div className="space-y-6">
                {/* Pipeline Stages Stepper */}
                <div>
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-4">
                    PIPELINE STAGES
                  </h4>
                  <div className="flex flex-col gap-0 relative">
                    {stages
                      .filter((s) => s.slug !== "archives")
                      .map((stage, i, filteredStages) => {
                        const currentStageIndex = stages.findIndex(
                          (s) => s.slug === currentStageSlug,
                        );
                        const isCompleted = i < currentStageIndex;
                        const isActive = i === currentStageIndex;

                        return (
                          <div key={stage.id} className="flex items-start gap-3.5 relative pb-6 last:pb-0">
                            {/* Vertical Connector Line behind step icons */}
                            {i < filteredStages.length - 1 && (
                              <div
                                className={`absolute left-[13px] top-7 bottom-0 w-[2px] ${
                                  isCompleted ? "bg-[#10B981]" : "bg-gray-200"
                                }`}
                              />
                            )}

                            {/* Circle icon */}
                            {isCompleted ? (
                              <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-xs">
                                ✓
                              </div>
                            ) : isActive ? (
                              <div className="w-7 h-7 rounded-full border-2 border-[#0F47F2] bg-white flex items-center justify-center text-xs font-bold text-[#0F47F2] shrink-0 z-10 shadow-xs">
                                {i + 1}
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-medium shrink-0 z-10">
                                {i + 1}
                              </div>
                            )}

                            {/* Stage Label */}
                            <div className="pt-0.5">
                              <p
                                className={`text-sm ${
                                  isActive
                                    ? "font-bold text-[#0F47F2]"
                                    : isCompleted
                                      ? "font-semibold text-[#10B981]"
                                      : "font-normal text-gray-500"
                                }`}
                              >
                                {stage.name}
                              </p>
                              {isActive && (
                                <span className="inline-block mt-1 text-[10px] font-semibold bg-blue-50 text-[#0F47F2] px-2.5 py-0.5 rounded-full border border-blue-100">
                                  Current stage
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* Pipeline History */}
                <div>
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider mb-4">
                    PIPELINE HISTORY
                  </h4>
                  {loadingActivities ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full mt-1 flex-shrink-0" />
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <p className="text-xs text-[#AEAEB2] text-center py-4">
                      No pipeline activity found.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                      {activities.map((act, i) => (
                        <div key={i} className="relative pl-5">
                          <div
                            className={`w-2 h-2 rounded-full absolute left-0 top-1.5 z-10 ${
                              act.type === "stage_move" ? "bg-[#10B981]" : "bg-[#0F47F2]"
                            }`}
                          />
                          <p className="font-bold text-black text-xs mb-0.5">
                            {act.description}
                          </p>
                          <div className="flex justify-between items-center text-[11px] text-[#8E8E93]">
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
              </div>
            )}
          </div>
        </div>
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

                {pendingAction.type === "move" && pendingAction.targetStageName?.toLowerCase().includes("shortlist") && (
                  <div className="space-y-3">
                    <label className="block text-sm font-normal text-gray-700">
                      Quick Status <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "picked_call", label: "Picked Call", icon: <Phone className="w-3.5 h-3.5" /> },
                        { id: "approved", label: "Approved by Client", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                        { id: "rejected", label: "Rejected by Client", icon: <XCircle className="w-3.5 h-3.5" /> },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSelectedFeedbackOptions(prev =>
                              prev.includes(opt.label)
                                ? prev.filter(i => i !== opt.label)
                                : [...prev, opt.label]
                            );
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedFeedbackOptions.includes(opt.label)
                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
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
                  disabled={!feedbackComment.trim() || isSubmittingFeedback}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm
                  ${(!feedbackComment.trim() || isSubmittingFeedback)
                      ? "bg-gray-300 cursor-not-allowed"
                      : pendingAction.type === "archive"
                        ? "bg-red-600 hover:bg-red-700 hover:shadow-md"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Moving...
                    </>
                  ) : (
                    <>
                      {pendingAction.type === "archive" ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Confirm{" "}
                      {pendingAction.type === "archive" ? "Archive" : "Move"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEventFormOpen && (
          <EventForm
            isOpen={isEventFormOpen}
            onClose={() => {
              setIsEventFormOpen(false);
              setPendingEventAction(null);
            }}
            initialJobId={jobId?.toString()}
            initialCompanyId={workspaceId?.toString()}
            initialApplicationId={applicationId?.toString()}
            initialStageId={pendingEventAction ? String(pendingEventAction.targetStageId) : undefined}
            isStageMove={!!pendingEventAction}
            onSubmit={async (payload) => {
              if (pendingEventAction) {
                try {
                  await apiClient.patch(`/jobs/applications/${pendingEventAction.applicationIds[0]}/?view=kanban`, {
                    current_stage: pendingEventAction.targetStageId,
                    feedback: {
                      subject: `Moving to ${pendingEventAction.targetStageName || "next stage"} and scheduled interview`,
                      comment: payload.submittedNote || "Interview scheduled",
                    },
                  });
                  showToast.success(`Candidate moved and interview scheduled`);
                  setPendingEventAction(null);
                  goBack();
                } catch (err) {
                  console.error(err);
                  showToast.error("Failed to move candidate after scheduling.");
                }
              } else {
                showToast.success("Interview scheduled successfully.");
              }
            }}
            onSkip={async (note) => {
              if (pendingEventAction) {
                setIsEventFormOpen(false);
                try {
                  await apiClient.patch(`/jobs/applications/${pendingEventAction.applicationIds[0]}/?view=kanban`, {
                    current_stage: pendingEventAction.targetStageId,
                    feedback: {
                      subject: `Moving to ${pendingEventAction.targetStageName || "next stage"} (Interview skipped)`,
                      comment: note,
                    },
                  });
                  showToast.success(`Candidate moved with note`);
                  setPendingEventAction(null);
                  goBack();
                } catch (err) {
                  console.error(err);
                  showToast.error("Failed to move candidate.");
                }
              }
            }}
          />
        )}

        {/* ── Edit Candidate Details Modal (curr_ctc, expec_ctc, notice_period) ── */}
        {isEditDetailsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Edit Candidate Details</h3>
                <button
                  onClick={() => setIsEditDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {detailsFormError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium border border-red-100">
                    {detailsFormError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current CTC (LPA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12"
                    value={editDetailsData.curr_ctc}
                    onChange={(e) =>
                      setEditDetailsData((prev) => ({ ...prev, curr_ctc: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected CTC (LPA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 16"
                    value={editDetailsData.expec_ctc}
                    onChange={(e) =>
                      setEditDetailsData((prev) => ({ ...prev, expec_ctc: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notice Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days or Immediate"
                    value={editDetailsData.notice_period}
                    onChange={(e) =>
                      setEditDetailsData((prev) => ({ ...prev, notice_period: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2]"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditDetailsModalOpen(false)}
                  disabled={isSavingDetails}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCandidateDetails}
                  disabled={isSavingDetails}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#0F47F2] hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSavingDetails ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
