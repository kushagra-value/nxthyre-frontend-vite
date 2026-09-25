
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
  onClick,
}: PriorityCardProps) {
  const colors = isDone
    ? statusStyles.green
    : (statusStyles[statusColor] || statusStyles.grey);

  // Extract clean status tag
  const rawTag = status.split('-')[0].trim();
  
  // Combine status tag and dynamic duration
  const durationText = formatDuration(daysAgo);
  const pillText = `${rawTag} · ${durationText}`;

  return (
    <div
      className={`bg-white rounded-xl p-3.5 flex flex-col justify-between gap-3 border border-[#E5E7EB]/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#0F47F2]/40 hover:-translate-y-[1px] transition-all duration-200 cursor-pointer group ${
        isDone ? 'border-[#059669]/30 bg-[#F0FDF4]/30' : ''
      }`}
      onClick={onClick}
    >
      {/* 1. Candidate Info Stack */}
      <div className="flex flex-col gap-1">
        {/* Candidate Name */}
        <h4 className="text-sm font-semibold text-[#1F2937] group-hover:text-[#0F47F2] transition-colors leading-snug truncate">
          {name}
        </h4>

        {/* Job Title & Company */}
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-normal text-[#6B7280] truncate leading-tight">
            {role}
          </span>
          {company && (
            <span className="font-medium text-[#0F47F2] truncate leading-tight">
              {company}
            </span>
          )}
        </div>
      </div>

      {/* 2. Status Pill + Action Indicator */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium leading-none rounded-md border transition-colors ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {pillText}
        </span>

        {/* Action / Navigation Affordance */}
        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#F8FAFC] group-hover:bg-[#E7EDFF] transition-colors shrink-0">
          {isDone ? (
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="20" rx="4" fill="#059669" />
              <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#0F47F2] group-hover:translate-x-0.5 transition-all duration-200"
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

      {/* 3. Call Notes / Tags (If present) */}
      {(latestCallNote || (latestCallTags && latestCallTags.length > 0)) && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 text-[11px] text-[#475569] flex flex-col gap-1.5 mt-0.5">
          {latestCallTags && latestCallTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {latestCallTags.map(tag => (
                <span
                  key={tag}
                  className="bg-white border border-[#CBD5E1] px-1.5 py-0.5 rounded text-[10px] text-[#334155] font-medium"
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
