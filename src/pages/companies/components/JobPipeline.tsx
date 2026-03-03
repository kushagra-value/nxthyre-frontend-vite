import { useState } from "react";
import JobPipelineDashboard from "./JobPipelineDashboard";
import JobCandidateProfile from "./JobCandidateProfile";

export default function JobPipeline({ jobId }: { jobId: number | null }) {
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
                    onSelectCandidate={(c: any) => setSelectedCandidate(c)}
                />
            )}
        </div>
    );
}
