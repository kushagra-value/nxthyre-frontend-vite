import React, { useState, useEffect } from "react";
import {
  Search,
  Home,
  User,
  ChevronDown,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { creditService } from '../services/creditService';
import { showToast } from '../utils/toast';

interface User {
  id: string | undefined;
  fullName: string;
  email: string;
  role: string;
  organizationId: string | undefined;
  workspaceIds: string[];
  isVerified: boolean;
  createdAt: string;
}

interface HeaderProps {
  setSearchTerm: (term: string) => void;
  onCreateRole: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onWorkspacesOrg?: () => void;
  onSettings?: () => void;
  onShowLogoutModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onCreateRole,
  isAuthenticated = false,
  user = null,
  onLogin,
  onSignup,
  onLogout,
  onWorkspacesOrg,
  onSettings,
  onShowLogoutModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [searchTerm, setSearchTerm] = useState("linkedin contact finder");

  const handleLogoutClick = () => {
    onShowLogoutModal();
    setShowUserMenu(false);
  };

  const handleGoToDashboard = () => {
    // Navigate back to main dashboard...
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (isAuthenticated && user) {
        setLoadingCredits(true);
        try {
          const balanceData = await creditService.getCreditBalance();
          setCreditBalance(balanceData.credit_balance);
        } catch (error) {
          setCreditBalance(null);
          showToast.error('Failed to load credit balance');
        }
        setLoadingCredits(false);
      } else {
        setCreditBalance(null);
      }
    };

    fetchCreditBalance();
  }, [isAuthenticated, user]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-7 py-1.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={handleGoToDashboard}
              >
                NxtHyre
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {/* Search - Only show when authenticated */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="LinkedIn Contact Finder..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none w-40"
                  />
                </div>
              )}

              {/* Create Role Button - Only show when authenticated */}
              {isAuthenticated && (
                <button
                  onClick={onCreateRole}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Create Role
                </button>
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
                      <User className="w-4 h-4 text-white" />
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
                        <div className="flex items-center space-x-2">
                          {loadingCredits ? (
                            <span className="text-xs text-gray-500 animate-pulse">Loading credits...</span>
                          ) : creditBalance !== null ? (
                            <span className="text-xs text-gray-500">
                              {creditBalance} credit remaining
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">oops!! no credit </span>
                          )}
                        </div>

                        {/* Workspace & Organization */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onWorkspacesOrg?.();
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
                            onSettings?.();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>

                        {/* Logout */}
                        <button
                          onClick={handleLogoutClick}
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
                    onClick={onLogin}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSignup}
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
