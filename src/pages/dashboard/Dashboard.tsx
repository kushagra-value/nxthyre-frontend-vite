import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import StatCard from './components/StatCard';
import PriorityCard from './components/PriorityCard';
import TalentMatchCard from './components/TalentMatchCard';
import CalendarWidget from './components/CalendarWidget';
import ScheduleWidget from './components/ScheduleWidget';
import RecentActivities from './components/RecentActivities';
import ActionReviewModal from './components/ActionReviewModal';
import NewMatchCandidateModal from './components/NewMatchCandidateModal';
import CustomDateSelector from './components/CustomDateSelector';
import ScheduleEventModal from './components/ScheduleEventModal';
import DateWiseAgendaModal from './components/DateWiseAgendaModal';
import DailyActivitiesModal from './components/DailyActivitiesModal';
import { useAuth } from '../../hooks/useAuth';
import dashboardService, {
  DashboardData,
  PriorityActionItem,
  PriorityActionsResponse,
  PriorityTab,
  DateRangePreset,
} from '../../services/dashboardService';
import { jobPostService, Job } from '../../services/jobPostService';
import organizationService from '../../services/organizationService';
import type { DiscoverWorkspace } from '../../services/organizationService';
import {
  statCardsData,
  scheduleItemsData,
  scheduleEventsData,
  dailyAgendaData,
  ScheduleItemData,
  StatCardData,
  PriorityColumnData,
  TalentMatchData,

  CandidateSource,
} from './dashboardData';

const BriefcaseIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12.5L10 13.75" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 9.16667L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16667" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.37257 8.70255C3.78865 11.3954 6.98258 12.5 9.99992 12.5C13.0173 12.5 16.2112 11.3954 17.6273 8.70255C18.3032 7.41713 17.7914 5 16.1266 5H3.87325C2.20845 5 1.69661 7.41714 2.37257 8.70255Z" stroke="#0F47F2" />
    <path d="M13.3332 5L13.2596 4.74244C12.8929 3.45907 12.7096 2.81739 12.2731 2.45036C11.8366 2.08333 11.2568 2.08333 10.0973 2.08333H9.90237C8.74283 2.08333 8.16306 2.08333 7.72659 2.45036C7.29011 2.81739 7.10677 3.45907 6.74009 4.74244L6.6665 5" stroke="#0F47F2" />
  </svg>
);

const BuildingIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3334 18.3333C12.4451 17.2961 11.2781 16.6667 10.0001 16.6667C8.72203 16.6667 7.55511 17.2961 6.66675 18.3333" stroke="#0F47F2" stroke-linecap="round" />
    <path d="M10.0002 10.8333C8.94339 10.8333 7.82607 11.0161 6.95018 11.2607C6.29065 11.4448 5.76012 12.2846 5.84182 12.9663C5.87209 13.2189 6.08959 13.3333 6.31827 13.3333H13.6821C13.9107 13.3333 14.1282 13.2189 14.1585 12.9663C14.2402 12.2846 13.7097 11.4448 13.0501 11.2607C12.1743 11.0161 11.0569 10.8333 10.0002 10.8333Z" stroke="#0F47F2" stroke-linecap="round" />
    <path d="M17.5001 8.33334C16.5796 8.33334 15.8334 9.07954 15.8334 10V10.8333C15.8334 11.7538 15.0872 12.5 14.1667 12.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M2.50016 8.33334C3.42064 8.33334 4.16683 9.07954 4.16683 10V10.8333C4.16683 11.7538 4.91302 12.5 5.8335 12.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 13.3333V18.3333" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10.6833 8.33334H9.31704C8.14859 8.33334 7.56436 8.33334 7.14173 7.98035C6.71909 7.62736 6.5774 7.02106 6.29401 5.80846C5.84843 3.90191 5.62565 2.94863 6.09349 2.30765C6.56133 1.66667 7.4799 1.66667 9.31705 1.66667H10.6833C12.5204 1.66667 13.439 1.66667 13.9068 2.30765C14.3747 2.94863 14.1519 3.90191 13.7063 5.80846C13.4229 7.02106 13.2812 7.62736 12.8586 7.98035C12.436 8.33334 11.8517 8.33334 10.6833 8.33334Z" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 8.33334V10.8333" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const UserPlusIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.3168 12.747C3.26883 13.3613 0.521092 14.6155 2.19465 16.185C3.01216 16.9517 3.92267 17.5 5.06739 17.5H11.5994C12.7442 17.5 13.6547 16.9517 14.4722 16.185C16.1457 14.6155 13.398 13.3613 12.35 12.747C9.89253 11.3066 6.77429 11.3066 4.3168 12.747Z" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.6667 5.83333C11.6667 7.67428 10.1743 9.16667 8.33333 9.16667C6.49238 9.16667 5 7.67428 5 5.83333C5 3.99238 6.49238 2.5 8.33333 2.5C10.1743 2.5 11.6667 3.99238 11.6667 5.83333Z" stroke="#0F47F2" />
    <path d="M16.2501 3.33333V7.49999M18.3334 5.41666L14.1667 5.41666" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.0001 2.29167C5.74289 2.29167 2.29175 5.74281 2.29175 10C2.29175 14.2572 5.74289 17.7083 10.0001 17.7083C14.2572 17.7083 17.7084 14.2572 17.7084 10C17.7084 5.74281 14.2572 2.29167 10.0001 2.29167ZM1.04175 10C1.04175 5.05245 5.05253 1.04167 10.0001 1.04167C14.9477 1.04167 18.9584 5.05245 18.9584 10C18.9584 14.9476 14.9477 18.9583 10.0001 18.9583C5.05253 18.9583 1.04175 14.9476 1.04175 10ZM10.0001 6.04167C10.3452 6.04167 10.6251 6.3215 10.6251 6.66667V9.74109L12.5253 11.6414C12.7694 11.8855 12.7694 12.2812 12.5253 12.5253C12.2812 12.7693 11.8856 12.7693 11.6415 12.5253L9.55816 10.4419C9.44091 10.3248 9.37508 10.1658 9.37508 10V6.66667C9.37508 6.3215 9.65491 6.04167 10.0001 6.04167Z" fill="#0F47F2" />
  </svg>
);

const iconMap: Record<string, React.ReactNode> = {
  briefcase: BriefcaseIcon,
  building: BuildingIcon,
  userPlus: UserPlusIcon,
  'user-plus': UserPlusIcon,
  clock: ClockIcon,
};

// Map API icon_type to internal iconType keys
const mapIconType = (apiIconType: string): string => {
  const mapping: Record<string, string> = {
    briefcase: 'briefcase',
    building: 'building',
    'user-plus': 'userPlus',
    clock: 'clock',
  };
  return mapping[apiIconType] || apiIconType;
};




// Map API source to internal CandidateSource
const mapSource = (src: any): CandidateSource | undefined => {
  if (typeof src !== 'string') return 'external';
  const mapping: Record<string, CandidateSource> = {
    autopilot: 'nxt',
    nxthyre: 'nxt',
    naukri: 'naukri',
    pyjamahr: 'pyjama',
    upload: 'external',
    external: 'external',
  };
  return mapping[src.toLowerCase()] || 'external';
};

// Column color config
const columnColors: Record<string, { dotColor: string; accentColor: string }> = {
  sourcing: { dotColor: '#6155F5', accentColor: '#6155F5' },
  screening: { dotColor: '#CB30E0', accentColor: '#CB30E0' },
  interview: { dotColor: '#00C3D0', accentColor: '#00C3D0' },
};

// Helper to format Date to YYYY-MM-DD
const formatDateToYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Map tag string from API to a display status and color
const mapTagToStatus = (tag: any): { status: string; statusColor: 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' | 'green' } => {
  if (typeof tag !== 'string') return { status: String(tag || 'Unknown'), statusColor: 'grey' };
  const lower = tag.toLowerCase();
  if (lower.includes('follow up')) {
    return { status: tag, statusColor: 'blue' };
  }
  if (lower.includes('not called')) {
    return { status: tag, statusColor: 'amber' };
  }
  if (lower.includes('not moved')) {
    return { status: tag, statusColor: 'rose' };
  }
  if (lower.includes('feedback pending')) {
    return { status: tag, statusColor: 'indigo' };
  }
  return { status: tag, statusColor: 'grey' };
};

// Priority column tabs
const PRIORITY_TABS: { key: PriorityTab; title: string }[] = [
  { key: 'sourcing', title: 'Sourcing' },
  { key: 'screening', title: 'Screening' },
  { key: 'interview', title: 'Interview' },
];

interface CompanyOption {
  id: number | null;
  name: string;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  // API data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Priority Actions state — separate from main dashboard
  const [priorityData, setPriorityData] = useState<Record<PriorityTab, PriorityActionsResponse | null>>({
    sourcing: null,
    screening: null,
    interview: null,
  });
  const [priorityLoading, setPriorityLoading] = useState(true);

  // Filter and View States
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState('All Companies');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  // Company logos (same pattern as Companies page)
  const [companyLogos, setCompanyLogos] = useState<Record<string, string | null>>({});
  const logoRequestedRef = useRef<Set<string>>(new Set());

  // Staged company selection (applied on "Apply" click)
  const [pendingCompanyId, setPendingCompanyId] = useState<number | null>(null);
  const [pendingCompanyName, setPendingCompanyName] = useState('All Companies');

  // Company search within dropdown
  const [companySearchQuery, setCompanySearchQuery] = useState('');

  // Date range state
  const [dateRange, setDateRange] = useState('Today');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('today');
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const [talentMatchDateRange, setTalentMatchDateRange] = useState('Last 24 Hours');
  const [talentMatchDateRangePreset, setTalentMatchDateRangePreset] = useState<DateRangePreset>('today');
  const [talentMatchCustomStartDate, setTalentMatchCustomStartDate] = useState<string | undefined>(undefined);
  const [talentMatchCustomEndDate, setTalentMatchCustomEndDate] = useState<string | undefined>(undefined);
  const [showTalentMatchDateDropdown, setShowTalentMatchDateDropdown] = useState(false);

  // Talent Matches Job Filter
  const [talentMatchJobs, setTalentMatchJobs] = useState<Job[]>([]);
  const [talentMatchSelectedJob, setTalentMatchSelectedJob] = useState<{ id: number | null, title: string }>({ id: null, title: 'All Jobs' });
  const [showTalentMatchJobDropdown, setShowTalentMatchJobDropdown] = useState(false);
  const talentMatchJobDropdownRef = useRef<HTMLDivElement>(null);

  // Staged job selection (applied on "Apply" click)
  const [pendingJobId, setPendingJobId] = useState<number | null>(null);
  const [pendingJobTitle, setPendingJobTitle] = useState('All Jobs');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  const [talentMatchesResponse, setTalentMatchesResponse] = useState<any>(null);
  const [talentMatchesLoading, setTalentMatchesLoading] = useState(true);
  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalCandidateData, setActionModalCandidateData] = useState<any>(null);
  const [actionModalLoading, setActionModalLoading] = useState(false);
  const [actionModalTab, setActionModalTab] = useState<PriorityTab>('sourcing');
  const [actionModalCards, setActionModalCards] = useState<PriorityActionItem[]>([]);
  const [actionModalCurrentIndex, setActionModalCurrentIndex] = useState(0);

  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [newMatchCurrentIndex, setNewMatchCurrentIndex] = useState(0);
  const [newMatchCandidateData, setNewMatchCandidateData] = useState<any>(null);
  const [newMatchLoading, setNewMatchLoading] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInitialIndex, setScheduleInitialIndex] = useState(0);

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isDailyActivitiesModalOpen, setIsDailyActivitiesModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Close company dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (talentMatchJobDropdownRef.current && !talentMatchJobDropdownRef.current.contains(event.target as Node)) {
        setShowTalentMatchJobDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch company list from workspaces
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCompanies = async () => {
      try {
        const [myWsData, discoverWs] = await Promise.all([
          organizationService.getMyWorkspacesData(),
          organizationService.getDiscoverWorkspaces().catch(() => [] as DiscoverWorkspace[]),
        ]);

        const options: CompanyOption[] = [{ id: null, name: 'All Companies' }];
        const seen = new Set<number>();

        // Add my workspaces
        if (myWsData.workspaces) {
          for (const ws of myWsData.workspaces) {
            if (!seen.has(ws.id)) {
              seen.add(ws.id);
              options.push({ id: ws.id, name: ws.name });
            }
          }
        }

        // Add discover workspaces
        for (const ws of discoverWs) {
          if (!seen.has(ws.id)) {
            seen.add(ws.id);
            options.push({ id: ws.id, name: ws.name });
          }
        }

        setCompanyOptions(options);
      } catch (err) {
        console.error('Failed to fetch company list:', err);
        setCompanyOptions([{ id: null, name: 'All Companies' }]);
      }
    };
    loadCompanies();
  }, [isAuthenticated]);

  // Fetch company logo (same as Companies.tsx)
  const fetchCompanyLogo = async (query: string) => {
    if (!query || logoRequestedRef.current.has(query)) return;
    logoRequestedRef.current.add(query);
    try {
      const response = await fetch(
        `https://api.logo.dev/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_LOGO_DEV_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      const logoUrl = data.length > 0 ? data[0].logo_url : null;
      setCompanyLogos((prev) => ({ ...prev, [query]: logoUrl }));
    } catch (error) {
      setCompanyLogos((prev) => ({ ...prev, [query]: null }));
    }
  };

  // Fetch logos when company options load
  useEffect(() => {
    companyOptions.forEach((option) => {
      if (option.name && option.id !== null && !logoRequestedRef.current.has(option.name)) {
        fetchCompanyLogo(option.name);
      }
    });
  }, [companyOptions]);

  // Fetch jobs list for Talent Matches filter
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadJobs = async () => {
      try {
        const jobs = await jobPostService.getJobs();
        setTalentMatchJobs(jobs);
      } catch (err) {
        console.error('Failed to fetch jobs for filter:', err);
      }
    };
    loadJobs();
  }, [isAuthenticated]);

  // Fetch dashboard data (stat cards, talent matches, schedule, etc.)
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setLoading(true);

    dashboardService
      .getDashboard()
      .then((data) => {
        if (!cancelled) {
          setDashboardData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Fetch talent matches — direct useEffect, no useCallback
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    setTalentMatchesLoading(true);

    dashboardService
      .getTalentMatches({
        job_id: talentMatchSelectedJob.id ?? undefined,
        date_range: talentMatchDateRangePreset,
        start_date: talentMatchCustomStartDate,
        end_date: talentMatchCustomEndDate,
        page_size: 10,
      })
      .then((data) => {
        if (!cancelled) {
          setTalentMatchesResponse(data ?? { count: 0, results: [] });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch talent matches:', err);
          setTalentMatchesResponse({ count: 0, results: [] });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTalentMatchesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    talentMatchSelectedJob.id,
    talentMatchDateRangePreset,
    talentMatchCustomStartDate,
    talentMatchCustomEndDate,
  ]);

  // Simple refresh for imperative calls (skip, modal actions)
  const refreshTalentMatches = async () => {
    try {
      setTalentMatchesLoading(true);
      const data = await dashboardService.getTalentMatches({
        job_id: talentMatchSelectedJob.id ?? undefined,
        date_range: talentMatchDateRangePreset,
        start_date: talentMatchCustomStartDate,
        end_date: talentMatchCustomEndDate,
        page_size: 10,
      });
      setTalentMatchesResponse(data ?? { count: 0, results: [] });
    } catch (err) {
      console.error('Failed to refresh talent matches:', err);
      setTalentMatchesResponse({ count: 0, results: [] });
    } finally {
      setTalentMatchesLoading(false);
    }
  };

  // Fetch priority actions from the new API
  const fetchPriorityActions = useCallback(async () => {
    if (!isAuthenticated) return;

    setPriorityLoading(true);
    try {
      const commonParams = {
        date_range: dateRangePreset,
        start_date: dateRangePreset === 'custom' ? customStartDate : undefined,
        end_date: dateRangePreset === 'custom' ? customEndDate : undefined,
        workspace_id: selectedCompanyId ?? undefined,
        history: viewMode === 'history' ? true : undefined,
        page_size: 50,
      };

      const [sourcing, screening, interview] = await Promise.all([
        dashboardService.getPriorityActions({ tab: 'sourcing', ...commonParams }),
        dashboardService.getPriorityActions({ tab: 'screening', ...commonParams }),
        dashboardService.getPriorityActions({ tab: 'interview', ...commonParams }),
      ]);

      setPriorityData({ sourcing, screening, interview });
    } catch (err) {
      console.error('Failed to fetch priority actions:', err);
    } finally {
      setPriorityLoading(false);
    }
  }, [isAuthenticated, dateRangePreset, customStartDate, customEndDate, selectedCompanyId, viewMode]);

  useEffect(() => {
    fetchPriorityActions();
  }, [fetchPriorityActions]);

  // ── Derive display data from API or fall back to static data ──

  const dynamicStatCards: StatCardData[] = Array.isArray(dashboardData?.dashboard?.stat_cards)
    ? dashboardData!.dashboard.stat_cards.map((card) => ({
      id: card.id,
      iconType: mapIconType(card.icon_type) as StatCardData['iconType'],
      label: card.label,
      value: card.unit ? `${card.value}` : card.value,
      trend: card.trend,
      trendText: card.trend_text,
      dateText: card.unit,
    }))
    : statCardsData;

  // Build priority columns from new API data
  const dynamicPriorityColumns: PriorityColumnData[] = PRIORITY_TABS.map((tabInfo) => {
    const colors = columnColors[tabInfo.key] || { dotColor: '#6155F5', accentColor: '#6155F5' };
    const response = priorityData[tabInfo.key];
    const items: PriorityActionItem[] = response?.results || [];

    const cards = items.map((item) => {
      const tagInfo = item.tags.length > 0 ? mapTagToStatus(item.tags[0]) : { status: item.current_stage_name, statusColor: 'grey' as const };
      const isDone = viewMode === 'history' || item.action_taken !== null;

      return {
        id: `pa-${item.application_id}`,
        name: item.candidate_full_name,
        role: item.job_role,
        company: item.workspace_name,
        daysAgo: item.days_in_current_stage,
        status: isDone ? (item.action_taken || tagInfo.status) : tagInfo.status,
        statusColor: isDone ? 'green' as const : tagInfo.statusColor,
        isDone,
        applicationId: item.application_id,
        candidateId: item.candidate_id,
        jobRole: item.job_role,
        jobRoleId: item.job_role_id,
      };
    });

    const urgentCount = Array.isArray(items) ? items.filter(item =>
      Array.isArray(item.tags) && item.tags.some(tag =>
        typeof tag === 'string' && (tag.toLowerCase().includes('follow up') || tag.toLowerCase().includes('not called'))
      )
    ).length : 0;

    return {
      id: `col-${tabInfo.key}`,
      title: tabInfo.title,
      dotColor: colors.dotColor,
      accentColor: colors.accentColor,
      urgentCount: viewMode === 'history' ? 0 : urgentCount,
      totalCount: response?.count || cards.length,
      cards,
    };
  });

  const mapMatchPercentage = (match: any): number => {
    const scoreRaw = match.score ?? match.match_percentage ?? match.match_score;
    if (typeof scoreRaw === 'number') return scoreRaw;
    if (typeof scoreRaw === 'string') return parseInt(scoreRaw.replace('%', ''), 10) || 0;
    return 0;
  };

  const dynamicTalentMatches: TalentMatchData[] = talentMatchesResponse?.results
    ? talentMatchesResponse.results.map((m: any, idx: number) => ({
      id: `${m.match_id || idx}-${m.job_score_object?.candidate_id || idx}`,
      name: m.candidate_details || 'Unknown',
      company: m.current_company || 'N/A',
      position: m.job_title || '',
      experience: m.total_exp != null ? `${m.total_exp} yrs` : '',
      matchPercentage: mapMatchPercentage({ score: m.score }),
      source: mapSource(m.source?.source),
    }))
    : [];

  const modalCandidates = talentMatchesResponse?.results
    ? talentMatchesResponse.results.map((m: any) => {
      const quickFitSource = m.job_score_object?.quick_fit_summary || [];
      const quickFitSkills = quickFitSource.map((q: any) => ({
        name: q.badge,
        match: q.color === 'green'
      }));

      return {
        name: m.candidate_details || 'Unknown',
        role: m.job_title || '',
        company: m.current_company || 'N/A',
        matchPercentage: mapMatchPercentage({ score: m.score }),
        experience: m.total_exp != null ? `${m.total_exp} yrs` : '',
        currentCTC: m.current_salary || '-',
        expectedCTC: '-', // API JSON didn't show expectedCTC
        noticePeriod: '-', // API JSON didn't show noticePeriod explicitly as days
        location: '-', // API JSON didn't show location
        source: mapSource(m.source?.source),
        quickFitSkills,
        aiSummary: m.job_score_object?.recommended_message || m.job_score_object?.candidate_match_score?.description || '',
        nbcId: m.job_score_object?.candidate_id,  // CandidateProfile UUID — used for Skip/NVite
        matchId: m.match_id,
        jobId: m.job_id,
      };
    })
    : [];

  // For schedule, use API data if available; map to ScheduleItemData from dashboardData types
  const dynamicScheduleItems: ScheduleItemData[] = Array.isArray(dashboardData?.dashboard?.schedule?.items)
    ? dashboardData!.dashboard.schedule.items.map((item: any, idx: number) => ({
      id: item.id || `sched-api-${idx}`,
      time: item.time || '',
      type: item.type || item.interview_type || '',
      name: item.name || item.candidate_name || '',
      details: item.details || '',
      location: item.location || item.meeting_platform || '',
      color: item.color || 'cyan',
      isDone: item.isDone || item.is_done || false,
    }))
    : scheduleItemsData;

  // Handle priority card click — fetch candidate details from API
  const handlePriorityCardClick = async (card: any, tabKey: PriorityTab) => {
    // Get all cards for this tab from the priority data
    const response = priorityData[tabKey];
    const allCards = response?.results || [];
    const clickedIndex = allCards.findIndex(c => c.application_id === card.applicationId);

    setActionModalTab(tabKey);
    setActionModalCards(allCards);
    setActionModalCurrentIndex(clickedIndex >= 0 ? clickedIndex : 0);
    setIsActionModalOpen(true);

    // Fetch full candidate details
    setActionModalLoading(true);
    try {
      const data = await dashboardService.getCandidateDetails(card.applicationId, card.jobRoleId);
      setActionModalCandidateData(data);
    } catch (err) {
      console.error('Failed to fetch candidate details:', err);
      setActionModalCandidateData(null);
    } finally {
      setActionModalLoading(false);
    }
  };

  // Navigate within the action modal
  const handleActionModalNavigate = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= actionModalCards.length) return;
    setActionModalCurrentIndex(newIndex);
    const item = actionModalCards[newIndex];

    setActionModalLoading(true);
    try {
      const data = await dashboardService.getCandidateDetails(item.application_id, item.job_role_id);
      setActionModalCandidateData(data);
    } catch (err) {
      console.error('Failed to fetch candidate details:', err);
      setActionModalCandidateData(null);
    } finally {
      setActionModalLoading(false);
    }
  };

  const handleTalentMatchClick = async (name: string) => {
    const idx = modalCandidates.findIndex((c: any) => c.name === name);
    const indexToUse = idx >= 0 ? idx : 0;

    setNewMatchCurrentIndex(indexToUse);
    setIsNewMatchModalOpen(true);

    const item = modalCandidates[indexToUse];
    if (item && item.matchId) {
      setNewMatchLoading(true);
      try {
        const data = await dashboardService.getCandidateDetails(item.matchId, item.jobId);
        setNewMatchCandidateData(data);
      } catch (err) {
        console.error('Failed to fetch talent match details:', err);
        setNewMatchCandidateData(null);
      } finally {
        setNewMatchLoading(false);
      }
    }
  };

  const handleSkipTalentMatch = async (nbcId: string) => {
    try {
      const { naukbotService } = await import('../../services/naukbotService');
      await naukbotService.skipCandidates([nbcId]);

      import('react-hot-toast').then(({ default: toast }) =>
        toast.success('Candidate skipped')
      );

      await refreshTalentMatches();

    } catch (err: any) {
      console.error('Skip failed:', err);
      import('react-hot-toast').then(({ default: toast }) =>
        toast.error(err.message || 'Failed to skip candidate')
      );
    }
  };

  const handleNewMatchModalNavigate = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= modalCandidates.length) return;
    setNewMatchCurrentIndex(newIndex);
    const item = modalCandidates[newIndex];

    if (item && item.matchId) {
      setNewMatchLoading(true);
      try {
        const data = await dashboardService.getCandidateDetails(item.matchId, item.jobId);
        setNewMatchCandidateData(data);
      } catch (err) {
        console.error('Failed to fetch talent match details:', err);
        setNewMatchCandidateData(null);
      } finally {
        setNewMatchLoading(false);
      }
    } else {
      setNewMatchCandidateData(null);
    }
  };

  const handleScheduleEventClick = (item: ScheduleItemData) => {
    const idx = scheduleEventsData.findIndex((e) => e.candidateName === item.name);
    setScheduleInitialIndex(idx >= 0 ? idx : 0);
    setIsScheduleModalOpen(true);
  };

  const handleDateClick = (date: Date, isTodayOrFuture: boolean) => {
    setSelectedCalendarDate(date);
    if (isTodayOrFuture) {
      setIsAgendaModalOpen(true);
    } else {
      setIsDailyActivitiesModalOpen(true);
    }
  };

  // Handle date range selection from CustomDateSelector
  const handleDateRangeApply = (range: { start?: Date; end?: Date; label: string }) => {
    setDateRange(range.label);

    const labelLower = typeof range.label === 'string' ? range.label.toLowerCase() : '';
    if (labelLower === 'today') {
      setDateRangePreset('today');
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    } else if (labelLower === 'last week') {
      setDateRangePreset('last_week');
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    } else if (labelLower === 'last month') {
      setDateRangePreset('last_month');
      setCustomStartDate(undefined);
      setCustomEndDate(undefined);
    } else {
      // Custom date range
      setDateRangePreset('custom');
      if (range.start) setCustomStartDate(formatDateToYMD(range.start));
      if (range.end) setCustomEndDate(formatDateToYMD(range.end));
    }
  };

  // Handle talent match date range selection
  const handleTalentMatchDateRangeApply = (range: { start?: Date; end?: Date; label: string }) => {
    setTalentMatchDateRange(range.label);
    const labelLower = typeof range.label === 'string' ? range.label.toLowerCase() : '';

    if (labelLower === 'today' || labelLower === 'last 24 hours') {
      setTalentMatchDateRangePreset('today');
      setTalentMatchCustomStartDate(undefined);
      setTalentMatchCustomEndDate(undefined);
    } else if (labelLower === 'last week') {
      setTalentMatchDateRangePreset('last_week');
      setTalentMatchCustomStartDate(undefined);
      setTalentMatchCustomEndDate(undefined);
    } else if (labelLower === 'last month') {
      setTalentMatchDateRangePreset('last_month');
      setTalentMatchCustomStartDate(undefined);
      setTalentMatchCustomEndDate(undefined);
    } else {
      setTalentMatchDateRangePreset('custom');
      if (range.start) setTalentMatchCustomStartDate(formatDateToYMD(range.start));
      if (range.end) setTalentMatchCustomEndDate(formatDateToYMD(range.end));
    }
  };

  // Handle company selection (stage it for Apply)
  const handleCompanySelect = (option: CompanyOption) => {
    setPendingCompanyId(option.id);
    setPendingCompanyName(option.name);
  };

  // Apply staged company filter
  const handleCompanyApply = () => {
    setSelectedCompanyId(pendingCompanyId);
    setSelectedCompanyName(pendingCompanyName);
    setShowCompanyDropdown(false);
    setCompanySearchQuery('');
  };

  // Sync pending state when dropdown opens
  const handleToggleCompanyDropdown = () => {
    if (!showCompanyDropdown) {
      setPendingCompanyId(selectedCompanyId);
      setPendingCompanyName(selectedCompanyName);
      setCompanySearchQuery('');
    }
    setShowCompanyDropdown(!showCompanyDropdown);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-4">
          {/* Stat Cards from API or fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? // Skeleton stat cards
              [...Array(4)].map((_, i) => (
                <div
                  key={`stat-skel-${i}`}
                  className="bg-white rounded-xl animate-pulse"
                  style={{ padding: '20px', gap: '8px', border: '0.5px solid #D1D1D6' }}
                >
                  <div className="flex justify-between items-center w-full mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-200" />
                    <div className="w-20 h-4 rounded bg-gray-200" />
                  </div>
                  <div className="w-16 h-3 rounded bg-gray-200 mb-1" />
                  <div className="w-12 h-8 rounded bg-gray-200" />
                </div>
              ))
              : dynamicStatCards.map((stat) => (
                <StatCard
                  key={stat.id}
                  icon={iconMap[stat.iconType]}
                  label={stat.label}
                  value={stat.value}
                  trend={stat.trend}
                  trendText={stat.trendText}
                  dateText={stat.dateText}
                />
              ))}
          </div>

          {/* Priority Actions from new API */}
          <section className="bg-white rounded-xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium leading-6 text-black">Priority Actions</h2>
              <div className="flex items-center gap-2.5">
                {/* History Toggle */}
                <button
                  onClick={() => setViewMode(prev => prev === 'active' ? 'history' : 'active')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-[0.5px] transition-all ${viewMode === 'history' ? 'bg-[#0F47F2] border-[#0F47F2]' : 'bg-white border-[#D1D1D6]'}`}
                  title={viewMode === 'history' ? 'View Active' : 'View History'}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.23223 4.22409C7.39502 1.06578 12.5364 1.09936 15.7185 4.28148C18.902 7.46497 18.9342 12.6094 15.7718 15.7718C12.6093 18.9342 7.46494 18.902 4.28145 15.7185C2.39491 13.832 1.61587 11.2582 1.95039 8.81767C1.99727 8.47567 2.3125 8.23647 2.65447 8.28335C2.99646 8.33022 3.23568 8.64542 3.18882 8.98742C2.9055 11.0543 3.56485 13.2342 5.16533 14.8347C7.86907 17.5384 12.222 17.5538 14.8879 14.8879C17.5538 12.222 17.5383 7.8691 14.8346 5.16537C12.1322 2.46301 7.78241 2.44616 5.11612 5.10798L5.73921 5.11111C6.08438 5.11284 6.36279 5.39407 6.36106 5.73924C6.35932 6.08442 6.0781 6.36282 5.73292 6.36109L3.61163 6.35043C3.26891 6.34871 2.99151 6.0713 2.98978 5.72858L2.97912 3.60728C2.97738 3.26212 3.2558 2.98089 3.60097 2.97915C3.94615 2.97742 4.22737 3.25583 4.22911 3.60101L4.23223 4.22409Z" fill="#4B5563" />
                    <path opacity="0.5" d="M10 6.04175C10.3452 6.04175 10.625 6.32157 10.625 6.66675V9.74116L12.5252 11.6415C12.7693 11.8856 12.7693 12.2812 12.5252 12.5253C12.2812 12.7694 11.8855 12.7694 11.6414 12.5253L9.61908 10.5031C9.46283 10.3467 9.375 10.1348 9.375 9.91375V6.66675C9.375 6.32157 9.65483 6.04175 10 6.04175Z" fill="#4B5563" />
                  </svg>

                </button>

                {/* Company Filter Dropdown */}
                <div className="relative" ref={companyDropdownRef}>
                  <button
                    onClick={handleToggleCompanyDropdown}
                    className="flex items-center gap-2 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] bg-white border-[0.5px] border-[#D1D1D6] min-w-[150px] justify-between"
                  >
                    {selectedCompanyId !== null && companyLogos[selectedCompanyName] ? (
                      <img src={companyLogos[selectedCompanyName]!} alt="" className="w-5 h-5 rounded-full object-contain flex-shrink-0" />
                    ) : null}
                    <span className="truncate max-w-[120px]">{selectedCompanyName}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform flex-shrink-0 ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCompanyDropdown && (
                    <div className="absolute top-full mt-1 right-0 min-w-[220px] bg-white border border-[#D1D1D6] rounded-[12px] shadow-lg z-10 flex flex-col">
                      {/* Search */}
                      <div className="px-3 pt-3 pb-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AEAEB2]" />
                          <input
                            type="text"
                            placeholder="Search company"
                            value={companySearchQuery}
                            onChange={(e) => setCompanySearchQuery(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 border border-[#E5E7EB]"
                          />
                        </div>
                      </div>
                      {/* Options list */}
                      <div className="min-w-[220px] max-h-[220px] overflow-y-auto px-1.5">
                        {companyOptions
                          .filter(option =>
                            companySearchQuery.trim() === '' ||
                            option.name.toLowerCase().includes(companySearchQuery.toLowerCase())
                          )
                          .map(option => {
                            const logo = option.id !== null ? companyLogos[option.name] : null;
                            const isSelected = pendingCompanyId === option.id;
                            return (
                              <button
                                key={option.id ?? 'all'}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isSelected
                                    ? 'bg-[#E7EDFF] text-[#0F47F2]'
                                    : 'text-[#4B5563] hover:bg-[#F3F5F7]'
                                  }`}
                                onClick={() => handleCompanySelect(option)}
                              >
                                {/* Logo or initial */}
                                {option.id !== null ? (
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50 border border-[#E5E7EB]">
                                    {logo ? (
                                      <img src={logo} alt={option.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <span className="text-[10px] font-semibold text-[#8E8E93]">
                                        {option.name.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                ) : null}
                                <span className="truncate">{option.name}</span>
                              </button>
                            );
                          })}
                      </div>
                      {/* Apply button */}
                      <div className="px-3 py-2.5 border-t border-[#E5E7EB]">
                        <button
                          onClick={handleCompanyApply}
                          className="w-full py-2 rounded-lg bg-[#0F47F2] text-white text-sm font-medium hover:bg-[#0D3ED4] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="flex items-center gap-3 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] bg-white border-[0.5px] border-[#D1D1D6] min-w-[140px]"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 1.66675V3.33341M5 1.66675V3.33341" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M8.33333 14.1666L8.33332 11.1226C8.33332 10.9628 8.21938 10.8333 8.07882 10.8333H7.5M11.358 14.1666L12.4868 11.1242C12.5396 10.982 12.4274 10.8333 12.2672 10.8333H10.8333" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M2.08301 10.2027C2.08301 6.57161 2.08301 4.75607 3.12644 3.62803C4.16987 2.5 5.84925 2.5 9.20801 2.5H10.7913C14.1501 2.5 15.8295 2.5 16.8729 3.62803C17.9163 4.75607 17.9163 6.57161 17.9163 10.2027V10.6306C17.9163 14.2617 17.9163 16.0773 16.8729 17.2053C15.8295 18.3333 14.1501 18.3333 10.7913 18.3333H9.20801C5.84925 18.3333 4.16987 18.3333 3.12644 17.2053C2.08301 16.0773 2.08301 14.2617 2.08301 10.6306V10.2027Z" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 6.66675H15" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    {dateRange}
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full mt-1 right-0 z-20">
                      <CustomDateSelector
                        onApply={handleDateRangeApply}
                        onClose={() => setShowDateDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {priorityLoading
                ? [...Array(3)].map((_, i) => (
                  <div key={`col-skel-${i}`} className="bg-[#F3F5F7] rounded-xl p-2.5 animate-pulse min-h-[200px]">
                    <div className="flex items-center justify-between px-1 py-1 mb-2">
                      <div className="w-20 h-4 rounded bg-gray-200" />
                      <div className="w-12 h-4 rounded bg-gray-200" />
                    </div>
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="bg-white rounded-lg p-3 mb-2">
                        <div className="w-24 h-3 rounded bg-gray-200 mb-2" />
                        <div className="w-32 h-3 rounded bg-gray-200 mb-2" />
                        <div className="w-16 h-3 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ))
                : dynamicPriorityColumns.map((column, colIndex) => {
                  const tabKey = PRIORITY_TABS[colIndex]?.key || 'sourcing';
                  return (
                    <div key={column.id} className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[400px] hide-scrollbar">
                      <div className="flex items-center justify-between px-1 py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: column.dotColor }}></div>
                          <span className="text-sm font-normal text-[#4B5563] leading-[17px]">{column.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal" style={{ color: column.accentColor }}>{column.totalCount}</span>
                        </div>
                      </div>
                      {column.cards.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-sm text-[#8E8E93]">
                          No items
                        </div>
                      )}
                      {column.cards.map((card) => (
                        <PriorityCard
                          key={card.id}
                          name={card.name}
                          role={card.role}
                          company={card.company}
                          daysAgo={card.daysAgo}
                          status={card.status}
                          statusColor={card.statusColor}
                          isDone={card.isDone}
                          onClick={() => handlePriorityCardClick(card, tabKey)}
                        />
                      ))}
                    </div>
                  );
                })}
            </div>
          </section>

          {/* Talent Matches from API or fallback */}
          <section className="bg-white rounded-[10px] p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium leading-6 text-black">Auto Pilot</h2>
              <div className="flex items-end gap-3">
                <div className="relative" ref={talentMatchJobDropdownRef}>
                  <button
                    onClick={() => {
                      if (!showTalentMatchJobDropdown) {
                        setPendingJobId(talentMatchSelectedJob.id);
                        setPendingJobTitle(talentMatchSelectedJob.title);
                        setJobSearchQuery('');
                      }
                      setShowTalentMatchJobDropdown(!showTalentMatchJobDropdown);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] leading-[17px] bg-white border border-[#D1D1D6] min-w-[140px] justify-between transition-colors hover:bg-gray-50"
                  >
                    <span className="truncate max-w-[150px]">{talentMatchSelectedJob.title}</span>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform flex-shrink-0 ${showTalentMatchJobDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showTalentMatchJobDropdown && (
                    <div className="absolute top-full mt-1 right-0 min-w-[220px] bg-white border border-[#D1D1D6] rounded-[12px] shadow-lg z-10 flex flex-col">
                      {/* Search */}
                      <div className="px-3 pt-3 pb-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AEAEB2]" />
                          <input
                            type="text"
                            placeholder="Search job"
                            value={jobSearchQuery}
                            onChange={(e) => setJobSearchQuery(e.target.value)}
                            className="w-full h-8 pl-8 pr-3 rounded-lg text-xs text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 border border-[#E5E7EB]"
                          />
                        </div>
                      </div>
                      {/* Options list */}
                      <div className="max-h-[220px] overflow-y-auto px-1.5">
                        {/* All Jobs option */}
                        {(jobSearchQuery.trim() === '' || 'all jobs'.includes(jobSearchQuery.toLowerCase())) && (
                          <button
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${pendingJobId === null
                                ? 'bg-[#E7EDFF] text-[#0F47F2]'
                                : 'text-[#4B5563] hover:bg-[#F3F5F7]'
                              }`}
                            onClick={() => {
                              setPendingJobId(null);
                              setPendingJobTitle('All Jobs');
                            }}
                          >
                            <span className="truncate">All Jobs</span>
                          </button>
                        )}
                        {talentMatchJobs
                          .filter(job =>
                            jobSearchQuery.trim() === '' ||
                            job.title.toLowerCase().includes(jobSearchQuery.toLowerCase())
                          )
                          .map(job => (
                            <button
                              key={job.id}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${pendingJobId === job.id
                                  ? 'bg-[#E7EDFF] text-[#0F47F2]'
                                  : 'text-[#4B5563] hover:bg-[#F3F5F7]'
                                }`}
                              onClick={() => {
                                setPendingJobId(job.id);
                                setPendingJobTitle(job.title);
                              }}
                            >
                              <span className="truncate">{job.title}</span>
                            </button>
                          ))}
                      </div>
                      {/* Apply button */}
                      <div className="px-3 py-2.5 border-t border-[#E5E7EB]">
                        <button
                          onClick={() => {
                            setTalentMatchSelectedJob({ id: pendingJobId, title: pendingJobTitle });
                            setShowTalentMatchJobDropdown(false);
                            setJobSearchQuery('');
                          }}
                          className="w-full py-2 rounded-lg bg-[#0F47F2] text-white text-sm font-medium hover:bg-[#0D3ED4] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowTalentMatchDateDropdown(!showTalentMatchDateDropdown)}
                    className="flex items-center gap-3 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] bg-white border-[0.5px] border-[#D1D1D6] min-w-[140px]"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 1.66675V3.33341M5 1.66675V3.33341" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M8.33333 14.1666L8.33332 11.1226C8.33332 10.9628 8.21938 10.8333 8.07882 10.8333H7.5M11.358 14.1666L12.4868 11.1242C12.5396 10.982 12.4274 10.8333 12.2672 10.8333H10.8333" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M2.08301 10.2027C2.08301 6.57161 2.08301 4.75607 3.12644 3.62803C4.16987 2.5 5.84925 2.5 9.20801 2.5H10.7913C14.1501 2.5 15.8295 2.5 16.8729 3.62803C17.9163 4.75607 17.9163 6.57161 17.9163 10.2027V10.6306C17.9163 14.2617 17.9163 16.0773 16.8729 17.2053C15.8295 18.3333 14.1501 18.3333 10.7913 18.3333H9.20801C5.84925 18.3333 4.16987 18.3333 3.12644 17.2053C2.08301 16.0773 2.08301 14.2617 2.08301 10.6306V10.2027Z" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 6.66675H15" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    {talentMatchDateRange}
                  </button>
                  {showTalentMatchDateDropdown && (
                    <div className="absolute top-full mt-1 right-0 z-20">
                      <CustomDateSelector
                        onApply={handleTalentMatchDateRangeApply}
                        onClose={() => setShowTalentMatchDateDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {talentMatchesLoading
                ? [...Array(3)].map((_, i) => (
                  <div key={`tm-skel-${i}`} className="bg-white p-5 rounded-[10px] flex items-center justify-between animate-pulse" style={{ border: '1px solid #D1D1D6' }}>
                    <div className="flex flex-col gap-2">
                      <div className="w-32 h-4 rounded bg-gray-200" />
                      <div className="w-48 h-3 rounded bg-gray-200" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  </div>
                ))
                : dynamicTalentMatches.length > 0 ? (
                  dynamicTalentMatches.map((match) => (
                    <TalentMatchCard
                      key={match.id}
                      name={match.name}
                      company={match.company}
                      position={match.position}
                      experience={match.experience}
                      matchPercentage={match.matchPercentage}
                      source={match.source}
                      onClick={() => handleTalentMatchClick(match.name)}
                      onSkip={() => {
                        const mc = modalCandidates.find((c: any) => c.name === match.name);
                        if (mc?.nbcId) handleSkipTalentMatch(mc.nbcId);
                      }}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-[#8E8E93]">
                    No immediate talent matches
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="w-96 flex flex-col gap-4 shrink-0">
          <CalendarWidget
            onDateClick={handleDateClick}
            activities={[]} /* TODO: replace with API data — see suggested API structure */
          />
          <ScheduleWidget items={dynamicScheduleItems} isLoading={loading} onEventClick={handleScheduleEventClick} />
          <RecentActivities />
        </aside>
      </div>

      {/* Action Review Modal — now driven by real API data */}
      <ActionReviewModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionModalCandidateData(null);
        }}
        candidateData={actionModalCandidateData}
        isLoading={actionModalLoading}
        currentIndex={actionModalCurrentIndex}
        totalCount={actionModalCards.length}
        currentItem={actionModalCards[actionModalCurrentIndex] || null}
        onNavigate={handleActionModalNavigate}
        tab={actionModalTab}
        onComplete={async (applicationId: number, actionTaken: string) => {
          try {
            await dashboardService.completePriorityAction({
              application_id: applicationId,
              tab: actionModalTab,
              action_taken: actionTaken,
            });
            // Refresh priority actions
            fetchPriorityActions();
          } catch (err) {
            console.error('Failed to complete action:', err);
          }
        }}
      />
      {/* New Match Candidate Modal */}
      <NewMatchCandidateModal
        isOpen={isNewMatchModalOpen}
        onClose={() => {
          setIsNewMatchModalOpen(false);
          setNewMatchCandidateData(null);
        }}
        candidates={modalCandidates}
        candidateData={newMatchCandidateData}
        isLoading={newMatchLoading}
        currentIndex={newMatchCurrentIndex}
        onNavigate={handleNewMatchModalNavigate}
        onSkipped={refreshTalentMatches}
      />
      {/* Schedule Event Modal */}
      <ScheduleEventModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        events={scheduleEventsData}
        initialIndex={scheduleInitialIndex}
      />
      {/* Date-Wise Agenda Modal */}
      <DateWiseAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        agenda={dailyAgendaData}
      />
      {/* Daily Activities Modal — for past dates */}
      <DailyActivitiesModal
        isOpen={isDailyActivitiesModalOpen}
        onClose={() => setIsDailyActivitiesModalOpen(false)}
      />
    </div>
  );
}
