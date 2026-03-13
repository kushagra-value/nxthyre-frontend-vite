import React, { useState } from 'react';
import { NewMatchCandidate } from '../dashboardData';

interface NewMatchCandidateModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    candidates: NewMatchCandidate[];
    initialIndex?: number;
}

const NewMatchCandidateModal: React.FC<NewMatchCandidateModalProps> = ({
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

    // SVG arc for the match percentage ring
    const matchPct = candidate.matchPercentage;
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (matchPct / 100) * circumference;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                className="bg-white flex flex-col"
                style={{ width: 553, maxHeight: 727, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="w-full shrink-0" style={{ borderBottom: '0.5px solid #AEAEB2' }}>
                    <div className="flex items-center justify-between" style={{ padding: '20px 24px' }}>
                        {/* Title */}
                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                            New Talent Matches
                        </span>

                        {/* Right side: pagination + close */}
                        <div className="flex items-center gap-5">
                            {/* Pagination nav */}
                            <div className="flex items-center gap-2">
                                <button
                                    className="flex items-center justify-center bg-white p-0 cursor-pointer hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed"
                                    style={{ width: 30, height: 30, border: '0.5px solid #D1D1D6', borderRadius: 7 }}
                                    onClick={goPrev}
                                    disabled={currentIndex === 0}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                                        <path d="M5 1L1 5L5 9" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <span className="text-xs text-gray-600 text-center" style={{ minWidth: 22, lineHeight: '14px' }}>
                                    {currentIndex + 1}/{total}
                                </span>
                                <button
                                    className="flex items-center justify-center bg-white p-0 cursor-pointer hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed"
                                    style={{ width: 30, height: 30, border: '0.5px solid #D1D1D6', borderRadius: 7 }}
                                    onClick={goNext}
                                    disabled={currentIndex === total - 1}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                                        <path d="M1 1L5 5L1 9" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Close button */}
                            <button
                                className="flex items-center justify-center bg-transparent border-none p-0 cursor-pointer hover:opacity-60"
                                onClick={onClose}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#4B5563" strokeWidth="1" />
                                    <path d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Scrollable */}
                <div className="flex-1 overflow-y-auto" style={{ padding: '20px 24px 0 24px' }}>
                    {/* ─── Candidate Info + Details Section ─── */}
                    <div className="w-full shrink-0 " style={{ borderBottom: '0.5px solid #AEAEB2' }}>
                        {/* Candidate Name + Match Ring */}
                        <div className="flex items-center justify-between" style={{ marginBottom: 30 }}>
                            <div className="flex flex-col" style={{ gap: 10 }}>
                                <h3 className="m-0 font-medium text-black" style={{ fontSize: 20, lineHeight: '24px' }}>
                                    {candidate.name}
                                </h3>
                                <p className="m-0 text-xs font-normal" style={{ color: '#0F47F2', lineHeight: '14px' }}>
                                    {candidate.role} · {candidate.company}
                                </p>
                            </div>
                            {/* Match Percentage Ring */}
                            <div className="flex flex-col items-center justify-center" style={{ width: 48, height: 48 }}>
                                <svg width="48" height="48" viewBox="0 0 48 48">
                                    {/* Background circle */}
                                    <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(116,116,128,0.08)" strokeWidth="4" />
                                    {/* Progress arc */}
                                    <circle
                                        cx="24" cy="24" r={radius}
                                        fill="none"
                                        stroke="#00C8B3"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        transform="rotate(-90 24 24)"
                                    />
                                    <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="#4B5563" fontSize="14" fontFamily="Gellix, Inter, sans-serif" fontWeight="400">
                                        {matchPct}%
                                    </text>
                                </svg>
                            </div>
                        </div>

                        {/* Details Grid — 3 columns × 2 rows */}
                        {/* Row 1: Experience, Current CTC, Expected */}
                        <div className="flex items-start justify-between" style={{ gap: 67, marginBottom: 20 }}>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Experience</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.experience}</span>
                            </div>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Current CTC</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.currentCTC}</span>
                            </div>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Expected</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.expectedCTC}</span>
                            </div>
                        </div>
                        {/* Row 2: Notice Period, Location, Source */}
                        <div className="flex items-start justify-between" style={{ gap: 67 }}>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Notice Period</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.noticePeriod}</span>
                            </div>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Location</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.location}</span>
                            </div>
                            <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Source</span>
                                <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{candidate.source}</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Quick Fit Summary + AI Summary ─── */}
                    <div className="w-full shrink-0">
                        {/* Quick Fit Summary Header */}
                        <h4 className="m-0 font-medium text-sm uppercase text-gray-600" style={{ lineHeight: '17px', marginBottom: 20 }}>
                            Quick Fit Summary
                        </h4>

                        {/* Quick Fit Tags */}
                        <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 30 }}>
                            {candidate.quickFitSkills.map((skill) => (
                                <span
                                    key={skill.name}
                                    className="inline-flex items-center text-sm font-normal"
                                    style={{
                                        padding: '10px 12px',
                                        background: '#F5F9FB',
                                        borderRadius: 20,
                                        gap: 5,
                                        color: skill.match ? '#009951' : '#CF272D',
                                        lineHeight: '17px',
                                    }}
                                >
                                    {skill.name}
                                    {skill.match ? (
                                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <circle cx="8.5" cy="8.5" r="8" stroke="#009951" strokeWidth="1" />
                                            <path d="M5 8.5L7.5 11L12 6" stroke="#009951" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <circle cx="8.5" cy="8.5" r="8" stroke="#CF272D" strokeWidth="1" />
                                            <path d="M6 6L11 11M11 6L6 11" stroke="#CF272D" strokeWidth="1.2" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </div>

                        {/* AI Summary Header */}
                        <h4 className="m-0 font-medium text-sm uppercase text-gray-600" style={{ lineHeight: '17px', marginBottom: 10 }}>
                            AI Summary
                        </h4>

                        {/* AI Summary Box */}
                        <div className="bg-gray-50" style={{ borderRadius: 10, padding: '8px 0 6px 8px' }}>
                            <p className="m-0 text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '25px' }}>
                                {candidate.aiSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Footer Actions ─── */}
                <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px', gap: 76 }}>
                    {/* Skip button */}
                    <button
                        className="flex items-center justify-center cursor-pointer bg-white text-sm font-normal"
                        style={{ height: 37, border: '0.5px solid #FF383C', borderRadius: 5, padding: 10, gap: 5, color: '#FF383C' }}
                    >
                        {/* Trash icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9.17 4H14.83L15.5 2H8.5L9.17 4Z" stroke="#FF383C" strokeWidth="1.2" />
                            <path d="M3.5 6H20.5" stroke="#FF383C" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M5.5 6V19C5.5 20.1 6.4 21 7.5 21H16.5C17.6 21 18.5 20.1 18.5 19V6" stroke="#FF383C" strokeWidth="1.2" />
                            <path d="M9.5 11V16" stroke="#FF383C" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M14.5 11V16" stroke="#FF383C" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        Skip
                    </button>

                    {/* Right side buttons */}
                    <div className="flex items-center" style={{ gap: 10 }}>
                        {/* View Profile */}
                        <button
                            className="flex items-center justify-center cursor-pointer bg-transparent text-sm font-normal"
                            style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="10" r="3.5" stroke="#0F47F2" strokeWidth="1.5" />
                                <path d="M5.5 19.5C5.5 16.5 8.5 14.5 12 14.5C15.5 14.5 18.5 16.5 18.5 19.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="10" stroke="#0F47F2" strokeWidth="1.5" />
                            </svg>
                            View Profile
                        </button>

                        {/* Call */}
                        <button
                            className="flex items-center justify-center cursor-pointer bg-transparent text-sm font-normal"
                            style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M14.5 2C14.5 2 16.5 2.5 19 5C21.5 7.5 22 9.5 22 9.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M14.5 5.5C14.5 5.5 15.5 6 17 7.5C18.5 9 19 10 19 10" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C19.05 22.1 16.8 22 14 20C11.51 18.22 9.37 16.08 7.78 13.78C5.69 10.96 5.5 8.78 5.5 7.5C5.5 5.5 7 4 8.5 4C9 4 9.5 4.5 10 5L11.5 7.5C12 8.5 11 9.5 10.5 10C10 10.5 10 11 11 12.5C12 14 13 15 14.5 14C15 13.5 16 12.5 17 13L19.5 14.5C20.5 15 21 15.5 21 16C21.5 16.25 22 16.42 22 16.92Z" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Call
                        </button>

                        {/* Send Nvites — primary */}
                        <button
                            className="flex items-center justify-center cursor-pointer text-sm font-normal text-white"
                            style={{ height: 37, background: '#0F47F2', border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5 }}
                        >
                            {/* Send icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M5.4 12L3 21L21 12L3 3L5.4 12Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M5.4 12H12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Send Nvites
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewMatchCandidateModal;
