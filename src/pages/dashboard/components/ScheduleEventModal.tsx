import React, { useState } from 'react';
import type { ScheduleEventAPI } from '../../../services/dashboardService';
import scheduleService from '../../../services/scheduleService';
import toast from "react-hot-toast";
import { Check, X } from 'lucide-react';

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
                    <div className="flex flex-col justify-center items-start shrink-0" style={{ padding: '24px 27px', gap: 12, borderTop: '0.5px solid #AEAEB2' }}>
                        {(() => {
                            // UPDATED: Robust status detection
                            const status = (details.status || event.status || 'SCHEDULED').toUpperCase();
                            const isActionable = ['SCHEDULED', 'OVERDUE'].includes(status);

                            const statusConfig = {
                                SCHEDULED: { bg: '#10B981', text: '#FFF', label: 'Scheduled' },
                                OVERDUE:   { bg: '#F59E0B', text: '#FFF', label: 'Overdue' },
                                COMPLETED: { bg: '#6B7280', text: '#FFF', label: 'Completed' },
                                CANCELLED: { bg: '#EF4444', text: '#FFF', label: 'Cancelled' },
                            }[status] || { bg: '#6B7280', text: '#FFF', label: status };

                            return (
                                <>
                                    {/* Status Badge - Always Visible */}
                                    <div className="flex justify-center mb-3">
                                        <span
                                            className="text-sm font-bold px-5 py-2 rounded-full tracking-wide shadow-sm"
                                            style={{ 
                                                backgroundColor: statusConfig.bg, 
                                                color: statusConfig.text 
                                            }}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Primary Action Buttons - Only for Scheduled & Overdue */}
                                    {isActionable && (
                                        <div className="flex items-center justify-between w-full gap-3 mb-4">
                                            <button
                                                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all py-3 rounded-lg"
                                                style={{ background: '#10B981' }}
                                                onClick={async () => {
                                                    try {
                                                        await scheduleService.updateEventStatus(event.id, 'COMPLETED');
                                                        toast.success("Event marked as Completed");
                                                        onClose?.();
                                                    } catch (err) {
                                                        toast.error("Failed to mark as completed");
                                                    }
                                                }}
                                            >
                                                <Check className="w-4 h-4" />
                                                Mark Completed
                                            </button>

                                            <button
                                                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all py-3 rounded-lg"
                                                style={{ background: '#EF4444' }}
                                                onClick={async () => {
                                                    try {
                                                        await scheduleService.updateEventStatus(event.id, 'CANCELLED');
                                                        toast.success("Event marked as Cancelled");
                                                        onClose?.();
                                                    } catch (err) {
                                                        toast.error("Failed to mark as cancelled");
                                                    }
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                                Mark Cancelled
                                            </button>
                                        </div>
                                    )}

                                    {/* Secondary Buttons - Always Visible */}
                                    <div className="flex items-center justify-between w-full gap-3">
                                        <button
                                            className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                            style={{ height: 42, border: '0.5px solid #0F47F2', borderRadius: 6, gap: 6, color: '#0F47F2' }}
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
                                            View Profile
                                        </button>

                                        <button
                                            className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                            style={{ height: 42, border: '0.5px solid #0F47F2', borderRadius: 6, gap: 6, color: '#0F47F2' }}
                                        >
                                            Reschedule
                                        </button>

                                        <button
                                            className="flex-1 flex items-center justify-center text-sm font-normal cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                                            style={{ height: 42, border: '0.5px solid #0F47F2', borderRadius: 6, gap: 6, color: '#0F47F2' }}
                                            onClick={() => {
                                                sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ candidate: callCandidateData }));
                                                window.location.href = `/call/${callCandidateData.id}/${details.job_id || 0}?mode=manual`;
                                            }}
                                        >
                                            Call Candidate
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>

        </>
    );
};

export default ScheduleEventModal;
