import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Building2, Settings, LogOut, Bell, Check } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import organizationService, { Invitation } from '../services/organizationService';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const RefreshIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 12C2.5 12.2761 2.72386 12.5 3 12.5C3.27614 12.5 3.5 12.2761 3.5 12H2.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5Z" fill="#4B5563" />
    <path d="M20.4718 2.42157V8.07843H14.8149" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 12C21.5 11.7239 21.2761 11.5 21 11.5C20.7239 11.5 20.5 11.7239 20.5 12H21.5ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5V21.5C17.2467 21.5 21.5 17.2467 21.5 12H20.5ZM12 20.5C8.66336 20.5 5.7748 18.5775 4.38331 15.7775L3.48779 16.2225C5.04171 19.3494 8.26926 21.5 12 21.5V20.5Z" fill="#4B5563" />
    <path d="M3.52832 21.5784V15.9216H9.18517" stroke="#4B5563" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header({ title, subtitle }: HeaderProps) {
  const { isAuthenticated, user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchInvites = async () => {
        setIsLoadingInvites(true);
        try {
          const data = await organizationService.getInvitations();
          setInvitations(data);
        } catch (error) {
          console.error("Failed to fetch invitations:", error);
        } finally {
          setIsLoadingInvites(false);
        }
      };
      fetchInvites();
    } else {
      setInvitations([]);
    }
  }, [isAuthenticated]);

  const pendingInvites = useMemo(() =>
    invitations.filter(invite => invite.status === "PENDING"),
    [invitations]
  );

  return (
    <header className="bg-white flex items-center justify-between px-6 shrink-0 relative" style={{ height: '88px', padding: '16px 24px' }}>
      <div className="flex flex-col gap-2.5">
        <h1 className="text-[22px] font-medium leading-6 text-black">{title}</h1>
        {subtitle && (
          <div className="flex items-center gap-2">
            {subtitle.split('•').map((part, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-sm font-light text-[#4B5563] leading-5">{part.trim()}</span>
                {i < arr.length - 1 && <span className="w-1 h-1 rounded-full bg-[#4B5563] opacity-40" />}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">

        {/* Icon buttons */}
        <div className="flex items-start gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
            {RefreshIcon}
          </button>

          {isAuthenticated && !isLoadingInvites && (
            <div className="relative">
              <button
                onClick={() => setShowPopup(!showPopup)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Pending Invitations"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {pendingInvites.length > 0 && (
                  <span
                    className="absolute flex items-center justify-center text-[10px] text-white font-bold rounded-full"
                    style={{
                      width: '16px',
                      height: '16px',
                      top: '4px',
                      right: '4px',
                      background: '#EF4444',
                      border: '1px solid #FFFFFF',
                    }}
                  >
                    {pendingInvites.length}
                  </span>
                )}
              </button>

              {showPopup && pendingInvites.length > 0 && (
                <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 z-[110]">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold pb-4">Workspace Invitations</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="flex justify-between gap-4 items-center border p-4 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-700">
                              <strong>{invite.invited_by.full_name}</strong> has invited you in <strong>{invite.workspace.name}</strong> workspace.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              this invite will expire on {new Date(invite.expires_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}.
                            </p>
                          </div>
                          <a
                            href={invite.accept_url}
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 border border-green-500 text-green-500 rounded-full hover:bg-green-50"
                            title="Accept Invitation"
                          >
                            <Check className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-[#0F47F2] rounded-full flex items-center justify-center text-white font-medium uppercase shrink-0">
              {user?.fullName ? user.fullName[0] : "U"}
            </div>
            <ChevronDown className="w-5 h-5 text-[#0F47F2]" />
          </button>

          {showUserMenu && (
            <div className="absolute top-[100%] right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[100]">
              <div className="py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/workspaces-org");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                  Workspaces & Organizations
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </button>

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    try {
                      await signOut();
                      navigate('/');
                    } catch (e) {
                      console.error("Logout error", e);
                    }
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
      </div>
    </header>
  );
}
