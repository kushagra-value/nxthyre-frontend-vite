// Mock database with local storage support
let users: User[] = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@admin.com',
    role: 'admin',
    organizationId: '1',
    workspaceIds: ['1', '2'],
    isVerified: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    fullName: 'Team Member',
    email: 'team@team.com',
    role: 'team',
    organizationId: '1',
    workspaceIds: ['1'],
    isVerified: true,
    createdAt: '2024-01-02'
  }
];

export let organizations: Organization[] = [
  {
    id: '1',
    name: 'NxtHyre Technologies',
    domain: 'admin.com',
    ownerId: '1',
    industry: 'Technology',
    companySize: '51-200 employees',
    website: 'https://nxthyre.com',
    description: 'AI-powered recruitment platform',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Tech Solutions Inc',
    domain: 'team.com',
    ownerId: '2',
    industry: 'Technology',
    companySize: '11-50 employees',
    website: 'https://techsolutions.com',
    description: 'Software development company',
    createdAt: '2024-01-03'
  }
];

export let workspaces: Workspace[] = [
  {
    id: '1',
    name: 'HR Department',
    organizationId: '1',
    ownerId: '1',
    members: ['1', '2'],
    pendingRequests: [],
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Engineering Team',
    organizationId: '1',
    ownerId: '1',
    members: ['1'],
    pendingRequests: [],
    createdAt: '2024-01-02'
  }
];

export const joinRequests: JoinRequest[] = [];

// Local storage helpers
const USERS_KEY = 'nxthyre_users';
const ORGS_KEY = 'nxthyre_organizations';
const WORKSPACES_KEY = 'nxthyre_workspaces';

// Load data from localStorage
const loadFromStorage = () => {
  try {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }
    
    const storedOrgs = localStorage.getItem(ORGS_KEY);
    if (storedOrgs) {
      const customOrgs = JSON.parse(storedOrgs);
      organizations = [...organizations, ...customOrgs];
    }
    
    const storedWorkspaces = localStorage.getItem(WORKSPACES_KEY);
    if (storedWorkspaces) {
      const customWorkspaces = JSON.parse(storedWorkspaces);
      workspaces = [...workspaces, ...customWorkspaces];
    }
  } catch (error) {
    console.error('Error loading data from storage:', error);
  }
};

// Save data to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
};

const saveOrganizationsToStorage = (customOrgs: Organization[]) => {
  try {
    localStorage.setItem(ORGS_KEY, JSON.stringify(customOrgs));
  } catch (error) {
    console.error('Error saving organizations to storage:', error);
  }
};

const saveWorkspacesToStorage = (customWorkspaces: Workspace[]) => {
  try {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(customWorkspaces));
  } catch (error) {
    console.error('Error saving workspaces to storage:', error);
  }
};

// Initialize data
loadFromStorage();

// Auth functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const findOrganizationByDomain = (domain: string): Organization | undefined => {
  return organizations.find(org => org.domain === domain);
};

export const getEmailDomain = (email: string): string => {
  return email.split('@')[1] || '';
};

export const authenticateUser = (email: string, password: string): User | null => {
  const user = users.find(u => u.email === email);
  if (user && password === 'admin') {
    return user;
  }
  return null;
};

export const verifyOTP = (otp: string): boolean => {
  return otp === '543210';
};

export const createUser = (userData: any): User => {
  const newUser: User = {
    id: Date.now().toString(),
    fullName: userData.fullName,
    email: userData.email,
    role: 'team',
    organizationId: undefined,
    workspaceIds: [],
    isVerified: true,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveToStorage();
  return newUser;
};

export const createOrganization = (orgData: any, userId: string): Organization => {
  const newOrg: Organization = {
    id: Date.now().toString(),
    name: orgData.name,
    domain: orgData.domain || getEmailDomain(orgData.email || ''),
    ownerId: userId,
    industry: orgData.industry,
    companySize: orgData.companySize,
    website: orgData.website,
    description: orgData.description,
    createdAt: new Date().toISOString()
  };
  
  // Get existing custom organizations from localStorage
  const existingCustomOrgs = JSON.parse(localStorage.getItem(ORGS_KEY) || '[]');
  existingCustomOrgs.push(newOrg);
  saveOrganizationsToStorage(existingCustomOrgs);
  
  // Update in-memory organizations array
  organizations.push(newOrg);
  
  // Update user with organization
  const user = users.find(u => u.id === userId);
  if (user) {
    user.organizationId = newOrg.id;
    saveToStorage();
  }
  
  return newOrg;
};

export const updateOrganization = (orgId: string, updates: Partial<Organization>): Organization | null => {
  const orgIndex = organizations.findIndex(org => org.id === orgId);
  if (orgIndex !== -1) {
    organizations[orgIndex] = { ...organizations[orgIndex], ...updates };
    
    // Update localStorage
    const customOrgs = JSON.parse(localStorage.getItem(ORGS_KEY) || '[]');
    const customOrgIndex = customOrgs.findIndex((org: Organization) => org.id === orgId);
    if (customOrgIndex !== -1) {
      customOrgs[customOrgIndex] = { ...customOrgs[customOrgIndex], ...updates };
      saveOrganizationsToStorage(customOrgs);
    }
    
    return organizations[orgIndex];
  }
  return null;
};

export const deleteOrganization = (orgId: string): boolean => {
  try {
    // Remove from in-memory array
    const orgIndex = organizations.findIndex(org => org.id === orgId);
    if (orgIndex !== -1) {
      organizations.splice(orgIndex, 1);
    }
    
    // Remove from localStorage
    const customOrgs = JSON.parse(localStorage.getItem(ORGS_KEY) || '[]');
    const filteredOrgs = customOrgs.filter((org: Organization) => org.id !== orgId);
    saveOrganizationsToStorage(filteredOrgs);
    
    // Update users who belonged to this organization
    users.forEach(user => {
      if (user.organizationId === orgId) {
        user.organizationId = undefined;
      }
    });
    saveToStorage();
    
    // Remove workspaces belonging to this organization
    const workspacesToRemove = workspaces.filter(ws => ws.organizationId === orgId);
    workspacesToRemove.forEach(ws => deleteWorkspace(ws.id));
    
    return true;
  } catch (error) {
    console.error('Error deleting organization:', error);
    return false;
  }
};

export const createWorkspace = (workspaceData: any, userId: string, organizationId: string): Workspace => {
  const newWorkspace: Workspace = {
    id: Date.now().toString(),
    name: workspaceData.name,
    organizationId: organizationId,
    ownerId: userId,
    members: [userId],
    pendingRequests: [],
    createdAt: new Date().toISOString()
  };
  
  // Get existing custom workspaces from localStorage
  const existingCustomWorkspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
  existingCustomWorkspaces.push(newWorkspace);
  saveWorkspacesToStorage(existingCustomWorkspaces);
  
  // Update in-memory workspaces array
  workspaces.push(newWorkspace);
  
  // Update user with workspace
  const user = users.find(u => u.id === userId);
  if (user) {
    user.workspaceIds.push(newWorkspace.id);
    saveToStorage();
  }
  
  return newWorkspace;
};

export const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>): Workspace | null => {
  const workspaceIndex = workspaces.findIndex(ws => ws.id === workspaceId);
  if (workspaceIndex !== -1) {
    workspaces[workspaceIndex] = { ...workspaces[workspaceIndex], ...updates };
    
    // Update localStorage
    const customWorkspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    const customWorkspaceIndex = customWorkspaces.findIndex((ws: Workspace) => ws.id === workspaceId);
    if (customWorkspaceIndex !== -1) {
      customWorkspaces[customWorkspaceIndex] = { ...customWorkspaces[customWorkspaceIndex], ...updates };
      saveWorkspacesToStorage(customWorkspaces);
    }
    
    return workspaces[workspaceIndex];
  }
  return null;
};

export const deleteWorkspace = (workspaceId: string): boolean => {
  try {
    // Remove from in-memory array
    const workspaceIndex = workspaces.findIndex(ws => ws.id === workspaceId);
    if (workspaceIndex !== -1) {
      workspaces.splice(workspaceIndex, 1);
    }
    
    // Remove from localStorage
    const customWorkspaces = JSON.parse(localStorage.getItem(WORKSPACES_KEY) || '[]');
    const filteredWorkspaces = customWorkspaces.filter((ws: Workspace) => ws.id !== workspaceId);
    saveWorkspacesToStorage(filteredWorkspaces);
    
    // Update users who belonged to this workspace
    users.forEach(user => {
      user.workspaceIds = user.workspaceIds.filter(id => id !== workspaceId);
    });
    saveToStorage();
    
    return true;
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return false;
  }
};

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveToStorage();
    return users[userIndex];
  }
  return null;
};

// Export current data
export { users };

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
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
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