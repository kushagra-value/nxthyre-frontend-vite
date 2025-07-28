import React, { useState, useEffect } from "react";
import {
  XCircle,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Mic,
  MessageCircle,
  Volume2,
} from "lucide-react";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";

interface OTPVerificationProps {
  onNavigate: (flow: string, data?: any) => void;
  onLogin?: (user: any) => void;
  data?: any;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  onNavigate,
  onLogin,
  data,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp.join("");

    if (otpToVerify.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      if (data?.type === "forgot-password") {
        // Use password reset OTP verification for forgot-password flow here
        response = await authService.verifyPasswordResetOTP(
          data?.email || "",
          otpToVerify
        );
        showToast.success("OTP verified successfully!");
        onNavigate("reset-password", { email: data.email, otp: otpToVerify });
      } else {
        // Use regular OTP verification for signup flow
        response = await authService.verifyOTP(
          data?.email || "",
          data?.userData?.fullName,
          otpToVerify,
          data?.userData?.password
        );
        showToast.success("Email verified successfully!");

        if (data?.type === "signup") {
          if (
            response.next_step === "login_then_onboard" ||
            response.next_step === "login_then_provide_company_email"
          ) {
            onNavigate("login");
          } else {
            window.location.href = "/";
          }
        } else {
          onNavigate("login");
        }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      if (error.message.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
      } else {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);

        if (newAttempts === 0) {
          setError("Maximum attempts reached. Please try again later.");
        } else {
          setError(`${error.message}. ${newAttempts} attempts remaining.`);
        }
      }

      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (data?.email) {
      const resendMethod =
        data?.type === "forgot-password"
          ? authService.sendPasswordResetOTP
          : authService.resendOTP;
      resendMethod(data.email)
        .then(() => {
          setTimeLeft(300);
          setAttempts(3);
          setError("");
          setOtp(["", "", "", "", "", ""]);
          showToast.success("OTP resent successfully!");
        })
        .catch((error) => {
          console.error("Resend OTP error:", error);
          showToast.error("Failed to resend OTP");
        });
    }
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
                  <a
                    href="mailto:support@nxyhyre.com?subject=Login%20Request&body=Hello%20Support%20Team,%0D%0A%0D%0APlease%20assist%20with%20my%20issue:%0D%0A[Describe%20your%20issue%20here]%0D%0A%0D%0AThank%20you!"
                    className="underline hover:text-white"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() =>
                onNavigate(
                  data?.type === "signup" ? "signup" : "forgot-password"
                )
              }
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
                Verify Your Email{" "}
                <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
              </h2>
            </div>

            <p className="text-gray-600 mb-8">
              We've sent a 6-digit code to {data?.email || "your email"}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter verification code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-12 text-center text-lg font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        error ? "border-red-500" : ""
                      }`}
                      disabled={isLoading || attempts === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 flex items-center justify-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Code expires in:{" "}
                  <span className="font-semibold text-blue-600">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={
                  isLoading ||
                  attempts === 0 ||
                  otp.some((digit) => digit === "")
                }
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                </span>
                <button
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center underline"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Resend Code
                </button>
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

export default OTPVerification;
