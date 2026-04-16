import React, { useState } from 'react';
import { NewMatchCandidate } from '../dashboardData';
import { naukbotService } from '../../../services/naukbotService';
import NViteModal from '../../companies/components/NViteModal';
import toast from 'react-hot-toast';

interface NewMatchCandidateModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    candidates: NewMatchCandidate[];
    candidateData?: any; // Full candidate details from /jobs/applications/{id}/
    isLoading?: boolean;
    currentIndex: number;
    onNavigate: (newIndex: number) => void;
    /** Called after a candidate is skipped so parent can refresh */
    onSkipped?: () => void;
}

// quick_fit_summary item shape from the API
interface QuickFitItem {
    badge: string;
    color: 'green' | 'yellow' | 'red';
    status: string;
    evidence: string;
    priority: string;
}

const NewMatchCandidateModal: React.FC<NewMatchCandidateModalProps> = ({
    isOpen = true,
    onClose = () => { },
    candidates = [],
    candidateData,
    isLoading = false,
    currentIndex,
    onNavigate,
    onSkipped,
}) => {
    const [isSkipping, setIsSkipping] = useState(false);
    const [nviteModal, setNviteModal] = useState(false);

    if (!isOpen || candidates.length === 0) return null;

    const goNext = () => onNavigate(Math.min(currentIndex + 1, candidates.length - 1));
    const goPrev = () => onNavigate(Math.max(currentIndex - 1, 0));

    // ── Extract data from API response ──
    const candidate = candidateData?.candidate;
    const contextual = candidateData?.contextual_details;
    const jobScoreObj = contextual?.job_score_obj;
    const candidateMatchScore = jobScoreObj?.candidate_match_score;

    // FALLBACKS from the 'candidates' array prop if API data is loading or missing
    const currentItem = candidates[currentIndex];

    // NBC id for skip & nvite (populated when source=naukri_bot)
    const nbcId = currentItem?.nbcId;
    const isNaukriBot = !!nbcId;

    const candidateName = candidate?.full_name || currentItem?.name || 'Loading...';

    // ── Subtitle: role · company ──
    const role = currentItem?.role || '';
    const company = currentItem?.company || '';

    // ── Match percentage — parse from candidate_match_score.score (e.g. "65%") ──
    let matchPercentage = currentItem?.matchPercentage || 0;
    if (candidateMatchScore?.score) {
        const parsed = parseInt(String(candidateMatchScore.score).replace('%', ''), 10);
        if (!isNaN(parsed)) matchPercentage = parsed;
    }

    // ── Experience ──
    const experience = candidate?.total_experience != null
        ? `${candidate.total_experience} yrs`
        : (currentItem?.experience || 'N/A');

    // ── Current CTC ──
    const currentCTC = candidate?.current_salary
        || candidate?.premium_data?.current_ctc
        || currentItem?.currentCTC
        || 'N/A';

    // ── Expected CTC ──
    const expectedCTC = candidate?.expected_ctc
        || candidate?.premium_data?.expected_ctc
        || currentItem?.expectedCTC
        || 'N/A';

    // ── Notice Period ──
    const noticePeriodDays = candidate?.notice_period_days;
    const noticePeriod = noticePeriodDays != null
        ? (noticePeriodDays === 0 ? 'Immediate' : `${noticePeriodDays} Days`)
        : (candidate?.notice_period_summary || currentItem?.noticePeriod || 'N/A');

    // ── Location ──
    const location = candidate?.location || currentItem?.location || 'N/A';

    // ── Source ──
    const source = candidate?.application_type
        ? candidate.application_type.charAt(0).toUpperCase() + candidate.application_type.slice(1)
        : (currentItem?.source || 'N/A');

    // ── Quick Fit Summary ──
    const quickFitSummary: QuickFitItem[] = jobScoreObj?.quick_fit_summary || [];

    // ── AI Summary ──
    const aiSummary = candidateMatchScore?.description
        || contextual?.ai_summary
        || jobScoreObj?.recommended_message
        || candidate?.profile_summary
        || currentItem?.aiSummary
        || 'No AI summary available.';

    // match label
    const matchLabel = candidateMatchScore?.label || '';

    // ── Build manual call data ──
    const callCandidateData = currentItem ? {
        id: candidate?.id || currentItem.id || '',
        name: candidateName,
        avatarInitials: candidateName
            .split(' ')
            .slice(0, 2)
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
        headline: candidate?.headline || currentItem.role || '',
        phone: candidate?.phone || candidate?.premium_data?.phone || '',
        experience,
        expectedCtc: expectedCTC,
        location,
        noticePeriod,
    } : null;

    // SVG arc for the match percentage ring
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

    const getBadgeStyle = (color: string): { textColor: string; iconType: 'check' | 'warn' | 'cross' } => {
        switch (color) {
            case 'green': return { textColor: '#009951', iconType: 'check' };
            case 'yellow': return { textColor: '#CC8800', iconType: 'warn' };
            case 'red': return { textColor: '#CF272D', iconType: 'cross' };
            default: return { textColor: '#8E8E93', iconType: 'check' };
        }
    };

    // ── Skip handler ──
    const handleSkip = async () => {
        if (!nbcId) {
            toast.error('Skip is only available for Naukri Bot candidates');
            return;
        }
        setIsSkipping(true);
        try {
            await naukbotService.skipCandidates([nbcId]);
            toast.success('Candidate skipped');
            onSkipped?.();
            // Move to next if possible, otherwise close
            if (currentIndex < candidates.length - 1) {
                onNavigate(currentIndex + 1);
            } else {
                onClose();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to skip candidate');
        } finally {
            setIsSkipping(false);
        }
    };

    return (
        <>
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
                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>
                            New Talent Matches
                        </span>

                        <div className="flex items-center gap-5">
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
                                    {currentIndex + 1}/{candidates.length}
                                </span>
                                <button
                                    className="flex items-center justify-center bg-white p-0 cursor-pointer hover:bg-gray-100 disabled:opacity-35 disabled:cursor-not-allowed"
                                    style={{ width: 30, height: 30, border: '0.5px solid #D1D1D6', borderRadius: 7 }}
                                    onClick={goNext}
                                    disabled={currentIndex === candidates.length - 1}
                                >
                                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                                        <path d="M1 1L5 5L1 9" stroke="#4B5563" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>

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
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-6 animate-pulse">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-3">
                                    <div className="h-6 w-48 bg-gray-200 rounded" />
                                    <div className="h-4 w-64 bg-gray-100 rounded" />
                                </div>
                                <div className="h-12 w-12 rounded-full bg-gray-100" />
                            </div>
                            <div className="grid grid-cols-3 gap-8 mb-8 pb-8 border-b border-[#AEAEB2]">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-100 rounded" />
                                        <div className="h-4 w-24 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-32 bg-gray-100 rounded" />
                                <div className="flex gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-8 w-20 bg-gray-100 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ─── Candidate Info ─── */}
                            <div className="w-full" style={{ borderBottom: '0.5px solid #AEAEB2', padding: '20px 24px' }}>
                                <div className="flex items-center justify-between" style={{ marginBottom: 30 }}>
                                    <div className="flex flex-col" style={{ gap: 10 }}>
                                        <h3 className="m-0 font-medium text-black" style={{ fontSize: 20, lineHeight: '24px' }}>
                                            {candidateName}
                                        </h3>
                                        <p className="m-0 text-xs font-normal" style={{ color: '#0F47F2', lineHeight: '14px' }}>
                                            {role} · {company}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center relative" style={{ width: 48, height: 48 }}>
                                        <svg width="48" height="48" viewBox="0 0 48 48">
                                            <circle cx="24" cy="24" r={radius} fill="none" stroke="rgba(116,116,128,0.08)" strokeWidth="4" />
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
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-sm font-normal text-gray-600">
                                            {matchPercentage}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between" style={{ gap: 67, marginBottom: 20 }}>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Experience</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{experience}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Current CTC</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{currentCTC}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Expected</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{expectedCTC}</span>
                                    </div>
                                </div>
                                <div className="flex items-start justify-between" style={{ gap: 67 }}>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Notice Period</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{noticePeriod}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Location</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{location}</span>
                                    </div>
                                    <div className="flex flex-col" style={{ gap: 5, minWidth: 120 }}>
                                        <span className="text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '17px' }}>Source</span>
                                        <span className="font-medium text-gray-600" style={{ fontSize: 16, lineHeight: '19px' }}>{source}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Summaries ─── */}
                            <div className="w-full" style={{ padding: '20px 24px' }}>
                                {quickFitSummary.length > 0 && (
                                    <>
                                        <h4 className="m-0 font-medium text-sm uppercase text-gray-600" style={{ lineHeight: '17px', marginBottom: 20 }}>
                                            Quick Fit Summary
                                        </h4>
                                        <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 30 }}>
                                            {quickFitSummary.map((item, idx) => {
                                                const badgeStyle = getBadgeStyle(item.color);
                                                return (
                                                    <span
                                                        key={`${item.badge}-${idx}`}
                                                        className="inline-flex items-center text-sm font-normal"
                                                        style={{
                                                            padding: '10px 12px',
                                                            background: '#F5F9FB',
                                                            borderRadius: 20,
                                                            gap: 5,
                                                            color: badgeStyle.textColor,
                                                            lineHeight: '17px',
                                                        }}
                                                    >
                                                        {item.badge}
                                                        {badgeStyle.iconType === 'check' && (
                                                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                <circle cx="8.5" cy="8.5" r="8" stroke={badgeStyle.textColor} strokeWidth="1" />
                                                                <path d="M5 8.5L7.5 11L12 6" stroke={badgeStyle.textColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                        {badgeStyle.iconType === 'warn' && (
                                                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                <circle cx="8.5" cy="8.5" r="8" stroke={badgeStyle.textColor} strokeWidth="1" />
                                                                <path d="M8.5 5.5V9.5" stroke={badgeStyle.textColor} strokeWidth="1.2" strokeLinecap="round" />
                                                                <circle cx="8.5" cy="11.5" r="0.75" fill={badgeStyle.textColor} />
                                                            </svg>
                                                        )}
                                                        {badgeStyle.iconType === 'cross' && (
                                                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                                <circle cx="8.5" cy="8.5" r="8" stroke={badgeStyle.textColor} strokeWidth="1" />
                                                                <path d="M6 6L11 11M11 6L6 11" stroke={badgeStyle.textColor} strokeWidth="1.2" strokeLinecap="round" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                <h4 className="m-0 font-medium text-sm uppercase text-gray-600" style={{ lineHeight: '17px', marginBottom: 10 }}>
                                    AI Summary
                                    {matchLabel && <span className="ml-2 lowercase font-normal text-gray-400">({matchLabel})</span>}
                                </h4>
                                <div className="bg-gray-50" style={{ borderRadius: 10, padding: '12px' }}>
                                    <p className="m-0 text-sm font-normal" style={{ color: '#8E8E93', lineHeight: '25px' }}>
                                        {aiSummary}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ─── Footer Actions ─── */}
                <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px', borderTop: '0.5px solid #AEAEB2' }}>
                    {/* Skip button — only active for Naukri Bot candidates */}
                    <button
                        className="flex items-center justify-center cursor-pointer bg-white text-sm font-normal transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            height: 37,
                            border: `0.5px solid ${isNaukriBot ? '#FF383C' : '#D1D1D6'}`,
                            borderRadius: 5,
                            padding: 10,
                            gap: 5,
                            color: isNaukriBot ? '#FF383C' : '#9CA3AF',
                        }}
                        onClick={handleSkip}
                        disabled={!isNaukriBot || isSkipping}
                        title={isNaukriBot ? 'Skip this candidate' : 'Skip is only available for Naukri Bot candidates'}
                    >
                        {isSkipping ? (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9.17 4H14.83L15.5 2H8.5L9.17 4Z" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M3.5 6H20.5" stroke="currentColor" strokeLinecap="round" />
                                <path d="M5.5 6V19C5.5 20.1 6.4 21 7.5 21H16.5C17.6 21 18.5 20.1 18.5 19V6" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                        )}
                        {isSkipping ? 'Skipping…' : 'Skip'}
                    </button>

                    <div className="flex items-center" style={{ gap: 10 }}>
                        <button
                            className="flex items-center justify-center cursor-pointer bg-transparent text-sm font-normal hover:bg-gray-50 transition-colors"
                            style={{ height: 37, border: '0.5px solid #9CA3AF', borderRadius: 5, padding: 10, gap: 5, color: '#9CA3AF' }}
                            onClick={() => {
                                const candId = candidate?.id || currentItem?.id;
                                const jobIdParam = currentItem?.jobId;
                                if (candId) {
                                    const url = jobIdParam
                                        ? `/candidate-profiles/${candId}?job_id=${jobIdParam}`
                                        : `/candidate-profiles/${candId}`;
                                    window.open(url, '_blank');
                                }
                            }}
                        >
                            View Profile
                        </button>

                        <button
                            className="flex items-center justify-center cursor-pointer bg-transparent text-sm font-normal hover:bg-blue-50 transition-colors"
                            style={{ height: 37, border: '0.5px solid #0F47F2', borderRadius: 5, padding: 10, gap: 5, color: '#0F47F2' }}
                            onClick={() => {
                                if (callCandidateData) {
                                    sessionStorage.setItem("_nxthyre_call_state", JSON.stringify({ candidate: callCandidateData }));
                                    window.location.href = `/call/${callCandidateData.id}/${currentItem?.jobId || 0}?mode=manual`;
                                }
                            }}
                        >
                            Call
                        </button>

                        {/* Send Nvites — only for Naukri Bot candidates */}
                        <button
                            className="flex items-center justify-center cursor-pointer text-sm font-normal transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                height: 37,
                                background: isNaukriBot ? '#0F47F2' : '#9CA3AF',
                                border: `1px solid ${isNaukriBot ? '#0F47F2' : '#9CA3AF'}`,
                                borderRadius: 5,
                                padding: '0 15px',
                                color: 'white',
                            }}
                            onClick={() => {
                                if (isNaukriBot) setNviteModal(true);
                                else toast('NVite is only available for Naukri Bot candidates', { icon: 'ℹ️' });
                            }}
                            title={isNaukriBot ? 'Send NVite to this candidate' : 'NVite is only available for Naukri Bot candidates'}
                        >
                            Send NVite
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* NVite Modal — rendered outside the main modal to avoid stacking issues */}
        {nviteModal && nbcId && (
            <NViteModal
                candidateIds={[nbcId]}
                nxthyreJobId={currentItem?.jobId}
                jobTitle={currentItem?.role}
                onClose={() => setNviteModal(false)}
                onSuccess={() => {
                    // The NViteModal shows results inline; parent list will refresh on close
                    onSkipped?.();
                }}
            />
        )}
        </>
    );
};

export default NewMatchCandidateModal;
