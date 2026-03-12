import { useState, useEffect } from "react";
import {
  Mail,
  Download,
  Check,
  MapPin,
  Briefcase,
  Phone,
  ArrowLeft,
  Calendar,
  Linkedin,
  Github,
  Globe,
  UserCircle,
  TrendingUp,
  Palette,
  FileText,
  Play,
  Volume2,
  MoreHorizontal,
  Sparkles,
  PhoneOff,
  ChevronDown,
} from "lucide-react";
import candidateService from "../../../services/candidateService";

import {
  getCandidateCallHistory,
  CallHistoryEntry,
} from "../../../services/jobPipelineDashboardService";

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
  candidate: any; // Raw API response from /jobs/applications/{id}/
  jobId: number | null;
  stages: any[];
  goBack: () => void;
  loading?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalCandidates?: number;
}

// ─── Component ─────────────────────────────────────────────

export default function JobCandidateProfile({
  candidate,
  stages,
  goBack,
  loading,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalCandidates,
}: JobCandidateProfileProps) {
  // Extract data from the raw API response
  const cand = candidate?.candidate || {};
  const contextualDetails = candidate?.contextual_details || {};
  const jobScoreObj = contextualDetails?.job_score_obj || {};
  const matchScore = jobScoreObj?.candidate_match_score || {};
  const quickFitSummary = jobScoreObj?.quick_fit_summary || [];
  const statusTags = candidate?.status_tags || [];
  const applicationId = candidate?.id;

  // NEW: Use current_stage_details from API (as requested)
  const currentStageDetails = candidate?.current_stage_details || {};
  const currentStageName =
    currentStageDetails.name || candidate.current_stage?.name || "--";
  const currentStageSlug =
    currentStageDetails.slug ||
    candidate.current_stage?.slug ||
    candidate.stage_slug;

  // Candidate data
  const fullName = cand.full_name || "--";
  const headline = cand.headline || "";
  const location = cand.location || "";
  const profileSummary = cand.profile_summary || "";
  const experience = cand.experience || [];
  const education = cand.education || [];
  const skills = cand.skills_list || [];
  const premiumData = cand.premium_data || {};
  const noticePeriod =
    cand.notice_period_summary ||
    (cand.notice_period_days ? `${cand.notice_period_days} Days` : "--");
  const totalExp =
    cand.total_experience != null
      ? `${cand.total_experience} years`
      : cand.experience_years || "--";
  const currentSalary = cand.current_salary_lpa || "--";

  // AI Interview Report
  const aiReport =
    cand.ai_interview_report || contextualDetails?.ai_interview_report || {};
  const aiScores = aiReport?.score || {};
  const aiSummary = aiReport?.feedbacks?.overallFeedback || "";

  // States
  const [activeTab, setActiveTab] = useState<
    "info" | "activity" | "call" | "notes"
  >("info");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // ── Call History State ────────────────────────────────────
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState<number | null>(null);

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
            description =
              d.body?.trim() || d.subject?.trim() || "Activity recorded";
          }

          if (!actor || actor === "undefined") actor = "System";

          return {
            type: item.type,
            date: ts.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: ts.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
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

  // ── Fetch Call History ────────────────────────────────────
  useEffect(() => {
    if (!cand.id || activeTab !== "call") return;
    setLoadingCalls(true);
    const candidatePhone = premiumData.phone || "+918103715252";
    getCandidateCallHistory(cand.id, candidatePhone)
      .then((data) => setCallHistory(data))
      .catch((err) => {
        console.error("Error fetching call history:", err);
        setCallHistory([]);
      })
      .finally(() => setLoadingCalls(false));
  }, [cand.id, activeTab]);

  // ── Call tab helpers ─────────────────────────────────────

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0 secs";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} secs`;
    return `${mins}min${mins > 1 ? "s" : ""} ${secs}secs`;
  };

  const getRelativeDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YESTERDAY";
    return `${diffDays} DAYS AGO`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const parseSummaryBullets = (
    summary: string | null,
  ): { main: string[]; nextSteps: string[] } => {
    if (!summary) return { main: [], nextSteps: [] };
    const lines = summary
      .split("\n")
      .map((l) => l.replace(/^[\s•\-*]+/, "").trim())
      .filter(Boolean);

    const nextStepsIdx = lines.findIndex(
      (l) =>
        l.toLowerCase().includes("next step") ||
        l.toLowerCase().includes("action item"),
    );

    if (nextStepsIdx >= 0) {
      return {
        main: lines.slice(0, nextStepsIdx),
        nextSteps: lines.slice(nextStepsIdx + 1),
      };
    }
    // If no explicit "next steps" header, show all as main
    return { main: lines, nextSteps: [] };
  };

  // ── Score bar color helper ───────────────────────────────

  const getScoreColor = (score: number): string => {
    if (score >= 80 || score >= 8) return "#10B981";
    if (score >= 40 || score >= 4) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreWidth = (score: number): string => {
    if (score <= 10) return `${score * 10}%`;
    return `${score}%`;
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
    {
      label: "Technical",
      score: typeof aiScores.technical === "number" ? aiScores.technical : 0,
    },
    { label: "Communication", score: Number(aiScores.communication) || 0 },
  ].filter((e) => e.score > 0);

  // ── Job title for display ────────────────────────────────

  const jobTitle = candidate?.job?.title || contextualDetails?.job_title || "";

  return (
    <div className="flex-1 overflow-y-auto bg-[#F3F5F7] flex flex-col xl:flex-row p-6 gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {/* ── Main Candidate Card ── */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={goBack}
                    className="text-[#8E8E93] hover:text-black transition-colors rounded-full p-1 hover:bg-[#F3F5F7]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-2xl font-semibold text-black">
                    {fullName}
                  </h1>
                </div>
                <div className="ml-10">
                  <p className="text-sm text-[#0F47F2] mb-4">
                    {headline || jobTitle}{" "}
                    {headline && jobTitle ? ` • ${jobTitle}` : ""}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#4B5563] mb-6 font-medium">
                    <span className="flex items-center gap-1.5 ">
                      <Briefcase className="w-4 h-4 text-[#8E8E93]" />{" "}
                      {totalExp}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#8E8E93]" />{" "}
                      {location || "--"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#8E8E93]"
                      >
                        <path
                          d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2.66663 6.66667H13.3333"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {currentSalary} LPA
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#8E8E93]"
                      >
                        <path
                          d="M12.6667 3.33333H3.33333C2.59695 3.33333 2 3.93029 2 4.66667V11.3333C2 12.0697 2.59695 12.6667 3.33333 12.6667H12.6667C13.403 12.6667 14 12.0697 14 11.3333V4.66667C14 3.93029 13.403 3.33333 12.6667 3.33333Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {cand.expected_ctc || "--"} LPA
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#8E8E93]" />{" "}
                      {noticePeriod}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {premiumData.email && (
                      <button
                        onClick={() =>
                          window.open(`mailto:${premiumData.email}`)
                        }
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
                  {currentIndex !== undefined &&
                    totalCandidates !== undefined && (
                      <span className="text-[10px] text-[#AEAEB2] font-bold mr-1">
                        {currentIndex + 1} / {totalCandidates}
                      </span>
                    )}
                  <button
                    onClick={onNavigatePrev}
                    disabled={!onNavigatePrev}
                    className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigatePrev ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
                  >
                    &laquo; Prev
                  </button>
                  <button
                    onClick={onNavigateNext}
                    disabled={!onNavigateNext}
                    className={`px-3 py-1 border border-[#E5E7EB] rounded-md text-xs transition ${onNavigateNext ? "text-black hover:bg-gray-50" : "text-[#AEAEB2] cursor-not-allowed opacity-50"}`}
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
                      style={{
                        color: getScoreColor(
                          typeof matchScore.score === "string"
                            ? Number(matchScore.score.replace("%", ""))
                            : Number(matchScore.score) || 0,
                        ),
                      }}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${typeof matchScore.score === "string" ? Number(matchScore.score.replace("%", "")) : Number(matchScore.score) || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold -mt-1">
                      {matchScore.score || "0%"}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#8E8E93] text-center uppercase tracking-wider font-semibold">
                  Match Score
                </span>
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
                    backgroundColor:
                      tag.color === "green"
                        ? "#DEF7EC"
                        : tag.color === "red"
                          ? "#FEE9E7"
                          : tag.color === "yellow"
                            ? "#FFF7D6"
                            : "#E7EDFF",
                    color:
                      tag.color === "green"
                        ? "#059669"
                        : tag.color === "red"
                          ? "#DC2626"
                          : tag.color === "yellow"
                            ? "#92400E"
                            : "#0F47F2",
                  }}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Current Stage Pipeline Section (FIXED) ── */}
        {/* 
                    - Main card width stays exactly the same as other cards 
                    - Pipeline becomes horizontally scrollable when there are many stages
                    - Uses current_stage_details from API as requested
                    - Each stage is fixed width (no shrinking) + clean connectors
                */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xs font-medium text-[#4B5563] mb-8">
            CURRENT STAGE{" "}
            <span className="text-[#0F47F2] ml-4 font-bold uppercase">
              {currentStageName}
            </span>
          </h3>

          <div className=" overflow-y-auto pb-8 scrollbar-hide">
            <div className="flex items-center min-w-max">
              {stages
                .filter((s) => s.slug !== "archives")
                .map((stage, i, filteredStages) => {
                  const currentStageIndex = stages.findIndex(
                    (s) => s.slug === currentStageSlug,
                  );
                  const isCompleted = i < currentStageIndex;
                  const isActive = i === currentStageIndex;

                  return (
                    <div
                      key={stage.id}
                      className="flex items-center flex-shrink-0"
                    >
                      <div className="flex flex-col items-left">
                        <div className="relative group">
                          {isCompleted ? (
                            <div className="flex items-center justify-left">
                              <div className="relative flex flex-col items-center">
                                <svg
                                  width="40"
                                  height="40"
                                  viewBox="0 0 58 58"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-10 h-10"
                                >
                                  <path
                                    d="M23.6391 9.40147C25.0017 8.24019 25.683 7.65957 26.3954 7.31908C28.0431 6.53154 29.9586 6.53154 31.6063 7.31908C32.3187 7.65957 32.9999 8.24019 34.3627 9.40147C34.905 9.86366 35.1762 10.0948 35.4659 10.2889C36.1298 10.7339 36.8753 11.0427 37.6593 11.1975C38.0015 11.265 38.3565 11.2934 39.067 11.35C40.8517 11.4924 41.7439 11.5637 42.4885 11.8266C44.2104 12.4348 45.5649 13.7893 46.1732 15.5112C46.4361 16.2557 46.5072 17.1481 46.6498 18.9328C46.7063 19.6431 46.7346 19.9983 46.8022 20.3403C46.9569 21.1244 47.2658 21.87 47.7109 22.5339C47.905 22.8235 48.136 23.0947 48.5983 23.637C49.7595 24.9997 50.3402 25.6812 50.6808 26.3934C51.4681 28.0411 51.4681 29.9565 50.6808 31.6042C50.3402 32.3166 49.7595 32.9979 48.5983 34.3606C48.136 34.9029 47.905 35.1741 47.7109 35.4638C47.2658 36.1277 46.9569 36.8732 46.8022 37.6574C46.7346 37.9994 46.7063 38.3547 46.6498 39.0649C46.5072 40.8496 46.4361 41.7419 46.1732 42.4864C45.5649 44.2083 44.2104 45.5628 42.4885 46.1711C41.7439 46.4341 40.8517 46.5051 39.067 46.6477C38.3565 46.7042 38.0015 46.7328 37.6593 46.8002C36.8753 46.9551 36.1298 47.2637 35.4659 47.7088C35.1762 47.9029 34.905 48.1339 34.3627 48.5962C32.9999 49.7575 32.3187 50.3382 31.6063 50.6787C29.9586 51.466 28.0431 51.466 26.3954 50.6787C25.683 50.3382 25.0017 49.7575 23.6391 48.5962C23.0967 48.1339 22.8255 47.9029 22.5359 47.7088C21.872 47.2637 21.1265 46.9551 20.3424 46.8002C20.0003 46.7328 19.6452 46.7042 18.9348 46.6477C17.1501 46.5051 16.2577 46.4341 15.5133 46.1711C13.7913 45.5628 12.4369 44.2083 11.8287 42.4864C11.5657 41.7419 11.4945 40.8496 11.3521 39.0649C11.2954 38.3547 11.2671 37.9994 11.1995 37.6574C11.0447 36.8732 10.7359 36.1277 10.2909 35.4638C10.0968 35.1741 9.86571 34.9029 9.40352 34.3606C8.24224 32.9979 7.66162 32.3166 7.32111 31.6042C6.53359 29.9565 6.53359 28.0411 7.32111 26.3934C7.66162 25.6809 8.24224 24.9997 9.40352 23.637C9.86571 23.0947 10.0968 22.8235 10.2909 22.5339C10.7359 21.87 11.0447 21.1244 11.1995 20.3403C11.2671 19.9983 11.2954 19.6431 11.3521 18.9328C11.4945 17.1481 11.5657 16.2557 11.8287 15.5112C12.4369 13.7893 13.7913 12.4348 15.5133 11.8266C16.2577 11.5637 17.1501 11.4924 18.9348 11.35C19.6452 11.2934 20.0003 11.265 20.3424 11.1975C21.1265 11.0427 21.872 10.7339 22.5359 10.2889C22.8255 10.0948 23.0967 9.86366 23.6391 9.40147Z"
                                    fill="#14AE5C"
                                  />
                                  <path
                                    d="M20.541 30.2083L25.3743 35.0416L37.4577 22.9583"
                                    stroke="white"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                                <span
                                  className={`absolute top-10 text-[8px] font-semibold text-left max-w-[88px] text-nowrap leading-tight ${isActive ? "text-[#0F47F2]" : "text-[#8E8E93]"}`}
                                >
                                  {stage.name}
                                </span>
                              </div>

                              {i < filteredStages.length - 1 && (
                                <div className="w-12 h-[2px] bg-[#E5E7EB]">
                                  {isCompleted && (
                                    <div className="h-full bg-[#009951]" />
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="relative flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                                            ${isActive ? "bg-[#0F47F2] text-white" : "bg-[#E5E7EB] text-[#8E8E93]"}`}
                                >
                                  {i + 1}
                                </div>
                                <span
                                  className={`absolute top-10 text-[8px] font-semibold text-left max-w-[88px] text-nowrap leading-tight ${isActive ? "text-[#0F47F2]" : "text-[#8E8E93]"}`}
                                >
                                  {stage.name}
                                </span>
                              </div>
                              {i < filteredStages.length - 1 && (
                                <div className="w-12 h-[2px] bg-[#E5E7EB]">
                                  {isCompleted && (
                                    <div className="h-full bg-[#009951]" />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Connector line */}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#0F47F2] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md">
              Move to Stage
            </button>
            <button className="flex items-center gap-2 bg-white border border-[#FEE9E7] text-[#DC2626] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#FEE9E7] transition">
              Move to Archive
            </button>
          </div>
        </div>

        {/* ── Quick Fit Summary (Signals) ── */}
        {quickFitSummary.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              QUICK FIT SUMMARY
            </h3>
            <div className="flex flex-wrap gap-3">
              {quickFitSummary.map((item: any, i: number) => {
                const colorMap: Record<
                  string,
                  { bg: string; border: string; text: string }
                > = {
                  green: { bg: "#EBFFEE", border: "#DEF7EC", text: "#009951" },
                  yellow: { bg: "#FFF7D6", border: "#FDE047", text: "#92400E" },
                  red: { bg: "#FEE9E7", border: "#FECACA", text: "#DC2626" },
                };
                const c = colorMap[item.color] || colorMap.green;
                return (
                  <div
                    key={i}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border"
                    style={{
                      backgroundColor: c.bg,
                      borderColor: c.border,
                      color: c.text,
                    }}
                    title={item.evidence}
                  >
                    {item.badge}
                    {item.status && (
                      <span className="font-normal opacity-80 ml-1">
                        · {item.status}
                      </span>
                    )}
                    {item.color === "green" && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {item.color === "red" && (
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center border border-current text-[10px]">
                        x
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Profile Summary ── */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
            PROFILE SUMMARY
          </h3>
          <p className="text-sm leading-relaxed text-[#4B5563]">
            {profileSummary || "No summary available."}
          </p>
        </div>

        {/* ── Gaps & Risks ── */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
            GAPS / RISK
          </h3>
          <div className="flex flex-col gap-3">
            {(jobScoreObj.gaps_risks || []).length > 0 ? (
              jobScoreObj.gaps_risks.map((gap: string, i: number) => (
                <div
                  key={i}
                  className="bg-[#F3F5F7] p-4 rounded-lg text-sm text-[#4B5563]"
                >
                  {gap}
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AEAEB2]">
                No major risks identified.
              </p>
            )}
          </div>
        </div>

        {/* ── Additional AI Sections ── */}
        {matchScore.description && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              MATCH REASONING
            </h3>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              {matchScore.description}
            </p>
          </div>
        )}

        {aiSummary && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              AI FEEDBACK
            </h3>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              {aiSummary}
            </p>
          </div>
        )}

        {scoreEntries.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-[11px] uppercase font-bold text-[#AEAEB2] tracking-wider mb-6">
              SCORE BREAKDOWN
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scoreEntries.map((entry) => (
                <div
                  key={entry.label}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#4B5563]">
                      {entry.label}
                    </span>
                    <span className="text-lg font-black text-black">
                      {entry.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: getScoreWidth(entry.score),
                        backgroundColor: getScoreColor(entry.score),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full xl:w-[360px] flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          {/* Sidebar tabs */}
          <div className="flex border-b border-[#E5E7EB]">
            {(["info", "activity", "call", "notes"] as const).map((id) => {
              const icons: Record<string, React.ReactNode> = {
                info: <UserCircle className="w-5 h-5" />,
                activity: <TrendingUp className="w-5 h-5" />,
                call: <Phone className="w-5 h-5" />,
                notes: <FileText className="w-5 h-5" />,
              };
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 py-4 text-sm font-medium capitalize transition-colors flex items-center justify-center gap-2 ${
                    activeTab === id
                      ? "text-[#0F47F2] border-b-2 border-[#0F47F2] bg-[#F3F5F7]/30"
                      : "text-[#8E8E93] hover:text-[#4B5563]"
                  }`}
                >
                  {icons[id]}
                  <span className="sr-only">{id}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6 flex flex-col gap-8 text-sm">
            {activeTab === "info" && (
              <>
                {/* ── Contact Info ── */}
                <div className=" overflow-y-auto max-h-[500px] hide-scrollbar">
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    CONTACT INFO
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Name</span>
                      <span className="font-bold text-black">{fullName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">
                        Location
                      </span>
                      <span className="font-medium text-black">
                        {location || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">D.O.B</span>
                      <span className="font-medium text-black">--</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-black">
                      <span className="text-[#AEAEB2] font-medium">Email</span>
                      <span
                        className="truncate ml-4 text-[#0F47F2] font-medium cursor-pointer"
                        onClick={() =>
                          premiumData.email &&
                          window.open(`mailto:${premiumData.email}`)
                        }
                      >
                        {premiumData.email || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Phone</span>
                      <span className="text-[#0F47F2] font-medium cursor-pointer">
                        {premiumData.phone || "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#AEAEB2] font-medium">Links</span>
                      <div className="flex gap-2">
                        {cand.linkedin_url && (
                          <Linkedin className="w-4 h-4 text-black hover:text-[#0F47F2] cursor-pointer" />
                        )}
                        <Github className="w-4 h-4 text-black hover:text-[#0F47F2] cursor-pointer" />
                        <Palette className="w-4 h-4 text-black hover:text-[#0F47F2] cursor-pointer" />
                        <Globe className="w-4 h-4 text-black hover:text-[#0F47F2] cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Résumé ── */}
                {cand.resume_url && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider uppercase">
                      RESUME
                    </h4>
                    <a
                      href={cand.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[#E5E7EB] rounded-lg p-3 bg-white flex items-center justify-between group cursor-pointer hover:border-[#0F47F2] transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#8E8E93]" />
                        <span className="font-bold text-xs text-black line-clamp-1 truncate w-40">
                          {fullName.replace(/\s+/g, "_").toLowerCase()}
                          _resume.pdf
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-[#0F47F2]" />
                    </a>
                  </div>
                )}

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Experience ── */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EXPERIENCE
                  </h4>
                  <div className="flex flex-col gap-6">
                    {experience.map((exp: any, i: number) => {
                      const startYear = exp.start_date
                        ? new Date(exp.start_date).getFullYear()
                        : "";
                      const endYear = exp.is_current
                        ? "Present"
                        : exp.end_date
                          ? new Date(exp.end_date).getFullYear()
                          : "";
                      const duration =
                        exp.start_date && (exp.end_date || exp.is_current)
                          ? Math.max(
                              1,
                              Math.round(
                                ((exp.is_current
                                  ? new Date()
                                  : new Date(exp.end_date)
                                ).getTime() -
                                  new Date(exp.start_date).getTime()) /
                                  (1000 * 60 * 60 * 24 * 365),
                              ),
                            )
                          : null;

                      return (
                        <div key={i} className="mb-6 last:mb-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-black">
                              {exp.job_title}
                            </span>
                            <span className="text-[11px] text-[#AEAEB2] font-medium">
                              {startYear} — {endYear}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-[#0F47F2] font-semibold">
                              {exp.company}
                            </div>
                            {duration && (
                              <div className="text-[11px] text-[#AEAEB2] font-medium">
                                {duration} Year{duration > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-[#E5E7EB] w-full" />

                {/* ── Education ── */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                    EDUCATION
                  </h4>
                  <div className="flex flex-col gap-6">
                    {education.length > 0 ? (
                      education.map((edu: any, i: number) => (
                        <div key={i} className="mb-6 last:mb-0">
                          <div className="font-bold text-sm text-black mb-1">
                            {edu.degree ||
                              edu.degree_name ||
                              edu.field_of_study}
                          </div>
                          <div className="text-xs font-semibold text-[#0F47F2]">
                            {edu.school_name || edu.institution}{" "}
                            {edu.end_date
                              ? `| ${new Date(edu.end_date).getFullYear()}`
                              : ""}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#AEAEB2]">
                        No education details provided.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "activity" && (
              <div className=" overflow-y-auto max-h-[500px] hide-scrollbar">
                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-6 tracking-wider">
                  PIPELINE HISTORY
                </h4>
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
                  <p className="text-sm text-[#AEAEB2] text-center py-8">
                    No activity found
                  </p>
                ) : (
                  <div className="flex flex-col gap-8 relative before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E5E7EB]">
                    {activities.map((act, i) => (
                      <div key={i} className="relative pl-6">
                        <div
                          className={`w-2 h-2 rounded-full absolute left-0 top-1.5 z-10 
                                                    ${act.type === "stage_move" ? "bg-[#009951]" : "bg-[#0F47F2]"}`}
                        />
                        <p className="font-bold text-black text-[13px] mb-1">
                          {act.description}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-[#8E8E93]">
                          <span>{act.actor}</span>
                          <span>
                            {act.date} · {act.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
                  NOTES
                </h4>
                <textarea
                  className="w-full h-40 border border-[#E5E7EB] rounded-xl p-4 text-sm focus:outline-none focus:border-[#0F47F2] placeholder-[#AEAEB2]"
                  placeholder="Add a private note about this candidate..."
                />
                <button className="mt-4 w-full bg-[#0F47F2] text-white py-2.5 rounded-lg text-sm font-bold shadow-sm">
                  Save Note
                </button>
              </div>
            )}

            {activeTab === "call" && (
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[500px] hide-scrollbar pr-2 -mr-2">
                {loadingCalls ? (
                  <div className="space-y-4 mt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                        <div className="border border-gray-100 rounded-xl p-5 space-y-3">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <div className="h-3 bg-gray-200 rounded w-2/3" />
                              <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : callHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="w-8 h-8 text-[#AEAEB2] mx-auto mb-3" />
                    <p className="text-sm text-[#AEAEB2]">
                      No call history found
                    </p>
                  </div>
                ) : (
                  callHistory.map((call) => {
                    const isAnswered =
                      call.call_status === "answered" ||
                      call.call_status === "completed";
                    const isExpanded = expandedCallId === call.id;
                    const { main: summaryBullets, nextSteps } =
                      parseSummaryBullets(call.recording?.summary || null);

                    return (
                      <div key={call.id} className="flex flex-col gap-4 mt-2">
                        {/* Date Header */}
                        <div className="flex justify-between items-center text-[#8E8E93] text-xs font-bold tracking-wider">
                          <span>{getRelativeDay(call.created_at)}</span>
                          <span className="font-normal">
                            {formatDate(call.created_at)}
                          </span>
                        </div>

                        {isAnswered ? (
                          /* ── Answered Call Card ── */
                          <div className="border border-[#E5E7EB] rounded-xl p-5">
                            <div className="flex items-center gap-4 mb-5">
                              <div className="w-10 h-10 rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-[#8E8E93]" />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#4B5563]">
                                  {call.call_type === "outgoing"
                                    ? "Outgoing"
                                    : "Incoming"}{" "}
                                  Call on {formatTime(call.created_at)}
                                </p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                                  {formatDuration(call.duration_seconds)}
                                </p>
                              </div>
                            </div>

                            {/* Audio Player */}
                            {call.recording?.recording_url && (
                              <div className="bg-[#EEF1FF] rounded-lg p-3 flex items-center gap-3 mb-6">
                                <Play className="w-4 h-4 text-[#0F47F2] fill-[#0F47F2] cursor-pointer" />
                                <audio
                                  controls
                                  src={call.recording.recording_url}
                                  className="flex-1 h-8"
                                  style={{ maxWidth: "100%" }}
                                />
                              </div>
                            )}

                            {/* Call Summary */}
                            {call.recording?.summary &&
                              call.recording.status === "completed" && (
                                <div className="mb-6">
                                  <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#4B5563] mb-3">
                                    Call Summary
                                    <div className="bg-[#0F47F2] rounded-full p-[3px]">
                                      <Sparkles className="w-2.5 h-2.5 text-white" />
                                    </div>
                                  </h4>
                                  <ul className="flex flex-col gap-3">
                                    {summaryBullets.map((bullet, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2.5"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0F47F2] mt-1.5 shrink-0" />
                                        <span className="text-[13px] text-[#8E8E93] leading-relaxed">
                                          {bullet}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            {/* Next Steps */}
                            {nextSteps.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-[13px] font-bold text-[#4B5563] mb-3">
                                  Next Steps
                                </h4>
                                <ul className="flex flex-col gap-3">
                                  {nextSteps.map((step, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-2.5"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#0F47F2] mt-1.5 shrink-0" />
                                      <span className="text-[13px] text-[#8E8E93] leading-relaxed">
                                        {step}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Transcript Toggle */}
                            {call.recording?.transcript && (
                              <div className="mt-4 border-t border-[#E5E7EB] pt-4">
                                <button
                                  onClick={() =>
                                    setShowTranscript(
                                      showTranscript === call.id
                                        ? null
                                        : call.id,
                                    )
                                  }
                                  className="flex items-center gap-2 text-xs font-bold text-[#0F47F2] hover:underline"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {showTranscript === call.id
                                    ? "Hide Transcript"
                                    : "View Transcript"}
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform ${
                                      showTranscript === call.id
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                                {showTranscript === call.id && (
                                  <div className="mt-3 bg-[#F8FAFC] rounded-lg p-4 text-[12px] text-[#4B5563] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                                    {call.recording.transcript}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Processing indicator */}
                            {call.recording &&
                              call.recording.status === "processing" && (
                                <div className="flex items-center gap-2 text-xs text-[#F59E0B] mt-4">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#F59E0B]" />
                                  Processing transcript...
                                </div>
                              )}
                          </div>
                        ) : (
                          /* ── Not Answered / Failed Call Card ── */
                          <div
                            className="border border-[#E5E7EB] rounded-xl p-4 flex items-center justify-between hover:border-[#0F47F2] transition cursor-pointer"
                            onClick={() =>
                              setExpandedCallId(isExpanded ? null : call.id)
                            }
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#FEE9E7] flex items-center justify-center shrink-0">
                                <PhoneOff className="w-4 h-4 text-[#DC2626]" />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-[#DC2626]">
                                  {call.call_status === "not_answered"
                                    ? "Not answered"
                                    : call.call_status === "busy"
                                      ? "Busy"
                                      : "Call failed"}
                                </p>
                                <p className="text-[11px] text-[#AEAEB2] mt-0.5">
                                  {call.duration_seconds > 0
                                    ? `Rang for ${formatDuration(call.duration_seconds)}`
                                    : `${call.call_type === "outgoing" ? "Outgoing" : "Incoming"} at ${formatTime(call.created_at)}`}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-[#4B5563] transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Card */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
            <h4 className="text-[10px] uppercase font-bold text-[#AEAEB2] mb-4 tracking-wider">
              SKILLS
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="bg-[#F3F5F7] text-[#4B5563] text-[11px] px-2.5 py-1 rounded-md font-semibold hover:bg-gray-200 transition cursor-default"
                >
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
