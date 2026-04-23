import React, { useState, useMemo } from 'react';
import type {
  DailyActivitiesResponse,
  DailyActivityItemAPI,
  DailyActivityDetailItem,
  DailyActivityGroupedItem,
} from '../../../services/dashboardService';

interface DailyActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyActivitiesResponse | null;
  isLoading?: boolean;
}

type TabKey = 'all' | 'call' | 'follow-up' | 'shortlist' | 'hired';

// ── Icons ──
const CallIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18.3 15.27c0 .3-.07.6-.2.9-.13.3-.3.58-.54.84-.41.45-.86.77-1.37.96-.5.21-.98.31-1.56.31-.84 0-1.73-.2-2.68-.61-1-.4-1.93-.97-2.88-1.66-.96-.7-1.86-1.48-2.73-2.33a29.6 29.6 0 01-2.33-2.73c-.69-.95-1.23-1.87-1.66-2.87C2.18 7.14 2 6.25 2 5.4c0-.57.1-1.1.3-1.59.21-.5.53-.95.95-1.36.27-.25.56-.4.87-.42.3-.03.59.06.84.2l1.93 2.59c.15.21.26.41.34.58.07.18.11.35.11.5 0 .18-.06.36-.16.53a4.5 4.5 0 01-.42.52l-.79.82a.32.32 0 00-.09.2c0 .07.01.14.04.2l.08.2c.3.57.7 1.16 1.17 1.76.47.6.97 1.2 1.53 1.81.57.6 1.13 1.14 1.7 1.61.58.46 1.12.81 1.63 1.07l.22.08c.07.03.14.04.22.04.12 0 .24-.06.33-.15l.77-.79c.16-.16.32-.29.5-.38.17-.11.34-.16.53-.16.16 0 .33.04.5.12.18.08.37.2.54.34L16.85 15c.2.15.36.32.44.55.1.22.15.47.15.72h-.14z" fill="currentColor"/></svg>
);
const BellIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18.33c-1.62 0-2.96-1.15-3.26-2.7h6.52a3.33 3.33 0 01-3.26 2.7zm7.95-4.85c-1.09-.5-1.72-1.58-1.72-2.76V7.92c0-2.53-2.06-4.58-4.6-4.58h-3.26c-2.53 0-4.6 2.06-4.6 4.58v2.8c0 1.18-.63 2.26-1.72 2.76-.68.32-1-.84-.74-1.54a1.4 1.4 0 011.33-.88h11.62c.6 0 1.12.38 1.33.88.26.7-.06 1.86-.74 1.54zM10 2.08c.69 0 1.25-.56 1.25-1.25A.83.83 0 0010.42 0h-.83c-.46 0-.84.37-.84.83 0 .7.56 1.25 1.25 1.25z" fill="currentColor"/></svg>
);
const StarIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.67l2.58 5.21 5.75.84-4.16 4.06.98 5.73L10 14.81l-5.15 2.7.98-5.73L1.67 7.72l5.75-.84L10 1.67z" fill="currentColor"/></svg>
);
const HiredIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 18.33a8.33 8.33 0 100-16.66 8.33 8.33 0 000 16.66z" stroke="currentColor" strokeWidth="1.5"/><path d="M6.67 10l2.5 2.5 4.16-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const NaukbotIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const DownloadIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3.33v9.17M6.67 10l3.33 3.33L13.33 10M5 15h10" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ChevronDownIcon = ({ className = '' }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const TAB_CONFIG: { key: TabKey; label: string; icon: JSX.Element; color: string; bg: string; typeMatch: string[] }[] = [
  { key: 'call', label: 'Calls Made', icon: CallIcon, color: '#0F47F2', bg: '#E7EDFF', typeMatch: ['call', 'call-cancel'] },
  { key: 'follow-up', label: 'Follow-ups', icon: BellIcon, color: '#FF8D28', bg: '#FEF3C7', typeMatch: ['follow-up'] },
  { key: 'shortlist', label: 'Shortlisted', icon: StarIcon, color: '#059669', bg: '#D1FAE5', typeMatch: ['shortlist'] },
  { key: 'hired', label: 'Hired', icon: HiredIcon, color: '#6155F5', bg: '#EDE9FE', typeMatch: ['hired'] },
];

const getIconForType = (type: string) => {
  if (type === 'call' || type === 'call-cancel') return { icon: CallIcon, color: '#0F47F2', bg: '#E7EDFF' };
  if (type === 'follow-up') return { icon: BellIcon, color: '#FF8D28', bg: '#FEF3C7' };
  if (type === 'shortlist') return { icon: StarIcon, color: '#059669', bg: '#D1FAE5' };
  if (type === 'hired') return { icon: HiredIcon, color: '#6155F5', bg: '#EDE9FE' };
  if (type === 'naukbot') return { icon: NaukbotIcon, color: '#0F47F2', bg: '#E7EDFF' };
  return { icon: CallIcon, color: '#0F47F2', bg: '#E7EDFF' };
};

/** Build grouped summaries from flat activities (fallback). */
function buildGroupedFromFlat(activities: DailyActivityItemAPI[]): DailyActivityGroupedItem[] {
  const groups: Record<string, DailyActivityItemAPI[]> = {};
  activities.forEach(a => {
    const key = a.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });

  const labelMap: Record<string, (items: DailyActivityItemAPI[]) => string> = {
    call: (items) => items.length === 1 ? `Called ${items[0].title.replace('Called ', '')}` : `Called ${items[0].title.replace('Called ', '')} and ${items.length - 1} others`,
    'call-cancel': (items) => items.length === 1 ? items[0].title : `${items[0].title} and ${items.length - 1} others`,
    'follow-up': (items) => {
      const name = items[0].title.replace('Follow-up — ', '');
      return items.length === 1 ? `Follow-up with ${name}` : `${name} and ${items.length - 1} more people followed up`;
    },
    shortlist: (items) => {
      const name = items[0].title.replace(' shortlisted', '');
      return items.length === 1 ? `${name} moved to Shortlist stage` : `${name} and ${items.length - 1} more people moved to Shortlist stage`;
    },
    hired: (items) => {
      const name = items[0].title;
      return items.length === 1 ? name : `${name} and ${items.length - 1} others`;
    },
  };

  const actionMap: Record<string, string> = {
    call: 'View call log',
    'call-cancel': 'View call log',
    'follow-up': 'View Follow-ups',
    shortlist: 'View Shortlist',
    hired: 'View',
  };

  return Object.entries(groups).map(([type, items]) => {
    const { color, bg } = getIconForType(type);
    const buildLabel = labelMap[type] || ((arr: DailyActivityItemAPI[]) => `${arr.length} ${type} activities`);
    return {
      id: `group-${type}`,
      type,
      icon_type: type,
      title: buildLabel(items),
      action_label: actionMap[type] || 'View',
      action_type: 'view',
      count: items.length,
      category_color: color,
      category_bg: bg,
    };
  });
}

/** Build detail items from flat activities (fallback). */
function buildDetailsFromFlat(activities: DailyActivityItemAPI[], typeFilter: string[]): DailyActivityDetailItem[] {
  return activities
    .filter(a => typeFilter.includes(a.type))
    .map(a => {
      const timePart = a.time?.split('·').pop()?.trim() || a.time || '';
      const namePart = a.title.replace('Called ', '').replace('Follow-up — ', '').replace(' shortlisted', '');
      let actionLabel: string | undefined;
      if (a.type === 'call') actionLabel = 'View Call Note';
      if (a.type === 'call-cancel') actionLabel = 'Call Back';
      return {
        id: a.id,
        time: timePart,
        candidate_name: namePart,
        company_name: '',
        job_role: '',
        type: a.type,
        detail_text: a.time,
        detail_color: a.category_color,
        action_label: actionLabel,
        action_type: a.type === 'call' ? 'view_call_note' : a.type === 'call-cancel' ? 'call_back' : undefined,
      };
    });
}

/** Get all detail items for a given group type from data. */
function getDetailsForGroupType(data: DailyActivitiesResponse, groupType: string): DailyActivityDetailItem[] {
  // Map group type to the matching tab config
  const matchingTab = TAB_CONFIG.find(t => t.typeMatch.includes(groupType));
  if (!matchingTab) return [];

  // Try new API fields first
  if (matchingTab.key === 'call' && data.calls?.length) return data.calls;
  if (matchingTab.key === 'follow-up' && data.follow_ups?.length) return data.follow_ups;
  if (matchingTab.key === 'shortlist' && data.shortlisted?.length) return data.shortlisted;
  if (matchingTab.key === 'hired' && data.hired?.length) return data.hired;

  // Fallback from flat activities
  return buildDetailsFromFlat(data.activities, matchingTab.typeMatch);
}


const DailyActivitiesModal: React.FC<DailyActivitiesModalProps> = ({ isOpen, onClose, data, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const tabCounts = useMemo(() => {
    if (!data) return { all: 0, call: 0, 'follow-up': 0, shortlist: 0, hired: 0 };
    return {
      all: data.total_activities,
      call: data.summary.calls_made,
      'follow-up': data.summary.follow_ups,
      shortlist: data.summary.shortlisted,
      hired: data.summary.hired,
    };
  }, [data]);

  const groupedItems = useMemo(() => {
    if (!data) return [];
    if (data.grouped_activities && data.grouped_activities.length > 0) return data.grouped_activities;
    return buildGroupedFromFlat(data.activities);
  }, [data]);

  const getDetailItems = (tabKey: TabKey): DailyActivityDetailItem[] => {
    if (!data || tabKey === 'all') return [];
    const cfg = TAB_CONFIG.find(t => t.key === tabKey);
    if (!cfg) return [];
    if (tabKey === 'call' && data.calls?.length) return data.calls;
    if (tabKey === 'follow-up' && data.follow_ups?.length) return data.follow_ups;
    if (tabKey === 'shortlist' && data.shortlisted?.length) return data.shortlisted;
    if (tabKey === 'hired' && data.hired?.length) return data.hired;
    return buildDetailsFromFlat(data.activities, cfg.typeMatch);
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end" onClick={onClose}>
        <div className="bg-white shadow-xl w-full max-w-[520px] h-screen flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="animate-pulse p-6 space-y-4">
            <div className="w-48 h-5 rounded bg-gray-200" />
            <div className="w-32 h-4 rounded bg-gray-200" />
            <div className="flex gap-2 mt-4">{[...Array(5)].map((_, i) => <div key={i} className="w-24 h-9 rounded-full bg-gray-200" />)}</div>
            {[...Array(5)].map((_, i) => <div key={i} className="flex gap-3 items-center"><div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" /><div className="flex-1 space-y-2"><div className="w-32 h-4 rounded bg-gray-200" /><div className="w-48 h-3 rounded bg-gray-200" /></div></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end" onClick={onClose}>
        <div className="bg-white shadow-xl w-full max-w-[520px] h-screen flex flex-col" onClick={e => e.stopPropagation()}>
          <ModalHeader title="No Activities" subtitle="" onClose={onClose} />
          <div className="flex-1 flex items-center justify-center text-sm text-[#8E8E93]">No activities found for this date.</div>
        </div>
      </div>
    );
  }

  const detailItems = getDetailItems(activeTab);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end" onClick={onClose}>
      <div className="bg-white shadow-xl w-full max-w-[520px] h-screen flex flex-col" onClick={e => e.stopPropagation()}>
        <ModalHeader title={data.date_label} subtitle={`${data.total_activities} total activities`} onClose={onClose} />

        {/* ── Tabs ── */}
        <div className="px-6 py-3 border-b border-[#E5E7EB] flex items-center gap-2 overflow-x-auto shrink-0 hide-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              activeTab === 'all' ? 'border-[#0F47F2] text-[#0F47F2] bg-[#E7EDFF]' : 'border-[#D1D1D6] text-[#4B5563] hover:bg-gray-50'
            }`}
          >
            All <span className="font-semibold">{tabCounts.all}</span>
          </button>
          {TAB_CONFIG.map(tab => {
            const count = tabCounts[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive ? 'bg-white shadow-sm' : 'border-[#D1D1D6] text-[#4B5563] hover:bg-gray-50'
                }`}
                style={isActive ? { borderColor: tab.color, color: tab.color } : {}}
              >
                <span style={{ color: isActive ? tab.color : '#8E8E93', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ transform: 'scale(0.7)', display: 'block' }}>{tab.icon}</span>
                </span>
                {tab.label} <span className="font-semibold">{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'all' ? (
            <AllTabContent groupedItems={groupedItems} data={data} />
          ) : (
            <DetailTabContent items={detailItems} tabKey={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px', borderBottom: '0.5px solid #AEAEB2' }}>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-semibold text-[#1C1C1E]" style={{ fontSize: 16, lineHeight: '19px' }}>{title}</h2>
        {subtitle && <p className="m-0 text-[#8E8E93]" style={{ fontSize: 13, lineHeight: '16px' }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-[#4B5563]" title="Download">
          {DownloadIcon}
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-[#8E8E93]" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

/** Renders a single detail card row — shared between All-tab expansion and per-category tabs */
function DetailCard({ item, idx }: { item: DailyActivityDetailItem; idx: number }) {
  const [showNote, setShowNote] = useState(false);
  const { icon, color, bg } = getIconForType(item.type);
  const isFailedCall = item.call_status && item.call_status.toLowerCase().includes("didn't pick");

  return (
    <div className={`py-3.5 ${idx > 0 ? 'border-t border-[#F3F5F7]' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg, color }}>
          <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="m-0 text-[11px] text-[#8E8E93] leading-[14px] mb-1">{item.time}</p>
          <p className="m-0 text-sm font-medium text-[#1C1C1E] leading-[18px]">{item.candidate_name}</p>
          {(item.company_name || item.job_role) && (
            <p className="m-0 text-xs text-[#6B7280] leading-[16px] mt-0.5">
              {[item.company_name, item.job_role, item.experience].filter(Boolean).join(' | ')}
            </p>
          )}
          {item.detail_text && (
            <p className="m-0 text-xs leading-[16px] mt-1" style={{ color: isFailedCall ? '#DC2626' : (item.detail_color || color) }}>
              {item.detail_text}
            </p>
          )}
        </div>

        {/* Action button */}
        {item.action_label && (
          <button
            onClick={() => {
              if (item.action_type === 'view_call_note' && item.call_note) setShowNote(!showNote);
            }}
            className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-md border transition-colors hover:opacity-80 self-center"
            style={{ color, borderColor: color, background: bg }}
          >
            {item.action_label}
          </button>
        )}
      </div>

      {/* Expanded call note */}
      {showNote && item.call_note && (
        <div className="ml-12 mt-2 p-3 rounded-lg text-xs text-[#4B5563] leading-[18px] border border-[#E5E7EB]" style={{ background: '#F9FAFB' }}>
          <p className="m-0 text-[10px] font-semibold text-[#8E8E93] uppercase mb-1">Call Note</p>
          <p className="m-0 whitespace-pre-wrap">{item.call_note}</p>
          {item.call_duration && <p className="m-0 mt-1.5 text-[10px] text-[#AEAEB2]">Duration: {item.call_duration} · Status: {item.call_status || 'Completed'}</p>}
        </div>
      )}
    </div>
  );
}

/** "All" tab — grouped summaries that expand inline to show detail cards */
function AllTabContent({ groupedItems, data }: { groupedItems: DailyActivityGroupedItem[]; data: DailyActivitiesResponse }) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (groupedItems.length === 0) {
    return <div className="flex items-center justify-center py-12 text-sm text-[#8E8E93]">No activities recorded.</div>;
  }

  return (
    <>
      <h3 className="uppercase text-[11px] font-semibold text-[#8E8E93] tracking-wider m-0 mb-5">Actions on this day</h3>
      <div className="flex flex-col">
        {groupedItems.map((item, idx) => {
          const { icon, color, bg } = getIconForType(item.type);
          const isExpanded = expandedGroup === item.id;
          const detailItems = isExpanded ? getDetailsForGroupType(data, item.type) : [];

          return (
            <div key={item.id} className={idx > 0 ? 'border-t border-[#F3F5F7]' : ''}>
              {/* Grouped summary row */}
              <div className="flex items-start gap-3 py-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color }}>
                  <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm text-[#1C1C1E] leading-[20px]">{item.title}</p>
                  {item.action_label && (
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : item.id)}
                      className="mt-1 text-xs font-medium bg-transparent border-none p-0 cursor-pointer hover:underline flex items-center gap-1"
                      style={{ color }}
                    >
                      {isExpanded ? 'Hide' : item.action_label}
                      <ChevronDownIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {/* Count badge */}
                <span
                  className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full self-center"
                  style={{ color, background: bg }}
                >
                  {item.count}
                </span>
              </div>

              {/* Expanded detail cards */}
              {isExpanded && detailItems.length > 0 && (
                <div className="ml-6 pl-6 mb-3 border-l-2 rounded-bl-lg" style={{ borderColor: bg }}>
                  {detailItems.map((detail, dIdx) => (
                    <DetailCard key={detail.id} item={detail} idx={dIdx} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** Per-category tab — shows detailed activity cards */
function DetailTabContent({ items, tabKey }: { items: DailyActivityDetailItem[]; tabKey: TabKey }) {
  const cfg = TAB_CONFIG.find(t => t.key === tabKey);
  const sectionTitle = cfg ? `${cfg.label.toUpperCase()} ON THIS DAY` : 'ACTIVITIES';

  if (items.length === 0) {
    return <div className="flex items-center justify-center py-12 text-sm text-[#8E8E93]">No {cfg?.label.toLowerCase() || 'activities'} recorded.</div>;
  }

  return (
    <>
      <h3 className="uppercase text-[11px] font-semibold text-[#8E8E93] tracking-wider m-0 mb-5">{sectionTitle}</h3>
      <div className="flex flex-col">
        {items.map((item, idx) => (
          <DetailCard key={item.id} item={item} idx={idx} />
        ))}
      </div>
    </>
  );
}

export default DailyActivitiesModal;
