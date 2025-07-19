import api from "./api"; // Assuming an API client exists for HTTP requests

export interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
}

export interface CandidateListItem {
  id: number; // Application ID
  candidate: {
    id: string; // UUID
    firstName: string;
    lastName: string;
    email: string;
    // Add other fields as per CandidateListCardSerializer if needed
  };
  stage_slug: string;
}

export interface ApplicationDetails {
  id: number;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    // Add other fields as per CandidateDetailSerializer if needed
  };
  status: string;
  current_stage: number;
  contextual_details: {
    [key: string]: any; // Stage-specific data
  };
}

export const getStages = async (jobId: number): Promise<Stage[]> => {
  const response = await api.get(`/jobs/applications/stages/?job_id=${jobId}`);
  return response.data;
};

export const getCandidates = async (
  jobId: number,
  stageId: number
): Promise<CandidateListItem[]> => {
  const response = await api.get(
    `/jobs/applications/?job_id=${jobId}&stage_id=${stageId}`
  );
  return response.data.results;
};

export const getApplicationDetails = async (
  applicationId: number
): Promise<ApplicationDetails> => {
  const response = await api.get(`/jobs/applications/${applicationId}/`);
  return response.data;
};

export const updateApplication = async (
  applicationId: number,
  data: {
    current_stage?: number;
    status?: string;
    feedback?: { subject: string; comment: string };
  }
): Promise<void> => {
  await api.patch(`/jobs/applications/${applicationId}/`, data);
};
