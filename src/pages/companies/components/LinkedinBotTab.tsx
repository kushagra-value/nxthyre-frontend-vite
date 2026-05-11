import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUp, ArrowDown, Zap, ArrowLeft, ArrowRight, Copy, Trash2 } from "lucide-react";
import { linkedinBotService, LinkedinBotCandidate, LinkedinBotCandidateSummary } from "../../../services/linkedinBotService";
import { showToast } from "../../../utils/toast";
import toast from "react-hot-toast";
import LinkedinBotFilterPanel, { LinkedinBotFiltersState, EMPTY_LINKEDIN_BOT_FILTERS } from "./LinkedinBotFilterPanel";
import SkillsMatchTooltip from "./SkillsMatchTooltip";
import { getAttentionPill } from "../../../utils/candidateAttention";

interface LinkedinBotTabProps {
  jobId: number | null;
  onFilterCountChange?: (count: number | null) => void;
}

export default function LinkedinBotTab({ jobId, onFilterCountChange }: LinkedinBotTabProps) {
  const [showDismiss, setShowDismiss] = useState(true);
  const [candidates, setCandidates] = useState<LinkedinBotCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<LinkedinBotCandidateSummary>({
    total_sourced: 0,
    above_80_pct: 0,
    new: 0,
  });
  const [toggleLoading, setToggleLoading] = useState(false);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("ai_score_desc");

  // Filters State
  const [botFilters, setBotFilters] = useState<LinkedinBotFiltersState>(EMPTY_LINKEDIN_BOT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Selection
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // Tooltip
  const [hoveredSkills, setHoveredSkills] = useState<{
    candidateId: string;
    matched: string[];
    missing: string[];
    ref: React.RefObject<HTMLElement>;
  } | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSkillsMouseEnter = (e: React.MouseEvent<HTMLElement>, item: any) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setHoveredSkills({ 
      candidateId: item.id, 
      matched: item.skills_match?.matched_skills || [], 
      missing: item.skills_match?.missing_skills || [],
      ref: { current: e.currentTarget }
    });
  };

  const handleSkillsMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredSkills(null);
    }, 200);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCandidates = useCallback(async () => {
    if (!jobId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params: any = {
        job_id: jobId!,
        page,
        page_size: pageSize,
        search: debouncedSearch,
        sort_by: sortBy,
      };

      if (botFilters.location.length) params.location = botFilters.location.join(',');
      if (botFilters.salaryRange.min) params.salary_min = botFilters.salaryRange.min;
      if (botFilters.salaryRange.max) params.salary_max = botFilters.salaryRange.max;
      if (botFilters.experience.min) params.experience_min = botFilters.experience.min;
      if (botFilters.experience.max) params.experience_max = botFilters.experience.max;
      if (botFilters.designation.length) params.designation = botFilters.designation.join(',');
      if (botFilters.noticePeriod.selected.length) params.notice_period = botFilters.noticePeriod.selected.join(',');
      if (botFilters.noticePeriod.minDays) params.notice_period_min_days = botFilters.noticePeriod.minDays;
      if (botFilters.noticePeriod.maxDays) params.notice_period_max_days = botFilters.noticePeriod.maxDays;
      if (botFilters.skills.length) params.skills = botFilters.skills.join(',');

      const res = await linkedinBotService.getLinkedinBotCandidates(params as any, controller.signal);
      setCandidates(res.results);
      setTotalPages(res.total_pages);
      setTotalCount(res.count);
      if (res.summary) {
        setSummary(res.summary);
      }
      
      // Determine if there are active filters (excluding search, page, etc)
      const hasFilters = Object.keys(params).some(k => 
        !['job_id', 'page', 'page_size', 'sort_by', 'search'].includes(k)
      );

      if (hasFilters && res.total_candidates_after_filters !== undefined) {
        onFilterCountChange?.(res.total_candidates_after_filters);
      } else {
        onFilterCountChange?.(null);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
      console.error(error);
      showToast.error("Failed to load LinkedIn Bot candidates");
    } finally {
      setLoading(false);
    }
  }, [jobId, page, pageSize, debouncedSearch, sortBy, botFilters]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, jobId, botFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (botFilters.location.length) count++;
    if (botFilters.salaryRange.min || botFilters.salaryRange.max) count++;
    if (botFilters.experience.min || botFilters.experience.max) count++;
    if (botFilters.designation.length) count++;
    if (botFilters.noticePeriod.selected.length || botFilters.noticePeriod.minDays || botFilters.noticePeriod.maxDays) count++;
    if (botFilters.skills.length) count++;
    return count;
  }, [botFilters]);

  const removeFilter = (key: keyof LinkedinBotFiltersState, value: string | null = null) => {
    setBotFilters((prev) => {
      const updated = { ...prev };
      if (key === 'location' && value) {
        updated.location = updated.location.filter(v => v !== value);
      } else if (key === 'designation' && value) {
        updated.designation = updated.designation.filter(v => v !== value);
      } else if (key === 'skills' && value) {
        updated.skills = updated.skills.filter(v => v !== value);
      } else if (key === 'salaryRange') {
        updated.salaryRange = { min: "", max: "" };
      } else if (key === 'experience') {
        updated.experience = { min: "", max: "" };
      } else if (key === 'noticePeriod') {
        if (value && updated.noticePeriod.selected.includes(value)) {
          updated.noticePeriod.selected = updated.noticePeriod.selected.filter(v => v !== value);
        } else {
          updated.noticePeriod = { selected: [], minDays: "", maxDays: "" };
        }
      }
      return updated;
    });
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
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map((c) => c.id)));
    }
  };

  const handleTriggerSourcing = async () => {
    if (!jobId || toggleLoading) return;
    setToggleLoading(true);
    try {
      const res = await linkedinBotService.triggerLinkedinBotJob(jobId);
      toast.success(res.message || "Job triggered for LinkedIn Bot matching successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to trigger LinkedIn Bot sourcing");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === `${column}_desc`) {
      setSortBy(`${column}_asc`);
    } else {
      setSortBy(`${column}_desc`);
    }
  };

  const renderSortableHeader = (label: string, column: string, align: 'left' | 'center' | 'right' = 'left') => {
    const isSorted = sortBy.startsWith(column);
    const isAsc = sortBy === `${column}_asc`;
    return (
      <th 
        key={column}
        className={`group px-6 py-4 text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap cursor-pointer hover:bg-black/5 transition-colors select-none ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
        onClick={() => handleSort(column)}
      >
        <div className={`flex items-center gap-1 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {isSorted ? (
            isAsc ? <ArrowUp className="w-3.5 h-3.5 text-[#0F47F2]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#0F47F2]" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#AEAEB2] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </th>
    );
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      const halfWindow = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(2, page - halfWindow);
      let endPage = Math.min(totalPages - 1, page + halfWindow);

      if (endPage - startPage + 1 < maxVisiblePages) {
        if (page <= halfWindow + 1) endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        else startPage = Math.max(2, endPage - maxVisiblePages + 1);
      }

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="pb-12">
      <div className="mx-8 mt-4">
        {/* Header section similar to Naukbot */}
        <div className="bg-[#4F68FC] rounded-t-xl p-6 flex flex-wrap items-center justify-between text-white gap-4">
          <div>
            <h2 className="text-[18px] font-semibold">LinkedIn Bot - Auto Sourcing</h2>
            <p className="text-[13px] text-[#E0E7FF] mt-1 font-medium">Candidates sourced via LinkedIn matching your JD criteria</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">{summary.total_sourced}</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">Sourced</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">{summary.above_80_pct}</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">80%+ Match</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">{summary.new}</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">New</span>
            </div>
            <div className="flex flex-col items-end border-l border-[#8193FE] pl-8">
              <button 
                onClick={handleTriggerSourcing}
                disabled={toggleLoading}
                className={`flex items-center gap-2 bg-white text-[#4F68FC] rounded-lg px-4 py-2 mb-1 cursor-pointer font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Zap className="w-4 h-4 fill-[#4F68FC]" /> {toggleLoading ? 'Sourcing...' : 'Source Candidates'}
              </button>
            </div>
          </div>
        </div>

        {/* Green Alert */}
        {showDismiss && summary.new > 0 && (
          <div className="bg-[#D1F7DB] px-6 py-3.5 flex items-center justify-between text-[#006A2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-[#009951] rounded-full"></div>
              <span className="text-[13px] font-semibold text-[#009951]">
                {summary.new} new candidates <span className="font-normal text-[#1A8D49]">sourced</span>
              </span>
            </div>
            <button 
              onClick={() => setShowDismiss(false)} 
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#009951] hover:text-[#004d21]"
            >
              Dismiss <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white border-x border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
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
               className={`flex items-center gap-2 px-4 py-2 ${showFilterPanel || activeFilterCount > 0 ? "bg-[#F3F5F7] border border-[#d2d6db] text-[#4B5563]" : "bg-white border border-[#E5E7EB] text-[#8E8E93]"} rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors`}
             >
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0F47F2] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <LinkedinBotFilterPanel
              isOpen={showFilterPanel}
              onClose={() => setShowFilterPanel(false)}
              onApply={(f) => { setBotFilters(f); setShowFilterPanel(false); }}
              initialFilters={botFilters}
              anchorRef={filterButtonRef}
              jobId={jobId!}
            />
          </div>
            <select 
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors focus:outline-none focus:border-[#0F47F2]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="ai_score_desc">AI Score ↓</option>
              <option value="ai_score_asc">AI Score ↑</option>
              <option value="newest">Newest</option>
              <option value="experience_desc">Experience ↓</option>
              <option value="ctc_desc">CTC ↓</option>
              {!["ai_score_desc", "ai_score_asc", "newest", "experience_desc", "ctc_desc"].includes(sortBy) && (
                <option value={sortBy} className="hidden">Sorted by Header</option>
              )}
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {activeFilterCount > 0 && (
          <div className="bg-white border-x border-[#E5E7EB] px-6 py-3 flex items-center gap-2 flex-wrap">
            {botFilters.location.map(loc => (
              <span key={`loc-${loc}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                {loc}
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('location', loc)} />
              </span>
            ))}
            {botFilters.designation.map(desig => (
              <span key={`desig-${desig}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                {desig}
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('designation', desig)} />
              </span>
            ))}
            {botFilters.skills.map(skill => (
              <span key={`skill-${skill}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                {skill}
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('skills', skill)} />
              </span>
            ))}
            {(botFilters.salaryRange.min || botFilters.salaryRange.max) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                CTC: {botFilters.salaryRange.min || 0} - {botFilters.salaryRange.max || 'Any'} LPA
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('salaryRange')} />
              </span>
            )}
            {(botFilters.experience.min || botFilters.experience.max) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                Exp: {botFilters.experience.min || 0} - {botFilters.experience.max || 'Any'} Yrs
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('experience')} />
              </span>
            )}
            {botFilters.noticePeriod.selected.map(np => (
              <span key={`np-${np}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                {np}
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('noticePeriod', np)} />
              </span>
            ))}
            {(botFilters.noticePeriod.minDays || botFilters.noticePeriod.maxDays) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7EDFF] text-[#0F47F2] text-xs rounded-full font-medium">
                Notice (Days): {botFilters.noticePeriod.minDays || 0} - {botFilters.noticePeriod.maxDays || 'Any'}
                <X className="w-3.5 h-3.5 cursor-pointer hover:bg-black/10 rounded-full" onClick={() => removeFilter('noticePeriod')} />
              </span>
            )}
            <button 
              onClick={() => { setBotFilters(EMPTY_LINKEDIN_BOT_FILTERS); setPage(1); }} 
              className="text-xs font-semibold text-[#8E8E93] hover:text-[#4B5563] ml-2 underline decoration-dashed underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Table View */}
        <div className="bg-white border-x border-t border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-left border-collapse">
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
                {renderSortableHeader('Candidate', 'name')}
                {renderSortableHeader('AI Score', 'ai_score', 'center')}
                {renderSortableHeader('Location', 'location')}
                {renderSortableHeader('Exp', 'experience')}
                {renderSortableHeader('CTC', 'ctc')}
                {renderSortableHeader('Expected CTC', 'expected_ctc')}
                {renderSortableHeader('Notice Period', 'notice_period')}
                {renderSortableHeader('Skills Match', 'skills_match', 'center')}
                <th className="px-6 py-4 text-center text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Attention</th>
                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase text-[#374151] tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F5F7]">
               {loading ? (
                 <tr><td colSpan={11} className="py-12 text-center text-[#8E8E93]">Loading...</td></tr>
               ) : candidates.length === 0 ? (
                 <tr><td colSpan={11} className="py-12 text-center text-[#8E8E93]">No candidates found</td></tr>
               ) : candidates.map((item) => {
                  const scoreColor = item.ai_score >= 80 ? "#00C8B3" : item.ai_score >= 60 ? "#F59E0B" : "#EA580C";
                  const skillsColor = item.skills_match?.matched >= ((item.skills_match?.total || 1) * 0.8) ? "#009951" : "#EA580C";
                  return (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-6 border-transparent">
                      <input 
                        type="checkbox" 
                        checked={selectedCandidates.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]" 
                      />
                    </td>
                    <td className="px-6 py-6 border-transparent">
                      <div className="font-semibold text-[14px] text-[#4B5563]">
                        {item.linkedin_url ? (
                          <a href={item.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-[#0F47F2] transition-colors">{item.name}</a>
                        ) : item.name}
                      </div>
                      <div className="text-[13px] text-[#8E8E93] mt-0.5">{item.current_title || "--"} • {item.current_company || "--"}</div>
                    </td>
                    <td className="px-6 py-6 border-transparent">
                       <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3F5F7" strokeWidth="4" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="4" strokeDasharray={`${item.ai_score || 0}, 100`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#4B5563]">{item.ai_score || 0}</div>
                        </div>
                    </td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.location || "--"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.experience_years ? `${Number(item.experience_years).toFixed(1)} Years` : "--"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.current_ctc_lacs ? `${item.current_ctc_lacs} LPA` : "--"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.expected_ctc_lacs ? `${item.expected_ctc_lacs} LPA` : "--"}</td>
                    <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent">{item.notice_period || "--"}</td>
                    <td 
                      className="px-6 py-6 text-[13px] font-medium border-transparent text-center cursor-help relative" 
                      style={{ color: skillsColor }}
                      onMouseEnter={(e) => handleSkillsMouseEnter(e, item)}
                      onMouseLeave={handleSkillsMouseLeave}
                    >
                      {item.skills_match?.matched || 0}/{item.skills_match?.total || 0} skills
                      {hoveredSkills?.candidateId === item.id && (
                        <SkillsMatchTooltip 
                          matchedSkills={hoveredSkills.matched} 
                          missingSkills={hoveredSkills.missing} 
                          anchorRef={hoveredSkills.ref}
                          onClose={() => setHoveredSkills(null)}
                        />
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap border-transparent">
                      <div className="flex justify-center">
                        {(() => {
                          const attentionTag = (item as any).status_tags?.find((t: any) => t.text);
                          const pill = getAttentionPill(item as any, attentionTag);
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
                    <td className="px-6 py-6 border-transparent">
                      <div className="flex justify-end gap-3 z-10 flex-row">
                        {item.linkedin_url && (
                          <button 
                            onClick={() => { navigator.clipboard.writeText(item.linkedin_url); toast.success("URL Copied!"); }}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E7EDFF] text-[#0F47F2] hover:bg-[#D5E1FF] transition-colors"
                            title="Copy LinkedIn URL"
                          >
                             <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FECACA] transition-colors opacity-50 cursor-not-allowed" title="Skip (Not enabled)">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
               )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-b-xl px-6 py-5 flex items-center justify-between">
            <div className="text-[13px] text-[#8E8E93]">
                Showing {totalCount > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, totalCount)} of {totalCount} candidates
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                   <button onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"><ArrowLeft className="w-4 h-4"/></button>
                   {getPageNumbers().map((p, i) => (
                      p === "..." ? (
                        <span key={`dots-${i}`} className="w-6 h-8 flex items-center justify-center text-[#8E8E93] text-sm font-medium">...</span>
                      ) : (
                        <button 
                          key={`page-${p}`} 
                          onClick={() => setPage(p as number)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium ${page === p ? 'border-[#0F47F2] text-white bg-[#0F47F2]' : 'border-[#E5E7EB] text-[#4B5563] bg-white hover:bg-gray-50'}`}>
                            {p}
                        </button>
                      )
                   ))}
                   <button onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium disabled:opacity-50"><ArrowRight className="w-4 h-4"/></button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
