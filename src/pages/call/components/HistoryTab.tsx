import React, { useState, useMemo } from "react";
import {
  Phone,
  Sparkle,
  MessageSquare,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileQuestion,
} from "lucide-react";
import { CallHistoryItem, CandidateCallItem } from "../../../services/callService";
import CallEndedEarlyDialog from "../../companies/components/candidate-call-page/components/CallEndedEarlyDialog";
import NotesPopover from "./NotesPopover";
import ConfirmationDialog from "./ConfirmationDialog";

interface HistoryTabProps {
  historyItems: CallHistoryItem[];
  isLoading: boolean;
  hasSelectedJob: boolean;
  jobId: number | null;
  onCallCandidate: (candidateItem: CandidateCallItem) => void;
  onViewProfile?: (candidateItem: any) => void;
  onShortlistCandidate: (item: CallHistoryItem) => Promise<void>;
  onArchiveCandidate: (item: CallHistoryItem) => Promise<void>;
  onRestoreCandidate: (item: CallHistoryItem) => Promise<void>;
  onDeleteCandidate: (item: CallHistoryItem) => Promise<void>;
  onUpdateOutcome: (item: CallHistoryItem, reason: string, note: string) => void;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  historyItems,
  isLoading,
  hasSelectedJob,
  onCallCandidate,
  onViewProfile,
  onShortlistCandidate,
  onArchiveCandidate,
  onRestoreCandidate,
  onDeleteCandidate,
  onUpdateOutcome,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Active Dialog states
  const [outcomeItem, setOutcomeItem] = useState<CallHistoryItem | null>(null);
  const [notesItem, setNotesItem] = useState<CallHistoryItem | null>(null);
  const [shortlistItem, setShortlistItem] = useState<CallHistoryItem | null>(null);
  const [archiveItem, setArchiveItem] = useState<CallHistoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CallHistoryItem | null>(null);

  const [isActionLoading, setIsActionLoading] = useState(false);

  // Duration formatting e.g. 529s -> "08 mins 49 sec"
  const formatDurationDisplay = (totalSecs?: number): string => {
    const s = Math.max(0, Math.round(totalSecs || 0));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")} mins ${secs.toString().padStart(2, "0")} sec`;
  };

  // Time format e.g. "11:20 AM"
  const formatTimeOnly = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "11:20 AM";
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "11:20 AM";
    }
  };

  // Group date label e.g. "Yesterday, Wed 28 Oct" or "Tue 27 Oct"
  const getDateGroupLabel = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recent Calls";
      const now = new Date();

      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString("en-US", { month: "short" });

      if (isToday) {
        return `Today, ${dayName} ${dayNum} ${monthName}`;
      }
      if (isYesterday) {
        return `Yesterday, ${dayName} ${dayNum} ${monthName}`;
      }
      return `${dayName} ${dayNum} ${monthName}`;
    } catch {
      return "Recent Calls";
    }
  };

  // Group items by date key
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: { label: string; items: CallHistoryItem[] } } = {};

    historyItems.forEach((item) => {
      let key = "unknown";
      try {
        const d = new Date(item.call_time);
        key = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "unknown";
      } catch {}

      if (!groups[key]) {
        groups[key] = {
          label: getDateGroupLabel(item.call_time),
          items: [],
        };
      }
      groups[key].items.push(item);
    });

    return Object.values(groups);
  }, [historyItems]);

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const all = new Set<string | number>(historyItems.map((h) => h.id));
      setSelectedIds(all);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Status pill style helper
  const getStatusBadge = (item: CallHistoryItem) => {
    const rawStatus = (item.status_display || item.call_status || "").toLowerCase();
    const duration = item.duration_seconds || 0;

    if (rawStatus.includes("convinced") || rawStatus.includes("shortlist")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F8F0] text-[#0E7A4A] border border-[#B7ECCF]">
          Convinced
        </span>
      );
    }
    if (
      rawStatus.includes("didn't pick") ||
      rawStatus.includes("not_picked") ||
      rawStatus.includes("no_answer") ||
      rawStatus.includes("unanswered")
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FDE8E8] text-[#C81E1E] border border-[#F8B4B4]">
          Didn't Pick
        </span>
      );
    }
    if (
      rawStatus.includes("missing") ||
      (duration <= 70 && (!item.outcome || item.outcome === "Reason missing"))
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FEF08A]/40 text-[#854D0E] border border-[#FEF08A]">
          Reason Missing
        </span>
      );
    }
    if (
      rawStatus.includes("call back") ||
      rawStatus.includes("later") ||
      rawStatus.includes("follow_up")
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]">
          Call back Later
        </span>
      );
    }
    if (rawStatus.includes("busy")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
          Number Busy
        </span>
      );
    }
    if (rawStatus.includes("not interested")) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
          Not Interested
        </span>
      );
    }

    // Default formatted pill
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        {item.status_display || "Completed"}
      </span>
    );
  };

  // Helper to format Circular Score Gauges
  const renderScoreCircle = (
    rawScore: any,
    label: string,
    strokeColor: string
  ) => {
    let num: number | null = null;
    if (rawScore !== null && rawScore !== undefined && rawScore !== "") {
      const clean = String(rawScore).replace(/[^0-9.]/g, "");
      const parsed = parseFloat(clean);
      if (!isNaN(parsed)) {
        num = Math.round(parsed);
      }
    }

    if (num === null) {
      return (
        <div
          className="w-8 h-8 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[10px] font-semibold text-[#9CA3AF] shrink-0"
          title={`${label}: Not evaluated`}
        >
          --
        </div>
      );
    }

    const radius = 13;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(100, Math.max(0, num));
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        className="relative inline-flex items-center justify-center shrink-0 cursor-default"
        title={`${label}: ${num}%`}
      >
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            stroke="#EEF0F3"
            strokeWidth="2.5"
          />
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[9px] font-bold text-[#1F2937] leading-none">
          {num}%
        </span>
      </div>
    );
  };

  // Helper to trigger call candidate
  const handleTriggerCall = (item: CallHistoryItem) => {
    const candidatePayload: CandidateCallItem = {
      id: String(item.application_id || item.candidate_id || item.id),
      candidate: {
        id: item.candidate_id,
        full_name: item.candidate.full_name,
        current_company: item.candidate.current_company,
        headline: item.candidate.headline,
        current_salary_lpa: item.candidate.current_salary_lpa,
        expected_ctc: item.candidate.expected_ctc,
        notice_period_days: item.candidate.notice_period_days,
        notice_period_summary: item.candidate.notice_period_summary,
        location: item.candidate.location,
        total_experience: item.candidate.total_experience,
        score: item.score,
        screening_score: item.screening_score,
        job_score: item.candidate.job_score,
      },
    };
    onCallCandidate(candidatePayload);
  };

  // Pagination calculation
  const displayTotal = totalCount > 0 ? totalCount : historyItems.length;
  const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, displayTotal);

  if (!hasSelectedJob) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0F47F2] flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No Job Selected</h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Please select a company workspace and a job role to view candidate call history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#0F47F2]" />
          <span>Loading call history logs...</span>
        </div>
        <div className="divide-y divide-[#F0F2F5]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 h-[76px] flex items-center justify-between animate-pulse"
            >
              <div className="w-6 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-3 bg-gray-200 rounded" />
              <div className="w-40 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-3 bg-gray-200 rounded" />
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
              <div className="w-36 h-3 bg-gray-200 rounded" />
              <div className="w-16 h-8 bg-gray-200 rounded" />
              <div className="w-28 h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (historyItems.length === 0) {
    return (
      <div className="bg-white  border border-[#E5E7EB] p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12    bg-gray-50 text-gray-400 flex items-center justify-center">
          <Phone className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No Call History Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Candidates who are called through the calling interface will automatically appear
          here with their call duration, outcome, and timestamps.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* ── Main History Table ── */}
      <div className="bg-white overflow-hidden">
        {/* Table Header */}
        <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 grid grid-cols-12 items-center text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
          <div className="col-span-1 flex items-center gap-3">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                historyItems.length > 0 && selectedIds.size === historyItems.length
              }
              className="w-4 h-4 rounded border-gray-300 text-[#0F47F2] focus:ring-[#0F47F2] cursor-pointer"
            />
            <span>TIME</span>
          </div>
          <div className="col-span-3 pl-2">CANDIDATE</div>
          <div className="col-span-1 text-center">DURATION</div>
          <div className="col-span-2 text-center">STATUS</div>
          <div className="col-span-2">OUTCOME</div>
          <div className="col-span-1 text-center">SCORE</div>
          <div className="col-span-2 text-right pr-2">ACTIONS</div>
        </div>

        {/* Chronological Groups */}
        <div className="divide-y divide-[#F0F2F5]">
          {groupedHistory.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col">
              {/* Group Date Header */}
              <div className="px-6 py-2.5 bg-[#F9FAFB] border-y border-[#F0F2F5] flex items-center justify-between text-xs font-bold text-gray-800">
                <span>
                  {group.label} |{" "}
                  <span className="font-normal text-gray-500">
                    {group.items.length} call{group.items.length !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>

              {/* Group Rows */}
              <div className="divide-y divide-[#F0F2F5]">
                {group.items.map((item) => {
                  const isArchived = Boolean(item.is_archived);
                  const isChecked = selectedIds.has(item.id);
                  const duration = item.duration_seconds || 0;
                  const isUnder70s = duration <= 70;
                  const isReasonMissing =
                    !item.outcome ||
                    (item.status_display || "").toLowerCase().includes("missing");

                  return (
                    <div
                      key={item.id}
                      style={{ opacity: isArchived ? 0.5 : 1 }}
                      className={`px-6 py-4 grid grid-cols-12 items-center transition-colors ${
                        isChecked ? "bg-blue-50/20" : "hover:bg-gray-50/60"
                      }`}
                    >
                      {/* 1. Time & Checkbox */}
                      <div className="col-span-1 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#0F47F2] focus:ring-[#0F47F2] cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {formatTimeOnly(item.call_time)}
                        </span>
                      </div>

                      {/* 2. Candidate Info & Delete Icon (if archived) */}
                      <div className="col-span-3 pl-2 flex items-center gap-2 min-w-0">
                        {isArchived && (
                          <button
                            type="button"
                            title="Permanently Delete Candidate"
                            onClick={() => setDeleteItem(item)}
                            className="w-5 h-5 rounded-full bg-amber-100 hover:bg-red-100 text-amber-700 hover:text-red-700 flex items-center justify-center shrink-0 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <div className="flex flex-col min-w-0">
                          <button
                            type="button"
                            onClick={() => onViewProfile?.(item.candidate)}
                            className="text-left text-sm font-semibold text-gray-900 hover:text-[#0F47F2] transition truncate cursor-pointer"
                          >
                            {item.candidate.full_name || "Unknown Candidate"}
                          </button>
                          <span className="text-xs text-gray-500 truncate">
                            {item.candidate.current_company
                              ? `${item.candidate.current_company} . `
                              : ""}
                            {item.candidate.headline || "Candidate"}
                          </span>
                        </div>
                      </div>

                      {/* 3. Duration */}
                      <div className="col-span-1 text-center">
                        <span className="text-xs font-medium text-gray-600">
                          {formatDurationDisplay(item.duration_seconds)}
                        </span>
                      </div>

                      {/* 4. Status Badge */}
                      <div className="col-span-2 flex justify-center">
                        {getStatusBadge(item)}
                      </div>

                      {/* 5. Outcome (Text or "Add A Reason" link) */}
                      <div className="col-span-2 min-w-0 pr-3">
                        {isReasonMissing || (isUnder70s && !item.outcome) ? (
                          <button
                            type="button"
                            onClick={() => setOutcomeItem(item)}
                            className="text-xs text-[#0F47F2] font-semibold hover:underline cursor-pointer"
                          >
                            Add A Reason
                          </button>
                        ) : (
                          <span
                            className="text-xs text-gray-700 truncate block"
                            title={item.outcome || ""}
                          >
                            {item.outcome}
                          </span>
                        )}
                      </div>

                      {/* 6. Score (Resume Match & Screening Round) */}
                      <div className="col-span-1 flex items-center justify-center gap-1.5">
                        {renderScoreCircle(
                          item.score ?? 74,
                          "Resume Score",
                          "#F59E0B"
                        )}
                        {renderScoreCircle(
                          item.screening_score ?? 80,
                          "Screening Score",
                          "#14B8A6"
                        )}
                      </div>

                      {/* 7. Action Buttons */}
                      <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                        {/* Call Icon Button */}
                        <button
                          type="button"
                          onClick={() => handleTriggerCall(item)}
                          title="Call Candidate"
                          className="w-8 h-8 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#0F47F2] flex items-center justify-center transition cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        {/* Shortlist Sparkle Icon Button */}
                        <button
                          type="button"
                          onClick={() => setShortlistItem(item)}
                          title="Shortlist Candidate"
                          className="w-8 h-8 rounded-full bg-[#0F47F2] hover:bg-[#0c39c2] text-white flex items-center justify-center shadow-xs transition cursor-pointer"
                        >
                          <Sparkle className="w-3.5 h-3.5" />
                        </button>

                        {/* Notes / Chat Icon Button */}
                        <button
                          type="button"
                          onClick={() => setNotesItem(item)}
                          title="View / Add Notes"
                          className="w-8 h-8 rounded-full bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] text-[#D97706] flex items-center justify-center transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive or Restore Icon Button */}
                        {isArchived ? (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await onRestoreCandidate(item);
                              } catch {}
                            }}
                            title="Restore Candidate"
                            className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0F47F2] flex items-center justify-center transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setArchiveItem(item)}
                            title="Archive Candidate"
                            className="w-8 h-8 rounded-full bg-[#F9FAFB] hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer: Pagination matching screenshot */}
        <div className="h-14 px-6 border-t border-[#F0F2F5] flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {startItem}-{endItem} of {displayTotal.toLocaleString()}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <span className="font-semibold text-gray-700">10</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0F47F2] text-white font-semibold text-xs"
              >
                {currentPage}
              </button>

              {totalPages > 1 && currentPage < totalPages && (
                <button
                  type="button"
                  onClick={() => onPageChange(currentPage + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs cursor-pointer"
                >
                  {currentPage + 1}
                </button>
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Call Outcome / Comment Dialog (<= 70s or "Add A Reason") ── */}
      {outcomeItem && (
        <CallEndedEarlyDialog
          isOpen={Boolean(outcomeItem)}
          onClose={() => setOutcomeItem(null)}
          candidate={{
            id: outcomeItem.candidate_id,
            name: outcomeItem.candidate.full_name,
            company: outcomeItem.candidate.current_company || undefined,
            headline: outcomeItem.candidate.headline || undefined,
            phone: outcomeItem.candidate.phone || undefined,
          }}
          callDurationSeconds={outcomeItem.duration_seconds || 65}
          callUuid={outcomeItem.call_uuid}
          callMode="manual"
          onSuccess={(saved) => {
            onUpdateOutcome(outcomeItem, saved.reason, saved.note);
            setOutcomeItem(null);
          }}
        />
      )}

      {/* ── Notes Popover ── */}
      {notesItem && (
        <NotesPopover
          isOpen={Boolean(notesItem)}
          onClose={() => setNotesItem(null)}
          candidateId={notesItem.candidate_id}
          candidateName={notesItem.candidate.full_name}
        />
      )}

      {/* ── Shortlist Confirmation Dialog ── */}
      <ConfirmationDialog
        isOpen={Boolean(shortlistItem)}
        onClose={() => setShortlistItem(null)}
        title="Shortlist Candidate"
        description={
          <span>
            Are you sure you want to move{" "}
            <strong className="text-gray-900 font-semibold">
              {shortlistItem?.candidate.full_name}
            </strong>{" "}
            to the Shortlisted stage?
          </span>
        }
        confirmText="Shortlist"
        confirmVariant="primary"
        isLoading={isActionLoading}
        onConfirm={async () => {
          if (!shortlistItem) return;
          setIsActionLoading(true);
          try {
            await onShortlistCandidate(shortlistItem);
            setShortlistItem(null);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />

      {/* ── Archive Confirmation Dialog ── */}
      <ConfirmationDialog
        isOpen={Boolean(archiveItem)}
        onClose={() => setArchiveItem(null)}
        title="Archive Candidate"
        description={
          <span>
            Are you sure you want to archive{" "}
            <strong className="text-gray-900 font-semibold">
              {archiveItem?.candidate.full_name}
            </strong>
            ? They will be marked as archived in the candidate pipeline.
          </span>
        }
        confirmText="Archive"
        confirmVariant="amber"
        isLoading={isActionLoading}
        onConfirm={async () => {
          if (!archiveItem) return;
          setIsActionLoading(true);
          try {
            await onArchiveCandidate(archiveItem);
            setArchiveItem(null);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />

      {/* ── Permanent Delete Confirmation Dialog ── */}
      <ConfirmationDialog
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        title="Permanently Delete Candidate"
        description={
          <span>
            Are you sure you want to permanently delete{" "}
            <strong className="text-gray-900 font-semibold">
              {deleteItem?.candidate.full_name}
            </strong>
            ? This action cannot be undone.
          </span>
        }
        confirmText="Delete Permanently"
        confirmVariant="danger"
        isLoading={isActionLoading}
        onConfirm={async () => {
          if (!deleteItem) return;
          setIsActionLoading(true);
          try {
            await onDeleteCandidate(deleteItem);
            setDeleteItem(null);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />
    </div>
  );
};

export default HistoryTab;
