const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.nxthyre.com";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("authToken");

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "An error occurred" }));
      return { error: errorData.detail || errorData.error || "Request failed" };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error" };
  }
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  organization_name: string | null;
  is_active: boolean;
  is_staff: boolean;
  last_login: string | null;
  created_at: string;
  credit_balance: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Organization {
  id: number;
  name: string;
  domain: string;
  created_at: string;
  workspace_count: number;
  member_count: number;
}

export interface JobStage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
}

export interface Job {
  id: number;
  title: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  posted_by_name: string;
  workspace_name: string;
  department_name: string | null;
  location: string[];
  work_approach: string;
  seniority: string;
  experience_min_years: number | null;
  experience_max_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_confidential: boolean;
  stages: JobStage[];
}

export interface OrganizationJobsResponse {
  organization: {
    id: number;
    name: string;
    domain: string;
    admin: {
      name: string | null;
      email: string | null;
    } | null;
  };
  jobs: Job[];
  total_jobs: number;
}

export const superAdminApi = {
  users: {
    list: (page: number = 1) =>
      fetchWithAuth<PaginatedResponse<User>>(
        `/api/superadmin/users/?page=${page}`
      ),

    get: (id: string) => fetchWithAuth<User>(`/api/superadmin/users/${id}/`),

    update: (id: string, data: Partial<Pick<User, "full_name" | "is_staff">>) =>
      fetchWithAuth<User>(`/api/superadmin/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, is_active: boolean) =>
      fetchWithAuth<User>(`/api/superadmin/users/${id}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
  },

  credits: {
    adjust: (recruiter_id: string, amount: number, notes: string) =>
      fetchWithAuth<{
        message: string;
        recruiter_id: string;
        new_balance: number;
      }>("/api/superadmin/credits/adjust/", {
        method: "POST",
        body: JSON.stringify({ recruiter_id, amount, notes }),
      }),
  },

  organizations: {
    list: (page: number = 1) =>
      fetchWithAuth<PaginatedResponse<Organization>>(
        `/api/superadmin/organizations/?page=${page}`
      ),

    get: (id: number) =>
      fetchWithAuth<Organization>(`/api/superadmin/organizations/${id}/`),

    getJobs: (params: { org_id?: number; email_id?: string }) => {
      const query = params.org_id
        ? `org_id=${params.org_id}`
        : `email_id=${params.email_id}`;
      return fetchWithAuth<OrganizationJobsResponse>(
        `/api/superadmin/organization/jobs/?${query}`
      );
    },
  },
};
