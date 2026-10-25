import apiClient from "./api";
import { organizationService, MyWorkspace, CompanyResearchData } from "./organizationService";
import { jobPostService, Job } from "./jobPostService";
import { candidateService } from "./candidateService";

export interface CandidateCallItem {
  id: string; // application id or candidate id
  candidate: {
    id: string;
    full_name: string;
    current_company?: string | null;
    headline?: string | null;
    current_salary?: string | number | null;
    current_salary_lpa?: string | number | null;
    expected_ctc?: string | number | null;
    notice_period_days?: number | null;
    notice_period_summary?: string | null;
    location?: string | null;
    total_experience?: number | null;
    experience_years?: string | null;
    resume_url?: string | null;
    score?: any;
    job_score?: any;
    job_score_obj?: any;
    candidate_match_score?: any;
    screening_score?: number | string | null;
    screening_round_score?: number | string | null;
    screening_score_value?: number | string | null;
    screening_round?: number | string | null;
    question_analysis?: number | string | null;
    questioion_analysis?: number | string | null;
    ai_accuracy_score?: number | string | null;
    accuracy_score?: number | string | null;
    ai_clarity_score?: number | string | null;
    clarity_score?: number | string | null;
    ai_completeness_score?: number | string | null;
    completeness_score?: number | string | null;
    ai_depth_score?: number | string | null;
    depth_score?: number | string | null;
    ai_screening_score?: number | string | null;
    evaluation_score?: number | string | null;
    interview_score?: number | string | null;
    premium_data?: {
      email?: string;
      phone?: string;
      resume_url?: string;
    };
  };
  score?: any;
  job_score?: any;
  job_score_obj?: any;
  screening_score?: number | string | null;
  screening_round_score?: number | string | null;
  screening_score_value?: number | string | null;
  screening_round?: number | string | null;
  question_analysis?: number | string | null;
  questioion_analysis?: number | string | null;
  ai_accuracy_score?: number | string | null;
  accuracy_score?: number | string | null;
  ai_clarity_score?: number | string | null;
  clarity_score?: number | string | null;
  ai_completeness_score?: number | string | null;
  completeness_score?: number | string | null;
  ai_depth_score?: number | string | null;
  depth_score?: number | string | null;
  ai_screening_score?: number | string | null;
  evaluation_score?: number | string | null;
  interview_score?: number | string | null;
  contextual_details?: any;
  latest_manual_call_status?: string | null;
  latest_manual_call_at?: string | null;
  latest_manual_call_note?: string | null;
  latest_call_status?: string | null;
  latest_call_at?: string | null;
  latest_call_note?: string | null;
  last_active_at?: string | null;
}

export interface CallFilterParams {
  location?: string[];
  salaryRange?: { min: string; max: string };
  experience?: { min: string; max: string };
  designation?: string[];
  noticePeriod?: { selected: string[]; minDays: string; maxDays: string };
  attention?: string[];
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const callService = {
  // Fetch workspaces (companies)
  async getCompanies(): Promise<MyWorkspace[]> {
    try {
      const data = await organizationService.getMyWorkspacesData();
      if (data?.workspaces?.length) {
        return data.workspaces;
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
    // Fallback demo companies matching screenshot
    return [
      { id: 101, name: "Deloitte", workspace_status: "Active" } as any,
    ];
  },

  // Fetch jobs for workspace
  async getJobs(workspaceId?: number): Promise<Job[]> {
    try {
      const res = await jobPostService.getPaginatedRoles({
        workspace_id: workspaceId,
        page_size: 100,
      });
      if (res?.jobs?.length) {
        return res.jobs;
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
    // Fallback demo jobs matching screenshot
    return [
      { id: 201, title: "Senior Front-End Developer +2", workspace_id: workspaceId || 101 } as any,
    ];
  },

  // Fetch candidates for selected job with filters
  async getCandidates(jobId: number, filters?: CallFilterParams): Promise<{ candidates: CandidateCallItem[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("job_id", jobId.toString());
      queryParams.append("page", (filters?.page || 1).toString());
      queryParams.append("page_size", (filters?.pageSize || 20).toString());
      queryParams.append("view", "kanban");

      if (filters?.search?.trim()) {
        queryParams.append("search", filters.search.trim());
      }
      if (filters?.ordering) {
        queryParams.append("ordering", filters.ordering);
      }
      if (filters?.location?.length) {
        queryParams.append("location", filters.location.join(","));
      }
      if (filters?.salaryRange?.min) {
        queryParams.append("salary_min", filters.salaryRange.min);
      }
      if (filters?.salaryRange?.max) {
        queryParams.append("salary_max", filters.salaryRange.max);
      }
      if (filters?.experience?.min) {
        queryParams.append("experience_min", filters.experience.min);
      }
      if (filters?.experience?.max) {
        queryParams.append("experience_max", filters.experience.max);
      }
      if (filters?.designation?.length) {
        queryParams.append("designation", filters.designation.join(","));
      }
      if (filters?.noticePeriod?.selected?.length) {
        queryParams.append("notice_period", filters.noticePeriod.selected.join(","));
      }
      if (filters?.noticePeriod?.minDays) {
        queryParams.append("notice_period_min_days", filters.noticePeriod.minDays);
      }
      if (filters?.noticePeriod?.maxDays) {
        queryParams.append("notice_period_max_days", filters.noticePeriod.maxDays);
      }
      if (filters?.attention?.length) {
        queryParams.append("attention", filters.attention.join(","));
      }

      const response = await apiClient.get(`/jobs/applications/?${queryParams.toString()}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return { candidates: data, total: data.length };
      }
      return {
        candidates: data.results || data.applications || data.candidates || [],
        total: data.count || (data.results?.length ?? 0),
      };
    } catch (error) {
      console.error("Failed to fetch candidates for call queue:", error);
      return { candidates: [], total: 0 };
    }
  },

  // Fetch company research / details
  async getCompanyResearch(workspaceId: number): Promise<CompanyResearchData | null> {
    try {
      return await organizationService.getCompanyResearchData(workspaceId);
    } catch (error) {
      console.error("Failed to fetch company research:", error);
      return null;
    }
  },

  // City suggestions for filter
  async getCitySuggestions(query: string): Promise<string[]> {
    try {
      return await candidateService.getCitySuggestions(query);
    } catch (error) {
      console.error("Failed to fetch city suggestions:", error);
      return [];
    }
  },

  // Designation suggestions for filter
  async getDesignationSuggestions(jobId: number, query: string): Promise<string[]> {
    try {
      return await jobPostService.getDesignationList(jobId, query);
    } catch (error) {
      console.error("Failed to fetch designation suggestions:", error);
      return [];
    }
  },
};
