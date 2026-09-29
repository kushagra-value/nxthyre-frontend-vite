// manualRecordingService.ts
// Owns the browser-side manual call recording lifecycle OUTSIDE the React tree.
//
// Why this lives here and not in a component:
//   - Unmounting / re-rendering the call page must never cancel or orphan an upload.
//   - Audio is persisted to IndexedDB every TIMESLICE_MS so a refresh, crash or
//     closed tab loses at most one slice; leftovers are re-uploaded on next load.
//
// Order on stop:  recorder.stop() → flush chunks to IndexedDB → upload (with retry)
//                 → clear IndexedDB → log "stop" event.
import posthog from "posthog-js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  getFreshAuthToken,
  logRecordingStopEvent,
} from "./jobPipelineDashboardService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const UPLOAD_URL = `${API_BASE}/plivo/recordings/manual/process/`;

const TIMESLICE_MS = 10_000;
// ~0.24 MB/min → ~2h of headroom under Cloud Run's 32 MB request limit.
const AUDIO_BITS_PER_SECOND = 32_000;
const RETRY_DELAYS_MS = [0, 2_000, 5_000, 15_000, 30_000];
// Sessions that failed permanently are kept this long for manual recovery, then purged.
const FAILED_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MIN_RECORDING_BYTES = 4096;

// ─── Types ───────────────────────────────────────────

export interface RecordingContext {
  callUuid: string;
  candidateId: string;
  jobId: string;
  callerUid?: string;
}

export type RecordingStatus = "idle" | "recording" | "paused";

export interface RecordingState {
  status: RecordingStatus;
  /** Uploads (live stop or recovery) still running in this tab. */
  pendingUploads: number;
}

export type UploadResult =
  | { status: "uploaded" }
  | { status: "empty"; bytes: number }
  | { status: "deferred" } // another tab is already uploading this session
  | { status: "failed"; permanent: boolean; error: string };

interface StoredSession extends RecordingContext {
  sessionId: string;
  mimeType: string;
  startedAt: number;
  updatedAt: number;
  durationSec: number;
  /** recording: still live (or crashed mid-call); stopped: awaiting upload; failed: permanent error */
  status: "recording" | "stopped" | "failed";
  stopLogged: boolean;
  lastError?: string;
}

interface StoredChunk {
  sessionId: string;
  seq: number;
  blob: Blob;
}

interface ActiveSession {
  sessionId: string;
  ctx: RecordingContext;
  recorder: MediaRecorder;
  stream: MediaStream;
  mimeType: string;
  chunks: Blob[];
  seq: number;
  startedAt: number;
  activeMs: number;
  resumedAt: number | null;
  writeQueue: Promise<void>;
  persistFailed: boolean;
  done: Promise<UploadResult>;
  releaseLock?: () => void;
}

class PermanentUploadError extends Error {}

// ─── Telemetry ───────────────────────────────────────

function track(event: string, props: Record<string, unknown> = {}) {
  try {
    posthog.capture(event, props);
  } catch {
    /* telemetry must never break recording */
  }
}

function reportError(event: string, props: Record<string, unknown>, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[manualRecording] ${event}`, props, err);
  track(event, { ...props, error: message });
}

// ─── IndexedDB ───────────────────────────────────────

const DB_NAME = "nxthyre-recordings";
const DB_VERSION = 1;
const SESSIONS = "sessions";
const CHUNKS = "chunks";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore(SESSIONS, { keyPath: "sessionId" });
        const chunks = db.createObjectStore(CHUNKS, { autoIncrement: true });
        chunks.createIndex("sessionId", "sessionId");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(t: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

async function putSession(session: StoredSession): Promise<void> {
  const db = await openDb();
  const t = db.transaction(SESSIONS, "readwrite");
  t.objectStore(SESSIONS).put(session);
  await txDone(t);
}

async function getAllSessions(): Promise<StoredSession[]> {
  const db = await openDb();
  return reqToPromise(
    db.transaction(SESSIONS).objectStore(SESSIONS).getAll() as IDBRequest<StoredSession[]>,
  );
}

async function addChunk(chunk: StoredChunk): Promise<void> {
  const db = await openDb();
  const t = db.transaction(CHUNKS, "readwrite");
  t.objectStore(CHUNKS).add(chunk);
  await txDone(t);
}

async function getChunks(sessionId: string): Promise<Blob[]> {
  const db = await openDb();
  const rows = await reqToPromise(
    db
      .transaction(CHUNKS)
      .objectStore(CHUNKS)
      .index("sessionId")
      .getAll(IDBKeyRange.only(sessionId)) as IDBRequest<StoredChunk[]>,
  );
  return rows.sort((a, b) => a.seq - b.seq).map((r) => r.blob);
}

async function deleteSession(sessionId: string): Promise<void> {
  const db = await openDb();
  const t = db.transaction([SESSIONS, CHUNKS], "readwrite");
  t.objectStore(SESSIONS).delete(sessionId);
  const chunkStore = t.objectStore(CHUNKS);
  const cursorReq = chunkStore.index("sessionId").openKeyCursor(IDBKeyRange.only(sessionId));
  cursorReq.onsuccess = () => {
    const cursor = cursorReq.result;
    if (cursor) {
      chunkStore.delete(cursor.primaryKey);
      cursor.continue();
    }
  };
  await txDone(t);
}

// ─── Cross-tab locks ─────────────────────────────────
// A tab holds `rec-<id>` while recording so other tabs don't "recover" a live session,
// and `upload-<id>` while uploading so two tabs don't upload the same audio at once.

const recLockName = (id: string) => `nxthyre-rec-${id}`;
const uploadLockName = (id: string) => `nxthyre-upload-${id}`;

function holdLock(name: string): Promise<() => void> {
  if (!navigator.locks) return Promise.resolve(() => {});
  return new Promise((resolveAcquired) => {
    navigator.locks
      .request(name, () => new Promise<void>((release) => resolveAcquired(() => release())))
      .catch(() => resolveAcquired(() => {}));
  });
}

async function isLockHeld(name: string): Promise<boolean | null> {
  if (!navigator.locks?.query) return null;
  try {
    const snapshot = await navigator.locks.query();
    return !!snapshot.held?.some((l) => l.name === name);
  } catch {
    return null;
  }
}

/** Runs fn only if no other tab is uploading this session. Returns false if skipped. */
async function withUploadLock(sessionId: string, fn: () => Promise<void>): Promise<boolean> {
  if (!navigator.locks) {
    await fn();
    return true;
  }
  let ran = false;
  await navigator.locks.request(uploadLockName(sessionId), { ifAvailable: true }, async (lock) => {
    if (!lock) return;
    ran = true;
    await fn();
  });
  return ran;
}

// ─── State / subscription ────────────────────────────

let active: ActiveSession | null = null;
let pendingUploads = 0;
const uploadingHere = new Set<string>();
const inFlight = new Set<Promise<unknown>>();
const listeners = new Set<(s: RecordingState) => void>();

function computeState(): RecordingState {
  let status: RecordingStatus = "idle";
  if (active) status = active.recorder.state === "paused" ? "paused" : "recording";
  return { status, pendingUploads };
}

let snapshot: RecordingState = computeState();

function emit() {
  snapshot = computeState();
  listeners.forEach((l) => l(snapshot));
}

export function getRecordingState(): RecordingState {
  return snapshot;
}

export function subscribeRecordingState(listener: (s: RecordingState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasUnsavedRecording(): boolean {
  return active !== null || pendingUploads > 0;
}

function trackInFlight<T>(p: Promise<T>): Promise<T> {
  inFlight.add(p);
  p.finally(() => inFlight.delete(p)).catch(() => {});
  return p;
}

/** Resolves when all uploads running in this tab settle (or timeout elapses). */
export async function waitForPendingUploads(timeoutMs = 120_000): Promise<void> {
  if (inFlight.size === 0) return;
  await Promise.race([
    Promise.allSettled([...inFlight]),
    new Promise((r) => setTimeout(r, timeoutMs)),
  ]);
}

// ─── Helpers ─────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidId(value: unknown): boolean {
  const s = String(value ?? "").trim().toLowerCase();
  return s !== "" && s !== "0" && s !== "undefined" && s !== "null" && s !== "none";
}

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
}

function fileExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function activeMsNow(s: ActiveSession): number {
  return s.activeMs + (s.resumedAt !== null ? Date.now() - s.resumedAt : 0);
}

function toStored(s: ActiveSession, status: StoredSession["status"]): StoredSession {
  return {
    ...s.ctx,
    sessionId: s.sessionId,
    mimeType: s.mimeType,
    startedAt: s.startedAt,
    updatedAt: Date.now(),
    durationSec: Math.round(activeMsNow(s) / 1000),
    status,
    stopLogged: false,
  };
}

function persist(s: ActiveSession, op: () => Promise<void>) {
  s.writeQueue = s.writeQueue.then(op).catch((err) => {
    // IndexedDB failure (quota, private mode) must not stop the recording —
    // in-memory chunks are still uploaded on stop.
    if (!s.persistFailed) {
      s.persistFailed = true;
      reportError("recording_persist_failed", { callUuid: s.ctx.callUuid }, err);
    }
  });
}

// ─── Upload ──────────────────────────────────────────

async function uploadWithRetry(session: StoredSession, blob: Blob): Promise<void> {
  if (!isValidId(session.jobId)) throw new PermanentUploadError("job_id missing — cannot upload");
  if (!isValidId(session.callUuid)) throw new PermanentUploadError("call_uuid missing — cannot upload");
  if (!isValidId(session.candidateId)) throw new PermanentUploadError("candidate_id missing — cannot upload");

  let lastErr: unknown;
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay);

    const form = new FormData();
    form.append("call_uuid", session.callUuid);
    form.append("candidate_id", session.candidateId);
    form.append("job_id", String(session.jobId));
    if (session.callerUid) form.append("caller_uid", session.callerUid);
    form.append("recording_duration", String(session.durationSec));
    form.append("audio", blob, `${session.callUuid}.${fileExtension(session.mimeType)}`);

    try {
      const token = await getFreshAuthToken();
      // No keepalive: it caps the body at 64 KB.
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (res.ok) return;
      const body = await res.text().catch(() => "");
      if (res.status === 400 || res.status === 413) {
        throw new PermanentUploadError(`HTTP ${res.status}: ${body.slice(0, 300)}`);
      }
      lastErr = new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    } catch (err) {
      if (err instanceof PermanentUploadError) throw err;
      lastErr = err;
    }
  }
  throw lastErr;
}

async function logStopOnce(session: StoredSession): Promise<StoredSession> {
  if (session.stopLogged) return session;
  try {
    await logRecordingStopEvent({
      callUuid: session.callUuid,
      candidateId: session.candidateId,
      jobId: session.jobId,
    });
    return { ...session, stopLogged: true };
  } catch (err) {
    // Observability only — never blocks or fails the recording.
    reportError("recording_stop_event_failed", { callUuid: session.callUuid }, err);
    return session;
  }
}

async function uploadStoredSession(session: StoredSession, blob: Blob): Promise<UploadResult> {
  const props = { callUuid: session.callUuid, sessionId: session.sessionId, bytes: blob.size };

  if (blob.size < MIN_RECORDING_BYTES) {
    reportError("recording_too_small", props, new Error("empty recording"));
    await logStopOnce(session);
    await deleteSession(session.sessionId).catch(() => {});
    return { status: "empty", bytes: blob.size };
  }

  uploadingHere.add(session.sessionId);
  try {
    let uploadErr: unknown = null;
    const ran = await withUploadLock(session.sessionId, async () => {
      track("recording_upload_started", props);
      try {
        await uploadWithRetry(session, blob);
      } catch (err) {
        uploadErr = err;
      }
    });
    if (!ran) return { status: "deferred" };

    if (uploadErr === null) {
      track("recording_upload_succeeded", props);
      await deleteSession(session.sessionId).catch((err) =>
        reportError("recording_cleanup_failed", props, err),
      );
      await logStopOnce(session);
      return { status: "uploaded" };
    }

    const permanent = uploadErr instanceof PermanentUploadError;
    const message = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
    reportError("recording_upload_failed", { ...props, permanent }, uploadErr);
    // Keep the audio in IndexedDB: transient failures retry on next load / `online`.
    const updated = await logStopOnce({
      ...session,
      status: permanent ? "failed" : "stopped",
      lastError: message,
      updatedAt: Date.now(),
    });
    await putSession(updated).catch(() => {});
    return { status: "failed", permanent, error: message };
  } finally {
    uploadingHere.delete(session.sessionId);
  }
}

async function finalize(s: ActiveSession): Promise<UploadResult> {
  if (s.resumedAt !== null) {
    s.activeMs += Date.now() - s.resumedAt;
    s.resumedAt = null;
  }
  s.stream.getTracks().forEach((t) => t.stop());
  if (active === s) active = null;
  pendingUploads++;
  emit();

  try {
    await s.writeQueue;
    const stored = toStored(s, "stopped");
    await putSession(stored).catch(() => {});
    const blob = new Blob(s.chunks, { type: s.mimeType || "audio/webm" });
    return await uploadStoredSession(stored, blob);
  } catch (err) {
    reportError("recording_finalize_failed", { callUuid: s.ctx.callUuid }, err);
    return { status: "failed", permanent: false, error: String(err) };
  } finally {
    s.releaseLock?.();
    pendingUploads--;
    emit();
  }
}

// ─── Public API ──────────────────────────────────────

/**
 * Starts capturing mic audio. Resolves only after MediaRecorder fired `onstart`,
 * so callers can log the "start" event knowing audio is really being captured.
 */
export async function startManualRecording(ctx: RecordingContext): Promise<void> {
  if (active) throw new Error("A recording is already in progress");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  try {
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
    });

    let resolveDone!: (r: Promise<UploadResult>) => void;
    const session: ActiveSession = {
      sessionId: crypto.randomUUID(),
      ctx: { ...ctx, callerUid: ctx.callerUid ?? auth.currentUser?.uid },
      recorder,
      stream,
      mimeType: recorder.mimeType || mimeType,
      chunks: [],
      seq: 0,
      startedAt: Date.now(),
      activeMs: 0,
      resumedAt: null,
      writeQueue: Promise.resolve(),
      persistFailed: false,
      done: new Promise<UploadResult>((r) => (resolveDone = r)),
    };

    recorder.ondataavailable = (e) => {
      if (e.data.size === 0) return;
      session.chunks.push(e.data);
      const chunk: StoredChunk = { sessionId: session.sessionId, seq: session.seq++, blob: e.data };
      persist(session, async () => {
        await addChunk(chunk);
        await putSession(toStored(session, "recording"));
      });
    };

    // Fires on explicit stop() AND when the mic track ends on its own (unplugged,
    // Bluetooth switch, permission revoked) — either way, upload what we have.
    recorder.onstop = () => {
      resolveDone(trackInFlight(finalize(session)));
    };

    await new Promise<void>((resolve, reject) => {
      recorder.onstart = () => resolve();
      recorder.onerror = (e) =>
        reject((e as unknown as { error?: Error }).error ?? new Error("MediaRecorder error"));
      recorder.start(TIMESLICE_MS);
    });
    recorder.onerror = (e) =>
      reportError("recording_recorder_error", { callUuid: session.ctx.callUuid }, (e as unknown as { error?: Error }).error);
    stream.getAudioTracks().forEach((t) => {
      t.onended = () => track("recording_track_ended", { callUuid: session.ctx.callUuid });
    });

    session.resumedAt = Date.now();
    active = session;
    holdLock(recLockName(session.sessionId)).then((release) => {
      if (active === session) session.releaseLock = release;
      else release();
    });
    persist(session, () => putSession(toStored(session, "recording")));
    track("recording_started", { callUuid: session.ctx.callUuid, mimeType: session.mimeType });
    emit();
  } catch (err) {
    stream.getTracks().forEach((t) => t.stop());
    throw err;
  }
}

/**
 * Stops the recording, uploads it (with retry) and then logs the stop event.
 * Safe to call after the calling component unmounted — the work is owned here.
 */
export function stopManualRecording(): Promise<UploadResult> {
  const s = active;
  if (!s) return Promise.resolve({ status: "empty", bytes: 0 });
  track("recording_stop_requested", { callUuid: s.ctx.callUuid });
  if (s.recorder.state !== "inactive") s.recorder.stop();
  return s.done;
}

/** Update IDs mid-recording, e.g. when the start event returns a canonical call_uuid or job loads late. */
export function updateManualRecordingContext(patch: Partial<RecordingContext>) {
  if (!active) return;
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => isValidId(v)),
  ) as Partial<RecordingContext>;
  active.ctx = { ...active.ctx, ...clean };
  const s = active;
  persist(s, () => putSession(toStored(s, "recording")));
}

export function pauseManualRecording() {
  const s = active;
  if (!s || s.recorder.state !== "recording") return;
  s.recorder.pause();
  if (s.resumedAt !== null) {
    s.activeMs += Date.now() - s.resumedAt;
    s.resumedAt = null;
  }
  emit();
}

export function resumeManualRecording() {
  const s = active;
  if (!s || s.recorder.state !== "paused") return;
  s.recorder.resume();
  s.resumedAt = Date.now();
  emit();
}

// ─── Recovery ────────────────────────────────────────

let recovering: Promise<void> | null = null;

/** Uploads any recordings left in IndexedDB by a refresh, crash, closed tab or failed upload. */
export function recoverPendingRecordings(): Promise<void> {
  if (!recovering) {
    recovering = trackInFlight(doRecover()).finally(() => {
      recovering = null;
    });
  }
  return recovering;
}

async function doRecover(): Promise<void> {
  let sessions: StoredSession[];
  try {
    sessions = await getAllSessions();
  } catch (err) {
    reportError("recording_recovery_read_failed", {}, err);
    return;
  }

  for (const s of sessions) {
    if (s.sessionId === active?.sessionId || uploadingHere.has(s.sessionId)) continue;

    if (s.status === "failed") {
      if (Date.now() - s.updatedAt > FAILED_SESSION_TTL_MS) {
        await deleteSession(s.sessionId).catch(() => {});
      }
      continue;
    }

    if (s.status === "recording") {
      // Still live in another tab? Leave it alone.
      const held = await isLockHeld(recLockName(s.sessionId));
      const liveElsewhere =
        held ?? Date.now() - s.updatedAt < TIMESLICE_MS * 3; // no Web Locks: fall back to freshness
      if (liveElsewhere) continue;
    }

    pendingUploads++;
    emit();
    try {
      const chunks = await getChunks(s.sessionId);
      const blob = new Blob(chunks, { type: s.mimeType || "audio/webm" });
      track("recording_recovery_attempt", {
        callUuid: s.callUuid,
        sessionId: s.sessionId,
        previousStatus: s.status,
        bytes: blob.size,
      });
      await uploadStoredSession({ ...s, status: "stopped" }, blob);
    } catch (err) {
      reportError("recording_recovery_failed", { callUuid: s.callUuid }, err);
    } finally {
      pendingUploads--;
      emit();
    }
  }
}

// ─── Global wiring ───────────────────────────────────

let initialized = false;

/** Call once at app boot. Installs unload guard and retries leftover uploads. */
export function initManualRecording() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedRecording()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Flush the current slice to IndexedDB when the tab is hidden / being closed.
  const flush = () => {
    if (active && active.recorder.state === "recording") active.recorder.requestData();
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);

  if (!("indexedDB" in window)) return;

  navigator.storage?.persist?.().catch(() => {});
  window.addEventListener("online", () => {
    if (auth.currentUser) void recoverPendingRecordings();
  });
  onAuthStateChanged(auth, (user) => {
    if (user) void recoverPendingRecordings();
  });
}
