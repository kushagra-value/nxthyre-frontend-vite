import type { ScheduleEvent } from './ScheduleWeekGrid';
import scheduleService from '../../../services/scheduleService';
import toast from "react-hot-toast";
import { Check, X } from 'lucide-react';

interface TodaysSidebarProps {
  selectedDate: Date;
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
  activeFilter?: string;
}

const MODE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  zoom: { bg: '#4CAF50', text: '#FFF', label: 'Zoom' },
  virtual: { bg: '#7C4DFF', text: '#FFF', label: 'Virtual' },
  f2f: { bg: '#FF9800', text: '#FFF', label: 'F2F' },
  EXTERNAL: { bg: '#2196F3', text: '#FFF', label: 'External' },
  F2F: { bg: '#FF5722', text: '#FFF', label: 'F2F' },
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: '#10B981', text: '#FFF', label: 'Scheduled' },
  COMPLETED: { bg: '#6B7280', text: '#FFF', label: 'Completed' },
  CANCELLED: { bg: '#EF4444', text: '#FFF', label: 'Cancelled' },
  OVERDUE: { bg: '#F59E0B', text: '#FFF', label: 'Overdue' },
  // Add more as needed
};

function formatTo12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDateHeader(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRelativeLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today's interview schedule";
  if (diffDays === 1) return "Tomorrow's interview schedule";
  if (diffDays === -1) return "Yesterday's interview schedule";
  if (diffDays > 1) return `${diffDays} days from now`;
  return `${Math.abs(diffDays)} days ago`;
}

function getRelativeDayLabel(selectedDate: Date, offset: number): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  target.setDate(target.getDate() + offset);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return '';
}

export default function TodaysSidebar({ selectedDate, events, onEventClick, activeFilter }: TodaysSidebarProps) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const isFilteringStatus = activeFilter && activeFilter !== 'all';

  // Selected date + next day
  const selectedStr = toDateStr(selectedDate);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = toDateStr(nextDay);

  // Events for the selected date and next day (only if not filtering by status)
  const selectedDateEvents = isFilteringStatus ? events : events.filter(e => e.date === selectedStr);
  const nextDayEvents = isFilteringStatus ? [] : events.filter(e => e.date === nextDayStr);

  // Dynamic stats based on selected date's events
  const selectedDayStats = {
    total: selectedDateEvents.length,
    upcoming: selectedDateEvents.filter(e => e.status === 'scheduled').length,
    overdue: selectedDateEvents.filter(e => e.status === 'overdue').length,
  };

  const nextDayRelLabel = getRelativeDayLabel(selectedDate, 1);

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col gap-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 170px)' }}>
      {/* ─── Date Header ─── */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#1F2937]">
          {isFilteringStatus ? `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Interviews` : formatDateHeader(selectedDate)}
        </h3>
        <p className="text-[11px] text-[#8E8E93] mt-0.5">
          {isFilteringStatus ? 'All matching events' : getRelativeLabel(selectedDate)}
        </p>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#1F2937]">{selectedDayStats.total}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Total</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#0F47F2]">{selectedDayStats.upcoming}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Upcoming</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#EF4444]">{selectedDayStats.overdue}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Overdue</div>
        </div>
      </div>

      {/* ─── Selected Date Events ─── */}
      <div className="bg-white flex-1 overflow-y-auto">
        {selectedDateEvents.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            {selectedDateEvents.map((ev) => (
              <ScheduleCard key={ev.id} event={ev} onClick={() => onEventClick?.(ev)} />
            ))}
          </div>
        )}

        {/* Next Day Section */}
        {nextDayEvents.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-1">
              <div className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                {nextDayRelLabel ? `${nextDayRelLabel} — ` : ''}{days[nextDay.getDay()]} {months[nextDay.getMonth()]} {nextDay.getDate()}
              </div>
            </div>
            <div className="px-3 pb-3">
              {nextDayEvents.map((ev) => (
                <ScheduleCard key={ev.id} event={ev} onClick={() => onEventClick?.(ev)} />
              ))}
            </div>
          </>
        )}

        {selectedDateEvents.length === 0 && nextDayEvents.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F3F5F7] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm text-[#8E8E93]">No interviews scheduled</p>
            <p className="text-xs text-[#AEAEB2] mt-1">Select a date to view its schedule</p>
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── Schedule Card ─── */

/* ─── Schedule Card ─── */

/* ─── Schedule Card ─── */

function ScheduleCard({ event, onClick }: { event: ScheduleEvent; onClick?: () => void }) {
  const modeBadge = MODE_BADGE[event.mode] || { bg: '#9CA3AF', text: '#FFF', label: event.mode || 'N/A' };
  
  const rawStatus = event.status || 'SCHEDULED';
  const status = rawStatus.toUpperCase();
  const statusBadge = STATUS_BADGE[status] || { bg: '#6B7280', text: '#FFF', label: rawStatus };

  const isActionable = ['SCHEDULED', 'OVERDUE'].includes(status);

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-3 mb-2 cursor-pointer hover:shadow-sm transition-all hover:border-gray-200"
      onClick={onClick}
    >
      {/* Top row: Title + Status + Mode */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
          {event.title || 'Technical Round'}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-3 py-1 rounded-full tracking-wide"
            style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
          >
            {statusBadge.label}
          </span>

          <span
            className="text-[9px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: modeBadge.bg, color: modeBadge.text }}
          >
            {modeBadge.label}
          </span>
        </div>
      </div>

      {/* Candidate Name */}
      <h4 className="text-sm font-semibold text-[#1F2937] mb-1 line-clamp-1">{event.candidateName}</h4>

      {/* Time & Date */}
      <div className="flex items-center gap-1.5 mb-3 text-[11px]">
        <p className="font-medium text-[#0F47F2]">{event.date}</p>
        <span className="text-gray-300">•</span>
        <p className="text-[#6B7280]">
          {formatTo12h(event.startTime)} – {formatTo12h(event.endTime)}
        </p>
      </div>

      {/* Company / Role */}
      {event.company && (
        <p className="text-[10px] text-[#8E8E93] truncate mb-3">
          {event.company}{event.position ? ` · ${event.position}` : ''}{event.experience ? ` · ${event.experience}` : ''}
        </p>
      )}

      {/* Action Buttons - Only for Scheduled & Overdue */}
      {isActionable && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
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
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all active:scale-95"
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
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      )}

      {/* Reschedule Button */}
      <button
        className="w-full mt-3 text-[#0F47F2] hover:bg-[#F0F7FF] text-xs font-medium py-2 border border-[#E5E7EB] rounded-lg transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        Reschedule
      </button>
    </div>
  );
}
