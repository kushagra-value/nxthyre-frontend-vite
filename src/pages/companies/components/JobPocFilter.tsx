import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { User, X, Check, Loader2, Search } from "lucide-react";
import { jobPostService } from "../../../services/jobPostService";

interface JobPocFilterProps {
  workspaceId?: number;
  selectedPocEmail?: string;
  onPocSelect: (pocEmail: string | undefined) => void;
}

export interface PocOption {
  poc_email: string;
  name: string;
  total_jobs?: number;
  active_jobs?: number;
  inactive_jobs?: number;
}

/**
 * Normalizes raw email handles (e.g. "anushtha.shrivastava" or "anushtha.shrivastava@ascendion.com")
 * into properly capitalized, human-readable names (e.g. "Anushtha Shrivastava").
 */
export const normalizePocName = (name?: string, email?: string): string => {
  let raw = (name && name.trim()) || (email && email.trim()) || "";
  if (!raw) return "Unknown";

  // If raw contains an email address, extract handle before '@'
  if (raw.includes("@")) {
    raw = raw.split("@")[0];
  }

  // Replace dots, underscores, and hyphens with spaces
  const cleaned = raw.replace(/[._-]+/g, " ").trim();

  if (!cleaned) return "Unknown";

  // Capitalize each word
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const JobPocFilter: React.FC<JobPocFilterProps> = ({
  workspaceId,
  selectedPocEmail,
  onPocSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [pocs, setPocs] = useState<PocOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const modalContentRef = useRef<HTMLDivElement>(null);

  const fetchPocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostService.getUniquePocs(workspaceId);
      setPocs(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load POCs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch POCs when workspace changes or when modal is opened
  useEffect(() => {
    fetchPocs();
  }, [workspaceId]);

  useEffect(() => {
    if (open && pocs.length === 0 && !loading) {
      fetchPocs();
    }
  }, [open]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const filteredPocs = useMemo(() => {
    return pocs.filter((poc) => {
      const normalized = normalizePocName(poc.name, poc.poc_email).toLowerCase();
      const rawNameMatch = poc.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const normalizedMatch = normalized.includes(searchQuery.toLowerCase());
      const emailMatch = poc.poc_email?.toLowerCase().includes(searchQuery.toLowerCase());
      return rawNameMatch || normalizedMatch || emailMatch;
    });
  }, [pocs, searchQuery]);

  const selectedPoc = pocs.find((p) => p.poc_email === selectedPocEmail);
  const selectedPocDisplayName = selectedPoc
    ? normalizePocName(selectedPoc.name, selectedPoc.poc_email)
    : selectedPocEmail
    ? normalizePocName(undefined, selectedPocEmail)
    : "";

  const totalJobsCount = useMemo(
    () => pocs.reduce((sum, p) => sum + (p.total_jobs || 0), 0),
    [pocs]
  );
  const activeJobsCount = useMemo(
    () => pocs.reduce((sum, p) => sum + (p.active_jobs || 0), 0),
    [pocs]
  );
  const inactiveJobsCount = useMemo(
    () => pocs.reduce((sum, p) => sum + (p.inactive_jobs || 0), 0),
    [pocs]
  );

  const handleSelectPoc = (email?: string) => {
    if (!email) {
      onPocSelect(undefined);
    } else if (selectedPocEmail === email) {
      // Toggle off if already selected
      onPocSelect(undefined);
    } else {
      onPocSelect(email);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button (Profile Icon in Toolbar) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`h-9 flex items-center gap-2 border rounded-[6px] text-xs transition-colors shrink-0
          ${selectedPocDisplayName ? "px-3" : "w-9 justify-center"}
          ${selectedPocEmail || open
            ? "border-[#0F47F2] bg-[#E7EDFF] text-[#0F47F2] font-medium"
            : "border-[#0F47F2] text-[#0F47F2] hover:bg-blue-50/60 bg-white"}`}
        title={selectedPocDisplayName ? `POC: ${selectedPocDisplayName}` : "Filter by Point of Contact"}
        aria-label="Filter by Point of Contact"
      >
        <User className="w-4 h-4 text-[#0F47F2]" />
        {selectedPocDisplayName && (
          <span className="max-w-[130px] truncate">{selectedPocDisplayName}</span>
        )}
        {selectedPocEmail && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onPocSelect(undefined);
            }}
            className="p-0.5 hover:bg-blue-100 rounded-full transition-colors ml-0.5 cursor-pointer"
            title="Clear POC filter"
          >
            <X className="w-3 h-3 text-[#0F47F2]" />
          </span>
        )}
      </button>

      {/* Dialogue Box Modal */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setOpen(false);
              }
            }}
          >
            <div
              ref={modalContentRef}
              className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-200/90 w-full max-w-[620px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E7EDFF] flex items-center justify-center text-[#0F47F2]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                      Filter by Point of Contact
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Select a POC to filter jobs across the workspace
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPocEmail && (
                    <button
                      type="button"
                      onClick={() => handleSelectPoc(undefined)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Clear Filter
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Search Bar + Color Legend row */}
              <div className="px-6 pb-3 pt-1 flex items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search POC by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#F3F5F7] border border-transparent rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-[#0F47F2]/40 focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/10 transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Color Legend: Blue = Total, Green = Active, Gray = Inactive */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="w-[70px] flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200/70"
                    title="Blue indicates Total Jobs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0F47F2] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#0F47F2]">Total</span>
                  </div>
                  <div
                    className="w-[70px] flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70"
                    title="Green indicates Active Jobs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#16A34A]">Active</span>
                  </div>
                  <div
                    className="w-[70px] flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-100 border border-gray-200/70"
                    title="Gray indicates Inactive Jobs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#6B7280] shrink-0" />
                    <span className="text-[11px] font-semibold text-[#6B7280]">Inactive</span>
                  </div>
                </div>
              </div>

              {/* Separation Line */}
              <div className="border-b border-[#E5E7EB]" />

              {/* POC List */}
              <div className="max-h-[380px] overflow-y-auto px-6 py-3 space-y-1.5 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-xs text-gray-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F47F2]" />
                    <span>Loading Point of Contacts...</span>
                  </div>
                ) : error ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-red-500 mb-2">{error}</p>
                    <button
                      type="button"
                      onClick={fetchPocs}
                      className="text-xs text-[#0F47F2] hover:underline font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredPocs.length === 0 && searchQuery ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <User className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-medium text-gray-600">No Point of Contacts found</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      No POC matched &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                ) : (
                  <>
                    {/* "All Point of Contacts" option */}
                    {(!searchQuery || "all point of contacts".includes(searchQuery.toLowerCase())) && (
                      <div
                        onClick={() => handleSelectPoc(undefined)}
                        className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          !selectedPocEmail
                            ? "bg-[#E7EDFF]/40 border-[#0F47F2]/40"
                            : "hover:bg-[#F9FAFB] border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                          {/* Checkbox */}
                          <div
                            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                              !selectedPocEmail
                                ? "bg-[#0F47F2] border-[#0F47F2] text-white"
                                : "border-gray-300 bg-white group-hover:border-[#0F47F2]"
                            }`}
                          >
                            {!selectedPocEmail && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs font-semibold truncate ${
                                !selectedPocEmail ? "text-[#0F47F2]" : "text-gray-900"
                              }`}
                            >
                              All Point of Contacts
                            </div>
                            <div className="text-[11px] text-gray-500 truncate">
                              Show jobs across all POCs
                            </div>
                          </div>
                        </div>

                        {/* Counts: Total, Active, Inactive */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#0F47F2] bg-blue-50/80 border border-blue-200/60"
                            title={`${totalJobsCount} Total Jobs`}
                          >
                            {totalJobsCount}
                          </div>
                          <div
                            className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#16A34A] bg-emerald-50/80 border border-emerald-200/60"
                            title={`${activeJobsCount} Active Jobs`}
                          >
                            {activeJobsCount}
                          </div>
                          <div
                            className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#6B7280] bg-gray-100 border border-gray-200/60"
                            title={`${inactiveJobsCount} Inactive Jobs`}
                          >
                            {inactiveJobsCount}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Filtered POC Rows */}
                    {filteredPocs.map((poc) => {
                      const isSelected = selectedPocEmail === poc.poc_email;
                      const formattedName = normalizePocName(poc.name, poc.poc_email);

                      return (
                        <div
                          key={poc.poc_email}
                          onClick={() => handleSelectPoc(poc.poc_email)}
                          className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-[#E7EDFF]/40 border-[#0F47F2]/40"
                              : "hover:bg-[#F9FAFB] border-transparent"
                          }`}
                        >
                          {/* Left: [] name / email */}
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                            {/* Checkbox */}
                            <div
                              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? "bg-[#0F47F2] border-[#0F47F2] text-white"
                                  : "border-gray-300 bg-white group-hover:border-[#0F47F2]"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-xs font-semibold truncate ${
                                  isSelected ? "text-[#0F47F2]" : "text-gray-900"
                                }`}
                              >
                                {formattedName}
                              </div>
                              {poc.poc_email && (
                                <div className="text-[11px] text-gray-500 truncate">
                                  {poc.poc_email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: total_number active_number inactive_number */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div
                              className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#0F47F2] bg-blue-50/80 border border-blue-200/60"
                              title={`${poc.total_jobs ?? 0} Total Jobs`}
                            >
                              {poc.total_jobs ?? 0}
                            </div>
                            <div
                              className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#16A34A] bg-emerald-50/80 border border-emerald-200/60"
                              title={`${poc.active_jobs ?? 0} Active Jobs`}
                            >
                              {poc.active_jobs ?? 0}
                            </div>
                            <div
                              className="w-[70px] text-center py-1 rounded-md text-xs font-semibold text-[#6B7280] bg-gray-100 border border-gray-200/60"
                              title={`${poc.inactive_jobs ?? 0} Inactive Jobs`}
                            >
                              {poc.inactive_jobs ?? 0}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Subtle Footer */}
              <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-6 py-2.5 flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  Showing {filteredPocs.length} {filteredPocs.length === 1 ? "POC" : "POCs"}
                </span>
                {selectedPocEmail && (
                  <span className="font-medium text-[#0F47F2]">
                    Filtered by: {selectedPocDisplayName}
                  </span>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default JobPocFilter;

