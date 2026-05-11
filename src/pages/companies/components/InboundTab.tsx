import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, ArrowRight, ArrowLeft, Plus, Check, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../services/api";
import { candidateService } from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";
import PipelineFilterPanel, { PipelineFiltersState, EMPTY_PIPELINE_FILTERS } from "./PipelineFilterPanel";
import { getAttentionPill } from "../../../utils/candidateAttention";

interface InboundTabProps {
  jobId: number | null;
  isAscendionWorkspace: boolean;
  onSelectCandidate?: (
    candidate: any,
    allCandidates?: any[],
    index?: number
  ) => void;
}

/** Convert PipelineFiltersState → backend search API payload fields */
function buildFilterPayload(filters: PipelineFiltersState): Record<string, any> {
  const payload: Record<string, any> = {};

  // Locations
  if (filters.location.length > 0) {
    payload.locations = filters.location;
  }

  // Salary range (LPA string → number)
  if (filters.salaryRange.min) {
    payload.salary_min = Number(filters.salaryRange.min);
  }
  if (filters.salaryRange.max) {
    payload.salary_max = Number(filters.salaryRange.max);
  }

  // Experience range
  if (filters.experience.min) {
    payload.experience_min = Number(filters.experience.min);
  }
  if (filters.experience.max) {
    payload.experience_max = Number(filters.experience.max);
  }

  // Designation (treated as keywords/companies filter)
  if (filters.designation.length > 0) {
    payload.designation = filters.designation;
  }

  // Notice period – use selected labels or min/max days
  const noticePeriodMap: Record<string, number> = {
    Immediate: 0,
    "15 days": 15,
    "30 days": 30,
    "60 days": 60,
    "90 days": 90,
  };
  if (filters.noticePeriod.selected.length > 0) {
    // Pick the max selected bucket so the backend returns candidates within that range
    const maxDays = Math.max(
      ...filters.noticePeriod.selected.map((s) => noticePeriodMap[s] ?? 0)
    );
    payload.notice_period_max_days = maxDays;
  }
  if (filters.noticePeriod.maxDays) {
    payload.notice_period_max_days = Number(filters.noticePeriod.maxDays);
  }
  if (filters.noticePeriod.minDays) {
    payload.notice_period_min_days = Number(filters.noticePeriod.minDays);
  }

  return payload;
}

export default function InboundTab({ jobId, isAscendionWorkspace, onSelectCandidate }: InboundTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("score_desc");
  const pageSize = 10;
  
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // -- Candidate Edit Modal State --
  const [showCandidateEditModal, setShowCandidateEditModal] = useState(false);
  const [candidateEditing, setCandidateEditing] = useState<any | null>(null);
  const [candidateEditForm, setCandidateEditForm] = useState({
    notice_period_days: "",
    current_ctc_lpa: "",
    expected_ctc_lpa: "",
    current_take_home: "",
    last_working_day: "",
    location: "",
    exp: "",
  });

  useEffect(() => {
    if (showCandidateEditModal && candidateEditing) {
      const cand = candidateEditing; // InboundTab candidates are raw candidate objects

      const extractNum = (val: any) => {
        if (val == null) return "";
        const match = val.toString().match(/[\d.]+/);
        return match ? match[0] : "";
      };

      let noticePeriodDays = cand.notice_period_days?.toString() || "";
      if (!noticePeriodDays && cand.notice_period_summary) {
        if (cand.notice_period_summary.toLowerCase().includes("immediate")) {
          noticePeriodDays = "0";
        } else {
          const match = cand.notice_period_summary.match(/\d+/);
          if (match) noticePeriodDays = match[0];
        }
      }

      setCandidateEditForm({
        notice_period_days: noticePeriodDays,
        current_ctc_lpa: extractNum(cand.current_salary_lpa || cand.current_salary),
        expected_ctc_lpa: extractNum(cand.expected_ctc),
        current_take_home: extractNum(cand.current_take_home),
        last_working_day: cand.last_working_day || "",
        location: cand.location || "",
        exp: extractNum(cand.total_experience ?? cand.experience_years),
      });
    }
  }, [showCandidateEditModal, candidateEditing]);

  useEffect(() => {
    if (!showCandidateEditModal) {
      setCandidateEditForm({
        notice_period_days: "",
        current_ctc_lpa: "",
        expected_ctc_lpa: "",
        current_take_home: "",
        last_working_day: "",
        location: "",
        exp: "",
      });
    }
  }, [showCandidateEditModal]);

  const handleCandidateEditSave = async () => {
    if (!candidateEditing) return;

    const uuid = candidateEditing.id;
    const payload: any = {};
    let valid = true;

    if (candidateEditForm.notice_period_days !== "") {
      const days = parseInt(candidateEditForm.notice_period_days, 10);
      if (isNaN(days) || days < 0) {
        showToast.error("Notice period must be a non-negative number");
        valid = false;
      } else {
        payload.notice_period_days = days;
      }
    }

    if (candidateEditForm.current_ctc_lpa !== "") {
      const lpa = parseFloat(candidateEditForm.current_ctc_lpa);
      if (isNaN(lpa) || lpa < 0) {
        showToast.error("Current CTC must be a non-negative number");
        valid = false;
      } else {
        payload.current_salary = lpa;
      }
    }

    if (candidateEditForm.expected_ctc_lpa !== "") {
      const lpa = parseFloat(candidateEditForm.expected_ctc_lpa);
      if (isNaN(lpa) || lpa < 0) {
        showToast.error("Expected CTC must be a non-negative number");
        valid = false;
      } else {
        payload.expected_ctc = lpa.toString();
      }
    }

    if (candidateEditForm.current_take_home !== "") {
      const val = parseFloat(candidateEditForm.current_take_home);
      if (isNaN(val) || val < 0) {
        showToast.error("Current take home must be a non-negative number");
        valid = false;
      } else {
        payload.current_take_home = val;
      }
    }

    if (candidateEditForm.last_working_day !== "") {
      payload.last_working_day = candidateEditForm.last_working_day;
    }

    if (candidateEditForm.location !== "") {
      payload.location = candidateEditForm.location.trim();
    }

    if (candidateEditForm.exp !== "") {
      const val = parseFloat(candidateEditForm.exp);
      if (isNaN(val) || val < 0) {
        showToast.error("Experience must be a non-negative number");
        valid = false;
      } else {
        payload.exp = val;
      }
    }

    if (!valid) return;

    if (Object.keys(payload).length === 0) {
      showToast.info("No changes to save");
      setShowCandidateEditModal(false);
      return;
    }

    try {
      await apiClient.patch(`/candidates/${uuid}/editable-fields/`, payload);

      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === uuid) {
            const updatedCand = { ...c };
            if (payload.notice_period_days !== undefined) {
              updatedCand.notice_period_days = payload.notice_period_days;
              updatedCand.notice_period_summary =
                payload.notice_period_days === 0
                  ? "Immediate"
                  : `${payload.notice_period_days} days`;
            }
            if (payload.current_salary !== undefined) {
              const lpaStr =
                payload.current_salary % 1 === 0
                  ? `${payload.current_salary}`
                  : payload.current_salary.toFixed(1);
              updatedCand.current_salary_lpa = lpaStr;
            }
            if (payload.expected_ctc !== undefined) {
              const lpaVal = parseFloat(payload.expected_ctc);
              const lpaStr =
                lpaVal % 1 === 0 ? `${lpaVal}` : lpaVal.toFixed(1);
              updatedCand.expected_ctc = lpaStr;
            }
            if (payload.current_take_home !== undefined) {
              updatedCand.current_take_home = payload.current_take_home;
            }
            if (payload.last_working_day !== undefined) {
              updatedCand.last_working_day = payload.last_working_day;
            }
            if (payload.location !== undefined) {
              updatedCand.location = payload.location;
            }
            if (payload.exp !== undefined) {
              updatedCand.total_experience = payload.exp;
              updatedCand.experience_years = `${payload.exp} years`;
            }
            return updatedCand;
          }
          return c;
        }),
      );

      showToast.success("Candidate details updated successfully");
      setShowCandidateEditModal(false);
    } catch (error: any) {
      console.error("Edit save error:", error);
      showToast.error(
        error.response?.data?.detail || "Failed to update candidate details",
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyCandidateEmail = async (item: any) => {
    const email = item.premium_data?.email || item.premium_data?.all_emails?.[0] || "";
    if (!email) {
      showToast.error("Candidate email not available");
      return;
    }
    await navigator.clipboard.writeText(email);
    showToast.success("Email copied");
  };

  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFiltersState>(EMPTY_PIPELINE_FILTERS);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const ascendionNonDupStorageKey = jobId ? `_nxthyre_ascendion_nondup_${jobId}` : null;
  const [ascendionCheckingIds, setAscendionCheckingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [verifiedNonDuplicateIds, setVerifiedNonDuplicateIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (!ascendionNonDupStorageKey) {
      setVerifiedNonDuplicateIds(new Set());
      return;
    }
    try {
      const raw = sessionStorage.getItem(ascendionNonDupStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setVerifiedNonDuplicateIds(
          new Set(parsed.filter((v) => typeof v === "string")),
        );
      } else {
        setVerifiedNonDuplicateIds(new Set());
      }
    } catch {
      setVerifiedNonDuplicateIds(new Set());
    }
  }, [ascendionNonDupStorageKey]);

  useEffect(() => {
    if (!ascendionNonDupStorageKey) return;
    sessionStorage.setItem(
      ascendionNonDupStorageKey,
      JSON.stringify(Array.from(verifiedNonDuplicateIds)),
    );
  }, [ascendionNonDupStorageKey, verifiedNonDuplicateIds]);

  // Count active filters for badge
  const activeFilterCount = (() => {
    let count = 0;
    if (pipelineFilters.location.length > 0) count++;
    if (pipelineFilters.salaryRange.min || pipelineFilters.salaryRange.max) count++;
    if (pipelineFilters.experience.min || pipelineFilters.experience.max) count++;
    if (pipelineFilters.designation.length > 0) count++;
    if (pipelineFilters.noticePeriod.selected.length > 0 || pipelineFilters.noticePeriod.minDays || pipelineFilters.noticePeriod.maxDays) count++;
    if (pipelineFilters.attention.length > 0) count++;
    return count;
  })();

  useEffect(() => {
    if (!jobId) return;
    const timeoutId = setTimeout(() => {
      fetchInboundCandidates(currentPage);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [jobId, currentPage, searchQuery, sortBy, pipelineFilters]);

  const handleApplyFilters = useCallback((filters: PipelineFiltersState) => {
    setPipelineFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const fetchInboundCandidates = async (page: number) => {
    try {
      setLoading(true);
      const payload: any = {
        job_id: jobId?.toString(),
        tab: "inbound",
        sort_by: sortBy,
      };
      if (searchQuery.trim()) {
        payload.text_query = searchQuery.trim();
      }

      // Merge pipeline filter fields into the payload
      const filterFields = buildFilterPayload(pipelineFilters);
      Object.assign(payload, filterFields);

      const response = await apiClient.post(`/candidates/search/?page=${page}`, payload);
      setCandidates(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch inbound candidates", error);
    } finally {
      setLoading(false);
    }
  };

  const runAscendionDuplicateCheck = useCallback(
    async (candidateId: string) => {
      if (!jobId) return;
      setAscendionCheckingIds((prev) => new Set(prev).add(candidateId));
      try {
        const res = await apiClient.post("/candidates/ascendion/check-duplicate/", {
          candidate_id: candidateId,
          job_id: jobId,
        });

        const isDup = res.data?.is_duplicate;
        if (isDup === true) {
          showToast.error("Duplicate in Ascendion portal");
        } else if (isDup === false) {
          showToast.success("Not a duplicate in Ascendion portal");
          setVerifiedNonDuplicateIds((prev) => {
            const next = new Set(prev);
            next.add(candidateId);
            return next;
          });
        } else {
          showToast.info("Ascendion duplicate check completed");
        }

        fetchInboundCandidates(currentPage);
      } catch (err: any) {
        showToast.error(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to check Ascendion duplicate",
        );
      } finally {
        setAscendionCheckingIds((prev) => {
          const next = new Set(prev);
          next.delete(candidateId);
          return next;
        });
      }
    },
    [jobId, currentPage, fetchInboundCandidates],
  );

  const toggleSelection = (id: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === candidates.length && candidates.length > 0) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map((c) => c.id)));
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pb-12">
      <div className="mx-8 mt-4">
        {/* Search and Filters */}
        <div className="bg-white border-x border-t border-[#E5E7EB] rounded-t-xl px-6 py-4 flex items-center justify-between">
          <div className="relative w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
            <input 
              type="text" 
              placeholder="Search for Candidates" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none border border-[#E5E7EB] focus:border-[#0F47F2] transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 ${showFilterPanel ? "bg-[#E7EDFF] text-[#0F47F2] border-[#0F47F2]" : "bg-white text-[#8E8E93] border-[#E5E7EB] hover:bg-[#F3F5F7]"}`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-[#0F47F2] text-white text-[11px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <PipelineFilterPanel
                isOpen={showFilterPanel}
                onClose={() => setShowFilterPanel(false)}
                onApply={handleApplyFilters}
                initialFilters={pipelineFilters}
                anchorRef={filterButtonRef}
                jobId={jobId!}
              />
            </div>
            <div className="w-px h-6 bg-[#E5E7EB] mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#E7EDFF] hover:text-[#0F47F2] hover:border-[#0F47F2] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6663 9.3321C14.6471 11.6081 14.5207 12.8628 13.6933 13.6903C12.7167 14.6668 11.1449 14.6668 8.00141 14.6668C4.85789 14.6668 3.28614 14.6668 2.30957 13.6903C1.33301 12.7137 1.33301 11.142 1.33301 7.99843C1.33301 4.85491 1.33301 3.28315 2.30957 2.30658C3.137 1.47915 4.39172 1.3528 6.66774 1.3335" stroke="currentColor" strokeLinecap="round" />
                <path d="M14.6667 4.66683H9.33333C8.1216 4.66683 7.39113 5.26151 7.12027 5.53369C7.0364 5.61798 6.99447 5.66014 6.99387 5.66071C6.99333 5.66128 6.95113 5.70322 6.86687 5.78711C6.59468 6.05797 6 6.78843 6 8.00016V10.0002M14.6667 4.66683L11.3333 1.3335M14.6667 4.66683L11.3333 8.00016" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Share Pipeline
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30">
              <svg width="15" height="13" viewBox="0 0 15 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.8184 4.50737C10.8234 4.50735 10.8283 4.50734 10.8333 4.50734C12.4902 4.50734 13.8333 5.85295 13.8333 7.51284C13.8333 9.05986 12.6666 10.3339 11.1667 10.5M10.8184 4.50737C10.8283 4.39737 10.8333 4.28597 10.8333 4.17339C10.8333 2.14463 9.19171 0.5 7.16667 0.5C5.24883 0.5 3.67488 1.97511 3.51362 3.85461M10.8184 4.50737C10.7502 5.26506 10.4524 5.9564 9.99522 6.51101M3.51362 3.85461C1.82265 4.01582 0.5 5.44261 0.5 7.1789C0.5 8.79449 1.64517 10.1421 3.16667 10.4515M3.51362 3.85461C3.61884 3.84458 3.72549 3.83945 3.83333 3.83945C4.58388 3.83945 5.2765 4.08796 5.83366 4.50734" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.16667 7.1665L7.16667 12.4998M7.16667 7.1665C6.69985 7.1665 5.82769 8.49604 5.5 8.83317M7.16667 7.1665C7.63348 7.1665 8.50565 8.49604 8.83333 8.83317" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1.3335V2.66683M4 1.3335V2.66683" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.66667 11.3337L6.66666 8.89847C6.66666 8.77063 6.5755 8.66699 6.46305 8.66699H6M9.08644 11.3337L9.98945 8.89977C10.0317 8.78596 9.94189 8.66699 9.81379 8.66699H8.66667" stroke="currentColor" strokeLinecap="round" />
                <path d="M1.66699 8.16216C1.66699 5.25729 1.66699 3.80486 2.50174 2.90243C3.33648 2 4.67999 2 7.36699 2H8.63366C11.3207 2 12.6642 2 13.4989 2.90243C14.3337 3.80486 14.3337 5.25729 14.3337 8.16216V8.5045C14.3337 11.4094 14.3337 12.8618 13.4989 13.7642C12.6642 14.6667 11.3207 14.6667 8.63366 14.6667H7.36699C4.67999 14.6667 3.33648 14.6667 2.50174 13.7642C1.66699 12.8618 1.66699 11.4094 1.66699 8.5045V8.16216Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border-x border-t border-[#E5E7EB] overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={candidates.length > 0 && selectedCandidates.size === candidates.length}
                    onChange={toggleSelectAll}
                    disabled={candidates.length === 0}
                    className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]" 
                  />
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Candidate</th>
                <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Match Score</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Location</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Exp</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">CTC</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Expected CTC</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Notice Period</th>
                <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Source</th>
                <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Attention</th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F5F7]">
               {loading ? (
                 <tr>
                   <td colSpan={11} className="px-6 py-12 text-center text-[#8E8E93]">Loading candidates...</td>
                 </tr>
               ) : candidates.length === 0 ? (
                 <tr>
                   <td colSpan={11} className="px-6 py-12 text-center text-[#8E8E93]">No candidates found.</td>
                 </tr>
               ) : (() => {
                 const inboundCandidatesMapped = candidates.map(c => ({ id: null, candidate: { ...c, application_type: "inbound" }, application_type: "inbound" }));
                 return candidates.map((item, index) => {
                  const scoreRaw = item.job_score?.candidate_match_score?.score?.replace("%", "") || "0";
                  const score = parseInt(scoreRaw, 10);
                  const scoreColor = score >= 80 ? "#00C8B3" : score >= 60 ? "#F59E0B" : "#EA580C";
                  
                  return (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => onSelectCandidate && onSelectCandidate(inboundCandidatesMapped[index], inboundCandidatesMapped, index)}>
                    <td className="px-6 py-6 border-transparent" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedCandidates.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]" 
                      />
                    </td>
                    <td className="px-6 py-6 border-transparent min-w-0 max-w-[200px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="font-semibold text-[14px] text-[#4B5563] truncate" title={item.full_name}>{item.full_name}</div>
                        {isAscendionWorkspace && verifiedNonDuplicateIds.has(item.id) && (
                          <div title="Not a duplicate in Ascendion portal">
                            <Check
                              className="w-4 h-4 text-green-600 shrink-0"
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-[13px] text-[#8E8E93] mt-0.5 truncate" title={item.headline || ""}>{item.headline || "-"}</div>
                    </td>
                    <td className="px-6 py-6 border-transparent">
                       <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3F5F7" strokeWidth="4" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="4" strokeDasharray={`${score}, 100`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#4B5563]">{score}</div>
                        </div>
                    </td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent truncate max-w-[120px]" title={item.location || ""}>{item.location || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent whitespace-nowrap">{item.experience_years || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent whitespace-nowrap">{item.current_salary_lpa || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent whitespace-nowrap">{item.expected_ctc || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent whitespace-nowrap">{item.notice_period_summary || "-"}</td>
                    <td className="px-6 py-6 text-[13px] font-medium border-transparent text-center whitespace-nowrap">
                       {item.source?.source?.replace("_", " ") || "-"}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap border-transparent">
                      <div className="flex justify-center">
                        {(() => {
                          const attentionTag = item.status_tags?.find((t: any) => t.text);
                          const pill = getAttentionPill(item, attentionTag);
                          if (!pill) return <span className="text-xs text-[#8E8E93]">--</span>;
                          const bgColor = pill.color === "red" ? "#FEE9E7" : pill.color === "blue" ? "#EDE9FE" : "#D1FAE5";
                          const textColor = pill.color === "red" ? "#FF383C" : pill.color === "blue" ? "#6366F1" : "#059669";
                          return (
                            <span
                              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full truncate max-w-[150px]"
                              style={{ backgroundColor: bgColor, color: textColor }}
                              title={pill.text}
                            >
                              {pill.text}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-6 border-transparent" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2 z-10 flex-row">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              if (jobId) {
                                await candidateService.saveToPipeline(jobId, item.id);
                                showToast.success("Candidate added to pipeline");
                                fetchInboundCandidates(currentPage);
                              }
                            } catch (err) {
                              showToast.error("Failed to add candidate to pipeline");
                            }
                          }}
                          className="flex items-center gap-2 bg-[#E7EDFF] text-[#0F47F2] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#D5E1FF] transition whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" /> Shortlist
                        </button>
                        
                        <div className={`relative ${menuOpenId === item.id ? "z-50" : ""}`} ref={menuOpenId === item.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (menuOpenId === item.id) {
                                setMenuOpenId(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              const menuWidth = 192;
                              const menuHeight = 180;
                              const gap = 8;
                              const openUp = rect.bottom + menuHeight + gap > window.innerHeight;
                              const preferredTop = openUp
                                ? rect.top - menuHeight - gap
                                : rect.bottom + gap;
                              const top = Math.min(
                                Math.max(8, preferredTop),
                                Math.max(8, window.innerHeight - menuHeight - 8)
                              );
                              let left = rect.right - menuWidth;
                              if (left < 8) left = 8;
                              if (left + menuWidth > window.innerWidth - 8) {
                                left = window.innerWidth - menuWidth - 8;
                              }
                              setMenuPos({ top, left });
                              setMenuOpenId(item.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-[#F3F5F7] rounded-full hover:bg-gray-200 transition-colors"
                            title="Options"
                          >
                            <MoreHorizontal className="w-4 h-4 text-[#4B5563]" />
                          </button>

                          {menuOpenId === item.id && (
                            <div
                              className="fixed w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[999999] py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                              style={{ top: menuPos.top, left: menuPos.left }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const callData = {
                                    id: item.id,
                                    name: item.full_name || "Unknown",
                                    avatarInitials: item.full_name
                                      ? item.full_name.substring(0, 2).toUpperCase()
                                      : "UN",
                                    headline: item.headline || "--",
                                    phone:
                                      item.premium_data?.phone ||
                                      item.premium_data?.all_phone_numbers?.[0] ||
                                      "+91 98765 43210",
                                    experience: item.experience_years || "--",
                                    currentCtc: item.current_salary_lpa || "--",
                                    expectedCtc: item.expected_ctc || "--",
                                    noticePeriod: item.notice_period_summary || "--",
                                    location: item.location || "--",
                                    resumeUrl: item.premium_data?.resume_url || item.resume_url || "",
                                  };
                                  const candidateIds = candidates.map(c => c.id);
                                  sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ 
                                    candidate: callData,
                                    candidateList: candidateIds
                                  }));
                                  setMenuOpenId(null);
                                  window.location.href = `/call/${item.id}/${jobId || 0}?mode=manual`;
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                              >
                                Call
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCandidateEditing(item);
                                  setShowCandidateEditModal(true);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                              >
                                Edit Details
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleCopyCandidateEmail(item);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                              >
                                Copy Mail ID
                              </button>
                              {isAscendionWorkspace && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    runAscendionDuplicateCheck(item.id);
                                    setMenuOpenId(null);
                                  }}
                                  disabled={verifiedNonDuplicateIds.has(item.id) || ascendionCheckingIds.has(item.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] disabled:hover:bg-white disabled:opacity-50 flex items-center gap-2"
                                  title={
                                    verifiedNonDuplicateIds.has(item.id)
                                      ? "Already verified as not duplicate"
                                      : "Check Ascendion portal duplicate"
                                  }
                                >
                                  {ascendionCheckingIds.has(item.id) ? "Checking..." : "Check dup"}
                                </button>
                              )}
                              <div className="h-px bg-[#F3F5F7] my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/candidate-profiles/${item.id}?job_id=${jobId}`, {
                                    state: {
                                      shareOption: "full_profile",
                                      resumeUrl: item.premium_data?.resume_url || item.resume_url || ""
                                    }
                                  });
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#4B5563] hover:bg-[#F3F5F7] flex items-center gap-2"
                              >
                                Share Profile
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                 );
                 });
                })()}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white border border-[#E5E7EB] rounded-b-xl px-6 py-5 flex items-center justify-between">
            <div className="text-[12px] text-[#8E8E93]">
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} candidates
            </div>
            <div className="flex items-center gap-1.5">
               <button 
                 disabled={currentPage === 1}
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                 <ArrowLeft className="w-4 h-4"/>
               </button>
               {getPageNumbers().map((p) => (
                  <button 
                    key={`page-${p}`} 
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium ${p === currentPage ? 'border-[#0F47F2] text-white bg-[#0F47F2]' : 'border-[#E5E7EB] text-[#4B5563] bg-white hover:bg-gray-50'}`}>
                      {p}
                  </button>
               ))}
               <button 
                 disabled={currentPage === totalPages || totalPages === 0}
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                 <ArrowRight className="w-4 h-4"/>
               </button>
            </div>
        </div>
      </div>
      
      {showCandidateEditModal && candidateEditing && (
        <div
          className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/25 backdrop-blur-sm"
          onClick={() => setShowCandidateEditModal(false)}
        >
          <div
            className="bg-white flex flex-col"
            style={{
              width: 553,
              maxHeight: "90vh",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="w-full shrink-0"
              style={{ borderBottom: "0.5px solid #AEAEB2" }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: "20px 24px" }}
              >
                <span
                  className="font-medium text-gray-600"
                  style={{ fontSize: 16, lineHeight: "19px" }}
                >
                  Edit Candidate Details
                </span>
                <button
                  className="flex items-center justify-center bg-transparent border-none p-0 cursor-pointer hover:opacity-60"
                  onClick={() => setShowCandidateEditModal(false)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#4B5563"
                      strokeWidth="1"
                    />
                    <path
                      d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54"
                      stroke="#4B5563"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="w-full"
                style={{
                  borderBottom: "0.5px solid #AEAEB2",
                  padding: "20px 24px",
                }}
              >
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: 30 }}
                >
                  <div className="flex flex-col" style={{ gap: 10 }}>
                    <h3
                      className="m-0 font-medium text-black"
                      style={{ fontSize: 20, lineHeight: "24px" }}
                    >
                      {candidateEditing.full_name || "Unknown Candidate"}
                    </h3>
                    <p
                      className="m-0 text-xs font-normal"
                      style={{ color: "#0F47F2", lineHeight: "14px" }}
                    >
                      {candidateEditing.headline || "--"}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: "#0F47F2" }}
                  >
                    {candidateEditing.full_name
                      ? candidateEditing.full_name
                        .substring(0, 2)
                        .toUpperCase()
                      : "CA"}
                  </div>
                </div>

                <div
                  className="flex items-start justify-between"
                  style={{ gap: 67 }}
                >
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  >
                    <span
                      className="text-sm font-normal"
                      style={{ color: "#8E8E93", lineHeight: "17px" }}
                    >
                      Experience
                    </span>
                    <span
                      className="font-medium text-gray-600"
                      style={{ fontSize: 16, lineHeight: "19px" }}
                    >
                      {candidateEditing.total_experience != null
                        ? `${candidateEditing.total_experience} Years`
                        : candidateEditing.experience_years || "--"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  >
                    <span
                      className="text-sm font-normal"
                      style={{ color: "#8E8E93", lineHeight: "17px" }}
                    >
                      Location
                    </span>
                    <span
                      className="font-medium text-gray-600"
                      style={{ fontSize: 16, lineHeight: "19px" }}
                    >
                      {candidateEditing.location || "N/A"}
                    </span>
                  </div>
                  <div
                    className="flex flex-col"
                    style={{ gap: 5, minWidth: 120 }}
                  ></div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="w-full" style={{ padding: "24px" }}>
                <h4
                  className="m-0 font-medium text-sm uppercase text-gray-600"
                  style={{ lineHeight: "17px", marginBottom: 20 }}
                >
                  Update Details
                </h4>
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Current CTC (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.current_ctc_lpa}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          current_ctc_lpa: e.target.value,
                        })
                      }
                      placeholder="e.g. 15.5"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Expected CTC (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.expected_ctc_lpa}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          expected_ctc_lpa: e.target.value,
                        })
                      }
                      placeholder="e.g. 20"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Current Take Home (LPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.current_take_home}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          current_take_home: e.target.value,
                        })
                      }
                      placeholder="e.g. 12"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Notice Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={candidateEditForm.notice_period_days}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          notice_period_days: e.target.value,
                        })
                      }
                      placeholder="e.g. 30"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={candidateEditForm.exp}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          exp: e.target.value,
                        })
                      }
                      placeholder="e.g. 4.5"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Last Working Day
                    </label>
                    <input
                      type="date"
                      value={candidateEditForm.last_working_day}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          last_working_day: e.target.value,
                        })
                      }
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-normal uppercase text-[#8E8E93]">
                      Location
                    </label>
                    <input
                      type="text"
                      value={candidateEditForm.location}
                      onChange={(e) =>
                        setCandidateEditForm({
                          ...candidateEditForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g. Bengaluru"
                      className="w-full border-b border-[#D1D1D6] py-1 text-base font-medium text-gray-700 outline-none focus:border-[#0F47F2] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div
              className="flex items-center justify-end shrink-0"
              style={{
                padding: "20px 24px",
                borderTop: "0.5px solid #AEAEB2",
                gap: 12,
              }}
            >
              <button
                className="flex items-center justify-center cursor-pointer bg-white text-sm font-normal transition-opacity hover:opacity-75"
                style={{
                  height: 37,
                  border: "0.5px solid #D1D1D6",
                  borderRadius: 5,
                  padding: "0 20px",
                  color: "#4B5563",
                }}
                onClick={() => setShowCandidateEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center cursor-pointer text-sm font-normal transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
                style={{
                  height: 37,
                  background: "#0F47F2",
                  border: "none",
                  borderRadius: 5,
                  padding: "0 24px",
                  color: "white",
                }}
                onClick={handleCandidateEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
