import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Clock, Phone, PhoneCall, PhoneOff, Loader2 } from "lucide-react";
import {
  saveCallLog,
  scheduleFollowUp,
  initiateCall,
  getCallStatus,
} from "../../../services/jobPipelineDashboardService";

export interface CallCandidateData {
  id: string;
  name: string;
  avatarInitials: string;
  headline: string;
  phone: string;
  experience: string;
  expectedCtc: string;
  location: string;
  noticePeriod: string;
  callAttention?: string[];
  resumeUrl?: string;
}

interface CallCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CallCandidateData | null;
  jobId?: number | null;
  initialStep?: ModalStep;
  initialReason?: string;
  callMode?: "platform" | "manual";
  initialNote?: string;
  initialTags?: string[];
}

const REASONS = [
  "Not Picked up",
  "Number Busy",
  "Wrong Number",
  "Completed",
  "Failed",
];

const QUICK_SLOTS = [
  "09:00 AM",
  "01:00 PM",
  "01:30 PM",
  "02:30 PM",
  "04:30 PM",
];

type ModalStep = "select" | "connecting" | "noAnswer";

const CallCandidateModal: React.FC<CallCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  jobId,
  initialStep = "select",
  initialReason = null,
  callMode = "platform",
  initialNote = "",
  initialTags = [],
}) => {
  const [step, setStep] = useState<ModalStep>(initialStep);
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState<string | null>(initialReason);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>(initialNote);
  const [quickNotes, setQuickNotes] = useState<string[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [connectingDots, setConnectingDots] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callInitiatedRef = useRef(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setSelectedReason(null);
      setSelectedDate("");
      setSelectedTime("");
      setNote("");
      setQuickNotes([]);
      setIsSaving(false);
      callInitiatedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (dotsRef.current) clearInterval(dotsRef.current);
    } else {
      setStep(initialStep);
      setSelectedReason(initialReason);
      setNote(initialNote);
      setQuickNotes(initialTags);
    }
  }, [isOpen, initialStep, initialReason, initialNote, initialTags]);

  // Connecting dots animation
  useEffect(() => {
    if (step === "connecting") {
      dotsRef.current = setInterval(() => {
        setConnectingDots((d) => (d + 1) % 4);
      }, 500);
    } else {
      if (dotsRef.current) clearInterval(dotsRef.current);
    }
    return () => {
      if (dotsRef.current) clearInterval(dotsRef.current);
    };
  }, [step]);

  if (!isOpen || !candidate) return null;

  const handleCallOnPlatform = async () => {
    if (callInitiatedRef.current) return;
    callInitiatedRef.current = true;
    setStep("connecting");

    try {
      // Initiate the Plivo call
      await initiateCall({ phone_numbers: [candidate.phone] });

      // Start polling call status
      let pollCount = 0;
      const maxPolls = 20; // ~60 seconds of polling

      pollingRef.current = setInterval(async () => {
        pollCount++;
        try {
          const status = await getCallStatus();

          if (status.status === "answered" || status.event === "answer") {
            // Call was answered — navigate to calling page
            if (pollingRef.current) clearInterval(pollingRef.current);
            navigate(`/call/${candidate.id}/${jobId}?mode=platform`, {
              state: { candidate },
            });
          } else if (
            status.status === "completed" ||
            status.event === "hangup" ||
            status.event === "hangup_by_user" ||
            status.status === "not_answered" ||
            status.status === "busy" ||
            status.status === "failed" ||
            status.event === "no_answer"
          ) {
            // Call was not answered — show No Answer step
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStep("noAnswer");
          }
        } catch (err) {
          console.error("Status poll error:", err);
        }

        if (pollCount >= maxPolls) {
          // Timeout — treat as no answer
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStep("noAnswer");
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to initiate call:", err);
      setStep("noAnswer");
    }
  };

  const handleManualCall = () => {
    if (candidate)
      navigate(`/call/${candidate.id}/${jobId}?mode=manual`, {
        state: { candidate },
      });
  };

  const getMappedStatus = (reason: string | null) => {
    switch (reason) {
      case "Not Picked up": return "not_picked_up";
      case "Wrong Number": return "wrong_number";
      case "Number Busy": return "busy";
      case "Completed": return "completed";
      case "Failed": return "failed";
      default: return undefined;
    }
  };

  const handleLogOnly = async () => {
    if (!candidate) return;
    setIsSaving(true);
    try {
      await saveCallLog({
        candidate_id: candidate.id,
        phone_number: candidate.phone,
        call_mode: callMode,
        call_status: getMappedStatus(selectedReason) || "completed",
        reason: selectedReason || undefined,
        note: note || undefined,
        checklist_data: { quick_notes_selected: quickNotes }
      });
    } catch (err) {
      console.error("Failed to save call log:", err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleSchedule = async () => {
    if (!candidate || !selectedDate || !selectedTime) return;
    setIsSaving(true);
    try {
      // Convert "01:30 PM" style to "HH:MM:SS" for the API
      let timeForApi = selectedTime;
      if (selectedTime.includes("AM") || selectedTime.includes("PM")) {
        const [time, period] = selectedTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        timeForApi = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
      } else if (!selectedTime.includes(":")) {
        timeForApi = `${selectedTime}:00`;
      } else if (selectedTime.split(":").length === 2) {
        timeForApi = `${selectedTime}:00`;
      }

      await scheduleFollowUp({
        candidate_id: candidate.id,
        phone_number: candidate.phone,
        call_mode: callMode,
        call_status: getMappedStatus(selectedReason) || "completed",
        reason: selectedReason || undefined,
        note: note || undefined,
        scheduled_date: selectedDate,
        scheduled_time: timeForApi,
        checklist_data: { quick_notes_selected: quickNotes }
      });
    } catch (err) {
      console.error("Failed to schedule follow-up:", err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  const handleCancelConnecting = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    callInitiatedRef.current = false;
    setStep("select");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* BLUE HEADER */}
        <div className="bg-[#1D4ED8] p-8 pb-10 relative flex flex-col items-center justify-center">
          <button
            onClick={() => {
              if (step === "connecting") handleCancelConnecting();
              onClose();
            }}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative mb-4 mt-2">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#1D4ED8] text-3xl font-semibold shadow-lg">
              {candidate.avatarInitials}
            </div>
            {step === "noAnswer" && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1D4ED8]"></div>
            )}
            {step === "connecting" && (
              <div className="absolute -inset-2 rounded-full border-2 border-white/40 animate-ping"></div>
            )}
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">
            {candidate.name}
          </h2>
          <p className="text-white/80 text-sm mb-3">{candidate.headline}</p>
          <p className="text-white font-medium text-lg flex items-center gap-2">
            {candidate.phone}
          </p>

          {step === "noAnswer" && (
            <div className="mt-4 px-4 py-1 bg-white text-red-500 text-xs font-bold rounded-full uppercase tracking-wider">
              No Answer
            </div>
          )}

          {step === "connecting" && (
            <div className="mt-4 px-4 py-1.5 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Connecting{".".repeat(connectingDots)}
            </div>
          )}
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
          {step === "select" ? (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <h3 className="text-slate-700 text-lg mb-2 font-semibold">
                How would you like to call?
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Choose your preferred method to connect with this candidate
              </p>

              <div className="flex gap-4 mb-10 w-full justify-center">
                {/* Call on Platform */}
                <button
                  onClick={handleCallOnPlatform}
                  className="flex-1 max-w-[220px] flex flex-col items-center gap-3 px-6 py-5 rounded-xl border-2 border-[#1D4ED8] bg-[#1D4ED8]/5 text-[#1D4ED8] font-medium hover:bg-[#1D4ED8] hover:text-white transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1D4ED8]/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold">Call on Platform</span>
                  <span className="text-[11px] opacity-70 text-center leading-tight">
                    Call via Nxthyre with recording & AI
                  </span>
                </button>

                {/* Manual Call */}
                <button
                  onClick={handleManualCall}
                  className="flex-1 max-w-[220px] flex flex-col items-center gap-3 px-6 py-5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium hover:border-[#22C55E] hover:bg-[#22C55E]/5 hover:text-[#16A34A] transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-[#22C55E]/10 flex items-center justify-center transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold">Manual Call</span>
                  <span className="text-[11px] opacity-70 text-center leading-tight">
                    Dial from your phone manually
                  </span>
                </button>
              </div>

              {candidate.callAttention && candidate.callAttention.length > 0 && (
                <div className="w-full mb-6 flex flex-col gap-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Recruiter Insights</p>
                  <div className="flex flex-col gap-1.5">
                    {candidate.callAttention.map((item, idx) => {
                      const t = item.toUpperCase();
                      let icon = "💡";
                      let style = "bg-blue-50 text-blue-700 border-blue-100";
                      if (t.includes("RED FLAGS") || t.includes("NOT PICKED UP") || t.includes("WRONG NUMBER") || t.includes("BUSY")) {
                        icon = "⚠️";
                        style = "bg-red-50 text-red-700 border-red-100";
                      } else if (t.includes("PROBE")) {
                        icon = "🔍";
                        style = "bg-amber-50 text-amber-700 border-amber-100";
                      }
                      return (
                        <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg border text-xs ${style}`}>
                          <span className="shrink-0">{icon}</span>
                          <span>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6 w-full grid grid-cols-2 gap-y-6 gap-x-4 border border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs mb-1">
                    Year of Experience
                  </p>
                  <p className="text-slate-700 font-medium text-sm">
                    {candidate.experience}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Expected - CTC</p>
                  <p className="text-slate-700 font-medium text-sm">
                    {candidate.expectedCtc}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Location</p>
                  <p className="text-slate-700 font-medium text-sm">
                    {candidate.location}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Notice Period</p>
                  <p className="text-slate-700 font-medium text-sm">
                    {candidate.noticePeriod}
                  </p>
                </div>
              </div>
            </div>
          ) : step === "connecting" ? (
            <div className="flex flex-col items-center animate-in fade-in duration-300 py-6">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full bg-[#1D4ED8]/10 flex items-center justify-center">
                  <PhoneCall className="w-8 h-8 text-[#1D4ED8] animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-[#1D4ED8]/20 animate-ping" />
              </div>
              <h3 className="text-slate-700 text-lg font-semibold mb-2">
                Calling {candidate.name}...
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                Waiting for the candidate to pick up the phone
              </p>
              <button
                onClick={handleCancelConnecting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                <PhoneOff className="w-4 h-4" /> Cancel Call
              </button>
            </div>
          ) : (
            /* step === "noAnswer" */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-1 pr-2">
                <div className="mb-6">
                  <h3 className="text-slate-800 font-medium mb-3">
                    Mark A Reason
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setSelectedReason(reason)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          selectedReason === reason
                            ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-blue-100 rounded-xl p-5 mb-6">
                  <h3 className="text-slate-800 font-medium mb-4">
                    Schedule Follow up
                  </h3>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <label className="text-slate-500 text-xs mb-1.5 block">
                        Select Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-blue-200 rounded-lg text-sm text-blue-600 font-medium focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-slate-500 text-xs mb-1.5 block">
                        Select Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 text-xs mb-2 block">
                      Quick Slots
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-slate-800 font-medium mb-2 block">
                    Add A Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Type here..."
                  />
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 pt-4 mt-2 bg-white border-t border-slate-100 flex gap-4">
                <button
                  onClick={handleLogOnly}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-lg border border-[#1D4ED8] text-[#1D4ED8] font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Log Only"}
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={isSaving || !selectedDate || !selectedTime}
                  className="flex-[2] py-3 rounded-lg bg-[#1D4ED8] text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {isSaving ? "Scheduling..." : "Schedule Follow-up"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallCandidateModal;
