import React, { useEffect, useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

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

  useEffect(() => {
    if (open) {
      fetchPocs();
    }
  }, [open, workspaceId]);

  const filteredPocs = pocs.filter((poc) => {
    const normalized = normalizePocName(poc.name, poc.poc_email).toLowerCase();
    const rawNameMatch = poc.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const normalizedMatch = normalized.includes(searchQuery.toLowerCase());
    const emailMatch = poc.poc_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return rawNameMatch || normalizedMatch || emailMatch;
  });

  const selectedPoc = pocs.find((p) => p.poc_email === selectedPocEmail);
  const selectedPocDisplayName = selectedPoc
    ? normalizePocName(selectedPoc.name, selectedPoc.poc_email)
    : "";

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-[12px] py-[10px] border rounded-[6px] text-xs transition-colors h-9
          ${selectedPocEmail 
            ? "border-[#0F47F2] bg-[#E7EDFF] text-[#0F47F2] font-medium" 
            : "border-[#AEAEB2] text-[#AEAEB2] hover:bg-[#F3F5F7] bg-white"}`}
        title={selectedPoc ? `POC: ${selectedPocDisplayName}` : "Filter by Point of Contact"}
      >
        <User className="w-4 h-4" />
        {selectedPoc && <span className="max-w-[120px] truncate">{selectedPocDisplayName}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden z-[10020] flex flex-col">
          <div className="p-3 border-b border-[#F3F5F7] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4B5563]">Point of Contact</span>
            {selectedPocEmail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPocSelect(undefined);
                  setOpen(false);
                }}
                className="text-[10px] text-[#FF3B30] hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Search bar inside dropdown */}
          <div className="p-2 border-b border-[#F3F5F7] relative">
            <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
            <input
              type="text"
              placeholder="Search POC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F3F5F7] border-0 rounded-md text-xs text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/20"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#AEAEB2] gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F47F2]" /> Loading POCs...
              </div>
            ) : error ? (
              <div className="px-3 py-4 text-xs text-[#FF3B30] text-center">{error}</div>
            ) : filteredPocs.length === 0 ? (
              <div className="px-3 py-4 text-xs text-[#AEAEB2] text-center">No Point of Contacts found</div>
            ) : (
              <>
                {/* Option for "All POCs" */}
                <button
                  onClick={() => {
                    onPocSelect(undefined);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between hover:bg-[#F3F5F7]
                    ${!selectedPocEmail ? "text-[#0F47F2] font-semibold bg-[#E7EDFF]/30" : "text-[#4B5563]"}`}
                >
                  <span>All POCs</span>
                  {!selectedPocEmail && <Check className="w-3.5 h-3.5 text-[#0F47F2]" />}
                </button>

                {filteredPocs.map((poc) => {
                  const isSelected = selectedPocEmail === poc.poc_email;
                  const formattedName = normalizePocName(poc.name, poc.poc_email);
                  const hasCounts =
                    poc.total_jobs !== undefined ||
                    poc.active_jobs !== undefined ||
                    poc.inactive_jobs !== undefined;

                  return (
                    <button
                      key={poc.poc_email}
                      onClick={() => {
                        onPocSelect(poc.poc_email);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between hover:bg-[#F3F5F7]
                        ${isSelected ? "text-[#0F47F2] font-semibold bg-[#E7EDFF]/30" : "text-[#4B5563]"}`}
                    >
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-gray-800 font-medium">{formattedName}</span>
                        </div>
                        {poc.poc_email && (
                          <span className="text-[10px] text-[#AEAEB2] truncate">{poc.poc_email}</span>
                        )}

                        {/* Job Breakdown Badges */}
                        {hasCounts && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {poc.active_jobs !== undefined && (
                              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                {poc.active_jobs} Active
                              </span>
                            )}
                            {poc.inactive_jobs !== undefined && (
                              <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                                {poc.inactive_jobs} Inactive
                              </span>
                            )}
                            {poc.total_jobs !== undefined && (
                              <span className="text-[9px] font-semibold text-[#0F47F2] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                                {poc.total_jobs} Total
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0F47F2] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPocFilter;
