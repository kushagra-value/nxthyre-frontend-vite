import React from "react";

export interface CallStatsData {
  totalCalls?: string | number;
  totalCallsSubtext?: string;
  totalCallsToday?: string | number;
  totalCallsTodaySubtext?: string;
  followUps?: string | number;
  followUpsSubtext?: string;
  shortlisted?: string | number;
  shortlistedSubtext?: string;
  avgTime?: string;
  avgTimeSubtext?: string;
}

interface CallStatsProps {
  stats?: CallStatsData;
}

export const CallStats: React.FC<CallStatsProps> = ({ stats }) => {
  const data: CallStatsData = {
    totalCalls: stats?.totalCalls ?? "822",
    totalCallsSubtext: stats?.totalCallsSubtext ?? "Per month",
    totalCallsToday: stats?.totalCallsToday ?? "13",
    totalCallsTodaySubtext: stats?.totalCallsTodaySubtext ?? "vs Target 45",
    followUps: stats?.followUps ?? "822",
    followUpsSubtext: stats?.followUpsSubtext ?? "Total Calls today",
    shortlisted: stats?.shortlisted ?? "822",
    shortlistedSubtext: stats?.shortlistedSubtext ?? "Total Calls today",
    avgTime: stats?.avgTime ?? "5min",
    avgTimeSubtext: stats?.avgTimeSubtext ?? "Avg Time Taken",
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
    {
      label: "Avg Time Taken",
      value: data.avgTime,
      subtext: data.avgTimeSubtext,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <span className="text-[32px] font-regular text-[#000000] leading-none tracking-tight">
              {item.value}
            </span>
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
