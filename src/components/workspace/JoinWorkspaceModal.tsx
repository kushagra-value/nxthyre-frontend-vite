import React, { useState, useEffect } from "react";
import { Users, Building2, Clock, X } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { useAuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";

interface JoinWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinWorkspaceModal: React.FC<JoinWorkspaceModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { user, userStatus } = useAuthContext();
    const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userStatus || !user || !isOpen) return;

            try {
                setLoading(true);
                const discoverWorkspaces = await organizationService.getDiscoverWorkspaces();
                setAvailableWorkspaces(discoverWorkspaces);

                const userPendingRequests: any[] = [];
                await Promise.all(
                    discoverWorkspaces.map(async (workspace: any) => {
                        const requests = await organizationService.getPendingJoinRequests();
                        const userRequest = requests.find((req: any) => req.userId === user.id);
                        if (userRequest) {
                            userPendingRequests.push({
                                ...workspace,
                                join_request_details: userRequest,
                            });
                        }
                    })
                );
                setPendingRequests(userPendingRequests);
            } catch (error: any) {
                showToast.error("Failed to load workspaces.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userStatus, user, isOpen]);

    const handleRequestJoin = async (
        workspaceId: number,
        userId: string,
        organizationId: number
    ) => {
        try {
            await organizationService.requestJoinWorkspace(
                workspaceId,
                userId,
                organizationId
            );
            setAvailableWorkspaces((prev) =>
                prev.map((ws) =>
                    ws.id === workspaceId ? { ...ws, join_request_status: "PENDING" } : ws
                )
            );

            const workspace = availableWorkspaces.find((ws) => ws.id === workspaceId);
            setPendingRequests((prev) => [
                ...prev,
                { ...workspace, join_request_details: { userId, status: "PENDING" } },
            ]);
            showToast.success("Join request sent.");
        } catch (error: any) {
            showToast.error("Failed to send join request.");
        }
    };

    const handleWithdrawRequest = async (workspaceId: number) => {
        try {
            setAvailableWorkspaces((prev) =>
                prev.map((ws) =>
                    ws.id === workspaceId ? { ...ws, join_request_status: "NOT_REQUESTED" } : ws
                )
            );
            setPendingRequests((prev) => prev.filter((req) => req.id !== workspaceId));
            showToast.success("Join request withdrawn.");
        } catch (error: any) {
            showToast.error("Failed to withdraw request.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center relative">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Join Workspace
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Request to join existing workspaces in your organization
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                    {!user || !userStatus ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-lg font-bold text-slate-900 mb-2">
                                Not Authenticated
                            </h2>
                            <p className="text-slate-500">Please log in to join a workspace.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {pendingRequests.length > 0 && (
                                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center shadow-sm">
                                    <Clock className="w-5 h-5 text-amber-600 mr-3 shrink-0" />
                                    <span className="text-sm text-amber-800 font-medium">
                                        You have {pendingRequests.length} pending request
                                        {pendingRequests.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4">
                                {availableWorkspaces.length > 0 ? (
                                    availableWorkspaces.map((workspace) => (
                                        <div
                                            key={workspace.id}
                                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-blue-200 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <Users className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900 mb-0.5">
                                                            {workspace.name}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                                ID: {workspace.organization}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Users className="w-3.5 h-3.5 mr-1" />
                                                                {workspace.member_count} member
                                                                {workspace.member_count !== 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    {pendingRequests.some((req) => req.id === workspace.id) ? (
                                                        <button
                                                            onClick={() => handleWithdrawRequest(workspace.id)}
                                                            className="bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-semibold shadow-sm"
                                                        >
                                                            Withdraw Request
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                user.id &&
                                                                handleRequestJoin(
                                                                    workspace.id,
                                                                    user.id,
                                                                    workspace.organization
                                                                )
                                                            }
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg border border-transparent hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
                                                        >
                                                            Request to Join
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                                            No Available Workspaces
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            There are no workspaces available to join at the moment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinWorkspaceModal;
