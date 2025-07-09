import React, { useState } from 'react';
import { ArrowLeft, Users, Building2, Clock } from 'lucide-react';
import { organizationService } from '../../services/organizationService';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../utils/toast';

interface WorkspaceJoiningProps {
  onNavigate: (flow: string, data?: any) => void;
  user: any; // Can be null or undefined
}

const WorkspaceJoining: React.FC<WorkspaceJoiningProps> = ({ onNavigate, user }) => {
  const [requestedWorkspaces, setRequestedWorkspaces] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const { userStatus } = useAuth();

  // Guard clause: If user is not available, show a fallback UI
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">
            Please log in to join a workspace or return to the dashboard.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // TODO: Replace with actual workspace data from backend
  // For now using dummy data - PLEASE REPLACE THIS
  const availableWorkspaces = [
    {
      id: '2',
      name: 'Marketing Team',
      organizationId: userStatus?.organization?.id?.toString() || '1',
      members: ['other-user-1', 'other-user-2']
    },
    {
      id: '3', 
      name: 'Sales Team',
      organizationId: userStatus?.organization?.id?.toString() || '1',
      members: ['other-user-3']
    }
  ];

  const handleRequestJoin = async (workspaceId: string) => {
    try {
      await organizationService.requestJoinWorkspace(parseInt(workspaceId));
      setRequestedWorkspaces(prev => [...prev, workspaceId]);
      setPendingRequests(prev => [...prev, workspaceId]);
      showToast.success('Join request sent to workspace owner!');
    } catch (error: any) {
      console.error('Join request error:', error);
      showToast.error(error.message || 'Failed to send join request');
    }
  };

  const handleWithdrawRequest = async (workspaceId: string) => {
    try {
      await organizationService.withdrawJoinRequest(parseInt(workspaceId));
      setRequestedWorkspaces(prev => prev.filter(id => id !== workspaceId));
      setPendingRequests(prev => prev.filter(id => id !== workspaceId));
      showToast.info('Join request withdrawn');
    } catch (error: any) {
      console.error('Withdraw request error:', error);
      showToast.error(error.message || 'Failed to withdraw request');
    }
  };

  const getRequestStatus = (workspaceId: string) => {
    return requestedWorkspaces.includes(workspaceId) ? 'requested' : 'available';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => onNavigate('workspaces-org')}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Join a Workspace</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Workspaces</h2>
          <p className="text-gray-600">Request to join existing workspaces</p>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You have {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Workspaces List */}
        <div className="space-y-4">
          {availableWorkspaces.length > 0 ? (
            availableWorkspaces.map((workspace) => {
              const organization = userStatus?.organization;
              const memberCount = workspace.members?.length || 0;
              const status = getRequestStatus(workspace.id);

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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{workspace.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {organization?.name || 'No Organization'}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {memberCount} member{memberCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {status === 'available' ? (
                        <button
                          onClick={() => handleRequestJoin(workspace.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Request to Join
                        </button>
                      ) : (
                        <button
                          onClick={() => handleWithdrawRequest(workspace.id)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                          Withdraw Request
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Workspaces</h3>
              <p className="text-gray-600 mb-4">
                You are already a member of all workspaces or none are available.
              </p>
              <button
                onClick={() => onNavigate('workspace-creation')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create a Workspace
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
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