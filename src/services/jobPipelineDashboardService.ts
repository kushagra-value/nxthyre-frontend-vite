// jobPipelineDashboardService.ts
// Service file for Plivo call integration APIs

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const PLIVO_BASE = `${API_BASE}/plivo`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken") || "";
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
  reason: string | null;
  note: string | null;
  duration_seconds: number;
  tags: string[] | null;
  checklist_data: any;
  skills_data: any;
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
}
export interface LiveTranscript {
  id: number;
  speaker: "recruiter" | "candidate" | "system";
  text: string;
  ai_evaluation_pill: string | null;
  ai_suggested_followup: string | null;
  timestamp: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res
      .json()
      .catch(() => ({ detail: res.statusText }));
    throw new Error(
      errorBody.detail || errorBody.error || `Request failed: ${res.status}`,
    );
  }
  return res.json();
}

export async function initiateCall(
  payload: InitiateCallPayload,
): Promise<InitiateCallResponse> {
  const res = await fetch(`${PLIVO_BASE}/interactive/call/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<InitiateCallResponse>(res);
}

export async function getCallStatus(): Promise<CallStatus> {
  const res = await fetch(`${PLIVO_BASE}/interactive/status/`, {
    method: "GET",
    headers: getAuthHeaders(),
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
  const res = await fetch(`${PLIVO_BASE}/interactive/hangup-call/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse<HangupResponse>(res);
}

// ─── Recording ───────────────────────────────────────

export async function startRecording(callUuid: string): Promise<any> {
  const res = await fetch(`${PLIVO_BASE}/recording/start/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse(res);
}

export async function stopRecording(callUuid: string): Promise<any> {
  const res = await fetch(`${PLIVO_BASE}/recording/stop/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ call_uuid: callUuid }),
  });
  return handleResponse(res);
}

// ─── Call Logs ───────────────────────────────────────

export async function saveCallLog(
  payload: CallLogPayload,
): Promise<CallLogResponse> {
  const res = await fetch(`${PLIVO_BASE}/call-log/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<CallLogResponse>(res);
}

export async function getCallLogs(
  candidateId: string,
  limit = 20,
): Promise<CallLogResponse[]> {
  const res = await fetch(
    `${PLIVO_BASE}/call-log/?candidate_id=${encodeURIComponent(candidateId)}&limit=${limit}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<CallLogResponse[]>(res);
}

export async function scheduleFollowUp(
  payload: ScheduleFollowUpPayload,
): Promise<ScheduleFollowUpResponse> {
  const res = await fetch(`${PLIVO_BASE}/schedule-followup/`, {
    method: "POST",
    headers: getAuthHeaders(),
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
  phoneNumber?: string,
): Promise<CallHistoryEntry[]> {
  const params = new URLSearchParams();
  if (phoneNumber) params.set("phone_number", phoneNumber);
  const qs = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(
    `${API_BASE}/plivo/call-history/${candidateId}/${qs}`,
  );
  if (!response.ok) throw new Error("Failed to fetch call history");
  return response.json();
}

export async function processCallRecording(
  callUuid: string,
  candidateId: string,
): Promise<any> {
  const response = await fetch(`${API_BASE}/plivo/recordings/process/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
  payload: ProcessManualRecordingPayload,
): Promise<any> {
  const res = await fetch(`${PLIVO_BASE}/recordings/manual/process/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Fetches the AI-generated role questions (10 questions) for the candidate.
 */
export async function getRoleQuestions(
  jobId: string,
  candidateId: string,
): Promise<RoleQuestion[]> {
  const res = await fetch(
    `${PLIVO_BASE}/copilot/questions/${encodeURIComponent(jobId)}/${encodeURIComponent(candidateId)}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<RoleQuestion[]>(res);
}
/**
 * Updates a question's manual evaluation status (Convinced / Not convinced / Skip).
 */
export async function evaluateRoleQuestion(
  questionId: number,
  status: RoleQuestion["status"],
): Promise<RoleQuestion> {
  const res = await fetch(
    `${PLIVO_BASE}/copilot/questions/${questionId}/evaluate/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    },
  );
  return handleResponse<RoleQuestion>(res);
}
/**
 * Polls for the realtime Live Transcript data for a given Call UUID.
 */
export async function getLiveTranscript(
  callUuid: string,
): Promise<LiveTranscript[]> {
  const res = await fetch(
    `${PLIVO_BASE}/copilot/transcript/${encodeURIComponent(callUuid)}/`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse<LiveTranscript[]>(res);
}
