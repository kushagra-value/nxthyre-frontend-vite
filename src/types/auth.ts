export interface User {
  id: string | undefined;
  fullName: string;
  isSuperAdmin?: boolean;
  email: string;
  role: string;
  organizationId?: string | undefined;
  workspaceIds: number[];
  isVerified: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  ownerId: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  organizationId: string;
  ownerId: string;
  members: string[];
  pendingRequests: string[];
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  workspaceId: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentFlow: string;
  otpAttempts: number;
  tempEmail?: string;
  tempPassword?: string;
}
