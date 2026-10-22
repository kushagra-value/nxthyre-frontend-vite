
import React from 'react';

interface PriorityCardProps {
  name: string;
  role: string;
  company?: string;
  daysAgo: number;
  status: string;
  statusColor: 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' | 'green';
  isDone?: boolean;
  latestCallNote?: string | null;
  latestCallTags?: string[] | null;
  recruiterName?: string | null;
  resumeScore?: number | null;
  screeningScore?: number | null;
  screeningRound?: string | null;
  tabKey?: 'sourcing' | 'screening' | 'interview';
  onClick?: () => void;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]/60' },
  rose: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FCA5A5]/50' },
  indigo: { bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]', border: 'border-[#C7D2FE]/60' },
  blue: { bg: 'bg-[#F0F9FF]', text: 'text-[#0284C7]', border: 'border-[#BAE6FD]/60' },
  green: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', border: 'border-[#A7F3D0]/60' },
  grey: { bg: 'bg-[#F9FAFB]', text: 'text-[#4B5563]', border: 'border-[#E5E7EB]' },
};

const formatDuration = (days: number): string => {
  if (days === 0) return '0 days';
  if (days === 1) return '1 day';
  return `${days} days`;
};

const ScoreCircle = ({
  score,
  label,
}: {
  score: number | null | undefined;
  label?: string;
}) => {
  if (score == null) return null;
  const val = Math.min(Math.max(score, 0), 100);
  const size = 32;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (val / 100) * circumference;

  // Threshold colors: >= 70 Green, 50-69 Yellow/Amber, < 50 Red
  let strokeColor = "#EF4444"; // Red
  let textColor = "text-[#DC2626]";

  if (val >= 70) {
    strokeColor = "#10B981"; // Green
    textColor = "text-[#059669]";
  } else if (val >= 50) {
    strokeColor = "#F59E0B"; // Yellow/Amber
    textColor = "text-[#D97706]";
  }

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={label ? `${label}: ${val}` : `Score: ${val}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke="#E2E8F0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={radius}
          cx={center}
          cy={center}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold ${textColor}`}>
        {val}
      </span>
    </div>
  );
};

export default function PriorityCard({
  name,
  role,
  company,
  daysAgo,
  status,
  statusColor,
  isDone,
  latestCallNote,
  latestCallTags,
  recruiterName,
  resumeScore,
  screeningScore,
  screeningRound,
  tabKey = 'sourcing',
  onClick,
}: PriorityCardProps) {
  const colors = isDone
    ? statusStyles.green
    : (statusStyles[statusColor] || statusStyles.grey);

  // Extract clean status tag by removing existing duration references (e.g. "for 57 days", "· 57 days")
  let cleanTag = status.split('-')[0].trim();
  cleanTag = cleanTag.replace(/\s*(?:·|for)?\s*\d+\s*days?/gi, '').trim();
  if (!cleanTag) {
    cleanTag = 'Pending';
  }

  // Combine status tag and dynamic duration
  const durationText = formatDuration(daysAgo);
  const pillText = `${cleanTag} · ${durationText}`;
  const pillTooltip = latestCallNote ? `${pillText} • Note: ${latestCallNote}` : pillText;

  // Format job_name (company name) with .com removed cleanly
  const cleanCompany = (company || '').replace(/\.com$/i, '').trim();
  const cleanRole = (role || '').trim();
  const jobCompanyDisplay = cleanCompany ? `${cleanRole} (${cleanCompany})` : cleanRole;

  // Convert numeric screeningRound props to screeningScore progress rings automatically
  let effectiveScreeningScore = screeningScore;
  let effectiveScreeningRound = screeningRound;
  if (effectiveScreeningScore == null && screeningRound != null && screeningRound.trim() !== '' && !isNaN(Number(screeningRound.trim()))) {
    effectiveScreeningScore = Number(screeningRound.trim());
    effectiveScreeningRound = null;
  }

  return (
    <div
      className={`bg-white rounded-xl p-3.5 flex flex-col justify-between h-36 shrink-0 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#0F47F2]/40 hover:-translate-y-[1px] transition-all duration-200 cursor-pointer group ${
        isDone ? 'border-emerald-200 bg-emerald-50/20' : ''
      }`}
      onClick={onClick}
    >
      {/* 1. Top Section: Candidate Name, Job Title, and Status Note */}
      <div className="flex flex-col min-w-0">
        {/* Candidate Name */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h4
            className="text-sm font-bold text-[#0F172A] group-hover:text-[#0F47F2] transition-colors leading-tight truncate"
            title={name}
          >
            {name}
          </h4>
          {effectiveScreeningRound && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 truncate shrink-0">
              {effectiveScreeningRound}
            </span>
          )}
        </div>

        {/* Job Title & Company */}
        <p
          className="text-xs font-medium text-[#475569] truncate leading-tight mt-1 min-h-[16px]"
          title={jobCompanyDisplay}
        >
          {jobCompanyDisplay}
        </p>

        {/* Status Note Pill (Placed where recruiter name was previously) */}
        <div className="flex items-center min-w-0 mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium leading-none rounded-md border transition-colors truncate max-w-full ${colors.bg} ${colors.text} ${colors.border}`}
            title={pillTooltip}
          >
            <span className="truncate">{pillText}</span>
          </span>
        </div>
      </div>

      {/* 2. Bottom Section: Recruiter Name (Left) & Scores (Right) below horizontal separator */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 h-8 shrink-0">
        {/* Recruiter Name (Placed where status note was previously) */}
        <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-medium text-[#64748B]">
          {recruiterName ? (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#64748B" strokeWidth="1.2" />
                <path d="M3 14C3 11.2386 5.23858 9 8 9C10.7614 9 13 11.2386 13 14" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="truncate" title={recruiterName}>{recruiterName}</span>
            </>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {/* Screening Score & Resume Score */}
        <div className="flex items-center gap-1.5 shrink-0 h-8">
          {effectiveScreeningScore != null && (
            <ScoreCircle score={effectiveScreeningScore} label="Screening Score" />
          )}
          {resumeScore != null && (
            <ScoreCircle score={resumeScore} label="Resume Score" />
          )}
        </div>
      </div>
    </div>
  );
}
