import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import candidateService from "../../services/candidateService"; // adjust path

const ShareCandidateListPage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!workspaceId) return;
      const data = await candidateService.getPublicPipelineApplications(
        Number(workspaceId),
      );
      setApplications(data);
      setLoading(false);
    };

    fetchData();
  }, [workspaceId]);

  if (loading) return <div className="p-8">Loading pipeline...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Public Pipeline Candidates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <div
            key={app.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            {/* Render candidate + job_score etc. using the data structure you shared */}
            <h3 className="font-semibold">{app.candidate.full_name}</h3>
            <p className="text-sm text-gray-600">{app.candidate.headline}</p>
            <p className="text-xs text-gray-500 mt-2">
              {app.job.title} • {app.candidate_match_score?.label || "Match"}
            </p>
            {/* Add more fields as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareCandidateListPage;
