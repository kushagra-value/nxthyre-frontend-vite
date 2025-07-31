import React, { useState } from "react";
import {
  Search,
  Home,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext"; // Adjust path
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

import { CandidateListItem } from "../services/candidateService";

interface HeaderProps {
  onCreateRole: () => void;
  onOpenLogoutModal: () => void;
  credits: number;
  onBack?: () => void; // Optional prop for back button
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCreateRoleButton?: boolean;
  candidates: CandidateListItem[];
  onSelectCandidate: (candidate: CandidateListItem) => void;
}

const Header: React.FC<HeaderProps> = ({
  onCreateRole,
  onOpenLogoutModal,
  credits,
  onBack,
  searchQuery,
  setSearchQuery,
  showCreateRoleButton,
  candidates,
  onSelectCandidate,
}) => {
  const { isAuthenticated, user, signOut } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  const handleSignup = () => {
    navigate("/");
  };

  const handleWorkspacesOrg = () => {
    navigate("/workspaces-org");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogoutRequest = async () => {
    try {
      await signOut(); // Use signOut instead of logout
      showToast.success("Successfully logged out");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error);
      showToast.error("Failed to logout");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/");
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-7 py-1.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={onBack}
              >
                NxtHyre
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {/* Search - Only show when authenticated */}
              {isAuthenticated && (
                <div className="relative hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="LinkedIn Contact Finder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    // onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none w-40"
                  />
                  {isFocused && candidates.length > 0 && (
                    <div className="absolute left-[-1px] top-full w-full bg-white shadow-lg rounded-lg mt-1 z-10 max-h-40 overflow-y-auto">
                      {candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            onSelectCandidate(candidate);
                            setSearchQuery(candidate.full_name || "");
                          }}
                        >
                          {candidate.full_name || "Unnamed Candidate"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Create Role Button - Only show when authenticated and on the home page */}
              {isAuthenticated && showCreateRoleButton && (
                <button
                  onClick={onCreateRole}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Create Role
                </button>
              )}
              {isAuthenticated && user && (
                <div className="flex items-center gap-1 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-xs">🪙</span>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">{credits}</span>
                  </p>
                </div>
              )}
              {/* Authentication Section */}
              {isAuthenticated && user ? (
                /* User Profile Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.fullName ? user.fullName[0] : "U"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role || "Member"}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email || "user@example.com"}
                          </p>
                        </div>

                        {/* Workspace & Organization */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleWorkspacesOrg();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                        >
                          <Building2 className="w-4 h-4 mr-3" />
                          Workspaces & Organizations
                        </button>

                        {/* Settings */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleSettingsClick();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenLogoutModal(); // Trigger modal via prop
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login/Register Buttons */
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
