import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

interface LinkedInAuthProps {
  onNavigate: (flow: string, data?: any) => void;
  onLogin: (user: any) => void;
}

const LinkedInAuth: React.FC<LinkedInAuthProps> = ({ onNavigate, onLogin }) => {
  const [status, setStatus] = useState<
    "idle" | "authenticating" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Check for callback parameters when the component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      // Callback scenario: process the authentication
      setStatus("authenticating");
      handleCallback(code, state);
    } else {
      // Initial scenario: show the sign-in button
      setStatus("idle");
    }
  }, []);

  const handleCallback = async (code: string, state: string) => {
    try {
      // Validate the state parameter for security
      const storedState = sessionStorage.getItem("linkedin_oauth_state");
      if (state !== storedState) {
        throw new Error("State mismatch. Possible security issue.");
      }
      sessionStorage.removeItem("linkedin_oauth_state");

      // Exchange the code for a Firebase token
      const response = await authService.linkedInCallback(code, state);

      // Sign in with Firebase
      await authService.signInWithCustomToken(response.firebase_token);

      // Create a user object
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

      // Update the app state with the logged-in user
      onLogin(linkedInUser);

      // Show success and navigate after a delay
      setStatus("success");
      setTimeout(() => {
        if (response.is_onboarded) {
          onNavigate("dashboard");
        } else {
          onNavigate("workspaces-org");
        }
      }, 2000);
    } catch (error: any) {
      console.error("LinkedIn auth error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Authentication failed");
      showToast.error(error.message || "LinkedIn authentication failed");
    }
  };

  const initiateAuth = () => {
    // Generate and store a random state for security
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("linkedin_oauth_state", state);

    // Construct LinkedIn OAuth URL
    const scope = "openid profile email";
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      import.meta.env.VITE_LINKEDIN_CLIENT_ID
    }&redirect_uri=${
      import.meta.env.VITE_LINKEDIN_REDIRECT_URI
    }&state=${state}&scope=${scope}`;

    // Redirect to LinkedIn
    window.location.href = linkedInAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
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

            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              LinkedIn Authentication{" "}
              <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
            </h2>

            <p className="text-gray-600 mb-8">
              Connecting to your LinkedIn account
            </p>

            {status === "idle" && (
              <button
                onClick={initiateAuth}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Sign in with LinkedIn
              </button>
            )}

            {status === "authenticating" && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Authenticating...
                </h3>
                <p className="text-gray-600">
                  Please wait while we connect to LinkedIn
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Authentication Successful!
                </h3>
                <p className="text-gray-600">
                  Redirecting to your dashboard...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Authentication Failed
                </h3>
                <p className="text-gray-600">{errorMessage}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAuth;
