// src/services/jobPostService.ts
import apiClient from "./api";

export interface Job {
  id: number;
  title: string;
  location: string;
  is_hybrid: boolean;
  seniority: string;
  department: number;
  experience_min_years: number;
  experience_max_years: number;
  salary_min: string;
  salary_max: string;
  is_salary_confidential: boolean;
  visibility: "PRIVATE" | "PUBLIC";
  enable_ai_interviews: boolean;
  description: string;
  skills: string[];
  status: "DRAFT" | "PUBLISHED";
  pipeline: number;
  posted_by: string;
  organization: number;
  workspace: number;
  created_at: string;
  updated_at: string;
  total_candidates: number,
  invites_sent_count: number,
  total_applied: number,
  total_replied: number
}

export interface SearchedCandidateItem {
  id: number;
  candidate: {
    id: string;
    full_name: string;
    avatar: string;
    headline: string;
    location: string;
    linkedin_url: string;
    is_background_verified: boolean;
    experience_years: string;
    experience_summary: { title: string; date_range: string, duration_years: number };
    education_summary: { title: string; date_range: string };
    notice_period_summary: string;
    skills_list: string[];
    social_links: {
      linkedin: string;
      github: string;
      portfolio: string;
      resume: string;
    };
    resume_url: string;
    current_salary_lpa: string;
  };
  stage_slug: string;
  job: {
    id: number;
    title: string;
  };
  current_stage: {
    id: number;
    name: string;
    slug: string;
  };
  status_tags: {
    text: string;
    color: string;
  }[];
}

export interface CreateJobData {
  title: string;
  location: string;
  is_hybrid: boolean;
  seniority: string;
  department: number;
  experience_min_years: number;
  experience_max_years: number;
  salary_min: string;
  salary_max: string;
  is_salary_confidential: boolean;
  visibility: "PRIVATE" | "PUBLIC";
  has_coding_contest_stage: boolean;
  has_ai_interview_stage: boolean;
  description_text?: string; // Optional: for pasted text
  description_file?: File;
  skills: string[];
  status: "DRAFT" | "PUBLISHED";
  workspace: number;
  ai_jd_object?: any;
}

class JobPostService {
  async getJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get("/jobs/roles/");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch jobs");
    }
  }

  async getJob(id: number): Promise<Job> {
    try {
      const response = await apiClient.get(`/jobs/roles/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch job");
    }
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiClient.get(`/jobs/location-suggestions/?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch location suggestions");
    }
  }

   async createAiJd(description: string | File): Promise<any> {
      try {
        const formData = new FormData();
        if (typeof description === 'string') {
          formData.append('description_text', description);
        } else {
          formData.append('description_file', description);
        }
        const response = await apiClient.post('/jobs/create-ai-jd/', formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } catch (error: any) {
        throw new Error(error.response?.data?.error || "Failed to create AI JD");
      }
    }

  async createJob(data: CreateJobData): Promise<Job> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("location", data.location);
      formData.append("is_hybrid", String(data.is_hybrid));
      formData.append("seniority", data.seniority);
      formData.append("department", String(data.department));
      formData.append("experience_min_years", String(data.experience_min_years));
      formData.append("experience_max_years", String(data.experience_max_years));
      formData.append("salary_min", data.salary_min);
      formData.append("salary_max", data.salary_max);
      formData.append("is_salary_confidential", String(data.is_salary_confidential));
      formData.append("visibility", data.visibility);
      formData.append("has_coding_contest_stage", String(data.has_coding_contest_stage));
      formData.append("has_ai_interview_stage", String(data.has_ai_interview_stage));
      formData.append("status", data.status);
      formData.append("workspace", String(data.workspace));

      // Append skills as a JSON string or individual entries based on API requirements
      formData.append("skills", JSON.stringify(data.skills));

      if (data.ai_jd_object) {
        formData.append("ai_jd_object", JSON.stringify(data.ai_jd_object));
      }

      // Append description_text or description_file
      if (data.description_text) {
        formData.append("description", data.description_text);
      } else if (data.description_file) {
        formData.append("description_file", data.description_file);
      }

      const response = await apiClient.post("/jobs/roles/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create job");
    }
  }

  async updateJob(id: number, data: Partial<CreateJobData>): Promise<Job> {
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.location) formData.append("location", data.location);
      if (data.is_hybrid !== undefined) formData.append("is_hybrid", String(data.is_hybrid));
      if (data.seniority) formData.append("seniority", data.seniority);
      if (data.department) formData.append("department", String(data.department));
      if (data.experience_min_years !== undefined)
        formData.append("experience_min_years", String(data.experience_min_years));
      if (data.experience_max_years !== undefined)
        formData.append("experience_max_years", String(data.experience_max_years));
      if (data.salary_min) formData.append("salary_min", data.salary_min);
      if (data.salary_max) formData.append("salary_max", data.salary_max);
      if (data.is_salary_confidential !== undefined)
        formData.append("is_salary_confidential", String(data.is_salary_confidential));
      if (data.visibility) formData.append("visibility", data.visibility);
      if (data.has_ai_interview_stage !== undefined)
        formData.append("has_ai_interview_stage", String(data.has_ai_interview_stage));
      if (data.has_coding_contest_stage !== undefined)
        formData.append("has_coding_contest_stage", String(data.has_coding_contest_stage));
      if (data.status) formData.append("status", data.status);
      if (data.workspace) formData.append("workspace", String(data.workspace));
      if (data.skills) {
        formData.append("skills", JSON.stringify(data.skills));
      }
      if (data.ai_jd_object) {
        formData.append("ai_jd_object", JSON.stringify(data.ai_jd_object));
      }
      if (data.description_text) {
        formData.append("description", data.description_text);
      } else if (data.description_file) {
        formData.append("description_file", data.description_file);
      }

      const response = await apiClient.patch(`/jobs/roles/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update job");
    }
  }

  async deleteJob(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jobs/roles/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete job");
    }
  }

  async searchAutosuggest(query: string, jobId: number): Promise<{id: string, name: string}[]> {
    try {
      const response = await apiClient.get(`/jobs/search/autosuggest/?q=${query}&job_id=${jobId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch autosuggest");
    }
  }

  async getSearchedCandidate(candidateId: string, jobId: number): Promise<SearchedCandidateItem> {
    try {
      const response = await apiClient.get(`/jobs/search/candidates/?candidate_id=${candidateId}&job_id=${jobId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch searched candidate");
    }
  }

  async getAIJD(jobId: number): Promise<{ job_description_markdown: string; technical_competencies: Array<{ skill: string; context: string; priority: string; years_implied: string; assessment_type: string; proficiency_level: string }> }> {
    try {
      const response = await apiClient.get(`/jobs/ai-jd/${jobId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch AI JD");
    }
  }
}

export const jobPostService = new JobPostService();
export default jobPostService;