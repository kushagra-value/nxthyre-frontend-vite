import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Building2,
  Settings,
  Search,
  ChevronDown,
  MoreHorizontal,
  LogOut,
  Home,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { organizationService } from "../../services/organizationService";
import { showToast } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

interface Organization {
  id: number;
  name: string;
  domain: string | null;
}

interface Workspace {
  id: number;
  name: string;
  organization: number;
  member_count: number;
  created_by: string;
  user_role: string;
}

interface JoinRequest {
  id: number;
  workspaceId: number;
  workspaceName: string;
  requesterEmail: string;
  createdAt: string;
}

interface WorkspacesOrgProps {
  onNavigate: (flow: string, data?: any) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  onCreateRole?: () => void;
}

const WorkspacesOrg: React.FC<WorkspacesOrgProps> = ({
  onNavigate,
  searchTerm: propSearchTerm,
  setSearchTerm: propSetSearchTerm,
  onCreateRole: propOnCreateRole,
}) => {
  const { user, userStatus, isAuthenticated, signOut , selectedWorkspaceId: contextSelectedWorkspaceId, setSelectedWorkspaceId: contextSetSelectedWorkspaceId} = useAuthContext();
  const [activeTab, setActiveTab] = useState("workspaces");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(propSearchTerm || "");
  const [showDeleteModal, setShowDeleteModal] = useState<{
    type: "org" | "workspace";
    id: string;
    name: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState<{
    type: "org" | "workspace";
    item: any;
  } | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const navigate = useNavigate();

  const searchTerm =
    propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !userStatus) {
        return;
      }
      try {
        setLoading(true);
        // Fetch onboarding status to get the user's organization
        const onboardingStatus =
          await organizationService.getOnboardingStatus();
        if (
          onboardingStatus.status === "ONBOARDED" &&
          onboardingStatus.organization
        ) {
          setOrganization({
            id: onboardingStatus.organization.id,
            name: onboardingStatus.organization.name,
            domain: onboardingStatus.organization.domain || null,
          });
          console.log("Organization 11111111111111:", organization);
        }

        // Fetch workspaces the user is a member of
        const myWorkspaces = await organizationService.getMyWorkspaces();
        setWorkspaces(myWorkspaces);
        const savedWorkspaceId = Cookies.get("selectedWorkspaceId");
        if (savedWorkspaceId && myWorkspaces.some((ws: Workspace) => ws.id === parseInt(savedWorkspaceId))) {
          contextSetSelectedWorkspaceId(parseInt(savedWorkspaceId));
        } else if (myWorkspaces.length > 0) {
          // If no valid workspace in cookie and workspaces exist, select the first one
          const firstWorkspaceId = myWorkspaces[0].id;
          contextSetSelectedWorkspaceId(firstWorkspaceId);
          Cookies.set("selectedWorkspaceId", firstWorkspaceId.toString(), { expires: 7 }); // Store in cookie for 7 days
        }
      } catch (error: any) {
        showToast.error("Failed to load data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, userStatus]);


  const handleSelectWorkspace = (workspaceId: number) => {
    contextSetSelectedWorkspaceId(workspaceId);
    Cookies.set("selectedWorkspaceId", workspaceId.toString(), { expires: 7 }); // Update cookie
    navigate("/"); // Navigate to dashboard
  };


  const handleCreateWorkspace = () => {
    if (organization) {
      onNavigate("workspace-creation", { organizationId: organization.id });
    } else {
      showToast.error("Please create an organization first.");
    }
  };

  const handleJoinWorkspace = () => onNavigate("workspace-joining");
  const handleCreateOrganization = () => onNavigate("create-organization");
  const handleGoToDashboard = () => navigate("/");

  const handleLogoutRequest = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      showToast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      showToast.error("Failed to logout");
    }
  };

  const onCreateRole =
    propOnCreateRole || (() => showToast.info("Create Role clicked"));

  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return;
    const { type, id, name } = showDeleteModal;
    try {
      if (type === "org") {
        // Implement delete organization if API supports it
        showToast.success(`Organization "${name}" deleted successfully`);
      } else {
        // Implement delete workspace if API supports it
        showToast.success(`Workspace "${name}" deleted successfully`);
        if (contextSelectedWorkspaceId === parseInt(id)) {
          const remainingWorkspaces = workspaces.filter((ws) => ws.id !== parseInt(id));
          if (remainingWorkspaces.length > 0) {
            contextSetSelectedWorkspaceId(remainingWorkspaces[0].id);
            Cookies.set("selectedWorkspaceId", remainingWorkspaces[0].id.toString(), { expires: 7 });
          } else {
            contextSetSelectedWorkspaceId(null);
            Cookies.remove("selectedWorkspaceId");
          }
        }
      }
      if (type === "org") setOrganization(null);
      else setWorkspaces((prev) => prev.filter((ws) => ws.id !== parseInt(id)));
    } catch (error) {
      showToast.error(`Failed to delete ${type}`);
    }
    setShowDeleteModal(null);
  };

  const handleEditSubmit = async () => {
    if (!showEditModal) return;
    const { type, item } = showEditModal;
    try {
      if (type === "org") {
        // Implement update organization if API supports it
        setOrganization((prev) => (prev ? { ...prev, ...editFormData } : null));
      } else {
        // Implement update workspace if API supports it
        setWorkspaces((prev) =>
          prev.map((ws) =>
            ws.id === item.id ? { ...ws, ...editFormData } : ws
          )
        );
      }
      showToast.success(
        `${type === "org" ? "Organization" : "Workspace"} "${
          editFormData.name
        }" updated successfully`
      );
    } catch (error) {
      showToast.error(`Failed to update ${type}`);
    }
    setShowEditModal(null);
    setEditFormData({});
  };

  const openEditModal = (type: "org" | "workspace", item: any) => {
    setShowEditModal({ type, item });
    setEditFormData({ ...item });
  };

  const openDeleteModal = (
    type: "org" | "workspace",
    id: string,
    name: string
  ) => {
    setShowDeleteModal({ type, id, name });
  };

  const handleManageWorkspace = async () => {
    try {
      // Fetch all pending join requests using the new API endpoint
      const requests = await organizationService.getPendingJoinRequests();
      const formattedRequests = requests.map((req: any) => ({
        id: req.id,
        workspaceId: req.workspace_id,
        workspaceName: req.workspace_name,
        requesterEmail: req.recruiter.email,
        createdAt: req.created_at,
      }));
      setPendingRequests(formattedRequests);
      setShowManageModal(true);
    } catch (error) {
      showToast.error("Failed to load pending requests");
    }
  };

  const handleApproveRequest = async (
    organizationId: number,
    workspaceId: number,
    requestId: number
  ) => {
    try {
      await organizationService.manageJoinRequest(
        organizationId,
        workspaceId,
        requestId,
        "approve"
      );
      showToast.success("Request approved");
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      showToast.error("Failed to approve request");
    }
  };

  const handleRejectRequest = async (
    organizationId: number,
    workspaceId: number,
    requestId: number
  ) => {
    try {
      await organizationService.manageJoinRequest(
        organizationId,
        workspaceId,
        requestId,
        "reject"
      );
      showToast.success("Request rejected");
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      showToast.error("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1
                  className="text-2xl font-bold text-blue-600 cursor-pointer"
                  onClick={handleGoToDashboard}
                >
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
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* <button
                  onClick={onCreateRole}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Create Role
                </button> */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.fullName?.[0] || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.fullName || "User"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.fullName || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                        <button
                          onClick={handleGoToDashboard}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Dashboard
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          Workspaces & Organizations
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowLogoutModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("workspaces")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "workspaces"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Workspaces
              </button>
              <button
                onClick={() => setActiveTab("organization")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "organization"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Organization
              </button>
            </nav>
          </div>

          {activeTab === "workspaces" && (
            <div className="space-y-6">
              {organization ? (
                <>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleCreateWorkspace}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Workspace
                    </button>
                    <button
                      onClick={handleJoinWorkspace}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Workspace
                    </button>
                    <button
                      onClick={handleManageWorkspace}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Pending Requests
                    </button>
                  </div>
                  {workspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {workspaces.map((workspace) => (
                        <div
                          key={workspace.id}
                          className={`bg-white rounded-lg shadow-sm  ${contextSelectedWorkspaceId==workspace.id?"border-2 border-blue-500": "border border-gray-200"} p-6 hover:shadow-md transition-shadow`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            {workspace.user_role === "ADMIN" && (
                              <div className="relative group">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      openEditModal("workspace", workspace)
                                    }
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Edit
                                  </button>
                                  
                                </div>
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {workspace.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {organization.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              {workspace.member_count} member
                              {workspace.member_count !== 1 ? "s" : ""}
                            </div>
                            <button
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              onClick={() => handleSelectWorkspace(workspace.id)}
                            >
                              {contextSelectedWorkspaceId==workspace.id?"Selected":"Select"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No workspaces yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Create your first workspace or join an existing one
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleCreateWorkspace}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Workspace
                        </button>
                        <button
                          onClick={handleJoinWorkspace}
                          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Join Workspace
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No organization found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You need to create an organization first to manage
                    workspaces.
                  </p>
                  <button
                    onClick={handleCreateOrganization}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Organization
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "organization" && (
            <div className="space-y-6">
              {organization ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal("org", organization)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            openDeleteModal(
                              "org",
                              organization.id.toString(),
                              organization.name
                            )
                          }
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {organization.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    @{organization.domain || "unknown"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {workspaces.length} workspace
                      {workspaces.length !== 1 ? "s" : ""}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Owner
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No organization found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create an organization to get started
                  </p>
                  <button
                    onClick={handleCreateOrganization}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Organization
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete{" "}
                {showDeleteModal.type === "org" ? "Organization" : "Workspace"}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{showDeleteModal.name}"? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit{" "}
                {showEditModal.type === "org" ? "Organization" : "Workspace"}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {showEditModal.type === "org" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={editFormData.domain || ""}
                    onChange={(e) =>
                      setEditFormData((prev: any) => ({
                        ...prev,
                        domain: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(null);
                  setEditFormData({});
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Workspace Join Requests
              </h3>
              <button
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-600">No pending join requests.</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.requesterEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        Workspace: {request.workspaceName} | Requested on{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleApproveRequest(
                            organization!.id,
                            request.workspaceId,
                            request.id
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleRejectRequest(
                            organization!.id,
                            request.workspaceId,
                            request.id
                          )
                        }
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? You'll need to log in again
                to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutRequest}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkspacesOrg;
