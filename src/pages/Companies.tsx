import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
    organizationService,
    MyWorkspace,
} from "../services/organizationService";
import { jobPostService, Job } from "../services/jobPostService";
import { showToast } from "../utils/toast";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Plus,
    Check,
    Pause,
    Play,
    Users,
    Settings,
    DownloadCloud,
    Calendar,
    ChevronDown,
    Star,
    ArrowRight,
    MapPin,
    Globe,
    Briefcase,
    Route,
    UserCheck,
    Pencil,
    UserCircle,
    LayoutGrid
} from "lucide-react";
import CreateWorkspaceModal from "../components/workspace/CreateWorkspaceModal";
import JoinWorkspaceModal from "../components/workspace/JoinWorkspaceModal";
import PendingRequestsModal from "../components/workspace/PendingRequestsModal";
import {
    companyStatCards,
    companyTableRows,
    CompanyTableRow,
} from "./companies/companiesData";



const statusStyles: Record<string, { bg: string; text: string }> = {
    Active: { bg: "bg-[#DEF7EC]", text: "text-[#03543F]" },
    Paused: { bg: "bg-[#FFF7D6]", text: "text-[#92400E]" },
    Inactive: { bg: "bg-[#F3F5F7]", text: "text-[#8E8E93]" },
};

export default function Companies() {
    const { isAuthenticated } = useAuth();

    const [workspaces, setWorkspaces] = useState<MyWorkspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [logos, setLogos] = useState<Record<string, string | null | undefined>>({});

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);


    const [isActionView, setIsActionView] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState<MyWorkspace | null>(null);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);

    // Sync selected workspace name with global state for header breadcrumbs
    useEffect(() => {
        if (selectedWorkspace) {
            (window as any).__selectedWorkspaceName = selectedWorkspace.name;
        } else {
            delete (window as any).__selectedWorkspaceName;
        }
        window.dispatchEvent(new CustomEvent('header-update'));
    }, [selectedWorkspace]);

    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState<
        "All" | "Active" | "Paused" | "Inactive" | "Has Open Jobs" | "Needs Attention"
    >("All");
    const [activeJobFilter, setActiveJobFilter] = useState<"All" | "Active" | "Paused" | "Closed" | "Draft">("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [jobSearchQuery, setJobSearchQuery] = useState("");

    const fetchLogo = async (query: string) => {
        if (!query || logos[query] !== undefined) return;
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
            setLogos((prev) => ({ ...prev, [query]: undefined }));
        }
    };

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const data = await organizationService.getMyWorkspaces();
            setWorkspaces(data);
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
        }
    }, [isAuthenticated]);

    const buildTableRows = useCallback((): CompanyTableRow[] => {
        if (workspaces.length === 0) return companyTableRows;

        return workspaces.map((ws, i) => {
            const fallback = companyTableRows[i % companyTableRows.length];
            return {
                id: `ws-${ws.id}`,
                workspaceId: ws.id,
                name: ws.name,
                domain: ws.company_research_data?.website || fallback.domain,
                totalJobs: fallback.totalJobs,
                totalCandidates: fallback.totalCandidates,
                shortlisted: fallback.shortlisted,
                hired: fallback.hired,
                status: fallback.status as any,
            };
        });
    }, [workspaces]);

    const allRows = buildTableRows();

    useEffect(() => {
        const uniqueCompanies = Array.from(new Set(allRows.map((r) => r.name)));
        uniqueCompanies.forEach((company) => {
            if (company && logos[company] === undefined) {
                fetchLogo(company);
            }
        });
    }, [allRows, logos]);

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
            : activeFilter === "Has Open Jobs"
                ? searchedRows.filter((r) => r.totalJobs > 0)
                : activeFilter === "Needs Attention"
                    ? searchedRows.filter((r) => r.totalCandidates === 0 || r.status === "Paused")
                    : searchedRows.filter((r) => r.status === activeFilter);

    const filterCounts = {
        All: searchedRows.length,
        Active: searchedRows.filter((r) => r.status === "Active").length,
        Paused: searchedRows.filter((r) => r.status === "Paused").length,
        Inactive: searchedRows.filter((r) => r.status === "Inactive").length,
        "Has Open Jobs": searchedRows.filter((r) => r.totalJobs > 0).length,
        "Needs Attention": searchedRows.filter((r) => r.totalCandidates === 0 || r.status === "Paused").length,
    };

    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

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
            setActiveJobFilter("All");
            setJobSearchQuery("");
        }
    };

    const workspaceJobs = allJobs.filter(j => j.workspace_details?.id === selectedWorkspace?.id);

    const filteredWorkspaceJobs = workspaceJobs.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(jobSearchQuery.toLowerCase());
        const matchesFilter = activeJobFilter === "All"
            ? true
            : j.status === (activeJobFilter === "Draft" ? "DRAFT" : "PUBLISHED");
        return matchesSearch && matchesFilter;
    });

    if (selectedWorkspace) {
        return (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#F3F5F7]">
                {/* ── Header Spacer handle by global Header ── */}
                <div className="mb-6 invisible h-1" />

                {/* ── Company Info Card ── */}
                <div className="bg-white rounded-xl border border-[#D1D1D6] p-6 mb-6 flex items-center justify-between shadow-sm">
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
                                <span className="px-2 py-0.5 bg-[#EBFFEE] text-[#069855] text-[10px] font-medium rounded-full uppercase">Active</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
                                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.website || 'jupiter.money'}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.headquarters || 'Bengaluru, India'}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#8E8E93]" /> Est. {selectedWorkspace.company_research_data?.founded_year || '2019'}</span>
                                <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#8E8E93]" /> {selectedWorkspace.company_research_data?.industry || 'Fintech'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => showToast.info("Company detailed research view coming soon")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F5F5] border border-[#AEAEB2] rounded-md text-xs font-medium text-[#757575] hover:bg-gray-100 transition-colors"
                        >
                            View info <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#EBFFEE] border border-[#34C759] rounded-md text-sm font-medium text-[#14AE5C] hover:bg-[#D7FFE2] transition-colors">
                            <Star className="w-4 h-4 fill-current" /> {selectedWorkspace.company_research_data?.overall_rating || '4.2'} / 5
                        </button>
                        <button
                            onClick={() => showToast.info("Edit workspace coming soon")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#E7EDFF] border border-[#0F47F2] rounded-md text-sm font-medium text-[#0F47F2] hover:bg-[#D7E3FF] transition-colors"
                        >
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                            onClick={() => showToast.success("Navigating to create job...")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F47F2] rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-4 h-4" /> Create Job
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {[
                        { label: "Total Jobs", value: workspaceJobs.length, trend: "10% vs last month", trendColor: "text-[#069855]", icon: <Briefcase className="w-5 h-5 text-[#0F47F2]" /> },
                        { label: "Total Candidates", value: workspaceJobs.reduce((acc, j) => acc + (j.total_applied || 0), 0), trend: "+42 this month", trendColor: "text-[#009951]", icon: <Users className="w-5 h-5 text-[#0F47F2]" /> },
                        { label: "In Pipeline", value: workspaceJobs.reduce((acc, j) => acc + (j.pipeline_candidate_count || 0), 0), trend: "6 Need Action", trendColor: "text-[#FF8D28]", icon: <Route className="w-5 h-5 text-[#0F47F2]" /> },
                        { label: "Shortlisted", value: "26", trend: "Across 9 Jobs", trendColor: "text-[#009951]", icon: <UserCheck className="w-5 h-5 text-[#0F47F2]" /> },
                        { label: "Interview this week", value: "12", trend: "3% This Quarter", trendColor: "text-[#009951]", icon: <Calendar className="w-5 h-5 text-[#0F47F2]" /> },
                        { label: "Hired", value: "5", trend: "3% This Quarter", trendColor: "text-[#009951]", icon: <UserCircle className="w-5 h-5 text-[#0F47F2]" /> },
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
                <div className="bg-white rounded-xl shadow-sm border border-[#D1D1D6] overflow-hidden">
                    {/* Filters & Actions */}
                    <div className="p-5 border-b border-[#C7C7CC] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {(["All", "Active", "Paused", "Closed", "Draft"] as const).map((filter) => {
                                const count = filter === "All" ? workspaceJobs.length : workspaceJobs.filter(j => {
                                    if (filter === "Active") return j.status === "PUBLISHED";
                                    if (filter === "Draft") return j.status === "DRAFT";
                                    return false; // Paused/Closed not directly in status yet
                                }).length;

                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveJobFilter(filter)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeJobFilter === filter ? 'bg-[#0F47F2] text-white' : 'bg-white border border-[#C7C7CC] text-[#AEAEB2] hover:bg-gray-50'}`}
                                    >
                                        {filter} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5 border-b border-[#C7C7CC] flex flex-wrap items-center justify-between gap-4">
                        <div className="relative w-full max-w-[248px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                            <input
                                type="text"
                                placeholder="Search for Jobs"
                                value={jobSearchQuery}
                                onChange={(e) => setJobSearchQuery(e.target.value)}
                                className="w-full h-9 pl-10 pr-4 bg-white border border-[#AEAEB2] rounded-md text-xs text-[#4B5563] focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-3 py-2 border border-[#AEAEB2] rounded-md text-xs text-[#AEAEB2] hover:bg-gray-50 transition-colors">
                                <LayoutGrid className="w-4 h-4" /> Grid View
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-[#AEAEB2] rounded-md text-xs text-[#AEAEB2] hover:bg-gray-50 transition-colors">
                                <DownloadCloud className="w-4 h-4" /> Export CSV
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 border border-[#AEAEB2] rounded-md text-xs text-[#AEAEB2] hover:bg-gray-50 transition-colors">
                                <Calendar className="w-4 h-4" /> 24 Feb, 2026
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93] w-[270px]">Job Title</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Candidates</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Shortlisted</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Hired</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Days open</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">No of Position</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Last Active Date</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Stage</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93]">Status</th>
                                    <th className="px-5 py-4 text-sm font-normal text-[#8E8E93] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D1D1D6]">
                                {filteredWorkspaceJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm text-[#4B5563] font-medium">{job.title}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563]">{job.experience_min_years}-{job.experience_max_years} Yrs</span>
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563]">{job.salary_min || '??'} - {job.salary_max || '??'} LPA</span>
                                                    <span className="px-2 py-0.5 bg-[#F2F2F7] rounded-full text-[10px] text-[#8E8E93]">JD-{job.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-[#8E8E93]">{job.total_applied || 0}</td>
                                        <td className="px-5 py-4 text-sm text-[#8E8E93]">{job.shortlistedCount || 0}</td>
                                        <td className="px-5 py-4 text-sm text-[#8E8E93]">0</td>
                                        <td className="px-5 py-4 text-sm text-[#FF8D28]">-- Days</td>
                                        <td className="px-5 py-4 text-sm text-[#8E8E93]">{job.count || 1}</td>
                                        <td className="px-5 py-4 text-sm text-[#8E8E93]">{new Date(job.updated_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm text-[#4B5563]">F2F Interview</span>
                                                <div className="flex gap-0.5">
                                                    <div className="w-8 h-1 rounded bg-[#FFCC00]"></div>
                                                    <div className="w-8 h-1 rounded bg-[#00C8B3]"></div>
                                                    <div className="w-8 h-1 rounded bg-[#6155F5]"></div>
                                                    <div className="w-8 h-1 rounded bg-[#C7C7CC]"></div>
                                                    <div className="w-8 h-1 rounded bg-[#C7C7CC]"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${job.status === 'PUBLISHED' ? 'bg-[#EBFFEE] text-[#069855]' : 'bg-[#F2F2F7] text-gray-500'}`}>
                                                {job.status === 'PUBLISHED' ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="w-8 h-8 flex items-center justify-center bg-[#E7EDFF] text-[#0F47F2] rounded-md hover:bg-[#D7E3FF] transition-colors">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="w-8 h-8 flex items-center justify-center bg-[#F2F2F7] text-[#4B5563] rounded-md hover:bg-[#E5E7EB] transition-colors">
                                                    <Pause className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredWorkspaceJobs.length === 0 && !jobsLoading && (
                                    <tr>
                                        <td colSpan={10} className="px-5 py-10 text-center text-[#8E8E93]">No jobs found for this criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-4">
                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {companyStatCards.map((stat) => {
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

                            <div className="flex items-center gap-2 flex-wrap p-4">
                                {(
                                    ["All", "Active", "Paused", "Inactive", "Needs Attention"] as const
                                ).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => {
                                            setActiveFilter(f);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeFilter === f
                                            ? "bg-[#0F47F2] text-white"
                                            : "text-[#4B5563] bg-white hover:bg-[#F3F5F7]"
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
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#4B5563] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                                    >
                                        <DownloadCloud className="w-4 h-4 text-[#AEAEB2]" /> Export CSV
                                    </button>

                                    {/* Date Picker Mock */}
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#4B5563] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                                    >
                                        <Calendar className="w-4 h-4 text-[#AEAEB2]" /> 24 Feb, 2026
                                    </button>

                                    {/* Add Company Split Button */}
                                    <div className="flex items-center relative">
                                        <button
                                            className="bg-[#0F47F2] text-white px-4 py-2 rounded-l-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 h-9"
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#F3F5F7]">
                                            <tr>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Company
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Total Jobs
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Total Candidates
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Shortlisted
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Hired
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-4 py-4 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                                        Loading companies...
                                                    </td>
                                                </tr>
                                            ) : paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                                        No companies found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map((row) => {
                                                    const status = statusStyles[row.status] || statusStyles.Active;
                                                    return (
                                                        <tr
                                                            key={row.id}
                                                            onClick={() => handleWorkspaceClick(row.workspaceId)}
                                                            className="hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                                                        >
                                                            {/* Company Title */}
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-[#F3F5F7] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                                                                        {logos[row.name] ? (
                                                                            <img src={logos[row.name]!} alt={row.name} className="w-full h-full object-contain" />
                                                                        ) : (
                                                                            <span className="text-lg font-bold text-[#8E8E93]">{row.name.charAt(0)}</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium text-black">
                                                                            {row.name}
                                                                        </span>
                                                                        <span className="text-xs text-[#8E8E93]">
                                                                            {row.domain}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Total Jobs */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                                                                {row.totalJobs}
                                                            </td>

                                                            {/* Total Candidates */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                                                                {row.totalCandidates}
                                                            </td>

                                                            {/* Shortlisted */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                                                                {row.shortlisted}
                                                            </td>

                                                            {/* Hired */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[#4B5563]">
                                                                {row.hired}
                                                            </td>

                                                            {/* Status */}
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase ${status.bg} ${status.text}`}
                                                                >
                                                                    {row.status}
                                                                </span>
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleWorkspaceClick(row.workspaceId);
                                                                        }}
                                                                        className="p-1 px-3 py-1.5 flex items-center gap-1 bg-[#E7EDFF] text-[#0F47F2] rounded-md hover:bg-[#D7E3FF] transition-colors text-[10px] font-medium"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" /> View
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

                                {/* Pagination */}
                                {!loading && totalPages > 1 && (
                                    <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
                                        <div className="text-xs text-[#8E8E93]">
                                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRows.length)} of {filteredRows.length} companies
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            {getPageNumbers().map((num, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => typeof num === 'number' && setCurrentPage(num)}
                                                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${currentPage === num ? 'bg-[#0F47F2] text-white' : 'hover:bg-gray-100 text-[#4B5563]'}`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>

                {/* ── Right Content Sidebar ── */}
                <div className="w-full lg:w-96 flex flex-col gap-4">
                    {/* Placeholder for future sidebar items if needed */}
                </div>
            </div>

            {/* Modals */}
            <CreateWorkspaceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchWorkspaces} />
            <JoinWorkspaceModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
            <PendingRequestsModal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)} />
        </div>
    );
}
