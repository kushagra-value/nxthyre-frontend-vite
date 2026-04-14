// src/services/jobPostService.ts
import apiClient from "./api";

export interface Job {
  job_id: number;
  notice_period: string;
  shortlisted_candidate_count: number;
  id: number;
  title: string;
  location: string[];
  work_approach: "ONSITE" | "REMOTE" | "HYBRID";
  seniority: string;
  department_name: string;
  experience_min_years: number;
  experience_max_years: number;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_confidential: boolean;
  visibility: "PRIVATE" | "PUBLIC";
  has_ai_interview_stage: boolean;
  has_coding_contest_stage: boolean;
  description: string;
  skills: string[];
  status: "ACTIVE" | "PAUSED" | "INACTIVE" | "DRAFT" | "PUBLISHED" | "CLOSED";
  pyjamahr_status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  job_role_status?: "ACTIVE" | "PAUSED" | "INACTIVE";
  posted_by: string;
  organization_details: {
    id: number;
    name: string;
  };
  workspace_details: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  pipeline_candidate_count: number;
  inbound_count: number;
  invites_sent: number;
  total_applied: number;
  total_replied: number;
  job_description_markdown: string;
  ai_jd: string;
  technical_competencies: string[];
  ai_jd_object?: any;
  count: number;
  jobrole_company: string;
  boolean_search_terms?: string;
  experience_display?: string;
  salary_display?: string;
  jd_code?: string;
  candidates_count?: number;
  shortlisted_count?: number;
  hired_count?: number;
  days_open?: number;
  days_open_text?: string;
  No_of_opening_or_positions_?: number;
  last_active_date?: string;
  last_active_date_display?: string;
  stage_breakdown?: {
    name: string;
    count: number;
    color: string;
    archived_count?: number;
  }[];
  num_positions?: number;
  is_flagged?: boolean;
  interview_this_week?: number;
}

export interface JobsStatsCount {
  total_jobs: number;
  total_candidates: number;
  in_pipeline: number;
  shortlisted: number;
  interview_this_week: number;
  hired: number;
  need_action: number;
  shortlisted_across_jobs: number;
  increased_decreased_rate_percentages?: {
    total_jobs?: { yesterday: string; weekly: string; monthly: string };
    total_candidates?: { yesterday: string; weekly: string; monthly: string };
    interview_this_week?: { yesterday: string; weekly: string; monthly: string };
    hired?: { yesterday: string; weekly: string; monthly: string };
  };
}

export interface JobsStatusCounts {
  all: number;
  active: number;
  paused: number;
  inactive: number;
}

export interface JobsApiResponse {
  stats_count: JobsStatsCount;
  status_counts: JobsStatusCounts;
  jobs: Job[];
  pagination: {
    showing: string;
    total_jobs_count_in_workspace: number;
  };
}

export interface JobsRolesQueryParams {
  page?: number;
  page_size?: number;
  workspace_id?: number;
  created_after?: string;
  created_before?: string;
}

export interface AllRoleOption {
  id: number;
  title: string;
  workspace_id?: number;
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
    experience_summary: {
      title: string;
      date_range: string;
      duration_years: number;
    };
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
  location: string[];
  work_approach: "ONSITE" | "REMOTE" | "HYBRID";
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
  status: "ACTIVE" | "PAUSED" | "INACTIVE";
  workspace: number;
  ai_jd_object?: any;
  ai_jd?: any;
  technical_competencies?: string[];
}

export interface UploadResumesResponse {
  message: string;
  batch_id: string;
  total_files: number;
  successful_count: number;
  failed_count: number;
  failed_files: string[];
}

export interface JobNote {
  id: number;
  job_id: number;
  content: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

class JobPostService {
  private getDefaultStatsCount(): JobsStatsCount {
    return {
      total_jobs: 0,
      total_candidates: 0,
      in_pipeline: 0,
      shortlisted: 0,
      interview_this_week: 0,
      hired: 0,
      need_action: 0,
      shortlisted_across_jobs: 0,
    };
  }

  private getDefaultStatusCounts(totalJobs = 0): JobsStatusCounts {
    return {
      all: totalJobs,
      active: 0,
      paused: 0,
      inactive: 0,
    };
  }

  private getDefaultPagination(totalJobs = 0): JobsApiResponse["pagination"] {
    return {
      showing: totalJobs > 0 ? `1-${totalJobs} of ${totalJobs} jobs` : "0-0 of 0 jobs",
      total_jobs_count_in_workspace: totalJobs,
    };
  }

  private normalizeJobsApiResponse(data: any): JobsApiResponse {
    if (Array.isArray(data)) {
      return {
        stats_count: this.getDefaultStatsCount(),
        status_counts: this.getDefaultStatusCounts(data.length),
        jobs: data,
        pagination: this.getDefaultPagination(data.length),
      };
    }

    const jobs = data.jobs || data.roles || data.results || data.data || [];
    return {
      stats_count: data.stats_count || this.getDefaultStatsCount(),
      status_counts: data.status_counts || this.getDefaultStatusCounts(Array.isArray(jobs) ? jobs.length : 0),
      jobs,
      pagination: data.pagination || this.getDefaultPagination(Array.isArray(jobs) ? jobs.length : 0),
    };
  }

  async getPaginatedRoles(params: JobsRolesQueryParams = {}): Promise<JobsApiResponse> {
    try {
      const response = await apiClient.get("/jobs/roles/", { params });
      return this.normalizeJobsApiResponse(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch jobs");
    }
  }

  async getJobs(): Promise<Job[]> {
    const response = await this.getPaginatedRoles();
    return response.jobs;
  }

  async getJobsWithStats(): Promise<JobsApiResponse> {
    return this.getPaginatedRoles();
  }

  async getAllRoles(): Promise<AllRoleOption[]> {
    try {
      const response = await apiClient.get("/jobs/all-roles/");
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.results || response.data?.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch all roles");
    }
  }

  async toggleJobFlag(jobId: number, isFlagged: boolean): Promise<{ id: number; is_flagged: boolean; updated_at: string }> {
    try {
      const response = await apiClient.patch(`/v1/jobs/${jobId}/`, {
        is_flagged: isFlagged,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to update flag");
    }
  }

  // --- JOB NOTES ---

  async getJobNotes(jobId: number): Promise<JobNote[]> {
    try {
      const response = await apiClient.get(`/v1/jobs/${jobId}/notes/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch job notes");
    }
  }

  async addJobNote(jobId: number, content: string): Promise<JobNote> {
    try {
      const response = await apiClient.post(`/v1/jobs/${jobId}/notes/`, { content });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to add job note");
    }
  }

  async updateJobNote(jobId: number, noteId: number, content: string): Promise<JobNote> {
    try {
      const response = await apiClient.patch(`/v1/jobs/${jobId}/notes/${noteId}/`, { content });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to update job note");
    }
  }

  async deleteJobNote(jobId: number, noteId: number): Promise<void> {
    try {
      await apiClient.delete(`/v1/jobs/${jobId}/notes/${noteId}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to delete job note");
    }
  }

  async getJob(id: number): Promise<Job> {
    try {
      const response = await apiClient.get(`/jobs/roles/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch job");
    }
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    try {
      const response = await apiClient.get(
        `/jobs/location-suggestions/?q=${encodeURIComponent(query)}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch location suggestions",
      );
    }
  }

  async createAiJd(description: string | File): Promise<any> {
    try {
      const formData = new FormData();
      if (typeof description === "string") {
        formData.append("description_text", description);
      } else {
        formData.append("description_file", description);
      }
      const response = await apiClient.post("/jobs/create-ai-jd/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to create AI JD");
    }
  }

  async createJob(data: CreateJobData): Promise<Job> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      // Append each location individually
      if (data.location) {
        data.location.forEach((loc) => {
          formData.append("location", loc);
        });
      }
      formData.append("work_approach", data.work_approach);
      formData.append("seniority", data.seniority);
      formData.append("department", String(data.department));
      formData.append(
        "experience_min_years",
        String(data.experience_min_years),
      );
      formData.append(
        "experience_max_years",
        String(data.experience_max_years),
      );
      formData.append("salary_min", data.salary_min);
      formData.append("salary_max", data.salary_max);
      formData.append(
        "is_salary_confidential",
        String(data.is_salary_confidential),
      );
      formData.append("visibility", data.visibility);
      formData.append(
        "has_coding_contest_stage",
        String(data.has_coding_contest_stage),
      );
      formData.append(
        "has_ai_interview_stage",
        String(data.has_ai_interview_stage),
      );
      formData.append("status", data.status);
      formData.append("workspace", String(data.workspace));

      // Append skills as a JSON string or individual entries based on API requirements
      if (data.skills) {
        data.skills.forEach((skill) => {
          formData.append(`skills`, skill);
        });
      }

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
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to create job");
    }
  }

  async updateJob(id: number, data: Partial<CreateJobData>): Promise<Job> {
    try {
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      // Append each location individually
      if (data.location) {
        data.location.forEach((loc) => {
          formData.append("location", loc);
        });
      }
      if (data.work_approach !== undefined)
        formData.append("work_approach", data.work_approach);
      if (data.seniority) formData.append("seniority", data.seniority);
      if (data.department)
        formData.append("department", String(data.department));
      if (data.experience_min_years !== undefined)
        formData.append(
          "experience_min_years",
          String(data.experience_min_years),
        );
      if (data.experience_max_years !== undefined)
        formData.append(
          "experience_max_years",
          String(data.experience_max_years),
        );
      if (data.salary_min) formData.append("salary_min", data.salary_min);
      if (data.salary_max) formData.append("salary_max", data.salary_max);
      if (data.is_salary_confidential !== undefined)
        formData.append(
          "is_salary_confidential",
          String(data.is_salary_confidential),
        );
      if (data.visibility) formData.append("visibility", data.visibility);
      if (data.has_ai_interview_stage !== undefined)
        formData.append(
          "has_ai_interview_stage",
          String(data.has_ai_interview_stage),
        );
      if (data.has_coding_contest_stage !== undefined)
        formData.append(
          "has_coding_contest_stage",
          String(data.has_coding_contest_stage),
        );
      if (data.status) formData.append("status", data.status);
      if (data.workspace) formData.append("workspace", String(data.workspace));
      if (data.skills) {
        data.skills.forEach((skill) => {
          formData.append("skills", skill); // Use same key 'skills' for each value
        });
      }
      if (data.ai_jd) {
        formData.append("ai_jd", String(data.ai_jd));
      }

      if (data.technical_competencies) {
        formData.append(
          "technical_competencies",
          JSON.stringify(data.technical_competencies),
        );
      }
      if (data.description_text) {
        formData.append("description", data.description_text);
      } else if (data.description_file) {
        formData.append("description_file", data.description_file);
      }

      if (data.ai_jd_object) {
        formData.append("ai_jd_object", JSON.stringify(data.ai_jd_object));
      }

      const response = await apiClient.patch(`/jobs/roles/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to update job");
    }
  }

  async uploadResumes(
    jobId: number | string,
    resumes: File[],
  ): Promise<UploadResumesResponse> {
    try {
      const formData = new FormData();
      formData.append("job_id", String(jobId));
      resumes.forEach((resume) => {
        formData.append("resumes", resume);
      });
      const response = await apiClient.post(
        "/candidates/upload-resumes/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to upload resumes",
      );
    }
  }

  // Get upload status (polling API)
  async getUploadStatus(): Promise<any[]> {
    try {
      const response = await apiClient.get("/candidates/upload-status/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch upload status",
      );
    }
  }

  // Upload history for a job
  async getUploadHistory(jobId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/candidates/upload-status/?job_id=${jobId}&time_range=all`,
        {
          params: {
            job_id: jobId,
            time_range: "all",
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch upload history",
      );
    }
  }

  async updateCutoff(
    jobId: number,
    stageType: string,
    cutoffScore: number,
  ): Promise<void> {
    try {
      const response = await apiClient.patch(`/jobs/cutoff-score/`, {
        job_id: jobId,
        stage_type: stageType,
        cutoff_score: cutoffScore,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to update cutoff score",
      );
    }
  }

  async getCutOff(
    jobId: number,
    stageType: string,
  ): Promise<{ cutoff_score: number }> {
    try {
      const response = await apiClient.get(
        `/jobs/cutoff-score/?job_id=${jobId}&stage_type=${stageType}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch cutoff score",
      );
    }
  }

  async updateJobRoleStatus(jobId: number, status: string): Promise<void> {
    try {
      const response = await apiClient.patch(`/jobs/roles/${jobId}/status/`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to update job status",
      );
    }
  }

  async unpublishJob(id: number): Promise<void> {
    try {
      const response = await apiClient.post(
        `/jobs/roles/${id}/unpublish-from-pyjamahr/`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to unpublish job");
    }
  }

  async deleteJob(id: number): Promise<void> {
    try {
      await apiClient.delete(`/jobs/roles/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to delete job");
    }
  }

  async searchAutosuggest(
    query: string,
    jobId: number,
  ): Promise<{ id: string; name: string }[]> {
    try {
      const response = await apiClient.get(
        `/jobs/search/autosuggest/?q=${query}&job_id=${jobId}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch autosuggest",
      );
    }
  }

  async getSearchedCandidate(
    candidateId: string,
    jobId: number,
  ): Promise<SearchedCandidateItem> {
    try {
      const response = await apiClient.get(
        `/jobs/search/candidates/?candidate_id=${candidateId}&job_id=${jobId}`,
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch searched candidate",
      );
    }
  }

  async getJobCompetencies(id: number): Promise<any> {
    try {
      const response = await apiClient.get(`/jobs/roles/${id}/competencies/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || error.response?.data?.error || "Failed to fetch job competencies",
      );
    }
  }

  async applyToJob(
    jobId: number,
    applicationData: {
      name: string;
      title: string;
      mailId: string;
      contactNumber: string;
      currentCTA: string;
      expectedCTA: string;
      noticePeriod: string;
      resume: File;
    },
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("name", applicationData.name);
      formData.append("title", applicationData.title);
      formData.append("email", applicationData.mailId);
      formData.append("contact_number", applicationData.contactNumber);
      formData.append("current_cta", applicationData.currentCTA);
      formData.append("expected_cta", applicationData.expectedCTA);
      formData.append("notice_period", applicationData.noticePeriod);
      formData.append("resume", applicationData.resume);

      const response = await apiClient.post(`/jobs/${jobId}/apply/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to apply to job");
    }
  }

  async getAIJD(jobId: number): Promise<{
    job_description_markdown: string;
    technical_competencies: Array<{
      skill: string;
      context: string;
      priority: string;
      years_implied: string;
      assessment_type: string;
      proficiency_level: string;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/jobs/ai-jd/${jobId}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.response?.data?.error || "Failed to fetch AI JD");
    }
  }
}

export const jobPostService = new JobPostService();
export default jobPostService;
