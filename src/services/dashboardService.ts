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
}

export const dashboardService = new DashboardService();
export default dashboardService;