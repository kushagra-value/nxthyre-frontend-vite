import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Mic,
  MessageCircle,
  Volume2,
} from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

interface LinkedInAuthProps {
  onNavigate: (flow: string, data?: any) => void;
  onLogin: (user: any) => void;
}

const LinkedInAuth: React.FC<LinkedInAuthProps> = ({ onNavigate, onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get("code");
      const stateFromUrl = urlParams.get("state");

      if (!code || !stateFromUrl) {
        return; // Wait for user to initiate login
      }

      setIsLoading(true);
      setAuthStatus("loading");

      try {
        // Validate state for CSRF protection
        const storedState = sessionStorage.getItem("linkedin_oauth_state");
        if (!storedState || stateFromUrl !== storedState) {
          throw new Error("State mismatch. Possible CSRF attack.");
        }

        // Clean up stored state
        sessionStorage.removeItem("linkedin_oauth_state");

        // Exchange code for Firebase token
        const response = await authService.linkedInCallback(code, stateFromUrl);

        // Sign in with Firebase custom token
        await authService.signInWithCustomToken(response.firebase_token);

        // Create user object
        const linkedInUser = {
          id: response.recruiter_id,
          fullName: response.full_name,
          email: response.email,
          role: "team",
          isVerified: true,
          organizationId: response.organization?.id?.toString(),
          workspaceIds: [],
          createdAt: new Date().toISOString(),
        };

        setAuthStatus("success");

        // Clean URL parameters to prevent re-processing
        navigate("/linkedin-auth", { replace: true });

        // Simulate redirect delay
        setTimeout(() => {
          onLogin(linkedInUser);
          if (response.is_onboarded) {
            navigate("/"); // Redirect to dashboard
          } else {
            onNavigate("workspaces-org");
          }
        }, 2000);
      } catch (error: any) {
        console.error("LinkedIn auth error:", error);
        setAuthStatus("error");
        showToast.error(error.message || "LinkedIn authentication failed");
      } finally {
        setIsLoading(false);
      }
    };

    handleLinkedInCallback();
  }, [navigate, onNavigate, onLogin, location.search]);

  const handleLinkedInLogin = () => {
    setIsLoading(true);
    setAuthStatus("loading");

    // Generate and store state for CSRF protection here
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("linkedin_oauth_state", state);
    const scope = "openid profile email";

    // Redirect to LinkedIn OAuth
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      import.meta.env.VITE_LINKEDIN_CLIENT_ID
    }&redirect_uri=${
      import.meta.env.VITE_LINKEDIN_REDIRECT_URI
    }&state=${state}&scope=${scope}`;

    window.location.href = linkedInAuthUrl;
  };

  const handleRetry = () => {
    setIsLoading(true);
    setAuthStatus("loading");
    navigate("/linkedin-auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full"></div>
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
      <div className="absolute top-60 right-20 w-1 h-1 bg-white/35 rounded-full"></div>
      <div className="absolute bottom-60 right-60 w-2 h-2 bg-white/20 rounded-full"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-7xl flex items-center gap-16">
          {/* Left Side - Branding Content */}
          <div className="flex-1 text-white">
            {/* Logo */}
            <div className="flex items-center mb-16">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">NxtHyre</span>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl">
              <div className="flex items-center mb-6">
                <h1 className="text-5xl font-bold mr-4">JOIN THE</h1>
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Hiring Revolution
              </h2>

              {/* Feature Cards - Side by Side */}
              <div className="flex gap-6 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mr-4">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">AI Recruiting</h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Intelligent candidate matching in 60+ industries
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mr-4">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">Smart Screening</h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Automated interviews and skill assessments
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center mr-4">
                      <Volume2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Team Collaboration
                    </h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Seamless workflow management for hiring teams
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-16">
                <p className="text-blue-200 text-sm">
                  Facing any issue?{" "}
                  <button className="underline hover:text-white">
                    Contact Us
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => onNavigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                LinkedIn Authentication{" "}
                <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>
            </div>

            <p className="text-gray-600 mb-8">
              Connecting to your LinkedIn account
            </p>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>

              {authStatus === "idle" && (
                <div className="space-y-4">
                  <button
                    onClick={handleLinkedInLogin}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    disabled={isLoading}
                  >
                    Sign in with LinkedIn
                  </button>
                </div>
              )}

              {authStatus === "loading" && (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Authenticating...
                    </h3>
                    <p className="text-gray-600">
                      Please wait while we connect to LinkedIn
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      You may be redirected to LinkedIn to complete the
                      authentication
                    </p>
                  </div>
                </div>
              )}

              {authStatus === "success" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Authentication Successful!
                    </h3>
                    <p className="text-gray-600">
                      Welcome! Redirecting to your dashboard...
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      LinkedIn account connected successfully
                    </p>
                  </div>
                </div>
              )}

              {authStatus === "error" && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Authentication Failed
                    </h3>
                    <p className="text-gray-600">
                      We couldn't connect to your LinkedIn account
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                      This could be due to network issues or LinkedIn being
                      temporarily unavailable
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleRetry}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => onNavigate("/")}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-8">
              <p className="text-xs text-gray-500">
                © 2024 NxtHyre. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAuth;
