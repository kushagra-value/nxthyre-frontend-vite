import React, { useState } from "react";
import { ArrowLeft, Building2, Search, Check, X } from "lucide-react";
import { organizationService } from "../../services/organizationService";
import { authService } from "../../services/authService";
import { showToast } from "../../utils/toast";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface CreateOrganizationProps {
  onNavigate: (flow: string, data?: any) => void;
  onComplete?: (user: any) => void;
}

const CreateOrganization: React.FC<CreateOrganizationProps> = ({
  onNavigate,
  onComplete,
}) => {
  console.log("Rendering CreateOrganizationnnnnnnnnnnnnn");
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    organizationName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
  });
  const [similarOrgs, setSimilarOrgs] = useState<any[]>([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [userOnboarded, setUserOnboarded] = useState(false);

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media",
    "Real Estate",
    "Other",
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, organizationName: value }));
    setErrors((prev) => ({ ...prev, organizationName: "" }));
    setShowSimilar(false);
    setSimilarOrgs([]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.industry) {
      newErrors.industry = "Industry is required";
    }
    if (!formData.companySize) {
      newErrors.companySize = "Company size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectExisting = (org: any) => {
    showToast.success(`Joined existing organization: ${org.name}`);
    if (onComplete) {
      onComplete(user);
    }
  };

  const handleCreateNew = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // try {
    //   const status = await organizationService.getOnboardingStatus();
    //   if (
    //     status.status === "ONBOARDED" ||
    //     status.status === "ORGANIZATION_EXISTS"
    //   ) {
    //     showToast.error("You are already part of an organization");
    //     setIsLoading(false);
    //     return;
    //   }

    //   const response = await organizationService.createOrganization(
    //     formData.organizationName
    //   );
    //   showToast.success("Organization created successfully!");

    //   const updatedUser = {
    //     ...user,
    //     organizationId: response.id.toString(),
    //   };

    //   if (onComplete) {
    //     onComplete(updatedUser);
    //   }
    //   onNavigate("workspaces-org");
    // } catch (error: any) {
    //   console.error("Create organization error:", error);
    //   setErrors({ general: error.message || "Failed to create organization" });
    //   showToast.error(error.message || "Failed to create organization");
    // } finally {
    //   setIsLoading(false);
    // }

    try {
      // Get user status from backend
      const userStatus = await authService.getUserStatus();
      setUserOnboarded(userStatus.is_onboarded);
      if (userStatus.is_onboarded) {
        console.log("User is already onboarded, redirecting to dashboard");
        toast.error("You are already onboarded.");
      } else {
        console.log(
          "User is not onboarded, proceeding with organization creation"
        );
        const response = await organizationService.createOrganization(
          formData.organizationName
        );
        showToast.success("Organization created successfully!");

        // setTimeout(() => authService.getUserStatus(), 1000); // Refresh user status after creation
        window.location.reload();

        const updatedUser = {
          ...user,
          organizationId: response.id.toString(),
        };

        if (onComplete) {
          onComplete(updatedUser);
        }
        onNavigate("workspaces-org");
      }
    } catch (error: any) {
      console.error("Create organization error:", error);
      setErrors({ general: error.message || "Failed to create organization" });
      showToast.error(error.message || "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmNew = () => {
    setShowSimilar(false);
    handleCreateNew();
  };

  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {userOnboarded && (
              <button
                onClick={handleGoToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              Create Organization
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Organization
            </h2>
            <p className="text-gray-600">
              Set up your organization to manage teams and workspaces
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.organizationName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your organization name"
                  autoFocus
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.organizationName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, industry: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.industry ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.industry}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size *
              </label>
              <select
                value={formData.companySize}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companySize: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.companySize ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select company size</option>
                {companySizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              {errors.companySize && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.companySize}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://www.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Brief description of your organization"
              />
            </div>

            {showSimilar && (
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h3 className="text-sm font-medium text-yellow-800 mb-3">
                  Are you sure it's not one of the following?
                </h3>
                <div className="space-y-2">
                  {similarOrgs.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-200"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {org.name}
                        </h4>
                        <p className="text-sm text-gray-600">@{org.domain}</p>
                      </div>
                      <button
                        onClick={() => handleSelectExisting(org)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Join This
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setShowSimilar(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmNew}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create New Anyway
                  </button>
                </div>
              </div>
            )}

            {!showSimilar && (
              <div className="flex space-x-4">
                <button
                  onClick={handleGoToDashboard}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNew}
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Organization"
                  )}
                </button>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Your organization will be created with you as the owner
                </li>
                <li>• You can create workspaces within this organization</li>
                <li>
                  • Team members with matching email domains can join
                  automatically
                </li>
                <li>
                  • You'll have full control over organization settings and
                  permissions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
