import React, { useState } from 'react';
import { ActionReviewCandidate } from '../dashboardData';

interface ActionReviewModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    candidates: ActionReviewCandidate[];
    initialIndex?: number;
}

const ActionReviewModal: React.FC<ActionReviewModalProps> = ({
    isOpen = true,
    onClose = () => { },
    candidates = [],
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    React.useEffect(() => {
        if (isOpen && candidates.length > 0) {
            setCurrentIndex(initialIndex < candidates.length ? initialIndex : 0);
        }
    }, [isOpen, initialIndex, candidates.length]);

    if (!isOpen || candidates.length === 0) return null;

    const candidate = candidates[currentIndex];
    const total = candidates.length;

    const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
    const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    // Calculate the circumference and offset for the circular progress
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (candidate.matchPercentage / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            {/* Modal Container */}
            <div className="bg-white w-full max-w-[700px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">

                {/* Modal Header — Status badge + Pagination + Close */}
                <div className="px-7 pt-5 pb-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-md border border-emerald-400 text-emerald-600 text-xs font-semibold tracking-wide">
                        {candidate.status}
                    </span>
                    <div className="flex items-center gap-3">
                        {/* Pagination */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <button
                                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                            >
                                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                                    <path d="M5 1L1 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span className="text-xs font-semibold text-slate-500 min-w-[36px] text-center tabular-nums">{currentIndex + 1}/{total}</span>
                            <button
                                className="w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                                onClick={goNext}
                                disabled={currentIndex === total - 1}
                            >
                                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                                    <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M8 2L2 8M2 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="px-7 pb-5 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">

                    {/* Candidate Name + Role + Match % */}
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h2 className="text-[22px] font-bold text-slate-900 leading-tight">
                                {candidate.name}
                            </h2>
                            <p className="text-sm font-medium mt-1" style={{ color: '#069855' }}>
                                {candidate.role} · {candidate.company}
                            </p>
                        </div>
                        {/* Circular Match Percentage */}
                        <div className="flex-shrink-0 relative w-[52px] h-[52px]">
                            <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                                <circle
                                    cx="26" cy="26" r={radius}
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                    fill="none"
                                />
                                <circle
                                    cx="26" cy="26" r={radius}
                                    stroke="#00C3D0"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progressOffset}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#00C3D0' }}>
                                {candidate.matchPercentage}%
                            </span>
                        </div>
                    </div>

                    {/* Key Stats Grid — 3 cols × 2 rows */}
                    <div className="grid grid-cols-3 gap-x-8 gap-y-3 mb-6">
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Experience</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.experience}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Current CTC</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.currentCTC}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Expected</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.expectedCTC}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Notice Period</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.noticePeriod}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Location</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.location}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Source</p>
                            <p className="text-sm font-semibold text-slate-800 mt-0.5">{candidate.source}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="border-slate-100 mb-5" />

                    {/* Quick Fit Summary */}
                    <div className="mb-5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">QUICK FIT SUMMARY</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                            {candidate.quickFitSkills.map((skill) => (
                                <span
                                    key={skill.name}
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium"
                                    style={{ color: skill.match ? '#069855' : '#DC2626' }}
                                >
                                    {skill.name}
                                    {skill.match ? (
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="7" stroke="#069855" strokeWidth="1.5" />
                                            <path d="M5 8L7 10L11 6" stroke="#069855" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="7" stroke="#DC2626" strokeWidth="1.5" />
                                            <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Summary</h4>
                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {candidate.aiSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-7 py-4 flex items-center justify-between border-t border-slate-100">
                    {/* Left: Skip */}
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Skip
                    </button>

                    {/* Right: View Profile, Call, Move to Screening */}
                    <div className="flex items-center gap-2.5">
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M7 4.5V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                <circle cx="7" cy="9.5" r="0.5" fill="currentColor" />
                            </svg>
                            View Profile
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M4 7.5C4.5 6 5.5 5 7 5C8.5 5 9.5 6 10 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                <circle cx="7" cy="7.5" r="1" stroke="currentColor" strokeWidth="1" />
                            </svg>
                            Call
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all shadow-sm" style={{ backgroundColor: '#069855' }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 7H12M9 4L12 7L9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Move to Screening
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewModal;