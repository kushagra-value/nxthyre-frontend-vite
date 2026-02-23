import React, { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { useAuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";

interface JoinRequest {
    id: number;
    workspaceId: number;
    workspaceName: string;
    requesterEmail: string;
    createdAt: string;
}

interface PendingRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const PendingRequestsModal: React.FC<PendingRequestsModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { userStatus } = useAuthContext();
    const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userStatus || !isOpen) return;

            try {
                setLoading(true);
                const requests = await organizationService.getPendingJoinRequests();
                const formattedRequests = requests.map((req: any) => ({
                    id: req.id,
                    workspaceId: req.workspace_id,
                    workspaceName: req.workspace_name,
                    requesterEmail: req.recruiter.email,
                    createdAt: req.created_at,
                }));
                setPendingRequests(formattedRequests);
            } catch (error) {
                showToast.error("Failed to load pending requests");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [userStatus, isOpen]);

    const handleApproveRequest = async (workspaceId: number, requestId: number) => {
        if (!userStatus?.organization?.id) return;
        try {
            await organizationService.manageJoinRequest(
                userStatus.organization.id,
                workspaceId,
                requestId,
                "approve"
            );
            showToast.success("Request approved");
            setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
            if (onSuccess) onSuccess();
        } catch (error) {
            showToast.error("Failed to approve request");
        }
    };

    const handleRejectRequest = async (workspaceId: number, requestId: number) => {
        if (!userStatus?.organization?.id) return;
        try {
            await organizationService.manageJoinRequest(
                userStatus.organization.id,
                workspaceId,
                requestId,
                "reject"
            );
            showToast.success("Request rejected");
            setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
            if (onSuccess) onSuccess();
        } catch (error) {
            showToast.error("Failed to reject request");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center relative">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Manage Pending Requests
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Review users requesting to join your workspaces
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
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                No Pending Requests
                            </h3>
                            <p className="text-sm text-slate-500">
                                You're all caught up! No one is waiting to join your workspaces.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold uppercase shrink-0">
                                            {request.requesterEmail.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm mb-0.5">
                                                {request.requesterEmail}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                <span className="font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                                                    {request.workspaceName}
                                                </span>
                                                Requested on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 shrink-0">
                                        <button
                                            onClick={() =>
                                                handleApproveRequest(request.workspaceId, request.id)
                                            }
                                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-sm font-bold shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRejectRequest(request.workspaceId, request.id)
                                            }
                                            className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all text-sm font-bold shadow-sm"
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
        </div>
    );
};

export default PendingRequestsModal;
