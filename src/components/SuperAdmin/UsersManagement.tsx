import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  Mail,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { superAdminApi, User, Job } from "../../services/superAdminApi";

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Added: Wrap in try/catch for better error handling
      const { data, error } = await superAdminApi.users.list(currentPage);
      if (error) {
        console.error("Error loading users:", error); // Log errors
        // Optionally: toast.error(`Failed to load users: ${error}`);
        return;
      }
      if (data) {
        // Fixed: Always ensure array, even if data.results is undefined/null
        setUsers(Array.isArray(data.results) ? data.results : []);
        setTotalCount(data.count || 0);
        setHasNext(!!data.next);
        setHasPrevious(!!data.previous);
      }
    } catch (err) {
      console.error("Unexpected error loading users:", err);
      // Optionally: toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadUserJobs = async (email: string) => {
    setLoadingJobs(true);
    try {
      const { data, error } = await superAdminApi.organizations.getJobs({
        email_id: email,
      });
      if (error) {
        console.error("Error loading user jobs:", error);
        return;
      }
      // Fixed: Ensure array for jobs
      setUserJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (err) {
      console.error("Unexpected error loading user jobs:", err);
      setUserJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await superAdminApi.users.updateStatus(
        userId,
        !currentStatus
      );
      if (error) {
        console.error("Error toggling status:", error);
        alert(`Error: ${error}`); // Or use toast
        return;
      }
      if (data) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? data : u))
        ); // Use functional update for safety
        if (selectedUser?.id === userId) {
          setSelectedUser(data);
        }
      }
    } catch (err) {
      console.error("Unexpected error toggling status:", err);
      alert("Failed to update status");
    }
  };

  const handleStaffToggle = async (
    userId: string,
    currentStaffStatus: boolean
  ) => {
    try {
      const { data, error } = await superAdminApi.users.update(userId, {
        is_staff: !currentStaffStatus,
      });
      if (error) {
        console.error("Error toggling staff:", error);
        alert(`Error: ${error}`);
        return;
      }
      if (data) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? data : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser(data);
        }
      }
    } catch (err) {
      console.error("Unexpected error toggling staff:", err);
      alert("Failed to update staff access");
    }
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    await loadUserJobs(user.email);
  };

  // Fixed: Guard against undefined users with fallback
  const filteredUsers = (users || []).filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalCandidates = (job: Job) => {
    // Fixed: Guard reduce if stages undefined
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">Manage all users and their access</p>
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
              placeholder="Search by email or name..."
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
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {user.full_name}
                        {user.is_staff && (
                          <Shield
                            size={14}
                            className="text-blue-600"
                            title="Staff User"
                          />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.organization_name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {user.credit_balance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.last_login)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() =>
                          handleStatusToggle(user.id, user.is_active)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={user.is_active ? "Block User" : "Unblock User"}
                      >
                        {user.is_active ? (
                          <UserX size={18} />
                        ) : (
                          <UserCheck size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {totalCount} users
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <p className="mt-1 text-gray-900">{selectedUser.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <p className="mt-1 text-gray-900">{selectedUser.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Building2 size={16} />
                    Organization
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedUser.organization_name || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Credits
                  </label>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {selectedUser.credit_balance}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    Last Login
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(selectedUser.last_login)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    Created At
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    handleStatusToggle(selectedUser.id, selectedUser.is_active)
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedUser.is_active
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {selectedUser.is_active ? "Block User" : "Unblock User"}
                </button>
                <button
                  onClick={() =>
                    handleStaffToggle(selectedUser.id, selectedUser.is_staff)
                  }
                  className="px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  {selectedUser.is_staff
                    ? "Remove Staff Access"
                    : "Grant Staff Access"}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Posts
                </h3>
                {loadingJobs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : userJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No job posts found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {job.workspace_name} • {job.location.join(", ")}
                            </p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {job.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <span>
                            Total Candidates: {getTotalCandidates(job)}
                          </span>
                          <span>Stages: {job.stages.length}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {job.stages.map((stage) => (
                            <div
                              key={stage.id}
                              className="bg-gray-50 rounded-lg p-3"
                            >
                              <div className="text-xs text-gray-600 mb-1">
                                {stage.name}
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {stage.candidate_count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
