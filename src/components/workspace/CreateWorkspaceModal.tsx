import React, { useState } from "react";
import { Users, Mail, Check, X, Plus } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { showToast } from "../../utils/toast";
import { useAuthContext } from "../../context/AuthContext";

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { userStatus } = useAuthContext();
    const [step, setStep] = useState(1);
    const [workspaceName, setWorkspaceName] = useState("");
    const [inviteEmails, setInviteEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(true);

    if (!isOpen) return null;

    const handleNext = () => {
        if (!workspaceName.trim()) {
            setError("Workspace title required");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleAddEmail = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addEmail();
        }
    };

    const addEmail = () => {
        const email = currentEmail.trim();
        if (!email) return;

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (inviteEmails.includes(email)) {
            setError("Email already added");
            return;
        }

        setInviteEmails((prev) => [...prev, email]);
        setCurrentEmail("");
        setError("");
    };

    const removeEmail = (emailToRemove: string) => {
        setInviteEmails((prev) => prev.filter((email) => email !== emailToRemove));
    };

    const handleSendInvites = async () => {
        if (!userStatus?.organization?.id) {
            showToast.error("You must be part of an organization to create a workspace");
            return;
        }

        setIsLoading(true);
        try {
            const organizationId = userStatus.organization.id;
            const createResponse = await organizationService.createWorkspace(
                organizationId,
                workspaceName
            );
            showToast.success("Workspace created successfully!");

            if (inviteEmails.length > 0) {
                await organizationService.sendWorkspaceInvites(
                    createResponse.id,
                    inviteEmails
                );
                showToast.info(
                    `Invites sent to ${inviteEmails.length} email${inviteEmails.length > 1 ? "s" : ""
                    }`
                );
            }

            setSuccess(true);
            setStep(3);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Create workspace error:", error);
            showToast.error(error.message || "Failed to create workspace");
            setSuccess(false);
            setStep(3);
        } finally {
            setIsLoading(false);
        }
    };

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const resetAndClose = () => {
        setStep(1);
        setWorkspaceName("");
        setInviteEmails([]);
        setCurrentEmail("");
        setError("");
        setSuccess(true);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center relative">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Create Workspace
                    </h2>
                    <button
                        onClick={resetAndClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="mb-8">
                        <div className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                1
                            </div>
                            <div
                                className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                            ></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                2
                            </div>
                            <div
                                className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                            ></div>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                3
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-sm text-gray-600">Details</span>
                            <span className="text-sm text-gray-600">Invite</span>
                            <span className="text-sm text-gray-600">Complete</span>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="bg-white p-2">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Create Your Workspace
                                </h2>
                                <p className="text-gray-600">
                                    Give your workspace a name that represents your team
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Workspace Name
                                    </label>
                                    <input
                                        type="text"
                                        value={workspaceName}
                                        onChange={(e) => {
                                            setWorkspaceName(e.target.value);
                                            setError("");
                                        }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 ${error ? "border-red-500" : "border-slate-300"
                                            }`}
                                        placeholder="e.g., Marketing Team, Engineering, HR Department"
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <X className="w-4 h-4 mr-1" />
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        onClick={resetAndClose}
                                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors font-semibold shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white p-2">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-blue-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Invite Team Members
                                </h2>
                                <p className="text-gray-600">
                                    Add team members to "{workspaceName}" workspace
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Addresses
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <input
                                                type="email"
                                                value={currentEmail}
                                                onChange={(e) => {
                                                    setCurrentEmail(e.target.value);
                                                    setError("");
                                                }}
                                                onKeyDown={handleAddEmail}
                                                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 ${error ? "border-red-500" : "border-slate-300"
                                                    }`}
                                                placeholder="Enter email address and press Enter"
                                            />
                                            <button
                                                onClick={addEmail}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {error && (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <X className="w-4 h-4 mr-1" />
                                                {error}
                                            </p>
                                        )}
                                    </div>

                                    {inviteEmails.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {inviteEmails.map((email, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-200"
                                                >
                                                    {email}
                                                    <button
                                                        onClick={() => removeEmail(email)}
                                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-colors font-semibold shadow-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSendInvites}
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating...
                                            </div>
                                        ) : (
                                            "Create Workspace"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white p-2">
                            <div className="text-center mb-6">
                                <div
                                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${success ? "bg-green-100" : "bg-red-100"
                                        }`}
                                >
                                    {success ? (
                                        <Check className="w-10 h-10 text-green-600" />
                                    ) : (
                                        <X className="w-10 h-10 text-red-600" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    {success
                                        ? `Workspace "${workspaceName}" Created!`
                                        : "Failed to Create Workspace"}
                                </h2>
                                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                                    {success
                                        ? `Your workspace "${workspaceName}" has been set up successfully. You can switch to it from the top navigation.`
                                        : "There was an issue creating your workspace. Please try again or contact support."}
                                </p>
                            </div>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={resetAndClose}
                                    className="bg-blue-600 text-white py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
