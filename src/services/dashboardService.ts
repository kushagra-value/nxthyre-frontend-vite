// src/services/dashboardService.ts
import apiClient from "./api";

// ──────────────────────────────────────────────
//  Dashboard API Types
// ──────────────────────────────────────────────

export interface DashboardStatCard {
  id: string;
  icon_type: string;
  label: string;
  value: number;
  unit?: string;
  trend: string;
  trend_text: string;
  trend_color: "green" | "rose";
}

export interface DashboardPriorityCard {
  id: string;
  candidate_id: string;
  name: string;
  role: string;
  company?: string;
  days_ago: number;
  status: string;
  status_color: string;
  status_variant: "urgent" | "default";
}

export interface DashboardPriorityColumn {
  id: string;
  title: string;
  count: number;
  urgent_count: number;
  cards: DashboardPriorityCard[];
}

export interface DashboardTalentMatch {
  id: string;
  name: string;
  title: string;
  company: string;
  position: string;
  experience: string;
  match_percentage: number;
  source: string;
  candidate_id: string;
  new_tag: boolean;
}

export interface DashboardScheduleItem {
  // InterviewEvent logic - shape may vary
  [key: string]: any;
}

export interface DashboardActivityItem {
  icon: string;
  text: string;
  time: string;
}

export interface DashboardActivityGroup {
  label: string;
  items: DashboardActivityItem[];
}

export interface DashboardData {
  dashboard: {
    current_date: string;
    current_time: string;
    timezone: string;
    stat_cards: DashboardStatCard[];
    priority_actions: {
      columns: DashboardPriorityColumn[];
    };
    new_talent_matches: {
      filter_options: string[];
      selected_filter: string;
      matches: DashboardTalentMatch[];
    };
    schedule: {
      selected_date: string;
      items: DashboardScheduleItem[];
    };
    recent_activities: DashboardActivityGroup[];
  };
  modals: Record<string, any>;
  _meta: {
    last_updated: string;
  };
}

// ──────────────────────────────────────────────
//  Priority Actions API Types
// ──────────────────────────────────────────────

export interface PriorityActionItem {
  candidate_id: string;
  application_id: number;
  candidate_full_name: string;
  role: string;
  job_role: string;
  job_role_id: number;
  workspace_name: string;
  workspace_id: number;
  tags: string[];
  days_in_current_stage: number;
  current_stage_name: string;
  action_taken: string | null;
  latest_call_note?: string | null;
  latest_call_status?: string | null;
  archive_stage_id?: number;
  next_stage_id?: number;
  current_stage_id?: number;
}

export interface PriorityActionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PriorityActionItem[];
}

export type PriorityTab = 'sourcing' | 'screening' | 'interview';
export type DateRangePreset = 'today' | 'last_week' | 'last_month' | 'custom';

export interface PriorityActionsParams {
  tab: PriorityTab;
  workspace_id?: number;
  date_range?: DateRangePreset;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  history?: boolean;
  page?: number;
  page_size?: number;
}

export interface CompletePriorityActionPayload {
  application_id: number;
  tab: PriorityTab;
  action_taken: string;
}

// ──────────────────────────────────────────────
//  Talent Matches API Types
// ──────────────────────────────────────────────

export interface TalentMatchesParams {
  job_id?: number;
  date_range?: string;
  start_date?: string;
  end_date?: string;
  source_type?: string;
  page?: number;
  page_size?: number;
}

// ──────────────────────────────────────────────
//  Sidebar API Types
// ──────────────────────────────────────────────

export interface SidebarImmediateAction {
  id: string;
  company_id: string;
  company_name: string;
  company_logo_url: string | null;
  priority_level: "high" | "medium";
  priority_badge?: string;
  issue_summary: string;
  suggested_action: string;
  suggested_time: string;
  action_button_label: string;
  action_button_variant: "primary" | "secondary";
  timestamp_relative: string;
  has_star: boolean;
}

export interface SidebarActivityItem {
  id: string;
  time: string;
  company_name: string;
  message: string;
  activity_type: "job_created" | "hire";
  icon: string;
  color: string;
}

export interface SidebarActivityGroup {
  date_label: string;
  date_sub_label: string | null;
  items: SidebarActivityItem[];
}

export interface SidebarData {
  right_sidebar: {
    immediate_actions: {
      total_pending: number;
      highlighted_pending: number;
      items: SidebarImmediateAction[];
      ui: {
        show_hide_activities: boolean;
        hide_activities_label: string;
      };
    };
    recent_activities: {
      selected_view: string;
      view_options: string[];
      groups: SidebarActivityGroup[];
      pagination: {
        has_more: boolean;
        next_cursor: string | null;
      };
    };
  };
  _meta: {
    last_updated: string;
    total_immediate_actions: number;
    unread_activities_count: number;
  };
}

export interface ActivityItem {
  icon: string;
  text: string;
  time: string;
}
export interface ActivitySection {
  label: string;
  items: ActivityItem[];
}

// ──────────────────────────────────────────────
//  Calendar Activity API Types
// ──────────────────────────────────────────────

export interface CalendarDayActivityBreakdown {
  interviews: number;
  calls: number;
  follow_ups: number;
  shortlisted: number;
  hired: number;
}

export interface CalendarDayActivityAPI {
  date: string;
  activity_level: number;
  total_events: number;
  breakdown: CalendarDayActivityBreakdown;
}

export interface CalendarActivityResponse {
  month: number;
  year: number;
  days: CalendarDayActivityAPI[];
}

// ──────────────────────────────────────────────
//  Agenda API Types (today/future dates)
// ──────────────────────────────────────────────

export interface AgendaLiveStatus {
  interviewer_name: string;
  interviewer_avatar: string | null;
  candidate_name: string;
  round_type: string;
  elapsed: string;
}

export interface AgendaAlert {
  id: string;
  type: 'soon' | 'completed';
  label: string;
  candidate_name: string;
  action_url: string;
}

export interface AgendaItemAPI {
  id: string;
  candidate_name: string;
  candidate_id?: string;
  job_role_id?: number;
  candidate_role: string;
  time: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  meeting_link: string | null;
}

export interface AgendaResponse {
  date: string;
  live_status: AgendaLiveStatus | null;
  alerts: AgendaAlert[];
  items: AgendaItemAPI[];
}

// ──────────────────────────────────────────────
//  Daily Activities API Types (past dates)
// ──────────────────────────────────────────────

export interface DailyActivitySummary {
  calls_made: number;
  follow_ups: number;
  shortlisted: number;
  hired: number;
}

export interface DailyActivityItemAPI {
  id: string;
  title: string;
  time: string;
  type: string;
  category_color: string;
  category_bg: string;
  pill_text: string;
  pill_color: string;
  pill_bg: string;
}

export interface DailyActivitiesResponse {
  date: string;
  date_label: string;
  total_activities: number;
  summary: DailyActivitySummary;
  activities: DailyActivityItemAPI[];
}

// ──────────────────────────────────────────────
//  Schedule Widget & Event Modal API Types
// ──────────────────────────────────────────────

export interface ScheduleWidgetSummary {
  time: string;
  type: string;
  name: string;
  details: string;
  location: string;
  color_theme: 'grey' | 'cyan' | 'purple' | 'orange';
}

export interface ScheduleModalRecruiter {
  name: string;
  role: string;
  avatar: string;
}

export interface ScheduleModalCandidateContact {
  email: string;
  phone: string;
}

export interface ScheduleModalCandidateInfo {
  company: string;
  position: string;
  experience: string;
}

export interface ScheduleModalInterviewerInfo {
  interviewer_name: string;
  job_role: string;
}

export interface ScheduleModalDetails {
  title: string;
  candidate_name: string;
  candidate_id?: string;
  job_id?: number;
  interview_type: string;
  date: string;
  time_range: string;
  timezone: string;
  description: string;
  meeting_platform: string;
  meeting_url?: string;
  status_label: string;
  duration: string;
  recruiter: ScheduleModalRecruiter;
  candidate_contact: ScheduleModalCandidateContact;
  candidate_info: ScheduleModalCandidateInfo;
  interviewer_info: ScheduleModalInterviewerInfo;
}

export interface ScheduleEventAPI {
  id: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  is_done: boolean;
  widget_summary: ScheduleWidgetSummary;
  modal_details: ScheduleModalDetails;
}

export type ScheduleFilterType = 'today' | 'upcoming' | 'past' | 'all';

export interface ScheduleResponse {
  total_events: number;
  filter_applied: string;
  events: ScheduleEventAPI[];
}

// ──────────────────────────────────────────────
//  Service
// ──────────────────────────────────────────────

class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get("/jobs/dashboard/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch dashboard data",
      );
    }
  }

  async getSidebar(): Promise<SidebarData> {
    try {
      const response = await apiClient.get("/jobs/dashboard/sidebar/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch sidebar data",
      );
    }
  }

  async fetchRecentActivities(
    startDate?: string,
    endDate?: string,
    categories?: string[],
  ): Promise<ActivitySection[]> {
    try {
      let url = "/candidates/recent-activities/";
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (categories && categories.length > 0 && !categories.includes("All")) {
        params.append("category", categories.join(","));
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get(url);
      return response.data; // Already formatted correctly by the backend
    } catch (error) {
      console.error("Error fetching recent activities", error);
      return [];
    }
  }
  async getPriorityActions(params: PriorityActionsParams): Promise<PriorityActionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('tab', params.tab);
      if (params.workspace_id !== undefined) queryParams.append('workspace_id', params.workspace_id.toString());
      if (params.date_range) queryParams.append('date_range', params.date_range);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);
      if (params.history !== undefined) queryParams.append('history', params.history.toString());
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.page_size !== undefined) queryParams.append('page_size', params.page_size.toString());

      const response = await apiClient.get(`/jobs/priority-actions/?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch priority actions",
      );
    }
  }

  async completePriorityAction(payload: CompletePriorityActionPayload): Promise<any> {
    try {
      const response = await apiClient.post("/jobs/priority-actions/complete/", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to complete priority action",
      );
    }
  }

  async getCandidateDetails(applicationId: number, jobId?: number): Promise<any> {
    try {
      let url = `/jobs/applications/${applicationId}/`;
      if (jobId) {
        url += `?job_id=${jobId}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch candidate details",
      );
    }
  }

  async getTalentMatches(params?: TalentMatchesParams): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const response = await apiClient.get(`/candidates/talent-matches/?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch talent matches");
    }
  }

  // ── Calendar Activity API ──
  async getCalendarActivity(month: number, year: number): Promise<CalendarActivityResponse> {
    try {
      const response = await apiClient.get(`/jobs/dashboard/calendar-activity/?month=${month}&year=${year}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch calendar activity",
      );
    }
  }

  // ── Date-wise Agenda API (today/future dates) ──
  async getAgenda(date: string): Promise<AgendaResponse> {
    try {
      const response = await apiClient.get(`/jobs/dashboard/agenda/?date=${date}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch agenda",
      );
    }
  }

  // ── Daily Activities API (past dates) ──
  async getDailyActivities(date: string): Promise<DailyActivitiesResponse> {
    try {
      const response = await apiClient.get(`/jobs/dashboard/daily-activities/?date=${date}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch daily activities",
      );
    }
  }

  // ── Schedule Widget API ──
  async getScheduleEvents(params?: { filter?: ScheduleFilterType; date?: string }): Promise<ScheduleResponse> {
    try {
      const queryParams = new URLSearchParams();
      let startDateStr = '';
      let endDateStr = '';

      const today = new Date();
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      if (params?.date) {
        startDateStr = params.date;
        endDateStr = params.date;
      } else if (params?.filter === 'today') {
        startDateStr = formatDate(today);
        endDateStr = formatDate(today);
      } else if (params?.filter === 'upcoming') {
        // Today to next 30 days
        startDateStr = formatDate(today);
        const upcomingEnd = new Date(today);
        upcomingEnd.setDate(today.getDate() + 30);
        endDateStr = formatDate(upcomingEnd);
      } else {
        // Default to today if no filter or unrecognized
        startDateStr = formatDate(today);
        endDateStr = formatDate(today);
      }

      queryParams.append('start_date', startDateStr);
      queryParams.append('end_date', endDateStr);
      queryParams.append('page_size', '1000');

      const response = await apiClient.get(`/v1/schedule/interview-events/?${queryParams.toString()}`);
      
      // Transform InterviewEvent[] to ScheduleEventAPI[]
      const events: ScheduleEventAPI[] = (response.data.results || response.data || []).map((ev: any) => {
        const start = new Date(ev.start_at);
        const end = new Date(ev.end_at);
        const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
        
        return {
          id: ev.id,
          status: ev.status === 'COMPLETED' ? 'completed' : (ev.status === 'IN_PROGRESS' ? 'in-progress' : 'upcoming'),
          is_done: ev.status === 'COMPLETED',
          widget_summary: {
            time: `${formatTime(start)} – ${formatTime(end)}`,
            type: ev.title || 'Interview',
            name: ev.candidate_name,
            details: ev.candidate_position || '',
            location: ev.location_type || 'virtual',
            color_theme: 'cyan'
          },
          modal_details: {
            title: ev.title || 'Interview',
            candidate_name: ev.candidate_name,
            candidate_id: ev.candidate_id,
            job_id: ev.job_role?.id,
            interview_type: ev.title || 'Interview',
            date: start.toLocaleDateString(),
            time_range: `${formatTime(start)} – ${formatTime(end)}`,
            timezone: ev.timezone || 'IST',
            description: ev.description || ev.title || 'Scheduled Interview',
            meeting_platform: ev.location_type === 'VIRTUAL' ? 'Virtual' : (ev.location_type || 'Virtual'),
            meeting_url: ev.virtual_conference_url || '',
            status_label: ev.status || 'scheduled',
            duration: '60 min',
            recruiter: { name: 'Recruiter', role: 'Team', avatar: '' },
            candidate_contact: { email: '', phone: '' },
            candidate_info: { 
              company: ev.candidate_company || ev.company?.name || '', 
              position: ev.candidate_position || ev.job_role?.name || '', 
              experience: ev.candidate_experience || '' 
            },
            interviewer_info: {
              interviewer_name: ev.interviewer?.name || 'Interviewer',
              job_role: ev.candidate_position || ''
            }
          }
        };
      });

      return {
        total_events: events.length,
        filter_applied: params?.filter || 'all',
        events: events
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch schedule events",
      );
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;