import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

/**
 * Activity level controls the blue intensity on each date bubble.
 * 0 = no activity (plain text), 1–5 = increasing intensity.
 */
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
  /** Called when a date is clicked. Receives the selected Date and whether it is today or in the future. */
  onDateClick?: (date: Date, isTodayOrFuture: boolean) => void;
  /** Optional activity data for each day. If not provided, all days appear as plain. */
  activities?: CalendarDayActivity[];
  /** Called when the displayed month changes — use this to fetch new calendar-activity data. */
  onMonthChange?: (month: number, year: number) => void;
  /** Whether activity data is currently loading */
  isLoading?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

/** Bubble colour by activity level (1 = lightest, 5 = darkest) */
const ACTIVITY_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#BBCCFF', text: '#000000' },
  2: { bg: '#88A5FF', text: '#000000' },
  3: { bg: '#5982FD', text: '#FFFFFF' },
  4: { bg: '#0F47F2', text: '#FFFFFF' },
  5: { bg: '#0034D2', text: '#FFFFFF' },
};

/** Grey shades for past dates that had activity */
const PAST_ACTIVITY_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#E5E7EB', text: '#6B7280' },
  2: { bg: '#D1D5DB', text: '#4B5563' },
  3: { bg: '#9CA3AF', text: '#FFFFFF' },
  4: { bg: '#6B7280', text: '#FFFFFF' },
  5: { bg: '#4B5563', text: '#FFFFFF' },
};

export default function CalendarWidget({ onDateClick, activities = [], onMonthChange, isLoading }: CalendarWidgetProps) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowMonthYearPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build activity lookup
  const activityMap = new Map<string, CalendarDayActivity>();
  activities.forEach((a) => activityMap.set(a.date, a));

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (() => {
    const d = new Date(currentYear, currentMonth, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday = 0
  })();

  const prevMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    if (currentMonth === 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    } else {
      newMonth = currentMonth - 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    onMonthChange?.(newMonth + 1, newYear);
  };

  const nextMonth = () => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    if (currentMonth === 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    } else {
      newMonth = currentMonth + 1;
    }
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

  // Year range for dropdown
  const yearStart = now.getFullYear() - 2;
  const yearEnd = now.getFullYear() + 3;
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);

  return (
    <div className={`bg-white rounded-[10px] p-5 relative ${isLoading ? 'pointer-events-none' : ''}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-[10px]">
          <div className="w-6 h-6 border-2 border-[#0F47F2] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
            className="flex items-center gap-1.5 text-sm font-normal text-black leading-[17px] cursor-pointer bg-transparent border-none outline-none"
          >
            {MONTHS[currentMonth]}, {currentYear}
            <ChevronDown className={`w-5 h-5 opacity-60 transition-transform ${showMonthYearPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Month/Year picker dropdown */}
          {showMonthYearPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#D1D1D6] rounded-[12px] shadow-lg z-20 p-3 min-w-[260px]">
              {/* Year selector */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCurrentYear((y) => y - 1)}
                  className="p-1 hover:bg-slate-100 rounded text-[#8E8E93]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="text-sm font-medium text-[#4B5563] bg-transparent border-none outline-none cursor-pointer text-center"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <button
                  onClick={() => setCurrentYear((y) => y + 1)}
                  className="p-1 hover:bg-slate-100 rounded text-[#8E8E93]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, idx) => {
                  const isCurrentMonth = idx === currentMonth;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setCurrentMonth(idx);
                        setShowMonthYearPicker(false);
                        onMonthChange?.(idx + 1, currentYear);
                      }}
                      className={`px-2 py-2 rounded-lg text-xs font-normal transition-colors ${isCurrentMonth
                        ? 'bg-[#0F47F2] text-white'
                        : 'text-[#4B5563] hover:bg-[#F3F5F7]'
                        }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-0.5 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-5 h-5 text-[#8E8E93] cursor-pointer" />
          </button>
          <button onClick={nextMonth} className="p-0.5 hover:bg-slate-100 rounded">
            <ChevronRight className="w-5 h-5 text-[#8E8E93] cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-5">
        {/* Day-of-week headers */}
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-xs font-normal text-[#8E8E93] leading-[14px] text-center"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Date cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayActivity = activityMap.get(dateStr);
          const activityLevel = dayActivity?.activityLevel || 0;

          const dateObj = new Date(currentYear, currentMonth, day);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPast = dateObj < todayStart;

          // Determine rendering
          const hasActivity = activityLevel > 0;
          let bgColor: string | undefined;
          let textColor = '#4B5563';

          if (hasActivity) {
            if (isPast) {
              const colors = PAST_ACTIVITY_COLORS[activityLevel] || PAST_ACTIVITY_COLORS[1];
              bgColor = colors.bg;
              textColor = colors.text;
            } else {
              const colors = ACTIVITY_COLORS[activityLevel] || ACTIVITY_COLORS[1];
              bgColor = colors.bg;
              textColor = colors.text;
            }
          }

          const todayRing = isToday ? 'ring-2 ring-[#0F47F2] ring-offset-1' : '';
          const selectedStyle = isSelected && !hasActivity ? 'bg-[#0F47F2] !text-white' : '';

          const isHovered = hoveredDate === dateStr;
          const showTooltip = isHovered && dayActivity && dayActivity.breakdown;

          return (
            <div
              key={day}
              className="flex items-center justify-center cursor-pointer relative"
              onClick={() => handleDateSelect(day)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {hasActivity || isSelected ? (
                <span
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-normal leading-[14px] transition-all ${todayRing} ${isSelected && hasActivity ? 'ring-2 ring-[#0F47F2] ring-offset-1' : ''}`}
                  style={{
                    backgroundColor: isSelected && !hasActivity ? '#0F47F2' : bgColor,
                    color: isSelected && !hasActivity ? '#FFFFFF' : textColor,
                  }}
                >
                  {String(day).padStart(2, '0')}
                </span>
              ) : (
                <span
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-normal leading-[14px] transition-all hover:bg-slate-100 ${todayRing} ${selectedStyle}`}
                  style={{ color: isSelected ? '#FFFFFF' : (isPast ? '#AEAEB2' : '#4B5563') }}
                >
                  {String(day).padStart(2, '0')}
                </span>
              )}

              {/* Hover Breakdown Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-9999 pointer-events-none">
                  <div className="bg-white border border-[#D1D1D6] rounded-xl shadow-[0px_4px_24px_rgba(0,0,0,0.12)] p-3 min-w-[170px] flex flex-col gap-2">
                    <div className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                      Activity Breakdown
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#4B5563]">Interviews</span>
                      <span className="text-xs font-medium text-black">{dayActivity.breakdown?.interviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#4B5563]">Calls Made</span>
                      <span className="text-xs font-medium text-black">{dayActivity.breakdown?.calls || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#4B5563]">Follow Ups</span>
                      <span className="text-xs font-medium text-black">{dayActivity.breakdown?.follow_ups || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-[#4B5563]">Shortlisted</span>
                      <span className="text-xs font-medium text-black">{dayActivity.breakdown?.shortlisted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-[#F3F5F7] pt-2 mt-1">
                      <span className="text-xs font-semibold text-black">Total Events</span>
                      <span className="text-xs font-bold text-[#0F47F2]">{dayActivity.totalEvents || 0}</span>
                    </div>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#D1D1D6] rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
