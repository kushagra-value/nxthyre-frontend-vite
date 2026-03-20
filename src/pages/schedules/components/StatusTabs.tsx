import { ChevronDown } from 'lucide-react';

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    scheduled: number;
    completed: number;
    overdue: number;
    cancelled: number;
  };
}

export default function StatusTabs({ activeTab, onTabChange, counts }: StatusTabsProps) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all, color: '#0F47F2' },
    { id: 'scheduled', label: 'Scheduled', count: counts.scheduled, color: '#0F47F2' },
    { id: 'completed', label: 'Completed', count: counts.completed, color: '#10B981' },
    { id: 'overdue', label: 'Overdue', count: counts.overdue, color: '#EF4444' },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: '#8E8E93' },
  ];

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-normal transition-all cursor-pointer border-none outline-none"
            style={{
              background: isActive ? '#E7EDFF' : 'transparent',
              color: isActive ? '#0F47F2' : '#4B5563',
            }}
          >
            {tab.label}
            <span
              className="text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
              style={{
                backgroundColor: isActive ? tab.color : '#E5E7EB',
                color: isActive ? '#FFFFFF' : '#4B5563',
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Filter Dropdowns ─── */

interface FilterDropdownsProps {
  selectedCompany: string;
  selectedJobRole: string;
  onCompanyChange: (val: string) => void;
  onJobRoleChange: (val: string) => void;
  companies?: { id: string; name: string }[];
  jobRoles?: { id: string; name: string }[];
}

export function FilterDropdowns({
  selectedCompany,
  selectedJobRole,
  onCompanyChange: _onCompanyChange,
  onJobRoleChange: _onJobRoleChange,
  companies: _companies = [],
  jobRoles: _jobRoles = [],
}: FilterDropdownsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Company filter */}
      <div className="relative">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D1D6] bg-white text-sm text-[#4B5563] cursor-pointer hover:border-[#0F47F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 9.16669L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16669" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.37269 8.70255C3.78877 11.3954 6.98271 12.5 10 12.5C13.0174 12.5 16.2113 11.3954 17.6274 8.70255C18.3033 7.41713 17.7915 5 16.1267 5H3.87338C2.20857 5 1.69673 7.41714 2.37269 8.70255Z" stroke="#4B5563" />
          </svg>
          {selectedCompany === 'all' ? 'All Companies' : selectedCompany}
          <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />
        </button>
      </div>

      {/* Job Role filter */}
      <div className="relative">
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D1D6] bg-white text-sm text-[#4B5563] cursor-pointer hover:border-[#0F47F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M6.66663 10.8333H8.74996" stroke="#4B5563" strokeLinecap="round" />
            <path d="M6.66663 7.5H12.0833" stroke="#4B5563" strokeLinecap="round" />
            <path d="M6.66663 14.1667H7.91663" stroke="#4B5563" strokeLinecap="round" />
            <path d="M16.5237 2.643C15.5474 1.66669 13.976 1.66669 10.8333 1.66669H9.16667C6.02397 1.66669 4.45262 1.66669 3.47631 2.643C2.5 3.61931 2.5 5.19065 2.5 8.33335V11.6667C2.5 14.8094 2.5 16.3808 3.47631 17.357C4.45262 18.3334 6.02397 18.3334 9.16667 18.3334H10.8333C13.976 18.3334 15.5474 18.3334 16.5237 17.357C17.3096 16.5711 17.4628 15.3997 17.4928 13.3334" stroke="#4B5563" strokeLinecap="round" />
          </svg>
          {selectedJobRole === 'all' ? 'All Job Roles' : selectedJobRole}
          <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />
        </button>
      </div>
    </div>
  );
}
