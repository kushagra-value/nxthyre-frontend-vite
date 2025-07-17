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
  description: string;
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
      const response = await apiClient.post("/jobs/roles/", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create job");
    }
  }

  async updateJob(id: number, data: Partial<CreateJobData>): Promise<Job> {
    try {
      const response = await apiClient.patch(`/jobs/roles/${id}/`, data);
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