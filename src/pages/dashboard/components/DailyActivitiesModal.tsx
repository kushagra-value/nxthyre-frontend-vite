import React, { useState, useMemo } from 'react';
import type {
  DailyActivitiesResponse,
  DailyActivityItemAPI,
  DailyActivityDetailItem,
  DailyActivityGroupedItem,
} from '../../../services/dashboardService';
import { formatActivityTime } from '../../../utils/activityTimeUtils';

interface DailyActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DailyActivitiesResponse | null;
  isLoading?: boolean;
}

type TabKey = 'all' | 'call' | 'follow-up' | 'shortlist' | 'hired';

// ── Icons ──
const CallIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const MailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const MessageIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const InterviewIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg>
);
const DocumentIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /></svg>
);
const StarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const BellIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);
const HiredIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
const NaukbotIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="14" height="10" rx="2" /><path d="M7 9h6M7 12h4" /></svg>
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
  const t = (type || "").toLowerCase().trim();
  if (t.includes('call') || t === 'phone') return { icon: CallIcon, color: '#0F47F2', bg: '#E7EDFF' };
  if (t.includes('mail') || t.includes('email') || t.includes('envelope')) return { icon: MailIcon, color: '#2563EB', bg: '#DBEAFE' };
  if (t.includes('message') || t.includes('chat') || t.includes('conversation')) return { icon: MessageIcon, color: '#8B5CF6', bg: '#F3E8FF' };
  if (t.includes('interview') || t.includes('meeting') || t.includes('video') || t.includes('calendar')) return { icon: InterviewIcon, color: '#0284C7', bg: '#E0F2FE' };
  if (t.includes('application') || t.includes('document') || t.includes('resume') || t.includes('file')) return { icon: DocumentIcon, color: '#D97706', bg: '#FEF3C7' };
  if (t.includes('follow')) return { icon: BellIcon, color: '#FF8D28', bg: '#FEF3C7' };
  if (t.includes('shortlist')) return { icon: StarIcon, color: '#059669', bg: '#D1FAE5' };
  if (t.includes('hired') || t.includes('hire')) return { icon: HiredIcon, color: '#6155F5', bg: '#EDE9FE' };
  if (t.includes('naukbot')) return { icon: NaukbotIcon, color: '#0F47F2', bg: '#E7EDFF' };
  return { icon: CallIcon, color: '#0F47F2', bg: '#E7EDFF' };
};



/** Get all detail items for a given group type from data. */
function getDetailsForGroupType(data: DailyActivitiesResponse, groupType: string): DailyActivityDetailItem[] {
  // Map group type to the matching tab config
  const matchingTab = TAB_CONFIG.find(t => t.typeMatch.includes(groupType));
  if (!matchingTab) return [];

  if (matchingTab.key === 'call') return data.calls || [];
  if (matchingTab.key === 'follow-up') return data.follow_ups || [];
  if (matchingTab.key === 'shortlist') return data.shortlisted || [];
  if (matchingTab.key === 'hired') return data.hired || [];

  return [];
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
    return data.grouped_activities || [];
  }, [data]);

  const getDetailItems = (tabKey: TabKey): DailyActivityDetailItem[] => {
    if (!data || tabKey === 'all') return [];
    const cfg = TAB_CONFIG.find(t => t.key === tabKey);
    if (!cfg) return [];
    if (tabKey === 'call') return data.calls || [];
    if (tabKey === 'follow-up') return data.follow_ups || [];
    if (tabKey === 'shortlist') return data.shortlisted || [];
    if (tabKey === 'hired') return data.hired || [];
    return [];
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
      <div className="bg-white shadow-xl w-full max-w-[600px] h-screen flex flex-col" onClick={e => e.stopPropagation()}>
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
            <DetailTabContent items={detailItems} tabKey={activeTab} data={data} />
          )}
        </div>
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

import RecruiterFilterBar, {
  getRecruiterFromItem,
  filterCallsByRecruiter,
} from './RecruiterFilterBar';

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

const UserIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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
function DetailCard({ item, idx, selectedRecruiter }: { item: DailyActivityDetailItem; idx: number; selectedRecruiter?: string }) {
  const [showNote, setShowNote] = useState(false);
  const { icon, color, bg } = getIconForType(item.type);
  const isFailedCall = item.call_status && item.call_status.toLowerCase().includes("didn't pick");
  const isCall = (item.type || '').toLowerCase().includes('call') || item.type === 'phone';
  const isShortlist = (item.type || '').toLowerCase().includes('shortlist');

  const candidateName = item.candidate_name;
  const jobName = item.job_role || item.job_name || item.job || item.title;
  const companyName = item.company_name || item.company || item.workspace_name;

  const rec = getRecruiterFromItem(item);
  const recruiterName = rec.name || (selectedRecruiter && selectedRecruiter !== 'all' ? selectedRecruiter : undefined);

  return (
    <div className={`py-3.5 ${idx > 0 ? 'border-t border-[#F3F5F7]' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg, color }}>
          <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isCall ? (
            <>
              {candidateName ? (
                <p className="m-0 text-sm font-semibold text-[#1C1C1E] leading-[18px]">
                  {candidateName}
                </p>
              ) : jobName ? (
                <p className="m-0 text-sm font-semibold text-[#1C1C1E] leading-[18px]">
                  {jobName}
                </p>
              ) : null}

              {item.candidate_number && (
                <a href={`tel:${item.candidate_number}`} className="m-0 text-xs text-[#0F47F2] font-medium leading-[16px] mt-0.5 block no-underline hover:underline">
                  {item.candidate_number}
                </a>
              )}

              {(jobName || companyName || item.experience) && (
                <p className="m-0 text-xs text-[#6B7280] leading-[16px] mt-0.5">
                  {[companyName ? `Company: ${companyName}` : null, candidateName && jobName ? `Role: ${jobName}` : null, item.experience].filter(Boolean).join(' • ')}
                </p>
              )}

              {recruiterName && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#6B7280]">Recruiter:</span>
                  <span className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {UserIcon} {recruiterName}
                  </span>
                </div>
              )}

              {item.detail_text && (
                <p className="m-0 text-xs leading-[16px] mt-1" style={{ color: isFailedCall ? '#DC2626' : (item.detail_color || color) }}>
                  {item.detail_text}
                </p>
              )}

              <p className="m-0 text-[11px] text-[#8E8E93] leading-[14px] mt-1">
                {formatActivityTime(item)}
                {item.call_duration ? ` · ${item.call_duration}` : ''}
                {item.call_status ? ` · ${item.call_status}` : ''}
              </p>
            </>
          ) : isShortlist ? (
            <>
              {candidateName && (
                <p className="m-0 text-sm font-semibold text-[#1C1C1E] leading-[18px]">
                  {candidateName}
                </p>
              )}
              {item.candidate_number && (
                <a href={`tel:${item.candidate_number}`} className="m-0 text-xs text-[#0F47F2] font-medium leading-[16px] mt-0.5 block no-underline hover:underline">
                  {item.candidate_number}
                </a>
              )}
              {(jobName || companyName || item.experience) && (
                <p className="m-0 text-xs text-[#6B7280] leading-[16px] mt-0.5">
                  {[companyName ? `Company: ${companyName}` : null, jobName ? `Role: ${jobName}` : null, item.experience].filter(Boolean).join(' • ')}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-[#D1FAE5] text-[#059669] px-2 py-0.5 rounded-md font-medium text-[11px]">
                  ★ Shortlisted Stage
                </span>
                {recruiterName && (
                  <span className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {UserIcon} Moved by: {recruiterName}
                  </span>
                )}
              </div>
              <p className="m-0 text-[11px] text-[#8E8E93] leading-[14px] mt-1">{formatActivityTime(item)}</p>
            </>
          ) : (
            <>
              <p className="m-0 text-[11px] text-[#8E8E93] leading-[14px] mb-1">{formatActivityTime(item)}</p>
              <p className="m-0 text-sm font-medium text-[#1C1C1E] leading-[18px]">{item.candidate_name}</p>
              {item.candidate_number && (
                <a href={`tel:${item.candidate_number}`} className="m-0 text-xs text-[#0F47F2] leading-[16px] mt-0.5 block no-underline hover:underline">
                  {item.candidate_number}
                </a>
              )}
              {(item.company_name || item.job_role) && (
                <p className="m-0 text-xs text-[#6B7280] leading-[16px] mt-0.5">
                  {[item.company_name, item.job_role, item.experience].filter(Boolean).join(' | ')}
                </p>
              )}
              {recruiterName && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#6B7280]">Recruiter:</span>
                  <span className="inline-flex items-center gap-1 bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {UserIcon} {recruiterName}
                  </span>
                </div>
              )}
              {item.detail_text && (
                <p className="m-0 text-xs leading-[16px] mt-1" style={{ color: isFailedCall ? '#DC2626' : (item.detail_color || color) }}>
                  {item.detail_text}
                </p>
              )}
            </>
          )}
        </div>

       
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
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('all');

  if (groupedItems.length === 0) {
    return <div className="flex items-center justify-center py-12 text-sm text-[#8E8E93]">No activities recorded.</div>;
  }

  const apiRecruiterCalls = data.recruiter_wise_calls || data.recruiter_calls;

  return (
    <>
      <h3 className="uppercase text-[11px] font-semibold text-[#8E8E93] tracking-wider m-0 mb-5">Actions on this day</h3>
      <div className="flex flex-col">
        {groupedItems.map((item, idx) => {
          const { icon, color, bg } = getIconForType(item.type);
          const isExpanded = expandedGroup === item.id;
          const isCallGroup = (item.type || '').toLowerCase().includes('call') || item.type === 'phone';
          const isShortlistGroup = (item.type || '').toLowerCase().includes('shortlist');
          const isFilterableGroup = isCallGroup || isShortlistGroup;
          const detailItems = isExpanded ? getDetailsForGroupType(data, item.type) : [];

          const filteredDetails = isExpanded && isFilterableGroup
            ? filterCallsByRecruiter(detailItems, selectedRecruiter, isCallGroup ? apiRecruiterCalls : undefined)
            : detailItems;

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
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedGroup(null);
                        } else {
                          setExpandedGroup(item.id);
                          setSelectedRecruiter('all');
                        }
                      }}
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
              {isExpanded && (
                <div className="ml-6 pl-6 mb-3 border-l-2 rounded-bl-lg" style={{ borderColor: bg }}>
                  {isFilterableGroup && (
                    <RecruiterFilterBar
                      calls={detailItems}
                      selectedRecruiter={selectedRecruiter}
                      onSelectRecruiter={setSelectedRecruiter}
                      recruiterCallsFromApi={isCallGroup ? apiRecruiterCalls : undefined}
                      totalCalls={isCallGroup ? (data.total_daily_calls || data.summary?.calls_made) : data.summary?.shortlisted}
                    />
                  )}

                  {filteredDetails.length > 0 ? (
                    filteredDetails.map((detail, dIdx) => (
                      <DetailCard key={detail.id || dIdx} item={detail} idx={dIdx} selectedRecruiter={selectedRecruiter} />
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-[#8E8E93]">
                      No activities found for selected recruiter.
                    </div>
                  )}
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
function DetailTabContent({ items, tabKey, data }: { items: DailyActivityDetailItem[]; tabKey: TabKey; data?: DailyActivitiesResponse }) {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('all');
  const cfg = TAB_CONFIG.find(t => t.key === tabKey);
  const sectionTitle = cfg ? `${cfg.label.toUpperCase()} ON THIS DAY` : 'ACTIVITIES';
  const isCallTab = tabKey === 'call';
  const isShortlistTab = tabKey === 'shortlist';
  const isFilterableTab = isCallTab || isShortlistTab;

  const apiRecruiterCalls = data?.recruiter_wise_calls || data?.recruiter_calls;

  const filteredItems = isFilterableTab
    ? filterCallsByRecruiter(items, selectedRecruiter, isCallTab ? apiRecruiterCalls : undefined)
    : items;

  if (items.length === 0) {
    return <div className="flex items-center justify-center py-12 text-sm text-[#8E8E93]">No {cfg?.label.toLowerCase() || 'activities'} recorded.</div>;
  }

  return (
    <>
      <h3 className="uppercase text-[11px] font-semibold text-[#8E8E93] tracking-wider m-0 mb-5">{sectionTitle}</h3>
      {isFilterableTab && (
        <RecruiterFilterBar
          calls={items}
          selectedRecruiter={selectedRecruiter}
          onSelectRecruiter={setSelectedRecruiter}
          recruiterCallsFromApi={isCallTab ? apiRecruiterCalls : undefined}
          totalCalls={isCallTab ? (data?.total_daily_calls || data?.summary?.calls_made) : data?.summary?.shortlisted}
        />
      )}
      <div className="flex flex-col">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <DetailCard key={item.id || idx} item={item} idx={idx} selectedRecruiter={selectedRecruiter} />
          ))
        ) : (
          <div className="py-8 text-center text-xs text-[#8E8E93]">
            No activities found for selected recruiter.
          </div>
        )}
      </div>
    </>
  );
}

export default DailyActivitiesModal;

