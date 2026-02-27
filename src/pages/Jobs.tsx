import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import { jobPostService } from "../services/jobPostService";
import { showToast } from "../utils/toast";
import CreateJobRoleModal from "../components/candidatePool/CreateJobRoleModal";
import EditJobRoleModal from "../components/candidatePool/EditJobRoleModal";
import {
  organizationService,
  MyWorkspace,
} from "../services/organizationService";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Bot,
  Check,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  jobStatCards,
  jobTableRows,
  aiAutopilotItems,
  jobRecentActivities,
  JobTableRow,
} from "./jobs/jobsData";

const autopilotIconMap: Record<string, React.ReactNode> = {
  red: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2L13 8L19 9L14.5 13.5L15.5 19L10 16L4.5 19L5.5 13.5L1 9L7 8L10 2Z" stroke="#F87171" strokeWidth="1.5" fill="none" /></svg>
  ),
  amber: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2V18M3 10H17" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" /><path d="M5 5L15 15M15 5L5 15" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
  blue: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" /><path d="M4 10C4 10 5 9 8 9C11 9 13 11 16 11" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" /><path d="M4 5C4 5 5 4 8 4C11 4 13 6 16 6" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" /></svg>
  ),
};

// ──────────────────────────────────────────────
//  Types from existing code
// ──────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  location: string;
  companyName: string;
  experience: string;
  workApproach: string;
  joiningTimeline: string;
  inboundCount: number;
  shortlistedCount: number;
  totalApplied: number;
  totalReplied: number;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
  invites_sent: number;
  postedAgo: string;
  workspace_details?: { id: number; name: string };
}

interface Workspace {
  id: number;
  name: string;
}

interface JobsProps {
  onSelectJob?: (jobId: number) => void;
}

// ──────────────────────────────────────────────
//  Pipeline Badge Component
// ──────────────────────────────────────────────

function PipelineBadge({
  label,
  count,
  highlight,
}: {
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-[#AEAEB2] uppercase">
        {label}
      </span>
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${highlight
          ? "bg-[#0F47F2] text-white font-semibold"
          : "bg-[#F3F5F7] text-[#4B5563]"
          }`}
      >
        {count}
      </span>
    </div>
  );
}

function PipelineConnector() {
  return <div className="h-[1px] w-3 bg-[#E5E7EB] self-end mb-[11px]" />;
}

// ──────────────────────────────────────────────
//  Status Badge
// ──────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string }> = {
  Active: { bg: "bg-[#DEF7EC]", text: "text-[#03543F]" },
  Paused: { bg: "bg-[#FFF7D6]", text: "text-[#92400E]" },
  Closed: { bg: "bg-[#F3F5F7]", text: "text-[#8E8E93]" },
};

// ──────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────

export default function Jobs({ onSelectJob }: JobsProps) {
  const { isAuthenticated } = useAuth();
  const { selectedWorkspaceId } = useAuthContext();

  // Real data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [logos, setLogos] = useState<Record<string, string | null | undefined>>({});
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [showEditJobRole, setShowEditJobRole] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  // Table filter & search
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Active" | "Paused" | "Closed" | "Draft" | "Needs Attention"
  >("All");
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
        },
      );
      const data = await response.json();
      const logoUrl = data.length > 0 ? data[0].logo_url : null;
      setLogos((prev) => ({ ...prev, [query]: logoUrl }));
    } catch (error) {
      setLogos((prev) => ({ ...prev, [query]: undefined }));
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const past = new Date(dateString);
    if (isNaN(past.getTime())) return "Invalid date";
    const now = new Date();
    let years = now.getFullYear() - past.getFullYear();
    let months = now.getMonth() - past.getMonth();
    let days = now.getDate() - past.getDate();
    if (days < 0) {
      months--;
      const daysInPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      ).getDate();
      days += daysInPrevMonth;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    return "today";
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const jobs = await jobPostService.getJobs();
      let filteredJobs = jobs;
      if (debouncedProjectSearch.trim()) {
        const query = debouncedProjectSearch.toLowerCase();
        filteredJobs = jobs.filter((job: any) => {
          const titleMatch = job.title?.toLowerCase().includes(query);
          const companyMatch =
            job.organization_details?.name?.toLowerCase().includes(query) ||
            job.workspace_details?.name?.toLowerCase().includes(query);
          const skillsMatch = job.skills?.some((skill: string) =>
            skill.toLowerCase().includes(query),
          );
          return titleMatch || companyMatch || skillsMatch;
        });
      }
      const mappedCategories: Category[] = filteredJobs.map((job: any) => {
        const minExp = job.experience_min_years ?? 0;
        const maxExp = job.experience_max_years;
        const experience = maxExp
          ? `${minExp}+ years`
          : minExp === 1
            ? "1+ year"
            : `${minExp}+ years`;
        const location = job.location[0];
        let workApproach = "Hybrid";
        if (job.work_approach === "ONSITE") workApproach = "Onsite";
        else if (job.work_approach === "REMOTE") workApproach = "Remote";
        const companyName = job.workspace_details?.name || "Confidential";
        return {
          id: job.id,
          name: job.title,
          companyName,
          experience,
          location,
          workApproach,
          joiningTimeline: "Immediate",
          inboundCount: job.inbound_count || 0,
          shortlistedCount: job.shortlisted_candidate_count || 0,
          totalApplied: job.total_applied || 0,
          totalReplied: job.total_replied || 0,
          status: job.status,
          visibility: job.visibility,
          invites_sent: job.invites_sent || 0,
          postedAgo: job.created_at ? getTimeAgo(job.created_at) : "today",
        };
      });
      setCategories(mappedCategories);
      setCurrentPage(1);
    } catch (error) {
      showToast.error("Failed to fetch job categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCategories();
  }, [isAuthenticated, debouncedProjectSearch]);

  useEffect(() => {
    if (categories.length > 0) {
      const uniqueCompanies = Array.from(new Set(categories.map((c) => c.companyName)));
      uniqueCompanies.forEach((company) => {
        if (company && company !== "Confidential" && logos[company] === undefined) {
          fetchLogo(company);
        }
      });
    }
  }, [categories, logos]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const workspaceData = await organizationService.getMyWorkspaces();
        setWorkspaces(
          workspaceData.map((ws: MyWorkspace) => ({ id: ws.id, name: ws.name })),
        );
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };
    if (isAuthenticated) fetchWorkspaces();
  }, [isAuthenticated]);

  const handleEditJobRole = async (jobId: number) => {
    try {
      const jobs = await jobPostService.getJobs();
      const job = jobs.find((j: any) => j.id === jobId);
      if (job) {
        setEditingJobId(job.id);
        setShowEditJobRole(true);
      } else showToast.error("Job not found");
    } catch (error) {
      showToast.error("Failed to fetch job details");
    }
  };

  const handlePublishJobRole = async (jobId: number) => {
    try {
      await jobPostService.updateJob(jobId, {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      });
      await fetchCategories();
      showToast.success("Job published successfully");
    } catch (error) {
      showToast.error("Failed to publish job");
    }
  };

  const handleUnpublishJobRole = async (jobId: number) => {
    try {
      await jobPostService.unpublishJob(jobId);
      await jobPostService.updateJob(jobId, {
        status: "DRAFT",
        visibility: "PRIVATE",
      });
      await fetchCategories();
      showToast.success("Job unpublished successfully");
    } catch (error) {
      showToast.error("Failed to unpublish job");
    }
  };

  const handleSharePipelines = (jobId: number) => {
    window.location.href = `/pipelines/${jobId}`;
  };

  // ── Build table data ──
  // Merge real API data into the dummy table where possible,
  // falling back to dummy for un-mapped rows.
  const buildTableRows = useCallback((): JobTableRow[] => {
    if (categories.length === 0) return jobTableRows;

    const apiRows: JobTableRow[] = categories.map((cat) => ({
      id: `api-${cat.id}`,
      jobId: cat.id,
      title: cat.name,
      code: `JD-${cat.id}`,
      type: cat.workApproach,
      locationType: cat.location || "Remote",
      company: cat.companyName,
      pipeline: {
        sourced: cat.inboundCount,
        screened: cat.shortlistedCount,
        interview: 0,
        hired: 0,
      },
      daysOpen: 0,
      status: cat.status === "PUBLISHED" ? "Active" : "Paused",
    }));
    return apiRows;
  }, [categories]);

  const allRows = buildTableRows();

  // Fetch logos for table row companies (works for both API and dummy data)
  useEffect(() => {
    const uniqueCompanies = Array.from(new Set(allRows.map((r) => r.company)));
    uniqueCompanies.forEach((company) => {
      if (company && company !== "Confidential" && logos[company] === undefined) {
        fetchLogo(company);
      }
    });
  }, [allRows, logos]);

  // Search + Filter
  const searchedRows = jobSearchQuery.trim()
    ? allRows.filter((r) =>
      r.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      r.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(jobSearchQuery.toLowerCase())
    )
    : allRows;

  const filteredRows =
    activeFilter === "All"
      ? searchedRows
      : activeFilter === "Needs Attention"
        ? searchedRows.filter((r) => r.pipeline.sourced === 0 || r.daysOpen > 30)
        : activeFilter === "Draft"
          ? searchedRows.filter((r) => r.status === "Paused") // Draft maps to Paused/unpublished
          : searchedRows.filter((r) => r.status === activeFilter);

  // Filter counts (computed from searchedRows)
  const filterCounts = {
    All: searchedRows.length,
    Active: searchedRows.filter((r) => r.status === "Active").length,
    Paused: searchedRows.filter((r) => r.status === "Paused").length,
    Closed: searchedRows.filter((r) => r.status === "Closed").length,
    Draft: searchedRows.filter((r) => r.status === "Paused").length,
    "Needs Attention": searchedRows.filter(
      (r) => r.pipeline.sourced === 0 || r.daysOpen > 30,
    ).length,
  };

  // Pagination
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  // Build page range with ellipsis
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

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="space-y-6">
        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {jobStatCards.map((stat) => {
            const isAction = stat.id === "js-5";
            return (
              <div
                key={stat.id}
                className="bg-white rounded-xl flex flex-col"
                style={{ padding: "20px", gap: "8px", border: "0.5px solid #D1D1D6" }}
              >
                <p className="text-[12px] font-normal text-[#4B5563] leading-[14px]">
                  {stat.label}
                </p>
                <div className="flex items-end justify-between">
                  <span
                    className={`font-medium leading-[40px] ${isAction ? "text-[#DC2626]" : "text-black"}`}
                    style={{ fontSize: "32px" }}
                  >
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span
                      className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${stat.trendColor === "green"
                        ? "text-[#069855] bg-[#DEF7EC]"
                        : "text-[#DC2626] bg-[#FEE2E2]"
                        }`}
                    >
                      {stat.trend}
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  )}
                  {stat.subText && (
                    <span className="text-xs font-normal text-[#AEAEB2]">
                      {stat.subText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: All Jobs Table ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="bg-white rounded-xl overflow-hidden" style={{ border: "0.5px solid #D1D1D6" }}>
              {/* Title Row */}
              <div
                className="px-5 pt-5 pb-3 flex items-center justify-between"
              >
                <h2 className="text-base font-medium text-black">All Jobs</h2>
                <button
                  onClick={() => setShowCreateJobRole(true)}
                  className="flex items-center gap-1.5 bg-[#0F47F2] text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Post New Job
                </button>
              </div>

              {/* Filter + Search Row */}
              <div
                className="px-5 pb-4 flex flex-wrap items-center justify-between gap-3"
                style={{ borderBottom: "0.5px solid #E5E7EB" }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {(["All", "Active", "Paused", "Closed", "Draft", "Needs Attention"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setActiveFilter(f);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f
                          ? "bg-[#0F47F2] text-white"
                          : "text-[#4B5563] hover:bg-[#F3F5F7]"
                        }`}
                      style={
                        activeFilter !== f
                          ? { border: "0.5px solid #D1D1D6" }
                          : undefined
                      }
                    >
                      {f}{" "}
                      <span className={activeFilter === f ? "text-white/70" : "text-[#AEAEB2]"}>
                        ({filterCounts[f]})
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobSearchQuery}
                    onChange={(e) => {
                      setJobSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#F9FAFB] text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 transition-shadow"
                    style={{ border: "0.5px solid #D1D1D6" }}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                        Pipeline
                      </th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                        Days Open
                      </th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F5F7]">
                    {loadingCategories ? (
                      // Skeleton rows while loading
                      [...Array(5)].map((_, i) => (
                        <tr key={`skel-${i}`} className="animate-pulse">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-md bg-gray-200 shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 bg-gray-200 rounded w-36" />
                                <div className="h-2.5 bg-gray-100 rounded w-28" />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-3.5 bg-gray-200 rounded w-24" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="flex flex-col items-center gap-1">
                                <div className="h-2 bg-gray-100 rounded w-5" />
                                <div className="h-5 bg-gray-200 rounded-full w-8" />
                              </div>
                              <div className="h-[1px] w-3 bg-gray-200" />
                              <div className="flex flex-col items-center gap-1">
                                <div className="h-2 bg-gray-100 rounded w-5" />
                                <div className="h-5 bg-gray-200 rounded-full w-8" />
                              </div>
                              <div className="h-[1px] w-3 bg-gray-200" />
                              <div className="flex flex-col items-center gap-1">
                                <div className="h-2 bg-gray-100 rounded w-5" />
                                <div className="h-5 bg-gray-200 rounded-full w-8" />
                              </div>
                              <div className="h-[1px] w-3 bg-gray-200" />
                              <div className="flex flex-col items-center gap-1">
                                <div className="h-2 bg-gray-100 rounded w-5" />
                                <div className="h-5 bg-gray-200 rounded-full w-8" />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-3.5 bg-gray-200 rounded w-14" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-5 bg-gray-200 rounded-full w-14" />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded" />
                              <div className="w-6 h-6 bg-gray-200 rounded" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-sm text-[#AEAEB2]"
                        >
                          No jobs found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => {
                        const sty = statusStyles[row.status] || statusStyles.Active;
                        const companyLogo = logos[row.company];
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                            onClick={() => onSelectJob?.(row.jobId)}
                          >
                            {/* Job Title */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-[#F3F5F7] flex items-center justify-center shrink-0 overflow-hidden">
                                  {companyLogo ? (
                                    <img
                                      src={companyLogo}
                                      alt={row.company}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-[11px] font-semibold text-[#8E8E93]">
                                      {row.company.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-black truncate">
                                    {row.title}
                                  </p>
                                  <p className="text-[11px] text-[#AEAEB2]">
                                    {row.code} • {row.type} • {row.locationType}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Company */}
                            <td className="px-5 py-4">
                              <p className="text-sm font-normal text-[#4B5563]">
                                {row.company}
                              </p>
                            </td>

                            {/* Pipeline */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <PipelineBadge
                                  label="Src"
                                  count={row.pipeline.sourced}
                                  highlight={row.pipeline.highlightStage === 0}
                                />
                                <PipelineConnector />
                                <PipelineBadge
                                  label="Scr"
                                  count={row.pipeline.screened}
                                  highlight={row.pipeline.highlightStage === 1}
                                />
                                <PipelineConnector />
                                <PipelineBadge
                                  label="Int"
                                  count={row.pipeline.interview}
                                  highlight={row.pipeline.highlightStage === 2}
                                />
                                <PipelineConnector />
                                <PipelineBadge
                                  label="Hird"
                                  count={row.pipeline.hired}
                                  highlight={row.pipeline.highlightStage === 3}
                                />
                              </div>
                            </td>

                            {/* Days Open */}
                            <td className="px-5 py-4">
                              <p className="text-sm font-normal text-[#4B5563]">
                                {row.daysOpen} days
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${sty.bg} ${sty.text}`}
                              >
                                {row.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right">
                              <div
                                className="flex items-center justify-end gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="p-1.5 text-[#AEAEB2] hover:text-[#0F47F2] transition-colors"
                                  title="View"
                                  onClick={() => handleSharePipelines(row.jobId)}
                                >
                                  <Eye className="w-[18px] h-[18px]" />
                                </button>
                                <button
                                  className="p-1.5 text-[#AEAEB2] hover:text-[#0F47F2] transition-colors"
                                  title="Edit"
                                  onClick={() => handleEditJobRole(row.jobId)}
                                >
                                  <Pencil className="w-[18px] h-[18px]" />
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
              <div
                className="px-5 py-3 flex items-center justify-center border-t"
                style={{ borderColor: "#F3F5F7" }}
              >
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#AEAEB2] hover:bg-[#F3F5F7] disabled:opacity-30 transition-colors"
                    style={{ border: "0.5px solid #D1D1D6" }}
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
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === p
                          ? "bg-[#0F47F2] text-white"
                          : "text-[#4B5563] hover:bg-[#F3F5F7]"
                          }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#AEAEB2] hover:bg-[#F3F5F7] disabled:opacity-30 transition-colors"
                    style={{ border: "0.5px solid #D1D1D6" }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </section>
          </div>

          {/* ─── Right: AI Autopilot + Recent Activities ─── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* AI Autopilot */}
            <div
              className="bg-white rounded-xl p-5"
              style={{ border: "0.5px solid #D1D1D6" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-sm font-medium text-black">AI Autopilot</h3>
                </div>
                <span className="px-1.5 py-0.5 bg-[#2563EB] text-[10px] text-white font-semibold rounded">
                  AI
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {aiAutopilotItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg"
                    style={{ border: "0.5px solid #E5E7EB" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {autopilotIconMap[item.iconColor]}
                      <p className="text-[11px] font-semibold text-[#4B5563] uppercase tracking-tight">
                        {item.role} • {item.company}
                      </p>
                    </div>
                    <p className="text-xs text-[#8E8E93] mb-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.actionType === "approve" && (
                      <button
                        className="w-full py-2 bg-white text-xs font-medium rounded flex items-center justify-center gap-1.5 hover:bg-[#F3F5F7] transition-colors"
                        style={{ border: "0.5px solid #D1D1D6" }}
                      >
                        <Check className="w-3.5 h-3.5 text-[#069855]" />
                        {item.actionLabel}
                      </button>
                    )}
                    {item.actionType === "review" && (
                      <button className="text-xs font-medium text-[#D97706] hover:underline">
                        {item.actionLabel}
                      </button>
                    )}
                    {item.actionType === "auto" && (
                      <span className="px-2 py-1 bg-[#DEF7EC] text-[#03543F] text-[10px] font-semibold rounded-full">
                        {item.actionLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div
              className="bg-white rounded-xl p-5"
              style={{ border: "0.5px solid #D1D1D6" }}
            >
              <h3 className="text-sm font-medium text-black mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Recent Activities
              </h3>
              <div className="flex flex-col gap-5 relative ml-[15px] border-l border-[#E5E7EB]">
                {jobRecentActivities.map((act) => (
                  <div key={act.id} className="relative flex items-start gap-3 pl-4">
                    {/* Dot on timeline */}
                    <div
                      className="absolute -left-[16px] top-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 z-10"
                      style={{ border: "0.5px solid #D1D1D6" }}
                    >
                      <span className="text-[10px] font-semibold text-[#0F47F2]">
                        {act.index}
                      </span>
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium text-black">
                          {act.role}
                        </p>
                        <ArrowRight className="w-3.5 h-3.5 text-[#D1D1D6]" />
                      </div>
                      <p className="text-xs text-[#AEAEB2] mb-1.5">{act.company}</p>
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        {act.description}
                      </p>
                      <p className="text-xs text-[#AEAEB2] mt-1.5">
                        {act.addedBy} • {act.timeAgo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateJobRoleModal
        isOpen={showCreateJobRole}
        workspaceId={selectedWorkspaceId || 1}
        workspaces={workspaces}
        handlePipelinesClick={() => { }}
        onClose={() => setShowCreateJobRole(false)}
        onJobCreated={fetchCategories}
      />
      <EditJobRoleModal
        isOpen={showEditJobRole}
        onClose={() => {
          setShowEditJobRole(false);
          setEditingJobId(null);
        }}
        handlePipelinesClick={() => { }}
        workspaces={workspaces}
        workspaceId={selectedWorkspaceId || 1}
        jobId={editingJobId || 0}
        onJobUpdated={fetchCategories}
      />
    </div>
  );
}
