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
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Daily Agenda</p>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">February 13, 2024</h2>
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
                <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">

                    {/* Section 1: Live Status + Summary */}
                    <section className="space-y-6">
                        {/* Live Status Card */}
                        <div className="bg-gradient-to-r from-blue-600/10 to-blue-50/50 border border-blue-200 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                </span>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600">Live Status</h3>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        <div
                                            className="w-12 h-12 rounded-full border-2 border-white bg-cover bg-center bg-slate-200"
                                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')` }}
                                        />
                                        <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-bold text-lg">
                                            <span className="font-extrabold">Marcus Thorne</span> is interviewing <span className="font-extrabold">Sarah Jenkins</span>
                                        </p>
                                        <p className="text-sm font-medium text-slate-500">1st Tech Interview • 45m elapsed</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex-1 lg:flex-none px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        Join as Observer
                                    </button>
                                    <button className="flex-1 lg:flex-none px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Real-time Notes
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alert Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Starts Soon */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Starts in 5m</p>
                                        <p className="text-sm font-bold text-slate-900">Emily Watson's interview</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-lg transition-all shadow-sm uppercase">
                                    Send Reminder
                                </button>
                            </div>

                            {/* Recently Completed */}
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-200 rounded-lg text-slate-500">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recently Completed</p>
                                        <p className="text-sm font-bold text-slate-900">John Doe (Frontend)</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-blue-600/30 text-blue-600 text-xs font-extrabold rounded-lg hover:bg-blue-50 transition-all uppercase">
                                    Enter Feedback
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Detailed Schedule */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Detailed Schedule</h3>
                            <span className="text-xs text-slate-400 italic">Central Standard Time (CST)</span>
                        </div>

                        <div className="space-y-4 relative">
                            {/* Timeline vertical line */}
                            <div className="absolute left-[4.25rem] top-4 bottom-4 w-px bg-slate-100 hidden md:block" />

                            {/* Item 1: Completed */}
                            <div className="flex flex-col md:flex-row gap-6 relative group">
                                <div className="w-24 shrink-0 text-right md:pt-6">
                                    <p className="text-sm font-bold text-slate-400">09:00 AM</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">60 MINS</p>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow opacity-75">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-50 shadow-sm" />
                                        <div>
                                            <h4 className="font-extrabold text-slate-800">John Doe</h4>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                <span>Senior Frontend Developer</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-xs">Tech Round</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex -space-x-3">
                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-200" />
                                            <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-300" />
                                        </div>
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">Completed</span>
                                        <button className="text-blue-600 hover:underline text-sm font-bold">View Summary</button>
                                    </div>
                                </div>
                            </div>

                            {/* Item 2: In Progress */}
                            <div className="flex flex-col md:flex-row gap-6 relative">
                                <div className="w-24 shrink-0 text-right md:pt-6">
                                    <p className="text-sm font-bold text-blue-600">11:30 AM</p>
                                    <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-tighter">LIVE NOW</p>
                                </div>
                                <div className="flex-1 bg-white border-2 border-blue-600/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl shadow-blue-600/10 ring-1 ring-blue-600/5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 ring-4 ring-blue-600/10 ring-offset-2" />
                                        <div>
                                            <h4 className="font-extrabold text-slate-900">Sarah Jenkins</h4>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                <span>Product Manager</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-xs">Culture Fit</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="bg-blue-600/10 text-blue-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                            In Progress
                                        </span>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="23 7 16 12 23 17 23 7" />
                                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                            </svg>
                                            Join Meeting
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Item 3: Upcoming */}
                            <div className="flex flex-col md:flex-row gap-6 relative group">
                                <div className="w-24 shrink-0 text-right md:pt-6">
                                    <p className="text-sm font-bold text-slate-600">02:00 PM</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">45 MINS</p>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:border-blue-600/30 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-100 shadow-sm" />
                                        <div>
                                            <h4 className="font-extrabold text-slate-900">Michael Chen</h4>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                <span>UX Designer</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-xs">Portfolio Review</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">Upcoming</span>
                                        <button className="border-2 border-slate-100 hover:border-blue-600/20 hover:bg-blue-50 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-all">Profile</button>
                                        <button className="border-2 border-slate-100 hover:border-blue-600/20 hover:bg-blue-50 text-slate-700 text-sm font-bold px-5 py-2.5 rounded-xl transition-all">Reschedule</button>
                                    </div>
                                </div>
                            </div>

                            {/* Item 4: Upcoming */}
                            <div className="flex flex-col md:flex-row gap-6 relative group">
                                <div className="w-24 shrink-0 text-right md:pt-6">
                                    <p className="text-sm font-bold text-slate-600">04:30 PM</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">30 MINS</p>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:border-blue-600/30 transition-all">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-100 shadow-sm" />
                                        <div>
                                            <h4 className="font-extrabold text-slate-900">Emily Watson</h4>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                <span>Talent Coordinator</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-xs">Final Screening</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">Upcoming</span>
                                        <button className="bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md">Join Call</button>
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
