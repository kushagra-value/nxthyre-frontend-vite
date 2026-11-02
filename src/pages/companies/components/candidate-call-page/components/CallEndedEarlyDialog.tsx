import React, { useState } from "react";
import { PhoneCall, AlertCircle, Loader2 } from "lucide-react";
import { saveCallLog } from "../../../../../services/jobPipelineDashboardService";
import { callStateCache } from "../../../../call/components/callStateCache";
import { showToast } from "../../../../../utils/toast";

export interface CandidateBasicInfo {
  id: string;
  name?: string;
  full_name?: string;
  headline?: string;
  designation?: string;
  company?: string;
  current_company?: string;
  phone?: string;
  avatarInitials?: string;
  [key: string]: any;
}

export interface CallEndedEarlyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateBasicInfo | null;
  callDurationSeconds: number;
  callUuid?: string | null;
  callMode?: "platform" | "manual";
  onSuccess?: (savedData: { reason: string; note: string; tags: string[] }) => void;
}

const PREDEFINED_REASONS = [
  "Didn't Pick up",
  "Number Busy",
  "Switched off",
  "Call me later",
  "Call me in 2days",
  "Invalid Number",
  "Not Interested",
];

const PREDEFINED_QUICK_NOTES = [
  "Asked for jd",
  "Call after 6pm",
  "Prefers whatsapp",
  "Asked to call later",
  "Placed somewhere",
];

const mapReasonToStatus = (reason: string | null): string => {
  switch (reason) {
    case "Didn't Pick up":
      return "not_picked_up";
    case "Number Busy":
      return "busy";
    case "Switched off":
      return "switched_off";
    case "Invalid Number":
      return "wrong_number";
    case "Not Interested":
      return "not_interested";
    case "Call me later":
    case "Call me in 2days":
      return "follow_up";
    case "Reason missing":
      return "reason_missing";
    default:
      return "completed";
  }
};

const formatDurationDisplay = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function CallEndedEarlyDialog({
  isOpen,
  onClose,
  candidate,
  callDurationSeconds,
  callUuid,
  callMode = "platform",
  onSuccess,
}: CallEndedEarlyDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const candidateName = candidate.name || candidate.full_name || "Max Verstappen";
  const candidateCompany = candidate.company || candidate.current_company || "Redbull Racing";
  const candidateHeadline = candidate.headline || candidate.designation || "Race Engineer";
  const candidatePhone = candidate.phone || "+91 9495652715";

  const handleToggleQuickNote = (noteTag: string) => {
    setSelectedQuickNotes((prev) =>
      prev.includes(noteTag) ? prev.filter((t) => t !== noteTag) : [...prev, noteTag]
    );
  };

  const persistCallDataLocally = (finalNoteText: string, status: string) => {
    const callTime = new Date().toISOString();
    try {
      const existing = sessionStorage.getItem("nxthyre_last_call_completed");
      const parsed = existing ? JSON.parse(existing) : {};
      sessionStorage.setItem(
        "nxthyre_last_call_completed",
        JSON.stringify({
          ...parsed,
          candidateId: candidate.id,
          noteText: finalNoteText,
          callStatus: status,
          callTime,
        })
      );
    } catch (e) {
      console.warn("Failed to persist call to sessionStorage:", e);
    }

    if (candidate.id) {
      callStateCache.updateCandidate(candidate.id, {
        latest_manual_call_status: status,
        latest_manual_call_at: callTime,
        latest_manual_call_note: finalNoteText,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedReason && !customNote.trim()) {
      setValidationError("Please select a reason or enter a note before saving.");
      return;
    }
    setValidationError(null);
    setIsSaving(true);

    try {
      const reasonPart = selectedReason || "";
      const notePart = customNote.trim();
      const combinedNote =
        reasonPart && notePart
          ? `${reasonPart}: ${notePart}`
          : reasonPart || notePart;

      const tags = [...selectedQuickNotes];
      if (selectedReason && !tags.includes(selectedReason)) {
        tags.push(selectedReason);
      }

      const status = mapReasonToStatus(selectedReason);

      await saveCallLog({
        candidate_id: candidate.id,
        call_uuid: callUuid || undefined,
        phone_number: candidate.phone,
        call_mode: callMode,
        call_status: status,
        reason: selectedReason || undefined,
        note: combinedNote || undefined,
        tags: tags.length > 0 ? tags : undefined,
        duration_seconds: Math.round(callDurationSeconds || 0),
      });

      persistCallDataLocally(combinedNote, status);
      showToast.success("Call outcome saved successfully!");
      onSuccess?.({ reason: selectedReason || "", note: combinedNote, tags });
      onClose();
    } catch (err: any) {
      console.error("Failed to save call outcome:", err);
      showToast.error("Failed to save call outcome. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWillUpdateLater = async () => {
    setIsSaving(true);
    setValidationError(null);

    try {
      const fallbackReason = "Reason missing";
      const fallbackNote = customNote.trim() || fallbackReason;
      const tags = ["Reason missing", ...selectedQuickNotes];
      const status = "follow_up";

      await saveCallLog({
        candidate_id: candidate.id,
        call_uuid: callUuid || undefined,
        phone_number: candidate.phone,
        call_mode: callMode,
        call_status: status,
        reason: fallbackReason,
        note: fallbackNote,
        tags,
        duration_seconds: Math.round(callDurationSeconds || 0),
      });

      persistCallDataLocally(fallbackNote, status);
      showToast.success("Marked for follow-up!");
      onSuccess?.({ reason: fallbackReason, note: fallbackNote, tags });
      onClose();
    } catch (err: any) {
      console.error("Failed to mark update later:", err);
      persistCallDataLocally("Reason missing", "follow_up");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 text-left select-none animate-scaleUp">
        {/* Top Header & Duration Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">Call ended early</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              You ended this call in under a minute.
              <br />
              Tell us what happened so we can set the next step.
            </p>
          </div>

          {/* Duration badge matching screenshot: pill with yellow dot and 01:54 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E2E8F0] text-slate-700 text-xs font-semibold rounded-lg shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{formatDurationDisplay(callDurationSeconds)}</span>
          </div>
        </div>

        {/* Candidate Summary Card matching screenshot */}
        <div className="bg-[#F0F4FF] rounded-2xl p-4 flex items-center justify-between gap-3 border border-blue-100/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">{candidateName}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {candidateCompany} . {candidateHeadline}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-slate-200/80 shadow-2xs shrink-0">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">{candidatePhone}</span>
          </div>
        </div>

        {/* Reason Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">Reason</h4>
          <div className="flex flex-wrap gap-2.5">
            {PREDEFINED_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              const isNotInterested = reason === "Not Interested";

              let btnClasses =
                "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ";
              if (isSelected) {
                if (isNotInterested) {
                  // Matching pink/red highlight in screenshot
                  btnClasses += "bg-[#FEE9E7] border-rose-300 text-[#FF383C] font-semibold shadow-2xs";
                } else {
                  btnClasses += "bg-blue-50 border-blue-400 text-blue-700 font-semibold shadow-2xs";
                }
              } else {
                btnClasses +=
                  "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50";
              }

              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setSelectedReason(isSelected ? null : reason);
                    if (validationError) setValidationError(null);
                  }}
                  className={btnClasses}
                >
                  {reason}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-slate-200/80 my-0.5" />

        {/* Quick Note Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800">Quick Note</h4>
            <span className="text-[11px] text-slate-400 font-normal">Optional</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {PREDEFINED_QUICK_NOTES.map((quickNote) => {
              const isSelected = selectedQuickNotes.includes(quickNote);
              return (
                <button
                  key={quickNote}
                  type="button"
                  onClick={() => handleToggleQuickNote(quickNote)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 border-blue-400 text-blue-700 font-semibold shadow-2xs"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {quickNote}
                </button>
              );
            })}
          </div>

          {/* Text Area */}
          <textarea
            value={customNote}
            onChange={(e) => {
              setCustomNote(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Add a note"
            rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
          />
        </div>

        {/* Validation Error banner if any */}
        {validationError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="h-px bg-slate-200/80 my-0.5" />

        {/* Bottom Actions */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0F47F2] text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={handleWillUpdateLater}
              disabled={isSaving}
              className="bg-[#E2E8F0] text-slate-700 hover:bg-slate-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              Will update later!
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            &quot;Later&quot; keeps them in Follow-ups with a &quot;Reason missing&quot; tag, so nothing is lost.
          </p>
        </div>
      </div>
    </div>
  );
}
