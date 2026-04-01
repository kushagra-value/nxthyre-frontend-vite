import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── Types ─── */

export interface ScheduleEvent {
  id: string;
  title: string;
  candidateName: string;
  candidate_id?: string;
  job_role_id?: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24h
  endTime: string;
  mode: 'zoom' | 'virtual' | 'f2f' | 'overdue' | 'external' | 'bgv' | 'mock';
  virtual_url?: string;
  company?: string;
  position?: string;
  experience?: string;
  status?: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
  interviewCount?: number;
  interviewer_name?: string;
  interviewer_email?: string;
}

interface ScheduleWeekGridProps {
  events: ScheduleEvent[];
  currentDate: Date;
  selectedDate?: Date;
  onEventClick?: (event: ScheduleEvent) => void;
  onCellClick?: (date: string, time: string) => void;
  onDateSelect?: (date: Date) => void;
  onWeekChange?: (date: Date) => void;
}

/* ─── Constants ─── */

const TIME_SLOTS = [
  '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM',
];

const MODE_STYLES: Record<string, { bg: string; border: string; badge: string; badgeText: string; label: string }> = {
  zoom: { bg: '#E8F5E9', border: '#4CAF50', badge: '#4CAF50', badgeText: '#FFFFFF', label: 'ZOOM' },
  virtual: { bg: '#E8EAF6', border: '#7C4DFF', badge: '#7C4DFF', badgeText: '#FFFFFF', label: 'VIRTUAL' },
  f2f: { bg: '#FFF3E0', border: '#FF9800', badge: '#FF9800', badgeText: '#FFFFFF', label: 'F2F' },
  overdue: { bg: '#FFF3E0', border: '#FF5722', badge: '#FF5722', badgeText: '#FFFFFF', label: 'OVERDUE' },
  external: { bg: '#E3F2FD', border: '#2196F3', badge: '#2196F3', badgeText: '#FFFFFF', label: 'EXTERNAL' },
  bgv: { bg: '#FCE4EC', border: '#E91E63', badge: '#E91E63', badgeText: '#FFFFFF', label: 'BGV' },
  mock: { bg: '#F3E5F5', border: '#9C27B0', badge: '#9C27B0', badgeText: '#FFFFFF', label: 'MOCK' },
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ─── Helpers ─── */

function getWeekDates(date: Date): Date[] {
  const curr = new Date(date);
  const dayOfWeek = curr.getDay();
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ─── Component ─── */

export default function ScheduleWeekGrid({
  events,
  currentDate,
  selectedDate,
  onEventClick,
  onCellClick,
  onDateSelect,
  onWeekChange,
}: ScheduleWeekGridProps) {
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const today = new Date();
  const todayStr = toDateStr(today);
  const selectedStr = selectedDate ? toDateStr(selectedDate) : null;

  const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  /** Week label like "Mar 17 - Mar 23, 2026" */
  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth) {
      return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    if (sameYear) {
      return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} - ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDates]);

  /** Navigate weeks */
  const goToPrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    onWeekChange?.(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    onWeekChange?.(next);
  };

  const goToToday = () => {
    onWeekChange?.(new Date());
    onDateSelect?.(new Date());
  };

  /** Group events by dateStr */
  const eventsByDate = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  /** Get event position in pixels */
  const getEventPosition = (ev: ScheduleEvent) => {
    const [sh, sm] = ev.startTime.split(':').map(Number);
    const [eh, em] = ev.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const slotH = 64; // px per hour
    const top = ((startMin - 9 * 60) / 60) * slotH;
    const height = Math.max(((endMin - startMin) / 60) * slotH, 24);
    return { top, height };
  };

  /** Current time indicator position */
  const nowHour = today.getHours();
  const nowMin = today.getMinutes();
  const currentTimeTop = ((nowHour * 60 + nowMin - 9 * 60) / 60) * 64;

  /** Handle day header click */
  const handleDayHeaderClick = (date: Date) => {
    onDateSelect?.(date);
  };

  return (
    <div className="bg-gray-300 overflow-hidden flex-1 flex flex-col" style={{ minWidth: 0 }}>

      {/* ─── Week Navigation Bar ─── */}
      <div className="flex items-center justify-between bg-white px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4 text-[#4B5563]" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4 text-[#4B5563]" />
          </button>
          <span className="text-sm font-semibold text-[#1F2937] ml-1">
            {weekLabel}
          </span>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1 text-xs font-medium text-[#0F47F2] bg-[#E7EDFF] rounded-md hover:bg-blue-100 transition-colors cursor-pointer border-none"
        >
          Today
        </button>
      </div>

      {/* ─── Scrollable Grid ─── */}
      <div className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="relative" style={{ minWidth: '700px' }}>
          {/* ─── Day Headers ─── */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
            {/* Time col spacer */}
            <div className="w-16 flex-shrink-0" />
            {weekDates.map((d, i) => {
              const dateStr = toDateStr(d);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedStr;
              const dayEvents = eventsByDate[dateStr] || [];
              const evCount = dayEvents.length;

              return (
                <div
                  key={i}
                  className={`flex-1 py-2 px-1 border-l border-gray-100 text-center cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#E7EDFF]/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleDayHeaderClick(d)}
                >
                  <div className="text-[11px] text-[#8E8E93] font-medium tracking-wide">
                    {DAY_LABELS[i]}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      isToday
                        ? 'bg-[#0F47F2] text-white'
                        : isSelected
                        ? 'bg-[#0F47F2]/10 text-[#0F47F2] ring-2 ring-[#0F47F2]'
                        : 'text-[#1F2937]'
                    }`}
                  >
                    {d.getDate()}
                  </div>
                  {evCount > 0 && (
                    <div className={`text-[10px] mt-0.5 font-medium ${isToday ? 'text-[#0F47F2]' : 'text-[#10B981]'}`}>
                      {evCount} interview{evCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── Grid Body ─── */}
          <div className="relative flex">
            {/* Time column */}
            <div className="w-16 flex-shrink-0">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="h-16 px-2 flex items-start pt-1">
                  <span className="text-[11px] text-[#8E8E93] font-normal whitespace-nowrap">{time}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((d, dayIdx) => {
              const dateStr = toDateStr(d);
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedStr;

              return (
                <div
                  key={dayIdx}
                  className={`flex-1 relative border-l border-gray-100 ${isSelected ? 'bg-[#E7EDFF]/20' : ''}`}
                >
                  {/* Time slot rows */}
                  {TIME_SLOTS.map((_, slotIdx) => {
                    const hour = 9 + slotIdx;
                    const displayTime = `${String(hour).padStart(2, '0')}:00`;
                    return (
                      <div
                        key={slotIdx}
                        onClick={() => {
                          onDateSelect?.(d);
                          onCellClick?.(dateStr, displayTime);
                        }}
                        className="h-16 border-b border-dashed border-gray-200 cursor-pointer hover:bg-blue-50/30 transition-colors"
                      />
                    );
                  })}

                  {/* Current time line */}
                  {isToday && currentTimeTop >= 0 && currentTimeTop <= 640 && (
                    <div
                      className="absolute left-0 right-0 z-10"
                      style={{ top: `${currentTimeTop}px` }}
                    >
                      <div className="relative flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#0F47F2] -ml-1" />
                        <div className="flex-1 h-[1.5px] bg-[#0F47F2]" />
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents.map((ev) => {
                    const { top, height } = getEventPosition(ev);
                    const style = MODE_STYLES[ev.mode] || MODE_STYLES.zoom;

                    return (
                      <div
                        key={ev.id}
                        className="absolute left-1 right-1 rounded-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-md"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: style.bg,
                          borderLeft: `3px solid ${style.border}`,
                          zIndex: 5,
                        }}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                      >
                        <div className="p-1.5 h-full flex flex-col justify-between overflow-hidden">
                          <div className="flex items-start gap-1">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: style.badge, color: style.badgeText }}
                            >
                              {style.label}
                            </span>
                          </div>
                          <div className="mt-0.5 overflow-hidden">
                            <p className="text-[11px] font-semibold text-[#1F2937] truncate leading-tight">
                              {ev.candidateName}
                            </p>
                            {ev.company && height > 40 && (
                              <p className="text-[9px] text-[#6B7280] truncate mt-0.5">
                                {ev.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
