import React, { useState, useMemo, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { authService } from './services/authService';
import Header from './components/Header';
import FiltersSidebar from './components/FiltersSidebar';
import CandidatesMain from './components/CandidatesMain';
import CandidateDetail from './components/CandidateDetail';
import TemplateSelector from './components/TemplateSelector';
import CreateJobRoleModal from './components/CreateJobRoleModal';
import EditTemplateModal from './components/EditTemplateModal';
import CategoryDropdown from './components/CategoryDropdown';
import PipelineStages from './components/PipelineStages';
import AuthApp from './components/AuthApp';
import Settings from './components/Settings';
import SharePipelinesLoader from './components/SharePipelinesLoader';
import SharePipelinesModal from './components/SharePipelinesModal';
import ShareableProfile from './components/ShareableProfile';
import PipelineSharePage from './components/PipelineSharePage';
import { candidates, Candidate } from './data/candidates';
import { ChevronDown, MoreHorizontal, Edit, Mail, Archive, Trash2, LogOut, Share2 } from "lucide-react";
import { showToast } from './utils/toast';

interface User {
  id: string | undefined;
  fullName: string;
  email: string;
  role: string;
  organizationId: string | undefined;
  workspaceIds: string[];
  isVerified: boolean;
  createdAt: string;
}

function App() {
  // All Hooks at the Top
  const { user: firebaseUser, userStatus, isAuthenticated, isOnboarded, loading: authLoading } = useAuth();

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthApp, setShowAuthApp] = useState(false);
  const [authFlow, setAuthFlow] = useState('login'); // 'login' or 'signup'
  const [showSettings, setShowSettings] = useState(false);

  // Pipeline share page state
  const [showPipelineSharePage, setShowPipelineSharePage] = useState(false);
  const [currentPipelineId, setCurrentPipelineId] = useState('');

    // Shareable profile state
  const [showShareableProfile, setShowShareableProfile] = useState(false);
  const [currentCandidateId, setCurrentCandidateId] = useState('');


  // Existing state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCreateJobRole, setShowCreateJobRole] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPipelineStages, setShowPipelineStages] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('outbound');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showCategoryActions, setShowCategoryActions] = useState<string | null>(null);
  
  // Share Pipelines state
  const [showShareLoader, setShowShareLoader] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [filters, setFilters] = useState({
    keywords: '',
    booleanSearch: false,
    semanticSearch: false,
    selectedCategories: [] as string[],
    minExperience: '',
    maxExperience: '',
    funInCurrentCompany: false,
    minTotalExp: '',
    maxTotalExp: '',
    city: '',
    country: '',
    location: '',
    selectedSkills: [] as string[],
    skillLevel: '',
    noticePeriod: '',
    companies: '',
    industries: '',
    minSalary: '',
    maxSalary: '',
    colleges: '',
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
    hasPortfolio: false
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Head Of Finance');

  const filteredCandidates = useMemo(() => {
    if (!isAuthenticated) return [];
    
    return candidates.filter(candidate => {
      const matchesSearch = !searchTerm || 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesKeywords = !filters.keywords || 
        candidate.name.toLowerCase().includes(filters.keywords.toLowerCase()) ||
        candidate.currentRole.toLowerCase().includes(filters.keywords.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(filters.keywords.toLowerCase()));

      const matchesCategories = filters.selectedCategories.length === 0 ||
        filters.selectedCategories.some(category => 
          candidate.currentRole.toLowerCase().includes(category.toLowerCase()) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(category.toLowerCase()))
        );

      const matchesCurrentExp = (!filters.minExperience || candidate.currentCompanyExperience >= parseInt(filters.minExperience)) &&
        (!filters.maxExperience || candidate.currentCompanyExperience <= parseInt(filters.maxExperience));

      const matchesTotalExp = (!filters.minTotalExp || candidate.totalExperience >= parseInt(filters.minTotalExp)) &&
        (!filters.maxTotalExp || candidate.totalExperience <= parseInt(filters.maxTotalExp));

      const matchesCity = !filters.city || candidate.city.toLowerCase().includes(filters.city.toLowerCase());
      const matchesCountry = !filters.country || candidate.country.toLowerCase().includes(filters.country.toLowerCase());
      const matchesLocation = !filters.location || candidate.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesSkills = filters.selectedSkills.length === 0 ||
        filters.selectedSkills.some(skill => 
          candidate.skills.some(candidateSkill => 
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );

      const matchesSkillLevel = !filters.skillLevel || candidate.skillLevel === filters.skillLevel;
      const matchesNoticePeriod = !filters.noticePeriod || candidate.noticePeriod === filters.noticePeriod;
      const matchesCompanies = !filters.companies || candidate.company.toLowerCase().includes(filters.companies.toLowerCase());

      return matchesSearch && matchesKeywords && matchesCategories && matchesCurrentExp && 
             matchesTotalExp && matchesCity && matchesCountry && matchesLocation && 
             matchesSkills && matchesSkillLevel && matchesNoticePeriod && matchesCompanies;
    });
  }, [searchTerm, filters, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userStatus) {
      const user: User = {
      id: firebaseUser?.uid,
      fullName: userStatus.full_name || 'Unknown User', // Fallback if full_name is undefined
      email: userStatus.email || 'Unknown@user.com', // Fallback if email is undefined
      role: userStatus.roles?.length > 0 ? userStatus.roles[0].name.toLowerCase() : 'team',
      organizationId: userStatus.organization?.id?.toString(),
      workspaceIds: [], // Update this if you have workspace IDs
      isVerified: firebaseUser?.emailVerified ?? true,
      createdAt: firebaseUser?.metadata.creationTime || new Date().toISOString(),
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

  useEffect(() => {
    if (filteredCandidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(filteredCandidates[0]);
    }
  }, [filteredCandidates, selectedCandidate]);

  // Handler Functions
  const handleLogoutRequest = () => {
    setShowLogoutModal(true);
  };
  
  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
  };
  
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogin = () => {
    setAuthFlow('login'); 
    setShowAuthApp(true);
  };

  const handleSignup = () => {
    setAuthFlow('signup');
    setShowAuthApp(true);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuthApp(false);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setShowAuthApp(false);
      setShowSettings(false);
      setSelectedCandidate(null);
      setShowTemplateSelector(false);
      setShowCreateJobRole(false);
      setShowEditTemplate(false);
      setShowPipelineStages(false);
      setSearchTerm('');
      showToast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      showToast.error('Failed to logout');
    }
  };

  const handleWorkspacesOrg = () => {
    setShowAuthApp(true);
    setAuthFlow('workspaces-org');
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
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

  const handleEditJobRole = (categoryName: string) => {
    setShowCreateJobRole(true);
    setShowCategoryActions(null);
  };

  const handleEditTemplate = (categoryName: string) => {
    setEditingTemplate(categoryName);
    setShowEditTemplate(true);
    setShowCategoryActions(null);
  };

  const handleSharePipelines = (categoryName: string) => {
    setShowShareLoader(true);
  };

  const handleShareLoaderComplete = () => {
    setShowShareLoader(false);
    const pipelineId = activeCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setCurrentPipelineId(pipelineId);
    setShowPipelineSharePage(true);
    window.history.pushState({}, '', `/pipelines/${pipelineId}`);
  };

  const handleCategoryAction = (action: string, categoryName: string) => {
    setShowCategoryActions(null);
    switch (action) {
      case 'edit-job':
        handleEditJobRole(categoryName);
        break;
      case 'edit-template':
        handleEditTemplate(categoryName);
        break;
      case 'share-pipelines':
        handleSharePipelines(categoryName);
        break;
      case 'archive':
        showToast.success(`Archived ${categoryName}`);
        break;
      case 'delete':
        showToast.success(`Deleted ${categoryName}`);
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
    setCurrentPipelineId('');
    window.history.pushState({}, '', '/');
  };

  const handleBackFromShareableProfile = () => {
    setShowShareableProfile(false);
    setCurrentCandidateId('');
    window.history.pushState({}, '', '/');
  };

  // Show shareable profile page
  if (showShareableProfile) {
    return (
      <>
        <Toaster />
        <ShareableProfile 
          candidateId={currentCandidateId}
          onBack={handleBackFromShareableProfile}
        />
      </>
    );
  }

  // Non-Hook Variables
  const categories = [
    { name: 'Head Of Finance', count: 8, active: true },
    { name: 'Contract Executive', count: 6 },
    { name: 'Aerospace Engineer', count: 9 },
    { name: 'AI/ML Engineer', count: 9 },
  ];

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

  if (showPipelineSharePage) {
    return (
      <>
        <Toaster />
        <PipelineSharePage 
          pipelineId={currentPipelineId}
          onBack={handleBackFromPipelineShare}
        />
      </>
    );
  }

  if (showSettings) {
    return (
      <>
        <Toaster />
        <Settings 
          onBack={() => setShowSettings(false)}
          user={currentUser}
        />
      </>
    );
  }

  if (showAuthApp) {
    return (
      <>
        <Toaster />
        <AuthApp
          key={authFlow}
          initialFlow={authFlow}
          initialUser={isAuthenticated ? currentUser : null}
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuthApp(false)}
          onLogout={handleLogout}
        />
      </>
    );
  } else if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <AuthApp
          initialFlow="login"
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (showPipelineStages) {
    return (
      <>
        <Toaster />
        <PipelineStages 
          onBack={handleBackFromPipelines}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </>
    );
  }

  // Main UI
  return (
    <>
      <Toaster />
      <div className="bg-gray-50 min-h-screen">
        <div className="sticky top-0 z-20 bg-white will-change-transform">
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onCreateRole={handleCreateJobRole}
            isAuthenticated={isAuthenticated}
            user={currentUser}
            onLogin={handleLogin}
            onSignup={handleSignup}
            onLogout={handleLogout}
            onWorkspacesOrg={handleWorkspacesOrg}
            onSettings={handleSettingsClick}
            onShowLogoutModal={handleLogoutRequest}
          />
        </div>
        
        <div className="max-w-full mx-auto px-3 py-2 lg:px-6 lg:py-3">
          <div className="mb-4">
            <div className="hidden md:flex items-center space-x-2">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    onClick={() => setActiveCategory(category.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === category.name
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeCategory === category.name
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                  {hoveredCategory === category.name && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleCategoryAction('edit-job', category.name)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Job Role
                        </button>
                        <button
                          onClick={() => handleCategoryAction('edit-template', category.name)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Edit Email Template
                        </button>
                        <button
                          onClick={() => handleCategoryAction('share-pipelines', category.name)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Pipelines
                        </button>
                        <button
                          onClick={() => handleCategoryAction('archive', category.name)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </button>
                        <button
                          onClick={() => handleCategoryAction('delete', category.name)}
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
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
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
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
            <div className="lg:col-span-3 order-2 lg:order-1 sticky top-16 self-start will-change-transform">
              <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
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
            <div className="lg:col-span-3 order-3 sticky top-16 self-start will-change-transform">
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
        </div>

        <CreateJobRoleModal 
          isOpen={showCreateJobRole}
          onClose={() => setShowCreateJobRole(false)}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out? You'll need to log in again to access your account.
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
      </div>
    </>
  );
}

export default App; 