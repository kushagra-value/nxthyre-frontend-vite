import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react";
import { debounce } from "lodash";
import { candidateSearchService } from "../../../services/candidateSearchService";

export interface FilterOption {
  value: string;
  label: string;
  logo?: React.ReactNode | string;
  subLabel?: string;
}

export type FilterCategoryOptions = {
  location: FilterOption[];
  clients: FilterOption[];
  experience: FilterOption[];
  jobRole: FilterOption[];
  noticePeriod: FilterOption[];
  dateCreated: FilterOption[];
  source: FilterOption[];
};

export interface FiltersState {
  location: string[];
  clients: string[];
  experience: { min: string; max: string };
  jobRole: string[];
  noticePeriod: { selected: string[]; minDays: string; maxDays: string };
  dateCreated: { type: string; from: string; to: string };
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
  const [locationSuggestions, setLocationSuggestions] = useState<FilterOption[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  // Debounced api fetch for location
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
          const suggestions = await candidateSearchService.getLocationSuggestions(query);
          setLocationSuggestions(suggestions.map((s: string) => ({ value: s, label: s })));
        } catch (error) {
          console.error("Failed to fetch location suggestions", error);
        } finally {
          setIsSearchingLocation(false);
        }
      }, 300),
    []
  );

  // Trigger search on input change
  useEffect(() => {
    if (activeTab === "location") {
      fetchLocationSuggestions(searchQuery);
    } else {
      setLocationSuggestions([]); // Reset when leaving location tab
    }
  }, [searchQuery, activeTab, fetchLocationSuggestions]);
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
    setFilters({
      location: [],
      clients: [],
      experience: { min: "", max: "" },
      jobRole: [],
      noticePeriod: { selected: [], minDays: "", maxDays: "" },
      dateCreated: { type: "", from: "", to: "" },
      source: [],
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // Rendering the right side options based on active tab
  const renderListOptions = () => {
    let currentOptions = optionsData[activeTab] || [];
    let filteredOptions = currentOptions;

    // For location, if we have a search query, use the API suggestions instead of local string match
    if (activeTab === "location" && searchQuery.trim().length >= 2) {
      filteredOptions = locationSuggestions;
    } else {
      // Filter options locally by search query for other tabs, or when query is < 2 chars
      filteredOptions = currentOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const currentListValues = (activeTab === "noticePeriod" ? filters.noticePeriod.selected : filters[activeTab]) as string[];

    // Keep all selected options visible at the top, even if they don't match the search query
    const selectedItems: FilterOption[] = currentListValues.map((val) => {
      const found = currentOptions.find((o) => o.value === val) || filteredOptions.find((o) => o.value === val);
      return found || { value: val, label: val }; // Fallback to raw string
    });

    const nonSelectedOptions = filteredOptions.filter(
      (opt) => !currentListValues.includes(opt.value)
    );

    const displayOptions = [...selectedItems, ...nonSelectedOptions];

    return (
      <div className="flex flex-col gap-3 mt-4 h-[300px] overflow-y-auto custom-scrollbar pr-2 relative">
        {isSearchingLocation && activeTab === "location" && (
          <div className="text-sm text-gray-500 text-center mb-2 animate-pulse">Searching...</div>
        )}
        
        {displayOptions.length > 0 ? (
          displayOptions.map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                className="hidden"
                checked={currentListValues.includes(opt.value)}
                onChange={() => handleToggleOption(activeTab, opt.value)}
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
              {opt.logo && (
                <div className="flex items-center justify-center w-[20px] h-[20px] flex-shrink-0 mt-0.5">
                  {typeof opt.logo === "string" ? (
                    <img src={opt.logo} alt={opt.label} className="w-full h-full object-contain rounded-full" />
                  ) : (
                    opt.logo
                  )}
                </div>
              )}
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
            <h3 className="text-base font-semibold text-[#0F47F2]">
              Experience (in years)
            </h3>
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

    if (activeTab === "noticePeriod") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">
              Notice Period
            </h3>
          </div>
          {renderListOptions()}
          
          <div className="flex items-center gap-3 mt-6">
            <input
              type="text"
              placeholder="Min Days"
              value={filters.noticePeriod.minDays}
              onChange={(e) => setFilters(prev => ({ ...prev, noticePeriod: { ...prev.noticePeriod, minDays: e.target.value } }))}
              className="w-[100px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
            <input
              type="text"
              placeholder="Max Days"
              value={filters.noticePeriod.maxDays}
              onChange={(e) => setFilters(prev => ({ ...prev, noticePeriod: { ...prev.noticePeriod, maxDays: e.target.value } }))}
              className="w-[100px] h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400"
            />
          </div>
        </div>
      );
    }

    if (activeTab === "dateCreated") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">
              Date Created
            </h3>
          </div>
          <div className="flex flex-col gap-5">
            {["Last week", "Last 1 month", "Last 3 months", "Custom"].map(
              (option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors flex-shrink-0 border ${
                      filters.dateCreated.type === option
                        ? "border-[#0F47F2]"
                        : "border-gray-400 group-hover:border-[#0F47F2]"
                    }`}
                  >
                    {filters.dateCreated.type === option && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#0F47F2]" />
                    )}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    name="dateCreatedType"
                    value={option}
                    checked={filters.dateCreated.type === option}
                    onChange={() => setFilters(prev => ({ ...prev, dateCreated: { ...prev.dateCreated, type: option } }))}
                  />
                  <span className={`text-sm select-none ${filters.dateCreated.type === option ? "text-[#0F47F2] font-medium" : "text-gray-600"}`}>
                    {option}
                  </span>
                </label>
              )
            )}
            
            <div className="flex flex-col gap-3 mt-1 pl-7">
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateCreated.from}
                  disabled={filters.dateCreated.type !== "Custom"}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateCreated: { ...prev.dateCreated, from: e.target.value } }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="From"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateCreated.to}
                  disabled={filters.dateCreated.type !== "Custom"}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateCreated: { ...prev.dateCreated, to: e.target.value } }))}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] placeholder:text-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "source") {
      return (
        <div className="flex-1 flex flex-col p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-[#0F47F2]">
              Candidates Sourced
            </h3>
          </div>
          {renderListOptions()}
        </div>
      );
    }

    // Default List rendering (Jobs, Locations, Clients)
    return (
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
            placeholder={`Search ${activeTab === 'jobRole' ? 'by Job Id, Role' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#0F47F2] focus:ring-1 focus:ring-[#0F47F2]/20 transition-all placeholder:text-gray-400"
          />
        </div>

        {renderListOptions()}
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
        <div className="w-[200px] border-r border-gray-100 bg-white flex flex-col">
          {TABS.map((tab) => {
            let count = 0;
            if (tab.key === 'experience') {
              count = (filters.experience.min ? 1 : 0) + (filters.experience.max ? 1 : 0);
            } else if (tab.key === 'noticePeriod') {
              count = filters.noticePeriod.selected.length + (filters.noticePeriod.minDays ? 1 : 0) + (filters.noticePeriod.maxDays ? 1 : 0);
            } else if (tab.key === 'dateCreated') {
              count = filters.dateCreated.type ? 1 : 0;
            } else {
              count = (filters[tab.key] as string[]).length;
            }
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery(""); // Reset search when switching tabs
                }}
                className="flex items-center justify-between px-5 text-sm text-left transition-colors relative bg-white h-12"
              >
                <div className="flex items-center gap-2">
                  <span className={`${isActive ? "text-[#0F47F2] font-medium" : "text-gray-600"}`}>
                    {tab.label}
                  </span>
                  {count > 0 && (
                    <span className="bg-[#f0f2f5] text-[#0F47F2] text-[11px] font-bold px-1.5 py-0 rounded-full min-w-[20px] text-center inline-block">
                      {count}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#0F47F2]" />}
                {/* Underline for active tab correctly placed based on the design */}
                <div className={`absolute bottom-0 left-5 right-5 h-[1px] ${isActive ? "bg-[#0F47F2]" : "bg-gray-100"}`} />
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        {renderContent()}
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
