// ──────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────

export interface StatCardData {
    id: string;
    label: string;
    value: string | number;
    trend?: string;
    trendText?: string;
    dateText?: string;
    iconType: 'briefcase' | 'building' | 'userPlus' | 'clock';
}

export interface PriorityCardData {
    id: string;
    name: string;
    role: string;
    company?: string;
    daysAgo: number;
    status: string;
    statusColor: 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' | 'green';
    isDone?: boolean;
}

export interface PriorityColumnData {
    id: string;
    title: string;
    dotColor: string;
    accentColor: string;
    urgentCount: number;
    totalCount: number;
    cards: PriorityCardData[];
}

export type CandidateSource = 'nxt' | 'naukri' | 'pyjama' | 'external';

export interface TalentMatchData {
    id: string;
    name: string;
    company: string;
    position: string;
    experience: string;
    matchPercentage: number;
    source?: CandidateSource;
}

export interface ScheduleItemData {
    id: string;
    time: string;
    type: string;
    name: string;
    details: string;
    location: string;
    color: 'grey' | 'cyan' | 'purple' | 'orange';
    isDone?: boolean;
}

export interface ActivityItem {
    icon: 'calendar' | 'phone' | 'check';
    text: string;
    time: string;
}

export interface ActivitySection {
    label: string;
    items: ActivityItem[];
}

// Modal candidate types
export interface QuickFitSkill {
    name: string;
    match: boolean;
}

export interface ActionReviewCandidate {
    id: string;
    name: string;
    role: string;
    company: string;
    avatar: string;
    source: string;
    skills: string[];
    quickFitSkills: QuickFitSkill[];
    matchPercentage: number;
    aiSummary: string;
    experience: string;
    noticePeriod: string;
    currentCTC: string;
    expectedCTC: string;
    location: string;
    status: string;
}

export interface NewMatchCandidate {
    id: string;
    name: string;
    role: string;
    company: string;
    avatar: string;
    source: string;
    skills: string[];
    quickFitSkills: QuickFitSkill[];
    matchPercentage: number;
    aiSummary: string;
    experience: string;
    noticePeriod: string;
    currentCTC: string;
    expectedCTC: string;
    location: string;
    matchId?: number;
    jobId?: number;
    /** NaukriBotCandidate UUID — present when source is naukri_bot. Required for Skip and NVite. */
    nbcId?: string;
}

export interface ScheduleEventData {
    id: string;
    title: string;
    candidateName: string;
    interviewType: string;
    date: string;
    timeRange: string;
    timezone: string;
    description: string;
    meetingPlatform: string;
    statusLabel: string;
    recruiterName: string;
    recruiterRole: string;
    recruiterAvatar: string;
    candidateEmail: string;
    candidatePhone: string;
    candidateCompany?: string;
    candidatePosition?: string;
    candidateExperience?: string;
    duration?: string;
    interviewer?: string;
    jobRole?: string;
}

export interface AgendaItem {
    id: string;
    time: string;
    duration: string;
    candidateName: string;
    candidateRole: string;
    roundType: string;
    status: 'completed' | 'in-progress' | 'upcoming';
    avatar?: string;
}

export interface AgendaAlert {
    id: string;
    type: 'soon' | 'completed';
    candidateName: string;
    label: string;
}

export interface LiveStatusData {
    interviewerName: string;
    candidateName: string;
    roundType: string;
    elapsed: string;
    interviewerAvatar: string;
}

export interface DailyAgendaData {
    date: string;
    liveStatus: LiveStatusData | null;
    alerts: AgendaAlert[];
    items: AgendaItem[];
}

// ──────────────────────────────────────────────
//  Stat Cards
// ──────────────────────────────────────────────

export const statCardsData: StatCardData[] = [
    {
        id: 'stat-1',
        iconType: 'briefcase',
        label: 'Active Jobs',
        value: '68',
        trend: '10%',
        trendText: 'vs last month',
    },
    {
        id: 'stat-2',
        iconType: 'building',
        label: 'Active Companies',
        value: '25',
        trend: '10%',
        trendText: 'vs last month',
    },
    {
        id: 'stat-3',
        iconType: 'userPlus',
        label: 'Hired Candidates',
        value: '4',
        trend: '10%',
        trendText: 'vs last month',
    },
    {
        id: 'stat-4',
        iconType: 'clock',
        label: 'Autopilot Saved Time',
        value: '3',
        dateText: 'Days',
        trend: '10%',
        trendText: 'vs last month',
    },
];

// ──────────────────────────────────────────────
//  Priority Actions
// ──────────────────────────────────────────────

export const priorityColumnsData: PriorityColumnData[] = [
    {
        id: 'col-sourcing',
        title: 'Sourcing',
        dotColor: '#6155F5',
        accentColor: '#6155F5',
        urgentCount: 1,
        totalCount: 4,
        cards: [
            {
                id: 'pc-1',
                name: 'Dwija Patel',
                role: 'Senior Product Designer',
                daysAgo: 4,
                status: 'Follow up required',
                statusColor: 'blue',
            },
            {
                id: 'pc-2',
                name: 'Ana De Armas',
                role: 'Product Manager',
                daysAgo: 4,
                status: 'Outreach Required',
                statusColor: 'blue',
            },
            {
                id: 'pc-3',
                name: 'Charles Leclerc',
                role: 'Backend Engineer',
                daysAgo: 4,
                status: 'Follow up required',
                statusColor: 'blue',
            },
            {
                id: 'pc-4',
                name: 'Dwija Patel',
                role: 'Senior Product Designer',
                daysAgo: 4,
                status: 'Follow up required',
                statusColor: 'grey',
            },
        ],
    },
    {
        id: 'col-screening',
        title: 'Screening',
        dotColor: '#CB30E0',
        accentColor: '#CB30E0',
        urgentCount: 0,
        totalCount: 1,
        cards: [
            {
                id: 'pc-5',
                name: 'Max Verstappen',
                role: 'Senior Product Designer',
                daysAgo: 4,
                status: 'Availability Expires today',
                statusColor: 'rose',
            },
        ],
    },
    {
        id: 'col-interview',
        title: 'Interview',
        dotColor: '#00C3D0',
        accentColor: '#00C3D0',
        urgentCount: 0,
        totalCount: 3,
        cards: [
            {
                id: 'pc-6',
                name: 'Dwija Patel',
                role: 'Senior Product Designer',
                daysAgo: 4,
                status: 'HM Feedback missing',
                statusColor: 'amber',
            },
            {
                id: 'pc-7',
                name: 'Ana De Armas',
                role: 'Product Manager',
                daysAgo: 4,
                status: 'Required Scheduling',
                statusColor: 'indigo',
            },
            {
                id: 'pc-8',
                name: 'Charles Leclerc',
                role: 'Backend Engineer',
                daysAgo: 4,
                status: 'Not Available',
                statusColor: 'rose',
            },
        ],
    },
];

// ──────────────────────────────────────────────
//  Talent Matches
// ──────────────────────────────────────────────

export const talentMatchesData: TalentMatchData[] = [
    {
        id: 'tm-1',
        name: 'Oscar Piastri',
        company: 'Deloitte',
        position: 'Software Developer',
        experience: '7 years',
        matchPercentage: 85,
        source: 'nxt',
    },
    {
        id: 'tm-2',
        name: 'Fernando Alonso',
        company: 'Racing Williams',
        position: 'F1 Race Technical Engineer',
        experience: '7 years',
        matchPercentage: 85,
        source: 'naukri',
    },
    {
        id: 'tm-3',
        name: 'Lando Norris',
        company: 'McLaren Technologies',
        position: 'Systems Architect',
        experience: '5 years',
        matchPercentage: 92,
        source: 'external',
    },
];

// ──────────────────────────────────────────────
//  Schedule Widget
// ──────────────────────────────────────────────

export const scheduleItemsData: ScheduleItemData[] = [
    {
        id: 'sched-1',
        time: '09:30 AM',
        type: 'Final Round',
        name: 'Henry Cavil',
        details: 'Deloitte | Full Stack Developer | 4 years',
        location: 'Done',
        color: 'grey',
        isDone: true,
    },
    {
        id: 'sched-2',
        time: '09:30 AM',
        type: 'Final Round',
        name: 'Henry Cavil',
        details: 'HGS | AI ML Engineer | 3 years',
        location: 'Done',
        color: 'grey',
        isDone: true,
    },
    {
        id: 'sched-3',
        time: '11:30 AM',
        type: '1st Round Interview',
        name: 'Max Verstappen',
        details: 'Deloitte | Full Stack Developer | 4 years',
        location: 'Zoom',
        color: 'cyan',
    },
    {
        id: 'sched-4',
        time: '12:30 PM',
        type: 'Technical Round',
        name: 'Brad Pitt',
        details: 'HGS | Software Developer | 6 years',
        location: 'Virtual',
        color: 'purple',
    },
    {
        id: 'sched-5',
        time: '02:30 PM',
        type: 'Technical Round',
        name: 'Robert Pattinson',
        details: 'Jupiter | Marketing Manager | 2 years',
        location: 'F2F',
        color: 'orange',
    },
    {
        id: 'sched-6',
        time: '02:30 PM',
        type: 'Technical Round',
        name: 'Max Verstappen',
        details: 'HGS | Software Developer | 6 years',
        location: 'F2F',
        color: 'purple',
    },
];

// ──────────────────────────────────────────────
//  Recent Activities
// ──────────────────────────────────────────────

export const recentActivitiesData: ActivitySection[] = [
    {
        label: 'Today',
        items: [
            {
                icon: 'calendar',
                text: 'Sarah Jenkins shortlisted for next round',
                time: '10:45 AM',
            },
            {
                icon: 'phone',
                text: 'Mark Anderson follow up is done',
                time: '10:25 AM',
            },
        ],
    },
    {
        label: 'Yesterday',
        items: [
            {
                icon: 'check',
                text: 'Steve Smith profile got shortlisted for final round',
                time: '11:11 PM',
            },
        ],
    },
];

// ──────────────────────────────────────────────
//  Action Review Modal (paginated candidates)
// ──────────────────────────────────────────────

export const actionReviewCandidates: ActionReviewCandidate[] = [
    {
        id: 'ar-1',
        name: 'Dwija Patel',
        role: 'Senior Product Designer',
        company: 'Jupiter',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT3sqE6RS0WmeZC9ArbIb8MM0-p-S0-dOWpwKXbcGSUftawEeGPpMktD6ANae56887NK3bzR7kiWfds8A6-dzSGuJkS1Sl94WTahskERf3bPIyTVfkhilfvymlG1GgxTUL9Ziyn-kqE750oSaA97y7M_tuNFIEUG7s2bHSyQHKVykRaKgstr2aSKuNsQ0A9aWAIgt_Bwgfp9hWow4OkmXiH7MRT49H8h4VxFDnEE2A4uyy4g9KxBcX37YIMZtE8qnGWAPHSntdknZI',
        source: 'Naukbot',
        skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'],
        quickFitSkills: [
            { name: '8+Years', match: true },
            { name: 'UI / Frontend Development', match: true },
            { name: 'UI UX', match: true },
            { name: 'Product Strategy', match: true },
            { name: 'Design Thinking', match: true },
            { name: 'Product Design', match: true },
            { name: 'Communication', match: true },
            { name: 'AI UX Product Design', match: false },
        ],
        matchPercentage: 84,
        aiSummary: 'Strong technical profile with 7 years in product engineering. Led checkout redesign reducing drop-off by 22%. Communication is confident. Minor gaps in cloud and GraphQL but trainable within 3 months.',
        experience: '5 yrs',
        noticePeriod: '30 Days',
        currentCTC: '₹16L',
        expectedCTC: '24L',
        location: 'Bengaluru',
        status: 'Follow up required',
    },
    {
        id: 'ar-2',
        name: 'Ana De Armas',
        role: 'Product Manager',
        company: 'Deloitte',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        source: 'LinkedIn',
        skills: ['Product Strategy', 'Agile', 'Scrum', 'Analytics'],
        quickFitSkills: [
            { name: '6 Years', match: true },
            { name: 'Product Strategy', match: true },
            { name: 'Agile', match: true },
            { name: 'Scrum', match: true },
            { name: 'Analytics', match: true },
            { name: 'Data Science', match: false },
        ],
        matchPercentage: 88,
        aiSummary: 'Ana brings extensive product management expertise and agile methodologies. Her background in guiding cross-functional teams makes her a strong fit for the product requirements.',
        experience: '6 Years',
        noticePeriod: '30 Days',
        currentCTC: '₹22L',
        expectedCTC: '30L',
        location: 'Mumbai',
        status: 'Follow up required',
    },
    {
        id: 'ar-3',
        name: 'Charles Leclerc',
        role: 'Backend Engineer',
        company: 'HGS',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        source: 'Referral',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
        quickFitSkills: [
            { name: '5 Years', match: true },
            { name: 'Node.js', match: true },
            { name: 'Python', match: true },
            { name: 'PostgreSQL', match: true },
            { name: 'Redis', match: true },
            { name: 'Go', match: false },
        ],
        matchPercentage: 82,
        aiSummary: 'Charles has deep knowledge in backend systems and infrastructure scaling. His experience with highly available architectures and caching tools like Redis is valuable.',
        experience: '5 Years',
        noticePeriod: '60 Days',
        currentCTC: '₹18L',
        expectedCTC: '26L',
        location: 'Hyderabad',
        status: 'Outreach Required',
    },
    {
        id: 'ar-4',
        name: 'Max Verstappen',
        role: 'Senior Product Designer',
        company: 'McLaren',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        source: 'Indeed',
        skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
        quickFitSkills: [
            { name: '7 Years', match: true },
            { name: 'Figma', match: true },
            { name: 'UI/UX', match: true },
            { name: 'Prototyping', match: true },
            { name: 'User Research', match: true },
            { name: 'Motion Design', match: false },
        ],
        matchPercentage: 78,
        aiSummary: 'Max specializes in prototyping and creating seamless user journeys. His user research experience complements the team\'s design strategy.',
        experience: '7 Years',
        noticePeriod: 'Immediate',
        currentCTC: '₹20L',
        expectedCTC: '28L',
        location: 'Pune',
        status: 'Follow up required',
    },
];

// ──────────────────────────────────────────────
//  New Match Candidate Modal (paginated)
// ──────────────────────────────────────────────

export const newMatchCandidates: NewMatchCandidate[] = [
    
];

// ──────────────────────────────────────────────
//  Schedule Event Modal (paginated)
// ──────────────────────────────────────────────

export const scheduleEventsData: ScheduleEventData[] = [
    {
        id: 'se-1',
        title: 'Final Round: Henry Cavil',
        candidateName: 'Henry Cavil',
        interviewType: 'Final Round',
        date: 'Feb 11, 2026',
        timeRange: '09:00 AM – 10:00 AM',
        timezone: 'EST',
        description: 'Deep dive into React internals, specifically focusing on Reconciliation, Hooks implementation, and Concurrent Mode. The interview will also include a short system design challenge focused on real-time data streaming architectures.',
        meetingPlatform: 'Google Meet',
        statusLabel: 'Live In 5 Mins',
        recruiterName: 'Alex Rivera',
        recruiterRole: 'Talent Acquisition Lead',
        recruiterAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE_PSOqDBwLVeSV_V-WQ6k89ghwcB6WUjkj8C-F70jlcZ1FDTPqDEXMINeXvXwaVExHNXjaNOWGURwqRiKXWdlqpSTwHayrHPloDGTJ4bxWc7cY9yZwskyoOui_YbTHg06KlN4Hu0X_XMqSMTW9G9GPWAMEn9dvrCrTujlH7uqsmxIGGFLY4ZTp6W_e32LBdM5LQTWlQL5ynMl-eSyOwv1NJh4-i86cIiZyF-sfTbN-Yir_SO5_hVdR49hMmkdit3dfnrHnUFI8kKV',
        candidateEmail: 'sarah.j@example.com',
        candidatePhone: '+1 (555) 123-4567',
        candidateCompany: 'Deloitte',
        candidatePosition: 'Full Stack Developer',
        candidateExperience: '4 years',
        duration: '60 min',
        interviewer: 'You',
        jobRole: 'Sr. Product Designer',
    },
    {
        id: 'se-2',
        title: '2nd Round Interview: Max Verstappen',
        candidateName: 'Max Verstappen',
        interviewType: '1st Round Interview',
        date: 'Feb 11, 2026',
        timeRange: '11:30 AM – 12:00 PM',
        timezone: 'EST',
        description: 'System design round focusing on distributed systems, microservices architecture, and event-driven patterns. Candidates should be prepared for whiteboard exercises on load balancing and failover strategies.',
        meetingPlatform: 'Zoom',
        statusLabel: 'Scheduled',
        recruiterName: 'Maria Santos',
        recruiterRole: 'Senior Recruiter',
        recruiterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        candidateEmail: 'max.v@example.com',
        candidatePhone: '+1 (555) 234-5678',
        candidateCompany: 'Deloitte',
        candidatePosition: 'Full Stack Developer',
        candidateExperience: '4 years',
        duration: '45 min',
        interviewer: 'You',
        jobRole: 'Sr. Product Designer',
    },
    {
        id: 'se-3',
        title: 'Technical Round: Brad Pitt',
        candidateName: 'Brad Pitt',
        interviewType: 'Technical Round',
        date: 'Feb 11, 2026',
        timeRange: '12:30 PM – 01:30 PM',
        timezone: 'EST',
        description: 'Coding assessment round covering data structures, algorithms, and problem-solving. The candidate will work on two medium-difficulty problems in their preferred programming language.',
        meetingPlatform: 'Microsoft Teams',
        statusLabel: 'Upcoming',
        recruiterName: 'Alex Rivera',
        recruiterRole: 'Talent Acquisition Lead',
        recruiterAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE_PSOqDBwLVeSV_V-WQ6k89ghwcB6WUjkj8C-F70jlcZ1FDTPqDEXMINeXvXwaVExHNXjaNOWGURwqRiKXWdlqpSTwHayrHPloDGTJ4bxWc7cY9yZwskyoOui_YbTHg06KlN4Hu0X_XMqSMTW9G9GPWAMEn9dvrCrTujlH7uqsmxIGGFLY4ZTp6W_e32LBdM5LQTWlQL5ynMl-eSyOwv1NJh4-i86cIiZyF-sfTbN-Yir_SO5_hVdR49hMmkdit3dfnrHnUFI8kKV',
        candidateEmail: 'brad.p@example.com',
        candidatePhone: '+1 (555) 345-6789',
        candidateCompany: 'HGS',
        candidatePosition: 'Software Developer',
        candidateExperience: '6 years',
        duration: '60 min',
        interviewer: 'You',
        jobRole: 'Backend Engineer',
    },
    {
        id: 'se-4',
        title: 'HR Round: Robert Pattinson',
        candidateName: 'Robert Pattinson',
        interviewType: 'HR Round',
        date: 'Feb 11, 2026',
        timeRange: '02:30 PM – 03:00 PM',
        timezone: 'EST',
        description: 'Culture fit and behavioral interview. Discussion will include team dynamics, conflict resolution, and career aspirations. The HR panel will assess communication skills and cultural alignment.',
        meetingPlatform: 'Google Meet',
        statusLabel: 'Upcoming',
        recruiterName: 'Jen Torres',
        recruiterRole: 'HR Business Partner',
        recruiterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        candidateEmail: 'robert.p@example.com',
        candidatePhone: '+1 (555) 456-7890',
        candidateCompany: 'Jupiter',
        candidatePosition: 'Marketing Manager',
        candidateExperience: '2 years',
        duration: '30 min',
        interviewer: 'You',
        jobRole: 'Marketing Lead',
    },
];

// ──────────────────────────────────────────────
//  Daily Agenda Modal
// ──────────────────────────────────────────────

export const dailyAgendaData: DailyAgendaData = {
    date: 'February 13, 2024',
    liveStatus: {
        interviewerName: 'Marcus Thorne',
        candidateName: 'Sarah Jenkins',
        roundType: '1st Tech',
        elapsed: '45m',
        interviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    alerts: [
        {
            id: 'alert-1',
            type: 'soon',
            candidateName: 'Emily Watson',
            label: 'In 5m',
        },
        {
            id: 'alert-2',
            type: 'completed',
            candidateName: 'John Doe',
            label: 'Done',
        },
    ],
    items: [
        {
            id: 'agenda-1',
            time: '09:00 AM',
            duration: '60 mins',
            candidateName: 'John Doe',
            candidateRole: 'Sr. Frontend Dev • Tech Round',
            roundType: 'Tech Round',
            status: 'completed',
        },
        {
            id: 'agenda-2',
            time: '11:30 AM',
            duration: 'LIVE NOW',
            candidateName: 'Sarah Jenkins',
            candidateRole: 'Product Manager • Culture Fit',
            roundType: 'Culture Fit',
            status: 'in-progress',
        },
        {
            id: 'agenda-3',
            time: '02:00 PM',
            duration: '45 mins',
            candidateName: 'Michael Chen',
            candidateRole: 'UX Designer • Portfolio Review',
            roundType: 'Portfolio Review',
            status: 'upcoming',
        },
        {
            id: 'agenda-4',
            time: '04:30 PM',
            duration: '30 mins',
            candidateName: 'Emily Watson',
            candidateRole: 'Talent Coordinator • Final Screening',
            roundType: 'Final Screening',
            status: 'upcoming',
        },
    ],
};
