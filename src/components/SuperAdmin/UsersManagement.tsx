import { useState, useEffect, useMemo } from "react";
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
  Plus,
  AlertCircle,
  Minus,
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

  // Credits Management state (integrated into modal)
  const [creditsAmount, setCreditsAmount] = useState("");
  const [creditsNotes, setCreditsNotes] = useState("");
  const [creditsOperationType, setCreditsOperationType] = useState<
    "add" | "subtract"
  >("add");
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsMessage, setCreditsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
        // Fixed: Handle direct array OR paginated {results: [...]}
        const userList = Array.isArray(data) ? data : data.results || [];
        setUsers(userList); // Now always array
        setTotalCount(data?.count || userList.length); // Derive count if missing
        setHasNext(!!data?.next); // False if no pagination
        setHasPrevious(!!data?.previous); // False if no pagination
        console.log("Loaded users:", userList); // Debug: Remove after test
      }
    } catch (err) {
      console.error("Unexpected error loading users:", err);
      setUsers([]); // Fallback to empty
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

  const handleCreditsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!creditsAmount || !creditsNotes) {
      setCreditsMessage({
        type: "error",
        text: "Amount and notes are required",
      });
      return;
    }

    const numAmount = parseInt(creditsAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setCreditsMessage({
        type: "error",
        text: "Amount must be a positive number",
      });
      return;
    }

    setCreditsLoading(true);
    setCreditsMessage(null);

    const finalAmount =
      creditsOperationType === "subtract" ? -numAmount : numAmount;

    const { data, error } = await superAdminApi.credits.adjust(
      selectedUser.id, // Use recruiter_id from selected user
      finalAmount,
      creditsNotes
    );

    if (error) {
      setCreditsMessage({ type: "error", text: error });
    } else if (data) {
      setCreditsMessage({
        type: "success",
        text: `Successfully ${
          creditsOperationType === "add" ? "added" : "subtracted"
        } ${numAmount} credits. New balance: ${data.new_balance}`,
      });

      // Update selectedUser and table with new balance
      const updatedUser = { ...selectedUser, credit_balance: data.new_balance };
      setSelectedUser(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );

      // Reset form
      setCreditsAmount("");
      setCreditsNotes("");
    }

    setCreditsLoading(false);
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    setCreditsMessage(null); // Clear previous messages
    await loadUserJobs(user.email);
  };

  // Improved: useMemo for filter (avoids re-compute on every render)
  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) => {
      user.email &&
        user.full_name &&
        (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [users, searchTerm]);

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
                        Manage
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

              {/* Integrated Credits Management Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Manage Credits
                </h3>
                {creditsMessage && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg mb-4 ${
                      creditsMessage.type === "success"
                        ? "bg-blue-50 text-blue-800 border border-blue-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{creditsMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleCreditsSubmit} className="space-y-4">
                  <div>
                    {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operation Type
                    </label> */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCreditsOperationType("add")}
                        className={`hidden items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          creditsOperationType === "add"
                            ? "bg-green-100 text-green-700 border-2 border-green-500"
                            : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <Plus size={20} />
                        Adjust Credits
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreditsOperationType("subtract")}
                        className={`hidden items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          creditsOperationType === "subtract"
                            ? "bg-red-100 text-red-700 border-2 border-red-500"
                            : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <Minus size={20} />
                        Subtract Credits
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={creditsAmount}
                      onChange={(e) => setCreditsAmount(e.target.value)}
                      placeholder="Enter amount of credits to be allocated"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={creditsNotes}
                      onChange={(e) => setCreditsNotes(e.target.value)}
                      placeholder="Reason for adjustment (max 500 characters)"
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1 text-right">
                      {creditsNotes.length}/500 characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creditsLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                      creditsLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : creditsOperationType === "add"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {creditsLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      `${
                        creditsOperationType === "add" ? "Add" : "Subtract"
                      } Credits`
                    )}
                  </button>
                </form>
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
