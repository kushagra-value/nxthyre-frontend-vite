import React, { useState } from "react";
import { ArrowLeft, Users, Mail, Copy, Check, X, Plus } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { showToast } from "../../utils/toast";
import { useAuthContext } from "../../context/AuthContext";

interface WorkspaceCreationProps {
  onNavigate: (flow: string, data?: any) => void;
}

const WorkspaceCreation: React.FC<WorkspaceCreationProps> = ({
  onNavigate,
}) => {
  const { userStatus } = useAuthContext();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink] = useState("https://nxthyre.com/invite/abc123def456");
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      showToast.success("Invite link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
      showToast.error("Failed to copy link");
    }
  };

  const handleSendInvites = async () => {
    if (!userStatus?.organization?.id) {
      showToast.error(
        "You must be part of an organization to create a workspace"
      );
      return;
    }

    setIsLoading(true);
    try {
      const organizationId = userStatus.organization.id;
      const createResponse = await organizationService.createWorkspace(organizationId, workspaceName);
      showToast.success("Workspace created successfully!");

      if (inviteEmails.length > 0) {
        await organizationService.sendWorkspaceInvites(createResponse.id, inviteEmails);
        showToast.info(
          `Invites sent to ${inviteEmails.length} email${
            inviteEmails.length > 1 ? "s" : ""
          }`
        );
      }

      onNavigate("workspaces-org");
    } catch (error: any) {
      console.error("Create workspace error:", error);
      showToast.error(error.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCancel = () => {
    onNavigate("workspaces-org");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() =>
                step === 1 ? onNavigate("workspaces-org") : setStep(1)
              }
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Create Workspace
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${
                step >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Workspace Details</span>
            <span className="text-sm text-gray-600">Invite Members</span>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    error ? "border-red-500" : "border-gray-300"
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

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        error ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address and press Enter"
                    />
                    <button
                      onClick={addEmail}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
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
                        className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(email)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or share invite link
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                      copiedLink
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvites}
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default WorkspaceCreation;
