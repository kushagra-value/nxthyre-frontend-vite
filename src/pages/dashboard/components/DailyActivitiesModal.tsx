import React from 'react';
import type { DailyActivitiesResponse } from '../../../services/dashboardService';
import { SkeletonWrapper } from "react-skeletonify";

interface DailyActivitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DailyActivitiesResponse | null;
    isLoading?: boolean;
}

// SVG Icons
const PhoneIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.71 9.8C2.22 8.66 1.98 7.57 1.98 6.54C1.98 5.84 2.11 5.2 2.36 4.59C2.61 3.99 2.99 3.44 3.53 2.96C3.86 2.66 4.2 2.45 4.56 2.27C4.92 2.1 5.29 2.02 5.65 2.02C5.97 2.02 6.27 2.09 6.54 2.22C6.81 2.35 7.03 2.54 7.21 2.78L9.54 5.89C9.72 6.14 9.85 6.38 9.94 6.6C10.03 6.82 10.08 7.02 10.08 7.21C10.08 7.43 10.01 7.64 9.88 7.85C9.75 8.06 9.58 8.25 9.38 8.44L8.43 9.42C8.31 9.55 8.25 9.69 8.25 9.84C8.25 9.93 8.26 10.01 8.29 10.09C8.32 10.17 8.35 10.25 8.39 10.33C8.75 11.02 9.22 11.72 9.77 12.44C10.33 13.16 10.94 13.88 11.62 14.61C12.3 15.33 12.98 15.98 13.67 16.54C14.36 17.09 15.01 17.51 15.63 17.82C15.72 17.87 15.8 17.91 15.89 17.94C15.97 17.97 16.06 17.98 16.15 17.98C16.3 17.98 16.44 17.92 16.57 17.8C16.57 17.8 17.5 16.91 17.55 16.85C17.74 16.66 17.93 16.48 18.15 16.36C18.36 16.23 18.57 16.16 18.78 16.16C18.98 16.16 19.18 16.21 19.4 16.3C19.62 16.39 19.86 16.53 20.11 16.71L23.22 19.04C23.46 19.22 23.65 19.44 23.78 19.72C23.91 19.99 23.98 20.29 23.98 20.61C23.98 20.91 23.9 21.21 23.75 21.46L21.97 18.33Z" fill="currentColor" />
    </svg>
);

const BellIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11.996 22C10.056 22 8.441 20.627 8.083 18.756H15.91C15.552 20.627 13.936 22 11.996 22ZM19.544 16.183C18.239 15.578 17.478 14.288 17.478 12.872V9.5C17.478 6.467 15.011 4 11.978 4C8.945 4 6.478 6.467 6.478 9.5V12.872C6.478 14.288 5.717 15.578 4.412 16.183C3.597 16.561 3.208 17.514 3.518 18.35C3.766 19.019 4.394 19.475 5.106 19.475H18.85C19.562 19.475 20.19 19.019 20.438 18.35C20.748 17.514 20.359 16.561 19.544 16.183ZM11.978 2.5C12.806 2.5 13.478 1.828 13.478 1C13.478 0.448 13.03 0 12.478 0H11.478C10.926 0 10.478 0.448 10.478 1C10.478 1.828 11.15 2.5 11.978 2.5Z" fill="currentColor" />
    </svg>
);

const StarIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
    </svg>
);

const ConfettiIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Map activity type to the right icon
const getIconForType = (type: string) => {
    switch (type) {
        case 'call':
        case 'call-cancel':
            return PhoneIcon;
        case 'follow-up':
            return BellIcon;
        case 'shortlist':
            return StarIcon;
        case 'hired':
            return ConfettiIcon;
        default:
            return PhoneIcon;
    }
};

const DailyActivitiesModal: React.FC<DailyActivitiesModalProps> = ({ isOpen, onClose, data, isLoading = false }) => {
    if (!isOpen) return null;

    // Loading state
    if (isLoading) {
        return (
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end overflow-y-auto"
                onClick={onClose}
            >
                <div
                    className="bg-white shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <SkeletonWrapper loading={true}>
                        <div>
                            <div className="flex flex-col items-start shrink-0" style={{ padding: '15px 24px', gap: 10, borderBottom: '0.5px solid #AEAEB2' }}>
                                <div className="w-48 h-5 rounded bg-gray-200" />
                                <div className="w-32 h-4 rounded bg-gray-200" />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 rounded-lg h-20" />
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-gray-200" />
                                        <div className="flex-1">
                                            <div className="w-40 h-4 rounded bg-gray-200 mb-1" />
                                            <div className="w-24 h-3 rounded bg-gray-200" />
                                        </div>
                                        <div className="w-16 h-5 rounded-full bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SkeletonWrapper>
                </div>
            </div>
        );
    }

    // Empty state
    if (!data) {
        return (
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end overflow-y-auto"
                onClick={onClose}
            >
                <div
                    className="bg-white shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between" style={{ padding: '15px 24px', borderBottom: '0.5px solid #AEAEB2' }}>
                        <h2 className="font-semibold text-gray-600" style={{ fontSize: 16 }}>No Activities</h2>
                        <button className="bg-transparent border-none p-0 cursor-pointer hover:opacity-60 text-gray-600" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#4B5563" strokeWidth="1" />
                                <path d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-center py-12 text-sm text-[#8E8E93]">
                        No activities found for this date.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex flex-col items-start shrink-0" style={{ padding: '15px 24px', gap: 10, borderBottom: '0.5px solid #AEAEB2' }}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-1">
                            <h2 className="m-0 font-semibold text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                                {data.date_label}
                            </h2>
                            <p className="m-0 font-normal text-gray-600" style={{ fontSize: 14, lineHeight: '17px' }}>
                                {data.total_activities} total activities
                            </p>
                        </div>
                        <button
                            className="bg-transparent border-none p-0 cursor-pointer hover:opacity-60 flex items-center justify-center text-gray-600"
                            onClick={onClose}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#4B5563" strokeWidth="1" />
                                <path d="M8.46 8.46L15.54 15.54M15.54 8.46L8.46 15.54" stroke="#4B5563" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Stats Summary Row ── */}
                <div className="shrink-0 w-full" style={{ padding: '20px 24px', borderBottom: '0.5px solid #AEAEB2' }}>
                    <div className="flex items-center justify-between bg-gray-50" style={{ padding: '20px', borderRadius: 10 }}>
                        <div className="flex flex-col gap-[7px]">
                            <div className="text-[#0F47F2]">{PhoneIcon}</div>
                            <span className="font-medium text-[#8E8E93]" style={{ fontSize: 14, lineHeight: '17px' }}>Calls Made</span>
                            <span className="font-normal text-gray-600" style={{ fontSize: 20, lineHeight: '24px' }}>{data.summary.calls_made}</span>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <div className="text-[#FF8D28]">{BellIcon}</div>
                            <span className="font-medium text-[#8E8E93]" style={{ fontSize: 14, lineHeight: '17px' }}>Follow-ups</span>
                            <span className="font-normal text-gray-600" style={{ fontSize: 20, lineHeight: '24px' }}>{data.summary.follow_ups}</span>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <div className="text-[#059669]">{StarIcon}</div>
                            <span className="font-medium text-[#8E8E93]" style={{ fontSize: 14, lineHeight: '17px' }}>Shortlisted</span>
                            <span className="font-normal text-gray-600" style={{ fontSize: 20, lineHeight: '24px' }}>{data.summary.shortlisted}</span>
                        </div>
                        <div className="flex flex-col gap-[7px]">
                            <div className="text-[#6155F5]">{ConfettiIcon}</div>
                            <span className="font-medium text-[#8E8E93]" style={{ fontSize: 14, lineHeight: '17px' }}>Hired</span>
                            <span className="font-normal text-gray-600" style={{ fontSize: 20, lineHeight: '24px' }}>{data.summary.hired}</span>
                        </div>
                    </div>
                </div>

                {/* ── Actions List ── */}
                <div className="flex-1 overflow-y-auto px-[24px] py-[20px] relative">
                    <h3 className="uppercase font-medium text-gray-600 m-0 mb-[20px]" style={{ fontSize: 14, lineHeight: '17px' }}>
                        Actions on this day
                    </h3>

                    {/* Timeline line */}
                    <div className="absolute w-[5px] bg-[#E5E7EB] rounded-[10px]" style={{ left: 34, top: 60, bottom: 20, zIndex: 0 }}></div>

                    {data.activities.length > 0 ? (
                        <div className="flex flex-col gap-[20px] relative z-10">
                            {data.activities.map((act) => (
                                <div key={act.id} className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-[12px]">
                                        <div
                                            className="flex items-center justify-center shrink-0"
                                            style={{
                                                width: 24, height: 24,
                                                background: act.category_bg,
                                                color: act.category_color,
                                                borderRadius: 5
                                            }}
                                        >
                                            <div style={{ width: 14, height: 14 }}>
                                                {getIconForType(act.type)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-[2px]">
                                            <span className="font-normal" style={{ fontSize: 14, lineHeight: '17px', color: act.type === 'hired' ? act.category_color : '#111827' }}>
                                                {act.title}
                                            </span>
                                            <span className="font-normal" style={{ fontSize: 12, lineHeight: '14px', color: '#AEAEB2' }}>
                                                {act.time}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="px-[8px] py-[4px] lowercase first-letter:uppercase whitespace-nowrap"
                                        style={{
                                            background: act.pill_bg,
                                            color: act.pill_color,
                                            fontSize: 10,
                                            lineHeight: '12px',
                                            borderRadius: 34
                                        }}
                                    >
                                        {act.pill_text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-sm text-[#8E8E93]">
                            No activities recorded.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyActivitiesModal;
