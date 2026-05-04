import React, { useState, useEffect } from "react";
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
import AuthApp from "./components/AuthApp";
import LinkedInAuth from "./pages/auth/LinkedInAuth";
import Settings from "./pages/settings/Settings";
import ShareableProfile from "./pages/profileShare/ShareableProfile";
import PipelineSharePage from "./pages/pipelines/PipelineSharePage";
import TermsAndConditions from "./components/legal/TermsAndConditions";
import JobApplicationForm from "./pages/candidates/components/JobApplicationForm";
import CandidateBackGroundCheck from "./pages/candidates/components/CandidateBackGroundCheck";
import CandidateCallPage from "./pages/companies/components/CandidateCallPage";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import ShareCandidateListPage from "./pages/pipelines/ShareCandidateListPage";
import { organizationService } from "./services/organizationService";
import { User } from "./types/auth";
import { showToast } from "./utils/toast";
import Cookies from "js-cookie";
import { Users, LogOut } from "lucide-react";

// Layout
import Sidebar from "./components/layout/Sidebar";
import HeaderBar from "./components/layout/Header";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Interviews from "./pages/interviews/Interviews";
import CandidatesPool from "./pages/candidates/CandidatesPool";
import JobPipeline from "./pages/companies/components/JobPipeline";
import Companies from "./pages/companies/Companies";
import SchedulePage from "./pages/schedules/SchedulePage";
import CandidateSearch from "./pages/candidates/CandidateSearch";

function MainApp() {
  const navigate = useNavigate();
  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    signOut,
    loading: authLoading,
  } = useAuth();
  const {} = useAuthContext();

  const [currentPage, setCurrentPage] = useState(() => {
    return sessionStorage.getItem("nxthyre_activeTab") || "dashboard";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [, setAuthFlow] = useState("login");
  const [, setShowAuthApp] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userStatus) {
      const user: User = {
        id: firebaseUser?.uid,
        fullName: userStatus.full_name || "Unknown User",
        isSuperAdmin: userStatus.isSuperAdmin || false,
        email: userStatus.email || "Unknown@user.com",
        role:
          userStatus.roles?.length > 0
            ? userStatus.roles[0].name.toLowerCase()
            : "team",
        organizationId: userStatus.organization?.id?.toString(),
        workspaceIds: userStatus.roles
          .filter(
            (role: any) =>
              role.workspace_id !== null && role.workspace_id !== undefined,
          )
          .map((role: any) => Number(role.workspace_id)),
        isVerified: firebaseUser?.emailVerified ?? true,
        createdAt:
          firebaseUser?.metadata.creationTime || new Date().toISOString(),
      };
      setCurrentUser(user);
    }
  }, [isAuthenticated, userStatus, firebaseUser]);

  // Persist active tab to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("nxthyre_activeTab", currentPage);
  }, [currentPage]);

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

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      setCurrentUser(null);
      setShowAuthApp(false);
      sessionStorage.removeItem("hasSelectedJob");
      sessionStorage.removeItem("activeCategoryId");
      sessionStorage.removeItem("showPipelineStages");
      sessionStorage.removeItem("nxthyre_activeTab");
      sessionStorage.removeItem("nxthyre_companies_wsId");
      sessionStorage.removeItem("nxthyre_companies_jobId");
      showToast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      showToast.error("Failed to logout");
    }
  };

  const [headerWorkspaceName, setHeaderWorkspaceName] = useState<
    string | undefined
  >(undefined);
  const [headerJobName, setHeaderJobName] = useState<string | undefined>(
    undefined,
  );
  const [headerCandidateName, setHeaderCandidateName] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const handleHeaderUpdate = () => {
      setHeaderWorkspaceName((window as any).__selectedWorkspaceName);
      setHeaderJobName((window as any).__selectedJobName);
      setHeaderCandidateName((window as any).__selectedCandidateName);
    };
    const handleTabSwitch = (e: any) => {
      if (e.detail?.page) {
        setCurrentPage(e.detail.page);
      }
    };
    window.addEventListener("header-update", handleHeaderUpdate);
    window.addEventListener("tab-switch", handleTabSwitch);
    // Initial check
    handleHeaderUpdate();
    return () => {
      window.removeEventListener("header-update", handleHeaderUpdate);
      window.removeEventListener("tab-switch", handleTabSwitch);
    };
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${date} • ${time}`;
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "companies":
        if (headerJobName) return `${headerJobName}`;
        if (headerWorkspaceName) return "Company Jobs";
        return "Companies";
      case "interviews":
        return "Interviews";
      case "candidatePool":
        return "Candidate Pool";
      case "candidateSearch":
        return "Candidates";
      case "jobPipeline":
        return "Pipeline Stage";
      case "calendar":
        return "Schedule Interviews";
      default:
        return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    if (currentPage === "companies") {
      if (headerJobName && headerWorkspaceName && headerCandidateName) {
        return `Companies • ${headerWorkspaceName} • ${headerJobName} • Profile`;
      }
      if (headerJobName && headerWorkspaceName) {
        return `Companies • ${headerWorkspaceName} • ${headerJobName}`;
      }
      if (headerWorkspaceName) {
        return `Companies • ${headerWorkspaceName}`;
      }
    }
    return getCurrentDateTime();
  };

  const handleBreadcrumbNavigate = (index: number) => {
    if (currentPage !== "companies") return;
    // index 0 = "Companies" (go back to company list)
    // index 1 = workspace name (go back to job listing)
    // index 2 = job name (go back to job pipeline if candidate profile is active)
    if (index === 0) {
      // Navigate back to companies list
      delete (window as any).__selectedWorkspaceName;
      delete (window as any).__selectedJobName;
      delete (window as any).__selectedCandidateName;
      window.dispatchEvent(
        new CustomEvent("breadcrumb-navigate", {
          detail: { level: "companies" },
        }),
      );
    } else if (index === 1) {
      // Navigate back to job listing
      delete (window as any).__selectedJobName;
      delete (window as any).__selectedCandidateName;
      window.dispatchEvent(
        new CustomEvent("breadcrumb-navigate", {
          detail: { level: "workspace" },
        }),
      );
    } else if (index === 2 && headerCandidateName) {
      // Navigate back to job pipeline from candidate profile
      delete (window as any).__selectedCandidateName;
      window.dispatchEvent(
        new CustomEvent("breadcrumb-navigate", { detail: { level: "job" } }),
      );
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "companies":
        return <Companies />;
      case "interviews":
        return <Interviews />;
      case "candidatePool":
        return <CandidatesPool initialJobId={null} />;
      case "candidateSearch":
        return <CandidateSearch />;
      case "jobPipeline":
        return <JobPipeline jobId={null} workspaceId={0} workspaces={[]} />;
      case "calendar":
        return <SchedulePage />;
      default:
        return <Dashboard />;
    }
  };

  // InvitePage (inline component)
  function InvitePage() {
    const navInvite = useNavigate();
    const [searchParams] = useSearchParams();
    const inviteToken = searchParams.get("invite_token");
    const wsName = searchParams.get("workspace_name") || "the workspace";
    const {
      user: _fbUser,
      userStatus: _uStatus,
      isAuthenticated: isAuth,
      signOut: inviteSignOut,
      loading: inviteAuthLoading,
    } = useAuth();
    const { setSelectedWorkspaceId: ctxSetWsId } = useAuthContext();
    const [claiming, setClaiming] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    useEffect(() => {
      if (!inviteToken) {
        showToast.error("Invalid invite link.");
        navInvite("/");
        return;
      }
      if (!inviteAuthLoading && isAuth && !claiming && !successData) {
        handleClaimInvite();
      }
    }, [inviteAuthLoading, isAuth, inviteToken]);

    const handleClaimInvite = async () => {
      if (!inviteToken || claiming) return;
      setClaiming(true);
      try {
        const data =
          await organizationService.claimWorkspaceInvite(inviteToken);
        showToast.success("Successfully joined the workspace!");
        ctxSetWsId(data.workspace.id);
        Cookies.set("selectedWorkspaceId", data.workspace.id.toString(), {
          expires: 7,
        });
        await organizationService.getMyWorkspaces();
        setSuccessData(data.workspace);
      } catch (error: any) {
        const errorMsg = error.message;
        if (errorMsg.includes("expired")) {
          showToast.error("Invitation expired.");
        } else if (errorMsg.includes("different email")) {
          showToast.error(
            "You are logged in with a different email. Please sign out and sign in with the invited email.",
          );
          await inviteSignOut();
        } else if (errorMsg.includes("different organization")) {
          showToast.error("User belongs to a different organization.");
        } else if (errorMsg.includes("authentication")) {
          showToast.error("Authentication required. Please sign in.");
          navInvite("/");
        } else {
          showToast.error("Failed to join workspace.");
        }
      } finally {
        setClaiming(false);
      }
    };

    if (inviteAuthLoading || claiming) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-10 animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
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
              onClick={() => navInvite("/")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
          <p className="text-gray-600 mb-4">
            To accept this invite and join {wsName}, please sign in first.
          </p>
          <button
            onClick={() => navInvite("/")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F3F5F7]">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col bg-white shrink-0 h-screen w-[248px] border-r border-[#E5E7EB] animate-pulse">
          <div className="h-[86px] flex items-center px-[30px]">
            <div className="w-[96px] h-[38px] bg-gray-200 rounded"></div>
          </div>
          <div className="h-0 mx-6 border-t border-[#4B5563] opacity-30"></div>
          <div className="flex flex-col flex-1 p-6 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[52px] w-[200px] bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </aside>
        
        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Skeleton */}
          <div className="h-[88px] bg-white flex items-center justify-between px-6 shrink-0 animate-pulse border-b border-[#E5E7EB]">
            <div className="w-48 h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Skeleton */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-4">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-[#D1D1D6] h-[120px] flex flex-col justify-between">
                      <div className="flex justify-between items-center w-full mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-200" />
                        <div className="w-20 h-4 rounded bg-gray-200" />
                      </div>
                      <div className="w-16 h-3 rounded bg-gray-200 mb-1" />
                      <div className="w-12 h-8 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                {/* Priority Actions */}
                <div className="bg-white rounded-xl p-5 flex flex-col gap-5 h-[600px] animate-pulse border border-[#E5E7EB]">
                  <div className="w-48 h-6 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={`col-${i}`} className="bg-[#F3F5F7] rounded-xl p-2.5">
                        <div className="flex items-center justify-between px-1 py-1 mb-2">
                          <div className="w-20 h-4 rounded bg-gray-200" />
                          <div className="w-8 h-4 rounded bg-gray-200" />
                        </div>
                        {[...Array(3)].map((_, j) => (
                          <div key={`card-${i}-${j}`} className="bg-white rounded-lg p-4 mb-2.5 h-[140px]">
                            <div className="w-24 h-4 rounded bg-gray-200 mb-3" />
                            <div className="w-32 h-3 rounded bg-gray-200 mb-3" />
                            <div className="w-16 h-3 rounded bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Sidebar */}
              <aside className="w-96 hidden lg:flex flex-col gap-4 shrink-0 animate-pulse">
                <div className="bg-white rounded-xl h-[350px] border border-[#E5E7EB] p-5">
                  <div className="w-32 h-5 bg-gray-200 rounded mb-4"></div>
                  <div className="w-full h-[260px] bg-gray-100 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-xl h-[400px] border border-[#E5E7EB] p-5">
                  <div className="w-32 h-5 bg-gray-200 rounded mb-4"></div>
                  <div className="w-full h-[310px] bg-gray-100 rounded-lg"></div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { user, loading, isAuthenticated: isAuthed } = useAuthContext();
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
    if (!isAuthed || !user.isSuperAdmin) {
      window.location.href = "/";
    }
    return <>{children}</>;
  };

  return (
    <>
      <Toaster />
      <Routes>
        <Route
          path="/super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard
                onLogout={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
              />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/candidate-profiles/:candidateId"
          element={<ShareableProfile />}
        />
        <Route
          path="/call/:candidateId/:jobId"
          element={<CandidateCallPage />}
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
              pipelineName="Pipeline"
              onBack={() => navigate("/")}
              onHomepage={() => navigate("/")}
            />
          }
        />
        <Route
          path="/public/workspaces/:workspaceId/applications"
          element={<ShareCandidateListPage workspaceName="" />}
        />
        <Route path="/jobs/:id" element={<JobApplicationForm />} />
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
              <div className="flex h-screen overflow-hidden bg-[#F3F5F7]">
                <Sidebar
                  currentPage={currentPage}
                  onNavigate={(page) => {
                    if (page === "companies") {
                      delete (window as any).__selectedWorkspaceName;
                      delete (window as any).__selectedJobName;
                      delete (window as any).__selectedCandidateName;
                      sessionStorage.removeItem("nxthyre_companies_wsId");
                      sessionStorage.removeItem("nxthyre_companies_jobId");
                      window.dispatchEvent(
                        new CustomEvent("breadcrumb-navigate", {
                          detail: { level: "companies" },
                        }),
                      );
                    }
                    setCurrentPage(page);
                  }}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                  <HeaderBar
                    title={getPageTitle()}
                    subtitle={getPageSubtitle()}
                    onBreadcrumbNavigate={handleBreadcrumbNavigate}
                  />
                  {renderPage()}
                </main>
              </div>
            ) : (
              <>
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
                  onClick={() => setShowLogoutModal(false)}
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
