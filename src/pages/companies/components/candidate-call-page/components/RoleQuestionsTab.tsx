import React, { useState, useMemo } from "react";
import { CheckSquare, XSquare, SkipForward, ChevronDown } from "lucide-react";
import type { RoleQuestion } from "../../../../../services/jobPipelineDashboardService";


function parseConceptBullets(concept?: string | null): string[] {
  if (!concept) return [];
  const lines = concept
    .split(/\r?\n|•|\*/)
    .map((s) => s.replace(/^[•\-\*\s]+/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  if (lines.length === 1 && lines[0].includes(",") && lines[0].length < 180) {
    const parts = lines[0].split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }
  return lines;
}

function parseGuidance(guidance?: string | null) {
  const effectiveGuidance =
    guidance ||
    `💡 WHY WE ASK: This tests the candidate's depth of knowledge, problem-solving approach, and practical experience in this area.\n\n🗣️ CLARIFICATION & NUDGES:\n• If they are struggling, say: "Could you walk me through your general thought process or a simple example?"\n• If they get stuck, say: "Think about the primary trade-offs or alternatives for this approach."`;

  const parts = effectiveGuidance.split(/🗣️\s*CLARIFICATION & NUDGES:/i);
  const whyWeAsk = parts[0]?.replace(/💡\s*WHY WE ASK:/i, "").trim();
  const nudges = parts[1]?.trim();

  return { whyWeAsk, nudges };
}

export interface RoleQuestionsTabProps {
  roleQuestions: RoleQuestion[];
  candidateHeadline?: string;
  onEvaluateQuestion: (qId: number, status: RoleQuestion["status"]) => Promise<void> | void;
}

export default function RoleQuestionsTab({
  roleQuestions,
  candidateHeadline = "candidate",
  onEvaluateQuestion,
}: RoleQuestionsTabProps) {
  // Use provided role questions or fallback to realistic default questions matching the design
  const questions = useMemo(() => {
    return roleQuestions && roleQuestions.length > 0 ? roleQuestions : [];
  }, [roleQuestions]);

  // Track local evaluation statuses for instant optimistic UI updates
  const [localStatuses, setLocalStatuses] = useState<Record<number, RoleQuestion["status"]>>({});

  // Active question index: by default only the first question (index 0) is open, rest are closed
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Toggle state for the "Need Help? Show quick scripts and context!" accordion
  const [openGuidanceMap, setOpenGuidanceMap] = useState<Record<number, boolean>>({});

  const toggleGuidance = (qId: number) => {
    setOpenGuidanceMap((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Handle evaluation: update status and automatically advance to the next question
  const handleSelectFeedback = async (
    qId: number,
    idx: number,
    status: RoleQuestion["status"]
  ) => {
    // 1. Optimistic status update
    setLocalStatuses((prev) => ({ ...prev, [qId]: status }));

    // 2. Notify parent component to persist evaluation
    try {
      await onEvaluateQuestion(qId, status);
    } catch (err) {
      console.error("Failed to evaluate role question:", err);
    }

    // 3. Automatically advance to the next question
    if (idx + 1 < questions.length) {
      setActiveIndex(idx + 1);
    } else {
      // If last question was evaluated, check if any earlier question is still unanswered
      const remainingIdx = questions.findIndex(
        (q, i) =>
          i !== idx &&
          (!localStatuses[q.id] || localStatuses[q.id] === "pending") &&
          (!q.status || q.status === "pending")
      );
      if (remainingIdx !== -1) {
        setActiveIndex(remainingIdx);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3.5 max-w-4xl mx-auto pb-12 animate-fadeIn select-text">
      {/* ── Header ── */}
      <div className="pt-1">
        <div className="flex items-baseline gap-1">
          <h3 className="text-[16px] font-semibold text-[#070707] tracking-tight">
            Role questions
          </h3>
          <span className="text-[16px] font-normal text-[#070707]">
            {questions.length}
          </span>
        </div>
        <p className="text-[12px] text-[#6B7280] font-normal mt-0.5">
          Questions come from the JD, gaps in the resume first.
        </p>
        <div className="h-px bg-[#E5E7EB] mt-3.5 mb-4" />
      </div>

      {/* ── Questions List ── */}
      <div className="flex flex-col gap-3">
        {questions.map((q, idx) => {
          const currentStatus = localStatuses[q.id] || q.status || "pending";
          const isActive = idx === activeIndex;
          const isAnswered = currentStatus !== "pending";
          const bullets = parseConceptBullets(q.ideal_answer_concept);
          const { whyWeAsk, nudges } = parseGuidance(q.recruiter_guidance);
          const isGuidanceOpen = !!openGuidanceMap[q.id];

          // ── STATE 1: ACTIVE / OPEN QUESTION CARD ──
          if (isActive) {
            return (
              <div
                key={q.id}
                className="bg-white border-2 border-[#3B82F6] rounded-2xl p-5 sm:p-6 shadow-[0_2px_10px_rgba(59,130,246,0.08)] flex flex-col gap-3.5 transition-all"
              >
                {/* Question Row */}
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <h3 className="text-[15px] font-medium text-[#111827] leading-snug">
                    {q.question_text}
                  </h3>
                </div>

                {/* Concept Bullets Box */}
                {bullets.length > 0 && (
                  <div className="bg-[#F8FAFC] rounded-xl px-4 py-3.5 border border-[#F1F5F9] ml-10">
                    <ul className="space-y-1.5">
                      {bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-baseline gap-2 text-[13px] text-[#475569] leading-relaxed"
                        >
                          <span className="text-[#94A3B8] select-none text-[10px]">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Need Help Accordion */}
                <div className="ml-10">
                  <button
                    type="button"
                    onClick={() => toggleGuidance(q.id)}
                    className="w-full bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl px-4 py-2.5 flex items-center justify-between text-[#2563EB] text-[13px] font-medium hover:bg-[#E0EDFF] transition cursor-pointer select-none"
                  >
                    <span>Need Help? Show quick scripts and context!</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#2563EB] transition-transform duration-200 ${
                        isGuidanceOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isGuidanceOpen && (
                    <div className="mt-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs sm:text-[13px] space-y-3 animate-fadeIn">
                      {whyWeAsk && (
                        <div>
                          <span className="font-bold text-[#1E293B] text-[11px] uppercase tracking-wider block mb-1">
                            💡 Why We Ask This
                          </span>
                          <p className="text-[#475569] leading-relaxed">{whyWeAsk}</p>
                        </div>
                      )}
                      {nudges && (
                        <div className="border-t border-[#E2E8F0] pt-2.5">
                          <span className="font-bold text-[#1E293B] text-[11px] uppercase tracking-wider block mb-1.5">
                            🗣️ Read-Aloud Help Scripts
                          </span>
                          <div className="whitespace-pre-wrap text-[#334155] leading-relaxed bg-white p-3 rounded-lg border border-[#E2E8F0]">
                            {nudges}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-[#F1F5F9] my-0.5 ml-10" />

                {/* Evaluation Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 ml-10 pt-0.5">
                  {/* Convinced Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectFeedback(q.id, idx, "convinced")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-medium border transition-all cursor-pointer active:scale-98 ${
                      currentStatus === "convinced"
                        ? "bg-[#DCFCE7] border-[#22C55E] text-[#16A34A] shadow-xs"
                        : "border-[#22C55E] text-[#16A34A] bg-white hover:bg-[#F0FDF4]"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-[#16A34A]" />
                    <span>Convinced</span>
                  </button>

                  {/* Not convinced Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectFeedback(q.id, idx, "not_convinced")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-medium border transition-all cursor-pointer active:scale-98 ${
                      currentStatus === "not_convinced"
                        ? "bg-[#FEE2E2] border-[#EF4444] text-[#DC2626] shadow-xs"
                        : "border-[#EF4444] text-[#DC2626] bg-white hover:bg-[#FEF2F2]"
                    }`}
                  >
                    <XSquare className="w-4 h-4 text-[#DC2626]" />
                    <span>Not convinced</span>
                  </button>

                  {/* Skipped Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectFeedback(q.id, idx, "skipped")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-medium border transition-all cursor-pointer active:scale-98 ${
                      currentStatus === "skipped"
                        ? "bg-[#FFEDD5] border-[#F97316] text-[#EA580C] shadow-xs"
                        : "border-[#F97316] text-[#EA580C] bg-white hover:bg-[#FFF7ED]"
                    }`}
                  >
                    <SkipForward className="w-4 h-4 text-[#EA580C]" />
                    <span>Skipped</span>
                  </button>
                </div>
              </div>
            );
          }

          // ── STATE 2: ANSWERED & COLLAPSED QUESTION CARD ──
          if (isAnswered) {
            const cardStyle =
              currentStatus === "convinced"
                ? "bg-[#F4FBF7] border-[#86EFAC]"
                : currentStatus === "not_convinced"
                ? "bg-[#FEF2F2] border-[#FECACA]"
                : "bg-[#FFF7ED] border-[#FED7AA]";

            return (
              <div
                key={q.id}
                onClick={() => setActiveIndex(idx)}
                className={`rounded-2xl p-4 sm:p-5 transition-all border cursor-pointer hover:shadow-xs ${cardStyle}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[12px] font-semibold text-[#374151] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px]  text-[#070707] leading-relaxed">
                      {q.question_text}
                    </h3>
                    <div className="mt-2.5 flex items-center gap-3">
                      {currentStatus === "convinced" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-[12px] font-semibold">
                          <CheckSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>Convinced</span>
                        </div>
                      )}
                      {currentStatus === "not_convinced" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-[12px] font-semibold">
                          <XSquare className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>Not convinced</span>
                        </div>
                      )}
                      {currentStatus === "skipped" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] border border-[#FED7AA] text-[#EA580C] text-[12px] font-semibold">
                          <SkipForward className="w-3.5 h-3.5 text-[#EA580C]" />
                          <span>Skipped</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }}
                        className="text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer transition"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // ── STATE 3: COLLAPSED UNANSWERED QUESTION CARD ──
          return (
            <div
              key={q.id}
              onClick={() => setActiveIndex(idx)}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 hover:border-[#CBD5E1] hover:bg-[#F8FAFC]/60 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div className="w-7 h-7 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[12px] font-semibold text-[#6B7280] shrink-0">
                {idx + 1}
              </div>
              <p className="text-[14px] font-normal text-[#111827] leading-snug line-clamp-2">
                {q.question_text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
