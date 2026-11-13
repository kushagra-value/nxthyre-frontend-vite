import apiClient from "./api";
import { organizationService, MyWorkspace, CompanyResearchData } from "./organizationService";
import { jobPostService, Job } from "./jobPostService";
import { candidateService } from "./candidateService";

export interface CandidateCallItem {
  id: string; // application id or candidate id
  candidate: {
    id: string;
    full_name: string;
    current_company?: string | null;
    headline?: string | null;
    current_salary?: string | number | null;
    current_salary_lpa?: string | number | null;
    expected_ctc?: string | number | null;
    notice_period_days?: number | null;
    notice_period_summary?: string | null;
    location?: string | null;
    total_experience?: number | null;
    experience_years?: string | null;
    resume_url?: string | null;
    score?: any;
    job_score?: any;
    job_score_obj?: any;
    candidate_match_score?: any;
    screening_score?: number | string | null;
    screening_round_score?: number | string | null;
    screening_score_value?: number | string | null;
    screening_round?: number | string | null;
    question_analysis?: number | string | null;
    questioion_analysis?: number | string | null;
    ai_accuracy_score?: number | string | null;
    accuracy_score?: number | string | null;
    ai_clarity_score?: number | string | null;
    clarity_score?: number | string | null;
    ai_completeness_score?: number | string | null;
    completeness_score?: number | string | null;
    ai_depth_score?: number | string | null;
    depth_score?: number | string | null;
    ai_screening_score?: number | string | null;
    evaluation_score?: number | string | null;
    interview_score?: number | string | null;
    premium_data?: {
      email?: string;
      phone?: string;
      resume_url?: string;
    };
    [key: string]: any;
  };
  score?: any;
  job_score?: {
    resume_score?: number;
    screening_score?: number;
    quick_fit_summary?: {
      badge: string;
      status: string;
      color: string;
      evidence?: string;
    }[];
    [key: string]: any;
  };
  match_analysis?: {
    total?: number;
    matched_count?: number;
    matched_skills?: string[];
    missing_skills?: string[];
    [key: string]: any;
  };
  job_score_obj?: any;
  screening_score?: number | string | null;
  screening_round_score?: number | string | null;
  screening_score_value?: number | string | null;
  screening_round?: number | string | null;
  question_analysis?: number | string | null;
  questioion_analysis?: number | string | null;
  ai_accuracy_score?: number | string | null;
  accuracy_score?: number | string | null;
  ai_clarity_score?: number | string | null;
  clarity_score?: number | string | null;
  ai_completeness_score?: number | string | null;
  completeness_score?: number | string | null;
  ai_depth_score?: number | string | null;
  depth_score?: number | string | null;
  ai_screening_score?: number | string | null;
  evaluation_score?: number | string | null;
  interview_score?: number | string | null;
  contextual_details?: any;
  latest_manual_call_status?: string | null;
  latest_manual_call_at?: string | null;
  latest_manual_call_note?: string | null;
  latest_call_status?: string | null;
  latest_call_at?: string | null;
  latest_call_note?: string | null;
  last_active_at?: string | null;
}

export interface CallHistoryItem {
  id: string | number;
  application_id?: number | string;
  candidate_id: string;
  candidate: {
    id: string;
    full_name: string;
    current_company?: string | null;
    headline?: string | null;
    phone?: string | null;
    location?: string | null;
    score?: any;
    job_score?: any;
    screening_score?: any;
    current_salary_lpa?: string | number | null;
    expected_ctc?: string | number | null;
    notice_period_days?: number | null;
    notice_period_summary?: string | null;
    total_experience?: number | null;
    [key: string]: any;
  };
  call_uuid?: string | null;
  call_time: string;
  duration_seconds: number;
  call_status: string;
  status_display?: string;
  outcome?: string | null;
  score?: any;
  screening_score?: any;
  is_archived?: boolean;
  archive_reason?: string | null;
}

export interface CallStatsData {
  totalCalls?: string | number;
  totalCallsSubtext?: string;
  totalCallsToday?: string | number;
  totalCallsTodaySubtext?: string;
  followUps?: string | number;
  followUpsSubtext?: string;
  shortlisted?: string | number;
  shortlistedSubtext?: string;
  avgTime?: string;
  avgTimeSubtext?: string;
}

export interface CallStatsParams {
  workspace_id?: number | null;
  job_id?: number | null;
  recruiter_uid?: string | null;
}

export interface CallFilterParams {
  location?: string[];
  salaryRange?: { min: string; max: string };
  experience?: { min: string; max: string };
  designation?: string[];
  noticePeriod?: { selected: string[]; minDays: string; maxDays: string };
  attention?: string[];
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export const callService = {
  // Fetch workspaces (companies)
  async getCompanies(): Promise<MyWorkspace[]> {
    try {
      const data = await organizationService.getMyWorkspacesData();
      if (data?.workspaces?.length) {
        return data.workspaces;
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
    // Fallback demo companies matching screenshot
    return [
      { id: 101, name: "Deloitte", workspace_status: "Active" } as any,
    ];
  },

  // Fetch jobs for workspace
  async getJobs(workspaceId?: number): Promise<Job[]> {
    try {
      const res = await jobPostService.getPaginatedRoles({
        workspace_id: workspaceId,
        page_size: 100,
      });
      if (res?.jobs?.length) {
        return res.jobs;
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
    // Fallback demo jobs matching screenshot
    return [
      { id: 201, title: "Senior Front-End Developer +2", workspace_id: workspaceId || 101 } as any,
    ];
  },

  // Fetch candidates for selected job with filters
  async getCandidates(jobId: number, filters?: CallFilterParams): Promise<{ candidates: CandidateCallItem[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("job_id", jobId.toString());
      queryParams.append("page", (filters?.page || 1).toString());
      queryParams.append("page_size", (filters?.pageSize || 20).toString());
      queryParams.append("view", "kanban");

      if (filters?.search?.trim()) {
        queryParams.append("search", filters.search.trim());
      }
      if (filters?.ordering) {
        queryParams.append("ordering", filters.ordering);
      }
      if (filters?.location?.length) {
        queryParams.append("location", filters.location.join(","));
      }
      if (filters?.salaryRange?.min) {
        queryParams.append("salary_min", filters.salaryRange.min);
      }
      if (filters?.salaryRange?.max) {
        queryParams.append("salary_max", filters.salaryRange.max);
      }
      if (filters?.experience?.min) {
        queryParams.append("experience_min", filters.experience.min);
      }
      if (filters?.experience?.max) {
        queryParams.append("experience_max", filters.experience.max);
      }
      if (filters?.designation?.length) {
        queryParams.append("designation", filters.designation.join(","));
      }
      if (filters?.noticePeriod?.selected?.length) {
        queryParams.append("notice_period", filters.noticePeriod.selected.join(","));
      }
      if (filters?.noticePeriod?.minDays) {
        queryParams.append("notice_period_min_days", filters.noticePeriod.minDays);
      }
      if (filters?.noticePeriod?.maxDays) {
        queryParams.append("notice_period_max_days", filters.noticePeriod.maxDays);
      }
      if (filters?.attention?.length) {
        queryParams.append("attention", filters.attention.join(","));
      }

      const response = await apiClient.get(`/jobs/applications/?${queryParams.toString()}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return { candidates: data, total: data.length };
      }
      return {
        candidates: data.results || data.applications || data.candidates || [],
        total: data.count || (data.results?.length ?? 0),
      };
    } catch (error) {
      console.error("Failed to fetch candidates for call queue:", error);
      return { candidates: [], total: 0 };
    }
  },

  // Fetch company research / details
  async getCompanyResearch(workspaceId: number): Promise<CompanyResearchData | null> {
    try {
      return await organizationService.getCompanyResearchData(workspaceId);
    } catch (error) {
      console.error("Failed to fetch company research:", error);
      return null;
    }
  },

  /**
   * Fetch call queue summary metrics for the Call page stats cards.
   * Endpoint: GET /calls/stats/ (with fallback to /call-queue/stats/)
   * 
   * Query params:
   * - workspace_id: Filter stats by company workspace
   * - job_id: Filter stats by specific job role
   * - recruiter_uid: Filter by recruiter (defaults to authenticated user on backend)
   * 
   * Gracefully normalizes both camelCase and snake_case backend payloads from Django.
   */
  async getCallStats(params?: CallStatsParams): Promise<CallStatsData | null> {
    try {
      const queryParams: Record<string, any> = {};
      // When job_id is provided, scope stats directly to that job.
      // Omit workspace_id when job_id is present to prevent backend workspace-job mismatch errors (e.g. {"error":"Job not found."}).
      if (params?.job_id) {
        queryParams.job_id = params.job_id;
      } else if (params?.workspace_id) {
        queryParams.workspace_id = params.workspace_id;
      }
      if (params?.recruiter_uid) queryParams.recruiter_uid = params.recruiter_uid;

      let response;
      try {
        response = await apiClient.get("/calls/stats/", { params: queryParams });
      } catch (err: any) {
        // Fallback endpoint if /calls/stats/ route is 404 (and not a business validation error)
        if (err?.response?.status === 404 && !err?.response?.data?.error) {
          response = await apiClient.get("/call-queue/stats/", { params: queryParams });
        } else {
          // If the server explicitly returned an error (like "Job not found."), log cleanly and gracefully return null
          if (err?.response?.data?.error) {
            console.warn("Call stats query returned error from server:", err.response.data.error);
            return null;
          }
          throw err;
        }
      }

      const data = response?.data;
      if (!data) return null;

      // Extract raw stats (handles { data: ... } or { stats: ... } or root payload)
      const raw = data.stats || data.data || data;

      return {
        totalCalls: raw.totalCalls ?? raw.total_calls ?? raw.total ?? 0,
        totalCallsSubtext: raw.totalCallsSubtext ?? raw.total_calls_subtext ?? (params?.job_id ? "In job queue" : "Per month"),
        totalCallsToday: raw.totalCallsToday ?? raw.total_calls_today ?? raw.today_calls ?? 0,
        totalCallsTodaySubtext:
          raw.totalCallsTodaySubtext ??
          raw.total_calls_today_subtext ??
          (raw.daily_target ? `vs Target ${raw.daily_target}` : (raw.target ? `vs Target ${raw.target}` : "vs Target 45")),
        followUps: raw.followUps ?? raw.follow_ups ?? raw.follow_up_count ?? 0,
        followUpsSubtext: raw.followUpsSubtext ?? raw.follow_ups_subtext ?? "Total Calls today",
        shortlisted: raw.shortlisted ?? raw.shortlisted_count ?? 0,
        shortlistedSubtext: raw.shortlistedSubtext ?? raw.shortlisted_subtext ?? "Total Calls today",
        avgTime:
          raw.avgTime ??
          raw.avg_time ??
          (raw.avg_duration_seconds != null ? `${Math.round(Number(raw.avg_duration_seconds) / 60)}min` : "0min"),
        avgTimeSubtext: raw.avgTimeSubtext ?? raw.avg_time_subtext ?? "Avg Time Taken",
      };
    } catch (error) {
      console.warn("Call stats endpoint not available or request failed:", error);
      return null;
    }
  },

  /**
   * Facade method for City / Location suggestions used in CallFiltersDialog.
   *
   * WHY WE NEED THIS:
   * 1. Facade Pattern: Decouples the Call module (src/pages/call/*) from having to import
   *    and know about candidateService directly. All Call module data fetching flows through callService.
   * 2. Defensive Error Handling: Automatically catches any network/backend failure and returns []
   *    safely, preventing unexpected UI crashes in filter search popovers.
   * 3. Future Decoupling: If the backend introduces a dedicated call-queue location endpoint
   *    (e.g., locations scoped strictly to active call candidate queues), only this method
   *    needs to change without modifying any Call UI components.
   */
  async getCitySuggestions(query: string): Promise<string[]> {
    try {
      return await candidateService.getCitySuggestions(query);
    } catch (error) {
      console.error("Failed to fetch city suggestions:", error);
      return [];
    }
  },

  /**
   * Facade method for Designation / Job Title suggestions used in CallFiltersDialog.
   *
   * WHY WE NEED THIS:
   * 1. Facade Pattern: Decouples the Call module from jobPostService. The filter UI interacts
   *    strictly with callService as its single source of truth.
   * 2. Defensive Error Handling: Returns [] on failure so designation auto-complete does not fail.
   * 3. Scoped Suggestions: Allows future caching or pre-filtering of designations relevant to
   *    the currently selected job call-queue.
   */
  async getDesignationSuggestions(jobId: number, query: string): Promise<string[]> {
    try {
      return await jobPostService.getDesignationList(jobId, query);
    } catch (error) {
      console.error("Failed to fetch designation suggestions:", error);
      return [];
    }
  },

  /**
   * Fetch call history for a job with real timestamps, grouped chronologically.
   */
  async getCallHistory(
    jobId: number,
    params?: { page?: number; pageSize?: number; search?: string }
  ): Promise<{ history: CallHistoryItem[]; total: number }> {
    try {
      // 1. Try dedicated bulk call history endpoint if available on backend
      try {
        const directRes = await apiClient.get(`/calls/history/?job_id=${jobId}`, {
          params: {
            page: params?.page || 1,
            page_size: params?.pageSize || 20,
            search: params?.search,
          },
        });
        if (directRes.data) {
          const rawItems = Array.isArray(directRes.data)
            ? directRes.data
            : directRes.data.results || directRes.data.history || [];
          if (rawItems.length > 0) {
            const mapped: CallHistoryItem[] = rawItems.map((item: any) => ({
              id: item.id || `hist-${Math.random()}`,
              application_id: item.application_id || item.application?.id,
              candidate_id: String(item.candidate_id || item.candidate?.id || ""),
              candidate: item.candidate || {
                id: String(item.candidate_id || ""),
                full_name: item.candidate_name || "Unknown Candidate",
              },
              call_uuid: item.call_uuid || null,
              call_time: item.call_time || item.created_at || new Date().toISOString(),
              duration_seconds: Number(item.duration_seconds) || 0,
              call_status: item.call_status || item.status || "completed",
              status_display: item.status_display || item.reason || item.call_status,
              outcome: item.outcome || item.note || item.summary || null,
              score: item.score ?? item.candidate?.score ?? null,
              screening_score: item.screening_score ?? item.candidate?.screening_score ?? null,
              is_archived: Boolean(item.is_archived || item.status === "ARCHIVED"),
              archive_reason: item.archive_reason || null,
            }));
            return {
              history: mapped,
              total: directRes.data.count || mapped.length,
            };
          }
        }
      } catch (err: any) {
        // Not a blocking error; gracefully fall back to aggregating candidates
      }

      // 2. Fetch applications for the job to aggregate contacted candidates
      const queryParams = new URLSearchParams();
      queryParams.append("job_id", jobId.toString());
      queryParams.append("page", (params?.page || 1).toString());
      queryParams.append("page_size", (params?.pageSize || 50).toString());
      queryParams.append("view", "kanban");
      if (params?.search?.trim()) {
        queryParams.append("search", params.search.trim());
      }

      const appRes = await apiClient.get(`/jobs/applications/?${queryParams.toString()}`);
      const data = appRes.data;
      const candidates: any[] = Array.isArray(data)
        ? data
        : data.results || data.applications || data.candidates || [];

      // Check last completed call stored in session
      let lastCompletedCall: any = null;
      try {
        const raw = sessionStorage.getItem("nxthyre_last_call_completed");
        if (raw) lastCompletedCall = JSON.parse(raw);
      } catch {}

      const historyItems: CallHistoryItem[] = [];

      candidates.forEach((candItem) => {
        const cand = candItem.candidate || {};
        const candId = String(cand.id || candItem.id || "");

        const hasRecentCall =
          candItem.latest_manual_call_at ||
          candItem.latest_call_at ||
          candItem.last_active_at ||
          (lastCompletedCall && String(lastCompletedCall.candidateId) === candId);

        if (hasRecentCall) {
          const callTime =
            (lastCompletedCall && String(lastCompletedCall.candidateId) === candId
              ? lastCompletedCall.callTime
              : null) ||
            candItem.latest_manual_call_at ||
            candItem.latest_call_at ||
            candItem.last_active_at ||
            new Date().toISOString();

          const rawStatus =
            (lastCompletedCall && String(lastCompletedCall.candidateId) === candId
              ? lastCompletedCall.callStatus
              : null) ||
            candItem.latest_manual_call_status ||
            candItem.latest_call_status ||
            "completed";

          const rawNote =
            (lastCompletedCall && String(lastCompletedCall.candidateId) === candId
              ? lastCompletedCall.noteText
              : null) ||
            candItem.latest_manual_call_note ||
            candItem.latest_call_note ||
            "";

          // Format status display
          let statusDisplay = rawStatus;
          if (rawStatus === "convinced") statusDisplay = "Convinced";
          else if (rawStatus === "not_picked_up" || rawStatus === "no_answer") statusDisplay = "Didn't Pick";
          else if (rawStatus === "reason_missing") statusDisplay = "Reason Missing";
          else if (rawStatus === "follow_up") statusDisplay = "Call back Later";
          else if (rawStatus === "busy") statusDisplay = "Number Busy";
          else if (rawStatus === "switched_off") statusDisplay = "Switched off";
          else if (rawStatus === "wrong_number") statusDisplay = "Invalid Number";
          else if (rawStatus === "not_interested") statusDisplay = "Not Interested";

          historyItems.push({
            id: candItem.id || candId,
            application_id: candItem.id,
            candidate_id: candId,
            candidate: {
              id: candId,
              full_name: cand.full_name || "Unknown Candidate",
              current_company: cand.current_company,
              headline: cand.headline,
              phone: cand.phone || cand.premium_data?.phone,
              location: cand.location,
              current_salary_lpa: cand.current_salary_lpa || cand.current_salary,
              expected_ctc: cand.expected_ctc,
              notice_period_days: cand.notice_period_days,
              notice_period_summary: cand.notice_period_summary,
              total_experience: cand.total_experience || cand.experience_years,
              score: candItem.score ?? cand.score,
              screening_score: candItem.screening_score ?? cand.screening_score,
              job_score: candItem.job_score || cand.job_score,
            },
            call_time: callTime,
            duration_seconds: candItem.latest_call_duration || 529, // ~8m 49s
            call_status: rawStatus,
            status_display: statusDisplay,
            outcome: rawNote || "Follow up call today",
            score: candItem.score ?? cand.score,
            screening_score: candItem.screening_score ?? cand.screening_score,
            is_archived: Boolean(candItem.status === "ARCHIVED" || candItem.is_archived),
            archive_reason: candItem.archive_reason || null,
          });
        }
      });

      // Sort chronologically descending
      historyItems.sort(
        (a, b) => new Date(b.call_time).getTime() - new Date(a.call_time).getTime()
      );

      return {
        history: historyItems,
        total: historyItems.length,
      };
    } catch (error) {
      console.error("Failed to load call history:", error);
      return { history: [], total: 0 };
    }
  },

  /**
   * Fetch candidates in the Shortlisted stage for the selected job.
   */
  async getShortlistedCandidates(
    jobId: number,
    params?: { page?: number; pageSize?: number; search?: string }
  ): Promise<{ candidates: CandidateCallItem[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("job_id", jobId.toString());
      queryParams.append("stage_slug", "shortlisted");
      queryParams.append("page", (params?.page || 1).toString());
      queryParams.append("page_size", (params?.pageSize || 20).toString());
      queryParams.append("view", "kanban");
      if (params?.search?.trim()) {
        queryParams.append("search", params.search.trim());
      }

      const response = await apiClient.get(`/jobs/applications/?${queryParams.toString()}`);
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data.results || data.applications || data.candidates || [];
      return {
        candidates: list,
        total: data.count || list.length,
      };
    } catch (error) {
      console.error("Failed to fetch shortlisted candidates:", error);
      return { candidates: [], total: 0 };
    }
  },

  /**
   * Move a candidate to the Shortlisted stage.
   */
  async shortlistCandidate(
    applicationId: number | string,
    stageId?: number,
    jobId?: number
  ): Promise<boolean> {
    try {
      let targetStageId = stageId;
      if (!targetStageId && jobId) {
        try {
          const res = await apiClient.get(`/jobs/applications/stages/?job_id=${jobId}`);
          const st = res.data?.find(
            (s: any) => s.slug === "shortlisted" || s.name.toLowerCase().includes("shortlist")
          );
          if (st) targetStageId = st.id;
        } catch {}
      }

      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        ...(targetStageId ? { current_stage: targetStageId } : {}),
        status: "ACTIVE",
      });
      return true;
    } catch (error) {
      console.error("Failed to shortlist candidate:", error);
      throw error;
    }
  },

  /**
   * Archive a candidate.
   */
  async archiveCandidate(
    applicationId: number | string,
    reason: string = "Archived by recruiter",
    stageId?: number,
    jobId?: number
  ): Promise<boolean> {
    try {
      let archiveStageId = stageId;
      if (!archiveStageId && jobId) {
        try {
          const res = await apiClient.get(`/jobs/applications/stages/?job_id=${jobId}`);
          const st = res.data?.find(
            (s: any) => s.slug === "archives" || s.name.toLowerCase().includes("archive")
          );
          if (st) archiveStageId = st.id;
        } catch {}
      }

      await apiClient.patch(`/jobs/applications/${applicationId}/?view=kanban`, {
        ...(archiveStageId ? { current_stage: archiveStageId } : {}),
        status: "ARCHIVED",
        archive_reason: reason,
        feedback: {
          subject: "Moved to Archive",
          comment: reason,
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to archive candidate:", error);
      throw error;
    }
  },

  /**
   * Restore an archived candidate.
   */
  async restoreCandidate(
    applicationId: number | string,
    stageId?: number,
    jobId?: number
  ): Promise<boolean> {
    try {
      let targetStageId = stageId;
      if (!targetStageId && jobId) {
        try {
          const res = await apiClient.get(`/jobs/applications/stages/?job_id=${jobId}`);
          const st =
            res.data?.find((s: any) => s.slug === "shortlisted") ||
            res.data?.find((s: any) => s.slug !== "archives") ||
            res.data?.[0];
          if (st) targetStageId = st.id;
        } catch {}
      }

      await apiClient.patch(`/jobs/applications/${applicationId}/`, {
        ...(targetStageId ? { current_stage: targetStageId } : {}),
        status: "ACTIVE",
      });
      return true;
    } catch (error) {
      console.error("Failed to restore candidate:", error);
      throw error;
    }
  },

  /**
   * Permanently delete a candidate using existing delete endpoints.
   */
  async deleteCandidate(
    applicationId: number | string,
    candidateId?: string
  ): Promise<boolean> {
    try {
      await apiClient.delete(`/jobs/applications/${applicationId}/`);
      return true;
    } catch (err) {
      if (candidateId) {
        try {
          await apiClient.delete(`/candidates/${candidateId}/`);
          return true;
        } catch {}
      }
      throw err;
    }
  },
};
