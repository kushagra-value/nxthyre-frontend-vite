import apiClient from "./api";

export interface CandidateListItem {
  id: string;
  full_name: string;
  avatar: string;
  headline: string;
  location: string;
  linkedin_url?: string;
  is_background_verified: boolean;
  experience_years: string;
  experience_summary: {
    title: string;
    date_range: string;
  };
  education_summary: {
    title: string;
    date_range: string;
  };
  notice_period_summary: string;
  skills_list: string[];
  social_links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    resume?: string;
  };
}

export interface CandidateDetailData {
  id: string;
  full_name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  experience: {
    job_title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
    is_current: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    specialization: string;
    start_date: string;
    end_date: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issued_date: string;
  }[];
  recommendations: {
    recommender_name: string;
    recommender_title: string;
    recommender_company: string;
    feedback: string;
    date_received: string;
  }[];
  notes: {
    noteId: string;
    content: string;
    postedBy: string | null;
    posted_at: string;
    organisation: { orgId: string; orgName: string };
  }[];
  skills_data: {
    skills_mentioned: { skill: string; number_of_endorsements: number }[];
    endorsements: { skill_endorsed: string; endorser_name: string; endorser_title: string; endorser_company: string }[];
  };
}

class CandidateService {
  async getCandidates(page: number = 1, pageSize: number = 20, tab: string = "outbound"): Promise<{ results: CandidateListItem[]; count: number }> {
    try {
      const response = await apiClient.get("/candidates/", {
        params: { page, page_size: pageSize, tab },
      });
      if (Array.isArray(response.data)) {
        return {
          results: response.data,
          count: response.data.length,
        };
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch candidates");
    }
  }

  async searchCandidates(filters: any): Promise<{ results: CandidateListItem[]; count: number }> {
    try {
      const response = await apiClient.post("/candidates/search/", filters);
      return response.data;
      if (Array.isArray(response.data)) {
        return {
          results: response.data,
          count: response.data.length,
        };
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to search candidates");
    }
  }

  async getCandidateDetails(candidateId: string): Promise<CandidateDetailData> {
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch candidate details");
    }
  }
}

export const candidateService = new CandidateService();
export default candidateService;