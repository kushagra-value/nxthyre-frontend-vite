import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import useDebounce from "./hooks/useDebounce";
import { authService } from "./services/authService";
import { creditService } from "./services/creditService";
import { jobPostService } from "./services/jobPostService";
import {
  candidateService,
  CandidateListItem,
} from "./services/candidateService";
import Header from "./components/Header";
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
import SharePipelinesLoader from "./components/SharePipelinesLoader";
import SharePipelinesModal from "./components/SharePipelinesModal";
import ShareableProfile from "./components/ShareableProfile";
import PipelineSharePage from "./components/PipelineSharePage";
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
} from "lucide-react";
import { showToast } from "./utils/toast";

interface Category {
  id: number;
  name: string;
  count: number;
  status: "DRAFT" | "PUBLISHED";
  visibility: "PRIVATE" | "PUBLIC";
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
  location: string;
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
}

function MainApp() {
  const navigate = useNavigate();
  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    signOut,
    isOnboarded,
    loading: authLoading,
  } = useAuth();

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
  const [showUnpublishModal, setShowUnpublishModal] = useState<number | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<number | null>(null);
  const [showShareLoader, setShowShareLoader] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
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
    location: "",
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
  });

  useEffect(() => {
    setIsSearchMode(debouncedSearchQuery.trim() !== "");
  }, [debouncedSearchQuery]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const jobs = await jobPostService.getJobs();
      const mappedCategories: Category[] = jobs.map((job) => ({
        id: job.id,
        name: job.title,
        count: job.total_candidates || 0,
        status: job.status,
        visibility: job.visibility,
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0) {
        setActiveCategoryId(mappedCategories[0].id);
        await fetchJobDetailsAndSetFilters(mappedCategories[0].id);
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
        location: job.location || "",
        locations: job.location
          ? [job.location.split(",")[0]?.trim()].filter(Boolean)
          : [],
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
        let response;
        if (debouncedSearchQuery.trim() !== "") {
          const candidates = await candidateService.universalSearch(
            debouncedSearchQuery,
            controller.signal
          );
          setCandidates(candidates);
          setTotalCount(candidates.length);
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
            location: "",
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
        } else {
          const filterParams: any = {
            page,
            page_size: 20,
            job_id: appliedFilters.jobId,
            tab: appliedFilters.application_type,
            sort_by: sortBy,
          };

          const isValidNumber = (value: string) => /^\d+$/.test(value);

          if (appliedFilters.keywords) {
            filterParams.q = appliedFilters.keywords
              .split(",")
              .map((k: string) => k.trim())
              .filter((k: string) => k);
          }
          if (
            appliedFilters.minTotalExp &&
            isValidNumber(appliedFilters.minTotalExp)
          ) {
            filterParams.experience_min = appliedFilters.minTotalExp;
          }
          if (
            appliedFilters.maxTotalExp &&
            isValidNumber(appliedFilters.maxTotalExp)
          ) {
            filterParams.experience_max = appliedFilters.maxTotalExp;
          }
          if (
            appliedFilters.minExperience &&
            isValidNumber(appliedFilters.minExperience)
          ) {
            filterParams.exp_in_current_company_min =
              appliedFilters.minExperience;
          }
          if (appliedFilters.topTierUniversities)
            filterParams.is_top_tier_college =
              appliedFilters.topTierUniversities;
          if (appliedFilters.hasCertification)
            filterParams.has_certification = appliedFilters.hasCertification;
          if (appliedFilters.country)
            filterParams.country = appliedFilters.country;
          if (appliedFilters.locations && appliedFilters.locations.length > 0)
            filterParams.locations = appliedFilters.locations;
          if (appliedFilters.companies)
            filterParams.companies = appliedFilters.companies
              .split(",")
              .map((c: string) => c.trim());
          if (appliedFilters.industries)
            filterParams.industries = appliedFilters.industries
              .split(",")
              .map((i: string) => i.trim());
          if (
            appliedFilters.minSalary &&
            isValidNumber(appliedFilters.minSalary)
          )
            filterParams.salary_min = appliedFilters.minSalary;
          if (
            appliedFilters.maxSalary &&
            isValidNumber(appliedFilters.maxSalary)
          )
            filterParams.salary_max = appliedFilters.maxSalary;
          if (appliedFilters.colleges)
            filterParams.colleges = appliedFilters.colleges
              .split(",")
              .map((c: string) => c.trim());
          if (appliedFilters.showFemaleCandidates)
            filterParams.is_female_only = true;
          if (appliedFilters.recentlyPromoted)
            filterParams.is_recently_promoted = true;
          if (appliedFilters.backgroundVerified)
            filterParams.is_background_verified = true;
          if (appliedFilters.hasLinkedIn) filterParams.has_linkedin = true;
          if (appliedFilters.hasTwitter) filterParams.has_twitter = true;
          if (appliedFilters.hasPortfolio) filterParams.has_portfolio = true;
          if (appliedFilters.computerScienceGraduates)
            filterParams.is_cs_graduate = true;
          if (appliedFilters.hasResearchPaper)
            filterParams.has_research_paper = true;
          if (appliedFilters.hasBehance) filterParams.has_behance = true;
          if (appliedFilters.is_prevetted) filterParams.is_prevetted = true;
          if (appliedFilters.is_active) filterParams.is_active = true;
          if (appliedFilters.noticePeriod) {
            const noticePeriodOptions = [
              "Immediate",
              "15 days",
              "30 days",
              "45 days",
              "60 days",
              "90 days",
            ] as const;
            type NoticePeriod = (typeof noticePeriodOptions)[number];
            const days: Record<NoticePeriod, number> = {
              Immediate: 0,
              "15 days": 15,
              "30 days": 30,
              "45 days": 45,
              "60 days": 60,
              "90 days": 90,
            };
            if (
              noticePeriodOptions.includes(
                appliedFilters.noticePeriod as NoticePeriod
              )
            ) {
              filterParams.notice_period_max_days =
                days[appliedFilters.noticePeriod as NoticePeriod];
            } else {
              console.warn(
                "Invalid notice period:",
                appliedFilters.noticePeriod
              );
            }
          }

          console.log("Fetching candidates with params:", filterParams);
          if (isAuthenticated) {
            response = await candidateService.searchCandidates(filterParams);
            setCandidates(response.results);
            setTotalCount(response.count);
            if (response.results.length === 0) {
              setSelectedCandidate(null);
              showToast.error("No results found for the applied filters.");
            } else if (response.results.length > 0) {
              setSelectedCandidate(response.results[0]);
            }
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
    fetchCandidates(1, filters);
  };

  const handleCandidatesUpdate = (
    newCandidates: CandidateListItem[],
    count: number
  ) => {
    setCandidates(newCandidates);
    setTotalCount(count);
    if (newCandidates.length > 0) {
      setSelectedCandidate(newCandidates[0]);
    } else {
      setSelectedCandidate(null);
    }
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
  }, [
    activeTab,
    sortBy,
    activeCategoryId,
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
        email: userStatus.email || "Unknown@user.com",
        role:
          userStatus.roles?.length > 0
            ? userStatus.roles[0].name.toLowerCase()
            : "team",
        organizationId: userStatus.organization?.id?.toString(),
        workspaceIds: [],
        isVerified: firebaseUser?.emailVerified ?? true,
        createdAt:
          firebaseUser?.metadata.creationTime || new Date().toISOString(),
      };
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
        location: "",
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
      });
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
  }

  const handleDeleteJobRole = async (jobId: number) => {
    const job = categories.find((cat) => cat.id === jobId);
    if (job) {
    try {
      await jobPostService.deleteJob(jobId);
      await fetchCategories();
      showToast.success(`Successfully deleted job  ${job.name}`);
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
        await jobPostService.updateJob(jobId, { status: "DRAFT", visibility: "PRIVATE" });
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
        await jobPostService.updateJob(jobId, { status: "PUBLISHED", visibility: "PUBLIC" });
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

  const handleApplyFilters = (newFilters: any) => {
    const isFilterSelected = Object.keys(newFilters).some((key) => {
      if (
        key === "jobId" ||
        key === "application_type" ||
        key === "is_prevetted" ||
        key === "is_active" ||
        key === "sort_by"
      )
        return false;
      const value = newFilters[key as keyof Filters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "boolean") return value;
      if (typeof value === "string") return value.trim() !== "";
      return false;
    });

    if (!isFilterSelected) {
      showToast.error(
        "Please select at least one filter in the filter section."
      );
      return;
    }

    const isValidNumber = (value: string) => /^\d+$/.test(value);
    if (
      (newFilters.minTotalExp && !isValidNumber(newFilters.minTotalExp)) ||
      (newFilters.maxTotalExp && !isValidNumber(newFilters.maxTotalExp)) ||
      (newFilters.minExperience && !isValidNumber(newFilters.minExperience))
    ) {
      showToast.error(
        "No results found due to invalid input in experience fields."
      );
      setCandidates([]);
      setTotalCount(0);
      setCurrentPage(1);
      setSelectedCandidate(null);
      return;
    }

    setFilters(newFilters);
    fetchCandidates(1, newFilters);
  };

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
  const job = categories.find((cat) => cat.id === Number(currentPipelineId));

  return (
    <>
      <Routes>
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
        <Route
          path="/jobs/:id"
          element={
            <JobApplicationForm 
            />
          }
        />
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
                  />
                </>
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

                    <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3">
                      {categories.length > 0 && (
                        <div className="sticky top-[68px] z-20 will-change-transform mb-4 bg-gray-50 border-b border-gray-200">
                          <div className="max-w-full flex justify-between px-3 lg:px-4">
                            <div className="hidden md:flex items-center space-x-12">
                              {categories.slice(0, 4).map((category) => (
                                <div
                                  key={category.id}
                                  className="relative"
                                  onMouseEnter={() =>
                                    setHoveredCategory(category.id)
                                  }
                                  onMouseLeave={() => setHoveredCategory(null)}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveCategoryId(category.id);
                                      fetchJobDetailsAndSetFilters(category.id);
                                    }}
                                    className={`py-1.5 text-xs lg:text-base transition-all duration-200 ${
                                      activeCategoryId === category.id
                                        ? "border-b-2 border-blue-700 text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:border-b-2 border-gray-200"
                                    }`}
                                  >
                                    {category.name}
                                    <span
                                      className={`ml-3 px-[8px] pb-[2.8px] pt-[1.3px] rounded-full text-xs ${
                                        activeCategoryId === category.id
                                          ? "bg-blue-200 text-blue-800"
                                          : "bg-gray-200 text-gray-600"
                                      }`}
                                    >
                                      {category.count}
                                    </span>
                                  </button>
                                  {hoveredCategory === category.id && (
                                    <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                      <div className="py-1">
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "edit-job",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit Job Role
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "copy-link",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Copy className="w-4 h-4 mr-2" />
                                          Copy Job Link
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "edit-template",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Mail className="w-4 h-4 mr-2" />
                                          Edit Email Template
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "share-pipelines",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Share2 className="w-4 h-4 mr-2" />
                                          Share Pipelines
                                        </button>
                                        
                                        {category.status === "DRAFT"  && category.visibility === "PRIVATE" && (
                                          <button
                                            onClick={() =>
                                              handleCategoryAction(
                                                "publish-job",
                                                category.id
                                              )
                                            }
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                          >
                                            <Globe className="w-4 h-4 mr-2" />
                                            Publish Job
                                          </button>
                                        )}

                                        {category.status === "PUBLISHED" && category.visibility === "PUBLIC" && (
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "unpublish-job",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Pause className="w-4 h-4 mr-2" />
                                          Unpublish Job
                                        </button>
                                        )}
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "archive",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                        >
                                          <Archive className="w-4 h-4 mr-2" />
                                          Archive
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleCategoryAction(
                                              "delete",
                                              category.id
                                            )
                                          }
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Job
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-3 mb-1">
                              <div>
                                {categories.length > 0 && (
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setShowCategoryDropdown(
                                          !showCategoryDropdown
                                        )
                                      }
                                      className="px-3 py-1.5 text-xs lg:text-base font-[400] text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-300 flex items-center"
                                    >
                                      {categories.length} Pipelines
                                      <ChevronDown className="ml-18 w-4 h-4" />
                                    </button>
                                    <CategoryDropdown
                                      isOpen={showCategoryDropdown}
                                      onClose={() =>
                                        setShowCategoryDropdown(false)
                                      }
                                      onEditJobRole={handleEditJobRole}
                                      onEditTemplate={handleEditTemplate}
                                      onDeleteJob={(jobId) =>
                                        setShowDeleteModal(jobId)
                                      }
                                      onUnpublishJob={(jobId:any) =>
                                        setShowUnpublishModal(jobId)
                                      }
                                      onPublishJob={(jobId:any) =>
                                        setShowPublishModal(jobId)
                                      }
                                      onCopyJobLink={handleCopyJobLink}
                                      onSharePipelines={handleSharePipelines}
                                      onSelectCategory={(jobId) => {
                                        setActiveCategoryId(jobId);
                                        fetchJobDetailsAndSetFilters(jobId);
                                      }}
                                      activeCategoryId={activeCategoryId}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="border border-l-1 border-gray-400 min-h-10"></div>
                              <button
                                onClick={handlePipelinesClick}
                                className="px-3 py-1.5 border border-blue-700 bg-blue-50 text-blue-700 text-xs lg:text-base font-[400] rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                              >
                                Show Pipelines
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex w-full gap-3 h-full">
                        <div className="lg:w-[25%] sticky order-2 lg:order-1 top-16 self-start will-change-transform z-10">
                          <FiltersSidebar
                            filters={filters}
                            onApplyFilters={handleApplyFilters}
                            setCandidates={setCandidates}
                            candidates={candidates}
                            activeTab={activeTab}
                            isSearchMode={isSearchMode}
                          />
                        </div>
                        <div className="lg:w-[45%] order-1 lg:order-2 ">
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
                      workspaceId={
                        currentUser?.organizationId
                          ? parseInt(currentUser.organizationId)
                          : 1
                      }
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
                      workspaceId={
                        currentUser?.organizationId
                          ? parseInt(currentUser.organizationId)
                          : 1
                      }
                      jobId={editingJobId || 0}
                      onJobUpdated={handleJobCreatedOrUpdated}
                    />
                    <EditTemplateModal
                      isOpen={showEditTemplate}
                      onClose={() => setShowEditTemplate(false)}
                      templateName={editingTemplate}
                    />
                    <SharePipelinesLoader
                      isOpen={showShareLoader}
                      onComplete={handleShareLoaderComplete}
                    />
                    <SharePipelinesModal
                      isOpen={showShareModal}
                      onClose={() => setShowShareModal(false)}
                      jobRole={
                        categories.find((cat) => cat.id === activeCategoryId)
                          ?.name || ""
                      }
                    />
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
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Globe className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Confirm Publish Job
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to publish {categories.find((cat) => cat.id === showPublishModal)?.name}?
                              This action will publish job on LinkedIn, Google Jobs,Times Ascent, Cutshort and others.
                              
                            </p>
                            <span className="text-gray-400 text-sm mb-6">(Note: Once published, the job will be visible on both platforms within
            24–48 hours.)</span>
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
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Pause className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Confirm Unpublish Job
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to Unpublish {categories.find((cat) => cat.id === showUnpublishModal)?.name}? 
                              
                            </p>
                            <span className="text-gray-400 text-sm mb-6">(Note: this action will unpublish job on published over LinkedIn, Google Jobs,Times Ascent, Cutshort and others within
                              24–48 hours.)
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
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Confirm Delete Job
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to delete {categories.find((cat) => cat.id === showDeleteModal)?.name}? 
                              This action cannot be undone.
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
