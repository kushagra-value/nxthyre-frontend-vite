import { useState } from "react";
import { Eye, ChevronRight, AlertTriangle, Activity, Bell, Bot, Check } from "lucide-react";
import { pipelineStages, candidatesData, followUpNeeded, jobDetails } from "../JobPipelineData";

export default function JobPipelineDashboard({ onSelectCandidate }: { onSelectCandidate: (candidate: any) => void }) {
    const [activeTab, setActiveTab] = useState("interview");

    return (
        <div className="flex-1 overflow-y-auto bg-[#F3F5F7]">
            {/* ── Settings / Details Strip ── */}
            <div className="bg-white border-b border-[#E5E7EB] px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-12 text-sm">
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Category</p>
                        <p className="text-black font-medium">{jobDetails.category}</p>
                    </div>
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Availability</p>
                        <p className="text-black font-medium">{jobDetails.availability}</p>
                    </div>
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Work Approach</p>
                        <p className="text-black font-medium">{jobDetails.workApproach}</p>
                    </div>
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Experience</p>
                        <p className="text-black font-medium">{jobDetails.experience}</p>
                    </div>
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Salary</p>
                        <p className="text-black font-medium">{jobDetails.salary}</p>
                    </div>
                    <div>
                        <p className="text-[#AEAEB2] text-xs font-medium uppercase mb-1">Company</p>
                        <p className="text-black font-medium">{jobDetails.company}</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Urgent Notification Banner */}
                <div className="bg-[#FFF4ED] border border-[#FDE0C9] rounded-lg p-3 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#F97316]" />
                    <p className="text-sm text-[#9A3412]">
                        <span className="font-bold">3 candidates in Interview stage have had no update for 6+ days.</span> Feedback is overdue — client expects shortlist by Friday. Autopilot has drafted follow-up messages.
                    </p>
                    <button className="text-[#EA580C] text-sm font-semibold ml-2 hover:underline flex items-center gap-1">
                        Review now &rarr;
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* ── Left Column: Pipeline Table ── */}
                    <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col">
                        {/* Tabs */}
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6">
                            <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
                                {pipelineStages.map((stage) => {
                                    const isActive = activeTab === stage.id;
                                    return (
                                        <button
                                            key={stage.id}
                                            onClick={() => setActiveTab(stage.id)}
                                            className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-[#0F47F2] text-[#0F47F2]" : "border-transparent text-[#4B5563] hover:text-black"
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{stage.label}</span>
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#E7EDFF]" : "bg-[#F3F5F7] text-[#8E8E93]"
                                                    }`}
                                            >
                                                {stage.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 text-sm whitespace-nowrap pl-4">
                                <button className="text-[#4B5563] hover:text-black font-medium">Kanban Board</button>
                                <button className="text-[#AEAEB2] hover:text-[#4B5563] font-medium">+ add a stage</button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Candidate</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Current CTC</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Expected CTC</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Notice Period</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">AI Match</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Stage</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Last Activity</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider">Attention</th>
                                        <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#AEAEB2] tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F3F5F7]">
                                    {candidatesData.map((cand) => (
                                        <tr key={cand.id} className={`hover:bg-[#F9FAFB] ${cand.lastActivityAlert ? 'bg-[#FFF9F9]' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#F3F5F7] text-[#4B5563] font-bold text-xs flex items-center justify-center">
                                                        {cand.initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-black cursor-pointer hover:text-blue-600 transition-colors" onClick={() => onSelectCandidate(cand)}>{cand.name}</p>
                                                        <p className="text-xs text-[#8E8E93]">{cand.experience} • {cand.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#8E8E93]">—</td>
                                            <td className="px-6 py-4 text-sm text-[#8E8E93]">—</td>
                                            <td className="px-6 py-4 text-sm text-[#8E8E93]">—</td>
                                            <td className="px-6 py-4 text-sm text-[#8E8E93]">—</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                                        <div className="bg-[#0F47F2] h-full" style={{ width: `${cand.aiMatch}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#0F47F2]">{cand.aiMatch}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-semibold text-[#F59E0B]">
                                                <span className="bg-[#FFFBEB] px-2 py-1 rounded-full border border-[#FEF3C7]">{cand.subStage}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className={`flex items-center gap-1 font-medium ${cand.lastActivityAlert ? 'text-[#DC2626]' : 'text-[#8E8E93]'}`}>
                                                    {cand.lastActivity}
                                                    {cand.lastActivityAlert && <AlertTriangle className="w-3 h-3" />}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {cand.attentionType === 'warning' && (
                                                    <span className="flex items-center gap-1 text-[#DC2626] font-semibold"><AlertTriangle className="w-3 h-3" /> {cand.attentionText}</span>
                                                )}
                                                {cand.attentionType === 'alert' && (
                                                    <span className="flex items-center gap-1 text-[#D97706] font-semibold"><Activity className="w-3 h-3" /> {cand.attentionText}</span>
                                                )}
                                                {cand.attentionType === 'active' && (
                                                    <span className="flex items-center gap-1 text-[#0F47F2] font-semibold"><Bot className="w-3 h-3" /> {cand.attentionText}</span>
                                                )}
                                                {cand.attentionType === 'none' && (
                                                    <span className="text-[#AEAEB2] font-medium">— {cand.attentionText}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => onSelectCandidate(cand)} className="flex items-center gap-1 text-xs font-semibold text-[#0F47F2] hover:bg-[#E7EDFF] px-2 py-1.5 rounded-lg transition-colors border border-[#E7EDFF] bg-white">
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                    <button className={`flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors border ${cand.action === 'Follow up' ? 'border-[#FEF2F2] text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2]' : 'border-[#E5E7EB] text-[#4B5563] bg-white hover:bg-[#F3F5F7]'}`}>
                                                        {cand.action === 'Follow up' ? <Bell className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />} {cand.action}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                <span className="text-xs text-[#8E8E93] font-medium">Showing 6 of 14 in Interview stage</span>
                                <div className="flex gap-1">
                                    <button className="w-6 h-6 flex items-center justify-center rounded border border-[#E5E7EB] text-[#AEAEB2] bg-white">&lsaquo;</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded bg-[#0F47F2] text-white font-semibold text-xs border border-[#0F47F2]">1</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded border border-[#E5E7EB] text-[#4B5563] font-semibold text-xs bg-white">2</button>
                                    <button className="w-6 h-6 flex items-center justify-center rounded border border-[#E5E7EB] text-[#4B5563] bg-white">&rsaquo;</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="w-full xl:w-[320px] flex flex-col gap-6">

                        {/* Job Overview */}
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-[#0F47F2] rounded-full"></div>
                                <h3 className="text-sm font-bold text-black">Job Overview</h3>
                            </div>
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="w-20 h-20 rounded-full border-[6px] border-[#E5E7EB] border-t-[#10B981] border-r-[#F59E0B] border-b-[#0F47F2]"></div>
                                <div className="flex flex-col gap-2 text-xs font-semibold">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#10B981]"></div> Hired — 1</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div> Shortlisted — 9</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0F47F2]"></div> Interview — 14</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> Screening — 24</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#E5E7EB]"></div> Others — 39</span>
                                </div>
                            </div>

                            <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-3 tracking-wider">Job Details</h4>
                            <div className="flex flex-col gap-3 text-xs">
                                <div className="flex justify-between"><span className="text-[#8E8E93]">Experience</span><span className="font-bold">4–8 years</span></div>
                                <div className="flex justify-between"><span className="text-[#8E8E93]">Type</span><span className="font-bold">Full-time</span></div>
                                <div className="flex justify-between"><span className="text-[#8E8E93]">Location</span><span className="font-bold">Bengaluru</span></div>
                                <div className="flex justify-between"><span className="text-[#8E8E93]">Days Open</span><span className="font-bold text-[#DC2626]">32 days</span></div>
                                <div className="flex justify-between"><span className="text-[#8E8E93]">Target Hire</span><span className="font-bold">2 positions</span></div>
                            </div>
                        </div>

                        {/* Follow-up Needed */}
                        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#DC2626] rounded-full"></div>
                                    <h3 className="text-sm font-bold text-black">Follow-up Needed</h3>
                                </div>
                                <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] px-1.5 py-0.5 rounded-full font-bold">5</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                {followUpNeeded.map((fu, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#F3F5F7] text-[#4B5563] font-bold text-[10px] flex items-center justify-center shrink-0">
                                            {fu.initials}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-black mb-0.5">{fu.candidate}</p>
                                            <p className="text-[10px] text-[#8E8E93] leading-tight mb-2">{fu.description}</p>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${fu.tagColor === 'red' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                                                    fu.tagColor === 'blue' ? 'bg-[#E7EDFF] text-[#0F47F2]' : 'bg-[#FEF3C7] text-[#D97706]'
                                                }`}>
                                                {fu.tag}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Autopilot */}
                        <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#0F47F2] rounded-full"></div>
                                    <h3 className="text-sm font-bold text-black">AI Autopilot</h3>
                                </div>
                                <div className="w-6 h-4 bg-[#0F47F2] rounded-full flex items-center justify-between p-[2px]">
                                    <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <span className="text-lg">🎯</span>
                                        <p className="text-xs text-[#475569] leading-relaxed">Found 6 new candidates with 80%+ match. Outreach drafts ready.</p>
                                    </div>
                                    <button className="self-start ml-7 text-[10px] font-bold text-[#0F47F2] border border-[#0F47F2] rounded px-2 py-1 hover:bg-[#EFF6FF] transition-colors flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Approve & Send
                                    </button>
                                </div>

                                <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <span className="text-lg">⏳</span>
                                        <p className="text-xs text-[#475569] leading-relaxed">Rahul & Ananya haven't responded in 7–8 days. Autopilot will send reminder unless you act.</p>
                                    </div>
                                    <button className="self-start ml-7 text-[10px] font-bold text-[#059669] bg-[#D1FAE5] rounded px-2 py-1">
                                        Let Autopilot handle
                                    </button>
                                </div>

                                <div className="bg-white border border-[#E2E8F0] p-3 rounded-lg flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <span className="text-lg">⚡</span>
                                        <p className="text-xs text-[#475569] leading-relaxed">Suresh Menon cleared Round 3 — suggest moving to shortlist and notifying.</p>
                                    </div>
                                    <button className="self-start ml-7 text-[10px] font-bold text-[#D97706] border border-[#D97706] rounded px-2 py-1 hover:bg-[#FEF3C7] transition-colors flex items-center gap-1">
                                        Take action &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
