import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Building2,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  superAdminApi,
  Organization,
  OrganizationJobsResponse,
} from "../../services/superAdminApi";

export default function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedOrg, setSelectedOrg] =
    useState<OrganizationJobsResponse | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, [currentPage]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      // Added: try/catch
      const { data, error } = await superAdminApi.organizations.list(
        currentPage
      );
      if (error) {
        console.error("Error loading organizations:", error);
        return;
      }
      if (data) {
        // Fixed: Handle direct array OR {results: [...]}
        const orgList = Array.isArray(data) ? data : data.results || [];
        setOrganizations(orgList);
        setTotalCount(data?.count || orgList.length);
        setHasNext(!!data?.next);
        setHasPrevious(!!data?.previous);
        console.log("Loaded orgs:", orgList); // Debug
      }
    } catch (err) {
      console.error("Unexpected error loading organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (org: Organization) => {
    setLoadingJobs(true);
    try {
      const { data, error } = await superAdminApi.organizations.getJobs({
        org_id: org.id,
      });
      if (error) {
        console.error("Error loading org jobs:", error);
        return;
      }
      if (data) {
        setSelectedOrg(data);
      }
    } catch (err) {
      console.error("Unexpected error loading org jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Add useMemo for filteredOrganizations
  const filteredOrganizations = useMemo(() => {
    return (organizations || []).filter(
      (org) =>
        (org.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.domain || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizations, searchTerm]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalCandidates = (job: OrganizationJobsResponse["jobs"][0]) => {
    // Fixed: Guard reduce
    return (job.stages || []).reduce(
      (sum, stage) => sum + (stage.candidate_count || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizations</h1>
        <p className="text-gray-600">
          Manage all organizations on the platform
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by organization name or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Workspaces
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {org.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {org.domain}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Users size={16} className="text-gray-400" />
                      {org.member_count}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Briefcase size={16} className="text-gray-400" />
                      {org.workspace_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(org)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Jobs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredOrganizations.length} of {totalCount} organizations
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!hasPrevious}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNext}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedOrg.organization.name}
                </h2>
                {selectedOrg.organization.admin && (
                  <p className="text-sm text-gray-600 mt-1">
                    Admin: {selectedOrg.organization.admin.name} (
                    {selectedOrg.organization.admin.email})
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Job Posts ({selectedOrg.total_jobs})
                </h3>
              </div>

              {loadingJobs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedOrg.jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No job posts found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedOrg.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>Posted by: {job.posted_by_name}</span>
                            <span>Workspace: {job.workspace_name}</span>
                            {job.department_name && (
                              <span>Department: {job.department_name}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.location.map((loc, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {loc}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {job.work_approach}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {job.seniority}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {job.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {job.visibility}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            Pipeline Stages
                          </h5>
                          <span className="text-sm text-gray-600">
                            Total Candidates:{" "}
                            <span className="font-semibold">
                              {getTotalCandidates(job)}
                            </span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {job.stages.map((stage) => (
                            <div
                              key={stage.id}
                              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4"
                            >
                              <div className="text-xs font-medium text-blue-900 mb-2">
                                {stage.name}
                              </div>
                              <div className="text-2xl font-bold text-blue-700">
                                {stage.candidate_count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(job.experience_min_years !== null ||
                        job.salary_min !== null) && (
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
                          {job.experience_min_years !== null && (
                            <span>
                              Experience: {job.experience_min_years}-
                              {job.experience_max_years} years
                            </span>
                          )}
                          {job.salary_min !== null &&
                            !job.is_salary_confidential && (
                              <span>
                                Salary: ${job.salary_min?.toLocaleString()} - $
                                {job.salary_max?.toLocaleString()}
                              </span>
                            )}
                        </div>
                      )}

                      <div className="flex gap-4 text-xs text-gray-500 pt-3 border-t border-gray-200 mt-3">
                        <span>Created: {formatDate(job.created_at)}</span>
                        <span>Updated: {formatDate(job.updated_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
