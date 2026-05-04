import { jobPostService, Job } from '../../../services/jobPostService';
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import CallCandidateModal from "./CallCandidateModal";
import {
  Mic,
  MicOff,
  PhoneOff,
  Pause,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  XCircle,
  FastForward,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  Phone,
  RotateCcw,
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
  processManualRecording,
  type CallStatus,
  type RoleQuestion,
  type LiveTranscript,
} from "../../../services/jobPipelineDashboardService";

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
};

export default function CandidateCallPage() {
  // const { candidateId } = useParams();
  const { candidateId, jobId } = useParams();
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
    } catch {}
    return null;
  })();

  const incomingCandidate = location.state?.candidate || sessionData?.candidate || null;
  const [candidate, setCandidate] = useState<CandidateCallParams | null>(
    incomingCandidate,
  );

  // Initialize call state from session if available
  const initialCallState = sessionData?.callState || (isManual ? "idle" : "initiating");
  const initialCallUuid = sessionData?.callUuid || null;

  // Manual call states
  const [manualCallConnected, setManualCallConnected] = useState(false);
  const [manualActiveTab, setManualActiveTab] = useState<"jobDescription" | "roleQuestions" | "resume">("jobDescription");

  // Call States
  const [seconds, setSeconds] = useState(0);
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Clear candidate from session storage once we've consumed it, but keep the list for navigation
  useEffect(() => {
    if (sessionData) {
      sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ ...sessionData, candidate: null }));
    }
  }, []);

  const candidateList = sessionData?.candidateList || [];
  const currentCandidateIndex = candidateList.indexOf(candidateId || "");
  const hasPrevCandidate = currentCandidateIndex > 0;
  const hasNextCandidate = currentCandidateIndex !== -1 && currentCandidateIndex < candidateList.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrevCandidate) {
      const nextId = candidateList[currentCandidateIndex - 1];
      navigate(`/call/${nextId}/${jobId || 0}?mode=manual`);
    }
  };

  const handleNavigateNext = () => {
    if (hasNextCandidate) {
      const nextId = candidateList[currentCandidateIndex + 1];
      navigate(`/call/${nextId}/${jobId || 0}?mode=manual`);
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

      // Update sessionStorage so refreshes reflect the new data
      try {
        sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ candidate: updatedCandidate }));
      } catch {}

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
        const details = await candidateService.getCandidateDetails(candidateId);
        const c = details?.candidate;
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
            };
          });
        }
      } catch (err) {
        console.error("Failed to re-fetch candidate details:", err);
      }
    })();
  }, [candidateId]);

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
      Promise.all([
        jobPostService.getJob(numericJobId),
        jobPostService.getJobCompetencies(numericJobId),
      ])
        .then(([job, comp]) => {
          setJobData(job);
          setCompetenciesData(comp);
        })
        .catch((err) => {
          console.error('Failed to fetch job data:', err);
        });
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
    // For manual mode, only run timer when connected
    const shouldRun = isManual
      ? (manualCallConnected && !isPaused)
      : (!isPaused && callState !== "completed");
    if (shouldRun) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, callState, isManual, manualCallConnected]);

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

  // ─── Call Controls ───────────────────────────────────
  const handleEndCall = useCallback(async () => {
    if (isEndingCall) return;
    setIsEndingCall(true);
    try {
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
      // Auto-save when call ends
      setTimeout(() => handleSaveNotes(true), 500);
    } catch (err) {
      console.error("Failed to end call:", err);
      // Still mark as completed locally
      setCallState("completed");
      setIsPaused(true);
    } finally {
      setIsEndingCall(false);
    }
  }, [callUuid, isEndingCall]);

  const handleToggleRecording = useCallback(async () => {
    if (!callUuid) return;
    try {
      if (isRecording) {
        await stopRecording(callUuid);
        setIsRecording(false);
      } else {
        await startRecording(callUuid);
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Recording toggle error:", err);
    }
  }, [callUuid, isRecording]);

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
    if (isManualRecordingRef.current) {
      // ── STOP VOICE RECORDING ──
      isManualRecordingRef.current = false;
      setIsManualRecording(false);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        // The submission logic is handled in the onstop callback
      }
    } else {
      // ── START VOICE RECORDING ──
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Use a supported mime type for Gemini
        const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Compile chunks into a single Blob
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          if (candidate && callUuid && audioBlob.size > 0) {
            console.log("Submitting manual recording audio file...");
            const formData = new FormData();
            formData.append("audio", audioBlob, "manual_call.webm");
            formData.append("call_uuid", callUuid);
            formData.append("candidate_id", candidate.id);
            formData.append("recording_duration", seconds.toString());

            try {
              await processManualRecording(formData);
              console.log("Audio recording submitted successfully.");
              showToast.success("Recording saved and processing...");
              // Auto-save call log when recording stops
              handleSaveNotes(true);
            } catch (err) {
              console.error("Failed to submit manual recording audio:", err);
            }
          }

          // Clean up the stream
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        isManualRecordingRef.current = true;
        setIsManualRecording(true);
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          showToast.error("Microphone access failed. Please check permissions.");
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSaveNotes = useCallback(async (isSilent = false) => {
    if (!candidate) return;
    if (!isSilent) setIsSaving(true);
    let finalCallUuid = callUuid;
    try {
      const callLogRes = await saveCallLog({
        call_uuid: finalCallUuid || undefined,
        candidate_id: candidate.id,
        note: notes || undefined,
        duration_seconds: seconds,
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
      
      finalCallUuid = callLogRes.call_uuid || finalCallUuid;
      
      if (!isSilent) showToast.success("Notes and checklist saved!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      if (!isSilent) showToast.error("Failed to save notes. Please try again.");
    } finally {
      if (!isSilent) setIsSaving(false);
    }
  }, [
    candidate,
    callUuid,
    notes,
    seconds,
    activeTags,
    checklist,
    skillsChecklist,
    roleQuestions,
    isManual,
    manualCallConnected
  ]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      // Save immediately in background
      setTimeout(() => handleSaveNotes(true), 100);
      return next;
    });
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setTimeout(() => handleSaveNotes(true), 100);
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

  const statusColor =
    callState === "completed" || callState === "error"
      ? "text-red-400"
      : "text-[#22C55E]";

  return (
    <div className="flex flex-col lg:flex-row w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-[20%] h-full flex flex-col items-center justify-center bg-[#1D4ED8] relative text-white overflow-hidden p-6 shrink-0 z-10 transition-all">
        {/* Visual Audio Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none fixed">
          <div className="w-[800px] h-[800px] rounded-full border border-white/20"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/20"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-white/20"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/30 bg-white/5"></div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-white/40 bg-white/10"></div>
        </div>

        {/* Back button and Navigation */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <button
            onClick={() => {
              navigate(`/`)
            }}
            className="text-white/70 hover:text-white flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          {candidateList.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleNavigatePrev}
                disabled={!hasPrevCandidate}
                className={`p-1.5 rounded-md backdrop-blur-md transition ${hasPrevCandidate ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white/5 text-white/30 cursor-not-allowed"}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white/70 text-xs font-medium">
                {currentCandidateIndex + 1} / {candidateList.length}
              </span>
              <button
                onClick={handleNavigateNext}
                disabled={!hasNextCandidate}
                className={`p-1.5 rounded-md backdrop-blur-md transition ${hasNextCandidate ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white/5 text-white/30 cursor-not-allowed"}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isManual ? (
          /* ─── MANUAL CALL LEFT PANEL ─── */
          <div className="z-10 flex flex-col items-center w-full max-w-sm mt-16 pb-[300px]">
            <div className="relative mb-4">
              <div className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-full bg-white flex items-center justify-center text-[#0F47F2] text-2xl lg:text-3xl font-medium shadow-[0px_2px_10px_4px_rgba(0,0,0,0.25)] transition-all">
                {candidate.avatarInitials || "UN"}
              </div>
              <div className="absolute bottom-1 right-1 lg:right-2 w-4 h-4 lg:w-5 lg:h-5 bg-[#FF383C] rounded-full shadow-[0px_2px_10px_4px_rgba(0,0,0,0.25)] border-[2px] border-[#1D4ED8] z-10 transition-all"></div>
            </div>

            <h1 className="text-lg font-medium mb-0 text-center text-[#F3F5F7] mt-1 transition-all break-words leading-tight px-2">{candidate.name || "Unknown Candidate"}</h1>
            <p className="text-[#F3F5F7] text-[11px] mb-4 text-center leading-snug px-2 opacity-80">{candidate.headline || "Product Designer"}</p>

            <div className="bg-[#BFDBFE] rounded-full px-3 flex items-center justify-center w-fit h-[28px] mb-3 transition-all shadow-sm">
              <span className="text-[#0F47F2] font-medium text-xs lg:text-sm transition-all tracking-tight">
                {candidate.phone || "No phone provided"}
              </span>
            </div>

            <div className="bg-transparent px-2 flex items-center justify-center gap-1.5 mb-6 h-[24px]">
              <span className="text-[#00C8B3] text-[10px] font-bold uppercase tracking-[0.04em]">
                · ON MANUAL CALL
              </span>
            </div>

            {!manualCallConnected ? (
              <div className="flex flex-col items-center mt-4">
                <button
                  onClick={() => {
                    if (!callUuid) setCallUuid(crypto.randomUUID());
                    setManualCallConnected(true);
                  }}
                  className="w-[40px] h-[40px] lg:w-[48px] lg:h-[48px] rounded-full bg-[#10B981] flex items-center justify-center hover:bg-[#059669] transition-transform active:scale-95 border border-white/20 shadow-lg shadow-green-900/30"
                >
                  <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-white fill-current" />
                </button>
                <span className="text-[#F3F5F7] font-normal text-xs mt-2 tracking-wide">Start Call</span>
              </div>
            ) : (
              /* Post-connection: timer + controls */
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl font-light tracking-widest mb-1">
                  {formatTime(seconds)}
                </div>
                <div className="text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 text-[#22C55E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                  CONNECTED (MANUAL)
                </div>
                
                {/* Manual Call Controls */}
                <div className="mt-6 flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={toggleManualRecording}
                          className={`w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-lg z-10 relative ${isManualRecording ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}
                        >
                          <Mic className={`w-5 h-5 ${isManualRecording ? "animate-pulse" : ""}`} />
                        </button>
                        {isManualRecording && (
                          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 -z-0"></div>
                        )}
                      </div>
                      <span className="text-xs text-white uppercase tracking-widest font-semibold">
                        {isManualRecording ? "Stop Rec" : "Record"}
                      </span>
                    </div>

                  {/* End Call Button */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => {
                        setManualCallConnected(false);
                        setIsPaused(true);
                        if (isManualRecordingRef.current) {
                          toggleManualRecording();
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-red-500 text-white shadow-xl shadow-red-500/40 flex items-center justify-center hover:bg-red-600 transition hover:scale-105 active:scale-95"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] text-white uppercase tracking-widest font-semibold">
                      End Call
                    </span>
                  </div>
                </div>
                
                  {isManualRecording && (
                    <div className="mt-4 w-full px-4 max-h-24 overflow-y-auto text-xs text-slate-300 italic text-center custom-scrollbar">
                      Recording audio...
                    </div>
                  )}
              </div>
            )}
            
            {/* QUICK NOTES - pinned to bottom of left panel */}
            <div className="absolute bottom-0 left-0 right-0 bg-white z-20">
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">📝</span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Quick Notes</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagsList.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-colors border border-dashed flex items-center gap-1.5 ${
                        activeTags.includes(tag.id) 
                          ? "bg-blue-50 text-blue-600 border-blue-400" 
                          : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
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
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSaveNotes()}
                    disabled={isSaving}
                    className="bg-[#0F47F2] text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 min-w-[70px]"
                  >
                    {isSaving ? "..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── PLATFORM CALL LEFT PANEL (original) ─── */
          <>
            {/* Profile Center View */}
            <div className="z-10 flex flex-col items-center mt-[-3rem]">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-[#1D4ED8] text-4xl font-semibold shadow-2xl">
                  {candidate.avatarInitials}
                </div>
                {callState !== "completed" && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-[#1D4ED8]"></div>
                )}
              </div>

              <h1 className="text-3xl font-semibold mb-2">{candidate.name}</h1>
              <p className="text-blue-200 text-sm mb-6">{candidate.headline}</p>

              {/* Timer */}
              <div className="text-4xl font-light tracking-widest mb-3">
                {formatTime(seconds)}
              </div>
              <div
                className={`text-xs tracking-[0.2em] uppercase font-bold flex items-center gap-2 ${statusColor}`}
              >
                {callState !== "completed" && callState !== "error" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                )}
                {statusLabel}
              </div>
            </div>

            {/* Call Controls */}
            <div className="z-10 mt-16 flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleToggleRecording}
                  disabled={!callUuid || callState === "completed"}
                  className={`w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-lg disabled:opacity-40 ${isRecording ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30"}`}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isRecording ? "bg-white animate-pulse" : "bg-white"}`}
                    ></div>
                  </div>
                </button>
                <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
                  {isRecording ? "Stop Rec" : "Record"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  disabled={callState === "completed"}
                  className={`w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-lg disabled:opacity-40 ${isPaused ? "bg-white text-[#1D4ED8]" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  {isPaused ? (
                    <Play className="w-5 h-5 fill-current" />
                  ) : (
                    <Pause className="w-5 h-5 fill-current" />
                  )}
                </button>
                <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
                  Hold
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleMuteToggle}
                  disabled={callState === "completed"}
                  className={`w-14 h-14 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-lg disabled:opacity-40 ${isMuted ? "bg-white text-[#1D4ED8]" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
                  Mute
                </span>
              </div>
            </div>

            {/* End Call */}
            <div className="z-10 mt-12 flex flex-col items-center gap-3">
              <button
                onClick={handleEndCall}
                disabled={!callUuid || callState === "completed" || isEndingCall}
                className="w-16 h-16 rounded-full bg-red-500 text-white shadow-xl shadow-red-500/40 flex items-center justify-center hover:bg-red-600 transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <span className="text-xs text-white uppercase tracking-widest font-semibold">
                {isEndingCall ? "Ending..." : "End Call"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* RIGHT COLUMN: RECRUITER ASSISTANT PANEL */}
      <div className={`w-[80%] flex ${isManual ? "flex-col lg:flex-row" : "flex-col"} h-full overflow-hidden bg-white shadow-xl shadow-slate-200 relative`}>
        {/* Main content area */}
        <div className={`flex flex-col ${isManual ? "w-[75%] min-w-0 h-full" : "h-full w-full"} overflow-hidden`}>
        {/* Header & Candidate Summary Strip */}
        <div className="bg-white border-b border-slate-200 shrink-0">
          <div className="h-[80px] flex items-center justify-between px-8">
            <div className="flex items-center gap-4 text-lg font-medium text-slate-800">
              <span className="text-slate-400">
                {isManual
                  ? manualCallConnected ? "Call in progress —" : "Manual call —"
                  : callState === "completed"
                    ? "Call ended —"
                    : "Call in progress —"}
              </span>
              <span className="text-blue-600 font-bold">{candidate.name}</span>
              {((isManual && manualCallConnected) || (!isManual && callState !== "completed")) && (
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold tracking-widest flex items-center gap-1.5 uppercase shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            {!isManual && (
              <span className="text-xs text-slate-400 font-medium">
                {candidate.headline}
              </span>
            )}
          </div>
          {/* Tab Navigation */}
          <div className="flex px-8 gap-8 border-t border-slate-100 bg-slate-50/50">
            {isManual ? (
              /* Manual mode tabs: Candidate Resume | Role Questions */
              <>
                {(["jobDescription", "roleQuestions", "resume"] as const).map((tab) => {
                  const labels = {
                    jobDescription: "Job Description",
                    roleQuestions: "Role Questions",
                    resume: "Candidate Resume",
                  };
                  const isActive = manualActiveTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setManualActiveTab(tab)}
                      className={`py-4 font-semibold text-sm relative transition-colors ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {labels[tab]}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              /* Platform mode tabs (original) */
              <>
            {["roleQuestions", "transcript", "quickNotes"].map((tab) => {
              const labels = {
                roleQuestions: "Role Questions (AI)",
                transcript: "Transcript + AI",
                quickNotes: "Quick Notes & Checklist",
              };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 font-semibold text-sm relative transition-colors ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {labels[tab as keyof typeof labels]}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
              </>
            )}
          </div>
        </div>
        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar bg-slate-50/30">
          {/* MANUAL MODE TABS */}
          {isManual && manualActiveTab === "jobDescription" && (
            <div className="flex flex-col h-full w-full max-w-4xl mx-auto break-words pb-10">
              <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm p-8 md:p-10 w-full relative">
                
                {/* Floating Avatars (Premium touch from design)
                <div className="absolute top-8 right-8 flex -space-x-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:-translate-x-1">
                    <img src="https://i.pravatar.cc/150?u=1" alt="Recruiter 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-xl overflow-hidden transition-transform group-hover:translate-x-1">
                    <img src="https://i.pravatar.cc/150?u=2" alt="Recruiter 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div> */}

                {/* Header */}
                <div className="mb-8 pr-24">
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                    {jobData?.title || candidate.headline} {jobData?.workspace_details?.name ? `V2 - ${jobData.workspace_details.name}` : ""}
                  </h2>
                </div>

                {/* Job Summary Section */}
                <div className="mb-10">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Job Summary</h3>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: "Job Title", value: jobData?.title },
                      { label: "Company", value: jobData?.workspace_details?.name },
                      { label: "Location", value: jobData?.location?.join(' · ') || "Hybrid" },
                      { label: "Salary Range", value: jobData?.salary_min ? `₹${jobData.salary_min}L – ₹${jobData.salary_max}L per annum` : "Not disclosed" },
                      { label: "Experience", value: jobData?.experience_min_years ? `${jobData.experience_min_years}–${jobData.experience_max_years} years` : "Not specified" },
                      { label: "Openings", value: jobData?.No_of_opening_or_positions_ || jobData?.num_positions || "1" },
                      { label: "Notice Period", value: jobData?.notice_period || "30 Days" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl hover:bg-[#F1F5F9] transition-colors group">
                        <span className="text-sm text-slate-500 font-medium">{row.label}</span>
                        <span className="text-sm text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Skills Section */}
                <div className="mb-10 bg-[#F4F7FF] rounded-2xl p-6 border border-[#E0E7FF]/50">
                  <h3 className="text-sm font-semibold text-slate-500 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Primary Skills
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {(jobData?.skills?.length ? jobData.skills : ["React", "TypeScript", "Node.js"]).map((skill, i) => (
                      <span 
                        key={i} 
                        className="px-5 py-2.5 bg-white rounded-xl text-sm text-blue-600 font-bold shadow-sm border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Must Have Section */}
                <div className="bg-[#FFF1F2] rounded-2xl p-6 border border-[#FFE4E6]">
                  <h3 className="text-sm font-bold text-rose-600 mb-5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Must Have
                  </h3>
                  <ul className="space-y-4">
                    {(competenciesData?.the_core_expectation?.length 
                      ? competenciesData.the_core_expectation 
                      : (jobData?.description?.split('\n').filter(l => l.includes('Must') || l.includes('experience')).slice(0, 3) || ["Strong technical knowledge and problem-solving skills"])
                    ).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-rose-400 transition-colors shrink-0" />
                        <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}
          {isManual && manualActiveTab === "resume" && (
            <div className="flex flex-col h-full max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl overflow-auto shadow-sm">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Candidate Resume View</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {candidate.name} · {candidate.headline}
                    </p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-[calc(100vh-160px)] bg-white">
                  {candidate.resumeUrl ? (() => {
                    const url = candidate.resumeUrl;
                    const ext = url.split(".").pop()?.toLowerCase() || "";
                    const isPdf = ext === "pdf";
                    const isDocViewerSupported = ["docx", "doc", "txt", "rtf"].includes(ext);
                    const viewerUrl = isDocViewerSupported
                      ? `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
                      : url;

                    if (isPdf) {
                      return (
                        <embed
                          src={url}
                          type="application/pdf"
                          className="w-full h-full border-0"
                        />
                      );
                    }
                    if (isDocViewerSupported) {
                      return (
                        <iframe
                          src={viewerUrl}
                          className="w-full h-full border-0"
                          title="Candidate Resume"
                        />
                      );
                    }
                    return (
                      <div className="flex items-center justify-center h-full text-slate-400">
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
                    <div className="flex items-center justify-center h-full text-slate-400">
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
          )}

          {isManual && manualActiveTab === "roleQuestions" && (
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
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "convinced")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "convinced" ? "bg-green-100 text-green-700 border-green-300 shadow-sm" : "bg-white text-slate-500 hover:bg-green-50 hover:text-green-600 border-slate-200"}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Convinced
                      </button>
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "not_convinced")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "not_convinced" ? "bg-red-100 text-red-700 border-red-300 shadow-sm" : "bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200"}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Not Convinced
                      </button>
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "skipped")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "skipped" ? "bg-slate-200 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
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
                      {/* {q.ai_score_percentage !== null && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Score</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${q.ai_score_percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-blue-700">{q.ai_score_percentage}%</span>
                        </div>
                      )} */}
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

          {/* PLATFORM MODE TABS */}
          {!isManual && (
          <>
          {/* TAB 1: ROLE QUESTIONS */}
          {activeTab === "roleQuestions" && (
            <div className="flex flex-col gap-5 max-w-4xl mx-auto">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-slate-800">
                  Interview Questions
                </h2>
                <p className="text-slate-500 text-sm">
                  Suggested questions to evaluate {candidate.headline} skills.
                </p>
              </div>
              {roleQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md"
                >
                  {/* Question Header */}
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
                      </div>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1"></div>
                  {/* Actions & AI Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "convinced")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "convinced" ? "bg-green-100 text-green-700 border-green-300 shadow-sm" : "bg-white text-slate-500 hover:bg-green-50 hover:text-green-600 border-slate-200"}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Convinced
                      </button>
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "not_convinced")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "not_convinced" ? "bg-red-100 text-red-700 border-red-300 shadow-sm" : "bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200"}`}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Not Convinced
                      </button>
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "skipped")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${q.status === "skipped" ? "bg-slate-200 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"}`}
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
                      {/* {q.ai_score_percentage !== null && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            AI Score
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${q.ai_score_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-blue-700">
                            {q.ai_score_percentage}%
                          </span>
                        </div>
                      )} */}
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
          {/* TAB 2: TRANSCRIPT + AI */}
          {activeTab === "transcript" && (
            <div className="flex flex-col h-full max-w-4xl mx-auto">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  Live Transcript & Evaluations
                </h2>
              </div>

              <div className="flex-1 flex flex-col gap-6 p-2">
                {transcripts.map((t) => (
                  <div
                    key={t.id}
                    className={`flex flex-col max-w-[80%] ${t.speaker === "candidate" ? "self-start" : t.speaker === "recruiter" ? "self-end items-end" : "self-center items-center w-full max-w-full"}`}
                  >
                    {/* System/AI Suggestions */}
                    {t.speaker === "system" ? (
                      <div className="bg-purple-50 border border-purple-100 text-purple-800 px-5 py-3 rounded-2xl flex items-start gap-3 w-full shadow-sm">
                        <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">
                            AI Suggests asking next
                          </p>
                          <p className="text-sm font-medium">
                            {t.ai_suggested_followup || t.text}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                          {t.speaker === "candidate"
                            ? candidate.name
                            : "Recruiter"}
                        </span>
                        <div
                          className={`px-5 py-3 rounded-2xl text-sm ${t.speaker === "candidate" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm" : "bg-blue-600 text-white rounded-tr-sm shadow-md"}`}
                        >
                          {t.text}
                        </div>
                        {t.ai_evaluation_pill && t.speaker === "candidate" && (
                          <div className="mt-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full w-fit">
                            ✓ {t.ai_evaluation_pill}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {transcripts.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-400 italic">
                    {callState === "answered"
                      ? "Listening for speech..."
                      : "Waiting for call to connect..."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUICK NOTES (Original Layout) */}
          {activeTab === "quickNotes" && (
            <div className="flex gap-8 items-start max-w-6xl mx-auto">
              <div className="flex-[3] flex flex-col gap-8">
                {/* Quick Notes Input */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 mb-3 font-semibold uppercase tracking-wider">
                    Quick Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => handleSaveNotes(true)}
                    placeholder="Add key points here during the call"
                    className="w-full h-24 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl p-4 text-sm transition-all resize-none shadow-sm"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tagsList.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border border-dashed transition-all flex items-center gap-1.5 ${activeTags.includes(tag.id) ? "bg-blue-50 text-blue-600 border-blue-400 shadow-sm" : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"}`}
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Recruiter Checklist (from your provided code) */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-xs font-bold text-blue-500 mb-6 font-semibold uppercase tracking-widest">
                    Recruiter Checklist
                  </h3>
                  <div className="flex flex-col gap-5 text-sm">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checklist.ctcConfirmed}
                          onChange={() => toggleChecklist("ctcConfirmed")}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer peer appearance-none checked:bg-blue-600 checked:border-blue-600 transition"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p
                          className={`font-semibold transition-colors ${checklist.ctcConfirmed ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          Current CTC confirmed?
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Ask exact in-hand + variables
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checklist.ctcFlexibility}
                          onChange={() => toggleChecklist("ctcFlexibility")}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer peer appearance-none checked:bg-blue-600 checked:border-blue-600 transition"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p
                          className={`font-semibold transition-colors ${checklist.ctcFlexibility ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          Expected CTC & flexibility?
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Range + negotiation room
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checklist.noticePeriod}
                          onChange={() => toggleChecklist("noticePeriod")}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer peer appearance-none checked:bg-blue-600 checked:border-blue-600 transition"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p
                          className={`font-semibold transition-colors ${checklist.noticePeriod ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          Notice period & buyout option?
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Exact days, can employer waive?
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={checklist.location}
                          onChange={() => toggleChecklist("location")}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer peer appearance-none checked:bg-blue-600 checked:border-blue-600 transition"
                        />
                        <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p
                          className={`font-semibold transition-colors ${checklist.location ? "text-slate-400 line-through" : "text-slate-700"}`}
                        >
                          Current location & relocation?
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Open to Bengaluru onsite?
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Candidate Info Sidebar */}
              {/* Candidate Resume Summary */}
              <div className="flex-[2] sticky top-0">
                <div className="border border-blue-200 bg-blue-50/20 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-blue-700 font-bold text-lg">
                      {candidate.name}
                    </h4>
                    <div className="w-10 h-10 rounded-full border-[3px] border-[#00C8B3] flex items-center justify-center relative">
                      <span className="text-[#00C8B3] font-black text-[10px]">
                        84%
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs font-semibold mb-6">
                    {candidate.headline}
                  </p>
                  <h5 className="text-[10px] uppercase font-bold text-slate-800 tracking-widest mb-4">
                    Info
                  </h5>
                  <div className="flex flex-col gap-4 text-xs font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Current CTC</span>
                      <span className="text-slate-700 font-bold">
                        {candidate.currentCtc}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Expected CTC</span>
                      <span className="text-slate-700 font-bold">
                        {candidate.expectedCtc}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Notice Period</span>
                      <span className="text-slate-700 font-bold">
                        {candidate.noticePeriod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Location</span>
                      <span className="text-slate-700 font-bold">
                        {candidate.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Experience</span>
                      <span className="text-slate-700 font-bold">
                        {candidate.experience}
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-slate-200 pt-4">
                    <button className="text-blue-600 font-semibold text-xs py-1 flex items-center gap-2 hover:underline">
                      View Profile <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
        )}
        </div>
        {/* Fixed Footer for Save - Platform mode only */}
        {!isManual && (
        <div className="w-full shrink-0 border-t border-slate-100 py-3 px-6 bg-white flex flex-col justify-center z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          
            <div className="flex items-center w-full">
              <button
                onClick={() => handleSaveNotes()}
                disabled={isSaving}
                className="w-[60%] bg-[#1D4ED8] hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Call Wrap-up Data"}
              </button>
            </div>
        </div>
        )}
        </div>
        {/* RIGHT SIDEBAR for manual mode */}
        {isManual && (
          <div className="w-[25%] shrink-0 border-l border-slate-200 bg-white overflow-x-hidden overflow-y-auto custom-scrollbar flex flex-col justify-between">
            {/* Candidate Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-slate-800 font-bold text-sm">{candidate.name}</h4>
                <div className="w-10 h-10 rounded-full border-[3px] border-[#00C8B3] flex items-center justify-center">
                  <span className="text-[#00C8B3] font-black text-[10px]">84%</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs">{candidate.headline}</p>
            </div>

            {/* Profile Info */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-[10px] uppercase font-bold text-slate-800 tracking-widest">PROFILE INFO</h5>
                <button 
                  onClick={isEditingProfile ? handleUpdateProfile : handleStartEdit}
                  className={`p-1.5 rounded-md transition-colors ${isEditingProfile ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  {isEditingProfile ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { label: "Current CTC", key: "currentCtc" },
                  { label: "Expected CTC", key: "expectedCtc" },
                  { label: "Notice Period", key: "noticePeriod" },
                  { label: "Location", key: "location" },
                  { label: "Experience", key: "experience" },
                ].map((field) => (
                  <div key={field.key} className="flex justify-between items-center group min-h-[24px]">
                    <span className="text-slate-400">{field.label}</span>
                    {isEditingProfile ? (
                      <div className="w-[60%] flex items-center justify-end gap-1">
                        <input
                          type={["currentCtc", "expectedCtc", "noticePeriod", "experience"].includes(field.key) ? "number" : "text"}
                          step="any"
                          value={(editProfileData as any)[field.key]}
                          onChange={(e) => setEditProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full text-right bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-700 focus:outline-none focus:border-blue-300 transition-colors"
                          autoFocus={field.key === "currentCtc"}
                        />
                        {(field.key === "currentCtc" || field.key === "expectedCtc") && <span className="text-slate-500 font-medium">LPA</span>}
                        {field.key === "noticePeriod" && <span className="text-slate-500 font-medium">days</span>}
                        {field.key === "experience" && <span className="text-slate-500 font-medium">yrs</span>}
                      </div>
                    ) : (
                      <span className="text-slate-700 font-bold">{(candidate as any)[field.key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Assessment */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-[10px] uppercase font-bold text-slate-800 tracking-widest">SKILL ASSESSMENT</h5>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">1/5</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-xs">
                {(() => {
                  const dynamicSkills = jobData?.skills?.length ? jobData.skills : (jobData?.technical_competencies?.length ? jobData.technical_competencies : ["Figma / Design Tools", "Hi-fi wireframing", "Auto layout & constraints"]);
                  return dynamicSkills.map((skill, index) => {
                    const isChecked = skillsChecklist[skill] || false;
                    // Assign colors based on index or just use a default
                    const colors = ["bg-blue-600", "bg-red-500", "bg-yellow-500", "bg-emerald-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];
                    const color = isChecked ? colors[index % colors.length] : "bg-slate-200";
                    
                    return (
                      <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setSkillsChecklist(prev => ({ ...prev, [skill]: !prev[skill] }))}
                          className={`w-4 h-4 rounded border-slate-300 ${isChecked ? "accent-blue-600" : ""}`}
                        />
                        <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
                        <span className={`flex-1 ${isChecked ? "text-slate-700" : "text-slate-400"}`}>{skill}</span>
                      </label>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Save Checklist Footer Button */}
            <div className="p-5 mt-auto">
              <button
                onClick={() => handleSaveNotes()}
                disabled={isSaving}
                className="w-full bg-[#1D4ED8] text-white font-bold py-3 rounded-lg text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Notes & Checklist"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Follow Up Modal Overlay for Manual Call Failures */}
      {followUpReason && (
        <CallCandidateModal
          isOpen={!!followUpReason}
          onClose={() => window.location.href = "/"} // Navigate cleanly back to pipeline board after follow up
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
