// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface JobStatCard {
    id: string;
    label: string;
    value: string | number;
    trend?: string;
    trendColor?: 'green' | 'red';
    subText?: string;
}

export interface JobPipelineCounts {
    sourced: number;
    screened: number;
    interview: number;
    hired: number;
    /** Which stage to highlight (0-based index: 0=sourced, 1=screened, 2=interview, 3=hired) */
    highlightStage?: number;
}

export interface JobTableRow {
    id: string;
    jobId: number;
    title: string;
    code: string;
    type: string;       // Full-time, Contract
    locationType: string; // Remote, Bengaluru, London
    company: string;
    pipeline: JobPipelineCounts;
    daysOpen: number;
    status: 'Active' | 'Paused' | 'Closed';
}

export interface AIAutopilotItem {
    id: string;
    role: string;
    company: string;
    description: string;
    actionLabel: string;
    actionType: 'approve' | 'review' | 'auto';
    iconColor: 'red' | 'amber' | 'blue';
}

export interface JobRecentActivity {
    id: string;
    index: number;
    role: string;
    company: string;
    description: string;
    addedBy: string;
    timeAgo: string;
}

// ──────────────────────────────────────────────
//  Stat Cards
// ──────────────────────────────────────────────

export const jobStatCards: JobStatCard[] = [
    {
        id: 'js-1',
        label: 'Total Jobs',
        value: '128',
        trend: '+12%',
        trendColor: 'green',
    },
    {
        id: 'js-2',
        label: 'Active Jobs',
        value: '42',
        trend: '-2%',
        trendColor: 'red',
    },
    {
        id: 'js-3',
        label: 'Candidates',
        value: '1,240',
        trend: '+5%',
        trendColor: 'green',
    },
    {
        id: 'js-4',
        label: 'Interviews',
        value: '18',
        trend: '+20%',
        trendColor: 'green',
    },
    {
        id: 'js-5',
        label: 'Immediate Actions',
        value: 7,
        subText: 'Attention needed',
    },
];

// ──────────────────────────────────────────────
//  Jobs Table
// ──────────────────────────────────────────────

export const jobTableRows: JobTableRow[] = [
    {
        id: 'jt-1',
        jobId: 101,
        title: 'Senior Frontend Developer',
        code: 'JD-101',
        type: 'Full-time',
        locationType: 'Remote',
        company: 'TechFlow Systems',
        pipeline: { sourced: 12, screened: 4, interview: 3, hired: 0, highlightStage: 2 },
        daysOpen: 14,
        status: 'Active',
    },
    {
        id: 'jt-2',
        jobId: 102,
        title: 'Product Designer',
        code: 'JD-102',
        type: 'Full-time',
        locationType: 'Bengaluru',
        company: 'Creative Hub',
        pipeline: { sourced: 25, screened: 8, interview: 2, hired: 0 },
        daysOpen: 8,
        status: 'Active',
    },
    {
        id: 'jt-3',
        jobId: 103,
        title: 'Marketing Manager',
        code: 'JD-103',
        type: 'Contract',
        locationType: 'London',
        company: 'Growth Catalyst',
        pipeline: { sourced: 18, screened: 6, interview: 4, hired: 1, highlightStage: 3 },
        daysOpen: 21,
        status: 'Paused',
    },
    {
        id: 'jt-4',
        jobId: 104,
        title: 'Backend Engineer',
        code: 'JD-104',
        type: 'Full-time',
        locationType: 'Remote',
        company: 'MedCore Solutions',
        pipeline: { sourced: 30, screened: 10, interview: 5, hired: 2, highlightStage: 3 },
        daysOpen: 35,
        status: 'Active',
    },
    {
        id: 'jt-5',
        jobId: 105,
        title: 'Data Analyst',
        code: 'JD-105',
        type: 'Full-time',
        locationType: 'Bengaluru',
        company: 'Acme Technologies',
        pipeline: { sourced: 15, screened: 7, interview: 3, hired: 0, highlightStage: 2 },
        daysOpen: 10,
        status: 'Active',
    },
    {
        id: 'jt-6',
        jobId: 106,
        title: 'ML Engineer',
        code: 'JD-106',
        type: 'Full-time',
        locationType: 'Remote',
        company: 'RocketGrowth Inc',
        pipeline: { sourced: 20, screened: 9, interview: 4, hired: 0, highlightStage: 2 },
        daysOpen: 46,
        status: 'Active',
    },
    {
        id: 'jt-7',
        jobId: 107,
        title: 'Sales Director',
        code: 'JD-107',
        type: 'Contract',
        locationType: 'Remote',
        company: 'FinServe',
        pipeline: { sourced: 8, screened: 3, interview: 1, hired: 0, highlightStage: 0 },
        daysOpen: 46,
        status: 'Paused',
    },
    {
        id: 'jt-8',
        jobId: 108,
        title: 'DevOps Engineer',
        code: 'JD-108',
        type: 'Full-time',
        locationType: 'Remote',
        company: 'CloudNine Infra',
        pipeline: { sourced: 22, screened: 11, interview: 6, hired: 1, highlightStage: 3 },
        daysOpen: 28,
        status: 'Closed',
    },
];

// ──────────────────────────────────────────────
//  AI Autopilot
// ──────────────────────────────────────────────

export const aiAutopilotItems: AIAutopilotItem[] = [
    {
        id: 'ai-1',
        role: 'Senior Product Designer',
        company: 'Acme',
        description: 'Found 6 new candidates matching 80%+ criteria. Autopilot has drafted outreach.',
        actionLabel: 'Approve & Send',
        actionType: 'approve',
        iconColor: 'red',
    },
    {
        id: 'ai-2',
        role: 'Sales Director',
        company: 'FinServe',
        description: 'Job has been open 46 days with no hire. Suggest loosening experience requirement from 10yr → 7yr.',
        actionLabel: 'Review suggestion →',
        actionType: 'review',
        iconColor: 'amber',
    },
    {
        id: 'ai-3',
        role: 'ML Engineer',
        company: 'RocketGrowth',
        description: '2 candidates went silent after round 1. Autopilot scheduled a follow-up for tomorrow 10am.',
        actionLabel: 'Let Autopilot handle',
        actionType: 'auto',
        iconColor: 'blue',
    },
];

// ──────────────────────────────────────────────
//  Recent Activities
// ──────────────────────────────────────────────

export const jobRecentActivities: JobRecentActivity[] = [
    {
        id: 'ra-1',
        index: 1,
        role: 'Senior Product Designer',
        company: 'Acme Technologies',
        description: 'Push 3 final-stage candidates to offer this week — client deadline Friday.',
        addedBy: 'Added by you',
        timeAgo: '1 day ago',
    },
    {
        id: 'ra-2',
        index: 2,
        role: 'ML Engineer',
        company: 'RocketGrowth Inc',
        description: 'Review and shortlist 9 AI-suggested candidates before EOD.',
        addedBy: 'AI suggested',
        timeAgo: 'Today',
    },
    {
        id: 'ra-3',
        index: 3,
        role: 'Backend Engineer',
        company: 'MedCore Solutions',
        description: 'Offer expires tomorrow — follow up with candidate immediately.',
        addedBy: 'AI suggested',
        timeAgo: 'Today',
    },
];
