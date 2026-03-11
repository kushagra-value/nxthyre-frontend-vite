import { useState } from "react";
import { Search, SlidersHorizontal, Calendar, X, Send, Trash2 } from "lucide-react";

export default function NaukbotTab() {
  const [showDismiss, setShowDismiss] = useState(true);

  return (
    <div className="pb-12">
      <div className="mx-8 mt-4">
        {/* Blue Header */}
        <div className="bg-[#4F68FC] rounded-t-xl p-6 flex flex-wrap items-center justify-between text-white gap-4">
          <div>
            <h2 className="text-[18px] font-semibold">Naukbot - Auto Sourcing</h2>
            <p className="text-[13px] text-[#E0E7FF] mt-1 font-medium">Candidates sourced by AI matching your JD criteria</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">652</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">Sourced</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">487</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">80%+ Match</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">48</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">nVited</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[22px] font-bold">12</span>
              <span className="text-xs text-[#E0E7FF] font-medium mt-0.5">New</span>
            </div>
            <div className="flex flex-col items-end border-l border-[#8193FE] pl-8">
              <div className="flex items-center gap-2 bg-white rounded-full p-[2px] pr-3 mb-1 cursor-pointer">
                <div className="w-6 h-6 bg-[#4F68FC] rounded-full flex items-center justify-center"></div>
                <span className="text-[11px] font-bold text-[#4F68FC]">ON</span>
              </div>
              <span className="text-[10px] text-[#E0E7FF] font-medium">Sourcing Candidates</span>
            </div>
          </div>
        </div>

        {/* Green Alert */}
        {showDismiss && (
          <div className="bg-[#D1F7DB] px-6 py-3.5 flex items-center justify-between text-[#006A2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-[#009951] rounded-full"></div>
              <span className="text-[13px] font-semibold text-[#009951]">
                12 new candidates <span className="font-normal text-[#1A8D49]">sourced in the last 2 hours</span>
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
        <div className="bg-white border-x border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
          <div className="relative w-[340px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
            <input 
              type="text" 
              placeholder="Search for Candidates" 
              className="w-full h-10 pl-10 pr-3 rounded-lg text-sm text-[#4B5563] placeholder:text-[#AEAEB2] focus:outline-none border border-[#E5E7EB]"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> AI Score
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
              <Calendar className="w-4 h-4" /> 03/02/2026
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border-x border-t border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-[#E5E7EB]">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]" />
                </th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Candidate</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-center">AI Score</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Location</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Exp</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Expected CTC</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Notice Period</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap">Skills Match</th>
                <th className="px-6 py-4 text-[13px] font-normal text-[#8E8E93] whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F5F7]">
               {[
                 { score: 84, scoreColor: "#00C8B3", np: "Immediate", npColor: "#0F47F2", skills: 9, skillsColor: "#009951" },
                 { score: 54, scoreColor: "#F59E0B", np: "15 Days", npColor: "#009951", skills: 9, skillsColor: "#009951" },
                 { score: 96, scoreColor: "#0F47F2", np: "30 Days", npColor: "#F59E0B", skills: 8, skillsColor: "#009951" },
                 { score: 72, scoreColor: "#EA580C", np: "90 Days", npColor: "#EA580C", skills: 5, skillsColor: "#EF4444" },
                 { score: 84, scoreColor: "#00C8B3", np: "Not Yet", npColor: "#EF4444", skills: 6, skillsColor: "#F59E0B" }
               ].map((item, i) => (
                  <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-6">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#D1D1D6] accent-[#0F47F2]" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-semibold text-sm text-[#4B5563]">Charles Leclerc</div>
                      <div className="text-[12px] text-[#8E8E93] mt-0.5">Product Designer • Scuderia</div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="relative w-10 h-10 mx-auto">
                          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F3F5F7" strokeWidth="4" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={item.scoreColor} strokeWidth="4" strokeDasharray={`${item.score}, 100`} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#4B5563]">{item.score}%</div>
                        </div>
                    </td>
                    <td className="px-6 py-6 text-[13px] font-medium text-[#8E8E93]">Monte Carlo</td>
                    <td className="px-6 py-6 text-[13px] font-medium text-[#8E8E93]">7 Years</td>
                    <td className="px-6 py-6 text-[13px] font-medium text-[#8E8E93]">18.5 LPA</td>
                    <td className="px-6 py-6 text-[13px] font-medium text-[#8E8E93]">25 - 35 LPA</td>
                    <td className="px-6 py-6 text-[13px] font-medium" style={{ color: item.npColor }}>{item.np}</td>
                    <td className="px-6 py-6 text-[13px] font-medium" style={{ color: item.skillsColor }}>{item.skills}/10 skills</td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-2">
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0F47F2] text-white rounded-lg text-sm font-medium hover:bg-[#0A3BCC] transition-colors">
                           <Send className="w-3.5 h-3.5" /> nVite
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#8E8E93] border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition-colors">
                           <Trash2 className="w-4 h-4" /> Skip
                        </button>
                      </div>
                    </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white border border-[#E5E7EB] rounded-b-xl px-6 py-5 flex items-center justify-between">
            <div className="text-[13px] text-[#8E8E93]">Showing 1–10 of 42 companies</div>
            <div className="flex items-center gap-1.5">
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium">&lt;</button>
               <button className="w-8 h-8 flex items-center justify-center border border-[#0F47F2] rounded-lg text-white bg-[#0F47F2] text-sm font-medium">1</button>
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563] bg-white hover:bg-gray-50 text-sm font-medium">2</button>
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563] bg-white hover:bg-gray-50 text-sm font-medium">3</button>
               <span className="w-6 h-8 flex items-center justify-center text-[#8E8E93] text-sm font-medium">...</span>
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563] bg-white hover:bg-gray-50 text-sm font-medium">9</button>
               <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#8E8E93] bg-white hover:bg-gray-50 text-sm font-medium">&gt;</button>
            </div>
        </div>
      </div>
    </div>
  );
}
