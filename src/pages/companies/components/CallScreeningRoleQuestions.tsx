import React from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export interface RoleQuestion {
  id: string | number;
  question: string;
  lookFor?: string | null;
  status?: "pending" | "convinced" | "not_convinced" | "skipped";
  aiScore?: number | null;
  aiAnswerSummary?: string | null;
}

interface CallScreeningRoleQuestionsProps {
  questions: RoleQuestion[];
  followUpSuggestions?: string[];
  stats?: {
    convinced: number;
    notConvinced: number;
    skipped: number;
    totalAnswered: number;
    totalQuestions: number;
  };
  isLoading?: boolean;
}

export default function CallScreeningRoleQuestions({
  questions,
  followUpSuggestions = [],
  stats,
  isLoading = false,
}: CallScreeningRoleQuestionsProps) {
  if (!stats) {
    console.error("Stats prop is required but not provided.");
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm flex items-center justify-center py-12">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#0F47F2] rounded-full" />
        </div>
        <span className="ml-3 text-sm text-[#8E8E93]">
          Loading questions...
        </span>
      </div>
    );
  }

  const completionPercentage = Math.round(
    (stats.totalAnswered / stats.totalQuestions) * 100
  );

  const getQuestionStyles = (question: RoleQuestion) => {
    const isConvinced = question.status === "convinced";

    let barColor = "#10B981";
    let badgeBg = "bg-[#EBFFEE]";
    let badgeText = "text-[#009951]";
    let summaryBg = "bg-[#F5F3FF]";
    let summaryText = "text-[#6B46C1]";

    if (!isConvinced) {
      if ((question.aiScore || 0) < 50) {
        barColor = "#EF4444";
        badgeBg = "bg-[#FEE9E7]";
        badgeText = "text-[#DC2626]";
        summaryBg = "bg-[#FEF2F2]";
        summaryText = "text-[#DC2626]";
      } else {
        barColor = "#F59E0B";
        badgeBg = "bg-[#FFF7D6]";
        badgeText = "text-[#92400E]";
        summaryBg = "bg-[#FFFBF0]";
        summaryText = "text-[#B45309]";
      }
    }

    return {
      isConvinced,
      barColor,
      badgeBg,
      badgeText,
      summaryBg,
      summaryText,
      SummaryIcon: Sparkles,
    };
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0F47F2]" />
          <h3 className="text-xs uppercase font-bold text-[#8E8E93] tracking-wider">
            CALL SCREENING - ROLE QUESTIONS
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F5F9FB] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[11px] font-bold text-[#4B5563]">
              {stats.convinced} Convinced
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F5F9FB] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] font-bold text-[#4B5563]">
              {stats.notConvinced} Not Convinced
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F5F9FB] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#AEAEB2]" />
            <span className="text-[11px] font-bold text-[#4B5563]">
              {stats.skipped} Skipped
            </span>
          </div>
        </div>
      </div>

      {/* Completion Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#8E8E93]">Completion</span>
          <span className="text-xs font-bold text-[#0F47F2]">
            {stats.totalAnswered} / {stats.totalQuestions} answered
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#F3F5F7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F47F2] rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const {
            isConvinced,
            barColor,
            badgeBg,
            badgeText,
            summaryBg,
            summaryText,
            SummaryIcon,
          } = getQuestionStyles(question);

          return (
            <div
              key={question.id}
              className="border border-[#E5E7EB] bg-white rounded-xl p-5 shadow-sm"
            >
              <div className="flex gap-4 mb-4">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-[#EEF1FF] text-[#0F47F2] font-bold text-xs shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-medium text-[#111827] mb-1.5">
                    {question.question}
                  </h4>
                  {question.lookFor && (
                    <p className="text-[11px] text-[#8E8E93]">
                      Look for: {question.lookFor}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Confidence Bar and Pill */}
              {(question.status === "convinced" || question.status === "not_convinced") && (
                <div className="ml-10 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#6B46C1]" />
                      <span className="text-[11px] font-bold text-[#4B5563]">
                        AI Confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.aiScore !== undefined && question.aiScore !== null && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: barColor }}
                        >
                          {question.aiScore}%
                        </span>
                      )}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeBg} ${badgeText}`}
                      >
                        {isConvinced ? (
                          <ThumbsUp className="w-3 h-3" />
                        ) : (
                          <ThumbsDown className="w-3 h-3" />
                        )}
                        {isConvinced ? "Convinced" : "Not Convinced"}
                      </div>
                    </div>
                  </div>
                  {question.aiScore !== undefined && question.aiScore !== null && (
                    <div className="w-full h-1.5 bg-[#F3F5F7] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${question.aiScore}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              {/* AI Answer Summary */}
              {question.aiAnswerSummary && question.status !== "pending" && question.status !== "skipped" && (
                <div
                  className={`ml-10 p-3 rounded-lg flex items-start gap-2 ${summaryBg}`}
                >
                  <SummaryIcon className={`w-4 h-4 mt-0.5 shrink-0 ${summaryText}`} />
                  <p className={`text-xs font-medium leading-relaxed ${summaryText}`}>
                    {question.aiAnswerSummary}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Follow-up Suggestions */}
      {followUpSuggestions.length > 0 && (
        <div className="bg-[#F8F5FF] border border-[#E9D8FD] rounded-xl p-5 shadow-sm mt-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#6B46C1]" />
            <h3 className="text-xs uppercase font-bold text-[#6B46C1] tracking-wider">
              AI FOLLOW-UP SUGGESTIONS FOR NEXT ROUND
            </h3>
          </div>
          <div className="space-y-2">
            {followUpSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex items-start gap-3 border border-[#E9D8FD]"
              >
                <ArrowRight className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-[#4B5563] leading-relaxed">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
