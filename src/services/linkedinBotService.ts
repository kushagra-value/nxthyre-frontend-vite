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
}

class LinkedinBotService {
  async getLinkedinBotCandidates(params: GetLinkedinBotCandidatesParams): Promise<LinkedinBotCandidatesResponse> {
    try {
      const response = await apiClient.get("/candidates/linkedin-bot/candidates/", { params });
      return response.data;
    } catch (error: any) {
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
}

export const linkedinBotService = new LinkedinBotService();
export default linkedinBotService;
