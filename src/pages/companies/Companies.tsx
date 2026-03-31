import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
    organizationService,
    MyWorkspace,
    CompanyResearchData,
    WorkspaceStatsCount
} from "../../services/organizationService";
import { jobPostService, Job } from "../../services/jobPostService";
import dashboardService, {
    SidebarData,
    SidebarImmediateAction,
    SidebarActivityGroup,
} from "../../services/dashboardService";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Plus,
    DownloadCloud,
    Calendar,
    ChevronDown,
    Star,
    ArrowRight,
    LayoutGrid,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    PlusCircle,
    UserCheck,
} from "lucide-react";
import CreateWorkspaceModal from "./components/CreateWorkspaceModal";
import JoinWorkspaceModal from "./components/JoinWorkspaceModal";
import PendingRequestsModal from "./components/PendingRequestsModal";
import { showToast } from "../../utils/toast";
import CompanyInfoDrawer from "./components/CompanyInfoDrawer";
import JobListing from "./components/JobListing";
import JobPipeline from "./components/JobPipeline";
import {
    companyStatCards,
    companyTableRows,
    CompanyTableRow,
} from "./companiesData";



const statusStyles: Record<string, { bg: string; text: string }> = {
    Active: { bg: "bg-[#DEF7EC]", text: "text-[#03543F]" },
    Paused: { bg: "bg-[#FFF7D6]", text: "text-[#92400E]" },
    Inactive: { bg: "bg-[#F3F5F7]", text: "text-[#8E8E93]" },
};

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.6057 6.23503C15.0203 7.00431 15.0203 8.99565 13.6057 9.76491L5.06441 14.4096C3.68957 15.1573 2 14.1842 2 12.6447V3.35525C2 1.81577 3.68957 0.842659 5.06441 1.5903L13.6057 6.23503Z" stroke="#14AE5C" />
    </svg>
);

const PauseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_519_5988)">
            <path d="M1.16699 3.49999C1.16699 2.40004 1.16699 1.85007 1.5087 1.50837C1.85041 1.16666 2.40038 1.16666 3.50032 1.16666C4.60027 1.16666 5.15024 1.16666 5.49195 1.50837C5.83366 1.85007 5.83366 2.40004 5.83366 3.49999V10.5C5.83366 11.5999 5.83366 12.1499 5.49195 12.4916C5.15024 12.8333 4.60027 12.8333 3.50032 12.8333C2.40038 12.8333 1.85041 12.8333 1.5087 12.4916C1.16699 12.1499 1.16699 11.5999 1.16699 10.5V3.49999Z" stroke="#4B5563" />
            <path d="M8.16699 3.49999C8.16699 2.40004 8.16699 1.85007 8.50871 1.50837C8.85043 1.16666 9.40039 1.16666 10.5003 1.16666C11.6003 1.16666 12.1502 1.16666 12.4919 1.50837C12.8337 1.85007 12.8337 2.40004 12.8337 3.49999V10.5C12.8337 11.5999 12.8337 12.1499 12.4919 12.4916C12.1502 12.8333 11.6003 12.8333 10.5003 12.8333C9.40039 12.8333 8.85043 12.8333 8.50871 12.4916C8.16699 12.1499 8.16699 11.5999 8.16699 10.5V3.49999Z" stroke="#4B5563" />
        </g>
        <defs>
            <clipPath id="clip0_519_5988">
                <rect width="14" height="14" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_519_4750)">
            <path d="M7.99967 14.6666C11.6816 14.6666 14.6663 11.6819 14.6663 7.99998C14.6663 4.31808 11.6816 1.33331 7.99967 1.33331C4.31778 1.33331 1.33301 4.31808 1.33301 7.99998C1.33301 11.6819 4.31778 14.6666 7.99967 14.6666Z" stroke="#8E8E93" />
            <path d="M5.33301 7.99998C5.33301 6.74291 5.33301 6.11436 5.72353 5.72384C6.11405 5.33331 6.74261 5.33331 7.99967 5.33331C9.25674 5.33331 9.88527 5.33331 10.2758 5.72384C10.6663 6.11436 10.6663 6.74291 10.6663 7.99998C10.6663 9.25705 10.6663 9.88558 10.2758 10.2761C9.88527 10.6666 9.25674 10.6666 7.99967 10.6666C6.74261 10.6666 6.11405 10.6666 5.72353 10.2761C5.33301 9.88558 5.33301 9.25705 5.33301 7.99998Z" stroke="#8E8E93" />
        </g>
        <defs>
            <clipPath id="clip0_519_4750">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

export default function Companies() {
    const { isAuthenticated } = useAuth();

    const [workspaces, setWorkspaces] = useState<MyWorkspace[]>([]);
    const [statsCount, setStatsCount] = useState<WorkspaceStatsCount | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
    const [logos, setLogos] = useState<Record<string, string | null>>({});
    const logoRequestedRef = useRef<Set<string>>(new Set());

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showCreateJobRole, setShowCreateJobRole] = useState(false);
    const [showEditJobRole, setShowEditJobRole] = useState(false);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);

    const [infoWorkspace, setInfoWorkspace] = useState<MyWorkspace | null>(null);
    const [companyResearchData, setCompanyResearchData] = useState<CompanyResearchData | null>(null);
    const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);

    useEffect(() => {
        if (!infoWorkspace) {
            setCompanyResearchData(null);
            return;
        }

        let cancelled = false;
        setLoadingCompanyResearch(true);
        organizationService.getCompanyResearchData(infoWorkspace.id)
            .then((data) => {
                if (!cancelled) setCompanyResearchData(data);
            })
            .catch((err) => {
                console.error('Failed to fetch company research data', err);
                if (!cancelled) setCompanyResearchData(null);
            })
            .finally(() => {
                if (!cancelled) setLoadingCompanyResearch(false);
            });
        return () => { cancelled = true; };
    }, [infoWorkspace]);


    // Sidebar API state
    const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
    const [sidebarLoading, setSidebarLoading] = useState(false);
    const [sidebarActivityView, setSidebarActivityView] = useState('Today');

    const [isActionView, setIsActionView] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState<MyWorkspace | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);

    // Track pending rehydration IDs from sessionStorage
    const [pendingWsId, setPendingWsId] = useState<number | null>(() => {
        const stored = sessionStorage.getItem('nxthyre_companies_wsId');
        return stored ? Number(stored) : null;
    });
    const [pendingJobId, setPendingJobId] = useState<number | null>(() => {
        const stored = sessionStorage.getItem('nxthyre_companies_jobId');
        return stored ? Number(stored) : null;
    });

    useEffect(() => {
        if (selectedJob && selectedWorkspace) {
            (window as any).__selectedWorkspaceName = selectedWorkspace.name;
            (window as any).__selectedJobName = selectedJob.title;
        } else if (selectedWorkspace) {
            (window as any).__selectedWorkspaceName = selectedWorkspace.name;
            delete (window as any).__selectedJobName;
        } else {
            delete (window as any).__selectedWorkspaceName;
            delete (window as any).__selectedJobName;
        }
        window.dispatchEvent(new CustomEvent('header-update'));
    }, [selectedWorkspace, selectedJob]);

    // Persist workspace/job IDs to sessionStorage
    useEffect(() => {
        if (selectedWorkspace) {
            sessionStorage.setItem('nxthyre_companies_wsId', String(selectedWorkspace.id));
        } else {
            sessionStorage.removeItem('nxthyre_companies_wsId');
        }
        if (selectedJob) {
            sessionStorage.setItem('nxthyre_companies_jobId', String(selectedJob.id));
        } else {
            sessionStorage.removeItem('nxthyre_companies_jobId');
        }
    }, [selectedWorkspace, selectedJob]);

    useEffect(() => {
        const handleBreadcrumbNavigate = (e: any) => {
            if (e.detail?.level === 'companies') {
                setSelectedWorkspace(null);
                setSelectedJob(null);
            } else if (e.detail?.level === 'workspace') {
                setSelectedJob(null);
            }
        };
        window.addEventListener('breadcrumb-navigate', handleBreadcrumbNavigate);
        return () => window.removeEventListener('breadcrumb-navigate', handleBreadcrumbNavigate);
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<
        "All" | "Active" | "Paused" | "Inactive"
    >("All");
    const [activeJobFilter, setActiveJobFilter] = useState<"All" | "Active" | "Paused" | "Inactive" | "Draft">("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [jobSearchQuery, setJobSearchQuery] = useState("");

    type SortConfig = {
        key: keyof CompanyTableRow;
        direction: 'asc' | 'desc';
    } | null;
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const fetchLogo = async (query: string) => {
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
            setLogos((prev) => ({ ...prev, [query]: logoUrl }));
        } catch (error) {
            setLogos((prev) => ({ ...prev, [query]: null }));
        }
    };

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const data = await organizationService.getMyWorkspacesData();
            setWorkspaces(data.workspaces || []);
            setStatsCount(data.stats_count || null);
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async () => {
        setJobsLoading(true);
        try {
            const data = await jobPostService.getJobs();
            setAllJobs(data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setJobsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchWorkspaces();
            fetchJobs();
            fetchSidebar();
        }
    }, [isAuthenticated]);

    const fetchSidebar = async () => {
        setSidebarLoading(true);
        try {
            const data = await dashboardService.getSidebar();
            setSidebarData(data);
        } catch (error) {
            console.error('Failed to fetch sidebar data', error);
        } finally {
            setSidebarLoading(false);
        }
    };

    // Rehydrate the navigation stack from sessionStorage after data loads
    useEffect(() => {
        if (workspaces.length > 0 && pendingWsId && !selectedWorkspace) {
            const ws = workspaces.find(w => w.id === pendingWsId);
            if (ws) {
                setSelectedWorkspace(ws);
            }
            setPendingWsId(null);
        }
    }, [workspaces, pendingWsId]);

    useEffect(() => {
        if (allJobs.length > 0 && pendingJobId && selectedWorkspace && !selectedJob) {
            const job = allJobs.find(j => j.id === pendingJobId);
            if (job) {
                setSelectedJob(job);
            }
            setPendingJobId(null);
        }
    }, [allJobs, pendingJobId, selectedWorkspace]);

    const buildTableRows = useCallback((): CompanyTableRow[] => {
        if (workspaces.length === 0) return companyTableRows;

        return workspaces.map((ws) => {
            const monthlyShortlistedTrend = ws.increased_decreased_rate_percentages?.shortlisted?.monthly;
            const monthlyHiredTrend = ws.increased_decreased_rate_percentages?.hired?.monthly;

            const rawStatus = ws.workspace_status || "Active";
            const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

            return {
                id: `ws-${ws.id}`,
                workspaceId: ws.id,
                name: ws.name,
                domain: ws.company_research_data?.website || "--",
                totalJobs: ws.jobs_count ?? "--",
                totalCandidates: ws.candidates_in_workspace_count ?? "--",
                shortlisted: ws.shortlisted_candidates_in_workspace_count ?? "--",
                shortlistedTrend: monthlyShortlistedTrend ? `${monthlyShortlistedTrend > 0 ? '+' : ''}${monthlyShortlistedTrend}%` : undefined,
                hired: ws.hired_candidates_in_workspace_count ?? "--",
                hiredTrend: monthlyHiredTrend ? `${monthlyHiredTrend > 0 ? '+' : ''}${monthlyHiredTrend}%` : undefined,
                lastActiveDate: ws.last_active_date
                    ? new Date(ws.last_active_date).toLocaleDateString('en-GB')
                    : "--",
                status: normalizedStatus as any,
                createdBy: ws.created_by || undefined,
            };
        });
    }, [workspaces]);

    const allRows = buildTableRows();

    useEffect(() => {
        const uniqueCompanies = Array.from(new Set(allRows.map((r) => r.name)));
        uniqueCompanies.forEach((company) => {
            if (company && !logoRequestedRef.current.has(company)) {
                fetchLogo(company);
            }
        });
    }, [allRows]);

    const searchedRows = searchQuery.trim()
        ? allRows.filter(
            (r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.domain.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allRows;

    const filteredRows =
        activeFilter === "All"
            ? searchedRows
            : searchedRows.filter((r) => r.status === activeFilter);

    const handleStatusToggle = async (workspaceId: number, currentStatus: string) => {
        if (statusUpdating) return;

        const nextMap: Record<string, string> = {
            "Active": "Paused",
            "Paused": "Inactive",
            "Inactive": "Active"
        };
        const newStatus = nextMap[currentStatus] || "Active";

        setStatusUpdating(workspaceId);
        try {
            await organizationService.updateWorkspace(workspaceId, { status: newStatus });
            setWorkspaces(prev => prev.map(w => w.id === workspaceId ? { ...w, workspace_status: newStatus } : w));
            showToast.success("Workspace status updated");
        } catch (err: any) {
            showToast.error(err.message || "Failed to update status");
        } finally {
            setStatusUpdating(null);
        }
    };

    const filterCounts = {
        All: searchedRows.length,
        Active: searchedRows.filter((r) => r.status === "Active").length,
        Paused: searchedRows.filter((r) => r.status === "Paused").length,
        Inactive: searchedRows.filter((r) => r.status === "Inactive").length,
    };

    const handleSort = (key: keyof CompanyTableRow) => {
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig && sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            if (['totalJobs', 'totalCandidates', 'shortlisted', 'hired'].includes(key)) {
                direction = 'desc'; // Number field default: high to low
            } else if (key === 'lastActiveDate') {
                direction = 'desc'; // Date field default: most recent
            } else {
                direction = 'asc'; // Text field default: alphabetically
            }
        }
        setSortConfig({ key, direction });
    };

    const getSortedRows = (rows: CompanyTableRow[]) => {
        if (!sortConfig) return rows;

        return [...rows].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            let aCom: any = aVal === '--' ? 0 : aVal;
            let bCom: any = bVal === '--' ? 0 : bVal;

            if (sortConfig.key === 'lastActiveDate') {
                const parseDate = (d: any) => {
                    if (!d || d === '--') return 0;
                    const parts = d.split('/');
                    if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
                    return new Date(d).getTime() || 0;
                };
                aCom = parseDate(aVal);
                bCom = parseDate(bVal);
            } else if (['totalJobs', 'totalCandidates', 'shortlisted', 'hired'].includes(sortConfig.key)) {
                aCom = Number(aVal) || 0;
                bCom = Number(bVal) || 0;
            } else {
                aCom = typeof aVal === 'string' ? aVal.toLowerCase() : String(aVal);
                bCom = typeof bVal === 'string' ? bVal.toLowerCase() : String(bVal);
            }

            if (aCom < bCom) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aCom > bCom) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const sortedRows = getSortedRows(filteredRows);

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRows = sortedRows.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));

    const getPageNumbers = (): (number | "...")[] => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (currentPage > 3) pages.push("...");
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const handleWorkspaceClick = (wsId: number) => {
        const ws = workspaces.find(w => w.id === wsId);
        if (ws) {
            setSelectedWorkspace(ws);
            setSelectedJob(null);
            setActiveJobFilter("All");
            setJobSearchQuery("");
        }
    };

    const workspaceJobs = allJobs.filter(j => j.workspace_details?.id === selectedWorkspace?.id);

    const filteredWorkspaceJobs = workspaceJobs.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(jobSearchQuery.toLowerCase());
        let matchesStatus = true;
        if (activeJobFilter === "Active") {
            matchesStatus = j.status === "ACTIVE";
        } else if (activeJobFilter === "Paused") {
            matchesStatus = j.status === "PAUSED";
        } else if (activeJobFilter === "Inactive") {
            matchesStatus = j.status === "INACTIVE";
        } else if (activeJobFilter === "Draft") {
            matchesStatus = j.pyjamahr_status === "DRAFT";
        }
        return matchesSearch && matchesStatus;
    });

    // ── Job Pipeline View ──
    if (selectedJob && selectedWorkspace) {
        return (
            <JobPipeline
                jobId={selectedJob.id}
                workspaceId={selectedWorkspace.id}
                workspaces={workspaces.map(ws => ({ id: ws.id, name: ws.name }))}
                onJobUpdated={() => {
                    jobPostService.getJob(selectedJob.id).then(j => setSelectedJob(j)).catch(() => { });
                    fetchJobs();
                }}
            />
        );
    }

    if (selectedWorkspace) {
        return (
            <JobListing
                selectedWorkspace={selectedWorkspace}
                setSelectedWorkspace={(ws) => {
                    setSelectedWorkspace(ws);
                    setSelectedJob(null);
                }}
                logos={logos}
                workspaceJobs={workspaceJobs}
                activeJobFilter={activeJobFilter}
                setActiveJobFilter={setActiveJobFilter}
                jobSearchQuery={jobSearchQuery}
                setJobSearchQuery={setJobSearchQuery}
                filteredWorkspaceJobs={filteredWorkspaceJobs}
                jobsLoading={jobsLoading}
                setInfoWorkspace={setInfoWorkspace}
                setShowCreateJobRole={setShowCreateJobRole}
                showCreateJobRole={showCreateJobRole}
                workspaces={workspaces}
                fetchJobs={fetchJobs}
                showToast={showToast}
                editingJobId={editingJobId}
                setEditingJobId={setEditingJobId}
                showEditJobRole={showEditJobRole}
                setShowEditJobRole={setShowEditJobRole}
                infoWorkspace={infoWorkspace}
                loadingCompanyResearch={loadingCompanyResearch}
                companyResearchData={companyResearchData}
                setInfoWorkspaceNull={() => setInfoWorkspace(null)}
                onJobSelect={(job) => setSelectedJob(job)}
            />
        );
    }

    const getDynamicStatCards = () => {
        if (!statsCount) return companyStatCards;

        const renderTrend = (val: number | undefined) => {
            if (val === undefined || val === null || val === 0) return undefined;
            return `${val > 0 ? '+' : ''}${val}%`;
        };

        const totalCompanyTrend = statsCount.increased_decreased_rate_percentages?.total_companies?.monthly;
        const activeCompanyTrend = statsCount.increased_decreased_rate_percentages?.active_companies?.monthly;
        const totalOpenJobsTrend = statsCount.increased_decreased_rate_percentages?.total_open_jobs?.monthly;

        return [
            {
                id: 'cs-1',
                label: 'Total Companies',
                value: statsCount.total_companies,
                trend: renderTrend(totalCompanyTrend),
                trendColor: (totalCompanyTrend && totalCompanyTrend >= 0) ? 'green' : 'red',
            },
            {
                id: 'cs-2',
                label: 'Active Companies',
                value: statsCount.active_companies,
                trend: renderTrend(activeCompanyTrend),
                trendColor: (activeCompanyTrend && activeCompanyTrend >= 0) ? 'green' : 'red',
            },
            {
                id: 'cs-3',
                label: 'Total Open Jobs',
                value: statsCount.total_open_jobs,
                trend: renderTrend(totalOpenJobsTrend),
                trendColor: (totalOpenJobsTrend && totalOpenJobsTrend >= 0) ? 'green' : 'red',
            },
            {
                id: 'cs-4',
                label: 'Immediate Actions',
                value: statsCount.immediate_action_jobs,
                subText: `${statsCount.immediate_action_jobs} pending`,
            },
        ] as any;
    };

    const dynamicStatCards = getDynamicStatCards();

    const SortIcon = ({ columnKey }: { columnKey: keyof CompanyTableRow }) => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400 group-hover:text-gray-600 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />
            : <ArrowDown className="w-3 h-3 ml-1 text-[#0F47F2] inline-block" />;
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-4">
                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {dynamicStatCards.map((stat: any) => {
                            const isAction = stat.id === "cs-4";
                            return (
                                <div
                                    key={stat.id}
                                    className={`bg-white rounded-xl flex flex-col ${isAction ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`} // UPDATED: clickable only for Immediate Action card
                                    style={{ padding: "20px", gap: "8px" }}
                                    onClick={isAction ? () => setIsActionView(!isActionView) : undefined}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] font-normal text-[#4B5563] leading-[14px]">
                                            {stat.label}
                                        </p>
                                        {stat.trend && (
                                            <span
                                                className={`flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded ${stat.trendColor === "green"
                                                    ? "text-[#069855] bg-[#DEF7EC]"
                                                    : "text-[#DC2626] bg-[#FEE2E2]"
                                                    }`}
                                            >
                                                {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span
                                            className={`font-medium leading-[40px] ${isAction ? "text-[#DC2626]" : "text-black"
                                                }`}
                                            style={{ fontSize: "32px" }}
                                        >
                                            {stat.value}
                                        </span>

                                        {stat.subText && (
                                            <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FFF7D6] text-[#92400E]">
                                                ⚠️ {stat.subText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Main Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-xl">
                        {/* ─── Left: All Companies Table ─── */}
                        <div className="lg:col-span-4 flex flex-col">

                            <div className="flex items-center justify-between p-4 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {(
                                        ["All", "Active", "Paused", "Inactive"] as const
                                    ).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => {
                                                setActiveFilter(f);
                                                setCurrentPage(1);
                                            }}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeFilter === f
                                                ? "bg-[#0F47F2] text-white"
                                                : "text-[#AEAEB2] bg-white hover:bg-[#F3F5F7]"
                                                }`}
                                            style={
                                                activeFilter !== f ? { border: "1px solid #D1D1D6" } : undefined
                                            }
                                        >
                                            {f}{" "}
                                            <span
                                                className={
                                                    activeFilter === f ? "text-white/80" : "text-[#AEAEB2]"
                                                }
                                            >
                                                ({filterCounts[f as keyof typeof filterCounts]})
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#414141] transition-colors p-2 rounded-lg border border-[#D1D1D6] text-xs" title="Feature Coming Soon" disabled>
                                    <LayoutGrid className="w-4 h-4 " /> Grid View
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between bg-white p-4 border-y-[0.5px] border-[#D1D1D6]">
                                {/* Search */}
                                <div className="relative w-full max-w-[240px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                                    <input
                                        type="text"
                                        placeholder="Search for companies"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full h-9 pl-9 pr-3 rounded-lg text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 transition-shadow"
                                        style={{ border: "1px solid #E5E7EB" }}
                                    />
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">

                                    {/* Export CSV */}
                                    <button
                                        onClick={() => {
                                            organizationService.exportWorkspacesCSV()
                                                .then(() => showToast.success("Export started successfully"))
                                                .catch((err) => showToast.error(err.message || "Failed to export data"));
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#4B5563] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] hover:text-black transition-colors"
                                        title="Export Workspaces CSV"
                                    >
                                        <DownloadCloud className="w-4 h-4 text-[#4B5563]" /> Export CSV
                                    </button>

                                    {/* Date Picker Mock */}
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                                        title="Feature Coming Soon"
                                        disabled
                                    >
                                        <Calendar className="w-4 h-4 text-[#AEAEB2]" /> 24 Feb, 2026
                                    </button>

                                    {/* Add Company Split Button */}
                                    <div className="flex items-center relative">
                                        <button
                                            className="bg-[#0F47F2] text-white px-4 py-2 rounded-l-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 h-9"
                                            onClick={() => { setShowCreateModal(true); }}
                                        >
                                            <Plus className="w-4 h-4" /> Add Company
                                        </button>
                                        <div className="w-[1px] bg-white/20 h-9"></div>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="bg-[#0F47F2] text-white px-2 py-2 rounded-r-lg hover:opacity-90 transition-opacity flex items-center h-9"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50">
                                                <button
                                                    onClick={() => { setShowCreateModal(true); setDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7]"
                                                >
                                                    Create Workspace
                                                </button>
                                                <button
                                                    onClick={() => { setShowJoinModal(true); setDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7]"
                                                >
                                                    Join Workspace
                                                </button>
                                                <button
                                                    onClick={() => { setShowPendingModal(true); setDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7]"
                                                >
                                                    Pending Requests
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <section
                                className=" overflow-hidden"
                            >

                                {/* Table */}
                                <div className="overflow-x-auto overflow-y-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#F9FAFB]">
                                            <tr>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center">Company <SortIcon columnKey="name" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('totalJobs')}
                                                >
                                                    <div className="flex items-center justify-center">Jobs <SortIcon columnKey="totalJobs" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('totalCandidates')}
                                                >
                                                    <div className="flex items-center justify-center">Candidates <SortIcon columnKey="totalCandidates" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('shortlisted')}
                                                >
                                                    <div className="flex items-center justify-center">Shortlisted <SortIcon columnKey="shortlisted" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('hired')}
                                                >
                                                    <div className="flex items-center justify-center">Hired <SortIcon columnKey="hired" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('lastActiveDate')}
                                                >
                                                    <div className="flex items-center justify-center">Last Active Date <SortIcon columnKey="lastActiveDate" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center justify-center">Status <SortIcon columnKey="status" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F3F5F7]">
                                            {loading ? (
                                                // Skeleton rows while loading
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={`skel-${i}`} className="animate-pulse">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                                                <div className="h-4 bg-gray-200 rounded w-32" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-6 py-12 text-center text-sm text-[#AEAEB2]"
                                                    >
                                                        No companies found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map((row) => {
                                                    const sty = statusStyles[row.status] || statusStyles.Active;
                                                    const companyLogo = logos[row.name];
                                                    return (
                                                        <tr
                                                            key={row.id}
                                                            onClick={() => handleWorkspaceClick(row.workspaceId)}
                                                            className="hover:bg-[#FAFBFC] transition-colors cursor-pointer group"
                                                        >
                                                            {/* Company Title */}
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
                                                                        {companyLogo ? (
                                                                            <img
                                                                                src={companyLogo}
                                                                                alt={row.name}
                                                                                className="w-full h-full object-contain"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-[11px] font-semibold text-[#8E8E93]">
                                                                                {row.name.charAt(0).toUpperCase()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <p className="text-sm font-normal text-[#0F47F2] hover:underline hover:text-blue-700 transition-colors truncate max-w-[200px]">
                                                                            {row.name}
                                                                        </p>
                                                                        {row.createdBy && (
                                                                            <p className="text-[11px] text-[#AEAEB2] font-normal truncate max-w-[200px]">
                                                                                Created by: {row.createdBy}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Jobs */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.totalJobs}
                                                                </p>
                                                            </td>

                                                            {/* Candidates */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.totalCandidates}
                                                                </p>
                                                            </td>

                                                            {/* Shortlisted */}
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <span className="text-sm text-[#4B5563]">{row.shortlisted}</span>
                                                                    {row.shortlistedTrend && (
                                                                        <span className="text-[10px] font-medium text-[#069855] bg-[#DEF7EC] px-1 py-0.5 rounded">
                                                                            {row.shortlistedTrend}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Hired */}
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <span className="text-sm text-[#4B5563]">{row.hired}</span>
                                                                    {row.hiredTrend && (
                                                                        <span className="text-[10px] font-medium text-[#069855] bg-[#DEF7EC] px-1 py-0.5 rounded">
                                                                            {row.hiredTrend}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Last Active Date */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.lastActiveDate}
                                                                </p>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-6 py-4 text-center">
                                                                <span
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusToggle(row.workspaceId, row.status); }}
                                                                    className={`px-3 py-1 rounded-full text-[12px] font-medium ${sty.bg} ${sty.text} cursor-pointer hover:opacity-80 transition-opacity ${statusUpdating === row.workspaceId ? 'opacity-50 pointer-events-none' : ''}`}
                                                                >
                                                                    {statusUpdating === row.workspaceId ? '...' : row.status}
                                                                </span>
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-6 py-4 text-center">
                                                                <div
                                                                    className="flex items-center justify-center gap-3"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <button
                                                                        onClick={() => {
                                                                            const match = workspaces.find(w => w.id === row.workspaceId);
                                                                            if (match) setInfoWorkspace(match);
                                                                        }}
                                                                        className="p-1.5 text-[#0F47F2] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleStatusToggle(row.workspaceId, row.status); }}
                                                                        disabled={statusUpdating === row.workspaceId}
                                                                        title={`Toggle status (Current: ${row.status})`}
                                                                        className={`p-1.5 transition-colors rounded-full hover:bg-gray-100 ${statusUpdating === row.workspaceId ? 'opacity-50 pointer-events-none' : ''}`}
                                                                    >
                                                                        {row.status === 'Active' ? <PlayIcon /> : row.status === 'Paused' ? <PauseIcon /> : <StopIcon />}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Footer / Pagination */}
                                <div
                                    className="px-5 py-3 flex items-center justify-between border-t"
                                    style={{ borderColor: "#F3F5F7" }}
                                >
                                    <div className="text-[13px] text-[#AEAEB2]">
                                        Showing {paginatedRows.length > 0 ? startIndex + 1 : 0}-
                                        {Math.min(startIndex + itemsPerPage, filteredRows.length)} of {filteredRows.length} companies
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#AEAEB2] hover:bg-gray-50 border border-transparent disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            {getPageNumbers().map((p, i) =>
                                                p === "..." ? (
                                                    <span key={`e-${i}`} className="text-[#AEAEB2] text-xs px-1">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p as number)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${currentPage === p
                                                            ? "bg-[#0F47F2] text-white"
                                                            : "text-[#AEAEB2] hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#AEAEB2] hover:bg-gray-50 border border-transparent disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
                {!isActionView && (
                    <aside className="w-96 flex flex-col gap-4 shrink-0">
                        {/* Immediate Actions */}
                        <div className="bg-white rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-black">
                                    Immediate Actions
                                    {sidebarData && (
                                        <span className="ml-1.5 text-xs font-normal text-[#AEAEB2]">
                                            ({sidebarData.right_sidebar.immediate_actions.total_pending})
                                        </span>
                                    )}
                                </h3>
                                <button
                                    className="text-xs font-medium text-[#4B5563] border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsActionView(true)}
                                >
                                    Hide Activities
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {sidebarLoading ? (
                                    // Skeleton loading for immediate actions
                                    [...Array(3)].map((_, i) => (
                                        <div key={`ia-skel-${i}`} className="p-4 bg-[#F9FAFB] rounded-lg animate-pulse" style={{ border: "0.5px solid #E5E7EB" }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="w-24 h-4 rounded bg-gray-200" />
                                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                                            </div>
                                            <div className="w-full h-3 rounded bg-gray-200 mb-2" />
                                            <div className="w-3/4 h-3 rounded bg-gray-200 mb-4" />
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-6 rounded bg-gray-200" />
                                                <div className="w-14 h-3 rounded bg-gray-200" />
                                            </div>
                                        </div>
                                    ))
                                ) : sidebarData ? (
                                    sidebarData.right_sidebar.immediate_actions.items.map((action: SidebarImmediateAction) => (
                                        <div key={action.id} className="p-4 bg-[#F9FAFB] rounded-lg" style={{ border: "0.5px solid #E5E7EB" }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {action.company_logo_url ? (
                                                        <img src={action.company_logo_url} alt={action.company_name} className="w-5 h-5 rounded-full object-contain" />
                                                    ) : null}
                                                    <p className="text-sm font-semibold text-[#0F47F2]">{action.company_name}</p>
                                                </div>
                                                {action.has_star && (
                                                    <div className="w-6 h-6 rounded-full bg-[#0F47F2] flex items-center justify-center shadow-sm">
                                                        <Star className="w-3 h-3 text-white fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[13px] text-[#4B5563] mb-4 leading-relaxed">
                                                {action.issue_summary}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-colors ${
                                                        action.priority_level === 'high'
                                                            ? 'bg-[#E7EDFF] text-[#0F47F2] hover:bg-[#D7E3FF]'
                                                            : 'bg-[#FFF7D6] text-[#D97706] hover:bg-[#FDE68A]'
                                                    }`}
                                                >
                                                    {action.action_button_label}
                                                </button>
                                                <span className="text-xs text-[#AEAEB2] font-medium">
                                                    {action.timestamp_relative}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-[#AEAEB2] ml-auto" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-[#AEAEB2] text-center py-4">No immediate actions</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div
                            className="bg-white rounded-xl p-5"
                            style={{ border: "0.5px solid #D1D1D6" }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-black">Recent Activities</h3>
                                {sidebarData ? (
                                    <div className="flex items-center gap-1">
                                        {sidebarData.right_sidebar.recent_activities.view_options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setSidebarActivityView(opt)}
                                                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                                                    sidebarActivityView === opt
                                                        ? 'text-[#0F47F2] bg-[#E7EDFF]'
                                                        : 'text-[#4B5563] border border-[#E5E7EB] bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <button className="text-xs font-medium text-[#4B5563] border border-[#E5E7EB] bg-white px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                                        Today
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                {sidebarLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={`ra-skel-${i}`} className="flex items-start justify-between pb-3 border-b border-[#F3F5F7] animate-pulse">
                                            <div>
                                                <div className="w-28 h-4 rounded bg-gray-200 mb-1" />
                                                <div className="w-40 h-3 rounded bg-gray-200 mb-1" />
                                                <div className="w-32 h-2 rounded bg-gray-200" />
                                            </div>
                                            <div className="w-14 h-3 rounded bg-gray-200 mt-1" />
                                        </div>
                                    ))
                                ) : sidebarData ? (
                                    sidebarData.right_sidebar.recent_activities.groups
                                        .filter((group: SidebarActivityGroup) => {
                                            if (sidebarActivityView === 'All') return true;
                                            if (sidebarActivityView === 'Today') return group.date_label === 'Today';
                                            if (sidebarActivityView === 'This Week') return true;
                                            return true;
                                        })
                                        .map((group: SidebarActivityGroup, gIdx: number) => (
                                            <div key={`group-${gIdx}`}>
                                                <div className="mb-3">
                                                    <h4 className="text-xs font-semibold text-[#4B5563]">
                                                        {group.date_label}
                                                        {group.date_sub_label && <span className="font-normal"> · {group.date_sub_label}</span>}
                                                    </h4>
                                                </div>
                                                {group.items.map((item) => (
                                                    <div key={item.id} className="flex items-start justify-between pb-3 border-b border-[#F3F5F7] mb-2">
                                                        <div className="flex items-start gap-2">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                                                item.color === 'green' ? 'bg-[#DEF7EC]' : 'bg-[#E7EDFF]'
                                                            }`}>
                                                                {item.activity_type === 'hire' ? (
                                                                    <UserCheck className="w-3 h-3 text-[#069855]" />
                                                                ) : (
                                                                    <PlusCircle className="w-3 h-3 text-[#0F47F2]" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[#0F47F2] mb-0.5">{item.company_name}</p>
                                                                <p className="text-[13px] text-[#4B5563]">{item.message}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-[#AEAEB2] font-medium mt-1 shrink-0 ml-2">{item.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-sm text-[#AEAEB2] text-center py-4">No recent activities</p>
                                )}
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Modals */}
            <CreateWorkspaceModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => fetchWorkspaces()}
            />
            <JoinWorkspaceModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
            />
            <PendingRequestsModal
                isOpen={showPendingModal}
                onClose={() => setShowPendingModal(false)}
            />

            <CompanyInfoDrawer
                isOpen={!!infoWorkspace}
                loading={loadingCompanyResearch}
                data={companyResearchData}
                onClose={() => setInfoWorkspace(null)}
                onCreateJob={() => { }}
            />
        </div>
    );
}
