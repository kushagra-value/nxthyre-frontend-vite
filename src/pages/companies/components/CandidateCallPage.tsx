import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  MicOff,
  PhoneOff,
  Pause,
  Play,
  CheckCircle2,
  ChevronLeft,
  Eye,
} from "lucide-react";
import {
  initiateCall,
  getCallStatus,
  hangupCall,
  startRecording,
  stopRecording,
  saveCallLog,
  type CallStatus,
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
  experience: "--",
};

export default function CandidateCallPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const incomingCandidate = location.state
    ?.candidate as CandidateCallParams | null;
  const [candidate, setCandidate] = useState<CandidateCallParams | null>(
    incomingCandidate,
  );

  // Call States
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callUuid, setCallUuid] = useState<string | null>(null);
  const [callState, setCallState] = useState<string>("initiating"); // initiating | dialing | answered | completed | error
  const [isSaving, setIsSaving] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);

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
    figma: false,
    uxResearch: false,
    designSystems: false,
    b2c: false,
    stakeholder: false,
    mobileFirst: false,
  });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load candidate fallback if direct link
  useEffect(() => {
    if (!candidate && candidateId) {
      setCandidate(DUMMY_FALLBACK);
    }
  }, [candidateId, candidate]);

  // ─── Initiate Call on Mount ──────────────────────────
  useEffect(() => {
    if (!candidate?.phone) return;

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

  // ─── Poll Call Status ────────────────────────────────
  useEffect(() => {
    if (callState === "completed" || callState === "error") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const status: CallStatus = await getCallStatus();
        if (status.call_uuid && !callUuid) {
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
  }, [callState, callUuid]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (!isPaused && callState !== "completed") {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, callState]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── Call Controls ───────────────────────────────────
  const handleEndCall = useCallback(async () => {
    if (!callUuid || isEndingCall) return;
    setIsEndingCall(true);
    try {
      await hangupCall(callUuid);
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

  const handleSaveNotes = useCallback(async () => {
    if (!candidate) return;
    setIsSaving(true);
    try {
      await saveCallLog({
        call_uuid: callUuid || undefined,
        candidate_id: candidate.id,
        note: notes || undefined,
        duration_seconds: seconds,
        tags: activeTags.length > 0 ? activeTags : undefined,
        checklist_data: checklist,
        skills_data: skillsChecklist,
      });
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
    skillsChecklist,
  ]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSkills = (key: keyof typeof skillsChecklist) => {
    setSkillsChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
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
    <div className="flex h-screen overflow-hidden bg-white text-slate-800">
      {/* LEFT COLUMN: ACTIVE CALL UX */}
      <div className="w-[45%] h-full flex flex-col items-center justify-center bg-[#1D4ED8] relative text-white overflow-hidden p-8">
        {/* Visual Audio Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full border border-white/20"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/20"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-white/20"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-white/30 bg-white/5"></div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 z-10"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

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
              onClick={() => setIsPaused(!isPaused)}
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
              onClick={() => setIsMuted(!isMuted)}
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
      </div>

      {/* RIGHT COLUMN: RECRUITER ASSISTANT PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-lg font-medium text-slate-800">
            <span className="text-slate-400">
              {callState === "completed"
                ? "Call ended —"
                : "Call in progress —"}
            </span>
            <span className="text-blue-600 font-semibold">
              {candidate.name}
            </span>
            {callState !== "completed" && (
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold tracking-widest flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
            {candidate.headline}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="flex gap-8 items-start">
            {/* Notes and Checklists Section */}
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
                  className="w-full h-24 bg-slate-50 border border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-white focus:outline-none rounded-xl p-4 text-sm transition-all resize-none shadow-sm"
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => {
                    const isActive = activeTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${isActive ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"}`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recruiter Checklist */}
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

              {/* Skills to ask */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <h3 className="text-xs font-bold text-teal-500 mb-6 font-semibold uppercase tracking-widest">
                  Skills to Ask
                </h3>
                <div className="flex flex-col gap-4 text-sm font-medium text-slate-600">
                  {Object.entries(skillsChecklist).map(([key, checked]) => {
                    const labels: Record<string, string> = {
                      figma: "Figma / Design Tools",
                      uxResearch: "UX Research Process",
                      designSystems: "Design Systems exp",
                      b2c: "B2C Product Work",
                      stakeholder: "Stakeholder Mgmt.",
                      mobileFirst: "Mobile-first Design",
                    };
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleSkills(key as keyof typeof skillsChecklist)
                            }
                            className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500 cursor-pointer peer appearance-none checked:bg-teal-500 checked:border-teal-500 transition"
                          />
                          <CheckCircle2 className="w-3 h-3 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span
                          className={
                            checked ? "text-slate-400 line-through" : ""
                          }
                        >
                          {labels[key]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

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
        </div>

        {/* Fixed Footer for Save */}
        <div className="w-full shrink-0 border-t border-slate-100 p-6 bg-white flex justify-start">
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            className="w-[60%] bg-[#1D4ED8] hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Notes and Checklist"}
          </button>
        </div>
      </div>
    </div>
  );
}
