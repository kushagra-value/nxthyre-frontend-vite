import apiClient from "./api";

export interface LinkedinBotCandidateSummary {
  total_sourced: number;
  above_80_pct: number;
  new: number;
}

export interface LinkedinBotCandidate {
  id: string;
  name: string;
  current_title: string;
  current_company: string;
  ai_score: number;
  location: string;
  experience_years: string;
  current_ctc_lacs: string;
  expected_ctc_lacs: string;
  notice_period: string;
  skills_match: {
    matched: number;
    total: number;
    matched_skills?: string[];
    missing_skills?: string[];
  };
  linkedin_url: string;
  is_nvited?: boolean;
  is_skipped?: boolean;
  is_moved_to_pipeline?: boolean;
}

export interface LinkedinBotCandidatesResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: LinkedinBotCandidateSummary;
  results: LinkedinBotCandidate[];
}

export interface GetLinkedinBotCandidatesParams {
  job_id: number;
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  experience_min?: number;
  experience_max?: number;
  designation?: string;
  notice_period?: string;
  notice_period_min_days?: number;
  notice_period_max_days?: number;
  skills?: string;
}

class LinkedinBotService {
  async getLinkedinBotCandidates(params: GetLinkedinBotCandidatesParams, signal?: AbortSignal): Promise<LinkedinBotCandidatesResponse> {
    try {
      const response = await apiClient.get("/candidates/linkedin-bot/candidates/", { params, signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') throw error;
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch LinkedIn bot candidates");
    }
  }

  async triggerLinkedinBotJob(job_id: number): Promise<any> {
    try {
      const response = await apiClient.post(`/candidates/trigger-linkedin-role-matching/${job_id}/`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to trigger LinkedIn Bot job");
    }
  }

  async getSkillsList(jobId: number): Promise<string[]> {
    try {
      const response = await apiClient.get('/candidates/linkedin-bot/skills-list/', {
        params: { job_id: jobId }
      });
      return response.data?.skills || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to fetch skills list");
    }
  }

  async getDesignationList(jobId: number, search?: string): Promise<string[]> {
    try {
      const params: any = { job_id: jobId };
      if (search?.trim()) params.search = search.trim();
      const response = await apiClient.get('/candidates/linkedin-bot/designation-list/', { params });
      return response.data?.designations || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Failed to fetch designation list");
    }
  }
}

export const linkedinBotService = new LinkedinBotService();
export default linkedinBotService;
