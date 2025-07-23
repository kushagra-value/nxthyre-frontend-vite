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
  members: string[];
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const searchTerm =
    propSearchTerm !== undefined ? propSearchTerm : localSearchTerm;
  const setSearchTerm = propSetSearchTerm || setLocalSearchTerm;

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (!isAuthenticated || !userStatus || !mounted) {
        console.log("Waiting for auth:", { isAuthenticated, userStatus });
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching organizations...");
        const orgResponse = await organizationService.getOrganizations();
        const fetchedOrganizations: Organization[] = orgResponse.map(
          (org: any) => ({
            id: org.id,
            name: org.name,
            domain: org.domain || null,
          })
        );
        if (mounted) {
          setOrganizations(fetchedOrganizations);
        }
        console.log("Organizations fetched:", fetchedOrganizations);

        const fetchWorkspacesWithRetry = async (
          orgId: number,
          retries = 3
        ): Promise<Workspace[]> => {
          try {
            console.log(`Fetching workspaces for org ${orgId}...`);
            const workspaceResponse = await organizationService.getWorkspaces(
              orgId
            );
            return workspaceResponse.map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              organization: orgId,
              members: ws.members || [],
              createdAt: ws.createdAt,
            }));
          } catch (error: any) {
            if (error.response?.status === 403 && retries > 0) {
              console.warn(
                `403 Forbidden for org ${orgId}, retrying... (${retries} left)`
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              return fetchWorkspacesWithRetry(orgId, retries - 1);
            }
            throw new Error(
              `Failed to fetch workspaces for org ${orgId}: ${error.message}`
            );
          }
        };

        const workspacePromises = fetchedOrganizations.map((org) =>
          fetchWorkspacesWithRetry(org.id)
        );
        const allWorkspaces = (await Promise.all(workspacePromises)).flat();
        console.log("Workspaces fetched:", allWorkspaces);
        if (mounted) {
          setWorkspaces(allWorkspaces);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        if (mounted) {
          showToast.error(
            "Failed to load organizations and workspaces. Please try refreshing."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Delay the fetch to ensure token is ready
    timeoutId = setTimeout(() => {
      if (mounted) {
        fetchData();
      }
    }, 2000);

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, userStatus]);

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

  const handleCreateWorkspace = () => onNavigate("workspace-creation");
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
      console.error("Logout error:", error);
      showToast.error("Failed to logout");
    }
  };

  const onCreateRole =
    propOnCreateRole ||
    (() =>
      showToast.info(
        "Create Role clicked - implement this in the parent component"
      ));

  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return;

    const { type, id, name } = showDeleteModal;
    try {
      showToast.success(
        `${
          type === "org" ? "Organization" : "Workspace"
        } "${name}" deleted successfully`
      );
    } catch (error) {
      showToast.error(`Failed to delete ${type}`);
    }
    setShowDeleteModal(null);
  };

  const handleEditSubmit = async () => {
    if (!showEditModal) return;

    const { type } = showEditModal;
    try {
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

  // Filter joined workspaces and sort by createdAt descending
  const joinedWorkspaceIds =
    userStatus?.roles
      ?.filter((role: any) => role.scope === "WORKSPACE")
      ?.map((role: any) => role.workspace_id) || [];
  const joinedWorkspaces = workspaces
    .filter((ws) => joinedWorkspaceIds.includes(ws.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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
                onClick={() => setActiveTab("organizations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "organizations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Organizations
              </button>
            </nav>
          </div>

          {activeTab === "workspaces" && (
            <div className="space-y-6">
              {organizations.length === 0 ? (
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
              ) : (
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
                  </div>
                  {joinedWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {joinedWorkspaces.map((workspace) => {
                        const organization = organizations.find(
                          (org) => org.id === workspace.organization
                        );
                        const isOwner = userStatus?.roles?.some(
                          (role: any) =>
                            role.name === "ADMIN" &&
                            role.scope === "WORKSPACE" &&
                            role.workspace_id === workspace.id
                        );

                        return (
                          <div
                            key={workspace.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              {isOwner && (
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
                              {organization?.name || "No Organization"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-1" />
                                {workspace.members.length} member
                                {workspace.members.length !== 1 ? "s" : ""}
                              </div>
                              <button
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                onClick={handleGoToDashboard}
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
              )}
            </div>
          )}

          {activeTab === "organizations" && (
            <div className="space-y-6">
              {organizations.length === 0 ? (
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
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {organizations.map((org) => {
                      const isOwner = userStatus?.roles?.some(
                        (role: any) =>
                          role.name === "OWNER" &&
                          role.scope === "ORGANIZATION" &&
                          role.organization_id === org.id
                      );

                      return (
                        <div
                          key={org.id}
                          className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-blue-500" />
                            </div>
                            {isOwner && (
                              <div className="relative group">
                                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEditModal("org", org)}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      openDeleteModal(
                                        "org",
                                        org.id.toString(),
                                        org.name
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
                            {org.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            @{org.domain || "unknown"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              {
                                workspaces.filter(
                                  (ws) => ws.organization === org.id
                                ).length
                              }{" "}
                              workspace
                              {workspaces.filter(
                                (ws) => ws.organization === org.id
                              ).length !== 1
                                ? "s"
                                : ""}
                            </div>
                            {isOwner && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
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
