import React, { useState, useEffect } from "react";
import {
    Mail, ArrowRight, Download, Flag, MoreHorizontal, Check,
    FileText, ChevronLeft, ChevronRight, MapPin, Clock, Briefcase,
    GraduationCap, Linkedin, ExternalLink, Phone, Copy, ArrowLeft, Calendar
} from "lucide-react";
import apiClient from "../../../services/api";
import candidateService from "../../../services/candidateService";
import { showToast } from "../../../utils/toast";

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
}

// ─── Helpers ───────────────────────────────────────────────

const getInitials = (name?: string): string => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const formatDate = (iso?: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTimeAgo = (iso?: string): string => {
    if (!iso) return "";
    const now = new Date();
    const d = new Date(iso);
    const diffMs = now.getTime() - d.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
};

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

export default function JobCandidateProfile({ candidate, jobId, goBack, loading }: JobCandidateProfileProps) {
    // Extract data from the raw API response
    const cand = candidate?.candidate || {};
    const currentStage = candidate?.current_stage_details || candidate?.current_stage || {};
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
    const createdAt = candidate?.created_at;

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
    }, [cand.id, applicationId]);

    // ── Score bar color helper ───────────────────────────────

    const getScoreColor = (score: number): string => {
        if (score >= 8) return "#10B981";
        if (score >= 6) return "#F59E0B";
        return "#EF4444";
    };

    const getScoreWidth = (score: number): string => `${Math.min(score * 10, 100)}%`;

    // ── Copy helper ──────────────────────────────────────────

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => showToast.success("Copied!")).catch(() => showToast.error("Failed to copy"));
    };

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
                                            {currentSalary}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8E8E93]">
                                                <path d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {cand.expected_ctc || "--"}
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

                            <div className="flex flex-col items-center justify-start max-w-[150px]">
                                <div className="flex items-center gap-2 mb-6 self-end w-full justify-end">
                                    <button className="px-3 py-1 border border-[#E5E7EB] rounded-md text-xs text-[#8E8E93] hover:bg-gray-50 flex items-center gap-1">
                                        &laquo; Prev
                                    </button>
                                    <button className="px-3 py-1 border border-[#E5E7EB] rounded-md text-xs text-[#8E8E93] hover:bg-gray-50 flex items-center gap-1">
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
                                            style={{ color: getScoreColor(Number(matchScore.score) || 0) }}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                            strokeDasharray={`${(Number(matchScore.score) || 0) * 10}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-semibold -mt-1">{Number(matchScore.score || 0) * 10}%</span>
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

                {/* ── Quick Fit Summary (Signals) ── */}
                {quickFitSummary.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Signals</h3>
                        <div className="flex flex-wrap gap-2">
                            {quickFitSummary.map((item: any, i: number) => {
                                const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                                    green: { bg: "#DCFCE7", border: "#86EFAC", text: "#15803D" },
                                    yellow: { bg: "#FEF9C3", border: "#FDE047", text: "#854D0E" },
                                    red: { bg: "#FEE2E2", border: "#FCA5A5", text: "#DC2626" },
                                };
                                const c = colorMap[item.color] || colorMap.green;
                                return (
                                    <span
                                        key={i}
                                        className="text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
                                        style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, border: `1px solid ${c.border}` }}
                                        title={item.evidence}
                                    >
                                        {item.badge}
                                        {item.status && <span className="font-normal ml-1">· {item.status}</span>}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Score Cards ── */}
                {scoreEntries.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Score</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {scoreEntries.map((entry) => (
                                <div key={entry.label} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
                                    <div className="text-3xl font-black text-black">{entry.score.toFixed(1)}</div>
                                    <div className="text-xs font-semibold text-[#8E8E93] mt-1">{entry.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Profile Match Description ── */}
                {matchScore.description && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Profile Match Summary</h3>
                        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                            <p className="text-sm leading-relaxed text-[#374151]">{matchScore.description}</p>
                        </div>
                    </div>
                )}

                {/* ── AI Interview Summary ── */}
                {aiSummary && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">AI Interview Summary</h3>
                        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                            <p className="text-sm leading-relaxed text-[#374151]">{aiSummary}</p>
                        </div>
                    </div>
                )}

                {/* ── AI Interview Score Breakdown ── */}
                {scoreEntries.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">AI Interview Score Breakdown</h3>
                        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm flex flex-col gap-5">
                            {scoreEntries.map((entry) => (
                                <div key={entry.label} className="flex justify-between items-center text-sm font-semibold">
                                    <span className="w-32 text-[#4B5563]">{entry.label}</span>
                                    <div className="flex-1 mx-4 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: getScoreWidth(entry.score), backgroundColor: getScoreColor(entry.score) }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-black">{entry.score.toFixed(1)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Profile Summary ── */}
                {profileSummary && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Profile Summary</h3>
                        <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                            <p className="text-sm leading-relaxed text-[#374151]">{profileSummary}</p>
                        </div>
                    </div>
                )}

                {/* ── Skills ── */}
                {skills.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill: string, i: number) => (
                                <span key={i} className="bg-[#F2F2F7] text-[#4B5563] text-xs px-3 py-1.5 rounded-full font-medium">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Gaps & Risks ── */}
                {(jobScoreObj.gaps_risks || []).length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-4">Gaps & Risks</h3>
                        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-6 shadow-sm">
                            <ul className="list-disc list-inside space-y-1">
                                {jobScoreObj.gaps_risks.map((gap: string, i: number) => (
                                    <li key={i} className="text-sm text-[#991B1B]">{gap}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════
          Right Column: Sidebar
         ═══════════════════════════════════════════════════ */}
            <div className="w-full xl:w-[360px] bg-white rounded-xl shadow-sm border border-[#E5E7EB] shrink-0 overflow-hidden" style={{ height: "max-content", maxHeight: "100%" }}>
                {/* Sidebar tabs */}
                <div className="flex border-b border-[#E5E7EB]">
                    {(["info", "activity", "notes"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab
                                ? "text-[#0F47F2] border-b-2 border-[#0F47F2]"
                                : "text-[#8E8E93] hover:text-[#4B5563]"
                                }`}
                        >
                            {tab === "info" ? "Info" : tab === "activity" ? "Activity" : "Notes"}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex flex-col gap-8 text-sm overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
                    {activeTab === "info" && (
                        <>
                            {/* ── Contact Info ── */}
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Contact Info</h4>
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between">
                                        <span className="text-[#8E8E93]">Name</span>
                                        <span className="font-semibold text-right">{fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#8E8E93]">Location</span>
                                        <span className="font-semibold text-right">{location || "--"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#8E8E93]">Experience</span>
                                        <span className="font-semibold text-right">{totalExp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#8E8E93]">Current CTC</span>
                                        <span className="font-semibold text-right">{currentSalary}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#8E8E93]">Notice Period</span>
                                        <span className="font-semibold text-right">{noticePeriod}</span>
                                    </div>
                                    {premiumUnlocked && premiumData.email && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8E8E93]">Email</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[#0F47F2]">{premiumData.email}</span>
                                                <button onClick={() => handleCopy(premiumData.email)} className="text-[#AEAEB2] hover:text-[#4B5563]">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {premiumUnlocked && premiumData.phone && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8E8E93]">Phone</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-right">{premiumData.phone}</span>
                                                <button onClick={() => handleCopy(premiumData.phone)} className="text-[#AEAEB2] hover:text-[#4B5563]">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {socialLinks.linkedin && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8E8E93]">LinkedIn</span>
                                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0F47F2] flex items-center gap-1 hover:underline">
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-[1px] bg-[#E5E7EB] w-full" />

                            {/* ── Experience ── */}
                            {experience.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Experience</h4>
                                    <div className="flex flex-col gap-4">
                                        {experience.map((exp: any, i: number) => (
                                            <div key={i}>
                                                <p className="font-bold text-black">
                                                    {exp.job_title}
                                                    {exp.company && <span className="font-normal text-[#4B5563]">, {exp.company}</span>}
                                                </p>
                                                <p className="text-xs text-[#8E8E93]">
                                                    {formatExpDuration(exp.start_date, exp.end_date, exp.is_current)}
                                                </p>
                                                {exp.location && <p className="text-xs text-[#AEAEB2] mt-0.5">{exp.location}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {experience.length > 0 && <div className="h-[1px] bg-[#E5E7EB] w-full" />}

                            {/* ── Education ── */}
                            {education.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Education</h4>
                                    <div className="flex flex-col gap-4">
                                        {education.map((edu: any, i: number) => (
                                            <div key={i}>
                                                <p className="font-bold text-black">{edu.institution || edu.schoolName}</p>
                                                <p className="text-xs text-[#8E8E93]">
                                                    {edu.degree || edu.degreeName}
                                                    {(edu.specialization || edu.fieldOfStudy) && ` — ${edu.specialization || edu.fieldOfStudy}`}
                                                </p>
                                                {(edu.start_date || edu.end_date) && (
                                                    <p className="text-xs text-[#AEAEB2]">
                                                        {edu.start_date ? new Date(edu.start_date).getFullYear() : ""}
                                                        {edu.end_date ? ` — ${new Date(edu.end_date).getFullYear()}` : " — Present"}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {education.length > 0 && <div className="h-[1px] bg-[#E5E7EB] w-full" />}

                            {/* ── Résumé ── */}
                            {cand.resume_url && (
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Résumé</h4>
                                    <a
                                        href={cand.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="border border-[#E5E7EB] rounded-lg p-3 bg-[#F9FAFB] flex items-center justify-between group cursor-pointer hover:bg-[#F3F5F7] transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-[#8E8E93]" />
                                            <span className="font-bold text-xs">
                                                {fullName.replace(/\s+/g, "_").toLowerCase()}_resume.pdf
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition -rotate-45" />
                                    </a>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "activity" && (
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Pipeline History</h4>
                            {loadingActivities ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-2.5 h-2.5 bg-gray-200 rounded-full mt-1 flex-shrink-0" />
                                            <div className="space-y-1 flex-1">
                                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                                <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                                                <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activities.length === 0 ? (
                                <p className="text-sm text-[#AEAEB2] text-center py-8">No activity found</p>
                            ) : (
                                <div className="flex flex-col gap-6 pl-2 border-l-2 border-[#E5E7EB] ml-1 relative">
                                    {activities.map((act, i) => {
                                        const isStageMove = act.type === "stage_move";
                                        const dotColor = isStageMove ? "#10B981" : "#0F47F2";
                                        return (
                                            <div key={i} className="relative">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full absolute -left-[14px] border-2 border-white top-1"
                                                    style={{ backgroundColor: dotColor }}
                                                />
                                                <p className="font-bold text-black text-xs">{act.description}</p>
                                                {act.actor && act.actor !== "System" && (
                                                    <p className="text-[10px] text-[#4B5563] mb-0.5">by {act.actor}</p>
                                                )}
                                                <p className="text-[10px] text-[#8E8E93]">
                                                    {act.date}{act.time ? `, ${act.time}` : ""}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "notes" && (
                        <div>
                            <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">Notes</h4>
                            <p className="text-sm text-[#AEAEB2] text-center py-8">Notes feature coming soon</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
