import { useState } from "react";
import {
  X,
  Link as LinkIcon,
  Tag as TagIcon,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface NaukbotUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, tag: string) => Promise<void> | void;
}

export default function NaukbotUrlModal({
  isOpen,
  onClose,
  onSubmit,
}: NaukbotUrlModalProps) {
  const [url, setUrl] = useState("");
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    const trimmedTag = tag.trim();

    if (!trimmedUrl) {
      setError("Please enter a Naukri URL.");
      return;
    }

    if (!trimmedTag) {
      setError("Please enter a source tag.");
      return;
    }

    try {
      const formattedUrl = trimmedUrl.startsWith("http")
        ? trimmedUrl
        : `https://${trimmedUrl}`;

      const parsedUrl = new URL(formattedUrl);
      console.log("check the parsed url as of now ",parsedUrl);

      if (!parsedUrl.hostname.toLowerCase().includes("naukri")) {
        setError("Please enter a valid Naukri URL.");
        return;
      }
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(trimmedUrl, trimmedTag);

      toast.success(
        "Sourcing started successfully. Candidates will appear once processing completes."
      );

      setUrl("");
      setTag("");
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "";

      if (
        err?.response?.status === 409 ||
        message.toLowerCase().includes("already active")
      ) {
        setError(
          "A sourcing job is already running for this requisition. Please wait until it completes."
        );
      } else {
        setError(message || "Failed to start sourcing. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F47F2] to-[#4F68FC] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h2 className="text-lg font-semibold">
                Source Candidates by URL
              </h2>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (!submitting) onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 transition disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-blue-100 mt-2">
            Paste a Naukri URL and assign a source tag to organize the sourced
            candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Naukri URL <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="url"
                value={url}
                disabled={submitting}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.naukri.com/..."
                className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-sm focus:outline-none focus:border-[#0F47F2]"
              />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Paste the Naukri search or job URL from which candidates should be
              sourced.
            </p>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Source Tag <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                maxLength={50}
                value={tag}
                disabled={submitting}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Frontend Hiring"
                className="w-full h-11 rounded-lg border border-gray-200 pl-10 pr-3 text-sm focus:outline-none focus:border-[#0F47F2]"
              />
            </div>

            <p className="text-xs text-gray-500 mt-1">
              This tag helps you identify and filter candidates sourced from
              this search.
            </p>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
            Candidates will be added to this job once the sourcing process
            completes.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (!submitting) onClose();
              }}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#0F47F2] py-2.5 text-white font-medium hover:bg-[#0A3BCC] disabled:opacity-50"
            >
              {submitting ? "Starting..." : "Start Sourcing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}