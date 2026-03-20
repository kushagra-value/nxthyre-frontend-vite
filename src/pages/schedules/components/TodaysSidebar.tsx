import type { ScheduleEvent } from './ScheduleWeekGrid';

interface TodaysSidebarProps {
  selectedDate: Date;
  events: ScheduleEvent[];
  stats: {
    today: number;
    upcoming: number;
    overdue: number;
  };
  onEventClick?: (event: ScheduleEvent) => void;
}

const MODE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  zoom: { bg: '#4CAF50', text: '#FFF', label: 'Zoom' },
  virtual: { bg: '#7C4DFF', text: '#FFF', label: 'Virtual' },
  f2f: { bg: '#FF9800', text: '#FFF', label: 'F2F' },
  overdue: { bg: '#FF5722', text: '#FFF', label: 'Overdue' },
  external: { bg: '#2196F3', text: '#FFF', label: 'External' },
  bgv: { bg: '#E91E63', text: '#FFF', label: 'BGV' },
  mock: { bg: '#9C27B0', text: '#FFF', label: 'Mock' },
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

function getRelativeLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today's interview schedule";
  if (diff === 1) return "Tomorrow's interview schedule";
  if (diff === -1) return "Yesterday's interview schedule";
  return "Interview schedule";
}

export default function TodaysSidebar({ selectedDate, events, stats, onEventClick }: TodaysSidebarProps) {
  // Group by relative day (yesterday, today, tomorrow)
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const tomorrowStr = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

  const todayEvents = events.filter(e => e.date === todayStr);
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col gap-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 170px)' }}>
      {/* ─── Date Header ─── */}
      <div className="bg-white rounded-t-xl px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-[#1F2937]">{formatDateHeader(selectedDate)}</h3>
        <p className="text-[11px] text-[#8E8E93] mt-0.5">{getRelativeLabel(selectedDate)}</p>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#1F2937]">{stats.today}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Today</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#0F47F2]">{stats.upcoming}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Upcoming</div>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-[#EF4444]">{stats.overdue}</div>
          <div className="text-[10px] text-[#8E8E93] uppercase tracking-wide mt-0.5">Overdue</div>
        </div>
      </div>

      {/* ─── Today's Events ─── */}
      <div className="bg-white flex-1 overflow-y-auto">
        {todayEvents.length > 0 && (
          <div className="px-3 pt-3 pb-1">
            {todayEvents.map((ev) => (
              <ScheduleCard key={ev.id} event={ev} onClick={() => onEventClick?.(ev)} />
            ))}
          </div>
        )}

        {/* Tomorrow Section */}
        {tomorrowEvents.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-1">
              <div className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Tomorrow — {now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {months[tomorrowDate.getMonth()]} {tomorrowDate.getDate()}
              </div>
            </div>
            <div className="px-3 pb-3">
              {tomorrowEvents.map((ev) => (
                <ScheduleCard key={ev.id} event={ev} onClick={() => onEventClick?.(ev)} />
              ))}
            </div>
          </>
        )}

        {todayEvents.length === 0 && tomorrowEvents.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[#8E8E93]">No interviews scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}


/* ─── Schedule Card ─── */

function ScheduleCard({ event, onClick }: { event: ScheduleEvent; onClick?: () => void }) {
  const badge = MODE_BADGE[event.mode] || MODE_BADGE.zoom;

  return (
    <div
      className="bg-white border border-gray-100 rounded-xl p-3 mb-2 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      {/* Top row: Round type + mode badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
          {event.title || 'Technical Round'}
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {badge.label}
        </span>
      </div>

      {/* Candidate Name */}
      <h4 className="text-sm font-semibold text-[#1F2937] mb-1">{event.candidateName}</h4>

      {/* Time range */}
      <p className="text-[11px] text-[#6B7280] mb-0.5">
        {formatTo12h(event.startTime)} – {formatTo12h(event.endTime)}
      </p>

      {/* Company / Role */}
      {event.company && (
        <p className="text-[10px] text-[#8E8E93] truncate">
          {event.company}{event.position ? ` · ${event.position}` : ''}{event.experience ? ` · ${event.experience}` : ''}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        {event.mode === 'zoom' && (
          <button className="flex items-center gap-1 px-2.5 py-1 bg-[#0F47F2] text-white text-[10px] font-semibold rounded-md hover:bg-blue-700 transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Join Now
          </button>
        )}
        {event.mode === 'virtual' && (
          <button className="flex items-center gap-1 px-2.5 py-1 bg-[#7C4DFF] text-white text-[10px] font-semibold rounded-md hover:bg-purple-700 transition-colors">
            Join Teams
          </button>
        )}
        {event.mode === 'f2f' && (
          <button
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors"
            style={{ backgroundColor: '#FF9800', color: '#FFFFFF' }}
          >
            Room A
          </button>
        )}
        <button className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-[10px] font-semibold text-[#6B7280] rounded-md hover:bg-gray-50 transition-colors">
          Reschedule
        </button>
      </div>
    </div>
  );
}
