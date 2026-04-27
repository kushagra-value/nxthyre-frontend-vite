import { useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, ArrowRight, ArrowLeft, ArrowUpDown, Plus, MoreHorizontal } from "lucide-react";
import apiClient from "../../../services/api";
import { candidateService } from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";
import PipelineFilterPanel, { PipelineFiltersState, EMPTY_PIPELINE_FILTERS } from "./PipelineFilterPanel";
import DateRangeFilter from "./DateRangeFilter";

interface NxthyreTabProps {
  jobId: number | null;
  onSelectCandidate?: (
    candidate: any,
    allCandidates?: any[],
    index?: number
  ) => void;
}

export default function NxthyreTab({ jobId, onSelectCandidate }: NxthyreTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("score_desc");
  const pageSize = 10;

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // Filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<PipelineFiltersState>(EMPTY_PIPELINE_FILTERS);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Date range
  const [dateRangeLabel, setDateRangeLabel] = useState("Date Filter");
  const [isDateRangeApplied, setIsDateRangeApplied] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  useEffect(() => {
    if (!jobId) return;
    const timeoutId = setTimeout(() => {
      fetchNxthyreCandidates(currentPage);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [jobId, currentPage, searchQuery, sortBy]);

  const fetchNxthyreCandidates = async (page: number) => {
    try {
      setLoading(true);
      const payload: any = {
        job_id: jobId?.toString(),
        tab: "nxthyre",
        sort_by: sortBy,
      };
      if (searchQuery.trim()) {
        payload.text_query = searchQuery.trim();
      }
      const response = await apiClient.post(`/candidates/search/?page=${page}`, payload);
      setCandidates(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch nxthyre candidates", error);
    } finally {
      setLoading(false);
    }
  };

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
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pb-12">
      <div className="mx-8 mt-4">
        {/* Search and Filters */}
        <div className="bg-white border-x border-t border-[#E5E7EB] rounded-t-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-[340px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
              <input
                type="text"
                placeholder="Search for Candidates"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-10 pl-10 pr-3 rounded-lg text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none border border-[#E5E7EB] focus:border-[#0F47F2] transition-colors"
              />
            </div>
            <button
              ref={filterButtonRef}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F47F2]/30 ${
                showFilterPanel
                  ? "bg-[#E7EDFF] text-[#0F47F2] border-[#0F47F2]"
                  : "bg-white text-[#8E8E93] border-[#E5E7EB] hover:bg-[#F3F5F7]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <PipelineFilterPanel
              isOpen={showFilterPanel}
              onClose={() => setShowFilterPanel(false)}
              onApply={(f) => setFilters(f)}
              initialFilters={filters}
              anchorRef={filterButtonRef}
              jobId={jobId!}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortBy(sortBy === "score_desc" ? "score_asc" : "score_desc")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" /> AI Score
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
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
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-center">AI Score</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Location</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Exp</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Expected CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Notice Period</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-center">Skills Match</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F5F7]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[#8E8E93]">Loading candidates...</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[#8E8E93]">No candidates found.</td>
                </tr>
              ) : (() => {
                const nxthyreCandidatesMapped = candidates.map(c => ({
                  id: null,
                  candidate: { ...c, application_type: "nxthyre" },
                  application_type: "nxthyre",
                }));
                return candidates.map((item, index) => {
                  const scoreRaw = item.job_score?.candidate_match_score?.score?.replace("%", "") || "0";
                  const score = parseInt(scoreRaw, 10);
                  const scoreColor = score >= 80 ? "#00C8B3" : score >= 60 ? "#F59E0B" : "#EA580C";

                  // Skills match
                  const skillsMatch = item.job_score?.quick_fit_summary?.find((s: any) => s.priority === "skills");
                  const skillsLabel = skillsMatch ? skillsMatch.badge : "--";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      onClick={() => onSelectCandidate && onSelectCandidate(nxthyreCandidatesMapped[index], nxthyreCandidatesMapped, index)}
                    >
                      <td className="px-6 py-6 border-transparent" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]"
                        />
                      </td>
                      <td className="px-6 py-6 border-transparent">
                        <div className="font-semibold text-[14px] text-[#4B5563]">{item.full_name}</div>
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
                      <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.experience_years ? `${item.experience_years} Years` : "-"}</td>
                      <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.current_salary_lpa ? `${item.current_salary_lpa} LPA` : "-"}</td>
                      <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.expected_ctc || "-"}</td>
                      <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent">{item.notice_period_summary || "-"}</td>
                      <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent text-center">
                        {skillsLabel}
                      </td>
                      <td className="px-6 py-6 border-transparent">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                if (jobId) {
                                  await candidateService.saveToPipeline(jobId, item.id);
                                  showToast.success("Candidate added to pipeline");
                                  fetchNxthyreCandidates(currentPage);
                                }
                              } catch (err) {
                                showToast.error("Failed to add candidate to pipeline");
                              }
                            }}
                            className="flex items-center gap-1.5 bg-[#0F47F2] text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-[#0c39c2] transition whitespace-nowrap"
                          >
                            Add to Pipeline
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-[#AEAEB2] hover:text-[#4B5563] hover:bg-[#F3F5F7] rounded-md transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
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
            Showing {totalCount > 0 ? Math.min((currentPage - 1) * pageSize + 1, totalCount) : 0}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount} companies
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-[#8E8E93] text-sm">…</span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium ${
                    p === currentPage
                      ? "border-[#0F47F2] text-white bg-[#0F47F2]"
                      : "border-[#E5E7EB] text-[#4B5563] bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
