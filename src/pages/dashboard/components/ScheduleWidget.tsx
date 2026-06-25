import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Clock } from 'lucide-react';
import type { ScheduleEventAPI } from '../../../services/dashboardService';
import scheduleService from '../../../services/scheduleService';
import toast from "react-hot-toast";

const colorConfig: Record<string, { bg: string; border: string; dot: string; text: string; badgeBg: string; badgeText: string }> = {
  grey: {
    bg: 'rgba(243, 244, 246, 0.4)',
    border: 'rgba(209, 213, 219, 0.4)',
    dot: '#9CA3AF',
    text: '#4B5563',
    badgeBg: '#E5E7EB',
    badgeText: '#374151',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.04)',
    border: 'rgba(6, 182, 212, 0.15)',
    dot: '#06B6D4',
    text: '#0891B2',
    badgeBg: 'rgba(6, 182, 212, 0.08)',
    badgeText: '#0891B2',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.04)',
    border: 'rgba(139, 92, 246, 0.15)',
    dot: '#8B5CF6',
    text: '#7C3AED',
    badgeBg: 'rgba(139, 92, 246, 0.08)',
    badgeText: '#7C3AED',
  },
  orange: {
    bg: 'rgba(249, 115, 22, 0.04)',
    border: 'rgba(249, 115, 22, 0.15)',
    dot: '#F97316',
    text: '#EA580C',
    badgeBg: 'rgba(249, 115, 22, 0.08)',
    badgeText: '#EA580C',
  },
};

const STATUS_BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', label: 'Scheduled' },
  OVERDUE: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', label: 'Overdue' },
  COMPLETED: { bg: 'rgba(107, 114, 128, 0.1)', text: '#4B5563', label: 'Completed' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#DC2626', label: 'Cancelled' },
};

export type ScheduleFilterLabel = 'Today' | 'Tomorrow' | 'Upcoming' | 'Past';

interface ScheduleWidgetProps {
  events: ScheduleEventAPI[];
  isLoading?: boolean;
  onEventClick?: (event: ScheduleEventAPI, index: number) => void;
  activeFilter: ScheduleFilterLabel;
  onFilterChange: (filter: ScheduleFilterLabel) => void;
}

const FILTER_OPTIONS: ScheduleFilterLabel[] = ['Today', 'Tomorrow', 'Upcoming', 'Past'];

export default function ScheduleWidget({ events, isLoading, onEventClick, activeFilter, onFilterChange }: ScheduleWidgetProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-base font-semibold text-gray-900 leading-5">Schedule</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 leading-5 rounded-lg cursor-pointer bg-white transition-all hover:bg-gray-50 border border-gray-200 shadow-sm"
          >
            {activeFilter}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full mt-1.5 right-0 min-w-[120px] bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange(opt);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${opt === activeFilter
                    ? 'bg-[#E7EDFF] text-[#0F47F2] font-semibold'
                    : 'text-[#4B5563] hover:bg-[#F3F5F7]'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto max-h-[314px] hide-scrollbar px-5 pb-5">
        <div className="flex flex-col gap-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={`sched-skel-${i}`} className="w-full rounded-xl p-4 bg-gray-50/50 border border-gray-100 flex flex-col gap-3 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-3.5 rounded bg-gray-200" />
                  <div className="w-16 h-4 rounded bg-gray-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="w-12 h-3 rounded bg-gray-200" />
                  <div className="w-36 h-4.5 rounded bg-gray-200" />
                  <div className="w-48 h-3.5 rounded bg-gray-200" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="w-14 h-4 rounded bg-gray-200" />
                  <div className="flex gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-200" />
                    <div className="w-7 h-7 rounded-lg bg-gray-200" />
                  </div>
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#8E8E93]">
              No scheduled events
            </div>
          ) : (
            events.map((event, index) => {
              const ws = event.widget_summary;
              const config = colorConfig[ws.color_theme] || colorConfig.orange;

              const rawStatus = event.status || ws.status || 'SCHEDULED';
              const status = rawStatus.toUpperCase();
              const statusConfig = STATUS_BADGE_CONFIG[status] ||
                { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', label: rawStatus };

              const isActionable = ['SCHEDULED', 'OVERDUE'].includes(status);

              return (
                <div
                  key={event.id}
                  className={`w-full group ${!event.is_done ? 'cursor-pointer' : ''}`}
                  onClick={!event.is_done ? () => onEventClick?.(event, index) : undefined}
                >
                  {/* Event Card */}
                  <div
                    className="w-full rounded-xl p-4 relative shadow-sm border border-solid transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    style={{
                      backgroundColor: config.bg,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: config.border,
                      borderLeftWidth: '4px',
                      borderLeftColor: config.dot
                    }}
                  >
                    {/* Top Row: Time + Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="tabular-nums">{ws.time}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase"
                        style={{
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.text
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Title */}
                    {/* <p
                      className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: config.text }}
                    >
                      {ws.interview_type || event.stage?.name || '-'}
                    </p> */}

                    {/* Candidate Name */}
                    <h4 className="text-base font-bold text-gray-900 mb-0.5 tracking-tight leading-tight">
                      {event.candidate_name}
                    </h4>

                    {/* Subtitle */}
                    <p className="text-xs text-gray-500 font-medium mb-3.5 leading-normal">
                      {[event.candidate_company, event.candidate_position].filter(Boolean).join(' | ') || ws.details || '-'}
                    </p>

                    {/* Bottom Row: Mode + Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className='flex item-center gap-4'>

                      <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-white border border-gray-250 text-gray-600 rounded-md shadow-sm">
                        {event.mode || 'Virtual'}
                      </span>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1 px-2.5 py-0.5 bg-white border border-gray-250 text-gray-600 rounded-md shadow-sm bg-green-500/20 text-green-500 font-bold"
                        style={{ color: config.text }}
                      >
                        {ws.interview_type || event.stage?.name || '-'}
                      </p>
                      </div>


                      {/* Action Buttons - Green Check & Red Cross */}
                      {isActionable && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await scheduleService.updateEventStatus(event.id, 'COMPLETED');
                                toast.success("Completed");
                                window.location.reload();
                              } catch (err) {
                                toast.error("Failed");
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
                            title="Complete"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await scheduleService.updateEventStatus(event.id, 'CANCELLED');
                                toast.success("Cancelled");
                                window.location.reload();
                              } catch (err) {
                                toast.error("Failed");
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-[0_4px_12px_rgba(244,63,94,0.35)]"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
