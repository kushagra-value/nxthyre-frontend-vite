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
        <div className="font-display bg-[#f7f7f7] dark:bg-[#191919] text-neutral-900 min-h-screen overflow-hidden">
            {/* Blurred Background Dashboard Mockup */}
            <div className="fixed inset-0 z-0 flex flex-col overflow-hidden opacity-50 pointer-events-none">
                <header className="flex items-center justify-between border-b border-neutral-200 px-10 py-3 bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 text-neutral-900 dark:text-white">
                            <span className="material-symbols-outlined">database</span>
                            <h2 className="text-lg font-bold tracking-tight">Recruitment Dashboard</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                </header>

                <div className="flex flex-1">
                    <aside className="w-20 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col items-center py-6 gap-6">
                        <span className="material-symbols-outlined text-primary">dashboard</span>
                        <span className="material-symbols-outlined text-primary">work</span>
                        <span className="material-symbols-outlined text-primary">group</span>
                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                    </aside>

                    <main className="flex-1 p-10">
                        <div className="h-12 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-8" />
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-48 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700" />
                            <div className="h-48 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700" />
                            <div className="h-48 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700" />
                        </div>
                    </main>
                </div>
            </div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-neutral-800 w-full max-w-[640px] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                    {/* Modal Header Utility Bar */}
                    <div className="px-6 pt-4 flex justify-end items-center gap-4">
                        <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                            <button className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px] leading-none">chevron_left</span>
                            </button>
                            <span>1 of 24</span>
                            <button className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[20px] leading-none">chevron_right</span>
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Modal Header Content */}
                    <div className="px-8 pb-4">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                            Need Action on Senior DevOps Role
                        </h1>
                        <a
                            href="#"
                            className="text-[#2563eb] hover:underline text-sm font-semibold mt-1 inline-block"
                        >
                            Move all suitable candidates
                        </a>
                    </div>

                    {/* Scrollable Content */}
                    <div className="px-8 py-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                        {/* Candidate Info Card */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="relative flex-shrink-0">
                                <div className="size-16 rounded-lg bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                    <img
                                        alt="Professional portrait of a male candidate Ram Gupta"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT3sqE6RS0WmeZC9ArbIb8MM0-p-S0-dOWpwKXbcGSUftawEeGPpMktD6ANae56887NK3bzR7kiWfds8A6-dzSGuJkS1Sl94WTahskERf3bPIyTVfkhilfvymlG1GgxTUL9Ziyn-kqE750oSaA97y7M_tuNFIEUG7s2bHSyQHKVykRaKgstr2aSKuNsQ0A9aWAIgt_Bwgfp9hWow4OkmXiH7MRT49H8h4VxFDnEE2A4uyy4g9KxBcX37YIMZtE8qnGWAPHSntdknZI"
                                    />
                                </div>
                                <div
                                    className="absolute -bottom-1 -right-1 size-4 bg-[#22c55e] border-2 border-white dark:border-neutral-800 rounded-full"
                                    title="Active"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white truncate">
                                        Ram Gupta
                                    </h3>
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                                        Source: Nxthyre
                                    </span>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Senior DevOps Role</p>

                                {/* Skill Tags */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded">
                                        Docker
                                    </span>
                                    <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded">
                                        Kubernetes
                                    </span>
                                    <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded">
                                        Terraform
                                    </span>
                                    <span className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded">
                                        AWS
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* AI Match Summary */}
                        <div className="bg-[#eff6ff] dark:bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-lg p-5 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[11px] font-bold text-[#2563eb] uppercase tracking-widest">
                                    AI Match Summary
                                </h4>
                                <span className="bg-[#2563eb] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    95% MATCH
                                </span>
                            </div>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                Ram Gupta is an exceptional match for this role due to his extensive experience in
                                scaling infrastructure using Terraform and managing complex Kubernetes clusters. His
                                past roles show a strong emphasis on automation and security, perfectly aligning
                                with the team's current roadmap.
                            </p>
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
                                    Experience
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">8+ Years</span>
                            </div>
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase">
                                    Notice Period
                                </span>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">Immediate</span>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                        <button className="text-neutral-500 hover:text-red-600 font-semibold text-sm transition-colors">
                            Reject
                        </button>

                        <div className="flex items-center gap-3">
                            <button className="px-5 h-10 border border-primary text-primary hover:bg-neutral-50 dark:hover:bg-neutral-700 font-bold text-sm rounded-lg transition-colors">
                                View Full Profile
                            </button>
                            <button className="px-5 h-10 bg-[#2563eb] text-white hover:bg-blue-700 font-bold text-sm rounded-lg shadow-sm transition-colors">
                                Move to Screening
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewModal;