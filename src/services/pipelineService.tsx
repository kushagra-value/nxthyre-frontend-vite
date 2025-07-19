import apiClient from "./api";

export interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
}

export interface Application {
  id: number;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  stage_slug: string;
}

export interface ApplicationDetail {
  id: number;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  status: string;
  current_stage: number;
  contextual_details: {
    application_details: {
      applied_date: string;
      resume_score: string;
      skills_match: string;
      experience_match: string;
      resume_highlights: string[];
    };
  };
}

export const pipelineService = {
  getStages: async (jobId: number): Promise<Stage[]> => {
    const response = await apiClient.get(
      `/jobs/applications/stages/?job_id=${jobId}`
    );
    return response.data;
  },

  getApplicationsForStage: async (
    jobId: number,
    stageId: number
  ): Promise<Application[]> => {
    const response = await apiClient.get(
      `/jobs/applications/?job_id=${jobId}&stage_id=${stageId}`
    );
    return response.data.results;
  },

  getApplicationDetails: async (
    applicationId: number
  ): Promise<ApplicationDetail> => {
    const response = await apiClient.get(
      `/jobs/applications/${applicationId}/`
    );
    return response.data;
  },

  updateApplication: async (
    applicationId: number,
    data: {
      current_stage?: number;
      status?: string;
      feedback?: { subject: string; comment: string };
    }
  ): Promise<void> => {
    await apiClient.patch(`/jobs/applications/${applicationId}/`, data);
  },
};
