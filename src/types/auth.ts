export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'team' | 'owner';
  organizationId?: string;
  workspaceIds: string[];
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
  workspaceId: string;
  status: 'pending' | 'approved' | 'rejected';
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