import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Building2, Clock } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { useAuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";

interface WorkspaceJoiningProps {
  onNavigate: (flow: string, data?: any) => void;
}

const WorkspaceJoining: React.FC<WorkspaceJoiningProps> = ({ onNavigate }) => {
  const { user, userStatus } = useAuthContext();
  const [requestedWorkspaces, setRequestedWorkspaces] = useState<Set<number>>(
    new Set()
  );
  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableWorkspaces = async () => {
      if (!userStatus?.organization?.id) return;

      try {
        setLoading(true);
        const allWorkspaces = await organizationService.getWorkspaces(
          userStatus.organization.id
        );
        const joinedWorkspaceIds = userStatus.roles
          .filter((role: any) => role.scope === "WORKSPACE")
          .map((role: any) => role.workspace_id);
        const available = allWorkspaces.filter(
          (ws: any) => !joinedWorkspaceIds.includes(ws.id)
        );
        setAvailableWorkspaces(available);
      } catch (error: any) {
        console.error("Error fetching workspaces:", error);
        showToast.error("Failed to load available workspaces");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableWorkspaces();
  }, [userStatus]);

  if (!user || !userStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to join a workspace or return to the dashboard.
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleRequestJoin = async (workspaceId: number) => {
    try {
      await organizationService.requestJoinWorkspace(workspaceId);
      setRequestedWorkspaces((prev) => new Set(prev).add(workspaceId));
      showToast.success("Join request sent to workspace owner!");
    } catch (error: any) {
      console.error("Join request error:", error);
      showToast.error(error.message || "Failed to send join request");
    }
  };

  const handleWithdrawRequest = async (workspaceId: number) => {
    try {
      await organizationService.withdrawJoinRequest(workspaceId);
      setRequestedWorkspaces((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workspaceId);
        return newSet;
      });
      showToast.info("Join request withdrawn");
    } catch (error: any) {
      console.error("Withdraw request error:", error);
      showToast.error(error.message || "Failed to withdraw request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate("workspaces-org")}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Join a Workspace
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available Workspaces
          </h2>
          <p className="text-gray-600">Request to join existing workspaces</p>
        </div>

        {requestedWorkspaces.size > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Requests
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You have {requestedWorkspaces.size} pending request
                  {requestedWorkspaces.size !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {availableWorkspaces.length > 0 ? (
            availableWorkspaces.map((workspace) => {
              const organization = userStatus?.organization;
              const memberCount = workspace.members?.length || 0;
              const isRequested = requestedWorkspaces.has(workspace.id);

              return (
                <div
                  key={workspace.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {organization?.name || "No Organization"}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {memberCount} member{memberCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isRequested ? (
                        <button
                          onClick={() => handleWithdrawRequest(workspace.id)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          Withdraw Request
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequestJoin(workspace.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Available Workspaces
              </h3>
              <p className="text-gray-600 mb-4">
                You are already a member of all workspaces or none are
                available.
              </p>
              <button
                onClick={() => onNavigate("workspace-creation")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create a Workspace
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            How it works:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Request to Join" to send a join request</li>
            <li>• Workspace owners will review your request</li>
            <li>• You'll be notified once approved</li>
            <li>• You can withdraw your request at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceJoining;
