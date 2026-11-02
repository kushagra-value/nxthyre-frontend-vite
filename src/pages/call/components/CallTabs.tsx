import React from "react";

export type CallTabType = "call" | "history" | "shortlist";

interface CallTabsProps {
  activeTab: CallTabType;
  onTabChange: (tab: CallTabType) => void;
  callCount?: number;
  historyCount?: number;
  shortlistCount?: number;
}

export const CallTabs: React.FC<CallTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { id: CallTabType; label: string }[] = [
    { id: "call", label: "Call" },
    { id: "history", label: "History" },
    { id: "shortlist", label: "Shortlist" },
  ];

  return (
    <div className="w-full bg-white border-b border-[#F0F2F5] px-6 flex items-center gap-8">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`py-3.5 text-sm font-semibold transition-all relative cursor-pointer border-b-2 ${
              isActive
                ? "text-[#0F47F2] border-[#0F47F2]"
                : "text-gray-500 hover:text-gray-800 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default CallTabs;

