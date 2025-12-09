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
import { authService } from "./services/authService";
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
import CategoryDropdown from "./components/CategoryDropdown";
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
import {
  ChevronDown,
  Edit,
  Mail,
  Archive,
  Trash2,
  LogOut,
  Share2,
  ArrowLeft,
  Pause,
  Copy,
  Globe,
  Users,
  Info,
  ChevronLeft,
  Briefcase,
  LocateIcon,
  FileSearch,
  Search,
} from "lucide-react";
import { showToast } from "./utils/toast";
import CandidateBackGroundCheck from "./components/CandidateBackGroundCheck";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import ProjectCard from "./components/ProjectCard";
interface Category {
  id: number;
  name: string;
  count: number;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
  invites_sent: number;
  total_replied: number;
  total_applied: number;
}
interface Filters {
  keywords: string[];
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
  enableBooleanAnalysis?: boolean;
}
interface Workspace {
  id: number;
  name: string;
}
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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPipelineStages, setShowPipelineStages] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string>("");
  const [activeTab, setActiveTab] = useState("outbound");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [showCategoryActions, setShowCategoryActions] = useState<number | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [showUnpublishModal, setShowUnpublishModal] = useState<number | null>(
    null
  );
  const [sourcingCounts, setSourcingCounts] = useState({
    inbound: 0,
    outbound: 0,
    active: 0,
    prevetted: 0,
  });
  const [showPublishModal, setShowPublishModal] = useState<number | null>(null);
  const [showShareLoader, setShowShareLoader] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryTotalCount, setActiveCategoryTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [defaultBoolQuery, setDefaultBoolQuery] = useState<string>("");
  // Add this state near your other useState declarations
const [hasSelectedJob, setHasSelectedJob] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const workspaceData = await organizationService.getMyWorkspaces();
        const mappedWorkspaces: Workspace[] = workspaceData.map(
          (ws: MyWorkspace) => ({
            id: ws.id,
            name: ws.name,
          })
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
    keywords: [],
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
    enableBooleanAnalysis: false,
  });
  useEffect(() => {
    setIsSearchMode(debouncedSearchQuery.trim() !== "");
  }, [debouncedSearchQuery]);
  useEffect(() => {
    if (activeCategoryId) {
      fetchJobDetailsAndSetFilters(activeCategoryId);
    }
  }, [activeCategoryId]);
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const jobs = await jobPostService.getJobs();
      const mappedCategories: Category[] = jobs.map((job) => ({
        id: job.id,
        name: job.title,
        count: job.inbound_count || 0,
        status: job.status,
        visibility: job.visibility,
        invites_sent: job.invites_sent || 0,
        total_applied: job.total_applied || 0,
        total_replied: job.total_replied || 0,
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0) {
        setHasSelectedJob(false);
      }
      else {
        setActiveCategoryId(null);
        setHasSelectedJob(true);
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
        keywords: job.skills ? job.skills : [],
        minTotalExp: job.experience_min_years
          ? job.experience_min_years.toString()
          : "",
        maxTotalExp: job.experience_max_years
          ? job.experience_max_years.toString()
          : "",
        locations: job.location ? job.location.filter(Boolean) : [],
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
            controller.signal
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
            keywords: [],
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
          });
          setFilters((prev) => ({
            ...prev,
            enableBooleanAnalysis: false,
            boolQuery: "",
          })); // NEW: Disable analysis in search mode
          setDefaultBoolQuery(""); // NEW
        } else {
          response = await candidateService.getCandidates(appliedFilters, page);
          if (response.boolean_search_terms) {
            // Assume API returns 'bool_query' field
            localStorage.setItem(
              `bool_query_${appliedFilters.jobId}`,
              response.boolean_search_terms
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
        showToast.error("Failed to fetch candidates");
        console.error("Error fetching candidates:", error);
        setCandidates([]);
        setTotalCount(0);
        setSelectedCandidate(null);
      } finally {
        setLoadingCandidates(false);
      }
    },
    [selectedCandidate, debouncedSearchQuery, sortBy, filters, activeTab]
  );
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  const handleCandidatesUpdate = (
    newCandidates: CandidateListItem[],
    count: number
  ) => {
    setCandidates(newCandidates);
    setTotalCount(count);
    if (newCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(newCandidates[0]);
    } else if (newCandidates.length === 0) {
      setSelectedCandidate(null);
    } else {
      const updatedSelected = newCandidates.find(
        (c) => c.id === selectedCandidate?.id
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
  }, [isAuthenticated]);
  useEffect(() => {
    const newFilters = {
      ...filters,
      application_type: activeTab,
      is_prevetted: activeTab === "prevetted",
      is_active: activeTab === "active",
      sort_by: sortBy,
    };
    setFilters(newFilters);
    if (activeCategoryId) {
      fetchCandidates(currentPage, newFilters);
    }
  }, [activeTab, sortBy, debouncedSearchQuery, isAuthenticated, currentPage]);
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
              role.workspace_id !== null && role.workspace_id !== undefined
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
    candidate_phone: string
  ) => {
    setCandidates((prevCandidates) =>
      prevCandidates.map((cand) =>
        cand.id === candidateId
          ? { ...cand, candidate_email, candidate_phone }
          : cand
      )
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate((prev) =>
        prev ? { ...prev, candidate_email, candidate_phone } : prev
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
        keywords: [],
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
        enableBooleanAnalysis: false,
      });
      setDefaultBoolQuery("");
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
    setShowRequisitionInfoModal(true);
    // Here we will add api fetching backend logic once done
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
      prev.map((c) => (c.id === updated.id ? updated : c))
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
        "Invalid input in experience or salary fields. Please enter numbers only."
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
        "Minimum total experience cannot be greater than maximum."
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
        const data = await organizationService.claimWorkspaceInvite(
          inviteToken
        );
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
            "You are logged in with a different email than the invited recipient. Please sign out and sign in with the invited email."
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    if (claiming) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Joining {workspaceName}...</p>
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              showPipelineSharePage ? (
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

                  <div className="container mx-auto py-6">
                    <div className=" bg-white flex h-[99px] mb-6">
                      <div className="w-[80vw] h-[99px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.1)] rounded-[10px] flex items-center justify-between px-[34px]">
                        <h1 className="text-2xl font-medium text-[#4B5563]">Welcome {currentUser?.fullName || "User"}</h1>

                        <div className="flex items-center gap-5">
                          <div className="relative w-[544px] h-[59px]">
                            <input
                              type="text"
                              placeholder="Search Projects"
                              className="w-full h-full bg-[#ECF1FF] rounded-[5px] pl-5 pr-16 text-lg text-[#181D25] placeholder:text-[#AAC1FF] focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-[31px] bg-[#0F47F2] rounded-md flex items-center justify-center hover:bg-[#0d3ec9] transition-colors">
                              <Search className="w-[22px] h-[19px] text-white" strokeWidth={1.33}/>
                            </button>
                          </div>

                        
                        </div> 
                      </div><div className="bg-[#F9FAFB] w-[210px] h-[99px] flex flex-col items-start justify-center px-5 -mr-[34px]">
                            <div className="text-2xl font-medium text-[#0F47F2] leading-[41px]">4D 21Hr</div>
                            <div className="text-lg font-medium text-[#4B5563] leading-6 mt-1">Total Time Saved</div>
                          </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="text-center">
                      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        No job roles created yet
                      </h2>
                      <button
                        onClick={handleCreateJobRole}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Your First Job Role
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              ):  !hasSelectedJob ? (
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

                  <div className="container mx-auto py-6">
                    <div className=" bg-white flex h-[99px] mb-6">
                      <div className="w-[80vw] h-[99px] bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.1)] rounded-[10px] flex items-center justify-between px-[34px]">
                        <h1 className="text-2xl font-medium text-[#4B5563]">Welcome {currentUser?.fullName || "User"}</h1>

                        <div className="flex items-center gap-5">
                          <div className="relative w-[544px] h-[59px]">
                            <input
                              type="text"
                              placeholder="Search Projects"
                              className="w-full h-full bg-[#ECF1FF] rounded-[5px] pl-5 pr-16 text-lg text-[#181D25] placeholder:text-[#AAC1FF] focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20"
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-[31px] bg-[#0F47F2] rounded-md flex items-center justify-center hover:bg-[#0d3ec9] transition-colors">
                              <Search className="w-[22px] h-[19px] text-white" strokeWidth={1.33}/>
                            </button>
                          </div>

                        
                        </div> 
                      </div><div className="bg-[#F9FAFB] w-[210px] h-[99px] flex flex-col items-start justify-center px-5 -mr-[34px]">
                            <div className="text-2xl font-medium text-[#0F47F2] leading-[41px]">4D 21Hr</div>
                            <div className="text-lg font-medium text-[#4B5563] leading-6 mt-1">Total Time Saved</div>
                          </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categories.map((job) => (
                        <div
                          key={job.id}
                          className="rounded-[10px] transition-all duration-300"
                        >
                          <ProjectCard
                            jobId={job.id}
                            jobName={job.name}
                            status={job.status}
                            visibility={job.visibility}
                            isActive={activeCategoryId === job.id}
                            onEditJobRole={handleEditJobRole}
                            onArchiveJob={() => showToast.success("Archive coming soon")}
                            onSharePipelines={handleSharePipelines}
                            onPublishJob={handlePublishJobRole}
                            onUnpublishJob={handleUnpublishJobRole}
                            onSelectCard={() => {
                              setActiveCategoryId(job.id);
                              setHasSelectedJob(true);
                              fetchJobDetailsAndSetFilters(job.id);
                            }}
                          />
                        
                        </div>
                      ))}
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
                              Are you sure you want to sign out? You'll need to
                              log in again to access your account.
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
                                  (cat) => cat.id === showPublishModal
                                )?.name
                              }
                              ? This action will publish job on LinkedIn, Google
                              Jobs,Times Ascent, Cutshort and others.
                            </p>
                            <span className="text-gray-400 text-sm mb-6">
                              (Note: Once published, the job will be visible on
                              both platforms within 24–48 hours.)
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
                                  (cat) => cat.id === showUnpublishModal
                                )?.name
                              }
                              ? This action cannot be undone.
                            </p>
                            <span className="text-gray-400 text-sm mb-6">
                              (Note: this action will unpublish job on published
                              over LinkedIn, Google Jobs,Times Ascent, Cutshort
                              and others within 24–48 hours.)
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
                                  (cat) => cat.id === showDeleteModal
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
                                onClick={() =>
                                  setShowRequisitionInfoModal(false)
                                }
                              >
                                <ArrowLeft className="w-8 h-8" />
                              </button>
                              <h1 className="text-lg font-semibold text-gray-800">
                                Requisition Info
                              </h1>
                            </div>
                          </div>
                          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                            Builder.io Developer
                          </h2>
                          <div className="flex space-x-8 mt-2 mb-6">
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <Briefcase className="w-4 h-4 mr-1" /> 8+ years
                            </span>
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <LocateIcon className="w-4 h-4 mr-1" /> Hybrid
                            </span>
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <FileSearch className="w-4 h-4 mr-1" /> Immediate
                            </span>
                          </div>

                          {/* Role Overview */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Role Overview
                            </h3>
                            <p className="text-gray-600 text-sm">
                              The core experience builder at Builder.io, which
                              is a visual headless CMS with a drag-and-drop page
                              builder that outputs clean code. Take the core
                              Build UI in Builder to Ensure it is responsive,
                              scalable, optimized, and integrated with APIs/CMs.
                            </p>
                          </div>

                          {/* The Core Expectation */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              The Core Expectation
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Take the core Build UI in Builder to Ensure it is
                              responsive, scalable, optimized, and integrated
                              with APIs/CMs.
                            </p>
                          </div>

                          {/* Key Responsibilities Explained */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                              Key Responsibilities Explained
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Develop reusable components
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Why? Maintains quality & consistency
                                      across the website pages built with
                                      Builder.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Integrate with CMS
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Handle content queries, dynamic data, etc.
                                      via APIs.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Work with Design teams
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Translate Figma designs exactly into UI
                                      using Builder.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Troubleshoot integrations
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Fix data binding, CI/CD, integrations
                                      issues.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Optimize performance
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Improve load speeds, responsive/lazy
                                      images, etc.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Required Technical Skills & Purpose */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                              Required Technical Skills & Purpose
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Builder.io
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Visual frontend code overlays
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Visual HTML/CSS
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Of pages
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  CSS (including Flexbox, Grid)
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Styling, responsiveness, animations
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  JavaScript
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Interactive components
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  React / component logic
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Used via Builder integrations into frontend
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  API Integration
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Fetch data dynamically (REST/GraphQL)
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  SEO Best Practices
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Optimize for search, alt texts, structured
                                  data
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Performance Optimization
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Lazy loading, minification, caching
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Communication / Collaboration
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Working with design/product teams
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ): (
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
                        <div className="sticky top-[68px] z-40 will-change-transform bg-gray-50 border-b border-gray-200 py-4">
                          <div className="max-w-full flex items-center justify-between px-4 lg:px-6">
                            {/* Left side – Job title + chips */}
                            <div className="flex items-center gap-8">
                              
                              {/* back button to the job list */}
                              <button
                                onClick={handleBackToCategories}
                                className="group flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Back to job list"
                              >
                                <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.2336 8.4324C16.6851 8.88394 16.6851 9.61605 16.2336 10.0676L8.95745 17.3437H30.8327C31.4712 17.3437 31.9889 17.8614 31.9889 18.5C31.9889 19.1386 31.4712 19.6562 30.8327 19.6562H8.95745L16.2336 26.9325C16.6851 27.384 16.6851 28.116 16.2336 28.5675C15.782 29.0191 15.05 29.0191 14.5984 28.5675L5.34842 19.3175C4.89688 18.866 4.89688 18.134 5.34842 17.6825L14.5984 8.4324C15.05 7.98087 15.782 7.98087 16.2336 8.4324Z"
                                    fill="#4B5563"
                                  />
                                </svg>
                              </button>

                              <h1 className="text-2xl font-semibold text-[#181D25]">
                                {categories.find(c => c.id === activeCategoryId)?.name || "Untitled Job"}
                              </h1>

                              <div className="flex items-center gap-6">
                                {/* Experience */}
                                <div className="flex items-center gap-2 text-[20px] text-[#4B5563]">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="path-1-inside-1_4052_8571" fill="white">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.66094 2.33203H8.33905C9.53576 2.33202 10.4836 2.33201 11.2254 2.43412C11.9888 2.5392 12.6068 2.76062 13.0941 3.25953C13.5814 3.75844 13.7976 4.39106 13.9003 5.17268C14 5.93216 14 6.90256 14 8.12776V8.20296C14 9.42816 14 10.3986 13.9003 11.158C13.7976 11.9396 13.5814 12.5723 13.0941 13.0712C12.6068 13.5701 11.9888 13.7915 11.2254 13.8966C10.4836 13.9987 9.53576 13.9987 8.33905 13.9987H5.66094C4.46426 13.9987 3.5164 13.9987 2.77459 13.8966C2.01116 13.7915 1.39323 13.5701 0.905924 13.0712C0.41862 12.5723 0.202356 11.9396 0.0997193 11.158C-1.928e-05 10.3986 -1.27281e-05 9.42816 2.95108e-07 8.20296V8.12776C-1.27281e-05 6.90256 -1.928e-05 5.93216 0.0997193 5.17268C0.202356 4.39106 0.41862 3.75844 0.905924 3.25953C1.39323 2.76062 2.01116 2.5392 2.77459 2.43412C3.5164 2.33201 4.46425 2.33202 5.66094 2.33203ZM2.90474 3.4252C2.24961 3.51538 1.87216 3.68449 1.59659 3.96663C1.47132 4.09489 1.36886 4.2447 1.28608 4.43296C2.47579 5.22373 3.25751 5.7339 3.91575 6.07056C3.95902 5.83976 4.1573 5.66536 4.39535 5.66536C4.66507 5.66536 4.88372 5.88923 4.88372 6.16536V6.47063C6.2638 6.89703 7.7362 6.89703 9.11628 6.4707V6.16536C9.11628 5.88923 9.33494 5.66536 9.60465 5.66536C9.84272 5.66536 10.041 5.83976 10.0842 6.07056C10.7425 5.7339 11.5242 5.22379 12.714 4.43302C12.6312 4.24472 12.5287 4.09491 12.4034 3.96663C12.1278 3.68449 11.7504 3.51538 11.0953 3.4252C10.4261 3.33309 9.54396 3.33203 8.30233 3.33203H5.69767C4.45602 3.33203 3.57391 3.33309 2.90474 3.4252ZM12.9514 5.46744C11.7227 6.28263 10.88 6.8221 10.093 7.16843V7.4987C10.093 7.77483 9.87436 7.9987 9.60465 7.9987C9.33852 7.9987 9.12208 7.7807 9.11641 7.50963C7.72924 7.88403 6.27076 7.88403 4.88361 7.50963C4.87794 7.7807 4.66151 7.9987 4.39535 7.9987C4.12563 7.9987 3.90698 7.77483 3.90698 7.4987V7.16837C3.12005 6.82203 2.27735 6.28257 1.04859 5.46738C0.97763 6.13163 0.976745 6.99156 0.976745 8.16536C0.976745 9.43656 0.97778 10.3397 1.06775 11.0248C1.15583 11.6955 1.32101 12.082 1.59659 12.3641C1.87216 12.6462 2.24961 12.8154 2.90474 12.9055C3.57391 12.9976 4.45602 12.9987 5.69767 12.9987H8.30233C9.54396 12.9987 10.4261 12.9976 11.0953 12.9055C11.7504 12.8154 12.1278 12.6462 12.4034 12.3641C12.679 12.082 12.8442 11.6955 12.9322 11.0248C13.0222 10.3397 13.0233 9.43656 13.0233 8.16536C13.0233 6.99163 13.0223 6.1317 12.9514 5.46744Z"/>
                                    </mask>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.66094 2.33203H8.33905C9.53576 2.33202 10.4836 2.33201 11.2254 2.43412C11.9888 2.5392 12.6068 2.76062 13.0941 3.25953C13.5814 3.75844 13.7976 4.39106 13.9003 5.17268C14 5.93216 14 6.90256 14 8.12776V8.20296C14 9.42816 14 10.3986 13.9003 11.158C13.7976 11.9396 13.5814 12.5723 13.0941 13.0712C12.6068 13.5701 11.9888 13.7915 11.2254 13.8966C10.4836 13.9987 9.53576 13.9987 8.33905 13.9987H5.66094C4.46426 13.9987 3.5164 13.9987 2.77459 13.8966C2.01116 13.7915 1.39323 13.5701 0.905924 13.0712C0.41862 12.5723 0.202356 11.9396 0.0997193 11.158C-1.928e-05 10.3986 -1.27281e-05 9.42816 2.95108e-07 8.20296V8.12776C-1.27281e-05 6.90256 -1.928e-05 5.93216 0.0997193 5.17268C0.202356 4.39106 0.41862 3.75844 0.905924 3.25953C1.39323 2.76062 2.01116 2.5392 2.77459 2.43412C3.5164 2.33201 4.46425 2.33202 5.66094 2.33203ZM2.90474 3.4252C2.24961 3.51538 1.87216 3.68449 1.59659 3.96663C1.47132 4.09489 1.36886 4.2447 1.28608 4.43296C2.47579 5.22373 3.25751 5.7339 3.91575 6.07056C3.95902 5.83976 4.1573 5.66536 4.39535 5.66536C4.66507 5.66536 4.88372 5.88923 4.88372 6.16536V6.47063C6.2638 6.89703 7.7362 6.89703 9.11628 6.4707V6.16536C9.11628 5.88923 9.33494 5.66536 9.60465 5.66536C9.84272 5.66536 10.041 5.83976 10.0842 6.07056C10.7425 5.7339 11.5242 5.22379 12.714 4.43302C12.6312 4.24472 12.5287 4.09491 12.4034 3.96663C12.1278 3.68449 11.7504 3.51538 11.0953 3.4252C10.4261 3.33309 9.54396 3.33203 8.30233 3.33203H5.69767C4.45602 3.33203 3.57391 3.33309 2.90474 3.4252ZM12.9514 5.46744C11.7227 6.28263 10.88 6.8221 10.093 7.16843V7.4987C10.093 7.77483 9.87436 7.9987 9.60465 7.9987C9.33852 7.9987 9.12208 7.7807 9.11641 7.50963C7.72924 7.88403 6.27076 7.88403 4.88361 7.50963C4.87794 7.7807 4.66151 7.9987 4.39535 7.9987C4.12563 7.9987 3.90698 7.77483 3.90698 7.4987V7.16837C3.12005 6.82203 2.27735 6.28257 1.04859 5.46738C0.97763 6.13163 0.976745 6.99156 0.976745 8.16536C0.976745 9.43656 0.97778 10.3397 1.06775 11.0248C1.15583 11.6955 1.32101 12.082 1.59659 12.3641C1.87216 12.6462 2.24961 12.8154 2.90474 12.9055C3.57391 12.9976 4.45602 12.9987 5.69767 12.9987H8.30233C9.54396 12.9987 10.4261 12.9976 11.0953 12.9055C11.7504 12.8154 12.1278 12.6462 12.4034 12.3641C12.679 12.082 12.8442 11.6955 12.9322 11.0248C13.0222 10.3397 13.0233 9.43656 13.0233 8.16536C13.0233 6.99163 13.0223 6.1317 12.9514 5.46744Z" fill="#818283"/>
                                    <path d="M5.66094 2.33203L5.66056 35.6654H5.66094V2.33203ZM8.33905 2.33203V35.6654H8.33942L8.33905 2.33203ZM11.2254 2.43412L15.7709 -30.5878L15.7707 -30.5879L11.2254 2.43412ZM13.0941 3.25953L36.9411 -20.0307L36.9394 -20.0324L13.0941 3.25953ZM13.9003 5.17268L46.9501 0.834406L46.9496 0.8307L13.9003 5.17268ZM13.9003 11.158L46.9496 15.5001L46.9501 15.4964L13.9003 11.158ZM13.0941 13.0712L36.9384 36.3641L36.9415 36.361L13.0941 13.0712ZM11.2254 13.8966L15.769 46.9188L15.7729 46.9183L11.2254 13.8966ZM2.77459 13.8966L-1.77285 46.9183L-1.76897 46.9189L2.77459 13.8966ZM0.905924 13.0712L-22.9406 36.3619L-22.9389 36.3637L0.905924 13.0712ZM0.0997193 11.158L33.1493 6.8181L33.1493 6.81773L0.0997193 11.158ZM2.95108e-07 8.20296L33.3333 8.20332V8.20296H2.95108e-07ZM2.95108e-07 8.12776H33.3333V8.12741L2.95108e-07 8.12776ZM0.0997193 5.17268L33.1493 9.51291L33.1493 9.5125L0.0997193 5.17268ZM0.905924 3.25953L-22.9398 -20.0319L-22.9401 -20.0316L0.905924 3.25953ZM2.77459 2.43412L-1.77072 -30.5879L-1.77087 -30.5878L2.77459 2.43412ZM2.90474 3.4252L7.44996 36.4472L7.45029 36.4472L2.90474 3.4252ZM1.59659 3.96663L-22.2493 -19.3247L-22.2499 -19.3241L1.59659 3.96663ZM1.28608 4.43296L-29.2281 -8.9833L-40.5102 16.677L-17.1655 32.1935L1.28608 4.43296ZM3.91575 6.07056L-11.263 35.7474L28.4562 56.0626L36.6781 12.2137L3.91575 6.07056ZM4.88372 6.47063H-28.4496V31.0598L-4.95627 38.3185L4.88372 6.47063ZM9.11628 6.4707L18.9549 38.319L42.4496 31.061V6.4707H9.11628ZM10.0842 6.07056L-22.6791 12.2083L-14.4631 56.0653L25.2626 35.7477L10.0842 6.07056ZM12.714 4.43302L31.1654 32.1937L54.5077 16.679L43.2296 -8.97989L12.714 4.43302ZM12.4034 3.96663L36.2499 -19.3241L36.2496 -19.3244L12.4034 3.96663ZM11.0953 3.4252L15.6409 -29.5967L15.6407 -29.5968L11.0953 3.4252ZM12.9514 5.46744L46.0964 1.92912L40.2691 -52.6581L-5.47641 -22.3089L12.9514 5.46744ZM10.093 7.16843L-3.33433 -23.3409L-23.2403 -14.5801V7.16843H10.093ZM9.11641 7.50963L42.4425 6.81314L41.5525 -35.771L0.430499 -24.6721L9.11641 7.50963ZM4.88361 7.50963L13.5696 -24.6721L-27.5514 -35.7709L-28.4424 6.81234L4.88361 7.50963ZM3.90698 7.16837H37.2403V-14.5802L17.3343 -23.3409L3.90698 7.16837ZM1.04859 5.46738L19.4762 -22.3091L-26.2651 -52.655L-32.0961 1.92645L1.04859 5.46738ZM1.06775 11.0248L-31.9818 15.3649L-31.9818 15.3651L1.06775 11.0248ZM2.90474 12.9055L7.45126 -20.1163L7.44798 -20.1168L2.90474 12.9055ZM11.0953 12.9055L6.55165 -20.1167L6.54895 -20.1163L11.0953 12.9055ZM12.9322 11.0248L-20.1172 6.68386L-20.1176 6.68644L12.9322 11.0248ZM5.66094 2.33203V35.6654H8.33905V2.33203V-31.0013H5.66094V2.33203ZM8.33905 2.33203L8.33942 35.6654C8.66036 35.6654 8.84144 35.6655 8.99301 35.6664C9.13735 35.6672 9.14144 35.6683 9.06567 35.6663C8.99106 35.6643 8.74149 35.6569 8.37604 35.6321C8.01341 35.6076 7.4248 35.5586 6.68004 35.4561L11.2254 2.43412L15.7707 -30.5879C12.2416 -31.0736 8.62847 -31.0013 8.33868 -31.0013L8.33905 2.33203ZM11.2254 2.43412L6.67986 35.4561C3.61258 35.0339 -4.04189 33.4201 -10.7511 26.5515L13.0941 3.25953L36.9394 -20.0324C29.2554 -27.8989 20.3651 -29.9554 15.7709 -30.5878L11.2254 2.43412ZM13.0941 3.25953L-10.7529 26.5497C-17.3543 19.7905 -18.7862 12.2765 -19.149 9.51467L13.9003 5.17268L46.9496 0.8307C46.3814 -3.49433 44.517 -12.2736 36.9411 -20.0307L13.0941 3.25953ZM13.9003 5.17268L-19.1495 9.51096C-19.2413 8.81181 -19.2846 8.26339 -19.306 7.93233C-19.3276 7.59843 -19.3337 7.37614 -19.335 7.32184C-19.3365 7.2664 -19.3352 7.28814 -19.3344 7.44466C-19.3334 7.60809 -19.3333 7.80069 -19.3333 8.12776H14H47.3333C47.3333 7.76867 47.3992 4.25545 46.9501 0.834406L13.9003 5.17268ZM14 8.12776H-19.3333V8.20296H14H47.3333V8.12776H14ZM14 8.20296H-19.3333C-19.3333 8.53004 -19.3334 8.72264 -19.3344 8.88607C-19.3352 9.04259 -19.3365 9.06433 -19.335 9.00888C-19.3337 8.95458 -19.3276 8.73229 -19.306 8.39838C-19.2846 8.06731 -19.2413 7.51887 -19.1495 6.81968L13.9003 11.158L46.9501 15.4964C47.3992 12.0753 47.3333 8.56202 47.3333 8.20296H14ZM13.9003 11.158L-19.149 6.81594C-18.7862 4.05455 -17.3545 -3.45925 -10.7533 -10.2185L13.0941 13.0712L36.9415 36.361C44.5172 28.6038 46.3815 19.8247 46.9496 15.5001L13.9003 11.158ZM13.0941 13.0712L-10.7502 -10.2217C-4.04109 -17.0896 3.6127 -18.7029 6.67788 -19.125L11.2254 13.8966L15.7729 46.9183C20.3649 46.2859 29.2546 44.2298 36.9384 36.3641L13.0941 13.0712ZM11.2254 13.8966L6.68179 -19.1256C7.42616 -19.228 8.01443 -19.2769 8.37679 -19.3015C8.74199 -19.3262 8.99134 -19.3336 9.0658 -19.3356C9.14142 -19.3376 9.13719 -19.3365 8.99278 -19.3356C8.84114 -19.3347 8.66001 -19.3346 8.33905 -19.3346V13.9987V47.332C8.62909 47.332 12.2411 47.4043 15.769 46.9188L11.2254 13.8966ZM8.33905 13.9987V-19.3346H5.66094V13.9987V47.332H8.33905V13.9987ZM5.66094 13.9987V-19.3346C5.33999 -19.3346 5.15887 -19.3347 5.00722 -19.3356C4.86281 -19.3365 4.85859 -19.3376 4.9342 -19.3356C5.00865 -19.3336 5.25799 -19.3262 5.62317 -19.3015C5.98552 -19.2769 6.57379 -19.228 7.31816 -19.1256L2.77459 13.8966L-1.76897 46.9189C1.75891 47.4043 5.37092 47.332 5.66094 47.332V13.9987ZM2.77459 13.8966L7.32203 -19.1251C10.3875 -18.7029 18.0416 -17.0894 24.7507 -10.2212L0.905924 13.0712L-22.9389 36.3637C-15.2551 44.2296 -6.36523 46.2859 -1.77285 46.9183L2.77459 13.8966ZM0.905924 13.0712L24.7524 -10.2194C31.3543 -3.46 32.7864 4.05453 33.1493 6.8181L0.0997193 11.158L-32.9499 15.498C-32.3817 19.8247 -30.5171 28.6046 -22.9406 36.3619L0.905924 13.0712ZM0.0997193 11.158L33.1493 6.81773C33.2411 7.51735 33.2845 8.06616 33.3059 8.39751C33.3275 8.73171 33.3337 8.95424 33.335 9.00871C33.3364 9.06432 33.3352 9.04272 33.3344 8.88627C33.3334 8.72292 33.3333 8.53038 33.3333 8.20332L2.95108e-07 8.20296L-33.3333 8.20261C-33.3333 8.56137 -33.3993 12.0759 -32.9498 15.4983L0.0997193 11.158ZM2.95108e-07 8.20296H33.3333V8.12776H2.95108e-07H-33.3333V8.20296H2.95108e-07ZM2.95108e-07 8.12776L33.3333 8.12741C33.3333 7.80035 33.3334 7.60781 33.3344 7.44446C33.3352 7.28801 33.3364 7.26641 33.335 7.32202C33.3337 7.37649 33.3275 7.59901 33.3059 7.93319C33.2845 8.26454 33.2412 8.81333 33.1493 9.51291L0.0997193 5.17268L-32.9498 0.832456C-33.3993 4.25486 -33.3333 7.76932 -33.3333 8.12812L2.95108e-07 8.12776ZM0.0997193 5.17268L33.1493 9.5125C32.7864 12.2765 31.3541 19.7912 24.752 26.5507L0.905924 3.25953L-22.9401 -20.0316C-30.5169 -12.2743 -32.3817 -3.49434 -32.9499 0.832866L0.0997193 5.17268ZM0.905924 3.25953L24.7516 26.551C18.0424 33.4199 10.3877 35.0338 7.32005 35.4561L2.77459 2.43412L-1.77087 -30.5878C-6.36534 -29.9554 -15.2559 -27.8987 -22.9398 -20.0319L0.905924 3.25953ZM2.77459 2.43412L7.31991 35.4561C6.57515 35.5586 5.98655 35.6076 5.62393 35.6321C5.25849 35.6569 5.00893 35.6643 4.93433 35.6663C4.85856 35.6683 4.86266 35.6672 5.00699 35.6664C5.15856 35.6655 5.33963 35.6654 5.66056 35.6654L5.66094 2.33203L5.66131 -31.0013C5.37153 -31.0013 1.7584 -31.0736 -1.77072 -30.5879L2.77459 2.43412ZM2.90474 3.4252L-1.64048 -29.5968C-6.15279 -28.9757 -14.7893 -26.9623 -22.2493 -19.3247L1.59659 3.96663L25.4425 27.2579C22.34 30.4343 18.75 32.7827 15.0562 34.3398C11.7132 35.749 8.90376 36.2471 7.44996 36.4472L2.90474 3.4252ZM1.59659 3.96663L-22.2499 -19.3241C-25.2803 -16.2213 -27.597 -12.6931 -29.2281 -8.9833L1.28608 4.43296L31.8003 17.8492C30.3347 21.1825 28.2229 24.4111 25.4431 27.2573L1.59659 3.96663ZM1.28608 4.43296L-17.1655 32.1935C-16.4525 32.6675 -13.963 34.3665 -11.263 35.7474L3.91575 6.07056L19.0945 -23.6063C19.5808 -23.3576 19.9533 -23.1469 20.1829 -23.013C20.4098 -22.8808 20.5475 -22.794 20.5598 -22.7863C20.5723 -22.7784 20.521 -22.8106 20.3679 -22.9108C20.2149 -23.011 20.0193 -23.1404 19.7377 -23.3276L1.28608 4.43296ZM3.91575 6.07056L36.6781 12.2137C33.9229 26.9077 21.0383 38.9987 4.39535 38.9987V5.66536V-27.668C-12.7237 -27.668 -26.0049 -15.2282 -28.8466 -0.0725615L3.91575 6.07056ZM4.39535 5.66536V38.9987C-14.4798 38.9987 -28.4496 23.5547 -28.4496 6.16536H4.88372H38.2171C38.2171 -11.7762 23.8099 -27.668 4.39535 -27.668V5.66536ZM4.88372 6.16536H-28.4496V6.47063H4.88372H38.2171V6.16536H4.88372ZM4.88372 6.47063L-4.95627 38.3185C2.83428 40.7255 11.1652 40.7254 18.9549 38.319L9.11628 6.4707L-0.72231 -25.3776C4.30726 -26.9313 9.69332 -26.9315 14.7237 -25.3772L4.88372 6.47063ZM9.11628 6.4707H42.4496V6.16536H9.11628H-24.2171V6.4707H9.11628ZM9.11628 6.16536H42.4496C42.4496 23.555 28.4795 38.9987 9.60465 38.9987V5.66536V-27.668C-9.80961 -27.668 -24.2171 -11.7765 -24.2171 6.16536H9.11628ZM9.60465 5.66536V38.9987C-7.03626 38.9987 -19.9252 26.9089 -22.6791 12.2083L10.0842 6.07056L42.8476 -0.0672038C40.0072 -15.2294 26.7217 -27.668 9.60465 -27.668V5.66536ZM10.0842 6.07056L25.2626 35.7477C27.9623 34.3669 30.4511 32.6685 31.1654 32.1937L12.714 4.43302L-5.73748 -23.3277C-6.01892 -23.1406 -6.21443 -23.0113 -6.36735 -22.9111C-6.52026 -22.811 -6.57151 -22.7788 -6.55893 -22.7868C-6.54651 -22.7946 -6.40881 -22.8813 -6.182 -23.0135C-5.95244 -23.1474 -5.5801 -23.358 -5.09409 -23.6065L10.0842 6.07056ZM12.714 4.43302L43.2296 -8.97989C41.597 -12.6943 39.2788 -16.2229 36.2499 -19.3241L12.4034 3.96663L-11.4431 27.2573C-14.2214 24.4127 -16.3346 21.1838 -17.8017 17.8459L12.714 4.43302ZM12.4034 3.96663L36.2496 -19.3244C28.7893 -26.9624 20.1525 -28.9757 15.6409 -29.5967L11.0953 3.4252L6.54967 36.4471C5.0958 36.247 2.28656 35.7489 -1.05616 34.3398C-4.74956 32.7829 -8.33981 30.4345 -11.4427 27.2577L12.4034 3.96663ZM11.0953 3.4252L15.6407 -29.5968C12.1676 -30.0748 8.56577 -30.0013 8.30233 -30.0013V3.33203V36.6654C8.62793 36.6654 8.82061 36.6655 8.9769 36.6664C9.12909 36.6673 9.13518 36.6684 9.05905 36.6665C8.98474 36.6646 8.7223 36.6571 8.33854 36.6316C7.95629 36.6062 7.33442 36.5552 6.54992 36.4472L11.0953 3.4252ZM8.30233 3.33203V-30.0013H5.69767V3.33203V36.6654H8.30233V3.33203ZM5.69767 3.33203V-30.0013C5.4343 -30.0013 1.83233 -30.0748 -1.64081 -29.5967L2.90474 3.4252L7.45029 36.4472C6.66573 36.5551 6.04381 36.6062 5.66153 36.6316C5.27774 36.6571 5.01528 36.6646 4.94096 36.6665C4.86482 36.6684 4.87091 36.6673 5.0231 36.6664C5.17939 36.6655 5.37207 36.6654 5.69767 36.6654V3.33203ZM12.9514 5.46744L-5.47641 -22.3089C-5.74601 -22.13 -5.89748 -22.0308 -5.99173 -21.9699C-6.0847 -21.9098 -6.03954 -21.9406 -5.9052 -22.0219C-5.66973 -22.1644 -4.73101 -22.7262 -3.33433 -23.3409L10.093 7.16843L23.5204 37.6777C27.3875 35.9758 30.628 33.7422 31.3793 33.2438L12.9514 5.46744ZM10.093 7.16843H-23.2403V7.4987H10.093H43.4264V7.16843H10.093ZM10.093 7.4987H-23.2403C-23.2403 -9.89093 -9.27016 -25.3346 9.60465 -25.3346V7.9987V41.332C29.0189 41.332 43.4264 25.4406 43.4264 7.4987H10.093ZM9.60465 7.9987V-25.3346C28.2266 -25.3346 42.085 -10.2907 42.4425 6.81314L9.11641 7.50963L-24.2096 8.20612C-23.8409 25.8521 -9.54956 41.332 9.60465 41.332V7.9987ZM9.11641 7.50963L0.430499 -24.6721C4.73211 -25.8331 9.26785 -25.8332 13.5696 -24.6721L4.88361 7.50963L-3.80241 39.6914C3.27368 41.6012 10.7264 41.6012 17.8023 39.6914L9.11641 7.50963ZM4.88361 7.50963L-28.4424 6.81234C-28.0846 -10.2904 -14.227 -25.3346 4.39535 -25.3346V7.9987V41.332C23.55 41.332 37.8405 25.8518 38.2096 8.20692L4.88361 7.50963ZM4.39535 7.9987V-25.3346C23.2704 -25.3346 37.2403 -9.89064 37.2403 7.4987H3.90698H-29.4264C-29.4264 25.4403 -15.0192 41.332 4.39535 41.332V7.9987ZM3.90698 7.4987H37.2403V7.16837H3.90698H-29.4264V7.4987H3.90698ZM3.90698 7.16837L17.3343 -23.3409C18.7312 -22.7262 19.67 -22.1644 19.9054 -22.0219C20.0397 -21.9406 20.0848 -21.9098 19.9918 -21.9699C19.8974 -22.0309 19.7459 -22.1302 19.4762 -22.3091L1.04859 5.46738L-17.379 33.2439C-16.6285 33.7418 -13.3876 35.9757 -9.52037 37.6777L3.90698 7.16837ZM1.04859 5.46738L-32.0961 1.92645C-32.4 4.77082 -32.3566 7.7159 -32.3566 8.16536H0.976745H34.3101C34.3101 7.86055 34.3102 7.66326 34.311 7.49717C34.3117 7.33476 34.3128 7.28745 34.3124 7.30659C34.3121 7.32463 34.3088 7.4873 34.2953 7.74529C34.2818 8.00185 34.2539 8.44141 34.1933 9.00831L1.04859 5.46738ZM0.976745 8.16536H-32.3566C-32.3566 8.50217 -32.4235 12.0012 -31.9818 15.3649L1.06775 11.0248L34.1173 6.68479C34.2144 7.42357 34.2597 8.00531 34.282 8.35642C34.3044 8.70913 34.3105 8.94485 34.3119 8.99971C34.3133 9.05633 34.312 9.03325 34.3111 8.86936C34.3102 8.70157 34.3101 8.49766 34.3101 8.16536H0.976745ZM1.06775 11.0248L-31.9818 15.3651C-31.4249 19.6059 -29.603 28.1268 -22.249 35.6557L1.59659 12.3641L25.4422 -10.9275C28.539 -7.75699 30.7504 -4.17181 32.188 -0.597013C33.4878 2.6351 33.9389 5.3257 34.1173 6.68455L1.06775 11.0248ZM1.59659 12.3641L-22.249 35.6557C-14.7894 43.2928 -6.15325 45.3066 -1.6385 45.9278L2.90474 12.9055L7.44798 -20.1168C8.90267 -19.9166 11.7126 -19.4185 15.0561 -18.0091C18.7502 -16.4519 22.3401 -14.1034 25.4422 -10.9275L1.59659 12.3641ZM2.90474 12.9055L-1.64178 45.9273C1.8319 46.4056 5.43428 46.332 5.69767 46.332V12.9987V-20.3346C5.3721 -20.3346 5.17945 -20.3348 5.02321 -20.3357C4.87106 -20.3366 4.86504 -20.3377 4.94125 -20.3357C5.01565 -20.3338 5.2782 -20.3264 5.66211 -20.3008C6.04449 -20.2754 6.66654 -20.2244 7.45126 -20.1163L2.90474 12.9055ZM5.69767 12.9987V46.332H8.30233V12.9987V-20.3346H5.69767V12.9987ZM8.30233 12.9987V46.332C8.56579 46.332 12.168 46.4056 15.6416 45.9273L11.0953 12.9055L6.54895 -20.1163C7.33361 -20.2244 7.95561 -20.2754 8.33797 -20.3008C8.72184 -20.3264 8.98438 -20.3338 9.05876 -20.3357C9.13496 -20.3377 9.12893 -20.3366 8.97678 -20.3357C8.82055 -20.3348 8.6279 -20.3346 8.30233 -20.3346V12.9987ZM11.0953 12.9055L15.6389 45.9277C20.1529 45.3066 28.7894 43.2929 36.2493 35.6554L12.4034 12.3641L-11.4425 -10.9272C-8.33989 -14.1037 -4.74984 -16.4521 -1.05609 -18.0091C2.28711 -19.4184 5.09689 -19.9165 6.55165 -20.1167L11.0953 12.9055ZM12.4034 12.3641L36.2493 35.6554C43.6028 28.1269 45.425 19.6063 45.982 15.3632L12.9322 11.0248L-20.1176 6.68644C-19.9391 5.32675 -19.488 2.63563 -18.188 -0.59694C-16.7503 -4.17209 -14.5389 -7.75707 -11.4425 -10.9272L12.4034 12.3641ZM12.9322 11.0248L45.9817 15.3658C46.4236 12.0016 46.3566 8.5022 46.3566 8.16536H13.0233H-20.3101C-20.3101 8.49763 -20.3102 8.70152 -20.3111 8.86926C-20.312 9.0331 -20.3133 9.05612 -20.3119 8.99943C-20.3105 8.9445 -20.3043 8.70869 -20.282 8.35588C-20.2597 8.00466 -20.2143 7.42279 -20.1172 6.68386L12.9322 11.0248ZM13.0233 8.16536H46.3566C46.3566 7.71432 46.3999 4.77163 46.0964 1.92912L12.9514 5.46744L-20.1936 9.00576C-20.254 8.43961 -20.2819 8.00066 -20.2953 7.74451C-20.3088 7.48692 -20.3121 7.32456 -20.3124 7.30666C-20.3128 7.28766 -20.3117 7.33506 -20.311 7.49742C-20.3102 7.66344 -20.3101 7.86074 -20.3101 8.16536H13.0233Z" fill="#818283" mask="url(#path-1-inside-1_4052_8571)"/>
                                    <path d="M6.99902 1C6.36137 1.00013 5.81775 1.41686 5.61621 2L5.57422 2.0918C5.47367 2.26266 5.28105 2.35667 5.08789 2.3291L4.99219 2.30469C4.7418 2.21418 4.60914 1.9365 4.69043 1.67969L4.69434 1.66699C5.02964 0.696817 5.93408 0.000126353 6.99902 0M6.99902 1V0M6.99902 1L7.11816 1.00488C7.6991 1.05255 8.18461 1.44676 8.37695 1.98633L8.83496 1.8291M6.99902 1V0M6.99902 0C7.4846 0 7.93624 0.146091 8.31641 0.395508M9.00684 2.30469L8.91016 2.3291C8.71725 2.35637 8.52526 2.26238 8.4248 2.0918L8.38281 2M9.00684 2.30469L8.83887 1.8418M9.00684 2.30469C9.26114 2.21263 9.39437 1.92717 9.30469 1.66699C9.1222 1.13905 8.77016 0.693202 8.31641 0.395508M9.00684 2.30469L8.59375 1.16211M8.38281 2L8.83887 1.8418M8.38281 2L8.83887 1.8418M8.38281 2C8.38132 1.99567 8.37849 1.99161 8.37695 1.9873L8.83496 1.8291M8.83887 1.8418L8.83496 1.8291M8.31641 0.395508L8.59375 1.16211M8.31641 0.395508L8.59375 1.16211M8.59375 1.16211L8.83496 1.8291" fill="#818283" stroke="#818283" stroke-width="33.3333"/>
                                    </svg>

                                  <span>8+ years</span>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-[20px] text-[#4B5563]">
                                  <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5.22754 13.7803C5.47344 13.895 5.73645 13.9531 6 13.9531M5.22754 13.7803L4.7793 14.7236M5.22754 13.7803C5.22344 13.7784 5.21893 13.7773 5.21484 13.7754C3.97467 13.1856 2.92591 12.0478 2.18359 10.6572C1.48867 9.35526 1.08131 7.86697 1.0332 6.48047L1.02832 6.20508C1.02832 6.126 1.03079 6.04693 1.03418 5.96875M5.22754 13.7803L4.7793 14.7236M6 13.9531V15M6 13.9531V15M6 13.9531C6.26327 13.9531 6.52582 13.8947 6.77148 13.7803M6 15C5.63532 15 5.27078 14.9291 4.92578 14.7881L4.7793 14.7236M6 15C6.4167 15 6.83335 14.9078 7.2207 14.7236M4.7793 14.7236C3.381 14.0586 2.24537 12.8496 1.43652 11.4414L1.2793 11.1572C0.513359 9.72228 0.0596741 8.07541 0.00585938 6.51562L0 6.20508C0 5.94701 0.0172192 5.69233 0.046875 5.44238M7.2207 14.7236L6.77148 13.7803M7.2207 14.7236C8.61899 14.0586 9.75466 12.8496 10.5635 11.4414L10.7207 11.1572C11.4867 9.72228 11.9403 8.07541 11.9941 6.51562L12 6.20508C12 5.94697 11.9818 5.69236 11.9521 5.44238M7.2207 14.7236L6.77148 13.7803M6.77148 13.7803C6.77585 13.7782 6.7808 13.7775 6.78516 13.7754C8.02534 13.1856 9.07412 12.0478 9.81641 10.6572C10.5114 9.35526 10.9187 7.86697 10.9668 6.48047L10.9717 6.20508C10.9717 6.12632 10.9682 6.0476 10.9648 5.96973L11.9521 5.44238M6 8.63672V8.7207M6 8.63672L5.9834 8.62793M6 8.63672V8.7207M6 8.63672L5.9834 8.62793M6 8.7207C5.94215 8.7207 5.88503 8.71476 5.82812 8.71094M6 8.7207C6.93899 8.7207 7.75722 8.20701 8.20605 7.44238L5.9834 8.62793M5.82812 8.71094L5.9834 8.62793M5.82812 8.71094L6 8.62012M5.82812 8.71094C4.52078 8.62301 3.48336 7.54512 3.43359 6.20508L3.42871 6.10449C3.4288 4.65963 4.57989 3.48828 6 3.48828M11.9521 5.44238C11.813 4.27015 11.3596 3.1977 10.6777 2.32031L10.167 3.39355C10.6358 4.13994 10.9237 5.01972 10.9648 5.96875L11.9521 5.44238ZM6 8.62012L8.20605 7.44141C8.4358 7.04972 8.57129 6.59378 8.57129 6.10449C8.5712 4.65963 7.42013 3.48828 6 3.48828M6 8.62012V7.6748M6 8.62012V7.6748M6 7.6748C6.81888 7.6748 7.48714 7.02517 7.53809 6.20508L7.54297 6.10449C7.54289 5.29195 6.93591 4.62356 6.1582 4.54297L6 4.53516M6 7.6748L5.8418 7.66602C5.06406 7.5854 4.45703 6.91707 4.45703 6.10449C4.45712 5.23761 5.14799 4.53516 6 4.53516M6 4.53516V3.48828M6 4.53516V3.48828M0.046875 5.44238L1.03418 5.96875M0.046875 5.44238L1.03418 5.96875M0.046875 5.44238C0.18594 4.27032 0.639593 3.19764 1.32129 2.32031L1.83203 3.39355C1.36335 4.13985 1.07526 5.01989 1.03418 5.96875M6 1.04688C4.26409 1.04688 2.73055 1.97199 1.84082 3.37793L1.33203 2.30762C2.43053 0.901663 4.11073 0 6 0M6 1.04688V0M6 1.04688L6.25488 1.05273C7.88522 1.13833 9.31224 2.04145 10.1582 3.37793L10.667 2.30762C9.56848 0.901935 7.88906 0 6 0M6 1.04688V0M1.84082 3.37891C1.83792 3.38348 1.83491 3.38799 1.83203 3.39258L1.32227 2.31934C1.3251 2.31568 1.32821 2.31224 1.33105 2.30859L1.84082 3.37891ZM10.6768 2.31934L10.167 3.39258C10.1641 3.38799 10.1611 3.38349 10.1582 3.37891L10.668 2.30859C10.6708 2.31224 10.6739 2.31568 10.6768 2.31934Z" fill="#818283" stroke="#818283" stroke-width="33.3333"/>
                                  </svg>

                                  <span>Hybrid</span>
                                </div>

                                {/* Notice Period */}
                                <div className="flex items-center gap-2 text-[20px] text-[#4B5563]">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M0.00878906 5.42578C0.00796287 5.47727 0.00649381 5.52934 0.00585938 5.58203L0.724609 5.56836L0.983398 5.53418C0.984033 5.48663 0.98358 5.43975 0.984375 5.39355M0.00878906 5.42578L0.984375 5.39355M0.00878906 5.42578L0.984375 5.39355M0.00878906 5.42578C0.00891462 5.41796 0.00865874 5.41014 0.00878906 5.40234L1.03027 5.31836M0.984375 5.39355C0.984723 5.37335 0.98497 5.35295 0.985352 5.33301H1.03027M12.9697 5.31934L13.9902 5.4043C13.9912 5.46245 13.9924 5.52136 13.9932 5.58105L13.2471 5.56641L13.0156 5.53613M12.9697 5.31934V5.33301M12.9697 5.31934L10.6709 5.12988M12.9697 5.31934V5.33301M13.0156 5.53613C13.0147 5.46712 13.0159 5.39918 13.0146 5.33301H12.9697M13.0156 5.53613C13.0157 5.53808 13.0156 5.54004 13.0156 5.54199L13.1963 5.56543L13.2461 5.56641L13.0156 5.53613ZM12.9697 5.33301H11.4199M1.03027 5.33301V5.31836M1.03027 5.33301H2.31055M1.03027 5.33301V5.31836M1.03027 5.31836L3.32227 5.12891M10.6709 5.12988L10.6562 5.23242M10.6709 5.12988L9.91211 5.06641M10.6709 5.12988L10.6621 5.18848M11.4199 5.33301L10.6562 5.23242M11.4199 5.33301H11.415M11.4199 5.33301H11.415M10.6562 5.23242L10.6572 5.22656M10.6562 5.23242L10.4199 5.20215M10.6562 5.23242L10.6445 5.31641M10.6562 5.23242L10.4199 5.20215M11.415 5.33301L10.6562 5.2334L10.6455 5.31641M11.415 5.33301H11.1318M11.1318 5.33301L10.9072 5.3252M11.1318 5.33301H10.9072M11.1318 5.33301L10.9072 5.3252M10.9072 5.3252V5.33301M10.9072 5.3252V5.33301M10.9072 5.33301H10.6494M10.6494 5.33301L10.6514 5.31641M10.6494 5.33301L10.6514 5.31641M10.6494 5.33301H10.6436M10.6514 5.31641H10.6455M10.6514 5.31641H10.6455M10.6455 5.31641L10.6436 5.33301M10.6436 5.33301L10.6445 5.31641M10.6436 5.33301H10.4102M10.6445 5.31641L10.4111 5.30859M10.6445 5.31641L10.4111 5.30859M10.4102 5.33301L10.4111 5.30859M10.4102 5.33301L10.4111 5.30859M10.4102 5.33301H10.2559M10.4111 5.30859L10.2559 5.30371M10.4111 5.30859L10.4199 5.20215M10.4111 5.30859L10.2559 5.30371M10.4111 5.30859L10.4199 5.20215M10.2559 5.33301V5.30371M10.2559 5.33301V5.30371M10.2559 5.33301H9.68262M9.91211 5.06641L9.85645 5.12109M9.91211 5.06641L9.16504 5.00488L9.13672 5.0332H9.13574L9.05859 5.1084M9.91211 5.06641L9.85645 5.12109M10.6621 5.18848L10.4219 5.17676M10.6621 5.18848L10.6572 5.22656M10.6621 5.18848L10.4219 5.17676M10.4219 5.17676L10.4199 5.19531M10.4219 5.17676L10.4199 5.19531M10.4199 5.19531L10.2559 5.17383L10.1875 5.16504H10.1865L10.6572 5.22656M10.4199 5.19531L10.6572 5.22656M9.68262 5.33301V5.29102M9.68262 5.33301H9.64062M9.68262 5.33301V5.29102M9.68262 5.29102L9.68945 5.28516M9.68262 5.29102L9.64062 5.33301M9.68262 5.29102L9.68359 5.25781M9.68262 5.29102L9.64062 5.33301M9.68262 5.29102L9.68945 5.28516M9.68262 5.29102V5.28516M9.68945 5.28516H9.68262M9.68945 5.28516H9.68262M9.68262 5.28516L9.68359 5.25781M9.68359 5.25781L9.82129 5.12305M9.68359 5.25781L9.60742 5.33301M9.82129 5.12305L10.1104 5.16113H10.1172L9.82227 5.12305L9.82715 5.11816M9.82129 5.12305L9.79785 5.14551M9.82129 5.12305L9.69922 5.10742M9.82129 5.12305L9.82617 5.11719M9.82129 5.12305L9.69922 5.10742M9.82715 5.11816L9.85645 5.12109M9.82715 5.11816L9.85645 5.12109M9.82715 5.11816L9.84277 5.10254L9.7373 5.10547M9.64062 5.33301H9.60742M9.60742 5.33301L9.79785 5.14551M9.60742 5.33301H8.83008L9.05859 5.1084M9.05859 5.1084L9.79785 5.14551M9.05859 5.1084L9.29297 5.12012M9.79785 5.14551L9.68555 5.13965M8.9043 5.25879L8.8291 5.33301H8.7959M8.9043 5.25879L8.87207 5.25781M8.9043 5.25879L8.87207 5.25781M8.9043 5.25879L9.03711 5.12891M8.7959 5.33301L8.87207 5.25781M8.7959 5.33301L8.87207 5.25781M8.7959 5.33301H8.33887M8.87207 5.25781L8.33887 5.24023M8.87207 5.25781L9.00293 5.12988M8.87207 5.25781L9.1123 5.02344M8.87207 5.25781L7.01758 5.19727M8.33887 5.33301V5.24023M8.33887 5.33301V5.24023M8.33887 5.33301H8.30273M8.33887 5.24023L8.30273 5.23926M8.30273 5.33301V5.23926M8.30273 5.33301V5.23926M8.30273 5.33301H7.11035M8.30273 5.23926L7.01758 5.19727M7.11035 5.33301L7.01758 5.19727M7.11035 5.33301L7.01758 5.19727M7.11035 5.33301H5.69727M5.69727 5.15332V5.33301M5.69727 5.15332L5.66113 5.15234M5.69727 5.15332V4.94141M5.69727 5.15332L5.66113 5.15234M5.69727 5.33301H5.66113M5.69727 5.33301V4.93262M5.66113 5.33301V5.15234M5.66113 5.33301V4.93945M5.66113 5.33301H5.13281M5.66113 5.15234V4.93945M5.66113 4.93945L5.63086 4.93848M5.66113 4.93945L5.69727 4.94141M5.66113 4.93945L5.69727 4.94141M5.66113 4.93945V4.93555M5.66113 4.93945L5.63086 4.93848M5.66113 4.93945V4.93555M5.13281 5.33301L5.05859 5.25977M5.13281 5.33301H4.39258M5.13281 5.33301L5.05859 5.25977M5.05859 5.25977L4.3418 5.2832M5.05859 5.25977L4.3418 5.2832M4.3418 5.2832L4.39258 5.33301M4.3418 5.2832L4.39258 5.33301M4.39258 5.33301H4.35938M4.35938 5.33301L4.31641 5.29102M4.35938 5.33301H4.31738M4.35938 5.33301L4.31641 5.29102M4.31641 5.29102L4.31738 5.33301M4.31641 5.29102L4.31738 5.33301M4.31738 5.33301H3.9541L3.97852 5.14844M3.97852 5.14844L4.14746 5.12695M3.97852 5.14844L4.14746 5.12695M3.97852 5.14844L3.97949 5.14355L4.3125 5.09961M4.14746 5.12695V5.12598M4.14746 5.12695V5.12598M4.14746 5.12598L4.29199 5.10742M4.14746 5.12598L4.29199 5.10742M4.29199 5.10742H4.3125M4.29199 5.10742H4.3125M4.3125 5.10742V5.09961M4.3125 5.10742V5.09961M4.3125 5.09961L4.8252 5.03223M4.8252 5.03223L4.83008 5.03613M4.8252 5.03223L4.83008 5.03613M4.8252 5.03223L5.39355 4.95801L5.49023 4.9502L4.83008 5.03613M4.83008 5.03613L5.5 4.94922L5.63086 4.93848M5.63086 4.93848L5.66113 4.93555M3.94727 5.33301H3.95312L3.95703 5.2959M3.94727 5.33301L3.95215 5.2959M3.94727 5.33301H3.94629M3.94727 5.33301L3.95215 5.2959M3.95215 5.2959H3.95703M3.95215 5.2959H3.95117M3.95703 5.2959L3.97754 5.14941M3.95703 5.2959H3.95117M3.94629 5.33301L3.95117 5.2959M3.94629 5.33301H3.74414M3.94629 5.33301L3.95117 5.2959M3.95117 5.2959L3.74414 5.30273M3.95117 5.2959L3.9707 5.15723M3.95117 5.2959L3.74414 5.30273M3.95117 5.2959L3.97168 5.14941M3.74414 5.33301V5.30273M3.74414 5.33301V5.30273M3.74414 5.33301H3.58984M3.97168 5.14941L3.88184 5.16113M3.97168 5.14941L3.97266 5.14453M3.97168 5.14941H3.97754M3.97168 5.14941L3.88184 5.16113M3.97168 5.14941L3.9707 5.15723M3.97168 5.14941H3.97754M3.97168 5.14941L3.97266 5.14453M3.88184 5.16113L3.9707 5.15723M3.88184 5.16113L3.9707 5.15723M3.58984 5.33301L3.58789 5.30859M3.58984 5.33301H3.35645M3.58984 5.33301L3.58789 5.30859M3.58789 5.30859L3.35352 5.31543M3.58789 5.30859L3.35352 5.31543M3.35352 5.31543L3.35645 5.33301M3.35352 5.31543L3.35645 5.33301M3.35645 5.33301H3.35059M3.35059 5.33301L3.34766 5.31641M3.35059 5.33301H2.84766M3.35059 5.33301L3.34766 5.31641M3.34766 5.31641L2.84766 5.33301M3.34766 5.31641L2.84766 5.33301M2.84766 5.33301H2.58008M2.58008 5.33301L3.33594 5.2334M2.58008 5.33301L3.33594 5.2334M2.58008 5.33301H2.5752M3.33594 5.2334V5.23242M3.33594 5.2334V5.23242M3.33594 5.23242L3.5791 5.20117M3.33594 5.23242L2.5752 5.33301M3.33594 5.23242L2.5752 5.33301M3.33594 5.23242V5.22852M3.33594 5.23242L3.5791 5.20117M3.33594 5.23242V5.22852M3.5791 5.20117V5.19629M3.5791 5.20117V5.19629M3.5791 5.19629L3.97266 5.14453M3.5791 5.19629L3.33594 5.22852M3.97266 5.14453L3.97852 5.14355L3.97754 5.14941M2.5752 5.33301H2.54199L3.33594 5.22852M3.33496 5.22559L2.52148 5.33301H2.31055M3.33496 5.22559L3.33008 5.18945M3.33496 5.22559L3.97266 5.1416M3.33496 5.22559L3.32227 5.12891M2.31055 5.33301L2.17676 5.24609M2.31055 5.33301L2.17676 5.24609M2.17676 5.24609L3.33008 5.18945M2.17676 5.24609L3.33008 5.18945M3.33008 5.18945L3.32227 5.12891M3.32227 5.12891L3.32812 5.12793M9.00293 5.12988L9.03711 5.12891M9.00293 5.12988L9.03711 5.12891M9.00293 5.12988L9.02637 5.10742M9.03711 5.12891L9.05762 5.1084M3.78613 5.09082L3.97949 5.09668M3.78613 5.09082L3.57227 5.1084M3.78613 5.09082L3.97852 5.09668M3.78613 5.09082L3.98145 5.07422M3.97949 5.09668L3.97266 5.1416M3.97949 5.09668L3.97266 5.1416M3.97949 5.09668H3.98438M3.97266 5.1416H3.97852L3.98438 5.09668M3.32812 5.12793L3.33594 5.18848M3.32812 5.12793L3.33594 5.18848M3.32812 5.12793L3.57227 5.1084M3.33594 5.18848L3.57715 5.17676M3.33594 5.18848L3.57715 5.17676M3.57715 5.17676L3.57227 5.1084M3.57715 5.17676L3.57227 5.1084M5.69727 4.94141V4.93262M9.68555 5.13965L9.68652 5.10742M9.68555 5.13965L9.29297 5.12012M9.68555 5.13965L9.68652 5.10742M9.68652 5.10742H9.69922M9.68652 5.10742L9.29297 5.12012M9.69922 5.10742L9.29297 5.12012M3.98438 5.09668H3.97852M3.98438 5.09668L3.9873 5.07422H3.98145M9.05762 5.1084L9.02637 5.10742M9.05762 5.1084L9.13477 5.0332L9.10645 5.0293M9.05762 5.1084L9.02637 5.10742M9.02637 5.10742L9.10645 5.0293M9.7373 5.10547L9.82617 5.11719M9.7373 5.10547L9.82617 5.11719M9.7373 5.10547L9.8418 5.10254L9.82617 5.11719M9.10645 5.0293L9.13574 5.03223L9.14062 5.02734M9.10645 5.0293L9.1123 5.02344M3.97852 5.09668L3.98145 5.07422M3.97852 5.09668L3.98145 5.07422M9.14062 5.02734L9.1123 5.02344M9.14062 5.02734L9.16406 5.00488L9.13379 5.00293M9.14062 5.02734L9.1123 5.02344M9.1123 5.02344L9.13379 5.00293M9.1123 5.02344L9.13379 5.00293M9.1123 5.02344L8.63574 4.96094L9.13379 5.00293M9.1123 5.02344L8.63477 4.96094L6.99512 4.8252L5.69727 4.93262M5.66113 4.93555L5.69727 4.93262M0.983398 5.54102L0.790039 5.56641L0.75293 5.56738L0.983398 5.53711C0.983381 5.53841 0.983416 5.53971 0.983398 5.54102ZM0.983398 5.56348L0.796875 5.56641L0.983398 5.54199C0.983305 5.54914 0.983489 5.5563 0.983398 5.56348ZM13.1895 5.56543L13.0156 5.5625C13.0155 5.55598 13.0157 5.54947 13.0156 5.54297L13.1895 5.56543ZM5.35059 4.96094L3.97949 5.1416L3.98926 5.07422L5.35059 4.96094ZM8.51855 4.95117H8.50879L8.40137 4.93652H8.4043L8.51855 4.95117Z" fill="#818283" stroke="#818283" stroke-width="33.3333"/>
                                  </svg>
                                  <span>Immediate</span>
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
                                    activeCategoryId
                                  )
                                }
                                className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}>
                                <svg width="15" height="17" viewBox="0 0 15 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.83398 7.49486C2.83398 5.29494 2.83398 4.19498 3.51741 3.51155C4.20084 2.82813 5.3008 2.82812 7.50072 2.82812H9.83408C12.034 2.82812 13.1339 2.82813 13.8174 3.51155C14.5008 4.19498 14.5008 5.29494 14.5008 7.49486V11.3838C14.5008 13.5837 14.5008 14.6836 13.8174 15.3671C13.1339 16.0505 12.034 16.0505 9.83408 16.0505H7.50072C5.3008 16.0505 4.20084 16.0505 3.51741 15.3671C2.83398 14.6836 2.83398 13.5837 2.83398 11.3838V7.49486Z" stroke="#818283"/>
                                <path d="M2.83337 13.7224C1.54469 13.7224 0.5 12.6778 0.5 11.389V6.72231C0.5 3.78908 0.5 2.32248 1.41123 1.41123C2.32248 0.5 3.78908 0.5 6.72231 0.5H9.83346C11.1222 0.5 12.1668 1.54469 12.1668 2.83337" stroke="#818283"/>
                                </svg>
                              </button>
                              <button 
                                onClick={() =>
                                  handleCategoryAction(
                                    "edit-template",
                                    activeCategoryId
                                  )
                                }
                                className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}>
                                <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0296 1.1856C13.0474 1.1856 12.2512 1.98181 12.2512 2.96399C12.2512 3.94617 13.0474 4.74239 14.0296 4.74239C15.0117 4.74239 15.808 3.94617 15.808 2.96399C15.808 1.98181 15.0117 1.1856 14.0296 1.1856ZM11.0656 2.96399C11.0656 1.32702 12.3926 0 14.0296 0C15.6666 0 16.9936 1.32702 16.9936 2.96399C16.9936 4.60096 15.6666 5.92798 14.0296 5.92798C12.3926 5.92798 11.0656 4.60096 11.0656 2.96399ZM6.87139 1.5808H9.28717C9.61456 1.5808 9.87997 1.8462 9.87997 2.17359C9.87997 2.50098 9.61456 2.76639 9.28717 2.76639H6.91598C5.40883 2.76639 4.33811 2.76765 3.52585 2.87686C2.73063 2.98377 2.27248 3.18427 1.93798 3.51877C1.60347 3.85328 1.40297 4.31143 1.29606 5.10664C1.18685 5.9189 1.1856 6.98965 1.1856 8.49678C1.1856 10.0039 1.18685 11.0747 1.29606 11.8869C1.40297 12.6821 1.60347 13.1403 1.93798 13.4748C2.27248 13.8093 2.73063 14.0098 3.52585 14.1167C4.33811 14.2259 5.40883 14.2272 6.91598 14.2272H10.0776C11.5847 14.2272 12.6555 14.2259 13.4677 14.1167C14.2629 14.0098 14.7211 13.8093 15.0556 13.4748C15.3901 13.1403 15.5906 12.6821 15.6975 11.8869C15.8067 11.0747 15.808 10.0039 15.808 8.49678C15.808 8.20204 15.8101 7.98665 15.8119 7.80154C15.8148 7.50182 15.817 7.2813 15.8081 6.93108C15.7998 6.60376 16.0584 6.3317 16.3857 6.32337C16.713 6.31506 16.985 6.57363 16.9934 6.90092C17.0027 7.26929 17.0003 7.52079 16.9973 7.83853C16.9955 8.02349 16.9936 8.23081 16.9936 8.49678V8.54135C16.9936 9.99395 16.9936 11.1445 16.8725 12.0449C16.7479 12.9715 16.4854 13.7216 15.894 14.3132C15.3024 14.9046 14.5523 15.1671 13.6257 15.2917C12.7252 15.4128 11.5747 15.4128 10.1221 15.4128H6.87139C5.41883 15.4128 4.2683 15.4128 3.36787 15.2917C2.44119 15.1671 1.69114 14.9046 1.09963 14.3132C0.508131 13.7216 0.245624 12.9715 0.121042 12.0449C-2.34026e-05 11.1445 -1.54497e-05 9.99395 3.5821e-07 8.54135V8.4522C-1.54497e-05 6.9996 -2.34026e-05 5.84909 0.121042 4.94866C0.245624 4.02198 0.508131 3.27194 1.09963 2.68043C1.69114 2.08893 2.44119 1.82642 3.36787 1.70183C4.2683 1.58077 5.41882 1.58078 6.87139 1.5808ZM3.29899 4.95568C3.50858 4.70417 3.88238 4.67019 4.13389 4.87978L5.84027 6.30177C6.57768 6.9163 7.08963 7.34153 7.5219 7.61951C7.94026 7.88864 8.22401 7.97899 8.49678 7.97899C8.76954 7.97899 9.05329 7.88864 9.47165 7.61951C9.90392 7.34153 10.4159 6.9163 11.1533 6.30177C11.4048 6.09218 11.7786 6.12616 11.9882 6.37767C12.1977 6.62918 12.1638 7.003 11.9122 7.21254L11.8826 7.23736C11.182 7.82114 10.6142 8.29436 10.113 8.61668C9.59092 8.95244 9.08254 9.16458 8.49678 9.16458C7.91101 9.16458 7.40263 8.95244 6.88055 8.61668C6.3794 8.29436 5.81157 7.82114 5.111 7.23736L3.37489 5.79059C3.12338 5.58099 3.0894 5.2072 3.29899 4.95568Z" fill="#818283"/>
                                </svg>

                              </button>

                              {categories.find(c => c.id === activeCategoryId)?.status === "DRAFT" &&
                                categories.find(c => c.id === activeCategoryId)?.visibility === "PRIVATE" && (
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "publish-job",
                                        activeCategoryId
                                      )
                                    }
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}>
                              
                                    <Globe className="w-4 h-4 mr-4" />
                                    
                                  </button>
                                )}
                              {categories.find(c => c.id === activeCategoryId)?.status === "PUBLISHED" &&
                                categories.find(c => c.id === activeCategoryId)?.visibility === "PUBLIC" && (
                                  <button
                                    onClick={() =>
                                      handleCategoryAction(
                                        "unpublish-job",
                                        activeCategoryId
                                      )
                                    }
                                    className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                                    >
                                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.29448 7.49417e-07H3.36741C3.99747 -1.87855e-05 4.52287 -3.17873e-05 4.93996 0.0520352C5.3802 0.107 5.77767 0.227901 6.09707 0.524486C6.41646 0.821071 6.54668 1.19015 6.60587 1.59894C6.66197 1.98625 6.6619 2.47411 6.6619 3.05917V10.9408C6.6619 11.5259 6.66197 12.0138 6.60587 12.4011C6.54668 12.8099 6.41646 13.1789 6.09707 13.4755C5.77767 13.7721 5.3802 13.893 4.93996 13.948C4.52287 14.0001 3.99747 14 3.36741 14H3.29449C2.66443 14 2.13904 14.0001 1.72194 13.948C1.2817 13.893 0.884231 13.7721 0.564831 13.4755C0.245432 13.1789 0.115231 12.8099 0.0560379 12.4011C-3.42325e-05 12.0138 -2.02305e-05 11.5259 8.07065e-07 10.9408V3.05916C-2.02305e-05 2.47411 -3.42325e-05 1.98624 0.0560379 1.59894C0.115231 1.19015 0.245432 0.821071 0.564831 0.524486C0.884231 0.227901 1.2817 0.107 1.72194 0.0520352C2.13903 -3.17873e-05 2.66442 -1.87855e-05 3.29448 7.49417e-07ZM1.8621 1.02007C1.5385 1.06047 1.40001 1.13029 1.30862 1.21515C1.21723 1.30001 1.14205 1.42861 1.09854 1.72909C1.053 2.04363 1.05188 2.4653 1.05188 3.09302V10.907C1.05188 11.5347 1.053 11.9564 1.09854 12.2709C1.14205 12.5714 1.21723 12.7 1.30862 12.7849C1.40001 12.8697 1.5385 12.9395 1.8621 12.98C2.20083 13.0222 2.65493 13.0233 3.33095 13.0233C4.00696 13.0233 4.46107 13.0222 4.7998 12.98C5.1234 12.9395 5.2619 12.8697 5.35328 12.7849C5.44466 12.7 5.51986 12.5714 5.56336 12.2709C5.6089 11.9564 5.61002 11.5347 5.61002 10.907V3.09302C5.61002 2.4653 5.6089 2.04363 5.56336 1.72909C5.51986 1.42861 5.44466 1.30001 5.35328 1.21515C5.2619 1.13029 5.1234 1.06047 4.7998 1.02007C4.46107 0.977787 4.00696 0.976745 3.33095 0.976745C2.65493 0.976745 2.20083 0.977787 1.8621 1.02007ZM11.7095 7.49417e-07H11.7824C12.4125 -1.87855e-05 12.9379 -3.17873e-05 13.355 0.0520352C13.7952 0.107 14.1927 0.227901 14.5121 0.524486C14.8315 0.821071 14.9617 1.19015 15.0209 1.59894C15.077 1.98625 15.0769 2.47411 15.0769 3.05917V10.9408C15.0769 11.5259 15.077 12.0138 15.0209 12.4011C14.9617 12.8099 14.8315 13.1789 14.5121 13.4755C14.1927 13.7721 13.7952 13.893 13.355 13.948C12.9379 14.0001 12.4125 14 11.7824 14H11.7095C11.0794 14 10.5541 14.0001 10.137 13.948C9.6967 13.893 9.29924 13.7721 8.97989 13.4755C8.66047 13.1789 8.53024 12.8099 8.47106 12.4011C8.41496 12.0138 8.41503 11.5259 8.41503 10.9408V3.05917C8.41503 2.47411 8.41496 1.98625 8.47106 1.59894C8.53024 1.19015 8.66047 0.821071 8.97989 0.524486C9.29924 0.227901 9.6967 0.107 10.137 0.0520352C10.5541 -3.17873e-05 11.0794 -1.87855e-05 11.7095 7.49417e-07ZM10.2771 1.02007C9.9535 1.06047 9.81501 1.13029 9.72363 1.21515C9.63226 1.30001 9.55709 1.42861 9.51354 1.72909C9.46803 2.04363 9.4669 2.4653 9.4669 3.09302V10.907C9.4669 11.5347 9.46803 11.9564 9.51354 12.2709C9.55709 12.5714 9.63226 12.7 9.72363 12.7849C9.81501 12.8697 9.9535 12.9395 10.2771 12.98C10.6158 13.0222 11.07 13.0233 11.746 13.0233C12.422 13.0233 12.8761 13.0222 13.2148 12.98C13.5384 12.9395 13.6769 12.8697 13.7683 12.7849C13.8597 12.7 13.9349 12.5714 13.9784 12.2709C14.0239 11.9564 14.025 11.5347 14.025 10.907V3.09302C14.025 2.4653 14.0239 2.04363 13.9784 1.72909C13.9349 1.42861 13.8597 1.30001 13.7683 1.21515C13.6769 1.13029 13.5384 1.06047 13.2148 1.02007C12.8761 0.977787 12.422 0.976745 11.746 0.976745C11.07 0.976745 10.6158 0.977787 10.2771 1.02007Z" fill="#818283"/>
                                    </svg>

                                  </button>
                                )}
                              <button 
                                onClick={() =>
                                  handleCategoryAction(
                                    "edit-job",
                                    activeCategoryId
                                  )
                                }
                                className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}>
                              <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.948 1.14453H12.3757C12.7553 1.14453 13.0632 1.45234 13.0632 1.83203C13.0632 2.21172 12.7553 2.51953 12.3757 2.51953H11.0007C8.82062 2.51953 7.25475 2.52099 6.0631 2.6812C4.89122 2.83876 4.18473 3.13841 3.66255 3.6606C3.14036 4.18278 2.84071 4.88927 2.68316 6.06115C2.52294 7.25279 2.52148 8.81866 2.52148 10.9987C2.52148 13.1787 2.52294 14.7446 2.68316 15.9362C2.84071 17.1081 3.14036 17.8146 3.66255 18.3368C4.18473 18.859 4.89122 19.1587 6.0631 19.3162C7.25475 19.4764 8.82062 19.4779 11.0007 19.4779C13.1807 19.4779 14.7465 19.4764 15.9382 19.3162C17.1101 19.1587 17.8165 18.859 18.3388 18.3368C18.861 17.8146 19.1606 17.1081 19.3181 15.9362C19.4784 14.7446 19.4798 13.1787 19.4798 10.9987V9.6237C19.4798 9.24401 19.7876 8.9362 20.1673 8.9362C20.547 8.9362 20.8548 9.24401 20.8548 9.6237V11.0513C20.8548 13.1673 20.8548 14.8256 20.6809 16.1195C20.5028 17.4438 20.1313 18.4889 19.3111 19.3091C18.4908 20.1293 17.4457 20.5009 16.1214 20.679C14.8276 20.8529 13.1693 20.8529 11.0533 20.8529H10.948C8.83203 20.8529 7.17374 20.8529 5.87989 20.679C4.55554 20.5009 3.51052 20.1293 2.69028 19.3091C1.87004 18.4889 1.49848 17.4438 1.32042 16.1195C1.14647 14.8256 1.14648 13.1673 1.14648 11.0513V10.9461C1.14648 8.83008 1.14647 7.17179 1.32042 5.87793C1.49848 4.55359 1.87004 3.50857 2.69028 2.68833C3.51052 1.86808 4.55554 1.49652 5.87989 1.31847C7.17374 1.14451 8.83203 1.14452 10.948 1.14453ZM15.3736 2.08496C16.6275 0.831058 18.6605 0.831058 19.9144 2.08496C21.1683 3.33885 21.1683 5.37181 19.9144 6.62571L13.8203 12.7198C13.48 13.0602 13.2667 13.2734 13.0289 13.459C12.7486 13.6776 12.4454 13.8649 12.1246 14.0178C11.8522 14.1476 11.5661 14.243 11.1096 14.3951L8.44706 15.2826C7.95549 15.4465 7.41355 15.3186 7.04717 14.9522C6.68079 14.5858 6.55285 14.0439 6.7167 13.5523L7.60419 10.8898C7.75638 10.4332 7.85171 10.1471 7.98152 9.87477C8.13441 9.55394 8.32179 9.25071 8.54036 8.9705C8.72593 8.73258 8.93916 8.51938 9.27952 8.17903L15.3736 2.08496ZM18.9421 3.05723C18.2252 2.3403 17.0628 2.3403 16.3459 3.05723L16.0007 3.40246C16.0215 3.49034 16.0506 3.59503 16.0911 3.7118C16.2224 4.09044 16.471 4.5891 16.9407 5.05869C17.4103 5.52828 17.9089 5.77687 18.2875 5.90824C18.4043 5.94875 18.509 5.97787 18.5969 5.99868L18.9421 5.65344C19.659 4.93652 19.659 3.77415 18.9421 3.05723ZM17.5137 7.08186C17.0408 6.87846 16.4898 6.55237 15.9683 6.03096C15.4469 5.50956 15.1209 4.95862 14.9175 4.48565L10.2834 9.11977C9.90157 9.5016 9.75179 9.65303 9.62455 9.81611C9.46743 10.0176 9.33268 10.2357 9.22278 10.4663C9.13374 10.6531 9.06527 10.8547 8.89452 11.3669L8.49862 12.5546L9.4447 13.5007L10.6324 13.1048C11.1447 12.9341 11.3462 12.8656 11.5331 12.7766C11.7637 12.6667 11.9818 12.5319 12.1832 12.3748C12.3463 12.2476 12.4978 12.0978 12.8795 11.716L17.5137 7.08186Z" fill="#4B5563"/>
                                </svg>
                              </button>

                              <button 
                              onClick={() =>
                                handleCategoryAction(
                                  "archive",
                                  activeCategoryId
                                )
                              }
                              className={`w-[32px] h-[32px] rounded-full border-[0.5px] border-[#4B5563] flex items-center justify-center hover:bg-gray-50 transition-colors`}
                              >
                                <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.62631 2.0625C3.63994 2.06251 3.65362 2.06251 3.66733 2.06251L18.3751 2.0625C18.7718 2.06246 19.1355 2.06242 19.4314 2.1022C19.7573 2.14601 20.1017 2.24909 20.3849 2.53236C20.6683 2.81563 20.7713 3.16005 20.8151 3.4859C20.8549 3.78181 20.8549 4.14558 20.8548 4.54232V4.62436C20.8549 5.02111 20.8549 5.38487 20.8151 5.68078C20.7713 6.00664 20.6683 6.35106 20.3849 6.63432C20.1157 6.90361 19.7911 7.01006 19.4798 7.05755V11.9684C19.4798 13.653 19.4798 14.9873 19.3395 16.0316C19.1949 17.1064 18.8905 17.9762 18.2046 18.6622C17.5185 19.3482 16.6487 19.6526 15.5739 19.7972C14.5296 19.9375 13.1953 19.9375 11.5107 19.9375H10.4906C8.806 19.9375 7.47167 19.9375 6.42739 19.7972C5.35267 19.6526 4.4828 19.3482 3.7968 18.6622C3.1108 17.9762 2.80636 17.1064 2.66187 16.0316C2.52147 14.9873 2.52148 13.653 2.5215 11.9684V7.05755C2.21017 7.01006 1.88563 6.90361 1.61634 6.63432C1.33307 6.35106 1.23 6.00664 1.18619 5.68078C1.1464 5.38487 1.14644 5.02111 1.14649 4.62437C1.1465 4.61073 1.1465 4.59705 1.1465 4.58335C1.1465 4.56963 1.1465 4.55596 1.14649 4.54232C1.14644 4.14557 1.1464 3.78181 1.18619 3.4859C1.23 3.16005 1.33307 2.81563 1.61634 2.53236C1.89961 2.24909 2.24403 2.14601 2.56989 2.1022C2.8658 2.06242 3.22956 2.06246 3.62631 2.0625ZM3.8965 7.10418V11.9167C3.8965 13.6646 3.89795 14.9064 4.02461 15.8484C4.1486 16.7706 4.38113 17.302 4.76907 17.6899C5.15701 18.0779 5.68836 18.3104 6.61061 18.4344C7.55263 18.561 8.79441 18.5625 10.5423 18.5625H11.459C13.2069 18.5625 14.4487 18.561 15.3908 18.4344C16.3129 18.3104 16.8443 18.0779 17.2322 17.6899C17.6202 17.302 17.8527 16.7706 17.9767 15.8484C18.1034 14.9064 18.1048 13.6646 18.1048 11.9167V7.10418H3.8965ZM2.58862 3.50464L2.59086 3.50338C2.59263 3.50246 2.59567 3.50097 2.60029 3.49908C2.62026 3.49086 2.66459 3.47684 2.7531 3.46494C2.94626 3.43897 3.21577 3.43751 3.66733 3.43751H18.334C18.7855 3.43751 19.055 3.43897 19.2482 3.46494C19.3367 3.47684 19.3811 3.49086 19.401 3.49908C19.4057 3.50097 19.4087 3.50246 19.4104 3.50338L19.4127 3.50463L19.4139 3.50688C19.4149 3.50865 19.4164 3.51169 19.4182 3.51631C19.4265 3.53627 19.4405 3.5806 19.4524 3.66912C19.4784 3.86228 19.4798 4.13179 19.4798 4.58335C19.4798 5.0349 19.4784 5.3044 19.4524 5.49757C19.4405 5.58608 19.4265 5.63041 19.4182 5.65037C19.4164 5.655 19.4149 5.65804 19.4139 5.65981L19.4127 5.66205L19.4104 5.66331C19.4087 5.66423 19.4057 5.66571 19.401 5.66762C19.3811 5.67583 19.3367 5.68984 19.2482 5.70174C19.055 5.72771 18.7855 5.72918 18.334 5.72918H3.66733C3.21577 5.72918 2.94626 5.72771 2.7531 5.70174C2.66459 5.68984 2.62026 5.67583 2.60029 5.66762C2.59567 5.66571 2.59263 5.66423 2.59086 5.66331L2.58862 5.66204L2.58737 5.65981C2.58644 5.65804 2.58496 5.655 2.58306 5.65037C2.57485 5.63041 2.56082 5.58608 2.54892 5.49757C2.52295 5.3044 2.5215 5.0349 2.5215 4.58335C2.5215 4.13179 2.52295 3.86228 2.54892 3.66912C2.56082 3.5806 2.57485 3.53627 2.58306 3.51631C2.58496 3.51169 2.58644 3.50865 2.58737 3.50688L2.58862 3.50464ZM2.58862 5.66204C2.58826 5.66167 2.58838 5.66174 2.58862 5.66204V5.66204ZM9.60567 8.93751H12.3956C12.592 8.93749 12.7725 8.93748 12.924 8.94782C13.0869 8.95893 13.2659 8.98424 13.4479 9.05962C13.8409 9.2224 14.1533 9.53471 14.3161 9.92778C14.3914 10.1097 14.4167 10.2889 14.4279 10.4517C14.4382 10.6032 14.4382 10.7837 14.4382 10.98V11.02C14.4382 11.2163 14.4382 11.3968 14.4279 11.5484C14.4167 11.7112 14.3914 11.8903 14.3161 12.0722C14.1533 12.4653 13.8409 12.7776 13.4479 12.9404C13.2659 13.0158 13.0869 13.0411 12.924 13.0522C12.7725 13.0625 12.592 13.0625 12.3956 13.0625H9.60567C9.40932 13.0625 9.22883 13.0625 9.0773 13.0522C8.91447 13.0411 8.7354 13.0158 8.55344 12.9404C8.16037 12.7776 7.84808 12.4653 7.68527 12.0722C7.60989 11.8903 7.58459 11.7112 7.57348 11.5484C7.56314 11.3968 7.56314 11.2163 7.56316 11.02V10.98C7.56314 10.7837 7.56314 10.6032 7.57348 10.4517C7.58459 10.2889 7.60989 10.1097 7.68527 9.92778C7.84808 9.53471 8.16037 9.2224 8.55344 9.05962C8.7354 8.98424 8.91447 8.95893 9.0773 8.94782C9.22883 8.93748 9.40932 8.93749 9.60567 8.93751ZM9.07686 10.3311C9.02293 10.3543 8.97995 10.3973 8.95677 10.4512C8.95506 10.458 8.94947 10.484 8.94529 10.5452C8.93853 10.6442 8.93816 10.7771 8.93816 11C8.93816 11.2229 8.93853 11.3558 8.94529 11.4548C8.94947 11.516 8.95506 11.542 8.95677 11.5488C8.97995 11.6027 9.02293 11.6457 9.07686 11.6689C9.0836 11.6706 9.10963 11.6762 9.1709 11.6804C9.2699 11.6871 9.40272 11.6875 9.62565 11.6875H12.3757C12.5986 11.6875 12.7314 11.6871 12.8304 11.6804C12.8916 11.6762 12.9177 11.6706 12.9245 11.6689C12.9784 11.6457 13.0214 11.6027 13.0445 11.5488C13.0463 11.542 13.0519 11.516 13.056 11.4548C13.0628 11.3558 13.0632 11.2229 13.0632 11C13.0632 10.7771 13.0628 10.6442 13.056 10.5452C13.0519 10.484 13.0463 10.458 13.0445 10.4512C13.0214 10.3973 12.9784 10.3543 12.9245 10.3311C12.9177 10.3294 12.8916 10.3238 12.8304 10.3197C12.7314 10.3129 12.5986 10.3125 12.3757 10.3125H9.62565C9.40272 10.3125 9.2699 10.3129 9.1709 10.3197C9.10963 10.3238 9.08359 10.3294 9.07686 10.3311Z" fill="#4B5563"/>
                                </svg>

                              </button>
                              </div>
                              <button
                                onClick={handlePipelinesClick}
                                className="px-5 py-2.5 bg-white border border-[#0F47F2] text-[#0F47F2] rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                              >
                                Show Pipelines
                              </button>

                              <button
                                onClick={() =>
                                  handleCategoryAction(
                                    "share-pipelines",
                                    activeCategoryId
                                  )
                                }
                                className="px-6 py-2.5 bg-[#1CB977] text-white rounded-lg font-medium hover:bg-[#0d3ec9] transition-colors flex items-center gap-2 shadow-md"
                              >
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.61628 1.04651C1.74932 1.04651 1.04651 1.74932 1.04651 2.61628C1.04651 3.48324 1.74932 4.18605 2.61628 4.18605C3.48324 4.18605 4.18605 3.48324 4.18605 2.61628C4.18605 1.74932 3.48324 1.04651 2.61628 1.04651ZM0 2.61628C0 1.17135 1.17135 0 2.61628 0C4.06121 0 5.23256 1.17135 5.23256 2.61628C5.23256 4.06121 4.06121 5.23256 2.61628 5.23256C1.17135 5.23256 0 4.06121 0 2.61628ZM6.27907 2.61628C6.27907 2.3273 6.51335 2.09302 6.80233 2.09302H10.3827C12.3022 2.09302 13.0321 4.59977 11.4128 5.63028L4.14909 10.2526C3.413 10.721 3.74481 11.8605 4.61729 11.8605H6.93439L6.78119 11.7072C6.57684 11.5028 6.57684 11.1716 6.78119 10.9672C6.98553 10.7629 7.31679 10.7629 7.52114 10.9672L8.56765 12.0137C8.772 12.2181 8.772 12.5493 8.56765 12.7537L7.52114 13.8002C7.31679 14.0046 6.98553 14.0046 6.78119 13.8002C6.57684 13.5959 6.57684 13.2646 6.78119 13.0603L6.93439 12.907H4.61729C2.69782 12.907 1.96787 10.4002 3.58725 9.3697L10.8509 4.74738C11.587 4.27896 11.2552 3.13953 10.3827 3.13953H6.80233C6.51335 3.13953 6.27907 2.90526 6.27907 2.61628ZM12.3837 10.814C11.5168 10.814 10.814 11.5168 10.814 12.3837C10.814 13.2507 11.5168 13.9535 12.3837 13.9535C13.2507 13.9535 13.9535 13.2507 13.9535 12.3837C13.9535 11.5168 13.2507 10.814 12.3837 10.814ZM9.76744 12.3837C9.76744 10.9388 10.9388 9.76744 12.3837 9.76744C13.8287 9.76744 15 10.9388 15 12.3837C15 13.8287 13.8287 15 12.3837 15C10.9388 15 9.76744 13.8287 9.76744 12.3837Z" fill="white"/>
                                </svg>

                                Applicant Tracking
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex w-full gap-3 h-full">
                        <div className="lg:w-[25%] sticky order-1 lg:order-1 top-16 self-start will-change-transform z-10">
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
                        <div className="lg:w-[45%] order-2 lg:order-2 ">
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
                            activeCategoryTotalCount={activeCategoryTotalCount}
                          />
                        </div>
                        {/* CandidateDetail remains in its original div with 30% width */}
                        <div className="lg:w-[30%] order-3 sticky top-16 self-start will-change-transform">
                          <CandidateDetail
                            candidate={selectedCandidate}
                            candidates={candidates}
                            onSendInvite={handleSendInvite}
                            updateCandidateEmail={updateCandidateEmail}
                            deductCredits={deductCredits}
                            onUpdateCandidate={handleUpdateCandidate}
                            enableBooleanAnalysis={
                              filters.enableBooleanAnalysis
                            } // NEW: Pass flag from state
                            jobId={filters.jobId} // NEW: For dynamic query in API
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
                              Are you sure you want to sign out? You'll need to
                              log in again to access your account.
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
                                  (cat) => cat.id === showPublishModal
                                )?.name
                              }
                              ? This action will publish job on LinkedIn, Google
                              Jobs,Times Ascent, Cutshort and others.
                            </p>
                            <span className="text-gray-400 text-sm mb-6">
                              (Note: Once published, the job will be visible on
                              both platforms within 24–48 hours.)
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
                                  (cat) => cat.id === showUnpublishModal
                                )?.name
                              }
                              ? This action cannot be undone.
                            </p>
                            <span className="text-gray-400 text-sm mb-6">
                              (Note: this action will unpublish job on published
                              over LinkedIn, Google Jobs,Times Ascent, Cutshort
                              and others within 24–48 hours.)
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
                                  (cat) => cat.id === showDeleteModal
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
                                onClick={() =>
                                  setShowRequisitionInfoModal(false)
                                }
                              >
                                <ArrowLeft className="w-8 h-8" />
                              </button>
                              <h1 className="text-lg font-semibold text-gray-800">
                                Requisition Info
                              </h1>
                            </div>
                          </div>
                          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                            Builder.io Developer
                          </h2>
                          <div className="flex space-x-8 mt-2 mb-6">
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <Briefcase className="w-4 h-4 mr-1" /> 8+ years
                            </span>
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <LocateIcon className="w-4 h-4 mr-1" /> Hybrid
                            </span>
                            <span className="flex items-center text-gray-500">
                              {" "}
                              <FileSearch className="w-4 h-4 mr-1" /> Immediate
                            </span>
                          </div>

                          {/* Role Overview */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Role Overview
                            </h3>
                            <p className="text-gray-600 text-sm">
                              The core experience builder at Builder.io, which
                              is a visual headless CMS with a drag-and-drop page
                              builder that outputs clean code. Take the core
                              Build UI in Builder to Ensure it is responsive,
                              scalable, optimized, and integrated with APIs/CMs.
                            </p>
                          </div>

                          {/* The Core Expectation */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              The Core Expectation
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Take the core Build UI in Builder to Ensure it is
                              responsive, scalable, optimized, and integrated
                              with APIs/CMs.
                            </p>
                          </div>

                          {/* Key Responsibilities Explained */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                              Key Responsibilities Explained
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Develop reusable components
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Why? Maintains quality & consistency
                                      across the website pages built with
                                      Builder.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Integrate with CMS
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Handle content queries, dynamic data, etc.
                                      via APIs.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Work with Design teams
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Translate Figma designs exactly into UI
                                      using Builder.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Troubleshoot integrations
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Fix data binding, CI/CD, integrations
                                      issues.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                  <div>
                                    <h4 className="font-medium text-gray-600 mb-1">
                                      Optimize performance
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      Improve load speeds, responsive/lazy
                                      images, etc.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Required Technical Skills & Purpose */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                              Required Technical Skills & Purpose
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Builder.io
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Visual frontend code overlays
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Visual HTML/CSS
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Of pages
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  CSS (including Flexbox, Grid)
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Styling, responsiveness, animations
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  JavaScript
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Interactive components
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  React / component logic
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Used via Builder integrations into frontend
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  API Integration
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Fetch data dynamically (REST/GraphQL)
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  SEO Best Practices
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Optimize for search, alt texts, structured
                                  data
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Performance Optimization
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Lazy loading, minification, caching
                                </p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-600 mb-1">
                                  Communication / Collaboration
                                </h4>
                                <p className="text-sm text-gray-400">
                                  Working with design/product teams
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
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
