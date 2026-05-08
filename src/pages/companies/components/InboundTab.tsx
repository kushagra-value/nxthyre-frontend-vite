import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, ArrowRight, ArrowLeft, Plus, Check } from "lucide-react";
import apiClient from "../../../services/api";
import { candidateService } from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";
import PipelineFilterPanel, { PipelineFiltersState, EMPTY_PIPELINE_FILTERS } from "./PipelineFilterPanel";

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
        <div className="bg-white border-x border-t border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-[#E5E7EB]">
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
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Candidate</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-center">Match Score</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Location</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Exp</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Expected CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Notice Period</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-center">Source</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F5F7]">
               {loading ? (
                 <tr>
                   <td colSpan={9} className="px-6 py-12 text-center text-[#8E8E93]">Loading candidates...</td>
                 </tr>
               ) : candidates.length === 0 ? (
                 <tr>
                   <td colSpan={9} className="px-6 py-12 text-center text-[#8E8E93]">No candidates found.</td>
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
                    <td className="px-6 py-6 border-transparent">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="font-semibold text-[14px] text-[#4B5563] truncate">{item.full_name}</div>
                        {isAscendionWorkspace && verifiedNonDuplicateIds.has(item.id) && (
                          <Check
                            className="w-4 h-4 text-green-600 shrink-0"
                            title="Not a duplicate in Ascendion portal"
                          />
                        )}
                      </div>
                      <div className="text-[13px] text-[#8E8E93] mt-0.5">{item.headline || "-"}</div>
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
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.location || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.experience_years || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.current_salary_lpa || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.expected_ctc || "-"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent">{item.notice_period_summary || "-"}</td>
                    <td className="px-6 py-6 text-[13px] font-medium border-transparent text-center">
                       {item.source?.source?.replace("_", " ") || "-"}
                    </td>
                    <td className="px-6 py-6 border-transparent">
                      <div className="flex justify-end gap-3 z-10 flex-row">
                        {isAscendionWorkspace && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              runAscendionDuplicateCheck(item.id);
                            }}
                            disabled={
                              verifiedNonDuplicateIds.has(item.id) ||
                              ascendionCheckingIds.has(item.id)
                            }
                            className="flex items-center gap-2 bg-white border border-[#D1D1D6] text-[#4B5563] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition whitespace-nowrap"
                            title={
                              verifiedNonDuplicateIds.has(item.id)
                                ? "Already verified as not duplicate"
                                : "Check Ascendion portal duplicate"
                            }
                          >
                            {ascendionCheckingIds.has(item.id)
                              ? "Checking..."
                              : "Check dup"}
                          </button>
                        )}
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
    </div>
  );
}
