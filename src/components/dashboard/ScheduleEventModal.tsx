import React from 'react';

interface ScheduleEventModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({
    isOpen = true,
    onClose = () => { },
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="p-8 pb-5 border-b border-slate-100 relative">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col items-start pr-8">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                1st Technical Interview: Sarah Jenkins
                            </h2>
                            <button className="text-sm font-semibold text-blue-600 underline underline-offset-4 hover:opacity-70 transition-opacity mt-2">
                                Reschedule Event
                            </button>
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
                        <span className="text-[11px] font-bold tracking-widest uppercase">1 of 4</span>
                        <button className="hover:text-slate-600 transition-colors">
                            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto space-y-8 flex-1">

                    {/* Event Info */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                Live In 5 Mins
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900">1st Technical Interview</h3>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Oct 25, 2023 | 09:00 AM - 10:00 AM (EST)</p>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Deep dive into React internals, specifically focusing on Reconciliation, Hooks implementation, and Concurrent Mode. The interview will also include a short system design challenge focused on real-time data streaming architectures.
                    </p>

                    {/* Primary Action */}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        Join Meeting (Google Meet)
                    </button>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* Recruiter Info */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recruiter</p>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white shadow-sm bg-slate-100"
                                    style={{
                                        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAE_PSOqDBwLVeSV_V-WQ6k89ghwcB6WUjkj8C-F70jlcZ1FDTPqDEXMINeXvXwaVExHNXjaNOWGURwqRiKXWdlqpSTwHayrHPloDGTJ4bxWc7cY9yZwskyoOui_YbTHg06KlN4Hu0X_XMqSMTW9G9GPWAMEn9dvrCrTujlH7uqsmxIGGFLY4ZTp6W_e32LBdM5LQTWlQL5ynMl-eSyOwv1NJh4-i86cIiZyF-sfTbN-Yir_SO5_hVdR49hMmkdit3dfnrHnUFI8kKV')`
                                    }}
                                />
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Alex Rivera</p>
                                    <p className="text-sm text-slate-500">Talent Acquisition Lead</p>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Contact */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Candidate Contact</p>
                            <div className="space-y-1.5">
                                <a
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                                    href="mailto:sarah.j@example.com"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    sarah.j@example.com
                                </a>
                                <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    +1 (555) 123-4567
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold text-sm hover:bg-slate-50 transition-all order-3 sm:order-1"
                    >
                        Close
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                        <button className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Message
                        </button>
                        <button className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleEventModal;
