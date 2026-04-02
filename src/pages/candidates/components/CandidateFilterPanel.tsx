import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  logo?: React.ReactNode | string;
}

export type FilterCategoryOptions = {
  [K in TabKey]: FilterOption[];
};

export interface FiltersState {
  location: string[];
  clients: string[];
  experience: string[];
  jobRole: string[];
  noticePeriod: string[];
  dateCreated: string[];
  source: string[];
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FiltersState) => void;
  initialFilters: FiltersState;
  anchorRef: React.RefObject<HTMLButtonElement>;
  optionsData: FilterCategoryOptions;
}

type TabKey = keyof FiltersState;

const TABS: { key: TabKey; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "clients", label: "Clients" },
  { key: "experience", label: "Experience" },
  { key: "jobRole", label: "Job Role" },
  { key: "noticePeriod", label: "Notice Period" },
  { key: "dateCreated", label: "Date Created" },
  { key: "source", label: "Source" },
];

export default function CandidateFilterPanel({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  anchorRef,
  optionsData,
}: FilterPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("location");
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync state when panel opens to reset to last applied if cancelled
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      setSearchQuery("");
      setActiveTab("location");
    }
  }, [isOpen, initialFilters]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  const handleToggleOption = (tab: TabKey, value: string) => {
    setFilters((prev) => {
      const current = prev[tab];
      const isSelected = current.includes(value);
      if (isSelected) {
        return { ...prev, [tab]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [tab]: [...current, value] };
      }
    });
  };

  const handleReset = () => {
    setFilters({
      location: [],
      clients: [],
      experience: [],
      jobRole: [],
      noticePeriod: [],
      dateCreated: [],
      source: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // Rendering the right side options based on active tab
  const renderOptions = () => {
    const currentOptions = optionsData[activeTab] || [];

    // Filter options by search query
    const filteredOptions = currentOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Keep selected options visible even if they don't match the search query
    const selectedNotMatched = currentOptions.filter(
      (opt) =>
        filters[activeTab].includes(opt.value) &&
        !filteredOptions.some((fo) => fo.value === opt.value)
    );

    const displayOptions = [...selectedNotMatched, ...filteredOptions];

    return (
      <div className="flex flex-col gap-3 mt-4 h-[300px] overflow-y-auto custom-scrollbar pr-2">
        {displayOptions.length > 0 ? (
          displayOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={filters[activeTab].includes(opt.value)}
                onChange={() => handleToggleOption(activeTab, opt.value)}
              />
              <div
                className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                  filters[activeTab].includes(opt.value)
                    ? "bg-[#0F47F2] border-[#0F47F2]"
                    : "bg-white border-gray-300 border group-hover:border-[#0F47F2]"
                }`}
              >
                {filters[activeTab].includes(opt.value) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {opt.logo && (
                <div className="flex items-center justify-center w-[20px] max-h-[20px]">
                  {typeof opt.logo === "string" ? (
                    <img src={opt.logo} alt={opt.label} className="w-full h-full object-contain rounded-full" />
                  ) : (
                    opt.logo
                  )}
                </div>
              )}
              <span className={`text-sm select-none ${filters[activeTab].includes(opt.value) ? "text-[#0F47F2] font-medium" : "text-gray-600"}`}>
                {opt.label}
              </span>
            </label>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center mt-10">No options found.</div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="absolute z-50 bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col w-[600px] overflow-hidden"
      style={{
         top: anchorRef.current ? anchorRef.current.offsetTop + anchorRef.current.offsetHeight + 8 : 0,
         left: anchorRef.current ? anchorRef.current.offsetLeft : 0,
      }}
    >
      <div className="flex h-[400px]">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r border-gray-100 bg-white flex flex-col py-2">
          {TABS.map((tab) => {
            const count = filters[tab.key].length;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery(""); // Reset search when switching tabs
                }}
                className={`flex items-center justify-between px-5 py-3 text-sm text-left transition-colors relative ${
                  isActive ? "bg-white text-[#0F47F2] font-medium" : "text-gray-600 hover:bg-gray-50 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tab.label}
                  {count > 0 && (
                    <span className="bg-[#E6EBFE] text-[#0F47F2] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center inline-block">
                      {count}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#0F47F2]" />}
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#0F47F2]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-[#0F47F2]">
              {TABS.find((t) => t.key === activeTab)?.label}
            </h3>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] focus:ring-1 focus:ring-[#0F47F2]/20 transition-all placeholder:text-gray-400"
            />
          </div>

          {renderOptions()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
        <button
          onClick={handleReset}
          className="text-sm text-[#0F47F2] font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent select-none flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.25 1.75V5.25H8.75M1.75 12.25V8.75H5.25M11.9525 8.16667C11.5975 10.3582 9.69741 11.9583 7.58333 11.9583C5.64654 11.9583 3.99341 10.7417 3.26667 8.98333M2.0475 5.83333C2.4025 3.64183 4.30259 2.04167 6.41667 2.04167C8.35346 2.04167 10.0066 3.25833 10.7333 5.01667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reset
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="text-sm text-white font-medium px-6 py-2 bg-[#0F47F2] hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
