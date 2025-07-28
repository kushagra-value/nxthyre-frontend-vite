import React, { useState, Component, ReactNode } from "react";
import SignUp from "./auth/SignUp";
import Login from "./auth/Login";
import OTPVerification from "./auth/OTPVerification";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
import LinkedInAuth from "./auth/LinkedInAuth";
import WorkspacesOrg from "./workspace/WorkspacesOrg";
import WorkspaceJoining from "./workspace/WorkspaceJoining";
import WorkspaceCreation from "./workspace/WorkspaceCreation";
import CreateOrganization from "./workspace/CreateOrganization";
import { AuthState, User } from "../types/auth";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">
          <h2>Something went wrong.</h2>
          <p>
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AuthAppProps {
  initialFlow?: string;
  initialUser?: User | null;
  onAuthSuccess?: (user: any) => void;
  onClose?: () => void;
  onLogout?: () => void;
}

const AuthApp: React.FC<AuthAppProps> = ({
  initialFlow = "login",
  initialUser = null,
  onAuthSuccess,
  onClose,
  onLogout,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!initialUser,
    user: initialUser || null,
    currentFlow: initialFlow,
    otpAttempts: 3,
  });
  const [flowData, setFlowData] = useState<any>(null);

  const handleNavigate = (flow: string, data?: any) => {
    setAuthState((prev) => ({ ...prev, currentFlow: flow }));
    setFlowData(data);
  };

  const handleLogin = (user: any) => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user,
    }));
    onAuthSuccess?.(user);
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      currentFlow: "login",
      otpAttempts: 3,
    });
    setFlowData(null);
    onLogout?.();
    onClose?.();
  };

  const renderCurrentFlow = () => {
    switch (authState.currentFlow) {
      case "signup":
        return <SignUp onNavigate={handleNavigate} />;

      case "login":
        return <Login onNavigate={handleNavigate} onLogin={handleLogin} />;

      case "otp-verification":
        return (
          <OTPVerification
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            data={flowData}
          />
        );

      case "forgot-password":
        return <ForgotPassword onNavigate={handleNavigate} />;

      case "reset-password":
        return <ResetPassword onNavigate={handleNavigate} data={flowData} />;

      case "linkedin-auth":
        return (
          <LinkedInAuth onNavigate={handleNavigate} onLogin={handleLogin} />
        );

      case "workspaces-org":
        return (
          <ErrorBoundary>
            <WorkspacesOrg onNavigate={handleNavigate} />
          </ErrorBoundary>
        );

      case "workspace-joining":
        return <WorkspaceJoining onNavigate={handleNavigate} />;

      case "workspace-creation":
        return <WorkspaceCreation onNavigate={handleNavigate} />;

      case "create-organization":
        return (
          <CreateOrganization
            onNavigate={handleNavigate}
            onComplete={handleLogin}
          />
        );

      default:
        return <Login onNavigate={handleNavigate} onLogin={handleLogin} />;
    }
  };

  return <div className="auth-app">{renderCurrentFlow()}</div>;
};

export default AuthApp;
