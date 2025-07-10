import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

interface LinkedInAuthProps {
  onNavigate: (flow: string, data?: any) => void;
  onLogin: (user: any) => void;
}

const LinkedInAuth: React.FC<LinkedInAuthProps> = ({ onNavigate, onLogin }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        // Get authorization code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = Math.random().toString(36).substring(2);
        sessionStorage.setItem("linkedin_oauth_state", state);
        const scope = "openid profile email";

        if (!code) {
          // Redirect to LinkedIn OAuth
          const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
            import.meta.env.VITE_LINKEDIN_CLIENT_ID
          }&redirect_uri=${
            import.meta.env.VITE_LINKEDIN_REDIRECT_URI
          }&state=${state}&scope=${scope}`;

          window.location.href = linkedInAuthUrl;
          return;
        }

        // Exchange code for tokens
        const response = await authService.linkedInCallback(code, state);

        // Sign in with custom Firebase token
        await authService.signInWithCustomToken(response.firebase_token);

        setAuthStatus("success");

        // Create user object for compatibility
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

        // Set user state and navigate immediately
        onLogin(linkedInUser);
        if (response.is_onboarded) {
          onNavigate("/"); // Navigate to dashboard route
        } else {
          onNavigate("workspaces-org");
        }
      } catch (error: any) {
        console.error("LinkedIn auth error:", error);
        setAuthStatus("error");
        showToast.error(error.message || "LinkedIn authentication failed");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(handleLinkedInCallback, 1000);
    return () => clearTimeout(timer);
  }, [onNavigate, onLogin]);

  const handleRetry = () => {
    setIsLoading(true);
    setAuthStatus("loading");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* UI remains unchanged */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => onNavigate("login")}
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
              {/* LinkedIn Logo */}
              <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>

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
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg _rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => onNavigate("login")}
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
