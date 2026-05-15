import React, { useState } from 'react';
import type { ScheduleEventAPI } from '../../../services/dashboardService';

interface ScheduleEventModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    events: ScheduleEventAPI[];
    initialIndex?: number;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({
    isOpen = true,
    onClose = () => { },
    events = [],
    initialIndex = 0,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    React.useEffect(() => {
        if (isOpen && events.length > 0) {
            setCurrentIndex(initialIndex < events.length ? initialIndex : 0);
        }
    }, [isOpen, initialIndex, events.length]);

    if (!isOpen || events.length === 0) return null;

    const event = events[currentIndex];
    const details = event.modal_details;
    const total = events.length;

    const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, total - 1));
    const goPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    // Construct data for CallCandidateModal
    // Construct data for manual call navigation
    const callCandidateData = {
        id: details.candidate_id || '',
        name: details.candidate_name,
        avatarInitials: details.candidate_name
            .split(' ')
            .slice(0, 2)
            .map(n => n[0])
            .join('')
            .toUpperCase(),
        headline: details.candidate_info.position,
        phone: details.candidate_contact.phone || '',
        experience: details.candidate_info.experience,
        expectedCtc: 'N/A', // Not in this modal's data usually
        location: 'Remote', // Or get from description/meeting_platform if applicable
        noticePeriod: 'N/A'
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Modal Container */}
                <div
                    className="bg-white flex flex-col overflow-y-auto"
                    style={{ width: 459, maxHeight: 600, borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ─── Header ─── */}
                    <div className="w-full shrink-0" style={{ borderBottom: '0.5px solid #AEAEB2' }}>
                        <div className="flex items-center justify-between" style={{ padding: '18px 24px' }}>
                            {/* Interview type badge */}
                            <span
                                className="inline-flex items-center text-sm font-normal"
                                style={{ padding: '4px 8px', background: '#E7EDFF', borderRadius: 4, color: '#0088FF', lineHeight: '17px' }}
                            >
                                {details.interview_type}
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

                    {/* ─── Candidate Info Section ─── */}
                    <div className="w-full grow overflow-y-auto" style={{ padding: '20px 24px' }}>
                        <div className="flex flex-col" style={{ gap: 18 }}>
                            {/* Candidate header with accent bar */}
                            <div className="flex items-start" style={{ gap: 5 }}>
                                <div className="shrink-0" style={{ width: 5, height: 48, background: '#00C8B3', borderRadius: 10 }}></div>
                                <div className="flex flex-col" style={{ gap: 10 }}>
                                    <h3 className="m-0 font-medium text-black" style={{ fontSize: 20, lineHeight: '24px' }}>
                                        {details.candidate_name}
                                    </h3>
                                    <p className="m-0 text-xs font-normal" style={{ color: '#0F47F2', lineHeight: '14px' }}>
                                        {details.candidate_info.company} · {details.candidate_info.position} · {details.candidate_info.experience}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="flex flex-col rounded-md bg-gray-50" style={{ padding: '20px 14px', gap: 20 }}>
                                {/* Row 1: Date & Time */}
                                <div className="flex items-start" style={{ gap: 70 }}>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Date</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.date}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Time</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.time_range}</span>
                                    </div>
                                </div>
                                {/* Row 2: Mode & Duration */}
                                <div className="flex items-start" style={{ gap: 70 }}>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Mode</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.meeting_platform}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Duration</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.duration}</span>
                                    </div>
                                </div>
                                {/* Row 3: Interviewer & Job Role */}
                                <div className="flex items-start" style={{ gap: 70 }}>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Interviewer</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.interviewer_info.interviewer_name}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Job Role</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{details.interviewer_info.job_role}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {details.description && (
                                <div className="flex flex-col" style={{ gap: 8 }}>
                                    <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Description</span>
                                    <p className="m-0 text-sm font-normal text-gray-600 leading-relaxed">
                                        {details.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Footer Actions ─── */}
                    <div className="flex flex-col justify-center items-start shrink-0" style={{ padding: '24px 27px', gap: 10, borderTop: '0.5px solid #AEAEB2' }}>
                        {/* Primary CTA */}
                        <div className="flex items-center justify-between w-full" style={{ gap: 10 }}>
                            <button
                                className="flex-1 flex items-center justify-center text-sm font-normal text-white cursor-pointer hover:opacity-90"
                                style={{ height: 37, background: '#10B981', border: '0.5px solid #10B981', borderRadius: 5, padding: 10, lineHeight: '17px' }}
                                onClick={() => {
                                    // Call API to mark completed (Implementation deferred to backend connection)
                                }}
                            >
                                Mark Completed
                            </button>
                            <button
                                className="flex-1 flex items-center justify-center text-sm font-normal text-white cursor-pointer hover:opacity-90"
                                style={{ height: 37, background: '#EF4444', border: '0.5px solid #EF4444', borderRadius: 5, padding: 10, lineHeight: '17px' }}
                                onClick={() => {
                                    // Call API to mark cancelled (Implementation deferred to backend connection)
                                }}
                            >
                                Mark Cancelled
                            </button>
                        </div>

                        {/* Secondary buttons row */}
                        <div className="flex items-center justify-between w-full" style={{ gap: 10 }}>
                            <button
                                className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2', lineHeight: '17px' }}
                                onClick={() => {
                                    if (details.candidate_id) {
                                        const jobIdParam = details.job_id;
                                        const url = jobIdParam
                                            ? `/candidate-profiles/${details.candidate_id}?job_id=${jobIdParam}`
                                            : `/candidate-profiles/${details.candidate_id}`;
                                        window.open(url, '_blank');
                                    }
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="10" r="3.5" stroke="#0F47F2" strokeWidth="1.5" />
                                    <path d="M5.5 19.5C5.5 16.5 8.5 14.5 12 14.5C15.5 14.5 18.5 16.5 18.5 19.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="12" cy="12" r="10" stroke="#0F47F2" strokeWidth="1.5" />
                                </svg>
                                View Profile
                            </button>
                            <button
                                className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2', lineHeight: '17px' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0F47F2" strokeWidth="1.5" />
                                    <path d="M8 2V5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M16 2V5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M3 9H21" stroke="#0F47F2" strokeWidth="1.5" />
                                    <path d="M14.5 14L18 17.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M18 14L14.5 17.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Reschedule
                            </button>
                            <button
                                className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2', lineHeight: '17px' }}
                                onClick={() => {
                                    sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ candidate: callCandidateData }));
                                    window.location.href = `/call/${callCandidateData.id}/${details.job_id || 0}?mode=manual`;
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M14.5 2C14.5 2 16.5 2.5 19 5C21.5 7.5 22 9.5 22 9.5" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14.5 5.5C14.5 5.5 15.5 6 17 7.5C18.5 9 19 10 19 10" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C19.05 22.1 16.8 22 14 20C11.51 18.22 9.37 16.08 7.78 13.78C5.69 10.96 5.5 8.78 5.5 7.5C5.5 5.5 7 4 8.5 4C9 4 9.5 4.5 10 5L11.5 7.5C12 8.5 11 9.5 10.5 10C10 10.5 10 11 11 12.5C12 14 13 15 14.5 14C15 13.5 16 12.5 17 13L19.5 14.5C20.5 15 21 15.5 21 16C21.5 16.25 22 16.42 22 16.92Z" stroke="#0F47F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Call Candidate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ScheduleEventModal;
