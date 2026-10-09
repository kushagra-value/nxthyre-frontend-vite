
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
}: {
  score: number | null | undefined;
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
    <div className="relative flex items-center justify-center shrink-0 mt-0.5" style={{ width: size, height: size }} title={`Score: ${val}`}>
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
      className={`bg-white rounded-xl p-3.5 flex flex-col gap-2 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-[#0F47F2]/40 hover:-translate-y-[1px] transition-all duration-200 cursor-pointer group ${
        isDone ? 'border-emerald-200 bg-emerald-50/20' : ''
      }`}
      onClick={onClick}
    >
      {/* 1. Candidate Name (Left) + Top Right Score Progress Rings (Screening Score then Resume Score, no text labels) */}
      <div className="flex items-start justify-between gap-2">
        {/* Candidate Name */}
        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0F47F2] transition-colors leading-snug truncate pt-0.5">
          {name}
        </h4>

        {/* Top Right Score Displays */}
        <div className="flex items-center gap-1.5 shrink-0">
          {effectiveScreeningScore != null && (
            <ScoreCircle score={effectiveScreeningScore} />
          )}
          {resumeScore != null && (
            <ScoreCircle score={resumeScore} />
          )}
        </div>
      </div>

      {/* 2. Job Title (Company Name) */}
      <p className="text-xs font-medium text-[#475569] truncate leading-tight">
        {jobCompanyDisplay}
      </p>

      {/* 3. Recruiter Name & Screening Round Badge (Only real round badge, no score text labels) */}
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[#64748B]">
        {recruiterName ? (
          <div className="flex items-center gap-1.5 truncate">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="#64748B" strokeWidth="1.2" />
              <path d="M3 14C3 11.2386 5.23858 9 8 9C10.7614 9 13 11.2386 13 14" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="truncate">{recruiterName}</span>
          </div>
        ) : <div />}
        {effectiveScreeningRound && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]/60 truncate shrink-0">
            {effectiveScreeningRound}
          </span>
        )}
      </div>

      {/* 4. Action / Status Pill + Navigation Affordance Arrow */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium leading-none rounded-md border transition-colors ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {pillText}
        </span>

        {/* Action / Navigation Affordance Arrow */}
        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 group-hover:bg-[#E7EDFF] transition-colors shrink-0">
          {isDone ? (
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="20" rx="4" fill="#059669" />
              <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F47F2] group-hover:translate-x-0.5 transition-all duration-200"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33334 8H12.6667M12.6667 8L8 3.33333M12.6667 8L8 12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Call Notes / Tags (If present) */}
      {(latestCallNote || (latestCallTags && latestCallTags.length > 0)) && (
        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2 text-[11px] text-[#475569] flex flex-col gap-1.5 mt-0.5">
          {latestCallTags && latestCallTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {latestCallTags.map(tag => (
                <span
                  key={tag}
                  className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {latestCallNote && (
            <div className="flex items-start gap-1.5 text-xs">
              <span className="text-slate-400 shrink-0 mt-0.5">💬</span>
              <span className="leading-tight text-[#475569] italic">{latestCallNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
