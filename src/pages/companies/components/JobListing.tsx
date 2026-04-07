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
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
    const [menuOpenJobId, setMenuOpenJobId] = useState<number | null>(null);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0, bottom: 0, isBottom: false });

    // Inline Notes state
    const [inlineEditJobId, setInlineEditJobId] = useState<number | null>(null);
    const [inlineNoteContent, setInlineNoteContent] = useState<string>("");
    const [fetchedNotes, setFetchedNotes] = useState<Record<number, any[]>>({});
    const menuRef = useRef<HTMLDivElement>(null);
    const [statusMenuOpenId, setStatusMenuOpenId] = useState<number | null>(null);
    const statusMenuRef = useRef<HTMLDivElement>(null);
    const [statusMenuPos, setStatusMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [stageTooltip, setStageTooltip] = useState<{
        visible: boolean;
        name: string;
        active: number;
        archived: number;
        top: number;
        left: number;
    }>({ visible: false, name: "", active: 0, archived: 0, top: 0, left: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenJobId(null);
            }
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
                setStatusMenuOpenId(null);
            }
        };
        const handleScroll = () => {
            setMenuOpenJobId(null);
            setStatusMenuOpenId(null);
            setStageTooltip((prev) => ({ ...prev, visible: false }));
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
        if (salary == null || salary < 0) return '0';
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
    const workspaceRating = selectedWorkspace.company_research_data?.overall_rating ?? companyResearchData?.overall_rating ?? null;
    const hasRatingData = workspaceRating !== null && workspaceRating !== undefined;

    useEffect(() => {
        // Fetch notes for currently viewed jobs
        paginatedJobs.forEach(job => {
            if (!fetchedNotes[job.id]) {
                jobPostService.getJobNotes(job.id).then(notes => {
                    setFetchedNotes(prev => ({ ...prev, [job.id]: notes || [] }));
                }).catch(() => { });
            }
        });
    }, [paginatedJobs]);

    const handleSaveInlineNote = async (jobId: number) => {
        if (!inlineNoteContent.trim()) return;
        try {
            const existingNotes = fetchedNotes[jobId] || [];
            if (existingNotes.length > 0) {
                // Update the most recent note
                const latestNote = existingNotes[0];
                const updated = await jobPostService.updateJobNote(jobId, latestNote.id, inlineNoteContent);
                setFetchedNotes(prev => ({
                    ...prev,
                    [jobId]: [updated, ...existingNotes.slice(1)]
                }));
            } else {
                // Add new note
                const newNote = await jobPostService.addJobNote(jobId, inlineNoteContent);
                setFetchedNotes(prev => ({
                    ...prev,
                    [jobId]: [newNote]
                }));
            }
            setInlineEditJobId(null);
            toastUtil.success("Note saved successfully");
        } catch (error) {
            toastUtil.error("Failed to save note");
        }
    };

    const showStageTooltip = (
        event: React.MouseEvent<HTMLDivElement>,
        name: string,
        active: number,
        archived: number
    ) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const tooltipWidth = 210;
        const tooltipHeight = 56;
        const horizontalPadding = 10;
        const top = rect.top - tooltipHeight - 10;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (left < horizontalPadding) left = horizontalPadding;
        if (left + tooltipWidth > window.innerWidth - horizontalPadding) {
            left = window.innerWidth - tooltipWidth - horizontalPadding;
        }
        setStageTooltip({
            visible: true,
            name,
            active,
            archived,
            top: Math.max(8, top),
            left,
        });
    };

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
                            <span className="flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_1077_16092)">
                                    <path d="M14.6663 8.00016C14.6663 8.87563 14.4939 9.74256 14.1589 10.5514C13.8238 11.3602 13.3328 12.0952 12.7137 12.7142C12.0947 13.3333 11.3597 13.8243 10.5509 14.1594C9.74207 14.4944 8.87514 14.6668 7.99967 14.6668C7.12421 14.6668 6.25729 14.4944 5.44845 14.1594C4.63961 13.8243 3.90469 13.3333 3.28563 12.7142C2.66657 12.0952 2.17551 11.3602 1.84047 10.5514C1.50545 9.74256 1.33301 8.87563 1.33301 8.00016C1.33301 7.1247 1.50545 6.25778 1.84048 5.44894C2.17551 4.6401 2.66657 3.90518 3.28563 3.28612C3.90469 2.66706 4.63961 2.176 5.44845 1.84096C6.25729 1.50594 7.12421 1.3335 7.99967 1.3335C8.87514 1.3335 9.74207 1.50594 10.5509 1.84097C11.3597 2.176 12.0947 2.66706 12.7137 3.28612C13.3328 3.90518 13.8238 4.6401 14.1589 5.44894C14.4939 6.25778 14.6663 7.1247 14.6663 8.00016Z" stroke="#8E8E93" />
                                    <path d="M10.6663 8.00016C10.6663 8.87563 10.5973 9.74256 10.4633 10.5514C10.3293 11.3602 10.1329 12.0952 9.88527 12.7142C9.63767 13.3333 9.34367 13.8243 9.02014 14.1594C8.69661 14.4944 8.34987 14.6668 7.99967 14.6668C7.64947 14.6668 7.30274 14.4944 6.97921 14.1594C6.65565 13.8243 6.36168 13.3333 6.11405 12.7142C5.86643 12.0952 5.67001 11.3602 5.53599 10.5514C5.40198 9.74256 5.33301 8.87563 5.33301 8.00016C5.33301 7.1247 5.40198 6.25778 5.53599 5.44894C5.67001 4.6401 5.86643 3.90518 6.11405 3.28612C6.36168 2.66706 6.65565 2.176 6.97921 1.84096C7.30274 1.50594 7.64947 1.3335 7.99967 1.3335C8.34987 1.3335 8.69661 1.50594 9.02014 1.84097C9.34367 2.176 9.63767 2.66706 9.88527 3.28612C10.1329 3.90518 10.3293 4.6401 10.4633 5.44894C10.5973 6.25778 10.6663 7.1247 10.6663 8.00016Z" stroke="#8E8E93" />
                                    <path d="M1.33301 8H14.6663" stroke="#8E8E93" stroke-linecap="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1077_16092">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                                {selectedWorkspace.company_research_data?.website || "--"}</span>
                            <span className="flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.66699 6.76236C2.66699 3.76408 5.05481 1.3335 8.00033 1.3335C10.9459 1.3335 13.3337 3.76408 13.3337 6.76236C13.3337 9.73716 11.6315 13.2084 8.97559 14.4498C8.35653 14.7392 7.64413 14.7392 7.02506 14.4498C4.36921 13.2084 2.66699 9.73716 2.66699 6.76236Z" stroke="#8E8E93" />
                                <path d="M8 8.6665C9.10457 8.6665 10 7.77107 10 6.6665C10 5.56193 9.10457 4.6665 8 4.6665C6.89543 4.6665 6 5.56193 6 6.6665C6 7.77107 6.89543 8.6665 8 8.6665Z" stroke="#8E8E93" />
                            </svg>
                                {selectedWorkspace.company_research_data?.headquarters || "--"}</span>
                            <span className="flex items-center gap-1.5"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.33301 7.99984C1.33301 5.48568 1.33301 4.2286 2.11405 3.44755C2.89511 2.6665 4.15218 2.6665 6.66634 2.6665H9.33301C11.8471 2.6665 13.1043 2.6665 13.8853 3.44755C14.6663 4.2286 14.6663 5.48568 14.6663 7.99984V9.33317C14.6663 11.8473 14.6663 13.1044 13.8853 13.8854C13.1043 14.6665 11.8471 14.6665 9.33301 14.6665H6.66634C4.15218 14.6665 2.89511 14.6665 2.11405 13.8854C1.33301 13.1044 1.33301 11.8473 1.33301 9.33317V7.99984Z" stroke="#8E8E93" />
                                <path d="M4.66699 2.6665V1.6665" stroke="#8E8E93" stroke-linecap="round" />
                                <path d="M11.333 2.6665V1.6665" stroke="#8E8E93" stroke-linecap="round" />
                                <path d="M1.66699 6H14.3337" stroke="#8E8E93" stroke-linecap="round" />
                                <path d="M12.0003 11.3332C12.0003 11.7014 11.7019 11.9998 11.3337 11.9998C10.9655 11.9998 10.667 11.7014 10.667 11.3332C10.667 10.965 10.9655 10.6665 11.3337 10.6665C11.7019 10.6665 12.0003 10.965 12.0003 11.3332Z" fill="#8E8E93" />
                                <path d="M12.0003 8.66667C12.0003 9.03487 11.7019 9.33333 11.3337 9.33333C10.9655 9.33333 10.667 9.03487 10.667 8.66667C10.667 8.29847 10.9655 8 11.3337 8C11.7019 8 12.0003 8.29847 12.0003 8.66667Z" fill="#8E8E93" />
                                <path d="M8.66634 11.3332C8.66634 11.7014 8.36787 11.9998 7.99967 11.9998C7.63147 11.9998 7.33301 11.7014 7.33301 11.3332C7.33301 10.965 7.63147 10.6665 7.99967 10.6665C8.36787 10.6665 8.66634 10.965 8.66634 11.3332Z" fill="#8E8E93" />
                                <path d="M8.66634 8.66667C8.66634 9.03487 8.36787 9.33333 7.99967 9.33333C7.63147 9.33333 7.33301 9.03487 7.33301 8.66667C7.33301 8.29847 7.63147 8 7.99967 8C8.36787 8 8.66634 8.29847 8.66634 8.66667Z" fill="#8E8E93" />
                                <path d="M5.33333 11.3332C5.33333 11.7014 5.03485 11.9998 4.66667 11.9998C4.29848 11.9998 4 11.7014 4 11.3332C4 10.965 4.29848 10.6665 4.66667 10.6665C5.03485 10.6665 5.33333 10.965 5.33333 11.3332Z" fill="#8E8E93" />
                                <path d="M5.33333 8.66667C5.33333 9.03487 5.03485 9.33333 4.66667 9.33333C4.29848 9.33333 4 9.03487 4 8.66667C4 8.29847 4.29848 8 4.66667 8C5.03485 8 5.33333 8.29847 5.33333 8.66667Z" fill="#8E8E93" />
                            </svg>
                                {selectedWorkspace.company_research_data?.founded_year ? `Founded ${selectedWorkspace.company_research_data.founded_year}` : "--"}</span>
                            <span className="flex items-center gap-1.5"><svg width="60" height="16" viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.22872 2.5349C6.5812 1.73396 7.25747 1.3335 8 1.3335C8.74253 1.3335 9.4188 1.73396 10.7713 2.5349L11.2287 2.8058C12.5812 3.60674 13.2575 4.00721 13.6287 4.66683C14 5.32645 14 6.12739 14 7.7293V8.27103C14 9.87296 14 10.6739 13.6287 11.3335C13.2575 11.9931 12.5812 12.3936 11.2287 13.1945L10.7713 13.4654C9.4188 14.2664 8.74253 14.6668 8 14.6668C7.25747 14.6668 6.5812 14.2664 5.22872 13.4654L4.77128 13.1945C3.4188 12.3936 2.74256 11.9931 2.37128 11.3335C2 10.6739 2 9.87296 2 8.27103V7.7293C2 6.12739 2 5.32645 2.37128 4.66683C2.74256 4.00721 3.4188 3.60674 4.77128 2.8058L5.22872 2.5349Z" stroke="#8E8E93" />
                                <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#8E8E93" />
                                <path d="M20.9492 3.59766H25.6426V4.46484H21.8457V7.17773H25.2324V8.03906H21.8457V12H20.9492V3.59766ZM27.084 3.62109C27.252 3.62109 27.4004 3.68359 27.5293 3.80859C27.6582 3.93359 27.7227 4.08008 27.7227 4.24805C27.7227 4.41992 27.6582 4.57031 27.5293 4.69922C27.4004 4.82422 27.252 4.88672 27.084 4.88672C26.9121 4.88672 26.7656 4.82422 26.6445 4.69922C26.5234 4.57422 26.4629 4.42383 26.4629 4.24805C26.4629 4.08008 26.5234 3.93359 26.6445 3.80859C26.7656 3.68359 26.9121 3.62109 27.084 3.62109ZM26.6387 6.16992H27.5176V12H26.6387V6.16992ZM32.0645 6.04688C32.8184 6.04688 33.416 6.28125 33.8574 6.75C34.3027 7.21484 34.5254 7.8457 34.5254 8.64258V12H33.6465V8.72461C33.6465 8.16602 33.4844 7.71875 33.1602 7.38281C32.8398 7.04688 32.4141 6.87891 31.8828 6.87891C31.3359 6.87891 30.8965 7.04883 30.5645 7.38867C30.2363 7.72461 30.0723 8.16992 30.0723 8.72461V12H29.1934V6.16992H30.0723V7.30664C30.2598 6.9082 30.5254 6.59961 30.8691 6.38086C31.2129 6.1582 31.6113 6.04688 32.0645 6.04688ZM38.873 6.98438H37.2441V10.0312C37.2441 10.8398 37.6523 11.2441 38.4688 11.2441C38.6328 11.2441 38.7676 11.2285 38.873 11.1973V12C38.6973 12.0391 38.5098 12.0586 38.3105 12.0586C37.7012 12.0586 37.2246 11.8906 36.8809 11.5547C36.5371 11.2148 36.3652 10.7109 36.3652 10.043V6.98438H35.2168V6.16992H36.3652V4.55859H37.2441V6.16992H38.873V6.98438ZM45.1191 8.90625C45.1191 9.08203 45.1152 9.19336 45.1074 9.24023H40.2207C40.2637 9.86523 40.4785 10.3691 40.8652 10.752C41.252 11.1348 41.75 11.3262 42.3594 11.3262C42.8281 11.3262 43.2305 11.2207 43.5664 11.0098C43.9062 10.7949 44.1152 10.5098 44.1934 10.1543H45.0723C44.959 10.7441 44.6504 11.2188 44.1465 11.5781C43.6426 11.9375 43.0391 12.1172 42.3359 12.1172C41.4883 12.1172 40.7793 11.8242 40.209 11.2383C39.6426 10.6523 39.3594 9.92188 39.3594 9.04688C39.3594 8.20703 39.6465 7.49805 40.2207 6.91992C40.7949 6.33789 41.4961 6.04688 42.3242 6.04688C42.8438 6.04688 43.3164 6.16992 43.7422 6.41602C44.168 6.6582 44.5039 6.99805 44.75 7.43555C44.9961 7.87305 45.1191 8.36328 45.1191 8.90625ZM40.2617 8.49609H44.1816C44.1387 8.01172 43.9414 7.61523 43.5898 7.30664C43.2422 6.99414 42.8086 6.83789 42.2891 6.83789C41.7734 6.83789 41.332 6.98828 40.9648 7.28906C40.5977 7.58984 40.3633 7.99219 40.2617 8.49609ZM48.9453 12.1172C48.0977 12.1172 47.3828 11.8262 46.8008 11.2441C46.2227 10.6582 45.9336 9.9375 45.9336 9.08203C45.9336 8.22656 46.2227 7.50781 46.8008 6.92578C47.3828 6.33984 48.0977 6.04688 48.9453 6.04688C49.6055 6.04688 50.1934 6.24023 50.709 6.62695C51.2246 7.00977 51.5371 7.49219 51.6465 8.07422H50.7559C50.6582 7.72656 50.4395 7.44141 50.0996 7.21875C49.7598 6.99219 49.375 6.87891 48.9453 6.87891C48.3398 6.87891 47.8301 7.08984 47.416 7.51172C47.002 7.93359 46.7949 8.45703 46.7949 9.08203C46.7949 9.70312 47.002 10.2266 47.416 10.6523C47.8301 11.0781 48.3398 11.291 48.9453 11.291C49.3789 11.291 49.7676 11.1738 50.1113 10.9395C50.459 10.7051 50.6738 10.4023 50.7559 10.0312H51.6465C51.5566 10.6406 51.252 11.1406 50.7324 11.5312C50.2168 11.9219 49.6211 12.1172 48.9453 12.1172ZM55.7598 6.04688C56.5137 6.04688 57.1113 6.28125 57.5527 6.75C57.998 7.21484 58.2207 7.8457 58.2207 8.64258V12H57.3418V8.72461C57.3418 8.16602 57.1797 7.71875 56.8555 7.38281C56.5352 7.04688 56.1094 6.87891 55.5781 6.87891C55.0312 6.87891 54.5918 7.04883 54.2598 7.38867C53.9316 7.72461 53.7676 8.16992 53.7676 8.72461V12H52.8887V3.59766H53.7676V7.30664C53.9551 6.9082 54.2207 6.59961 54.5645 6.38086C54.9082 6.1582 55.3066 6.04688 55.7598 6.04688Z" fill="#8E8E93" />
                            </svg>
                                {selectedWorkspace.company_research_data?.industry || "--"}</span>
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
                        onClick={() => hasRatingData && setShowRatingModal(true)}
                        title={hasRatingData ? "View company rating details" : "Rating data not available"}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${hasRatingData
                            ? "bg-[#EBFFEE] border border-[#34C759] text-[#14AE5C] hover:bg-[#DFFBE7]"
                            : "bg-[#F3F5F7] border border-[#D1D1D6] text-[#8E8E93] cursor-not-allowed"
                            }`}
                        disabled={!hasRatingData}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1077_16127)">
                                <path d="M6.10178 3.60575C6.94621 2.09092 7.36841 1.3335 7.99968 1.3335C8.63094 1.3335 9.05314 2.09091 9.89754 3.60574L10.116 3.99765C10.356 4.42812 10.4759 4.64336 10.6631 4.78537C10.8501 4.92738 11.0831 4.9801 11.5491 5.08553L11.9733 5.18152C13.6131 5.55254 14.433 5.73804 14.6281 6.36532C14.8231 6.99256 14.2642 7.64623 13.1463 8.95343L12.8571 9.29163C12.5394 9.6631 12.3805 9.84883 12.3091 10.0786C12.2377 10.3084 12.2617 10.5562 12.3097 11.0519L12.3534 11.5031C12.5224 13.2472 12.6069 14.1193 12.0963 14.507C11.5855 14.8946 10.8179 14.5412 9.28254 13.8343L8.88534 13.6514C8.44908 13.4505 8.23094 13.35 7.99968 13.35C7.76841 13.35 7.55028 13.4505 7.11401 13.6514L6.71681 13.8343C5.18146 14.5412 4.4138 14.8946 3.90311 14.507C3.39242 14.1193 3.47693 13.2472 3.64594 11.5031L3.68966 11.0519C3.7377 10.5562 3.76171 10.3084 3.69025 10.0786C3.6188 9.84883 3.45996 9.6631 3.14229 9.29163L2.85308 8.95343C1.73518 7.64623 1.17622 6.99256 1.37129 6.36532C1.56636 5.73804 2.38625 5.55254 4.02604 5.18152L4.45027 5.08553C4.91624 4.9801 5.14923 4.92738 5.3363 4.78537C5.52338 4.64336 5.64336 4.42812 5.88332 3.99765L6.10178 3.60575Z" fill="#AFF4C6" stroke="#14AE5C" />
                            </g>
                            <defs>
                                <clipPath id="clip0_1077_16127">
                                    <rect width="16" height="16" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        {hasRatingData ? Number(workspaceRating).toFixed(1) : "--"}
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
                    {
                        label: "Total Jobs", value: selectedWorkspace.jobs_count ?? workspaceJobs.length, trend: "--", trendColor: "text-[#8E8E93]", icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M20 22.5L20 23.75" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.5 19.1665L12.6274 21.5526C12.7643 24.564 12.8327 26.0697 13.799 26.9931C14.7654 27.9165 16.2726 27.9165 19.2872 27.9165H20.7128C23.7274 27.9165 25.2346 27.9165 26.201 26.9931C27.1673 26.0697 27.2357 24.564 27.3726 21.5526L27.5 19.1665" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12.3728 18.7025C13.7889 21.3954 16.9828 22.5 20.0002 22.5C23.0175 22.5 26.2114 21.3954 27.6275 18.7025C28.3035 17.4171 27.7916 15 26.1268 15H13.8735C12.2087 15 11.6969 17.4171 12.3728 18.7025Z" stroke="#0F47F2" />
                            <path d="M23.3332 15.0002L23.2596 14.7426C22.8929 13.4592 22.7096 12.8176 22.2731 12.4505C21.8366 12.0835 21.2568 12.0835 20.0973 12.0835H19.9024C18.7428 12.0835 18.1631 12.0835 17.7266 12.4505C17.2901 12.8176 17.1068 13.4592 16.7401 14.7426L16.6665 15.0002" stroke="#0F47F2" />
                        </svg>
                    },
                    {
                        label: "Total Candidates", value: selectedWorkspace.candidates_in_workspace_count ?? workspaceJobs.reduce((acc, j) => acc + (j.total_applied || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M17.8333 18.6667C19.6743 18.6667 21.1667 17.1743 21.1667 15.3333C21.1667 13.4924 19.6743 12 17.8333 12C15.9924 12 14.5 13.4924 14.5 15.3333C14.5 17.1743 15.9924 18.6667 17.8333 18.6667Z" stroke="#0F47F2" />
                            <path d="M22.833 17.8335C24.2138 17.8335 25.333 16.7142 25.333 15.3335C25.333 13.9528 24.2138 12.8335 22.833 12.8335" stroke="#0F47F2" stroke-linecap="round" />
                            <path d="M17.8333 27.8332C21.055 27.8332 23.6667 26.3408 23.6667 24.4998C23.6667 22.6589 21.055 21.1665 17.8333 21.1665C14.6117 21.1665 12 22.6589 12 24.4998C12 26.3408 14.6117 27.8332 17.8333 27.8332Z" stroke="#0F47F2" />
                            <path d="M25.333 22C26.7948 22.3206 27.833 23.1324 27.833 24.0833C27.833 24.9411 26.9883 25.6857 25.7497 26.0587" stroke="#0F47F2" stroke-linecap="round" />
                        </svg>
                    },
                    {
                        label: "In Pipeline", value: workspaceJobs.reduce((acc, j) => acc + (j.pipeline_candidate_count || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M14.167 16.6665C15.5477 16.6665 16.667 15.5472 16.667 14.1665C16.667 12.7858 15.5477 11.6665 14.167 11.6665C12.7863 11.6665 11.667 12.7858 11.667 14.1665C11.667 15.5472 12.7863 16.6665 14.167 16.6665Z" stroke="#0F47F2" />
                            <path d="M25.833 28.3335C27.2137 28.3335 28.333 27.2142 28.333 25.8335C28.333 24.4528 27.2137 23.3335 25.833 23.3335C24.4523 23.3335 23.333 24.4528 23.333 25.8335C23.333 27.2142 24.4523 28.3335 25.833 28.3335Z" stroke="#0F47F2" />
                            <path d="M19.1182 25.7085L19.2422 25.8325L19.1416 25.9341L19.1172 25.9585H17.0566V25.7085H19.1182ZM15.3486 23.1997C14.6799 24.0131 15.0559 25.302 16.0566 25.6294V25.8911C14.8057 25.5478 14.3369 23.9402 15.208 22.979L15.3486 23.1997ZM23.9834 17.6128L16.1504 22.5972L16.0156 22.3862L23.8486 17.4019L23.9834 17.6128ZM23.9434 14.1079C25.1942 14.4514 25.6615 16.0589 24.79 17.02L24.6494 16.7993C25.3184 15.986 24.9441 14.6972 23.9434 14.3696V14.1079ZM22.9434 14.0415V14.2915H19.666V14.0415H22.9434Z" fill="#1C274C" stroke="#0F47F2" />
                        </svg>
                    },
                    {
                        label: "Shortlisted", value: selectedWorkspace.shortlisted_candidates_in_workspace_count ?? workspaceJobs.reduce((acc, j) => acc + (j.shortlisted_candidate_count || 0), 0), trend: shortlistedTrend, trendColor: shortlistedColor, icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M20.0003 18.3332C21.8413 18.3332 23.3337 16.8408 23.3337 14.9998C23.3337 13.1589 21.8413 11.6665 20.0003 11.6665C18.1594 11.6665 16.667 13.1589 16.667 14.9998C16.667 16.8408 18.1594 18.3332 20.0003 18.3332Z" stroke="#0F47F2" />
                            <path d="M24.1663 28.3332C26.0073 28.3332 27.4997 26.8408 27.4997 24.9998C27.4997 23.1589 26.0073 21.6665 24.1663 21.6665C22.3254 21.6665 20.833 23.1589 20.833 24.9998C20.833 26.8408 22.3254 28.3332 24.1663 28.3332Z" stroke="#0F47F2" />
                            <path d="M23.0557 25L23.7502 25.8334L25.2779 24.2593" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21.667 27.3622C21.1389 27.4519 20.5795 27.5002 20.0003 27.5002C16.7787 27.5002 14.167 26.0077 14.167 24.1668C14.167 22.3259 16.7787 20.8335 20.0003 20.8335C21.4282 20.8335 22.7363 21.1267 23.7503 21.6134" stroke="#0F47F2" />
                        </svg>
                    },
                    {
                        label: "Interview this week", value: workspaceJobs.reduce((acc, j) => acc + (j.interview_this_week || 0), 0), trend: "--", trendColor: "text-[#8E8E93]", icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M11.667 20.0002C11.667 16.8575 11.667 15.2861 12.6433 14.3098C13.6196 13.3335 15.191 13.3335 18.3337 13.3335H21.667C24.8097 13.3335 26.3811 13.3335 27.3573 14.3098C28.3337 15.2861 28.3337 16.8575 28.3337 20.0002V21.6668C28.3337 24.8095 28.3337 26.3809 27.3573 27.3572C26.3811 28.3335 24.8097 28.3335 21.667 28.3335H18.3337C15.191 28.3335 13.6196 28.3335 12.6433 27.3572C11.667 26.3809 11.667 24.8095 11.667 21.6668V20.0002Z" stroke="#0F47F2" />
                            <path d="M15.833 13.3335V12.0835" stroke="#0F47F2" stroke-linecap="round" />
                            <path d="M24.167 13.3335V12.0835" stroke="#0F47F2" stroke-linecap="round" />
                            <path d="M12.083 17.5H27.9163" stroke="#0F47F2" stroke-linecap="round" />
                            <path d="M24.9997 24.1668C24.9997 24.6271 24.6266 25.0002 24.1663 25.0002C23.7061 25.0002 23.333 24.6271 23.333 24.1668C23.333 23.7066 23.7061 23.3335 24.1663 23.3335C24.6266 23.3335 24.9997 23.7066 24.9997 24.1668Z" fill="#0F47F2" />
                            <path d="M24.9997 20.8333C24.9997 21.2936 24.6266 21.6667 24.1663 21.6667C23.7061 21.6667 23.333 21.2936 23.333 20.8333C23.333 20.3731 23.7061 20 24.1663 20C24.6266 20 24.9997 20.3731 24.9997 20.8333Z" fill="#0F47F2" />
                            <path d="M20.8337 24.1668C20.8337 24.6271 20.4606 25.0002 20.0003 25.0002C19.5401 25.0002 19.167 24.6271 19.167 24.1668C19.167 23.7066 19.5401 23.3335 20.0003 23.3335C20.4606 23.3335 20.8337 23.7066 20.8337 24.1668Z" fill="#0F47F2" />
                            <path d="M20.8337 20.8333C20.8337 21.2936 20.4606 21.6667 20.0003 21.6667C19.5401 21.6667 19.167 21.2936 19.167 20.8333C19.167 20.3731 19.5401 20 20.0003 20C20.4606 20 20.8337 20.3731 20.8337 20.8333Z" fill="#0F47F2" />
                            <path d="M16.6667 24.1668C16.6667 24.6271 16.2936 25.0002 15.8333 25.0002C15.3731 25.0002 15 24.6271 15 24.1668C15 23.7066 15.3731 23.3335 15.8333 23.3335C16.2936 23.3335 16.6667 23.7066 16.6667 24.1668Z" fill="#0F47F2" />
                            <path d="M16.6667 20.8333C16.6667 21.2936 16.2936 21.6667 15.8333 21.6667C15.3731 21.6667 15 21.2936 15 20.8333C15 20.3731 15.3731 20 15.8333 20C16.2936 20 16.6667 20.3731 16.6667 20.8333Z" fill="#0F47F2" />
                        </svg>
                    },
                    {
                        label: "Hired", value: selectedWorkspace.hired_candidates_in_workspace_count ?? 0, trend: hiredTrend, trendColor: hiredColor, icon: <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
                            <path d="M20 20C21.3807 20 22.5 18.8807 22.5 17.5C22.5 16.1193 21.3807 15 20 15C18.6193 15 17.5 16.1193 17.5 17.5C17.5 18.8807 18.6193 20 20 20Z" stroke="#0F47F2" />
                            <path d="M20.0003 28.3332C24.6027 28.3332 28.3337 24.6022 28.3337 19.9998C28.3337 15.3975 24.6027 11.6665 20.0003 11.6665C15.398 11.6665 11.667 15.3975 11.667 19.9998C11.667 24.6022 15.398 28.3332 20.0003 28.3332Z" stroke="#0F47F2" />
                            <path d="M24.974 26.6667C24.8414 24.2571 24.1037 22.5 19.9997 22.5C15.8958 22.5 15.158 24.2571 15.0254 26.6667" stroke="#0F47F2" stroke-linecap="round" />
                        </svg>
                    },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-[#D1D1D6] flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between">
                            {stat.icon}
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
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1077_15886)">
                                <path d="M5.99967 14.6668H9.99967C13.333 14.6668 14.6663 13.3335 14.6663 10.0002V6.00016C14.6663 2.66683 13.333 1.3335 9.99967 1.3335H5.99967C2.66634 1.3335 1.33301 2.66683 1.33301 6.00016V10.0002C1.33301 13.3335 2.66634 14.6668 5.99967 14.6668Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M8 1.3335V14.6668" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M1.33301 6.3335H7.99967" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M8 9.66699H14.6667" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_1077_15886">
                                    <rect width="16" height="16" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        Grid View
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
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_1077_15875)">
                                    <path d="M14.6663 9.3321C14.6471 11.6081 14.5207 12.8628 13.6933 13.6903C12.7167 14.6668 11.1449 14.6668 8.00141 14.6668C4.85789 14.6668 3.28614 14.6668 2.30957 13.6903C1.33301 12.7137 1.33301 11.142 1.33301 7.99843C1.33301 4.85491 1.33301 3.28315 2.30957 2.30658C3.137 1.47915 4.39172 1.3528 6.66774 1.3335" stroke="#374151" stroke-linecap="round" />
                                    <path d="M14.6667 4.66683H9.33333C8.1216 4.66683 7.39113 5.26151 7.12027 5.53369C7.0364 5.61798 6.99447 5.66014 6.99387 5.66071C6.99333 5.66128 6.95113 5.70322 6.86687 5.78711C6.59468 6.05797 6 6.78843 6 8.00016V10.0002M14.6667 4.66683L11.3333 1.3335M14.6667 4.66683L11.3333 8.00016" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1077_15875">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            Share Pipeline
                        </button>

                        <button
                            disabled
                            title="Feature coming Soon"
                            className="flex items-center gap-2 px-[12px] py-[10px] border border-[#AEAEB2] rounded-[6px] text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.6514 6.00737C11.6564 6.00735 11.6614 6.00734 11.6663 6.00734C13.3232 6.00734 14.6663 7.35295 14.6663 9.01284C14.6663 10.5599 13.4997 11.8339 11.9997 12M11.6514 6.00737C11.6613 5.89737 11.6663 5.78597 11.6663 5.67339C11.6663 3.64463 10.0247 2 7.99967 2C6.08183 2 4.50789 3.47511 4.34662 5.35461M11.6514 6.00737C11.5832 6.76506 11.2854 7.4564 10.8282 8.01101M4.34662 5.35461C2.65566 5.51582 1.33301 6.94261 1.33301 8.6789C1.33301 10.2945 2.47818 11.6421 3.99967 11.9515M4.34662 5.35461C4.45185 5.34458 4.5585 5.33945 4.66634 5.33945C5.41689 5.33945 6.1095 5.58796 6.66667 6.00734" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M7.99967 8.6665L7.99967 13.9998M7.99967 8.6665C7.53286 8.6665 6.66069 9.99604 6.33301 10.3332M7.99967 8.6665C8.46649 8.6665 9.33865 9.99604 9.66634 10.3332" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Export CSV
                        </button>

                        <button
                            disabled
                            title="Feature coming Soon"
                            className="flex items-center gap-2 px-[12px] py-[10px] border border-[#AEAEB2] rounded-[6px] text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M6.66667 11.3332L6.66666 8.89798C6.66666 8.77014 6.5755 8.6665 6.46305 8.6665H6M9.08644 11.3332L9.98945 8.89928C10.0317 8.78547 9.94189 8.6665 9.81379 8.6665H8.66667" stroke="#374151" stroke-linecap="round" />
                                <path d="M1.6665 8.16216C1.6665 5.25729 1.6665 3.80486 2.50125 2.90243C3.336 2 4.6795 2 7.3665 2H8.63317C11.3202 2 12.6637 2 13.4984 2.90243C14.3332 3.80486 14.3332 5.25729 14.3332 8.16216V8.5045C14.3332 11.4094 14.3332 12.8618 13.4984 13.7642C12.6637 14.6667 11.3202 14.6667 8.63317 14.6667H7.3665C4.6795 14.6667 3.336 14.6667 2.50125 13.7642C1.6665 12.8618 1.6665 11.4094 1.6665 8.5045V8.16216Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M4 5.3335H12" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-visible">
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
                                const hiddenStages = ['uncontacted', 'invites sent', 'applied', 'archives'];
                                const stages = allStages
                                    ? allStages.filter((s: any) => !hiddenStages.includes((s.name || '').toLowerCase()))
                                    : defaultStages;

                                const stageColors = [
                                    { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' }, // Indigo
                                    { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' }, // Purple
                                    { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' }, // Pink
                                    { bg: '#FEF9C3', text: '#D97706', border: '#FEF08A' }, // Yellow
                                    { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' }, // Orange
                                    { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' }, // Green
                                    { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' }, // Light Blue
                                ];

                                return (
                                    <tr key={job.id} className="h-[72px] hover:bg-[#FAFBFC] transition-colors group">
                                        {/* Checkbox */}
                                        <td className="px-4 py-3">
                                            <input type="checkbox" className="w-4 h-4 accent-[#0F47F2] rounded border-gray-300" />
                                        </td>

                                        {/* Job Title */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1.5 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-[14px] font-[600] text-[#1C1C1E] leading-[17px] cursor-pointer hover:text-[#0F47F2] hover:underline transition-colors truncate"
                                                        onClick={() => onJobSelect?.(job)}
                                                    >{job.title}</span>
                                                    {job.is_flagged && <Flag className="w-3.5 h-3.5 text-[#DC2626] fill-[#DC2626] shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-visible whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                                    {/* add a copy button here and line it up with job id */}
                                                    <span
                                                        className="flex items-center gap-1 px-2.5 py-0.5 bg-[#F0F4FF] rounded-full text-[11px] font-medium text-[#4674E5] whitespace-nowrap cursor-pointer hover:bg-[#E0E9FF] transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(`${job.title}, ${job.location} (Job ID: ${job.id})`).then(() => showToast.success("Job ID copied"));
                                                        }}
                                                    >

                                                        {/* add a copy button here  */}
                                                        <Copy className="w-3.5 h-3.5 text-[#4674E5] shrink-0" />
                                                        {job.job_id || job.id}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 bg-[#F0F4FF] rounded-full text-[11px] font-medium text-[#4674E5] whitespace-nowrap">
                                                        {job.experience_display || `${job.experience_min_years || 3} - ${job.experience_max_years || 5}yrs`}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${(job.notice_period || 'Immediate') === 'Immediate'
                                                        ? 'bg-[#FFF0F2] text-[#E11D48]'
                                                        : (job.notice_period || '').includes('90')
                                                            ? 'bg-[#FFF0F2] text-[#E11D48]'
                                                            : 'bg-[#FFF3E0] text-[#E65100]'
                                                        }`}>
                                                        {job.notice_period || '--'}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 bg-[#F0F4FF] rounded-full text-[11px] font-medium text-[#4674E5] whitespace-nowrap">
                                                        {(Number(job.salary_min || 0) === 0 && Number(job.salary_max || 0) === 0) ? "Confidential" : `${formatSalaryToLPA(job.salary_min)} - ${formatSalaryToLPA(job.salary_max)} LPA`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Position */}
                                        <td className="px-4 py-3 text-[14px] text-[#4B5563] text-center">
                                            {noOfPositions}
                                        </td>

                                        {/* Candidates */}
                                        <td className="px-4 py-3 text-[14px] text-[#4B5563] text-center">
                                            {job.candidates_count ?? job.total_applied ?? 0}
                                        </td>

                                        {/* Pipeline Stages */}
                                        <td className="px-4 py-3">
                                            <div className="overflow-x-auto overflow-y-visible whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                                <div className="flex gap-1.5 items-center min-w-max">
                                                    {stages.length > 0 ? stages.map((item: any, idx: number) => {
                                                        const stageArchivedCount = item.archived_count || 0;
                                                        const palette = stageColors[idx % stageColors.length];
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="relative"
                                                                onMouseEnter={(e) => showStageTooltip(e, item.name, item.count, stageArchivedCount)}
                                                                onMouseLeave={() => setStageTooltip((prev) => ({ ...prev, visible: false }))}
                                                            >
                                                                <div
                                                                    className="min-w-[28px] h-[28px] px-2 rounded-[6px] border flex items-center justify-center text-[13px] font-bold cursor-default"
                                                                    style={{ backgroundColor: palette.bg, borderColor: palette.border, color: palette.text }}
                                                                >
                                                                    <span>{item.count}</span>
                                                                    <span className="text-[#8E8E93] text-[12px] font-semibold ml-1">- {stageArchivedCount}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <span className="text-xs text-[#8E8E93]">--</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Days Open */}
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <span className="text-[14px] font-medium text-[#4B5563]">{daysOpen} d</span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="relative inline-block" ref={statusMenuOpenId === job.id ? statusMenuRef : null}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (statusMenuOpenId === job.id) {
                                                            setStatusMenuOpenId(null);
                                                            return;
                                                        }
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const menuWidth = 128;
                                                        const menuHeight = 116;
                                                        const verticalGap = 6;
                                                        const openUp = rect.bottom + menuHeight + verticalGap > window.innerHeight;
                                                        const top = openUp
                                                            ? Math.max(8, rect.top - menuHeight - verticalGap)
                                                            : rect.bottom + verticalGap;
                                                        let left = rect.left + rect.width / 2 - menuWidth / 2;
                                                        if (left < 8) left = 8;
                                                        if (left + menuWidth > window.innerWidth - 8) {
                                                            left = window.innerWidth - menuWidth - 8;
                                                        }
                                                        setStatusMenuPos({ top, left });
                                                        setStatusMenuOpenId(job.id);
                                                    }}
                                                    className={`inline-flex items-center justify-between min-w-[90px] gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium transition-colors hover:opacity-80 active:opacity-60 cursor-pointer ${job.status === 'ACTIVE' ? 'bg-[#D1FAE5] text-[#059669]'
                                                        : job.status === 'PAUSED' ? 'bg-[#FEF3C7] text-[#D97706]'
                                                            : 'bg-[#F3F4F6] text-[#4B5563]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'ACTIVE' ? 'bg-[#059669]'
                                                            : job.status === 'PAUSED' ? 'bg-[#D97706]'
                                                                : 'bg-[#4B5563]'
                                                            }`} />
                                                        {job.status === 'ACTIVE' ? 'Active'
                                                            : job.status === 'PAUSED' ? 'Paused'
                                                                : job.status === 'INACTIVE' ? 'Inactive'
                                                                    : job.status?.charAt(0) + job.status?.slice(1).toLowerCase()}
                                                    </div>
                                                    <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Note */}
                                        <td className="px-4 py-3 min-w-[200px]">
                                            {inlineEditJobId === job.id ? (
                                                <div className="relative">
                                                    <textarea
                                                        value={inlineNoteContent}
                                                        onChange={(e) => setInlineNoteContent(e.target.value)}
                                                        className="w-full max-h-20 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border border-gray-200 rounded text-[13px] p-2 focus:outline-none focus:border-[#0F47F2]"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex items-center gap-2 mt-1 justify-end">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setInlineEditJobId(null); }}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >Cancel</button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSaveInlineNote(job.id); }}
                                                            className="text-xs text-white bg-[#0F47F2] px-2 py-1 rounded"
                                                        >Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="block max-h-10 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[13px] text-[#4B5563] leading-relaxed">
                                                    {fetchedNotes[job.id]?.[0]?.content || <span className="text-[#8E8E93] opacity-70">Add a note</span>}
                                                </span>
                                            )}
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMenuOpenJobId(null);
                                                                setInlineEditJobId(job.id);
                                                                setInlineNoteContent(fetchedNotes[job.id]?.[0]?.content || "");
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-3"
                                                        >
                                                            <MessageSquare className="w-4 h-4" /> {fetchedNotes[job.id]?.[0] ? 'Edit Note' : 'Add Note'}
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

            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-[#1C1C1E]">
                                    {selectedWorkspace.company_research_data?.company_name || selectedWorkspace.name} Rating
                                </h3>
                                <p className="text-sm text-[#6B7280] mt-1">
                                    Based on company research insights
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="text-sm text-[#6B7280] hover:text-[#1C1C1E]"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <p className="text-xs text-[#6B7280] mb-1">Overall Rating</p>
                                <p className="text-2xl font-semibold text-[#14AE5C]">
                                    {hasRatingData ? Number(workspaceRating).toFixed(1) : "--"}
                                    <span className="text-sm text-[#6B7280] font-normal"> / 5</span>
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <p className="text-xs text-[#6B7280] mb-1">Rating Source</p>
                                <p className="text-base font-medium text-[#1C1C1E]">
                                    {selectedWorkspace.company_research_data?.rating_source || "--"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <p className="text-xs text-[#6B7280] mb-1">Review Count</p>
                                <p className="text-base font-medium text-[#1C1C1E]">
                                    {selectedWorkspace.company_research_data?.review_count ?? "--"}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <p className="text-xs text-[#6B7280] mb-1">Recommend to Friend</p>
                                <p className="text-base font-medium text-[#1C1C1E]">
                                    {selectedWorkspace.company_research_data?.recommend_to_friend_pct != null
                                        ? `${selectedWorkspace.company_research_data.recommend_to_friend_pct}%`
                                        : "--"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-lg border border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280]">Work-Life Balance</p>
                                <p className="text-sm font-medium text-[#1C1C1E]">{selectedWorkspace.company_research_data?.work_life_balance_rating ?? "--"}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280]">Management</p>
                                <p className="text-sm font-medium text-[#1C1C1E]">{selectedWorkspace.company_research_data?.management_rating ?? "--"}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280]">Compensation</p>
                                <p className="text-sm font-medium text-[#1C1C1E]">{selectedWorkspace.company_research_data?.compensation_rating ?? "--"}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280]">Career Growth</p>
                                <p className="text-sm font-medium text-[#1C1C1E]">{selectedWorkspace.company_research_data?.career_growth_rating ?? "--"}</p>
                            </div>
                            <div className="p-3 rounded-lg border border-[#E5E7EB]">
                                <p className="text-xs text-[#6B7280]">Job Security</p>
                                <p className="text-sm font-medium text-[#1C1C1E]">{selectedWorkspace.company_research_data?.job_security_rating ?? "--"}</p>
                            </div>
                        </div>

                        {Array.isArray(selectedWorkspace.company_research_data?.culture_summary) && selectedWorkspace.company_research_data.culture_summary.length > 0 && (
                            <div className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                                <p className="text-xs text-[#6B7280] mb-2">Culture Summary</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-[#4B5563]">
                                    {selectedWorkspace.company_research_data.culture_summary.slice(0, 3).map((item: string, idx: number) => (
                                        <li key={`culture-${idx}`}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {statusMenuOpenId !== null && (
                <div
                    ref={statusMenuRef}
                    className="fixed w-32 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[10000] py-1"
                    style={{ top: statusMenuPos.top, left: statusMenuPos.left }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(statusMenuOpenId, 'ACTIVE'); setStatusMenuOpenId(null); }}
                        className="w-full text-left px-4 py-2 text-[13px] text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> Active
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(statusMenuOpenId, 'PAUSED'); setStatusMenuOpenId(null); }}
                        className="w-full text-left px-4 py-2 text-[13px] text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> Paused
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(statusMenuOpenId, 'INACTIVE'); setStatusMenuOpenId(null); }}
                        className="w-full text-left px-4 py-2 text-[13px] text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4B5563]" /> Inactive
                    </button>
                </div>
            )}

            {stageTooltip.visible && (
                <div
                    className="fixed px-2.5 py-1.5 bg-[#1C1C1E] text-white text-[11px] rounded-lg pointer-events-none z-[10000] shadow-lg"
                    style={{ top: stageTooltip.top, left: stageTooltip.left, width: 210 }}
                >
                    <div className="font-medium">{stageTooltip.name}</div>
                    <div className="text-gray-300">Active: {stageTooltip.active} · Archived: {stageTooltip.archived}</div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C1C1E] rotate-45" />
                </div>
            )}
        </div>
    );
};

export default JobListing;
