import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  XCircle,
  CheckCircle,
  Sparkles,
  Mic,
  MessageCircle,
  Volume2,
} from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

// Define the props interface for the ResetPassword component
interface ResetPasswordProps {
  onNavigate: (flow: string, data?: any) => void;
  data: {
    email: string;
    otp: string;
  };
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigate, data }) => {
  const [formData, setFormData] = useState<{
    password: string;
    confirmPassword: string;
  }>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ensure required data is present here
  if (!data?.email || !data?.otp) {
    setTimeout(() => {
      showToast.error("Missing required data. Please start the process again.");
      onNavigate("forgot-password");
    }, 5000);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <p className="text-red-500">
            Error: Missing required data. Please start the process again.
          </p>
          <button
            onClick={() => onNavigate("forgot-password")}
            className="mt-4 text-blue-500 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { email, otp } = data;

      await authService.resetPasswordWithOTP(email, otp, formData.password);

      showToast.success("Password reset successfully!");
      onNavigate("login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrors({ general: error.message || "Password reset failed" });
      showToast.error("Password reset failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    );
  };

  interface PasswordStrength {
    strength: number;
    text: string;
    color: string;
  }

  const getPasswordStrength = (): PasswordStrength => {
    const password = formData.password;
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const strengthTexts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#10b981"];

    return {
      strength: (strength / 5) * 100,
      text: strengthTexts[strength - 1] || "",
      color: colors[strength - 1] || "#6b7280",
    };
  };

  const passwordStrength = getPasswordStrength();

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
              onClick={() => onNavigate("forgot-password")}
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
                Reset Password{" "}
                <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>
            </div>

            <p className="text-gray-600 mb-8">
              Create a new password for {data.email}
            </p>

            <div className="space-y-6">
              {/* New Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-900 placeholder-gray-500 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${passwordStrength.strength}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.text}
                      </span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-900 placeholder-gray-500 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Passwords match
                    </p>
                  )}
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>

              {/* General Error */}
              {errors.general && (
                <p className="text-sm text-red-500 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {errors.general}
                </p>
              )}

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Your password will be encrypted and stored securely
                </p>
              </div>
            </div>

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

export default ResetPassword;
