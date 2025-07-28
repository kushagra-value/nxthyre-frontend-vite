import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import useDebounce from "./hooks/useDebounce"; // Import the new hook
import { authService } from "./services/authService";
import { creditService } from "./services/creditService";
import { jobPostService } from "./services/jobPostService";
import {
  candidateService,
  CandidateListItem,
} from "./services/candidateService";
import Header from "./components/Header";
import FiltersSidebar from "./components/FiltersSidebar";
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
} from "lucide-react";
import { showToast } from "./utils/toast";

interface Category {
  id: number;
  name: string;
  count: number;
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

  // State management
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

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

  // New states for search
  // const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Debounce universalSearchQuery
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const controller = new AbortController();

  const [sortBy, setSortBy] = useState<string>("");

  const [filters, setFilters] = useState({
    keywords: "",
    booleanSearch: false,
    semanticSearch: false,
    selectedCategories: [] as string[],
    minExperience: "",
    maxExperience: "",
    funInCurrentCompany: false,
    minTotalExp: "",
    maxTotalExp: "",
    city: "",
    country: "",
    location: "",
    locations: [] as string[],
    skillLevel: "",
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

  // Fetch job categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const jobs = await jobPostService.getJobs();
      const mappedCategories: Category[] = jobs.map((job) => ({
        id: job.id,
        name: job.title,
        count: job.total_candidates || 0,
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0) {
        setActiveCategoryId(mappedCategories[0].id);
        await fetchJobDetailsAndSetFilters(mappedCategories[0].id);
      } else {
        const hasSeenGuide = localStorage.getItem("hasSeenGuideModal");
        if (!hasSeenGuide) {
          setShowGuideModal(true);
          localStorage.setItem("hasSeenGuideModal", "true");
        }
      }
    } catch (error) {
      showToast.error("Failed to fetch job categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch job details and set filters
  const fetchJobDetailsAndSetFilters = async (jobId: number) => {
    try {
      const job = await jobPostService.getJob(jobId);
      setFilters((prev) => ({
        ...prev,
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
      }));
    } catch (error) {
      showToast.error("Failed to fetch job details");
      console.error("Error fetching job details:", error);
    }
  };

  // Fetch candidates based on filters, page, and search
  const fetchCandidates = useCallback(
    async (page: number = 1) => {
      setLoadingCandidates(true);
      try {
        let response;
        if (debouncedSearchQuery.trim() !== "") {
          // Universal search from Header, ignoring filters
          const candidates = await candidateService.universalSearch(
            debouncedSearchQuery,
            controller.signal
          );
          setCandidates(candidates);
          setTotalCount(candidates.length);
          if (candidates.length > 0 && !selectedCandidate) {
            setSelectedCandidate(candidates[0]);
          }

          // Reset filters to null as per task requirement (optional, see note below)
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
            skillLevel: "",
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
            jobId: "", // Preserve jobId if needed
            application_type: "",
            is_prevetted: false,
            is_active: false,
            sort_by: "",
          });
        } else {
          const filterParams: any = {
            page,
            page_size: 20,
            job_id: filters.jobId,
            application_type: filters.application_type,
            sort_by: sortBy,
          };
          if (filters.keywords) {
            filterParams.q = filters.keywords
              .split(",")
              .map((k: string) => k.trim())
              .filter((k: string) => k);
          }
          if (filters.minTotalExp)
            filterParams.experience_min = filters.minTotalExp;
          if (filters.maxTotalExp)
            filterParams.experience_max = filters.maxTotalExp;
          if (filters.minExperience)
            filterParams.exp_in_current_company_min = filters.minExperience;
          if (filters.topTierUniversities)
            filterParams.is_top_tier_college = filters.topTierUniversities;
          if (filters.hasCertification)
            filterParams.has_certification = filters.hasCertification;
          if (filters.country) filterParams.country = filters.country;
          if (filters.locations && filters.locations.length > 0)
            filterParams.locations = filters.locations;
          if (filters.companies)
            filterParams.companies = filters.companies
              .split(",")
              .map((c: string) => c.trim());
          if (filters.industries)
            filterParams.industries = filters.industries
              .split(",")
              .map((i: string) => i.trim());
          if (filters.minSalary) filterParams.salary_min = filters.minSalary;
          if (filters.maxSalary) filterParams.salary_max = filters.maxSalary;
          if (filters.colleges)
            filterParams.colleges = filters.colleges
              .split(",")
              .map((c: string) => c.trim());
          if (filters.showFemaleCandidates) filterParams.is_female_only = true;
          if (filters.recentlyPromoted)
            filterParams.is_recently_promoted = true;
          if (filters.backgroundVerified)
            filterParams.is_background_verified = true;
          if (filters.hasLinkedIn) filterParams.has_linkedin = true;
          if (filters.hasTwitter) filterParams.has_twitter = true;
          if (filters.hasPortfolio) filterParams.has_portfolio = true;
          if (filters.computerScienceGraduates)
            filterParams.is_cs_graduate = true;
          if (filters.hasResearchPaper) filterParams.has_research_paper = true;
          if (filters.hasBehance) filterParams.has_behance = true;
          if (filters.is_prevetted) filterParams.is_prevetted = true;
          if (filters.is_active) filterParams.is_active = true;
          if (filters.noticePeriod) {
            const days = {
              "15 days": 15,
              "30 days": 30,
              "45 days": 45,
              "60 days": 60,
              "90 days": 90,
              Immediate: 0,
            }[filters.noticePeriod];
            if (days !== undefined) filterParams.notice_period_max_days = days;
          }

          console.log("Fetching candidates with params:", filterParams);
          response = await candidateService.searchCandidates(filterParams);
          setCandidates(response.results);
          setTotalCount(response.count);
          if (response.results.length > 0 && !selectedCandidate) {
            setSelectedCandidate(response.results[0]);
          }
        }
      } catch (error) {
        showToast.error("Failed to fetch candidates");
        console.error("Error fetching candidates:", error);
        setCandidates([]);
        setTotalCount(0);
      } finally {
        setLoadingCandidates(false);
      }
    },
    [
      filters.jobId,
      filters.application_type,
      filters.keywords,
      filters.minTotalExp,
      filters.maxTotalExp,
      filters.minExperience,
      filters.topTierUniversities,
      filters.hasCertification,
      filters.country,
      filters.locations,
      filters.companies,
      filters.industries,
      filters.minSalary,
      filters.maxSalary,
      filters.colleges,
      filters.showFemaleCandidates,
      filters.recentlyPromoted,
      filters.backgroundVerified,
      filters.hasLinkedIn,
      filters.hasTwitter,
      filters.hasPortfolio,
      filters.computerScienceGraduates,
      filters.hasResearchPaper,
      filters.hasBehance,
      filters.is_prevetted,
      filters.is_active,
      filters.noticePeriod,
      selectedCandidate,
      debouncedSearchQuery, // Use the debounced search query
      sortBy,
    ]
  );

  // Ensure fetchCandidates runs when searchQuery changes
  useEffect(() => {
    fetchCandidates(currentPage);
  }, [filters.jobId, currentPage, debouncedSearchQuery]);

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle candidates update from CandidatesMain
  const handleCandidatesUpdate = (
    newCandidates: CandidateListItem[],
    count: number
  ) => {
    setCandidates(newCandidates);
    setTotalCount(count);
    if (newCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(newCandidates[0]);
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
    if (filters.jobId) {
      fetchCandidates(currentPage);
    }
  }, [filters.jobId, currentPage, sortBy]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      application_type: activeTab,
      is_prevetted: activeTab === "prevetted",
      is_active: activeTab === "active",
      sort_by: sortBy,
    }));
  }, [activeTab, sortBy]);

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
        skillLevel: "",
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
    setShowGuideModal(false);
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

  const handleDeleteJobRole = async (jobId: number) => {
    try {
      await jobPostService.deleteJob(jobId);
      await fetchCategories();
      showToast.success(`Successfully deleted job with job id ${jobId}`);
      if (activeCategoryId === jobId) {
        setActiveCategoryId(categories[0]?.id || null);
      }
    } catch (error) {
      showToast.error("Failed to delete job role");
    }
    setShowDeleteModal(null);
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
      case "edit-template":
        handleEditTemplate(jobId);
        break;
      case "share-pipelines":
        handleSharePipelines(jobId);
        break;
      case "archive":
        showToast.success(`Archived ${jobId}`);
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
    setCurrentCandidateId("");
    window.history.pushState({}, "", "/");
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
              pipelineId={currentPipelineId}
              onBack={handleBackFromPipelineShare}
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
                  pipelineId={currentPipelineId}
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
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenLogoutModal={handleOpenLogoutModal}
                  />
                </>
              ) : (
                <>
                  <Toaster />
                  <div className="bg-gray-50 min-h-screen">
                    <div className="sticky top-0 z-20 bg-white will-change-transform">
                      <Header
                        onCreateRole={handleCreateJobRole}
                        onOpenLogoutModal={handleOpenLogoutModal}
                        credits={credits}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                      />
                    </div>

                    <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3">
                      {categories.length > 0 && (
                        <div className="mb-4">
                          <div className="hidden md:flex items-center space-x-2">
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
                                  className={`px- ”

3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                    activeCategoryId === category.id
                                      ? "bg-blue-100 text-blue-700 shadow-sm"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {category.name}
                                  <span
                                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
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
                            {categories.length > 4 && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowCategoryDropdown(
                                      !showCategoryDropdown
                                    )
                                  }
                                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center"
                                >
                                  +{categories.length - 4} more
                                  <ChevronDown className="ml-1 w-4 h-4" />
                                </button>
                                <CategoryDropdown
                                  isOpen={showCategoryDropdown}
                                  onClose={() => setShowCategoryDropdown(false)}
                                  onEditJobRole={handleEditJobRole}
                                  onEditTemplate={handleEditTemplate}
                                  onDeleteJob={(jobId) =>
                                    setShowDeleteModal(jobId)
                                  }
                                  onSharePipelines={handleSharePipelines}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex w-full gap-3 h-full">
                        <div className="lg:w-[25%] order-2 lg:order-1 sticky top-16 self-start will-change-transform">
                          <FiltersSidebar
                            filters={filters}
                            onFiltersChange={setFilters}
                            setCandidates={setCandidates}
                            candidates={candidates}
                            activeTab={activeTab}
                          />
                        </div>
                        <div className="lg:w-[45%] order-1 lg:order-2">
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
                          />
                        </div>
                        <div className="lg:w-[30%] order-3 sticky top-16 self-start will-change-transform">
                          {showTemplateSelector && selectedCandidate ? (
                            <TemplateSelector
                              candidate={selectedCandidate}
                              onBack={handleBackFromTemplate}
                              updateCandidateEmail={updateCandidateEmail}
                              jobId={filters.jobId}
                            />
                          ) : (
                            <CandidateDetail
                              candidate={selectedCandidate}
                              candidates={candidates}
                              onSendInvite={handleSendInvite}
                              updateCandidateEmail={updateCandidateEmail}
                              deductCredits={deductCredits}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <CreateJobRoleModal
                      isOpen={showCreateJobRole}
                      onClose={() => setShowCreateJobRole(false)}
                      onJobCreated={handleJobCreatedOrUpdated}
                    />
                    <EditJobRoleModal
                      isOpen={showEditJobRole}
                      onClose={() => {
                        setShowEditJobRole(false);
                        setEditingJobId(null);
                      }}
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
                    {showGuideModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]  p-4 flex items-start justify-end">
                        <div className="relative top-16 bg-white rounded-xl shadow-xl max-w-md w-full p-4 mr-6 ">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Create Your First Job Role
                            </h3>
                            <p className="text-gray-600 ">
                              It looks like you haven't created any job roles
                              yet.
                              <br />
                              Create a role to get started!
                            </p>
                            <div className="absolute top-[-35px] right-[320px] transform rotate-90">
                              <ArrowLeft className="w-8 h-8 text-blue-600" />
                            </div>

                            {isAuthenticated && (
                              <button
                                onClick={() => {
                                  setShowCreateJobRole(true);
                                  setShowGuideModal(false);
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center absolute top-[-65px] right-[282px] "
                              >
                                Create Role
                              </button>
                            )}
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
                              Are you sure you want to delete {showDeleteModal}?
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
