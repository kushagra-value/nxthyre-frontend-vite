import apiClient from "./api";

export interface CandidateListItem {
  id: string;
  full_name: string;
  candidate_email: string;
  candidate_phone:string;
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
    candidate_email: string;
    candidate_phone:string;
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

export interface FollowUpStep {
  id: number;
  send_after_hours: number;
  mode: 'EMAIL' | 'WHATSAPP' | 'CALL';
  subject: string;
  body: string;
  order: number;
}


export interface Template {
  id: number;
  name: string;
  initial_subject: string;
  initial_body: string;
  can_be_sent_via_email: boolean;
  can_be_sent_via_whatsapp: boolean;
  can_be_sent_via_call: boolean;
  follow_up_steps: FollowUpStep[];
  created_at?: string;
  updated_at?: string;
}

export interface InviteResponse {
  success: string;
  invite_id: number;
  candidate_email: string;
  candidate_name: string;
  candidate_phone: string;
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

  async searchCandidates(params: any): Promise<{ results: CandidateListItem[]; count: number }> {
    try {
      const { page, ...body } = params;
      const response = await apiClient.post(`/candidates/search/?page=${page || 1}`, body);
     
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
      const response = await apiClient.get(`/candidates/share/${candidateId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch shareable profile");
    }
  }

  async getTemplates(): Promise<Template[]> {
    const response = await apiClient.get('/jobs/notification-templates/');
    return response.data;
  }

  async saveTemplate(template: Template): Promise<Template> {
    if (template.id) {
      // Update existing template
      const response = await apiClient.put(`/jobs/notification-templates/${template.id}/`, template);
      return response.data;
    } else {
      // Create new template
      const response = await apiClient.post('/jobs/notification-templates/', template);
      return response.data;
    }
  }

  async sendInvite(data: { 
    candidate_id: string; 
    template_id?: string; 
    job_id: string; 
    subject: string; 
    message_body: string; 
    send_via_email: boolean;
    send_via_whatsapp: boolean;
    send_via_phone: boolean;
    followups: { send_after_hours: number; followup_mode: 'EMAIL' | 'WHATSAPP' | 'CALL'; followup_body: string; order_no: number }[] 
  }): Promise<InviteResponse> {
    const response = await apiClient.post('/jobs/invite/', data);
    return response.data;
  }

  async updateTemplate(template: Template): Promise<Template> {
    try {
      const response = await apiClient.put(`/jobs/notification-templates/${template.id}/`, {
        name: template.name,
        initial_subject: template.initial_subject,
        initial_body: template.initial_body,
        can_be_sent_via_email: template.can_be_sent_via_email,
        can_be_sent_via_whatsapp: template.can_be_sent_via_whatsapp,
        can_be_sent_via_call: template.can_be_sent_via_call,
        follow_up_steps: template.follow_up_steps.map(step => ({
          send_after_hours: step.send_after_hours,
          mode: step.mode,
          subject: step.subject,
          body: step.body,
          order: step.order,
        })),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update template");
    }
  }
}

export const candidateService = new CandidateService();
export default candidateService;