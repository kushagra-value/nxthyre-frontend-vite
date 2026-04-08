import { useState, useCallback, useEffect } from "react";
import JobPipelineDashboard, { Stage } from "./JobPipelineDashboard";
import JobCandidateProfile from "./JobCandidateProfile";
import apiClient from "../../../services/api";

interface JobPipelineProps {
  jobId: number | null;
  workspaceId: number;
  workspaces: { id: number; name: string }[];
  onJobUpdated?: () => void;
}

export default function JobPipeline({
  jobId,
  workspaceId,
  workspaces,
  onJobUpdated,
}: JobPipelineProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  // Track candidate list for pagination
  const [candidateList, setCandidateList] = useState<any[]>([]);
  const [currentCandidateIndex, setCurrentCandidateIndex] =
    useState<number>(-1);

  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    if (selectedCandidate) {
      (window as any).__selectedCandidateName =
        selectedCandidate.candidate?.full_name || "Profile";
    } else {
      delete (window as any).__selectedCandidateName;
    }
    window.dispatchEvent(new CustomEvent("header-update"));
  }, [selectedCandidate]);

  useEffect(() => {
    const handleBreadcrumbNavigate = (e: any) => {
      if (
        e.detail?.level === "job" ||
        e.detail?.level === "workspace" ||
        e.detail?.level === "companies"
      ) {
        setSelectedCandidate(null);
      }
    };
    window.addEventListener("breadcrumb-navigate", handleBreadcrumbNavigate);
    return () =>
      window.removeEventListener(
        "breadcrumb-navigate",
        handleBreadcrumbNavigate,
      );
  }, []);

  // Fetch Stages
  const fetchStages = useCallback(async (jId: number) => {
    try {
      const response = await apiClient.get(
        `/jobs/applications/stages/?job_id=${jId}`,
      );
      const data: Stage[] = response.data;
      const sorted = data.sort((a, b) => a.sort_order - b.sort_order);
      setStages(sorted);
    } catch (error) {
      console.error("Error fetching stages:", error);
      setStages([]);
    }
  }, []);

  useEffect(() => {
    if (jobId != null) {
      fetchStages(jobId);
    }
    // Reset candidate selection when jobId changes
    setSelectedCandidate(null);
    setCandidateList([]);
    setCurrentCandidateIndex(-1);
  }, [jobId, fetchStages]);

  // Fetch full candidate details from the application endpoint
  const fetchCandidateDetails = useCallback(async (applicationId: number) => {
    setLoadingCandidate(true);
    try {
      const response = await apiClient.get(
        `/jobs/applications/${applicationId}/`,
      );
      setSelectedCandidate(response.data);

      // Log the candidate response from /candidates/Uuid API endpoint
      if (response.data?.candidate?.id) {
        const canRes = await apiClient.get(
          `/candidates/${response.data.candidate.id}/${jobId}`,
        );
        console.log("Candidate Uuid API response:", canRes.data);
      }
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      setSelectedCandidate(null);
    } finally {
      setLoadingCandidate(false);
    }
  }, []);

  const handleSelectCandidate = (
    candidateListItem: any,
    allCandidates?: any[],
    index?: number,
  ) => {
    // Store the candidate list and index for pagination
    if (allCandidates) {
      setCandidateList(allCandidates);
    }
    if (index !== undefined) {
      setCurrentCandidateIndex(index);
    }
    // Fetch full details using the application id
    fetchCandidateDetails(candidateListItem.id);
  };

  const handleNavigatePrev = () => {
    if (currentCandidateIndex > 0 && candidateList.length > 0) {
      const prevIndex = currentCandidateIndex - 1;
      const prevCandidate = candidateList[prevIndex];
      setCurrentCandidateIndex(prevIndex);
      fetchCandidateDetails(prevCandidate.id);
    }
  };

  const handleNavigateNext = () => {
    if (
      currentCandidateIndex < candidateList.length - 1 &&
      candidateList.length > 0
    ) {
      const nextIndex = currentCandidateIndex + 1;
      const nextCandidate = candidateList[nextIndex];
      setCurrentCandidateIndex(nextIndex);
      fetchCandidateDetails(nextCandidate.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F5F7] overflow-hidden">
      {selectedCandidate ? (
        <JobCandidateProfile
          candidate={selectedCandidate}
          jobId={jobId}
          stages={stages}
          goBack={() => setSelectedCandidate(null)}
          loading={loadingCandidate}
          onNavigatePrev={
            currentCandidateIndex > 0 ? handleNavigatePrev : undefined
          }
          onNavigateNext={
            currentCandidateIndex < candidateList.length - 1
              ? handleNavigateNext
              : undefined
          }
          currentIndex={currentCandidateIndex}
          totalCandidates={candidateList.length}
        />
      ) : (
        <JobPipelineDashboard
          jobId={jobId}
          workspaceId={workspaceId}
          workspaces={workspaces}
          onJobUpdated={onJobUpdated}
          onSelectCandidate={handleSelectCandidate}
          externalStages={stages}
          onRefreshStages={() => jobId && fetchStages(jobId)}
        />
      )}
    </div>
  );
}
