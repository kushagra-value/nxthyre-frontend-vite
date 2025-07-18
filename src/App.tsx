import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Adjust path
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { authService } from "./services/authService";
import { creditService } from "./services/creditService";
import { jobPostService } from "./services/jobPostService";
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
import LinkedInAuth from "./components/auth/LinkedInAuth"; // Import LinkedInAuth
import Settings from "./components/Settings";
import SharePipelinesLoader from "./components/SharePipelinesLoader";
import SharePipelinesModal from "./components/SharePipelinesModal";
import ShareableProfile from "./components/ShareableProfile";
import PipelineSharePage from "./components/PipelineSharePage";
import { User } from "./types/auth"; // Adjust path
import { CandidateListItem, candidateService} from './services/candidateService';
import {
  ChevronDown,
  MoreHorizontal,
  Edit,
  Mail,
  Archive,
  Trash2,
  LogOut,
  Share2,
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

  // Authentication state
  const [credits, setCredits] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthApp, setShowAuthApp] = useState(false);
  const [authFlow, setAuthFlow] = useState("login");
  const [showSettings, setShowSettings] = useState(false);

  // Pipeline share page state
  const [showPipelineSharePage, setShowPipelineSharePage] = useState(false);
  const [currentPipelineId, setCurrentPipelineId] = useState("");

  // Shareable profile state
  // Shareable profile state
  const [showShareableProfile, setShowShareableProfile] = useState(false);
  const [currentCandidateId, setCurrentCandidateId] = useState("");

  // Existing state
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateListItem | null>(
    null
  );
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

  // Share Pipelines state
  const [showShareLoader, setShowShareLoader] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);


  const [filters, setFilters] = useState({
    keywords: "",
    keywords: "",
    booleanSearch: false,
    semanticSearch: false,
    selectedCategories: [] as string[],
    minExperience: "",
    maxExperience: "",
    minExperience: "",
    maxExperience: "",
    funInCurrentCompany: false,
    minTotalExp: "",
    maxTotalExp: "",
    city: "",
    country: "",
    location: "",
    minTotalExp: "",
    maxTotalExp: "",
    city: "",
    country: "",
    location: "",
    selectedSkills: [] as string[],
    skillLevel: "",
    noticePeriod: "",
    companies: "",
    industries: "",
    minSalary: "",
    maxSalary: "",
    colleges: "",
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
    hasPortfolio: false,
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const jobs = await jobPostService.getJobs();
      const mappedCategories: Category[] = jobs.map(job => ({
        id: job.id,
        name: job.title,
        count: 0,
      }));
      setCategories(mappedCategories);
      if (mappedCategories.length > 0 && !activeCategory) {
        setActiveCategory(mappedCategories[0].name);
      }
    } catch (error) {
      showToast.error("Failed to fetch job categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);


  // Example categories data; replace with your actual data source as needed
  // const categories = [
  //   { name: "Head Of Finance", count: 12 },
  //   { name: "Engineering Manager", count: 8 },
  //   { name: "Product Designer", count: 5 },
  //   { name: "Marketing Lead", count: 7 },
  //   // Add more categories as needed
  // ];
  const page=1;
  const candidatesPerPage= 5;

  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        const data = await creditService.getCreditBalance();
        setCredits(data.credit_balance);
      } catch (error) {
        console.error("Error fetching credit balance:", error);
        showToast.error("Failed to fetch credit balance");
      }
    };
    if (isAuthenticated) {
      fetchCreditBalance();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !searchTerm && !Object.values(filters).some(val => val)) {
      const fetchInitialCandidates = async () => {
        setLoadingCandidates(true);
        try {
          const { results, count } = await candidateService.getCandidates({
              page,
              page_size: candidatesPerPage,
              tab: activeTab,
            });
          console.log("Fetched initial candidates:", results);
          setCandidates(results);
          showToast.error("Initial candidates loaded successfully");
          console.log("Total candidates fetched:", count);
          console.log("Candidates fetched:", candidates);
          if (count > 0 && !selectedCandidate) {
            setSelectedCandidate(results[0]);
          }
        } catch (error) {
          console.error("Error fetching initial candidates:", error);
          showToast.error("Failed to load initial candidates");
        } finally {
          setLoadingCandidates(false);
        }
      };
      fetchInitialCandidates();
    }
  }, [isAuthenticated, activeTab, selectedCandidate]);

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

  const deductCredits = async () => {
    try {
      const data = await creditService.getCreditBalance();
      setCredits(data.credit_balance);
    } catch (error) {
      console.error("Error fetching updated credit balance:", error);
      showToast.error("Failed to update credit balance");
    }
  };
  
  const handleLogoutRequest = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async() => {
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
        selectedSkills: [],
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
      });
      showToast.success("Successfully logged out");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      showToast.error("Failed to logout");
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // const handleLogin = () => {
  //  setAuthFlow("login");
  //   setAuthFlow("login");
  //   setShowAuthApp(true);
  // };

  // const handleSignup = () => {
  //   setAuthFlow("signup");
  //   setShowAuthApp(true);
  // };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthApp(false);
    navigate("/"); // Redirect to dashboard after auth
  };

  const handleLinkedInAuthSuccess = (user: any) => {
    setCurrentUser(user);
    if (userStatus?.is_onboarded) {
      navigate("/"); // Redirect to dashboard if onboarded
    } else {
      navigate("/workspaces-org"); // Redirect to onboarding
    }
  };

  // const handleWorkspacesOrg = () => {
  //   setShowAuthApp(true);
  //   setAuthFlow("workspaces-org");
  //   navigate("/workspaces-org");
  // };

  // const handleSettingsClick = () => {
  //   setShowSettings(true);
  // };

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
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        setEditingJobId(job.id);
        setShowEditJobRole(true);
      } else {
        showToast.error('Job not found');
      }
    } catch (error) {
      showToast.error('Failed to fetch job details');
    }
    setShowCategoryActions(null);
  };

  const handleDeleteJobRole = async (jobId: number) => {
    try {
      const jobs = await jobPostService.getJobs();
      const job = jobs.find(j => j.id === jobId);
      if (job) {
        await jobPostService.deleteJob(job.id);
        await fetchCategories();
        showToast.success(`Successfully deleted job with job id ${jobId}`);
        if (categories.find(cat => cat.id === jobId)?.name === activeCategory) {
          setActiveCategory(categories[0]?.name || "");
        }
      } else {
        showToast.error('Job not found');
      }
    } catch (error) {
      showToast.error('Failed to delete job role');
    }
    setShowDeleteModal(null);
    setShowCategoryActions(null);
  };

  const handleEditTemplate = (jobId: number) => {
    const job = categories.find(cat => cat.id === jobId);
    if (job) {
      setEditingTemplate(job.name);
      setShowEditTemplate(true);
    }
    setShowCategoryActions(null);
  };

  const handleSharePipelines = (jobId: number) => {
    const job = categories.find(cat => cat.id === jobId);
    if (job) {
    const pipelineId = job.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    window.location.href = `/pipelines/${pipelineId}` 
    }
  };

  const handleShareLoaderComplete = () => {
    setShowShareLoader(false);
    const pipelineId = activeCategory
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    setCurrentPipelineId(pipelineId);
    setShowPipelineSharePage(true);
    window.history.pushState({}, "", `/pipelines/${pipelineId}`);
  };

  const handleCategoryAction = (action: string, jobId: number) => {
    setShowCategoryActions(null);
    switch (action) {
      case "edit-job":
        handleEditJobRole(categories.find(cat => cat.id === jobId)?.id || 0);
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
    setCurrentCandidateId("");
    window.history.pushState({}, "", "/");
  };

  // Conditional Rendering
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
              showPipelineStages ? (
                <>
                  <Toaster />
                  <PipelineStages
                    onBack={handleBackFromPipelines}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenLogoutModal={handleOpenLogoutModal} // Pass handler
                  />
                </>
              ) : (
                <>
                  <Toaster />
                  <div className="bg-gray-50 min-h-screen">
                    <div className="sticky top-0 z-20 bg-white will-change-transform">
                      <Header
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onCreateRole={handleCreateJobRole}
                        onOpenLogoutModal={handleOpenLogoutModal} // Pass handler
                      />
                    </div>

                  <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3">
                    <div className="mb-4">
                      <div className="hidden md:flex items-center space-x-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="relative"
                            onMouseEnter={() =>
                              setHoveredCategory(category.id)
                            }
                            onMouseLeave={() => setHoveredCategory(null)}
                          >
                            <button
                              onClick={() => setActiveCategory(category.name)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                activeCategory === category.name
                                  ? "bg-blue-100 text-blue-700 shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {category.name}
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                  activeCategory === category.name
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
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowCategoryDropdown(!showCategoryDropdown)
                            }
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full flex items-center"
                          >
                            +12 more
                            <ChevronDown className="ml-1 w-4 h-4" />
                          </button>
                          <CategoryDropdown
                            isOpen={showCategoryDropdown}
                            onClose={() => setShowCategoryDropdown(false)}
                            onEditJobRole={handleEditJobRole}
                            onEditTemplate={handleEditTemplate}
                            onDeleteJob={(jobId) => setShowDeleteModal(jobId)}
                          />
                        </div>
                      </div>
                    </div>

                      <div className="flex w-full gap-3 h-full">
                        <div className="lg:w-[25%] order-2 lg:order-1 sticky top-16 self-start will-change-transform">
                          <FiltersSidebar
                            filters={filters}
                            onFiltersChange={setFilters}
                          />
                        </div>
                        <div className="lg:w-[45%] order-1 lg:order-2">
                          <CandidatesMain
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            selectedCandidate={selectedCandidate}
                            setSelectedCandidate={setSelectedCandidate}
                            searchTerm={searchTerm}
                            candidates={filteredCandidates}
                            onPipelinesClick={handlePipelinesClick}
                          />
                        </div>
                        <div className="lg:w-[30%] order-3 sticky top-16 self-start will-change-transform">
                          {showTemplateSelector && selectedCandidate ? (
                            <TemplateSelector
                              candidate={selectedCandidate}
                              onBack={handleBackFromTemplate}
                            />
                          ) : (
                            <CandidateDetail
                              candidate={selectedCandidate}
                              candidates={filteredCandidates}
                              onSendInvite={handleSendInvite}
                            />
                          )}
                        </div>
                      </div>
                      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
                        <div className="lg:col-span-3 order-2 lg:order-1 sticky top-16 self-start will-change-transform">
                          <FiltersSidebar
                            filters={filters}
                            onFiltersChange={setFilters}
                          />
                        </div>
                        <div className="lg:col-span-5 order-1 lg:order-2">
                          <CandidatesMain
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            selectedCandidate={selectedCandidate}
                            setSelectedCandidate={setSelectedCandidate}
                            searchTerm={searchTerm}
                            candidates={filteredCandidates}
                            onPipelinesClick={handlePipelinesClick}
                          />
                        </div>
                        <div className="lg:col-span-4 order-3 sticky top-16 self-start will-change-transform">
                          {showTemplateSelector && selectedCandidate ? (
                            <TemplateSelector
                              candidate={selectedCandidate}
                              onBack={handleBackFromTemplate}
                            />
                          ) : (
                            <CandidateDetail
                              candidate={selectedCandidate}
                              candidates={filteredCandidates}
                              onSendInvite={handleSendInvite}
                            />
                          )}
                        </div>
                      </div> */}
                    </div>

                  <CreateJobRoleModal
                    isOpen={showCreateJobRole}
                    onClose={() => setShowCreateJobRole(false)}
                  />
                  <EditJobRoleModal
                    isOpen={showEditJobRole}
                    onClose={() => {
                      setShowEditJobRole(false);
                      setEditingJobId(null);
                    }}
                    jobId={editingJobId || 0}
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
                    jobRole={activeCategory}
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
                              onClick={handleLogoutCancel}
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
                            Are you sure you want to delete {showDeleteModal}? This action cannot be undone.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setShowDeleteModal(null)}
                              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteJobRole(showDeleteModal)}
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
              <AuthApp initialFlow="login" onAuthSuccess={handleAuthSuccess} />
            </>
          )
        }
      />
    </Routes>
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