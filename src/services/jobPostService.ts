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
  enable_ai_interviews: boolean;
  description_text?: string; // Optional: for pasted text
  description_file?: File;
  skill_names: string[];
  status: "DRAFT" | "PUBLISHED";
  workspace: number;
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
      formData.append("enable_ai_interviews", String(data.enable_ai_interviews));
      formData.append("status", data.status);
      formData.append("workspace", String(data.workspace));

      // Append skills as a JSON string or individual entries based on API requirements
      data.skill_names.forEach((skill, index) => {
        formData.append(`skill_names[${index}]`, skill);
      });

      // Append description_text or description_file
      if (data.description_text) {
        formData.append("description_text", data.description_text);
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
      if (data.enable_ai_interviews !== undefined)
        formData.append("enable_ai_interviews", String(data.enable_ai_interviews));
      if (data.status) formData.append("status", data.status);
      if (data.workspace) formData.append("workspace", String(data.workspace));
      if (data.skill_names) {
        data.skill_names.forEach((skill, index) => {
          formData.append(`skills`, skill);
        });
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
}

export const jobPostService = new JobPostService();
export default jobPostService;