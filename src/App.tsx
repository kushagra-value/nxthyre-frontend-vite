import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import useDebounce from "./hooks/useDebounce";
import { creditService } from "./services/creditService";
import { jobPostService } from "./services/jobPostService";
import Cookies from "js-cookie";
import {
  candidateService,
  CandidateListItem,
  CandidateSearchResponse,
} from "./services/candidateService";
import Header from "./components/Header";
import TermsAndConditions from "./components/TermsAndConditions";
import FiltersSidebar from "./components/FiltersSidebar";
import JobApplicationForm from "./components/JobApplicationForm";
import CandidatesMain from "./components/CandidatesMain";
import CandidateDetail from "./components/CandidateDetail";
import TemplateSelector from "./components/TemplateSelector";
import CreateJobRoleModal from "./components/CreateJobRoleModal";
import EditJobRoleModal from "./components/EditJobRoleModal";
import EditTemplateModal from "./components/EditTemplateModal";
import PipelineStages from "./components/PipelineStages";
import AuthApp from "./components/AuthApp";
import LinkedInAuth from "./components/auth/LinkedInAuth";
import Settings from "./components/Settings";
import ShareableProfile from "./components/profileShare/ShareableProfile";
import PipelineSharePage from "./components/applicantTracking/PipelineSharePage";
import {
  organizationService,
  MyWorkspace,
} from "./services/organizationService";
import { User } from "./types/auth";
import type { Job } from "./services/jobPostService";
import { useLocation } from "react-router-dom";
import PipelineSkeletonLoader from "./components/skeletons/PipelineSkeletonLoader";
import {
  Trash2,
  LogOut,
  ArrowLeft,
  Pause,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  LocateIcon,
  FileSearch,
  Search,
} from "lucide-react";
import { showToast } from "./utils/toast";
import CandidateBackGroundCheck from "./components/CandidateBackGroundCheck";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import ProjectCard from "./components/ProjectCard";
import { AnalysisResult } from "./services/candidateService";
interface Category {
  id: number;
  name: string; // Job title
  location: string;
  companyName: string; // e.g., "Debitte"
  experience: string; // e.g., "8+ years"
  workApproach: string; // "Hybrid", "Remote", "Onsite"
  joiningTimeline: string; // "Immediate", "15 days", etc.
  inboundCount: number; // 556 in image
  shortlistedCount: number; // NEW
  totalApplied: number; // 61 in image
  totalReplied: number; // 21 in image
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
  invites_sent: number;
  postedAgo: string;
}
interface Filters {
  keywords: string;
  booleanSearch: boolean;
  semanticSearch: boolean;
  selectedCategories: string[];
  minExperience: string;
  maxExperience: string;
  funInCurrentCompany: boolean;
  minTotalExp: string;
  maxTotalExp: string;
  city: string;
  country: string;
  locations: string[];
  noticePeriod: string;
  companies: string;
  industries: string;
  minSalary: string;
  maxSalary: string;
  colleges: string;
  topTierUniversities: boolean;
  computerScienceGraduates: boolean;
  showFemaleCandidates: boolean;
  recentlyPromoted: boolean;
  backgroundVerified: boolean;
  hasCertification: boolean;
  hasResearchPaper: boolean;
  hasLinkedIn: boolean;
  hasBehance: boolean;
  hasTwitter: boolean;
  hasPortfolio: boolean;
  jobId: string;
  application_type: string;
  is_prevetted: boolean;
  is_active: boolean;
  sort_by: string;
  boolQuery?: string;
  inbound_source?: string | null;
}
interface Workspace {
  id: number;
  name: string;
}

const ProjectSkeletonCard = () => (
  <div className="bg-white rounded-[10px] shadow-lg overflow-hidden animate-pulse hover:shadow-xl transition-shadow duration-300">
    <div className="p-12">
      {/* Top row: Status badge + hover actions placeholder */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-7 bg-gray-200 rounded-full w-28"></div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Company name */}
      <div className="h-5 bg-gray-200 rounded w-3/5 mb-6"></div>

      {/* Job title */}
      <div className="h-8 bg-gray-200 rounded-lg w-4/5 mb-3"></div>

      {/* Chips row: Experience, Work Approach, Joining Timeline */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="h-8 bg-gray-200 rounded-full px-4 w-24"></div>
        <div className="h-8 bg-gray-200 rounded-full px-4 w-24"></div>
        <div className="h-8 bg-gray-200 rounded-full px-4 w-24"></div>
      </div>

      {/* Bottom row: Featured badge + Posted ago + Interviews */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8"></div>
        </div>
      </div>
    </div>
  </div>
);

const RequisitionSkeleton = () => (
  <div className="space-y-10 animate-pulse">
    <div className="h-12 bg-gray-200 rounded-lg w-full max-w-xl mb-6"></div>
    <div className="flex gap-12 mb-8">
      <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
      <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
    </div>
    <div>
      <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded"></div>
        <div className="h-5 bg-gray-200 rounded w-11/12"></div>
        <div className="h-5 bg-gray-200 rounded w-10/12"></div>
      </div>
    </div>
    <div>
      <div className="h-8 bg-gray-200 rounded-lg w-80 mb-6"></div>
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-7 bg-gray-200 rounded w-96"></div>
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div className="h-8 bg-gray-200 rounded-lg w-96 mb-6"></div>
      <div className="space-y-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-7 bg-gray-200 rounded w-80"></div>
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function MainApp() {
  const navigate = useNavigate();
  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    signOut,
    loading: authLoading,
  } = useAuth();
  const { selectedWorkspaceId } = useAuthContext();
  const [credits, setCredits] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthApp, setShowAuthApp] = useState(false);
  const [authFlow, setAuthFlow] = useState("login");
  const [showSettings, setShowSettings] = useState(false);
  const [showPipelineSharePage, setShowPipelineSharePage] = useState(false);
  const [currentPipelineId, setCurrentPipelineId] = useState("");
  const [showShareableProfile, setShowShareableProfile] = useState(false);
  const [currentCandidateId, setCurrentCandidateId] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateListItem | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [showEditJobRole, setShowEditJobRole] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  // const [showPipelineStages, setShowPipelineStages] = useState(false);
  const [showPipelineStages, setShowPipelineStages] = useState(() => {
    const stored = sessionStorage.getItem("showPipelineStages");
    return stored ? JSON.parse(stored) : false;
  });
  const [editingTemplate, setEditingTemplate] = useState<string>("");
  const [activeTab, setActiveTab] = useState("outbound");
  const [searchTerm, setSearchTerm] = useState("");

  const [showCategoryActions, setShowCategoryActions] = useState<number | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showUnpublishModal, setShowUnpublishModal] = useState<number | null>(
    null,
  );
  const [sourcingCounts, setSourcingCounts] = useState({
    inbound: 0,
    outbound: 0,
    active: 0,
    prevetted: 0,
  });
  const [showPublishModal, setShowPublishModal] = useState<number | null>(null);
  const [showShareLoader, setShowShareLoader] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const debouncedProjectSearch = useDebounce(projectSearchQuery, 500);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    () => {
      const stored = sessionStorage.getItem("activeCategoryId");
      return stored ? JSON.parse(stored) : null;
    },
  );
  const [activeCategoryTotalCount, setActiveCategoryTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logos, setLogos] = useState<Record<string, string | null | undefined>>(
    {},
  );

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
      console.error(`Error fetching logo for ${query}:`, error);
      setLogos((prev) => ({ ...prev, [query]: undefined }));
    }
  };

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
  const [showRequisitionInfoModal, setShowRequisitionInfoModal] =
    useState(false);
  const [jobDataForModal, setJobDataForModal] = useState<Job | null>(null);
  const [competenciesData, setCompetenciesData] = useState<any>(null);
  const [loadingCompetencies, setLoadingCompetencies] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(
    null,
  );
  const [currentRequisitionPage, setCurrentRequisitionPage] =
    useState<number>(1);
  const [currentJobIdForModal, setCurrentJobIdForModal] = useState<
    number | null
  >(null);
  const [defaultBoolQuery, setDefaultBoolQuery] = useState<string>("");
  // Initialize hasSelectedJob from sessionStorage (or false if not present)
  const [hasSelectedJob, setHasSelectedJob] = useState(() => {
    const stored = sessionStorage.getItem("hasSelectedJob");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    sessionStorage.setItem("hasSelectedJob", JSON.stringify(hasSelectedJob));
  }, [hasSelectedJob]);

  useEffect(() => {
    sessionStorage.setItem(
      "activeCategoryId",
      JSON.stringify(activeCategoryId),
    );
  }, [activeCategoryId]);

  useEffect(() => {
    sessionStorage.setItem(
      "showPipelineStages",
      JSON.stringify(showPipelineStages),
    );
  }, [showPipelineStages]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const workspaceData = await organizationService.getMyWorkspaces();
        const mappedWorkspaces: Workspace[] = workspaceData.map(
          (ws: MyWorkspace) => ({
            id: ws.id,
            name: ws.name,
          }),
        );
        setWorkspaces(mappedWorkspaces);
      } catch (error) {
        showToast.error("Failed to fetch workspaces");
        console.error("Error fetching workspaces:", error);
      }
    };
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated]);
  const [filters, setFilters] = useState<Filters>({
    keywords: "",
    booleanSearch: false,
    semanticSearch: false,
    selectedCategories: [],
    minExperience: "",
    maxExperience: "",
    funInCurrentCompany: false,
    minTotalExp: "",
    maxTotalExp: "",
    city: "",
    country: "",
    locations: [],
    noticePeriod: "",
    companies: "",
    industries: "",
    minSalary: "",
    maxSalary: "",
    colleges: "",
    topTierUniversities: false,
    computerScienceGraduates: false,
    showFemaleCandidates: false,
    recentlyPromoted: false,
    backgroundVerified: false,
    hasCertification: false,
    hasResearchPaper: false,
    hasLinkedIn: false,
    hasBehance: false,
    hasTwitter: false,
    hasPortfolio: false,
    jobId: "",
    application_type: "",
    is_prevetted: false,
    is_active: false,
    sort_by: "",
    boolQuery: "",
    inbound_source: null,
  });
  useEffect(() => {
    setIsSearchMode(debouncedSearchQuery.trim() !== "");
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (activeTab !== "inbound") {
      setFilters((prev) => ({ ...prev, inbound_source: null }));
    }
  }, [activeTab]);

  useEffect(() => {
    if (categories.length > 0) {
      const uniqueCompanies = Array.from(
        new Set(categories.map((c) => c.companyName)),
      );
      uniqueCompanies.forEach((company) => {
        if (
          company &&
          company !== "Confidential" &&
          logos[company] === undefined
        ) {
          fetchLogo(company);
        }
      });
    }
  }, [categories, logos]);

  useEffect(() => {
    if (activeCategoryId) {
      fetchJobDetailsAndSetFilters(activeCategoryId);
    }
  }, [activeCategoryId]);

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

        // Map work approach
        let workApproach = "Hybrid";
        if (job.work_approach === "ONSITE") workApproach = "Onsite";
        else if (job.work_approach === "REMOTE") workApproach = "Remote";

        // Joining timeline - you can customize this logic
        // For now, assuming "Immediate" if not specified otherwise
        const joiningTimeline = "Immediate"; // You can enhance this later
        const postedAgo = job.created_at ? getTimeAgo(job.created_at) : "today";
        // Company name
        const companyName = job.workspace_details?.name || "Confidential";

        return {
          id: job.id,
          name: job.title,
          companyName,
          experience,
          location,
          workApproach,
          joiningTimeline,
          inboundCount: job.inbound_count || 0,
          shortlistedCount: job.shortlisted_candidate_count || 0,
          totalApplied: job.total_applied || 0,
          totalReplied: job.total_replied || 0,
          status: job.status,
          visibility: job.visibility,
          invites_sent: job.invites_sent || 0,
          postedAgo,
        };
      });
      setCategories(mappedCategories);
      setCurrentRequisitionPage(1);

      setCategories(mappedCategories);
      setCurrentRequisitionPage(1);

      // ── RESTORE + VALIDATE HERE ──
      if (isAuthenticated) {
        // Restore from storage
        const storedHas = sessionStorage.getItem("hasSelectedJob");
        let restoredHas = storedHas ? JSON.parse(storedHas) : false;

        const storedId = sessionStorage.getItem("activeCategoryId");
        let restoredId = storedId ? JSON.parse(storedId) : null;

        const storedStages = sessionStorage.getItem("showPipelineStages");
        let restoredStages = storedStages ? JSON.parse(storedStages) : false;

        // Validate restored job ID exists
        if (restoredId && !mappedCategories.some((c) => c.id === restoredId)) {
          restoredId = mappedCategories[0]?.id || null;
          restoredHas = !!restoredId;
          restoredStages = false;
        }

        // If no categories at all → force reset
        if (mappedCategories.length === 0) {
          restoredId = null;
          restoredHas = false;
          restoredStages = false;
        }

        // Apply validated values
        setActiveCategoryId(restoredId);
        console.log("Restored hasSelectedJob:", restoredHas);
        setHasSelectedJob(restoredHas);
        setShowPipelineStages(restoredStages);

        // Re-fetch job details if we have a valid job
        if (restoredId) {
          fetchJobDetailsAndSetFilters(restoredId);
        }
      }
    } catch (error) {
      showToast.error("Failed to fetch job categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };
  const fetchJobDetailsAndSetFilters = async (jobId: number) => {
    try {
      const job = await jobPostService.getJob(jobId);
      const newFilters = {
        ...filters,
        jobId: job.id.toString(),
        keywords: job.skills ? job.skills.join(", ") : "",
        minTotalExp: job.experience_min_years
          ? job.experience_min_years.toString()
          : "",
        maxTotalExp: job.experience_max_years
          ? job.experience_max_years.toString()
          : "",
        application_type: activeTab,
        sort_by: sortBy,
      };
      setFilters(newFilters);
      await fetchCandidates(1, newFilters);
    } catch (error) {
      showToast.error("Failed to fetch job details");
      console.error("Error fetching job details:", error);
    }
  };
  const fetchCandidates = useCallback(
    async (page: number = 1, appliedFilters: any) => {
      setLoadingCandidates(true);
      try {
        let response: CandidateSearchResponse;
        if (debouncedSearchQuery.trim() !== "") {
          response = await candidateService.universalSearch(
            debouncedSearchQuery,
            controller.signal,
          );
          const candidates = response.results.map((candidate: any) => ({
            ...candidate,
          }));
          setCandidates(candidates);
          setTotalCount(candidates.length);
          if (response.sourcing_counts) {
            setSourcingCounts(response.sourcing_counts);
          }
          if (candidates.length > 0 && !selectedCandidate) {
            setSelectedCandidate(candidates[0]);
          }
          setFilters({
            keywords: "",
            booleanSearch: false,
            semanticSearch: false,
            selectedCategories: [],
            minExperience: "",
            maxExperience: "",
            funInCurrentCompany: false,
            minTotalExp: "",
            maxTotalExp: "",
            city: "",
            country: "",
            locations: [],
            noticePeriod: "",
            companies: "",
            industries: "",
            minSalary: "",
            maxSalary: "",
            colleges: "",
            topTierUniversities: false,
            computerScienceGraduates: false,
            showFemaleCandidates: false,
            recentlyPromoted: false,
            backgroundVerified: false,
            hasCertification: false,
            hasResearchPaper: false,
            hasLinkedIn: false,
            hasBehance: false,
            hasTwitter: false,
            hasPortfolio: false,
            jobId: appliedFilters.jobId || "",
            application_type: "",
            is_prevetted: false,
            is_active: false,
            sort_by: sortBy || "",
            boolQuery: "",
          });
          setDefaultBoolQuery(""); // NEW
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          response = await candidateService.getCandidates(appliedFilters, page);
          if (response.boolean_search_terms) {
            // Assume API returns 'bool_query' field
            localStorage.setItem(
              `bool_query_${appliedFilters.jobId}`,
              response.boolean_search_terms,
            );
            setDefaultBoolQuery(response.boolean_search_terms); // For FiltersSidebar
          } else {
            setDefaultBoolQuery(""); // Clear if none
          }
          setCandidates(response.results);
          setTotalCount(response.count);
          if (response.sourcing_counts) {
            setSourcingCounts(response.sourcing_counts);
          }
          setDefaultBoolQuery(response.boolean_search_terms || "");
          if (response.results.length === 0) {
            setSelectedCandidate(null);
            showToast.error("No results found for the applied filters.");
          } else if (response.results.length > 0) {
            setSelectedCandidate(response.results[0]);
          }
        }
      } catch (error) {
        showToast.error("Failed to fetch app candidates");
        console.error("Error fetching candidates:", error);
        setCandidates([]);
        setTotalCount(0);
        setSelectedCandidate(null);
      } finally {
        setLoadingCandidates(false);
      }
    },
    [selectedCandidate, debouncedSearchQuery, sortBy, filters, activeTab],
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  const handleCandidatesUpdate = (
    newCandidates: CandidateListItem[],
    count: number,
  ) => {
    setCandidates(newCandidates);
    setTotalCount(count);
    if (newCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(newCandidates[0]);
    } else if (newCandidates.length === 0) {
      setSelectedCandidate(null);
    } else {
      const updatedSelected = newCandidates.find(
        (c) => c.id === selectedCandidate?.id,
      );
      if (updatedSelected) {
        setSelectedCandidate(updatedSelected);
      }
    }
  };

  const handleBackToCategories = () => {
    setActiveCategoryId(null);
    setHasSelectedJob(false);
    setSelectedCandidate(null);
  };

  const handleJobCreatedOrUpdated = () => {
    fetchCategories();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, debouncedProjectSearch]);

  useEffect(() => {
    const newFilters = {
      ...filters,
      application_type: activeTab,
      is_prevetted: activeTab === "prevetted",
      is_active: activeTab === "active",
      sort_by: sortBy,
      inbound_source: filters.inbound_source,
    };
    setFilters(newFilters);
    if (activeCategoryId) {
      fetchCandidates(currentPage, newFilters);
    }
  }, [
    activeTab,
    filters.inbound_source,
    sortBy,
    debouncedSearchQuery,
    isAuthenticated,
    currentPage,
  ]);
  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        const data = await creditService.getCreditBalance();
        setCredits(data.credit_balance);
      } catch (error) {
        showToast.error("Failed to fetch credit balance");
      }
    };
    if (isAuthenticated) {
      fetchCreditBalance();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userStatus) {
      const user: User = {
        id: firebaseUser?.uid,
        fullName: userStatus.full_name || "Unknown User",
        isSuperAdmin: userStatus.isSuperAdmin || false, // New: Add this
        email: userStatus.email || "Unknown@user.com",
        role:
          userStatus.roles?.length > 0
            ? userStatus.roles[0].name.toLowerCase()
            : "team",
        organizationId: userStatus.organization?.id?.toString(),
        workspaceIds: userStatus.roles
          .filter(
            (role) =>
              role.workspace_id !== null && role.workspace_id !== undefined,
          )
          .map((role) => Number(role.workspace_id)),
        isVerified: firebaseUser?.emailVerified ?? true,
        createdAt:
          firebaseUser?.metadata.creationTime || new Date().toISOString(),
      };
      console.log("current user he ye:", user);
      setCurrentUser(user);
    }
  }, [isAuthenticated, userStatus, firebaseUser]);

  useEffect(() => {
    const path = window.location.pathname;
    const pipelineMatch = path.match(/^\/pipelines\/(.+)$/);
    const candidateMatch = path.match(/^\/candidate-profiles\/(.+)$/);
    if (pipelineMatch) {
      setCurrentPipelineId(pipelineMatch[1]);
      setShowPipelineSharePage(true);
    } else if (candidateMatch) {
      setCurrentCandidateId(candidateMatch[1]);
      setShowShareableProfile(true);
    }
  }, []);
  const updateCandidateEmail = (
    candidateId: string,
    candidate_email: string,
    candidate_phone: string,
  ) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((cand) =>
        cand.id === candidateId
          ? { ...cand, candidate_email, candidate_phone }
          : cand,
      ),
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate((prev) =>
        prev ? { ...prev, candidate_email, candidate_phone } : prev,
      );
    }
  };
  const deductCredits = async () => {
    try {
      const data = await creditService.getCreditBalance();
      setCredits(data.credit_balance);
    } catch (error) {
      showToast.error("Failed to update credit balance");
    }
  };
  const handleOpenLogoutModal = () => {
    setShowLogoutModal(true);
  };
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };
  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      setCurrentUser(null);
      setShowAuthApp(false);
      setShowSettings(false);
      setSelectedCandidate(null);
      setShowTemplateSelector(false);
      setShowCreateJobRole(false);
      setShowEditTemplate(false);
      setShowPipelineStages(false);
      setSearchTerm("");
      setSortBy("");
      setFilters({
        keywords: "",
        booleanSearch: false,
        semanticSearch: false,
        selectedCategories: [],
        minExperience: "",
        maxExperience: "",
        funInCurrentCompany: false,
        minTotalExp: "",
        maxTotalExp: "",
        city: "",
        country: "",
        locations: [],
        noticePeriod: "",
        companies: "",
        industries: "",
        minSalary: "",
        maxSalary: "",
        colleges: "",
        topTierUniversities: false,
        computerScienceGraduates: false,
        showFemaleCandidates: false,
        recentlyPromoted: false,
        backgroundVerified: false,
        hasCertification: false,
        hasResearchPaper: false,
        hasLinkedIn: false,
        hasBehance: false,
        hasTwitter: false,
        hasPortfolio: false,
        jobId: "",
        application_type: "",
        is_prevetted: false,
        is_active: false,
        sort_by: "",
        boolQuery: "", // NEW
      });
      setDefaultBoolQuery("");
      sessionStorage.removeItem("hasSelectedJob");
      sessionStorage.removeItem("activeCategoryId");
      sessionStorage.removeItem("showPipelineStages");
      showToast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      showToast.error("Failed to logout");
    }
  };
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };
  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthApp(false);
    navigate("/");
  };
  const handleLinkedInAuthSuccess = (user: any) => {
    setCurrentUser(user);
    if (userStatus?.is_onboarded) {
      navigate("/");
    } else {
      navigate("/workspaces-org");
    }
  };
  const handleSendInvite = () => {
    setShowTemplateSelector(true);
  };
  const handleBackFromTemplate = () => {
    setShowTemplateSelector(false);
  };
  const handleCreateJobRole = () => {
    setShowCreateJobRole(true);
  };

  const handleRequisitionInfo = async (jobId: number) => {
    setCurrentJobIdForModal(jobId);
    setLoadingCompetencies(true);
    setJobDataForModal(null);
    setCompetenciesData(null);
    try {
      // Fetch job details for title/experience/location, and competencies in parallel
      const [job, comp] = await Promise.all([
        jobPostService.getJob(jobId),
        jobPostService.getJobCompetencies(jobId),
      ]);
      setJobDataForModal(job);
      setCompetenciesData(comp);
    } catch (error) {
      showToast.error("Failed to fetch requisition info");
    } finally {
      setLoadingCompetencies(false);
      setShowRequisitionInfoModal(true);
    }
  };

  const handleCloseRequisitionModal = () => {
    setShowRequisitionInfoModal(false);
    setJobDataForModal(null);
    setCompetenciesData(null);
    setLoadingCompetencies(false);
    setCurrentJobIdForModal(null);
  };

  const handleEditJobRole = async (jobId: number) => {
    try {
      const jobs = await jobPostService.getJobs();
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        setEditingJobId(job.id);
        setShowEditJobRole(true);
      } else {
        showToast.error("Job not found");
      }
    } catch (error) {
      showToast.error("Failed to fetch job details");
    }
    setShowCategoryActions(null);
  };
  const handleCopyJobLink = (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      const jobLink = `${window.location.origin}/jobs/${job.id}/`;
      navigator.clipboard
        .writeText(jobLink)
        .then(() => {
          showToast.success(`Job link copied to clipboard: ${job.name}`);
        })
        .catch(() => {
          showToast.error("Failed to copy job link");
        });
    } else {
      showToast.error("Job not found");
    }
    setShowCategoryActions(null);
  };

  const handleCopyJobID = (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      const jobLink = `${job.name}, ${job.location} (Job ID: ${job.id})`;
      navigator.clipboard
        .writeText(jobLink)
        .then(() => {
          showToast.success(`Job link copied to clipboard: ${job.name}`);
        })
        .catch(() => {
          showToast.error("Failed to copy job link");
        });
    } else {
      showToast.error("Job not found");
    }
    setShowCategoryActions(null);
  };

  const handleDeleteJobRole = async (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      try {
        await jobPostService.deleteJob(jobId);
        await fetchCategories();
        showToast.success(`Successfully deleted job ${job.name}`);
        if (activeCategoryId === jobId) {
          setActiveCategoryId(categories[0]?.id || null);
        }
      } catch (error) {
        showToast.error("Failed to delete job role");
      }
    }
    setShowDeleteModal(null);
    setShowCategoryActions(null);
  };
  const handleUnpublishJobRole = async (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      try {
        await jobPostService.unpublishJob(jobId);
        await jobPostService.updateJob(jobId, {
          status: "DRAFT",
          visibility: "PRIVATE",
        });
        await fetchCategories();
        showToast.success(`Successfully unpublished job ${job.name}`);
        if (activeCategoryId === jobId) {
          setActiveCategoryId(categories[0]?.id || null);
        }
      } catch (error) {
        showToast.error("Failed to unpublish job role");
      }
    }
    setShowUnpublishModal(null);
    setShowCategoryActions(null);
  };
  const handlePublishJobRole = async (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      try {
        await jobPostService.updateJob(jobId, {
          status: "PUBLISHED",
          visibility: "PUBLIC",
        });
        await fetchCategories();
        showToast.success(`Successfully published job ${job.name}`);
        if (activeCategoryId === jobId) {
          setActiveCategoryId(categories[0]?.id || null);
        }
      } catch (error) {
        showToast.error("Failed to publish job role");
      }
    }
    setShowPublishModal(null);
    setShowCategoryActions(null);
  };
  const handleEditTemplate = (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
      setEditingTemplate(job.name);
      setShowEditTemplate(true);
    }
    setShowCategoryActions(null);
  };
  const handleSharePipelines = (jobId: number) => {
    window.location.href = `/pipelines/${jobId}`;
  };
  const handleShareLoaderComplete = () => {
    setShowShareLoader(false);
    const job = categories.find((cat) => cat.id === activeCategoryId);
    if (job) {
      const pipelineId = job.id.toString();
      setCurrentPipelineId(pipelineId);
      setShowPipelineSharePage(true);
      window.history.pushState({}, "", `/pipelines/${pipelineId}`);
    }
  };
  const handleCategoryAction = (action: string, jobId: number) => {
    setShowCategoryActions(null);
    switch (action) {
      case "requisition-info":
        handleRequisitionInfo(jobId);
        break;
      case "edit-job":
        handleEditJobRole(jobId);
        break;
      case "copy-link":
        handleCopyJobLink(jobId);
        break;
      case "edit-template":
        handleEditTemplate(jobId);
        break;
      case "share-pipelines":
        handleSharePipelines(jobId);
        break;
      case "archive":
        showToast.success(`Feature Coming Soon`);
        break;
      case "publish-job":
        setShowPublishModal(jobId);
        break;
      case "unpublish-job":
        setShowUnpublishModal(jobId);
        break;
      case "delete":
        setShowDeleteModal(jobId);
        break;
    }
  };
  const handlePipelinesClick = () => {
    setShowPipelineStages(true);
  };
  const handleBackFromPipelines = () => {
    setShowPipelineStages(false);
  };
  const handleBackFromPipelineShare = () => {
    setShowPipelineSharePage(false);
    setCurrentPipelineId("");
    window.history.pushState({}, "", "/");
  };
  const handleBackFromShareableProfile = () => {
    setShowShareableProfile(false);
    window.history.pushState({}, "", "/");
  };
  const handleUpdateCandidate = (updated: CandidateListItem) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    if (selectedCandidate?.id === updated.id) {
      setSelectedCandidate(updated);
    }
  };
  const handleApplyFilters = (newFilters: any) => {
    // Validate numeric inputs if provided
    const isValidNumber = (value: string) => /^\d+$/.test(value);
    if (
      (newFilters.minTotalExp && !isValidNumber(newFilters.minTotalExp)) ||
      (newFilters.maxTotalExp && !isValidNumber(newFilters.maxTotalExp)) ||
      (newFilters.minExperience && !isValidNumber(newFilters.minExperience)) ||
      (newFilters.minSalary && !isValidNumber(newFilters.minSalary)) ||
      (newFilters.maxSalary && !isValidNumber(newFilters.maxSalary))
    ) {
      showToast.error(
        "Invalid input in experience or salary fields. Please enter numbers only.",
      );
      setCandidates([]);
      setTotalCount(0);
      setCurrentPage(1);
      setSelectedCandidate(null);
      return;
    }
    // Validate range logic if provided
    if (
      newFilters.minTotalExp &&
      newFilters.maxTotalExp &&
      Number(newFilters.minTotalExp) > Number(newFilters.maxTotalExp)
    ) {
      showToast.error(
        "Minimum total experience cannot be greater than maximum.",
      );
      setCandidates([]);
      setTotalCount(0);
      setCurrentPage(1);
      setSelectedCandidate(null);
      return;
    }
    if (
      newFilters.minSalary &&
      newFilters.maxSalary &&
      Number(newFilters.minSalary) > Number(newFilters.maxSalary)
    ) {
      showToast.error("Minimum salary cannot be greater than maximum.");
      setCandidates([]);
      setTotalCount(0);
      setCurrentPage(1);
      setSelectedCandidate(null);
      setFilters((prev) => ({
        ...prev,
        enableBooleanAnalysis: false,
        boolQuery: "",
      }));
      return;
    }
    // Update filters and fetch candidates
    setFilters({ ...newFilters });
    fetchCandidates(1, newFilters);
  };
  function InvitePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite_token");
    const workspaceName = searchParams.get("workspace_name") || "the workspace";
    const {
      user: firebaseUser,
      userStatus,
      isAuthenticated,
      signOut,
      loading: authLoading, // UPDATED: Add authLoading
    } = useAuth();
    const { setSelectedWorkspaceId: contextSetSelectedWorkspaceId } =
      useAuthContext();
    const [claiming, setClaiming] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    useEffect(() => {
      if (!inviteToken) {
        showToast.error("Invalid invite link.");
        navigate("/");
        return;
      }
      // UPDATED: Trigger claim only after auth fully resolves and user is authenticated
      if (!authLoading && isAuthenticated && !claiming && !successData) {
        handleClaimInvite();
      }
    }, [authLoading, isAuthenticated, inviteToken]); // UPDATED: Add authLoading to deps
    const handleClaimInvite = async () => {
      if (!inviteToken || claiming) return;
      setClaiming(true);
      try {
        console.log("Claiming invite with token:", inviteToken);
        const data =
          await organizationService.claimWorkspaceInvite(inviteToken);
        console.log("Claim response:", data);
        showToast.success("Successfully joined the workspace!");
        contextSetSelectedWorkspaceId(data.workspace.id);
        Cookies.set("selectedWorkspaceId", data.workspace.id.toString(), {
          expires: 7,
        });
        const refreshedWorkspaces = await organizationService.getMyWorkspaces();
        console.log("Refreshed workspaces after join:", refreshedWorkspaces);
        setSuccessData(data.workspace);
      } catch (error: any) {
        const errorMsg = error.message;
        if (errorMsg.includes("expired")) {
          showToast.error("Invitation expired.");
        } else if (errorMsg.includes("different email")) {
          showToast.error(
            "You are logged in with a different email than the invited recipient. Please sign out and sign in with the invited email.",
          );
          await signOut();
        } else if (errorMsg.includes("different organization")) {
          showToast.error("User belongs to a different organization.");
        } else if (errorMsg.includes("authentication")) {
          showToast.error("Authentication required. Please sign in.");
          navigate("/");
        } else {
          showToast.error("Failed to join workspace.");
        }
        console.error("Claim invite error:", error);
      } finally {
        setClaiming(false);
      }
    };
    // UPDATED: Show loading if authLoading (prevents flash of fallback)
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="space-y-4 mb-10">
              <div className="h-5 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-11/12"></div>
              <div className="h-5 bg-gray-200 rounded w-10/12"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }

    if (claiming) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-11/12 mx-auto"></div>
          </div>
        </div>
      );
    }
    if (successData) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to {successData.name}!
            </h3>
            <p className="text-gray-600 mb-6">
              You've successfully joined the "{successData.name}" workspace in{" "}
              {successData.organization_name}.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    // UPDATED: Fallback only after authLoading resolves and !isAuthenticated
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <p className="text-gray-600 mb-4">
            To accept this invite and join {workspaceName}, please sign in
            first.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  if (authLoading) {
    const location = useLocation();

    if (location.pathname.startsWith("/pipelines/")) {
      return <PipelineSkeletonLoader />;
    }

    return (
      <div className="zoom-80-container">
        <div className="min-h-screen bg-gray-50">
          {/* Header skeleton */}
          <div className="sticky top-0 bg-white shadow-sm z-40 animate-pulse">
            <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
              <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
              <div className="flex items-center gap-8">
                <div className="h-12 bg-gray-200 rounded-lg w-96"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Welcome + search bar skeleton */}
          <div className="container mx-auto py-6">
            <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto mb-4">
              <div className="h-10 bg-gray-200 rounded-lg w-48"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-96"></div>
            </div>

            {/* Project grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProjectSkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guard component for super admin (adjusted for your role-based auth)
  const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { user, loading, isAuthenticated } = useAuthContext(); // Uses your context

    // Wait for BOTH loading AND user to be ready (prevents race/flash)
    if (loading || !user) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Adjusted check: Use your user.role instead of customClaims.is_staff
    // Change 'admin' to your actual super admin role (e.g., 'super_admin')
    if (!isAuthenticated || !user.isSuperAdmin) {
      window.location.href = "/"; // Redirect to home/login
    }

    return <>{children}</>;
  };

  // Logout handler (ties into your context)
  const handleLogout = async () => {
    const { signOut } = useAuthContext();
    await signOut(); // Uses your existing signOut
    window.location.href = "/"; // Or use <Navigate> if in a component
  };

  const job = categories.find((cat) => cat.id === Number(currentPipelineId));
  return (
    <>
      <Routes>
        {/* New super admin route (guarded) */}
        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard onLogout={handleLogout} />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/candidate-profiles/:candidateId"
          element={<ShareableProfile />}
        />
        <Route
          path="/linkedin-auth"
          element={
            <LinkedInAuth
              onNavigate={(flow: string) => {
                setAuthFlow(flow);
                navigate(`/${flow}`);
              }}
              onLogin={handleLinkedInAuthSuccess}
            />
          }
        />
        <Route
          path="/pipelines/:pipelineId"
          element={
            <PipelineSharePage
              pipelineName={job?.name || "Pipeline Name"}
              location={job?.location || "Location"}
              experience={job?.experience || "Experience"}
              workMode={job?.workApproach || "Work Mode"}
              notice={job?.joiningTimeline || "Immidiate(max 15 days)"}
              onBack={handleBackFromPipelineShare}
            />
          }
        />
        <Route path="/jobs/:id" element={<JobApplicationForm />} />
        <Route
          path="/candidate-profiles/:candidateId"
          element={
            <ShareableProfile
              candidateId={currentCandidateId}
              onBack={handleBackFromShareableProfile}
            />
          }
        />
        <Route
          path="/background-verification/:candidateId"
          element={<CandidateBackGroundCheck />}
        />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/terms-and-policies" element={<TermsAndConditions />} />
        <Route
          path="/settings"
          element={
            <Settings
              onBack={() => {
                setShowSettings(false);
                navigate("/");
              }}
              user={currentUser}
            />
          }
        />
        <Route
          path="/workspaces-org"
          element={
            <AuthApp
              initialFlow="workspaces-org"
              initialUser={isAuthenticated ? currentUser : null}
              onAuthSuccess={handleAuthSuccess}
              onClose={() => {
                setShowAuthApp(false);
                navigate("/");
              }}
              onLogout={handleLogoutConfirm}
            />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="zoom-80-container">
                {showPipelineSharePage ? (
                  <PipelineSharePage
                    pipelineName={job?.name || "Pipeline Name"}
                    onBack={handleBackFromPipelineShare}
                  />
                ) : showShareableProfile ? (
                  <ShareableProfile
                    candidateId={currentCandidateId}
                    onBack={handleBackFromShareableProfile}
                  />
                ) : showPipelineStages ? (
                  <>
                    <Toaster />
                    <PipelineStages
                      onBack={handleBackFromPipelines}
                      onOpenLogoutModal={handleOpenLogoutModal}
                      onSendInvite={handleSendInvite}
                      deductCredits={deductCredits}
                      initialJobId={activeCategoryId}
                    />
                  </>
                ) : categories.length === 0 ? (
                  <div className="min-h-screen bg-gray-50">
                    <div className="sticky top-0 bg-white z-40 shadow-sm">
                      <Header
                        onCreateRole={handleCreateJobRole}
                        onOpenLogoutModal={handleOpenLogoutModal}
                        credits={credits}
                        searchQuery={""}
                        setSearchQuery={() => {}}
                        showCreateRoleButton={true}
                        showSearchBar={false}
                      />
                    </div>
                  </div>
                ) : !hasSelectedJob ? (
                  <div className="min-h-screen bg-gray-50">
                    <div className="sticky top-0 bg-white z-40 shadow-sm">
                      <Header
                        onCreateRole={handleCreateJobRole}
                        onOpenLogoutModal={handleOpenLogoutModal}
                        credits={credits}
                        searchQuery={""}
                        setSearchQuery={() => {}}
                        showCreateRoleButton={true}
                        showSearchBar={false}
                      />
                    </div>

                    <div className="container mx-auto p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-medium ">
                          Requisitions List
                        </h1>
                        <div className="relative w-[544px] h-[59px] bg-white rounded-xl">
                          <input
                            type="text"
                            placeholder="Search Projects"
                            value={projectSearchQuery}
                            onChange={(e) =>
                              setProjectSearchQuery(e.target.value)
                            }
                            className="w-full h-full bg-white rounded-[5px] pl-5 pr-16 text-lg text-[#4B5563] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B5563]/20"
                          />
                          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-[35px] bg-[#0F47F2] rounded-md flex items-center justify-center hover:bg-[#0d3ec9] transition-colors">
                            <Search
                              className="w-[22px] h-[20px] text-white font-semibold"
                              strokeWidth={1.45}
                            />
                          </button>
                          {/* Optional: Clear button when typing */}
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
                          <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                              {debouncedProjectSearch.trim()
                                ? `No projects found for "${debouncedProjectSearch}"`
                                : "No job roles created yet"}
                            </h2>
                            {!debouncedProjectSearch.trim() && (
                              <button
                                onClick={handleCreateJobRole}
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
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const itemsPerPage = 8;
                            const startIndex =
                              (currentRequisitionPage - 1) * itemsPerPage;
                            const endIndex = startIndex + itemsPerPage;
                            const currentCategories = categories.slice(
                              startIndex,
                              endIndex,
                            );

                            return (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                  {currentCategories.map((job) => (
                                    <div
                                      key={job.id}
                                      className="rounded-[10px] transition-all duration-300"
                                    >
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
                                        isActive={activeCategoryId === job.id}
                                        onEditJobRole={handleEditJobRole}
                                        onArchiveJob={() =>
                                          showToast.success(
                                            "Archive coming soon",
                                          )
                                        }
                                        onSharePipelines={handleSharePipelines}
                                        onPublishJob={handlePublishJobRole}
                                        onCopyJobID={handleCopyJobID}
                                        onUnpublishJob={handleUnpublishJobRole}
                                        onSelectCard={() => {
                                          setActiveCategoryId(job.id);
                                          setHasSelectedJob(true);
                                          fetchJobDetailsAndSetFilters(job.id);
                                        }}
                                        logoUrl={logos[job.companyName]}
                                      />
                                    </div>
                                  ))}
                                </div>
                                {categories.length > 0 && (
                                  <div className="mt-4 py-2 px-8 pt-2 flex items-center border-t-[0.5px] border-[#E5E7EB] justify-between w-full">
                                    <div className="text-gray-400 text-lg">
                                      Showing{" "}
                                      {(currentRequisitionPage - 1) * 8 + 1} to{" "}
                                      {Math.min(
                                        currentRequisitionPage * 8,
                                        categories.length,
                                      )}{" "}
                                      of {categories.length} requisitions
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() =>
                                          setCurrentRequisitionPage((prev) =>
                                            Math.max(prev - 1, 1),
                                          )
                                        }
                                        disabled={currentRequisitionPage === 1}
                                        className="text-gray-400 hover:text-white disabled:opacity-50"
                                      >
                                        <ChevronLeft className="w-6 h-6" />
                                      </button>

                                      {Array.from(
                                        {
                                          length: Math.ceil(
                                            categories.length / 8,
                                          ),
                                        },
                                        (_, i) => i + 1,
                                      ).map((page) => (
                                        <button
                                          key={page}
                                          onClick={() =>
                                            setCurrentRequisitionPage(page)
                                          }
                                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                                            page === currentRequisitionPage
                                              ? "bg-blue-600 text-white"
                                              : "bg-white text-black hover:bg-gray-200"
                                          }`}
                                        >
                                          {page}
                                        </button>
                                      ))}

                                      <button
                                        onClick={() =>
                                          setCurrentRequisitionPage((prev) =>
                                            Math.min(
                                              prev + 1,
                                              Math.ceil(categories.length / 8),
                                            ),
                                          )
                                        }
                                        disabled={
                                          currentRequisitionPage ===
                                          Math.ceil(categories.length / 8)
                                        }
                                        className="text-gray-400 hover:text-white disabled:opacity-50"
                                      >
                                        <ChevronRight className="w-6 h-6" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}

                      <CreateJobRoleModal
                        isOpen={showCreateJobRole}
                        workspaceId={selectedWorkspaceId || 1}
                        workspaces={workspaces}
                        handlePipelinesClick={handlePipelinesClick}
                        onClose={() => setShowCreateJobRole(false)}
                        onJobCreated={handleJobCreatedOrUpdated}
                      />
                      <EditJobRoleModal
                        isOpen={showEditJobRole}
                        onClose={() => {
                          setShowEditJobRole(false);
                          setEditingJobId(null);
                        }}
                        handlePipelinesClick={handlePipelinesClick}
                        workspaces={workspaces}
                        workspaceId={selectedWorkspaceId || 1}
                        jobId={editingJobId || 0}
                        onJobUpdated={handleJobCreatedOrUpdated}
                      />
                      <EditTemplateModal
                        jobId={String(activeCategoryId)}
                        isOpen={showEditTemplate}
                        onClose={() => setShowEditTemplate(false)}
                        templateName={editingTemplate}
                      />

                      {showLogoutModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-6 h-6 text-red-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Logout
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to sign out? You'll need
                                to log in again to access your account.
                              </p>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleCloseLogoutModal}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleLogoutConfirm}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Sign Out
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showPublishModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-green-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Publish Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to publish{" "}
                                {
                                  categories.find(
                                    (cat) => cat.id === showPublishModal,
                                  )?.name
                                }
                                ? This action will publish job on LinkedIn,
                                Google Jobs,Times Ascent, Cutshort and others.
                              </p>
                              <span className="text-gray-400 text-sm mb-6">
                                (Note: Once published, the job will be visible
                                on both platforms within 24–48 hours.)
                              </span>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowPublishModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handlePublishJobRole(showPublishModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Publish
                                </button>
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
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Unpublish Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to Unpublish
                                {
                                  categories.find(
                                    (cat) => cat.id === showUnpublishModal,
                                  )?.name
                                }
                                ? This action cannot be undone.
                              </p>
                              <span className="text-gray-400 text-sm mb-6">
                                (Note: this action will unpublish job on
                                published over LinkedIn, Google Jobs,Times
                                Ascent, Cutshort and others within 24–48 hours.)
                              </span>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowUnpublishModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleUnpublishJobRole(showUnpublishModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Unpublish
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Delete Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to delete{" "}
                                {
                                  categories.find(
                                    (cat) => cat.id === showDeleteModal,
                                  )?.name
                                }
                                ? This action cannot be undone.
                              </p>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowDeleteModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteJobRole(showDeleteModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showRequisitionInfoModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-end overflow-y-auto">
                          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[100vh] overflow-y-auto p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="w-8 h-8 text-gray-800"
                                  onClick={handleCloseRequisitionModal}
                                >
                                  <ArrowLeft className="w-8 h-8" />
                                </button>
                                <h1 className="text-lg font-semibold text-gray-800">
                                  Requisition Info
                                </h1>
                              </div>
                            </div>
                            {loadingCompetencies ? (
                              <RequisitionSkeleton />
                            ) : jobDataForModal && competenciesData ? (
                              <>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                                  {jobDataForModal.title}
                                </h2>
                                <div className="flex space-x-8 mt-2 mb-6">
                                  <span className="flex items-center text-gray-500">
                                    <Briefcase className="w-4 h-4 mr-1" />{" "}
                                    {jobDataForModal.experience_min_years}+
                                    years
                                  </span>
                                  <span className="flex items-center text-gray-500">
                                    <LocateIcon className="w-4 h-4 mr-1" />{" "}
                                    {jobDataForModal.work_approach}
                                  </span>
                                  <span className="flex items-center text-gray-500">
                                    <FileSearch className="w-4 h-4 mr-1" />{" "}
                                    Immediate
                                  </span>
                                </div>

                                {/* Role Overview */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    Role Overview
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {competenciesData.role_overview}
                                  </p>
                                </div>

                                {/* The Core Expectation */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    The Core Expectation
                                  </h3>
                                  <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                                    {competenciesData.the_core_expectation.map(
                                      (item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>

                                {/* Key Responsibilities Explained */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    Key Responsibilities Explained
                                  </h3>
                                  <div className="space-y-3">
                                    {/* Functional */}
                                    {competenciesData.key_responsibilities_explained.functional.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-blue-50 rounded-lg p-4"
                                        >
                                          <div className="flex items-start space-x-3">
                                            <div>
                                              <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium text-gray-600">
                                                  {item.competency}
                                                </h4>
                                                {item.why_it_matters && (
                                                  <div className="relative group inline-block ml-2">
                                                    <svg
                                                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                      />
                                                    </svg>
                                                    <div className="absolute z-20 hidden group-hover:block bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700 shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                      {item.why_it_matters}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-400">
                                                {item.context}
                                              </p>
                                              {item.priority && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Priority: {item.priority} |
                                                  Depth: {item.depth_required}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                    {/* Leadership (new subsection for API structure) */}
                                    {competenciesData
                                      .key_responsibilities_explained
                                      .leadership &&
                                      competenciesData
                                        .key_responsibilities_explained
                                        .leadership.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                          <h4 className="font-semibold text-gray-700 mb-3">
                                            Leadership Responsibilities
                                          </h4>
                                          {competenciesData.key_responsibilities_explained.leadership.map(
                                            (item: any, idx: number) => (
                                              <div
                                                key={idx}
                                                className="bg-green-50 rounded-lg p-4"
                                              >
                                                <div className="flex items-start space-x-3">
                                                  <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                      <h5 className="font-medium text-gray-600">
                                                        {item.responsibility}
                                                      </h5>
                                                      {item.why_it_matters && (
                                                        <div className="relative group inline-block ml-2">
                                                          <svg
                                                            className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                          </svg>
                                                          <div className="absolute z-20 hidden group-hover:block bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700 shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                            {
                                                              item.why_it_matters
                                                            }
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <p className="text-sm text-gray-400">
                                                      {item.context}
                                                    </p>
                                                    {item.evidence && (
                                                      <p className="text-xs text-gray-500 mt-1">
                                                        Evidence:{" "}
                                                        {item.evidence}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {/* Required Technical Skills & Purpose */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    Required Technical Skills & Purpose
                                  </h3>
                                  <div className="space-y-3">
                                    {competenciesData.required_technical_skills_purpose.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-blue-50 rounded-lg p-4"
                                        >
                                          <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-medium text-gray-600">
                                              {item.skill}
                                            </h4>
                                            {item.why_it_matters && (
                                              <div className="relative group inline-block ml-2">
                                                <svg
                                                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                  />
                                                </svg>
                                                <div className="absolute z-20 hidden group-hover:block bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-gray-700 shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                  {item.why_it_matters}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-400">
                                            {item.context}
                                          </p>
                                          {item.priority && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Priority: {item.priority}
                                            </p>
                                          )}
                                          {item.assessment_guidance && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Assessment:{" "}
                                              {item.assessment_guidance}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                Failed to load data. Please try again.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Toaster />
                    <div className="bg-gray-50 min-h-screen">
                      <div className="sticky top-0 bg-white will-change-transform z-40">
                        <Header
                          onCreateRole={handleCreateJobRole}
                          onOpenLogoutModal={handleOpenLogoutModal}
                          credits={credits}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          showLinkedinSearchButton={true}
                          showCreateRoleButton={true}
                          showSearchBar={true}
                          candidates={candidates}
                          onSelectCandidate={setSelectedCandidate}
                          jobId={activeCategoryId ?? undefined} // Changed: Pass jobId prop
                        />
                      </div>
                      <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3 ">
                        {/* NEW CLEAN HEADER – replaces old tabs + dropdown */}
                        {categories.length > 0 && activeCategoryId && (
                          <div className="sticky top-[68px] z-30 will-change-transform bg-gray-50 border-b border-gray-200 py-4">
                            <div className="max-w-full flex items-center justify-between px-4 lg:px-6">
                              {/* Left side – Job title + chips */}
                              <div className="flex items-center gap-8">
                                {/* back button to the job list */}
                                <button
                                  onClick={handleBackToCategories}
                                  className="group flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                                  aria-label="Back to job list"
                                >
                                  <svg
                                    width="37"
                                    height="37"
                                    viewBox="0 0 37 37"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M16.2336 8.4324C16.6851 8.88394 16.6851 9.61605 16.2336 10.0676L8.95745 17.3437H30.8327C31.4712 17.3437 31.9889 17.8614 31.9889 18.5C31.9889 19.1386 31.4712 19.6562 30.8327 19.6562H8.95745L16.2336 26.9325C16.6851 27.384 16.6851 28.116 16.2336 28.5675C15.782 29.0191 15.05 29.0191 14.5984 28.5675L5.34842 19.3175C4.89688 18.866 4.89688 18.134 5.34842 17.6825L14.5984 8.4324C15.05 7.98087 15.782 7.98087 16.2336 8.4324Z"
                                      fill="#4B5563"
                                    />
                                  </svg>
                                </button>

                                <h1 className="text-[24px] font-['Gellix',_sans-serif] font-semibold text-[#4B5563]">
                                  {categories.find(
                                    (c) => c.id === activeCategoryId,
                                  )?.name || "Untitled Job"}
                                </h1>

                                <div className="flex items-center gap-6">
                                  {/* Experience */}
                                  <div className="flex items-center font-['Gellix',_sans-serif] gap-2 text-[20px] text-[#4B5563]">
                                    <svg
                                      width="18"
                                      height="18"
                                      viewBox="0 0 18 18"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g clip-path="url(#clip0_2438_3982)">
                                        <path
                                          fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M8.961 0.937501H9.039C9.71288 0.937478 10.2748 0.937463 10.7209 0.997433C11.1917 1.06074 11.6168 1.19999 11.9584 1.5416C12.3 1.8832 12.4393 2.3083 12.5026 2.77914C12.5469 3.10884 12.5584 3.50182 12.5615 3.9565C13.0478 3.97211 13.4814 4.00055 13.8668 4.05236C14.746 4.17057 15.4578 4.41966 16.0191 4.98093C16.5803 5.54221 16.8294 6.25392 16.9477 7.13324C17.0625 7.98765 17.0625 9.07935 17.0625 10.4577V10.5423C17.0625 11.9207 17.0625 13.0124 16.9477 13.8668C16.8294 14.7461 16.5803 15.4578 16.0191 16.0191C15.4578 16.5803 14.746 16.8294 13.8668 16.9477C13.0124 17.0625 11.9207 17.0625 10.5423 17.0625H7.45769C6.07937 17.0625 4.98764 17.0625 4.13324 16.9477C3.25392 16.8294 2.54221 16.5803 1.98093 16.0191C1.41966 15.4578 1.17057 14.7461 1.05236 13.8668C0.937478 13.0124 0.937485 11.9207 0.9375 10.5423V10.4577C0.937485 9.07935 0.937478 7.98765 1.05236 7.13324C1.17057 6.25392 1.41966 5.54221 1.98093 4.98093C2.54221 4.41966 3.25392 4.17057 4.13324 4.05236C4.51856 4.00055 4.95216 3.97211 5.43855 3.9565C5.44155 3.50182 5.45311 3.10884 5.49743 2.77914C5.56074 2.3083 5.69999 1.8832 6.0416 1.5416C6.3832 1.19999 6.8083 1.06074 7.27914 0.997433C7.72522 0.937463 8.28713 0.937478 8.961 0.937501ZM6.56385 3.93884C6.84745 3.93749 7.1452 3.9375 7.45768 3.9375H10.5423C10.8548 3.9375 11.1526 3.93749 11.4362 3.93884C11.433 3.5111 11.4225 3.18844 11.3876 2.92904C11.3411 2.58295 11.2606 2.43483 11.1629 2.33709C11.0652 2.23935 10.9171 2.15894 10.5709 2.11241C10.2087 2.0637 9.723 2.0625 9 2.0625C8.277 2.0625 7.7913 2.0637 7.42904 2.11241C7.08295 2.15894 6.93482 2.23935 6.83709 2.33709C6.73935 2.43483 6.65894 2.58295 6.61241 2.92904C6.57753 3.18844 6.56701 3.5111 6.56385 3.93884ZM4.28314 5.16732C3.52857 5.26877 3.09383 5.45903 2.77643 5.77643C2.45902 6.09383 2.26877 6.52857 2.16732 7.28314C2.06369 8.05388 2.0625 9.0699 2.0625 10.5C2.0625 11.9301 2.06369 12.9461 2.16732 13.7169C2.26877 14.4714 2.45902 14.9062 2.77643 15.2236C3.09383 15.541 3.52857 15.7313 4.28314 15.8327C5.05388 15.9363 6.06988 15.9375 7.5 15.9375H10.5C11.9301 15.9375 12.9461 15.9363 13.7169 15.8327C14.4714 15.7313 14.9062 15.541 15.2236 15.2236C15.541 14.9062 15.7313 14.4714 15.8327 13.7169C15.9363 12.9461 15.9375 11.9301 15.9375 10.5C15.9375 9.0699 15.9363 8.05388 15.8327 7.28314C15.7313 6.52857 15.541 6.09383 15.2236 5.77643C14.9062 5.45903 14.4714 5.26877 13.7169 5.16732C12.9461 5.0637 11.9301 5.0625 10.5 5.0625H7.5C6.06988 5.0625 5.05388 5.0637 4.28314 5.16732Z"
                                          fill="#818283"
                                        />
                                        <path
                                          d="M12.75 6.75C12.75 7.16422 12.4142 7.5 12 7.5C11.5858 7.5 11.25 7.16422 11.25 6.75C11.25 6.33579 11.5858 6 12 6C12.4142 6 12.75 6.33579 12.75 6.75Z"
                                          fill="#818283"
                                        />
                                        <path
                                          d="M6.75 6.75C6.75 7.16422 6.41422 7.5 6 7.5C5.58579 7.5 5.25 7.16422 5.25 6.75C5.25 6.33579 5.58579 6 6 6C6.41422 6 6.75 6.33579 6.75 6.75Z"
                                          fill="#818283"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="clip0_2438_3982">
                                          <rect
                                            width="18"
                                            height="18"
                                            fill="white"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>

                                    <span>
                                      {
                                        categories.find(
                                          (c) => c.id === activeCategoryId,
                                        )?.experience
                                      }
                                    </span>
                                  </div>

                                  {/* Location */}
                                  <div className="flex items-center gap-2 font-['Gellix',_sans-serif] text-[20px] text-[#4B5563]">
                                    <svg
                                      width="15"
                                      height="19"
                                      viewBox="0 0 15 19"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M0.75 7.53608C0.75 3.78823 3.73477 0.75 7.41667 0.75C11.0986 0.75 14.0833 3.78823 14.0833 7.53608C14.0833 11.2546 11.9556 15.5937 8.63575 17.1453C7.86192 17.5071 6.97142 17.5071 6.19758 17.1453C2.87777 15.5937 0.75 11.2546 0.75 7.53608Z"
                                        stroke="#818283"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        d="M7.41406 9.92188C8.79477 9.92188 9.91406 8.80259 9.91406 7.42188C9.91406 6.04116 8.79477 4.92188 7.41406 4.92188C6.03335 4.92188 4.91406 6.04116 4.91406 7.42188C4.91406 8.80259 6.03335 9.92188 7.41406 9.92188Z"
                                        stroke="#818283"
                                        stroke-width="1.5"
                                      />
                                    </svg>

                                    <span>
                                      {
                                        categories.find(
                                          (c) => c.id === activeCategoryId,
                                        )?.workApproach
                                      }
                                    </span>
                                  </div>

                                  {/* Notice Period */}
                                  <div className="flex items-center font-['Gellix',_sans-serif] gap-2 text-[20px] text-[#4B5563]">
                                    <svg
                                      width="18"
                                      height="18"
                                      viewBox="0 0 18 18"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M5.01163 2C5.30061 2 5.53488 2.23985 5.53488 2.53571V3.08051C5.99677 3.07142 6.50563 3.07142 7.06529 3.07143H9.9347C10.4944 3.07142 11.0033 3.07142 11.4651 3.08051V2.53571C11.4651 2.23985 11.6994 2 11.9884 2C12.2773 2 12.5116 2.23985 12.5116 2.53571V3.12649C12.693 3.14065 12.8647 3.15844 13.0272 3.18081C13.8452 3.2934 14.5073 3.53063 15.0294 4.06517C15.5515 4.59972 15.7832 5.27754 15.8932 6.11499C15.9283 6.38262 15.9519 6.67471 15.9677 6.99291C15.9886 7.05076 16 7.11329 16 7.17857C16 7.22809 15.9934 7.27603 15.9812 7.32154C16 7.89436 16 8.54486 16 9.28114V10.75C16 11.0459 15.7657 11.2857 15.4767 11.2857C15.1878 11.2857 14.9535 11.0459 14.9535 10.75V9.32143C14.9535 8.71143 14.9533 8.1805 14.9443 7.71429H2.05564C2.04674 8.1805 2.04651 8.71143 2.04651 9.32143V10.75C2.04651 12.112 2.04762 13.0796 2.14402 13.8137C2.23839 14.5323 2.41537 14.9464 2.71063 15.2486C3.00589 15.5509 3.4103 15.7321 4.11222 15.8287C4.82919 15.9274 5.77431 15.9286 7.10465 15.9286H9.89535C10.1843 15.9286 10.4186 16.1684 10.4186 16.4643C10.4186 16.7601 10.1843 17 9.89535 17H7.0653C5.78314 17 4.76757 17 3.97278 16.8906C3.15481 16.778 2.49275 16.5408 1.97063 16.0063C1.44852 15.4717 1.21681 14.7939 1.10684 13.9564C0.999979 13.1427 0.999986 12.103 1 10.7903V9.28114C0.999993 8.54479 0.999986 7.89436 1.01884 7.32155C1.00657 7.27604 1 7.22809 1 7.17857C1 7.1133 1.0114 7.05075 1.03228 6.9929C1.0481 6.6747 1.07169 6.38261 1.10684 6.11499C1.21681 5.27754 1.44852 4.59972 1.97063 4.06517C2.49275 3.53063 3.15481 3.2934 3.97278 3.18081C4.13528 3.15844 4.30702 3.14065 4.48837 3.12649V2.53571C4.48837 2.23985 4.72264 2 5.01163 2ZM2.1035 6.64286H14.8965C14.8853 6.50758 14.8719 6.37945 14.856 6.25775C14.7616 5.53911 14.5846 5.12508 14.2894 4.82279C13.9941 4.52049 13.5897 4.3393 12.8878 4.24269C12.1708 4.14399 11.2257 4.14286 9.89535 4.14286H7.10465C5.77431 4.14286 4.82919 4.14399 4.11222 4.24269C3.4103 4.3393 3.00589 4.52049 2.71063 4.82279C2.41537 5.12508 2.23839 5.53911 2.14402 6.25775C2.12804 6.37945 2.11467 6.50758 2.1035 6.64286ZM12.686 12C11.8191 12 11.1163 12.7196 11.1163 13.6071C11.1163 14.4947 11.8191 15.2143 12.686 15.2143C13.553 15.2143 14.2558 14.4947 14.2558 13.6071C14.2558 12.7196 13.553 12 12.686 12ZM10.0698 13.6071C10.0698 12.1278 11.2411 10.9286 12.686 10.9286C14.131 10.9286 15.3023 12.1278 15.3023 13.6071C15.3023 14.1531 15.1428 14.6609 14.8689 15.0843L15.8467 16.0855C16.0511 16.2947 16.0511 16.6339 15.8467 16.8431C15.6424 17.0523 15.3111 17.0523 15.1068 16.8431L14.1288 15.8419C13.7153 16.1224 13.2193 16.2857 12.686 16.2857C11.2411 16.2857 10.0698 15.0865 10.0698 13.6071Z"
                                        fill="#818283"
                                      />
                                    </svg>
                                    <span>
                                      {
                                        categories.find(
                                          (c) => c.id === activeCategoryId,
                                        )?.location
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right side – Action buttons */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 mb-1">
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "copy-link",
                                        activeCategoryId,
                                      )
                                    }
                                    title="Copy Link"
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <svg
                                      width="15"
                                      height="17"
                                      viewBox="0 0 15 17"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M2.83398 7.49486C2.83398 5.29494 2.83398 4.19498 3.51741 3.51155C4.20084 2.82813 5.3008 2.82812 7.50072 2.82812H9.83408C12.034 2.82812 13.1339 2.82813 13.8174 3.51155C14.5008 4.19498 14.5008 5.29494 14.5008 7.49486V11.3838C14.5008 13.5837 14.5008 14.6836 13.8174 15.3671C13.1339 16.0505 12.034 16.0505 9.83408 16.0505H7.50072C5.3008 16.0505 4.20084 16.0505 3.51741 15.3671C2.83398 14.6836 2.83398 13.5837 2.83398 11.3838V7.49486Z"
                                        stroke="#818283"
                                      />
                                      <path
                                        d="M2.83337 13.7224C1.54469 13.7224 0.5 12.6778 0.5 11.389V6.72231C0.5 3.78908 0.5 2.32248 1.41123 1.41123C2.32248 0.5 3.78908 0.5 6.72231 0.5H9.83346C11.1222 0.5 12.1668 1.54469 12.1668 2.83337"
                                        stroke="#818283"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "edit-template",
                                        activeCategoryId,
                                      )
                                    }
                                    title="Edit Template"
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <svg
                                      width="17"
                                      height="16"
                                      viewBox="0 0 17 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M14.0296 1.1856C13.0474 1.1856 12.2512 1.98181 12.2512 2.96399C12.2512 3.94617 13.0474 4.74239 14.0296 4.74239C15.0117 4.74239 15.808 3.94617 15.808 2.96399C15.808 1.98181 15.0117 1.1856 14.0296 1.1856ZM11.0656 2.96399C11.0656 1.32702 12.3926 0 14.0296 0C15.6666 0 16.9936 1.32702 16.9936 2.96399C16.9936 4.60096 15.6666 5.92798 14.0296 5.92798C12.3926 5.92798 11.0656 4.60096 11.0656 2.96399ZM6.87139 1.5808H9.28717C9.61456 1.5808 9.87997 1.8462 9.87997 2.17359C9.87997 2.50098 9.61456 2.76639 9.28717 2.76639H6.91598C5.40883 2.76639 4.33811 2.76765 3.52585 2.87686C2.73063 2.98377 2.27248 3.18427 1.93798 3.51877C1.60347 3.85328 1.40297 4.31143 1.29606 5.10664C1.18685 5.9189 1.1856 6.98965 1.1856 8.49678C1.1856 10.0039 1.18685 11.0747 1.29606 11.8869C1.40297 12.6821 1.60347 13.1403 1.93798 13.4748C2.27248 13.8093 2.73063 14.0098 3.52585 14.1167C4.33811 14.2259 5.40883 14.2272 6.91598 14.2272H10.0776C11.5847 14.2272 12.6555 14.2259 13.4677 14.1167C14.2629 14.0098 14.7211 13.8093 15.0556 13.4748C15.3901 13.1403 15.5906 12.6821 15.6975 11.8869C15.8067 11.0747 15.808 10.0039 15.808 8.49678C15.808 8.20204 15.8101 7.98665 15.8119 7.80154C15.8148 7.50182 15.817 7.2813 15.8081 6.93108C15.7998 6.60376 16.0584 6.3317 16.3857 6.32337C16.713 6.31506 16.985 6.57363 16.9934 6.90092C17.0027 7.26929 17.0003 7.52079 16.9973 7.83853C16.9955 8.02349 16.9936 8.23081 16.9936 8.49678V8.54135C16.9936 9.99395 16.9936 11.1445 16.8725 12.0449C16.7479 12.9715 16.4854 13.7216 15.894 14.3132C15.3024 14.9046 14.5523 15.1671 13.6257 15.2917C12.7252 15.4128 11.5747 15.4128 10.1221 15.4128H6.87139C5.41883 15.4128 4.2683 15.4128 3.36787 15.2917C2.44119 15.1671 1.69114 14.9046 1.09963 14.3132C0.508131 13.7216 0.245624 12.9715 0.121042 12.0449C-2.34026e-05 11.1445 -1.54497e-05 9.99395 3.5821e-07 8.54135V8.4522C-1.54497e-05 6.9996 -2.34026e-05 5.84909 0.121042 4.94866C0.245624 4.02198 0.508131 3.27194 1.09963 2.68043C1.69114 2.08893 2.44119 1.82642 3.36787 1.70183C4.2683 1.58077 5.41882 1.58078 6.87139 1.5808ZM3.29899 4.95568C3.50858 4.70417 3.88238 4.67019 4.13389 4.87978L5.84027 6.30177C6.57768 6.9163 7.08963 7.34153 7.5219 7.61951C7.94026 7.88864 8.22401 7.97899 8.49678 7.97899C8.76954 7.97899 9.05329 7.88864 9.47165 7.61951C9.90392 7.34153 10.4159 6.9163 11.1533 6.30177C11.4048 6.09218 11.7786 6.12616 11.9882 6.37767C12.1977 6.62918 12.1638 7.003 11.9122 7.21254L11.8826 7.23736C11.182 7.82114 10.6142 8.29436 10.113 8.61668C9.59092 8.95244 9.08254 9.16458 8.49678 9.16458C7.91101 9.16458 7.40263 8.95244 6.88055 8.61668C6.3794 8.29436 5.81157 7.82114 5.111 7.23736L3.37489 5.79059C3.12338 5.58099 3.0894 5.2072 3.29899 4.95568Z"
                                        fill="#818283"
                                      />
                                    </svg>
                                  </button>

                                  {categories.find(
                                    (c) => c.id === activeCategoryId,
                                  )?.status === "DRAFT" &&
                                    categories.find(
                                      (c) => c.id === activeCategoryId,
                                    )?.visibility === "PRIVATE" && (
                                      <button
                                        onClick={() =>
                                          handleCategoryAction(
                                            "publish-job",
                                            activeCategoryId,
                                          )
                                        }
                                        title="Publish Job"
                                        className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                      >
                                        <Globe className="w-4 h-4 text-[#818283]" />
                                      </button>
                                    )}
                                  {categories.find(
                                    (c) => c.id === activeCategoryId,
                                  )?.status === "PUBLISHED" &&
                                    categories.find(
                                      (c) => c.id === activeCategoryId,
                                    )?.visibility === "PUBLIC" && (
                                      <button
                                        onClick={() =>
                                          handleCategoryAction(
                                            "unpublish-job",
                                            activeCategoryId,
                                          )
                                        }
                                        title="Unpublish Job"
                                        className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                      >
                                        <svg
                                          width="16"
                                          height="14"
                                          viewBox="0 0 16 14"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M3.29448 7.49417e-07H3.36741C3.99747 -1.87855e-05 4.52287 -3.17873e-05 4.93996 0.0520352C5.3802 0.107 5.77767 0.227901 6.09707 0.524486C6.41646 0.821071 6.54668 1.19015 6.60587 1.59894C6.66197 1.98625 6.6619 2.47411 6.6619 3.05917V10.9408C6.6619 11.5259 6.66197 12.0138 6.60587 12.4011C6.54668 12.8099 6.41646 13.1789 6.09707 13.4755C5.77767 13.7721 5.3802 13.893 4.93996 13.948C4.52287 14.0001 3.99747 14 3.36741 14H3.29449C2.66443 14 2.13904 14.0001 1.72194 13.948C1.2817 13.893 0.884231 13.7721 0.564831 13.4755C0.245432 13.1789 0.115231 12.8099 0.0560379 12.4011C-3.42325e-05 12.0138 -2.02305e-05 11.5259 8.07065e-07 10.9408V3.05916C-2.02305e-05 2.47411 -3.42325e-05 1.98624 0.0560379 1.59894C0.115231 1.19015 0.245432 0.821071 0.564831 0.524486C0.884231 0.227901 1.2817 0.107 1.72194 0.0520352C2.13903 -3.17873e-05 2.66442 -1.87855e-05 3.29448 7.49417e-07ZM1.8621 1.02007C1.5385 1.06047 1.40001 1.13029 1.30862 1.21515C1.21723 1.30001 1.14205 1.42861 1.09854 1.72909C1.053 2.04363 1.05188 2.4653 1.05188 3.09302V10.907C1.05188 11.5347 1.053 11.9564 1.09854 12.2709C1.14205 12.5714 1.21723 12.7 1.30862 12.7849C1.40001 12.8697 1.5385 12.9395 1.8621 12.98C2.20083 13.0222 2.65493 13.0233 3.33095 13.0233C4.00696 13.0233 4.46107 13.0222 4.7998 12.98C5.1234 12.9395 5.2619 12.8697 5.35328 12.7849C5.44466 12.7 5.51986 12.5714 5.56336 12.2709C5.6089 11.9564 5.61002 11.5347 5.61002 10.907V3.09302C5.61002 2.4653 5.6089 2.04363 5.56336 1.72909C5.51986 1.42861 5.44466 1.30001 5.35328 1.21515C5.2619 1.13029 5.1234 1.06047 4.7998 1.02007C4.46107 0.977787 4.00696 0.976745 3.33095 0.976745C2.65493 0.976745 2.20083 0.977787 1.8621 1.02007ZM11.7095 7.49417e-07H11.7824C12.4125 -1.87855e-05 12.9379 -3.17873e-05 13.355 0.0520352C13.7952 0.107 14.1927 0.227901 14.5121 0.524486C14.8315 0.821071 14.9617 1.19015 15.0209 1.59894C15.077 1.98625 15.0769 2.47411 15.0769 3.05917V10.9408C15.0769 11.5259 15.077 12.0138 15.0209 12.4011C14.9617 12.8099 14.8315 13.1789 14.5121 13.4755C14.1927 13.7721 13.7952 13.893 13.355 13.948C12.9379 14.0001 12.4125 14 11.7824 14H11.7095C11.0794 14 10.5541 14.0001 10.137 13.948C9.6967 13.893 9.29924 13.7721 8.97989 13.4755C8.66047 13.1789 8.53024 12.8099 8.47106 12.4011C8.41496 12.0138 8.41503 11.5259 8.41503 10.9408V3.05917C8.41503 2.47411 8.41496 1.98625 8.47106 1.59894C8.53024 1.19015 8.66047 0.821071 8.97989 0.524486C9.29924 0.227901 9.6967 0.107 10.137 0.0520352C10.5541 -3.17873e-05 11.0794 -1.87855e-05 11.7095 7.49417e-07ZM10.2771 1.02007C9.9535 1.06047 9.81501 1.13029 9.72363 1.21515C9.63226 1.30001 9.55709 1.42861 9.51354 1.72909C9.46803 2.04363 9.4669 2.4653 9.4669 3.09302V10.907C9.4669 11.5347 9.46803 11.9564 9.51354 12.2709C9.55709 12.5714 9.63226 12.7 9.72363 12.7849C9.81501 12.8697 9.9535 12.9395 10.2771 12.98C10.6158 13.0222 11.07 13.0233 11.746 13.0233C12.422 13.0233 12.8761 13.0222 13.2148 12.98C13.5384 12.9395 13.6769 12.8697 13.7683 12.7849C13.8597 12.7 13.9349 12.5714 13.9784 12.2709C14.0239 11.9564 14.025 11.5347 14.025 10.907V3.09302C14.025 2.4653 14.0239 2.04363 13.9784 1.72909C13.9349 1.42861 13.8597 1.30001 13.7683 1.21515C13.6769 1.13029 13.5384 1.06047 13.2148 1.02007C12.8761 0.977787 12.422 0.976745 11.746 0.976745C11.07 0.976745 10.6158 0.977787 10.2771 1.02007Z"
                                            fill="#818283"
                                          />
                                        </svg>
                                      </button>
                                    )}
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "edit-job",
                                        activeCategoryId,
                                      )
                                    }
                                    title="Edit Job"
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 22 22"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M10.948 1.14453H12.3757C12.7553 1.14453 13.0632 1.45234 13.0632 1.83203C13.0632 2.21172 12.7553 2.51953 12.3757 2.51953H11.0007C8.82062 2.51953 7.25475 2.52099 6.0631 2.6812C4.89122 2.83876 4.18473 3.13841 3.66255 3.6606C3.14036 4.18278 2.84071 4.88927 2.68316 6.06115C2.52294 7.25279 2.52148 8.81866 2.52148 10.9987C2.52148 13.1787 2.52294 14.7446 2.68316 15.9362C2.84071 17.1081 3.14036 17.8146 3.66255 18.3368C4.18473 18.859 4.89122 19.1587 6.0631 19.3162C7.25475 19.4764 8.82062 19.4779 11.0007 19.4779C13.1807 19.4779 14.7465 19.4764 15.9382 19.3162C17.1101 19.1587 17.8165 18.859 18.3388 18.3368C18.861 17.8146 19.1606 17.1081 19.3181 15.9362C19.4784 14.7446 19.4798 13.1787 19.4798 10.9987V9.6237C19.4798 9.24401 19.7876 8.9362 20.1673 8.9362C20.547 8.9362 20.8548 9.24401 20.8548 9.6237V11.0513C20.8548 13.1673 20.8548 14.8256 20.6809 16.1195C20.5028 17.4438 20.1313 18.4889 19.3111 19.3091C18.4908 20.1293 17.4457 20.5009 16.1214 20.679C14.8276 20.8529 13.1693 20.8529 11.0533 20.8529H10.948C8.83203 20.8529 7.17374 20.8529 5.87989 20.679C4.55554 20.5009 3.51052 20.1293 2.69028 19.3091C1.87004 18.4889 1.49848 17.4438 1.32042 16.1195C1.14647 14.8256 1.14648 13.1673 1.14648 11.0513V10.9461C1.14648 8.83008 1.14647 7.17179 1.32042 5.87793C1.49848 4.55359 1.87004 3.50857 2.69028 2.68833C3.51052 1.86808 4.55554 1.49652 5.87989 1.31847C7.17374 1.14451 8.83203 1.14452 10.948 1.14453ZM15.3736 2.08496C16.6275 0.831058 18.6605 0.831058 19.9144 2.08496C21.1683 3.33885 21.1683 5.37181 19.9144 6.62571L13.8203 12.7198C13.48 13.0602 13.2667 13.2734 13.0289 13.459C12.7486 13.6776 12.4454 13.8649 12.1246 14.0178C11.8522 14.1476 11.5661 14.243 11.1096 14.3951L8.44706 15.2826C7.95549 15.4465 7.41355 15.3186 7.04717 14.9522C6.68079 14.5858 6.55285 14.0439 6.7167 13.5523L7.60419 10.8898C7.75638 10.4332 7.85171 10.1471 7.98152 9.87477C8.13441 9.55394 8.32179 9.25071 8.54036 8.9705C8.72593 8.73258 8.93916 8.51938 9.27952 8.17903L15.3736 2.08496ZM18.9421 3.05723C18.2252 2.3403 17.0628 2.3403 16.3459 3.05723L16.0007 3.40246C16.0215 3.49034 16.0506 3.59503 16.0911 3.7118C16.2224 4.09044 16.471 4.5891 16.9407 5.05869C17.4103 5.52828 17.9089 5.77687 18.2875 5.90824C18.4043 5.94875 18.509 5.97787 18.5969 5.99868L18.9421 5.65344C19.659 4.93652 19.659 3.77415 18.9421 3.05723ZM17.5137 7.08186C17.0408 6.87846 16.4898 6.55237 15.9683 6.03096C15.4469 5.50956 15.1209 4.95862 14.9175 4.48565L10.2834 9.11977C9.90157 9.5016 9.75179 9.65303 9.62455 9.81611C9.46743 10.0176 9.33268 10.2357 9.22278 10.4663C9.13374 10.6531 9.06527 10.8547 8.89452 11.3669L8.49862 12.5546L9.4447 13.5007L10.6324 13.1048C11.1447 12.9341 11.3462 12.8656 11.5331 12.7766C11.7637 12.6667 11.9818 12.5319 12.1832 12.3748C12.3463 12.2476 12.4978 12.0978 12.8795 11.716L17.5137 7.08186Z"
                                        fill="#818283"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "requisition-info",
                                        activeCategoryId,
                                      )
                                    }
                                    title="Requisition Info"
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 17 17"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9.29038 5.33757C9.29038 4.90089 8.93638 4.54688 8.49968 4.54688C8.06298 4.54688 7.70898 4.90089 7.70898 5.33757C7.70898 5.77426 8.06298 6.12827 8.49968 6.12827C8.93638 6.12827 9.29038 5.77426 9.29038 5.33757Z"
                                        fill="#818283"
                                      />
                                      <path
                                        d="M8.50123 13.0474C8.82873 13.0474 9.09425 12.7819 9.09425 12.4544V7.71021C9.09425 7.3827 8.82873 7.11719 8.50123 7.11719C8.17372 7.11719 7.9082 7.3827 7.9082 7.71021V12.4544C7.9082 12.7819 8.17372 13.0474 8.50123 13.0474Z"
                                        fill="#818283"
                                      />
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M8.54539 1.14798e-07H8.45461C6.6294 -7.79218e-06 5.19899 -1.57294e-05 4.08293 0.150035C2.94058 0.30362 2.03917 0.624121 1.33165 1.33165C0.624121 2.03917 0.30362 2.94058 0.150035 4.08293C-1.57294e-05 5.19899 -7.79218e-06 6.62938 1.14798e-07 8.45461V8.54539C-7.79218e-06 10.3706 -1.57294e-05 11.801 0.150035 12.9171C0.30362 14.0594 0.624121 14.9609 1.33165 15.6684C2.03917 16.3759 2.94058 16.6964 4.08293 16.85C5.19899 17 6.62939 17 8.45461 17H8.54539C10.3706 17 11.801 17 12.9171 16.85C14.0594 16.6964 14.9609 16.3759 15.6684 15.6684C16.3759 14.9609 16.6964 14.0594 16.85 12.9171C17 11.801 17 10.3706 17 8.54539V8.45461C17 6.62939 17 5.19899 16.85 4.08293C16.6964 2.94058 16.3759 2.03917 15.6684 1.33165C14.9609 0.624121 14.0594 0.30362 12.9171 0.150035C11.801 -1.57294e-05 10.3706 -7.79218e-06 8.54539 1.14798e-07ZM2.17031 2.17031C2.62073 1.71988 3.23013 1.46141 4.24097 1.3255C5.26886 1.1873 6.61954 1.18605 8.5 1.18605C10.3804 1.18605 11.7311 1.1873 12.759 1.3255C13.7698 1.46141 14.3792 1.71988 14.8297 2.17031C15.2802 2.62073 15.5386 3.23013 15.6745 4.24097C15.8127 5.26886 15.814 6.61954 15.814 8.5C15.814 10.3804 15.8127 11.7311 15.6745 12.759C15.5386 13.7698 15.2802 14.3792 14.8297 14.8297C14.3792 15.2802 13.7698 15.5386 12.759 15.6745C11.7311 15.8127 10.3804 15.814 8.5 15.814C6.61954 15.814 5.26886 15.8127 4.24097 15.6745C3.23013 15.5386 2.62073 15.2802 2.17031 14.8297C1.71988 14.3792 1.46141 13.7698 1.3255 12.759C1.1873 11.7311 1.18605 10.3804 1.18605 8.5C1.18605 6.61954 1.1873 5.26886 1.3255 4.24097C1.46141 3.23013 1.71988 2.62073 2.17031 2.17031Z"
                                        fill="#818283"
                                      />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "archive",
                                        activeCategoryId,
                                      )
                                    }
                                    title="Archive"
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#818283] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 22 22"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M3.62631 2.0625C3.63994 2.06251 3.65362 2.06251 3.66733 2.06251L18.3751 2.0625C18.7718 2.06246 19.1355 2.06242 19.4314 2.1022C19.7573 2.14601 20.1017 2.24909 20.3849 2.53236C20.6683 2.81563 20.7713 3.16005 20.8151 3.4859C20.8549 3.78181 20.8549 4.14558 20.8548 4.54232V4.62436C20.8549 5.02111 20.8549 5.38487 20.8151 5.68078C20.7713 6.00664 20.6683 6.35106 20.3849 6.63432C20.1157 6.90361 19.7911 7.01006 19.4798 7.05755V11.9684C19.4798 13.653 19.4798 14.9873 19.3395 16.0316C19.1949 17.1064 18.8905 17.9762 18.2046 18.6622C17.5185 19.3482 16.6487 19.6526 15.5739 19.7972C14.5296 19.9375 13.1953 19.9375 11.5107 19.9375H10.4906C8.806 19.9375 7.47167 19.9375 6.42739 19.7972C5.35267 19.6526 4.4828 19.3482 3.7968 18.6622C3.1108 17.9762 2.80636 17.1064 2.66187 16.0316C2.52147 14.9873 2.52148 13.653 2.5215 11.9684V7.05755C2.21017 7.01006 1.88563 6.90361 1.61634 6.63432C1.33307 6.35106 1.23 6.00664 1.18619 5.68078C1.1464 5.38487 1.14644 5.02111 1.14649 4.62437C1.1465 4.61073 1.1465 4.59705 1.1465 4.58335C1.1465 4.56963 1.1465 4.55596 1.14649 4.54232C1.14644 4.14557 1.1464 3.78181 1.18619 3.4859C1.23 3.16005 1.33307 2.81563 1.61634 2.53236C1.89961 2.24909 2.24403 2.14601 2.56989 2.1022C2.8658 2.06242 3.22956 2.06246 3.62631 2.0625ZM3.8965 7.10418V11.9167C3.8965 13.6646 3.89795 14.9064 4.02461 15.8484C4.1486 16.7706 4.38113 17.302 4.76907 17.6899C5.15701 18.0779 5.68836 18.3104 6.61061 18.4344C7.55263 18.561 8.79441 18.5625 10.5423 18.5625H11.459C13.2069 18.5625 14.4487 18.561 15.3908 18.4344C16.3129 18.3104 16.8443 18.0779 17.2322 17.6899C17.6202 17.302 17.8527 16.7706 17.9767 15.8484C18.1034 14.9064 18.1048 13.6646 18.1048 11.9167V7.10418H3.8965ZM2.58862 3.50464L2.59086 3.50338C2.59263 3.50246 2.59567 3.50097 2.60029 3.49908C2.62026 3.49086 2.66459 3.47684 2.7531 3.46494C2.94626 3.43897 3.21577 3.43751 3.66733 3.43751H18.334C18.7855 3.43751 19.055 3.43897 19.2482 3.46494C19.3367 3.47684 19.3811 3.49086 19.401 3.49908C19.4057 3.50097 19.4087 3.50246 19.4104 3.50338L19.4127 3.50463L19.4139 3.50688C19.4149 3.50865 19.4164 3.51169 19.4182 3.51631C19.4265 3.53627 19.4405 3.5806 19.4524 3.66912C19.4784 3.86228 19.4798 4.13179 19.4798 4.58335C19.4798 5.0349 19.4784 5.3044 19.4524 5.49757C19.4405 5.58608 19.4265 5.63041 19.4182 5.65037C19.4164 5.655 19.4149 5.65804 19.4139 5.65981L19.4127 5.66205L19.4104 5.66331C19.4087 5.66423 19.4057 5.66571 19.401 5.66762C19.3811 5.67583 19.3367 5.68984 19.2482 5.70174C19.055 5.72771 18.7855 5.72918 18.334 5.72918H3.66733C3.21577 5.72918 2.94626 5.72771 2.7531 5.70174C2.66459 5.68984 2.62026 5.67583 2.60029 5.66762C2.59567 5.66571 2.59263 5.66423 2.59086 5.66331L2.58862 5.66204L2.58737 5.65981C2.58644 5.65804 2.58496 5.655 2.58306 5.65037C2.57485 5.63041 2.56082 5.58608 2.54892 5.49757C2.52295 5.3044 2.5215 5.0349 2.5215 4.58335C2.5215 4.13179 2.52295 3.86228 2.54892 3.66912C2.56082 3.5806 2.57485 3.53627 2.58306 3.51631C2.58496 3.51169 2.58644 3.50865 2.58737 3.50688L2.58862 3.50464ZM2.58862 5.66204C2.58826 5.66167 2.58838 5.66174 2.58862 5.66204V5.66204ZM9.60567 8.93751H12.3956C12.592 8.93749 12.7725 8.93748 12.924 8.94782C13.0869 8.95893 13.2659 8.98424 13.4479 9.05962C13.8409 9.2224 14.1533 9.53471 14.3161 9.92778C14.3914 10.1097 14.4167 10.2889 14.4279 10.4517C14.4382 10.6032 14.4382 10.7837 14.4382 10.98V11.02C14.4382 11.2163 14.4382 11.3968 14.4279 11.5484C14.4167 11.7112 14.3914 11.8903 14.3161 12.0722C14.1533 12.4653 13.8409 12.7776 13.4479 12.9404C13.2659 13.0158 13.0869 13.0411 12.924 13.0522C12.7725 13.0625 12.592 13.0625 12.3956 13.0625H9.60567C9.40932 13.0625 9.22883 13.0625 9.0773 13.0522C8.91447 13.0411 8.7354 13.0158 8.55344 12.9404C8.16037 12.7776 7.84808 12.4653 7.68527 12.0722C7.60989 11.8903 7.58459 11.7112 7.57348 11.5484C7.56314 11.3968 7.56314 11.2163 7.56316 11.02V10.98C7.56314 10.7837 7.56314 10.6032 7.57348 10.4517C7.58459 10.2889 7.60989 10.1097 7.68527 9.92778C7.84808 9.53471 8.16037 9.2224 8.55344 9.05962C8.7354 8.98424 8.91447 8.95893 9.0773 8.94782C9.22883 8.93748 9.40932 8.93749 9.60567 8.93751ZM9.07686 10.3311C9.02293 10.3543 8.97995 10.3973 8.95677 10.4512C8.95506 10.458 8.94947 10.484 8.94529 10.5452C8.93853 10.6442 8.93816 10.7771 8.93816 11C8.93816 11.2229 8.93853 11.3558 8.94529 11.4548C8.94947 11.516 8.95506 11.542 8.95677 11.5488C8.97995 11.6027 9.02293 11.6457 9.07686 11.6689C9.0836 11.6706 9.10963 11.6762 9.1709 11.6804C9.2699 11.6871 9.40272 11.6875 9.62565 11.6875H12.3757C12.5986 11.6875 12.7314 11.6871 12.8304 11.6804C12.8916 11.6762 12.9177 11.6706 12.9245 11.6689C12.9784 11.6457 13.0214 11.6027 13.0445 11.5488C13.0463 11.542 13.0519 11.516 13.056 11.4548C13.0628 11.3558 13.0632 11.2229 13.0632 11C13.0632 10.7771 13.0628 10.6442 13.056 10.5452C13.0519 10.484 13.0463 10.458 13.0445 10.4512C13.0214 10.3973 12.9784 10.3543 12.9245 10.3311C12.9177 10.3294 12.8916 10.3238 12.8304 10.3197C12.7314 10.3129 12.5986 10.3125 12.3757 10.3125H9.62565C9.40272 10.3125 9.2699 10.3129 9.1709 10.3197C9.10963 10.3238 9.08359 10.3294 9.07686 10.3311Z"
                                        fill="#818283"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                <button
                                  onClick={handlePipelinesClick}
                                  className="px-5 py-2.5 bg-white border border-[#0F47F2] font-['Gellix',_sans-serif] text-[#0F47F2] rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                  Show Pipelines
                                </button>

                                <button
                                  onClick={() =>
                                    handleCategoryAction(
                                      "share-pipelines",
                                      activeCategoryId,
                                    )
                                  }
                                  className="px-6 py-2.5 font-['Gellix',_sans-serif] bg-[#1CB977] text-white rounded-lg font-medium hover:bg-[#0d3ec9] transition-colors flex items-center gap-2 shadow-md"
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fill-rule="evenodd"
                                      clip-rule="evenodd"
                                      d="M2.61628 1.04651C1.74932 1.04651 1.04651 1.74932 1.04651 2.61628C1.04651 3.48324 1.74932 4.18605 2.61628 4.18605C3.48324 4.18605 4.18605 3.48324 4.18605 2.61628C4.18605 1.74932 3.48324 1.04651 2.61628 1.04651ZM0 2.61628C0 1.17135 1.17135 0 2.61628 0C4.06121 0 5.23256 1.17135 5.23256 2.61628C5.23256 4.06121 4.06121 5.23256 2.61628 5.23256C1.17135 5.23256 0 4.06121 0 2.61628ZM6.27907 2.61628C6.27907 2.3273 6.51335 2.09302 6.80233 2.09302H10.3827C12.3022 2.09302 13.0321 4.59977 11.4128 5.63028L4.14909 10.2526C3.413 10.721 3.74481 11.8605 4.61729 11.8605H6.93439L6.78119 11.7072C6.57684 11.5028 6.57684 11.1716 6.78119 10.9672C6.98553 10.7629 7.31679 10.7629 7.52114 10.9672L8.56765 12.0137C8.772 12.2181 8.772 12.5493 8.56765 12.7537L7.52114 13.8002C7.31679 14.0046 6.98553 14.0046 6.78119 13.8002C6.57684 13.5959 6.57684 13.2646 6.78119 13.0603L6.93439 12.907H4.61729C2.69782 12.907 1.96787 10.4002 3.58725 9.3697L10.8509 4.74738C11.587 4.27896 11.2552 3.13953 10.3827 3.13953H6.80233C6.51335 3.13953 6.27907 2.90526 6.27907 2.61628ZM12.3837 10.814C11.5168 10.814 10.814 11.5168 10.814 12.3837C10.814 13.2507 11.5168 13.9535 12.3837 13.9535C13.2507 13.9535 13.9535 13.2507 13.9535 12.3837C13.9535 11.5168 13.2507 10.814 12.3837 10.814ZM9.76744 12.3837C9.76744 10.9388 10.9388 9.76744 12.3837 9.76744C13.8287 9.76744 15 10.9388 15 12.3837C15 13.8287 13.8287 15 12.3837 15C10.9388 15 9.76744 13.8287 9.76744 12.3837Z"
                                      fill="white"
                                    />
                                  </svg>
                                  Applicant Tracking
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="flex w-full gap-3 h-full">
                          <div className="2xl:w-[25%] sticky order-1 lg:order-1 top-16 self-start will-change-transform z-10">
                            <FiltersSidebar
                              filters={filters}
                              defaultBoolQuery={defaultBoolQuery}
                              onApplyFilters={handleApplyFilters}
                              setCandidates={setCandidates}
                              candidates={candidates}
                              activeTab={activeTab}
                              isSearchMode={isSearchMode}
                            />
                          </div>
                          <div className="2xl:w-[45%] order-2 lg:order-2 ">
                            <CandidatesMain
                              activeTab={activeTab}
                              setActiveTab={setActiveTab}
                              selectedCandidate={selectedCandidate}
                              setSelectedCandidate={setSelectedCandidate}
                              searchTerm={searchTerm}
                              onPipelinesClick={handlePipelinesClick}
                              candidates={candidates}
                              totalCount={totalCount}
                              jobId={filters.jobId}
                              deductCredits={deductCredits}
                              onCandidatesUpdate={handleCandidatesUpdate}
                              currentPage={currentPage}
                              setCurrentPage={setCurrentPage}
                              onSearchChange={handleSearchChange}
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              loadingCandidates={loadingCandidates}
                              sourcingCounts={sourcingCounts}
                              activeCategoryTotalCount={
                                activeCategoryTotalCount
                              }
                              currentAnalysis={currentAnalysis}
                              onInboundSourceChange={(
                                source: string | null,
                              ) => {
                                setFilters((prev) => ({
                                  ...prev,
                                  inbound_source: source,
                                }));
                                setCurrentPage(1);
                              }}
                            />
                          </div>
                          {/* CandidateDetail remains in its original div with 30% width */}
                          <div className="2xl:w-[30%] order-3 sticky top-16 self-start will-change-transform">
                            <CandidateDetail
                              candidate={selectedCandidate}
                              candidates={candidates}
                              onSendInvite={handleSendInvite}
                              updateCandidateEmail={updateCandidateEmail}
                              deductCredits={deductCredits}
                              onUpdateCandidate={handleUpdateCandidate}
                              defaultBoolQuery={defaultBoolQuery}
                              jobId={filters.jobId}
                              textQuery={filters.keywords} // ← Current text_query (keyword mode)
                              boolQuery={filters.boolQuery || ""} // ← Current bool_query (boolean mode)
                              enableAnalysis={!!filters.jobId}
                              onAnalysisFetched={setCurrentAnalysis}
                              activeMiddleTab={activeTab}
                              setActiveMiddleTab={setActiveTab}
                            />
                          </div>
                          {/* TemplateSelector rendered as an overlay with 40% width when active */}
                          {showTemplateSelector && selectedCandidate && (
                            <div className="fixed inset-0 z-50 flex items-center justify-end">
                              {/* Backdrop with blur effect */}
                              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md"></div>
                              {/* TemplateSelector with 40% width */}
                              <div className="relative w-[40%] h-full bg-white rounded-tl-xl rounded-bl-xl shadow-lg overflow-y-auto">
                                <TemplateSelector
                                  candidate={selectedCandidate}
                                  onBack={handleBackFromTemplate}
                                  updateCandidateEmail={updateCandidateEmail}
                                  jobId={filters.jobId}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <CreateJobRoleModal
                        isOpen={showCreateJobRole}
                        workspaceId={selectedWorkspaceId || 1}
                        workspaces={workspaces}
                        handlePipelinesClick={handlePipelinesClick}
                        onClose={() => setShowCreateJobRole(false)}
                        onJobCreated={handleJobCreatedOrUpdated}
                      />
                      <EditJobRoleModal
                        isOpen={showEditJobRole}
                        onClose={() => {
                          setShowEditJobRole(false);
                          setEditingJobId(null);
                        }}
                        handlePipelinesClick={handlePipelinesClick}
                        workspaces={workspaces}
                        workspaceId={selectedWorkspaceId || 1}
                        jobId={editingJobId || 0}
                        onJobUpdated={handleJobCreatedOrUpdated}
                      />
                      <EditTemplateModal
                        jobId={String(activeCategoryId)}
                        isOpen={showEditTemplate}
                        onClose={() => setShowEditTemplate(false)}
                        templateName={editingTemplate}
                      />

                      {showLogoutModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-6 h-6 text-red-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Logout
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to sign out? You'll need
                                to log in again to access your account.
                              </p>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleCloseLogoutModal}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleLogoutConfirm}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Sign Out
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showPublishModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="w-6 h-6 text-green-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Publish Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to publish{" "}
                                {
                                  categories.find(
                                    (cat) => cat.id === showPublishModal,
                                  )?.name
                                }
                                ? This action will publish job on LinkedIn,
                                Google Jobs,Times Ascent, Cutshort and others.
                              </p>
                              <span className="text-gray-400 text-sm mb-6">
                                (Note: Once published, the job will be visible
                                on both platforms within 24–48 hours.)
                              </span>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowPublishModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handlePublishJobRole(showPublishModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  Publish
                                </button>
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
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Unpublish Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to Unpublish
                                {
                                  categories.find(
                                    (cat) => cat.id === showUnpublishModal,
                                  )?.name
                                }
                                ? This action cannot be undone.
                              </p>
                              <span className="text-gray-400 text-sm mb-6">
                                (Note: this action will unpublish job on
                                published over LinkedIn, Google Jobs,Times
                                Ascent, Cutshort and others within 24–48 hours.)
                              </span>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowUnpublishModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleUnpublishJobRole(showUnpublishModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Unpublish
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirm Delete Job
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to delete{" "}
                                {
                                  categories.find(
                                    (cat) => cat.id === showDeleteModal,
                                  )?.name
                                }
                                ? This action cannot be undone.
                              </p>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => setShowDeleteModal(null)}
                                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteJobRole(showDeleteModal)
                                  }
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {showRequisitionInfoModal && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-start justify-end overflow-y-auto"
                          onClick={handleCloseRequisitionModal}
                        >
                          <div
                            className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[125vh] overflow-y-auto p-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="w-8 h-8 text-gray-800"
                                  onClick={handleCloseRequisitionModal}
                                >
                                  <ArrowLeft className="w-8 h-8" />
                                </button>
                                <h1 className="text-lg font-semibold text-gray-800">
                                  Requisition Info
                                </h1>
                              </div>
                            </div>
                            {loadingCompetencies ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">
                                  Loading...
                                </span>
                              </div>
                            ) : jobDataForModal && competenciesData ? (
                              <>
                                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                                  {jobDataForModal.title}
                                </h2>
                                <div className="flex space-x-8 mt-2 mb-6">
                                  <span className="flex items-center text-gray-500">
                                    <Briefcase className="w-4 h-4 mr-1" />{" "}
                                    {jobDataForModal.experience_min_years}+
                                    years
                                  </span>
                                  <span className="flex items-center text-gray-500">
                                    <LocateIcon className="w-4 h-4 mr-1" />{" "}
                                    {jobDataForModal.work_approach}
                                  </span>
                                  <span className="flex items-center text-gray-500">
                                    <FileSearch className="w-4 h-4 mr-1" />{" "}
                                    Immediate
                                  </span>
                                </div>

                                {/* Role Overview */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    Role Overview
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {competenciesData.role_overview}
                                  </p>
                                </div>

                                {/* The Core Expectation */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    The Core Expectation
                                  </h3>
                                  <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                                    {competenciesData.the_core_expectation.map(
                                      (item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                      ),
                                    )}
                                  </ul>
                                </div>

                                {/* Key Responsibilities Explained */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    Key Responsibilities Explained
                                  </h3>
                                  <div className="space-y-3">
                                    {/* Functional */}
                                    {competenciesData.key_responsibilities_explained.functional.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-blue-50 rounded-lg p-4"
                                        >
                                          <div className="flex items-start space-x-3">
                                            <div>
                                              <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium text-gray-600">
                                                  {item.competency}
                                                </h4>
                                                {item.why_it_matters && (
                                                  <div className="relative group inline-block ml-2">
                                                    <svg
                                                      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                      />
                                                    </svg>
                                                    <div className="absolute z-20 hidden group-hover:block bg-white border border-blue-200 rounded-lg p-3 text-xs shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                      <span className="font-semibold text-gray-800 mb-1">
                                                        Why it matters
                                                      </span>{" "}
                                                      <br />
                                                      <span className="text-gray-500">
                                                        {item.why_it_matters}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-400">
                                                {item.context}
                                              </p>
                                              {item.priority && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Priority: {item.priority} |
                                                  Depth: {item.depth_required}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                    {/* Leadership (new subsection for API structure) */}
                                    {competenciesData
                                      .key_responsibilities_explained
                                      .leadership &&
                                      competenciesData
                                        .key_responsibilities_explained
                                        .leadership.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                          <h4 className="font-semibold text-gray-700 mb-3">
                                            Leadership Responsibilities
                                          </h4>
                                          {competenciesData.key_responsibilities_explained.leadership.map(
                                            (item: any, idx: number) => (
                                              <div
                                                key={idx}
                                                className="bg-green-50 rounded-lg p-4"
                                              >
                                                <div className="flex items-start space-x-3">
                                                  <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                      <h5 className="font-medium text-gray-600">
                                                        {item.responsibility}
                                                      </h5>
                                                      {item.why_it_matters && (
                                                        <div className="relative group inline-block ml-2">
                                                          <svg
                                                            className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                          </svg>
                                                          <div className="absolute z-20 hidden group-hover:block bg-white border border-blue-200 rounded-lg p-3 text-xs shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                            <span className="font-semibold text-gray-800 mb-1">
                                                              Why it matters
                                                            </span>{" "}
                                                            <br />
                                                            <span className="text-gray-500">
                                                              {
                                                                item.why_it_matters
                                                              }
                                                            </span>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <p className="text-sm text-gray-400">
                                                      {item.context}
                                                    </p>
                                                    {item.evidence && (
                                                      <p className="text-xs text-gray-500 mt-1">
                                                        Evidence:{" "}
                                                        {item.evidence}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {/* Required Technical Skills & Purpose */}
                                <div className="mb-6">
                                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                    Required Technical Skills & Purpose
                                  </h3>
                                  <div className="space-y-3">
                                    {competenciesData.required_technical_skills_purpose.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-blue-50 rounded-lg p-4"
                                        >
                                          <div className="flex items-center space-x-2 mb-1">
                                            <h4 className="font-medium text-gray-600">
                                              {item.skill}
                                            </h4>
                                            {item.why_it_matters && (
                                              <div className="relative group inline-block ml-2">
                                                <svg
                                                  className="w-4 h-4 text-gray-400 group-hover:text-blue-500 cursor-help transition-colors duration-200"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                  />
                                                </svg>
                                                <div className="absolute z-20 hidden group-hover:block bg-white border border-blue-200 rounded-lg p-3 text-xs shadow-md whitespace-normal w-64 left-full ml-2 top-0">
                                                  <span className="font-semibold text-gray-800 mb-1">
                                                    Why it matters
                                                  </span>{" "}
                                                  <br />
                                                  <span className="text-gray-500">
                                                    {item.why_it_matters}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-400">
                                            {item.context}
                                          </p>
                                          {item.priority && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Priority: {item.priority}
                                            </p>
                                          )}
                                          {item.assessment_guidance && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Assessment:{" "}
                                              {item.assessment_guidance}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                Failed to load data. Please try again.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Toaster />
                <AuthApp
                  initialFlow="login"
                  onAuthSuccess={handleAuthSuccess}
                />
              </>
            )
          }
        />
      </Routes>
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? You'll need to log in again
                to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseLogoutModal}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}
