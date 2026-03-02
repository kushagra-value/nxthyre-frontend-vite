import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
    organizationService,
    MyWorkspace,
    CompanyResearchData,
} from "../services/organizationService";
import { jobPostService, Job } from "../services/jobPostService";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Plus,
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
import CreateWorkspaceModal from "./companies/components/CreateWorkspaceModal";
import JoinWorkspaceModal from "./companies/components/JoinWorkspaceModal";
import PendingRequestsModal from "./companies/components/PendingRequestsModal";
import CreateJobRoleModal from "../components/candidatePool/CreateJobRoleModal";
import EditJobRoleModal from "../components/candidatePool/EditJobRoleModal";
import { showToast } from "../utils/toast";
import CompanyInfoDrawer from "./companies/components/CompanyInfoDrawer";
import JobListing from "./companies/components/JobListing";
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


    const [isActionView, setIsActionView] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState<MyWorkspace | null>(null);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);

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
            const workspaceJobs = allJobs.filter(j => j.workspace_details?.id === ws.id);

            return {
                id: `ws-${ws.id}`,
                workspaceId: ws.id,
                name: ws.name,
                domain: ws.company_research_data?.website || "--",
                totalJobs: workspaceJobs.length || "--",
                totalCandidates: "--",
                shortlisted: "--",
                shortlistedTrend: undefined,
                hired: "--",
                hiredTrend: undefined,
                lastActiveDate: ws.company_research_data?.research_date
                    ? new Date(ws.company_research_data.research_date).toLocaleDateString('en-GB')
                    : "--",
                status: (ws.id % 3 === 0 ? "Paused" : ws.id % 5 === 0 ? "Inactive" : "Active") as any,
            };
        });
    }, [workspaces, allJobs]);

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
                ? searchedRows.filter((r) => (Number(r.totalJobs) || 0) > 0)
                : activeFilter === "Needs Attention"
                    ? searchedRows.filter((r) => (Number(r.totalCandidates) || 0) === 0 || r.status === "Paused")
                    : searchedRows.filter((r) => r.status === activeFilter);

    const filterCounts = {
        All: searchedRows.length,
        Active: searchedRows.filter((r) => r.status === "Active").length,
        Paused: searchedRows.filter((r) => r.status === "Paused").length,
        Inactive: searchedRows.filter((r) => r.status === "Inactive").length,
        "Has Open Jobs": searchedRows.filter((r) => (Number(r.totalJobs) || 0) > 0).length,
        "Needs Attention": searchedRows.filter((r) => (Number(r.totalCandidates) || 0) === 0 || r.status === "Paused").length,
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
            <JobListing
                selectedWorkspace={selectedWorkspace}
                setSelectedWorkspace={setSelectedWorkspace}
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
            />
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

                            <div className="flex items-center justify-between p-4 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap">
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
                                <button className="flex items-center gap-2 text-[#AEAEB2] hover:text-[#414141] transition-colors p-2 rounded-lg border border-[#D1D1D6] text-xs">
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
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
                                    >
                                        <DownloadCloud className="w-4 h-4 text-[#AEAEB2]" /> Export CSV
                                    </button>

                                    {/* Date Picker Mock */}
                                    <button
                                        className="flex items-center gap-2 px-3 py-2 bg-white text-[#AEAEB2] border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-[#F3F5F7] transition-colors"
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
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2]">
                                                    Company
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Jobs
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Candidates
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Shortlisted
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Hired
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Last Active Date
                                                </th>
                                                <th className="px-6 py-4 text-[13px] font-normal text-[#AEAEB2] text-center">
                                                    Status
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
                                                                    <p className="text-sm font-normal text-[#0F47F2] hover:underline hover:text-blue-700 transition-colors truncate max-w-[200px]">
                                                                        {row.name}
                                                                    </p>
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
                                                                    className={`px-3 py-1 rounded-full text-[12px] font-medium ${sty.bg} ${sty.text}`}
                                                                >
                                                                    {row.status}
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

                                                                    {row.status === 'Active' ? (
                                                                        <button
                                                                            className="p-1.5 text-gray-400 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                                                                        >
                                                                            <Pause className="w-4 h-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="p-1.5 text-[#069855] bg-green-50 rounded-full hover:bg-green-100 transition-colors"
                                                                        >
                                                                            <Play className="w-4 h-4 fill-current" />
                                                                        </button>
                                                                    )}
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
                        <div
                            className="bg-white rounded-xl p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-black">Immediate Actions</h3>
                                <button
                                    className="text-xs font-medium text-[#4B5563] border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsActionView(true)}
                                >
                                    Hide Activities
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {/* Hardcoded or mapped items, we'll map dummy data but match image styling perfectly */}
                                <div className="p-4 bg-[#F9FAFB] rounded-lg" style={{ border: "0.5px solid #E5E7EB" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-[#0F47F2]">Jupiter Money</p>
                                        <div className="w-6 h-6 rounded-full bg-[#0F47F2] flex items-center justify-center shadow-sm">
                                            <Star className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-[#4B5563] mb-4 leading-relaxed">
                                        Max Verstappen (85% match) hasn't been contacted for JD-112. Autopilot can send outreach now.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button className="py-1.5 px-3 bg-[#E7EDFF] text-[#0F47F2] text-xs font-semibold rounded-md hover:bg-[#D7E3FF] transition-colors">
                                            Approve Outreach
                                        </button>
                                        <span className="text-xs text-[#AEAEB2] font-medium">09:00 AM</span>
                                        <ArrowRight className="w-4 h-4 text-[#AEAEB2] ml-auto" />
                                    </div>
                                </div>

                                <div className="p-4 bg-[#F9FAFB] rounded-lg" style={{ border: "0.5px solid #E5E7EB" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-[#0F47F2]">Slice</p>
                                    </div>
                                    <p className="text-[13px] text-[#4B5563] mb-4 leading-relaxed">
                                        Close Senior Dev role. 3 candidates in final stage, push to offer.
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button className="py-1.5 px-3 bg-[#FFF7D6] text-[#D97706] text-xs font-semibold rounded-md hover:bg-[#FDE68A] transition-colors">
                                            Take Action
                                        </button>
                                        <span className="text-xs text-[#AEAEB2] font-medium">4 Days ago</span>
                                        <ArrowRight className="w-4 h-4 text-[#AEAEB2] ml-auto" />
                                    </div>
                                </div>

                                <div className="p-4 bg-[#F9FAFB] rounded-lg" style={{ border: "0.5px solid #E5E7EB" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-[#0F47F2]">Medcore Solutions</p>
                                    </div>
                                    <p className="text-[13px] text-[#4B5563] mb-4 leading-relaxed">
                                        Client Check in needed. No updated in 2 weeks
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button className="py-1.5 px-3 bg-[#E7EDFF] text-[#0F47F2] text-xs font-semibold rounded-md hover:bg-[#D7E3FF] transition-colors">
                                            Take Actions
                                        </button>
                                        <span className="text-xs text-[#AEAEB2] font-medium">09:00 AM</span>
                                        <ArrowRight className="w-4 h-4 text-[#AEAEB2] ml-auto" />
                                    </div>
                                </div>
                                <div className="p-4 bg-[#F9FAFB] rounded-lg" style={{ border: "0.5px solid #E5E7EB" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-semibold text-[#0F47F2]">Racing Williams</p>
                                        <div className="w-6 h-6 rounded-full bg-[#0F47F2] flex items-center justify-center shadow-sm">
                                            <Star className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-[#4B5563] mb-4 leading-relaxed">
                                        Candidates haven't responded to follow-up, Autopilot
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div
                            className="bg-white rounded-xl p-5"
                            style={{ border: "0.5px solid #D1D1D6" }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-sm font-semibold text-black">Recent Activities</h3>
                                <button className="text-xs font-medium text-[#4B5563] border border-[#E5E7EB] bg-white px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
                                    Today
                                </button>
                            </div>

                            <div className="mb-3">
                                <h4 className="text-xs font-semibold text-[#4B5563]">Today · Feb 20</h4>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between pb-3 border-b border-[#F3F5F7]">
                                    <div>
                                        <p className="text-sm font-medium text-[#0F47F2] mb-0.5">RocketGrowth Inc</p>
                                        <p className="text-[13px] text-[#4B5563]">New job posted - ML Engineer</p>
                                        <p className="text-[11px] text-[#AEAEB2] mt-0.5">JD-108 · Full-time · Delhi</p>
                                    </div>
                                    <span className="text-xs text-[#AEAEB2] font-medium mt-1">10:45 AM</span>
                                </div>

                                <div className="flex items-start justify-between pb-3 border-b border-[#F3F5F7]">
                                    <div>
                                        <p className="text-sm font-medium text-[#0F47F2] mb-0.5">Acme Technologies</p>
                                        <p className="text-[13px] text-[#4B5563]">Priya Patel hired</p>
                                        <p className="text-[11px] text-[#AEAEB2] mt-0.5">Senior Product Designer · JD-101</p>
                                    </div>
                                    <span className="text-xs text-[#AEAEB2] font-medium mt-1">09:45 AM</span>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-[#0F47F2] mb-0.5">Jupiter Money</p>
                                        <p className="text-[13px] text-[#4B5563]">Shortlist sent to client</p>
                                        <p className="text-[11px] text-[#AEAEB2] mt-0.5">4 candidates · ML Engineer · JD-102</p>
                                    </div>
                                    <span className="text-xs text-[#AEAEB2] font-medium mt-1">08:15 AM</span>
                                </div>
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
