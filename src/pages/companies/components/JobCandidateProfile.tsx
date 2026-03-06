import { useState, useEffect } from "react";
import {
    Mail, Download, Check, FileText, MapPin, Clock, Briefcase,
    ExternalLink, Phone, ArrowLeft, Calendar, Linkedin
} from "lucide-react";
import candidateService from "../../../services/candidateService";

// ─── Interfaces ────────────────────────────────────────────

interface Activity {
    type: string;
    date: string;
    time?: string;
    description: string;
    actor?: string;
    data: any;
}

interface JobCandidateProfileProps {
    candidate: any;       // Raw API response from /jobs/applications/{id}/
    jobId: number | null;
    goBack: () => void;
    loading?: boolean;
    onNavigatePrev?: () => void;
    onNavigateNext?: () => void;
    currentIndex?: number;
    totalCandidates?: number;
}

// ─── Helpers ───────────────────────────────────────────────

const formatExpDuration = (startDate?: string, endDate?: string, isCurrent?: boolean): string => {
    const start = startDate ? new Date(startDate) : null;
    const end = isCurrent ? new Date() : endDate ? new Date(endDate) : null;
    if (!start) return "";
    const startYear = start.getFullYear();
    const endYear = end ? end.getFullYear() : "Present";
    const diffYears = end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365))) : 0;
    return `${startYear} — ${endYear}${diffYears ? ` · ${diffYears} yr${diffYears > 1 ? "s" : ""}` : ""}`;
};

// ─── Component ─────────────────────────────────────────────

export default function JobCandidateProfile({
    candidate,
    goBack,
    loading,
    onNavigatePrev,
    onNavigateNext,
    currentIndex,
    totalCandidates
}: JobCandidateProfileProps) {
    // Extract data from the raw API response
    const cand = candidate?.candidate || {};
    const contextualDetails = candidate?.contextual_details || {};
    const jobScoreObj = contextualDetails?.job_score_obj || {};
    const matchScore = jobScoreObj?.candidate_match_score || {};
    const quickFitSummary = jobScoreObj?.quick_fit_summary || [];
    const statusTags = candidate?.status_tags || [];
    const applicationId = candidate?.id;

    // Candidate data
    const fullName = cand.full_name || "--";
    const headline = cand.headline || "";
    const location = cand.location || "";
    const profileSummary = cand.profile_summary || "";
    const experience = cand.experience || [];
    const education = cand.education || [];
    const skills = cand.skills_list || [];
    const socialLinks = cand.social_links || {};
    const premiumData = cand.premium_data || {};
    const premiumUnlocked = cand.premium_data_unlocked || false;
    const noticePeriod = cand.notice_period_summary || (cand.notice_period_days ? `${cand.notice_period_days} Days` : "--");
    const totalExp = cand.total_experience != null ? `${cand.total_experience} years` : cand.experience_years || "--";
    const currentSalary = cand.current_salary_lpa || "--";

    // AI Interview Report
    const aiReport = cand.ai_interview_report || contextualDetails?.ai_interview_report || {};
    const aiScores = aiReport?.score || {};
    const aiSummary = aiReport?.feedbacks?.overallFeedback || "";

    // States
    const [activeTab, setActiveTab] = useState<"info" | "activity" | "notes">("info");
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    // ── Fetch Activity ───────────────────────────────────────

    useEffect(() => {
        if (!cand.id || !applicationId) return;
        setLoadingActivities(true);
        candidateService
            .getCandidateActivity(cand.id, applicationId)
            .then((data) => {
                const mapped: Activity[] = data.map((item: any) => {
                    const ts = new Date(item.timestamp);
                    const d = item.data || {};
                    let description = "";
                    let actor = "System";

                    if (item.type === "stage_move") {
                        actor = d.moved_by_name || d.external_mover_email || "System";
                        description = `Moved from ${d.from_stage_name} to ${d.to_stage_name}`;
                    } else if (item.type === "communication_sent") {
                        description = `Message sent via ${d.mode || "email"}`;
                        actor = cand.full_name;
                    } else if (item.type === "recruiter_message_sent") {
                        actor = d.sent_by_name || "Recruiter";
                        description = d.body?.trim() || "Message sent";
                    } else {
                        description = d.body?.trim() || d.subject?.trim() || "Activity recorded";
                    }

                    if (!actor || actor === "undefined") actor = "System";

                    return {
                        type: item.type,
                        date: ts.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        time: ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                        description,
                        actor,
                        data: d,
                    };
                });
                setActivities(mapped);
            })
            .catch((err) => {
                console.error("Error fetching activity:", err);
                setActivities([]);
            })
            .finally(() => setLoadingActivities(false));
    }, [cand.id, applicationId, cand.full_name]);

    // ── Score bar color helper ───────────────────────────────

    const getScoreColor = (score: number): string => {
        if (score >= 80 || score >= 8) return "#10B981";
        if (score >= 40 || score >= 4) return "#F59E0B";
        return "#EF4444";
    };

    const getScoreWidth = (score: number): string => {
        if (score <= 10) return `${score * 10}%`;
        return `${score}%`;
    }

    // ── Copy helper ──────────────────────────────────────────



    // ── Loading State ────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F47F2] mx-auto mb-4" />
                    <p className="text-sm text-[#8E8E93]">Loading candidate profile...</p>
                </div>
            </div>
        );
    }

    // ── Score entries for AI breakdown ───────────────────────

    const scoreEntries = [
        { label: "Resume", score: Number(aiScores.resume) || 0 },
        { label: "Knowledge", score: Number(aiScores.knowledge) || 0 },
        { label: "Technical", score: typeof aiScores.technical === "number" ? aiScores.technical : 0 },
        { label: "Communication", score: Number(aiScores.communication) || 0 },
    ].filter((e) => e.score > 0);

    // ── Job title for display ────────────────────────────────

    const jobTitle = candidate?.job?.title || contextualDetails?.job_title || "";

    return (
        <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex flex-col xl:flex-row p-6 gap-6">
            {/* ═══════════════════════════════════════════════════
          Left Column: Candidate Main Info
         ═══════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col gap-6">
                {/* ── Main Candidate Card ── */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <button onClick={goBack} className="text-[#8E8E93] hover:text-black transition-colors rounded-full p-1 hover:bg-[#F3F5F7]">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h1 className="text-2xl font-semibold text-black">
                                        {fullName}
                                    </h1>
                                </div>
                                <div className="ml-10">
                                    <p className="text-sm text-[#0F47F2] mb-4">
                                        {headline || jobTitle} {headline && jobTitle ? ` • ${jobTitle}` : ""}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-[#4B5563] mb-6 font-medium">
                                        <span className="flex items-center gap-1.5 ">
                                            <Briefcase className="w-4 h-4 text-[#8E8E93]" /> {totalExp}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-[#8E8E93]" /> {location || "--"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8E8E93]">
                                                <path d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2.66663 6.66667H13.3333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {currentSalary} LPA
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8E8E93]">
                                                <path d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {cand.expected_ctc || "--"} LPA
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-[#8E8E93]" /> {noticePeriod}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {(premiumUnlocked && premiumData.email) && (
                                            <button
                                                onClick={() => window.open(`mailto:${premiumData.email}`)}
                                                className="flex items-center gap-2 bg-[#0F47F2] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                            >
                                                <Mail className="w-4 h-4" /> Send Mail
                                            </button>
                                        )}
                                        <button className="flex items-center gap-2 bg-white border border-[#0F47F2] text-[#0F47F2] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#F3F5F7] transition">
                                            <Phone className="w-4 h-4" /> Call
                                        </button>
                                        {cand.resume_url && (
                                            <button
                                                onClick={() => window.open(cand.resume_url, "_blank")}
                                                className="flex items-center gap-2 bg-[#E7EDFF] text-[#0F47F2] w-10 h-10 justify-center rounded-lg text-sm font-medium hover:bg-[#D4E0FF] transition"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-start min-w-[160px]">
                                <div className="flex items-center gap-2 mb-6 self-end w-full justify-end">
                                    {(currentIndex !== undefined && totalCandidates !== undefined) && (
                                        <span className="text-[10px] text-[#AEAEB2] font-bold mr-1">
                                            {currentIndex + 1} / {totalCandidates}
                                        </span>
                                    )}
                                    <button
                                        onClick={onNavigatePrev}
                                        disabled={!onNavigatePrev}
                                        className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigatePrev ? 'text-black hover:bg-gray-50' : 'text-[#AEAEB2] cursor-not-allowed opacity-50'}`}
                                    >
                                        &laquo; Prev
                                    </button>
                                    <button
                                        onClick={onNavigateNext}
                                        disabled={!onNavigateNext}
                                        className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigateNext ? 'text-black hover:bg-gray-50' : 'text-[#AEAEB2] cursor-not-allowed opacity-50'}`}
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                                <div className="relative w-20 h-20 mb-2">
                                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                                        <path
                                            className="text-gray-200"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                        />
                                        <path
                                            style={{ color: getScoreColor(typeof matchScore.score === 'string' ? Number(matchScore.score.replace('%', '')) : Number(matchScore.score) || 0) }}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                            strokeDasharray={`${(typeof matchScore.score === 'string' ? Number(matchScore.score.replace('%', '')) : Number(matchScore.score) || 0)}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-semibold -mt-1">{matchScore.score || "0%"}</span>
                                    </div>
                                </div>
                                <span className="text-[11px] text-[#8E8E93] text-center uppercase tracking-wider font-semibold">Match Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Status tags row */}
                    {statusTags.length > 0 && (
                        <div className="bg-[#F8FAFC] px-6 py-3 text-xs font-semibold border-t border-[#E5E7EB] flex gap-2 flex-wrap">
                            {statusTags.map((tag: any, i: number) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full text-xs"
                                    style={{
                                        backgroundColor: tag.color === "green" ? "#DEF7EC" : tag.color === "red" ? "#FEE9E7" : tag.color === "yellow" ? "#FFF7D6" : "#E7EDFF",
                                        color: tag.color === "green" ? "#059669" : tag.color === "red" ? "#DC2626" : tag.color === "yellow" ? "#92400E" : "#0F47F2",
                                    }}
                                >
                                    {tag.text}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Current Stage Pipeline Section ── */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h3 className="text-xs font-medium text-[#4B5563] mb-8">
                        CURRENT STAGE <span className="text-[#0F47F2] ml-2 font-bold uppercase">{candidate.current_stage?.name || "--"}</span>
                    </h3>

                    <div className="flex items-center justify-between mb-8 relative">
                        {/* This would be the pipeline UI from Figma */}
                        <div className="w-full flex items-center gap-0 overflow-x-auto no-scrollbar py-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((step, i) => {
                                const isCompleted = i < 2; // Mocking for now based on image
                                const isActive = i === 2;
                                return (
                                    <div key={step} className="flex-1 flex items-center min-w-[80px]">
                                        <div className="flex flex-col items-center flex-1 relative">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors
                                                ${isCompleted ? 'bg-[#009951] text-white' : isActive ? 'bg-[#0F47F2] text-white' : 'bg-[#E5E7EB] text-[#8E8E93]'}`}
                                            >
                                                {isCompleted ? <Check className="w-6 h-6" /> : step}
                                            </div>
                                            <span className={`text-[11px] mt-2 font-medium ${isActive ? 'text-[#0F47F2]' : 'text-[#8E8E93]'}`}>
                                                {['Sourcing', 'Screening', 'Round2', 'Shortlist', 'Technical', 'F2F', 'Offer', 'Hired'][i]}
                                            </span>
                                        </div>
                                        {i < 7 && (
                                            <div className={`flex-1 h-[2px] -mt-6 transition-colors ${isCompleted ? 'bg-[#009951]' : 'bg-[#E5E7EB]'}`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-[#0F47F2] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                            Move to Stage
                        </button>
                        <button className="flex items-center gap-2 bg-white border border-[#FEE9E7] text-[#DC2626] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FEE9E7] transition">
                            Move to Archive
                        </button>
                    </div>
                </div>

                {/* ── Quick Fit Summary (Signals) ── */}
                {quickFitSummary.length > 0 && (
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">QUICK FIT SUMMARY</h3>
                        <div className="flex flex-wrap gap-3">
                            {quickFitSummary.map((item: any, i: number) => {
                                const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                                    green: { bg: "#EBFFEE", border: "#DEF7EC", text: "#009951" },
                                    yellow: { bg: "#FFF7D6", border: "#FDE047", text: "#92400E" },
                                    red: { bg: "#FEE9E7", border: "#FECACA", text: "#DC2626" },
                                };
                                const c = colorMap[item.color] || colorMap.green;
                                return (
                                    <div
                                        key={i}
                                        className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border"
                                        style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
                                        title={item.evidence}
                                    >
                                        {item.badge}
                                        {item.status && <span className="font-normal opacity-80 ml-1">· {item.status}</span>}
                                        {item.color === 'green' && <Check className="w-3.5 h-3.5" />}
                                        {item.color === 'red' && <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center border border-current text-[10px]">x</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Profile Summary ── */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">PROFILE SUMMARY</h3>
                    <p className="text-sm leading-relaxed text-[#4B5563]">{profileSummary || "No summary available."}</p>
                </div>

                {/* ── Gaps & Risks ── */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                    <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">GAPS / RISK</h3>
                    <div className="flex flex-col gap-3">
                        {(jobScoreObj.gaps_risks || []).length > 0 ? jobScoreObj.gaps_risks.map((gap: string, i: number) => (
                            <div key={i} className="bg-[#F3F5F7] p-4 rounded-lg text-sm text-[#4B5563]">
                                {gap}
                            </div>
                        )) : (
                            <p className="text-sm text-[#AEAEB2]">No major risks identified.</p>
                        )}
                    </div>
                </div>

                {/* ── Additional AI Sections ── */}
                {matchScore.description && (
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">MATCH REASONING</h3>
                        <p className="text-sm leading-relaxed text-[#4B5563]">{matchScore.description}</p>
                    </div>
                )}

                {aiSummary && (
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">AI FEEDBACK</h3>
                        <p className="text-sm leading-relaxed text-[#4B5563]">{aiSummary}</p>
                    </div>
                )}

                {scoreEntries.length > 0 && (
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">SCORE BREAKDOWN</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scoreEntries.map((entry) => (
                                <div key={entry.label} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-[#4B5563]">{entry.label}</span>
                                        <span className="text-lg font-black text-black">{entry.score.toFixed(1)}</span>
                                    </div>
                                    <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: getScoreWidth(entry.score), backgroundColor: getScoreColor(entry.score) }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════
          Right Column: Sidebar
         ═══════════════════════════════════════════════════ */}
            <div className="w-full xl:w-[360px] flex flex-col gap-6 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                    {/* Sidebar tabs */}
                    <div className="flex border-b border-[#E5E7EB]">
                        {(["info", "activity", "notes"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-sm font-medium capitalize transition-colors flex items-center justify-center gap-2 ${activeTab === tab
                                    ? "text-[#0F47F2] border-b-2 border-[#0F47F2] bg-[#F3F5F7]/30"
                                    : "text-[#8E8E93] hover:text-[#4B5563]"
                                    }`}
                            >
                                {tab === "info" && <Briefcase className="w-4 h-4" />}
                                {tab === "activity" && <Clock className="w-4 h-4" />}
                                {tab === "notes" && <FileText className="w-4 h-4" />}
                                <span className="sr-only">{tab}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 flex flex-col gap-8 text-sm">
                        {activeTab === "info" && (
                            <>
                                {/* ── Contact Info ── */}
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">CONTACT INFO</h4>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[#8E8E93]">Name</span>
                                            <span className="font-bold text-right text-black">{fullName}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[#8E8E93]">Location</span>
                                            <span className="font-bold text-right text-black">{location || "--"}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[#8E8E93]">D.O.B</span>
                                            <span className="font-bold text-right text-black">{cand.dob || "--"}</span>
                                        </div>
                                        {premiumUnlocked && premiumData.email && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-[#8E8E93]">Email</span>
                                                <div className="flex items-center gap-2">
                                                    <a href={`mailto:${premiumData.email}`} className="font-bold text-[#0F47F2] hover:underline underline-offset-2">{premiumData.email}</a>
                                                </div>
                                            </div>
                                        )}
                                        {premiumUnlocked && premiumData.phone && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-[#8E8E93]">Phone</span>
                                                <span className="font-bold text-black">{premiumData.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8E8E93]">Links</span>
                                            <div className="flex items-center gap-2">
                                                {socialLinks.linkedin && (
                                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#F3F5F7] rounded text-[#0F47F2] hover:bg-blue-50 transition">
                                                        <Linkedin className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                {socialLinks.github && (
                                                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#F3F5F7] rounded text-black hover:bg-gray-100 transition">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                                {/* ── Résumé ── */}
                                {cand.resume_url && (
                                    <div>
                                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider uppercase">RESUME</h4>
                                        <a
                                            href={cand.resume_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="border border-[#E5E7EB] rounded-lg p-3 bg-white flex items-center justify-between group cursor-pointer hover:border-[#0F47F2] transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-[#8E8E93]" />
                                                <span className="font-bold text-xs text-black line-clamp-1 truncate w-40">
                                                    {fullName.replace(/\s+/g, "_").toLowerCase()}_resume.pdf
                                                </span>
                                            </div>
                                            <Download className="w-4 h-4 text-[#0F47F2]" />
                                        </a>
                                    </div>
                                )}

                                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                                {/* ── Experience ── */}
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">EXPERIENCE</h4>
                                    <div className="flex flex-col gap-6">
                                        {experience.length > 0 ? experience.map((exp: any, i: number) => (
                                            <div key={i}>
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-black text-[13px]">{exp.job_title}</p>
                                                    <span className="text-[10px] text-[#AEAEB2] whitespace-nowrap">{exp.start_date ? new Date(exp.start_date).getFullYear() : ""} - {exp.end_date ? new Date(exp.end_date).getFullYear() : (exp.is_current ? "Present" : "")}</span>
                                                </div>
                                                <p className="text-[11px] text-[#0F47F2] font-semibold">{exp.company}</p>
                                                <p className="text-[10px] text-[#8E8E93] mt-0.5">
                                                    {formatExpDuration(exp.start_date, exp.end_date, exp.is_current).split('·')[1] || ""}
                                                </p>
                                            </div>
                                        )) : <p className="text-xs text-[#AEAEB2]">No experience details provided.</p>}
                                    </div>
                                </div>

                                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                                {/* ── Education ── */}
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">EDUCATION</h4>
                                    <div className="flex flex-col gap-6">
                                        {education.length > 0 ? education.map((edu: any, i: number) => (
                                            <div key={i}>
                                                <p className="font-bold text-black text-[13px]">{edu.institution || edu.schoolName}</p>
                                                <p className="text-[11px] text-[#0F47F2] font-semibold">
                                                    {edu.degree || edu.degreeName}
                                                    {(edu.specialization || edu.fieldOfStudy) && ` — ${edu.specialization || edu.fieldOfStudy}`}
                                                </p>
                                                <p className="text-[10px] text-[#AEAEB2]">
                                                    {edu.start_date ? new Date(edu.start_date).getFullYear() : ""}
                                                    {edu.end_date ? ` — ${new Date(edu.end_date).getFullYear()}` : (edu.start_date ? " — Present" : "")}
                                                </p>
                                            </div>
                                        )) : <p className="text-xs text-[#AEAEB2]">No education details provided.</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "activity" && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-6 tracking-wider">PIPELINE HISTORY</h4>
                                {loadingActivities ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="animate-pulse flex gap-3">
                                                <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5 flex-shrink-0" />
                                                <div className="space-y-1 flex-1">
                                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activities.length === 0 ? (
                                    <p className="text-sm text-[#AEAEB2] text-center py-8">No activity found</p>
                                ) : (
                                    <div className="flex flex-col gap-8 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                                        {activities.map((act, i) => (
                                            <div key={i} className="relative pl-6">
                                                <div className={`w-2 h-2 rounded-full absolute left-0 top-1.5 z-10 
                                                    ${act.type === 'stage_move' ? 'bg-[#009951]' : 'bg-[#0F47F2]'}`}
                                                />
                                                <p className="font-bold text-black text-[13px] mb-1">{act.description}</p>
                                                <div className="flex justify-between items-center text-[10px] text-[#8E8E93]">
                                                    <span>{act.actor}</span>
                                                    <span>{act.date} · {act.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "notes" && (
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">NOTES</h4>
                                <textarea
                                    className="w-full h-40 border border-[#E5E7EB] rounded-xl p-4 text-sm focus:outline-none focus:border-[#0F47F2] placeholder-[#AEAEB2]"
                                    placeholder="Add a private note about this candidate..."
                                />
                                <button className="mt-4 w-full bg-[#0F47F2] text-white py-2.5 rounded-lg text-sm font-bold shadow-sm">
                                    Save Note
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills Card */}
                {skills.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
                        <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">SKILLS</h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill: string, i: number) => (
                                <span key={i} className="bg-[#F3F5F7] text-[#4B5563] text-[11px] px-2.5 py-1 rounded-md font-semibold hover:bg-gray-200 transition cursor-default">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
