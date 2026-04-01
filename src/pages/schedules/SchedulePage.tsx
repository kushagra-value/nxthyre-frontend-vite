import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import ScheduleCalendarWidget from './components/ScheduleCalendarWidget';
import InterviewModeLegend from './components/InterviewModeLegend';
import StatusTabs, { FilterDropdowns } from './components/StatusTabs';
import ScheduleWeekGrid from './components/ScheduleWeekGrid';
import TodaysSidebar from './components/TodaysSidebar';
import { EventForm } from './components/EventForm';
import ScheduleEventModal from '../dashboard/components/ScheduleEventModal';
import { organizationService, MyWorkspace } from '../../services/organizationService';
import { jobPostService, Job } from '../../services/jobPostService';
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

  // ── API data for company/job filters ──
  const [workspaces, setWorkspaces] = useState<MyWorkspace[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  // ── Fetch workspaces (companies) ──
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await organizationService.getMyWorkspacesData();
        setWorkspaces(data.workspaces || []);
      } catch (error) {
        console.error('Failed to fetch workspaces', error);
      }
    };
    fetchWorkspaces();
  }, []);

  // ── Fetch jobs ──
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await jobPostService.getJobs();
        setAllJobs(jobs);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      }
    };
    fetchJobs();
  }, []);

  // ── Build company options for FilterDropdowns ──
  const companyOptions = useMemo(() =>
    workspaces.map((ws) => ({ id: String(ws.id), name: ws.name })),
    [workspaces]
  );

  // ── Filter jobs based on selected company, build job options ──
  const jobOptions = useMemo(() => {
    const filtered = selectedCompany !== 'all'
      ? allJobs.filter((j) => j.workspace_details?.id === Number(selectedCompany))
      : allJobs;
    return filtered.map((job) => ({ id: String(job.id), name: job.title }));
  }, [allJobs, selectedCompany]);

  // ── Reset job role when company changes ──
  const handleCompanyChange = useCallback((val: string) => {
    setSelectedCompany(val);
    setSelectedJobRole('all');
  }, []);

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

  /** Convert ScheduleEvent to ScheduleEventAPI for the modal */
  const toModalEvent = (ev: ScheduleEvent): any => {
    return {
      id: ev.id,
      status: ev.status,
      is_done: ev.status === 'completed',
      widget_summary: {
        time: `${ev.startTime} – ${ev.endTime}`,
        type: ev.title || 'Technical Round',
        name: ev.candidateName,
        details: ev.position || '',
        location: ev.mode || 'virtual',
        color_theme: 'cyan'
      },
      modal_details: {
        id: ev.id,
        candidate_name: ev.candidateName,
        round_type: ev.title || 'Technical Round',
        date: ev.date,
        time_range: `${ev.startTime} – ${ev.endTime}`,
        timezone: 'IST',
        description: ev.title || 'Interview',
        meeting_platform: ev.mode || 'Virtual',
        status_label: ev.status || 'scheduled',
        recruiter: {
          name: 'You',
          role: 'Recruiter',
          avatar: ''
        },
        candidate_contact: {
          email: '',
          phone: ''
        },
        candidate_info: {
          company: ev.company || '',
          position: ev.position || '',
          experience: ev.experience || ''
        },
        interviewer_name: 'You',
        job_role: ev.position || ''
      }
    };
  };

  const handleEventClick = useCallback((event: ScheduleEvent) => {
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
      <div className="flex items-center justify-between px-6 py-4 bg-white border-y border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        </div>

        <div className="flex items-center gap-3">
          <FilterDropdowns
            selectedCompany={selectedCompany}
            selectedJobRole={selectedJobRole}
            onCompanyChange={handleCompanyChange}
            onJobRoleChange={setSelectedJobRole}
            companies={companyOptions}
            jobRoles={jobOptions}
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
      <div className="flex-1 flex overflow-hidden pb-4">
        {/* Left Panel: Calendar + Legend */}
        <div className="flex-shrink-0 flex flex-col gap-3  border-r border-gray-200" style={{ width: 220 }}>
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

      {/* ─── Schedule Interview Modal ─── */}
      <EventForm
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSubmit={handleEventSubmit}
        initialCompanyId={selectedCompany !== 'all' ? selectedCompany : undefined}
        initialJobId={selectedJobRole !== 'all' ? selectedJobRole : undefined}
      />

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
