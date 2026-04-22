import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { debounce } from "lodash";
import { candidateService } from "../../../services/candidateService";
import linkedinBotService from "../../../services/linkedinBotService";

export interface FilterOption {
  value: string;
  label: string;
  subLabel?: string;
}

export interface LinkedinBotFiltersState {
  location: string[];
  salaryRange: { min: string; max: string };
  experience: { min: string; max: string };
  designation: string[];
  noticePeriod: { selected: string[]; minDays: string; maxDays: string };
  skills: string[];
}

export const EMPTY_LINKEDIN_BOT_FILTERS: LinkedinBotFiltersState = {
  location: [],
  salaryRange: { min: "", max: "" },
  experience: { min: "", max: "" },
  designation: [],
  noticePeriod: { selected: [], minDays: "", maxDays: "" },
  skills: [],
};

interface LinkedinBotFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: LinkedinBotFiltersState) => void;
  initialFilters: LinkedinBotFiltersState;
  anchorRef: React.RefObject<HTMLButtonElement | HTMLDivElement>;
  jobId: number;
}

type TabKey = keyof LinkedinBotFiltersState;

const TABS: { key: TabKey; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "salaryRange", label: "Salary Range" },
  { key: "experience", label: "Experience" },
  { key: "designation", label: "Designation" },
  { key: "noticePeriod", label: "Notice Period" },
  { key: "skills", label: "Skills" },
];

const NOTICE_PERIOD_OPTIONS = [
  { value: "Immediate", label: "Immediate" },
  { value: "15 days", label: "15 days" },
  { value: "30 days", label: "30 days" },
  { value: "60 days", label: "60 days" },
  { value: "90 days", label: "90 days" },
];

export default function LinkedinBotFilterPanel({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  anchorRef,
  jobId,
}: LinkedinBotFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("location");
  const [filters, setFilters] = useState<LinkedinBotFiltersState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const [locationSuggestions, setLocationSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [designationSuggestions, setDesignationSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingDesignation, setIsSearchingDesignation] = useState(false);

  const [skillsSuggestions, setSkillsSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  // Debounced API fetch for location
  const fetchLocationSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setLocationSuggestions([]);
          setIsSearchingLocation(false);
          return;
        }
        try {
          setIsSearchingLocation(true);
          const suggestions = await candidateService.getCitySuggestions(query);
          setLocationSuggestions(suggestions.map((s: string) => ({ value: s, label: s })));
        } catch (error) {
          console.error("Failed to fetch location suggestions", error);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 300),
    []
  );

  // Debounced API fetch for designation
  const fetchDesignationSuggestions = useMemo(
    () =>
      debounce(async (query: string, jId: number) => {
        try {
          setIsSearchingDesignation(true);
          const suggestions = await linkedinBotService.getDesignationList(jId, query);
          setDesignationSuggestions(suggestions.map((s: string) => ({ value: s, label: s })));
        } catch (error) {
          console.error("Failed to fetch designation suggestions", error);
        } finally {
          setIsSearchingDesignation(false);
        }
      }, 300),
    []
  );

  // Fetch Skills list once when opening the skills tab
  const fetchSkillsList = useMemo(
    () =>
      async (jId: number) => {
        try {
          setIsSearchingSkills(true);
          const suggestions = await linkedinBotService.getSkillsList(jId);
          setSkillsSuggestions(suggestions.map((s: string) => ({ value: s, label: s })));
        } catch (error) {
          console.error("Failed to fetch skills suggestions", error);
        } finally {
          setIsSearchingSkills(false);
        }
      },
    []
  );

  useEffect(() => {
    if (activeTab === "location") {
      fetchLocationSuggestions(searchQuery);
    } else {
      setLocationSuggestions([]);
    }
    
    if (activeTab === "designation" && isOpen) {
      fetchDesignationSuggestions(searchQuery, jobId);
    }
  }, [searchQuery, activeTab, fetchLocationSuggestions, fetchDesignationSuggestions, jobId, isOpen]);

  useEffect(() => {
    if (activeTab === "skills" && isOpen && skillsSuggestions.length === 0) {
      fetchSkillsList(jobId);
    }
  }, [activeTab, isOpen, jobId, fetchSkillsList, skillsSuggestions.length]);


  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      setSearchQuery("");
      setActiveTab("location");
    }
  }, [isOpen, initialFilters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside a toast container
      if ((event.target as HTMLElement).closest('.go3958317564')) {
         return;
      }
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
      if (tab === "noticePeriod") {
        const np = prev.noticePeriod;
        const isSelected = np.selected.includes(value);
        return {
          ...prev,
          noticePeriod: {
            ...np,
            selected: isSelected
              ? np.selected.filter((item) => item !== value)
              : [...np.selected, value],
          },
        };
      }
      const current = prev[tab];
      if (Array.isArray(current)) {
        const isSelected = current.includes(value);
        return {
          ...prev,
          [tab]: isSelected
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      }
      return prev;
    });
  };

  const handleReset = () => {
    setFilters(EMPTY_LINKEDIN_BOT_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getFilterCount = (tab: TabKey) => {
    if (tab === "location") return filters.location.length;
    if (tab === "designation") return filters.designation.length;
    if (tab === "skills") return filters.skills.length;
    if (tab === "experience") return filters.experience.min || filters.experience.max ? 1 : 0;
    if (tab === "salaryRange") return filters.salaryRange.min || filters.salaryRange.max ? 1 : 0;
    if (tab === "noticePeriod") {
      let c = filters.noticePeriod.selected.length;
      if (filters.noticePeriod.minDays || filters.noticePeriod.maxDays) c += 1;
      return c;
    }
    return 0;
  };

  const renderListOptions = (options: FilterOption[], isSearching: boolean, activeListKey: "location" | "designation" | "noticePeriod" | "skills") => {
    const currentListValues = activeListKey === "noticePeriod" 
      ? filters.noticePeriod.selected 
      : activeListKey === "skills" ? filters.skills : activeListKey === "location" ? filters.location : filters.designation;

    // Filter local options if not an API driven list
    const isApiDriven = activeListKey === "location" || activeListKey === "designation";
    let filteredOptions = options;
    if (!isApiDriven) {
      filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    const selectedItems: FilterOption[] = currentListValues.map((val) => {
      const found = filteredOptions.find((o) => o.value === val);
      return found || { value: val, label: val };
    });

    const nonSelectedOptions = filteredOptions.filter(
      (opt) => !currentListValues.includes(opt.value)
    );

    const displayOptions = [...selectedItems, ...nonSelectedOptions];

    return (
      <div className="flex flex-col gap-3 mt-4 h-[300px] overflow-y-auto custom-scrollbar pr-2 relative">
        {isSearching && (
          <div className="text-sm text-gray-500 text-center mb-2 animate-pulse">Searching...</div>
        )}
        
        {displayOptions.length > 0 ? (
          displayOptions.map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                className="hidden"
                checked={currentListValues.includes(opt.value)}
                onChange={() => handleToggleOption(activeListKey as TabKey, opt.value)}
              />
              <div
                className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                  currentListValues.includes(opt.value)
                    ? "bg-[#0F47F2] border-[#0F47F2]"
                    : "bg-white border-gray-300 border group-hover:border-[#0F47F2]"
                }`}
              >
                {currentListValues.includes(opt.value) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm select-none ${currentListValues.includes(opt.value) ? "text-[#0F47F2] font-medium" : "text-gray-600"}`}>
                  {opt.label}
                </span>
                {opt.subLabel && (
                  <span className="text-xs text-gray-400 mt-0.5 font-normal">{opt.subLabel}</span>
                )}
              </div>
            </label>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center mt-10">No options found.</div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "experience") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">Experience (in years)</h3>
          </div>
          <div className="flex flex-col gap-4">
            <select
              value={filters.experience.min}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: { ...prev.experience, min: e.target.value } }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#0F47F2] appearance-none bg-white"
            >
              <option value="" disabled className="text-gray-400">Minimum Experience</option>
              {Array.from({ length: 20 }).map((_, i) => (
                <option key={`min-${i}`} value={i}>{i} Years</option>
              ))}
            </select>
            <select
              value={filters.experience.max}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: { ...prev.experience, max: e.target.value } }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#0F47F2] appearance-none bg-white"
            >
              <option value="" disabled className="text-gray-400">Maximum Experience</option>
              {Array.from({ length: 30 }).map((_, i) => (
                <option key={`max-${i+1}`} value={i+1}>{i+1} Years</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (activeTab === "salaryRange") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">Salary Range (LPA)</h3>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="Minimum CTC"
              value={filters.salaryRange.min}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: { ...prev.salaryRange, min: e.target.value } }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Maximum CTC"
              value={filters.salaryRange.max}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: { ...prev.salaryRange, max: e.target.value } }))}
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
          </div>
        </div>
      );
    }

    if (activeTab === "noticePeriod") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">Notice Period</h3>
          </div>
          {renderListOptions(NOTICE_PERIOD_OPTIONS, false, "noticePeriod")}
          <div className="flex items-center gap-3 mt-6">
            <input
              type="number"
              placeholder="Min Days"
              value={filters.noticePeriod.minDays}
              onChange={(e) => setFilters(prev => ({ ...prev, noticePeriod: { ...prev.noticePeriod, minDays: e.target.value } }))}
              className="w-[100px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Max Days"
              value={filters.noticePeriod.maxDays}
              onChange={(e) => setFilters(prev => ({ ...prev, noticePeriod: { ...prev.noticePeriod, maxDays: e.target.value } }))}
              className="w-[100px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
          </div>
        </div>
      );
    }

    if (activeTab === "skills") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">Skills Requirements</h3>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search local skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] transition-colors placeholder:text-gray-400"
            />
          </div>
          {renderListOptions(skillsSuggestions, isSearchingSkills, "skills")}
        </div>
      );
    }

    const showSearchBar = ["location", "designation"].includes(activeTab);
    const searchPlaceholder = activeTab === "location" ? "Search locations..." : "Search designations...";
    const options = activeTab === "location" ? locationSuggestions : designationSuggestions;
    const isSearching = activeTab === "location" ? isSearchingLocation : isSearchingDesignation;

    return (
      <div className="flex-1 flex flex-col p-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-[#0F47F2]">
            {TABS.find(t => t.key === activeTab)?.label}
          </h3>
        </div>

        {showSearchBar && (
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] transition-colors placeholder:text-gray-400"
            />
          </div>
        )}

        {renderListOptions(options, isSearching, activeTab as "location" | "designation")}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full mt-2 w-[600px] bg-white rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#E5E7EB] z-50 flex flex-col overflow-hidden"
      style={{ right: 0 }}
    >
      <div className="flex h-[450px]">
        {/* Left Sidebar */}
        <div className="w-[200px] bg-[#F9FAFB] border-r border-[#E5E7EB] py-4">
          <div className="flex flex-col">
            {TABS.map((tab) => {
              const count = getFilterCount(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                    activeTab === tab.key
                      ? "text-[#0F47F2] bg-white border-y border-[#E5E7EB] font-medium"
                      : "text-gray-600 hover:bg-gray-100 border-y border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#E7EDFF] text-[#0F47F2] text-[11px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${
                      activeTab === tab.key ? "text-[#0F47F2]" : "hidden"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content */}
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Reset All
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-[#0F47F2] text-white hover:opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
