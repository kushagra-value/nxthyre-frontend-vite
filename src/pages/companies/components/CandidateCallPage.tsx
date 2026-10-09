import { jobPostService, Job } from '../../../services/jobPostService';
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import CallCandidateModal from "./CallCandidateModal";
import {
  Mic,
  PhoneOff,
  Pause,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  FastForward,
  Phone,
  FileText,
  Edit2,
  Check,
} from "lucide-react";
import { candidateService } from "../../../services/candidateService";
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
} from "../../../services/jobPipelineDashboardService";
import {
  startManualRecording,
  stopManualRecording,
  pauseManualRecording,
  resumeManualRecording,
  updateManualRecordingContext,
  waitForPendingUploads,
} from "../../../services/manualRecordingService";
import { useManualRecordingState } from "../../../hooks/useManualRecordingState";

function RecruiterGuidancePanel({ recruiter_guidance }: { recruiter_guidance?: string | null }) {
  const [showHelper, setShowHelper] = useState(false);

  // Fallback default guidance if not provided by the backend, to ensure the UI always appears
  const effectiveGuidance = recruiter_guidance || `💡 WHY WE ASK: This tests the candidate's depth of knowledge, problem-solving approach, and practical experience in this area. \n\n🗣️ CLARIFICATION & NUDGES: \n• If they are struggling, say: "Could you walk me through your general thought process or a simple example?" \n• If they get stuck, say: "Think about the primary trade-offs or alternatives for this approach."`;

  // Helper function to separate the guidance fields if you want custom structured UI
  const parseGuidance = (guidance: string) => {
    if (!guidance) return { whyWeAsk: '', nudges: '' };

    const parts = guidance.split('🗣️ CLARIFICATION & NUDGES:');
    const whyWeAsk = parts[0]?.replace('💡 WHY WE ASK:', '').trim();
    const nudges = parts[1]?.trim();

    return { whyWeAsk, nudges };
  };

  const { whyWeAsk, nudges } = parseGuidance(effectiveGuidance);

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <button
        onClick={() => setShowHelper(!showHelper)}
        className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
      >
        <span>{showHelper ? 'Hide Recruiter Help' : '💡 Need help? Show Quick-Scripts & context'}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${showHelper ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showHelper && (
        <div className="mt-3 text-slate-700 text-sm space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/60 animate-fadeIn">
          {/* Context Summary */}
          {whyWeAsk && (
            <div>
              <span className="font-bold text-slate-900 text-xs block uppercase tracking-wider mb-1">
                💡 Why We Ask This
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">
                {whyWeAsk}
              </p>
            </div>
          )}

          {/* Read Aloud Scripts */}
          {nudges && (
            <div className="border-t border-slate-100/80 pt-2.5">
              <span className="font-bold text-slate-900 text-xs block uppercase tracking-wider mb-1.5">
                🗣️ Read-Aloud Help Scripts
              </span>
              <div className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed space-y-1 bg-white p-3 rounded-lg border border-indigo-100">
                {nudges}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CandidateCallParams {
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
  callAttention?: string[];
  resumeUrl?: string;
  matchScore?: string | number | null;
}

function ScoreCircleBadge({ scoreVal }: { scoreVal?: string | number | null }) {
  let scoreNum = 0;
  if (scoreVal != null && scoreVal !== "" && scoreVal !== "--" && scoreVal !== "--%") {
    const parsed = parseInt(String(scoreVal).replace("%", ""), 10);
    if (!isNaN(parsed)) scoreNum = parsed;
  }

  const displayText =
    scoreVal == null || scoreVal === "" || scoreVal === "--" || scoreVal === "--%"
      ? "--%"
      : String(scoreVal).trim().endsWith("%")
        ? String(scoreVal).trim()
        : `${scoreVal}%`;

  const strokeColor = scoreNum >= 70 ? "#10B981" : scoreNum >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeDasharray={`${scoreNum}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-black text-[10px]" style={{ color: strokeColor }}>
        {displayText}
      </span>
    </div>
  );
}

const DUMMY_FALLBACK: CandidateCallParams = {
  id: "fallback",
  name: "Unknown Candidate",
  avatarInitials: "UN",
  headline: "Product Designer",
  currentCtc: "--",
  expectedCtc: "--",
  noticePeriod: "--",
  location: "--",
  experience: "0 yrs",
  resumeUrl: "",
  matchScore: null,
};

export default function CandidateCallPage() {
  // const { candidateId } = useParams();
  const { candidateId, jobId: routeJobId } = useParams();
  const persistedJobId = sessionStorage.getItem("nxthyre_companies_jobId");
  const jobId = routeJobId && routeJobId !== "0" ? routeJobId : (persistedJobId || "0");
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
        // Don't remove yet, we might need it for re-renders during init
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
        matchScore:
          incomingCandidate.matchScore ??
          incomingCandidate.score ??
          incomingCandidate.job_score?.candidate_match_score?.score ??
          null,
      }
      : null,
  );

  // Initialize call state from session if available
  const initialCallState = sessionData?.callState || (isManual ? "idle" : "initiating");
  const initialCallUuid = sessionData?.callUuid || null;

  // Manual call states
  const [manualCallConnected, setManualCallConnected] = useState(false);
  const [manualActiveTab, setManualActiveTab] = useState<"jobDescription" | "roleQuestions" | "skillAssessment">("jobDescription");

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
  const [isLoading, setIsLoading] = useState(false);

  // Manual recording states
  const [isManualRecording, setIsManualRecording] = useState(false);
  const isManualRecordingRef = useRef(false);
  const [isManualRecordingPaused, setIsManualRecordingPaused] = useState(false);
  const isManualRecordingPausedRef = useRef(false);
  const isMountedRef = useRef(true);
  const recordingState = useManualRecordingState();
  const isSavingRecording = recordingState.pendingUploads > 0;

  // Retain candidateList in session storage for navigation across reloads
  useEffect(() => {
    if (sessionData?.candidateList?.length) {
      try {
        const stored = sessionStorage.getItem("_nxthyre_call_state");
        const parsed = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ ...parsed, candidateList: sessionData.candidateList }));
      } catch { }
    }
  }, []);

  // Sync callUuid state to callUuidRef so handleSaveNotes always uses current callUuid
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
    lastSavedDataRef.current = "";
    callStartedAtRef.current = null;
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
        state: { candidateList }
      });
    }
  };

  const handleNavigateNext = () => {
    if (hasNextCandidate) {
      const nextId = candidateList[currentCandidateIndex + 1];
      navigate(`/call/${nextId}/${jobId || 0}?mode=${callMode}`, {
        state: { candidateList }
      });
    }
  };

  // Copilot States & Tabs
  const [activeTab, setActiveTab] = useState<
    "roleQuestions" | "transcript" | "quickNotes"
  >("roleQuestions");
  const [roleQuestions, setRoleQuestions] = useState<RoleQuestion[]>([]);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [competenciesData, setCompetenciesData] = useState<any>(null);
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);

  // Job ID ::
  // const jobId = location.state?.jobId || "";

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

  useEffect(() => {
    const dynamicSkills = jobData?.skills?.length ? jobData.skills : (jobData?.technical_competencies?.length ? jobData.technical_competencies : []);
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

  const [sdkReady, setSdkReady] = useState(false);
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

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    currentCtc: "",
    expectedCtc: "",
    noticePeriod: "",
    location: "",
    experience: "",
  });
  const [followUpReason, setFollowUpReason] = useState<string | null>(null);

  const handleStartEdit = () => {
    if (candidate) {
      setEditProfileData({
        currentCtc: candidate.currentCtc.replace(/[^0-9.]/g, ""),
        expectedCtc: candidate.expectedCtc.replace(/[^0-9.]/g, ""),
        noticePeriod: candidate.noticePeriod.replace(/[^0-9]/g, ""),
        location: candidate.location,
        experience: candidate.experience.replace(/[^0-9.]/g, ""),
      });
      setIsEditingProfile(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!candidate) return;
    try {
      const payload: Record<string, any> = {};
      const ctcNum = parseFloat(editProfileData.currentCtc);
      if (!isNaN(ctcNum)) payload.current_salary = ctcNum;
      const expectedNum = editProfileData.expectedCtc.trim();
      if (expectedNum) payload.expected_ctc = expectedNum;
      const noticeNum = parseInt(editProfileData.noticePeriod, 10);
      if (!isNaN(noticeNum)) payload.notice_period_days = noticeNum;
      if (editProfileData.location.trim()) payload.location = editProfileData.location.trim();
      const expNum = parseFloat(editProfileData.experience);
      if (!isNaN(expNum)) payload.exp = expNum;

      await candidateService.updateCandidateEditableFields(candidate.id, payload);

      // Update local candidate state with display-formatted values
      const updatedCandidate: CandidateCallParams = {
        ...candidate,
        currentCtc: !isNaN(ctcNum) ? `${ctcNum} LPA` : candidate.currentCtc,
        expectedCtc: expectedNum ? `${expectedNum} LPA` : candidate.expectedCtc,
        noticePeriod: !isNaN(noticeNum) ? `${noticeNum} days` : candidate.noticePeriod,
        location: editProfileData.location.trim() || candidate.location,
        experience: !isNaN(expNum) ? `${expNum} yrs` : candidate.experience,
      };
      setCandidate(updatedCandidate);

      // Update sessionStorage so refreshes reflect the new data without losing candidateList
      try {
        const stored = sessionStorage.getItem("_nxthyre_call_state");
        const parsedStored = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ ...parsedStored, candidate: updatedCandidate }));
      } catch { }

      setIsEditingProfile(false);
      showToast.success("Profile updated!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast.error("Failed to update profile.");
    }
  };

  // Re-fetch candidate details from backend on mount to ensure persistence across refreshes
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
          setCandidate((prev) => {
            const base = prev || DUMMY_FALLBACK;
            return {
              ...base,
              id: c.id || base.id,
              name: c.full_name || base.name,
              avatarInitials: c.full_name
                ? c.full_name.substring(0, 2).toUpperCase()
                : base.avatarInitials,
              headline: c.headline || base.headline,
              currentCtc: (c as any).current_salary != null
                ? `${(c as any).current_salary} LPA`
                : base.currentCtc,
              expectedCtc: (c as any).expected_ctc
                ? `${(c as any).expected_ctc} LPA`
                : base.expectedCtc,
              noticePeriod: c.notice_period_days != null
                ? `${c.notice_period_days} days`
                : base.noticePeriod,
              location: c.location || base.location,
              experience: c.total_experience != null
                ? `${c.total_experience} yrs`
                : base.experience,
              phone: c.phone || c.premium_data?.phone || base.phone,
              resumeUrl: c.premium_data?.resume_url || c.resume_url || base.resumeUrl,
              matchScore: fetchedMatchScore ?? base.matchScore ?? null,
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
        .catch((err) => console.error('Failed to fetch job data:', err));

      jobPostService.getJobCompetencies(numericJobId)
        .then(setCompetenciesData)
        .catch((err) => console.error('Failed to fetch job competencies:', err));
    }
  }, [jobId]);

  // ─── Register Plivo Browser SDK (WebRTC) ─────────────
  useEffect(() => {
    if (isManual) return; // Skip Plivo SDK for manual calls
    let cancelled = false;

    (async () => {
      try {
        // 1. Get JWT token from our backend
        const { username, password } = await getPlivoToken();
        if (cancelled) return;

        // 2. Dynamically import the Plivo Browser SDK
        const plivoModule = await import("plivo-browser-sdk");
        const PlivoClient = (plivoModule as any).Client || plivoModule.default;

        // 3. Initialize the SDK
        const plivoBrowser = new PlivoClient({
          debug: "INFO",
          permOnClick: true,
          enableTracking: true,
          closeProtection: false,
          maxAverageBitrate: 48000,
        });

        plivoRef.current = plivoBrowser;

        // 4. Set up event listeners
        plivoBrowser.client.on("onWebrtcNotSupported", () => {
          console.error("WebRTC is not supported in this browser");
        });

        plivoBrowser.client.on("onLogin", () => {
          console.log("Plivo SDK: Registered as", username);
          setSdkReady(true);
        });

        plivoBrowser.client.on("onLoginFailed", (reason: string) => {
          console.error("Plivo SDK: Login failed:", reason);
        });

        plivoBrowser.client.on(
          "onIncomingCall",
          (callerName: string, extraHeaders: any) => {
            console.log("Plivo SDK: Incoming call from", callerName);
            // Auto-answer the incoming bridged call
            plivoBrowser.client.answer();
          },
        );

        plivoBrowser.client.on("onIncomingCallCanceled", () => {
          console.log("Plivo SDK: Incoming call cancelled");
        });

        plivoBrowser.client.on("onCallRemoteRinging", () => {
          console.log("Plivo SDK: Remote ringing");
        });

        plivoBrowser.client.on("onCallAnswered", () => {
          console.log("Plivo SDK: Call answered — audio should be flowing");
          if (!callStartedAtRef.current) callStartedAtRef.current = Date.now();
          setCallState("answered");
        });

        plivoBrowser.client.on("onCallTerminated", () => {
          console.log("Plivo SDK: Call terminated");
        });

        plivoBrowser.client.on(
          "onMediaPermission",
          (permissionGranted: boolean) => {
            console.log(
              "Plivo SDK: Media permission:",
              permissionGranted ? "granted" : "denied",
            );
          },
        );

        // 5. Login/Register the endpoint
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
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // ─── Initiate Call on Mount ──────────────────────────
  useEffect(() => {
    if (isManual) return; // Skip call initiation for manual calls
    if (!candidate?.phone) return;

    // If we've already reached answered state from the modal, don't initiate again
    if (callState === "answered") {
      console.log("Call already answered, skipping initiation");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await initiateCall({ phone_numbers: [candidate.phone!] });
        if (cancelled) return;
        setCallState("dialing");
        // call_uuid may come from the status response
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
  }, [candidate?.phone]);

  // ─── Poll Call Status (platform mode only) ────────────────────
  useEffect(() => {
    // Skip polling for manual calls — no active Plivo call to poll
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
        }
        if (
          status.status === "completed" ||
          status.event === "hangup" ||
          status.event === "hangup_by_user"
        ) {
          setCallState("completed");
          setIsPaused(true);
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [callState, callUuid, isManual]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    // For manual mode, only run timer when connected and recording is not paused
    const shouldRun = isManual
      ? (manualCallConnected && !isPaused && !isManualRecordingPaused)
      : (!isPaused && callState !== "completed");
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
    // Only poll transcript if we have an active call uuid
    if (callUuid && callState !== "completed" && callState !== "error") {
      transcriptPollRef.current = setInterval(async () => {
        try {
          const res = await getLiveTranscript(callUuid);
          setTranscripts(res);
        } catch (err) {
          console.error("Transcript polling error:", err);
        }
      }, 5000); // UI updates every 5s with new STT & AI text
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
          console.error("Backend hangup error (continuing):", err);
        }
      }
      // 2. Disconnect the Browser SDK WebRTC call
      if (plivoRef.current) {
        try {
          plivoRef.current.client.hangup();
        } catch (err) {
          console.error("SDK hangup error:", err);
        }
      }
      setCallState("completed");
      setIsPaused(true);
    } catch (err) {
      console.error("Failed to end call:", err);
      // Still mark as completed locally
      setCallState("completed");
      setIsPaused(true);
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

  // const handleToggleHold = () => {
  //   setIsPaused((prev) => {
  //     const newPaused = !prev;
  //     if (plivoRef.current) {
  //       if (newPaused) {
  //         plivoRef.current.client.hold();
  //       } else {
  //         plivoRef.current.client.unhold();
  //       }
  //     }
  //     return newPaused;
  //   });
  // };

  const toggleManualRecording = async () => {
    const targetJobId = getValidJobId();
    if (isManualRecordingRef.current) {
      // ── STOP VOICE RECORDING ──
      // The recording service uploads first (with retry + IndexedDB backup), then logs
      // the stop event. It owns the work, so unmounting this page can't lose the audio.
      isManualRecordingRef.current = false;
      setIsManualRecording(false);
      isManualRecordingPausedRef.current = false;
      setIsManualRecordingPaused(false);

      // Refresh IDs in case the call_uuid / job loaded after recording started.
      updateManualRecordingContext({
        callUuid: callUuidRef.current || callUuid || undefined,
        jobId: targetJobId || undefined,
      });

      const result = await stopManualRecording();
      if (result.status === "uploaded") {
        showToast.success("Recording saved and processing...");
        // Auto-save call log when recording stops
        if (isMountedRef.current) handleSaveNotes(true);
      } else if (result.status === "empty") {
        showToast.error("No usable audio was captured. Check microphone access and record again.");
      } else if (result.status === "failed") {
        showToast.error(
          result.permanent
            ? `Recording could not be processed: ${result.error}`
            : "Recording upload failed. It is saved on this device and will retry automatically.",
        );
      }
    } else {
      // ── START VOICE RECORDING ──
      if (!candidate?.id) return;
      const recordingUuid = callUuidRef.current || callUuid || crypto.randomUUID();
      if (!callUuidRef.current) {
        callUuidRef.current = recordingUuid;
        setCallUuid(recordingUuid);
      }

      try {
        await startManualRecording({
          callUuid: recordingUuid,
          candidateId: candidate.id,
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

      // Log start only after the recorder has actually started capturing audio.
      if (targetJobId) {
        try {
          const eventRes = await logRecordingStartEvent({
            callUuid: recordingUuid,
            candidateId: candidate.id,
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
    }
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Leaving the page mid-recording: stop and let the service finish the upload.
      if (isManualRecordingRef.current) {
        void stopManualRecording();
      }
    };
  }, []);

  const lastSavedDataRef = useRef<string>("");
  const callUuidRef = useRef<string | null>(initialCallUuid);
  const isSavingRef = useRef(false);

  const handleSaveNotes = useCallback(async (isSilent = false) => {
    if (!candidate || isSavingRef.current) return;

    // Compare current state with last saved to avoid redundant saves
    const currentData = JSON.stringify({
      notes,
      activeTags,
      checklist,
      skillsChecklist,
      roleQuestionsData: roleQuestions.reduce((acc, q) => {
        acc[q.id] = q;
        return acc;
      }, {} as Record<number, any>)
    });

    if (currentData === lastSavedDataRef.current && callUuidRef.current) {
      console.log("No changes detected, skipping save.");
      return;
    }

    if (!isSilent) setIsSaving(true);
    isSavingRef.current = true;

    // Always use the latest UUID from the ref
    const finalCallUuid = callUuidRef.current;

    // Determine wall-clock duration integer to send
    const isCallCompleted = callState === "completed" || (!manualCallConnected && isManual) || isSilent;
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
        skills_data: skillsChecklist,
        role_questions_data: roleQuestions.reduce((acc, q) => {
          acc[q.id] = q;
          return acc;
        }, {} as Record<number, any>),
        call_mode: isManual ? "manual" : "platform",
        call_status: isManual && manualCallConnected ? "completed" : undefined
      });

      if (callLogRes.call_uuid) {
        callUuidRef.current = callLogRes.call_uuid;
        setCallUuid(callLogRes.call_uuid);
        lastSavedDataRef.current = currentData; // Update last saved state
      }

      if (!isSilent) showToast.success("Notes and checklist saved!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      if (!isSilent) showToast.error("Failed to save notes. Please try again.");
    } finally {
      isSavingRef.current = false;
      if (!isSilent) setIsSaving(false);
    }
  }, [
    candidate,
    notes,
    seconds,
    activeTags,
    checklist,
    skillsChecklist,
    roleQuestions,
    isManual,
    manualCallConnected,
    callState
  ]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      return next;
    });
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };



  const handleEvaluateQuestion = async (
    qId: number,
    status: RoleQuestion["status"],
  ) => {
    try {
      const updated = await evaluateRoleQuestion(qId, status);
      setRoleQuestions((prev) => prev.map((q) => (q.id === qId ? updated : q)));
    } catch (err) {
      console.error("Failed to update evaluation:", err);
    }
  };

  if (!candidate)
    return (
      <div className="p-10 flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  const tagsList = [
    { id: "Follow up", label: "Follow up", icon: "⏰" },
    { id: "Interested", label: "Interested", icon: "✅" },
    { id: "Strong Fit", label: "Strong Fit", icon: "⭐" },
    { id: "Didn't pick up", label: "Didn't pick up", icon: "☎️" },
    { id: "CTC Mismatch", label: "CTC Mismatch", icon: "💰" },
  ];
  const statusLabel =
    callState === "completed"
      ? "CALL ENDED"
      : callState === "error"
        ? "FAILED"
        : isPaused
          ? "PAUSED"
          : callState === "answered"
            ? "CONNECTED"
            : "DIALING...";

  return (
    <div className="flex flex-col w-screen h-screen overflow-y-auto min-[900px]:overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* 1. SINGLE CONSOLIDATED BLUE HEADER BAND (Ultra-Thin & Compact) */}
      <div className="bg-[#1D4ED8] relative text-white overflow-hidden px-4 py-2 shrink-0 shadow-md">
        {/* Visual Audio Rings / Concentric Circles Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-white/20"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full border border-white/20"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/30 bg-white/5"></div>
        </div>

        <div className="relative z-10 w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 min-h-[55px]">
          {/* LEFT GROUP: Back, Avatar, Candidate Name, Headline, Phone, LIVE, & Profile Info Pills */}
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white flex items-center gap-1 font-semibold text-xs transition-colors pr-2.5 border-r border-white/20 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0F47F2] text-xs font-bold shadow-sm">
                {candidate.avatarInitials || "UN"}
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#FF383C] rounded-full border border-[#1D4ED8] z-10"></div>
            </div>

            <div className="flex items-center gap-2 min-w-0 pr-2 border-r border-white/20">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white truncate leading-tight">
                    {candidate.name || "Unknown Candidate"}
                  </h1>
                  {((isManual && manualCallConnected) || (!isManual && callState !== "completed")) && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-widest flex items-center gap-1 uppercase shrink-0">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-100 truncate">
                  <span className="truncate max-w-[120px] opacity-90">{candidate.headline || "Product Designer"}</span>
                  <span className="bg-[#BFDBFE] text-[#0F47F2] font-bold px-2 py-0.5 rounded-full text-[10px] shrink-0">
                    {candidate.phone || "No phone"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info inline pills (CTC, Exp CTC, NP, Loc, Exp) */}
            <div className="flex items-center gap-1.5 text-[11px] bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 shrink-0">
              <div className="flex items-center gap-1 border-r border-white/15 pr-2">
                <span className="text-blue-200 text-[10px]">CTC:</span>
                {isEditingProfile ? (
                  <input
                    type="number"
                    step="any"
                    value={editProfileData.currentCtc}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, currentCtc: e.target.value }))}
                    className="w-20 text-slate-800 bg-white rounded px-2 py-0.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span className="font-bold text-white text-xs">{candidate.currentCtc}</span>
                )}
              </div>

              <div className="flex items-center gap-1 border-r border-white/15 pr-2">
                <span className="text-blue-200 text-[10px]">Exp CTC:</span>
                {isEditingProfile ? (
                  <input
                    type="number"
                    step="any"
                    value={editProfileData.expectedCtc}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, expectedCtc: e.target.value }))}
                    className="w-20 text-slate-800 bg-white rounded px-2 py-0.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span className="font-bold text-white text-xs">{candidate.expectedCtc}</span>
                )}
              </div>

              <div className="flex items-center gap-1 border-r border-white/15 pr-2">
                <span className="text-blue-200 text-[10px]">NP:</span>
                {isEditingProfile ? (
                  <input
                    type="number"
                    value={editProfileData.noticePeriod}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, noticePeriod: e.target.value }))}
                    className="w-16 text-slate-800 bg-white rounded px-2 py-0.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span className="font-bold text-white text-xs">{candidate.noticePeriod}</span>
                )}
              </div>

              <div className="flex items-center gap-1 border-r border-white/15 pr-2">
                <span className="text-blue-200 text-[10px]">Loc:</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editProfileData.location}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-24 text-slate-800 bg-white rounded px-2 py-0.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ) : (
                  <span className="font-bold text-white text-xs">{candidate.location}</span>
                )}
              </div>

              <div className="flex items-center gap-1 pr-1">
                <span className="text-blue-200 text-[10px]">Exp:</span>
                {isEditingProfile ? (
                  <input
                    type="number"
                    step="any"
                    value={editProfileData.experience}
                    onChange={(e) => setEditProfileData((prev) => ({ ...prev, experience: e.target.value }))}
                    className="w-16 text-slate-800 bg-white rounded px-2 py-0.5 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <span className="font-bold text-white text-xs">{candidate.experience}</span>
                )}
              </div>

              <button
                onClick={isEditingProfile ? handleUpdateProfile : handleStartEdit}
                className={`p-1 rounded transition-colors ${isEditingProfile ? "bg-emerald-500 text-white" : "text-blue-200 hover:text-white hover:bg-white/10"
                  }`}
                title={isEditingProfile ? "Save Profile" : "Edit Profile"}
              >
                {isEditingProfile ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* RIGHT GROUP: Candidate Navigation & Call Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* CALL CONTROLS & TIMER */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shrink-0">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                <span className="text-base font-mono font-bold tracking-wider leading-none text-white">
                  {formatTime(seconds)}
                </span>
              </div>

              {/* Action Buttons Row */}
              {isManual ? (
                !manualCallConnected ? (
                  <button
                    onClick={() => {
                      if (!callUuid) setCallUuid(crypto.randomUUID());
                      setManualCallConnected(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-full bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold uppercase transition"
                  >
                    <Phone className="w-3 h-3 fill-current" /> Start Call
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* RECORD */}
                    <button
                      onClick={toggleManualRecording}
                      disabled={isSavingRecording && !isManualRecording}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${isManualRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/20 hover:bg-white/30 text-white"
                        }`}
                    >
                      <Mic className={`w-3 h-3 ${isManualRecording && !isManualRecordingPaused ? "animate-pulse" : ""}`} />
                      <span>{isManualRecording ? "REC" : isSavingRecording ? "SAVING…" : "REC"}</span>
                    </button>

                    {/* PAUSE */}
                    <button
                      onClick={handlePauseResumeRecording}
                      disabled={!isManualRecording}
                      className={`p-1 rounded-full text-white transition disabled:opacity-40 ${isManualRecordingPaused ? "bg-amber-500" : "bg-white/20 hover:bg-white/30"
                        }`}
                    >
                      {isManualRecordingPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                    </button>

                    {/* END CALL */}
                    <button
                      onClick={() => {
                        setManualCallConnected(false);
                        setIsPaused(true);
                        if (isManualRecordingRef.current) toggleManualRecording();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase transition"
                    >
                      <PhoneOff className="w-3 h-3" /> End
                    </button>
                  </div>
                )
              ) : (
                /* Platform Call Controls */
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleRecording}
                    disabled={!callUuid || callState === "completed"}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${isRecording ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isRecording ? "REC" : "REC"}</span>
                  </button>

                  <button
                    disabled={callState === "completed"}
                    className={`p-1 rounded-full transition ${isPaused ? "bg-white text-[#1D4ED8]" : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                  </button>

                  <button
                    onClick={handleEndCall}
                    disabled={!callUuid || callState === "completed" || isEndingCall}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase transition"
                  >
                    <PhoneOff className="w-3 h-3" /> End
                  </button>
                </div>
              )}
            </div>

            {/* Candidate Navigation (Always Rendered in Header) */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
              <span className="text-blue-200 text-[9px] font-bold tracking-wider uppercase hidden sm:inline">
                {currentCandidateIndex >= 0 ? currentCandidateIndex + 1 : 1}/{candidateList.length || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNavigatePrev}
                  disabled={!hasPrevCandidate}
                  className={`p-1 rounded transition-colors ${hasPrevCandidate
                    ? "bg-white/15 border border-white/25 text-white hover:bg-white/30 cursor-pointer"
                    : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  title="Previous Candidate"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNavigateNext}
                  disabled={!hasNextCandidate}
                  className={`p-1 rounded transition-colors ${hasNextCandidate
                    ? "bg-white/15 border border-white/25 text-white hover:bg-white/30 cursor-pointer"
                    : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                    }`}
                  title="Next Candidate"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN AREA BELOW BAND (2-Column Split: 50% Left / 50% Resume Right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 min-[900px]:grid-cols-2 overflow-hidden bg-slate-50">

        {/* LEFT COLUMN */}
        <div className="flex flex-col min-h-0 border-r border-slate-200 bg-white">

          {/* Tabs Navigation */}
          <div className="flex px-6 gap-6 border-b border-slate-200 bg-white shrink-0">
            {[
              { id: "jobDescription", label: "Job Description" },
              { id: "roleQuestions", label: "Role Questions" },
              // { id: "skillAssessment", label: "Skill Assessment" },
            ].map((tab) => {
              const isActive = manualActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setManualActiveTab(tab.id as any)}
                  className={`py-3.5 font-bold text-sm relative transition-colors ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">

            {/* TAB 1: JOB DESCRIPTION */}
            {manualActiveTab === "jobDescription" && (
              <div className="flex flex-col w-full max-w-5xl mx-auto break-words pb-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-7 w-full relative">

                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                      {jobData?.title || "Loading Job Details..."} {jobData?.workspace_details?.name ? `| ${jobData.workspace_details.name}` : ""}
                    </h2>
                  </div>

                  {/* Job Summary Section */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Job Summary</h3>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { label: "Job Title", value: jobData?.title },
                        { label: "Company", value: jobData?.workspace_details?.name },
                        { label: "Location", value: jobData?.location?.join(' · ') || "Bangalore" },
                        { label: "Salary Range", value: jobData?.salary_min ? `₹${jobData.salary_min}L – ₹${jobData.salary_max}L per annum` : "₹1500000.00L – ₹2800000.00L per annum" },
                        { label: "Experience", value: jobData?.experience_min_years ? `${jobData.experience_min_years}–${jobData.experience_max_years} years` : "2–8 years" },
                        { label: "Openings", value: jobData?.No_of_opening_or_positions_ || jobData?.num_positions || "85" },
                        { label: "Notice Period", value: jobData?.notice_period || "60 Days" },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors group text-xs">
                          <span className="text-slate-500 font-medium">{row.label}</span>
                          <span className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side-by-side: Primary Skills & Must Have */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Primary Skills Section */}
                    <div className="bg-[#F4F7FF] rounded-xl p-5 border border-[#E0E7FF]/50 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Primary Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(jobData?.skills?.length ? jobData.skills : ["Automation Tools", "Us Healthcare Domain Knowledge", "API testing"]).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-white rounded-lg text-xs text-blue-600 font-bold shadow-sm border border-blue-100 hover:border-blue-300 transition-all cursor-default"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Must Have Section */}
                    <div className="bg-[#FFF1F2] rounded-xl p-5 border border-[#FFE4E6] flex flex-col">
                      <h3 className="text-xs font-bold text-rose-600 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Must Have
                      </h3>
                      <ul className="space-y-2.5">
                        {(competenciesData?.the_core_expectation?.length
                          ? competenciesData.the_core_expectation
                          : (jobData?.description?.split('\n').filter((l: string) => l.includes('Must') || l.includes('experience')).slice(0, 3) || ["Strong technical knowledge and problem-solving skills"])
                        ).map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 group">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-rose-400 transition-colors shrink-0" />
                            <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                              {item}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: ROLE QUESTIONS */}
            {manualActiveTab === "roleQuestions" && (
              <div className="flex flex-col gap-5 max-w-4xl mx-auto">
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-slate-800">Role Questions</h2>
                  <p className="text-slate-500 text-sm">
                    Suggested questions to evaluate {candidate.headline} skills.
                  </p>
                </div>
                {roleQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-slate-800 font-semibold mb-1.5 leading-snug">
                            {q.question_text}
                          </h3>
                          <p className="text-slate-500 text-sm italic bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            {q.ideal_answer_concept}
                          </p>
                          <RecruiterGuidancePanel recruiter_guidance={q.recruiter_guidance} />
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEvaluateQuestion(q.id, "convinced")}
                          className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "convinced"
                            ? "bg-green-100 text-green-700 border-green-300 shadow-sm"
                            : "bg-white text-slate-500 hover:bg-green-50 hover:text-green-600 border-slate-200"
                            }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Convinced
                        </button>
                        <button
                          onClick={() => handleEvaluateQuestion(q.id, "not_convinced")}
                          className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "not_convinced"
                            ? "bg-red-100 text-red-700 border-red-300 shadow-sm"
                            : "bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200"
                            }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Not Convinced
                        </button>
                        <button
                          onClick={() => handleEvaluateQuestion(q.id, "skipped")}
                          className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "skipped"
                            ? "bg-slate-200 text-slate-700 border-slate-300 shadow-sm"
                            : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                            }`}
                        >
                          <FastForward className="w-3.5 h-3.5" /> Skip
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        {q.status === "convinced" && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Score: 100%</span>
                        )}
                        {q.status === "not_convinced" && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Score: 0%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {roleQuestions.length === 0 && (
                  <div className="text-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    Generating questions with Gemini...
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SKILL ASSESSMENT (Commented out at present for future use) */}
            {/* {manualActiveTab === "skillAssessment" && (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">SKILL ASSESSMENT</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                      const dynamicSkills = jobData?.skills?.length
                        ? jobData.skills
                        : jobData?.technical_competencies?.length
                          ? jobData.technical_competencies
                          : ["Figma / Design Tools", "Hi-fi wireframing", "Auto layout & constraints"];
                      return dynamicSkills.map((skill, index) => {
                        const isChecked = skillsChecklist[skill] || false;
                        const colors = [
                          "bg-blue-600",
                          "bg-red-500",
                          "bg-yellow-500",
                          "bg-emerald-500",
                          "bg-purple-500",
                          "bg-pink-500",
                          "bg-indigo-500",
                          "bg-orange-500",
                        ];
                        const color = isChecked ? colors[index % colors.length] : "bg-slate-200";

                        return (
                          <label
                            key={skill}
                            className="flex items-center gap-3 cursor-pointer group p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => setSkillsChecklist((prev) => ({ ...prev, [skill]: !prev[skill] }))}
                              className={`w-4 h-4 rounded border-slate-300 ${isChecked ? "accent-blue-600" : ""}`}
                            />
                            <span className={`w-2 h-2 rounded-full ${color}`}></span>
                            <span className={`text-sm font-medium ${isChecked ? "text-slate-800 font-semibold" : "text-slate-600"}`}>
                              {skill}
                            </span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-blue-600 mb-4 uppercase tracking-widest">
                    Recruiter Verification Checklist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <label className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={checklist.ctcConfirmed}
                        onChange={() => toggleChecklist("ctcConfirmed")}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className={`font-semibold text-xs ${checklist.ctcConfirmed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          Current CTC confirmed?
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Ask exact in-hand + variables</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={checklist.ctcFlexibility}
                        onChange={() => toggleChecklist("ctcFlexibility")}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className={`font-semibold text-xs ${checklist.ctcFlexibility ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          Expected CTC & flexibility?
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Range + negotiation room</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={checklist.noticePeriod}
                        onChange={() => toggleChecklist("noticePeriod")}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className={`font-semibold text-xs ${checklist.noticePeriod ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          Notice period & buyout option?
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Exact days, can employer waive?</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={checklist.location}
                        onChange={() => toggleChecklist("location")}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <p className={`font-semibold text-xs ${checklist.location ? "text-slate-400 line-through" : "text-slate-700"}`}>
                          Current location & relocation?
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">Open to onsite?</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )} */}

          </div>

          {/* Quick Notes Pinned at Bottom of Left Column (Clean Light Input Box) */}
          <div className="border-t border-slate-200 bg-white p-4 shrink-0 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">📝</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">QUICK NOTES</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {tagsList.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border border-dashed flex items-center gap-1.5 ${activeTags.includes(tag.id)
                    ? "bg-blue-50 text-blue-600 border-blue-400 font-semibold"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add key notes"
                className="flex-1 bg-slate-50 hover:bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all shadow-inner"
              />
              <button
                onClick={() => handleSaveNotes()}
                disabled={isSaving}
                className="bg-[#0F47F2] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 min-w-[70px] shadow-sm"
              >
                {isSaving ? "..." : "Add"}
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Candidate Resume (Expanded Width & Optimized PDF Viewport) */}
        <div className="flex flex-col min-h-0 bg-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
            <h2 className="text-base font-bold text-slate-800">Candidate Resume</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ScoreCircleBadge scoreVal={candidate?.matchScore} />
                <span className="text-xs font-semibold text-slate-500">Match</span>
              </div>
              {((candidate as any)?.screening_score ?? (candidate as any)?.screening_round_score) != null && (
                <div className="flex items-center gap-2">
                  <ScoreCircleBadge scoreVal={(candidate as any)?.screening_score ?? (candidate as any)?.screening_round_score} />
                  <span className="text-xs font-semibold text-slate-500">Screening</span>
                </div>
              )}
            </div>
          </div>

          {/* Resume Viewer Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 custom-scrollbar bg-slate-100/70">
            {candidate.resumeUrl ? (() => {
              const url = candidate.resumeUrl;
              const ext = url.split(".").pop()?.toLowerCase() || "";
              const isPdf = ext === "pdf";
              const isDocViewerSupported = ["docx", "doc", "txt", "rtf"].includes(ext);

              // Append PDF Open Parameters view=FitH to automatically zoom the page to full horizontal container width
              const pdfUrlWithParams = isPdf
                ? (url.includes("#") ? url : `${url}#view=FitH&toolbar=1&pagemode=thumbs`)
                : url;

              const viewerUrl = isDocViewerSupported
                ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
                : pdfUrlWithParams;

              if (isPdf) {
                return (
                  <embed
                    src={pdfUrlWithParams}
                    type="application/pdf"
                    className="w-full h-full min-h-[650px] border-0 rounded-lg shadow-sm"
                  />
                );
              }
              if (isDocViewerSupported) {
                return (
                  <iframe
                    src={viewerUrl}
                    className="w-full h-full min-h-[650px] border-0 rounded-lg shadow-sm"
                    title="Candidate Resume"
                  />
                );
              }
              return (
                <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Resume format not supported for inline viewing</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm mt-2 inline-block"
                    >
                      Download or open in a new tab
                    </a>
                  </div>
                </div>
              );
            })() : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No resume uploaded</p>
                  <p className="text-sm mt-1">Resume will appear here when available</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Follow Up Modal Overlay for Manual Call Failures */}
      {followUpReason && (
        <CallCandidateModal
          isOpen={!!followUpReason}
          onClose={async () => {
            await waitForPendingUploads();
            window.location.href = "/";
          }}
          candidate={candidate ? {
            ...candidate,
            phone: candidate.phone || "",
          } : null}
          jobId={jobId ? parseInt(jobId, 10) : undefined}
          initialStep="noAnswer"
          initialReason={followUpReason}
          initialNote={notes}
          initialTags={activeTags}
          initialSkills={skillsChecklist}
          callMode="manual"
        />
      )}
    </div>
  );
}
