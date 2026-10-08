import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { dashboardService } from '../../../services/dashboardService';

export interface CalendarDayActivity {
  date: string; // "YYYY-MM-DD"
  activityLevel: 0 | 1 | 2 | 3 | 4 | 5;
  totalEvents?: number;
  breakdown?: {
    interviews: number;
    calls: number;
    follow_ups: number;
    shortlisted: number;
    hired: number;
  };
}

export interface CalendarWidgetProps {
  onDateClick?: (date: Date, isTodayOrFuture: boolean) => void;
  activities?: CalendarDayActivity[];
  onMonthChange?: (month: number, year: number) => void;
  isLoading?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const CATEGORY_COLORS = {
  calls: { dot: 'bg-[#0F47F2]', label: 'Calls', text: 'text-[#0F47F2]' },
  follow_ups: { dot: 'bg-[#2563EB]', label: 'Follow-ups', text: 'text-[#2563EB]' },
  shortlisted: { dot: 'bg-[#3B82F6]', label: 'Shortlisted', text: 'text-[#3B82F6]' },
  hired: { dot: 'bg-[#1D4ED8]', label: 'Hired', text: 'text-[#1D4ED8]' },
  interviews: { dot: 'bg-[#60A5FA]', label: 'Interviews', text: 'text-[#60A5FA]' },
};

/**
 * Bubble Dimensions (1 = small dot, 5 = large overlapping cluster circle)
 */
const BUBBLE_SIZES: Record<number, string> = {
  1: 'w-5 h-5',       // 20px
  2: 'w-7.5 h-7.5',   // 30px
  3: 'w-10 h-10',     // 40px
  4: 'w-12 h-12',     // 48px
  5: 'w-14 h-14',     // 56px (overlaps adjacent date cells gracefully)
};

/**
 * Helper to compute soft translucent bubble gradient/style based on breakdown mix & level
 */
const getBubbleStyle = (level: number, _breakdown?: CalendarDayActivity['breakdown'], isPast?: boolean) => {
  if (isPast) {
    switch (level) {
      case 1: return 'bg-[#0F47F2]/15 border border-[#0F47F2]/25';
      case 2: return 'bg-[#0F47F2]/25 border border-[#0F47F2]/35';
      case 3: return 'bg-[#0F47F2]/35 border border-[#0F47F2]/45';
      case 4: return 'bg-[#0F47F2]/45 border border-[#0F47F2]/55 shadow-xs';
      case 5: return 'bg-gradient-to-br from-[#0F47F2]/45 via-[#2563EB]/55 to-[#3B82F6]/55 border border-[#0F47F2]/60 shadow-sm';
      default: return '';
    }
  }

  // Nxthyre Blue Theme for Activity Bubbles
  switch (level) {
    case 1: return 'bg-[#0F47F2]/20 border border-[#0F47F2]/30';
    case 2: return 'bg-[#0F47F2]/35 border border-[#0F47F2]/45';
    case 3: return 'bg-[#0F47F2]/50 border border-[#0F47F2]/60';
    case 4: return 'bg-[#0F47F2]/65 border border-[#0F47F2]/75 shadow-xs';
    case 5: return 'bg-[#0F47F2]/85 border border-[#0F47F2] shadow-sm';
    default: return '';
  }
};

export default function CalendarWidget({ onDateClick, activities = [], onMonthChange, isLoading }: CalendarWidgetProps) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowMonthYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalizeDateStr = (rawDate: string) => {
    if (!rawDate) return '';
    const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return cleanDate;
  };

  const activityMap = new Map<string, CalendarDayActivity>();
  activities.forEach((a) => {
    if (a.date) {
      activityMap.set(normalizeDateStr(a.date), a);
    }
  });

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverDetails, setHoverDetails] = useState<Record<string, {
    breakdown: {
      interviews: number;
      calls: number;
      follow_ups: number;
      shortlisted: number;
      hired: number;
    };
    totalEvents: number;
    loading?: boolean;
  }>>({});

  const handleMouseEnterDate = (dateStr: string, dateObj: Date) => {
    setHoveredDate(dateStr);

    if (hoverDetails[dateStr]) return;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isPast = dateObj < todayStart;

    setHoverDetails((prev) => ({
      ...prev,
      [dateStr]: {
        breakdown: { interviews: 0, calls: 0, follow_ups: 0, shortlisted: 0, hired: 0 },
        totalEvents: 0,
        loading: true,
      },
    }));

    if (isPast) {
      dashboardService
        .getDailyActivities(dateStr)
        .then((data) => {
          const summary = data?.summary || {};
          const calls = summary.calls_made ?? 0;
          const followUps = summary.follow_ups ?? 0;
          const shortlisted = summary.shortlisted ?? 0;
          const hired = summary.hired ?? 0;
          const total = data?.total_activities ?? (calls + followUps + shortlisted + hired);

          setHoverDetails((prev) => ({
            ...prev,
            [dateStr]: {
              breakdown: { interviews: 0, calls, follow_ups: followUps, shortlisted, hired },
              totalEvents: total,
              loading: false,
            },
          }));
        })
        .catch(() => {
          setHoverDetails((prev) => ({
            ...prev,
            [dateStr]: {
              breakdown: { interviews: 0, calls: 0, follow_ups: 0, shortlisted: 0, hired: 0 },
              totalEvents: 0,
              loading: false,
            },
          }));
        });
    } else {
      dashboardService
        .getAgenda(dateStr)
        .then((data) => {
          const items = data?.items || [];
          const alerts = data?.alerts || [];
          const total = items.length + alerts.length;
          const interviews = items.filter((i: any) => i.type?.toLowerCase().includes('interview')).length;
          const calls = items.filter((i: any) => i.type?.toLowerCase().includes('call')).length;
          const followUps = items.filter((i: any) => i.type?.toLowerCase().includes('follow')).length;
          const shortlisted = items.filter((i: any) => i.type?.toLowerCase().includes('shortlist')).length;
          const hired = items.filter((i: any) => i.type?.toLowerCase().includes('hire')).length;

          setHoverDetails((prev) => ({
            ...prev,
            [dateStr]: {
              breakdown: { interviews, calls, follow_ups: followUps, shortlisted, hired },
              totalEvents: total,
              loading: false,
            },
          }));
        })
        .catch(() => {
          setHoverDetails((prev) => ({
            ...prev,
            [dateStr]: {
              breakdown: { interviews: 0, calls: 0, follow_ups: 0, shortlisted: 0, hired: 0 },
              totalEvents: 0,
              loading: false,
            },
          }));
        });
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = (() => {
    const d = new Date(currentYear, currentMonth, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday = 0
  })();

  const totalGridCells = (firstDayOfWeek + daysInMonth) > 35 ? 42 : 35;
  const leadingDaysCount = totalGridCells - (firstDayOfWeek + daysInMonth);

  const prevMonth = () => {
    let newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    let newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth + 1, newYear);
  };

  const nextMonth = () => {
    let newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    let newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth + 1, newYear);
  };

  const handleDateSelect = (day: number) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isTodayOrFuture = dateObj >= todayStart;
    onDateClick?.(dateObj, isTodayOrFuture);
  };

  const yearStart = now.getFullYear() - 2;
  const yearEnd = now.getFullYear() + 3;
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);

  return (
    <div className={`bg-white rounded-[16px] p-4 relative border border-[#E2E8F0] shadow-2xs flex-1 flex flex-col justify-between h-full min-h-0 overflow-hidden ${isLoading ? 'pointer-events-none' : ''}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center rounded-[16px] backdrop-blur-[1px]">
          <div className="w-6 h-6 border-2 border-[#0F47F2] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] leading-[17px] cursor-pointer bg-transparent border-none outline-none hover:text-[#0F47F2] transition-colors"
          >
            {MONTHS[currentMonth]}, {currentYear}
            <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-200 ${showMonthYearPicker ? 'rotate-180' : ''}`} />
          </button>

          {showMonthYearPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-[14px] shadow-xl z-40 p-3 min-w-[260px]">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentYear((y) => y - 1)} className="p-1 hover:bg-slate-100 rounded-md text-[#64748B]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="text-sm font-semibold text-[#1E293B] bg-transparent border-none outline-none cursor-pointer text-center"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => setCurrentYear((y) => y + 1)} className="p-1 hover:bg-slate-100 rounded-md text-[#64748B]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMonth(idx);
                      setShowMonthYearPicker(false);
                      onMonthChange?.(idx + 1, currentYear);
                    }}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${idx === currentMonth ? 'bg-[#0F47F2] text-white font-semibold' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="Previous Month">
            <ChevronLeft className="w-4 h-4 text-[#64748B] cursor-pointer" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="Next Month">
            <ChevronRight className="w-4 h-4 text-[#64748B] cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Calendar Grid with Organic Translucent Bubbles */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 relative">
        {/* Day-of-week headers */}
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-[11px] font-semibold text-[#94A3B8] text-center tracking-wider mb-2 uppercase"
          >
            {day}
          </div>
        ))}

        {/* Previous month's trailing dates */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => {
          const day = prevMonthDays - firstDayOfWeek + i + 1;
          return (
            <div
              key={`prev-${day}`}
              className="relative flex items-center justify-center h-11 w-full cursor-pointer group select-none opacity-40 hover:opacity-75 transition-opacity"
              onClick={prevMonth}
              title="Previous Month"
            >
              <span className="text-[13px] font-medium text-[#94A3B8]">
                {day}
              </span>
            </div>
          );
        })}

        {/* Date cells with Organic Translucent Overlapping Activity Bubbles */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayActivity = activityMap.get(dateStr);

          const dateObj = new Date(currentYear, currentMonth, day);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPast = dateObj < todayStart;

          const cached = hoverDetails[dateStr];
          const hasCachedBreakdown = cached && !cached.loading;

          const breakdown = hasCachedBreakdown
            ? cached.breakdown
            : {
              interviews: dayActivity?.breakdown?.interviews || 0,
              calls: (dayActivity?.breakdown as any)?.calls_made ?? dayActivity?.breakdown?.calls ?? 0,
              follow_ups: dayActivity?.breakdown?.follow_ups || 0,
              shortlisted: dayActivity?.breakdown?.shortlisted || 0,
              hired: dayActivity?.breakdown?.hired || 0,
            };

          const totalEvents = hasCachedBreakdown
            ? cached.totalEvents
            : (dayActivity?.totalEvents ??
              (breakdown.interviews + breakdown.calls + breakdown.follow_ups + breakdown.shortlisted + breakdown.hired));

          const callsCount = breakdown.calls;
          let activityLevel: 0 | 1 | 2 | 3 | 4 | 5 = 0;
          if (callsCount > 0) {
            if (callsCount <= 2) activityLevel = 1;
            else if (callsCount <= 4) activityLevel = 2;
            else if (callsCount <= 6) activityLevel = 3;
            else if (callsCount <= 9) activityLevel = 4;
            else activityLevel = 5;
          }

          const hasActivity = activityLevel > 0;
          const bubbleSizeClass = BUBBLE_SIZES[activityLevel] || '';
          const bubbleStyleClass = getBubbleStyle(activityLevel, breakdown, isPast);

          const isHovered = hoveredDate === dateStr;
          const showTooltip = isHovered;

          // Tooltip position math
          const dayColIndex = (firstDayOfWeek + day - 1) % 7;
          const tooltipHorizClass = dayColIndex >= 4
            ? "right-0 translate-x-0"
            : (dayColIndex <= 1 ? "left-0 translate-x-0" : "left-1/2 -translate-x-1/2");
          const arrowHorizClass = dayColIndex >= 4
            ? "right-4"
            : (dayColIndex <= 1 ? "left-4" : "left-1/2 -translate-x-1/2");
          const isTopHalf = Math.floor((firstDayOfWeek + day - 1) / 7) <= 1;
          const tooltipVertClass = isTopHalf ? "top-full mt-2" : "bottom-full mb-2";
          const arrowVertClass = isTopHalf
            ? "-top-1.5 border-l border-t border-[#E2E8F0]"
            : "-bottom-1.5 border-r border-b border-[#E2E8F0]";

          return (
            <div
              key={day}
              className="relative flex items-center justify-center h-11 w-full cursor-pointer group select-none"
              onClick={() => handleDateSelect(day)}
              onMouseEnter={() => handleMouseEnterDate(dateStr, dateObj)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Soft Translucent Activity Bubble Layer */}
              {hasActivity && !isSelected && (
                <div
                  className={`absolute rounded-full transition-all duration-300 pointer-events-none group-hover:scale-110 group-hover:z-20 ${bubbleSizeClass} ${bubbleStyleClass}`}
                />
              )}

              {/* Clean Date Number */}
              {isSelected ? (
                <div className="relative z-20 w-7 h-7 rounded-full bg-[#0F47F2] text-white flex items-center justify-center text-xs font-semibold shadow-md ring-2 ring-[#0F47F2] ring-offset-2 transition-transform duration-200 group-hover:scale-110">
                  {day}
                </div>
              ) : isToday ? (
                <div className="relative z-20 w-7 h-7 rounded-full ring-2 ring-[#0F47F2] ring-offset-1 bg-white text-[#0F47F2] flex items-center justify-center text-xs font-bold">
                  {day}
                </div>
              ) : (
                <span
                  className={`relative z-10 text-[13px] font-medium tracking-tight transition-colors duration-200 group-hover:text-[#0F47F2] group-hover:font-semibold ${hasActivity
                      ? 'text-[#1E293B] font-semibold'
                      : (isPast ? 'text-[#94A3B8]' : 'text-[#475569]')
                    }`}
                >
                  {day}
                </span>
              )}

              {/* Hover Breakdown Tooltip */}
              {showTooltip && (
                <div className={`absolute z-50 pointer-events-none ${tooltipVertClass} ${tooltipHorizClass}`}>
                  <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0px_8px_30px_rgba(0,0,0,0.12)] p-3.5 min-w-[180px] flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Activity Breakdown
                      </span>
                      <span className="text-[10px] font-semibold text-[#94A3B8]">
                        {MONTHS[currentMonth].slice(0, 3)} {day}
                      </span>
                    </div>

                    {cached?.loading ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-4 h-4 text-[#0F47F2] animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS.calls.dot}`} />
                            <span className="text-xs text-[#475569]">Calls Made</span>
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A]">{breakdown.calls}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS.follow_ups.dot}`} />
                            <span className="text-xs text-[#475569]">Follow-ups</span>
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A]">{breakdown.follow_ups}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS.shortlisted.dot}`} />
                            <span className="text-xs text-[#475569]">Shortlisted</span>
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A]">{breakdown.shortlisted}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS.hired.dot}`} />
                            <span className="text-xs text-[#475569]">Hired</span>
                          </div>
                          <span className="text-xs font-semibold text-[#0F172A]">{breakdown.hired}</span>
                        </div>
                        {breakdown.interviews > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS.interviews.dot}`} />
                              <span className="text-xs text-[#475569]">Interviews</span>
                            </div>
                            <span className="text-xs font-semibold text-[#0F172A]">{breakdown.interviews}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4 border-t border-[#F1F5F9] pt-2 mt-0.5">
                          <span className="text-xs font-semibold text-[#0F172A]">Total Events</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#0F47F2]/10 text-[#0F47F2]">
                            {totalEvents}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className={`w-2.5 h-2.5 bg-white rotate-45 absolute ${arrowVertClass} ${arrowHorizClass}`} />
                </div>
              )}
            </div>
          );
        })}

        {/* Next month's leading dates */}
        {Array.from({ length: leadingDaysCount }).map((_, i) => {
          const day = i + 1;
          return (
            <div
              key={`next-${day}`}
              className="relative flex items-center justify-center h-11 w-full cursor-pointer group select-none opacity-40 hover:opacity-75 transition-opacity"
              onClick={nextMonth}
              title="Next Month"
            >
              <span className="text-[13px] font-medium text-[#94A3B8]">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

