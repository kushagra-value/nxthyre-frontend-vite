import apiClient from "./api";

export interface NaukriJob {
  job_id: string;
  title: string;
  locations: string[];
  min_experience: number;
  max_experience: number;
  state: string;
  key_skills: string[];
}

export interface NaukriJobsResponse {
  count: number;
  jobs: NaukriJob[];
}

export interface NaukbotJobRole {
  job_id: number;
  title: string;
  status: string;
  created_at: string;
  naukri_bot_active: boolean;
}

export interface NaukbotJobRolesResponse {
  count: number;
  jobs: NaukbotJobRole[];
}

export interface NaukbotCandidateSummary {
  total_sourced: number;
  above_80_pct: number;
  nvited: number;
  new: number;
}

export interface NaukbotCandidate {
  id: string;
  name: string;
  current_title: string;
  current_company: string;
  ai_score: number;
  match_tier: string;
  tier: string;
  location: string;
  experience_years: number;
  current_ctc_lacs: number;
  expected_ctc_lacs: number;
  notice_period: string;
  education: string;
  key_skills: string[];
  skills_match: {
    matched: number;
    total: number;
    matched_skills: string[];
    missing_skills: string[];
  };
  highlights: string[];
  gaps: string[];
  is_nvited: boolean;
  is_skipped: boolean;
  is_moved_to_pipeline: boolean;
  created_at: string;
}

export interface NaukbotCandidatesResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  summary: NaukbotCandidateSummary;
  sourcing_enabled: boolean;
  results: NaukbotCandidate[];
}

export interface GetNaukbotCandidatesParams {
  job_id: number;
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  min_match_pct?: number;
  max_match_pct?: number;
  tier?: string;
  notice_period?: string;
  show_skipped?: boolean;
  sourced_after?: string;
}

class NaukbotService {
  async getNaukbotCandidates(params: GetNaukbotCandidatesParams): Promise<NaukbotCandidatesResponse> {
    try {
      const response = await apiClient.get("/candidates/naukri-bot/candidates/", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch naukbot candidates");
    }
  }

  async skipCandidates(candidate_ids: string[], undo: boolean = false): Promise<any> {
    try {
      const response = await apiClient.post("/candidates/naukri-bot/candidates/skip/", {
        candidate_ids,
        undo,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to edit candidates");
    }
  }

  async sendNVite(candidate_ids: string[], naukri_job_id: string, keyword?: string, nxthyre_job_id?: number): Promise<any> {
    try {
      const response = await apiClient.post("/candidates/naukri-bot/send-nvite/", {
        candidate_ids,
        naukri_job_id,
        keyword,
        nxthyre_job_id,
      });
      return response.data;
    } catch (error: any) {
       throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to send nvite");
    }
  }

  async getNaukriJobs(): Promise<NaukriJobsResponse> {
    try {
      const response = await apiClient.get("/candidates/naukri-bot/naukri-jobs/");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch Naukri jobs");
    }
  }

  async getNViteLogs(params?: Record<string, any>): Promise<any> {
      try {
        const response = await apiClient.get("/candidates/naukri-bot/nvite-logs/", { params });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch nvite logs");
      }
  }

  async enrichAndMoveToPipeline(candidate_ids: string[], job_id: number): Promise<any> {
    try {
      const response = await apiClient.post("/candidates/naukri-bot/enrich/", {
        candidate_ids,
        job_id,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to move candidates to pipeline");
    }
  }

  async getNaukbotJobRoles(): Promise<NaukbotJobRolesResponse> {
    try {
      const response = await apiClient.get("/candidates/naukri-bot/job-roles/");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch Naukbot job roles");
    }
  }

  async activateNaukbotJob(job_id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/candidates/naukri-bot/job-roles/${job_id}/activate/`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to activate job for Naukri Bot");
    }
  }

  async deactivateNaukbotJob(job_id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/candidates/naukri-bot/job-roles/${job_id}/deactivate/`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to deactivate job for Naukri Bot");
    }
  }

  async triggerNaukbotJob(job_id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/candidates/naukri-bot/trigger/${job_id}/`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to trigger Naukri Bot job");
    }
  }
}

export const naukbotService = new NaukbotService();
export default naukbotService;
