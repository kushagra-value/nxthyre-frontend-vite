import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { organizationService, MyWorkspace } from "../../../services/organizationService";
import { showToast } from "../../../utils/toast";

interface EditWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    workspace: MyWorkspace | null;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    workspace,
}) => {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("Active");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (workspace && isOpen) {
            setName(workspace.name || "");
            setStatus(workspace.workspace_status || "Active");
            setWebsite(workspace.company_research_data?.website || "");
            setDescription(workspace.company_research_data?.company_overview || "");
            setLogo(workspace.company_research_data?.logo || ""); // Note: logo might not be mapped in frontend interface but backend supports it
        }
    }, [workspace, isOpen]);

    if (!isOpen || !workspace) return null;

    const handleSave = async () => {
        if (!name.trim()) {
            showToast.error("Workspace name is required");
            return;
        }

        setIsLoading(true);
        try {
            await organizationService.updateWorkspace(workspace.id, {
                name: name.trim(),
                status,
                company_data: {
                    website: website.trim(),
                    description: description.trim(),
                    logo: logo.trim()
                }
            });
            showToast.success("Workspace updated successfully!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Edit workspace error:", error);
            showToast.error(error.message || "Failed to update workspace");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center relative">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Edit Company
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                            >
                                <option value="Active">Active</option>
                                <option value="Paused">Paused</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website
                            </label>
                            <input
                                type="text"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Logo URL
                            </label>
                            <input
                                type="text"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 min-h-[100px] resize-y"
                                placeholder="Brief description of the company..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWorkspaceModal;
