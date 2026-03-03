import React, { useState } from "react";
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
} from "lucide-react";
import { MyWorkspace } from "../../../services/organizationService";
import { Job } from "../../../services/jobPostService";
import CreateJobRoleModal from "../../../components/candidatePool/CreateJobRoleModal";
import EditJobRoleModal from "../../../components/candidatePool/EditJobRoleModal";
import CompanyInfoDrawer from "./CompanyInfoDrawer";

interface JobListingProps {
    selectedWorkspace: MyWorkspace;
    setSelectedWorkspace: (ws: MyWorkspace | null) => void;
    logos: Record<string, string | null | undefined>;
    workspaceJobs: Job[];
    activeJobFilter: "All" | "Active" | "Paused" | "Closed" | "Draft";
    setActiveJobFilter: (filter: "All" | "Active" | "Paused" | "Closed" | "Draft") => void;
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
    const totalPages = Math.max(1, Math.ceil(filteredWorkspaceJobs.length / ITEMS_PER_PAGE));
    const paginatedJobs = filteredWorkspaceJobs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkspaceJobs.length);

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
                            <span className="px-2 py-0.5 bg-[#EBFFEE] text-[#069855] text-[10px] font-medium rounded-full uppercase">Active</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#8E8E93]">
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#8E8E93]" /> --</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#8E8E93]" /> --</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#8E8E93]" /> --</span>
                            <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#8E8E93]" /> --</span>
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
                    { label: "Total Jobs", value: workspaceJobs.length, trend: "10% vs last month", trendColor: "text-[#069855]", icon: <Briefcase className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Total Candidates", value: workspaceJobs.reduce((acc, j) => acc + (j.total_applied || 0), 0), trend: "+42 this month", trendColor: "text-[#009951]", icon: <Users className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "In Pipeline", value: workspaceJobs.reduce((acc, j) => acc + (j.pipeline_candidate_count || 0), 0), trend: "6 Need Action", trendColor: "text-[#FF8D28]", icon: <Route className="w-5 h-5 text-[#0F47F2]" /> },
                    { label: "Shortlisted", value: workspaceJobs.reduce((acc, j) => acc + (j.shortlisted_candidate_count || 0), 0), trend: "Across 9 Jobs", trendColor: "text-[#009951]", icon: <UserCheck className="w-5 h-5 text-[#0F47F2]" /> },
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
                {/* Filters & Actions - first row */}
                <div className="p-4 border-b border-[#C7C7CC] flex items-center gap-2">
                    {(["All", "Active", "Paused", "Closed", "Draft"] as const).map((filter) => {
                        let count = 0;
                        if (filter === "All") count = workspaceJobs.length;
                        else if (filter === "Active") count = workspaceJobs.filter(j => j.status === "PUBLISHED" || j.status === "ACTIVE").length;
                        else if (filter === "Paused") count = workspaceJobs.filter(j => j.status === "PAUSED").length;
                        else if (filter === "Closed") count = workspaceJobs.filter(j => j.status === "CLOSED").length;
                        else if (filter === "Draft") count = workspaceJobs.filter(j => j.status === "DRAFT").length;

                        return (
                            <button
                                key={filter}
                                onClick={() => setActiveJobFilter(filter)}
                                className={`h-[30px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center
                    ${activeJobFilter === filter
                                        ? 'bg-[#0F47F2] text-white'
                                        : 'border border-[#C7C7CC] text-[#AEAEB2] hover:bg-gray-50'}`} // UPDATED: exact design pill (height, border, colors)
                            >
                                {filter} ({count})
                            </button>
                        );
                    })}
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

                        <button
                            disabled
                            title="Feature coming Soon"
                            className="flex items-center gap-2 px-3 py-2 border border-[#AEAEB2] rounded-md text-xs text-[#AEAEB2] opacity-50 cursor-not-allowed"
                        >
                            <LayoutGrid className="w-4 h-4" /> Grid View
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-[1486px] text-left table-fixed border-collapse"> {/* UPDATED: table-fixed + exact Figma width (1254 + 232 for 2 new columns) */}
                        <thead className="bg-[#F5F5F5]">
                            <tr>
                                <th className="w-[270px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Job Title</th>
                                <th className="w-[116px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Candidates</th>
                                <th className="w-[116px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Shortlisted</th>
                                <th className="w-[116px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Hired</th>
                                <th className="w-[108px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Days Open</th>
                                <th className="w-[128px] px-5 py-4 text-sm font-normal text-[#8E8E93]">No. of Position</th>
                                <th className="w-[144px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Last Active Date</th>
                                <th className="w-[250px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Stage</th>
                                <th className="w-[122px] px-5 py-4 text-sm font-normal text-[#8E8E93]">Status</th>
                                <th className="w-[116px] px-5 py-4 text-sm font-normal text-[#8E8E93] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D1D1D6]">
                            {paginatedJobs.map((job) => {
                                const daysOpen = "36"; // UPDATED: matches image (replace with real calc if needed)
                                const noOfPositions = "3"; // UPDATED: matches image

                                return (
                                    <tr key={job.id} className="h-[69px] hover:bg-gray-50 transition-colors"> {/* UPDATED: exact row height */}
                                        {/* Job Title */}
                                        <td className="w-[270px] px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span
                                                    className="text-[14px] font-medium text-[#4B5563] leading-[17px] cursor-pointer hover:text-[#0F47F2] hover:underline transition-colors"
                                                    onClick={() => onJobSelect?.(job)}
                                                >{job.title}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563]">
                                                        {job.experience_min_years}-{job.experience_max_years} Yrs
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-[#E7EDFF] rounded-full text-[10px] text-[#4B5563]">
                                                        {formatSalaryToLPA(job.salary_min)} - {formatSalaryToLPA(job.salary_max)} LPA
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-[#F2F2F7] rounded-full text-[10px] text-[#8E8E93]">
                                                        JD-{job.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Candidates */}
                                        <td className="w-[116px] px-5 py-4 text-[14px] text-[#8E8E93] leading-[17px]">
                                            {job.total_applied || 0}
                                        </td>

                                        {/* Shortlisted */}
                                        <td className="w-[116px] px-5 py-4 text-[14px] text-[#8E8E93] leading-[17px]">
                                            {job.shortlisted_candidate_count || 0}
                                        </td>

                                        {/* Hired */}
                                        <td className="w-[116px] px-5 py-4 text-[14px] text-[#8E8E93] leading-[17px]">
                                            {"--"}
                                        </td>

                                        {/* Days Open */}
                                        <td className="w-[108px] px-5 py-4 text-[14px] text-[#FF8D28] leading-[17px]">
                                            {daysOpen} Days
                                        </td>

                                        {/* No. of Position */}
                                        <td className="w-[128px] px-5 py-4 text-[14px] text-[#8E8E93] leading-[17px]">
                                            {noOfPositions}
                                        </td>

                                        {/* Last Active Date */}
                                        <td className="w-[144px] px-5 py-4 text-[14px] text-[#8E8E93] leading-[17px]">
                                            {new Date(job.updated_at).toLocaleDateString('en-GB')}
                                        </td>

                                        {/* Stage - 5 colored boxes */}
                                        <td className="w-[250px] px-5 py-4">
                                            <div className="flex gap-[5px]">
                                                {[
                                                    { color: '#FF8D28', value: job.total_applied || 52 },
                                                    { color: '#00C0E8', value: job.shortlisted_candidate_count || 24 },
                                                    { color: '#00C3D0', value: 12 },
                                                    { color: '#6155F5', value: 10 },
                                                    { color: '#0088FF', value: 2 },
                                                ].map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-[39.76px] h-[24px] rounded-[5px] flex items-center justify-center text-white text-[14px] leading-[17px]"
                                                        style={{ backgroundColor: item.color }}
                                                    >
                                                        {item.value}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="w-[122px] px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[14px] font-medium leading-[17px] ${(job.status === 'PUBLISHED' || job.status === 'ACTIVE')
                                                ? 'bg-[#EBFFEE] text-[#069855]'
                                                : job.status === 'CLOSED'
                                                    ? 'bg-[#F5F5F5] text-black'
                                                    : 'bg-[#F2F2F7] text-[#4B5563]'
                                                }`}>
                                                {(job.status === 'PUBLISHED' || job.status === 'ACTIVE') ? 'Active'
                                                    : job.status === 'CLOSED' ? 'Closed'
                                                        : job.status === 'PAUSED' ? 'Paused' : 'Draft'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="w-[116px] px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingJobId(job.id);
                                                        setShowEditJobRole(true);
                                                    }}
                                                    className="w-6 h-6 bg-[#E7EDFF] border border-white rounded-[5px] flex items-center justify-center hover:bg-[#D7E3FF]"
                                                >
                                                    <Pencil className="w-4 h-4 text-[#0F47F2]" />
                                                </button>
                                                <button
                                                    disabled
                                                    title="Feature coming Soon"
                                                    className="w-6 h-6 bg-[#F2F2F7] border border-white rounded-[5px] flex items-center justify-center opacity-50 cursor-not-allowed"
                                                >
                                                    <Pause className="w-[14px] h-[14px] text-[#4B5563]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredWorkspaceJobs.length === 0 && !jobsLoading && (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-[#8E8E93]">
                                        No jobs found for this criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-4 flex items-center justify-between border-t border-[#D1D1D6]">
                    <div className="text-[12px] text-[#6B7280]">
                        {filteredWorkspaceJobs.length > 0
                            ? `Showing ${startIdx}–${endIdx} of ${filteredWorkspaceJobs.length} jobs`
                            : 'No jobs to display'}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-[30px] h-[30px] border border-[#E5E7EB] rounded-[8px] text-sm flex items-center justify-center transition-colors ${currentPage === 1 ? 'text-[#D1D1D6] cursor-not-allowed' : 'text-[#6B7280] hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="w-[30px] h-[30px] flex items-center justify-center text-[#6B7280] text-sm">…</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-[30px] h-[30px] text-sm font-medium rounded-[8px] transition-colors ${currentPage === page
                                            ? 'bg-[#0F47F2] text-white'
                                            : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-[30px] h-[30px] border border-[#E5E7EB] rounded-[8px] text-sm flex items-center justify-center transition-colors ${currentPage === totalPages ? 'text-[#D1D1D6] cursor-not-allowed' : 'text-[#6B7280] hover:bg-gray-50'
                                    }`}
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
        </div>
    );
};

export default JobListing;
