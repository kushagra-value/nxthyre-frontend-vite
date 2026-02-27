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
    totalJobs: number;
    totalCandidates: number;
    shortlisted: number;
    hired: number;
    status: 'Active' | 'Paused' | 'Inactive';
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
    {
        id: 'cs-1',
        label: 'Total Companies',
        value: '42',
        trend: '+8%',
        trendColor: 'green',
    },
    {
        id: 'cs-2',
        label: 'Active Companies',
        value: '25',
        trend: '+12%',
        trendColor: 'green',
    },
    {
        id: 'cs-3',
        label: 'Total Open Jobs',
        value: '138',
        trend: '-5%',
        trendColor: 'red',
    },
    {
        id: 'cs-4',
        label: 'Immediate Actions',
        value: '6',
        subText: '5 pending',
    },
];

// ──────────────────────────────────────────────
//  Companies Table (Dummy Data)
// ──────────────────────────────────────────────

export const companyTableRows: CompanyTableRow[] = [
    {
        id: 'ct-1',
        workspaceId: 101,
        name: 'Acme Technologies',
        domain: 'acme.com',
        totalJobs: 14,
        totalCandidates: 87,
        shortlisted: 24,
        hired: 9,
        status: 'Active',
    },
    {
        id: 'ct-2',
        workspaceId: 102,
        name: 'RocketGrowth Inc',
        domain: 'rocketgrowth.ai',
        totalJobs: 21,
        totalCandidates: 112,
        shortlisted: 38,
        hired: 15,
        status: 'Active',
    },
    {
        id: 'ct-3',
        workspaceId: 103,
        name: 'FinServe Global',
        domain: 'finserve.io',
        totalJobs: 8,
        totalCandidates: 43,
        shortlisted: 11,
        hired: 4,
        status: 'Active',
    },
    {
        id: 'ct-4',
        workspaceId: 104,
        name: 'MedCore Solutions',
        domain: 'medcore.co',
        totalJobs: 5,
        totalCandidates: 29,
        shortlisted: 7,
        hired: 2,
        status: 'Paused',
    },
    {
        id: 'ct-5',
        workspaceId: 105,
        name: 'BuildCore Ltd',
        domain: 'buildcore.in',
        totalJobs: 3,
        totalCandidates: 11,
        shortlisted: 2,
        hired: 0,
        status: 'Inactive',
    },
];

// ──────────────────────────────────────────────
//  AI Autopilot
// ──────────────────────────────────────────────

export const companyAiAutopilotItems: CompanyAIAutopilotItem[] = [
    {
        id: 'cai-1',
        companyName: 'Acme Technologies',
        description: 'Priya Sharma (85% match) hasn\'t been contacted for JD-112. Autopilot can send outreach now.',
        actionLabel: 'Approve outreach',
        actionType: 'approve',
        iconColor: 'red',
    },
    {
        id: 'cai-2',
        companyName: 'RocketGrowth Inc',
        description: 'Round 2 for Rahul Verma has no scheduled slot. Move to hired or drop?',
        actionLabel: 'Take action →',
        actionType: 'review',
        iconColor: 'amber',
    },
    {
        id: 'cai-3',
        companyName: 'FinServe Global',
        description: '3 candidates haven\'t responded to follow-up. Autopilot re-engages in 24 hrs.',
        actionLabel: 'Let Autopilot handle',
        actionType: 'auto',
        iconColor: 'blue',
    },
];

// ──────────────────────────────────────────────
//  Recent Activities (Timeline)
// ──────────────────────────────────────────────

export const companyRecentActivities: CompanyRecentActivity[] = [
    {
        id: 'cra-1',
        index: 1,
        companyName: 'Acme Technologies',
        description: 'Close Senior Dev role — 3 candidates in final stage, push to offer.',
        addedBy: 'Added by you',
        timeAgo: '2 days ago',
    },
    {
        id: 'cra-2',
        index: 2,
        companyName: 'RocketGrowth Inc',
        description: 'Review 12 AI-suggested candidates for ML Engineer role.',
        addedBy: 'AI suggested',
        timeAgo: 'Today',
    },
    {
        id: 'cra-3',
        index: 3,
        companyName: 'MedCore Solutions',
        description: 'Client check-in needed — no update in 2 weeks.',
        addedBy: 'Added by you',
        timeAgo: '5 days ago',
    },
    {
        id: 'cra-4',
        index: 4,
        companyName: 'FinServe Global',
        description: 'Sourcing stuck — expand search or lower criteria.',
        addedBy: 'AI suggested',
        timeAgo: 'Yesterday',
    },
];
