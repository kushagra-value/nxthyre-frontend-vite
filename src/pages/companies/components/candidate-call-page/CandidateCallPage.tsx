import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { jobPostService, Job } from "../../../../services/jobPostService";
import { candidateService } from "../../../../services/candidateService";
import { showToast } from "../../../../utils/toast";
import { callStateCache } from "../../../call/components/callStateCache";
import CallCandidateModal from "../CallCandidateModal";
import {
  initiateCall,
  getCallStatus,
  hangupCall,
  startRecording,
  stopRecording,
  saveCallLog,
  getPlivoToken,
  getRoleQuestions,
  evaluateRoleQuestion,
  getLiveTranscript,
  logRecordingStartEvent,
  logRecordingStopEvent,
  type CallStatus,
  type RoleQuestion,
  type LiveTranscript,
} from "../../../../services/jobPipelineDashboardService";
import {
  startManualRecording,
  stopManualRecording,
  pauseManualRecording,
  resumeManualRecording,
  updateManualRecordingContext,
  waitForPendingUploads,
} from "../../../../services/manualRecordingService";
import { useManualRecordingState } from "../../../../hooks/useManualRecordingState";

// Modular tab components
import ProfileTab, { ProfileFormData } from "./components/ProfileTab";
import { toIsoDate } from "../../../../utils/dateUtils";
import SkillsMatchTab from "./components/SkillsMatchTab";
import RoleQuestionsTab from "./components/RoleQuestionsTab";
import JobDescriptionTab from "./components/JobDescriptionTab";
import NotesTab from "./components/NotesTab";
import ResumeSection from "./components/ResumeSection";
import CallEndedEarlyDialog from "./components/CallEndedEarlyDialog";

export interface CandidateCallParams {
  id: string;
  name: string;
  avatarInitials: string;
  headline: string;
  currentCtc: string;
  expectedCtc: string;
  noticePeriod: string;
  location: string;
  experience: string;
  phone?: string;
  email?: string;
  company?: string;
  callAttention?: string[];
  resumeUrl?: string;
  matchScore?: string | number | null;
  profile_picture_url?: string;
  reasonForChange?: string;
  noticePeriodStatus?: string;
  notice_status?: string;
  lastWorkingDays?: string;
  lastWorkingDate?: string;
  last_working_day?: string;
  relevantExperience?: string;
  relevant_experience?: string;
  openToRelocate?: "Yes" | "No" | "Maybe" | string;
  open_to_relocate?: "Yes" | "No" | "Maybe" | string;
  [key: string]: any;
}

const DUMMY_FALLBACK: CandidateCallParams = {
  id: "fallback",
  name: "Max Verstappen",
  avatarInitials: "MV",
  headline: "Race Engineer",
  company: "Redbull Racing",
  currentCtc: "23 LPA",
  expectedCtc: "30 LPA",
  noticePeriod: "60days",
  noticePeriodStatus: "CS",
  notice_status: "CS",
  lastWorkingDays: "14days",
  lastWorkingDate: "2026-10-31",
  last_working_day: "2026-10-31",
  location: "Bangalore",
  experience: "4Y",
  relevantExperience: "3Y 3M",
  relevant_experience: "3Y 3M",
  openToRelocate: "Yes",
  open_to_relocate: "Yes",
  phone: "+91 9495652715",
  email: "max@verstappen.com",
  resumeUrl: "",
  matchScore: 74,
};

type TabType = "profile" | "skillsMatch" | "roleQuestions" | "jobDescription" | "notes";

const TABS: { id: TabType; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "skillsMatch", label: "Skills" },
  { id: "roleQuestions", label: "Role" },
  { id: "jobDescription", label: "JD" },
  { id: "notes", label: "Notes" },
];

export default function CandidateCallPage() {
  const rawParams = useParams();
  let candidateId = rawParams.candidateId;
  let routeJobId = rawParams.jobId;

  // Support both /call/:jobId/:candidateId and /call/:candidateId/:jobId
  if (candidateId && /^\d+$/.test(candidateId) && routeJobId && !/^\d+$/.test(routeJobId)) {
    const temp = candidateId;
    candidateId = routeJobId;
    routeJobId = temp;
  }

  const persistedJobId = sessionStorage.getItem("nxthyre_companies_jobId");
  const jobId = routeJobId && routeJobId !== "0" ? routeJobId : persistedJobId || "0";
  const effectiveJobId = (() => {
    if (routeJobId && routeJobId !== "0" && routeJobId !== "undefined" && routeJobId !== "null") return routeJobId;
    if (persistedJobId && persistedJobId !== "0" && persistedJobId !== "undefined" && persistedJobId !== "null") return persistedJobId;
    if (jobId && jobId !== "0" && jobId !== "undefined" && jobId !== "null") return jobId;
    return "";
  })();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const callMode = (searchParams.get("mode") || "platform") as "platform" | "manual";
  const isManual = callMode === "manual";

  // Read from location.state OR sessionStorage fallback
  const sessionData = (() => {
    try {
      const stored = sessionStorage.getItem("_nxthyre_call_state");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch { }
    return null;
  })();

  const incomingCandidate = location.state?.candidate || sessionData?.candidate || null;
  const [candidate, setCandidate] = useState<CandidateCallParams | null>(
    incomingCandidate
      ? {
        ...incomingCandidate,
        name: incomingCandidate.name || incomingCandidate.full_name || "Max Verstappen",
        avatarInitials:
          incomingCandidate.avatarInitials ||
          (incomingCandidate.name || incomingCandidate.full_name || "MV")
            .substring(0, 2)
            .toUpperCase(),
        headline:
          incomingCandidate.headline ||
          incomingCandidate.designation ||
          "Race Engineer",
        company:
          incomingCandidate.company ||
          incomingCandidate.current_company ||
          "Redbull Racing",
        matchScore:
          incomingCandidate.matchScore ??
          incomingCandidate.score ??
          incomingCandidate.job_score?.candidate_match_score?.score ??
          74,
        phone: incomingCandidate.phone || incomingCandidate.premium_data?.phone || "+91 9495652715",
        email: incomingCandidate.email || incomingCandidate.premium_data?.email || "max@verstappen.com",
        reasonForChange: incomingCandidate.reasonForChange || incomingCandidate.reason_for_change || "",
        noticePeriodStatus: incomingCandidate.noticePeriodStatus || incomingCandidate.notice_status || "CS",
        notice_status: incomingCandidate.notice_status || incomingCandidate.noticePeriodStatus || "CS",
        lastWorkingDays: incomingCandidate.lastWorkingDays || incomingCandidate.lwd_days || "14days",
        lastWorkingDate: toIsoDate(incomingCandidate.lastWorkingDate || incomingCandidate.last_working_day || incomingCandidate.lwd_date) || "2026-10-31",
        last_working_day: toIsoDate(incomingCandidate.last_working_day || incomingCandidate.lastWorkingDate || incomingCandidate.lwd_date) || "2026-10-31",
        relevantExperience: incomingCandidate.relevantExperience || incomingCandidate.relevant_experience || "3Y 3M",
        relevant_experience: incomingCandidate.relevant_experience || incomingCandidate.relevantExperience || "3Y 3M",
        openToRelocate: incomingCandidate.openToRelocate || incomingCandidate.open_to_relocate || "Yes",
        open_to_relocate: incomingCandidate.open_to_relocate || incomingCandidate.openToRelocate || "Yes",
      }
      : null
  );

  // Initialize call state from session if available (default to idle so user must click Start Call)
  const initialCallState = sessionData?.callState && sessionData.callState !== "completed" ? sessionData.callState : "idle";
  const initialCallUuid = sessionData?.callUuid || null;

  // Active Tab: Default to Profile as shown in Screenshot 1
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Manual call states
  const [manualCallConnected, setManualCallConnected] = useState(false);

  // Call States
  const [seconds, setSeconds] = useState(0);
  const callStartedAtRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callUuid, setCallUuid] = useState<string | null>(initialCallUuid);
  const [callState, setCallState] = useState<string>(initialCallState);
  const [isSaving, setIsSaving] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [showEarlyDialog, setShowEarlyDialog] = useState(false);
  const [earlyDialogDuration, setEarlyDialogDuration] = useState<number>(0);

  const isCallActive = isManual
    ? manualCallConnected
    : (callState === "answered" || callState === "dialing");

  // Manual recording states
  const [isManualRecording, setIsManualRecording] = useState(false);
  const isManualRecordingRef = useRef(false);
  const [isManualRecordingPaused, setIsManualRecordingPaused] = useState(false);
  const isManualRecordingPausedRef = useRef(false);
  const isMountedRef = useRef(true);
  const recordingState = useManualRecordingState();
  const isSavingRecording = recordingState.pendingUploads > 0;

  // Auto recording tracker: ensure recording starts only once on page entry
  const hasAutoStartedRef = useRef(false);

  // Retain candidateList in session storage for navigation across reloads
  useEffect(() => {
    if (sessionData?.candidateList?.length) {
      try {
        const stored = sessionStorage.getItem("_nxthyre_call_state");
        const parsed = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem(
          "_nxthyre_call_state",
          JSON.stringify({ ...parsed, candidateList: sessionData.candidateList })
        );
      } catch { }
    }
  }, []);

  // Sync callUuid state to callUuidRef so handleSaveNotes always uses current callUuid
  const callUuidRef = useRef<string | null>(initialCallUuid);
  useEffect(() => {
    callUuidRef.current = callUuid;
  }, [callUuid]);

  // Reset call session state when candidateId changes
  useEffect(() => {
    if (isManualRecordingRef.current) {
      void stopManualRecording();
    }
    setCallUuid(null);
    callUuidRef.current = null;
    setSeconds(0);
    setManualCallConnected(false);
    setIsPaused(false);
    setIsMuted(false);
    setIsRecording(false);
    setIsManualRecording(false);
    isManualRecordingRef.current = false;
    setIsManualRecordingPaused(false);
    isManualRecordingPausedRef.current = false;
    setNotes("");
    setActiveTags([]);
    setChecklist({
      ctcConfirmed: false,
      ctcFlexibility: false,
      noticePeriod: false,
      location: false,
    });
    setSkillsChecklist({});
    setSkillsFeedback({});
    setCandidateDetails(null);
    lastSavedDataRef.current = "";
    callStartedAtRef.current = null;
    hasAutoStartedRef.current = false; // Reset so next candidate auto-starts call recording
  }, [candidateId]);

  const sessionCandidateList: (string | number)[] = (() => {
    if (location.state?.candidateList?.length) return location.state.candidateList;
    if (sessionData?.candidateList?.length) return sessionData.candidateList;
    try {
      const stored = sessionStorage.getItem("_nxthyre_call_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.candidateList?.length) return parsed.candidateList;
      }
    } catch { }
    try {
      const storedList = sessionStorage.getItem(`_nxthyre_candidate_list_${effectiveJobId || jobId}`);
      if (storedList) {
        const parsed = JSON.parse(storedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => c?.candidate?.id || c?.id || c).filter(Boolean);
        }
      }
    } catch { }
    return [];
  })();

  const candidateList = sessionCandidateList;
  const currentCandidateIndex = candidateList.findIndex(
    (id) => String(id) === String(candidateId)
  );
  const hasPrevCandidate = currentCandidateIndex > 0;
  const hasNextCandidate =
    currentCandidateIndex !== -1 && currentCandidateIndex < candidateList.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrevCandidate) {
      const nextId = candidateList[currentCandidateIndex - 1];
      navigate(`/call/${nextId}/${jobId || 0}?mode=${callMode}`, {
        state: { candidateList },
      });
    }
  };

  const handleNavigateNext = () => {
    if (hasNextCandidate) {
      const nextId = candidateList[currentCandidateIndex + 1];
      navigate(`/call/${nextId}/${jobId || 0}?mode=${callMode}`, {
        state: { candidateList },
      });
    }
  };

  // Questions and Job data
  const [roleQuestions, setRoleQuestions] = useState<RoleQuestion[]>([]);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [competenciesData, setCompetenciesData] = useState<any>(null);
  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const [skillsFeedback, setSkillsFeedback] = useState<Record<string, "positive" | "neutral" | "negative" | null>>({});
  const [, setTranscripts] = useState<LiveTranscript[]>([]);

  // Notes & Checklist States
  const [notes, setNotes] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [checklist, setChecklist] = useState({
    ctcConfirmed: false,
    ctcFlexibility: false,
    noticePeriod: false,
    location: false,
  });
  const [skillsChecklist, setSkillsChecklist] = useState<Record<string, boolean>>({});
  const [followUpReason] = useState<string | null>(null);

  useEffect(() => {
    const dynamicSkills = jobData?.skills?.length
      ? jobData.skills
      : jobData?.technical_competencies?.length
        ? jobData.technical_competencies
        : [];
    if (dynamicSkills.length > 0) {
      setSkillsChecklist((prev) => {
        const initial: Record<string, boolean> = { ...prev };
        dynamicSkills.forEach((skill) => {
          if (initial[skill] === undefined) {
            initial[skill] = false;
          }
        });
        return initial;
      });
    }
  }, [jobData?.skills, jobData?.technical_competencies]);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const plivoRef = useRef<any>(null);

  const handleMuteToggle = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (plivoRef.current) {
        if (newMuted) {
          plivoRef.current.client.mute();
        } else {
          plivoRef.current.client.unmute();
        }
      }
      return newMuted;
    });
  };

  const handlePauseResumeRecording = () => {
    if (!isManualRecordingRef.current) return;

    if (isManualRecordingPausedRef.current) {
      resumeManualRecording();
      isManualRecordingPausedRef.current = false;
      setIsManualRecordingPaused(false);
    } else {
      pauseManualRecording();
      isManualRecordingPausedRef.current = true;
      setIsManualRecordingPaused(true);
    }
  };

  // Universal Mic toggle handler
  const handleMicToggleClick = () => {
    if (!isCallActive) {
      setIsMuted((prev) => !prev);
      return;
    }
    if (isManual) {
      handlePauseResumeRecording();
      setIsMuted((prev) => !prev);
    } else {
      handleMuteToggle();
    }
  };

  // Re-fetch candidate details from backend on mount
  useEffect(() => {
    if (!candidateId) return;
    (async () => {
      try {
        let detailsData: any = null;
        if (jobId && jobId !== "0") {
          try {
            detailsData = await candidateService.getCandidateInboundScore(candidateId, jobId);
          } catch (err) {
            console.error("Failed to fetch candidate inbound score:", err);
          }
        }
        if (!detailsData) {
          detailsData = await candidateService.getCandidateDetails(candidateId);
        }

        const c = detailsData?.candidate || detailsData;
        const jobScore = c?.job_score || detailsData?.job_score;
        const fetchedMatchScore =
          jobScore?.candidate_match_score?.score ?? c?.matchScore ?? c?.score ?? null;

        if (c) {
          setCandidateDetails(c);
          setCandidate((prev) => {
            const base = prev || DUMMY_FALLBACK;
            const primaryExp = c.experience?.[0];
            return {
              ...base,
              id: c.id || base.id,
              name: c.full_name || base.name,
              avatarInitials: c.full_name
                ? c.full_name.substring(0, 2).toUpperCase()
                : base.avatarInitials,
              headline: c.headline || primaryExp?.job_title || base.headline,
              company: primaryExp?.company || base.company || "Redbull Racing",
              currentCtc:
                (c as any).current_salary != null
                  ? `${(c as any).current_salary} LPA`
                  : base.currentCtc,
              expectedCtc: (c as any).expected_ctc
                ? `${(c as any).expected_ctc} LPA`
                : base.expectedCtc,
              noticePeriod:
                c.notice_period_days != null
                  ? `${c.notice_period_days} days`
                  : base.noticePeriod,
              noticePeriodStatus:
                c.notice_status ||
                c.notice_period_status ||
                base.noticePeriodStatus ||
                "CS",
              notice_status:
                c.notice_status ||
                c.notice_period_status ||
                base.notice_status ||
                "CS",
              lastWorkingDays:
                c.lwd_days ||
                base.lastWorkingDays ||
                "14days",
              lastWorkingDate:
                toIsoDate(c.last_working_day || c.lwd_date || base.lastWorkingDate) ||
                "2026-10-31",
              last_working_day:
                toIsoDate(c.last_working_day || c.lwd_date || base.last_working_day) ||
                "2026-10-31",
              relevantExperience:
                c.relevant_experience ||
                (c as any).relevantExperience ||
                base.relevantExperience ||
                "3Y 3M",
              relevant_experience:
                c.relevant_experience ||
                (c as any).relevant_experience ||
                base.relevant_experience ||
                "3Y 3M",
              openToRelocate:
                c.open_to_relocate ||
                (c as any).openToRelocate ||
                base.openToRelocate ||
                "Yes",
              open_to_relocate:
                c.open_to_relocate ||
                (c as any).open_to_relocate ||
                base.open_to_relocate ||
                "Yes",
              location: c.location || base.location,
              experience:
                c.total_experience != null
                  ? `${c.total_experience}Y`
                  : base.experience,
              phone: c.phone || c.premium_data?.phone || base.phone,
              email: c.email || c.premium_data?.email || base.email || "max@verstappen.com",
              resumeUrl: c.premium_data?.resume_url || c.resume_url || base.resumeUrl,
              matchScore: fetchedMatchScore ?? base.matchScore ?? 74,
              reasonForChange:
                c.reason_for_change ||
                (c as any).reasonForChange ||
                base.reasonForChange ||
                "",
            };
          });
        }
      } catch (err) {
        console.error("Failed to re-fetch candidate details:", err);
      }
    })();
  }, [candidateId, jobId]);

  useEffect(() => {
    if (candidate?.id && jobId) {
      getRoleQuestions(jobId, candidate.id)
        .then(setRoleQuestions)
        .catch(console.error);
    }
  }, [candidate?.id, jobId]);

  // Fetch Job Data & Competencies for the JD tab
  useEffect(() => {
    if (jobId) {
      const numericJobId = parseInt(jobId, 10);
      jobPostService.getJob(numericJobId)
        .then(setJobData)
        .catch((err) => console.error("Failed to fetch job data:", err));

      jobPostService.getJobCompetencies(numericJobId)
        .then(setCompetenciesData)
        .catch((err) => console.error("Failed to fetch job competencies:", err));
    }
  }, [jobId]);

  // ─── Register Plivo Browser SDK (WebRTC) ─────────────
  useEffect(() => {
    if (isManual) return;
    let cancelled = false;

    (async () => {
      try {
        const { username, password } = await getPlivoToken();
        if (cancelled) return;

        const plivoModule = await import("plivo-browser-sdk");
        const PlivoClient = (plivoModule as any).Client || plivoModule.default;

        const plivoBrowser = new PlivoClient({
          debug: "INFO",
          permOnClick: true,
          enableTracking: true,
          closeProtection: false,
          maxAverageBitrate: 48000,
        });

        plivoRef.current = plivoBrowser;

        plivoBrowser.client.on("onWebrtcNotSupported", () => {
          console.error("WebRTC is not supported in this browser");
        });

        plivoBrowser.client.on("onLogin", () => {
          console.log("Plivo SDK: Registered as", username);
        });

        plivoBrowser.client.on("onLoginFailed", (reason: string) => {
          console.error("Plivo SDK: Login failed:", reason);
        });

        plivoBrowser.client.on("onIncomingCall", () => {
          plivoBrowser.client.answer();
        });

        plivoBrowser.client.on("onCallAnswered", () => {
          if (!callStartedAtRef.current) callStartedAtRef.current = Date.now();
          setCallState("answered");
          if (isMuted && plivoRef.current) {
            try {
              plivoRef.current.client.mute();
            } catch { }
          }
          // Auto start platform recording if not already started
          if (callUuidRef.current && !isRecording) {
            void handleToggleRecording();
          }
        });

        plivoBrowser.client.on("onCallTerminated", () => {
          console.log("Plivo SDK: Call terminated");
        });

        plivoBrowser.client.login(username, password);
      } catch (err) {
        console.error("Failed to initialize Plivo Browser SDK:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (plivoRef.current) {
        try {
          plivoRef.current.client.logout();
        } catch { }
      }
    };
  }, [isManual, isMuted, isRecording]);

  // ─── Initiate Call on Mount (Platform Mode - only if session explicitly initiating) ───
  useEffect(() => {
    if (isManual) return;
    if (!candidate?.phone) return;

    if (sessionData?.callState !== "initiating") {
      return;
    }

    if (callState === "answered") {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await initiateCall({ phone_numbers: [candidate.phone!] });
        if (cancelled) return;
        setCallState("dialing");
        const uuid = res.status?.call_uuid;
        if (uuid) setCallUuid(uuid);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to initiate call:", err);
          setCallState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [candidate?.phone, isManual, sessionData?.callState]);

  // ─── Poll Call Status (platform mode only) ────────────────────
  useEffect(() => {
    if (isManual) return;

    if (callState === "completed" || callState === "error") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const status: CallStatus = await getCallStatus();
        if (status.call_uuid) {
          setCallUuid(status.call_uuid);
        }
        if (status.status === "answered" || status.event === "answer") {
          if (!callStartedAtRef.current) callStartedAtRef.current = Date.now();
          setCallState("answered");
          if (status.call_uuid && !isRecording) {
            void handleToggleRecording();
          }
        }
        if (
          status.status === "completed" ||
          status.event === "hangup" ||
          status.event === "hangup_by_user"
        ) {
          const duration = callStartedAtRef.current
            ? Math.round((Date.now() - callStartedAtRef.current) / 1000)
            : seconds;
          setCallState("completed");
          setIsPaused(true);
          if (duration <= 70) {
            setEarlyDialogDuration(duration);
            setShowEarlyDialog(true);
          }
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [callState, callUuid, isManual, isRecording]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const shouldRun = isManual
      ? manualCallConnected && !isPaused && !isManualRecordingPaused
      : !isPaused && callState !== "completed";

    if (shouldRun) {
      if (!callStartedAtRef.current) {
        callStartedAtRef.current = Date.now();
      }
      interval = setInterval(() => {
        if (callStartedAtRef.current) {
          const elapsed = Math.round((Date.now() - callStartedAtRef.current) / 1000);
          setSeconds(elapsed >= 0 ? elapsed : 0);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, callState, isManual, manualCallConnected, isManualRecordingPaused]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Transcript Polling Logic ---
  useEffect(() => {
    if (callUuid && callState !== "completed" && callState !== "error") {
      transcriptPollRef.current = setInterval(async () => {
        try {
          const res = await getLiveTranscript(callUuid);
          setTranscripts(res);
        } catch (err) {
          console.error("Transcript polling error:", err);
        }
      }, 5000);
    }
    return () => {
      if (transcriptPollRef.current) clearInterval(transcriptPollRef.current);
    };
  }, [callUuid, callState]);

  const getValidJobId = (): string => {
    if (effectiveJobId) return effectiveJobId;
    if (jobData?.id && String(jobData.id) !== "0") return String(jobData.id);
    if (jobData?.job_id && String(jobData.job_id) !== "0") return String(jobData.job_id);
    if ((candidate as any)?.job_id && String((candidate as any).job_id) !== "0") return String((candidate as any).job_id);
    if ((candidate as any)?.jobId && String((candidate as any).jobId) !== "0") return String((candidate as any).jobId);
    if (incomingCandidate?.job_id && String(incomingCandidate.job_id) !== "0") return String(incomingCandidate.job_id);
    if (incomingCandidate?.jobId && String(incomingCandidate.jobId) !== "0") return String(incomingCandidate.jobId);
    return "";
  };

  // ─── Call Controls ───────────────────────────────────
  const handleEndCall = useCallback(async () => {
    if (isEndingCall) return;
    setIsEndingCall(true);
    const targetJobId = getValidJobId();
    try {
      if (isRecording && callUuid) {
        try {
          await stopRecording(callUuid);
          if (candidate?.id && targetJobId) {
            await logRecordingStopEvent({
              callUuid,
              candidateId: candidate.id,
              jobId: targetJobId,
            });
          }
        } catch (err) {
          console.error("Error stopping recording on end call:", err);
        }
        setIsRecording(false);
      }
      if (callUuid) {
        try {
          await hangupCall(callUuid);
        } catch (err) {
          console.error("Backend hangup error:", err);
        }
      }
      if (plivoRef.current) {
        try {
          plivoRef.current.client.hangup();
        } catch (err) {
          console.error("SDK hangup error:", err);
        }
      }
      setCallState("completed");
      setIsPaused(true);
      const callDuration = callStartedAtRef.current
        ? Math.round((Date.now() - callStartedAtRef.current) / 1000)
        : seconds;
      if (callDuration <= 70) {
        setEarlyDialogDuration(callDuration);
        setShowEarlyDialog(true);
      }
      try {
        const existing = sessionStorage.getItem("nxthyre_last_call_completed");
        const parsed = existing ? JSON.parse(existing) : {};
        const callTime = new Date().toISOString();
        sessionStorage.setItem(
          "nxthyre_last_call_completed",
          JSON.stringify({
            ...parsed,
            candidateId: candidate?.id,
            callStatus: "completed",
            callTime,
          })
        );
        if (candidate?.id) {
          callStateCache.updateCandidate(candidate.id, {
            latest_manual_call_status: "completed",
            latest_manual_call_at: callTime,
          });
        }
      } catch (e) { }
    } catch (err) {
      console.error("Failed to end call:", err);
      setCallState("completed");
      setIsPaused(true);
      setIsMuted(false);
      callStartedAtRef.current = null;
    } finally {
      setIsEndingCall(false);
    }
  }, [callUuid, isEndingCall, isRecording, candidate?.id, jobData, incomingCandidate, effectiveJobId]);

  const handleToggleRecording = useCallback(async () => {
    if (!callUuid) return;
    const targetJobId = getValidJobId();
    try {
      if (isRecording) {
        await stopRecording(callUuid);
        setIsRecording(false);
        if (candidate?.id && targetJobId) {
          try {
            await logRecordingStopEvent({
              callUuid,
              candidateId: candidate.id,
              jobId: targetJobId,
            });
          } catch (e) {
            console.error("Failed to log recording stop event:", e);
          }
        }
      } else {
        await startRecording(callUuid);
        setIsRecording(true);
        if (candidate?.id && targetJobId) {
          try {
            const eventRes = await logRecordingStartEvent({
              callUuid,
              candidateId: candidate.id,
              jobId: targetJobId,
            });
            if (eventRes?.call_uuid) {
              setCallUuid(eventRes.call_uuid);
              callUuidRef.current = eventRes.call_uuid;
            }
          } catch (e) {
            console.error("Failed to log recording start event:", e);
          }
        }
      }
    } catch (err) {
      console.error("Recording toggle error:", err);
    }
  }, [callUuid, isRecording, candidate?.id, jobData, incomingCandidate, effectiveJobId]);

  const startVoiceRecording = async (overrideCallUuid?: string) => {
    const targetJobId = getValidJobId();
    const activeCandId = candidate?.id || candidateId || "candidate";
    if (isManualRecordingRef.current) return;

    const recordingUuid = overrideCallUuid || callUuidRef.current || callUuid || crypto.randomUUID();
    if (!callUuidRef.current) {
      callUuidRef.current = recordingUuid;
      setCallUuid(recordingUuid);
    }

    try {
      await startManualRecording({
        callUuid: recordingUuid,
        candidateId: activeCandId,
        jobId: targetJobId,
      });
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        showToast.error("Microphone access failed. Please check permissions.");
      } else {
        console.error("Failed to start manual recording:", err);
        showToast.error("Could not start recording. Please try again.");
      }
      return;
    }

    isManualRecordingRef.current = true;
    setIsManualRecording(true);
    isManualRecordingPausedRef.current = false;
    setIsManualRecordingPaused(false);

    if (targetJobId && activeCandId) {
      try {
        const eventRes = await logRecordingStartEvent({
          callUuid: recordingUuid,
          candidateId: activeCandId,
          jobId: targetJobId,
        });
        if (eventRes?.call_uuid && eventRes.call_uuid !== recordingUuid) {
          setCallUuid(eventRes.call_uuid);
          callUuidRef.current = eventRes.call_uuid;
          updateManualRecordingContext({ callUuid: eventRes.call_uuid });
        }
      } catch (e) {
        console.error("Failed to log manual recording start event:", e);
      }
    }
  };

  const stopVoiceRecording = async () => {
    const targetJobId = getValidJobId();
    if (!isManualRecordingRef.current) return;

    isManualRecordingRef.current = false;
    setIsManualRecording(false);
    isManualRecordingPausedRef.current = false;
    setIsManualRecordingPaused(false);

    updateManualRecordingContext({
      callUuid: callUuidRef.current || callUuid || undefined,
      jobId: targetJobId || undefined,
    });

    const result = await stopManualRecording();
    if (result.status === "uploaded") {
      showToast.success("Recording saved and processing...");
      if (isMountedRef.current) handleSaveNotes(true);
    } else if (result.status === "empty") {
      showToast.error("No usable audio was captured. Check microphone access and record again.");
    } else if (result.status === "failed") {
      showToast.error(
        result.permanent
          ? `Recording could not be processed: ${result.error}`
          : "Recording upload failed. It is saved on this device and will retry automatically."
      );
    }
  };

  const handleStartManualCall = async () => {
    const newUuid = callUuid || crypto.randomUUID();
    if (!callUuid) setCallUuid(newUuid);
    callUuidRef.current = newUuid;
    setManualCallConnected(true);
    setIsPaused(false);
    callStartedAtRef.current = Date.now();
    await startVoiceRecording(newUuid);
    if (isMuted) {
      pauseManualRecording();
      isManualRecordingPausedRef.current = true;
      setIsManualRecordingPaused(true);
    }
  };

  const handleEndManualCall = async () => {
    const callDuration = callStartedAtRef.current
      ? Math.round((Date.now() - callStartedAtRef.current) / 1000)
      : seconds;

    setManualCallConnected(false);
    setIsPaused(true);
    setIsMuted(false);
    callStartedAtRef.current = null;
    if (isManualRecordingRef.current) {
      await stopVoiceRecording();
    }

    if (callDuration <= 70) {
      setEarlyDialogDuration(callDuration);
      setShowEarlyDialog(true);
    }
  };

  const handleStartPlatformCall = async () => {
    if (!candidate?.phone) {
      showToast.error("Candidate phone number is not available");
      return;
    }
    setCallState("dialing");
    callStartedAtRef.current = Date.now();
    try {
      const res = await initiateCall({ phone_numbers: [candidate.phone] });
      const uuid = res.status?.call_uuid;
      if (uuid) {
        setCallUuid(uuid);
        callUuidRef.current = uuid;
      }
    } catch (err) {
      console.error("Failed to initiate call:", err);
      setCallState("error");
      showToast.error("Failed to initiate call. Please try again.");
    }
  };

  const handleStartCall = async () => {
    if (isStartingCall || isCallActive) return;
    setIsStartingCall(true);
    try {
      if (isManual) {
        await handleStartManualCall();
      } else {
        await handleStartPlatformCall();
      }
    } finally {
      setIsStartingCall(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (isManualRecordingRef.current) {
        void stopManualRecording();
      }
    };
  }, []);

  const lastSavedDataRef = useRef<string>("");

  const handleSaveNotes = useCallback(
    async (isSilent = false) => {
      if (!candidate || isSaving) return;

      const currentData = JSON.stringify({
        notes,
        activeTags,
        checklist,
        skillsChecklist,
        skillsFeedback,
        roleQuestionsData: roleQuestions.reduce((acc, q) => {
          acc[q.id] = q;
          return acc;
        }, {} as Record<number, any>),
      });

      if (currentData === lastSavedDataRef.current && callUuidRef.current) {
        return;
      }

      if (!isSilent) setIsSaving(true);

      const finalCallUuid = callUuidRef.current;
      const isCallCompleted =
        callState === "completed" || (!manualCallConnected && isManual) || isSilent;
      let durationToSend: number | undefined = undefined;

      if (isCallCompleted) {
        if (callStartedAtRef.current) {
          const wallClockSec = Math.round((Date.now() - callStartedAtRef.current) / 1000);
          if (Number.isFinite(wallClockSec) && wallClockSec >= 0) {
            durationToSend = wallClockSec;
          }
        }
        if (durationToSend === undefined && seconds > 0) {
          durationToSend = seconds;
        }
      }

      try {
        const callLogRes = await saveCallLog({
          call_uuid: finalCallUuid || undefined,
          candidate_id: candidate.id,
          note: notes || undefined,
          duration_seconds: durationToSend,
          tags: activeTags.length > 0 ? activeTags : undefined,
          checklist_data: checklist,
          skills_data: Object.keys(skillsFeedback).length > 0 ? skillsFeedback : skillsChecklist,
          role_questions_data: roleQuestions.reduce((acc, q) => {
            acc[q.id] = q;
            return acc;
          }, {} as Record<number, any>),
          call_mode: isManual ? "manual" : "platform",
          call_status: isManual && manualCallConnected ? "completed" : undefined,
        });

        if (callLogRes.call_uuid) {
          callUuidRef.current = callLogRes.call_uuid;
          setCallUuid(callLogRes.call_uuid);
          lastSavedDataRef.current = currentData;
        }

        try {
          const existing = sessionStorage.getItem("nxthyre_last_call_completed");
          const parsed = existing ? JSON.parse(existing) : {};
          const cStatus =
            isManual && manualCallConnected
              ? "completed"
              : parsed.callStatus || "completed";
          const callTime = parsed.callTime || new Date().toISOString();
          sessionStorage.setItem(
            "nxthyre_last_call_completed",
            JSON.stringify({
              ...parsed,
              candidateId: candidate?.id,
              noteText: notes,
              callStatus: cStatus,
              callTime,
            })
          );
          if (candidate?.id) {
            callStateCache.updateCandidate(candidate.id, {
              latest_manual_call_status: cStatus,
              latest_manual_call_at: callTime,
              latest_manual_call_note: notes || undefined,
            });
          }
        } catch (e) { }

        if (!isSilent) showToast.success("Notes saved!");
      } catch (err) {
        console.error("Failed to save notes:", err);
        if (!isSilent) showToast.error("Failed to save notes. Please try again.");
      } finally {
        if (!isSilent) setIsSaving(false);
      }
    },
    [
      candidate,
      notes,
      seconds,
      activeTags,
      checklist,
      skillsChecklist,
      skillsFeedback,
      roleQuestions,
      isManual,
      manualCallConnected,
      callState,
      isSaving,
    ]
  );

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleEvaluateQuestion = async (
    qId: number,
    status: RoleQuestion["status"]
  ) => {
    try {
      const updated = await evaluateRoleQuestion(qId, status);
      setRoleQuestions((prev) => prev.map((q) => (q.id === qId ? updated : q)));
    } catch (err) {
      console.error("Failed to update evaluation:", err);
    }
  };

  const handleBack = useCallback(() => {
    if (isManualRecordingRef.current) {
      void stopManualRecording();
    }
    void handleSaveNotes(true);

    if (!isManual && (callState === "answered" || callState === "dialing")) {
      if (plivoRef.current) {
        try {
          plivoRef.current.client.hangup();
        } catch { }
      }
      const activeUuid = callUuidRef.current || callUuid;
      if (activeUuid) {
        void hangupCall(activeUuid).catch(() => { });
      }
    }

    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else if (effectiveJobId) {
      navigate(`/pipelines/${effectiveJobId}`);
    } else {
      navigate("/companies");
    }
  }, [callState, callUuid, effectiveJobId, handleSaveNotes, isManual, navigate]);

  // Handle Save Profile from ProfileTab
  const handleSaveProfile = async (formData: ProfileFormData) => {
    if (!candidate) return;
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {};

      // 1. Current CTC / Salary
      const ctcNum = parseFloat(String(formData.currentCtc || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(ctcNum)) payload.current_salary = ctcNum;

      // 2. Expected CTC
      const expCtcClean = String(formData.expectedCtc || "").replace(/[^0-9.]/g, "").trim();
      if (expCtcClean) {
        const expCtcNum = parseFloat(expCtcClean);
        if (!isNaN(expCtcNum)) payload.expected_ctc = expCtcNum;
      }

      // 3. Notice Period Days
      const noticeNum = parseInt(String(formData.noticePeriod || "").replace(/[^0-9]/g, ""), 10);
      if (!isNaN(noticeNum)) payload.notice_period_days = noticeNum;

      // 4. Notice Period Serving Status (CS: Currently Serving, NS: Not Serving)
      if (formData.noticePeriodStatus) {
        payload.notice_status = formData.noticePeriodStatus;
        payload.notice_period_status = formData.noticePeriodStatus;
      }

      // 5. Last Working Day & Date
      const isoLwd = toIsoDate(formData.lastWorkingDate);
      if (isoLwd) {
        payload.last_working_day = isoLwd;
        payload.lwd_date = isoLwd;
      }
      if (formData.lastWorkingDays && formData.lastWorkingDays.trim()) {
        payload.lwd_days = formData.lastWorkingDays.trim();
      }

      // 6. Location
      if (String(formData.location || "").trim()) payload.location = String(formData.location).trim();

      // 7. Total Experience
      const expNum = parseFloat(String(formData.experience || "").replace(/[^0-9.]/g, ""));
      if (!isNaN(expNum)) payload.exp = expNum;

      // 8. Relevant Experience (R- Experience)
      if (formData.relevantExperience && formData.relevantExperience.trim()) {
        payload.relevant_experience = formData.relevantExperience.trim();
      }

      // 9. Open to Relocate
      if (formData.openToRelocate) {
        payload.open_to_relocate = formData.openToRelocate;
      }

      // 10. Reason for Change
      const reason_for_change = formData.reasonForChange;
      if (reason_for_change && reason_for_change.trim()) {
        payload.reason_for_change = reason_for_change.trim();
      }

      // 11. Profile info (Name, Designation, Company)
      if (formData.name && formData.name.trim()) {
        payload.name = formData.name.trim();
        payload.full_name = formData.name.trim();
      }
      if (formData.currentDesignation && formData.currentDesignation.trim()) {
        payload.headline = formData.currentDesignation.trim();
        payload.designation = formData.currentDesignation.trim();
      }
      if (formData.currentCompany && formData.currentCompany.trim()) {
        payload.company = formData.currentCompany.trim();
      }

      if (candidate.id && candidate.id !== "fallback") {
        await candidateService.updateCandidateEditableFields(candidate.id, payload);
      }

      const updatedCandidate: CandidateCallParams = {
        ...candidate,
        name: formData.name || candidate.name,
        headline: formData.currentDesignation || candidate.headline,
        company: formData.currentCompany || candidate.company,
        currentCtc: formData.currentCtc || candidate.currentCtc,
        expectedCtc: formData.expectedCtc || candidate.expectedCtc,
        noticePeriod: formData.noticePeriod || candidate.noticePeriod,
        noticePeriodStatus: formData.noticePeriodStatus || candidate.noticePeriodStatus || "CS",
        notice_status: formData.noticePeriodStatus || candidate.notice_status || "CS",
        lastWorkingDays: formData.lastWorkingDays || candidate.lastWorkingDays || "14days",
        lastWorkingDate: isoLwd || toIsoDate(candidate.lastWorkingDate) || "2026-10-31",
        last_working_day: isoLwd || toIsoDate(candidate.last_working_day) || "2026-10-31",
        location: formData.location || candidate.location,
        experience: formData.experience || candidate.experience,
        relevantExperience: formData.relevantExperience || candidate.relevantExperience || "3Y 3M",
        relevant_experience: formData.relevantExperience || candidate.relevant_experience || "3Y 3M",
        openToRelocate: formData.openToRelocate || candidate.openToRelocate || "Yes",
        open_to_relocate: formData.openToRelocate || candidate.open_to_relocate || "Yes",
        reasonForChange: formData.reasonForChange || candidate.reasonForChange,
        reason_for_change: formData.reasonForChange || candidate.reason_for_change,
      };
      setCandidate(updatedCandidate);

      try {
        const stored = sessionStorage.getItem("_nxthyre_call_state");
        const parsedStored = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem(
          "_nxthyre_call_state",
          JSON.stringify({ ...parsedStored, candidate: updatedCandidate })
        );
      } catch { }

      showToast.success("Profile saved successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeCandidate = candidate || DUMMY_FALLBACK;
  const isMicMuted = isCallActive
    ? (isManual ? isManualRecordingPaused : isMuted)
    : isMuted;

  return (
    <div className="flex flex-col gap-5 w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* ─── 1. DARK HEADER (Matching Screenshot 1 & 2) ─────────────────── */}
      <header className="bg-[#0D131F] text-white px-6 py-3.5 shrink-0 flex items-center justify-between border-b border-slate-800/80 shadow-md z-20">
        {/* LEFT GROUP: Back button, Avatar, Candidate Name & Email */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="text-slate-400 hover:text-white transition-colors p-1 -ml-1 rounded-lg cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Candidate Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-slate-700/60 flex items-center justify-center text-white text-xs font-semibold overflow-hidden shadow-sm">
              {activeCandidate.profile_picture_url ? (
                <img
                  src={activeCandidate.profile_picture_url}
                  alt={activeCandidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{activeCandidate.avatarInitials || "MV"}</span>
              )}
            </div>
          </div>

          {/* Candidate Name & Email */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-wide truncate leading-tight">
              {activeCandidate.name || "Max Verstappen"}
            </h1>
            <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
              {activeCandidate.email || "max@verstappen.com"}
            </p>
          </div>
        </div>

        {/* CENTER GROUP: Phone Pill & (when active) Live Call Badge */}
        <div className="flex items-center gap-2.5">
          {/* Phone pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#252D3D] text-slate-300 text-xs font-medium shadow-inner">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{activeCandidate.phone || "+91 9495652715"}</span>
          </div>

          {/* Live Call Duration Badge (Only when call is active) */}
          {isCallActive && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#252D3D] text-slate-300 text-xs font-medium shadow-inner">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              <span>Live Call {formatTime(seconds)}</span>
            </div>
          )}
        </div>

        {/* RIGHT GROUP: Mic Toggle, Start/End Call Button, Candidate Navigation */}
        <div className="flex items-center gap-2.5">
          {/* Mic Toggle Button (Visible before and during call) */}
          <button
            type="button"
            onClick={handleMicToggleClick}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${isMicMuted
              ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
              : "bg-[#252D3D] hover:bg-slate-700/60 text-slate-200 hover:text-white"
              }`}
            title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Start Call / End Call Button */}
          {!isCallActive ? (
            <button
              type="button"
              onClick={handleStartCall}
              disabled={isStartingCall}
              className="h-9 px-4 bg-[#16A34A] hover:bg-green-700 text-white font-medium text-xs rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              {isStartingCall ? "Starting..." : "Start Call"}
            </button>
          ) : (
            <button
              type="button"
              onClick={isManual ? handleEndManualCall : handleEndCall}
              disabled={isEndingCall}
              className="h-9 px-4 bg-[#DC2626] hover:bg-red-700 text-white font-medium text-xs rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
            >
              {isEndingCall ? "Ending..." : "End Call"}
            </button>
          )}

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-700/80 mx-1 shrink-0" />

          {/* Candidate Navigation Controls: [ < ] [ 1/30 ] [ > ] */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleNavigatePrev}
              disabled={!hasPrevCandidate}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${hasPrevCandidate
                ? "bg-[#252D3D] hover:bg-slate-700/60 text-slate-200 hover:text-white cursor-pointer"
                : "bg-[#252D3D]/50 text-slate-600 cursor-not-allowed"
                }`}
              title="Previous Candidate"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="h-8 px-2.5 rounded-lg bg-[#252D3D] text-slate-300 font-medium text-xs flex items-center justify-center select-none">
              {currentCandidateIndex >= 0 ? currentCandidateIndex + 1 : 1}/
              {candidateList.length || 30}
            </div>

            <button
              type="button"
              onClick={handleNavigateNext}
              disabled={!hasNextCandidate}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${hasNextCandidate
                ? "bg-[#252D3D] hover:bg-slate-700/60 text-slate-200 hover:text-white cursor-pointer"
                : "bg-[#252D3D]/50 text-slate-600 cursor-not-allowed"
                }`}
              title="Next Candidate"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. MAIN 2-COLUMN WORKSPACE ────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 lg:flex-row overflow-hidden bg-slate-50">
        {/* LEFT COLUMN: 5 Tabs + Active Tab Content */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 bg-white border-r border-slate-200">
          {/* Tabs Navigation Bar */}
          <div className="flex items-center px-18 gap-9 border-b border-slate-200 shadow-md rounded-md bg-white shrink-0 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-[14px] relative transition-colors cursor-pointer shrink-0 ${isActive ? "text-[#0F47F2] font-medium" : "text-slate-500 hover:text-slate-800 "
                    }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F47F2] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area (Scrollable) */}
          <div className={`flex-1 min-h-0 ${activeTab === "notes" ? "flex flex-col p-6 bg-white overflow-hidden" : "overflow-y-auto p-6 custom-scrollbar bg-slate-50/40"}`}>
            {/* TAB 1: PROFILE */}
            {activeTab === "profile" && (
              <ProfileTab
                candidate={activeCandidate}
                onSaveProfile={handleSaveProfile}
                isSaving={isSaving}
              />
            )}

            {/* TAB 2: SKILLS MATCH */}
            {activeTab === "skillsMatch" && (
              <SkillsMatchTab
                candidateId={candidateId}
                jobId={effectiveJobId || jobId}
                candidate={activeCandidate}
                candidateDetails={candidateDetails}
                jobData={jobData}
                competenciesData={competenciesData}
                skillsFeedback={skillsFeedback}
                onFeedbackChange={setSkillsFeedback}
              />
            )}

            {/* TAB 3: ROLE QUESTIONS */}
            {activeTab === "roleQuestions" && (
              <RoleQuestionsTab
                roleQuestions={roleQuestions}
                candidateHeadline={activeCandidate.headline}
                onEvaluateQuestion={handleEvaluateQuestion}
              />
            )}

            {/* TAB 4: JOB DESCRIPTION */}
            {activeTab === "jobDescription" && (
              <JobDescriptionTab
                jobData={jobData}
                competenciesData={competenciesData}
              />
            )}

            {/* TAB 5: NOTES */}
            {activeTab === "notes" && (
              <NotesTab
                candidateId={candidate?.id || candidateId || ""}
                candidate={activeCandidate}
                notes={notes}
                onChangeNotes={setNotes}
                onSaveNotes={handleSaveNotes}
                activeTags={activeTags}
                onToggleTag={toggleTag}
                isSaving={isSaving}
                callUuid={callUuidRef.current}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate Resume Viewer (Expanded to full height) */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 h-full p-2 bg-[#F8FAFC]">
          <ResumeSection candidate={activeCandidate} />
        </div>
      </div>

      {/* Follow Up Modal Overlay for Manual Call Failures if needed */}
      {followUpReason && (
        <CallCandidateModal
          isOpen={!!followUpReason}
          onClose={async () => {
            await waitForPendingUploads();
            sessionStorage.setItem("nxthyre_activeTab", "call");
            window.location.href = "/";
          }}
          candidate={
            candidate
              ? {
                ...candidate,
                phone: candidate.phone || "",
              }
              : null
          }
          jobId={jobId ? parseInt(jobId, 10) : undefined}
          initialStep="noAnswer"
          initialReason={followUpReason}
          initialNote={notes}
          initialTags={activeTags}
          initialSkills={Object.keys(skillsFeedback).length > 0 ? (skillsFeedback as any) : skillsChecklist}
          callMode="manual"
        />
      )}

      {/* Call Ended Early Dialog (Triggers when call lasts <= 70s / ~1m 10s) */}
      <CallEndedEarlyDialog
        isOpen={showEarlyDialog}
        onClose={() => setShowEarlyDialog(false)}
        candidate={activeCandidate}
        callDurationSeconds={earlyDialogDuration}
        callUuid={callUuid}
        callMode={callMode}
        onSuccess={({ note, tags }) => {
          if (note) setNotes(note);
          if (tags && tags.length > 0) {
            setActiveTags((prev) => Array.from(new Set([...prev, ...tags])));
          }
        }}
      />
    </div>
  );
}
