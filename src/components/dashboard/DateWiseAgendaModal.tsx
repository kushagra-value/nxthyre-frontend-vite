import React from 'react';

interface DateWiseAgendaModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const DateWiseAgendaModal: React.FC<DateWiseAgendaModalProps> = ({
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
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">February 13, 2024</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Daily Agenda</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="mb-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-1"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    {/* Day navigation — bottom-right of header */}
                    <div className="flex items-center gap-3 mt-4 text-slate-400 absolute right-8 bottom-5">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1">
                            <button className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm text-slate-600">
                                <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                    <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span className="px-4 text-sm font-bold text-slate-900">Today</span>
                            <button className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm text-slate-600">
                                <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                    <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">

                    {/* Top Row: Live Status + Alerts side by side */}
                    <div className="flex gap-3 items-stretch">
                        {/* Live Status Card */}
                        <div className="flex-1 bg-gradient-to-br from-blue-600/10 to-blue-50/50 border border-blue-200 rounded-xl p-4 relative">
                            {/* Live badge — top left */}
                            <div className="flex items-center gap-1.5 mb-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                </span>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600">Live Now</span>
                            </div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="flex -space-x-2 shrink-0">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-white bg-cover bg-center bg-slate-200"
                                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')` }}
                                    />
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-bold text-xs leading-tight">
                                        Marcus Thorne → Sarah Jenkins
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500">1st Tech • 45m elapsed</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button className="flex-1 px-2.5 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700 transition-all flex items-center justify-center gap-1 shadow-md shadow-blue-200">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    Observe
                                </button>
                                <button className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-md hover:bg-slate-50 transition-all flex items-center justify-center gap-1">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Notes
                                </button>
                            </div>
                        </div>

                        {/* Alerts — stacked on the right */}
                        <div className="flex flex-col gap-2 w-[200px] shrink-0">
                            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="p-1 bg-amber-100 rounded shrink-0">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">In 5m</p>
                                </div>
                                <p className="text-xs font-bold text-slate-900 leading-tight mb-2">Emily Watson</p>
                                <button className="w-full px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-extrabold rounded-md transition-all uppercase">
                                    Send Reminder
                                </button>
                            </div>
                            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="p-1 bg-slate-200 rounded text-slate-500 shrink-0">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Done</p>
                                </div>
                                <p className="text-xs font-bold text-slate-900 leading-tight mb-2">John Doe</p>
                                <button className="w-full px-2 py-1 border border-blue-600/30 text-blue-600 text-[9px] font-extrabold rounded-md hover:bg-blue-50 transition-all uppercase">
                                    Feedback
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Detailed Schedule */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detailed Schedule</h3>
                            <span className="text-[10px] text-slate-400 italic">CST</span>
                        </div>

                        <div className="space-y-2">
                            {/* Item 1: Completed */}
                            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 opacity-70 hover:opacity-90 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-xs text-slate-700 truncate">John Doe</h4>
                                            <span className="bg-slate-100 text-slate-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Done</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-[10px] text-slate-400 truncate">Sr. Frontend Dev • Tech Round</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-400">09:00 AM</span>
                                                <button className="text-blue-600 hover:underline text-[10px] font-bold">Summary</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item 2: In Progress (Active) */}
                            <div className="bg-white border-2 border-blue-600/20 rounded-lg px-4 py-3 shadow-md shadow-blue-600/5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 ring-2 ring-blue-600/10 ring-offset-1 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-xs text-slate-900 truncate">Sarah Jenkins</h4>
                                            <span className="bg-blue-600/10 text-blue-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                Live
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-[10px] text-slate-500 truncate">Product Manager • Culture Fit</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-blue-600">11:30 AM</span>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-all shadow-sm shadow-blue-200 flex items-center gap-1 active:scale-95">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="23 7 16 12 23 17 23 7" />
                                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                                    </svg>
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item 3: Upcoming */}
                            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-600/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-xs text-slate-900 truncate">Michael Chen</h4>
                                            <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Upcoming</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-[10px] text-slate-500 truncate">UX Designer • Portfolio Review</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-500">02:00 PM</span>
                                                <button className="border border-slate-200 hover:bg-blue-50 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-md transition-all">Profile</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Item 4: Upcoming */}
                            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-600/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-xs text-slate-900 truncate">Emily Watson</h4>
                                            <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Upcoming</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-[10px] text-slate-500 truncate">Talent Coordinator • Final Screening</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-500">04:30 PM</span>
                                                <button className="bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-all shadow-sm">Join</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 text-sm font-bold transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Print Agenda
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            Close
                        </button>
                        <button className="px-6 py-2.5 text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all">
                            Export Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateWiseAgendaModal;
