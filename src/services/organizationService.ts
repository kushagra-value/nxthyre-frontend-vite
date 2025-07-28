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

export interface Organization {
  id: number;
  name: string;
  domain: string | null;
  ownerId: string;
  createdAt: string;
}

export interface Workspace {
  id: number;
  name: string;
  organizationId: number;
  ownerId: string;
  members: string[];
  createdAt: string;
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

export interface MyWorkspace {
  id: number;
  name: string;
  organization: number;
  member_count: number;
  created_by: string;
  user_role: string;
}

export interface DiscoverWorkspace {
  id: number;
  name: string;
  organization: number;
  member_count: number;
  created_by: string | null;
  join_request_status: string;
}

class OrganizationService {
  // Get onboarding status...
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

  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiClient.get("/organization/all/");
      return response.data.map((org: any) => ({
        id: org.id,
        name: org.name,
        domain: org.domain || null,
        ownerId: org.ownerId || "",
        createdAt: org.createdAt || new Date().toISOString(),
      }));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch organizations"
      );
    }
  }

  // async getWorkspaces(organizationId: number): Promise<Workspace[]> {
  //   try {
  //     const response = await apiClient.get(
  //       `/organization/${organizationId}/workspaces/`
  //     );
  //     return response.data.map((ws: any) => ({
  //       id: ws.id,
  //       name: ws.name,
  //       organizationId: ws.organizationId,
  //       ownerId: ws.ownerId || "",
  //       members: ws.members || [],
  //       createdAt: ws.createdAt || new Date().toISOString(),
  //     }));
  //   } catch (error: any) {
  //     throw new Error(
  //       error.response?.data?.error || "Failed to fetch workspaces"
  //     );
  //   }
  // }

  // Create organization
  async createOrganization(name: string): Promise<CreateOrganizationResponse> {
    try {
      const response = await apiClient.post("/organization/create/", {
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
        `/organization/${organizationId}/workspaces/create/`,
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

  async getMyWorkspaces(): Promise<MyWorkspace[]> {
    try {
      const response = await apiClient.get("/organization/my-workspaces/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch my workspaces"
      );
    }
  }

  async getDiscoverWorkspaces(): Promise<DiscoverWorkspace[]> {
    try {
      const response = await apiClient.get(
        "/organization/discover-workspaces/"
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch discover workspaces"
      );
    }
  }

  // Request to join workspace
  async requestJoinWorkspace(
    workspaceId: number,
    userId?: string
  ): Promise<JoinRequestResponse> {
    try {
      const response = await apiClient.post(
        `organization/workspaces/${workspaceId}/join-request/`,
        userId ? { userId } : {}
      );
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
        `/organization/${organizationId}/workspaces/${workspaceId}/requests/${requestId}/manage/`,
        { action }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to manage join request"
      );
    }
  }

  async getPendingJoinRequests(
    organizationId: number,
    workspaceId: number
  ): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/organization/${organizationId}/workspaces/${workspaceId}/join-request/`
      );
      return response.data.filter((req: any) => req.status === "PENDING");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch pending join requests"
      );
    }
  }
}

export const organizationService = new OrganizationService();
export default organizationService;
