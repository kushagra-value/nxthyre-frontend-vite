import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ScheduleCalendarWidget from './components/ScheduleCalendarWidget';
import InterviewModeLegend from './components/InterviewModeLegend';
import StatusTabs, { FilterDropdowns } from './components/StatusTabs';
import ScheduleWeekGrid from './components/ScheduleWeekGrid';
import TodaysSidebar from './components/TodaysSidebar';
import { EventForm } from './components/EventForm';
import ScheduleEventModal from '../dashboard/components/ScheduleEventModal';
import type { ScheduleEventData } from '../dashboard/dashboardData';
import type { ScheduleEvent } from './components/ScheduleWeekGrid';
import type { CalendarDayActivity } from './components/ScheduleCalendarWidget';

/* ─── Mock Data ─── */

const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: 'se-1',
    title: '1st Round Interview',
    candidateName: 'Max Verstappen',
    date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    startTime: '11:30',
    endTime: '12:30',
    mode: 'zoom',
    company: 'Deloitte',
    position: 'Full Stack Developer',
    experience: '4 yrs',
    status: 'scheduled',
  },
  {
    id: 'se-2',
    title: 'Technical Round',
    candidateName: 'Brad Pitt',
    date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    startTime: '12:30',
    endTime: '13:30',
    mode: 'virtual',
    company: 'HGS',
    position: 'Software Developer',
    experience: '6 yrs',
    status: 'scheduled',
  },
  {
    id: 'se-3',
    title: 'Technical Round',
    candidateName: 'Robert Pattinson',
    date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
    startTime: '14:30',
    endTime: '15:30',
    mode: 'f2f',
    company: 'Jupiter',
    position: 'Marketing Manager',
    experience: '2 yrs',
    status: 'scheduled',
  },
  {
    id: 'se-4',
    title: 'Screening Call',
    candidateName: 'Ananya Nair',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '09:00',
    endTime: '09:45',
    mode: 'zoom',
    company: 'Ola',
    position: 'UX Designer',
    experience: '5 yrs',
    status: 'scheduled',
  },
  {
    id: 'se-5',
    title: 'Screening Call',
    candidateName: 'Priya Sharma',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '10:00',
    endTime: '10:30',
    mode: 'zoom',
    company: 'Deloitte',
    status: 'completed',
  },
  {
    id: 'se-6',
    title: 'F2F Round',
    candidateName: 'Kavya Menon',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '11:30',
    endTime: '12:00',
    mode: 'f2f',
    company: 'RocketGrowth Bio',
    status: 'completed',
  },
  {
    id: 'se-7',
    title: 'Virtual Interview',
    candidateName: 'Rahul Verma',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '13:00',
    endTime: '13:45',
    mode: 'virtual',
    company: 'RocketGrowth Bio',
    status: 'scheduled',
  },
  {
    id: 'se-8',
    title: 'Screening',
    candidateName: 'Sneha Mehta',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '10:00',
    endTime: '10:45',
    mode: 'overdue',
    company: 'Deloitte',
    status: 'overdue',
  },
  {
    id: 'se-9',
    title: 'Zoom Call',
    candidateName: 'Ananya Nair',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '09:00',
    endTime: '09:45',
    mode: 'zoom',
    company: 'Ola',
    status: 'scheduled',
  },
  {
    id: 'se-10',
    title: 'Zoom Call',
    candidateName: 'Max Verstappen',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '12:00',
    endTime: '12:45',
    mode: 'zoom',
    company: 'Deloitte',
    status: 'scheduled',
  },
  {
    id: 'se-11',
    title: 'F2F Interview',
    candidateName: 'Vikram Rao',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '14:30',
    endTime: '15:00',
    mode: 'f2f',
    company: 'Jupiter',
    status: 'scheduled',
  },
  {
    id: 'se-12',
    title: 'Overdue Follow-up',
    candidateName: 'Aryan Das',
    date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: '14:00',
    endTime: '14:30',
    mode: 'overdue',
    company: 'McLaren',
    status: 'overdue',
  },
];

/* ─── Build calendar heatmap ─── */
function buildActivityMap(events: ScheduleEvent[]): CalendarDayActivity[] {
  const countMap: Record<string, number> = {};
  events.forEach((ev) => {
    countMap[ev.date] = (countMap[ev.date] || 0) + 1;
  });
  return Object.entries(countMap).map(([date, count]) => ({
    date,
    activityLevel: Math.min(count, 5) as 0 | 1 | 2 | 3 | 4 | 5,
  }));
}

/* ─── Main Page ─── */

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date()); // controls which week is shown in center
  const [selectedDate, setSelectedDate] = useState(new Date()); // controls the right sidebar
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedJobRole, setSelectedJobRole] = useState('all');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [events] = useState<ScheduleEvent[]>(MOCK_EVENTS);
  const [eventModalData, setEventModalData] = useState<{ events: ScheduleEventData[]; index: number } | null>(null);

  const activities = buildActivityMap(events);

  /** Left calendar date click — update both week view AND selected date */
  const handleDateClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, []);

  /** Week navigation arrows in center grid */
  const handleWeekChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  /** Day header click in center grid — updates right sidebar */
  const handleGridDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCellClick = useCallback((_date: string, _time: string) => {
    setIsEventFormOpen(true);
  }, []);

  /** Convert ScheduleEvent to ScheduleEventData for the modal */
  const toModalEvent = (ev: ScheduleEvent): ScheduleEventData => {
    const MODE_LABELS: Record<string, string> = {
      zoom: 'Zoom', virtual: 'Microsoft Teams', f2f: 'Face to Face',
      overdue: 'Overdue', external: 'External Platform', bgv: 'BGV', mock: 'Mock Call',
    };
    const formatTime = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };
    const dateObj = new Date(ev.date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id: ev.id,
      title: ev.title || 'Interview',
      candidateName: ev.candidateName,
      interviewType: ev.title || 'Technical Round',
      date: dateStr,
      timeRange: `${formatTime(ev.startTime)} – ${formatTime(ev.endTime)}`,
      timezone: 'IST',
      description: `${ev.title || 'Interview'} with ${ev.candidateName}`,
      meetingPlatform: MODE_LABELS[ev.mode] || 'Virtual',
      statusLabel: ev.status || 'scheduled',
      recruiterName: 'You',
      recruiterRole: ev.position || 'Recruiter',
      recruiterAvatar: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateCompany: ev.company,
      candidatePosition: ev.position,
      candidateExperience: ev.experience,
      interviewer: 'You',
      jobRole: ev.position,
    };
  };

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    // Find all events on the same day for pagination in modal
    const sameDayEvents = events.filter((e) => e.date === event.date);
    const modalEvents = sameDayEvents.map(toModalEvent);
    const clickedIndex = sameDayEvents.findIndex((e) => e.id === event.id);
    setEventModalData({ events: modalEvents, index: Math.max(clickedIndex, 0) });
  }, [events]);

  const handleEventSubmit = useCallback((data: any) => {
    console.log('Event submitted:', data);
    setIsEventFormOpen(false);
  }, []);

  /* ─── Filter events by status tab ─── */
  const filteredEvents = events.filter((ev) => {
    if (activeTab === 'all') return true;
    return ev.status === activeTab;
  });

  const counts = {
    all: events.length,
    scheduled: events.filter((e) => e.status === 'scheduled').length,
    completed: events.filter((e) => e.status === 'completed').length,
    overdue: events.filter((e) => e.status === 'overdue').length,
    cancelled: events.filter((e) => e.status === 'cancelled').length,
  };

  return (
    <div className="flex-1 overflow-hidden bg-[#F3F5F7] flex flex-col">
      {/* ─── Top Bar: Title + Tabs + Filters + CTA ─── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-semibold text-[#1F2937]" style={{ fontFamily: "'Gellix', sans-serif" }}>
              Schedule Interviews
            </h1>
            <p className="text-xs text-[#8E8E93] mt-0.5">Schedule</p>
          </div>
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        </div>

        <div className="flex items-center gap-3">
          <FilterDropdowns
            selectedCompany={selectedCompany}
            selectedJobRole={selectedJobRole}
            onCompanyChange={setSelectedCompany}
            onJobRoleChange={setSelectedJobRole}
          />
          <button
            onClick={() => setIsEventFormOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F47F2] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex overflow-hidden px-4 py-4 gap-4">
        {/* Left Panel: Calendar + Legend */}
        <div className="flex-shrink-0 flex flex-col gap-3" style={{ width: 220 }}>
          <ScheduleCalendarWidget
            onDateClick={handleDateClick}
            activities={activities}
            selectedDate={selectedDate}
          />
          <InterviewModeLegend />
        </div>

        {/* Center: Week Grid */}
        <ScheduleWeekGrid
          events={filteredEvents}
          currentDate={currentDate}
          selectedDate={selectedDate}
          onEventClick={handleEventClick}
          onCellClick={handleCellClick}
          onDateSelect={handleGridDateSelect}
          onWeekChange={handleWeekChange}
        />

        {/* Right Panel: Selected Date Schedule */}
        <TodaysSidebar
          selectedDate={selectedDate}
          events={events}
          onEventClick={handleEventClick}
        />
      </div>

      {/* ─── Event Form Slide-over ─── */}
      {isEventFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsEventFormOpen(false)} />
          <div className="relative z-10">
            <EventForm
              isOpen={isEventFormOpen}
              onClose={() => setIsEventFormOpen(false)}
              onSubmit={handleEventSubmit}
            />
          </div>
        </div>
      )}

      {/* ─── Event Detail Modal ─── */}
      {eventModalData && (
        <ScheduleEventModal
          isOpen={true}
          events={eventModalData.events}
          initialIndex={eventModalData.index}
          onClose={() => setEventModalData(null)}
        />
      )}
    </div>
  );
}
