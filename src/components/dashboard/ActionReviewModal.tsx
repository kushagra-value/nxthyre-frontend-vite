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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">

                {/* Modal Header */}
                <div className="p-8 pb-5 border-b border-slate-100 relative">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start pr-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Need Action on Senior DevOps Role
                            </h2>
                            <a
                                href="#"
                                className="text-[#2563eb] text-[13px] font-medium mt-2 inline-block hover:underline"
                            >
                                Move all suitable candidates
                            </a>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-1"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    {/* Pagination — bottom-right of header */}
                    <div className="flex items-center gap-3 mt-4 text-slate-400 absolute right-8 bottom-5">
                        <button className="hover:text-slate-600 transition-colors">
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <span className="text-[11px] font-bold tracking-widest uppercase">1 of 24</span>
                        <button className="hover:text-slate-600 transition-colors">
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">

                    {/* Candidate row */}
                    <div className="flex items-start gap-5">
                        <div className="relative flex-shrink-0">
                            <div className="w-[56px] h-[56px] rounded-xl bg-neutral-200 overflow-hidden">
                                <img
                                    alt="Ram Gupta"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT3sqE6RS0WmeZC9ArbIb8MM0-p-S0-dOWpwKXbcGSUftawEeGPpMktD6ANae56887NK3bzR7kiWfds8A6-dzSGuJkS1Sl94WTahskERf3bPIyTVfkhilfvymlG1GgxTUL9Ziyn-kqE750oSaA97y7M_tuNFIEUG7s2bHSyQHKVykRaKgstr2aSKuNsQ0A9aWAIgt_Bwgfp9hWow4OkmXiH7MRT49H8h4VxFDnEE2A4uyy4g9KxBcX37YIMZtE8qnGWAPHSntdknZI"
                                />
                            </div>
                            <div
                                className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"
                                title="Active"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    Ram Gupta
                                </h3>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    Source: Nxthyre
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-3">Senior DevOps Role</p>

                            {/* Skill Tags — outlined style */}
                            <div className="flex flex-wrap gap-2">
                                {['Docker', 'Kubernetes', 'Terraform', 'AWS'].map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Match Summary */}
                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0">
                            <div className="bg-blue-600 px-4 py-1.5 text-white text-[10px] font-bold rounded-bl-xl tracking-widest">
                                95% MATCH
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                                <path d="M20.7 11A8.5 8.5 0 0 0 13 3.3V11h7.7z" />
                            </svg>
                            <h4 className="font-bold text-sm uppercase tracking-widest">AI Match Summary</h4>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Ram Gupta is an exceptional match for this role due to his extensive experience in
                            scaling infrastructure using Terraform and managing complex Kubernetes clusters. His
                            past roles show a strong emphasis on automation and security, perfectly aligning
                            with the team's current roadmap.
                        </p>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-200">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience</p>
                                <p className="font-bold text-slate-900 text-lg">8+ Years</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-slate-200">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Notice Period</p>
                                <p className="font-bold text-slate-900 text-lg">Immediate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <button className="text-slate-400 hover:text-red-500 text-sm font-semibold transition-colors order-3 sm:order-1">
                        Reject
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <button className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all">
                            View Full Profile
                        </button>
                        <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            Move to Screening
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewModal;