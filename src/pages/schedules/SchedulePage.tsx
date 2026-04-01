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
import type { ScheduleEventAPI } from '../../services/dashboardService';
import type { ScheduleEvent } from './components/ScheduleWeekGrid';
import type { CalendarDayActivity } from './components/ScheduleCalendarWidget';

import { scheduleService, InterviewEvent } from '../../services/scheduleService';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekRange(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: toDateStr(start),
    end: toDateStr(end),
  };
}

function mapInterviewEvent(ev: InterviewEvent): ScheduleEvent {
  return {
    id: ev.id,
    title: ev.title || 'Interview',
    candidateName: ev.candidate_name,
    date: ev.start_at.split('T')[0] || '',
    startTime: ev.start_at.length > 15 ? ev.start_at.substring(11, 16) : '00:00',
    endTime: ev.end_at.length > 15 ? ev.end_at.substring(11, 16) : '00:00',
    mode: (ev.mode || 'virtual').toLowerCase() as any,
    company: ev.company?.name || '',
    position: ev.job_role?.name || ev.candidate_position || '',
    experience: ev.candidate_experience || '',
    status: (ev.status || 'scheduled').toLowerCase() as any,
  };
}

/* ─── Main Page ─── */

export default function SchedulePage() {
  // ── Date states ──
  const [currentDate, setCurrentDate] = useState(new Date()); // Week grid cursor
  const [selectedDate, setSelectedDate] = useState(new Date()); // Sidebar details date
  const [calendarHoverMonth, setCalendarHoverMonth] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  // ── Filters & Interactions ──
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedJobRole, setSelectedJobRole] = useState<string>('all');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState<{ events: ScheduleEventAPI[]; index: number } | null>(null);

  // ── API Data States ──
  const [gridEvents, setGridEvents] = useState<ScheduleEvent[]>([]);
  const [sidebarEvents, setSidebarEvents] = useState<ScheduleEvent[]>([]);
  const [calendarActivities, setCalendarActivities] = useState<CalendarDayActivity[]>([]);
  const [counts, setCounts] = useState({ all: 0, scheduled: 0, completed: 0, overdue: 0, cancelled: 0 });

  const [workspaces, setWorkspaces] = useState<MyWorkspace[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  // ── 1. Fetch workspaces and jobs ──
  useEffect(() => {
    organizationService.getMyWorkspacesData().then(data => setWorkspaces(data.workspaces || [])).catch(console.error);
    jobPostService.getJobs().then(jobs => setAllJobs(jobs)).catch(console.error);
  }, []);

  const companyOptions = useMemo(() => workspaces.map(ws => ({ id: String(ws.id), name: ws.name })), [workspaces]);
  const jobOptions = useMemo(() => {
    const filtered = selectedCompany !== 'all' ? allJobs.filter(j => j.workspace_details?.id === Number(selectedCompany)) : allJobs;
    return filtered.map(job => ({ id: String(job.id), name: job.title }));
  }, [allJobs, selectedCompany]);

  const handleCompanyChange = useCallback((val: string) => {
    setSelectedCompany(val);
    setSelectedJobRole('all');
  }, []);

  // ── 2. Fetch Center Grid Events (Week view) ──
  useEffect(() => {
    const loadWeekEvents = async () => {
      try {
        const { start, end } = getWeekRange(currentDate);
        const params: any = { start_date: start, end_date: end, page_size: 1000 };
        if (activeTab !== 'all') params.status = activeTab;
        if (selectedCompany !== 'all') params.company_id = Number(selectedCompany);
        if (selectedJobRole !== 'all') params.job_role_id = Number(selectedJobRole);

        const res = await scheduleService.getEvents(params);
        setGridEvents(res.results.map(mapInterviewEvent));
      } catch (err) {
        console.error('Failed to load week events:', err);
      }
    };
    loadWeekEvents();
  }, [currentDate, activeTab, selectedCompany, selectedJobRole]);

  // ── 3. Fetch Right Sidebar Events (Daily View) ──
  useEffect(() => {
    const loadSidebar = async () => {
      try {
        const cId = selectedCompany !== 'all' ? Number(selectedCompany) : undefined;
        const jId = selectedJobRole !== 'all' ? Number(selectedJobRole) : undefined;
        const res = await scheduleService.getDailyDetail(toDateStr(selectedDate), cId, jId);
        
        let allEvts = [...res.events, ...(res.tomorrow_events || [])].map(mapInterviewEvent);
        if (activeTab !== 'all') allEvts = allEvts.filter(e => e.status === activeTab);
        setSidebarEvents(allEvts);
      } catch (err) {
        console.error('Failed to load daily details:', err);
      }
    };
    loadSidebar();
  }, [selectedDate, activeTab, selectedCompany, selectedJobRole]);

  // ── 4. Fetch Left Calendar Summary (Month Heatmap) ──
  useEffect(() => {
    const loadCalendarEvents = async () => {
      try {
         const start = new Date(calendarHoverMonth.year, calendarHoverMonth.month - 1, 1);
         const end = new Date(calendarHoverMonth.year, calendarHoverMonth.month, 0);

         const cId = selectedCompany !== 'all' ? Number(selectedCompany) : undefined;
         const jId = selectedJobRole !== 'all' ? Number(selectedJobRole) : undefined;

         const res = await scheduleService.getCalendarSummary(toDateStr(start), toDateStr(end), cId, jId);
         const mapped: CalendarDayActivity[] = res.days.map(d => ({
           date: d.date,
           activityLevel: Math.min(d.total_events, 5) as any
         }));
         setCalendarActivities(mapped);
      } catch (err) {
        console.error('Failed to load calendar summary:', err);
      }
    };
    loadCalendarEvents();
  }, [calendarHoverMonth, selectedCompany, selectedJobRole]);

  // ── 5. Fetch Status Totals ──
  useEffect(() => {
    scheduleService.getStatusCounts()
      .then(stats => setCounts(stats))
      .catch(console.error);
  }, [currentDate, selectedCompany, selectedJobRole]); 

  // ── Navigation & Interactions ──
  const handleDateClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, []);

  const handleWeekChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleGridDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCellClick = useCallback((_date: string, _time: string) => {
    setIsEventFormOpen(true);
  }, []);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setCalendarHoverMonth({ month, year });
  }, []);

  const toModalEvent = (ev: ScheduleEvent): any => {
    return {
      id: ev.id,
      status: ev.status,
      is_done: ev.status === 'completed',
      widget_summary: {
        time: `${ev.startTime} – ${ev.endTime}`,
        type: ev.title || 'Interview',
        name: ev.candidateName,
        details: ev.position || '',
        location: ev.mode || 'virtual',
        color_theme: 'cyan'
      },
      modal_details: {
        id: ev.id,
        candidate_name: ev.candidateName,
        round_type: ev.title || 'Interview',
        date: ev.date,
        time_range: `${ev.startTime} – ${ev.endTime}`,
        timezone: 'IST',
        description: ev.title || 'Scheduled Interview',
        meeting_platform: ev.mode || 'Virtual',
        status_label: ev.status || 'scheduled',
        recruiter: { name: 'Recruiter', role: 'Team', avatar: '' },
        candidate_contact: { email: '', phone: '' },
        candidate_info: { company: ev.company || '', position: ev.position || '', experience: ev.experience || '' },
        interviewer_name: 'Interviewer',
        job_role: ev.position || ''
      }
    };
  };

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    const sameDayEvents = [...gridEvents, ...sidebarEvents].filter(e => e.date === event.date);
    const uniqueEvents = Array.from(new Map(sameDayEvents.map(item => [item.id, item])).values());
    const modalEvents = uniqueEvents.map(toModalEvent);
    const clickedIndex = uniqueEvents.findIndex((e: any) => e.id === event.id);
    setEventModalData({ events: modalEvents, index: Math.max(clickedIndex, 0) });
  }, [gridEvents, sidebarEvents]);

  const handleEventSubmit = useCallback((data: any) => {
    console.log('Event submitted:', data);
    setIsEventFormOpen(false);
  }, []);

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
            activities={calendarActivities}
            selectedDate={selectedDate}
            onMonthChange={handleMonthChange}
          />
          <InterviewModeLegend />
        </div>

        {/* Center: Week Grid */}
        <ScheduleWeekGrid
          events={gridEvents}
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
          events={sidebarEvents}
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
