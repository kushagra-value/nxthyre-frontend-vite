import React from "react";
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
    Pause
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
}) => {
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
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#8E8E93]" /> jupiter.money</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#8E8E93]" /> Bengaluru, Karnataka</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#8E8E93]" /> Est. 2019</span>
                            <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#8E8E93]" /> Fintech</span>
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
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#EBFFEE] border border-[#34C759] rounded-md text-sm font-medium text-[#14AE5C] hover:bg-[#D7FFE2] transition-colors">
                        <Star className="w-4 h-4 fill-current" /> 4.2 / 5
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#E7EDFF] border border-[#0F47F2] rounded-md text-sm font-medium text-[#0F47F2] hover:bg-[#D7E3FF] transition-colors">
                        <Plus className="w-4 h-4" /> Edit
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
                {/* Filters & Actions */}
                <div className="p-4 border-b border-[#C7C7CC] flex flex-wrap items-center justify-between gap-4">
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

                <div className="p-4 border-b border-[#C7C7CC] flex flex-wrap items-center justify-between gap-4">
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
                                    <td className="px-5 py-4 text-sm text-[#8E8E93]">{job.shortlisted_candidate_count || 0}</td>
                                    <td className="px-5 py-4 text-sm text-[#8E8E93]">--</td>
                                    <td className="px-5 py-4 text-sm text-[#FF8D28]">--</td>
                                    <td className="px-5 py-4 text-sm text-[#8E8E93]">--</td>
                                    <td className="px-5 py-4 text-sm text-[#8E8E93]">{new Date(job.updated_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-sm text-[#4B5563]">Sourcing</span>
                                            <div className="flex gap-0.5">
                                                <div className="w-8 h-1 rounded bg-[#FFCC00]"></div>
                                                <div className="w-8 h-1 rounded bg-[#C7C7CC]"></div>
                                                <div className="w-8 h-1 rounded bg-[#C7C7CC]"></div>
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
                                            <button
                                                onClick={() => {
                                                    setEditingJobId(job.id);
                                                    setShowEditJobRole(true);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-[#E7EDFF] text-[#0F47F2] rounded-md hover:bg-[#D7E3FF] transition-colors"
                                            >
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
