import { useState } from "react";
import JobPipelineDashboard from "./JobPipelineDashboard";
import JobCandidateProfile from "./JobCandidateProfile";

interface JobPipelineProps {
    jobId: number | null;
    workspaceId: number;
    workspaces: { id: number; name: string }[];
    onJobUpdated?: () => void;
}

export default function JobPipeline({ jobId, workspaceId, workspaces, onJobUpdated }: JobPipelineProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    if (!jobId) {
    }

    return (
        <div className="flex flex-col h-full bg-[#F3F5F7] overflow-hidden">

            {selectedCandidate ? (
                <JobCandidateProfile
                    candidate={selectedCandidate}
                    goBack={() => setSelectedCandidate(null)}
                />
            ) : (
                <JobPipelineDashboard
                    jobId={jobId}
                    workspaceId={workspaceId}
                    workspaces={workspaces}
                    onJobUpdated={onJobUpdated}
                    onSelectCandidate={(c: any) => setSelectedCandidate(c)}
                />
            )}
        </div>
    );
}
