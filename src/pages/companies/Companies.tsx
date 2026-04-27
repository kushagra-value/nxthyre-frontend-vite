import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
    organizationService,
    MyWorkspace,
    CompanyResearchData,
    WorkspaceStatsCount
} from "../../services/organizationService";
import { jobPostService, Job, JobsApiResponse } from "../../services/jobPostService";
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
    MoreHorizontal,
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

const TotalCompaniesIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" strokeOpacity="0.2" strokeWidth="0.5" />
        <path d="M28.6667 28.6665H12" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M27.8336 28.6667V15.3333C27.8336 13.762 27.8336 12.9763 27.3455 12.4882C26.8573 12 26.0717 12 24.5002 12H22.8336C21.2622 12 20.4766 12 19.9884 12.4882C19.5955 12.8811 19.5188 13.4669 19.5039 14.5" stroke="#0F47F2" />
        <path d="M22.8335 28.6667V17.8333C22.8335 16.262 22.8335 15.4763 22.3453 14.9882C21.8572 14.5 21.0715 14.5 19.5002 14.5H16.1668C14.5955 14.5 13.8098 14.5 13.3217 14.9882C12.8335 15.4763 12.8335 16.262 12.8335 17.8333V28.6667" stroke="#0F47F2" />
        <path d="M17.8335 28.6665V26.1665" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 17H20.3335" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 19.5H20.3335" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 22H20.3335" stroke="#0F47F2" strokeLinecap="round" />
    </svg>
);

const ActiveCompaniesIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" strokeOpacity="0.2" strokeWidth="0.5" />
        <path d="M28.6667 28.6665H12" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M27.8336 28.6667V15.3333C27.8336 13.762 27.8336 12.9763 27.3455 12.4882C26.8573 12 26.0717 12 24.5002 12H22.8336C21.2622 12 20.4766 12 19.9884 12.4882C19.5955 12.8811 19.5188 13.4669 19.5039 14.5" stroke="#0F47F2" />
        <path d="M22.8335 28.6667V17.8333C22.8335 16.262 22.8335 15.4763 22.3453 14.9882C21.8572 14.5 21.0715 14.5 19.5002 14.5H16.1668C14.5955 14.5 13.8098 14.5 13.3217 14.9882C12.8335 15.4763 12.8335 16.262 12.8335 17.8333V28.6667" stroke="#0F47F2" />
        <path d="M17.8335 28.6665V26.1665" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 17H20.3335" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 19.5H20.3335" stroke="#0F47F2" strokeLinecap="round" />
        <path d="M15.3335 22H20.3335" stroke="#0F47F2" strokeLinecap="round" />
        <circle cx="28" cy="12" r="2.75" fill="#14AE5C" stroke="white" strokeWidth="0.5" />
    </svg>
);

const TotalOpenJobsIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" strokeOpacity="0.2" strokeWidth="0.5" />
        <path d="M20 22.5L20 23.75" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 19.167L12.6274 21.553C12.7643 24.5645 12.8327 26.0702 13.799 26.9936C14.7654 27.917 16.2726 27.917 19.2872 27.917H20.7128C23.7274 27.917 25.2346 27.917 26.201 26.9936C27.1673 26.0702 27.2357 24.5645 27.3726 21.553L27.5 19.167" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.3726 18.7025C13.7887 21.3954 16.9826 22.5 19.9999 22.5C23.0173 22.5 26.2112 21.3954 27.6273 18.7025C28.3032 17.4171 27.7914 15 26.1266 15H13.8733C12.2084 15 11.6966 17.4171 12.3726 18.7025Z" stroke="#0F47F2" />
        <path d="M23.3332 15.0002L23.2596 14.7426C22.8929 13.4592 22.7096 12.8176 22.2731 12.4505C21.8366 12.0835 21.2568 12.0835 20.0973 12.0835H19.9024C18.7428 12.0835 18.1631 12.0835 17.7266 12.4505C17.2901 12.8176 17.1068 13.4592 16.7401 14.7426L16.6665 15.0002" stroke="#0F47F2" />
    </svg>
);

const ImmediateActionsIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" strokeOpacity="0.2" strokeWidth="0.5" />
        <path d="M18.8923 28.1051L11.8952 21.108C11.2732 20.486 11.2732 19.5142 11.8952 18.8923L18.8923 11.8952C19.5142 11.2732 20.486 11.2732 21.108 11.8952L28.1051 18.8923C28.7271 19.5142 28.7271 20.486 28.1051 21.108L21.108 28.1051C20.486 28.7271 19.4754 28.7271 18.8923 28.1051Z" fill="#FFCC00" />
        <path d="M19.0479 23.4016C19.0479 23.285 19.0867 23.1683 19.1256 23.0517C19.1645 22.9351 19.2422 22.8574 19.32 22.7796C19.3977 22.7019 19.5143 22.6241 19.6309 22.5852C19.7476 22.5464 19.8642 22.5075 20.0197 22.5075C20.1752 22.5075 20.2918 22.5464 20.4084 22.5852C20.525 22.6241 20.6416 22.7019 20.7194 22.7796C20.7971 22.8574 20.8749 22.9351 20.9137 23.0517C20.9526 23.1683 20.9915 23.285 20.9915 23.4016C20.9915 23.5182 20.9526 23.6348 20.9137 23.7514C20.8749 23.868 20.7971 23.9458 20.7194 24.0235C20.6416 24.1013 20.525 24.179 20.4084 24.2179C20.2918 24.2568 20.1752 24.2956 20.0197 24.2956C19.8642 24.2956 19.7476 24.2568 19.6309 24.2179C19.5143 24.179 19.4366 24.1013 19.32 24.0235C19.2422 23.9458 19.1645 23.868 19.1256 23.7514C19.0867 23.6348 19.0479 23.5571 19.0479 23.4016ZM20.6805 21.6134H19.2811L19.0867 15.7437H20.8749L20.6805 21.6134Z" fill="white" />
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

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

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
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);


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
    const [jobsStatsCount, setJobsStatsCount] = useState<JobsApiResponse["stats_count"] | null>(null);
    const [jobStatusCounts, setJobStatusCounts] = useState<JobsApiResponse["status_counts"] | null>(null);
    const [jobPagination, setJobPagination] = useState<JobsApiResponse["pagination"] | null>(null);
    const [jobCurrentPage, setJobCurrentPage] = useState(1);
    const [jobPageSize] = useState(10);
    const [createdAfter, setCreatedAfter] = useState<string | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<string | undefined>(undefined);
    const [jobDateFilterLabel, setJobDateFilterLabel] = useState("Date Filter");
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobOrdering, setJobOrdering] = useState<string>("");
    const [debouncedJobSearch, setDebouncedJobSearch] = useState("");

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
            if (isMounted.current) {
                setLogos((prev) => ({ ...prev, [query]: logoUrl }));
            }
        } catch (error) {
            if (isMounted.current) {
                setLogos((prev) => ({ ...prev, [query]: null }));
            }
        }
    };

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const data = await organizationService.getMyWorkspacesData();
            if (isMounted.current) {
                setWorkspaces(data.workspaces || []);
                setStatsCount(data.stats_count || null);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        try {
            const response = await jobPostService.getPaginatedRoles({
                page: jobCurrentPage,
                page_size: jobPageSize,
                workspace_id: selectedWorkspace?.id,
                created_after: createdAfter,
                created_before: createdBefore,
                status: activeJobFilter === "All" ? undefined : activeJobFilter.toUpperCase(),
                search: debouncedJobSearch || undefined,
                ordering: jobOrdering || undefined,
            });
            if (isMounted.current) {
                setAllJobs(response.jobs || []);
                setJobsStatsCount(response.stats_count || null);
                setJobStatusCounts(response.status_counts || null);
                setJobPagination(response.pagination || null);
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            if (isMounted.current) setJobsLoading(false);
        }
    }, [jobCurrentPage, jobPageSize, selectedWorkspace?.id, createdAfter, createdBefore, activeJobFilter, debouncedJobSearch, jobOrdering]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWorkspaces();
            fetchSidebar();
        }
    }, [isAuthenticated]);

    // Debounce search input — waits 300ms after user stops typing before triggering API call
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedJobSearch(jobSearchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [jobSearchQuery]);

    // Reset to page 1 when filters/search/sort change (but not when page itself changes)
    useEffect(() => {
        setJobCurrentPage(1);
    }, [activeJobFilter, debouncedJobSearch, jobOrdering]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Fetch workspace-scoped jobs only after a workspace is selected.
        if (!selectedWorkspace?.id) {
            setAllJobs([]);
            setJobsStatsCount(null);
            setJobStatusCounts(null);
            setJobPagination(null);
            return;
        }

        fetchJobs();
    }, [isAuthenticated, fetchJobs]);

    const fetchSidebar = async () => {
        setSidebarLoading(true);
        try {
            const data = await dashboardService.getSidebar();
            if (isMounted.current) setSidebarData(data);
        } catch (error) {
            console.error('Failed to fetch sidebar data', error);
        } finally {
            if (isMounted.current) setSidebarLoading(false);
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
        if (!pendingJobId || !selectedWorkspace || selectedJob) return;
        const job = allJobs.find(j => j.id === pendingJobId);
        if (job) {
            setSelectedJob(job);
            setPendingJobId(null);
            return;
        }
        jobPostService.getJob(pendingJobId)
            .then((fetchedJob) => {
                if (fetchedJob.workspace_details?.id === selectedWorkspace.id && isMounted.current) {
                    setSelectedJob(fetchedJob);
                }
            })
            .catch(() => { })
            .finally(() => {
                if (isMounted.current) setPendingJobId(null);
            });
    }, [allJobs, pendingJobId, selectedWorkspace, selectedJob]);

    const allRows = useMemo((): CompanyTableRow[] => {
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
                activeJobs: ws.active_jobs_count || "--",
                createdDate: ws.created_at || "--",
            };
        });
    }, [workspaces]);


    useEffect(() => {
        const uniqueCompanies = Array.from(new Set(allRows.map((r) => r.name)));
        uniqueCompanies.forEach((company) => {
            if (company && !logoRequestedRef.current.has(company)) {
                fetchLogo(company);
            }
        });
    }, [allRows]);

    const searchedRows = useMemo(() => searchQuery.trim()
        ? allRows.filter(
            (r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.domain.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allRows, [allRows, searchQuery]);

    const filteredRows = useMemo(() =>
        activeFilter === "All"
            ? searchedRows
            : searchedRows.filter((r) => r.status === activeFilter),
        [searchedRows, activeFilter]);

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
            if (isMounted.current) {
                setWorkspaces(prev => prev.map(w => w.id === workspaceId ? { ...w, workspace_status: newStatus } : w));
                showToast.success("Workspace status updated");
            }
        } catch (err: any) {
            if (isMounted.current) {
                showToast.error(err.message || "Failed to update status");
            }
        } finally {
            if (isMounted.current) {
                setStatusUpdating(null);
            }
        }
    };

    const filterCounts = useMemo(() => ({
        All: searchedRows.length,
        Active: searchedRows.filter((r) => r.status === "Active").length,
        Paused: searchedRows.filter((r) => r.status === "Paused").length,
        Inactive: searchedRows.filter((r) => r.status === "Inactive").length,
    }), [searchedRows]);

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

    const sortedRows = useMemo(() => getSortedRows(filteredRows), [filteredRows, sortConfig]);

    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));

    // Clamp currentPage to valid range when data changes (e.g. filter reduces results)
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRows = sortedRows.slice(startIndex, startIndex + itemsPerPage);

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
            setJobCurrentPage(1);
        }
    };

    const workspaceJobs = useMemo(() => allJobs, [allJobs]);

    // Filtering and sorting are now handled server-side via query params.
    // The jobs returned from the API are already filtered and sorted.
    const filteredWorkspaceJobs = workspaceJobs;

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
                jobsStatsCount={jobsStatsCount}
                jobStatusCounts={jobStatusCounts}
                jobPagination={jobPagination}
                jobCurrentPage={jobCurrentPage}
                setJobCurrentPage={setJobCurrentPage}
                jobDateFilterLabel={jobDateFilterLabel}
                isJobDateFilterApplied={!!createdAfter || !!createdBefore}
                onJobDateFilterApply={(payload) => {
                    setCreatedAfter(payload.createdAfter);
                    setCreatedBefore(payload.createdBefore);
                    setJobDateFilterLabel(payload.label);
                    setJobCurrentPage(1);
                }}
                onClearJobDateFilter={() => {
                    setCreatedAfter(undefined);
                    setCreatedBefore(undefined);
                    setJobDateFilterLabel("Date Filter");
                    setJobCurrentPage(1);
                }}
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
                currentOrdering={jobOrdering}
                onSortChange={(ordering) => { setJobOrdering(ordering); }}
            />
        );
    }


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
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_263_2492)">
                                            <path d="M6.00016 14.6668H10.0002C13.3335 14.6668 14.6668 13.3335 14.6668 10.0002V6.00016C14.6668 2.66683 13.3335 1.3335 10.0002 1.3335H6.00016C2.66683 1.3335 1.3335 2.66683 1.3335 6.00016V10.0002C1.3335 13.3335 2.66683 14.6668 6.00016 14.6668Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8 1.3335V14.6668" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M1.3335 6.3335H8.00016" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8 9.66699H14.6667" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_263_2492">
                                                <rect width="16" height="16" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    Grid View
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



                                    {/* Date Picker Mock */}
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                                        title="Feature Coming Soon"
                                        disabled
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M6.66667 11.3337L6.66666 8.89847C6.66666 8.77063 6.5755 8.66699 6.46305 8.66699H6M9.08644 11.3337L9.98945 8.89977C10.0317 8.78596 9.94189 8.66699 9.81379 8.66699H8.66667" stroke="#374151" stroke-linecap="round" />
                                            <path d="M1.6665 8.16216C1.6665 5.25729 1.6665 3.80486 2.50125 2.90243C3.336 2 4.6795 2 7.3665 2H8.63317C11.3202 2 12.6637 2 13.4984 2.90243C14.3332 3.80486 14.3332 5.25729 14.3332 8.16216V8.5045C14.3332 11.4094 14.3332 12.8618 13.4984 13.7642C12.6637 14.6667 11.3202 14.6667 8.63317 14.6667H7.3665C4.6795 14.6667 3.336 14.6667 2.50125 13.7642C1.6665 12.8618 1.6665 11.4094 1.6665 8.5045V8.16216Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M4 5.3335H12" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                        24 Feb, 2026
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
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('totalJobs')}
                                                >
                                                    <div className="flex items-center justify-center">Total Jobs <SortIcon columnKey="totalJobs" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('activeJobs' as any)}
                                                >
                                                    <div className="flex items-center justify-center">Active Jobs <SortIcon columnKey={'activeJobs' as any} /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('createdDate' as any)}
                                                >
                                                    <div className="flex items-center justify-center">Created Date <SortIcon columnKey={'createdDate' as any} /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('totalCandidates')}
                                                >
                                                    <div className="flex items-center justify-center">Candidates <SortIcon columnKey="totalCandidates" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('shortlisted')}
                                                >
                                                    <div className="flex items-center justify-center">Shortlisted <SortIcon columnKey="shortlisted" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('hired')}
                                                >
                                                    <div className="flex items-center justify-center">Hired <SortIcon columnKey="hired" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('lastActiveDate')}
                                                >
                                                    <div className="flex items-center justify-center">Last Active Date <SortIcon columnKey="lastActiveDate" /></div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] cursor-pointer group hover:text-[#4B5563] transition-colors text-center"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center justify-center">Status <SortIcon columnKey="status" /></div>
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
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
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto" />
                                                        </td>

                                                    </tr>
                                                ))
                                            ) : paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={10}

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
                                                                                {row.createdBy}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                </div>
                                                            </td>

                                                            {/* Total Jobs */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.totalJobs}
                                                                </p>
                                                            </td>

                                                            {/* Active Jobs */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.activeJobs}
                                                                </p>
                                                            </td>

                                                            {/* Created Date */}
                                                            <td className="px-6 py-4 text-center">
                                                                <p className="text-sm text-[#4B5563]">
                                                                    {row.createdDate}
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
                                                            <td className="px-6 py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        if (menuOpenId === row.id) { setMenuOpenId(null); return; }
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        const mW = 160, mH = 240, gap = 8;
                                                                        const openUp = rect.bottom + mH + gap > window.innerHeight;
                                                                        const preferredTop = openUp ? rect.top - mH - gap : rect.bottom + gap;
                                                                        const top = Math.min(Math.max(8, preferredTop), Math.max(8, window.innerHeight - mH - 8));
                                                                        let left = rect.right - mW;
                                                                        if (left < 8) left = 8;
                                                                        if (left + mW > window.innerWidth - 8) left = window.innerWidth - mW - 8;
                                                                        setMenuPos({ top, left });
                                                                        setMenuOpenId(row.id);
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                                                >
                                                                    <MoreHorizontal className="w-4 h-4 text-[#AEAEB2]" />
                                                                </button>
                                                                {menuOpenId === row.id && (
                                                                    <div
                                                                        ref={menuRef}
                                                                        className="fixed w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[10000] py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                                                                        style={{ top: menuPos.top, left: menuPos.left }}
                                                                    >
                                                                        <button onClick={() => { setMenuOpenId(null); const match = workspaces.find(w => w.id === row.workspaceId); if (match) setInfoWorkspace(match); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> View Details</button>
                                                                        <button onClick={() => { setMenuOpenId(null); showToast.success("Edit coming soon"); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Edit</button>
                                                                        <button onClick={() => { setMenuOpenId(null); showToast.success("Delete coming soon"); }} className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-2"> Delete</button>
                                                                        <div className="h-[1px] bg-gray-100 my-1"></div>
                                                                        <button onClick={() => { setMenuOpenId(null); handleStatusToggle(row.workspaceId, "Active"); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Set Active</button>
                                                                        <button onClick={() => { setMenuOpenId(null); handleStatusToggle(row.workspaceId, "Paused"); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Set Pause</button>
                                                                        <button onClick={() => { setMenuOpenId(null); handleStatusToggle(row.workspaceId, "Inactive"); }} className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"> Set Inactive</button>
                                                                    </div>
                                                                                                )}
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
