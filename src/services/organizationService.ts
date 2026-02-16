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

export interface Invitation {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED"; // Only relevant statuses
  created_at: string;
  expires_at: string;
  accept_url: string;
  workspace: {
    id: number;
    name: string;
  };
  organization: {
    id: number;
    name: string;
  };
  invited_by: {
    id: string;
    email: string;
    full_name: string;
  };
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

export interface CompanyResearchData {
  vision: string;
  mission: string;
  website: string;
  ceo_name: string;
  currency: string;
  founders: Array<{ name: string; bio: string }>;
  industry: string;
  tech_stack: string[];
  average_pay: number;
  core_values: string[];
  legal_notes: string;
  recent_news: any[];
  company_name: string;
  company_type: string;
  culture_cons: string[];
  culture_pros: string[];
  founded_year: number;
  good_culture: boolean;
  growth_stage: string;
  headquarters: string;
  hiring_trend: string;
  review_count: number;
  salary_range: string;
  major_clients: string[];
  rating_source: string;
  research_date: string;
  annual_revenue: string;
  employee_count: string;
  flexible_hours: boolean;
  founding_story: string;
  future_outlook: string | null;
  overall_rating: number;
  recent_funding: string | null;
  wfh_percentage: string | null;
  culture_summary: string[];
  expansion_plans: any[];
  market_position: string;
  remote_friendly: boolean;
  strategic_goals: string[];
  company_overview: string;
  work_arrangement: string;
  core_competencies: string[];
  growth_highlights: string[];
  industries_served: string[];
  management_rating: number;
  value_proposition: string;
  turnover_indicator: string | null;
  benefits_highlights: any[];
  compensation_rating: string | null;
  job_security_rating: number;
  key_differentiators: string[];
  median_tenure_years: string | null;
  career_growth_rating: number;
  employer_brand_score: string;
  industry_regulations: string[];
  awards_certifications: string[];
  key_products_services: string[];
  regulatory_frameworks: string[];
  data_privacy_practices: string;
  strategic_partnerships: string[];
  recommend_to_friend_pct: string | null;
  work_life_balance_rating: number;
  compliance_certifications: string[];
  work_life_balance_summary: string;
  flexibility_policy_details: string;
}

export interface MyWorkspace {
  id: number;
  name: string;
  organization: number;
  member_count: number;
  created_by: string;
  user_role: string;
  company_research_data?: CompanyResearchData;
}

export interface DiscoverWorkspace {
  id: number;
  name: string;
  organization: number;
  member_count: number;
  created_by: string | null;
  join_request_status: string;
}

export interface PendingJoinRequest {
  id: number;
  workspace_id: number;
  workspace_name: string;
  recruiter: {
    id: string;
    full_name: string;
    email: string;
  };
  status: string;
  created_at: string;
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

  async sendWorkspaceInvites(
    workspaceId: number,
    emails: string[]
  ): Promise<any> {
    try {
      const response = await apiClient.post(
        `/organization/workspaces/${workspaceId}/invites/`,
        { emails }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to send workspace invites"
      );
    }
  }

  async claimWorkspaceInvite(token: string): Promise<any> {
    try {
      const response = await apiClient.post("/organization/workspaces/invites/claim/", { token });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to claim workspace invite");
    }
  }

  async getInvitations(): Promise<Invitation[]> {
    try {
      const response = await apiClient.get("/organization/workspaces/invites/");
      return response.data.invitations || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch invitations"
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
    userId: string,
    organizationId: number
  ): Promise<JoinRequestResponse> {
    try {
      const response = await apiClient.post(
        `organization/${organizationId}/workspaces/${workspaceId}/join-request/`,
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

  async getPendingJoinRequests(): Promise<PendingJoinRequest[]> {
    try {
      const response = await apiClient.get("/organization/requests/pending/");
      return response.data.filter((req: any) => req.status === "PENDING");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch pending join requests"
      );
    }
  }
  async getCompanyResearchData(workspaceId: number): Promise<CompanyResearchData> {
    try {
      const response = await apiClient.get(
        `/organization/workspaces/${workspaceId}/company-research/`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch company research data"
      );
    }
  }
}

export const organizationService = new OrganizationService();
export default organizationService;
