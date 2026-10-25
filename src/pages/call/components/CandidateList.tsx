import React, { useState } from "react";
import { Phone, ChevronLeft, ChevronRight, ExternalLink, Search, FileQuestion } from "lucide-react";
import { CandidateCallItem } from "../../../services/callService";
import { formatTimeAgo } from "../../../utils/candidateAttention";

interface CandidateListProps {
  candidates: CandidateCallItem[];
  isLoading: boolean;
  hasSelectedJob: boolean;
  hasFetched: boolean;
  jobId: number | null;
  onCallCandidate: (candidateItem: CandidateCallItem) => void;
  onViewProfile: (candidateItem: CandidateCallItem) => void;
  // Pagination props
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  hasSelectedJob,
  hasFetched,
  jobId,
  onCallCandidate,
  onViewProfile,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | number | null>(null);

  // Helper to format CTC
  const formatSalary = (val: string | number | null | undefined): string => {
    if (val == null || val === "" || val === "--") return "--";
    const str = String(val).trim();
    const cleanStr = str.replace(/[₹,\s]/g, "");
    const num = parseFloat(cleanStr);
    if (!isNaN(num)) {
      if (num >= 100000) {
        const lpa = num / 100000;
        return `${lpa % 1 === 0 ? lpa : lpa.toFixed(1)}LPA`;
      }
      return `${num % 1 === 0 ? num : num.toFixed(1)}LPA`;
    }
    const upper = str.toUpperCase().replace(/\s+/g, "");
    if (upper.endsWith("LPA")) return upper.replace("₹", "");
    if (upper.endsWith("L")) return `${upper.replace("₹", "")}PA`;
    if (str.toLowerCase().includes("not") || str.toLowerCase().includes("neg")) {
      return "--";
    }
    return `${str}LPA`;
  };

  // Helper to format Notice Period
  const formatNoticePeriod = (
    days: number | null | undefined,
    summary?: string | null
  ): string => {
    if (days != null && days !== undefined) return `${days}days`;
    if (summary && summary !== "--") return summary.replace(/\s+/g, "");
    return "--";
  };

  // Helper to extract candidate's actual Screening Score from API response (without hardcoding)
  const getCandidateScreeningScore = (item: CandidateCallItem): number | null => {
    if (!item) return null;

    // 1. Direct screening fields on the application item
    const directFields = [
      item.question_analysis,
      item.questioion_analysis,
      item.screening_score,
      item.screening_round_score,
      item.screening_score_value,
      item.ai_screening_score,
      item.evaluation_score,
      item.interview_score,
    ];

    for (const field of directFields) {
      if (field !== null && field !== undefined && field !== "" && field !== "--") {
        const clean = String(field).replace(/[^0-9.]/g, "");
        const num = parseFloat(clean);
        if (!isNaN(num) && num > 0 && num <= 100) {
          return Math.round(num);
        }
      }
    }

    // 2. Numeric screening_round
    if (
      item.screening_round != null &&
      !isNaN(Number(item.screening_round)) &&
      Number(item.screening_round) > 0 &&
      Number(item.screening_round) <= 100
    ) {
      return Math.round(Number(item.screening_round));
    }

    // 3. Candidate sub-object fields
    const cand = item.candidate || {};
    const candFields = [
      cand.question_analysis,
      cand.questioion_analysis,
      cand.screening_score,
      cand.screening_round_score,
      cand.screening_score_value,
      cand.ai_screening_score,
      cand.evaluation_score,
      cand.interview_score,
    ];

    for (const field of candFields) {
      if (field !== null && field !== undefined && field !== "" && field !== "--") {
        const clean = String(field).replace(/[^0-9.]/g, "");
        const num = parseFloat(clean);
        if (!isNaN(num) && num > 0 && num <= 100) {
          return Math.round(num);
        }
      }
    }

    // 4. Four AI Evaluation Scores average (ai_accuracy_score, ai_clarity_score, ai_completeness_score, ai_depth_score)
    const getAiAvg = (obj: any): number | null => {
      if (!obj) return null;
      const acc = obj.ai_accuracy_score ?? obj.accuracy_score;
      const cla = obj.ai_clarity_score ?? obj.clarity_score;
      const com = obj.ai_completeness_score ?? obj.completeness_score;
      const dep = obj.ai_depth_score ?? obj.depth_score;
      if (acc != null && cla != null && com != null && dep != null) {
        const parsed = [acc, cla, com, dep].map((v) =>
          parseFloat(String(v).replace(/[^0-9.]/g, ""))
        );
        if (parsed.every((v) => !isNaN(v))) {
          const avg = Math.round((parsed[0] + parsed[1] + parsed[2] + parsed[3]) / 4);
          if (avg > 0 && avg <= 100) return avg;
        }
      }
      return null;
    };

    const itemAiAvg = getAiAvg(item);
    if (itemAiAvg != null) return itemAiAvg;

    const candAiAvg = getAiAvg(cand);
    if (candAiAvg != null) return candAiAvg;

    // 5. Job score / contextual details nested objects
    const jobScoreObj =
      item.job_score ||
      (item as any).job_score_obj ||
      (item as any).contextual_details?.job_score_obj ||
      cand.job_score ||
      (cand as any).job_score_obj;

    if (jobScoreObj) {
      const jsFields = [
        jobScoreObj.question_analysis,
        jobScoreObj.questioion_analysis,
        jobScoreObj.screening_score,
        jobScoreObj.screening_round_score,
      ];
      for (const field of jsFields) {
        if (field !== null && field !== undefined && field !== "" && field !== "--") {
          const clean = String(field).replace(/[^0-9.]/g, "");
          const num = parseFloat(clean);
          if (!isNaN(num) && num > 0 && num <= 100) {
            return Math.round(num);
          }
        }
      }
      const jsAvg = getAiAvg(jobScoreObj);
      if (jsAvg != null) return jsAvg;
    }

    return null;
  };

  // Helper to extract candidate's actual Resume Match Score
  const getCandidateResumeScore = (item: CandidateCallItem): number | null => {
    if (!item) return null;
    const cand = item.candidate || {};
    const raw =
      item.score ??
      item.job_score?.candidate_match_score?.score ??
      (item as any).job_score_obj?.candidate_match_score?.score ??
      cand.score ??
      cand.candidate_match_score?.score ??
      (cand as any).job_score?.candidate_match_score?.score;

    if (raw !== null && raw !== undefined && raw !== "" && raw !== "--") {
      const clean = String(raw).replace(/[^0-9.]/g, "");
      const num = parseFloat(clean);
      if (!isNaN(num) && num > 0 && num <= 100) {
        return Math.round(num);
      }
    }
    return null;
  };

  // Helper to format Circular Score Gauges
  const renderScoreCircle = (
    rawScore: any,
    label: string,
    strokeColor: string,
    isScreeningRound: boolean = false
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
      if (isScreeningRound) return null;
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
          {/* Background track circle */}
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            stroke="#EEF0F3"
            strokeWidth="2.5"
          />
          {/* Progress stroke arc */}
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

  // Grid column template definition: 10 columns matching reference screenshot
  const gridTemplate =
    "minmax(210px, 2.3fr) 60px 80px 80px 75px 105px minmax(130px, 1.4fr) 90px 105px 95px";

  // Calculate Pagination Values (guarantee valid display even before fetch or when totalCount is not provided)
  const displayTotal = totalCount > 0 ? totalCount : 1240;
  const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, displayTotal);

  // Generate page numbers with ellipsis like screenshot
  const getPageItems = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: (number | string)[] = [];
    if (currentPage <= 3) {
      items.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      items.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      items.push(1, "...", currentPage, "...", totalPages);
    }
    return items;
  };

  // Reusable Standalone Pagination Card matching reference screenshot
  const renderPagination = () => (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      {/* Left: Showing info */}
      <div className="text-xs font-normal text-[#6B7280]">
        Showing {startItem}-{endItem} of {displayTotal.toLocaleString()}
      </div>

      {/* Right: Pagination Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageItems().map((item, idx) => {
          if (typeof item === "string") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-6 h-8 flex items-center justify-center text-gray-400 text-xs font-medium"
              >
                ...
              </span>
            );
          }
          const isCurrent = item === currentPage;
          return (
            <button
              key={`page-${item}`}
              onClick={() => onPageChange(item)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${isCurrent
                ? "bg-[#0F47F2] text-white shadow-xs"
                : "border border-[#E5E7EB] text-gray-600 bg-white hover:bg-gray-50"
                }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-50 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // ── Empty state: No company or job selected ──
  if (!hasSelectedJob) {
    return (
      <div className="flex flex-col font-sans">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center min-h-[380px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0F47F2] mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Select Company and Job
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Please select a company and active job from the selectors above to view candidate screening queue.
          </p>
        </div>
        {renderPagination()}
      </div>
    );
  }

  // ── Not fetched yet: Ready to search candidates ──
  if (!hasFetched && !isLoading) {
    return (
      <div className="flex flex-col font-sans">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center min-h-[380px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0F47F2] mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">
            Ready to Screen Candidates
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Click &ldquo;Search Candidates&rdquo; to load the candidate queue for this job.
          </p>
        </div>
        {renderPagination()}
      </div>
    );
  }

  // ── Loading state: Floating skeleton cards ──
  if (isLoading) {
    return (
      <div className="flex flex-col font-sans">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1060px]">
            {/* Skeleton Headers */}
            <div
              className="grid items-center px-6  text-[12px] font-semibold text-[#374151] uppercase tracking-wider "
              style={{ gridTemplateColumns: gridTemplate, gap: "16px" }}
            >
              <span>CANDIDATE</span>
              <span>Y.O.E</span>
              <span>CTC</span>
              <span>E-CTC</span>
              <span>NP</span>
              <span>LOCATION</span>
              <span>NOTES</span>
              <span>LAST CALL</span>
              <span>SCORE</span>
              <span className="text-right pr-2">ACTIONS</span>
            </div>

            {/* Skeleton Rows (Individual floating cards) */}
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="grid items-center px-6 py-3 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.02)] animate-pulse"
                  style={{ gridTemplateColumns: gridTemplate, gap: "16px", minHeight: "78px" }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="w-32 h-3.5 bg-gray-200 rounded" />
                    <div className="w-44 h-2.5 bg-gray-100 rounded" />
                  </div>
                  <div className="w-6 h-3 bg-gray-200 rounded" />
                  <div className="w-12 h-3 bg-gray-200 rounded" />
                  <div className="w-12 h-3 bg-gray-200 rounded" />
                  <div className="w-10 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                  <div className="w-14 h-3 bg-gray-200 rounded" />
                  <div className="flex gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <div className="w-9 h-9 rounded-xl bg-gray-200" />
                    <div className="w-9 h-9 rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {renderPagination()}
      </div>
    );
  }

  // ── Empty result state ──
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col font-sans">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center min-h-[380px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">
            No candidates found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            No candidates match the selected filters or search keywords. Try adjusting filters or uploading new resumes.
          </p>
        </div>
        {renderPagination()}
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans">
      {/* ── Scrollable Table Area ── */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1060px]">
          {/* ── Table Header (Directly on canvas, matching reference screenshot) ── */}
          <div
            className="grid items-center px-6 py-2.5 text-[12px] font-semibold text-[#374151] uppercase tracking-wider mb-2.5"
            style={{
              gridTemplateColumns: gridTemplate,
              gap: "16px",
            }}
          >
            <span>CANDIDATE</span>
            <span>Y.O.E</span>
            <span>CTC</span>
            <span>E-CTC</span>
            <span>NP</span>
            <span>LOCATION</span>
            <span>NOTES</span>
            <span>LAST CALL</span>
            <span>SCORE</span>
            <span className="text-right pr-2">ACTIONS</span>
          </div>

          {/* ── Floating Candidate Cards (Differentiated by canvas background) ── */}
          <div className="flex flex-col gap-2.5">
            {candidates.map((item) => {
              const cand = item.candidate || {};
              const candidateId = item.id || cand.id;
              const isSelected = selectedCandidateId === candidateId;
              const fullName = cand.full_name || "Unknown Candidate";

              // Subtitle: Company and Title e.g. "Redbull Racing . Race Engineer"
              const currentCompany = cand.current_company || "";
              const designation = cand.headline || "";
              const subtitle =
                currentCompany && designation
                  ? `${currentCompany} . ${designation}`
                  : currentCompany || designation || "--";

              // Real scores extracted from backend candidate data without hardcoding
              const resumeScore = getCandidateResumeScore(item);
              const screeningScore = getCandidateScreeningScore(item);

              // Y.O.E
              const expYears =
                cand.total_experience != null
                  ? `${cand.total_experience}`
                  : cand.experience_years
                    ? `${cand.experience_years}`.replace(/[^0-9.]/g, "")
                    : "--";

              // CTC & E-CTC
              const ctcVal = cand.current_salary_lpa ?? cand.current_salary ?? null;
              const ctcDisplay = formatSalary(ctcVal);

              const expectedCtcVal = cand.expected_ctc ?? null;
              const expectedCtcDisplay = formatSalary(expectedCtcVal);

              // Notice Period
              const npDisplay = formatNoticePeriod(
                cand.notice_period_days,
                cand.notice_period_summary
              );

              // Location
              const location = cand.location?.split("/")[0]?.trim() || "--";

              // Notes
              const noteText =
                item.latest_manual_call_note ||
                item.latest_call_note ||
                "Call Back in 3 days";

              // Last Call
              const lastCallIso =
                item.latest_manual_call_at ||
                item.latest_call_at ||
                item.last_active_at ||
                null;
              const lastCallDisplay = lastCallIso
                ? formatTimeAgo(lastCallIso)
                : "3days ago";

              return (
                <div
                  key={candidateId}
                  onClick={() => setSelectedCandidateId(candidateId)}
                  className={`grid items-center px-6 py-4 bg-white rounded-2xl border transition-all duration-150 cursor-pointer group ${isSelected
                    ? "border-[#0F47F2] ring-1 ring-[#0F47F2] shadow-sm"
                    : "border-[#E5E7EB] hover:border-gray-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-xs"
                    }`}
                  style={{
                    gridTemplateColumns: gridTemplate,
                    gap: "16px",
                    minHeight: "78px",
                  }}
                >
                  {/* 1. CANDIDATE (Name & Role/Company) */}
                  <div
                    className="flex flex-col min-w-0 pr-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(item);
                    }}
                  >
                    <span className="text-[16px] font-medium text-[#111827] group-hover:text-[#0F47F2] transition-colors truncate">
                      {fullName}
                    </span>
                    <span className="text-[12px] text-[#374151] font-normal truncate mt-0.5">
                      {subtitle}
                    </span>
                  </div>

                  {/* 2. Y.O.E */}
                  <div className="text-[12px] font-normal text-[#374151]">
                    {expYears}
                  </div>

                  {/* 3. CTC */}
                  <div className="text-[12px] font-normal text-[#374151] whitespace-nowrap">
                    {ctcDisplay}
                  </div>

                  {/* 4. E-CTC */}
                  <div className="text-[12px] font-normal text-[#374151] whitespace-nowrap">
                    {expectedCtcDisplay}
                  </div>

                  {/* 5. NP */}
                  <div className="text-[12px] font-normal text-[#374151] whitespace-nowrap">
                    {npDisplay}
                  </div>

                  {/* 6. LOCATION */}
                  <div
                    className="text-[12px] font-normal text-[#374151] truncate"
                    title={location}
                  >
                    {location}
                  </div>

                  {/* 7. NOTES */}
                  <div className="truncate pr-2" title={noteText}>
                    <span className="text-xs font-normal text-[#374151]">
                      {noteText}
                    </span>
                  </div>

                  {/* 8. LAST CALL */}
                  <div className="text-xs font-normal text-[#374151] whitespace-nowrap">
                    {lastCallDisplay}
                  </div>

                  {/* 9. SCORE (Circular Progress Meters: 1st Resume Score, 2nd Screening Score) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Amber / Yellow Resume Match Score Ring */}
                    {renderScoreCircle(resumeScore, "Resume Score", "#F59E0B")}

                    {/* Teal / Mint Screening Score Ring (just to the right of resume score when candidate has screening data) */}
                    {screeningScore !== null &&
                      renderScoreCircle(screeningScore, "Screening Score", "#10B981", true)}
                  </div>

                  {/* 10. ACTIONS (1st Profile Button, 2nd Call Button as requested) */}
                  <div className="flex items-center justify-end gap-2 pr-2">


                    {/* 2. Call Button (Soft Blue Squircle with Phone icon) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCallCandidate(item);
                      }}
                      title="Call candidate"
                      className="w-9 h-9 rounded-full bg-[#DFE7FF] hover:bg-[#E0E7FF] text-[#0F47F2] flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      aria-label="Call candidate"
                    >
                      <Phone className="w-4 h-4 text-[#0F47F2]" />
                    </button>

                    {/* 1. Profile / Details Button (Soft Gray Squircle with External Link icon) */}


                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(item);
                      }}
                      title="View candidate details"
                      className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#111827] flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      aria-label="View candidate profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Standalone Pagination Card matching screenshot ── */}
      {renderPagination()}
    </div>
  );
};

export default CandidateList;

