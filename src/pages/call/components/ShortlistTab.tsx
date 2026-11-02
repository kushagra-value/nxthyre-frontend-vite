import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileQuestion,
  Check,
  X as CloseIcon,
  Phone,
} from "lucide-react";
import { CandidateCallItem } from "../../../services/callService";
import { formatTimeAgo } from "../../../utils/candidateAttention";
import NotesPopover from "./NotesPopover";
import ConfirmationDialog from "./ConfirmationDialog";
import SkillsFitModal from "./SkillsFitModal";

interface ShortlistTabProps {
  candidates: CandidateCallItem[];
  isLoading: boolean;
  hasSelectedJob: boolean;
  onCallCandidate: (candidateItem: CandidateCallItem) => void;
  onViewProfile?: (candidateItem: CandidateCallItem) => void;
  onArchiveCandidate: (candidateItem: CandidateCallItem) => Promise<void>;
  onRestoreCandidate?: (candidateItem: CandidateCallItem) => Promise<void>;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const ShortlistTab: React.FC<ShortlistTabProps> = ({
  candidates,
  isLoading,
  hasSelectedJob,
  onCallCandidate,
  onViewProfile,
  onArchiveCandidate,
  onRestoreCandidate,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Active Action states
  const [notesCandidate, setNotesCandidate] = useState<CandidateCallItem | null>(null);
  const [archiveCandidate, setArchiveCandidate] = useState<CandidateCallItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Skills Fit Hover State with fixed portal positioning
  const [hoveredCandidate, setHoveredCandidate] = useState<{
    item: CandidateCallItem;
    anchorRect: DOMRect;
  } | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSkillsMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    item: CandidateCallItem
  ) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCandidate({ item, anchorRect: rect });
  };

  const handleSkillsMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredCandidate(null);
    }, 250);
  };

  const handleModalMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleModalMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredCandidate(null);
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  // Extract Matching Tags from candidate backend data
  const getMatchingTags = (item: CandidateCallItem): string[] => {
    const cand = item.candidate || {};
    const tags: string[] = [];

    // 1. Total Experience
    const exp = cand.total_experience ?? cand.experience_years;
    if (exp != null && exp !== "" && exp !== "--") {
      const clean = String(exp).replace(/[^0-9.]/g, "");
      if (clean) tags.push(`${clean}years`);
    }

    // 2. Current Salary
    const sal = cand.current_salary_lpa ?? cand.current_salary;
    if (sal != null && sal !== "" && sal !== "--") {
      const clean = String(sal).replace(/[^0-9.]/g, "");
      if (clean) tags.push(`${clean} LPA`);
    }

    // 3. Notice Period
    const np = cand.notice_period_summary || cand.notice_period_days;
    if (np != null && np !== "" && np !== "--") {
      const str = String(np).trim();
      tags.push(str.toLowerCase().includes("np") ? str : `NP ${str}`);
    }

    // 4. Location
    if (cand.location && cand.location !== "--") {
      tags.push(cand.location);
    }

    // 5. Additional tags from backend if present
    const extraTags = (item as any).tags || (cand as any).tags;
    if (Array.isArray(extraTags)) {
      extraTags.forEach((t) => {
        if (typeof t === "string" && !tags.includes(t)) {
          tags.push(t);
        }
      });
    }

    return tags;
  };

  // Extract Skills matching info from backend response
  const getSkillsFitData = (item: CandidateCallItem) => {
    const defaultNonMatched = [
      "Secure Application Design",
      "Solution Design Principles",
      "Application & AI Solution Performance Optimization",
      "US Healthcare Domain Knowledge",
    ];

    // 1. Check quick_fit_summary from job_score
    const quickFit =
      item.job_score?.quick_fit_summary ||
      item.candidate?.job_score?.quick_fit_summary;

    if (Array.isArray(quickFit) && quickFit.length > 0) {
      const matched = quickFit
        .filter((q: any) => q.color === "green" || q.status === "matched")
        .map((q: any) => q.badge || q.evidence || q.name || "Skill");
      const nonMatched = quickFit
        .filter(
          (q: any) =>
            q.color === "red" ||
            q.color === "yellow" ||
            q.status === "missing" ||
            q.status === "partial"
        )
        .map((q: any) => q.badge || q.evidence || q.name || "Skill");
      const total = quickFit.length;
      const countStr = `${matched.length.toString().padStart(2, "0")}/${total.toString().padStart(2, "0")}`;
      return {
        countStr: total > 0 ? countStr : "08/25",
        matched:
          matched.length > 0
            ? matched
            : [
                "React.js",
                "TypeScript",
                "State Management",
                "Frontend Architecture",
                "RESTful APIs",
                "Responsive Design",
                "Unit Testing",
                "Git & CI/CD",
              ],
        nonMatched: nonMatched.length > 0 ? nonMatched : defaultNonMatched,
      };
    }

    // 2. Check match_analysis
    const matchAnalysis = item.match_analysis;

    if (matchAnalysis?.matched_skills || matchAnalysis?.missing_skills) {
      const matched = (matchAnalysis.matched_skills || []).filter(Boolean);
      const nonMatched = (matchAnalysis.missing_skills || []).filter(Boolean);
      const total = matchAnalysis.total || (matched.length + nonMatched.length) || 25;
      const countStr = `${matched.length.toString().padStart(2, "0")}/${total.toString().padStart(2, "0")}`;
      return {
        countStr,
        matched:
          matched.length > 0
            ? matched
            : [
                "React.js",
                "TypeScript",
                "JavaScript (ES6+)",
                "HTML5 & CSS3",
                "Tailwind CSS",
                "RESTful API Integration",
                "Git & GitHub",
                "Component Architecture",
              ],
        nonMatched: nonMatched.length > 0 ? nonMatched : defaultNonMatched,
      };
    }

    return {
      countStr: "08/25",
      matched: [
        "React.js",
        "TypeScript",
        "JavaScript (ES6+)",
        "HTML5 / Modern CSS",
        "Tailwind CSS",
        "RESTful API Integration",
        "Git & Version Control",
        "Component Architecture",
      ],
      nonMatched: defaultNonMatched,
    };
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

  // Select all handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const all = new Set<string | number>(
        candidates.map((c) => c.candidate?.id || c.id)
      );
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

  // Pagination calculation
  const displayTotal = totalCount > 0 ? totalCount : candidates.length;
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
          Please select a company workspace and a job role to view shortlisted candidates.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#0F47F2]" />
          <span>Loading shortlisted candidates...</span>
        </div>
        <div className="divide-y divide-[#F0F2F5]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 h-[76px] flex items-center justify-between animate-pulse"
            >
              <div className="w-6 h-4 bg-gray-200 rounded" />
              <div className="w-40 h-4 bg-gray-200 rounded" />
              <div className="w-36 h-6 bg-gray-200 rounded-lg" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
              <div className="w-20 h-4 bg-gray-200 rounded" />
              <div className="w-16 h-8 bg-gray-200 rounded" />
              <div className="w-20 h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white  border border-[#E5E7EB] p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No Shortlisted Candidates</h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Candidates who are shortlisted from the Call queue or Call History will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* ── Main Shortlist Table matching Screenshot 2 ── */}
      <div className="bg-white overflow-hidden">
        {/* Table Header */}
        <div className="h-11 bg-white border-b border-[#F0F2F5] px-6 grid grid-cols-12 items-center text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
          <div className="col-span-1 flex items-center gap-3">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                candidates.length > 0 && selectedIds.size === candidates.length
              }
              className="w-4 h-4 rounded border-gray-300 text-[#0F47F2] focus:ring-[#0F47F2] cursor-pointer"
            />
          </div>
          <div className="col-span-3">CANDIDATE</div>
          <div className="col-span-3">MATCHING TAGS</div>
          <div className="col-span-1 text-center">SKILLS FIT</div>
          <div className="col-span-1 text-center">LAST CALL</div>
          <div className="col-span-1 text-center">SCORE</div>
          <div className="col-span-2 text-right pr-2">ACTIONS</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#F0F2F5]">
          {candidates.map((item) => {
            const cand = item.candidate || {};
            const cId = cand.id || item.id;
            const isChecked = selectedIds.has(cId);
            const isArchived = Boolean(item.latest_call_status === "ARCHIVED" || (item as any).is_archived);
            const matchingTags = getMatchingTags(item);
            const skillsFit = getSkillsFitData(item);

            return (
              <div
                key={cId}
                style={{ opacity: isArchived ? 0.5 : 1 }}
                className={`px-6 py-4 grid grid-cols-12 items-center transition-colors ${
                  isChecked ? "bg-blue-50/20" : "hover:bg-gray-50/60"
                }`}
              >
                {/* 1. Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(cId)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0F47F2] focus:ring-[#0F47F2] cursor-pointer"
                  />
                </div>

                {/* 2. Candidate Info */}
                <div className="col-span-3 flex flex-col min-w-0 pr-3">
                  <button
                    type="button"
                    onClick={() => onViewProfile?.(item)}
                    className="text-left text-sm font-semibold text-gray-900 hover:text-[#0F47F2] transition truncate cursor-pointer"
                  >
                    {cand.full_name || "Unknown Candidate"}
                  </button>
                  <span className="text-xs text-gray-500 truncate">
                    {cand.current_company ? `${cand.current_company} . ` : ""}
                    {cand.headline || "Candidate"}
                  </span>
                </div>

                {/* 3. Matching Tags */}
                <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                  {matchingTags.length > 0 ? (
                    matchingTags.slice(0, 4).map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="bg-[#E5E7EB] text-[#374151] px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </div>

                {/* 4. Skills Fit with Interactive Tooltip / Modal */}
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onMouseEnter={(e) => handleSkillsMouseEnter(e, item)}
                    onMouseLeave={handleSkillsMouseLeave}
                    className="text-xs font-semibold text-[#009951] hover:underline cursor-pointer transition focus:outline-none py-1 px-2 rounded-md hover:bg-emerald-50/50"
                  >
                    {skillsFit.countStr}
                  </button>
                </div>

                {/* 5. Last Call */}
                <div className="col-span-1 text-center">
                  <span className="text-xs font-medium text-gray-600">
                    {formatTimeAgo(
                      item.latest_manual_call_at || item.latest_call_at || item.last_active_at || undefined
                    )}
                  </span>
                </div>

                {/* 6. Score */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  {renderScoreCircle(
                    item.score ?? cand.score ?? 74,
                    "Resume Score",
                    "#F59E0B"
                  )}
                  {renderScoreCircle(
                    item.screening_score ?? cand.screening_score ?? 80,
                    "Screening Score",
                    "#14B8A6"
                  )}
                </div>

                {/* 7. Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
                  {/* Call Candidate Button */}
                  <button
                    type="button"
                    onClick={() => onCallCandidate(item)}
                    title="Call candidate"
                    className="w-8 h-8 rounded-full bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#0F47F2] flex items-center justify-center transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>

                  {/* Notes / Chat Icon Button */}
                  <button
                    type="button"
                    onClick={() => setNotesCandidate(item)}
                    title="View / Add Notes"
                    className="w-8 h-8 rounded-full bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] text-[#D97706] flex items-center justify-center transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive / Restore Button */}
                  {isArchived ? (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await onRestoreCandidate?.(item);
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
                      onClick={() => setArchiveCandidate(item)}
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

      {/* ── Notes Popover ── */}
      {notesCandidate && (
        <NotesPopover
          isOpen={Boolean(notesCandidate)}
          onClose={() => setNotesCandidate(null)}
          candidateId={notesCandidate.candidate?.id || notesCandidate.id}
          candidateName={notesCandidate.candidate?.full_name || "Candidate"}
        />
      )}

      {/* ── Archive Confirmation Dialog ── */}
      <ConfirmationDialog
        isOpen={Boolean(archiveCandidate)}
        onClose={() => setArchiveCandidate(null)}
        title="Archive Candidate"
        description={
          <span>
            Are you sure you want to archive{" "}
            <strong className="text-gray-900 font-semibold">
              {archiveCandidate?.candidate?.full_name}
            </strong>
            ? They will be moved to archives in the candidate pipeline.
          </span>
        }
        confirmText="Archive"
        confirmVariant="amber"
        isLoading={isActionLoading}
        onConfirm={async () => {
          if (!archiveCandidate) return;
          setIsActionLoading(true);
          try {
            await onArchiveCandidate(archiveCandidate);
            setArchiveCandidate(null);
          } finally {
            setIsActionLoading(false);
          }
        }}
      />

      {/* ── Skills Fit Hover Modal (Rendered via Portal to eliminate any overflow clipping) ── */}
      {hoveredCandidate && (
        <SkillsFitModal
          isOpen={Boolean(hoveredCandidate)}
          onClose={() => setHoveredCandidate(null)}
          anchorRect={hoveredCandidate.anchorRect}
          matchedSkills={getSkillsFitData(hoveredCandidate.item).matched}
          nonMatchedSkills={getSkillsFitData(hoveredCandidate.item).nonMatched}
          countStr={getSkillsFitData(hoveredCandidate.item).countStr}
          candidateName={hoveredCandidate.item.candidate?.full_name}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        />
      )}
    </div>
  );
};

export default ShortlistTab;
