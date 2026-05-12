// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface CompanyStatCard {
    id: string;
    label: string;
    value: string | number;
    trend?: string;
    trendColor?: 'green' | 'red';
    subText?: string;
}

export interface CompanyTableRow {
    id: string;
    workspaceId: number;
    name: string;
    domain: string;
    totalJobs: number | string;
    activeJobs?: number | string;
    createdDate?: string;
    totalCandidates: number | string;
    shortlisted: number | string;
    shortlistedTrend?: string;
    hired: number | string;
    hiredTrend?: string;
    lastActiveDate: string;
    status: 'Active' | 'Paused' | 'Inactive';
    createdBy?: string;
}

export interface CompanyAIAutopilotItem {
    id: string;
    companyName: string;
    description: string;
    actionLabel: string;
    actionType: 'approve' | 'review' | 'auto';
    iconColor: 'red' | 'amber' | 'blue';
}

export interface CompanyRecentActivity {
    id: string;
    index: number;
    companyName: string;
    description: string;
    addedBy: string;
    timeAgo: string;
}

// ──────────────────────────────────────────────
//  Stat Cards
// ──────────────────────────────────────────────

export const companyStatCards: CompanyStatCard[] = [

];

// ──────────────────────────────────────────────
//  Companies Table (Dummy Data)
// ──────────────────────────────────────────────

export const companyTableRows: CompanyTableRow[] = [

];

// ──────────────────────────────────────────────
//  AI Autopilot
// ──────────────────────────────────────────────

export const companyAiAutopilotItems: CompanyAIAutopilotItem[] = [

];

// ──────────────────────────────────────────────
//  Recent Activities (Timeline)
// ──────────────────────────────────────────────

export const companyRecentActivities: CompanyRecentActivity[] = [

];
