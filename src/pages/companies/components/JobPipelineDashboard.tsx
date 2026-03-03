import React from "react";
import { Share2, Download, Calendar, Grid3X3 } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  title: string;
  aiScore: number;
  location: string;
  exp: string;
  ctc: string;
  expectedCtc: string;
  notice: string;
  stage: string;
  attention: string;
}

interface JobPipelineDashboardProps {
  onSelectCandidate?: (candidate: Candidate) => void;
}

const candidates: Candidate[] = [
  {
    id: 1,
    name: "Max Verstappen",
    title: "Product Designer • Google",
    aiScore: 84,
    location: "Spielberg",
    exp: "7 Years",
    ctc: "18.5 LPA",
    expectedCtc: "25 - 35 LPA",
    notice: "30 Days",
    stage: "F2F Interview",
    attention: "Overdue",
  },
  {
    id: 2,
    name: "Charles Leclerc",
    title: "Product Designer • Scuderia",
    aiScore: 84,
    location: "Monte Carlo",
    exp: "7 Years",
    ctc: "18.5 LPA",
    expectedCtc: "25 - 35 LPA",
    notice: "30 Days",
    stage: "F2F Interview",
    attention: "Overdue",
  },
  {
    id: 3,
    name: "Carlos Sainz",
    title: "Sr. UI UX Designer • Racing Bull",
    aiScore: 84,
    location: "Monaco",
    exp: "7 Years",
    ctc: "18.5 LPA",
    expectedCtc: "25 - 35 LPA",
    notice: "30 Days",
    stage: "F2F Interview",
    attention: "Overdue",
  },
  {
    id: 4,
    name: "Harold Das",
    title: "UI UX Designer • Haas Auto",
    aiScore: 84,
    location: "Austria",
    exp: "7 Years",
    ctc: "18.5 LPA",
    expectedCtc: "25 - 35 LPA",
    notice: "30 Days",
    stage: "F2F Interview",
    attention: "Overdue",
  },
  {
    id: 5,
    name: "Dwijja Patel",
    title: "Product Designer • Red Bull",
    aiScore: 84,
    location: "Bangalore",
    exp: "7 Years",
    ctc: "18.5 LPA",
    expectedCtc: "25 - 35 LPA",
    notice: "30 Days",
    stage: "F2F Interview",
    attention: "Overdue",
  },
];

export default function JobPipelineDashboard({ onSelectCandidate }: JobPipelineDashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F3F5F7] min-h-screen pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-[#4B5563] hover:text-black">←</button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-medium text-black">Senior Product Designer V2</h1>
              <div className="flex items-center gap-1.5 bg-[#EBFFEE] text-[#069855] text-xs font-medium px-3 py-0.5 rounded-full">
                <div className="w-2 h-2 bg-[#009951] rounded-full" />
                Active
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#4B5563] mt-0.5">
              Companies <span className="text-[#8E8E93]">•</span> Jupiter <span className="text-[#8E8E93]">•</span> Senior Product Designer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#D1D1D6] rounded-lg text-sm text-[#757575] hover:bg-[#F9FAFB]">
            View JD
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#0F47F2] bg-[#E7EDFF] text-[#0F47F2] rounded-lg text-sm font-medium hover:bg-[#DDE6FF]">
            Edit
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[#0F47F2] text-white rounded-lg text-sm font-medium hover:bg-[#0A3BCC]">
            + Candidate
          </button>
        </div>
      </div>

      {/* Job Metadata Card */}
      <div className="mx-8 mt-6 bg-white border border-[#C7C7CC] rounded-xl p-6">
        <div className="grid grid-cols-7 gap-x-8 gap-y-6 text-sm">
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Year of Experience</div>
            <div className="font-medium text-[#4B5563] mt-1">4 - 8 years</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Location</div>
            <div className="font-medium text-[#4B5563] mt-1">Bangalore</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Salary - CTC</div>
            <div className="font-medium text-[#4B5563] mt-1">12-14LPA</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Work Approach</div>
            <div className="font-medium text-[#4B5563] mt-1">Hybrid</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">No of Position</div>
            <div className="font-medium text-[#4B5563] mt-1">2</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Education Qualifications</div>
            <div className="font-medium text-[#4B5563] mt-1">Min. Graduation</div>
          </div>

          <div />
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Open Date</div>
            <div className="font-medium text-[#4B5563] mt-1">24/02/2026</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Last Active Date</div>
            <div className="font-medium text-[#4B5563] mt-1">28/02/2026</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Shortlisted</div>
            <div className="font-medium text-[#4B5563] mt-1">82</div>
          </div>
          <div>
            <div className="text-[#8E8E93] text-xs font-medium">Hired</div>
            <div className="font-medium text-[#4B5563] mt-1">1</div>
          </div>
          <div className="col-span-3">
            <div className="text-[#8E8E93] text-xs font-medium mb-1.5">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {["Figma", "Adobe XD", "AIUX", "Product Design", "UI", "UX", "User Research"].map((s) => (
                <span key={s} className="bg-[#F2F2F7] text-[#4B5563] text-[10px] px-2.5 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Tabs + Stage Filters + Toolbar + Table */}
      {/* (Everything else remains exactly the same as the previous version I gave you) */}

      {/* Candidates Table - now with click handler */}
      <div className="mx-8 mt-6 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="w-10 px-6 py-4"><input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" /></th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Name</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">AI Score</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Location</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Exp</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">CTC</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Expected CTC</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Notice Period</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Stage</th>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2]">Attention</th>
              <th className="w-24 px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#AEAEB2] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F5F7]">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="hover:bg-[#F9FAFB] cursor-pointer"
                onClick={() => onSelectCandidate?.(candidate)}
              >
                <td className="px-6 py-5"><input type="checkbox" className="w-4 h-4 accent-[#0F47F2]" /></td>
                <td className="px-6 py-5">
                  <div>
                    <div className="font-medium text-[#4B5563]">{candidate.name}</div>
                    <div className="text-xs text-[#727272]">{candidate.title}</div>
                  </div>
                </td>
                {/* AI Score, Location, Exp, CTC, Expected CTC, Notice, Stage, Attention, Actions - same as before */}
                <td className="px-6 py-5">
                  <div className="relative w-9 h-9">
                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3.5" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00C8B3" strokeWidth="3.5" strokeDasharray={`${candidate.aiScore}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4B5563]">{candidate.aiScore}%</div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-[#8E8E93]">{candidate.location}</td>
                <td className="px-6 py-5 text-sm text-[#8E8E93]">{candidate.exp}</td>
                <td className="px-6 py-5 text-sm text-[#8E8E93]">{candidate.ctc}</td>
                <td className="px-6 py-5 text-sm text-[#8E8E93]">{candidate.expectedCtc}</td>
                <td className="px-6 py-5 text-sm text-[#8E8E93]">{candidate.notice}</td>
                <td className="px-6 py-5">
                  <div>
                    <div className="text-[#6155F5] text-sm font-medium">{candidate.stage}</div>
                    <div className="flex gap-0.5 mt-1.5">
                      <div className="h-1 w-7 bg-[#FFCC00] rounded" />
                      <div className="h-1 w-7 bg-[#00C8B3] rounded" />
                      <div className="h-1 w-7 bg-[#6155F5] rounded" />
                      <div className="h-1 w-7 bg-[#E5E5EA] rounded" />
                      <div className="h-1 w-7 bg-[#E5E5EA] rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-block bg-[#FEE9E7] text-[#FF383C] text-xs font-medium px-3 py-0.5 rounded-full">
                    {candidate.attention}
                  </span>
                </td>
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button className="w-8 h-8 flex items-center justify-center bg-[#E3E1FF] rounded-full">
                      <span className="text-[#6155F5]">☎</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-[#FFF2E6] rounded-full">
                      <span className="text-[#FF8D28]">✉</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-8 py-5 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="text-xs text-[#6B7280]">Showing 1–10 of 42 companies</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280]">‹</button>
            <button className="w-8 h-8 flex items-center justify-center bg-[#0F47F2] text-white rounded-lg font-medium">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563]">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563]">3</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280]">…</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#4B5563]">9</button>
            <button className="w-8 h-8 flex items-center justify-center border border-[#E5E7EB] rounded-lg text-[#6B7280]">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}