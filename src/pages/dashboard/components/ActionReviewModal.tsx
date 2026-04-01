import React, { useState } from "react";
import {
  PriorityActionItem,
  PriorityTab,
} from "../../../services/dashboardService";
import apiClient from "../../../services/api";
import CallCandidateModal, {
  CallCandidateData,
} from "../../companies/components/CallCandidateModal";

interface ActionReviewModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  candidateData?: any; // Full candidate details from /jobs/applications/{id}/
  isLoading?: boolean;
  currentIndex: number;
  totalCount: number;
  currentItem: PriorityActionItem | null;
  onNavigate: (newIndex: number) => void;
  tab: PriorityTab;
  onComplete?: (applicationId: number, actionTaken: string) => Promise<void>;
}

// quick_fit_summary item shape from the API
interface QuickFitItem {
  badge: string;
  color: "green" | "yellow" | "red";
  status: string;
  evidence: string;
  priority: string;
}

const ActionReviewModal: React.FC<ActionReviewModalProps> = ({
  isOpen = true,
  onClose = () => {},
  candidateData,
  isLoading = false,
  currentIndex,
  totalCount,
  currentItem,
  onNavigate,
  tab,
  onComplete,
}) => {
  const [completing, setCompleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [movingNext, setMovingNext] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  if (!isOpen) return null;

  const goNext = () => onNavigate(Math.min(currentIndex + 1, totalCount - 1));
  const goPrev = () => onNavigate(Math.max(currentIndex - 1, 0));

  // ── Extract data from API response ──
  const candidate = candidateData?.candidate;
  const contextual = candidateData?.contextual_details;
  const stageDetails = candidateData?.current_stage_details;
  const jobScoreObj = contextual?.job_score_obj;
  const candidateMatchScore = jobScoreObj?.candidate_match_score;

  // ── Candidate name ──
  const candidateName =
    candidate?.full_name || currentItem?.candidate_full_name || "Loading...";

  // ── Subtitle: job_role · workspace_name ──
  const jobRole = currentItem?.job_role || "";
  const workspaceName = currentItem?.workspace_name || "";

  // ── Status badge (from tags) ──
  const status =
    currentItem?.tags?.[0] ||
    currentItem?.current_stage_name ||
    stageDetails?.name ||
    "";

  // ── Match percentage — parse from candidate_match_score.score (e.g. "65%") ──
  let matchPercentage = 0;
  if (candidateMatchScore?.score) {
    const parsed = parseInt(
      String(candidateMatchScore.score).replace("%", ""),
      10,
    );
    if (!isNaN(parsed)) matchPercentage = parsed;
  }

  // ── Experience — from total_experience (number, e.g. 8.8) ──
  const experience = candidate?.total_experience
    ? `${candidate.total_experience} yrs`
    : candidate?.experience_years
      ? `${candidate.experience_years} yrs`
      : "N/A";

  // ── Current CTC ──
  const currentCTC =
    candidate?.current_salary || candidate?.premium_data?.current_ctc || "N/A";

  // ── Expected CTC ──
  const expectedCTC =
    candidate?.expected_ctc || candidate?.premium_data?.expected_ctc || "N/A";

  // ── Notice Period — from notice_period_days (number) ──
  const noticePeriodDays = candidate?.notice_period_days;
  const noticePeriod =
    noticePeriodDays != null
      ? noticePeriodDays === 0
        ? "Immediate"
        : `${noticePeriodDays} Days`
      : candidate?.notice_period_summary || "N/A";

  // ── Location ──
  const location = candidate?.location || "N/A";

  // ── Source — application_type (e.g. "sourced") ──
  const source = candidate?.application_type
    ? candidate.application_type.charAt(0).toUpperCase() +
      candidate.application_type.slice(1)
    : candidate?.source || "N/A";

  // ── Quick Fit Summary — from job_score_obj.quick_fit_summary ──
  const quickFitSummary: QuickFitItem[] = jobScoreObj?.quick_fit_summary || [];

  // ── AI Summary — from candidate_match_score.description ──
  const aiSummary =
    candidateMatchScore?.description ||
    contextual?.ai_summary ||
    jobScoreObj?.recommended_message ||
    candidate?.profile_summary ||
    "No AI summary available for this candidate.";

  // ── Match label (e.g. "Moderate Match") ──
  const matchLabel = candidateMatchScore?.label || "";

  // Circular progress ring
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference - (matchPercentage / 100) * circumference;

  // ── Determine which action button to show ──
  const tags = currentItem?.tags || [];

  const shouldShowCallButton =
    tab === "sourcing" &&
    tags.some(
      (t) =>
        t.toLowerCase() === "follow up required - call" ||
        t.toLowerCase() === "not called - call",
    );

  const shouldShowMoveToNextRound =
    (tab === "screening" &&
      tags.some(
        (t) =>
          t.toLowerCase().includes("not moved") &&
          t.toLowerCase().includes("move to next round"),
      )) ||
    (tab === "interview" &&
      tags.some(
        (t) =>
          t.toLowerCase().includes("interview feedback pending") &&
          t.toLowerCase().includes("move to next round"),
      ));

  // ── Build CallCandidateData from candidateData ──
  const callCandidateData: CallCandidateData | null = currentItem
    ? {
        id: currentItem.candidate_id,
        name: candidateName,
        avatarInitials: candidateName
          .split(" ")
          .slice(0, 2)
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
        headline: candidate?.headline || currentItem.role || "",
        phone: candidate?.phone || candidate?.premium_data?.phone || "",
        experience,
        expectedCtc: expectedCTC,
        location,
        noticePeriod,
      }
    : null;

  const handleComplete = async (actionLabel: string) => {
    if (!currentItem || !onComplete) return;
    setCompleting(true);
    try {
      await onComplete(currentItem.application_id, actionLabel);
      if (currentIndex < totalCount - 1) {
        goNext();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Complete action failed:", err);
    } finally {
      setCompleting(false);
    }
  };

  // ── Archive: move candidate to archive stage ──
  const handleArchive = async () => {
    if (!currentItem) return;
    setArchiving(true);
    try {
      // Use archive_stage_id from API response if available
      const archiveStageId = currentItem.archive_stage_id;

      if (archiveStageId) {
        await apiClient.patch(
          `/jobs/applications/${currentItem.application_id}/`,
          {
            current_stage: archiveStageId,
            status: "ARCHIVED",
            archive_reason: "Candidate archived from priority actions",
          },
        );
      } else {
        // Fallback: mark action as done via priority-actions/complete/
        await apiClient.patch(
          `/jobs/applications/${currentItem.application_id}/`,
          {
            status: "ARCHIVED",
            archive_reason: "Candidate archived from priority actions",
          },
        );
      }

      // Also mark as done in priority actions
      if (onComplete) {
        await onComplete(currentItem.application_id, "Archived");
      }

      if (currentIndex < totalCount - 1) {
        goNext();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Archive failed:", err);
    } finally {
      setArchiving(false);
    }
  };

  // ── Move to Next Round ──
  const handleMoveToNextRound = async () => {
    if (!currentItem) return;
    setMovingNext(true);
    try {
      const nextStageId = currentItem.next_stage_id;
      if (nextStageId) {
        await apiClient.patch(
          `/jobs/applications/${currentItem.application_id}/`,
          {
            current_stage: nextStageId,
          },
        );
      }
      // Mark action as done
      await handleComplete("Moved to next round");
    } catch (err) {
      console.error("Move to next round failed:", err);
    } finally {
      setMovingNext(false);
    }
  };

  // ── Quick fit badge color mapping ──
  const getBadgeStyle = (
    color: string,
  ): { textColor: string; iconType: "check" | "warn" | "cross" } => {
    switch (color) {
      case "green":
        return { textColor: "#009951", iconType: "check" };
      case "yellow":
        return { textColor: "#CC8800", iconType: "warn" };
      case "red":
        return { textColor: "#CF272D", iconType: "cross" };
      default:
        return { textColor: "#8E8E93", iconType: "check" };
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <div
          className="bg-white flex flex-col overflow-hidden"
          style={{
            width: 553,
            maxHeight: 727,
            borderRadius: 10,
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header — 65px ── */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              height: 65,
              padding: "0 24px",
              borderBottom: "0.5px solid #AEAEB2",
            }}
          >
            {/* Status badge */}
            <span
              className="inline-flex items-center"
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                background: "#E7EDFF",
                color: "#0088FF",
                fontSize: 14,
                lineHeight: "17px",
                fontWeight: 400,
              }}
            >
              {status}
            </span>

            <div className="flex items-center" style={{ gap: 20 }}>
              {/* Pagination */}
              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  className="flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                  style={{
                    width: 30,
                    height: 30,
                    background: "#FFFFFF",
                    border: "0.5px solid #D1D1D6",
                    borderRadius: 7,
                  }}
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                >
                  <svg
                    width="7"
                    height="6"
                    viewBox="0 0 7 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.27539 5.57812L0 3.09375V2.48438L3.27539 0V0.925781L0.802734 2.79492L3.27539 4.64648V5.57812ZM6.46875 5.57812L3.18164 3.09375V2.48438L6.46875 0V0.925781L3.98438 2.79492L6.46875 4.64648V5.57812Z"
                      fill="#4B5563"
                    />
                  </svg>
                </button>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: "14px",
                    fontWeight: 400,
                    color: "#4B5563",
                    minWidth: 22,
                    textAlign: "center",
                  }}
                >
                  {totalCount > 0 ? `${currentIndex + 1}/${totalCount}` : "0/0"}
                </span>
                <button
                  className="flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-30"
                  style={{
                    width: 30,
                    height: 30,
                    background: "#FFFFFF",
                    border: "0.5px solid #D1D1D6",
                    borderRadius: 7,
                  }}
                  onClick={goNext}
                  disabled={currentIndex === totalCount - 1}
                >
                  <svg
                    width="7"
                    height="6"
                    viewBox="0 0 7 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.19336 5.57812L6.46875 3.09375V2.48438L3.19336 0V0.925781L5.66602 2.79492L3.19336 4.64648V5.57812ZM0 5.57812L3.28711 3.09375V2.48438L0 0V0.925781L2.48438 2.79492L0 4.64648V5.57812Z"
                      fill="#4B5563"
                    />
                  </svg>
                </button>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ width: 24, height: 24 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.5354 15.5355L8.46436 8.46448M15.5354 8.46448L8.46436 15.5355"
                    stroke="#4B5563"
                    strokeLinecap="square"
                  />
                  <path
                    d="M4.92893 19.0711C1.02369 15.1658 1.02369 8.83417 4.92893 4.92893C8.83417 1.02369 15.1658 1.02369 19.0711 4.92893C22.9763 8.83417 22.9763 15.1658 19.0711 19.0711C15.1658 22.9763 8.83417 22.9763 4.92893 19.0711Z"
                    stroke="#4B5563"
                    strokeLinecap="square"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Scrollable Content ── */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ padding: "20px 24px 0 24px" }}
          >
            {isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex flex-col gap-2">
                    <div className="w-40 h-6 rounded bg-gray-200" />
                    <div className="w-60 h-4 rounded bg-gray-200" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                </div>
                <div className="flex gap-4 mb-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 w-28">
                      <div className="w-16 h-3 rounded bg-gray-200" />
                      <div className="w-12 h-5 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mb-5 pb-5 border-b border-[#AEAEB2]">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 w-28">
                      <div className="w-16 h-3 rounded bg-gray-200" />
                      <div className="w-12 h-5 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="mb-5">
                  <div className="w-32 h-4 rounded bg-gray-200 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-20 h-8 rounded-full bg-gray-200"
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <div className="w-24 h-4 rounded bg-gray-200 mb-3" />
                  <div className="w-full h-20 rounded-lg bg-gray-200" />
                </div>
              </div>
            ) : (
              <>
                {/* ── Candidate Name + Job Role · Workspace + Match % ── */}
                <div
                  className="flex items-start justify-between"
                  style={{ paddingBottom: 20 }}
                >
                  <div
                    style={{
                      gap: 10,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 20,
                        lineHeight: "24px",
                        fontWeight: 500,
                        color: "#000000",
                        margin: 0,
                      }}
                    >
                      {candidateName}
                    </h2>
                    <p
                      style={{
                        fontSize: 12,
                        lineHeight: "14px",
                        fontWeight: 400,
                        color: "#0F47F2",
                        margin: 0,
                      }}
                    >
                      {jobRole}
                      {workspaceName ? ` · ${workspaceName}` : ""}
                    </p>
                  </div>

                  {/* Circular Match Percentage — 48×48 */}
                  {matchPercentage > 0 && (
                    <div
                      className="flex-shrink-0 relative"
                      style={{ width: 48, height: 48 }}
                    >
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        className="-rotate-90"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="rgba(116,116,128,0.08)"
                          strokeWidth="3"
                          fill="none"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
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
                        style={{
                          fontSize: 14,
                          lineHeight: "17px",
                          fontWeight: 400,
                          color: "#4B5563",
                        }}
                      >
                        {matchPercentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Key Stats — Row 1 ── */}
                <div
                  className="flex justify-between"
                  style={{ marginBottom: 20, gap: 67 }}
                >
                  {[
                    { label: "Experience", value: experience },
                    { label: "Current CTC", value: currentCTC },
                    { label: "Expected", value: expectedCTC },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        width: 120,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: "17px",
                          fontWeight: 400,
                          color: "#8E8E93",
                          margin: 0,
                        }}
                      >
                        {stat.label}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: "19px",
                          fontWeight: 500,
                          color: "#4B5563",
                          margin: 0,
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Key Stats — Row 2 ── */}
                <div
                  className="flex justify-between"
                  style={{
                    paddingBottom: 20,
                    gap: 67,
                    borderBottom: "0.5px solid #AEAEB2",
                  }}
                >
                  {[
                    { label: "Notice Period", value: noticePeriod },
                    { label: "Location", value: location },
                    { label: "Source", value: source },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        width: 120,
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: "17px",
                          fontWeight: 400,
                          color: "#8E8E93",
                          margin: 0,
                        }}
                      >
                        {stat.label}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: "19px",
                          fontWeight: 500,
                          color: "#4B5563",
                          margin: 0,
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Quick Fit Summary — from job_score_obj.quick_fit_summary ── */}
                {quickFitSummary.length > 0 && (
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <h4
                      style={{
                        fontSize: 14,
                        lineHeight: "17px",
                        fontWeight: 500,
                        color: "#4B5563",
                        textTransform: "uppercase",
                        margin: "0 0 16px 0",
                      }}
                    >
                      QUICK FIT SUMMARY
                    </h4>
                    <div className="flex flex-wrap" style={{ gap: 10 }}>
                      {quickFitSummary.map(
                        (item: QuickFitItem, idx: number) => {
                          const badgeStyle = getBadgeStyle(item.color);
                          return (
                            <span
                              key={`${item.badge}-${idx}`}
                              className="inline-flex items-center"
                              title={item.evidence}
                              style={{
                                padding: "10px 12px",
                                gap: 4,
                                background: "#F5F9FB",
                                borderRadius: 20,
                                fontSize: 14,
                                lineHeight: "17px",
                                fontWeight: 400,
                                color: badgeStyle.textColor,
                              }}
                            >
                              {item.badge}
                              {badgeStyle.iconType === "check" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 17 17"
                                  fill="none"
                                >
                                  <circle
                                    cx="8.5"
                                    cy="8.5"
                                    r="7"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M5.5 8.5L7.5 10.5L11.5 6.5"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                              {badgeStyle.iconType === "warn" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 17 17"
                                  fill="none"
                                >
                                  <circle
                                    cx="8.5"
                                    cy="8.5"
                                    r="7"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M8.5 5.5V9.5"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx="8.5"
                                    cy="11.5"
                                    r="0.75"
                                    fill={badgeStyle.textColor}
                                  />
                                </svg>
                              )}
                              {badgeStyle.iconType === "cross" && (
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 17 17"
                                  fill="none"
                                >
                                  <circle
                                    cx="8.5"
                                    cy="8.5"
                                    r="7"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M6 6L11 11M11 6L6 11"
                                    stroke={badgeStyle.textColor}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}
                            </span>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                {/* ── AI Summary — from candidate_match_score.description ── */}
                <div style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      lineHeight: "17px",
                      fontWeight: 500,
                      color: "#4B5563",
                      textTransform: "uppercase",
                      margin: "0 0 10px 0",
                    }}
                  >
                    AI SUMMARY
                    {matchLabel && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          fontWeight: 400,
                          color: "#8E8E93",
                          textTransform: "none",
                        }}
                      >
                        ({matchLabel})
                      </span>
                    )}
                  </h4>
                  <div
                    style={{
                      background: "#F9FAFB",
                      borderRadius: 10,
                      padding: "8px 12px 6px 12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: "25px",
                        fontWeight: 400,
                        color: "#8E8E93",
                        margin: 0,
                      }}
                    >
                      {aiSummary}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-between shrink-0"
            style={{
              padding: "0 24px",
              height: 65,
              borderTop: "0.5px solid #AEAEB2",
            }}
          >
            {/* Archive */}
            <button
              className="inline-flex items-center hover:opacity-80 transition-opacity"
              style={{
                padding: 10,
                gap: 5,
                background: "#FFFFFF",
                border: "0.5px solid #FF383C",
                borderRadius: 5,
              }}
              onClick={handleArchive}
              disabled={archiving || completing}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.11328 2.66671C6.38783 1.88991 7.12868 1.33337 7.99948 1.33337C8.87028 1.33337 9.61115 1.88991 9.88568 2.66671"
                  stroke="#FF383C"
                  strokeLinecap="round"
                />
                <path
                  d="M13.6674 4H2.33398"
                  stroke="#FF383C"
                  strokeLinecap="round"
                />
                <path
                  d="M12.5545 5.66663L12.2478 10.266C12.1298 12.036 12.0708 12.921 11.4942 13.4604C10.9175 14 10.0306 14 8.25669 14H7.74116C5.96726 14 5.08033 14 4.50365 13.4604C3.92699 12.921 3.86799 12.036 3.74999 10.266L3.44336 5.66663"
                  stroke="#FF383C"
                  strokeLinecap="round"
                />
                <path
                  d="M6.33398 7.33337L6.66732 10.6667"
                  stroke="#FF383C"
                  strokeLinecap="round"
                />
                <path
                  d="M9.66732 7.33337L9.33398 10.6667"
                  stroke="#FF383C"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 14,
                  lineHeight: "17px",
                  fontWeight: 400,
                  color: "#FF383C",
                }}
              >
                {archiving ? "Archiving..." : "Archive"}
              </span>
            </button>

            {/* Right group */}
            <div className="flex items-center" style={{ gap: 10 }}>
              {/* View Profile */}
              <button
                className="inline-flex items-center hover:opacity-80 transition-opacity"
                style={{
                  padding: 10,
                  gap: 5,
                  border: "0.5px solid #9CA3AF",
                  borderRadius: 5,
                }}
                onClick={() => {
                  if (currentItem?.candidate_id) {
                    window.open(
                      `/candidate-profiles/${currentItem.candidate_id}`,
                      "_blank",
                    );
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.07992 8.52C8.03325 8.51333 7.97325 8.51333 7.91992 8.52C6.74659 8.48 5.81323 7.52 5.81323 6.33999C5.81323 5.13332 6.78659 4.15332 7.99992 4.15332C9.20659 4.15332 10.1866 5.13332 10.1866 6.33999C10.1799 7.52 9.25325 8.48 8.07992 8.52Z"
                    stroke="#9CA3AF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.4933 12.92C11.3066 14.0067 9.73325 14.6667 7.99992 14.6667C6.26659 14.6667 4.69326 14.0067 3.50659 12.92C3.57326 12.2934 3.97326 11.68 4.68659 11.2C6.51326 9.98671 9.49992 9.98671 11.3133 11.2C12.0266 11.68 12.4266 12.2934 12.4933 12.92Z"
                    stroke="#9CA3AF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8.00004C14.6666 4.31814 11.6818 1.33337 7.99992 1.33337C4.31802 1.33337 1.33325 4.31814 1.33325 8.00004C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z"
                    stroke="#9CA3AF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: "17px",
                    fontWeight: 400,
                    color: "#9CA3AF",
                  }}
                >
                  View Profile
                </span>
              </button>

              {/* ── Dynamic Action Button ── */}
              {shouldShowCallButton && (
                /* Call Candidate Button — shown for Sourcing tab with call tags */
                <button
                  className="inline-flex items-center hover:opacity-90 transition-opacity"
                  style={{
                    padding: 10,
                    gap: 5,
                    background: "#0F47F2",
                    border: "0.5px solid #0F47F2",
                    borderRadius: 5,
                  }}
                  onClick={() => setShowCallModal(true)}
                  disabled={completing}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.33398 1.33337C9.33398 1.33337 10.8007 1.46671 12.6673 3.33337C14.534 5.20004 14.6673 6.66671 14.6673 6.66671"
                      stroke="white"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.4707 3.69043C9.4707 3.69043 10.1307 3.879 11.1206 4.86894C12.1106 5.8589 12.2992 6.51886 12.2992 6.51886"
                      stroke="white"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.69108 3.54407L7.12375 4.31936C7.51422 5.01901 7.35748 5.93684 6.74248 6.55183C6.74248 6.55183 5.9966 7.29783 7.34902 8.65029C8.70102 10.0023 9.44748 9.25683 9.44748 9.25683C10.0625 8.64183 10.9803 8.48509 11.68 8.87556L12.4552 9.30823C13.5117 9.89783 13.6365 11.3794 12.7079 12.3081C12.1499 12.8661 11.4663 13.3003 10.7106 13.3289C9.43855 13.3772 7.27822 13.0552 5.11115 10.8882C2.9441 8.72109 2.62216 6.56077 2.67038 5.28869C2.69903 4.53303 3.13322 3.84945 3.69122 3.29145C4.61986 2.36281 6.10146 2.48759 6.69108 3.54407Z"
                      stroke="white"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: "17px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                    }}
                  >
                    Call Candidate
                  </span>
                </button>
              )}

              {shouldShowMoveToNextRound && (
                /* Move to Next Round Button — shown for Screening & Interview tabs */
                <button
                  className="inline-flex items-center hover:opacity-90 transition-opacity"
                  style={{
                    padding: 10,
                    gap: 5,
                    background: "#0F47F2",
                    border: "0.5px solid #0F47F2",
                    borderRadius: 5,
                  }}
                  onClick={handleMoveToNextRound}
                  disabled={movingNext || completing}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33398 8H12.6673"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.66732 4L12.6673 8L8.66732 12"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: "17px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                    }}
                  >
                    {movingNext ? "Moving..." : "Move to Next Round"}
                  </span>
                </button>
              )}

              {/* Fallback: no special action button — show generic complete */}
              {!shouldShowCallButton && !shouldShowMoveToNextRound && (
                <button
                  className="inline-flex items-center hover:opacity-90 transition-opacity"
                  style={{
                    padding: 10,
                    gap: 5,
                    background: "#0F47F2",
                    border: "0.5px solid #0F47F2",
                    borderRadius: 5,
                  }}
                  onClick={() => handleComplete("Action done")}
                  disabled={completing}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33398 8.66663L6.00065 11.3333L12.6673 4.66663"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: "17px",
                      fontWeight: 400,
                      color: "#FFFFFF",
                    }}
                  >
                    {completing ? "Saving..." : "Mark Done"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Call Candidate Modal ── */}
      <CallCandidateModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        candidate={callCandidateData}
        jobId={currentItem?.job_role_id || undefined}
      />
    </>
  );
};

export default ActionReviewModal;
