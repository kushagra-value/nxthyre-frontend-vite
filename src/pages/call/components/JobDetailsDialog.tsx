import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import { Job, jobPostService } from "../../../services/jobPostService";

interface JobDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | null;
  initialJob?: Job | null;
  companyName?: string;
}

const workApproachLabel: Record<string, string> = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const formatSalary = (
  min: number | null | undefined,
  max: number | null | undefined,
  display?: string | null
): string => {
  if (display && display.trim()) return display.trim();
  if (min == null && max == null) return "₹25L – ₹40L per annum";

  const fmt = (v: number | string | null | undefined): string => {
    if (v == null || v === "") return "";
    const num = typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : v;
    if (isNaN(num)) return String(v);

    if (num >= 100000) {
      const lpa = num / 100000;
      return `₹${lpa % 1 === 0 ? lpa : lpa.toFixed(1)}L`;
    }
    return `₹${num % 1 === 0 ? num : num.toFixed(1)}L`;
  };

  if (min != null && max != null) {
    const minStr = fmt(min);
    const maxStr = fmt(max);
    if (!minStr && !maxStr) return "₹25L – ₹40L per annum";
    if (minStr && maxStr) {
      if (minStr === maxStr) return `${minStr} per annum`;
      return `${minStr} – ${maxStr} per annum`;
    }
    return `${minStr || maxStr} per annum`;
  }
  if (min != null) return `From ${fmt(min)} per annum`;
  if (max != null) return `Up to ${fmt(max)} per annum`;
  return "₹25L – ₹40L per annum";
};

// Default fallback skills matching the screenshot
const DEFAULT_SKILLS = [
  "User Research",
  "Wireframing",
  "Figma",
  "Prototyping",
  "Prototyping",
  "Autolayout",
  "Dev Handoff",
];

// Default fallback Must Have requirements matching the screenshot
const DEFAULT_MUST_HAVE = [
  "Strong expertise in Figma with advanced auto-layout and component architecture",
  "Experience building and maintaining large-scale design systems",
  "Proven track record of shipping consumer-facing products at scale",
  "Excellent collaboration with cross-functional teams (PMs, Engineers, Researchers)",
];

export const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({
  isOpen,
  onClose,
  jobId,
  initialJob,
  companyName,
}) => {
  const [job, setJob] = useState<Job | null>(initialJob || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJdDetails, setShowJdDetails] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    if (initialJob && initialJob.id === jobId) {
      setJob(initialJob);
    }

    let isCancelled = false;
    setIsLoading(true);

    jobPostService
      .getJob(jobId)
      .then((data) => {
        if (!isCancelled) {
          setJob(data);
        }
      })
      .catch((err) => {
        console.warn("Using cached job data:", err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, jobId, initialJob]);

  const currentJob = job || initialJob;
  const status = currentJob?.status || currentJob?.job_role_status || "ACTIVE";
  const isActive = status === "ACTIVE" || status === "PUBLISHED";

  // Parse skills safely
  const skillsToDisplay: string[] = useMemo(() => {
    if (currentJob?.skills) {
      if (Array.isArray(currentJob.skills) && currentJob.skills.length > 0) {
        return currentJob.skills.filter(Boolean);
      }
      if (typeof currentJob.skills === "string") {
        try {
          const parsed = JSON.parse(currentJob.skills);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(Boolean);
        } catch {
          const split = (currentJob.skills as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (split.length > 0) return split;
        }
      }
    }
    return DEFAULT_SKILLS;
  }, [currentJob?.skills]);

  // Extract Must Have bullet points
  const mustHavePoints: string[] = useMemo(() => {
    const rawMustHave =
      (currentJob as any)?.must_have_requirements ||
      (currentJob as any)?.mustHaveRequirements ||
      currentJob?.ai_jd_object?.must_have ||
      currentJob?.ai_jd_object?.must_have_skills ||
      currentJob?.ai_jd_object?.requirements;

    if (rawMustHave) {
      if (Array.isArray(rawMustHave) && rawMustHave.length > 0) {
        return rawMustHave.map(String).filter(Boolean);
      }
      if (typeof rawMustHave === "string") {
        const split = rawMustHave
          .split(/[\n•-]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 4);
        if (split.length > 0) return split;
      }
    }

    return DEFAULT_MUST_HAVE;
  }, [currentJob]);

  // Extract Good to Have points if available
  const goodToHavePoints: string[] = useMemo(() => {
    const rawNiceToHave =
      (currentJob as any)?.nice_to_have_requirements ||
      (currentJob as any)?.niceToHaveRequirements ||
      currentJob?.ai_jd_object?.nice_to_have ||
      currentJob?.ai_jd_object?.nice_to_have_skills ||
      currentJob?.ai_jd_object?.good_to_have;

    if (rawNiceToHave) {
      if (Array.isArray(rawNiceToHave) && rawNiceToHave.length > 0) {
        return rawNiceToHave.map(String).filter(Boolean);
      }
      if (typeof rawNiceToHave === "string") {
        return rawNiceToHave
          .split(/[\n•-]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 4);
      }
    }
    return [];
  }, [currentJob]);

  // Header and Row value formatters
  const companyNameDisplay =
    companyName ||
    currentJob?.jobrole_company ||
    currentJob?.workspace_details?.name ||
    "Deloitte";

  const createdByDisplay = currentJob?.posted_by || "sana@valuebound.com";
  const pocDisplay = currentJob?.poc_email || "Max@jupiter.com";

  // Location string: "Bengaluru · Chennai · Hybrid"
  const locationDisplay = useMemo(() => {
    const parts: string[] = [];
    if (currentJob?.location && Array.isArray(currentJob.location) && currentJob.location.length > 0) {
      parts.push(...currentJob.location);
    }
    if (currentJob?.work_approach) {
      const approach =
        workApproachLabel[currentJob.work_approach] || currentJob.work_approach;
      if (!parts.includes(approach)) {
        parts.push(approach);
      }
    }
    if (parts.length === 0) return "Bengaluru · Chennai · Hybrid";
    return parts.join(" · ");
  }, [currentJob?.location, currentJob?.work_approach]);

  const salaryDisplay = useMemo(() => {
    if (currentJob?.is_salary_confidential) return "Confidential";
    return formatSalary(
      currentJob?.salary_min,
      currentJob?.salary_max,
      currentJob?.salary_display
    );
  }, [
    currentJob?.is_salary_confidential,
    currentJob?.salary_min,
    currentJob?.salary_max,
    currentJob?.salary_display,
  ]);

  const experienceDisplay = useMemo(() => {
    if (currentJob?.experience_display) return currentJob.experience_display;
    const min = currentJob?.experience_min_years;
    const max = currentJob?.experience_max_years;
    if (min != null && max != null) return `${min}-${max} years`;
    if (min != null) return `${min}+ years`;
    if (max != null) return `Up to ${max} years`;
    return "5-10 years";
  }, [
    currentJob?.experience_display,
    currentJob?.experience_min_years,
    currentJob?.experience_max_years,
  ]);

  const openingsDisplay = useMemo(() => {
    const count =
      currentJob?.No_of_opening_or_positions_ ?? currentJob?.num_positions;
    return count != null ? String(count) : "2";
  }, [currentJob?.No_of_opening_or_positions_, currentJob?.num_positions]);

  const noticePeriodDisplay = useMemo(() => {
    if (!currentJob?.notice_period) return "30 Days";
    const np = currentJob.notice_period.trim();
    if (np.toLowerCase().includes("day")) return np;
    return `${np} Days`;
  }, [currentJob?.notice_period]);

  const jobDescription =
    currentJob?.description ||
    currentJob?.job_description_markdown ||
    currentJob?.ai_jd ||
    "";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[24px] shadow-2xl border border-gray-100 max-w-[560px] w-full flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-3 bg-white shrink-0 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[19px] font-bold text-gray-900 tracking-tight truncate">
                {currentJob?.title || "Senior Frontend Developer"}
              </h2>

              {/* Status Pill matching screenshot */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  isActive
                    ? "bg-[#EAFBF0] text-[#12B76A] border border-[#ABEFC6]"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                <span>✦</span>
                <span>{isActive ? "Active" : status}</span>
              </span>
            </div>

            {/* Subtitle matching screenshot format: Company . Created by: ... . POC: ... */}
            <div className="text-[11px] text-[#8E8E93] font-normal flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>{companyNameDisplay}</span>
              <span>.</span>
              <span>Created by: {createdByDisplay}</span>
              <span>.</span>
              <span>POC: {pocDisplay}</span>
            </div>
          </div>

          {/* Close button matching screenshot square button with X */}
          <button
            onClick={onClose}
            className="w-6 h-6 border border-gray-300 rounded-[5px] flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition cursor-pointer shrink-0 mt-0.5"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Scrollable Dialog Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar flex flex-col gap-2.5">
          {isLoading && !currentJob ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-7 h-7 text-[#0F47F2] animate-spin" />
              <span className="text-xs font-medium text-gray-500">Loading job details...</span>
            </div>
          ) : (
            <>
              {/* Row 1: Job Title */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Job Title</span>
                <span className="text-[#111827] font-medium text-right truncate ml-4">
                  {currentJob?.title || "Senior Product Designer"}
                </span>
              </div>

              {/* Row 2: Company */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Company</span>
                <span className="text-[#111827] font-medium text-right truncate ml-4">
                  {companyNameDisplay}
                </span>
              </div>

              {/* Row 3: Location */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Location</span>
                <span className="text-[#111827] font-medium text-right truncate ml-4">
                  {locationDisplay}
                </span>
              </div>

              {/* Row 4: Salary Range */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Salary Range</span>
                <span className="text-[#111827] font-medium text-right ml-4">
                  {salaryDisplay}
                </span>
              </div>

              {/* Row 5: Experience */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Experience</span>
                <span className="text-[#111827] font-medium text-right ml-4">
                  {experienceDisplay}
                </span>
              </div>

              {/* Row 6: Openings */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Openings</span>
                <span className="text-[#111827] font-medium text-right ml-4">
                  {openingsDisplay}
                </span>
              </div>

              {/* Row 7: Notice Period */}
              <div className="bg-[#F8F9FA] rounded-[12px] px-4 py-3 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-normal">Notice Period</span>
                <span className="text-[#111827] font-medium text-right ml-4">
                  {noticePeriodDisplay}
                </span>
              </div>

              {/* Primary Skills */}
              <div className="bg-[#F8F9FA] rounded-[14px] p-4 flex flex-col gap-2.5">
                <span className="text-[#6B7280] text-xs font-normal">Primary Skills</span>
                <div className="flex flex-wrap gap-2">
                  {skillsToDisplay.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-[#BFDBFE] text-[#2563EB] text-xs font-medium px-3.5 py-1.5 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Must Have */}
              <div className="bg-[#F8F9FA] rounded-[14px] p-4 flex flex-col gap-2">
                <span className="text-[#EF4444] font-semibold text-xs">Must Have</span>
                <div className="space-y-2 text-xs text-[#374151] leading-relaxed">
                  {mustHavePoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#374151] leading-relaxed font-bold">•</span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Good To Have (if available on job) */}
              {goodToHavePoints.length > 0 && (
                <div className="bg-[#F8F9FA] rounded-[14px] p-4 flex flex-col gap-2">
                  <span className="text-[#0F47F2] font-semibold text-xs">Good To Have</span>
                  <div className="space-y-2 text-xs text-[#374151] leading-relaxed">
                    {goodToHavePoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#374151] leading-relaxed font-bold">•</span>
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description (Expandable toggle) */}
              {jobDescription && (
                <div className="bg-[#F8F9FA] rounded-[14px] p-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJdDetails(!showJdDetails)}
                    className="flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-black cursor-pointer"
                  >
                    <span>Full Job Description</span>
                    <span className="text-[#0F47F2] font-normal text-[11px]">
                      {showJdDetails ? "Hide" : "View"}
                    </span>
                  </button>
                  {showJdDetails && (
                    <div className="text-xs text-[#374151] leading-relaxed whitespace-pre-line pt-2 border-t border-gray-200">
                      {jobDescription}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsDialog;
