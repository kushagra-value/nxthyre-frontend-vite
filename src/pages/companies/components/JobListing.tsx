import React, { useState, useEffect, useRef } from "react";
import {
    ChevronLeft,
    Globe,
    MapPin,
    Calendar,
    Settings,
    Eye,
    Star,
    Plus,
    Briefcase,
    Users,
    Route,
    UserCheck,
    UserCircle,
    Search,
    LayoutGrid,
    DownloadCloud,
    Pencil,
    Pause,
    Share2,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Copy,
    ChevronDown,
    MoreHorizontal,
    Flag,
    Trash2,
    MessageSquare,
} from "lucide-react";
import { MyWorkspace } from "../../../services/organizationService";
import { Job, jobPostService } from "../../../services/jobPostService";
import { showToast as toastUtil } from "../../../utils/toast";
import CreateJobRoleModal from "../../candidates/components/CreateJobRoleModal";
import EditJobRoleModal from "../../candidates/components/EditJobRoleModal";
import CompanyInfoDrawer from "./CompanyInfoDrawer";

interface JobListingProps {
    selectedWorkspace: MyWorkspace;
    setSelectedWorkspace: (ws: MyWorkspace | null) => void;
    logos: Record<string, string | null>;
    workspaceJobs: Job[];
    activeJobFilter: "All" | "Active" | "Paused" | "Inactive" | "Draft";
    setActiveJobFilter: (filter: "All" | "Active" | "Paused" | "Inactive" | "Draft") => void;
    jobSearchQuery: string;
    setJobSearchQuery: (query: string) => void;
    filteredWorkspaceJobs: Job[];
    jobsLoading: boolean;
    setInfoWorkspace: (ws: MyWorkspace) => void;
    setShowCreateJobRole: (show: boolean) => void;
    showCreateJobRole: boolean;
    workspaces: MyWorkspace[];
    fetchJobs: () => void;
    showToast: {
        success: (msg: string) => void;
    };
    editingJobId: number | null;
    setEditingJobId: (id: number | null) => void;
    showEditJobRole: boolean;
    setShowEditJobRole: (show: boolean) => void;
    infoWorkspace: MyWorkspace | null;
    loadingCompanyResearch: boolean;
    companyResearchData: any;
    setInfoWorkspaceNull: () => void;
    onJobSelect?: (job: Job) => void;
}

const JobListing: React.FC<JobListingProps> = ({
    selectedWorkspace,
    setSelectedWorkspace,
    logos,
    workspaceJobs,
    activeJobFilter,
    setActiveJobFilter,
    jobSearchQuery,
    setJobSearchQuery,
    filteredWorkspaceJobs,
    jobsLoading,
    setInfoWorkspace,
    setShowCreateJobRole,
    showCreateJobRole,
    workspaces,
    fetchJobs,
    showToast,
    editingJobId,
    setEditingJobId,
    showEditJobRole,
    setShowEditJobRole,
    infoWorkspace,
    loadingCompanyResearch,
    companyResearchData,
    setInfoWorkspaceNull,
    onJobSelect,
}) => {
    // ── Pagination state ──
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Reset pagination when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeJobFilter, jobSearchQuery]);

    const [showUnpublishModal, setShowUnpublishModal] = useState<number | null>(null);
    const [showPublishModal, setShowPublishModal] = useState<number | null>(null);
    const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
    const [menuOpenJobId, setMenuOpenJobId] = useState<number | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0, bottom: 0, isBottom: false });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenJobId(null);
            }
        };
        const handleScroll = () => {
            setMenuOpenJobId(null);
        };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, []);

    const handleStatusChange = async (jobId: number, newStatus: string) => {
        setStatusUpdating(jobId);
        try {
            await jobPostService.updateJobRoleStatus(jobId, newStatus);
            fetchJobs();
            toastUtil.success("Status updated");
        } catch (error) {
            toastUtil.error("Failed to update status");
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleUnpublishJobRole = async (jobId: number) => {
        try {
            await jobPostService.unpublishJob(jobId);
            await jobPostService.updateJob(jobId, { visibility: "PRIVATE" });
            fetchJobs();
            toastUtil.success("Unpublished");
        } catch {
            toastUtil.error("Failed to unpublish");
        }
        setShowUnpublishModal(null);
    };

    const handlePublishJobRole = async (jobId: number) => {
        try {
            await jobPostService.updateJob(jobId, { visibility: "PUBLIC" });
            fetchJobs();
            toastUtil.success("Published");
        } catch {
            toastUtil.error("Failed to publish");
        }
        setShowPublishModal(null);
    };

    const handleToggleFlag = async (jobId: number, currentFlag: boolean) => {
        try {
            await jobPostService.toggleJobFlag(jobId, !currentFlag);
            fetchJobs();
            toastUtil.success(!currentFlag ? "Job flagged" : "Job unflagged");
        } catch {
            toastUtil.error("Failed to update flag status");
        }
    };

    const sortedJobs = React.useMemo(() => {
        if (!sortConfig) return filteredWorkspaceJobs;

        return [...filteredWorkspaceJobs].sort((a, b) => {
            const getVal = (job: any, key: string) => {
                const daysOpen = job.days_open || 0; // Replace with real calc if needed
                const noOfPositions = job.num_positions || job.No_of_opening_or_positions_ || 0;

                switch (key) {
                    case "Job Title": return (job.title || "").toLowerCase();
                    case "Candidates": return job.candidates_count ?? job.total_applied ?? 0;
                    case "Days open": return daysOpen;
                    case "Position": return noOfPositions;
                    case "Budget": return job.salary_max || 0;
                    case "Active Date": return job.last_active_date ? new Date(job.last_active_date).getTime() : (new Date(job.updated_at).getTime() || 0);
                    case "Status": return (job.status || "").toLowerCase();
                    default: return "";
                }
            };

            const aVal = getVal(a, sortConfig.key);
            const bVal = getVal(b, sortConfig.key);

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredWorkspaceJobs, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (['Candidates', 'Days open', 'Position', 'Budget'].includes(key)) {
            direction = 'desc'; // fallback intuitive default for numbers
        } else if (key === 'Active Date') {
            direction = 'desc'; // newest first
        }

        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === direction) {
                direction = direction === 'asc' ? 'desc' : 'asc';
            } else {
                setSortConfig(null);
                setCurrentPage(1);
                return;
            }
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400 group-hover:text-gray-600 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />
            : <ArrowDown className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />;
    };

    const totalPages = Math.max(1, Math.ceil(sortedJobs.length / ITEMS_PER_PAGE));
    const paginatedJobs = sortedJobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, sortedJobs.length);

    // ── Share pipeline handler ──
    const handleSharePipeline = () => {
        if (!selectedWorkspace?.id) return;
        const publicPageUrl = `${window.location.origin}/public/workspaces/${selectedWorkspace.id}/applications`;
        window.open(publicPageUrl, '_blank');
    };

    // ── Page number generation ──
    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const formatSalaryToLPA = (salary: number | null | undefined): string => {
        if (salary == null || salary <= 0) return '??';
        const lpa = salary / 100000;
        return lpa % 1 === 0 ? lpa.toString() : lpa.toFixed(2);
    };
    const renderTrend = (val: number | undefined, defaultText: string) => {
        if (val === undefined || val === null || val === 0) return defaultText;
        return `${val > 0 ? '+' : ''}${val}% this month`;
    };

    const shortlistedTrend = renderTrend(selectedWorkspace.increased_decreased_rate_percentages?.shortlisted?.monthly, "--");
    const shortlistedColor = (selectedWorkspace.increased_decreased_rate_percentages?.shortlisted?.monthly || 0) >= 0 ? "text-[#009951]" : "text-[#DC2626]";

    const hiredTrend = renderTrend(selectedWorkspace.increased_decreased_rate_percentages?.hired?.monthly, "--");
    const hiredColor = (selectedWorkspace.increased_decreased_rate_percentages?.hired?.monthly || 0) >= 0 ? "text-[#009951]" : "text-[#DC2626]";

    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#F3F5F7]">
            {/* ── Company Info Card ── */}
            <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedWorkspace(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                    >
                        <ChevronLeft className="w-5 h-5 text-[#4B5563]" />
                    </button>
                    <div className="w-12 h-12 rounded-lg bg-[#F3F5F7] flex items-center justify-center overflow-hidden">
                        {logos[selectedWorkspace.name] ? (
                            <img src={logos[selectedWorkspace.name]!} alt={selectedWorkspace.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xl font-bold text-[#8E8E93]">{selectedWorkspace.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold text-[#4B5563]">{selectedWorkspace.name}</h2>
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase ${(selectedWorkspace.workspace_status || 'Active').toLowerCase() === 'active'
                                ? 'bg-[#EBFFEE] text-[#069855]'
                                : (selectedWorkspace.workspace_status || '').toLowerCase() === 'paused'
                                    ? 'bg-[#FFF7D6] text-[#92400E]'
                                    : 'bg-[#F3F5F7] text-[#8E8E93]'
                                }`}>
                                {selectedWorkspace.workspace_status || 'Active'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.website || "--"}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.headquarters || "--"}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.founded_year ? `Founded ${selectedWorkspace.company_research_data.founded_year}` : "--"}</span>
                            <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.industry || "--"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setInfoWorkspace(selectedWorkspace)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F5] border border-[#AEAEB2] rounded-md text-xs font-medium text-[#757575] hover:bg-gray-100 transition-colors"
                    >
                        View info <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                        disabled
                        title="Feature coming Soon"
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#EBFFEE] border border-[#34C759] rounded-md text-sm font-medium text-[#14AE5C] opacity-50 cursor-not-allowed"
                    >
                        <Star className="w-4 h-4 fill-current" /> --
                    </button>
                    <button
                        onClick={() => setShowCreateJobRole(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0F47F2] rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" /> Create Job
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                {[
                    { label: "Total Jobs", value: selectedWorkspace.jobs_count ?? workspaceJobs.length, trend: "--", trendColor: "text-[#8E8E93]", icon: <Briefcase className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Total Candidates", value: selectedWorkspace.candidates_in_workspace_count ?? workspaceJobs.reduce((acc, j) => acc + (j.total_applied || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <Users className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "In Pipeline", value: workspaceJobs.reduce((acc, j) => acc + (j.pipeline_candidate_count || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <Route className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Shortlisted", value: selectedWorkspace.shortlisted_candidates_in_workspace_count ?? workspaceJobs.reduce((acc, j) => acc + (j.shortlisted_candidate_count || 0), 0), trend: shortlistedTrend, trendColor: shortlistedColor, icon: <UserCheck className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Interview this week", value: workspaceJobs.reduce((acc, j) => acc + (j.interview_this_week || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <Calendar className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Hired", value: selectedWorkspace.hired_candidates_in_workspace_count ?? 0, trend: hiredTrend, trendColor: hiredColor, icon: <UserCircle className="w-5 h-5 text-[#0F47F2]" /> },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-[#D1D1D6] flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-lg border border-black/20 flex items-center justify-center">
                                {stat.icon}
                            </div>
                            <span className={`text-[12px] font-light text-right ${stat.trendColor}`}>{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-[12px] text-[#4B5563] mb-1">{stat.label}</p>
                            <p className="text-3xl font-medium text-black">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table Section ── */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Filters & Actions - first row */}
                <div className="p-4 border-b border-[#C7C7CC] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {(["All", "Active", "Paused", "Inactive", "Draft"] as const).map((filter) => {
                            let count = 0;
                            if (filter === "All") count = workspaceJobs.length;
                            else if (filter === "Active") count = workspaceJobs.filter(j => j.status === "ACTIVE").length;
                            else if (filter === "Paused") count = workspaceJobs.filter(j => j.status === "PAUSED").length;
                            else if (filter === "Inactive") count = workspaceJobs.filter(j => j.status === "INACTIVE").length;
                            else if (filter === "Draft") count = workspaceJobs.filter(j => j.pyjamahr_status === "DRAFT").length;

                            return (
                                <button
                                    key={filter}
                                    onClick={() => { setActiveJobFilter(filter); setCurrentPage(1); }}
                                    className={`h-[30px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center
                        ${activeJobFilter === filter
                                            ? 'bg-[#0F47F2] text-white'
                                            : 'border border-[#C7C7CC] text-[#AEAEB2] hover:bg-gray-50'}`}
                                >
                                    {filter} ({count})
                                </button>
                            );
                        })}
                    </div>
                    <button
                        disabled
                        title="Feature coming Soon"
                        className="flex items-center gap-2 px-3 py-2 border border-[#AEAEB2] rounded-md text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                    >
                        <LayoutGrid className="w-4 h-4" /> Grid View
                    </button>
                </div>

                {/* Search & Actions row */}
                <div className="p-4 border-b border-[#C7C7CC] flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-[248px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                        <input
                            type="text"
                            placeholder="Search for Jobs"
                            value={jobSearchQuery}
                            onChange={(e) => setJobSearchQuery(e.target.value)}
                            className="w-full h-9 pl-10 pr-4 bg-white border border-[#AEAEB2] rounded-[6px] text-xs text-[#4B5563] focus:outline-none" // UPDATED: rounded-[6px] + height match
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Share Pipeline - opens public applications page */}
                        <button
                            onClick={handleSharePipeline}
                            className="flex items-center gap-2 px-[12px] py-[10px] border border-[#AEAEB2] rounded-[6px] text-xs text-[#AEAEB2] hover:bg-[#E7EDFF] hover:text-[#0F47F2] hover:border-[#0F47F2] transition-colors"
                        >
                            <Share2 className="w-4 h-4" /> Share Pipeline
                        </button>

                        <button
                            disabled
                            title="Feature coming Soon"
                            className="flex items-center gap-2 px-[12px] py-[10px] border border-[#AEAEB2] rounded-[6px] text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                        >
                            <DownloadCloud className="w-4 h-4" /> Export CSV
                        </button>

                        <button
                            disabled
                            title="Feature coming Soon"
                            className="flex items-center gap-2 px-[12px] py-[10px] border border-[#AEAEB2] rounded-[6px] text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                        >
                            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                        <colgroup>
                            <col style={{ width: '3%' }} />  {/* Checkbox */}
                            <col style={{ width: '22%' }} /> {/* Job Title */}
                            <col style={{ width: '6%' }} />  {/* Position */}
                            <col style={{ width: '7%' }} />  {/* Candidates */}
                            <col style={{ width: '24%' }} /> {/* Pipeline Stages */}
                            <col style={{ width: '6%' }} />  {/* Days Open */}
                            <col style={{ width: '8%' }} />  {/* Status */}
                            <col style={{ width: '19%' }} /> {/* Note */}
                            <col style={{ width: '5%' }} />  {/* Actions */}
                        </colgroup>
                        <thead className="bg-[#F9FAFB]">
                            <tr>
                                <th className="px-4 py-3">
                                    <input type="checkbox" className="w-4 h-4 accent-[#0F47F2] rounded" />
                                </th>
                                {[
                                    { key: "Job Title" },
                                    { key: "Position" },
                                    { key: "Candidates" },
                                    { key: "Pipeline Stages", sortable: false },
                                    { key: "Days Open", sortKey: "Days open" },
                                    { key: "Status" },
                                    { key: "Note", sortable: false },
                                ].map(({ key, sortable = true, sortKey }: any) => (
                                    <th
                                        key={key}
                                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#AEAEB2] ${sortable ? 'cursor-pointer group hover:text-[#4B5563] transition-colors select-none whitespace-nowrap' : 'select-none whitespace-nowrap'}`}
                                        onClick={sortable ? () => handleSort(sortKey || key) : undefined}
                                    >
                                        <div className="flex items-center">
                                            {key}
                                            {sortable && <SortIcon columnKey={sortKey || key} />}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F3F5F7]">
                            {paginatedJobs.map((job, jobIdx) => {
                                const daysOpen = job.days_open || 18;
                                const noOfPositions = job.num_positions || job.No_of_opening_or_positions_ || 2;

                                const defaultStages = [
                                    { name: 'Shortlisted', count: job.shortlisted_candidate_count || 2, color: '#14b8a6', archive: 0 },
                                ];
                                const allStages = job.stage_breakdown || null;

                                // Filter: show only stages from Shortlisted onwards, exclude meta-stages
                                const hiddenStages = ['uncontacted', 'invites sent', 'applied','archives'];
                                const stages = allStages
                                    ? allStages.filter((s: any) => !hiddenStages.includes((s.name || '').toLowerCase()))
                                    : defaultStages;

                                const staticNotes = [
                                    "Change 1 year to 2 years of experience",
                                    "Update job description for Q2",
                                    "Review salary range with hiring manager",
                                    "Discussed requirements with team lead",
                                    "Waiting for team feedback on JD",
                                ];

                                return (
                                    <tr key={job.id} className="h-[72px] hover:bg-[#FAFBFC] transition-colors group">
                                        {/* Checkbox */}
                                        <td className="px-4 py-3">
                                            <input type="checkbox" className="w-4 h-4 accent-[#0F47F2] rounded" />
                                        </td>

                                        {/* Job Title */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-[14px] font-semibold text-[#1C1C1E] leading-[17px] cursor-pointer hover:text-[#0F47F2] hover:underline transition-colors truncate"
                                                        onClick={() => onJobSelect?.(job)}
                                                    >{job.title}</span>
                                                    {job.is_flagged && <Flag className="w-3.5 h-3.5 text-[#DC2626] fill-[#DC2626] shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <span
                                                        className="px-2 py-0.5 bg-[#E8F5E9] rounded-full text-[10px] font-medium text-[#2E7D32] whitespace-nowrap cursor-pointer hover:bg-[#C8E6C9] transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(`${job.job_id || job.id}`).then(() => showToast.success("Job ID copied"));
                                                        }}
                                                    >
                                                        {job.job_id || job.id}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563] whitespace-nowrap">
                                                        {job.experience_display || `${job.experience_min_years || 3} - ${job.experience_max_years || 5}yrs`}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                                                        (job.notice_period || 'Immediate') === 'Immediate'
                                                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                                            : (job.notice_period || '').includes('90')
                                                                ? 'bg-[#FFEBEE] text-[#C62828]'
                                                                : 'bg-[#FFF3E0] text-[#E65100]'
                                                    }`}>
                                                        {job.notice_period || 'Immediate'}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563] whitespace-nowrap">
                                                        {job.salary_display || `${formatSalaryToLPA(job.salary_min)} - ${formatSalaryToLPA(job.salary_max)} LPA`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Position */}
                                        <td className="px-4 py-3 text-sm font-medium text-[#4B5563] text-center">
                                            {noOfPositions}
                                        </td>

                                        {/* Candidates */}
                                        <td className="px-4 py-3 text-sm font-medium text-[#4B5563] text-center">
                                            {job.candidates_count ?? job.total_applied ?? 0}
                                        </td>

                                        {/* Pipeline Stages */}
                                        <td className="px-4 py-3">
                                            <div className="flex gap-[4px] items-center">
                                                {stages.length > 0 ? stages.map((item: any, idx: number) => {
                                                    const stageArchivedCount = item.archived_count || 0;
                                                    const displayLabel = stageArchivedCount > 0
                                                        ? `${item.count}-${stageArchivedCount}`
                                                        : `${item.count}`;
                                                    return (
                                                        <div key={idx} className="relative group/stage">
                                                            <div
                                                                className="min-w-[28px] h-[26px] px-1.5 rounded-[5px] flex items-center justify-center text-white text-[12px] font-semibold cursor-default"
                                                                style={{ backgroundColor: item.color }}
                                                            >
                                                                {displayLabel}
                                                            </div>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1C1C1E] text-white text-[11px] rounded-lg whitespace-nowrap opacity-0 group-hover/stage:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                                                                <div className="font-medium">{item.name}</div>
                                                                <div className="text-gray-300">Active: {item.count} · Archived: {stageArchivedCount}</div>
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1C1C1E]" />
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <span className="text-xs text-[#8E8E93]">--</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Days Open */}
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <span className="text-[14px] font-medium text-[#FF8D28]">{daysOpen} d</span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${
                                                job.status === 'ACTIVE' ? 'text-[#069855]'
                                                : job.status === 'PAUSED' ? 'text-[#92400E]'
                                                : 'text-[#8E8E93]'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${
                                                    job.status === 'ACTIVE' ? 'bg-[#069855]'
                                                    : job.status === 'PAUSED' ? 'bg-[#92400E]'
                                                    : 'bg-[#8E8E93]'
                                                }`} />
                                                {job.status === 'ACTIVE' ? 'Active'
                                                    : job.status === 'PAUSED' ? 'Paused'
                                                    : job.status === 'INACTIVE' ? 'Closed'
                                                    : job.status?.charAt(0) + job.status?.slice(1).toLowerCase()}
                                            </span>
                                        </td>

                                        {/* Note */}
                                        <td className="px-4 py-3">
                                            <span className="text-[13px] text-[#4B5563] line-clamp-2 leading-relaxed">
                                                {staticNotes[jobIdx % staticNotes.length]}
                                            </span>
                                        </td>

                                        {/* Three-dot Menu */}
                                        <td className="px-4 py-3">
                                            <div className="relative" ref={menuOpenJobId === job.id ? menuRef : null}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (menuOpenJobId === job.id) {
                                                            setMenuOpenJobId(null);
                                                        } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const isBottom = rect.bottom + 320 > window.innerHeight;
                                                            setMenuPos({ 
                                                                top: rect.bottom, 
                                                                bottom: window.innerHeight - rect.top,
                                                                right: window.innerWidth - rect.right, 
                                                                isBottom 
                                                            });
                                                            setMenuOpenJobId(job.id);
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F5F7] transition-colors"
                                                >
                                                    <MoreHorizontal className="w-5 h-5 text-[#8E8E93]" />
                                                </button>

                                                {menuOpenJobId === job.id && (
                                                    <div 
                                                        className="fixed w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-[9999] py-2"
                                                        style={
                                                            menuPos.isBottom
                                                                ? { bottom: menuPos.bottom + 4, right: menuPos.right }
                                                                : { top: menuPos.top + 4, right: menuPos.right }
                                                        }
                                                    >
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditingJobId(job.id); setShowEditJobRole(true); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <Pencil className="w-4 h-4" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(job.id, job.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <Pause className="w-4 h-4" /> {job.status === 'PAUSED' ? 'Resume' : 'Pause'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toastUtil.success("Add Note — Coming soon"); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <MessageSquare className="w-4 h-4" /> Add Note
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toastUtil.success("Note History — Coming soon"); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <MessageSquare className="w-4 h-4" /> Note History
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); window.open(`/jobs/${job.id}`, '_blank'); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <Share2 className="w-4 h-4" /> Share Job
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleFlag(job.id, !!job.is_flagged); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <Flag className="w-4 h-4" /> {job.is_flagged ? "Remove Flag" : "Mark as Flag"}
                                                        </button>
                                                        <div className="h-px bg-[#E5E7EB] my-1" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toastUtil.success("Delete Role — Coming soon"); setMenuOpenJobId(null); }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#DC2626] hover:bg-red-50 flex items-center gap-3"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete Role
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredWorkspaceJobs.length === 0 && !jobsLoading && (
                                <tr>
                                    <td colSpan={9} className="px-5 py-10 text-center text-[#8E8E93]">
                                        No jobs found for this criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-4 flex items-center justify-between border-t border-[#D1D1D6]">
                    <div className="text-[13px] text-[#8E8E93]">
                        {filteredWorkspaceJobs.length > 0
                            ? `Showing ${startIdx}-${endIdx} of ${sortedJobs.length} companies`
                            : 'No jobs to display'}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-[32px] h-[32px] border border-[#E5E7EB] rounded-[8px] text-sm flex items-center justify-center transition-colors ${currentPage === 1 ? 'text-[#D1D1D6] cursor-not-allowed' : 'text-[#6B7280] hover:bg-gray-50'}`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="w-[32px] h-[32px] flex items-center justify-center text-[#6B7280] text-sm">…</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-[32px] h-[32px] text-sm font-medium rounded-[8px] transition-colors ${currentPage === page
                                            ? 'bg-[#0F47F2] text-white'
                                            : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-[32px] h-[32px] border border-[#E5E7EB] rounded-[8px] text-sm flex items-center justify-center transition-colors ${currentPage === totalPages ? 'text-[#D1D1D6] cursor-not-allowed' : 'text-[#6B7280] hover:bg-gray-50'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

            </div>
            <CreateJobRoleModal
                isOpen={showCreateJobRole}
                onClose={() => setShowCreateJobRole(false)}
                workspaceId={selectedWorkspace.id}
                workspaces={workspaces.map(ws => ({ id: ws.id, name: ws.name }))}
                onJobCreated={() => {
                    setShowCreateJobRole(false);
                    fetchJobs(); // Refresh jobs
                    showToast.success("Job role created successfully!");
                }}
            />
            {editingJobId && (
                <EditJobRoleModal
                    isOpen={showEditJobRole}
                    jobId={editingJobId}
                    workspaceId={selectedWorkspace.id}
                    workspaces={workspaces.map(ws => ({ id: ws.id, name: ws.name }))}
                    onClose={() => {
                        setShowEditJobRole(false);
                        setEditingJobId(null);
                    }}
                    onJobUpdated={() => {
                        setShowEditJobRole(false);
                        setEditingJobId(null);
                        fetchJobs(); // Refresh jobs after update
                    }}
                />
            )}

            {/* ── Company Info Modal Overlay ── */}
            <CompanyInfoDrawer
                isOpen={!!infoWorkspace}
                loading={loadingCompanyResearch}
                data={companyResearchData}
                onClose={setInfoWorkspaceNull}
                onCreateJob={() => setShowCreateJobRole(true)}
            />

            {showPublishModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Publish Job</h3>
                            <p className="text-gray-600 mb-6">Publish {filteredWorkspaceJobs.find((c) => c.id === showPublishModal)?.title}?</p>
                            <div className="flex space-x-3">
                                <button onClick={() => setShowPublishModal(null)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={() => handlePublishJobRole(showPublishModal)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Publish</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUnpublishModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Pause className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Unpublish</h3>
                            <p className="text-gray-600 mb-6">Unpublish {filteredWorkspaceJobs.find((c) => c.id === showUnpublishModal)?.title}?</p>
                            <div className="flex space-x-3">
                                <button onClick={() => setShowUnpublishModal(null)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button onClick={() => handleUnpublishJobRole(showUnpublishModal)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Unpublish</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobListing;
