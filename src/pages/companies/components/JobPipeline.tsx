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

  // Fetch full candidate details from the application endpoint or candidates endpoint
  const fetchCandidateDetails = useCallback(async (candidateItem: any) => {
    setLoadingCandidate(true);
    try {
      if (candidateItem.candidate?.application_type === "inbound" || candidateItem.application_type === "inbound") {
        // Fetch full profile from candidates UUID endpoint since inbound candidates have no job application yet
        const response = await apiClient.get(
          `/candidates/${candidateItem.candidate.id}/?job_id=${jobId}`,
        );
        const inboundCand = response.data.candidate || {};
        // Inject properties so JobCandidateProfile handles it correctly without a pipeline
        const enrichedData = {
          ...response.data,
          id: null,
          application_type: "inbound", // to keep it trackable
          contextual_details: {
            job_score_obj: inboundCand.job_score || {},
          },
          candidate: {
            ...inboundCand,
            application_type: "inbound", // this triggers the "Candidate Status" UI block
            current_salary_lpa: inboundCand.current_salary,
            expected_ctc: inboundCand.expected_ctc,
            notice_period_summary: inboundCand.notice_period_days != null ? `${inboundCand.notice_period_days} Days` : undefined
          },
        };
        setSelectedCandidate(enrichedData);
      } else {
        // Normal pipeline flow
        const response = await apiClient.get(
          `/jobs/applications/${candidateItem.id}/`,
        );
        setSelectedCandidate(response.data);

        // Log the candidate response from /candidates/Uuid API endpoint
        if (response.data?.candidate?.id) {
          const canRes = await apiClient.get(
            `/candidates/${response.data.candidate.id}/?job_id=${jobId}`,
          );
          console.log("Candidate Uuid API response:", canRes.data);
        }
      }
    } catch (error) {
      console.error("Error fetching candidate details:", error);
      setSelectedCandidate(null);
    } finally {
      setLoadingCandidate(false);
    }
  }, [jobId]);

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
    // Fetch full details using the application object
    fetchCandidateDetails(candidateListItem);
  };

  const handleNavigatePrev = () => {
    if (currentCandidateIndex > 0 && candidateList.length > 0) {
      const prevIndex = currentCandidateIndex - 1;
      const prevCandidate = candidateList[prevIndex];
      setCurrentCandidateIndex(prevIndex);
      fetchCandidateDetails(prevCandidate);
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
      fetchCandidateDetails(nextCandidate);
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
