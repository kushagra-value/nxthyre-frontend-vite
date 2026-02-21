import React from 'react';

interface ActionReviewModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ActionReviewModal: React.FC<ActionReviewModalProps> = ({
    isOpen = true,
    onClose = () => { },
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-[520px] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden mx-4">

                {/* Top bar: pagination + close */}
                <div className="flex items-center justify-end gap-4 px-7 pt-5 pb-1">
                    <div className="flex items-center gap-2 text-[#8E8E93] text-sm select-none">
                        <button className="hover:text-neutral-700 transition-colors p-0.5">
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        <span className="text-[13px] font-normal text-[#8E8E93]">1 of 24</span>
                        <button className="hover:text-neutral-700 transition-colors p-0.5">
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#C7C7CC] hover:text-neutral-600 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 4L4 14M4 4L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                </div>

                {/* Title + link */}
                <div className="px-7 pb-3">
                    <h1 className="text-[22px] font-semibold text-[#1C1C1E] leading-tight tracking-[-0.02em]">
                        Need Action on Senior DevOps Role
                    </h1>
                    <a
                        href="#"
                        className="text-[#2563eb] text-[13px] font-medium mt-1 inline-block hover:underline"
                    >
                        Move all suitable candidates
                    </a>
                </div>

                {/* Scrollable body */}
                <div className="px-7 pb-2 flex-1 overflow-y-auto max-h-[calc(100vh-240px)]">

                    {/* Candidate row */}
                    <div className="flex items-start gap-4 mb-5">
                        <div className="relative flex-shrink-0">
                            <div className="w-[56px] h-[56px] rounded-xl bg-neutral-200 overflow-hidden">
                                <img
                                    alt="Ram Gupta"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT3sqE6RS0WmeZC9ArbIb8MM0-p-S0-dOWpwKXbcGSUftawEeGPpMktD6ANae56887NK3bzR7kiWfds8A6-dzSGuJkS1Sl94WTahskERf3bPIyTVfkhilfvymlG1GgxTUL9Ziyn-kqE750oSaA97y7M_tuNFIEUG7s2bHSyQHKVykRaKgstr2aSKuNsQ0A9aWAIgt_Bwgfp9hWow4OkmXiH7MRT49H8h4VxFDnEE2A4uyy4g9KxBcX37YIMZtE8qnGWAPHSntdknZI"
                                />
                            </div>
                            <div
                                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#34C759] border-2 border-white rounded-full"
                                title="Active"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-[#1C1C1E] leading-tight">
                                        Ram Gupta
                                    </h3>
                                    <p className="text-[13px] text-[#8E8E93] mt-0.5">Senior DevOps Role</p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-[0.08em] whitespace-nowrap">
                                    Source: Nxthyre
                                </span>
                            </div>

                            {/* Skill Tags — outlined style */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {['Docker', 'Kubernetes', 'Terraform', 'AWS'].map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 py-[3px] border border-[#E5E5EA] text-[#3C3C43] text-[11px] font-medium rounded-md"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Match Summary */}
                    <div className="border border-[#D1D5F0] bg-[#F5F7FF] rounded-xl p-5 mb-5">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-[0.1em]">
                                AI Match Summary
                            </span>
                            <span className="bg-[#2563eb] text-white text-[10px] font-bold px-2.5 py-[3px] rounded-full leading-none">
                                95% Match
                            </span>
                        </div>
                        <p className="text-[13px] text-[#48484A] leading-[1.6]">
                            Ram Gupta is an exceptional match for this role due to his extensive experience in
                            scaling infrastructure using Terraform and managing complex Kubernetes clusters. His
                            past roles show a strong emphasis on automation and security, perfectly aligning
                            with the team's current roadmap.
                        </p>
                    </div>

                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="border border-[#E5E5EA] rounded-xl px-4 py-3.5 flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-[0.08em]">
                                Experience
                            </span>
                            <span className="text-[15px] font-semibold text-[#1C1C1E]">8+ Years</span>
                        </div>
                        <div className="border border-[#E5E5EA] rounded-xl px-4 py-3.5 flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-[#AEAEB2] uppercase tracking-[0.08em]">
                                Notice Period
                            </span>
                            <span className="text-[15px] font-semibold text-[#1C1C1E]">Immediate</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-7 py-5 flex items-center justify-between">
                    <button className="text-[#8E8E93] hover:text-[#FF3B30] text-[13px] font-medium transition-colors">
                        Reject
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button className="px-5 h-9 border border-[#D1D1D6] text-[#3C3C43] hover:bg-neutral-50 text-[13px] font-medium rounded-lg transition-colors">
                            View Full Profile
                        </button>
                        <button className="px-5 h-9 bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-[13px] font-semibold rounded-lg transition-colors">
                            Move to Screening
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewModal;