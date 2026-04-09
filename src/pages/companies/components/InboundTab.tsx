import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ArrowRight, ArrowLeft } from "lucide-react";
import apiClient from "../../../services/api";

interface InboundTabProps {
  jobId: number | null;
  onSelectCandidate?: (candidate: any) => void;
}

export default function InboundTab({ jobId, onSelectCandidate }: InboundTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!jobId) return;
    const timeoutId = setTimeout(() => {
      fetchInboundCandidates(currentPage);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [jobId, currentPage, searchQuery]);

  const fetchInboundCandidates = async (page: number) => {
    try {
      setLoading(true);
      const payload: any = {
        job_id: jobId?.toString(),
        tab: "inbound",
      };
      if (searchQuery.trim()) {
        payload.text_query = searchQuery.trim();
      }
      const response = await apiClient.post(`/candidates/search/?page=${page}`, payload);
      setCandidates(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error("Failed to fetch inbound candidates", error);
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
             <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
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
               ) : candidates.map((item) => {
                  const scoreRaw = item.job_score?.candidate_match_score?.score?.replace("%", "") || "0";
                  const score = parseInt(scoreRaw, 10);
                  const scoreColor = score >= 80 ? "#00C8B3" : score >= 60 ? "#F59E0B" : "#EA580C";
                  
                  return (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer" onClick={() => onSelectCandidate && onSelectCandidate(item)}>
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
                          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#4B5563]">{score}%</div>
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
                  </tr>
               )})}
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
