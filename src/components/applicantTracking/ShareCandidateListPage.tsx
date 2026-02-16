import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import candidateService from "../../services/candidateService"; // adjust path

const ShareCandidateListPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔍 Public page loaded. Workspace ID:", workspaceId); // Debug log

      setLoading(true);
      setError(null);

      if (!workspaceId) {
        console.error("❌ No workspaceId in URL params");
        setError("Missing workspace ID in URL");
        setLoading(false);
        return;
      }

      try {
        const data = await candidateService.getPublicPipelineApplications(
          Number(workspaceId),
        );
        console.log("✅ Fetched applications:", data.length, "items"); // Debug
        setApplications(data);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError("Failed to load pipeline. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading public pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p className="text-xl font-medium">{error}</p>
          <p className="text-sm mt-2">
            URL should be: /public/workspaces/YOUR_ID/applications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Public Pipeline Candidates
        </h1>
        <p className="text-gray-600 mb-8">
          Shared from workspace {workspaceId}
        </p>

        {applications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No candidates in this pipeline yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {applications.map((app) => {
              const match = app.job_score?.candidate_match_score || {};
              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 font-bold text-xl flex items-center justify-center rounded-xl flex-shrink-0">
                      {app.candidate.avatar ||
                        app.candidate.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {app.candidate.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.candidate.headline}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {app.candidate.location} •{" "}
                        {app.candidate.experience_years}
                      </p>
                    </div>
                  </div>

                  {/* Job & Match */}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          {app.job.title}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          match.label?.includes("Strong")
                            ? "bg-green-100 text-green-700"
                            : match.label?.includes("Good")
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {match.label} • {match.score}
                      </div>
                    </div>

                    {/* Quick Skills */}
                    {app.job_score?.quick_fit_summary && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {app.job_score.quick_fit_summary
                          .slice(0, 4)
                          .map((skill: any, idx: number) => (
                            <div
                              key={idx}
                              className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                                skill.color === "green"
                                  ? "bg-green-50 text-green-700"
                                  : skill.color === "yellow"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {skill.badge}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 p-4 text-[11px] text-gray-500 flex items-center justify-between">
                    <span>{app.time_added}</span>
                    <span className="capitalize">{app.stage_slug}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCandidateListPage;
