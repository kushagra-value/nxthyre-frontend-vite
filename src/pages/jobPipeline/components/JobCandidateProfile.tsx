import { Mail, ArrowRight, Download, Flag, MoreHorizontal, Check, FileText, ChevronLeft, ChevronRight } from "lucide-react";

export default function JobCandidateProfile({ candidate, goBack }: { candidate: any, goBack: () => void }) {
    return (
        <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex flex-col xl:flex-row">
            {/* ── Left Column: Candidate Main Info ── */}
            <div className="flex-1 bg-white xl:mr-2 border-r border-[#E5E7EB]">
                {/* Header Breadcrumb equivalent */}
                <div className="flex items-center justify-between border-b border-[#E5E7EB] px-8 py-4 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                        <button className="hover:text-black">Jobs</button> <ChevronRight className="w-3 h-3" />
                        <button onClick={goBack} className="hover:text-black font-semibold text-black">Senior Product Designer</button> <ChevronRight className="w-3 h-3" />
                        <span className="text-black font-semibold">Profile</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-[#8E8E93]">3 of 14 in Interview stage</span>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-[#4B5563] hover:text-black border border-[#E5E7EB] px-3 py-1.5 rounded bg-[#F9FAFB]"><ChevronLeft className="w-4 h-4" /> Prev</button>
                            <button className="flex items-center gap-1 text-[#4B5563] hover:text-black border border-[#E5E7EB] px-3 py-1.5 rounded bg-[#F9FAFB]">Next <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                <div className="p-8 pb-12">
                    {/* Main Candidate Card */}
                    <div className="border border-[#E5E7EB] rounded-t-xl rounded-b overflow-hidden mb-8">
                        <div className="p-6 bg-white flex flex-col gap-6 border-b border-[#E5E7EB]">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded bg-[#F3F5F7] text-[#4B5563] text-2xl font-bold flex items-center justify-center border border-[#E5E7EB]">
                                        {candidate.initials}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-black flex items-center gap-3">
                                            {candidate.name} <span className="bg-[#DEF7EC] border border-[#A7F3D0] text-[#059669] text-sm px-2 py-0.5 rounded-full">9/10</span>
                                        </h1>
                                        <p className="text-sm text-[#4B5563] mt-1">for Senior Product Designer • Acme Technologies</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-[#8E8E93]">
                                            <span className="flex items-center gap-1">📍 Bengaluru, India</span>
                                            <span className="flex items-center gap-1">🕒 Applied 4 days ago</span>
                                            <span className="flex items-center gap-1 text-[#059669]"><Check className="w-3.5 h-3.5" /> 3 days in pipeline</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 bg-[#0F47F2] text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 transition">
                                    <Mail className="w-4 h-4" /> Send Mail
                                </button>
                                <button className="flex items-center gap-2 bg-white border border-[#D1D1D6] text-[#4B5563] px-4 py-2 rounded text-sm font-bold hover:bg-[#F3F5F7] transition">
                                    <ArrowRight className="w-4 h-4" /> Move to Stage
                                </button>
                                <button className="flex items-center gap-2 bg-white border border-[#D1D1D6] text-[#4B5563] px-4 py-2 rounded text-sm font-bold hover:bg-[#F3F5F7] transition">
                                    <Download className="w-4 h-4" /> Download Report
                                </button>
                                <button className="flex items-center gap-2 bg-white border border-[#D1D1D6] text-[#4B5563] px-3 py-2 rounded hover:bg-[#F3F5F7] transition">
                                    <Flag className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 bg-white border border-[#D1D1D6] text-[#4B5563] px-3 py-2 rounded hover:bg-[#F3F5F7] transition">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="bg-[#F8FAFC] px-6 py-3 text-xs text-[#0F47F2] font-semibold border-t border-[#E5E7EB]">
                            {candidate.name.split(' ')[0]} is interviewing for 2 more roles in your pipeline
                        </div>
                    </div>

                    {/* Current Stage Graphic */}
                    <div className="mb-10">
                        <h3 className="text-xs uppercase font-bold text-[#AEAEB2] tracking-wider mb-6 flex items-center gap-2">
                            Current Stage — <span className="text-[#0F47F2]">Interview - Round 2</span>
                        </h3>

                        <div className="flex items-center justify-between relative px-4 mb-8">
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E5E7EB] -translate-y-1/2 z-0"></div>

                            {/* Stages */}
                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-white border border-[#10B981] flex items-center justify-center text-[#10B981] z-10 shadow-sm"><Check className="w-4 h-4" /></div>
                                <span className="text-[10px] uppercase font-bold text-[#10B981]">Sourcing</span>
                            </div>
                            <div className="h-0.5 w-[calc(100%/5)] bg-[#10B981] absolute top-1/2 left-8 -translate-y-1/2 z-0"></div>

                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-white border border-[#10B981] flex items-center justify-center text-[#10B981] z-10 shadow-sm"><Check className="w-4 h-4" /></div>
                                <span className="text-[10px] uppercase font-bold text-[#10B981]">Screening</span>
                            </div>
                            <div className="h-0.5 w-[calc(100%/5)] bg-[#10B981] absolute top-1/2 left-[calc(20%+2rem)] -translate-y-1/2 z-0"></div>

                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-[#0F47F2] border-4 border-[#BFDBFE] flex items-center justify-center text-white z-10 shadow-sm font-bold text-sm">3</div>
                                <span className="text-[10px] uppercase font-bold text-[#0F47F2]">Interview</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-white border border-[#D1D1D6] flex items-center justify-center text-[#D1D1D6] z-10 shadow-sm font-bold text-sm">4</div>
                                <span className="text-[10px] uppercase font-bold text-[#8E8E93]">Shortlist</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-white border border-[#D1D1D6] flex items-center justify-center text-[#D1D1D6] z-10 shadow-sm font-bold text-sm">5</div>
                                <span className="text-[10px] uppercase font-bold text-[#8E8E93]">Offer</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                                <div className="w-8 h-8 rounded-full bg-white border border-[#D1D1D6] flex items-center justify-center text-[#D1D1D6] z-10 shadow-sm font-bold text-sm">6</div>
                                <span className="text-[10px] uppercase font-bold text-[#8E8E93]">Hired</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 bg-[#0F47F2] text-white py-3 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition">→ Move to Shortlist</button>
                            <button className="px-10 bg-white border border-[#FCA5A5] text-[#DC2626] py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-[#FEF2F2] transition">✕ Reject</button>
                            <button className="px-10 bg-white border border-[#D4D4D8] text-[#52525B] py-3 rounded-lg text-sm font-bold shadow-sm hover:bg-[#F4F4F5] transition">⧖ Hold</button>
                        </div>
                    </div>

                    {/* Signals */}
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Signals</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="bg-[#FEF9C3] border border-[#FDE047] text-[#854D0E] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5"><ZapIcon className="w-3.5 h-3.5" /> Quick Joiner</span>
                            <span className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5"><BrainIcon className="w-3.5 h-3.5" /> High AI Match · 91%</span>
                            <span className="bg-[#FFEDD5] border border-[#FDBA74] text-[#C2410C] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5"><TimerIcon className="w-3.5 h-3.5" /> Short Tenure at prev. role</span>
                            <span className="bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5" /> Assessment Cleared</span>
                        </div>
                    </div>

                    {/* Score Cards */}
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Score</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                                <RobotIcon className="w-5 h-5 mb-4 text-[#0F47F2]" />
                                <div className="text-3xl font-black text-black">9.1</div>
                                <div className="text-xs font-semibold text-[#8E8E93] mt-1">AI Interview</div>
                            </div>
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                                <ClipboardListIcon className="w-5 h-5 mb-4 text-[#8B5CF6]" />
                                <div className="text-3xl font-black text-black">8.4</div>
                                <div className="text-xs font-semibold text-[#8E8E93] mt-1">Assessments</div>
                            </div>
                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                                <FileTextIcon className="w-5 h-5 mb-4 text-[#10B981]" />
                                <div className="text-3xl font-black text-black">7.8</div>
                                <div className="text-xs font-semibold text-[#8E8E93] mt-1">Resume</div>
                            </div>
                        </div>
                    </div>

                    {/* AI Interview Summary */}
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">AI Interview Summary</h3>
                        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                            <p className="text-sm leading-relaxed text-[#374151]">
                                {candidate.name.split(' ')[0]} demonstrates strong systems thinking and a clear user-first design philosophy. Her portfolio shows deep experience in B2C product design with measurable impact — she led the redesign of Flipkart's checkout flow reducing drop-off by 18%. Communication is confident and structured. She articulated tradeoffs well in the design challenge round. One area to probe further is experience leading cross-functional teams at scale. Overall a strong candidate — recommend moving to final shortlist and client presentation.
                            </p>
                        </div>
                    </div>

                    {/* AI Score Breakdown */}
                    <div>
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">AI Interview Score Breakdown</h3>
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm flex flex-col gap-5">
                            <ScoreRow label="Visual Design" score="9.1" color="bg-[#10B981]" width="w-[91%]" />
                            <ScoreRow label="UX Research" score="8.6" color="bg-[#10B981]" width="w-[86%]" />
                            <ScoreRow label="Problem Solving" score="8.8" color="bg-[#10B981]" width="w-[88%]" />
                            <ScoreRow label="Communication" score="9.2" color="bg-[#10B981]" width="w-[92%]" />
                            <ScoreRow label="Team Leadership" score="7.2" color="bg-[#F59E0B]" width="w-[72%]" />
                            <ScoreRow label="Cultural Fit" score="8.5" color="bg-[#10B981]" width="w-[85%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Column: Sidebar ── */}
            <div className="w-full xl:w-[320px] bg-white border-l border-[#E5E7EB]">
                <div className="flex border-b border-[#E5E7EB]">
                    <button className="flex-1 py-4 flex items-center justify-center border-b-2 border-[#0F47F2] text-[#0F47F2]"><InfoIcon className="w-5 h-5" /></button>
                    <button className="flex-1 py-4 flex items-center justify-center text-[#8E8E93] hover:text-[#4B5563]"><MessageIcon className="w-5 h-5" /></button>
                    <button className="flex-1 py-4 flex items-center justify-center text-[#8E8E93] hover:text-[#4B5563]"><ChartIcon className="w-5 h-5" /></button>
                </div>

                <div className="p-6 flex flex-col gap-8 text-sm">
                    {/* Contact Info */}
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Contact Info</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between"><span className="text-[#8E8E93]">Name</span><span className="font-semibold text-right">{candidate.name}</span></div>
                            <div className="flex justify-between"><span className="text-[#8E8E93]">Location</span><span className="font-semibold text-right">Bengaluru, India</span></div>
                            <div className="flex justify-between"><span className="text-[#8E8E93]">Birthday</span><span className="font-semibold text-right">Mar 12, 1996 (28 yrs)</span></div>
                            <div className="flex justify-between"><span className="text-[#8E8E93]">Email</span><span className="font-semibold text-[#0F47F2]">priya@example.com</span></div>
                            <div className="flex justify-between"><span className="text-[#8E8E93]">Phone</span><span className="font-semibold text-right">+91 98765 43210</span></div>
                            <div className="flex justify-between"><span className="text-[#8E8E93]">LinkedIn</span><span className="font-semibold text-[#0F47F2]">linkedin.com/in/priya</span></div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E7EB] w-full"></div>

                    {/* Experience */}
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Experience</h4>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="font-bold text-black">{candidate.role.split('@')[0].trim() || 'UX Lead'}, {candidate.role.split('@')[1] || 'Flipkart'}</p>
                                <p className="text-xs text-[#8E8E93]">2022 — Present · 3 yrs</p>
                            </div>
                            <div>
                                <p className="font-bold text-black">Product Designer, Razorpay</p>
                                <p className="text-xs text-[#8E8E93]">2020 — 2022 · 2 yrs</p>
                            </div>
                            <div>
                                <p className="font-bold text-black">UI Designer, Freshworks</p>
                                <p className="text-xs text-[#8E8E93]">2019 — 2020 · 1 yr</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E7EB] w-full"></div>

                    {/* Education */}
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Education</h4>
                        <div>
                            <p className="font-bold text-black">National Institute of Design</p>
                            <p className="text-xs text-[#8E8E93]">2015 — 2019 · B.Des</p>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E7EB] w-full"></div>

                    {/* Pipeline History */}
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Pipeline History</h4>
                        <div className="flex flex-col gap-6 pl-2 border-l-2 border-[#E5E7EB] ml-1 relative">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full absolute -left-[14px] border-2 border-white top-1"></div>
                                <p className="font-bold text-black text-xs">Moved to Interview · Round 2</p>
                                <p className="text-[10px] text-[#4B5563] mb-0.5">Cleared Round 1 with score 9.1</p>
                                <p className="text-[10px] text-[#8E8E93]">Today, 9:02am</p>
                            </div>
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full absolute -left-[14px] border-2 border-white top-1"></div>
                                <p className="font-bold text-black text-xs">Interview Round 1 Completed</p>
                                <p className="text-[10px] text-[#4B5563] mb-0.5">AI Interview score: 9.1 · Assessments: 8.4</p>
                                <p className="text-[10px] text-[#8E8E93]">Feb 18, 11:30am</p>
                            </div>
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full absolute -left-[14px] border-2 border-white top-1"></div>
                                <p className="font-bold text-black text-xs">Moved to Screening</p>
                                <p className="text-[10px] text-[#4B5563] mb-0.5">Resume scored 7.8 · Shortlisted by Autopilot</p>
                                <p className="text-[10px] text-[#8E8E93]">Feb 16, 2:15pm</p>
                            </div>
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-[#D1D1D6] rounded-full absolute -left-[14px] border-2 border-white top-1"></div>
                                <p className="font-bold text-black text-xs">Applied</p>
                                <p className="text-[10px] text-[#4B5563] mb-0.5">Via Nxthyre platform</p>
                                <p className="text-[10px] text-[#8E8E93]">Feb 14, 8:00am</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E7EB] w-full"></div>

                    {/* Résumé */}
                    <div>
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Résumé</h4>
                        <div className="border border-[#E5E7EB] rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between group cursor-pointer hover:bg-[#F3F5F7] transition">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#8E8E93]" />
                                <span className="font-bold text-xs">resume_priya_patel.pdf</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition -rotate-45" />
                        </div>
                        <div className="mt-4 border border-[#E5E7EB] rounded bg-[#F9FAFB] h-32 flex items-center justify-center text-[#AEAEB2] text-xs font-semibold">
                            Resume preview placeholder
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Subcomponents for icons and UI
const ScoreRow = ({ label, score, color, width }: { label: string, score: string, color: string, width: string }) => (
    <div className="flex justify-between items-center text-sm font-semibold">
        <span className="w-32 text-[#4B5563]">{label}</span>
        <div className="flex-1 mx-4 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div className={`${width} ${color} h-full rounded-full`}></div>
        </div>
        <span className="w-8 text-right text-black">{score}</span>
    </div>
);

// Inline SVGs for quick specific icons matching the UI
const ZapIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const BrainIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668A3.989 3.989 0 0 0 4.5 16.5a3.99 3.99 0 0 0 4.474 4.5 4 4 0 0 0 6.052 0A3.99 3.99 0 0 0 19.5 16.5a3.989 3.989 0 0 0 3.723-6.707 4 4 0 0 0-5.224-4.668A3 3 0 1 0 12 5Z"></path><path d="M8.5 20a4.5 4.5 0 0 1-1.3-.2"></path><path d="M15.5 20a4.5 4.5 0 0 0 1.3-.2"></path></svg>;
const TimerIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>;
const CheckCircleIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const RobotIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const ClipboardListIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>;
const FileTextIcon = (props: any) => <FileText {...props} />;
const InfoIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const MessageIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const ChartIcon = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
