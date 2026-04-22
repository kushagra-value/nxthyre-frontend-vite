import apiClient from "./api";

// ── Request Types ──

export interface V1SearchFilters {
  location?: string[];
  clientIds?: number[];
  experience?: {
    min?: number;
    max?: number;
  };
  jobIds?: number[];
  noticePeriod?: {
    selected?: string[];
    minDays?: number;
    maxDays?: number;
  };
  dateCreated?: {
    type?: string;
    from?: string;
    to?: string;
  };
  source?: string[];
}

export interface V1SearchRequest {
  searchQuery?: string;
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort_by?: string;
  date_range?: {
    uploaded_after?: string;
    uploaded_before?: string;
  };
  filters?: V1SearchFilters;
}

export interface V1MoveToPipelineRequest {
  candidate_ids: string[];
  target_stage_id: number;
}

export interface V1ExportRequest {
  format: "csv" | "xlsx";
  candidate_ids?: string[];
  search_payload?: V1SearchRequest;
}

// ── Response Types ──

export interface V1Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  location: string;
  experience: number | null;
  jobRole: {
    id: number | null;
    title: string;
  };
  client: {
    id: number | null;
    name: string;
    logoUrl: string;
  };
  noticePeriod: string;
  source: string | null;
  statusTags: any[];
  dateCreated: string;
  // NEW: actual designation from candidate's experience profile
  designation: string | null;
  // NEW: actual current company from candidate's experience profile
  currentCompany: string | null;
  // NEW: current CTC formatted (e.g. "18.5L")
  currentCtc: string | null;
  // NEW: expected CTC formatted (e.g. "25-35L")
  expectedCtc: string | null;
  // NEW: "Available" or "Occupied"
  status: string;
  // NEW: pipeline info when status is Occupied
  pipelineInfo: {
    companyName: string;
    jobTitle: string;
  } | null;
}

export interface V1SearchResponse {
  status: string;
  data: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    candidates: V1Candidate[];
  };
}

export interface V1Workspace {
  id: number;
  name: string;
  website: string;
}

export interface V1Job {
  id: number;
  title: string;
  job_id: string;
}

export interface V1MoveToPipelineResponse {
  message: string;
  added_count: number;
  skipped_count: number;
}

// ── Stats Types ──

export interface V1CandidateStats {
  totalCandidates: number;
  totalCandidatesChange: string;
  totalCandidatesChangeText: string;
  totalHired: number;
  totalHiredChange: string;
  totalHiredChangeText: string;
  viaNaukbot: number;
  viaNaukbotChange: string;
  viaNaukbotChangeText: string;
  manualUploads: number;
  manualUploadsChange: string;
  manualUploadsChangeText: string;
  others: number;
  othersChange: string;
  othersChangeText: string;
}

// ── Share Types ──

export interface V1ShareRequest {
  candidate_ids: string[];
}

export interface V1ShareResponse {
  message: string;
  count: number;
  data: {
    candidate_id: string;
    share_url: string;
  }[];
}

// ── Service ──

class CandidateSearchService {
  /**
   * POST /v1/candidates/search/
   */
  async searchCandidates(body: V1SearchRequest): Promise<V1SearchResponse> {
    try {
      const response = await apiClient.post("/v1/candidates/search/", body);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to search candidates"
      );
    }
  }

  /**
   * GET /v1/locations/suggestions/?query=
   */
  async getLocationSuggestions(query?: string): Promise<string[]> {
    try {
      const params = query ? { query } : {};
      const response = await apiClient.get("/v1/locations/suggestions/", {
        params,
      });
      return response.data?.data || [];
    } catch (error: any) {
      console.error("Error fetching v1 location suggestions:", error);
      return [];
    }
  }

  /**
   * GET /v1/workspaces/my-workspaces/
   */
  async getWorkspaces(): Promise<V1Workspace[]> {
    try {
      const response = await apiClient.get("/v1/workspaces/my-workspaces/");
      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to fetch workspaces"
      );
    }
  }

  /**
   * GET /v1/jobs/
   */
  async getJobs(): Promise<V1Job[]> {
    try {
      const response = await apiClient.get("/v1/jobs/");
      return response.data?.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to fetch jobs"
      );
    }
  }

  /**
   * POST /v1/pipelines/job/{job_id}/candidates/
   */
  async moveToPipeline(
    jobId: number,
    body: V1MoveToPipelineRequest
  ): Promise<V1MoveToPipelineResponse> {
    try {
      const response = await apiClient.post(
        `/v1/pipelines/job/${jobId}/candidates/`,
        body
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to move candidates to pipeline"
      );
    }
  }

  /**
   * POST /v1/candidates/export/
   * Returns blob for file download.
   */
  async exportCandidates(body: V1ExportRequest): Promise<void> {
    try {
      const response = await apiClient.post("/v1/candidates/export/", body, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "";
      const ext = body.format === "xlsx" ? "xlsx" : "csv";
      const filename = `candidates_export.${ext}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to extract filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          link.setAttribute("download", match[1]);
        } else {
          link.setAttribute("download", filename);
        }
      } else {
        link.setAttribute("download", filename);
      }

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to export candidates"
      );
    }
  }

  /**
   * GET /v1/candidates/stats/
   * Returns stat card metrics for CandidateSearch header.
   */
  async getCandidateStats(): Promise<V1CandidateStats> {
    try {
      const response = await apiClient.get("/v1/candidates/stats/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to fetch candidate stats"
      );
    }
  }

  /**
   * POST /v1/candidates/share/
   * Bulk share candidate profiles.
   */
  async shareCandidates(body: V1ShareRequest): Promise<V1ShareResponse> {
    try {
      const response = await apiClient.post("/v1/candidates/share/", body);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Failed to share candidates"
      );
    }
  }
}

export const candidateSearchService = new CandidateSearchService();
export default candidateSearchService;
