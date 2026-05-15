// src/services/scheduleService.ts
import apiClient from "./api";

export interface ScheduleEventCompany {
  id: number;
  name: string;
}

export interface ScheduleEventJobRole {
  id: number;
  name: string;
}

export interface ScheduleEventStage {
  id: number;
  name: string;
  slug: string;
}

export interface ScheduleEventInterviewer {
  id: string;
  name: string;
  email: string;
}

export interface InterviewEvent {
  id: string;
  title: string;
  candidate_name: string;
  candidate_id: string;
  application_id: string;
  company: ScheduleEventCompany | null;
  job_role: ScheduleEventJobRole | null;
  stage: ScheduleEventStage | null;
  start_at: string;
  end_at: string;
  timezone: string;
  status: string;
  mode: string;
  location_type: string;
  virtual_conference_url?: string | null;
  physical_location?: string | null;
  interviewer?: ScheduleEventInterviewer | null;
  candidate_experience?: string;
  candidate_position?: string;
  candidate_company?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  _meta?: {
    bucket: string;
  };
}

export interface ListInterviewEventsParams {
  status?: string;
  company_id?: number | null;
  job_role_id?: number | null;
  start_date?: string;
  end_date?: string;
  mode?: string;
  view?: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface ListInterviewEventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InterviewEvent[];
}

export interface CalendarDaySummary {
  date: string;
  total_events: number;
  scheduled: number;
  completed: number;
  overdue: number;
  cancelled: number;
  events: any[]; // Lightweight event list
}

export interface CalendarSummaryResponse {
  days: CalendarDaySummary[];
  summary: {
    total: number;
    scheduled: number;
    completed: number;
    overdue: number;
    cancelled: number;
  };
}

export interface DailyDetailResponse {
  date: string;
  stats: {
    today: number;
    upcoming: number;
    overdue: number;
  };
  events: InterviewEvent[];
  tomorrow_events: InterviewEvent[];
}

export interface InterviewModeStat {
  mode: string;
  label: string;
  count: number;
  color: string;
}

export interface ModeStatsResponse {
  modes: InterviewModeStat[];
  overdue: number;
}

export interface StatusCountsResponse {
  all: number;
  scheduled: number;
  completed: number;
  overdue: number;
  cancelled: number;
}

class ScheduleService {
  async getEvents(params: ListInterviewEventsParams = {}): Promise<ListInterviewEventsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const response = await apiClient.get(`/jobs/interview-events/?${searchParams.toString()}`);
    return response.data;
  }

  async getCalendarSummary(startDate: string, endDate: string, companyId?: number, jobRoleId?: number): Promise<CalendarSummaryResponse> {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    if (companyId) params.append('company_id', companyId.toString());
    if (jobRoleId) params.append('job_role_id', jobRoleId.toString());

    const response = await apiClient.get(`/jobs/interview-events/calendar-summary/?${params.toString()}`);
    return response.data;
  }

  async getStatusCounts(): Promise<StatusCountsResponse> {
    const response = await apiClient.get(`/jobs/interview-events/status-counts/`);
    return response.data;
  }

  async getDailyDetail(date: string, companyId?: number, jobRoleId?: number): Promise<DailyDetailResponse> {
    const params = new URLSearchParams();
    params.append('date', date);
    if (companyId) params.append('company_id', companyId.toString());
    if (jobRoleId) params.append('job_role_id', jobRoleId.toString());

    const response = await apiClient.get(`/jobs/interview-events/daily-detail/?${params.toString()}`);
    return response.data;
  }

  async getModeStats(): Promise<ModeStatsResponse> {
    const response = await apiClient.get('/jobs/interview-events/mode-stats/');
    return response.data;
  }

  async createEvent(payload: {
    job?: number;
    application: string;
    candidate?: string;
    title: string;
    description?: string;
    stage?: number;
    start_at: string;
    end_at: string;
    location_type: string;
    location_details?: string;
    virtual_conference_url?: string;
    physical_location?: string;
    status?: string;
    timezone?: string;
    organizer?: string;
    participants?: any[];
    reminder_preferences?: any;
  }): Promise<InterviewEvent> {
    const response = await apiClient.post('/jobs/interview-events/', payload);
    return response.data;
  }

  async updateEvent(eventId: string, payload: Record<string, any>): Promise<InterviewEvent> {
    const response = await apiClient.patch(`/jobs/interview-events/${eventId}/`, payload);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`/jobs/interview-events/${eventId}/`);
  }
}

export const scheduleService = new ScheduleService();
export default scheduleService;
