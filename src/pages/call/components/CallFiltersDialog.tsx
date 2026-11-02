import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { debounce } from "lodash";
import { callService } from "../../../services/callService";

export interface CallFiltersState {
  location: string[];
  salaryRange: { min: string; max: string };
  experience: { min: string; max: string };
  designation: string[];
  noticePeriod: { selected: string[]; minDays: string; maxDays: string };
  scoreRange: string[];
  attention: string[];
}

export const EMPTY_CALL_FILTERS: CallFiltersState = {
  location: [],
  salaryRange: { min: "", max: "" },
  experience: { min: "", max: "" },
  designation: [],
  noticePeriod: { selected: [], minDays: "", maxDays: "" },
  scoreRange: [],
  attention: [],
};

interface FilterOption {
  value: string;
  label: string;
}

interface CallFiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: CallFiltersState) => void;
  initialFilters: CallFiltersState;
  jobId?: number | null;
}

type TabKey =
  | "location"
  | "salaryRange"
  | "experience"
  | "designation"
  | "noticePeriod"
  | "scoreRange"
  | "attention";

const TABS: { key: TabKey; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "salaryRange", label: "Salary Range" },
  { key: "experience", label: "Experience" },
  { key: "designation", label: "Designation" },
  { key: "noticePeriod", label: "Notice Period" },
  { key: "scoreRange", label: "Resume Score" },
  { key: "attention", label: "Attention" },
];

const SCORE_RANGE_OPTIONS: FilterOption[] = [
  { value: "80-100", label: "80 – 100" },
  { value: "60-79", label: "60 – 79" },
  { value: "40-59", label: "40 – 59" },
  { value: "20-39", label: "20 – 39" },
  { value: "0-19", label: "0 – 19" },
];

const NOTICE_PERIOD_OPTIONS: FilterOption[] = [
  { value: "Immediate", label: "Immediate" },
  { value: "15 days", label: "15 days" },
  { value: "30 days", label: "30 days" },
  { value: "45 days", label: "45 days" },
  { value: "60 days", label: "60 days" },
  { value: "90 days", label: "90 days" },
];

const ATTENTION_OPTIONS: FilterOption[] = [
  { value: "overdue", label: "Overdue" },
  { value: "follow_up", label: "Follow Up" },
  { value: "no_response", label: "No Response" },
  { value: "interview_pending", label: "Interview Pending" },
  { value: "feedback_pending", label: "Feedback Pending" },
];

export const CallFiltersDialog: React.FC<CallFiltersDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
  jobId,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("location");
  const [filters, setFilters] = useState<CallFiltersState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");

  const [locationSuggestions, setLocationSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [designationSuggestions, setDesignationSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingDesignation, setIsSearchingDesignation] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Sync initial filters
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      setSearchQuery("");
      setActiveTab("location");
    }
  }, [isOpen, initialFilters]);

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
          const suggestions = await callService.getCitySuggestions(query);
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
          const suggestions = await callService.getDesignationSuggestions(jId, query);
          setDesignationSuggestions(suggestions.map((s: string) => ({ value: s, label: s })));
        } catch (error) {
          console.error("Failed to fetch designation suggestions", error);
        } finally {
          setIsSearchingDesignation(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (activeTab === "location") {
      fetchLocationSuggestions(searchQuery);
    } else {
      setLocationSuggestions([]);
    }

    if (activeTab === "designation" && jobId) {
      fetchDesignationSuggestions(searchQuery, jobId);
    }
  }, [searchQuery, activeTab, fetchLocationSuggestions, fetchDesignationSuggestions, jobId]);

  const handleToggleOption = (
    tab:
      | "location"
      | "designation"
      | "noticePeriod"
      | "scoreRange"
      | "attention",
    value: string
  ) => {
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
      const current = prev[tab] || [];
      const isSelected = current.includes(value);
      return {
        ...prev,
        [tab]: isSelected
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleReset = () => {
    setFilters(EMPTY_CALL_FILTERS);
    setSearchQuery("");
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  const renderListOptions = (
    options: FilterOption[],
    isSearching: boolean,
    activeListKey:
      | "location"
      | "designation"
      | "noticePeriod"
      | "scoreRange"
      | "attention"
  ) => {
    const currentListValues =
      activeListKey === "noticePeriod"
        ? filters.noticePeriod.selected
        : activeListKey === "attention"
        ? filters.attention
        : activeListKey === "scoreRange"
        ? filters.scoreRange
        : activeListKey === "location"
        ? filters.location
        : filters.designation;

    const isApiDriven = activeListKey === "location" || activeListKey === "designation";
    let filteredOptions = options;
    if (!isApiDriven && searchQuery.trim()) {
      filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
      <div className="flex flex-col gap-3 mt-4 h-[240px] overflow-y-auto custom-scrollbar pr-2 relative">
        {isSearching && (
          <div className="text-xs text-gray-500 text-center mb-2 animate-pulse">
            Searching...
          </div>
        )}

        {displayOptions.length > 0 ? (
          displayOptions.map((opt) => {
            const isChecked = currentListValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group py-1"
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={() => handleToggleOption(activeListKey, opt.value)}
                />
                <div
                  className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors flex-shrink-0 ${
                    isChecked
                      ? "bg-[#0F47F2] border-[#0F47F2]"
                      : "bg-white border-gray-300 border group-hover:border-[#0F47F2]"
                  }`}
                >
                  {isChecked && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm select-none ${
                    isChecked ? "text-[#0F47F2] font-medium" : "text-gray-600"
                  }`}
                >
                  {opt.label}
                </span>
              </label>
            );
          })
        ) : (
          <div className="text-sm text-gray-400 text-center my-auto flex items-center justify-center h-full">
            No options found.
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "experience") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h3 className="text-base font-semibold text-[#0F47F2] mb-6">
            Experience (in years)
          </h3>
          <div className="flex flex-col gap-4">
            <select
              value={filters.experience.min}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  experience: { ...prev.experience, min: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#0F47F2] appearance-none bg-white"
            >
              <option value="">Minimum Experience</option>
              {Array.from({ length: 20 }).map((_, i) => (
                <option key={`min-${i}`} value={i}>
                  {i} Years
                </option>
              ))}
            </select>
            <select
              value={filters.experience.max}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  experience: { ...prev.experience, max: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:border-[#0F47F2] appearance-none bg-white"
            >
              <option value="">Maximum Experience</option>
              {Array.from({ length: 30 }).map((_, i) => (
                <option key={`max-${i + 1}`} value={i + 1}>
                  {i + 1} Years
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (activeTab === "salaryRange") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h3 className="text-base font-semibold text-[#0F47F2] mb-6">
            Salary Range (LPA)
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="number"
              placeholder="Minimum CTC"
              value={filters.salaryRange.min}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, min: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Maximum CTC"
              value={filters.salaryRange.max}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, max: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
          </div>
        </div>
      );
    }

    if (activeTab === "noticePeriod") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h3 className="text-base font-semibold text-[#0F47F2] mb-4">
            Notice Period
          </h3>
          {renderListOptions(NOTICE_PERIOD_OPTIONS, false, "noticePeriod")}
          <div className="flex items-center gap-3 mt-4 pt-2 border-t border-gray-100">
            <input
              type="number"
              placeholder="Min Days"
              value={filters.noticePeriod.minDays}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  noticePeriod: { ...prev.noticePeriod, minDays: e.target.value },
                }))
              }
              className="w-[110px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Max Days"
              value={filters.noticePeriod.maxDays}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  noticePeriod: { ...prev.noticePeriod, maxDays: e.target.value },
                }))
              }
              className="w-[110px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
          </div>
        </div>
      );
    }

    if (activeTab === "scoreRange") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h3 className="text-base font-semibold text-[#0F47F2] mb-4">
            Resume Score Range
          </h3>
          {renderListOptions(SCORE_RANGE_OPTIONS, false, "scoreRange")}
        </div>
      );
    }

    if (activeTab === "attention") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <h3 className="text-base font-semibold text-[#0F47F2] mb-4">
            Attention
          </h3>
          {renderListOptions(ATTENTION_OPTIONS, false, "attention")}
        </div>
      );
    }

    const showSearchBar = ["location", "designation"].includes(activeTab);
    const searchPlaceholder =
      activeTab === "location" ? "Search locations..." : "Search designations...";
    const options =
      activeTab === "location" ? locationSuggestions : designationSuggestions;
    const isSearching =
      activeTab === "location" ? isSearchingLocation : isSearchingDesignation;

    return (
      <div className="flex-1 flex flex-col p-6 bg-white">
        <h3 className="text-base font-semibold text-[#0F47F2] mb-4">
          {TABS.find((t) => t.key === activeTab)?.label}
        </h3>

        {showSearchBar && (
          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] transition-colors placeholder:text-gray-400"
            />
          </div>
        )}

        {renderListOptions(
          options,
          isSearching,
          activeTab as "location" | "designation"
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden w-full max-w-2xl max-h-[90vh] animate-in zoom-in-95 duration-150"
        style={{ height: "480px" }}
      >
        {/* Main Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-56 border-r border-gray-100 py-4 flex flex-col shrink-0 overflow-y-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearchQuery("");
                  }}
                  className={`flex items-center justify-between px-5 py-3 text-sm transition-colors text-left cursor-pointer ${
                    isActive
                      ? "text-[#0F47F2] font-medium bg-blue-50/40"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#0F47F2]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            Reset All
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 text-sm font-medium text-white bg-[#0F47F2] hover:bg-[#0c39c2] rounded-lg shadow-sm transition cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallFiltersDialog;
