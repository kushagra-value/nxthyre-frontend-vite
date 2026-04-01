import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Clock, Phone } from "lucide-react";
import {
  saveCallLog,
  scheduleFollowUp,
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
}

interface CallCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CallCandidateData | null;
  jobId?: number | null;
}

const REASONS = [
  "Didn't pick up",
  "Call Later",
  "Number Busy",
  "Wrong Number",
  "Messaged instead",
  "Not Interested",
];

const QUICK_SLOTS = [
  "09:00 AM",
  "01:00 PM",
  "01:30 PM",
  "02:30 PM",
  "04:30 PM",
];

const CallCandidateModal: React.FC<CallCandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  jobId,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleCallNow = () => {
    if (candidate)
      navigate(`/call/${candidate.id}/${jobId}`, { state: { candidate } });
  };

  const handleLogOnly = async () => {
    if (!candidate) return;
    setIsSaving(true);
    try {
      await saveCallLog({
        candidate_id: candidate.id,
        reason: selectedReason || undefined,
        note: note || undefined,
      });
    } catch (err) {
      console.error("Failed to save call log:", err);
    } finally {
      setIsSaving(false);
      onClose();
      setStep(1);
      setSelectedReason(null);
      setNote("");
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
        reason: selectedReason || undefined,
        note: note || undefined,
        scheduled_date: selectedDate,
        scheduled_time: timeForApi,
      });
    } catch (err) {
      console.error("Failed to schedule follow-up:", err);
    } finally {
      setIsSaving(false);
      onClose();
      setStep(1);
      setSelectedReason(null);
      setSelectedDate("");
      setSelectedTime("");
      setNote("");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* BLUE HEADER */}
        <div className="bg-[#1D4ED8] p-8 pb-10 relative flex flex-col items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative mb-4 mt-2">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-[#1D4ED8] text-3xl font-semibold shadow-lg">
              {candidate.avatarInitials}
            </div>
            {step === 2 && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1D4ED8]"></div>
            )}
          </div>

          <h2 className="text-white text-2xl font-semibold mb-1">
            {candidate.name}
          </h2>
          <p className="text-white/80 text-sm mb-3">{candidate.headline}</p>
          <p className="text-white font-medium text-lg flex items-center gap-2">
            {candidate.phone}
          </p>

          {step === 2 && (
            <div className="mt-4 px-4 py-1 bg-white text-red-500 text-xs font-bold rounded-full uppercase tracking-wider">
              No Answer
            </div>
          )}
        </div>

        {/* MODAL CONTENT */}
        <div className="p-8">
          {step === 1 ? (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <h3 className="text-slate-700 text-lg mb-6">
                Ready to call this candidate?
              </h3>
              <div className="flex gap-4 mb-10 w-full justify-center">
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleCallNow}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#22C55E] text-white font-medium hover:bg-[#16A34A] transition-colors shadow-lg shadow-green-200"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </button>
              </div>

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
          ) : (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
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
