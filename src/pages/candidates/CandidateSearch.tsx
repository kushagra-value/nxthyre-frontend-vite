import React from 'react';
import { 
  Search, 
  Filter, 
  DownloadCloud, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Phone,
  Mail,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Users
} from 'lucide-react';
import CandidateFilterPanel, { FiltersState } from './components/CandidateFilterPanel';
import candidateSearchService, {
  V1Candidate,
  V1SearchRequest,
  V1Workspace,
  V1Job,
} from '../../services/candidateSearchService';
import candidateService from '../../services/candidateService';

// ── Icons for stat cards ──
const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </svg>
);

const CloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
  </svg>
);

// Mini icons for modal
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// ── Stat Card ──
const StatCard = ({ title, value, change, changeText, positive, icon: Icon }: any) => (
  <div className="bg-white rounded-[12px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 min-w-[240px] flex-1 border border-gray-100">
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
      <Icon />
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-green-500'}`}>{change}</span>
      <span className="text-sm text-gray-400">{changeText}</span>
    </div>
    <div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-[32px] font-semibold text-gray-800 leading-tight">{value}</div>
    </div>
  </div>
);

// ── Source filter options ──
const SOURCE_OPTIONS = [
  {
    value: "Naukbot",
    label: "Naukbot",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z" fill="#0F47F2"/>
        <path d="M12.3542 13.0156L12.3347 13.9803L12.2714 16.762V16.8692C7.57498 12.8013 6.77113 11.8123 6.63472 11.5103V11.5005C6.61523 11.442 6.61036 11.3836 6.62011 11.3251C6.62011 11.3056 6.62985 11.2813 6.63472 11.2618C6.63472 11.2423 6.64446 11.2277 6.64934 11.2082C6.69805 11.0767 6.77113 10.95 6.8637 10.8428C6.92703 10.76 7.00011 10.682 7.07318 10.609C7.23395 10.4482 7.40934 10.302 7.58959 10.1656C7.68216 10.0974 7.77472 10.0292 7.87703 9.96102C8.0719 9.82948 8.28139 9.69794 8.50062 9.56641C10.1911 11.14 12.3298 12.9962 12.3591 13.0205L12.3542 13.0156Z" fill="url(#paint0_linear_4468_2998)"/>
        <path d="M12.4185 3.88768L12.399 4.8523L12.3893 5.32974L12.3698 6.28948L12.3601 6.77179L12.3406 7.7364C12.3065 7.75102 10.1629 8.57922 8.51135 9.56332C8.29212 9.69486 8.08263 9.8264 7.88776 9.95794C7.79032 10.0261 7.69289 10.0944 7.60032 10.1626C7.4152 10.299 7.24468 10.4451 7.08391 10.6059C7.01084 10.679 6.93776 10.7569 6.87443 10.8397C6.7234 11.0297 6.63571 11.2149 6.62109 11.3902L6.64058 10.5864V10.4549V10.411L6.6552 9.90435L6.68443 8.90076L6.69904 8.40871L6.72827 7.41486C7.0693 6.02153 11.8631 4.10204 12.4283 3.88281L12.4185 3.88768Z" fill="white"/>
        <path d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear_4468_2998" x1="11.3847" y1="14.4772" x2="5.81139" y2="8.05128" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="#B1B1B1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: "Naukri",
    label: "Naukri",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z" fill="#4285F4"/>
        <path d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z" fill="white"/>
      </svg>
    ),
  },
  {
    value: "Manual Upload",
    label: "Manual Upload",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#10B981"/>
        <path d="M9.5 5.5v8M5.5 9.5h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ── Sort config ──
type SortKey = 'created_at' | 'experience';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: Record<string, string> = {
  created_at_desc: 'Newest First',
  created_at_asc: 'Oldest First',
  experience_desc: 'Exp: High to Low',
  experience_asc: 'Exp: Low to High',
};

const PAGE_LIMIT = 10;

// ── Move to Pipeline Modal ──
interface MoveToPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: V1Candidate[];
  workspaces: V1Workspace[];
  jobs: V1Job[];
  onSuccess: () => void;
}

const MoveToPipelineModal = ({ isOpen, onClose, selectedCandidates, workspaces, jobs, onSuccess }: MoveToPipelineModalProps) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>('');
  const [selectedJobId, setSelectedJobId] = React.useState<string>('');
  const [selectedStageId, setSelectedStageId] = React.useState<string>('');
  const [stages, setStages] = React.useState<{ id: number; name: string }[]>([]);
  const [loadingStages, setLoadingStages] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ added: number; skipped: number } | null>(null);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setSelectedWorkspaceId('');
      setSelectedJobId('');
      setSelectedStageId('');
      setStages([]);
      setResult(null);
    }
  }, [isOpen]);

  // Fetch pipeline stages when job changes
  React.useEffect(() => {
    if (!selectedJobId) {
      setStages([]);
      setSelectedStageId('');
      return;
    }
    let cancelled = false;
    const fetchStages = async () => {
      setLoadingStages(true);
      try {
        const data = await candidateService.getPipelineStages(Number(selectedJobId));
        if (!cancelled) {
          setStages(data.map(s => ({ id: s.id, name: s.name })));
        }
      } catch (err) {
        console.error('Failed to fetch stages', err);
      } finally {
        if (!cancelled) setLoadingStages(false);
      }
    };
    fetchStages();
    return () => { cancelled = true; };
  }, [selectedJobId]);

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedStageId || selectedCandidates.length === 0) return;
    setSubmitting(true);
    try {
      const res = await candidateSearchService.moveToPipeline(Number(selectedJobId), {
        candidate_ids: selectedCandidates.map(c => c.id),
        target_stage_id: Number(selectedStageId),
      });
      setResult({ added: res.added_count, skipped: res.skipped_count });
      // Auto-close after 1.5s on success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to move candidates');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Move to Pipeline</h2>
            <p className="text-sm text-gray-400">
              Move {selectedCandidates.length} selected candidate{selectedCandidates.length > 1 ? 's' : ''} into a job pipeline
            </p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Candidate cards */}
        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Selected Candidates<span className="text-red-500">*</span>
          </label>
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-6 max-h-[160px] overflow-y-auto custom-scrollbar">
            {selectedCandidates.map(c => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-blue-600">{c.jobRole?.title || '—'} {c.client?.name ? `- ${c.client.name}` : ''}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {c.experience != null && <span>{c.experience} yrs</span>}
                  {c.location && <span className="flex items-center gap-1"><MapPinIcon /> {c.location}</span>}
                  {c.noticePeriod && <span className="flex items-center gap-1"><CalendarIcon /> {c.noticePeriod}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Result banner */}
          {result && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ {result.added} added, {result.skipped} skipped
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => { setSelectedWorkspaceId(e.target.value); setSelectedJobId(''); setSelectedStageId(''); setStages([]); }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
              >
                <option value="" disabled>Select company...</option>
                {workspaces.map(ws => (
                  <option key={ws.id} value={String(ws.id)}>{ws.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setSelectedStageId(''); }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
                disabled={!selectedWorkspaceId}
              >
                <option value="" disabled>Select role...</option>
                {jobs.map(j => (
                  <option key={j.id} value={String(j.id)}>{j.title} (#{j.job_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
                disabled={!selectedJobId || loadingStages}
              >
                <option value="" disabled>{loadingStages ? 'Loading stages...' : 'Select stage...'}</option>
                {stages.map(s => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedJobId || !selectedStageId || submitting}
            className="flex-[2] py-3 bg-[#0F47F2] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Move to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Export Dropdown ──
const ExportDropdown = ({ 
  isOpen, onClose, onExport 
}: { 
  isOpen: boolean; onClose: () => void; onExport: (format: 'csv' | 'xlsx') => void 
}) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 w-44 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 border border-gray-100">
        <button onClick={() => { onExport('csv'); onClose(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
          <DownloadCloud className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={() => { onExport('xlsx'); onClose(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
          <DownloadCloud className="w-4 h-4" /> Export XLSX
        </button>
      </div>
    </>
  );
};

// ── Sort button helper ──
const SortIndicator = ({ column, currentSort }: { column: SortKey; currentSort: string }) => {
  if (currentSort === `${column}_asc`) return <ArrowUp className="w-3 h-3 ml-1 inline" />;
  if (currentSort === `${column}_desc`) return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
};

// ── Helper: format date ──
function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Helper: build API request from component state ──
function buildSearchRequest(
  searchQuery: string,
  page: number,
  sortBy: string,
  filters: FiltersState,
  workspaceMap: Map<string, number>,
  jobMap: Map<string, number>,
): V1SearchRequest {
  const req: V1SearchRequest = {
    pagination: { page, limit: PAGE_LIMIT },
    sort_by: sortBy,
  };

  if (searchQuery.trim()) {
    req.searchQuery = searchQuery.trim();
  }

  const apiFilters: any = {};

  // Location
  if (filters.location.length > 0) {
    apiFilters.location = filters.location;
  }

  // Clients → clientIds
  if (filters.clients.length > 0) {
    const ids = filters.clients
      .map(c => workspaceMap.get(c))
      .filter((id): id is number => id !== undefined);
    if (ids.length > 0) apiFilters.clientIds = ids;
  }

  // Experience
  if (filters.experience.min || filters.experience.max) {
    apiFilters.experience = {};
    if (filters.experience.min) apiFilters.experience.min = Number(filters.experience.min);
    if (filters.experience.max) apiFilters.experience.max = Number(filters.experience.max);
  }

  // Job Role → jobIds
  if (filters.jobRole.length > 0) {
    const ids = filters.jobRole
      .map(j => jobMap.get(j))
      .filter((id): id is number => id !== undefined);
    if (ids.length > 0) apiFilters.jobIds = ids;
  }

  // Notice Period
  if (filters.noticePeriod.selected.length > 0 || filters.noticePeriod.minDays || filters.noticePeriod.maxDays) {
    apiFilters.noticePeriod = {};
    if (filters.noticePeriod.selected.length > 0) apiFilters.noticePeriod.selected = filters.noticePeriod.selected;
    if (filters.noticePeriod.minDays) apiFilters.noticePeriod.minDays = Number(filters.noticePeriod.minDays);
    if (filters.noticePeriod.maxDays) apiFilters.noticePeriod.maxDays = Number(filters.noticePeriod.maxDays);
  }

  // Date Created
  if (filters.dateCreated.type) {
    apiFilters.dateCreated = { type: filters.dateCreated.type };
    if (filters.dateCreated.type === 'Custom') {
      if (filters.dateCreated.from) apiFilters.dateCreated.from = filters.dateCreated.from;
      if (filters.dateCreated.to) apiFilters.dateCreated.to = filters.dateCreated.to;
    }
  }

  // Source
  if (filters.source.length > 0) {
    apiFilters.source = filters.source;
  }

  if (Object.keys(apiFilters).length > 0) {
    req.filters = apiFilters;
  }

  return req;
}

// ── Pagination helper ──
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ══════════════════════════════════════════════
// ██  Main Component
// ══════════════════════════════════════════════

export default function CandidateSearch() {
  // ── UI state ──
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);

  // ── Filter state ──
  const [filters, setFilters] = React.useState<FiltersState>({
    location: [],
    clients: [],
    experience: { min: "", max: "" },
    jobRole: [],
    noticePeriod: { selected: [], minDays: "", maxDays: "" },
    dateCreated: { type: "", from: "", to: "" },
    source: [],
  });

  // ── Search, sort, pagination ──
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('created_at_desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  // ── Data ──
  const [candidates, setCandidates] = React.useState<V1Candidate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [workspaces, setWorkspaces] = React.useState<V1Workspace[]>([]);
  const [jobs, setJobs] = React.useState<V1Job[]>([]);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // ── Dropdown options ──
  const [optionsData, setOptionsData] = React.useState<any>({
    location: [],
    clients: [],
    experience: [],
    jobRole: [],
    noticePeriod: [
      { value: "1 Month", label: "1 Month" },
      { value: "2 Month", label: "2 Month" },
      { value: "3 Month", label: "3 Month" },
    ],
    dateCreated: [],
    source: SOURCE_OPTIONS,
  });

  // Maps for name→id lookups
  const workspaceMapRef = React.useRef<Map<string, number>>(new Map());
  const jobMapRef = React.useRef<Map<string, number>>(new Map());
  const logoRequestedRef = React.useRef<Set<string>>(new Set());

  // ── Debounce search ──
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch dropdown data on mount ──
  React.useEffect(() => {
    let cancelled = false;

    const fetchDropdownData = async () => {
      try {
        const [wsData, jobsData] = await Promise.all([
          candidateSearchService.getWorkspaces().catch(() => []),
          candidateSearchService.getJobs().catch(() => []),
        ]);

        if (cancelled) return;

        setWorkspaces(wsData);
        setJobs(jobsData);

        // Build workspace map & options
        const wsMap = new Map<string, number>();
        const clientOptions = wsData.map((ws: V1Workspace) => {
          wsMap.set(ws.name, ws.id);
          return { value: ws.name, label: ws.name, logo: undefined as any };
        });
        workspaceMapRef.current = wsMap;

        // Build job map & options
        const jMap = new Map<string, number>();
        const jobOptions = jobsData.map((j: V1Job) => {
          const val = String(j.id);
          jMap.set(val, j.id);
          return { value: val, label: j.title, subLabel: `Job ID: ${j.job_id}` };
        });
        jobMapRef.current = jMap;

        setOptionsData((prev: any) => ({
          ...prev,
          clients: clientOptions,
          jobRole: jobOptions,
        }));

        // Fetch logos for clients
        wsData.forEach((ws: V1Workspace) => {
          const name = ws.name;
          if (name && !logoRequestedRef.current.has(name)) {
            logoRequestedRef.current.add(name);
            const apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY;
            if (apiKey) {
              fetch(`https://api.logo.dev/search?q=${encodeURIComponent(name)}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
              })
              .then(res => res.json())
              .then(data => {
                if (cancelled) return;
                const logoUrl = data.length > 0 ? data[0].logo_url : null;
                if (logoUrl) {
                  setOptionsData((prev: any) => ({
                    ...prev,
                    clients: prev.clients.map((c: any) => c.value === name ? { ...c, logo: logoUrl } : c),
                  }));
                }
              }).catch(() => {});
            }
          }
        });
      } catch (err) {
        console.error("Failed to load dropdown data", err);
      }
    };

    fetchDropdownData();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch candidates ──
  React.useEffect(() => {
    let cancelled = false;

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const req = buildSearchRequest(
          debouncedQuery,
          currentPage,
          sortBy,
          filters,
          workspaceMapRef.current,
          jobMapRef.current,
        );
        const res = await candidateSearchService.searchCandidates(req);
        if (!cancelled) {
          setCandidates(res.data?.candidates || []);
          setTotalCount(res.data?.totalCount || 0);
          setTotalPages(res.data?.totalPages || 0);
          setCurrentPage(res.data?.currentPage || 1);
        }
      } catch (err) {
        console.error("Failed to fetch candidates", err);
        if (!cancelled) {
          setCandidates([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchCandidates();
    return () => { cancelled = true; };
  }, [debouncedQuery, currentPage, sortBy, filters]);

  // ── Filter count ──
  const totalFiltersApplied = Object.entries(filters).reduce((acc, [key, val]) => {
    if (key === 'experience') {
      const exp = val as FiltersState['experience'];
      return acc + (exp.min ? 1 : 0) + (exp.max ? 1 : 0);
    }
    if (key === 'noticePeriod') {
      const np = val as FiltersState['noticePeriod'];
      return acc + np.selected.length + (np.minDays ? 1 : 0) + (np.maxDays ? 1 : 0);
    }
    if (key === 'dateCreated') {
      const dc = val as FiltersState['dateCreated'];
      return acc + (dc.type ? 1 : 0);
    }
    if (Array.isArray(val)) {
      return acc + val.length;
    }
    return acc;
  }, 0);

  // ── Handlers ──
  const handleApplyFilters = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (column: SortKey) => {
    setSortBy(prev => {
      if (prev === `${column}_desc`) return `${column}_asc`;
      return `${column}_desc`;
    });
    setCurrentPage(1);
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map(c => c.id)));
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      if (selectedIds.size > 0) {
        await candidateSearchService.exportCandidates({
          format,
          candidate_ids: Array.from(selectedIds),
        });
      } else {
        // Export with current search payload
        const searchPayload = buildSearchRequest(
          debouncedQuery, 1, sortBy, filters,
          workspaceMapRef.current, jobMapRef.current,
        );
        await candidateSearchService.exportCandidates({
          format,
          search_payload: searchPayload,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleActionClick = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // ── Pagination ──
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const showingEnd = Math.min(currentPage * PAGE_LIMIT, totalCount);

  const selectedCandidates = candidates.filter(c => selectedIds.has(c.id));

  // ── Skeleton rows ──
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32 mb-1" /><div className="h-3 bg-gray-100 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    </tr>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full custom-scrollbar relative">
      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
        
        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4">
          <StatCard 
            title="Total Candidates" 
            value={totalCount > 0 ? totalCount.toLocaleString() : '—'} 
            change="10%" 
            changeText="vs last month" 
            positive={true} 
            icon={BriefcaseIcon} 
          />
          <StatCard 
            title="Total Hired" 
            value="822" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={UserCheckIcon} 
          />
          <StatCard 
            title="Via Naukbot" 
            value="12048" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={BotIcon} 
          />
          <StatCard 
            title="Manual Uploads" 
            value="2341" 
            change="+25" 
            changeText="this month" 
            positive={true} 
            icon={UploadCloudIcon} 
          />
          <StatCard 
            title="Others" 
            value="830" 
            change="+25" 
            changeText="this month" 
            positive={true} 
            icon={CloudIcon} 
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 flex items-center justify-between mt-6 border border-gray-200 border-b-0">
          <div className="flex items-center py-3 px-4 flex-1">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 min-w-[300px] bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="relative inline-block">
              <button 
                ref={filterButtonRef}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  isFilterPanelOpen || totalFiltersApplied > 0
                    ? "border-[#0F47F2] text-[#0F47F2] bg-blue-50/50" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filters
                {totalFiltersApplied > 0 && (
                  <span className="bg-[#0F47F2] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                    {totalFiltersApplied}
                  </span>
                )}
              </button>

              <CandidateFilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
                anchorRef={filterButtonRef}
                optionsData={optionsData}
              />
            </div>

            {/* Selection indicator */}
            {selectedIds.size > 0 && (
              <div className="ml-4 flex items-center gap-2 text-sm text-[#0F47F2] font-medium">
                <Users className="w-4 h-4" />
                {selectedIds.size} selected
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 pr-4">
            {selectedIds.size > 0 && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#0F47F2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                Move to Pipeline
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                <DownloadCloud className="w-5 h-5" />
              </button>
              <ExportDropdown isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} onExport={handleExport} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-b-xl border-t-0 border-gray-200">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                      checked={candidates.length > 0 && selectedIds.size === candidates.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Candidate</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Role</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Location</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 cursor-pointer select-none" onClick={() => handleSort('experience')}>
                    Exp <SortIndicator column="experience" currentSort={sortBy} />
                  </th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Notice</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Source</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    Date Added <SortIndicator column="created_at" currentSort={sortBy} />
                  </th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-12 h-12 stroke-[1.5]" />
                        <div className="text-lg font-medium text-gray-500">No candidates found</div>
                        <div className="text-sm">Try adjusting your search or filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 group relative">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                          checked={selectedIds.has(c.id)}
                          onChange={() => handleSelectCandidate(c.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                              {c.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{c.name || '—'}</div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {c.client?.name || '—'} {c.email ? `• ${c.email}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-700">{c.jobRole?.title || '—'}</td>
                      <td className="p-4 text-gray-600">{c.location || '—'}</td>
                      <td className="p-4 text-gray-600">{c.experience != null ? `${c.experience} yrs` : '—'}</td>
                      <td className="p-4 font-medium text-amber-500">{c.noticePeriod || '—'}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          c.source === 'Naukbot' ? 'bg-blue-50 text-blue-700' :
                          c.source === 'Naukri' ? 'bg-indigo-50 text-indigo-700' :
                          c.source === 'Manual Upload' ? 'bg-green-50 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {c.source || '—'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{formatDate(c.dateCreated)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedIds(new Set([c.id]));
                              setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-[#0F47F2] text-white text-xs font-semibold rounded-[6px] hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            Add to Pipeline
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => handleActionClick(c.id)}
                              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 focus:outline-none"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {activeMenuId === c.id && (
                              <div className="absolute right-0 top-10 w-40 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 border border-gray-100">
                                 {c.phone && (
                                   <a href={`tel:${c.phone}`} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                     <Phone className="w-4 h-4" /> Call
                                   </a>
                                 )}
                                 {c.email && (
                                   <a href={`mailto:${c.email}`} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                     <Mail className="w-4 h-4" /> Mail
                                   </a>
                                 )}
                                 <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                   <FileText className="w-4 h-4" /> View Resume
                                 </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              {totalCount > 0 
                ? `Showing ${showingStart}–${showingEnd} of ${totalCount.toLocaleString()}`
                : 'No results'}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pageNumbers.map((p, idx) => 
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                        currentPage === p 
                          ? 'bg-[#0F47F2] text-white' 
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 border border-gray-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <MoveToPipelineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedCandidates={selectedCandidates}
        workspaces={workspaces}
        jobs={jobs}
        onSuccess={() => {
          setSelectedIds(new Set());
          // Re-trigger search
          setCurrentPage(p => p);
        }}
      />
      
      {/* Invisible overlay to close popover when clicking anywhere else */}
      {activeMenuId !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenuId(null)}
        />
      )}
    </div>
  );
}
