import { useState, useEffect, useRef } from 'react';
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
  onCompanyChange,
  onJobRoleChange,
  companies = [],
  jobRoles = [],
}: FilterDropdownsProps) {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const jobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
      if (jobRef.current && !jobRef.current.contains(e.target as Node)) {
        setJobOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCompanyLabel = selectedCompany === 'all'
    ? 'All Companies'
    : companies.find((c) => c.id === selectedCompany)?.name || 'All Companies';

  const selectedJobLabel = selectedJobRole === 'all'
    ? 'All Job Roles'
    : jobRoles.find((j) => j.id === selectedJobRole)?.name || 'All Job Roles';

  return (
    <div className="flex items-center gap-3">
      {/* Company filter */}
      <div className="relative" ref={companyRef}>
        <button
          onClick={() => { setCompanyOpen(!companyOpen); setJobOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D1D6] bg-white text-sm text-[#4B5563] cursor-pointer hover:border-[#0F47F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 9.16669L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16669" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.37269 8.70255C3.78877 11.3954 6.98271 12.5 10 12.5C13.0174 12.5 16.2113 11.3954 17.6274 8.70255C18.3033 7.41713 17.7915 5 16.1267 5H3.87338C2.20857 5 1.69673 7.41714 2.37269 8.70255Z" stroke="#4B5563" />
          </svg>
          {selectedCompanyLabel}
          <ChevronDown className={`w-3.5 h-3.5 text-[#8E8E93] transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
        </button>
        {companyOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
            <button
              onClick={() => { onCompanyChange('all'); setCompanyOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${selectedCompany === 'all' ? 'bg-[#EEF2FF] text-[#0F47F2] font-medium' : 'text-[#374151] hover:bg-[#F9FAFB]'}`}
            >
              All Companies
            </button>
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => { onCompanyChange(c.id); setCompanyOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${selectedCompany === c.id ? 'bg-[#EEF2FF] text-[#0F47F2] font-medium' : 'text-[#374151] hover:bg-[#F9FAFB]'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Job Role filter */}
      <div className="relative" ref={jobRef}>
        <button
          onClick={() => { setJobOpen(!jobOpen); setCompanyOpen(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D1D1D6] bg-white text-sm text-[#4B5563] cursor-pointer hover:border-[#0F47F2] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M6.66663 10.8333H8.74996" stroke="#4B5563" strokeLinecap="round" />
            <path d="M6.66663 7.5H12.0833" stroke="#4B5563" strokeLinecap="round" />
            <path d="M6.66663 14.1667H7.91663" stroke="#4B5563" strokeLinecap="round" />
            <path d="M16.5237 2.643C15.5474 1.66669 13.976 1.66669 10.8333 1.66669H9.16667C6.02397 1.66669 4.45262 1.66669 3.47631 2.643C2.5 3.61931 2.5 5.19065 2.5 8.33335V11.6667C2.5 14.8094 2.5 16.3808 3.47631 17.357C4.45262 18.3334 6.02397 18.3334 9.16667 18.3334H10.8333C13.976 18.3334 15.5474 18.3334 16.5237 17.357C17.3096 16.5711 17.4628 15.3997 17.4928 13.3334" stroke="#4B5563" strokeLinecap="round" />
          </svg>
          {selectedJobLabel}
          <ChevronDown className={`w-3.5 h-3.5 text-[#8E8E93] transition-transform ${jobOpen ? 'rotate-180' : ''}`} />
        </button>
        {jobOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
            <button
              onClick={() => { onJobRoleChange('all'); setJobOpen(false); }}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${selectedJobRole === 'all' ? 'bg-[#EEF2FF] text-[#0F47F2] font-medium' : 'text-[#374151] hover:bg-[#F9FAFB]'}`}
            >
              All Job Roles
            </button>
            {jobRoles.map((j) => (
              <button
                key={j.id}
                onClick={() => { onJobRoleChange(j.id); setJobOpen(false); }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${selectedJobRole === j.id ? 'bg-[#EEF2FF] text-[#0F47F2] font-medium' : 'text-[#374151] hover:bg-[#F9FAFB]'}`}
              >
                {j.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

