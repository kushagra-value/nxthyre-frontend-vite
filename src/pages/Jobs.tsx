import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthContext } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import { jobPostService } from "../services/jobPostService";
import { showToast } from "../utils/toast";
import ProjectCard from "../components/jobListing/ProjectCard";
import ProjectSkeletonCard from "../components/skeletons/ProjectSkeletonCard";
import CreateJobRoleModal from "../components/candidatePool/CreateJobRoleModal";
import EditJobRoleModal from "../components/candidatePool/EditJobRoleModal";
import {
  organizationService,
  MyWorkspace,
} from "../services/organizationService";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function Jobs({ onSelectJob }: JobsProps) {
  const { isAuthenticated } = useAuth();
  const { selectedWorkspaceId } = useAuthContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearchQuery, 500);
  const [currentRequisitionPage, setCurrentRequisitionPage] = useState(1);
  const [logos, setLogos] = useState<Record<string, string | null | undefined>>({});
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [showEditJobRole, setShowEditJobRole] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);

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
      const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += daysInPrevMonth;
    }
    if (months < 0) { years--; months += 12; }
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
      setCurrentRequisitionPage(1);
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
        setWorkspaces(workspaceData.map((ws: MyWorkspace) => ({ id: ws.id, name: ws.name })));
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
      if (job) { setEditingJobId(job.id); setShowEditJobRole(true); }
      else showToast.error("Job not found");
    } catch (error) {
      showToast.error("Failed to fetch job details");
    }
  };

  const handlePublishJobRole = async (jobId: number) => {
    try {
      await jobPostService.updateJob(jobId, { status: "PUBLISHED", visibility: "PUBLIC" });
      await fetchCategories();
      showToast.success("Job published successfully");
    } catch (error) {
      showToast.error("Failed to publish job");
    }
  };

  const handleUnpublishJobRole = async (jobId: number) => {
    try {
      await jobPostService.unpublishJob(jobId);
      await jobPostService.updateJob(jobId, { status: "DRAFT", visibility: "PRIVATE" });
      await fetchCategories();
      showToast.success("Job unpublished successfully");
    } catch (error) {
      showToast.error("Failed to unpublish job");
    }
  };

  const handleCopyJobID = (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      navigator.clipboard.writeText(`${job.name}, ${job.location} (Job ID: ${job.id})`);
      showToast.success(`Job ID copied`);
    }
  };

  const handleSharePipelines = (jobId: number) => {
    window.location.href = `/pipelines/${jobId}`;
  };

  const itemsPerPage = 8;
  const startIndex = (currentRequisitionPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium">Requisitions List</h1>
        <div className="relative w-[544px] h-[59px] bg-white rounded-xl">
          <input
            type="text"
            placeholder="Search Projects"
            value={projectSearchQuery}
            onChange={(e) => setProjectSearchQuery(e.target.value)}
            className="w-full h-full bg-white rounded-[5px] pl-5 pr-16 text-lg text-[#4B5563] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B5563]/20"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-[35px] bg-[#0F47F2] rounded-md flex items-center justify-center hover:bg-[#0d3ec9] transition-colors">
            <Search className="w-[22px] h-[20px] text-white font-semibold" strokeWidth={1.45} />
          </button>
          {projectSearchQuery && (
            <button
              onClick={() => setProjectSearchQuery("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loadingCategories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProjectSkeletonCard key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {debouncedProjectSearch.trim()
              ? `No projects found for "${debouncedProjectSearch}"`
              : "No job roles created yet"}
          </h2>
          {!debouncedProjectSearch.trim() && (
            <button
              onClick={() => setShowCreateJobRole(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Job Role
            </button>
          )}
          {debouncedProjectSearch.trim() && (
            <button
              onClick={() => setProjectSearchQuery("")}
              className="text-blue-600 underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {currentCategories.map((job) => (
              <div key={job.id} className="rounded-[10px] transition-all duration-300">
                <ProjectCard
                  jobId={job.id}
                  jobName={job.name}
                  companyName={job.companyName}
                  experience={job.experience}
                  workApproach={job.workApproach}
                  joiningTimeline={job.joiningTimeline}
                  location={job.location}
                  inboundCount={job.inboundCount}
                  shortlistedCount={job.shortlistedCount}
                  totalApplied={job.totalApplied}
                  totalReplied={job.totalReplied}
                  postedAgo={job.postedAgo}
                  interviewsCount={0}
                  badgeText="On Track"
                  featuredCount={0}
                  status={job.status}
                  visibility={job.visibility}
                  isActive={false}
                  onEditJobRole={handleEditJobRole}
                  onArchiveJob={() => showToast.success("Archive coming soon")}
                  onSharePipelines={handleSharePipelines}
                  onPublishJob={handlePublishJobRole}
                  onCopyJobID={handleCopyJobID}
                  onUnpublishJob={handleUnpublishJobRole}
                  onSelectCard={() => onSelectJob?.(job.id)}
                  logoUrl={logos[job.companyName]}
                />
              </div>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="mt-4 py-2 px-8 pt-2 flex items-center border-t-[0.5px] border-[#E5E7EB] justify-between w-full">
              <div className="text-gray-400 text-lg">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, categories.length)} of{" "}
                {categories.length} requisitions
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentRequisitionPage((p) => Math.max(p - 1, 1))}
                  disabled={currentRequisitionPage === 1}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentRequisitionPage(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${page === currentRequisitionPage
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black hover:bg-gray-200"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentRequisitionPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentRequisitionPage === totalPages}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
        onClose={() => { setShowEditJobRole(false); setEditingJobId(null); }}
        handlePipelinesClick={() => { }}
        workspaces={workspaces}
        workspaceId={selectedWorkspaceId || 1}
        jobId={editingJobId || 0}
        onJobUpdated={fetchCategories}
      />
    </div>
  );
}
