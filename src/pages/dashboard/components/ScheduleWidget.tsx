import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ScheduleEventAPI } from '../../../services/dashboardService';
import { Check, X } from "lucide-react";
import scheduleService from '../../../services/scheduleService';
import toast from "react-hot-toast";

const colorConfig: Record<string, { bg: string; dot: string; nameColor: string; badgeBg: string; badgeText: string }> = {
  grey: {
    bg: 'rgba(75, 85, 99, 0.28)',
    dot: '#4B5563',
    nameColor: '#4B5563',
    badgeBg: '#0088FF',
    badgeText: '#FFFFFF',
  },
  cyan: {
    bg: 'rgba(0, 200, 179, 0.4)',
    dot: '#00C8B3',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.55)',
    badgeText: '#000000',
  },
  purple: {
    bg: 'rgba(97, 85, 245, 0.4)',
    dot: '#6155F5',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#000000',
  },
  orange: {
    bg: 'rgba(255, 141, 40, 0.4)',
    dot: '#FF8D28',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.55)',
    badgeText: '#000000',
  },
};

const STATUS_BADGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: '#10B981', text: '#FFF', label: 'Scheduled' },
  OVERDUE: { bg: '#F59E0B', text: '#FFF', label: 'Overdue' },
  COMPLETED: { bg: '#6B7280', text: '#FFF', label: 'Completed' },
  CANCELLED: { bg: '#EF4444', text: '#FFF', label: 'Cancelled' },
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
    <div className="bg-white rounded-[10px] flex flex-col overflow-hidden" >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-sm font-normal text-black leading-[17px]">Schedule</span>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 px-3 py-1 text-sm font-normal text-[#4B5563] leading-[17px] rounded-md cursor-pointer bg-white transition-colors hover:bg-gray-50"
            style={{ border: '0.5px solid #D1D1D6' }}
          >
            {activeFilter}
            <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full mt-1 right-0 min-w-[120px] bg-white border border-[#D1D1D6] rounded-[10px] shadow-lg z-10 py-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange(opt);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors ${opt === activeFilter
                    ? 'bg-[#E7EDFF] text-[#0F47F2] font-medium'
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

      <div className="overflow-y-auto max-h-[314px] hide-scrollbar px-5 pb-5">
        <div className="relative flex flex-col gap-2.5">
          <div
            className="absolute left-[72px] top-0 bottom-0 w-0"
            style={{ borderLeft: '1px dashed #D1D1D6' }}
          />

          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={`sched-skel-${i}`} className="flex items-center gap-2 relative animate-pulse">
                <div className="w-[60px] h-4 rounded bg-gray-200 shrink-0" />
                <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0 relative z-10" />
                <div className="flex-1 rounded-md p-2.5 bg-gray-100 flex flex-col gap-2">
                  <div className="w-16 h-3 rounded bg-gray-200" />
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 rounded bg-gray-200" />
                    <div className="w-12 h-4 rounded bg-gray-200" />
                  </div>
                  <div className="w-32 h-3 rounded bg-gray-200" />
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
              const config = colorConfig[ws.color_theme] || colorConfig.cyan;

              // UPDATED: More robust status detection
              const status = (event.status || ws.status || 'SCHEDULED').toUpperCase();
              const statusConfig = STATUS_BADGE_CONFIG[status] ||
                { bg: '#6B7280', text: '#FFF', label: status };

              const isActionable = ['SCHEDULED', 'OVERDUE'].includes(status);

              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-2 relative ${!event.is_done ? 'cursor-pointer' : ''}`}
                  onClick={!event.is_done ? () => onEventClick?.(event, index) : undefined}
                >
                  <span className="w-[60px] shrink-0 text-sm font-normal text-[#4B5563] leading-5">
                    {ws.time}
                  </span>

                  <div
                    className="w-2 h-2 rounded-full shrink-0 relative z-10"
                    style={{ backgroundColor: config.dot }}
                  />

                  <div
                    className="flex-1 rounded-md p-3 relative"   // Increased padding
                    style={{ backgroundColor: config.bg }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-normal text-[#4B5563] leading-3">
                        {ws.type}
                      </span>

                      {/* Status Badge */}
                      <span
                        className="text-[10px] font-bold px-3 py-1 rounded-full tracking-wide"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.text }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span
                        className="text-sm font-medium leading-[17px]"
                        style={{ color: config.nameColor }}
                      >
                        {ws.name}
                      </span>
                      <span
                        className="px-2 py-1 text-[10px] font-normal leading-3 rounded-[5px]"
                        style={{
                          backgroundColor: config.badgeBg,
                          color: config.badgeText,
                        }}
                      >
                        {ws.location}
                      </span>
                    </div>

                    <span className="text-[10px] font-normal text-[#4B5563] leading-3 block mt-2">
                      {ws.details}
                    </span>

                    {/* Action Buttons - Only for Scheduled & Overdue */}
                    {isActionable && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-white/60">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await scheduleService.updateEventStatus(event.id, 'COMPLETED');
                              toast.success("Marked as Completed");
                              window.location.reload();
                            } catch (err) {
                              toast.error("Failed to update");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          <Check className="w-4 h-4" />
                          Completed
                        </button>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await scheduleService.updateEventStatus(event.id, 'CANCELLED');
                              toast.success("Marked as Cancelled");
                              window.location.reload();
                            } catch (err) {
                              toast.error("Failed to update");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
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
