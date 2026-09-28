import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface CalendarDayActivity {
  date: string;
  activityLevel: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface ScheduleCalendarWidgetProps {
  onDateClick?: (date: Date, isTodayOrFuture: boolean) => void;
  activities?: CalendarDayActivity[];
  selectedDate?: Date;
  onMonthChange?: (month: number, year: number) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const BUBBLE_SIZES: Record<number, string> = {
  1: 'w-4.5 h-4.5',   // 18px
  2: 'w-6.5 h-6.5',   // 26px
  3: 'w-8.5 h-8.5',   // 34px
  4: 'w-10.5 h-10.5', // 42px
  5: 'w-12 h-12',     // 48px
};

const getBubbleStyle = (level: number, isPast?: boolean) => {
  if (isPast) {
    switch (level) {
      case 1: return 'bg-[#3B82F6]/15 border border-[#3B82F6]/25';
      case 2: return 'bg-[#3B82F6]/25 border border-[#3B82F6]/35';
      case 3: return 'bg-[#3B82F6]/35 border border-[#3B82F6]/45';
      case 4: return 'bg-[#3B82F6]/45 border border-[#3B82F6]/55 shadow-xs';
      case 5: return 'bg-gradient-to-br from-[#06B6D4]/45 via-[#3B82F6]/55 to-[#6366F1]/55 border border-[#3B82F6]/60 shadow-sm';
      default: return '';
    }
  }

  switch (level) {
    case 1: return 'bg-[#3B82F6]/20 border border-[#3B82F6]/30';
    case 2: return 'bg-[#3B82F6]/30 border border-[#3B82F6]/40';
    case 3: return 'bg-[#3B82F6]/40 border border-[#3B82F6]/50';
    case 4: return 'bg-gradient-to-br from-[#06B6D4]/45 to-[#3B82F6]/50 border border-[#3B82F6]/50 shadow-xs';
    case 5: return 'bg-gradient-to-br from-[#06B6D4]/55 via-[#3B82F6]/55 to-[#6366F1]/60 border border-[#6366F1]/60 shadow-sm';
    default: return '';
  }
};

export default function ScheduleCalendarWidget({ onDateClick, activities = [], selectedDate, onMonthChange }: ScheduleCalendarWidgetProps) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [currentMonth, setCurrentMonth] = useState(selectedDate ? selectedDate.getMonth() : now.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate ? selectedDate.getFullYear() : now.getFullYear());
  const [selected, setSelected] = useState<string | null>(
    selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : null
  );
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

  useEffect(() => {
    onMonthChange?.(currentMonth + 1, currentYear);
  }, [currentMonth, currentYear, onMonthChange]);

  const activityMap = new Map<string, number>();
  activities.forEach((a) => activityMap.set(a.date, a.activityLevel));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (() => {
    const d = new Date(currentYear, currentMonth, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDateSelect = (day: number) => {
    const dateObj = new Date(currentYear, currentMonth, day);
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelected(dateStr);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isTodayOrFuture = dateObj >= todayStart;
    onDateClick?.(dateObj, isTodayOrFuture);
  };

  const yearStart = now.getFullYear() - 2;
  const yearEnd = now.getFullYear() + 3;
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
            className="flex items-center gap-1 text-sm font-semibold text-[#0F172A] leading-[17px] cursor-pointer bg-transparent border-none outline-none hover:text-[#0F47F2] transition-colors"
          >
            {MONTHS[currentMonth]} {currentYear}
            <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${showMonthYearPicker ? 'rotate-180' : ''}`} />
          </button>

          {showMonthYearPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#E2E8F0] rounded-[12px] shadow-lg z-20 p-3 min-w-[240px]">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrentYear(y => y - 1)} className="p-1 hover:bg-slate-100 rounded text-[#64748B]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="text-sm font-semibold text-[#1E293B] bg-transparent border-none outline-none cursor-pointer text-center"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => setCurrentYear(y => y + 1)} className="p-1 hover:bg-slate-100 rounded text-[#64748B]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => { setCurrentMonth(idx); setShowMonthYearPicker(false); }}
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
          <button onClick={prevMonth} className="p-0.5 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-4 h-4 text-[#64748B] cursor-pointer" />
          </button>
          <button onClick={nextMonth} className="p-0.5 hover:bg-slate-100 rounded">
            <ChevronRight className="w-4 h-4 text-[#64748B] cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1">
        {DAYS_SHORT.map((day, i) => (
          <div key={`${day}-${i}`} className="text-[11px] font-semibold text-[#94A3B8] leading-[14px] text-center uppercase">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;
          const activity = activityMap.get(dateStr) || 0;
          const dateObj = new Date(currentYear, currentMonth, day);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPast = dateObj < todayStart;
          const hasActivity = activity > 0;

          const bubbleSizeClass = BUBBLE_SIZES[activity] || '';
          const bubbleStyleClass = getBubbleStyle(activity, isPast);

          return (
            <div
              key={day}
              className="relative flex items-center justify-center h-9 w-full cursor-pointer group select-none"
              onClick={() => handleDateSelect(day)}
            >
              {hasActivity && !isSelected && (
                <div
                  className={`absolute rounded-full transition-all duration-300 pointer-events-none group-hover:scale-110 ${bubbleSizeClass} ${bubbleStyleClass}`}
                />
              )}

              {isSelected ? (
                <div className="relative z-20 w-6.5 h-6.5 rounded-full bg-[#0F47F2] text-white flex items-center justify-center text-[11px] font-semibold shadow-xs ring-2 ring-[#0F47F2] ring-offset-1">
                  {day}
                </div>
              ) : isToday ? (
                <span className="relative z-10 text-[11px] font-bold text-[#0F47F2] ring-2 ring-[#0F47F2] ring-offset-1 w-5.5 h-5.5 rounded-full flex items-center justify-center bg-white">
                  {day}
                </span>
              ) : (
                <span
                  className={`relative z-10 text-[12px] font-medium tracking-tight transition-colors group-hover:text-[#0F47F2] group-hover:font-semibold ${hasActivity
                      ? 'text-[#1E293B] font-semibold'
                      : (isPast ? 'text-[#94A3B8]' : 'text-[#475569]')
                    }`}
                >
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


