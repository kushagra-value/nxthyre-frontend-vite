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

    // Circular progress ring
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (candidate.matchPercentage / 100) * circumference;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
            {/* Modal Container — 553px wide, 10px radius, scrollable */}
            <div
                className="bg-white flex flex-col overflow-hidden"
                style={{ width: 553, maxHeight: 727, borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
            >

                {/* ── Header — 65px, border-bottom #AEAEB2 ── */}
                <div
                    className="flex items-center justify-between shrink-0"
                    style={{ height: 65, padding: '0 24px', borderBottom: '0.5px solid #AEAEB2' }}
                >
                    {/* Status badge */}
                    <span
                        className="inline-flex items-center"
                        style={{ padding: '4px 8px', borderRadius: 4, background: '#E7EDFF', color: '#0088FF', fontSize: 14, lineHeight: '17px', fontWeight: 400 }}
                    >
                        {candidate.status}
                    </span>

                    <div className="flex items-center" style={{ gap: 20 }}>
                        {/* Pagination */}
                        <div className="flex items-center" style={{ gap: 8 }}>
                            <button
                                className="flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                                style={{ width: 30, height: 30, background: '#FFFFFF', border: '0.5px solid #D1D1D6', borderRadius: 7 }}
                                onClick={goPrev}
                                disabled={currentIndex === 0}
                            >
                                <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.27539 5.57812L0 3.09375V2.48438L3.27539 0V0.925781L0.802734 2.79492L3.27539 4.64648V5.57812ZM6.46875 5.57812L3.18164 3.09375V2.48438L6.46875 0V0.925781L3.98438 2.79492L6.46875 4.64648V5.57812Z" fill="#4B5563" />
                                </svg>
                            </button>
                            <span style={{ fontSize: 12, lineHeight: '14px', fontWeight: 400, color: '#4B5563', minWidth: 22, textAlign: 'center' }}>
                                {currentIndex + 1}/{total}
                            </span>
                            <button
                                className="flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                                style={{ width: 30, height: 30, background: '#FFFFFF', border: '0.5px solid #D1D1D6', borderRadius: 7 }}
                                onClick={goNext}
                                disabled={currentIndex === total - 1}
                            >
                                <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.19336 5.57812L6.46875 3.09375V2.48438L3.19336 0V0.925781L5.66602 2.79492L3.19336 4.64648V5.57812ZM0 5.57812L3.28711 3.09375V2.48438L0 0V0.925781L2.48438 2.79492L0 4.64648V5.57812Z" fill="#4B5563" />
                                </svg>
                            </button>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center hover:opacity-70 transition-opacity"
                            style={{ width: 24, height: 24 }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5354 15.5355L8.46436 8.46448M15.5354 8.46448L8.46436 15.5355" stroke="#4B5563" strokeLinecap="square" />
                                <path d="M4.92893 19.0711C1.02369 15.1658 1.02369 8.83417 4.92893 4.92893C8.83417 1.02369 15.1658 1.02369 19.0711 4.92893C22.9763 8.83417 22.9763 15.1658 19.0711 19.0711C15.1658 22.9763 8.83417 22.9763 4.92893 19.0711Z" stroke="#4B5563" strokeLinecap="square" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Content ── */}
                <div className="flex-1 overflow-y-auto" style={{ padding: '20px 24px 0 24px' }}>

                    {/* Candidate Name + Role + Match % — inside bordered section */}
                    <div
                        className="flex items-start justify-between"
                        style={{ paddingBottom: 20 }}
                    >
                        <div style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: 20, lineHeight: '24px', fontWeight: 500, color: '#000000', margin: 0 }}>
                                {candidate.name}
                            </h2>
                            <p style={{ fontSize: 12, lineHeight: '14px', fontWeight: 400, color: '#0F47F2', margin: 0 }}>
                                {candidate.role} · {candidate.company}
                            </p>
                        </div>

                        {/* Circular Match Percentage — 48×48 */}
                        <div className="flex-shrink-0 relative" style={{ width: 48, height: 48 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                                <circle
                                    cx="24" cy="24" r={radius}
                                    stroke="rgba(116,116,128,0.08)"
                                    strokeWidth="3"
                                    fill="none"
                                />
                                <circle
                                    cx="24" cy="24" r={radius}
                                    stroke="#00C8B3"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progressOffset}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <span
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#4B5563' }}
                            >
                                {candidate.matchPercentage}%
                            </span>
                        </div>
                    </div>

                    {/* Key Stats — Row 1 */}
                    <div className="flex justify-between" style={{ marginBottom: 20, gap: 67 }}>
                        {[
                            { label: 'Experience', value: candidate.experience },
                            { label: 'Current CTC', value: candidate.currentCTC },
                            { label: 'Expected', value: candidate.expectedCTC },
                        ].map((stat) => (
                            <div key={stat.label} style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <p style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#8E8E93', margin: 0 }}>
                                    {stat.label}
                                </p>
                                <p style={{ fontSize: 16, lineHeight: '19px', fontWeight: 500, color: '#4B5563', margin: 0 }}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Key Stats — Row 2 */}
                    <div
                        className="flex justify-between"
                        style={{ paddingBottom: 20, gap: 67, borderBottom: '0.5px solid #AEAEB2' }}
                    >
                        {[
                            { label: 'Notice Period', value: candidate.noticePeriod },
                            { label: 'Location', value: candidate.location },
                            { label: 'Source', value: candidate.source },
                        ].map((stat) => (
                            <div key={stat.label} style={{ width: 120, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <p style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#8E8E93', margin: 0 }}>
                                    {stat.label}
                                </p>
                                <p style={{ fontSize: 16, lineHeight: '19px', fontWeight: 500, color: '#4B5563', margin: 0 }}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Fit Summary */}
                    <div style={{ marginTop: 20, marginBottom: 20 }}>
                        <h4 style={{ fontSize: 14, lineHeight: '17px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                            QUICK FIT SUMMARY
                        </h4>
                        <div className="flex flex-wrap" style={{ gap: 10 }}>
                            {candidate.quickFitSkills.map((skill) => (
                                <span
                                    key={skill.name}
                                    className="inline-flex items-center"
                                    style={{
                                        padding: '10px 12px',
                                        gap: skill.match ? 2 : 3,
                                        background: '#F5F9FB',
                                        borderRadius: 20,
                                        fontSize: 14,
                                        lineHeight: '17px',
                                        fontWeight: 400,
                                        color: skill.match ? '#009951' : '#CF272D',
                                    }}
                                >
                                    {skill.name}
                                    {skill.match ? (
                                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <rect width="17" height="17" rx="8.5" fill="transparent" />
                                            <circle cx="8.5" cy="8.5" r="7" stroke="#009951" strokeWidth="1.5" />
                                            <path d="M5.5 8.5L7.5 10.5L11.5 6.5" stroke="#009951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <rect width="17" height="17" rx="8.5" fill="transparent" />
                                            <circle cx="8.5" cy="8.5" r="7" stroke="#CF272D" strokeWidth="1.5" />
                                            <path d="M6 6L11 11M11 6L6 11" stroke="#CF272D" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* AI Summary */}
                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ fontSize: 14, lineHeight: '17px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                            AI SUMMARY
                        </h4>
                        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '8px 0 6px 8px' }}>
                            <p style={{ fontSize: 14, lineHeight: '25px', fontWeight: 400, color: '#8E8E93', margin: 0 }}>
                                {candidate.aiSummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div
                    className="flex items-center justify-between shrink-0"
                    style={{ padding: '0 24px', height: 65, borderTop: '0.5px solid #AEAEB2' }}
                >
                    {/* Skip */}
                    <button
                        className="inline-flex items-center hover:opacity-80 transition-opacity"
                        style={{ padding: 10, gap: 5, background: '#FFFFFF', border: '0.5px solid #FF383C', borderRadius: 5 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.11328 2.66671C6.38783 1.88991 7.12868 1.33337 7.99948 1.33337C8.87028 1.33337 9.61115 1.88991 9.88568 2.66671" stroke="#FF383C" strokeLinecap="round" />
                            <path d="M13.6674 4H2.33398" stroke="#FF383C" strokeLinecap="round" />
                            <path d="M12.5545 5.66663L12.2478 10.266C12.1298 12.036 12.0708 12.921 11.4942 13.4604C10.9175 14 10.0306 14 8.25669 14H7.74116C5.96726 14 5.08033 14 4.50365 13.4604C3.92699 12.921 3.86799 12.036 3.74999 10.266L3.44336 5.66663" stroke="#FF383C" strokeLinecap="round" />
                            <path d="M6.33398 7.33337L6.66732 10.6667" stroke="#FF383C" strokeLinecap="round" />
                            <path d="M9.66732 7.33337L9.33398 10.6667" stroke="#FF383C" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#FF383C' }}>Skip</span>
                    </button>

                    {/* Right group */}
                    <div className="flex items-center" style={{ gap: 10 }}>
                        {/* View Profile */}
                        <button
                            className="inline-flex items-center hover:opacity-80 transition-opacity"
                            style={{ padding: 10, gap: 5, border: '0.5px solid #9CA3AF', borderRadius: 5 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.07992 8.52C8.03325 8.51333 7.97325 8.51333 7.91992 8.52C6.74659 8.48 5.81323 7.52 5.81323 6.33999C5.81323 5.13332 6.78659 4.15332 7.99992 4.15332C9.20659 4.15332 10.1866 5.13332 10.1866 6.33999C10.1799 7.52 9.25325 8.48 8.07992 8.52Z" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12.4933 12.92C11.3066 14.0067 9.73325 14.6667 7.99992 14.6667C6.26659 14.6667 4.69326 14.0067 3.50659 12.92C3.57326 12.2934 3.97326 11.68 4.68659 11.2C6.51326 9.98671 9.49992 9.98671 11.3133 11.2C12.0266 11.68 12.4266 12.2934 12.4933 12.92Z" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8.00004C14.6666 4.31814 11.6818 1.33337 7.99992 1.33337C4.31802 1.33337 1.33325 4.31814 1.33325 8.00004C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z" stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#9CA3AF' }}>View Profile</span>
                        </button>

                        {/* Call */}
                        <button
                            className="inline-flex items-center hover:opacity-80 transition-opacity"
                            style={{ padding: 10, gap: 5, border: '0.5px solid #0F47F2', borderRadius: 5 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.33398 1.33337C9.33398 1.33337 10.8007 1.46671 12.6673 3.33337C14.534 5.20004 14.6673 6.66671 14.6673 6.66671" stroke="#0F47F2" strokeLinecap="round" />
                                <path d="M9.4707 3.69043C9.4707 3.69043 10.1307 3.879 11.1206 4.86894C12.1106 5.8589 12.2992 6.51886 12.2992 6.51886" stroke="#0F47F2" strokeLinecap="round" />
                                <path d="M6.69108 3.54407L7.12375 4.31936C7.51422 5.01901 7.35748 5.93684 6.74248 6.55183C6.74248 6.55183 5.9966 7.29783 7.34902 8.65029C8.70102 10.0023 9.44748 9.25683 9.44748 9.25683C10.0625 8.64183 10.9803 8.48509 11.68 8.87556L12.4552 9.30823C13.5117 9.89783 13.6365 11.3794 12.7079 12.3081C12.1499 12.8661 11.4663 13.3003 10.7106 13.3289C9.43855 13.3772 7.27822 13.0552 5.11115 10.8882C2.9441 8.72109 2.62216 6.56077 2.67038 5.28869C2.69903 4.53303 3.13322 3.84945 3.69122 3.29145C4.61986 2.36281 6.10146 2.48759 6.69108 3.54407Z" stroke="#0F47F2" strokeLinecap="round" />
                            </svg>
                            <span style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#0F47F2' }}>Call</span>
                        </button>

                        {/* Move to Screening */}
                        <button
                            className="inline-flex items-center hover:opacity-90 transition-opacity"
                            style={{ padding: 10, gap: 5, background: '#0F47F2', border: '0.5px solid #0F47F2', borderRadius: 5 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.66602 8H13.3327M13.3327 8L9.33268 4M13.3327 8L9.33268 12" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontSize: 14, lineHeight: '17px', fontWeight: 400, color: '#FFFFFF' }}>Move to Screening</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewModal;