import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Building2,
  User,
  Calendar,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PriorityCard from './components/PriorityCard';
import CalendarWidget from './components/CalendarWidget';
import ScheduleWidget, { ScheduleFilterLabel } from './components/ScheduleWidget';
import CustomDateSelector from './components/CustomDateSelector';
import MoveStageModal from './components/MoveStageModal';
import ScheduleEventModal from './components/ScheduleEventModal';
import DateWiseAgendaModal from './components/DateWiseAgendaModal';
import DailyActivitiesModal from './components/DailyActivitiesModal';
import { useAuth } from '../../hooks/useAuth';
import dashboardService, {
  PriorityActionItem,
  PriorityActionsResponse,
  PriorityTab,
  DateRangePreset,
  CalendarDayActivityAPI,
  ScheduleEventAPI,
  ScheduleFilterType,
  AgendaResponse,
  DailyActivitiesResponse,
} from '../../services/dashboardService';
import { callService } from '../../services/callService';
import organizationService, { DiscoverWorkspace } from '../../services/organizationService';
import apiClient from '../../services/api';
import { showToast } from '../../utils/toast';

interface CompanyOption {
  id: number | null;
  name: string;
}

export type PriorityStageTab = 'sourcing' | 'screening' | 'interview';
export type SortOption = 'oldest' | 'newest' | 'score';

interface CardItemDisplay {
  id: string;
  name: string;
  role: string;
  company: string;
  daysAgo: number;
  status: string;
  stageTab: 'sourcing' | 'screening' | 'interview';
  applicationId: number;
  candidateId: string;
  jobRoleId: number;
  workspaceId: number;
  recruiterName?: string | null;
  score?: number | null;
  scoreLabel?: string;
  resumeScore?: number | null;
  screeningScore?: number | null;
  experience?: string;
  location?: string;
  salary?: string;
  phone?: string;
  resumeUrl?: string;
  nextStageId?: number;
  archiveStageId?: number;
  currentStageId?: number;
  currentStageName?: string;
}

// Helper to format Date to YYYY-MM-DD
const formatDateToYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  // ── Priority Actions Data ──
  const [priorityData, setPriorityData] = useState<Record<PriorityTab, PriorityActionsResponse | null>>({
    sourcing: null,
    screening: null,
    interview: null,
  });
  const [priorityLoading, setPriorityLoading] = useState(true);

  // Active Stage Tab: 'sourcing' | 'screening' | 'interview'
  const [activeTab, setActiveTab] = useState<PriorityStageTab>('sourcing');

  // Sorting: 'oldest' | 'newest' | 'score'
  const [sortBy, setSortBy] = useState<SortOption>('oldest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination (4 candidates per page for a spacious, uncluttered first screen)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Filter States: Company
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState('Company');
  const [pendingCompanyId, setPendingCompanyId] = useState<number | null>(null);
  const [pendingCompanyName, setPendingCompanyName] = useState('Company');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const [companyLogos, setCompanyLogos] = useState<Record<string, string | null>>({});
  const logoRequestedRef = useRef<Set<string>>(new Set());

  // Filter States: Recruiter
  const [selectedRecruiterName, setSelectedRecruiterName] = useState<string | null>(null);
  const [pendingRecruiterName, setPendingRecruiterName] = useState<string | null>(null);
  const [showRecruiterDropdown, setShowRecruiterDropdown] = useState(false);
  const [recruiterSearchQuery, setRecruiterSearchQuery] = useState('');
  const recruiterDropdownRef = useRef<HTMLDivElement>(null);

  // Filter States: Date Range
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('last_1_week');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);

  // Action Loading & Modal states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Move Stage Modal state (Requirement 4 & 5)
  const [isMoveStageModalOpen, setIsMoveStageModalOpen] = useState(false);
  const [moveStageCandidate, setMoveStageCandidate] = useState<CardItemDisplay | null>(null);

  // ── Calendar & Schedule States (Preserved per Requirement 1) ──
  const [calendarActivities, setCalendarActivities] = useState<CalendarDayActivityAPI[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventAPI[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeScheduleFilter, setActiveScheduleFilter] = useState<ScheduleFilterLabel>('Upcoming');
  const [selectedScheduleEventIndex, setSelectedScheduleEventIndex] = useState(0);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isDailyActivitiesModalOpen, setIsDailyActivitiesModalOpen] = useState(false);
  const [, setSelectedCalendarDate] = useState<Date | null>(null);
  const [agendaData, setAgendaData] = useState<AgendaResponse | null>(null);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [dailyActivitiesData, setDailyActivitiesData] = useState<DailyActivitiesResponse | null>(null);
  const [dailyActivitiesLoading, setDailyActivitiesLoading] = useState(false);

  // Dropdown outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (recruiterDropdownRef.current && !recruiterDropdownRef.current.contains(event.target as Node)) {
        setShowRecruiterDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch company list
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

        if (myWsData.workspaces) {
          for (const ws of myWsData.workspaces) {
            if (!seen.has(ws.id)) {
              seen.add(ws.id);
              options.push({ id: ws.id, name: ws.name });
            }
          }
        }
        if (Array.isArray(discoverWs)) {
          for (const ws of discoverWs) {
            if (!seen.has(ws.id)) {
              seen.add(ws.id);
              options.push({ id: ws.id, name: ws.name });
            }
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

  // Company logo fetch
  const fetchCompanyLogo = async (query: string) => {
    if (!query || logoRequestedRef.current.has(query)) return;
    logoRequestedRef.current.add(query);
    try {
      const response = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_LOGO_DEV_API_KEY}`,
        },
      });
      const data = await response.json();
      const logoUrl = data.length > 0 ? data[0].logo_url : null;
      setCompanyLogos((prev) => ({ ...prev, [query]: logoUrl }));
    } catch {
      setCompanyLogos((prev) => ({ ...prev, [query]: null }));
    }
  };

  useEffect(() => {
    companyOptions.forEach((option) => {
      if (option.name && option.id !== null && !logoRequestedRef.current.has(option.name)) {
        fetchCompanyLogo(option.name);
      }
    });
  }, [companyOptions]);

  // Recruiter options
  const recruiterOptions = useMemo(() => {
    const recruitersSet = new Set<string>();
    (['sourcing', 'screening', 'interview'] as PriorityTab[]).forEach((tabKey) => {
      const results = priorityData[tabKey]?.results || [];
      results.forEach((item) => {
        if (item.recruiter_name && typeof item.recruiter_name === 'string' && item.recruiter_name.trim() !== '') {
          recruitersSet.add(item.recruiter_name.trim());
        }
      });
    });
    return Array.from(recruitersSet).sort();
  }, [priorityData]);

  // Fetch priority actions
  const fetchPriorityActions = useCallback(async () => {
    if (!isAuthenticated) return;
    setPriorityLoading(true);
    try {
      const commonParams = {
        date_range: dateRangePreset,
        start_date: dateRangePreset === 'custom' ? customStartDate : undefined,
        end_date: dateRangePreset === 'custom' ? customEndDate : undefined,
        workspace_id: selectedCompanyId ?? undefined,
        recruiter_name: selectedRecruiterName ?? undefined,
        page_size: 100,
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
  }, [isAuthenticated, dateRangePreset, customStartDate, customEndDate, selectedCompanyId, selectedRecruiterName]);

  useEffect(() => {
    fetchPriorityActions();
  }, [fetchPriorityActions]);

  // ── Calendar & Schedule Data Fetching (Preserved) ──
  const fetchCalendarActivity = async (month: number, year: number) => {
    setCalendarLoading(true);
    try {
      const response = await dashboardService.getCalendarActivity(month, year);
      let allDays = [...(response?.days || [])];

      const now = new Date();
      if (year === now.getFullYear() && month === now.getMonth() + 1) {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        try {
          const prevResponse = await dashboardService.getCalendarActivity(prevMonth, prevYear);
          if (prevResponse?.days) {
            allDays = [...prevResponse.days, ...allDays];
          }
        } catch {
          // Ignore
        }
      }

      setCalendarActivities(allDays);
    } catch (err) {
      console.error('Failed to fetch calendar activity:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchScheduleEvents = useCallback(async (filterLabel: ScheduleFilterLabel) => {
    setScheduleLoading(true);
    try {
      let filter: ScheduleFilterType = 'upcoming';
      let date: string | undefined = undefined;
      const now = new Date();
      if (filterLabel === 'Tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        date = formatDateToYMD(tomorrow);
      } else {
        filter = filterLabel.toLowerCase() as ScheduleFilterType;
      }
      const response = await dashboardService.getScheduleEvents({ filter, date });
      setScheduleEvents(response.events);
    } catch (err) {
      console.error('Failed to fetch schedule events:', err);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const now = new Date();
    fetchCalendarActivity(now.getMonth() + 1, now.getFullYear());
    fetchScheduleEvents('Upcoming');
  }, [isAuthenticated, fetchScheduleEvents]);

  const handleScheduleEventClick = (_event: ScheduleEventAPI, index: number) => {
    setSelectedScheduleEventIndex(index);
    setIsScheduleModalOpen(true);
  };

  const handleDateClick = async (date: Date, isTodayOrFuture: boolean) => {
    setSelectedCalendarDate(date);
    const dateStr = formatDateToYMD(date);
    if (isTodayOrFuture) {
      setIsAgendaModalOpen(true);
      setAgendaLoading(true);
      try {
        const data = await dashboardService.getAgenda(dateStr);
        setAgendaData(data);
      } catch (err) {
        console.error('Failed to fetch agenda:', err);
        setAgendaData(null);
      } finally {
        setAgendaLoading(false);
      }
    } else {
      setIsDailyActivitiesModalOpen(true);
      setDailyActivitiesLoading(true);
      try {
        const data = await dashboardService.getDailyActivities(dateStr);
        setDailyActivitiesData(data);
      } catch (err) {
        console.error('Failed to fetch daily activities:', err);
        setDailyActivitiesData(null);
      } finally {
        setDailyActivitiesLoading(false);
      }
    }
  };

  // Date Range Selection
  const handleDateRangeApply = (range: { start?: Date; end?: Date; label: string }) => {
    let preset: DateRangePreset = 'last_1_week';
    let startStr: string | undefined = undefined;
    let endStr: string | undefined = undefined;

    if (range.label === 'Today') {
      preset = 'today';
    } else if (range.label === 'Last 7 Days') {
      preset = 'last_1_week';
    } else if (range.label === 'Last 1 Month') {
      preset = 'last_month';
    } else {
      preset = 'custom';
      if (range.start) startStr = formatDateToYMD(range.start);
      if (range.end) endStr = formatDateToYMD(range.end);
    }

    setDateRangePreset(preset);
    setDateRange(range.label);
    setCustomStartDate(startStr);
    setCustomEndDate(endStr);
    setShowDateDropdown(false);
    setCurrentPage(1);
  };

  // Company Select
  const handleToggleCompanyDropdown = () => {
    if (!showCompanyDropdown) {
      setPendingCompanyId(selectedCompanyId);
      setPendingCompanyName(selectedCompanyName);
      setCompanySearchQuery('');
    }
    setShowCompanyDropdown(!showCompanyDropdown);
  };

  const handleCompanySelect = (option: CompanyOption) => {
    setPendingCompanyId(option.id);
    setPendingCompanyName(option.id === null ? 'Company' : option.name);
  };

  const handleCompanyApply = () => {
    setSelectedCompanyId(pendingCompanyId);
    setSelectedCompanyName(pendingCompanyName);
    setShowCompanyDropdown(false);
    setCompanySearchQuery('');
    setCurrentPage(1);
  };

  // Recruiter Select
  const handleToggleRecruiterDropdown = () => {
    if (!showRecruiterDropdown) {
      setPendingRecruiterName(selectedRecruiterName);
      setRecruiterSearchQuery('');
    }
    setShowRecruiterDropdown(!showRecruiterDropdown);
  };

  const handleRecruiterSelect = (name: string | null) => {
    setPendingRecruiterName(name);
  };

  const handleRecruiterApply = () => {
    setSelectedRecruiterName(pendingRecruiterName);
    setShowRecruiterDropdown(false);
    setRecruiterSearchQuery('');
    setCurrentPage(1);
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedCompanyId(null);
    setSelectedCompanyName('Company');
    setPendingCompanyId(null);
    setPendingCompanyName('Company');

    setSelectedRecruiterName(null);
    setPendingRecruiterName(null);

    setDateRangePreset('last_1_week');
    setDateRange('Last 7 Days');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);

    setActiveTab('sourcing');
    setSortBy('oldest');
    setCurrentPage(1);
  };

  // Map API item to display card
  const mapItemToDisplayCard = (
    item: PriorityActionItem,
    tabKey: 'sourcing' | 'screening' | 'interview'
  ): CardItemDisplay => {
    // 1. Resume Score
    let resumeScore: number | null = item.resume_score ?? (item as any).candidate_resume_score ?? null;
    if (resumeScore != null) {
      if (resumeScore <= 1 && resumeScore > 0) resumeScore = Math.round(resumeScore * 100);
      else if (resumeScore > 100) resumeScore = Math.min(Math.round(resumeScore), 100);
      else resumeScore = Math.round(resumeScore);
    }

    // 2. Screening Score
    let screeningScore: number | null = null;
    if ((item as any).screening_score != null) {
      screeningScore = Number((item as any).screening_score);
    } else if (item.screening_round != null && !isNaN(Number(item.screening_round))) {
      screeningScore = Number(item.screening_round);
    } else if ((item as any).screening_score_value != null) {
      screeningScore = Number((item as any).screening_score_value);
    } else if ((item as any).interview_score != null) {
      screeningScore = Number((item as any).interview_score);
    } else if ((item as any).score != null) {
      screeningScore = Number((item as any).score);
    }

    if (screeningScore != null) {
      if (screeningScore <= 1 && screeningScore > 0) screeningScore = Math.round(screeningScore * 100);
      else if (screeningScore > 100) screeningScore = Math.min(Math.round(screeningScore), 100);
      else screeningScore = Math.round(screeningScore);
    }

    const score = tabKey === 'sourcing' ? resumeScore : (screeningScore ?? resumeScore);
    const scoreLabel =
      tabKey === 'sourcing' ? 'Resume Score' : tabKey === 'screening' ? 'Screening Score' : 'Interview Score';

    const rawTag = item.tags && item.tags.length > 0 ? item.tags[0] : item.current_stage_name;

    let experience = (item as any).experience || null;
    if (!experience && (item as any).total_experience != null) {
      experience = `${(item as any).total_experience} yrs`;
    } else if (!experience && (item as any).experience_years != null) {
      experience = `${(item as any).experience_years} yrs`;
    }

    const location = (item as any).location
      ? `+ ${(item as any).location}`
      : (item as any).work_mode
      ? `+ ${(item as any).work_mode}`
      : '+ Onsite';

    const salary = (item as any).expected_ctc || (item as any).salary || (item as any).current_ctc || null;

    return {
      id: `pa-${item.application_id}`,
      name: item.candidate_full_name,
      role: item.job_role || item.role,
      company: item.workspace_name,
      daysAgo: item.days_in_current_stage ?? 0,
      status: rawTag,
      stageTab: tabKey,
      applicationId: item.application_id,
      candidateId: item.candidate_id,
      jobRoleId: item.job_role_id,
      workspaceId: item.workspace_id,
      recruiterName: item.recruiter_name,
      score,
      scoreLabel,
      resumeScore,
      screeningScore,
      experience: experience || '2–5 yrs',
      location,
      salary: salary || '₹12L – 18LPA',
      phone: (item as any).phone,
      resumeUrl: (item as any).resume_url,
      nextStageId: item.next_stage_id,
      archiveStageId: item.archive_stage_id,
      currentStageId: item.current_stage_id,
      currentStageName: item.current_stage_name,
    };
  };

  // Card lists for each stage
  const sourcingCards = useMemo(() => {
    let items = priorityData.sourcing?.results || [];
    if (selectedRecruiterName) {
      items = items.filter((item) => item.recruiter_name === selectedRecruiterName);
    }
    return items.map((item) => mapItemToDisplayCard(item, 'sourcing'));
  }, [priorityData.sourcing, selectedRecruiterName]);

  const screeningCards = useMemo(() => {
    let items = priorityData.screening?.results || [];
    if (selectedRecruiterName) {
      items = items.filter((item) => item.recruiter_name === selectedRecruiterName);
    }
    return items.map((item) => mapItemToDisplayCard(item, 'screening'));
  }, [priorityData.screening, selectedRecruiterName]);

  const interviewCards = useMemo(() => {
    let items = priorityData.interview?.results || [];
    if (selectedRecruiterName) {
      items = items.filter((item) => item.recruiter_name === selectedRecruiterName);
    }
    return items.map((item) => mapItemToDisplayCard(item, 'interview'));
  }, [priorityData.interview, selectedRecruiterName]);

  // Tab counts
  const sourcingCount = priorityData.sourcing?.count ?? sourcingCards.length;
  const screeningCount = priorityData.screening?.count ?? screeningCards.length;
  const interviewCount = priorityData.interview?.count ?? interviewCards.length;

  // Active sorted cards
  const activeCards = useMemo(() => {
    let list: CardItemDisplay[] = [];
    if (activeTab === 'sourcing') {
      list = sourcingCards;
    } else if (activeTab === 'screening') {
      list = screeningCards;
    } else if (activeTab === 'interview') {
      list = interviewCards;
    }

    const sorted = [...list];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => b.daysAgo - a.daysAgo);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => a.daysAgo - b.daysAgo);
    } else if (sortBy === 'score') {
      sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return sorted;
  }, [activeTab, sourcingCards, screeningCards, interviewCards, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(activeCards.length / pageSize));
  const paginatedCards = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return activeCards.slice(startIdx, startIdx + pageSize);
  }, [activeCards, currentPage, pageSize]);

  // ── Requirement 2: Click entire candidate card & redirect to Candidate Details page ──
  const handleCandidateClick = async (card: CardItemDisplay) => {
    try {
      sessionStorage.setItem('nxthyre_companies_wsId', String(card.workspaceId));
      sessionStorage.setItem('nxthyre_companies_jobId', String(card.jobRoleId));

      let candidatePayload: any = {
        id: card.applicationId,
        candidate_id: card.candidateId,
        candidate: {
          id: card.candidateId,
          full_name: card.name,
        },
      };

      try {
        const fullData = await dashboardService.getCandidateDetails(card.applicationId, card.jobRoleId);
        if (fullData) {
          candidatePayload = fullData;
        }
      } catch {
        // Fallback
      }

      sessionStorage.setItem(`_nxthyre_selected_candidate_${card.jobRoleId}`, JSON.stringify(candidatePayload));
      sessionStorage.setItem('nxthyre_activeTab', 'companies');
      window.dispatchEvent(new CustomEvent('tab-switch', { detail: { page: 'companies' } }));
    } catch (error) {
      console.error('Failed to redirect to candidate details:', error);
    }
  };

  // ── Requirement 3: Sourcing – Phone icon navigates to Call page ──
  const handleCallClick = (e: React.MouseEvent, card: CardItemDisplay) => {
    e.stopPropagation();
    try {
      sessionStorage.setItem('nxthyre_companies_wsId', String(card.workspaceId));
      sessionStorage.setItem('nxthyre_companies_jobId', String(card.jobRoleId));
      sessionStorage.setItem('nxthyre_activeTab', 'call');

      sessionStorage.setItem(
        '_nxthyre_call_state',
        JSON.stringify({
          candidate: {
            id: card.candidateId,
            name: card.name,
            role: card.role,
            phone: card.phone || '',
            avatarInitials: card.name
              .split(' ')
              .slice(0, 2)
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          },
          jobId: card.jobRoleId,
          workspaceId: card.workspaceId,
        })
      );

      window.dispatchEvent(new CustomEvent('tab-switch', { detail: { page: 'call' } }));
    } catch (err) {
      console.error('Failed to navigate to call page:', err);
    }
  };

  // ── Requirement 3 & 4: Screening – Shortlist icon triggers Shortlist API ──
  const handleShortlist = async (e: React.MouseEvent, card: CardItemDisplay) => {
    e.stopPropagation();
    setActionLoadingId(card.applicationId);
    try {
      await callService.shortlistCandidate(card.applicationId, card.nextStageId, card.jobRoleId);

      await dashboardService.completePriorityAction({
        application_id: card.applicationId,
        tab: 'screening',
        action_taken: 'Shortlisted',
      });

      showToast.success('Candidate shortlisted successfully');
      await fetchPriorityActions();
    } catch (err: any) {
      console.error('Failed to shortlist candidate:', err);
      showToast.error(
        err.response?.data?.detail || err.response?.data?.error || 'Failed to shortlist candidate'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Requirement 3, 4 & 5: Interview – Move Stage icon triggers Move Stage modal ──
  const handleOpenMoveStage = (e: React.MouseEvent, card: CardItemDisplay) => {
    e.stopPropagation();
    setMoveStageCandidate(card);
    setIsMoveStageModalOpen(true);
  };

  // ── Archive candidate handler (Delete icon) ──
  const handleArchive = async (e: React.MouseEvent, card: CardItemDisplay) => {
    e.stopPropagation();
    setActionLoadingId(card.applicationId);
    try {
      if (card.archiveStageId) {
        await apiClient.patch(`/jobs/applications/${card.applicationId}/`, {
          current_stage: card.archiveStageId,
          status: 'ARCHIVED',
          archive_reason: 'Archived from priority actions',
        });
      } else {
        await apiClient.patch(`/jobs/applications/${card.applicationId}/`, {
          status: 'ARCHIVED',
          archive_reason: 'Archived from priority actions',
        });
      }

      await dashboardService.completePriorityAction({
        application_id: card.applicationId,
        tab: card.stageTab,
        action_taken: 'Archived',
      });

      showToast.success('Candidate moved to archive');
      await fetchPriorityActions();
    } catch (err: any) {
      console.error('Failed to archive candidate:', err);
      showToast.error(
        err.response?.data?.detail || err.response?.data?.error || 'Failed to archive candidate'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden h-full min-h-0 bg-[#F4F5F7]">
      {/* ── Two-Column Layout: Left (Priority Actions) | Right (Calendar & Schedule) ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden h-full">
        {/* ═══════════════ LEFT COLUMN: PRIORITY ACTIONS SECTION ═══════════════ */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden h-full">
          <section className="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden h-full border border-slate-200/80 shadow-2xs">
            {/* Top Header: Title + Subtitle + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">Priority Actions</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Candidates requiring your attention</p>
              </div>

              {/* Filters on top right: Company, Recruiter, Date, Reset */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Company Filter Dropdown */}
                <div className="relative" ref={companyDropdownRef}>
                  <button
                    type="button"
                    onClick={handleToggleCompanyDropdown}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4B5563] bg-white border border-[#D1D1D6] hover:bg-slate-50 transition-colors min-w-[110px] justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {selectedCompanyId !== null && companyLogos[selectedCompanyName] ? (
                        <img
                          src={companyLogos[selectedCompanyName]!}
                          alt=""
                          className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                        />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      )}
                      <span className="truncate max-w-[90px]">{selectedCompanyName}</span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${
                        showCompanyDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showCompanyDropdown && (
                    <div className="absolute top-full mt-1 right-0 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search company"
                            value={companySearchQuery}
                            onChange={(e) => setCompanySearchQuery(e.target.value)}
                            className="w-full h-7 pl-8 pr-2.5 rounded-lg text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F47F2] border border-slate-200"
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar p-1">
                        {companyOptions
                          .filter(
                            (opt) =>
                              companySearchQuery.trim() === '' ||
                              opt.name.toLowerCase().includes(companySearchQuery.toLowerCase())
                          )
                          .map((opt) => {
                            const isSelected = pendingCompanyId === opt.id;
                            return (
                              <button
                                key={opt.id ?? 'all'}
                                type="button"
                                onClick={() => handleCompanySelect(opt)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                  isSelected
                                    ? 'bg-blue-50 text-[#0F47F2] font-semibold'
                                    : 'text-[#334155] hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{opt.name}</span>
                              </button>
                            );
                          })}
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-slate-50">
                        <button
                          type="button"
                          onClick={handleCompanyApply}
                          className="w-full py-1.5 rounded-lg bg-[#0F47F2] hover:bg-[#0D3ED4] text-white text-xs font-medium transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recruiter Filter Dropdown */}
                <div className="relative" ref={recruiterDropdownRef}>
                  <button
                    type="button"
                    onClick={handleToggleRecruiterDropdown}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4B5563] bg-white border border-[#D1D1D6] hover:bg-slate-50 transition-colors min-w-[110px] justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      <span className="truncate max-w-[90px]">{selectedRecruiterName || 'Recruiter'}</span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${
                        showRecruiterDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showRecruiterDropdown && (
                    <div className="absolute top-full mt-1 right-0 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search recruiter"
                            value={recruiterSearchQuery}
                            onChange={(e) => setRecruiterSearchQuery(e.target.value)}
                            className="w-full h-7 pl-8 pr-2.5 rounded-lg text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F47F2] border border-slate-200"
                          />
                        </div>
                      </div>
                      <div className="max-h-44 overflow-y-auto custom-scrollbar p-1">
                        <button
                          type="button"
                          onClick={() => handleRecruiterSelect(null)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                            pendingRecruiterName === null
                              ? 'bg-blue-50 text-[#0F47F2] font-semibold'
                              : 'text-[#334155] hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">All Recruiters</span>
                        </button>
                        {recruiterOptions
                          .filter(
                            (rec) =>
                              recruiterSearchQuery.trim() === '' ||
                              rec.toLowerCase().includes(recruiterSearchQuery.toLowerCase())
                          )
                          .map((rec) => {
                            const isSelected = pendingRecruiterName === rec;
                            return (
                              <button
                                key={rec}
                                type="button"
                                onClick={() => handleRecruiterSelect(rec)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                  isSelected
                                    ? 'bg-blue-50 text-[#0F47F2] font-semibold'
                                    : 'text-[#334155] hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{rec}</span>
                              </button>
                            );
                          })}
                      </div>
                      <div className="p-2 border-t border-slate-100 bg-slate-50">
                        <button
                          type="button"
                          onClick={handleRecruiterApply}
                          className="w-full py-1.5 rounded-lg bg-[#0F47F2] hover:bg-[#0D3ED4] text-white text-xs font-medium transition-colors"
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
                    type="button"
                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#4B5563] bg-white border border-[#D1D1D6] hover:bg-slate-50 transition-colors min-w-[110px] justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      <span className="truncate">{dateRange}</span>
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${
                        showDateDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showDateDropdown && (
                    <div className="absolute top-full mt-1 right-0 z-30">
                      <CustomDateSelector
                        currentPreset={dateRange}
                        onApply={handleDateRangeApply}
                        onClose={() => setShowDateDropdown(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Reset / Refresh Button */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-8 h-8 rounded-xl bg-white border border-[#D1D1D6] hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors shadow-2xs"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stage Tabs & Sort By Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Stage Tabs (Sourcing, Screening, Interview) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Sourcing Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sourcing');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'sourcing'
                      ? 'bg-[#0F47F2] text-white shadow-2xs'
                      : 'bg-white text-[#475569] border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Sourcing</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'sourcing' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {sourcingCount}
                  </span>
                </button>

                {/* Screening Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('screening');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'screening'
                      ? 'bg-[#0F47F2] text-white shadow-2xs'
                      : 'bg-white text-[#475569] border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Screening</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'screening' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'
                    }`}
                  >
                    {screeningCount}
                  </span>
                </button>

                {/* Interview Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('interview');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'interview'
                      ? 'bg-[#0F47F2] text-white shadow-2xs'
                      : 'bg-white text-[#475569] border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Interview</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'interview' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    {interviewCount}
                  </span>
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-[#64748B] font-medium">Sort by</span>
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-medium text-[#0F172A] bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <span>
                      {sortBy === 'oldest'
                        ? 'Oldest first'
                        : sortBy === 'newest'
                        ? 'Newest first'
                        : 'Highest score'}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform ${
                        showSortDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('oldest');
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          sortBy === 'oldest' ? 'font-bold text-[#0F47F2]' : 'text-[#334155]'
                        }`}
                      >
                        Oldest first
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('newest');
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          sortBy === 'newest' ? 'font-bold text-[#0F47F2]' : 'text-[#334155]'
                        }`}
                      >
                        Newest first
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('score');
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                          sortBy === 'score' ? 'font-bold text-[#0F47F2]' : 'text-[#334155]'
                        }`}
                      >
                        Highest score
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Single Vertically Stacked Candidate List (One Column) ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 min-h-0 pr-1 py-1">
              {priorityLoading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={`skel-${i}`}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3 w-full md:w-1/3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="w-32 h-3.5 bg-slate-200 rounded" />
                        <div className="w-40 h-3 bg-slate-200 rounded" />
                        <div className="w-24 h-2.5 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="w-24 h-10 bg-slate-100 rounded-xl" />
                    <div className="w-20 h-6 bg-slate-100 rounded" />
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  </div>
                ))
              ) : paginatedCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F172A]">All caught up!</h3>
                  <p className="text-xs text-[#64748B] mt-0.5 max-w-sm">
                    No candidates requiring attention for the selected stage and filters.
                  </p>
                </div>
              ) : (
                paginatedCards.map((card) => (
                  <PriorityCard
                    key={card.id}
                    {...card}
                    isActionLoading={actionLoadingId === card.applicationId}
                    onClick={() => handleCandidateClick(card)}
                    onCall={(e) => handleCallClick(e, card)}
                    onShortlist={(e) => handleShortlist(e, card)}
                    onMoveForward={(e) => handleShortlist(e, card)}
                    onMoveStage={(e) => handleOpenMoveStage(e, card)}
                    onArchive={(e) => handleArchive(e, card)}
                  />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {!priorityLoading && activeCards.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-[#64748B] shrink-0">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-[#0F172A]">
                    {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, activeCards.length)}
                  </span>{' '}
                  of <span className="font-semibold text-[#0F172A]">{activeCards.length}</span> candidates
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      totalPages > 5 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - currentPage) > 1
                    ) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return (
                          <span key={`dots-${pageNum}`} className="px-0.5 text-slate-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#0F47F2] text-white shadow-2xs'
                            : 'border border-slate-200 bg-white text-[#334155] hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ═══════════════ RIGHT COLUMN: CALENDAR & SCHEDULE SECTION ═══════════════ */}
        {/* Requirement 1: Do not remove or modify the Calendar and Schedule sections on the right side */}
        <aside className="w-96 flex flex-col gap-4 shrink-0 h-full min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CalendarWidget
              onDateClick={handleDateClick}
              activities={calendarActivities.map((day) => ({
                date: day.date,
                activityLevel: day.activity_level as any,
                totalEvents: day.total_events,
                breakdown: day.breakdown,
              }))}
              onMonthChange={fetchCalendarActivity}
              isLoading={calendarLoading}
            />
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ScheduleWidget
              events={scheduleEvents}
              isLoading={scheduleLoading}
              activeFilter={activeScheduleFilter}
              onFilterChange={(f) => {
                setActiveScheduleFilter(f);
                fetchScheduleEvents(f);
              }}
              onEventClick={handleScheduleEventClick}
            />
          </div>
        </aside>
      </div>

      {/* ── Move Stage Modal (Requirements 4 & 5) ── */}
      {moveStageCandidate && (
        <MoveStageModal
          isOpen={isMoveStageModalOpen}
          onClose={() => {
            setIsMoveStageModalOpen(false);
            setMoveStageCandidate(null);
          }}
          candidateName={moveStageCandidate.name}
          role={moveStageCandidate.role}
          company={moveStageCandidate.company}
          applicationId={moveStageCandidate.applicationId}
          jobRoleId={moveStageCandidate.jobRoleId}
          currentStageName={moveStageCandidate.currentStageName}
          nextStageId={moveStageCandidate.nextStageId}
          onSuccess={fetchPriorityActions}
        />
      )}

      {/* ── Schedule Event Modal ── */}
      <ScheduleEventModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        events={scheduleEvents}
        initialIndex={selectedScheduleEventIndex}
      />

      {/* ── Date-Wise Agenda Modal ── */}
      <DateWiseAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        agenda={agendaData}
        isLoading={agendaLoading}
      />

      {/* ── Daily Activities Modal (For Past Dates) ── */}
      <DailyActivitiesModal
        isOpen={isDailyActivitiesModalOpen}
        onClose={() => setIsDailyActivitiesModalOpen(false)}
        data={dailyActivitiesData}
        isLoading={dailyActivitiesLoading}
      />
    </div>
  );
}
