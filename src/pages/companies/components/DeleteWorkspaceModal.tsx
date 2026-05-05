import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { organizationService, MyWorkspace } from "../../../services/organizationService";
import { showToast } from "../../../utils/toast";

interface DeleteWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    workspace: MyWorkspace | null;
}

const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    workspace,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !workspace) return null;

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await organizationService.deleteWorkspace(workspace.id);
            showToast.success("Workspace deleted successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Delete workspace error:", error);
            showToast.error(error.message || "Failed to delete workspace. You may not have Admin permissions.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center relative">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        Delete Company
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border border-red-100 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
                            <p>Are you sure you want to delete <strong>{workspace.name}</strong>? This action will permanently remove the company and all associated data.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteWorkspaceModal;
