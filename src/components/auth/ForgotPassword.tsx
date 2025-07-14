import React, { useState } from "react";
import { XCircle, CheckCircle, Mail, Sparkles } from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

interface ForgotPasswordProps {
  onNavigate: (flow: string, data?: any) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.sendPasswordResetOTP(email);
      setIsSuccess(true);
      showToast.success("Password reset OTP sent to your email");

      // Navigate to OTP verification after showing success message...
      setTimeout(() => {
        onNavigate("otp-verification", { email, type: "forgot-password" });
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.message.includes("not found")) {
        setError("No account found with this email address");
      } else {
        setError(error.message || "Failed to send password reset email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
        <div className="absolute top-60 right-20 w-1 h-1 bg-white/35 rounded-full"></div>
        <div className="absolute bottom-60 right-60 w-2 h-2 bg-white/20 rounded-full"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                Check Your Email{" "}
                <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>

              <div className="space-y-4">
                <p className="text-gray-600">
                  We've sent a verification code to:
                </p>
                <p className="font-semibold text-gray-900 text-lg">{email}</p>
                <p className="text-sm text-gray-500">
                  Please check your email and enter the code to reset your
                  password.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-green-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Redirecting to verification...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-white/40 rounded-full"></div>
      <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
      <div className="absolute top-60 right-20 w-1 h-1 bg-white/35 rounded-full"></div>
      <div className="absolute bottom-60 right-60 w-2 h-2 bg-white/20 rounded-full"></div>

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
                Forgot Password{" "}
                <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>
            </div>

            <p className="text-gray-600 mb-8">
              Enter your email address and we'll send you a verification code
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                    error ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your email address"
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="text-blue-600 hover:text-blue-500 font-medium underline"
                  >
                    Sign in
                  </button>
                </span>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 text-center">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Use <span className="font-semibold">
                    admin@admin.com
                  </span> or{" "}
                  <span className="font-semibold">team@team.com</span> for demo
                </p>
              </div>
            </form>

            {/* Legal */}
            <div className="text-center mt-6">
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

export default ForgotPassword;
