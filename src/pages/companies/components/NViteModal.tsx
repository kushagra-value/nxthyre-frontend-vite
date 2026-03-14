import { useState, useEffect } from "react";
import { X, Send, Loader2, ChevronDown, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { naukbotService, NaukriJob } from "../../../services/naukbotService";

interface NViteModalProps {
  /** UUIDs of the NaukriBotCandidates to nVite */
  candidateIds: string[];
  /** nxthyre job id for log context (optional) */
  nxthyreJobId?: number | null;
  /** nxthyre job title — used as default keyword */
  jobTitle?: string;
  onClose: () => void;
  /** Called after a successful send so the parent can refresh the list */
  onSuccess: () => void;
}

interface SendResult {
  batch_id: string;
  naukri_job_title: string;
  total: number;
  contacted: number;
  not_contacted: number;
  skipped: number;
  failed: number;
  credits_left: number;
}

export default function NViteModal({
  candidateIds,
  nxthyreJobId,
  jobTitle,
  onClose,
  onSuccess,
}: NViteModalProps) {
  const [jobs, setJobs] = useState<NaukriJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [keyword, setKeyword] = useState(jobTitle ?? "");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  /* ── Fetch Naukri Jobs ───────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await naukbotService.getNaukriJobs();
        setJobs(res.jobs);
        if (res.jobs.length > 0) setSelectedJobId(res.jobs[0].job_id);
      } catch (err: any) {
        setJobsError(err.message || "Failed to load Naukri jobs");
      } finally {
        setLoadingJobs(false);
      }
    })();
  }, []);

  /* ── Send NVite ──────────────────────────────────── */
  const handleSend = async () => {
    if (!selectedJobId || candidateIds.length === 0) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await naukbotService.sendNVite(
        candidateIds,
        selectedJobId,
        keyword || undefined,
        nxthyreJobId ?? undefined
      );
      setResult(res as SendResult);
      onSuccess();
    } catch (err: any) {
      setSendError(err.message || "Failed to send NVites");
    } finally {
      setSending(false);
    }
  };

  const selectedJob = jobs.find((j) => j.job_id === selectedJobId);

  /* ── Result Screen ───────────────────────────────── */
  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F47F2] to-[#4F68FC] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <h2 className="text-lg font-semibold">NVite Sent!</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[13px] text-blue-100 mt-1">{result.naukri_job_title}</p>
          </div>

          {/* Stats Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard label="Contacted" value={result.contacted} color="#009951" bg="#D1F7DB" />
              <StatCard label="Not Contacted" value={result.not_contacted} color="#B45309" bg="#FEF3C7" />
              <StatCard label="Skipped" value={result.skipped} color="#6B7280" bg="#F3F4F6" />
              <StatCard label="Failed" value={result.failed} color="#DC2626" bg="#FEE2E2" />
            </div>

            {result.skipped > 0 && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 text-[12.5px] text-amber-800">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <span>
                  <strong>{result.skipped}</strong> candidate(s) were skipped because they are missing{" "}
                  <code className="bg-amber-100 px-1 rounded">naukri_js_user_id</code>. Re-run the Naukri Bot
                  pipeline for this job to back-fill the value and try again.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[13px] text-[#6B7280] bg-[#F9FAFB] rounded-xl px-4 py-3 mb-5">
              <span>Credits remaining</span>
              <span className="font-semibold text-[#374151]">{result.credits_left}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0F47F2] text-white text-sm font-semibold hover:bg-[#0A3BCC] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Send Screen ─────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F47F2] to-[#4F68FC] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Send className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Send NVite</h2>
            </div>
            <button
              onClick={onClose}
              disabled={sending}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[13px] text-blue-100 mt-1">
            Sending Naukri broadcast invite to{" "}
            <span className="font-semibold text-white">{candidateIds.length}</span> candidate
            {candidateIds.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Job Picker */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Naukri Job <span className="text-red-500">*</span>
            </label>
            {loadingJobs ? (
              <div className="flex items-center gap-2 h-10 text-[13px] text-[#8E8E93]">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading jobs…
              </div>
            ) : jobsError ? (
              <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {jobsError}
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={sending}
                  className="w-full appearance-none h-10 pl-3 pr-9 rounded-xl border border-[#E5E7EB] text-[13px] text-[#374151] focus:outline-none focus:border-[#0F47F2] bg-white transition-colors disabled:opacity-50"
                >
                  {jobs.map((j) => (
                    <option key={j.job_id} value={j.job_id}>
                      {j.title} ({j.job_id})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
              </div>
            )}

            {/* Selected job preview */}
            {selectedJob && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedJob.locations.map((loc) => (
                  <span key={loc} className="text-[11px] bg-[#EEF2FF] text-[#4F68FC] rounded-full px-2 py-0.5 font-medium">
                    {loc}
                  </span>
                ))}
                <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5 font-medium">
                  {selectedJob.min_experience}–{selectedJob.max_experience} yrs
                </span>
                {selectedJob.key_skills.slice(0, 3).map((s) => (
                  <span key={s} className="text-[11px] bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Broadcast Keyword{" "}
              <span className="font-normal text-[#9CA3AF]">(optional — helps Naukri create a better session)</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={sending}
              placeholder="e.g. Senior Python Engineer"
              className="w-full h-10 px-3 rounded-xl border border-[#E5E7EB] text-[13px] text-[#374151] placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#0F47F2] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-[12.5px] text-blue-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
            <span>
              Candidates without a <code className="bg-blue-100 px-1 rounded">naukri_js_user_id</code> will be
              automatically skipped. Re-run the Naukri Bot pipeline to back-fill missing IDs.
            </span>
          </div>

          {/* Send Error */}
          {sendError && (
            <div className="flex items-start gap-2 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {sendError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || loadingJobs || !!jobsError || !selectedJobId}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0F47F2] text-white text-sm font-semibold hover:bg-[#0A3BCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send NVite to {candidateIds.length} Candidate{candidateIds.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helper ─────────────────────────────────────
function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex items-center justify-between"
      style={{ backgroundColor: bg }}
    >
      <span className="text-[13px] font-medium" style={{ color }}>
        {label}
      </span>
      <span className="text-lg font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
