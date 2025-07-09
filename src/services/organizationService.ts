import apiClient from "./api";

export interface OnboardingStatusResponse {
  status: "ONBOARDED" | "NEEDS_ORGANIZATION" | "ORGANIZATION_EXISTS";
  organization?: {
    id: number;
    name: string;
    domain: string;
  };
  domain?: string;
  workspaces?: Array<{
    id: number;
    name: string;
    join_status: "NOT_REQUESTED" | "PENDING" | "APPROVED" | "REJECTED";
  }>;
}

export interface CreateOrganizationResponse {
  status: string;
  message: string;
  id: number;
  name: string;
  domain: string;
}

export interface CreateWorkspaceResponse {
  status: string;
  message: string;
  id: number;
  name: string;
}

export interface JoinRequestResponse {
  status: string;
  request_id?: number;
}

export interface ManageRequestResponse {
  status: string;
}

class OrganizationService {
  // Get onboarding status
  async getOnboardingStatus(): Promise<OnboardingStatusResponse> {
    try {
      const response = await apiClient.get("/organization/onboarding-status/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to get onboarding status"
      );
    }
  }

  // Create organization
  async createOrganization(name: string): Promise<CreateOrganizationResponse> {
    try {
      const response = await apiClient.post("/organizations/create/", {
        name,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to create organization"
      );
    }
  }

  // Create workspace
  async createWorkspace(
    organizationId: number,
    name: string
  ): Promise<CreateWorkspaceResponse> {
    try {
      const response = await apiClient.post(
        `/organizations/${organizationId}/workspaces/create/`,
        {
          name,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to create workspace"
      );
    }
  }

  // Request to join workspace
  async requestJoinWorkspace(
    workspaceId: number
  ): Promise<JoinRequestResponse> {
    try {
      const response = await apiClient.post(`/workspaces/${workspaceId}/join/`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to request workspace join"
      );
    }
  }

  // Withdraw join request
  async withdrawJoinRequest(workspaceId: number): Promise<void> {
    try {
      await apiClient.delete(`/workspaces/${workspaceId}/join/`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to withdraw join request"
      );
    }
  }

  // Manage join request (approve/reject)
  async manageJoinRequest(
    organizationId: number,
    workspaceId: number,
    requestId: number,
    action: "approve" | "reject"
  ): Promise<ManageRequestResponse> {
    try {
      const response = await apiClient.post(
        `/organizations/${organizationId}/workspaces/${workspaceId}/requests/${requestId}/manage/`,
        { action }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to manage join request"
      );
    }
  }
}

export const organizationService = new OrganizationService();
export default organizationService;
