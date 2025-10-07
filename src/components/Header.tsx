import React, { useState, useMemo , useEffect} from "react";
import {
  Search,
  Home,
  User,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Building2,
  Check,
} from "lucide-react";
import { useAuthContext } from "../context/AuthContext"; // Adjust path
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import organizationService from "../services/organizationService";
import { CandidateListItem } from "../services/candidateService";
import { Invitation } from "../services/organizationService";

interface HeaderProps {
  onCreateRole: () => void;
  onOpenLogoutModal: () => void;
  credits: number;
  onBack?: () => void; // Optional prop for back button
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showCreateRoleButton?: boolean;
  showSearchBar?: boolean;
  showLinkedinSearchButton?: boolean;
  candidates: CandidateListItem[];
  onSelectCandidate: (candidate: CandidateListItem) => void;
  jobId?: number; // Changed: Added jobId prop
}

const Header: React.FC<HeaderProps> = ({
  onCreateRole,
  onOpenLogoutModal,
  credits,
  onBack,
  searchQuery,
  setSearchQuery,
  showCreateRoleButton,
  showLinkedinSearchButton,
  showSearchBar,
  candidates,
  onSelectCandidate,
  jobId, // Changed: Destructured jobId
}) => {
  const { isAuthenticated, user, signOut } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
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
  useEffect(() => {
  if (isAuthenticated) {
    const fetchInvites = async () => {
      setIsLoadingInvites(true);
      try {
        const data = await organizationService.getInvitations();
        setInvitations(data);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
        // Optionally: showToast.error("Failed to load notifications");
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
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-7 py-1.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <svg width="124" height="61" viewBox="0 0 158 61" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_2895_678" fill="white">
              <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"/>
              <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"/>
              <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"/>
              <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"/>
              <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"/>
              <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"/>
              <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"/>
              </mask>
              <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" fill="#0F47F2"/>
              <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" fill="white"/>
              <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" fill="white"/>
              <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" fill="white"/>
              <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" fill="#4B5563"/>
              <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" fill="#4B5563"/>
              <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" fill="#4B5563"/>
              <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
              <path d="M69.7191 2L71.6001 7.08929L77.2429 9.5L71.6001 11.375L69.7191 17L67.8382 11.375L62.1953 9.5L67.8382 7.08929L69.7191 2Z" fill="white"/>
              <path d="M105.439 22.6285C105.463 25.0588 106.437 27.8518 108.178 29.5532C109.92 31.2545 112.267 32.1967 114.705 32.1724C117.143 32.1481 119.472 31.1594 121.179 29.4238C122.885 27.6881 123.853 25.0654 123.829 22.6351L121.099 22.6351C121.117 24.3571 120.475 26.3244 119.265 27.5542C118.056 28.7841 116.406 29.4846 114.679 29.5018C112.951 29.519 111.288 28.8514 110.054 27.6459C108.82 26.4404 108.133 24.3505 108.116 22.6285L105.439 22.6285Z" fill="#4B5563"/>
              <path d="M107.565 39.1203C108.894 40.6673 110.701 41.7267 112.701 42.1306C114.7 42.5346 116.777 42.26 118.602 41.3504C120.428 40.4409 121.898 38.9482 122.779 37.109C123.661 35.2697 123.903 33.1889 123.469 31.1961L120.807 31.7764C121.113 33.1768 120.942 34.639 120.322 35.9315C119.703 37.224 118.67 38.2729 117.387 38.912C116.104 39.5512 114.645 39.7441 113.24 39.4603C111.835 39.1764 110.565 38.432 109.631 37.3449L107.565 39.1203Z" fill="#0F47F2"/>
              </svg>

            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {/* Search - Only show when authenticated */}
              {isAuthenticated && showLinkedinSearchButton && showSearchBar && (
                <div className="relative hidden sm:flex items-center rounded-lg px-3 py-1 border border-blue-200 bg-blue-50 cursor-pointer w-88">
                  <input
                    type="text"
                    placeholder="Paste Url or Linkedin ID for contact finder ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 500)}
                    className="text-sm bg-blue-50 text-gray-700 placeholder-gray-400 w-88"
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
                  <div className="w-8 h-7 flex items-center justify-center bg-blue-500 rounded-lg ml-2">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Create Role Button - Only show when authenticated and on the home page */}
              {isAuthenticated && showCreateRoleButton && (
                <button
                  onClick={onCreateRole}
                  className="px-3 py-[9px] bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Create Role
                </button>
              )}
              {isAuthenticated && user && (
                <div className="flex items-center gap-1 bg-gray-100 px-4 py-[9px] rounded-lg">
                  <span className="text-sm font-medium">🪙</span>
                  <p className="text-sm font-medium text-gray-500">
                    <span className=" font-medium">{credits}</span>
                  </p>
                </div>
              )}
              {isAuthenticated && !isLoadingInvites && (
                <>
                {pendingInvites.length > 0 && (
                  <div className="relative cursor-pointer" >
                    <div onClick={() => setShowPopup(!showPopup)}>
                      <Bell className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingInvites.length}
                    </span>
                    {showPopup && (
                      <div className="absolute right-0 mt-6 w-[500px] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4">
                          <h3 className="text-lg font-semibold pb-4">Workspace Invitations</h3>
                          <div className="space-y-4">
                            {pendingInvites.map((invite) => (
                              <div key={invite.id} className="flex justify-between gap-4 items-center border p-4 rounded-lg">
                                <div>
                                  <p className="text-sm text-gray-700">
                                    <strong>{invite.invited_by.full_name}</strong> has invited you in <strong>{invite.workspace.name}</strong> workspace.
                                  </p>
                                  
                                  <p className="text-xs text-gray-400">
                                    this invite will expire on {new Date(invite.expires_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}.
                                  </p>
                                </div>
                                <a
                                  href={invite.accept_url}
                                  rel="noopener noreferrer"
                                  className="inline-block px-2 py-1 border border-green-400 text-green-400 text-sm font-medium rounded-full hover:border-green-600 hover:text-green-600"
                                >
                                  <Check className="w-4 h-4 inline-block" />
                                </a>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                      </div>
                    )}
                  </div>
                  )}
                </>
              )}

              {/* Authentication Section */}
              {isAuthenticated && user ? (
                /* User Profile Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-4 p-2 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="flex items-center justify-center text-white text-sm font-medium uppercase">
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
