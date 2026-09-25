// jobPipelineDashboardService.ts
// Service file for Plivo call integration APIs
import { auth } from "../config/firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const PLIVO_BASE = `${API_BASE}/plivo`;

export async function getFreshAuthToken(): Promise<string> {
  try {
    if (auth.authStateReady) {
      await auth.authStateReady();
    }
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      if (token) {
        localStorage.setItem("authToken", token);
        return token;
      }
    }
  } catch (err) {
    console.error("Error getting fresh Firebase token:", err);
  }
  return localStorage.getItem("authToken") || "";
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getFreshAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Interactive Calling ─────────────────────────────

export interface InitiateCallPayload {
  phone_numbers: string[];
  agent_username?: string;
}

export interface InitiateCallResponse {
  campaign_id: string;
  status: {
    status: string;
    event: string;
    call_uuid: string | null;
    request_uuid: string | null;
    agent: string;
    timestamp: number;
    extra: Record<string, any>;
  };
}

// ─── Call Status ─────────────────────────────────────

export interface CallStatus {
  status: string;
  event: string;
  call_uuid: string | null;
  request_uuid: string | null;
  agent: string;
  timestamp: number;
  extra: Record<string, any>;
}

// ─── Call History Types ─────────────────────────────────
export interface CallRecording {
  recording_url: string | null;
  recording_duration: number;
  transcript_source: "plivo" | "gemini" | null;
  transcript: string | null;
  summary: string | null;
  status: "pending" | "processing" | "completed" | "failed";
}
export interface CallFollowUp {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  created_at: string;
}
export interface CallHistoryEntry {
  id: number;
  call_uuid: string | null;
  candidate_id: string;
  caller_uid: string | null;
  phone_number: string | null;
  call_status:
    | "initiated"
    | "ringing"
    | "answered"
    | "not_answered"
    | "busy"
    | "failed"
    | "completed";
  call_type: "outgoing" | "incoming";
  call_mode?: "platform" | "manual";
  reason: string | null;
  note: string | null;
  duration_seconds: number;
  tags: string[] | null;
  checklist_data: any;
  skills_data: any;
  role_questions_data: any;
  created_at: string;
  recording: CallRecording | null;
  follow_ups: CallFollowUp[];
}

// ─── Schedule Follow-Up ─────────────────────────────

export interface ScheduleFollowUpPayload {
  candidate_id: string;
  phone_number?: string;
  call_mode?: "platform" | "manual";
  call_status?: string;
  reason?: string;
  note?: string;
  scheduled_date: string; // "YYYY-MM-DD"
  scheduled_time: string; // "HH:MM:SS" or "HH:MM"
  duration_seconds?: number;
  tags?: string[];
  checklist_data?: Record<string, any>;
  skills_data?: Record<string, boolean>;
  call_log_id?: number;
}

export interface ScheduleFollowUpResponse {
  call_log: CallLogResponse;
  follow_up: {
    id: number;
    call_log: number;
    scheduled_date: string;
    scheduled_time: string;
    created_at: string;
  };
}

export interface CallLogPayload {
  call_uuid?: string;
  candidate_id: string;
  phone_number?: string;
  reason?: string;
  call_status?: string;
  note?: string;
  duration_seconds?: number;
  tags?: string[];
  checklist_data?: Record<string, any>;
  skills_data?: Record<string, boolean>;
  role_questions_data?: any;
  call_mode?: "platform" | "manual";
}

export interface CallLogResponse {
  id: number;
  call_uuid: string;
  candidate_id: string;
  caller_uid: string;
  reason: string;
  note: string;
  duration_seconds: number;
  tags: string[];
  checklist_data: Record<string, boolean> | null;
  skills_data: Record<string, boolean> | null;
  created_at: string;
}

export interface RoleQuestion {
  id: number;
  question_text: string;
  ideal_answer_concept: string;
  ai_score_percentage: number | null;
  status: "pending" | "convinced" | "not_convinced" | "skipped";
  recruiter_guidance?: string | null;
}
export interface LiveTranscript {
  id: number;
  speaker: "recruiter" | "candidate" | "system";
  text: string;
  ai_evaluation_pill: string | null;
  ai_suggested_followup: string | null;
  timestamp: string;
}

// ─── Recording Event Observability ─────────────────────

export interface RecordingEvent {
  id: number;
  call_uuid: string;
  recruiter_uid: string;
  candidate_id: string;
  job_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface LogRecordingStartArgs {
  callUuid?: string;
  candidateId: string;
  jobId: string;
}

export interface LogRecordingStopArgs {
  callUuid: string;
  candidateId: string;
  jobId: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res
      .json()
      .catch(() => ({ detail: res.statusText }));
    throw new Error(
      errorBody.detail || errorBody.error || `Request failed: ${res.status}`
    );
  }
  return res.json();
}

export async function initiateCall(
  payload: InitiateCallPayload
): Promise<InitiateCallResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/interactive/call/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<InitiateCallResponse>(res);
}

export async function getCallStatus(): Promise<CallStatus> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/interactive/status/`, {
    method: "GET",
    headers,
  });
  return handleResponse<CallStatus>(res);
}

// ─── Hangup ──────────────────────────────────────────

export interface HangupResponse {
  success: boolean;
  call_uuid: string;
  response: Record<string, any>;
}

export async function hangupCall(callUuid: string): Promise<HangupResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/interactive/hangup-call/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse<HangupResponse>(res);
}

// ─── Recording ───────────────────────────────────────

export async function startRecording(callUuid: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/recording/start/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse(res);
}

export async function stopRecording(callUuid: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/recording/stop/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse(res);
}

// ─── Recording Event Endpoints ──────────────────────────

/**
 * 1. Log start — after Start Recording succeeds or when starting manual recording.
 * POST /api/plivo/recordings/start-events/
 */
export async function logRecordingStartEvent(
  args: LogRecordingStartArgs
): Promise<RecordingEvent> {
  const headers = await getAuthHeaders();
  const body: Record<string, any> = {
    candidate_id: args.candidateId,
    job_id: args.jobId,
    event: "start",
  };
  if (args.callUuid) {
    body.call_uuid = args.callUuid;
  }
  const res = await fetch(`${PLIVO_BASE}/recordings/start-events/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<RecordingEvent>(res);
}

/**
 * 2. Log stop — after Stop Recording succeeds or when stopping manual recording.
 * POST /api/plivo/recordings/start-events/
 */
export async function logRecordingStopEvent(
  args: LogRecordingStopArgs
): Promise<RecordingEvent> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/recordings/start-events/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      call_uuid: args.callUuid,
      candidate_id: args.candidateId,
      job_id: args.jobId,
      event: "stop",
    }),
  });
  return handleResponse<RecordingEvent>(res);
}

/**
 * 3. Get one event — reopening a call / transcript
 * GET /api/plivo/recordings/start-events/<call_uuid>/
 */
export async function getRecordingEvent(
  callUuid: string
): Promise<RecordingEvent | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${PLIVO_BASE}/recordings/start-events/${encodeURIComponent(callUuid)}/`,
    {
      headers,
    }
  );
  if (res.status === 404) return null;
  return handleResponse<RecordingEvent>(res);
}

/**
 * 4. Get history — candidate recording history page
 * GET /api/plivo/recordings/start-events/?candidate_id=<candidate_id>&job_id=<job_id>
 */
export async function listRecordingEvents(args: {
  candidateId?: string;
  jobId?: string;
}): Promise<RecordingEvent[]> {
  const headers = await getAuthHeaders();
  const q = new URLSearchParams();
  if (args.candidateId) q.set("candidate_id", args.candidateId);
  if (args.jobId) q.set("job_id", args.jobId);
  const qs = q.toString() ? `?${q.toString()}` : "";

  const res = await fetch(`${PLIVO_BASE}/recordings/start-events/${qs}`, {
    headers,
  });
  return handleResponse<RecordingEvent[]>(res);
}

// ─── Call Logs ───────────────────────────────────────

export async function saveCallLog(
  payload: CallLogPayload
): Promise<CallLogResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/call-log/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<CallLogResponse>(res);
}

export async function getCallLogs(
  candidateId: string,
  limit = 20
): Promise<CallLogResponse[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${PLIVO_BASE}/call-log/?candidate_id=${encodeURIComponent(
      candidateId
    )}&limit=${limit}`,
    {
      method: "GET",
      headers,
    }
  );
  return handleResponse<CallLogResponse[]>(res);
}

export async function scheduleFollowUp(
  payload: ScheduleFollowUpPayload
): Promise<ScheduleFollowUpResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${PLIVO_BASE}/schedule-followup/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<ScheduleFollowUpResponse>(res);
}

export async function getPlivoToken(): Promise<{
  token: string;
  username: string;
  password: string;
}> {
  const res = await fetch(`${PLIVO_BASE}/token/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to get Plivo token: ${res.status}`);
  return res.json();
}

export async function getCandidateCallHistory(
  candidateId: string,
  phoneNumber?: string
): Promise<CallHistoryEntry[]> {
  const params = new URLSearchParams();
  if (
    phoneNumber &&
    phoneNumber !== "91undefined" &&
    phoneNumber !== "91null" &&
    phoneNumber !== "91" &&
    phoneNumber.trim() !== ""
  ) {
    params.set("phone_number", phoneNumber);
  }
  const qs = params.toString() ? `?${params.toString()}` : "";
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE}/plivo/call-history/${candidateId}/${qs}`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch call history");
  return response.json();
}

export async function processCallRecording(
  callUuid: string,
  candidateId: string
): Promise<any> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/plivo/recordings/process/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ call_uuid: callUuid, candidate_id: candidateId }),
  });
  if (!response.ok) throw new Error("Failed to process recording");
  return response.json();
}

export interface ProcessManualRecordingPayload {
  call_uuid: string;
  candidate_id: string;
  caller_uid?: string;
  transcript: string;
  recording_duration?: number;
}

export async function processManualRecording(
  formData: FormData
): Promise<any> {
  const token = await getFreshAuthToken();
  const res = await fetch(`${PLIVO_BASE}/recordings/manual/process/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse(res);
}

/**
 * Fetches the AI-generated role questions (10 questions) for the candidate.
 */
export async function getRoleQuestions(
  jobId: string,
  candidateId: string
): Promise<RoleQuestion[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${PLIVO_BASE}/copilot/questions/${encodeURIComponent(
      jobId
    )}/${encodeURIComponent(candidateId)}/`,
    {
      method: "GET",
      headers,
    }
  );
  return handleResponse<RoleQuestion[]>(res);
}

/**
 * Updates a question's manual evaluation status (Convinced / Not convinced / Skip).
 */
export async function evaluateRoleQuestion(
  questionId: number,
  status: RoleQuestion["status"]
): Promise<RoleQuestion> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${PLIVO_BASE}/copilot/questions/${questionId}/evaluate/`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ status }),
    }
  );
  return handleResponse<RoleQuestion>(res);
}

/**
 * Polls for the realtime Live Transcript data for a given Call UUID.
 */
export async function getLiveTranscript(
  callUuid: string
): Promise<LiveTranscript[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `${PLIVO_BASE}/copilot/transcript/${encodeURIComponent(callUuid)}/`,
    {
      method: "GET",
      headers,
    }
  );
  return handleResponse<LiveTranscript[]>(res);
}

// ─── Bulk Reframe Questions ──────────────────────────

export interface BulkReframeQuestionsResponse {
  job_id: string;
  input_string: string;
  total_candidates: number;
  queued: number;
  errors: string[];
  queued_tasks: { candidate_id: string; task_name: string }[];
}

/**
 * Triggers AI regeneration of interview questions for all candidates in a job.
 */
export async function bulkReframeQuestions(
  jobId: number,
  inputString: string
): Promise<BulkReframeQuestionsResponse> {
  const { default: apiClient } = await import("./api");
  const response = await apiClient.post(
    `/plivo/copilot/jobs/${jobId}/questions/bulk/`,
    { input_string: inputString }
  );
  return response.data;
}
