import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import StatCard from './components/StatCard';
import PriorityCard from './components/PriorityCard';
import CalendarWidget from './components/CalendarWidget';
import ScheduleWidget from './components/ScheduleWidget';
import RecentActivities from './components/RecentActivities';
import ActionReviewModal from './components/ActionReviewModal';
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
  CalendarDayActivityAPI,
  ScheduleEventAPI,
  ScheduleFilterType,
  AgendaResponse,
  DailyActivitiesResponse,
} from '../../services/dashboardService';
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
} from './dashboardData';
import type { ScheduleFilterLabel } from './components/ScheduleWidget';


// Map API icon_type to internal iconType keys
const mapIconType = (apiIconType: string): string => {
  const mapping: Record<string, string> = {
    briefcase: 'briefcase',
    building: 'building',
    'user-plus': 'userPlus',
    clock: 'clock',
    upload: 'clock',
  };
  return mapping[apiIconType] || apiIconType;
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

  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalCandidateData, setActionModalCandidateData] = useState<any>(null);
  const [actionModalLoading, setActionModalLoading] = useState(false);
  const [actionModalTab, setActionModalTab] = useState<PriorityTab>('sourcing');
  const [actionModalCards, setActionModalCards] = useState<PriorityActionItem[]>([]);
  const [actionModalCurrentIndex, setActionModalCurrentIndex] = useState(0);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleEventIndex, setSelectedScheduleEventIndex] = useState(0);

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isDailyActivitiesModalOpen, setIsDailyActivitiesModalOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // New Dashboard Dynamic States for Calendar & Schedule
  const [calendarActivities, setCalendarActivities] = useState<CalendarDayActivityAPI[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEventAPI[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [activeScheduleFilter, setActiveScheduleFilter] = useState<ScheduleFilterLabel>('Today');
  const [agendaData, setAgendaData] = useState<AgendaResponse | null>(null);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [dailyActivitiesData, setDailyActivitiesData] = useState<DailyActivitiesResponse | null>(null);
  const [dailyActivitiesLoading, setDailyActivitiesLoading] = useState(false);

  // Close company dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
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

  const fetchCalendarActivity = async (month: number, year: number) => {
    setCalendarLoading(true);
    try {
      const response = await dashboardService.getCalendarActivity(month, year);
      setCalendarActivities(response.days);
    } catch (err) {
      console.error('Failed to fetch calendar activity:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchScheduleEvents = useCallback(async (filterLabel: ScheduleFilterLabel) => {
    setScheduleLoading(true);
    try {
      let filter: ScheduleFilterType = 'today';
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
    fetchScheduleEvents('Today');
  }, [isAuthenticated, fetchScheduleEvents]);

  // ── Derive display data from API or fall back to static data ──

  const dynamicStatCards: StatCardData[] = Array.isArray(dashboardData?.dashboard?.stat_cards)
    ? dashboardData!.dashboard.stat_cards.map((card) => ({
      id: card.id,
      iconType: mapIconType(card.icon_type) as StatCardData['iconType'],
      label: card.label,
      value: card.unit ? `${card.value}` : card.value,
      trend: card.trend,
      trendText: card.trend_text,
      trendColor: card.trend_color,
      trendData: card.trend_data,
      dateText: card.unit ?? undefined,
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
        latestCallNote: item.latest_call_note,
        latestCallTags: item.latest_call_tags,
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

  const handleScheduleEventClick = (event: ScheduleEventAPI, index: number) => {
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
              : dynamicStatCards.map((stat) => {
                const l = stat.label.toLowerCase();
                let palette = {};
                if (l.includes('jobs')) palette = { accentColor: '#0F47F2', gradientDark: '#86A4FF', gradientLight: '#CCD9FF1A' };
                else if (l.includes('companies')) palette = { accentColor: '#FBBF24', gradientDark: '#FBBF24', gradientLight: '#CCD9FF1A' };
                else if (l.includes('hired')) palette = { accentColor: '#00C8B3', gradientDark: '#4EFFEC', gradientLight: '#CCD9FF1A' };
                else if (l.includes('uploads') || l.includes('resume')) palette = { accentColor: '#0F47F2', gradientDark: '#86A4FF', gradientLight: '#CCD9FF1A' };

                return (
                  <StatCard
                    key={stat.id}
                    iconType={stat.iconType}
                    label={stat.label}
                    value={stat.value}
                    trend={stat.trend}
                    trendText={stat.trendText}
                    trendColor={stat.trendColor}
                    trendData={stat.trendData}
                    dateText={stat.dateText}
                    {...palette}
                  />
                );
              })}
          </div>

          {/* Priority Actions from new API */}
          <section className="bg-white rounded-xl p-5 flex flex-col gap-5 max-h-[90vh]">
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
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.23223 4.22409C7.39502 1.06578 12.5364 1.09936 15.7185 4.28148C18.902 7.46497 18.9342 12.6094 15.7718 15.7718C12.6093 18.9342 7.46494 18.902 4.28145 15.7185C2.39491 13.832 1.61587 11.2582 1.95039 8.81767C1.99727 8.47567 2.3125 8.23647 2.65447 8.28335C2.99646 8.33022 3.23568 8.64542 3.18882 8.98742C2.9055 11.0543 3.56485 13.2342 5.16533 14.8347C7.86907 17.5384 12.222 17.5538 14.8879 14.8879C17.5538 12.222 17.5383 7.8691 14.8346 5.16537C12.1322 2.46301 7.78241 2.44616 5.11612 5.10798L5.73921 5.11111C6.08438 5.11284 6.36279 5.39407 6.36106 5.73924C6.35932 6.08442 6.0781 6.36282 5.73292 6.36109L3.61163 6.35043C3.26891 6.34871 2.99151 6.0713 2.98978 5.72858L2.97912 3.60728C2.97738 3.26212 3.2558 2.98089 3.60097 2.97915C3.94615 2.97742 4.22737 3.25583 4.22911 3.60101L4.23223 4.22409Z" fill="#4B5563" />
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0">
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
                  // if the length or the card is greater than 0 than sort the columns based on days ago (greater to smaller)
                  if (column.cards.length > 0) {
                    column.cards.sort((a, b) => b.daysAgo - a.daysAgo);
                  }
                  return (
                    <div key={column.id} className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 flex-1 h-full max-h-[500px] lg:max-h-none min-h-0">
                      <div className="flex items-center justify-between px-1 py-1 shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: column.dotColor }}></div>
                          <span className="text-sm font-normal text-[#4B5563] leading-[17px]">{column.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal" style={{ color: column.accentColor }}>{column.totalCount}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-2.5 min-h-0">
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
                            latestCallNote={card.latestCallNote}
                            latestCallTags={card.latestCallTags}
                            onClick={() => handlePriorityCardClick(card, tabKey)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="w-96 flex flex-col gap-4 shrink-0">
          <CalendarWidget
            onDateClick={handleDateClick}
            activities={calendarActivities.map(day => ({ 
              date: day.date, 
              activityLevel: day.activity_level as any,
              totalEvents: day.total_events,
              breakdown: day.breakdown 
            }))}
            onMonthChange={fetchCalendarActivity}
            isLoading={calendarLoading}
          />
          <ScheduleWidget
            events={scheduleEvents}
            isLoading={scheduleLoading}
            activeFilter={activeScheduleFilter}
            onFilterChange={(f) => { setActiveScheduleFilter(f); fetchScheduleEvents(f); }}
            onEventClick={handleScheduleEventClick}
          />
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
      {/* Schedule Event Modal */}
      <ScheduleEventModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        events={scheduleEvents}
        initialIndex={selectedScheduleEventIndex}
      />
      {/* Date-Wise Agenda Modal */}
      <DateWiseAgendaModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        agenda={agendaData}
        isLoading={agendaLoading}
      />
      {/* Daily Activities Modal — for past dates */}
      <DailyActivitiesModal
        isOpen={isDailyActivitiesModalOpen}
        onClose={() => setIsDailyActivitiesModalOpen(false)}
        data={dailyActivitiesData}
        isLoading={dailyActivitiesLoading}
      />
    </div>
  );
}
