import { useState } from "react";
import { Search, SlidersHorizontal, Trash2, ArrowRight, ArrowLeft, Copy } from "lucide-react";



export default function LinkedinBotTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ai_score_desc");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // Dummy Candidate Data exactly matching the design
  const dummyCandidates = Array(10).fill({
    id: "cand-1",
    name: "Charles Leclerc",
    current_title: "Product Designer",
    current_company: "Scuderia",
    ai_score: 84,
    location: "Monte Carlo",
    experience_years: "7",
    current_ctc_lacs: "18.5",
    expected_ctc_lacs: "25 - 35",
    notice_period: "Immediate",
    skills_match: { matched: 9, total: 10 },
  }).map((c, i) => ({ ...c, id: `cand-${i + 1}` }));

  const toggleSelection = (id: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === dummyCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(dummyCandidates.map((c) => c.id)));
    }
  };

  const getPageNumbers = () => {
    return [1, 2, 3, "...", 9];
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
            </select>
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
                    checked={dummyCandidates.length > 0 && selectedCandidates.size === dummyCandidates.length}
                    onChange={toggleSelectAll}
                    disabled={dummyCandidates.length === 0}
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
               {dummyCandidates.map((item) => {
                  const scoreColor = item.ai_score >= 80 ? "#00C8B3" : item.ai_score >= 60 ? "#F59E0B" : "#EA580C";
                  const skillsColor = item.skills_match.matched >= (item.skills_match.total * 0.8) ? "#009951" : "#EA580C";
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
                      <div className="font-semibold text-[14px] text-[#4B5563]">{item.name}</div>
                      <div className="text-[13px] text-[#8E8E93] mt-0.5">{item.current_title} • {item.current_company}</div>
                    </td>
                    <td className="px-6 py-6 border-transparent">
                       <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3F5F7" strokeWidth="4" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={scoreColor} strokeWidth="4" strokeDasharray={`${item.ai_score}, 100`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#4B5563]">{item.ai_score}%</div>
                        </div>
                    </td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.location}</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.experience_years} Years</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.current_ctc_lacs} LPA</td>
                    <td className="px-6 py-6 text-[13px] text-[#8E8E93] border-transparent">{item.expected_ctc_lacs} LPA</td>
                    <td className="px-6 py-6 text-[13px] text-[#0F47F2] font-medium border-transparent">{item.notice_period}</td>
                    <td className="px-6 py-6 text-[13px] font-medium border-transparent text-center" style={{ color: skillsColor }}>{item.skills_match.matched}/{item.skills_match.total} skills</td>
                    <td className="px-6 py-6 border-transparent">
                      <div className="flex justify-end gap-3 z-10 flex-row">
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E7EDFF] text-[#0F47F2] hover:bg-[#D5E1FF] transition-colors">
                           <Copy className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FECACA] transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E0E7FF] text-[#3B82F6] hover:bg-[#DBEAFE] transition-colors">
                           <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
               )})}
            </tbody>
          </table>
        </div>

        {/* Pagination - Matching the mockup */}
        <div className="bg-white border border-[#E5E7EB] rounded-b-xl px-6 py-5 flex items-center justify-between">
            <div className="text-[12px] text-[#8E8E93]">
                Showing 1–10 of 42 companies
            </div>
            <div className="flex items-center gap-1.5">
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium"><ArrowLeft className="w-4 h-4"/></button>
               {getPageNumbers().map((p, i) => (
                  p === "..." ? (
                    <span key={`dots-${i}`} className="w-6 h-8 flex items-center justify-center text-[#8E8E93] text-sm font-medium">...</span>
                  ) : (
                    <button 
                      key={`page-${p}`} 
                      className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium ${p === 1 ? 'border-[#0F47F2] text-white bg-[#0F47F2]' : 'border-[#E5E7EB] text-[#4B5563] bg-white hover:bg-gray-50'}`}>
                        {p}
                    </button>
                  )
               ))}
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium"><ArrowRight className="w-4 h-4"/></button>
            </div>
        </div>
      </div>
    </div>
  );
}
