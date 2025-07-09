import React, { useState } from 'react';
import { Eye, EyeOff, XCircle, Sparkles, Mic, MessageCircle, Volume2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { showToast } from '../../utils/toast';

interface LoginProps {
  onNavigate: (flow: string, data?: any) => void;
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Sign in with Firebase
      const firebaseUser = await authService.signInWithEmail(formData.email, formData.password);
      
      // Get user status from backend
      const userStatus = await authService.getUserStatus();
      
      // Create user object for compatibility with existing code
      const user = {
        id: firebaseUser.uid,
        fullName: userStatus.full_name,
        email: userStatus.email,
        role: userStatus.roles.length > 0 ? userStatus.roles[0].name.toLowerCase() : 'team',
        organizationId: userStatus.organization?.id?.toString(),
        workspaceIds: [],
        isVerified: firebaseUser.emailVerified,
        createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
      };
      
      onLogin(user);
      
      if (userStatus.is_onboarded) {
        // User is fully onboarded, go to main dashboard
        window.location.href = '/';
      } else {
        // User needs onboarding
        onNavigate('workspaces-org');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
                    <h3 className="text-xl font-semibold">Team Collaboration</h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Seamless workflow management for hiring teams
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-16">
                <p className="text-blue-200 text-sm">
                  Facing any issue? <button className="underline hover:text-white">Contact Us</button>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-[480px]">
            {/* Auth Card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  Welcome Back <Sparkles className="w-6 h-6 ml-2 text-yellow-400" />
                </h2>
              </div>
              
              <p className="text-gray-600 mb-8">
                Sign in to your NxtHyre account to continue
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </button>
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
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* LinkedIn Auth */}
                <button
                  type="button"
                  onClick={() => onNavigate('linkedin-auth')}
                  className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center border border-gray-300"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </button>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                  <span className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('signup')}
                      className="text-blue-600 hover:text-blue-500 font-medium underline"
                    >
                      Create a new account here
                    </button>
                  </span>
                </div>

                {/* Legal */}
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500">
                    By logging in you agree to our{' '}
                    <button className="text-blue-600 hover:underline">Terms and Conditions</button>
                    {' '}and{' '}
                    <button className="text-blue-600 hover:underline">Privacy Policy</button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;