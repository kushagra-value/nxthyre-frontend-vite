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
//  Service
// ──────────────────────────────────────────────

class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get("/jobs/dashboard/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch dashboard data",
      );
    }
  }

  async getSidebar(): Promise<SidebarData> {
    try {
      const response = await apiClient.get("/jobs/dashboard/sidebar/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch sidebar data",
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
        error.response?.data?.error || "Failed to fetch priority actions",
      );
    }
  }

  async completePriorityAction(payload: CompletePriorityActionPayload): Promise<any> {
    try {
      const response = await apiClient.post("/jobs/priority-actions/complete/", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to complete priority action",
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
        error.response?.data?.error || "Failed to fetch candidate details",
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
      throw new Error(error.response?.data?.error || "Failed to fetch talent matches");
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;