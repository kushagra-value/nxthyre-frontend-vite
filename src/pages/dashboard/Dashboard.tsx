import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
import { useAuth } from '../../hooks/useAuth';
import dashboardService, {
  DashboardData,
  DashboardPriorityColumn,
  DashboardTalentMatch,
} from '../../services/dashboardService';
import {
  statCardsData,
  priorityColumnsData,
  talentMatchesData,
  scheduleItemsData,
  recentActivitiesData,
  actionReviewCandidates,
  newMatchCandidates,
  scheduleEventsData,
  dailyAgendaData,
  ScheduleItemData,
  StatCardData,
  PriorityColumnData,
  TalentMatchData,
  ActivitySection,
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

// Map API status_color to internal format
const mapStatusColor = (color: string): 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' => {
  const mapping: Record<string, 'blue' | 'rose' | 'amber' | 'indigo' | 'grey'> = {
    blue: 'blue',
    rose: 'rose',
    amber: 'amber',
    indigo: 'indigo',
    grey: 'grey',
    red: 'rose',
    green: 'blue',
  };
  return mapping[color] || 'grey';
};

// Map API source to internal CandidateSource
const mapSource = (src: string): CandidateSource | undefined => {
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

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  // API data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter and View States
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [dateRange, setDateRange] = useState('Today');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [talentMatchDateRange, setTalentMatchDateRange] = useState('Last 24 Hours');
  const [showTalentMatchDateDropdown, setShowTalentMatchDateDropdown] = useState(false);

  // Modal states
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionInitialIndex, setActionInitialIndex] = useState(0);

  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [newMatchInitialIndex, setNewMatchInitialIndex] = useState(0);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInitialIndex, setScheduleInitialIndex] = useState(0);

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);

  // Fetch dashboard data
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

  const dynamicPriorityColumns: PriorityColumnData[] = Array.isArray(dashboardData?.dashboard?.priority_actions?.columns)
    ? dashboardData!.dashboard.priority_actions.columns.map((col: DashboardPriorityColumn) => {
        const colors = columnColors[col.id] || { dotColor: '#6155F5', accentColor: '#6155F5' };
        
        // Dummy history data if viewMode is 'history'
        const historyCards = [
          {
            id: `done-${col.id}-1`,
            name: 'Dwija Patel',
            role: 'Senior Product Designer',
            company: 'Jupiter',
            daysAgo: 4,
            status: col.id === 'sourcing' ? 'Follow up required' : col.id === 'screening' ? 'Moved to Screening' : 'Move to Next Round',
            statusColor: 'green' as const,
            isDone: true,
          }
        ];

        const cards = viewMode === 'history' 
          ? historyCards 
          : (Array.isArray(col.cards) ? col.cards.map((c) => ({
              id: `pa-${c.id}`,
              name: c.name,
              role: c.role,
              company: c.company || 'Jupiter', // Dummy company for now
              daysAgo: c.days_ago,
              status: c.status,
              statusColor: mapStatusColor(c.status_color),
              isDone: false,
            })) : []);

        // Filter by company if selected
        const filteredCards = selectedCompany === 'All Companies' 
          ? cards 
          : cards.filter(c => c.company === selectedCompany);

        return {
          id: `col-${col.id}`,
          title: col.title,
          dotColor: colors.dotColor,
          accentColor: colors.accentColor,
          urgentCount: viewMode === 'history' ? 0 : col.urgent_count,
          totalCount: filteredCards.length,
          cards: filteredCards,
        };
      })
    : priorityColumnsData.map(col => ({
        ...col,
        cards: col.cards.map(c => ({ ...c, company: 'Jupiter' }))
      }));

  const dynamicTalentMatches: TalentMatchData[] = Array.isArray(dashboardData?.dashboard?.new_talent_matches?.matches)
    ? dashboardData!.dashboard.new_talent_matches.matches.map((m: DashboardTalentMatch) => ({
        id: m.id,
        name: m.name,
        company: m.company || 'N/A',
        position: m.position,
        experience: m.experience,
        matchPercentage: m.match_percentage,
        source: mapSource(m.source),
      }))
    : talentMatchesData;

  const dynamicRecentActivities: ActivitySection[] = Array.isArray(dashboardData?.dashboard?.recent_activities)
    ? dashboardData!.dashboard.recent_activities.map((group) => ({
        label: group.label,
        items: Array.isArray(group.items) ? group.items.map((item) => ({
          icon: item.icon as 'calendar' | 'phone' | 'check',
          text: item.text,
          time: item.time,
        })) : [],
      }))
    : recentActivitiesData;

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

  const handlePriorityCardClick = (name: string) => {
    const idx = actionReviewCandidates.findIndex((c) => c.name === name);
    setActionInitialIndex(idx >= 0 ? idx : 0);
    setIsActionModalOpen(true);
  };

  const handleTalentMatchClick = (name: string) => {
    const idx = newMatchCandidates.findIndex((c) => c.name === name);
    setNewMatchInitialIndex(idx >= 0 ? idx : 0);
    setIsNewMatchModalOpen(true);
  };

  const handleScheduleEventClick = (item: ScheduleItemData) => {
    const idx = scheduleEventsData.findIndex((e) => e.candidateName === item.name);
    setScheduleInitialIndex(idx >= 0 ? idx : 0);
    setIsScheduleModalOpen(true);
  };

  const handleDateClick = () => {
    setIsAgendaModalOpen(true);
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

          {/* Priority Actions from API or fallback */}
          <section className="bg-white rounded-xl p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium leading-6 text-black">Priority Actions</h2>
              <div className="flex items-center gap-2.5">
                {/* History Toggle */}
                <button 
                  onClick={() => setViewMode(prev => prev === 'active' ? 'history' : 'active')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border-[0.5px] transition-all ${viewMode === 'history' ? 'bg-[#0F47F2] border-[#0F47F2]' : 'bg-white border-[#D1D1D6]'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 5.83333V9.99999L12.5 11.6667M10 2.5C8.01088 2.5 6.10322 3.29018 4.6967 4.6967C3.29018 6.10322 2.5 8.01088 2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C11.9891 17.5 13.8968 16.7098 15.3033 15.3033C16.7098 13.8968 17.5 11.9891 17.5 10M4.16667 4.16667V7.5H7.5" stroke={viewMode === 'history' ? 'white' : '#4B5563'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Company Filter Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    className="flex items-center gap-2 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] bg-white border-[0.5px] border-[#D1D1D6] min-w-[150px] justify-between"
                  >
                    {selectedCompany} <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCompanyDropdown && (
                    <div className="absolute top-full mt-1 left-0 w-full bg-white border border-[#D1D1D6] rounded-[10px] shadow-lg z-10 overflow-hidden">
                      {['All Companies', 'Jupiter', 'Deloitte', 'HGS'].map(company => (
                        <button
                          key={company}
                          className="w-full text-left px-4 py-2 hover:bg-[#F3F5F7] text-sm text-[#4B5563]"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowCompanyDropdown(false);
                          }}
                        >
                          {company}
                        </button>
                      ))}
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
                      <path d="M15 1.66666V3.33332M5 1.66666V3.33332" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16 3.33334H4C2.89543 3.33334 2 4.22877 2 5.33334V16.3333C2 17.4379 2.89543 18.3333 4 18.3333H16C17.1046 18.3333 18 17.4379 18 16.3333V5.33334C18 4.22877 17.1046 3.33334 16 3.33334Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 8.33334H18" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="7" y="11" width="2" height="2" rx="0.5" fill="#4B5563"/>
                      <rect x="11" y="11" width="2" height="2" rx="0.5" fill="#4B5563"/>
                      <rect x="7" y="14" width="2" height="2" rx="0.5" fill="#4B5563"/>
                    </svg>
                    {dateRange}
                  </button>
                  {showDateDropdown && (
                    <div className="absolute top-full mt-1 right-0 z-20">
                      <CustomDateSelector 
                        onApply={(range: { label: string }) => setDateRange(range.label)}
                        onClose={() => setShowDateDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {loading
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
                : dynamicPriorityColumns.map((column) => (
                    <div key={column.id} className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[400px] hide-scrollbar">
                      <div className="flex items-center justify-between px-1 py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: column.dotColor }}></div>
                          <span className="text-sm font-normal text-[#4B5563] leading-[17px]">{column.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#4B5563]">{column.urgentCount}</span>
                          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal" style={{ color: column.accentColor }}>{column.totalCount}</span>
                        </div>
                      </div>
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
                          onClick={() => handlePriorityCardClick(card.name)}
                        />
                      ))}
                    </div>
                  ))}
            </div>
          </section>

          {/* Talent Matches from API or fallback */}
          <section className="bg-white rounded-[10px] p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium leading-6 text-black">New Talent Matches</h2>
              <div className="flex items-end gap-3">
                <div
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563] leading-[17px]"
                  style={{ border: '0.5px solid #D1D1D6' }}
                >
                  All Jobs <ChevronDown className="w-5 h-5 opacity-60" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowTalentMatchDateDropdown(!showTalentMatchDateDropdown)}
                    className="flex items-center px-[18px] py-[11px] rounded-lg text-sm font-normal text-[#4B5563] leading-[17px] bg-white border-[0.5px] border-[#D1D1D6] whitespace-nowrap min-w-[140px]"
                  >
                    {talentMatchDateRange}
                  </button>
                  {showTalentMatchDateDropdown && (
                    <div className="absolute top-full mt-1 right-0 z-20">
                      <CustomDateSelector 
                        onApply={(range: { label: string }) => setTalentMatchDateRange(range.label)}
                        onClose={() => setShowTalentMatchDateDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {loading
                ? [...Array(3)].map((_, i) => (
                    <div key={`tm-skel-${i}`} className="bg-white p-5 rounded-[10px] flex items-center justify-between animate-pulse" style={{ border: '1px solid #D1D1D6' }}>
                      <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 rounded bg-gray-200" />
                        <div className="w-48 h-3 rounded bg-gray-200" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                    </div>
                  ))
                : dynamicTalentMatches.map((match) => (
                    <TalentMatchCard
                      key={match.id}
                      name={match.name}
                      company={match.company}
                      position={match.position}
                      experience={match.experience}
                      matchPercentage={match.matchPercentage}
                      source={match.source}
                      onClick={() => handleTalentMatchClick(match.name)}
                    />
                  ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="w-96 flex flex-col gap-4 shrink-0">
          <CalendarWidget onDateClick={handleDateClick} />
          <ScheduleWidget items={dynamicScheduleItems} isLoading={loading} onEventClick={handleScheduleEventClick} />
          <RecentActivities/>
        </aside>
      </div>

      {/* Action Review Modal */}
      <ActionReviewModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        candidates={actionReviewCandidates}
        initialIndex={actionInitialIndex}
      />
      {/* New Match Candidate Modal */}
      <NewMatchCandidateModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
        candidates={newMatchCandidates}
        initialIndex={newMatchInitialIndex}
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
    </div>
  );
}
