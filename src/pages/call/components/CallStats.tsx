import React from "react";
import { CallStatsData } from "../../../services/callService";

export type { CallStatsData };

interface CallStatsProps {
  stats?: CallStatsData | null;
  isLoading?: boolean;
}

export const CallStats: React.FC<CallStatsProps> = ({ stats, isLoading = false }) => {
  const data: CallStatsData = {
    totalCalls: stats?.totalCalls ?? 0,
    totalCallsSubtext: stats?.totalCallsSubtext || "Per month",
    totalCallsToday: stats?.totalCallsToday ?? 0,
    totalCallsTodaySubtext: stats?.totalCallsTodaySubtext || "vs Target 45",
    followUps: stats?.followUps ?? 0,
    followUpsSubtext: stats?.followUpsSubtext || "Total Calls today",
    shortlisted: stats?.shortlisted ?? 0,
    shortlistedSubtext: stats?.shortlistedSubtext || "Total Calls today",
    avgTime: stats?.avgTime || "0min",
    avgTimeSubtext: stats?.avgTimeSubtext || "Avg Time Taken",
  };

  const statItems = [
    {
      label: "Total Calls",
      value: data.totalCalls,
      subtext: data.totalCallsSubtext,
    },
    {
      label: "Total Calls Today",
      value: data.totalCallsToday,
      subtext: data.totalCallsTodaySubtext,
    },
    {
      label: "Follow Ups",
      value: data.followUps,
      subtext: data.followUpsSubtext,
    },
    {
      label: "Shortlisted",
      value: data.shortlisted,
      subtext: data.shortlistedSubtext,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          style={{ minHeight: "88px" }}
        >
          <span className="text-[12px] font-regular text-[#374151]">
            {item.label}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded my-0.5" />
            ) : (
              <span className="text-[32px] font-regular text-[#000000] leading-none tracking-tight">
                {item.value}
              </span>
            )}
            {item.subtext && (
              <span className="text-[12px] font-regular text-[#9CA3AF] whitespace-nowrap">
                {item.subtext}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CallStats;
