import React from 'react';
import {
  Phone,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';

export interface PriorityCardProps {
  id: string;
  name: string;
  role: string;
  company?: string;
  daysAgo: number;
  status: string;
  statusColor?: 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' | 'green';
  stageTab: 'sourcing' | 'screening' | 'interview';
  applicationId: number;
  candidateId: string;
  jobRoleId: number;
  workspaceId?: number;
  recruiterName?: string | null;
  score?: number | null;
  scoreLabel?: string;
  resumeScore?: number | null;
  screeningScore?: number | null;
  experience?: string;
  location?: string;
  salary?: string;
  isActionLoading?: boolean;
  onClick?: () => void;
  onCall?: (e: React.MouseEvent) => void;
  onMoveForward?: (e: React.MouseEvent) => void;
  onShortlist?: (e: React.MouseEvent) => void;
  onMoveStage?: (e: React.MouseEvent) => void;
  onArchive?: (e: React.MouseEvent) => void;
}

// Helper to compute initials from full name
const getInitials = (fullName: string): string => {
  if (!fullName) return 'C';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// SVG circular progress ring matching design
const ScoreCircle = ({
  score,
  label,
}: {
  score: number | null | undefined;
  label: string;
}) => {
  const val = score != null ? Math.min(Math.max(Math.round(score), 0), 100) : null;
  const size = 46;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth - 1;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = val != null ? circumference - (val / 100) * circumference : circumference;

  let strokeColor = '#10B981'; // Green >= 70
  if (val != null) {
    if (val < 50) strokeColor = '#EF4444'; // Red < 50
    else if (val < 70) strokeColor = '#F59E0B'; // Amber 50-69
  }

  return (
    <div className="flex flex-col items-center justify-center shrink-0 min-w-[70px]">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={center}
            cy={center}
          />
          {val != null && (
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
          )}
        </svg>
        <span className="absolute text-[11px] font-bold text-[#0F172A]">
          {val != null ? `${val}%` : '--'}
        </span>
      </div>
      <span className="text-[10px] font-medium text-[#64748B] mt-1 text-center whitespace-nowrap">
        {label}
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
  stageTab,
  score,
  resumeScore,
  screeningScore,
  experience,
  location,
  salary,
  isActionLoading = false,
  onClick,
  onCall,
  onMoveForward,
  onShortlist,
  onMoveStage,
  onArchive,
}: PriorityCardProps) {
  // Clean company name
  const cleanCompany = (company || '').replace(/\.com$/i, '').trim();

  // Extract clean tag for status strictly matching stage design
  let cleanTag = (status || '').split('-')[0].trim();
  cleanTag = cleanTag.replace(/\s*(?:·|for)?\s*\d+\s*days?/gi, '').trim();
  const lowerTag = cleanTag.toLowerCase();
  if (stageTab === 'sourcing' || lowerTag.includes('called')) {
    cleanTag = 'Not Called';
  } else if (stageTab === 'screening' || lowerTag.includes('moved')) {
    cleanTag = 'Not Moved';
  } else if (stageTab === 'interview' || lowerTag.includes('feedback')) {
    cleanTag = 'Feedback Pending';
  } else if (!cleanTag) {
    cleanTag =
      stageTab === 'sourcing'
        ? 'Not Called'
        : stageTab === 'screening'
        ? 'Not Moved'
        : 'Feedback Pending';
  }

  // Formatting days display
  const daysText = daysAgo === 1 ? '1 day' : `${daysAgo} days`;

  // Stage-based color scheme
  let borderAccentColor = '#0F47F2'; // Sourcing blue
  let avatarBg = 'bg-[#DBEAFE] text-[#1D4ED8]';
  let statusBoxBg = 'bg-[#FEF2F2] border-[#FEE2E2]';
  let statusTextColor = 'text-[#DC2626]';

  if (stageTab === 'screening') {
    borderAccentColor = '#8B5CF6'; // Screening purple
    avatarBg = 'bg-[#F3E8FF] text-[#7E22CE]';
    statusBoxBg = 'bg-[#FFFBEB] border-[#FEF3C7]';
    statusTextColor = 'text-[#D97706]';
  } else if (stageTab === 'interview') {
    borderAccentColor = '#0D9488'; // Interview teal
    avatarBg = 'bg-[#CCFBF1] text-[#0F766E]';
    statusBoxBg = 'bg-[#EFF6FF] border-[#DBEAFE]';
    statusTextColor = 'text-[#2563EB]';
  }

  const initials = getInitials(name);
  const effectiveResumeScore = resumeScore ?? (stageTab === 'sourcing' ? score : null);
  const effectiveScreeningScore = screeningScore ?? null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#0F47F2]/40 transition-all duration-200 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 gap-4 cursor-pointer group shrink-0 min-h-[96px]"
    >
      {/* ── 1. Far Left Accent Color Strip ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: borderAccentColor }}
      />

      {/* ── 2. Candidate Info (Avatar + Name + Job + Badges) ── */}
      <div className="flex items-center gap-4 min-w-0 flex-1 pl-1">
        {/* Avatar Circle with initials */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${avatarBg}`}
        >
          {initials}
        </div>

        {/* Name and Job details */}
        <div className="min-w-0 flex-1">
          <h4
            className="text-base font-bold text-[#0F172A] group-hover:text-[#0F47F2] transition-colors truncate"
            title={name}
          >
            {name}
          </h4>

          <p
            className="text-xs md:text-sm font-medium text-[#475569] truncate mt-0.5"
            title={`${role}${cleanCompany ? ` • ${cleanCompany}` : ''}`}
          >
            <span>{role}</span>
            {cleanCompany && (
              <>
                <span className="mx-1.5 text-slate-300">•</span>
                <span className="text-[#64748B]">{cleanCompany}</span>
              </>
            )}
          </p>

          {/* Badges / Meta row (Experience, Location, CTC) */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#64748B]">
            {experience && (
              <div className="flex items-center gap-1 shrink-0 font-medium text-[#64748B]">
                <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{experience}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1 shrink-0 font-medium text-[#64748B]">
                <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{location}</span>
              </div>
            )}
            {salary && (
              <div className="shrink-0 font-medium text-[#334155]">
                <span>{salary}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Middle Status Tag, Scores & Action Buttons ── */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:gap-5 lg:gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        {/* 1st Change: Status Tag in ONE LINE with smaller font & padding */}
        <div
          className={`rounded-full px-2.5 py-1 flex items-center gap-1.5 shrink-0 border text-[11px] font-semibold leading-none shadow-2xs ${statusBoxBg} ${statusTextColor}`}
        >
          <Clock className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">{cleanTag} · {daysText}</span>
        </div>

        {/* 2nd Change: Both Resume Score and Screening Score in Screening & Interview tabs */}
        <div className="flex items-center gap-2.5 shrink-0">
          {stageTab === 'sourcing' ? (
            <ScoreCircle score={effectiveResumeScore} label="Resume Score" />
          ) : (
            <>
              <ScoreCircle score={effectiveResumeScore} label="Resume Score" />
              <ScoreCircle score={effectiveScreeningScore} label="Screening Score" />
            </>
          )}
        </div>

        {/* Action Buttons: Phone for Sourcing, Move Stage for Shortlisted & Interview + Delete/Archive */}
        <div className="flex items-center gap-2 shrink-0">
          {stageTab === 'sourcing' && (
            /* Sourcing: Phone Icon Only */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCall?.(e);
              }}
              className="w-9 h-9 rounded-xl bg-[#0F47F2] hover:bg-[#0D3ED4] text-white flex items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-150 active:scale-95 shrink-0"
              title="Make a Call"
            >
              <Phone className="w-4 h-4 fill-current" />
            </button>
          )}

          {(stageTab === 'screening' || stageTab === 'interview') && (
            /* Shortlisted & Interview: Move Stage Icon Only */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage?.(e);
              }}
              disabled={isActionLoading}
              className="w-9 h-9 rounded-xl bg-[#0F47F2] hover:bg-[#0D3ED4] text-white flex items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-150 active:scale-95 disabled:opacity-50 shrink-0"
              title="Move Stage"
            >
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>
          )}

          {/* Delete / Archive Icon Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(e);
            }}
            disabled={isActionLoading}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all shadow-2xs active:scale-95 disabled:opacity-50 shrink-0"
            title="Move to Archive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
