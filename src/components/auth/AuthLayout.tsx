import React from "react";
import { ArrowLeft, Sparkles, Mic, MessageCircle, Volume2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
}) => {
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
        <div className="w-full max-w-7xl flex items-center gap-16">
          {/* Left Side - Branding Content... */}
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
                  <p className="text-blue-100 text-sm">S</p>
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

          {/* Right Side - Auth Form */}
          <div className="w-[480px]">
            {/* Auth Card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              {showBackButton && (
                <button
                  onClick={onBack}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              )}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  {title} <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
                </h2>
              </div>

              {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}

              {children}

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
    </div>
  );
};

export default AuthLayout;
