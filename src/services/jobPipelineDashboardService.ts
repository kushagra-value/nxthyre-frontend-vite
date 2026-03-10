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

export interface CallLogPayload {
  call_uuid?: string;
  candidate_id: string;
  reason?: string;
  note?: string;
  duration_seconds?: number;
  tags?: string[];
  checklist_data?: Record<string, boolean>;
  skills_data?: Record<string, boolean>;
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

// ─── Schedule Follow-Up ─────────────────────────────

export interface ScheduleFollowUpPayload {
  candidate_id: string;
  reason?: string;
  note?: string;
  scheduled_date: string; // "YYYY-MM-DD"
  scheduled_time: string; // "HH:MM:SS" or "HH:MM"
  duration_seconds?: number;
  tags?: string[];
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
}> {
  const res = await fetch(`${PLIVO_BASE}/token/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to get Plivo token: ${res.status}`);
  return res.json();
}
