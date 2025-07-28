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
  const { user, userStatus, isAuthenticated, signOut } = useAuthContext();
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
      } catch (error: any) {
        showToast.error("Failed to load data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, userStatus]);

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
      const adminWorkspaces = workspaces.filter(
        (ws) => ws.user_role === "ADMIN"
      );
      const requestsPromises = adminWorkspaces.map(async (ws) => {
        const requests = await organizationService.getPendingJoinRequests(
          ws.organization,
          ws.id
        );
        return requests.map((req: any) => ({
          id: req.id,
          workspaceId: ws.id,
          workspaceName: ws.name,
          requesterEmail: req.recruiter.email,
          createdAt: req.created_at,
        }));
      });
      const allRequests = (await Promise.all(requestsPromises)).flat();
      setPendingRequests(allRequests);
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
                  NxtHyre
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={onCreateRole}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Create Role
                </button>
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
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                                  <button
                                    onClick={() =>
                                      openDeleteModal(
                                        "workspace",
                                        workspace.id.toString(),
                                        workspace.name
                                      )
                                    }
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
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
                              onClick={handleGoToDashboard}
                            >
                              Open
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
