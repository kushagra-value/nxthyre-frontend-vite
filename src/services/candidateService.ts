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
  recruiter_id: string;
  credit_balance: number;
  candidate: {
    id: string;
    full_name: string;
    headline: string;
    location: string;
    profile_picture_url: string;
    status: string;
    linkedin_url?: string;
    total_experience: number;
    github_url?: string;
    twitter_url?: string;
    portfolio_url?: string;
    resume_url?: string;
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
      is_top_tier: boolean;
      start_date: string;
      end_date: string;
    }[];
    certifications: {
      name: string;
      issuer: string;
      license_number: string;
      issued_date: string;
      valid_until: string | null;
      url: string;
    }[];
    recommendations: {
      recommender_name: string;
      recommender_title: string;
      recommender_company: string;
      recommender_relationship: string;
      recommender_profile_pic_url: string;
      feedback: string;
      date_received: string;
    }[];
    notes: {
      noteId: string;
      content: string;
      is_team_note: boolean;
      is_community_note: boolean;
      postedBy: {
        userId: string;
        userName: string;
        email: string;
      } | null;
      posted_at: string;
      organisation: {
        orgId: string;
        orgName: string;
      };
    }[];
    skills_data: {
      skills_mentioned: { skill: string; number_of_endorsements: number }[];
      endorsements: { skill_endorsed: string; endorser_name: string; endorser_title: string; endorser_company: string, endorser_profile_pic_url: string; }[];
    };
    current_stage_in_job: string | null;
    gender: string;
    is_recently_promoted: boolean;
    is_background_verified: boolean;
    is_active: boolean;
    is_prevetted: boolean;
    notice_period_days: number; 
    application_type: string;
    stage: string;
    ai_interview_report: string | null;
  }
}

export interface ShareableProfileSensitiveCandidate {
  id: string;
  about: string;
  location: string;
  total_experience_years: number;
  experience: {
    job_title: string;
    location: string;
    start_date: string;
    end_date: string | null;
    description: string;
    is_current: boolean;
  }[];
  education: {
    degree: string;
    specialization: string;
    start_date: string;
    end_date: string;
  }[];
  skills: {
    skill: string;
    number_of_endorsements: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    license_number: string;
    issued_date: string;
    valid_until: string | null;
    url: string;
  }[];
}

class CandidateService {
  async getCandidates(filters: any): Promise<{ results: CandidateListItem[]; count: number }> {
    try {
      const response = await apiClient.post("/candidates/search/", {filters});
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
     
      if (Array.isArray(response.data)) {
        return {
          results: response.data,
          count: response.data.length,
        };
      }
       return response.data;
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
  async getShareableProfile(candidateId: string): Promise<ShareableProfileSensitiveCandidate> {
    try {
      const response = await apiClient.get(`/api/candidates/share/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch shareable profile");
    }
  }
}

export const candidateService = new CandidateService();
export default candidateService;