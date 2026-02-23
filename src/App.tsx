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
import LinkedInAuth from "./components/auth/LinkedInAuth";
import Settings from "./components/Settings";
import ShareableProfile from "./components/profileShare/ShareableProfile";
import PipelineSharePage from "./pages/PipelineSharePage";
import TermsAndConditions from "./components/TermsAndConditions";
import JobApplicationForm from "./pages/JobApplicationForm";
import CandidateBackGroundCheck from "./pages/CandidateBackGroundCheck";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import ShareCandidateListPage from "./components/applicantTracking/ShareCandidateListPage";
import ProjectSkeletonCard from "./components/skeletons/ProjectSkeletonCard";
import {
  organizationService,
} from "./services/organizationService";
import { User } from "./types/auth";
import { showToast } from "./utils/toast";
import Cookies from "js-cookie";
import { Users, LogOut } from "lucide-react";


// Layout
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/Header";

// Pages
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Interviews from "./pages/Interviews";
import CandidatesPool from "./pages/CandidatesPool";
import JobPipeline from "./pages/JobPipeline";
import Companies from "./pages/Companies";

function MainApp() {
  const navigate = useNavigate();
  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    signOut,
    loading: authLoading,
  } = useAuth();
  const { } = useAuthContext();

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
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
      showToast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      showToast.error("Failed to logout");
    }
  };

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
    setCurrentPage("jobPipeline");
  };

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
        return "Companies";
      case "jobs":
        return "Jobs";
      case "interviews":
        return "Interviews";
      case "candidatePool":
        return "Candidate Pool";
      case "jobPipeline":
        return "Pipeline Stage";
      default:
        return "Dashboard";
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "companies":
        return <Companies />;
      case "jobs":
        return <Jobs onSelectJob={handleJobSelect} />;
      case "interviews":
        return <Interviews />;
      case "candidatePool":
        return <CandidatesPool initialJobId={selectedJobId} />;
      case "jobPipeline":
        return <JobPipeline jobId={selectedJobId} onBack={() => setCurrentPage("jobs")} />;
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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white shadow-sm z-40 animate-pulse">
          <div className="flex items-center justify-between px-8 py-4 max-w-screen-2xl mx-auto">
            <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
            <div className="flex items-center gap-8">
              <div className="h-12 bg-gray-200 rounded-lg w-96"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProjectSkeletonCard key={i} />
            ))}
          </div>
        </div>
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
        <Route
          path="/terms-and-policies"
          element={<TermsAndConditions />}
        />
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
                  onNavigate={setCurrentPage}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                  <HeaderBar
                    title={getPageTitle()}
                    subtitle={getCurrentDateTime()}
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
