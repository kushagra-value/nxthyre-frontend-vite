import { useState, useCallback, useEffect } from "react";
import JobPipelineDashboard from "./JobPipelineDashboard";
import JobCandidateProfile from "./JobCandidateProfile";
import apiClient from "../../../services/api";

interface JobPipelineProps {
    jobId: number | null;
    workspaceId: number;
    workspaces: { id: number; name: string }[];
    onJobUpdated?: () => void;
}

export default function JobPipeline({ jobId, workspaceId, workspaces, onJobUpdated }: JobPipelineProps) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [loadingCandidate, setLoadingCandidate] = useState(false);

    useEffect(() => {
        if (selectedCandidate) {
            (window as any).__selectedCandidateName = selectedCandidate.candidate?.full_name || 'Profile';
        } else {
            delete (window as any).__selectedCandidateName;
        }
        window.dispatchEvent(new CustomEvent('header-update'));
    }, [selectedCandidate]);

    useEffect(() => {
        const handleBreadcrumbNavigate = (e: any) => {
            if (e.detail?.level === 'job' || e.detail?.level === 'workspace' || e.detail?.level === 'companies') {
                setSelectedCandidate(null);
            }
        };
        window.addEventListener('breadcrumb-navigate', handleBreadcrumbNavigate);
        return () => window.removeEventListener('breadcrumb-navigate', handleBreadcrumbNavigate);
    }, []);

    // Fetch full candidate details from the application endpoint
    const fetchCandidateDetails = useCallback(async (applicationId: number) => {
        setLoadingCandidate(true);
        try {
            const response = await apiClient.get(`/jobs/applications/${applicationId}/`);
            setSelectedCandidate(response.data);
        } catch (error) {
            console.error("Error fetching candidate details:", error);
            setSelectedCandidate(null);
        } finally {
            setLoadingCandidate(false);
        }
    }, []);

    const handleSelectCandidate = (candidateListItem: any) => {
        // Fetch full details using the application id
        fetchCandidateDetails(candidateListItem.id);
    };

    if (!jobId) {
    }

    return (
        <div className="flex flex-col h-full bg-[#F3F5F7] overflow-hidden">
            {selectedCandidate ? (
                <JobCandidateProfile
                    candidate={selectedCandidate}
                    jobId={jobId}
                    goBack={() => setSelectedCandidate(null)}
                    loading={loadingCandidate}
                />
            ) : (
                <JobPipelineDashboard
                    jobId={jobId}
                    workspaceId={workspaceId}
                    workspaces={workspaces}
                    onJobUpdated={onJobUpdated}
                    onSelectCandidate={handleSelectCandidate}
                />
            )}
        </div>
    );
}
