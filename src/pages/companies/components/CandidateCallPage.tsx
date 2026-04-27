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
  Eye,
  X,
  FastForward,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  Phone,
  RotateCcw,
  FileText,
} from "lucide-react";
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

  // Manual recording states
  const [isManualRecording, setIsManualRecording] = useState(false);
  const isManualRecordingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Clear session storage once we've consumed it
  useEffect(() => {
    if (sessionData) {
      sessionStorage.removeItem("_nxthyre_call_state");
    }
  }, []);

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

  const [skillsChecklist, setSkillsChecklist] = useState({
    figma: true,
    hiFi: true,
    autoLayout: true,
    hugFill: true,
    prototyping: false,
    variables: false,
    designSystems: false,
    uxResearch: false,
    b2c: false,
    mobileFirst: false,
  });

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

  const [followUpReason, setFollowUpReason] = useState<string | null>(null);

  // Load candidate fallback if direct link
  useEffect(() => {
    if (!candidate && candidateId) {
      setCandidate(DUMMY_FALLBACK);
    }
  }, [candidateId, candidate]);

  // Fetch initial Role Questions on Mount
  useEffect(() => {
    if (candidate?.id && jobId) {
      getRoleQuestions(jobId, candidate.id)
        .then(setRoleQuestions)
        .catch(console.error);
    }
  }, [candidate?.id, jobId]);

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
      } catch (err) {
        console.error("Failed to start media recorder:", err);
        alert("Failed to access microphone. Please check permissions.");
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

  const handleSaveNotes = useCallback(async () => {
    if (!candidate) return;
    setIsSaving(true);
    let finalCallUuid = callUuid;
    try {
      const callLogRes = await saveCallLog({
        call_uuid: finalCallUuid || undefined,
        candidate_id: candidate.id,
        note: notes || undefined,
        duration_seconds: seconds,
        tags: activeTags.length > 0 ? activeTags : undefined,
        checklist_data: checklist,
        call_mode: isManual ? "manual" : "platform",
        call_status: isManual && manualCallConnected ? "completed" : undefined
      });
      
      finalCallUuid = callLogRes.call_uuid || finalCallUuid;
      
      alert("Notes and checklist saved successfully!");
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    candidate,
    callUuid,
    notes,
    seconds,
    activeTags,
    checklist,
    isManual
  ]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
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

  const tags = [
    "Interested",
    "Follow Up",
    "CTC Mismatch",
    "Notice Long",
    "Strong fit",
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
      <div className="w-full lg:w-[20%] h-full flex flex-col items-center justify-center bg-[#1D4ED8] relative text-white overflow-x-hidden overflow-y-auto custom-scrollbar p-6 shrink-0 z-10 transition-all">
        {/* Visual Audio Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none fixed">
          <div className="w-[800px] h-[800px] rounded-full border border-white/20"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/20"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-white/20"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/30 bg-white/5"></div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-white/40 bg-white/10"></div>
        </div>

        {/* Back button */}
        <button
          onClick={() => {
            if (jobId) navigate(`/business/pipeline/${jobId}`);
            else navigate(-1);
          }}
          className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 z-10"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {isManual ? (
          /* ─── MANUAL CALL LEFT PANEL ─── */
          <div className="z-10 flex flex-col items-center w-full max-w-sm mt-8 pb-[300px]">
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
            
            {/* INJECTED QUICK NOTES IN LEFT PANEL */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-[#1D4ED8] bg-opacity-90 backdrop-blur-sm z-20">
              <div className="bg-white rounded-[16px] p-4 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.66663 14V2.66667C2.66663 2.29851 2.9651 2 3.33329 2H10.5961C10.7423 2 10.8844 2.04838 10.9983 2.13764L13.8407 4.36442C13.9431 4.44464 14 4.57008 14 4.70425V14C14 14.3682 13.7015 14.6667 13.3333 14.6667H3.33329C2.9651 14.6667 2.66663 14.3682 2.66663 14Z" stroke="#475569" strokeWidth="1.2"/>
                      <path d="M10.6666 2V4C10.6666 4.36819 10.9651 4.66667 11.3333 4.66667H14" stroke="#475569" strokeWidth="1.2"/>
                      <path d="M6 7.33333H10.6667" stroke="#475569" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M6 10H8.66667" stroke="#475569" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Notes</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded-full text-[10px] whitespace-nowrap transition-colors border ${
                        activeTags.includes(tag) 
                          ? "bg-blue-50 text-blue-600 border-blue-200" 
                          : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {activeTags.includes(tag) ? "✓" : "○"} {tag}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add key notes"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="bg-blue-600 text-white rounded-lg px-4 py-1.5 text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 min-w-[60px]"
                  >
                    {isSaving ? "..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
            {/* END INJECTED QUICK NOTES */}
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
        <div className={`flex flex-col ${isManual ? "w-[75%] min-w-0" : "h-full w-full"} overflow-x-hidden overflow-y-auto custom-scrollbar`}>
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
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar bg-slate-50/30">
          {/* MANUAL MODE TABS */}
          {isManual && manualActiveTab === "jobDescription" && (
            <div className="flex flex-col h-full w-full">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 md:p-8 w-full max-w-4xl mx-auto break-words">
                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Job Description: {jobData ? jobData.title : candidate.headline}</h2>
                <div className="space-y-6 text-sm text-slate-700">
                  {jobData ? (
                    <>
                      {competenciesData?.role_overview ? (
                        <>
                          <section>
                            <h3 className="font-bold text-slate-800 text-base mb-2">Role Overview</h3>
                            <p className="leading-relaxed text-[#727272] whitespace-pre-wrap">{competenciesData.role_overview}</p>
                          </section>
                          {competenciesData.the_core_expectation && (
                            <section>
                              <h3 className="font-bold text-slate-800 text-base mb-2">The Core Expectation</h3>
                              <div className="rounded-[10px] bg-[#EBFFEE] p-[20px]">
                                <ul className="flex flex-col gap-0 list-disc ml-[16px]">
                                  {competenciesData.the_core_expectation.map((item: string, i: number) => (
                                    <li key={i} className="text-[#727272] leading-relaxed mb-1">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </section>
                          )}
                          {competenciesData.key_responsibilities_explained?.functional && (
                            <section>
                              <h3 className="font-bold text-slate-800 text-base mb-2">Key Responsibilities</h3>
                              <div className="flex flex-col gap-3">
                                {competenciesData.key_responsibilities_explained.functional.map((item: any, i: number) => (
                                  <div key={i} className="flex flex-col gap-1 p-4 bg-[#E7EDFF] rounded-[10px] text-sm">
                                    <span className="font-semibold text-black">{item.competency}</span>
                                    <span className="text-[#727272] text-xs">{item.context}</span>
                                    {item.priority && (
                                      <span className="bg-[#FFF7D6] text-[#F59E0B] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1">Priority: {item.priority}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-500 whitespace-pre-wrap">
                          {jobData.description ? <div dangerouslySetInnerHTML={{ __html: jobData.description }} /> : "Loading job details..."}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10 text-slate-400">Loading Job Description...</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {isManual && manualActiveTab === "resume" && (
            <div className="flex flex-col h-full max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                <div className="min-h-[120vh] bg-white">
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
                        onClick={() => handleEvaluateQuestion(q.id, "skipped")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${q.status === "skipped" ? "bg-slate-200 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                      >
                        <FastForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    </div>
                    {q.ai_score_percentage !== null && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Score</span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${q.ai_score_percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-blue-700">{q.ai_score_percentage}%</span>
                      </div>
                    )}
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
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEvaluateQuestion(q.id, "skipped")}
                        className={`flex items-center border gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${q.status === "skipped" ? "bg-slate-200 text-slate-700 border-slate-300 shadow-sm" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                      >
                        <FastForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    </div>

                    {/* AI Score */}
                    {q.ai_score_percentage !== null && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          AI Score
                        </span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${q.ai_score_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-blue-700">
                          {q.ai_score_percentage}%
                        </span>
                      </div>
                    )}
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
                    placeholder="Add key points here during the call"
                    className="w-full h-24 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none rounded-xl p-4 text-sm transition-all resize-none shadow-sm"
                  />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeTags.includes(tag) ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                      >
                        {tag}
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
                onClick={handleSaveNotes}
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
              <h5 className="text-[10px] uppercase font-bold text-slate-800 tracking-widest mb-4">PROFILE INFO</h5>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Current CTC</span><span className="text-slate-700 font-bold">{candidate.currentCtc}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Expected CTC</span><span className="text-slate-700 font-bold">{candidate.expectedCtc}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Notice Period</span><span className="text-slate-700 font-bold">{candidate.noticePeriod}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-slate-700 font-bold">{candidate.location}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Experience</span><span className="text-slate-700 font-bold">{candidate.experience}</span></div>
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
                {[
                  { name: "Figma / Design Tools", score: "3/5", checked: true, color: "bg-blue-600" },
                  { name: "Hi-fi wireframing", score: null, checked: true, color: "bg-red-500" },
                  { name: "Auto layout & constraints", score: null, checked: true, color: "bg-red-500" },
                  { name: "Hug / Fill / Fixed sizing", score: null, checked: true, color: "bg-yellow-500" },
                  { name: "Prototyping & interactions", score: null, checked: false, color: "bg-slate-200" },
                  { name: "Design Systems", score: null, checked: false, color: "bg-slate-200" },
                  { name: "UX Research", score: null, checked: false, color: "bg-slate-200" },
                  { name: "B2C Product Work", score: null, checked: false, color: "bg-slate-200" },
                  { name: "Mobile-first Design", score: null, checked: false, color: "bg-slate-200" },
                ].map((skill) => (
                  <label key={skill.name} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={skill.checked}
                      readOnly
                      className={`w-4 h-4 rounded border-slate-300 ${skill.checked ? "accent-blue-600" : ""}`}
                    />
                    <span className={`w-1.5 h-1.5 rounded-full ${skill.color}`}></span>
                    <span className={`flex-1 ${skill.checked ? "text-slate-700" : "text-slate-400"}`}>{skill.name}</span>
                    {skill.score && <span className="text-slate-400 font-medium">{skill.score}</span>}
                  </label>
                ))}
              </div>
            </div>

            {/* Save Checklist Footer Button */}
            <div className="p-5 mt-auto">
              <button
                onClick={handleSaveNotes}
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
          candidate={candidate}
          jobId={jobId ? parseInt(jobId, 10) : undefined}
          initialStep="noAnswer"
          initialReason={followUpReason}
          initialNote={notes}
          initialTags={activeTags}
          callMode="manual"
        />
      )}
    </div>
  );
}
