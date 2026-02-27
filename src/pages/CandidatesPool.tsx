import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import useDebounce from "../hooks/useDebounce";
import { creditService } from "../services/creditService";
import { jobPostService } from "../services/jobPostService";
import {
    candidateService,
    CandidateListItem,
    CandidateSearchResponse,
} from "../services/candidateService";
import Header from "../components/candidatePool/Header";
import FiltersSidebar from "../components/candidatePool/FiltersSidebar";
import CandidatesMain from "../components/candidatePool/CandidatesMain";
import CandidateDetail from "../components/candidatePool/CandidateDetail";
import TemplateSelector from "../components/TemplateSelector";
import CreateJobRoleModal from "../components/candidatePool/CreateJobRoleModal";
import EditJobRoleModal from "../components/candidatePool/EditJobRoleModal";
import EditTemplateModal from "../components/candidatePool/EditTemplateModal";
import PipelineStages from "./PipelineStages";

import {
    organizationService,
    MyWorkspace,
    CompanyResearchData,
} from "../services/organizationService";
import CompanyInfoTab from "../components/candidatePool/CompanyInfoTab";
import { User } from "../types/auth";
import type { Job } from "../services/jobPostService";
import ProjectSkeletonCard from "../components/skeletons/ProjectSkeletonCard";
import RequisitionSkeleton from "../components/skeletons/RequisitionSkeleton";
import {
    Trash2, LogOut, ArrowLeft, Pause, Globe,
    ChevronLeft, ChevronRight, Briefcase, LocateIcon,
    FileSearch, Search, Copy, Mail, Edit2, Info, Archive,
} from "lucide-react";
import { showToast } from "../utils/toast";
import ProjectCard from "./jobs/components/ProjectCard";
import { AnalysisResult } from "../services/candidateService";

interface Category {
    id: number; name: string; location: string; companyName: string;
    experience: string; workApproach: string; joiningTimeline: string;
    inboundCount: number; shortlistedCount: number; totalApplied: number;
    totalReplied: number; status: "DRAFT" | "PUBLISHED";
    visibility: "PRIVATE" | "PUBLIC"; invites_sent: number; postedAgo: string;
    workspace_details?: { id: number; name: string };
}

interface Filters {
    keywords: string; booleanSearch: boolean; semanticSearch: boolean;
    selectedCategories: string[]; minExperience: string; maxExperience: string;
    funInCurrentCompany: boolean; minTotalExp: string; maxTotalExp: string;
    city: string; country: string; locations: string[]; noticePeriod: string;
    companies: string; industries: string; minSalary: string; maxSalary: string;
    colleges: string; topTierUniversities: boolean; computerScienceGraduates: boolean;
    showFemaleCandidates: boolean; recentlyPromoted: boolean;
    backgroundVerified: boolean; hasCertification: boolean; hasResearchPaper: boolean;
    hasLinkedIn: boolean; hasBehance: boolean; hasTwitter: boolean;
    hasPortfolio: boolean; jobId: string; application_type: string;
    is_prevetted: boolean; is_active: boolean; sort_by: string;
    boolQuery?: string; inbound_source?: string | null;
}

interface Workspace { id: number; name: string; }

const DEFAULT_FILTERS: Filters = {
    keywords: "", booleanSearch: false, semanticSearch: false,
    selectedCategories: [], minExperience: "", maxExperience: "",
    funInCurrentCompany: false, minTotalExp: "", maxTotalExp: "",
    city: "", country: "", locations: [], noticePeriod: "",
    companies: "", industries: "", minSalary: "", maxSalary: "",
    colleges: "", topTierUniversities: false, computerScienceGraduates: false,
    showFemaleCandidates: false, recentlyPromoted: false,
    backgroundVerified: false, hasCertification: false, hasResearchPaper: false,
    hasLinkedIn: false, hasBehance: false, hasTwitter: false,
    hasPortfolio: false, jobId: "", application_type: "",
    is_prevetted: false, is_active: false, sort_by: "", boolQuery: "",
    inbound_source: null,
};

interface CandidatesPoolProps {
    initialJobId?: number | null;
}

export default function CandidatesPool({ initialJobId }: CandidatesPoolProps) {
    const navigate = useNavigate();
    const { user: firebaseUser, userStatus, isAuthenticated, signOut } = useAuth();
    const { selectedWorkspaceId } = useAuthContext();

    const [credits, setCredits] = useState<number>(0);
    const [, setCurrentUser] = useState<User | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateListItem | null>(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [showCreateJobRole, setShowCreateJobRole] = useState(false);
    const [showEditJobRole, setShowEditJobRole] = useState(false);
    const [editingJobId, setEditingJobId] = useState<number | null>(null);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [showPipelineStages, setShowPipelineStages] = useState(() => {
        const s = sessionStorage.getItem("showPipelineStages");
        return s ? JSON.parse(s) : false;
    });
    const [editingTemplate, setEditingTemplate] = useState<string>("");
    const [activeTab, setActiveTab] = useState("outbound");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
    const [showUnpublishModal, setShowUnpublishModal] = useState<number | null>(null);
    const [sourcingCounts, setSourcingCounts] = useState({ inbound: 0, outbound: 0, active: 0, prevetted: 0 });
    const [showPublishModal, setShowPublishModal] = useState<number | null>(null);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(() => {
        if (initialJobId) return initialJobId;
        const s = sessionStorage.getItem("activeCategoryId");
        return s ? JSON.parse(s) : null;
    });
    const [hasSelectedJob, setHasSelectedJob] = useState(() => {
        if (initialJobId) return true;
        const s = sessionStorage.getItem("hasSelectedJob");
        return s ? JSON.parse(s) : false;
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [logos, setLogos] = useState<Record<string, string | null | undefined>>({});
    const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);
    const controller = new AbortController();
    const [sortBy, setSortBy] = useState<string>("");
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [showRequisitionInfoModal, setShowRequisitionInfoModal] = useState(false);
    const [requisitionModalTab, setRequisitionModalTab] = useState<"info" | "company">("info");
    const [jobDataForModal, setJobDataForModal] = useState<Job | null>(null);
    const [competenciesData, setCompetenciesData] = useState<any>(null);
    const [loadingCompetencies, setLoadingCompetencies] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
    const [companyResearchData, setCompanyResearchData] = useState<CompanyResearchData | null>(null);
    const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);
    const [currentRequisitionPage, setCurrentRequisitionPage] = useState<number>(1);
    const [, setCurrentJobIdForModal] = useState<number | null>(null);
    const [defaultBoolQuery, setDefaultBoolQuery] = useState<string>("");
    const [projectSearchQuery, setProjectSearchQuery] = useState("");
    const debouncedProjectSearch = useDebounce(projectSearchQuery, 500);
    const [, setWorkspaceId] = useState<number | null>(selectedWorkspaceId);
    const [, setWorkspaceName] = useState<string>("");
    const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
    const [activeCategoryTotalCount] = useState(0);

    // Sync initialJobId
    useEffect(() => {
        if (initialJobId) {
            setActiveCategoryId(initialJobId);
            setHasSelectedJob(true);
        }
    }, [initialJobId]);

    // Session storage sync
    useEffect(() => { sessionStorage.setItem("hasSelectedJob", JSON.stringify(hasSelectedJob)); }, [hasSelectedJob]);
    useEffect(() => { sessionStorage.setItem("activeCategoryId", JSON.stringify(activeCategoryId)); }, [activeCategoryId]);
    useEffect(() => { sessionStorage.setItem("showPipelineStages", JSON.stringify(showPipelineStages)); }, [showPipelineStages]);
    useEffect(() => { setIsSearchMode(debouncedSearchQuery.trim() !== ""); }, [debouncedSearchQuery]);
    useEffect(() => { if (activeTab !== "inbound") setFilters((p) => ({ ...p, inbound_source: null })); }, [activeTab]);

    // User setup
    useEffect(() => {
        if (isAuthenticated && userStatus) {
            setCurrentUser({
                id: firebaseUser?.uid, fullName: userStatus.full_name || "Unknown User",
                isSuperAdmin: userStatus.isSuperAdmin || false, email: userStatus.email || "Unknown@user.com",
                role: userStatus.roles?.length > 0 ? userStatus.roles[0].name.toLowerCase() : "team",
                organizationId: userStatus.organization?.id?.toString(),
                workspaceIds: userStatus.roles.filter((r: any) => r.workspace_id != null).map((r: any) => Number(r.workspace_id)),
                isVerified: firebaseUser?.emailVerified ?? true,
                createdAt: firebaseUser?.metadata.creationTime || new Date().toISOString(),
            });
        }
    }, [isAuthenticated, userStatus, firebaseUser]);

    // Fetch workspaces
    useEffect(() => {
        if (!isAuthenticated) return;
        organizationService.getMyWorkspaces().then((data) => {
            setWorkspaces(data.map((ws: MyWorkspace) => ({ id: ws.id, name: ws.name })));
        }).catch(() => showToast.error("Failed to fetch workspaces"));
    }, [isAuthenticated]);

    // Fetch logos
    const fetchLogo = async (query: string) => {
        if (!query || logos[query] !== undefined) return;
        try {
            const res = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_LOGO_DEV_API_KEY}` },
            });
            const data = await res.json();
            setLogos((p) => ({ ...p, [query]: data.length > 0 ? data[0].logo_url : null }));
        } catch { setLogos((p) => ({ ...p, [query]: undefined })); }
    };

    useEffect(() => {
        if (categories.length > 0) {
            Array.from(new Set(categories.map((c) => c.companyName))).forEach((co) => {
                if (co && co !== "Confidential" && logos[co] === undefined) fetchLogo(co);
            });
        }
    }, [categories, logos]);

    const getTimeAgo = (dateString: string): string => {
        const past = new Date(dateString);
        if (isNaN(past.getTime())) return "Invalid date";
        const now = new Date();
        let years = now.getFullYear() - past.getFullYear();
        let months = now.getMonth() - past.getMonth();
        let days = now.getDate() - past.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
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
            let filtered = jobs;
            if (debouncedProjectSearch.trim()) {
                const q = debouncedProjectSearch.toLowerCase();
                filtered = jobs.filter((j: any) =>
                    j.title?.toLowerCase().includes(q) ||
                    j.organization_details?.name?.toLowerCase().includes(q) ||
                    j.workspace_details?.name?.toLowerCase().includes(q) ||
                    j.skills?.some((s: string) => s.toLowerCase().includes(q))
                );
            }
            const mapped: Category[] = filtered.map((job: any) => {
                const minExp = job.experience_min_years ?? 0;
                let workApproach = "Hybrid";
                if (job.work_approach === "ONSITE") workApproach = "Onsite";
                else if (job.work_approach === "REMOTE") workApproach = "Remote";
                return {
                    id: job.id, name: job.title, companyName: job.workspace_details?.name || "Confidential",
                    experience: `${minExp}+ years`, location: job.location[0], workApproach,
                    joiningTimeline: "Immediate", inboundCount: job.inbound_count || 0,
                    shortlistedCount: job.shortlisted_candidate_count || 0,
                    totalApplied: job.total_applied || 0, totalReplied: job.total_replied || 0,
                    status: job.status, visibility: job.visibility,
                    invites_sent: job.invites_sent || 0,
                    postedAgo: job.created_at ? getTimeAgo(job.created_at) : "today",
                };
            });
            setCategories(mapped);
            setCurrentRequisitionPage(1);
            // Restore session
            if (isAuthenticated) {
                let restoredId = activeCategoryId;
                let restoredHas = hasSelectedJob;
                let restoredStages = showPipelineStages;
                if (restoredId && !mapped.some((c) => c.id === restoredId)) {
                    restoredId = mapped[0]?.id || null; restoredHas = !!restoredId; restoredStages = false;
                }
                if (mapped.length === 0) { restoredId = null; restoredHas = false; restoredStages = false; }
                setActiveCategoryId(restoredId);
                setHasSelectedJob(restoredHas);
                setShowPipelineStages(restoredStages);
                if (restoredId) fetchJobDetailsAndSetFilters(restoredId);
            }
        } catch { showToast.error("Failed to fetch job categories"); }
        finally { setLoadingCategories(false); }
    };

    const fetchJobDetailsAndSetFilters = async (jobId: number) => {
        try {
            const job = await jobPostService.getJob(jobId);
            const newF = {
                ...filters, jobId: job.id.toString(), keywords: job.skills ? job.skills.join(", ") : "",
                minTotalExp: job.experience_min_years?.toString() || "", maxTotalExp: job.experience_max_years?.toString() || "",
                application_type: activeTab, sort_by: sortBy
            };
            setFilters(newF);
            setWorkspaceId(job.workspace_details?.id);
            setWorkspaceName(job.workspace_details?.name || "Unknown");
            await fetchCandidates(1, newF);
        } catch { showToast.error("Failed to fetch job details"); }
    };

    useEffect(() => { if (activeCategoryId) fetchJobDetailsAndSetFilters(activeCategoryId); }, [activeCategoryId]);
    useEffect(() => { if (isAuthenticated) fetchCategories(); }, [isAuthenticated, debouncedProjectSearch]);

    const fetchCandidates = useCallback(async (page: number = 1, appliedFilters: any) => {
        setLoadingCandidates(true);
        try {
            let response: CandidateSearchResponse;
            if (debouncedSearchQuery.trim() !== "") {
                response = await candidateService.universalSearch(debouncedSearchQuery, controller.signal);
                const cands = response.results.map((c: any) => ({ ...c }));
                setCandidates(cands); setTotalCount(cands.length);
                if (response.sourcing_counts) setSourcingCounts(response.sourcing_counts);
                if (cands.length > 0 && !selectedCandidate) setSelectedCandidate(cands[0]);
                setFilters({ ...DEFAULT_FILTERS, jobId: appliedFilters.jobId || "", sort_by: sortBy || "" });
                setDefaultBoolQuery("");
            } else {
                response = await candidateService.getCandidates(appliedFilters, page);
                if (response.boolean_search_terms) {
                    localStorage.setItem(`bool_query_${appliedFilters.jobId}`, response.boolean_search_terms);
                    setDefaultBoolQuery(response.boolean_search_terms);
                } else { setDefaultBoolQuery(""); }
                setCandidates(response.results); setTotalCount(response.count);
                if (response.sourcing_counts) setSourcingCounts(response.sourcing_counts);
                setDefaultBoolQuery(response.boolean_search_terms || "");
                if (response.results.length === 0) { setSelectedCandidate(null); showToast.error("No results found."); }
                else if (response.results.length > 0) setSelectedCandidate(response.results[0]);
            }
        } catch { setCandidates([]); setTotalCount(0); setSelectedCandidate(null); }
        finally { setLoadingCandidates(false); }
    }, [selectedCandidate, debouncedSearchQuery, sortBy, filters, activeTab]);

    useEffect(() => {
        const newF = {
            ...filters, application_type: activeTab, is_prevetted: activeTab === "prevetted",
            is_active: activeTab === "active", sort_by: sortBy, inbound_source: filters.inbound_source
        };
        setFilters(newF);
        if (activeCategoryId) fetchCandidates(currentPage, newF);
    }, [activeTab, filters.inbound_source, sortBy, debouncedSearchQuery, isAuthenticated, currentPage]);

    useEffect(() => {
        if (isAuthenticated) creditService.getCreditBalance().then((d) => setCredits(d.credit_balance)).catch(() => { });
    }, [isAuthenticated]);

    // Handlers
    const handleSearchChange = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
    const handleCandidatesUpdate = (newC: CandidateListItem[], count: number) => {
        setCandidates(newC); setTotalCount(count);
        if (newC.length > 0 && !selectedCandidate) setSelectedCandidate(newC[0]);
        else if (newC.length === 0) setSelectedCandidate(null);
        else { const u = newC.find((c) => c.id === selectedCandidate?.id); if (u) setSelectedCandidate(u); }
    };
    const handleBackToCategories = () => { setActiveCategoryId(null); setHasSelectedJob(false); setSelectedCandidate(null); };
    const handleBackToHomepage = () => { setActiveCategoryId(null); setHasSelectedJob(false); setSelectedCandidate(null); setShowPipelineStages(false); };
    const handleJobCreatedOrUpdated = () => fetchCategories();
    const deductCredits = async () => { try { const d = await creditService.getCreditBalance(); setCredits(d.credit_balance); } catch { } };
    const updateCandidateEmail = (id: string, email: string, phone: string) => {
        setCandidates((p) => p.map((c) => c.id === id ? { ...c, candidate_email: email, candidate_phone: phone } : c));
        if (selectedCandidate?.id === id) setSelectedCandidate((p) => p ? { ...p, candidate_email: email, candidate_phone: phone } : p);
    };
    const handleOpenLogoutModal = () => setShowLogoutModal(true);
    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);
        try {
            await signOut(); setCurrentUser(null); setSelectedCandidate(null);
            setShowTemplateSelector(false); setShowCreateJobRole(false); setShowEditTemplate(false);
            setShowPipelineStages(false); setSearchTerm(""); setSortBy("");
            setFilters({ ...DEFAULT_FILTERS }); setDefaultBoolQuery("");
            sessionStorage.removeItem("hasSelectedJob"); sessionStorage.removeItem("activeCategoryId");
            sessionStorage.removeItem("showPipelineStages");
            showToast.success("Successfully logged out"); navigate("/");
        } catch { showToast.error("Failed to logout"); }
    };
    const handleSendInvite = () => setShowTemplateSelector(true);
    const handleCreateJobRole = () => setShowCreateJobRole(true);
    const handleRequisitionInfo = async (jobId: number) => {
        setRequisitionModalTab("info"); setCompanyResearchData(null); setCurrentJobIdForModal(jobId);
        setLoadingCompetencies(true); setJobDataForModal(null); setCompetenciesData(null);
        try {
            const [job, comp] = await Promise.all([jobPostService.getJob(jobId), jobPostService.getJobCompetencies(jobId)]);
            setJobDataForModal(job); setCompetenciesData(comp);
        } catch { showToast.error("Failed to fetch requisition info"); }
        finally { setLoadingCompetencies(false); setShowRequisitionInfoModal(true); }
    };
    const handleCloseRequisitionModal = () => {
        setRequisitionModalTab("info"); setShowRequisitionInfoModal(false); setJobDataForModal(null);
        setCompetenciesData(null); setCompanyResearchData(null); setLoadingCompetencies(false); setCurrentJobIdForModal(null);
    };
    const handleEditJobRole = async (jobId: number) => {
        try {
            const jobs = await jobPostService.getJobs(); const j = jobs.find((x: any) => x.id === jobId);
            if (j) { setEditingJobId(j.id); setShowEditJobRole(true); } else showToast.error("Job not found");
        } catch { showToast.error("Failed to fetch job details"); }
    };
    const handleCopyJobLink = (jobId: number) => {
        const j = categories.find((c) => c.id === jobId);
        if (j) { navigator.clipboard.writeText(`${window.location.origin}/jobs/${j.id}/`).then(() => showToast.success("Job link copied")); }
    };
    const handleCopyJobID = (jobId: number) => {
        const j = categories.find((c) => c.id === jobId);
        if (j) { navigator.clipboard.writeText(`${j.name}, ${j.location} (Job ID: ${j.id})`).then(() => showToast.success("Job ID copied")); }
    };
    const handleDeleteJobRole = async (jobId: number) => {
        const j = categories.find((c) => c.id === jobId);
        if (j) {
            try {
                await jobPostService.deleteJob(jobId); await fetchCategories(); showToast.success(`Deleted ${j.name}`);
                if (activeCategoryId === jobId) setActiveCategoryId(categories[0]?.id || null);
            } catch { showToast.error("Failed to delete"); }
        }
        setShowDeleteModal(null);
    };
    const handleUnpublishJobRole = async (jobId: number) => {
        try {
            await jobPostService.unpublishJob(jobId); await jobPostService.updateJob(jobId, { status: "DRAFT", visibility: "PRIVATE" });
            await fetchCategories(); showToast.success("Unpublished");
        } catch { showToast.error("Failed to unpublish"); }
        setShowUnpublishModal(null);
    };
    const handlePublishJobRole = async (jobId: number) => {
        try {
            await jobPostService.updateJob(jobId, { status: "PUBLISHED", visibility: "PUBLIC" });
            await fetchCategories(); showToast.success("Published");
        } catch { showToast.error("Failed to publish"); }
        setShowPublishModal(null);
    };
    const handleEditTemplate = (jobId: number) => {
        const j = categories.find((c) => c.id === jobId);
        if (j) { setEditingTemplate(j.name); setShowEditTemplate(true); }
    };
    const handleSharePipelines = (jobId: number) => { window.location.href = `/pipelines/${jobId}`; };
    const handlePipelinesClick = () => setShowPipelineStages(true);
    const handleBackFromPipelines = () => setShowPipelineStages(false);
    const handleUpdateCandidate = (updated: CandidateListItem) => {
        setCandidates((p) => p.map((c) => c.id === updated.id ? updated : c));
        if (selectedCandidate?.id === updated.id) setSelectedCandidate(updated);
    };
    const handleApplyFilters = (newFilters: any) => {
        const isValid = (v: string) => /^\d+$/.test(v);
        if ((newFilters.minTotalExp && !isValid(newFilters.minTotalExp)) || (newFilters.maxTotalExp && !isValid(newFilters.maxTotalExp)) ||
            (newFilters.minSalary && !isValid(newFilters.minSalary)) || (newFilters.maxSalary && !isValid(newFilters.maxSalary))) {
            showToast.error("Invalid input. Please enter numbers only."); setCandidates([]); setTotalCount(0); setCurrentPage(1); setSelectedCandidate(null); return;
        }
        if (newFilters.minTotalExp && newFilters.maxTotalExp && Number(newFilters.minTotalExp) > Number(newFilters.maxTotalExp)) {
            showToast.error("Min experience cannot exceed max."); setCandidates([]); setTotalCount(0); setCurrentPage(1); setSelectedCandidate(null); return;
        }
        if (newFilters.minSalary && newFilters.maxSalary && Number(newFilters.minSalary) > Number(newFilters.maxSalary)) {
            showToast.error("Min salary cannot exceed max."); setCandidates([]); setTotalCount(0); setCurrentPage(1); setSelectedCandidate(null); return;
        }
        setFilters({ ...newFilters }); fetchCandidates(1, newFilters);
    };
    const handleCategoryAction = (action: string, jobId: number) => {
        switch (action) {
            case "requisition-info": handleRequisitionInfo(jobId); break;
            case "edit-job": handleEditJobRole(jobId); break;
            case "copy-link": handleCopyJobLink(jobId); break;
            case "edit-template": handleEditTemplate(jobId); break;
            case "share-pipelines": handleSharePipelines(jobId); break;
            case "archive": showToast.success("Feature Coming Soon"); break;
            case "publish-job": setShowPublishModal(jobId); break;
            case "unpublish-job": setShowUnpublishModal(jobId); break;
            case "delete": setShowDeleteModal(jobId); break;
        }
    };

    const activeCategory = categories.find((c) => c.id === activeCategoryId);

    // --- JSX ---
    if (showPipelineStages) {
        return (<><Toaster /><PipelineStages onBack={handleBackFromPipelines} onOpenLogoutModal={handleOpenLogoutModal}
            onSendInvite={handleSendInvite} deductCredits={deductCredits} initialJobId={activeCategoryId}
            onHomepage={handleBackToHomepage} /></>);
    }

    if (!hasSelectedJob || !activeCategoryId) {
        const itemsPerPage = 8;
        const startIdx = (currentRequisitionPage - 1) * itemsPerPage;
        const paginated = categories.slice(startIdx, startIdx + itemsPerPage);
        const totalPages = Math.ceil(categories.length / itemsPerPage);
        return (
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar"><Toaster />
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-medium">Select a Job to View Candidates</h1>
                    <div className="relative w-[400px] h-[50px] bg-white rounded-xl">
                        <input type="text" placeholder="Search Projects" value={projectSearchQuery}
                            onChange={(e) => setProjectSearchQuery(e.target.value)}
                            className="w-full h-full bg-white rounded-[5px] pl-5 pr-16 text-lg text-[#4B5563] placeholder:text-gray-400 focus:outline-none" />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-[35px] bg-[#0F47F2] rounded-md flex items-center justify-center">
                            <Search className="w-5 h-5 text-white" strokeWidth={1.45} /></button>
                    </div>
                </div>
                {loadingCategories ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <ProjectSkeletonCard key={i} />)}</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">No job roles created yet</h2>
                        <button onClick={handleCreateJobRole} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Your First Job Role</button>
                    </div>
                ) : (<>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {paginated.map((j) => (
                            <div key={j.id} className="rounded-[10px] transition-all duration-300">
                                <ProjectCard jobId={j.id} jobName={j.name} companyName={j.companyName} experience={j.experience}
                                    workApproach={j.workApproach} joiningTimeline={j.joiningTimeline} location={j.location}
                                    inboundCount={j.inboundCount} shortlistedCount={j.shortlistedCount} totalApplied={j.totalApplied}
                                    totalReplied={j.totalReplied} postedAgo={j.postedAgo} interviewsCount={0} badgeText="On Track"
                                    featuredCount={0} status={j.status} visibility={j.visibility} isActive={false}
                                    onEditJobRole={handleEditJobRole} onArchiveJob={() => showToast.success("Archive coming soon")}
                                    onSharePipelines={handleSharePipelines} onPublishJob={handlePublishJobRole}
                                    onCopyJobID={handleCopyJobID} onUnpublishJob={handleUnpublishJobRole}
                                    onSelectCard={() => { setActiveCategoryId(j.id); setHasSelectedJob(true); }}
                                    logoUrl={logos[j.companyName]} /></div>))}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-4 py-2 flex items-center border-t border-gray-200 justify-between">
                            <div className="text-gray-400">Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, categories.length)} of {categories.length}</div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentRequisitionPage((p) => Math.max(p - 1, 1))} disabled={currentRequisitionPage === 1} className="text-gray-400 disabled:opacity-50"><ChevronLeft className="w-6 h-6" /></button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                                    <button key={pg} onClick={() => setCurrentRequisitionPage(pg)}
                                        className={`w-10 h-10 rounded-full text-sm font-medium ${pg === currentRequisitionPage ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-gray-200"}`}>{pg}</button>))}
                                <button onClick={() => setCurrentRequisitionPage((p) => Math.min(p + 1, totalPages))} disabled={currentRequisitionPage === totalPages} className="text-gray-400 disabled:opacity-50"><ChevronRight className="w-6 h-6" /></button>
                            </div></div>)}
                </>)}
                <CreateJobRoleModal isOpen={showCreateJobRole} workspaceId={selectedWorkspaceId || 1} workspaces={workspaces}
                    handlePipelinesClick={handlePipelinesClick} onClose={() => setShowCreateJobRole(false)} onJobCreated={handleJobCreatedOrUpdated} />
            </div>);
    }

    return (<><Toaster />
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
            <div className="sticky top-0 bg-white will-change-transform z-40">
                <Header onCreateRole={handleCreateJobRole} onOpenLogoutModal={handleOpenLogoutModal}
                    credits={credits} onBack={handleBackToHomepage} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    showLinkedinSearchButton={true} showCreateRoleButton={true} showSearchBar={true}
                    candidates={candidates} onSelectCandidate={setSelectedCandidate} jobId={activeCategoryId ?? undefined} />
            </div>
            <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3">
                {activeCategory && (
                    <div className="sticky top-[68px] z-30 will-change-transform bg-gray-50 border-b border-gray-200 py-4">
                        <div className="max-w-full flex items-center justify-between px-4 lg:px-6">
                            <div className="flex items-center gap-8">
                                <button onClick={handleBackToCategories} className="rounded-full hover:bg-gray-200 transition-colors"><ArrowLeft className="w-8 h-8 text-gray-600" /></button>
                                <h1 className="text-[24px] font-semibold text-[#4B5563]">{activeCategory.name}</h1>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-[20px] text-[#4B5563]"><Briefcase className="w-[18px] h-[18px] text-[#818283]" /><span>{activeCategory.experience}</span></div>
                                    <div className="flex items-center gap-2 text-[20px] text-[#4B5563]"><LocateIcon className="w-[18px] h-[18px] text-[#818283]" /><span>{activeCategory.workApproach}</span></div>
                                    <div className="flex items-center gap-2 text-[20px] text-[#4B5563]"><FileSearch className="w-[18px] h-[18px] text-[#818283]" /><span>{activeCategory.location}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleCategoryAction("copy-link", activeCategoryId)} title="Copy Link" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Copy className="w-4 h-4 text-[#818283]" /></button>
                                    <button onClick={() => handleCategoryAction("edit-template", activeCategoryId)} title="Edit Template" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Mail className="w-4 h-4 text-[#818283]" /></button>
                                    {activeCategory.status === "DRAFT" && activeCategory.visibility === "PRIVATE" && (
                                        <button onClick={() => handleCategoryAction("publish-job", activeCategoryId)} title="Publish" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Globe className="w-4 h-4 text-[#818283]" /></button>)}
                                    {activeCategory.status === "PUBLISHED" && activeCategory.visibility === "PUBLIC" && (
                                        <button onClick={() => handleCategoryAction("unpublish-job", activeCategoryId)} title="Unpublish" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Pause className="w-4 h-4 text-[#818283]" /></button>)}
                                    <button onClick={() => handleCategoryAction("edit-job", activeCategoryId)} title="Edit Job" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Edit2 className="w-4 h-4 text-[#818283]" /></button>
                                    <button onClick={() => handleCategoryAction("requisition-info", activeCategoryId)} title="Requisition Info" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Info className="w-4 h-4 text-[#818283]" /></button>
                                    <button onClick={() => handleCategoryAction("archive", activeCategoryId)} title="Archive" className="w-8 h-8 rounded-full border border-[#818283] flex items-center justify-center hover:bg-gray-50"><Archive className="w-4 h-4 text-[#818283]" /></button>
                                </div>
                                <button onClick={handlePipelinesClick} className="px-5 py-2.5 bg-white border border-[#0F47F2] text-[#0F47F2] rounded-lg font-medium hover:bg-blue-50 transition-colors">Show Pipelines</button>
                                <button onClick={() => handleCategoryAction("share-pipelines", activeCategoryId)} className="px-6 py-2.5 bg-[#1CB977] text-white rounded-lg font-medium hover:bg-[#0d3ec9] transition-colors shadow-md">Applicant Tracking</button>
                            </div>
                        </div>
                    </div>)}
                <div className="flex w-full gap-3 h-full">
                    <div className="2xl:w-[25%] sticky order-1 top-16 self-start will-change-transform z-10">
                        <FiltersSidebar filters={filters} defaultBoolQuery={defaultBoolQuery} onApplyFilters={handleApplyFilters}
                            setCandidates={setCandidates} candidates={candidates} activeTab={activeTab} isSearchMode={isSearchMode} /></div>
                    <div className="2xl:w-[45%] order-2">
                        <CandidatesMain activeTab={activeTab} setActiveTab={setActiveTab} selectedCandidate={selectedCandidate}
                            setSelectedCandidate={setSelectedCandidate} searchTerm={searchTerm} onPipelinesClick={handlePipelinesClick}
                            candidates={candidates} totalCount={totalCount} jobId={filters.jobId} deductCredits={deductCredits}
                            onCandidatesUpdate={handleCandidatesUpdate} currentPage={currentPage} setCurrentPage={setCurrentPage}
                            onSearchChange={handleSearchChange} sortBy={sortBy} setSortBy={setSortBy} loadingCandidates={loadingCandidates}
                            sourcingCounts={sourcingCounts} activeCategoryTotalCount={activeCategoryTotalCount} currentAnalysis={currentAnalysis}
                            onInboundSourceChange={(source: string | null) => { setFilters((p) => ({ ...p, inbound_source: source })); setCurrentPage(1); }} /></div>
                    <div className="2xl:w-[30%] order-3 sticky top-16 self-start will-change-transform">
                        <CandidateDetail candidate={selectedCandidate} candidates={candidates} onSendInvite={handleSendInvite}
                            updateCandidateEmail={updateCandidateEmail} deductCredits={deductCredits} onUpdateCandidate={handleUpdateCandidate}
                            defaultBoolQuery={defaultBoolQuery} jobId={filters.jobId} textQuery={filters.keywords}
                            boolQuery={filters.boolQuery || ""} enableAnalysis={!!filters.jobId} onAnalysisFetched={setCurrentAnalysis}
                            activeMiddleTab={activeTab} setActiveMiddleTab={setActiveTab} /></div>
                    {showTemplateSelector && selectedCandidate && (
                        <div className="fixed inset-0 z-50 flex items-center justify-end">
                            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>
                            <div className="relative w-[40%] h-full bg-white rounded-tl-xl rounded-bl-xl shadow-lg overflow-y-auto">
                                <TemplateSelector candidate={selectedCandidate} onBack={() => setShowTemplateSelector(false)}
                                    updateCandidateEmail={updateCandidateEmail} jobId={filters.jobId} /></div></div>)}
                </div>
            </div>
            <CreateJobRoleModal isOpen={showCreateJobRole} workspaceId={selectedWorkspaceId || 1} workspaces={workspaces}
                handlePipelinesClick={handlePipelinesClick} onClose={() => setShowCreateJobRole(false)} onJobCreated={handleJobCreatedOrUpdated} />
            <EditJobRoleModal isOpen={showEditJobRole} onClose={() => { setShowEditJobRole(false); setEditingJobId(null); }}
                handlePipelinesClick={handlePipelinesClick} workspaces={workspaces} workspaceId={selectedWorkspaceId || 1}
                jobId={editingJobId || 0} onJobUpdated={handleJobCreatedOrUpdated} />
            <EditTemplateModal jobId={String(activeCategoryId)} isOpen={showEditTemplate}
                onClose={() => setShowEditTemplate(false)} templateName={editingTemplate} />
            {showLogoutModal && (<div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"><div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="w-6 h-6 text-red-600" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3><p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
                <div className="flex space-x-3"><button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleLogoutConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sign Out</button></div>
            </div></div></div>)}
            {showPublishModal && (<div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"><div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Globe className="w-6 h-6 text-green-600" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Publish Job</h3>
                <p className="text-gray-600 mb-6">Publish {categories.find((c) => c.id === showPublishModal)?.name}?</p>
                <div className="flex space-x-3"><button onClick={() => setShowPublishModal(null)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={() => handlePublishJobRole(showPublishModal)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Publish</button></div>
            </div></div></div>)}
            {showUnpublishModal && (<div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"><div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Pause className="w-6 h-6 text-red-600" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Unpublish</h3>
                <p className="text-gray-600 mb-6">Unpublish {categories.find((c) => c.id === showUnpublishModal)?.name}?</p>
                <div className="flex space-x-3"><button onClick={() => setShowUnpublishModal(null)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={() => handleUnpublishJobRole(showUnpublishModal)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Unpublish</button></div>
            </div></div></div>)}
            {showDeleteModal && (<div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"><div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"><div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">Delete {categories.find((c) => c.id === showDeleteModal)?.name}? This cannot be undone.</p>
                <div className="flex space-x-3"><button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={() => handleDeleteJobRole(showDeleteModal)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div>
            </div></div></div>)}
            {showRequisitionInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-start justify-end overflow-y-auto" onClick={handleCloseRequisitionModal}>
                    <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[125vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-4"><button onClick={handleCloseRequisitionModal}><ArrowLeft className="w-8 h-8 text-gray-800" /></button>
                            <h1 className="text-lg font-semibold text-gray-800">Requisition Info</h1></div>
                        <div className="flex border-b border-gray-200 mb-6">
                            <button className={`pb-2 px-4 text-sm font-medium ${requisitionModalTab === "info" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                                onClick={() => setRequisitionModalTab("info")}>Requisition Info</button>
                            <button className={`pb-2 px-4 text-sm font-medium ${requisitionModalTab === "company" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                                onClick={async () => {
                                    setRequisitionModalTab("company");
                                    if (jobDataForModal?.workspace_details?.id && !companyResearchData) {
                                        setLoadingCompanyResearch(true);
                                        try { setCompanyResearchData(await organizationService.getCompanyResearchData(jobDataForModal.workspace_details.id)); }
                                        catch { } finally { setLoadingCompanyResearch(false); }
                                    }
                                }}>About Company</button>
                        </div>
                        {loadingCompetencies ? <RequisitionSkeleton /> : jobDataForModal ? (<>
                            {requisitionModalTab === "info" && competenciesData && (<>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-1">{jobDataForModal.title}</h2>
                                <div className="flex space-x-8 mt-2 mb-6">
                                    <span className="flex items-center text-gray-500"><Briefcase className="w-4 h-4 mr-1" /> {jobDataForModal.experience_min_years}+ years</span>
                                    <span className="flex items-center text-gray-500"><LocateIcon className="w-4 h-4 mr-1" /> {jobDataForModal.work_approach}</span>
                                    <span className="flex items-center text-gray-500"><FileSearch className="w-4 h-4 mr-1" /> Immediate</span></div>
                                <div className="mb-6"><h3 className="text-lg font-semibold text-gray-700 mb-2">Role Overview</h3><p className="text-gray-600 text-sm">{competenciesData.role_overview}</p></div>
                                <div className="mb-6"><h3 className="text-lg font-semibold text-gray-700 mb-2">The Core Expectation</h3>
                                    <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">{competenciesData.the_core_expectation.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></div>
                                <div className="mb-6"><h3 className="text-lg font-semibold text-gray-700 mb-3">Key Responsibilities</h3><div className="space-y-3">
                                    {competenciesData.key_responsibilities_explained.functional.map((item: any, i: number) => (
                                        <div key={i} className="bg-blue-50 rounded-lg p-4"><h4 className="font-medium text-gray-600 mb-1">{item.competency}</h4>
                                            <p className="text-sm text-gray-400">{item.context}</p>{item.priority && <p className="text-xs text-gray-500 mt-1">Priority: {item.priority}</p>}</div>))}
                                    {competenciesData.key_responsibilities_explained.leadership?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200"><h4 className="font-semibold text-gray-700 mb-3">Leadership</h4>
                                            {competenciesData.key_responsibilities_explained.leadership.map((item: any, i: number) => (
                                                <div key={i} className="bg-green-50 rounded-lg p-4 mb-3"><h5 className="font-medium text-gray-600 mb-1">{item.responsibility}</h5>
                                                    <p className="text-sm text-gray-400">{item.context}</p></div>))}</div>)}</div></div>
                                <div className="mb-6"><h3 className="text-lg font-semibold text-gray-700 mb-3">Technical Skills</h3><div className="space-y-3">
                                    {competenciesData.required_technical_skills_purpose.map((item: any, i: number) => (
                                        <div key={i} className="bg-blue-50 rounded-lg p-4"><h4 className="font-medium text-gray-600 mb-1">{item.skill}</h4>
                                            <p className="text-sm text-gray-400">{item.context}</p></div>))}</div></div>
                            </>)}
                            {requisitionModalTab === "company" && (<>
                                {loadingCompanyResearch ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                    : companyResearchData ? <CompanyInfoTab data={companyResearchData} />
                                        : <div className="text-center py-8 text-gray-500">No company details available.</div>}</>)}
                        </>) : <div className="text-center py-8 text-gray-500">Failed to load data.</div>}
                    </div></div>)}
        </div>
    </>);
}
